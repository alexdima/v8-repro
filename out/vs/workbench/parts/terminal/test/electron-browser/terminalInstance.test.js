/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "assert", "os", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/message/common/message", "vs/platform/workspace/common/workspace", "vs/workbench/parts/terminal/electron-browser/terminalInstance", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/test/workbenchTestServices", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/history/common/history", "vs/base/common/winjs.base", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration"], function (require, exports, assert, os, platform, uri_1, message_1, workspace_1, terminalInstance_1, instantiationServiceMock_1, workbenchTestServices_1, mockKeybindingService_1, keybinding_1, contextkey_1, history_1, winjs_base_1, testConfigurationService_1, configuration_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestTerminalInstance = /** @class */ (function (_super) {
        __extends(TestTerminalInstance, _super);
        function TestTerminalInstance() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TestTerminalInstance.prototype._getCwd = function (shell, root) {
            return _super.prototype._getCwd.call(this, shell, root);
        };
        TestTerminalInstance.prototype._createProcess = function () { };
        TestTerminalInstance.prototype._createXterm = function () { return winjs_base_1.TPromise.as(void 0); };
        return TestTerminalInstance;
    }(terminalInstance_1.TerminalInstance));
    suite('Workbench - TerminalInstance', function () {
        var instantiationService;
        setup(function () {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(message_1.IMessageService, new workbenchTestServices_1.TestMessageService());
            instantiationService.stub(history_1.IHistoryService, new workbenchTestServices_1.TestHistoryService());
        });
        test('createTerminalEnv', function () {
            var shell1 = {
                executable: '/bin/foosh',
                args: ['-bar', 'baz']
            };
            var parentEnv1 = {
                ok: true
            };
            var env1 = terminalInstance_1.TerminalInstance.createTerminalEnv(parentEnv1, shell1, '/foo', 'en-au');
            assert.ok(env1['ok'], 'Parent environment is copied');
            assert.deepStrictEqual(parentEnv1, { ok: true }, 'Parent environment is unchanged');
            assert.equal(env1['PTYPID'], process.pid.toString(), 'PTYPID is equal to the current PID');
            assert.equal(env1['PTYSHELL'], '/bin/foosh', 'PTYSHELL is equal to the provided shell');
            assert.equal(env1['PTYSHELLARG0'], '-bar', 'PTYSHELLARG0 is equal to the first shell argument');
            assert.equal(env1['PTYSHELLARG1'], 'baz', 'PTYSHELLARG1 is equal to the first shell argument');
            assert.ok(!('PTYSHELLARG2' in env1), 'PTYSHELLARG2 is unset');
            assert.equal(env1['PTYCWD'], '/foo', 'PTYCWD is equal to requested cwd');
            assert.equal(env1['LANG'], 'en_AU.UTF-8', 'LANG is equal to the requested locale with UTF-8');
            var shell2 = {
                executable: '/bin/foosh',
                args: []
            };
            var parentEnv2 = {
                LANG: 'en_US.UTF-8'
            };
            var env2 = terminalInstance_1.TerminalInstance.createTerminalEnv(parentEnv2, shell2, '/foo', 'en-au');
            assert.ok(!('PTYSHELLARG0' in env2), 'PTYSHELLARG0 is unset');
            assert.equal(env2['PTYCWD'], '/foo', 'PTYCWD is equal to /foo');
            assert.equal(env2['LANG'], 'en_AU.UTF-8', 'LANG is equal to the requested locale with UTF-8');
            var env3 = terminalInstance_1.TerminalInstance.createTerminalEnv(parentEnv1, shell1, '/', null);
            assert.equal(env3['LANG'], 'en_US.UTF-8', 'LANG is equal to en_US.UTF-8 as fallback.'); // More info on issue #14586
            var env4 = terminalInstance_1.TerminalInstance.createTerminalEnv(parentEnv2, shell1, '/', null);
            assert.equal(env4['LANG'], 'en_US.UTF-8', 'LANG is equal to the parent environment\'s LANG');
        });
        suite('mergeEnvironments', function () {
            test('should add keys', function () {
                var parent = {
                    a: 'b'
                };
                var other = {
                    c: 'd'
                };
                terminalInstance_1.TerminalInstance.mergeEnvironments(parent, other);
                assert.deepEqual(parent, {
                    a: 'b',
                    c: 'd'
                });
            });
            test('should add keys ignoring case on Windows', function () {
                if (!platform.isWindows) {
                    return;
                }
                var parent = {
                    a: 'b'
                };
                var other = {
                    A: 'c'
                };
                terminalInstance_1.TerminalInstance.mergeEnvironments(parent, other);
                assert.deepEqual(parent, {
                    a: 'c'
                });
            });
            test('null values should delete keys from the parent env', function () {
                var parent = {
                    a: 'b',
                    c: 'd'
                };
                var other = {
                    a: null
                };
                terminalInstance_1.TerminalInstance.mergeEnvironments(parent, other);
                assert.deepEqual(parent, {
                    c: 'd'
                });
            });
            test('null values should delete keys from the parent env ignoring case on Windows', function () {
                if (!platform.isWindows) {
                    return;
                }
                var parent = {
                    a: 'b',
                    c: 'd'
                };
                var other = {
                    A: null
                };
                terminalInstance_1.TerminalInstance.mergeEnvironments(parent, other);
                assert.deepEqual(parent, {
                    c: 'd'
                });
            });
        });
        suite('_getCwd', function () {
            var instance;
            var instantiationService;
            var configHelper;
            setup(function () {
                var contextKeyService = new mockKeybindingService_1.MockContextKeyService();
                var keybindingService = new mockKeybindingService_1.MockKeybindingService();
                var terminalFocusContextKey = contextKeyService.createKey('test', false);
                instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
                instantiationService.stub(message_1.IMessageService, new workbenchTestServices_1.TestMessageService());
                instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
                instantiationService.stub(keybinding_1.IKeybindingService, keybindingService);
                instantiationService.stub(contextkey_1.IContextKeyService, contextKeyService);
                instantiationService.stub(history_1.IHistoryService, new workbenchTestServices_1.TestHistoryService());
                configHelper = {
                    config: {
                        cwd: null
                    }
                };
                instance = instantiationService.createInstance(TestTerminalInstance, terminalFocusContextKey, configHelper, null, null);
            });
            // This helper checks the paths in a cross-platform friendly manner
            function assertPathsMatch(a, b) {
                assert.equal(uri_1.default.file(a).fsPath, uri_1.default.file(b).fsPath);
            }
            test('should default to os.homedir() for an empty workspace', function () {
                assertPathsMatch(instance._getCwd({ executable: null, args: [] }, null), os.homedir());
            });
            test('should use to the workspace if it exists', function () {
                assertPathsMatch(instance._getCwd({ executable: null, args: [] }, uri_1.default.file('/foo')), '/foo');
            });
            test('should use an absolute custom cwd as is', function () {
                configHelper.config.cwd = '/foo';
                assertPathsMatch(instance._getCwd({ executable: null, args: [] }, null), '/foo');
            });
            test('should normalize a relative custom cwd against the workspace path', function () {
                configHelper.config.cwd = 'foo';
                assertPathsMatch(instance._getCwd({ executable: null, args: [] }, uri_1.default.file('/bar')), '/bar/foo');
                configHelper.config.cwd = './foo';
                assertPathsMatch(instance._getCwd({ executable: null, args: [] }, uri_1.default.file('/bar')), '/bar/foo');
                configHelper.config.cwd = '../foo';
                assertPathsMatch(instance._getCwd({ executable: null, args: [] }, uri_1.default.file('/bar')), '/foo');
            });
            test('should fall back for relative a custom cwd that doesn\'t have a workspace', function () {
                configHelper.config.cwd = 'foo';
                assertPathsMatch(instance._getCwd({ executable: null, args: [] }, null), os.homedir());
                configHelper.config.cwd = './foo';
                assertPathsMatch(instance._getCwd({ executable: null, args: [] }, null), os.homedir());
                configHelper.config.cwd = '../foo';
                assertPathsMatch(instance._getCwd({ executable: null, args: [] }, null), os.homedir());
            });
            test('should ignore custom cwd when told to ignore', function () {
                configHelper.config.cwd = '/foo';
                assertPathsMatch(instance._getCwd({ executable: null, args: [], ignoreConfigurationCwd: true }, uri_1.default.file('/bar')), '/bar');
            });
        });
    });
});
