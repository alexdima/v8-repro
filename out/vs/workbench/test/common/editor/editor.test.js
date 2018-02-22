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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/base/common/uri", "vs/workbench/services/untitled/common/untitledEditorService", "vs/workbench/test/workbenchTestServices", "vs/base/common/network"], function (require, exports, assert, winjs_base_1, editor_1, diffEditorInput_1, uri_1, untitledEditorService_1, workbenchTestServices_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(untitledEditorService) {
            this.untitledEditorService = untitledEditorService;
        }
        ServiceAccessor = __decorate([
            __param(0, untitledEditorService_1.IUntitledEditorService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    var FileEditorInput = /** @class */ (function (_super) {
        __extends(FileEditorInput, _super);
        function FileEditorInput(resource) {
            var _this = _super.call(this) || this;
            _this.resource = resource;
            return _this;
        }
        FileEditorInput.prototype.getTypeId = function () {
            return 'editorResourceFileTest';
        };
        FileEditorInput.prototype.getResource = function () {
            return this.resource;
        };
        FileEditorInput.prototype.resolve = function (refresh) {
            return winjs_base_1.TPromise.as(null);
        };
        return FileEditorInput;
    }(editor_1.EditorInput));
    suite('Workbench - Editor', function () {
        var instantiationService;
        var accessor;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
        });
        teardown(function () {
            accessor.untitledEditorService.revertAll();
            accessor.untitledEditorService.dispose();
        });
        test('toResource', function () {
            var service = accessor.untitledEditorService;
            assert.ok(!editor_1.toResource(null));
            var untitled = service.createOrGet();
            assert.equal(editor_1.toResource(untitled).toString(), untitled.getResource().toString());
            assert.equal(editor_1.toResource(untitled, { supportSideBySide: true }).toString(), untitled.getResource().toString());
            assert.equal(editor_1.toResource(untitled, { filter: network_1.Schemas.untitled }).toString(), untitled.getResource().toString());
            assert.equal(editor_1.toResource(untitled, { filter: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), untitled.getResource().toString());
            assert.ok(!editor_1.toResource(untitled, { filter: network_1.Schemas.file }));
            var file = new FileEditorInput(uri_1.default.file('/some/path.txt'));
            assert.equal(editor_1.toResource(file).toString(), file.getResource().toString());
            assert.equal(editor_1.toResource(file, { supportSideBySide: true }).toString(), file.getResource().toString());
            assert.equal(editor_1.toResource(file, { filter: network_1.Schemas.file }).toString(), file.getResource().toString());
            assert.equal(editor_1.toResource(file, { filter: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), file.getResource().toString());
            assert.ok(!editor_1.toResource(file, { filter: network_1.Schemas.untitled }));
            var diffEditorInput = new diffEditorInput_1.DiffEditorInput('name', 'description', untitled, file);
            assert.ok(!editor_1.toResource(diffEditorInput));
            assert.ok(!editor_1.toResource(diffEditorInput, { filter: network_1.Schemas.file }));
            assert.ok(!editor_1.toResource(diffEditorInput, { supportSideBySide: false }));
            assert.equal(editor_1.toResource(file, { supportSideBySide: true }).toString(), file.getResource().toString());
            assert.equal(editor_1.toResource(file, { supportSideBySide: true, filter: network_1.Schemas.file }).toString(), file.getResource().toString());
            assert.equal(editor_1.toResource(file, { supportSideBySide: true, filter: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), file.getResource().toString());
        });
    });
});
