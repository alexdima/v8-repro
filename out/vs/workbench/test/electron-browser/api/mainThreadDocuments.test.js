/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/electron-browser/mainThreadDocuments", "vs/editor/common/model/textModel", "vs/base/common/winjs.base"], function (require, exports, assert, mainThreadDocuments_1, textModel_1, winjs_base_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('BoundModelReferenceCollection', function () {
        var col = new mainThreadDocuments_1.BoundModelReferenceCollection(15, 75);
        teardown(function () {
            col.dispose();
        });
        test('max age', function () {
            var didDispose = false;
            col.add({
                object: { textEditorModel: textModel_1.TextModel.createFromString('farboo') },
                dispose: function () {
                    didDispose = true;
                }
            });
            return winjs_base_1.TPromise.timeout(30).then(function () {
                assert.equal(didDispose, true);
            });
        });
        test('max size', function () {
            var disposed = [];
            col.add({
                object: { textEditorModel: textModel_1.TextModel.createFromString('farboo') },
                dispose: function () {
                    disposed.push(0);
                }
            });
            col.add({
                object: { textEditorModel: textModel_1.TextModel.createFromString('boofar') },
                dispose: function () {
                    disposed.push(1);
                }
            });
            col.add({
                object: { textEditorModel: textModel_1.TextModel.createFromString(new Array(71).join('x')) },
                dispose: function () {
                    disposed.push(2);
                }
            });
            assert.deepEqual(disposed, [0, 1]);
        });
    });
});
