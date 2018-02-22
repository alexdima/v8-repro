var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/markers/common/markers", "vs/base/common/uri", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, markers_1, uri_1, extHost_protocol_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadDiagnostics = /** @class */ (function () {
        function MainThreadDiagnostics(extHostContext, markerService) {
            this._activeOwners = new Set();
            this._markerService = markerService;
        }
        MainThreadDiagnostics.prototype.dispose = function () {
            var _this = this;
            this._activeOwners.forEach(function (owner) { return _this._markerService.changeAll(owner, undefined); });
        };
        MainThreadDiagnostics.prototype.$changeMany = function (owner, entries) {
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                var uri = entry[0], markers = entry[1];
                this._markerService.changeOne(owner, uri_1.default.revive(uri), markers);
            }
            this._activeOwners.add(owner);
        };
        MainThreadDiagnostics.prototype.$clear = function (owner) {
            this._markerService.changeAll(owner, undefined);
            this._activeOwners.delete(owner);
        };
        MainThreadDiagnostics = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadDiagnostics),
            __param(1, markers_1.IMarkerService)
        ], MainThreadDiagnostics);
        return MainThreadDiagnostics;
    }());
    exports.MainThreadDiagnostics = MainThreadDiagnostics;
});
