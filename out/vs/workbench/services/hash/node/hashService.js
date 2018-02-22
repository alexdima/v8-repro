/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "crypto"], function (require, exports, crypto_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var HashService = /** @class */ (function () {
        function HashService() {
        }
        HashService.prototype.createSHA1 = function (content) {
            return crypto_1.createHash('sha1').update(content).digest('hex');
        };
        return HashService;
    }());
    exports.HashService = HashService;
});
