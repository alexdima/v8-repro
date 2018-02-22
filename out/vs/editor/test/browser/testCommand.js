define(["require", "exports", "assert", "vs/editor/common/editorCommon", "vs/editor/common/model/textModel", "vs/editor/test/browser/testCodeEditor"], function (require, exports, assert, editorCommon, textModel_1, testCodeEditor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function testCommand(lines, languageIdentifier, selection, commandFactory, expectedLines, expectedSelection) {
        var model = textModel_1.TextModel.createFromString(lines.join('\n'), undefined, languageIdentifier);
        testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
            cursor.setSelections('tests', [selection]);
            cursor.trigger('tests', editorCommon.Handler.ExecuteCommand, commandFactory(cursor.getSelection()));
            assert.deepEqual(model.getLinesContent(), expectedLines);
            var actualSelection = cursor.getSelection();
            assert.deepEqual(actualSelection.toString(), expectedSelection.toString());
        });
        model.dispose();
    }
    exports.testCommand = testCommand;
    /**
     * Extract edit operations if command `command` were to execute on model `model`
     */
    function getEditOperation(model, command) {
        var operations = [];
        var editOperationBuilder = {
            addEditOperation: function (range, text) {
                operations.push({
                    range: range,
                    text: text
                });
            },
            addTrackedEditOperation: function (range, text) {
                operations.push({
                    range: range,
                    text: text
                });
            },
            trackSelection: function (selection) {
                return null;
            }
        };
        command.getEditOperations(model, editOperationBuilder);
        return operations;
    }
    exports.getEditOperation = getEditOperation;
});
