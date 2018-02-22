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
define(["require", "exports", "sinon", "assert", "os", "path", "fs", "vs/base/common/json", "vs/base/common/winjs.base", "vs/platform/registry/common/platform", "vs/platform/environment/common/environment", "vs/platform/environment/node/argv", "vs/platform/workspace/common/workspace", "vs/platform/environment/node/environmentService", "vs/base/node/extfs", "vs/workbench/test/workbenchTestServices", "vs/base/common/uuid", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/configuration/node/configurationService", "vs/workbench/services/files/node/fileService", "vs/workbench/services/configuration/node/configurationEditingService", "vs/platform/files/common/files", "vs/workbench/services/configuration/common/configuration", "vs/platform/configuration/common/configuration", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/services/resolverService", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/platform/message/common/message", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/node/pfs"], function (require, exports, sinon, assert, os, path, fs, json, winjs_base_1, platform_1, environment_1, argv_1, workspace_1, environmentService_1, extfs, workbenchTestServices_1, uuid, configurationRegistry_1, configurationService_1, fileService_1, configurationEditingService_1, files_1, configuration_1, configuration_2, textfiles_1, resolverService_1, textModelResolverService_1, message_1, testConfigurationService_1, pfs_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SettingsTestEnvironmentService = /** @class */ (function (_super) {
        __extends(SettingsTestEnvironmentService, _super);
        function SettingsTestEnvironmentService(args, _execPath, customAppSettingsHome) {
            var _this = _super.call(this, args, _execPath) || this;
            _this.customAppSettingsHome = customAppSettingsHome;
            return _this;
        }
        Object.defineProperty(SettingsTestEnvironmentService.prototype, "appSettingsPath", {
            get: function () { return this.customAppSettingsHome; },
            enumerable: true,
            configurable: true
        });
        return SettingsTestEnvironmentService;
    }(environmentService_1.EnvironmentService));
    suite('ConfigurationEditingService', function () {
        var instantiationService;
        var testObject;
        var parentDir;
        var workspaceDir;
        var globalSettingsFile;
        var workspaceSettingsDir;
        suiteSetup(function () {
            var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                'id': '_test',
                'type': 'object',
                'properties': {
                    'configurationEditing.service.testSetting': {
                        'type': 'string',
                        'default': 'isSet'
                    },
                    'configurationEditing.service.testSettingTwo': {
                        'type': 'string',
                        'default': 'isSet'
                    },
                    'configurationEditing.service.testSettingThree': {
                        'type': 'string',
                        'default': 'isSet'
                    }
                }
            });
        });
        setup(function () {
            return setUpWorkspace()
                .then(function () { return setUpServices(); });
        });
        function setUpWorkspace() {
            var id = uuid.generateUuid();
            parentDir = path.join(os.tmpdir(), 'vsctests', id);
            workspaceDir = path.join(parentDir, 'workspaceconfig', id);
            globalSettingsFile = path.join(workspaceDir, 'config.json');
            workspaceSettingsDir = path.join(workspaceDir, '.vscode');
            return pfs_1.mkdirp(workspaceSettingsDir, 493);
        }
        function setUpServices(noWorkspace) {
            if (noWorkspace === void 0) { noWorkspace = false; }
            // Clear services if they are already created
            clearServices();
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            var environmentService = new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, globalSettingsFile);
            instantiationService.stub(environment_1.IEnvironmentService, environmentService);
            var workspaceService = new configurationService_1.WorkspaceService(environmentService);
            instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceService);
            return workspaceService.initialize(noWorkspace ? {} : workspaceDir).then(function () {
                instantiationService.stub(configuration_2.IConfigurationService, workspaceService);
                instantiationService.stub(files_1.IFileService, new fileService_1.FileService(workspaceService, workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), new testConfigurationService_1.TestConfigurationService(), new workbenchTestServices_1.TestLifecycleService(), { disableWatcher: true }));
                instantiationService.stub(textfiles_1.ITextFileService, instantiationService.createInstance(workbenchTestServices_1.TestTextFileService));
                instantiationService.stub(resolverService_1.ITextModelService, instantiationService.createInstance(textModelResolverService_1.TextModelResolverService));
                testObject = instantiationService.createInstance(configurationEditingService_1.ConfigurationEditingService);
            });
        }
        teardown(function () {
            clearServices();
            return clearWorkspace();
        });
        function clearServices() {
            if (instantiationService) {
                var configuraitonService = instantiationService.get(configuration_2.IConfigurationService);
                if (configuraitonService) {
                    configuraitonService.dispose();
                }
                instantiationService = null;
            }
        }
        function clearWorkspace() {
            return new winjs_base_1.TPromise(function (c, e) {
                if (parentDir) {
                    extfs.del(parentDir, os.tmpdir(), function () { return c(null); }, function () { return c(null); });
                }
                else {
                    c(null);
                }
            }).then(function () { return parentDir = null; });
        }
        test('errors cases - invalid key', function () {
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.WORKSPACE, { key: 'unknown.key', value: 'value' })
                .then(function () { return assert.fail('Should fail with ERROR_UNKNOWN_KEY'); }, function (error) { return assert.equal(error.code, configurationEditingService_1.ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY); });
        });
        test('errors cases - invalid target', function () {
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.USER, { key: 'tasks.something', value: 'value' })
                .then(function () { return assert.fail('Should fail with ERROR_INVALID_TARGET'); }, function (error) { return assert.equal(error.code, configurationEditingService_1.ConfigurationEditingErrorCode.ERROR_INVALID_USER_TARGET); });
        });
        test('errors cases - no workspace', function () {
            return setUpServices(true)
                .then(function () { return testObject.writeConfiguration(configuration_2.ConfigurationTarget.WORKSPACE, { key: 'configurationEditing.service.testSetting', value: 'value' }); })
                .then(function () { return assert.fail('Should fail with ERROR_NO_WORKSPACE_OPENED'); }, function (error) { return assert.equal(error.code, configurationEditingService_1.ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED); });
        });
        test('errors cases - invalid configuration', function () {
            fs.writeFileSync(globalSettingsFile, ',,,,,,,,,,,,,,');
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.USER, { key: 'configurationEditing.service.testSetting', value: 'value' })
                .then(function () { return assert.fail('Should fail with ERROR_INVALID_CONFIGURATION'); }, function (error) { return assert.equal(error.code, configurationEditingService_1.ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION); });
        });
        test('errors cases - dirty', function () {
            instantiationService.stub(textfiles_1.ITextFileService, 'isDirty', true);
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.USER, { key: 'configurationEditing.service.testSetting', value: 'value' })
                .then(function () { return assert.fail('Should fail with ERROR_CONFIGURATION_FILE_DIRTY error.'); }, function (error) { return assert.equal(error.code, configurationEditingService_1.ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY); });
        });
        test('dirty error is not thrown if not asked to save', function () {
            instantiationService.stub(textfiles_1.ITextFileService, 'isDirty', true);
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.USER, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotSave: true })
                .then(function () { return null; }, function (error) { return assert.fail('Should not fail.'); });
        });
        test('do not notify error', function () {
            instantiationService.stub(textfiles_1.ITextFileService, 'isDirty', true);
            var target = sinon.stub();
            instantiationService.stubPromise(message_1.IChoiceService, 'choose', target);
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.USER, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true })
                .then(function () { return assert.fail('Should fail with ERROR_CONFIGURATION_FILE_DIRTY error.'); }, function (error) {
                assert.equal(false, target.calledOnce);
                assert.equal(error.code, configurationEditingService_1.ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY);
            });
        });
        test('write one setting - empty file', function () {
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.USER, { key: 'configurationEditing.service.testSetting', value: 'value' })
                .then(function () {
                var contents = fs.readFileSync(globalSettingsFile).toString('utf8');
                var parsed = json.parse(contents);
                assert.equal(parsed['configurationEditing.service.testSetting'], 'value');
            });
        });
        test('write one setting - existing file', function () {
            fs.writeFileSync(globalSettingsFile, '{ "my.super.setting": "my.super.value" }');
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.USER, { key: 'configurationEditing.service.testSetting', value: 'value' })
                .then(function () {
                var contents = fs.readFileSync(globalSettingsFile).toString('utf8');
                var parsed = json.parse(contents);
                assert.equal(parsed['configurationEditing.service.testSetting'], 'value');
                assert.equal(parsed['my.super.setting'], 'my.super.value');
            });
        });
        test('remove an existing setting - existing file', function () {
            fs.writeFileSync(globalSettingsFile, '{ "my.super.setting": "my.super.value", "configurationEditing.service.testSetting": "value" }');
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.USER, { key: 'configurationEditing.service.testSetting', value: undefined })
                .then(function () {
                var contents = fs.readFileSync(globalSettingsFile).toString('utf8');
                var parsed = json.parse(contents);
                assert.deepEqual(Object.keys(parsed), ['my.super.setting']);
                assert.equal(parsed['my.super.setting'], 'my.super.value');
            });
        });
        test('remove non existing setting - existing file', function () {
            fs.writeFileSync(globalSettingsFile, '{ "my.super.setting": "my.super.value" }');
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.USER, { key: 'configurationEditing.service.testSetting', value: undefined })
                .then(function () {
                var contents = fs.readFileSync(globalSettingsFile).toString('utf8');
                var parsed = json.parse(contents);
                assert.deepEqual(Object.keys(parsed), ['my.super.setting']);
                assert.equal(parsed['my.super.setting'], 'my.super.value');
            });
        });
        test('write workspace standalone setting - empty file', function () {
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.WORKSPACE, { key: 'tasks.service.testSetting', value: 'value' })
                .then(function () {
                var target = path.join(workspaceDir, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
                var contents = fs.readFileSync(target).toString('utf8');
                var parsed = json.parse(contents);
                assert.equal(parsed['service.testSetting'], 'value');
            });
        });
        test('write workspace standalone setting - existing file', function () {
            var target = path.join(workspaceDir, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['launch']);
            fs.writeFileSync(target, '{ "my.super.setting": "my.super.value" }');
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.WORKSPACE, { key: 'launch.service.testSetting', value: 'value' })
                .then(function () {
                var contents = fs.readFileSync(target).toString('utf8');
                var parsed = json.parse(contents);
                assert.equal(parsed['service.testSetting'], 'value');
                assert.equal(parsed['my.super.setting'], 'my.super.value');
            });
        });
        test('write workspace standalone setting - empty file - full JSON', function () {
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.WORKSPACE, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } })
                .then(function () {
                var target = path.join(workspaceDir, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
                var contents = fs.readFileSync(target).toString('utf8');
                var parsed = json.parse(contents);
                assert.equal(parsed['version'], '1.0.0');
                assert.equal(parsed['tasks'][0]['taskName'], 'myTask');
            });
        });
        test('write workspace standalone setting - existing file - full JSON', function () {
            var target = path.join(workspaceDir, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
            fs.writeFileSync(target, '{ "my.super.setting": "my.super.value" }');
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.WORKSPACE, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } })
                .then(function () {
                var contents = fs.readFileSync(target).toString('utf8');
                var parsed = json.parse(contents);
                assert.equal(parsed['version'], '1.0.0');
                assert.equal(parsed['tasks'][0]['taskName'], 'myTask');
            });
        });
        test('write workspace standalone setting - existing file with JSON errors - full JSON', function () {
            var target = path.join(workspaceDir, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
            fs.writeFileSync(target, '{ "my.super.setting": '); // invalid JSON
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.WORKSPACE, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } })
                .then(function () {
                var contents = fs.readFileSync(target).toString('utf8');
                var parsed = json.parse(contents);
                assert.equal(parsed['version'], '1.0.0');
                assert.equal(parsed['tasks'][0]['taskName'], 'myTask');
            });
        });
        test('write workspace standalone setting should replace complete file', function () {
            var target = path.join(workspaceDir, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
            fs.writeFileSync(target, "{\n\t\t\t\"version\": \"1.0.0\",\n\t\t\t\"tasks\": [\n\t\t\t\t{\n\t\t\t\t\t\"taskName\": \"myTask1\"\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\t\"taskName\": \"myTask2\"\n\t\t\t\t}\n\t\t\t]\n\t\t}");
            return testObject.writeConfiguration(configuration_2.ConfigurationTarget.WORKSPACE, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] } })
                .then(function () {
                var actual = fs.readFileSync(target).toString('utf8');
                var expected = JSON.stringify({ 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] }, null, '\t');
                assert.equal(actual, expected);
            });
        });
    });
});
