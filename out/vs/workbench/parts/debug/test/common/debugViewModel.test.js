/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/parts/debug/common/debugViewModel", "vs/workbench/parts/debug/common/debugModel", "vs/workbench/parts/debug/test/common/mockDebug", "vs/platform/keybinding/test/common/mockKeybindingService"], function (require, exports, assert, debugViewModel_1, debugModel_1, mockDebug_1, mockKeybindingService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - View Model', function () {
        var model;
        setup(function () {
            model = new debugViewModel_1.ViewModel(new mockKeybindingService_1.MockContextKeyService());
        });
        teardown(function () {
            model = null;
        });
        test('focused stack frame', function () {
            assert.equal(model.focusedStackFrame, null);
            assert.equal(model.focusedThread, null);
            var mockSession = new mockDebug_1.MockSession();
            var process = new debugModel_1.Process({ name: 'mockProcess', type: 'node', request: 'launch' }, mockSession);
            var thread = new debugModel_1.Thread(process, 'myThread', 1);
            var frame = new debugModel_1.StackFrame(thread, 1, null, 'app.js', 'normal', { startColumn: 1, startLineNumber: 1, endColumn: undefined, endLineNumber: undefined }, 0);
            model.setFocus(frame, thread, process, false);
            assert.equal(model.focusedStackFrame.getId(), frame.getId());
            assert.equal(model.focusedThread.threadId, 1);
            assert.equal(model.focusedProcess.getId(), process.getId());
        });
        test('selected expression', function () {
            assert.equal(model.getSelectedExpression(), null);
            var expression = new debugModel_1.Expression('my expression');
            model.setSelectedExpression(expression);
            assert.equal(model.getSelectedExpression(), expression);
        });
        test('multi process view and changed workbench state', function () {
            assert.equal(model.isMultiProcessView(), false);
            model.setMultiProcessView(true);
            assert.equal(model.isMultiProcessView(), true);
        });
    });
});
