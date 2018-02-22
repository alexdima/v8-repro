/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getByName(root, name) {
        for (var i = 0; i < root.children.length; i++) {
            if (root.children[i].name === name) {
                return root.children[i];
            }
        }
        return null;
    }
    exports.getByName = getByName;
});
