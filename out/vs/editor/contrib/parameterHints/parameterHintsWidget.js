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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/editor/common/modes", "vs/editor/browser/editorBrowser", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/browser/event", "vs/platform/contextkey/common/contextkey", "vs/editor/contrib/parameterHints/provideSignatureHelp", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/editor/common/core/characterClassifier", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/platform/opener/common/opener", "vs/editor/common/services/modeService", "vs/editor/contrib/markdown/markdownRenderer", "vs/css!./parameterHints"], function (require, exports, nls, lifecycle_1, winjs_base_1, dom, aria, modes_1, editorBrowser_1, async_1, errors_1, event_1, event_2, contextkey_1, provideSignatureHelp_1, scrollableElement_1, characterClassifier_1, themeService_1, colorRegistry_1, opener_1, modeService_1, markdownRenderer_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var ParameterHintsModel = /** @class */ (function (_super) {
        __extends(ParameterHintsModel, _super);
        function ParameterHintsModel(editor) {
            var _this = _super.call(this) || this;
            _this._onHint = _this._register(new event_1.Emitter());
            _this.onHint = _this._onHint.event;
            _this._onCancel = _this._register(new event_1.Emitter());
            _this.onCancel = _this._onCancel.event;
            _this.editor = editor;
            _this.enabled = false;
            _this.triggerCharactersListeners = [];
            _this.throttledDelayer = new async_1.RunOnceScheduler(function () { return _this.doTrigger(); }, ParameterHintsModel.DELAY);
            _this.active = false;
            _this._register(_this.editor.onDidChangeConfiguration(function () { return _this.onEditorConfigurationChange(); }));
            _this._register(_this.editor.onDidChangeModel(function (e) { return _this.onModelChanged(); }));
            _this._register(_this.editor.onDidChangeModelLanguage(function (_) { return _this.onModelChanged(); }));
            _this._register(_this.editor.onDidChangeCursorSelection(function (e) { return _this.onCursorChange(e); }));
            _this._register(modes_1.SignatureHelpProviderRegistry.onDidChange(_this.onModelChanged, _this));
            _this.onEditorConfigurationChange();
            _this.onModelChanged();
            return _this;
        }
        ParameterHintsModel.prototype.cancel = function (silent) {
            if (silent === void 0) { silent = false; }
            this.active = false;
            this.throttledDelayer.cancel();
            if (!silent) {
                this._onCancel.fire(void 0);
            }
        };
        ParameterHintsModel.prototype.trigger = function (delay) {
            if (delay === void 0) { delay = ParameterHintsModel.DELAY; }
            if (!modes_1.SignatureHelpProviderRegistry.has(this.editor.getModel())) {
                return;
            }
            this.cancel(true);
            return this.throttledDelayer.schedule(delay);
        };
        ParameterHintsModel.prototype.doTrigger = function () {
            var _this = this;
            provideSignatureHelp_1.provideSignatureHelp(this.editor.getModel(), this.editor.getPosition())
                .then(null, errors_1.onUnexpectedError)
                .then(function (result) {
                if (!result || !result.signatures || result.signatures.length === 0) {
                    _this.cancel();
                    _this._onCancel.fire(void 0);
                    return false;
                }
                _this.active = true;
                var event = { hints: result };
                _this._onHint.fire(event);
                return true;
            });
        };
        ParameterHintsModel.prototype.isTriggered = function () {
            return this.active || this.throttledDelayer.isScheduled();
        };
        ParameterHintsModel.prototype.onModelChanged = function () {
            var _this = this;
            if (this.active) {
                this.cancel();
            }
            this.triggerCharactersListeners = lifecycle_1.dispose(this.triggerCharactersListeners);
            var model = this.editor.getModel();
            if (!model) {
                return;
            }
            var triggerChars = new characterClassifier_1.CharacterSet();
            for (var _i = 0, _a = modes_1.SignatureHelpProviderRegistry.ordered(model); _i < _a.length; _i++) {
                var support = _a[_i];
                if (Array.isArray(support.signatureHelpTriggerCharacters)) {
                    for (var _b = 0, _c = support.signatureHelpTriggerCharacters; _b < _c.length; _b++) {
                        var ch = _c[_b];
                        triggerChars.add(ch.charCodeAt(0));
                    }
                }
            }
            this.triggerCharactersListeners.push(this.editor.onDidType(function (text) {
                if (!_this.enabled) {
                    return;
                }
                if (triggerChars.has(text.charCodeAt(text.length - 1))) {
                    _this.trigger();
                }
            }));
        };
        ParameterHintsModel.prototype.onCursorChange = function (e) {
            if (e.source === 'mouse') {
                this.cancel();
            }
            else if (this.isTriggered()) {
                this.trigger();
            }
        };
        ParameterHintsModel.prototype.onEditorConfigurationChange = function () {
            this.enabled = this.editor.getConfiguration().contribInfo.parameterHints;
            if (!this.enabled) {
                this.cancel();
            }
        };
        ParameterHintsModel.prototype.dispose = function () {
            this.cancel(true);
            this.triggerCharactersListeners = lifecycle_1.dispose(this.triggerCharactersListeners);
            _super.prototype.dispose.call(this);
        };
        ParameterHintsModel.DELAY = 120; // ms
        return ParameterHintsModel;
    }(lifecycle_1.Disposable));
    exports.ParameterHintsModel = ParameterHintsModel;
    var ParameterHintsWidget = /** @class */ (function () {
        function ParameterHintsWidget(editor, contextKeyService, openerService, modeService) {
            var _this = this;
            this.editor = editor;
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.markdownRenderer = new markdownRenderer_1.MarkdownRenderer(editor, modeService, openerService);
            this.model = new ParameterHintsModel(editor);
            this.keyVisible = provideSignatureHelp_1.Context.Visible.bindTo(contextKeyService);
            this.keyMultipleSignatures = provideSignatureHelp_1.Context.MultipleSignatures.bindTo(contextKeyService);
            this.visible = false;
            this.disposables = [];
            this.disposables.push(this.model.onHint(function (e) {
                _this.show();
                _this.hints = e.hints;
                _this.currentSignature = e.hints.activeSignature;
                _this.render();
            }));
            this.disposables.push(this.model.onCancel(function () {
                _this.hide();
            }));
        }
        ParameterHintsWidget.prototype.createParamaterHintDOMNodes = function () {
            var _this = this;
            this.element = $('.editor-widget.parameter-hints-widget');
            var wrapper = dom.append(this.element, $('.wrapper'));
            var buttons = dom.append(wrapper, $('.buttons'));
            var previous = dom.append(buttons, $('.button.previous'));
            var next = dom.append(buttons, $('.button.next'));
            var onPreviousClick = event_2.stop(event_2.domEvent(previous, 'click'));
            onPreviousClick(this.previous, this, this.disposables);
            var onNextClick = event_2.stop(event_2.domEvent(next, 'click'));
            onNextClick(this.next, this, this.disposables);
            this.overloads = dom.append(wrapper, $('.overloads'));
            var body = $('.body');
            this.scrollbar = new scrollableElement_1.DomScrollableElement(body, {});
            this.disposables.push(this.scrollbar);
            wrapper.appendChild(this.scrollbar.getDomNode());
            this.signature = dom.append(body, $('.signature'));
            this.docs = dom.append(body, $('.docs'));
            this.currentSignature = 0;
            this.editor.addContentWidget(this);
            this.hide();
            this.disposables.push(this.editor.onDidChangeCursorSelection(function (e) {
                if (_this.visible) {
                    _this.editor.layoutContentWidget(_this);
                }
            }));
            var updateFont = function () {
                var fontInfo = _this.editor.getConfiguration().fontInfo;
                _this.element.style.fontSize = fontInfo.fontSize + "px";
            };
            updateFont();
            event_1.chain(this.editor.onDidChangeConfiguration.bind(this.editor))
                .filter(function (e) { return e.fontInfo; })
                .on(updateFont, null, this.disposables);
            this.disposables.push(this.editor.onDidLayoutChange(function (e) { return _this.updateMaxHeight(); }));
            this.updateMaxHeight();
        };
        ParameterHintsWidget.prototype.show = function () {
            var _this = this;
            if (!this.model || this.visible) {
                return;
            }
            if (!this.element) {
                this.createParamaterHintDOMNodes();
            }
            this.keyVisible.set(true);
            this.visible = true;
            winjs_base_1.TPromise.timeout(100).done(function () { return dom.addClass(_this.element, 'visible'); });
            this.editor.layoutContentWidget(this);
        };
        ParameterHintsWidget.prototype.hide = function () {
            if (!this.model || !this.visible) {
                return;
            }
            if (!this.element) {
                this.createParamaterHintDOMNodes();
            }
            this.keyVisible.reset();
            this.visible = false;
            this.hints = null;
            this.announcedLabel = null;
            dom.removeClass(this.element, 'visible');
            this.editor.layoutContentWidget(this);
        };
        ParameterHintsWidget.prototype.getPosition = function () {
            if (this.visible) {
                return {
                    position: this.editor.getPosition(),
                    preference: [editorBrowser_1.ContentWidgetPositionPreference.ABOVE, editorBrowser_1.ContentWidgetPositionPreference.BELOW]
                };
            }
            return null;
        };
        ParameterHintsWidget.prototype.render = function () {
            var multiple = this.hints.signatures.length > 1;
            dom.toggleClass(this.element, 'multiple', multiple);
            this.keyMultipleSignatures.set(multiple);
            this.signature.innerHTML = '';
            this.docs.innerHTML = '';
            var signature = this.hints.signatures[this.currentSignature];
            if (!signature) {
                return;
            }
            var code = dom.append(this.signature, $('.code'));
            var hasParameters = signature.parameters.length > 0;
            var fontInfo = this.editor.getConfiguration().fontInfo;
            code.style.fontSize = fontInfo.fontSize + "px";
            code.style.fontFamily = fontInfo.fontFamily;
            if (!hasParameters) {
                var label = dom.append(code, $('span'));
                label.textContent = signature.label;
            }
            else {
                this.renderParameters(code, signature, this.hints.activeParameter);
            }
            var activeParameter = signature.parameters[this.hints.activeParameter];
            if (activeParameter && activeParameter.documentation) {
                var documentation = $('span.documentation');
                if (typeof activeParameter.documentation === 'string') {
                    dom.removeClass(this.docs, 'markdown-docs');
                    documentation.textContent = activeParameter.documentation;
                }
                else {
                    dom.addClass(this.docs, 'markdown-docs');
                    documentation.appendChild(this.markdownRenderer.render(activeParameter.documentation));
                }
                dom.append(this.docs, $('p', null, documentation));
            }
            dom.toggleClass(this.signature, 'has-docs', !!signature.documentation);
            if (typeof signature.documentation === 'string') {
                dom.append(this.docs, $('p', null, signature.documentation));
            }
            else {
                dom.append(this.docs, this.markdownRenderer.render(signature.documentation));
            }
            var currentOverload = String(this.currentSignature + 1);
            if (this.hints.signatures.length < 10) {
                currentOverload += "/" + this.hints.signatures.length;
            }
            this.overloads.textContent = currentOverload;
            if (activeParameter) {
                var labelToAnnounce = activeParameter.label;
                // Select method gets called on every user type while parameter hints are visible.
                // We do not want to spam the user with same announcements, so we only announce if the current parameter changed.
                if (this.announcedLabel !== labelToAnnounce) {
                    aria.alert(nls.localize('hint', "{0}, hint", labelToAnnounce));
                    this.announcedLabel = labelToAnnounce;
                }
            }
            this.editor.layoutContentWidget(this);
            this.scrollbar.scanDomNode();
        };
        ParameterHintsWidget.prototype.renderParameters = function (parent, signature, currentParameter) {
            var end = signature.label.length;
            var idx = 0;
            var element;
            for (var i = signature.parameters.length - 1; i >= 0; i--) {
                var parameter = signature.parameters[i];
                idx = signature.label.lastIndexOf(parameter.label, end - 1);
                var signatureLabelOffset = 0;
                var signatureLabelEnd = 0;
                if (idx >= 0) {
                    signatureLabelOffset = idx;
                    signatureLabelEnd = idx + parameter.label.length;
                }
                // non parameter part
                element = document.createElement('span');
                element.textContent = signature.label.substring(signatureLabelEnd, end);
                dom.prepend(parent, element);
                // parameter part
                element = document.createElement('span');
                element.className = "parameter " + (i === currentParameter ? 'active' : '');
                element.textContent = signature.label.substring(signatureLabelOffset, signatureLabelEnd);
                dom.prepend(parent, element);
                end = signatureLabelOffset;
            }
            // non parameter part
            element = document.createElement('span');
            element.textContent = signature.label.substring(0, end);
            dom.prepend(parent, element);
        };
        // private select(position: number): void {
        // 	const signature = this.signatureViews[position];
        // 	if (!signature) {
        // 		return;
        // 	}
        // 	this.signatures.style.height = `${ signature.height }px`;
        // 	this.signatures.scrollTop = signature.top;
        // 	let overloads = '' + (position + 1);
        // 	if (this.signatureViews.length < 10) {
        // 		overloads += '/' + this.signatureViews.length;
        // 	}
        // 	this.overloads.textContent = overloads;
        // 	if (this.hints && this.hints.signatures[position].parameters[this.hints.activeParameter]) {
        // 		const labelToAnnounce = this.hints.signatures[position].parameters[this.hints.activeParameter].label;
        // 		// Select method gets called on every user type while parameter hints are visible.
        // 		// We do not want to spam the user with same announcements, so we only announce if the current parameter changed.
        // 		if (this.announcedLabel !== labelToAnnounce) {
        // 			aria.alert(nls.localize('hint', "{0}, hint", labelToAnnounce));
        // 			this.announcedLabel = labelToAnnounce;
        // 		}
        // 	}
        // 	this.editor.layoutContentWidget(this);
        // }
        ParameterHintsWidget.prototype.next = function () {
            var length = this.hints.signatures.length;
            if (length < 2) {
                this.cancel();
                return false;
            }
            this.currentSignature = (this.currentSignature + 1) % length;
            this.render();
            return true;
        };
        ParameterHintsWidget.prototype.previous = function () {
            var length = this.hints.signatures.length;
            if (length < 2) {
                this.cancel();
                return false;
            }
            this.currentSignature = (this.currentSignature - 1 + length) % length;
            this.render();
            return true;
        };
        ParameterHintsWidget.prototype.cancel = function () {
            this.model.cancel();
        };
        ParameterHintsWidget.prototype.getDomNode = function () {
            return this.element;
        };
        ParameterHintsWidget.prototype.getId = function () {
            return ParameterHintsWidget.ID;
        };
        ParameterHintsWidget.prototype.trigger = function () {
            this.model.trigger(0);
        };
        ParameterHintsWidget.prototype.updateMaxHeight = function () {
            var height = Math.max(this.editor.getLayoutInfo().height / 4, 250);
            this.element.style.maxHeight = height + "px";
        };
        ParameterHintsWidget.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            this.model = null;
        };
        ParameterHintsWidget.ID = 'editor.widget.parameterHintsWidget';
        ParameterHintsWidget = __decorate([
            __param(1, contextkey_1.IContextKeyService),
            __param(2, opener_1.IOpenerService),
            __param(3, modeService_1.IModeService)
        ], ParameterHintsWidget);
        return ParameterHintsWidget;
    }());
    exports.ParameterHintsWidget = ParameterHintsWidget;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var border = theme.getColor(colorRegistry_1.editorHoverBorder);
        if (border) {
            var borderWidth = theme.type === themeService_1.HIGH_CONTRAST ? 2 : 1;
            collector.addRule(".monaco-editor .parameter-hints-widget { border: " + borderWidth + "px solid " + border + "; }");
            collector.addRule(".monaco-editor .parameter-hints-widget.multiple .body { border-left: 1px solid " + border.transparent(0.5) + "; }");
            collector.addRule(".monaco-editor .parameter-hints-widget .signature.has-docs { border-bottom: 1px solid " + border.transparent(0.5) + "; }");
        }
        var background = theme.getColor(colorRegistry_1.editorHoverBackground);
        if (background) {
            collector.addRule(".monaco-editor .parameter-hints-widget { background-color: " + background + "; }");
        }
        var link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(".monaco-editor .parameter-hints-widget a { color: " + link + "; }");
        }
        var codeBackground = theme.getColor(colorRegistry_1.textCodeBlockBackground);
        if (codeBackground) {
            collector.addRule(".monaco-editor .parameter-hints-widget code { background-color: " + codeBackground + "; }");
        }
    });
});
