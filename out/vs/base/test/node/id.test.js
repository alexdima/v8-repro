define(["require", "exports", "assert", "vs/base/node/id"], function (require, exports, assert, id_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ID', function () {
        test('getMachineId', function () {
            return id_1.getMachineId().then(function (id) {
                assert.ok(id);
            });
        });
    });
});
