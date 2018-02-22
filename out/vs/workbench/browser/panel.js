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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/registry/common/platform", "vs/workbench/browser/composite", "vs/base/common/actions"], function (require, exports, DOM, platform_1, composite_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Panel = /** @class */ (function (_super) {
        __extends(Panel, _super);
        function Panel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Panel;
    }(composite_1.Composite));
    exports.Panel = Panel;
    /**
     * A panel descriptor is a leightweight descriptor of a panel in the workbench.
     */
    var PanelDescriptor = /** @class */ (function (_super) {
        __extends(PanelDescriptor, _super);
        function PanelDescriptor(ctor, id, name, cssClass, order, _commandId) {
            return _super.call(this, ctor, id, name, cssClass, order, _commandId) || this;
        }
        return PanelDescriptor;
    }(composite_1.CompositeDescriptor));
    exports.PanelDescriptor = PanelDescriptor;
    var PanelRegistry = /** @class */ (function (_super) {
        __extends(PanelRegistry, _super);
        function PanelRegistry() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Registers a panel to the platform.
         */
        PanelRegistry.prototype.registerPanel = function (descriptor) {
            _super.prototype.registerComposite.call(this, descriptor);
        };
        /**
         * Returns an array of registered panels known to the platform.
         */
        PanelRegistry.prototype.getPanels = function () {
            return this.getComposites();
        };
        /**
         * Sets the id of the panel that should open on startup by default.
         */
        PanelRegistry.prototype.setDefaultPanelId = function (id) {
            this.defaultPanelId = id;
        };
        /**
         * Gets the id of the panel that should open on startup by default.
         */
        PanelRegistry.prototype.getDefaultPanelId = function () {
            return this.defaultPanelId;
        };
        return PanelRegistry;
    }(composite_1.CompositeRegistry));
    exports.PanelRegistry = PanelRegistry;
    /**
     * A reusable action to toggle a panel with a specific id.
     */
    var TogglePanelAction = /** @class */ (function (_super) {
        __extends(TogglePanelAction, _super);
        function TogglePanelAction(id, label, panelId, panelService, partService, cssClass) {
            var _this = _super.call(this, id, label, cssClass) || this;
            _this.panelService = panelService;
            _this.partService = partService;
            _this.panelId = panelId;
            return _this;
        }
        TogglePanelAction.prototype.run = function () {
            if (this.isPanelShowing()) {
                return this.partService.setPanelHidden(true);
            }
            return this.panelService.openPanel(this.panelId, true);
        };
        TogglePanelAction.prototype.isPanelShowing = function () {
            var panel = this.panelService.getActivePanel();
            return panel && panel.getId() === this.panelId;
        };
        TogglePanelAction.prototype.isPanelFocused = function () {
            var activePanel = this.panelService.getActivePanel();
            var activeElement = document.activeElement;
            return activePanel && activeElement && DOM.isAncestor(activeElement, activePanel.getContainer().getHTMLElement());
        };
        return TogglePanelAction;
    }(actions_1.Action));
    exports.TogglePanelAction = TogglePanelAction;
    exports.Extensions = {
        Panels: 'workbench.contributions.panels'
    };
    platform_1.Registry.add(exports.Extensions.Panels, new PanelRegistry());
});
