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
define(["require", "exports", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/base/common/winjs.base", "vs/base/browser/dom", "vs/base/browser/builder", "vs/platform/theme/common/themeService", "vs/workbench/common/views", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/extensions/common/extensions", "vs/platform/progress/common/progress", "vs/workbench/browser/labels", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/uri", "vs/base/common/paths", "vs/platform/contextview/browser/contextView", "vs/platform/list/browser/listService", "vs/platform/keybinding/common/keybinding", "vs/platform/configuration/common/configuration", "vs/base/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuItemActionItem", "vs/platform/files/common/files", "vs/platform/commands/common/commands", "vs/workbench/browser/parts/views/viewsViewlet", "vs/css!./media/views"], function (require, exports, event_1, errors, lifecycle_1, instantiation_1, winjs_base_1, DOM, builder_1, themeService_1, views_1, workbenchThemeService_1, extensions_1, progress_1, labels_1, actionbar_1, uri_1, paths_1, contextView_1, listService_1, keybinding_1, configuration_1, actions_1, contextkey_1, actions_2, menuItemActionItem_1, files_1, commands_1, viewsViewlet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CustomViewsService = /** @class */ (function (_super) {
        __extends(CustomViewsService, _super);
        function CustomViewsService(instantiationService) {
            var _this = _super.call(this) || this;
            _this.instantiationService = instantiationService;
            _this.viewers = new Map();
            _this.createViewers(views_1.ViewsRegistry.getAllViews());
            _this._register(views_1.ViewsRegistry.onViewsRegistered(function (viewDescriptors) { return _this.createViewers(viewDescriptors); }));
            _this._register(views_1.ViewsRegistry.onViewsDeregistered(function (viewDescriptors) { return _this.removeViewers(viewDescriptors); }));
            return _this;
        }
        CustomViewsService.prototype.getTreeViewer = function (id) {
            return this.viewers.get(id);
        };
        CustomViewsService.prototype.createViewers = function (viewDescriptors) {
            for (var _i = 0, viewDescriptors_1 = viewDescriptors; _i < viewDescriptors_1.length; _i++) {
                var viewDescriptor = viewDescriptors_1[_i];
                if (viewDescriptor.treeView) {
                    this.viewers.set(viewDescriptor.id, this.instantiationService.createInstance(CustomTreeViewer, viewDescriptor.id));
                }
            }
        };
        CustomViewsService.prototype.removeViewers = function (viewDescriptors) {
            for (var _i = 0, viewDescriptors_2 = viewDescriptors; _i < viewDescriptors_2.length; _i++) {
                var id = viewDescriptors_2[_i].id;
                var viewer = this.getTreeViewer(id);
                if (viewer) {
                    viewer.dispose();
                    this.viewers.delete(id);
                }
            }
        };
        CustomViewsService = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], CustomViewsService);
        return CustomViewsService;
    }(lifecycle_1.Disposable));
    exports.CustomViewsService = CustomViewsService;
    var Root = /** @class */ (function () {
        function Root() {
            this.label = 'root';
            this.handle = '0';
            this.parentHandle = null;
            this.collapsibleState = views_1.TreeItemCollapsibleState.Expanded;
            this.children = void 0;
        }
        return Root;
    }());
    var CustomTreeViewer = /** @class */ (function (_super) {
        __extends(CustomTreeViewer, _super);
        function CustomTreeViewer(id, extensionService, themeService, instantiationService, commandService) {
            var _this = _super.call(this) || this;
            _this.id = id;
            _this.extensionService = extensionService;
            _this.themeService = themeService;
            _this.instantiationService = instantiationService;
            _this.commandService = commandService;
            _this.isVisible = false;
            _this.activated = false;
            _this._hasIconForParentNode = false;
            _this._hasIconForLeafNode = false;
            _this._onDidIconsChange = _this._register(new event_1.Emitter());
            _this.onDidIconsChange = _this._onDidIconsChange.event;
            _this.elementsToRefresh = [];
            _this.refreshing = 0;
            _this.dataProviderDisposables = [];
            _this.root = new Root();
            _this._register(_this.themeService.onDidFileIconThemeChange(function () { return _this.doRefresh([_this.root]); } /** soft refresh **/));
            _this._register(_this.themeService.onThemeChange(function () { return _this.doRefresh([_this.root]); } /** soft refresh **/));
            return _this;
        }
        Object.defineProperty(CustomTreeViewer.prototype, "dataProvider", {
            get: function () {
                return this._dataProvider;
            },
            set: function (dataProvider) {
                var _this = this;
                lifecycle_1.dispose(this.dataProviderDisposables);
                if (dataProvider) {
                    var customTreeView_1 = this;
                    this._dataProvider = new /** @class */ (function () {
                        function class_1() {
                            this.onDidChange = dataProvider.onDidChange;
                            this.onDispose = dataProvider.onDispose;
                        }
                        class_1.prototype.getChildren = function (node) {
                            if (node.children) {
                                return winjs_base_1.TPromise.as(node.children);
                            }
                            var promise = node instanceof Root ? dataProvider.getChildren() : dataProvider.getChildren(node);
                            return promise.then(function (children) {
                                node.children = children;
                                if (!customTreeView_1.refreshing) {
                                    customTreeView_1.updateIconsAvailability(node);
                                }
                                return children;
                            });
                        };
                        return class_1;
                    }());
                    this._register(dataProvider.onDidChange(function (elements) { return _this.refresh(elements); }, this, this.dataProviderDisposables));
                    this._register(dataProvider.onDispose(function () { return _this.dataProvider = null; }, this, this.dataProviderDisposables));
                }
                else {
                    this._dataProvider = null;
                }
                this.refresh();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomTreeViewer.prototype, "hasIconForParentNode", {
            get: function () {
                return this._hasIconForParentNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomTreeViewer.prototype, "hasIconForLeafNode", {
            get: function () {
                return this._hasIconForLeafNode;
            },
            enumerable: true,
            configurable: true
        });
        CustomTreeViewer.prototype.setVisibility = function (isVisible) {
            if (this.isVisible === isVisible) {
                return;
            }
            this.isVisible = isVisible;
            if (this.isVisible) {
                this.activate();
            }
            if (this.tree) {
                if (this.isVisible) {
                    builder_1.$(this.tree.getHTMLElement()).show();
                }
                else {
                    builder_1.$(this.tree.getHTMLElement()).hide(); // make sure the tree goes out of the tabindex world by hiding it
                }
                if (this.isVisible) {
                    this.tree.onVisible();
                }
                else {
                    this.tree.onHidden();
                }
                if (this.isVisible && this.elementsToRefresh.length) {
                    this.doRefresh(this.elementsToRefresh);
                    this.elementsToRefresh = [];
                }
            }
        };
        CustomTreeViewer.prototype.focus = function () {
            if (this.tree) {
                // Make sure the current selected element is revealed
                var selectedElement = this.tree.getSelection()[0];
                if (selectedElement) {
                    this.tree.reveal(selectedElement, 0.5).done(null, errors.onUnexpectedError);
                }
                // Pass Focus to Viewer
                this.tree.DOMFocus();
            }
        };
        CustomTreeViewer.prototype.show = function (container) {
            if (!this.tree) {
                this.createTree();
            }
            DOM.append(container, this.treeContainer);
        };
        CustomTreeViewer.prototype.createTree = function () {
            var _this = this;
            this.treeContainer = DOM.$('.tree-explorer-viewlet-tree-view');
            var actionItemProvider = function (action) { return action instanceof actions_2.MenuItemAction ? _this.instantiationService.createInstance(menuItemActionItem_1.ContextAwareMenuItemActionItem, action) : undefined; };
            var menus = this.instantiationService.createInstance(Menus, this.id);
            var dataSource = this.instantiationService.createInstance(TreeDataSource, this);
            var renderer = this.instantiationService.createInstance(TreeRenderer, this.id, this, menus, actionItemProvider);
            var controller = this.instantiationService.createInstance(TreeController, this.id, menus);
            this.tree = this.instantiationService.createInstance(viewsViewlet_1.FileIconThemableWorkbenchTree, this.treeContainer, { dataSource: dataSource, renderer: renderer, controller: controller }, {});
            this.tree.contextKeyService.createKey(this.id, true);
            this._register(this.tree);
            this._register(this.tree.onDidChangeSelection(function (e) { return _this.onSelection(e); }));
            this.tree.setInput(this.root);
        };
        CustomTreeViewer.prototype.layout = function (size) {
            if (this.tree) {
                this.treeContainer.style.height = size + 'px';
                this.tree.layout(size);
            }
        };
        CustomTreeViewer.prototype.getOptimalWidth = function () {
            if (this.tree) {
                var parentNode = this.tree.getHTMLElement();
                var childNodes = [].slice.call(parentNode.querySelectorAll('.outline-item-label > a'));
                return DOM.getLargestChildWidth(parentNode, childNodes);
            }
            return 0;
        };
        CustomTreeViewer.prototype.refresh = function (elements) {
            if (this.tree) {
                elements = elements || [this.root];
                for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                    var element = elements_1[_i];
                    element.children = null; // reset children
                }
                if (this.isVisible) {
                    return this.doRefresh(elements);
                }
                else {
                    (_a = this.elementsToRefresh).push.apply(_a, elements);
                }
            }
            return winjs_base_1.TPromise.as(null);
            var _a;
        };
        CustomTreeViewer.prototype.activate = function () {
            if (!this.activated) {
                this.extensionService.activateByEvent("onView:" + this.id);
                this.activated = true;
            }
        };
        CustomTreeViewer.prototype.doRefresh = function (elements) {
            var _this = this;
            if (this.tree) {
                return winjs_base_1.TPromise.join(elements.map(function (e) {
                    _this.refreshing++;
                    return _this.tree.refresh(e).then(function () { return _this.refreshing--; }, function () { return _this.refreshing--; });
                })).then(function () { return _this.updateIconsAvailability(_this.root); });
            }
            return winjs_base_1.TPromise.as(null);
        };
        CustomTreeViewer.prototype.updateIconsAvailability = function (parent) {
            if (this.activated && this.tree) {
                var initialResult = parent instanceof Root ? { hasIconForParentNode: false, hasIconForLeafNode: false } : { hasIconForParentNode: this.hasIconForParentNode, hasIconForLeafNode: this.hasIconForLeafNode };
                var _a = this.computeIconsAvailability(parent.children || [], initialResult), hasIconForParentNode = _a.hasIconForParentNode, hasIconForLeafNode = _a.hasIconForLeafNode;
                var changed = this.hasIconForParentNode !== hasIconForParentNode || this.hasIconForLeafNode !== hasIconForLeafNode;
                this._hasIconForParentNode = hasIconForParentNode;
                this._hasIconForLeafNode = hasIconForLeafNode;
                if (changed) {
                    this._onDidIconsChange.fire();
                }
                DOM.toggleClass(this.treeContainer, 'custom-view-align-icons-and-twisties', this.hasIconForLeafNode && !this.hasIconForParentNode);
            }
        };
        CustomTreeViewer.prototype.computeIconsAvailability = function (nodes, result) {
            if (!result.hasIconForLeafNode || !result.hasIconForParentNode) {
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var node = nodes_1[_i];
                    if (this.hasIcon(node)) {
                        result.hasIconForParentNode = result.hasIconForParentNode || node.collapsibleState !== views_1.TreeItemCollapsibleState.None;
                        result.hasIconForLeafNode = result.hasIconForLeafNode || node.collapsibleState === views_1.TreeItemCollapsibleState.None;
                    }
                    this.computeIconsAvailability(node.children || [], result);
                    if (result.hasIconForLeafNode && result.hasIconForParentNode) {
                        return result;
                    }
                }
            }
            return result;
        };
        CustomTreeViewer.prototype.hasIcon = function (node) {
            var icon = this.themeService.getTheme().type === themeService_1.LIGHT ? node.icon : node.iconDark;
            if (icon) {
                return true;
            }
            if (node.resourceUri) {
                var fileIconTheme = this.themeService.getFileIconTheme();
                if (node.collapsibleState !== views_1.TreeItemCollapsibleState.None) {
                    return fileIconTheme.hasFileIcons && fileIconTheme.hasFolderIcons;
                }
                return fileIconTheme.hasFileIcons;
            }
            return false;
        };
        CustomTreeViewer.prototype.onSelection = function (_a) {
            var payload = _a.payload;
            var selection = this.tree.getSelection()[0];
            if (selection) {
                if (selection.command) {
                    var originalEvent = payload && payload.originalEvent;
                    var isMouseEvent = payload && payload.origin === 'mouse';
                    var isDoubleClick = isMouseEvent && originalEvent && originalEvent.detail === 2;
                    if (!isMouseEvent || this.tree.openOnSingleClick || isDoubleClick) {
                        (_b = this.commandService).executeCommand.apply(_b, [selection.command.id].concat((selection.command.arguments || [])));
                    }
                }
            }
            var _b;
        };
        CustomTreeViewer = __decorate([
            __param(1, extensions_1.IExtensionService),
            __param(2, workbenchThemeService_1.IWorkbenchThemeService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, commands_1.ICommandService)
        ], CustomTreeViewer);
        return CustomTreeViewer;
    }(lifecycle_1.Disposable));
    var TreeDataSource = /** @class */ (function () {
        function TreeDataSource(treeView, progressService) {
            this.treeView = treeView;
            this.progressService = progressService;
        }
        TreeDataSource.prototype.getId = function (tree, node) {
            return node.handle;
        };
        TreeDataSource.prototype.hasChildren = function (tree, node) {
            return this.treeView.dataProvider && node.collapsibleState !== views_1.TreeItemCollapsibleState.None;
        };
        TreeDataSource.prototype.getChildren = function (tree, node) {
            var _this = this;
            if (this.treeView.dataProvider) {
                return this.progressService.withProgress({ location: progress_1.ProgressLocation.Explorer }, function () { return _this.treeView.dataProvider.getChildren(node); });
            }
            return winjs_base_1.TPromise.as([]);
        };
        TreeDataSource.prototype.shouldAutoexpand = function (tree, node) {
            return node.collapsibleState === views_1.TreeItemCollapsibleState.Expanded;
        };
        TreeDataSource.prototype.getParent = function (tree, node) {
            return winjs_base_1.TPromise.as(null);
        };
        TreeDataSource = __decorate([
            __param(1, progress_1.IProgressService2)
        ], TreeDataSource);
        return TreeDataSource;
    }());
    var TreeRenderer = /** @class */ (function () {
        function TreeRenderer(treeViewId, treeViewer, menus, actionItemProvider, instantiationService, themeService) {
            this.treeViewId = treeViewId;
            this.treeViewer = treeViewer;
            this.menus = menus;
            this.actionItemProvider = actionItemProvider;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
        }
        TreeRenderer.prototype.getHeight = function (tree, element) {
            return TreeRenderer.ITEM_HEIGHT;
        };
        TreeRenderer.prototype.getTemplateId = function (tree, element) {
            return TreeRenderer.TREE_TEMPLATE_ID;
        };
        TreeRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            DOM.addClass(container, 'custom-view-tree-node-item');
            var icon = this.instantiationService.createInstance(TreeItemIcon, container, this.treeViewer);
            var label = DOM.append(container, DOM.$('.custom-view-tree-node-item-label'));
            var resourceLabel = this.instantiationService.createInstance(labels_1.ResourceLabel, container, {});
            var actionsContainer = DOM.append(container, DOM.$('.actions'));
            var actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionItemProvider: this.actionItemProvider,
                actionRunner: new MultipleSelectionActionRunner(function () { return tree.getSelection(); })
            });
            return { label: label, resourceLabel: resourceLabel, icon: icon, actionBar: actionBar };
        };
        TreeRenderer.prototype.renderElement = function (tree, node, templateId, templateData) {
            var resource = node.resourceUri ? uri_1.default.revive(node.resourceUri) : null;
            var label = node.label ? node.label : resource ? paths_1.basename(resource.path) : '';
            var icon = this.themeService.getTheme().type === themeService_1.LIGHT ? node.icon : node.iconDark;
            // reset
            templateData.resourceLabel.clear();
            templateData.actionBar.clear();
            templateData.label.textContent = '';
            DOM.removeClass(templateData.label, 'custom-view-tree-node-item-label');
            DOM.removeClass(templateData.resourceLabel.element, 'custom-view-tree-node-item-resourceLabel');
            if (resource && !icon) {
                templateData.resourceLabel.setLabel({ name: label, resource: resource }, { fileKind: node.collapsibleState === views_1.TreeItemCollapsibleState.Collapsed || node.collapsibleState === views_1.TreeItemCollapsibleState.Expanded ? files_1.FileKind.FOLDER : files_1.FileKind.FILE, title: node.tooltip });
                DOM.addClass(templateData.resourceLabel.element, 'custom-view-tree-node-item-resourceLabel');
            }
            else {
                templateData.label.textContent = label;
                DOM.addClass(templateData.label, 'custom-view-tree-node-item-label');
                templateData.label.title = typeof node.tooltip === 'string' ? node.tooltip : label;
            }
            templateData.icon.treeItem = node;
            templateData.actionBar.context = { $treeViewId: this.treeViewId, $treeItemHandle: node.handle };
            templateData.actionBar.push(this.menus.getResourceActions(node), { icon: true, label: false });
        };
        TreeRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            templateData.resourceLabel.dispose();
            templateData.icon.dispose();
        };
        TreeRenderer.ITEM_HEIGHT = 22;
        TreeRenderer.TREE_TEMPLATE_ID = 'treeExplorer';
        TreeRenderer = __decorate([
            __param(4, instantiation_1.IInstantiationService),
            __param(5, workbenchThemeService_1.IWorkbenchThemeService)
        ], TreeRenderer);
        return TreeRenderer;
    }());
    var TreeItemIcon = /** @class */ (function (_super) {
        __extends(TreeItemIcon, _super);
        function TreeItemIcon(container, treeViewer, instantiationService, themeService) {
            var _this = _super.call(this) || this;
            _this.treeViewer = treeViewer;
            _this.themeService = themeService;
            _this.iconElement = DOM.append(container, DOM.$('.custom-view-tree-node-item-icon'));
            _this._register(_this.treeViewer.onDidIconsChange(function () { return _this.render(); }));
            return _this;
        }
        Object.defineProperty(TreeItemIcon.prototype, "treeItem", {
            set: function (treeItem) {
                this._treeItem = treeItem;
                this.render();
            },
            enumerable: true,
            configurable: true
        });
        TreeItemIcon.prototype.render = function () {
            if (this._treeItem) {
                var fileIconTheme = this.themeService.getFileIconTheme();
                var contributedIcon = this.themeService.getTheme().type === themeService_1.LIGHT ? this._treeItem.icon : this._treeItem.iconDark;
                var hasContributedIcon = !!contributedIcon;
                var hasChildren = this._treeItem.collapsibleState !== views_1.TreeItemCollapsibleState.None;
                var hasResource = !!this._treeItem.resourceUri;
                var isFolder = hasResource && hasChildren;
                var isFile = hasResource && !hasChildren;
                var hasThemeFolderIcon = isFolder && fileIconTheme.hasFileIcons && fileIconTheme.hasFolderIcons;
                var hasThemeFileIcon = isFile && fileIconTheme.hasFileIcons;
                var hasIcon = hasContributedIcon || hasThemeFolderIcon || hasThemeFileIcon;
                var hasFolderPlaceHolderIcon = hasIcon ? false : isFolder && this.treeViewer.hasIconForParentNode;
                var hasFilePlaceHolderIcon = hasIcon ? false : isFile && this.treeViewer.hasIconForLeafNode;
                var hasContainerPlaceHolderIcon = hasIcon || hasFolderPlaceHolderIcon ? false : hasChildren && this.treeViewer.hasIconForParentNode;
                var hasLeafPlaceHolderIcon = hasIcon || hasFilePlaceHolderIcon ? false : !hasChildren && (this.treeViewer.hasIconForParentNode || this.treeViewer.hasIconForLeafNode);
                this.iconElement.style.backgroundImage = hasContributedIcon ? "url('" + contributedIcon + "')" : '';
                DOM.toggleClass(this.iconElement, 'folder-icon', hasFolderPlaceHolderIcon);
                DOM.toggleClass(this.iconElement, 'file-icon', hasFilePlaceHolderIcon);
                DOM.toggleClass(this.iconElement, 'placeholder-icon', hasContainerPlaceHolderIcon);
                DOM.toggleClass(this.iconElement, 'custom-view-tree-node-item-icon', hasContributedIcon || hasFolderPlaceHolderIcon || hasFilePlaceHolderIcon || hasContainerPlaceHolderIcon || hasLeafPlaceHolderIcon);
            }
        };
        TreeItemIcon = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, workbenchThemeService_1.IWorkbenchThemeService)
        ], TreeItemIcon);
        return TreeItemIcon;
    }(lifecycle_1.Disposable));
    var TreeController = /** @class */ (function (_super) {
        __extends(TreeController, _super);
        function TreeController(treeViewId, menus, contextMenuService, _keybindingService, configurationService) {
            var _this = _super.call(this, {}, configurationService) || this;
            _this.treeViewId = treeViewId;
            _this.menus = menus;
            _this.contextMenuService = contextMenuService;
            _this._keybindingService = _keybindingService;
            return _this;
        }
        TreeController.prototype.onContextMenu = function (tree, node, event) {
            var _this = this;
            event.preventDefault();
            event.stopPropagation();
            tree.setFocus(node);
            var actions = this.menus.getResourceContextActions(node);
            if (!actions.length) {
                return true;
            }
            var anchor = { x: event.posx, y: event.posy };
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return anchor; },
                getActions: function () {
                    return winjs_base_1.TPromise.as(actions);
                },
                getActionItem: function (action) {
                    var keybinding = _this._keybindingService.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionbar_1.ActionItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return null;
                },
                onHide: function (wasCancelled) {
                    if (wasCancelled) {
                        tree.DOMFocus();
                    }
                },
                getActionsContext: function () { return ({ $treeViewId: _this.treeViewId, $treeItemHandle: node.handle }); },
                actionRunner: new MultipleSelectionActionRunner(function () { return tree.getSelection(); })
            });
            return true;
        };
        TreeController = __decorate([
            __param(2, contextView_1.IContextMenuService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, configuration_1.IConfigurationService)
        ], TreeController);
        return TreeController;
    }(listService_1.WorkbenchTreeController));
    var MultipleSelectionActionRunner = /** @class */ (function (_super) {
        __extends(MultipleSelectionActionRunner, _super);
        function MultipleSelectionActionRunner(getSelectedResources) {
            var _this = _super.call(this) || this;
            _this.getSelectedResources = getSelectedResources;
            return _this;
        }
        MultipleSelectionActionRunner.prototype.runAction = function (action, context) {
            if (action instanceof actions_2.MenuItemAction) {
                var selection = this.getSelectedResources();
                var filteredSelection = selection.filter(function (s) { return s !== context; });
                if (selection.length === filteredSelection.length || selection.length === 1) {
                    return action.run(context);
                }
                return action.run.apply(action, [context].concat(filteredSelection));
            }
            return _super.prototype.runAction.call(this, action, context);
        };
        return MultipleSelectionActionRunner;
    }(actions_1.ActionRunner));
    var Menus = /** @class */ (function (_super) {
        __extends(Menus, _super);
        function Menus(id, contextKeyService, menuService, contextMenuService) {
            var _this = _super.call(this) || this;
            _this.id = id;
            _this.contextKeyService = contextKeyService;
            _this.menuService = menuService;
            _this.contextMenuService = contextMenuService;
            return _this;
        }
        Menus.prototype.getResourceActions = function (element) {
            return this.getActions(actions_2.MenuId.ViewItemContext, { key: 'viewItem', value: element.contextValue }).primary;
        };
        Menus.prototype.getResourceContextActions = function (element) {
            return this.getActions(actions_2.MenuId.ViewItemContext, { key: 'viewItem', value: element.contextValue }).secondary;
        };
        Menus.prototype.getActions = function (menuId, context) {
            var contextKeyService = this.contextKeyService.createScoped();
            contextKeyService.createKey('view', this.id);
            contextKeyService.createKey(context.key, context.value);
            var menu = this.menuService.createMenu(menuId, contextKeyService);
            var primary = [];
            var secondary = [];
            var result = { primary: primary, secondary: secondary };
            menuItemActionItem_1.fillInActions(menu, { shouldForwardArgs: true }, result, this.contextMenuService, function (g) { return /^inline/.test(g); });
            menu.dispose();
            contextKeyService.dispose();
            return result;
        };
        Menus = __decorate([
            __param(1, contextkey_1.IContextKeyService),
            __param(2, actions_2.IMenuService),
            __param(3, contextView_1.IContextMenuService)
        ], Menus);
        return Menus;
    }(lifecycle_1.Disposable));
});
