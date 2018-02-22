define(["require", "exports", "vs/editor/common/model/linesTextBuffer/linesTextBufferBuilder", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/editor/test/common/model/linesTextBuffer/textBufferAutoTestUtils", "vs/editor/test/common/model/benchmark/benchmarkUtils"], function (require, exports, linesTextBufferBuilder_1, pieceTreeTextBufferBuilder_1, textBufferAutoTestUtils_1, benchmarkUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var linesTextBufferBuilder = new linesTextBufferBuilder_1.LinesTextBufferBuilder();
    var pieceTreeTextBufferBuilder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
    var chunks = [];
    for (var i = 0; i < 100; i++) {
        chunks.push(textBufferAutoTestUtils_1.generateRandomChunkWithLF(16 * 1000, 64 * 1000));
    }
    var modelBuildBenchmark = function (id, builders, chunkCnt) {
        benchmarkUtils_1.doBenchmark(id, builders, function (builder) {
            for (var i = 0, len = Math.min(chunkCnt, chunks.length); i < len; i++) {
                builder.acceptChunk(chunks[i]);
            }
            builder.finish();
        });
    };
    console.log("|model builder\t|line buffer\t|piece table\t|");
    console.log('|---|---|---|');
    for (var _i = 0, _a = [10, 100]; _i < _a.length; _i++) {
        var i = _a[_i];
        modelBuildBenchmark(i + " random chunks", [linesTextBufferBuilder, pieceTreeTextBufferBuilder], i);
    }
});
