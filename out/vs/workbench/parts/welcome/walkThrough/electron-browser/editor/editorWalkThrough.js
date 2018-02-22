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
define(["require", "exports", "vs/nls", "vs/workbench/services/editor/common/editorService", "vs/platform/editor/common/editor", "vs/base/common/actions", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/workbench/parts/welcome/walkThrough/node/walkThroughInput", "vs/base/common/network"], function (require, exports, nls_1, editorService_1, editor_1, actions_1, instantiation_1, uri_1, walkThroughInput_1, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var typeId = 'workbench.editors.walkThroughInput';
    var inputOptions = {
        typeId: typeId,
        name: nls_1.localize('editorWalkThrough.title', "Interactive Playground"),
        resource: uri_1.default.parse(require.toUrl('./vs_code_editor_walkthrough.md'))
            .with({ scheme: network_1.Schemas.walkThrough }),
        telemetryFrom: 'walkThrough'
    };
    var EditorWalkThroughAction = /** @class */ (function (_super) {
        __extends(EditorWalkThroughAction, _super);
        function EditorWalkThroughAction(id, label, editorService, instantiationService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            _this.instantiationService = instantiationService;
            return _this;
        }
        EditorWalkThroughAction.prototype.run = function () {
            var input = this.instantiationService.createInstance(walkThroughInput_1.WalkThroughInput, inputOptions);
            return this.editorService.openEditor(input, { pinned: true }, editor_1.Position.ONE)
                .then(function () { return void (0); });
        };
        EditorWalkThroughAction.ID = 'workbench.action.showInteractivePlayground';
        EditorWalkThroughAction.LABEL = nls_1.localize('editorWalkThrough', "Interactive Playground");
        EditorWalkThroughAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, instantiation_1.IInstantiationService)
        ], EditorWalkThroughAction);
        return EditorWalkThroughAction;
    }(actions_1.Action));
    exports.EditorWalkThroughAction = EditorWalkThroughAction;
    var EditorWalkThroughInputFactory = /** @class */ (function () {
        function EditorWalkThroughInputFactory() {
        }
        EditorWalkThroughInputFactory.prototype.serialize = function (editorInput) {
            return '{}';
        };
        EditorWalkThroughInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            return instantiationService.createInstance(walkThroughInput_1.WalkThroughInput, inputOptions);
        };
        EditorWalkThroughInputFactory.ID = typeId;
        return EditorWalkThroughInputFactory;
    }());
    exports.EditorWalkThroughInputFactory = EditorWalkThroughInputFactory;
});
