var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/services/files/electron-browser/fileService", "vs/platform/files/common/files", "vs/base/common/winjs.base", "path", "vs/base/common/arrays", "vs/base/common/network", "vs/platform/progress/common/progress", "vs/base/node/encoding", "vs/base/common/map", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/platform/environment/common/environment", "vs/platform/lifecycle/common/lifecycle", "vs/platform/message/common/message", "vs/platform/storage/common/storage", "vs/editor/common/services/resourceConfiguration", "vs/platform/extensions/common/extensions", "vs/base/node/mime", "vs/base/common/mime", "vs/nls"], function (require, exports, fileService_1, files_1, winjs_base_1, path_1, arrays_1, network_1, progress_1, encoding_1, map_1, configuration_1, workspace_1, environment_1, lifecycle_1, message_1, storage_1, resourceConfiguration_1, extensions_1, mime_1, mime_2, nls_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function toIFileStat(provider, tuple, recurse) {
        var resource = tuple[0], stat = tuple[1];
        var fileStat = {
            isDirectory: false,
            resource: resource,
            name: path_1.basename(resource.path),
            mtime: stat.mtime,
            size: stat.size,
            etag: stat.mtime.toString(29) + stat.size.toString(31),
        };
        if (stat.type === files_1.FileType.Dir) {
            fileStat.isDirectory = true;
            if (recurse && recurse([resource, stat])) {
                // dir -> resolve
                return provider.readdir(resource).then(function (entries) {
                    fileStat.isDirectory = true;
                    // resolve children if requested
                    return winjs_base_1.TPromise.join(entries.map(function (stat) { return toIFileStat(provider, stat, recurse); })).then(function (children) {
                        fileStat.children = children;
                        return fileStat;
                    });
                });
            }
        }
        // file or (un-resolved) dir
        return winjs_base_1.TPromise.as(fileStat);
    }
    function toDeepIFileStat(provider, tuple, to) {
        var trie = map_1.TernarySearchTree.forPaths();
        trie.set(tuple[0].toString(), true);
        if (!arrays_1.isFalsyOrEmpty(to)) {
            to.forEach(function (uri) { return trie.set(uri.toString(), true); });
        }
        return toIFileStat(provider, tuple, function (candidate) {
            return Boolean(trie.findSuperstr(candidate[0].toString()) || trie.get(candidate[0].toString()));
        });
    }
    exports.toDeepIFileStat = toDeepIFileStat;
    var RemoteFileService = /** @class */ (function (_super) {
        __extends(RemoteFileService, _super);
        function RemoteFileService(_extensionService, _storageService, configurationService, contextService, environmentService, lifecycleService, messageService, textResourceConfigurationService) {
            var _this = _super.call(this, configurationService, contextService, environmentService, lifecycleService, messageService, _storageService, textResourceConfigurationService) || this;
            _this._extensionService = _extensionService;
            _this._storageService = _storageService;
            _this._provider = new Map();
            _this._supportedSchemes = JSON.parse(_this._storageService.get('remote_schemes', undefined, '[]'));
            return _this;
        }
        RemoteFileService.prototype.registerProvider = function (authority, provider) {
            var _this = this;
            if (this._provider.has(authority)) {
                throw new Error();
            }
            this._supportedSchemes.push(authority);
            this._storageService.store('remote_schemes', JSON.stringify(arrays_1.distinct(this._supportedSchemes)));
            this._provider.set(authority, provider);
            var reg = provider.onDidChange(function (changes) {
                // forward change events
                _this._onFileChanges.fire(new files_1.FileChangesEvent(changes));
            });
            return {
                dispose: function () {
                    _this._provider.delete(authority);
                    reg.dispose();
                }
            };
        };
        RemoteFileService.prototype.canHandleResource = function (resource) {
            return resource.scheme === network_1.Schemas.file
                || this._provider.has(resource.scheme)
                // TODO@remote
                || this._supportedSchemes.indexOf(resource.scheme) >= 0;
        };
        // --- stat
        RemoteFileService.prototype._withProvider = function (resource) {
            var _this = this;
            return this._extensionService.activateByEvent('onFileSystemAccess:' + resource.scheme).then(function () {
                var provider = _this._provider.get(resource.scheme);
                if (!provider) {
                    var err = new Error();
                    err.name = 'ENOPRO';
                    err.message = "no provider for " + resource.toString();
                    throw err;
                }
                return provider;
            });
        };
        RemoteFileService.prototype.existsFile = function (resource) {
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.existsFile.call(this, resource);
            }
            else {
                return this.resolveFile(resource).then(function (data) { return true; }, function (err) { return false; });
            }
        };
        RemoteFileService.prototype.resolveFile = function (resource, options) {
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.resolveFile.call(this, resource, options);
            }
            else {
                return this._doResolveFiles([{ resource: resource, options: options }]).then(function (data) {
                    if (data.length !== 1 || !data[0].success) {
                        throw new Error("ENOENT, " + resource);
                    }
                    else {
                        return data[0].stat;
                    }
                });
            }
        };
        RemoteFileService.prototype.resolveFiles = function (toResolve) {
            // soft-groupBy, keep order, don't rearrange/merge groups
            var groups = [];
            var group;
            for (var _i = 0, toResolve_1 = toResolve; _i < toResolve_1.length; _i++) {
                var request = toResolve_1[_i];
                if (!group || group[0].resource.scheme !== request.resource.scheme) {
                    group = [];
                    groups.push(group);
                }
                group.push(request);
            }
            var promises = [];
            for (var _a = 0, groups_1 = groups; _a < groups_1.length; _a++) {
                var group_1 = groups_1[_a];
                if (group_1[0].resource.scheme === network_1.Schemas.file) {
                    promises.push(_super.prototype.resolveFiles.call(this, group_1));
                }
                else {
                    promises.push(this._doResolveFiles(group_1));
                }
            }
            return winjs_base_1.TPromise.join(promises).then(function (data) {
                return [].concat.apply([], data);
            });
        };
        RemoteFileService.prototype._doResolveFiles = function (toResolve) {
            return this._withProvider(toResolve[0].resource).then(function (provider) {
                var result = [];
                var promises = toResolve.map(function (item, idx) {
                    return provider.stat(item.resource).then(function (stat) {
                        return toDeepIFileStat(provider, [item.resource, stat], item.options && item.options.resolveTo).then(function (fileStat) {
                            result[idx] = { stat: fileStat, success: true };
                        });
                    }, function (err) {
                        result[idx] = { stat: undefined, success: false };
                    });
                });
                return winjs_base_1.TPromise.join(promises).then(function () { return result; });
            });
        };
        // --- resolve
        RemoteFileService.prototype.resolveContent = function (resource, options) {
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.resolveContent.call(this, resource, options);
            }
            else {
                return this._doResolveContent(resource, options).then(RemoteFileService._asContent);
            }
        };
        RemoteFileService.prototype.resolveStreamContent = function (resource, options) {
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.resolveStreamContent.call(this, resource, options);
            }
            else {
                return this._doResolveContent(resource, options);
            }
        };
        RemoteFileService.prototype._doResolveContent = function (resource, options) {
            var _this = this;
            if (options === void 0) { options = Object.create(null); }
            return this._withProvider(resource).then(function (provider) {
                return _this.resolveFile(resource).then(function (fileStat) {
                    if (fileStat.isDirectory) {
                        // todo@joh cannot copy a folder
                        // https://github.com/Microsoft/vscode/issues/41547
                        throw new files_1.FileOperationError(nls_1.localize('fileIsDirectoryError', "File is directory"), files_1.FileOperationResult.FILE_IS_DIRECTORY, options);
                    }
                    if (fileStat.etag === options.etag) {
                        throw new files_1.FileOperationError(nls_1.localize('fileNotModifiedError', "File not modified since"), files_1.FileOperationResult.FILE_NOT_MODIFIED_SINCE, options);
                    }
                    var guessEncoding = options.autoGuessEncoding;
                    var count = mime_1.maxBufferLen(options);
                    var chunks = [];
                    return provider.read(resource, 0, count, new progress_1.Progress(function (chunk) { return chunks.push(chunk); })).then(function (bytesRead) {
                        // send to bla
                        return mime_1.detectMimeAndEncodingFromBuffer({ bytesRead: bytesRead, buffer: Buffer.concat(chunks) }, guessEncoding);
                    }).then(function (detected) {
                        if (options.acceptTextOnly && detected.mimes.indexOf(mime_2.MIME_BINARY) >= 0) {
                            return winjs_base_1.TPromise.wrapError(new files_1.FileOperationError(nls_1.localize('fileBinaryError', "File seems to be binary and cannot be opened as text"), files_1.FileOperationResult.FILE_IS_BINARY, options));
                        }
                        var preferredEncoding;
                        if (options && options.encoding) {
                            if (detected.encoding === encoding_1.UTF8 && options.encoding === encoding_1.UTF8) {
                                preferredEncoding = encoding_1.UTF8_with_bom; // indicate the file has BOM if we are to resolve with UTF 8
                            }
                            else {
                                preferredEncoding = options.encoding; // give passed in encoding highest priority
                            }
                        }
                        else if (detected.encoding) {
                            if (detected.encoding === encoding_1.UTF8) {
                                preferredEncoding = encoding_1.UTF8_with_bom; // if we detected UTF-8, it can only be because of a BOM
                            }
                            else {
                                preferredEncoding = detected.encoding;
                            }
                            // todo@remote - encoding logic should not be kept
                            // hostage inside the node file service
                            // } else if (super.configuredEncoding(resource) === UTF8_with_bom) {
                        }
                        else {
                            preferredEncoding = encoding_1.UTF8; // if we did not detect UTF 8 BOM before, this can only be UTF 8 then
                        }
                        // const encoding = this.getEncoding(resource);
                        var stream = encoding_1.decodeStream(preferredEncoding);
                        // start with what we have already read
                        // and have a new stream to read the rest
                        var offset = 0;
                        for (var _i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
                            var chunk = chunks_1[_i];
                            stream.write(chunk);
                            offset += chunk.length;
                        }
                        if (offset < count) {
                            // we didn't read enough the first time which means
                            // that we are done
                            stream.end();
                        }
                        else {
                            // there is more to read
                            provider.read(resource, offset, -1, new progress_1.Progress(function (chunk) { return stream.write(chunk); })).then(function () {
                                stream.end();
                            }, function (err) {
                                stream.emit('error', err);
                                stream.end();
                            });
                        }
                        return {
                            encoding: preferredEncoding,
                            value: stream,
                            resource: fileStat.resource,
                            name: fileStat.name,
                            etag: fileStat.etag,
                            mtime: fileStat.mtime,
                        };
                    });
                });
            });
        };
        // --- saving
        RemoteFileService.prototype.createFile = function (resource, content, options) {
            var _this = this;
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.createFile.call(this, resource, content, options);
            }
            else {
                return this._withProvider(resource).then(function (provider) {
                    var prepare = options && !options.overwrite
                        ? _this.existsFile(resource)
                        : winjs_base_1.TPromise.as(false);
                    return prepare.then(function (exists) {
                        if (exists && options && !options.overwrite) {
                            return winjs_base_1.TPromise.wrapError(new files_1.FileOperationError('EEXIST', files_1.FileOperationResult.FILE_MODIFIED_SINCE, options));
                        }
                        return _this._doUpdateContent(provider, resource, content || '', {});
                    }).then(function (fileStat) {
                        _this._onAfterOperation.fire(new files_1.FileOperationEvent(resource, files_1.FileOperation.CREATE, fileStat));
                        return fileStat;
                    });
                });
            }
        };
        RemoteFileService.prototype.updateContent = function (resource, value, options) {
            var _this = this;
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.updateContent.call(this, resource, value, options);
            }
            else {
                return this._withProvider(resource).then(function (provider) {
                    return _this._doUpdateContent(provider, resource, value, options || {});
                });
            }
        };
        RemoteFileService.prototype._doUpdateContent = function (provider, resource, content, options) {
            var _this = this;
            var encoding = this.getEncoding(resource, options.encoding);
            // TODO@Joh support streaming API for remote file system writes
            return provider.write(resource, encoding_1.encode(typeof content === 'string' ? content : files_1.snapshotToString(content), encoding)).then(function () {
                return _this.resolveFile(resource);
            });
        };
        RemoteFileService._asContent = function (content) {
            return new winjs_base_1.TPromise(function (resolve, reject) {
                var result = {
                    value: '',
                    encoding: content.encoding,
                    etag: content.etag,
                    mtime: content.mtime,
                    name: content.name,
                    resource: content.resource
                };
                content.value.on('data', function (chunk) { return result.value += chunk; });
                content.value.on('error', reject);
                content.value.on('end', function () { return resolve(result); });
            });
        };
        // --- delete
        RemoteFileService.prototype.del = function (resource, useTrash) {
            var _this = this;
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.del.call(this, resource, useTrash);
            }
            else {
                return this._withProvider(resource).then(function (provider) {
                    return provider.stat(resource).then(function (stat) {
                        return stat.type === files_1.FileType.Dir ? provider.rmdir(resource) : provider.unlink(resource);
                    }).then(function () {
                        _this._onAfterOperation.fire(new files_1.FileOperationEvent(resource, files_1.FileOperation.DELETE));
                    });
                });
            }
        };
        RemoteFileService.prototype.createFolder = function (resource) {
            var _this = this;
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.createFolder.call(this, resource);
            }
            else {
                return this._withProvider(resource).then(function (provider) {
                    return provider.mkdir(resource).then(function (stat) {
                        return toIFileStat(provider, [resource, stat]);
                    });
                }).then(function (fileStat) {
                    _this._onAfterOperation.fire(new files_1.FileOperationEvent(resource, files_1.FileOperation.CREATE, fileStat));
                    return fileStat;
                });
            }
        };
        RemoteFileService.prototype.rename = function (resource, newName) {
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.rename.call(this, resource, newName);
            }
            else {
                var target = resource.with({ path: path_1.join(resource.path, '..', newName) });
                return this._doMoveWithInScheme(resource, target, false);
            }
        };
        RemoteFileService.prototype.moveFile = function (source, target, overwrite) {
            if (source.scheme !== target.scheme) {
                return this._doMoveAcrossScheme(source, target);
            }
            else if (source.scheme === network_1.Schemas.file) {
                return _super.prototype.moveFile.call(this, source, target, overwrite);
            }
            else {
                return this._doMoveWithInScheme(source, target, overwrite);
            }
        };
        RemoteFileService.prototype._doMoveWithInScheme = function (source, target, overwrite) {
            var _this = this;
            var prepare = overwrite
                ? this.del(target).then(undefined, function (err) { })
                : winjs_base_1.TPromise.as(null);
            return prepare.then(function () { return _this._withProvider(source); }).then(function (provider) {
                return provider.move(source, target).then(function (stat) {
                    return toIFileStat(provider, [target, stat]);
                }).then(function (fileStat) {
                    _this._onAfterOperation.fire(new files_1.FileOperationEvent(source, files_1.FileOperation.MOVE, fileStat));
                    return fileStat;
                });
            });
        };
        RemoteFileService.prototype._doMoveAcrossScheme = function (source, target, overwrite) {
            var _this = this;
            return this.copyFile(source, target, overwrite).then(function () {
                return _this.del(source);
            }).then(function () {
                return _this.resolveFile(target);
            }).then(function (fileStat) {
                _this._onAfterOperation.fire(new files_1.FileOperationEvent(source, files_1.FileOperation.MOVE, fileStat));
                return fileStat;
            });
        };
        RemoteFileService.prototype.importFile = function (source, targetFolder) {
            if (source.scheme === targetFolder.scheme && source.scheme === network_1.Schemas.file) {
                return _super.prototype.importFile.call(this, source, targetFolder);
            }
            else {
                var target = targetFolder.with({ path: path_1.join(targetFolder.path, path_1.basename(source.path)) });
                return this.copyFile(source, target, false).then(function (stat) { return ({ stat: stat, isNew: false }); });
            }
        };
        RemoteFileService.prototype.copyFile = function (source, target, overwrite) {
            var _this = this;
            if (source.scheme === target.scheme && source.scheme === network_1.Schemas.file) {
                return _super.prototype.copyFile.call(this, source, target, overwrite);
            }
            var prepare = overwrite
                ? this.del(target).then(undefined, function (err) { })
                : winjs_base_1.TPromise.as(null);
            return prepare.then(function () {
                // todo@ben, can only copy text files
                // https://github.com/Microsoft/vscode/issues/41543
                return _this.resolveContent(source, { acceptTextOnly: true }).then(function (content) {
                    return _this._withProvider(target).then(function (provider) {
                        return _this._doUpdateContent(provider, target, content.value, { encoding: content.encoding }).then(function (fileStat) {
                            _this._onAfterOperation.fire(new files_1.FileOperationEvent(source, files_1.FileOperation.COPY, fileStat));
                            return fileStat;
                        });
                    }, function (err) {
                        if (err instanceof Error && err.name === 'ENOPRO') {
                            // file scheme
                            return _super.prototype.updateContent.call(_this, target, content.value, { encoding: content.encoding });
                        }
                        else {
                            return winjs_base_1.TPromise.wrapError(err);
                        }
                    });
                });
            });
        };
        RemoteFileService.prototype.touchFile = function (resource) {
            if (resource.scheme === network_1.Schemas.file) {
                return _super.prototype.touchFile.call(this, resource);
            }
            else {
                return this._doTouchFile(resource);
            }
        };
        RemoteFileService.prototype._doTouchFile = function (resource) {
            var _this = this;
            return this._withProvider(resource).then(function (provider) {
                return provider.stat(resource).then(function () {
                    return provider.utimes(resource, Date.now(), Date.now());
                }, function (err) {
                    return provider.write(resource, new Uint8Array(0));
                }).then(function () {
                    return _this.resolveFile(resource);
                });
            });
        };
        // TODO@Joh - file watching on demand!
        RemoteFileService.prototype.watchFileChanges = function (resource) {
            if (resource.scheme === network_1.Schemas.file) {
                _super.prototype.watchFileChanges.call(this, resource);
            }
        };
        RemoteFileService.prototype.unwatchFileChanges = function (resource) {
            if (resource.scheme === network_1.Schemas.file) {
                _super.prototype.unwatchFileChanges.call(this, resource);
            }
        };
        RemoteFileService = __decorate([
            __param(0, extensions_1.IExtensionService),
            __param(1, storage_1.IStorageService),
            __param(2, configuration_1.IConfigurationService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, environment_1.IEnvironmentService),
            __param(5, lifecycle_1.ILifecycleService),
            __param(6, message_1.IMessageService),
            __param(7, resourceConfiguration_1.ITextResourceConfigurationService)
        ], RemoteFileService);
        return RemoteFileService;
    }(fileService_1.FileService));
    exports.RemoteFileService = RemoteFileService;
});
