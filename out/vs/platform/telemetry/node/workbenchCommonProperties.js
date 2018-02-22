/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uuid", "../node/commonProperties"], function (require, exports, uuid, commonProperties_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function resolveWorkbenchCommonProperties(storageService, commit, version, machineId, installSourcePath) {
        return commonProperties_1.resolveCommonProperties(commit, version, machineId, installSourcePath).then(function (result) {
            // __GDPR__COMMON__ "common.version.shell" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            result['common.version.shell'] = process.versions && process.versions['electron'];
            // __GDPR__COMMON__ "common.version.renderer" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            result['common.version.renderer'] = process.versions && process.versions['chrome'];
            var lastSessionDate = storageService.get('telemetry.lastSessionDate');
            var firstSessionDate = storageService.get('telemetry.firstSessionDate') || new Date().toUTCString();
            storageService.store('telemetry.firstSessionDate', firstSessionDate);
            storageService.store('telemetry.lastSessionDate', new Date().toUTCString());
            // __GDPR__COMMON__ "common.firstSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            result['common.firstSessionDate'] = firstSessionDate;
            // __GDPR__COMMON__ "common.lastSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            result['common.lastSessionDate'] = lastSessionDate;
            // __GDPR__COMMON__ "common.isNewSession" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            result['common.isNewSession'] = !lastSessionDate ? '1' : '0';
            // __GDPR__COMMON__ "common.instanceId" : { "classification": "EndUserPseudonymizedInformation", "purpose": "FeatureInsight" }
            result['common.instanceId'] = getOrCreateInstanceId(storageService);
            return result;
        });
    }
    exports.resolveWorkbenchCommonProperties = resolveWorkbenchCommonProperties;
    function getOrCreateInstanceId(storageService) {
        var result = storageService.get('telemetry.instanceId') || uuid.generateUuid();
        storageService.store('telemetry.instanceId', result);
        return result;
    }
});
