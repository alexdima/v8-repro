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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/winjs.base", "vs/base/common/strings", "vs/workbench/parts/debug/common/debugModel", "vs/workbench/parts/debug/common/debug", "electron"], function (require, exports, nls, actions_1, winjs_base_1, strings_1, debugModel_1, debug_1, electron_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CopyValueAction = /** @class */ (function (_super) {
        __extends(CopyValueAction, _super);
        function CopyValueAction(id, label, value, debugService) {
            var _this = _super.call(this, id, label, 'debug-action copy-value') || this;
            _this.value = value;
            _this.debugService = debugService;
            return _this;
        }
        CopyValueAction.prototype.run = function () {
            var _this = this;
            if (this.value instanceof debugModel_1.Variable) {
                var frameId = this.debugService.getViewModel().focusedStackFrame.frameId;
                var process_1 = this.debugService.getViewModel().focusedProcess;
                return process_1.session.evaluate({ expression: this.value.evaluateName, frameId: frameId }).then(function (result) {
                    electron_1.clipboard.writeText(result.body.result);
                }, function (err) { return electron_1.clipboard.writeText(_this.value.value); });
            }
            electron_1.clipboard.writeText(this.value);
            return winjs_base_1.TPromise.as(null);
        };
        CopyValueAction.ID = 'workbench.debug.viewlet.action.copyValue';
        CopyValueAction.LABEL = nls.localize('copyValue', "Copy Value");
        CopyValueAction = __decorate([
            __param(3, debug_1.IDebugService)
        ], CopyValueAction);
        return CopyValueAction;
    }(actions_1.Action));
    exports.CopyValueAction = CopyValueAction;
    var CopyEvaluatePathAction = /** @class */ (function (_super) {
        __extends(CopyEvaluatePathAction, _super);
        function CopyEvaluatePathAction(id, label, value) {
            var _this = _super.call(this, id, label) || this;
            _this.value = value;
            return _this;
        }
        CopyEvaluatePathAction.prototype.run = function () {
            if (this.value instanceof debugModel_1.Variable) {
                electron_1.clipboard.writeText(this.value.evaluateName);
            }
            return winjs_base_1.TPromise.as(null);
        };
        CopyEvaluatePathAction.ID = 'workbench.debug.viewlet.action.copyEvaluatePath';
        CopyEvaluatePathAction.LABEL = nls.localize('copyPath', "Copy Path");
        return CopyEvaluatePathAction;
    }(actions_1.Action));
    exports.CopyEvaluatePathAction = CopyEvaluatePathAction;
    var CopyAction = /** @class */ (function (_super) {
        __extends(CopyAction, _super);
        function CopyAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CopyAction.prototype.run = function () {
            electron_1.clipboard.writeText(window.getSelection().toString());
            return winjs_base_1.TPromise.as(null);
        };
        CopyAction.ID = 'workbench.debug.action.copy';
        CopyAction.LABEL = nls.localize('copy', "Copy");
        return CopyAction;
    }(actions_1.Action));
    exports.CopyAction = CopyAction;
    var CopyAllAction = /** @class */ (function (_super) {
        __extends(CopyAllAction, _super);
        function CopyAllAction(id, label, tree) {
            var _this = _super.call(this, id, label) || this;
            _this.tree = tree;
            return _this;
        }
        CopyAllAction.prototype.run = function () {
            var text = '';
            var navigator = this.tree.getNavigator();
            // skip first navigator element - the root node
            while (navigator.next()) {
                if (text) {
                    text += "\n";
                }
                text += navigator.current().toString();
            }
            electron_1.clipboard.writeText(strings_1.removeAnsiEscapeCodes(text));
            return winjs_base_1.TPromise.as(null);
        };
        CopyAllAction.ID = 'workbench.debug.action.copyAll';
        CopyAllAction.LABEL = nls.localize('copyAll', "Copy All");
        return CopyAllAction;
    }(actions_1.Action));
    exports.CopyAllAction = CopyAllAction;
    var CopyStackTraceAction = /** @class */ (function (_super) {
        __extends(CopyStackTraceAction, _super);
        function CopyStackTraceAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CopyStackTraceAction.prototype.run = function (frame) {
            electron_1.clipboard.writeText(frame.thread.getCallStack().map(function (sf) { return sf.toString(); }).join('\n'));
            return winjs_base_1.TPromise.as(null);
        };
        CopyStackTraceAction.ID = 'workbench.action.debug.copyStackTrace';
        CopyStackTraceAction.LABEL = nls.localize('copyStackTrace', "Copy Call Stack");
        return CopyStackTraceAction;
    }(actions_1.Action));
    exports.CopyStackTraceAction = CopyStackTraceAction;
});
