/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/node/stream"], function (require, exports, assert, stream) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Stream', function () {
        test('readExactlyByFile - ANSI', function (done) {
            var file = require.toUrl('./fixtures/file.css');
            stream.readExactlyByFile(file, 10).then(function (_a) {
                var buffer = _a.buffer, bytesRead = _a.bytesRead;
                assert.equal(bytesRead, 10);
                assert.equal(buffer.toString(), '/*--------');
                done();
            }, done);
        });
        test('readExactlyByFile - empty', function (done) {
            var file = require.toUrl('./fixtures/empty.txt');
            stream.readExactlyByFile(file, 10).then(function (_a) {
                var bytesRead = _a.bytesRead;
                assert.equal(bytesRead, 0);
                done();
            }, done);
        });
        test('readToMatchingString - ANSI', function (done) {
            var file = require.toUrl('./fixtures/file.css');
            stream.readToMatchingString(file, '\n', 10, 100).then(function (result) {
                // \r may be present on Windows
                assert.equal(result.replace('\r', ''), '/*---------------------------------------------------------------------------------------------');
                done();
            }, done);
        });
        test('readToMatchingString - empty', function (done) {
            var file = require.toUrl('./fixtures/empty.txt');
            stream.readToMatchingString(file, '\n', 10, 100).then(function (result) {
                assert.equal(result, null);
                done();
            }, done);
        });
    });
});
