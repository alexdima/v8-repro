define(["require", "exports", "assert", "vs/platform/environment/node/argv"], function (require, exports, assert, argv_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('formatOptions', function () {
        test('Text should display small columns correctly', function () {
            assert.equal(argv_1.formatOptions({ 'foo': 'bar' }, 80), '  foo bar');
            assert.equal(argv_1.formatOptions({
                'f': 'bar',
                'fo': 'ba',
                'foo': 'b'
            }, 80), '  f   bar\n' +
                '  fo  ba\n' +
                '  foo b');
        });
        test('Text should wrap', function () {
            assert.equal(argv_1.formatOptions({
                'foo': 'bar '.repeat(9)
            }, 40), '  foo bar bar bar bar bar bar bar bar\n' +
                '      bar');
        });
        test('Text should revert to the condensed view when the terminal is too narrow', function () {
            assert.equal(argv_1.formatOptions({
                'foo': 'bar '.repeat(9)
            }, 30), '  foo\n' +
                '      bar bar bar bar bar bar bar bar bar ');
        });
    });
});
