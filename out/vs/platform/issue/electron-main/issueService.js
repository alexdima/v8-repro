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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/objects", "vs/platform/environment/node/argv", "electron", "vs/code/electron-main/launch", "vs/code/electron-main/diagnostics", "vs/platform/environment/common/environment", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log"], function (require, exports, winjs_base_1, nls_1, objects, argv_1, electron_1, launch_1, diagnostics_1, environment_1, platform_1, configuration_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_BACKGROUND_COLOR = '#1E1E1E';
    var IssueService = /** @class */ (function () {
        function IssueService(machineId, environmentService, launchService, configurationService, logService) {
            this.machineId = machineId;
            this.environmentService = environmentService;
            this.launchService = launchService;
            this.configurationService = configurationService;
            this.logService = logService;
        }
        IssueService.prototype.openReporter = function (data) {
            var _this = this;
            electron_1.ipcMain.on('issueSystemInfoRequest', function (event) {
                _this.getSystemInformation().then(function (msg) {
                    event.sender.send('issueSystemInfoResponse', msg);
                });
            });
            electron_1.ipcMain.on('issuePerformanceInfoRequest', function (event) {
                _this.getPerformanceInfo().then(function (msg) {
                    event.sender.send('issuePerformanceInfoResponse', msg);
                });
            });
            electron_1.ipcMain.on('workbenchCommand', function (event, arg) {
                _this._parentWindow.webContents.send('vscode:runAction', { id: arg, from: 'issueReporter' });
            });
            this._parentWindow = electron_1.BrowserWindow.getFocusedWindow();
            var position = this.getWindowPosition();
            this._issueWindow = new electron_1.BrowserWindow({
                width: position.width,
                height: position.height,
                minWidth: 300,
                minHeight: 200,
                x: position.x,
                y: position.y,
                title: nls_1.localize('issueReporter', "Issue Reporter"),
                backgroundColor: data.styles.backgroundColor || DEFAULT_BACKGROUND_COLOR
            });
            this._issueWindow.setMenuBarVisibility(false); // workaround for now, until a menu is implemented
            var features = {
                useDuplicateSearch: this.configurationService.getValue('issueReporter.searchDuplicates')
            };
            this.logService.trace('issueService#openReporter: opening issue reporter');
            this._issueWindow.loadURL(this.getIssueReporterPath(data, features));
            return winjs_base_1.TPromise.as(null);
        };
        IssueService.prototype.getWindowPosition = function () {
            // We want the new window to open on the same display that the parent is in
            var displayToUse;
            var displays = electron_1.screen.getAllDisplays();
            // Single Display
            if (displays.length === 1) {
                displayToUse = displays[0];
            }
            else {
                // on mac there is 1 menu per window so we need to use the monitor where the cursor currently is
                if (platform_1.isMacintosh) {
                    var cursorPoint = electron_1.screen.getCursorScreenPoint();
                    displayToUse = electron_1.screen.getDisplayNearestPoint(cursorPoint);
                }
                // if we have a last active window, use that display for the new window
                if (!displayToUse && this._parentWindow) {
                    displayToUse = electron_1.screen.getDisplayMatching(this._parentWindow.getBounds());
                }
                // fallback to primary display or first display
                if (!displayToUse) {
                    displayToUse = electron_1.screen.getPrimaryDisplay() || displays[0];
                }
            }
            var state = {
                width: 800,
                height: 900,
                x: undefined,
                y: undefined
            };
            var displayBounds = displayToUse.bounds;
            state.x = displayBounds.x + (displayBounds.width / 2) - (state.width / 2);
            state.y = displayBounds.y + (displayBounds.height / 2) - (state.height / 2);
            if (displayBounds.width > 0 && displayBounds.height > 0 /* Linux X11 sessions sometimes report wrong display bounds */) {
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
            return state;
        };
        IssueService.prototype.getSystemInformation = function () {
            var _this = this;
            return new winjs_base_1.Promise(function (resolve, reject) {
                _this.launchService.getMainProcessInfo().then(function (info) {
                    resolve(diagnostics_1.getSystemInfo(info));
                });
            });
        };
        IssueService.prototype.getPerformanceInfo = function () {
            var _this = this;
            return new winjs_base_1.Promise(function (resolve, reject) {
                _this.launchService.getMainProcessInfo().then(function (info) {
                    diagnostics_1.getPerformanceInfo(info)
                        .then(function (diagnosticInfo) {
                        resolve(diagnosticInfo);
                    })
                        .catch(function (err) {
                        _this.logService.warn('issueService#getPerformanceInfo ', err.message);
                        reject(err);
                    });
                });
            });
        };
        IssueService.prototype.getIssueReporterPath = function (data, features) {
            var windowConfiguration = {
                appRoot: this.environmentService.appRoot,
                nodeCachedDataDir: this.environmentService.nodeCachedDataDir,
                windowId: this._issueWindow.id,
                machineId: this.machineId,
                data: data,
                features: features
            };
            var environment = argv_1.parseArgs(process.argv);
            var config = objects.assign(environment, windowConfiguration);
            for (var key in config) {
                if (config[key] === void 0 || config[key] === null || config[key] === '') {
                    delete config[key]; // only send over properties that have a true value
                }
            }
            return require.toUrl('vs/code/electron-browser/issue/issueReporter.html') + "?config=" + encodeURIComponent(JSON.stringify(config));
        };
        IssueService = __decorate([
            __param(1, environment_1.IEnvironmentService),
            __param(2, launch_1.ILaunchService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, log_1.ILogService)
        ], IssueService);
        return IssueService;
    }());
    exports.IssueService = IssueService;
});
