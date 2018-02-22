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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/platform/workspace/common/workspace", "vs/platform/files/common/files", "vs/platform/message/common/message", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/common/debugModel", "vs/workbench/services/part/common/partService", "vs/workbench/services/panel/common/panelService", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/panel", "vs/platform/quickOpen/common/quickOpen"], function (require, exports, nls, actions_1, lifecycle, severity_1, winjs_base_1, keybinding_1, commands_1, workspace_1, files_1, message_1, debug_1, debugModel_1, partService_1, panelService_1, editorService_1, panel_1, quickOpen_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AbstractDebugAction = /** @class */ (function (_super) {
        __extends(AbstractDebugAction, _super);
        function AbstractDebugAction(id, label, cssClass, debugService, keybindingService, weight) {
            var _this = _super.call(this, id, label, cssClass, false) || this;
            _this.debugService = debugService;
            _this.keybindingService = keybindingService;
            _this.weight = weight;
            _this.toDispose = [];
            _this.toDispose.push(_this.debugService.onDidChangeState(function (state) { return _this.updateEnablement(state); }));
            _this.updateLabel(label);
            _this.updateEnablement();
            return _this;
        }
        AbstractDebugAction.prototype.run = function (e) {
            throw new Error('implement me');
        };
        Object.defineProperty(AbstractDebugAction.prototype, "tooltip", {
            get: function () {
                var keybinding = this.keybindingService.lookupKeybinding(this.id);
                var keybindingLabel = keybinding && keybinding.getLabel();
                return keybindingLabel ? this.label + " (" + keybindingLabel + ")" : this.label;
            },
            enumerable: true,
            configurable: true
        });
        AbstractDebugAction.prototype.updateLabel = function (newLabel) {
            this.label = newLabel;
        };
        AbstractDebugAction.prototype.updateEnablement = function (state) {
            if (state === void 0) { state = this.debugService.state; }
            this.enabled = this.isEnabled(state);
        };
        AbstractDebugAction.prototype.isEnabled = function (state) {
            return true;
        };
        AbstractDebugAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        AbstractDebugAction = __decorate([
            __param(3, debug_1.IDebugService),
            __param(4, keybinding_1.IKeybindingService)
        ], AbstractDebugAction);
        return AbstractDebugAction;
    }(actions_1.Action));
    exports.AbstractDebugAction = AbstractDebugAction;
    var ConfigureAction = /** @class */ (function (_super) {
        __extends(ConfigureAction, _super);
        function ConfigureAction(id, label, debugService, keybindingService, messageService, contextService) {
            var _this = _super.call(this, id, label, 'debug-action configure', debugService, keybindingService) || this;
            _this.messageService = messageService;
            _this.contextService = contextService;
            _this.toDispose.push(debugService.getConfigurationManager().onDidSelectConfiguration(function () { return _this.updateClass(); }));
            _this.updateClass();
            return _this;
        }
        Object.defineProperty(ConfigureAction.prototype, "tooltip", {
            get: function () {
                if (this.debugService.getConfigurationManager().selectedConfiguration.name) {
                    return ConfigureAction.LABEL;
                }
                return nls.localize('launchJsonNeedsConfigurtion', "Configure or Fix 'launch.json'");
            },
            enumerable: true,
            configurable: true
        });
        ConfigureAction.prototype.updateClass = function () {
            this.class = this.debugService.getConfigurationManager().selectedConfiguration.name ? 'debug-action configure' : 'debug-action configure notification';
        };
        ConfigureAction.prototype.run = function (event) {
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                this.messageService.show(severity_1.default.Info, nls.localize('noFolderDebugConfig', "Please first open a folder in order to do advanced debug configuration."));
                return winjs_base_1.TPromise.as(null);
            }
            var sideBySide = !!(event && (event.ctrlKey || event.metaKey));
            return this.debugService.getConfigurationManager().selectedConfiguration.launch.openConfigFile(sideBySide);
        };
        ConfigureAction.ID = 'workbench.action.debug.configure';
        ConfigureAction.LABEL = nls.localize('openLaunchJson', "Open {0}", 'launch.json');
        ConfigureAction = __decorate([
            __param(2, debug_1.IDebugService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, message_1.IMessageService),
            __param(5, workspace_1.IWorkspaceContextService)
        ], ConfigureAction);
        return ConfigureAction;
    }(AbstractDebugAction));
    exports.ConfigureAction = ConfigureAction;
    var StartAction = /** @class */ (function (_super) {
        __extends(StartAction, _super);
        function StartAction(id, label, debugService, keybindingService, contextService) {
            var _this = _super.call(this, id, label, 'debug-action start', debugService, keybindingService) || this;
            _this.contextService = contextService;
            _this.toDispose.push(_this.debugService.getConfigurationManager().onDidSelectConfiguration(function () { return _this.updateEnablement(); }));
            _this.toDispose.push(_this.debugService.getModel().onDidChangeCallStack(function () { return _this.updateEnablement(); }));
            _this.toDispose.push(_this.contextService.onDidChangeWorkbenchState(function () { return _this.updateEnablement(); }));
            return _this;
        }
        StartAction.prototype.run = function () {
            var launch = this.debugService.getConfigurationManager().selectedConfiguration.launch;
            return this.debugService.startDebugging(launch, undefined, this.isNoDebug());
        };
        StartAction.prototype.isNoDebug = function () {
            return false;
        };
        StartAction.isEnabled = function (debugService, contextService, configName) {
            var processes = debugService.getModel().getProcesses();
            var launch = debugService.getConfigurationManager().selectedConfiguration.launch;
            if (debugService.state === debug_1.State.Initializing) {
                return false;
            }
            if (contextService && contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY && processes.length > 0) {
                return false;
            }
            if (processes.some(function (p) { return p.getName(false) === configName && (!launch || !launch.workspace || !p.session.root || p.session.root.uri.toString() === launch.workspace.uri.toString()); })) {
                return false;
            }
            var compound = launch && launch.getCompound(configName);
            if (compound && compound.configurations && processes.some(function (p) { return compound.configurations.indexOf(p.getName(false)) !== -1; })) {
                return false;
            }
            return true;
        };
        // Disabled if the launch drop down shows the launch config that is already running.
        StartAction.prototype.isEnabled = function (state) {
            return StartAction.isEnabled(this.debugService, this.contextService, this.debugService.getConfigurationManager().selectedConfiguration.name);
        };
        StartAction.ID = 'workbench.action.debug.start';
        StartAction.LABEL = nls.localize('startDebug', "Start Debugging");
        StartAction = __decorate([
            __param(2, debug_1.IDebugService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, workspace_1.IWorkspaceContextService)
        ], StartAction);
        return StartAction;
    }(AbstractDebugAction));
    exports.StartAction = StartAction;
    var RunAction = /** @class */ (function (_super) {
        __extends(RunAction, _super);
        function RunAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RunAction.prototype.isNoDebug = function () {
            return true;
        };
        RunAction.ID = 'workbench.action.debug.run';
        RunAction.LABEL = nls.localize('startWithoutDebugging', "Start Without Debugging");
        return RunAction;
    }(StartAction));
    exports.RunAction = RunAction;
    var SelectAndStartAction = /** @class */ (function (_super) {
        __extends(SelectAndStartAction, _super);
        function SelectAndStartAction(id, label, debugService, keybindingService, commandService, contextService, fileService, quickOpenService) {
            var _this = _super.call(this, id, label, undefined, debugService, keybindingService) || this;
            _this.quickOpenService = quickOpenService;
            _this.quickOpenService = quickOpenService;
            return _this;
        }
        SelectAndStartAction.prototype.run = function () {
            return this.quickOpenService.show('debug ');
        };
        SelectAndStartAction.ID = 'workbench.action.debug.selectandstart';
        SelectAndStartAction.LABEL = nls.localize('selectAndStartDebugging', "Select and Start Debugging");
        SelectAndStartAction = __decorate([
            __param(2, debug_1.IDebugService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, commands_1.ICommandService),
            __param(5, workspace_1.IWorkspaceContextService),
            __param(6, files_1.IFileService),
            __param(7, quickOpen_1.IQuickOpenService)
        ], SelectAndStartAction);
        return SelectAndStartAction;
    }(AbstractDebugAction));
    exports.SelectAndStartAction = SelectAndStartAction;
    var RestartAction = /** @class */ (function (_super) {
        __extends(RestartAction, _super);
        function RestartAction(id, label, debugService, keybindingService) {
            var _this = _super.call(this, id, label, 'debug-action restart', debugService, keybindingService, 70) || this;
            _this.setLabel(_this.debugService.getViewModel().focusedProcess);
            _this.toDispose.push(_this.debugService.getViewModel().onDidFocusStackFrame(function () { return _this.setLabel(_this.debugService.getViewModel().focusedProcess); }));
            return _this;
        }
        RestartAction.prototype.setLabel = function (process) {
            this.updateLabel(process && process.state === debug_1.ProcessState.ATTACH ? RestartAction.RECONNECT_LABEL : RestartAction.LABEL);
        };
        RestartAction.prototype.run = function (process) {
            if (!(process instanceof debugModel_1.Process)) {
                process = this.debugService.getViewModel().focusedProcess;
            }
            if (!process) {
                return winjs_base_1.TPromise.as(null);
            }
            if (this.debugService.getModel().getProcesses().length <= 1) {
                this.debugService.removeReplExpressions();
            }
            return this.debugService.restartProcess(process);
        };
        RestartAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && (state === debug_1.State.Running || state === debug_1.State.Stopped);
        };
        RestartAction.ID = 'workbench.action.debug.restart';
        RestartAction.LABEL = nls.localize('restartDebug', "Restart");
        RestartAction.RECONNECT_LABEL = nls.localize('reconnectDebug', "Reconnect");
        RestartAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], RestartAction);
        return RestartAction;
    }(AbstractDebugAction));
    exports.RestartAction = RestartAction;
    var StepOverAction = /** @class */ (function (_super) {
        __extends(StepOverAction, _super);
        function StepOverAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action step-over', debugService, keybindingService, 20) || this;
        }
        StepOverAction.prototype.run = function (thread) {
            if (!(thread instanceof debugModel_1.Thread)) {
                thread = this.debugService.getViewModel().focusedThread;
            }
            return thread ? thread.next() : winjs_base_1.TPromise.as(null);
        };
        StepOverAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && state === debug_1.State.Stopped;
        };
        StepOverAction.ID = 'workbench.action.debug.stepOver';
        StepOverAction.LABEL = nls.localize('stepOverDebug', "Step Over");
        StepOverAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], StepOverAction);
        return StepOverAction;
    }(AbstractDebugAction));
    exports.StepOverAction = StepOverAction;
    var StepIntoAction = /** @class */ (function (_super) {
        __extends(StepIntoAction, _super);
        function StepIntoAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action step-into', debugService, keybindingService, 30) || this;
        }
        StepIntoAction.prototype.run = function (thread) {
            if (!(thread instanceof debugModel_1.Thread)) {
                thread = this.debugService.getViewModel().focusedThread;
            }
            return thread ? thread.stepIn() : winjs_base_1.TPromise.as(null);
        };
        StepIntoAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && state === debug_1.State.Stopped;
        };
        StepIntoAction.ID = 'workbench.action.debug.stepInto';
        StepIntoAction.LABEL = nls.localize('stepIntoDebug', "Step Into");
        StepIntoAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], StepIntoAction);
        return StepIntoAction;
    }(AbstractDebugAction));
    exports.StepIntoAction = StepIntoAction;
    var StepOutAction = /** @class */ (function (_super) {
        __extends(StepOutAction, _super);
        function StepOutAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action step-out', debugService, keybindingService, 40) || this;
        }
        StepOutAction.prototype.run = function (thread) {
            if (!(thread instanceof debugModel_1.Thread)) {
                thread = this.debugService.getViewModel().focusedThread;
            }
            return thread ? thread.stepOut() : winjs_base_1.TPromise.as(null);
        };
        StepOutAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && state === debug_1.State.Stopped;
        };
        StepOutAction.ID = 'workbench.action.debug.stepOut';
        StepOutAction.LABEL = nls.localize('stepOutDebug', "Step Out");
        StepOutAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], StepOutAction);
        return StepOutAction;
    }(AbstractDebugAction));
    exports.StepOutAction = StepOutAction;
    var StopAction = /** @class */ (function (_super) {
        __extends(StopAction, _super);
        function StopAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action stop', debugService, keybindingService, 80) || this;
        }
        StopAction.prototype.run = function (process) {
            if (!(process instanceof debugModel_1.Process)) {
                process = this.debugService.getViewModel().focusedProcess;
            }
            return this.debugService.stopProcess(process);
        };
        StopAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && (state === debug_1.State.Running || state === debug_1.State.Stopped);
        };
        StopAction.ID = 'workbench.action.debug.stop';
        StopAction.LABEL = nls.localize('stopDebug', "Stop");
        StopAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], StopAction);
        return StopAction;
    }(AbstractDebugAction));
    exports.StopAction = StopAction;
    var DisconnectAction = /** @class */ (function (_super) {
        __extends(DisconnectAction, _super);
        function DisconnectAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action disconnect', debugService, keybindingService, 80) || this;
        }
        DisconnectAction.prototype.run = function () {
            var process = this.debugService.getViewModel().focusedProcess;
            return this.debugService.stopProcess(process);
        };
        DisconnectAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && (state === debug_1.State.Running || state === debug_1.State.Stopped);
        };
        DisconnectAction.ID = 'workbench.action.debug.disconnect';
        DisconnectAction.LABEL = nls.localize('disconnectDebug', "Disconnect");
        DisconnectAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], DisconnectAction);
        return DisconnectAction;
    }(AbstractDebugAction));
    exports.DisconnectAction = DisconnectAction;
    var ContinueAction = /** @class */ (function (_super) {
        __extends(ContinueAction, _super);
        function ContinueAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action continue', debugService, keybindingService, 10) || this;
        }
        ContinueAction.prototype.run = function (thread) {
            if (!(thread instanceof debugModel_1.Thread)) {
                thread = this.debugService.getViewModel().focusedThread;
            }
            return thread ? thread.continue() : winjs_base_1.TPromise.as(null);
        };
        ContinueAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && state === debug_1.State.Stopped;
        };
        ContinueAction.ID = 'workbench.action.debug.continue';
        ContinueAction.LABEL = nls.localize('continueDebug', "Continue");
        ContinueAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], ContinueAction);
        return ContinueAction;
    }(AbstractDebugAction));
    exports.ContinueAction = ContinueAction;
    var PauseAction = /** @class */ (function (_super) {
        __extends(PauseAction, _super);
        function PauseAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action pause', debugService, keybindingService, 10) || this;
        }
        PauseAction.prototype.run = function (thread) {
            if (!(thread instanceof debugModel_1.Thread)) {
                thread = this.debugService.getViewModel().focusedThread;
            }
            return thread ? thread.pause() : winjs_base_1.TPromise.as(null);
        };
        PauseAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && state === debug_1.State.Running;
        };
        PauseAction.ID = 'workbench.action.debug.pause';
        PauseAction.LABEL = nls.localize('pauseDebug', "Pause");
        PauseAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], PauseAction);
        return PauseAction;
    }(AbstractDebugAction));
    exports.PauseAction = PauseAction;
    var RestartFrameAction = /** @class */ (function (_super) {
        __extends(RestartFrameAction, _super);
        function RestartFrameAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, undefined, debugService, keybindingService) || this;
        }
        RestartFrameAction.prototype.run = function (frame) {
            if (!frame) {
                frame = this.debugService.getViewModel().focusedStackFrame;
            }
            return frame.restart();
        };
        RestartFrameAction.ID = 'workbench.action.debug.restartFrame';
        RestartFrameAction.LABEL = nls.localize('restartFrame', "Restart Frame");
        RestartFrameAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], RestartFrameAction);
        return RestartFrameAction;
    }(AbstractDebugAction));
    exports.RestartFrameAction = RestartFrameAction;
    var RemoveBreakpointAction = /** @class */ (function (_super) {
        __extends(RemoveBreakpointAction, _super);
        function RemoveBreakpointAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action remove', debugService, keybindingService) || this;
        }
        RemoveBreakpointAction.prototype.run = function (breakpoint) {
            return breakpoint instanceof debugModel_1.Breakpoint ? this.debugService.removeBreakpoints(breakpoint.getId())
                : this.debugService.removeFunctionBreakpoints(breakpoint.getId());
        };
        RemoveBreakpointAction.ID = 'workbench.debug.viewlet.action.removeBreakpoint';
        RemoveBreakpointAction.LABEL = nls.localize('removeBreakpoint', "Remove Breakpoint");
        RemoveBreakpointAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], RemoveBreakpointAction);
        return RemoveBreakpointAction;
    }(AbstractDebugAction));
    exports.RemoveBreakpointAction = RemoveBreakpointAction;
    var RemoveAllBreakpointsAction = /** @class */ (function (_super) {
        __extends(RemoveAllBreakpointsAction, _super);
        function RemoveAllBreakpointsAction(id, label, debugService, keybindingService) {
            var _this = _super.call(this, id, label, 'debug-action remove-all', debugService, keybindingService) || this;
            _this.toDispose.push(_this.debugService.getModel().onDidChangeBreakpoints(function () { return _this.updateEnablement(); }));
            return _this;
        }
        RemoveAllBreakpointsAction.prototype.run = function () {
            return winjs_base_1.TPromise.join([this.debugService.removeBreakpoints(), this.debugService.removeFunctionBreakpoints()]);
        };
        RemoveAllBreakpointsAction.prototype.isEnabled = function (state) {
            var model = this.debugService.getModel();
            return _super.prototype.isEnabled.call(this, state) && (model.getBreakpoints().length > 0 || model.getFunctionBreakpoints().length > 0);
        };
        RemoveAllBreakpointsAction.ID = 'workbench.debug.viewlet.action.removeAllBreakpoints';
        RemoveAllBreakpointsAction.LABEL = nls.localize('removeAllBreakpoints', "Remove All Breakpoints");
        RemoveAllBreakpointsAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], RemoveAllBreakpointsAction);
        return RemoveAllBreakpointsAction;
    }(AbstractDebugAction));
    exports.RemoveAllBreakpointsAction = RemoveAllBreakpointsAction;
    var EnableBreakpointAction = /** @class */ (function (_super) {
        __extends(EnableBreakpointAction, _super);
        function EnableBreakpointAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, undefined, debugService, keybindingService) || this;
        }
        EnableBreakpointAction.prototype.run = function (element) {
            return this.debugService.enableOrDisableBreakpoints(true, element);
        };
        EnableBreakpointAction.ID = 'workbench.debug.viewlet.action.enableBreakpoint';
        EnableBreakpointAction.LABEL = nls.localize('enableBreakpoint', "Enable Breakpoint");
        EnableBreakpointAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], EnableBreakpointAction);
        return EnableBreakpointAction;
    }(AbstractDebugAction));
    exports.EnableBreakpointAction = EnableBreakpointAction;
    var DisableBreakpointAction = /** @class */ (function (_super) {
        __extends(DisableBreakpointAction, _super);
        function DisableBreakpointAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, undefined, debugService, keybindingService) || this;
        }
        DisableBreakpointAction.prototype.run = function (element) {
            return this.debugService.enableOrDisableBreakpoints(false, element);
        };
        DisableBreakpointAction.ID = 'workbench.debug.viewlet.action.disableBreakpoint';
        DisableBreakpointAction.LABEL = nls.localize('disableBreakpoint', "Disable Breakpoint");
        DisableBreakpointAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], DisableBreakpointAction);
        return DisableBreakpointAction;
    }(AbstractDebugAction));
    exports.DisableBreakpointAction = DisableBreakpointAction;
    var EnableAllBreakpointsAction = /** @class */ (function (_super) {
        __extends(EnableAllBreakpointsAction, _super);
        function EnableAllBreakpointsAction(id, label, debugService, keybindingService) {
            var _this = _super.call(this, id, label, 'debug-action enable-all-breakpoints', debugService, keybindingService) || this;
            _this.toDispose.push(_this.debugService.getModel().onDidChangeBreakpoints(function () { return _this.updateEnablement(); }));
            return _this;
        }
        EnableAllBreakpointsAction.prototype.run = function () {
            return this.debugService.enableOrDisableBreakpoints(true);
        };
        EnableAllBreakpointsAction.prototype.isEnabled = function (state) {
            var model = this.debugService.getModel();
            return _super.prototype.isEnabled.call(this, state) && model.getBreakpoints().concat(model.getFunctionBreakpoints()).concat(model.getExceptionBreakpoints()).some(function (bp) { return !bp.enabled; });
        };
        EnableAllBreakpointsAction.ID = 'workbench.debug.viewlet.action.enableAllBreakpoints';
        EnableAllBreakpointsAction.LABEL = nls.localize('enableAllBreakpoints', "Enable All Breakpoints");
        EnableAllBreakpointsAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], EnableAllBreakpointsAction);
        return EnableAllBreakpointsAction;
    }(AbstractDebugAction));
    exports.EnableAllBreakpointsAction = EnableAllBreakpointsAction;
    var DisableAllBreakpointsAction = /** @class */ (function (_super) {
        __extends(DisableAllBreakpointsAction, _super);
        function DisableAllBreakpointsAction(id, label, debugService, keybindingService) {
            var _this = _super.call(this, id, label, 'debug-action disable-all-breakpoints', debugService, keybindingService) || this;
            _this.toDispose.push(_this.debugService.getModel().onDidChangeBreakpoints(function () { return _this.updateEnablement(); }));
            return _this;
        }
        DisableAllBreakpointsAction.prototype.run = function () {
            return this.debugService.enableOrDisableBreakpoints(false);
        };
        DisableAllBreakpointsAction.prototype.isEnabled = function (state) {
            var model = this.debugService.getModel();
            return _super.prototype.isEnabled.call(this, state) && model.getBreakpoints().concat(model.getFunctionBreakpoints()).concat(model.getExceptionBreakpoints()).some(function (bp) { return bp.enabled; });
        };
        DisableAllBreakpointsAction.ID = 'workbench.debug.viewlet.action.disableAllBreakpoints';
        DisableAllBreakpointsAction.LABEL = nls.localize('disableAllBreakpoints', "Disable All Breakpoints");
        DisableAllBreakpointsAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], DisableAllBreakpointsAction);
        return DisableAllBreakpointsAction;
    }(AbstractDebugAction));
    exports.DisableAllBreakpointsAction = DisableAllBreakpointsAction;
    var ToggleBreakpointsActivatedAction = /** @class */ (function (_super) {
        __extends(ToggleBreakpointsActivatedAction, _super);
        function ToggleBreakpointsActivatedAction(id, label, debugService, keybindingService) {
            var _this = _super.call(this, id, label, 'debug-action breakpoints-activate', debugService, keybindingService) || this;
            _this.updateLabel(_this.debugService.getModel().areBreakpointsActivated() ? ToggleBreakpointsActivatedAction.DEACTIVATE_LABEL : ToggleBreakpointsActivatedAction.ACTIVATE_LABEL);
            _this.toDispose.push(_this.debugService.getModel().onDidChangeBreakpoints(function () {
                _this.updateLabel(_this.debugService.getModel().areBreakpointsActivated() ? ToggleBreakpointsActivatedAction.DEACTIVATE_LABEL : ToggleBreakpointsActivatedAction.ACTIVATE_LABEL);
                _this.updateEnablement();
            }));
            return _this;
        }
        ToggleBreakpointsActivatedAction.prototype.run = function () {
            return this.debugService.setBreakpointsActivated(!this.debugService.getModel().areBreakpointsActivated());
        };
        ToggleBreakpointsActivatedAction.prototype.isEnabled = function (state) {
            return (this.debugService.getModel().getFunctionBreakpoints().length + this.debugService.getModel().getBreakpoints().length) > 0;
        };
        ToggleBreakpointsActivatedAction.ID = 'workbench.debug.viewlet.action.toggleBreakpointsActivatedAction';
        ToggleBreakpointsActivatedAction.ACTIVATE_LABEL = nls.localize('activateBreakpoints', "Activate Breakpoints");
        ToggleBreakpointsActivatedAction.DEACTIVATE_LABEL = nls.localize('deactivateBreakpoints', "Deactivate Breakpoints");
        ToggleBreakpointsActivatedAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], ToggleBreakpointsActivatedAction);
        return ToggleBreakpointsActivatedAction;
    }(AbstractDebugAction));
    exports.ToggleBreakpointsActivatedAction = ToggleBreakpointsActivatedAction;
    var ReapplyBreakpointsAction = /** @class */ (function (_super) {
        __extends(ReapplyBreakpointsAction, _super);
        function ReapplyBreakpointsAction(id, label, debugService, keybindingService) {
            var _this = _super.call(this, id, label, null, debugService, keybindingService) || this;
            _this.toDispose.push(_this.debugService.getModel().onDidChangeBreakpoints(function () { return _this.updateEnablement(); }));
            return _this;
        }
        ReapplyBreakpointsAction.prototype.run = function () {
            return this.debugService.setBreakpointsActivated(true);
        };
        ReapplyBreakpointsAction.prototype.isEnabled = function (state) {
            var model = this.debugService.getModel();
            return _super.prototype.isEnabled.call(this, state) && (state === debug_1.State.Running || state === debug_1.State.Stopped) &&
                (model.getFunctionBreakpoints().length + model.getBreakpoints().length + model.getExceptionBreakpoints().length > 0);
        };
        ReapplyBreakpointsAction.ID = 'workbench.debug.viewlet.action.reapplyBreakpointsAction';
        ReapplyBreakpointsAction.LABEL = nls.localize('reapplyAllBreakpoints', "Reapply All Breakpoints");
        ReapplyBreakpointsAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], ReapplyBreakpointsAction);
        return ReapplyBreakpointsAction;
    }(AbstractDebugAction));
    exports.ReapplyBreakpointsAction = ReapplyBreakpointsAction;
    var AddFunctionBreakpointAction = /** @class */ (function (_super) {
        __extends(AddFunctionBreakpointAction, _super);
        function AddFunctionBreakpointAction(id, label, debugService, keybindingService) {
            var _this = _super.call(this, id, label, 'debug-action add-function-breakpoint', debugService, keybindingService) || this;
            _this.toDispose.push(_this.debugService.getModel().onDidChangeBreakpoints(function () { return _this.updateEnablement(); }));
            return _this;
        }
        AddFunctionBreakpointAction.prototype.run = function () {
            this.debugService.addFunctionBreakpoint();
            return winjs_base_1.TPromise.as(null);
        };
        AddFunctionBreakpointAction.prototype.isEnabled = function (state) {
            return !this.debugService.getViewModel().getSelectedFunctionBreakpoint()
                && this.debugService.getModel().getFunctionBreakpoints().every(function (fbp) { return !!fbp.name; });
        };
        AddFunctionBreakpointAction.ID = 'workbench.debug.viewlet.action.addFunctionBreakpointAction';
        AddFunctionBreakpointAction.LABEL = nls.localize('addFunctionBreakpoint', "Add Function Breakpoint");
        AddFunctionBreakpointAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], AddFunctionBreakpointAction);
        return AddFunctionBreakpointAction;
    }(AbstractDebugAction));
    exports.AddFunctionBreakpointAction = AddFunctionBreakpointAction;
    var AddConditionalBreakpointAction = /** @class */ (function (_super) {
        __extends(AddConditionalBreakpointAction, _super);
        function AddConditionalBreakpointAction(id, label, editor, lineNumber, debugService, keybindingService) {
            var _this = _super.call(this, id, label, null, debugService, keybindingService) || this;
            _this.editor = editor;
            _this.lineNumber = lineNumber;
            return _this;
        }
        AddConditionalBreakpointAction.prototype.run = function () {
            this.editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID).showBreakpointWidget(this.lineNumber, undefined);
            return winjs_base_1.TPromise.as(null);
        };
        AddConditionalBreakpointAction.ID = 'workbench.debug.viewlet.action.addConditionalBreakpointAction';
        AddConditionalBreakpointAction.LABEL = nls.localize('addConditionalBreakpoint', "Add Conditional Breakpoint...");
        AddConditionalBreakpointAction = __decorate([
            __param(4, debug_1.IDebugService),
            __param(5, keybinding_1.IKeybindingService)
        ], AddConditionalBreakpointAction);
        return AddConditionalBreakpointAction;
    }(AbstractDebugAction));
    exports.AddConditionalBreakpointAction = AddConditionalBreakpointAction;
    var EditConditionalBreakpointAction = /** @class */ (function (_super) {
        __extends(EditConditionalBreakpointAction, _super);
        function EditConditionalBreakpointAction(id, label, editor, debugService, keybindingService) {
            var _this = _super.call(this, id, label, null, debugService, keybindingService) || this;
            _this.editor = editor;
            return _this;
        }
        EditConditionalBreakpointAction.prototype.run = function (breakpoint) {
            this.editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID).showBreakpointWidget(breakpoint.lineNumber, breakpoint.column);
            return winjs_base_1.TPromise.as(null);
        };
        EditConditionalBreakpointAction.ID = 'workbench.debug.viewlet.action.editConditionalBreakpointAction';
        EditConditionalBreakpointAction.LABEL = nls.localize('editConditionalBreakpoint', "Edit Breakpoint...");
        EditConditionalBreakpointAction = __decorate([
            __param(3, debug_1.IDebugService),
            __param(4, keybinding_1.IKeybindingService)
        ], EditConditionalBreakpointAction);
        return EditConditionalBreakpointAction;
    }(AbstractDebugAction));
    exports.EditConditionalBreakpointAction = EditConditionalBreakpointAction;
    var SetValueAction = /** @class */ (function (_super) {
        __extends(SetValueAction, _super);
        function SetValueAction(id, label, variable, debugService, keybindingService) {
            var _this = _super.call(this, id, label, null, debugService, keybindingService) || this;
            _this.variable = variable;
            return _this;
        }
        SetValueAction.prototype.run = function () {
            if (this.variable instanceof debugModel_1.Variable) {
                this.debugService.getViewModel().setSelectedExpression(this.variable);
            }
            return winjs_base_1.TPromise.as(null);
        };
        SetValueAction.prototype.isEnabled = function (state) {
            var process = this.debugService.getViewModel().focusedProcess;
            return _super.prototype.isEnabled.call(this, state) && state === debug_1.State.Stopped && process && process.session.capabilities.supportsSetVariable;
        };
        SetValueAction.ID = 'workbench.debug.viewlet.action.setValue';
        SetValueAction.LABEL = nls.localize('setValue', "Set Value");
        SetValueAction = __decorate([
            __param(3, debug_1.IDebugService), __param(4, keybinding_1.IKeybindingService)
        ], SetValueAction);
        return SetValueAction;
    }(AbstractDebugAction));
    exports.SetValueAction = SetValueAction;
    var AddWatchExpressionAction = /** @class */ (function (_super) {
        __extends(AddWatchExpressionAction, _super);
        function AddWatchExpressionAction(id, label, debugService, keybindingService) {
            var _this = _super.call(this, id, label, 'debug-action add-watch-expression', debugService, keybindingService) || this;
            _this.toDispose.push(_this.debugService.getModel().onDidChangeWatchExpressions(function () { return _this.updateEnablement(); }));
            return _this;
        }
        AddWatchExpressionAction.prototype.run = function () {
            this.debugService.addWatchExpression();
            return winjs_base_1.TPromise.as(undefined);
        };
        AddWatchExpressionAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && this.debugService.getModel().getWatchExpressions().every(function (we) { return !!we.name; });
        };
        AddWatchExpressionAction.ID = 'workbench.debug.viewlet.action.addWatchExpression';
        AddWatchExpressionAction.LABEL = nls.localize('addWatchExpression', "Add Expression");
        AddWatchExpressionAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], AddWatchExpressionAction);
        return AddWatchExpressionAction;
    }(AbstractDebugAction));
    exports.AddWatchExpressionAction = AddWatchExpressionAction;
    var EditWatchExpressionAction = /** @class */ (function (_super) {
        __extends(EditWatchExpressionAction, _super);
        function EditWatchExpressionAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, undefined, debugService, keybindingService) || this;
        }
        EditWatchExpressionAction.prototype.run = function (expression) {
            this.debugService.getViewModel().setSelectedExpression(expression);
            return winjs_base_1.TPromise.as(null);
        };
        EditWatchExpressionAction.ID = 'workbench.debug.viewlet.action.editWatchExpression';
        EditWatchExpressionAction.LABEL = nls.localize('editWatchExpression', "Edit Expression");
        EditWatchExpressionAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], EditWatchExpressionAction);
        return EditWatchExpressionAction;
    }(AbstractDebugAction));
    exports.EditWatchExpressionAction = EditWatchExpressionAction;
    var AddToWatchExpressionsAction = /** @class */ (function (_super) {
        __extends(AddToWatchExpressionsAction, _super);
        function AddToWatchExpressionsAction(id, label, expression, debugService, keybindingService) {
            var _this = _super.call(this, id, label, 'debug-action add-to-watch', debugService, keybindingService) || this;
            _this.expression = expression;
            return _this;
        }
        AddToWatchExpressionsAction.prototype.run = function () {
            var name = this.expression instanceof debugModel_1.Variable ? this.expression.evaluateName : this.expression.name;
            this.debugService.addWatchExpression(name);
            return winjs_base_1.TPromise.as(undefined);
        };
        AddToWatchExpressionsAction.ID = 'workbench.debug.viewlet.action.addToWatchExpressions';
        AddToWatchExpressionsAction.LABEL = nls.localize('addToWatchExpressions', "Add to Watch");
        AddToWatchExpressionsAction = __decorate([
            __param(3, debug_1.IDebugService), __param(4, keybinding_1.IKeybindingService)
        ], AddToWatchExpressionsAction);
        return AddToWatchExpressionsAction;
    }(AbstractDebugAction));
    exports.AddToWatchExpressionsAction = AddToWatchExpressionsAction;
    var RemoveWatchExpressionAction = /** @class */ (function (_super) {
        __extends(RemoveWatchExpressionAction, _super);
        function RemoveWatchExpressionAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, undefined, debugService, keybindingService) || this;
        }
        RemoveWatchExpressionAction.prototype.run = function (expression) {
            this.debugService.removeWatchExpressions(expression.getId());
            return winjs_base_1.TPromise.as(null);
        };
        RemoveWatchExpressionAction.ID = 'workbench.debug.viewlet.action.removeWatchExpression';
        RemoveWatchExpressionAction.LABEL = nls.localize('removeWatchExpression', "Remove Expression");
        RemoveWatchExpressionAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], RemoveWatchExpressionAction);
        return RemoveWatchExpressionAction;
    }(AbstractDebugAction));
    exports.RemoveWatchExpressionAction = RemoveWatchExpressionAction;
    var RemoveAllWatchExpressionsAction = /** @class */ (function (_super) {
        __extends(RemoveAllWatchExpressionsAction, _super);
        function RemoveAllWatchExpressionsAction(id, label, debugService, keybindingService) {
            var _this = _super.call(this, id, label, 'debug-action remove-all', debugService, keybindingService) || this;
            _this.toDispose.push(_this.debugService.getModel().onDidChangeWatchExpressions(function () { return _this.updateEnablement(); }));
            return _this;
        }
        RemoveAllWatchExpressionsAction.prototype.run = function () {
            this.debugService.removeWatchExpressions();
            return winjs_base_1.TPromise.as(null);
        };
        RemoveAllWatchExpressionsAction.prototype.isEnabled = function (state) {
            return _super.prototype.isEnabled.call(this, state) && this.debugService.getModel().getWatchExpressions().length > 0;
        };
        RemoveAllWatchExpressionsAction.ID = 'workbench.debug.viewlet.action.removeAllWatchExpressions';
        RemoveAllWatchExpressionsAction.LABEL = nls.localize('removeAllWatchExpressions', "Remove All Expressions");
        RemoveAllWatchExpressionsAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], RemoveAllWatchExpressionsAction);
        return RemoveAllWatchExpressionsAction;
    }(AbstractDebugAction));
    exports.RemoveAllWatchExpressionsAction = RemoveAllWatchExpressionsAction;
    var ClearReplAction = /** @class */ (function (_super) {
        __extends(ClearReplAction, _super);
        function ClearReplAction(id, label, debugService, keybindingService, panelService) {
            var _this = _super.call(this, id, label, 'debug-action clear-repl', debugService, keybindingService) || this;
            _this.panelService = panelService;
            return _this;
        }
        ClearReplAction.prototype.run = function () {
            this.debugService.removeReplExpressions();
            // focus back to repl
            return this.panelService.openPanel(debug_1.REPL_ID, true);
        };
        ClearReplAction.ID = 'workbench.debug.panel.action.clearReplAction';
        ClearReplAction.LABEL = nls.localize('clearRepl', "Clear Console");
        ClearReplAction = __decorate([
            __param(2, debug_1.IDebugService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, panelService_1.IPanelService)
        ], ClearReplAction);
        return ClearReplAction;
    }(AbstractDebugAction));
    exports.ClearReplAction = ClearReplAction;
    var ToggleReplAction = /** @class */ (function (_super) {
        __extends(ToggleReplAction, _super);
        function ToggleReplAction(id, label, debugService, partService, panelService) {
            var _this = _super.call(this, id, label, debug_1.REPL_ID, panelService, partService, 'debug-action toggle-repl') || this;
            _this.debugService = debugService;
            _this.toDispose = [];
            _this.registerListeners();
            return _this;
        }
        ToggleReplAction.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.debugService.getModel().onDidChangeReplElements(function () {
                if (!_this.isReplVisible()) {
                    _this.class = 'debug-action toggle-repl notification';
                    _this.tooltip = nls.localize('unreadOutput', "New Output in Debug Console");
                }
            }));
            this.toDispose.push(this.panelService.onDidPanelOpen(function (panel) {
                if (panel.getId() === debug_1.REPL_ID) {
                    _this.class = 'debug-action toggle-repl';
                    _this.tooltip = ToggleReplAction.LABEL;
                }
            }));
        };
        ToggleReplAction.prototype.isReplVisible = function () {
            var panel = this.panelService.getActivePanel();
            return panel && panel.getId() === debug_1.REPL_ID;
        };
        ToggleReplAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        ToggleReplAction.ID = 'workbench.debug.action.toggleRepl';
        ToggleReplAction.LABEL = nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'debugConsoleAction' }, 'Debug Console');
        ToggleReplAction = __decorate([
            __param(2, debug_1.IDebugService),
            __param(3, partService_1.IPartService),
            __param(4, panelService_1.IPanelService)
        ], ToggleReplAction);
        return ToggleReplAction;
    }(panel_1.TogglePanelAction));
    exports.ToggleReplAction = ToggleReplAction;
    var FocusReplAction = /** @class */ (function (_super) {
        __extends(FocusReplAction, _super);
        function FocusReplAction(id, label, panelService) {
            var _this = _super.call(this, id, label) || this;
            _this.panelService = panelService;
            return _this;
        }
        FocusReplAction.prototype.run = function () {
            return this.panelService.openPanel(debug_1.REPL_ID, true);
        };
        FocusReplAction.ID = 'workbench.debug.action.focusRepl';
        FocusReplAction.LABEL = nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'debugFocusConsole' }, 'Focus Debug Console');
        FocusReplAction = __decorate([
            __param(2, panelService_1.IPanelService)
        ], FocusReplAction);
        return FocusReplAction;
    }(actions_1.Action));
    exports.FocusReplAction = FocusReplAction;
    var FocusProcessAction = /** @class */ (function (_super) {
        __extends(FocusProcessAction, _super);
        function FocusProcessAction(id, label, debugService, keybindingService, editorService) {
            var _this = _super.call(this, id, label, null, debugService, keybindingService, 100) || this;
            _this.editorService = editorService;
            return _this;
        }
        FocusProcessAction.prototype.run = function (processName) {
            var isMultiRoot = this.debugService.getConfigurationManager().getLaunches().length > 1;
            var process = this.debugService.getModel().getProcesses().filter(function (p) { return p.getName(isMultiRoot) === processName; }).pop();
            this.debugService.focusStackFrame(undefined, undefined, process, true);
            var stackFrame = this.debugService.getViewModel().focusedStackFrame;
            if (stackFrame) {
                return stackFrame.openInEditor(this.editorService, true);
            }
            return winjs_base_1.TPromise.as(undefined);
        };
        FocusProcessAction.ID = 'workbench.action.debug.focusProcess';
        FocusProcessAction.LABEL = nls.localize('focusProcess', "Focus Process");
        FocusProcessAction = __decorate([
            __param(2, debug_1.IDebugService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, editorService_1.IWorkbenchEditorService)
        ], FocusProcessAction);
        return FocusProcessAction;
    }(AbstractDebugAction));
    exports.FocusProcessAction = FocusProcessAction;
    // Actions used by the chakra debugger
    var StepBackAction = /** @class */ (function (_super) {
        __extends(StepBackAction, _super);
        function StepBackAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action step-back', debugService, keybindingService, 50) || this;
        }
        StepBackAction.prototype.run = function (thread) {
            if (!(thread instanceof debugModel_1.Thread)) {
                thread = this.debugService.getViewModel().focusedThread;
            }
            return thread ? thread.stepBack() : winjs_base_1.TPromise.as(null);
        };
        StepBackAction.prototype.isEnabled = function (state) {
            var process = this.debugService.getViewModel().focusedProcess;
            return _super.prototype.isEnabled.call(this, state) && state === debug_1.State.Stopped &&
                process && process.session.capabilities.supportsStepBack;
        };
        StepBackAction.ID = 'workbench.action.debug.stepBack';
        StepBackAction.LABEL = nls.localize('stepBackDebug', "Step Back");
        StepBackAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], StepBackAction);
        return StepBackAction;
    }(AbstractDebugAction));
    exports.StepBackAction = StepBackAction;
    var ReverseContinueAction = /** @class */ (function (_super) {
        __extends(ReverseContinueAction, _super);
        function ReverseContinueAction(id, label, debugService, keybindingService) {
            return _super.call(this, id, label, 'debug-action reverse-continue', debugService, keybindingService, 60) || this;
        }
        ReverseContinueAction.prototype.run = function (thread) {
            if (!(thread instanceof debugModel_1.Thread)) {
                thread = this.debugService.getViewModel().focusedThread;
            }
            return thread ? thread.reverseContinue() : winjs_base_1.TPromise.as(null);
        };
        ReverseContinueAction.prototype.isEnabled = function (state) {
            var process = this.debugService.getViewModel().focusedProcess;
            return _super.prototype.isEnabled.call(this, state) && state === debug_1.State.Stopped &&
                process && process.session.capabilities.supportsStepBack;
        };
        ReverseContinueAction.ID = 'workbench.action.debug.reverseContinue';
        ReverseContinueAction.LABEL = nls.localize('reverseContinue', "Reverse");
        ReverseContinueAction = __decorate([
            __param(2, debug_1.IDebugService), __param(3, keybinding_1.IKeybindingService)
        ], ReverseContinueAction);
        return ReverseContinueAction;
    }(AbstractDebugAction));
    exports.ReverseContinueAction = ReverseContinueAction;
});
