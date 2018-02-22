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
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/errors", "vs/base/common/types", "vs/base/common/winjs.base", "vs/base/common/arrays", "vs/base/common/objects", "vs/base/browser/dom", "vs/base/common/severity", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/group/common/groupService", "vs/platform/message/common/message", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/configuration/common/configuration", "vs/platform/windows/common/windows", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/title/common/titleService", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/browser/browser", "vs/platform/commands/common/commands", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/editor/common/editor", "vs/platform/extensions/common/extensions", "vs/workbench/services/keybinding/electron-browser/keybindingService", "vs/workbench/common/theme", "electron", "vs/workbench/services/workspace/common/workspaceEditing", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/browser/menuItemActionItem", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/lifecycle/common/lifecycle", "vs/platform/integrity/common/integrity", "vs/base/common/platform", "vs/platform/node/product"], function (require, exports, nls, uri_1, errors, types, winjs_base_1, arrays, objects, DOM, severity_1, actionbar_1, actions_1, files_1, editor_1, editorService_1, groupService_1, message_1, telemetry_1, configuration_1, windows_1, contextView_1, keybinding_1, titleService_1, workbenchThemeService_1, browser, commands_1, viewlet_1, editor_2, extensions_1, keybindingService_1, theme_1, electron_1, workspaceEditing_1, actions_2, contextkey_1, menuItemActionItem_1, async_1, lifecycle_1, configuration_2, lifecycle_2, integrity_1, platform_1, product_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextInputActions = [
        new actions_1.Action('undo', nls.localize('undo', "Undo"), null, true, function () { return document.execCommand('undo') && winjs_base_1.TPromise.as(true); }),
        new actions_1.Action('redo', nls.localize('redo', "Redo"), null, true, function () { return document.execCommand('redo') && winjs_base_1.TPromise.as(true); }),
        new actionbar_1.Separator(),
        new actions_1.Action('editor.action.clipboardCutAction', nls.localize('cut', "Cut"), null, true, function () { return document.execCommand('cut') && winjs_base_1.TPromise.as(true); }),
        new actions_1.Action('editor.action.clipboardCopyAction', nls.localize('copy', "Copy"), null, true, function () { return document.execCommand('copy') && winjs_base_1.TPromise.as(true); }),
        new actions_1.Action('editor.action.clipboardPasteAction', nls.localize('paste', "Paste"), null, true, function () { return document.execCommand('paste') && winjs_base_1.TPromise.as(true); }),
        new actionbar_1.Separator(),
        new actions_1.Action('editor.action.selectAll', nls.localize('selectAll', "Select All"), null, true, function () { return document.execCommand('selectAll') && winjs_base_1.TPromise.as(true); })
    ];
    var ElectronWindow = /** @class */ (function (_super) {
        __extends(ElectronWindow, _super);
        function ElectronWindow(shellContainer, editorService, editorGroupService, windowsService, windowService, configurationService, titleService, themeService, messageService, commandService, extensionService, viewletService, contextMenuService, keybindingService, telemetryService, workspaceEditingService, fileService, menuService, lifecycleService, integrityService) {
            var _this = _super.call(this, themeService) || this;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.windowsService = windowsService;
            _this.windowService = windowService;
            _this.configurationService = configurationService;
            _this.titleService = titleService;
            _this.themeService = themeService;
            _this.messageService = messageService;
            _this.commandService = commandService;
            _this.extensionService = extensionService;
            _this.viewletService = viewletService;
            _this.contextMenuService = contextMenuService;
            _this.keybindingService = keybindingService;
            _this.telemetryService = telemetryService;
            _this.workspaceEditingService = workspaceEditingService;
            _this.fileService = fileService;
            _this.menuService = menuService;
            _this.lifecycleService = lifecycleService;
            _this.integrityService = integrityService;
            _this.touchBarDisposables = [];
            _this.touchBarUpdater = new async_1.RunOnceScheduler(function () { return _this.doSetupTouchbar(); }, 300);
            _this.toUnbind.push(_this.touchBarUpdater);
            _this.pendingFoldersToAdd = [];
            _this.addFoldersScheduler = new async_1.RunOnceScheduler(function () { return _this.doAddFolders(); }, 100);
            _this.toUnbind.push(_this.addFoldersScheduler);
            _this.registerListeners();
            _this.create();
            return _this;
        }
        ElectronWindow.prototype.registerListeners = function () {
            var _this = this;
            // React to editor input changes
            this.toUnbind.push(this.editorGroupService.onEditorsChanged(function () {
                // Represented File Name
                var file = editor_1.toResource(_this.editorService.getActiveEditorInput(), { supportSideBySide: true, filter: 'file' });
                _this.titleService.setRepresentedFilename(file ? file.fsPath : '');
                // Touch Bar
                _this.updateTouchbarMenu();
            }));
            // prevent opening a real URL inside the shell
            [DOM.EventType.DRAG_OVER, DOM.EventType.DROP].forEach(function (event) {
                window.document.body.addEventListener(event, function (e) {
                    DOM.EventHelper.stop(e);
                });
            });
            // Support runAction event
            electron_1.ipcRenderer.on('vscode:runAction', function (_event, request) {
                var args = [];
                // If we run an action from the touchbar, we fill in the currently active resource
                // as payload because the touch bar items are context aware depending on the editor
                if (request.from === 'touchbar') {
                    var activeEditor = _this.editorService.getActiveEditor();
                    if (activeEditor) {
                        var resource = editor_1.toResource(activeEditor.input, { supportSideBySide: true });
                        if (resource) {
                            args.push(resource);
                        }
                    }
                }
                else {
                    args.push({ from: request.from }); // TODO@telemetry this is a bit weird to send this to every action?
                }
                (_a = _this.commandService).executeCommand.apply(_a, [request.id].concat(args)).done(function (_) {
                    /* __GDPR__
                        "commandExecuted" : {
                            "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                        }
                    */
                    _this.telemetryService.publicLog('commandExecuted', { id: request.id, from: request.from });
                }, function (err) {
                    _this.messageService.show(severity_1.default.Error, err);
                });
                var _a;
            });
            // Support resolve keybindings event
            electron_1.ipcRenderer.on('vscode:resolveKeybindings', function (_event, rawActionIds) {
                var actionIds = [];
                try {
                    actionIds = JSON.parse(rawActionIds);
                }
                catch (error) {
                    // should not happen
                }
                // Resolve keys using the keybinding service and send back to browser process
                _this.resolveKeybindings(actionIds).done(function (keybindings) {
                    if (keybindings.length) {
                        electron_1.ipcRenderer.send('vscode:keybindingsResolved', JSON.stringify(keybindings));
                    }
                }, function () { return errors.onUnexpectedError; });
            });
            electron_1.ipcRenderer.on('vscode:reportError', function (_event, error) {
                if (error) {
                    var errorParsed = JSON.parse(error);
                    errorParsed.mainProcess = true;
                    errors.onUnexpectedError(errorParsed);
                }
            });
            // Support openFiles event for existing and new files
            electron_1.ipcRenderer.on('vscode:openFiles', function (_event, request) { return _this.onOpenFiles(request); });
            // Support addFolders event if we have a workspace opened
            electron_1.ipcRenderer.on('vscode:addFolders', function (_event, request) { return _this.onAddFoldersRequest(request); });
            // Message support
            electron_1.ipcRenderer.on('vscode:showInfoMessage', function (_event, message) {
                _this.messageService.show(severity_1.default.Info, message);
            });
            // Support toggling auto save
            electron_1.ipcRenderer.on('vscode.toggleAutoSave', function () {
                _this.toggleAutoSave();
            });
            // Fullscreen Events
            electron_1.ipcRenderer.on('vscode:enterFullScreen', function () {
                _this.lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () {
                    browser.setFullscreen(true);
                });
            });
            electron_1.ipcRenderer.on('vscode:leaveFullScreen', function () {
                _this.lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () {
                    browser.setFullscreen(false);
                });
            });
            // High Contrast Events
            electron_1.ipcRenderer.on('vscode:enterHighContrast', function () {
                var windowConfig = _this.configurationService.getValue('window');
                if (windowConfig && windowConfig.autoDetectHighContrast) {
                    _this.lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () {
                        _this.themeService.setColorTheme(workbenchThemeService_1.VS_HC_THEME, null);
                    });
                }
            });
            electron_1.ipcRenderer.on('vscode:leaveHighContrast', function () {
                var windowConfig = _this.configurationService.getValue('window');
                if (windowConfig && windowConfig.autoDetectHighContrast) {
                    _this.lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () {
                        _this.themeService.setColorTheme(workbenchThemeService_1.VS_DARK_THEME, null);
                    });
                }
            });
            // keyboard layout changed event
            electron_1.ipcRenderer.on('vscode:keyboardLayoutChanged', function () {
                keybindingService_1.KeyboardMapperFactory.INSTANCE._onKeyboardLayoutChanged();
            });
            // keyboard layout changed event
            electron_1.ipcRenderer.on('vscode:accessibilitySupportChanged', function (_event, accessibilitySupportEnabled) {
                browser.setAccessibilitySupport(accessibilitySupportEnabled ? 2 /* Enabled */ : 1 /* Disabled */);
            });
            // Zoom level changes
            this.updateWindowZoomLevel();
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration('window.zoomLevel')) {
                    _this.updateWindowZoomLevel();
                }
            }));
            // Context menu support in input/textarea
            window.document.addEventListener('contextmenu', function (e) { return _this.onContextMenu(e); });
        };
        ElectronWindow.prototype.onContextMenu = function (e) {
            if (e.target instanceof HTMLElement) {
                var target = e.target;
                if (target.nodeName && (target.nodeName.toLowerCase() === 'input' || target.nodeName.toLowerCase() === 'textarea')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.contextMenuService.showContextMenu({
                        getAnchor: function () { return e; },
                        getActions: function () { return winjs_base_1.TPromise.as(TextInputActions); }
                    });
                }
            }
        };
        ElectronWindow.prototype.updateWindowZoomLevel = function () {
            var windowConfig = this.configurationService.getValue();
            var newZoomLevel = 0;
            if (windowConfig.window && typeof windowConfig.window.zoomLevel === 'number') {
                newZoomLevel = windowConfig.window.zoomLevel;
                // Leave early if the configured zoom level did not change (https://github.com/Microsoft/vscode/issues/1536)
                if (this.previousConfiguredZoomLevel === newZoomLevel) {
                    return;
                }
                this.previousConfiguredZoomLevel = newZoomLevel;
            }
            if (electron_1.webFrame.getZoomLevel() !== newZoomLevel) {
                electron_1.webFrame.setZoomLevel(newZoomLevel);
                browser.setZoomFactor(electron_1.webFrame.getZoomFactor());
                // See https://github.com/Microsoft/vscode/issues/26151
                // Cannot be trusted because the webFrame might take some time
                // until it really applies the new zoom level
                browser.setZoomLevel(electron_1.webFrame.getZoomLevel(), /*isTrusted*/ false);
            }
        };
        ElectronWindow.prototype.create = function () {
            var _this = this;
            // Handle window.open() calls
            var $this = this;
            window.open = function (url, target, features, replace) {
                $this.windowsService.openExternal(url);
                return null;
            };
            // Send over all extension viewlets when extensions are ready
            this.extensionService.whenInstalledExtensionsRegistered().then(function () {
                electron_1.ipcRenderer.send('vscode:extensionViewlets', JSON.stringify(_this.viewletService.getViewlets().filter(function (v) { return !!v.extensionId; }).map(function (v) { return { id: v.id, label: v.name }; })));
            });
            // Emit event when vscode has loaded
            this.lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () {
                electron_1.ipcRenderer.send('vscode:workbenchLoaded', _this.windowService.getCurrentWindowId());
            });
            // Touchbar Support
            this.updateTouchbarMenu();
            // Integrity warning
            this.integrityService.isPure().then(function (res) { return _this.titleService.updateProperties({ isPure: res.isPure }); });
            // Root warning
            this.lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () {
                var isAdminPromise;
                if (platform_1.isWindows) {
                    isAdminPromise = new Promise(function (resolve_1, reject_1) { require(['native-is-elevated'], resolve_1, reject_1); }).then(function (isElevated) { return isElevated(); });
                }
                else {
                    isAdminPromise = Promise.resolve(platform_1.isRootUser());
                }
                return isAdminPromise.then(function (isAdmin) {
                    // Update title
                    _this.titleService.updateProperties({ isAdmin: isAdmin });
                    // Show warning message (unix only)
                    if (isAdmin && !platform_1.isWindows) {
                        _this.messageService.show(severity_1.default.Warning, nls.localize('runningAsRoot', "It is not recommended to run {0} as root user.", product_1.default.nameShort));
                    }
                });
            });
        };
        ElectronWindow.prototype.updateTouchbarMenu = function () {
            var _this = this;
            if (!platform_1.isMacintosh) {
                return; // macOS only
            }
            var touchbarEnabled = this.configurationService.getValue('keyboard.touchbar.enabled');
            if (!touchbarEnabled) {
                return; // disabled via setting
            }
            // Dispose old
            this.touchBarDisposables = lifecycle_1.dispose(this.touchBarDisposables);
            // Create new
            this.touchBarMenu = this.editorGroupService.invokeWithinEditorContext(function (accessor) { return _this.menuService.createMenu(actions_2.MenuId.TouchBarContext, accessor.get(contextkey_1.IContextKeyService)); });
            this.touchBarDisposables.push(this.touchBarMenu);
            this.touchBarDisposables.push(this.touchBarMenu.onDidChange(function () {
                _this.scheduleSetupTouchbar();
            }));
            this.scheduleSetupTouchbar();
        };
        ElectronWindow.prototype.scheduleSetupTouchbar = function () {
            this.touchBarUpdater.schedule();
        };
        ElectronWindow.prototype.doSetupTouchbar = function () {
            var actions = [];
            // Fill actions into groups respecting order
            menuItemActionItem_1.fillInActions(this.touchBarMenu, void 0, actions, this.contextMenuService);
            // Convert into command action multi array
            var items = [];
            var group = [];
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                // Command
                if (action instanceof actions_2.MenuItemAction) {
                    group.push(action.item);
                }
                else if (action instanceof actionbar_1.Separator) {
                    if (group.length) {
                        items.push(group);
                    }
                    group = [];
                }
            }
            if (group.length) {
                items.push(group);
            }
            // Only update if the actions have changed
            if (!objects.equals(this.lastInstalledTouchedBar, items)) {
                this.lastInstalledTouchedBar = items;
                this.windowService.updateTouchBar(items);
            }
        };
        ElectronWindow.prototype.resolveKeybindings = function (actionIds) {
            var _this = this;
            return winjs_base_1.TPromise.join([this.lifecycleService.when(lifecycle_2.LifecyclePhase.Running), this.extensionService.whenInstalledExtensionsRegistered()]).then(function () {
                return arrays.coalesce(actionIds.map(function (id) {
                    var binding = _this.keybindingService.lookupKeybinding(id);
                    if (!binding) {
                        return null;
                    }
                    // first try to resolve a native accelerator
                    var electronAccelerator = binding.getElectronAccelerator();
                    if (electronAccelerator) {
                        return { id: id, label: electronAccelerator, isNative: true };
                    }
                    // we need this fallback to support keybindings that cannot show in electron menus (e.g. chords)
                    var acceleratorLabel = binding.getLabel();
                    if (acceleratorLabel) {
                        return { id: id, label: acceleratorLabel, isNative: false };
                    }
                    return null;
                }));
            });
        };
        ElectronWindow.prototype.onAddFoldersRequest = function (request) {
            // Buffer all pending requests
            this.pendingFoldersToAdd.push(request);
            // Delay the adding of folders a bit to buffer in case more requests are coming
            if (!this.addFoldersScheduler.isScheduled()) {
                this.addFoldersScheduler.schedule();
            }
        };
        ElectronWindow.prototype.doAddFolders = function () {
            var foldersToAdd = [];
            this.pendingFoldersToAdd.forEach(function (request) {
                foldersToAdd.push.apply(foldersToAdd, request.foldersToAdd.map(function (folderToAdd) { return ({ uri: uri_1.default.file(folderToAdd.filePath) }); }));
            });
            this.pendingFoldersToAdd = [];
            this.workspaceEditingService.addFolders(foldersToAdd).done(null, errors.onUnexpectedError);
        };
        ElectronWindow.prototype.onOpenFiles = function (request) {
            var _this = this;
            var inputs = [];
            var diffMode = (request.filesToDiff.length === 2);
            if (!diffMode && request.filesToOpen) {
                inputs.push.apply(inputs, this.toInputs(request.filesToOpen, false));
            }
            if (!diffMode && request.filesToCreate) {
                inputs.push.apply(inputs, this.toInputs(request.filesToCreate, true));
            }
            if (diffMode) {
                inputs.push.apply(inputs, this.toInputs(request.filesToDiff, false));
            }
            if (inputs.length) {
                this.openResources(inputs, diffMode).then(null, errors.onUnexpectedError);
            }
            if (request.filesToWait && inputs.length) {
                // In wait mode, listen to changes to the editors and wait until the files
                // are closed that the user wants to wait for. When this happens we delete
                // the wait marker file to signal to the outside that editing is done.
                var resourcesToWaitFor_1 = request.filesToWait.paths.map(function (p) { return uri_1.default.file(p.filePath); });
                var waitMarkerFile_1 = uri_1.default.file(request.filesToWait.waitMarkerFilePath);
                var stacks_1 = this.editorGroupService.getStacksModel();
                var unbind_1 = stacks_1.onEditorClosed(function () {
                    if (resourcesToWaitFor_1.every(function (r) { return !stacks_1.isOpen(r); })) {
                        unbind_1.dispose();
                        _this.fileService.del(waitMarkerFile_1).done(null, errors.onUnexpectedError);
                    }
                });
            }
        };
        ElectronWindow.prototype.openResources = function (resources, diffMode) {
            var _this = this;
            return this.lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () {
                // In diffMode we open 2 resources as diff
                if (diffMode && resources.length === 2) {
                    return _this.editorService.openEditor({ leftResource: resources[0].resource, rightResource: resources[1].resource, options: { pinned: true } });
                }
                // For one file, just put it into the current active editor
                if (resources.length === 1) {
                    return _this.editorService.openEditor(resources[0]);
                }
                // Otherwise open all
                var activeEditor = _this.editorService.getActiveEditor();
                return _this.editorService.openEditors(resources.map(function (r, index) {
                    return {
                        input: r,
                        position: activeEditor ? activeEditor.position : editor_2.Position.ONE
                    };
                }));
            });
        };
        ElectronWindow.prototype.toInputs = function (paths, isNew) {
            return paths.map(function (p) {
                var resource = uri_1.default.file(p.filePath);
                var input;
                if (isNew) {
                    input = { filePath: resource.fsPath, options: { pinned: true } };
                }
                else {
                    input = { resource: resource, options: { pinned: true } };
                }
                if (!isNew && p.lineNumber) {
                    input.options.selection = {
                        startLineNumber: p.lineNumber,
                        startColumn: p.columnNumber
                    };
                }
                return input;
            });
        };
        ElectronWindow.prototype.toggleAutoSave = function () {
            var setting = this.configurationService.inspect(ElectronWindow.AUTO_SAVE_SETTING);
            var userAutoSaveConfig = setting.user;
            if (types.isUndefinedOrNull(userAutoSaveConfig)) {
                userAutoSaveConfig = setting.default; // use default if setting not defined
            }
            var newAutoSaveValue;
            if ([files_1.AutoSaveConfiguration.AFTER_DELAY, files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE, files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE].some(function (s) { return s === userAutoSaveConfig; })) {
                newAutoSaveValue = files_1.AutoSaveConfiguration.OFF;
            }
            else {
                newAutoSaveValue = files_1.AutoSaveConfiguration.AFTER_DELAY;
            }
            this.configurationService.updateValue(ElectronWindow.AUTO_SAVE_SETTING, newAutoSaveValue, configuration_2.ConfigurationTarget.USER);
        };
        ElectronWindow.prototype.dispose = function () {
            this.touchBarDisposables = lifecycle_1.dispose(this.touchBarDisposables);
            _super.prototype.dispose.call(this);
        };
        ElectronWindow.AUTO_SAVE_SETTING = 'files.autoSave';
        ElectronWindow = __decorate([
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, groupService_1.IEditorGroupService),
            __param(3, windows_1.IWindowsService),
            __param(4, windows_1.IWindowService),
            __param(5, configuration_1.IWorkspaceConfigurationService),
            __param(6, titleService_1.ITitleService),
            __param(7, workbenchThemeService_1.IWorkbenchThemeService),
            __param(8, message_1.IMessageService),
            __param(9, commands_1.ICommandService),
            __param(10, extensions_1.IExtensionService),
            __param(11, viewlet_1.IViewletService),
            __param(12, contextView_1.IContextMenuService),
            __param(13, keybinding_1.IKeybindingService),
            __param(14, telemetry_1.ITelemetryService),
            __param(15, workspaceEditing_1.IWorkspaceEditingService),
            __param(16, files_1.IFileService),
            __param(17, actions_2.IMenuService),
            __param(18, lifecycle_2.ILifecycleService),
            __param(19, integrity_1.IIntegrityService)
        ], ElectronWindow);
        return ElectronWindow;
    }(theme_1.Themable));
    exports.ElectronWindow = ElectronWindow;
});
