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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/base/common/platform", "vs/editor/common/services/modelService", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/message/common/message", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/node/package", "vs/platform/node/product", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, nls, winjs_base_1, actions_1, platform_1, modelService_1, contributions_1, platform_2, message_1, instantiation_1, telemetry_1, files_1, storage_1, package_1, product_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var LanguageSurvey = /** @class */ (function () {
        function LanguageSurvey(data, instantiationService, storageService, messageService, telemetryService, fileService, modelService) {
            var SESSION_COUNT_KEY = data.surveyId + ".sessionCount";
            var LAST_SESSION_DATE_KEY = data.surveyId + ".lastSessionDate";
            var SKIP_VERSION_KEY = data.surveyId + ".skipVersion";
            var IS_CANDIDATE_KEY = data.surveyId + ".isCandidate";
            var EDITED_LANGUAGE_COUNT_KEY = data.surveyId + ".editedCount";
            var EDITED_LANGUAGE_DATE_KEY = data.surveyId + ".editedDate";
            var skipVersion = storageService.get(SKIP_VERSION_KEY, storage_1.StorageScope.GLOBAL, '');
            if (skipVersion) {
                return;
            }
            var date = new Date().toDateString();
            if (storageService.getInteger(EDITED_LANGUAGE_COUNT_KEY, storage_1.StorageScope.GLOBAL, 0) < data.editCount) {
                fileService.onFileChanges(function (e) {
                    e.getUpdated().forEach(function (event) {
                        if (event.type === files_1.FileChangeType.UPDATED) {
                            var model = modelService.getModel(event.resource);
                            if (model && model.getModeId() === data.languageId && date !== storageService.get(EDITED_LANGUAGE_DATE_KEY, storage_1.StorageScope.GLOBAL)) {
                                var editedCount = storageService.getInteger(EDITED_LANGUAGE_COUNT_KEY, storage_1.StorageScope.GLOBAL, 0) + 1;
                                storageService.store(EDITED_LANGUAGE_COUNT_KEY, editedCount, storage_1.StorageScope.GLOBAL);
                                storageService.store(EDITED_LANGUAGE_DATE_KEY, date, storage_1.StorageScope.GLOBAL);
                            }
                        }
                    });
                });
            }
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
            if (storageService.getInteger(EDITED_LANGUAGE_COUNT_KEY, storage_1.StorageScope.GLOBAL, 0) < data.editCount) {
                return;
            }
            var isCandidate = storageService.getBoolean(IS_CANDIDATE_KEY, storage_1.StorageScope.GLOBAL, false)
                || Math.random() < data.userProbability;
            storageService.store(IS_CANDIDATE_KEY, isCandidate, storage_1.StorageScope.GLOBAL);
            if (!isCandidate) {
                storageService.store(SKIP_VERSION_KEY, package_1.default.version, storage_1.StorageScope.GLOBAL);
                return;
            }
            var message = nls.localize('helpUs', "Help us improve our support for {0}", data.languageId);
            var takeSurveyAction = new actions_1.Action('takeSurvey', nls.localize('takeShortSurvey', "Take Short Survey"), '', true, function () {
                // __GDPR__TODO__ Need to move away from dynamic event names as those cannot be registered statically
                telemetryService.publicLog(data.surveyId + ".survey/takeShortSurvey");
                return telemetryService.getTelemetryInfo().then(function (info) {
                    window.open(data.surveyUrl + "?o=" + encodeURIComponent(process.platform) + "&v=" + encodeURIComponent(package_1.default.version) + "&m=" + encodeURIComponent(info.machineId));
                    storageService.store(IS_CANDIDATE_KEY, false, storage_1.StorageScope.GLOBAL);
                    storageService.store(SKIP_VERSION_KEY, package_1.default.version, storage_1.StorageScope.GLOBAL);
                });
            });
            var remindMeLaterAction = new actions_1.Action('later', nls.localize('remindLater', "Remind Me later"), '', true, function () {
                // __GDPR__TODO__ Need to move away from dynamic event names as those cannot be registered statically
                telemetryService.publicLog(data.surveyId + ".survey/remindMeLater");
                storageService.store(SESSION_COUNT_KEY, sessionCount - 3, storage_1.StorageScope.GLOBAL);
                return winjs_base_1.TPromise.as(null);
            });
            var neverAgainAction = new actions_1.Action('never', nls.localize('neverAgain', "Don't Show Again"), '', true, function () {
                // __GDPR__TODO__ Need to move away from dynamic event names as those cannot be registered statically
                telemetryService.publicLog(data.surveyId + ".survey/dontShowAgain");
                storageService.store(IS_CANDIDATE_KEY, false, storage_1.StorageScope.GLOBAL);
                storageService.store(SKIP_VERSION_KEY, package_1.default.version, storage_1.StorageScope.GLOBAL);
                return winjs_base_1.TPromise.as(null);
            });
            var actions = [neverAgainAction, remindMeLaterAction, takeSurveyAction];
            // __GDPR__TODO__ Need to move away from dynamic event names as those cannot be registered statically
            telemetryService.publicLog(data.surveyId + ".survey/userAsked");
            messageService.show(message_1.Severity.Info, { message: message, actions: actions });
        }
        return LanguageSurvey;
    }());
    var LanguageSurveysContribution = /** @class */ (function () {
        function LanguageSurveysContribution(instantiationService, storageService, messageService, telemetryService, fileService, modelService) {
            product_1.default.surveys.filter(function (surveyData) { return surveyData.surveyId && surveyData.editCount && surveyData.languageId && surveyData.surveyUrl && surveyData.userProbability; }).map(function (surveyData) {
                return new LanguageSurvey(surveyData, instantiationService, storageService, messageService, telemetryService, fileService, modelService);
            });
        }
        LanguageSurveysContribution = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, storage_1.IStorageService),
            __param(2, message_1.IMessageService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, files_1.IFileService),
            __param(5, modelService_1.IModelService)
        ], LanguageSurveysContribution);
        return LanguageSurveysContribution;
    }());
    if (platform_1.language === 'en' && product_1.default.surveys && product_1.default.surveys.length) {
        var workbenchRegistry = platform_2.Registry.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(LanguageSurveysContribution, lifecycle_1.LifecyclePhase.Running);
    }
});
