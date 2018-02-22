/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "path", "vs/base/node/extfs", "vs/workbench/test/workbenchTestServices", "vs/base/node/extfs", "vs/platform/state/node/stateService"], function (require, exports, assert, os, path, extfs, workbenchTestServices_1, extfs_1, stateService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StateService', function () {
        var parentDir = workbenchTestServices_1.getRandomTestPath(os.tmpdir(), 'vsctests', 'stateservice');
        var storageFile = path.join(parentDir, 'storage.json');
        teardown(function (done) {
            extfs.del(parentDir, os.tmpdir(), done);
        });
        test('Basics', function (done) {
            return extfs_1.mkdirp(parentDir).then(function () {
                extfs_1.writeFileAndFlushSync(storageFile, '');
                var service = new stateService_1.FileStorage(storageFile, function () { return null; });
                service.setItem('some.key', 'some.value');
                assert.equal(service.getItem('some.key'), 'some.value');
                service.removeItem('some.key');
                assert.equal(service.getItem('some.key', 'some.default'), 'some.default');
                assert.ok(!service.getItem('some.unknonw.key'));
                service.setItem('some.other.key', 'some.other.value');
                service = new stateService_1.FileStorage(storageFile, function () { return null; });
                assert.equal(service.getItem('some.other.key'), 'some.other.value');
                service.setItem('some.other.key', 'some.other.value');
                assert.equal(service.getItem('some.other.key'), 'some.other.value');
                service.setItem('some.undefined.key', void 0);
                assert.equal(service.getItem('some.undefined.key', 'some.default'), 'some.default');
                service.setItem('some.null.key', null);
                assert.equal(service.getItem('some.null.key', 'some.default'), 'some.default');
                done();
            });
        });
    });
});
