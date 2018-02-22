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
define(["require", "exports", "vs/base/common/winjs.base", "vs/platform/log/common/log", "vs/platform/url/common/url", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/instantiation", "vs/platform/windows/common/windows", "vs/platform/windows/electron-main/windows", "vs/base/node/pfs", "vs/platform/workspaces/common/workspaces", "vs/base/common/network"], function (require, exports, winjs_base_1, log_1, url_1, environment_1, instantiation_1, windows_1, windows_2, pfs_1, workspaces_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ID = 'launchService';
    exports.ILaunchService = instantiation_1.createDecorator(exports.ID);
    var LaunchChannel = /** @class */ (function () {
        function LaunchChannel(service) {
            this.service = service;
        }
        LaunchChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'start':
                    var _a = arg, args = _a.args, userEnv = _a.userEnv;
                    return this.service.start(args, userEnv);
                case 'get-main-process-id':
                    return this.service.getMainProcessId();
                case 'get-main-process-info':
                    return this.service.getMainProcessInfo();
                case 'get-logs-path':
                    return this.service.getLogsPath();
            }
            return undefined;
        };
        return LaunchChannel;
    }());
    exports.LaunchChannel = LaunchChannel;
    var LaunchChannelClient = /** @class */ (function () {
        function LaunchChannelClient(channel) {
            this.channel = channel;
        }
        LaunchChannelClient.prototype.start = function (args, userEnv) {
            return this.channel.call('start', { args: args, userEnv: userEnv });
        };
        LaunchChannelClient.prototype.getMainProcessId = function () {
            return this.channel.call('get-main-process-id', null);
        };
        LaunchChannelClient.prototype.getMainProcessInfo = function () {
            return this.channel.call('get-main-process-info', null);
        };
        LaunchChannelClient.prototype.getLogsPath = function () {
            return this.channel.call('get-logs-path', null);
        };
        return LaunchChannelClient;
    }());
    exports.LaunchChannelClient = LaunchChannelClient;
    var LaunchService = /** @class */ (function () {
        function LaunchService(logService, windowsMainService, urlService, workspacesMainService, environmentService) {
            this.logService = logService;
            this.windowsMainService = windowsMainService;
            this.urlService = urlService;
            this.workspacesMainService = workspacesMainService;
            this.environmentService = environmentService;
        }
        LaunchService.prototype.start = function (args, userEnv) {
            this.logService.trace('Received data from other instance: ', args, userEnv);
            // Check early for open-url which is handled in URL service
            if (this.shouldOpenUrl(args)) {
                return winjs_base_1.TPromise.as(null);
            }
            // Otherwise handle in windows service
            return this.startOpenWindow(args, userEnv);
        };
        LaunchService.prototype.shouldOpenUrl = function (args) {
            var _this = this;
            if (args['open-url'] && args._urls && args._urls.length > 0) {
                // --open-url must contain -- followed by the url(s)
                // process.argv is used over args._ as args._ are resolved to file paths at this point
                args._urls.forEach(function (url) { return _this.urlService.open(url); });
                return true;
            }
            return false;
        };
        LaunchService.prototype.startOpenWindow = function (args, userEnv) {
            var context = !!userEnv['VSCODE_CLI'] ? windows_1.OpenContext.CLI : windows_1.OpenContext.DESKTOP;
            var usedWindows;
            if (!!args.extensionDevelopmentPath) {
                this.windowsMainService.openExtensionDevelopmentHostWindow({ context: context, cli: args, userEnv: userEnv });
            }
            else if (args._.length === 0 && (args['new-window'] || args['unity-launch'])) {
                usedWindows = this.windowsMainService.open({ context: context, cli: args, userEnv: userEnv, forceNewWindow: true, forceEmpty: true });
            }
            else if (args._.length === 0) {
                usedWindows = [this.windowsMainService.focusLastActive(args, context)];
            }
            else {
                usedWindows = this.windowsMainService.open({
                    context: context,
                    cli: args,
                    userEnv: userEnv,
                    forceNewWindow: args['new-window'],
                    preferNewWindow: !args['reuse-window'] && !args.wait,
                    forceReuseWindow: args['reuse-window'],
                    diffMode: args.diff,
                    addMode: args.add
                });
            }
            // If the other instance is waiting to be killed, we hook up a window listener if one window
            // is being used and only then resolve the startup promise which will kill this second instance.
            // In addition, we poll for the wait marker file to be deleted to return.
            if (args.wait && usedWindows.length === 1 && usedWindows[0]) {
                return winjs_base_1.TPromise.any([
                    this.windowsMainService.waitForWindowCloseOrLoad(usedWindows[0].id),
                    pfs_1.whenDeleted(args.waitMarkerFilePath)
                ]).then(function () { return void 0; }, function () { return void 0; });
            }
            return winjs_base_1.TPromise.as(null);
        };
        LaunchService.prototype.getMainProcessId = function () {
            this.logService.trace('Received request for process ID from other instance.');
            return winjs_base_1.TPromise.as(process.pid);
        };
        LaunchService.prototype.getMainProcessInfo = function () {
            var _this = this;
            this.logService.trace('Received request for main process info from other instance.');
            return winjs_base_1.TPromise.wrap({
                mainPID: process.pid,
                mainArguments: process.argv,
                windows: this.windowsMainService.getWindows().map(function (window) {
                    return _this.getWindowInfo(window);
                })
            });
        };
        LaunchService.prototype.getLogsPath = function () {
            this.logService.trace('Received request for logs path from other instance.');
            return winjs_base_1.TPromise.as(this.environmentService.logsPath);
        };
        LaunchService.prototype.getWindowInfo = function (window) {
            var folders = [];
            if (window.openedFolderPath) {
                folders.push(window.openedFolderPath);
            }
            else if (window.openedWorkspace) {
                var rootFolders = this.workspacesMainService.resolveWorkspaceSync(window.openedWorkspace.configPath).folders;
                rootFolders.forEach(function (root) {
                    if (root.uri.scheme === network_1.Schemas.file) {
                        folders.push(root.uri.fsPath);
                    }
                });
            }
            return {
                pid: window.win.webContents.getOSProcessId(),
                title: window.win.getTitle(),
                folders: folders
            };
        };
        LaunchService = __decorate([
            __param(0, log_1.ILogService),
            __param(1, windows_2.IWindowsMainService),
            __param(2, url_1.IURLService),
            __param(3, workspaces_1.IWorkspacesMainService),
            __param(4, environment_1.IEnvironmentService)
        ], LaunchService);
        return LaunchService;
    }());
    exports.LaunchService = LaunchService;
});
