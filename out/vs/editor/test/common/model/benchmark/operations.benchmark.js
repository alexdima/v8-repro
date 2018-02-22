/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model", "vs/editor/test/common/model/benchmark/benchmarkUtils", "vs/editor/test/common/model/linesTextBuffer/textBufferAutoTestUtils", "vs/editor/common/core/range"], function (require, exports, model_1, benchmarkUtils_1, textBufferAutoTestUtils_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fileSizes = [1, 1000, 64 * 1000, 32 * 1000 * 1000];
    var editTypes = [
        {
            id: 'random edits',
            generateEdits: textBufferAutoTestUtils_1.generateRandomEdits
        },
        {
            id: 'sequential inserts',
            generateEdits: textBufferAutoTestUtils_1.generateSequentialInserts
        }
    ];
    var _loop_1 = function (fileSize) {
        var chunks = [];
        var chunkCnt = Math.floor(fileSize / (64 * 1000));
        if (chunkCnt === 0) {
            chunks.push(textBufferAutoTestUtils_1.generateRandomChunkWithLF(fileSize, fileSize));
        }
        else {
            var chunk = textBufferAutoTestUtils_1.generateRandomChunkWithLF(64 * 1000, 64 * 1000);
            // try to avoid OOM
            for (var j = 0; j < chunkCnt; j++) {
                chunks.push(Buffer.from(chunk + j).toString());
            }
        }
        var _loop_2 = function (editType) {
            var edits = editType.generateEdits(chunks, 1000);
            var editsSuite = new benchmarkUtils_1.BenchmarkSuite({
                name: "File Size: " + fileSize + "Byte, " + editType.id,
                iterations: 10
            });
            editsSuite.add({
                name: "apply 1000 edits",
                buildBuffer: function (textBufferBuilder) {
                    chunks.forEach(function (ck) { return textBufferBuilder.acceptChunk(ck); });
                    return textBufferBuilder.finish();
                },
                preCycle: function (textBuffer) {
                    return textBuffer;
                },
                fn: function (textBuffer) {
                    // for line model, this loop doesn't reflect the real situation.
                    for (var k = 0; k < edits.length; k++) {
                        textBuffer.applyEdits([edits[k]], false);
                    }
                }
            });
            editsSuite.add({
                name: "Read all lines after 1000 edits",
                buildBuffer: function (textBufferBuilder) {
                    chunks.forEach(function (ck) { return textBufferBuilder.acceptChunk(ck); });
                    return textBufferBuilder.finish();
                },
                preCycle: function (textBuffer) {
                    for (var k = 0; k < edits.length; k++) {
                        textBuffer.applyEdits([edits[k]], false);
                    }
                    return textBuffer;
                },
                fn: function (textBuffer) {
                    for (var j = 0, len = textBuffer.getLineCount(); j < len; j++) {
                        var str = textBuffer.getLineContent(j + 1);
                        var firstChar = str.charCodeAt(0);
                        var lastChar = str.charCodeAt(str.length - 1);
                        firstChar = firstChar - lastChar;
                        lastChar = firstChar + lastChar;
                        firstChar = lastChar - firstChar;
                    }
                }
            });
            editsSuite.add({
                name: "Read 10 random windows after 1000 edits",
                buildBuffer: function (textBufferBuilder) {
                    chunks.forEach(function (ck) { return textBufferBuilder.acceptChunk(ck); });
                    return textBufferBuilder.finish();
                },
                preCycle: function (textBuffer) {
                    for (var k = 0; k < edits.length; k++) {
                        textBuffer.applyEdits([edits[k]], false);
                    }
                    return textBuffer;
                },
                fn: function (textBuffer) {
                    for (var i = 0; i < 10; i++) {
                        var minLine = 1;
                        var maxLine = textBuffer.getLineCount();
                        var startLine = textBufferAutoTestUtils_1.getRandomInt(minLine, Math.max(minLine, maxLine - 100));
                        var endLine = Math.min(maxLine, startLine + 100);
                        for (var j = startLine; j < endLine; j++) {
                            var str = textBuffer.getLineContent(j + 1);
                            var firstChar = str.charCodeAt(0);
                            var lastChar = str.charCodeAt(str.length - 1);
                            firstChar = firstChar - lastChar;
                            lastChar = firstChar + lastChar;
                            firstChar = lastChar - firstChar;
                        }
                    }
                }
            });
            editsSuite.add({
                name: "save file after 1000 edits",
                buildBuffer: function (textBufferBuilder) {
                    chunks.forEach(function (ck) { return textBufferBuilder.acceptChunk(ck); });
                    return textBufferBuilder.finish();
                },
                preCycle: function (textBuffer) {
                    for (var k = 0; k < edits.length; k++) {
                        textBuffer.applyEdits([edits[k]], false);
                    }
                    return textBuffer;
                },
                fn: function (textBuffer) {
                    var lineCount = textBuffer.getLineCount();
                    var fullModelRange = new range_1.Range(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
                    textBuffer.getValueInRange(fullModelRange, model_1.EndOfLinePreference.LF);
                }
            });
            editsSuite.run();
        };
        for (var _i = 0, editTypes_1 = editTypes; _i < editTypes_1.length; _i++) {
            var editType = editTypes_1[_i];
            _loop_2(editType);
        }
    };
    for (var _i = 0, fileSizes_1 = fileSizes; _i < fileSizes_1.length; _i++) {
        var fileSize = fileSizes_1[_i];
        _loop_1(fileSize);
    }
});
