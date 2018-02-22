/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/base/common/platform", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/message/common/message", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/platform/node/package", "vs/platform/node/product", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, nls, winjs_base_1, actions_1, platform_1, contributions_1, platform_2, message_1, instantiation_1, telemetry_1, storage_1, package_1, product_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var PROBABILITY = 0.15;
    var SESSION_COUNT_KEY = 'nps/sessionCount';
    var LAST_SESSION_DATE_KEY = 'nps/lastSessionDate';
    var SKIP_VERSION_KEY = 'nps/skipVersion';
    var IS_CANDIDATE_KEY = 'nps/isCandidate';
    var NPSContribution = /** @class */ (function () {
        function NPSContribution(instantiationService, storageService, messageService, telemetryService) {
            var skipVersion = storageService.get(SKIP_VERSION_KEY, storage_1.StorageScope.GLOBAL, '');
            if (skipVersion) {
                return;
            }
            var date = new Date().toDateString();
            var lastSessionDate = storageService.get(LAST_SESSION_DATE_KEY, storage_1.StorageScope.GLOBAL, new Date(0).toDateString());
            if (date === lastSessionDate) {
                return;
            }
            var sessionCount = storageService.getInteger(SESSION_COUNT_KEY, storage_1.StorageScope.GLOBAL, 0) + 1;
            storageService.store(LAST_SESSION_DATE_KEY, date, storage_1.StorageScope.GLOBAL);
            storageService.store(SESSION_COUNT_KEY, sessionCount, storage_1.StorageScope.GLOBAL);
            if (sessionCount < 9) {
                return;
            }
            var isCandidate = storageService.getBoolean(IS_CANDIDATE_KEY, storage_1.StorageScope.GLOBAL, false)
                || Math.random() < PROBABILITY;
            storageService.store(IS_CANDIDATE_KEY, isCandidate, storage_1.StorageScope.GLOBAL);
            if (!isCandidate) {
                storageService.store(SKIP_VERSION_KEY, package_1.default.version, storage_1.StorageScope.GLOBAL);
                return;
            }
            var message = nls.localize('surveyQuestion', "Do you mind taking a quick feedback survey?");
            var takeSurveyAction = new actions_1.Action('nps.takeSurvey', nls.localize('takeSurvey', "Take Survey"), '', true, function () {
                return telemetryService.getTelemetryInfo().then(function (info) {
                    window.open(product_1.default.npsSurveyUrl + "?o=" + encodeURIComponent(process.platform) + "&v=" + encodeURIComponent(package_1.default.version) + "&m=" + encodeURIComponent(info.machineId));
                    storageService.store(IS_CANDIDATE_KEY, false, storage_1.StorageScope.GLOBAL);
                    storageService.store(SKIP_VERSION_KEY, package_1.default.version, storage_1.StorageScope.GLOBAL);
                });
            });
            var remindMeLaterAction = new actions_1.Action('nps.later', nls.localize('remindLater', "Remind Me later"), '', true, function () {
                storageService.store(SESSION_COUNT_KEY, sessionCount - 3, storage_1.StorageScope.GLOBAL);
                return winjs_base_1.TPromise.as(null);
            });
            var neverAgainAction = new actions_1.Action('nps.never', nls.localize('neverAgain', "Don't Show Again"), '', true, function () {
                storageService.store(IS_CANDIDATE_KEY, false, storage_1.StorageScope.GLOBAL);
                storageService.store(SKIP_VERSION_KEY, package_1.default.version, storage_1.StorageScope.GLOBAL);
                return winjs_base_1.TPromise.as(null);
            });
            var actions = [neverAgainAction, remindMeLaterAction, takeSurveyAction];
            messageService.show(message_1.Severity.Info, { message: message, actions: actions });
        }
        NPSContribution = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, storage_1.IStorageService),
            __param(2, message_1.IMessageService),
            __param(3, telemetry_1.ITelemetryService)
        ], NPSContribution);
        return NPSContribution;
    }());
    if (platform_1.language === 'en' && product_1.default.npsSurveyUrl) {
        var workbenchRegistry = platform_2.Registry.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(NPSContribution, lifecycle_1.LifecyclePhase.Running);
    }
});
