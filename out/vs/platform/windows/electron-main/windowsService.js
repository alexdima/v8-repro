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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/uri", "vs/platform/node/product", "vs/platform/windows/common/windows", "vs/platform/environment/common/environment", "electron", "vs/base/common/event", "vs/platform/url/common/url", "vs/platform/lifecycle/electron-main/lifecycleMain", "vs/platform/windows/electron-main/windows", "vs/platform/history/common/history", "vs/base/common/network", "vs/base/common/labels", "vs/base/common/platform"], function (require, exports, nls, winjs_base_1, lifecycle_1, objects_1, uri_1, product_1, windows_1, environment_1, electron_1, event_1, url_1, lifecycleMain_1, windows_2, history_1, network_1, labels_1, platform_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindowsService = /** @class */ (function () {
        function WindowsService(sharedProcess, windowsMainService, environmentService, urlService, lifecycleService, historyService) {
            var _this = this;
            this.sharedProcess = sharedProcess;
            this.windowsMainService = windowsMainService;
            this.environmentService = environmentService;
            this.lifecycleService = lifecycleService;
            this.historyService = historyService;
            this.disposables = [];
            this.onWindowOpen = event_1.fromNodeEventEmitter(electron_1.app, 'browser-window-created', function (_, w) { return w.id; });
            this.onWindowFocus = event_1.fromNodeEventEmitter(electron_1.app, 'browser-window-focus', function (_, w) { return w.id; });
            this.onWindowBlur = event_1.fromNodeEventEmitter(electron_1.app, 'browser-window-blur', function (_, w) { return w.id; });
            // Catch file URLs
            event_1.chain(urlService.onOpenURL)
                .filter(function (uri) { return uri.authority === network_1.Schemas.file && !!uri.path; })
                .map(function (uri) { return uri_1.default.file(uri.fsPath); })
                .on(this.openFileForURI, this, this.disposables);
            // Catch extension URLs when there are no windows open
            event_1.chain(urlService.onOpenURL)
                .filter(function (uri) { return /^extension/.test(uri.path); })
                .filter(function () { return _this.windowsMainService.getWindowCount() === 0; })
                .on(this.openExtensionForURI, this, this.disposables);
        }
        WindowsService.prototype.pickFileFolderAndOpen = function (options) {
            this.windowsMainService.pickFileFolderAndOpen(options);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.pickFileAndOpen = function (options) {
            this.windowsMainService.pickFileAndOpen(options);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.pickFolderAndOpen = function (options) {
            this.windowsMainService.pickFolderAndOpen(options);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.pickWorkspaceAndOpen = function (options) {
            this.windowsMainService.pickWorkspaceAndOpen(options);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.showMessageBox = function (windowId, options) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            return this.windowsMainService.showMessageBox(options, codeWindow);
        };
        WindowsService.prototype.showSaveDialog = function (windowId, options) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            return this.windowsMainService.showSaveDialog(options, codeWindow);
        };
        WindowsService.prototype.showOpenDialog = function (windowId, options) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            return this.windowsMainService.showOpenDialog(options, codeWindow);
        };
        WindowsService.prototype.reloadWindow = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                this.windowsMainService.reload(codeWindow);
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.openDevTools = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.win.webContents.openDevTools();
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.toggleDevTools = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                var contents = codeWindow.win.webContents;
                if (codeWindow.hasHiddenTitleBarStyle() && !codeWindow.win.isFullScreen() && !contents.isDevToolsOpened()) {
                    contents.openDevTools({ mode: 'undocked' }); // due to https://github.com/electron/electron/issues/3647
                }
                else {
                    contents.toggleDevTools();
                }
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.updateTouchBar = function (windowId, items) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.updateTouchBar(items);
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.closeWorkspace = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                this.windowsMainService.closeWorkspace(codeWindow);
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.createAndEnterWorkspace = function (windowId, folders, path) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                return this.windowsMainService.createAndEnterWorkspace(codeWindow, folders, path);
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.saveAndEnterWorkspace = function (windowId, path) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                return this.windowsMainService.saveAndEnterWorkspace(codeWindow, path);
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.toggleFullScreen = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.toggleFullScreen();
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.setRepresentedFilename = function (windowId, fileName) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.setRepresentedFilename(fileName);
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.addRecentlyOpened = function (files) {
            this.historyService.addRecentlyOpened(void 0, files);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.removeFromRecentlyOpened = function (paths) {
            this.historyService.removeFromRecentlyOpened(paths);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.clearRecentlyOpened = function () {
            this.historyService.clearRecentlyOpened();
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.getRecentlyOpened = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                return winjs_base_1.TPromise.as(this.historyService.getRecentlyOpened(codeWindow.config.workspace || codeWindow.config.folderPath, codeWindow.config.filesToOpen));
            }
            return winjs_base_1.TPromise.as(this.historyService.getRecentlyOpened());
        };
        WindowsService.prototype.showPreviousWindowTab = function () {
            electron_1.Menu.sendActionToFirstResponder('selectPreviousTab:');
            return winjs_base_1.TPromise.as(void 0);
        };
        WindowsService.prototype.showNextWindowTab = function () {
            electron_1.Menu.sendActionToFirstResponder('selectNextTab:');
            return winjs_base_1.TPromise.as(void 0);
        };
        WindowsService.prototype.moveWindowTabToNewWindow = function () {
            electron_1.Menu.sendActionToFirstResponder('moveTabToNewWindow:');
            return winjs_base_1.TPromise.as(void 0);
        };
        WindowsService.prototype.mergeAllWindowTabs = function () {
            electron_1.Menu.sendActionToFirstResponder('mergeAllWindows:');
            return winjs_base_1.TPromise.as(void 0);
        };
        WindowsService.prototype.toggleWindowTabsBar = function () {
            electron_1.Menu.sendActionToFirstResponder('toggleTabBar:');
            return winjs_base_1.TPromise.as(void 0);
        };
        WindowsService.prototype.focusWindow = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.win.focus();
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.closeWindow = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.win.close();
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.isFocused = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                return winjs_base_1.TPromise.as(codeWindow.win.isFocused());
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.isMaximized = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                return winjs_base_1.TPromise.as(codeWindow.win.isMaximized());
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.maximizeWindow = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.win.maximize();
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.unmaximizeWindow = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.win.unmaximize();
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.onWindowTitleDoubleClick = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.onWindowTitleDoubleClick();
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.setDocumentEdited = function (windowId, flag) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow && codeWindow.win.isDocumentEdited() !== flag) {
                codeWindow.win.setDocumentEdited(flag);
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.openWindow = function (paths, options) {
            if (!paths || !paths.length) {
                return winjs_base_1.TPromise.as(null);
            }
            this.windowsMainService.open({
                context: windows_1.OpenContext.API,
                cli: this.environmentService.args,
                pathsToOpen: paths,
                forceNewWindow: options && options.forceNewWindow,
                forceReuseWindow: options && options.forceReuseWindow,
                forceOpenWorkspaceAsFile: options && options.forceOpenWorkspaceAsFile
            });
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.openNewWindow = function () {
            this.windowsMainService.openNewWindow(windows_1.OpenContext.API);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.showWindow = function (windowId) {
            var codeWindow = this.windowsMainService.getWindowById(windowId);
            if (codeWindow) {
                codeWindow.win.show();
            }
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.getWindows = function () {
            var windows = this.windowsMainService.getWindows();
            var result = windows.map(function (w) { return ({ id: w.id, workspace: w.openedWorkspace, openedFolderPath: w.openedFolderPath, title: w.win.getTitle(), filename: w.getRepresentedFilename() }); });
            return winjs_base_1.TPromise.as(result);
        };
        WindowsService.prototype.getWindowCount = function () {
            return winjs_base_1.TPromise.as(this.windowsMainService.getWindows().length);
        };
        WindowsService.prototype.log = function (severity) {
            var messages = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                messages[_i - 1] = arguments[_i];
            }
            (_a = console[severity]).apply.apply(_a, [console].concat(messages));
            return winjs_base_1.TPromise.as(null);
            var _a;
        };
        WindowsService.prototype.showItemInFolder = function (path) {
            electron_1.shell.showItemInFolder(path);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.openExternal = function (url) {
            return winjs_base_1.TPromise.as(electron_1.shell.openExternal(url));
        };
        WindowsService.prototype.startCrashReporter = function (config) {
            electron_1.crashReporter.start(config);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.quit = function () {
            this.windowsMainService.quit();
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.relaunch = function (options) {
            this.lifecycleService.relaunch(options);
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.whenSharedProcessReady = function () {
            return this.sharedProcess.whenReady();
        };
        WindowsService.prototype.toggleSharedProcess = function () {
            this.sharedProcess.toggle();
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.openAboutDialog = function () {
            var lastActiveWindow = this.windowsMainService.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
            var detail = nls.localize('aboutDetail', "Version {0}\nCommit {1}\nDate {2}\nShell {3}\nRenderer {4}\nNode {5}\nArchitecture {6}", electron_1.app.getVersion(), product_1.default.commit || 'Unknown', product_1.default.date || 'Unknown', process.versions['electron'], process.versions['chrome'], process.versions['node'], process.arch);
            var buttons = [nls.localize('okButton', "OK")];
            if (platform_1.isWindows) {
                buttons.push(labels_1.mnemonicButtonLabel(nls.localize({ key: 'copy', comment: ['&& denotes a mnemonic'] }, "&&Copy"))); // https://github.com/Microsoft/vscode/issues/37608
            }
            this.windowsMainService.showMessageBox({
                title: product_1.default.nameLong,
                type: 'info',
                message: product_1.default.nameLong,
                detail: "\n" + detail,
                buttons: buttons,
                noLink: true
            }, lastActiveWindow).then(function (result) {
                if (platform_1.isWindows && result.button === 1) {
                    electron_1.clipboard.writeText(detail);
                }
            });
            return winjs_base_1.TPromise.as(null);
        };
        WindowsService.prototype.openFileForURI = function (uri) {
            var cli = objects_1.assign(Object.create(null), this.environmentService.args, { goto: true });
            var pathsToOpen = [uri.fsPath];
            this.windowsMainService.open({ context: windows_1.OpenContext.API, cli: cli, pathsToOpen: pathsToOpen });
            return winjs_base_1.TPromise.as(null);
        };
        /**
         * This should only fire whenever an extension URL is open
         * and there are no windows to handle it.
         */
        WindowsService.prototype.openExtensionForURI = function (uri) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var cli, window;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cli = objects_1.assign(Object.create(null), this.environmentService.args);
                            return [4 /*yield*/, this.windowsMainService.open({ context: windows_1.OpenContext.API, cli: cli })[0]];
                        case 1:
                            window = _a.sent();
                            if (!window) {
                                return [2 /*return*/];
                            }
                            window.win.show();
                            return [2 /*return*/];
                    }
                });
            });
        };
        WindowsService.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        WindowsService = __decorate([
            __param(1, windows_2.IWindowsMainService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, url_1.IURLService),
            __param(4, lifecycleMain_1.ILifecycleService),
            __param(5, history_1.IHistoryMainService)
        ], WindowsService);
        return WindowsService;
    }());
    exports.WindowsService = WindowsService;
});
