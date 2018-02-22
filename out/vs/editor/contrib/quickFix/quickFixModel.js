define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/modes", "./quickFix"], function (require, exports, event_1, lifecycle_1, range_1, selection_1, modes_1, quickFix_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var QuickFixOracle = /** @class */ (function () {
        function QuickFixOracle(_editor, _markerService, _signalChange, delay) {
            if (delay === void 0) { delay = 250; }
            var _this = this;
            this._editor = _editor;
            this._markerService = _markerService;
            this._signalChange = _signalChange;
            this._disposables = [];
            this._disposables.push(event_1.debounceEvent(this._markerService.onMarkerChanged, function (last, cur) { return last ? last.concat(cur) : cur; }, delay / 2)(function (e) { return _this._onMarkerChanges(e); }), event_1.debounceEvent(this._editor.onDidChangeCursorPosition, function (last, cur) { return cur; }, delay)(function (e) { return _this._onCursorChange(); }));
        }
        QuickFixOracle.prototype.dispose = function () {
            this._disposables = lifecycle_1.dispose(this._disposables);
        };
        QuickFixOracle.prototype.trigger = function (trigger) {
            var rangeOrSelection = this._getRangeOfMarker() || this._getRangeOfSelectionUnlessWhitespaceEnclosed();
            if (!rangeOrSelection && trigger.type === 'manual') {
                rangeOrSelection = this._editor.getSelection();
            }
            this._createEventAndSignalChange(trigger, rangeOrSelection);
        };
        QuickFixOracle.prototype._onMarkerChanges = function (resources) {
            var uri = this._editor.getModel().uri;
            for (var _i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
                var resource = resources_1[_i];
                if (resource.toString() === uri.toString()) {
                    this.trigger({ type: 'auto' });
                    return;
                }
            }
        };
        QuickFixOracle.prototype._onCursorChange = function () {
            this.trigger({ type: 'auto' });
        };
        QuickFixOracle.prototype._getRangeOfMarker = function () {
            var selection = this._editor.getSelection();
            var model = this._editor.getModel();
            for (var _i = 0, _a = this._markerService.read({ resource: model.uri }); _i < _a.length; _i++) {
                var marker = _a[_i];
                if (range_1.Range.intersectRanges(marker, selection)) {
                    return range_1.Range.lift(marker);
                }
            }
            return undefined;
        };
        QuickFixOracle.prototype._getRangeOfSelectionUnlessWhitespaceEnclosed = function () {
            var model = this._editor.getModel();
            var selection = this._editor.getSelection();
            if (selection.isEmpty()) {
                var _a = selection.getPosition(), lineNumber = _a.lineNumber, column = _a.column;
                var line = model.getLineContent(lineNumber);
                if (line.length === 0) {
                    // empty line
                    return undefined;
                }
                else if (column === 1) {
                    // look only right
                    if (/\s/.test(line[0])) {
                        return undefined;
                    }
                }
                else if (column === model.getLineMaxColumn(lineNumber)) {
                    // look only left
                    if (/\s/.test(line[line.length - 1])) {
                        return undefined;
                    }
                }
                else {
                    // look left and right
                    if (/\s/.test(line[column - 2]) && /\s/.test(line[column - 1])) {
                        return undefined;
                    }
                }
            }
            return selection;
        };
        QuickFixOracle.prototype._createEventAndSignalChange = function (trigger, rangeOrSelection) {
            if (!rangeOrSelection) {
                // cancel
                this._signalChange({
                    trigger: trigger,
                    range: undefined,
                    position: undefined,
                    fixes: undefined,
                });
            }
            else {
                // actual
                var model = this._editor.getModel();
                var range = model.validateRange(rangeOrSelection);
                var position = rangeOrSelection instanceof selection_1.Selection ? rangeOrSelection.getPosition() : rangeOrSelection.getStartPosition();
                var fixes = quickFix_1.getCodeActions(model, range, trigger && trigger.kind);
                this._signalChange({
                    trigger: trigger,
                    range: range,
                    position: position,
                    fixes: fixes
                });
            }
        };
        return QuickFixOracle;
    }());
    exports.QuickFixOracle = QuickFixOracle;
    var QuickFixModel = /** @class */ (function () {
        function QuickFixModel(editor, markerService) {
            var _this = this;
            this._onDidChangeFixes = new event_1.Emitter();
            this._disposables = [];
            this._editor = editor;
            this._markerService = markerService;
            this._disposables.push(this._editor.onDidChangeModel(function () { return _this._update(); }));
            this._disposables.push(this._editor.onDidChangeModelLanguage(function () { return _this._update(); }));
            this._disposables.push(modes_1.CodeActionProviderRegistry.onDidChange(this._update, this));
            this._update();
        }
        QuickFixModel.prototype.dispose = function () {
            this._disposables = lifecycle_1.dispose(this._disposables);
            lifecycle_1.dispose(this._quickFixOracle);
        };
        Object.defineProperty(QuickFixModel.prototype, "onDidChangeFixes", {
            get: function () {
                return this._onDidChangeFixes.event;
            },
            enumerable: true,
            configurable: true
        });
        QuickFixModel.prototype._update = function () {
            var _this = this;
            if (this._quickFixOracle) {
                this._quickFixOracle.dispose();
                this._quickFixOracle = undefined;
                this._onDidChangeFixes.fire(undefined);
            }
            if (this._editor.getModel()
                && modes_1.CodeActionProviderRegistry.has(this._editor.getModel())
                && !this._editor.getConfiguration().readOnly) {
                this._quickFixOracle = new QuickFixOracle(this._editor, this._markerService, function (p) { return _this._onDidChangeFixes.fire(p); });
                this._quickFixOracle.trigger({ type: 'auto' });
            }
        };
        QuickFixModel.prototype.trigger = function (trigger) {
            if (this._quickFixOracle) {
                this._quickFixOracle.trigger(trigger);
            }
        };
        return QuickFixModel;
    }());
    exports.QuickFixModel = QuickFixModel;
});
