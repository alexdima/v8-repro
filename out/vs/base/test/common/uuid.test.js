define(["require", "exports", "assert", "vs/base/common/uuid"], function (require, exports, assert, uuid) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('UUID', function () {
        test('generation', function () {
            var asHex = uuid.v4().asHex();
            assert.equal(asHex.length, 36);
            assert.equal(asHex[14], '4');
            assert.ok(asHex[19] === '8' || asHex[19] === '9' || asHex[19] === 'a' || asHex[19] === 'b');
        });
        test('parse', function () {
            var id = uuid.v4();
            var asHext = id.asHex();
            var id2 = uuid.parse(asHext);
            assert.equal(id.asHex(), id2.asHex());
        });
    });
});
