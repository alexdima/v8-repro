var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/editor/common/model", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/group/common/groupService", "../node/extHost.protocol", "vs/editor/common/model/textModel", "vs/editor/common/services/resolverService", "vs/editor/common/services/modeService", "vs/editor/common/services/modelService", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, uri_1, model_1, codeEditorService_1, groupService_1, extHost_protocol_1, textModel_1, resolverService_1, modeService_1, modelService_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadDocumentContentProviders = /** @class */ (function () {
        function MainThreadDocumentContentProviders(extHostContext, _textModelResolverService, _modeService, _modelService, codeEditorService, editorGroupService) {
            this._textModelResolverService = _textModelResolverService;
            this._modeService = _modeService;
            this._modelService = _modelService;
            this._resourceContentProvider = Object.create(null);
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDocumentContentProviders);
        }
        MainThreadDocumentContentProviders.prototype.dispose = function () {
            for (var handle in this._resourceContentProvider) {
                this._resourceContentProvider[handle].dispose();
            }
        };
        MainThreadDocumentContentProviders.prototype.$registerTextContentProvider = function (handle, scheme) {
            var _this = this;
            this._resourceContentProvider[handle] = this._textModelResolverService.registerTextModelContentProvider(scheme, {
                provideTextContent: function (uri) {
                    return _this._proxy.$provideTextDocumentContent(handle, uri).then(function (value) {
                        if (typeof value === 'string') {
                            var firstLineText = value.substr(0, 1 + value.search(/\r?\n/));
                            var mode = _this._modeService.getOrCreateModeByFilenameOrFirstLine(uri.fsPath, firstLineText);
                            return _this._modelService.createModel(value, mode, uri);
                        }
                        return undefined;
                    });
                }
            });
        };
        MainThreadDocumentContentProviders.prototype.$unregisterTextContentProvider = function (handle) {
            var registration = this._resourceContentProvider[handle];
            if (registration) {
                registration.dispose();
                delete this._resourceContentProvider[handle];
            }
        };
        MainThreadDocumentContentProviders.prototype.$onVirtualDocumentChange = function (uri, value) {
            var model = this._modelService.getModel(uri_1.default.revive(uri));
            if (!model) {
                return;
            }
            var textBuffer = textModel_1.createTextBuffer(value, model_1.DefaultEndOfLine.CRLF);
            if (!model.equalsTextBuffer(textBuffer)) {
                model.setValueFromTextBuffer(textBuffer);
            }
        };
        MainThreadDocumentContentProviders = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadDocumentContentProviders),
            __param(1, resolverService_1.ITextModelService),
            __param(2, modeService_1.IModeService),
            __param(3, modelService_1.IModelService),
            __param(4, codeEditorService_1.ICodeEditorService),
            __param(5, groupService_1.IEditorGroupService)
        ], MainThreadDocumentContentProviders);
        return MainThreadDocumentContentProviders;
    }());
    exports.MainThreadDocumentContentProviders = MainThreadDocumentContentProviders;
});
