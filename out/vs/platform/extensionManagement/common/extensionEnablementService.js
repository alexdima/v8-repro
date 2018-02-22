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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/platform/environment/common/environment"], function (require, exports, nls_1, winjs_base_1, arrays_1, event_1, lifecycle_1, extensionManagement_1, extensionManagementUtil_1, workspace_1, storage_1, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DISABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/disabled';
    var ENABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/enabled';
    var ExtensionEnablementService = /** @class */ (function () {
        function ExtensionEnablementService(storageService, contextService, environmentService, extensionManagementService) {
            this.storageService = storageService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.disposables = [];
            this._onEnablementChanged = new event_1.Emitter();
            this.onEnablementChanged = this._onEnablementChanged.event;
            extensionManagementService.onDidUninstallExtension(this._onDidUninstallExtension, this, this.disposables);
        }
        Object.defineProperty(ExtensionEnablementService.prototype, "hasWorkspace", {
            get: function () {
                return this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY;
            },
            enumerable: true,
            configurable: true
        });
        ExtensionEnablementService.prototype.getDisabledExtensions = function () {
            var result = this._getDisabledExtensions(storage_1.StorageScope.GLOBAL);
            if (this.hasWorkspace) {
                var _loop_1 = function (e) {
                    if (!result.some(function (r) { return extensionManagementUtil_1.areSameExtensions(r, e); })) {
                        result.push(e);
                    }
                };
                for (var _i = 0, _a = this._getDisabledExtensions(storage_1.StorageScope.WORKSPACE); _i < _a.length; _i++) {
                    var e = _a[_i];
                    _loop_1(e);
                }
                var workspaceEnabledExtensions_1 = this._getEnabledExtensions(storage_1.StorageScope.WORKSPACE);
                if (workspaceEnabledExtensions_1.length) {
                    result = result.filter(function (r) { return !workspaceEnabledExtensions_1.some(function (e) { return extensionManagementUtil_1.areSameExtensions(e, r); }); });
                }
            }
            return winjs_base_1.TPromise.as(result);
        };
        ExtensionEnablementService.prototype.getEnablementState = function (identifier) {
            if (this.environmentService.disableExtensions) {
                return extensionManagement_1.EnablementState.Disabled;
            }
            if (this.hasWorkspace) {
                if (this._getEnabledExtensions(storage_1.StorageScope.WORKSPACE).filter(function (e) { return extensionManagementUtil_1.areSameExtensions(e, identifier); })[0]) {
                    return extensionManagement_1.EnablementState.WorkspaceEnabled;
                }
                if (this._getDisabledExtensions(storage_1.StorageScope.WORKSPACE).filter(function (e) { return extensionManagementUtil_1.areSameExtensions(e, identifier); })[0]) {
                    return extensionManagement_1.EnablementState.WorkspaceDisabled;
                }
            }
            if (this._getDisabledExtensions(storage_1.StorageScope.GLOBAL).filter(function (e) { return extensionManagementUtil_1.areSameExtensions(e, identifier); })[0]) {
                return extensionManagement_1.EnablementState.Disabled;
            }
            return extensionManagement_1.EnablementState.Enabled;
        };
        ExtensionEnablementService.prototype.canChangeEnablement = function (extension) {
            return !this.environmentService.disableExtensions && !(extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length);
        };
        ExtensionEnablementService.prototype.setEnablement = function (arg, newState) {
            var identifier;
            if (extensionManagement_1.isIExtensionIdentifier(arg)) {
                identifier = arg;
            }
            else {
                if (!this.canChangeEnablement(arg)) {
                    return winjs_base_1.TPromise.wrap(false);
                }
                identifier = { id: extensionManagementUtil_1.getGalleryExtensionIdFromLocal(arg), uuid: arg.identifier.uuid };
            }
            var workspace = newState === extensionManagement_1.EnablementState.WorkspaceDisabled || newState === extensionManagement_1.EnablementState.WorkspaceEnabled;
            if (workspace && !this.hasWorkspace) {
                return winjs_base_1.TPromise.wrapError(new Error(nls_1.localize('noWorkspace', "No workspace.")));
            }
            var currentState = this.getEnablementState(identifier);
            if (currentState === newState) {
                return winjs_base_1.TPromise.as(false);
            }
            switch (newState) {
                case extensionManagement_1.EnablementState.Enabled:
                    this._enableExtension(identifier);
                    break;
                case extensionManagement_1.EnablementState.Disabled:
                    this._disableExtension(identifier);
                    break;
                case extensionManagement_1.EnablementState.WorkspaceEnabled:
                    this._enableExtensionInWorkspace(identifier);
                    break;
                case extensionManagement_1.EnablementState.WorkspaceDisabled:
                    this._disableExtensionInWorkspace(identifier);
                    break;
            }
            this._onEnablementChanged.fire(identifier);
            return winjs_base_1.TPromise.as(true);
        };
        ExtensionEnablementService.prototype.isEnabled = function (identifier) {
            var enablementState = this.getEnablementState(identifier);
            return enablementState === extensionManagement_1.EnablementState.WorkspaceEnabled || enablementState === extensionManagement_1.EnablementState.Enabled;
        };
        ExtensionEnablementService.prototype.migrateToIdentifiers = function (installed) {
            this._migrateDisabledExtensions(installed, storage_1.StorageScope.GLOBAL);
            if (this.hasWorkspace) {
                this._migrateDisabledExtensions(installed, storage_1.StorageScope.WORKSPACE);
            }
        };
        ExtensionEnablementService.prototype._enableExtension = function (identifier) {
            this._removeFromDisabledExtensions(identifier, storage_1.StorageScope.WORKSPACE);
            this._removeFromEnabledExtensions(identifier, storage_1.StorageScope.WORKSPACE);
            this._removeFromDisabledExtensions(identifier, storage_1.StorageScope.GLOBAL);
        };
        ExtensionEnablementService.prototype._disableExtension = function (identifier) {
            this._removeFromDisabledExtensions(identifier, storage_1.StorageScope.WORKSPACE);
            this._removeFromEnabledExtensions(identifier, storage_1.StorageScope.WORKSPACE);
            this._addToDisabledExtensions(identifier, storage_1.StorageScope.GLOBAL);
        };
        ExtensionEnablementService.prototype._enableExtensionInWorkspace = function (identifier) {
            this._removeFromDisabledExtensions(identifier, storage_1.StorageScope.WORKSPACE);
            this._addToEnabledExtensions(identifier, storage_1.StorageScope.WORKSPACE);
        };
        ExtensionEnablementService.prototype._disableExtensionInWorkspace = function (identifier) {
            this._addToDisabledExtensions(identifier, storage_1.StorageScope.WORKSPACE);
            this._removeFromEnabledExtensions(identifier, storage_1.StorageScope.WORKSPACE);
        };
        ExtensionEnablementService.prototype._addToDisabledExtensions = function (identifier, scope) {
            if (scope === storage_1.StorageScope.WORKSPACE && !this.hasWorkspace) {
                return winjs_base_1.TPromise.wrap(false);
            }
            var disabledExtensions = this._getDisabledExtensions(scope);
            if (disabledExtensions.every(function (e) { return !extensionManagementUtil_1.areSameExtensions(e, identifier); })) {
                disabledExtensions.push(identifier);
                this._setDisabledExtensions(disabledExtensions, scope, identifier);
                return winjs_base_1.TPromise.wrap(true);
            }
            return winjs_base_1.TPromise.wrap(false);
        };
        ExtensionEnablementService.prototype._removeFromDisabledExtensions = function (identifier, scope) {
            if (scope === storage_1.StorageScope.WORKSPACE && !this.hasWorkspace) {
                return false;
            }
            var disabledExtensions = this._getDisabledExtensions(scope);
            for (var index = 0; index < disabledExtensions.length; index++) {
                var disabledExtension = disabledExtensions[index];
                if (extensionManagementUtil_1.areSameExtensions(disabledExtension, identifier)) {
                    disabledExtensions.splice(index, 1);
                    this._setDisabledExtensions(disabledExtensions, scope, identifier);
                    return true;
                }
            }
            return false;
        };
        ExtensionEnablementService.prototype._addToEnabledExtensions = function (identifier, scope) {
            if (scope === storage_1.StorageScope.WORKSPACE && !this.hasWorkspace) {
                return false;
            }
            var enabledExtensions = this._getEnabledExtensions(scope);
            if (enabledExtensions.every(function (e) { return !extensionManagementUtil_1.areSameExtensions(e, identifier); })) {
                enabledExtensions.push(identifier);
                this._setEnabledExtensions(enabledExtensions, scope, identifier);
                return true;
            }
            return false;
        };
        ExtensionEnablementService.prototype._removeFromEnabledExtensions = function (identifier, scope) {
            if (scope === storage_1.StorageScope.WORKSPACE && !this.hasWorkspace) {
                return false;
            }
            var enabledExtensions = this._getEnabledExtensions(scope);
            for (var index = 0; index < enabledExtensions.length; index++) {
                var disabledExtension = enabledExtensions[index];
                if (extensionManagementUtil_1.areSameExtensions(disabledExtension, identifier)) {
                    enabledExtensions.splice(index, 1);
                    this._setEnabledExtensions(enabledExtensions, scope, identifier);
                    return true;
                }
            }
            return false;
        };
        ExtensionEnablementService.prototype._getEnabledExtensions = function (scope) {
            return this._getExtensions(ENABLED_EXTENSIONS_STORAGE_PATH, scope);
        };
        ExtensionEnablementService.prototype._setEnabledExtensions = function (enabledExtensions, scope, extension) {
            this._setExtensions(ENABLED_EXTENSIONS_STORAGE_PATH, enabledExtensions, scope, extension);
        };
        ExtensionEnablementService.prototype._getDisabledExtensions = function (scope) {
            return this._getExtensions(DISABLED_EXTENSIONS_STORAGE_PATH, scope);
        };
        ExtensionEnablementService.prototype._setDisabledExtensions = function (disabledExtensions, scope, extension, fireEvent) {
            if (fireEvent === void 0) { fireEvent = true; }
            this._setExtensions(DISABLED_EXTENSIONS_STORAGE_PATH, disabledExtensions, scope, extension, fireEvent);
        };
        ExtensionEnablementService.prototype._getExtensions = function (storageId, scope) {
            if (scope === storage_1.StorageScope.WORKSPACE && !this.hasWorkspace) {
                return [];
            }
            var value = this.storageService.get(storageId, scope, '');
            return value ? JSON.parse(value) : [];
        };
        ExtensionEnablementService.prototype._setExtensions = function (storageId, extensions, scope, extension, fireEvent) {
            if (fireEvent === void 0) { fireEvent = true; }
            if (extensions.length) {
                this.storageService.store(storageId, JSON.stringify(extensions.map(function (_a) {
                    var id = _a.id, uuid = _a.uuid;
                    return ({ id: id, uuid: uuid });
                })), scope);
            }
            else {
                this.storageService.remove(storageId, scope);
            }
            if (fireEvent) {
                this._onEnablementChanged.fire(extension);
            }
        };
        ExtensionEnablementService.prototype._migrateDisabledExtensions = function (installedExtensions, scope) {
            var oldValue = this.storageService.get('extensions/disabled', scope, '');
            if (oldValue) {
                var extensionIdentifiers = arrays_1.coalesce(arrays_1.distinct(oldValue.split(',')).map(function (id) {
                    id = extensionManagementUtil_1.adoptToGalleryExtensionId(id);
                    var matched = installedExtensions.filter(function (installed) { return extensionManagementUtil_1.areSameExtensions({ id: id }, { id: installed.id }); })[0];
                    return matched ? { id: matched.id, uuid: matched.uuid } : null;
                }));
                if (extensionIdentifiers.length) {
                    this.storageService.store(DISABLED_EXTENSIONS_STORAGE_PATH, JSON.stringify(extensionIdentifiers), scope);
                }
            }
            this.storageService.remove('extensions/disabled', scope);
        };
        ExtensionEnablementService.prototype._onDidUninstallExtension = function (_a) {
            var identifier = _a.identifier, error = _a.error;
            if (!error) {
                var id = extensionManagementUtil_1.getIdFromLocalExtensionId(identifier.id);
                if (id) {
                    var extension = { id: id, uuid: identifier.uuid };
                    this._removeFromDisabledExtensions(extension, storage_1.StorageScope.WORKSPACE);
                    this._removeFromEnabledExtensions(extension, storage_1.StorageScope.WORKSPACE);
                    this._removeFromDisabledExtensions(extension, storage_1.StorageScope.GLOBAL);
                }
            }
        };
        ExtensionEnablementService.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        ExtensionEnablementService = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, extensionManagement_1.IExtensionManagementService)
        ], ExtensionEnablementService);
        return ExtensionEnablementService;
    }());
    exports.ExtensionEnablementService = ExtensionEnablementService;
});
