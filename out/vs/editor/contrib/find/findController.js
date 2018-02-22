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
define(["require", "exports", "vs/nls", "vs/base/common/history", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/contrib/find/findModel", "vs/editor/contrib/find/findState", "vs/base/common/async", "vs/editor/common/editorContextKeys", "vs/platform/storage/common/storage", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/editor/contrib/find/findWidget", "vs/editor/contrib/find/findOptionsWidget", "vs/platform/theme/common/themeService", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls, history_1, lifecycle_1, contextkey_1, strings, editorExtensions_1, findModel_1, findState_1, async_1, editorContextKeys_1, storage_1, clipboardService_1, contextView_1, keybinding_1, findWidget_1, findOptionsWidget_1, themeService_1, keybindingsRegistry_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getSelectionSearchString(editor) {
        var selection = editor.getSelection();
        // if selection spans multiple lines, default search string to empty
        if (selection.startLineNumber === selection.endLineNumber) {
            if (selection.isEmpty()) {
                var wordAtPosition = editor.getModel().getWordAtPosition(selection.getStartPosition());
                if (wordAtPosition) {
                    return wordAtPosition.word;
                }
            }
            else {
                return editor.getModel().getValueInRange(selection);
            }
        }
        return null;
    }
    exports.getSelectionSearchString = getSelectionSearchString;
    var FindStartFocusAction;
    (function (FindStartFocusAction) {
        FindStartFocusAction[FindStartFocusAction["NoFocusChange"] = 0] = "NoFocusChange";
        FindStartFocusAction[FindStartFocusAction["FocusFindInput"] = 1] = "FocusFindInput";
        FindStartFocusAction[FindStartFocusAction["FocusReplaceInput"] = 2] = "FocusReplaceInput";
    })(FindStartFocusAction = exports.FindStartFocusAction || (exports.FindStartFocusAction = {}));
    var CommonFindController = /** @class */ (function (_super) {
        __extends(CommonFindController, _super);
        function CommonFindController(editor, contextKeyService, storageService, clipboardService) {
            var _this = _super.call(this) || this;
            _this._editor = editor;
            _this._findWidgetVisible = findModel_1.CONTEXT_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
            _this._storageService = storageService;
            _this._clipboardService = clipboardService;
            _this._updateHistoryDelayer = new async_1.Delayer(500);
            _this._currentHistoryNavigator = new history_1.HistoryNavigator();
            _this._state = _this._register(new findState_1.FindReplaceState());
            _this.loadQueryState();
            _this._register(_this._state.onFindReplaceStateChange(function (e) { return _this._onStateChanged(e); }));
            _this._model = null;
            _this._register(_this._editor.onDidChangeModel(function () {
                var shouldRestartFind = (_this._editor.getModel() && _this._state.isRevealed);
                _this.disposeModel();
                _this._state.change({
                    searchScope: null,
                    matchCase: _this._storageService.getBoolean('editor.matchCase', storage_1.StorageScope.WORKSPACE, false),
                    wholeWord: _this._storageService.getBoolean('editor.wholeWord', storage_1.StorageScope.WORKSPACE, false),
                    isRegex: _this._storageService.getBoolean('editor.isRegex', storage_1.StorageScope.WORKSPACE, false)
                }, false);
                if (shouldRestartFind) {
                    _this._start({
                        forceRevealReplace: false,
                        seedSearchStringFromSelection: false && _this._editor.getConfiguration().contribInfo.find.seedSearchStringFromSelection,
                        seedSearchStringFromGlobalClipboard: false,
                        shouldFocus: 0 /* NoFocusChange */,
                        shouldAnimate: false,
                    });
                }
            }));
            return _this;
        }
        CommonFindController.get = function (editor) {
            return editor.getContribution(CommonFindController.ID);
        };
        CommonFindController.prototype.dispose = function () {
            this.disposeModel();
            _super.prototype.dispose.call(this);
        };
        CommonFindController.prototype.disposeModel = function () {
            if (this._model) {
                this._model.dispose();
                this._model = null;
            }
        };
        CommonFindController.prototype.getId = function () {
            return CommonFindController.ID;
        };
        CommonFindController.prototype._onStateChanged = function (e) {
            this.saveQueryState(e);
            if (e.updateHistory && e.searchString) {
                this._delayedUpdateHistory();
            }
            if (e.isRevealed) {
                if (this._state.isRevealed) {
                    this._findWidgetVisible.set(true);
                }
                else {
                    this._findWidgetVisible.reset();
                    this.disposeModel();
                }
            }
            if (e.searchString) {
                this.setGlobalBufferTerm(this._state.searchString);
            }
        };
        CommonFindController.prototype.saveQueryState = function (e) {
            if (e.isRegex) {
                this._storageService.store('editor.isRegex', this._state.actualIsRegex, storage_1.StorageScope.WORKSPACE);
            }
            if (e.wholeWord) {
                this._storageService.store('editor.wholeWord', this._state.actualWholeWord, storage_1.StorageScope.WORKSPACE);
            }
            if (e.matchCase) {
                this._storageService.store('editor.matchCase', this._state.actualMatchCase, storage_1.StorageScope.WORKSPACE);
            }
        };
        CommonFindController.prototype.loadQueryState = function () {
            this._state.change({
                matchCase: this._storageService.getBoolean('editor.matchCase', storage_1.StorageScope.WORKSPACE, this._state.matchCase),
                wholeWord: this._storageService.getBoolean('editor.wholeWord', storage_1.StorageScope.WORKSPACE, this._state.wholeWord),
                isRegex: this._storageService.getBoolean('editor.isRegex', storage_1.StorageScope.WORKSPACE, this._state.isRegex)
            }, false);
        };
        CommonFindController.prototype._delayedUpdateHistory = function () {
            this._updateHistoryDelayer.trigger(this._updateHistory.bind(this));
        };
        CommonFindController.prototype._updateHistory = function () {
            if (this._state.searchString) {
                this._currentHistoryNavigator.add(this._state.searchString);
            }
        };
        CommonFindController.prototype.getState = function () {
            return this._state;
        };
        CommonFindController.prototype.getHistory = function () {
            return this._currentHistoryNavigator;
        };
        CommonFindController.prototype.closeFindWidget = function () {
            this._state.change({
                isRevealed: false,
                searchScope: null
            }, false);
            this._editor.focus();
        };
        CommonFindController.prototype.toggleCaseSensitive = function () {
            this._state.change({ matchCase: !this._state.matchCase }, false);
        };
        CommonFindController.prototype.toggleWholeWords = function () {
            this._state.change({ wholeWord: !this._state.wholeWord }, false);
        };
        CommonFindController.prototype.toggleRegex = function () {
            this._state.change({ isRegex: !this._state.isRegex }, false);
        };
        CommonFindController.prototype.toggleSearchScope = function () {
            if (this._state.searchScope) {
                this._state.change({ searchScope: null }, true);
            }
            else {
                var selection = this._editor.getSelection();
                if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
                    selection = selection.setEndPosition(selection.endLineNumber - 1, 1);
                }
                if (!selection.isEmpty()) {
                    this._state.change({ searchScope: selection }, true);
                }
            }
        };
        CommonFindController.prototype.setSearchString = function (searchString) {
            this._state.change({ searchString: searchString }, false);
        };
        CommonFindController.prototype.highlightFindOptions = function () {
            // overwritten in subclass
        };
        CommonFindController.prototype._start = function (opts) {
            this.disposeModel();
            if (!this._editor.getModel()) {
                // cannot do anything with an editor that doesn't have a model...
                return;
            }
            var stateChanges = {
                isRevealed: true
            };
            if (opts.seedSearchStringFromSelection) {
                var selectionSearchString = getSelectionSearchString(this._editor);
                if (selectionSearchString) {
                    if (this._state.isRegex) {
                        stateChanges.searchString = strings.escapeRegExpCharacters(selectionSearchString);
                    }
                    else {
                        stateChanges.searchString = selectionSearchString;
                    }
                }
            }
            if (!stateChanges.searchString && opts.seedSearchStringFromGlobalClipboard) {
                var selectionSearchString = this.getGlobalBufferTerm();
                if (selectionSearchString) {
                    stateChanges.searchString = selectionSearchString;
                }
            }
            // Overwrite isReplaceRevealed
            if (opts.forceRevealReplace) {
                stateChanges.isReplaceRevealed = true;
            }
            else if (!this._findWidgetVisible.get()) {
                stateChanges.isReplaceRevealed = false;
            }
            this._state.change(stateChanges, false);
            if (!this._model) {
                this._model = new findModel_1.FindModelBoundToEditorModel(this._editor, this._state);
            }
        };
        CommonFindController.prototype.start = function (opts) {
            this._start(opts);
        };
        CommonFindController.prototype.moveToNextMatch = function () {
            if (this._model) {
                this._model.moveToNextMatch();
                return true;
            }
            return false;
        };
        CommonFindController.prototype.moveToPrevMatch = function () {
            if (this._model) {
                this._model.moveToPrevMatch();
                return true;
            }
            return false;
        };
        CommonFindController.prototype.replace = function () {
            if (this._model) {
                this._model.replace();
                return true;
            }
            return false;
        };
        CommonFindController.prototype.replaceAll = function () {
            if (this._model) {
                this._model.replaceAll();
                return true;
            }
            return false;
        };
        CommonFindController.prototype.selectAllMatches = function () {
            if (this._model) {
                this._model.selectAllMatches();
                this._editor.focus();
                return true;
            }
            return false;
        };
        CommonFindController.prototype.showPreviousFindTerm = function () {
            var previousTerm = this._currentHistoryNavigator.previous();
            if (previousTerm) {
                this._state.change({ searchString: previousTerm }, false, false);
            }
            return true;
        };
        CommonFindController.prototype.showNextFindTerm = function () {
            var nextTerm = this._currentHistoryNavigator.next();
            if (nextTerm) {
                this._state.change({ searchString: nextTerm }, false, false);
            }
            return true;
        };
        CommonFindController.prototype.getGlobalBufferTerm = function () {
            if (this._editor.getConfiguration().contribInfo.find.globalFindClipboard && this._clipboardService) {
                return this._clipboardService.readFindText();
            }
            return '';
        };
        CommonFindController.prototype.setGlobalBufferTerm = function (text) {
            if (this._editor.getConfiguration().contribInfo.find.globalFindClipboard && this._clipboardService) {
                this._clipboardService.writeFindText(text);
            }
        };
        CommonFindController.ID = 'editor.contrib.findController';
        CommonFindController = __decorate([
            __param(1, contextkey_1.IContextKeyService),
            __param(2, storage_1.IStorageService),
            __param(3, clipboardService_1.IClipboardService)
        ], CommonFindController);
        return CommonFindController;
    }(lifecycle_1.Disposable));
    exports.CommonFindController = CommonFindController;
    var FindController = /** @class */ (function (_super) {
        __extends(FindController, _super);
        function FindController(editor, _contextViewService, _contextKeyService, _keybindingService, _themeService, storageService, clipboardService) {
            var _this = _super.call(this, editor, _contextKeyService, storageService, clipboardService) || this;
            _this._contextViewService = _contextViewService;
            _this._contextKeyService = _contextKeyService;
            _this._keybindingService = _keybindingService;
            _this._themeService = _themeService;
            return _this;
        }
        FindController.prototype._start = function (opts) {
            if (!this._widget) {
                this._createFindWidget();
            }
            _super.prototype._start.call(this, opts);
            if (opts.shouldFocus === 2 /* FocusReplaceInput */) {
                this._widget.focusReplaceInput();
            }
            else if (opts.shouldFocus === 1 /* FocusFindInput */) {
                this._widget.focusFindInput();
            }
        };
        FindController.prototype.highlightFindOptions = function () {
            if (!this._widget) {
                this._createFindWidget();
            }
            if (this._state.isRevealed) {
                this._widget.highlightFindOptions();
            }
            else {
                this._findOptionsWidget.highlightFindOptions();
            }
        };
        FindController.prototype._createFindWidget = function () {
            this._widget = this._register(new findWidget_1.FindWidget(this._editor, this, this._state, this._contextViewService, this._keybindingService, this._contextKeyService, this._themeService));
            this._findOptionsWidget = this._register(new findOptionsWidget_1.FindOptionsWidget(this._editor, this._state, this._keybindingService, this._themeService));
        };
        FindController = __decorate([
            __param(1, contextView_1.IContextViewService),
            __param(2, contextkey_1.IContextKeyService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, themeService_1.IThemeService),
            __param(5, storage_1.IStorageService),
            __param(6, instantiation_1.optional(clipboardService_1.IClipboardService))
        ], FindController);
        return FindController;
    }(CommonFindController));
    exports.FindController = FindController;
    var StartFindAction = /** @class */ (function (_super) {
        __extends(StartFindAction, _super);
        function StartFindAction() {
            return _super.call(this, {
                id: findModel_1.FIND_IDS.StartFindAction,
                label: nls.localize('startFindAction', "Find"),
                alias: 'Find',
                precondition: null,
                kbOpts: {
                    kbExpr: null,
                    primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */
                }
            }) || this;
        }
        StartFindAction.prototype.run = function (accessor, editor) {
            var controller = CommonFindController.get(editor);
            if (controller) {
                controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: editor.getConfiguration().contribInfo.find.seedSearchStringFromSelection,
                    seedSearchStringFromGlobalClipboard: editor.getConfiguration().contribInfo.find.globalFindClipboard,
                    shouldFocus: 1 /* FocusFindInput */,
                    shouldAnimate: true
                });
            }
        };
        return StartFindAction;
    }(editorExtensions_1.EditorAction));
    exports.StartFindAction = StartFindAction;
    var StartFindWithSelectionAction = /** @class */ (function (_super) {
        __extends(StartFindWithSelectionAction, _super);
        function StartFindWithSelectionAction() {
            return _super.call(this, {
                id: findModel_1.FIND_IDS.StartFindWithSelection,
                label: nls.localize('startFindAction', "Find"),
                alias: 'Find',
                precondition: null,
                kbOpts: {
                    kbExpr: null,
                    primary: null,
                    mac: {
                        primary: 2048 /* CtrlCmd */ | 35 /* KEY_E */,
                    }
                }
            }) || this;
        }
        StartFindWithSelectionAction.prototype.run = function (accessor, editor) {
            var controller = CommonFindController.get(editor);
            if (controller) {
                controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: true,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 1 /* FocusFindInput */,
                    shouldAnimate: true
                });
                controller.setGlobalBufferTerm(controller.getState().searchString);
            }
        };
        return StartFindWithSelectionAction;
    }(editorExtensions_1.EditorAction));
    exports.StartFindWithSelectionAction = StartFindWithSelectionAction;
    var MatchFindAction = /** @class */ (function (_super) {
        __extends(MatchFindAction, _super);
        function MatchFindAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MatchFindAction.prototype.run = function (accessor, editor) {
            var controller = CommonFindController.get(editor);
            if (controller && !this._run(controller)) {
                controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: (controller.getState().searchString.length === 0) && editor.getConfiguration().contribInfo.find.seedSearchStringFromSelection,
                    seedSearchStringFromGlobalClipboard: true,
                    shouldFocus: 0 /* NoFocusChange */,
                    shouldAnimate: true
                });
                this._run(controller);
            }
        };
        return MatchFindAction;
    }(editorExtensions_1.EditorAction));
    exports.MatchFindAction = MatchFindAction;
    var NextMatchFindAction = /** @class */ (function (_super) {
        __extends(NextMatchFindAction, _super);
        function NextMatchFindAction() {
            return _super.call(this, {
                id: findModel_1.FIND_IDS.NextMatchFindAction,
                label: nls.localize('findNextMatchAction', "Find Next"),
                alias: 'Find Next',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 61 /* F3 */,
                    mac: { primary: 2048 /* CtrlCmd */ | 37 /* KEY_G */, secondary: [61 /* F3 */] }
                }
            }) || this;
        }
        NextMatchFindAction.prototype._run = function (controller) {
            return controller.moveToNextMatch();
        };
        return NextMatchFindAction;
    }(MatchFindAction));
    exports.NextMatchFindAction = NextMatchFindAction;
    var PreviousMatchFindAction = /** @class */ (function (_super) {
        __extends(PreviousMatchFindAction, _super);
        function PreviousMatchFindAction() {
            return _super.call(this, {
                id: findModel_1.FIND_IDS.PreviousMatchFindAction,
                label: nls.localize('findPreviousMatchAction', "Find Previous"),
                alias: 'Find Previous',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 1024 /* Shift */ | 61 /* F3 */,
                    mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KEY_G */, secondary: [1024 /* Shift */ | 61 /* F3 */] }
                }
            }) || this;
        }
        PreviousMatchFindAction.prototype._run = function (controller) {
            return controller.moveToPrevMatch();
        };
        return PreviousMatchFindAction;
    }(MatchFindAction));
    exports.PreviousMatchFindAction = PreviousMatchFindAction;
    var SelectionMatchFindAction = /** @class */ (function (_super) {
        __extends(SelectionMatchFindAction, _super);
        function SelectionMatchFindAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SelectionMatchFindAction.prototype.run = function (accessor, editor) {
            var controller = CommonFindController.get(editor);
            if (!controller) {
                return;
            }
            var selectionSearchString = getSelectionSearchString(editor);
            if (selectionSearchString) {
                controller.setSearchString(selectionSearchString);
            }
            if (!this._run(controller)) {
                controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* NoFocusChange */,
                    shouldAnimate: true
                });
                this._run(controller);
            }
        };
        return SelectionMatchFindAction;
    }(editorExtensions_1.EditorAction));
    exports.SelectionMatchFindAction = SelectionMatchFindAction;
    var NextSelectionMatchFindAction = /** @class */ (function (_super) {
        __extends(NextSelectionMatchFindAction, _super);
        function NextSelectionMatchFindAction() {
            return _super.call(this, {
                id: findModel_1.FIND_IDS.NextSelectionMatchFindAction,
                label: nls.localize('nextSelectionMatchFindAction', "Find Next Selection"),
                alias: 'Find Next Selection',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* CtrlCmd */ | 61 /* F3 */
                }
            }) || this;
        }
        NextSelectionMatchFindAction.prototype._run = function (controller) {
            return controller.moveToNextMatch();
        };
        return NextSelectionMatchFindAction;
    }(SelectionMatchFindAction));
    exports.NextSelectionMatchFindAction = NextSelectionMatchFindAction;
    var PreviousSelectionMatchFindAction = /** @class */ (function (_super) {
        __extends(PreviousSelectionMatchFindAction, _super);
        function PreviousSelectionMatchFindAction() {
            return _super.call(this, {
                id: findModel_1.FIND_IDS.PreviousSelectionMatchFindAction,
                label: nls.localize('previousSelectionMatchFindAction', "Find Previous Selection"),
                alias: 'Find Previous Selection',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 61 /* F3 */
                }
            }) || this;
        }
        PreviousSelectionMatchFindAction.prototype._run = function (controller) {
            return controller.moveToPrevMatch();
        };
        return PreviousSelectionMatchFindAction;
    }(SelectionMatchFindAction));
    exports.PreviousSelectionMatchFindAction = PreviousSelectionMatchFindAction;
    var StartFindReplaceAction = /** @class */ (function (_super) {
        __extends(StartFindReplaceAction, _super);
        function StartFindReplaceAction() {
            return _super.call(this, {
                id: findModel_1.FIND_IDS.StartFindReplaceAction,
                label: nls.localize('startReplace', "Replace"),
                alias: 'Replace',
                precondition: null,
                kbOpts: {
                    kbExpr: null,
                    primary: 2048 /* CtrlCmd */ | 38 /* KEY_H */,
                    mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 36 /* KEY_F */ }
                }
            }) || this;
        }
        StartFindReplaceAction.prototype.run = function (accessor, editor) {
            if (editor.getConfiguration().readOnly) {
                return;
            }
            var controller = CommonFindController.get(editor);
            var currentSelection = editor.getSelection();
            // we only seed search string from selection when the current selection is single line and not empty.
            var seedSearchStringFromSelection = !currentSelection.isEmpty() &&
                currentSelection.startLineNumber === currentSelection.endLineNumber && editor.getConfiguration().contribInfo.find.seedSearchStringFromSelection;
            var oldSearchString = controller.getState().searchString;
            // if the existing search string in find widget is empty and we don't seed search string from selection, it means the Find Input
            // is still empty, so we should focus the Find Input instead of Replace Input.
            var shouldFocus = (!!oldSearchString || seedSearchStringFromSelection) ?
                2 /* FocusReplaceInput */ : 1 /* FocusFindInput */;
            if (controller) {
                controller.start({
                    forceRevealReplace: true,
                    seedSearchStringFromSelection: seedSearchStringFromSelection,
                    seedSearchStringFromGlobalClipboard: editor.getConfiguration().contribInfo.find.seedSearchStringFromSelection,
                    shouldFocus: shouldFocus,
                    shouldAnimate: true
                });
            }
        };
        return StartFindReplaceAction;
    }(editorExtensions_1.EditorAction));
    exports.StartFindReplaceAction = StartFindReplaceAction;
    var ShowNextFindTermAction = /** @class */ (function (_super) {
        __extends(ShowNextFindTermAction, _super);
        function ShowNextFindTermAction() {
            return _super.call(this, {
                id: findModel_1.FIND_IDS.ShowNextFindTermAction,
                label: nls.localize('showNextFindTermAction', "Show Next Find Term"),
                alias: 'Show Next Find Term',
                precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
                kbOpts: {
                    weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
                    kbExpr: contextkey_1.ContextKeyExpr.and(findModel_1.CONTEXT_FIND_INPUT_FOCUSED, editorContextKeys_1.EditorContextKeys.focus),
                    primary: findModel_1.ShowNextFindTermKeybinding.primary,
                    mac: findModel_1.ShowNextFindTermKeybinding.mac,
                    win: findModel_1.ShowNextFindTermKeybinding.win,
                    linux: findModel_1.ShowNextFindTermKeybinding.linux
                }
            }) || this;
        }
        ShowNextFindTermAction.prototype._run = function (controller) {
            return controller.showNextFindTerm();
        };
        return ShowNextFindTermAction;
    }(MatchFindAction));
    exports.ShowNextFindTermAction = ShowNextFindTermAction;
    var ShowPreviousFindTermAction = /** @class */ (function (_super) {
        __extends(ShowPreviousFindTermAction, _super);
        function ShowPreviousFindTermAction() {
            return _super.call(this, {
                id: findModel_1.FIND_IDS.ShowPreviousFindTermAction,
                label: nls.localize('showPreviousFindTermAction', "Show Previous Find Term"),
                alias: 'Find Show Previous Find Term',
                precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
                kbOpts: {
                    weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
                    kbExpr: contextkey_1.ContextKeyExpr.and(findModel_1.CONTEXT_FIND_INPUT_FOCUSED, editorContextKeys_1.EditorContextKeys.focus),
                    primary: findModel_1.ShowPreviousFindTermKeybinding.primary,
                    mac: findModel_1.ShowPreviousFindTermKeybinding.mac,
                    win: findModel_1.ShowPreviousFindTermKeybinding.win,
                    linux: findModel_1.ShowPreviousFindTermKeybinding.linux
                }
            }) || this;
        }
        ShowPreviousFindTermAction.prototype._run = function (controller) {
            return controller.showPreviousFindTerm();
        };
        return ShowPreviousFindTermAction;
    }(MatchFindAction));
    exports.ShowPreviousFindTermAction = ShowPreviousFindTermAction;
    editorExtensions_1.registerEditorContribution(FindController);
    editorExtensions_1.registerEditorAction(StartFindAction);
    editorExtensions_1.registerEditorAction(StartFindWithSelectionAction);
    editorExtensions_1.registerEditorAction(NextMatchFindAction);
    editorExtensions_1.registerEditorAction(PreviousMatchFindAction);
    editorExtensions_1.registerEditorAction(NextSelectionMatchFindAction);
    editorExtensions_1.registerEditorAction(PreviousSelectionMatchFindAction);
    editorExtensions_1.registerEditorAction(StartFindReplaceAction);
    editorExtensions_1.registerEditorAction(ShowNextFindTermAction);
    editorExtensions_1.registerEditorAction(ShowPreviousFindTermAction);
    var FindCommand = editorExtensions_1.EditorCommand.bindToContribution(CommonFindController.get);
    editorExtensions_1.registerEditorCommand(new FindCommand({
        id: findModel_1.FIND_IDS.CloseFindWidgetCommand,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: function (x) { return x.closeFindWidget(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* Escape */,
            secondary: [1024 /* Shift */ | 9 /* Escape */]
        }
    }));
    editorExtensions_1.registerEditorCommand(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleCaseSensitiveCommand,
        precondition: null,
        handler: function (x) { return x.toggleCaseSensitive(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleCaseSensitiveKeybinding.primary,
            mac: findModel_1.ToggleCaseSensitiveKeybinding.mac,
            win: findModel_1.ToggleCaseSensitiveKeybinding.win,
            linux: findModel_1.ToggleCaseSensitiveKeybinding.linux
        }
    }));
    editorExtensions_1.registerEditorCommand(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleWholeWordCommand,
        precondition: null,
        handler: function (x) { return x.toggleWholeWords(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleWholeWordKeybinding.primary,
            mac: findModel_1.ToggleWholeWordKeybinding.mac,
            win: findModel_1.ToggleWholeWordKeybinding.win,
            linux: findModel_1.ToggleWholeWordKeybinding.linux
        }
    }));
    editorExtensions_1.registerEditorCommand(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleRegexCommand,
        precondition: null,
        handler: function (x) { return x.toggleRegex(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleRegexKeybinding.primary,
            mac: findModel_1.ToggleRegexKeybinding.mac,
            win: findModel_1.ToggleRegexKeybinding.win,
            linux: findModel_1.ToggleRegexKeybinding.linux
        }
    }));
    editorExtensions_1.registerEditorCommand(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleSearchScopeCommand,
        precondition: null,
        handler: function (x) { return x.toggleSearchScope(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleSearchScopeKeybinding.primary,
            mac: findModel_1.ToggleSearchScopeKeybinding.mac,
            win: findModel_1.ToggleSearchScopeKeybinding.win,
            linux: findModel_1.ToggleSearchScopeKeybinding.linux
        }
    }));
    editorExtensions_1.registerEditorCommand(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceOneAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: function (x) { return x.replace(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 22 /* KEY_1 */
        }
    }));
    editorExtensions_1.registerEditorCommand(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceAllAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: function (x) { return x.replaceAll(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 3 /* Enter */
        }
    }));
    editorExtensions_1.registerEditorCommand(new FindCommand({
        id: findModel_1.FIND_IDS.SelectAllMatchesAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: function (x) { return x.selectAllMatches(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(5),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 512 /* Alt */ | 3 /* Enter */
        }
    }));
});
