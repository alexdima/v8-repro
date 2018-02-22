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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/browser/editorExtensions", "vs/editor/common/services/editorWorkerService", "./inPlaceReplaceCommand", "vs/editor/browser/core/editorState", "vs/platform/theme/common/themeService", "vs/editor/common/view/editorColorRegistry", "vs/editor/common/model/textModel"], function (require, exports, nls, winjs_base_1, range_1, selection_1, editorContextKeys_1, editorExtensions_1, editorWorkerService_1, inPlaceReplaceCommand_1, editorState_1, themeService_1, editorColorRegistry_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var InPlaceReplaceController = /** @class */ (function () {
        function InPlaceReplaceController(editor, editorWorkerService) {
            this.editor = editor;
            this.editorWorkerService = editorWorkerService;
            this.currentRequest = winjs_base_1.TPromise.as(null);
            this.decorationRemover = winjs_base_1.TPromise.as(null);
            this.decorationIds = [];
        }
        InPlaceReplaceController.get = function (editor) {
            return editor.getContribution(InPlaceReplaceController.ID);
        };
        InPlaceReplaceController.prototype.dispose = function () {
        };
        InPlaceReplaceController.prototype.getId = function () {
            return InPlaceReplaceController.ID;
        };
        InPlaceReplaceController.prototype.run = function (source, up) {
            var _this = this;
            // cancel any pending request
            this.currentRequest.cancel();
            var selection = this.editor.getSelection(), model = this.editor.getModel(), modelURI = model.uri;
            if (selection.startLineNumber !== selection.endLineNumber) {
                // Can't accept multiline selection
                return null;
            }
            var state = new editorState_1.EditorState(this.editor, 1 /* Value */ | 4 /* Position */);
            if (!this.editorWorkerService.canNavigateValueSet(modelURI)) {
                this.currentRequest = winjs_base_1.TPromise.as(null);
            }
            else {
                this.currentRequest = this.editorWorkerService.navigateValueSet(modelURI, selection, up);
                this.currentRequest = this.currentRequest.then(function (basicResult) {
                    if (basicResult && basicResult.range && basicResult.value) {
                        return basicResult;
                    }
                    return null;
                });
            }
            return this.currentRequest.then(function (result) {
                if (!result || !result.range || !result.value) {
                    // No proper result
                    return;
                }
                if (!state.validate(_this.editor)) {
                    // state has changed
                    return;
                }
                // Selection
                var editRange = range_1.Range.lift(result.range), highlightRange = result.range, diff = result.value.length - (selection.endColumn - selection.startColumn);
                // highlight
                highlightRange = {
                    startLineNumber: highlightRange.startLineNumber,
                    startColumn: highlightRange.startColumn,
                    endLineNumber: highlightRange.endLineNumber,
                    endColumn: highlightRange.startColumn + result.value.length
                };
                if (diff > 1) {
                    selection = new selection_1.Selection(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn + diff - 1);
                }
                // Insert new text
                var command = new inPlaceReplaceCommand_1.InPlaceReplaceCommand(editRange, selection, result.value);
                _this.editor.pushUndoStop();
                _this.editor.executeCommand(source, command);
                _this.editor.pushUndoStop();
                // add decoration
                _this.decorationIds = _this.editor.deltaDecorations(_this.decorationIds, [{
                        range: highlightRange,
                        options: InPlaceReplaceController.DECORATION
                    }]);
                // remove decoration after delay
                _this.decorationRemover.cancel();
                _this.decorationRemover = winjs_base_1.TPromise.timeout(350);
                _this.decorationRemover.then(function () {
                    _this.editor.changeDecorations(function (accessor) {
                        _this.decorationIds = accessor.deltaDecorations(_this.decorationIds, []);
                    });
                });
            });
        };
        InPlaceReplaceController.ID = 'editor.contrib.inPlaceReplaceController';
        InPlaceReplaceController.DECORATION = textModel_1.ModelDecorationOptions.register({
            className: 'valueSetReplacement'
        });
        InPlaceReplaceController = __decorate([
            __param(1, editorWorkerService_1.IEditorWorkerService)
        ], InPlaceReplaceController);
        return InPlaceReplaceController;
    }());
    var InPlaceReplaceUp = /** @class */ (function (_super) {
        __extends(InPlaceReplaceUp, _super);
        function InPlaceReplaceUp() {
            return _super.call(this, {
                id: 'editor.action.inPlaceReplace.up',
                label: nls.localize('InPlaceReplaceAction.previous.label', "Replace with Previous Value"),
                alias: 'Replace with Previous Value',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 82 /* US_COMMA */
                }
            }) || this;
        }
        InPlaceReplaceUp.prototype.run = function (accessor, editor) {
            var controller = InPlaceReplaceController.get(editor);
            if (!controller) {
                return undefined;
            }
            return controller.run(this.id, true);
        };
        return InPlaceReplaceUp;
    }(editorExtensions_1.EditorAction));
    var InPlaceReplaceDown = /** @class */ (function (_super) {
        __extends(InPlaceReplaceDown, _super);
        function InPlaceReplaceDown() {
            return _super.call(this, {
                id: 'editor.action.inPlaceReplace.down',
                label: nls.localize('InPlaceReplaceAction.next.label', "Replace with Next Value"),
                alias: 'Replace with Next Value',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 84 /* US_DOT */
                }
            }) || this;
        }
        InPlaceReplaceDown.prototype.run = function (accessor, editor) {
            var controller = InPlaceReplaceController.get(editor);
            if (!controller) {
                return undefined;
            }
            return controller.run(this.id, false);
        };
        return InPlaceReplaceDown;
    }(editorExtensions_1.EditorAction));
    editorExtensions_1.registerEditorContribution(InPlaceReplaceController);
    editorExtensions_1.registerEditorAction(InPlaceReplaceUp);
    editorExtensions_1.registerEditorAction(InPlaceReplaceDown);
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var border = theme.getColor(editorColorRegistry_1.editorBracketMatchBorder);
        if (border) {
            collector.addRule(".monaco-editor.vs .valueSetReplacement { outline: solid 2px " + border + "; }");
        }
    });
});
