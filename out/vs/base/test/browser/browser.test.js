define(["require", "exports", "assert", "vs/base/common/platform"], function (require, exports, assert, platform_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Browsers', function () {
        test('all', function () {
            assert(!(platform_1.isWindows && platform_1.isMacintosh));
        });
    });
});
