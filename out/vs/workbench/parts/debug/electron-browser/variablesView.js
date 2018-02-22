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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/errors", "vs/workbench/browser/viewlet", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/common/debugModel", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/workbench/parts/debug/browser/baseDebugView", "vs/base/common/winjs.base", "vs/workbench/parts/debug/browser/debugActions", "vs/workbench/parts/debug/electron-browser/electronDebugActions", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/parts/debug/common/debugViewModel", "vs/base/common/strings", "vs/platform/list/browser/listService", "vs/base/parts/tree/browser/treeDefaults", "vs/platform/configuration/common/configuration"], function (require, exports, nls, async_1, dom, errors, viewlet_1, viewsViewlet_1, debug_1, debugModel_1, contextView_1, instantiation_1, actions_1, keybinding_1, themeService_1, baseDebugView_1, winjs_base_1, debugActions_1, electronDebugActions_1, actionbar_1, debugViewModel_1, strings_1, listService_1, treeDefaults_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var VariablesView = /** @class */ (function (_super) {
        __extends(VariablesView, _super);
        function VariablesView(options, contextMenuService, debugService, keybindingService, instantiationService, configurationService) {
            var _this = _super.call(this, __assign({}, options, { ariaHeaderLabel: nls.localize('variablesSection', "Variables Section") }), keybindingService, contextMenuService, configurationService) || this;
            _this.debugService = debugService;
            _this.instantiationService = instantiationService;
            _this.settings = options.viewletSettings;
            _this.expandedElements = [];
            // Use scheduler to prevent unnecessary flashing
            _this.onFocusStackFrameScheduler = new async_1.RunOnceScheduler(function () {
                // Remember expanded elements when there are some (otherwise don't override/erase the previous ones)
                var expanded = _this.tree.getExpandedElements();
                if (expanded.length > 0) {
                    _this.expandedElements = expanded;
                }
                _this.needsRefresh = false;
                _this.tree.refresh().then(function () {
                    var stackFrame = _this.debugService.getViewModel().focusedStackFrame;
                    return async_1.sequence(_this.expandedElements.map(function (e) { return function () { return _this.tree.expand(e); }; })).then(function () {
                        // If there is no preserved expansion state simply expand the first scope
                        if (stackFrame && _this.tree.getExpandedElements().length === 0) {
                            return stackFrame.getScopes().then(function (scopes) {
                                if (scopes.length > 0 && !scopes[0].expensive) {
                                    return _this.tree.expand(scopes[0]);
                                }
                                return undefined;
                            });
                        }
                        return undefined;
                    });
                }).done(null, errors.onUnexpectedError);
            }, 400);
            return _this;
        }
        VariablesView.prototype.renderBody = function (container) {
            var _this = this;
            dom.addClass(container, 'debug-variables');
            this.treeContainer = baseDebugView_1.renderViewTree(container);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchTree, this.treeContainer, {
                dataSource: new VariablesDataSource(),
                renderer: this.instantiationService.createInstance(VariablesRenderer),
                accessibilityProvider: new VariablesAccessibilityProvider(),
                controller: this.instantiationService.createInstance(VariablesController, new VariablesActionProvider(this.debugService, this.keybindingService), actions_1.MenuId.DebugVariablesContext, { openMode: treeDefaults_1.OpenMode.SINGLE_CLICK })
            }, {
                ariaLabel: nls.localize('variablesAriaTreeLabel', "Debug Variables"),
                twistiePixels: baseDebugView_1.twistiePixels
            });
            debug_1.CONTEXT_VARIABLES_FOCUSED.bindTo(this.tree.contextKeyService);
            var viewModel = this.debugService.getViewModel();
            this.tree.setInput(viewModel);
            var collapseAction = new viewlet_1.CollapseAction(this.tree, false, 'explorer-action collapse-explorer');
            this.toolbar.setActions([collapseAction])();
            this.disposables.push(viewModel.onDidFocusStackFrame(function (sf) {
                if (!_this.isVisible() || !_this.isExpanded()) {
                    _this.needsRefresh = true;
                    return;
                }
                // Refresh the tree immediately if it is not visible.
                // Otherwise postpone the refresh until user stops stepping.
                if (!_this.tree.getContentHeight() || sf.explicit) {
                    _this.onFocusStackFrameScheduler.schedule(0);
                }
                else {
                    _this.onFocusStackFrameScheduler.schedule();
                }
            }));
            this.disposables.push(this.debugService.onDidChangeState(function (state) {
                collapseAction.enabled = state === debug_1.State.Running || state === debug_1.State.Stopped;
            }));
            this.disposables.push(this.debugService.getViewModel().onDidSelectExpression(function (expression) {
                if (expression instanceof debugModel_1.Variable) {
                    _this.tree.refresh(expression, false).done(null, errors.onUnexpectedError);
                }
            }));
        };
        VariablesView.prototype.layoutBody = function (size) {
            if (this.treeContainer) {
                this.treeContainer.style.height = size + 'px';
            }
            _super.prototype.layoutBody.call(this, size);
        };
        VariablesView.prototype.setExpanded = function (expanded) {
            _super.prototype.setExpanded.call(this, expanded);
            if (expanded && this.needsRefresh) {
                this.onFocusStackFrameScheduler.schedule();
            }
        };
        VariablesView.prototype.setVisible = function (visible) {
            var _this = this;
            return _super.prototype.setVisible.call(this, visible).then(function () {
                if (visible && _this.needsRefresh) {
                    _this.onFocusStackFrameScheduler.schedule();
                }
            });
        };
        VariablesView.prototype.shutdown = function () {
            this.settings[VariablesView.MEMENTO] = !this.isExpanded();
            _super.prototype.shutdown.call(this);
        };
        VariablesView.MEMENTO = 'variablesview.memento';
        VariablesView = __decorate([
            __param(1, contextView_1.IContextMenuService),
            __param(2, debug_1.IDebugService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, configuration_1.IConfigurationService)
        ], VariablesView);
        return VariablesView;
    }(viewsViewlet_1.TreeViewsViewletPanel));
    exports.VariablesView = VariablesView;
    var VariablesActionProvider = /** @class */ (function () {
        function VariablesActionProvider(debugService, keybindingService) {
            this.debugService = debugService;
            this.keybindingService = keybindingService;
            // noop
        }
        VariablesActionProvider.prototype.hasActions = function (tree, element) {
            return false;
        };
        VariablesActionProvider.prototype.getActions = function (tree, element) {
            return winjs_base_1.TPromise.as([]);
        };
        VariablesActionProvider.prototype.hasSecondaryActions = function (tree, element) {
            // Only show context menu on "real" variables. Not on array chunk nodes.
            return element instanceof debugModel_1.Variable && !!element.value;
        };
        VariablesActionProvider.prototype.getSecondaryActions = function (tree, element) {
            var actions = [];
            var variable = element;
            actions.push(new debugActions_1.SetValueAction(debugActions_1.SetValueAction.ID, debugActions_1.SetValueAction.LABEL, variable, this.debugService, this.keybindingService));
            actions.push(new electronDebugActions_1.CopyValueAction(electronDebugActions_1.CopyValueAction.ID, electronDebugActions_1.CopyValueAction.LABEL, variable, this.debugService));
            actions.push(new electronDebugActions_1.CopyEvaluatePathAction(electronDebugActions_1.CopyEvaluatePathAction.ID, electronDebugActions_1.CopyEvaluatePathAction.LABEL, variable));
            actions.push(new actionbar_1.Separator());
            actions.push(new debugActions_1.AddToWatchExpressionsAction(debugActions_1.AddToWatchExpressionsAction.ID, debugActions_1.AddToWatchExpressionsAction.LABEL, variable, this.debugService, this.keybindingService));
            return winjs_base_1.TPromise.as(actions);
        };
        VariablesActionProvider.prototype.getActionItem = function (tree, element, action) {
            return null;
        };
        return VariablesActionProvider;
    }());
    var VariablesDataSource = /** @class */ (function () {
        function VariablesDataSource() {
        }
        VariablesDataSource.prototype.getId = function (tree, element) {
            return element.getId();
        };
        VariablesDataSource.prototype.hasChildren = function (tree, element) {
            if (element instanceof debugViewModel_1.ViewModel || element instanceof debugModel_1.Scope) {
                return true;
            }
            var variable = element;
            return variable.hasChildren && !strings_1.equalsIgnoreCase(variable.value, 'null');
        };
        VariablesDataSource.prototype.getChildren = function (tree, element) {
            if (element instanceof debugViewModel_1.ViewModel) {
                var focusedStackFrame = element.focusedStackFrame;
                return focusedStackFrame ? focusedStackFrame.getScopes() : winjs_base_1.TPromise.as([]);
            }
            var scope = element;
            return scope.getChildren();
        };
        VariablesDataSource.prototype.getParent = function (tree, element) {
            return winjs_base_1.TPromise.as(null);
        };
        return VariablesDataSource;
    }());
    exports.VariablesDataSource = VariablesDataSource;
    var VariablesRenderer = /** @class */ (function () {
        function VariablesRenderer(debugService, contextViewService, themeService) {
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.themeService = themeService;
            // noop
        }
        VariablesRenderer.prototype.getHeight = function (tree, element) {
            return 22;
        };
        VariablesRenderer.prototype.getTemplateId = function (tree, element) {
            if (element instanceof debugModel_1.Scope) {
                return VariablesRenderer.SCOPE_TEMPLATE_ID;
            }
            if (element instanceof debugModel_1.Variable) {
                return VariablesRenderer.VARIABLE_TEMPLATE_ID;
            }
            return null;
        };
        VariablesRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            if (templateId === VariablesRenderer.SCOPE_TEMPLATE_ID) {
                var data_1 = Object.create(null);
                data_1.name = dom.append(container, $('.scope'));
                return data_1;
            }
            var data = Object.create(null);
            data.expression = dom.append(container, $('.expression'));
            data.name = dom.append(data.expression, $('span.name'));
            data.value = dom.append(data.expression, $('span.value'));
            return data;
        };
        VariablesRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (templateId === VariablesRenderer.SCOPE_TEMPLATE_ID) {
                this.renderScope(element, templateData);
            }
            else {
                var variable_1 = element;
                if (variable_1 === this.debugService.getViewModel().getSelectedExpression() || variable_1.errorMessage) {
                    baseDebugView_1.renderRenameBox(this.debugService, this.contextViewService, this.themeService, tree, variable_1, templateData.expression, {
                        initialValue: variable_1.value,
                        ariaLabel: nls.localize('variableValueAriaLabel', "Type new variable value"),
                        validationOptions: {
                            validation: function (value) { return variable_1.errorMessage ? ({ content: variable_1.errorMessage }) : null; }
                        }
                    });
                }
                else {
                    baseDebugView_1.renderVariable(tree, variable_1, templateData, true);
                }
            }
        };
        VariablesRenderer.prototype.renderScope = function (scope, data) {
            data.name.textContent = scope.name;
        };
        VariablesRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            // noop
        };
        VariablesRenderer.SCOPE_TEMPLATE_ID = 'scope';
        VariablesRenderer.VARIABLE_TEMPLATE_ID = 'variable';
        VariablesRenderer = __decorate([
            __param(0, debug_1.IDebugService),
            __param(1, contextView_1.IContextViewService),
            __param(2, themeService_1.IThemeService)
        ], VariablesRenderer);
        return VariablesRenderer;
    }());
    exports.VariablesRenderer = VariablesRenderer;
    var VariablesAccessibilityProvider = /** @class */ (function () {
        function VariablesAccessibilityProvider() {
        }
        VariablesAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (element instanceof debugModel_1.Scope) {
                return nls.localize('variableScopeAriaLabel', "Scope {0}, variables, debug", element.name);
            }
            if (element instanceof debugModel_1.Variable) {
                return nls.localize('variableAriaLabel', "{0} value {1}, variables, debug", element.name, element.value);
            }
            return null;
        };
        return VariablesAccessibilityProvider;
    }());
    var VariablesController = /** @class */ (function (_super) {
        __extends(VariablesController, _super);
        function VariablesController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        VariablesController.prototype.onLeftClick = function (tree, element, event) {
            // double click on primitive value: open input box to be able to set the value
            var process = this.debugService.getViewModel().focusedProcess;
            if (element instanceof debugModel_1.Variable && event.detail === 2 && process && process.session.capabilities.supportsSetVariable) {
                var expression = element;
                this.debugService.getViewModel().setSelectedExpression(expression);
                return true;
            }
            return _super.prototype.onLeftClick.call(this, tree, element, event);
        };
        return VariablesController;
    }(baseDebugView_1.BaseDebugController));
});
