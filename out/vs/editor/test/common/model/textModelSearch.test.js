define(["require", "exports", "assert", "vs/editor/common/core/position", "vs/editor/common/model", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/model/textModelSearch", "vs/editor/common/controller/wordCharacterClassifier", "vs/editor/common/model/wordHelper"], function (require, exports, assert, position_1, model_1, range_1, textModel_1, textModelSearch_1, wordCharacterClassifier_1, wordHelper_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // --------- Find
    suite('TextModelSearch', function () {
        var usualWordSeparators = wordCharacterClassifier_1.getMapForWordSeparators(wordHelper_1.USUAL_WORD_SEPARATORS);
        function assertFindMatch(actual, expectedRange, expectedMatches) {
            if (expectedMatches === void 0) { expectedMatches = null; }
            assert.deepEqual(actual, new model_1.FindMatch(expectedRange, expectedMatches));
        }
        function _assertFindMatches(model, searchParams, expectedMatches) {
            var actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), false, 1000);
            assert.deepEqual(actual, expectedMatches, 'findMatches OK');
            // test `findNextMatch`
            var startPos = new position_1.Position(1, 1);
            var match = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, startPos, false);
            assert.deepEqual(match, expectedMatches[0], "findNextMatch " + startPos);
            for (var i = 0; i < expectedMatches.length; i++) {
                startPos = expectedMatches[i].range.getStartPosition();
                match = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, startPos, false);
                assert.deepEqual(match, expectedMatches[i], "findNextMatch " + startPos);
            }
            // test `findPrevMatch`
            startPos = new position_1.Position(model.getLineCount(), model.getLineMaxColumn(model.getLineCount()));
            match = textModelSearch_1.TextModelSearch.findPreviousMatch(model, searchParams, startPos, false);
            assert.deepEqual(match, expectedMatches[expectedMatches.length - 1], "findPrevMatch " + startPos);
            for (var i = 0; i < expectedMatches.length; i++) {
                startPos = expectedMatches[i].range.getEndPosition();
                match = textModelSearch_1.TextModelSearch.findPreviousMatch(model, searchParams, startPos, false);
                assert.deepEqual(match, expectedMatches[i], "findPrevMatch " + startPos);
            }
        }
        function assertFindMatches(text, searchString, isRegex, matchCase, wordSeparators, _expected) {
            var expectedRanges = _expected.map(function (entry) { return new range_1.Range(entry[0], entry[1], entry[2], entry[3]); });
            var expectedMatches = expectedRanges.map(function (entry) { return new model_1.FindMatch(entry, null); });
            var searchParams = new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators);
            var model = textModel_1.TextModel.createFromString(text);
            _assertFindMatches(model, searchParams, expectedMatches);
            model.dispose();
            var model2 = textModel_1.TextModel.createFromString(text);
            model2.setEOL(model_1.EndOfLineSequence.CRLF);
            _assertFindMatches(model2, searchParams, expectedMatches);
            model2.dispose();
        }
        var regularText = [
            'This is some foo - bar text which contains foo and bar - as in Barcelona.',
            'Now it begins a word fooBar and now it is caps Foo-isn\'t this great?',
            'And here\'s a dull line with nothing interesting in it',
            'It is also interesting if it\'s part of a word like amazingFooBar',
            'Again nothing interesting here'
        ];
        test('Simple find', function () {
            assertFindMatches(regularText.join('\n'), 'foo', false, false, null, [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 22, 2, 25],
                [2, 48, 2, 51],
                [4, 59, 4, 62]
            ]);
        });
        test('Case sensitive find', function () {
            assertFindMatches(regularText.join('\n'), 'foo', false, true, null, [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 22, 2, 25]
            ]);
        });
        test('Whole words find', function () {
            assertFindMatches(regularText.join('\n'), 'foo', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 48, 2, 51]
            ]);
        });
        test('/^/ find', function () {
            assertFindMatches(regularText.join('\n'), '^', true, false, null, [
                [1, 1, 1, 1],
                [2, 1, 2, 1],
                [3, 1, 3, 1],
                [4, 1, 4, 1],
                [5, 1, 5, 1]
            ]);
        });
        test('/$/ find', function () {
            assertFindMatches(regularText.join('\n'), '$', true, false, null, [
                [1, 74, 1, 74],
                [2, 69, 2, 69],
                [3, 54, 3, 54],
                [4, 65, 4, 65],
                [5, 31, 5, 31]
            ]);
        });
        test('/.*/ find', function () {
            assertFindMatches(regularText.join('\n'), '.*', true, false, null, [
                [1, 1, 1, 74],
                [2, 1, 2, 69],
                [3, 1, 3, 54],
                [4, 1, 4, 65],
                [5, 1, 5, 31]
            ]);
        });
        test('/^$/ find', function () {
            assertFindMatches([
                'This is some foo - bar text which contains foo and bar - as in Barcelona.',
                '',
                'And here\'s a dull line with nothing interesting in it',
                '',
                'Again nothing interesting here'
            ].join('\n'), '^$', true, false, null, [
                [2, 1, 2, 1],
                [4, 1, 4, 1]
            ]);
        });
        test('multiline find 1', function () {
            assertFindMatches([
                'Just some text text',
                'Just some text text',
                'some text again',
                'again some text'
            ].join('\n'), 'text\\n', true, false, null, [
                [1, 16, 2, 1],
                [2, 16, 3, 1],
            ]);
        });
        test('multiline find 2', function () {
            assertFindMatches([
                'Just some text text',
                'Just some text text',
                'some text again',
                'again some text'
            ].join('\n'), 'text\\nJust', true, false, null, [
                [1, 16, 2, 5]
            ]);
        });
        test('multiline find 3', function () {
            assertFindMatches([
                'Just some text text',
                'Just some text text',
                'some text again',
                'again some text'
            ].join('\n'), '\\nagain', true, false, null, [
                [3, 16, 4, 6]
            ]);
        });
        test('multiline find 4', function () {
            assertFindMatches([
                'Just some text text',
                'Just some text text',
                'some text again',
                'again some text'
            ].join('\n'), '.*\\nJust.*\\n', true, false, null, [
                [1, 1, 3, 1]
            ]);
        });
        test('multiline find with line beginning regex', function () {
            assertFindMatches([
                'if',
                'else',
                '',
                'if',
                'else'
            ].join('\n'), '^if\\nelse', true, false, null, [
                [1, 1, 2, 5],
                [4, 1, 5, 5]
            ]);
        });
        test('matching empty lines using boundary expression', function () {
            assertFindMatches([
                'if',
                '',
                'else',
                '  ',
                'if',
                ' ',
                'else'
            ].join('\n'), '^\\s*$\\n', true, false, null, [
                [2, 1, 3, 1],
                [4, 1, 5, 1],
                [6, 1, 7, 1]
            ]);
        });
        test('matching lines starting with A and ending with B', function () {
            assertFindMatches([
                'a if b',
                'a',
                'ab',
                'eb'
            ].join('\n'), '^a.*b$', true, false, null, [
                [1, 1, 1, 7],
                [3, 1, 3, 3]
            ]);
        });
        test('multiline find with line ending regex', function () {
            assertFindMatches([
                'if',
                'else',
                '',
                'if',
                'elseif',
                'else'
            ].join('\n'), 'if\\nelse$', true, false, null, [
                [1, 1, 2, 5],
                [5, 5, 6, 5]
            ]);
        });
        test('issue #4836 - ^.*$', function () {
            assertFindMatches([
                'Just some text text',
                '',
                'some text again',
                '',
                'again some text'
            ].join('\n'), '^.*$', true, false, null, [
                [1, 1, 1, 20],
                [2, 1, 2, 1],
                [3, 1, 3, 16],
                [4, 1, 4, 1],
                [5, 1, 5, 16],
            ]);
        });
        test('multiline find for non-regex string', function () {
            assertFindMatches([
                'Just some text text',
                'some text text',
                'some text again',
                'again some text',
                'but not some'
            ].join('\n'), 'text\nsome', false, false, null, [
                [1, 16, 2, 5],
                [2, 11, 3, 5],
            ]);
        });
        test('issue #3623: Match whole word does not work for not latin characters', function () {
            assertFindMatches([
                'я',
                'компилятор',
                'обфускация',
                ':я-я'
            ].join('\n'), 'я', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, [
                [1, 1, 1, 2],
                [4, 2, 4, 3],
                [4, 4, 4, 5],
            ]);
        });
        test('issue #27459: Match whole words regression', function () {
            assertFindMatches([
                'this._register(this._textAreaInput.onKeyDown((e: IKeyboardEvent) => {',
                '	this._viewController.emitKeyDown(e);',
                '}));',
            ].join('\n'), '((e: ', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, [
                [1, 45, 1, 50]
            ]);
        });
        test('issue #27594: Search results disappear', function () {
            assertFindMatches([
                'this.server.listen(0);',
            ].join('\n'), 'listen(', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, [
                [1, 13, 1, 20]
            ]);
        });
        test('findNextMatch without regex', function () {
            var model = textModel_1.TextModel.createFromString('line line one\nline two\nthree');
            var searchParams = new textModelSearch_1.SearchParams('line', false, false, null);
            var actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 6, 1, 10));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 3), false);
            assertFindMatch(actual, new range_1.Range(1, 6, 1, 10));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            model.dispose();
        });
        test('findNextMatch with beginning boundary regex', function () {
            var model = textModel_1.TextModel.createFromString('line one\nline two\nthree');
            var searchParams = new textModelSearch_1.SearchParams('^line', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 3), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            model.dispose();
        });
        test('findNextMatch with beginning boundary regex and line has repetitive beginnings', function () {
            var model = textModel_1.TextModel.createFromString('line line one\nline two\nthree');
            var searchParams = new textModelSearch_1.SearchParams('^line', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 3), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            model.dispose();
        });
        test('findNextMatch with beginning boundary multiline regex and line has repetitive beginnings', function () {
            var model = textModel_1.TextModel.createFromString('line line one\nline two\nline three\nline four');
            var searchParams = new textModelSearch_1.SearchParams('^line.*\\nline', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(3, 1, 4, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(2, 1), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 3, 5));
            model.dispose();
        });
        test('findNextMatch with ending boundary regex', function () {
            var model = textModel_1.TextModel.createFromString('one line line\ntwo line\nthree');
            var searchParams = new textModelSearch_1.SearchParams('line$', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 10, 1, 14));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 4), false);
            assertFindMatch(actual, new range_1.Range(1, 10, 1, 14));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(2, 5, 2, 9));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 10, 1, 14));
            model.dispose();
        });
        test('findMatches with capturing matches', function () {
            var model = textModel_1.TextModel.createFromString('one line line\ntwo line\nthree');
            var searchParams = new textModelSearch_1.SearchParams('(l(in)e)', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 100);
            assert.deepEqual(actual, [
                new model_1.FindMatch(new range_1.Range(1, 5, 1, 9), ['line', 'line', 'in']),
                new model_1.FindMatch(new range_1.Range(1, 10, 1, 14), ['line', 'line', 'in']),
                new model_1.FindMatch(new range_1.Range(2, 5, 2, 9), ['line', 'line', 'in']),
            ]);
            model.dispose();
        });
        test('findMatches multiline with capturing matches', function () {
            var model = textModel_1.TextModel.createFromString('one line line\ntwo line\nthree');
            var searchParams = new textModelSearch_1.SearchParams('(l(in)e)\\n', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 100);
            assert.deepEqual(actual, [
                new model_1.FindMatch(new range_1.Range(1, 10, 2, 1), ['line\n', 'line', 'in']),
                new model_1.FindMatch(new range_1.Range(2, 5, 3, 1), ['line\n', 'line', 'in']),
            ]);
            model.dispose();
        });
        test('findNextMatch with capturing matches', function () {
            var model = textModel_1.TextModel.createFromString('one line line\ntwo line\nthree');
            var searchParams = new textModelSearch_1.SearchParams('(l(in)e)', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            assertFindMatch(actual, new range_1.Range(1, 5, 1, 9), ['line', 'line', 'in']);
            model.dispose();
        });
        test('findNextMatch multiline with capturing matches', function () {
            var model = textModel_1.TextModel.createFromString('one line line\ntwo line\nthree');
            var searchParams = new textModelSearch_1.SearchParams('(l(in)e)\\n', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            assertFindMatch(actual, new range_1.Range(1, 10, 2, 1), ['line\n', 'line', 'in']);
            model.dispose();
        });
        test('findPreviousMatch with capturing matches', function () {
            var model = textModel_1.TextModel.createFromString('one line line\ntwo line\nthree');
            var searchParams = new textModelSearch_1.SearchParams('(l(in)e)', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findPreviousMatch(model, searchParams, new position_1.Position(1, 1), true);
            assertFindMatch(actual, new range_1.Range(2, 5, 2, 9), ['line', 'line', 'in']);
            model.dispose();
        });
        test('findPreviousMatch multiline with capturing matches', function () {
            var model = textModel_1.TextModel.createFromString('one line line\ntwo line\nthree');
            var searchParams = new textModelSearch_1.SearchParams('(l(in)e)\\n', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findPreviousMatch(model, searchParams, new position_1.Position(1, 1), true);
            assertFindMatch(actual, new range_1.Range(2, 5, 3, 1), ['line\n', 'line', 'in']);
            model.dispose();
        });
        test('\\n matches \\r\\n', function () {
            var model = textModel_1.TextModel.createFromString('a\r\nb\r\nc\r\nd\r\ne\r\nf\r\ng\r\nh\r\ni');
            assert.equal(model.getEOL(), '\r\n');
            var searchParams = new textModelSearch_1.SearchParams('h\\n', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 1000)[0];
            assertFindMatch(actual, new range_1.Range(8, 1, 9, 1), ['h\n']);
            searchParams = new textModelSearch_1.SearchParams('g\\nh\\n', true, false, null);
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 1000)[0];
            assertFindMatch(actual, new range_1.Range(7, 1, 9, 1), ['g\nh\n']);
            searchParams = new textModelSearch_1.SearchParams('\\ni', true, false, null);
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 1000)[0];
            assertFindMatch(actual, new range_1.Range(8, 2, 9, 2), ['\ni']);
            model.dispose();
        });
        test('\\r can never be found', function () {
            var model = textModel_1.TextModel.createFromString('a\r\nb\r\nc\r\nd\r\ne\r\nf\r\ng\r\nh\r\ni');
            assert.equal(model.getEOL(), '\r\n');
            var searchParams = new textModelSearch_1.SearchParams('\\r\\n', true, false, null);
            var actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            assert.equal(actual, null);
            assert.deepEqual(textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 1000), []);
            model.dispose();
        });
        function assertParseSearchResult(searchString, isRegex, matchCase, wordSeparators, expected) {
            var searchParams = new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators);
            var actual = searchParams.parseSearchRequest();
            if (expected === null) {
                assert.ok(actual === null);
            }
            else {
                assert.deepEqual(actual.regex, expected.regex);
                assert.deepEqual(actual.simpleSearch, expected.simpleSearch);
                if (wordSeparators) {
                    assert.ok(actual.wordSeparators !== null);
                }
                else {
                    assert.ok(actual.wordSeparators === null);
                }
            }
        }
        test('parseSearchRequest invalid', function () {
            assertParseSearchResult('', true, true, wordHelper_1.USUAL_WORD_SEPARATORS, null);
            assertParseSearchResult(null, true, true, wordHelper_1.USUAL_WORD_SEPARATORS, null);
            assertParseSearchResult('(', true, false, null, null);
        });
        test('parseSearchRequest non regex', function () {
            assertParseSearchResult('foo', false, false, null, new textModelSearch_1.SearchData(/foo/gi, null, null));
            assertParseSearchResult('foo', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, new textModelSearch_1.SearchData(/foo/gi, usualWordSeparators, null));
            assertParseSearchResult('foo', false, true, null, new textModelSearch_1.SearchData(/foo/g, null, 'foo'));
            assertParseSearchResult('foo', false, true, wordHelper_1.USUAL_WORD_SEPARATORS, new textModelSearch_1.SearchData(/foo/g, usualWordSeparators, 'foo'));
            assertParseSearchResult('foo\\n', false, false, null, new textModelSearch_1.SearchData(/foo\\n/gi, null, null));
            assertParseSearchResult('foo\\\\n', false, false, null, new textModelSearch_1.SearchData(/foo\\\\n/gi, null, null));
            assertParseSearchResult('foo\\r', false, false, null, new textModelSearch_1.SearchData(/foo\\r/gi, null, null));
            assertParseSearchResult('foo\\\\r', false, false, null, new textModelSearch_1.SearchData(/foo\\\\r/gi, null, null));
        });
        test('parseSearchRequest regex', function () {
            assertParseSearchResult('foo', true, false, null, new textModelSearch_1.SearchData(/foo/gi, null, null));
            assertParseSearchResult('foo', true, false, wordHelper_1.USUAL_WORD_SEPARATORS, new textModelSearch_1.SearchData(/foo/gi, usualWordSeparators, null));
            assertParseSearchResult('foo', true, true, null, new textModelSearch_1.SearchData(/foo/g, null, null));
            assertParseSearchResult('foo', true, true, wordHelper_1.USUAL_WORD_SEPARATORS, new textModelSearch_1.SearchData(/foo/g, usualWordSeparators, null));
            assertParseSearchResult('foo\\n', true, false, null, new textModelSearch_1.SearchData(/foo\n/gim, null, null));
            assertParseSearchResult('foo\\\\n', true, false, null, new textModelSearch_1.SearchData(/foo\\n/gi, null, null));
            assertParseSearchResult('foo\\r', true, false, null, new textModelSearch_1.SearchData(/foo\r/gim, null, null));
            assertParseSearchResult('foo\\\\r', true, false, null, new textModelSearch_1.SearchData(/foo\\r/gi, null, null));
        });
    });
});
