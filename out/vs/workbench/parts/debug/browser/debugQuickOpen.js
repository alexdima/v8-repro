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
define(["require", "exports", "vs/nls", "vs/base/common/filters", "vs/base/common/winjs.base", "vs/workbench/browser/quickopen", "vs/base/parts/quickopen/common/quickOpen", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/workbench/parts/debug/common/debug", "vs/platform/workspace/common/workspace", "vs/base/common/errors", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/platform/commands/common/commands", "vs/workbench/parts/debug/browser/debugActions", "vs/platform/message/common/message", "vs/workbench/services/message/browser/messageList"], function (require, exports, nls, Filters, winjs_base_1, Quickopen, QuickOpen, Model, debug_1, workspace_1, errors, quickOpenModel_1, commands_1, debugActions_1, message_1, messageList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AddConfigEntry = /** @class */ (function (_super) {
        __extends(AddConfigEntry, _super);
        function AddConfigEntry(label, launch, commandService, contextService, highlights) {
            if (highlights === void 0) { highlights = []; }
            var _this = _super.call(this, highlights) || this;
            _this.label = label;
            _this.launch = launch;
            _this.commandService = commandService;
            _this.contextService = contextService;
            return _this;
        }
        AddConfigEntry.prototype.getLabel = function () {
            return this.label;
        };
        AddConfigEntry.prototype.getDescription = function () {
            return this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE ? this.launch.name : '';
        };
        AddConfigEntry.prototype.getAriaLabel = function () {
            return nls.localize('entryAriaLabel', "{0}, debug", this.getLabel());
        };
        AddConfigEntry.prototype.run = function (mode, context) {
            if (mode === QuickOpen.Mode.PREVIEW) {
                return false;
            }
            this.commandService.executeCommand('debug.addConfiguration', this.launch.uri.toString()).done(undefined, errors.onUnexpectedError);
            return true;
        };
        return AddConfigEntry;
    }(Model.QuickOpenEntry));
    var StartDebugEntry = /** @class */ (function (_super) {
        __extends(StartDebugEntry, _super);
        function StartDebugEntry(debugService, contextService, messageService, launch, configurationName, highlights) {
            if (highlights === void 0) { highlights = []; }
            var _this = _super.call(this, highlights) || this;
            _this.debugService = debugService;
            _this.contextService = contextService;
            _this.messageService = messageService;
            _this.launch = launch;
            _this.configurationName = configurationName;
            return _this;
        }
        StartDebugEntry.prototype.getLabel = function () {
            return this.configurationName;
        };
        StartDebugEntry.prototype.getDescription = function () {
            return this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE ? this.launch.name : '';
        };
        StartDebugEntry.prototype.getAriaLabel = function () {
            return nls.localize('entryAriaLabel', "{0}, debug", this.getLabel());
        };
        StartDebugEntry.prototype.run = function (mode, context) {
            var _this = this;
            if (mode === QuickOpen.Mode.PREVIEW || !debugActions_1.StartAction.isEnabled(this.debugService, this.contextService, this.configurationName)) {
                return false;
            }
            // Run selected debug configuration
            this.debugService.getConfigurationManager().selectConfiguration(this.launch, this.configurationName);
            this.debugService.startDebugging(this.launch).done(undefined, function (e) { return _this.messageService.show(messageList_1.Severity.Error, e); });
            return true;
        };
        return StartDebugEntry;
    }(Model.QuickOpenEntry));
    var DebugQuickOpenHandler = /** @class */ (function (_super) {
        __extends(DebugQuickOpenHandler, _super);
        function DebugQuickOpenHandler(debugService, contextService, commandService, messageService) {
            var _this = _super.call(this) || this;
            _this.debugService = debugService;
            _this.contextService = contextService;
            _this.commandService = commandService;
            _this.messageService = messageService;
            return _this;
        }
        DebugQuickOpenHandler.prototype.getAriaLabel = function () {
            return nls.localize('debugAriaLabel', "Type a name of a launch configuration to run.");
        };
        DebugQuickOpenHandler.prototype.getResults = function (input) {
            var _this = this;
            var configurations = [];
            var configManager = this.debugService.getConfigurationManager();
            var launches = configManager.getLaunches();
            var _loop_1 = function (launch) {
                launch.getConfigurationNames().map(function (config) { return ({ config: config, highlights: Filters.matchesContiguousSubString(input, config) }); })
                    .filter(function (_a) {
                    var highlights = _a.highlights;
                    return !!highlights;
                })
                    .forEach(function (_a) {
                    var config = _a.config, highlights = _a.highlights;
                    if (launch === configManager.selectedConfiguration.launch && config === configManager.selectedConfiguration.name) {
                        _this.autoFocusIndex = configurations.length;
                    }
                    configurations.push(new StartDebugEntry(_this.debugService, _this.contextService, _this.messageService, launch, config, highlights));
                });
            };
            for (var _i = 0, launches_1 = launches; _i < launches_1.length; _i++) {
                var launch = launches_1[_i];
                _loop_1(launch);
            }
            launches.filter(function (l) { return !l.hidden; }).forEach(function (l, index) {
                var label = _this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE ? nls.localize("addConfigTo", "Add Config ({0})...", l.name) : nls.localize('addConfiguration', "Add Configuration...");
                var entry = new AddConfigEntry(label, l, _this.commandService, _this.contextService, Filters.matchesContiguousSubString(input, label));
                if (index === 0) {
                    configurations.push(new quickOpenModel_1.QuickOpenEntryGroup(entry, undefined, true));
                }
                else {
                    configurations.push(entry);
                }
            });
            return winjs_base_1.TPromise.as(new Model.QuickOpenModel(configurations));
        };
        DebugQuickOpenHandler.prototype.getAutoFocus = function (input) {
            return {
                autoFocusFirstEntry: !!input,
                autoFocusIndex: this.autoFocusIndex
            };
        };
        DebugQuickOpenHandler.prototype.getEmptyLabel = function (searchString) {
            if (searchString.length > 0) {
                return nls.localize('noConfigurationsMatching', "No debug configurations matching");
            }
            return nls.localize('noConfigurationsFound', "No debug configurations found. Please create a 'launch.json' file.");
        };
        DebugQuickOpenHandler.ID = 'workbench.picker.launch';
        DebugQuickOpenHandler = __decorate([
            __param(0, debug_1.IDebugService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, commands_1.ICommandService),
            __param(3, message_1.IMessageService)
        ], DebugQuickOpenHandler);
        return DebugQuickOpenHandler;
    }(Quickopen.QuickOpenHandler));
    exports.DebugQuickOpenHandler = DebugQuickOpenHandler;
});
