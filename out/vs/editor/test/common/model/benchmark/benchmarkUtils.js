/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model", "vs/editor/common/model/linesTextBuffer/linesTextBufferBuilder", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/editor/common/model/chunksTextBuffer/chunksTextBufferBuilder"], function (require, exports, model_1, linesTextBufferBuilder_1, pieceTreeTextBufferBuilder_1, chunksTextBufferBuilder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function doBenchmark(id, ts, fn) {
        var columns = [id];
        for (var i = 0; i < ts.length; i++) {
            var start = process.hrtime();
            fn(ts[i]);
            var diff = process.hrtime(start);
            columns.push((diff[0] * 1000 + diff[1] / 1000000).toFixed(3) + " ms");
        }
        console.log('|' + columns.join('\t|') + '|');
    }
    exports.doBenchmark = doBenchmark;
    var BenchmarkSuite = /** @class */ (function () {
        function BenchmarkSuite(suiteOptions) {
            this.name = suiteOptions.name;
            this.iterations = suiteOptions.iterations;
            this.benchmarks = [];
        }
        BenchmarkSuite.prototype.add = function (benchmark) {
            this.benchmarks.push(benchmark);
        };
        BenchmarkSuite.prototype.run = function () {
            var _this = this;
            console.log("|" + this.name + "\t|line buffer\t|piece table\t|edcore\t");
            console.log('|---|---|---|---|');
            var _loop_1 = function (i) {
                var benchmark = this_1.benchmarks[i];
                var columns = [benchmark.name];
                [new linesTextBufferBuilder_1.LinesTextBufferBuilder(), new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder(), new chunksTextBufferBuilder_1.ChunksTextBufferBuilder()].forEach(function (builder) {
                    var timeDiffTotal = 0.0;
                    for (var j = 0; j < _this.iterations; j++) {
                        var factory = benchmark.buildBuffer(builder);
                        var buffer = factory.create(model_1.DefaultEndOfLine.LF);
                        benchmark.preCycle(buffer);
                        var start = process.hrtime();
                        benchmark.fn(buffer);
                        var diff = process.hrtime(start);
                        timeDiffTotal += (diff[0] * 1000 * 1000 + diff[1] / 1000);
                    }
                    columns.push((timeDiffTotal / 1000 / _this.iterations).toFixed(3) + " ms");
                });
                console.log('|' + columns.join('\t|') + '|');
            };
            var this_1 = this;
            for (var i = 0; i < this.benchmarks.length; i++) {
                _loop_1(i);
            }
            console.log('\n');
        };
        return BenchmarkSuite;
    }());
    exports.BenchmarkSuite = BenchmarkSuite;
});
