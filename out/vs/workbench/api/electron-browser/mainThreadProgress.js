var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/progress/common/progress", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, progress_1, extHost_protocol_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadProgress = /** @class */ (function () {
        function MainThreadProgress(extHostContext, progressService) {
            this._progress = new Map();
            this._progressService = progressService;
        }
        MainThreadProgress.prototype.dispose = function () {
            this._progress.forEach(function (handle) { return handle.resolve(); });
            this._progress.clear();
        };
        MainThreadProgress.prototype.$startProgress = function (handle, options) {
            var task = this._createTask(handle);
            this._progressService.withProgress(options, task);
        };
        MainThreadProgress.prototype.$progressReport = function (handle, message) {
            if (this._progress.has(handle)) {
                this._progress.get(handle).progress.report(message);
            }
        };
        MainThreadProgress.prototype.$progressEnd = function (handle) {
            if (this._progress.has(handle)) {
                this._progress.get(handle).resolve();
                this._progress.delete(handle);
            }
        };
        MainThreadProgress.prototype._createTask = function (handle) {
            var _this = this;
            return function (progress) {
                return new Promise(function (resolve) {
                    _this._progress.set(handle, { resolve: resolve, progress: progress });
                });
            };
        };
        MainThreadProgress = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadProgress),
            __param(1, progress_1.IProgressService2)
        ], MainThreadProgress);
        return MainThreadProgress;
    }());
    exports.MainThreadProgress = MainThreadProgress;
});
