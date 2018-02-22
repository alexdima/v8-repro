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
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/widget", "vs/base/browser/dom", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/fastDomNode", "vs/platform/keybinding/common/keybinding", "vs/base/browser/builder", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/css!./media/keybindings"], function (require, exports, nls, platform_1, winjs_base_1, lifecycle_1, event_1, keybindingLabel_1, widget_1, dom, inputBox_1, fastDomNode_1, keybinding_1, builder_1, contextView_1, instantiation_1, styler_1, themeService_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var KeybindingInputWidget = /** @class */ (function (_super) {
        __extends(KeybindingInputWidget, _super);
        function KeybindingInputWidget(parent, options, contextViewService, keybindingService, themeService) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.contextViewService = contextViewService;
            _this.keybindingService = keybindingService;
            _this._onKeybinding = _this._register(new event_1.Emitter());
            _this.onKeybinding = _this._onKeybinding.event;
            _this._onEnter = _this._register(new event_1.Emitter());
            _this.onEnter = _this._onEnter.event;
            _this._onEscape = _this._register(new event_1.Emitter());
            _this.onEscape = _this._onEscape.event;
            _this._onBlur = _this._register(new event_1.Emitter());
            _this.onBlur = _this._onBlur.event;
            _this.inputBox = _this._register(new inputBox_1.InputBox(parent, _this.contextViewService, _this.options));
            _this._register(styler_1.attachInputBoxStyler(_this.inputBox, themeService));
            _this.onkeydown(_this.inputBox.inputElement, function (e) { return _this._onKeyDown(e); });
            _this.onblur(_this.inputBox.inputElement, function (e) { return _this._onBlur.fire(); });
            _this.oninput(_this.inputBox.inputElement, function (e) {
                // Prevent other characters from showing up
                _this.setInputValue(_this._inputValue);
            });
            _this._acceptChords = true;
            _this._firstPart = null;
            _this._chordPart = null;
            return _this;
        }
        KeybindingInputWidget.prototype.setInputValue = function (value) {
            this._inputValue = value;
            this.inputBox.value = this._inputValue;
        };
        KeybindingInputWidget.prototype.focus = function () {
            this.inputBox.focus();
        };
        KeybindingInputWidget.prototype.reset = function () {
            this._firstPart = null;
            this._chordPart = null;
        };
        KeybindingInputWidget.prototype._onKeyDown = function (keyboardEvent) {
            keyboardEvent.preventDefault();
            keyboardEvent.stopPropagation();
            if (keyboardEvent.equals(3 /* Enter */)) {
                this._onEnter.fire();
                return;
            }
            if (keyboardEvent.equals(9 /* Escape */)) {
                this._onEscape.fire();
                return;
            }
            this.printKeybinding(keyboardEvent);
        };
        KeybindingInputWidget.prototype.printKeybinding = function (keyboardEvent) {
            var keybinding = this.keybindingService.resolveKeyboardEvent(keyboardEvent);
            var info = "code: " + keyboardEvent.browserEvent.code + ", keyCode: " + keyboardEvent.browserEvent.keyCode + ", key: " + keyboardEvent.browserEvent.key + " => UI: " + keybinding.getAriaLabel() + ", user settings: " + keybinding.getUserSettingsLabel() + ", dispatch: " + keybinding.getDispatchParts()[0];
            if (this._acceptChords) {
                var hasFirstPart = (this._firstPart && this._firstPart.getDispatchParts()[0] !== null);
                var hasChordPart = (this._chordPart && this._chordPart.getDispatchParts()[0] !== null);
                if (hasFirstPart && hasChordPart) {
                    // Reset
                    this._firstPart = keybinding;
                    this._chordPart = null;
                }
                else if (!hasFirstPart) {
                    this._firstPart = keybinding;
                }
                else {
                    this._chordPart = keybinding;
                }
            }
            else {
                this._firstPart = keybinding;
            }
            var value = '';
            if (this._firstPart) {
                value = this._firstPart.getUserSettingsLabel();
            }
            if (this._chordPart) {
                value = value + ' ' + this._chordPart.getUserSettingsLabel();
            }
            this.setInputValue(value);
            this.inputBox.inputElement.title = info;
            this._onKeybinding.fire([this._firstPart, this._chordPart]);
        };
        KeybindingInputWidget = __decorate([
            __param(2, contextView_1.IContextViewService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, themeService_1.IThemeService)
        ], KeybindingInputWidget);
        return KeybindingInputWidget;
    }(widget_1.Widget));
    var DefineKeybindingWidget = /** @class */ (function (_super) {
        __extends(DefineKeybindingWidget, _super);
        function DefineKeybindingWidget(parent, instantiationService, themeService) {
            var _this = _super.call(this) || this;
            _this.instantiationService = instantiationService;
            _this.themeService = themeService;
            _this._firstPart = null;
            _this._chordPart = null;
            _this._isVisible = false;
            _this._onHide = _this._register(new event_1.Emitter());
            _this.create();
            if (parent) {
                dom.append(parent, _this._domNode.domNode);
            }
            return _this;
        }
        Object.defineProperty(DefineKeybindingWidget.prototype, "domNode", {
            get: function () {
                return this._domNode.domNode;
            },
            enumerable: true,
            configurable: true
        });
        DefineKeybindingWidget.prototype.define = function () {
            var _this = this;
            this._keybindingInputWidget.reset();
            return new winjs_base_1.TPromise(function (c, e) {
                if (!_this._isVisible) {
                    _this._isVisible = true;
                    _this._domNode.setDisplay('block');
                    _this._firstPart = null;
                    _this._chordPart = null;
                    _this._keybindingInputWidget.setInputValue('');
                    dom.clearNode(_this._outputNode);
                    _this._keybindingInputWidget.focus();
                }
                var disposable = _this._onHide.event(function () {
                    if (_this._firstPart) {
                        var r = _this._firstPart.getUserSettingsLabel();
                        if (_this._chordPart) {
                            r = r + ' ' + _this._chordPart.getUserSettingsLabel();
                        }
                        c(r);
                    }
                    else {
                        c(null);
                    }
                    disposable.dispose();
                });
            });
        };
        DefineKeybindingWidget.prototype.layout = function (layout) {
            var top = Math.round((layout.height - DefineKeybindingWidget.HEIGHT) / 2);
            this._domNode.setTop(top);
            var left = Math.round((layout.width - DefineKeybindingWidget.WIDTH) / 2);
            this._domNode.setLeft(left);
        };
        DefineKeybindingWidget.prototype.create = function () {
            var _this = this;
            this._domNode = fastDomNode_1.createFastDomNode(document.createElement('div'));
            this._domNode.setDisplay('none');
            this._domNode.setClassName('defineKeybindingWidget');
            this._domNode.setWidth(DefineKeybindingWidget.WIDTH);
            this._domNode.setHeight(DefineKeybindingWidget.HEIGHT);
            dom.append(this._domNode.domNode, dom.$('.message', null, nls.localize('defineKeybinding.initial', "Press desired key combination and then press ENTER.")));
            this._register(styler_1.attachStylerCallback(this.themeService, { editorWidgetBackground: colorRegistry_1.editorWidgetBackground, widgetShadow: colorRegistry_1.widgetShadow }, function (colors) {
                _this._domNode.domNode.style.backgroundColor = colors.editorWidgetBackground;
                if (colors.widgetShadow) {
                    _this._domNode.domNode.style.boxShadow = "0 2px 8px " + colors.widgetShadow;
                }
                else {
                    _this._domNode.domNode.style.boxShadow = null;
                }
            }));
            this._keybindingInputWidget = this._register(this.instantiationService.createInstance(KeybindingInputWidget, this._domNode.domNode, {}));
            this._register(this._keybindingInputWidget.onKeybinding(function (keybinding) { return _this.printKeybinding(keybinding); }));
            this._register(this._keybindingInputWidget.onEnter(function () { return _this.hide(); }));
            this._register(this._keybindingInputWidget.onEscape(function () { return _this.onCancel(); }));
            this._register(this._keybindingInputWidget.onBlur(function () { return _this.onCancel(); }));
            this._outputNode = dom.append(this._domNode.domNode, dom.$('.output'));
        };
        DefineKeybindingWidget.prototype.printKeybinding = function (keybinding) {
            var firstPart = keybinding[0], chordPart = keybinding[1];
            this._firstPart = firstPart;
            this._chordPart = chordPart;
            dom.clearNode(this._outputNode);
            new keybindingLabel_1.KeybindingLabel(this._outputNode, platform_1.OS).set(this._firstPart, null);
            if (this._chordPart) {
                this._outputNode.appendChild(document.createTextNode(nls.localize('defineKeybinding.chordsTo', "chord to")));
                new keybindingLabel_1.KeybindingLabel(this._outputNode, platform_1.OS).set(this._chordPart, null);
            }
        };
        DefineKeybindingWidget.prototype.onCancel = function () {
            this._firstPart = null;
            this._chordPart = null;
            this.hide();
        };
        DefineKeybindingWidget.prototype.hide = function () {
            this._domNode.setDisplay('none');
            this._isVisible = false;
            this._onHide.fire();
        };
        DefineKeybindingWidget.WIDTH = 400;
        DefineKeybindingWidget.HEIGHT = 90;
        DefineKeybindingWidget = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, themeService_1.IThemeService)
        ], DefineKeybindingWidget);
        return DefineKeybindingWidget;
    }(widget_1.Widget));
    exports.DefineKeybindingWidget = DefineKeybindingWidget;
    var DefineKeybindingOverlayWidget = /** @class */ (function (_super) {
        __extends(DefineKeybindingOverlayWidget, _super);
        function DefineKeybindingOverlayWidget(_editor, instantiationService) {
            var _this = _super.call(this) || this;
            _this._editor = _editor;
            _this._widget = instantiationService.createInstance(DefineKeybindingWidget, null);
            _this._editor.addOverlayWidget(_this);
            return _this;
        }
        DefineKeybindingOverlayWidget.prototype.getId = function () {
            return DefineKeybindingOverlayWidget.ID;
        };
        DefineKeybindingOverlayWidget.prototype.getDomNode = function () {
            return this._widget.domNode;
        };
        DefineKeybindingOverlayWidget.prototype.getPosition = function () {
            return {
                preference: null
            };
        };
        DefineKeybindingOverlayWidget.prototype.dispose = function () {
            this._editor.removeOverlayWidget(this);
            _super.prototype.dispose.call(this);
        };
        DefineKeybindingOverlayWidget.prototype.start = function () {
            this._editor.revealPositionInCenterIfOutsideViewport(this._editor.getPosition(), 0 /* Smooth */);
            var layoutInfo = this._editor.getLayoutInfo();
            this._widget.layout(new builder_1.Dimension(layoutInfo.width, layoutInfo.height));
            return this._widget.define();
        };
        DefineKeybindingOverlayWidget.ID = 'editor.contrib.defineKeybindingWidget';
        DefineKeybindingOverlayWidget = __decorate([
            __param(1, instantiation_1.IInstantiationService)
        ], DefineKeybindingOverlayWidget);
        return DefineKeybindingOverlayWidget;
    }(lifecycle_1.Disposable));
    exports.DefineKeybindingOverlayWidget = DefineKeybindingOverlayWidget;
});
