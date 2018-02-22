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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/winjs.base", "vs/base/browser/builder", "vs/workbench/browser/parts/editor/baseEditor", "vs/workbench/common/editor/binaryEditorModel", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/scrollable", "vs/workbench/browser/parts/editor/resourceViewer"], function (require, exports, nls, event_1, winjs_base_1, builder_1, baseEditor_1, binaryEditorModel_1, scrollableElement_1, scrollable_1, resourceViewer_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /*
     * This class is only intended to be subclassed and not instantiated.
     */
    var BaseBinaryResourceEditor = /** @class */ (function (_super) {
        __extends(BaseBinaryResourceEditor, _super);
        function BaseBinaryResourceEditor(id, telemetryService, themeService, windowsService) {
            var _this = _super.call(this, id, telemetryService, themeService) || this;
            _this.windowsService = windowsService;
            _this._onMetadataChanged = new event_1.Emitter();
            return _this;
        }
        Object.defineProperty(BaseBinaryResourceEditor.prototype, "onMetadataChanged", {
            get: function () {
                return this._onMetadataChanged.event;
            },
            enumerable: true,
            configurable: true
        });
        BaseBinaryResourceEditor.prototype.getTitle = function () {
            return this.input ? this.input.getName() : nls.localize('binaryEditor', "Binary Viewer");
        };
        BaseBinaryResourceEditor.prototype.createEditor = function (parent) {
            // Container for Binary
            var binaryContainerElement = document.createElement('div');
            binaryContainerElement.className = 'binary-container';
            this.binaryContainer = builder_1.$(binaryContainerElement);
            this.binaryContainer.style('outline', 'none');
            this.binaryContainer.tabindex(0); // enable focus support from the editor part (do not remove)
            // Custom Scrollbars
            this.scrollbar = new scrollableElement_1.DomScrollableElement(binaryContainerElement, { horizontal: scrollable_1.ScrollbarVisibility.Auto, vertical: scrollable_1.ScrollbarVisibility.Auto });
            parent.getHTMLElement().appendChild(this.scrollbar.getDomNode());
        };
        BaseBinaryResourceEditor.prototype.setInput = function (input, options) {
            var _this = this;
            // Return early for same input unless we force to open
            var forceOpen = options && options.forceOpen;
            if (!forceOpen && input.matches(this.input)) {
                return winjs_base_1.TPromise.wrap(null);
            }
            // Otherwise set input and resolve
            return _super.prototype.setInput.call(this, input, options).then(function () {
                return input.resolve(true).then(function (resolvedModel) {
                    // Assert Model instance
                    if (!(resolvedModel instanceof binaryEditorModel_1.BinaryEditorModel)) {
                        return winjs_base_1.TPromise.wrapError(new Error('Unable to open file as binary'));
                    }
                    // Assert that the current input is still the one we expect. This prevents a race condition when loading takes long and another input was set meanwhile
                    if (!_this.input || _this.input !== input) {
                        return null;
                    }
                    // Render Input
                    var model = resolvedModel;
                    _this.resourceViewerContext = resourceViewer_1.ResourceViewer.show({ name: model.getName(), resource: model.getResource(), size: model.getSize(), etag: model.getETag(), mime: model.getMime() }, _this.binaryContainer, _this.scrollbar, function (resource) {
                        _this.windowsService.openExternal(resource.toString()).then(function (didOpen) {
                            if (!didOpen) {
                                return _this.windowsService.showItemInFolder(resource.fsPath);
                            }
                            return void 0;
                        });
                    }, function (meta) { return _this.handleMetadataChanged(meta); });
                    return winjs_base_1.TPromise.as(null);
                });
            });
        };
        BaseBinaryResourceEditor.prototype.handleMetadataChanged = function (meta) {
            this.metadata = meta;
            this._onMetadataChanged.fire();
        };
        BaseBinaryResourceEditor.prototype.getMetadata = function () {
            return this.metadata;
        };
        BaseBinaryResourceEditor.prototype.clearInput = function () {
            // Clear Meta
            this.handleMetadataChanged(null);
            // Empty HTML Container
            builder_1.$(this.binaryContainer).empty();
            _super.prototype.clearInput.call(this);
        };
        BaseBinaryResourceEditor.prototype.layout = function (dimension) {
            // Pass on to Binary Container
            this.binaryContainer.size(dimension.width, dimension.height);
            this.scrollbar.scanDomNode();
            if (this.resourceViewerContext) {
                this.resourceViewerContext.layout(dimension);
            }
        };
        BaseBinaryResourceEditor.prototype.focus = function () {
            this.binaryContainer.domFocus();
        };
        BaseBinaryResourceEditor.prototype.dispose = function () {
            // Destroy Container
            this.binaryContainer.destroy();
            this.scrollbar.dispose();
            _super.prototype.dispose.call(this);
        };
        return BaseBinaryResourceEditor;
    }(baseEditor_1.BaseEditor));
    exports.BaseBinaryResourceEditor = BaseBinaryResourceEditor;
});
