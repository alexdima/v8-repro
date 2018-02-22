define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/core/selection"], function (require, exports, range_1, selection_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var DeleteLinesCommand = /** @class */ (function () {
        function DeleteLinesCommand(startLineNumber, endLineNumber, restoreCursorToColumn) {
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
            this.restoreCursorToColumn = restoreCursorToColumn;
        }
        DeleteLinesCommand.prototype.getEditOperations = function (model, builder) {
            if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
                // Model is empty
                return;
            }
            var startLineNumber = this.startLineNumber;
            var endLineNumber = this.endLineNumber;
            var startColumn = 1;
            var endColumn = model.getLineMaxColumn(endLineNumber);
            if (endLineNumber < model.getLineCount()) {
                endLineNumber += 1;
                endColumn = 1;
            }
            else if (startLineNumber > 1) {
                startLineNumber -= 1;
                startColumn = model.getLineMaxColumn(startLineNumber);
            }
            builder.addTrackedEditOperation(new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn), null);
        };
        DeleteLinesCommand.prototype.computeCursorState = function (model, helper) {
            var inverseEditOperations = helper.getInverseEditOperations();
            var srcRange = inverseEditOperations[0].range;
            return new selection_1.Selection(srcRange.endLineNumber, this.restoreCursorToColumn, srcRange.endLineNumber, this.restoreCursorToColumn);
        };
        return DeleteLinesCommand;
    }());
    exports.DeleteLinesCommand = DeleteLinesCommand;
});
