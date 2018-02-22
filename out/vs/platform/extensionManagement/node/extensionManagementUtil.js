/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "semver", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, semver, extensionManagementUtil_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getIdAndVersionFromLocalExtensionId(localExtensionId) {
        var matches = extensionManagementUtil_1.LOCAL_EXTENSION_ID_REGEX.exec(localExtensionId);
        if (matches && matches[1] && matches[2]) {
            var version = semver.valid(matches[2]);
            if (version) {
                return { id: extensionManagementUtil_1.adoptToGalleryExtensionId(matches[1]), version: version };
            }
        }
        return {
            id: extensionManagementUtil_1.adoptToGalleryExtensionId(localExtensionId),
            version: null
        };
    }
    exports.getIdAndVersionFromLocalExtensionId = getIdAndVersionFromLocalExtensionId;
});
