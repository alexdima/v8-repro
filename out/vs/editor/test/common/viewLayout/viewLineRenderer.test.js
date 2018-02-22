define(["require", "exports", "assert", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/test/common/core/viewLineToken", "vs/editor/common/viewLayout/lineDecorations"], function (require, exports, assert, viewLineRenderer_1, viewLineToken_1, lineDecorations_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createViewLineTokens(viewLineTokens) {
        return new viewLineToken_1.ViewLineTokens(viewLineTokens);
    }
    function createPart(endIndex, foreground) {
        return new viewLineToken_1.ViewLineToken(endIndex, (foreground << 14 /* FOREGROUND_OFFSET */) >>> 0);
    }
    suite('viewLineRenderer.renderLine', function () {
        function assertCharacterReplacement(lineContent, tabSize, expected, expectedCharOffsetInPart, expectedPartLengts) {
            var _actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineContent, false, 0, createViewLineTokens([new viewLineToken_1.ViewLineToken(lineContent.length, 0)]), [], tabSize, 0, -1, 'none', false, false));
            assert.equal(_actual.html, '<span><span class="mtk0">' + expected + '</span></span>');
            assertCharacterMapping(_actual.characterMapping, expectedCharOffsetInPart, expectedPartLengts);
        }
        test('replaces spaces', function () {
            assertCharacterReplacement(' ', 4, '\u00a0', [[0, 1]], [1]);
            assertCharacterReplacement('  ', 4, '\u00a0\u00a0', [[0, 1, 2]], [2]);
            assertCharacterReplacement('a  b', 4, 'a\u00a0\u00a0b', [[0, 1, 2, 3, 4]], [4]);
        });
        test('escapes HTML markup', function () {
            assertCharacterReplacement('a<b', 4, 'a&lt;b', [[0, 1, 2, 3]], [3]);
            assertCharacterReplacement('a>b', 4, 'a&gt;b', [[0, 1, 2, 3]], [3]);
            assertCharacterReplacement('a&b', 4, 'a&amp;b', [[0, 1, 2, 3]], [3]);
        });
        test('replaces some bad characters', function () {
            assertCharacterReplacement('a\0b', 4, 'a&#00;b', [[0, 1, 2, 3]], [3]);
            assertCharacterReplacement('a' + String.fromCharCode(65279 /* UTF8_BOM */) + 'b', 4, 'a\ufffdb', [[0, 1, 2, 3]], [3]);
            assertCharacterReplacement('a\u2028b', 4, 'a\ufffdb', [[0, 1, 2, 3]], [3]);
        });
        test('handles tabs', function () {
            assertCharacterReplacement('\t', 4, '\u00a0\u00a0\u00a0\u00a0', [[0, 4]], [4]);
            assertCharacterReplacement('x\t', 4, 'x\u00a0\u00a0\u00a0', [[0, 1, 4]], [4]);
            assertCharacterReplacement('xx\t', 4, 'xx\u00a0\u00a0', [[0, 1, 2, 4]], [4]);
            assertCharacterReplacement('xxx\t', 4, 'xxx\u00a0', [[0, 1, 2, 3, 4]], [4]);
            assertCharacterReplacement('xxxx\t', 4, 'xxxx\u00a0\u00a0\u00a0\u00a0', [[0, 1, 2, 3, 4, 8]], [8]);
        });
        function assertParts(lineContent, tabSize, parts, expected, expectedCharOffsetInPart, expectedPartLengts) {
            var _actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineContent, false, 0, createViewLineTokens(parts), [], tabSize, 0, -1, 'none', false, false));
            assert.equal(_actual.html, '<span>' + expected + '</span>');
            assertCharacterMapping(_actual.characterMapping, expectedCharOffsetInPart, expectedPartLengts);
        }
        test('empty line', function () {
            assertParts('', 4, [], '<span>\u00a0</span>', [], []);
        });
        test('uses part type', function () {
            assertParts('x', 4, [createPart(1, 10)], '<span class="mtk10">x</span>', [[0, 1]], [1]);
            assertParts('x', 4, [createPart(1, 20)], '<span class="mtk20">x</span>', [[0, 1]], [1]);
            assertParts('x', 4, [createPart(1, 30)], '<span class="mtk30">x</span>', [[0, 1]], [1]);
        });
        test('two parts', function () {
            assertParts('xy', 4, [createPart(1, 1), createPart(2, 2)], '<span class="mtk1">x</span><span class="mtk2">y</span>', [[0], [0, 1]], [1, 1]);
            assertParts('xyz', 4, [createPart(1, 1), createPart(3, 2)], '<span class="mtk1">x</span><span class="mtk2">yz</span>', [[0], [0, 1, 2]], [1, 2]);
            assertParts('xyz', 4, [createPart(2, 1), createPart(3, 2)], '<span class="mtk1">xy</span><span class="mtk2">z</span>', [[0, 1], [0, 1]], [2, 1]);
        });
        test('overflow', function () {
            var _actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, 'Hello world!', false, 0, createViewLineTokens([
                createPart(1, 0),
                createPart(2, 1),
                createPart(3, 2),
                createPart(4, 3),
                createPart(5, 4),
                createPart(6, 5),
                createPart(7, 6),
                createPart(8, 7),
                createPart(9, 8),
                createPart(10, 9),
                createPart(11, 10),
                createPart(12, 11),
            ]), [], 4, 10, 6, 'boundary', false, false));
            var expectedOutput = [
                '<span class="mtk0">H</span>',
                '<span class="mtk1">e</span>',
                '<span class="mtk2">l</span>',
                '<span class="mtk3">l</span>',
                '<span class="mtk4">o</span>',
                '<span class="mtk5">\u00a0</span>',
                '<span>&hellip;</span>'
            ].join('');
            assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
            assertCharacterMapping(_actual.characterMapping, [
                [0],
                [0],
                [0],
                [0],
                [0],
                [0, 1],
            ], [1, 1, 1, 1, 1, 1]);
        });
        test('typical line', function () {
            var lineText = '\t    export class Game { // http://test.com     ';
            var lineParts = createViewLineTokens([
                createPart(5, 1),
                createPart(11, 2),
                createPart(12, 3),
                createPart(17, 4),
                createPart(18, 5),
                createPart(22, 6),
                createPart(23, 7),
                createPart(24, 8),
                createPart(25, 9),
                createPart(28, 10),
                createPart(43, 11),
                createPart(48, 12),
            ]);
            var expectedOutput = [
                '<span class="vs-whitespace" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u00b7</span>',
                '<span class="mtk2">export</span>',
                '<span class="mtk3">\u00a0</span>',
                '<span class="mtk4">class</span>',
                '<span class="mtk5">\u00a0</span>',
                '<span class="mtk6">Game</span>',
                '<span class="mtk7">\u00a0</span>',
                '<span class="mtk8">{</span>',
                '<span class="mtk9">\u00a0</span>',
                '<span class="mtk10">//\u00a0</span>',
                '<span class="mtk11">http://test.com</span>',
                '<span class="vs-whitespace" style="width:20px">\u00b7\u00b7</span>',
                '<span class="vs-whitespace" style="width:30px">\u00b7\u00b7\u00b7</span>'
            ].join('');
            var expectedOffsetsArr = [
                [0],
                [0, 1, 2, 3],
                [0, 1, 2, 3, 4, 5],
                [0],
                [0, 1, 2, 3, 4],
                [0],
                [0, 1, 2, 3],
                [0],
                [0],
                [0],
                [0, 1, 2],
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
                [0, 1],
                [0, 1, 2, 3],
            ];
            var _actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineText, false, 0, lineParts, [], 4, 10, -1, 'boundary', false, false));
            assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
            assertCharacterMapping(_actual.characterMapping, expectedOffsetsArr, [4, 4, 6, 1, 5, 1, 4, 1, 1, 1, 3, 15, 2, 3]);
        });
        test('issue #2255: Weird line rendering part 1', function () {
            var lineText = '\t\t\tcursorStyle:\t\t\t\t\t\t(prevOpts.cursorStyle !== newOpts.cursorStyle),';
            var lineParts = createViewLineTokens([
                createPart(3, 1),
                createPart(15, 2),
                createPart(21, 3),
                createPart(22, 4),
                createPart(43, 5),
                createPart(45, 6),
                createPart(46, 7),
                createPart(66, 8),
                createPart(67, 9),
                createPart(68, 10),
            ]);
            var expectedOutput = [
                '<span class="mtk1">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                '<span class="mtk2">cursorStyle:</span>',
                '<span class="mtk3">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                '<span class="mtk4">(</span>',
                '<span class="mtk5">prevOpts.cursorStyle\u00a0</span>',
                '<span class="mtk6">!=</span>',
                '<span class="mtk7">=</span>',
                '<span class="mtk8">\u00a0newOpts.cursorStyle</span>',
                '<span class="mtk9">)</span>',
                '<span class="mtk10">,</span>',
            ].join('');
            var expectedOffsetsArr = [
                [0, 4, 8],
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                [0, 4, 8, 12, 16, 20],
                [0],
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                [0, 1],
                [0],
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
                [0],
                [0, 1] // 2 chars
            ];
            var _actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineText, false, 0, lineParts, [], 4, 10, -1, 'none', false, false));
            assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
            assertCharacterMapping(_actual.characterMapping, expectedOffsetsArr, [12, 12, 24, 1, 21, 2, 1, 20, 1, 1]);
        });
        test('issue #2255: Weird line rendering part 2', function () {
            var lineText = ' \t\t\tcursorStyle:\t\t\t\t\t\t(prevOpts.cursorStyle !== newOpts.cursorStyle),';
            var lineParts = createViewLineTokens([
                createPart(4, 1),
                createPart(16, 2),
                createPart(22, 3),
                createPart(23, 4),
                createPart(44, 5),
                createPart(46, 6),
                createPart(47, 7),
                createPart(67, 8),
                createPart(68, 9),
                createPart(69, 10),
            ]);
            var expectedOutput = [
                '<span class="mtk1">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                '<span class="mtk2">cursorStyle:</span>',
                '<span class="mtk3">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                '<span class="mtk4">(</span>',
                '<span class="mtk5">prevOpts.cursorStyle\u00a0</span>',
                '<span class="mtk6">!=</span>',
                '<span class="mtk7">=</span>',
                '<span class="mtk8">\u00a0newOpts.cursorStyle</span>',
                '<span class="mtk9">)</span>',
                '<span class="mtk10">,</span>',
            ].join('');
            var expectedOffsetsArr = [
                [0, 1, 4, 8],
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                [0, 4, 8, 12, 16, 20],
                [0],
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                [0, 1],
                [0],
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
                [0],
                [0, 1] // 2 chars
            ];
            var _actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineText, false, 0, lineParts, [], 4, 10, -1, 'none', false, false));
            assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
            assertCharacterMapping(_actual.characterMapping, expectedOffsetsArr, [12, 12, 24, 1, 21, 2, 1, 20, 1, 1]);
        });
        test('issue Microsoft/monaco-editor#280: Improved source code rendering for RTL languages', function () {
            var lineText = 'var קודמות = \"מיותר קודמות צ\'ט של, אם לשון העברית שינויים ויש, אם\";';
            var lineParts = createViewLineTokens([
                createPart(3, 6),
                createPart(13, 1),
                createPart(66, 20),
                createPart(67, 1),
            ]);
            var expectedOutput = [
                '<span class="mtk6" dir="ltr">var</span>',
                '<span class="mtk1" dir="ltr">\u00a0קודמות\u00a0=\u00a0</span>',
                '<span class="mtk20" dir="ltr">"מיותר\u00a0קודמות\u00a0צ\'ט\u00a0של,\u00a0אם\u00a0לשון\u00a0העברית\u00a0שינויים\u00a0ויש,\u00a0אם"</span>',
                '<span class="mtk1" dir="ltr">;</span>'
            ].join('');
            var _actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineText, true, 0, lineParts, [], 4, 10, -1, 'none', false, false));
            assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
            assert.equal(_actual.containsRTL, true);
        });
        test('issue #6885: Splits large tokens', function () {
            //                                                                                                                  1         1         1
            //                        1         2         3         4         5         6         7         8         9         0         1         2
            //               1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234
            var _lineText = 'This is just a long line that contains very interesting text. This is just a long line that contains very interesting text.';
            function assertSplitsTokens(message, lineText, expectedOutput) {
                var lineParts = createViewLineTokens([createPart(lineText.length, 1)]);
                var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineText, false, 0, lineParts, [], 4, 10, -1, 'none', false, false));
                assert.equal(actual.html, '<span>' + expectedOutput.join('') + '</span>', message);
            }
            // A token with 49 chars
            {
                assertSplitsTokens('49 chars', _lineText.substr(0, 49), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0inter</span>',
                ]);
            }
            // A token with 50 chars
            {
                assertSplitsTokens('50 chars', _lineText.substr(0, 50), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                ]);
            }
            // A token with 51 chars
            {
                assertSplitsTokens('51 chars', _lineText.substr(0, 51), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                    '<span class="mtk1">s</span>',
                ]);
            }
            // A token with 99 chars
            {
                assertSplitsTokens('99 chars', _lineText.substr(0, 99), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                    '<span class="mtk1">sting\u00a0text.\u00a0This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contain</span>',
                ]);
            }
            // A token with 100 chars
            {
                assertSplitsTokens('100 chars', _lineText.substr(0, 100), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                    '<span class="mtk1">sting\u00a0text.\u00a0This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains</span>',
                ]);
            }
            // A token with 101 chars
            {
                assertSplitsTokens('101 chars', _lineText.substr(0, 101), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                    '<span class="mtk1">sting\u00a0text.\u00a0This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains</span>',
                    '<span class="mtk1">\u00a0</span>',
                ]);
            }
        });
        test('issue #21476: Does not split large tokens when ligatures are on', function () {
            //                                                                                                                  1         1         1
            //                        1         2         3         4         5         6         7         8         9         0         1         2
            //               1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234
            var _lineText = 'This is just a long line that contains very interesting text. This is just a long line that contains very interesting text.';
            function assertSplitsTokens(message, lineText, expectedOutput) {
                var lineParts = createViewLineTokens([createPart(lineText.length, 1)]);
                var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineText, false, 0, lineParts, [], 4, 10, -1, 'none', false, true));
                assert.equal(actual.html, '<span>' + expectedOutput.join('') + '</span>', message);
            }
            // A token with 101 chars
            {
                assertSplitsTokens('101 chars', _lineText.substr(0, 101), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0interesting\u00a0text.\u00a0This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0</span>',
                ]);
            }
        });
        test('issue #20624: Unaligned surrogate pairs are corrupted at multiples of 50 columns', function () {
            var lineText = 'a𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷';
            var lineParts = createViewLineTokens([createPart(lineText.length, 1)]);
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineText, false, 0, lineParts, [], 4, 10, -1, 'none', false, false));
            var expectedOutput = [
                '<span class="mtk1">a𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
                '<span class="mtk1">𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
                '<span class="mtk1">𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
                '<span class="mtk1">𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
                '<span class="mtk1">𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
            ];
            assert.equal(actual.html, '<span>' + expectedOutput.join('') + '</span>');
        });
        test('issue #6885: Does not split large tokens in RTL text', function () {
            var lineText = 'את גרמנית בהתייחסות שמו, שנתי המשפט אל חפש, אם כתב אחרים ולחבר. של התוכן אודות בויקיפדיה כלל, של עזרה כימיה היא. על עמוד יוצרים מיתולוגיה סדר, אם שכל שתפו לעברית שינויים, אם שאלות אנגלית עזה. שמות בקלות מה סדר.';
            var lineParts = createViewLineTokens([createPart(lineText.length, 1)]);
            var expectedOutput = [
                '<span class="mtk1" dir="ltr">את\u00a0גרמנית\u00a0בהתייחסות\u00a0שמו,\u00a0שנתי\u00a0המשפט\u00a0אל\u00a0חפש,\u00a0אם\u00a0כתב\u00a0אחרים\u00a0ולחבר.\u00a0של\u00a0התוכן\u00a0אודות\u00a0בויקיפדיה\u00a0כלל,\u00a0של\u00a0עזרה\u00a0כימיה\u00a0היא.\u00a0על\u00a0עמוד\u00a0יוצרים\u00a0מיתולוגיה\u00a0סדר,\u00a0אם\u00a0שכל\u00a0שתפו\u00a0לעברית\u00a0שינויים,\u00a0אם\u00a0שאלות\u00a0אנגלית\u00a0עזה.\u00a0שמות\u00a0בקלות\u00a0מה\u00a0סדר.</span>'
            ];
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineText, true, 0, lineParts, [], 4, 10, -1, 'none', false, false));
            assert.equal(actual.html, '<span>' + expectedOutput.join('') + '</span>');
            assert.equal(actual.containsRTL, true);
        });
        test('issue #19673: Monokai Theme bad-highlighting in line wrap', function () {
            var lineText = '    MongoCallback<string>): void {';
            var lineParts = createViewLineTokens([
                createPart(17, 1),
                createPart(18, 2),
                createPart(24, 3),
                createPart(26, 4),
                createPart(27, 5),
                createPart(28, 6),
                createPart(32, 7),
                createPart(34, 8),
            ]);
            var expectedOutput = [
                '<span class="">\u00a0\u00a0\u00a0\u00a0</span>',
                '<span class="mtk1">MongoCallback</span>',
                '<span class="mtk2">&lt;</span>',
                '<span class="mtk3">string</span>',
                '<span class="mtk4">&gt;)</span>',
                '<span class="mtk5">:</span>',
                '<span class="mtk6">\u00a0</span>',
                '<span class="mtk7">void</span>',
                '<span class="mtk8">\u00a0{</span>'
            ].join('');
            var _actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(true, lineText, false, 4, lineParts, [], 4, 10, -1, 'none', false, false));
            assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
        });
        function assertCharacterMapping(actual, expectedCharPartOffsets, expectedPartLengths) {
            assertCharPartOffsets(actual, expectedCharPartOffsets);
            var expectedCharAbsoluteOffset = [], currentPartAbsoluteOffset = 0;
            for (var partIndex = 0; partIndex < expectedCharPartOffsets.length; partIndex++) {
                var part = expectedCharPartOffsets[partIndex];
                for (var i = 0; i < part.length; i++) {
                    var charIndex = part[i];
                    expectedCharAbsoluteOffset.push(currentPartAbsoluteOffset + charIndex);
                }
                currentPartAbsoluteOffset += expectedPartLengths[partIndex];
            }
            var actualCharOffset = [];
            var tmp = actual.getAbsoluteOffsets();
            for (var i = 0; i < tmp.length; i++) {
                actualCharOffset[i] = tmp[i];
            }
            assert.deepEqual(actualCharOffset, expectedCharAbsoluteOffset);
        }
        function assertCharPartOffsets(actual, expected) {
            var charOffset = 0;
            for (var partIndex = 0; partIndex < expected.length; partIndex++) {
                var part = expected[partIndex];
                for (var i = 0; i < part.length; i++) {
                    var charIndex = part[i];
                    // here
                    var _actualPartData = actual.charOffsetToPartData(charOffset);
                    var actualPartIndex = viewLineRenderer_1.CharacterMapping.getPartIndex(_actualPartData);
                    var actualCharIndex = viewLineRenderer_1.CharacterMapping.getCharIndex(_actualPartData);
                    assert.deepEqual({ partIndex: actualPartIndex, charIndex: actualCharIndex }, { partIndex: partIndex, charIndex: charIndex }, "character mapping for offset " + charOffset);
                    // here
                    var actualOffset = actual.partDataToCharOffset(partIndex, part[part.length - 1] + 1, charIndex);
                    assert.equal(actualOffset, charOffset, "character mapping for part " + partIndex + ", " + charIndex);
                    charOffset++;
                }
            }
            assert.equal(actual.length, charOffset);
        }
    });
    suite('viewLineRenderer.renderLine 2', function () {
        function testCreateLineParts(fontIsMonospace, lineContent, tokens, fauxIndentLength, renderWhitespace, expected) {
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(fontIsMonospace, lineContent, false, fauxIndentLength, createViewLineTokens(tokens), [], 4, 10, -1, renderWhitespace, false, false));
            assert.deepEqual(actual.html, expected);
        }
        test('issue #18616: Inline decorations ending at the text length are no longer rendered', function () {
            var lineContent = 'https://microsoft.com';
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineContent, false, 0, createViewLineTokens([createPart(21, 3)]), [new lineDecorations_1.LineDecoration(1, 22, 'link', 0 /* Regular */)], 4, 10, -1, 'none', false, false));
            var expected = [
                '<span>',
                '<span class="mtk3 link">https://microsoft.com</span>',
                '</span>'
            ].join('');
            assert.deepEqual(actual.html, expected);
        });
        test('issue #19207: Link in Monokai is not rendered correctly', function () {
            var lineContent = '\'let url = `http://***/_api/web/lists/GetByTitle(\\\'Teambuildingaanvragen\\\')/items`;\'';
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(true, lineContent, false, 0, createViewLineTokens([
                createPart(49, 6),
                createPart(51, 4),
                createPart(72, 6),
                createPart(74, 4),
                createPart(84, 6),
            ]), [
                new lineDecorations_1.LineDecoration(13, 51, 'detected-link', 0 /* Regular */)
            ], 4, 10, -1, 'none', false, false));
            var expected = [
                '<span>',
                '<span class="mtk6">\'let\u00a0url\u00a0=\u00a0`</span>',
                '<span class="mtk6 detected-link">http://***/_api/web/lists/GetByTitle(</span>',
                '<span class="mtk4 detected-link">\\</span>',
                '<span class="mtk4">\'</span>',
                '<span class="mtk6">Teambuildingaanvragen</span>',
                '<span class="mtk4">\\\'</span>',
                '<span class="mtk6">)/items`;\'</span>',
                '</span>'
            ].join('');
            assert.deepEqual(actual.html, expected);
        });
        test('createLineParts simple', function () {
            testCreateLineParts(false, 'Hello world!', [
                createPart(12, 1)
            ], 0, 'none', [
                '<span>',
                '<span class="mtk1">Hello\u00a0world!</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts simple two tokens', function () {
            testCreateLineParts(false, 'Hello world!', [
                createPart(6, 1),
                createPart(12, 2)
            ], 0, 'none', [
                '<span>',
                '<span class="mtk1">Hello\u00a0</span>',
                '<span class="mtk2">world!</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts render whitespace - 4 leading spaces', function () {
            testCreateLineParts(false, '    Hello world!    ', [
                createPart(4, 1),
                createPart(6, 2),
                createPart(20, 3)
            ], 0, 'boundary', [
                '<span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u00b7</span>',
                '<span class="mtk2">He</span>',
                '<span class="mtk3">llo\u00a0world!</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u00b7</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts render whitespace - 8 leading spaces', function () {
            testCreateLineParts(false, '        Hello world!        ', [
                createPart(8, 1),
                createPart(10, 2),
                createPart(28, 3)
            ], 0, 'boundary', [
                '<span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u00b7</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u00b7</span>',
                '<span class="mtk2">He</span>',
                '<span class="mtk3">llo\u00a0world!</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u00b7</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u00b7</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts render whitespace - 2 leading tabs', function () {
            testCreateLineParts(false, '\t\tHello world!\t', [
                createPart(2, 1),
                createPart(4, 2),
                createPart(15, 3)
            ], 0, 'boundary', [
                '<span>',
                '<span class="vs-whitespace" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                '<span class="vs-whitespace" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                '<span class="mtk2">He</span>',
                '<span class="mtk3">llo\u00a0world!</span>',
                '<span class="vs-whitespace" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts render whitespace - mixed leading spaces and tabs', function () {
            testCreateLineParts(false, '  \t\t  Hello world! \t  \t   \t    ', [
                createPart(6, 1),
                createPart(8, 2),
                createPart(31, 3)
            ], 0, 'boundary', [
                '<span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u2192\u00a0</span>',
                '<span class="vs-whitespace" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                '<span class="vs-whitespace" style="width:20px">\u00b7\u00b7</span>',
                '<span class="mtk2">He</span>',
                '<span class="mtk3">llo\u00a0world!</span>',
                '<span class="vs-whitespace" style="width:20px">\u00b7\u2192</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u2192\u00a0</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u2192</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u00b7</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts render whitespace skips faux indent', function () {
            testCreateLineParts(false, '\t\t  Hello world! \t  \t   \t    ', [
                createPart(4, 1),
                createPart(6, 2),
                createPart(29, 3)
            ], 2, 'boundary', [
                '<span>',
                '<span class="">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                '<span class="vs-whitespace" style="width:20px">\u00b7\u00b7</span>',
                '<span class="mtk2">He</span>',
                '<span class="mtk3">llo\u00a0world!</span>',
                '<span class="vs-whitespace" style="width:20px">\u00b7\u2192</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u2192\u00a0</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u2192</span>',
                '<span class="vs-whitespace" style="width:40px">\u00b7\u00b7\u00b7\u00b7</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts does not emit width for monospace fonts', function () {
            testCreateLineParts(true, '\t\t  Hello world! \t  \t   \t    ', [
                createPart(4, 1),
                createPart(6, 2),
                createPart(29, 3)
            ], 2, 'boundary', [
                '<span>',
                '<span class="">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                '<span class="vs-whitespace">\u00b7\u00b7</span>',
                '<span class="mtk2">He</span>',
                '<span class="mtk3">llo\u00a0world!</span>',
                '<span class="vs-whitespace">\u00b7\u2192\u00b7\u00b7\u2192\u00a0\u00b7\u00b7\u00b7\u2192\u00b7\u00b7\u00b7\u00b7</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts render whitespace in middle but not for one space', function () {
            testCreateLineParts(false, 'it  it it  it', [
                createPart(6, 1),
                createPart(7, 2),
                createPart(13, 3)
            ], 0, 'boundary', [
                '<span>',
                '<span class="mtk1">it</span>',
                '<span class="vs-whitespace" style="width:20px">\u00b7\u00b7</span>',
                '<span class="mtk1">it</span>',
                '<span class="mtk2">\u00a0</span>',
                '<span class="mtk3">it</span>',
                '<span class="vs-whitespace" style="width:20px">\u00b7\u00b7</span>',
                '<span class="mtk3">it</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts render whitespace for all in middle', function () {
            testCreateLineParts(false, ' Hello world!\t', [
                createPart(4, 0),
                createPart(6, 1),
                createPart(14, 2)
            ], 0, 'all', [
                '<span>',
                '<span class="vs-whitespace" style="width:10px">\u00b7</span>',
                '<span class="mtk0">Hel</span>',
                '<span class="mtk1">lo</span>',
                '<span class="vs-whitespace" style="width:10px">\u00b7</span>',
                '<span class="mtk2">world!</span>',
                '<span class="vs-whitespace" style="width:30px">\u2192\u00a0\u00a0</span>',
                '</span>',
            ].join(''));
        });
        test('createLineParts can handle unsorted inline decorations', function () {
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, 'Hello world', false, 0, createViewLineTokens([createPart(11, 0)]), [
                new lineDecorations_1.LineDecoration(5, 7, 'a', 0 /* Regular */),
                new lineDecorations_1.LineDecoration(1, 3, 'b', 0 /* Regular */),
                new lineDecorations_1.LineDecoration(2, 8, 'c', 0 /* Regular */),
            ], 4, 10, -1, 'none', false, false));
            // 01234567890
            // Hello world
            // ----aa-----
            // bb---------
            // -cccccc----
            assert.deepEqual(actual.html, [
                '<span>',
                '<span class="mtk0 b">H</span>',
                '<span class="mtk0 b c">e</span>',
                '<span class="mtk0 c">ll</span>',
                '<span class="mtk0 a c">o\u00a0</span>',
                '<span class="mtk0 c">w</span>',
                '<span class="mtk0">orld</span>',
                '</span>',
            ].join(''));
        });
        test('issue #11485: Visible whitespace conflicts with before decorator attachment', function () {
            var lineContent = '\tbla';
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineContent, false, 0, createViewLineTokens([createPart(4, 3)]), [new lineDecorations_1.LineDecoration(1, 2, 'before', 1 /* Before */)], 4, 10, -1, 'all', false, true));
            var expected = [
                '<span>',
                '<span class="vs-whitespace before">\u2192\u00a0\u00a0\u00a0</span>',
                '<span class="mtk3">bla</span>',
                '</span>'
            ].join('');
            assert.deepEqual(actual.html, expected);
        });
        test('issue #32436: Non-monospace font + visible whitespace + After decorator causes line to "jump"', function () {
            var lineContent = '\tbla';
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineContent, false, 0, createViewLineTokens([createPart(4, 3)]), [new lineDecorations_1.LineDecoration(2, 3, 'before', 1 /* Before */)], 4, 10, -1, 'all', false, true));
            var expected = [
                '<span>',
                '<span class="vs-whitespace" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                '<span class="mtk3 before">b</span>',
                '<span class="mtk3">la</span>',
                '</span>'
            ].join('');
            assert.deepEqual(actual.html, expected);
        });
        test('issue #30133: Empty lines don\'t render inline decorations', function () {
            var lineContent = '';
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineContent, false, 0, createViewLineTokens([createPart(0, 3)]), [new lineDecorations_1.LineDecoration(1, 2, 'before', 1 /* Before */)], 4, 10, -1, 'all', false, true));
            var expected = [
                '<span>',
                '<span class="before"></span>',
                '</span>'
            ].join('');
            assert.deepEqual(actual.html, expected);
        });
        test('issue #37208: Collapsing bullet point containing emoji in Markdown document results in [??] character', function () {
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(true, '  1. 🙏', false, 0, createViewLineTokens([createPart(7, 3)]), [new lineDecorations_1.LineDecoration(7, 8, 'inline-folded', 2 /* After */)], 2, 10, 10000, 'none', false, false));
            var expected = [
                '<span>',
                '<span class="mtk3">\u00a0\u00a01.\u00a0</span>',
                '<span class="mtk3 inline-folded">🙏</span>',
                '</span>'
            ].join('');
            assert.deepEqual(actual.html, expected);
        });
        test('issue #37401: Allow both before and after decorations on empty line', function () {
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(true, '', false, 0, createViewLineTokens([createPart(0, 3)]), [
                new lineDecorations_1.LineDecoration(1, 2, 'before', 1 /* Before */),
                new lineDecorations_1.LineDecoration(0, 1, 'after', 2 /* After */),
            ], 2, 10, 10000, 'none', false, false));
            var expected = [
                '<span>',
                '<span class="before after"></span>',
                '</span>'
            ].join('');
            assert.deepEqual(actual.html, expected);
        });
        test('issue #38935: GitLens end-of-line blame no longer rendering', function () {
            var actual = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(true, '\t}', false, 0, createViewLineTokens([createPart(2, 3)]), [
                new lineDecorations_1.LineDecoration(3, 3, 'ced-TextEditorDecorationType2-5e9b9b3f-3 ced-TextEditorDecorationType2-3', 1 /* Before */),
                new lineDecorations_1.LineDecoration(3, 3, 'ced-TextEditorDecorationType2-5e9b9b3f-4 ced-TextEditorDecorationType2-4', 2 /* After */),
            ], 4, 10, 10000, 'none', false, false));
            var expected = [
                '<span>',
                '<span class="mtk3">\u00a0\u00a0\u00a0\u00a0}</span>',
                '<span class="ced-TextEditorDecorationType2-5e9b9b3f-3 ced-TextEditorDecorationType2-3 ced-TextEditorDecorationType2-5e9b9b3f-4 ced-TextEditorDecorationType2-4"></span>',
                '</span>'
            ].join('');
            assert.deepEqual(actual.html, expected);
        });
        function createTestGetColumnOfLinePartOffset(lineContent, tabSize, parts, expectedPartLengths) {
            var renderLineOutput = viewLineRenderer_1.renderViewLine2(new viewLineRenderer_1.RenderLineInput(false, lineContent, false, 0, createViewLineTokens(parts), [], tabSize, 10, -1, 'none', false, false));
            return function (partIndex, partLength, offset, expected) {
                var charOffset = renderLineOutput.characterMapping.partDataToCharOffset(partIndex, partLength, offset);
                var actual = charOffset + 1;
                assert.equal(actual, expected, 'getColumnOfLinePartOffset for ' + partIndex + ' @ ' + offset);
            };
        }
        test('getColumnOfLinePartOffset 1 - simple text', function () {
            var testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('hello world', 4, [
                createPart(11, 1)
            ], [11]);
            testGetColumnOfLinePartOffset(0, 11, 0, 1);
            testGetColumnOfLinePartOffset(0, 11, 1, 2);
            testGetColumnOfLinePartOffset(0, 11, 2, 3);
            testGetColumnOfLinePartOffset(0, 11, 3, 4);
            testGetColumnOfLinePartOffset(0, 11, 4, 5);
            testGetColumnOfLinePartOffset(0, 11, 5, 6);
            testGetColumnOfLinePartOffset(0, 11, 6, 7);
            testGetColumnOfLinePartOffset(0, 11, 7, 8);
            testGetColumnOfLinePartOffset(0, 11, 8, 9);
            testGetColumnOfLinePartOffset(0, 11, 9, 10);
            testGetColumnOfLinePartOffset(0, 11, 10, 11);
            testGetColumnOfLinePartOffset(0, 11, 11, 12);
        });
        test('getColumnOfLinePartOffset 2 - regular JS', function () {
            var testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('var x = 3;', 4, [
                createPart(3, 1),
                createPart(4, 2),
                createPart(5, 3),
                createPart(8, 4),
                createPart(9, 5),
                createPart(10, 6),
            ], [3, 1, 1, 3, 1, 1]);
            testGetColumnOfLinePartOffset(0, 3, 0, 1);
            testGetColumnOfLinePartOffset(0, 3, 1, 2);
            testGetColumnOfLinePartOffset(0, 3, 2, 3);
            testGetColumnOfLinePartOffset(0, 3, 3, 4);
            testGetColumnOfLinePartOffset(1, 1, 0, 4);
            testGetColumnOfLinePartOffset(1, 1, 1, 5);
            testGetColumnOfLinePartOffset(2, 1, 0, 5);
            testGetColumnOfLinePartOffset(2, 1, 1, 6);
            testGetColumnOfLinePartOffset(3, 3, 0, 6);
            testGetColumnOfLinePartOffset(3, 3, 1, 7);
            testGetColumnOfLinePartOffset(3, 3, 2, 8);
            testGetColumnOfLinePartOffset(3, 3, 3, 9);
            testGetColumnOfLinePartOffset(4, 1, 0, 9);
            testGetColumnOfLinePartOffset(4, 1, 1, 10);
            testGetColumnOfLinePartOffset(5, 1, 0, 10);
            testGetColumnOfLinePartOffset(5, 1, 1, 11);
        });
        test('getColumnOfLinePartOffset 3 - tab with tab size 6', function () {
            var testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('\t', 6, [
                createPart(1, 1)
            ], [6]);
            testGetColumnOfLinePartOffset(0, 6, 0, 1);
            testGetColumnOfLinePartOffset(0, 6, 1, 1);
            testGetColumnOfLinePartOffset(0, 6, 2, 1);
            testGetColumnOfLinePartOffset(0, 6, 3, 1);
            testGetColumnOfLinePartOffset(0, 6, 4, 2);
            testGetColumnOfLinePartOffset(0, 6, 5, 2);
            testGetColumnOfLinePartOffset(0, 6, 6, 2);
        });
        test('getColumnOfLinePartOffset 4 - once indented line, tab size 4', function () {
            var testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('\tfunction', 4, [
                createPart(1, 1),
                createPart(9, 2),
            ], [4, 8]);
            testGetColumnOfLinePartOffset(0, 4, 0, 1);
            testGetColumnOfLinePartOffset(0, 4, 1, 1);
            testGetColumnOfLinePartOffset(0, 4, 2, 1);
            testGetColumnOfLinePartOffset(0, 4, 3, 2);
            testGetColumnOfLinePartOffset(0, 4, 4, 2);
            testGetColumnOfLinePartOffset(1, 8, 0, 2);
            testGetColumnOfLinePartOffset(1, 8, 1, 3);
            testGetColumnOfLinePartOffset(1, 8, 2, 4);
            testGetColumnOfLinePartOffset(1, 8, 3, 5);
            testGetColumnOfLinePartOffset(1, 8, 4, 6);
            testGetColumnOfLinePartOffset(1, 8, 5, 7);
            testGetColumnOfLinePartOffset(1, 8, 6, 8);
            testGetColumnOfLinePartOffset(1, 8, 7, 9);
            testGetColumnOfLinePartOffset(1, 8, 8, 10);
        });
        test('getColumnOfLinePartOffset 5 - twice indented line, tab size 4', function () {
            var testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('\t\tfunction', 4, [
                createPart(2, 1),
                createPart(10, 2),
            ], [8, 8]);
            testGetColumnOfLinePartOffset(0, 8, 0, 1);
            testGetColumnOfLinePartOffset(0, 8, 1, 1);
            testGetColumnOfLinePartOffset(0, 8, 2, 1);
            testGetColumnOfLinePartOffset(0, 8, 3, 2);
            testGetColumnOfLinePartOffset(0, 8, 4, 2);
            testGetColumnOfLinePartOffset(0, 8, 5, 2);
            testGetColumnOfLinePartOffset(0, 8, 6, 2);
            testGetColumnOfLinePartOffset(0, 8, 7, 3);
            testGetColumnOfLinePartOffset(0, 8, 8, 3);
            testGetColumnOfLinePartOffset(1, 8, 0, 3);
            testGetColumnOfLinePartOffset(1, 8, 1, 4);
            testGetColumnOfLinePartOffset(1, 8, 2, 5);
            testGetColumnOfLinePartOffset(1, 8, 3, 6);
            testGetColumnOfLinePartOffset(1, 8, 4, 7);
            testGetColumnOfLinePartOffset(1, 8, 5, 8);
            testGetColumnOfLinePartOffset(1, 8, 6, 9);
            testGetColumnOfLinePartOffset(1, 8, 7, 10);
            testGetColumnOfLinePartOffset(1, 8, 8, 11);
        });
    });
});
