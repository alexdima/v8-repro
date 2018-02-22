/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "path", "crypto", "vs/base/node/pfs", "vs/base/common/uri", "vs/base/common/async", "vs/workbench/services/backup/common/backup", "vs/platform/files/common/files", "vs/base/common/winjs.base", "vs/base/node/stream", "vs/editor/common/model/textModel"], function (require, exports, path, crypto, pfs, uri_1, async_1, backup_1, files_1, winjs_base_1, stream_1, textModel_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var BackupSnapshot = /** @class */ (function () {
        function BackupSnapshot(snapshot, preamble) {
            this.snapshot = snapshot;
            this.preamble = preamble;
        }
        BackupSnapshot.prototype.read = function () {
            var value = this.snapshot.read();
            if (!this.preambleHandled) {
                this.preambleHandled = true;
                if (typeof value === 'string') {
                    value = this.preamble + value;
                }
                else {
                    value = this.preamble;
                }
            }
            return value;
        };
        return BackupSnapshot;
    }());
    exports.BackupSnapshot = BackupSnapshot;
    var BackupFilesModel = /** @class */ (function () {
        function BackupFilesModel() {
            this.cache = Object.create(null);
        }
        BackupFilesModel.prototype.resolve = function (backupRoot) {
            var _this = this;
            return pfs.readDirsInDir(backupRoot).then(function (backupSchemas) {
                // For all supported schemas
                return winjs_base_1.TPromise.join(backupSchemas.map(function (backupSchema) {
                    // Read backup directory for backups
                    var backupSchemaPath = path.join(backupRoot, backupSchema);
                    return pfs.readdir(backupSchemaPath).then(function (backupHashes) {
                        // Remember known backups in our caches
                        backupHashes.forEach(function (backupHash) {
                            var backupResource = uri_1.default.file(path.join(backupSchemaPath, backupHash));
                            _this.add(backupResource);
                        });
                    });
                }));
            }).then(function () { return _this; }, function (error) { return _this; });
        };
        BackupFilesModel.prototype.add = function (resource, versionId) {
            if (versionId === void 0) { versionId = 0; }
            this.cache[resource.toString()] = versionId;
        };
        BackupFilesModel.prototype.count = function () {
            return Object.keys(this.cache).length;
        };
        BackupFilesModel.prototype.has = function (resource, versionId) {
            var cachedVersionId = this.cache[resource.toString()];
            if (typeof cachedVersionId !== 'number') {
                return false; // unknown resource
            }
            if (typeof versionId === 'number') {
                return versionId === cachedVersionId; // if we are asked with a specific version ID, make sure to test for it
            }
            return true;
        };
        BackupFilesModel.prototype.get = function () {
            return Object.keys(this.cache).map(function (k) { return uri_1.default.parse(k); });
        };
        BackupFilesModel.prototype.remove = function (resource) {
            delete this.cache[resource.toString()];
        };
        BackupFilesModel.prototype.clear = function () {
            this.cache = Object.create(null);
        };
        return BackupFilesModel;
    }());
    exports.BackupFilesModel = BackupFilesModel;
    var BackupFileService = /** @class */ (function () {
        function BackupFileService(backupWorkspacePath, fileService) {
            this.fileService = fileService;
            this.isShuttingDown = false;
            this.ioOperationQueues = new async_1.ResourceQueue();
            this.initialize(backupWorkspacePath);
        }
        BackupFileService.prototype.initialize = function (backupWorkspacePath) {
            this.backupWorkspacePath = backupWorkspacePath;
            this.ready = this.init();
        };
        Object.defineProperty(BackupFileService.prototype, "backupEnabled", {
            get: function () {
                return !!this.backupWorkspacePath; // Hot exit requires a backup path
            },
            enumerable: true,
            configurable: true
        });
        BackupFileService.prototype.init = function () {
            var model = new BackupFilesModel();
            if (!this.backupEnabled) {
                return winjs_base_1.TPromise.as(model);
            }
            return model.resolve(this.backupWorkspacePath);
        };
        BackupFileService.prototype.hasBackups = function () {
            return this.ready.then(function (model) {
                return model.count() > 0;
            });
        };
        BackupFileService.prototype.loadBackupResource = function (resource) {
            var _this = this;
            return this.ready.then(function (model) {
                var backupResource = _this.toBackupResource(resource);
                if (!backupResource) {
                    return void 0;
                }
                // Return directly if we have a known backup with that resource
                if (model.has(backupResource)) {
                    return backupResource;
                }
                return void 0;
            });
        };
        BackupFileService.prototype.backupResource = function (resource, content, versionId) {
            var _this = this;
            if (this.isShuttingDown) {
                return winjs_base_1.TPromise.as(void 0);
            }
            return this.ready.then(function (model) {
                var backupResource = _this.toBackupResource(resource);
                if (!backupResource) {
                    return void 0;
                }
                if (model.has(backupResource, versionId)) {
                    return void 0; // return early if backup version id matches requested one
                }
                return _this.ioOperationQueues.queueFor(backupResource).queue(function () {
                    var preamble = "" + resource.toString() + BackupFileService.META_MARKER;
                    // Update content with value
                    return _this.fileService.updateContent(backupResource, new BackupSnapshot(content, preamble), backup_1.BACKUP_FILE_UPDATE_OPTIONS).then(function () { return model.add(backupResource, versionId); });
                });
            });
        };
        BackupFileService.prototype.discardResourceBackup = function (resource) {
            var _this = this;
            return this.ready.then(function (model) {
                var backupResource = _this.toBackupResource(resource);
                if (!backupResource) {
                    return void 0;
                }
                return _this.ioOperationQueues.queueFor(backupResource).queue(function () {
                    return pfs.del(backupResource.fsPath).then(function () { return model.remove(backupResource); });
                });
            });
        };
        BackupFileService.prototype.discardAllWorkspaceBackups = function () {
            var _this = this;
            this.isShuttingDown = true;
            return this.ready.then(function (model) {
                if (!_this.backupEnabled) {
                    return void 0;
                }
                return pfs.del(_this.backupWorkspacePath).then(function () { return model.clear(); });
            });
        };
        BackupFileService.prototype.getWorkspaceFileBackups = function () {
            return this.ready.then(function (model) {
                var readPromises = [];
                model.get().forEach(function (fileBackup) {
                    readPromises.push(stream_1.readToMatchingString(fileBackup.fsPath, BackupFileService.META_MARKER, 2000, 10000)
                        .then(uri_1.default.parse));
                });
                return winjs_base_1.TPromise.join(readPromises);
            });
        };
        BackupFileService.prototype.resolveBackupContent = function (backup) {
            return this.fileService.resolveStreamContent(backup, backup_1.BACKUP_FILE_RESOLVE_OPTIONS).then(function (content) {
                // Add a filter method to filter out everything until the meta marker
                var metaFound = false;
                var metaPreambleFilter = function (chunk) {
                    if (!metaFound && chunk) {
                        var metaIndex = chunk.indexOf(BackupFileService.META_MARKER);
                        if (metaIndex === -1) {
                            return ''; // meta not yet found, return empty string
                        }
                        metaFound = true;
                        return chunk.substr(metaIndex + 1); // meta found, return everything after
                    }
                    return chunk;
                };
                return textModel_1.createTextBufferFactoryFromStream(content.value, metaPreambleFilter);
            });
        };
        BackupFileService.prototype.toBackupResource = function (resource) {
            if (!this.backupEnabled) {
                return null;
            }
            return uri_1.default.file(path.join(this.backupWorkspacePath, resource.scheme, this.hashPath(resource)));
        };
        BackupFileService.prototype.hashPath = function (resource) {
            return crypto.createHash('md5').update(resource.fsPath).digest('hex');
        };
        BackupFileService.META_MARKER = '\n';
        BackupFileService = __decorate([
            __param(1, files_1.IFileService)
        ], BackupFileService);
        return BackupFileService;
    }());
    exports.BackupFileService = BackupFileService;
});
