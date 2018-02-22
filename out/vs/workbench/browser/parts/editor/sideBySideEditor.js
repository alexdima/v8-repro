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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/browser/dom", "vs/base/browser/builder", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/editor/baseEditor", "vs/base/browser/ui/sash/sash", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/editor"], function (require, exports, winjs_base_1, DOM, builder_1, platform_1, baseEditor_1, sash_1, telemetry_1, instantiation_1, themeService_1, colorRegistry_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SideBySideEditor = /** @class */ (function (_super) {
        __extends(SideBySideEditor, _super);
        function SideBySideEditor(telemetryService, instantiationService, themeService) {
            var _this = _super.call(this, SideBySideEditor.ID, telemetryService, themeService) || this;
            _this.instantiationService = instantiationService;
            return _this;
        }
        SideBySideEditor.prototype.createEditor = function (parent) {
            var parentElement = parent.getHTMLElement();
            DOM.addClass(parentElement, 'side-by-side-editor');
            this.createSash(parentElement);
        };
        SideBySideEditor.prototype.setInput = function (newInput, options) {
            var _this = this;
            var oldInput = this.input;
            return _super.prototype.setInput.call(this, newInput, options)
                .then(function () { return _this.updateInput(oldInput, newInput, options); });
        };
        SideBySideEditor.prototype.setEditorVisible = function (visible, position) {
            if (this.masterEditor) {
                this.masterEditor.setVisible(visible, position);
            }
            if (this.detailsEditor) {
                this.detailsEditor.setVisible(visible, position);
            }
            _super.prototype.setEditorVisible.call(this, visible, position);
        };
        SideBySideEditor.prototype.changePosition = function (position) {
            if (this.masterEditor) {
                this.masterEditor.changePosition(position);
            }
            if (this.detailsEditor) {
                this.detailsEditor.changePosition(position);
            }
            _super.prototype.changePosition.call(this, position);
        };
        SideBySideEditor.prototype.clearInput = function () {
            if (this.masterEditor) {
                this.masterEditor.clearInput();
            }
            if (this.detailsEditor) {
                this.detailsEditor.clearInput();
            }
            this.disposeEditors();
            _super.prototype.clearInput.call(this);
        };
        SideBySideEditor.prototype.focus = function () {
            if (this.masterEditor) {
                this.masterEditor.focus();
            }
        };
        SideBySideEditor.prototype.layout = function (dimension) {
            this.dimension = dimension;
            this.sash.setDimenesion(this.dimension);
        };
        SideBySideEditor.prototype.getControl = function () {
            if (this.masterEditor) {
                return this.masterEditor.getControl();
            }
            return null;
        };
        SideBySideEditor.prototype.getMasterEditor = function () {
            return this.masterEditor;
        };
        SideBySideEditor.prototype.getDetailsEditor = function () {
            return this.detailsEditor;
        };
        SideBySideEditor.prototype.updateInput = function (oldInput, newInput, options) {
            if (!newInput.matches(oldInput)) {
                if (oldInput) {
                    this.disposeEditors();
                }
                this.createEditorContainers();
                return this.setNewInput(newInput, options);
            }
            else {
                this.detailsEditor.setInput(newInput.details);
                this.masterEditor.setInput(newInput.master, options);
                return void 0;
            }
        };
        SideBySideEditor.prototype.setNewInput = function (newInput, options) {
            var detailsEditor = this._createEditor(newInput.details, this.detailsEditorContainer);
            var masterEditor = this._createEditor(newInput.master, this.masterEditorContainer);
            this.onEditorsCreated(detailsEditor, masterEditor, newInput.details, newInput.master, options);
        };
        SideBySideEditor.prototype._createEditor = function (editorInput, container) {
            var descriptor = platform_1.Registry.as(editor_1.Extensions.Editors).getEditor(editorInput);
            var editor = descriptor.instantiate(this.instantiationService);
            editor.create(new builder_1.Builder(container));
            editor.setVisible(this.isVisible(), this.position);
            return editor;
        };
        SideBySideEditor.prototype.onEditorsCreated = function (details, master, detailsInput, masterInput, options) {
            var _this = this;
            this.detailsEditor = details;
            this.masterEditor = master;
            this.dolayout(this.sash.getVerticalSashLeft());
            return winjs_base_1.TPromise.join([this.detailsEditor.setInput(detailsInput), this.masterEditor.setInput(masterInput, options)]).then(function () { return _this.focus(); });
        };
        SideBySideEditor.prototype.createEditorContainers = function () {
            var parentElement = this.getContainer().getHTMLElement();
            this.detailsEditorContainer = DOM.append(parentElement, DOM.$('.details-editor-container'));
            this.detailsEditorContainer.style.position = 'absolute';
            this.masterEditorContainer = DOM.append(parentElement, DOM.$('.master-editor-container'));
            this.masterEditorContainer.style.position = 'absolute';
            this.updateStyles();
        };
        SideBySideEditor.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            if (this.masterEditorContainer) {
                this.masterEditorContainer.style.boxShadow = "-6px 0 5px -5px " + this.getColor(colorRegistry_1.scrollbarShadow);
            }
        };
        SideBySideEditor.prototype.createSash = function (parentElement) {
            var _this = this;
            this.sash = this._register(new sash_1.VSash(parentElement, 220));
            this._register(this.sash.onPositionChange(function (position) { return _this.dolayout(position); }));
        };
        SideBySideEditor.prototype.dolayout = function (splitPoint) {
            if (!this.detailsEditor || !this.masterEditor || !this.dimension) {
                return;
            }
            var masterEditorWidth = this.dimension.width - splitPoint;
            var detailsEditorWidth = this.dimension.width - masterEditorWidth;
            this.detailsEditorContainer.style.width = detailsEditorWidth + "px";
            this.detailsEditorContainer.style.height = this.dimension.height + "px";
            this.detailsEditorContainer.style.left = '0px';
            this.masterEditorContainer.style.width = masterEditorWidth + "px";
            this.masterEditorContainer.style.height = this.dimension.height + "px";
            this.masterEditorContainer.style.left = splitPoint + "px";
            this.detailsEditor.layout(new builder_1.Dimension(detailsEditorWidth, this.dimension.height));
            this.masterEditor.layout(new builder_1.Dimension(masterEditorWidth, this.dimension.height));
        };
        SideBySideEditor.prototype.disposeEditors = function () {
            var parentContainer = this.getContainer().getHTMLElement();
            if (this.detailsEditor) {
                this.detailsEditor.dispose();
                this.detailsEditor = null;
            }
            if (this.masterEditor) {
                this.masterEditor.dispose();
                this.masterEditor = null;
            }
            if (this.detailsEditorContainer) {
                parentContainer.removeChild(this.detailsEditorContainer);
                this.detailsEditorContainer = null;
            }
            if (this.masterEditorContainer) {
                parentContainer.removeChild(this.masterEditorContainer);
                this.masterEditorContainer = null;
            }
        };
        SideBySideEditor.prototype.dispose = function () {
            this.disposeEditors();
            _super.prototype.dispose.call(this);
        };
        SideBySideEditor.ID = 'workbench.editor.sidebysideEditor';
        SideBySideEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, themeService_1.IThemeService)
        ], SideBySideEditor);
        return SideBySideEditor;
    }(baseEditor_1.BaseEditor));
    exports.SideBySideEditor = SideBySideEditor;
});
