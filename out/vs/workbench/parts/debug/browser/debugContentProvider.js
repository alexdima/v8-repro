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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/mime", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/editor/common/services/resolverService", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/common/debugSource"], function (require, exports, nls_1, winjs_base_1, mime_1, modelService_1, modeService_1, resolverService_1, debug_1, debugSource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Debug URI format
     *
     * a debug URI represents a Source object and the debug session where the Source comes from.
     *
     *       debug:arbitrary_path?session=123e4567-e89b-12d3-a456-426655440000&ref=1016
     *       \___/ \____________/ \__________________________________________/ \______/
     *         |          |                             |                          |
     *      scheme   source.path                    session id            source.referencequery
     *
     * the arbitrary_path and the session id are encoded with 'encodeURIComponent'
     *
     */
    var DebugContentProvider = /** @class */ (function () {
        function DebugContentProvider(textModelResolverService, debugService, modelService, modeService) {
            this.debugService = debugService;
            this.modelService = modelService;
            this.modeService = modeService;
            textModelResolverService.registerTextModelContentProvider(debug_1.DEBUG_SCHEME, this);
        }
        DebugContentProvider.prototype.provideTextContent = function (resource) {
            var _this = this;
            var process;
            var sourceRef;
            if (resource.query) {
                var data_1 = debugSource_1.Source.getEncodedDebugData(resource);
                process = this.debugService.getModel().getProcesses().filter(function (p) { return p.getId() === data_1.processId; }).pop();
                sourceRef = data_1.sourceReference;
            }
            if (!process) {
                // fallback: use focused process
                process = this.debugService.getViewModel().focusedProcess;
            }
            if (!process) {
                return winjs_base_1.TPromise.wrapError(new Error(nls_1.localize('unable', "Unable to resolve the resource without a debug session")));
            }
            var source = process.sources.get(resource.toString());
            var rawSource;
            if (source) {
                rawSource = source.raw;
                if (!sourceRef) {
                    sourceRef = source.reference;
                }
            }
            else {
                // create a Source
                rawSource = {
                    path: resource.with({ scheme: '', query: '' }).toString(true),
                    sourceReference: sourceRef
                };
            }
            var createErrModel = function (message) {
                _this.debugService.sourceIsNotAvailable(resource);
                var modePromise = _this.modeService.getOrCreateMode(mime_1.MIME_TEXT);
                var model = _this.modelService.createModel(message, modePromise, resource);
                return model;
            };
            return process.session.source({ sourceReference: sourceRef, source: rawSource }).then(function (response) {
                if (!response) {
                    return createErrModel(nls_1.localize('canNotResolveSource', "Could not resolve resource {0}, no response from debug extension.", resource.toString()));
                }
                var mime = response.body.mimeType || mime_1.guessMimeTypes(resource.path)[0];
                var modePromise = _this.modeService.getOrCreateMode(mime);
                var model = _this.modelService.createModel(response.body.content, modePromise, resource);
                return model;
            }, function (err) { return createErrModel(err.message); });
        };
        DebugContentProvider = __decorate([
            __param(0, resolverService_1.ITextModelService),
            __param(1, debug_1.IDebugService),
            __param(2, modelService_1.IModelService),
            __param(3, modeService_1.IModeService)
        ], DebugContentProvider);
        return DebugContentProvider;
    }());
    exports.DebugContentProvider = DebugContentProvider;
});
