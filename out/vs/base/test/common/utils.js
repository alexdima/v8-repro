/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/common/paths", "vs/base/common/uri"], function (require, exports, assert, winjs_base_1, errors, paths, uri_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var DeferredTPromise = /** @class */ (function (_super) {
        __extends(DeferredTPromise, _super);
        function DeferredTPromise() {
            var _this = this;
            var captured;
            _this = _super.call(this, function (c, e, p) {
                captured = { c: c, e: e, p: p };
            }, function () { return _this.oncancel(); }) || this;
            _this.canceled = false;
            _this.completeCallback = captured.c;
            _this.errorCallback = captured.e;
            _this.progressCallback = captured.p;
            return _this;
        }
        DeferredTPromise.prototype.complete = function (value) {
            this.completeCallback(value);
        };
        DeferredTPromise.prototype.error = function (err) {
            this.errorCallback(err);
        };
        DeferredTPromise.prototype.progress = function (p) {
            this.progressCallback(p);
        };
        DeferredTPromise.prototype.oncancel = function () {
            this.canceled = true;
        };
        return DeferredTPromise;
    }(winjs_base_1.TPromise));
    exports.DeferredTPromise = DeferredTPromise;
    var DeferredPPromise = /** @class */ (function (_super) {
        __extends(DeferredPPromise, _super);
        function DeferredPPromise(init, oncancel) {
            if (init === void 0) { init = function (c, e, p) { }; }
            var _this = this;
            var captured;
            _this = _super.call(this, function (c, e, p) {
                captured = { c: c, e: e, p: p };
            }, oncancel ? oncancel : function () { return _this.oncancel; }) || this;
            _this.completeCallback = captured.c;
            _this.errorCallback = captured.e;
            _this.progressCallback = captured.p;
            return _this;
        }
        DeferredPPromise.prototype.oncancel = function () {
            this.errorCallback(errors.canceled());
        };
        DeferredPPromise.prototype.complete = function (c) {
            this.completeCallback(c);
        };
        DeferredPPromise.prototype.progress = function (p) {
            this.progressCallback(p);
        };
        DeferredPPromise.prototype.error = function (e) {
            this.errorCallback(e);
        };
        return DeferredPPromise;
    }(winjs_base_1.PPromise));
    exports.DeferredPPromise = DeferredPPromise;
    function onError(error, done) {
        assert.fail(error);
        done();
    }
    exports.onError = onError;
    function toResource(path) {
        return uri_1.default.file(paths.join('C:\\', new Buffer(this.test.fullTitle()).toString('base64'), path));
    }
    exports.toResource = toResource;
});
