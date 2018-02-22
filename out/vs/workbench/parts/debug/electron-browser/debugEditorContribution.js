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
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/winjs.base", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/json", "vs/base/common/actions", "vs/editor/common/model/wordHelper", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/common/model", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/workbench/parts/debug/electron-browser/debugHover", "vs/workbench/parts/debug/browser/debugActions", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/browser/breakpointWidget", "vs/workbench/parts/debug/browser/exceptionWidget", "vs/workbench/parts/preferences/browser/preferencesWidgets", "vs/platform/theme/common/themeService", "vs/editor/common/core/position", "vs/editor/browser/controller/coreCommands", "vs/base/common/arrays", "vs/platform/keybinding/common/keybinding"], function (require, exports, nls, errors, winjs_base_1, async_1, lifecycle, env, json_1, actions_1, wordHelper_1, editorBrowser_1, editorExtensions_1, model_1, codeEditorService_1, range_1, instantiation_1, telemetry_1, configuration_1, commands_1, contextkey_1, contextView_1, debugHover_1, debugActions_1, debug_1, breakpointWidget_1, exceptionWidget_1, preferencesWidgets_1, themeService_1, position_1, coreCommands_1, arrays_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HOVER_DELAY = 300;
    var LAUNCH_JSON_REGEX = /launch\.json$/;
    var REMOVE_INLINE_VALUES_DELAY = 100;
    var INLINE_VALUE_DECORATION_KEY = 'inlinevaluedecoration';
    var MAX_NUM_INLINE_VALUES = 100; // JS Global scope can have 700+ entries. We want to limit ourselves for perf reasons
    var MAX_INLINE_DECORATOR_LENGTH = 150; // Max string length of each inline decorator when debugging. If exceeded ... is added
    var MAX_TOKENIZATION_LINE_LEN = 500; // If line is too long, then inline values for the line are skipped
    var DebugEditorContribution = /** @class */ (function () {
        function DebugEditorContribution(editor, debugService, contextMenuService, instantiationService, contextKeyService, commandService, codeEditorService, telemetryService, configurationService, themeService, keybindingService) {
            var _this = this;
            this.editor = editor;
            this.debugService = debugService;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.codeEditorService = codeEditorService;
            this.telemetryService = telemetryService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.breakpointHintDecoration = [];
            this.hoverWidget = new debugHover_1.DebugHoverWidget(this.editor, this.debugService, this.instantiationService, themeService);
            this.toDispose = [];
            this.showHoverScheduler = new async_1.RunOnceScheduler(function () { return _this.showHover(_this.hoverRange, false); }, HOVER_DELAY);
            this.hideHoverScheduler = new async_1.RunOnceScheduler(function () { return _this.hoverWidget.hide(); }, HOVER_DELAY);
            this.removeInlineValuesScheduler = new async_1.RunOnceScheduler(function () { return _this.editor.removeDecorations(INLINE_VALUE_DECORATION_KEY); }, REMOVE_INLINE_VALUES_DELAY);
            this.registerListeners();
            this.breakpointWidgetVisible = debug_1.CONTEXT_BREAKPOINT_WIDGET_VISIBLE.bindTo(contextKeyService);
            this.updateConfigurationWidgetVisibility();
            this.codeEditorService.registerDecorationType(INLINE_VALUE_DECORATION_KEY, {});
            this.toggleExceptionWidget();
        }
        DebugEditorContribution.prototype.getContextMenuActions = function (breakpoints, uri, lineNumber) {
            var _this = this;
            var actions = [];
            if (breakpoints.length === 1) {
                actions.push(new debugActions_1.RemoveBreakpointAction(debugActions_1.RemoveBreakpointAction.ID, debugActions_1.RemoveBreakpointAction.LABEL, this.debugService, this.keybindingService));
                actions.push(new debugActions_1.EditConditionalBreakpointAction(debugActions_1.EditConditionalBreakpointAction.ID, debugActions_1.EditConditionalBreakpointAction.LABEL, this.editor, this.debugService, this.keybindingService));
                if (breakpoints[0].enabled) {
                    actions.push(new debugActions_1.DisableBreakpointAction(debugActions_1.DisableBreakpointAction.ID, debugActions_1.DisableBreakpointAction.LABEL, this.debugService, this.keybindingService));
                }
                else {
                    actions.push(new debugActions_1.EnableBreakpointAction(debugActions_1.EnableBreakpointAction.ID, debugActions_1.EnableBreakpointAction.LABEL, this.debugService, this.keybindingService));
                }
            }
            else if (breakpoints.length > 1) {
                var sorted = breakpoints.sort(function (first, second) { return first.column - second.column; });
                actions.push(new contextView_1.ContextSubMenu(nls.localize('removeBreakpoints', "Remove Breakpoints"), sorted.map(function (bp) { return new actions_1.Action('removeColumnBreakpoint', bp.column ? nls.localize('removeBreakpointOnColumn', "Remove Breakpoint on Column {0}", bp.column) : nls.localize('removeLineBreakpoint', "Remove Line Breakpoint"), null, true, function () { return _this.debugService.removeBreakpoints(bp.getId()); }); })));
                actions.push(new contextView_1.ContextSubMenu(nls.localize('editBreakpoints', "Edit Breakpoints"), sorted.map(function (bp) {
                    return new actions_1.Action('editBreakpoint', bp.column ? nls.localize('editBreakpointOnColumn', "Edit Breakpoint on Column {0}", bp.column) : nls.localize('editLineBrekapoint', "Edit Line Breakpoint"), null, true, function () { return winjs_base_1.TPromise.as(_this.editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID).showBreakpointWidget(bp.lineNumber, bp.column)); });
                })));
                actions.push(new contextView_1.ContextSubMenu(nls.localize('enableDisableBreakpoints', "Enable/Disable Breakpoints"), sorted.map(function (bp) { return new actions_1.Action(bp.enabled ? 'disableColumnBreakpoint' : 'enableColumnBreakpoint', bp.enabled ? (bp.column ? nls.localize('disableColumnBreakpoint', "Disable Breakpoint on Column {0}", bp.column) : nls.localize('disableBreakpointOnLine', "Disable Line Breakpoint"))
                    : (bp.column ? nls.localize('enableBreakpoints', "Enable Breakpoint on Column {0}", bp.column) : nls.localize('enableBreakpointOnLine', "Enable Line Breakpoint")), null, true, function () { return _this.debugService.enableOrDisableBreakpoints(!bp.enabled, bp); }); })));
            }
            else {
                actions.push(new actions_1.Action('addBreakpoint', nls.localize('addBreakpoint', "Add Breakpoint"), null, true, function () { return _this.debugService.addBreakpoints(uri, [{ lineNumber: lineNumber }]); }));
                actions.push(new debugActions_1.AddConditionalBreakpointAction(debugActions_1.AddConditionalBreakpointAction.ID, debugActions_1.AddConditionalBreakpointAction.LABEL, this.editor, lineNumber, this.debugService, this.keybindingService));
            }
            return winjs_base_1.TPromise.as(actions);
        };
        DebugEditorContribution.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.editor.onMouseDown(function (e) {
                var data = e.target.detail;
                if (e.target.type !== editorBrowser_1.MouseTargetType.GUTTER_GLYPH_MARGIN || data.isAfterLines || !_this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber)) {
                    return;
                }
                var canSetBreakpoints = _this.debugService.getConfigurationManager().canSetBreakpointsIn(_this.editor.getModel());
                var lineNumber = e.target.position.lineNumber;
                var uri = _this.editor.getModel().uri;
                if (e.event.rightButton || (env.isMacintosh && e.event.leftButton && e.event.ctrlKey)) {
                    if (!canSetBreakpoints) {
                        return;
                    }
                    var anchor_1 = { x: e.event.posx, y: e.event.posy };
                    var breakpoints_1 = _this.debugService.getModel().getBreakpoints().filter(function (bp) { return bp.lineNumber === lineNumber && bp.uri.toString() === uri.toString(); });
                    _this.contextMenuService.showContextMenu({
                        getAnchor: function () { return anchor_1; },
                        getActions: function () { return _this.getContextMenuActions(breakpoints_1, uri, lineNumber); },
                        getActionsContext: function () { return breakpoints_1.length ? breakpoints_1[0] : undefined; }
                    });
                }
                else {
                    var breakpoints = _this.debugService.getModel().getBreakpoints()
                        .filter(function (bp) { return bp.uri.toString() === uri.toString() && bp.lineNumber === lineNumber; });
                    if (breakpoints.length) {
                        breakpoints.forEach(function (bp) { return _this.debugService.removeBreakpoints(bp.getId()); });
                    }
                    else if (canSetBreakpoints) {
                        _this.debugService.addBreakpoints(uri, [{ lineNumber: lineNumber }]);
                    }
                }
            }));
            this.toDispose.push(this.editor.onMouseMove(function (e) {
                var showBreakpointHintAtLineNumber = -1;
                if (e.target.type === editorBrowser_1.MouseTargetType.GUTTER_GLYPH_MARGIN && _this.debugService.getConfigurationManager().canSetBreakpointsIn(_this.editor.getModel()) &&
                    _this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber)) {
                    var data = e.target.detail;
                    if (!data.isAfterLines) {
                        showBreakpointHintAtLineNumber = e.target.position.lineNumber;
                    }
                }
                _this.ensureBreakpointHintDecoration(showBreakpointHintAtLineNumber);
            }));
            this.toDispose.push(this.editor.onMouseLeave(function (e) {
                _this.ensureBreakpointHintDecoration(-1);
            }));
            this.toDispose.push(this.debugService.getViewModel().onDidFocusStackFrame(function (e) { return _this.onFocusStackFrame(e.stackFrame); }));
            // hover listeners & hover widget
            this.toDispose.push(this.editor.onMouseDown(function (e) { return _this.onEditorMouseDown(e); }));
            this.toDispose.push(this.editor.onMouseMove(function (e) { return _this.onEditorMouseMove(e); }));
            this.toDispose.push(this.editor.onMouseLeave(function (e) {
                var hoverDomNode = _this.hoverWidget.getDomNode();
                if (!hoverDomNode) {
                    return;
                }
                var rect = hoverDomNode.getBoundingClientRect();
                // Only hide the hover widget if the editor mouse leave event is outside the hover widget #3528
                if (e.event.posx < rect.left || e.event.posx > rect.right || e.event.posy < rect.top || e.event.posy > rect.bottom) {
                    _this.hideHoverWidget();
                }
            }));
            this.toDispose.push(this.editor.onKeyDown(function (e) { return _this.onKeyDown(e); }));
            this.toDispose.push(this.editor.onDidChangeModelContent(function () {
                _this.wordToLineNumbersMap = null;
            }));
            this.toDispose.push(this.editor.onDidChangeModel(function () {
                var sf = _this.debugService.getViewModel().focusedStackFrame;
                var model = _this.editor.getModel();
                _this.editor.updateOptions({ hover: !sf || !model || model.uri.toString() !== sf.source.uri.toString() });
                _this.closeBreakpointWidget();
                _this.toggleExceptionWidget();
                _this.hideHoverWidget();
                _this.updateConfigurationWidgetVisibility();
                _this.wordToLineNumbersMap = null;
                _this.updateInlineDecorations(sf);
            }));
            this.toDispose.push(this.editor.onDidScrollChange(function () { return _this.hideHoverWidget; }));
            this.toDispose.push(this.debugService.onDidChangeState(function (state) {
                if (state !== debug_1.State.Stopped) {
                    _this.toggleExceptionWidget();
                }
            }));
        };
        DebugEditorContribution.prototype.getId = function () {
            return debug_1.EDITOR_CONTRIBUTION_ID;
        };
        DebugEditorContribution.prototype.showHover = function (range, focus) {
            var sf = this.debugService.getViewModel().focusedStackFrame;
            var model = this.editor.getModel();
            if (sf && model && sf.source.uri.toString() === model.uri.toString()) {
                return this.hoverWidget.showAt(range, focus);
            }
            return undefined;
        };
        DebugEditorContribution.prototype.marginFreeFromNonDebugDecorations = function (line) {
            var decorations = this.editor.getLineDecorations(line);
            if (decorations) {
                for (var _i = 0, decorations_1 = decorations; _i < decorations_1.length; _i++) {
                    var options = decorations_1[_i].options;
                    if (options.glyphMarginClassName && options.glyphMarginClassName.indexOf('debug') === -1) {
                        return false;
                    }
                }
            }
            return true;
        };
        DebugEditorContribution.prototype.ensureBreakpointHintDecoration = function (showBreakpointHintAtLineNumber) {
            var newDecoration = [];
            if (showBreakpointHintAtLineNumber !== -1) {
                newDecoration.push({
                    options: DebugEditorContribution.BREAKPOINT_HELPER_DECORATION,
                    range: {
                        startLineNumber: showBreakpointHintAtLineNumber,
                        startColumn: 1,
                        endLineNumber: showBreakpointHintAtLineNumber,
                        endColumn: 1
                    }
                });
            }
            this.breakpointHintDecoration = this.editor.deltaDecorations(this.breakpointHintDecoration, newDecoration);
        };
        DebugEditorContribution.prototype.onFocusStackFrame = function (sf) {
            var model = this.editor.getModel();
            if (model && sf && sf.source.uri.toString() === model.uri.toString()) {
                this.editor.updateOptions({ hover: false });
                this.toggleExceptionWidget();
            }
            else {
                this.editor.updateOptions({ hover: true });
                this.hideHoverWidget();
            }
            this.updateInlineDecorations(sf);
        };
        DebugEditorContribution.prototype.hideHoverWidget = function () {
            if (!this.hideHoverScheduler.isScheduled() && this.hoverWidget.isVisible()) {
                this.hideHoverScheduler.schedule();
            }
            this.showHoverScheduler.cancel();
        };
        // hover business
        DebugEditorContribution.prototype.onEditorMouseDown = function (mouseEvent) {
            if (mouseEvent.target.type === editorBrowser_1.MouseTargetType.CONTENT_WIDGET && mouseEvent.target.detail === debugHover_1.DebugHoverWidget.ID) {
                return;
            }
            this.hideHoverWidget();
        };
        DebugEditorContribution.prototype.onEditorMouseMove = function (mouseEvent) {
            if (this.debugService.state !== debug_1.State.Stopped) {
                return;
            }
            var targetType = mouseEvent.target.type;
            var stopKey = env.isMacintosh ? 'metaKey' : 'ctrlKey';
            if (targetType === editorBrowser_1.MouseTargetType.CONTENT_WIDGET && mouseEvent.target.detail === debugHover_1.DebugHoverWidget.ID && !mouseEvent.event[stopKey]) {
                // mouse moved on top of debug hover widget
                return;
            }
            if (targetType === editorBrowser_1.MouseTargetType.CONTENT_TEXT) {
                if (!mouseEvent.target.range.equalsRange(this.hoverRange)) {
                    this.hoverRange = mouseEvent.target.range;
                    this.showHoverScheduler.schedule();
                }
            }
            else {
                this.hideHoverWidget();
            }
        };
        DebugEditorContribution.prototype.onKeyDown = function (e) {
            var stopKey = env.isMacintosh ? 57 /* Meta */ : 5 /* Ctrl */;
            if (e.keyCode !== stopKey) {
                // do not hide hover when Ctrl/Meta is pressed
                this.hideHoverWidget();
            }
        };
        // end hover business
        // breakpoint widget
        DebugEditorContribution.prototype.showBreakpointWidget = function (lineNumber, column) {
            if (this.breakpointWidget) {
                this.breakpointWidget.dispose();
            }
            this.breakpointWidget = this.instantiationService.createInstance(breakpointWidget_1.BreakpointWidget, this.editor, lineNumber, column);
            this.breakpointWidget.show({ lineNumber: lineNumber, column: 1 }, 2);
            this.breakpointWidgetVisible.set(true);
        };
        DebugEditorContribution.prototype.closeBreakpointWidget = function () {
            if (this.breakpointWidget) {
                this.breakpointWidget.dispose();
                this.breakpointWidget = null;
                this.breakpointWidgetVisible.reset();
                this.editor.focus();
            }
        };
        // exception widget
        DebugEditorContribution.prototype.toggleExceptionWidget = function () {
            var _this = this;
            // Toggles exception widget based on the state of the current editor model and debug stack frame
            var model = this.editor.getModel();
            var focusedSf = this.debugService.getViewModel().focusedStackFrame;
            var callStack = focusedSf ? focusedSf.thread.getCallStack() : null;
            if (!model || !focusedSf || !callStack || callStack.length === 0) {
                this.closeExceptionWidget();
                return;
            }
            // First call stack frame that is available is the frame where exception has been thrown
            var exceptionSf = arrays_1.first(callStack, function (sf) { return sf.source && sf.source.available; }, undefined);
            if (!exceptionSf || exceptionSf !== focusedSf) {
                this.closeExceptionWidget();
                return;
            }
            var sameUri = exceptionSf.source.uri.toString() === model.uri.toString();
            if (this.exceptionWidget && !sameUri) {
                this.closeExceptionWidget();
            }
            else if (sameUri) {
                focusedSf.thread.exceptionInfo.then(function (exceptionInfo) {
                    if (exceptionInfo && exceptionSf.range.startLineNumber && exceptionSf.range.startColumn) {
                        _this.showExceptionWidget(exceptionInfo, exceptionSf.range.startLineNumber, exceptionSf.range.startColumn);
                    }
                });
            }
        };
        DebugEditorContribution.prototype.showExceptionWidget = function (exceptionInfo, lineNumber, column) {
            if (this.exceptionWidget) {
                this.exceptionWidget.dispose();
            }
            this.exceptionWidget = this.instantiationService.createInstance(exceptionWidget_1.ExceptionWidget, this.editor, exceptionInfo);
            this.exceptionWidget.show({ lineNumber: lineNumber, column: column }, 0);
        };
        DebugEditorContribution.prototype.closeExceptionWidget = function () {
            if (this.exceptionWidget) {
                this.exceptionWidget.dispose();
                this.exceptionWidget = null;
            }
        };
        // configuration widget
        DebugEditorContribution.prototype.updateConfigurationWidgetVisibility = function () {
            var _this = this;
            var model = this.editor.getModel();
            if (this.configurationWidget) {
                this.configurationWidget.dispose();
            }
            if (model && LAUNCH_JSON_REGEX.test(model.uri.toString())) {
                this.configurationWidget = this.instantiationService.createInstance(preferencesWidgets_1.FloatingClickWidget, this.editor, nls.localize('addConfiguration', "Add Configuration..."), null);
                this.configurationWidget.render();
                this.toDispose.push(this.configurationWidget.onClick(function () { return _this.addLaunchConfiguration().done(undefined, errors.onUnexpectedError); }));
            }
        };
        DebugEditorContribution.prototype.addLaunchConfiguration = function () {
            var _this = this;
            /* __GDPR__
                "debug/addLaunchConfiguration" : {}
            */
            this.telemetryService.publicLog('debug/addLaunchConfiguration');
            var configurationsArrayPosition;
            var model = this.editor.getModel();
            var depthInArray = 0;
            var lastProperty;
            json_1.visit(model.getValue(), {
                onObjectProperty: function (property, offset, length) {
                    lastProperty = property;
                },
                onArrayBegin: function (offset, length) {
                    if (lastProperty === 'configurations' && depthInArray === 0) {
                        configurationsArrayPosition = model.getPositionAt(offset + 1);
                    }
                    depthInArray++;
                },
                onArrayEnd: function () {
                    depthInArray--;
                }
            });
            this.editor.focus();
            if (!configurationsArrayPosition) {
                return this.commandService.executeCommand('editor.action.triggerSuggest');
            }
            var insertLine = function (position) {
                // Check if there are more characters on a line after a "configurations": [, if yes enter a newline
                if (_this.editor.getModel().getLineLastNonWhitespaceColumn(position.lineNumber) > position.column) {
                    _this.editor.setPosition(position);
                    coreCommands_1.CoreEditingCommands.LineBreakInsert.runEditorCommand(null, _this.editor, null);
                }
                // Check if there is already an empty line to insert suggest, if yes just place the cursor
                if (_this.editor.getModel().getLineLastNonWhitespaceColumn(position.lineNumber + 1) === 0) {
                    _this.editor.setPosition({ lineNumber: position.lineNumber + 1, column: 1073741824 /* MAX_SAFE_SMALL_INTEGER */ });
                    return winjs_base_1.TPromise.as(null);
                }
                _this.editor.setPosition(position);
                return _this.commandService.executeCommand('editor.action.insertLineAfter');
            };
            return insertLine(configurationsArrayPosition).then(function () { return _this.commandService.executeCommand('editor.action.triggerSuggest'); });
        };
        // Inline Decorations
        DebugEditorContribution.prototype.updateInlineDecorations = function (stackFrame) {
            var _this = this;
            var model = this.editor.getModel();
            if (!this.configurationService.getValue('debug').inlineValues ||
                !model || !stackFrame || model.uri.toString() !== stackFrame.source.uri.toString()) {
                if (!this.removeInlineValuesScheduler.isScheduled()) {
                    this.removeInlineValuesScheduler.schedule();
                }
                return;
            }
            this.removeInlineValuesScheduler.cancel();
            stackFrame.getMostSpecificScopes(stackFrame.range)
                .then(function (scopes) { return winjs_base_1.TPromise.join(scopes.map(function (scope) { return scope.getChildren()
                .then(function (children) {
                var range = new range_1.Range(0, 0, stackFrame.range.startLineNumber, stackFrame.range.startColumn);
                if (scope.range) {
                    range = range.setStartPosition(scope.range.startLineNumber, scope.range.startColumn);
                }
                return _this.createInlineValueDecorationsInsideRange(children, range);
            }); })).then(function (decorationsPerScope) {
                var allDecorations = decorationsPerScope.reduce(function (previous, current) { return previous.concat(current); }, []);
                _this.editor.setDecorations(INLINE_VALUE_DECORATION_KEY, allDecorations);
            }); });
        };
        DebugEditorContribution.prototype.createInlineValueDecorationsInsideRange = function (expressions, range) {
            var _this = this;
            var nameValueMap = new Map();
            for (var _i = 0, expressions_1 = expressions; _i < expressions_1.length; _i++) {
                var expr = expressions_1[_i];
                nameValueMap.set(expr.name, expr.value);
                // Limit the size of map. Too large can have a perf impact
                if (nameValueMap.size >= MAX_NUM_INLINE_VALUES) {
                    break;
                }
            }
            var lineToNamesMap = new Map();
            var wordToPositionsMap = this.getWordToPositionsMap();
            // Compute unique set of names on each line
            nameValueMap.forEach(function (value, name) {
                if (wordToPositionsMap.has(name)) {
                    for (var _i = 0, _a = wordToPositionsMap.get(name); _i < _a.length; _i++) {
                        var position = _a[_i];
                        if (range.containsPosition(position)) {
                            if (!lineToNamesMap.has(position.lineNumber)) {
                                lineToNamesMap.set(position.lineNumber, []);
                            }
                            if (lineToNamesMap.get(position.lineNumber).indexOf(name) === -1) {
                                lineToNamesMap.get(position.lineNumber).push(name);
                            }
                        }
                    }
                }
            });
            var decorations = [];
            // Compute decorators for each line
            lineToNamesMap.forEach(function (names, line) {
                var contentText = names.sort(function (first, second) {
                    var content = _this.editor.getModel().getLineContent(line);
                    return content.indexOf(first) - content.indexOf(second);
                }).map(function (name) { return name + " = " + nameValueMap.get(name); }).join(', ');
                decorations.push(_this.createInlineValueDecoration(line, contentText));
            });
            return decorations;
        };
        DebugEditorContribution.prototype.createInlineValueDecoration = function (lineNumber, contentText) {
            // If decoratorText is too long, trim and add ellipses. This could happen for minified files with everything on a single line
            if (contentText.length > MAX_INLINE_DECORATOR_LENGTH) {
                contentText = contentText.substr(0, MAX_INLINE_DECORATOR_LENGTH) + '...';
            }
            return {
                range: {
                    startLineNumber: lineNumber,
                    endLineNumber: lineNumber,
                    startColumn: 1073741824 /* MAX_SAFE_SMALL_INTEGER */,
                    endColumn: 1073741824 /* MAX_SAFE_SMALL_INTEGER */
                },
                renderOptions: {
                    after: {
                        contentText: contentText,
                        backgroundColor: 'rgba(255, 200, 0, 0.2)',
                        margin: '10px'
                    },
                    dark: {
                        after: {
                            color: 'rgba(255, 255, 255, 0.5)',
                        }
                    },
                    light: {
                        after: {
                            color: 'rgba(0, 0, 0, 0.5)',
                        }
                    }
                }
            };
        };
        DebugEditorContribution.prototype.getWordToPositionsMap = function () {
            if (!this.wordToLineNumbersMap) {
                this.wordToLineNumbersMap = new Map();
                var model = this.editor.getModel();
                if (!model) {
                    return this.wordToLineNumbersMap;
                }
                // For every word in every line, map its ranges for fast lookup
                for (var lineNumber = 1, len = model.getLineCount(); lineNumber <= len; ++lineNumber) {
                    var lineContent = model.getLineContent(lineNumber);
                    // If line is too long then skip the line
                    if (lineContent.length > MAX_TOKENIZATION_LINE_LEN) {
                        continue;
                    }
                    model.forceTokenization(lineNumber);
                    var lineTokens = model.getLineTokens(lineNumber);
                    for (var tokenIndex = 0, tokenCount = lineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
                        var tokenStartOffset = lineTokens.getStartOffset(tokenIndex);
                        var tokenEndOffset = lineTokens.getEndOffset(tokenIndex);
                        var tokenType = lineTokens.getStandardTokenType(tokenIndex);
                        var tokenStr = lineContent.substring(tokenStartOffset, tokenEndOffset);
                        // Token is a word and not a comment
                        if (tokenType === 0 /* Other */) {
                            wordHelper_1.DEFAULT_WORD_REGEXP.lastIndex = 0; // We assume tokens will usually map 1:1 to words if they match
                            var wordMatch = wordHelper_1.DEFAULT_WORD_REGEXP.exec(tokenStr);
                            if (wordMatch) {
                                var word = wordMatch[0];
                                if (!this.wordToLineNumbersMap.has(word)) {
                                    this.wordToLineNumbersMap.set(word, []);
                                }
                                this.wordToLineNumbersMap.get(word).push(new position_1.Position(lineNumber, tokenStartOffset));
                            }
                        }
                    }
                }
            }
            return this.wordToLineNumbersMap;
        };
        DebugEditorContribution.prototype.dispose = function () {
            if (this.breakpointWidget) {
                this.breakpointWidget.dispose();
            }
            if (this.hoverWidget) {
                this.hoverWidget.dispose();
            }
            if (this.configurationWidget) {
                this.configurationWidget.dispose();
            }
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        DebugEditorContribution.BREAKPOINT_HELPER_DECORATION = {
            glyphMarginClassName: 'debug-breakpoint-hint-glyph',
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        };
        DebugEditorContribution = __decorate([
            __param(1, debug_1.IDebugService),
            __param(2, contextView_1.IContextMenuService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, contextkey_1.IContextKeyService),
            __param(5, commands_1.ICommandService),
            __param(6, codeEditorService_1.ICodeEditorService),
            __param(7, telemetry_1.ITelemetryService),
            __param(8, configuration_1.IConfigurationService),
            __param(9, themeService_1.IThemeService),
            __param(10, keybinding_1.IKeybindingService)
        ], DebugEditorContribution);
        return DebugEditorContribution;
    }());
    exports.DebugEditorContribution = DebugEditorContribution;
    editorExtensions_1.registerEditorContribution(DebugEditorContribution);
});
