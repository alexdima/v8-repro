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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/node/extHostWorkspace", "vs/workbench/api/node/extHostConfiguration", "vs/base/common/winjs.base", "vs/platform/configuration/common/configurationModels", "./testRPCProtocol", "vs/workbench/test/electron-browser/api/mock", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration"], function (require, exports, assert, uri_1, extHostWorkspace_1, extHostConfiguration_1, winjs_base_1, configurationModels_1, testRPCProtocol_1, mock_1, workspace_1, configuration_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostConfiguration', function () {
        var RecordingShape = /** @class */ (function (_super) {
            __extends(RecordingShape, _super);
            function RecordingShape() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            RecordingShape.prototype.$updateConfigurationOption = function (target, key, value) {
                this.lastArgs = [target, key, value];
                return winjs_base_1.TPromise.as(void 0);
            };
            return RecordingShape;
        }(mock_1.mock()));
        function createExtHostConfiguration(contents, shape) {
            if (contents === void 0) { contents = Object.create(null); }
            if (!shape) {
                shape = new /** @class */ (function (_super) {
                    __extends(class_1, _super);
                    function class_1() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return class_1;
                }(mock_1.mock()));
            }
            return new extHostConfiguration_1.ExtHostConfiguration(shape, new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), null), createConfigurationData(contents));
        }
        function createConfigurationData(contents) {
            return {
                defaults: new configurationModels_1.ConfigurationModel(contents),
                user: new configurationModels_1.ConfigurationModel(contents),
                workspace: new configurationModels_1.ConfigurationModel(),
                folders: Object.create(null),
                configurationScopes: {}
            };
        }
        test('getConfiguration fails regression test 1.7.1 -> 1.8 #15552', function () {
            var extHostConfig = createExtHostConfiguration({
                'search': {
                    'exclude': {
                        '**/node_modules': true
                    }
                }
            });
            assert.equal(extHostConfig.getConfiguration('search.exclude')['**/node_modules'], true);
            assert.equal(extHostConfig.getConfiguration('search.exclude').get('**/node_modules'), true);
            assert.equal(extHostConfig.getConfiguration('search').get('exclude')['**/node_modules'], true);
            assert.equal(extHostConfig.getConfiguration('search.exclude').has('**/node_modules'), true);
            assert.equal(extHostConfig.getConfiguration('search').has('exclude.**/node_modules'), true);
        });
        test('has/get', function () {
            var all = createExtHostConfiguration({
                'farboo': {
                    'config0': true,
                    'nested': {
                        'config1': 42,
                        'config2': 'Das Pferd frisst kein Reis.'
                    },
                    'config4': ''
                }
            });
            var config = all.getConfiguration('farboo');
            assert.ok(config.has('config0'));
            assert.equal(config.get('config0'), true);
            assert.equal(config.get('config4'), '');
            assert.equal(config['config0'], true);
            assert.equal(config['config4'], '');
            assert.ok(config.has('nested.config1'));
            assert.equal(config.get('nested.config1'), 42);
            assert.ok(config.has('nested.config2'));
            assert.equal(config.get('nested.config2'), 'Das Pferd frisst kein Reis.');
            assert.ok(config.has('nested'));
            assert.deepEqual(config.get('nested'), { config1: 42, config2: 'Das Pferd frisst kein Reis.' });
        });
        test('can modify the returned configuration', function () {
            var all = createExtHostConfiguration({
                'farboo': {
                    'config0': true,
                    'nested': {
                        'config1': 42,
                        'config2': 'Das Pferd frisst kein Reis.'
                    },
                    'config4': ''
                }
            });
            var testObject = all.getConfiguration();
            var actual = testObject.get('farboo');
            actual['farboo1'] = 'newValue';
            assert.equal('newValue', actual['farboo1']);
            testObject = all.getConfiguration();
            testObject['farboo']['farboo1'] = 'newValue';
            assert.equal('newValue', testObject['farboo']['farboo1']);
            testObject = all.getConfiguration();
            testObject['farboo']['farboo1'] = 'newValue';
            assert.equal('newValue', testObject.get('farboo')['farboo1']);
            testObject = all.getConfiguration();
            actual = testObject.inspect('farboo');
            actual['value'] = 'effectiveValue';
            assert.equal('effectiveValue', actual['value']);
            testObject = all.getConfiguration();
            actual = testObject.get('farboo');
            assert.equal(undefined, actual['farboo1']);
            testObject = all.getConfiguration();
            testObject['farboo']['farboo1'] = 'newValue';
            testObject = all.getConfiguration();
            assert.equal(undefined, testObject['farboo']['farboo1']);
        });
        test('inspect in no workspace context', function () {
            var testObject = new extHostConfiguration_1.ExtHostConfiguration(new /** @class */ (function (_super) {
                __extends(class_2, _super);
                function class_2() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return class_2;
            }(mock_1.mock())), new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), null), {
                defaults: new configurationModels_1.ConfigurationModel({
                    'editor': {
                        'wordWrap': 'off'
                    }
                }, ['editor.wordWrap']),
                user: new configurationModels_1.ConfigurationModel({
                    'editor': {
                        'wordWrap': 'on'
                    }
                }, ['editor.wordWrap']),
                workspace: new configurationModels_1.ConfigurationModel({}, []),
                folders: Object.create(null),
                configurationScopes: {}
            });
            var actual = testObject.getConfiguration().inspect('editor.wordWrap');
            assert.equal(actual.defaultValue, 'off');
            assert.equal(actual.globalValue, 'on');
            assert.equal(actual.workspaceValue, undefined);
            assert.equal(actual.workspaceFolderValue, undefined);
            actual = testObject.getConfiguration('editor').inspect('wordWrap');
            assert.equal(actual.defaultValue, 'off');
            assert.equal(actual.globalValue, 'on');
            assert.equal(actual.workspaceValue, undefined);
            assert.equal(actual.workspaceFolderValue, undefined);
        });
        test('inspect in single root context', function () {
            var workspaceUri = uri_1.default.file('foo');
            var folders = Object.create(null);
            var workspace = new configurationModels_1.ConfigurationModel({
                'editor': {
                    'wordWrap': 'bounded'
                }
            }, ['editor.wordWrap']);
            folders[workspaceUri.toString()] = workspace;
            var testObject = new extHostConfiguration_1.ExtHostConfiguration(new /** @class */ (function (_super) {
                __extends(class_3, _super);
                function class_3() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return class_3;
            }(mock_1.mock())), new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), {
                'id': 'foo',
                'folders': [aWorkspaceFolder(uri_1.default.file('foo'), 0)],
                'name': 'foo'
            }), {
                defaults: new configurationModels_1.ConfigurationModel({
                    'editor': {
                        'wordWrap': 'off'
                    }
                }, ['editor.wordWrap']),
                user: new configurationModels_1.ConfigurationModel({
                    'editor': {
                        'wordWrap': 'on'
                    }
                }, ['editor.wordWrap']),
                workspace: workspace,
                folders: folders,
                configurationScopes: {}
            });
            var actual1 = testObject.getConfiguration().inspect('editor.wordWrap');
            assert.equal(actual1.defaultValue, 'off');
            assert.equal(actual1.globalValue, 'on');
            assert.equal(actual1.workspaceValue, 'bounded');
            assert.equal(actual1.workspaceFolderValue, undefined);
            actual1 = testObject.getConfiguration('editor').inspect('wordWrap');
            assert.equal(actual1.defaultValue, 'off');
            assert.equal(actual1.globalValue, 'on');
            assert.equal(actual1.workspaceValue, 'bounded');
            assert.equal(actual1.workspaceFolderValue, undefined);
            var actual2 = testObject.getConfiguration(null, workspaceUri).inspect('editor.wordWrap');
            assert.equal(actual2.defaultValue, 'off');
            assert.equal(actual2.globalValue, 'on');
            assert.equal(actual2.workspaceValue, 'bounded');
            assert.equal(actual2.workspaceFolderValue, 'bounded');
            actual2 = testObject.getConfiguration('editor', workspaceUri).inspect('wordWrap');
            assert.equal(actual2.defaultValue, 'off');
            assert.equal(actual2.globalValue, 'on');
            assert.equal(actual2.workspaceValue, 'bounded');
            assert.equal(actual2.workspaceFolderValue, 'bounded');
        });
        test('inspect in multi root context', function () {
            var workspace = new configurationModels_1.ConfigurationModel({
                'editor': {
                    'wordWrap': 'bounded'
                }
            }, ['editor.wordWrap']);
            var firstRoot = uri_1.default.file('foo1');
            var secondRoot = uri_1.default.file('foo2');
            var thirdRoot = uri_1.default.file('foo3');
            var folders = Object.create(null);
            folders[firstRoot.toString()] = new configurationModels_1.ConfigurationModel({
                'editor': {
                    'wordWrap': 'off',
                    'lineNumbers': 'relative'
                }
            }, ['editor.wordWrap']);
            folders[secondRoot.toString()] = new configurationModels_1.ConfigurationModel({
                'editor': {
                    'wordWrap': 'on'
                }
            }, ['editor.wordWrap']);
            folders[thirdRoot.toString()] = new configurationModels_1.ConfigurationModel({}, []);
            var testObject = new extHostConfiguration_1.ExtHostConfiguration(new /** @class */ (function (_super) {
                __extends(class_4, _super);
                function class_4() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return class_4;
            }(mock_1.mock())), new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), {
                'id': 'foo',
                'folders': [aWorkspaceFolder(firstRoot, 0), aWorkspaceFolder(secondRoot, 1)],
                'name': 'foo'
            }), {
                defaults: new configurationModels_1.ConfigurationModel({
                    'editor': {
                        'wordWrap': 'off',
                        'lineNumbers': 'on'
                    }
                }, ['editor.wordWrap']),
                user: new configurationModels_1.ConfigurationModel({
                    'editor': {
                        'wordWrap': 'on'
                    }
                }, ['editor.wordWrap']),
                workspace: workspace,
                folders: folders,
                configurationScopes: {}
            });
            var actual1 = testObject.getConfiguration().inspect('editor.wordWrap');
            assert.equal(actual1.defaultValue, 'off');
            assert.equal(actual1.globalValue, 'on');
            assert.equal(actual1.workspaceValue, 'bounded');
            assert.equal(actual1.workspaceFolderValue, undefined);
            actual1 = testObject.getConfiguration('editor').inspect('wordWrap');
            assert.equal(actual1.defaultValue, 'off');
            assert.equal(actual1.globalValue, 'on');
            assert.equal(actual1.workspaceValue, 'bounded');
            assert.equal(actual1.workspaceFolderValue, undefined);
            actual1 = testObject.getConfiguration('editor').inspect('lineNumbers');
            assert.equal(actual1.defaultValue, 'on');
            assert.equal(actual1.globalValue, undefined);
            assert.equal(actual1.workspaceValue, undefined);
            assert.equal(actual1.workspaceFolderValue, undefined);
            var actual2 = testObject.getConfiguration(null, firstRoot).inspect('editor.wordWrap');
            assert.equal(actual2.defaultValue, 'off');
            assert.equal(actual2.globalValue, 'on');
            assert.equal(actual2.workspaceValue, 'bounded');
            assert.equal(actual2.workspaceFolderValue, 'off');
            actual2 = testObject.getConfiguration('editor', firstRoot).inspect('wordWrap');
            assert.equal(actual2.defaultValue, 'off');
            assert.equal(actual2.globalValue, 'on');
            assert.equal(actual2.workspaceValue, 'bounded');
            assert.equal(actual2.workspaceFolderValue, 'off');
            actual2 = testObject.getConfiguration('editor', firstRoot).inspect('lineNumbers');
            assert.equal(actual2.defaultValue, 'on');
            assert.equal(actual2.globalValue, undefined);
            assert.equal(actual2.workspaceValue, undefined);
            assert.equal(actual2.workspaceFolderValue, 'relative');
            actual2 = testObject.getConfiguration(null, secondRoot).inspect('editor.wordWrap');
            assert.equal(actual2.defaultValue, 'off');
            assert.equal(actual2.globalValue, 'on');
            assert.equal(actual2.workspaceValue, 'bounded');
            assert.equal(actual2.workspaceFolderValue, 'on');
            actual2 = testObject.getConfiguration('editor', secondRoot).inspect('wordWrap');
            assert.equal(actual2.defaultValue, 'off');
            assert.equal(actual2.globalValue, 'on');
            assert.equal(actual2.workspaceValue, 'bounded');
            assert.equal(actual2.workspaceFolderValue, 'on');
            actual2 = testObject.getConfiguration(null, thirdRoot).inspect('editor.wordWrap');
            assert.equal(actual2.defaultValue, 'off');
            assert.equal(actual2.globalValue, 'on');
            assert.equal(actual2.workspaceValue, 'bounded');
            assert.ok(Object.keys(actual2).indexOf('workspaceFolderValue') !== -1);
            assert.equal(actual2.workspaceFolderValue, undefined);
            actual2 = testObject.getConfiguration('editor', thirdRoot).inspect('wordWrap');
            assert.equal(actual2.defaultValue, 'off');
            assert.equal(actual2.globalValue, 'on');
            assert.equal(actual2.workspaceValue, 'bounded');
            assert.ok(Object.keys(actual2).indexOf('workspaceFolderValue') !== -1);
            assert.equal(actual2.workspaceFolderValue, undefined);
        });
        test('getConfiguration vs get', function () {
            var all = createExtHostConfiguration({
                'farboo': {
                    'config0': true,
                    'config4': 38
                }
            });
            var config = all.getConfiguration('farboo.config0');
            assert.equal(config.get(''), undefined);
            assert.equal(config.has(''), false);
            config = all.getConfiguration('farboo');
            assert.equal(config.get('config0'), true);
            assert.equal(config.has('config0'), true);
        });
        test('getConfiguration vs get', function () {
            var all = createExtHostConfiguration({
                'farboo': {
                    'config0': true,
                    'config4': 38
                }
            });
            var config = all.getConfiguration('farboo.config0');
            assert.equal(config.get(''), undefined);
            assert.equal(config.has(''), false);
            config = all.getConfiguration('farboo');
            assert.equal(config.get('config0'), true);
            assert.equal(config.has('config0'), true);
        });
        test('name vs property', function () {
            var all = createExtHostConfiguration({
                'farboo': {
                    'get': 'get-prop'
                }
            });
            var config = all.getConfiguration('farboo');
            assert.ok(config.has('get'));
            assert.equal(config.get('get'), 'get-prop');
            assert.deepEqual(config['get'], config.get);
            assert.throws(function () { return config['get'] = 'get-prop'; });
        });
        test('update: no target passes null', function () {
            var shape = new RecordingShape();
            var allConfig = createExtHostConfiguration({
                'foo': {
                    'bar': 1,
                    'far': 1
                }
            }, shape);
            var config = allConfig.getConfiguration('foo');
            config.update('bar', 42);
            assert.equal(shape.lastArgs[0], null);
        });
        test('update/section to key', function () {
            var shape = new RecordingShape();
            var allConfig = createExtHostConfiguration({
                'foo': {
                    'bar': 1,
                    'far': 1
                }
            }, shape);
            var config = allConfig.getConfiguration('foo');
            config.update('bar', 42, true);
            assert.equal(shape.lastArgs[0], configuration_1.ConfigurationTarget.USER);
            assert.equal(shape.lastArgs[1], 'foo.bar');
            assert.equal(shape.lastArgs[2], 42);
            config = allConfig.getConfiguration('');
            config.update('bar', 42, true);
            assert.equal(shape.lastArgs[1], 'bar');
            config.update('foo.bar', 42, true);
            assert.equal(shape.lastArgs[1], 'foo.bar');
        });
        test('update, what is #15834', function () {
            var shape = new RecordingShape();
            var allConfig = createExtHostConfiguration({
                'editor': {
                    'formatOnSave': true
                }
            }, shape);
            allConfig.getConfiguration('editor').update('formatOnSave', { extensions: ['ts'] });
            assert.equal(shape.lastArgs[1], 'editor.formatOnSave');
            assert.deepEqual(shape.lastArgs[2], { extensions: ['ts'] });
        });
        test('update/error-state not OK', function () {
            var shape = new /** @class */ (function (_super) {
                __extends(class_5, _super);
                function class_5() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_5.prototype.$updateConfigurationOption = function (target, key, value) {
                    return winjs_base_1.TPromise.wrapError(new Error('Unknown Key')); // something !== OK
                };
                return class_5;
            }(mock_1.mock()));
            return createExtHostConfiguration({}, shape)
                .getConfiguration('')
                .update('', true, false)
                .then(function () { return assert.ok(false); }, function (err) { });
        });
        test('configuration change event', function (done) {
            var workspaceFolder = aWorkspaceFolder(uri_1.default.file('folder1'), 0);
            var testObject = new extHostConfiguration_1.ExtHostConfiguration(new /** @class */ (function (_super) {
                __extends(class_6, _super);
                function class_6() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return class_6;
            }(mock_1.mock())), new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), {
                'id': 'foo',
                'folders': [workspaceFolder],
                'name': 'foo'
            }), createConfigurationData({
                'farboo': {
                    'config': false,
                    'updatedconfig': false
                }
            }));
            var newConfigData = createConfigurationData({
                'farboo': {
                    'config': false,
                    'updatedconfig': true,
                    'newConfig': true,
                }
            });
            var changedConfigurationByResource = Object.create({});
            changedConfigurationByResource[workspaceFolder.uri.toString()] = new configurationModels_1.ConfigurationModel({
                'farboo': {
                    'newConfig': true,
                }
            }, ['farboo.newConfig']);
            var configEventData = {
                changedConfiguration: new configurationModels_1.ConfigurationModel({
                    'farboo': {
                        'updatedConfig': true,
                    }
                }, ['farboo.updatedConfig']),
                changedConfigurationByResource: changedConfigurationByResource
            };
            testObject.onDidChangeConfiguration(function (e) {
                assert.deepEqual(testObject.getConfiguration().get('farboo'), {
                    'config': false,
                    'updatedconfig': true,
                    'newConfig': true,
                });
                assert.ok(e.affectsConfiguration('farboo'));
                assert.ok(e.affectsConfiguration('farboo', workspaceFolder.uri));
                assert.ok(e.affectsConfiguration('farboo', uri_1.default.file('any')));
                assert.ok(e.affectsConfiguration('farboo.updatedConfig'));
                assert.ok(e.affectsConfiguration('farboo.updatedConfig', workspaceFolder.uri));
                assert.ok(e.affectsConfiguration('farboo.updatedConfig', uri_1.default.file('any')));
                assert.ok(e.affectsConfiguration('farboo.newConfig'));
                assert.ok(e.affectsConfiguration('farboo.newConfig', workspaceFolder.uri));
                assert.ok(!e.affectsConfiguration('farboo.newConfig', uri_1.default.file('any')));
                assert.ok(!e.affectsConfiguration('farboo.config'));
                assert.ok(!e.affectsConfiguration('farboo.config', workspaceFolder.uri));
                assert.ok(!e.affectsConfiguration('farboo.config', uri_1.default.file('any')));
                done();
            });
            testObject.$acceptConfigurationChanged(newConfigData, configEventData);
        });
        function aWorkspaceFolder(uri, index, name) {
            if (name === void 0) { name = ''; }
            return new workspace_1.WorkspaceFolder({ uri: uri, name: name, index: index });
        }
    });
});
