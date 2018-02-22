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
define(["require", "exports", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/editor/common/controller/cursorEvents", "vs/editor/common/model/textModel", "vs/editor/common/model"], function (require, exports, event_1, editorService_1, cursorEvents_1, textModel_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RangeHighlightDecorations = /** @class */ (function () {
        function RangeHighlightDecorations(editorService) {
            this.editorService = editorService;
            this.rangeHighlightDecorationId = null;
            this.editor = null;
            this.editorDisposables = [];
            this._onHighlightRemoved = new event_1.Emitter();
            this.onHighlghtRemoved = this._onHighlightRemoved.event;
        }
        RangeHighlightDecorations.prototype.removeHighlightRange = function () {
            if (this.editor && this.editor.getModel() && this.rangeHighlightDecorationId) {
                this.editor.deltaDecorations([this.rangeHighlightDecorationId], []);
                this._onHighlightRemoved.fire();
            }
            this.rangeHighlightDecorationId = null;
        };
        RangeHighlightDecorations.prototype.highlightRange = function (range, editor) {
            editor = editor ? editor : this.getEditor(range);
            if (editor) {
                this.doHighlightRange(editor, range);
            }
        };
        RangeHighlightDecorations.prototype.doHighlightRange = function (editor, selectionRange) {
            var _this = this;
            this.removeHighlightRange();
            editor.changeDecorations(function (changeAccessor) {
                _this.rangeHighlightDecorationId = changeAccessor.addDecoration(selectionRange.range, _this.createRangeHighlightDecoration(selectionRange.isWholeLine));
            });
            this.setEditor(editor);
        };
        RangeHighlightDecorations.prototype.getEditor = function (resourceRange) {
            var activeInput = this.editorService.getActiveEditorInput();
            var resource = activeInput && activeInput.getResource();
            if (resource) {
                if (resource.toString() === resourceRange.resource.toString()) {
                    return this.editorService.getActiveEditor().getControl();
                }
            }
            return null;
        };
        RangeHighlightDecorations.prototype.setEditor = function (editor) {
            var _this = this;
            if (this.editor !== editor) {
                this.disposeEditorListeners();
                this.editor = editor;
                this.editorDisposables.push(this.editor.onDidChangeCursorPosition(function (e) {
                    if (e.reason === cursorEvents_1.CursorChangeReason.NotSet
                        || e.reason === cursorEvents_1.CursorChangeReason.Explicit
                        || e.reason === cursorEvents_1.CursorChangeReason.Undo
                        || e.reason === cursorEvents_1.CursorChangeReason.Redo) {
                        _this.removeHighlightRange();
                    }
                }));
                this.editorDisposables.push(this.editor.onDidChangeModel(function () { _this.removeHighlightRange(); }));
                this.editorDisposables.push(this.editor.onDidDispose(function () {
                    _this.removeHighlightRange();
                    _this.editor = null;
                }));
            }
        };
        RangeHighlightDecorations.prototype.disposeEditorListeners = function () {
            this.editorDisposables.forEach(function (disposable) { return disposable.dispose(); });
            this.editorDisposables = [];
        };
        RangeHighlightDecorations.prototype.createRangeHighlightDecoration = function (isWholeLine) {
            if (isWholeLine === void 0) { isWholeLine = true; }
            return (isWholeLine ? RangeHighlightDecorations._WHOLE_LINE_RANGE_HIGHLIGHT : RangeHighlightDecorations._RANGE_HIGHLIGHT);
        };
        RangeHighlightDecorations.prototype.dispose = function () {
            if (this.editor && this.editor.getModel()) {
                this.removeHighlightRange();
                this.disposeEditorListeners();
                this.editor = null;
            }
        };
        RangeHighlightDecorations._WHOLE_LINE_RANGE_HIGHLIGHT = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'rangeHighlight',
            isWholeLine: true
        });
        RangeHighlightDecorations._RANGE_HIGHLIGHT = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'rangeHighlight'
        });
        RangeHighlightDecorations = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService)
        ], RangeHighlightDecorations);
        return RangeHighlightDecorations;
    }());
    exports.RangeHighlightDecorations = RangeHighlightDecorations;
});
