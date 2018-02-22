/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "path", "assert", "vs/base/common/arrays", "vs/base/common/platform", "vs/workbench/services/search/node/ripgrepTextSearch"], function (require, exports, path, assert, arrays, platform, ripgrepTextSearch_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('RipgrepParser', function () {
        var rootFolder = '/workspace';
        var fileSectionEnd = '\n';
        function getFileLine(relativePath) {
            return "\u001B[0m" + relativePath + "\u001B[0m";
        }
        function getMatchLine(lineNum, matchParts) {
            var matchLine = "\u001B[0m" + lineNum + "\u001B[0m:" +
                ("" + matchParts.shift() + ripgrepTextSearch_1.RipgrepParser.MATCH_START_MARKER + matchParts.shift() + ripgrepTextSearch_1.RipgrepParser.MATCH_END_MARKER + matchParts.shift());
            while (matchParts.length) {
                matchLine += "" + ripgrepTextSearch_1.RipgrepParser.MATCH_START_MARKER + matchParts.shift() + ripgrepTextSearch_1.RipgrepParser.MATCH_END_MARKER + (matchParts.shift() || '');
            }
            return matchLine;
        }
        function parseInputStrings(inputChunks) {
            return parseInput(inputChunks.map(function (chunk) { return new Buffer(chunk); }));
        }
        function parseInput(inputChunks) {
            var matches = [];
            var rgp = new ripgrepTextSearch_1.RipgrepParser(1e6, rootFolder);
            rgp.on('result', function (match) {
                matches.push(match);
            });
            inputChunks.forEach(function (chunk) { return rgp.handleData(chunk); });
            rgp.flush();
            return matches;
        }
        function halve(str) {
            var halfIdx = Math.floor(str.length / 2);
            return [str.substr(0, halfIdx), str.substr(halfIdx)];
        }
        function arrayOfChars(str) {
            var chars = [];
            for (var _i = 0, str_1 = str; _i < str_1.length; _i++) {
                var char = str_1[_i];
                chars.push(char);
            }
            return chars;
        }
        test('Parses one chunk', function () {
            var input = [
                [getFileLine('a.txt'), getMatchLine(1, ['before', 'match', 'after']), getMatchLine(2, ['before', 'match', 'after']), fileSectionEnd].join('\n')
            ];
            var results = parseInputStrings(input);
            assert.equal(results.length, 1);
            assert.deepEqual(results[0], {
                numMatches: 2,
                path: path.join(rootFolder, 'a.txt'),
                lineMatches: [
                    {
                        lineNumber: 0,
                        preview: 'beforematchafter',
                        offsetAndLengths: [[6, 5]]
                    },
                    {
                        lineNumber: 1,
                        preview: 'beforematchafter',
                        offsetAndLengths: [[6, 5]]
                    }
                ]
            });
        });
        test('Parses multiple chunks broken at file sections', function () {
            var input = [
                [getFileLine('a.txt'), getMatchLine(1, ['before', 'match', 'after']), getMatchLine(2, ['before', 'match', 'after']), fileSectionEnd].join('\n'),
                [getFileLine('b.txt'), getMatchLine(1, ['before', 'match', 'after']), getMatchLine(2, ['before', 'match', 'after']), fileSectionEnd].join('\n'),
                [getFileLine('c.txt'), getMatchLine(1, ['before', 'match', 'after']), getMatchLine(2, ['before', 'match', 'after']), fileSectionEnd].join('\n')
            ];
            var results = parseInputStrings(input);
            assert.equal(results.length, 3);
            results.forEach(function (fileResult) { return assert.equal(fileResult.numMatches, 2); });
        });
        var singleLineChunks = [
            getFileLine('a.txt'),
            getMatchLine(1, ['before', 'match', 'after']),
            getMatchLine(2, ['before', 'match', 'after']),
            fileSectionEnd,
            getFileLine('b.txt'),
            getMatchLine(1, ['before', 'match', 'after']),
            getMatchLine(2, ['before', 'match', 'after']),
            fileSectionEnd,
            getFileLine('c.txt'),
            getMatchLine(1, ['before', 'match', 'after']),
            getMatchLine(2, ['before', 'match', 'after']),
            fileSectionEnd
        ];
        test('Parses multiple chunks broken at each line', function () {
            var input = singleLineChunks.map(function (chunk) { return chunk + '\n'; });
            var results = parseInputStrings(input);
            assert.equal(results.length, 3);
            results.forEach(function (fileResult) { return assert.equal(fileResult.numMatches, 2); });
        });
        test('Parses multiple chunks broken in the middle of each line', function () {
            var input = arrays.flatten(singleLineChunks
                .map(function (chunk) { return chunk + '\n'; })
                .map(halve));
            var results = parseInputStrings(input);
            assert.equal(results.length, 3);
            results.forEach(function (fileResult) { return assert.equal(fileResult.numMatches, 2); });
        });
        test('Parses multiple chunks broken at each character', function () {
            var input = arrays.flatten(singleLineChunks
                .map(function (chunk) { return chunk + '\n'; })
                .map(arrayOfChars));
            var results = parseInputStrings(input);
            assert.equal(results.length, 3);
            results.forEach(function (fileResult) { return assert.equal(fileResult.numMatches, 2); });
        });
        test('Parses chunks broken before newline', function () {
            var input = singleLineChunks
                .map(function (chunk) { return '\n' + chunk; });
            var results = parseInputStrings(input);
            assert.equal(results.length, 3);
            results.forEach(function (fileResult) { return assert.equal(fileResult.numMatches, 2); });
        });
        test('Parses chunks broken in the middle of a multibyte character', function () {
            var text = getFileLine('foo/bar') + '\n' + getMatchLine(0, ['before漢', 'match', 'after']) + '\n';
            var buf = new Buffer(text);
            // Split the buffer at every possible position - it should still be parsed correctly
            for (var i = 0; i < buf.length; i++) {
                var inputBufs = [
                    buf.slice(0, i),
                    buf.slice(i)
                ];
                var results = parseInput(inputBufs);
                assert.equal(results.length, 1);
                assert.equal(results[0].lineMatches.length, 1);
                assert.deepEqual(results[0].lineMatches[0].offsetAndLengths, [[7, 5]]);
            }
        });
    });
    suite('RipgrepParser - etc', function () {
        function testGetAbsGlob(params) {
            var folder = params[0], glob = params[1], expectedResult = params[2];
            assert.equal(ripgrepTextSearch_1.fixDriveC(ripgrepTextSearch_1.getAbsoluteGlob(folder, glob)), expectedResult, JSON.stringify(params));
        }
        test('getAbsoluteGlob_win', function () {
            if (!platform.isWindows) {
                return;
            }
            [
                ['C:/foo/bar', 'glob/**', '/foo\\bar\\glob\\**'],
                ['c:/', 'glob/**', '/glob\\**'],
                ['C:\\foo\\bar', 'glob\\**', '/foo\\bar\\glob\\**'],
                ['c:\\foo\\bar', 'glob\\**', '/foo\\bar\\glob\\**'],
                ['c:\\', 'glob\\**', '/glob\\**'],
                ['\\\\localhost\\c$\\foo\\bar', 'glob/**', '\\\\localhost\\c$\\foo\\bar\\glob\\**'],
                // absolute paths are not resolved further
                ['c:/foo/bar', '/path/something', '/path/something'],
                ['c:/foo/bar', 'c:\\project\\folder', '/project\\folder']
            ].forEach(testGetAbsGlob);
        });
        test('getAbsoluteGlob_posix', function () {
            if (platform.isWindows) {
                return;
            }
            [
                ['/foo/bar', 'glob/**', '/foo/bar/glob/**'],
                ['/', 'glob/**', '/glob/**'],
                // absolute paths are not resolved further
                ['/', '/project/folder', '/project/folder'],
            ].forEach(testGetAbsGlob);
        });
    });
});
