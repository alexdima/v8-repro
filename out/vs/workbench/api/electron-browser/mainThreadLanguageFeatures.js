var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/editor/common/modes", "vs/workbench/parts/search/common/search", "vs/base/common/async", "../node/extHost.protocol", "vs/editor/common/modes/languageConfigurationRegistry", "./mainThreadHeapService", "vs/editor/common/services/modeService", "vs/workbench/api/electron-browser/extHostCustomers", "vs/workbench/api/node/extHostTypeConverters", "vs/base/common/uri"], function (require, exports, event_1, modes, search_1, async_1, extHost_protocol_1, languageConfigurationRegistry_1, mainThreadHeapService_1, modeService_1, extHostCustomers_1, extHostTypeConverters_1, uri_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadLanguageFeatures = /** @class */ (function () {
        function MainThreadLanguageFeatures(extHostContext, heapService, modeService) {
            this._registrations = Object.create(null);
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostLanguageFeatures);
            this._heapService = heapService;
            this._modeService = modeService;
        }
        MainThreadLanguageFeatures_1 = MainThreadLanguageFeatures;
        MainThreadLanguageFeatures.prototype.dispose = function () {
            for (var key in this._registrations) {
                this._registrations[key].dispose();
            }
        };
        MainThreadLanguageFeatures.prototype.$unregister = function (handle) {
            var registration = this._registrations[handle];
            if (registration) {
                registration.dispose();
                delete this._registrations[handle];
            }
        };
        MainThreadLanguageFeatures._reviveLocationDto = function (data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(function (l) { return MainThreadLanguageFeatures_1._reviveLocationDto(l); });
                return data;
            }
            else {
                data.uri = uri_1.default.revive(data.uri);
                return data;
            }
        };
        MainThreadLanguageFeatures._reviveSymbolInformationDto = function (data) {
            if (!data) {
                return data;
            }
            else if (Array.isArray(data)) {
                data.forEach(MainThreadLanguageFeatures_1._reviveSymbolInformationDto);
                return data;
            }
            else {
                data.location = MainThreadLanguageFeatures_1._reviveLocationDto(data.location);
                return data;
            }
        };
        MainThreadLanguageFeatures._reviveCodeActionDto = function (data) {
            if (data) {
                data.forEach(function (code) { return extHost_protocol_1.reviveWorkspaceEditDto(code.edit); });
            }
            return data;
        };
        //#endregion
        // --- outline
        MainThreadLanguageFeatures.prototype.$registerOutlineSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.DocumentSymbolProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideDocumentSymbols: function (model, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideDocumentSymbols(handle, model.uri)).then(MainThreadLanguageFeatures_1._reviveSymbolInformationDto);
                }
            });
        };
        // --- code lens
        MainThreadLanguageFeatures.prototype.$registerCodeLensSupport = function (handle, selector, eventHandle) {
            var _this = this;
            var provider = {
                provideCodeLenses: function (model, token) {
                    return _this._heapService.trackRecursive(async_1.wireCancellationToken(token, _this._proxy.$provideCodeLenses(handle, model.uri)));
                },
                resolveCodeLens: function (model, codeLens, token) {
                    return _this._heapService.trackRecursive(async_1.wireCancellationToken(token, _this._proxy.$resolveCodeLens(handle, model.uri, codeLens)));
                }
            };
            if (typeof eventHandle === 'number') {
                var emitter = new event_1.Emitter();
                this._registrations[eventHandle] = emitter;
                provider.onDidChange = emitter.event;
            }
            this._registrations[handle] = modes.CodeLensProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), provider);
        };
        MainThreadLanguageFeatures.prototype.$emitCodeLensEvent = function (eventHandle, event) {
            var obj = this._registrations[eventHandle];
            if (obj instanceof event_1.Emitter) {
                obj.fire(event);
            }
        };
        // --- declaration
        MainThreadLanguageFeatures.prototype.$registerDeclaractionSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.DefinitionProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideDefinition: function (model, position, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideDefinition(handle, model.uri, position)).then(MainThreadLanguageFeatures_1._reviveLocationDto);
                }
            });
        };
        MainThreadLanguageFeatures.prototype.$registerImplementationSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.ImplementationProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideImplementation: function (model, position, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideImplementation(handle, model.uri, position)).then(MainThreadLanguageFeatures_1._reviveLocationDto);
                }
            });
        };
        MainThreadLanguageFeatures.prototype.$registerTypeDefinitionSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.TypeDefinitionProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideTypeDefinition: function (model, position, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideTypeDefinition(handle, model.uri, position)).then(MainThreadLanguageFeatures_1._reviveLocationDto);
                }
            });
        };
        // --- extra info
        MainThreadLanguageFeatures.prototype.$registerHoverProvider = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.HoverProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideHover: function (model, position, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideHover(handle, model.uri, position));
                }
            });
        };
        // --- occurrences
        MainThreadLanguageFeatures.prototype.$registerDocumentHighlightProvider = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.DocumentHighlightProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideDocumentHighlights: function (model, position, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideDocumentHighlights(handle, model.uri, position));
                }
            });
        };
        // --- references
        MainThreadLanguageFeatures.prototype.$registerReferenceSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.ReferenceProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideReferences: function (model, position, context, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideReferences(handle, model.uri, position, context)).then(MainThreadLanguageFeatures_1._reviveLocationDto);
                }
            });
        };
        // --- quick fix
        MainThreadLanguageFeatures.prototype.$registerQuickFixSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.CodeActionProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideCodeActions: function (model, range, context, token) {
                    return _this._heapService.trackRecursive(async_1.wireCancellationToken(token, _this._proxy.$provideCodeActions(handle, model.uri, range, context))).then(MainThreadLanguageFeatures_1._reviveCodeActionDto);
                }
            });
        };
        // --- formatting
        MainThreadLanguageFeatures.prototype.$registerDocumentFormattingSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.DocumentFormattingEditProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideDocumentFormattingEdits: function (model, options, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideDocumentFormattingEdits(handle, model.uri, options));
                }
            });
        };
        MainThreadLanguageFeatures.prototype.$registerRangeFormattingSupport = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.DocumentRangeFormattingEditProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideDocumentRangeFormattingEdits: function (model, range, options, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideDocumentRangeFormattingEdits(handle, model.uri, range, options));
                }
            });
        };
        MainThreadLanguageFeatures.prototype.$registerOnTypeFormattingSupport = function (handle, selector, autoFormatTriggerCharacters) {
            var _this = this;
            this._registrations[handle] = modes.OnTypeFormattingEditProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                autoFormatTriggerCharacters: autoFormatTriggerCharacters,
                provideOnTypeFormattingEdits: function (model, position, ch, options, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideOnTypeFormattingEdits(handle, model.uri, position, ch, options));
                }
            });
        };
        // --- navigate type
        MainThreadLanguageFeatures.prototype.$registerNavigateTypeSupport = function (handle) {
            var _this = this;
            var lastResultId;
            this._registrations[handle] = search_1.WorkspaceSymbolProviderRegistry.register({
                provideWorkspaceSymbols: function (search) {
                    return _this._proxy.$provideWorkspaceSymbols(handle, search).then(function (result) {
                        if (lastResultId !== undefined) {
                            _this._proxy.$releaseWorkspaceSymbols(handle, lastResultId);
                        }
                        lastResultId = result._id;
                        return MainThreadLanguageFeatures_1._reviveSymbolInformationDto(result.symbols);
                    });
                },
                resolveWorkspaceSymbol: function (item) {
                    return _this._proxy.$resolveWorkspaceSymbol(handle, item).then(function (i) { return MainThreadLanguageFeatures_1._reviveSymbolInformationDto(i); });
                }
            });
        };
        // --- rename
        MainThreadLanguageFeatures.prototype.$registerRenameSupport = function (handle, selector, supportsResolveInitialValues) {
            var _this = this;
            this._registrations[handle] = modes.RenameProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideRenameEdits: function (model, position, newName, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideRenameEdits(handle, model.uri, position, newName)).then(extHost_protocol_1.reviveWorkspaceEditDto);
                },
                resolveInitialRenameValue: supportsResolveInitialValues
                    ? function (model, position, token) { return async_1.wireCancellationToken(token, _this._proxy.$resolveInitialRenameValue(handle, model.uri, position)); }
                    : undefined
            });
        };
        // --- suggest
        MainThreadLanguageFeatures.prototype.$registerSuggestSupport = function (handle, selector, triggerCharacters, supportsResolveDetails) {
            var _this = this;
            this._registrations[handle] = modes.SuggestRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                triggerCharacters: triggerCharacters,
                provideCompletionItems: function (model, position, context, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideCompletionItems(handle, model.uri, position, context)).then(function (result) {
                        if (!result) {
                            return result;
                        }
                        return {
                            suggestions: result.suggestions,
                            incomplete: result.incomplete,
                            dispose: function () { return _this._proxy.$releaseCompletionItems(handle, result._id); }
                        };
                    });
                },
                resolveCompletionItem: supportsResolveDetails
                    ? function (model, position, suggestion, token) { return async_1.wireCancellationToken(token, _this._proxy.$resolveCompletionItem(handle, model.uri, position, suggestion)); }
                    : undefined
            });
        };
        // --- parameter hints
        MainThreadLanguageFeatures.prototype.$registerSignatureHelpProvider = function (handle, selector, triggerCharacter) {
            var _this = this;
            this._registrations[handle] = modes.SignatureHelpProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                signatureHelpTriggerCharacters: triggerCharacter,
                provideSignatureHelp: function (model, position, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$provideSignatureHelp(handle, model.uri, position));
                }
            });
        };
        // --- links
        MainThreadLanguageFeatures.prototype.$registerDocumentLinkProvider = function (handle, selector) {
            var _this = this;
            this._registrations[handle] = modes.LinkProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideLinks: function (model, token) {
                    return _this._heapService.trackRecursive(async_1.wireCancellationToken(token, _this._proxy.$provideDocumentLinks(handle, model.uri)));
                },
                resolveLink: function (link, token) {
                    return async_1.wireCancellationToken(token, _this._proxy.$resolveDocumentLink(handle, link));
                }
            });
        };
        // --- colors
        MainThreadLanguageFeatures.prototype.$registerDocumentColorProvider = function (handle, selector) {
            var proxy = this._proxy;
            this._registrations[handle] = modes.ColorProviderRegistry.register(extHostTypeConverters_1.toLanguageSelector(selector), {
                provideDocumentColors: function (model, token) {
                    return async_1.wireCancellationToken(token, proxy.$provideDocumentColors(handle, model.uri))
                        .then(function (documentColors) {
                        return documentColors.map(function (documentColor) {
                            var _a = documentColor.color, red = _a[0], green = _a[1], blue = _a[2], alpha = _a[3];
                            var color = {
                                red: red,
                                green: green,
                                blue: blue,
                                alpha: alpha
                            };
                            return {
                                color: color,
                                range: documentColor.range
                            };
                        });
                    });
                },
                provideColorPresentations: function (model, colorInfo, token) {
                    return async_1.wireCancellationToken(token, proxy.$provideColorPresentations(handle, model.uri, {
                        color: [colorInfo.color.red, colorInfo.color.green, colorInfo.color.blue, colorInfo.color.alpha],
                        range: colorInfo.range
                    }));
                }
            });
        };
        // --- configuration
        MainThreadLanguageFeatures._reviveRegExp = function (regExp) {
            if (typeof regExp === 'undefined') {
                return undefined;
            }
            if (regExp === null) {
                return null;
            }
            return new RegExp(regExp.pattern, regExp.flags);
        };
        MainThreadLanguageFeatures._reviveIndentationRule = function (indentationRule) {
            if (typeof indentationRule === 'undefined') {
                return undefined;
            }
            if (indentationRule === null) {
                return null;
            }
            return {
                decreaseIndentPattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.decreaseIndentPattern),
                increaseIndentPattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.increaseIndentPattern),
                indentNextLinePattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.indentNextLinePattern),
                unIndentedLinePattern: MainThreadLanguageFeatures_1._reviveRegExp(indentationRule.unIndentedLinePattern),
            };
        };
        MainThreadLanguageFeatures._reviveOnEnterRule = function (onEnterRule) {
            return {
                beforeText: MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.beforeText),
                afterText: MainThreadLanguageFeatures_1._reviveRegExp(onEnterRule.afterText),
                action: onEnterRule.action
            };
        };
        MainThreadLanguageFeatures._reviveOnEnterRules = function (onEnterRules) {
            if (typeof onEnterRules === 'undefined') {
                return undefined;
            }
            if (onEnterRules === null) {
                return null;
            }
            return onEnterRules.map(MainThreadLanguageFeatures_1._reviveOnEnterRule);
        };
        MainThreadLanguageFeatures.prototype.$setLanguageConfiguration = function (handle, languageId, _configuration) {
            var configuration = {
                comments: _configuration.comments,
                brackets: _configuration.brackets,
                wordPattern: MainThreadLanguageFeatures_1._reviveRegExp(_configuration.wordPattern),
                indentationRules: MainThreadLanguageFeatures_1._reviveIndentationRule(_configuration.indentationRules),
                onEnterRules: MainThreadLanguageFeatures_1._reviveOnEnterRules(_configuration.onEnterRules),
                autoClosingPairs: null,
                surroundingPairs: null,
                __electricCharacterSupport: null
            };
            if (_configuration.__characterPairSupport) {
                // backwards compatibility
                configuration.autoClosingPairs = _configuration.__characterPairSupport.autoClosingPairs;
            }
            if (_configuration.__electricCharacterSupport && _configuration.__electricCharacterSupport.docComment) {
                configuration.__electricCharacterSupport = {
                    docComment: {
                        open: _configuration.__electricCharacterSupport.docComment.open,
                        close: _configuration.__electricCharacterSupport.docComment.close
                    }
                };
            }
            var languageIdentifier = this._modeService.getLanguageIdentifier(languageId);
            if (languageIdentifier) {
                this._registrations[handle] = languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(languageIdentifier, configuration);
            }
        };
        MainThreadLanguageFeatures = MainThreadLanguageFeatures_1 = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadLanguageFeatures),
            __param(1, mainThreadHeapService_1.IHeapService),
            __param(2, modeService_1.IModeService)
        ], MainThreadLanguageFeatures);
        return MainThreadLanguageFeatures;
        var MainThreadLanguageFeatures_1;
    }());
    exports.MainThreadLanguageFeatures = MainThreadLanguageFeatures;
});
