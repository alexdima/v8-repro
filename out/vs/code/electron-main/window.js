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
define(["require", "exports", "path", "vs/base/common/objects", "vs/nls", "vs/base/common/uri", "vs/platform/state/common/state", "electron", "vs/base/common/winjs.base", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/configuration/common/configuration", "vs/platform/environment/node/argv", "vs/platform/node/product", "vs/platform/windows/common/windows", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/workspaces/common/workspaces", "vs/platform/backup/common/backup", "vs/base/common/performance", "vs/platform/extensionManagement/node/extensionGalleryService"], function (require, exports, path, objects, nls, uri_1, state_1, electron_1, winjs_base_1, environment_1, log_1, configuration_1, argv_1, product_1, windows_1, lifecycle_1, platform_1, workspaces_1, backup_1, performance_1, extensionGalleryService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindowMode;
    (function (WindowMode) {
        WindowMode[WindowMode["Maximized"] = 0] = "Maximized";
        WindowMode[WindowMode["Normal"] = 1] = "Normal";
        WindowMode[WindowMode["Minimized"] = 2] = "Minimized";
        WindowMode[WindowMode["Fullscreen"] = 3] = "Fullscreen";
    })(WindowMode = exports.WindowMode || (exports.WindowMode = {}));
    exports.defaultWindowState = function (mode) {
        if (mode === void 0) { mode = WindowMode.Normal; }
        return {
            width: 1024,
            height: 768,
            mode: mode
        };
    };
    var CodeWindow = /** @class */ (function () {
        function CodeWindow(config, logService, environmentService, configurationService, stateService, workspacesMainService, backupMainService) {
            this.logService = logService;
            this.environmentService = environmentService;
            this.configurationService = configurationService;
            this.stateService = stateService;
            this.workspacesMainService = workspacesMainService;
            this.backupMainService = backupMainService;
            this.touchBarGroups = [];
            this._lastFocusTime = -1;
            this._readyState = windows_1.ReadyState.NONE;
            this.whenReadyCallbacks = [];
            this.toDispose = [];
            // create browser window
            this.createBrowserWindow(config);
            // respect configured menu bar visibility
            this.onConfigurationUpdated();
            // macOS: touch bar support
            this.createTouchBar();
            // Request handling
            this.handleMarketplaceRequests();
            // Eventing
            this.registerListeners();
        }
        CodeWindow.prototype.createBrowserWindow = function (config) {
            // Load window state
            this.windowState = this.restoreWindowState(config.state);
            // in case we are maximized or fullscreen, only show later after the call to maximize/fullscreen (see below)
            var isFullscreenOrMaximized = (this.windowState.mode === WindowMode.Maximized || this.windowState.mode === WindowMode.Fullscreen);
            var backgroundColor = this.getBackgroundColor();
            if (platform_1.isMacintosh && backgroundColor.toUpperCase() === CodeWindow.DEFAULT_BG_DARK) {
                backgroundColor = '#171717'; // https://github.com/electron/electron/issues/5150
            }
            var options = {
                width: this.windowState.width,
                height: this.windowState.height,
                x: this.windowState.x,
                y: this.windowState.y,
                backgroundColor: backgroundColor,
                minWidth: CodeWindow.MIN_WIDTH,
                minHeight: CodeWindow.MIN_HEIGHT,
                show: !isFullscreenOrMaximized,
                title: product_1.default.nameLong,
                webPreferences: {
                    'backgroundThrottling': false,
                    disableBlinkFeatures: 'Auxclick' // disable auxclick events (see https://developers.google.com/web/updates/2016/10/auxclick)
                }
            };
            if (platform_1.isLinux) {
                options.icon = path.join(this.environmentService.appRoot, 'resources/linux/code.png'); // Windows and Mac are better off using the embedded icon(s)
            }
            var windowConfig = this.configurationService.getValue('window');
            var useNativeTabs = false;
            if (windowConfig && windowConfig.nativeTabs) {
                options.tabbingIdentifier = product_1.default.nameShort; // this opts in to sierra tabs
                useNativeTabs = true;
            }
            var useCustomTitleStyle = false;
            if (platform_1.isMacintosh && (!windowConfig || !windowConfig.titleBarStyle || windowConfig.titleBarStyle === 'custom')) {
                var isDev = !this.environmentService.isBuilt || !!config.extensionDevelopmentPath;
                if (!isDev) {
                    useCustomTitleStyle = true; // not enabled when developing due to https://github.com/electron/electron/issues/3647
                }
            }
            if (useNativeTabs) {
                useCustomTitleStyle = false; // native tabs on sierra do not work with custom title style
            }
            if (useCustomTitleStyle) {
                options.titleBarStyle = 'hidden';
                this.hiddenTitleBarStyle = true;
            }
            // Create the browser window.
            this._win = new electron_1.BrowserWindow(options);
            this._id = this._win.id;
            // Bug in Electron (https://github.com/electron/electron/issues/10862). On multi-monitor setups,
            // it can happen that the position we set to the window is not the correct one on the display.
            // To workaround, we ask the window for its position and set it again if not matching.
            // This only applies if the window is not fullscreen or maximized and multiple monitors are used.
            if (platform_1.isWindows && !isFullscreenOrMaximized) {
                try {
                    if (electron_1.screen.getAllDisplays().length > 1) {
                        var _a = this._win.getPosition(), x = _a[0], y = _a[1];
                        if (x !== this.windowState.x || y !== this.windowState.y) {
                            this._win.setPosition(this.windowState.x, this.windowState.y, false);
                        }
                    }
                }
                catch (err) {
                    this.logService.warn("Unexpected error fixing window position on windows with multiple windows: " + err + "\n" + err.stack);
                }
            }
            if (useCustomTitleStyle) {
                this._win.setSheetOffset(22); // offset dialogs by the height of the custom title bar if we have any
            }
            // Set relaunch command
            if (platform_1.isWindows && product_1.default.win32AppUserModelId && typeof this._win.setAppDetails === 'function') {
                this._win.setAppDetails({
                    appId: product_1.default.win32AppUserModelId,
                    relaunchCommand: "\"" + process.execPath + "\" -n",
                    relaunchDisplayName: product_1.default.nameLong
                });
            }
            if (isFullscreenOrMaximized) {
                this._win.maximize();
                if (this.windowState.mode === WindowMode.Fullscreen) {
                    this._win.setFullScreen(true);
                }
                if (!this._win.isVisible()) {
                    this._win.show(); // to reduce flicker from the default window size to maximize, we only show after maximize
                }
            }
            this._lastFocusTime = Date.now(); // since we show directly, we need to set the last focus time too
        };
        CodeWindow.prototype.hasHiddenTitleBarStyle = function () {
            return this.hiddenTitleBarStyle;
        };
        Object.defineProperty(CodeWindow.prototype, "isExtensionDevelopmentHost", {
            get: function () {
                return !!this.config.extensionDevelopmentPath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeWindow.prototype, "isExtensionTestHost", {
            get: function () {
                return !!this.config.extensionTestsPath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeWindow.prototype, "extensionDevelopmentPath", {
            get: function () {
                return this.config.extensionDevelopmentPath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeWindow.prototype, "config", {
            get: function () {
                return this.currentConfig;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeWindow.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeWindow.prototype, "win", {
            get: function () {
                return this._win;
            },
            enumerable: true,
            configurable: true
        });
        CodeWindow.prototype.setRepresentedFilename = function (filename) {
            if (platform_1.isMacintosh) {
                this.win.setRepresentedFilename(filename);
            }
            else {
                this.representedFilename = filename;
            }
        };
        CodeWindow.prototype.getRepresentedFilename = function () {
            if (platform_1.isMacintosh) {
                return this.win.getRepresentedFilename();
            }
            return this.representedFilename;
        };
        CodeWindow.prototype.focus = function () {
            if (!this._win) {
                return;
            }
            if (this._win.isMinimized()) {
                this._win.restore();
            }
            this._win.focus();
        };
        Object.defineProperty(CodeWindow.prototype, "lastFocusTime", {
            get: function () {
                return this._lastFocusTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeWindow.prototype, "backupPath", {
            get: function () {
                return this.currentConfig ? this.currentConfig.backupPath : void 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeWindow.prototype, "openedWorkspace", {
            get: function () {
                return this.currentConfig ? this.currentConfig.workspace : void 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CodeWindow.prototype, "openedFolderPath", {
            get: function () {
                return this.currentConfig ? this.currentConfig.folderPath : void 0;
            },
            enumerable: true,
            configurable: true
        });
        CodeWindow.prototype.setReady = function () {
            this._readyState = windows_1.ReadyState.READY;
            // inform all waiting promises that we are ready now
            while (this.whenReadyCallbacks.length) {
                this.whenReadyCallbacks.pop()(this);
            }
        };
        CodeWindow.prototype.ready = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (c) {
                if (_this._readyState === windows_1.ReadyState.READY) {
                    return c(_this);
                }
                // otherwise keep and call later when we are ready
                _this.whenReadyCallbacks.push(c);
            });
        };
        Object.defineProperty(CodeWindow.prototype, "readyState", {
            get: function () {
                return this._readyState;
            },
            enumerable: true,
            configurable: true
        });
        CodeWindow.prototype.handleMarketplaceRequests = function () {
            var _this = this;
            // Resolve marketplace headers
            this.marketplaceHeadersPromise = extensionGalleryService_1.resolveMarketplaceHeaders(this.environmentService);
            // Inject headers when requests are incoming
            var urls = ['https://marketplace.visualstudio.com/*', 'https://*.vsassets.io/*'];
            this._win.webContents.session.webRequest.onBeforeSendHeaders({ urls: urls }, function (details, cb) {
                _this.marketplaceHeadersPromise.done(function (headers) {
                    cb({ cancel: false, requestHeaders: objects.assign(details.requestHeaders, headers) });
                });
            });
        };
        CodeWindow.prototype.registerListeners = function () {
            var _this = this;
            // Prevent loading of svgs
            this._win.webContents.session.webRequest.onBeforeRequest(null, function (details, callback) {
                if (details.url.indexOf('.svg') > 0) {
                    var uri = uri_1.default.parse(details.url);
                    if (uri && !uri.scheme.match(/file/i) && uri.path.endsWith('.svg')) {
                        return callback({ cancel: true });
                    }
                }
                return callback({});
            });
            this._win.webContents.session.webRequest.onHeadersReceived(null, function (details, callback) {
                var contentType = (details.responseHeaders['content-type'] || details.responseHeaders['Content-Type']);
                if (contentType && Array.isArray(contentType) && contentType.some(function (x) { return x.toLowerCase().indexOf('image/svg') >= 0; })) {
                    return callback({ cancel: true });
                }
                return callback({ cancel: false, responseHeaders: details.responseHeaders });
            });
            // Remember that we loaded
            this._win.webContents.on('did-finish-load', function () {
                _this._readyState = windows_1.ReadyState.LOADING;
                // Associate properties from the load request if provided
                if (_this.pendingLoadConfig) {
                    _this.currentConfig = _this.pendingLoadConfig;
                    _this.pendingLoadConfig = null;
                }
                // To prevent flashing, we set the window visible after the page has finished to load but before Code is loaded
                if (!_this._win.isVisible()) {
                    if (_this.windowState.mode === WindowMode.Maximized) {
                        _this._win.maximize();
                    }
                    if (!_this._win.isVisible()) {
                        _this._win.show();
                    }
                }
            });
            // App commands support
            this.registerNavigationListenerOn('app-command', 'browser-backward', 'browser-forward', false);
            // Handle code that wants to open links
            this._win.webContents.on('new-window', function (event, url) {
                event.preventDefault();
                electron_1.shell.openExternal(url);
            });
            // Window Focus
            this._win.on('focus', function () {
                _this._lastFocusTime = Date.now();
            });
            // Window Fullscreen
            this._win.on('enter-full-screen', function () {
                _this.sendWhenReady('vscode:enterFullScreen');
            });
            this._win.on('leave-full-screen', function () {
                _this.sendWhenReady('vscode:leaveFullScreen');
            });
            // Window Failed to load
            this._win.webContents.on('did-fail-load', function (event, errorCode, errorDescription, validatedURL, isMainFrame) {
                _this.logService.warn('[electron event]: fail to load, ', errorDescription);
            });
            // Prevent any kind of navigation triggered by the user!
            // But do not touch this in dev version because it will prevent "Reload" from dev tools
            if (this.environmentService.isBuilt) {
                this._win.webContents.on('will-navigate', function (event) {
                    if (event) {
                        event.preventDefault();
                    }
                });
            }
            // Handle configuration changes
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationUpdated(); }));
            // Handle Workspace events
            this.toDispose.push(this.workspacesMainService.onUntitledWorkspaceDeleted(function (e) { return _this.onUntitledWorkspaceDeleted(e); }));
        };
        CodeWindow.prototype.onUntitledWorkspaceDeleted = function (workspace) {
            // Make sure to update our workspace config if we detect that it
            // was deleted
            if (this.openedWorkspace && this.openedWorkspace.id === workspace.id) {
                this.currentConfig.workspace = void 0;
            }
        };
        CodeWindow.prototype.onConfigurationUpdated = function () {
            var newMenuBarVisibility = this.getMenuBarVisibility();
            if (newMenuBarVisibility !== this.currentMenuBarVisibility) {
                this.currentMenuBarVisibility = newMenuBarVisibility;
                this.setMenuBarVisibility(newMenuBarVisibility);
            }
            // Swipe command support (macOS)
            if (platform_1.isMacintosh) {
                var config = this.configurationService.getValue();
                if (config && config.workbench && config.workbench.editor && config.workbench.editor.swipeToNavigate) {
                    this.registerNavigationListenerOn('swipe', 'left', 'right', true);
                }
                else {
                    this._win.removeAllListeners('swipe');
                }
            }
        };
        CodeWindow.prototype.registerNavigationListenerOn = function (command, back, forward, acrossEditors) {
            var _this = this;
            this._win.on(command /* | 'app-command' */, function (e, cmd) {
                if (_this.readyState !== windows_1.ReadyState.READY) {
                    return; // window must be ready
                }
                if (cmd === back) {
                    _this.send('vscode:runAction', { id: acrossEditors ? 'workbench.action.openPreviousRecentlyUsedEditor' : 'workbench.action.navigateBack', from: 'mouse' });
                }
                else if (cmd === forward) {
                    _this.send('vscode:runAction', { id: acrossEditors ? 'workbench.action.openNextRecentlyUsedEditor' : 'workbench.action.navigateForward', from: 'mouse' });
                }
            });
        };
        CodeWindow.prototype.load = function (config, isReload) {
            var _this = this;
            // If this is the first time the window is loaded, we associate the paths
            // directly with the window because we assume the loading will just work
            if (this.readyState === windows_1.ReadyState.NONE) {
                this.currentConfig = config;
            }
            else {
                this.pendingLoadConfig = config;
                this._readyState = windows_1.ReadyState.NAVIGATING;
            }
            // Clear Document Edited if needed
            if (platform_1.isMacintosh && this._win.isDocumentEdited()) {
                if (!isReload || !this.backupMainService.isHotExitEnabled()) {
                    this._win.setDocumentEdited(false);
                }
            }
            // Clear Title and Filename if needed
            if (!isReload) {
                if (this.getRepresentedFilename()) {
                    this.setRepresentedFilename('');
                }
                this._win.setTitle(product_1.default.nameLong);
            }
            // Load URL
            performance_1.mark('main:loadWindow');
            this._win.loadURL(this.getUrl(config));
            // Make window visible if it did not open in N seconds because this indicates an error
            // Only do this when running out of sources and not when running tests
            if (!this.environmentService.isBuilt && !this.environmentService.extensionTestsPath) {
                this.showTimeoutHandle = setTimeout(function () {
                    if (_this._win && !_this._win.isVisible() && !_this._win.isMinimized()) {
                        _this._win.show();
                        _this._win.focus();
                        _this._win.webContents.openDevTools();
                    }
                }, 10000);
            }
        };
        CodeWindow.prototype.reload = function (configuration, cli) {
            // If config is not provided, copy our current one
            if (!configuration) {
                configuration = objects.mixin({}, this.currentConfig);
            }
            // Delete some properties we do not want during reload
            delete configuration.filesToOpen;
            delete configuration.filesToCreate;
            delete configuration.filesToDiff;
            delete configuration.filesToWait;
            // Some configuration things get inherited if the window is being reloaded and we are
            // in extension development mode. These options are all development related.
            if (this.isExtensionDevelopmentHost && cli) {
                configuration.verbose = cli.verbose;
                configuration.debugPluginHost = cli.debugPluginHost;
                configuration.debugBrkPluginHost = cli.debugBrkPluginHost;
                configuration.debugId = cli.debugId;
                configuration['extensions-dir'] = cli['extensions-dir'];
            }
            configuration.isInitialStartup = false; // since this is a reload
            // Load config
            this.load(configuration, true);
        };
        CodeWindow.prototype.getUrl = function (windowConfiguration) {
            // Set window ID
            windowConfiguration.windowId = this._win.id;
            windowConfiguration.logLevel = this.logService.getLevel();
            // Set zoomlevel
            var windowConfig = this.configurationService.getValue('window');
            var zoomLevel = windowConfig && windowConfig.zoomLevel;
            if (typeof zoomLevel === 'number') {
                windowConfiguration.zoomLevel = zoomLevel;
            }
            // Set fullscreen state
            windowConfiguration.fullscreen = this._win.isFullScreen();
            // Set Accessibility Config
            windowConfiguration.highContrast = platform_1.isWindows && electron_1.systemPreferences.isInvertedColorScheme() && (!windowConfig || windowConfig.autoDetectHighContrast);
            windowConfiguration.accessibilitySupport = electron_1.app.isAccessibilitySupportEnabled();
            // Theme
            windowConfiguration.baseTheme = this.getBaseTheme();
            windowConfiguration.backgroundColor = this.getBackgroundColor();
            // Perf Counters
            windowConfiguration.perfEntries = performance_1.exportEntries();
            windowConfiguration.perfStartTime = global.perfStartTime;
            windowConfiguration.perfWindowLoadTime = Date.now();
            // Config (combination of process.argv and window configuration)
            var environment = argv_1.parseArgs(process.argv);
            var config = objects.assign(environment, windowConfiguration);
            for (var key in config) {
                if (config[key] === void 0 || config[key] === null || config[key] === '') {
                    delete config[key]; // only send over properties that have a true value
                }
            }
            return require.toUrl('vs/workbench/electron-browser/bootstrap/index.html') + "?config=" + encodeURIComponent(JSON.stringify(config));
        };
        CodeWindow.prototype.getBaseTheme = function () {
            if (platform_1.isWindows && electron_1.systemPreferences.isInvertedColorScheme()) {
                return 'hc-black';
            }
            var theme = this.stateService.getItem(CodeWindow.themeStorageKey, 'vs-dark');
            return theme.split(' ')[0];
        };
        CodeWindow.prototype.getBackgroundColor = function () {
            if (platform_1.isWindows && electron_1.systemPreferences.isInvertedColorScheme()) {
                return CodeWindow.DEFAULT_BG_HC_BLACK;
            }
            var background = this.stateService.getItem(CodeWindow.themeBackgroundStorageKey, null);
            if (!background) {
                var baseTheme = this.getBaseTheme();
                return baseTheme === 'hc-black' ? CodeWindow.DEFAULT_BG_HC_BLACK : (baseTheme === 'vs' ? CodeWindow.DEFAULT_BG_LIGHT : CodeWindow.DEFAULT_BG_DARK);
            }
            return background;
        };
        CodeWindow.prototype.serializeWindowState = function () {
            if (!this._win) {
                return exports.defaultWindowState();
            }
            // fullscreen gets special treatment
            if (this._win.isFullScreen()) {
                var display = electron_1.screen.getDisplayMatching(this.getBounds());
                return {
                    mode: WindowMode.Fullscreen,
                    display: display ? display.id : void 0,
                    // still carry over window dimensions from previous sessions!
                    width: this.windowState.width,
                    height: this.windowState.height,
                    x: this.windowState.x,
                    y: this.windowState.y
                };
            }
            var state = Object.create(null);
            var mode;
            // get window mode
            if (!platform_1.isMacintosh && this._win.isMaximized()) {
                mode = WindowMode.Maximized;
            }
            else {
                mode = WindowMode.Normal;
            }
            // we don't want to save minimized state, only maximized or normal
            if (mode === WindowMode.Maximized) {
                state.mode = WindowMode.Maximized;
            }
            else {
                state.mode = WindowMode.Normal;
            }
            // only consider non-minimized window states
            if (mode === WindowMode.Normal || mode === WindowMode.Maximized) {
                var bounds = this.getBounds();
                state.x = bounds.x;
                state.y = bounds.y;
                state.width = bounds.width;
                state.height = bounds.height;
            }
            return state;
        };
        CodeWindow.prototype.restoreWindowState = function (state) {
            if (state) {
                try {
                    state = this.validateWindowState(state);
                }
                catch (err) {
                    this.logService.warn("Unexpected error validating window state: " + err + "\n" + err.stack); // somehow display API can be picky about the state to validate
                }
            }
            if (!state) {
                state = exports.defaultWindowState();
            }
            return state;
        };
        CodeWindow.prototype.validateWindowState = function (state) {
            if (!state) {
                return null;
            }
            if ([state.x, state.y, state.width, state.height].some(function (n) { return typeof n !== 'number'; })) {
                return null;
            }
            if (state.width <= 0 || state.height <= 0) {
                return null;
            }
            var displays = electron_1.screen.getAllDisplays();
            // Single Monitor: be strict about x/y positioning
            if (displays.length === 1) {
                var displayBounds = displays[0].bounds;
                // Careful with maximized: in that mode x/y can well be negative!
                if (state.mode !== WindowMode.Maximized && displayBounds.width > 0 && displayBounds.height > 0 /* Linux X11 sessions sometimes report wrong display bounds */) {
                    if (state.x < displayBounds.x) {
                        state.x = displayBounds.x; // prevent window from falling out of the screen to the left
                    }
                    if (state.y < displayBounds.y) {
                        state.y = displayBounds.y; // prevent window from falling out of the screen to the top
                    }
                    if (state.x > (displayBounds.x + displayBounds.width)) {
                        state.x = displayBounds.x; // prevent window from falling out of the screen to the right
                    }
                    if (state.y > (displayBounds.y + displayBounds.height)) {
                        state.y = displayBounds.y; // prevent window from falling out of the screen to the bottom
                    }
                    if (state.width > displayBounds.width) {
                        state.width = displayBounds.width; // prevent window from exceeding display bounds width
                    }
                    if (state.height > displayBounds.height) {
                        state.height = displayBounds.height; // prevent window from exceeding display bounds height
                    }
                }
                if (state.mode === WindowMode.Maximized) {
                    return exports.defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
                }
                return state;
            }
            // Multi Montior (fullscreen): try to find the previously used display
            if (state.display && state.mode === WindowMode.Fullscreen) {
                var display_1 = displays.filter(function (d) { return d.id === state.display; })[0];
                if (display_1 && display_1.bounds && typeof display_1.bounds.x === 'number' && typeof display_1.bounds.y === 'number') {
                    var defaults = exports.defaultWindowState(WindowMode.Fullscreen); // make sure we have good values when the user restores the window
                    defaults.x = display_1.bounds.x; // carefull to use displays x/y position so that the window ends up on the correct monitor
                    defaults.y = display_1.bounds.y;
                    return defaults;
                }
            }
            // Multi Monitor (non-fullscreen): be less strict because metrics can be crazy
            var bounds = { x: state.x, y: state.y, width: state.width, height: state.height };
            var display = electron_1.screen.getDisplayMatching(bounds);
            if (display && // we have a display matching the desired bounds
                bounds.x < display.bounds.x + display.bounds.width && // prevent window from falling out of the screen to the right
                bounds.y < display.bounds.y + display.bounds.height && // prevent window from falling out of the screen to the bottom
                bounds.x + bounds.width > display.bounds.x && // prevent window from falling out of the screen to the left
                bounds.y + bounds.height > display.bounds.y // prevent window from falling out of the scree nto the top
            ) {
                if (state.mode === WindowMode.Maximized) {
                    var defaults = exports.defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
                    defaults.x = state.x; // carefull to keep x/y position so that the window ends up on the correct monitor
                    defaults.y = state.y;
                    return defaults;
                }
                return state;
            }
            return null;
        };
        CodeWindow.prototype.getBounds = function () {
            var pos = this._win.getPosition();
            var dimension = this._win.getSize();
            return { x: pos[0], y: pos[1], width: dimension[0], height: dimension[1] };
        };
        CodeWindow.prototype.toggleFullScreen = function () {
            var willBeFullScreen = !this._win.isFullScreen();
            // set fullscreen flag on window
            this._win.setFullScreen(willBeFullScreen);
            // respect configured menu bar visibility or default to toggle if not set
            this.setMenuBarVisibility(this.currentMenuBarVisibility, false);
        };
        CodeWindow.prototype.getMenuBarVisibility = function () {
            var windowConfig = this.configurationService.getValue('window');
            if (!windowConfig || !windowConfig.menuBarVisibility) {
                return 'default';
            }
            var menuBarVisibility = windowConfig.menuBarVisibility;
            if (['visible', 'toggle', 'hidden'].indexOf(menuBarVisibility) < 0) {
                menuBarVisibility = 'default';
            }
            return menuBarVisibility;
        };
        CodeWindow.prototype.setMenuBarVisibility = function (visibility, notify) {
            var _this = this;
            if (notify === void 0) { notify = true; }
            if (platform_1.isMacintosh) {
                return; // ignore for macOS platform
            }
            var isFullscreen = this._win.isFullScreen();
            switch (visibility) {
                case ('default'):
                    this._win.setMenuBarVisibility(!isFullscreen);
                    this._win.setAutoHideMenuBar(isFullscreen);
                    break;
                case ('visible'):
                    this._win.setMenuBarVisibility(true);
                    this._win.setAutoHideMenuBar(false);
                    break;
                case ('toggle'):
                    this._win.setMenuBarVisibility(false);
                    this._win.setAutoHideMenuBar(true);
                    if (notify) {
                        this.send('vscode:showInfoMessage', nls.localize('hiddenMenuBar', "You can still access the menu bar by pressing the **Alt** key."));
                    }
                    break;
                case ('hidden'):
                    // for some weird reason that I have no explanation for, the menu bar is not hiding when calling
                    // this without timeout (see https://github.com/Microsoft/vscode/issues/19777). there seems to be
                    // a timing issue with us opening the first window and the menu bar getting created. somehow the
                    // fact that we want to hide the menu without being able to bring it back via Alt key makes Electron
                    // still show the menu. Unable to reproduce from a simple Hello World application though...
                    setTimeout(function () {
                        _this._win.setMenuBarVisibility(false);
                        _this._win.setAutoHideMenuBar(false);
                    });
                    break;
            }
        };
        CodeWindow.prototype.onWindowTitleDoubleClick = function () {
            // Respect system settings on mac with regards to title click on windows title
            if (platform_1.isMacintosh) {
                var action = electron_1.systemPreferences.getUserDefault('AppleActionOnDoubleClick', 'string');
                switch (action) {
                    case 'Minimize':
                        this.win.minimize();
                        break;
                    case 'None':
                        break;
                    case 'Maximize':
                    default:
                        this.win.maximize();
                }
            }
            else {
                if (this.win.isMaximized()) {
                    this.win.unmaximize();
                }
                else {
                    this.win.maximize();
                }
            }
        };
        CodeWindow.prototype.close = function () {
            if (this._win) {
                this._win.close();
            }
        };
        CodeWindow.prototype.sendWhenReady = function (channel) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.ready().then(function () {
                _this.send.apply(_this, [channel].concat(args));
            });
        };
        CodeWindow.prototype.send = function (channel) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            (_a = this._win.webContents).send.apply(_a, [channel].concat(args));
            var _a;
        };
        CodeWindow.prototype.updateTouchBar = function (groups) {
            var _this = this;
            if (!platform_1.isMacintosh) {
                return; // only supported on macOS
            }
            // Update segments for all groups. Setting the segments property
            // of the group directly prevents ugly flickering from happening
            this.touchBarGroups.forEach(function (touchBarGroup, index) {
                var commands = groups[index];
                touchBarGroup.segments = _this.createTouchBarGroupSegments(commands);
            });
        };
        CodeWindow.prototype.createTouchBar = function () {
            if (!platform_1.isMacintosh) {
                return; // only supported on macOS
            }
            // To avoid flickering, we try to reuse the touch bar group
            // as much as possible by creating a large number of groups
            // for reusing later.
            for (var i = 0; i < 10; i++) {
                var groupTouchBar = this.createTouchBarGroup();
                this.touchBarGroups.push(groupTouchBar);
            }
            // Ugly workaround for native crash on macOS 10.12.1. We are not
            // leveraging the API for changing the ESC touch bar item.
            // See https://github.com/electron/electron/issues/10442
            this._win._setEscapeTouchBarItem = function () { };
            this._win.setTouchBar(new electron_1.TouchBar({ items: this.touchBarGroups }));
        };
        CodeWindow.prototype.createTouchBarGroup = function (items) {
            var _this = this;
            if (items === void 0) { items = []; }
            // Group Segments
            var segments = this.createTouchBarGroupSegments(items);
            // Group Control
            var control = new electron_1.TouchBar.TouchBarSegmentedControl({
                segments: segments,
                mode: 'buttons',
                segmentStyle: 'automatic',
                change: function (selectedIndex) {
                    _this.sendWhenReady('vscode:runAction', { id: control.segments[selectedIndex].id, from: 'touchbar' });
                }
            });
            return control;
        };
        CodeWindow.prototype.createTouchBarGroupSegments = function (items) {
            if (items === void 0) { items = []; }
            var segments = items.map(function (item) {
                var icon;
                if (item.iconPath) {
                    icon = electron_1.nativeImage.createFromPath(item.iconPath.dark);
                    if (icon.isEmpty()) {
                        icon = void 0;
                    }
                }
                return {
                    id: item.id,
                    label: !icon ? item.title : void 0,
                    icon: icon
                };
            });
            return segments;
        };
        CodeWindow.prototype.dispose = function () {
            if (this.showTimeoutHandle) {
                clearTimeout(this.showTimeoutHandle);
            }
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            this._win = null; // Important to dereference the window object to allow for GC
        };
        CodeWindow.themeStorageKey = 'theme';
        CodeWindow.themeBackgroundStorageKey = 'themeBackground';
        CodeWindow.DEFAULT_BG_LIGHT = '#FFFFFF';
        CodeWindow.DEFAULT_BG_DARK = '#1E1E1E';
        CodeWindow.DEFAULT_BG_HC_BLACK = '#000000';
        CodeWindow.MIN_WIDTH = 200;
        CodeWindow.MIN_HEIGHT = 120;
        CodeWindow = __decorate([
            __param(1, log_1.ILogService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, state_1.IStateService),
            __param(5, workspaces_1.IWorkspacesMainService),
            __param(6, backup_1.IBackupMainService)
        ], CodeWindow);
        return CodeWindow;
    }());
    exports.CodeWindow = CodeWindow;
});
