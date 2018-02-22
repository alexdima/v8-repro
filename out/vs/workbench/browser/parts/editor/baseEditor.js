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
define(["require", "exports", "vs/base/common/winjs.base", "vs/workbench/browser/panel"], function (require, exports, winjs_base_1, panel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The base class of editors in the workbench. Editors register themselves for specific editor inputs.
     * Editors are layed out in the editor part of the workbench. Only one editor can be open at a time.
     * Each editor has a minimized representation that is good enough to provide some information about the
     * state of the editor data.
     * The workbench will keep an editor alive after it has been created and show/hide it based on
     * user interaction. The lifecycle of a editor goes in the order create(), setVisible(true|false),
     * layout(), setInput(), focus(), dispose(). During use of the workbench, a editor will often receive a
     * clearInput, setVisible, layout and focus call, but only one create and dispose call.
     *
     * This class is only intended to be subclassed and not instantiated.
     */
    var BaseEditor = /** @class */ (function (_super) {
        __extends(BaseEditor, _super);
        function BaseEditor(id, telemetryService, themeService) {
            return _super.call(this, id, telemetryService, themeService) || this;
        }
        Object.defineProperty(BaseEditor.prototype, "input", {
            get: function () {
                return this._input;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseEditor.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Sets the given input with the options to the part. An editor has to deal with the
         * situation that the same input is being set with different options.
         */
        BaseEditor.prototype.setInput = function (input, options) {
            this._input = input;
            this._options = options;
            return winjs_base_1.TPromise.wrap(null);
        };
        /**
         * Called to indicate to the editor that the input should be cleared and resources associated with the
         * input should be freed.
         */
        BaseEditor.prototype.clearInput = function () {
            this._input = null;
            this._options = null;
        };
        BaseEditor.prototype.create = function (parent) {
            var res = _super.prototype.create.call(this, parent);
            // Create Editor
            this.createEditor(parent);
            return res;
        };
        BaseEditor.prototype.setVisible = function (visible, position) {
            if (position === void 0) { position = null; }
            var promise = _super.prototype.setVisible.call(this, visible);
            // Propagate to Editor
            this.setEditorVisible(visible, position);
            return promise;
        };
        BaseEditor.prototype.setEditorVisible = function (visible, position) {
            if (position === void 0) { position = null; }
            this._position = position;
        };
        /**
         * Called when the position of the editor changes while it is visible.
         */
        BaseEditor.prototype.changePosition = function (position) {
            this._position = position;
        };
        Object.defineProperty(BaseEditor.prototype, "position", {
            /**
             * The position this editor is showing in or null if none.
             */
            get: function () {
                return this._position;
            },
            enumerable: true,
            configurable: true
        });
        BaseEditor.prototype.dispose = function () {
            this._input = null;
            this._options = null;
            // Super Dispose
            _super.prototype.dispose.call(this);
        };
        return BaseEditor;
    }(panel_1.Panel));
    exports.BaseEditor = BaseEditor;
});
