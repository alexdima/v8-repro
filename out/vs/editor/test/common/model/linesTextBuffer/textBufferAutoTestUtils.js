define(["require", "exports", "vs/editor/common/model", "vs/editor/common/core/range"], function (require, exports, model_1, range_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    exports.getRandomInt = getRandomInt;
    function getRandomEOLSequence() {
        var rnd = getRandomInt(1, 3);
        if (rnd === 1) {
            return '\n';
        }
        if (rnd === 2) {
            return '\r';
        }
        return '\r\n';
    }
    exports.getRandomEOLSequence = getRandomEOLSequence;
    function getRandomString(minLength, maxLength) {
        var length = getRandomInt(minLength, maxLength);
        var r = '';
        for (var i = 0; i < length; i++) {
            r += String.fromCharCode(getRandomInt(97 /* a */, 122 /* z */));
        }
        return r;
    }
    exports.getRandomString = getRandomString;
    function generateRandomEdits(chunks, editCnt) {
        var lines = [];
        for (var i = 0; i < chunks.length; i++) {
            var newLines = chunks[i].split(/\r\n|\r|\n/);
            if (lines.length === 0) {
                lines.push.apply(lines, newLines);
            }
            else {
                newLines[0] = lines[lines.length - 1] + newLines[0];
                lines.splice.apply(lines, [lines.length - 1, 1].concat(newLines));
            }
        }
        var ops = [];
        for (var i = 0; i < editCnt; i++) {
            var line = getRandomInt(1, lines.length);
            var startColumn = getRandomInt(1, Math.max(lines[line - 1].length, 1));
            var endColumn = getRandomInt(startColumn, Math.max(lines[line - 1].length, startColumn));
            var text = '';
            if (Math.random() < .5) {
                text = getRandomString(5, 10);
            }
            ops.push({
                text: text,
                range: new range_1.Range(line, startColumn, line, endColumn)
            });
            lines[line - 1] = lines[line - 1].substring(0, startColumn - 1) + text + lines[line - 1].substring(endColumn - 1);
        }
        return ops;
    }
    exports.generateRandomEdits = generateRandomEdits;
    function generateSequentialInserts(chunks, editCnt) {
        var lines = [];
        for (var i = 0; i < chunks.length; i++) {
            var newLines = chunks[i].split(/\r\n|\r|\n/);
            if (lines.length === 0) {
                lines.push.apply(lines, newLines);
            }
            else {
                newLines[0] = lines[lines.length - 1] + newLines[0];
                lines.splice.apply(lines, [lines.length - 1, 1].concat(newLines));
            }
        }
        var ops = [];
        for (var i = 0; i < editCnt; i++) {
            var line = lines.length;
            var column = lines[line - 1].length + 1;
            var text = '';
            if (Math.random() < .5) {
                text = '\n';
                lines.push('');
            }
            else {
                text = getRandomString(1, 2);
                lines[line - 1] += text;
            }
            ops.push({
                text: text,
                range: new range_1.Range(line, column, line, column)
            });
        }
        return ops;
    }
    exports.generateSequentialInserts = generateSequentialInserts;
    function generateRandomReplaces(chunks, editCnt, searchStringLen, replaceStringLen) {
        var lines = [];
        for (var i = 0; i < chunks.length; i++) {
            var newLines = chunks[i].split(/\r\n|\r|\n/);
            if (lines.length === 0) {
                lines.push.apply(lines, newLines);
            }
            else {
                newLines[0] = lines[lines.length - 1] + newLines[0];
                lines.splice.apply(lines, [lines.length - 1, 1].concat(newLines));
            }
        }
        var ops = [];
        var chunkSize = Math.max(1, Math.floor(lines.length / editCnt));
        var chunkCnt = Math.floor(lines.length / chunkSize);
        var replaceString = getRandomString(replaceStringLen, replaceStringLen);
        var previousChunksLength = 0;
        for (var i = 0; i < chunkCnt; i++) {
            var startLine = previousChunksLength + 1;
            var endLine = previousChunksLength + chunkSize;
            var line = getRandomInt(startLine, endLine);
            var maxColumn = lines[line - 1].length + 1;
            var startColumn = getRandomInt(1, maxColumn);
            var endColumn = Math.min(maxColumn, startColumn + searchStringLen);
            ops.push({
                text: replaceString,
                range: new range_1.Range(line, startColumn, line, endColumn)
            });
            previousChunksLength = endLine;
        }
        return ops;
    }
    exports.generateRandomReplaces = generateRandomReplaces;
    function createMockText(lineCount, minColumn, maxColumn) {
        var fixedEOL = getRandomEOLSequence();
        var lines = [];
        for (var i = 0; i < lineCount; i++) {
            if (i !== 0) {
                lines.push(fixedEOL);
            }
            lines.push(getRandomString(minColumn, maxColumn));
        }
        return lines.join('');
    }
    exports.createMockText = createMockText;
    function createMockBuffer(str, bufferBuilder) {
        bufferBuilder.acceptChunk(str);
        var bufferFactory = bufferBuilder.finish();
        var buffer = bufferFactory.create(model_1.DefaultEndOfLine.LF);
        return buffer;
    }
    exports.createMockBuffer = createMockBuffer;
    function generateRandomChunkWithLF(minLength, maxLength) {
        var length = getRandomInt(minLength, maxLength);
        var r = '';
        for (var i = 0; i < length; i++) {
            var randomI = getRandomInt(0, 122 /* z */ - 97 /* a */ + 1);
            if (randomI === 0 && Math.random() < 0.3) {
                r += '\n';
            }
            else {
                r += String.fromCharCode(randomI + 97 /* a */ - 1);
            }
        }
        return r;
    }
    exports.generateRandomChunkWithLF = generateRandomChunkWithLF;
});
