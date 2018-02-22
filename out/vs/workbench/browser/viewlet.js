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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/browser/dom", "vs/platform/registry/common/platform", "vs/base/common/actions", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/composite"], function (require, exports, nls, winjs_base_1, DOM, platform_1, actions_1, viewlet_1, editorService_1, composite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Viewlet = /** @class */ (function (_super) {
        __extends(Viewlet, _super);
        function Viewlet() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Viewlet.prototype.getOptimalWidth = function () {
            return null;
        };
        return Viewlet;
    }(composite_1.Composite));
    exports.Viewlet = Viewlet;
    /**
     * A viewlet descriptor is a leightweight descriptor of a viewlet in the workbench.
     */
    var ViewletDescriptor = /** @class */ (function (_super) {
        __extends(ViewletDescriptor, _super);
        function ViewletDescriptor(ctor, id, name, cssClass, order, _extensionId) {
            var _this = _super.call(this, ctor, id, name, cssClass, order, id) || this;
            _this._extensionId = _extensionId;
            return _this;
        }
        Object.defineProperty(ViewletDescriptor.prototype, "extensionId", {
            get: function () {
                return this._extensionId;
            },
            enumerable: true,
            configurable: true
        });
        return ViewletDescriptor;
    }(composite_1.CompositeDescriptor));
    exports.ViewletDescriptor = ViewletDescriptor;
    exports.Extensions = {
        Viewlets: 'workbench.contributions.viewlets'
    };
    var ViewletRegistry = /** @class */ (function (_super) {
        __extends(ViewletRegistry, _super);
        function ViewletRegistry() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Registers a viewlet to the platform.
         */
        ViewletRegistry.prototype.registerViewlet = function (descriptor) {
            _super.prototype.registerComposite.call(this, descriptor);
        };
        /**
         * Returns the viewlet descriptor for the given id or null if none.
         */
        ViewletRegistry.prototype.getViewlet = function (id) {
            return this.getComposite(id);
        };
        /**
         * Returns an array of registered viewlets known to the platform.
         */
        ViewletRegistry.prototype.getViewlets = function () {
            return this.getComposites();
        };
        /**
         * Sets the id of the viewlet that should open on startup by default.
         */
        ViewletRegistry.prototype.setDefaultViewletId = function (id) {
            this.defaultViewletId = id;
        };
        /**
         * Gets the id of the viewlet that should open on startup by default.
         */
        ViewletRegistry.prototype.getDefaultViewletId = function () {
            return this.defaultViewletId;
        };
        return ViewletRegistry;
    }(composite_1.CompositeRegistry));
    exports.ViewletRegistry = ViewletRegistry;
    platform_1.Registry.add(exports.Extensions.Viewlets, new ViewletRegistry());
    /**
     * A reusable action to toggle a viewlet with a specific id.
     */
    var ToggleViewletAction = /** @class */ (function (_super) {
        __extends(ToggleViewletAction, _super);
        function ToggleViewletAction(id, name, viewletId, viewletService, editorService) {
            var _this = _super.call(this, id, name) || this;
            _this.viewletService = viewletService;
            _this.editorService = editorService;
            _this.viewletId = viewletId;
            _this.enabled = !!_this.viewletService && !!_this.editorService;
            return _this;
        }
        ToggleViewletAction.prototype.run = function () {
            // Pass focus to viewlet if not open or focused
            if (this.otherViewletShowing() || !this.sidebarHasFocus()) {
                return this.viewletService.openViewlet(this.viewletId, true);
            }
            // Otherwise pass focus to editor if possible
            var editor = this.editorService.getActiveEditor();
            if (editor) {
                editor.focus();
            }
            return winjs_base_1.TPromise.as(true);
        };
        ToggleViewletAction.prototype.otherViewletShowing = function () {
            var activeViewlet = this.viewletService.getActiveViewlet();
            return !activeViewlet || activeViewlet.getId() !== this.viewletId;
        };
        ToggleViewletAction.prototype.sidebarHasFocus = function () {
            var activeViewlet = this.viewletService.getActiveViewlet();
            var activeElement = document.activeElement;
            return activeViewlet && activeElement && DOM.isAncestor(activeElement, activeViewlet.getContainer().getHTMLElement());
        };
        ToggleViewletAction = __decorate([
            __param(3, viewlet_1.IViewletService),
            __param(4, editorService_1.IWorkbenchEditorService)
        ], ToggleViewletAction);
        return ToggleViewletAction;
    }(actions_1.Action));
    exports.ToggleViewletAction = ToggleViewletAction;
    // Collapse All action
    var CollapseAction = /** @class */ (function (_super) {
        __extends(CollapseAction, _super);
        function CollapseAction(viewer, enabled, clazz) {
            return _super.call(this, 'workbench.action.collapse', nls.localize('collapse', "Collapse All"), clazz, enabled, function (context) {
                if (viewer.getHighlight()) {
                    return winjs_base_1.TPromise.as(null); // Global action disabled if user is in edit mode from another action
                }
                viewer.collapseAll();
                viewer.clearSelection();
                viewer.clearFocus();
                viewer.DOMFocus();
                viewer.focusFirst();
                return winjs_base_1.TPromise.as(null);
            }) || this;
        }
        return CollapseAction;
    }(actions_1.Action));
    exports.CollapseAction = CollapseAction;
});
