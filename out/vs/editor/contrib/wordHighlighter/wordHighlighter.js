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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/errors", "vs/editor/common/core/range", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "vs/base/common/lifecycle", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/editor/common/controller/cursorEvents", "vs/editor/common/model/textModel", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/base/common/arrays", "vs/editor/common/model"], function (require, exports, nls, async_1, errors_1, range_1, editorExtensions_1, modes_1, lifecycle_1, colorRegistry_1, themeService_1, cursorEvents_1, textModel_1, contextkey_1, editorContextKeys_1, arrays_1, model_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.editorWordHighlight = colorRegistry_1.registerColor('editor.wordHighlightBackground', { dark: '#575757B8', light: '#57575740', hc: null }, nls.localize('wordHighlight', 'Background color of a symbol during read-access, like reading a variable. The color must not be opaque to not hide underlying decorations.'), true);
    exports.editorWordHighlightStrong = colorRegistry_1.registerColor('editor.wordHighlightStrongBackground', { dark: '#004972B8', light: '#0e639c40', hc: null }, nls.localize('wordHighlightStrong', 'Background color of a symbol during write-access, like writing to a variable. The color must not be opaque to not hide underlying decorations.'), true);
    exports.overviewRulerWordHighlightForeground = colorRegistry_1.registerColor('editorOverviewRuler.wordHighlightForeground', { dark: '#A0A0A0', light: '#A0A0A0', hc: '#A0A0A0' }, nls.localize('overviewRulerWordHighlightForeground', 'Overview ruler marker color for symbol highlights.'));
    exports.overviewRulerWordHighlightStrongForeground = colorRegistry_1.registerColor('editorOverviewRuler.wordHighlightStrongForeground', { dark: '#C0A0C0', light: '#C0A0C0', hc: '#C0A0C0' }, nls.localize('overviewRulerWordHighlightStrongForeground', 'Overview ruler marker color for write-access symbol highlights.'));
    exports.ctxHasWordHighlights = new contextkey_1.RawContextKey('hasWordHighlights', false);
    function getOccurrencesAtPosition(model, position) {
        var orderedByScore = modes_1.DocumentHighlightProviderRegistry.ordered(model);
        var foundResult = false;
        // in order of score ask the occurrences provider
        // until someone response with a good result
        // (good = none empty array)
        return async_1.sequence(orderedByScore.map(function (provider) {
            return function () {
                if (!foundResult) {
                    return async_1.asWinJsPromise(function (token) {
                        return provider.provideDocumentHighlights(model, position, token);
                    }).then(function (data) {
                        if (Array.isArray(data) && data.length > 0) {
                            foundResult = true;
                            return data;
                        }
                        return undefined;
                    }, function (err) {
                        errors_1.onUnexpectedExternalError(err);
                        return undefined;
                    });
                }
                return undefined;
            };
        })).then(function (values) {
            return values[0];
        });
    }
    exports.getOccurrencesAtPosition = getOccurrencesAtPosition;
    editorExtensions_1.registerDefaultLanguageCommand('_executeDocumentHighlights', getOccurrencesAtPosition);
    var WordHighlighter = /** @class */ (function () {
        function WordHighlighter(editor, contextKeyService) {
            var _this = this;
            this.workerRequestTokenId = 0;
            this.workerRequest = null;
            this.workerRequestCompleted = false;
            this.workerRequestValue = [];
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
            this.editor = editor;
            this._hasWordHighlights = exports.ctxHasWordHighlights.bindTo(contextKeyService);
            this._ignorePositionChangeEvent = false;
            this.occurrencesHighlight = this.editor.getConfiguration().contribInfo.occurrencesHighlight;
            this.model = this.editor.getModel();
            this.toUnhook = [];
            this.toUnhook.push(editor.onDidChangeCursorPosition(function (e) {
                if (_this._ignorePositionChangeEvent) {
                    // We are changing the position => ignore this event
                    return;
                }
                if (!_this.occurrencesHighlight) {
                    // Early exit if nothing needs to be done!
                    // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                    return;
                }
                _this._onPositionChanged(e);
            }));
            this.toUnhook.push(editor.onDidChangeModel(function (e) {
                _this._stopAll();
                _this.model = _this.editor.getModel();
            }));
            this.toUnhook.push(editor.onDidChangeModelContent(function (e) {
                _this._stopAll();
            }));
            this.toUnhook.push(editor.onDidChangeConfiguration(function (e) {
                var newValue = _this.editor.getConfiguration().contribInfo.occurrencesHighlight;
                if (_this.occurrencesHighlight !== newValue) {
                    _this.occurrencesHighlight = newValue;
                    _this._stopAll();
                }
            }));
            this._lastWordRange = null;
            this._decorationIds = [];
            this.workerRequestTokenId = 0;
            this.workerRequest = null;
            this.workerRequestCompleted = false;
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
        }
        WordHighlighter.prototype.hasDecorations = function () {
            return (this._decorationIds.length > 0);
        };
        WordHighlighter.prototype.restore = function () {
            if (!this.occurrencesHighlight) {
                return;
            }
            this._run();
        };
        WordHighlighter.prototype._getSortedHighlights = function () {
            var _this = this;
            return this._decorationIds
                .map(function (id) { return _this.model.getDecorationRange(id); })
                .sort(range_1.Range.compareRangesUsingStarts);
        };
        WordHighlighter.prototype.moveNext = function () {
            var _this = this;
            var highlights = this._getSortedHighlights();
            var index = arrays_1.firstIndex(highlights, function (range) { return range.containsPosition(_this.editor.getPosition()); });
            var newIndex = ((index + 1) % highlights.length);
            var dest = highlights[newIndex];
            try {
                this._ignorePositionChangeEvent = true;
                this.editor.setPosition(dest.getStartPosition());
                this.editor.revealRangeInCenterIfOutsideViewport(dest);
            }
            finally {
                this._ignorePositionChangeEvent = false;
            }
        };
        WordHighlighter.prototype.moveBack = function () {
            var _this = this;
            var highlights = this._getSortedHighlights();
            var index = arrays_1.firstIndex(highlights, function (range) { return range.containsPosition(_this.editor.getPosition()); });
            var newIndex = ((index - 1 + highlights.length) % highlights.length);
            var dest = highlights[newIndex];
            try {
                this._ignorePositionChangeEvent = true;
                this.editor.setPosition(dest.getStartPosition());
                this.editor.revealRangeInCenterIfOutsideViewport(dest);
            }
            finally {
                this._ignorePositionChangeEvent = false;
            }
        };
        WordHighlighter.prototype._removeDecorations = function () {
            if (this._decorationIds.length > 0) {
                // remove decorations
                this._decorationIds = this.editor.deltaDecorations(this._decorationIds, []);
                this._hasWordHighlights.set(false);
            }
        };
        WordHighlighter.prototype._stopAll = function () {
            this._lastWordRange = null;
            // Remove any existing decorations
            this._removeDecorations();
            // Cancel any renderDecorationsTimer
            if (this.renderDecorationsTimer !== -1) {
                clearTimeout(this.renderDecorationsTimer);
                this.renderDecorationsTimer = -1;
            }
            // Cancel any worker request
            if (this.workerRequest !== null) {
                this.workerRequest.cancel();
                this.workerRequest = null;
            }
            // Invalidate any worker request callback
            if (!this.workerRequestCompleted) {
                this.workerRequestTokenId++;
                this.workerRequestCompleted = true;
            }
        };
        WordHighlighter.prototype._onPositionChanged = function (e) {
            // disabled
            if (!this.occurrencesHighlight) {
                this._stopAll();
                return;
            }
            // ignore typing & other
            if (e.reason !== cursorEvents_1.CursorChangeReason.Explicit) {
                this._stopAll();
                return;
            }
            this._run();
        };
        WordHighlighter.prototype._run = function () {
            var _this = this;
            // no providers for this model
            if (!modes_1.DocumentHighlightProviderRegistry.has(this.model)) {
                this._stopAll();
                return;
            }
            var editorSelection = this.editor.getSelection();
            // ignore multiline selection
            if (editorSelection.startLineNumber !== editorSelection.endLineNumber) {
                this._stopAll();
                return;
            }
            var lineNumber = editorSelection.startLineNumber;
            var startColumn = editorSelection.startColumn;
            var endColumn = editorSelection.endColumn;
            var word = this.model.getWordAtPosition({
                lineNumber: lineNumber,
                column: startColumn
            });
            // The selection must be inside a word or surround one word at most
            if (!word || word.startColumn > startColumn || word.endColumn < endColumn) {
                this._stopAll();
                return;
            }
            // All the effort below is trying to achieve this:
            // - when cursor is moved to a word, trigger immediately a findOccurrences request
            // - 250ms later after the last cursor move event, render the occurrences
            // - no flickering!
            var currentWordRange = new range_1.Range(lineNumber, word.startColumn, lineNumber, word.endColumn);
            var workerRequestIsValid = this._lastWordRange && this._lastWordRange.equalsRange(currentWordRange);
            // Even if we are on a different word, if that word is in the decorations ranges, the request is still valid
            // (Same symbol)
            for (var i = 0, len = this._decorationIds.length; !workerRequestIsValid && i < len; i++) {
                var range = this.model.getDecorationRange(this._decorationIds[i]);
                if (range && range.startLineNumber === lineNumber) {
                    if (range.startColumn <= startColumn && range.endColumn >= endColumn) {
                        workerRequestIsValid = true;
                    }
                }
            }
            // There are 4 cases:
            // a) old workerRequest is valid & completed, renderDecorationsTimer fired
            // b) old workerRequest is valid & completed, renderDecorationsTimer not fired
            // c) old workerRequest is valid, but not completed
            // d) old workerRequest is not valid
            // For a) no action is needed
            // For c), member 'lastCursorPositionChangeTime' will be used when installing the timer so no action is needed
            this.lastCursorPositionChangeTime = (new Date()).getTime();
            if (workerRequestIsValid) {
                if (this.workerRequestCompleted && this.renderDecorationsTimer !== -1) {
                    // case b)
                    // Delay the firing of renderDecorationsTimer by an extra 250 ms
                    clearTimeout(this.renderDecorationsTimer);
                    this.renderDecorationsTimer = -1;
                    this._beginRenderDecorations();
                }
            }
            else {
                // case d)
                // Stop all previous actions and start fresh
                this._stopAll();
                var myRequestId = ++this.workerRequestTokenId;
                this.workerRequestCompleted = false;
                this.workerRequest = getOccurrencesAtPosition(this.model, this.editor.getPosition());
                this.workerRequest.then(function (data) {
                    if (myRequestId === _this.workerRequestTokenId) {
                        _this.workerRequestCompleted = true;
                        _this.workerRequestValue = data || [];
                        _this._beginRenderDecorations();
                    }
                }).done();
            }
            this._lastWordRange = currentWordRange;
        };
        WordHighlighter.prototype._beginRenderDecorations = function () {
            var _this = this;
            var currentTime = (new Date()).getTime();
            var minimumRenderTime = this.lastCursorPositionChangeTime + 250;
            if (currentTime >= minimumRenderTime) {
                // Synchronous
                this.renderDecorationsTimer = -1;
                this.renderDecorations();
            }
            else {
                // Asynchronous
                this.renderDecorationsTimer = setTimeout(function () {
                    _this.renderDecorations();
                }, (minimumRenderTime - currentTime));
            }
        };
        WordHighlighter.prototype.renderDecorations = function () {
            this.renderDecorationsTimer = -1;
            var decorations = [];
            for (var i = 0, len = this.workerRequestValue.length; i < len; i++) {
                var info = this.workerRequestValue[i];
                decorations.push({
                    range: info.range,
                    options: WordHighlighter._getDecorationOptions(info.kind)
                });
            }
            this._decorationIds = this.editor.deltaDecorations(this._decorationIds, decorations);
            this._hasWordHighlights.set(this.hasDecorations());
        };
        WordHighlighter._getDecorationOptions = function (kind) {
            if (kind === modes_1.DocumentHighlightKind.Write) {
                return this._WRITE_OPTIONS;
            }
            else if (kind === modes_1.DocumentHighlightKind.Text) {
                return this._TEXT_OPTIONS;
            }
            else {
                return this._REGULAR_OPTIONS;
            }
        };
        WordHighlighter.prototype.dispose = function () {
            this._stopAll();
            this.toUnhook = lifecycle_1.dispose(this.toUnhook);
        };
        WordHighlighter._WRITE_OPTIONS = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'wordHighlightStrong',
            overviewRuler: {
                color: themeService_1.themeColorFromId(exports.overviewRulerWordHighlightStrongForeground),
                darkColor: themeService_1.themeColorFromId(exports.overviewRulerWordHighlightStrongForeground),
                position: model_1.OverviewRulerLane.Center
            }
        });
        WordHighlighter._TEXT_OPTIONS = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'selectionHighlight',
            overviewRuler: {
                color: themeService_1.themeColorFromId(colorRegistry_1.overviewRulerSelectionHighlightForeground),
                darkColor: themeService_1.themeColorFromId(colorRegistry_1.overviewRulerSelectionHighlightForeground),
                position: model_1.OverviewRulerLane.Center
            }
        });
        WordHighlighter._REGULAR_OPTIONS = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'wordHighlight',
            overviewRuler: {
                color: themeService_1.themeColorFromId(exports.overviewRulerWordHighlightForeground),
                darkColor: themeService_1.themeColorFromId(exports.overviewRulerWordHighlightForeground),
                position: model_1.OverviewRulerLane.Center
            }
        });
        return WordHighlighter;
    }());
    var WordHighlighterContribution = /** @class */ (function () {
        function WordHighlighterContribution(editor, contextKeyService) {
            this.wordHighligher = new WordHighlighter(editor, contextKeyService);
        }
        WordHighlighterContribution.get = function (editor) {
            return editor.getContribution(WordHighlighterContribution.ID);
        };
        WordHighlighterContribution.prototype.getId = function () {
            return WordHighlighterContribution.ID;
        };
        WordHighlighterContribution.prototype.saveViewState = function () {
            if (this.wordHighligher.hasDecorations()) {
                return true;
            }
            return false;
        };
        WordHighlighterContribution.prototype.moveNext = function () {
            this.wordHighligher.moveNext();
        };
        WordHighlighterContribution.prototype.moveBack = function () {
            this.wordHighligher.moveBack();
        };
        WordHighlighterContribution.prototype.restoreViewState = function (state) {
            if (state) {
                this.wordHighligher.restore();
            }
        };
        WordHighlighterContribution.prototype.dispose = function () {
            this.wordHighligher.dispose();
        };
        WordHighlighterContribution.ID = 'editor.contrib.wordHighlighter';
        WordHighlighterContribution = __decorate([
            __param(1, contextkey_1.IContextKeyService)
        ], WordHighlighterContribution);
        return WordHighlighterContribution;
    }());
    var WordHighlightNavigationAction = /** @class */ (function (_super) {
        __extends(WordHighlightNavigationAction, _super);
        function WordHighlightNavigationAction(next, opts) {
            var _this = _super.call(this, opts) || this;
            _this._isNext = next;
            return _this;
        }
        WordHighlightNavigationAction.prototype.run = function (accessor, editor) {
            var controller = WordHighlighterContribution.get(editor);
            if (!controller) {
                return;
            }
            if (this._isNext) {
                controller.moveNext();
            }
            else {
                controller.moveBack();
            }
        };
        return WordHighlightNavigationAction;
    }(editorExtensions_1.EditorAction));
    var NextWordHighlightAction = /** @class */ (function (_super) {
        __extends(NextWordHighlightAction, _super);
        function NextWordHighlightAction() {
            return _super.call(this, true, {
                id: 'editor.action.wordHighlight.next',
                label: nls.localize('wordHighlight.next.label', "Go to Next Symbol Highlight"),
                alias: 'Go to Next Symbol Highlight',
                precondition: exports.ctxHasWordHighlights,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 65 /* F7 */
                }
            }) || this;
        }
        return NextWordHighlightAction;
    }(WordHighlightNavigationAction));
    var PrevWordHighlightAction = /** @class */ (function (_super) {
        __extends(PrevWordHighlightAction, _super);
        function PrevWordHighlightAction() {
            return _super.call(this, false, {
                id: 'editor.action.wordHighlight.prev',
                label: nls.localize('wordHighlight.previous.label', "Go to Previous Symbol Highlight"),
                alias: 'Go to Previous Symbol Highlight',
                precondition: exports.ctxHasWordHighlights,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 1024 /* Shift */ | 65 /* F7 */
                }
            }) || this;
        }
        return PrevWordHighlightAction;
    }(WordHighlightNavigationAction));
    editorExtensions_1.registerEditorContribution(WordHighlighterContribution);
    editorExtensions_1.registerEditorAction(NextWordHighlightAction);
    editorExtensions_1.registerEditorAction(PrevWordHighlightAction);
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var selectionHighlight = theme.getColor(colorRegistry_1.editorSelectionHighlight);
        if (selectionHighlight) {
            collector.addRule(".monaco-editor .focused .selectionHighlight { background-color: " + selectionHighlight + "; }");
            collector.addRule(".monaco-editor .selectionHighlight { background-color: " + selectionHighlight.transparent(0.5) + "; }");
        }
        var wordHighlight = theme.getColor(exports.editorWordHighlight);
        if (wordHighlight) {
            collector.addRule(".monaco-editor .wordHighlight { background-color: " + wordHighlight + "; }");
        }
        var wordHighlightStrong = theme.getColor(exports.editorWordHighlightStrong);
        if (wordHighlightStrong) {
            collector.addRule(".monaco-editor .wordHighlightStrong { background-color: " + wordHighlightStrong + "; }");
        }
        var hcOutline = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (hcOutline) {
            collector.addRule(".monaco-editor .selectionHighlight { border: 1px dotted " + hcOutline + "; box-sizing: border-box; }");
            collector.addRule(".monaco-editor .wordHighlight { border: 1px dashed " + hcOutline + "; box-sizing: border-box; }");
            collector.addRule(".monaco-editor .wordHighlightStrong { border: 1px dashed " + hcOutline + "; box-sizing: border-box; }");
        }
    });
});
