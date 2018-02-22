/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/editor"], function (require, exports, assert, editor_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - EditorOptions', function () {
        test('EditorOptions', function () {
            var options = new editor_1.EditorOptions();
            assert(!options.preserveFocus);
            options.preserveFocus = true;
            assert(options.preserveFocus);
            assert(!options.forceOpen);
            options.forceOpen = true;
            assert(options.forceOpen);
            options = new editor_1.EditorOptions();
            options.forceOpen = true;
        });
        test('TextEditorOptions', function () {
            var options = new editor_1.TextEditorOptions();
            var otherOptions = new editor_1.TextEditorOptions();
            assert(!options.hasOptionsDefined());
            options.selection(1, 1, 2, 2);
            assert(options.hasOptionsDefined());
            otherOptions.selection(1, 1, 2, 2);
            options = new editor_1.TextEditorOptions();
            options.forceOpen = true;
            options.selection(1, 1, 2, 2);
        });
    });
});
