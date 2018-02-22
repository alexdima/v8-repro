define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/paths"], function (require, exports, assert, uri_1, resources_1, paths_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Resources', function () {
        test('distinctParents', function () {
            // Basic
            var resources = [
                uri_1.default.file('/some/folderA/file.txt'),
                uri_1.default.file('/some/folderB/file.txt'),
                uri_1.default.file('/some/folderC/file.txt')
            ];
            var distinct = resources_1.distinctParents(resources, function (r) { return r; });
            assert.equal(distinct.length, 3);
            assert.equal(distinct[0].toString(), resources[0].toString());
            assert.equal(distinct[1].toString(), resources[1].toString());
            assert.equal(distinct[2].toString(), resources[2].toString());
            // Parent / Child
            resources = [
                uri_1.default.file('/some/folderA'),
                uri_1.default.file('/some/folderA/file.txt'),
                uri_1.default.file('/some/folderA/child/file.txt'),
                uri_1.default.file('/some/folderA2/file.txt'),
                uri_1.default.file('/some/file.txt')
            ];
            distinct = resources_1.distinctParents(resources, function (r) { return r; });
            assert.equal(distinct.length, 3);
            assert.equal(distinct[0].toString(), resources[0].toString());
            assert.equal(distinct[1].toString(), resources[3].toString());
            assert.equal(distinct[2].toString(), resources[4].toString());
        });
        test('dirname', function (done) {
            var f = uri_1.default.file('/some/file/test.txt');
            var d = resources_1.dirname(f);
            assert.equal(d.fsPath, paths_1.normalize('/some/file', true));
            // does not explode (https://github.com/Microsoft/vscode/issues/41987)
            resources_1.dirname(uri_1.default.from({ scheme: 'file', authority: '/users/someone/portal.h' }));
            done();
        });
    });
});
