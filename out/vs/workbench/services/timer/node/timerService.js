define(["require", "exports", "vs/base/node/id", "vs/base/common/performance", "os"], function (require, exports, id_1, perf, os) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TimerService = /** @class */ (function () {
        function TimerService(initData, isEmptyWorkbench) {
            this.isEmptyWorkbench = isEmptyWorkbench;
            this.start = initData.start;
            this.windowLoad = initData.windowLoad;
            this.isInitialStartup = initData.isInitialStartup;
            this.hasAccessibilitySupport = initData.hasAccessibilitySupport;
        }
        Object.defineProperty(TimerService.prototype, "startupMetrics", {
            get: function () {
                if (!this._startupMetrics) {
                    this._computeStartupMetrics();
                }
                return this._startupMetrics;
            },
            enumerable: true,
            configurable: true
        });
        TimerService.prototype._computeStartupMetrics = function () {
            var now = Date.now();
            var initialStartup = !!this.isInitialStartup;
            var start = initialStartup ? this.start : this.windowLoad;
            var totalmem;
            var freemem;
            var cpus;
            var platform;
            var release;
            var arch;
            var loadavg;
            var meminfo;
            var isVMLikelyhood;
            try {
                totalmem = os.totalmem();
                freemem = os.freemem();
                platform = os.platform();
                release = os.release();
                arch = os.arch();
                loadavg = os.loadavg();
                meminfo = process.getProcessMemoryInfo();
                isVMLikelyhood = Math.round((id_1.virtualMachineHint.value() * 100));
                var rawCpus = os.cpus();
                if (rawCpus && rawCpus.length > 0) {
                    cpus = { count: rawCpus.length, speed: rawCpus[0].speed, model: rawCpus[0].model };
                }
            }
            catch (error) {
                // ignore, be on the safe side with these hardware method calls
            }
            var nlsStart = perf.getEntry('mark', 'nlsGeneration:start');
            var nlsEnd = perf.getEntry('mark', 'nlsGeneration:end');
            var nlsTime = nlsStart && nlsEnd ? nlsEnd.startTime - nlsStart.startTime : 0;
            this._startupMetrics = {
                version: 1,
                ellapsed: perf.getEntry('mark', 'didStartWorkbench').startTime - start,
                timers: {
                    ellapsedExtensions: perf.getDuration('willLoadExtensions', 'didLoadExtensions'),
                    ellapsedExtensionsReady: perf.getEntry('mark', 'didLoadExtensions').startTime - start,
                    ellapsedRequire: perf.getDuration('willLoadWorkbenchMain', 'didLoadWorkbenchMain'),
                    ellapsedEditorRestore: perf.getDuration('willRestoreEditors', 'didRestoreEditors'),
                    ellapsedViewletRestore: perf.getDuration('willRestoreViewlet', 'didRestoreViewlet'),
                    ellapsedWorkbench: perf.getDuration('willStartWorkbench', 'didStartWorkbench'),
                    ellapsedWindowLoadToRequire: perf.getEntry('mark', 'willLoadWorkbenchMain').startTime - this.windowLoad,
                    ellapsedTimersToTimersComputed: Date.now() - now,
                    ellapsedNlsGeneration: nlsTime
                },
                platform: platform,
                release: release,
                arch: arch,
                totalmem: totalmem,
                freemem: freemem,
                meminfo: meminfo,
                cpus: cpus,
                loadavg: loadavg,
                initialStartup: initialStartup,
                isVMLikelyhood: isVMLikelyhood,
                hasAccessibilitySupport: !!this.hasAccessibilitySupport,
                emptyWorkbench: this.isEmptyWorkbench
            };
            if (initialStartup) {
                this._startupMetrics.timers.ellapsedAppReady = perf.getDuration('main:started', 'main:appReady');
                this._startupMetrics.timers.ellapsedWindowLoad = this.windowLoad - perf.getEntry('mark', 'main:appReady').startTime;
            }
        };
        return TimerService;
    }());
    exports.TimerService = TimerService;
});
