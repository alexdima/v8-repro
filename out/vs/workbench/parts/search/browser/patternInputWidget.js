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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/builder", "vs/base/browser/ui/widget", "vs/base/browser/ui/checkbox/checkbox", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/event", "vs/platform/theme/common/styler", "vs/base/common/history"], function (require, exports, nls, dom, builder_1, widget_1, checkbox_1, inputBox_1, event_1, styler_1, history_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PatternInputWidget = /** @class */ (function (_super) {
        __extends(PatternInputWidget, _super);
        function PatternInputWidget(parent, contextViewProvider, themeService, options) {
            if (options === void 0) { options = Object.create(null); }
            var _this = _super.call(this) || this;
            _this.contextViewProvider = contextViewProvider;
            _this.themeService = themeService;
            _this._onSubmit = _this._register(new event_1.Emitter());
            _this.onSubmit = _this._onSubmit.event;
            _this._onCancel = _this._register(new event_1.Emitter());
            _this.onCancel = _this._onCancel.event;
            _this.history = new history_1.HistoryNavigator();
            _this.onOptionChange = null;
            _this.width = options.width || 100;
            _this.placeholder = options.placeholder || '';
            _this.ariaLabel = options.ariaLabel || nls.localize('defaultLabel', "input");
            _this.domNode = null;
            _this.inputBox = null;
            _this.render();
            parent.appendChild(_this.domNode);
            return _this;
        }
        PatternInputWidget.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.inputFocusTracker) {
                this.inputFocusTracker.dispose();
            }
        };
        PatternInputWidget.prototype.on = function (eventType, handler) {
            switch (eventType) {
                case 'keydown':
                case 'keyup':
                    builder_1.$(this.inputBox.inputElement).on(eventType, handler);
                    break;
                case PatternInputWidget.OPTION_CHANGE:
                    this.onOptionChange = handler;
                    break;
            }
            return this;
        };
        PatternInputWidget.prototype.setWidth = function (newWidth) {
            this.width = newWidth;
            this.domNode.style.width = this.width + 'px';
            this.contextViewProvider.layout();
            this.setInputWidth();
        };
        PatternInputWidget.prototype.getValue = function () {
            return this.inputBox.value;
        };
        PatternInputWidget.prototype.setValue = function (value) {
            if (this.inputBox.value !== value) {
                this.inputBox.value = value;
            }
        };
        PatternInputWidget.prototype.select = function () {
            this.inputBox.select();
        };
        PatternInputWidget.prototype.focus = function () {
            this.inputBox.focus();
        };
        PatternInputWidget.prototype.inputHasFocus = function () {
            return this.inputBox.hasFocus();
        };
        PatternInputWidget.prototype.setInputWidth = function () {
            this.inputBox.width = this.width - this.getSubcontrolsWidth() - 2; // 2 for input box border
        };
        PatternInputWidget.prototype.getSubcontrolsWidth = function () {
            return 0;
        };
        PatternInputWidget.prototype.getHistory = function () {
            return this.history.getHistory();
        };
        PatternInputWidget.prototype.setHistory = function (history) {
            this.history = new history_1.HistoryNavigator(history);
        };
        PatternInputWidget.prototype.onSearchSubmit = function () {
            var value = this.getValue();
            if (value) {
                this.history.addIfNotPresent(value);
            }
        };
        PatternInputWidget.prototype.showNextTerm = function () {
            var next = this.history.next();
            if (next) {
                this.setValue(next);
            }
        };
        PatternInputWidget.prototype.showPreviousTerm = function () {
            var previous;
            if (this.getValue().length === 0) {
                previous = this.history.current();
            }
            else {
                this.history.addIfNotPresent(this.getValue());
                previous = this.history.previous();
            }
            if (previous) {
                this.setValue(previous);
            }
        };
        PatternInputWidget.prototype.render = function () {
            var _this = this;
            this.domNode = document.createElement('div');
            this.domNode.style.width = this.width + 'px';
            builder_1.$(this.domNode).addClass('monaco-findInput');
            this.inputBox = new inputBox_1.InputBox(this.domNode, this.contextViewProvider, {
                placeholder: this.placeholder || '',
                ariaLabel: this.ariaLabel || '',
                validationOptions: {
                    validation: null
                }
            });
            this._register(styler_1.attachInputBoxStyler(this.inputBox, this.themeService));
            this.inputFocusTracker = dom.trackFocus(this.inputBox.inputElement);
            this.onkeyup(this.inputBox.inputElement, function (keyboardEvent) { return _this.onInputKeyUp(keyboardEvent); });
            var controls = document.createElement('div');
            controls.className = 'controls';
            this.renderSubcontrols(controls);
            this.domNode.appendChild(controls);
            this.setInputWidth();
        };
        PatternInputWidget.prototype.renderSubcontrols = function (controlsDiv) {
        };
        PatternInputWidget.prototype.onInputKeyUp = function (keyboardEvent) {
            switch (keyboardEvent.keyCode) {
                case 3 /* Enter */:
                    this._onSubmit.fire();
                    return;
                case 9 /* Escape */:
                    this._onCancel.fire();
                    return;
                default:
                    return;
            }
        };
        PatternInputWidget.OPTION_CHANGE = 'optionChange';
        return PatternInputWidget;
    }(widget_1.Widget));
    exports.PatternInputWidget = PatternInputWidget;
    var ExcludePatternInputWidget = /** @class */ (function (_super) {
        __extends(ExcludePatternInputWidget, _super);
        function ExcludePatternInputWidget(parent, contextViewProvider, themeService, options) {
            if (options === void 0) { options = Object.create(null); }
            return _super.call(this, parent, contextViewProvider, themeService, options) || this;
        }
        ExcludePatternInputWidget.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.useExcludesAndIgnoreFilesBox.dispose();
        };
        ExcludePatternInputWidget.prototype.useExcludesAndIgnoreFiles = function () {
            return this.useExcludesAndIgnoreFilesBox.checked;
        };
        ExcludePatternInputWidget.prototype.setUseExcludesAndIgnoreFiles = function (value) {
            this.useExcludesAndIgnoreFilesBox.checked = value;
        };
        ExcludePatternInputWidget.prototype.getSubcontrolsWidth = function () {
            return _super.prototype.getSubcontrolsWidth.call(this) + this.useExcludesAndIgnoreFilesBox.width();
        };
        ExcludePatternInputWidget.prototype.renderSubcontrols = function (controlsDiv) {
            var _this = this;
            this.useExcludesAndIgnoreFilesBox = new checkbox_1.Checkbox({
                actionClassName: 'useExcludesAndIgnoreFiles',
                title: nls.localize('useExcludesAndIgnoreFilesDescription', "Use Exclude Settings and Ignore Files"),
                isChecked: true,
                onChange: function (viaKeyboard) {
                    _this.onOptionChange(null);
                    if (!viaKeyboard) {
                        _this.inputBox.focus();
                    }
                }
            });
            this._register(styler_1.attachCheckboxStyler(this.useExcludesAndIgnoreFilesBox, this.themeService));
            controlsDiv.appendChild(this.useExcludesAndIgnoreFilesBox.domNode);
            _super.prototype.renderSubcontrols.call(this, controlsDiv);
        };
        return ExcludePatternInputWidget;
    }(PatternInputWidget));
    exports.ExcludePatternInputWidget = ExcludePatternInputWidget;
});
