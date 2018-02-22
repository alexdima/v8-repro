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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/model", "vs/workbench/parts/debug/common/debug", "vs/editor/common/services/modelService", "vs/base/common/htmlContent", "vs/workbench/parts/debug/browser/breakpointsView", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, lifecycle, range_1, model_1, debug_1, modelService_1, htmlContent_1, breakpointsView_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DebugEditorModelManager = /** @class */ (function () {
        function DebugEditorModelManager(modelService, debugService, textFileService) {
            this.modelService = modelService;
            this.debugService = debugService;
            this.textFileService = textFileService;
            this.modelDataMap = new Map();
            this.toDispose = [];
            this.registerListeners();
        }
        DebugEditorModelManager.prototype.dispose = function () {
            this.modelDataMap.forEach(function (modelData) {
                lifecycle.dispose(modelData.toDispose);
                modelData.model.deltaDecorations(modelData.breakpointDecorations.map(function (bpd) { return bpd.decorationId; }), []);
                modelData.model.deltaDecorations(modelData.currentStackDecorations, []);
            });
            this.toDispose = lifecycle.dispose(this.toDispose);
            this.modelDataMap.clear();
        };
        DebugEditorModelManager.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.modelService.onModelAdded(this.onModelAdded, this));
            this.modelService.getModels().forEach(function (model) { return _this.onModelAdded(model); });
            this.toDispose.push(this.modelService.onModelRemoved(this.onModelRemoved, this));
            this.toDispose.push(this.debugService.getModel().onDidChangeBreakpoints(function () { return _this.onBreakpointsChange(); }));
            this.toDispose.push(this.debugService.getViewModel().onDidFocusStackFrame(function () { return _this.onFocusStackFrame(); }));
            this.toDispose.push(this.debugService.onDidChangeState(function (state) {
                if (state === debug_1.State.Inactive) {
                    _this.modelDataMap.forEach(function (modelData) {
                        modelData.topStackFrameRange = undefined;
                    });
                }
            }));
        };
        DebugEditorModelManager.prototype.onModelAdded = function (model) {
            var _this = this;
            var modelUrlStr = model.uri.toString();
            var breakpoints = this.debugService.getModel().getBreakpoints().filter(function (bp) { return bp.uri.toString() === modelUrlStr; });
            var currentStackDecorations = model.deltaDecorations([], this.createCallStackDecorations(modelUrlStr));
            var desiredDecorations = this.createBreakpointDecorations(model, breakpoints);
            var breakpointDecorationIds = model.deltaDecorations([], desiredDecorations);
            var toDispose = [model.onDidChangeDecorations(function (e) { return _this.onModelDecorationsChanged(modelUrlStr); })];
            this.modelDataMap.set(modelUrlStr, {
                model: model,
                toDispose: toDispose,
                breakpointDecorations: breakpointDecorationIds.map(function (decorationId, index) { return ({ decorationId: decorationId, modelId: breakpoints[index].getId(), range: desiredDecorations[index].range }); }),
                currentStackDecorations: currentStackDecorations,
                topStackFrameRange: undefined
            });
        };
        DebugEditorModelManager.prototype.onModelRemoved = function (model) {
            var modelUriStr = model.uri.toString();
            if (this.modelDataMap.has(modelUriStr)) {
                lifecycle.dispose(this.modelDataMap.get(modelUriStr).toDispose);
                this.modelDataMap.delete(modelUriStr);
            }
        };
        // call stack management. Represent data coming from the debug service.
        DebugEditorModelManager.prototype.onFocusStackFrame = function () {
            var _this = this;
            this.modelDataMap.forEach(function (modelData, uri) {
                modelData.currentStackDecorations = modelData.model.deltaDecorations(modelData.currentStackDecorations, _this.createCallStackDecorations(uri));
            });
        };
        DebugEditorModelManager.prototype.createCallStackDecorations = function (modelUriStr) {
            var result = [];
            var stackFrame = this.debugService.getViewModel().focusedStackFrame;
            if (!stackFrame || stackFrame.source.uri.toString() !== modelUriStr) {
                return result;
            }
            // only show decorations for the currently focused thread.
            var columnUntilEOLRange = new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
            var range = new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1);
            // compute how to decorate the editor. Different decorations are used if this is a top stack frame, focused stack frame,
            // an exception or a stack frame that did not change the line number (we only decorate the columns, not the whole line).
            var callStack = stackFrame.thread.getCallStack();
            if (callStack && callStack.length && stackFrame === callStack[0]) {
                result.push({
                    options: DebugEditorModelManager.TOP_STACK_FRAME_MARGIN,
                    range: range
                });
                if (stackFrame.thread.stoppedDetails && stackFrame.thread.stoppedDetails.reason === 'exception') {
                    result.push({
                        options: DebugEditorModelManager.TOP_STACK_FRAME_EXCEPTION_DECORATION,
                        range: columnUntilEOLRange
                    });
                }
                else {
                    result.push({
                        options: DebugEditorModelManager.TOP_STACK_FRAME_DECORATION,
                        range: columnUntilEOLRange
                    });
                    if (stackFrame.range.endLineNumber && stackFrame.range.endColumn) {
                        result.push({
                            options: { className: 'debug-top-stack-frame-range' },
                            range: stackFrame.range
                        });
                    }
                    if (this.modelDataMap.has(modelUriStr)) {
                        var modelData = this.modelDataMap.get(modelUriStr);
                        if (modelData.topStackFrameRange && modelData.topStackFrameRange.startLineNumber === stackFrame.range.startLineNumber && modelData.topStackFrameRange.startColumn !== stackFrame.range.startColumn) {
                            result.push({
                                options: DebugEditorModelManager.TOP_STACK_FRAME_INLINE_DECORATION,
                                range: columnUntilEOLRange
                            });
                        }
                        modelData.topStackFrameRange = columnUntilEOLRange;
                    }
                }
            }
            else {
                result.push({
                    options: DebugEditorModelManager.FOCUSED_STACK_FRAME_MARGIN,
                    range: range
                });
                if (stackFrame.range.endLineNumber && stackFrame.range.endColumn) {
                    result.push({
                        options: { className: 'debug-focused-stack-frame-range' },
                        range: stackFrame.range
                    });
                }
                result.push({
                    options: DebugEditorModelManager.FOCUSED_STACK_FRAME_DECORATION,
                    range: columnUntilEOLRange
                });
            }
            return result;
        };
        // breakpoints management. Represent data coming from the debug service and also send data back.
        DebugEditorModelManager.prototype.onModelDecorationsChanged = function (modelUrlStr) {
            var modelData = this.modelDataMap.get(modelUrlStr);
            if (modelData.breakpointDecorations.length === 0 || this.ignoreDecorationsChangedEvent) {
                // I have no decorations
                return;
            }
            var somethingChanged = false;
            modelData.breakpointDecorations.forEach(function (breakpointDecoration) {
                if (somethingChanged) {
                    return;
                }
                var newBreakpointRange = modelData.model.getDecorationRange(breakpointDecoration.decorationId);
                if (newBreakpointRange && (!breakpointDecoration.range.equalsRange(newBreakpointRange))) {
                    somethingChanged = true;
                }
            });
            if (!somethingChanged) {
                // nothing to do, my decorations did not change.
                return;
            }
            var data = Object.create(null);
            var breakpoints = this.debugService.getModel().getBreakpoints();
            var modelUri = modelData.model.uri;
            var _loop_1 = function (i, len) {
                var breakpointDecoration = modelData.breakpointDecorations[i];
                var decorationRange = modelData.model.getDecorationRange(breakpointDecoration.decorationId);
                // check if the line got deleted.
                if (decorationRange) {
                    var breakpoint = breakpoints.filter(function (bp) { return bp.getId() === breakpointDecoration.modelId; }).pop();
                    // since we know it is collapsed, it cannot grow to multiple lines
                    if (breakpoint) {
                        data[breakpoint.getId()] = {
                            line: decorationRange.startLineNumber,
                            column: breakpoint.column ? decorationRange.startColumn : undefined,
                            verified: breakpoint.verified
                        };
                    }
                }
            };
            for (var i = 0, len = modelData.breakpointDecorations.length; i < len; i++) {
                _loop_1(i, len);
            }
            this.debugService.updateBreakpoints(modelUri, data, true);
        };
        DebugEditorModelManager.prototype.onBreakpointsChange = function () {
            var _this = this;
            var breakpointsMap = new Map();
            this.debugService.getModel().getBreakpoints().forEach(function (bp) {
                var uriStr = bp.uri.toString();
                if (breakpointsMap.has(uriStr)) {
                    breakpointsMap.get(uriStr).push(bp);
                }
                else {
                    breakpointsMap.set(uriStr, [bp]);
                }
            });
            breakpointsMap.forEach(function (bps, uri) {
                if (_this.modelDataMap.has(uri)) {
                    _this.updateBreakpoints(_this.modelDataMap.get(uri), breakpointsMap.get(uri));
                }
            });
            this.modelDataMap.forEach(function (modelData, uri) {
                if (!breakpointsMap.has(uri)) {
                    _this.updateBreakpoints(modelData, []);
                }
            });
        };
        DebugEditorModelManager.prototype.updateBreakpoints = function (modelData, newBreakpoints) {
            var desiredDecorations = this.createBreakpointDecorations(modelData.model, newBreakpoints);
            var breakpointDecorationIds;
            try {
                this.ignoreDecorationsChangedEvent = true;
                breakpointDecorationIds = modelData.model.deltaDecorations(modelData.breakpointDecorations.map(function (bpd) { return bpd.decorationId; }), desiredDecorations);
            }
            finally {
                this.ignoreDecorationsChangedEvent = false;
            }
            modelData.breakpointDecorations = breakpointDecorationIds.map(function (decorationId, index) {
                return ({ decorationId: decorationId, modelId: newBreakpoints[index].getId(), range: desiredDecorations[index].range });
            });
        };
        DebugEditorModelManager.prototype.createBreakpointDecorations = function (model, breakpoints) {
            var _this = this;
            var result = [];
            breakpoints.forEach(function (breakpoint) {
                if (breakpoint.lineNumber <= model.getLineCount()) {
                    var column = model.getLineFirstNonWhitespaceColumn(breakpoint.lineNumber);
                    var range = model.validateRange(breakpoint.column ? new range_1.Range(breakpoint.lineNumber, breakpoint.column, breakpoint.lineNumber, breakpoint.column + 1)
                        : new range_1.Range(breakpoint.lineNumber, column, breakpoint.lineNumber, column + 1) // Decoration has to have a width #20688
                    );
                    result.push({
                        options: _this.getBreakpointDecorationOptions(breakpoint),
                        range: range
                    });
                }
            });
            return result;
        };
        DebugEditorModelManager.prototype.getBreakpointDecorationOptions = function (breakpoint) {
            var _a = breakpointsView_1.getBreakpointMessageAndClassName(this.debugService, this.textFileService, breakpoint), className = _a.className, message = _a.message;
            var glyphMarginHoverMessage;
            if (message) {
                if (breakpoint.condition || breakpoint.hitCondition) {
                    var modelData = this.modelDataMap.get(breakpoint.uri.toString());
                    var modeId = modelData ? modelData.model.getLanguageIdentifier().language : '';
                    glyphMarginHoverMessage = new htmlContent_1.MarkdownString().appendCodeblock(modeId, message);
                }
                else {
                    glyphMarginHoverMessage = new htmlContent_1.MarkdownString().appendText(message);
                }
            }
            return {
                glyphMarginClassName: className,
                glyphMarginHoverMessage: glyphMarginHoverMessage,
                stickiness: DebugEditorModelManager.STICKINESS,
                beforeContentClassName: breakpoint.column ? "debug-breakpoint-column " + className + "-column" : undefined
            };
        };
        DebugEditorModelManager.ID = 'breakpointManager';
        DebugEditorModelManager.STICKINESS = model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges;
        // editor decorations
        // we need a separate decoration for glyph margin, since we do not want it on each line of a multi line statement.
        DebugEditorModelManager.TOP_STACK_FRAME_MARGIN = {
            glyphMarginClassName: 'debug-top-stack-frame-glyph',
            stickiness: DebugEditorModelManager.STICKINESS
        };
        DebugEditorModelManager.FOCUSED_STACK_FRAME_MARGIN = {
            glyphMarginClassName: 'debug-focused-stack-frame-glyph',
            stickiness: DebugEditorModelManager.STICKINESS
        };
        DebugEditorModelManager.TOP_STACK_FRAME_DECORATION = {
            isWholeLine: true,
            inlineClassName: 'debug-remove-token-colors',
            className: 'debug-top-stack-frame-line',
            stickiness: DebugEditorModelManager.STICKINESS
        };
        DebugEditorModelManager.TOP_STACK_FRAME_EXCEPTION_DECORATION = {
            isWholeLine: true,
            inlineClassName: 'debug-remove-token-colors',
            className: 'debug-top-stack-frame-exception-line',
            stickiness: DebugEditorModelManager.STICKINESS
        };
        DebugEditorModelManager.TOP_STACK_FRAME_INLINE_DECORATION = {
            beforeContentClassName: 'debug-top-stack-frame-column'
        };
        DebugEditorModelManager.FOCUSED_STACK_FRAME_DECORATION = {
            isWholeLine: true,
            inlineClassName: 'debug-remove-token-colors',
            className: 'debug-focused-stack-frame-line',
            stickiness: DebugEditorModelManager.STICKINESS
        };
        DebugEditorModelManager = __decorate([
            __param(0, modelService_1.IModelService),
            __param(1, debug_1.IDebugService),
            __param(2, textfiles_1.ITextFileService)
        ], DebugEditorModelManager);
        return DebugEditorModelManager;
    }());
    exports.DebugEditorModelManager = DebugEditorModelManager;
});
