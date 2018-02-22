var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/base/common/paths", "vs/base/node/encoding", "vs/base/common/errors", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/services/files/node/fileService", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/base/common/actions", "vs/platform/message/common/message", "vs/platform/environment/common/environment", "vs/platform/lifecycle/common/lifecycle", "vs/platform/storage/common/storage", "vs/base/common/event", "electron", "vs/editor/common/services/resourceConfiguration", "vs/base/common/platform", "vs/platform/node/product", "vs/base/common/network"], function (require, exports, nls, winjs_base_1, lifecycle_1, paths, encoding, errors, uri_1, files_1, fileService_1, configuration_1, workspace_1, actions_1, message_1, environment_1, lifecycle_2, storage_1, event_1, electron_1, resourceConfiguration_1, platform_1, product_1, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileService = /** @class */ (function () {
        function FileService(configurationService, contextService, environmentService, lifecycleService, messageService, storageService, textResourceConfigurationService) {
            var _this = this;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.lifecycleService = lifecycleService;
            this.messageService = messageService;
            this.storageService = storageService;
            this.toUnbind = [];
            this._onFileChanges = new event_1.Emitter();
            this.toUnbind.push(this._onFileChanges);
            this._onAfterOperation = new event_1.Emitter();
            this.toUnbind.push(this._onAfterOperation);
            var configuration = this.configurationService.getValue();
            var watcherIgnoredPatterns = [];
            if (configuration.files && configuration.files.watcherExclude) {
                watcherIgnoredPatterns = Object.keys(configuration.files.watcherExclude).filter(function (k) { return !!configuration.files.watcherExclude[k]; });
            }
            // build config
            var fileServiceConfig = {
                errorLogger: function (msg) { return _this.onFileServiceError(msg); },
                encodingOverride: this.getEncodingOverrides(),
                watcherIgnoredPatterns: watcherIgnoredPatterns,
                verboseLogging: environmentService.verbose,
                useExperimentalFileWatcher: configuration.files.useExperimentalFileWatcher,
                elevationSupport: {
                    cliPath: this.environmentService.cliPath,
                    promptTitle: this.environmentService.appNameLong,
                    promptIcnsPath: (platform_1.isMacintosh && this.environmentService.isBuilt) ? paths.join(paths.dirname(this.environmentService.appRoot), product_1.default.nameShort + ".icns") : void 0
                }
            };
            // create service
            this.raw = new fileService_1.FileService(contextService, environmentService, textResourceConfigurationService, configurationService, lifecycleService, fileServiceConfig);
            // Listeners
            this.registerListeners();
        }
        Object.defineProperty(FileService.prototype, "onFileChanges", {
            get: function () {
                return this._onFileChanges.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileService.prototype, "onAfterOperation", {
            get: function () {
                return this._onAfterOperation.event;
            },
            enumerable: true,
            configurable: true
        });
        FileService.prototype.onFileServiceError = function (error) {
            var _this = this;
            var msg = error ? error.toString() : void 0;
            if (!msg) {
                return;
            }
            // Forward to unexpected error handler
            errors.onUnexpectedError(msg);
            // Detect if we run < .NET Framework 4.5 (TODO@ben remove with new watcher impl)
            if (msg.indexOf(FileService.NET_VERSION_ERROR) >= 0 && !this.storageService.getBoolean(FileService.NET_VERSION_ERROR_IGNORE_KEY, storage_1.StorageScope.WORKSPACE)) {
                this.messageService.show(message_1.Severity.Warning, {
                    message: nls.localize('netVersionError', "The Microsoft .NET Framework 4.5 is required. Please follow the link to install it."),
                    actions: [
                        new actions_1.Action('install.net', nls.localize('installNet', "Download .NET Framework 4.5"), null, true, function () {
                            window.open('https://go.microsoft.com/fwlink/?LinkId=786533');
                            return winjs_base_1.TPromise.as(true);
                        }),
                        new actions_1.Action('net.error.ignore', nls.localize('neverShowAgain', "Don't Show Again"), '', true, function () {
                            _this.storageService.store(FileService.NET_VERSION_ERROR_IGNORE_KEY, true, storage_1.StorageScope.WORKSPACE);
                            return winjs_base_1.TPromise.as(null);
                        }),
                        message_1.CloseAction
                    ]
                });
            }
            // Detect if we run into ENOSPC issues (TODO@ben remove with new watcher impl)
            if (msg.indexOf(FileService.ENOSPC_ERROR) >= 0 && !this.storageService.getBoolean(FileService.ENOSPC_ERROR_IGNORE_KEY, storage_1.StorageScope.WORKSPACE)) {
                this.messageService.show(message_1.Severity.Warning, {
                    message: nls.localize('enospcError', "{0} is running out of file handles. Please follow the instructions link to resolve this issue.", product_1.default.nameLong),
                    actions: [
                        new actions_1.Action('learnMore', nls.localize('learnMore', "Instructions"), null, true, function () {
                            window.open('https://go.microsoft.com/fwlink/?linkid=867693');
                            return winjs_base_1.TPromise.as(true);
                        }),
                        new actions_1.Action('enospc.error.ignore', nls.localize('neverShowAgain', "Don't Show Again"), '', true, function () {
                            _this.storageService.store(FileService.ENOSPC_ERROR_IGNORE_KEY, true, storage_1.StorageScope.WORKSPACE);
                            return winjs_base_1.TPromise.as(null);
                        }),
                        message_1.CloseAction
                    ]
                });
            }
        };
        FileService.prototype.registerListeners = function () {
            var _this = this;
            // File events
            this.toUnbind.push(this.raw.onFileChanges(function (e) { return _this._onFileChanges.fire(e); }));
            this.toUnbind.push(this.raw.onAfterOperation(function (e) { return _this._onAfterOperation.fire(e); }));
            // Config changes
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationChange(e); }));
            // Root changes
            this.toUnbind.push(this.contextService.onDidChangeWorkspaceFolders(function () { return _this.onDidChangeWorkspaceFolders(); }));
            // Lifecycle
            this.lifecycleService.onShutdown(this.dispose, this);
        };
        FileService.prototype.onDidChangeWorkspaceFolders = function () {
            this.updateOptions({ encodingOverride: this.getEncodingOverrides() });
        };
        FileService.prototype.getEncodingOverrides = function () {
            var encodingOverride = [];
            encodingOverride.push({ resource: uri_1.default.file(this.environmentService.appSettingsHome), encoding: encoding.UTF8 });
            this.contextService.getWorkspace().folders.forEach(function (folder) {
                encodingOverride.push({ resource: uri_1.default.file(paths.join(folder.uri.fsPath, '.vscode')), encoding: encoding.UTF8 });
            });
            return encodingOverride;
        };
        FileService.prototype.onConfigurationChange = function (event) {
            if (event.affectsConfiguration('files.useExperimentalFileWatcher')) {
                this.updateOptions({ useExperimentalFileWatcher: this.configurationService.getValue('files.useExperimentalFileWatcher') });
            }
        };
        FileService.prototype.updateOptions = function (options) {
            this.raw.updateOptions(options);
        };
        FileService.prototype.resolveFile = function (resource, options) {
            return this.raw.resolveFile(resource, options);
        };
        FileService.prototype.resolveFiles = function (toResolve) {
            return this.raw.resolveFiles(toResolve);
        };
        FileService.prototype.existsFile = function (resource) {
            return this.raw.existsFile(resource);
        };
        FileService.prototype.resolveContent = function (resource, options) {
            return this.raw.resolveContent(resource, options);
        };
        FileService.prototype.resolveStreamContent = function (resource, options) {
            return this.raw.resolveStreamContent(resource, options);
        };
        FileService.prototype.updateContent = function (resource, value, options) {
            return this.raw.updateContent(resource, value, options);
        };
        FileService.prototype.moveFile = function (source, target, overwrite) {
            return this.raw.moveFile(source, target, overwrite);
        };
        FileService.prototype.copyFile = function (source, target, overwrite) {
            return this.raw.copyFile(source, target, overwrite);
        };
        FileService.prototype.createFile = function (resource, content, options) {
            return this.raw.createFile(resource, content, options);
        };
        FileService.prototype.createFolder = function (resource) {
            return this.raw.createFolder(resource);
        };
        FileService.prototype.touchFile = function (resource) {
            return this.raw.touchFile(resource);
        };
        FileService.prototype.rename = function (resource, newName) {
            return this.raw.rename(resource, newName);
        };
        FileService.prototype.del = function (resource, useTrash) {
            if (useTrash) {
                return this.doMoveItemToTrash(resource);
            }
            return this.raw.del(resource);
        };
        FileService.prototype.doMoveItemToTrash = function (resource) {
            var absolutePath = resource.fsPath;
            var result = electron_1.shell.moveItemToTrash(absolutePath);
            if (!result) {
                return winjs_base_1.TPromise.wrapError(new Error(nls.localize('trashFailed', "Failed to move '{0}' to the trash", paths.basename(absolutePath))));
            }
            this._onAfterOperation.fire(new files_1.FileOperationEvent(resource, files_1.FileOperation.DELETE));
            return winjs_base_1.TPromise.as(null);
        };
        FileService.prototype.importFile = function (source, targetFolder) {
            return this.raw.importFile(source, targetFolder).then(function (result) {
                return {
                    isNew: result && result.isNew,
                    stat: result && result.stat
                };
            });
        };
        FileService.prototype.watchFileChanges = function (resource) {
            if (!resource) {
                return;
            }
            if (resource.scheme !== network_1.Schemas.file) {
                return; // only support files
            }
            // return early if the resource is inside the workspace for which we have another watcher in place
            if (this.contextService.isInsideWorkspace(resource)) {
                return;
            }
            this.raw.watchFileChanges(resource);
        };
        FileService.prototype.unwatchFileChanges = function (resource) {
            this.raw.unwatchFileChanges(resource);
        };
        FileService.prototype.getEncoding = function (resource, preferredEncoding) {
            return this.raw.getEncoding(resource, preferredEncoding);
        };
        FileService.prototype.dispose = function () {
            this.toUnbind = lifecycle_1.dispose(this.toUnbind);
            // Dispose service
            this.raw.dispose();
        };
        // If we run with .NET framework < 4.5, we need to detect this error to inform the user
        FileService.NET_VERSION_ERROR = 'System.MissingMethodException';
        FileService.NET_VERSION_ERROR_IGNORE_KEY = 'ignoreNetVersionError';
        FileService.ENOSPC_ERROR = 'ENOSPC';
        FileService.ENOSPC_ERROR_IGNORE_KEY = 'ignoreEnospcError';
        FileService = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, lifecycle_2.ILifecycleService),
            __param(4, message_1.IMessageService),
            __param(5, storage_1.IStorageService),
            __param(6, resourceConfiguration_1.ITextResourceConfigurationService)
        ], FileService);
        return FileService;
    }());
    exports.FileService = FileService;
});
