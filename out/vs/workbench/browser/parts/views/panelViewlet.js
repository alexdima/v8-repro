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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/event", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/styler", "vs/workbench/common/theme", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/registry/common/platform", "vs/workbench/browser/actions", "vs/workbench/browser/viewlet", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/base/browser/ui/splitview/panelview", "vs/platform/configuration/common/configuration", "vs/css!./media/panelviewlet"], function (require, exports, nls, winjs_base_1, event_1, colorRegistry_1, styler_1, theme_1, dom_1, lifecycle_1, arrays_1, actionbar_1, platform_1, actions_1, viewlet_1, toolbar_1, keybinding_1, contextView_1, telemetry_1, themeService_1, panelview_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function attachPanelStyler(widget, themeService) {
        return styler_1.attachStyler(themeService, {
            headerForeground: theme_1.SIDE_BAR_SECTION_HEADER_FOREGROUND,
            headerBackground: theme_1.SIDE_BAR_SECTION_HEADER_BACKGROUND,
            headerHighContrastBorder: colorRegistry_1.contrastBorder,
            dropBackground: theme_1.SIDE_BAR_DRAG_AND_DROP_BACKGROUND
        }, widget);
    }
    exports.attachPanelStyler = attachPanelStyler;
    var ViewletPanel = /** @class */ (function (_super) {
        __extends(ViewletPanel, _super);
        function ViewletPanel(title, options, keybindingService, contextMenuService, configurationService) {
            var _this = _super.call(this, options) || this;
            _this.title = title;
            _this.keybindingService = keybindingService;
            _this.contextMenuService = contextMenuService;
            _this.configurationService = configurationService;
            _this._onDidFocus = new event_1.Emitter();
            _this.onDidFocus = _this._onDidFocus.event;
            _this.actionRunner = options.actionRunner;
            return _this;
        }
        ViewletPanel.prototype.render = function (container) {
            var _this = this;
            _super.prototype.render.call(this, container);
            var focusTracker = dom_1.trackFocus(container);
            this.disposables.push(focusTracker);
            this.disposables.push(focusTracker.onDidFocus(function () { return _this._onDidFocus.fire(); }));
        };
        ViewletPanel.prototype.renderHeader = function (container) {
            var _this = this;
            this.headerContainer = container;
            this.renderHeaderTitle(container);
            var actions = dom_1.append(container, dom_1.$('.actions'));
            this.toolbar = new toolbar_1.ToolBar(actions, this.contextMenuService, {
                orientation: actionbar_1.ActionsOrientation.HORIZONTAL,
                actionItemProvider: function (action) { return _this.getActionItem(action); },
                ariaLabel: nls.localize('viewToolbarAriaLabel', "{0} actions", this.title),
                getKeyBinding: function (action) { return _this.keybindingService.lookupKeybinding(action.id); },
                actionRunner: this.actionRunner
            });
            this.disposables.push(this.toolbar);
            this.updateActions();
            var onDidRelevantConfigurationChange = event_1.filterEvent(this.configurationService.onDidChangeConfiguration, function (e) { return e.affectsConfiguration(ViewletPanel.AlwaysShowActionsConfig); });
            onDidRelevantConfigurationChange(this.updateActionsVisibility, this, this.disposables);
            this.updateActionsVisibility();
        };
        ViewletPanel.prototype.renderHeaderTitle = function (container) {
            dom_1.append(container, dom_1.$('.title', null, this.title));
        };
        ViewletPanel.prototype.focus = function () {
            this._onDidFocus.fire();
        };
        ViewletPanel.prototype.updateActions = function () {
            this.toolbar.setActions(actions_1.prepareActions(this.getActions()), actions_1.prepareActions(this.getSecondaryActions()))();
            this.toolbar.context = this.getActionsContext();
        };
        ViewletPanel.prototype.updateActionsVisibility = function () {
            var shouldAlwaysShowActions = this.configurationService.getValue('workbench.panel.alwaysShowActions');
            dom_1.toggleClass(this.headerContainer, 'actions-always-visible', shouldAlwaysShowActions);
        };
        ViewletPanel.prototype.getActions = function () {
            return [];
        };
        ViewletPanel.prototype.getSecondaryActions = function () {
            return [];
        };
        ViewletPanel.prototype.getActionItem = function (action) {
            return null;
        };
        ViewletPanel.prototype.getActionsContext = function () {
            return undefined;
        };
        ViewletPanel.prototype.getOptimalWidth = function () {
            return 0;
        };
        ViewletPanel.AlwaysShowActionsConfig = 'workbench.panel.alwaysShowActions';
        ViewletPanel = __decorate([
            __param(2, keybinding_1.IKeybindingService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, configuration_1.IConfigurationService)
        ], ViewletPanel);
        return ViewletPanel;
    }(panelview_1.Panel));
    exports.ViewletPanel = ViewletPanel;
    var PanelViewlet = /** @class */ (function (_super) {
        __extends(PanelViewlet, _super);
        function PanelViewlet(id, options, telemetryService, themeService) {
            var _this = _super.call(this, id, telemetryService, themeService) || this;
            _this.options = options;
            _this.panelItems = [];
            return _this;
        }
        Object.defineProperty(PanelViewlet.prototype, "onDidSashChange", {
            get: function () {
                return this.panelview.onDidSashChange;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PanelViewlet.prototype, "length", {
            get: function () {
                return this.panelItems.length;
            },
            enumerable: true,
            configurable: true
        });
        PanelViewlet.prototype.create = function (parent) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _this = this;
                var container;
                return __generator(this, function (_a) {
                    _super.prototype.create.call(this, parent);
                    container = parent.getHTMLElement();
                    this.panelview = this._register(new panelview_1.PanelView(container, this.options));
                    this.panelview.onDidDrop(function (_a) {
                        var from = _a.from, to = _a.to;
                        return _this.movePanel(from, to);
                    });
                    return [2 /*return*/];
                });
            });
        };
        PanelViewlet.prototype.getTitle = function () {
            var title = platform_1.Registry.as(viewlet_1.Extensions.Viewlets).getViewlet(this.getId()).name;
            if (this.isSingleView()) {
                title += ': ' + this.panelItems[0].panel.title;
            }
            return title;
        };
        PanelViewlet.prototype.getActions = function () {
            if (this.isSingleView()) {
                return this.panelItems[0].panel.getActions();
            }
            return [];
        };
        PanelViewlet.prototype.getSecondaryActions = function () {
            if (this.isSingleView()) {
                return this.panelItems[0].panel.getSecondaryActions();
            }
            return [];
        };
        PanelViewlet.prototype.focus = function () {
            _super.prototype.focus.call(this);
            if (this.lastFocusedPanel) {
                this.lastFocusedPanel.focus();
            }
            else if (this.panelItems.length > 0) {
                for (var _i = 0, _a = this.panelItems; _i < _a.length; _i++) {
                    var panel = _a[_i].panel;
                    if (panel.isExpanded()) {
                        panel.focus();
                        return;
                    }
                }
            }
        };
        PanelViewlet.prototype.layout = function (dimension) {
            this.panelview.layout(dimension.height);
        };
        PanelViewlet.prototype.getOptimalWidth = function () {
            var sizes = this.panelItems
                .map(function (panelItem) { return panelItem.panel.getOptimalWidth() || 0; });
            return Math.max.apply(Math, sizes);
        };
        PanelViewlet.prototype.addPanel = function (panel, size, index) {
            var _this = this;
            if (index === void 0) { index = this.panelItems.length - 1; }
            var disposables = [];
            var onDidFocus = panel.onDidFocus(function () { return _this.lastFocusedPanel = panel; }, null, disposables);
            var onDidChange = panel.onDidChange(function () {
                if (panel === _this.lastFocusedPanel && !panel.isExpanded()) {
                    _this.lastFocusedPanel = undefined;
                }
            }, null, disposables);
            var styler = attachPanelStyler(panel, this.themeService);
            var disposable = lifecycle_1.combinedDisposable([onDidFocus, styler, onDidChange]);
            var panelItem = { panel: panel, disposable: disposable };
            this.panelItems.splice(index, 0, panelItem);
            this.panelview.addPanel(panel, size, index);
            this.updateViewHeaders();
            this.updateTitleArea();
        };
        PanelViewlet.prototype.removePanel = function (panel) {
            var index = arrays_1.firstIndex(this.panelItems, function (i) { return i.panel === panel; });
            if (index === -1) {
                return;
            }
            if (this.lastFocusedPanel === panel) {
                this.lastFocusedPanel = undefined;
            }
            this.panelview.removePanel(panel);
            var panelItem = this.panelItems.splice(index, 1)[0];
            panelItem.disposable.dispose();
            this.updateViewHeaders();
            this.updateTitleArea();
        };
        PanelViewlet.prototype.movePanel = function (from, to) {
            var fromIndex = arrays_1.firstIndex(this.panelItems, function (item) { return item.panel === from; });
            var toIndex = arrays_1.firstIndex(this.panelItems, function (item) { return item.panel === to; });
            if (fromIndex < 0 || fromIndex >= this.panelItems.length) {
                return;
            }
            if (toIndex < 0 || toIndex >= this.panelItems.length) {
                return;
            }
            var panelItem = this.panelItems.splice(fromIndex, 1)[0];
            this.panelItems.splice(toIndex, 0, panelItem);
            this.panelview.movePanel(from, to);
        };
        PanelViewlet.prototype.resizePanel = function (panel, size) {
            this.panelview.resizePanel(panel, size);
        };
        PanelViewlet.prototype.getPanelSize = function (panel) {
            return this.panelview.getPanelSize(panel);
        };
        PanelViewlet.prototype.updateViewHeaders = function () {
            if (this.isSingleView()) {
                this.panelItems[0].panel.setExpanded(true);
                this.panelItems[0].panel.headerVisible = false;
            }
            else {
                this.panelItems.forEach(function (i) { return i.panel.headerVisible = true; });
            }
        };
        PanelViewlet.prototype.isSingleView = function () {
            return this.options.showHeaderInTitleWhenSingleView && this.panelItems.length === 1;
        };
        PanelViewlet.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.panelItems.forEach(function (i) { return i.disposable.dispose(); });
            this.panelview.dispose();
        };
        PanelViewlet = __decorate([
            __param(2, telemetry_1.ITelemetryService),
            __param(3, themeService_1.IThemeService)
        ], PanelViewlet);
        return PanelViewlet;
    }(viewlet_1.Viewlet));
    exports.PanelViewlet = PanelViewlet;
});
