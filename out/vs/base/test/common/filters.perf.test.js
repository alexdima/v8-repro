define(["require", "exports", "vs/base/common/filters", "./filters.perf.data"], function (require, exports, filters, filters_perf_data_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var patterns = ['cci', 'ida', 'pos', 'CCI', 'enbled', 'callback', 'gGame', 'cons'];
    var _enablePerf = false;
    function perfSuite(name, callback) {
        if (_enablePerf) {
            suite(name, callback);
        }
    }
    perfSuite('Performance - fuzzyMatch', function () {
        console.log("Matching " + filters_perf_data_1.data.length + " items against " + patterns.length + " patterns (" + filters_perf_data_1.data.length * patterns.length + " operations) ");
        function perfTest(name, match) {
            test(name, function () {
                var t1 = Date.now();
                var count = 0;
                for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
                    var pattern = patterns_1[_i];
                    for (var _a = 0, data_1 = filters_perf_data_1.data; _a < data_1.length; _a++) {
                        var item = data_1[_a];
                        count += 1;
                        match(pattern, item);
                    }
                }
                var d = Date.now() - t1;
                console.log(name, d + "ms, " + Math.round(count / d) * 15 + "ops/15ms");
            });
        }
        perfTest('matchesFuzzy', filters.matchesFuzzy);
        perfTest('fuzzyContiguousFilter', filters.fuzzyContiguousFilter);
        perfTest('fuzzyScore', filters.fuzzyScore);
        perfTest('fuzzyScoreGraceful', filters.fuzzyScoreGraceful);
        perfTest('fuzzyScoreGracefulAggressive', filters.fuzzyScoreGracefulAggressive);
    });
});
