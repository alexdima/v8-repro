var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/platform/registry/common/platform", "vs/workbench/browser/viewlet", "vs/platform/extensions/common/extensions", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle"], function (require, exports, winjs_base_1, platform_1, viewlet_1, extensions_1, contextkey_1, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ActiveViewletContextId = 'activeViewlet';
    exports.ActiveViewletContext = new contextkey_1.RawContextKey(ActiveViewletContextId, '');
    var ViewletService = /** @class */ (function () {
        function ViewletService(sidebarPart, extensionService, contextKeyService) {
            this.extensionService = extensionService;
            this.disposables = [];
            this.sidebarPart = sidebarPart;
            this.viewletRegistry = platform_1.Registry.as(viewlet_1.Extensions.Viewlets);
            this.activeViewletContextKey = exports.ActiveViewletContext.bindTo(contextKeyService);
            this.onDidViewletOpen(this._onDidViewletOpen, this, this.disposables);
            this.onDidViewletClose(this._onDidViewletClose, this, this.disposables);
            this.loadExtensionViewlets();
        }
        Object.defineProperty(ViewletService.prototype, "onDidViewletOpen", {
            get: function () { return this.sidebarPart.onDidViewletOpen; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewletService.prototype, "onDidViewletClose", {
            get: function () { return this.sidebarPart.onDidViewletClose; },
            enumerable: true,
            configurable: true
        });
        ViewletService.prototype._onDidViewletOpen = function (viewlet) {
            this.activeViewletContextKey.set(viewlet.getId());
        };
        ViewletService.prototype._onDidViewletClose = function (viewlet) {
            var id = viewlet.getId();
            if (this.activeViewletContextKey.get() === id) {
                this.activeViewletContextKey.set('');
            }
        };
        ViewletService.prototype.loadExtensionViewlets = function () {
            var _this = this;
            this.extensionViewlets = [];
            this.extensionViewletsLoaded = new winjs_base_1.TPromise(function (c) {
                _this.extensionViewletsLoadedPromiseComplete = c;
            });
            this.extensionService.whenInstalledExtensionsRegistered().then(function () {
                var viewlets = _this.viewletRegistry.getViewlets();
                viewlets.forEach(function (v) {
                    if (!!v.extensionId) {
                        _this.extensionViewlets.push(v);
                    }
                });
                _this.extensionViewletsLoadedPromiseComplete(void 0);
            });
        };
        ViewletService.prototype.openViewlet = function (id, focus) {
            var _this = this;
            // Built in viewlets do not need to wait for extensions to be loaded
            var builtInViewletIds = this.getBuiltInViewlets().map(function (v) { return v.id; });
            var isBuiltInViewlet = builtInViewletIds.indexOf(id) !== -1;
            if (isBuiltInViewlet) {
                return this.sidebarPart.openViewlet(id, focus);
            }
            // Extension viewlets need to be loaded first which can take time
            return this.extensionViewletsLoaded.then(function () {
                if (_this.viewletRegistry.getViewlet(id)) {
                    return _this.sidebarPart.openViewlet(id, focus);
                }
                // Fallback to default viewlet if extension viewlet is still not found (e.g. uninstalled)
                return _this.sidebarPart.openViewlet(_this.getDefaultViewletId(), focus);
            });
        };
        ViewletService.prototype.getActiveViewlet = function () {
            return this.sidebarPart.getActiveViewlet();
        };
        ViewletService.prototype.getViewlets = function () {
            var builtInViewlets = this.getBuiltInViewlets();
            return builtInViewlets.concat(this.extensionViewlets);
        };
        ViewletService.prototype.getBuiltInViewlets = function () {
            return this.viewletRegistry.getViewlets()
                .filter(function (viewlet) { return !viewlet.extensionId; })
                .sort(function (v1, v2) { return v1.order - v2.order; });
        };
        ViewletService.prototype.getDefaultViewletId = function () {
            return this.viewletRegistry.getDefaultViewletId();
        };
        ViewletService.prototype.getViewlet = function (id) {
            return this.getViewlets().filter(function (viewlet) { return viewlet.id === id; })[0];
        };
        ViewletService.prototype.getProgressIndicator = function (id) {
            return this.sidebarPart.getProgressIndicator(id);
        };
        ViewletService.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        ViewletService = __decorate([
            __param(1, extensions_1.IExtensionService),
            __param(2, contextkey_1.IContextKeyService)
        ], ViewletService);
        return ViewletService;
    }());
    exports.ViewletService = ViewletService;
});
