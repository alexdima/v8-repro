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
define(["require", "exports", "vs/nls", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/message/common/message", "vs/platform/node/package", "vs/platform/node/product", "vs/base/common/uri", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/activity/common/activity", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/update/electron-browser/releaseNotesInput", "vs/platform/request/node/request", "vs/base/node/request", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/keybinding/common/keybindingIO", "vs/platform/opener/common/opener", "vs/platform/commands/common/commands", "vs/platform/storage/common/storage", "vs/platform/update/common/update", "semver", "vs/base/common/platform", "vs/platform/environment/common/environment"], function (require, exports, nls, severity_1, winjs_base_1, actions_1, lifecycle_1, actionbar_1, message_1, package_1, product_1, uri_1, editorService_1, activity_1, instantiation_1, releaseNotesInput_1, request_1, request_2, keybinding_1, keybindingIO_1, opener_1, commands_1, storage_1, update_1, semver, platform_1, environment_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var NotNowAction = new actions_1.Action('update.later', nls.localize('later', "Later"), null, true, function () { return winjs_base_1.TPromise.as(true); });
    var releaseNotesCache = Object.create(null);
    function loadReleaseNotes(accessor, version) {
        var requestService = accessor.get(request_1.IRequestService);
        var keybindingService = accessor.get(keybinding_1.IKeybindingService);
        var match = /^(\d+\.\d+)\./.exec(version);
        if (!match) {
            return winjs_base_1.TPromise.wrapError(new Error('not found'));
        }
        var versionLabel = match[1].replace(/\./g, '_');
        var baseUrl = 'https://code.visualstudio.com/raw';
        var url = baseUrl + "/v" + versionLabel + ".md";
        var unassigned = nls.localize('unassigned', "unassigned");
        var patchKeybindings = function (text) {
            var kb = function (match, kb) {
                var keybinding = keybindingService.lookupKeybinding(kb);
                if (!keybinding) {
                    return unassigned;
                }
                return keybinding.getLabel();
            };
            var kbstyle = function (match, kb) {
                var keybinding = keybindingIO_1.KeybindingIO.readKeybinding(kb, platform_1.OS);
                if (!keybinding) {
                    return unassigned;
                }
                var resolvedKeybindings = keybindingService.resolveKeybinding(keybinding);
                if (resolvedKeybindings.length === 0) {
                    return unassigned;
                }
                return resolvedKeybindings[0].getLabel();
            };
            return text
                .replace(/kb\(([a-z.\d\-]+)\)/gi, kb)
                .replace(/kbstyle\(([^\)]+)\)/gi, kbstyle);
        };
        if (!releaseNotesCache[version]) {
            releaseNotesCache[version] = requestService.request({ url: url })
                .then(request_2.asText)
                .then(function (text) { return patchKeybindings(text); });
        }
        return releaseNotesCache[version];
    }
    exports.loadReleaseNotes = loadReleaseNotes;
    var OpenLatestReleaseNotesInBrowserAction = /** @class */ (function (_super) {
        __extends(OpenLatestReleaseNotesInBrowserAction, _super);
        function OpenLatestReleaseNotesInBrowserAction(openerService) {
            var _this = _super.call(this, 'update.openLatestReleaseNotes', nls.localize('releaseNotes', "Release Notes"), null, true) || this;
            _this.openerService = openerService;
            return _this;
        }
        OpenLatestReleaseNotesInBrowserAction.prototype.run = function () {
            var uri = uri_1.default.parse(product_1.default.releaseNotesUrl);
            return this.openerService.open(uri);
        };
        OpenLatestReleaseNotesInBrowserAction = __decorate([
            __param(0, opener_1.IOpenerService)
        ], OpenLatestReleaseNotesInBrowserAction);
        return OpenLatestReleaseNotesInBrowserAction;
    }(actions_1.Action));
    exports.OpenLatestReleaseNotesInBrowserAction = OpenLatestReleaseNotesInBrowserAction;
    var AbstractShowReleaseNotesAction = /** @class */ (function (_super) {
        __extends(AbstractShowReleaseNotesAction, _super);
        function AbstractShowReleaseNotesAction(id, label, version, editorService, instantiationService) {
            var _this = _super.call(this, id, label, null, true) || this;
            _this.version = version;
            _this.editorService = editorService;
            _this.instantiationService = instantiationService;
            return _this;
        }
        AbstractShowReleaseNotesAction.prototype.run = function () {
            var _this = this;
            if (!this.enabled) {
                return winjs_base_1.TPromise.as(false);
            }
            this.enabled = false;
            return this.instantiationService.invokeFunction(loadReleaseNotes, this.version)
                .then(function (text) { return _this.editorService.openEditor(_this.instantiationService.createInstance(releaseNotesInput_1.ReleaseNotesInput, _this.version, text), { pinned: true }); })
                .then(function () { return true; })
                .then(null, function () {
                var action = _this.instantiationService.createInstance(OpenLatestReleaseNotesInBrowserAction);
                return action.run().then(function () { return false; });
            });
        };
        AbstractShowReleaseNotesAction = __decorate([
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, instantiation_1.IInstantiationService)
        ], AbstractShowReleaseNotesAction);
        return AbstractShowReleaseNotesAction;
    }(actions_1.Action));
    exports.AbstractShowReleaseNotesAction = AbstractShowReleaseNotesAction;
    var ShowReleaseNotesAction = /** @class */ (function (_super) {
        __extends(ShowReleaseNotesAction, _super);
        function ShowReleaseNotesAction(version, editorService, instantiationService) {
            return _super.call(this, 'update.showReleaseNotes', nls.localize('releaseNotes', "Release Notes"), version, editorService, instantiationService) || this;
        }
        ShowReleaseNotesAction = __decorate([
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, instantiation_1.IInstantiationService)
        ], ShowReleaseNotesAction);
        return ShowReleaseNotesAction;
    }(AbstractShowReleaseNotesAction));
    exports.ShowReleaseNotesAction = ShowReleaseNotesAction;
    var ShowCurrentReleaseNotesAction = /** @class */ (function (_super) {
        __extends(ShowCurrentReleaseNotesAction, _super);
        function ShowCurrentReleaseNotesAction(id, label, editorService, instantiationService) {
            if (id === void 0) { id = ShowCurrentReleaseNotesAction.ID; }
            if (label === void 0) { label = ShowCurrentReleaseNotesAction.LABEL; }
            return _super.call(this, id, label, package_1.default.version, editorService, instantiationService) || this;
        }
        ShowCurrentReleaseNotesAction.ID = 'update.showCurrentReleaseNotes';
        ShowCurrentReleaseNotesAction.LABEL = nls.localize('showReleaseNotes', "Show Release Notes");
        ShowCurrentReleaseNotesAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, instantiation_1.IInstantiationService)
        ], ShowCurrentReleaseNotesAction);
        return ShowCurrentReleaseNotesAction;
    }(AbstractShowReleaseNotesAction));
    exports.ShowCurrentReleaseNotesAction = ShowCurrentReleaseNotesAction;
    var LinkAction = function (id, message, licenseUrl) { return new actions_1.Action(id, message, null, true, function () { window.open(licenseUrl); return winjs_base_1.TPromise.as(null); }); };
    var ProductContribution = /** @class */ (function () {
        function ProductContribution(storageService, instantiationService, messageService, editorService, environmentService) {
            var lastVersion = storageService.get(ProductContribution.KEY, storage_1.StorageScope.GLOBAL, '');
            // was there an update? if so, open release notes
            if (!environmentService.skipReleaseNotes && product_1.default.releaseNotesUrl && lastVersion && package_1.default.version !== lastVersion) {
                instantiationService.invokeFunction(loadReleaseNotes, package_1.default.version).then(function (text) { return editorService.openEditor(instantiationService.createInstance(releaseNotesInput_1.ReleaseNotesInput, package_1.default.version, text), { pinned: true }); }, function () {
                    messageService.show(message_1.Severity.Info, {
                        message: nls.localize('read the release notes', "Welcome to {0} v{1}! Would you like to read the Release Notes?", product_1.default.nameLong, package_1.default.version),
                        actions: [
                            instantiationService.createInstance(OpenLatestReleaseNotesInBrowserAction),
                            message_1.CloseAction
                        ]
                    });
                });
            }
            // should we show the new license?
            if (product_1.default.licenseUrl && lastVersion && semver.satisfies(lastVersion, '<1.0.0') && semver.satisfies(package_1.default.version, '>=1.0.0')) {
                messageService.show(message_1.Severity.Info, {
                    message: nls.localize('licenseChanged', "Our license terms have changed, please go through them.", product_1.default.nameLong, package_1.default.version),
                    actions: [
                        LinkAction('update.showLicense', nls.localize('license', "Read License"), product_1.default.licenseUrl),
                        message_1.CloseAction
                    ]
                });
            }
            storageService.store(ProductContribution.KEY, package_1.default.version, storage_1.StorageScope.GLOBAL);
        }
        ProductContribution.KEY = 'releaseNotes/lastVersion';
        ProductContribution = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, message_1.IMessageService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, environment_1.IEnvironmentService)
        ], ProductContribution);
        return ProductContribution;
    }());
    exports.ProductContribution = ProductContribution;
    var NeverShowAgain = /** @class */ (function () {
        function NeverShowAgain(key, storageService) {
            var _this = this;
            this.storageService = storageService;
            this.action = new actions_1.Action("neverShowAgain:" + this.key, nls.localize('neveragain', "Don't Show Again"), undefined, true, function () {
                return winjs_base_1.TPromise.wrap(_this.storageService.store(_this.key, true, storage_1.StorageScope.GLOBAL));
            });
            this.key = "neverShowAgain:" + key;
        }
        NeverShowAgain.prototype.shouldShow = function () {
            return !this.storageService.getBoolean(this.key, storage_1.StorageScope.GLOBAL, false);
        };
        NeverShowAgain = __decorate([
            __param(1, storage_1.IStorageService)
        ], NeverShowAgain);
        return NeverShowAgain;
    }());
    var Win3264BitContribution = /** @class */ (function () {
        function Win3264BitContribution(storageService, instantiationService, messageService, editorService, environmentService) {
            if (environmentService.disableUpdates) {
                return;
            }
            var neverShowAgain = new NeverShowAgain(Win3264BitContribution.KEY, storageService);
            if (!neverShowAgain.shouldShow()) {
                return;
            }
            var url = product_1.default.quality === 'insider'
                ? Win3264BitContribution.INSIDER_URL
                : Win3264BitContribution.URL;
            messageService.show(message_1.Severity.Info, {
                message: nls.localize('64bitisavailable', "{0} for 64-bit Windows is now available!", product_1.default.nameShort),
                actions: [
                    LinkAction('update.show64bitreleasenotes', nls.localize('learn more', "Learn More"), url),
                    neverShowAgain.action,
                    message_1.CloseAction
                ]
            });
        }
        Win3264BitContribution.KEY = 'update/win32-64bits';
        Win3264BitContribution.URL = 'https://code.visualstudio.com/updates/v1_15#_windows-64-bit';
        Win3264BitContribution.INSIDER_URL = 'https://github.com/Microsoft/vscode-docs/blob/vnext/release-notes/v1_15.md#windows-64-bit';
        Win3264BitContribution = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, message_1.IMessageService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, environment_1.IEnvironmentService)
        ], Win3264BitContribution);
        return Win3264BitContribution;
    }());
    exports.Win3264BitContribution = Win3264BitContribution;
    var CommandAction = /** @class */ (function (_super) {
        __extends(CommandAction, _super);
        function CommandAction(commandId, label, commandService) {
            return _super.call(this, "command-action:" + commandId, label, undefined, true, function () { return commandService.executeCommand(commandId); }) || this;
        }
        CommandAction = __decorate([
            __param(2, commands_1.ICommandService)
        ], CommandAction);
        return CommandAction;
    }(actions_1.Action));
    var UpdateContribution = /** @class */ (function () {
        function UpdateContribution(storageService, commandService, instantiationService, messageService, updateService, editorService, activityService) {
            this.storageService = storageService;
            this.commandService = commandService;
            this.instantiationService = instantiationService;
            this.messageService = messageService;
            this.updateService = updateService;
            this.activityService = activityService;
            this.badgeDisposable = lifecycle_1.empty;
            this.disposables = [];
            this.state = updateService.state;
            updateService.onStateChange(this.onUpdateStateChange, this, this.disposables);
            this.onUpdateStateChange(this.updateService.state);
            /*
            The `update/lastKnownVersion` and `update/updateNotificationTime` storage keys are used in
            combination to figure out when to show a message to the user that he should update.
    
            This message should appear if the user has received an update notification but hasn't
            updated since 5 days.
            */
            var currentVersion = product_1.default.commit;
            var lastKnownVersion = this.storageService.get('update/lastKnownVersion', storage_1.StorageScope.GLOBAL);
            // if current version != stored version, clear both fields
            if (currentVersion !== lastKnownVersion) {
                this.storageService.remove('update/lastKnownVersion', storage_1.StorageScope.GLOBAL);
                this.storageService.remove('update/updateNotificationTime', storage_1.StorageScope.GLOBAL);
            }
        }
        Object.defineProperty(UpdateContribution.prototype, "id", {
            get: function () { return 'vs.update'; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UpdateContribution.prototype, "name", {
            get: function () { return ''; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UpdateContribution.prototype, "cssClass", {
            get: function () { return 'update-activity'; },
            enumerable: true,
            configurable: true
        });
        UpdateContribution.prototype.onUpdateStateChange = function (state) {
            switch (state.type) {
                case update_1.StateType.Idle:
                    if (this.state.type === update_1.StateType.CheckingForUpdates && this.state.explicit) {
                        this.onUpdateNotAvailable();
                    }
                    break;
                case update_1.StateType.AvailableForDownload:
                    this.onUpdateAvailable(state.update);
                    break;
                case update_1.StateType.Downloaded:
                    this.onUpdateDownloaded(state.update);
                    break;
                case update_1.StateType.Updating:
                    this.onUpdateUpdating(state.update);
                    break;
                case update_1.StateType.Ready:
                    this.onUpdateReady(state.update);
                    break;
            }
            var badge = undefined;
            var clazz;
            if (state.type === update_1.StateType.AvailableForDownload || state.type === update_1.StateType.Downloaded || state.type === update_1.StateType.Ready) {
                badge = new activity_1.NumberBadge(1, function () { return nls.localize('updateIsReady', "New {0} update available.", product_1.default.nameShort); });
            }
            else if (state.type === update_1.StateType.CheckingForUpdates || state.type === update_1.StateType.Downloading || state.type === update_1.StateType.Updating) {
                badge = new activity_1.ProgressBadge(function () { return nls.localize('updateIsReady', "New {0} update available.", product_1.default.nameShort); });
                clazz = 'progress-badge';
            }
            this.badgeDisposable.dispose();
            if (badge) {
                this.badgeDisposable = this.activityService.showActivity(this.id, badge, clazz);
            }
            this.state = state;
        };
        UpdateContribution.prototype.onUpdateNotAvailable = function () {
            this.messageService.show(severity_1.default.Info, nls.localize('noUpdatesAvailable', "There are no updates currently available."));
        };
        // linux
        UpdateContribution.prototype.onUpdateAvailable = function (update) {
            var _this = this;
            if (!this.shouldShowNotification()) {
                return;
            }
            var releaseNotesAction = this.instantiationService.createInstance(ShowReleaseNotesAction, update.productVersion);
            var downloadAction = new actions_1.Action('update.downloadNow', nls.localize('download now', "Download Now"), null, true, function () {
                return _this.updateService.downloadUpdate();
            });
            this.messageService.show(severity_1.default.Info, {
                message: nls.localize('thereIsUpdateAvailable', "There is an available update."),
                actions: [downloadAction, NotNowAction, releaseNotesAction]
            });
        };
        // windows fast updates
        UpdateContribution.prototype.onUpdateDownloaded = function (update) {
            var _this = this;
            if (!this.shouldShowNotification()) {
                return;
            }
            var releaseNotesAction = this.instantiationService.createInstance(ShowReleaseNotesAction, update.productVersion);
            var installUpdateAction = new actions_1.Action('update.applyUpdate', nls.localize('installUpdate', "Install Update"), undefined, true, function () {
                return _this.updateService.applyUpdate();
            });
            this.messageService.show(severity_1.default.Info, {
                message: nls.localize('updateAvailable', "There's an available update: {0} {1}", product_1.default.nameLong, update.productVersion),
                actions: [installUpdateAction, NotNowAction, releaseNotesAction]
            });
        };
        // windows fast updates
        UpdateContribution.prototype.onUpdateUpdating = function (update) {
            var neverShowAgain = new NeverShowAgain('update/win32-fast-updates', this.storageService);
            if (!neverShowAgain.shouldShow()) {
                return;
            }
            this.messageService.show(severity_1.default.Info, {
                message: nls.localize('updateInstalling', "{0} {1} is being installed in the background, we'll let you know when it's done.", product_1.default.nameLong, update.productVersion),
                actions: [neverShowAgain.action, message_1.CloseAction]
            });
        };
        // windows and mac
        UpdateContribution.prototype.onUpdateReady = function (update) {
            var _this = this;
            if (!this.shouldShowNotification()) {
                return;
            }
            var releaseNotesAction = this.instantiationService.createInstance(ShowReleaseNotesAction, update.productVersion);
            var applyUpdateAction = new actions_1.Action('update.applyUpdate', nls.localize('updateNow', "Update Now"), undefined, true, function () {
                return _this.updateService.quitAndInstall();
            });
            this.messageService.show(severity_1.default.Info, {
                message: nls.localize('updateAvailableAfterRestart', "{0} will be updated after it restarts.", product_1.default.nameLong),
                actions: [applyUpdateAction, NotNowAction, releaseNotesAction]
            });
        };
        UpdateContribution.prototype.shouldShowNotification = function () {
            var currentVersion = product_1.default.commit;
            var currentMillis = new Date().getTime();
            var lastKnownVersion = this.storageService.get('update/lastKnownVersion', storage_1.StorageScope.GLOBAL);
            // if version != stored version, save version and date
            if (currentVersion !== lastKnownVersion) {
                this.storageService.store('update/lastKnownVersion', currentVersion, storage_1.StorageScope.GLOBAL);
                this.storageService.store('update/updateNotificationTime', currentMillis, storage_1.StorageScope.GLOBAL);
            }
            var updateNotificationMillis = this.storageService.getInteger('update/updateNotificationTime', storage_1.StorageScope.GLOBAL, currentMillis);
            var diffDays = (currentMillis - updateNotificationMillis) / (1000 * 60 * 60 * 24);
            return diffDays > 5;
        };
        UpdateContribution.prototype.getActions = function () {
            var result = [
                new CommandAction(UpdateContribution.showCommandsId, nls.localize('commandPalette', "Command Palette..."), this.commandService),
                new actionbar_1.Separator(),
                new CommandAction(UpdateContribution.openSettingsId, nls.localize('settings', "Settings"), this.commandService),
                new CommandAction(UpdateContribution.openKeybindingsId, nls.localize('keyboardShortcuts', "Keyboard Shortcuts"), this.commandService),
                new CommandAction(UpdateContribution.showExtensionsId, nls.localize('showExtensions', "Manage Extensions"), this.commandService),
                new actionbar_1.Separator(),
                new CommandAction(UpdateContribution.openUserSnippets, nls.localize('userSnippets', "User Snippets"), this.commandService),
                new actionbar_1.Separator(),
                new CommandAction(UpdateContribution.selectColorThemeId, nls.localize('selectTheme.label', "Color Theme"), this.commandService),
                new CommandAction(UpdateContribution.selectIconThemeId, nls.localize('themes.selectIconTheme.label', "File Icon Theme"), this.commandService)
            ];
            var updateAction = this.getUpdateAction();
            if (updateAction) {
                result.push(new actionbar_1.Separator(), updateAction);
            }
            return result;
        };
        UpdateContribution.prototype.getUpdateAction = function () {
            var _this = this;
            var state = this.updateService.state;
            switch (state.type) {
                case update_1.StateType.Uninitialized:
                    return null;
                case update_1.StateType.Idle:
                    return new actions_1.Action('update.check', nls.localize('checkForUpdates', "Check for Updates..."), undefined, true, function () {
                        return _this.updateService.checkForUpdates(true);
                    });
                case update_1.StateType.CheckingForUpdates:
                    return new actions_1.Action('update.checking', nls.localize('checkingForUpdates', "Checking For Updates..."), undefined, false);
                case update_1.StateType.AvailableForDownload:
                    return new actions_1.Action('update.downloadNow', nls.localize('download now', "Download Now"), null, true, function () {
                        return _this.updateService.downloadUpdate();
                    });
                case update_1.StateType.Downloading:
                    return new actions_1.Action('update.downloading', nls.localize('DownloadingUpdate', "Downloading Update..."), undefined, false);
                case update_1.StateType.Downloaded:
                    return new actions_1.Action('update.install', nls.localize('installUpdate...', "Install Update..."), undefined, true, function () {
                        return _this.updateService.applyUpdate();
                    });
                case update_1.StateType.Updating:
                    return new actions_1.Action('update.updating', nls.localize('installingUpdate', "Installing Update..."), undefined, false);
                case update_1.StateType.Ready:
                    return new actions_1.Action('update.restart', nls.localize('restartToUpdate', "Restart to Update..."), undefined, true, function () {
                        return _this.updateService.quitAndInstall();
                    });
            }
        };
        UpdateContribution.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        UpdateContribution.showCommandsId = 'workbench.action.showCommands';
        UpdateContribution.openSettingsId = 'workbench.action.openGlobalSettings';
        UpdateContribution.openKeybindingsId = 'workbench.action.openGlobalKeybindings';
        UpdateContribution.openUserSnippets = 'workbench.action.openSnippets';
        UpdateContribution.selectColorThemeId = 'workbench.action.selectTheme';
        UpdateContribution.selectIconThemeId = 'workbench.action.selectIconTheme';
        UpdateContribution.showExtensionsId = 'workbench.view.extensions';
        UpdateContribution = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, commands_1.ICommandService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, message_1.IMessageService),
            __param(4, update_1.IUpdateService),
            __param(5, editorService_1.IWorkbenchEditorService),
            __param(6, activity_1.IActivityService)
        ], UpdateContribution);
        return UpdateContribution;
    }());
    exports.UpdateContribution = UpdateContribution;
});
