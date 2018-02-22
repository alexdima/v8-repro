/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/common/editor/resourceEditorInput", "vs/workbench/test/workbenchTestServices", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/platform/files/common/files"], function (require, exports, assert, uri_1, resourceEditorInput_1, workbenchTestServices_1, modelService_1, modeService_1, files_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(modelService, modeService) {
            this.modelService = modelService;
            this.modeService = modeService;
        }
        ServiceAccessor = __decorate([
            __param(0, modelService_1.IModelService),
            __param(1, modeService_1.IModeService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    suite('Workbench - ResourceEditorInput', function () {
        var instantiationService;
        var accessor;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
        });
        test('simple', function () {
            var resource = uri_1.default.from({ scheme: 'inmemory', authority: null, path: 'thePath' });
            accessor.modelService.createModel('function test() {}', accessor.modeService.getOrCreateMode('text'), resource);
            var input = instantiationService.createInstance(resourceEditorInput_1.ResourceEditorInput, 'The Name', 'The Description', resource);
            return input.resolve().then(function (model) {
                assert.ok(model);
                assert.equal(files_1.snapshotToString(model.createSnapshot()), 'function test() {}');
            });
        });
    });
});
