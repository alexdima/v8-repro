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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/editor/common/core/position", "vs/editor/common/services/modeService", "vs/editor/common/services/modelService"], function (require, exports, event_1, lifecycle_1, configuration_1, position_1, modeService_1, modelService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextResourceConfigurationService = /** @class */ (function (_super) {
        __extends(TextResourceConfigurationService, _super);
        function TextResourceConfigurationService(configurationService, modelService, modeService) {
            var _this = _super.call(this) || this;
            _this.configurationService = configurationService;
            _this.modelService = modelService;
            _this.modeService = modeService;
            _this._onDidChangeConfiguration = _this._register(new event_1.Emitter());
            _this.onDidChangeConfiguration = _this._onDidChangeConfiguration.event;
            _this._register(_this.configurationService.onDidChangeConfiguration(function (e) { return _this._onDidChangeConfiguration.fire(e); }));
            return _this;
        }
        TextResourceConfigurationService.prototype.getValue = function (resource, arg2, arg3) {
            var position = position_1.Position.isIPosition(arg2) ? arg2 : null;
            var section = position ? (typeof arg3 === 'string' ? arg3 : void 0) : (typeof arg2 === 'string' ? arg2 : void 0);
            var language = resource ? this.getLanguage(resource, position) : void 0;
            return this.configurationService.getValue(section, { resource: resource, overrideIdentifier: language });
        };
        TextResourceConfigurationService.prototype.getLanguage = function (resource, position) {
            var model = this.modelService.getModel(resource);
            if (model) {
                return position ? this.modeService.getLanguageIdentifier(model.getLanguageIdAtPosition(position.lineNumber, position.column)).language : model.getLanguageIdentifier().language;
            }
            return this.modeService.getModeIdByFilenameOrFirstLine(resource.fsPath);
        };
        TextResourceConfigurationService = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, modelService_1.IModelService),
            __param(2, modeService_1.IModeService)
        ], TextResourceConfigurationService);
        return TextResourceConfigurationService;
    }(lifecycle_1.Disposable));
    exports.TextResourceConfigurationService = TextResourceConfigurationService;
});
