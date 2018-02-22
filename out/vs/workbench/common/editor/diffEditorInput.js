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
define(["require", "exports", "vs/base/common/winjs.base", "vs/workbench/common/editor", "vs/workbench/common/editor/textEditorModel", "vs/workbench/common/editor/diffEditorModel", "vs/workbench/common/editor/textDiffEditorModel"], function (require, exports, winjs_base_1, editor_1, textEditorModel_1, diffEditorModel_1, textDiffEditorModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The base editor input for the diff editor. It is made up of two editor inputs, the original version
     * and the modified version.
     */
    var DiffEditorInput = /** @class */ (function (_super) {
        __extends(DiffEditorInput, _super);
        function DiffEditorInput(name, description, original, modified, forceOpenAsBinary) {
            var _this = _super.call(this, name, description, original, modified) || this;
            _this.forceOpenAsBinary = forceOpenAsBinary;
            return _this;
        }
        DiffEditorInput.prototype.getTypeId = function () {
            return DiffEditorInput.ID;
        };
        Object.defineProperty(DiffEditorInput.prototype, "originalInput", {
            get: function () {
                return this.details;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DiffEditorInput.prototype, "modifiedInput", {
            get: function () {
                return this.master;
            },
            enumerable: true,
            configurable: true
        });
        DiffEditorInput.prototype.resolve = function (refresh) {
            var _this = this;
            var modelPromise;
            // Use Cached Model
            if (this.cachedModel && !refresh) {
                modelPromise = winjs_base_1.TPromise.as(this.cachedModel);
            }
            else {
                modelPromise = this.createModel(refresh);
            }
            return modelPromise.then(function (resolvedModel) {
                if (_this.cachedModel) {
                    _this.cachedModel.dispose();
                }
                _this.cachedModel = resolvedModel;
                return _this.cachedModel;
            });
        };
        DiffEditorInput.prototype.getPreferredEditorId = function (candidates) {
            return this.forceOpenAsBinary ? editor_1.BINARY_DIFF_EDITOR_ID : editor_1.TEXT_DIFF_EDITOR_ID;
        };
        DiffEditorInput.prototype.createModel = function (refresh) {
            // Join resolve call over two inputs and build diff editor model
            return winjs_base_1.TPromise.join([
                this.originalInput.resolve(refresh),
                this.modifiedInput.resolve(refresh)
            ]).then(function (models) {
                var originalEditorModel = models[0];
                var modifiedEditorModel = models[1];
                // If both are text models, return textdiffeditor model
                if (modifiedEditorModel instanceof textEditorModel_1.BaseTextEditorModel && originalEditorModel instanceof textEditorModel_1.BaseTextEditorModel) {
                    return new textDiffEditorModel_1.TextDiffEditorModel(originalEditorModel, modifiedEditorModel);
                }
                // Otherwise return normal diff model
                return new diffEditorModel_1.DiffEditorModel(originalEditorModel, modifiedEditorModel);
            });
        };
        DiffEditorInput.prototype.dispose = function () {
            // Free the diff editor model but do not propagate the dispose() call to the two inputs
            // We never created the two inputs (original and modified) so we can not dispose
            // them without sideeffects.
            if (this.cachedModel) {
                this.cachedModel.dispose();
                this.cachedModel = null;
            }
            _super.prototype.dispose.call(this);
        };
        DiffEditorInput.ID = 'workbench.editors.diffEditorInput';
        return DiffEditorInput;
    }(editor_1.SideBySideEditorInput));
    exports.DiffEditorInput = DiffEditorInput;
});
