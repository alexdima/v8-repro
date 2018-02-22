define(["require", "exports", "vs/base/common/platform", "vs/base/common/worker/simpleWorker"], function (require, exports, platform_1, simpleWorker_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Option for hosts to overwrite the worker script url (used in the standalone editor)
    var getCrossOriginWorkerScriptUrl = environment('getWorkerUrl', null);
    function environment(name, fallback) {
        if (fallback === void 0) { fallback = false; }
        if (platform_1.globals.MonacoEnvironment && platform_1.globals.MonacoEnvironment.hasOwnProperty(name)) {
            return platform_1.globals.MonacoEnvironment[name];
        }
        return fallback;
    }
    function defaultGetWorkerUrl(workerId, label) {
        return require.toUrl('./' + workerId) + '#' + label;
    }
    var getWorkerUrl = getCrossOriginWorkerScriptUrl || defaultGetWorkerUrl;
    /**
     * A worker that uses HTML5 web workers so that is has
     * its own global scope and its own thread.
     */
    var WebWorker = /** @class */ (function () {
        function WebWorker(moduleId, id, label, onMessageCallback, onErrorCallback) {
            this.id = id;
            this.worker = new Worker(getWorkerUrl('workerMain.js', label));
            this.postMessage(moduleId);
            this.worker.onmessage = function (ev) {
                onMessageCallback(ev.data);
            };
            if (typeof this.worker.addEventListener === 'function') {
                this.worker.addEventListener('error', onErrorCallback);
            }
        }
        WebWorker.prototype.getId = function () {
            return this.id;
        };
        WebWorker.prototype.postMessage = function (msg) {
            if (this.worker) {
                this.worker.postMessage(msg);
            }
        };
        WebWorker.prototype.dispose = function () {
            this.worker.terminate();
            this.worker = null;
        };
        return WebWorker;
    }());
    var DefaultWorkerFactory = /** @class */ (function () {
        function DefaultWorkerFactory(label) {
            this._label = label;
            this._webWorkerFailedBeforeError = false;
        }
        DefaultWorkerFactory.prototype.create = function (moduleId, onMessageCallback, onErrorCallback) {
            var _this = this;
            var workerId = (++DefaultWorkerFactory.LAST_WORKER_ID);
            if (this._webWorkerFailedBeforeError) {
                throw this._webWorkerFailedBeforeError;
            }
            return new WebWorker(moduleId, workerId, this._label || 'anonymous' + workerId, onMessageCallback, function (err) {
                simpleWorker_1.logOnceWebWorkerWarning(err);
                _this._webWorkerFailedBeforeError = err;
                onErrorCallback(err);
            });
        };
        DefaultWorkerFactory.LAST_WORKER_ID = 0;
        return DefaultWorkerFactory;
    }());
    exports.DefaultWorkerFactory = DefaultWorkerFactory;
});
