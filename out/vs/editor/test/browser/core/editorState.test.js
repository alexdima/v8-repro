/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/browser/core/editorState", "vs/editor/common/core/selection", "vs/editor/common/core/position"], function (require, exports, assert, uri_1, editorState_1, selection_1, position_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Core - Editor State', function () {
        var allFlags = (1 /* Value */
            | 2 /* Selection */
            | 4 /* Position */
            | 8 /* Scroll */);
        test('empty editor state should be valid', function () {
            var result = validate({}, {});
            assert.equal(result, true);
        });
        test('different model URIs should be invalid', function () {
            var result = validate({ model: { uri: uri_1.default.parse('http://test1') } }, { model: { uri: uri_1.default.parse('http://test2') } });
            assert.equal(result, false);
        });
        test('different model versions should be invalid', function () {
            var result = validate({ model: { version: 1 } }, { model: { version: 2 } });
            assert.equal(result, false);
        });
        test('different positions should be invalid', function () {
            var result = validate({ position: new position_1.Position(1, 2) }, { position: new position_1.Position(2, 3) });
            assert.equal(result, false);
        });
        test('different selections should be invalid', function () {
            var result = validate({ selection: new selection_1.Selection(1, 2, 3, 4) }, { selection: new selection_1.Selection(5, 2, 3, 4) });
            assert.equal(result, false);
        });
        test('different scroll positions should be invalid', function () {
            var result = validate({ scroll: { left: 1, top: 2 } }, { scroll: { left: 3, top: 2 } });
            assert.equal(result, false);
        });
        function validate(source, target) {
            var sourceEditor = createEditor(source), targetEditor = createEditor(target);
            var result = new editorState_1.EditorState(sourceEditor, allFlags).validate(targetEditor);
            return result;
        }
        function createEditor(_a) {
            var _b = _a === void 0 ? {} : _a, model = _b.model, position = _b.position, selection = _b.selection, scroll = _b.scroll;
            var mappedModel = model ? { uri: model.uri ? model.uri : uri_1.default.parse('http://dummy.org'), getVersionId: function () { return model.version; } } : null;
            return {
                getModel: function () { return mappedModel; },
                getPosition: function () { return position; },
                getSelection: function () { return selection; },
                getScrollLeft: function () { return scroll && scroll.left; },
                getScrollTop: function () { return scroll && scroll.top; }
            };
        }
    });
});
