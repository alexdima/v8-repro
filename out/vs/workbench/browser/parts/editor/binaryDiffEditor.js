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
define(["require", "exports", "vs/nls", "vs/workbench/common/editor", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/editor/binaryEditor"], function (require, exports, nls, editor_1, telemetry_1, themeService_1, sideBySideEditor_1, instantiation_1, binaryEditor_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An implementation of editor for diffing binary files like images or videos.
     */
    var BinaryResourceDiffEditor = /** @class */ (function (_super) {
        __extends(BinaryResourceDiffEditor, _super);
        function BinaryResourceDiffEditor(telemetryService, instantiationService, themeService) {
            return _super.call(this, telemetryService, instantiationService, themeService) || this;
        }
        BinaryResourceDiffEditor.prototype.getMetadata = function () {
            var master = this.masterEditor;
            var details = this.detailsEditor;
            if (master instanceof binaryEditor_1.BaseBinaryResourceEditor && details instanceof binaryEditor_1.BaseBinaryResourceEditor) {
                return nls.localize('metadataDiff', "{0} ↔ {1}", details.getMetadata(), master.getMetadata());
            }
            return null;
        };
        BinaryResourceDiffEditor.ID = editor_1.BINARY_DIFF_EDITOR_ID;
        BinaryResourceDiffEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, themeService_1.IThemeService)
        ], BinaryResourceDiffEditor);
        return BinaryResourceDiffEditor;
    }(sideBySideEditor_1.SideBySideEditor));
    exports.BinaryResourceDiffEditor = BinaryResourceDiffEditor;
});
