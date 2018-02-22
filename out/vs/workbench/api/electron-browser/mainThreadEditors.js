var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/base/common/winjs.base", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/group/common/groupService", "vs/workbench/api/node/extHost.protocol", "vs/base/common/objects", "../node/extHost.protocol", "vs/editor/common/services/resolverService", "vs/platform/files/common/files", "vs/editor/browser/services/bulkEdit", "vs/editor/common/services/modelService", "vs/editor/browser/editorBrowser", "vs/editor/common/modes"], function (require, exports, uri_1, lifecycle_1, errors_1, winjs_base_1, codeEditorService_1, editorService_1, groupService_1, extHost_protocol_1, objects_1, extHost_protocol_2, resolverService_1, files_1, bulkEdit_1, modelService_1, editorBrowser_1, modes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadTextEditors = /** @class */ (function () {
        function MainThreadTextEditors(documentsAndEditors, extHostContext, _codeEditorService, workbenchEditorService, editorGroupService, _textModelResolverService, _fileService, _modelService) {
            var _this = this;
            this._codeEditorService = _codeEditorService;
            this._textModelResolverService = _textModelResolverService;
            this._fileService = _fileService;
            this._modelService = _modelService;
            this._proxy = extHostContext.getProxy(extHost_protocol_2.ExtHostContext.ExtHostEditors);
            this._documentsAndEditors = documentsAndEditors;
            this._workbenchEditorService = workbenchEditorService;
            this._toDispose = [];
            this._textEditorsListenersMap = Object.create(null);
            this._editorPositionData = null;
            this._toDispose.push(documentsAndEditors.onTextEditorAdd(function (editors) { return editors.forEach(_this._onTextEditorAdd, _this); }));
            this._toDispose.push(documentsAndEditors.onTextEditorRemove(function (editors) { return editors.forEach(_this._onTextEditorRemove, _this); }));
            this._toDispose.push(editorGroupService.onEditorsChanged(function () { return _this._updateActiveAndVisibleTextEditors(); }));
            this._toDispose.push(editorGroupService.onEditorGroupMoved(function () { return _this._updateActiveAndVisibleTextEditors(); }));
            this._registeredDecorationTypes = Object.create(null);
        }
        MainThreadTextEditors.prototype.dispose = function () {
            var _this = this;
            Object.keys(this._textEditorsListenersMap).forEach(function (editorId) {
                lifecycle_1.dispose(_this._textEditorsListenersMap[editorId]);
            });
            this._textEditorsListenersMap = Object.create(null);
            this._toDispose = lifecycle_1.dispose(this._toDispose);
            for (var decorationType in this._registeredDecorationTypes) {
                this._codeEditorService.removeDecorationType(decorationType);
            }
            this._registeredDecorationTypes = Object.create(null);
        };
        MainThreadTextEditors.prototype._onTextEditorAdd = function (textEditor) {
            var _this = this;
            var id = textEditor.getId();
            var toDispose = [];
            toDispose.push(textEditor.onConfigurationChanged(function (opts) {
                _this._proxy.$acceptOptionsChanged(id, opts);
            }));
            toDispose.push(textEditor.onSelectionChanged(function (event) {
                _this._proxy.$acceptSelectionsChanged(id, event);
            }));
            this._textEditorsListenersMap[id] = toDispose;
        };
        MainThreadTextEditors.prototype._onTextEditorRemove = function (id) {
            lifecycle_1.dispose(this._textEditorsListenersMap[id]);
            delete this._textEditorsListenersMap[id];
        };
        MainThreadTextEditors.prototype._updateActiveAndVisibleTextEditors = function () {
            // editor columns
            var editorPositionData = this._getTextEditorPositionData();
            if (!objects_1.equals(this._editorPositionData, editorPositionData)) {
                this._editorPositionData = editorPositionData;
                this._proxy.$acceptEditorPositionData(this._editorPositionData);
            }
        };
        MainThreadTextEditors.prototype._getTextEditorPositionData = function () {
            var result = Object.create(null);
            for (var _i = 0, _a = this._workbenchEditorService.getVisibleEditors(); _i < _a.length; _i++) {
                var workbenchEditor = _a[_i];
                var id = this._documentsAndEditors.findTextEditorIdFor(workbenchEditor);
                if (id) {
                    result[id] = workbenchEditor.position;
                }
            }
            return result;
        };
        // --- from extension host process
        MainThreadTextEditors.prototype.$tryShowTextDocument = function (resource, options) {
            var _this = this;
            var uri = uri_1.default.revive(resource);
            var editorOptions = {
                preserveFocus: options.preserveFocus,
                pinned: options.pinned,
                selection: options.selection
            };
            var input = {
                resource: uri,
                options: editorOptions
            };
            return this._workbenchEditorService.openEditor(input, options.position).then(function (editor) {
                if (!editor) {
                    return undefined;
                }
                return _this._documentsAndEditors.findTextEditorIdFor(editor);
            });
        };
        MainThreadTextEditors.prototype.$tryShowEditor = function (id, position) {
            var mainThreadEditor = this._documentsAndEditors.getEditor(id);
            if (mainThreadEditor) {
                var model = mainThreadEditor.getModel();
                return this._workbenchEditorService.openEditor({
                    resource: model.uri,
                    options: { preserveFocus: false }
                }, position).then(function () { return; });
            }
            return undefined;
        };
        MainThreadTextEditors.prototype.$tryHideEditor = function (id) {
            var mainThreadEditor = this._documentsAndEditors.getEditor(id);
            if (mainThreadEditor) {
                var editors = this._workbenchEditorService.getVisibleEditors();
                for (var _i = 0, editors_1 = editors; _i < editors_1.length; _i++) {
                    var editor = editors_1[_i];
                    if (mainThreadEditor.matches(editor)) {
                        return this._workbenchEditorService.closeEditor(editor.position, editor.input).then(function () { return; });
                    }
                }
            }
            return undefined;
        };
        MainThreadTextEditors.prototype.$trySetSelections = function (id, selections) {
            if (!this._documentsAndEditors.getEditor(id)) {
                return winjs_base_1.TPromise.wrapError(errors_1.disposed("TextEditor(" + id + ")"));
            }
            this._documentsAndEditors.getEditor(id).setSelections(selections);
            return winjs_base_1.TPromise.as(null);
        };
        MainThreadTextEditors.prototype.$trySetDecorations = function (id, key, ranges) {
            if (!this._documentsAndEditors.getEditor(id)) {
                return winjs_base_1.TPromise.wrapError(errors_1.disposed("TextEditor(" + id + ")"));
            }
            this._documentsAndEditors.getEditor(id).setDecorations(key, ranges);
            return winjs_base_1.TPromise.as(null);
        };
        MainThreadTextEditors.prototype.$trySetDecorationsFast = function (id, key, ranges) {
            if (!this._documentsAndEditors.getEditor(id)) {
                return winjs_base_1.TPromise.wrapError(errors_1.disposed("TextEditor(" + id + ")"));
            }
            this._documentsAndEditors.getEditor(id).setDecorationsFast(key, ranges);
            return winjs_base_1.TPromise.as(null);
        };
        MainThreadTextEditors.prototype.$tryRevealRange = function (id, range, revealType) {
            if (!this._documentsAndEditors.getEditor(id)) {
                return winjs_base_1.TPromise.wrapError(errors_1.disposed("TextEditor(" + id + ")"));
            }
            this._documentsAndEditors.getEditor(id).revealRange(range, revealType);
            return undefined;
        };
        MainThreadTextEditors.prototype.$trySetOptions = function (id, options) {
            if (!this._documentsAndEditors.getEditor(id)) {
                return winjs_base_1.TPromise.wrapError(errors_1.disposed("TextEditor(" + id + ")"));
            }
            this._documentsAndEditors.getEditor(id).setConfiguration(options);
            return winjs_base_1.TPromise.as(null);
        };
        MainThreadTextEditors.prototype.$tryApplyEdits = function (id, modelVersionId, edits, opts) {
            if (!this._documentsAndEditors.getEditor(id)) {
                return winjs_base_1.TPromise.wrapError(errors_1.disposed("TextEditor(" + id + ")"));
            }
            return winjs_base_1.TPromise.as(this._documentsAndEditors.getEditor(id).applyEdits(modelVersionId, edits, opts));
        };
        MainThreadTextEditors.prototype.$tryApplyWorkspaceEdit = function (dto) {
            var edits = extHost_protocol_1.reviveWorkspaceEditDto(dto).edits;
            // First check if loaded models were not changed in the meantime
            for (var i = 0, len = edits.length; i < len; i++) {
                var edit = edits[i];
                if (!modes_1.isResourceFileEdit(edit) && edit.modelVersionId) {
                    var model = this._modelService.getModel(edit.resource);
                    if (model && model.getVersionId() !== edit.modelVersionId) {
                        // model changed in the meantime
                        return winjs_base_1.TPromise.as(false);
                    }
                }
            }
            var codeEditor;
            var editor = this._workbenchEditorService.getActiveEditor();
            if (editor) {
                var candidate = editor.getControl();
                if (editorBrowser_1.isCodeEditor(candidate)) {
                    codeEditor = candidate;
                }
            }
            return bulkEdit_1.BulkEdit.perform(edits, this._textModelResolverService, this._fileService, codeEditor).then(function () { return true; });
        };
        MainThreadTextEditors.prototype.$tryInsertSnippet = function (id, template, ranges, opts) {
            if (!this._documentsAndEditors.getEditor(id)) {
                return winjs_base_1.TPromise.wrapError(errors_1.disposed("TextEditor(" + id + ")"));
            }
            return winjs_base_1.TPromise.as(this._documentsAndEditors.getEditor(id).insertSnippet(template, ranges, opts));
        };
        MainThreadTextEditors.prototype.$registerTextEditorDecorationType = function (key, options) {
            this._registeredDecorationTypes[key] = true;
            this._codeEditorService.registerDecorationType(key, options);
        };
        MainThreadTextEditors.prototype.$removeTextEditorDecorationType = function (key) {
            delete this._registeredDecorationTypes[key];
            this._codeEditorService.removeDecorationType(key);
        };
        MainThreadTextEditors.prototype.$getDiffInformation = function (id) {
            var editor = this._documentsAndEditors.getEditor(id);
            if (!editor) {
                return winjs_base_1.TPromise.wrapError(new Error('No such TextEditor'));
            }
            var codeEditor = editor.getCodeEditor();
            var codeEditorId = codeEditor.getId();
            var diffEditors = this._codeEditorService.listDiffEditors();
            var diffEditor = diffEditors.filter(function (d) { return d.getOriginalEditor().getId() === codeEditorId || d.getModifiedEditor().getId() === codeEditorId; })[0];
            if (!diffEditor) {
                return winjs_base_1.TPromise.as([]);
            }
            return winjs_base_1.TPromise.as(diffEditor.getLineChanges());
        };
        MainThreadTextEditors = __decorate([
            __param(2, codeEditorService_1.ICodeEditorService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, groupService_1.IEditorGroupService),
            __param(5, resolverService_1.ITextModelService),
            __param(6, files_1.IFileService),
            __param(7, modelService_1.IModelService)
        ], MainThreadTextEditors);
        return MainThreadTextEditors;
    }());
    exports.MainThreadTextEditors = MainThreadTextEditors;
});
