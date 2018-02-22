/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/test/workbenchTestServices", "vs/workbench/common/editor/dataUriEditorInput"], function (require, exports, assert, uri_1, workbenchTestServices_1, dataUriEditorInput_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - DataUriEditorInput', function () {
        var instantiationService;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
        });
        test('simple', function () {
            var resource = uri_1.default.parse('data:image/png;label:SomeLabel;description:SomeDescription;size:1024;base64,77+9UE5');
            var input = instantiationService.createInstance(dataUriEditorInput_1.DataUriEditorInput, void 0, void 0, resource);
            assert.equal(input.getName(), 'SomeLabel');
            assert.equal(input.getDescription(), 'SomeDescription');
            return input.resolve().then(function (model) {
                assert.ok(model);
                assert.equal(model.getSize(), 1024);
                assert.equal(model.getMime(), 'image/png');
            });
        });
    });
});
