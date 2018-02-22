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
define(["require", "exports", "vs/nls", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/base/common/history", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInput", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "./findWidget", "vs/css!./simpleFindWidget"], function (require, exports, nls, widget_1, async_1, history_1, dom, findInput_1, contextView_1, themeService_1, colorRegistry_1, findWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NLS_FIND_INPUT_LABEL = nls.localize('label.find', "Find");
    var NLS_FIND_INPUT_PLACEHOLDER = nls.localize('placeholder.find', "Find");
    var NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize('label.previousMatchButton', "Previous match");
    var NLS_NEXT_MATCH_BTN_LABEL = nls.localize('label.nextMatchButton', "Next match");
    var NLS_CLOSE_BTN_LABEL = nls.localize('label.closeButton', "Close");
    var SimpleFindWidget = /** @class */ (function (_super) {
        __extends(SimpleFindWidget, _super);
        function SimpleFindWidget(_contextViewService, animate) {
            if (animate === void 0) { animate = true; }
            var _this = _super.call(this) || this;
            _this._contextViewService = _contextViewService;
            _this.animate = animate;
            _this._findInput = _this._register(new findInput_1.FindInput(null, _this._contextViewService, {
                label: NLS_FIND_INPUT_LABEL,
                placeholder: NLS_FIND_INPUT_PLACEHOLDER,
            }));
            // Find History with update delayer
            _this._findHistory = new history_1.HistoryNavigator();
            _this._updateHistoryDelayer = new async_1.Delayer(500);
            _this.oninput(_this._findInput.domNode, function (e) {
                _this.onInputChanged();
                _this._delayedUpdateHistory();
            });
            _this._register(_this._findInput.onKeyDown(function (e) {
                if (e.equals(3 /* Enter */)) {
                    _this.find(false);
                    e.preventDefault();
                    return;
                }
                if (e.equals(1024 /* Shift */ | 3 /* Enter */)) {
                    _this.find(true);
                    e.preventDefault();
                    return;
                }
            }));
            var prevBtn = new findWidget_1.SimpleButton({
                label: NLS_PREVIOUS_MATCH_BTN_LABEL,
                className: 'previous',
                onTrigger: function () {
                    _this.find(true);
                },
                onKeyDown: function (e) { }
            });
            var nextBtn = new findWidget_1.SimpleButton({
                label: NLS_NEXT_MATCH_BTN_LABEL,
                className: 'next',
                onTrigger: function () {
                    _this.find(false);
                },
                onKeyDown: function (e) { }
            });
            var closeBtn = new findWidget_1.SimpleButton({
                label: NLS_CLOSE_BTN_LABEL,
                className: 'close-fw',
                onTrigger: function () {
                    _this.hide();
                },
                onKeyDown: function (e) { }
            });
            _this._innerDomNode = document.createElement('div');
            _this._innerDomNode.classList.add('simple-find-part');
            _this._innerDomNode.appendChild(_this._findInput.domNode);
            _this._innerDomNode.appendChild(prevBtn.domNode);
            _this._innerDomNode.appendChild(nextBtn.domNode);
            _this._innerDomNode.appendChild(closeBtn.domNode);
            // _domNode wraps _innerDomNode, ensuring that
            _this._domNode = document.createElement('div');
            _this._domNode.classList.add('simple-find-part-wrapper');
            _this._domNode.appendChild(_this._innerDomNode);
            _this.onkeyup(_this._innerDomNode, function (e) {
                if (e.equals(9 /* Escape */)) {
                    _this.hide();
                    e.preventDefault();
                    return;
                }
            });
            _this._focusTracker = _this._register(dom.trackFocus(_this._innerDomNode));
            _this._register(_this._focusTracker.onDidFocus(_this.onFocusTrackerFocus.bind(_this)));
            _this._register(_this._focusTracker.onDidBlur(_this.onFocusTrackerBlur.bind(_this)));
            _this._findInputFocusTracker = _this._register(dom.trackFocus(_this._findInput.domNode));
            _this._register(_this._findInputFocusTracker.onDidFocus(_this.onFindInputFocusTrackerFocus.bind(_this)));
            _this._register(_this._findInputFocusTracker.onDidBlur(_this.onFindInputFocusTrackerBlur.bind(_this)));
            _this._register(dom.addDisposableListener(_this._innerDomNode, 'click', function (event) {
                event.stopPropagation();
            }));
            return _this;
        }
        Object.defineProperty(SimpleFindWidget.prototype, "inputValue", {
            get: function () {
                return this._findInput.getValue();
            },
            enumerable: true,
            configurable: true
        });
        SimpleFindWidget.prototype.updateTheme = function (theme) {
            var inputStyles = {
                inputActiveOptionBorder: theme.getColor(colorRegistry_1.inputActiveOptionBorder),
                inputBackground: theme.getColor(colorRegistry_1.inputBackground),
                inputForeground: theme.getColor(colorRegistry_1.inputForeground),
                inputBorder: theme.getColor(colorRegistry_1.inputBorder),
                inputValidationInfoBackground: theme.getColor(colorRegistry_1.inputValidationInfoBackground),
                inputValidationInfoBorder: theme.getColor(colorRegistry_1.inputValidationInfoBorder),
                inputValidationWarningBackground: theme.getColor(colorRegistry_1.inputValidationWarningBackground),
                inputValidationWarningBorder: theme.getColor(colorRegistry_1.inputValidationWarningBorder),
                inputValidationErrorBackground: theme.getColor(colorRegistry_1.inputValidationErrorBackground),
                inputValidationErrorBorder: theme.getColor(colorRegistry_1.inputValidationErrorBorder)
            };
            this._findInput.style(inputStyles);
        };
        SimpleFindWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        SimpleFindWidget.prototype.reveal = function (initialInput) {
            var _this = this;
            if (initialInput) {
                this._findInput.setValue(initialInput);
            }
            if (this._isVisible) {
                this._findInput.select();
                return;
            }
            this._isVisible = true;
            setTimeout(function () {
                dom.addClass(_this._innerDomNode, 'visible');
                _this._innerDomNode.setAttribute('aria-hidden', 'false');
                if (!_this.animate) {
                    dom.addClass(_this._innerDomNode, 'noanimation');
                }
                setTimeout(function () {
                    dom.removeClass(_this._innerDomNode, 'noanimation');
                    _this._findInput.select();
                }, 200);
            }, 0);
        };
        SimpleFindWidget.prototype.hide = function () {
            if (this._isVisible) {
                this._isVisible = false;
                dom.removeClass(this._innerDomNode, 'visible');
                this._innerDomNode.setAttribute('aria-hidden', 'true');
            }
        };
        SimpleFindWidget.prototype._delayedUpdateHistory = function () {
            this._updateHistoryDelayer.trigger(this._updateHistory.bind(this));
        };
        SimpleFindWidget.prototype._updateHistory = function () {
            if (this.inputValue) {
                this._findHistory.add(this._findInput.getValue());
            }
        };
        SimpleFindWidget.prototype.showNextFindTerm = function () {
            var next = this._findHistory.next();
            if (next) {
                this._findInput.setValue(next);
            }
        };
        SimpleFindWidget.prototype.showPreviousFindTerm = function () {
            var previous = this._findHistory.previous();
            if (previous) {
                this._findInput.setValue(previous);
            }
        };
        SimpleFindWidget = __decorate([
            __param(0, contextView_1.IContextViewService)
        ], SimpleFindWidget);
        return SimpleFindWidget;
    }(widget_1.Widget));
    exports.SimpleFindWidget = SimpleFindWidget;
    // theming
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var findWidgetBGColor = theme.getColor(colorRegistry_1.editorWidgetBackground);
        if (findWidgetBGColor) {
            collector.addRule(".monaco-workbench .simple-find-part { background-color: " + findWidgetBGColor + " !important; }");
        }
        var widgetShadowColor = theme.getColor(colorRegistry_1.widgetShadow);
        if (widgetShadowColor) {
            collector.addRule(".monaco-workbench .simple-find-part { box-shadow: 0 2px 8px " + widgetShadowColor + "; }");
        }
    });
});
