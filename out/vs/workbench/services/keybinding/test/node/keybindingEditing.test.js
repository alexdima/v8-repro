/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "path", "fs", "vs/base/common/json", "vs/base/common/platform", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/base/common/winjs.base", "vs/base/common/keyCodes", "vs/platform/environment/common/environment", "vs/base/node/extfs", "vs/workbench/test/workbenchTestServices", "vs/platform/workspace/common/workspace", "vs/base/common/uuid", "vs/platform/configuration/node/configurationService", "vs/workbench/services/files/node/fileService", "vs/platform/files/common/files", "vs/platform/configuration/common/configuration", "vs/workbench/services/untitled/common/untitledEditorService", "vs/platform/lifecycle/common/lifecycle", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/backup/common/backup", "vs/workbench/services/group/common/groupService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/services/resolverService", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/editor/common/services/modeService", "vs/editor/common/services/modeServiceImpl", "vs/editor/common/services/modelService", "vs/editor/common/services/modelServiceImpl", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/keybinding/common/keybindingEditing", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/services/hash/common/hashService", "vs/base/node/pfs", "vs/platform/keybinding/test/common/mockKeybindingService"], function (require, exports, assert, os, path, fs, json, platform_1, usLayoutResolvedKeybinding_1, winjs_base_1, keyCodes_1, environment_1, extfs, workbenchTestServices_1, workspace_1, uuid, configurationService_1, fileService_1, files_1, configuration_1, untitledEditorService_1, lifecycle_1, telemetry_1, telemetryUtils_1, backup_1, groupService_1, instantiationServiceMock_1, textfiles_1, resolverService_1, textModelResolverService_1, modeService_1, modeServiceImpl_1, modelService_1, modelServiceImpl_1, contextkey_1, keybindingEditing_1, resolvedKeybindingItem_1, testConfigurationService_1, hashService_1, pfs_1, mockKeybindingService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Keybindings Editing', function () {
        var instantiationService;
        var testObject;
        var testDir;
        var keybindingsFile;
        setup(function () {
            return setUpWorkspace().then(function () {
                keybindingsFile = path.join(testDir, 'keybindings.json');
                instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                instantiationService.stub(environment_1.IEnvironmentService, { appKeybindingsPath: keybindingsFile });
                instantiationService.stub(configuration_1.IConfigurationService, configurationService_1.ConfigurationService);
                instantiationService.stub(configuration_1.IConfigurationService, 'getValue', { 'eol': '\n' });
                instantiationService.stub(configuration_1.IConfigurationService, 'onDidUpdateConfiguration', function () { });
                instantiationService.stub(configuration_1.IConfigurationService, 'onDidChangeConfiguration', function () { });
                instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
                var lifecycleService = new workbenchTestServices_1.TestLifecycleService();
                instantiationService.stub(lifecycle_1.ILifecycleService, lifecycleService);
                instantiationService.stub(contextkey_1.IContextKeyService, instantiationService.createInstance(mockKeybindingService_1.MockContextKeyService));
                instantiationService.stub(hashService_1.IHashService, new workbenchTestServices_1.TestHashService());
                instantiationService.stub(groupService_1.IEditorGroupService, new workbenchTestServices_1.TestEditorGroupService());
                instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
                instantiationService.stub(modeService_1.IModeService, modeServiceImpl_1.ModeServiceImpl);
                instantiationService.stub(modelService_1.IModelService, instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl));
                instantiationService.stub(files_1.IFileService, new fileService_1.FileService(new workbenchTestServices_1.TestContextService(new workspace_1.Workspace(testDir, testDir, workspace_1.toWorkspaceFolders([{ path: testDir }]))), workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), new testConfigurationService_1.TestConfigurationService(), lifecycleService, { disableWatcher: true }));
                instantiationService.stub(untitledEditorService_1.IUntitledEditorService, instantiationService.createInstance(untitledEditorService_1.UntitledEditorService));
                instantiationService.stub(textfiles_1.ITextFileService, instantiationService.createInstance(workbenchTestServices_1.TestTextFileService));
                instantiationService.stub(resolverService_1.ITextModelService, instantiationService.createInstance(textModelResolverService_1.TextModelResolverService));
                instantiationService.stub(backup_1.IBackupFileService, new workbenchTestServices_1.TestBackupFileService());
                testObject = instantiationService.createInstance(keybindingEditing_1.KeybindingsEditingService);
            });
        });
        function setUpWorkspace() {
            testDir = path.join(os.tmpdir(), 'vsctests', uuid.generateUuid());
            return pfs_1.mkdirp(testDir, 493);
        }
        teardown(function () {
            return new winjs_base_1.TPromise(function (c, e) {
                if (testDir) {
                    extfs.del(testDir, os.tmpdir(), function () { return c(null); }, function () { return c(null); });
                }
                else {
                    c(null);
                }
            }).then(function () { return testDir = null; });
        });
        test('errors cases - parse errors', function () {
            fs.writeFileSync(keybindingsFile, ',,,,,,,,,,,,,,');
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ } }))
                .then(function () { return assert.fail('Should fail with parse errors'); }, function (error) { return assert.equal(error.message, 'Unable to write keybindings. Please open **Keybindings file** to correct errors/warnings in the file and try again.'); });
        });
        test('errors cases - parse errors 2', function () {
            fs.writeFileSync(keybindingsFile, '[{"key": }]');
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ } }))
                .then(function () { return assert.fail('Should fail with parse errors'); }, function (error) { return assert.equal(error.message, 'Unable to write keybindings. Please open **Keybindings file** to correct errors/warnings in the file and try again.'); });
        });
        test('errors cases - dirty', function () {
            instantiationService.stub(textfiles_1.ITextFileService, 'isDirty', true);
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ } }))
                .then(function () { return assert.fail('Should fail with dirty error'); }, function (error) { return assert.equal(error.message, 'Unable to write because the file is dirty. Please save the **Keybindings** file and try again.'); });
        });
        test('errors cases - did not find an array', function () {
            fs.writeFileSync(keybindingsFile, '{"key": "alt+c", "command": "hello"}');
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ } }))
                .then(function () { return assert.fail('Should fail with dirty error'); }, function (error) { return assert.equal(error.message, 'Unable to write keybindings. **Keybindings file** has an object which is not of type Array. Please open the file to clean up and try again.'); });
        });
        test('edit a default keybinding to an empty file', function () {
            fs.writeFileSync(keybindingsFile, '');
            var expected = [{ key: 'alt+c', command: 'a' }, { key: 'escape', command: '-a' }];
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'a' }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), expected); });
        });
        test('edit a default keybinding to a non existing keybindings file', function () {
            keybindingsFile = path.join(testDir, 'nonExistingFile.json');
            instantiationService.get(environment_1.IEnvironmentService).appKeybindingsPath = keybindingsFile;
            testObject = instantiationService.createInstance(keybindingEditing_1.KeybindingsEditingService);
            var expected = [{ key: 'alt+c', command: 'a' }, { key: 'escape', command: '-a' }];
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'a' }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), expected); });
        });
        test('edit a default keybinding to an empty array', function () {
            writeToKeybindingsFile();
            var expected = [{ key: 'alt+c', command: 'a' }, { key: 'escape', command: '-a' }];
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'a' }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), expected); });
        });
        test('edit a default keybinding in an existing array', function () {
            writeToKeybindingsFile({ command: 'b', key: 'shift+c' });
            var expected = [{ key: 'shift+c', command: 'b' }, { key: 'alt+c', command: 'a' }, { key: 'escape', command: '-a' }];
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'a' }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), expected); });
        });
        test('add a new default keybinding', function () {
            var expected = [{ key: 'alt+c', command: 'a' }];
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ command: 'a' }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), expected); });
        });
        test('edit an user keybinding', function () {
            writeToKeybindingsFile({ key: 'escape', command: 'b' });
            var expected = [{ key: 'alt+c', command: 'b' }];
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'b', isDefault: false }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), expected); });
        });
        test('edit an user keybinding with more than one element', function () {
            writeToKeybindingsFile({ key: 'escape', command: 'b' }, { key: 'alt+shift+g', command: 'c' });
            var expected = [{ key: 'alt+c', command: 'b' }, { key: 'alt+shift+g', command: 'c' }];
            return testObject.editKeybinding('alt+c', aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'b', isDefault: false }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), expected); });
        });
        test('remove a default keybinding', function () {
            var expected = [{ key: 'alt+c', command: '-a' }];
            return testObject.removeKeybinding(aResolvedKeybindingItem({ command: 'a', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } } }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), expected); });
        });
        test('remove a user keybinding', function () {
            writeToKeybindingsFile({ key: 'alt+c', command: 'b' });
            return testObject.removeKeybinding(aResolvedKeybindingItem({ command: 'b', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } }, isDefault: false }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), []); });
        });
        test('reset an edited keybinding', function () {
            writeToKeybindingsFile({ key: 'alt+c', command: 'b' });
            return testObject.resetKeybinding(aResolvedKeybindingItem({ command: 'b', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } }, isDefault: false }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), []); });
        });
        test('reset a removed keybinding', function () {
            writeToKeybindingsFile({ key: 'alt+c', command: '-b' });
            return testObject.resetKeybinding(aResolvedKeybindingItem({ command: 'b', isDefault: false }))
                .then(function () { return assert.deepEqual(getUserKeybindings(), []); });
        });
        function writeToKeybindingsFile() {
            var keybindings = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keybindings[_i] = arguments[_i];
            }
            fs.writeFileSync(keybindingsFile, JSON.stringify(keybindings || []));
        }
        function getUserKeybindings() {
            return json.parse(fs.readFileSync(keybindingsFile).toString('utf8'));
        }
        function aResolvedKeybindingItem(_a) {
            var command = _a.command, when = _a.when, isDefault = _a.isDefault, firstPart = _a.firstPart, chordPart = _a.chordPart;
            var aSimpleKeybinding = function (part) {
                var _a = part.modifiers || { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false }, ctrlKey = _a.ctrlKey, shiftKey = _a.shiftKey, altKey = _a.altKey, metaKey = _a.metaKey;
                return new keyCodes_1.SimpleKeybinding(ctrlKey, shiftKey, altKey, metaKey, part.keyCode);
            };
            var keybinding = firstPart ? chordPart ? new keyCodes_1.ChordKeybinding(aSimpleKeybinding(firstPart), aSimpleKeybinding(chordPart)) : aSimpleKeybinding(firstPart) : null;
            return new resolvedKeybindingItem_1.ResolvedKeybindingItem(keybinding ? new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keybinding, platform_1.OS) : null, command || 'some command', null, when ? contextkey_1.ContextKeyExpr.deserialize(when) : null, isDefault === void 0 ? true : isDefault);
        }
    });
});
