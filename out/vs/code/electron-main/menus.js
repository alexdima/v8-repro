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
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/base/common/arrays", "vs/platform/environment/common/environment", "electron", "vs/platform/windows/common/windows", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/node/product", "vs/base/common/async", "vs/platform/instantiation/common/instantiation", "vs/base/common/labels", "vs/code/electron-main/keyboard", "vs/platform/windows/electron-main/windows", "vs/platform/history/common/history", "vs/platform/workspaces/common/workspaces"], function (require, exports, nls, platform_1, arrays, environment_1, electron_1, windows_1, configuration_1, files_1, telemetry_1, update_1, product_1, async_1, instantiation_1, labels_1, keyboard_1, windows_2, history_1, workspaces_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var telemetryFrom = 'menu';
    var CodeMenu = /** @class */ (function () {
        function CodeMenu(updateService, instantiationService, configurationService, windowsMainService, windowsService, environmentService, telemetryService, historyMainService) {
            var _this = this;
            this.updateService = updateService;
            this.configurationService = configurationService;
            this.windowsMainService = windowsMainService;
            this.windowsService = windowsService;
            this.environmentService = environmentService;
            this.telemetryService = telemetryService;
            this.historyMainService = historyMainService;
            this.keys = [
                'files.autoSave',
                'editor.multiCursorModifier',
                'workbench.sideBar.location',
                'workbench.statusBar.visible',
                'workbench.activityBar.visible',
                'window.enableMenuBarMnemonics',
                'window.nativeTabs'
            ];
            this.extensionViewlets = [];
            this.nativeTabMenuItems = [];
            this.menuUpdater = new async_1.RunOnceScheduler(function () { return _this.doUpdateMenu(); }, 0);
            this.keybindingsResolver = instantiationService.createInstance(keyboard_1.KeybindingsResolver);
            this.install();
            this.registerListeners();
        }
        CodeMenu.prototype.registerListeners = function () {
            var _this = this;
            // Keep flag when app quits
            electron_1.app.on('will-quit', function () {
                _this.isQuitting = true;
            });
            // Listen to some events from window service to update menu
            this.historyMainService.onRecentlyOpenedChange(function () { return _this.updateMenu(); });
            this.windowsMainService.onWindowsCountChanged(function (e) { return _this.onWindowsCountChanged(e); });
            this.windowsMainService.onActiveWindowChanged(function () { return _this.updateWorkspaceMenuItems(); });
            this.windowsMainService.onWindowReady(function () { return _this.updateWorkspaceMenuItems(); });
            this.windowsMainService.onWindowClose(function () { return _this.updateWorkspaceMenuItems(); });
            // Listen to extension viewlets
            electron_1.ipcMain.on('vscode:extensionViewlets', function (_event, rawExtensionViewlets) {
                var extensionViewlets = [];
                try {
                    extensionViewlets = JSON.parse(rawExtensionViewlets);
                }
                catch (error) {
                    // Should not happen
                }
                if (extensionViewlets.length) {
                    _this.extensionViewlets = extensionViewlets;
                    _this.updateMenu();
                }
            });
            // Update when auto save config changes
            this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationUpdated(e); });
            // Listen to update service
            this.updateService.onStateChange(function () { return _this.updateMenu(); });
            // Listen to keybindings change
            this.keybindingsResolver.onKeybindingsChanged(function () { return _this.updateMenu(); });
        };
        CodeMenu.prototype.onConfigurationUpdated = function (event) {
            if (this.keys.some(function (key) { return event.affectsConfiguration(key); })) {
                this.updateMenu();
            }
        };
        Object.defineProperty(CodeMenu.prototype, "currentAutoSaveSetting", {
            get: function () {
                return this.configurationService.getValue('files.autoSave');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeMenu.prototype, "currentMultiCursorModifierSetting", {
            get: function () {
                return this.configurationService.getValue('editor.multiCursorModifier');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeMenu.prototype, "currentSidebarLocation", {
            get: function () {
                return this.configurationService.getValue('workbench.sideBar.location') || 'left';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeMenu.prototype, "currentStatusbarVisible", {
            get: function () {
                var statusbarVisible = this.configurationService.getValue('workbench.statusBar.visible');
                if (typeof statusbarVisible !== 'boolean') {
                    statusbarVisible = true;
                }
                return statusbarVisible;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeMenu.prototype, "currentActivityBarVisible", {
            get: function () {
                var activityBarVisible = this.configurationService.getValue('workbench.activityBar.visible');
                if (typeof activityBarVisible !== 'boolean') {
                    activityBarVisible = true;
                }
                return activityBarVisible;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeMenu.prototype, "currentEnableMenuBarMnemonics", {
            get: function () {
                var enableMenuBarMnemonics = this.configurationService.getValue('window.enableMenuBarMnemonics');
                if (typeof enableMenuBarMnemonics !== 'boolean') {
                    enableMenuBarMnemonics = true;
                }
                return enableMenuBarMnemonics;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeMenu.prototype, "currentEnableNativeTabs", {
            get: function () {
                var enableNativeTabs = this.configurationService.getValue('window.nativeTabs');
                if (typeof enableNativeTabs !== 'boolean') {
                    enableNativeTabs = false;
                }
                return enableNativeTabs;
            },
            enumerable: true,
            configurable: true
        });
        CodeMenu.prototype.updateMenu = function () {
            this.menuUpdater.schedule(); // buffer multiple attempts to update the menu
        };
        CodeMenu.prototype.doUpdateMenu = function () {
            var _this = this;
            // Due to limitations in Electron, it is not possible to update menu items dynamically. The suggested
            // workaround from Electron is to set the application menu again.
            // See also https://github.com/electron/electron/issues/846
            //
            // Run delayed to prevent updating menu while it is open
            if (!this.isQuitting) {
                setTimeout(function () {
                    if (!_this.isQuitting) {
                        _this.install();
                    }
                }, 10 /* delay this because there is an issue with updating a menu when it is open */);
            }
        };
        CodeMenu.prototype.onWindowsCountChanged = function (e) {
            if (!platform_1.isMacintosh) {
                return;
            }
            // Update menu if window count goes from N > 0 or 0 > N to update menu item enablement
            if ((e.oldCount === 0 && e.newCount > 0) || (e.oldCount > 0 && e.newCount === 0)) {
                this.updateMenu();
            }
            else if (this.currentEnableNativeTabs) {
                this.nativeTabMenuItems.forEach(function (item) {
                    if (item) {
                        item.enabled = e.newCount > 1;
                    }
                });
            }
        };
        CodeMenu.prototype.updateWorkspaceMenuItems = function () {
            var window = this.windowsMainService.getLastActiveWindow();
            var isInWorkspaceContext = window && !!window.openedWorkspace;
            var isInFolderContext = window && !!window.openedFolderPath;
            this.closeWorkspace.visible = isInWorkspaceContext;
            this.closeFolder.visible = !isInWorkspaceContext;
            this.closeFolder.enabled = isInFolderContext || platform_1.isLinux /* https://github.com/Microsoft/vscode/issues/36431 */;
        };
        CodeMenu.prototype.install = function () {
            var _this = this;
            // Menus
            var menubar = new electron_1.Menu();
            // Mac: Application
            var macApplicationMenuItem;
            if (platform_1.isMacintosh) {
                var applicationMenu = new electron_1.Menu();
                macApplicationMenuItem = new electron_1.MenuItem({ label: product_1.default.nameShort, submenu: applicationMenu });
                this.setMacApplicationMenu(applicationMenu);
            }
            // File
            var fileMenu = new electron_1.Menu();
            var fileMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mFile', comment: ['&& denotes a mnemonic'] }, "&&File")), submenu: fileMenu });
            this.setFileMenu(fileMenu);
            // Edit
            var editMenu = new electron_1.Menu();
            var editMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mEdit', comment: ['&& denotes a mnemonic'] }, "&&Edit")), submenu: editMenu });
            this.setEditMenu(editMenu);
            // Selection
            var selectionMenu = new electron_1.Menu();
            var selectionMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mSelection', comment: ['&& denotes a mnemonic'] }, "&&Selection")), submenu: selectionMenu });
            this.setSelectionMenu(selectionMenu);
            // View
            var viewMenu = new electron_1.Menu();
            var viewMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mView', comment: ['&& denotes a mnemonic'] }, "&&View")), submenu: viewMenu });
            this.setViewMenu(viewMenu);
            // Goto
            var gotoMenu = new electron_1.Menu();
            var gotoMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mGoto', comment: ['&& denotes a mnemonic'] }, "&&Go")), submenu: gotoMenu });
            this.setGotoMenu(gotoMenu);
            // Debug
            var debugMenu = new electron_1.Menu();
            var debugMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mDebug', comment: ['&& denotes a mnemonic'] }, "&&Debug")), submenu: debugMenu });
            this.setDebugMenu(debugMenu);
            // Mac: Window
            var macWindowMenuItem;
            if (platform_1.isMacintosh) {
                var windowMenu = new electron_1.Menu();
                macWindowMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize('mWindow', "Window")), submenu: windowMenu, role: 'window' });
                this.setMacWindowMenu(windowMenu);
            }
            // Help
            var helpMenu = new electron_1.Menu();
            var helpMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mHelp', comment: ['&& denotes a mnemonic'] }, "&&Help")), submenu: helpMenu, role: 'help' });
            this.setHelpMenu(helpMenu);
            // Tasks
            var taskMenu = new electron_1.Menu();
            var taskMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mTask', comment: ['&& denotes a mnemonic'] }, "&&Tasks")), submenu: taskMenu });
            this.setTaskMenu(taskMenu);
            // Menu Structure
            if (macApplicationMenuItem) {
                menubar.append(macApplicationMenuItem);
            }
            menubar.append(fileMenuItem);
            menubar.append(editMenuItem);
            menubar.append(selectionMenuItem);
            menubar.append(viewMenuItem);
            menubar.append(gotoMenuItem);
            menubar.append(debugMenuItem);
            menubar.append(taskMenuItem);
            if (macWindowMenuItem) {
                menubar.append(macWindowMenuItem);
            }
            menubar.append(helpMenuItem);
            electron_1.Menu.setApplicationMenu(menubar);
            // Dock Menu
            if (platform_1.isMacintosh && !this.appMenuInstalled) {
                this.appMenuInstalled = true;
                var dockMenu = new electron_1.Menu();
                dockMenu.append(new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miNewWindow', comment: ['&& denotes a mnemonic'] }, "New &&Window")), click: function () { return _this.windowsMainService.openNewWindow(windows_1.OpenContext.DOCK); } }));
                electron_1.app.dock.setMenu(dockMenu);
            }
        };
        CodeMenu.prototype.setMacApplicationMenu = function (macApplicationMenu) {
            var _this = this;
            var about = new electron_1.MenuItem({ label: nls.localize('mAbout', "About {0}", product_1.default.nameLong), role: 'about' });
            var checkForUpdates = this.getUpdateMenuItems();
            var preferences = this.getPreferencesMenu();
            var servicesMenu = new electron_1.Menu();
            var services = new electron_1.MenuItem({ label: nls.localize('mServices', "Services"), role: 'services', submenu: servicesMenu });
            var hide = new electron_1.MenuItem({ label: nls.localize('mHide', "Hide {0}", product_1.default.nameLong), role: 'hide', accelerator: 'Command+H' });
            var hideOthers = new electron_1.MenuItem({ label: nls.localize('mHideOthers', "Hide Others"), role: 'hideothers', accelerator: 'Command+Alt+H' });
            var showAll = new electron_1.MenuItem({ label: nls.localize('mShowAll', "Show All"), role: 'unhide' });
            var quit = new electron_1.MenuItem(this.likeAction('workbench.action.quit', {
                label: nls.localize('miQuit', "Quit {0}", product_1.default.nameLong), click: function () {
                    if (_this.windowsMainService.getWindowCount() === 0 || !!electron_1.BrowserWindow.getFocusedWindow()) {
                        _this.windowsMainService.quit(); // fix for https://github.com/Microsoft/vscode/issues/39191
                    }
                }
            }));
            var actions = [about];
            actions.push.apply(actions, checkForUpdates);
            actions.push.apply(actions, [
                __separator__(),
                preferences,
                __separator__(),
                services,
                __separator__(),
                hide,
                hideOthers,
                showAll,
                __separator__(),
                quit
            ]);
            actions.forEach(function (i) { return macApplicationMenu.append(i); });
        };
        CodeMenu.prototype.setFileMenu = function (fileMenu) {
            var _this = this;
            var hasNoWindows = (this.windowsMainService.getWindowCount() === 0);
            var newFile;
            if (hasNoWindows) {
                newFile = new electron_1.MenuItem(this.likeAction('workbench.action.files.newUntitledFile', { label: this.mnemonicLabel(nls.localize({ key: 'miNewFile', comment: ['&& denotes a mnemonic'] }, "&&New File")), click: function () { return _this.windowsMainService.openNewWindow(windows_1.OpenContext.MENU); } }));
            }
            else {
                newFile = this.createMenuItem(nls.localize({ key: 'miNewFile', comment: ['&& denotes a mnemonic'] }, "&&New File"), 'workbench.action.files.newUntitledFile');
            }
            var open;
            if (hasNoWindows) {
                open = new electron_1.MenuItem(this.likeAction('workbench.action.files.openFileFolder', { label: this.mnemonicLabel(nls.localize({ key: 'miOpen', comment: ['&& denotes a mnemonic'] }, "&&Open...")), click: function (menuItem, win, event) { return _this.windowsMainService.pickFileFolderAndOpen({ forceNewWindow: _this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } }); } }));
            }
            else {
                open = this.createMenuItem(nls.localize({ key: 'miOpen', comment: ['&& denotes a mnemonic'] }, "&&Open..."), ['workbench.action.files.openFileFolder', 'workbench.action.files.openFileFolderInNewWindow']);
            }
            var openWorkspace;
            if (hasNoWindows) {
                openWorkspace = new electron_1.MenuItem(this.likeAction('workbench.action.openWorkspace', { label: this.mnemonicLabel(nls.localize({ key: 'miOpenWorkspace', comment: ['&& denotes a mnemonic'] }, "Open Wor&&kspace...")), click: function (menuItem, win, event) { return _this.windowsMainService.pickWorkspaceAndOpen({ forceNewWindow: _this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } }); } }));
            }
            else {
                openWorkspace = this.createMenuItem(nls.localize({ key: 'miOpenWorkspace', comment: ['&& denotes a mnemonic'] }, "Open Wor&&kspace..."), ['workbench.action.openWorkspace', 'workbench.action.openWorkspaceInNewWindow']);
            }
            var openFolder;
            if (hasNoWindows) {
                openFolder = new electron_1.MenuItem(this.likeAction('workbench.action.files.openFolder', { label: this.mnemonicLabel(nls.localize({ key: 'miOpenFolder', comment: ['&& denotes a mnemonic'] }, "Open &&Folder...")), click: function (menuItem, win, event) { return _this.windowsMainService.pickFolderAndOpen({ forceNewWindow: _this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } }); } }));
            }
            else {
                openFolder = this.createMenuItem(nls.localize({ key: 'miOpenFolder', comment: ['&& denotes a mnemonic'] }, "Open &&Folder..."), ['workbench.action.files.openFolder', 'workbench.action.files.openFolderInNewWindow']);
            }
            var openFile;
            if (hasNoWindows) {
                openFile = new electron_1.MenuItem(this.likeAction('workbench.action.files.openFile', { label: this.mnemonicLabel(nls.localize({ key: 'miOpenFile', comment: ['&& denotes a mnemonic'] }, "&&Open File...")), click: function (menuItem, win, event) { return _this.windowsMainService.pickFileAndOpen({ forceNewWindow: _this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } }); } }));
            }
            else {
                openFile = this.createMenuItem(nls.localize({ key: 'miOpenFile', comment: ['&& denotes a mnemonic'] }, "&&Open File..."), ['workbench.action.files.openFile', 'workbench.action.files.openFileInNewWindow']);
            }
            var openRecentMenu = new electron_1.Menu();
            this.setOpenRecentMenu(openRecentMenu);
            var openRecent = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miOpenRecent', comment: ['&& denotes a mnemonic'] }, "Open &&Recent")), submenu: openRecentMenu, enabled: openRecentMenu.items.length > 0 });
            var saveWorkspaceAs = this.createMenuItem(nls.localize('miSaveWorkspaceAs', "Save Workspace As..."), 'workbench.action.saveWorkspaceAs');
            var addFolder = this.createMenuItem(nls.localize({ key: 'miAddFolderToWorkspace', comment: ['&& denotes a mnemonic'] }, "A&&dd Folder to Workspace..."), 'workbench.action.addRootFolder');
            var saveFile = this.createMenuItem(nls.localize({ key: 'miSave', comment: ['&& denotes a mnemonic'] }, "&&Save"), 'workbench.action.files.save');
            var saveFileAs = this.createMenuItem(nls.localize({ key: 'miSaveAs', comment: ['&& denotes a mnemonic'] }, "Save &&As..."), 'workbench.action.files.saveAs');
            var saveAllFiles = this.createMenuItem(nls.localize({ key: 'miSaveAll', comment: ['&& denotes a mnemonic'] }, "Save A&&ll"), 'workbench.action.files.saveAll');
            var autoSaveEnabled = [files_1.AutoSaveConfiguration.AFTER_DELAY, files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE, files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE].some(function (s) { return _this.currentAutoSaveSetting === s; });
            var autoSave = new electron_1.MenuItem(this.likeAction('vscode.toggleAutoSave', { label: this.mnemonicLabel(nls.localize('miAutoSave', "Auto Save")), type: 'checkbox', checked: autoSaveEnabled, enabled: this.windowsMainService.getWindowCount() > 0, click: function () { return _this.windowsMainService.sendToFocused('vscode.toggleAutoSave'); } }, false));
            var preferences = this.getPreferencesMenu();
            var newWindow = new electron_1.MenuItem(this.likeAction('workbench.action.newWindow', { label: this.mnemonicLabel(nls.localize({ key: 'miNewWindow', comment: ['&& denotes a mnemonic'] }, "New &&Window")), click: function () { return _this.windowsMainService.openNewWindow(windows_1.OpenContext.MENU); } }));
            var revertFile = this.createMenuItem(nls.localize({ key: 'miRevert', comment: ['&& denotes a mnemonic'] }, "Re&&vert File"), 'workbench.action.files.revert');
            var closeWindow = new electron_1.MenuItem(this.likeAction('workbench.action.closeWindow', { label: this.mnemonicLabel(nls.localize({ key: 'miCloseWindow', comment: ['&& denotes a mnemonic'] }, "Clos&&e Window")), click: function () { return _this.windowsMainService.getLastActiveWindow().win.close(); }, enabled: this.windowsMainService.getWindowCount() > 0 }));
            this.closeWorkspace = this.createMenuItem(nls.localize({ key: 'miCloseWorkspace', comment: ['&& denotes a mnemonic'] }, "Close &&Workspace"), 'workbench.action.closeFolder');
            this.closeFolder = this.createMenuItem(nls.localize({ key: 'miCloseFolder', comment: ['&& denotes a mnemonic'] }, "Close &&Folder"), 'workbench.action.closeFolder');
            var closeEditor = this.createMenuItem(nls.localize({ key: 'miCloseEditor', comment: ['&& denotes a mnemonic'] }, "&&Close Editor"), 'workbench.action.closeActiveEditor');
            var exit = new electron_1.MenuItem(this.likeAction('workbench.action.quit', { label: this.mnemonicLabel(nls.localize({ key: 'miExit', comment: ['&& denotes a mnemonic'] }, "E&&xit")), click: function () { return _this.windowsMainService.quit(); } }));
            this.updateWorkspaceMenuItems();
            arrays.coalesce([
                newFile,
                newWindow,
                __separator__(),
                platform_1.isMacintosh ? open : null,
                !platform_1.isMacintosh ? openFile : null,
                !platform_1.isMacintosh ? openFolder : null,
                openWorkspace,
                openRecent,
                __separator__(),
                addFolder,
                saveWorkspaceAs,
                __separator__(),
                saveFile,
                saveFileAs,
                saveAllFiles,
                __separator__(),
                autoSave,
                __separator__(),
                !platform_1.isMacintosh ? preferences : null,
                !platform_1.isMacintosh ? __separator__() : null,
                revertFile,
                closeEditor,
                this.closeWorkspace,
                this.closeFolder,
                closeWindow,
                !platform_1.isMacintosh ? __separator__() : null,
                !platform_1.isMacintosh ? exit : null
            ]).forEach(function (item) { return fileMenu.append(item); });
        };
        CodeMenu.prototype.getPreferencesMenu = function () {
            var settings = this.createMenuItem(nls.localize({ key: 'miOpenSettings', comment: ['&& denotes a mnemonic'] }, "&&Settings"), 'workbench.action.openGlobalSettings');
            var kebindingSettings = this.createMenuItem(nls.localize({ key: 'miOpenKeymap', comment: ['&& denotes a mnemonic'] }, "&&Keyboard Shortcuts"), 'workbench.action.openGlobalKeybindings');
            var keymapExtensions = this.createMenuItem(nls.localize({ key: 'miOpenKeymapExtensions', comment: ['&& denotes a mnemonic'] }, "&&Keymap Extensions"), 'workbench.extensions.action.showRecommendedKeymapExtensions');
            var snippetsSettings = this.createMenuItem(nls.localize({ key: 'miOpenSnippets', comment: ['&& denotes a mnemonic'] }, "User &&Snippets"), 'workbench.action.openSnippets');
            var colorThemeSelection = this.createMenuItem(nls.localize({ key: 'miSelectColorTheme', comment: ['&& denotes a mnemonic'] }, "&&Color Theme"), 'workbench.action.selectTheme');
            var iconThemeSelection = this.createMenuItem(nls.localize({ key: 'miSelectIconTheme', comment: ['&& denotes a mnemonic'] }, "File &&Icon Theme"), 'workbench.action.selectIconTheme');
            var preferencesMenu = new electron_1.Menu();
            preferencesMenu.append(settings);
            preferencesMenu.append(__separator__());
            preferencesMenu.append(kebindingSettings);
            preferencesMenu.append(keymapExtensions);
            preferencesMenu.append(__separator__());
            preferencesMenu.append(snippetsSettings);
            preferencesMenu.append(__separator__());
            preferencesMenu.append(colorThemeSelection);
            preferencesMenu.append(iconThemeSelection);
            return new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miPreferences', comment: ['&& denotes a mnemonic'] }, "&&Preferences")), submenu: preferencesMenu });
        };
        CodeMenu.prototype.setOpenRecentMenu = function (openRecentMenu) {
            var _this = this;
            openRecentMenu.append(this.createMenuItem(nls.localize({ key: 'miReopenClosedEditor', comment: ['&& denotes a mnemonic'] }, "&&Reopen Closed Editor"), 'workbench.action.reopenClosedEditor'));
            var _a = this.historyMainService.getRecentlyOpened(), workspaces = _a.workspaces, files = _a.files;
            // Workspaces
            if (workspaces.length > 0) {
                openRecentMenu.append(__separator__());
                for (var i = 0; i < CodeMenu.MAX_MENU_RECENT_ENTRIES && i < workspaces.length; i++) {
                    openRecentMenu.append(this.createOpenRecentMenuItem(workspaces[i], 'openRecentWorkspace', false));
                }
            }
            // Files
            if (files.length > 0) {
                openRecentMenu.append(__separator__());
                for (var i = 0; i < CodeMenu.MAX_MENU_RECENT_ENTRIES && i < files.length; i++) {
                    openRecentMenu.append(this.createOpenRecentMenuItem(files[i], 'openRecentFile', true));
                }
            }
            if (workspaces.length || files.length) {
                openRecentMenu.append(__separator__());
                openRecentMenu.append(this.createMenuItem(nls.localize({ key: 'miMore', comment: ['&& denotes a mnemonic'] }, "&&More..."), 'workbench.action.openRecent'));
                openRecentMenu.append(__separator__());
                openRecentMenu.append(new electron_1.MenuItem(this.likeAction('workbench.action.clearRecentFiles', { label: this.mnemonicLabel(nls.localize({ key: 'miClearRecentOpen', comment: ['&& denotes a mnemonic'] }, "&&Clear Recently Opened")), click: function () { return _this.historyMainService.clearRecentlyOpened(); } })));
            }
        };
        CodeMenu.prototype.createOpenRecentMenuItem = function (workspace, commandId, isFile) {
            var _this = this;
            var label;
            var path;
            if (workspaces_1.isSingleFolderWorkspaceIdentifier(workspace) || typeof workspace === 'string') {
                label = labels_1.unmnemonicLabel(labels_1.getPathLabel(workspace, null, this.environmentService));
                path = workspace;
            }
            else {
                label = workspaces_1.getWorkspaceLabel(workspace, this.environmentService, { verbose: true });
                path = workspace.configPath;
            }
            return new electron_1.MenuItem(this.likeAction(commandId, {
                label: label,
                click: function (menuItem, win, event) {
                    var openInNewWindow = _this.isOptionClick(event);
                    var success = _this.windowsMainService.open({
                        context: windows_1.OpenContext.MENU,
                        cli: _this.environmentService.args,
                        pathsToOpen: [path], forceNewWindow: openInNewWindow,
                        forceOpenWorkspaceAsFile: isFile
                    }).length > 0;
                    if (!success) {
                        _this.historyMainService.removeFromRecentlyOpened([workspaces_1.isSingleFolderWorkspaceIdentifier(workspace) ? workspace : workspace.configPath]);
                    }
                }
            }, false));
        };
        CodeMenu.prototype.isOptionClick = function (event) {
            return event && ((!platform_1.isMacintosh && (event.ctrlKey || event.shiftKey)) || (platform_1.isMacintosh && (event.metaKey || event.altKey)));
        };
        CodeMenu.prototype.createRoleMenuItem = function (label, commandId, role) {
            var options = {
                label: this.mnemonicLabel(label),
                role: role,
                enabled: true
            };
            return new electron_1.MenuItem(this.withKeybinding(commandId, options));
        };
        CodeMenu.prototype.setEditMenu = function (winLinuxEditMenu) {
            var undo;
            var redo;
            var cut;
            var copy;
            var paste;
            if (platform_1.isMacintosh) {
                undo = this.createContextAwareMenuItem(nls.localize({ key: 'miUndo', comment: ['&& denotes a mnemonic'] }, "&&Undo"), 'undo', {
                    inDevTools: function (devTools) { return devTools.undo(); },
                    inNoWindow: function () { return electron_1.Menu.sendActionToFirstResponder('undo:'); }
                });
                redo = this.createContextAwareMenuItem(nls.localize({ key: 'miRedo', comment: ['&& denotes a mnemonic'] }, "&&Redo"), 'redo', {
                    inDevTools: function (devTools) { return devTools.redo(); },
                    inNoWindow: function () { return electron_1.Menu.sendActionToFirstResponder('redo:'); }
                });
                cut = this.createRoleMenuItem(nls.localize({ key: 'miCut', comment: ['&& denotes a mnemonic'] }, "Cu&&t"), 'editor.action.clipboardCutAction', 'cut');
                copy = this.createRoleMenuItem(nls.localize({ key: 'miCopy', comment: ['&& denotes a mnemonic'] }, "&&Copy"), 'editor.action.clipboardCopyAction', 'copy');
                paste = this.createRoleMenuItem(nls.localize({ key: 'miPaste', comment: ['&& denotes a mnemonic'] }, "&&Paste"), 'editor.action.clipboardPasteAction', 'paste');
            }
            else {
                undo = this.createMenuItem(nls.localize({ key: 'miUndo', comment: ['&& denotes a mnemonic'] }, "&&Undo"), 'undo');
                redo = this.createMenuItem(nls.localize({ key: 'miRedo', comment: ['&& denotes a mnemonic'] }, "&&Redo"), 'redo');
                cut = this.createMenuItem(nls.localize({ key: 'miCut', comment: ['&& denotes a mnemonic'] }, "Cu&&t"), 'editor.action.clipboardCutAction');
                copy = this.createMenuItem(nls.localize({ key: 'miCopy', comment: ['&& denotes a mnemonic'] }, "&&Copy"), 'editor.action.clipboardCopyAction');
                paste = this.createMenuItem(nls.localize({ key: 'miPaste', comment: ['&& denotes a mnemonic'] }, "&&Paste"), 'editor.action.clipboardPasteAction');
            }
            var find = this.createMenuItem(nls.localize({ key: 'miFind', comment: ['&& denotes a mnemonic'] }, "&&Find"), 'actions.find');
            var replace = this.createMenuItem(nls.localize({ key: 'miReplace', comment: ['&& denotes a mnemonic'] }, "&&Replace"), 'editor.action.startFindReplaceAction');
            var findInFiles = this.createMenuItem(nls.localize({ key: 'miFindInFiles', comment: ['&& denotes a mnemonic'] }, "Find &&in Files"), 'workbench.action.findInFiles');
            var replaceInFiles = this.createMenuItem(nls.localize({ key: 'miReplaceInFiles', comment: ['&& denotes a mnemonic'] }, "Replace &&in Files"), 'workbench.action.replaceInFiles');
            var emmetExpandAbbreviation = this.createMenuItem(nls.localize({ key: 'miEmmetExpandAbbreviation', comment: ['&& denotes a mnemonic'] }, "Emmet: E&&xpand Abbreviation"), 'editor.emmet.action.expandAbbreviation');
            var showEmmetCommands = this.createMenuItem(nls.localize({ key: 'miShowEmmetCommands', comment: ['&& denotes a mnemonic'] }, "E&&mmet..."), 'workbench.action.showEmmetCommands');
            var toggleLineComment = this.createMenuItem(nls.localize({ key: 'miToggleLineComment', comment: ['&& denotes a mnemonic'] }, "&&Toggle Line Comment"), 'editor.action.commentLine');
            var toggleBlockComment = this.createMenuItem(nls.localize({ key: 'miToggleBlockComment', comment: ['&& denotes a mnemonic'] }, "Toggle &&Block Comment"), 'editor.action.blockComment');
            [
                undo,
                redo,
                __separator__(),
                cut,
                copy,
                paste,
                __separator__(),
                find,
                replace,
                __separator__(),
                findInFiles,
                replaceInFiles,
                __separator__(),
                toggleLineComment,
                toggleBlockComment,
                emmetExpandAbbreviation,
                showEmmetCommands
            ].forEach(function (item) { return winLinuxEditMenu.append(item); });
        };
        CodeMenu.prototype.setSelectionMenu = function (winLinuxEditMenu) {
            var multiCursorModifierLabel;
            if (this.currentMultiCursorModifierSetting === 'ctrlCmd') {
                multiCursorModifierLabel = nls.localize('miMultiCursorAlt', "Switch to Alt+Click for Multi-Cursor"); // The default has been overwritten
            }
            else {
                multiCursorModifierLabel = (platform_1.isMacintosh
                    ? nls.localize('miMultiCursorCmd', "Switch to Cmd+Click for Multi-Cursor")
                    : nls.localize('miMultiCursorCtrl', "Switch to Ctrl+Click for Multi-Cursor"));
            }
            var multicursorModifier = this.createMenuItem(multiCursorModifierLabel, 'workbench.action.toggleMultiCursorModifier');
            var insertCursorAbove = this.createMenuItem(nls.localize({ key: 'miInsertCursorAbove', comment: ['&& denotes a mnemonic'] }, "&&Add Cursor Above"), 'editor.action.insertCursorAbove');
            var insertCursorBelow = this.createMenuItem(nls.localize({ key: 'miInsertCursorBelow', comment: ['&& denotes a mnemonic'] }, "A&&dd Cursor Below"), 'editor.action.insertCursorBelow');
            var insertCursorAtEndOfEachLineSelected = this.createMenuItem(nls.localize({ key: 'miInsertCursorAtEndOfEachLineSelected', comment: ['&& denotes a mnemonic'] }, "Add C&&ursors to Line Ends"), 'editor.action.insertCursorAtEndOfEachLineSelected');
            var addSelectionToNextFindMatch = this.createMenuItem(nls.localize({ key: 'miAddSelectionToNextFindMatch', comment: ['&& denotes a mnemonic'] }, "Add &&Next Occurrence"), 'editor.action.addSelectionToNextFindMatch');
            var addSelectionToPreviousFindMatch = this.createMenuItem(nls.localize({ key: 'miAddSelectionToPreviousFindMatch', comment: ['&& denotes a mnemonic'] }, "Add P&&revious Occurrence"), 'editor.action.addSelectionToPreviousFindMatch');
            var selectHighlights = this.createMenuItem(nls.localize({ key: 'miSelectHighlights', comment: ['&& denotes a mnemonic'] }, "Select All &&Occurrences"), 'editor.action.selectHighlights');
            var copyLinesUp = this.createMenuItem(nls.localize({ key: 'miCopyLinesUp', comment: ['&& denotes a mnemonic'] }, "&&Copy Line Up"), 'editor.action.copyLinesUpAction');
            var copyLinesDown = this.createMenuItem(nls.localize({ key: 'miCopyLinesDown', comment: ['&& denotes a mnemonic'] }, "Co&&py Line Down"), 'editor.action.copyLinesDownAction');
            var moveLinesUp = this.createMenuItem(nls.localize({ key: 'miMoveLinesUp', comment: ['&& denotes a mnemonic'] }, "Mo&&ve Line Up"), 'editor.action.moveLinesUpAction');
            var moveLinesDown = this.createMenuItem(nls.localize({ key: 'miMoveLinesDown', comment: ['&& denotes a mnemonic'] }, "Move &&Line Down"), 'editor.action.moveLinesDownAction');
            var selectAll;
            if (platform_1.isMacintosh) {
                selectAll = this.createContextAwareMenuItem(nls.localize({ key: 'miSelectAll', comment: ['&& denotes a mnemonic'] }, "&&Select All"), 'editor.action.selectAll', {
                    inDevTools: function (devTools) { return devTools.selectAll(); },
                    inNoWindow: function () { return electron_1.Menu.sendActionToFirstResponder('selectAll:'); }
                });
            }
            else {
                selectAll = this.createMenuItem(nls.localize({ key: 'miSelectAll', comment: ['&& denotes a mnemonic'] }, "&&Select All"), 'editor.action.selectAll');
            }
            var smartSelectGrow = this.createMenuItem(nls.localize({ key: 'miSmartSelectGrow', comment: ['&& denotes a mnemonic'] }, "&&Expand Selection"), 'editor.action.smartSelect.grow');
            var smartSelectshrink = this.createMenuItem(nls.localize({ key: 'miSmartSelectShrink', comment: ['&& denotes a mnemonic'] }, "&&Shrink Selection"), 'editor.action.smartSelect.shrink');
            [
                selectAll,
                smartSelectGrow,
                smartSelectshrink,
                __separator__(),
                copyLinesUp,
                copyLinesDown,
                moveLinesUp,
                moveLinesDown,
                __separator__(),
                multicursorModifier,
                insertCursorAbove,
                insertCursorBelow,
                insertCursorAtEndOfEachLineSelected,
                addSelectionToNextFindMatch,
                addSelectionToPreviousFindMatch,
                selectHighlights,
            ].forEach(function (item) { return winLinuxEditMenu.append(item); });
        };
        CodeMenu.prototype.setViewMenu = function (viewMenu) {
            var _this = this;
            var explorer = this.createMenuItem(nls.localize({ key: 'miViewExplorer', comment: ['&& denotes a mnemonic'] }, "&&Explorer"), 'workbench.view.explorer');
            var search = this.createMenuItem(nls.localize({ key: 'miViewSearch', comment: ['&& denotes a mnemonic'] }, "&&Search"), 'workbench.view.search');
            var scm = this.createMenuItem(nls.localize({ key: 'miViewSCM', comment: ['&& denotes a mnemonic'] }, "S&&CM"), 'workbench.view.scm');
            var debug = this.createMenuItem(nls.localize({ key: 'miViewDebug', comment: ['&& denotes a mnemonic'] }, "&&Debug"), 'workbench.view.debug');
            var extensions = this.createMenuItem(nls.localize({ key: 'miViewExtensions', comment: ['&& denotes a mnemonic'] }, "E&&xtensions"), 'workbench.view.extensions');
            var output = this.createMenuItem(nls.localize({ key: 'miToggleOutput', comment: ['&& denotes a mnemonic'] }, "&&Output"), 'workbench.action.output.toggleOutput');
            var debugConsole = this.createMenuItem(nls.localize({ key: 'miToggleDebugConsole', comment: ['&& denotes a mnemonic'] }, "De&&bug Console"), 'workbench.debug.action.toggleRepl');
            var integratedTerminal = this.createMenuItem(nls.localize({ key: 'miToggleIntegratedTerminal', comment: ['&& denotes a mnemonic'] }, "&&Integrated Terminal"), 'workbench.action.terminal.toggleTerminal');
            var problems = this.createMenuItem(nls.localize({ key: 'miMarker', comment: ['&& denotes a mnemonic'] }, "&&Problems"), 'workbench.actions.view.problems');
            var additionalViewlets;
            if (this.extensionViewlets.length) {
                var additionalViewletsMenu_1 = new electron_1.Menu();
                this.extensionViewlets.forEach(function (viewlet) {
                    additionalViewletsMenu_1.append(_this.createMenuItem(viewlet.label, viewlet.id));
                });
                additionalViewlets = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miAdditionalViews', comment: ['&& denotes a mnemonic'] }, "Additional &&Views")), submenu: additionalViewletsMenu_1, enabled: true });
            }
            var commands = this.createMenuItem(nls.localize({ key: 'miCommandPalette', comment: ['&& denotes a mnemonic'] }, "&&Command Palette..."), 'workbench.action.showCommands');
            var openView = this.createMenuItem(nls.localize({ key: 'miOpenView', comment: ['&& denotes a mnemonic'] }, "&&Open View..."), 'workbench.action.openView');
            var fullscreen = new electron_1.MenuItem(this.withKeybinding('workbench.action.toggleFullScreen', { label: this.mnemonicLabel(nls.localize({ key: 'miToggleFullScreen', comment: ['&& denotes a mnemonic'] }, "Toggle &&Full Screen")), click: function () { return _this.windowsMainService.getLastActiveWindow().toggleFullScreen(); }, enabled: this.windowsMainService.getWindowCount() > 0 }));
            var toggleZenMode = this.createMenuItem(nls.localize('miToggleZenMode', "Toggle Zen Mode"), 'workbench.action.toggleZenMode');
            var toggleMenuBar = this.createMenuItem(nls.localize({ key: 'miToggleMenuBar', comment: ['&& denotes a mnemonic'] }, "Toggle Menu &&Bar"), 'workbench.action.toggleMenuBar');
            var splitEditor = this.createMenuItem(nls.localize({ key: 'miSplitEditor', comment: ['&& denotes a mnemonic'] }, "Split &&Editor"), 'workbench.action.splitEditor');
            var toggleEditorLayout = this.createMenuItem(nls.localize({ key: 'miToggleEditorLayout', comment: ['&& denotes a mnemonic'] }, "Toggle Editor Group &&Layout"), 'workbench.action.toggleEditorGroupLayout');
            var toggleSidebar = this.createMenuItem(nls.localize({ key: 'miToggleSidebar', comment: ['&& denotes a mnemonic'] }, "&&Toggle Side Bar"), 'workbench.action.toggleSidebarVisibility');
            var moveSideBarLabel;
            if (this.currentSidebarLocation !== 'right') {
                moveSideBarLabel = nls.localize({ key: 'miMoveSidebarRight', comment: ['&& denotes a mnemonic'] }, "&&Move Side Bar Right");
            }
            else {
                moveSideBarLabel = nls.localize({ key: 'miMoveSidebarLeft', comment: ['&& denotes a mnemonic'] }, "&&Move Side Bar Left");
            }
            var moveSidebar = this.createMenuItem(moveSideBarLabel, 'workbench.action.toggleSidebarPosition');
            var togglePanel = this.createMenuItem(nls.localize({ key: 'miTogglePanel', comment: ['&& denotes a mnemonic'] }, "Toggle &&Panel"), 'workbench.action.togglePanel');
            var statusBarLabel;
            if (this.currentStatusbarVisible) {
                statusBarLabel = nls.localize({ key: 'miHideStatusbar', comment: ['&& denotes a mnemonic'] }, "&&Hide Status Bar");
            }
            else {
                statusBarLabel = nls.localize({ key: 'miShowStatusbar', comment: ['&& denotes a mnemonic'] }, "&&Show Status Bar");
            }
            var toggleStatusbar = this.createMenuItem(statusBarLabel, 'workbench.action.toggleStatusbarVisibility');
            var activityBarLabel;
            if (this.currentActivityBarVisible) {
                activityBarLabel = nls.localize({ key: 'miHideActivityBar', comment: ['&& denotes a mnemonic'] }, "Hide &&Activity Bar");
            }
            else {
                activityBarLabel = nls.localize({ key: 'miShowActivityBar', comment: ['&& denotes a mnemonic'] }, "Show &&Activity Bar");
            }
            var toggleActivtyBar = this.createMenuItem(activityBarLabel, 'workbench.action.toggleActivityBarVisibility');
            var toggleWordWrap = this.createMenuItem(nls.localize({ key: 'miToggleWordWrap', comment: ['&& denotes a mnemonic'] }, "Toggle &&Word Wrap"), 'editor.action.toggleWordWrap');
            var toggleMinimap = this.createMenuItem(nls.localize({ key: 'miToggleMinimap', comment: ['&& denotes a mnemonic'] }, "Toggle &&Minimap"), 'editor.action.toggleMinimap');
            var toggleRenderWhitespace = this.createMenuItem(nls.localize({ key: 'miToggleRenderWhitespace', comment: ['&& denotes a mnemonic'] }, "Toggle &&Render Whitespace"), 'editor.action.toggleRenderWhitespace');
            var toggleRenderControlCharacters = this.createMenuItem(nls.localize({ key: 'miToggleRenderControlCharacters', comment: ['&& denotes a mnemonic'] }, "Toggle &&Control Characters"), 'editor.action.toggleRenderControlCharacter');
            var zoomIn = this.createMenuItem(nls.localize({ key: 'miZoomIn', comment: ['&& denotes a mnemonic'] }, "&&Zoom In"), 'workbench.action.zoomIn');
            var zoomOut = this.createMenuItem(nls.localize({ key: 'miZoomOut', comment: ['&& denotes a mnemonic'] }, "Zoom O&&ut"), 'workbench.action.zoomOut');
            var resetZoom = this.createMenuItem(nls.localize({ key: 'miZoomReset', comment: ['&& denotes a mnemonic'] }, "&&Reset Zoom"), 'workbench.action.zoomReset');
            arrays.coalesce([
                commands,
                openView,
                __separator__(),
                explorer,
                search,
                scm,
                debug,
                extensions,
                additionalViewlets,
                __separator__(),
                output,
                problems,
                debugConsole,
                integratedTerminal,
                __separator__(),
                fullscreen,
                toggleZenMode,
                platform_1.isWindows || platform_1.isLinux ? toggleMenuBar : void 0,
                __separator__(),
                splitEditor,
                toggleEditorLayout,
                moveSidebar,
                toggleSidebar,
                togglePanel,
                toggleStatusbar,
                toggleActivtyBar,
                __separator__(),
                toggleWordWrap,
                toggleMinimap,
                toggleRenderWhitespace,
                toggleRenderControlCharacters,
                __separator__(),
                zoomIn,
                zoomOut,
                resetZoom
            ]).forEach(function (item) { return viewMenu.append(item); });
        };
        CodeMenu.prototype.setGotoMenu = function (gotoMenu) {
            var back = this.createMenuItem(nls.localize({ key: 'miBack', comment: ['&& denotes a mnemonic'] }, "&&Back"), 'workbench.action.navigateBack');
            var forward = this.createMenuItem(nls.localize({ key: 'miForward', comment: ['&& denotes a mnemonic'] }, "&&Forward"), 'workbench.action.navigateForward');
            var switchEditorMenu = new electron_1.Menu();
            var nextEditor = this.createMenuItem(nls.localize({ key: 'miNextEditor', comment: ['&& denotes a mnemonic'] }, "&&Next Editor"), 'workbench.action.nextEditor');
            var previousEditor = this.createMenuItem(nls.localize({ key: 'miPreviousEditor', comment: ['&& denotes a mnemonic'] }, "&&Previous Editor"), 'workbench.action.previousEditor');
            var nextEditorInGroup = this.createMenuItem(nls.localize({ key: 'miNextEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Next Used Editor in Group"), 'workbench.action.openNextRecentlyUsedEditorInGroup');
            var previousEditorInGroup = this.createMenuItem(nls.localize({ key: 'miPreviousEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Previous Used Editor in Group"), 'workbench.action.openPreviousRecentlyUsedEditorInGroup');
            [
                nextEditor,
                previousEditor,
                __separator__(),
                nextEditorInGroup,
                previousEditorInGroup
            ].forEach(function (item) { return switchEditorMenu.append(item); });
            var switchEditor = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miSwitchEditor', comment: ['&& denotes a mnemonic'] }, "Switch &&Editor")), submenu: switchEditorMenu, enabled: true });
            var switchGroupMenu = new electron_1.Menu();
            var focusFirstGroup = this.createMenuItem(nls.localize({ key: 'miFocusFirstGroup', comment: ['&& denotes a mnemonic'] }, "&&First Group"), 'workbench.action.focusFirstEditorGroup');
            var focusSecondGroup = this.createMenuItem(nls.localize({ key: 'miFocusSecondGroup', comment: ['&& denotes a mnemonic'] }, "&&Second Group"), 'workbench.action.focusSecondEditorGroup');
            var focusThirdGroup = this.createMenuItem(nls.localize({ key: 'miFocusThirdGroup', comment: ['&& denotes a mnemonic'] }, "&&Third Group"), 'workbench.action.focusThirdEditorGroup');
            var nextGroup = this.createMenuItem(nls.localize({ key: 'miNextGroup', comment: ['&& denotes a mnemonic'] }, "&&Next Group"), 'workbench.action.focusNextGroup');
            var previousGroup = this.createMenuItem(nls.localize({ key: 'miPreviousGroup', comment: ['&& denotes a mnemonic'] }, "&&Previous Group"), 'workbench.action.focusPreviousGroup');
            [
                focusFirstGroup,
                focusSecondGroup,
                focusThirdGroup,
                __separator__(),
                nextGroup,
                previousGroup
            ].forEach(function (item) { return switchGroupMenu.append(item); });
            var switchGroup = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miSwitchGroup', comment: ['&& denotes a mnemonic'] }, "Switch &&Group")), submenu: switchGroupMenu, enabled: true });
            var gotoFile = this.createMenuItem(nls.localize({ key: 'miGotoFile', comment: ['&& denotes a mnemonic'] }, "Go to &&File..."), 'workbench.action.quickOpen');
            var gotoSymbolInFile = this.createMenuItem(nls.localize({ key: 'miGotoSymbolInFile', comment: ['&& denotes a mnemonic'] }, "Go to &&Symbol in File..."), 'workbench.action.gotoSymbol');
            var gotoSymbolInWorkspace = this.createMenuItem(nls.localize({ key: 'miGotoSymbolInWorkspace', comment: ['&& denotes a mnemonic'] }, "Go to Symbol in &&Workspace..."), 'workbench.action.showAllSymbols');
            var gotoDefinition = this.createMenuItem(nls.localize({ key: 'miGotoDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Definition"), 'editor.action.goToDeclaration');
            var gotoTypeDefinition = this.createMenuItem(nls.localize({ key: 'miGotoTypeDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Type Definition"), 'editor.action.goToTypeDefinition');
            var goToImplementation = this.createMenuItem(nls.localize({ key: 'miGotoImplementation', comment: ['&& denotes a mnemonic'] }, "Go to &&Implementation"), 'editor.action.goToImplementation');
            var gotoLine = this.createMenuItem(nls.localize({ key: 'miGotoLine', comment: ['&& denotes a mnemonic'] }, "Go to &&Line..."), 'workbench.action.gotoLine');
            [
                back,
                forward,
                __separator__(),
                switchEditor,
                switchGroup,
                __separator__(),
                gotoFile,
                gotoSymbolInFile,
                gotoSymbolInWorkspace,
                gotoDefinition,
                gotoTypeDefinition,
                goToImplementation,
                gotoLine
            ].forEach(function (item) { return gotoMenu.append(item); });
        };
        CodeMenu.prototype.setDebugMenu = function (debugMenu) {
            var start = this.createMenuItem(nls.localize({ key: 'miStartDebugging', comment: ['&& denotes a mnemonic'] }, "&&Start Debugging"), 'workbench.action.debug.start');
            var startWithoutDebugging = this.createMenuItem(nls.localize({ key: 'miStartWithoutDebugging', comment: ['&& denotes a mnemonic'] }, "Start &&Without Debugging"), 'workbench.action.debug.run');
            var stop = this.createMenuItem(nls.localize({ key: 'miStopDebugging', comment: ['&& denotes a mnemonic'] }, "&&Stop Debugging"), 'workbench.action.debug.stop');
            var restart = this.createMenuItem(nls.localize({ key: 'miRestart Debugging', comment: ['&& denotes a mnemonic'] }, "&&Restart Debugging"), 'workbench.action.debug.restart');
            var openConfigurations = this.createMenuItem(nls.localize({ key: 'miOpenConfigurations', comment: ['&& denotes a mnemonic'] }, "Open &&Configurations"), 'workbench.action.debug.configure');
            var addConfiguration = this.createMenuItem(nls.localize({ key: 'miAddConfiguration', comment: ['&& denotes a mnemonic'] }, "Add Configuration..."), 'debug.addConfiguration');
            var stepOver = this.createMenuItem(nls.localize({ key: 'miStepOver', comment: ['&& denotes a mnemonic'] }, "Step &&Over"), 'workbench.action.debug.stepOver');
            var stepInto = this.createMenuItem(nls.localize({ key: 'miStepInto', comment: ['&& denotes a mnemonic'] }, "Step &&Into"), 'workbench.action.debug.stepInto');
            var stepOut = this.createMenuItem(nls.localize({ key: 'miStepOut', comment: ['&& denotes a mnemonic'] }, "Step O&&ut"), 'workbench.action.debug.stepOut');
            var continueAction = this.createMenuItem(nls.localize({ key: 'miContinue', comment: ['&& denotes a mnemonic'] }, "&&Continue"), 'workbench.action.debug.continue');
            var toggleBreakpoint = this.createMenuItem(nls.localize({ key: 'miToggleBreakpoint', comment: ['&& denotes a mnemonic'] }, "Toggle &&Breakpoint"), 'editor.debug.action.toggleBreakpoint');
            var breakpointsMenu = new electron_1.Menu();
            breakpointsMenu.append(this.createMenuItem(nls.localize({ key: 'miConditionalBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&Conditional Breakpoint..."), 'editor.debug.action.conditionalBreakpoint'));
            breakpointsMenu.append(this.createMenuItem(nls.localize({ key: 'miColumnBreakpoint', comment: ['&& denotes a mnemonic'] }, "C&&olumn Breakpoint"), 'editor.debug.action.toggleColumnBreakpoint'));
            breakpointsMenu.append(this.createMenuItem(nls.localize({ key: 'miFunctionBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&Function Breakpoint..."), 'workbench.debug.viewlet.action.addFunctionBreakpointAction'));
            var newBreakpoints = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miNewBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&New Breakpoint")), submenu: breakpointsMenu });
            var enableAllBreakpoints = this.createMenuItem(nls.localize({ key: 'miEnableAllBreakpoints', comment: ['&& denotes a mnemonic'] }, "Enable All Breakpoints"), 'workbench.debug.viewlet.action.enableAllBreakpoints');
            var disableAllBreakpoints = this.createMenuItem(nls.localize({ key: 'miDisableAllBreakpoints', comment: ['&& denotes a mnemonic'] }, "Disable A&&ll Breakpoints"), 'workbench.debug.viewlet.action.disableAllBreakpoints');
            var removeAllBreakpoints = this.createMenuItem(nls.localize({ key: 'miRemoveAllBreakpoints', comment: ['&& denotes a mnemonic'] }, "Remove &&All Breakpoints"), 'workbench.debug.viewlet.action.removeAllBreakpoints');
            var installAdditionalDebuggers = this.createMenuItem(nls.localize({ key: 'miInstallAdditionalDebuggers', comment: ['&& denotes a mnemonic'] }, "&&Install Additional Debuggers..."), 'debug.installAdditionalDebuggers');
            [
                start,
                startWithoutDebugging,
                stop,
                restart,
                __separator__(),
                openConfigurations,
                addConfiguration,
                __separator__(),
                stepOver,
                stepInto,
                stepOut,
                continueAction,
                __separator__(),
                toggleBreakpoint,
                newBreakpoints,
                enableAllBreakpoints,
                disableAllBreakpoints,
                removeAllBreakpoints,
                __separator__(),
                installAdditionalDebuggers
            ].forEach(function (item) { return debugMenu.append(item); });
        };
        CodeMenu.prototype.setMacWindowMenu = function (macWindowMenu) {
            var minimize = new electron_1.MenuItem({ label: nls.localize('mMinimize', "Minimize"), role: 'minimize', accelerator: 'Command+M', enabled: this.windowsMainService.getWindowCount() > 0 });
            var zoom = new electron_1.MenuItem({ label: nls.localize('mZoom', "Zoom"), role: 'zoom', enabled: this.windowsMainService.getWindowCount() > 0 });
            var bringAllToFront = new electron_1.MenuItem({ label: nls.localize('mBringToFront', "Bring All to Front"), role: 'front', enabled: this.windowsMainService.getWindowCount() > 0 });
            var switchWindow = this.createMenuItem(nls.localize({ key: 'miSwitchWindow', comment: ['&& denotes a mnemonic'] }, "Switch &&Window..."), 'workbench.action.switchWindow');
            this.nativeTabMenuItems = [];
            var nativeTabMenuItems = [];
            if (this.currentEnableNativeTabs) {
                var hasMultipleWindows = this.windowsMainService.getWindowCount() > 1;
                this.nativeTabMenuItems.push(this.createMenuItem(nls.localize('mShowPreviousTab', "Show Previous Tab"), 'workbench.action.showPreviousWindowTab', hasMultipleWindows));
                this.nativeTabMenuItems.push(this.createMenuItem(nls.localize('mShowNextTab', "Show Next Tab"), 'workbench.action.showNextWindowTab', hasMultipleWindows));
                this.nativeTabMenuItems.push(this.createMenuItem(nls.localize('mMoveTabToNewWindow', "Move Tab to New Window"), 'workbench.action.moveWindowTabToNewWindow', hasMultipleWindows));
                this.nativeTabMenuItems.push(this.createMenuItem(nls.localize('mMergeAllWindows', "Merge All Windows"), 'workbench.action.mergeAllWindowTabs', hasMultipleWindows));
                nativeTabMenuItems.push.apply(nativeTabMenuItems, [__separator__()].concat(this.nativeTabMenuItems));
            }
            else {
                this.nativeTabMenuItems = [];
            }
            [
                minimize,
                zoom,
                switchWindow
            ].concat(nativeTabMenuItems, [
                __separator__(),
                bringAllToFront
            ]).forEach(function (item) { return macWindowMenu.append(item); });
        };
        CodeMenu.prototype.toggleDevTools = function () {
            var w = this.windowsMainService.getFocusedWindow();
            if (w && w.win) {
                var contents = w.win.webContents;
                if (w.hasHiddenTitleBarStyle() && !w.win.isFullScreen() && !contents.isDevToolsOpened()) {
                    contents.openDevTools({ mode: 'undocked' }); // due to https://github.com/electron/electron/issues/3647
                }
                else {
                    contents.toggleDevTools();
                }
            }
        };
        CodeMenu.prototype.setHelpMenu = function (helpMenu) {
            var _this = this;
            var toggleDevToolsItem = new electron_1.MenuItem(this.likeAction('workbench.action.toggleDevTools', {
                label: this.mnemonicLabel(nls.localize({ key: 'miToggleDevTools', comment: ['&& denotes a mnemonic'] }, "&&Toggle Developer Tools")),
                click: function () { return _this.toggleDevTools(); },
                enabled: (this.windowsMainService.getWindowCount() > 0)
            }));
            var showAccessibilityOptions = new electron_1.MenuItem(this.likeAction('accessibilityOptions', {
                label: this.mnemonicLabel(nls.localize({ key: 'miAccessibilityOptions', comment: ['&& denotes a mnemonic'] }, "Accessibility &&Options")),
                accelerator: null,
                click: function () {
                    _this.openAccessibilityOptions();
                }
            }, false));
            var reportIssuesItem = null;
            if (product_1.default.reportIssueUrl) {
                var label = nls.localize({ key: 'miReportIssue', comment: ['&& denotes a mnemonic', 'Translate this to "Report Issue in English" in all languages please!'] }, "Report &&Issue");
                if (this.windowsMainService.getWindowCount() > 0) {
                    reportIssuesItem = this.createMenuItem(label, 'workbench.action.openIssueReporter');
                }
                else {
                    reportIssuesItem = new electron_1.MenuItem({ label: this.mnemonicLabel(label), click: function () { return _this.openUrl(product_1.default.reportIssueUrl, 'openReportIssues'); } });
                }
            }
            var keyboardShortcutsUrl = platform_1.isLinux ? product_1.default.keyboardShortcutsUrlLinux : platform_1.isMacintosh ? product_1.default.keyboardShortcutsUrlMac : product_1.default.keyboardShortcutsUrlWin;
            arrays.coalesce([
                new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miWelcome', comment: ['&& denotes a mnemonic'] }, "&&Welcome")), click: function () { return _this.runActionInRenderer('workbench.action.showWelcomePage'); }, enabled: (this.windowsMainService.getWindowCount() > 0) }),
                new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miInteractivePlayground', comment: ['&& denotes a mnemonic'] }, "&&Interactive Playground")), click: function () { return _this.runActionInRenderer('workbench.action.showInteractivePlayground'); }, enabled: (this.windowsMainService.getWindowCount() > 0) }),
                product_1.default.documentationUrl ? new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miDocumentation', comment: ['&& denotes a mnemonic'] }, "&&Documentation")), click: function () { return _this.runActionInRenderer('workbench.action.openDocumentationUrl'); }, enabled: (this.windowsMainService.getWindowCount() > 0) }) : null,
                product_1.default.releaseNotesUrl ? new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miReleaseNotes', comment: ['&& denotes a mnemonic'] }, "&&Release Notes")), click: function () { return _this.runActionInRenderer('update.showCurrentReleaseNotes'); }, enabled: (this.windowsMainService.getWindowCount() > 0) }) : null,
                __separator__(),
                keyboardShortcutsUrl ? new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miKeyboardShortcuts', comment: ['&& denotes a mnemonic'] }, "&&Keyboard Shortcuts Reference")), click: function () { return _this.runActionInRenderer('workbench.action.keybindingsReference'); }, enabled: (this.windowsMainService.getWindowCount() > 0) }) : null,
                product_1.default.introductoryVideosUrl ? new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miIntroductoryVideos', comment: ['&& denotes a mnemonic'] }, "Introductory &&Videos")), click: function () { return _this.runActionInRenderer('workbench.action.openIntroductoryVideosUrl'); }, enabled: (this.windowsMainService.getWindowCount() > 0) }) : null,
                product_1.default.tipsAndTricksUrl ? new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miTipsAndTricks', comment: ['&& denotes a mnemonic'] }, "&&Tips and Tricks")), click: function () { return _this.runActionInRenderer('workbench.action.openTipsAndTricksUrl'); }, enabled: (this.windowsMainService.getWindowCount() > 0) }) : null,
                (product_1.default.introductoryVideosUrl || keyboardShortcutsUrl) ? __separator__() : null,
                product_1.default.twitterUrl ? new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miTwitter', comment: ['&& denotes a mnemonic'] }, "&&Join us on Twitter")), click: function () { return _this.openUrl(product_1.default.twitterUrl, 'openTwitterUrl'); } }) : null,
                product_1.default.requestFeatureUrl ? new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miUserVoice', comment: ['&& denotes a mnemonic'] }, "&&Search Feature Requests")), click: function () { return _this.openUrl(product_1.default.requestFeatureUrl, 'openUserVoiceUrl'); } }) : null,
                reportIssuesItem,
                (product_1.default.twitterUrl || product_1.default.requestFeatureUrl || product_1.default.reportIssueUrl) ? __separator__() : null,
                product_1.default.licenseUrl ? new electron_1.MenuItem({
                    label: this.mnemonicLabel(nls.localize({ key: 'miLicense', comment: ['&& denotes a mnemonic'] }, "View &&License")), click: function () {
                        if (platform_1.language) {
                            var queryArgChar = product_1.default.licenseUrl.indexOf('?') > 0 ? '&' : '?';
                            _this.openUrl("" + product_1.default.licenseUrl + queryArgChar + "lang=" + platform_1.language, 'openLicenseUrl');
                        }
                        else {
                            _this.openUrl(product_1.default.licenseUrl, 'openLicenseUrl');
                        }
                    }
                }) : null,
                product_1.default.privacyStatementUrl ? new electron_1.MenuItem({
                    label: this.mnemonicLabel(nls.localize({ key: 'miPrivacyStatement', comment: ['&& denotes a mnemonic'] }, "&&Privacy Statement")), click: function () {
                        if (platform_1.language) {
                            var queryArgChar = product_1.default.licenseUrl.indexOf('?') > 0 ? '&' : '?';
                            _this.openUrl("" + product_1.default.privacyStatementUrl + queryArgChar + "lang=" + platform_1.language, 'openPrivacyStatement');
                        }
                        else {
                            _this.openUrl(product_1.default.privacyStatementUrl, 'openPrivacyStatement');
                        }
                    }
                }) : null,
                (product_1.default.licenseUrl || product_1.default.privacyStatementUrl) ? __separator__() : null,
                toggleDevToolsItem,
                platform_1.isWindows && product_1.default.quality !== 'stable' ? showAccessibilityOptions : null
            ]).forEach(function (item) { return helpMenu.append(item); });
            if (!platform_1.isMacintosh) {
                var updateMenuItems = this.getUpdateMenuItems();
                if (updateMenuItems.length) {
                    helpMenu.append(__separator__());
                    updateMenuItems.forEach(function (i) { return helpMenu.append(i); });
                }
                helpMenu.append(__separator__());
                helpMenu.append(new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miAbout', comment: ['&& denotes a mnemonic'] }, "&&About")), click: function () { return _this.windowsService.openAboutDialog(); } }));
            }
        };
        CodeMenu.prototype.setTaskMenu = function (taskMenu) {
            var runTask = this.createMenuItem(nls.localize({ key: 'miRunTask', comment: ['&& denotes a mnemonic'] }, "&&Run Task..."), 'workbench.action.tasks.runTask');
            var buildTask = this.createMenuItem(nls.localize({ key: 'miBuildTask', comment: ['&& denotes a mnemonic'] }, "Run &&Build Task..."), 'workbench.action.tasks.build');
            var showTasks = this.createMenuItem(nls.localize({ key: 'miRunningTask', comment: ['&& denotes a mnemonic'] }, "Show Runnin&&g Tasks..."), 'workbench.action.tasks.showTasks');
            var restartTask = this.createMenuItem(nls.localize({ key: 'miRestartTask', comment: ['&& denotes a mnemonic'] }, "R&&estart Running Task..."), 'workbench.action.tasks.restartTask');
            var terminateTask = this.createMenuItem(nls.localize({ key: 'miTerminateTask', comment: ['&& denotes a mnemonic'] }, "&&Terminate Task..."), 'workbench.action.tasks.terminate');
            var configureTask = this.createMenuItem(nls.localize({ key: 'miConfigureTask', comment: ['&& denotes a mnemonic'] }, "&&Configure Tasks..."), 'workbench.action.tasks.configureTaskRunner');
            var configureBuildTask = this.createMenuItem(nls.localize({ key: 'miConfigureBuildTask', comment: ['&& denotes a mnemonic'] }, "Configure De&&fault Build Task..."), 'workbench.action.tasks.configureDefaultBuildTask');
            [
                //__separator__(),
                runTask,
                buildTask,
                __separator__(),
                terminateTask,
                restartTask,
                showTasks,
                __separator__(),
                configureTask,
                configureBuildTask
            ].forEach(function (item) { return taskMenu.append(item); });
        };
        CodeMenu.prototype.openAccessibilityOptions = function () {
            var win = new electron_1.BrowserWindow({
                alwaysOnTop: true,
                skipTaskbar: true,
                resizable: false,
                width: 450,
                height: 300,
                show: true,
                title: nls.localize('accessibilityOptionsWindowTitle', "Accessibility Options")
            });
            win.setMenuBarVisibility(false);
            win.loadURL('chrome://accessibility');
        };
        CodeMenu.prototype.getUpdateMenuItems = function () {
            var _this = this;
            var state = this.updateService.state;
            switch (state.type) {
                case update_1.StateType.Uninitialized:
                    return [];
                case update_1.StateType.Idle:
                    return [new electron_1.MenuItem({
                            label: nls.localize('miCheckForUpdates', "Check for Updates..."), click: function () { return setTimeout(function () {
                                _this.reportMenuActionTelemetry('CheckForUpdate');
                                _this.updateService.checkForUpdates(true);
                            }, 0); }
                        })];
                case update_1.StateType.CheckingForUpdates:
                    return [new electron_1.MenuItem({ label: nls.localize('miCheckingForUpdates', "Checking For Updates..."), enabled: false })];
                case update_1.StateType.AvailableForDownload:
                    return [new electron_1.MenuItem({
                            label: nls.localize('miDownloadUpdate', "Download Available Update"), click: function () {
                                _this.updateService.downloadUpdate();
                            }
                        })];
                case update_1.StateType.Downloading:
                    return [new electron_1.MenuItem({ label: nls.localize('miDownloadingUpdate', "Downloading Update..."), enabled: false })];
                case update_1.StateType.Downloaded:
                    return [new electron_1.MenuItem({
                            label: nls.localize('miInstallUpdate', "Install Update..."), click: function () {
                                _this.reportMenuActionTelemetry('InstallUpdate');
                                _this.updateService.applyUpdate();
                            }
                        })];
                case update_1.StateType.Updating:
                    return [new electron_1.MenuItem({ label: nls.localize('miInstallingUpdate', "Installing Update..."), enabled: false })];
                case update_1.StateType.Ready:
                    return [new electron_1.MenuItem({
                            label: nls.localize('miRestartToUpdate', "Restart to Update..."), click: function () {
                                _this.reportMenuActionTelemetry('RestartToUpdate');
                                _this.updateService.quitAndInstall();
                            }
                        })];
            }
        };
        CodeMenu.prototype.createMenuItem = function (arg1, arg2, arg3, arg4) {
            var _this = this;
            var label = this.mnemonicLabel(arg1);
            var click = (typeof arg2 === 'function') ? arg2 : function (menuItem, win, event) {
                var commandId = arg2;
                if (Array.isArray(arg2)) {
                    commandId = _this.isOptionClick(event) ? arg2[1] : arg2[0]; // support alternative action if we got multiple action Ids and the option key was pressed while invoking
                }
                _this.runActionInRenderer(commandId);
            };
            var enabled = typeof arg3 === 'boolean' ? arg3 : this.windowsMainService.getWindowCount() > 0;
            var checked = typeof arg4 === 'boolean' ? arg4 : false;
            var options = {
                label: label,
                click: click,
                enabled: enabled
            };
            if (checked) {
                options['type'] = 'checkbox';
                options['checked'] = checked;
            }
            var commandId;
            if (typeof arg2 === 'string') {
                commandId = arg2;
            }
            else if (Array.isArray(arg2)) {
                commandId = arg2[0];
            }
            return new electron_1.MenuItem(this.withKeybinding(commandId, options));
        };
        CodeMenu.prototype.createContextAwareMenuItem = function (label, commandId, clickHandler) {
            var _this = this;
            return new electron_1.MenuItem(this.withKeybinding(commandId, {
                label: this.mnemonicLabel(label),
                enabled: this.windowsMainService.getWindowCount() > 0,
                click: function () {
                    // No Active Window
                    var activeWindow = _this.windowsMainService.getFocusedWindow();
                    if (!activeWindow) {
                        return clickHandler.inNoWindow();
                    }
                    // DevTools focused
                    if (activeWindow.win.webContents.isDevToolsFocused()) {
                        return clickHandler.inDevTools(activeWindow.win.webContents.devToolsWebContents);
                    }
                    // Finally execute command in Window
                    _this.runActionInRenderer(commandId);
                }
            }));
        };
        CodeMenu.prototype.runActionInRenderer = function (id) {
            // We make sure to not run actions when the window has no focus, this helps
            // for https://github.com/Microsoft/vscode/issues/25907 and specifically for
            // https://github.com/Microsoft/vscode/issues/11928
            var activeWindow = this.windowsMainService.getFocusedWindow();
            if (activeWindow) {
                this.windowsMainService.sendToFocused('vscode:runAction', { id: id, from: 'menu' });
            }
        };
        CodeMenu.prototype.withKeybinding = function (commandId, options) {
            var binding = this.keybindingsResolver.getKeybinding(commandId);
            // Apply binding if there is one
            if (binding && binding.label) {
                // if the binding is native, we can just apply it
                if (binding.isNative) {
                    options.accelerator = binding.label;
                }
                else {
                    var bindingIndex = options.label.indexOf('[');
                    if (bindingIndex >= 0) {
                        options.label = options.label.substr(0, bindingIndex) + " [" + binding.label + "]";
                    }
                    else {
                        options.label = options.label + " [" + binding.label + "]";
                    }
                }
            }
            else {
                options.accelerator = void 0;
            }
            return options;
        };
        CodeMenu.prototype.likeAction = function (commandId, options, setAccelerator) {
            var _this = this;
            if (setAccelerator === void 0) { setAccelerator = !options.accelerator; }
            if (setAccelerator) {
                options = this.withKeybinding(commandId, options);
            }
            var originalClick = options.click;
            options.click = function (item, window, event) {
                _this.reportMenuActionTelemetry(commandId);
                if (originalClick) {
                    originalClick(item, window, event);
                }
            };
            return options;
        };
        CodeMenu.prototype.openUrl = function (url, id) {
            electron_1.shell.openExternal(url);
            this.reportMenuActionTelemetry(id);
        };
        CodeMenu.prototype.reportMenuActionTelemetry = function (id) {
            /* __GDPR__
                "workbenchActionExecuted" : {
                    "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('workbenchActionExecuted', { id: id, from: telemetryFrom });
        };
        CodeMenu.prototype.mnemonicLabel = function (label) {
            return labels_1.mnemonicMenuLabel(label, !this.currentEnableMenuBarMnemonics);
        };
        CodeMenu.MAX_MENU_RECENT_ENTRIES = 10;
        CodeMenu = __decorate([
            __param(0, update_1.IUpdateService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, configuration_1.IConfigurationService),
            __param(3, windows_2.IWindowsMainService),
            __param(4, windows_1.IWindowsService),
            __param(5, environment_1.IEnvironmentService),
            __param(6, telemetry_1.ITelemetryService),
            __param(7, history_1.IHistoryMainService)
        ], CodeMenu);
        return CodeMenu;
    }());
    exports.CodeMenu = CodeMenu;
    function __separator__() {
        return new electron_1.MenuItem({ type: 'separator' });
    }
});
