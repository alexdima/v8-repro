/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/commands/common/commands", "vs/platform/clipboard/common/clipboardService"], function (require, exports, commands_1, clipboardService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /* Copied from loader.ts */
    var LoaderEventType;
    (function (LoaderEventType) {
        LoaderEventType[LoaderEventType["LoaderAvailable"] = 1] = "LoaderAvailable";
        LoaderEventType[LoaderEventType["BeginLoadingScript"] = 10] = "BeginLoadingScript";
        LoaderEventType[LoaderEventType["EndLoadingScriptOK"] = 11] = "EndLoadingScriptOK";
        LoaderEventType[LoaderEventType["EndLoadingScriptError"] = 12] = "EndLoadingScriptError";
        LoaderEventType[LoaderEventType["BeginInvokeFactory"] = 21] = "BeginInvokeFactory";
        LoaderEventType[LoaderEventType["EndInvokeFactory"] = 22] = "EndInvokeFactory";
        LoaderEventType[LoaderEventType["NodeBeginEvaluatingScript"] = 31] = "NodeBeginEvaluatingScript";
        LoaderEventType[LoaderEventType["NodeEndEvaluatingScript"] = 32] = "NodeEndEvaluatingScript";
        LoaderEventType[LoaderEventType["NodeBeginNativeRequire"] = 33] = "NodeBeginNativeRequire";
        LoaderEventType[LoaderEventType["NodeEndNativeRequire"] = 34] = "NodeEndNativeRequire";
    })(LoaderEventType || (LoaderEventType = {}));
    var Tick = /** @class */ (function () {
        function Tick(start, end) {
            this.start = start;
            this.end = end;
            console.assert(start.detail === end.detail);
            this.duration = this.end.timestamp - this.start.timestamp;
            this.detail = start.detail;
        }
        Tick.compareUsingStartTimestamp = function (a, b) {
            if (a.start.timestamp < b.start.timestamp) {
                return -1;
            }
            else if (a.start.timestamp > b.start.timestamp) {
                return 1;
            }
            else {
                return 0;
            }
        };
        return Tick;
    }());
    function getStats() {
        var stats = require.getStats().slice(0).sort(function (a, b) {
            if (a.detail < b.detail) {
                return -1;
            }
            else if (a.detail > b.detail) {
                return 1;
            }
            else if (a.type < b.type) {
                return -1;
            }
            else if (a.type > b.type) {
                return 1;
            }
            else {
                return 0;
            }
        });
        var ticks = new Map();
        ticks.set(LoaderEventType.BeginLoadingScript, []);
        ticks.set(LoaderEventType.BeginInvokeFactory, []);
        ticks.set(LoaderEventType.NodeBeginEvaluatingScript, []);
        ticks.set(LoaderEventType.NodeBeginNativeRequire, []);
        for (var i = 1; i < stats.length - 1; i++) {
            var stat = stats[i];
            var nextStat = stats[i + 1];
            if (nextStat.type - stat.type > 2) {
                //bad?!
                break;
            }
            i += 1;
            ticks.get(stat.type).push(new Tick(stat, nextStat));
        }
        ticks.get(LoaderEventType.BeginLoadingScript).sort(Tick.compareUsingStartTimestamp);
        ticks.get(LoaderEventType.BeginInvokeFactory).sort(Tick.compareUsingStartTimestamp);
        ticks.get(LoaderEventType.NodeBeginEvaluatingScript).sort(Tick.compareUsingStartTimestamp);
        ticks.get(LoaderEventType.NodeBeginNativeRequire).sort(Tick.compareUsingStartTimestamp);
        return ticks;
    }
    commands_1.CommandsRegistry.registerCommand('dev.stats.loader', function (accessor) {
        var clipboard = accessor.get(clipboardService_1.IClipboardService);
        var value = "Name\tDuration\n";
        for (var _i = 0, _a = getStats().get(LoaderEventType.BeginInvokeFactory); _i < _a.length; _i++) {
            var tick = _a[_i];
            value += tick.detail + "\t" + tick.duration.toPrecision(2) + "\n";
        }
        console.log(value);
        clipboard.writeText(value);
    });
});
