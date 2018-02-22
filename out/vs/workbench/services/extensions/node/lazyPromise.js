define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/errors"], function (require, exports, winjs_base_1, errors_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var LazyPromise = /** @class */ (function () {
        function LazyPromise(onCancel) {
            this._onCancel = onCancel;
            this._actual = null;
            this._actualOk = null;
            this._actualErr = null;
            this._hasValue = false;
            this._value = null;
            this._hasErr = false;
            this._err = null;
            this._isCanceled = false;
        }
        LazyPromise.prototype._ensureActual = function () {
            var _this = this;
            if (!this._actual) {
                this._actual = new winjs_base_1.TPromise(function (c, e) {
                    _this._actualOk = c;
                    _this._actualErr = e;
                }, this._onCancel);
                if (this._hasValue) {
                    this._actualOk(this._value);
                }
                if (this._hasErr) {
                    this._actualErr(this._err);
                }
            }
            return this._actual;
        };
        LazyPromise.prototype.resolveOk = function (value) {
            if (this._isCanceled || this._hasErr) {
                return;
            }
            this._hasValue = true;
            this._value = value;
            if (this._actual) {
                this._actualOk(value);
            }
        };
        LazyPromise.prototype.resolveErr = function (err) {
            if (this._isCanceled || this._hasValue) {
                return;
            }
            this._hasErr = true;
            this._err = err;
            if (this._actual) {
                this._actualErr(err);
            }
            else {
                // If nobody's listening at this point, it is safe to assume they never will,
                // since resolving this promise is always "async"
                errors_1.onUnexpectedError(err);
            }
        };
        LazyPromise.prototype.then = function (success, error) {
            if (this._isCanceled) {
                return;
            }
            return this._ensureActual().then(success, error);
        };
        LazyPromise.prototype.done = function (success, error) {
            if (this._isCanceled) {
                return;
            }
            this._ensureActual().done(success, error);
        };
        LazyPromise.prototype.cancel = function () {
            if (this._hasValue || this._hasErr) {
                return;
            }
            this._isCanceled = true;
            if (this._actual) {
                this._actual.cancel();
            }
            else {
                this._onCancel();
            }
        };
        return LazyPromise;
    }());
    exports.LazyPromise = LazyPromise;
});
