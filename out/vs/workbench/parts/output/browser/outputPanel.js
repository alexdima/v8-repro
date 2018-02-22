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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/resourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/workbench/parts/output/common/output", "vs/workbench/parts/output/browser/outputActions", "vs/platform/theme/common/themeService", "vs/workbench/services/group/common/groupService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/configuration/common/configuration", "vs/css!./media/output"], function (require, exports, nls, winjs_base_1, telemetry_1, storage_1, resourceConfiguration_1, instantiation_1, serviceCollection_1, contextkey_1, textResourceEditor_1, output_1, outputActions_1, themeService_1, groupService_1, textfiles_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OutputPanel = /** @class */ (function (_super) {
        __extends(OutputPanel, _super);
        function OutputPanel(telemetryService, instantiationService, storageService, baseConfigurationService, textResourceConfigurationService, themeService, outputService, contextKeyService, editorGroupService, textFileService) {
            var _this = _super.call(this, output_1.OUTPUT_PANEL_ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, textFileService) || this;
            _this.baseConfigurationService = baseConfigurationService;
            _this.outputService = outputService;
            _this.contextKeyService = contextKeyService;
            _this.scopedInstantiationService = instantiationService;
            return _this;
        }
        OutputPanel.prototype.getId = function () {
            return output_1.OUTPUT_PANEL_ID;
        };
        OutputPanel.prototype.getActions = function () {
            var _this = this;
            if (!this.actions) {
                this.actions = [
                    this.instantiationService.createInstance(outputActions_1.SwitchOutputAction),
                    this.instantiationService.createInstance(outputActions_1.ClearOutputAction, outputActions_1.ClearOutputAction.ID, outputActions_1.ClearOutputAction.LABEL),
                    this.instantiationService.createInstance(outputActions_1.ToggleOutputScrollLockAction, outputActions_1.ToggleOutputScrollLockAction.ID, outputActions_1.ToggleOutputScrollLockAction.LABEL)
                ];
                this.actions.forEach(function (a) {
                    _this.toUnbind.push(a);
                });
            }
            return this.actions;
        };
        OutputPanel.prototype.getActionItem = function (action) {
            if (action.id === outputActions_1.SwitchOutputAction.ID) {
                return this.instantiationService.createInstance(outputActions_1.SwitchOutputActionItem, action);
            }
            return _super.prototype.getActionItem.call(this, action);
        };
        OutputPanel.prototype.getConfigurationOverrides = function () {
            var options = _super.prototype.getConfigurationOverrides.call(this);
            options.wordWrap = 'on'; // all output editors wrap
            options.lineNumbers = 'off'; // all output editors hide line numbers
            options.glyphMargin = false;
            options.lineDecorationsWidth = 20;
            options.rulers = [];
            options.folding = false;
            options.scrollBeyondLastLine = false;
            options.renderLineHighlight = 'none';
            options.minimap = { enabled: false };
            var outputConfig = this.baseConfigurationService.getValue('[Log]');
            if (outputConfig && outputConfig['editor.minimap.enabled']) {
                options.minimap = { enabled: true };
            }
            return options;
        };
        OutputPanel.prototype.getAriaLabel = function () {
            var channel = this.outputService.getActiveChannel();
            return channel ? nls.localize('outputPanelWithInputAriaLabel', "{0}, Output panel", channel.label) : nls.localize('outputPanelAriaLabel', "Output panel");
        };
        OutputPanel.prototype.setInput = function (input, options) {
            var _this = this;
            if (input.matches(this.input)) {
                return winjs_base_1.TPromise.as(null);
            }
            if (this.input) {
                // Dispose previous input (Output panel is not a workbench editor)
                this.input.dispose();
            }
            return _super.prototype.setInput.call(this, input, options).then(function () { return _this.revealLastLine(); });
        };
        OutputPanel.prototype.clearInput = function () {
            if (this.input) {
                // Dispose current input (Output panel is not a workbench editor)
                this.input.dispose();
            }
            _super.prototype.clearInput.call(this);
        };
        OutputPanel.prototype.createEditor = function (parent) {
            // First create the scoped instantation service and only then construct the editor using the scoped service
            var scopedContextKeyService = this.contextKeyService.createScoped(parent.getHTMLElement());
            this.toUnbind.push(scopedContextKeyService);
            this.scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, scopedContextKeyService]));
            _super.prototype.createEditor.call(this, parent);
            output_1.CONTEXT_IN_OUTPUT.bindTo(scopedContextKeyService).set(true);
        };
        Object.defineProperty(OutputPanel.prototype, "instantiationService", {
            get: function () {
                return this.scopedInstantiationService;
            },
            enumerable: true,
            configurable: true
        });
        OutputPanel = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, storage_1.IStorageService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, resourceConfiguration_1.ITextResourceConfigurationService),
            __param(5, themeService_1.IThemeService),
            __param(6, output_1.IOutputService),
            __param(7, contextkey_1.IContextKeyService),
            __param(8, groupService_1.IEditorGroupService),
            __param(9, textfiles_1.ITextFileService)
        ], OutputPanel);
        return OutputPanel;
    }(textResourceEditor_1.AbstractTextResourceEditor));
    exports.OutputPanel = OutputPanel;
});
