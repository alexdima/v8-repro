/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/actions", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/common/debugModel", "vs/workbench/parts/debug/browser/debugActions", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/paths", "vs/platform/environment/common/environment", "vs/base/common/winjs.base", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/editor/common/editor", "vs/base/browser/ui/inputbox/inputBox", "vs/platform/list/browser/listService", "vs/workbench/browser/parts/views/viewsViewlet", "vs/platform/theme/common/styler", "vs/editor/browser/editorBrowser", "vs/platform/configuration/common/configuration", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, nls, resources, dom, errors_1, actions_1, debug_1, debugModel_1, debugActions_1, contextView_1, instantiation_1, keybinding_1, themeService_1, workspace_1, labels_1, lifecycle_1, paths_1, environment_1, winjs_base_1, actionbar_1, editor_1, inputBox_1, listService_1, viewsViewlet_1, styler_1, editorBrowser_1, configuration_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var BreakpointsView = /** @class */ (function (_super) {
        __extends(BreakpointsView, _super);
        function BreakpointsView(options, contextMenuService, debugService, keybindingService, instantiationService, themeService, editorService, contextViewService, configurationService) {
            var _this = _super.call(this, options, keybindingService, contextMenuService, configurationService) || this;
            _this.debugService = debugService;
            _this.instantiationService = instantiationService;
            _this.themeService = themeService;
            _this.editorService = editorService;
            _this.contextViewService = contextViewService;
            _this.minimumBodySize = _this.maximumBodySize = _this.getExpandedBodySize();
            _this.settings = options.viewletSettings;
            _this.disposables.push(_this.debugService.getModel().onDidChangeBreakpoints(function () { return _this.onBreakpointsChange(); }));
            return _this;
        }
        BreakpointsView.prototype.renderBody = function (container) {
            var _this = this;
            dom.addClass(container, 'debug-breakpoints');
            var delegate = new BreakpointsDelegate(this.debugService);
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchList, container, delegate, [
                this.instantiationService.createInstance(BreakpointsRenderer),
                new ExceptionBreakpointsRenderer(this.debugService),
                this.instantiationService.createInstance(FunctionBreakpointsRenderer),
                new FunctionBreakpointInputRenderer(this.debugService, this.contextViewService, this.themeService)
            ], {
                identityProvider: function (element) { return element.getId(); },
                multipleSelectionSupport: false
            });
            debug_1.CONTEXT_BREAKPOINTS_FOCUSED.bindTo(this.list.contextKeyService);
            this.list.onContextMenu(this.onListContextMenu, this, this.disposables);
            this.disposables.push(this.list.onOpen(function (e) {
                var isSingleClick = false;
                var isDoubleClick = false;
                var openToSide = false;
                var browserEvent = e.browserEvent;
                if (browserEvent instanceof MouseEvent) {
                    isSingleClick = browserEvent.detail === 1;
                    isDoubleClick = browserEvent.detail === 2;
                    openToSide = (browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey);
                }
                var focused = _this.list.getFocusedElements();
                var element = focused.length ? focused[0] : undefined;
                if (element instanceof debugModel_1.Breakpoint) {
                    openBreakpointSource(element, openToSide, isSingleClick, _this.debugService, _this.editorService).done(undefined, errors_1.onUnexpectedError);
                }
                if (isDoubleClick && element instanceof debugModel_1.FunctionBreakpoint && element !== _this.debugService.getViewModel().getSelectedFunctionBreakpoint()) {
                    _this.debugService.getViewModel().setSelectedFunctionBreakpoint(element);
                    _this.onBreakpointsChange();
                }
            }));
            this.list.splice(0, this.list.length, this.elements);
        };
        BreakpointsView.prototype.layoutBody = function (size) {
            if (this.list) {
                this.list.layout(size);
            }
        };
        BreakpointsView.prototype.onListContextMenu = function (e) {
            var _this = this;
            var actions = [];
            var element = e.element;
            if (element instanceof debugModel_1.Breakpoint) {
                actions.push(new actions_1.Action('workbench.action.debug.openEditorAndEditBreakpoint', nls.localize('editConditionalBreakpoint', "Edit Breakpoint..."), undefined, true, function () {
                    return openBreakpointSource(element, false, false, _this.debugService, _this.editorService).then(function (editor) {
                        var codeEditor = editor.getControl();
                        if (editorBrowser_1.isCodeEditor(codeEditor)) {
                            codeEditor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID).showBreakpointWidget(element.lineNumber, element.column);
                        }
                    });
                }));
                actions.push(new actionbar_1.Separator());
            }
            actions.push(new debugActions_1.RemoveBreakpointAction(debugActions_1.RemoveBreakpointAction.ID, debugActions_1.RemoveBreakpointAction.LABEL, this.debugService, this.keybindingService));
            if (this.debugService.getModel().getBreakpoints().length + this.debugService.getModel().getFunctionBreakpoints().length > 1) {
                actions.push(new debugActions_1.RemoveAllBreakpointsAction(debugActions_1.RemoveAllBreakpointsAction.ID, debugActions_1.RemoveAllBreakpointsAction.LABEL, this.debugService, this.keybindingService));
                actions.push(new actionbar_1.Separator());
                actions.push(new debugActions_1.EnableAllBreakpointsAction(debugActions_1.EnableAllBreakpointsAction.ID, debugActions_1.EnableAllBreakpointsAction.LABEL, this.debugService, this.keybindingService));
                actions.push(new debugActions_1.DisableAllBreakpointsAction(debugActions_1.DisableAllBreakpointsAction.ID, debugActions_1.DisableAllBreakpointsAction.LABEL, this.debugService, this.keybindingService));
            }
            actions.push(new actionbar_1.Separator());
            actions.push(new debugActions_1.ReapplyBreakpointsAction(debugActions_1.ReapplyBreakpointsAction.ID, debugActions_1.ReapplyBreakpointsAction.LABEL, this.debugService, this.keybindingService));
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return e.anchor; },
                getActions: function () { return winjs_base_1.TPromise.as(actions); },
                getActionsContext: function () { return element; }
            });
        };
        BreakpointsView.prototype.getActions = function () {
            return [
                new debugActions_1.AddFunctionBreakpointAction(debugActions_1.AddFunctionBreakpointAction.ID, debugActions_1.AddFunctionBreakpointAction.LABEL, this.debugService, this.keybindingService),
                new debugActions_1.ToggleBreakpointsActivatedAction(debugActions_1.ToggleBreakpointsActivatedAction.ID, debugActions_1.ToggleBreakpointsActivatedAction.ACTIVATE_LABEL, this.debugService, this.keybindingService),
                new debugActions_1.RemoveAllBreakpointsAction(debugActions_1.RemoveAllBreakpointsAction.ID, debugActions_1.RemoveAllBreakpointsAction.LABEL, this.debugService, this.keybindingService)
            ];
        };
        BreakpointsView.prototype.setExpanded = function (expanded) {
            _super.prototype.setExpanded.call(this, expanded);
            if (expanded && this.needsRefresh) {
                this.onBreakpointsChange();
            }
        };
        BreakpointsView.prototype.setVisible = function (visible) {
            var _this = this;
            return _super.prototype.setVisible.call(this, visible).then(function () {
                if (visible && _this.needsRefresh) {
                    _this.onBreakpointsChange();
                }
            });
        };
        BreakpointsView.prototype.onBreakpointsChange = function () {
            if (this.isExpanded() && this.isVisible()) {
                this.minimumBodySize = this.getExpandedBodySize();
                if (this.maximumBodySize < Number.POSITIVE_INFINITY) {
                    this.maximumBodySize = this.minimumBodySize;
                }
                if (this.list) {
                    this.list.splice(0, this.list.length, this.elements);
                    this.needsRefresh = false;
                }
            }
            else {
                this.needsRefresh = true;
            }
        };
        Object.defineProperty(BreakpointsView.prototype, "elements", {
            get: function () {
                var model = this.debugService.getModel();
                var elements = model.getExceptionBreakpoints().concat(model.getFunctionBreakpoints()).concat(model.getBreakpoints());
                return elements;
            },
            enumerable: true,
            configurable: true
        });
        BreakpointsView.prototype.getExpandedBodySize = function () {
            var model = this.debugService.getModel();
            var length = model.getBreakpoints().length + model.getExceptionBreakpoints().length + model.getFunctionBreakpoints().length;
            return Math.min(BreakpointsView.MAX_VISIBLE_FILES, length) * 22;
        };
        BreakpointsView.prototype.shutdown = function () {
            this.settings[BreakpointsView.MEMENTO] = !this.isExpanded();
        };
        BreakpointsView.MAX_VISIBLE_FILES = 9;
        BreakpointsView.MEMENTO = 'breakopintsview.memento';
        BreakpointsView = __decorate([
            __param(1, contextView_1.IContextMenuService),
            __param(2, debug_1.IDebugService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, themeService_1.IThemeService),
            __param(6, editor_1.IEditorService),
            __param(7, contextView_1.IContextViewService),
            __param(8, configuration_1.IConfigurationService)
        ], BreakpointsView);
        return BreakpointsView;
    }(viewsViewlet_1.ViewsViewletPanel));
    exports.BreakpointsView = BreakpointsView;
    var BreakpointsDelegate = /** @class */ (function () {
        function BreakpointsDelegate(debugService) {
            this.debugService = debugService;
            // noop
        }
        BreakpointsDelegate.prototype.getHeight = function (element) {
            return 22;
        };
        BreakpointsDelegate.prototype.getTemplateId = function (element) {
            if (element instanceof debugModel_1.Breakpoint) {
                return BreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.FunctionBreakpoint) {
                var selected = this.debugService.getViewModel().getSelectedFunctionBreakpoint();
                if (!element.name || (selected && selected.getId() === element.getId())) {
                    return FunctionBreakpointInputRenderer.ID;
                }
                return FunctionBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.ExceptionBreakpoint) {
                return ExceptionBreakpointsRenderer.ID;
            }
            return undefined;
        };
        return BreakpointsDelegate;
    }());
    var BreakpointsRenderer = /** @class */ (function () {
        function BreakpointsRenderer(debugService, contextService, environmentService, textFileService) {
            this.debugService = debugService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.textFileService = textFileService;
            // noop
        }
        Object.defineProperty(BreakpointsRenderer.prototype, "templateId", {
            get: function () {
                return BreakpointsRenderer.ID;
            },
            enumerable: true,
            configurable: true
        });
        BreakpointsRenderer.prototype.renderTemplate = function (container) {
            var _this = this;
            var data = Object.create(null);
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = $('input');
            data.checkbox.type = 'checkbox';
            data.toDispose = [];
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', function (e) {
                _this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.filePath = dom.append(data.breakpoint, $('span.file-path'));
            var lineNumberContainer = dom.append(data.breakpoint, $('.line-number-container'));
            data.lineNumber = dom.append(lineNumberContainer, $('span.line-number'));
            return data;
        };
        BreakpointsRenderer.prototype.renderElement = function (breakpoint, index, data) {
            data.context = breakpoint;
            dom.toggleClass(data.breakpoint, 'disabled', !this.debugService.getModel().areBreakpointsActivated());
            data.name.textContent = paths_1.basename(labels_1.getPathLabel(breakpoint.uri, this.contextService));
            data.lineNumber.textContent = breakpoint.lineNumber.toString();
            if (breakpoint.column) {
                data.lineNumber.textContent += ":" + breakpoint.column;
            }
            data.filePath.textContent = labels_1.getPathLabel(resources.dirname(breakpoint.uri), this.contextService, this.environmentService);
            data.checkbox.checked = breakpoint.enabled;
            var _a = getBreakpointMessageAndClassName(this.debugService, this.textFileService, breakpoint), message = _a.message, className = _a.className;
            data.icon.className = className + ' icon';
            data.icon.title = message ? message : '';
            var debugActive = this.debugService.state === debug_1.State.Running || this.debugService.state === debug_1.State.Stopped;
            if (debugActive && !breakpoint.verified) {
                dom.addClass(data.breakpoint, 'disabled');
                if (breakpoint.message) {
                    data.breakpoint.title = breakpoint.message;
                }
            }
            else if (breakpoint.condition || breakpoint.hitCondition) {
                data.breakpoint.title = breakpoint.condition ? breakpoint.condition : breakpoint.hitCondition;
            }
        };
        BreakpointsRenderer.prototype.disposeTemplate = function (templateData) {
            lifecycle_1.dispose(templateData.toDispose);
        };
        BreakpointsRenderer.ID = 'breakpoints';
        BreakpointsRenderer = __decorate([
            __param(0, debug_1.IDebugService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, textfiles_1.ITextFileService)
        ], BreakpointsRenderer);
        return BreakpointsRenderer;
    }());
    var ExceptionBreakpointsRenderer = /** @class */ (function () {
        function ExceptionBreakpointsRenderer(debugService) {
            this.debugService = debugService;
            // noop
        }
        Object.defineProperty(ExceptionBreakpointsRenderer.prototype, "templateId", {
            get: function () {
                return ExceptionBreakpointsRenderer.ID;
            },
            enumerable: true,
            configurable: true
        });
        ExceptionBreakpointsRenderer.prototype.renderTemplate = function (container) {
            var _this = this;
            var data = Object.create(null);
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.checkbox = $('input');
            data.checkbox.type = 'checkbox';
            data.toDispose = [];
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', function (e) {
                _this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            dom.addClass(data.breakpoint, 'exception');
            return data;
        };
        ExceptionBreakpointsRenderer.prototype.renderElement = function (exceptionBreakpoint, index, data) {
            data.context = exceptionBreakpoint;
            data.name.textContent = exceptionBreakpoint.label || exceptionBreakpoint.filter + " exceptions";
            data.breakpoint.title = data.name.textContent;
            data.checkbox.checked = exceptionBreakpoint.enabled;
        };
        ExceptionBreakpointsRenderer.prototype.disposeTemplate = function (templateData) {
            lifecycle_1.dispose(templateData.toDispose);
        };
        ExceptionBreakpointsRenderer.ID = 'exceptionbreakpoints';
        return ExceptionBreakpointsRenderer;
    }());
    var FunctionBreakpointsRenderer = /** @class */ (function () {
        function FunctionBreakpointsRenderer(debugService, textFileService) {
            this.debugService = debugService;
            this.textFileService = textFileService;
            // noop
        }
        Object.defineProperty(FunctionBreakpointsRenderer.prototype, "templateId", {
            get: function () {
                return FunctionBreakpointsRenderer.ID;
            },
            enumerable: true,
            configurable: true
        });
        FunctionBreakpointsRenderer.prototype.renderTemplate = function (container) {
            var _this = this;
            var data = Object.create(null);
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = $('input');
            data.checkbox.type = 'checkbox';
            data.toDispose = [];
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', function (e) {
                _this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            return data;
        };
        FunctionBreakpointsRenderer.prototype.renderElement = function (functionBreakpoint, index, data) {
            data.context = functionBreakpoint;
            data.name.textContent = functionBreakpoint.name;
            var _a = getBreakpointMessageAndClassName(this.debugService, this.textFileService, functionBreakpoint), className = _a.className, message = _a.message;
            data.icon.className = className + ' icon';
            data.icon.title = message ? message : '';
            data.checkbox.checked = functionBreakpoint.enabled;
            data.breakpoint.title = functionBreakpoint.name;
            // Mark function breakpoints as disabled if deactivated or if debug type does not support them #9099
            var process = this.debugService.getViewModel().focusedProcess;
            dom.toggleClass(data.breakpoint, 'disalbed', (process && !process.session.capabilities.supportsFunctionBreakpoints) || !this.debugService.getModel().areBreakpointsActivated());
            if (process && !process.session.capabilities.supportsFunctionBreakpoints) {
                data.breakpoint.title = nls.localize('functionBreakpointsNotSupported', "Function breakpoints are not supported by this debug type");
            }
        };
        FunctionBreakpointsRenderer.prototype.disposeTemplate = function (templateData) {
            lifecycle_1.dispose(templateData.toDispose);
        };
        FunctionBreakpointsRenderer.ID = 'functionbreakpoints';
        FunctionBreakpointsRenderer = __decorate([
            __param(0, debug_1.IDebugService),
            __param(1, textfiles_1.ITextFileService)
        ], FunctionBreakpointsRenderer);
        return FunctionBreakpointsRenderer;
    }());
    var FunctionBreakpointInputRenderer = /** @class */ (function () {
        function FunctionBreakpointInputRenderer(debugService, contextViewService, themeService) {
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.themeService = themeService;
            // noop
        }
        Object.defineProperty(FunctionBreakpointInputRenderer.prototype, "templateId", {
            get: function () {
                return FunctionBreakpointInputRenderer.ID;
            },
            enumerable: true,
            configurable: true
        });
        FunctionBreakpointInputRenderer.prototype.renderTemplate = function (container) {
            var _this = this;
            var template = Object.create(null);
            var inputBoxContainer = dom.append(container, $('.inputBoxContainer'));
            var inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, {
                placeholder: nls.localize('functionBreakpointPlaceholder', "Function to break on"),
                ariaLabel: nls.localize('functionBreakPointInputAriaLabel', "Type function breakpoint")
            });
            var styler = styler_1.attachInputBoxStyler(inputBox, this.themeService);
            var toDispose = [inputBox, styler];
            var wrapUp = function (renamed) {
                if (!template.reactedOnEvent) {
                    template.reactedOnEvent = true;
                    _this.debugService.getViewModel().setSelectedFunctionBreakpoint(undefined);
                    if (inputBox.value && (renamed || template.breakpoint.name)) {
                        _this.debugService.renameFunctionBreakpoint(template.breakpoint.getId(), renamed ? inputBox.value : template.breakpoint.name).done(null, errors_1.onUnexpectedError);
                    }
                    else {
                        _this.debugService.removeFunctionBreakpoints(template.breakpoint.getId()).done(null, errors_1.onUnexpectedError);
                    }
                }
            };
            toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', function (e) {
                var isEscape = e.equals(9 /* Escape */);
                var isEnter = e.equals(3 /* Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', function () {
                wrapUp(true);
            }));
            template.inputBox = inputBox;
            template.toDispose = toDispose;
            return template;
        };
        FunctionBreakpointInputRenderer.prototype.renderElement = function (functionBreakpoint, index, data) {
            data.breakpoint = functionBreakpoint;
            data.reactedOnEvent = false;
            data.inputBox.value = functionBreakpoint.name || '';
            data.inputBox.focus();
            data.inputBox.select();
        };
        FunctionBreakpointInputRenderer.prototype.disposeTemplate = function (templateData) {
            lifecycle_1.dispose(templateData.toDispose);
        };
        FunctionBreakpointInputRenderer.ID = 'functionbreakpointinput';
        return FunctionBreakpointInputRenderer;
    }());
    function openBreakpointSource(breakpoint, sideBySide, preserveFocus, debugService, editorService) {
        if (breakpoint.uri.scheme === debug_1.DEBUG_SCHEME && debugService.state === debug_1.State.Inactive) {
            return winjs_base_1.TPromise.as(null);
        }
        var selection = breakpoint.endLineNumber ? {
            startLineNumber: breakpoint.lineNumber,
            endLineNumber: breakpoint.endLineNumber,
            startColumn: breakpoint.column,
            endColumn: breakpoint.endColumn
        } : {
            startLineNumber: breakpoint.lineNumber,
            startColumn: breakpoint.column || 1,
            endLineNumber: breakpoint.lineNumber,
            endColumn: breakpoint.column || 1073741824 /* MAX_SAFE_SMALL_INTEGER */
        };
        return editorService.openEditor({
            resource: breakpoint.uri,
            options: {
                preserveFocus: preserveFocus,
                selection: selection,
                revealIfVisible: true,
                revealInCenterIfOutsideViewport: true,
                pinned: !preserveFocus
            }
        }, sideBySide);
    }
    exports.openBreakpointSource = openBreakpointSource;
    function getBreakpointMessageAndClassName(debugService, textFileService, breakpoint) {
        var state = debugService.state;
        var debugActive = state === debug_1.State.Running || state === debug_1.State.Stopped;
        if (!breakpoint.enabled || !debugService.getModel().areBreakpointsActivated()) {
            return {
                className: 'debug-breakpoint-disabled-glyph',
                message: nls.localize('breakpointDisabledHover', "Disabled Breakpoint"),
            };
        }
        var appendMessage = function (text) {
            return !(breakpoint instanceof debugModel_1.FunctionBreakpoint) && breakpoint.message ? text.concat(breakpoint.message) : text;
        };
        if (debugActive && !breakpoint.verified) {
            return {
                className: 'debug-breakpoint-unverified-glyph',
                message: appendMessage(nls.localize('breakpointUnverifieddHover', "Unverified Breakpoint")),
            };
        }
        var process = debugService.getViewModel().focusedProcess;
        if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
            if (process && !process.session.capabilities.supportsFunctionBreakpoints) {
                return {
                    className: 'debug-breakpoint-unsupported-glyph',
                    message: nls.localize('functionBreakpointUnsupported', "Function breakpoints not supported by this debug type"),
                };
            }
            return {
                className: 'debug-breakpoint-glyph',
            };
        }
        if (debugActive && textFileService.isDirty(breakpoint.uri)) {
            return {
                className: 'debug-breakpoint-unverified-glyph',
                message: appendMessage(nls.localize('breakpointDirtydHover', "Unverified breakpoint. File is modified, please restart debug session.")),
            };
        }
        if (breakpoint.condition || breakpoint.hitCondition) {
            if (process && breakpoint.condition && !process.session.capabilities.supportsConditionalBreakpoints) {
                return {
                    className: 'debug-breakpoint-unsupported-glyph',
                    message: nls.localize('conditionalBreakpointUnsupported', "Conditional breakpoints not supported by this debug type"),
                };
            }
            if (process && breakpoint.hitCondition && !process.session.capabilities.supportsHitConditionalBreakpoints) {
                return {
                    className: 'debug-breakpoint-unsupported-glyph',
                    message: nls.localize('hitBreakpointUnsupported', "Hit conditional breakpoints not supported by this debug type"),
                };
            }
            if (breakpoint.condition && breakpoint.hitCondition) {
                return {
                    className: 'debug-breakpoint-conditional-glyph',
                    message: appendMessage("Expression: " + breakpoint.condition + "\nHitCount: " + breakpoint.hitCondition)
                };
            }
            return {
                className: 'debug-breakpoint-conditional-glyph',
                message: appendMessage(breakpoint.condition ? breakpoint.condition : breakpoint.hitCondition)
            };
        }
        return {
            className: 'debug-breakpoint-glyph',
            message: breakpoint.message
        };
    }
    exports.getBreakpointMessageAndClassName = getBreakpointMessageAndClassName;
});
