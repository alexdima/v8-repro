/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/nls", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, nls_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ViewLocation = /** @class */ (function () {
        function ViewLocation(_id) {
            this._id = _id;
        }
        Object.defineProperty(ViewLocation.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        ViewLocation.getContributedViewLocation = function (value) {
            switch (value) {
                case ViewLocation.Explorer.id: return ViewLocation.Explorer;
                case ViewLocation.Debug.id: return ViewLocation.Debug;
            }
            return void 0;
        };
        ViewLocation.Explorer = new ViewLocation('explorer');
        ViewLocation.Debug = new ViewLocation('debug');
        ViewLocation.Extensions = new ViewLocation('extensions');
        return ViewLocation;
    }());
    exports.ViewLocation = ViewLocation;
    exports.ViewsRegistry = new /** @class */ (function () {
        function class_1() {
            this._onViewsRegistered = new event_1.Emitter();
            this.onViewsRegistered = this._onViewsRegistered.event;
            this._onViewsDeregistered = new event_1.Emitter();
            this.onViewsDeregistered = this._onViewsDeregistered.event;
            this._viewLocations = [];
            this._views = new Map();
        }
        class_1.prototype.registerViews = function (viewDescriptors) {
            if (viewDescriptors.length) {
                var _loop_1 = function (viewDescriptor) {
                    var views = this_1._views.get(viewDescriptor.location);
                    if (!views) {
                        views = [];
                        this_1._views.set(viewDescriptor.location, views);
                        this_1._viewLocations.push(viewDescriptor.location);
                    }
                    if (views.some(function (v) { return v.id === viewDescriptor.id; })) {
                        throw new Error(nls_1.localize('duplicateId', "A view with id `{0}` is already registered in the location `{1}`", viewDescriptor.id, viewDescriptor.location.id));
                    }
                    views.push(viewDescriptor);
                };
                var this_1 = this;
                for (var _i = 0, viewDescriptors_1 = viewDescriptors; _i < viewDescriptors_1.length; _i++) {
                    var viewDescriptor = viewDescriptors_1[_i];
                    _loop_1(viewDescriptor);
                }
                this._onViewsRegistered.fire(viewDescriptors);
            }
        };
        class_1.prototype.deregisterViews = function (ids, location) {
            var views = this._views.get(location);
            if (!views) {
                return;
            }
            var viewsToDeregister = views.filter(function (view) { return ids.indexOf(view.id) !== -1; });
            if (viewsToDeregister.length) {
                var remaningViews = views.filter(function (view) { return ids.indexOf(view.id) === -1; });
                if (remaningViews.length) {
                    this._views.set(location, remaningViews);
                }
                else {
                    this._views.delete(location);
                    this._viewLocations.splice(this._viewLocations.indexOf(location), 1);
                }
            }
            this._onViewsDeregistered.fire(viewsToDeregister);
        };
        class_1.prototype.getViews = function (loc) {
            return this._views.get(loc) || [];
        };
        class_1.prototype.getAllViews = function () {
            var result = [];
            this._views.forEach(function (views) { return result.push.apply(result, views); });
            return result;
        };
        class_1.prototype.getView = function (id) {
            for (var _i = 0, _a = this._viewLocations; _i < _a.length; _i++) {
                var viewLocation = _a[_i];
                var viewDescriptor = (this._views.get(viewLocation) || []).filter(function (v) { return v.id === id; })[0];
                if (viewDescriptor) {
                    return viewDescriptor;
                }
            }
            return null;
        };
        return class_1;
    }());
    exports.ICustomViewsService = instantiation_1.createDecorator('customViewsService');
    var TreeItemCollapsibleState;
    (function (TreeItemCollapsibleState) {
        TreeItemCollapsibleState[TreeItemCollapsibleState["None"] = 0] = "None";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Collapsed"] = 1] = "Collapsed";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Expanded"] = 2] = "Expanded";
    })(TreeItemCollapsibleState = exports.TreeItemCollapsibleState || (exports.TreeItemCollapsibleState = {}));
});
