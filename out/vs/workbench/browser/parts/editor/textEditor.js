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
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/errors", "vs/base/browser/dom", "vs/editor/browser/codeEditor", "vs/workbench/browser/parts/editor/baseEditor", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/common/memento", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/services/resourceConfiguration", "vs/workbench/services/group/common/groupService", "vs/editor/browser/editorBrowser"], function (require, exports, nls, objects, types, errors, DOM, codeEditor_1, baseEditor_1, storage_1, instantiation_1, telemetry_1, themeService_1, memento_1, codeEditorService_1, textfiles_1, resourceConfiguration_1, groupService_1, editorBrowser_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TEXT_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'textEditorViewState';
    /**
     * The base class of editors that leverage the text editor for the editing experience. This class is only intended to
     * be subclassed and not instantiated.
     */
    var BaseTextEditor = /** @class */ (function (_super) {
        __extends(BaseTextEditor, _super);
        function BaseTextEditor(id, telemetryService, _instantiationService, storageService, _configurationService, themeService, _textFileService, editorGroupService) {
            var _this = _super.call(this, id, telemetryService, themeService) || this;
            _this._instantiationService = _instantiationService;
            _this.storageService = storageService;
            _this._configurationService = _configurationService;
            _this.themeService = themeService;
            _this._textFileService = _textFileService;
            _this.editorGroupService = editorGroupService;
            _this.toUnbind.push(_this.configurationService.onDidChangeConfiguration(function (e) { return _this.handleConfigurationChangeEvent(_this.configurationService.getValue(_this.getResource())); }));
            return _this;
        }
        Object.defineProperty(BaseTextEditor.prototype, "instantiationService", {
            get: function () {
                return this._instantiationService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseTextEditor.prototype, "configurationService", {
            get: function () {
                return this._configurationService;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseTextEditor.prototype, "textFileService", {
            get: function () {
                return this._textFileService;
            },
            enumerable: true,
            configurable: true
        });
        BaseTextEditor.prototype.handleConfigurationChangeEvent = function (configuration) {
            if (this.isVisible()) {
                this.updateEditorConfiguration(configuration);
            }
            else {
                this.hasPendingConfigurationChange = true;
            }
        };
        BaseTextEditor.prototype.consumePendingConfigurationChangeEvent = function () {
            if (this.hasPendingConfigurationChange) {
                this.updateEditorConfiguration();
                this.hasPendingConfigurationChange = false;
            }
        };
        BaseTextEditor.prototype.computeConfiguration = function (configuration) {
            // Specific editor options always overwrite user configuration
            var editorConfiguration = types.isObject(configuration.editor) ? objects.deepClone(configuration.editor) : Object.create(null);
            objects.assign(editorConfiguration, this.getConfigurationOverrides());
            // ARIA label
            editorConfiguration.ariaLabel = this.computeAriaLabel();
            return editorConfiguration;
        };
        BaseTextEditor.prototype.computeAriaLabel = function () {
            var ariaLabel = this.getAriaLabel();
            // Apply group information to help identify in which group we are
            if (ariaLabel && typeof this.position === 'number') {
                ariaLabel = nls.localize('editorLabelWithGroup', "{0}, Group {1}.", ariaLabel, this.position + 1);
            }
            return ariaLabel;
        };
        BaseTextEditor.prototype.getConfigurationOverrides = function () {
            var overrides = {};
            objects.assign(overrides, {
                overviewRulerLanes: 3,
                lineNumbersMinChars: 3,
                fixedOverflowWidgets: true
            });
            return overrides;
        };
        BaseTextEditor.prototype.createEditor = function (parent) {
            var _this = this;
            // Editor for Text
            this._editorContainer = parent;
            this.editorControl = this.createEditorControl(parent, this.computeConfiguration(this.configurationService.getValue(this.getResource())));
            // Model & Language changes
            var codeEditor = codeEditorService_1.getCodeEditor(this);
            if (codeEditor) {
                this.toUnbind.push(codeEditor.onDidChangeModelLanguage(function (e) { return _this.updateEditorConfiguration(); }));
                this.toUnbind.push(codeEditor.onDidChangeModel(function (e) { return _this.updateEditorConfiguration(); }));
            }
            // Application & Editor focus change to respect auto save settings
            if (editorBrowser_1.isCodeEditor(this.editorControl)) {
                this.toUnbind.push(this.editorControl.onDidBlurEditor(function () { return _this.onEditorFocusLost(); }));
            }
            else if (editorBrowser_1.isDiffEditor(this.editorControl)) {
                this.toUnbind.push(this.editorControl.getOriginalEditor().onDidBlurEditor(function () { return _this.onEditorFocusLost(); }));
                this.toUnbind.push(this.editorControl.getModifiedEditor().onDidBlurEditor(function () { return _this.onEditorFocusLost(); }));
            }
            this.toUnbind.push(this.editorGroupService.onEditorsChanged(function () { return _this.onEditorFocusLost(); }));
            this.toUnbind.push(DOM.addDisposableListener(window, DOM.EventType.BLUR, function () { return _this.onWindowFocusLost(); }));
        };
        BaseTextEditor.prototype.onEditorFocusLost = function () {
            this.maybeTriggerSaveAll(textfiles_1.SaveReason.FOCUS_CHANGE);
        };
        BaseTextEditor.prototype.onWindowFocusLost = function () {
            this.maybeTriggerSaveAll(textfiles_1.SaveReason.WINDOW_CHANGE);
        };
        BaseTextEditor.prototype.maybeTriggerSaveAll = function (reason) {
            var mode = this.textFileService.getAutoSaveMode();
            // Determine if we need to save all. In case of a window focus change we also save if auto save mode
            // is configured to be ON_FOCUS_CHANGE (editor focus change)
            if ((reason === textfiles_1.SaveReason.WINDOW_CHANGE && (mode === textfiles_1.AutoSaveMode.ON_FOCUS_CHANGE || mode === textfiles_1.AutoSaveMode.ON_WINDOW_CHANGE)) ||
                (reason === textfiles_1.SaveReason.FOCUS_CHANGE && mode === textfiles_1.AutoSaveMode.ON_FOCUS_CHANGE)) {
                if (this.textFileService.isDirty()) {
                    this.textFileService.saveAll(void 0, { reason: reason }).done(null, errors.onUnexpectedError);
                }
            }
        };
        /**
         * This method creates and returns the text editor control to be used. Subclasses can override to
         * provide their own editor control that should be used (e.g. a DiffEditor).
         *
         * The passed in configuration object should be passed to the editor control when creating it.
         */
        BaseTextEditor.prototype.createEditorControl = function (parent, configuration) {
            // Use a getter for the instantiation service since some subclasses might use scoped instantiation services
            return this.instantiationService.createInstance(codeEditor_1.CodeEditor, parent.getHTMLElement(), configuration);
        };
        BaseTextEditor.prototype.setInput = function (input, options) {
            var _this = this;
            return _super.prototype.setInput.call(this, input, options).then(function () {
                // Update editor options after having set the input. We do this because there can be
                // editor input specific options (e.g. an ARIA label depending on the input showing)
                _this.updateEditorConfiguration();
                _this._editorContainer.getHTMLElement().setAttribute('aria-label', _this.computeAriaLabel());
            });
        };
        BaseTextEditor.prototype.changePosition = function (position) {
            _super.prototype.changePosition.call(this, position);
            // Make sure to update ARIA label if the position of this editor changed
            if (this.editorControl) {
                this.editorControl.updateOptions({ ariaLabel: this.computeAriaLabel() });
            }
        };
        BaseTextEditor.prototype.setEditorVisible = function (visible, position) {
            if (position === void 0) { position = null; }
            // Pass on to Editor
            if (visible) {
                this.consumePendingConfigurationChangeEvent();
                this.editorControl.onVisible();
            }
            else {
                this.editorControl.onHide();
            }
            _super.prototype.setEditorVisible.call(this, visible, position);
        };
        BaseTextEditor.prototype.focus = function () {
            this.editorControl.focus();
        };
        BaseTextEditor.prototype.layout = function (dimension) {
            // Pass on to Editor
            this.editorControl.layout(dimension);
        };
        BaseTextEditor.prototype.getControl = function () {
            return this.editorControl;
        };
        /**
         * Saves the text editor view state for the given resource.
         */
        BaseTextEditor.prototype.saveTextEditorViewState = function (resource) {
            var editor = codeEditorService_1.getCodeOrDiffEditor(this).codeEditor;
            if (!editor) {
                return; // not supported for diff editors
            }
            var model = editor.getModel();
            if (!model) {
                return; // view state always needs a model
            }
            var modelUri = model.uri;
            if (!modelUri) {
                return; // model URI is needed to make sure we save the view state correctly
            }
            if (modelUri.toString() !== resource.toString()) {
                return; // prevent saving view state for a model that is not the expected one
            }
            var memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            var textEditorViewStateMemento = memento[TEXT_EDITOR_VIEW_STATE_PREFERENCE_KEY];
            if (!textEditorViewStateMemento) {
                textEditorViewStateMemento = Object.create(null);
                memento[TEXT_EDITOR_VIEW_STATE_PREFERENCE_KEY] = textEditorViewStateMemento;
            }
            var lastKnownViewState = textEditorViewStateMemento[resource.toString()];
            if (!lastKnownViewState) {
                lastKnownViewState = Object.create(null);
                textEditorViewStateMemento[resource.toString()] = lastKnownViewState;
            }
            if (typeof this.position === 'number') {
                lastKnownViewState[this.position] = editor.saveViewState();
            }
        };
        /**
         * Clears the text editor view state for the given resources.
         */
        BaseTextEditor.prototype.clearTextEditorViewState = function (resources) {
            var memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            var textEditorViewStateMemento = memento[TEXT_EDITOR_VIEW_STATE_PREFERENCE_KEY];
            if (textEditorViewStateMemento) {
                resources.forEach(function (resource) { return delete textEditorViewStateMemento[resource.toString()]; });
            }
        };
        /**
         * Loads the text editor view state for the given resource and returns it.
         */
        BaseTextEditor.prototype.loadTextEditorViewState = function (resource) {
            var memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            var textEditorViewStateMemento = memento[TEXT_EDITOR_VIEW_STATE_PREFERENCE_KEY];
            if (textEditorViewStateMemento) {
                var viewState = textEditorViewStateMemento[resource.toString()];
                if (viewState) {
                    return viewState[this.position];
                }
            }
            return null;
        };
        BaseTextEditor.prototype.updateEditorConfiguration = function (configuration) {
            if (configuration === void 0) { configuration = this.configurationService.getValue(this.getResource()); }
            if (!this.editorControl) {
                return;
            }
            var editorConfiguration = this.computeConfiguration(configuration);
            // Try to figure out the actual editor options that changed from the last time we updated the editor.
            // We do this so that we are not overwriting some dynamic editor settings (e.g. word wrap) that might
            // have been applied to the editor directly.
            var editorSettingsToApply = editorConfiguration;
            if (this.lastAppliedEditorOptions) {
                editorSettingsToApply = objects.distinct(this.lastAppliedEditorOptions, editorSettingsToApply);
            }
            if (Object.keys(editorSettingsToApply).length > 0) {
                this.lastAppliedEditorOptions = editorConfiguration;
                this.editorControl.updateOptions(editorSettingsToApply);
            }
        };
        BaseTextEditor.prototype.getResource = function () {
            var codeEditor = codeEditorService_1.getCodeEditor(this);
            if (codeEditor) {
                var model = codeEditor.getModel();
                if (model) {
                    return model.uri;
                }
            }
            if (this.input) {
                return this.input.getResource();
            }
            return null;
        };
        BaseTextEditor.prototype.dispose = function () {
            this.lastAppliedEditorOptions = void 0;
            this.editorControl.dispose();
            _super.prototype.dispose.call(this);
        };
        BaseTextEditor = __decorate([
            __param(1, telemetry_1.ITelemetryService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, storage_1.IStorageService),
            __param(4, resourceConfiguration_1.ITextResourceConfigurationService),
            __param(5, themeService_1.IThemeService),
            __param(6, textfiles_1.ITextFileService),
            __param(7, groupService_1.IEditorGroupService)
        ], BaseTextEditor);
        return BaseTextEditor;
    }(baseEditor_1.BaseEditor));
    exports.BaseTextEditor = BaseTextEditor;
});
