/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/builder", "vs/base/browser/keyboardEvent", "vs/base/common/color", "vs/base/common/objects", "vs/base/common/event", "vs/css!./button"], function (require, exports, DOM, builder_1, keyboardEvent_1, color_1, objects_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var defaultOptions = {
        buttonBackground: color_1.Color.fromHex('#0E639C'),
        buttonHoverBackground: color_1.Color.fromHex('#006BB3'),
        buttonForeground: color_1.Color.white
    };
    var Button = /** @class */ (function () {
        function Button(container, options) {
            var _this = this;
            this._onDidClick = new event_1.Emitter();
            this.onDidClick = this._onDidClick.event;
            this.options = options || Object.create(null);
            objects_1.mixin(this.options, defaultOptions, false);
            this.buttonBackground = this.options.buttonBackground;
            this.buttonHoverBackground = this.options.buttonHoverBackground;
            this.buttonForeground = this.options.buttonForeground;
            this.buttonBorder = this.options.buttonBorder;
            this.$el = builder_1.$('a.monaco-button').attr({
                'tabIndex': '0',
                'role': 'button'
            }).appendTo(container);
            this.$el.on(DOM.EventType.CLICK, function (e) {
                if (!_this.enabled) {
                    DOM.EventHelper.stop(e);
                    return;
                }
                _this._onDidClick.fire(e);
            });
            this.$el.on(DOM.EventType.KEY_DOWN, function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                var eventHandled = false;
                if (_this.enabled && event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
                    _this._onDidClick.fire(e);
                    eventHandled = true;
                }
                else if (event.equals(9 /* Escape */)) {
                    _this.$el.domBlur();
                    eventHandled = true;
                }
                if (eventHandled) {
                    DOM.EventHelper.stop(event, true);
                }
            });
            this.$el.on(DOM.EventType.MOUSE_OVER, function (e) {
                if (!_this.$el.hasClass('disabled')) {
                    var hoverBackground = _this.buttonHoverBackground ? _this.buttonHoverBackground.toString() : null;
                    if (hoverBackground) {
                        _this.$el.style('background-color', hoverBackground);
                    }
                }
            });
            this.$el.on(DOM.EventType.MOUSE_OUT, function (e) {
                _this.applyStyles(); // restore standard styles
            });
            this.applyStyles();
        }
        Button.prototype.style = function (styles) {
            this.buttonForeground = styles.buttonForeground;
            this.buttonBackground = styles.buttonBackground;
            this.buttonHoverBackground = styles.buttonHoverBackground;
            this.buttonBorder = styles.buttonBorder;
            this.applyStyles();
        };
        Button.prototype.applyStyles = function () {
            if (this.$el) {
                var background = this.buttonBackground ? this.buttonBackground.toString() : null;
                var foreground = this.buttonForeground ? this.buttonForeground.toString() : null;
                var border = this.buttonBorder ? this.buttonBorder.toString() : null;
                this.$el.style('color', foreground);
                this.$el.style('background-color', background);
                this.$el.style('border-width', border ? '1px' : null);
                this.$el.style('border-style', border ? 'solid' : null);
                this.$el.style('border-color', border);
            }
        };
        Button.prototype.getElement = function () {
            return this.$el.getHTMLElement();
        };
        Object.defineProperty(Button.prototype, "label", {
            set: function (value) {
                if (!this.$el.hasClass('monaco-text-button')) {
                    this.$el.addClass('monaco-text-button');
                }
                this.$el.text(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "icon", {
            set: function (iconClassName) {
                this.$el.addClass(iconClassName);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "enabled", {
            get: function () {
                return !this.$el.hasClass('disabled');
            },
            set: function (value) {
                if (value) {
                    this.$el.removeClass('disabled');
                    this.$el.attr({
                        'aria-disabled': 'false',
                        'tabIndex': '0'
                    });
                }
                else {
                    this.$el.addClass('disabled');
                    this.$el.attr('aria-disabled', String(true));
                    DOM.removeTabIndexAndUpdateFocus(this.$el.getHTMLElement());
                }
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.focus = function () {
            this.$el.domFocus();
        };
        Button.prototype.dispose = function () {
            if (this.$el) {
                this.$el.dispose();
                this.$el = null;
            }
            this._onDidClick.dispose();
        };
        return Button;
    }());
    exports.Button = Button;
});
