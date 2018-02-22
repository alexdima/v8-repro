define(["require", "exports", "vs/editor/common/editorCommon", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/contrib/snippet/snippetController2", "vs/workbench/api/node/extHostTypes", "vs/editor/common/config/editorOptions", "vs/workbench/api/node/extHost.protocol", "vs/editor/common/model"], function (require, exports, editorCommon, event_1, lifecycle_1, range_1, selection_1, snippetController2_1, extHostTypes_1, editorOptions_1, extHost_protocol_1, model_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function configurationsEqual(a, b) {
        if (a && !b || !a && b) {
            return false;
        }
        if (!a && !b) {
            return true;
        }
        return (a.tabSize === b.tabSize
            && a.insertSpaces === b.insertSpaces);
    }
    /**
     * Text Editor that is permanently bound to the same model.
     * It can be bound or not to a CodeEditor.
     */
    var MainThreadTextEditor = /** @class */ (function () {
        function MainThreadTextEditor(id, model, codeEditor, focusTracker, modelService) {
            var _this = this;
            this._id = id;
            this._model = model;
            this._codeEditor = null;
            this._focusTracker = focusTracker;
            this._modelService = modelService;
            this._codeEditorListeners = [];
            this._onSelectionChanged = new event_1.Emitter();
            this._onConfigurationChanged = new event_1.Emitter();
            this._lastSelection = [new selection_1.Selection(1, 1, 1, 1)];
            this._modelListeners = [];
            this._modelListeners.push(this._model.onDidChangeOptions(function (e) {
                _this._setConfiguration(_this._readConfiguration(_this._model, _this._codeEditor));
            }));
            this.setCodeEditor(codeEditor);
            this._setConfiguration(this._readConfiguration(this._model, this._codeEditor));
        }
        MainThreadTextEditor.prototype.dispose = function () {
            this._model = null;
            this._modelListeners = lifecycle_1.dispose(this._modelListeners);
            this._codeEditor = null;
            this._codeEditorListeners = lifecycle_1.dispose(this._codeEditorListeners);
        };
        MainThreadTextEditor.prototype.getId = function () {
            return this._id;
        };
        MainThreadTextEditor.prototype.getModel = function () {
            return this._model;
        };
        MainThreadTextEditor.prototype.getCodeEditor = function () {
            return this._codeEditor;
        };
        MainThreadTextEditor.prototype.hasCodeEditor = function (codeEditor) {
            return (this._codeEditor === codeEditor);
        };
        MainThreadTextEditor.prototype.setCodeEditor = function (codeEditor) {
            var _this = this;
            if (this.hasCodeEditor(codeEditor)) {
                // Nothing to do...
                return;
            }
            this._codeEditorListeners = lifecycle_1.dispose(this._codeEditorListeners);
            this._codeEditor = codeEditor;
            if (this._codeEditor) {
                // Catch early the case that this code editor gets a different model set and disassociate from this model
                this._codeEditorListeners.push(this._codeEditor.onDidChangeModel(function () {
                    _this.setCodeEditor(null);
                }));
                var forwardSelection = function (event) {
                    _this._lastSelection = _this._codeEditor.getSelections();
                    _this._onSelectionChanged.fire({
                        selections: _this._lastSelection,
                        source: event && event.source
                    });
                };
                this._codeEditorListeners.push(this._codeEditor.onDidChangeCursorSelection(forwardSelection));
                if (!selection_1.Selection.selectionsArrEqual(this._lastSelection, this._codeEditor.getSelections())) {
                    forwardSelection();
                }
                this._codeEditorListeners.push(this._codeEditor.onDidFocusEditor(function () {
                    _this._focusTracker.onGainedFocus();
                }));
                this._codeEditorListeners.push(this._codeEditor.onDidBlurEditor(function () {
                    _this._focusTracker.onLostFocus();
                }));
                this._codeEditorListeners.push(this._codeEditor.onDidChangeConfiguration(function () {
                    _this._setConfiguration(_this._readConfiguration(_this._model, _this._codeEditor));
                }));
                this._setConfiguration(this._readConfiguration(this._model, this._codeEditor));
            }
        };
        MainThreadTextEditor.prototype.isVisible = function () {
            return !!this._codeEditor;
        };
        Object.defineProperty(MainThreadTextEditor.prototype, "onSelectionChanged", {
            get: function () {
                return this._onSelectionChanged.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadTextEditor.prototype, "onConfigurationChanged", {
            get: function () {
                return this._onConfigurationChanged.event;
            },
            enumerable: true,
            configurable: true
        });
        MainThreadTextEditor.prototype.getSelections = function () {
            if (this._codeEditor) {
                return this._codeEditor.getSelections();
            }
            return this._lastSelection;
        };
        MainThreadTextEditor.prototype.setSelections = function (selections) {
            if (this._codeEditor) {
                this._codeEditor.setSelections(selections);
                return;
            }
            this._lastSelection = selections.map(selection_1.Selection.liftSelection);
        };
        MainThreadTextEditor.prototype.getConfiguration = function () {
            return this._configuration;
        };
        MainThreadTextEditor.prototype._setIndentConfiguration = function (newConfiguration) {
            if (newConfiguration.tabSize === 'auto' || newConfiguration.insertSpaces === 'auto') {
                // one of the options was set to 'auto' => detect indentation
                var creationOpts = this._modelService.getCreationOptions(this._model.getLanguageIdentifier().language, this._model.uri);
                var insertSpaces = creationOpts.insertSpaces;
                var tabSize = creationOpts.tabSize;
                if (newConfiguration.insertSpaces !== 'auto' && typeof newConfiguration.insertSpaces !== 'undefined') {
                    insertSpaces = newConfiguration.insertSpaces;
                }
                if (newConfiguration.tabSize !== 'auto' && typeof newConfiguration.tabSize !== 'undefined') {
                    tabSize = newConfiguration.tabSize;
                }
                this._model.detectIndentation(insertSpaces, tabSize);
                return;
            }
            var newOpts = {};
            if (typeof newConfiguration.insertSpaces !== 'undefined') {
                newOpts.insertSpaces = newConfiguration.insertSpaces;
            }
            if (typeof newConfiguration.tabSize !== 'undefined') {
                newOpts.tabSize = newConfiguration.tabSize;
            }
            this._model.updateOptions(newOpts);
        };
        MainThreadTextEditor.prototype.setConfiguration = function (newConfiguration) {
            this._setIndentConfiguration(newConfiguration);
            if (!this._codeEditor) {
                return;
            }
            if (newConfiguration.cursorStyle) {
                var newCursorStyle = editorOptions_1.cursorStyleToString(newConfiguration.cursorStyle);
                this._codeEditor.updateOptions({
                    cursorStyle: newCursorStyle
                });
            }
            if (typeof newConfiguration.lineNumbers !== 'undefined') {
                var lineNumbers = void 0;
                switch (newConfiguration.lineNumbers) {
                    case extHostTypes_1.TextEditorLineNumbersStyle.On:
                        lineNumbers = 'on';
                        break;
                    case extHostTypes_1.TextEditorLineNumbersStyle.Relative:
                        lineNumbers = 'relative';
                        break;
                    default:
                        lineNumbers = 'off';
                }
                this._codeEditor.updateOptions({
                    lineNumbers: lineNumbers
                });
            }
        };
        MainThreadTextEditor.prototype.setDecorations = function (key, ranges) {
            if (!this._codeEditor) {
                return;
            }
            this._codeEditor.setDecorations(key, ranges);
        };
        MainThreadTextEditor.prototype.setDecorationsFast = function (key, _ranges) {
            if (!this._codeEditor) {
                return;
            }
            var ranges = [];
            for (var i = 0, len = Math.floor(_ranges.length / 4); i < len; i++) {
                ranges[i] = new range_1.Range(_ranges[4 * i], _ranges[4 * i + 1], _ranges[4 * i + 2], _ranges[4 * i + 3]);
            }
            this._codeEditor.setDecorationsFast(key, ranges);
        };
        MainThreadTextEditor.prototype.revealRange = function (range, revealType) {
            if (!this._codeEditor) {
                return;
            }
            switch (revealType) {
                case extHost_protocol_1.TextEditorRevealType.Default:
                    this._codeEditor.revealRange(range, 0 /* Smooth */);
                    break;
                case extHost_protocol_1.TextEditorRevealType.InCenter:
                    this._codeEditor.revealRangeInCenter(range, 0 /* Smooth */);
                    break;
                case extHost_protocol_1.TextEditorRevealType.InCenterIfOutsideViewport:
                    this._codeEditor.revealRangeInCenterIfOutsideViewport(range, 0 /* Smooth */);
                    break;
                case extHost_protocol_1.TextEditorRevealType.AtTop:
                    this._codeEditor.revealRangeAtTop(range, 0 /* Smooth */);
                    break;
                default:
                    console.warn("Unknown revealType: " + revealType);
                    break;
            }
        };
        MainThreadTextEditor.prototype._readConfiguration = function (model, codeEditor) {
            if (model.isDisposed()) {
                // shutdown time
                return this._configuration;
            }
            var cursorStyle = this._configuration ? this._configuration.cursorStyle : editorOptions_1.TextEditorCursorStyle.Line;
            var lineNumbers = this._configuration ? this._configuration.lineNumbers : extHostTypes_1.TextEditorLineNumbersStyle.On;
            if (codeEditor) {
                var codeEditorOpts = codeEditor.getConfiguration();
                cursorStyle = codeEditorOpts.viewInfo.cursorStyle;
                switch (codeEditorOpts.viewInfo.renderLineNumbers) {
                    case 0 /* Off */:
                        lineNumbers = extHostTypes_1.TextEditorLineNumbersStyle.Off;
                        break;
                    case 2 /* Relative */:
                        lineNumbers = extHostTypes_1.TextEditorLineNumbersStyle.Relative;
                        break;
                    default:
                        lineNumbers = extHostTypes_1.TextEditorLineNumbersStyle.On;
                        break;
                }
            }
            var indent = model.getOptions();
            return {
                insertSpaces: indent.insertSpaces,
                tabSize: indent.tabSize,
                cursorStyle: cursorStyle,
                lineNumbers: lineNumbers
            };
        };
        MainThreadTextEditor.prototype._setConfiguration = function (newConfiguration) {
            if (configurationsEqual(this._configuration, newConfiguration)) {
                return;
            }
            this._configuration = newConfiguration;
            this._onConfigurationChanged.fire(this._configuration);
        };
        MainThreadTextEditor.prototype.isFocused = function () {
            if (this._codeEditor) {
                return this._codeEditor.isFocused();
            }
            return false;
        };
        MainThreadTextEditor.prototype.matches = function (editor) {
            if (!editor) {
                return false;
            }
            return editor.getControl() === this._codeEditor;
        };
        MainThreadTextEditor.prototype.applyEdits = function (versionIdCheck, edits, opts) {
            if (this._model.getVersionId() !== versionIdCheck) {
                // throw new Error('Model has changed in the meantime!');
                // model changed in the meantime
                return false;
            }
            if (!this._codeEditor) {
                // console.warn('applyEdits on invisible editor');
                return false;
            }
            if (opts.setEndOfLine === extHostTypes_1.EndOfLine.CRLF) {
                this._model.setEOL(model_1.EndOfLineSequence.CRLF);
            }
            else if (opts.setEndOfLine === extHostTypes_1.EndOfLine.LF) {
                this._model.setEOL(model_1.EndOfLineSequence.LF);
            }
            var transformedEdits = edits.map(function (edit) {
                return {
                    range: range_1.Range.lift(edit.range),
                    text: edit.text,
                    forceMoveMarkers: edit.forceMoveMarkers
                };
            });
            if (opts.undoStopBefore) {
                this._codeEditor.pushUndoStop();
            }
            this._codeEditor.executeEdits('MainThreadTextEditor', transformedEdits);
            if (opts.undoStopAfter) {
                this._codeEditor.pushUndoStop();
            }
            return true;
        };
        MainThreadTextEditor.prototype.insertSnippet = function (template, ranges, opts) {
            if (!this._codeEditor) {
                return false;
            }
            var snippetController = snippetController2_1.SnippetController2.get(this._codeEditor);
            // // cancel previous snippet mode
            // snippetController.leaveSnippet();
            // set selection, focus editor
            var selections = ranges.map(function (r) { return new selection_1.Selection(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn); });
            this._codeEditor.setSelections(selections);
            this._codeEditor.focus();
            // make modifications
            snippetController.insert(template, 0, 0, opts.undoStopBefore, opts.undoStopAfter);
            return true;
        };
        return MainThreadTextEditor;
    }());
    exports.MainThreadTextEditor = MainThreadTextEditor;
});
