/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./winjs.base"], function (require, exports, winjs_base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A polyfill for the native promises. The implementation is based on
     * WinJS promises but tries to gap differences between winjs promises
     * and native promises.
     */
    var PolyfillPromise = /** @class */ (function () {
        function PolyfillPromise(initOrPromise) {
            if (winjs_base_1.Promise.is(initOrPromise)) {
                this._winjsPromise = initOrPromise;
            }
            else {
                this._winjsPromise = new winjs_base_1.Promise(function (resolve, reject) {
                    var initializing = true;
                    initOrPromise(function (value) {
                        if (!initializing) {
                            resolve(value);
                        }
                        else {
                            setImmediate(resolve, value);
                        }
                    }, function (err) {
                        if (!initializing) {
                            reject(err);
                        }
                        else {
                            setImmediate(reject, err);
                        }
                    });
                    initializing = false;
                });
            }
        }
        PolyfillPromise.all = function (thenables) {
            return new PolyfillPromise(winjs_base_1.Promise.join(thenables).then(null, function (values) {
                // WinJSPromise returns a sparse array whereas
                // native promises return the *first* error
                for (var key in values) {
                    if (values.hasOwnProperty(key)) {
                        return values[key];
                    }
                }
            }));
        };
        PolyfillPromise.race = function (thenables) {
            // WinJSPromise returns `{ key: <index/key>, value: <promise> }`
            // from the `any` call and Promise.race just wants the value
            return new PolyfillPromise(winjs_base_1.Promise.any(thenables).then(function (entry) { return entry.value; }, function (err) { return err.value; }));
        };
        PolyfillPromise.resolve = function (value) {
            return new PolyfillPromise(winjs_base_1.Promise.wrap(value));
        };
        PolyfillPromise.reject = function (value) {
            return new PolyfillPromise(winjs_base_1.Promise.wrapError(value));
        };
        PolyfillPromise.prototype.then = function (onFulfilled, onRejected) {
            var sync = true;
            var promise = new PolyfillPromise(this._winjsPromise.then(onFulfilled && function (value) {
                if (!sync) {
                    onFulfilled(value);
                }
                else {
                    setImmediate(onFulfilled, value);
                }
            }, onRejected && function (err) {
                if (!sync) {
                    onFulfilled(err);
                }
                else {
                    setImmediate(onFulfilled, err);
                }
            }));
            sync = false;
            return promise;
        };
        PolyfillPromise.prototype.catch = function (onRejected) {
            return this.then(null, onRejected);
        };
        return PolyfillPromise;
    }());
    exports.PolyfillPromise = PolyfillPromise;
});
