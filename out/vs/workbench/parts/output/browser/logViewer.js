/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/paths", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/resourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/platform/theme/common/themeService", "vs/workbench/services/group/common/groupService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor/resourceEditorInput", "vs/editor/common/services/resolverService", "vs/workbench/services/hash/common/hashService", "vs/workbench/parts/output/common/output"], function (require, exports, paths, telemetry_1, storage_1, resourceConfiguration_1, instantiation_1, textResourceEditor_1, themeService_1, groupService_1, textfiles_1, configuration_1, resourceEditorInput_1, resolverService_1, hashService_1, output_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LogViewerInput = /** @class */ (function (_super) {
        __extends(LogViewerInput, _super);
        function LogViewerInput(file, textModelResolverService, hashService) {
            var _this = _super.call(this, paths.basename(file.fsPath), paths.dirname(file.fsPath), file.with({ scheme: output_1.LOG_SCHEME }), textModelResolverService, hashService) || this;
            _this.file = file;
            return _this;
        }
        LogViewerInput.prototype.getTypeId = function () {
            return LogViewerInput.ID;
        };
        LogViewerInput.prototype.getResource = function () {
            return this.file;
        };
        LogViewerInput.ID = 'workbench.editorinputs.output';
        LogViewerInput = __decorate([
            __param(1, resolverService_1.ITextModelService),
            __param(2, hashService_1.IHashService)
        ], LogViewerInput);
        return LogViewerInput;
    }(resourceEditorInput_1.ResourceEditorInput));
    exports.LogViewerInput = LogViewerInput;
    var LogViewer = /** @class */ (function (_super) {
        __extends(LogViewer, _super);
        function LogViewer(telemetryService, instantiationService, storageService, baseConfigurationService, textResourceConfigurationService, themeService, editorGroupService, textFileService) {
            return _super.call(this, LogViewer.LOG_VIEWER_EDITOR_ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, textFileService) || this;
        }
        LogViewer.prototype.getConfigurationOverrides = function () {
            var options = _super.prototype.getConfigurationOverrides.call(this);
            options.wordWrap = 'off'; // all log viewers do not wrap
            options.folding = false;
            options.scrollBeyondLastLine = false;
            return options;
        };
        LogViewer.LOG_VIEWER_EDITOR_ID = 'workbench.editors.logViewer';
        LogViewer = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, storage_1.IStorageService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, resourceConfiguration_1.ITextResourceConfigurationService),
            __param(5, themeService_1.IThemeService),
            __param(6, groupService_1.IEditorGroupService),
            __param(7, textfiles_1.ITextFileService)
        ], LogViewer);
        return LogViewer;
    }(textResourceEditor_1.AbstractTextResourceEditor));
    exports.LogViewer = LogViewer;
});
