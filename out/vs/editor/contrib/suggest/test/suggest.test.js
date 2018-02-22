define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/modes", "vs/editor/contrib/suggest/suggest", "vs/editor/common/core/position", "vs/editor/common/model/textModel"], function (require, exports, assert, uri_1, modes_1, suggest_1, position_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Suggest', function () {
        var model;
        var registration;
        setup(function () {
            model = textModel_1.TextModel.createFromString('FOO\nbar\BAR\nfoo', undefined, undefined, uri_1.default.parse('foo:bar/path'));
            registration = modes_1.SuggestRegistry.register({ pattern: 'bar/path', scheme: 'foo' }, {
                provideCompletionItems: function () {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'aaa',
                                type: 'snippet',
                                insertText: 'aaa'
                            }, {
                                label: 'zzz',
                                type: 'snippet',
                                insertText: 'zzz'
                            }, {
                                label: 'fff',
                                type: 'property',
                                insertText: 'fff'
                            }]
                    };
                }
            });
        });
        teardown(function () {
            registration.dispose();
            model.dispose();
        });
        test('sort - snippet inline', function () {
            return suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), 'inline').then(function (items) {
                assert.equal(items.length, 3);
                assert.equal(items[0].suggestion.label, 'aaa');
                assert.equal(items[1].suggestion.label, 'fff');
                assert.equal(items[2].suggestion.label, 'zzz');
            });
        });
        test('sort - snippet top', function () {
            return suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), 'top').then(function (items) {
                assert.equal(items.length, 3);
                assert.equal(items[0].suggestion.label, 'aaa');
                assert.equal(items[1].suggestion.label, 'zzz');
                assert.equal(items[2].suggestion.label, 'fff');
            });
        });
        test('sort - snippet bottom', function () {
            return suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), 'bottom').then(function (items) {
                assert.equal(items.length, 3);
                assert.equal(items[0].suggestion.label, 'fff');
                assert.equal(items[1].suggestion.label, 'aaa');
                assert.equal(items[2].suggestion.label, 'zzz');
            });
        });
        test('sort - snippet none', function () {
            return suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), 'none').then(function (items) {
                assert.equal(items.length, 1);
                assert.equal(items[0].suggestion.label, 'fff');
            });
        });
        test('only from', function () {
            var foo = {
                triggerCharacters: [],
                provideCompletionItems: function () {
                    return {
                        currentWord: '',
                        incomplete: false,
                        suggestions: [{
                                label: 'jjj',
                                type: 'property',
                                insertText: 'jjj'
                            }]
                    };
                }
            };
            var registration = modes_1.SuggestRegistry.register({ pattern: 'bar/path', scheme: 'foo' }, foo);
            suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), undefined, [foo]).then(function (items) {
                registration.dispose();
                assert.equal(items.length, 1);
                assert.ok(items[0].support === foo);
            });
        });
    });
});
