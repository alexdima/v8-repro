/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects"], function (require, exports, objects_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nlsRegex = /^%([\w\d.-]+)%$/i;
    function localizeManifest(manifest, translations) {
        var patcher = function (value) {
            if (typeof value !== 'string') {
                return undefined;
            }
            var match = nlsRegex.exec(value);
            if (!match) {
                return undefined;
            }
            return translations[match[1]] || value;
        };
        return objects_1.cloneAndChange(manifest, patcher);
    }
    exports.localizeManifest = localizeManifest;
});
