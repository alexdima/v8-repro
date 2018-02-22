var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/telemetry/common/telemetry", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, telemetry_1, extHost_protocol_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadTelemetry = /** @class */ (function () {
        function MainThreadTelemetry(extHostContext, _telemetryService) {
            this._telemetryService = _telemetryService;
            //
        }
        MainThreadTelemetry_1 = MainThreadTelemetry;
        MainThreadTelemetry.prototype.dispose = function () {
            //
        };
        MainThreadTelemetry.prototype.$publicLog = function (eventName, data) {
            if (data === void 0) { data = Object.create(null); }
            // __GDPR__COMMON__ "pluginHostTelemetry" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            data[MainThreadTelemetry_1._name] = true;
            this._telemetryService.publicLog(eventName, data);
        };
        MainThreadTelemetry._name = 'pluginHostTelemetry';
        MainThreadTelemetry = MainThreadTelemetry_1 = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadTelemetry),
            __param(1, telemetry_1.ITelemetryService)
        ], MainThreadTelemetry);
        return MainThreadTelemetry;
        var MainThreadTelemetry_1;
    }());
    exports.MainThreadTelemetry = MainThreadTelemetry;
});
