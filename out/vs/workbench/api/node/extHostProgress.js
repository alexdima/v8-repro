define(["require", "exports", "./extHostTypeConverters"], function (require, exports, extHostTypeConverters_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostProgress = /** @class */ (function () {
        function ExtHostProgress(proxy) {
            this._handles = 0;
            this._proxy = proxy;
        }
        ExtHostProgress.prototype.withProgress = function (extension, options, task) {
            var handle = this._handles++;
            var title = options.title, location = options.location;
            this._proxy.$startProgress(handle, { location: extHostTypeConverters_1.ProgressLocation.from(location), title: title, tooltip: extension.name });
            return this._withProgress(handle, task);
        };
        ExtHostProgress.prototype._withProgress = function (handle, task) {
            var _this = this;
            var progress = {
                report: function (p) {
                    _this._proxy.$progressReport(handle, p);
                }
            };
            var p;
            try {
                p = task(progress, null);
            }
            catch (err) {
                this._proxy.$progressEnd(handle);
                throw err;
            }
            p.then(function (result) { return _this._proxy.$progressEnd(handle); }, function (err) { return _this._proxy.$progressEnd(handle); });
            return p;
        };
        return ExtHostProgress;
    }());
    exports.ExtHostProgress = ExtHostProgress;
});
