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
define(["require", "exports", "vs/base/common/event", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "../node/extHost.protocol", "vs/platform/message/common/message", "vs/workbench/common/views", "vs/workbench/api/electron-browser/extHostCustomers", "vs/base/common/arrays"], function (require, exports, event_1, winjs_base_1, lifecycle_1, extHost_protocol_1, message_1, views_1, extHostCustomers_1, arrays_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadTreeViews = /** @class */ (function (_super) {
        __extends(MainThreadTreeViews, _super);
        function MainThreadTreeViews(extHostContext, viewsService, messageService) {
            var _this = _super.call(this) || this;
            _this.viewsService = viewsService;
            _this.messageService = messageService;
            _this._dataProviders = new Map();
            _this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTreeViews);
            return _this;
        }
        MainThreadTreeViews.prototype.$registerTreeViewDataProvider = function (treeViewId) {
            var dataProvider = this._register(new TreeViewDataProvider(treeViewId, this._proxy, this.messageService));
            this._dataProviders.set(treeViewId, dataProvider);
            this.viewsService.getTreeViewer(treeViewId).dataProvider = dataProvider;
        };
        MainThreadTreeViews.prototype.$refresh = function (treeViewId, itemsToRefresh) {
            var dataProvider = this._dataProviders.get(treeViewId);
            if (dataProvider) {
                dataProvider.refresh(itemsToRefresh);
            }
        };
        MainThreadTreeViews.prototype.dispose = function () {
            this._dataProviders.clear();
            _super.prototype.dispose.call(this);
        };
        MainThreadTreeViews = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadTreeViews),
            __param(1, views_1.ICustomViewsService),
            __param(2, message_1.IMessageService)
        ], MainThreadTreeViews);
        return MainThreadTreeViews;
    }(lifecycle_1.Disposable));
    exports.MainThreadTreeViews = MainThreadTreeViews;
    var TreeViewDataProvider = /** @class */ (function () {
        function TreeViewDataProvider(treeViewId, _proxy, messageService) {
            this.treeViewId = treeViewId;
            this._proxy = _proxy;
            this.messageService = messageService;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._onDispose = new event_1.Emitter();
            this.onDispose = this._onDispose.event;
            this.itemsMap = new Map();
        }
        TreeViewDataProvider.prototype.getChildren = function (treeItem) {
            var _this = this;
            if (treeItem && treeItem.children) {
                return winjs_base_1.TPromise.as(treeItem.children);
            }
            return this._proxy.$getChildren(this.treeViewId, treeItem ? treeItem.handle : void 0)
                .then(function (children) {
                return _this.postGetChildren(children);
            }, function (err) {
                _this.messageService.show(message_1.Severity.Error, err);
                return [];
            });
        };
        TreeViewDataProvider.prototype.refresh = function (itemsToRefreshByHandle) {
            if (itemsToRefreshByHandle) {
                var itemsToRefresh = [];
                for (var _i = 0, _a = Object.keys(itemsToRefreshByHandle); _i < _a.length; _i++) {
                    var treeItemHandle = _a[_i];
                    var currentTreeItem = this.itemsMap.get(treeItemHandle);
                    if (currentTreeItem) {
                        var treeItem = itemsToRefreshByHandle[treeItemHandle];
                        // Update the current item with refreshed item
                        this.updateTreeItem(currentTreeItem, treeItem);
                        if (treeItemHandle === treeItem.handle) {
                            itemsToRefresh.push(currentTreeItem);
                        }
                        else {
                            // Update maps when handle is changed and refresh parent
                            this.itemsMap.delete(treeItemHandle);
                            this.itemsMap.set(currentTreeItem.handle, currentTreeItem);
                            itemsToRefresh.push(this.itemsMap.get(treeItem.parentHandle));
                        }
                    }
                    if (itemsToRefresh.length) {
                        this._onDidChange.fire(itemsToRefresh);
                    }
                }
            }
            else {
                this._onDidChange.fire();
            }
        };
        TreeViewDataProvider.prototype.postGetChildren = function (elements) {
            var result = [];
            if (elements) {
                for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                    var element = elements_1[_i];
                    this.itemsMap.set(element.handle, element);
                    result.push(element);
                }
            }
            return result;
        };
        TreeViewDataProvider.prototype.updateTreeItem = function (current, treeItem) {
            treeItem.children = treeItem.children ? treeItem.children : null;
            if (current) {
                var properties = arrays_1.distinct(Object.keys(current).concat(Object.keys(treeItem)));
                for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
                    var property = properties_1[_i];
                    current[property] = treeItem[property];
                }
            }
        };
        TreeViewDataProvider.prototype.dispose = function () {
            this._onDispose.fire();
        };
        return TreeViewDataProvider;
    }());
});
