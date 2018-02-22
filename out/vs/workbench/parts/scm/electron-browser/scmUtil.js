/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function isSCMResource(element) {
        return !!element.sourceUri;
    }
    exports.isSCMResource = isSCMResource;
    function getSCMResourceContextKey(resource) {
        return isSCMResource(resource) ? resource.resourceGroup.id : resource.id;
    }
    exports.getSCMResourceContextKey = getSCMResourceContextKey;
});
