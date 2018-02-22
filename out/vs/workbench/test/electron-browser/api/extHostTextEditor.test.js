define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/workbench/api/node/extHostTypes", "vs/editor/common/config/editorOptions", "vs/workbench/api/node/extHostTextEditor", "vs/workbench/api/node/extHostDocumentData", "vs/base/common/uri"], function (require, exports, assert, winjs_base_1, extHostTypes_1, editorOptions_1, extHostTextEditor_1, extHostDocumentData_1, uri_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTextEditor', function () {
        var editor;
        setup(function () {
            var doc = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.default.file(''), [
                'aaaa bbbb+cccc abc'
            ], '\n', 'text', 1, false);
            editor = new extHostTextEditor_1.ExtHostTextEditor(null, 'fake', doc, [], { cursorStyle: 0, insertSpaces: true, lineNumbers: 1, tabSize: 4 }, 1);
        });
        test('disposed editor', function () {
            assert.ok(editor.document);
            editor._acceptViewColumn(3);
            assert.equal(3, editor.viewColumn);
            editor.dispose();
            assert.throws(function () { return editor._acceptViewColumn(2); });
            assert.equal(3, editor.viewColumn);
            assert.ok(editor.document);
            assert.throws(function () { return editor._acceptOptions(null); });
            assert.throws(function () { return editor._acceptSelections([]); });
        });
    });
    suite('ExtHostTextEditorOptions', function () {
        var opts;
        var calls = [];
        setup(function () {
            calls = [];
            var mockProxy = {
                dispose: undefined,
                $trySetOptions: function (id, options) {
                    assert.equal(id, '1');
                    calls.push(options);
                    return winjs_base_1.TPromise.as(void 0);
                },
                $tryShowTextDocument: undefined,
                $registerTextEditorDecorationType: undefined,
                $removeTextEditorDecorationType: undefined,
                $tryShowEditor: undefined,
                $tryHideEditor: undefined,
                $trySetDecorations: undefined,
                $trySetDecorationsFast: undefined,
                $tryRevealRange: undefined,
                $trySetSelections: undefined,
                $tryApplyEdits: undefined,
                $tryApplyWorkspaceEdit: undefined,
                $tryInsertSnippet: undefined,
                $getDiffInformation: undefined
            };
            opts = new extHostTextEditor_1.ExtHostTextEditorOptions(mockProxy, '1', {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
        });
        teardown(function () {
            opts = null;
            calls = null;
        });
        function assertState(opts, expected) {
            var actual = {
                tabSize: opts.tabSize,
                insertSpaces: opts.insertSpaces,
                cursorStyle: opts.cursorStyle,
                lineNumbers: opts.lineNumbers
            };
            assert.deepEqual(actual, expected);
        }
        test('can set tabSize to the same value', function () {
            opts.tabSize = 4;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('can change tabSize to positive integer', function () {
            opts.tabSize = 1;
            assertState(opts, {
                tabSize: 1,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ tabSize: 1 }]);
        });
        test('can change tabSize to positive float', function () {
            opts.tabSize = 2.3;
            assertState(opts, {
                tabSize: 2,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ tabSize: 2 }]);
        });
        test('can change tabSize to a string number', function () {
            opts.tabSize = '2';
            assertState(opts, {
                tabSize: 2,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ tabSize: 2 }]);
        });
        test('tabSize can request indentation detection', function () {
            opts.tabSize = 'auto';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ tabSize: 'auto' }]);
        });
        test('ignores invalid tabSize 1', function () {
            opts.tabSize = null;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('ignores invalid tabSize 2', function () {
            opts.tabSize = -5;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('ignores invalid tabSize 3', function () {
            opts.tabSize = 'hello';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('ignores invalid tabSize 4', function () {
            opts.tabSize = '-17';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('can set insertSpaces to the same value', function () {
            opts.insertSpaces = false;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('can set insertSpaces to boolean', function () {
            opts.insertSpaces = true;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: true,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ insertSpaces: true }]);
        });
        test('can set insertSpaces to false string', function () {
            opts.insertSpaces = 'false';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('can set insertSpaces to truey', function () {
            opts.insertSpaces = 'hello';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: true,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ insertSpaces: true }]);
        });
        test('insertSpaces can request indentation detection', function () {
            opts.insertSpaces = 'auto';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ insertSpaces: 'auto' }]);
        });
        test('can set cursorStyle to same value', function () {
            opts.cursorStyle = editorOptions_1.TextEditorCursorStyle.Line;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('can change cursorStyle', function () {
            opts.cursorStyle = editorOptions_1.TextEditorCursorStyle.Block;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Block,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ cursorStyle: editorOptions_1.TextEditorCursorStyle.Block }]);
        });
        test('can set lineNumbers to same value', function () {
            opts.lineNumbers = extHostTypes_1.TextEditorLineNumbersStyle.On;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('can change lineNumbers', function () {
            opts.lineNumbers = extHostTypes_1.TextEditorLineNumbersStyle.Off;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.Off
            });
            assert.deepEqual(calls, [{ lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.Off }]);
        });
        test('can do bulk updates 0', function () {
            opts.assign({
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, []);
        });
        test('can do bulk updates 1', function () {
            opts.assign({
                tabSize: 'auto',
                insertSpaces: true
            });
            assertState(opts, {
                tabSize: 4,
                insertSpaces: true,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ tabSize: 'auto', insertSpaces: true }]);
        });
        test('can do bulk updates 2', function () {
            opts.assign({
                tabSize: 3,
                insertSpaces: 'auto'
            });
            assertState(opts, {
                tabSize: 3,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assert.deepEqual(calls, [{ tabSize: 3, insertSpaces: 'auto' }]);
        });
        test('can do bulk updates 3', function () {
            opts.assign({
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Block,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.Relative
            });
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Block,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.Relative
            });
            assert.deepEqual(calls, [{ cursorStyle: editorOptions_1.TextEditorCursorStyle.Block, lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.Relative }]);
        });
    });
});
