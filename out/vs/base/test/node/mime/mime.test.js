/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/mime", "vs/base/node/mime", "vs/base/node/stream"], function (require, exports, assert, mimeCommon, mime, stream_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Mime', function () {
        test('detectMimesFromFile (JSON saved as PNG)', function (done) {
            var file = require.toUrl('./fixtures/some.json.png');
            stream_1.readExactlyByFile(file, 512).then(function (buffer) {
                var mimes = mime.detectMimeAndEncodingFromBuffer(buffer);
                assert.deepEqual(mimes.mimes, ['text/plain']);
                done();
            });
        });
        test('detectMimesFromFile (PNG saved as TXT)', function (done) {
            mimeCommon.registerTextMime({ id: 'text', mime: 'text/plain', extension: '.txt' });
            var file = require.toUrl('./fixtures/some.png.txt');
            stream_1.readExactlyByFile(file, 512).then(function (buffer) {
                var mimes = mime.detectMimeAndEncodingFromBuffer(buffer);
                assert.deepEqual(mimes.mimes, ['application/octet-stream']);
                done();
            }, done);
        });
        test('detectMimesFromFile (XML saved as PNG)', function (done) {
            var file = require.toUrl('./fixtures/some.xml.png');
            stream_1.readExactlyByFile(file, 512).then(function (buffer) {
                var mimes = mime.detectMimeAndEncodingFromBuffer(buffer);
                assert.deepEqual(mimes.mimes, ['text/plain']);
                done();
            }, done);
        });
        test('detectMimesFromFile (QWOFF saved as TXT)', function (done) {
            var file = require.toUrl('./fixtures/some.qwoff.txt');
            stream_1.readExactlyByFile(file, 512).then(function (buffer) {
                var mimes = mime.detectMimeAndEncodingFromBuffer(buffer);
                assert.deepEqual(mimes.mimes, ['application/octet-stream']);
                done();
            }, done);
        });
        test('detectMimesFromFile (CSS saved as QWOFF)', function (done) {
            var file = require.toUrl('./fixtures/some.css.qwoff');
            stream_1.readExactlyByFile(file, 512).then(function (buffer) {
                var mimes = mime.detectMimeAndEncodingFromBuffer(buffer);
                assert.deepEqual(mimes.mimes, ['text/plain']);
                done();
            }, done);
        });
        test('detectMimesFromFile (PDF)', function (done) {
            var file = require.toUrl('./fixtures/some.pdf');
            stream_1.readExactlyByFile(file, 512).then(function (buffer) {
                var mimes = mime.detectMimeAndEncodingFromBuffer(buffer);
                assert.deepEqual(mimes.mimes, ['application/octet-stream']);
                done();
            }, done);
        });
        test('autoGuessEncoding (ShiftJIS)', function (done) {
            var file = require.toUrl('./fixtures/some.shiftjis.txt');
            stream_1.readExactlyByFile(file, 512 * 8).then(function (buffer) {
                mime.detectMimeAndEncodingFromBuffer(buffer, true).then(function (mimes) {
                    assert.equal(mimes.encoding, 'shiftjis');
                    done();
                });
            }, done);
        });
        test('autoGuessEncoding (CP1252)', function (done) {
            var file = require.toUrl('./fixtures/some.cp1252.txt');
            stream_1.readExactlyByFile(file, 512 * 8).then(function (buffer) {
                mime.detectMimeAndEncodingFromBuffer(buffer, true).then(function (mimes) {
                    assert.equal(mimes.encoding, 'windows1252');
                    done();
                });
            }, done);
        });
    });
});
