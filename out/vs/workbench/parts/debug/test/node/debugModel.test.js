/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/severity", "vs/workbench/parts/debug/common/debugModel", "sinon", "vs/workbench/parts/debug/test/common/mockDebug"], function (require, exports, assert, uri_1, severity_1, debugModel_1, sinon, mockDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Model', function () {
        var model;
        var rawSession;
        setup(function () {
            model = new debugModel_1.Model([], true, [], [], []);
            rawSession = new mockDebug_1.MockSession();
        });
        teardown(function () {
            model = null;
        });
        // Breakpoints
        test('breakpoints simple', function () {
            var modelUri = uri_1.default.file('/myfolder/myfile.js');
            model.addBreakpoints(modelUri, [{ lineNumber: 5, enabled: true }, { lineNumber: 10, enabled: false }]);
            assert.equal(model.areBreakpointsActivated(), true);
            assert.equal(model.getBreakpoints().length, 2);
            model.removeBreakpoints(model.getBreakpoints());
            assert.equal(model.getBreakpoints().length, 0);
        });
        test('breakpoints toggling', function () {
            var modelUri = uri_1.default.file('/myfolder/myfile.js');
            model.addBreakpoints(modelUri, [{ lineNumber: 5, enabled: true }, { lineNumber: 10, enabled: false }]);
            model.addBreakpoints(modelUri, [{ lineNumber: 12, enabled: true, condition: 'fake condition' }]);
            assert.equal(model.getBreakpoints().length, 3);
            model.removeBreakpoints([model.getBreakpoints().pop()]);
            assert.equal(model.getBreakpoints().length, 2);
            model.setBreakpointsActivated(false);
            assert.equal(model.areBreakpointsActivated(), false);
            model.setBreakpointsActivated(true);
            assert.equal(model.areBreakpointsActivated(), true);
        });
        test('breakpoints two files', function () {
            var modelUri1 = uri_1.default.file('/myfolder/my file first.js');
            var modelUri2 = uri_1.default.file('/secondfolder/second/second file.js');
            model.addBreakpoints(modelUri1, [{ lineNumber: 5, enabled: true }, { lineNumber: 10, enabled: false }]);
            model.addBreakpoints(modelUri2, [{ lineNumber: 1, enabled: true }, { lineNumber: 2, enabled: true }, { lineNumber: 3, enabled: false }]);
            assert.equal(model.getBreakpoints().length, 5);
            var bp = model.getBreakpoints()[0];
            var update = {};
            update[bp.getId()] = { line: 100, verified: false };
            model.updateBreakpoints(update);
            assert.equal(bp.lineNumber, 100);
            model.enableOrDisableAllBreakpoints(false);
            model.getBreakpoints().forEach(function (bp) {
                assert.equal(bp.enabled, false);
            });
            model.setEnablement(bp, true);
            assert.equal(bp.enabled, true);
            model.removeBreakpoints(model.getBreakpoints().filter(function (bp) { return bp.uri.toString() === modelUri1.toString(); }));
            assert.equal(model.getBreakpoints().length, 3);
        });
        test('breakpoints conditions', function () {
            var modelUri1 = uri_1.default.file('/myfolder/my file first.js');
            model.addBreakpoints(modelUri1, [{ lineNumber: 5, condition: 'i < 5', hitCondition: '17' }, { lineNumber: 10, condition: 'j < 3' }]);
            var breakpoints = model.getBreakpoints();
            assert.equal(breakpoints[0].condition, 'i < 5');
            assert.equal(breakpoints[0].hitCondition, '17');
            assert.equal(breakpoints[1].condition, 'j < 3');
            assert.equal(!!breakpoints[1].hitCondition, false);
            assert.equal(model.getBreakpoints().length, 2);
            model.removeBreakpoints(model.getBreakpoints());
            assert.equal(model.getBreakpoints().length, 0);
        });
        // Threads
        test('threads simple', function () {
            var threadId = 1;
            var threadName = 'firstThread';
            model.addProcess({ name: 'mockProcess', type: 'node', request: 'launch' }, rawSession);
            assert.equal(model.getProcesses().length, 1);
            model.rawUpdate({
                sessionId: rawSession.getId(),
                threadId: threadId,
                thread: {
                    id: threadId,
                    name: threadName
                }
            });
            var process = model.getProcesses().filter(function (p) { return p.getId() === rawSession.getId(); }).pop();
            assert.equal(process.getThread(threadId).name, threadName);
            model.clearThreads(process.getId(), true);
            assert.equal(process.getThread(threadId), null);
            assert.equal(model.getProcesses().length, 1);
            model.removeProcess(process.getId());
            assert.equal(model.getProcesses().length, 0);
        });
        test('threads multiple wtih allThreadsStopped', function () {
            var sessionStub = sinon.spy(rawSession, 'stackTrace');
            var threadId1 = 1;
            var threadName1 = 'firstThread';
            var threadId2 = 2;
            var threadName2 = 'secondThread';
            var stoppedReason = 'breakpoint';
            // Add the threads
            model.addProcess({ name: 'mockProcess', type: 'node', request: 'launch' }, rawSession);
            model.rawUpdate({
                sessionId: rawSession.getId(),
                threadId: threadId1,
                thread: {
                    id: threadId1,
                    name: threadName1
                }
            });
            model.rawUpdate({
                sessionId: rawSession.getId(),
                threadId: threadId2,
                thread: {
                    id: threadId2,
                    name: threadName2
                }
            });
            // Stopped event with all threads stopped
            model.rawUpdate({
                sessionId: rawSession.getId(),
                threadId: threadId1,
                stoppedDetails: {
                    reason: stoppedReason,
                    threadId: 1,
                    allThreadsStopped: true
                },
            });
            var process = model.getProcesses().filter(function (p) { return p.getId() === rawSession.getId(); }).pop();
            var thread1 = process.getThread(threadId1);
            var thread2 = process.getThread(threadId2);
            // at the beginning, callstacks are obtainable but not available
            assert.equal(process.getAllThreads().length, 2);
            assert.equal(thread1.name, threadName1);
            assert.equal(thread1.stopped, true);
            assert.equal(thread1.getCallStack().length, 0);
            assert.equal(thread1.stoppedDetails.reason, stoppedReason);
            assert.equal(thread2.name, threadName2);
            assert.equal(thread2.stopped, true);
            assert.equal(thread2.getCallStack().length, 0);
            assert.equal(thread2.stoppedDetails.reason, undefined);
            // after calling getCallStack, the callstack becomes available
            // and results in a request for the callstack in the debug adapter
            thread1.fetchCallStack().then(function () {
                assert.notEqual(thread1.getCallStack().length, 0);
                assert.equal(thread2.getCallStack().length, 0);
                assert.equal(sessionStub.callCount, 1);
            });
            thread2.fetchCallStack().then(function () {
                assert.notEqual(thread1.getCallStack().length, 0);
                assert.notEqual(thread2.getCallStack().length, 0);
                assert.equal(sessionStub.callCount, 2);
            });
            // calling multiple times getCallStack doesn't result in multiple calls
            // to the debug adapter
            thread1.fetchCallStack().then(function () {
                return thread2.fetchCallStack();
            }).then(function () {
                assert.equal(sessionStub.callCount, 4);
            });
            // clearing the callstack results in the callstack not being available
            thread1.clearCallStack();
            assert.equal(thread1.stopped, true);
            assert.equal(thread1.getCallStack().length, 0);
            thread2.clearCallStack();
            assert.equal(thread2.stopped, true);
            assert.equal(thread2.getCallStack().length, 0);
            model.clearThreads(process.getId(), true);
            assert.equal(process.getThread(threadId1), null);
            assert.equal(process.getThread(threadId2), null);
            assert.equal(process.getAllThreads().length, 0);
        });
        test('threads mutltiple without allThreadsStopped', function () {
            var sessionStub = sinon.spy(rawSession, 'stackTrace');
            var stoppedThreadId = 1;
            var stoppedThreadName = 'stoppedThread';
            var runningThreadId = 2;
            var runningThreadName = 'runningThread';
            var stoppedReason = 'breakpoint';
            model.addProcess({ name: 'mockProcess', type: 'node', request: 'launch' }, rawSession);
            // Add the threads
            model.rawUpdate({
                sessionId: rawSession.getId(),
                threadId: stoppedThreadId,
                thread: {
                    id: stoppedThreadId,
                    name: stoppedThreadName
                }
            });
            model.rawUpdate({
                sessionId: rawSession.getId(),
                threadId: runningThreadId,
                thread: {
                    id: runningThreadId,
                    name: runningThreadName
                }
            });
            // Stopped event with only one thread stopped
            model.rawUpdate({
                sessionId: rawSession.getId(),
                threadId: stoppedThreadId,
                stoppedDetails: {
                    reason: stoppedReason,
                    threadId: 1,
                    allThreadsStopped: false
                }
            });
            var process = model.getProcesses().filter(function (p) { return p.getId() === rawSession.getId(); }).pop();
            var stoppedThread = process.getThread(stoppedThreadId);
            var runningThread = process.getThread(runningThreadId);
            // the callstack for the stopped thread is obtainable but not available
            // the callstack for the running thread is not obtainable nor available
            assert.equal(stoppedThread.name, stoppedThreadName);
            assert.equal(stoppedThread.stopped, true);
            assert.equal(process.getAllThreads().length, 2);
            assert.equal(stoppedThread.getCallStack().length, 0);
            assert.equal(stoppedThread.stoppedDetails.reason, stoppedReason);
            assert.equal(runningThread.name, runningThreadName);
            assert.equal(runningThread.stopped, false);
            assert.equal(runningThread.getCallStack().length, 0);
            assert.equal(runningThread.stoppedDetails, undefined);
            // after calling getCallStack, the callstack becomes available
            // and results in a request for the callstack in the debug adapter
            stoppedThread.fetchCallStack().then(function () {
                assert.notEqual(stoppedThread.getCallStack().length, 0);
                assert.equal(runningThread.getCallStack().length, 0);
                assert.equal(sessionStub.callCount, 1);
            });
            // calling getCallStack on the running thread returns empty array
            // and does not return in a request for the callstack in the debug
            // adapter
            runningThread.fetchCallStack().then(function () {
                assert.equal(runningThread.getCallStack().length, 0);
                assert.equal(sessionStub.callCount, 1);
            });
            // clearing the callstack results in the callstack not being available
            stoppedThread.clearCallStack();
            assert.equal(stoppedThread.stopped, true);
            assert.equal(stoppedThread.getCallStack().length, 0);
            model.clearThreads(process.getId(), true);
            assert.equal(process.getThread(stoppedThreadId), null);
            assert.equal(process.getThread(runningThreadId), null);
            assert.equal(process.getAllThreads().length, 0);
        });
        // Expressions
        function assertWatchExpressions(watchExpressions, expectedName) {
            assert.equal(watchExpressions.length, 2);
            watchExpressions.forEach(function (we) {
                assert.equal(we.available, false);
                assert.equal(we.reference, 0);
                assert.equal(we.name, expectedName);
            });
        }
        test('watch expressions', function () {
            assert.equal(model.getWatchExpressions().length, 0);
            var process = new debugModel_1.Process({ name: 'mockProcess', type: 'node', request: 'launch' }, rawSession);
            var thread = new debugModel_1.Thread(process, 'mockthread', 1);
            var stackFrame = new debugModel_1.StackFrame(thread, 1, null, 'app.js', 'normal', { startLineNumber: 1, startColumn: 1, endLineNumber: undefined, endColumn: undefined }, 0);
            model.addWatchExpression(process, stackFrame, 'console');
            model.addWatchExpression(process, stackFrame, 'console');
            var watchExpressions = model.getWatchExpressions();
            assertWatchExpressions(watchExpressions, 'console');
            model.renameWatchExpression(process, stackFrame, watchExpressions[0].getId(), 'new_name');
            model.renameWatchExpression(process, stackFrame, watchExpressions[1].getId(), 'new_name');
            assertWatchExpressions(model.getWatchExpressions(), 'new_name');
            assertWatchExpressions(model.getWatchExpressions(), 'new_name');
            model.addWatchExpression(process, stackFrame, 'mockExpression');
            model.moveWatchExpression(model.getWatchExpressions()[2].getId(), 1);
            watchExpressions = model.getWatchExpressions();
            assert.equal(watchExpressions[0].name, 'new_name');
            assert.equal(watchExpressions[1].name, 'mockExpression');
            assert.equal(watchExpressions[2].name, 'new_name');
            model.removeWatchExpressions();
            assert.equal(model.getWatchExpressions().length, 0);
        });
        test('repl expressions', function () {
            assert.equal(model.getReplElements().length, 0);
            var process = new debugModel_1.Process({ name: 'mockProcess', type: 'node', request: 'launch' }, rawSession);
            var thread = new debugModel_1.Thread(process, 'mockthread', 1);
            var stackFrame = new debugModel_1.StackFrame(thread, 1, null, 'app.js', 'normal', { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 10 }, 1);
            model.addReplExpression(process, stackFrame, 'myVariable').done();
            model.addReplExpression(process, stackFrame, 'myVariable').done();
            model.addReplExpression(process, stackFrame, 'myVariable').done();
            assert.equal(model.getReplElements().length, 3);
            model.getReplElements().forEach(function (re) {
                assert.equal(re.available, false);
                assert.equal(re.name, 'myVariable');
                assert.equal(re.reference, 0);
            });
            model.removeReplExpressions();
            assert.equal(model.getReplElements().length, 0);
        });
        // Repl output
        test('repl output', function () {
            model.appendToRepl('first line\n', severity_1.default.Error);
            model.appendToRepl('second line', severity_1.default.Error);
            model.appendToRepl('third line', severity_1.default.Warning);
            model.appendToRepl('fourth line', severity_1.default.Error);
            var elements = model.getReplElements();
            assert.equal(elements.length, 4);
            assert.equal(elements[0].value, 'first line');
            assert.equal(elements[0].severity, severity_1.default.Error);
            assert.equal(elements[1].value, 'second line');
            assert.equal(elements[1].severity, severity_1.default.Error);
            assert.equal(elements[2].value, 'third line');
            assert.equal(elements[2].severity, severity_1.default.Warning);
            assert.equal(elements[3].value, 'fourth line');
            assert.equal(elements[3].severity, severity_1.default.Error);
            model.appendToRepl('1', severity_1.default.Warning);
            elements = model.getReplElements();
            assert.equal(elements.length, 5);
            assert.equal(elements[4].value, '1');
            assert.equal(elements[4].severity, severity_1.default.Warning);
            var keyValueObject = { 'key1': 2, 'key2': 'value' };
            model.appendToRepl(new debugModel_1.RawObjectReplElement('fake', keyValueObject), null);
            var element = model.getReplElements()[5];
            assert.equal(element.value, 'Object');
            assert.deepEqual(element.valueObj, keyValueObject);
            model.removeReplExpressions();
            assert.equal(model.getReplElements().length, 0);
        });
    });
});
