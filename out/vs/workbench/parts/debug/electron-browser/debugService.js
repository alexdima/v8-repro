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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uuid", "vs/base/common/uri", "vs/base/common/platform", "vs/base/common/arrays", "vs/base/common/types", "vs/base/common/errors", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/base/browser/ui/aria/aria", "vs/base/parts/ipc/node/ipc.cp", "vs/platform/contextkey/common/contextkey", "vs/platform/markers/common/markers", "vs/platform/lifecycle/common/lifecycle", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/platform/message/common/message", "vs/platform/windows/common/windows", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/storage/common/storage", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/electron-browser/rawDebugSession", "vs/workbench/parts/debug/common/debugModel", "vs/workbench/parts/debug/common/debugViewModel", "vs/workbench/parts/debug/browser/debugActions", "vs/workbench/parts/debug/electron-browser/debugConfigurationManager", "vs/workbench/parts/markers/common/constants", "vs/workbench/parts/tasks/common/taskService", "vs/workbench/parts/files/common/files", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/services/panel/common/panelService", "vs/workbench/services/part/common/partService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorService", "vs/platform/extensions/common/extensionHost", "vs/platform/broadcast/electron-browser/broadcastService", "vs/base/node/console", "vs/workbench/parts/debug/common/debugSource", "vs/workbench/parts/tasks/common/tasks"], function (require, exports, nls, lifecycle, event_1, resources, strings, uuid_1, uri_1, platform, arrays_1, types_1, errors, severity_1, winjs_base_1, aria, ipc_cp_1, contextkey_1, markers_1, lifecycle_1, extensions_1, instantiation_1, files_1, message_1, windows_1, telemetry_1, telemetryService_1, telemetryIpc_1, storage_1, debug, rawDebugSession_1, debugModel_1, debugViewModel_1, debugactions, debugConfigurationManager_1, constants_1, taskService_1, files_2, viewlet_1, panelService_1, partService_1, textfiles_1, configuration_1, workspace_1, editorService_1, extensionHost_1, broadcastService_1, console_1, debugSource_1, tasks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEBUG_BREAKPOINTS_KEY = 'debug.breakpoint';
    var DEBUG_BREAKPOINTS_ACTIVATED_KEY = 'debug.breakpointactivated';
    var DEBUG_FUNCTION_BREAKPOINTS_KEY = 'debug.functionbreakpoint';
    var DEBUG_EXCEPTION_BREAKPOINTS_KEY = 'debug.exceptionbreakpoint';
    var DEBUG_WATCH_EXPRESSIONS_KEY = 'debug.watchexpressions';
    var DebugService = /** @class */ (function () {
        function DebugService(storageService, editorService, textFileService, viewletService, panelService, messageService, choiceService, partService, windowService, broadcastService, telemetryService, contextService, contextKeyService, lifecycleService, instantiationService, extensionService, markerService, taskService, fileService, configurationService) {
            this.storageService = storageService;
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.viewletService = viewletService;
            this.panelService = panelService;
            this.messageService = messageService;
            this.choiceService = choiceService;
            this.partService = partService;
            this.windowService = windowService;
            this.broadcastService = broadcastService;
            this.telemetryService = telemetryService;
            this.contextService = contextService;
            this.lifecycleService = lifecycleService;
            this.instantiationService = instantiationService;
            this.extensionService = extensionService;
            this.markerService = markerService;
            this.taskService = taskService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.toDispose = [];
            this.toDisposeOnSessionEnd = new Map();
            this.breakpointsToSendOnResourceSaved = new Set();
            this._onDidChangeState = new event_1.Emitter();
            this._onDidNewProcess = new event_1.Emitter();
            this._onDidEndProcess = new event_1.Emitter();
            this._onDidCustomEvent = new event_1.Emitter();
            this.sessionStates = new Map();
            this.allProcesses = new Map();
            this.configurationManager = this.instantiationService.createInstance(debugConfigurationManager_1.ConfigurationManager);
            this.toDispose.push(this.configurationManager);
            this.inDebugMode = debug.CONTEXT_IN_DEBUG_MODE.bindTo(contextKeyService);
            this.debugType = debug.CONTEXT_DEBUG_TYPE.bindTo(contextKeyService);
            this.debugState = debug.CONTEXT_DEBUG_STATE.bindTo(contextKeyService);
            this.model = new debugModel_1.Model(this.loadBreakpoints(), this.storageService.getBoolean(DEBUG_BREAKPOINTS_ACTIVATED_KEY, storage_1.StorageScope.WORKSPACE, true), this.loadFunctionBreakpoints(), this.loadExceptionBreakpoints(), this.loadWatchExpressions());
            this.toDispose.push(this.model);
            this.viewModel = new debugViewModel_1.ViewModel(contextKeyService);
            this.firstSessionStart = true;
            this.registerListeners();
        }
        DebugService.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.fileService.onFileChanges(function (e) { return _this.onFileChanges(e); }));
            this.lifecycleService.onShutdown(this.store, this);
            this.lifecycleService.onShutdown(this.dispose, this);
            this.toDispose.push(this.broadcastService.onBroadcast(this.onBroadcast, this));
        };
        DebugService.prototype.onBroadcast = function (broadcast) {
            // attach: PH is ready to be attached to
            var process = this.allProcesses.get(broadcast.payload.debugId);
            if (!process) {
                // Ignore attach events for sessions that never existed (wrong vscode windows)
                return;
            }
            var session = process.session;
            if (broadcast.channel === extensionHost_1.EXTENSION_ATTACH_BROADCAST_CHANNEL) {
                this.onSessionEnd(session);
                process.configuration.request = 'attach';
                process.configuration.port = broadcast.payload.port;
                this.doCreateProcess(process.session.root, process.configuration, process.getId());
                return;
            }
            if (broadcast.channel === extensionHost_1.EXTENSION_TERMINATE_BROADCAST_CHANNEL) {
                this.onSessionEnd(session);
                return;
            }
            // an extension logged output, show it inside the REPL
            if (broadcast.channel === extensionHost_1.EXTENSION_LOG_BROADCAST_CHANNEL) {
                var extensionOutput = broadcast.payload.logEntry;
                var sev = extensionOutput.severity === 'warn' ? severity_1.default.Warning : extensionOutput.severity === 'error' ? severity_1.default.Error : severity_1.default.Info;
                var _a = console_1.parse(extensionOutput), args = _a.args, stack = _a.stack;
                var source = void 0;
                if (stack) {
                    var frame = console_1.getFirstFrame(stack);
                    if (frame) {
                        source = {
                            column: frame.column,
                            lineNumber: frame.line,
                            source: process.getSource({
                                name: resources.basenameOrAuthority(frame.uri),
                                path: frame.uri.fsPath
                            })
                        };
                    }
                }
                // add output for each argument logged
                var simpleVals = [];
                for (var i = 0; i < args.length; i++) {
                    var a = args[i];
                    // undefined gets printed as 'undefined'
                    if (typeof a === 'undefined') {
                        simpleVals.push('undefined');
                    }
                    else if (a === null) {
                        simpleVals.push('null');
                    }
                    else if (types_1.isObject(a) || Array.isArray(a)) {
                        // flush any existing simple values logged
                        if (simpleVals.length) {
                            this.logToRepl(simpleVals.join(' '), sev, source);
                            simpleVals = [];
                        }
                        // show object
                        this.logToRepl(new debugModel_1.RawObjectReplElement(a.prototype, a, undefined, nls.localize('snapshotObj', "Only primitive values are shown for this object.")), sev, source);
                    }
                    else if (typeof a === 'string') {
                        var buf = '';
                        for (var j = 0, len = a.length; j < len; j++) {
                            if (a[j] === '%' && (a[j + 1] === 's' || a[j + 1] === 'i' || a[j + 1] === 'd')) {
                                i++; // read over substitution
                                buf += !types_1.isUndefinedOrNull(args[i]) ? args[i] : ''; // replace
                                j++; // read over directive
                            }
                            else {
                                buf += a[j];
                            }
                        }
                        simpleVals.push(buf);
                    }
                    else {
                        simpleVals.push(a);
                    }
                }
                // flush simple values
                // always append a new line for output coming from an extension such that separate logs go to separate lines #23695
                if (simpleVals.length) {
                    this.logToRepl(simpleVals.join(' ') + '\n', sev, source);
                }
            }
        };
        DebugService.prototype.tryToAutoFocusStackFrame = function (thread) {
            var callStack = thread.getCallStack();
            if (!callStack.length || (this.viewModel.focusedStackFrame && this.viewModel.focusedStackFrame.thread.getId() === thread.getId())) {
                return winjs_base_1.TPromise.as(null);
            }
            // focus first stack frame from top that has source location if no other stack frame is focused
            var stackFrameToFocus = arrays_1.first(callStack, function (sf) { return sf.source && sf.source.available; }, undefined);
            if (!stackFrameToFocus) {
                return winjs_base_1.TPromise.as(null);
            }
            this.focusStackFrame(stackFrameToFocus);
            if (thread.stoppedDetails) {
                this.windowService.focusWindow();
                aria.alert(nls.localize('debuggingPaused', "Debugging paused, reason {0}, {1} {2}", thread.stoppedDetails.reason, stackFrameToFocus.source ? stackFrameToFocus.source.name : '', stackFrameToFocus.range.startLineNumber));
            }
            return stackFrameToFocus.openInEditor(this.editorService, true);
        };
        DebugService.prototype.registerSessionListeners = function (process, session) {
            var _this = this;
            this.toDisposeOnSessionEnd.get(session.getId()).push(session);
            this.toDisposeOnSessionEnd.get(session.getId()).push(session.onDidInitialize(function (event) {
                aria.status(nls.localize('debuggingStarted', "Debugging started."));
                var sendConfigurationDone = function () {
                    if (session && session.capabilities.supportsConfigurationDoneRequest) {
                        return session.configurationDone().done(null, function (e) {
                            // Disconnect the debug session on configuration done error #10596
                            if (session) {
                                session.disconnect().done(null, errors.onUnexpectedError);
                            }
                            _this.messageService.show(severity_1.default.Error, e.message);
                        });
                    }
                };
                _this.sendAllBreakpoints(process).then(sendConfigurationDone, sendConfigurationDone)
                    .done(function () { return _this.fetchThreads(session); }, errors.onUnexpectedError);
            }));
            this.toDisposeOnSessionEnd.get(session.getId()).push(session.onDidStop(function (event) {
                _this.updateStateAndEmit(session.getId(), debug.State.Stopped);
                _this.fetchThreads(session, event.body).done(function () {
                    var thread = process && process.getThread(event.body.threadId);
                    if (thread) {
                        // Call fetch call stack twice, the first only return the top stack frame.
                        // Second retrieves the rest of the call stack. For performance reasons #25605
                        _this.model.fetchCallStack(thread).then(function () {
                            return _this.tryToAutoFocusStackFrame(thread);
                        });
                    }
                }, errors.onUnexpectedError);
            }));
            this.toDisposeOnSessionEnd.get(session.getId()).push(session.onDidThread(function (event) {
                if (event.body.reason === 'started') {
                    _this.fetchThreads(session).done(undefined, errors.onUnexpectedError);
                }
                else if (event.body.reason === 'exited') {
                    _this.model.clearThreads(session.getId(), true, event.body.threadId);
                }
            }));
            this.toDisposeOnSessionEnd.get(session.getId()).push(session.onDidTerminateDebugee(function (event) {
                aria.status(nls.localize('debuggingStopped', "Debugging stopped."));
                if (session && session.getId() === event.sessionId) {
                    if (event.body && event.body.restart && process) {
                        _this.restartProcess(process, event.body.restart).done(null, function (err) { return _this.messageService.show(severity_1.default.Error, err.message); });
                    }
                    else {
                        session.disconnect().done(null, errors.onUnexpectedError);
                    }
                }
            }));
            this.toDisposeOnSessionEnd.get(session.getId()).push(session.onDidContinued(function (event) {
                var threadId = event.body.allThreadsContinued !== false ? undefined : event.body.threadId;
                _this.model.clearThreads(session.getId(), false, threadId);
                if (_this.viewModel.focusedProcess.getId() === session.getId()) {
                    _this.focusStackFrame(undefined, _this.viewModel.focusedThread, _this.viewModel.focusedProcess);
                }
                _this.updateStateAndEmit(session.getId(), debug.State.Running);
            }));
            var outputPromises = [];
            this.toDisposeOnSessionEnd.get(session.getId()).push(session.onDidOutput(function (event) {
                if (!event.body) {
                    return;
                }
                var outputSeverity = event.body.category === 'stderr' ? severity_1.default.Error : event.body.category === 'console' ? severity_1.default.Warning : severity_1.default.Info;
                if (event.body.category === 'telemetry') {
                    // only log telemetry events from debug adapter if the adapter provided the telemetry key
                    // and the user opted in telemetry
                    if (session.customTelemetryService && _this.telemetryService.isOptedIn) {
                        // __GDPR__TODO__ We're sending events in the name of the debug adapter and we can not ensure that those are declared correctly.
                        session.customTelemetryService.publicLog(event.body.output, event.body.data);
                    }
                    return;
                }
                // Make sure to append output in the correct order by properly waiting on preivous promises #33822
                var waitFor = outputPromises.slice();
                var source = event.body.source ? {
                    lineNumber: event.body.line,
                    column: event.body.column,
                    source: process.getSource(event.body.source)
                } : undefined;
                if (event.body.variablesReference) {
                    var container = new debugModel_1.ExpressionContainer(process, event.body.variablesReference, uuid_1.generateUuid());
                    outputPromises.push(container.getChildren().then(function (children) {
                        return winjs_base_1.TPromise.join(waitFor).then(function () { return children.forEach(function (child) {
                            // Since we can not display multiple trees in a row, we are displaying these variables one after the other (ignoring their names)
                            child.name = null;
                            _this.logToRepl(child, outputSeverity, source);
                        }); });
                    }));
                }
                else if (typeof event.body.output === 'string') {
                    winjs_base_1.TPromise.join(waitFor).then(function () { return _this.logToRepl(event.body.output, outputSeverity, source); });
                }
                winjs_base_1.TPromise.join(outputPromises).then(function () { return outputPromises = []; });
            }));
            this.toDisposeOnSessionEnd.get(session.getId()).push(session.onDidBreakpoint(function (event) {
                var id = event.body && event.body.breakpoint ? event.body.breakpoint.id : undefined;
                var breakpoint = _this.model.getBreakpoints().filter(function (bp) { return bp.idFromAdapter === id; }).pop();
                var functionBreakpoint = _this.model.getFunctionBreakpoints().filter(function (bp) { return bp.idFromAdapter === id; }).pop();
                if (event.body.reason === 'new' && event.body.breakpoint.source) {
                    var source = process.getSource(event.body.breakpoint.source);
                    var bps = _this.model.addBreakpoints(source.uri, [{
                            column: event.body.breakpoint.column,
                            enabled: true,
                            lineNumber: event.body.breakpoint.line,
                        }], false);
                    if (bps.length === 1) {
                        _this.model.updateBreakpoints((_a = {}, _a[bps[0].getId()] = event.body.breakpoint, _a));
                    }
                }
                if (event.body.reason === 'removed') {
                    if (breakpoint) {
                        _this.model.removeBreakpoints([breakpoint]);
                    }
                    if (functionBreakpoint) {
                        _this.model.removeFunctionBreakpoints(functionBreakpoint.getId());
                    }
                }
                if (event.body.reason === 'changed') {
                    if (breakpoint) {
                        if (!breakpoint.column) {
                            event.body.breakpoint.column = undefined;
                        }
                        _this.model.updateBreakpoints((_b = {}, _b[breakpoint.getId()] = event.body.breakpoint, _b));
                    }
                    if (functionBreakpoint) {
                        _this.model.updateFunctionBreakpoints((_c = {}, _c[functionBreakpoint.getId()] = event.body.breakpoint, _c));
                    }
                }
                var _a, _b, _c;
            }));
            this.toDisposeOnSessionEnd.get(session.getId()).push(session.onDidExitAdapter(function (event) {
                // 'Run without debugging' mode VSCode must terminate the extension host. More details: #3905
                if (strings.equalsIgnoreCase(process.configuration.type, 'extensionhost') && _this.sessionStates.get(session.getId()) === debug.State.Running &&
                    process && process.session.root && process.configuration.noDebug) {
                    _this.broadcastService.broadcast({
                        channel: extensionHost_1.EXTENSION_CLOSE_EXTHOST_BROADCAST_CHANNEL,
                        payload: [process.session.root.uri.fsPath]
                    });
                }
                if (session && session.getId() === event.sessionId) {
                    _this.onSessionEnd(session);
                }
            }));
            this.toDisposeOnSessionEnd.get(session.getId()).push(session.onDidCustomEvent(function (event) {
                _this._onDidCustomEvent.fire(event);
            }));
        };
        DebugService.prototype.fetchThreads = function (session, stoppedDetails) {
            var _this = this;
            return session.threads().then(function (response) {
                if (response && response.body && response.body.threads) {
                    response.body.threads.forEach(function (thread) {
                        _this.model.rawUpdate({
                            sessionId: session.getId(),
                            threadId: thread.id,
                            thread: thread,
                            stoppedDetails: stoppedDetails && thread.id === stoppedDetails.threadId ? stoppedDetails : undefined
                        });
                    });
                }
            });
        };
        DebugService.prototype.loadBreakpoints = function () {
            var result;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_BREAKPOINTS_KEY, storage_1.StorageScope.WORKSPACE, '[]')).map(function (breakpoint) {
                    return new debugModel_1.Breakpoint(uri_1.default.parse(breakpoint.uri.external || breakpoint.source.uri.external), breakpoint.lineNumber, breakpoint.column, breakpoint.enabled, breakpoint.condition, breakpoint.hitCondition, breakpoint.adapterData);
                });
            }
            catch (e) { }
            return result || [];
        };
        DebugService.prototype.loadFunctionBreakpoints = function () {
            var result;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_FUNCTION_BREAKPOINTS_KEY, storage_1.StorageScope.WORKSPACE, '[]')).map(function (fb) {
                    return new debugModel_1.FunctionBreakpoint(fb.name, fb.enabled, fb.hitCondition);
                });
            }
            catch (e) { }
            return result || [];
        };
        DebugService.prototype.loadExceptionBreakpoints = function () {
            var result;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_EXCEPTION_BREAKPOINTS_KEY, storage_1.StorageScope.WORKSPACE, '[]')).map(function (exBreakpoint) {
                    return new debugModel_1.ExceptionBreakpoint(exBreakpoint.filter || exBreakpoint.name, exBreakpoint.label, exBreakpoint.enabled);
                });
            }
            catch (e) { }
            return result || [];
        };
        DebugService.prototype.loadWatchExpressions = function () {
            var result;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_WATCH_EXPRESSIONS_KEY, storage_1.StorageScope.WORKSPACE, '[]')).map(function (watchStoredData) {
                    return new debugModel_1.Expression(watchStoredData.name, watchStoredData.id);
                });
            }
            catch (e) { }
            return result || [];
        };
        Object.defineProperty(DebugService.prototype, "state", {
            get: function () {
                var focusedThread = this.viewModel.focusedThread;
                if (focusedThread && focusedThread.stopped) {
                    return debug.State.Stopped;
                }
                var focusedProcess = this.viewModel.focusedProcess;
                if (focusedProcess && this.sessionStates.has(focusedProcess.getId())) {
                    return this.sessionStates.get(focusedProcess.getId());
                }
                if (this.sessionStates.size > 0) {
                    return debug.State.Initializing;
                }
                return debug.State.Inactive;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugService.prototype, "onDidChangeState", {
            get: function () {
                return this._onDidChangeState.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugService.prototype, "onDidNewProcess", {
            get: function () {
                return this._onDidNewProcess.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugService.prototype, "onDidEndProcess", {
            get: function () {
                return this._onDidEndProcess.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugService.prototype, "onDidCustomEvent", {
            get: function () {
                return this._onDidCustomEvent.event;
            },
            enumerable: true,
            configurable: true
        });
        DebugService.prototype.updateStateAndEmit = function (sessionId, newState) {
            if (sessionId) {
                if (newState === debug.State.Inactive) {
                    this.sessionStates.delete(sessionId);
                }
                else {
                    this.sessionStates.set(sessionId, newState);
                }
            }
            var state = this.state;
            if (this.previousState !== state) {
                var stateLabel = debug.State[state];
                if (stateLabel) {
                    this.debugState.set(stateLabel.toLowerCase());
                }
                this.previousState = state;
                this._onDidChangeState.fire(state);
            }
        };
        DebugService.prototype.focusStackFrame = function (stackFrame, thread, process, explicit) {
            if (!process) {
                if (stackFrame || thread) {
                    process = stackFrame ? stackFrame.thread.process : thread.process;
                }
                else {
                    var processes = this.model.getProcesses();
                    process = processes.length ? processes[0] : undefined;
                }
            }
            if (!thread) {
                if (stackFrame) {
                    thread = stackFrame.thread;
                }
                else {
                    var threads = process ? process.getAllThreads() : undefined;
                    thread = threads && threads.length ? threads[0] : undefined;
                }
            }
            if (!stackFrame) {
                if (thread) {
                    var callStack = thread.getCallStack();
                    stackFrame = callStack && callStack.length ? callStack[0] : null;
                }
            }
            this.viewModel.setFocus(stackFrame, thread, process, explicit);
            this.updateStateAndEmit();
        };
        DebugService.prototype.enableOrDisableBreakpoints = function (enable, breakpoint) {
            if (breakpoint) {
                this.model.setEnablement(breakpoint, enable);
                if (breakpoint instanceof debugModel_1.Breakpoint) {
                    return this.sendBreakpoints(breakpoint.uri);
                }
                else if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
                    return this.sendFunctionBreakpoints();
                }
                return this.sendExceptionBreakpoints();
            }
            this.model.enableOrDisableAllBreakpoints(enable);
            return this.sendAllBreakpoints();
        };
        DebugService.prototype.addBreakpoints = function (uri, rawBreakpoints) {
            this.model.addBreakpoints(uri, rawBreakpoints);
            rawBreakpoints.forEach(function (rbp) { return aria.status(nls.localize('breakpointAdded', "Added breakpoint, line {0}, file {1}", rbp.lineNumber, uri.fsPath)); });
            return this.sendBreakpoints(uri);
        };
        DebugService.prototype.updateBreakpoints = function (uri, data, sendOnResourceSaved) {
            this.model.updateBreakpoints(data);
            if (sendOnResourceSaved) {
                this.breakpointsToSendOnResourceSaved.add(uri.toString());
            }
            else {
                this.sendBreakpoints(uri);
            }
        };
        DebugService.prototype.removeBreakpoints = function (id) {
            var _this = this;
            var toRemove = this.model.getBreakpoints().filter(function (bp) { return !id || bp.getId() === id; });
            toRemove.forEach(function (bp) { return aria.status(nls.localize('breakpointRemoved', "Removed breakpoint, line {0}, file {1}", bp.lineNumber, bp.uri.fsPath)); });
            var urisToClear = arrays_1.distinct(toRemove, function (bp) { return bp.uri.toString(); }).map(function (bp) { return bp.uri; });
            this.model.removeBreakpoints(toRemove);
            return winjs_base_1.TPromise.join(urisToClear.map(function (uri) { return _this.sendBreakpoints(uri); }));
        };
        DebugService.prototype.setBreakpointsActivated = function (activated) {
            this.model.setBreakpointsActivated(activated);
            return this.sendAllBreakpoints();
        };
        DebugService.prototype.addFunctionBreakpoint = function (name, id) {
            var newFunctionBreakpoint = this.model.addFunctionBreakpoint(name || '', id);
            this.viewModel.setSelectedFunctionBreakpoint(newFunctionBreakpoint);
        };
        DebugService.prototype.renameFunctionBreakpoint = function (id, newFunctionName) {
            this.model.updateFunctionBreakpoints((_a = {}, _a[id] = { name: newFunctionName }, _a));
            return this.sendFunctionBreakpoints();
            var _a;
        };
        DebugService.prototype.removeFunctionBreakpoints = function (id) {
            this.model.removeFunctionBreakpoints(id);
            return this.sendFunctionBreakpoints();
        };
        DebugService.prototype.addReplExpression = function (name) {
            var _this = this;
            return this.model.addReplExpression(this.viewModel.focusedProcess, this.viewModel.focusedStackFrame, name)
                .then(function () { return _this.focusStackFrame(_this.viewModel.focusedStackFrame, _this.viewModel.focusedThread, _this.viewModel.focusedProcess); });
        };
        DebugService.prototype.removeReplExpressions = function () {
            this.model.removeReplExpressions();
        };
        DebugService.prototype.logToRepl = function (value, sev, source) {
            if (sev === void 0) { sev = severity_1.default.Info; }
            if (typeof value === 'string' && '[2J'.localeCompare(value) === 0) {
                // [2J is the ansi escape sequence for clearing the display http://ascii-table.com/ansi-escape-sequences.php
                this.model.removeReplExpressions();
            }
            else {
                this.model.appendToRepl(value, sev, source);
            }
        };
        DebugService.prototype.addWatchExpression = function (name) {
            var we = this.model.addWatchExpression(this.viewModel.focusedProcess, this.viewModel.focusedStackFrame, name);
            this.viewModel.setSelectedExpression(we);
        };
        DebugService.prototype.renameWatchExpression = function (id, newName) {
            return this.model.renameWatchExpression(this.viewModel.focusedProcess, this.viewModel.focusedStackFrame, id, newName);
        };
        DebugService.prototype.moveWatchExpression = function (id, position) {
            this.model.moveWatchExpression(id, position);
        };
        DebugService.prototype.removeWatchExpressions = function (id) {
            this.model.removeWatchExpressions(id);
        };
        DebugService.prototype.startDebugging = function (launch, configOrName, noDebug) {
            var _this = this;
            if (noDebug === void 0) { noDebug = false; }
            // make sure to save all files and that the configuration is up to date
            return this.extensionService.activateByEvent('onDebug').then(function () { return _this.textFileService.saveAll().then(function () { return _this.configurationService.reloadConfiguration(launch ? launch.workspace : undefined).then(function () {
                return _this.extensionService.whenInstalledExtensionsRegistered().then(function () {
                    if (_this.model.getProcesses().length === 0) {
                        _this.removeReplExpressions();
                        _this.allProcesses.clear();
                        _this.model.getBreakpoints().forEach(function (bp) { return bp.verified = false; });
                    }
                    _this.launchJsonChanged = false;
                    var config, compound;
                    if (!configOrName) {
                        configOrName = _this.configurationManager.selectedConfiguration.name;
                    }
                    if (typeof configOrName === 'string' && launch) {
                        config = launch.getConfiguration(configOrName);
                        compound = launch.getCompound(configOrName);
                    }
                    else if (typeof configOrName !== 'string') {
                        config = configOrName;
                    }
                    if (compound) {
                        if (!compound.configurations) {
                            return winjs_base_1.TPromise.wrapError(new Error(nls.localize({ key: 'compoundMustHaveConfigurations', comment: ['compound indicates a "compounds" configuration item', '"configurations" is an attribute and should not be localized'] }, "Compound must have \"configurations\" attribute set in order to start multiple configurations.")));
                        }
                        return winjs_base_1.TPromise.join(compound.configurations.map(function (configData) {
                            var name = typeof configData === 'string' ? configData : configData.name;
                            if (name === compound.name) {
                                return winjs_base_1.TPromise.as(null);
                            }
                            var launchForName;
                            if (typeof configData === 'string') {
                                var launchesContainingName = _this.configurationManager.getLaunches().filter(function (l) { return !!l.getConfiguration(name); });
                                if (launchesContainingName.length === 1) {
                                    launchForName = launchesContainingName[0];
                                }
                                else if (launchesContainingName.length > 1 && launchesContainingName.indexOf(launch) >= 0) {
                                    // If there are multiple launches containing the configuration give priority to the configuration in the current launch
                                    launchForName = launch;
                                }
                                else {
                                    return winjs_base_1.TPromise.wrapError(new Error(launchesContainingName.length === 0 ? nls.localize('noConfigurationNameInWorkspace', "Could not find launch configuration '{0}' in the workspace.", name)
                                        : nls.localize('multipleConfigurationNamesInWorkspace', "There are multiple launch configurations `{0}` in the workspace. Use folder name to qualify the configuration.", name)));
                                }
                            }
                            else if (configData.folder) {
                                var launchesMatchingConfigData = _this.configurationManager.getLaunches().filter(function (l) { return l.workspace && l.workspace.name === configData.folder && !!l.getConfiguration(configData.name); });
                                if (launchesMatchingConfigData.length === 1) {
                                    launchForName = launchesMatchingConfigData[0];
                                }
                                else {
                                    return winjs_base_1.TPromise.wrapError(new Error(nls.localize('noFolderWithName', "Can not find folder with name '{0}' for configuration '{1}' in compound '{2}'.", configData.folder, configData.name, compound.name)));
                                }
                            }
                            return _this.startDebugging(launchForName, name, noDebug);
                        }));
                    }
                    if (configOrName && !config) {
                        var message = !!launch ? nls.localize('configMissing', "Configuration '{0}' is missing in 'launch.json'.", configOrName) :
                            nls.localize('launchJsonDoesNotExist', "'launch.json' does not exist.");
                        return winjs_base_1.TPromise.wrapError(new Error(message));
                    }
                    // We keep the debug type in a separate variable 'type' so that a no-folder config has no attributes.
                    // Storing the type in the config would break extensions that assume that the no-folder case is indicated by an empty config.
                    var type;
                    if (config) {
                        type = config.type;
                    }
                    else {
                        // a no-folder workspace has no launch.config
                        config = {};
                    }
                    if (noDebug) {
                        config.noDebug = true;
                    }
                    var sessionId = uuid_1.generateUuid();
                    _this.updateStateAndEmit(sessionId, debug.State.Initializing);
                    var wrapUpState = function () {
                        if (_this.sessionStates.get(sessionId) === debug.State.Initializing) {
                            _this.updateStateAndEmit(sessionId, debug.State.Inactive);
                        }
                    };
                    return (type ? winjs_base_1.TPromise.as(null) : _this.configurationManager.guessAdapter().then(function (a) { return type = a && a.type; })).then(function () {
                        return (type ? _this.extensionService.activateByEvent("onDebugResolve:" + type) : winjs_base_1.TPromise.as(null)).then(function () {
                            return _this.configurationManager.resolveConfigurationByProviders(launch && launch.workspace ? launch.workspace.uri : undefined, type, config).then(function (config) {
                                // a falsy config indicates an aborted launch
                                if (config && config.type) {
                                    return _this.createProcess(launch, config, sessionId);
                                }
                                if (launch) {
                                    return launch.openConfigFile(false, type).done(undefined, errors.onUnexpectedError);
                                }
                            });
                        }).then(function () { return wrapUpState(); }, function (err) {
                            wrapUpState();
                            return winjs_base_1.TPromise.wrapError(err);
                        });
                    });
                });
            }); }); });
        };
        DebugService.prototype.createProcess = function (launch, config, sessionId) {
            var _this = this;
            return this.textFileService.saveAll().then(function () {
                return (launch ? launch.resolveConfiguration(config) : winjs_base_1.TPromise.as(config)).then(function (resolvedConfig) {
                    if (!resolvedConfig) {
                        // User canceled resolving of interactive variables, silently return
                        return undefined;
                    }
                    if (!_this.configurationManager.getAdapter(resolvedConfig.type) || (config.request !== 'attach' && config.request !== 'launch')) {
                        var message = void 0;
                        if (config.request !== 'attach' && config.request !== 'launch') {
                            message = config.request ? nls.localize('debugRequestNotSupported', "Attribute `{0}` has an unsupported value '{1}' in the chosen debug configuration.", 'request', config.request)
                                : nls.localize('debugRequesMissing', "Attribute '{0}' is missing from the chosen debug configuration.", 'request');
                        }
                        else {
                            message = resolvedConfig.type ? nls.localize('debugTypeNotSupported', "Configured debug type '{0}' is not supported.", resolvedConfig.type) :
                                nls.localize('debugTypeMissing', "Missing property `type` for the chosen launch configuration.");
                        }
                        return winjs_base_1.TPromise.wrapError(errors.create(message, { actions: [_this.instantiationService.createInstance(debugactions.ConfigureAction, debugactions.ConfigureAction.ID, debugactions.ConfigureAction.LABEL), message_1.CloseAction] }));
                    }
                    _this.toDisposeOnSessionEnd.set(sessionId, []);
                    var workspace = launch ? launch.workspace : undefined;
                    return _this.runPreLaunchTask(sessionId, workspace, resolvedConfig.preLaunchTask).then(function (taskSummary) {
                        var errorCount = resolvedConfig.preLaunchTask ? _this.markerService.getStatistics().errors : 0;
                        var successExitCode = taskSummary && taskSummary.exitCode === 0;
                        var failureExitCode = taskSummary && taskSummary.exitCode !== undefined && taskSummary.exitCode !== 0;
                        if (successExitCode || (errorCount === 0 && !failureExitCode)) {
                            return _this.doCreateProcess(workspace, resolvedConfig, sessionId);
                        }
                        var message = errorCount > 1 ? nls.localize('preLaunchTaskErrors', "Build errors have been detected during preLaunchTask '{0}'.", resolvedConfig.preLaunchTask) :
                            errorCount === 1 ? nls.localize('preLaunchTaskError', "Build error has been detected during preLaunchTask '{0}'.", resolvedConfig.preLaunchTask) :
                                nls.localize('preLaunchTaskExitCode', "The preLaunchTask '{0}' terminated with exit code {1}.", resolvedConfig.preLaunchTask, taskSummary.exitCode);
                        return _this.choiceService.choose(severity_1.default.Error, message, [nls.localize('debugAnyway', "Debug Anyway"), nls.localize('showErrors', "Show Errors"), nls.localize('cancel', "Cancel")], 2, true).then(function (choice) {
                            switch (choice) {
                                case 0:
                                    return _this.doCreateProcess(workspace, resolvedConfig, sessionId);
                                case 1:
                                    return _this.panelService.openPanel(constants_1.default.MARKERS_PANEL_ID).then(function () { return undefined; });
                                default:
                                    return undefined;
                            }
                        });
                    }, function (err) {
                        return _this.choiceService.choose(severity_1.default.Error, err.message, [nls.localize('debugAnyway', "Debug Anyway"), debugactions.ConfigureAction.LABEL, _this.taskService.configureAction().label, nls.localize('cancel', "Cancel")], 3, true).then(function (choice) {
                            switch (choice) {
                                case 0:
                                    return _this.doCreateProcess(workspace, resolvedConfig, sessionId);
                                case 1:
                                    return launch && launch.openConfigFile(false);
                                case 2:
                                    return _this.taskService.configureAction().run();
                                default:
                                    return undefined;
                            }
                        });
                    });
                }, function (err) {
                    if (_this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                        _this.messageService.show(severity_1.default.Error, nls.localize('noFolderWorkspaceDebugError', "The active file can not be debugged. Make sure it is saved on disk and that you have a debug extension installed for that file type."));
                        return undefined;
                    }
                    return launch && launch.openConfigFile(false).then(function (editor) { return void 0; });
                });
            });
        };
        DebugService.prototype.doCreateProcess = function (root, configuration, sessionId) {
            var _this = this;
            configuration.__sessionId = sessionId;
            this.inDebugMode.set(true);
            return this.telemetryService.getTelemetryInfo().then(function (info) {
                var telemetryInfo = Object.create(null);
                telemetryInfo['common.vscodemachineid'] = info.machineId;
                telemetryInfo['common.vscodesessionid'] = info.sessionId;
                return telemetryInfo;
            }).then(function (data) {
                var adapter = _this.configurationManager.getAdapter(configuration.type);
                var aiKey = adapter.aiKey, type = adapter.type;
                var publisher = adapter.extensionDescription.publisher;
                var client;
                var customTelemetryService;
                if (aiKey) {
                    client = new ipc_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, {
                        serverName: 'Debug Telemetry',
                        timeout: 1000 * 60 * 5,
                        args: [publisher + "." + type, JSON.stringify(data), aiKey],
                        env: {
                            ELECTRON_RUN_AS_NODE: 1,
                            PIPE_LOGGING: 'true',
                            AMD_ENTRYPOINT: 'vs/workbench/parts/debug/node/telemetryApp'
                        }
                    });
                    var channel = client.getChannel('telemetryAppender');
                    var appender = new telemetryIpc_1.TelemetryAppenderClient(channel);
                    customTelemetryService = new telemetryService_1.TelemetryService({ appender: appender }, _this.configurationService);
                }
                var session = _this.instantiationService.createInstance(rawDebugSession_1.RawDebugSession, sessionId, configuration.debugServer, adapter, customTelemetryService, root);
                var process = _this.model.addProcess(configuration, session);
                _this.allProcesses.set(process.getId(), process);
                if (client) {
                    _this.toDisposeOnSessionEnd.get(session.getId()).push(client);
                }
                _this.registerSessionListeners(process, session);
                return session.initialize({
                    clientID: 'vscode',
                    adapterID: configuration.type,
                    pathFormat: 'path',
                    linesStartAt1: true,
                    columnsStartAt1: true,
                    supportsVariableType: true,
                    supportsVariablePaging: true,
                    supportsRunInTerminalRequest: true,
                    locale: platform.locale
                }).then(function (result) {
                    _this.model.setExceptionBreakpoints(session.capabilities.exceptionBreakpointFilters);
                    return configuration.request === 'attach' ? session.attach(configuration) : session.launch(configuration);
                }).then(function (result) {
                    if (session.disconnected) {
                        return winjs_base_1.TPromise.as(null);
                    }
                    _this.focusStackFrame(undefined, undefined, process);
                    _this._onDidNewProcess.fire(process);
                    var internalConsoleOptions = configuration.internalConsoleOptions || _this.configurationService.getValue('debug').internalConsoleOptions;
                    if (internalConsoleOptions === 'openOnSessionStart' || (_this.firstSessionStart && internalConsoleOptions === 'openOnFirstSessionStart')) {
                        _this.panelService.openPanel(debug.REPL_ID, false).done(undefined, errors.onUnexpectedError);
                    }
                    var openDebugOptions = _this.configurationService.getValue('debug').openDebug;
                    // Open debug viewlet based on the visibility of the side bar and openDebug setting
                    if (openDebugOptions === 'openOnSessionStart' || (openDebugOptions === 'openOnFirstSessionStart' && _this.firstSessionStart)) {
                        _this.viewletService.openViewlet(debug.VIEWLET_ID);
                    }
                    _this.firstSessionStart = false;
                    _this.debugType.set(configuration.type);
                    if (_this.model.getProcesses().length > 1) {
                        _this.viewModel.setMultiProcessView(true);
                    }
                    _this.updateStateAndEmit(session.getId(), debug.State.Running);
                    /* __GDPR__
                        "debugSessionStart" : {
                            "type": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "breakpointCount": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "exceptionBreakpoints": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                            "watchExpressionsCount": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "extensionName": { "classification": "PublicPersonalData", "purpose": "FeatureInsight" },
                            "isBuiltin": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "launchJsonExists": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                        }
                    */
                    return _this.telemetryService.publicLog('debugSessionStart', {
                        type: configuration.type,
                        breakpointCount: _this.model.getBreakpoints().length,
                        exceptionBreakpoints: _this.model.getExceptionBreakpoints(),
                        watchExpressionsCount: _this.model.getWatchExpressions().length,
                        extensionName: adapter.extensionDescription.publisher + "." + adapter.extensionDescription.name,
                        isBuiltin: adapter.extensionDescription.isBuiltin,
                        launchJsonExists: root && !!_this.configurationService.getValue('launch', { resource: root.uri })
                    });
                }).then(function () { return process; }, function (error) {
                    if (error instanceof Error && error.message === 'Canceled') {
                        // Do not show 'canceled' error messages to the user #7906
                        return winjs_base_1.TPromise.as(null);
                    }
                    var errorMessage = error instanceof Error ? error.message : error;
                    /* __GDPR__
                        "debugMisconfiguration" : {
                            "type" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "error": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                        }
                    */
                    _this.telemetryService.publicLog('debugMisconfiguration', { type: configuration ? configuration.type : undefined, error: errorMessage });
                    _this.updateStateAndEmit(session.getId(), debug.State.Inactive);
                    if (!session.disconnected) {
                        session.disconnect().done(null, errors.onUnexpectedError);
                    }
                    if (process) {
                        _this.model.removeProcess(process.getId());
                    }
                    // Show the repl if some error got logged there #5870
                    if (_this.model.getReplElements().length > 0) {
                        _this.panelService.openPanel(debug.REPL_ID, false).done(undefined, errors.onUnexpectedError);
                    }
                    if (_this.model.getReplElements().length === 0) {
                        _this.inDebugMode.reset();
                    }
                    var configureAction = _this.instantiationService.createInstance(debugactions.ConfigureAction, debugactions.ConfigureAction.ID, debugactions.ConfigureAction.LABEL);
                    var actions = (error.actions && error.actions.length) ? error.actions.concat([configureAction]) : [message_1.CloseAction, configureAction];
                    _this.messageService.show(severity_1.default.Error, { message: errorMessage, actions: actions });
                    return undefined;
                });
            });
        };
        DebugService.prototype.runPreLaunchTask = function (sessionId, root, taskName) {
            var _this = this;
            if (!taskName) {
                return winjs_base_1.TPromise.as(null);
            }
            // run a task before starting a debug session
            return this.taskService.getTask(root, taskName).then(function (task) {
                if (!task) {
                    return winjs_base_1.TPromise.wrapError(errors.create(nls.localize('DebugTaskNotFound', "Could not find the preLaunchTask \'{0}\'.", taskName)));
                }
                function once(kind, event) {
                    return function (listener, thisArgs, disposables) {
                        if (thisArgs === void 0) { thisArgs = null; }
                        var result = event(function (e) {
                            if (e.kind === kind) {
                                result.dispose();
                                return listener.call(thisArgs, e);
                            }
                        }, null, disposables);
                        return result;
                    };
                }
                // If a task is missing the problem matcher the promise will never complete, so we need to have a workaround #35340
                var taskStarted = false;
                var promise = _this.taskService.getActiveTasks().then(function (tasks) {
                    if (tasks.filter(function (t) { return t._id === task._id; }).length) {
                        // task is already running - nothing to do.
                        return winjs_base_1.TPromise.as(null);
                    }
                    _this.toDisposeOnSessionEnd.get(sessionId).push(once(tasks_1.TaskEventKind.Active, _this.taskService.onDidStateChange)(function () {
                        taskStarted = true;
                    }));
                    var taskPromise = _this.taskService.run(task);
                    if (task.isBackground) {
                        return new winjs_base_1.TPromise(function (c, e) { return _this.toDisposeOnSessionEnd.get(sessionId).push(once(tasks_1.TaskEventKind.Inactive, _this.taskService.onDidStateChange)(function () { return c(null); })); });
                    }
                    return taskPromise;
                });
                return new winjs_base_1.TPromise(function (c, e) {
                    promise.then(function (result) {
                        taskStarted = true;
                        c(result);
                    }, function (error) { return e(error); });
                    setTimeout(function () {
                        if (!taskStarted) {
                            e({ severity: severity_1.default.Error, message: nls.localize('taskNotTracked', "The preLaunchTask '{0}' cannot be tracked.", taskName) });
                        }
                    }, 10000);
                });
            });
        };
        DebugService.prototype.sourceIsNotAvailable = function (uri) {
            this.model.sourceIsNotAvailable(uri);
        };
        DebugService.prototype.restartProcess = function (process, restartData) {
            var _this = this;
            return this.textFileService.saveAll().then(function () {
                if (process.session.capabilities.supportsRestartRequest) {
                    return process.session.custom('restart', null);
                }
                var focusedProcess = _this.viewModel.focusedProcess;
                var preserveFocus = focusedProcess && process.getId() === focusedProcess.getId();
                return process.session.disconnect(true).then(function () {
                    if (strings.equalsIgnoreCase(process.configuration.type, 'extensionHost') && process.session.root) {
                        return _this.broadcastService.broadcast({
                            channel: extensionHost_1.EXTENSION_RELOAD_BROADCAST_CHANNEL,
                            payload: [process.session.root.uri.fsPath]
                        });
                    }
                    return new winjs_base_1.TPromise(function (c, e) {
                        setTimeout(function () {
                            // Read the configuration again if a launch.json has been changed, if not just use the inmemory configuration
                            var config = process.configuration;
                            var launch = process.session.root ? _this.configurationManager.getLaunch(process.session.root.uri) : undefined;
                            if (_this.launchJsonChanged && launch) {
                                _this.launchJsonChanged = false;
                                config = launch.getConfiguration(process.configuration.name) || config;
                                // Take the type from the process since the debug extension might overwrite it #21316
                                config.type = process.configuration.type;
                                config.noDebug = process.configuration.noDebug;
                            }
                            config.__restart = restartData;
                            _this.startDebugging(launch, config).then(function () { return c(null); }, function (err) { return e(err); });
                        }, 300);
                    });
                }).then(function () {
                    if (preserveFocus) {
                        // Restart should preserve the focused process
                        var restartedProcess = _this.model.getProcesses().filter(function (p) { return p.configuration.name === process.configuration.name; }).pop();
                        if (restartedProcess && restartedProcess !== _this.viewModel.focusedProcess) {
                            _this.focusStackFrame(undefined, undefined, restartedProcess);
                        }
                    }
                });
            });
        };
        DebugService.prototype.stopProcess = function (process) {
            if (process) {
                return process.session.disconnect(false, true);
            }
            var processes = this.model.getProcesses();
            if (processes.length) {
                return winjs_base_1.TPromise.join(processes.map(function (p) { return p.session.disconnect(false, true); }));
            }
            this.sessionStates.clear();
            this._onDidChangeState.fire();
            return undefined;
        };
        DebugService.prototype.onSessionEnd = function (session) {
            var bpsExist = this.model.getBreakpoints().length > 0;
            var process = this.model.getProcesses().filter(function (p) { return p.getId() === session.getId(); }).pop();
            /* __GDPR__
                "debugSessionStop" : {
                    "type" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "success": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "sessionLengthInSeconds": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "breakpointCount": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "watchExpressionsCount": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('debugSessionStop', {
                type: process && process.configuration.type,
                success: session.emittedStopped || !bpsExist,
                sessionLengthInSeconds: session.getLengthInSeconds(),
                breakpointCount: this.model.getBreakpoints().length,
                watchExpressionsCount: this.model.getWatchExpressions().length
            });
            this.model.removeProcess(session.getId());
            if (process) {
                process.inactive = true;
                this._onDidEndProcess.fire(process);
            }
            this.toDisposeOnSessionEnd.set(session.getId(), lifecycle.dispose(this.toDisposeOnSessionEnd.get(session.getId())));
            var focusedProcess = this.viewModel.focusedProcess;
            if (focusedProcess && focusedProcess.getId() === session.getId()) {
                this.focusStackFrame(null);
            }
            this.updateStateAndEmit(session.getId(), debug.State.Inactive);
            if (this.model.getProcesses().length === 0) {
                // set breakpoints back to unverified since the session ended.
                var data_1 = {};
                this.model.getBreakpoints().forEach(function (bp) {
                    data_1[bp.getId()] = { line: bp.lineNumber, verified: false, column: bp.column, endLine: bp.endLineNumber, endColumn: bp.endColumn };
                });
                this.model.updateBreakpoints(data_1);
                this.inDebugMode.reset();
                this.debugType.reset();
                this.viewModel.setMultiProcessView(false);
                if (this.partService.isVisible(partService_1.Parts.SIDEBAR_PART) && this.configurationService.getValue('debug').openExplorerOnEnd) {
                    this.viewletService.openViewlet(files_2.VIEWLET_ID).done(null, errors.onUnexpectedError);
                }
            }
        };
        DebugService.prototype.getModel = function () {
            return this.model;
        };
        DebugService.prototype.getViewModel = function () {
            return this.viewModel;
        };
        DebugService.prototype.getConfigurationManager = function () {
            return this.configurationManager;
        };
        DebugService.prototype.sendAllBreakpoints = function (process) {
            var _this = this;
            return winjs_base_1.TPromise.join(arrays_1.distinct(this.model.getBreakpoints(), function (bp) { return bp.uri.toString(); }).map(function (bp) { return _this.sendBreakpoints(bp.uri, false, process); }))
                .then(function () { return _this.sendFunctionBreakpoints(process); })
                .then(function () { return _this.sendExceptionBreakpoints(process); });
        };
        DebugService.prototype.sendBreakpoints = function (modelUri, sourceModified, targetProcess) {
            var _this = this;
            if (sourceModified === void 0) { sourceModified = false; }
            var sendBreakpointsToProcess = function (process) {
                var session = process.session;
                if (!session.readyForBreakpoints) {
                    return winjs_base_1.TPromise.as(null);
                }
                var breakpointsToSend = _this.model.getBreakpoints().filter(function (bp) { return _this.model.areBreakpointsActivated() && bp.enabled && bp.uri.toString() === modelUri.toString(); });
                var source = process.sources.get(modelUri.toString());
                var rawSource;
                if (source) {
                    rawSource = source.raw;
                }
                else {
                    var data = debugSource_1.Source.getEncodedDebugData(modelUri);
                    rawSource = { name: data.name, path: data.path, sourceReference: data.sourceReference };
                }
                if (breakpointsToSend.length && !rawSource.adapterData) {
                    rawSource.adapterData = breakpointsToSend[0].adapterData;
                }
                return session.setBreakpoints({
                    source: rawSource,
                    lines: breakpointsToSend.map(function (bp) { return bp.lineNumber; }),
                    breakpoints: breakpointsToSend.map(function (bp) { return ({ line: bp.lineNumber, column: bp.column, condition: bp.condition, hitCondition: bp.hitCondition }); }),
                    sourceModified: sourceModified
                }).then(function (response) {
                    if (!response || !response.body) {
                        return;
                    }
                    var data = {};
                    for (var i = 0; i < breakpointsToSend.length; i++) {
                        data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];
                        if (!breakpointsToSend[i].column) {
                            // If there was no column sent ignore the breakpoint column response from the adapter
                            data[breakpointsToSend[i].getId()].column = undefined;
                        }
                    }
                    _this.model.updateBreakpoints(data);
                });
            };
            return this.sendToOneOrAllProcesses(targetProcess, sendBreakpointsToProcess);
        };
        DebugService.prototype.sendFunctionBreakpoints = function (targetProcess) {
            var _this = this;
            var sendFunctionBreakpointsToProcess = function (process) {
                var session = process.session;
                if (!session.readyForBreakpoints || !session.capabilities.supportsFunctionBreakpoints) {
                    return winjs_base_1.TPromise.as(null);
                }
                var breakpointsToSend = _this.model.getFunctionBreakpoints().filter(function (fbp) { return fbp.enabled && _this.model.areBreakpointsActivated(); });
                return session.setFunctionBreakpoints({ breakpoints: breakpointsToSend }).then(function (response) {
                    if (!response || !response.body) {
                        return;
                    }
                    var data = {};
                    for (var i = 0; i < breakpointsToSend.length; i++) {
                        data[breakpointsToSend[i].getId()] = response.body.breakpoints[i];
                    }
                    _this.model.updateFunctionBreakpoints(data);
                });
            };
            return this.sendToOneOrAllProcesses(targetProcess, sendFunctionBreakpointsToProcess);
        };
        DebugService.prototype.sendExceptionBreakpoints = function (targetProcess) {
            var _this = this;
            var sendExceptionBreakpointsToProcess = function (process) {
                var session = process.session;
                if (!session.readyForBreakpoints || _this.model.getExceptionBreakpoints().length === 0) {
                    return winjs_base_1.TPromise.as(null);
                }
                var enabledExceptionBps = _this.model.getExceptionBreakpoints().filter(function (exb) { return exb.enabled; });
                return session.setExceptionBreakpoints({ filters: enabledExceptionBps.map(function (exb) { return exb.filter; }) });
            };
            return this.sendToOneOrAllProcesses(targetProcess, sendExceptionBreakpointsToProcess);
        };
        DebugService.prototype.sendToOneOrAllProcesses = function (process, send) {
            if (process) {
                return send(process);
            }
            return winjs_base_1.TPromise.join(this.model.getProcesses().map(function (p) { return send(p); })).then(function () { return void 0; });
        };
        DebugService.prototype.onFileChanges = function (fileChangesEvent) {
            var _this = this;
            var toRemove = this.model.getBreakpoints().filter(function (bp) {
                return fileChangesEvent.contains(bp.uri, files_1.FileChangeType.DELETED);
            });
            if (toRemove.length) {
                this.model.removeBreakpoints(toRemove);
            }
            fileChangesEvent.getUpdated().forEach(function (event) {
                if (_this.breakpointsToSendOnResourceSaved.has(event.resource.toString())) {
                    _this.breakpointsToSendOnResourceSaved.delete(event.resource.toString());
                    _this.sendBreakpoints(event.resource, true).done(null, errors.onUnexpectedError);
                }
                if (event.resource.toString().indexOf('.vscode/launch.json') >= 0) {
                    _this.launchJsonChanged = true;
                }
            });
        };
        DebugService.prototype.store = function () {
            var breakpoints = this.model.getBreakpoints();
            if (breakpoints.length) {
                this.storageService.store(DEBUG_BREAKPOINTS_KEY, JSON.stringify(breakpoints), storage_1.StorageScope.WORKSPACE);
            }
            else {
                this.storageService.remove(DEBUG_BREAKPOINTS_KEY, storage_1.StorageScope.WORKSPACE);
            }
            if (!this.model.areBreakpointsActivated()) {
                this.storageService.store(DEBUG_BREAKPOINTS_ACTIVATED_KEY, 'false', storage_1.StorageScope.WORKSPACE);
            }
            else {
                this.storageService.remove(DEBUG_BREAKPOINTS_ACTIVATED_KEY, storage_1.StorageScope.WORKSPACE);
            }
            var functionBreakpoints = this.model.getFunctionBreakpoints();
            if (functionBreakpoints.length) {
                this.storageService.store(DEBUG_FUNCTION_BREAKPOINTS_KEY, JSON.stringify(functionBreakpoints), storage_1.StorageScope.WORKSPACE);
            }
            else {
                this.storageService.remove(DEBUG_FUNCTION_BREAKPOINTS_KEY, storage_1.StorageScope.WORKSPACE);
            }
            var exceptionBreakpoints = this.model.getExceptionBreakpoints();
            if (exceptionBreakpoints.length) {
                this.storageService.store(DEBUG_EXCEPTION_BREAKPOINTS_KEY, JSON.stringify(exceptionBreakpoints), storage_1.StorageScope.WORKSPACE);
            }
            else {
                this.storageService.remove(DEBUG_EXCEPTION_BREAKPOINTS_KEY, storage_1.StorageScope.WORKSPACE);
            }
            var watchExpressions = this.model.getWatchExpressions();
            if (watchExpressions.length) {
                this.storageService.store(DEBUG_WATCH_EXPRESSIONS_KEY, JSON.stringify(watchExpressions.map(function (we) { return ({ name: we.name, id: we.getId() }); })), storage_1.StorageScope.WORKSPACE);
            }
            else {
                this.storageService.remove(DEBUG_WATCH_EXPRESSIONS_KEY, storage_1.StorageScope.WORKSPACE);
            }
        };
        DebugService.prototype.dispose = function () {
            this.toDisposeOnSessionEnd.forEach(function (toDispose) { return lifecycle.dispose(toDispose); });
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        DebugService = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, textfiles_1.ITextFileService),
            __param(3, viewlet_1.IViewletService),
            __param(4, panelService_1.IPanelService),
            __param(5, message_1.IMessageService),
            __param(6, message_1.IChoiceService),
            __param(7, partService_1.IPartService),
            __param(8, windows_1.IWindowService),
            __param(9, broadcastService_1.IBroadcastService),
            __param(10, telemetry_1.ITelemetryService),
            __param(11, workspace_1.IWorkspaceContextService),
            __param(12, contextkey_1.IContextKeyService),
            __param(13, lifecycle_1.ILifecycleService),
            __param(14, instantiation_1.IInstantiationService),
            __param(15, extensions_1.IExtensionService),
            __param(16, markers_1.IMarkerService),
            __param(17, taskService_1.ITaskService),
            __param(18, files_1.IFileService),
            __param(19, configuration_1.IConfigurationService)
        ], DebugService);
        return DebugService;
    }());
    exports.DebugService = DebugService;
});
