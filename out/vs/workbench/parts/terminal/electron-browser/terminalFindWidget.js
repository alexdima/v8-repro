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
define(["require", "exports", "vs/editor/contrib/find/simpleFindWidget", "vs/platform/contextview/browser/contextView", "vs/workbench/parts/terminal/common/terminal", "vs/platform/contextkey/common/contextkey"], function (require, exports, simpleFindWidget_1, contextView_1, terminal_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TerminalFindWidget = /** @class */ (function (_super) {
        __extends(TerminalFindWidget, _super);
        function TerminalFindWidget(_contextViewService, _contextKeyService, _terminalService) {
            var _this = _super.call(this, _contextViewService) || this;
            _this._contextKeyService = _contextKeyService;
            _this._terminalService = _terminalService;
            _this._findInputFocused = terminal_1.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_INPUT_FOCUSED.bindTo(_this._contextKeyService);
            return _this;
        }
        TerminalFindWidget.prototype.find = function (previous) {
            var val = this.inputValue;
            var instance = this._terminalService.getActiveInstance();
            if (instance !== null) {
                if (previous) {
                    instance.findPrevious(val);
                }
                else {
                    instance.findNext(val);
                }
            }
        };
        TerminalFindWidget.prototype.hide = function () {
            _super.prototype.hide.call(this);
            this._terminalService.getActiveInstance().focus();
        };
        TerminalFindWidget.prototype.onInputChanged = function () {
            // Ignore input changes for now
        };
        TerminalFindWidget.prototype.onFocusTrackerFocus = function () {
            this._terminalService.getActiveInstance().notifyFindWidgetFocusChanged(true);
        };
        TerminalFindWidget.prototype.onFocusTrackerBlur = function () {
            this._terminalService.getActiveInstance().notifyFindWidgetFocusChanged(false);
        };
        TerminalFindWidget.prototype.onFindInputFocusTrackerFocus = function () {
            this._findInputFocused.set(true);
        };
        TerminalFindWidget.prototype.onFindInputFocusTrackerBlur = function () {
            this._findInputFocused.reset();
        };
        TerminalFindWidget = __decorate([
            __param(0, contextView_1.IContextViewService),
            __param(1, contextkey_1.IContextKeyService),
            __param(2, terminal_1.ITerminalService)
        ], TerminalFindWidget);
        return TerminalFindWidget;
    }(simpleFindWidget_1.SimpleFindWidget));
    exports.TerminalFindWidget = TerminalFindWidget;
});
