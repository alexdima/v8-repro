/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/// <amd-dependency path="vs/css!./folding" />
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
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/base/common/strings", "vs/base/common/async", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/editorBrowser", "vs/editor/contrib/folding/foldingModel", "./foldingDecorations", "vs/editor/common/editorContextKeys", "vs/editor/contrib/folding/hiddenRangeModel", "vs/editor/common/modes/languageConfigurationRegistry", "vs/editor/contrib/folding/indentRangeProvider", "vs/css!./folding"], function (require, exports, nls, types, strings_1, async_1, keyCodes_1, lifecycle_1, editorExtensions_1, editorBrowser_1, foldingModel_1, foldingDecorations_1, editorContextKeys_1, hiddenRangeModel_1, languageConfigurationRegistry_1, indentRangeProvider_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ID = 'editor.contrib.folding';
    var FoldingController = /** @class */ (function () {
        function FoldingController(editor) {
            var _this = this;
            this.editor = editor;
            this._isEnabled = this.editor.getConfiguration().contribInfo.folding;
            this._autoHideFoldingControls = this.editor.getConfiguration().contribInfo.showFoldingControls === 'mouseover';
            this.globalToDispose = [];
            this.localToDispose = [];
            this.foldingDecorationProvider = new foldingDecorations_1.FoldingDecorationProvider(editor);
            this.foldingDecorationProvider.autoHideFoldingControls = this._autoHideFoldingControls;
            this.globalToDispose.push(this.editor.onDidChangeModel(function () { return _this.onModelChanged(); }));
            this.globalToDispose.push(this.editor.onDidChangeConfiguration(function (e) {
                if (e.contribInfo) {
                    var oldIsEnabled = _this._isEnabled;
                    _this._isEnabled = _this.editor.getConfiguration().contribInfo.folding;
                    if (oldIsEnabled !== _this._isEnabled) {
                        _this.onModelChanged();
                    }
                    var oldShowFoldingControls = _this._autoHideFoldingControls;
                    _this._autoHideFoldingControls = _this.editor.getConfiguration().contribInfo.showFoldingControls === 'mouseover';
                    if (oldShowFoldingControls !== _this._autoHideFoldingControls) {
                        _this.foldingDecorationProvider.autoHideFoldingControls = _this._autoHideFoldingControls;
                        _this.onModelContentChanged();
                    }
                }
            }));
            this.globalToDispose.push({ dispose: function () { return lifecycle_1.dispose(_this.localToDispose); } });
            this.onModelChanged();
        }
        FoldingController.get = function (editor) {
            return editor.getContribution(exports.ID);
        };
        FoldingController.prototype.getId = function () {
            return exports.ID;
        };
        FoldingController.prototype.dispose = function () {
            this.globalToDispose = lifecycle_1.dispose(this.globalToDispose);
        };
        /**
         * Store view state.
         */
        FoldingController.prototype.saveViewState = function () {
            var model = this.editor.getModel();
            if (!model || !this._isEnabled || model.isTooLargeForTokenization()) {
                return {};
            }
            return { collapsedRegions: this.foldingModel.getMemento(), lineCount: model.getLineCount() };
        };
        /**
         * Restore view state.
         */
        FoldingController.prototype.restoreViewState = function (state) {
            var model = this.editor.getModel();
            if (!model || !this._isEnabled || model.isTooLargeForTokenization()) {
                return;
            }
            if (!state || !state.collapsedRegions || state.lineCount !== model.getLineCount()) {
                return;
            }
            // set the hidden ranges right away, before waiting for the folding model.
            if (this.hiddenRangeModel.applyMemento(state.collapsedRegions)) {
                this.getFoldingModel().then(function (foldingModel) {
                    if (foldingModel) {
                        foldingModel.applyMemento(state.collapsedRegions);
                    }
                });
            }
        };
        FoldingController.prototype.onModelChanged = function () {
            var _this = this;
            this.localToDispose = lifecycle_1.dispose(this.localToDispose);
            var model = this.editor.getModel();
            if (!this._isEnabled || !model || model.isTooLargeForTokenization()) {
                // huge files get no view model, so they cannot support hidden areas
                return;
            }
            this.foldingModel = new foldingModel_1.FoldingModel(model, this.foldingDecorationProvider);
            this.localToDispose.push(this.foldingModel);
            this.hiddenRangeModel = new hiddenRangeModel_1.HiddenRangeModel(this.foldingModel);
            this.localToDispose.push(this.hiddenRangeModel);
            this.localToDispose.push(this.hiddenRangeModel.onDidChange(function (hr) { return _this.onHiddenRangesChanges(hr); }));
            this.updateScheduler = new async_1.Delayer(200);
            this.cursorChangedScheduler = new async_1.RunOnceScheduler(function () { return _this.revealCursor(); }, 200);
            this.localToDispose.push(this.cursorChangedScheduler);
            this.localToDispose.push(this.editor.onDidChangeModelLanguageConfiguration(function (e) { return _this.onModelContentChanged(); })); // covers model language changes as well
            this.localToDispose.push(this.editor.onDidChangeModelContent(function (e) { return _this.onModelContentChanged(); }));
            this.localToDispose.push(this.editor.onDidChangeCursorPosition(function (e) { return _this.onCursorPositionChanged(); }));
            this.localToDispose.push(this.editor.onMouseDown(function (e) { return _this.onEditorMouseDown(e); }));
            this.localToDispose.push(this.editor.onMouseUp(function (e) { return _this.onEditorMouseUp(e); }));
            this.localToDispose.push({
                dispose: function () {
                    _this.updateScheduler.cancel();
                    _this.updateScheduler = null;
                    _this.foldingModel = null;
                    _this.foldingModelPromise = null;
                    _this.hiddenRangeModel = null;
                    _this.cursorChangedScheduler = null;
                }
            });
            this.onModelContentChanged();
        };
        FoldingController.prototype.computeRanges = function (editorModel) {
            var foldingRules = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getFoldingRules(editorModel.getLanguageIdentifier().id);
            var offSide = foldingRules && foldingRules.offSide;
            var markers = foldingRules && foldingRules.markers;
            var ranges = indentRangeProvider_1.computeRanges(editorModel, offSide, markers);
            return ranges;
        };
        FoldingController.prototype.getFoldingModel = function () {
            return this.foldingModelPromise;
        };
        FoldingController.prototype.onModelContentChanged = function () {
            var _this = this;
            if (this.updateScheduler) {
                this.foldingModelPromise = this.updateScheduler.trigger(function () {
                    if (_this.foldingModel) {
                        // some cursors might have moved into hidden regions, make sure they are in expanded regions
                        var selections = _this.editor.getSelections();
                        var selectionLineNumbers = selections ? selections.map(function (s) { return s.startLineNumber; }) : [];
                        _this.foldingModel.update(_this.computeRanges(_this.foldingModel.textModel), selectionLineNumbers);
                    }
                    return _this.foldingModel;
                });
            }
        };
        FoldingController.prototype.onHiddenRangesChanges = function (hiddenRanges) {
            if (hiddenRanges.length) {
                var selections = this.editor.getSelections();
                if (selections) {
                    if (this.hiddenRangeModel.adjustSelections(selections)) {
                        this.editor.setSelections(selections);
                    }
                }
            }
            this.editor.setHiddenAreas(hiddenRanges);
        };
        FoldingController.prototype.onCursorPositionChanged = function () {
            if (this.hiddenRangeModel.hasRanges()) {
                this.cursorChangedScheduler.schedule();
            }
        };
        FoldingController.prototype.revealCursor = function () {
            var _this = this;
            this.getFoldingModel().then(function (foldingModel) {
                if (foldingModel) {
                    var selections = _this.editor.getSelections();
                    if (selections) {
                        var _loop_1 = function (selection) {
                            var lineNumber = selection.selectionStartLineNumber;
                            if (_this.hiddenRangeModel.isHidden(lineNumber)) {
                                var toToggle = foldingModel.getAllRegionsAtLine(lineNumber, function (r) { return r.isCollapsed && lineNumber > r.startLineNumber; });
                                foldingModel.toggleCollapseState(toToggle);
                            }
                        };
                        for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
                            var selection = selections_1[_i];
                            _loop_1(selection);
                        }
                    }
                }
            });
        };
        FoldingController.prototype.onEditorMouseDown = function (e) {
            this.mouseDownInfo = null;
            var range = e.target.range;
            if (!this.hiddenRangeModel || !range) {
                return;
            }
            if (!e.event.leftButton && !e.event.middleButton) {
                return;
            }
            var iconClicked = false;
            switch (e.target.type) {
                case editorBrowser_1.MouseTargetType.GUTTER_LINE_DECORATIONS:
                    var data = e.target.detail;
                    var gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth;
                    // TODO@joao TODO@alex TODO@martin this is such that we don't collide with dirty diff
                    if (gutterOffsetX <= 10) {
                        return;
                    }
                    iconClicked = true;
                    break;
                case editorBrowser_1.MouseTargetType.CONTENT_EMPTY: {
                    if (this.hiddenRangeModel.hasRanges()) {
                        var data_1 = e.target.detail;
                        if (!data_1.isAfterLines) {
                            break;
                        }
                    }
                    return;
                }
                case editorBrowser_1.MouseTargetType.CONTENT_TEXT: {
                    if (this.hiddenRangeModel.hasRanges()) {
                        var model = this.editor.getModel();
                        if (model && range.startColumn === model.getLineMaxColumn(range.startLineNumber)) {
                            break;
                        }
                    }
                    return;
                }
                default:
                    return;
            }
            this.mouseDownInfo = { lineNumber: range.startLineNumber, iconClicked: iconClicked };
        };
        FoldingController.prototype.onEditorMouseUp = function (e) {
            var _this = this;
            if (!this.mouseDownInfo) {
                return;
            }
            var lineNumber = this.mouseDownInfo.lineNumber;
            var iconClicked = this.mouseDownInfo.iconClicked;
            var range = e.target.range;
            if (!range || range.startLineNumber !== lineNumber) {
                return;
            }
            if (iconClicked) {
                if (e.target.type !== editorBrowser_1.MouseTargetType.GUTTER_LINE_DECORATIONS) {
                    return;
                }
            }
            else {
                var model = this.editor.getModel();
                if (range.startColumn !== model.getLineMaxColumn(lineNumber)) {
                    return;
                }
            }
            this.getFoldingModel().then(function (foldingModel) {
                if (foldingModel) {
                    var region = foldingModel.getRegionAtLine(lineNumber);
                    if (region && region.startLineNumber === lineNumber) {
                        var isCollapsed_1 = region.isCollapsed;
                        if (iconClicked || isCollapsed_1) {
                            var toToggle = [region];
                            if (e.event.middleButton || e.event.shiftKey) {
                                toToggle.push.apply(toToggle, foldingModel.getRegionsInside(region, function (r) { return r.isCollapsed === isCollapsed_1; }));
                            }
                            foldingModel.toggleCollapseState(toToggle);
                            _this.reveal(lineNumber);
                        }
                    }
                }
            });
        };
        FoldingController.prototype.reveal = function (focusLine) {
            this.editor.revealPositionInCenterIfOutsideViewport({ lineNumber: focusLine, column: 1 }, 0 /* Smooth */);
        };
        FoldingController.MAX_FOLDING_REGIONS = 5000;
        return FoldingController;
    }());
    exports.FoldingController = FoldingController;
    var FoldingAction = /** @class */ (function (_super) {
        __extends(FoldingAction, _super);
        function FoldingAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FoldingAction.prototype.runEditorCommand = function (accessor, editor, args) {
            var _this = this;
            var foldingController = FoldingController.get(editor);
            if (!foldingController) {
                return;
            }
            var foldingModelPromise = foldingController.getFoldingModel();
            if (foldingModelPromise) {
                this.reportTelemetry(accessor, editor);
                return foldingModelPromise.then(function (foldingModel) {
                    if (foldingModel) {
                        _this.invoke(foldingController, foldingModel, editor, args);
                    }
                });
            }
        };
        FoldingAction.prototype.getSelectedLines = function (editor) {
            var selections = editor.getSelections();
            return selections ? selections.map(function (s) { return s.startLineNumber; }) : [];
        };
        FoldingAction.prototype.getLineNumbers = function (args, editor) {
            if (args && args.selectionLines) {
                return args.selectionLines.map(function (l) { return l + 1; }); // to 0-bases line numbers
            }
            return this.getSelectedLines(editor);
        };
        FoldingAction.prototype.run = function (accessor, editor) {
        };
        return FoldingAction;
    }(editorExtensions_1.EditorAction));
    function foldingArgumentsConstraint(args) {
        if (!types.isUndefined(args)) {
            if (!types.isObject(args)) {
                return false;
            }
            var foldingArgs = args;
            if (!types.isUndefined(foldingArgs.levels) && !types.isNumber(foldingArgs.levels)) {
                return false;
            }
            if (!types.isUndefined(foldingArgs.direction) && !types.isString(foldingArgs.direction)) {
                return false;
            }
            if (!types.isUndefined(foldingArgs.selectionLines) && (!types.isArray(foldingArgs.selectionLines) || !foldingArgs.selectionLines.every(types.isNumber))) {
                return false;
            }
        }
        return true;
    }
    var UnfoldAction = /** @class */ (function (_super) {
        __extends(UnfoldAction, _super);
        function UnfoldAction() {
            return _super.call(this, {
                id: 'editor.unfold',
                label: nls.localize('unfoldAction.label', "Unfold"),
                alias: 'Unfold',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 89 /* US_CLOSE_SQUARE_BRACKET */,
                    mac: {
                        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 89 /* US_CLOSE_SQUARE_BRACKET */
                    }
                },
                description: {
                    description: 'Unfold the content in the editor',
                    args: [
                        {
                            name: 'Unfold editor argument',
                            description: "Property-value pairs that can be passed through this argument:\n\t\t\t\t\t\t* 'levels': Number of levels to unfold. If not set, defaults to 1.\n\t\t\t\t\t\t* 'direction': If 'up', unfold given number of levels up otherwise unfolds down\n\t\t\t\t\t\t* 'selectionLines': The start lines (0-based) of the editor selections to apply the unfold action to. If not set, the active selection(s) will be used.\n\t\t\t\t\t\t",
                            constraint: foldingArgumentsConstraint
                        }
                    ]
                }
            }) || this;
        }
        UnfoldAction.prototype.invoke = function (foldingController, foldingModel, editor, args) {
            var levels = args && args.levels || 1;
            var lineNumbers = this.getLineNumbers(args, editor);
            if (args && args.direction === 'up') {
                foldingModel_1.setCollapseStateLevelsUp(foldingModel, false, levels, lineNumbers);
            }
            else {
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, false, levels, lineNumbers);
            }
        };
        return UnfoldAction;
    }(FoldingAction));
    var UnFoldRecursivelyAction = /** @class */ (function (_super) {
        __extends(UnFoldRecursivelyAction, _super);
        function UnFoldRecursivelyAction() {
            return _super.call(this, {
                id: 'editor.unfoldRecursively',
                label: nls.localize('unFoldRecursivelyAction.label', "Unfold Recursively"),
                alias: 'Unfold Recursively',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 89 /* US_CLOSE_SQUARE_BRACKET */)
                }
            }) || this;
        }
        UnFoldRecursivelyAction.prototype.invoke = function (foldingController, foldingModel, editor, args) {
            foldingModel_1.setCollapseStateLevelsDown(foldingModel, false, Number.MAX_VALUE, this.getSelectedLines(editor));
        };
        return UnFoldRecursivelyAction;
    }(FoldingAction));
    var FoldAction = /** @class */ (function (_super) {
        __extends(FoldAction, _super);
        function FoldAction() {
            return _super.call(this, {
                id: 'editor.fold',
                label: nls.localize('foldAction.label', "Fold"),
                alias: 'Fold',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 87 /* US_OPEN_SQUARE_BRACKET */,
                    mac: {
                        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 87 /* US_OPEN_SQUARE_BRACKET */
                    }
                },
                description: {
                    description: 'Fold the content in the editor',
                    args: [
                        {
                            name: 'Fold editor argument',
                            description: "Property-value pairs that can be passed through this argument:\n\t\t\t\t\t\t\t* 'levels': Number of levels to fold. Defaults to 1\n\t\t\t\t\t\t\t* 'direction': If 'up', folds given number of levels up otherwise folds down\n\t\t\t\t\t\t\t* 'selectionLines': The start lines (0-based) of the editor selections to apply the fold action to. If not set, the active selection(s) will be used.\n\t\t\t\t\t\t",
                            constraint: foldingArgumentsConstraint
                        }
                    ]
                }
            }) || this;
        }
        FoldAction.prototype.invoke = function (foldingController, foldingModel, editor, args) {
            var levels = args && args.levels || 1;
            var lineNumbers = this.getLineNumbers(args, editor);
            if (args && args.direction === 'up') {
                foldingModel_1.setCollapseStateLevelsUp(foldingModel, true, levels, lineNumbers);
            }
            else {
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, true, levels, lineNumbers);
            }
        };
        return FoldAction;
    }(FoldingAction));
    var FoldRecursivelyAction = /** @class */ (function (_super) {
        __extends(FoldRecursivelyAction, _super);
        function FoldRecursivelyAction() {
            return _super.call(this, {
                id: 'editor.foldRecursively',
                label: nls.localize('foldRecursivelyAction.label', "Fold Recursively"),
                alias: 'Fold Recursively',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 87 /* US_OPEN_SQUARE_BRACKET */)
                }
            }) || this;
        }
        FoldRecursivelyAction.prototype.invoke = function (foldingController, foldingModel, editor) {
            var selectedLines = this.getSelectedLines(editor);
            foldingModel_1.setCollapseStateLevelsDown(foldingModel, true, Number.MAX_VALUE, selectedLines);
            if (selectedLines.length > 0) {
                foldingController.reveal(selectedLines[0]);
            }
        };
        return FoldRecursivelyAction;
    }(FoldingAction));
    var FoldAllBlockCommentsAction = /** @class */ (function (_super) {
        __extends(FoldAllBlockCommentsAction, _super);
        function FoldAllBlockCommentsAction() {
            return _super.call(this, {
                id: 'editor.foldAllBlockComments',
                label: nls.localize('foldAllBlockComments.label', "Fold All Block Comments"),
                alias: 'Fold All Block Comments',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 85 /* US_SLASH */)
                }
            }) || this;
        }
        FoldAllBlockCommentsAction.prototype.invoke = function (foldingController, foldingModel, editor) {
            var comments = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getComments(editor.getModel().getLanguageIdentifier().id);
            if (comments && comments.blockCommentStartToken) {
                var regExp = new RegExp('^\\s*' + strings_1.escapeRegExpCharacters(comments.blockCommentStartToken));
                foldingModel_1.setCollapseStateForMatchingLines(foldingModel, regExp, true);
            }
        };
        return FoldAllBlockCommentsAction;
    }(FoldingAction));
    var FoldAllRegionsAction = /** @class */ (function (_super) {
        __extends(FoldAllRegionsAction, _super);
        function FoldAllRegionsAction() {
            return _super.call(this, {
                id: 'editor.foldAllMarkerRegions',
                label: nls.localize('foldAllMarkerRegions.label', "Fold All Regions"),
                alias: 'Fold All Regions',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 29 /* KEY_8 */)
                }
            }) || this;
        }
        FoldAllRegionsAction.prototype.invoke = function (foldingController, foldingModel, editor) {
            var foldingRules = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getFoldingRules(editor.getModel().getLanguageIdentifier().id);
            if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
                var regExp = new RegExp(foldingRules.markers.start);
                foldingModel_1.setCollapseStateForMatchingLines(foldingModel, regExp, true);
            }
        };
        return FoldAllRegionsAction;
    }(FoldingAction));
    var UnfoldAllRegionsAction = /** @class */ (function (_super) {
        __extends(UnfoldAllRegionsAction, _super);
        function UnfoldAllRegionsAction() {
            return _super.call(this, {
                id: 'editor.unfoldAllMarkerRegions',
                label: nls.localize('unfoldAllMarkerRegions.label', "Unfold All Regions"),
                alias: 'Unfold All Regions',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 30 /* KEY_9 */)
                }
            }) || this;
        }
        UnfoldAllRegionsAction.prototype.invoke = function (foldingController, foldingModel, editor) {
            var foldingRules = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getFoldingRules(editor.getModel().getLanguageIdentifier().id);
            if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
                var regExp = new RegExp(foldingRules.markers.start);
                foldingModel_1.setCollapseStateForMatchingLines(foldingModel, regExp, false);
            }
        };
        return UnfoldAllRegionsAction;
    }(FoldingAction));
    var FoldAllAction = /** @class */ (function (_super) {
        __extends(FoldAllAction, _super);
        function FoldAllAction() {
            return _super.call(this, {
                id: 'editor.foldAll',
                label: nls.localize('foldAllAction.label', "Fold All"),
                alias: 'Fold All',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 21 /* KEY_0 */)
                }
            }) || this;
        }
        FoldAllAction.prototype.invoke = function (foldingController, foldingModel, editor) {
            foldingModel_1.setCollapseStateLevelsDown(foldingModel, true);
        };
        return FoldAllAction;
    }(FoldingAction));
    var UnfoldAllAction = /** @class */ (function (_super) {
        __extends(UnfoldAllAction, _super);
        function UnfoldAllAction() {
            return _super.call(this, {
                id: 'editor.unfoldAll',
                label: nls.localize('unfoldAllAction.label', "Unfold All"),
                alias: 'Unfold All',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 40 /* KEY_J */)
                }
            }) || this;
        }
        UnfoldAllAction.prototype.invoke = function (foldingController, foldingModel, editor) {
            foldingModel_1.setCollapseStateLevelsDown(foldingModel, false);
        };
        return UnfoldAllAction;
    }(FoldingAction));
    var FoldLevelAction = /** @class */ (function (_super) {
        __extends(FoldLevelAction, _super);
        function FoldLevelAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FoldLevelAction.prototype.getFoldingLevel = function () {
            return parseInt(this.id.substr(FoldLevelAction.ID_PREFIX.length));
        };
        FoldLevelAction.prototype.invoke = function (foldingController, foldingModel, editor) {
            foldingModel_1.setCollapseStateAtLevel(foldingModel, this.getFoldingLevel(), true, this.getSelectedLines(editor));
        };
        FoldLevelAction.ID_PREFIX = 'editor.foldLevel';
        FoldLevelAction.ID = function (level) { return FoldLevelAction.ID_PREFIX + level; };
        return FoldLevelAction;
    }(FoldingAction));
    editorExtensions_1.registerEditorContribution(FoldingController);
    editorExtensions_1.registerEditorAction(UnfoldAction);
    editorExtensions_1.registerEditorAction(UnFoldRecursivelyAction);
    editorExtensions_1.registerEditorAction(FoldAction);
    editorExtensions_1.registerEditorAction(FoldRecursivelyAction);
    editorExtensions_1.registerEditorAction(FoldAllAction);
    editorExtensions_1.registerEditorAction(UnfoldAllAction);
    editorExtensions_1.registerEditorAction(FoldAllBlockCommentsAction);
    editorExtensions_1.registerEditorAction(FoldAllRegionsAction);
    editorExtensions_1.registerEditorAction(UnfoldAllRegionsAction);
    for (var i = 1; i <= 7; i++) {
        editorExtensions_1.registerInstantiatedEditorAction(new FoldLevelAction({
            id: FoldLevelAction.ID(i),
            label: nls.localize('foldLevelAction.label', "Fold Level {0}", i),
            alias: "Fold Level " + i,
            precondition: null,
            kbOpts: {
                kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | (21 /* KEY_0 */ + i))
            }
        }));
    }
});
