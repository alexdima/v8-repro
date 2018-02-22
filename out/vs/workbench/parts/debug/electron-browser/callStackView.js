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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/common/debugModel", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/workbench/parts/debug/browser/baseDebugView", "vs/workbench/parts/debug/browser/debugActions", "vs/workbench/parts/debug/electron-browser/electronDebugActions", "vs/platform/workspace/common/workspace", "vs/platform/environment/common/environment", "vs/base/common/resources", "vs/platform/list/browser/listService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration"], function (require, exports, nls, async_1, dom, winjs_base_1, errors, viewsViewlet_1, debug_1, debugModel_1, contextView_1, instantiation_1, actions_1, keybinding_1, baseDebugView_1, debugActions_1, electronDebugActions_1, workspace_1, environment_1, resources_1, listService_1, editorService_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var CallStackView = /** @class */ (function (_super) {
        __extends(CallStackView, _super);
        function CallStackView(options, contextMenuService, debugService, keybindingService, instantiationService, editorService, configurationService) {
            var _this = _super.call(this, __assign({}, options, { ariaHeaderLabel: nls.localize('callstackSection', "Call Stack Section") }), keybindingService, contextMenuService, configurationService) || this;
            _this.options = options;
            _this.debugService = debugService;
            _this.instantiationService = instantiationService;
            _this.editorService = editorService;
            _this.settings = options.viewletSettings;
            // Create scheduler to prevent unnecessary flashing of tree when reacting to changes
            _this.onCallStackChangeScheduler = new async_1.RunOnceScheduler(function () {
                var newTreeInput = _this.debugService.getModel();
                var processes = _this.debugService.getModel().getProcesses();
                if (!_this.debugService.getViewModel().isMultiProcessView() && processes.length) {
                    var threads = processes[0].getAllThreads();
                    // Only show the threads in the call stack if there is more than 1 thread.
                    newTreeInput = threads.length === 1 ? threads[0] : processes[0];
                }
                // Only show the global pause message if we do not display threads.
                // Otherwise there will be a pause message per thread and there is no need for a global one.
                if (newTreeInput instanceof debugModel_1.Thread && newTreeInput.stoppedDetails) {
                    _this.pauseMessageLabel.textContent = newTreeInput.stoppedDetails.description || nls.localize('debugStopped', "Paused on {0}", newTreeInput.stoppedDetails.reason);
                    if (newTreeInput.stoppedDetails.text) {
                        _this.pauseMessageLabel.title = newTreeInput.stoppedDetails.text;
                    }
                    dom.toggleClass(_this.pauseMessageLabel, 'exception', newTreeInput.stoppedDetails.reason === 'exception');
                    _this.pauseMessage.hidden = false;
                }
                else {
                    _this.pauseMessage.hidden = true;
                }
                _this.needsRefresh = false;
                (_this.tree.getInput() === newTreeInput ? _this.tree.refresh() : _this.tree.setInput(newTreeInput))
                    .done(function () { return _this.updateTreeSelection(); }, errors.onUnexpectedError);
            }, 50);
            return _this;
        }
        CallStackView.prototype.renderHeaderTitle = function (container) {
            var title = dom.append(container, $('.title.debug-call-stack-title'));
            var name = dom.append(title, $('span'));
            name.textContent = this.options.name;
            this.pauseMessage = dom.append(title, $('span.pause-message'));
            this.pauseMessage.hidden = true;
            this.pauseMessageLabel = dom.append(this.pauseMessage, $('span.label'));
        };
        CallStackView.prototype.renderBody = function (container) {
            var _this = this;
            dom.addClass(container, 'debug-call-stack');
            this.treeContainer = baseDebugView_1.renderViewTree(container);
            var actionProvider = new CallStackActionProvider(this.debugService, this.keybindingService);
            var controller = this.instantiationService.createInstance(CallStackController, actionProvider, actions_1.MenuId.DebugCallStackContext, {});
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchTree, this.treeContainer, {
                dataSource: new CallStackDataSource(),
                renderer: this.instantiationService.createInstance(CallStackRenderer),
                accessibilityProvider: this.instantiationService.createInstance(CallstackAccessibilityProvider),
                controller: controller
            }, {
                ariaLabel: nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'callStackAriaLabel' }, "Debug Call Stack"),
                twistiePixels: baseDebugView_1.twistiePixels
            });
            var callstackNavigator = new listService_1.TreeResourceNavigator(this.tree);
            this.disposables.push(callstackNavigator);
            this.disposables.push(callstackNavigator.openResource(function (e) {
                if (_this.ignoreSelectionChangedEvent) {
                    return;
                }
                var element = e.element;
                if (element instanceof debugModel_1.StackFrame) {
                    _this.debugService.focusStackFrame(element, element.thread, element.thread.process, true);
                    element.openInEditor(_this.editorService, e.editorOptions.preserveFocus, e.sideBySide, e.editorOptions.pinned).done(undefined, errors.onUnexpectedError);
                }
                if (element instanceof debugModel_1.Thread) {
                    _this.debugService.focusStackFrame(undefined, element, element.process, true);
                }
                if (element instanceof debugModel_1.Process) {
                    _this.debugService.focusStackFrame(undefined, undefined, element, true);
                }
                if (element instanceof debugModel_1.ThreadAndProcessIds) {
                    var process_1 = _this.debugService.getModel().getProcesses().filter(function (p) { return p.getId() === element.processId; }).pop();
                    var thread = process_1 && process_1.getThread(element.threadId);
                    if (thread) {
                        thread.fetchCallStack()
                            .done(function () { return _this.tree.refresh(); }, errors.onUnexpectedError);
                    }
                }
            }));
            this.disposables.push(this.debugService.getModel().onDidChangeCallStack(function () {
                if (!_this.isVisible()) {
                    _this.needsRefresh = true;
                    return;
                }
                if (!_this.onCallStackChangeScheduler.isScheduled()) {
                    _this.onCallStackChangeScheduler.schedule();
                }
            }));
            this.disposables.push(this.debugService.getViewModel().onDidFocusStackFrame(function () {
                if (!_this.isVisible) {
                    _this.needsRefresh = true;
                    return;
                }
                _this.updateTreeSelection().done(undefined, errors.onUnexpectedError);
            }));
            // Schedule the update of the call stack tree if the viewlet is opened after a session started #14684
            if (this.debugService.state === debug_1.State.Stopped) {
                this.onCallStackChangeScheduler.schedule();
            }
        };
        CallStackView.prototype.layoutBody = function (size) {
            if (this.treeContainer) {
                this.treeContainer.style.height = size + 'px';
            }
            _super.prototype.layoutBody.call(this, size);
        };
        CallStackView.prototype.updateTreeSelection = function () {
            var _this = this;
            if (!this.tree.getInput()) {
                // Tree not initialized yet
                return winjs_base_1.TPromise.as(null);
            }
            var stackFrame = this.debugService.getViewModel().focusedStackFrame;
            var thread = this.debugService.getViewModel().focusedThread;
            var process = this.debugService.getViewModel().focusedProcess;
            var updateSelection = function (element) {
                _this.ignoreSelectionChangedEvent = true;
                try {
                    _this.tree.setSelection([element]);
                }
                finally {
                    _this.ignoreSelectionChangedEvent = false;
                }
            };
            if (!thread) {
                if (!process) {
                    this.tree.clearSelection();
                    return winjs_base_1.TPromise.as(null);
                }
                updateSelection(process);
                return this.tree.reveal(process);
            }
            return this.tree.expandAll([thread.process, thread]).then(function () {
                if (!stackFrame) {
                    return winjs_base_1.TPromise.as(null);
                }
                updateSelection(stackFrame);
                return _this.tree.reveal(stackFrame);
            });
        };
        CallStackView.prototype.setVisible = function (visible) {
            var _this = this;
            return _super.prototype.setVisible.call(this, visible).then(function () {
                if (visible && _this.needsRefresh) {
                    _this.onCallStackChangeScheduler.schedule();
                }
            });
        };
        CallStackView.prototype.shutdown = function () {
            this.settings[CallStackView.MEMENTO] = !this.isExpanded();
            _super.prototype.shutdown.call(this);
        };
        CallStackView.MEMENTO = 'callstackview.memento';
        CallStackView = __decorate([
            __param(1, contextView_1.IContextMenuService),
            __param(2, debug_1.IDebugService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, editorService_1.IWorkbenchEditorService),
            __param(6, configuration_1.IConfigurationService)
        ], CallStackView);
        return CallStackView;
    }(viewsViewlet_1.TreeViewsViewletPanel));
    exports.CallStackView = CallStackView;
    var CallStackController = /** @class */ (function (_super) {
        __extends(CallStackController, _super);
        function CallStackController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CallStackController.prototype.getContext = function (element) {
            if (element instanceof debugModel_1.StackFrame) {
                if (element.source.inMemory) {
                    return element.source.raw.path || element.source.reference;
                }
                return element.source.uri.toString();
            }
            if (element instanceof debugModel_1.Thread) {
                return element.threadId;
            }
        };
        return CallStackController;
    }(baseDebugView_1.BaseDebugController));
    var CallStackActionProvider = /** @class */ (function () {
        function CallStackActionProvider(debugService, keybindingService) {
            this.debugService = debugService;
            this.keybindingService = keybindingService;
            // noop
        }
        CallStackActionProvider.prototype.hasActions = function (tree, element) {
            return false;
        };
        CallStackActionProvider.prototype.getActions = function (tree, element) {
            return winjs_base_1.TPromise.as([]);
        };
        CallStackActionProvider.prototype.hasSecondaryActions = function (tree, element) {
            return element !== tree.getInput();
        };
        CallStackActionProvider.prototype.getSecondaryActions = function (tree, element) {
            var actions = [];
            if (element instanceof debugModel_1.Process) {
                actions.push(new debugActions_1.RestartAction(debugActions_1.RestartAction.ID, debugActions_1.RestartAction.LABEL, this.debugService, this.keybindingService));
                actions.push(new debugActions_1.StopAction(debugActions_1.StopAction.ID, debugActions_1.StopAction.LABEL, this.debugService, this.keybindingService));
            }
            else if (element instanceof debugModel_1.Thread) {
                var thread = element;
                if (thread.stopped) {
                    actions.push(new debugActions_1.ContinueAction(debugActions_1.ContinueAction.ID, debugActions_1.ContinueAction.LABEL, this.debugService, this.keybindingService));
                    actions.push(new debugActions_1.StepOverAction(debugActions_1.StepOverAction.ID, debugActions_1.StepOverAction.LABEL, this.debugService, this.keybindingService));
                    actions.push(new debugActions_1.StepIntoAction(debugActions_1.StepIntoAction.ID, debugActions_1.StepIntoAction.LABEL, this.debugService, this.keybindingService));
                    actions.push(new debugActions_1.StepOutAction(debugActions_1.StepOutAction.ID, debugActions_1.StepOutAction.LABEL, this.debugService, this.keybindingService));
                }
                else {
                    actions.push(new debugActions_1.PauseAction(debugActions_1.PauseAction.ID, debugActions_1.PauseAction.LABEL, this.debugService, this.keybindingService));
                }
            }
            else if (element instanceof debugModel_1.StackFrame) {
                if (element.thread.process.session.capabilities.supportsRestartFrame) {
                    actions.push(new debugActions_1.RestartFrameAction(debugActions_1.RestartFrameAction.ID, debugActions_1.RestartFrameAction.LABEL, this.debugService, this.keybindingService));
                }
                actions.push(new electronDebugActions_1.CopyStackTraceAction(electronDebugActions_1.CopyStackTraceAction.ID, electronDebugActions_1.CopyStackTraceAction.LABEL));
            }
            return winjs_base_1.TPromise.as(actions);
        };
        CallStackActionProvider.prototype.getActionItem = function (tree, element, action) {
            return null;
        };
        return CallStackActionProvider;
    }());
    var CallStackDataSource = /** @class */ (function () {
        function CallStackDataSource() {
        }
        CallStackDataSource.prototype.getId = function (tree, element) {
            if (typeof element === 'string') {
                return element;
            }
            return element.getId();
        };
        CallStackDataSource.prototype.hasChildren = function (tree, element) {
            return element instanceof debugModel_1.Model || element instanceof debugModel_1.Process || (element instanceof debugModel_1.Thread && element.stopped);
        };
        CallStackDataSource.prototype.getChildren = function (tree, element) {
            if (element instanceof debugModel_1.Thread) {
                return this.getThreadChildren(element);
            }
            if (element instanceof debugModel_1.Model) {
                return winjs_base_1.TPromise.as(element.getProcesses());
            }
            var process = element;
            return winjs_base_1.TPromise.as(process.getAllThreads());
        };
        CallStackDataSource.prototype.getThreadChildren = function (thread) {
            var callStack = thread.getCallStack();
            var callStackPromise = winjs_base_1.TPromise.as(null);
            if (!callStack || !callStack.length) {
                callStackPromise = thread.fetchCallStack().then(function () { return callStack = thread.getCallStack(); });
            }
            return callStackPromise.then(function () {
                if (callStack.length === 1 && thread.process.session.capabilities.supportsDelayedStackTraceLoading) {
                    // To reduce flashing of the call stack view simply append the stale call stack
                    // once we have the correct data the tree will refresh and we will no longer display it.
                    callStack = callStack.concat(thread.getStaleCallStack().slice(1));
                }
                if (thread.stoppedDetails && thread.stoppedDetails.framesErrorMessage) {
                    callStack = callStack.concat([thread.stoppedDetails.framesErrorMessage]);
                }
                if (thread.stoppedDetails && thread.stoppedDetails.totalFrames > callStack.length && callStack.length > 1) {
                    callStack = callStack.concat([new debugModel_1.ThreadAndProcessIds(thread.process.getId(), thread.threadId)]);
                }
                return callStack;
            });
        };
        CallStackDataSource.prototype.getParent = function (tree, element) {
            return winjs_base_1.TPromise.as(null);
        };
        return CallStackDataSource;
    }());
    var CallStackRenderer = /** @class */ (function () {
        function CallStackRenderer(contextService, environmentService) {
            this.contextService = contextService;
            this.environmentService = environmentService;
            // noop
        }
        CallStackRenderer.prototype.getHeight = function (tree, element) {
            return 22;
        };
        CallStackRenderer.prototype.getTemplateId = function (tree, element) {
            if (element instanceof debugModel_1.Process) {
                return CallStackRenderer.PROCESS_TEMPLATE_ID;
            }
            if (element instanceof debugModel_1.Thread) {
                return CallStackRenderer.THREAD_TEMPLATE_ID;
            }
            if (element instanceof debugModel_1.StackFrame) {
                return CallStackRenderer.STACK_FRAME_TEMPLATE_ID;
            }
            if (typeof element === 'string') {
                return CallStackRenderer.ERROR_TEMPLATE_ID;
            }
            return CallStackRenderer.LOAD_MORE_TEMPLATE_ID;
        };
        CallStackRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            if (templateId === CallStackRenderer.PROCESS_TEMPLATE_ID) {
                var data_1 = Object.create(null);
                data_1.process = dom.append(container, $('.process'));
                data_1.name = dom.append(data_1.process, $('.name'));
                data_1.state = dom.append(data_1.process, $('.state'));
                data_1.stateLabel = dom.append(data_1.state, $('span.label'));
                return data_1;
            }
            if (templateId === CallStackRenderer.LOAD_MORE_TEMPLATE_ID) {
                var data_2 = Object.create(null);
                data_2.label = dom.append(container, $('.load-more'));
                return data_2;
            }
            if (templateId === CallStackRenderer.ERROR_TEMPLATE_ID) {
                var data_3 = Object.create(null);
                data_3.label = dom.append(container, $('.error'));
                return data_3;
            }
            if (templateId === CallStackRenderer.THREAD_TEMPLATE_ID) {
                var data_4 = Object.create(null);
                data_4.thread = dom.append(container, $('.thread'));
                data_4.name = dom.append(data_4.thread, $('.name'));
                data_4.state = dom.append(data_4.thread, $('.state'));
                data_4.stateLabel = dom.append(data_4.state, $('span.label'));
                return data_4;
            }
            var data = Object.create(null);
            data.stackFrame = dom.append(container, $('.stack-frame'));
            data.label = dom.append(data.stackFrame, $('span.label.expression'));
            data.file = dom.append(data.stackFrame, $('.file'));
            data.fileName = dom.append(data.file, $('span.file-name'));
            var wrapper = dom.append(data.file, $('span.line-number-wrapper'));
            data.lineNumber = dom.append(wrapper, $('span.line-number'));
            return data;
        };
        CallStackRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (templateId === CallStackRenderer.PROCESS_TEMPLATE_ID) {
                this.renderProcess(element, templateData);
            }
            else if (templateId === CallStackRenderer.THREAD_TEMPLATE_ID) {
                this.renderThread(element, templateData);
            }
            else if (templateId === CallStackRenderer.STACK_FRAME_TEMPLATE_ID) {
                this.renderStackFrame(element, templateData);
            }
            else if (templateId === CallStackRenderer.ERROR_TEMPLATE_ID) {
                this.renderError(element, templateData);
            }
            else if (templateId === CallStackRenderer.LOAD_MORE_TEMPLATE_ID) {
                this.renderLoadMore(element, templateData);
            }
        };
        CallStackRenderer.prototype.renderProcess = function (process, data) {
            data.process.title = nls.localize({ key: 'process', comment: ['Process is a noun'] }, "Process");
            data.name.textContent = process.getName(this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE);
            var stoppedThread = process.getAllThreads().filter(function (t) { return t.stopped; }).pop();
            data.stateLabel.textContent = stoppedThread ? nls.localize('paused', "Paused")
                : nls.localize({ key: 'running', comment: ['indicates state'] }, "Running");
        };
        CallStackRenderer.prototype.renderThread = function (thread, data) {
            data.thread.title = nls.localize('thread', "Thread");
            data.name.textContent = thread.name;
            if (thread.stopped) {
                data.stateLabel.textContent = thread.stoppedDetails.description ||
                    thread.stoppedDetails.reason ? nls.localize({ key: 'pausedOn', comment: ['indicates reason for program being paused'] }, "Paused on {0}", thread.stoppedDetails.reason) : nls.localize('paused', "Paused");
            }
            else {
                data.stateLabel.textContent = nls.localize({ key: 'running', comment: ['indicates state'] }, "Running");
            }
        };
        CallStackRenderer.prototype.renderError = function (element, data) {
            data.label.textContent = element;
            data.label.title = element;
        };
        CallStackRenderer.prototype.renderLoadMore = function (element, data) {
            data.label.textContent = nls.localize('loadMoreStackFrames', "Load More Stack Frames");
        };
        CallStackRenderer.prototype.renderStackFrame = function (stackFrame, data) {
            dom.toggleClass(data.stackFrame, 'disabled', !stackFrame.source.available || stackFrame.source.presentationHint === 'deemphasize');
            dom.toggleClass(data.stackFrame, 'label', stackFrame.presentationHint === 'label');
            dom.toggleClass(data.stackFrame, 'subtle', stackFrame.presentationHint === 'subtle');
            data.file.title = stackFrame.source.raw.path || stackFrame.source.name;
            if (stackFrame.source.raw.origin) {
                data.file.title += "\n" + stackFrame.source.raw.origin;
            }
            data.label.textContent = stackFrame.name;
            data.label.title = stackFrame.name;
            data.fileName.textContent = getSourceName(stackFrame.source, this.contextService, this.environmentService);
            if (stackFrame.range.startLineNumber !== undefined) {
                data.lineNumber.textContent = "" + stackFrame.range.startLineNumber;
                if (stackFrame.range.startColumn) {
                    data.lineNumber.textContent += ":" + stackFrame.range.startColumn;
                }
                dom.removeClass(data.lineNumber, 'unavailable');
            }
            else {
                dom.addClass(data.lineNumber, 'unavailable');
            }
        };
        CallStackRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            // noop
        };
        CallStackRenderer.THREAD_TEMPLATE_ID = 'thread';
        CallStackRenderer.STACK_FRAME_TEMPLATE_ID = 'stackFrame';
        CallStackRenderer.ERROR_TEMPLATE_ID = 'error';
        CallStackRenderer.LOAD_MORE_TEMPLATE_ID = 'loadMore';
        CallStackRenderer.PROCESS_TEMPLATE_ID = 'process';
        CallStackRenderer = __decorate([
            __param(0, workspace_1.IWorkspaceContextService),
            __param(1, environment_1.IEnvironmentService)
        ], CallStackRenderer);
        return CallStackRenderer;
    }());
    var CallstackAccessibilityProvider = /** @class */ (function () {
        function CallstackAccessibilityProvider(contextService) {
            this.contextService = contextService;
            // noop
        }
        CallstackAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (element instanceof debugModel_1.Thread) {
                return nls.localize('threadAriaLabel', "Thread {0}, callstack, debug", element.name);
            }
            if (element instanceof debugModel_1.StackFrame) {
                return nls.localize('stackFrameAriaLabel', "Stack Frame {0} line {1} {2}, callstack, debug", element.name, element.range.startLineNumber, getSourceName(element.source, this.contextService));
            }
            return null;
        };
        CallstackAccessibilityProvider = __decorate([
            __param(0, workspace_1.IWorkspaceContextService)
        ], CallstackAccessibilityProvider);
        return CallstackAccessibilityProvider;
    }());
    function getSourceName(source, contextService, environmentService) {
        if (source.name) {
            return source.name;
        }
        return resources_1.basenameOrAuthority(source.uri);
    }
});
