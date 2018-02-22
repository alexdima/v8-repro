define(["require", "exports", "assert", "path", "vs/platform/environment/node/argv", "vs/platform/environment/node/environmentService"], function (require, exports, assert, path, argv_1, environmentService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EnvironmentService', function () {
        test('parseExtensionHostPort when built', function () {
            var parse = function (a) { return environmentService_1.parseExtensionHostPort(argv_1.parseArgs(a), true); };
            assert.deepEqual(parse([]), { port: null, break: false, debugId: undefined });
            assert.deepEqual(parse(['--debugPluginHost']), { port: null, break: false, debugId: undefined });
            assert.deepEqual(parse(['--debugPluginHost=1234']), { port: 1234, break: false, debugId: undefined });
            assert.deepEqual(parse(['--debugBrkPluginHost']), { port: null, break: false, debugId: undefined });
            assert.deepEqual(parse(['--debugBrkPluginHost=5678']), { port: 5678, break: true, debugId: undefined });
            assert.deepEqual(parse(['--debugPluginHost=1234', '--debugBrkPluginHost=5678', '--debugId=7']), { port: 5678, break: true, debugId: '7' });
        });
        test('parseExtensionHostPort when unbuilt', function () {
            var parse = function (a) { return environmentService_1.parseExtensionHostPort(argv_1.parseArgs(a), false); };
            assert.deepEqual(parse([]), { port: 5870, break: false, debugId: undefined });
            assert.deepEqual(parse(['--debugPluginHost']), { port: 5870, break: false, debugId: undefined });
            assert.deepEqual(parse(['--debugPluginHost=1234']), { port: 1234, break: false, debugId: undefined });
            assert.deepEqual(parse(['--debugBrkPluginHost']), { port: 5870, break: false, debugId: undefined });
            assert.deepEqual(parse(['--debugBrkPluginHost=5678']), { port: 5678, break: true, debugId: undefined });
            assert.deepEqual(parse(['--debugPluginHost=1234', '--debugBrkPluginHost=5678', '--debugId=7']), { port: 5678, break: true, debugId: '7' });
        });
        test('userDataPath', function () {
            var parse = function (a, b) { return environmentService_1.parseUserDataDir(argv_1.parseArgs(a), b); };
            assert.equal(parse(['--user-data-dir', './dir'], { cwd: function () { return '/foo'; }, env: {} }), path.resolve('/foo/dir'), 'should use cwd when --user-data-dir is specified');
            assert.equal(parse(['--user-data-dir', './dir'], { cwd: function () { return '/foo'; }, env: { 'VSCODE_CWD': '/bar' } }), path.resolve('/bar/dir'), 'should use VSCODE_CWD as the cwd when --user-data-dir is specified');
        });
    });
});
