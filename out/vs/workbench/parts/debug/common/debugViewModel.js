/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/workbench/parts/debug/common/debug"], function (require, exports, event_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ViewModel = /** @class */ (function () {
        function ViewModel(contextKeyService) {
            this._onDidFocusProcess = new event_1.Emitter();
            this._onDidFocusStackFrame = new event_1.Emitter();
            this._onDidSelectExpression = new event_1.Emitter();
            this.multiProcessView = false;
            this.expressionSelectedContextKey = debug_1.CONTEXT_EXPRESSION_SELECTED.bindTo(contextKeyService);
        }
        ViewModel.prototype.getId = function () {
            return 'root';
        };
        Object.defineProperty(ViewModel.prototype, "focusedProcess", {
            get: function () {
                return this._focusedProcess;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewModel.prototype, "focusedThread", {
            get: function () {
                return this._focusedStackFrame ? this._focusedStackFrame.thread : (this._focusedProcess ? this._focusedProcess.getAllThreads().pop() : null);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewModel.prototype, "focusedStackFrame", {
            get: function () {
                return this._focusedStackFrame;
            },
            enumerable: true,
            configurable: true
        });
        ViewModel.prototype.setFocus = function (stackFrame, thread, process, explicit) {
            var shouldEmit = this._focusedProcess !== process || this._focusedThread !== thread || this._focusedStackFrame !== stackFrame;
            if (this._focusedProcess !== process) {
                this._focusedProcess = process;
                this._onDidFocusProcess.fire(process);
            }
            this._focusedThread = thread;
            this._focusedStackFrame = stackFrame;
            if (shouldEmit) {
                this._onDidFocusStackFrame.fire({ stackFrame: stackFrame, explicit: explicit });
            }
        };
        Object.defineProperty(ViewModel.prototype, "onDidFocusProcess", {
            get: function () {
                return this._onDidFocusProcess.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewModel.prototype, "onDidFocusStackFrame", {
            get: function () {
                return this._onDidFocusStackFrame.event;
            },
            enumerable: true,
            configurable: true
        });
        ViewModel.prototype.getSelectedExpression = function () {
            return this.selectedExpression;
        };
        ViewModel.prototype.setSelectedExpression = function (expression) {
            this.selectedExpression = expression;
            this.expressionSelectedContextKey.set(!!expression);
            this._onDidSelectExpression.fire(expression);
        };
        Object.defineProperty(ViewModel.prototype, "onDidSelectExpression", {
            get: function () {
                return this._onDidSelectExpression.event;
            },
            enumerable: true,
            configurable: true
        });
        ViewModel.prototype.getSelectedFunctionBreakpoint = function () {
            return this.selectedFunctionBreakpoint;
        };
        ViewModel.prototype.setSelectedFunctionBreakpoint = function (functionBreakpoint) {
            this.selectedFunctionBreakpoint = functionBreakpoint;
        };
        ViewModel.prototype.isMultiProcessView = function () {
            return this.multiProcessView;
        };
        ViewModel.prototype.setMultiProcessView = function (isMultiProcessView) {
            this.multiProcessView = isMultiProcessView;
        };
        return ViewModel;
    }());
    exports.ViewModel = ViewModel;
});
