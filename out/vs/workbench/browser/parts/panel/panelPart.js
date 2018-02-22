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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/browser/builder", "vs/platform/registry/common/platform", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/compositePart", "vs/workbench/browser/panel", "vs/workbench/services/part/common/partService", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/platform/message/common/message", "vs/platform/telemetry/common/telemetry", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/panel/panelActions", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/parts/compositebar/compositeBar", "vs/workbench/browser/parts/compositebar/compositeBarActions", "vs/base/browser/mouseEvent", "vs/base/common/lifecycle", "vs/css!./media/panelpart"], function (require, exports, winjs_base_1, builder_1, platform_1, actionbar_1, compositePart_1, panel_1, partService_1, storage_1, contextView_1, message_1, telemetry_1, keybinding_1, instantiation_1, panelActions_1, themeService_1, theme_1, colorRegistry_1, compositeBar_1, compositeBarActions_1, mouseEvent_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PanelPart = /** @class */ (function (_super) {
        __extends(PanelPart, _super);
        function PanelPart(id, messageService, storageService, telemetryService, contextMenuService, partService, keybindingService, instantiationService, themeService) {
            var _this = _super.call(this, messageService, storageService, telemetryService, contextMenuService, partService, keybindingService, instantiationService, themeService, platform_1.Registry.as(panel_1.Extensions.Panels), PanelPart.activePanelSettingsKey, platform_1.Registry.as(panel_1.Extensions.Panels).getDefaultPanelId(), 'panel', 'panel', null, id, { hasTitle: true }) || this;
            _this.toolbarWidth = new Map();
            _this.compositeBar = _this.instantiationService.createInstance(compositeBar_1.CompositeBar, {
                icon: false,
                storageId: PanelPart.PINNED_PANELS,
                orientation: actionbar_1.ActionsOrientation.HORIZONTAL,
                composites: _this.getPanels(),
                openComposite: function (compositeId) { return _this.openPanel(compositeId, true); },
                getActivityAction: function (compositeId) { return _this.instantiationService.createInstance(panelActions_1.PanelActivityAction, _this.getPanel(compositeId)); },
                getCompositePinnedAction: function (compositeId) { return new compositeBarActions_1.ToggleCompositePinnedAction(_this.getPanel(compositeId), _this.compositeBar); },
                getOnCompositeClickAction: function (compositeId) { return _this.instantiationService.createInstance(panelActions_1.PanelActivityAction, _this.getPanel(compositeId)); },
                getDefaultCompositeId: function () { return platform_1.Registry.as(panel_1.Extensions.Panels).getDefaultPanelId(); },
                hidePart: function () { return _this.partService.setPanelHidden(true); },
                overflowActionSize: 44,
                colors: {
                    backgroundColor: theme_1.PANEL_BACKGROUND,
                    badgeBackground: colorRegistry_1.badgeBackground,
                    badgeForeground: colorRegistry_1.badgeForeground,
                    dragAndDropBackground: theme_1.PANEL_DRAG_AND_DROP_BACKGROUND
                }
            });
            _this.toUnbind.push(_this.compositeBar);
            _this.registerListeners();
            return _this;
        }
        PanelPart.prototype.registerListeners = function () {
            var _this = this;
            // Activate panel action on opening of a panel
            this.toUnbind.push(this.onDidPanelOpen(function (panel) {
                _this.compositeBar.activateComposite(panel.getId());
                // Need to relayout composite bar since different panels have different action bar width
                _this.layoutCompositeBar();
            }));
            // Deactivate panel action on close
            this.toUnbind.push(this.onDidPanelClose(function (panel) { return _this.compositeBar.deactivateComposite(panel.getId()); }));
            this.toUnbind.push(this.compositeBar.onDidContextMenu(function (e) { return _this.showContextMenu(e); }));
        };
        Object.defineProperty(PanelPart.prototype, "onDidPanelOpen", {
            get: function () {
                return this._onDidCompositeOpen.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PanelPart.prototype, "onDidPanelClose", {
            get: function () {
                return this._onDidCompositeClose.event;
            },
            enumerable: true,
            configurable: true
        });
        PanelPart.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            var container = this.getContainer();
            container.style('background-color', this.getColor(theme_1.PANEL_BACKGROUND));
            container.style('border-left-color', this.getColor(theme_1.PANEL_BORDER) || this.getColor(colorRegistry_1.contrastBorder));
            var title = this.getTitleArea();
            title.style('border-top-color', this.getColor(theme_1.PANEL_BORDER) || this.getColor(colorRegistry_1.contrastBorder));
        };
        PanelPart.prototype.openPanel = function (id, focus) {
            var _this = this;
            if (this.blockOpeningPanel) {
                return winjs_base_1.TPromise.as(null); // Workaround against a potential race condition
            }
            // First check if panel is hidden and show if so
            var promise = winjs_base_1.TPromise.wrap(null);
            if (!this.partService.isVisible(partService_1.Parts.PANEL_PART)) {
                try {
                    this.blockOpeningPanel = true;
                    promise = this.partService.setPanelHidden(false);
                }
                finally {
                    this.blockOpeningPanel = false;
                }
            }
            return promise.then(function () { return _this.openComposite(id, focus); });
        };
        PanelPart.prototype.showActivity = function (panelId, badge, clazz) {
            return this.compositeBar.showActivity(panelId, badge, clazz);
        };
        PanelPart.prototype.getPanel = function (panelId) {
            return platform_1.Registry.as(panel_1.Extensions.Panels).getPanels().filter(function (p) { return p.id === panelId; }).pop();
        };
        PanelPart.prototype.showContextMenu = function (e) {
            var _this = this;
            var event = new mouseEvent_1.StandardMouseEvent(e);
            var actions = this.getPanels().map(function (panel) { return _this.instantiationService.createInstance(compositeBarActions_1.ToggleCompositePinnedAction, panel, _this.compositeBar); });
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return { x: event.posx, y: event.posy }; },
                getActions: function () { return winjs_base_1.TPromise.as(actions); },
                onHide: function () { return lifecycle_1.dispose(actions); }
            });
        };
        PanelPart.prototype.getPanels = function () {
            return platform_1.Registry.as(panel_1.Extensions.Panels).getPanels()
                .sort(function (v1, v2) { return v1.order - v2.order; });
        };
        PanelPart.prototype.getActions = function () {
            return [
                this.instantiationService.createInstance(panelActions_1.ToggleMaximizedPanelAction, panelActions_1.ToggleMaximizedPanelAction.ID, panelActions_1.ToggleMaximizedPanelAction.LABEL),
                this.instantiationService.createInstance(panelActions_1.TogglePanelPositionAction, panelActions_1.TogglePanelPositionAction.ID, panelActions_1.TogglePanelPositionAction.LABEL),
                this.instantiationService.createInstance(panelActions_1.ClosePanelAction, panelActions_1.ClosePanelAction.ID, panelActions_1.ClosePanelAction.LABEL)
            ];
        };
        PanelPart.prototype.getActivePanel = function () {
            return this.getActiveComposite();
        };
        PanelPart.prototype.getLastActivePanelId = function () {
            return this.getLastActiveCompositetId();
        };
        PanelPart.prototype.hideActivePanel = function () {
            return this.hideActiveComposite().then(function (composite) { return void 0; });
        };
        PanelPart.prototype.createTitleLabel = function (parent) {
            var _this = this;
            var titleArea = this.compositeBar.create(parent.getHTMLElement());
            titleArea.classList.add('panel-switcher-container');
            return {
                updateTitle: function (id, title, keybinding) {
                    var action = _this.compositeBar.getAction(id);
                    if (action) {
                        action.label = title;
                    }
                },
                updateStyles: function () {
                    // Handled via theming participant
                }
            };
        };
        PanelPart.prototype.layout = function (dimension) {
            if (!this.partService.isVisible(partService_1.Parts.PANEL_PART)) {
                return [dimension];
            }
            if (this.partService.getPanelPosition() === partService_1.Position.RIGHT) {
                // Take into account the 1px border when layouting
                this.dimension = new builder_1.Dimension(dimension.width - 1, dimension.height);
            }
            else {
                this.dimension = dimension;
            }
            var sizes = _super.prototype.layout.call(this, this.dimension);
            this.layoutCompositeBar();
            return sizes;
        };
        PanelPart.prototype.layoutCompositeBar = function () {
            if (this.dimension) {
                var availableWidth = this.dimension.width - 40; // take padding into account
                if (this.toolBar) {
                    // adjust height for global actions showing
                    availableWidth = Math.max(PanelPart.MIN_COMPOSITE_BAR_WIDTH, availableWidth - this.getToolbarWidth());
                }
                this.compositeBar.layout(new builder_1.Dimension(availableWidth, this.dimension.height));
            }
        };
        PanelPart.prototype.getToolbarWidth = function () {
            var activePanel = this.getActivePanel();
            if (!activePanel) {
                return 0;
            }
            if (!this.toolbarWidth.has(activePanel.getId())) {
                this.toolbarWidth.set(activePanel.getId(), this.toolBar.getContainer().getHTMLElement().offsetWidth);
            }
            return this.toolbarWidth.get(activePanel.getId());
        };
        PanelPart.activePanelSettingsKey = 'workbench.panelpart.activepanelid';
        PanelPart.PINNED_PANELS = 'workbench.panel.pinnedPanels';
        PanelPart.MIN_COMPOSITE_BAR_WIDTH = 50;
        PanelPart = __decorate([
            __param(1, message_1.IMessageService),
            __param(2, storage_1.IStorageService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, contextView_1.IContextMenuService),
            __param(5, partService_1.IPartService),
            __param(6, keybinding_1.IKeybindingService),
            __param(7, instantiation_1.IInstantiationService),
            __param(8, themeService_1.IThemeService)
        ], PanelPart);
        return PanelPart;
    }(compositePart_1.CompositePart));
    exports.PanelPart = PanelPart;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        // Panel Background: since panels can host editors, we apply a background rule if the panel background
        // color is different from the editor background color. This is a bit of a hack though. The better way
        // would be to have a way to push the background color onto each editor widget itself somehow.
        var panelBackground = theme.getColor(theme_1.PANEL_BACKGROUND);
        if (panelBackground && panelBackground !== theme.getColor(colorRegistry_1.editorBackground)) {
            collector.addRule("\n\t\t\t.monaco-workbench > .part.panel > .content .monaco-editor,\n\t\t\t.monaco-workbench > .part.panel > .content .monaco-editor .margin,\n\t\t\t.monaco-workbench > .part.panel > .content .monaco-editor .monaco-editor-background {\n\t\t\t\tbackground-color: " + panelBackground + ";\n\t\t\t}\n\t\t");
        }
        // Title Active
        var titleActive = theme.getColor(theme_1.PANEL_ACTIVE_TITLE_FOREGROUND);
        var titleActiveBorder = theme.getColor(theme_1.PANEL_ACTIVE_TITLE_BORDER);
        if (titleActive || titleActiveBorder) {
            collector.addRule("\n\t\t\t.monaco-workbench > .part.panel > .title > .panel-switcher-container > .monaco-action-bar .action-item:hover .action-label,\n\t\t\t.monaco-workbench > .part.panel > .title > .panel-switcher-container > .monaco-action-bar .action-item.checked .action-label {\n\t\t\t\tcolor: " + titleActive + ";\n\t\t\t\tborder-bottom-color: " + titleActiveBorder + ";\n\t\t\t}\n\t\t");
        }
        // Title Inactive
        var titleInactive = theme.getColor(theme_1.PANEL_INACTIVE_TITLE_FOREGROUND);
        if (titleInactive) {
            collector.addRule("\n\t\t\t.monaco-workbench > .part.panel > .title > .panel-switcher-container > .monaco-action-bar .action-item .action-label {\n\t\t\t\tcolor: " + titleInactive + ";\n\t\t\t}\n\t\t");
        }
        // Title focus
        var focusBorderColor = theme.getColor(colorRegistry_1.focusBorder);
        if (focusBorderColor) {
            collector.addRule("\n\t\t\t.monaco-workbench > .part.panel > .title > .panel-switcher-container > .monaco-action-bar .action-item:focus .action-label {\n\t\t\t\tcolor: " + titleActive + ";\n\t\t\t\tborder-bottom-color: " + focusBorderColor + " !important;\n\t\t\t\tborder-bottom: 1px solid;\n\t\t\t}\n\t\t\t");
            collector.addRule("\n\t\t\t.monaco-workbench > .part.panel > .title > .panel-switcher-container > .monaco-action-bar .action-item:focus {\n\t\t\t\toutline: none;\n\t\t\t}\n\t\t\t");
        }
        // Styling with Outline color (e.g. high contrast theme)
        var outline = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (outline) {
            var outline_1 = theme.getColor(colorRegistry_1.activeContrastBorder);
            collector.addRule("\n\t\t\t.monaco-workbench > .part.panel > .title > .panel-switcher-container > .monaco-action-bar .action-item.checked .action-label,\n\t\t\t.monaco-workbench > .part.panel > .title > .panel-switcher-container > .monaco-action-bar .action-item .action-label:hover {\n\t\t\t\toutline-color: " + outline_1 + ";\n\t\t\t\toutline-width: 1px;\n\t\t\t\toutline-style: solid;\n\t\t\t\tborder-bottom: none;\n\t\t\t\tpadding-bottom: 0;\n\t\t\t\toutline-offset: 1px;\n\t\t\t}\n\n\t\t\t.monaco-workbench > .part.panel > .title > .panel-switcher-container > .monaco-action-bar .action-item:not(.checked) .action-label:hover {\n\t\t\t\toutline-style: dashed;\n\t\t\t}\n\t\t");
        }
    });
});
