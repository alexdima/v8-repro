define(["require", "exports", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/base/common/objects", "vs/workbench/api/node/extHostTypeConverters", "vs/workbench/api/node/extHostTypes", "vs/workbench/api/node/extHostDiagnostics", "vs/base/common/async", "./extHost.protocol", "vs/base/common/strings", "vs/base/common/arrays"], function (require, exports, uri_1, winjs_base_1, objects_1, TypeConverters, extHostTypes_1, extHostDiagnostics_1, async_1, extHost_protocol_1, strings_1, arrays_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- adapter
    var OutlineAdapter = /** @class */ (function () {
        function OutlineAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        OutlineAdapter.prototype.provideDocumentSymbols = function (resource) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentSymbols(doc, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(function (symbol) { return extHost_protocol_1.IdObject.mixin(TypeConverters.fromSymbolInformation(symbol)); });
                }
                return undefined;
            });
        };
        return OutlineAdapter;
    }());
    var CodeLensAdapter = /** @class */ (function () {
        function CodeLensAdapter(documents, commands, heapService, provider) {
            this._documents = documents;
            this._commands = commands;
            this._heapService = heapService;
            this._provider = provider;
        }
        CodeLensAdapter.prototype.provideCodeLenses = function (resource) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideCodeLenses(doc, token); }).then(function (lenses) {
                if (Array.isArray(lenses)) {
                    return lenses.map(function (lens) {
                        var id = _this._heapService.keep(lens);
                        return extHost_protocol_1.ObjectIdentifier.mixin({
                            range: TypeConverters.fromRange(lens.range),
                            command: _this._commands.toInternal(lens.command)
                        }, id);
                    });
                }
                return undefined;
            });
        };
        CodeLensAdapter.prototype.resolveCodeLens = function (resource, symbol) {
            var _this = this;
            var lens = this._heapService.get(extHost_protocol_1.ObjectIdentifier.of(symbol));
            if (!lens) {
                return undefined;
            }
            var resolve;
            if (typeof this._provider.resolveCodeLens !== 'function' || lens.isResolved) {
                resolve = winjs_base_1.TPromise.as(lens);
            }
            else {
                resolve = async_1.asWinJsPromise(function (token) { return _this._provider.resolveCodeLens(lens, token); });
            }
            return resolve.then(function (newLens) {
                newLens = newLens || lens;
                symbol.command = _this._commands.toInternal(newLens.command || CodeLensAdapter._badCmd);
                return symbol;
            });
        };
        CodeLensAdapter._badCmd = { command: 'missing', title: '<<MISSING COMMAND>>' };
        return CodeLensAdapter;
    }());
    var DefinitionAdapter = /** @class */ (function () {
        function DefinitionAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        DefinitionAdapter.prototype.provideDefinition = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDefinition(doc, pos, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.location.from);
                }
                else if (value) {
                    return TypeConverters.location.from(value);
                }
                return undefined;
            });
        };
        return DefinitionAdapter;
    }());
    var ImplementationAdapter = /** @class */ (function () {
        function ImplementationAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        ImplementationAdapter.prototype.provideImplementation = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideImplementation(doc, pos, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.location.from);
                }
                else if (value) {
                    return TypeConverters.location.from(value);
                }
                return undefined;
            });
        };
        return ImplementationAdapter;
    }());
    var TypeDefinitionAdapter = /** @class */ (function () {
        function TypeDefinitionAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        TypeDefinitionAdapter.prototype.provideTypeDefinition = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideTypeDefinition(doc, pos, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.location.from);
                }
                else if (value) {
                    return TypeConverters.location.from(value);
                }
                return undefined;
            });
        };
        return TypeDefinitionAdapter;
    }());
    var HoverAdapter = /** @class */ (function () {
        function HoverAdapter(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
            //
        }
        HoverAdapter.prototype.provideHover = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideHover(doc, pos, token); }).then(function (value) {
                if (!value || arrays_1.isFalsyOrEmpty(value.contents)) {
                    return undefined;
                }
                if (!value.range) {
                    value.range = doc.getWordRangeAtPosition(pos);
                }
                if (!value.range) {
                    value.range = new extHostTypes_1.Range(pos, pos);
                }
                return TypeConverters.fromHover(value);
            });
        };
        return HoverAdapter;
    }());
    var DocumentHighlightAdapter = /** @class */ (function () {
        function DocumentHighlightAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        DocumentHighlightAdapter.prototype.provideDocumentHighlights = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentHighlights(doc, pos, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(DocumentHighlightAdapter._convertDocumentHighlight);
                }
                return undefined;
            });
        };
        DocumentHighlightAdapter._convertDocumentHighlight = function (documentHighlight) {
            return {
                range: TypeConverters.fromRange(documentHighlight.range),
                kind: documentHighlight.kind
            };
        };
        return DocumentHighlightAdapter;
    }());
    var ReferenceAdapter = /** @class */ (function () {
        function ReferenceAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        ReferenceAdapter.prototype.provideReferences = function (resource, position, context) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideReferences(doc, pos, context, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.location.from);
                }
                return undefined;
            });
        };
        return ReferenceAdapter;
    }());
    var CodeActionAdapter = /** @class */ (function () {
        function CodeActionAdapter(documents, commands, diagnostics, provider) {
            this._documents = documents;
            this._commands = commands;
            this._diagnostics = diagnostics;
            this._provider = provider;
        }
        CodeActionAdapter.prototype.provideCodeActions = function (resource, range, context) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var ran = TypeConverters.toRange(range);
            var allDiagnostics = [];
            this._diagnostics.forEach(function (collection) {
                if (collection.has(resource)) {
                    for (var _i = 0, _a = collection.get(resource); _i < _a.length; _i++) {
                        var diagnostic = _a[_i];
                        if (ran.contains(diagnostic.range)) {
                            allDiagnostics.push(diagnostic);
                        }
                    }
                }
            });
            var codeActionContext = {
                diagnostics: allDiagnostics,
                only: context.only ? new extHostTypes_1.CodeActionKind(context.only) : undefined
            };
            return async_1.asWinJsPromise(function (token) {
                return _this._provider.provideCodeActions(doc, ran, codeActionContext, token);
            }).then(function (commandsOrActions) {
                if (arrays_1.isFalsyOrEmpty(commandsOrActions)) {
                    return undefined;
                }
                var result = [];
                for (var _i = 0, commandsOrActions_1 = commandsOrActions; _i < commandsOrActions_1.length; _i++) {
                    var candidate = commandsOrActions_1[_i];
                    if (!candidate) {
                        continue;
                    }
                    if (CodeActionAdapter._isCommand(candidate)) {
                        // old school: synthetic code action
                        result.push({
                            _isSynthetic: true,
                            title: candidate.title,
                            command: _this._commands.toInternal(candidate),
                        });
                    }
                    else {
                        // new school: convert code action
                        result.push({
                            title: candidate.title,
                            command: candidate.command && _this._commands.toInternal(candidate.command),
                            diagnostics: candidate.diagnostics && candidate.diagnostics.map(extHostDiagnostics_1.DiagnosticCollection.toMarkerData),
                            edit: candidate.edit && TypeConverters.WorkspaceEdit.from(candidate.edit),
                            kind: candidate.kind && candidate.kind.value
                        });
                    }
                }
                return result;
            });
        };
        CodeActionAdapter._isCommand = function (thing) {
            return typeof thing.command === 'string' && typeof thing.title === 'string';
        };
        return CodeActionAdapter;
    }());
    var DocumentFormattingAdapter = /** @class */ (function () {
        function DocumentFormattingAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        DocumentFormattingAdapter.prototype.provideDocumentFormattingEdits = function (resource, options) {
            var _this = this;
            var document = this._documents.getDocumentData(resource).document;
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentFormattingEdits(document, options, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.TextEdit.from);
                }
                return undefined;
            });
        };
        return DocumentFormattingAdapter;
    }());
    var RangeFormattingAdapter = /** @class */ (function () {
        function RangeFormattingAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        RangeFormattingAdapter.prototype.provideDocumentRangeFormattingEdits = function (resource, range, options) {
            var _this = this;
            var document = this._documents.getDocumentData(resource).document;
            var ran = TypeConverters.toRange(range);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentRangeFormattingEdits(document, ran, options, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.TextEdit.from);
                }
                return undefined;
            });
        };
        return RangeFormattingAdapter;
    }());
    var OnTypeFormattingAdapter = /** @class */ (function () {
        function OnTypeFormattingAdapter(documents, provider) {
            this.autoFormatTriggerCharacters = []; // not here
            this._documents = documents;
            this._provider = provider;
        }
        OnTypeFormattingAdapter.prototype.provideOnTypeFormattingEdits = function (resource, position, ch, options) {
            var _this = this;
            var document = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideOnTypeFormattingEdits(document, pos, ch, options, token); }).then(function (value) {
                if (Array.isArray(value)) {
                    return value.map(TypeConverters.TextEdit.from);
                }
                return undefined;
            });
        };
        return OnTypeFormattingAdapter;
    }());
    var NavigateTypeAdapter = /** @class */ (function () {
        function NavigateTypeAdapter(provider) {
            this._symbolCache = Object.create(null);
            this._resultCache = Object.create(null);
            this._provider = provider;
        }
        NavigateTypeAdapter.prototype.provideWorkspaceSymbols = function (search) {
            var _this = this;
            var result = extHost_protocol_1.IdObject.mixin({ symbols: [] });
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideWorkspaceSymbols(search, token); }).then(function (value) {
                if (!arrays_1.isFalsyOrEmpty(value)) {
                    for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                        var item = value_1[_i];
                        if (!item) {
                            // drop
                            continue;
                        }
                        if (!item.name) {
                            console.warn('INVALID SymbolInformation, lacks name', item);
                            continue;
                        }
                        var symbol = extHost_protocol_1.IdObject.mixin(TypeConverters.fromSymbolInformation(item));
                        _this._symbolCache[symbol._id] = item;
                        result.symbols.push(symbol);
                    }
                }
            }).then(function () {
                if (result.symbols.length > 0) {
                    _this._resultCache[result._id] = [result.symbols[0]._id, result.symbols[result.symbols.length - 1]._id];
                }
                return result;
            });
        };
        NavigateTypeAdapter.prototype.resolveWorkspaceSymbol = function (symbol) {
            var _this = this;
            if (typeof this._provider.resolveWorkspaceSymbol !== 'function') {
                return winjs_base_1.TPromise.as(symbol);
            }
            var item = this._symbolCache[symbol._id];
            if (item) {
                return async_1.asWinJsPromise(function (token) { return _this._provider.resolveWorkspaceSymbol(item, token); }).then(function (value) {
                    return value && objects_1.mixin(symbol, TypeConverters.fromSymbolInformation(value), true);
                });
            }
            return undefined;
        };
        NavigateTypeAdapter.prototype.releaseWorkspaceSymbols = function (id) {
            var range = this._resultCache[id];
            if (range) {
                for (var from = range[0], to = range[1]; from <= to; from++) {
                    delete this._symbolCache[from];
                }
                delete this._resultCache[id];
            }
        };
        return NavigateTypeAdapter;
    }());
    var RenameAdapter = /** @class */ (function () {
        function RenameAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        RenameAdapter.supportsResolving = function (provider) {
            return typeof provider.resolveInitialRenameValue === 'function';
        };
        RenameAdapter.prototype.provideRenameEdits = function (resource, position, newName) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideRenameEdits(doc, pos, newName, token); }).then(function (value) {
                if (!value) {
                    return undefined;
                }
                return TypeConverters.WorkspaceEdit.from(value);
            }, function (err) {
                if (typeof err === 'string') {
                    return {
                        edits: undefined,
                        rejectReason: err
                    };
                }
                else if (err instanceof Error && typeof err.message === 'string') {
                    return {
                        edits: undefined,
                        rejectReason: err.message
                    };
                }
                else {
                    // generic error
                    return winjs_base_1.TPromise.wrapError(err);
                }
            });
        };
        RenameAdapter.prototype.resolveInitialRenameValue = function (resource, position) {
            var _this = this;
            if (typeof this._provider.resolveInitialRenameValue !== 'function') {
                return winjs_base_1.TPromise.as(undefined);
            }
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.resolveInitialRenameValue(doc, pos, token); }).then(function (value) {
                return {
                    range: TypeConverters.fromRange(value.range),
                    text: value.text
                };
            });
        };
        return RenameAdapter;
    }());
    var SuggestAdapter = /** @class */ (function () {
        function SuggestAdapter(documents, commands, provider) {
            this._cache = new Map();
            this._idPool = 0;
            this._documents = documents;
            this._commands = commands;
            this._provider = provider;
        }
        SuggestAdapter.supportsResolving = function (provider) {
            return typeof provider.resolveCompletionItem === 'function';
        };
        SuggestAdapter.prototype.provideCompletionItems = function (resource, position, context) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) {
                return _this._provider.provideCompletionItems(doc, pos, token, TypeConverters.CompletionContext.from(context));
            }).then(function (value) {
                var _id = _this._idPool++;
                var result = {
                    _id: _id,
                    suggestions: [],
                };
                var list;
                if (!value) {
                    // undefined and null are valid results
                    return undefined;
                }
                else if (Array.isArray(value)) {
                    list = new extHostTypes_1.CompletionList(value);
                }
                else {
                    list = value;
                    result.incomplete = list.isIncomplete;
                }
                // the default text edit range
                var wordRangeBeforePos = (doc.getWordRangeAtPosition(pos) || new extHostTypes_1.Range(pos, pos))
                    .with({ end: pos });
                for (var i = 0; i < list.items.length; i++) {
                    var suggestion = _this._convertCompletionItem(list.items[i], pos, wordRangeBeforePos, i, _id);
                    // check for bad completion item
                    // for the converter did warn
                    if (suggestion) {
                        result.suggestions.push(suggestion);
                    }
                }
                _this._cache.set(_id, list.items);
                return result;
            });
        };
        SuggestAdapter.prototype.resolveCompletionItem = function (resource, position, suggestion) {
            var _this = this;
            if (typeof this._provider.resolveCompletionItem !== 'function') {
                return winjs_base_1.TPromise.as(suggestion);
            }
            var _a = suggestion, _parentId = _a._parentId, _id = _a._id;
            var item = this._cache.has(_parentId) && this._cache.get(_parentId)[_id];
            if (!item) {
                return winjs_base_1.TPromise.as(suggestion);
            }
            return async_1.asWinJsPromise(function (token) { return _this._provider.resolveCompletionItem(item, token); }).then(function (resolvedItem) {
                if (!resolvedItem) {
                    return suggestion;
                }
                var doc = _this._documents.getDocumentData(resource).document;
                var pos = TypeConverters.toPosition(position);
                var wordRangeBeforePos = (doc.getWordRangeAtPosition(pos) || new extHostTypes_1.Range(pos, pos)).with({ end: pos });
                var newSuggestion = _this._convertCompletionItem(resolvedItem, pos, wordRangeBeforePos, _id, _parentId);
                if (newSuggestion) {
                    objects_1.mixin(suggestion, newSuggestion, true);
                }
                return suggestion;
            });
        };
        SuggestAdapter.prototype.releaseCompletionItems = function (id) {
            this._cache.delete(id);
        };
        SuggestAdapter.prototype._convertCompletionItem = function (item, position, defaultRange, _id, _parentId) {
            if (typeof item.label !== 'string' || item.label.length === 0) {
                console.warn('INVALID text edit -> must have at least a label');
                return undefined;
            }
            var result = {
                //
                _id: _id,
                _parentId: _parentId,
                //
                label: item.label,
                type: TypeConverters.CompletionItemKind.from(item.kind),
                detail: item.detail,
                documentation: item.documentation,
                filterText: item.filterText,
                sortText: item.sortText,
                //
                insertText: undefined,
                additionalTextEdits: item.additionalTextEdits && item.additionalTextEdits.map(TypeConverters.TextEdit.from),
                command: this._commands.toInternal(item.command),
                commitCharacters: item.commitCharacters
            };
            // 'insertText'-logic
            if (item.textEdit) {
                result.insertText = item.textEdit.newText;
                result.snippetType = 'internal';
            }
            else if (typeof item.insertText === 'string') {
                result.insertText = item.insertText;
                result.snippetType = 'internal';
            }
            else if (item.insertText instanceof extHostTypes_1.SnippetString) {
                result.insertText = item.insertText.value;
                result.snippetType = 'textmate';
            }
            else {
                result.insertText = item.label;
                result.snippetType = 'internal';
            }
            // 'overwrite[Before|After]'-logic
            var range;
            if (item.textEdit) {
                range = item.textEdit.range;
            }
            else if (item.range) {
                range = item.range;
            }
            else {
                range = defaultRange;
            }
            result.overwriteBefore = position.character - range.start.character;
            result.overwriteAfter = range.end.character - position.character;
            if (!range.isSingleLine || range.start.line !== position.line) {
                console.warn('INVALID text edit -> must be single line and on the same line');
                return undefined;
            }
            return result;
        };
        return SuggestAdapter;
    }());
    var SignatureHelpAdapter = /** @class */ (function () {
        function SignatureHelpAdapter(documents, provider) {
            this._documents = documents;
            this._provider = provider;
        }
        SignatureHelpAdapter.prototype.provideSignatureHelp = function (resource, position) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            var pos = TypeConverters.toPosition(position);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideSignatureHelp(doc, pos, token); }).then(function (value) {
                if (value) {
                    return TypeConverters.SignatureHelp.from(value);
                }
                return undefined;
            });
        };
        return SignatureHelpAdapter;
    }());
    var LinkProviderAdapter = /** @class */ (function () {
        function LinkProviderAdapter(documents, heapService, provider) {
            this._documents = documents;
            this._heapService = heapService;
            this._provider = provider;
        }
        LinkProviderAdapter.prototype.provideLinks = function (resource) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentLinks(doc, token); }).then(function (links) {
                if (!Array.isArray(links)) {
                    return undefined;
                }
                var result = [];
                for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
                    var link = links_1[_i];
                    var data = TypeConverters.DocumentLink.from(link);
                    var id = _this._heapService.keep(link);
                    extHost_protocol_1.ObjectIdentifier.mixin(data, id);
                    result.push(data);
                }
                return result;
            });
        };
        LinkProviderAdapter.prototype.resolveLink = function (link) {
            var _this = this;
            if (typeof this._provider.resolveDocumentLink !== 'function') {
                return undefined;
            }
            var id = extHost_protocol_1.ObjectIdentifier.of(link);
            var item = this._heapService.get(id);
            if (!item) {
                return undefined;
            }
            return async_1.asWinJsPromise(function (token) { return _this._provider.resolveDocumentLink(item, token); }).then(function (value) {
                if (value) {
                    return TypeConverters.DocumentLink.from(value);
                }
                return undefined;
            });
        };
        return LinkProviderAdapter;
    }());
    var ColorProviderAdapter = /** @class */ (function () {
        function ColorProviderAdapter(_documents, _provider) {
            this._documents = _documents;
            this._provider = _provider;
        }
        ColorProviderAdapter.prototype.provideColors = function (resource) {
            var _this = this;
            var doc = this._documents.getDocumentData(resource).document;
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideDocumentColors(doc, token); }).then(function (colors) {
                if (!Array.isArray(colors)) {
                    return [];
                }
                var colorInfos = colors.map(function (ci) {
                    return {
                        color: [ci.color.red, ci.color.green, ci.color.blue, ci.color.alpha],
                        range: TypeConverters.fromRange(ci.range)
                    };
                });
                return colorInfos;
            });
        };
        ColorProviderAdapter.prototype.provideColorPresentations = function (resource, raw) {
            var _this = this;
            var document = this._documents.getDocumentData(resource).document;
            var range = TypeConverters.toRange(raw.range);
            var color = new extHostTypes_1.Color(raw.color[0], raw.color[1], raw.color[2], raw.color[3]);
            return async_1.asWinJsPromise(function (token) { return _this._provider.provideColorPresentations(color, { document: document, range: range }, token); }).then(function (value) {
                return value.map(TypeConverters.ColorPresentation.from);
            });
        };
        return ColorProviderAdapter;
    }());
    var ExtHostLanguageFeatures = /** @class */ (function () {
        function ExtHostLanguageFeatures(mainContext, documents, commands, heapMonitor, diagnostics) {
            this._adapter = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadLanguageFeatures);
            this._documents = documents;
            this._commands = commands;
            this._heapService = heapMonitor;
            this._diagnostics = diagnostics;
        }
        ExtHostLanguageFeatures.prototype._createDisposable = function (handle) {
            var _this = this;
            return new extHostTypes_1.Disposable(function () {
                _this._adapter.delete(handle);
                _this._proxy.$unregister(handle);
            });
        };
        ExtHostLanguageFeatures.prototype._nextHandle = function () {
            return ExtHostLanguageFeatures._handlePool++;
        };
        ExtHostLanguageFeatures.prototype._withAdapter = function (handle, ctor, callback) {
            var adapter = this._adapter.get(handle);
            if (!(adapter instanceof ctor)) {
                return winjs_base_1.TPromise.wrapError(new Error('no adapter found'));
            }
            return callback(adapter);
        };
        ExtHostLanguageFeatures.prototype._addNewAdapter = function (adapter) {
            var handle = this._nextHandle();
            this._adapter.set(handle, adapter);
            return handle;
        };
        // --- outline
        ExtHostLanguageFeatures.prototype.registerDocumentSymbolProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new OutlineAdapter(this._documents, provider));
            this._proxy.$registerOutlineSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideDocumentSymbols = function (handle, resource) {
            return this._withAdapter(handle, OutlineAdapter, function (adapter) { return adapter.provideDocumentSymbols(uri_1.default.revive(resource)); });
        };
        // --- code lens
        ExtHostLanguageFeatures.prototype.registerCodeLensProvider = function (selector, provider) {
            var _this = this;
            var handle = this._nextHandle();
            var eventHandle = typeof provider.onDidChangeCodeLenses === 'function' ? this._nextHandle() : undefined;
            this._adapter.set(handle, new CodeLensAdapter(this._documents, this._commands.converter, this._heapService, provider));
            this._proxy.$registerCodeLensSupport(handle, selector, eventHandle);
            var result = this._createDisposable(handle);
            if (eventHandle !== undefined) {
                var subscription = provider.onDidChangeCodeLenses(function (_) { return _this._proxy.$emitCodeLensEvent(eventHandle); });
                result = extHostTypes_1.Disposable.from(result, subscription);
            }
            return result;
        };
        ExtHostLanguageFeatures.prototype.$provideCodeLenses = function (handle, resource) {
            return this._withAdapter(handle, CodeLensAdapter, function (adapter) { return adapter.provideCodeLenses(uri_1.default.revive(resource)); });
        };
        ExtHostLanguageFeatures.prototype.$resolveCodeLens = function (handle, resource, symbol) {
            return this._withAdapter(handle, CodeLensAdapter, function (adapter) { return adapter.resolveCodeLens(uri_1.default.revive(resource), symbol); });
        };
        // --- declaration
        ExtHostLanguageFeatures.prototype.registerDefinitionProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new DefinitionAdapter(this._documents, provider));
            this._proxy.$registerDeclaractionSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideDefinition = function (handle, resource, position) {
            return this._withAdapter(handle, DefinitionAdapter, function (adapter) { return adapter.provideDefinition(uri_1.default.revive(resource), position); });
        };
        ExtHostLanguageFeatures.prototype.registerImplementationProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new ImplementationAdapter(this._documents, provider));
            this._proxy.$registerImplementationSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideImplementation = function (handle, resource, position) {
            return this._withAdapter(handle, ImplementationAdapter, function (adapter) { return adapter.provideImplementation(uri_1.default.revive(resource), position); });
        };
        ExtHostLanguageFeatures.prototype.registerTypeDefinitionProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new TypeDefinitionAdapter(this._documents, provider));
            this._proxy.$registerTypeDefinitionSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideTypeDefinition = function (handle, resource, position) {
            return this._withAdapter(handle, TypeDefinitionAdapter, function (adapter) { return adapter.provideTypeDefinition(uri_1.default.revive(resource), position); });
        };
        // --- extra info
        ExtHostLanguageFeatures.prototype.registerHoverProvider = function (selector, provider, extensionId) {
            var handle = this._addNewAdapter(new HoverAdapter(this._documents, provider));
            this._proxy.$registerHoverProvider(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideHover = function (handle, resource, position) {
            return this._withAdapter(handle, HoverAdapter, function (adpater) { return adpater.provideHover(uri_1.default.revive(resource), position); });
        };
        // --- occurrences
        ExtHostLanguageFeatures.prototype.registerDocumentHighlightProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new DocumentHighlightAdapter(this._documents, provider));
            this._proxy.$registerDocumentHighlightProvider(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideDocumentHighlights = function (handle, resource, position) {
            return this._withAdapter(handle, DocumentHighlightAdapter, function (adapter) { return adapter.provideDocumentHighlights(uri_1.default.revive(resource), position); });
        };
        // --- references
        ExtHostLanguageFeatures.prototype.registerReferenceProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new ReferenceAdapter(this._documents, provider));
            this._proxy.$registerReferenceSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideReferences = function (handle, resource, position, context) {
            return this._withAdapter(handle, ReferenceAdapter, function (adapter) { return adapter.provideReferences(uri_1.default.revive(resource), position, context); });
        };
        // --- quick fix
        ExtHostLanguageFeatures.prototype.registerCodeActionProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new CodeActionAdapter(this._documents, this._commands.converter, this._diagnostics, provider));
            this._proxy.$registerQuickFixSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideCodeActions = function (handle, resource, range, context) {
            return this._withAdapter(handle, CodeActionAdapter, function (adapter) { return adapter.provideCodeActions(uri_1.default.revive(resource), range, context); });
        };
        // --- formatting
        ExtHostLanguageFeatures.prototype.registerDocumentFormattingEditProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new DocumentFormattingAdapter(this._documents, provider));
            this._proxy.$registerDocumentFormattingSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideDocumentFormattingEdits = function (handle, resource, options) {
            return this._withAdapter(handle, DocumentFormattingAdapter, function (adapter) { return adapter.provideDocumentFormattingEdits(uri_1.default.revive(resource), options); });
        };
        ExtHostLanguageFeatures.prototype.registerDocumentRangeFormattingEditProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new RangeFormattingAdapter(this._documents, provider));
            this._proxy.$registerRangeFormattingSupport(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideDocumentRangeFormattingEdits = function (handle, resource, range, options) {
            return this._withAdapter(handle, RangeFormattingAdapter, function (adapter) { return adapter.provideDocumentRangeFormattingEdits(uri_1.default.revive(resource), range, options); });
        };
        ExtHostLanguageFeatures.prototype.registerOnTypeFormattingEditProvider = function (selector, provider, triggerCharacters) {
            var handle = this._addNewAdapter(new OnTypeFormattingAdapter(this._documents, provider));
            this._proxy.$registerOnTypeFormattingSupport(handle, selector, triggerCharacters);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideOnTypeFormattingEdits = function (handle, resource, position, ch, options) {
            return this._withAdapter(handle, OnTypeFormattingAdapter, function (adapter) { return adapter.provideOnTypeFormattingEdits(uri_1.default.revive(resource), position, ch, options); });
        };
        // --- navigate types
        ExtHostLanguageFeatures.prototype.registerWorkspaceSymbolProvider = function (provider) {
            var handle = this._addNewAdapter(new NavigateTypeAdapter(provider));
            this._proxy.$registerNavigateTypeSupport(handle);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideWorkspaceSymbols = function (handle, search) {
            return this._withAdapter(handle, NavigateTypeAdapter, function (adapter) { return adapter.provideWorkspaceSymbols(search); });
        };
        ExtHostLanguageFeatures.prototype.$resolveWorkspaceSymbol = function (handle, symbol) {
            return this._withAdapter(handle, NavigateTypeAdapter, function (adapter) { return adapter.resolveWorkspaceSymbol(symbol); });
        };
        ExtHostLanguageFeatures.prototype.$releaseWorkspaceSymbols = function (handle, id) {
            this._withAdapter(handle, NavigateTypeAdapter, function (adapter) { return adapter.releaseWorkspaceSymbols(id); });
        };
        // --- rename
        ExtHostLanguageFeatures.prototype.registerRenameProvider = function (selector, provider, canUseProposedApi) {
            if (canUseProposedApi === void 0) { canUseProposedApi = false; }
            var handle = this._addNewAdapter(new RenameAdapter(this._documents, provider));
            this._proxy.$registerRenameSupport(handle, selector, canUseProposedApi && RenameAdapter.supportsResolving(provider));
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideRenameEdits = function (handle, resource, position, newName) {
            return this._withAdapter(handle, RenameAdapter, function (adapter) { return adapter.provideRenameEdits(uri_1.default.revive(resource), position, newName); });
        };
        ExtHostLanguageFeatures.prototype.$resolveInitialRenameValue = function (handle, resource, position) {
            return this._withAdapter(handle, RenameAdapter, function (adapter) { return adapter.resolveInitialRenameValue(resource, position); });
        };
        // --- suggestion
        ExtHostLanguageFeatures.prototype.registerCompletionItemProvider = function (selector, provider, triggerCharacters) {
            var handle = this._addNewAdapter(new SuggestAdapter(this._documents, this._commands.converter, provider));
            this._proxy.$registerSuggestSupport(handle, selector, triggerCharacters, SuggestAdapter.supportsResolving(provider));
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideCompletionItems = function (handle, resource, position, context) {
            return this._withAdapter(handle, SuggestAdapter, function (adapter) { return adapter.provideCompletionItems(uri_1.default.revive(resource), position, context); });
        };
        ExtHostLanguageFeatures.prototype.$resolveCompletionItem = function (handle, resource, position, suggestion) {
            return this._withAdapter(handle, SuggestAdapter, function (adapter) { return adapter.resolveCompletionItem(uri_1.default.revive(resource), position, suggestion); });
        };
        ExtHostLanguageFeatures.prototype.$releaseCompletionItems = function (handle, id) {
            this._withAdapter(handle, SuggestAdapter, function (adapter) { return adapter.releaseCompletionItems(id); });
        };
        // --- parameter hints
        ExtHostLanguageFeatures.prototype.registerSignatureHelpProvider = function (selector, provider, triggerCharacters) {
            var handle = this._addNewAdapter(new SignatureHelpAdapter(this._documents, provider));
            this._proxy.$registerSignatureHelpProvider(handle, selector, triggerCharacters);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideSignatureHelp = function (handle, resource, position) {
            return this._withAdapter(handle, SignatureHelpAdapter, function (adapter) { return adapter.provideSignatureHelp(uri_1.default.revive(resource), position); });
        };
        // --- links
        ExtHostLanguageFeatures.prototype.registerDocumentLinkProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new LinkProviderAdapter(this._documents, this._heapService, provider));
            this._proxy.$registerDocumentLinkProvider(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideDocumentLinks = function (handle, resource) {
            return this._withAdapter(handle, LinkProviderAdapter, function (adapter) { return adapter.provideLinks(uri_1.default.revive(resource)); });
        };
        ExtHostLanguageFeatures.prototype.$resolveDocumentLink = function (handle, link) {
            return this._withAdapter(handle, LinkProviderAdapter, function (adapter) { return adapter.resolveLink(link); });
        };
        ExtHostLanguageFeatures.prototype.registerColorProvider = function (selector, provider) {
            var handle = this._addNewAdapter(new ColorProviderAdapter(this._documents, provider));
            this._proxy.$registerDocumentColorProvider(handle, selector);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures.prototype.$provideDocumentColors = function (handle, resource) {
            return this._withAdapter(handle, ColorProviderAdapter, function (adapter) { return adapter.provideColors(uri_1.default.revive(resource)); });
        };
        ExtHostLanguageFeatures.prototype.$provideColorPresentations = function (handle, resource, colorInfo) {
            return this._withAdapter(handle, ColorProviderAdapter, function (adapter) { return adapter.provideColorPresentations(uri_1.default.revive(resource), colorInfo); });
        };
        // --- configuration
        ExtHostLanguageFeatures._serializeRegExp = function (regExp) {
            if (typeof regExp === 'undefined') {
                return undefined;
            }
            if (regExp === null) {
                return null;
            }
            return {
                pattern: regExp.source,
                flags: (regExp.global ? 'g' : '') + (regExp.ignoreCase ? 'i' : '') + (regExp.multiline ? 'm' : ''),
            };
        };
        ExtHostLanguageFeatures._serializeIndentationRule = function (indentationRule) {
            if (typeof indentationRule === 'undefined') {
                return undefined;
            }
            if (indentationRule === null) {
                return null;
            }
            return {
                decreaseIndentPattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.decreaseIndentPattern),
                increaseIndentPattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.increaseIndentPattern),
                indentNextLinePattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.indentNextLinePattern),
                unIndentedLinePattern: ExtHostLanguageFeatures._serializeRegExp(indentationRule.unIndentedLinePattern),
            };
        };
        ExtHostLanguageFeatures._serializeOnEnterRule = function (onEnterRule) {
            return {
                beforeText: ExtHostLanguageFeatures._serializeRegExp(onEnterRule.beforeText),
                afterText: ExtHostLanguageFeatures._serializeRegExp(onEnterRule.afterText),
                action: onEnterRule.action
            };
        };
        ExtHostLanguageFeatures._serializeOnEnterRules = function (onEnterRules) {
            if (typeof onEnterRules === 'undefined') {
                return undefined;
            }
            if (onEnterRules === null) {
                return null;
            }
            return onEnterRules.map(ExtHostLanguageFeatures._serializeOnEnterRule);
        };
        ExtHostLanguageFeatures.prototype.setLanguageConfiguration = function (languageId, configuration) {
            var wordPattern = configuration.wordPattern;
            // check for a valid word pattern
            if (wordPattern && strings_1.regExpLeadsToEndlessLoop(wordPattern)) {
                throw new Error("Invalid language configuration: wordPattern '" + wordPattern + "' is not allowed to match the empty string.");
            }
            // word definition
            if (wordPattern) {
                this._documents.setWordDefinitionFor(languageId, wordPattern);
            }
            else {
                this._documents.setWordDefinitionFor(languageId, null);
            }
            var handle = this._nextHandle();
            var serializedConfiguration = {
                comments: configuration.comments,
                brackets: configuration.brackets,
                wordPattern: ExtHostLanguageFeatures._serializeRegExp(configuration.wordPattern),
                indentationRules: ExtHostLanguageFeatures._serializeIndentationRule(configuration.indentationRules),
                onEnterRules: ExtHostLanguageFeatures._serializeOnEnterRules(configuration.onEnterRules),
                __electricCharacterSupport: configuration.__electricCharacterSupport,
                __characterPairSupport: configuration.__characterPairSupport,
            };
            this._proxy.$setLanguageConfiguration(handle, languageId, serializedConfiguration);
            return this._createDisposable(handle);
        };
        ExtHostLanguageFeatures._handlePool = 0;
        return ExtHostLanguageFeatures;
    }());
    exports.ExtHostLanguageFeatures = ExtHostLanguageFeatures;
});
