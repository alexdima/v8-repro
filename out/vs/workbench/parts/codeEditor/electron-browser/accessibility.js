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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/browser/dom", "vs/base/browser/htmlContentRenderer", "vs/base/browser/fastDomNode", "vs/base/browser/ui/widget", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/browser/editorExtensions", "vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/platform/configuration/common/configuration", "vs/base/common/platform", "vs/base/browser/ui/aria/aria", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/platform/keybinding/common/keybindingsRegistry", "vs/css!./accessibility"], function (require, exports, nls, lifecycle_1, strings, dom, htmlContentRenderer_1, fastDomNode_1, widget_1, instantiation_1, keybinding_1, contextkey_1, editorContextKeys_1, editorExtensions_1, toggleTabFocusMode_1, themeService_1, colorRegistry_1, configuration_1, platform, aria_1, opener_1, uri_1, keybindingsRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE = new contextkey_1.RawContextKey('accessibilityHelpWidgetVisible', false);
    var AccessibilityHelpController = /** @class */ (function (_super) {
        __extends(AccessibilityHelpController, _super);
        function AccessibilityHelpController(editor, instantiationService) {
            var _this = _super.call(this) || this;
            _this._editor = editor;
            _this._widget = _this._register(instantiationService.createInstance(AccessibilityHelpWidget, _this._editor));
            return _this;
        }
        AccessibilityHelpController.get = function (editor) {
            return editor.getContribution(AccessibilityHelpController.ID);
        };
        AccessibilityHelpController.prototype.getId = function () {
            return AccessibilityHelpController.ID;
        };
        AccessibilityHelpController.prototype.show = function () {
            this._widget.show();
        };
        AccessibilityHelpController.prototype.hide = function () {
            this._widget.hide();
        };
        AccessibilityHelpController.ID = 'editor.contrib.accessibilityHelpController';
        AccessibilityHelpController = __decorate([
            __param(1, instantiation_1.IInstantiationService)
        ], AccessibilityHelpController);
        return AccessibilityHelpController;
    }(lifecycle_1.Disposable));
    var AccessibilityHelpWidget = /** @class */ (function (_super) {
        __extends(AccessibilityHelpWidget, _super);
        function AccessibilityHelpWidget(editor, _contextKeyService, _keybindingService, _configurationService, _openerService) {
            var _this = _super.call(this) || this;
            _this._contextKeyService = _contextKeyService;
            _this._keybindingService = _keybindingService;
            _this._configurationService = _configurationService;
            _this._openerService = _openerService;
            _this._editor = editor;
            _this._isVisibleKey = CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE.bindTo(_this._contextKeyService);
            _this._domNode = fastDomNode_1.createFastDomNode(document.createElement('div'));
            _this._domNode.setClassName('accessibilityHelpWidget');
            _this._domNode.setWidth(AccessibilityHelpWidget.WIDTH);
            _this._domNode.setHeight(AccessibilityHelpWidget.HEIGHT);
            _this._domNode.setDisplay('none');
            _this._domNode.setAttribute('role', 'dialog');
            _this._domNode.setAttribute('aria-hidden', 'true');
            _this._contentDomNode = fastDomNode_1.createFastDomNode(document.createElement('div'));
            _this._contentDomNode.setAttribute('role', 'document');
            _this._domNode.appendChild(_this._contentDomNode);
            _this._isVisible = false;
            _this._register(_this._editor.onDidLayoutChange(function () {
                if (_this._isVisible) {
                    _this._layout();
                }
            }));
            // Intentionally not configurable!
            _this._register(dom.addStandardDisposableListener(_this._contentDomNode.domNode, 'keydown', function (e) {
                if (!_this._isVisible) {
                    return;
                }
                if (e.equals(2048 /* CtrlCmd */ | 35 /* KEY_E */)) {
                    aria_1.alert(nls.localize('emergencyConfOn', "Now changing the setting `editor.accessibilitySupport` to 'on'."));
                    _this._configurationService.updateValue('editor.accessibilitySupport', 'on', configuration_1.ConfigurationTarget.USER);
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (e.equals(2048 /* CtrlCmd */ | 38 /* KEY_H */)) {
                    aria_1.alert(nls.localize('openingDocs', "Now opening the VS Code Accessibility documentation page."));
                    _this._openerService.open(uri_1.default.parse('https://go.microsoft.com/fwlink/?linkid=851010'));
                    e.preventDefault();
                    e.stopPropagation();
                }
            }));
            _this.onblur(_this._contentDomNode.domNode, function () {
                _this.hide();
            });
            _this._editor.addOverlayWidget(_this);
            return _this;
        }
        AccessibilityHelpWidget.prototype.dispose = function () {
            this._editor.removeOverlayWidget(this);
            _super.prototype.dispose.call(this);
        };
        AccessibilityHelpWidget.prototype.getId = function () {
            return AccessibilityHelpWidget.ID;
        };
        AccessibilityHelpWidget.prototype.getDomNode = function () {
            return this._domNode.domNode;
        };
        AccessibilityHelpWidget.prototype.getPosition = function () {
            return {
                preference: null
            };
        };
        AccessibilityHelpWidget.prototype.show = function () {
            if (this._isVisible) {
                return;
            }
            this._isVisible = true;
            this._isVisibleKey.set(true);
            this._layout();
            this._domNode.setDisplay('block');
            this._domNode.setAttribute('aria-hidden', 'false');
            this._contentDomNode.domNode.tabIndex = 0;
            this._buildContent();
            this._contentDomNode.domNode.focus();
        };
        AccessibilityHelpWidget.prototype._descriptionForCommand = function (commandId, msg, noKbMsg) {
            var kb = this._keybindingService.lookupKeybinding(commandId);
            if (kb) {
                return strings.format(msg, kb.getAriaLabel());
            }
            return strings.format(noKbMsg, commandId);
        };
        AccessibilityHelpWidget.prototype._buildContent = function () {
            var opts = this._editor.getConfiguration();
            var text = nls.localize('introMsg', "Thank you for trying out VS Code's accessibility options.");
            text += '\n\n' + nls.localize('status', "Status:");
            var configuredValue = this._configurationService.getValue('editor').accessibilitySupport;
            var actualValue = opts.accessibilitySupport;
            var emergencyTurnOnMessage = (platform.isMacintosh
                ? nls.localize('changeConfigToOnMac', "To configure the editor to be permanently optimized for usage with a Screen Reader press Command+E now.")
                : nls.localize('changeConfigToOnWinLinux', "To configure the editor to be permanently optimized for usage with a Screen Reader press Control+E now."));
            switch (configuredValue) {
                case 'auto':
                    switch (actualValue) {
                        case 0 /* Unknown */:
                            // Should never happen in VS Code
                            text += '\n\n - ' + nls.localize('auto_unknown', "The editor is configured to use platform APIs to detect when a Screen Reader is attached, but the current runtime does not support this.");
                            break;
                        case 2 /* Enabled */:
                            text += '\n\n - ' + nls.localize('auto_on', "The editor has automatically detected a Screen Reader is attached.");
                            break;
                        case 1 /* Disabled */:
                            text += '\n\n - ' + nls.localize('auto_off', "The editor is configured to automatically detect when a Screen Reader is attached, which is not the case at this time.");
                            text += ' ' + emergencyTurnOnMessage;
                            break;
                    }
                    break;
                case 'on':
                    text += '\n\n - ' + nls.localize('configuredOn', "The editor is configured to be permanently optimized for usage with a Screen Reader - you can change this by editing the setting `editor.accessibilitySupport`.");
                    break;
                case 'off':
                    text += '\n\n - ' + nls.localize('configuredOff', "The editor is configured to never be optimized for usage with a Screen Reader.");
                    text += ' ' + emergencyTurnOnMessage;
                    break;
            }
            var NLS_TAB_FOCUS_MODE_ON = nls.localize('tabFocusModeOnMsg', "Pressing Tab in the current editor will move focus to the next focusable element. Toggle this behavior by pressing {0}.");
            var NLS_TAB_FOCUS_MODE_ON_NO_KB = nls.localize('tabFocusModeOnMsgNoKb', "Pressing Tab in the current editor will move focus to the next focusable element. The command {0} is currently not triggerable by a keybinding.");
            var NLS_TAB_FOCUS_MODE_OFF = nls.localize('tabFocusModeOffMsg', "Pressing Tab in the current editor will insert the tab character. Toggle this behavior by pressing {0}.");
            var NLS_TAB_FOCUS_MODE_OFF_NO_KB = nls.localize('tabFocusModeOffMsgNoKb', "Pressing Tab in the current editor will insert the tab character. The command {0} is currently not triggerable by a keybinding.");
            if (opts.tabFocusMode) {
                text += '\n\n - ' + this._descriptionForCommand(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, NLS_TAB_FOCUS_MODE_ON, NLS_TAB_FOCUS_MODE_ON_NO_KB);
            }
            else {
                text += '\n\n - ' + this._descriptionForCommand(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, NLS_TAB_FOCUS_MODE_OFF, NLS_TAB_FOCUS_MODE_OFF_NO_KB);
            }
            var openDocMessage = (platform.isMacintosh
                ? nls.localize('openDocMac', "Press Command+H now to open a browser window with more VS Code information related to Accessibility.")
                : nls.localize('openDocWinLinux', "Press Control+H now to open a browser window with more VS Code information related to Accessibility."));
            text += '\n\n' + openDocMessage;
            text += '\n\n' + nls.localize('outroMsg', "You can dismiss this tooltip and return to the editor by pressing Escape or Shift+Escape.");
            this._contentDomNode.domNode.appendChild(htmlContentRenderer_1.renderFormattedText(text));
            // Per https://www.w3.org/TR/wai-aria/roles#document, Authors SHOULD provide a title or label for documents
            this._contentDomNode.domNode.setAttribute('aria-label', text);
        };
        AccessibilityHelpWidget.prototype.hide = function () {
            if (!this._isVisible) {
                return;
            }
            this._isVisible = false;
            this._isVisibleKey.reset();
            this._domNode.setDisplay('none');
            this._domNode.setAttribute('aria-hidden', 'true');
            this._contentDomNode.domNode.tabIndex = -1;
            dom.clearNode(this._contentDomNode.domNode);
            this._editor.focus();
        };
        AccessibilityHelpWidget.prototype._layout = function () {
            var editorLayout = this._editor.getLayoutInfo();
            var top = Math.round((editorLayout.height - AccessibilityHelpWidget.HEIGHT) / 2);
            this._domNode.setTop(top);
            var left = Math.round((editorLayout.width - AccessibilityHelpWidget.WIDTH) / 2);
            this._domNode.setLeft(left);
        };
        AccessibilityHelpWidget.ID = 'editor.contrib.accessibilityHelpWidget';
        AccessibilityHelpWidget.WIDTH = 500;
        AccessibilityHelpWidget.HEIGHT = 300;
        AccessibilityHelpWidget = __decorate([
            __param(1, contextkey_1.IContextKeyService),
            __param(2, keybinding_1.IKeybindingService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, opener_1.IOpenerService)
        ], AccessibilityHelpWidget);
        return AccessibilityHelpWidget;
    }(widget_1.Widget));
    var ShowAccessibilityHelpAction = /** @class */ (function (_super) {
        __extends(ShowAccessibilityHelpAction, _super);
        function ShowAccessibilityHelpAction() {
            return _super.call(this, {
                id: 'editor.action.showAccessibilityHelp',
                label: nls.localize('ShowAccessibilityHelpAction', "Show Accessibility Help"),
                alias: 'Show Accessibility Help',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 512 /* Alt */ | 59 /* F1 */
                }
            }) || this;
        }
        ShowAccessibilityHelpAction.prototype.run = function (accessor, editor) {
            var controller = AccessibilityHelpController.get(editor);
            if (controller) {
                controller.show();
            }
        };
        return ShowAccessibilityHelpAction;
    }(editorExtensions_1.EditorAction));
    editorExtensions_1.registerEditorContribution(AccessibilityHelpController);
    editorExtensions_1.registerEditorAction(ShowAccessibilityHelpAction);
    var AccessibilityHelpCommand = editorExtensions_1.EditorCommand.bindToContribution(AccessibilityHelpController.get);
    editorExtensions_1.registerEditorCommand(new AccessibilityHelpCommand({
        id: 'closeAccessibilityHelp',
        precondition: CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE,
        handler: function (x) { return x.hide(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(100),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* Escape */, secondary: [1024 /* Shift */ | 9 /* Escape */]
        }
    }));
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var widgetBackground = theme.getColor(colorRegistry_1.editorWidgetBackground);
        if (widgetBackground) {
            collector.addRule(".monaco-editor .accessibilityHelpWidget { background-color: " + widgetBackground + "; }");
        }
        var widgetShadowColor = theme.getColor(colorRegistry_1.widgetShadow);
        if (widgetShadowColor) {
            collector.addRule(".monaco-editor .accessibilityHelpWidget { box-shadow: 0 2px 8px " + widgetShadowColor + "; }");
        }
        var hcBorder = theme.getColor(colorRegistry_1.contrastBorder);
        if (hcBorder) {
            collector.addRule(".monaco-editor .accessibilityHelpWidget { border: 2px solid " + hcBorder + "; }");
        }
    });
});
