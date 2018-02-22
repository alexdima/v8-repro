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
define(["require", "exports", "assert", "vs/editor/common/core/selection", "vs/editor/contrib/comment/lineCommentCommand", "vs/editor/test/browser/testCommand", "vs/editor/test/common/commentMode", "vs/editor/common/modes", "vs/editor/common/modes/nullMode", "vs/editor/common/core/token", "vs/editor/test/common/mocks/mockMode", "vs/editor/common/modes/languageConfigurationRegistry"], function (require, exports, assert, selection_1, lineCommentCommand_1, testCommand_1, commentMode_1, modes, nullMode_1, token_1, mockMode_1, languageConfigurationRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Contrib - Line Comment Command', function () {
        function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
            var mode = new commentMode_1.CommentMode({ lineComment: '!@#', blockComment: ['<!@#', '#@!>'] });
            testCommand_1.testCommand(lines, mode.getLanguageIdentifier(), selection, function (sel) { return new lineCommentCommand_1.LineCommentCommand(sel, 4, 0 /* Toggle */); }, expectedLines, expectedSelection);
            mode.dispose();
        }
        function testAddLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
            var mode = new commentMode_1.CommentMode({ lineComment: '!@#', blockComment: ['<!@#', '#@!>'] });
            testCommand_1.testCommand(lines, mode.getLanguageIdentifier(), selection, function (sel) { return new lineCommentCommand_1.LineCommentCommand(sel, 4, 1 /* ForceAdd */); }, expectedLines, expectedSelection);
            mode.dispose();
        }
        test('comment single line', function () {
            testLineCommentCommand([
                'some text',
                '\tsome more text'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@# some text',
                '\tsome more text'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        function createSimpleModel(lines) {
            return {
                getLineContent: function (lineNumber) {
                    return lines[lineNumber - 1];
                }
            };
        }
        function createBasicLinePreflightData(commentTokens) {
            return commentTokens.map(function (commentString) {
                var r = {
                    ignore: false,
                    commentStr: commentString,
                    commentStrOffset: 0,
                    commentStrLength: commentString.length
                };
                return r;
            });
        }
        test('_analyzeLines', function () {
            var r;
            r = lineCommentCommand_1.LineCommentCommand._analyzeLines(0 /* Toggle */, createSimpleModel([
                '\t\t',
                '    ',
                '    c',
                '\t\td'
            ]), createBasicLinePreflightData(['//', 'rem', '!@#', '!@#']), 1);
            assert.equal(r.shouldRemoveComments, false);
            // Does not change `commentStr`
            assert.equal(r.lines[0].commentStr, '//');
            assert.equal(r.lines[1].commentStr, 'rem');
            assert.equal(r.lines[2].commentStr, '!@#');
            assert.equal(r.lines[3].commentStr, '!@#');
            // Fills in `isWhitespace`
            assert.equal(r.lines[0].ignore, true);
            assert.equal(r.lines[1].ignore, true);
            assert.equal(r.lines[2].ignore, false);
            assert.equal(r.lines[3].ignore, false);
            // Fills in `commentStrOffset`
            assert.equal(r.lines[0].commentStrOffset, 2);
            assert.equal(r.lines[1].commentStrOffset, 4);
            assert.equal(r.lines[2].commentStrOffset, 4);
            assert.equal(r.lines[3].commentStrOffset, 2);
            r = lineCommentCommand_1.LineCommentCommand._analyzeLines(0 /* Toggle */, createSimpleModel([
                '\t\t',
                '    rem ',
                '    !@# c',
                '\t\t!@#d'
            ]), createBasicLinePreflightData(['//', 'rem', '!@#', '!@#']), 1);
            assert.equal(r.shouldRemoveComments, true);
            // Does not change `commentStr`
            assert.equal(r.lines[0].commentStr, '//');
            assert.equal(r.lines[1].commentStr, 'rem');
            assert.equal(r.lines[2].commentStr, '!@#');
            assert.equal(r.lines[3].commentStr, '!@#');
            // Fills in `isWhitespace`
            assert.equal(r.lines[0].ignore, true);
            assert.equal(r.lines[1].ignore, false);
            assert.equal(r.lines[2].ignore, false);
            assert.equal(r.lines[3].ignore, false);
            // Fills in `commentStrOffset`
            assert.equal(r.lines[0].commentStrOffset, 2);
            assert.equal(r.lines[1].commentStrOffset, 4);
            assert.equal(r.lines[2].commentStrOffset, 4);
            assert.equal(r.lines[3].commentStrOffset, 2);
            // Fills in `commentStrLength`
            assert.equal(r.lines[0].commentStrLength, 2);
            assert.equal(r.lines[1].commentStrLength, 4);
            assert.equal(r.lines[2].commentStrLength, 4);
            assert.equal(r.lines[3].commentStrLength, 3);
        });
        test('_normalizeInsertionPoint', function () {
            var runTest = function (mixedArr, tabSize, expected, testName) {
                var model = createSimpleModel(mixedArr.filter(function (item, idx) { return idx % 2 === 0; }));
                var offsets = mixedArr.filter(function (item, idx) { return idx % 2 === 1; }).map(function (offset) {
                    return {
                        commentStrOffset: offset,
                        ignore: false
                    };
                });
                lineCommentCommand_1.LineCommentCommand._normalizeInsertionPoint(model, offsets, 1, tabSize);
                var actual = offsets.map(function (item) { return item.commentStrOffset; });
                assert.deepEqual(actual, expected, testName);
            };
            // Bug 16696:[comment] comments not aligned in this case
            runTest([
                '  XX', 2,
                '    YY', 4
            ], 4, [0, 0], 'Bug 16696');
            runTest([
                '\t\t\tXX', 3,
                '    \tYY', 5,
                '        ZZ', 8,
                '\t\tTT', 2
            ], 4, [2, 5, 8, 2], 'Test1');
            runTest([
                '\t\t\t   XX', 6,
                '    \t\t\t\tYY', 8,
                '        ZZ', 8,
                '\t\t    TT', 6
            ], 4, [2, 5, 8, 2], 'Test2');
            runTest([
                '\t\t', 2,
                '\t\t\t', 3,
                '\t\t\t\t', 4,
                '\t\t\t', 3
            ], 4, [2, 2, 2, 2], 'Test3');
            runTest([
                '\t\t', 2,
                '\t\t\t', 3,
                '\t\t\t\t', 4,
                '\t\t\t', 3,
                '    ', 4
            ], 2, [2, 2, 2, 2, 4], 'Test4');
            runTest([
                '\t\t', 2,
                '\t\t\t', 3,
                '\t\t\t\t', 4,
                '\t\t\t', 3,
                '    ', 4
            ], 4, [1, 1, 1, 1, 4], 'Test5');
            runTest([
                ' \t', 2,
                '  \t', 3,
                '   \t', 4,
                '    ', 4,
                '\t', 1
            ], 4, [2, 3, 4, 4, 1], 'Test6');
            runTest([
                ' \t\t', 3,
                '  \t\t', 4,
                '   \t\t', 5,
                '    \t', 5,
                '\t', 1
            ], 4, [2, 3, 4, 4, 1], 'Test7');
            runTest([
                '\t', 1,
                '    ', 4
            ], 4, [1, 4], 'Test8:4');
            runTest([
                '\t', 1,
                '   ', 3
            ], 4, [0, 0], 'Test8:3');
            runTest([
                '\t', 1,
                '  ', 2
            ], 4, [0, 0], 'Test8:2');
            runTest([
                '\t', 1,
                ' ', 1
            ], 4, [0, 0], 'Test8:1');
            runTest([
                '\t', 1,
                '', 0
            ], 4, [0, 0], 'Test8:0');
        });
        test('detects indentation', function () {
            testLineCommentCommand([
                '\tsome text',
                '\tsome more text'
            ], new selection_1.Selection(2, 2, 1, 1), [
                '\t!@# some text',
                '\t!@# some more text'
            ], new selection_1.Selection(1, 1, 2, 2));
        });
        test('detects mixed indentation', function () {
            testLineCommentCommand([
                '\tsome text',
                '    some more text'
            ], new selection_1.Selection(2, 2, 1, 1), [
                '\t!@# some text',
                '    !@# some more text'
            ], new selection_1.Selection(1, 1, 2, 2));
        });
        test('ignores whitespace lines', function () {
            testLineCommentCommand([
                '\tsome text',
                '\t   ',
                '',
                '\tsome more text'
            ], new selection_1.Selection(4, 2, 1, 1), [
                '\t!@# some text',
                '\t   ',
                '',
                '\t!@# some more text'
            ], new selection_1.Selection(1, 1, 4, 2));
        });
        test('removes its own', function () {
            testLineCommentCommand([
                '\t!@# some text',
                '\t   ',
                '\t\t!@# some more text'
            ], new selection_1.Selection(3, 2, 1, 1), [
                '\tsome text',
                '\t   ',
                '\t\tsome more text'
            ], new selection_1.Selection(1, 1, 3, 2));
        });
        test('works in only whitespace', function () {
            testLineCommentCommand([
                '\t    ',
                '\t',
                '\t\tsome more text'
            ], new selection_1.Selection(3, 1, 1, 1), [
                '\t!@#     ',
                '\t!@# ',
                '\t\tsome more text'
            ], new selection_1.Selection(1, 1, 3, 1));
        });
        test('bug 9697 - whitespace before comment token', function () {
            testLineCommentCommand([
                '\t !@#first',
                '\tsecond line'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '\t first',
                '\tsecond line'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
        test('bug 10162 - line comment before caret', function () {
            testLineCommentCommand([
                'first!@#',
                '\tsecond line'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@# first!@#',
                '\tsecond line'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('comment single line - leading whitespace', function () {
            testLineCommentCommand([
                'first!@#',
                '\tsecond line'
            ], new selection_1.Selection(2, 3, 2, 1), [
                'first!@#',
                '\t!@# second line'
            ], new selection_1.Selection(2, 1, 2, 7));
        });
        test('ignores invisible selection', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 1, 1), [
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 2, 1));
        });
        test('multiple lines', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 4, 1, 1), [
                '!@# first',
                '!@# \tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 2, 8));
        });
        test('multiple modes on multiple lines', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 4, 3, 1), [
                'first',
                '\tsecond line',
                '!@# third line',
                '!@# fourth line',
                'fifth'
            ], new selection_1.Selection(3, 5, 4, 8));
        });
        test('toggle single line', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
            testLineCommentCommand([
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 4, 1, 4), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
        test('toggle multiple lines', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 4, 1, 1), [
                '!@# first',
                '!@# \tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 2, 8));
            testLineCommentCommand([
                '!@# first',
                '!@# \tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 7, 1, 4), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 2, 3));
        });
        test('issue #5964: Ctrl+/ to create comment when cursor is at the beginning of the line puts the cursor in a strange position', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '!@# first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('issue #35673: Comment hotkeys throws the cursor before the comment', function () {
            testLineCommentCommand([
                'first',
                '',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 2, 1), [
                'first',
                '!@# ',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 5, 2, 5));
            testLineCommentCommand([
                'first',
                '\t',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 2, 2, 2), [
                'first',
                '\t!@# ',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 6, 2, 6));
        });
        test('issue #2837 "Add Line Comment" fault when blank lines involved', function () {
            testAddLineCommentCommand([
                '    if displayName == "":',
                '        displayName = groupName',
                '    description = getAttr(attributes, "description")',
                '    mailAddress = getAttr(attributes, "mail")',
                '',
                '    print "||Group name|%s|" % displayName',
                '    print "||Description|%s|" % description',
                '    print "||Email address|[mailto:%s]|" % mailAddress`',
            ], new selection_1.Selection(1, 1, 8, 56), [
                '    !@# if displayName == "":',
                '    !@#     displayName = groupName',
                '    !@# description = getAttr(attributes, "description")',
                '    !@# mailAddress = getAttr(attributes, "mail")',
                '',
                '    !@# print "||Group name|%s|" % displayName',
                '    !@# print "||Description|%s|" % description',
                '    !@# print "||Email address|[mailto:%s]|" % mailAddress`',
            ], new selection_1.Selection(1, 1, 8, 60));
        });
    });
    suite('Editor Contrib - Line Comment As Block Comment', function () {
        function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
            var mode = new commentMode_1.CommentMode({ lineComment: '', blockComment: ['(', ')'] });
            testCommand_1.testCommand(lines, mode.getLanguageIdentifier(), selection, function (sel) { return new lineCommentCommand_1.LineCommentCommand(sel, 4, 0 /* Toggle */); }, expectedLines, expectedSelection);
            mode.dispose();
        }
        test('fall back to block comment command', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '( first )',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 3));
        });
        test('fall back to block comment command - toggle', function () {
            testLineCommentCommand([
                '(first)',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 7, 1, 2), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 6));
        });
        test('bug 9513 - expand single line to uncomment auto block', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '( first )',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 3, 1, 3));
        });
        test('bug 9691 - always expand selection to line boundaries', function () {
            testLineCommentCommand([
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 2, 1, 3), [
                '( first',
                '\tsecond line',
                'third line )',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 3, 2));
            testLineCommentCommand([
                '(first',
                '\tsecond line',
                'third line)',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 11, 1, 2), [
                'first',
                '\tsecond line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 3, 11));
        });
    });
    suite('Editor Contrib - Line Comment As Block Comment 2', function () {
        function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
            var mode = new commentMode_1.CommentMode({ lineComment: null, blockComment: ['<!@#', '#@!>'] });
            testCommand_1.testCommand(lines, mode.getLanguageIdentifier(), selection, function (sel) { return new lineCommentCommand_1.LineCommentCommand(sel, 4, 0 /* Toggle */); }, expectedLines, expectedSelection);
            mode.dispose();
        }
        test('no selection => uses indentation', function () {
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '\t\t<!@# first\t     #@!>',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(1, 1, 1, 1));
            testLineCommentCommand([
                '\t\t<!@#first\t    #@!>',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(1, 1, 1, 1), [
                '\t\tfirst\t   ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
        test('can remove', function () {
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 1, 5, 1), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 1, 5, 1));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 3, 5, 3), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 3, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 4, 5, 4), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 3, 5, 3));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 16, 5, 3), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 3, 5, 8));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 12, 5, 7), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 3, 5, 8));
            testLineCommentCommand([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], new selection_1.Selection(5, 18, 5, 18), [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ], new selection_1.Selection(5, 10, 5, 10));
        });
        test('issue #993: Remove comment does not work consistently in HTML', function () {
            testLineCommentCommand([
                '     asd qwe',
                '     asd qwe',
                ''
            ], new selection_1.Selection(1, 1, 3, 1), [
                '     <!@# asd qwe',
                '     asd qwe #@!>',
                ''
            ], new selection_1.Selection(1, 1, 3, 1));
            testLineCommentCommand([
                '     <!@#asd qwe',
                '     asd qwe#@!>',
                ''
            ], new selection_1.Selection(1, 1, 3, 1), [
                '     asd qwe',
                '     asd qwe',
                ''
            ], new selection_1.Selection(1, 1, 3, 1));
        });
    });
    suite('Editor Contrib - Line Comment in mixed modes', function () {
        var OUTER_LANGUAGE_ID = new modes.LanguageIdentifier('outerMode', 3);
        var INNER_LANGUAGE_ID = new modes.LanguageIdentifier('innerMode', 4);
        var OuterMode = /** @class */ (function (_super) {
            __extends(OuterMode, _super);
            function OuterMode(commentsConfig) {
                var _this = _super.call(this, OUTER_LANGUAGE_ID) || this;
                _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                    comments: commentsConfig
                }));
                _this._register(modes.TokenizationRegistry.register(_this.getLanguageIdentifier().language, {
                    getInitialState: function () { return nullMode_1.NULL_STATE; },
                    tokenize: undefined,
                    tokenize2: function (line, state) {
                        var languageId = (/^  /.test(line) ? INNER_LANGUAGE_ID : OUTER_LANGUAGE_ID);
                        var tokens = new Uint32Array(1 << 1);
                        tokens[(0 << 1)] = 0;
                        tokens[(0 << 1) + 1] = ((1 /* DefaultForeground */ << 14 /* FOREGROUND_OFFSET */)
                            | (languageId.id << 0 /* LANGUAGEID_OFFSET */));
                        return new token_1.TokenizationResult2(tokens, state);
                    }
                }));
                return _this;
            }
            return OuterMode;
        }(mockMode_1.MockMode));
        var InnerMode = /** @class */ (function (_super) {
            __extends(InnerMode, _super);
            function InnerMode(commentsConfig) {
                var _this = _super.call(this, INNER_LANGUAGE_ID) || this;
                _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                    comments: commentsConfig
                }));
                return _this;
            }
            return InnerMode;
        }(mockMode_1.MockMode));
        function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
            var outerMode = new OuterMode({ lineComment: '//', blockComment: ['/*', '*/'] });
            var innerMode = new InnerMode({ lineComment: null, blockComment: ['{/*', '*/}'] });
            testCommand_1.testCommand(lines, outerMode.getLanguageIdentifier(), selection, function (sel) { return new lineCommentCommand_1.LineCommentCommand(sel, 4, 0 /* Toggle */); }, expectedLines, expectedSelection);
            innerMode.dispose();
            outerMode.dispose();
        }
        test('issue #24047 (part 1): Commenting code in JSX files', function () {
            testLineCommentCommand([
                'import React from \'react\';',
                'const Loader = () => (',
                '  <div>',
                '    Loading...',
                '  </div>',
                ');',
                'export default Loader;'
            ], new selection_1.Selection(1, 1, 7, 22), [
                '// import React from \'react\';',
                '// const Loader = () => (',
                '//   <div>',
                '//     Loading...',
                '//   </div>',
                '// );',
                '// export default Loader;'
            ], new selection_1.Selection(1, 4, 7, 25));
        });
        test('issue #24047 (part 2): Commenting code in JSX files', function () {
            testLineCommentCommand([
                'import React from \'react\';',
                'const Loader = () => (',
                '  <div>',
                '    Loading...',
                '  </div>',
                ');',
                'export default Loader;'
            ], new selection_1.Selection(3, 4, 3, 4), [
                'import React from \'react\';',
                'const Loader = () => (',
                '  {/* <div> */}',
                '    Loading...',
                '  </div>',
                ');',
                'export default Loader;'
            ], new selection_1.Selection(3, 8, 3, 8));
        });
        test('issue #36173: Commenting code in JSX tag body', function () {
            testLineCommentCommand([
                '<div>',
                '  {123}',
                '</div>',
            ], new selection_1.Selection(2, 4, 2, 4), [
                '<div>',
                '  {/* {123} */}',
                '</div>',
            ], new selection_1.Selection(2, 8, 2, 8));
        });
    });
});
