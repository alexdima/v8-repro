/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/winjs.base"], function (require, exports, event_1, winjs_base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MockDebugService = /** @class */ (function () {
        function MockDebugService() {
        }
        Object.defineProperty(MockDebugService.prototype, "state", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockDebugService.prototype, "onDidCustomEvent", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockDebugService.prototype, "onDidNewProcess", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockDebugService.prototype, "onDidEndProcess", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockDebugService.prototype, "onDidChangeState", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        MockDebugService.prototype.getConfigurationManager = function () {
            return null;
        };
        MockDebugService.prototype.focusStackFrame = function (focusedStackFrame) {
        };
        MockDebugService.prototype.addBreakpoints = function (uri, rawBreakpoints) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.updateBreakpoints = function (uri, data, sendOnResourceSaved) { };
        MockDebugService.prototype.enableOrDisableBreakpoints = function (enabled) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.setBreakpointsActivated = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.removeBreakpoints = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.addFunctionBreakpoint = function () { };
        MockDebugService.prototype.moveWatchExpression = function (id, position) { };
        MockDebugService.prototype.renameFunctionBreakpoint = function (id, newFunctionName) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.removeFunctionBreakpoints = function (id) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.addReplExpression = function (name) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.removeReplExpressions = function () { };
        MockDebugService.prototype.addWatchExpression = function (name) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.renameWatchExpression = function (id, newName) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.removeWatchExpressions = function (id) { };
        MockDebugService.prototype.startDebugging = function (launch, configOrName, noDebug) {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.restartProcess = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.stopProcess = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockDebugService.prototype.getModel = function () {
            return null;
        };
        MockDebugService.prototype.getViewModel = function () {
            return null;
        };
        MockDebugService.prototype.logToRepl = function (value) { };
        MockDebugService.prototype.sourceIsNotAvailable = function (uri) { };
        return MockDebugService;
    }());
    exports.MockDebugService = MockDebugService;
    var MockSession = /** @class */ (function () {
        function MockSession() {
            this.readyForBreakpoints = true;
            this.emittedStopped = true;
            this.onDidStop = null;
        }
        MockSession.prototype.getId = function () {
            return 'mockrawsession';
        };
        MockSession.prototype.getLengthInSeconds = function () {
            return 100;
        };
        MockSession.prototype.stackTrace = function (args) {
            return winjs_base_1.TPromise.as({
                seq: 1,
                type: 'response',
                request_seq: 1,
                success: true,
                command: 'stackTrace',
                body: {
                    stackFrames: [{
                            id: 1,
                            name: 'mock',
                            line: 5,
                            column: 6
                        }]
                }
            });
        };
        MockSession.prototype.exceptionInfo = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.attach = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.scopes = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.variables = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.evaluate = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        Object.defineProperty(MockSession.prototype, "capabilities", {
            get: function () {
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockSession.prototype, "onDidEvent", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockSession.prototype, "onDidInitialize", {
            get: function () {
                var emitter = new event_1.Emitter();
                return emitter.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MockSession.prototype, "onDidExitAdapter", {
            get: function () {
                var emitter = new event_1.Emitter();
                return emitter.event;
            },
            enumerable: true,
            configurable: true
        });
        MockSession.prototype.custom = function (request, args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.disconnect = function (restart, force) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.threads = function () {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.stepIn = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.stepOut = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.stepBack = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.continue = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.reverseContinue = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.pause = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.setVariable = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.restartFrame = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.completions = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.next = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.source = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.setBreakpoints = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.setFunctionBreakpoints = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        MockSession.prototype.setExceptionBreakpoints = function (args) {
            return winjs_base_1.TPromise.as(null);
        };
        return MockSession;
    }());
    exports.MockSession = MockSession;
});
