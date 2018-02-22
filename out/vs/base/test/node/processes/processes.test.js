/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "child_process", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/processes"], function (require, exports, assert, cp, objects, platform, uri_1, processes) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function fork(id) {
        var opts = {
            env: objects.mixin(objects.deepClone(process.env), {
                AMD_ENTRYPOINT: id,
                PIPE_LOGGING: 'true',
                VERBOSE_LOGGING: true
            })
        };
        return cp.fork(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, ['--type=processTests'], opts);
    }
    suite('Processes', function () {
        test('buffered sending - simple data', function (done) {
            if (process.env['VSCODE_PID']) {
                return done(); // this test fails when run from within VS Code
            }
            var child = fork('vs/base/test/node/processes/fixtures/fork');
            var sender = processes.createQueuedSender(child);
            var counter = 0;
            var msg1 = 'Hello One';
            var msg2 = 'Hello Two';
            var msg3 = 'Hello Three';
            child.on('message', function (msgFromChild) {
                if (msgFromChild === 'ready') {
                    sender.send(msg1);
                    sender.send(msg2);
                    sender.send(msg3);
                }
                else {
                    counter++;
                    if (counter === 1) {
                        assert.equal(msgFromChild, msg1);
                    }
                    else if (counter === 2) {
                        assert.equal(msgFromChild, msg2);
                    }
                    else if (counter === 3) {
                        assert.equal(msgFromChild, msg3);
                        child.kill();
                        done();
                    }
                }
            });
        });
        test('buffered sending - lots of data (potential deadlock on win32)', function (done) {
            if (!platform.isWindows || process.env['VSCODE_PID']) {
                return done(); // test is only relevant for Windows and seems to crash randomly on some Linux builds
            }
            var child = fork('vs/base/test/node/processes/fixtures/fork_large');
            var sender = processes.createQueuedSender(child);
            var largeObj = Object.create(null);
            for (var i = 0; i < 10000; i++) {
                largeObj[i] = 'some data';
            }
            var msg = JSON.stringify(largeObj);
            child.on('message', function (msgFromChild) {
                if (msgFromChild === 'ready') {
                    sender.send(msg);
                    sender.send(msg);
                    sender.send(msg);
                }
                else if (msgFromChild === 'done') {
                    child.kill();
                    done();
                }
            });
        });
    });
});
