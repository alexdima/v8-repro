define(["require", "exports", "vs/base/common/async", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/objects", "vs/base/common/errors", "vs/base/common/winjs.base", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "vs/platform/contextkey/common/contextkey"], function (require, exports, async_1, arrays_1, strings_1, objects_1, errors_1, winjs_base_1, editorExtensions_1, modes_1, contextkey_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Context = {
        Visible: new contextkey_1.RawContextKey('suggestWidgetVisible', false),
        MultipleSuggestions: new contextkey_1.RawContextKey('suggestWidgetMultipleSuggestions', false),
        MakesTextEdit: new contextkey_1.RawContextKey('suggestionMakesTextEdit', true),
        AcceptOnKey: new contextkey_1.RawContextKey('suggestionSupportsAcceptOnKey', true),
        AcceptSuggestionsOnEnter: new contextkey_1.RawContextKey('acceptSuggestionOnEnter', true)
    };
    var _snippetSuggestSupport;
    function setSnippetSuggestSupport(support) {
        var old = _snippetSuggestSupport;
        _snippetSuggestSupport = support;
        return old;
    }
    exports.setSnippetSuggestSupport = setSnippetSuggestSupport;
    function provideSuggestionItems(model, position, snippetConfig, onlyFrom, context) {
        if (snippetConfig === void 0) { snippetConfig = 'bottom'; }
        var allSuggestions = [];
        var acceptSuggestion = createSuggesionFilter(snippetConfig);
        position = position.clone();
        // get provider groups, always add snippet suggestion provider
        var supports = modes_1.SuggestRegistry.orderedGroups(model);
        // add snippets provider unless turned off
        if (snippetConfig !== 'none' && _snippetSuggestSupport) {
            supports.unshift([_snippetSuggestSupport]);
        }
        var suggestConext = context || { triggerKind: modes_1.SuggestTriggerKind.Invoke };
        // add suggestions from contributed providers - providers are ordered in groups of
        // equal score and once a group produces a result the process stops
        var hasResult = false;
        var factory = supports.map(function (supports) {
            return function () {
                // stop when we have a result
                if (hasResult) {
                    return undefined;
                }
                // for each support in the group ask for suggestions
                return winjs_base_1.TPromise.join(supports.map(function (support) {
                    if (!arrays_1.isFalsyOrEmpty(onlyFrom) && onlyFrom.indexOf(support) < 0) {
                        return undefined;
                    }
                    return async_1.asWinJsPromise(function (token) { return support.provideCompletionItems(model, position, suggestConext, token); }).then(function (container) {
                        var len = allSuggestions.length;
                        if (container && !arrays_1.isFalsyOrEmpty(container.suggestions)) {
                            for (var _i = 0, _a = container.suggestions; _i < _a.length; _i++) {
                                var suggestion = _a[_i];
                                if (acceptSuggestion(suggestion)) {
                                    fixOverwriteBeforeAfter(suggestion, container);
                                    allSuggestions.push({
                                        position: position,
                                        container: container,
                                        suggestion: suggestion,
                                        support: support,
                                        resolve: createSuggestionResolver(support, suggestion, model, position)
                                    });
                                }
                            }
                        }
                        if (len !== allSuggestions.length && support !== _snippetSuggestSupport) {
                            hasResult = true;
                        }
                    }, errors_1.onUnexpectedExternalError);
                }));
            };
        });
        var result = async_1.sequence(factory).then(function () { return allSuggestions.sort(getSuggestionComparator(snippetConfig)); });
        // result.then(items => {
        // 	console.log(model.getWordUntilPosition(position), items.map(item => `${item.suggestion.label}, type=${item.suggestion.type}, incomplete?${item.container.incomplete}, overwriteBefore=${item.suggestion.overwriteBefore}`));
        // 	return items;
        // }, err => {
        // 	console.warn(model.getWordUntilPosition(position), err);
        // });
        return result;
    }
    exports.provideSuggestionItems = provideSuggestionItems;
    function fixOverwriteBeforeAfter(suggestion, container) {
        if (typeof suggestion.overwriteBefore !== 'number') {
            suggestion.overwriteBefore = 0;
        }
        if (typeof suggestion.overwriteAfter !== 'number' || suggestion.overwriteAfter < 0) {
            suggestion.overwriteAfter = 0;
        }
    }
    function createSuggestionResolver(provider, suggestion, model, position) {
        return function () {
            if (typeof provider.resolveCompletionItem === 'function') {
                return async_1.asWinJsPromise(function (token) { return provider.resolveCompletionItem(model, position, suggestion, token); })
                    .then(function (value) { objects_1.assign(suggestion, value); });
            }
            return winjs_base_1.TPromise.as(void 0);
        };
    }
    function createSuggesionFilter(snippetConfig) {
        if (snippetConfig === 'none') {
            return function (suggestion) { return suggestion.type !== 'snippet'; };
        }
        else {
            return function () { return true; };
        }
    }
    function defaultComparator(a, b) {
        var ret = 0;
        // check with 'sortText'
        if (typeof a.suggestion.sortText === 'string' && typeof b.suggestion.sortText === 'string') {
            ret = strings_1.compareIgnoreCase(a.suggestion.sortText, b.suggestion.sortText);
        }
        // check with 'label'
        if (ret === 0) {
            ret = strings_1.compareIgnoreCase(a.suggestion.label, b.suggestion.label);
        }
        // check with 'type' and lower snippets
        if (ret === 0 && a.suggestion.type !== b.suggestion.type) {
            if (a.suggestion.type === 'snippet') {
                ret = 1;
            }
            else if (b.suggestion.type === 'snippet') {
                ret = -1;
            }
        }
        return ret;
    }
    function snippetUpComparator(a, b) {
        if (a.suggestion.type !== b.suggestion.type) {
            if (a.suggestion.type === 'snippet') {
                return -1;
            }
            else if (b.suggestion.type === 'snippet') {
                return 1;
            }
        }
        return defaultComparator(a, b);
    }
    function snippetDownComparator(a, b) {
        if (a.suggestion.type !== b.suggestion.type) {
            if (a.suggestion.type === 'snippet') {
                return 1;
            }
            else if (b.suggestion.type === 'snippet') {
                return -1;
            }
        }
        return defaultComparator(a, b);
    }
    function getSuggestionComparator(snippetConfig) {
        if (snippetConfig === 'top') {
            return snippetUpComparator;
        }
        else if (snippetConfig === 'bottom') {
            return snippetDownComparator;
        }
        else {
            return defaultComparator;
        }
    }
    exports.getSuggestionComparator = getSuggestionComparator;
    editorExtensions_1.registerDefaultLanguageCommand('_executeCompletionItemProvider', function (model, position, args) {
        var result = {
            incomplete: false,
            suggestions: []
        };
        return provideSuggestionItems(model, position).then(function (items) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var _a = items_1[_i], container = _a.container, suggestion = _a.suggestion;
                result.incomplete = result.incomplete || container.incomplete;
                result.suggestions.push(suggestion);
            }
            return result;
        });
    });
    var _suggestions;
    var _provider = new /** @class */ (function () {
        function class_1() {
        }
        class_1.prototype.provideCompletionItems = function () {
            return _suggestions && { suggestions: _suggestions };
        };
        return class_1;
    }());
    modes_1.SuggestRegistry.register('*', _provider);
    function showSimpleSuggestions(editor, suggestions) {
        setTimeout(function () {
            _suggestions = suggestions;
            editor.getContribution('editor.contrib.suggestController').triggerSuggest([_provider]);
            _suggestions = undefined;
        }, 0);
    }
    exports.showSimpleSuggestions = showSimpleSuggestions;
});
