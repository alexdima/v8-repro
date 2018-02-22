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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/types", "vs/workbench/common/editor/resourceEditorInput", "vs/workbench/common/editor/textEditorModel", "vs/workbench/common/editor/untitledEditorInput", "vs/workbench/browser/parts/editor/textEditor", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/resourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/services/group/common/groupService", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/event"], function (require, exports, winjs_base_1, nls, types, resourceEditorInput_1, textEditorModel_1, untitledEditorInput_1, textEditor_1, telemetry_1, storage_1, resourceConfiguration_1, instantiation_1, themeService_1, groupService_1, textfiles_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An editor implementation that is capable of showing the contents of resource inputs. Uses
     * the TextEditor widget to show the contents.
     */
    var AbstractTextResourceEditor = /** @class */ (function (_super) {
        __extends(AbstractTextResourceEditor, _super);
        function AbstractTextResourceEditor(id, telemetryService, instantiationService, storageService, configurationService, themeService, editorGroupService, textFileService) {
            return _super.call(this, id, telemetryService, instantiationService, storageService, configurationService, themeService, textFileService, editorGroupService) || this;
        }
        AbstractTextResourceEditor.prototype.getTitle = function () {
            if (this.input) {
                return this.input.getName();
            }
            return nls.localize('textEditor', "Text Editor");
        };
        AbstractTextResourceEditor.prototype.setInput = function (input, options) {
            var _this = this;
            // Return early for same input unless we force to open
            var forceOpen = options && options.forceOpen;
            if (!forceOpen && input.matches(this.input)) {
                // Still apply options if any (avoiding instanceof here for a reason, do not change!)
                var textOptions = options;
                if (textOptions && types.isFunction(textOptions.apply)) {
                    textOptions.apply(this.getControl(), 0 /* Smooth */);
                }
                return winjs_base_1.TPromise.wrap(null);
            }
            // Remember view settings if input changes
            this.saveTextEditorViewStateForInput(this.input);
            // Set input and resolve
            return _super.prototype.setInput.call(this, input, options).then(function () {
                return input.resolve(true).then(function (resolvedModel) {
                    // Assert Model instance
                    if (!(resolvedModel instanceof textEditorModel_1.BaseTextEditorModel)) {
                        return winjs_base_1.TPromise.wrapError(new Error('Unable to open file as text'));
                    }
                    // Assert that the current input is still the one we expect. This prevents a race condition when loading takes long and another input was set meanwhile
                    if (!_this.input || _this.input !== input) {
                        return null;
                    }
                    // Set Editor Model
                    var textEditor = _this.getControl();
                    var textEditorModel = resolvedModel.textEditorModel;
                    textEditor.setModel(textEditorModel);
                    // Apply Options from TextOptions
                    var optionsGotApplied = false;
                    var textOptions = options;
                    if (textOptions && types.isFunction(textOptions.apply)) {
                        optionsGotApplied = textOptions.apply(textEditor, 1 /* Immediate */);
                    }
                    // Otherwise restore View State
                    if (!optionsGotApplied) {
                        _this.restoreViewState(input);
                    }
                    return void 0;
                });
            });
        };
        AbstractTextResourceEditor.prototype.restoreViewState = function (input) {
            if (input instanceof untitledEditorInput_1.UntitledEditorInput || input instanceof resourceEditorInput_1.ResourceEditorInput) {
                var viewState = this.loadTextEditorViewState(input.getResource());
                if (viewState) {
                    this.getControl().restoreViewState(viewState);
                }
            }
        };
        AbstractTextResourceEditor.prototype.getConfigurationOverrides = function () {
            var options = _super.prototype.getConfigurationOverrides.call(this);
            options.readOnly = !(this.input instanceof untitledEditorInput_1.UntitledEditorInput); // all resource editors are readonly except for the untitled one;
            return options;
        };
        AbstractTextResourceEditor.prototype.getAriaLabel = function () {
            var input = this.input;
            var isReadonly = !(this.input instanceof untitledEditorInput_1.UntitledEditorInput);
            var ariaLabel;
            var inputName = input && input.getName();
            if (isReadonly) {
                ariaLabel = inputName ? nls.localize('readonlyEditorWithInputAriaLabel', "{0}. Readonly text editor.", inputName) : nls.localize('readonlyEditorAriaLabel', "Readonly text editor.");
            }
            else {
                ariaLabel = inputName ? nls.localize('untitledFileEditorWithInputAriaLabel', "{0}. Untitled file text editor.", inputName) : nls.localize('untitledFileEditorAriaLabel', "Untitled file text editor.");
            }
            return ariaLabel;
        };
        /**
         * Reveals the last line of this editor if it has a model set.
         */
        AbstractTextResourceEditor.prototype.revealLastLine = function () {
            var codeEditor = this.getControl();
            var model = codeEditor.getModel();
            if (model) {
                var lastLine = model.getLineCount();
                codeEditor.revealPosition({ lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) }, 0 /* Smooth */);
            }
        };
        AbstractTextResourceEditor.prototype.clearInput = function () {
            // Keep editor view state in settings to restore when coming back
            this.saveTextEditorViewStateForInput(this.input);
            // Clear Model
            this.getControl().setModel(null);
            _super.prototype.clearInput.call(this);
        };
        AbstractTextResourceEditor.prototype.shutdown = function () {
            // Save View State (only for untitled)
            if (this.input instanceof untitledEditorInput_1.UntitledEditorInput) {
                this.saveTextEditorViewStateForInput(this.input);
            }
            // Call Super
            _super.prototype.shutdown.call(this);
        };
        AbstractTextResourceEditor.prototype.saveTextEditorViewStateForInput = function (input) {
            var _this = this;
            if (!(input instanceof untitledEditorInput_1.UntitledEditorInput) && !(input instanceof resourceEditorInput_1.ResourceEditorInput)) {
                return; // only enabled for untitled and resource inputs
            }
            var resource = input.getResource();
            // Clear view state if input is disposed
            if (input.isDisposed()) {
                _super.prototype.clearTextEditorViewState.call(this, [resource]);
            }
            else {
                _super.prototype.saveTextEditorViewState.call(this, resource);
                // Make sure to clean up when the input gets disposed
                event_1.once(input.onDispose)(function () {
                    _super.prototype.clearTextEditorViewState.call(_this, [resource]);
                });
            }
        };
        AbstractTextResourceEditor = __decorate([
            __param(1, telemetry_1.ITelemetryService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, storage_1.IStorageService),
            __param(4, resourceConfiguration_1.ITextResourceConfigurationService),
            __param(5, themeService_1.IThemeService),
            __param(6, groupService_1.IEditorGroupService),
            __param(7, textfiles_1.ITextFileService)
        ], AbstractTextResourceEditor);
        return AbstractTextResourceEditor;
    }(textEditor_1.BaseTextEditor));
    exports.AbstractTextResourceEditor = AbstractTextResourceEditor;
    var TextResourceEditor = /** @class */ (function (_super) {
        __extends(TextResourceEditor, _super);
        function TextResourceEditor(telemetryService, instantiationService, storageService, configurationService, themeService, editorGroupService, textFileService) {
            return _super.call(this, TextResourceEditor.ID, telemetryService, instantiationService, storageService, configurationService, themeService, editorGroupService, textFileService) || this;
        }
        TextResourceEditor.ID = 'workbench.editors.textResourceEditor';
        TextResourceEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, storage_1.IStorageService),
            __param(3, resourceConfiguration_1.ITextResourceConfigurationService),
            __param(4, themeService_1.IThemeService),
            __param(5, groupService_1.IEditorGroupService),
            __param(6, textfiles_1.ITextFileService)
        ], TextResourceEditor);
        return TextResourceEditor;
    }(AbstractTextResourceEditor));
    exports.TextResourceEditor = TextResourceEditor;
});
