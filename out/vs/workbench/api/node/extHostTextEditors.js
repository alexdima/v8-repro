define(["require", "exports", "vs/base/common/event", "vs/base/common/async", "./extHostTypes", "./extHostTypeConverters", "./extHostTextEditor", "vs/platform/editor/common/editor", "./extHost.protocol"], function (require, exports, event_1, async_1, extHostTypes_1, TypeConverters, extHostTextEditor_1, editor_1, extHost_protocol_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostEditors = /** @class */ (function () {
        function ExtHostEditors(mainContext, extHostDocumentsAndEditors) {
            var _this = this;
            this._onDidChangeTextEditorSelection = new event_1.Emitter();
            this._onDidChangeTextEditorOptions = new event_1.Emitter();
            this._onDidChangeTextEditorViewColumn = new event_1.Emitter();
            this._onDidChangeActiveTextEditor = new event_1.Emitter();
            this._onDidChangeVisibleTextEditors = new event_1.Emitter();
            this.onDidChangeTextEditorSelection = this._onDidChangeTextEditorSelection.event;
            this.onDidChangeTextEditorOptions = this._onDidChangeTextEditorOptions.event;
            this.onDidChangeTextEditorViewColumn = this._onDidChangeTextEditorViewColumn.event;
            this.onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
            this.onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadTextEditors);
            this._extHostDocumentsAndEditors = extHostDocumentsAndEditors;
            this._extHostDocumentsAndEditors.onDidChangeVisibleTextEditors(function (e) { return _this._onDidChangeVisibleTextEditors.fire(e); });
            this._extHostDocumentsAndEditors.onDidChangeActiveTextEditor(function (e) { return _this._onDidChangeActiveTextEditor.fire(e); });
        }
        ExtHostEditors.prototype.getActiveTextEditor = function () {
            return this._extHostDocumentsAndEditors.activeEditor();
        };
        ExtHostEditors.prototype.getVisibleTextEditors = function () {
            return this._extHostDocumentsAndEditors.allEditors();
        };
        ExtHostEditors.prototype.showTextDocument = function (document, columnOrOptions, preserveFocus) {
            var _this = this;
            var options;
            if (typeof columnOrOptions === 'number') {
                options = {
                    position: TypeConverters.fromViewColumn(columnOrOptions),
                    preserveFocus: preserveFocus
                };
            }
            else if (typeof columnOrOptions === 'object') {
                options = {
                    position: TypeConverters.fromViewColumn(columnOrOptions.viewColumn),
                    preserveFocus: columnOrOptions.preserveFocus,
                    selection: typeof columnOrOptions.selection === 'object' ? TypeConverters.fromRange(columnOrOptions.selection) : undefined,
                    pinned: typeof columnOrOptions.preview === 'boolean' ? !columnOrOptions.preview : undefined
                };
            }
            else {
                options = {
                    position: editor_1.Position.ONE,
                    preserveFocus: false
                };
            }
            return this._proxy.$tryShowTextDocument(document.uri, options).then(function (id) {
                var editor = _this._extHostDocumentsAndEditors.getEditor(id);
                if (editor) {
                    return editor;
                }
                else {
                    throw new Error("Failed to show text document " + document.uri.toString() + ", should show in editor #" + id);
                }
            });
        };
        ExtHostEditors.prototype.createTextEditorDecorationType = function (options) {
            return new extHostTextEditor_1.TextEditorDecorationType(this._proxy, options);
        };
        ExtHostEditors.prototype.applyWorkspaceEdit = function (edit) {
            var dto = { edits: [] };
            for (var _i = 0, _a = edit.entries(); _i < _a.length; _i++) {
                var entry = _a[_i];
                var uri = entry[0], uriOrEdits = entry[1];
                if (Array.isArray(uriOrEdits)) {
                    var doc = this._extHostDocumentsAndEditors.getDocument(uri.toString());
                    dto.edits.push({
                        resource: uri,
                        modelVersionId: doc && doc.version,
                        edits: uriOrEdits.map(TypeConverters.TextEdit.from)
                    });
                    // } else {
                    // 	dto.edits.push({ oldUri: uri, newUri: uriOrEdits });
                }
            }
            return this._proxy.$tryApplyWorkspaceEdit(dto);
        };
        // --- called from main thread
        ExtHostEditors.prototype.$acceptOptionsChanged = function (id, opts) {
            var editor = this._extHostDocumentsAndEditors.getEditor(id);
            editor._acceptOptions(opts);
            this._onDidChangeTextEditorOptions.fire({
                textEditor: editor,
                options: opts
            });
        };
        ExtHostEditors.prototype.$acceptSelectionsChanged = function (id, event) {
            var kind = extHostTypes_1.TextEditorSelectionChangeKind.fromValue(event.source);
            var selections = event.selections.map(TypeConverters.toSelection);
            var textEditor = this._extHostDocumentsAndEditors.getEditor(id);
            textEditor._acceptSelections(selections);
            this._onDidChangeTextEditorSelection.fire({
                textEditor: textEditor,
                selections: selections,
                kind: kind
            });
        };
        ExtHostEditors.prototype.$acceptEditorPositionData = function (data) {
            for (var id in data) {
                var textEditor = this._extHostDocumentsAndEditors.getEditor(id);
                var viewColumn = TypeConverters.toViewColumn(data[id]);
                if (textEditor.viewColumn !== viewColumn) {
                    textEditor._acceptViewColumn(viewColumn);
                    this._onDidChangeTextEditorViewColumn.fire({ textEditor: textEditor, viewColumn: viewColumn });
                }
            }
        };
        ExtHostEditors.prototype.getDiffInformation = function (id) {
            return async_1.toThenable(this._proxy.$getDiffInformation(id));
        };
        return ExtHostEditors;
    }());
    exports.ExtHostEditors = ExtHostEditors;
});
