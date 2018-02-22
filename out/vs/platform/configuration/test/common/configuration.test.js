define(["require", "exports", "assert", "vs/platform/configuration/common/configuration"], function (require, exports, assert, configuration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Configuration', function () {
        test('simple merge', function () {
            var base = { 'a': 1, 'b': 2 };
            configuration_1.merge(base, { 'a': 3, 'c': 4 }, true);
            assert.deepEqual(base, { 'a': 3, 'b': 2, 'c': 4 });
            base = { 'a': 1, 'b': 2 };
            configuration_1.merge(base, { 'a': 3, 'c': 4 }, false);
            assert.deepEqual(base, { 'a': 1, 'b': 2, 'c': 4 });
        });
        test('removeFromValueTree: remove a non existing key', function () {
            var target = { 'a': { 'b': 2 } };
            configuration_1.removeFromValueTree(target, 'c');
            assert.deepEqual(target, { 'a': { 'b': 2 } });
        });
        test('removeFromValueTree: remove a multi segmented key from an object that has only sub sections of the key', function () {
            var target = { 'a': { 'b': 2 } };
            configuration_1.removeFromValueTree(target, 'a.b.c');
            assert.deepEqual(target, { 'a': { 'b': 2 } });
        });
        test('removeFromValueTree: remove a single segemented key', function () {
            var target = { 'a': 1 };
            configuration_1.removeFromValueTree(target, 'a');
            assert.deepEqual(target, {});
        });
        test('removeFromValueTree: remove a single segemented key when its value is undefined', function () {
            var target = { 'a': void 0 };
            configuration_1.removeFromValueTree(target, 'a');
            assert.deepEqual(target, {});
        });
        test('removeFromValueTree: remove a multi segemented key when its value is undefined', function () {
            var target = { 'a': { 'b': 1 } };
            configuration_1.removeFromValueTree(target, 'a.b');
            assert.deepEqual(target, {});
        });
        test('removeFromValueTree: remove a multi segemented key when its value is array', function () {
            var target = { 'a': { 'b': [1] } };
            configuration_1.removeFromValueTree(target, 'a.b');
            assert.deepEqual(target, {});
        });
        test('removeFromValueTree: remove a multi segemented key first segment value is array', function () {
            var target = { 'a': [1] };
            configuration_1.removeFromValueTree(target, 'a.0');
            assert.deepEqual(target, { 'a': [1] });
        });
        test('removeFromValueTree: remove when key is the first segmenet', function () {
            var target = { 'a': { 'b': 1 } };
            configuration_1.removeFromValueTree(target, 'a');
            assert.deepEqual(target, {});
        });
        test('removeFromValueTree: remove a multi segemented key when the first node has more values', function () {
            var target = { 'a': { 'b': { 'c': 1 }, 'd': 1 } };
            configuration_1.removeFromValueTree(target, 'a.b.c');
            assert.deepEqual(target, { 'a': { 'd': 1 } });
        });
        test('removeFromValueTree: remove a multi segemented key when in between node has more values', function () {
            var target = { 'a': { 'b': { 'c': { 'd': 1 }, 'd': 1 } } };
            configuration_1.removeFromValueTree(target, 'a.b.c.d');
            assert.deepEqual(target, { 'a': { 'b': { 'd': 1 } } });
        });
        test('removeFromValueTree: remove a multi segemented key when the last but one node has more values', function () {
            var target = { 'a': { 'b': { 'c': 1, 'd': 1 } } };
            configuration_1.removeFromValueTree(target, 'a.b.c');
            assert.deepEqual(target, { 'a': { 'b': { 'd': 1 } } });
        });
    });
});
