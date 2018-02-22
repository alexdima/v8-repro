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
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/platform", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/browser/ui/inputbox/inputBox", "vs/editor/contrib/zoneWidget/zoneWidget", "vs/platform/contextview/browser/contextView", "vs/workbench/parts/debug/common/debug", "vs/base/common/functional", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/css!../browser/media/breakpointWidget"], function (require, exports, nls, errors, platform_1, selectBox_1, lifecycle, dom, inputBox_1, zoneWidget_1, contextView_1, debug_1, functional_1, styler_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var EXPRESSION_PLACEHOLDER = nls.localize('breakpointWidgetExpressionPlaceholder', "Break when expression evaluates to true. 'Enter' to accept, 'esc' to cancel.");
    var EXPRESSION_ARIA_LABEL = nls.localize('breakpointWidgetAriaLabel', "The program will only stop here if this condition is true. Press Enter to accept or Escape to cancel.");
    var HIT_COUNT_PLACEHOLDER = nls.localize('breakpointWidgetHitCountPlaceholder', "Break when hit count condition is met. 'Enter' to accept, 'esc' to cancel.");
    var HIT_COUNT_ARIA_LABEL = nls.localize('breakpointWidgetHitCountAriaLabel', "The program will only stop here if the hit count is met. Press Enter to accept or Escape to cancel.");
    var BreakpointWidget = /** @class */ (function (_super) {
        __extends(BreakpointWidget, _super);
        function BreakpointWidget(editor, lineNumber, column, contextViewService, debugService, themeService) {
            var _this = _super.call(this, editor, { showFrame: true, showArrow: false, frameWidth: 1 }) || this;
            _this.lineNumber = lineNumber;
            _this.column = column;
            _this.contextViewService = contextViewService;
            _this.debugService = debugService;
            _this.themeService = themeService;
            _this.toDispose = [];
            _this.hitCountInput = '';
            _this.conditionInput = '';
            _this.create();
            return _this;
        }
        Object.defineProperty(BreakpointWidget.prototype, "placeholder", {
            get: function () {
                return this.hitCountContext ? HIT_COUNT_PLACEHOLDER : EXPRESSION_PLACEHOLDER;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BreakpointWidget.prototype, "ariaLabel", {
            get: function () {
                return this.hitCountContext ? HIT_COUNT_ARIA_LABEL : EXPRESSION_ARIA_LABEL;
            },
            enumerable: true,
            configurable: true
        });
        BreakpointWidget.prototype.getInputBoxValue = function (breakpoint) {
            if (this.hitCountContext) {
                return breakpoint && breakpoint.hitCondition ? breakpoint.hitCondition : this.hitCountInput;
            }
            return breakpoint && breakpoint.condition ? breakpoint.condition : this.conditionInput;
        };
        BreakpointWidget.prototype._fillContainer = function (container) {
            var _this = this;
            this.setCssClass('breakpoint-widget');
            var uri = this.editor.getModel().uri;
            var breakpoint = this.debugService.getModel().getBreakpoints().filter(function (bp) { return bp.lineNumber === _this.lineNumber && bp.column === _this.column && bp.uri.toString() === uri.toString(); }).pop();
            this.hitCountContext = breakpoint && breakpoint.hitCondition && !breakpoint.condition;
            var selected = this.hitCountContext ? 1 : 0;
            var selectBox = new selectBox_1.SelectBox([nls.localize('expression', "Expression"), nls.localize('hitCount', "Hit Count")], selected, this.contextViewService);
            this.toDispose.push(styler_1.attachSelectBoxStyler(selectBox, this.themeService));
            selectBox.render(dom.append(container, $('.breakpoint-select-container')));
            selectBox.onDidSelect(function (e) {
                _this.hitCountContext = e.selected === 'Hit Count';
                if (_this.hitCountContext) {
                    _this.conditionInput = _this.inputBox.value;
                }
                else {
                    _this.hitCountInput = _this.inputBox.value;
                }
                _this.inputBox.setAriaLabel(_this.ariaLabel);
                _this.inputBox.setPlaceHolder(_this.placeholder);
                _this.inputBox.value = _this.getInputBoxValue(breakpoint);
            });
            var inputBoxContainer = dom.append(container, $('.inputBoxContainer'));
            this.inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, {
                placeholder: this.placeholder,
                ariaLabel: this.ariaLabel
            });
            this.toDispose.push(styler_1.attachInputBoxStyler(this.inputBox, this.themeService));
            this.toDispose.push(this.inputBox);
            dom.addClass(this.inputBox.inputElement, platform_1.isWindows ? 'windows' : platform_1.isMacintosh ? 'mac' : 'linux');
            this.inputBox.value = this.getInputBoxValue(breakpoint);
            // Due to an electron bug we have to do the timeout, otherwise we do not get focus
            setTimeout(function () { return _this.inputBox.focus(); }, 0);
            var disposed = false;
            var wrapUp = functional_1.once(function (success) {
                if (!disposed) {
                    disposed = true;
                    if (success) {
                        // if there is already a breakpoint on this location - remove it.
                        var oldBreakpoint = _this.debugService.getModel().getBreakpoints()
                            .filter(function (bp) { return bp.lineNumber === _this.lineNumber && bp.column === _this.column && bp.uri.toString() === uri.toString(); }).pop();
                        var condition = oldBreakpoint && oldBreakpoint.condition;
                        var hitCondition = oldBreakpoint && oldBreakpoint.hitCondition;
                        if (_this.hitCountContext) {
                            hitCondition = _this.inputBox.value;
                            if (_this.conditionInput) {
                                condition = _this.conditionInput;
                            }
                        }
                        else {
                            condition = _this.inputBox.value;
                            if (_this.hitCountInput) {
                                hitCondition = _this.hitCountInput;
                            }
                        }
                        if (oldBreakpoint) {
                            _this.debugService.updateBreakpoints(oldBreakpoint.uri, (_a = {},
                                _a[oldBreakpoint.getId()] = {
                                    condition: condition,
                                    hitCondition: hitCondition,
                                    verified: oldBreakpoint.verified
                                },
                                _a), false);
                        }
                        else {
                            _this.debugService.addBreakpoints(uri, [{
                                    lineNumber: _this.lineNumber,
                                    column: oldBreakpoint ? oldBreakpoint.column : undefined,
                                    enabled: true,
                                    condition: condition,
                                    hitCondition: hitCondition
                                }]).done(null, errors.onUnexpectedError);
                        }
                    }
                    _this.dispose();
                }
                var _a;
            });
            this.toDispose.push(dom.addStandardDisposableListener(this.inputBox.inputElement, 'keydown', function (e) {
                var isEscape = e.equals(9 /* Escape */);
                var isEnter = e.equals(3 /* Enter */);
                if (isEscape || isEnter) {
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
        };
        BreakpointWidget.prototype.dispose = function () {
            var _this = this;
            _super.prototype.dispose.call(this);
            lifecycle.dispose(this.toDispose);
            setTimeout(function () { return _this.editor.focus(); }, 0);
        };
        BreakpointWidget = __decorate([
            __param(3, contextView_1.IContextViewService),
            __param(4, debug_1.IDebugService),
            __param(5, themeService_1.IThemeService)
        ], BreakpointWidget);
        return BreakpointWidget;
    }(zoneWidget_1.ZoneWidget));
    exports.BreakpointWidget = BreakpointWidget;
});
