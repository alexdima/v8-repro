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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/browser/dom", "vs/base/browser/builder", "vs/workbench/common/memento", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/platform/extensions/common/extensions", "vs/platform/contextview/browser/contextView", "vs/workbench/common/views", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/contextkey/common/contextkey", "vs/base/browser/mouseEvent", "vs/workbench/browser/parts/views/panelViewlet", "vs/platform/list/browser/listService", "vs/base/common/event", "vs/platform/configuration/common/configuration"], function (require, exports, nls, winjs_base_1, errors, DOM, builder_1, memento_1, lifecycle_1, arrays_1, extensions_1, contextView_1, views_1, telemetry_1, themeService_1, instantiation_1, storage_1, workspace_1, contextkey_1, mouseEvent_1, panelViewlet_1, listService_1, event_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ViewsViewletPanel = /** @class */ (function (_super) {
        __extends(ViewsViewletPanel, _super);
        function ViewsViewletPanel(options, keybindingService, contextMenuService, configurationService) {
            var _this = _super.call(this, options.name, options, keybindingService, contextMenuService, configurationService) || this;
            _this.keybindingService = keybindingService;
            _this.contextMenuService = contextMenuService;
            _this.id = options.id;
            _this.name = options.name;
            _this._expanded = options.expanded;
            return _this;
        }
        ViewsViewletPanel.prototype.setVisible = function (visible) {
            if (this._isVisible !== visible) {
                this._isVisible = visible;
            }
            return winjs_base_1.TPromise.wrap(null);
        };
        ViewsViewletPanel.prototype.isVisible = function () {
            return this._isVisible;
        };
        ViewsViewletPanel.prototype.getActions = function () {
            return [];
        };
        ViewsViewletPanel.prototype.getSecondaryActions = function () {
            return [];
        };
        ViewsViewletPanel.prototype.getActionItem = function (action) {
            return null;
        };
        ViewsViewletPanel.prototype.getActionsContext = function () {
            return undefined;
        };
        ViewsViewletPanel.prototype.getOptimalWidth = function () {
            return 0;
        };
        ViewsViewletPanel.prototype.create = function () {
            return winjs_base_1.TPromise.as(null);
        };
        ViewsViewletPanel.prototype.shutdown = function () {
            // Subclass to implement
        };
        ViewsViewletPanel = __decorate([
            __param(3, configuration_1.IConfigurationService)
        ], ViewsViewletPanel);
        return ViewsViewletPanel;
    }(panelViewlet_1.ViewletPanel));
    exports.ViewsViewletPanel = ViewsViewletPanel;
    var TreeViewsViewletPanel = /** @class */ (function (_super) {
        __extends(TreeViewsViewletPanel, _super);
        function TreeViewsViewletPanel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TreeViewsViewletPanel.prototype.setExpanded = function (expanded) {
            if (this.isExpanded() !== expanded) {
                this.updateTreeVisibility(this.tree, expanded);
                _super.prototype.setExpanded.call(this, expanded);
            }
        };
        TreeViewsViewletPanel.prototype.setVisible = function (visible) {
            var _this = this;
            if (this.isVisible() !== visible) {
                return _super.prototype.setVisible.call(this, visible)
                    .then(function () { return _this.updateTreeVisibility(_this.tree, visible && _this.isExpanded()); });
            }
            return winjs_base_1.TPromise.wrap(null);
        };
        TreeViewsViewletPanel.prototype.focus = function () {
            _super.prototype.focus.call(this);
            this.focusTree();
        };
        TreeViewsViewletPanel.prototype.layoutBody = function (size) {
            if (this.tree) {
                this.tree.layout(size);
            }
        };
        TreeViewsViewletPanel.prototype.updateTreeVisibility = function (tree, isVisible) {
            if (!tree) {
                return;
            }
            if (isVisible) {
                builder_1.$(tree.getHTMLElement()).show();
            }
            else {
                builder_1.$(tree.getHTMLElement()).hide(); // make sure the tree goes out of the tabindex world by hiding it
            }
            if (isVisible) {
                tree.onVisible();
            }
            else {
                tree.onHidden();
            }
        };
        TreeViewsViewletPanel.prototype.focusTree = function () {
            if (!this.tree) {
                return; // return early if viewlet has not yet been created
            }
            // Make sure the current selected element is revealed
            var selectedElement = this.tree.getSelection()[0];
            if (selectedElement) {
                this.tree.reveal(selectedElement, 0.5).done(null, errors.onUnexpectedError);
            }
            // Pass Focus to Viewer
            this.tree.DOMFocus();
        };
        TreeViewsViewletPanel.prototype.dispose = function () {
            if (this.tree) {
                this.tree.dispose();
            }
            _super.prototype.dispose.call(this);
        };
        return TreeViewsViewletPanel;
    }(ViewsViewletPanel));
    exports.TreeViewsViewletPanel = TreeViewsViewletPanel;
    var ViewsViewlet = /** @class */ (function (_super) {
        __extends(ViewsViewlet, _super);
        function ViewsViewlet(id, location, showHeaderInTitleWhenSingleView, telemetryService, storageService, instantiationService, themeService, contextKeyService, contextMenuService, extensionService) {
            var _this = _super.call(this, id, { showHeaderInTitleWhenSingleView: showHeaderInTitleWhenSingleView, dnd: true }, telemetryService, themeService) || this;
            _this.location = location;
            _this.showHeaderInTitleWhenSingleView = showHeaderInTitleWhenSingleView;
            _this.storageService = storageService;
            _this.instantiationService = instantiationService;
            _this.contextKeyService = contextKeyService;
            _this.contextMenuService = contextMenuService;
            _this.extensionService = extensionService;
            _this.viewHeaderContextMenuListeners = [];
            _this.viewsContextKeys = new Set();
            _this.viewsViewletPanels = [];
            _this.didLayout = false;
            _this.viewsStates = new Map();
            _this.areExtensionsReady = false;
            _this._onDidChangeViewVisibilityState = new event_1.Emitter();
            _this.onDidChangeViewVisibilityState = _this._onDidChangeViewVisibilityState.event;
            _this.viewletSettings = _this.getMemento(storageService, memento_1.Scope.WORKSPACE);
            return _this;
        }
        ViewsViewlet.prototype.create = function (parent) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, _super.prototype.create.call(this, parent)];
                        case 1:
                            _a.sent();
                            this._register(this.onDidSashChange(function () { return _this.snapshotViewsStates(); }));
                            this._register(views_1.ViewsRegistry.onViewsRegistered(this.onViewsRegistered, this));
                            this._register(views_1.ViewsRegistry.onViewsDeregistered(this.onViewsDeregistered, this));
                            this._register(this.contextKeyService.onDidChangeContext(this.onContextChanged, this));
                            // Update headers after and title contributed views after available, since we read from cache in the beginning to know if the viewlet has single view or not. Ref #29609
                            this.extensionService.whenInstalledExtensionsRegistered().then(function () {
                                _this.areExtensionsReady = true;
                                _this.updateHeaders();
                            });
                            this.onViewsRegistered(views_1.ViewsRegistry.getViews(this.location));
                            this.focus();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ViewsViewlet.prototype.getContextMenuActions = function () {
            var _this = this;
            return this.getViewDescriptorsFromRegistry(true)
                .filter(function (viewDescriptor) { return viewDescriptor.canToggleVisibility && _this.contextKeyService.contextMatchesRules(viewDescriptor.when); })
                .map(function (viewDescriptor) { return ({
                id: viewDescriptor.id + ".toggleVisibility",
                label: viewDescriptor.name,
                checked: _this.isCurrentlyVisible(viewDescriptor),
                enabled: true,
                run: function () { return _this.toggleViewVisibility(viewDescriptor.id); }
            }); });
        };
        ViewsViewlet.prototype.setVisible = function (visible) {
            var _this = this;
            return _super.prototype.setVisible.call(this, visible)
                .then(function () { return winjs_base_1.TPromise.join(_this.viewsViewletPanels.filter(function (view) { return view.isVisible() !== visible; })
                .map(function (view) { return view.setVisible(visible); })); })
                .then(function () { return void 0; });
        };
        ViewsViewlet.prototype.openView = function (id) {
            this.focus();
            var view = this.getView(id);
            if (view) {
                view.setExpanded(true);
                view.focus();
            }
            else {
                this.toggleViewVisibility(id);
            }
        };
        ViewsViewlet.prototype.layout = function (dimension) {
            _super.prototype.layout.call(this, dimension);
            this.dimension = dimension;
            if (this.didLayout) {
                this.snapshotViewsStates();
            }
            else {
                this.didLayout = true;
                this.resizePanels();
            }
        };
        ViewsViewlet.prototype.getOptimalWidth = function () {
            var additionalMargin = 16;
            var optimalWidth = Math.max.apply(Math, this.viewsViewletPanels.map(function (view) { return view.getOptimalWidth() || 0; }));
            return optimalWidth + additionalMargin;
        };
        ViewsViewlet.prototype.shutdown = function () {
            this.viewsViewletPanels.forEach(function (view) { return view.shutdown(); });
            _super.prototype.shutdown.call(this);
        };
        ViewsViewlet.prototype.toggleViewVisibility = function (id) {
            var _this = this;
            var viewState = this.viewsStates.get(id);
            if (!viewState) {
                return;
            }
            viewState.isHidden = !!this.getView(id);
            this.updateViews()
                .then(function () {
                _this._onDidChangeViewVisibilityState.fire(id);
                if (!viewState.isHidden) {
                    _this.openView(id);
                }
                else {
                    _this.focus();
                }
            });
        };
        ViewsViewlet.prototype.onViewsRegistered = function (views) {
            this.viewsContextKeys.clear();
            for (var _i = 0, _a = this.getViewDescriptorsFromRegistry(); _i < _a.length; _i++) {
                var viewDescriptor = _a[_i];
                if (viewDescriptor.when) {
                    for (var _b = 0, _c = viewDescriptor.when.keys(); _b < _c.length; _b++) {
                        var key = _c[_b];
                        this.viewsContextKeys.add(key);
                    }
                }
            }
            this.updateViews();
        };
        ViewsViewlet.prototype.onViewsDeregistered = function (views) {
            this.updateViews(views);
        };
        ViewsViewlet.prototype.onContextChanged = function (event) {
            if (event.affectsSome(this.viewsContextKeys)) {
                this.updateViews();
            }
        };
        ViewsViewlet.prototype.updateViews = function (unregisteredViews) {
            var _this = this;
            if (unregisteredViews === void 0) { unregisteredViews = []; }
            var registeredViews = this.getViewDescriptorsFromRegistry();
            var _a = registeredViews.reduce(function (result, viewDescriptor) {
                var isCurrentlyVisible = _this.isCurrentlyVisible(viewDescriptor);
                var canBeVisible = _this.canBeVisible(viewDescriptor);
                if (canBeVisible) {
                    result[0].push(viewDescriptor);
                }
                if (!isCurrentlyVisible && canBeVisible) {
                    result[1].push(viewDescriptor);
                }
                if (isCurrentlyVisible && !canBeVisible) {
                    result[2].push(viewDescriptor);
                }
                return result;
            }, [[], [], []]), visible = _a[0], toAdd = _a[1], toRemove = _a[2];
            toRemove.push.apply(toRemove, unregisteredViews.filter(function (viewDescriptor) { return _this.isCurrentlyVisible(viewDescriptor); }));
            var toCreate = [];
            if (toAdd.length || toRemove.length) {
                this.snapshotViewsStates();
                if (toRemove.length) {
                    for (var _i = 0, toRemove_1 = toRemove; _i < toRemove_1.length; _i++) {
                        var viewDescriptor = toRemove_1[_i];
                        var view = this.getView(viewDescriptor.id);
                        this.removePanel(view);
                        this.viewsViewletPanels.splice(this.viewsViewletPanels.indexOf(view), 1);
                        view.dispose();
                    }
                }
                for (var _b = 0, toAdd_1 = toAdd; _b < toAdd_1.length; _b++) {
                    var viewDescriptor = toAdd_1[_b];
                    var viewState = this.viewsStates.get(viewDescriptor.id);
                    var index = visible.indexOf(viewDescriptor);
                    var view = this.createView(viewDescriptor, {
                        id: viewDescriptor.id,
                        name: viewDescriptor.name,
                        actionRunner: this.getActionRunner(),
                        expanded: !(viewState ? viewState.collapsed : viewDescriptor.collapsed),
                        viewletSettings: this.viewletSettings
                    });
                    toCreate.push(view);
                    var size = (viewState && viewState.size) || 200;
                    this.addPanel(view, size, index);
                    this.viewsViewletPanels.splice(index, 0, view);
                }
                return winjs_base_1.TPromise.join(toCreate.map(function (view) { return view.create(); }))
                    .then(function () { return _this.onViewsUpdated(); })
                    .then(function () {
                    _this.resizePanels(toCreate);
                    return toCreate;
                });
            }
            return winjs_base_1.TPromise.as([]);
        };
        ViewsViewlet.prototype.resizePanels = function (panels) {
            if (panels === void 0) { panels = this.viewsViewletPanels; }
            if (!this.didLayout) {
                // Do not do anything if layout has not happened yet
                return;
            }
            var initialSizes;
            for (var _i = 0, panels_1 = panels; _i < panels_1.length; _i++) {
                var panel = panels_1[_i];
                var viewState = this.viewsStates.get(panel.id);
                if (viewState && viewState.size) {
                    this.resizePanel(panel, viewState.size);
                }
                else {
                    initialSizes = initialSizes ? initialSizes : this.computeInitialSizes();
                    this.resizePanel(panel, initialSizes[panel.id] || 200);
                }
            }
            this.snapshotViewsStates();
        };
        ViewsViewlet.prototype.computeInitialSizes = function () {
            var sizes = {};
            if (this.dimension) {
                var totalWeight = 0;
                var allViewDescriptors = this.getViewDescriptorsFromRegistry();
                var viewDescriptors = [];
                var _loop_1 = function (panel) {
                    var viewDescriptor = allViewDescriptors.filter(function (viewDescriptor) { return viewDescriptor.id === panel.id; })[0];
                    totalWeight = totalWeight + (viewDescriptor.weight || 20);
                    viewDescriptors.push(viewDescriptor);
                };
                for (var _i = 0, _a = this.viewsViewletPanels; _i < _a.length; _i++) {
                    var panel = _a[_i];
                    _loop_1(panel);
                }
                for (var _b = 0, viewDescriptors_1 = viewDescriptors; _b < viewDescriptors_1.length; _b++) {
                    var viewDescriptor = viewDescriptors_1[_b];
                    sizes[viewDescriptor.id] = this.dimension.height * (viewDescriptor.weight || 20) / totalWeight;
                }
            }
            return sizes;
        };
        ViewsViewlet.prototype.movePanel = function (from, to) {
            var fromIndex = arrays_1.firstIndex(this.viewsViewletPanels, function (panel) { return panel === from; });
            var toIndex = arrays_1.firstIndex(this.viewsViewletPanels, function (panel) { return panel === to; });
            if (fromIndex < 0 || fromIndex >= this.viewsViewletPanels.length) {
                return;
            }
            if (toIndex < 0 || toIndex >= this.viewsViewletPanels.length) {
                return;
            }
            _super.prototype.movePanel.call(this, from, to);
            var panel = this.viewsViewletPanels.splice(fromIndex, 1)[0];
            this.viewsViewletPanels.splice(toIndex, 0, panel);
            for (var order = 0; order < this.viewsViewletPanels.length; order++) {
                var view = this.viewsStates.get(this.viewsViewletPanels[order].id);
                if (!view) {
                    continue;
                }
                view.order = order;
            }
        };
        ViewsViewlet.prototype.isCurrentlyVisible = function (viewDescriptor) {
            return !!this.getView(viewDescriptor.id);
        };
        ViewsViewlet.prototype.canBeVisible = function (viewDescriptor) {
            var viewstate = this.viewsStates.get(viewDescriptor.id);
            if (viewDescriptor.canToggleVisibility && viewstate && viewstate.isHidden) {
                return false;
            }
            return this.contextKeyService.contextMatchesRules(viewDescriptor.when);
        };
        ViewsViewlet.prototype.onViewsUpdated = function () {
            var _this = this;
            this.viewHeaderContextMenuListeners = lifecycle_1.dispose(this.viewHeaderContextMenuListeners);
            var _loop_2 = function (viewDescriptor) {
                var view = this_1.getView(viewDescriptor.id);
                if (view) {
                    this_1.viewHeaderContextMenuListeners.push(DOM.addDisposableListener(view.draggableElement, DOM.EventType.CONTEXT_MENU, function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        if (viewDescriptor.canToggleVisibility) {
                            _this.onContextMenu(new mouseEvent_1.StandardMouseEvent(e), view);
                        }
                    }));
                }
            };
            var this_1 = this;
            for (var _i = 0, _a = this.getViewDescriptorsFromRegistry(); _i < _a.length; _i++) {
                var viewDescriptor = _a[_i];
                _loop_2(viewDescriptor);
            }
            return this.setVisible(this.isVisible());
        };
        ViewsViewlet.prototype.updateHeaders = function () {
            if (this.viewsViewletPanels.length) {
                this.updateTitleArea();
                this.updateViewHeaders();
            }
        };
        ViewsViewlet.prototype.onContextMenu = function (event, view) {
            var _this = this;
            event.stopPropagation();
            event.preventDefault();
            var anchor = { x: event.posx, y: event.posy };
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return anchor; },
                getActions: function () { return winjs_base_1.TPromise.as([{
                        id: view.id + ".removeView",
                        label: nls.localize('hideView', "Hide"),
                        enabled: true,
                        run: function () { return _this.toggleViewVisibility(view.id); }
                    }]); },
            });
        };
        ViewsViewlet.prototype.isSingleView = function () {
            var _this = this;
            if (!this.showHeaderInTitleWhenSingleView) {
                return false;
            }
            if (this.getViewDescriptorsFromRegistry().length === 0) {
                return false;
            }
            if (this.length > 1) {
                return false;
            }
            if (views_1.ViewLocation.getContributedViewLocation(this.location.id)) {
                var visibleViewsCount_1 = 0;
                if (this.areExtensionsReady) {
                    visibleViewsCount_1 = this.getViewDescriptorsFromRegistry().reduce(function (visibleViewsCount, v) { return visibleViewsCount + (_this.canBeVisible(v) ? 1 : 0); }, 0);
                }
                else {
                    // Check in cache so that view do not jump. See #29609
                    this.viewsStates.forEach(function (viewState, id) {
                        if (!viewState.isHidden) {
                            visibleViewsCount_1++;
                        }
                    });
                }
                return visibleViewsCount_1 === 1;
            }
            return _super.prototype.isSingleView.call(this);
        };
        ViewsViewlet.prototype.getViewDescriptorsFromRegistry = function (defaultOrder) {
            var _this = this;
            if (defaultOrder === void 0) { defaultOrder = false; }
            return views_1.ViewsRegistry.getViews(this.location)
                .sort(function (a, b) {
                var viewStateA = _this.viewsStates.get(a.id);
                var viewStateB = _this.viewsStates.get(b.id);
                var orderA = !defaultOrder && viewStateA ? viewStateA.order : a.order;
                var orderB = !defaultOrder && viewStateB ? viewStateB.order : b.order;
                if (orderB === void 0 || orderB === null) {
                    return -1;
                }
                if (orderA === void 0 || orderA === null) {
                    return 1;
                }
                return orderA - orderB;
            });
        };
        ViewsViewlet.prototype.createView = function (viewDescriptor, options) {
            return this.instantiationService.createInstance(viewDescriptor.ctor, options);
        };
        Object.defineProperty(ViewsViewlet.prototype, "views", {
            get: function () {
                return this.viewsViewletPanels;
            },
            enumerable: true,
            configurable: true
        });
        ViewsViewlet.prototype.getView = function (id) {
            return this.viewsViewletPanels.filter(function (view) { return view.id === id; })[0];
        };
        ViewsViewlet.prototype.snapshotViewsStates = function () {
            for (var _i = 0, _a = this.viewsViewletPanels; _i < _a.length; _i++) {
                var view = _a[_i];
                var currentState = this.viewsStates.get(view.id);
                if (currentState && !this.didLayout) {
                    // Do not update to new state if the layout has not happened yet
                    return;
                }
                var collapsed = !view.isExpanded();
                var order = this.viewsViewletPanels.indexOf(view);
                var panelSize = this.getPanelSize(view);
                if (currentState) {
                    currentState.collapsed = collapsed;
                    currentState.size = collapsed ? currentState.size : panelSize;
                    currentState.order = order;
                }
                else {
                    this.viewsStates.set(view.id, {
                        collapsed: collapsed,
                        size: this.didLayout ? panelSize : void 0,
                        isHidden: false,
                        order: order,
                    });
                }
            }
        };
        ViewsViewlet = __decorate([
            __param(3, telemetry_1.ITelemetryService),
            __param(4, storage_1.IStorageService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, themeService_1.IThemeService),
            __param(7, contextkey_1.IContextKeyService),
            __param(8, contextView_1.IContextMenuService),
            __param(9, extensions_1.IExtensionService)
        ], ViewsViewlet);
        return ViewsViewlet;
    }(panelViewlet_1.PanelViewlet));
    exports.ViewsViewlet = ViewsViewlet;
    var PersistentViewsViewlet = /** @class */ (function (_super) {
        __extends(PersistentViewsViewlet, _super);
        function PersistentViewsViewlet(id, location, viewletStateStorageId, showHeaderInTitleWhenSingleView, telemetryService, storageService, instantiationService, themeService, contextService, contextKeyService, contextMenuService, extensionService) {
            var _this = _super.call(this, id, location, showHeaderInTitleWhenSingleView, telemetryService, storageService, instantiationService, themeService, contextKeyService, contextMenuService, extensionService) || this;
            _this.viewletStateStorageId = viewletStateStorageId;
            _this.contextService = contextService;
            _this.hiddenViewsStorageId = _this.viewletStateStorageId + ".hidden";
            _this._register(_this.onDidChangeViewVisibilityState(function (id) { return _this.onViewVisibilityChanged(id); }));
            return _this;
        }
        PersistentViewsViewlet.prototype.create = function (parent) {
            this.loadViewsStates();
            return _super.prototype.create.call(this, parent);
        };
        PersistentViewsViewlet.prototype.shutdown = function () {
            this.saveViewsStates();
            _super.prototype.shutdown.call(this);
        };
        PersistentViewsViewlet.prototype.saveViewsStates = function () {
            var _this = this;
            var viewsStates = {};
            var registeredViewDescriptors = this.getViewDescriptorsFromRegistry();
            this.viewsStates.forEach(function (viewState, id) {
                var view = _this.getView(id);
                if (view) {
                    viewsStates[id] = {
                        collapsed: !view.isExpanded(),
                        size: _this.getPanelSize(view),
                        isHidden: false,
                        order: viewState.order
                    };
                }
                else {
                    var viewDescriptor = registeredViewDescriptors.filter(function (v) { return v.id === id; })[0];
                    if (viewDescriptor) {
                        viewsStates[id] = viewState;
                    }
                }
            });
            this.storageService.store(this.viewletStateStorageId, JSON.stringify(viewsStates), this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY ? storage_1.StorageScope.WORKSPACE : storage_1.StorageScope.GLOBAL);
        };
        PersistentViewsViewlet.prototype.loadViewsStates = function () {
            var _this = this;
            var viewsStates = JSON.parse(this.storageService.get(this.viewletStateStorageId, this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY ? storage_1.StorageScope.WORKSPACE : storage_1.StorageScope.GLOBAL, '{}'));
            var hiddenViews = this.loadHiddenViews();
            Object.keys(viewsStates).forEach(function (id) { return _this.viewsStates.set(id, __assign({}, viewsStates[id], { isHidden: hiddenViews.indexOf(id) !== -1 })); });
        };
        PersistentViewsViewlet.prototype.onViewVisibilityChanged = function (id) {
            var hiddenViews = this.loadHiddenViews();
            var index = hiddenViews.indexOf(id);
            if (this.getView(id) && index !== -1) {
                hiddenViews.splice(index, 1);
            }
            else if (index === -1) {
                hiddenViews.push(id);
            }
            this.storeHiddenViews(hiddenViews);
        };
        PersistentViewsViewlet.prototype.storeHiddenViews = function (hiddenViews) {
            this.storageService.store(this.hiddenViewsStorageId, JSON.stringify(hiddenViews), storage_1.StorageScope.GLOBAL);
        };
        PersistentViewsViewlet.prototype.loadHiddenViews = function () {
            return JSON.parse(this.storageService.get(this.hiddenViewsStorageId, storage_1.StorageScope.GLOBAL, '[]'));
        };
        PersistentViewsViewlet = __decorate([
            __param(4, telemetry_1.ITelemetryService),
            __param(5, storage_1.IStorageService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, themeService_1.IThemeService),
            __param(8, workspace_1.IWorkspaceContextService),
            __param(9, contextkey_1.IContextKeyService),
            __param(10, contextView_1.IContextMenuService),
            __param(11, extensions_1.IExtensionService)
        ], PersistentViewsViewlet);
        return PersistentViewsViewlet;
    }(ViewsViewlet));
    exports.PersistentViewsViewlet = PersistentViewsViewlet;
    var FileIconThemableWorkbenchTree = /** @class */ (function (_super) {
        __extends(FileIconThemableWorkbenchTree, _super);
        function FileIconThemableWorkbenchTree(container, configuration, options, contextKeyService, listService, themeService, configurationService, instantiationService) {
            var _this = _super.call(this, container, configuration, __assign({}, options, { showTwistie: false, twistiePixels: 12 }), contextKeyService, listService, themeService, instantiationService, configurationService) || this;
            DOM.addClass(container, 'file-icon-themable-tree');
            DOM.addClass(container, 'show-file-icons');
            var onFileIconThemeChange = function (fileIconTheme) {
                DOM.toggleClass(container, 'align-icons-and-twisties', fileIconTheme.hasFileIcons && !fileIconTheme.hasFolderIcons);
                DOM.toggleClass(container, 'hide-arrows', fileIconTheme.hidesExplorerArrows === true);
            };
            _this.disposables.push(themeService.onDidFileIconThemeChange(onFileIconThemeChange));
            onFileIconThemeChange(themeService.getFileIconTheme());
            return _this;
        }
        FileIconThemableWorkbenchTree = __decorate([
            __param(3, contextkey_1.IContextKeyService),
            __param(4, listService_1.IListService),
            __param(5, themeService_1.IThemeService),
            __param(6, configuration_1.IConfigurationService),
            __param(7, instantiation_1.IInstantiationService)
        ], FileIconThemableWorkbenchTree);
        return FileIconThemableWorkbenchTree;
    }(listService_1.WorkbenchTree));
    exports.FileIconThemableWorkbenchTree = FileIconThemableWorkbenchTree;
});
