define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/marshalling"], function (require, exports, assert, uri_1, marshalling_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Marshalling', function () {
        test('RegExp', function () {
            var value = /foo/img;
            var raw = marshalling_1.stringify(value);
            var clone = marshalling_1.parse(raw);
            assert.equal(value.source, clone.source);
            assert.equal(value.global, clone.global);
            assert.equal(value.ignoreCase, clone.ignoreCase);
            assert.equal(value.multiline, clone.multiline);
        });
        test('URI', function () {
            var value = uri_1.default.from({ scheme: 'file', authority: 'server', path: '/shares/c#files', query: 'q', fragment: 'f' });
            var raw = marshalling_1.stringify(value);
            var clone = marshalling_1.parse(raw);
            assert.equal(value.scheme, clone.scheme);
            assert.equal(value.authority, clone.authority);
            assert.equal(value.path, clone.path);
            assert.equal(value.query, clone.query);
            assert.equal(value.fragment, clone.fragment);
        });
        test('Bug 16793:# in folder name => mirror models get out of sync', function () {
            var uri1 = uri_1.default.file('C:\\C#\\file.txt');
            assert.equal(marshalling_1.parse(marshalling_1.stringify(uri1)).toString(), uri1.toString());
        });
    });
});
