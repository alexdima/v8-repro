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
define(["require", "exports", "vs/workbench/browser/parts/editor/baseEditor", "vs/workbench/common/memento"], function (require, exports, baseEditor_1, memento_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This class is only intended to be subclassed and not instantiated.
     */
    var BaseWebviewEditor = /** @class */ (function (_super) {
        __extends(BaseWebviewEditor, _super);
        function BaseWebviewEditor(id, telemetryService, themeService, storageService) {
            var _this = _super.call(this, id, telemetryService, themeService) || this;
            _this.storageService = storageService;
            return _this;
        }
        Object.defineProperty(BaseWebviewEditor.prototype, "viewStateStorageKey", {
            get: function () {
                return this.getId() + '.editorViewState';
            },
            enumerable: true,
            configurable: true
        });
        BaseWebviewEditor.prototype.saveViewState = function (resource, editorViewState) {
            var memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            var editorViewStateMemento = memento[this.viewStateStorageKey];
            if (!editorViewStateMemento) {
                editorViewStateMemento = Object.create(null);
                memento[this.viewStateStorageKey] = editorViewStateMemento;
            }
            var fileViewState = editorViewStateMemento[resource.toString()];
            if (!fileViewState) {
                fileViewState = Object.create(null);
                editorViewStateMemento[resource.toString()] = fileViewState;
            }
            if (typeof this.position === 'number') {
                fileViewState[this.position] = editorViewState;
            }
        };
        BaseWebviewEditor.prototype.loadViewState = function (resource) {
            var memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            var editorViewStateMemento = memento[this.viewStateStorageKey];
            if (editorViewStateMemento) {
                var fileViewState = editorViewStateMemento[resource.toString()];
                if (fileViewState) {
                    return fileViewState[this.position];
                }
            }
            return null;
        };
        return BaseWebviewEditor;
    }(baseEditor_1.BaseEditor));
    exports.BaseWebviewEditor = BaseWebviewEditor;
});
