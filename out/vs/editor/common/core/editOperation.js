define(["require", "exports", "vs/editor/common/core/range"], function (require, exports, range_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var EditOperation = /** @class */ (function () {
        function EditOperation() {
        }
        EditOperation.insert = function (position, text) {
            return {
                range: new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: text,
                forceMoveMarkers: true
            };
        };
        EditOperation.delete = function (range) {
            return {
                range: range,
                text: null
            };
        };
        EditOperation.replace = function (range, text) {
            return {
                range: range,
                text: text
            };
        };
        EditOperation.replaceMove = function (range, text) {
            return {
                range: range,
                text: text,
                forceMoveMarkers: true
            };
        };
        return EditOperation;
    }());
    exports.EditOperation = EditOperation;
});
