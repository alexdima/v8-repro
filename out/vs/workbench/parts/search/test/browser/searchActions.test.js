define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/parts/search/common/searchModel", "vs/workbench/parts/search/browser/searchActions", "vs/base/common/iterator", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/common/services/modelService", "vs/base/parts/tree/browser/treeImpl", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/base/common/platform"], function (require, exports, assert, uri_1, instantiationServiceMock_1, searchModel_1, searchActions_1, iterator_1, configuration_1, testConfigurationService_1, modelServiceImpl_1, modelService_1, treeImpl_1, keybinding_1, usLayoutResolvedKeybinding_1, platform_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Search Actions', function () {
        var instantiationService;
        var counter;
        setup(function () {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(modelService_1.IModelService, stubModelService(instantiationService));
            instantiationService.stub(keybinding_1.IKeybindingService, {});
            instantiationService.stub(keybinding_1.IKeybindingService, 'resolveKeybinding', function (keybinding) { return [new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keybinding, platform_1.OS)]; });
            instantiationService.stub(keybinding_1.IKeybindingService, 'lookupKeybinding', function (id) { return null; });
            counter = 0;
        });
        test('get next element to focus after removing a match when it has next sibling match', function () {
            var fileMatch1 = aFileMatch();
            var fileMatch2 = aFileMatch();
            var data = [fileMatch1, aMatch(fileMatch1), aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), aMatch(fileMatch2)];
            var tree = aTree(data);
            var target = data[2];
            var testObject = instantiationService.createInstance(searchActions_1.ReplaceAction, tree, target, null);
            var actual = testObject.getElementToFocusAfterRemoved(tree, target);
            assert.equal(data[3], actual);
        });
        test('get next element to focus after removing a match when it does not have next sibling match', function () {
            var fileMatch1 = aFileMatch();
            var fileMatch2 = aFileMatch();
            var data = [fileMatch1, aMatch(fileMatch1), aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), aMatch(fileMatch2)];
            var tree = aTree(data);
            var target = data[5];
            var testObject = instantiationService.createInstance(searchActions_1.ReplaceAction, tree, target, null);
            var actual = testObject.getElementToFocusAfterRemoved(tree, target);
            assert.equal(data[4], actual);
        });
        test('get next element to focus after removing a match when it does not have next sibling match and previous match is file match', function () {
            var fileMatch1 = aFileMatch();
            var fileMatch2 = aFileMatch();
            var data = [fileMatch1, aMatch(fileMatch1), aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2)];
            var tree = aTree(data);
            var target = data[4];
            var testObject = instantiationService.createInstance(searchActions_1.ReplaceAction, tree, target, null);
            var actual = testObject.getElementToFocusAfterRemoved(tree, target);
            assert.equal(data[2], actual);
        });
        test('get next element to focus after removing a match when it is the only match', function () {
            var fileMatch1 = aFileMatch();
            var data = [fileMatch1, aMatch(fileMatch1)];
            var tree = aTree(data);
            var target = data[1];
            var testObject = instantiationService.createInstance(searchActions_1.ReplaceAction, tree, target, null);
            var actual = testObject.getElementToFocusAfterRemoved(tree, target);
            assert.equal(void 0, actual);
        });
        test('get next element to focus after removing a file match when it has next sibling', function () {
            var fileMatch1 = aFileMatch();
            var fileMatch2 = aFileMatch();
            var fileMatch3 = aFileMatch();
            var data = [fileMatch1, aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), fileMatch3, aMatch(fileMatch3)];
            var tree = aTree(data);
            var target = data[2];
            var testObject = instantiationService.createInstance(searchActions_1.ReplaceAction, tree, target, null);
            var actual = testObject.getElementToFocusAfterRemoved(tree, target);
            assert.equal(data[4], actual);
        });
        test('get next element to focus after removing a file match when it has no next sibling', function () {
            var fileMatch1 = aFileMatch();
            var fileMatch2 = aFileMatch();
            var fileMatch3 = aFileMatch();
            var data = [fileMatch1, aMatch(fileMatch1), fileMatch2, aMatch(fileMatch2), fileMatch3, aMatch(fileMatch3)];
            var tree = aTree(data);
            var target = data[4];
            var testObject = instantiationService.createInstance(searchActions_1.ReplaceAction, tree, target, null);
            var actual = testObject.getElementToFocusAfterRemoved(tree, target);
            assert.equal(data[3], actual);
        });
        test('get next element to focus after removing a file match when it is only match', function () {
            var fileMatch1 = aFileMatch();
            var data = [fileMatch1, aMatch(fileMatch1)];
            var tree = aTree(data);
            var target = data[0];
            var testObject = instantiationService.createInstance(searchActions_1.ReplaceAction, tree, target, null);
            var actual = testObject.getElementToFocusAfterRemoved(tree, target);
            assert.equal(void 0, actual);
        });
        function aFileMatch() {
            var rawMatch = {
                resource: uri_1.default.file('somepath' + ++counter),
                lineMatches: []
            };
            return instantiationService.createInstance(searchModel_1.FileMatch, null, null, null, rawMatch);
        }
        function aMatch(fileMatch) {
            var match = new searchModel_1.Match(fileMatch, 'some match', ++counter, 0, 2);
            fileMatch.add(match);
            return match;
        }
        function aTree(elements) {
            return instantiationServiceMock_1.stubFunction(treeImpl_1.Tree, 'getNavigator', function () { return new iterator_1.ArrayNavigator(elements); });
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            return instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl);
        }
    });
});
