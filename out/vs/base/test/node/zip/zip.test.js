/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "path", "os", "vs/base/common/uri", "vs/base/node/zip", "vs/base/common/uuid", "vs/base/node/pfs"], function (require, exports, assert, path, os, uri_1, zip_1, uuid_1, pfs_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var fixtures = uri_1.default.parse(require.toUrl('./fixtures')).fsPath;
    suite('Zip', function () {
        test('extract should handle directories', function () {
            var fixture = path.join(fixtures, 'extract.zip');
            var target = path.join(os.tmpdir(), uuid_1.generateUuid());
            return zip_1.extract(fixture, target)
                .then(function () { return pfs_1.exists(path.join(target, 'extension')); })
                .then(function (exists) { return assert(exists); })
                .then(function () { return pfs_1.rimraf(target); });
        });
    });
});
