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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/types", "vs/base/common/errors", "vs/base/parts/quickopen/common/quickOpen", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/workbench/browser/quickopen", "vs/editor/common/model", "vs/workbench/services/editor/common/editorService", "vs/platform/quickOpen/common/quickOpen", "vs/editor/browser/services/codeEditorService", "vs/editor/common/view/editorColorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, winjs_base_1, nls, types, errors, quickOpen_1, quickOpenModel_1, quickopen_1, model_1, editorService_1, quickOpen_2, codeEditorService_1, editorColorRegistry_1, themeService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GOTO_LINE_PREFIX = ':';
    var GotoLineAction = /** @class */ (function (_super) {
        __extends(GotoLineAction, _super);
        function GotoLineAction(actionId, actionLabel, _quickOpenService, editorService) {
            var _this = _super.call(this, actionId, actionLabel, exports.GOTO_LINE_PREFIX, _quickOpenService) || this;
            _this._quickOpenService = _quickOpenService;
            _this.editorService = editorService;
            return _this;
        }
        GotoLineAction.prototype.run = function () {
            var editor = codeEditorService_1.getCodeEditor(this.editorService.getActiveEditor());
            var restoreOptions = null;
            if (editor) {
                var config = editor.getConfiguration();
                if (config.viewInfo.renderLineNumbers === 2 /* Relative */) {
                    editor.updateOptions({
                        lineNumbers: 'on'
                    });
                    restoreOptions = {
                        lineNumbers: 'relative'
                    };
                }
            }
            var result = _super.prototype.run.call(this);
            if (restoreOptions) {
                var toDispose_1 = this._quickOpenService.onHide(function () {
                    if (!toDispose_1) {
                        return;
                    }
                    toDispose_1.dispose();
                    toDispose_1 = null;
                    editor.updateOptions(restoreOptions);
                });
            }
            return result;
        };
        GotoLineAction.ID = 'workbench.action.gotoLine';
        GotoLineAction.LABEL = nls.localize('gotoLine', "Go to Line...");
        GotoLineAction = __decorate([
            __param(2, quickOpen_2.IQuickOpenService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], GotoLineAction);
        return GotoLineAction;
    }(quickopen_1.QuickOpenAction));
    exports.GotoLineAction = GotoLineAction;
    var GotoLineEntry = /** @class */ (function (_super) {
        __extends(GotoLineEntry, _super);
        function GotoLineEntry(line, editorService, handler) {
            var _this = _super.call(this, editorService) || this;
            _this.parseInput(line);
            _this.handler = handler;
            return _this;
        }
        GotoLineEntry.prototype.parseInput = function (line) {
            var numbers = line.split(/,|:|#/).map(function (part) { return parseInt(part, 10); }).filter(function (part) { return !isNaN(part); });
            this.line = numbers[0];
            this.column = numbers[1];
        };
        GotoLineEntry.prototype.getLabel = function () {
            // Inform user about valid range if input is invalid
            var maxLineNumber = this.getMaxLineNumber();
            if (this.invalidRange(maxLineNumber)) {
                if (maxLineNumber > 0) {
                    return nls.localize('gotoLineLabelEmptyWithLimit', "Type a line number between 1 and {0} to navigate to", maxLineNumber);
                }
                return nls.localize('gotoLineLabelEmpty', "Type a line number to navigate to");
            }
            // Input valid, indicate action
            return this.column ? nls.localize('gotoLineColumnLabel', "Go to line {0} and character {1}", this.line, this.column) : nls.localize('gotoLineLabel', "Go to line {0}", this.line);
        };
        GotoLineEntry.prototype.invalidRange = function (maxLineNumber) {
            if (maxLineNumber === void 0) { maxLineNumber = this.getMaxLineNumber(); }
            return !this.line || !types.isNumber(this.line) || (maxLineNumber > 0 && types.isNumber(this.line) && this.line > maxLineNumber);
        };
        GotoLineEntry.prototype.getMaxLineNumber = function () {
            var editor = this.editorService.getActiveEditor();
            var editorControl = editor.getControl();
            var model = editorControl.getModel();
            if (model && model.modified && model.original) {
                model = model.modified; // Support for diff editor models
            }
            return model && types.isFunction(model.getLineCount) ? model.getLineCount() : -1;
        };
        GotoLineEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                return this.runOpen(context);
            }
            return this.runPreview();
        };
        GotoLineEntry.prototype.getInput = function () {
            return this.editorService.getActiveEditorInput();
        };
        GotoLineEntry.prototype.getOptions = function (pinned) {
            return {
                selection: this.toSelection(),
                pinned: pinned
            };
        };
        GotoLineEntry.prototype.runOpen = function (context) {
            // No-op if range is not valid
            if (this.invalidRange()) {
                return false;
            }
            // Check for sideBySide use
            var sideBySide = context.keymods.ctrlCmd;
            if (sideBySide) {
                this.editorService.openEditor(this.getInput(), this.getOptions(context.keymods.alt), true).done(null, errors.onUnexpectedError);
            }
            // Apply selection and focus
            var range = this.toSelection();
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor) {
                var editor = activeEditor.getControl();
                editor.setSelection(range);
                editor.revealRangeInCenter(range, 0 /* Smooth */);
            }
            return true;
        };
        GotoLineEntry.prototype.runPreview = function () {
            // No-op if range is not valid
            if (this.invalidRange()) {
                this.handler.clearDecorations();
                return false;
            }
            // Select Line Position
            var range = this.toSelection();
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor) {
                var editorControl = activeEditor.getControl();
                editorControl.revealRangeInCenter(range, 0 /* Smooth */);
                // Decorate if possible
                if (types.isFunction(editorControl.changeDecorations)) {
                    this.handler.decorateOutline(range, editorControl, activeEditor.position);
                }
            }
            return false;
        };
        GotoLineEntry.prototype.toSelection = function () {
            return {
                startLineNumber: this.line,
                startColumn: this.column || 1,
                endLineNumber: this.line,
                endColumn: this.column || 1
            };
        };
        return GotoLineEntry;
    }(quickopen_1.EditorQuickOpenEntry));
    var GotoLineHandler = /** @class */ (function (_super) {
        __extends(GotoLineHandler, _super);
        function GotoLineHandler(editorService) {
            var _this = _super.call(this) || this;
            _this.editorService = editorService;
            return _this;
        }
        GotoLineHandler.prototype.getAriaLabel = function () {
            return nls.localize('gotoLineHandlerAriaLabel', "Type a line number to navigate to.");
        };
        GotoLineHandler.prototype.getResults = function (searchValue) {
            searchValue = searchValue.trim();
            // Remember view state to be able to restore on cancel
            if (!this.lastKnownEditorViewState) {
                var editor = this.editorService.getActiveEditor();
                this.lastKnownEditorViewState = editor.getControl().saveViewState();
            }
            return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel([new GotoLineEntry(searchValue, this.editorService, this)]));
        };
        GotoLineHandler.prototype.canRun = function () {
            var canRun = codeEditorService_1.getCodeEditor(this.editorService.getActiveEditor()) !== null;
            return canRun ? true : nls.localize('cannotRunGotoLine', "Open a text file first to go to a line");
        };
        GotoLineHandler.prototype.decorateOutline = function (range, editor, position) {
            var _this = this;
            editor.changeDecorations(function (changeAccessor) {
                var deleteDecorations = [];
                if (_this.rangeHighlightDecorationId) {
                    deleteDecorations.push(_this.rangeHighlightDecorationId.lineDecorationId);
                    deleteDecorations.push(_this.rangeHighlightDecorationId.rangeHighlightId);
                    _this.rangeHighlightDecorationId = null;
                }
                var newDecorations = [
                    // rangeHighlight at index 0
                    {
                        range: range,
                        options: {
                            className: 'rangeHighlight',
                            isWholeLine: true
                        }
                    },
                    // lineDecoration at index 1
                    {
                        range: range,
                        options: {
                            overviewRuler: {
                                color: themeService_1.themeColorFromId(editorColorRegistry_1.overviewRulerRangeHighlight),
                                darkColor: themeService_1.themeColorFromId(editorColorRegistry_1.overviewRulerRangeHighlight),
                                position: model_1.OverviewRulerLane.Full
                            }
                        }
                    }
                ];
                var decorations = changeAccessor.deltaDecorations(deleteDecorations, newDecorations);
                var rangeHighlightId = decorations[0];
                var lineDecorationId = decorations[1];
                _this.rangeHighlightDecorationId = {
                    rangeHighlightId: rangeHighlightId,
                    lineDecorationId: lineDecorationId,
                    position: position
                };
            });
        };
        GotoLineHandler.prototype.clearDecorations = function () {
            var _this = this;
            if (this.rangeHighlightDecorationId) {
                this.editorService.getVisibleEditors().forEach(function (editor) {
                    if (editor.position === _this.rangeHighlightDecorationId.position) {
                        var editorControl = editor.getControl();
                        editorControl.changeDecorations(function (changeAccessor) {
                            changeAccessor.deltaDecorations([
                                _this.rangeHighlightDecorationId.lineDecorationId,
                                _this.rangeHighlightDecorationId.rangeHighlightId
                            ], []);
                        });
                    }
                });
                this.rangeHighlightDecorationId = null;
            }
        };
        GotoLineHandler.prototype.onClose = function (canceled) {
            // Clear Highlight Decorations if present
            this.clearDecorations();
            // Restore selection if canceled
            if (canceled && this.lastKnownEditorViewState) {
                var activeEditor = this.editorService.getActiveEditor();
                if (activeEditor) {
                    var editor = activeEditor.getControl();
                    editor.restoreViewState(this.lastKnownEditorViewState);
                }
            }
            this.lastKnownEditorViewState = null;
        };
        GotoLineHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: searchValue.trim().length > 0
            };
        };
        GotoLineHandler.ID = 'workbench.picker.line';
        GotoLineHandler = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService)
        ], GotoLineHandler);
        return GotoLineHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.GotoLineHandler = GotoLineHandler;
});
