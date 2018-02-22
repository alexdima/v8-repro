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
define(["require", "exports", "vs/workbench/common/editor", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor/binaryEditorModel", "vs/workbench/common/resources"], function (require, exports, editor_1, instantiation_1, binaryEditorModel_1, resources_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An editor input to present data URIs in a binary editor. Data URIs have the form of:
     * data:[mime type];[meta data <key=value>;...];base64,[base64 encoded value]
     */
    var DataUriEditorInput = /** @class */ (function (_super) {
        __extends(DataUriEditorInput, _super);
        function DataUriEditorInput(name, description, resource, instantiationService) {
            var _this = _super.call(this) || this;
            _this.instantiationService = instantiationService;
            _this.name = name;
            _this.description = description;
            _this.resource = resource;
            if (!_this.name || !_this.description) {
                var metadata = resources_1.DataUri.parseMetaData(_this.resource);
                if (!_this.name) {
                    _this.name = metadata.get(resources_1.DataUri.META_DATA_LABEL);
                }
                if (!_this.description) {
                    _this.description = metadata.get(resources_1.DataUri.META_DATA_DESCRIPTION);
                }
            }
            return _this;
        }
        DataUriEditorInput.prototype.getResource = function () {
            return this.resource;
        };
        DataUriEditorInput.prototype.getTypeId = function () {
            return DataUriEditorInput.ID;
        };
        DataUriEditorInput.prototype.getName = function () {
            return this.name;
        };
        DataUriEditorInput.prototype.getDescription = function () {
            return this.description;
        };
        DataUriEditorInput.prototype.resolve = function (refresh) {
            return this.instantiationService.createInstance(binaryEditorModel_1.BinaryEditorModel, this.resource, this.getName()).load().then(function (m) { return m; });
        };
        DataUriEditorInput.prototype.matches = function (otherInput) {
            if (_super.prototype.matches.call(this, otherInput) === true) {
                return true;
            }
            if (otherInput instanceof DataUriEditorInput) {
                var otherDataUriEditorInput = otherInput;
                // Compare by resource
                return otherDataUriEditorInput.resource.toString() === this.resource.toString();
            }
            return false;
        };
        DataUriEditorInput.ID = 'workbench.editors.dataUriEditorInput';
        DataUriEditorInput = __decorate([
            __param(3, instantiation_1.IInstantiationService)
        ], DataUriEditorInput);
        return DataUriEditorInput;
    }(editor_1.EditorInput));
    exports.DataUriEditorInput = DataUriEditorInput;
});
