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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/parts/tree/browser/tree", "vs/workbench/browser/viewlet", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/common/debugModel", "vs/workbench/parts/debug/browser/debugActions", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/workbench/parts/debug/electron-browser/electronDebugActions", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/strings", "vs/base/parts/tree/browser/treeDefaults", "vs/workbench/parts/debug/browser/baseDebugView", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration"], function (require, exports, nls, async_1, dom, lifecycle_1, winjs_base_1, errors, tree_1, viewlet_1, viewsViewlet_1, debug_1, debugModel_1, debugActions_1, contextView_1, instantiation_1, actions_1, keybinding_1, themeService_1, electronDebugActions_1, actionbar_1, strings_1, treeDefaults_1, baseDebugView_1, listService_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
    var WatchExpressionsView = /** @class */ (function (_super) {
        __extends(WatchExpressionsView, _super);
        function WatchExpressionsView(options, contextMenuService, debugService, keybindingService, instantiationService, configurationService) {
            var _this = _super.call(this, __assign({}, options, { ariaHeaderLabel: nls.localize('expressionsSection', "Expressions Section") }), keybindingService, contextMenuService, configurationService) || this;
            _this.debugService = debugService;
            _this.instantiationService = instantiationService;
            _this.settings = options.viewletSettings;
            _this.onWatchExpressionsUpdatedScheduler = new async_1.RunOnceScheduler(function () {
                _this.needsRefresh = false;
                _this.tree.refresh().done(undefined, errors.onUnexpectedError);
            }, 50);
            return _this;
        }
        WatchExpressionsView.prototype.renderBody = function (container) {
            var _this = this;
            dom.addClass(container, 'debug-watch');
            this.treeContainer = baseDebugView_1.renderViewTree(container);
            var actionProvider = new WatchExpressionsActionProvider(this.debugService, this.keybindingService);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchTree, this.treeContainer, {
                dataSource: new WatchExpressionsDataSource(this.debugService),
                renderer: this.instantiationService.createInstance(WatchExpressionsRenderer),
                accessibilityProvider: new WatchExpressionsAccessibilityProvider(),
                controller: this.instantiationService.createInstance(WatchExpressionsController, actionProvider, actions_1.MenuId.DebugWatchContext, { clickBehavior: treeDefaults_1.ClickBehavior.ON_MOUSE_UP /* do not change to not break DND */, openMode: treeDefaults_1.OpenMode.SINGLE_CLICK }),
                dnd: new WatchExpressionsDragAndDrop(this.debugService)
            }, {
                ariaLabel: nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'watchAriaTreeLabel' }, "Debug Watch Expressions"),
                twistiePixels: baseDebugView_1.twistiePixels
            });
            debug_1.CONTEXT_WATCH_EXPRESSIONS_FOCUSED.bindTo(this.tree.contextKeyService);
            this.tree.setInput(this.debugService.getModel());
            var addWatchExpressionAction = new debugActions_1.AddWatchExpressionAction(debugActions_1.AddWatchExpressionAction.ID, debugActions_1.AddWatchExpressionAction.LABEL, this.debugService, this.keybindingService);
            var collapseAction = new viewlet_1.CollapseAction(this.tree, true, 'explorer-action collapse-explorer');
            var removeAllWatchExpressionsAction = new debugActions_1.RemoveAllWatchExpressionsAction(debugActions_1.RemoveAllWatchExpressionsAction.ID, debugActions_1.RemoveAllWatchExpressionsAction.LABEL, this.debugService, this.keybindingService);
            this.toolbar.setActions([addWatchExpressionAction, collapseAction, removeAllWatchExpressionsAction])();
            this.disposables.push(this.debugService.getModel().onDidChangeWatchExpressions(function (we) {
                if (!_this.isExpanded() || !_this.isVisible()) {
                    _this.needsRefresh = true;
                    return;
                }
                _this.tree.refresh().done(function () {
                    return we instanceof debugModel_1.Expression ? _this.tree.reveal(we) : winjs_base_1.TPromise.as(true);
                }, errors.onUnexpectedError);
            }));
            this.disposables.push(this.debugService.getViewModel().onDidFocusStackFrame(function () {
                if (!_this.isExpanded() || !_this.isVisible()) {
                    _this.needsRefresh = true;
                    return;
                }
                if (!_this.onWatchExpressionsUpdatedScheduler.isScheduled()) {
                    _this.onWatchExpressionsUpdatedScheduler.schedule();
                }
            }));
            this.disposables.push(this.debugService.getViewModel().onDidSelectExpression(function (expression) {
                if (expression instanceof debugModel_1.Expression) {
                    _this.tree.refresh(expression, false).done(null, errors.onUnexpectedError);
                }
            }));
        };
        WatchExpressionsView.prototype.layoutBody = function (size) {
            if (this.treeContainer) {
                this.treeContainer.style.height = size + 'px';
            }
            _super.prototype.layoutBody.call(this, size);
        };
        WatchExpressionsView.prototype.setExpanded = function (expanded) {
            _super.prototype.setExpanded.call(this, expanded);
            if (expanded && this.needsRefresh) {
                this.onWatchExpressionsUpdatedScheduler.schedule();
            }
        };
        WatchExpressionsView.prototype.setVisible = function (visible) {
            var _this = this;
            return _super.prototype.setVisible.call(this, visible).then(function () {
                if (visible && _this.needsRefresh) {
                    _this.onWatchExpressionsUpdatedScheduler.schedule();
                }
            });
        };
        WatchExpressionsView.prototype.shutdown = function () {
            this.settings[WatchExpressionsView.MEMENTO] = !this.isExpanded();
            _super.prototype.shutdown.call(this);
        };
        WatchExpressionsView.MEMENTO = 'watchexpressionsview.memento';
        WatchExpressionsView = __decorate([
            __param(1, contextView_1.IContextMenuService),
            __param(2, debug_1.IDebugService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, configuration_1.IConfigurationService)
        ], WatchExpressionsView);
        return WatchExpressionsView;
    }(viewsViewlet_1.TreeViewsViewletPanel));
    exports.WatchExpressionsView = WatchExpressionsView;
    var WatchExpressionsActionProvider = /** @class */ (function () {
        function WatchExpressionsActionProvider(debugService, keybindingService) {
            this.debugService = debugService;
            this.keybindingService = keybindingService;
            // noop
        }
        WatchExpressionsActionProvider.prototype.hasActions = function (tree, element) {
            return element instanceof debugModel_1.Expression && !!element.name;
        };
        WatchExpressionsActionProvider.prototype.hasSecondaryActions = function (tree, element) {
            return true;
        };
        WatchExpressionsActionProvider.prototype.getActions = function (tree, element) {
            return winjs_base_1.TPromise.as([]);
        };
        WatchExpressionsActionProvider.prototype.getSecondaryActions = function (tree, element) {
            var actions = [];
            if (element instanceof debugModel_1.Expression) {
                var expression = element;
                actions.push(new debugActions_1.AddWatchExpressionAction(debugActions_1.AddWatchExpressionAction.ID, debugActions_1.AddWatchExpressionAction.LABEL, this.debugService, this.keybindingService));
                actions.push(new debugActions_1.EditWatchExpressionAction(debugActions_1.EditWatchExpressionAction.ID, debugActions_1.EditWatchExpressionAction.LABEL, this.debugService, this.keybindingService));
                if (!expression.hasChildren) {
                    actions.push(new electronDebugActions_1.CopyValueAction(electronDebugActions_1.CopyValueAction.ID, electronDebugActions_1.CopyValueAction.LABEL, expression.value, this.debugService));
                }
                actions.push(new actionbar_1.Separator());
                actions.push(new debugActions_1.RemoveWatchExpressionAction(debugActions_1.RemoveWatchExpressionAction.ID, debugActions_1.RemoveWatchExpressionAction.LABEL, this.debugService, this.keybindingService));
                actions.push(new debugActions_1.RemoveAllWatchExpressionsAction(debugActions_1.RemoveAllWatchExpressionsAction.ID, debugActions_1.RemoveAllWatchExpressionsAction.LABEL, this.debugService, this.keybindingService));
            }
            else {
                actions.push(new debugActions_1.AddWatchExpressionAction(debugActions_1.AddWatchExpressionAction.ID, debugActions_1.AddWatchExpressionAction.LABEL, this.debugService, this.keybindingService));
                if (element instanceof debugModel_1.Variable) {
                    var variable = element;
                    if (!variable.hasChildren) {
                        actions.push(new electronDebugActions_1.CopyValueAction(electronDebugActions_1.CopyValueAction.ID, electronDebugActions_1.CopyValueAction.LABEL, variable.value, this.debugService));
                    }
                    actions.push(new actionbar_1.Separator());
                }
                actions.push(new debugActions_1.RemoveAllWatchExpressionsAction(debugActions_1.RemoveAllWatchExpressionsAction.ID, debugActions_1.RemoveAllWatchExpressionsAction.LABEL, this.debugService, this.keybindingService));
            }
            return winjs_base_1.TPromise.as(actions);
        };
        WatchExpressionsActionProvider.prototype.getActionItem = function (tree, element, action) {
            return null;
        };
        return WatchExpressionsActionProvider;
    }());
    var WatchExpressionsDataSource = /** @class */ (function () {
        function WatchExpressionsDataSource(debugService) {
            this.debugService = debugService;
            // noop
        }
        WatchExpressionsDataSource.prototype.getId = function (tree, element) {
            return element.getId();
        };
        WatchExpressionsDataSource.prototype.hasChildren = function (tree, element) {
            if (element instanceof debugModel_1.Model) {
                return true;
            }
            var watchExpression = element;
            return watchExpression.hasChildren && !strings_1.equalsIgnoreCase(watchExpression.value, 'null');
        };
        WatchExpressionsDataSource.prototype.getChildren = function (tree, element) {
            if (element instanceof debugModel_1.Model) {
                var viewModel_1 = this.debugService.getViewModel();
                return winjs_base_1.TPromise.join(element.getWatchExpressions().map(function (we) {
                    return we.name ? we.evaluate(viewModel_1.focusedProcess, viewModel_1.focusedStackFrame, 'watch').then(function () { return we; }) : winjs_base_1.TPromise.as(we);
                }));
            }
            var expression = element;
            return expression.getChildren();
        };
        WatchExpressionsDataSource.prototype.getParent = function (tree, element) {
            return winjs_base_1.TPromise.as(null);
        };
        return WatchExpressionsDataSource;
    }());
    var WatchExpressionsRenderer = /** @class */ (function () {
        function WatchExpressionsRenderer(debugService, contextViewService, themeService) {
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.themeService = themeService;
            this.toDispose = [];
        }
        WatchExpressionsRenderer.prototype.getHeight = function (tree, element) {
            return 22;
        };
        WatchExpressionsRenderer.prototype.getTemplateId = function (tree, element) {
            if (element instanceof debugModel_1.Expression) {
                return WatchExpressionsRenderer.WATCH_EXPRESSION_TEMPLATE_ID;
            }
            return WatchExpressionsRenderer.VARIABLE_TEMPLATE_ID;
        };
        WatchExpressionsRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            var createVariableTemplate = (function (data, container) {
                data.expression = dom.append(container, $('.expression'));
                data.name = dom.append(data.expression, $('span.name'));
                data.value = dom.append(data.expression, $('span.value'));
            });
            if (templateId === WatchExpressionsRenderer.WATCH_EXPRESSION_TEMPLATE_ID) {
                var data_1 = Object.create(null);
                data_1.watchExpression = dom.append(container, $('.watch-expression'));
                createVariableTemplate(data_1, data_1.watchExpression);
                return data_1;
            }
            var data = Object.create(null);
            createVariableTemplate(data, container);
            return data;
        };
        WatchExpressionsRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (templateId === WatchExpressionsRenderer.WATCH_EXPRESSION_TEMPLATE_ID) {
                this.renderWatchExpression(tree, element, templateData);
            }
            else {
                baseDebugView_1.renderVariable(tree, element, templateData, true);
            }
        };
        WatchExpressionsRenderer.prototype.renderWatchExpression = function (tree, watchExpression, data) {
            var selectedExpression = this.debugService.getViewModel().getSelectedExpression();
            if ((selectedExpression instanceof debugModel_1.Expression && selectedExpression.getId() === watchExpression.getId())) {
                baseDebugView_1.renderRenameBox(this.debugService, this.contextViewService, this.themeService, tree, watchExpression, data.expression, {
                    initialValue: watchExpression.name,
                    placeholder: nls.localize('watchExpressionPlaceholder', "Expression to watch"),
                    ariaLabel: nls.localize('watchExpressionInputAriaLabel', "Type watch expression")
                });
            }
            data.name.textContent = watchExpression.name;
            if (watchExpression.value) {
                data.name.textContent += ':';
                baseDebugView_1.renderExpressionValue(watchExpression, data.value, {
                    showChanged: true,
                    maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
                    preserveWhitespace: false,
                    showHover: true,
                    colorize: true
                });
                data.name.title = watchExpression.type ? watchExpression.type : watchExpression.value;
            }
        };
        WatchExpressionsRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            // noop
        };
        WatchExpressionsRenderer.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        WatchExpressionsRenderer.WATCH_EXPRESSION_TEMPLATE_ID = 'watchExpression';
        WatchExpressionsRenderer.VARIABLE_TEMPLATE_ID = 'variables';
        WatchExpressionsRenderer = __decorate([
            __param(0, debug_1.IDebugService),
            __param(1, contextView_1.IContextViewService),
            __param(2, themeService_1.IThemeService)
        ], WatchExpressionsRenderer);
        return WatchExpressionsRenderer;
    }());
    var WatchExpressionsAccessibilityProvider = /** @class */ (function () {
        function WatchExpressionsAccessibilityProvider() {
        }
        WatchExpressionsAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (element instanceof debugModel_1.Expression) {
                return nls.localize('watchExpressionAriaLabel', "{0} value {1}, watch, debug", element.name, element.value);
            }
            if (element instanceof debugModel_1.Variable) {
                return nls.localize('watchVariableAriaLabel', "{0} value {1}, watch, debug", element.name, element.value);
            }
            return null;
        };
        return WatchExpressionsAccessibilityProvider;
    }());
    var WatchExpressionsController = /** @class */ (function (_super) {
        __extends(WatchExpressionsController, _super);
        function WatchExpressionsController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WatchExpressionsController.prototype.onLeftClick = function (tree, element, event) {
            // double click on primitive value: open input box to be able to select and copy value.
            if (element instanceof debugModel_1.Expression && event.detail === 2) {
                var expression = element;
                this.debugService.getViewModel().setSelectedExpression(expression);
                return true;
            }
            else if (element instanceof debugModel_1.Model && event.detail === 2) {
                // Double click in watch panel triggers to add a new watch expression
                this.debugService.addWatchExpression();
                return true;
            }
            return _super.prototype.onLeftClick.call(this, tree, element, event);
        };
        return WatchExpressionsController;
    }(baseDebugView_1.BaseDebugController));
    var WatchExpressionsDragAndDrop = /** @class */ (function (_super) {
        __extends(WatchExpressionsDragAndDrop, _super);
        function WatchExpressionsDragAndDrop(debugService) {
            var _this = _super.call(this) || this;
            _this.debugService = debugService;
            return _this;
        }
        WatchExpressionsDragAndDrop.prototype.getDragURI = function (tree, element) {
            if (!(element instanceof debugModel_1.Expression)) {
                return null;
            }
            return element.getId();
        };
        WatchExpressionsDragAndDrop.prototype.getDragLabel = function (tree, elements) {
            if (elements.length > 1) {
                return String(elements.length);
            }
            return elements[0].name;
        };
        WatchExpressionsDragAndDrop.prototype.onDragOver = function (tree, data, target, originalEvent) {
            if (target instanceof debugModel_1.Expression || target instanceof debugModel_1.Model) {
                return {
                    accept: true,
                    autoExpand: false
                };
            }
            return tree_1.DRAG_OVER_REJECT;
        };
        WatchExpressionsDragAndDrop.prototype.drop = function (tree, data, target, originalEvent) {
            var draggedData = data.getData();
            if (Array.isArray(draggedData)) {
                var draggedElement = draggedData[0];
                var watches = this.debugService.getModel().getWatchExpressions();
                var position = target instanceof debugModel_1.Model ? watches.length - 1 : watches.indexOf(target);
                this.debugService.moveWatchExpression(draggedElement.getId(), position);
            }
        };
        return WatchExpressionsDragAndDrop;
    }(treeDefaults_1.DefaultDragAndDrop));
});
