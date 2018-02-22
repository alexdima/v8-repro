define(["require", "exports", "assert", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, assert, extensionManagement_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Extension Identifier Pattern', function () {
        test('extension identifier pattern', function () {
            var regEx = new RegExp(extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN);
            assert.equal(true, regEx.test('publisher.name'));
            assert.equal(true, regEx.test('publiSher.name'));
            assert.equal(true, regEx.test('publisher.Name'));
            assert.equal(true, regEx.test('PUBLISHER.NAME'));
            assert.equal(true, regEx.test('PUBLISHEr.NAMe'));
            assert.equal(true, regEx.test('PUBLISHEr.N-AMe'));
            assert.equal(true, regEx.test('PUBLISH12Er90.N-A54Me123'));
            assert.equal(true, regEx.test('111PUBLISH12Er90.N-1111A54Me123'));
            assert.equal(false, regEx.test('publishername'));
            assert.equal(false, regEx.test('-publisher.name'));
            assert.equal(false, regEx.test('publisher.-name'));
            assert.equal(false, regEx.test('-publisher.-name'));
            assert.equal(false, regEx.test('publ_isher.name'));
            assert.equal(false, regEx.test('publisher._name'));
        });
    });
});
