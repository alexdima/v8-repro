define(["require", "exports", "assert", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/base/common/uri"], function (require, exports, assert, configurationModels_1, configurationRegistry_1, platform_1, uri_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ConfigurationModel', function () {
        test('setValue for a key that has no sections and not defined', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 } }, ['a.b']);
            testObject.setValue('f', 1);
            assert.deepEqual(testObject.contents, { 'a': { 'b': 1 }, 'f': 1 });
            assert.deepEqual(testObject.keys, ['a.b', 'f']);
        });
        test('setValue for a key that has no sections and defined', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': 1 }, ['a.b', 'f']);
            testObject.setValue('f', 3);
            assert.deepEqual(testObject.contents, { 'a': { 'b': 1 }, 'f': 3 });
            assert.deepEqual(testObject.keys, ['a.b', 'f']);
        });
        test('setValue for a key that has sections and not defined', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': 1 }, ['a.b', 'f']);
            testObject.setValue('b.c', 1);
            assert.deepEqual(testObject.contents, { 'a': { 'b': 1 }, 'b': { 'c': 1 }, 'f': 1 });
            assert.deepEqual(testObject.keys, ['a.b', 'f', 'b.c']);
        });
        test('setValue for a key that has sections and defined', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'b': { 'c': 1 }, 'f': 1 }, ['a.b', 'b.c', 'f']);
            testObject.setValue('b.c', 3);
            assert.deepEqual(testObject.contents, { 'a': { 'b': 1 }, 'b': { 'c': 3 }, 'f': 1 });
            assert.deepEqual(testObject.keys, ['a.b', 'b.c', 'f']);
        });
        test('setValue for a key that has sections and sub section not defined', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': 1 }, ['a.b', 'f']);
            testObject.setValue('a.c', 1);
            assert.deepEqual(testObject.contents, { 'a': { 'b': 1, 'c': 1 }, 'f': 1 });
            assert.deepEqual(testObject.keys, ['a.b', 'f', 'a.c']);
        });
        test('setValue for a key that has sections and sub section defined', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1, 'c': 1 }, 'f': 1 }, ['a.b', 'a.c', 'f']);
            testObject.setValue('a.c', 3);
            assert.deepEqual(testObject.contents, { 'a': { 'b': 1, 'c': 3 }, 'f': 1 });
            assert.deepEqual(testObject.keys, ['a.b', 'a.c', 'f']);
        });
        test('setValue for a key that has sections and last section is added', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': {} }, 'f': 1 }, ['a.b', 'f']);
            testObject.setValue('a.b.c', 1);
            assert.deepEqual(testObject.contents, { 'a': { 'b': { 'c': 1 } }, 'f': 1 });
            assert.deepEqual(testObject.keys, ['a.b.c', 'f']);
        });
        test('removeValue: remove a non existing key', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 2 } }, ['a.b']);
            testObject.removeValue('a.b.c');
            assert.deepEqual(testObject.contents, { 'a': { 'b': 2 } });
            assert.deepEqual(testObject.keys, ['a.b']);
        });
        test('removeValue: remove a single segemented key', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': 1 }, ['a']);
            testObject.removeValue('a');
            assert.deepEqual(testObject.contents, {});
            assert.deepEqual(testObject.keys, []);
        });
        test('removeValue: remove a multi segemented key', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 } }, ['a.b']);
            testObject.removeValue('a.b');
            assert.deepEqual(testObject.contents, {});
            assert.deepEqual(testObject.keys, []);
        });
        test('get overriding configuration model for an existing identifier', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': 1 }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 } } }]);
            assert.deepEqual(testObject.override('c').contents, { 'a': { 'b': 1, 'd': 1 }, 'f': 1 });
        });
        test('get overriding configuration model for an identifier that does not exist', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': 1 }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 } } }]);
            assert.deepEqual(testObject.override('xyz').contents, { 'a': { 'b': 1 }, 'f': 1 });
        });
        test('get overriding configuration when one of the keys does not exist in base', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': 1 }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 }, 'g': 1 } }]);
            assert.deepEqual(testObject.override('c').contents, { 'a': { 'b': 1, 'd': 1 }, 'f': 1, 'g': 1 });
        });
        test('get overriding configuration when one of the key in base is not of object type', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': 1 }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 }, 'f': { 'g': 1 } } }]);
            assert.deepEqual(testObject.override('c').contents, { 'a': { 'b': 1, 'd': 1 }, 'f': { 'g': 1 } });
        });
        test('get overriding configuration when one of the key in overriding contents is not of object type', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': { 'g': 1 } }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 }, 'f': 1 } }]);
            assert.deepEqual(testObject.override('c').contents, { 'a': { 'b': 1, 'd': 1 }, 'f': 1 });
        });
        test('get overriding configuration if the value of overriding identifier is not object', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': { 'g': 1 } }, [], [{ identifiers: ['c'], contents: 'abc' }]);
            assert.deepEqual(testObject.override('c').contents, { 'a': { 'b': 1 }, 'f': { 'g': 1 } });
        });
        test('get overriding configuration if the value of overriding identifier is an empty object', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': { 'g': 1 } }, [], [{ identifiers: ['c'], contents: {} }]);
            assert.deepEqual(testObject.override('c').contents, { 'a': { 'b': 1 }, 'f': { 'g': 1 } });
        });
        test('simple merge', function () {
            var base = new configurationModels_1.ConfigurationModel({ 'a': 1, 'b': 2 }, ['a', 'b']);
            var add = new configurationModels_1.ConfigurationModel({ 'a': 3, 'c': 4 }, ['a', 'c']);
            var result = base.merge(add);
            assert.deepEqual(result.contents, { 'a': 3, 'b': 2, 'c': 4 });
            assert.deepEqual(result.keys, ['a', 'b', 'c']);
        });
        test('recursive merge', function () {
            var base = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 } }, ['a.b']);
            var add = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 2 } }, ['a.b']);
            var result = base.merge(add);
            assert.deepEqual(result.contents, { 'a': { 'b': 2 } });
            assert.deepEqual(result.getValue('a'), { 'b': 2 });
            assert.deepEqual(result.keys, ['a.b']);
        });
        test('simple merge overrides', function () {
            var base = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 } }, ['a.b'], [{ identifiers: ['c'], contents: { 'a': 2 } }]);
            var add = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 2 } }, ['a.b'], [{ identifiers: ['c'], contents: { 'b': 2 } }]);
            var result = base.merge(add);
            assert.deepEqual(result.contents, { 'a': { 'b': 2 } });
            assert.deepEqual(result.overrides, [{ identifiers: ['c'], contents: { 'a': 2, 'b': 2 } }]);
            assert.deepEqual(result.override('c').contents, { 'a': 2, 'b': 2 });
            assert.deepEqual(result.keys, ['a.b']);
        });
        test('recursive merge overrides', function () {
            var base = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 }, 'f': 1 }, ['a.b', 'f'], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 } } }]);
            var add = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 2 } }, ['a.b'], [{ identifiers: ['c'], contents: { 'a': { 'e': 2 } } }]);
            var result = base.merge(add);
            assert.deepEqual(result.contents, { 'a': { 'b': 2 }, 'f': 1 });
            assert.deepEqual(result.overrides, [{ identifiers: ['c'], contents: { 'a': { 'd': 1, 'e': 2 } } }]);
            assert.deepEqual(result.override('c').contents, { 'a': { 'b': 2, 'd': 1, 'e': 2 }, 'f': 1 });
            assert.deepEqual(result.keys, ['a.b', 'f']);
        });
        test('Test contents while getting an existing property', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': 1 });
            assert.deepEqual(testObject.getValue('a'), 1);
            testObject = new configurationModels_1.ConfigurationModel({ 'a': { 'b': 1 } });
            assert.deepEqual(testObject.getValue('a'), { 'b': 1 });
        });
        test('Test contents are undefined for non existing properties', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ awesome: true });
            assert.deepEqual(testObject.getValue('unknownproperty'), undefined);
        });
        test('Test override gives all content merged with overrides', function () {
            var testObject = new configurationModels_1.ConfigurationModel({ 'a': 1, 'c': 1 }, [], [{ identifiers: ['b'], contents: { 'a': 2 } }]);
            assert.deepEqual(testObject.override('b').contents, { 'a': 2, 'c': 1 });
        });
    });
    suite('CustomConfigurationModel', function () {
        suiteSetup(function () {
            platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'a': {
                        'description': 'a',
                        'type': 'boolean',
                        'default': true,
                        'overridable': true
                    }
                }
            });
        });
        test('simple merge using models', function () {
            var base = new configurationModels_1.ConfigurationModelParser('base');
            base.parse(JSON.stringify({ 'a': 1, 'b': 2 }));
            var add = new configurationModels_1.ConfigurationModelParser('add');
            add.parse(JSON.stringify({ 'a': 3, 'c': 4 }));
            var result = base.configurationModel.merge(add.configurationModel);
            assert.deepEqual(result.contents, { 'a': 3, 'b': 2, 'c': 4 });
        });
        test('simple merge with an undefined contents', function () {
            var base = new configurationModels_1.ConfigurationModelParser('base');
            base.parse(JSON.stringify({ 'a': 1, 'b': 2 }));
            var add = new configurationModels_1.ConfigurationModelParser('add');
            var result = base.configurationModel.merge(add.configurationModel);
            assert.deepEqual(result.contents, { 'a': 1, 'b': 2 });
            base = new configurationModels_1.ConfigurationModelParser('base');
            add = new configurationModels_1.ConfigurationModelParser('add');
            add.parse(JSON.stringify({ 'a': 1, 'b': 2 }));
            result = base.configurationModel.merge(add.configurationModel);
            assert.deepEqual(result.contents, { 'a': 1, 'b': 2 });
            base = new configurationModels_1.ConfigurationModelParser('base');
            add = new configurationModels_1.ConfigurationModelParser('add');
            result = base.configurationModel.merge(add.configurationModel);
            assert.deepEqual(result.contents, {});
        });
        test('Recursive merge using config models', function () {
            var base = new configurationModels_1.ConfigurationModelParser('base');
            base.parse(JSON.stringify({ 'a': { 'b': 1 } }));
            var add = new configurationModels_1.ConfigurationModelParser('add');
            add.parse(JSON.stringify({ 'a': { 'b': 2 } }));
            var result = base.configurationModel.merge(add.configurationModel);
            assert.deepEqual(result.contents, { 'a': { 'b': 2 } });
        });
        test('Test contents while getting an existing property', function () {
            var testObject = new configurationModels_1.ConfigurationModelParser('test');
            testObject.parse(JSON.stringify({ 'a': 1 }));
            assert.deepEqual(testObject.configurationModel.getValue('a'), 1);
            testObject.parse(JSON.stringify({ 'a': { 'b': 1 } }));
            assert.deepEqual(testObject.configurationModel.getValue('a'), { 'b': 1 });
        });
        test('Test contents are undefined for non existing properties', function () {
            var testObject = new configurationModels_1.ConfigurationModelParser('test');
            testObject.parse(JSON.stringify({
                awesome: true
            }));
            assert.deepEqual(testObject.configurationModel.getValue('unknownproperty'), undefined);
        });
        test('Test contents are undefined for undefined config', function () {
            var testObject = new configurationModels_1.ConfigurationModelParser('test');
            assert.deepEqual(testObject.configurationModel.getValue('unknownproperty'), undefined);
        });
        test('Test configWithOverrides gives all content merged with overrides', function () {
            var testObject = new configurationModels_1.ConfigurationModelParser('test');
            testObject.parse(JSON.stringify({ 'a': 1, 'c': 1, '[b]': { 'a': 2 } }));
            assert.deepEqual(testObject.configurationModel.override('b').contents, { 'a': 2, 'c': 1, '[b]': { 'a': 2 } });
        });
        test('Test configWithOverrides gives empty contents', function () {
            var testObject = new configurationModels_1.ConfigurationModelParser('test');
            assert.deepEqual(testObject.configurationModel.override('b').contents, {});
        });
        test('Test update with empty data', function () {
            var testObject = new configurationModels_1.ConfigurationModelParser('test');
            testObject.parse('');
            assert.deepEqual(testObject.configurationModel.contents, {});
            assert.deepEqual(testObject.configurationModel.keys, []);
            testObject.parse(null);
            assert.deepEqual(testObject.configurationModel.contents, {});
            assert.deepEqual(testObject.configurationModel.keys, []);
            testObject.parse(undefined);
            assert.deepEqual(testObject.configurationModel.contents, {});
            assert.deepEqual(testObject.configurationModel.keys, []);
        });
        test('Test registering the same property again', function () {
            platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
                'id': 'a',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    'a': {
                        'description': 'a',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            assert.equal(true, new configurationModels_1.DefaultConfigurationModel().getValue('a'));
        });
        test('Test registering the language property', function () {
            platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
                'id': '[a]',
                'order': 1,
                'title': 'a',
                'type': 'object',
                'properties': {
                    '[a]': {
                        'description': 'a',
                        'type': 'boolean',
                        'default': false,
                    }
                }
            });
            assert.equal(undefined, new configurationModels_1.DefaultConfigurationModel().getValue('[a]'));
        });
    });
    suite('ConfigurationChangeEvent', function () {
        test('changeEvent affecting keys for all resources', function () {
            var testObject = new configurationModels_1.ConfigurationChangeEvent();
            testObject.change(['window.zoomLevel', 'workbench.editor.enablePreview', 'files', '[markdown]']);
            assert.deepEqual(testObject.affectedKeys, ['window.zoomLevel', 'workbench.editor.enablePreview', 'files', '[markdown]']);
            assert.ok(testObject.affectsConfiguration('window.zoomLevel'));
            assert.ok(testObject.affectsConfiguration('window'));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview'));
            assert.ok(testObject.affectsConfiguration('workbench.editor'));
            assert.ok(testObject.affectsConfiguration('workbench'));
            assert.ok(testObject.affectsConfiguration('files'));
            assert.ok(!testObject.affectsConfiguration('files.exclude'));
            assert.ok(testObject.affectsConfiguration('[markdown]'));
        });
        test('changeEvent affecting a root key and its children', function () {
            var testObject = new configurationModels_1.ConfigurationChangeEvent();
            testObject.change(['launch', 'launch.version', 'tasks']);
            assert.deepEqual(testObject.affectedKeys, ['launch.version', 'tasks']);
            assert.ok(testObject.affectsConfiguration('launch'));
            assert.ok(testObject.affectsConfiguration('launch.version'));
            assert.ok(testObject.affectsConfiguration('tasks'));
        });
        test('changeEvent affecting keys for resources', function () {
            var testObject = new configurationModels_1.ConfigurationChangeEvent();
            testObject.change(['window.title']);
            testObject.change(['window.zoomLevel'], uri_1.default.file('file1'));
            testObject.change(['workbench.editor.enablePreview'], uri_1.default.file('file2'));
            testObject.change(['window.restoreFullscreen'], uri_1.default.file('file1'));
            testObject.change(['window.restoreWindows'], uri_1.default.file('file2'));
            assert.deepEqual(testObject.affectedKeys, ['window.title', 'window.zoomLevel', 'window.restoreFullscreen', 'workbench.editor.enablePreview', 'window.restoreWindows']);
            assert.ok(testObject.affectsConfiguration('window.zoomLevel'));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file('file1')));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen'));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file('file1')));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows'));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows', uri_1.default.file('file2')));
            assert.ok(!testObject.affectsConfiguration('window.restoreWindows', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window.title'));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window.title', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('window'));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('window', uri_1.default.file('file2')));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview'));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview', uri_1.default.file('file2')));
            assert.ok(!testObject.affectsConfiguration('workbench.editor.enablePreview', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('workbench.editor'));
            assert.ok(testObject.affectsConfiguration('workbench.editor', uri_1.default.file('file2')));
            assert.ok(!testObject.affectsConfiguration('workbench.editor', uri_1.default.file('file1')));
            assert.ok(testObject.affectsConfiguration('workbench'));
            assert.ok(testObject.affectsConfiguration('workbench', uri_1.default.file('file2')));
            assert.ok(!testObject.affectsConfiguration('workbench', uri_1.default.file('file1')));
            assert.ok(!testObject.affectsConfiguration('files'));
            assert.ok(!testObject.affectsConfiguration('files', uri_1.default.file('file1')));
            assert.ok(!testObject.affectsConfiguration('files', uri_1.default.file('file2')));
        });
        test('merging change events', function () {
            var event1 = new configurationModels_1.ConfigurationChangeEvent().change(['window.zoomLevel', 'files']);
            var event2 = new configurationModels_1.ConfigurationChangeEvent().change(['window.title'], uri_1.default.file('file1')).change(['[markdown]']);
            var actual = event1.change(event2);
            assert.deepEqual(actual.affectedKeys, ['window.zoomLevel', 'files', '[markdown]', 'window.title']);
            assert.ok(actual.affectsConfiguration('window.zoomLevel'));
            assert.ok(actual.affectsConfiguration('window.zoomLevel', uri_1.default.file('file1')));
            assert.ok(actual.affectsConfiguration('window.zoomLevel', uri_1.default.file('file2')));
            assert.ok(actual.affectsConfiguration('window'));
            assert.ok(actual.affectsConfiguration('window', uri_1.default.file('file1')));
            assert.ok(actual.affectsConfiguration('window', uri_1.default.file('file2')));
            assert.ok(actual.affectsConfiguration('files'));
            assert.ok(actual.affectsConfiguration('files', uri_1.default.file('file1')));
            assert.ok(actual.affectsConfiguration('files', uri_1.default.file('file2')));
            assert.ok(actual.affectsConfiguration('window.title'));
            assert.ok(actual.affectsConfiguration('window.title', uri_1.default.file('file1')));
            assert.ok(!actual.affectsConfiguration('window.title', uri_1.default.file('file2')));
            assert.ok(actual.affectsConfiguration('[markdown]'));
            assert.ok(actual.affectsConfiguration('[markdown]', uri_1.default.file('file1')));
            assert.ok(actual.affectsConfiguration('[markdown]', uri_1.default.file('file2')));
        });
    });
});
