/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/modes/languageSelector"], function (require, exports, assert, uri_1, languageSelector_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LanguageSelector', function () {
        var model = {
            language: 'farboo',
            uri: uri_1.default.parse('file:///testbed/file.fb')
        };
        test('score, invalid selector', function () {
            assert.equal(languageSelector_1.score({}, model.uri, model.language), 0);
            assert.equal(languageSelector_1.score(undefined, model.uri, model.language), 0);
            assert.equal(languageSelector_1.score(null, model.uri, model.language), 0);
            assert.equal(languageSelector_1.score('', model.uri, model.language), 0);
        });
        test('score, any language', function () {
            assert.equal(languageSelector_1.score({ language: '*' }, model.uri, model.language), 5);
            assert.equal(languageSelector_1.score('*', model.uri, model.language), 5);
            assert.equal(languageSelector_1.score('*', uri_1.default.parse('foo:bar'), model.language), 5);
            assert.equal(languageSelector_1.score('farboo', uri_1.default.parse('foo:bar'), model.language), 10);
        });
        test('score, default schemes', function () {
            var uri = uri_1.default.parse('git:foo/file.txt');
            var language = 'farboo';
            assert.equal(languageSelector_1.score('*', uri, language), 5);
            assert.equal(languageSelector_1.score('farboo', uri, language), 10);
            assert.equal(languageSelector_1.score({ language: 'farboo', scheme: '' }, uri, language), 10);
            assert.equal(languageSelector_1.score({ language: 'farboo', scheme: 'git' }, uri, language), 10);
            assert.equal(languageSelector_1.score({ language: 'farboo', scheme: '*' }, uri, language), 10);
            assert.equal(languageSelector_1.score({ language: 'farboo' }, uri, language), 10);
            assert.equal(languageSelector_1.score({ language: '*' }, uri, language), 5);
            assert.equal(languageSelector_1.score({ scheme: '*' }, uri, language), 5);
            assert.equal(languageSelector_1.score({ scheme: 'git' }, uri, language), 10);
        });
        test('score, filter', function () {
            assert.equal(languageSelector_1.score('farboo', model.uri, model.language), 10);
            assert.equal(languageSelector_1.score({ language: 'farboo' }, model.uri, model.language), 10);
            assert.equal(languageSelector_1.score({ language: 'farboo', scheme: 'file' }, model.uri, model.language), 10);
            assert.equal(languageSelector_1.score({ language: 'farboo', scheme: 'http' }, model.uri, model.language), 0);
            assert.equal(languageSelector_1.score({ pattern: '**/*.fb' }, model.uri, model.language), 10);
            assert.equal(languageSelector_1.score({ pattern: '**/*.fb', scheme: 'file' }, model.uri, model.language), 10);
            assert.equal(languageSelector_1.score({ pattern: '**/*.fb' }, uri_1.default.parse('foo:bar'), model.language), 0);
            assert.equal(languageSelector_1.score({ pattern: '**/*.fb', scheme: 'foo' }, uri_1.default.parse('foo:bar'), model.language), 0);
            var doc = {
                uri: uri_1.default.parse('git:/my/file.js'),
                langId: 'javascript'
            };
            assert.equal(languageSelector_1.score('javascript', doc.uri, doc.langId), 10); // 0;
            assert.equal(languageSelector_1.score({ language: 'javascript', scheme: 'git' }, doc.uri, doc.langId), 10); // 10;
            assert.equal(languageSelector_1.score('*', doc.uri, doc.langId), 5); // 5
            assert.equal(languageSelector_1.score('fooLang', doc.uri, doc.langId), 0); // 0
            assert.equal(languageSelector_1.score(['fooLang', '*'], doc.uri, doc.langId), 5); // 5
        });
        test('score, max(filters)', function () {
            var match = { language: 'farboo', scheme: 'file' };
            var fail = { language: 'farboo', scheme: 'http' };
            assert.equal(languageSelector_1.score(match, model.uri, model.language), 10);
            assert.equal(languageSelector_1.score(fail, model.uri, model.language), 0);
            assert.equal(languageSelector_1.score([match, fail], model.uri, model.language), 10);
            assert.equal(languageSelector_1.score([fail, fail], model.uri, model.language), 0);
            assert.equal(languageSelector_1.score(['farboo', '*'], model.uri, model.language), 10);
            assert.equal(languageSelector_1.score(['*', 'farboo'], model.uri, model.language), 10);
        });
    });
});
