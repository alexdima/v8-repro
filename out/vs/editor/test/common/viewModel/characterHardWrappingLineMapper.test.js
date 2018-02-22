define(["require", "exports", "assert", "vs/editor/common/config/editorOptions", "vs/editor/common/viewModel/characterHardWrappingLineMapper"], function (require, exports, assert, editorOptions_1, characterHardWrappingLineMapper_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertLineMapping(factory, tabSize, breakAfter, annotatedText, wrappingIndent) {
        if (wrappingIndent === void 0) { wrappingIndent = editorOptions_1.WrappingIndent.None; }
        var rawText = '';
        var currentLineIndex = 0;
        var lineIndices = [];
        for (var i = 0, len = annotatedText.length; i < len; i++) {
            if (annotatedText.charAt(i) === '|') {
                currentLineIndex++;
            }
            else {
                rawText += annotatedText.charAt(i);
                lineIndices[rawText.length - 1] = currentLineIndex;
            }
        }
        var mapper = factory.createLineMapping(rawText, tabSize, breakAfter, 2, wrappingIndent);
        var actualAnnotatedText = '';
        if (mapper) {
            var previousLineIndex = 0;
            for (var i = 0, len = rawText.length; i < len; i++) {
                var r = mapper.getOutputPositionOfInputOffset(i);
                if (previousLineIndex !== r.outputLineIndex) {
                    previousLineIndex = r.outputLineIndex;
                    actualAnnotatedText += '|';
                }
                actualAnnotatedText += rawText.charAt(i);
            }
        }
        else {
            // No wrapping
            actualAnnotatedText = rawText;
        }
        assert.equal(actualAnnotatedText, annotatedText);
        return mapper;
    }
    suite('Editor ViewModel - CharacterHardWrappingLineMapper', function () {
        test('CharacterHardWrappingLineMapper', function () {
            var factory = new characterHardWrappingLineMapper_1.CharacterHardWrappingLineMapperFactory('(', ')', '.');
            // Empty string
            assertLineMapping(factory, 4, 5, '');
            // No wrapping if not necessary
            assertLineMapping(factory, 4, 5, 'aaa');
            assertLineMapping(factory, 4, 5, 'aaaaa');
            assertLineMapping(factory, 4, -1, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
            // Acts like hard wrapping if no char found
            assertLineMapping(factory, 4, 5, 'aaaaa|a');
            // Honors obtrusive wrapping character
            assertLineMapping(factory, 4, 5, 'aaaaa|.');
            assertLineMapping(factory, 4, 5, 'aaaaa|a.|aaa.|aa');
            assertLineMapping(factory, 4, 5, 'aaaaa|a..|aaa.|aa');
            assertLineMapping(factory, 4, 5, 'aaaaa|a...|aaa.|aa');
            assertLineMapping(factory, 4, 5, 'aaaaa|a....|aaa.|aa');
            // Honors tabs when computing wrapping position
            assertLineMapping(factory, 4, 5, '\t');
            assertLineMapping(factory, 4, 5, '\ta|aa');
            assertLineMapping(factory, 4, 5, '\ta|\ta|a');
            assertLineMapping(factory, 4, 5, 'aa\ta');
            assertLineMapping(factory, 4, 5, 'aa\ta|a');
            // Honors wrapping before characters (& gives it priority)
            assertLineMapping(factory, 4, 5, 'aaa.|aa');
            assertLineMapping(factory, 4, 5, 'aaa|(.aa');
            // Honors wrapping after characters (& gives it priority)
            assertLineMapping(factory, 4, 5, 'aaa))|).aaa');
            assertLineMapping(factory, 4, 5, 'aaa))|)|.aaaa');
            assertLineMapping(factory, 4, 5, 'aaa)|()|.aaa');
            assertLineMapping(factory, 4, 5, 'aaa(|()|.aaa');
            assertLineMapping(factory, 4, 5, 'aa.(|()|.aaa');
            assertLineMapping(factory, 4, 5, 'aa.|(.)|.aaa');
        });
        test('CharacterHardWrappingLineMapper - CJK and Kinsoku Shori', function () {
            var factory = new characterHardWrappingLineMapper_1.CharacterHardWrappingLineMapperFactory('(', ')', '.');
            assertLineMapping(factory, 4, 5, 'aa \u5b89|\u5b89');
            assertLineMapping(factory, 4, 5, '\u3042 \u5b89|\u5b89');
            assertLineMapping(factory, 4, 5, '\u3042\u3042|\u5b89\u5b89');
            assertLineMapping(factory, 4, 5, 'aa |\u5b89)\u5b89|\u5b89');
            assertLineMapping(factory, 4, 5, 'aa \u3042|\u5b89\u3042)|\u5b89');
            assertLineMapping(factory, 4, 5, 'aa |(\u5b89aa|\u5b89');
        });
        test('CharacterHardWrappingLineMapper - WrappingIndent.Same', function () {
            var factory = new characterHardWrappingLineMapper_1.CharacterHardWrappingLineMapperFactory('', ' ', '');
            assertLineMapping(factory, 4, 38, ' *123456789012345678901234567890123456|7890', editorOptions_1.WrappingIndent.Same);
        });
        test('issue #16332: Scroll bar overlaying on top of text', function () {
            var factory = new characterHardWrappingLineMapper_1.CharacterHardWrappingLineMapperFactory('', ' ', '');
            assertLineMapping(factory, 4, 24, 'a/ very/long/line/of/tex|t/that/expands/beyon|d/your/typical/line/|of/code/', editorOptions_1.WrappingIndent.Indent);
        });
        test('issue #35162: wrappingIndent not consistently working', function () {
            var factory = new characterHardWrappingLineMapper_1.CharacterHardWrappingLineMapperFactory('', ' ', '');
            var mapper = assertLineMapping(factory, 4, 24, '                t h i s |i s |a l |o n |g l |i n |e', editorOptions_1.WrappingIndent.Indent);
            assert.equal(mapper.getWrappedLinesIndent(), '                \t');
        });
    });
});
