var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/parts/debug/common/debug", "vs/base/common/winjs.base", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers", "vs/base/common/severity"], function (require, exports, lifecycle_1, uri_1, debug_1, winjs_base_1, extHost_protocol_1, extHostCustomers_1, severity_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadDebugService = /** @class */ (function () {
        function MainThreadDebugService(extHostContext, debugService) {
            var _this = this;
            this.debugService = debugService;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDebugService);
            this._toDispose = [];
            this._toDispose.push(debugService.onDidNewProcess(function (proc) { return _this._proxy.$acceptDebugSessionStarted(proc.getId(), proc.configuration.type, proc.getName(false)); }));
            this._toDispose.push(debugService.onDidEndProcess(function (proc) { return _this._proxy.$acceptDebugSessionTerminated(proc.getId(), proc.configuration.type, proc.getName(false)); }));
            this._toDispose.push(debugService.getViewModel().onDidFocusProcess(function (proc) {
                if (proc) {
                    _this._proxy.$acceptDebugSessionActiveChanged(proc.getId(), proc.configuration.type, proc.getName(false));
                }
                else {
                    _this._proxy.$acceptDebugSessionActiveChanged(undefined);
                }
            }));
            this._toDispose.push(debugService.onDidCustomEvent(function (event) {
                if (event && event.sessionId) {
                    var process_1 = _this.debugService.getModel().getProcesses().filter(function (p) { return p.getId() === event.sessionId; }).pop();
                    if (process_1) {
                        _this._proxy.$acceptDebugSessionCustomEvent(event.sessionId, process_1.configuration.type, process_1.configuration.name, event);
                    }
                }
            }));
        }
        MainThreadDebugService.prototype.dispose = function () {
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        MainThreadDebugService.prototype.$startBreakpointEvents = function () {
            var _this = this;
            if (!this._breakpointEventsActive) {
                this._breakpointEventsActive = true;
                // set up a handler to send more
                this._toDispose.push(this.debugService.getModel().onDidChangeBreakpoints(function (e) {
                    if (e) {
                        var delta = {};
                        if (e.added) {
                            delta.added = _this.convertToDto(e.added);
                        }
                        if (e.removed) {
                            delta.removed = e.removed.map(function (x) { return x.getId(); });
                        }
                        if (e.changed) {
                            delta.changed = _this.convertToDto(e.changed);
                        }
                        if (delta.added || delta.removed || delta.changed) {
                            _this._proxy.$acceptBreakpointsDelta(delta);
                        }
                    }
                }));
                // send all breakpoints
                var bps = this.debugService.getModel().getBreakpoints();
                var fbps = this.debugService.getModel().getFunctionBreakpoints();
                if (bps.length > 0 || fbps.length > 0) {
                    this._proxy.$acceptBreakpointsDelta({
                        added: this.convertToDto(bps).concat(this.convertToDto(fbps))
                    });
                }
            }
            return winjs_base_1.TPromise.wrap(undefined);
        };
        MainThreadDebugService.prototype.$registerBreakpoints = function (DTOs) {
            for (var _i = 0, DTOs_1 = DTOs; _i < DTOs_1.length; _i++) {
                var dto = DTOs_1[_i];
                if (dto.type === 'sourceMulti') {
                    var rawbps = dto.lines.map(function (l) {
                        return ({
                            id: l.id,
                            enabled: l.enabled,
                            lineNumber: l.line + 1,
                            column: l.character > 0 ? l.character + 1 : 0,
                            condition: l.condition,
                            hitCondition: l.hitCondition
                        });
                    });
                    this.debugService.addBreakpoints(uri_1.default.revive(dto.uri), rawbps);
                }
                else if (dto.type === 'function') {
                    this.debugService.addFunctionBreakpoint(dto.functionName, dto.id);
                }
            }
            return void 0;
        };
        MainThreadDebugService.prototype.$unregisterBreakpoints = function (breakpointIds, functionBreakpointIds) {
            var _this = this;
            breakpointIds.forEach(function (id) { return _this.debugService.removeBreakpoints(id); });
            functionBreakpointIds.forEach(function (id) { return _this.debugService.removeFunctionBreakpoints(id); });
            return void 0;
        };
        MainThreadDebugService.prototype.convertToDto = function (bps) {
            return bps.map(function (bp) {
                if ('name' in bp) {
                    var fbp = bp;
                    return {
                        type: 'function',
                        id: fbp.getId(),
                        enabled: fbp.enabled,
                        functionName: fbp.name,
                        hitCondition: fbp.hitCondition,
                    };
                }
                else {
                    var sbp = bp;
                    return {
                        type: 'source',
                        id: sbp.getId(),
                        enabled: sbp.enabled,
                        condition: sbp.condition,
                        hitCondition: sbp.hitCondition,
                        uri: sbp.uri,
                        line: sbp.lineNumber > 0 ? sbp.lineNumber - 1 : 0,
                        character: (typeof sbp.column === 'number' && sbp.column > 0) ? sbp.column - 1 : 0,
                    };
                }
            });
        };
        MainThreadDebugService.prototype.$registerDebugConfigurationProvider = function (debugType, hasProvide, hasResolve, hasDebugAdapterExecutable, handle) {
            var _this = this;
            var provider = {
                type: debugType
            };
            if (hasProvide) {
                provider.provideDebugConfigurations = function (folder) {
                    return _this._proxy.$provideDebugConfigurations(handle, folder);
                };
            }
            if (hasResolve) {
                provider.resolveDebugConfiguration = function (folder, debugConfiguration) {
                    return _this._proxy.$resolveDebugConfiguration(handle, folder, debugConfiguration);
                };
            }
            if (hasDebugAdapterExecutable) {
                provider.debugAdapterExecutable = function (folder) {
                    return _this._proxy.$debugAdapterExecutable(handle, folder);
                };
            }
            this.debugService.getConfigurationManager().registerDebugConfigurationProvider(handle, provider);
            return winjs_base_1.TPromise.wrap(undefined);
        };
        MainThreadDebugService.prototype.$unregisterDebugConfigurationProvider = function (handle) {
            this.debugService.getConfigurationManager().unregisterDebugConfigurationProvider(handle);
            return winjs_base_1.TPromise.wrap(undefined);
        };
        MainThreadDebugService.prototype.$startDebugging = function (_folderUri, nameOrConfiguration) {
            var folderUri = _folderUri ? uri_1.default.revive(_folderUri) : undefined;
            var launch = this.debugService.getConfigurationManager().getLaunch(folderUri);
            return this.debugService.startDebugging(launch, nameOrConfiguration).then(function (x) {
                return true;
            }, function (err) {
                return winjs_base_1.TPromise.wrapError(err && err.message ? err.message : 'cannot start debugging');
            });
        };
        MainThreadDebugService.prototype.$customDebugAdapterRequest = function (sessionId, request, args) {
            var process = this.debugService.getModel().getProcesses().filter(function (p) { return p.getId() === sessionId; }).pop();
            if (process) {
                return process.session.custom(request, args).then(function (response) {
                    if (response && response.success) {
                        return response.body;
                    }
                    else {
                        return winjs_base_1.TPromise.wrapError(new Error(response ? response.message : 'custom request failed'));
                    }
                });
            }
            return winjs_base_1.TPromise.wrapError(new Error('debug session not found'));
        };
        MainThreadDebugService.prototype.$appendDebugConsole = function (value) {
            // Use warning as severity to get the orange color for messages coming from the debug extension
            this.debugService.logToRepl(value, severity_1.default.Warning);
            return winjs_base_1.TPromise.wrap(undefined);
        };
        MainThreadDebugService = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadDebugService),
            __param(1, debug_1.IDebugService)
        ], MainThreadDebugService);
        return MainThreadDebugService;
    }());
    exports.MainThreadDebugService = MainThreadDebugService;
});
