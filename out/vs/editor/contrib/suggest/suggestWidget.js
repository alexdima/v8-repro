/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/filters", "vs/base/common/strings", "vs/base/common/event", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/editorBrowser", "./suggest", "vs/base/browser/ui/aria/aria", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/platform/storage/common/storage", "vs/editor/contrib/markdown/markdownRenderer", "vs/editor/common/services/modeService", "vs/platform/opener/common/opener", "vs/css!./media/suggest"], function (require, exports, nls, filters_1, strings, event_1, winjs_base_1, errors_1, lifecycle_1, dom_1, highlightedLabel_1, listWidget_1, scrollableElement_1, keybinding_1, contextkey_1, editorBrowser_1, suggest_1, aria_1, telemetry_1, styler_1, themeService_1, colorRegistry_1, storage_1, markdownRenderer_1, modeService_1, opener_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var sticky = false; // for development purposes
    var expandSuggestionDocsByDefault = false;
    var maxSuggestionsToShow = 12;
    /**
     * Suggest widget colors
     */
    exports.editorSuggestWidgetBackground = colorRegistry_1.registerColor('editorSuggestWidget.background', { dark: colorRegistry_1.editorWidgetBackground, light: colorRegistry_1.editorWidgetBackground, hc: colorRegistry_1.editorWidgetBackground }, nls.localize('editorSuggestWidgetBackground', 'Background color of the suggest widget.'));
    exports.editorSuggestWidgetBorder = colorRegistry_1.registerColor('editorSuggestWidget.border', { dark: colorRegistry_1.editorWidgetBorder, light: colorRegistry_1.editorWidgetBorder, hc: colorRegistry_1.editorWidgetBorder }, nls.localize('editorSuggestWidgetBorder', 'Border color of the suggest widget.'));
    exports.editorSuggestWidgetForeground = colorRegistry_1.registerColor('editorSuggestWidget.foreground', { dark: colorRegistry_1.editorForeground, light: colorRegistry_1.editorForeground, hc: colorRegistry_1.editorForeground }, nls.localize('editorSuggestWidgetForeground', 'Foreground color of the suggest widget.'));
    exports.editorSuggestWidgetSelectedBackground = colorRegistry_1.registerColor('editorSuggestWidget.selectedBackground', { dark: colorRegistry_1.listFocusBackground, light: colorRegistry_1.listFocusBackground, hc: colorRegistry_1.listFocusBackground }, nls.localize('editorSuggestWidgetSelectedBackground', 'Background color of the selected entry in the suggest widget.'));
    exports.editorSuggestWidgetHighlightForeground = colorRegistry_1.registerColor('editorSuggestWidget.highlightForeground', { dark: colorRegistry_1.listHighlightForeground, light: colorRegistry_1.listHighlightForeground, hc: colorRegistry_1.listHighlightForeground }, nls.localize('editorSuggestWidgetHighlightForeground', 'Color of the match highlights in the suggest widget.'));
    var colorRegExp = /^(#([\da-f]{3}){1,2}|(rgb|hsl)a\(\s*(\d{1,3}%?\s*,\s*){3}(1|0?\.\d+)\)|(rgb|hsl)\(\s*\d{1,3}%?(\s*,\s*\d{1,3}%?){2}\s*\))$/i;
    function matchesColor(text) {
        return text && text.match(colorRegExp) ? text : null;
    }
    function canExpandCompletionItem(item) {
        if (!item) {
            return false;
        }
        var suggestion = item.suggestion;
        if (suggestion.documentation) {
            return true;
        }
        return (suggestion.detail && suggestion.detail !== suggestion.label);
    }
    var Renderer = /** @class */ (function () {
        function Renderer(widget, editor, triggerKeybindingLabel) {
            this.widget = widget;
            this.editor = editor;
            this.triggerKeybindingLabel = triggerKeybindingLabel;
        }
        Object.defineProperty(Renderer.prototype, "templateId", {
            get: function () {
                return 'suggestion';
            },
            enumerable: true,
            configurable: true
        });
        Renderer.prototype.renderTemplate = function (container) {
            var _this = this;
            var data = Object.create(null);
            data.disposables = [];
            data.root = container;
            data.icon = dom_1.append(container, dom_1.$('.icon'));
            data.colorspan = dom_1.append(data.icon, dom_1.$('span.colorspan'));
            var text = dom_1.append(container, dom_1.$('.contents'));
            var main = dom_1.append(text, dom_1.$('.main'));
            data.highlightedLabel = new highlightedLabel_1.HighlightedLabel(main);
            data.disposables.push(data.highlightedLabel);
            data.typeLabel = dom_1.append(main, dom_1.$('span.type-label'));
            data.readMore = dom_1.append(main, dom_1.$('span.readMore'));
            data.readMore.title = nls.localize('readMore', "Read More...{0}", this.triggerKeybindingLabel);
            var configureFont = function () {
                var configuration = _this.editor.getConfiguration();
                var fontFamily = configuration.fontInfo.fontFamily;
                var fontSize = configuration.contribInfo.suggestFontSize || configuration.fontInfo.fontSize;
                var lineHeight = configuration.contribInfo.suggestLineHeight || configuration.fontInfo.lineHeight;
                var fontSizePx = fontSize + "px";
                var lineHeightPx = lineHeight + "px";
                data.root.style.fontSize = fontSizePx;
                main.style.fontFamily = fontFamily;
                main.style.lineHeight = lineHeightPx;
                data.icon.style.height = lineHeightPx;
                data.icon.style.width = lineHeightPx;
                data.readMore.style.height = lineHeightPx;
                data.readMore.style.width = lineHeightPx;
            };
            configureFont();
            event_1.chain(this.editor.onDidChangeConfiguration.bind(this.editor))
                .filter(function (e) { return e.fontInfo || e.contribInfo; })
                .on(configureFont, null, data.disposables);
            return data;
        };
        Renderer.prototype.renderElement = function (element, index, templateData) {
            var _this = this;
            var data = templateData;
            var suggestion = element.suggestion;
            if (canExpandCompletionItem(element)) {
                data.root.setAttribute('aria-label', nls.localize('suggestionWithDetailsAriaLabel', "{0}, suggestion, has details", suggestion.label));
            }
            else {
                data.root.setAttribute('aria-label', nls.localize('suggestionAriaLabel', "{0}, suggestion", suggestion.label));
            }
            data.icon.className = 'icon ' + suggestion.type;
            data.colorspan.style.backgroundColor = '';
            if (suggestion.type === 'color') {
                var color = matchesColor(suggestion.label) || typeof suggestion.documentation === 'string' && matchesColor(suggestion.documentation);
                if (color) {
                    data.icon.className = 'icon customcolor';
                    data.colorspan.style.backgroundColor = color;
                }
            }
            data.highlightedLabel.set(suggestion.label, filters_1.createMatches(element.matches));
            // data.highlightedLabel.set(`${suggestion.label} <${element.score}=score(${element.word}, ${suggestion.filterText || suggestion.label})>`, createMatches(element.matches));
            data.typeLabel.textContent = (suggestion.detail || '').replace(/\n.*$/m, '');
            if (canExpandCompletionItem(element)) {
                dom_1.show(data.readMore);
                data.readMore.onmousedown = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                };
                data.readMore.onclick = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this.widget.toggleDetails();
                };
            }
            else {
                dom_1.hide(data.readMore);
                data.readMore.onmousedown = null;
                data.readMore.onclick = null;
            }
        };
        Renderer.prototype.disposeTemplate = function (templateData) {
            templateData.highlightedLabel.dispose();
            templateData.disposables = lifecycle_1.dispose(templateData.disposables);
        };
        return Renderer;
    }());
    var State;
    (function (State) {
        State[State["Hidden"] = 0] = "Hidden";
        State[State["Loading"] = 1] = "Loading";
        State[State["Empty"] = 2] = "Empty";
        State[State["Open"] = 3] = "Open";
        State[State["Frozen"] = 4] = "Frozen";
        State[State["Details"] = 5] = "Details";
    })(State || (State = {}));
    var SuggestionDetails = /** @class */ (function () {
        function SuggestionDetails(container, widget, editor, markdownRenderer, triggerKeybindingLabel) {
            var _this = this;
            this.widget = widget;
            this.editor = editor;
            this.markdownRenderer = markdownRenderer;
            this.triggerKeybindingLabel = triggerKeybindingLabel;
            this.borderWidth = 1;
            this.disposables = [];
            this.el = dom_1.append(container, dom_1.$('.details'));
            this.disposables.push(lifecycle_1.toDisposable(function () { return container.removeChild(_this.el); }));
            this.body = dom_1.$('.body');
            this.scrollbar = new scrollableElement_1.DomScrollableElement(this.body, {});
            dom_1.append(this.el, this.scrollbar.getDomNode());
            this.disposables.push(this.scrollbar);
            this.header = dom_1.append(this.body, dom_1.$('.header'));
            this.close = dom_1.append(this.header, dom_1.$('span.close'));
            this.close.title = nls.localize('readLess', "Read less...{0}", this.triggerKeybindingLabel);
            this.type = dom_1.append(this.header, dom_1.$('p.type'));
            this.docs = dom_1.append(this.body, dom_1.$('p.docs'));
            this.ariaLabel = null;
            this.configureFont();
            event_1.chain(this.editor.onDidChangeConfiguration.bind(this.editor))
                .filter(function (e) { return e.fontInfo; })
                .on(this.configureFont, this, this.disposables);
        }
        Object.defineProperty(SuggestionDetails.prototype, "element", {
            get: function () {
                return this.el;
            },
            enumerable: true,
            configurable: true
        });
        SuggestionDetails.prototype.render = function (item) {
            var _this = this;
            if (!item || !canExpandCompletionItem(item)) {
                this.type.textContent = '';
                this.docs.textContent = '';
                dom_1.addClass(this.el, 'no-docs');
                this.ariaLabel = null;
                return;
            }
            dom_1.removeClass(this.el, 'no-docs');
            if (typeof item.suggestion.documentation === 'string') {
                dom_1.removeClass(this.docs, 'markdown-docs');
                this.docs.textContent = item.suggestion.documentation;
            }
            else {
                dom_1.addClass(this.docs, 'markdown-docs');
                this.docs.innerHTML = '';
                this.docs.appendChild(this.markdownRenderer.render(item.suggestion.documentation));
            }
            if (item.suggestion.detail) {
                this.type.innerText = item.suggestion.detail;
                dom_1.show(this.type);
            }
            else {
                this.type.innerText = '';
                dom_1.hide(this.type);
            }
            this.el.style.height = this.header.offsetHeight + this.docs.offsetHeight + (this.borderWidth * 2) + 'px';
            this.close.onmousedown = function (e) {
                e.preventDefault();
                e.stopPropagation();
            };
            this.close.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.widget.toggleDetails();
            };
            this.body.scrollTop = 0;
            this.scrollbar.scanDomNode();
            this.ariaLabel = strings.format('{0}\n{1}\n{2}', item.suggestion.label || '', item.suggestion.detail || '', item.suggestion.documentation || '');
        };
        SuggestionDetails.prototype.getAriaLabel = function () {
            return this.ariaLabel;
        };
        SuggestionDetails.prototype.scrollDown = function (much) {
            if (much === void 0) { much = 8; }
            this.body.scrollTop += much;
        };
        SuggestionDetails.prototype.scrollUp = function (much) {
            if (much === void 0) { much = 8; }
            this.body.scrollTop -= much;
        };
        SuggestionDetails.prototype.scrollTop = function () {
            this.body.scrollTop = 0;
        };
        SuggestionDetails.prototype.scrollBottom = function () {
            this.body.scrollTop = this.body.scrollHeight;
        };
        SuggestionDetails.prototype.pageDown = function () {
            this.scrollDown(80);
        };
        SuggestionDetails.prototype.pageUp = function () {
            this.scrollUp(80);
        };
        SuggestionDetails.prototype.setBorderWidth = function (width) {
            this.borderWidth = width;
        };
        SuggestionDetails.prototype.configureFont = function () {
            var configuration = this.editor.getConfiguration();
            var fontFamily = configuration.fontInfo.fontFamily;
            var fontSize = configuration.contribInfo.suggestFontSize || configuration.fontInfo.fontSize;
            var lineHeight = configuration.contribInfo.suggestLineHeight || configuration.fontInfo.lineHeight;
            var fontSizePx = fontSize + "px";
            var lineHeightPx = lineHeight + "px";
            this.el.style.fontSize = fontSizePx;
            this.type.style.fontFamily = fontFamily;
            this.close.style.height = lineHeightPx;
            this.close.style.width = lineHeightPx;
        };
        SuggestionDetails.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        return SuggestionDetails;
    }());
    var SuggestWidget = /** @class */ (function () {
        function SuggestWidget(editor, telemetryService, contextKeyService, themeService, storageService, keybindingService, modeService, openerService) {
            var _this = this;
            this.editor = editor;
            this.telemetryService = telemetryService;
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.ignoreFocusEvents = false;
            this.onDidSelectEmitter = new event_1.Emitter();
            this.onDidFocusEmitter = new event_1.Emitter();
            this.onDidHideEmitter = new event_1.Emitter();
            this.onDidShowEmitter = new event_1.Emitter();
            this.onDidSelect = this.onDidSelectEmitter.event;
            this.onDidFocus = this.onDidFocusEmitter.event;
            this.onDidHide = this.onDidHideEmitter.event;
            this.onDidShow = this.onDidShowEmitter.event;
            this.maxWidgetWidth = 660;
            this.listWidth = 330;
            this.storageServiceAvailable = true;
            this.expandSuggestionDocs = false;
            var kb = keybindingService.lookupKeybinding('editor.action.triggerSuggest');
            var triggerKeybindingLabel = !kb ? '' : " (" + kb.getLabel() + ")";
            var markdownRenderer = new markdownRenderer_1.MarkdownRenderer(editor, modeService, openerService);
            this.isAuto = false;
            this.focusedItem = null;
            this.storageService = storageService;
            if (this.expandDocsSettingFromStorage() === undefined) {
                this.storageService.store('expandSuggestionDocs', expandSuggestionDocsByDefault, storage_1.StorageScope.GLOBAL);
                if (this.expandDocsSettingFromStorage() === undefined) {
                    this.storageServiceAvailable = false;
                }
            }
            this.element = dom_1.$('.editor-widget.suggest-widget');
            if (!this.editor.getConfiguration().contribInfo.iconsInSuggestions) {
                dom_1.addClass(this.element, 'no-icons');
            }
            this.messageElement = dom_1.append(this.element, dom_1.$('.message'));
            this.listElement = dom_1.append(this.element, dom_1.$('.tree'));
            this.details = new SuggestionDetails(this.element, this, this.editor, markdownRenderer, triggerKeybindingLabel);
            var renderer = new Renderer(this, this.editor, triggerKeybindingLabel);
            this.list = new listWidget_1.List(this.listElement, this, [renderer], {
                useShadows: false,
                selectOnMouseDown: true,
                focusOnMouseDown: false
            });
            this.toDispose = [
                styler_1.attachListStyler(this.list, themeService, {
                    listInactiveFocusBackground: exports.editorSuggestWidgetSelectedBackground,
                    listInactiveFocusOutline: colorRegistry_1.activeContrastBorder
                }),
                themeService.onThemeChange(function (t) { return _this.onThemeChange(t); }),
                editor.onDidBlurEditorText(function () { return _this.onEditorBlur(); }),
                editor.onDidLayoutChange(function () { return _this.onEditorLayoutChange(); }),
                this.list.onSelectionChange(function (e) { return _this.onListSelection(e); }),
                this.list.onFocusChange(function (e) { return _this.onListFocus(e); }),
                this.editor.onDidChangeCursorSelection(function () { return _this.onCursorSelectionChanged(); })
            ];
            this.suggestWidgetVisible = suggest_1.Context.Visible.bindTo(contextKeyService);
            this.suggestWidgetMultipleSuggestions = suggest_1.Context.MultipleSuggestions.bindTo(contextKeyService);
            this.suggestionSupportsAutoAccept = suggest_1.Context.AcceptOnKey.bindTo(contextKeyService);
            this.editor.addContentWidget(this);
            this.setState(0 /* Hidden */);
            this.onThemeChange(themeService.getTheme());
            // TODO@Alex: this is useful, but spammy
            // var isVisible = false;
            // this.onDidVisibilityChange((newIsVisible) => {
            // 	if (isVisible === newIsVisible) {
            // 		return;
            // 	}
            // 	isVisible = newIsVisible;
            // 	if (isVisible) {
            // 		alert(nls.localize('suggestWidgetAriaVisible', "Suggestions opened"));
            // 	} else {
            // 		alert(nls.localize('suggestWidgetAriaInvisible', "Suggestions closed"));
            // 	}
            // });
        }
        SuggestWidget.prototype.onCursorSelectionChanged = function () {
            if (this.state === 0 /* Hidden */) {
                return;
            }
            this.editor.layoutContentWidget(this);
        };
        SuggestWidget.prototype.onEditorBlur = function () {
            var _this = this;
            if (sticky) {
                return;
            }
            this.editorBlurTimeout = winjs_base_1.TPromise.timeout(150).then(function () {
                if (!_this.editor.isFocused()) {
                    _this.setState(0 /* Hidden */);
                }
            });
        };
        SuggestWidget.prototype.onEditorLayoutChange = function () {
            if ((this.state === 3 /* Open */ || this.state === 5 /* Details */) && this.expandDocsSettingFromStorage()) {
                this.expandSideOrBelow();
            }
        };
        SuggestWidget.prototype.onListSelection = function (e) {
            var _this = this;
            if (!e.elements.length) {
                return;
            }
            var item = e.elements[0];
            var index = e.indexes[0];
            item.resolve().then(function () {
                _this.onDidSelectEmitter.fire({ item: item, index: index, model: _this.completionModel });
                aria_1.alert(nls.localize('suggestionAriaAccepted', "{0}, accepted", item.suggestion.label));
                _this.editor.focus();
            });
        };
        SuggestWidget.prototype._getSuggestionAriaAlertLabel = function (item) {
            if (canExpandCompletionItem(item)) {
                return nls.localize('ariaCurrentSuggestionWithDetails', "{0}, suggestion, has details", item.suggestion.label);
            }
            else {
                return nls.localize('ariaCurrentSuggestion', "{0}, suggestion", item.suggestion.label);
            }
        };
        SuggestWidget.prototype._ariaAlert = function (newAriaAlertLabel) {
            if (this._lastAriaAlertLabel === newAriaAlertLabel) {
                return;
            }
            this._lastAriaAlertLabel = newAriaAlertLabel;
            if (this._lastAriaAlertLabel) {
                aria_1.alert(this._lastAriaAlertLabel);
            }
        };
        SuggestWidget.prototype.onThemeChange = function (theme) {
            var backgroundColor = theme.getColor(exports.editorSuggestWidgetBackground);
            if (backgroundColor) {
                this.listElement.style.backgroundColor = backgroundColor.toString();
                this.details.element.style.backgroundColor = backgroundColor.toString();
                this.messageElement.style.backgroundColor = backgroundColor.toString();
            }
            var borderColor = theme.getColor(exports.editorSuggestWidgetBorder);
            if (borderColor) {
                this.listElement.style.borderColor = borderColor.toString();
                this.details.element.style.borderColor = borderColor.toString();
                this.messageElement.style.borderColor = borderColor.toString();
                this.detailsBorderColor = borderColor.toString();
            }
            var focusBorderColor = theme.getColor(colorRegistry_1.focusBorder);
            if (focusBorderColor) {
                this.detailsFocusBorderColor = focusBorderColor.toString();
            }
            this.details.setBorderWidth(theme.type === 'hc' ? 2 : 1);
        };
        SuggestWidget.prototype.onListFocus = function (e) {
            var _this = this;
            if (this.ignoreFocusEvents) {
                return;
            }
            if (!e.elements.length) {
                if (this.currentSuggestionDetails) {
                    this.currentSuggestionDetails.cancel();
                    this.currentSuggestionDetails = null;
                    this.focusedItem = null;
                }
                this._ariaAlert(null);
                return;
            }
            var item = e.elements[0];
            this._ariaAlert(this._getSuggestionAriaAlertLabel(item));
            if (item === this.focusedItem) {
                return;
            }
            if (this.currentSuggestionDetails) {
                this.currentSuggestionDetails.cancel();
                this.currentSuggestionDetails = null;
            }
            var index = e.indexes[0];
            this.suggestionSupportsAutoAccept.set(!item.suggestion.noAutoAccept);
            var oldFocus = this.focusedItem;
            var oldFocusIndex = this.focusedItemIndex;
            this.focusedItemIndex = index;
            this.focusedItem = item;
            if (oldFocus) {
                this.ignoreFocusEvents = true;
                this.list.splice(oldFocusIndex, 1, [oldFocus]);
                this.ignoreFocusEvents = false;
            }
            this.list.reveal(index);
            this.currentSuggestionDetails = item.resolve()
                .then(function () {
                _this.ignoreFocusEvents = true;
                _this.list.splice(index, 1, [item]);
                _this.ignoreFocusEvents = false;
                _this.list.setFocus([index]);
                _this.list.reveal(index);
                if (_this.expandDocsSettingFromStorage()) {
                    _this.showDetails();
                }
                else {
                    dom_1.removeClass(_this.element, 'docs-side');
                }
            })
                .then(null, function (err) { return !errors_1.isPromiseCanceledError(err) && errors_1.onUnexpectedError(err); })
                .then(function () { return _this.currentSuggestionDetails = null; });
            // emit an event
            this.onDidFocusEmitter.fire({ item: item, index: index, model: this.completionModel });
        };
        SuggestWidget.prototype.setState = function (state) {
            if (!this.element) {
                return;
            }
            var stateChanged = this.state !== state;
            this.state = state;
            dom_1.toggleClass(this.element, 'frozen', state === 4 /* Frozen */);
            switch (state) {
                case 0 /* Hidden */:
                    dom_1.hide(this.messageElement, this.details.element, this.listElement);
                    this.hide();
                    if (stateChanged) {
                        this.list.splice(0, this.list.length);
                    }
                    break;
                case 1 /* Loading */:
                    this.messageElement.textContent = SuggestWidget.LOADING_MESSAGE;
                    dom_1.hide(this.listElement, this.details.element);
                    dom_1.show(this.messageElement);
                    dom_1.removeClass(this.element, 'docs-side');
                    this.show();
                    break;
                case 2 /* Empty */:
                    this.messageElement.textContent = SuggestWidget.NO_SUGGESTIONS_MESSAGE;
                    dom_1.hide(this.listElement, this.details.element);
                    dom_1.show(this.messageElement);
                    dom_1.removeClass(this.element, 'docs-side');
                    this.show();
                    break;
                case 3 /* Open */:
                    dom_1.hide(this.messageElement, this.details.element);
                    dom_1.show(this.listElement);
                    this.show();
                    break;
                case 4 /* Frozen */:
                    dom_1.hide(this.messageElement);
                    dom_1.show(this.listElement);
                    this.show();
                    break;
                case 5 /* Details */:
                    dom_1.hide(this.messageElement);
                    dom_1.show(this.details.element, this.listElement);
                    this.show();
                    this._ariaAlert(this.details.getAriaLabel());
                    break;
            }
            if (stateChanged && this.state !== 0 /* Hidden */) {
                this.editor.layoutContentWidget(this);
            }
        };
        SuggestWidget.prototype.showTriggered = function (auto) {
            var _this = this;
            if (this.state !== 0 /* Hidden */) {
                return;
            }
            this.isAuto = !!auto;
            if (!this.isAuto) {
                this.loadingTimeout = setTimeout(function () {
                    _this.loadingTimeout = null;
                    _this.setState(1 /* Loading */);
                }, 50);
            }
        };
        SuggestWidget.prototype.showSuggestions = function (completionModel, selectionIndex, isFrozen, isAuto) {
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }
            this.completionModel = completionModel;
            if (isFrozen && this.state !== 2 /* Empty */ && this.state !== 0 /* Hidden */) {
                this.setState(4 /* Frozen */);
                return;
            }
            var visibleCount = this.completionModel.items.length;
            var isEmpty = visibleCount === 0;
            this.suggestWidgetMultipleSuggestions.set(visibleCount > 1);
            if (isEmpty) {
                if (isAuto) {
                    this.setState(0 /* Hidden */);
                }
                else {
                    this.setState(2 /* Empty */);
                }
                this.completionModel = null;
            }
            else {
                var stats = this.completionModel.stats;
                stats['wasAutomaticallyTriggered'] = !!isAuto;
                /* __GDPR__
                    "suggestWidget" : {
                        "wasAutomaticallyTriggered" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "${include}": [
                            "${ICompletionStats}",
                            "${EditorTelemetryData}"
                        ]
                    }
                */
                this.telemetryService.publicLog('suggestWidget', __assign({}, stats, this.editor.getTelemetryData()));
                this.focusedItem = null;
                this.focusedItemIndex = null;
                this.list.splice(0, this.list.length, this.completionModel.items);
                this.list.reveal(selectionIndex, selectionIndex);
                if (isFrozen) {
                    this.setState(4 /* Frozen */);
                }
                else {
                    this.setState(3 /* Open */);
                }
                this.list.setFocus([selectionIndex]);
                // Reset focus border
                if (this.detailsBorderColor) {
                    this.details.element.style.borderColor = this.detailsBorderColor;
                }
            }
        };
        SuggestWidget.prototype.selectNextPage = function () {
            switch (this.state) {
                case 0 /* Hidden */:
                    return false;
                case 5 /* Details */:
                    this.details.pageDown();
                    return true;
                case 1 /* Loading */:
                    return !this.isAuto;
                default:
                    this.list.focusNextPage();
                    return true;
            }
        };
        SuggestWidget.prototype.selectNext = function () {
            switch (this.state) {
                case 0 /* Hidden */:
                    return false;
                case 1 /* Loading */:
                    return !this.isAuto;
                default:
                    this.list.focusNext(1, true);
                    return true;
            }
        };
        SuggestWidget.prototype.selectLast = function () {
            switch (this.state) {
                case 0 /* Hidden */:
                    return false;
                case 5 /* Details */:
                    this.details.scrollBottom();
                    return true;
                case 1 /* Loading */:
                    return !this.isAuto;
                default:
                    this.list.focusLast();
                    return true;
            }
        };
        SuggestWidget.prototype.selectPreviousPage = function () {
            switch (this.state) {
                case 0 /* Hidden */:
                    return false;
                case 5 /* Details */:
                    this.details.pageUp();
                    return true;
                case 1 /* Loading */:
                    return !this.isAuto;
                default:
                    this.list.focusPreviousPage();
                    return true;
            }
        };
        SuggestWidget.prototype.selectPrevious = function () {
            switch (this.state) {
                case 0 /* Hidden */:
                    return false;
                case 1 /* Loading */:
                    return !this.isAuto;
                default:
                    this.list.focusPrevious(1, true);
                    return false;
            }
        };
        SuggestWidget.prototype.selectFirst = function () {
            switch (this.state) {
                case 0 /* Hidden */:
                    return false;
                case 5 /* Details */:
                    this.details.scrollTop();
                    return true;
                case 1 /* Loading */:
                    return !this.isAuto;
                default:
                    this.list.focusFirst();
                    return true;
            }
        };
        SuggestWidget.prototype.getFocusedItem = function () {
            if (this.state !== 0 /* Hidden */
                && this.state !== 2 /* Empty */
                && this.state !== 1 /* Loading */) {
                return {
                    item: this.list.getFocusedElements()[0],
                    index: this.list.getFocus()[0],
                    model: this.completionModel
                };
            }
            return undefined;
        };
        SuggestWidget.prototype.toggleDetailsFocus = function () {
            if (this.state === 5 /* Details */) {
                this.setState(3 /* Open */);
                if (this.detailsBorderColor) {
                    this.details.element.style.borderColor = this.detailsBorderColor;
                }
            }
            else if (this.state === 3 /* Open */ && this.expandDocsSettingFromStorage()) {
                this.setState(5 /* Details */);
                if (this.detailsFocusBorderColor) {
                    this.details.element.style.borderColor = this.detailsFocusBorderColor;
                }
            }
            /* __GDPR__
                "suggestWidget:toggleDetailsFocus" : {
                    "${include}": [
                        "${EditorTelemetryData}"
                    ]
                }
            */
            this.telemetryService.publicLog('suggestWidget:toggleDetailsFocus', this.editor.getTelemetryData());
        };
        SuggestWidget.prototype.toggleDetails = function () {
            if (!canExpandCompletionItem(this.list.getFocusedElements()[0])) {
                return;
            }
            if (this.expandDocsSettingFromStorage()) {
                this.updateExpandDocsSetting(false);
                dom_1.hide(this.details.element);
                dom_1.removeClass(this.element, 'docs-side');
                dom_1.removeClass(this.element, 'docs-below');
                this.editor.layoutContentWidget(this);
                /* __GDPR__
                    "suggestWidget:collapseDetails" : {
                        "${include}": [
                            "${EditorTelemetryData}"
                        ]
                    }
                */
                this.telemetryService.publicLog('suggestWidget:collapseDetails', this.editor.getTelemetryData());
            }
            else {
                if (this.state !== 3 /* Open */ && this.state !== 5 /* Details */) {
                    return;
                }
                this.updateExpandDocsSetting(true);
                this.showDetails();
                /* __GDPR__
                    "suggestWidget:expandDetails" : {
                        "${include}": [
                            "${EditorTelemetryData}"
                        ]
                    }
                */
                this.telemetryService.publicLog('suggestWidget:expandDetails', this.editor.getTelemetryData());
            }
        };
        SuggestWidget.prototype.showDetails = function () {
            this.expandSideOrBelow();
            dom_1.show(this.details.element);
            this.details.render(this.list.getFocusedElements()[0]);
            this.details.element.style.maxHeight = this.maxWidgetHeight + 'px';
            // Reset margin-top that was set as Fix for #26416
            this.listElement.style.marginTop = '0px';
            // with docs showing up widget width/height may change, so reposition the widget
            this.editor.layoutContentWidget(this);
            this.adjustDocsPosition();
            this.editor.focus();
            this._ariaAlert(this.details.getAriaLabel());
        };
        SuggestWidget.prototype.show = function () {
            var _this = this;
            this.updateListHeight();
            this.suggestWidgetVisible.set(true);
            this.showTimeout = winjs_base_1.TPromise.timeout(100).then(function () {
                dom_1.addClass(_this.element, 'visible');
                _this.onDidShowEmitter.fire(_this);
            });
        };
        SuggestWidget.prototype.hide = function () {
            this.suggestWidgetVisible.reset();
            this.suggestWidgetMultipleSuggestions.reset();
            dom_1.removeClass(this.element, 'visible');
        };
        SuggestWidget.prototype.hideWidget = function () {
            clearTimeout(this.loadingTimeout);
            this.setState(0 /* Hidden */);
            this.onDidHideEmitter.fire(this);
        };
        SuggestWidget.prototype.getPosition = function () {
            if (this.state === 0 /* Hidden */) {
                return null;
            }
            return {
                position: this.editor.getPosition(),
                preference: [editorBrowser_1.ContentWidgetPositionPreference.BELOW, editorBrowser_1.ContentWidgetPositionPreference.ABOVE]
            };
        };
        SuggestWidget.prototype.getDomNode = function () {
            return this.element;
        };
        SuggestWidget.prototype.getId = function () {
            return SuggestWidget.ID;
        };
        SuggestWidget.prototype.updateListHeight = function () {
            var height = 0;
            if (this.state === 2 /* Empty */ || this.state === 1 /* Loading */) {
                height = this.unfocusedHeight;
            }
            else {
                var suggestionCount = this.list.contentHeight / this.unfocusedHeight;
                height = Math.min(suggestionCount, maxSuggestionsToShow) * this.unfocusedHeight;
            }
            this.element.style.lineHeight = this.unfocusedHeight + "px";
            this.listElement.style.height = height + "px";
            this.list.layout(height);
        };
        SuggestWidget.prototype.adjustDocsPosition = function () {
            var lineHeight = this.editor.getConfiguration().fontInfo.lineHeight;
            var cursorCoords = this.editor.getScrolledVisiblePosition(this.editor.getPosition());
            var editorCoords = dom_1.getDomNodePagePosition(this.editor.getDomNode());
            var cursorX = editorCoords.left + cursorCoords.left;
            var cursorY = editorCoords.top + cursorCoords.top + cursorCoords.height;
            var widgetCoords = dom_1.getDomNodePagePosition(this.element);
            var widgetX = widgetCoords.left;
            var widgetY = widgetCoords.top;
            if (widgetX < cursorX - this.listWidth) {
                // Widget is too far to the left of cursor, swap list and docs
                dom_1.addClass(this.element, 'list-right');
            }
            else {
                dom_1.removeClass(this.element, 'list-right');
            }
            // Compare top of the cursor (cursorY - lineheight) with widgetTop to determine if
            // margin-top needs to be applied on list to make it appear right above the cursor
            // Cannot compare cursorY directly as it may be a few decimals off due to zoooming
            if (dom_1.hasClass(this.element, 'docs-side')
                && cursorY - lineHeight > widgetY
                && this.details.element.offsetHeight > this.listElement.offsetHeight) {
                // Fix for #26416
                // Docs is bigger than list and widget is above cursor, apply margin-top so that list appears right above cursor
                this.listElement.style.marginTop = this.details.element.offsetHeight - this.listElement.offsetHeight + "px";
            }
        };
        SuggestWidget.prototype.expandSideOrBelow = function () {
            var matches = this.element.style.maxWidth.match(/(\d+)px/);
            if (!matches || Number(matches[1]) < this.maxWidgetWidth) {
                dom_1.addClass(this.element, 'docs-below');
                dom_1.removeClass(this.element, 'docs-side');
            }
            else {
                dom_1.addClass(this.element, 'docs-side');
                dom_1.removeClass(this.element, 'docs-below');
            }
        };
        Object.defineProperty(SuggestWidget.prototype, "maxWidgetHeight", {
            // Heights
            get: function () {
                return this.unfocusedHeight * maxSuggestionsToShow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SuggestWidget.prototype, "unfocusedHeight", {
            get: function () {
                var configuration = this.editor.getConfiguration();
                return configuration.contribInfo.suggestLineHeight || configuration.fontInfo.lineHeight;
            },
            enumerable: true,
            configurable: true
        });
        // IDelegate
        SuggestWidget.prototype.getHeight = function (element) {
            return this.unfocusedHeight;
        };
        SuggestWidget.prototype.getTemplateId = function (element) {
            return 'suggestion';
        };
        // Monaco Editor does not have a storage service
        SuggestWidget.prototype.expandDocsSettingFromStorage = function () {
            if (this.storageServiceAvailable) {
                return this.storageService.getBoolean('expandSuggestionDocs', storage_1.StorageScope.GLOBAL);
            }
            else {
                return this.expandSuggestionDocs;
            }
        };
        // Monaco Editor does not have a storage service
        SuggestWidget.prototype.updateExpandDocsSetting = function (value) {
            if (this.storageServiceAvailable) {
                this.storageService.store('expandSuggestionDocs', value, storage_1.StorageScope.GLOBAL);
            }
            else {
                this.expandSuggestionDocs = value;
            }
        };
        SuggestWidget.prototype.dispose = function () {
            this.state = null;
            this.suggestionSupportsAutoAccept = null;
            this.currentSuggestionDetails = null;
            this.focusedItem = null;
            this.element = null;
            this.messageElement = null;
            this.listElement = null;
            this.details.dispose();
            this.details = null;
            this.list.dispose();
            this.list = null;
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }
            if (this.editorBlurTimeout) {
                this.editorBlurTimeout.cancel();
                this.editorBlurTimeout = null;
            }
            if (this.showTimeout) {
                this.showTimeout.cancel();
                this.showTimeout = null;
            }
        };
        SuggestWidget.ID = 'editor.widget.suggestWidget';
        SuggestWidget.LOADING_MESSAGE = nls.localize('suggestWidget.loading', "Loading...");
        SuggestWidget.NO_SUGGESTIONS_MESSAGE = nls.localize('suggestWidget.noSuggestions', "No suggestions.");
        SuggestWidget = __decorate([
            __param(1, telemetry_1.ITelemetryService),
            __param(2, contextkey_1.IContextKeyService),
            __param(3, themeService_1.IThemeService),
            __param(4, storage_1.IStorageService),
            __param(5, keybinding_1.IKeybindingService),
            __param(6, modeService_1.IModeService),
            __param(7, opener_1.IOpenerService)
        ], SuggestWidget);
        return SuggestWidget;
    }());
    exports.SuggestWidget = SuggestWidget;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var matchHighlight = theme.getColor(exports.editorSuggestWidgetHighlightForeground);
        if (matchHighlight) {
            collector.addRule(".monaco-editor .suggest-widget .monaco-list .monaco-list-row .monaco-highlighted-label .highlight { color: " + matchHighlight + "; }");
        }
        var foreground = theme.getColor(exports.editorSuggestWidgetForeground);
        if (foreground) {
            collector.addRule(".monaco-editor .suggest-widget { color: " + foreground + "; }");
        }
        var link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(".monaco-editor .suggest-widget a { color: " + link + "; }");
        }
        var codeBackground = theme.getColor(colorRegistry_1.textCodeBlockBackground);
        if (codeBackground) {
            collector.addRule(".monaco-editor .suggest-widget code { background-color: " + codeBackground + "; }");
        }
    });
});
