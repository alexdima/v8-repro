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
define(["require", "exports", "vs/nls", "vs/base/common/paths", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/common/arrays", "vs/workbench/api/node/extHostTypes", "vs/base/common/types"], function (require, exports, nls_1, paths_1, uri_1, event_1, winjs_base_1, lifecycle_1, async_1, arrays_1, extHostTypes_1, types_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostTreeViews = /** @class */ (function () {
        function ExtHostTreeViews(_proxy, commands) {
            var _this = this;
            this._proxy = _proxy;
            this.commands = commands;
            this.treeViews = new Map();
            commands.registerArgumentProcessor({
                processArgument: function (arg) {
                    if (arg && arg.$treeViewId && arg.$treeItemHandle) {
                        return _this.convertArgument(arg);
                    }
                    return arg;
                }
            });
        }
        ExtHostTreeViews.prototype.registerTreeDataProvider = function (id, treeDataProvider) {
            var _this = this;
            var treeView = new ExtHostTreeView(id, treeDataProvider, this._proxy, this.commands.converter);
            this.treeViews.set(id, treeView);
            return {
                dispose: function () {
                    _this.treeViews.delete(id);
                    treeView.dispose();
                }
            };
        };
        ExtHostTreeViews.prototype.$getChildren = function (treeViewId, treeItemHandle) {
            var treeView = this.treeViews.get(treeViewId);
            if (!treeView) {
                return winjs_base_1.TPromise.wrapError(new Error(nls_1.localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId)));
            }
            return treeView.getChildren(treeItemHandle);
        };
        ExtHostTreeViews.prototype.convertArgument = function (arg) {
            var treeView = this.treeViews.get(arg.$treeViewId);
            return treeView ? treeView.getExtensionElement(arg.$treeItemHandle) : null;
        };
        return ExtHostTreeViews;
    }());
    exports.ExtHostTreeViews = ExtHostTreeViews;
    var ExtHostTreeView = /** @class */ (function (_super) {
        __extends(ExtHostTreeView, _super);
        function ExtHostTreeView(viewId, dataProvider, proxy, commands) {
            var _this = _super.call(this) || this;
            _this.viewId = viewId;
            _this.dataProvider = dataProvider;
            _this.proxy = proxy;
            _this.commands = commands;
            _this.rootHandles = [];
            _this.elements = new Map();
            _this.nodes = new Map();
            _this.proxy.$registerTreeViewDataProvider(viewId);
            if (dataProvider.onDidChangeTreeData) {
                _this._register(event_1.debounceEvent(dataProvider.onDidChangeTreeData, function (last, current) { return last ? last.concat([current]) : [current]; }, 200)(function (elements) { return _this.refresh(elements); }));
            }
            return _this;
        }
        ExtHostTreeView.prototype.getChildren = function (parentHandle) {
            var _this = this;
            var parentElement = parentHandle ? this.getExtensionElement(parentHandle) : void 0;
            if (parentHandle && !parentElement) {
                console.error("No tree item with id '" + parentHandle + "' found.");
                return winjs_base_1.TPromise.as([]);
            }
            this.clearChildren(parentElement);
            return async_1.asWinJsPromise(function () { return _this.dataProvider.getChildren(parentElement); })
                .then(function (elements) { return winjs_base_1.TPromise.join(arrays_1.coalesce(elements || []).map(function (element) {
                return async_1.asWinJsPromise(function () { return _this.dataProvider.getTreeItem(element); })
                    .then(function (extTreeItem) {
                    if (extTreeItem) {
                        if (extTreeItem.id && _this.elements.has(_this.createHandle(element, extTreeItem))) {
                            throw new Error(nls_1.localize('treeView.duplicateElement', 'Element with id {0} is already registered', extTreeItem.id));
                        }
                        return { element: element, extTreeItem: extTreeItem };
                    }
                    return null;
                });
            })); }).then(function (extTreeItems) { return arrays_1.coalesce(extTreeItems).map((function (_a) {
                var element = _a.element, extTreeItem = _a.extTreeItem;
                return _this.createTreeItem(element, extTreeItem, parentHandle);
            })); });
        };
        ExtHostTreeView.prototype.getExtensionElement = function (treeItemHandle) {
            return this.elements.get(treeItemHandle);
        };
        ExtHostTreeView.prototype.refresh = function (elements) {
            var hasRoot = elements.some(function (element) { return !element; });
            if (hasRoot) {
                this.proxy.$refresh(this.viewId);
            }
            else {
                var handlesToRefresh = this.getHandlesToRefresh(elements);
                if (handlesToRefresh.length) {
                    this.refreshHandles(handlesToRefresh);
                }
            }
        };
        ExtHostTreeView.prototype.getHandlesToRefresh = function (elements) {
            var _this = this;
            var elementsToUpdate = new Set();
            for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                var element = elements_1[_i];
                var elementNode = this.nodes.get(element);
                if (elementNode && !elementsToUpdate.has(elementNode.handle)) {
                    // check if an ancestor of extElement is already in the elements to update list
                    var currentNode = elementNode;
                    while (currentNode && currentNode.parentHandle && !elementsToUpdate.has(currentNode.parentHandle)) {
                        var parentElement = this.elements.get(currentNode.parentHandle);
                        currentNode = this.nodes.get(parentElement);
                    }
                    if (!currentNode.parentHandle) {
                        elementsToUpdate.add(elementNode.handle);
                    }
                }
            }
            var handlesToUpdate = [];
            // Take only top level elements
            elementsToUpdate.forEach(function (handle) {
                var element = _this.elements.get(handle);
                var node = _this.nodes.get(element);
                if (node && !elementsToUpdate.has(node.parentHandle)) {
                    handlesToUpdate.push(handle);
                }
            });
            return handlesToUpdate;
        };
        ExtHostTreeView.prototype.refreshHandles = function (itemHandles) {
            var _this = this;
            var itemsToRefresh = {};
            var promises = [];
            itemHandles.forEach(function (treeItemHandle) {
                var extElement = _this.getExtensionElement(treeItemHandle);
                var node = _this.nodes.get(extElement);
                promises.push(async_1.asWinJsPromise(function () { return _this.dataProvider.getTreeItem(extElement); })
                    .then(function (extTreeItem) {
                    if (extTreeItem) {
                        itemsToRefresh[treeItemHandle] = _this.createTreeItem(extElement, extTreeItem, node.parentHandle);
                    }
                }));
            });
            return winjs_base_1.TPromise.join(promises)
                .then(function (treeItems) { return _this.proxy.$refresh(_this.viewId, itemsToRefresh); });
        };
        ExtHostTreeView.prototype.createTreeItem = function (element, extensionTreeItem, parentHandle) {
            var handle = this.createHandle(element, extensionTreeItem, parentHandle);
            var icon = this.getLightIconPath(extensionTreeItem);
            this.update(element, handle, parentHandle);
            return {
                handle: handle,
                parentHandle: parentHandle,
                label: extensionTreeItem.label,
                resourceUri: extensionTreeItem.resourceUri,
                tooltip: typeof extensionTreeItem.tooltip === 'string' ? extensionTreeItem.tooltip : void 0,
                command: extensionTreeItem.command ? this.commands.toInternal(extensionTreeItem.command) : void 0,
                contextValue: extensionTreeItem.contextValue,
                icon: icon,
                iconDark: this.getDarkIconPath(extensionTreeItem) || icon,
                collapsibleState: types_1.isUndefinedOrNull(extensionTreeItem.collapsibleState) ? extHostTypes_1.TreeItemCollapsibleState.None : extensionTreeItem.collapsibleState
            };
        };
        ExtHostTreeView.prototype.createHandle = function (element, _a, parentHandle) {
            var id = _a.id, label = _a.label, resourceUri = _a.resourceUri;
            if (id) {
                return ExtHostTreeView.ID_HANDLE_PREFIX + "/" + id;
            }
            var prefix = parentHandle ? parentHandle : ExtHostTreeView.LABEL_HANDLE_PREFIX;
            var elementId = label ? label : resourceUri ? paths_1.basename(resourceUri.path) : '';
            elementId = elementId.indexOf('/') !== -1 ? elementId.replace('/', '//') : elementId;
            var existingHandle = this.nodes.has(element) ? this.nodes.get(element).handle : void 0;
            for (var counter = 0; counter <= this.getChildrenHandles(parentHandle).length; counter++) {
                var handle = prefix + "/" + counter + ":" + elementId;
                if (!this.elements.has(handle) || existingHandle === handle) {
                    return handle;
                }
            }
            throw new Error('This should not be reached');
        };
        ExtHostTreeView.prototype.getLightIconPath = function (extensionTreeItem) {
            if (extensionTreeItem.iconPath) {
                if (typeof extensionTreeItem.iconPath === 'string' || extensionTreeItem.iconPath instanceof uri_1.default) {
                    return this.getIconPath(extensionTreeItem.iconPath);
                }
                return this.getIconPath(extensionTreeItem.iconPath['light']);
            }
            return void 0;
        };
        ExtHostTreeView.prototype.getDarkIconPath = function (extensionTreeItem) {
            if (extensionTreeItem.iconPath && extensionTreeItem.iconPath['dark']) {
                return this.getIconPath(extensionTreeItem.iconPath['dark']);
            }
            return void 0;
        };
        ExtHostTreeView.prototype.getIconPath = function (iconPath) {
            if (iconPath instanceof uri_1.default) {
                return iconPath.toString();
            }
            return uri_1.default.file(iconPath).toString();
        };
        ExtHostTreeView.prototype.getChildrenHandles = function (parentHandle) {
            return parentHandle ? this.nodes.get(this.getExtensionElement(parentHandle)).childrenHandles : this.rootHandles;
        };
        ExtHostTreeView.prototype.update = function (element, handle, parentHandle) {
            var node = this.nodes.get(element);
            var childrenHandles = this.getChildrenHandles(parentHandle);
            // Update parent node
            if (node) {
                if (node.handle !== handle) {
                    // Remove the old handle from the system
                    this.elements.delete(node.handle);
                    childrenHandles[childrenHandles.indexOf(node.handle)] = handle;
                    this.clearChildren(element);
                }
            }
            else {
                childrenHandles.push(handle);
            }
            // Update element maps
            this.elements.set(handle, element);
            this.nodes.set(element, {
                handle: handle,
                parentHandle: parentHandle,
                childrenHandles: node ? node.childrenHandles : []
            });
        };
        ExtHostTreeView.prototype.clearChildren = function (parentElement) {
            if (parentElement) {
                var node = this.nodes.get(parentElement);
                if (node.childrenHandles) {
                    for (var _i = 0, _a = node.childrenHandles; _i < _a.length; _i++) {
                        var childHandle = _a[_i];
                        var childEleement = this.elements.get(childHandle);
                        if (childEleement) {
                            this.clear(childEleement);
                        }
                    }
                }
                node.childrenHandles = [];
            }
            else {
                this.clearAll();
            }
        };
        ExtHostTreeView.prototype.clear = function (element) {
            var node = this.nodes.get(element);
            if (node.childrenHandles) {
                for (var _i = 0, _a = node.childrenHandles; _i < _a.length; _i++) {
                    var childHandle = _a[_i];
                    var childEleement = this.elements.get(childHandle);
                    if (childEleement) {
                        this.clear(childEleement);
                    }
                }
            }
            this.nodes.delete(element);
            this.elements.delete(node.handle);
        };
        ExtHostTreeView.prototype.clearAll = function () {
            this.rootHandles = [];
            this.elements.clear();
            this.nodes.clear();
        };
        ExtHostTreeView.prototype.dispose = function () {
            this.clearAll();
        };
        ExtHostTreeView.LABEL_HANDLE_PREFIX = '0';
        ExtHostTreeView.ID_HANDLE_PREFIX = '1';
        return ExtHostTreeView;
    }(lifecycle_1.Disposable));
});
