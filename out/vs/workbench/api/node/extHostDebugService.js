define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/event", "vs/base/common/async", "vs/workbench/api/node/extHost.protocol", "vs/base/common/uri", "vs/workbench/api/node/extHostTypes", "vs/base/common/uuid"], function (require, exports, winjs_base_1, event_1, async_1, extHost_protocol_1, uri_1, extHostTypes_1, uuid_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostDebugService = /** @class */ (function () {
        function ExtHostDebugService(mainContext, workspace) {
            var _this = this;
            this._debugSessions = new Map();
            this._workspace = workspace;
            this._handleCounter = 0;
            this._handlers = new Map();
            this._onDidStartDebugSession = new event_1.Emitter();
            this._onDidTerminateDebugSession = new event_1.Emitter();
            this._onDidChangeActiveDebugSession = new event_1.Emitter();
            this._onDidReceiveDebugSessionCustomEvent = new event_1.Emitter();
            this._debugServiceProxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadDebugService);
            this._onDidChangeBreakpoints = new event_1.Emitter({
                onFirstListenerAdd: function () {
                    _this.startBreakpoints();
                }
            });
            this._activeDebugConsole = new ExtHostDebugConsole(this._debugServiceProxy);
            this._breakpoints = new Map();
            this._breakpointEventsActive = false;
        }
        Object.defineProperty(ExtHostDebugService.prototype, "onDidStartDebugSession", {
            get: function () { return this._onDidStartDebugSession.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostDebugService.prototype, "onDidTerminateDebugSession", {
            get: function () { return this._onDidTerminateDebugSession.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostDebugService.prototype, "onDidChangeActiveDebugSession", {
            get: function () { return this._onDidChangeActiveDebugSession.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostDebugService.prototype, "activeDebugSession", {
            get: function () { return this._activeDebugSession; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostDebugService.prototype, "onDidReceiveDebugSessionCustomEvent", {
            get: function () { return this._onDidReceiveDebugSessionCustomEvent.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostDebugService.prototype, "activeDebugConsole", {
            get: function () { return this._activeDebugConsole; },
            enumerable: true,
            configurable: true
        });
        ExtHostDebugService.prototype.startBreakpoints = function () {
            if (!this._breakpointEventsActive) {
                this._breakpointEventsActive = true;
                this._debugServiceProxy.$startBreakpointEvents();
            }
        };
        Object.defineProperty(ExtHostDebugService.prototype, "onDidChangeBreakpoints", {
            get: function () {
                return this._onDidChangeBreakpoints.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostDebugService.prototype, "breakpoints", {
            get: function () {
                this.startBreakpoints();
                var result = [];
                this._breakpoints.forEach(function (bp) { return result.push(bp); });
                return result;
            },
            enumerable: true,
            configurable: true
        });
        ExtHostDebugService.prototype.$acceptBreakpointsDelta = function (delta) {
            var a = [];
            var r = [];
            var c = [];
            if (delta.added) {
                for (var _i = 0, _a = delta.added; _i < _a.length; _i++) {
                    var bpd = _a[_i];
                    if (!this._breakpoints.has(bpd.id)) {
                        var bp = void 0;
                        if (bpd.type === 'function') {
                            bp = new extHostTypes_1.FunctionBreakpoint(bpd.functionName, bpd.enabled, bpd.condition, bpd.hitCondition);
                        }
                        else {
                            var uri = uri_1.default.revive(bpd.uri);
                            bp = new extHostTypes_1.SourceBreakpoint(new extHostTypes_1.Location(uri, new extHostTypes_1.Position(bpd.line, bpd.character)), bpd.enabled, bpd.condition, bpd.hitCondition);
                        }
                        bp['_id'] = bpd.id;
                        this._breakpoints.set(bpd.id, bp);
                        a.push(bp);
                    }
                }
            }
            if (delta.removed) {
                for (var _b = 0, _c = delta.removed; _b < _c.length; _b++) {
                    var id = _c[_b];
                    var bp = this._breakpoints.get(id);
                    if (bp) {
                        this._breakpoints.delete(id);
                        r.push(bp);
                    }
                }
            }
            if (delta.changed) {
                for (var _d = 0, _e = delta.changed; _d < _e.length; _d++) {
                    var bpd = _e[_d];
                    var bp = this._breakpoints.get(bpd.id);
                    if (bp) {
                        if (bpd.type === 'function') {
                            var fbp = bp;
                            fbp.enabled = bpd.enabled;
                            fbp.condition = bpd.condition;
                            fbp.hitCondition = bpd.hitCondition;
                            fbp.functionName = bpd.functionName;
                        }
                        else {
                            var sbp = bp;
                            sbp.enabled = bpd.enabled;
                            sbp.condition = bpd.condition;
                            sbp.hitCondition = bpd.hitCondition;
                        }
                        c.push(bp);
                    }
                }
            }
            this.fireBreakpointChanges(a, r, c);
        };
        ExtHostDebugService.prototype.addBreakpoints = function (breakpoints0) {
            this.startBreakpoints();
            // assign uuids for brand new breakpoints
            var breakpoints = [];
            for (var _i = 0, breakpoints0_1 = breakpoints0; _i < breakpoints0_1.length; _i++) {
                var bp = breakpoints0_1[_i];
                var id = bp['_id'];
                if (id) {
                    if (this._breakpoints.has(id)) {
                        // already there
                    }
                    else {
                        breakpoints.push(bp);
                    }
                }
                else {
                    id = uuid_1.generateUuid();
                    bp['_id'] = id;
                    this._breakpoints.set(id, bp);
                    breakpoints.push(bp);
                }
            }
            // send notification for added breakpoints
            this.fireBreakpointChanges(breakpoints, [], []);
            // convert added breakpoints to DTOs
            var dtos = [];
            var map = new Map();
            for (var _a = 0, breakpoints_1 = breakpoints; _a < breakpoints_1.length; _a++) {
                var bp = breakpoints_1[_a];
                if (bp instanceof extHostTypes_1.SourceBreakpoint) {
                    var dto = map.get(bp.location.uri.toString());
                    if (!dto) {
                        dto = {
                            type: 'sourceMulti',
                            uri: bp.location.uri,
                            lines: []
                        };
                        map.set(bp.location.uri.toString(), dto);
                        dtos.push(dto);
                    }
                    dto.lines.push({
                        id: bp['_id'],
                        enabled: bp.enabled,
                        condition: bp.condition,
                        hitCondition: bp.hitCondition,
                        line: bp.location.range.start.line,
                        character: bp.location.range.start.character
                    });
                }
                else if (bp instanceof extHostTypes_1.FunctionBreakpoint) {
                    dtos.push({
                        type: 'function',
                        id: bp['_id'],
                        enabled: bp.enabled,
                        functionName: bp.functionName,
                        hitCondition: bp.hitCondition,
                        condition: bp.condition
                    });
                }
            }
            // send DTOs to VS Code
            return this._debugServiceProxy.$registerBreakpoints(dtos);
        };
        ExtHostDebugService.prototype.removeBreakpoints = function (breakpoints0) {
            this.startBreakpoints();
            // remove from array
            var breakpoints = [];
            for (var _i = 0, breakpoints0_2 = breakpoints0; _i < breakpoints0_2.length; _i++) {
                var b = breakpoints0_2[_i];
                var id = b['_id'];
                if (id && this._breakpoints.delete(id)) {
                    breakpoints.push(b);
                }
            }
            // send notification
            this.fireBreakpointChanges([], breakpoints, []);
            // unregister with VS Code
            var ids = breakpoints.filter(function (bp) { return bp instanceof extHostTypes_1.SourceBreakpoint; }).map(function (bp) { return bp['_id']; });
            var fids = breakpoints.filter(function (bp) { return bp instanceof extHostTypes_1.FunctionBreakpoint; }).map(function (bp) { return bp['_id']; });
            return this._debugServiceProxy.$unregisterBreakpoints(ids, fids);
        };
        ExtHostDebugService.prototype.fireBreakpointChanges = function (added, removed, changed) {
            if (added.length > 0 || removed.length > 0 || changed.length > 0) {
                this._onDidChangeBreakpoints.fire(Object.freeze({
                    added: Object.freeze(added),
                    removed: Object.freeze(removed),
                    changed: Object.freeze(changed)
                }));
            }
        };
        ExtHostDebugService.prototype.registerDebugConfigurationProvider = function (type, provider) {
            var _this = this;
            if (!provider) {
                return new extHostTypes_1.Disposable(function () { });
            }
            var handle = this.nextHandle();
            this._handlers.set(handle, provider);
            this._debugServiceProxy.$registerDebugConfigurationProvider(type, !!provider.provideDebugConfigurations, !!provider.resolveDebugConfiguration, !!provider.debugAdapterExecutable, handle);
            return new extHostTypes_1.Disposable(function () {
                _this._handlers.delete(handle);
                _this._debugServiceProxy.$unregisterDebugConfigurationProvider(handle);
            });
        };
        ExtHostDebugService.prototype.$provideDebugConfigurations = function (handle, folderUri) {
            var _this = this;
            var handler = this._handlers.get(handle);
            if (!handler) {
                return winjs_base_1.TPromise.wrapError(new Error('no handler found'));
            }
            if (!handler.provideDebugConfigurations) {
                return winjs_base_1.TPromise.wrapError(new Error('handler has no method provideDebugConfigurations'));
            }
            return async_1.asWinJsPromise(function (token) { return handler.provideDebugConfigurations(_this.getFolder(folderUri), token); });
        };
        ExtHostDebugService.prototype.$resolveDebugConfiguration = function (handle, folderUri, debugConfiguration) {
            var _this = this;
            var handler = this._handlers.get(handle);
            if (!handler) {
                return winjs_base_1.TPromise.wrapError(new Error('no handler found'));
            }
            if (!handler.resolveDebugConfiguration) {
                return winjs_base_1.TPromise.wrapError(new Error('handler has no method resolveDebugConfiguration'));
            }
            return async_1.asWinJsPromise(function (token) { return handler.resolveDebugConfiguration(_this.getFolder(folderUri), debugConfiguration, token); });
        };
        ExtHostDebugService.prototype.$debugAdapterExecutable = function (handle, folderUri) {
            var _this = this;
            var handler = this._handlers.get(handle);
            if (!handler) {
                return winjs_base_1.TPromise.wrapError(new Error('no handler found'));
            }
            if (!handler.debugAdapterExecutable) {
                return winjs_base_1.TPromise.wrapError(new Error('handler has no method debugAdapterExecutable'));
            }
            return async_1.asWinJsPromise(function (token) { return handler.debugAdapterExecutable(_this.getFolder(folderUri), token); });
        };
        ExtHostDebugService.prototype.startDebugging = function (folder, nameOrConfig) {
            return this._debugServiceProxy.$startDebugging(folder ? folder.uri : undefined, nameOrConfig);
        };
        ExtHostDebugService.prototype.$acceptDebugSessionStarted = function (id, type, name) {
            var debugSession = this._debugSessions.get(id);
            if (!debugSession) {
                debugSession = new ExtHostDebugSession(this._debugServiceProxy, id, type, name);
                this._debugSessions.set(id, debugSession);
            }
            this._onDidStartDebugSession.fire(debugSession);
        };
        ExtHostDebugService.prototype.$acceptDebugSessionTerminated = function (id, type, name) {
            var debugSession = this._debugSessions.get(id);
            if (!debugSession) {
                debugSession = new ExtHostDebugSession(this._debugServiceProxy, id, type, name);
                this._debugSessions.set(id, debugSession);
            }
            this._onDidTerminateDebugSession.fire(debugSession);
            this._debugSessions.delete(id);
        };
        ExtHostDebugService.prototype.$acceptDebugSessionActiveChanged = function (id, type, name) {
            if (id) {
                this._activeDebugSession = this._debugSessions.get(id);
                if (!this._activeDebugSession) {
                    this._activeDebugSession = new ExtHostDebugSession(this._debugServiceProxy, id, type, name);
                    this._debugSessions.set(id, this._activeDebugSession);
                }
            }
            else {
                this._activeDebugSession = undefined;
            }
            this._onDidChangeActiveDebugSession.fire(this._activeDebugSession);
        };
        ExtHostDebugService.prototype.$acceptDebugSessionCustomEvent = function (id, type, name, event) {
            var debugSession = this._debugSessions.get(id);
            if (!debugSession) {
                debugSession = new ExtHostDebugSession(this._debugServiceProxy, id, type, name);
                this._debugSessions.set(id, debugSession);
            }
            var ee = {
                session: debugSession,
                event: event.event,
                body: event.body
            };
            this._onDidReceiveDebugSessionCustomEvent.fire(ee);
        };
        ExtHostDebugService.prototype.getFolder = function (_folderUri) {
            if (_folderUri) {
                var folderUriString_1 = uri_1.default.revive(_folderUri).toString();
                var folders = this._workspace.getWorkspaceFolders();
                var found = folders.filter(function (f) { return f.uri.toString() === folderUriString_1; });
                if (found && found.length > 0) {
                    return found[0];
                }
            }
            return undefined;
        };
        ExtHostDebugService.prototype.nextHandle = function () {
            return this._handleCounter++;
        };
        return ExtHostDebugService;
    }());
    exports.ExtHostDebugService = ExtHostDebugService;
    var ExtHostDebugSession = /** @class */ (function () {
        function ExtHostDebugSession(proxy, id, type, name) {
            this._debugServiceProxy = proxy;
            this._id = id;
            this._type = type;
            this._name = name;
        }
        Object.defineProperty(ExtHostDebugSession.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostDebugSession.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostDebugSession.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        ExtHostDebugSession.prototype.customRequest = function (command, args) {
            return this._debugServiceProxy.$customDebugAdapterRequest(this._id, command, args);
        };
        return ExtHostDebugSession;
    }());
    exports.ExtHostDebugSession = ExtHostDebugSession;
    var ExtHostDebugConsole = /** @class */ (function () {
        function ExtHostDebugConsole(proxy) {
            this._debugServiceProxy = proxy;
        }
        ExtHostDebugConsole.prototype.append = function (value) {
            this._debugServiceProxy.$appendDebugConsole(value);
        };
        ExtHostDebugConsole.prototype.appendLine = function (value) {
            this.append(value + '\n');
        };
        return ExtHostDebugConsole;
    }());
    exports.ExtHostDebugConsole = ExtHostDebugConsole;
});
