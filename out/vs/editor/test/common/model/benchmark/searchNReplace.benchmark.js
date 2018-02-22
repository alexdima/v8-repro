define(["require", "exports", "vs/editor/test/common/model/linesTextBuffer/textBufferAutoTestUtils", "vs/editor/test/common/model/benchmark/benchmarkUtils"], function (require, exports, textBufferAutoTestUtils_1, benchmarkUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var fileSizes = [1, 1000, 64 * 1000, 32 * 1000 * 1000];
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
        var replaceSuite = new benchmarkUtils_1.BenchmarkSuite({
            name: "File Size: " + fileSize + "Byte",
            iterations: 10
        });
        var edits = textBufferAutoTestUtils_1.generateRandomReplaces(chunks, 500, 5, 10);
        var _loop_2 = function (i) {
            replaceSuite.add({
                name: "replace " + i + " occurrences",
                buildBuffer: function (textBufferBuilder) {
                    chunks.forEach(function (ck) { return textBufferBuilder.acceptChunk(ck); });
                    return textBufferBuilder.finish();
                },
                preCycle: function (textBuffer) {
                    return textBuffer;
                },
                fn: function (textBuffer) {
                    textBuffer.applyEdits(edits.slice(0, i), false);
                }
            });
        };
        for (var _i = 0, _a = [10, 100, 500]; _i < _a.length; _i++) {
            var i = _a[_i];
            _loop_2(i);
        }
        replaceSuite.run();
    };
    for (var _i = 0, fileSizes_1 = fileSizes; _i < fileSizes_1.length; _i++) {
        var fileSize = fileSizes_1[_i];
        _loop_1(fileSize);
    }
});
