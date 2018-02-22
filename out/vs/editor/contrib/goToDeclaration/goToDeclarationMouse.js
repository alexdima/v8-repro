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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/winjs.base", "vs/editor/common/services/modeService", "vs/editor/common/core/range", "vs/editor/common/modes", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "./goToDeclaration", "vs/base/common/lifecycle", "vs/editor/common/services/resolverService", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/editor/browser/core/editorState", "./goToDeclarationCommands", "vs/editor/contrib/goToDeclaration/clickLinkGesture", "vs/css!./goToDeclarationMouse"], function (require, exports, nls, async_1, errors_1, htmlContent_1, winjs_base_1, modeService_1, range_1, modes_1, editorBrowser_1, editorExtensions_1, goToDeclaration_1, lifecycle_1, resolverService_1, themeService_1, colorRegistry_1, editorState_1, goToDeclarationCommands_1, clickLinkGesture_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var GotoDefinitionWithMouseEditorContribution = /** @class */ (function () {
        function GotoDefinitionWithMouseEditorContribution(editor, textModelResolverService, modeService) {
            var _this = this;
            this.textModelResolverService = textModelResolverService;
            this.modeService = modeService;
            this.toUnhook = [];
            this.decorations = [];
            this.editor = editor;
            this.throttler = new async_1.Throttler();
            var linkGesture = new clickLinkGesture_1.ClickLinkGesture(editor);
            this.toUnhook.push(linkGesture);
            this.toUnhook.push(linkGesture.onMouseMoveOrRelevantKeyDown(function (_a) {
                var mouseEvent = _a[0], keyboardEvent = _a[1];
                _this.startFindDefinition(mouseEvent, keyboardEvent);
            }));
            this.toUnhook.push(linkGesture.onExecute(function (mouseEvent) {
                if (_this.isEnabled(mouseEvent)) {
                    _this.gotoDefinition(mouseEvent.target, mouseEvent.hasSideBySideModifier).done(function () {
                        _this.removeDecorations();
                    }, function (error) {
                        _this.removeDecorations();
                        errors_1.onUnexpectedError(error);
                    });
                }
            }));
            this.toUnhook.push(linkGesture.onCancel(function () {
                _this.removeDecorations();
                _this.currentWordUnderMouse = null;
            }));
        }
        GotoDefinitionWithMouseEditorContribution.prototype.startFindDefinition = function (mouseEvent, withKey) {
            var _this = this;
            if (!this.isEnabled(mouseEvent, withKey)) {
                this.currentWordUnderMouse = null;
                this.removeDecorations();
                return;
            }
            // Find word at mouse position
            var position = mouseEvent.target.position;
            var word = position ? this.editor.getModel().getWordAtPosition(position) : null;
            if (!word) {
                this.currentWordUnderMouse = null;
                this.removeDecorations();
                return;
            }
            // Return early if word at position is still the same
            if (this.currentWordUnderMouse && this.currentWordUnderMouse.startColumn === word.startColumn && this.currentWordUnderMouse.endColumn === word.endColumn && this.currentWordUnderMouse.word === word.word) {
                return;
            }
            this.currentWordUnderMouse = word;
            // Find definition and decorate word if found
            var state = new editorState_1.EditorState(this.editor, 4 /* Position */ | 1 /* Value */ | 2 /* Selection */ | 8 /* Scroll */);
            this.throttler.queue(function () {
                return state.validate(_this.editor)
                    ? _this.findDefinition(mouseEvent.target)
                    : winjs_base_1.TPromise.wrap(null);
            }).then(function (results) {
                if (!results || !results.length || !state.validate(_this.editor)) {
                    _this.removeDecorations();
                    return;
                }
                // Multiple results
                if (results.length > 1) {
                    _this.addDecoration(new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn), new htmlContent_1.MarkdownString().appendText(nls.localize('multipleResults', "Click to show {0} definitions.", results.length)));
                }
                else {
                    var result_1 = results[0];
                    if (!result_1.uri) {
                        return;
                    }
                    _this.textModelResolverService.createModelReference(result_1.uri).then(function (ref) {
                        if (!ref.object || !ref.object.textEditorModel) {
                            ref.dispose();
                            return;
                        }
                        var textEditorModel = ref.object.textEditorModel;
                        var startLineNumber = result_1.range.startLineNumber;
                        if (textEditorModel.getLineMaxColumn(startLineNumber) === 0) {
                            ref.dispose();
                            return;
                        }
                        var startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
                        var maxLineNumber = Math.min(textEditorModel.getLineCount(), startLineNumber + GotoDefinitionWithMouseEditorContribution.MAX_SOURCE_PREVIEW_LINES);
                        var endLineNumber = startLineNumber + 1;
                        var minIndent = startIndent;
                        for (; endLineNumber < maxLineNumber; endLineNumber++) {
                            var endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
                            minIndent = Math.min(minIndent, endIndent);
                            if (startIndent === endIndent) {
                                break;
                            }
                        }
                        var previewRange = new range_1.Range(startLineNumber, 1, endLineNumber + 1, 1);
                        var value = textEditorModel.getValueInRange(previewRange).replace(new RegExp("^\\s{" + (minIndent - 1) + "}", 'gm'), '').trim();
                        _this.addDecoration(new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn), new htmlContent_1.MarkdownString().appendCodeblock(_this.modeService.getModeIdByFilenameOrFirstLine(textEditorModel.uri.fsPath), value));
                        ref.dispose();
                    });
                }
            }).done(undefined, errors_1.onUnexpectedError);
        };
        GotoDefinitionWithMouseEditorContribution.prototype.addDecoration = function (range, hoverMessage) {
            var newDecorations = {
                range: range,
                options: {
                    inlineClassName: 'goto-definition-link',
                    hoverMessage: hoverMessage
                }
            };
            this.decorations = this.editor.deltaDecorations(this.decorations, [newDecorations]);
        };
        GotoDefinitionWithMouseEditorContribution.prototype.removeDecorations = function () {
            if (this.decorations.length > 0) {
                this.decorations = this.editor.deltaDecorations(this.decorations, []);
            }
        };
        GotoDefinitionWithMouseEditorContribution.prototype.isEnabled = function (mouseEvent, withKey) {
            return this.editor.getModel() &&
                mouseEvent.isNoneOrSingleMouseDown &&
                mouseEvent.target.type === editorBrowser_1.MouseTargetType.CONTENT_TEXT &&
                (mouseEvent.hasTriggerModifier || (withKey && withKey.keyCodeIsTriggerKey)) &&
                modes_1.DefinitionProviderRegistry.has(this.editor.getModel());
        };
        GotoDefinitionWithMouseEditorContribution.prototype.findDefinition = function (target) {
            var model = this.editor.getModel();
            if (!model) {
                return winjs_base_1.TPromise.as(null);
            }
            return goToDeclaration_1.getDefinitionsAtPosition(this.editor.getModel(), target.position);
        };
        GotoDefinitionWithMouseEditorContribution.prototype.gotoDefinition = function (target, sideBySide) {
            var _this = this;
            this.editor.setPosition(target.position);
            var action = new goToDeclarationCommands_1.DefinitionAction(new goToDeclarationCommands_1.DefinitionActionConfig(sideBySide, false, true, false), { alias: undefined, label: undefined, id: undefined, precondition: undefined });
            return this.editor.invokeWithinContext(function (accessor) { return action.run(accessor, _this.editor); });
        };
        GotoDefinitionWithMouseEditorContribution.prototype.getId = function () {
            return GotoDefinitionWithMouseEditorContribution.ID;
        };
        GotoDefinitionWithMouseEditorContribution.prototype.dispose = function () {
            this.toUnhook = lifecycle_1.dispose(this.toUnhook);
        };
        GotoDefinitionWithMouseEditorContribution.ID = 'editor.contrib.gotodefinitionwithmouse';
        GotoDefinitionWithMouseEditorContribution.MAX_SOURCE_PREVIEW_LINES = 8;
        GotoDefinitionWithMouseEditorContribution = __decorate([
            __param(1, resolverService_1.ITextModelService),
            __param(2, modeService_1.IModeService)
        ], GotoDefinitionWithMouseEditorContribution);
        return GotoDefinitionWithMouseEditorContribution;
    }());
    editorExtensions_1.registerEditorContribution(GotoDefinitionWithMouseEditorContribution);
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var activeLinkForeground = theme.getColor(colorRegistry_1.editorActiveLinkForeground);
        if (activeLinkForeground) {
            collector.addRule(".monaco-editor .goto-definition-link { color: " + activeLinkForeground + " !important; }");
        }
    });
});
