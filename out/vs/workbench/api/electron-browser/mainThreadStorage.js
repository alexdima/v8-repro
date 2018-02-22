var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/platform/storage/common/storage", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, winjs_base_1, storage_1, extHost_protocol_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadStorage = /** @class */ (function () {
        function MainThreadStorage(extHostContext, storageService) {
            this._storageService = storageService;
        }
        MainThreadStorage.prototype.dispose = function () {
        };
        MainThreadStorage.prototype.$getValue = function (shared, key) {
            var jsonValue = this._storageService.get(key, shared ? storage_1.StorageScope.GLOBAL : storage_1.StorageScope.WORKSPACE);
            if (!jsonValue) {
                return winjs_base_1.TPromise.as(undefined);
            }
            var value;
            try {
                value = JSON.parse(jsonValue);
                return winjs_base_1.TPromise.as(value);
            }
            catch (err) {
                return winjs_base_1.TPromise.wrapError(err);
            }
        };
        MainThreadStorage.prototype.$setValue = function (shared, key, value) {
            var jsonValue;
            try {
                jsonValue = JSON.stringify(value);
                this._storageService.store(key, jsonValue, shared ? storage_1.StorageScope.GLOBAL : storage_1.StorageScope.WORKSPACE);
            }
            catch (err) {
                return winjs_base_1.TPromise.wrapError(err);
            }
            return undefined;
        };
        MainThreadStorage = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadStorage),
            __param(1, storage_1.IStorageService)
        ], MainThreadStorage);
        return MainThreadStorage;
    }());
    exports.MainThreadStorage = MainThreadStorage;
});
