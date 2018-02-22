define(["require", "exports", "assert", "vs/base/common/paths", "vs/platform/registry/common/platform", "vs/workbench/services/configuration/common/configurationModels", "vs/platform/workspace/common/workspace", "vs/base/common/uri", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/map"], function (require, exports, assert, paths_1, platform_1, configurationModels_1, workspace_1, uri_1, configurationModels_2, configuration_1, configurationRegistry_1, map_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('FolderSettingsModelParser', function () {
        suiteSetup(function () {
            var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                'id': 'FolderSettingsModelParser_1',
                'type': 'object',
                'properties': {
                    'FolderSettingsModelParser.window': {
                        'type': 'string',
                        'default': 'isSet'
                    },
                    'FolderSettingsModelParser.resource': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: configurationRegistry_1.ConfigurationScope.RESOURCE
                    },
                    'FolderSettingsModelParser.executable': {
                        'type': 'string',
                        'default': 'isSet',
                        isExecutable: true
                    }
                }
            });
        });
        test('parse all folder settings', function () {
            var testObject = new configurationModels_1.FolderSettingsModelParser('settings');
            testObject.parse(JSON.stringify({ 'FolderSettingsModelParser.window': 'window', 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.executable': 'executable' }));
            assert.deepEqual(testObject.configurationModel.contents, { 'FolderSettingsModelParser': { 'window': 'window', 'resource': 'resource' } });
        });
        test('parse resource folder settings', function () {
            var testObject = new configurationModels_1.FolderSettingsModelParser('settings', configurationRegistry_1.ConfigurationScope.RESOURCE);
            testObject.parse(JSON.stringify({ 'FolderSettingsModelParser.window': 'window', 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.executable': 'executable' }));
            assert.deepEqual(testObject.configurationModel.contents, { 'FolderSettingsModelParser': { 'resource': 'resource' } });
        });
        test('reprocess folder settings excludes executable', function () {
            var testObject = new configurationModels_1.FolderSettingsModelParser('settings');
            testObject.parse(JSON.stringify({ 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.anotherExecutable': 'executable' }));
            assert.deepEqual(testObject.configurationModel.contents, { 'FolderSettingsModelParser': { 'resource': 'resource', 'anotherExecutable': 'executable' } });
            var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                'id': 'FolderSettingsModelParser_2',
                'type': 'object',
                'properties': {
                    'FolderSettingsModelParser.anotherExecutable': {
                        'type': 'string',
                        'default': 'isSet',
                        isExecutable: true
                    }
                }
            });
            testObject.reprocess();
            assert.deepEqual(testObject.configurationModel.contents, { 'FolderSettingsModelParser': { 'resource': 'resource' } });
        });
    });
    suite('StandaloneConfigurationModelParser', function () {
        test('parse tasks stand alone configuration model', function () {
            var testObject = new configurationModels_1.StandaloneConfigurationModelParser('tasks', 'tasks');
            testObject.parse(JSON.stringify({ 'version': '1.1.1', 'tasks': [] }));
            assert.deepEqual(testObject.configurationModel.contents, { 'tasks': { 'version': '1.1.1', 'tasks': [] } });
        });
    });
    suite('WorkspaceConfigurationChangeEvent', function () {
        test('changeEvent affecting workspace folders', function () {
            var configurationChangeEvent = new configurationModels_2.ConfigurationChangeEvent();
            configurationChangeEvent.change(['window.title']);
            configurationChangeEvent.change(['window.zoomLevel'], uri_1.default.file('folder1'));
            configurationChangeEvent.change(['workbench.editor.enablePreview'], uri_1.default.file('folder2'));
            configurationChangeEvent.change(['window.restoreFullscreen'], uri_1.default.file('folder1'));
            configurationChangeEvent.change(['window.restoreWindows'], uri_1.default.file('folder2'));
            configurationChangeEvent.telemetryData(configuration_1.ConfigurationTarget.WORKSPACE, {});
            var testObject = new configurationModels_1.WorkspaceConfigurationChangeEvent(configurationChangeEvent, new workspace_1.Workspace('id', 'name', [new workspace_1.WorkspaceFolder({ index: 0, name: '1', uri: uri_1.default.file('folder1') }),
                new workspace_1.WorkspaceFolder({ index: 1, name: '2', uri: uri_1.default.file('folder2') }),
                new workspace_1.WorkspaceFolder({ index: 2, name: '3', uri: uri_1.default.file('folder3') })]));
            assert.deepEqual(testObject.affectedKeys, ['window.title', 'window.zoomLevel', 'window.restoreFullscreen', 'workbench.editor.enablePreview', 'window.restoreWindows']);
            assert.equal(testObject.source, configuration_1.ConfigurationTarget.WORKSPACE);
            assert.ok(testObject.affectsConfiguration('window.zoomLevel'));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file('folder1')));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file(paths_1.join('folder1', 'file1'))));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file('file1')));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file('file2')));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file(paths_1.join('folder2', 'file2'))));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file(paths_1.join('folder3', 'file3'))));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen'));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file(paths_1.join('folder1', 'file1'))));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file('folder1')));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file('file1')));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file('file2')));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file(paths_1.join('folder2', 'file2'))));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file(paths_1.join('folder3', 'file3'))));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows'));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows', uri_1.default.file('folder2')));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows', uri_1.default.file(paths_1.join('folder2', 'file2'))));
            assert.ok(!testObject.affectsConfiguration('window.restoreWindows', uri_1.default.file('file2')));
            assert.ok(!testObject.affectsConfiguration('window.restoreWindows', uri_1.default.file(paths_1.join('folder1', 'file1'))));
            assert.ok(!testObject.affectsConfiguration('window.restoreWindows', uri_1.default.file(paths_1.join('folder3', 'file3'))));
            assert.ok(testObject.affectsConfiguration('window.title'));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('folder1')));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file(paths_1.join('folder1', 'file1'))));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('folder2')));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file(paths_1.join('folder2', 'file2'))));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('folder3')));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file(paths_1.join('folder3', 'file3'))));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('file3')));
            assert.ok(testObject.affectsConfiguration('window'));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('folder1')));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file(paths_1.join('folder1', 'file1'))));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('folder2')));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file(paths_1.join('folder2', 'file2'))));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('folder3')));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file(paths_1.join('folder3', 'file3'))));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('file3')));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview'));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview', uri_1.default.file('folder2')));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview', uri_1.default.file(paths_1.join('folder2', 'file2'))));
            assert.ok(!testObject.affectsConfiguration('workbench.editor.enablePreview', uri_1.default.file('folder1')));
            assert.ok(!testObject.affectsConfiguration('workbench.editor.enablePreview', uri_1.default.file(paths_1.join('folder1', 'file1'))));
            assert.ok(!testObject.affectsConfiguration('workbench.editor.enablePreview', uri_1.default.file('folder3')));
            assert.ok(testObject.affectsConfiguration('workbench.editor'));
            assert.ok(testObject.affectsConfiguration('workbench.editor', uri_1.default.file('folder2')));
            assert.ok(testObject.affectsConfiguration('workbench.editor', uri_1.default.file(paths_1.join('folder2', 'file2'))));
            assert.ok(!testObject.affectsConfiguration('workbench.editor', uri_1.default.file('folder1')));
            assert.ok(!testObject.affectsConfiguration('workbench.editor', uri_1.default.file(paths_1.join('folder1', 'file1'))));
            assert.ok(!testObject.affectsConfiguration('workbench.editor', uri_1.default.file('folder3')));
            assert.ok(testObject.affectsConfiguration('workbench'));
            assert.ok(testObject.affectsConfiguration('workbench', uri_1.default.file('folder2')));
            assert.ok(testObject.affectsConfiguration('workbench', uri_1.default.file(paths_1.join('folder2', 'file2'))));
            assert.ok(!testObject.affectsConfiguration('workbench', uri_1.default.file('folder1')));
            assert.ok(!testObject.affectsConfiguration('workbench', uri_1.default.file('folder3')));
            assert.ok(!testObject.affectsConfiguration('files'));
            assert.ok(!testObject.affectsConfiguration('files', uri_1.default.file('folder1')));
            assert.ok(!testObject.affectsConfiguration('files', uri_1.default.file(paths_1.join('folder1', 'file1'))));
            assert.ok(!testObject.affectsConfiguration('files', uri_1.default.file('folder2')));
            assert.ok(!testObject.affectsConfiguration('files', uri_1.default.file(paths_1.join('folder2', 'file2'))));
            assert.ok(!testObject.affectsConfiguration('files', uri_1.default.file('folder3')));
            assert.ok(!testObject.affectsConfiguration('files', uri_1.default.file(paths_1.join('folder3', 'file3'))));
        });
    });
    suite('AllKeysConfigurationChangeEvent', function () {
        test('changeEvent affects keys for any resource', function () {
            var configuraiton = new configurationModels_1.Configuration(new configurationModels_2.ConfigurationModel({}, ['window.title', 'window.zoomLevel', 'window.restoreFullscreen', 'workbench.editor.enablePreview', 'window.restoreWindows']), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new map_1.StrictResourceMap(), new configurationModels_2.ConfigurationModel(), new map_1.StrictResourceMap(), null);
            var testObject = new configurationModels_1.AllKeysConfigurationChangeEvent(configuraiton, configuration_1.ConfigurationTarget.USER, null);
            assert.deepEqual(testObject.affectedKeys, ['window.title', 'window.zoomLevel', 'window.restoreFullscreen', 'workbench.editor.enablePreview', 'window.restoreWindows']);
            assert.ok(testObject.affectsConfiguration('window.zoomLevel'));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen'));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows'));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window.title'));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('window'));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview'));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('workbench.editor'));
            assert.ok(testObject.affectsConfiguration('workbench.editor', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('workbench.editor', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('workbench'));
            assert.ok(testObject.affectsConfiguration('workbench', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('workbench', uri_1.default.file('file1')));
            assert.ok(!testObject.affectsConfiguration('files'));
            assert.ok(!testObject.affectsConfiguration('files', uri_1.default.file('file1')));
        });
    });
});
