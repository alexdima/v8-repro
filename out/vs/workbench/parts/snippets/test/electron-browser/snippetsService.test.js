/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/parts/snippets/electron-browser/snippetsService", "vs/editor/common/core/position", "vs/editor/common/modes/modesRegistry", "vs/editor/common/services/modeServiceImpl", "vs/editor/common/model/textModel", "vs/workbench/parts/snippets/electron-browser/snippetsFile"], function (require, exports, assert, snippetsService_1, position_1, modesRegistry_1, modeServiceImpl_1, textModel_1, snippetsFile_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SimpleSnippetService = /** @class */ (function () {
        function SimpleSnippetService(snippets) {
            this.snippets = snippets;
        }
        SimpleSnippetService.prototype.getSnippets = function () {
            return Promise.resolve(this.getSnippetsSync());
        };
        SimpleSnippetService.prototype.getSnippetsSync = function () {
            return this.snippets;
        };
        SimpleSnippetService.prototype.getSnippetFiles = function () {
            throw new Error();
        };
        return SimpleSnippetService;
    }());
    suite('SnippetsService', function () {
        suiteSetup(function () {
            modesRegistry_1.ModesRegistry.registerLanguage({
                id: 'fooLang',
                extensions: ['.fooLang',]
            });
        });
        var modeService;
        var snippetService;
        setup(function () {
            modeService = new modeServiceImpl_1.ModeServiceImpl();
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'barTest', 'bar', '', 'barCodeSnippet', ''), new snippetsFile_1.Snippet(['fooLang'], 'bazzTest', 'bazz', '', 'bazzCodeSnippet', '')]);
        });
        test('snippet completions - simple', function () {
            var provider = new snippetsService_1.SnippetSuggestProvider(modeService, snippetService);
            var model = textModel_1.TextModel.createFromString('', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 1)).then(function (result) {
                assert.equal(result.incomplete, undefined);
                assert.equal(result.suggestions.length, 2);
            });
        });
        test('snippet completions - with prefix', function () {
            var provider = new snippetsService_1.SnippetSuggestProvider(modeService, snippetService);
            var model = textModel_1.TextModel.createFromString('bar', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 4)).then(function (result) {
                assert.equal(result.incomplete, undefined);
                assert.equal(result.suggestions.length, 1);
                assert.equal(result.suggestions[0].label, 'bar');
                assert.equal(result.suggestions[0].insertText, 'barCodeSnippet');
            });
        });
        test('Cannot use "<?php" as user snippet prefix anymore, #26275', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], '', '<?php', '', 'insert me', '')]);
            var provider = new snippetsService_1.SnippetSuggestProvider(modeService, snippetService);
            var model = textModel_1.TextModel.createFromString('\t<?php', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 7)).then(function (result) {
                assert.equal(result.suggestions.length, 1);
                model.dispose();
                model = textModel_1.TextModel.createFromString('\t<?', undefined, modeService.getLanguageIdentifier('fooLang'));
                return provider.provideCompletionItems(model, new position_1.Position(1, 4));
            }).then(function (result) {
                assert.equal(result.suggestions.length, 1);
                model.dispose();
                model = textModel_1.TextModel.createFromString('a<?', undefined, modeService.getLanguageIdentifier('fooLang'));
                return provider.provideCompletionItems(model, new position_1.Position(1, 4));
            }).then(function (result) {
                assert.equal(result.suggestions.length, 0);
                model.dispose();
            });
        });
        test('No user snippets in suggestions, when inside the code, #30508', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], '', 'foo', '', '<foo>$0</foo>', '')]);
            var provider = new snippetsService_1.SnippetSuggestProvider(modeService, snippetService);
            var model = textModel_1.TextModel.createFromString('<head>\n\t\n>/head>', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 1)).then(function (result) {
                assert.equal(result.suggestions.length, 1);
                return provider.provideCompletionItems(model, new position_1.Position(2, 2));
            }).then(function (result) {
                assert.equal(result.suggestions.length, 1);
            });
        });
        test('SnippetSuggest - ensure extension snippets come last ', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'second', 'second', '', 'second', '', true), new snippetsFile_1.Snippet(['fooLang'], 'first', 'first', '', 'first', '', false)]);
            var provider = new snippetsService_1.SnippetSuggestProvider(modeService, snippetService);
            var model = textModel_1.TextModel.createFromString('', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 1)).then(function (result) {
                assert.equal(result.suggestions.length, 2);
                var _a = result.suggestions, first = _a[0], second = _a[1];
                assert.equal(first.label, 'first');
                assert.equal(second.label, 'second');
            });
        });
    });
});
