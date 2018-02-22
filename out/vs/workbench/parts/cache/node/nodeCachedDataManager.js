var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "path", "vs/platform/telemetry/common/telemetry"], function (require, exports, path_1, telemetry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var NodeCachedDataManager = /** @class */ (function () {
        function NodeCachedDataManager(telemetryService) {
            this._telemetryService = telemetryService;
            this._handleCachedDataInfo();
        }
        NodeCachedDataManager.prototype._handleCachedDataInfo = function () {
            var didRejectCachedData = false;
            var didProduceCachedData = false;
            for (var _i = 0, _a = MonacoEnvironment.onNodeCachedData; _i < _a.length; _i++) {
                var _b = _a[_i], err = _b[0], data = _b[1];
                // build summary
                didRejectCachedData = didRejectCachedData || Boolean(err);
                didProduceCachedData = didProduceCachedData || Boolean(data);
                // log each failure separately
                if (err) {
                    /* __GDPR__
                        "cachedDataError" : {
                            "errorCode" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                            "path": { "classification": "CustomerContent", "purpose": "PerformanceAndHealth" }
                        }
                    */
                    this._telemetryService.publicLog('cachedDataError', {
                        errorCode: err.errorCode,
                        path: path_1.basename(err.path)
                    });
                }
            }
            // log summary
            /* __GDPR__
                "cachedDataInfo" : {
                    "didRequestCachedData" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "didRejectCachedData": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "didProduceCachedData": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
                }
            */
            this._telemetryService.publicLog('cachedDataInfo', {
                didRequestCachedData: Boolean(global.require.getConfig().nodeCachedDataDir),
                didRejectCachedData: didRejectCachedData,
                didProduceCachedData: didProduceCachedData
            });
            global.require.config({ onNodeCachedData: undefined });
            delete MonacoEnvironment.onNodeCachedData;
        };
        NodeCachedDataManager = __decorate([
            __param(0, telemetry_1.ITelemetryService)
        ], NodeCachedDataManager);
        return NodeCachedDataManager;
    }());
    exports.NodeCachedDataManager = NodeCachedDataManager;
});
