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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/paths", "vs/platform/environment/common/environment", "vs/platform/windows/common/windows", "vs/platform/quickOpen/common/quickOpen", "vs/platform/log/common/log", "vs/workbench/parts/output/common/output", "vs/workbench/parts/logs/common/logConstants", "vs/platform/commands/common/commands", "vs/base/common/uri", "vs/platform/workspace/common/workspace"], function (require, exports, nls, actions_1, paths, environment_1, windows_1, quickOpen_1, log_1, output_1, Constants, commands_1, uri_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OpenLogsFolderAction = /** @class */ (function (_super) {
        __extends(OpenLogsFolderAction, _super);
        function OpenLogsFolderAction(id, label, environmentService, windowsService) {
            var _this = _super.call(this, id, label) || this;
            _this.environmentService = environmentService;
            _this.windowsService = windowsService;
            return _this;
        }
        OpenLogsFolderAction.prototype.run = function () {
            return this.windowsService.showItemInFolder(paths.join(this.environmentService.logsPath, 'main.log'));
        };
        OpenLogsFolderAction.ID = 'workbench.action.openLogsFolder';
        OpenLogsFolderAction.LABEL = nls.localize('openLogsFolder', "Open Logs Folder");
        OpenLogsFolderAction = __decorate([
            __param(2, environment_1.IEnvironmentService),
            __param(3, windows_1.IWindowsService)
        ], OpenLogsFolderAction);
        return OpenLogsFolderAction;
    }(actions_1.Action));
    exports.OpenLogsFolderAction = OpenLogsFolderAction;
    var ShowLogsAction = /** @class */ (function (_super) {
        __extends(ShowLogsAction, _super);
        function ShowLogsAction(id, label, quickOpenService, outputService, contextService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            _this.outputService = outputService;
            _this.contextService = contextService;
            return _this;
        }
        ShowLogsAction.prototype.run = function () {
            var _this = this;
            var entries = [
                { id: Constants.rendererLogChannelId, label: this.contextService.getWorkspace().name ? nls.localize('rendererProcess', "Window ({0})", this.contextService.getWorkspace().name) : nls.localize('emptyWindow', "Window") },
                { id: Constants.extHostLogChannelId, label: nls.localize('extensionHost', "Extension Host") },
                { id: Constants.sharedLogChannelId, label: nls.localize('sharedProcess', "Shared") },
                { id: Constants.mainLogChannelId, label: nls.localize('mainProcess', "Main") }
            ];
            return this.quickOpenService.pick(entries, { placeHolder: nls.localize('selectProcess', "Select Log for Process") })
                .then(function (entry) {
                if (entry) {
                    return _this.outputService.showChannel(entry.id);
                }
                return null;
            });
        };
        ShowLogsAction.ID = 'workbench.action.showLogs';
        ShowLogsAction.LABEL = nls.localize('showLogs', "Show Logs...");
        ShowLogsAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, output_1.IOutputService),
            __param(4, workspace_1.IWorkspaceContextService)
        ], ShowLogsAction);
        return ShowLogsAction;
    }(actions_1.Action));
    exports.ShowLogsAction = ShowLogsAction;
    var OpenLogFileAction = /** @class */ (function (_super) {
        __extends(OpenLogFileAction, _super);
        function OpenLogFileAction(id, label, quickOpenService, environmentService, commandService, windowService, contextService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            _this.environmentService = environmentService;
            _this.commandService = commandService;
            _this.windowService = windowService;
            _this.contextService = contextService;
            return _this;
        }
        OpenLogFileAction.prototype.run = function () {
            var _this = this;
            var entries = [
                { id: uri_1.default.file(paths.join(this.environmentService.logsPath, "renderer" + this.windowService.getCurrentWindowId() + ".log")).fsPath, label: this.contextService.getWorkspace().name ? nls.localize('rendererProcess', "Window ({0})", this.contextService.getWorkspace().name) : nls.localize('emptyWindow', "Window") },
                { id: uri_1.default.file(paths.join(this.environmentService.logsPath, "extHost" + this.windowService.getCurrentWindowId() + ".log")).fsPath, label: nls.localize('extensionHost', "Extension Host") },
                { id: uri_1.default.file(paths.join(this.environmentService.logsPath, "sharedprocess.log")).fsPath, label: nls.localize('sharedProcess', "Shared") },
                { id: uri_1.default.file(paths.join(this.environmentService.logsPath, "main.log")).fsPath, label: nls.localize('mainProcess', "Main") }
            ];
            return this.quickOpenService.pick(entries, { placeHolder: nls.localize('selectProcess', "Select Log for Process") })
                .then(function (entry) {
                if (entry) {
                    return _this.commandService.executeCommand(output_1.COMMAND_OPEN_LOG_VIEWER, uri_1.default.file(entry.id));
                }
                return null;
            });
        };
        OpenLogFileAction.ID = 'workbench.action.openLogFile';
        OpenLogFileAction.LABEL = nls.localize('openLogFile', "Open Log File...");
        OpenLogFileAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, environment_1.IEnvironmentService),
            __param(4, commands_1.ICommandService),
            __param(5, windows_1.IWindowService),
            __param(6, workspace_1.IWorkspaceContextService)
        ], OpenLogFileAction);
        return OpenLogFileAction;
    }(actions_1.Action));
    exports.OpenLogFileAction = OpenLogFileAction;
    var SetLogLevelAction = /** @class */ (function (_super) {
        __extends(SetLogLevelAction, _super);
        function SetLogLevelAction(id, label, quickOpenService, logService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            _this.logService = logService;
            return _this;
        }
        SetLogLevelAction.prototype.run = function () {
            var _this = this;
            var current = this.logService.getLevel();
            var entries = [
                { label: nls.localize('trace', "Trace"), level: log_1.LogLevel.Trace, description: this.getDescription(log_1.LogLevel.Trace, current) },
                { label: nls.localize('debug', "Debug"), level: log_1.LogLevel.Debug, description: this.getDescription(log_1.LogLevel.Debug, current) },
                { label: nls.localize('info', "Info"), level: log_1.LogLevel.Info, description: this.getDescription(log_1.LogLevel.Info, current) },
                { label: nls.localize('warn', "Warning"), level: log_1.LogLevel.Warning, description: this.getDescription(log_1.LogLevel.Warning, current) },
                { label: nls.localize('err', "Error"), level: log_1.LogLevel.Error, description: this.getDescription(log_1.LogLevel.Error, current) },
                { label: nls.localize('critical', "Critical"), level: log_1.LogLevel.Critical, description: this.getDescription(log_1.LogLevel.Critical, current) },
                { label: nls.localize('off', "Off"), level: log_1.LogLevel.Off, description: this.getDescription(log_1.LogLevel.Off, current) },
            ];
            return this.quickOpenService.pick(entries, { placeHolder: nls.localize('selectLogLevel', "Select log level"), autoFocus: { autoFocusIndex: this.logService.getLevel() } }).then(function (entry) {
                if (entry) {
                    _this.logService.setLevel(entry.level);
                }
            });
        };
        SetLogLevelAction.prototype.getDescription = function (level, current) {
            if (log_1.DEFAULT_LOG_LEVEL === level && current === level) {
                return nls.localize('default and current', "Default & Current");
            }
            if (log_1.DEFAULT_LOG_LEVEL === level) {
                return nls.localize('default', "Default");
            }
            if (current === level) {
                return nls.localize('current', "Current");
            }
            return void 0;
        };
        SetLogLevelAction.ID = 'workbench.action.setLogLevel';
        SetLogLevelAction.LABEL = nls.localize('setLogLevel', "Set Log Level...");
        SetLogLevelAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, log_1.ILogService)
        ], SetLogLevelAction);
        return SetLogLevelAction;
    }(actions_1.Action));
    exports.SetLogLevelAction = SetLogLevelAction;
});
