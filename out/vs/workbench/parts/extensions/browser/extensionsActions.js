/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/paths", "vs/base/common/json", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/parts/extensions/common/extensions", "vs/workbench/parts/extensions/common/extensionsFileTemplate", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/workbench/browser/viewlet", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/services/editor/common/editorService", "vs/workbench/parts/extensions/common/extensionQuery", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/platform/windows/common/windows", "vs/platform/extensions/common/extensions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/workbench/services/configuration/common/jsonEditing", "vs/editor/common/services/resolverService", "vs/base/common/severity", "vs/base/common/paging", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/browser/actions/workspaceCommands", "vs/css!./media/extensionActions"], function (require, exports, nls_1, winjs_base_1, actions_1, async_1, DOM, paths, json, actionbar_1, contextView_1, lifecycle_1, extensions_1, extensionsFileTemplate_1, extensionManagement_1, extensionManagementUtil_1, instantiation_1, message_1, viewlet_1, viewlet_2, editorService_1, extensionQuery_1, files_1, workspace_1, windows_1, extensions_2, commands_1, configuration_1, themeService_1, colorRegistry_1, color_1, jsonEditing_1, resolverService_1, severity_1, paging_1, contextkey_1, actions_2, workspaceCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InstallAction = /** @class */ (function (_super) {
        __extends(InstallAction, _super);
        function InstallAction(extensionsWorkbenchService) {
            var _this = _super.call(this, 'extensions.install', InstallAction.InstallLabel, InstallAction.Class, false) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.disposables = [];
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(InstallAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        InstallAction.prototype.update = function () {
            if (!this.extension || this.extension.type === extensionManagement_1.LocalExtensionType.System) {
                this.enabled = false;
                this.class = InstallAction.Class;
                this.label = InstallAction.InstallLabel;
                return;
            }
            this.enabled = this.extensionsWorkbenchService.canInstall(this.extension) && this.extension.state === extensions_1.ExtensionState.Uninstalled;
            if (this.extension.state === extensions_1.ExtensionState.Installing) {
                this.label = InstallAction.InstallingLabel;
                this.class = InstallAction.InstallingClass;
                this.tooltip = InstallAction.InstallingLabel;
            }
            else {
                this.label = InstallAction.InstallLabel;
                this.class = InstallAction.Class;
                this.tooltip = InstallAction.InstallLabel;
            }
        };
        InstallAction.prototype.run = function () {
            this.extensionsWorkbenchService.open(this.extension);
            return this.extensionsWorkbenchService.install(this.extension);
        };
        InstallAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        InstallAction.InstallLabel = nls_1.localize('installAction', "Install");
        InstallAction.InstallingLabel = nls_1.localize('installing', "Installing");
        InstallAction.Class = 'extension-action prominent install';
        InstallAction.InstallingClass = 'extension-action install installing';
        InstallAction = __decorate([
            __param(0, extensions_1.IExtensionsWorkbenchService)
        ], InstallAction);
        return InstallAction;
    }(actions_1.Action));
    exports.InstallAction = InstallAction;
    var UninstallAction = /** @class */ (function (_super) {
        __extends(UninstallAction, _super);
        function UninstallAction(extensionsWorkbenchService) {
            var _this = _super.call(this, 'extensions.uninstall', UninstallAction.UninstallLabel, UninstallAction.UninstallClass, false) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.disposables = [];
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(UninstallAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        UninstallAction.prototype.update = function () {
            var _this = this;
            if (!this.extension) {
                this.enabled = false;
                return;
            }
            var state = this.extension.state;
            if (state === extensions_1.ExtensionState.Uninstalling) {
                this.label = UninstallAction.UninstallingLabel;
                this.class = UninstallAction.UnInstallingClass;
                this.enabled = false;
                return;
            }
            this.label = UninstallAction.UninstallLabel;
            this.class = UninstallAction.UninstallClass;
            var installedExtensions = this.extensionsWorkbenchService.local.filter(function (e) { return e.id === _this.extension.id; });
            if (!installedExtensions.length) {
                this.enabled = false;
                return;
            }
            if (installedExtensions[0].type !== extensionManagement_1.LocalExtensionType.User) {
                this.enabled = false;
                return;
            }
            this.enabled = true;
        };
        UninstallAction.prototype.run = function () {
            return this.extensionsWorkbenchService.uninstall(this.extension);
        };
        UninstallAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        UninstallAction.UninstallLabel = nls_1.localize('uninstallAction', "Uninstall");
        UninstallAction.UninstallingLabel = nls_1.localize('Uninstalling', "Uninstalling");
        UninstallAction.UninstallClass = 'extension-action uninstall';
        UninstallAction.UnInstallingClass = 'extension-action uninstall uninstalling';
        UninstallAction = __decorate([
            __param(0, extensions_1.IExtensionsWorkbenchService)
        ], UninstallAction);
        return UninstallAction;
    }(actions_1.Action));
    exports.UninstallAction = UninstallAction;
    var CombinedInstallAction = /** @class */ (function (_super) {
        __extends(CombinedInstallAction, _super);
        function CombinedInstallAction(instantiationService) {
            var _this = _super.call(this, 'extensions.combinedInstall', '', '', false) || this;
            _this.disposables = [];
            _this.installAction = instantiationService.createInstance(InstallAction);
            _this.uninstallAction = instantiationService.createInstance(UninstallAction);
            _this.disposables.push(_this.installAction, _this.uninstallAction);
            _this.installAction.onDidChange(_this.update, _this, _this.disposables);
            _this.uninstallAction.onDidChange(_this.update, _this, _this.disposables);
            _this.update();
            return _this;
        }
        Object.defineProperty(CombinedInstallAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) {
                this._extension = extension;
                this.installAction.extension = extension;
                this.uninstallAction.extension = extension;
            },
            enumerable: true,
            configurable: true
        });
        CombinedInstallAction.prototype.update = function () {
            if (!this.extension || this.extension.type === extensionManagement_1.LocalExtensionType.System) {
                this.enabled = false;
                this.class = CombinedInstallAction.NoExtensionClass;
            }
            else if (this.installAction.enabled) {
                this.enabled = true;
                this.label = this.installAction.label;
                this.class = this.installAction.class;
                this.tooltip = this.installAction.tooltip;
            }
            else if (this.uninstallAction.enabled) {
                this.enabled = true;
                this.label = this.uninstallAction.label;
                this.class = this.uninstallAction.class;
                this.tooltip = this.uninstallAction.tooltip;
            }
            else if (this.extension.state === extensions_1.ExtensionState.Installing) {
                this.enabled = false;
                this.label = this.installAction.label;
                this.class = this.installAction.class;
                this.tooltip = this.installAction.tooltip;
            }
            else if (this.extension.state === extensions_1.ExtensionState.Uninstalling) {
                this.enabled = false;
                this.label = this.uninstallAction.label;
                this.class = this.uninstallAction.class;
                this.tooltip = this.uninstallAction.tooltip;
            }
            else {
                this.enabled = false;
                this.label = this.installAction.label;
                this.class = this.installAction.class;
                this.tooltip = this.installAction.tooltip;
            }
        };
        CombinedInstallAction.prototype.run = function () {
            if (this.installAction.enabled) {
                return this.installAction.run();
            }
            else if (this.uninstallAction.enabled) {
                return this.uninstallAction.run();
            }
            return winjs_base_1.TPromise.as(null);
        };
        CombinedInstallAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        CombinedInstallAction.NoExtensionClass = 'extension-action prominent install no-extension';
        CombinedInstallAction = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], CombinedInstallAction);
        return CombinedInstallAction;
    }(actions_1.Action));
    exports.CombinedInstallAction = CombinedInstallAction;
    var UpdateAction = /** @class */ (function (_super) {
        __extends(UpdateAction, _super);
        function UpdateAction(extensionsWorkbenchService) {
            var _this = _super.call(this, 'extensions.update', UpdateAction.Label, UpdateAction.DisabledClass, false) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.disposables = [];
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(UpdateAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        UpdateAction.prototype.update = function () {
            if (!this.extension) {
                this.enabled = false;
                this.class = UpdateAction.DisabledClass;
                this.label = UpdateAction.Label;
                return;
            }
            if (this.extension.type !== extensionManagement_1.LocalExtensionType.User) {
                this.enabled = false;
                this.class = UpdateAction.DisabledClass;
                this.label = UpdateAction.Label;
                return;
            }
            var canInstall = this.extensionsWorkbenchService.canInstall(this.extension);
            var isInstalled = this.extension.state === extensions_1.ExtensionState.Installed;
            this.enabled = canInstall && isInstalled && this.extension.outdated;
            this.class = this.enabled ? UpdateAction.EnabledClass : UpdateAction.DisabledClass;
            this.label = nls_1.localize('updateTo', "Update to {0}", this.extension.latestVersion);
        };
        UpdateAction.prototype.run = function () {
            return this.extensionsWorkbenchService.install(this.extension);
        };
        UpdateAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        UpdateAction.EnabledClass = 'extension-action prominent update';
        UpdateAction.DisabledClass = UpdateAction.EnabledClass + " disabled";
        UpdateAction.Label = nls_1.localize('updateAction', "Update");
        UpdateAction = __decorate([
            __param(0, extensions_1.IExtensionsWorkbenchService)
        ], UpdateAction);
        return UpdateAction;
    }(actions_1.Action));
    exports.UpdateAction = UpdateAction;
    var DropDownMenuActionItem = /** @class */ (function (_super) {
        __extends(DropDownMenuActionItem, _super);
        function DropDownMenuActionItem(action, menuActionGroups, contextMenuService) {
            var _this = _super.call(this, null, action, { icon: true, label: true }) || this;
            _this.menuActionGroups = menuActionGroups;
            _this.contextMenuService = contextMenuService;
            _this.disposables = [];
            for (var _i = 0, menuActionGroups_1 = menuActionGroups; _i < menuActionGroups_1.length; _i++) {
                var menuActions = menuActionGroups_1[_i];
                _this.disposables = _this.disposables.concat(menuActions);
            }
            return _this;
        }
        Object.defineProperty(DropDownMenuActionItem.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) {
                this._extension = extension;
                for (var _i = 0, _a = this.menuActionGroups; _i < _a.length; _i++) {
                    var menuActions = _a[_i];
                    for (var _b = 0, menuActions_1 = menuActions; _b < menuActions_1.length; _b++) {
                        var menuAction = menuActions_1[_b];
                        menuAction.extension = extension;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        DropDownMenuActionItem.prototype.showMenu = function () {
            var actions = this.getActions();
            var elementPosition = DOM.getDomNodePagePosition(this.builder.getHTMLElement());
            var anchor = { x: elementPosition.left, y: elementPosition.top + elementPosition.height + 10 };
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return anchor; },
                getActions: function () { return winjs_base_1.TPromise.wrap(actions); },
                actionRunner: this.actionRunner
            });
        };
        DropDownMenuActionItem.prototype.getActions = function () {
            var actions = [];
            var menuActionGroups = this.menuActionGroups;
            for (var _i = 0, menuActionGroups_2 = menuActionGroups; _i < menuActionGroups_2.length; _i++) {
                var menuActions = menuActionGroups_2[_i];
                actions = actions.concat(menuActions, [new actionbar_1.Separator()]);
            }
            return actions.length ? actions.slice(0, actions.length - 1) : actions;
        };
        DropDownMenuActionItem.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        DropDownMenuActionItem = __decorate([
            __param(2, contextView_1.IContextMenuService)
        ], DropDownMenuActionItem);
        return DropDownMenuActionItem;
    }(actionbar_1.ActionItem));
    exports.DropDownMenuActionItem = DropDownMenuActionItem;
    var ManageExtensionAction = /** @class */ (function (_super) {
        __extends(ManageExtensionAction, _super);
        function ManageExtensionAction(extensionsWorkbenchService, instantiationService) {
            var _this = _super.call(this, ManageExtensionAction.ID) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.instantiationService = instantiationService;
            _this.disposables = [];
            _this._actionItem = _this.instantiationService.createInstance(DropDownMenuActionItem, _this, [
                [
                    instantiationService.createInstance(EnableForWorkspaceAction, EnableForWorkspaceAction.LABEL),
                    instantiationService.createInstance(EnableGloballyAction, EnableGloballyAction.LABEL)
                ],
                [
                    instantiationService.createInstance(DisableForWorkspaceAction, DisableForWorkspaceAction.LABEL),
                    instantiationService.createInstance(DisableGloballyAction, DisableGloballyAction.LABEL)
                ],
                [
                    instantiationService.createInstance(UninstallAction)
                ]
            ]);
            _this.disposables.push(_this._actionItem);
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(ManageExtensionAction.prototype, "actionItem", {
            get: function () { return this._actionItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ManageExtensionAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this._actionItem.extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        ManageExtensionAction.prototype.update = function () {
            this.class = ManageExtensionAction.HideManageExtensionClass;
            this.tooltip = '';
            this.enabled = false;
            if (this.extension && this.extension.type !== extensionManagement_1.LocalExtensionType.System) {
                var state = this.extension.state;
                this.enabled = state === extensions_1.ExtensionState.Installed;
                this.class = this.enabled || state === extensions_1.ExtensionState.Uninstalling ? ManageExtensionAction.Class : ManageExtensionAction.HideManageExtensionClass;
                this.tooltip = state === extensions_1.ExtensionState.Uninstalling ? nls_1.localize('ManageExtensionAction.uninstallingTooltip', "Uninstalling") : '';
            }
        };
        ManageExtensionAction.prototype.run = function () {
            this._actionItem.showMenu();
            return winjs_base_1.TPromise.wrap(null);
        };
        ManageExtensionAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        ManageExtensionAction.ID = 'extensions.manage';
        ManageExtensionAction.Class = 'extension-action manage';
        ManageExtensionAction.HideManageExtensionClass = ManageExtensionAction.Class + " hide";
        ManageExtensionAction = __decorate([
            __param(0, extensions_1.IExtensionsWorkbenchService),
            __param(1, instantiation_1.IInstantiationService)
        ], ManageExtensionAction);
        return ManageExtensionAction;
    }(actions_1.Action));
    exports.ManageExtensionAction = ManageExtensionAction;
    var EnableForWorkspaceAction = /** @class */ (function (_super) {
        __extends(EnableForWorkspaceAction, _super);
        function EnableForWorkspaceAction(label, workspaceContextService, extensionsWorkbenchService, extensionEnablementService) {
            var _this = _super.call(this, EnableForWorkspaceAction.ID, label) || this;
            _this.workspaceContextService = workspaceContextService;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.extensionEnablementService = extensionEnablementService;
            _this.disposables = [];
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.disposables.push(_this.workspaceContextService.onDidChangeWorkbenchState(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(EnableForWorkspaceAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        EnableForWorkspaceAction.prototype.update = function () {
            this.enabled = false;
            if (this.extension) {
                this.enabled = (this.extension.enablementState === extensionManagement_1.EnablementState.Disabled || this.extension.enablementState === extensionManagement_1.EnablementState.WorkspaceDisabled) && this.extension.local && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        };
        EnableForWorkspaceAction.prototype.run = function () {
            return this.extensionsWorkbenchService.setEnablement(this.extension, extensionManagement_1.EnablementState.WorkspaceEnabled);
        };
        EnableForWorkspaceAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        EnableForWorkspaceAction.ID = 'extensions.enableForWorkspace';
        EnableForWorkspaceAction.LABEL = nls_1.localize('enableForWorkspaceAction', "Enable (Workspace)");
        EnableForWorkspaceAction = __decorate([
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, extensions_1.IExtensionsWorkbenchService),
            __param(3, extensionManagement_1.IExtensionEnablementService)
        ], EnableForWorkspaceAction);
        return EnableForWorkspaceAction;
    }(actions_1.Action));
    exports.EnableForWorkspaceAction = EnableForWorkspaceAction;
    var EnableGloballyAction = /** @class */ (function (_super) {
        __extends(EnableGloballyAction, _super);
        function EnableGloballyAction(label, extensionsWorkbenchService, extensionEnablementService) {
            var _this = _super.call(this, EnableGloballyAction.ID, label) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.extensionEnablementService = extensionEnablementService;
            _this.disposables = [];
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(EnableGloballyAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        EnableGloballyAction.prototype.update = function () {
            this.enabled = false;
            if (this.extension) {
                this.enabled = (this.extension.enablementState === extensionManagement_1.EnablementState.Disabled || this.extension.enablementState === extensionManagement_1.EnablementState.WorkspaceDisabled) && this.extension.local && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        };
        EnableGloballyAction.prototype.run = function () {
            return this.extensionsWorkbenchService.setEnablement(this.extension, extensionManagement_1.EnablementState.Enabled);
        };
        EnableGloballyAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        EnableGloballyAction.ID = 'extensions.enableGlobally';
        EnableGloballyAction.LABEL = nls_1.localize('enableGloballyAction', "Enable");
        EnableGloballyAction = __decorate([
            __param(1, extensions_1.IExtensionsWorkbenchService),
            __param(2, extensionManagement_1.IExtensionEnablementService)
        ], EnableGloballyAction);
        return EnableGloballyAction;
    }(actions_1.Action));
    exports.EnableGloballyAction = EnableGloballyAction;
    var EnableAction = /** @class */ (function (_super) {
        __extends(EnableAction, _super);
        function EnableAction(instantiationService, extensionsWorkbenchService) {
            var _this = _super.call(this, EnableAction.ID, nls_1.localize('enableAction', "Enable"), EnableAction.DisabledClass, false) || this;
            _this.instantiationService = instantiationService;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.disposables = [];
            _this._enableActions = [
                instantiationService.createInstance(EnableForWorkspaceAction, EnableForWorkspaceAction.LABEL),
                instantiationService.createInstance(EnableGloballyAction, EnableGloballyAction.LABEL)
            ];
            _this._actionItem = _this.instantiationService.createInstance(DropDownMenuActionItem, _this, [_this._enableActions]);
            _this.disposables.push(_this._actionItem);
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(EnableAction.prototype, "actionItem", {
            get: function () { return this._actionItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnableAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this._actionItem.extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        EnableAction.prototype.update = function () {
            if (!this.extension) {
                this.enabled = false;
                this.class = EnableAction.DisabledClass;
                return;
            }
            this.enabled = this.extension.state === extensions_1.ExtensionState.Installed && this._enableActions.some(function (e) { return e.enabled; });
            this.class = this.enabled ? EnableAction.EnabledClass : EnableAction.DisabledClass;
        };
        EnableAction.prototype.run = function () {
            this._actionItem.showMenu();
            return winjs_base_1.TPromise.wrap(null);
        };
        EnableAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        EnableAction.ID = 'extensions.enable';
        EnableAction.EnabledClass = 'extension-action prominent enable';
        EnableAction.DisabledClass = EnableAction.EnabledClass + " disabled";
        EnableAction = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, extensions_1.IExtensionsWorkbenchService)
        ], EnableAction);
        return EnableAction;
    }(actions_1.Action));
    exports.EnableAction = EnableAction;
    var DisableForWorkspaceAction = /** @class */ (function (_super) {
        __extends(DisableForWorkspaceAction, _super);
        function DisableForWorkspaceAction(label, workspaceContextService, extensionsWorkbenchService, extensionEnablementService) {
            var _this = _super.call(this, DisableForWorkspaceAction.ID, label) || this;
            _this.workspaceContextService = workspaceContextService;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.extensionEnablementService = extensionEnablementService;
            _this.disposables = [];
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            _this.workspaceContextService.onDidChangeWorkbenchState(function () { return _this.update(); }, _this, _this.disposables);
            return _this;
        }
        Object.defineProperty(DisableForWorkspaceAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        DisableForWorkspaceAction.prototype.update = function () {
            this.enabled = false;
            if (this.extension && this.workspaceContextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY) {
                this.enabled = this.extension.type !== extensionManagement_1.LocalExtensionType.System && (this.extension.enablementState === extensionManagement_1.EnablementState.Enabled || this.extension.enablementState === extensionManagement_1.EnablementState.WorkspaceEnabled) && this.extension.local && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        };
        DisableForWorkspaceAction.prototype.run = function () {
            return this.extensionsWorkbenchService.setEnablement(this.extension, extensionManagement_1.EnablementState.WorkspaceDisabled);
        };
        DisableForWorkspaceAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        DisableForWorkspaceAction.ID = 'extensions.disableForWorkspace';
        DisableForWorkspaceAction.LABEL = nls_1.localize('disableForWorkspaceAction', "Disable (Workspace)");
        DisableForWorkspaceAction = __decorate([
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, extensions_1.IExtensionsWorkbenchService),
            __param(3, extensionManagement_1.IExtensionEnablementService)
        ], DisableForWorkspaceAction);
        return DisableForWorkspaceAction;
    }(actions_1.Action));
    exports.DisableForWorkspaceAction = DisableForWorkspaceAction;
    var DisableGloballyAction = /** @class */ (function (_super) {
        __extends(DisableGloballyAction, _super);
        function DisableGloballyAction(label, extensionsWorkbenchService, extensionEnablementService) {
            var _this = _super.call(this, DisableGloballyAction.ID, label) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.extensionEnablementService = extensionEnablementService;
            _this.disposables = [];
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(DisableGloballyAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        DisableGloballyAction.prototype.update = function () {
            this.enabled = false;
            if (this.extension) {
                this.enabled = this.extension.type !== extensionManagement_1.LocalExtensionType.System && (this.extension.enablementState === extensionManagement_1.EnablementState.Enabled || this.extension.enablementState === extensionManagement_1.EnablementState.WorkspaceEnabled) && this.extension.local && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        };
        DisableGloballyAction.prototype.run = function () {
            return this.extensionsWorkbenchService.setEnablement(this.extension, extensionManagement_1.EnablementState.Disabled);
        };
        DisableGloballyAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        DisableGloballyAction.ID = 'extensions.disableGlobally';
        DisableGloballyAction.LABEL = nls_1.localize('disableGloballyAction', "Disable");
        DisableGloballyAction = __decorate([
            __param(1, extensions_1.IExtensionsWorkbenchService),
            __param(2, extensionManagement_1.IExtensionEnablementService)
        ], DisableGloballyAction);
        return DisableGloballyAction;
    }(actions_1.Action));
    exports.DisableGloballyAction = DisableGloballyAction;
    var DisableAction = /** @class */ (function (_super) {
        __extends(DisableAction, _super);
        function DisableAction(instantiationService, extensionsWorkbenchService) {
            var _this = _super.call(this, DisableAction.ID, nls_1.localize('disableAction', "Disable"), DisableAction.DisabledClass, false) || this;
            _this.instantiationService = instantiationService;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.disposables = [];
            _this._disableActions = [
                instantiationService.createInstance(DisableForWorkspaceAction, DisableForWorkspaceAction.LABEL),
                instantiationService.createInstance(DisableGloballyAction, DisableGloballyAction.LABEL)
            ];
            _this._actionItem = _this.instantiationService.createInstance(DropDownMenuActionItem, _this, [_this._disableActions]);
            _this.disposables.push(_this._actionItem);
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(DisableAction.prototype, "actionItem", {
            get: function () { return this._actionItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisableAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this._actionItem.extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        DisableAction.prototype.update = function () {
            if (!this.extension) {
                this.enabled = false;
                this.class = DisableAction.DisabledClass;
                return;
            }
            this.enabled = this.extension.state === extensions_1.ExtensionState.Installed && this.extension.type !== extensionManagement_1.LocalExtensionType.System && this._disableActions.some(function (a) { return a.enabled; });
            this.class = this.enabled ? DisableAction.EnabledClass : DisableAction.DisabledClass;
        };
        DisableAction.prototype.run = function () {
            this._actionItem.showMenu();
            return winjs_base_1.TPromise.wrap(null);
        };
        DisableAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        DisableAction.ID = 'extensions.disable';
        DisableAction.EnabledClass = 'extension-action disable';
        DisableAction.DisabledClass = DisableAction.EnabledClass + " disabled";
        DisableAction = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, extensions_1.IExtensionsWorkbenchService)
        ], DisableAction);
        return DisableAction;
    }(actions_1.Action));
    exports.DisableAction = DisableAction;
    var CheckForUpdatesAction = /** @class */ (function (_super) {
        __extends(CheckForUpdatesAction, _super);
        function CheckForUpdatesAction(id, label, extensionsWorkbenchService) {
            if (id === void 0) { id = UpdateAllAction.ID; }
            if (label === void 0) { label = UpdateAllAction.LABEL; }
            var _this = _super.call(this, id, label, '', true) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            return _this;
        }
        CheckForUpdatesAction.prototype.run = function () {
            return this.extensionsWorkbenchService.checkForUpdates();
        };
        CheckForUpdatesAction.ID = 'workbench.extensions.action.checkForUpdates';
        CheckForUpdatesAction.LABEL = nls_1.localize('checkForUpdates', "Check for Updates");
        CheckForUpdatesAction = __decorate([
            __param(2, extensions_1.IExtensionsWorkbenchService)
        ], CheckForUpdatesAction);
        return CheckForUpdatesAction;
    }(actions_1.Action));
    exports.CheckForUpdatesAction = CheckForUpdatesAction;
    var ToggleAutoUpdateAction = /** @class */ (function (_super) {
        __extends(ToggleAutoUpdateAction, _super);
        function ToggleAutoUpdateAction(id, label, autoUpdateValue, configurationService) {
            var _this = _super.call(this, id, label, '', true) || this;
            _this.autoUpdateValue = autoUpdateValue;
            _this.configurationService = configurationService;
            _this.updateEnablement();
            configurationService.onDidChangeConfiguration(function () { return _this.updateEnablement(); });
            return _this;
        }
        ToggleAutoUpdateAction.prototype.updateEnablement = function () {
            this.enabled = this.configurationService.getValue(extensions_1.AutoUpdateConfigurationKey) !== this.autoUpdateValue;
        };
        ToggleAutoUpdateAction.prototype.run = function () {
            return this.configurationService.updateValue(extensions_1.AutoUpdateConfigurationKey, this.autoUpdateValue);
        };
        ToggleAutoUpdateAction = __decorate([
            __param(3, configuration_1.IConfigurationService)
        ], ToggleAutoUpdateAction);
        return ToggleAutoUpdateAction;
    }(actions_1.Action));
    exports.ToggleAutoUpdateAction = ToggleAutoUpdateAction;
    var EnableAutoUpdateAction = /** @class */ (function (_super) {
        __extends(EnableAutoUpdateAction, _super);
        function EnableAutoUpdateAction(id, label, configurationService) {
            if (id === void 0) { id = EnableAutoUpdateAction.ID; }
            if (label === void 0) { label = EnableAutoUpdateAction.LABEL; }
            return _super.call(this, id, label, true, configurationService) || this;
        }
        EnableAutoUpdateAction.ID = 'workbench.extensions.action.enableAutoUpdate';
        EnableAutoUpdateAction.LABEL = nls_1.localize('enableAutoUpdate', "Enable Auto Updating Extensions");
        EnableAutoUpdateAction = __decorate([
            __param(2, configuration_1.IConfigurationService)
        ], EnableAutoUpdateAction);
        return EnableAutoUpdateAction;
    }(ToggleAutoUpdateAction));
    exports.EnableAutoUpdateAction = EnableAutoUpdateAction;
    var DisableAutoUpdateAction = /** @class */ (function (_super) {
        __extends(DisableAutoUpdateAction, _super);
        function DisableAutoUpdateAction(id, label, configurationService) {
            if (id === void 0) { id = EnableAutoUpdateAction.ID; }
            if (label === void 0) { label = EnableAutoUpdateAction.LABEL; }
            return _super.call(this, id, label, false, configurationService) || this;
        }
        DisableAutoUpdateAction.ID = 'workbench.extensions.action.disableAutoUpdate';
        DisableAutoUpdateAction.LABEL = nls_1.localize('disableAutoUpdate', "Disable Auto Updating Extensions");
        DisableAutoUpdateAction = __decorate([
            __param(2, configuration_1.IConfigurationService)
        ], DisableAutoUpdateAction);
        return DisableAutoUpdateAction;
    }(ToggleAutoUpdateAction));
    exports.DisableAutoUpdateAction = DisableAutoUpdateAction;
    var UpdateAllAction = /** @class */ (function (_super) {
        __extends(UpdateAllAction, _super);
        function UpdateAllAction(id, label, extensionsWorkbenchService) {
            if (id === void 0) { id = UpdateAllAction.ID; }
            if (label === void 0) { label = UpdateAllAction.LABEL; }
            var _this = _super.call(this, id, label, '', false) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.disposables = [];
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(UpdateAllAction.prototype, "outdated", {
            get: function () {
                return this.extensionsWorkbenchService.local.filter(function (e) { return e.outdated && e.state !== extensions_1.ExtensionState.Installing; });
            },
            enumerable: true,
            configurable: true
        });
        UpdateAllAction.prototype.update = function () {
            this.enabled = this.outdated.length > 0;
        };
        UpdateAllAction.prototype.run = function () {
            var _this = this;
            return winjs_base_1.TPromise.join(this.outdated.map(function (e) { return _this.extensionsWorkbenchService.install(e); }));
        };
        UpdateAllAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        UpdateAllAction.ID = 'workbench.extensions.action.updateAllExtensions';
        UpdateAllAction.LABEL = nls_1.localize('updateAll', "Update All Extensions");
        UpdateAllAction = __decorate([
            __param(2, extensions_1.IExtensionsWorkbenchService)
        ], UpdateAllAction);
        return UpdateAllAction;
    }(actions_1.Action));
    exports.UpdateAllAction = UpdateAllAction;
    var ReloadAction = /** @class */ (function (_super) {
        __extends(ReloadAction, _super);
        function ReloadAction(extensionsWorkbenchService, windowService, extensionService, extensionEnablementService) {
            var _this = _super.call(this, 'extensions.reload', nls_1.localize('reloadAction', "Reload"), ReloadAction.DisabledClass, false) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.windowService = windowService;
            _this.extensionService = extensionService;
            _this.extensionEnablementService = extensionEnablementService;
            _this.disposables = [];
            _this.reloadMessage = '';
            _this.throttler = new async_1.Throttler();
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            _this.update();
            return _this;
        }
        Object.defineProperty(ReloadAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        ReloadAction.prototype.update = function () {
            var _this = this;
            this.throttler.queue(function () {
                _this.enabled = false;
                _this.tooltip = '';
                _this.reloadMessage = '';
                if (!_this.extension) {
                    return winjs_base_1.TPromise.wrap(null);
                }
                var state = _this.extension.state;
                if (state === extensions_1.ExtensionState.Installing || state === extensions_1.ExtensionState.Uninstalling) {
                    return winjs_base_1.TPromise.wrap(null);
                }
                return _this.extensionService.getExtensions()
                    .then(function (runningExtensions) { return _this.computeReloadState(runningExtensions); });
            }).done(function () {
                _this.class = _this.enabled ? ReloadAction.EnabledClass : ReloadAction.DisabledClass;
            });
        };
        ReloadAction.prototype.computeReloadState = function (runningExtensions) {
            var _this = this;
            var isInstalled = this.extensionsWorkbenchService.local.some(function (e) { return e.id === _this.extension.id; });
            var isUninstalled = this.extension.state === extensions_1.ExtensionState.Uninstalled;
            var isDisabled = !this.extensionEnablementService.isEnabled({ id: this.extension.id, uuid: this.extension.uuid });
            var filteredExtensions = runningExtensions.filter(function (e) { return extensionManagementUtil_1.areSameExtensions(e, _this.extension); });
            var isExtensionRunning = filteredExtensions.length > 0;
            var isDifferentVersionRunning = filteredExtensions.length > 0 && this.extension.version !== filteredExtensions[0].version;
            if (isInstalled) {
                if (isDifferentVersionRunning && !isDisabled) {
                    // Requires reload to run the updated extension
                    this.enabled = true;
                    this.tooltip = nls_1.localize('postUpdateTooltip', "Reload to update");
                    this.reloadMessage = nls_1.localize('postUpdateMessage', "Reload this window to activate the updated extension '{0}'?", this.extension.displayName);
                    return;
                }
                if (!isExtensionRunning && !isDisabled) {
                    // Requires reload to enable the extension
                    this.enabled = true;
                    this.tooltip = nls_1.localize('postEnableTooltip', "Reload to activate");
                    this.reloadMessage = nls_1.localize('postEnableMessage', "Reload this window to activate the extension '{0}'?", this.extension.displayName);
                    return;
                }
                if (isExtensionRunning && isDisabled) {
                    // Requires reload to disable the extension
                    this.enabled = true;
                    this.tooltip = nls_1.localize('postDisableTooltip', "Reload to deactivate");
                    this.reloadMessage = nls_1.localize('postDisableMessage', "Reload this window to deactivate the extension '{0}'?", this.extension.displayName);
                    return;
                }
                return;
            }
            if (isUninstalled && isExtensionRunning) {
                // Requires reload to deactivate the extension
                this.enabled = true;
                this.tooltip = nls_1.localize('postUninstallTooltip', "Reload to deactivate");
                this.reloadMessage = nls_1.localize('postUninstallMessage', "Reload this window to deactivate the uninstalled extension '{0}'?", this.extension.displayName);
                return;
            }
        };
        ReloadAction.prototype.run = function () {
            return this.windowService.reloadWindow();
        };
        ReloadAction.EnabledClass = 'extension-action reload';
        ReloadAction.DisabledClass = ReloadAction.EnabledClass + " disabled";
        ReloadAction = __decorate([
            __param(0, extensions_1.IExtensionsWorkbenchService),
            __param(1, windows_1.IWindowService),
            __param(2, extensions_2.IExtensionService),
            __param(3, extensionManagement_1.IExtensionEnablementService)
        ], ReloadAction);
        return ReloadAction;
    }(actions_1.Action));
    exports.ReloadAction = ReloadAction;
    var OpenExtensionsViewletAction = /** @class */ (function (_super) {
        __extends(OpenExtensionsViewletAction, _super);
        function OpenExtensionsViewletAction(id, label, viewletService, editorService) {
            return _super.call(this, id, label, extensions_1.VIEWLET_ID, viewletService, editorService) || this;
        }
        OpenExtensionsViewletAction.ID = extensions_1.VIEWLET_ID;
        OpenExtensionsViewletAction.LABEL = nls_1.localize('toggleExtensionsViewlet', "Show Extensions");
        OpenExtensionsViewletAction = __decorate([
            __param(2, viewlet_2.IViewletService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenExtensionsViewletAction);
        return OpenExtensionsViewletAction;
    }(viewlet_1.ToggleViewletAction));
    exports.OpenExtensionsViewletAction = OpenExtensionsViewletAction;
    var InstallExtensionsAction = /** @class */ (function (_super) {
        __extends(InstallExtensionsAction, _super);
        function InstallExtensionsAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InstallExtensionsAction.ID = 'workbench.extensions.action.installExtensions';
        InstallExtensionsAction.LABEL = nls_1.localize('installExtensions', "Install Extensions");
        return InstallExtensionsAction;
    }(OpenExtensionsViewletAction));
    exports.InstallExtensionsAction = InstallExtensionsAction;
    var ShowEnabledExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowEnabledExtensionsAction, _super);
        function ShowEnabledExtensionsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, 'clear-extensions', true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        ShowEnabledExtensionsAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('@enabled');
                viewlet.focus();
            });
        };
        ShowEnabledExtensionsAction.ID = 'workbench.extensions.action.showEnabledExtensions';
        ShowEnabledExtensionsAction.LABEL = nls_1.localize('showEnabledExtensions', 'Show Enabled Extensions');
        ShowEnabledExtensionsAction = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], ShowEnabledExtensionsAction);
        return ShowEnabledExtensionsAction;
    }(actions_1.Action));
    exports.ShowEnabledExtensionsAction = ShowEnabledExtensionsAction;
    var ShowInstalledExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowInstalledExtensionsAction, _super);
        function ShowInstalledExtensionsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, 'clear-extensions', true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        ShowInstalledExtensionsAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('@installed');
                viewlet.focus();
            });
        };
        ShowInstalledExtensionsAction.ID = 'workbench.extensions.action.showInstalledExtensions';
        ShowInstalledExtensionsAction.LABEL = nls_1.localize('showInstalledExtensions', "Show Installed Extensions");
        ShowInstalledExtensionsAction = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], ShowInstalledExtensionsAction);
        return ShowInstalledExtensionsAction;
    }(actions_1.Action));
    exports.ShowInstalledExtensionsAction = ShowInstalledExtensionsAction;
    var ShowDisabledExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowDisabledExtensionsAction, _super);
        function ShowDisabledExtensionsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, 'null', true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        ShowDisabledExtensionsAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('@disabled ');
                viewlet.focus();
            });
        };
        ShowDisabledExtensionsAction.ID = 'workbench.extensions.action.showDisabledExtensions';
        ShowDisabledExtensionsAction.LABEL = nls_1.localize('showDisabledExtensions', "Show Disabled Extensions");
        ShowDisabledExtensionsAction = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], ShowDisabledExtensionsAction);
        return ShowDisabledExtensionsAction;
    }(actions_1.Action));
    exports.ShowDisabledExtensionsAction = ShowDisabledExtensionsAction;
    var ClearExtensionsInputAction = /** @class */ (function (_super) {
        __extends(ClearExtensionsInputAction, _super);
        function ClearExtensionsInputAction(id, label, onSearchChange, viewletService) {
            var _this = _super.call(this, id, label, 'clear-extensions', true) || this;
            _this.viewletService = viewletService;
            _this.disposables = [];
            _this.enabled = false;
            onSearchChange(_this.onSearchChange, _this, _this.disposables);
            return _this;
        }
        ClearExtensionsInputAction.prototype.onSearchChange = function (value) {
            this.enabled = !!value;
        };
        ClearExtensionsInputAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('');
                viewlet.focus();
            });
        };
        ClearExtensionsInputAction.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        ClearExtensionsInputAction.ID = 'workbench.extensions.action.clearExtensionsInput';
        ClearExtensionsInputAction.LABEL = nls_1.localize('clearExtensionsInput', "Clear Extensions Input");
        ClearExtensionsInputAction = __decorate([
            __param(3, viewlet_2.IViewletService)
        ], ClearExtensionsInputAction);
        return ClearExtensionsInputAction;
    }(actions_1.Action));
    exports.ClearExtensionsInputAction = ClearExtensionsInputAction;
    var ShowOutdatedExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowOutdatedExtensionsAction, _super);
        function ShowOutdatedExtensionsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, null, true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        ShowOutdatedExtensionsAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('@outdated ');
                viewlet.focus();
            });
        };
        ShowOutdatedExtensionsAction.ID = 'workbench.extensions.action.listOutdatedExtensions';
        ShowOutdatedExtensionsAction.LABEL = nls_1.localize('showOutdatedExtensions', "Show Outdated Extensions");
        ShowOutdatedExtensionsAction = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], ShowOutdatedExtensionsAction);
        return ShowOutdatedExtensionsAction;
    }(actions_1.Action));
    exports.ShowOutdatedExtensionsAction = ShowOutdatedExtensionsAction;
    var ShowPopularExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowPopularExtensionsAction, _super);
        function ShowPopularExtensionsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, null, true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        ShowPopularExtensionsAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('@sort:installs ');
                viewlet.focus();
            });
        };
        ShowPopularExtensionsAction.ID = 'workbench.extensions.action.showPopularExtensions';
        ShowPopularExtensionsAction.LABEL = nls_1.localize('showPopularExtensions', "Show Popular Extensions");
        ShowPopularExtensionsAction = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], ShowPopularExtensionsAction);
        return ShowPopularExtensionsAction;
    }(actions_1.Action));
    exports.ShowPopularExtensionsAction = ShowPopularExtensionsAction;
    var ShowRecommendedExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowRecommendedExtensionsAction, _super);
        function ShowRecommendedExtensionsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, null, true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        ShowRecommendedExtensionsAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('@recommended ');
                viewlet.focus();
            });
        };
        ShowRecommendedExtensionsAction.ID = 'workbench.extensions.action.showRecommendedExtensions';
        ShowRecommendedExtensionsAction.LABEL = nls_1.localize('showRecommendedExtensions', "Show Recommended Extensions");
        ShowRecommendedExtensionsAction = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], ShowRecommendedExtensionsAction);
        return ShowRecommendedExtensionsAction;
    }(actions_1.Action));
    exports.ShowRecommendedExtensionsAction = ShowRecommendedExtensionsAction;
    var InstallWorkspaceRecommendedExtensionsAction = /** @class */ (function (_super) {
        __extends(InstallWorkspaceRecommendedExtensionsAction, _super);
        function InstallWorkspaceRecommendedExtensionsAction(id, label, contextService, viewletService, extensionsWorkbenchService, extensionTipsService, messageService) {
            if (id === void 0) { id = InstallWorkspaceRecommendedExtensionsAction.ID; }
            if (label === void 0) { label = InstallWorkspaceRecommendedExtensionsAction.LABEL; }
            var _this = _super.call(this, id, label, 'extension-action') || this;
            _this.contextService = contextService;
            _this.viewletService = viewletService;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.extensionTipsService = extensionTipsService;
            _this.messageService = messageService;
            _this.disposables = [];
            _this.extensionsWorkbenchService.onChange(function () { return _this.update(); }, _this, _this.disposables);
            _this.contextService.onDidChangeWorkbenchState(function () { return _this.update(); }, _this, _this.disposables);
            return _this;
        }
        InstallWorkspaceRecommendedExtensionsAction.prototype.update = function () {
            var _this = this;
            this.enabled = this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY;
            if (this.enabled) {
                this.extensionTipsService.getWorkspaceRecommendations().then(function (names) {
                    var installed = _this.extensionsWorkbenchService.local.map(function (x) { return x.id.toLowerCase(); });
                    _this.enabled = names.some(function (x) { return installed.indexOf(x.toLowerCase()) === -1; });
                });
            }
        };
        InstallWorkspaceRecommendedExtensionsAction.prototype.run = function () {
            var _this = this;
            return this.extensionTipsService.getWorkspaceRecommendations().then(function (names) {
                var installed = _this.extensionsWorkbenchService.local.map(function (x) { return x.id.toLowerCase(); });
                var toInstall = names.filter(function (x) { return installed.indexOf(x.toLowerCase()) === -1; });
                return _this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                    .then(function (viewlet) { return viewlet; })
                    .then(function (viewlet) {
                    if (!toInstall.length) {
                        _this.enabled = false;
                        _this.messageService.show(severity_1.default.Info, nls_1.localize('allExtensionsInstalled', "All extensions recommended for this workspace have already been installed"));
                        viewlet.focus();
                        return winjs_base_1.TPromise.as(null);
                    }
                    viewlet.search('@recommended');
                    viewlet.focus();
                    return _this.extensionsWorkbenchService.queryGallery({ names: toInstall, source: 'install-all-workspace-recommendations' }).then(function (pager) {
                        var installPromises = [];
                        var model = new paging_1.PagedModel(pager);
                        var extensionsWithDependencies = [];
                        for (var i = 0; i < pager.total; i++) {
                            installPromises.push(model.resolve(i).then(function (e) {
                                if (e.dependencies && e.dependencies.length > 0) {
                                    extensionsWithDependencies.push(e);
                                    return winjs_base_1.TPromise.as(null);
                                }
                                else {
                                    return _this.extensionsWorkbenchService.install(e);
                                }
                            }));
                        }
                        return winjs_base_1.TPromise.join(installPromises).then(function () {
                            return winjs_base_1.TPromise.join(extensionsWithDependencies.map(function (e) { return _this.extensionsWorkbenchService.install(e); }));
                        });
                    });
                });
            });
        };
        InstallWorkspaceRecommendedExtensionsAction.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        InstallWorkspaceRecommendedExtensionsAction.ID = 'workbench.extensions.action.installWorkspaceRecommendedExtensions';
        InstallWorkspaceRecommendedExtensionsAction.LABEL = nls_1.localize('installWorkspaceRecommendedExtensions', "Install All Workspace Recommended Extensions");
        InstallWorkspaceRecommendedExtensionsAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, viewlet_2.IViewletService),
            __param(4, extensions_1.IExtensionsWorkbenchService),
            __param(5, extensionManagement_1.IExtensionTipsService),
            __param(6, message_1.IMessageService)
        ], InstallWorkspaceRecommendedExtensionsAction);
        return InstallWorkspaceRecommendedExtensionsAction;
    }(actions_1.Action));
    exports.InstallWorkspaceRecommendedExtensionsAction = InstallWorkspaceRecommendedExtensionsAction;
    var InstallRecommendedExtensionAction = /** @class */ (function (_super) {
        __extends(InstallRecommendedExtensionAction, _super);
        function InstallRecommendedExtensionAction(extensionId, viewletService, extensionsWorkbenchService, messageService) {
            var _this = _super.call(this, InstallRecommendedExtensionAction.ID, InstallRecommendedExtensionAction.LABEL, null) || this;
            _this.viewletService = viewletService;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.messageService = messageService;
            _this.disposables = [];
            _this.extensionId = extensionId;
            _this.extensionsWorkbenchService.onChange(function () { return _this.update(); }, _this, _this.disposables);
            return _this;
        }
        InstallRecommendedExtensionAction.prototype.update = function () {
            var _this = this;
            this.enabled = !this.extensionsWorkbenchService.local.some(function (x) { return x.id.toLowerCase() === _this.extensionId.toLowerCase(); });
        };
        InstallRecommendedExtensionAction.prototype.run = function () {
            var _this = this;
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                if (_this.extensionsWorkbenchService.local.some(function (x) { return x.id.toLowerCase() === _this.extensionId.toLowerCase(); })) {
                    _this.enabled = false;
                    _this.messageService.show(severity_1.default.Info, nls_1.localize('extensionInstalled', "The recommended extension has already been installed"));
                    viewlet.focus();
                    return winjs_base_1.TPromise.as(null);
                }
                viewlet.search('@recommended');
                viewlet.focus();
                return _this.extensionsWorkbenchService.queryGallery({ names: [_this.extensionId], source: 'install-recommendation' }).then(function (pager) {
                    return (pager && pager.firstPage && pager.firstPage.length) ? _this.extensionsWorkbenchService.install(pager.firstPage[0]) : winjs_base_1.TPromise.as(null);
                });
            });
        };
        InstallRecommendedExtensionAction.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        InstallRecommendedExtensionAction.ID = 'workbench.extensions.action.installRecommendedExtension';
        InstallRecommendedExtensionAction.LABEL = nls_1.localize('installRecommendedExtension', "Install Recommended Extension");
        InstallRecommendedExtensionAction = __decorate([
            __param(1, viewlet_2.IViewletService),
            __param(2, extensions_1.IExtensionsWorkbenchService),
            __param(3, message_1.IMessageService)
        ], InstallRecommendedExtensionAction);
        return InstallRecommendedExtensionAction;
    }(actions_1.Action));
    exports.InstallRecommendedExtensionAction = InstallRecommendedExtensionAction;
    var ShowRecommendedKeymapExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowRecommendedKeymapExtensionsAction, _super);
        function ShowRecommendedKeymapExtensionsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, null, true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        ShowRecommendedKeymapExtensionsAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('@recommended:keymaps ');
                viewlet.focus();
            });
        };
        ShowRecommendedKeymapExtensionsAction.ID = 'workbench.extensions.action.showRecommendedKeymapExtensions';
        ShowRecommendedKeymapExtensionsAction.SHORT_LABEL = nls_1.localize('showRecommendedKeymapExtensionsShort', "Keymaps");
        ShowRecommendedKeymapExtensionsAction = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], ShowRecommendedKeymapExtensionsAction);
        return ShowRecommendedKeymapExtensionsAction;
    }(actions_1.Action));
    exports.ShowRecommendedKeymapExtensionsAction = ShowRecommendedKeymapExtensionsAction;
    var ShowLanguageExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowLanguageExtensionsAction, _super);
        function ShowLanguageExtensionsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, null, true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        ShowLanguageExtensionsAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('@sort:installs category:languages ');
                viewlet.focus();
            });
        };
        ShowLanguageExtensionsAction.ID = 'workbench.extensions.action.showLanguageExtensions';
        ShowLanguageExtensionsAction.SHORT_LABEL = nls_1.localize('showLanguageExtensionsShort', "Language Extensions");
        ShowLanguageExtensionsAction = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], ShowLanguageExtensionsAction);
        return ShowLanguageExtensionsAction;
    }(actions_1.Action));
    exports.ShowLanguageExtensionsAction = ShowLanguageExtensionsAction;
    var ShowAzureExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowAzureExtensionsAction, _super);
        function ShowAzureExtensionsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, null, true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        ShowAzureExtensionsAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('@sort:installs azure ');
                viewlet.focus();
            });
        };
        ShowAzureExtensionsAction.ID = 'workbench.extensions.action.showAzureExtensions';
        ShowAzureExtensionsAction.SHORT_LABEL = nls_1.localize('showAzureExtensionsShort', "Azure Extensions");
        ShowAzureExtensionsAction = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], ShowAzureExtensionsAction);
        return ShowAzureExtensionsAction;
    }(actions_1.Action));
    exports.ShowAzureExtensionsAction = ShowAzureExtensionsAction;
    var ChangeSortAction = /** @class */ (function (_super) {
        __extends(ChangeSortAction, _super);
        function ChangeSortAction(id, label, onSearchChange, sortBy, viewletService) {
            var _this = _super.call(this, id, label, null, true) || this;
            _this.sortBy = sortBy;
            _this.viewletService = viewletService;
            _this.disposables = [];
            if (sortBy === undefined) {
                throw new Error('bad arguments');
            }
            _this.query = extensionQuery_1.Query.parse('');
            _this.enabled = false;
            onSearchChange(_this.onSearchChange, _this, _this.disposables);
            return _this;
        }
        ChangeSortAction.prototype.onSearchChange = function (value) {
            var query = extensionQuery_1.Query.parse(value);
            this.query = new extensionQuery_1.Query(query.value, this.sortBy || query.sortBy);
            this.enabled = value && this.query.isValid() && !this.query.equals(query);
        };
        ChangeSortAction.prototype.run = function () {
            var _this = this;
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search(_this.query.toString());
                viewlet.focus();
            });
        };
        ChangeSortAction = __decorate([
            __param(4, viewlet_2.IViewletService)
        ], ChangeSortAction);
        return ChangeSortAction;
    }(actions_1.Action));
    exports.ChangeSortAction = ChangeSortAction;
    var ConfigureRecommendedExtensionsCommandsContributor = /** @class */ (function (_super) {
        __extends(ConfigureRecommendedExtensionsCommandsContributor, _super);
        function ConfigureRecommendedExtensionsCommandsContributor(contextKeyService, workspaceContextService) {
            var _this = _super.call(this) || this;
            _this.workspaceContextKey = new contextkey_1.RawContextKey('workspaceRecommendations', true);
            _this.workspaceFolderContextKey = new contextkey_1.RawContextKey('workspaceFolderRecommendations', true);
            var boundWorkspaceContextKey = _this.workspaceContextKey.bindTo(contextKeyService);
            boundWorkspaceContextKey.set(workspaceContextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE);
            _this._register(workspaceContextService.onDidChangeWorkbenchState(function () { return boundWorkspaceContextKey.set(workspaceContextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE); }));
            var boundWorkspaceFolderContextKey = _this.workspaceFolderContextKey.bindTo(contextKeyService);
            boundWorkspaceFolderContextKey.set(workspaceContextService.getWorkspace().folders.length > 0);
            _this._register(workspaceContextService.onDidChangeWorkspaceFolders(function () { return boundWorkspaceFolderContextKey.set(workspaceContextService.getWorkspace().folders.length > 0); }));
            _this.registerCommands();
            return _this;
        }
        ConfigureRecommendedExtensionsCommandsContributor.prototype.registerCommands = function () {
            commands_1.CommandsRegistry.registerCommand(ConfigureWorkspaceRecommendedExtensionsAction.ID, function (serviceAccessor) {
                serviceAccessor.get(instantiation_1.IInstantiationService).createInstance(ConfigureWorkspaceRecommendedExtensionsAction, ConfigureWorkspaceRecommendedExtensionsAction.ID, ConfigureWorkspaceRecommendedExtensionsAction.LABEL).run();
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, {
                command: {
                    id: ConfigureWorkspaceRecommendedExtensionsAction.ID,
                    title: extensionManagement_1.ExtensionsLabel + ": " + ConfigureWorkspaceRecommendedExtensionsAction.LABEL,
                },
                when: this.workspaceContextKey
            });
            commands_1.CommandsRegistry.registerCommand(ConfigureWorkspaceFolderRecommendedExtensionsAction.ID, function (serviceAccessor) {
                serviceAccessor.get(instantiation_1.IInstantiationService).createInstance(ConfigureWorkspaceFolderRecommendedExtensionsAction, ConfigureWorkspaceFolderRecommendedExtensionsAction.ID, ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL).run();
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, {
                command: {
                    id: ConfigureWorkspaceFolderRecommendedExtensionsAction.ID,
                    title: extensionManagement_1.ExtensionsLabel + ": " + ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL,
                },
                when: this.workspaceFolderContextKey
            });
        };
        ConfigureRecommendedExtensionsCommandsContributor = __decorate([
            __param(0, contextkey_1.IContextKeyService),
            __param(1, workspace_1.IWorkspaceContextService)
        ], ConfigureRecommendedExtensionsCommandsContributor);
        return ConfigureRecommendedExtensionsCommandsContributor;
    }(lifecycle_1.Disposable));
    exports.ConfigureRecommendedExtensionsCommandsContributor = ConfigureRecommendedExtensionsCommandsContributor;
    var AbstractConfigureRecommendedExtensionsAction = /** @class */ (function (_super) {
        __extends(AbstractConfigureRecommendedExtensionsAction, _super);
        function AbstractConfigureRecommendedExtensionsAction(id, label, contextService, fileService, editorService, jsonEditingService, textModelResolverService) {
            var _this = _super.call(this, id, label, null) || this;
            _this.contextService = contextService;
            _this.fileService = fileService;
            _this.editorService = editorService;
            _this.jsonEditingService = jsonEditingService;
            _this.textModelResolverService = textModelResolverService;
            return _this;
        }
        AbstractConfigureRecommendedExtensionsAction.prototype.openExtensionsFile = function (extensionsFileResource) {
            var _this = this;
            return this.getOrCreateExtensionsFile(extensionsFileResource)
                .then(function (_a) {
                var created = _a.created, content = _a.content;
                return _this.getSelectionPosition(content, extensionsFileResource, ['recommendations'])
                    .then(function (selection) { return _this.editorService.openEditor({
                    resource: extensionsFileResource,
                    options: {
                        forceOpen: true,
                        pinned: created,
                        selection: selection
                    }
                }); });
            }, function (error) { return winjs_base_1.TPromise.wrapError(new Error(nls_1.localize('OpenExtensionsFile.failed', "Unable to create 'extensions.json' file inside the '.vscode' folder ({0}).", error))); });
        };
        AbstractConfigureRecommendedExtensionsAction.prototype.openWorkspaceConfigurationFile = function (workspaceConfigurationFile) {
            var _this = this;
            return this.getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile)
                .then(function (content) { return _this.getSelectionPosition(content.value, content.resource, ['extensions', 'recommendations']); })
                .then(function (selection) { return _this.editorService.openEditor({
                resource: workspaceConfigurationFile,
                options: {
                    forceOpen: true,
                    selection: selection
                }
            }); });
        };
        AbstractConfigureRecommendedExtensionsAction.prototype.getOrUpdateWorkspaceConfigurationFile = function (workspaceConfigurationFile) {
            var _this = this;
            return this.fileService.resolveContent(workspaceConfigurationFile)
                .then(function (content) {
                var workspaceRecommendations = json.parse(content.value)['extensions'];
                if (!workspaceRecommendations || !workspaceRecommendations.recommendations) {
                    return _this.jsonEditingService.write(workspaceConfigurationFile, { key: 'extensions', value: { recommendations: [] } }, true)
                        .then(function () { return _this.fileService.resolveContent(workspaceConfigurationFile); });
                }
                return content;
            });
        };
        AbstractConfigureRecommendedExtensionsAction.prototype.getSelectionPosition = function (content, resource, path) {
            var tree = json.parseTree(content);
            var node = json.findNodeAtLocation(tree, path);
            if (node && node.parent.children[1]) {
                var recommendationsValueNode = node.parent.children[1];
                var lastExtensionNode = recommendationsValueNode.children && recommendationsValueNode.children.length ? recommendationsValueNode.children[recommendationsValueNode.children.length - 1] : null;
                var offset_1 = lastExtensionNode ? lastExtensionNode.offset + lastExtensionNode.length : recommendationsValueNode.offset + 1;
                return this.textModelResolverService.createModelReference(resource)
                    .then(function (reference) {
                    var position = reference.object.textEditorModel.getPositionAt(offset_1);
                    reference.dispose();
                    return {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    };
                });
            }
            return winjs_base_1.TPromise.as(null);
        };
        AbstractConfigureRecommendedExtensionsAction.prototype.getOrCreateExtensionsFile = function (extensionsFileResource) {
            var _this = this;
            return this.fileService.resolveContent(extensionsFileResource).then(function (content) {
                return { created: false, extensionsFileResource: extensionsFileResource, content: content.value };
            }, function (err) {
                return _this.fileService.updateContent(extensionsFileResource, extensionsFileTemplate_1.ExtensionsConfigurationInitialContent).then(function () {
                    return { created: true, extensionsFileResource: extensionsFileResource, content: extensionsFileTemplate_1.ExtensionsConfigurationInitialContent };
                });
            });
        };
        AbstractConfigureRecommendedExtensionsAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, files_1.IFileService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, jsonEditing_1.IJSONEditingService),
            __param(6, resolverService_1.ITextModelService)
        ], AbstractConfigureRecommendedExtensionsAction);
        return AbstractConfigureRecommendedExtensionsAction;
    }(actions_1.Action));
    exports.AbstractConfigureRecommendedExtensionsAction = AbstractConfigureRecommendedExtensionsAction;
    var ConfigureWorkspaceRecommendedExtensionsAction = /** @class */ (function (_super) {
        __extends(ConfigureWorkspaceRecommendedExtensionsAction, _super);
        function ConfigureWorkspaceRecommendedExtensionsAction(id, label, fileService, contextService, editorService, jsonEditingService, textModelResolverService) {
            var _this = _super.call(this, id, label, contextService, fileService, editorService, jsonEditingService, textModelResolverService) || this;
            _this.disposables = [];
            _this.contextService.onDidChangeWorkbenchState(function () { return _this.update(); }, _this, _this.disposables);
            _this.update();
            return _this;
        }
        ConfigureWorkspaceRecommendedExtensionsAction.prototype.update = function () {
            this.enabled = this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY;
        };
        ConfigureWorkspaceRecommendedExtensionsAction.prototype.run = function () {
            switch (this.contextService.getWorkbenchState()) {
                case workspace_1.WorkbenchState.FOLDER:
                    return this.openExtensionsFile(this.contextService.getWorkspace().folders[0].toResource(paths.join('.vscode', 'extensions.json')));
                case workspace_1.WorkbenchState.WORKSPACE:
                    return this.openWorkspaceConfigurationFile(this.contextService.getWorkspace().configuration);
            }
            return winjs_base_1.TPromise.as(null);
        };
        ConfigureWorkspaceRecommendedExtensionsAction.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        ConfigureWorkspaceRecommendedExtensionsAction.ID = 'workbench.extensions.action.configureWorkspaceRecommendedExtensions';
        ConfigureWorkspaceRecommendedExtensionsAction.LABEL = nls_1.localize('configureWorkspaceRecommendedExtensions', "Configure Recommended Extensions (Workspace)");
        ConfigureWorkspaceRecommendedExtensionsAction = __decorate([
            __param(2, files_1.IFileService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, jsonEditing_1.IJSONEditingService),
            __param(6, resolverService_1.ITextModelService)
        ], ConfigureWorkspaceRecommendedExtensionsAction);
        return ConfigureWorkspaceRecommendedExtensionsAction;
    }(AbstractConfigureRecommendedExtensionsAction));
    exports.ConfigureWorkspaceRecommendedExtensionsAction = ConfigureWorkspaceRecommendedExtensionsAction;
    var ConfigureWorkspaceFolderRecommendedExtensionsAction = /** @class */ (function (_super) {
        __extends(ConfigureWorkspaceFolderRecommendedExtensionsAction, _super);
        function ConfigureWorkspaceFolderRecommendedExtensionsAction(id, label, fileService, contextService, editorService, jsonEditingService, textModelResolverService, commandService) {
            var _this = _super.call(this, id, label, contextService, fileService, editorService, jsonEditingService, textModelResolverService) || this;
            _this.commandService = commandService;
            _this.disposables = [];
            _this.contextService.onDidChangeWorkspaceFolders(function () { return _this.update(); }, _this, _this.disposables);
            _this.update();
            return _this;
        }
        ConfigureWorkspaceFolderRecommendedExtensionsAction.prototype.update = function () {
            this.enabled = this.contextService.getWorkspace().folders.length > 0;
        };
        ConfigureWorkspaceFolderRecommendedExtensionsAction.prototype.run = function () {
            var _this = this;
            var folderCount = this.contextService.getWorkspace().folders.length;
            var pickFolderPromise = folderCount === 1 ? winjs_base_1.TPromise.as(this.contextService.getWorkspace().folders[0]) : this.commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
            return pickFolderPromise
                .then(function (workspaceFolder) {
                if (workspaceFolder) {
                    return _this.openExtensionsFile(workspaceFolder.toResource(paths.join('.vscode', 'extensions.json')));
                }
                return null;
            });
        };
        ConfigureWorkspaceFolderRecommendedExtensionsAction.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        ConfigureWorkspaceFolderRecommendedExtensionsAction.ID = 'workbench.extensions.action.configureWorkspaceFolderRecommendedExtensions';
        ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL = nls_1.localize('configureWorkspaceFolderRecommendedExtensions', "Configure Recommended Extensions (Workspace Folder)");
        ConfigureWorkspaceFolderRecommendedExtensionsAction = __decorate([
            __param(2, files_1.IFileService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, jsonEditing_1.IJSONEditingService),
            __param(6, resolverService_1.ITextModelService),
            __param(7, commands_1.ICommandService)
        ], ConfigureWorkspaceFolderRecommendedExtensionsAction);
        return ConfigureWorkspaceFolderRecommendedExtensionsAction;
    }(AbstractConfigureRecommendedExtensionsAction));
    exports.ConfigureWorkspaceFolderRecommendedExtensionsAction = ConfigureWorkspaceFolderRecommendedExtensionsAction;
    var BuiltinStatusLabelAction = /** @class */ (function (_super) {
        __extends(BuiltinStatusLabelAction, _super);
        function BuiltinStatusLabelAction() {
            return _super.call(this, 'extensions.install', nls_1.localize('builtin', "Built-in"), '', false) || this;
        }
        Object.defineProperty(BuiltinStatusLabelAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        BuiltinStatusLabelAction.prototype.update = function () {
            if (this.extension && this.extension.type === extensionManagement_1.LocalExtensionType.System) {
                this.class = BuiltinStatusLabelAction.Class + " system";
            }
            else {
                this.class = BuiltinStatusLabelAction.Class + " user";
            }
        };
        BuiltinStatusLabelAction.prototype.run = function () {
            return winjs_base_1.TPromise.as(null);
        };
        BuiltinStatusLabelAction.Class = 'built-in-status';
        return BuiltinStatusLabelAction;
    }(actions_1.Action));
    exports.BuiltinStatusLabelAction = BuiltinStatusLabelAction;
    var MaliciousStatusLabelAction = /** @class */ (function (_super) {
        __extends(MaliciousStatusLabelAction, _super);
        function MaliciousStatusLabelAction(long) {
            var _this = this;
            var tooltip = nls_1.localize('malicious tooltip', "This extension was reported to be problematic.");
            var label = long ? tooltip : nls_1.localize('malicious', "Malicious");
            _this = _super.call(this, 'extensions.install', label, '', false) || this;
            _this.tooltip = nls_1.localize('malicious tooltip', "This extension was reported to be problematic.");
            return _this;
        }
        Object.defineProperty(MaliciousStatusLabelAction.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.update(); },
            enumerable: true,
            configurable: true
        });
        MaliciousStatusLabelAction.prototype.update = function () {
            if (this.extension && this.extension.isMalicious) {
                this.class = MaliciousStatusLabelAction.Class + " malicious";
            }
            else {
                this.class = MaliciousStatusLabelAction.Class + " not-malicious";
            }
        };
        MaliciousStatusLabelAction.prototype.run = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MaliciousStatusLabelAction.Class = 'malicious-status';
        return MaliciousStatusLabelAction;
    }(actions_1.Action));
    exports.MaliciousStatusLabelAction = MaliciousStatusLabelAction;
    var DisableAllAction = /** @class */ (function (_super) {
        __extends(DisableAllAction, _super);
        function DisableAllAction(id, label, extensionsWorkbenchService) {
            if (id === void 0) { id = DisableAllAction.ID; }
            if (label === void 0) { label = DisableAllAction.LABEL; }
            var _this = _super.call(this, id, label) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.disposables = [];
            _this.update();
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            return _this;
        }
        DisableAllAction.prototype.update = function () {
            this.enabled = this.extensionsWorkbenchService.local.some(function (e) { return e.type === extensionManagement_1.LocalExtensionType.User && (e.enablementState === extensionManagement_1.EnablementState.Enabled || e.enablementState === extensionManagement_1.EnablementState.WorkspaceEnabled); });
        };
        DisableAllAction.prototype.run = function () {
            var _this = this;
            return winjs_base_1.TPromise.join(this.extensionsWorkbenchService.local.map(function (e) { return _this.extensionsWorkbenchService.setEnablement(e, extensionManagement_1.EnablementState.Disabled); }));
        };
        DisableAllAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        DisableAllAction.ID = 'workbench.extensions.action.disableAll';
        DisableAllAction.LABEL = nls_1.localize('disableAll', "Disable All Installed Extensions");
        DisableAllAction = __decorate([
            __param(2, extensions_1.IExtensionsWorkbenchService)
        ], DisableAllAction);
        return DisableAllAction;
    }(actions_1.Action));
    exports.DisableAllAction = DisableAllAction;
    var DisableAllWorkpsaceAction = /** @class */ (function (_super) {
        __extends(DisableAllWorkpsaceAction, _super);
        function DisableAllWorkpsaceAction(id, label, workspaceContextService, extensionsWorkbenchService) {
            if (id === void 0) { id = DisableAllWorkpsaceAction.ID; }
            if (label === void 0) { label = DisableAllWorkpsaceAction.LABEL; }
            var _this = _super.call(this, id, label) || this;
            _this.workspaceContextService = workspaceContextService;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.disposables = [];
            _this.update();
            _this.workspaceContextService.onDidChangeWorkbenchState(function () { return _this.update(); }, _this, _this.disposables);
            _this.extensionsWorkbenchService.onChange(function () { return _this.update(); }, _this, _this.disposables);
            return _this;
        }
        DisableAllWorkpsaceAction.prototype.update = function () {
            this.enabled = this.workspaceContextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY && this.extensionsWorkbenchService.local.some(function (e) { return e.type === extensionManagement_1.LocalExtensionType.User && (e.enablementState === extensionManagement_1.EnablementState.Enabled || e.enablementState === extensionManagement_1.EnablementState.WorkspaceEnabled); });
        };
        DisableAllWorkpsaceAction.prototype.run = function () {
            var _this = this;
            return winjs_base_1.TPromise.join(this.extensionsWorkbenchService.local.map(function (e) { return _this.extensionsWorkbenchService.setEnablement(e, extensionManagement_1.EnablementState.WorkspaceDisabled); }));
        };
        DisableAllWorkpsaceAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        DisableAllWorkpsaceAction.ID = 'workbench.extensions.action.disableAllWorkspace';
        DisableAllWorkpsaceAction.LABEL = nls_1.localize('disableAllWorkspace', "Disable All Installed Extensions for this Workspace");
        DisableAllWorkpsaceAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, extensions_1.IExtensionsWorkbenchService)
        ], DisableAllWorkpsaceAction);
        return DisableAllWorkpsaceAction;
    }(actions_1.Action));
    exports.DisableAllWorkpsaceAction = DisableAllWorkpsaceAction;
    var EnableAllAction = /** @class */ (function (_super) {
        __extends(EnableAllAction, _super);
        function EnableAllAction(id, label, extensionsWorkbenchService, extensionEnablementService) {
            if (id === void 0) { id = EnableAllAction.ID; }
            if (label === void 0) { label = EnableAllAction.LABEL; }
            var _this = _super.call(this, id, label) || this;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.extensionEnablementService = extensionEnablementService;
            _this.disposables = [];
            _this.update();
            _this.disposables.push(_this.extensionsWorkbenchService.onChange(function () { return _this.update(); }));
            return _this;
        }
        EnableAllAction.prototype.update = function () {
            var _this = this;
            this.enabled = this.extensionsWorkbenchService.local.some(function (e) { return e.local && _this.extensionEnablementService.canChangeEnablement(e.local) && (e.enablementState === extensionManagement_1.EnablementState.Disabled || e.enablementState === extensionManagement_1.EnablementState.WorkspaceDisabled); });
        };
        EnableAllAction.prototype.run = function () {
            var _this = this;
            return winjs_base_1.TPromise.join(this.extensionsWorkbenchService.local.map(function (e) { return _this.extensionsWorkbenchService.setEnablement(e, extensionManagement_1.EnablementState.Enabled); }));
        };
        EnableAllAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        EnableAllAction.ID = 'workbench.extensions.action.enableAll';
        EnableAllAction.LABEL = nls_1.localize('enableAll', "Enable All Installed Extensions");
        EnableAllAction = __decorate([
            __param(2, extensions_1.IExtensionsWorkbenchService),
            __param(3, extensionManagement_1.IExtensionEnablementService)
        ], EnableAllAction);
        return EnableAllAction;
    }(actions_1.Action));
    exports.EnableAllAction = EnableAllAction;
    var EnableAllWorkpsaceAction = /** @class */ (function (_super) {
        __extends(EnableAllWorkpsaceAction, _super);
        function EnableAllWorkpsaceAction(id, label, workspaceContextService, extensionsWorkbenchService, extensionEnablementService) {
            if (id === void 0) { id = EnableAllWorkpsaceAction.ID; }
            if (label === void 0) { label = EnableAllWorkpsaceAction.LABEL; }
            var _this = _super.call(this, id, label) || this;
            _this.workspaceContextService = workspaceContextService;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.extensionEnablementService = extensionEnablementService;
            _this.disposables = [];
            _this.update();
            _this.extensionsWorkbenchService.onChange(function () { return _this.update(); }, _this, _this.disposables);
            _this.workspaceContextService.onDidChangeWorkbenchState(function () { return _this.update(); }, _this, _this.disposables);
            return _this;
        }
        EnableAllWorkpsaceAction.prototype.update = function () {
            var _this = this;
            this.enabled = this.workspaceContextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY && this.extensionsWorkbenchService.local.some(function (e) { return e.local && _this.extensionEnablementService.canChangeEnablement(e.local) && (e.enablementState === extensionManagement_1.EnablementState.Disabled || e.enablementState === extensionManagement_1.EnablementState.WorkspaceDisabled); });
        };
        EnableAllWorkpsaceAction.prototype.run = function () {
            var _this = this;
            return winjs_base_1.TPromise.join(this.extensionsWorkbenchService.local.map(function (e) { return _this.extensionsWorkbenchService.setEnablement(e, extensionManagement_1.EnablementState.WorkspaceEnabled); }));
        };
        EnableAllWorkpsaceAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        EnableAllWorkpsaceAction.ID = 'workbench.extensions.action.enableAllWorkspace';
        EnableAllWorkpsaceAction.LABEL = nls_1.localize('enableAllWorkspace', "Enable All Installed Extensions for this Workspace");
        EnableAllWorkpsaceAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, extensions_1.IExtensionsWorkbenchService),
            __param(4, extensionManagement_1.IExtensionEnablementService)
        ], EnableAllWorkpsaceAction);
        return EnableAllWorkpsaceAction;
    }(actions_1.Action));
    exports.EnableAllWorkpsaceAction = EnableAllWorkpsaceAction;
    commands_1.CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsForLanguage', function (accessor, fileExtension) {
        var viewletService = accessor.get(viewlet_2.IViewletService);
        return viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
            .then(function (viewlet) { return viewlet; })
            .then(function (viewlet) {
            viewlet.search("ext:" + fileExtension.replace(/^\./, ''));
            viewlet.focus();
        });
    });
    commands_1.CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsWithId', function (accessor, extensionId) {
        var viewletService = accessor.get(viewlet_2.IViewletService);
        return viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
            .then(function (viewlet) { return viewlet; })
            .then(function (viewlet) {
            viewlet.search("@id:" + extensionId);
            viewlet.focus();
        });
    });
    exports.extensionButtonProminentBackground = colorRegistry_1.registerColor('extensionButton.prominentBackground', {
        dark: '#327e36',
        light: '#327e36',
        hc: null
    }, nls_1.localize('extensionButtonProminentBackground', "Button background color for actions extension that stand out (e.g. install button)."));
    exports.extensionButtonProminentForeground = colorRegistry_1.registerColor('extensionButton.prominentForeground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hc: null
    }, nls_1.localize('extensionButtonProminentForeground', "Button foreground color for actions extension that stand out (e.g. install button)."));
    exports.extensionButtonProminentHoverBackground = colorRegistry_1.registerColor('extensionButton.prominentHoverBackground', {
        dark: '#28632b',
        light: '#28632b',
        hc: null
    }, nls_1.localize('extensionButtonProminentHoverBackground', "Button background hover color for actions extension that stand out (e.g. install button)."));
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var foregroundColor = theme.getColor(colorRegistry_1.foreground);
        if (foregroundColor) {
            collector.addRule(".monaco-action-bar .action-item .action-label.extension-action.built-in-status { border-color: " + foregroundColor + "; }");
        }
        var buttonBackgroundColor = theme.getColor(colorRegistry_1.buttonBackground);
        if (buttonBackgroundColor) {
            collector.addRule(".monaco-action-bar .action-item .action-label.extension-action { background-color: " + buttonBackgroundColor + "; }");
        }
        var buttonForegroundColor = theme.getColor(colorRegistry_1.buttonForeground);
        if (buttonForegroundColor) {
            collector.addRule(".monaco-action-bar .action-item .action-label.extension-action { color: " + buttonForegroundColor + "; }");
        }
        var buttonHoverBackgroundColor = theme.getColor(colorRegistry_1.buttonHoverBackground);
        if (buttonHoverBackgroundColor) {
            collector.addRule(".monaco-action-bar .action-item:hover .action-label.extension-action { background-color: " + buttonHoverBackgroundColor + "; }");
        }
        var contrastBorderColor = theme.getColor(colorRegistry_1.contrastBorder);
        if (contrastBorderColor) {
            collector.addRule(".monaco-action-bar .action-item .action-label.extension-action { border: 1px solid " + contrastBorderColor + "; }");
        }
        var extensionButtonProminentBackgroundColor = theme.getColor(exports.extensionButtonProminentBackground);
        if (exports.extensionButtonProminentBackground) {
            collector.addRule(".monaco-action-bar .action-item .action-label.extension-action.prominent { background-color: " + extensionButtonProminentBackgroundColor + "; }");
        }
        var extensionButtonProminentForegroundColor = theme.getColor(exports.extensionButtonProminentForeground);
        if (exports.extensionButtonProminentForeground) {
            collector.addRule(".monaco-action-bar .action-item .action-label.extension-action.prominent { color: " + extensionButtonProminentForegroundColor + "; }");
        }
        var extensionButtonProminentHoverBackgroundColor = theme.getColor(exports.extensionButtonProminentHoverBackground);
        if (exports.extensionButtonProminentHoverBackground) {
            collector.addRule(".monaco-action-bar .action-item:hover .action-label.extension-action.prominent { background-color: " + extensionButtonProminentHoverBackgroundColor + "; }");
        }
    });
});
