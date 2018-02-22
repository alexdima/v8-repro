/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/uri", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/workspace/common/workspace", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/api/electron-browser/mainThreadConfiguration", "./testRPCProtocol", "vs/platform/configuration/common/configuration", "vs/workbench/services/configuration/node/configurationService"], function (require, exports, assert, sinon, uri_1, platform_1, configurationRegistry_1, workspace_1, instantiationServiceMock_1, mainThreadConfiguration_1, testRPCProtocol_1, configuration_1, configurationService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadConfiguration', function () {
        var instantiationService;
        var target;
        suiteSetup(function () {
            platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
                'id': 'extHostConfiguration',
                'title': 'a',
                'type': 'object',
                'properties': {
                    'extHostConfiguration.resource': {
                        'description': 'extHostConfiguration.resource',
                        'type': 'boolean',
                        'default': true,
                        'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
                    },
                    'extHostConfiguration.window': {
                        'description': 'extHostConfiguration.resource',
                        'type': 'boolean',
                        'default': true,
                        'scope': configurationRegistry_1.ConfigurationScope.WINDOW
                    }
                }
            });
        });
        setup(function () {
            target = sinon.spy();
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(configuration_1.IConfigurationService, configurationService_1.WorkspaceService);
            instantiationService.stub(configuration_1.IConfigurationService, 'onDidUpdateConfiguration', sinon.mock());
            instantiationService.stub(configuration_1.IConfigurationService, 'onDidChangeConfiguration', sinon.mock());
            instantiationService.stub(configuration_1.IConfigurationService, 'updateValue', target);
        });
        test('update resource configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.WORKSPACE; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', null);
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('update resource configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('update resource configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', null);
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.WORKSPACE; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', null);
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in multi root workspace when resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.WORKSPACE; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', null);
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('update resource configuration without configuration target defaults to folder', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.WORKSPACE; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE_FOLDER, target.args[0][3]);
        });
        test('update configuration with user configuration target', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(configuration_1.ConfigurationTarget.USER, 'extHostConfiguration.window', 'value', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.USER, target.args[0][3]);
        });
        test('update configuration with workspace configuration target', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(configuration_1.ConfigurationTarget.WORKSPACE, 'extHostConfiguration.window', 'value', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('update configuration with folder configuration target', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$updateConfigurationOption(configuration_1.ConfigurationTarget.WORKSPACE_FOLDER, 'extHostConfiguration.window', 'value', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE_FOLDER, target.args[0][3]);
        });
        test('remove resource configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.WORKSPACE; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', null);
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('remove resource configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('remove resource configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', null);
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.WORKSPACE; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', null);
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in multi root workspace when resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.WORKSPACE; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', null);
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE, target.args[0][3]);
        });
        test('remove configuration without configuration target defaults to folder', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: function () { return workspace_1.WorkbenchState.WORKSPACE; } });
            var testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, testRPCProtocol_1.SingleProxyRPCProtocol(null));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', uri_1.default.file('abc'));
            assert.equal(configuration_1.ConfigurationTarget.WORKSPACE_FOLDER, target.args[0][3]);
        });
    });
});
