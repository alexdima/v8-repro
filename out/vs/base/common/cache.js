/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/winjs.base"], function (require, exports, winjs_base_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Cache = /** @class */ (function () {
        function Cache(task) {
            this.task = task;
            this.promise = null;
        }
        Cache.prototype.get = function () {
            var _this = this;
            if (this.promise) {
                return this.promise;
            }
            var promise = this.task();
            this.promise = new winjs_base_1.TPromise(function (c, e) { return promise.done(c, e); }, function () {
                _this.promise = null;
                promise.cancel();
            });
            return this.promise;
        };
        return Cache;
    }());
    exports.default = Cache;
});
