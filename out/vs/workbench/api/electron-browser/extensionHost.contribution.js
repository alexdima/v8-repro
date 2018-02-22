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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/common/lifecycle", "vs/platform/jsonschemas/common/jsonValidationExtensionPoint", "vs/platform/theme/common/colorExtensionPoint", "vs/workbench/parts/codeEditor/electron-browser/languageConfiguration/languageConfigurationExtensionPoint", "./mainThreadCommands", "./mainThreadConfiguration", "./mainThreadDebugService", "./mainThreadDecorations", "./mainThreadDiagnostics", "./mainThreadDialogs", "./mainThreadDocumentContentProviders", "./mainThreadDocuments", "./mainThreadDocumentsAndEditors", "./mainThreadEditor", "./mainThreadEditors", "./mainThreadErrors", "./mainThreadExtensionService", "./mainThreadFileSystem", "./mainThreadFileSystemEventService", "./mainThreadHeapService", "./mainThreadLanguageFeatures", "./mainThreadLanguages", "./mainThreadMessageService", "./mainThreadOutputService", "./mainThreadProgress", "./mainThreadQuickOpen", "./mainThreadSCM", "./mainThreadSaveParticipant", "./mainThreadStatusBar", "./mainThreadStorage", "./mainThreadTask", "./mainThreadTelemetry", "./mainThreadTerminalService", "./mainThreadTreeViews", "./mainThreadLogService", "./mainThreadWebview", "./mainThreadWindow", "./mainThreadWorkspace"], function (require, exports, contributions_1, platform_1, instantiation_1, lifecycle_1, jsonValidationExtensionPoint_1, colorExtensionPoint_1, languageConfigurationExtensionPoint_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtensionPoints = /** @class */ (function () {
        function ExtensionPoints(instantiationService) {
            this.instantiationService = instantiationService;
            // Classes that handle extension points...
            this.instantiationService.createInstance(jsonValidationExtensionPoint_1.JSONValidationExtensionPoint);
            this.instantiationService.createInstance(colorExtensionPoint_1.ColorExtensionPoint);
            this.instantiationService.createInstance(languageConfigurationExtensionPoint_1.LanguageConfigurationFileHandler);
        }
        ExtensionPoints = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], ExtensionPoints);
        return ExtensionPoints;
    }());
    exports.ExtensionPoints = ExtensionPoints;
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ExtensionPoints, lifecycle_1.LifecyclePhase.Starting);
});
