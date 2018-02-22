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
define(["require", "exports", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/scrollable", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/base/browser/builder", "vs/base/common/lifecycle", "vs/workbench/browser/parts/editor/baseEditor", "vs/platform/telemetry/common/telemetry", "vs/workbench/parts/welcome/walkThrough/node/walkThroughInput", "vs/platform/opener/common/opener", "vs/base/common/marked/marked", "vs/editor/common/services/modelService", "vs/editor/browser/codeEditor", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/nls", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/base/common/types", "vs/platform/commands/common/commands", "vs/editor/browser/services/codeEditorService", "vs/platform/message/common/message", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/parts/welcome/walkThrough/node/walkThroughUtils", "vs/base/common/keybindingLabels", "vs/base/common/platform", "vs/base/common/objects", "vs/css!./walkThroughPart"], function (require, exports, scrollableElement_1, scrollable_1, strings, uri_1, winjs_base_1, builder_1, lifecycle_1, baseEditor_1, telemetry_1, walkThroughInput_1, opener_1, marked_1, modelService_1, codeEditor_1, instantiation_1, keybinding_1, nls_1, storage_1, memento_1, contextkey_1, configuration_1, event_1, types_1, commands_1, codeEditorService_1, message_1, themeService_1, colorRegistry_1, walkThroughUtils_1, keybindingLabels_1, platform_1, objects_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WALK_THROUGH_FOCUS = new contextkey_1.RawContextKey('interactivePlaygroundFocus', false);
    var UNBOUND_COMMAND = nls_1.localize('walkThrough.unboundCommand', "unbound");
    var WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'walkThroughEditorViewState';
    var WalkThroughCodeEditor = /** @class */ (function (_super) {
        __extends(WalkThroughCodeEditor, _super);
        function WalkThroughCodeEditor(domElement, options, telemetryData, instantiationService, codeEditorService, commandService, contextKeyService, themeService) {
            var _this = _super.call(this, domElement, options, instantiationService, codeEditorService, commandService, contextKeyService, themeService) || this;
            _this.telemetryData = telemetryData;
            return _this;
        }
        WalkThroughCodeEditor.prototype.getTelemetryData = function () {
            return this.telemetryData;
        };
        WalkThroughCodeEditor = __decorate([
            __param(3, instantiation_1.IInstantiationService),
            __param(4, codeEditorService_1.ICodeEditorService),
            __param(5, commands_1.ICommandService),
            __param(6, contextkey_1.IContextKeyService),
            __param(7, themeService_1.IThemeService)
        ], WalkThroughCodeEditor);
        return WalkThroughCodeEditor;
    }(codeEditor_1.CodeEditor));
    var WalkThroughPart = /** @class */ (function (_super) {
        __extends(WalkThroughPart, _super);
        function WalkThroughPart(telemetryService, instantiationService, themeService, openerService, modelService, keybindingService, storageService, contextKeyService, configurationService, messageService) {
            var _this = _super.call(this, WalkThroughPart.ID, telemetryService, themeService) || this;
            _this.instantiationService = instantiationService;
            _this.themeService = themeService;
            _this.openerService = openerService;
            _this.modelService = modelService;
            _this.keybindingService = keybindingService;
            _this.storageService = storageService;
            _this.contextKeyService = contextKeyService;
            _this.configurationService = configurationService;
            _this.messageService = messageService;
            _this.disposables = [];
            _this.contentDisposables = [];
            _this.editorFocus = exports.WALK_THROUGH_FOCUS.bindTo(_this.contextKeyService);
            return _this;
        }
        WalkThroughPart.prototype.createEditor = function (parent) {
            var _this = this;
            var container = parent.getHTMLElement();
            this.content = document.createElement('div');
            this.content.tabIndex = 0;
            this.content.style.outlineStyle = 'none';
            this.scrollbar = new scrollableElement_1.DomScrollableElement(this.content, {
                horizontal: scrollable_1.ScrollbarVisibility.Auto,
                vertical: scrollable_1.ScrollbarVisibility.Auto
            });
            this.disposables.push(this.scrollbar);
            container.appendChild(this.scrollbar.getDomNode());
            this.registerFocusHandlers();
            this.registerClickHandler();
            this.disposables.push(this.scrollbar.onScroll(function (e) { return _this.updatedScrollPosition(); }));
        };
        WalkThroughPart.prototype.updatedScrollPosition = function () {
            var scrollDimensions = this.scrollbar.getScrollDimensions();
            var scrollPosition = this.scrollbar.getScrollPosition();
            var scrollHeight = scrollDimensions.scrollHeight;
            if (scrollHeight && this.input instanceof walkThroughInput_1.WalkThroughInput) {
                var scrollTop = scrollPosition.scrollTop;
                var height = scrollDimensions.height;
                this.input.relativeScrollPosition(scrollTop / scrollHeight, (scrollTop + height) / scrollHeight);
            }
        };
        WalkThroughPart.prototype.addEventListener = function (element, type, listener, useCapture) {
            element.addEventListener(type, listener, useCapture);
            return { dispose: function () { element.removeEventListener(type, listener, useCapture); } };
        };
        WalkThroughPart.prototype.registerFocusHandlers = function () {
            var _this = this;
            this.disposables.push(this.addEventListener(this.content, 'mousedown', function (e) {
                _this.focus();
            }));
            this.disposables.push(this.addEventListener(this.content, 'focus', function (e) {
                _this.editorFocus.set(true);
            }));
            this.disposables.push(this.addEventListener(this.content, 'blur', function (e) {
                _this.editorFocus.reset();
            }));
            this.disposables.push(this.addEventListener(this.content, 'focusin', function (e) {
                // Work around scrolling as side-effect of setting focus on the offscreen zone widget (#18929)
                if (e.target instanceof HTMLElement && e.target.classList.contains('zone-widget-container')) {
                    var scrollPosition = _this.scrollbar.getScrollPosition();
                    _this.content.scrollTop = scrollPosition.scrollTop;
                    _this.content.scrollLeft = scrollPosition.scrollLeft;
                }
            }));
        };
        WalkThroughPart.prototype.registerClickHandler = function () {
            var _this = this;
            this.content.addEventListener('click', function (event) {
                for (var node = event.target; node; node = node.parentNode) {
                    if (node instanceof HTMLAnchorElement && node.href) {
                        var baseElement = window.document.getElementsByTagName('base')[0] || window.location;
                        if (baseElement && node.href.indexOf(baseElement.href) >= 0 && node.hash) {
                            var scrollTarget = _this.content.querySelector(node.hash);
                            var innerContent = _this.content.firstElementChild;
                            if (scrollTarget && innerContent) {
                                var targetTop = scrollTarget.getBoundingClientRect().top - 20;
                                var containerTop = innerContent.getBoundingClientRect().top;
                                _this.scrollbar.setScrollPosition({ scrollTop: targetTop - containerTop });
                            }
                        }
                        else {
                            _this.open(uri_1.default.parse(node.href));
                        }
                        event.preventDefault();
                        break;
                    }
                    else if (node instanceof HTMLButtonElement) {
                        var href = node.getAttribute('data-href');
                        if (href) {
                            _this.open(uri_1.default.parse(href));
                        }
                        break;
                    }
                    else if (node === event.currentTarget) {
                        break;
                    }
                }
            });
        };
        WalkThroughPart.prototype.open = function (uri) {
            if (uri.scheme === 'command' && uri.path === 'git.clone' && !commands_1.CommandsRegistry.getCommand('git.clone')) {
                this.messageService.show(message_1.Severity.Info, nls_1.localize('walkThrough.gitNotFound', "It looks like Git is not installed on your system."));
                return;
            }
            this.openerService.open(this.addFrom(uri));
        };
        WalkThroughPart.prototype.addFrom = function (uri) {
            if (uri.scheme !== 'command' || !(this.input instanceof walkThroughInput_1.WalkThroughInput)) {
                return uri;
            }
            var query = uri.query ? JSON.parse(uri.query) : {};
            query.from = this.input.getTelemetryFrom();
            return uri.with({ query: JSON.stringify(query) });
        };
        WalkThroughPart.prototype.layout = function (size) {
            this.size = size;
            builder_1.$(this.content).style({ height: size.height + "px", width: size.width + "px" });
            this.updateSizeClasses();
            this.contentDisposables.forEach(function (disposable) {
                if (disposable instanceof codeEditor_1.CodeEditor) {
                    disposable.layout();
                }
            });
            this.scrollbar.scanDomNode();
        };
        WalkThroughPart.prototype.updateSizeClasses = function () {
            var innerContent = this.content.firstElementChild;
            if (this.size && innerContent) {
                var classList = innerContent.classList;
                classList[this.size.height <= 685 ? 'add' : 'remove']('max-height-685px');
            }
        };
        WalkThroughPart.prototype.focus = function () {
            var active = document.activeElement;
            while (active && active !== this.content) {
                active = active.parentElement;
            }
            if (!active) {
                this.content.focus();
            }
            this.editorFocus.set(true);
        };
        WalkThroughPart.prototype.arrowUp = function () {
            var scrollPosition = this.scrollbar.getScrollPosition();
            this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - this.getArrowScrollHeight() });
        };
        WalkThroughPart.prototype.arrowDown = function () {
            var scrollPosition = this.scrollbar.getScrollPosition();
            this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop + this.getArrowScrollHeight() });
        };
        WalkThroughPart.prototype.getArrowScrollHeight = function () {
            var fontSize = this.configurationService.getValue('editor.fontSize');
            if (typeof fontSize !== 'number' || fontSize < 1) {
                fontSize = 12;
            }
            return 3 * fontSize;
        };
        WalkThroughPart.prototype.pageUp = function () {
            var scrollDimensions = this.scrollbar.getScrollDimensions();
            var scrollPosition = this.scrollbar.getScrollPosition();
            this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - scrollDimensions.height });
        };
        WalkThroughPart.prototype.pageDown = function () {
            var scrollDimensions = this.scrollbar.getScrollDimensions();
            var scrollPosition = this.scrollbar.getScrollPosition();
            this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop + scrollDimensions.height });
        };
        WalkThroughPart.prototype.setInput = function (input, options) {
            var _this = this;
            if (this.input instanceof walkThroughInput_1.WalkThroughInput && this.input.matches(input)) {
                return winjs_base_1.TPromise.as(undefined);
            }
            if (this.input instanceof walkThroughInput_1.WalkThroughInput) {
                this.saveTextEditorViewState(this.input.getResource());
            }
            this.contentDisposables = lifecycle_1.dispose(this.contentDisposables);
            this.content.innerHTML = '';
            return _super.prototype.setInput.call(this, input, options)
                .then(function () {
                return input.resolve(true);
            })
                .then(function (model) {
                var content = model.main.textEditorModel.getLinesContent().join('\n');
                if (!strings.endsWith(input.getResource().path, '.md')) {
                    _this.content.innerHTML = content;
                    _this.updateSizeClasses();
                    _this.decorateContent();
                    _this.contentDisposables.push(_this.keybindingService.onDidUpdateKeybindings(function () { return _this.decorateContent(); }));
                    if (input.onReady) {
                        input.onReady(_this.content.firstElementChild);
                    }
                    _this.scrollbar.scanDomNode();
                    _this.loadTextEditorViewState(input.getResource());
                    _this.updatedScrollPosition();
                    return;
                }
                var i = 0;
                var renderer = new marked_1.marked.Renderer();
                renderer.code = function (code, lang) {
                    var id = "snippet-" + model.snippets[i++].textEditorModel.uri.fragment;
                    return "<div id=\"" + id + "\" class=\"walkThroughEditorContainer\" ></div>";
                };
                var innerContent = document.createElement('div');
                innerContent.classList.add('walkThroughContent'); // only for markdown files
                var markdown = _this.expandMacros(content);
                innerContent.innerHTML = marked_1.marked(markdown, { renderer: renderer });
                _this.content.appendChild(innerContent);
                model.snippets.forEach(function (snippet, i) {
                    var model = snippet.textEditorModel;
                    var id = "snippet-" + model.uri.fragment;
                    var div = innerContent.querySelector("#" + id.replace(/\./g, '\\.'));
                    var options = _this.getEditorOptions(snippet.textEditorModel.getModeId());
                    /* __GDPR__FRAGMENT__
                        "EditorTelemetryData" : {
                            "target" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "snippet": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                        }
                    */
                    var telemetryData = {
                        target: _this.input instanceof walkThroughInput_1.WalkThroughInput ? _this.input.getTelemetryFrom() : undefined,
                        snippet: i
                    };
                    var editor = _this.instantiationService.createInstance(WalkThroughCodeEditor, div, options, telemetryData);
                    editor.setModel(model);
                    _this.contentDisposables.push(editor);
                    var updateHeight = function (initial) {
                        var lineHeight = editor.getConfiguration().lineHeight;
                        var height = Math.max(model.getLineCount() + 1, 4) * lineHeight + "px";
                        if (div.style.height !== height) {
                            div.style.height = height;
                            editor.layout();
                            if (!initial) {
                                _this.scrollbar.scanDomNode();
                            }
                        }
                    };
                    updateHeight(true);
                    _this.contentDisposables.push(editor.onDidChangeModelContent(function () { return updateHeight(false); }));
                    _this.contentDisposables.push(editor.onDidChangeCursorPosition(function (e) {
                        var innerContent = _this.content.firstElementChild;
                        if (innerContent) {
                            var targetTop = div.getBoundingClientRect().top;
                            var containerTop = innerContent.getBoundingClientRect().top;
                            var lineHeight = editor.getConfiguration().lineHeight;
                            var lineTop = (targetTop + (e.position.lineNumber - 1) * lineHeight) - containerTop;
                            var lineBottom = lineTop + lineHeight;
                            var scrollDimensions = _this.scrollbar.getScrollDimensions();
                            var scrollPosition = _this.scrollbar.getScrollPosition();
                            var scrollTop = scrollPosition.scrollTop;
                            var height = scrollDimensions.height;
                            if (scrollTop > lineTop) {
                                _this.scrollbar.setScrollPosition({ scrollTop: lineTop });
                            }
                            else if (scrollTop < lineBottom - height) {
                                _this.scrollbar.setScrollPosition({ scrollTop: lineBottom - height });
                            }
                        }
                    }));
                    _this.contentDisposables.push(_this.configurationService.onDidChangeConfiguration(function () {
                        if (snippet.textEditorModel) {
                            editor.updateOptions(_this.getEditorOptions(snippet.textEditorModel.getModeId()));
                        }
                    }));
                    _this.contentDisposables.push(event_1.once(editor.onMouseDown)(function () {
                        /* __GDPR__
                            "walkThroughSnippetInteraction" : {
                                "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                "type": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                "snippet": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                            }
                        */
                        _this.telemetryService.publicLog('walkThroughSnippetInteraction', {
                            from: _this.input instanceof walkThroughInput_1.WalkThroughInput ? _this.input.getTelemetryFrom() : undefined,
                            type: 'mouseDown',
                            snippet: i
                        });
                    }));
                    _this.contentDisposables.push(event_1.once(editor.onKeyDown)(function () {
                        /* __GDPR__
                            "walkThroughSnippetInteraction" : {
                                "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                "type": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                "snippet": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                            }
                        */
                        _this.telemetryService.publicLog('walkThroughSnippetInteraction', {
                            from: _this.input instanceof walkThroughInput_1.WalkThroughInput ? _this.input.getTelemetryFrom() : undefined,
                            type: 'keyDown',
                            snippet: i
                        });
                    }));
                    _this.contentDisposables.push(event_1.once(editor.onDidChangeModelContent)(function () {
                        /* __GDPR__
                            "walkThroughSnippetInteraction" : {
                                "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                "type": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                "snippet": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                            }
                        */
                        _this.telemetryService.publicLog('walkThroughSnippetInteraction', {
                            from: _this.input instanceof walkThroughInput_1.WalkThroughInput ? _this.input.getTelemetryFrom() : undefined,
                            type: 'changeModelContent',
                            snippet: i
                        });
                    }));
                });
                _this.updateSizeClasses();
                _this.multiCursorModifier();
                _this.contentDisposables.push(_this.configurationService.onDidChangeConfiguration(function (e) {
                    if (e.affectsConfiguration('editor.multiCursorModifier')) {
                        _this.multiCursorModifier();
                    }
                }));
                if (input.onReady) {
                    input.onReady(innerContent);
                }
                _this.scrollbar.scanDomNode();
                _this.loadTextEditorViewState(input.getResource());
                _this.updatedScrollPosition();
            });
        };
        WalkThroughPart.prototype.getEditorOptions = function (language) {
            var config = objects_1.deepClone(this.configurationService.getValue('editor', { overrideIdentifier: language }));
            return __assign({}, types_1.isObject(config) ? config : Object.create(null), { scrollBeyondLastLine: false, scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false
                }, overviewRulerLanes: 3, fixedOverflowWidgets: true, lineNumbersMinChars: 1, minimap: { enabled: false } });
        };
        WalkThroughPart.prototype.expandMacros = function (input) {
            var _this = this;
            return input.replace(/kb\(([a-z.\d\-]+)\)/gi, function (match, kb) {
                var keybinding = _this.keybindingService.lookupKeybinding(kb);
                var shortcut = keybinding ? keybinding.getLabel() : UNBOUND_COMMAND;
                return "<span class=\"shortcut\">" + strings.escape(shortcut) + "</span>";
            });
        };
        WalkThroughPart.prototype.decorateContent = function () {
            var _this = this;
            var keys = this.content.querySelectorAll('.shortcut[data-command]');
            Array.prototype.forEach.call(keys, function (key) {
                var command = key.getAttribute('data-command');
                var keybinding = command && _this.keybindingService.lookupKeybinding(command);
                var label = keybinding ? keybinding.getLabel() : UNBOUND_COMMAND;
                while (key.firstChild) {
                    key.removeChild(key.firstChild);
                }
                key.appendChild(document.createTextNode(label));
            });
            var ifkeys = this.content.querySelectorAll('.if_shortcut[data-command]');
            Array.prototype.forEach.call(ifkeys, function (key) {
                var command = key.getAttribute('data-command');
                var keybinding = command && _this.keybindingService.lookupKeybinding(command);
                key.style.display = !keybinding ? 'none' : '';
            });
        };
        WalkThroughPart.prototype.multiCursorModifier = function () {
            var labels = keybindingLabels_1.UILabelProvider.modifierLabels[platform_1.OS];
            var value = this.configurationService.getValue('editor.multiCursorModifier');
            var modifier = labels[value === 'ctrlCmd' ? (platform_1.OS === 2 /* Macintosh */ ? 'metaKey' : 'ctrlKey') : 'altKey'];
            var keys = this.content.querySelectorAll('.multi-cursor-modifier');
            Array.prototype.forEach.call(keys, function (key) {
                while (key.firstChild) {
                    key.removeChild(key.firstChild);
                }
                key.appendChild(document.createTextNode(modifier));
            });
        };
        WalkThroughPart.prototype.saveTextEditorViewState = function (resource) {
            var memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            var editorViewStateMemento = memento[WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY];
            if (!editorViewStateMemento) {
                editorViewStateMemento = Object.create(null);
                memento[WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY] = editorViewStateMemento;
            }
            var scrollPosition = this.scrollbar.getScrollPosition();
            var editorViewState = {
                viewState: {
                    scrollTop: scrollPosition.scrollTop,
                    scrollLeft: scrollPosition.scrollLeft
                }
            };
            var fileViewState = editorViewStateMemento[resource.toString()];
            if (!fileViewState) {
                fileViewState = Object.create(null);
                editorViewStateMemento[resource.toString()] = fileViewState;
            }
            if (typeof this.position === 'number') {
                fileViewState[this.position] = editorViewState;
            }
        };
        WalkThroughPart.prototype.loadTextEditorViewState = function (resource) {
            var memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            var editorViewStateMemento = memento[WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY];
            if (editorViewStateMemento) {
                var fileViewState = editorViewStateMemento[resource.toString()];
                if (fileViewState) {
                    var state = fileViewState[this.position];
                    if (state) {
                        this.scrollbar.setScrollPosition(state.viewState);
                    }
                }
            }
        };
        WalkThroughPart.prototype.clearInput = function () {
            if (this.input instanceof walkThroughInput_1.WalkThroughInput) {
                this.saveTextEditorViewState(this.input.getResource());
            }
            _super.prototype.clearInput.call(this);
        };
        WalkThroughPart.prototype.shutdown = function () {
            if (this.input instanceof walkThroughInput_1.WalkThroughInput) {
                this.saveTextEditorViewState(this.input.getResource());
            }
            _super.prototype.shutdown.call(this);
        };
        WalkThroughPart.prototype.dispose = function () {
            this.editorFocus.reset();
            this.contentDisposables = lifecycle_1.dispose(this.contentDisposables);
            this.disposables = lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        WalkThroughPart.ID = 'workbench.editor.walkThroughPart';
        WalkThroughPart = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, themeService_1.IThemeService),
            __param(3, opener_1.IOpenerService),
            __param(4, modelService_1.IModelService),
            __param(5, keybinding_1.IKeybindingService),
            __param(6, storage_1.IStorageService),
            __param(7, contextkey_1.IContextKeyService),
            __param(8, configuration_1.IConfigurationService),
            __param(9, message_1.IMessageService)
        ], WalkThroughPart);
        return WalkThroughPart;
    }(baseEditor_1.BaseEditor));
    exports.WalkThroughPart = WalkThroughPart;
    // theming
    var embeddedEditorBackground = colorRegistry_1.registerColor('walkThrough.embeddedEditorBackground', { dark: null, light: null, hc: null }, nls_1.localize('walkThrough.embeddedEditorBackground', 'Background color for the embedded editors on the Interactive Playground.'));
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var color = walkThroughUtils_1.getExtraColor(theme, embeddedEditorBackground, { dark: 'rgba(0, 0, 0, .4)', extra_dark: 'rgba(200, 235, 255, .064)', light: 'rgba(0,0,0,.08)', hc: null });
        if (color) {
            collector.addRule(".monaco-workbench > .part.editor > .content .walkThroughContent .monaco-editor-background,\n\t\t\t.monaco-workbench > .part.editor > .content .walkThroughContent .margin-view-overlays { background: " + color + "; }");
        }
        var link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(".monaco-workbench > .part.editor > .content .walkThroughContent a { color: " + link + "; }");
        }
        var activeLink = theme.getColor(colorRegistry_1.textLinkActiveForeground);
        if (activeLink) {
            collector.addRule(".monaco-workbench > .part.editor > .content .walkThroughContent a:hover,\n\t\t\t.monaco-workbench > .part.editor > .content .walkThroughContent a:active { color: " + activeLink + "; }");
        }
        var focusColor = theme.getColor(colorRegistry_1.focusBorder);
        if (focusColor) {
            collector.addRule(".monaco-workbench > .part.editor > .content .walkThroughContent a:focus { outline-color: " + focusColor + "; }");
        }
        var shortcut = theme.getColor(colorRegistry_1.textPreformatForeground);
        if (shortcut) {
            collector.addRule(".monaco-workbench > .part.editor > .content .walkThroughContent code,\n\t\t\t.monaco-workbench > .part.editor > .content .walkThroughContent .shortcut { color: " + shortcut + "; }");
        }
        var border = theme.getColor(colorRegistry_1.contrastBorder);
        if (border) {
            collector.addRule(".monaco-workbench > .part.editor > .content .walkThroughContent .monaco-editor { border-color: " + border + "; }");
        }
        var quoteBackground = theme.getColor(colorRegistry_1.textBlockQuoteBackground);
        if (quoteBackground) {
            collector.addRule(".monaco-workbench > .part.editor > .content .walkThroughContent blockquote { background: " + quoteBackground + "; }");
        }
        var quoteBorder = theme.getColor(colorRegistry_1.textBlockQuoteBorder);
        if (quoteBorder) {
            collector.addRule(".monaco-workbench > .part.editor > .content .walkThroughContent blockquote { border-color: " + quoteBorder + "; }");
        }
    });
});
