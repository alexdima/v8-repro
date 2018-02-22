define(["require", "exports", "assert", "vs/editor/common/modes/languageConfiguration", "vs/editor/common/modes/supports/onEnter"], function (require, exports, assert, languageConfiguration_1, onEnter_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OnEnter', function () {
        test('uses brackets', function () {
            var brackets = [
                ['(', ')'],
                ['begin', 'end']
            ];
            var support = new onEnter_1.OnEnterSupport({
                brackets: brackets
            });
            var testIndentAction = function (beforeText, afterText, expected) {
                var actual = support.onEnter('', beforeText, afterText);
                if (expected === languageConfiguration_1.IndentAction.None) {
                    assert.equal(actual, null);
                }
                else {
                    assert.equal(actual.indentAction, expected);
                }
            };
            testIndentAction('a', '', languageConfiguration_1.IndentAction.None);
            testIndentAction('', 'b', languageConfiguration_1.IndentAction.None);
            testIndentAction('(', 'b', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('a', ')', languageConfiguration_1.IndentAction.None);
            testIndentAction('begin', 'ending', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('abegin', 'end', languageConfiguration_1.IndentAction.None);
            testIndentAction('begin', ')', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('begin', 'end', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('begin ', ' end', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction(' begin', 'end//as', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('(', ')', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('( ', ')', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('a(', ')b', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('(', '', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('(', 'foo', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('begin', 'foo', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('begin', '', languageConfiguration_1.IndentAction.Indent);
        });
        test('uses regExpRules', function () {
            var support = new onEnter_1.OnEnterSupport({
                regExpRules: [
                    {
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        afterText: /^\s*\*\/$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.IndentOutdent, appendText: ' * ' }
                    },
                    {
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: ' * ' }
                    },
                    {
                        beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: '* ' }
                    },
                    {
                        beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
                    },
                    {
                        beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
                    }
                ]
            });
            var testIndentAction = function (beforeText, afterText, expectedIndentAction, expectedAppendText, removeText) {
                if (removeText === void 0) { removeText = 0; }
                var actual = support.onEnter('', beforeText, afterText);
                if (expectedIndentAction === null) {
                    assert.equal(actual, null, 'isNull:' + beforeText);
                }
                else {
                    assert.equal(actual !== null, true, 'isNotNull:' + beforeText);
                    assert.equal(actual.indentAction, expectedIndentAction, 'indentAction:' + beforeText);
                    if (expectedAppendText !== null) {
                        assert.equal(actual.appendText, expectedAppendText, 'appendText:' + beforeText);
                    }
                    if (removeText !== 0) {
                        assert.equal(actual.removeText, removeText, 'removeText:' + beforeText);
                    }
                }
            };
            testIndentAction('\t/**', ' */', languageConfiguration_1.IndentAction.IndentOutdent, ' * ');
            testIndentAction('\t/**', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('\t/** * / * / * /', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('\t/** /*', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('/**', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('\t/**/', '', null, null);
            testIndentAction('\t/***/', '', null, null);
            testIndentAction('\t/*******/', '', null, null);
            testIndentAction('\t/** * * * * */', '', null, null);
            testIndentAction('\t/** */', '', null, null);
            testIndentAction('\t/** asdfg */', '', null, null);
            testIndentAction('\t/* asdfg */', '', null, null);
            testIndentAction('\t/* asdfg */', '', null, null);
            testIndentAction('\t/** asdfg */', '', null, null);
            testIndentAction('*/', '', null, null);
            testIndentAction('\t/*', '', null, null);
            testIndentAction('\t*', '', null, null);
            testIndentAction('\t *', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('\t */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('\t * */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('\t * * / * / * / */', '', null, null);
            testIndentAction('\t * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * asdfsfagadfg', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * asdfsfagadfg * * * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * asdfsfagadfg * / * / * /', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * asdfsfagadfg * / * / * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('\t */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('\t\t */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('   */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('     */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('\t     */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction(' *--------------------------------------------------------------------------------------------*/', '', languageConfiguration_1.IndentAction.None, null, 1);
        });
    });
});
