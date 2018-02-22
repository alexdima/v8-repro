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
define(["require", "exports", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/inputbox/inputBox", "vs/platform/contextview/browser/contextView", "vs/workbench/browser/panel", "vs/workbench/parts/markers/common/messages", "vs/workbench/parts/markers/common/constants", "vs/workbench/services/part/common/partService", "vs/workbench/services/panel/common/panelService", "vs/platform/telemetry/common/telemetry", "vs/base/parts/tree/browser/treeDefaults", "vs/platform/theme/common/themeService", "vs/platform/theme/common/styler", "vs/workbench/parts/markers/common/markers"], function (require, exports, async_1, DOM, lifecycle, actions_1, actionbar_1, inputBox_1, contextView_1, panel_1, messages_1, constants_1, partService_1, panelService_1, telemetry_1, treeDefaults_1, themeService_1, styler_1, markers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ToggleMarkersPanelAction = /** @class */ (function (_super) {
        __extends(ToggleMarkersPanelAction, _super);
        function ToggleMarkersPanelAction(id, label, partService, panelService) {
            return _super.call(this, id, label, constants_1.default.MARKERS_PANEL_ID, panelService, partService) || this;
        }
        ToggleMarkersPanelAction.ID = 'workbench.actions.view.problems';
        ToggleMarkersPanelAction.LABEL = messages_1.default.MARKERS_PANEL_TOGGLE_LABEL;
        ToggleMarkersPanelAction = __decorate([
            __param(2, partService_1.IPartService),
            __param(3, panelService_1.IPanelService)
        ], ToggleMarkersPanelAction);
        return ToggleMarkersPanelAction;
    }(panel_1.TogglePanelAction));
    exports.ToggleMarkersPanelAction = ToggleMarkersPanelAction;
    var ShowProblemsPanelAction = /** @class */ (function (_super) {
        __extends(ShowProblemsPanelAction, _super);
        function ShowProblemsPanelAction(id, label, panelService) {
            var _this = _super.call(this, id, label) || this;
            _this.panelService = panelService;
            return _this;
        }
        ShowProblemsPanelAction.prototype.run = function () {
            return this.panelService.openPanel(constants_1.default.MARKERS_PANEL_ID, true);
        };
        ShowProblemsPanelAction.ID = 'workbench.action.problems.focus';
        ShowProblemsPanelAction.LABEL = messages_1.default.MARKERS_PANEL_SHOW_LABEL;
        ShowProblemsPanelAction = __decorate([
            __param(2, panelService_1.IPanelService)
        ], ShowProblemsPanelAction);
        return ShowProblemsPanelAction;
    }(actions_1.Action));
    exports.ShowProblemsPanelAction = ShowProblemsPanelAction;
    var CollapseAllAction = /** @class */ (function (_super) {
        __extends(CollapseAllAction, _super);
        function CollapseAllAction(viewer, enabled) {
            return _super.call(this, viewer, enabled) || this;
        }
        return CollapseAllAction;
    }(treeDefaults_1.CollapseAllAction));
    exports.CollapseAllAction = CollapseAllAction;
    var FilterAction = /** @class */ (function (_super) {
        __extends(FilterAction, _super);
        function FilterAction() {
            return _super.call(this, FilterAction.ID, messages_1.default.MARKERS_PANEL_ACTION_TOOLTIP_FILTER, 'markers-panel-action-filter', true) || this;
        }
        FilterAction.ID = 'workbench.actions.problems.filter';
        return FilterAction;
    }(actions_1.Action));
    exports.FilterAction = FilterAction;
    var FilterInputBoxActionItem = /** @class */ (function (_super) {
        __extends(FilterInputBoxActionItem, _super);
        function FilterInputBoxActionItem(markersPanel, action, contextViewService, themeService, markersWorkbenchService, telemetryService) {
            var _this = _super.call(this, markersPanel, action) || this;
            _this.markersPanel = markersPanel;
            _this.contextViewService = contextViewService;
            _this.themeService = themeService;
            _this.markersWorkbenchService = markersWorkbenchService;
            _this.telemetryService = telemetryService;
            _this.toDispose = [];
            _this.delayedFilterUpdate = new async_1.Delayer(500);
            return _this;
        }
        FilterInputBoxActionItem.prototype.render = function (container) {
            var _this = this;
            DOM.addClass(container, 'markers-panel-action-filter');
            var filterInputBox = new inputBox_1.InputBox(container, this.contextViewService, {
                placeholder: messages_1.default.MARKERS_PANEL_FILTER_PLACEHOLDER,
                ariaLabel: messages_1.default.MARKERS_PANEL_FILTER_PLACEHOLDER
            });
            this.toDispose.push(styler_1.attachInputBoxStyler(filterInputBox, this.themeService));
            filterInputBox.value = this.markersWorkbenchService.markersModel.filterOptions.completeFilter;
            this.toDispose.push(filterInputBox.onDidChange(function (filter) { return _this.delayedFilterUpdate.trigger(function () { return _this.updateFilter(filter); }); }));
            this.toDispose.push(DOM.addStandardDisposableListener(filterInputBox.inputElement, 'keyup', function (keyboardEvent) { return _this.onInputKeyUp(keyboardEvent, filterInputBox); }));
            this.toDispose.push(DOM.addStandardDisposableListener(container, 'keydown', this.handleKeyboardEvent));
            this.toDispose.push(DOM.addStandardDisposableListener(container, 'keyup', this.handleKeyboardEvent));
        };
        FilterInputBoxActionItem.prototype.updateFilter = function (filter) {
            this.markersPanel.updateFilter(filter);
            this.reportFilteringUsed();
        };
        FilterInputBoxActionItem.prototype.reportFilteringUsed = function () {
            var data = {};
            data['errors'] = this.markersWorkbenchService.markersModel.filterOptions.filterErrors;
            data['warnings'] = this.markersWorkbenchService.markersModel.filterOptions.filterWarnings;
            data['infos'] = this.markersWorkbenchService.markersModel.filterOptions.filterInfos;
            /* __GDPR__
                "problems.filter" : {
                    "errors" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "warnings": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "infos": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('problems.filter', data);
        };
        FilterInputBoxActionItem.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        // Action toolbar is swallowing some keys for action items which should not be for an input box
        FilterInputBoxActionItem.prototype.handleKeyboardEvent = function (e) {
            switch (e.keyCode) {
                case 10 /* Space */:
                case 15 /* LeftArrow */:
                case 17 /* RightArrow */:
                case 9 /* Escape */:
                    e.stopPropagation();
                    break;
            }
        };
        FilterInputBoxActionItem.prototype.onInputKeyUp = function (keyboardEvent, filterInputBox) {
            switch (keyboardEvent.keyCode) {
                case 9 /* Escape */:
                    filterInputBox.value = '';
                    return;
                default:
                    return;
            }
        };
        FilterInputBoxActionItem = __decorate([
            __param(2, contextView_1.IContextViewService),
            __param(3, themeService_1.IThemeService),
            __param(4, markers_1.IMarkersWorkbenchService),
            __param(5, telemetry_1.ITelemetryService)
        ], FilterInputBoxActionItem);
        return FilterInputBoxActionItem;
    }(actionbar_1.BaseActionItem));
    exports.FilterInputBoxActionItem = FilterInputBoxActionItem;
});
