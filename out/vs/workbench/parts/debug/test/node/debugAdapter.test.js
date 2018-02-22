/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/paths", "vs/base/common/platform", "vs/workbench/parts/debug/node/debugAdapter", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/common/winjs.base"], function (require, exports, assert, paths, platform, debugAdapter_1, testConfigurationService_1, winjs_base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Adapter', function () {
        var adapter;
        var extensionFolderPath = 'a/b/c/';
        var rawAdapter = {
            type: 'mock',
            label: 'Mock Debug',
            enableBreakpointsFor: { 'languageIds': ['markdown'] },
            program: './out/mock/mockDebug.js',
            args: ['arg1', 'arg2'],
            configurationAttributes: {
                launch: {
                    required: ['program'],
                    properties: {
                        program: {
                            'type': 'string',
                            'description': 'Workspace relative path to a text file.',
                            'default': 'readme.md'
                        }
                    }
                }
            },
            variables: null,
            initialConfigurations: [
                {
                    name: 'Mock-Debug',
                    type: 'mock',
                    request: 'launch',
                    program: 'readme.md'
                }
            ]
        };
        var configurationManager = {
            debugAdapterExecutable: function (folderUri, type) {
                return winjs_base_1.TPromise.as(undefined);
            }
        };
        setup(function () {
            adapter = new debugAdapter_1.Adapter(configurationManager, rawAdapter, { extensionFolderPath: extensionFolderPath, id: 'adapter', name: 'myAdapter', version: '1.0.0', publisher: 'vscode', isBuiltin: false, engines: null }, new testConfigurationService_1.TestConfigurationService(), null);
        });
        teardown(function () {
            adapter = null;
        });
        test('attributes', function () {
            assert.equal(adapter.type, rawAdapter.type);
            assert.equal(adapter.label, rawAdapter.label);
            return adapter.getAdapterExecutable(undefined, false).then(function (details) {
                assert.equal(details.command, paths.join(extensionFolderPath, rawAdapter.program));
                assert.deepEqual(details.args, rawAdapter.args);
            });
        });
        test('schema attributes', function () {
            var schemaAttribute = adapter.getSchemaAttributes()[0];
            assert.notDeepEqual(schemaAttribute, rawAdapter.configurationAttributes);
            Object.keys(rawAdapter.configurationAttributes.launch).forEach(function (key) {
                assert.deepEqual(schemaAttribute[key], rawAdapter.configurationAttributes.launch[key]);
            });
            assert.equal(schemaAttribute['additionalProperties'], false);
            assert.equal(!!schemaAttribute['properties']['request'], true);
            assert.equal(!!schemaAttribute['properties']['name'], true);
            assert.equal(!!schemaAttribute['properties']['type'], true);
            assert.equal(!!schemaAttribute['properties']['preLaunchTask'], true);
        });
        test('merge', function () {
            var da = {
                type: 'mock',
                win: {
                    runtime: 'winRuntime'
                },
                linux: {
                    runtime: 'linuxRuntime'
                },
                osx: {
                    runtime: 'osxRuntime'
                },
                runtimeArgs: ['first arg'],
                program: 'mockprogram',
                args: ['arg']
            };
            adapter.merge(da, {
                name: 'my name',
                id: 'my_id',
                version: '1.0',
                publisher: 'mockPublisher',
                isBuiltin: true,
                extensionFolderPath: 'a/b/c/d',
                engines: null
            });
            return adapter.getAdapterExecutable(undefined, false).then(function (details) {
                assert.equal(details.command, platform.isLinux ? da.linux.runtime : platform.isMacintosh ? da.osx.runtime : da.win.runtime);
                assert.deepEqual(details.args, da.runtimeArgs.concat(['a/b/c/d/mockprogram'].concat(da.args)));
            });
        });
        test('initial config file content', function () {
            var expected = ['{',
                '	// Use IntelliSense to learn about possible attributes.',
                '	// Hover to view descriptions of existing attributes.',
                '	// For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387',
                '	"version": "0.2.0",',
                '	"configurations": [',
                '		{',
                '			"name": "Mock-Debug",',
                '			"type": "mock",',
                '			"request": "launch",',
                '			"program": "readme.md"',
                '		}',
                '	]',
                '}'].join('\n');
            return adapter.getInitialConfigurationContent().then(function (content) {
                assert.equal(content, expected);
            }, function (err) { return assert.fail(); });
        });
    });
});
