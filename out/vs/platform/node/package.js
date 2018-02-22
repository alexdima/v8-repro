/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "path", "vs/base/common/uri"], function (require, exports, path, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var packageJSONContents = null;
    if (typeof MonacoSnapshotPackage !== 'undefined') {
        packageJSONContents = MonacoSnapshotPackage;
    }
    else {
        var rootPath = path.dirname(uri_1.default.parse(require.toUrl('')).fsPath);
        var packageJsonPath = path.join(rootPath, 'package.json');
        packageJSONContents = require.__$__nodeRequire(packageJsonPath);
    }
    exports.default = packageJSONContents;
});
