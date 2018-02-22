define(["require", "exports", "assert", "vs/base/common/hash"], function (require, exports, assert, hash_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Hash', function () {
        test('string', function () {
            assert.equal(hash_1.hash('hello'), hash_1.hash('hello'));
            assert.notEqual(hash_1.hash('hello'), hash_1.hash('world'));
            assert.notEqual(hash_1.hash('hello'), hash_1.hash('olleh'));
            assert.notEqual(hash_1.hash('hello'), hash_1.hash('Hello'));
            assert.notEqual(hash_1.hash('hello'), hash_1.hash('Hello '));
            assert.notEqual(hash_1.hash('h'), hash_1.hash('H'));
            assert.notEqual(hash_1.hash('-'), hash_1.hash('_'));
        });
        test('number', function () {
            assert.equal(hash_1.hash(1), hash_1.hash(1.0));
            assert.notEqual(hash_1.hash(0), hash_1.hash(1));
            assert.notEqual(hash_1.hash(1), hash_1.hash(-1));
            assert.notEqual(hash_1.hash(0x12345678), hash_1.hash(0x123456789));
        });
        test('boolean', function () {
            assert.equal(hash_1.hash(true), hash_1.hash(true));
            assert.notEqual(hash_1.hash(true), hash_1.hash(false));
        });
        test('array', function () {
            assert.equal(hash_1.hash([1, 2, 3]), hash_1.hash([1, 2, 3]));
            assert.equal(hash_1.hash(['foo', 'bar']), hash_1.hash(['foo', 'bar']));
            assert.equal(hash_1.hash([]), hash_1.hash([]));
            assert.notEqual(hash_1.hash(['foo', 'bar']), hash_1.hash(['bar', 'foo']));
            assert.notEqual(hash_1.hash(['foo', 'bar']), hash_1.hash(['bar', 'foo', null]));
        });
        test('object', function () {
            assert.equal(hash_1.hash({}), hash_1.hash({}));
            assert.equal(hash_1.hash({ 'foo': 'bar' }), hash_1.hash({ 'foo': 'bar' }));
            assert.equal(hash_1.hash({ 'foo': 'bar', 'foo2': void 0 }), hash_1.hash({ 'foo2': void 0, 'foo': 'bar' }));
            assert.notEqual(hash_1.hash({ 'foo': 'bar' }), hash_1.hash({ 'foo': 'bar2' }));
            assert.notEqual(hash_1.hash({}), hash_1.hash([]));
        });
    });
});
