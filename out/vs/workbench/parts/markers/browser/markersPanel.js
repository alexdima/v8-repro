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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/winjs.base", "vs/base/common/async", "vs/base/browser/dom", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/group/common/groupService", "vs/workbench/browser/panel", "vs/workbench/services/editor/common/editorService", "vs/workbench/parts/markers/common/constants", "vs/workbench/parts/markers/common/markersModel", "vs/workbench/parts/markers/browser/markersTreeController", "vs/workbench/parts/markers/browser/markersTreeViewer", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/markers/browser/markersPanelActions", "vs/platform/configuration/common/configuration", "vs/workbench/parts/markers/common/messages", "vs/workbench/browser/parts/editor/rangeDecorations", "vs/platform/theme/common/themeService", "vs/base/common/event", "vs/platform/list/browser/listService", "vs/workbench/parts/markers/common/markers", "vs/workbench/browser/dnd", "vs/css!./media/markers"], function (require, exports, errors, winjs_base_1, async_1, dom, telemetry_1, groupService_1, panel_1, editorService_1, constants_1, markersModel_1, markersTreeController_1, Viewer, instantiation_1, markersPanelActions_1, configuration_1, messages_1, rangeDecorations_1, themeService_1, event_1, listService_1, markers_1, dnd_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MarkersPanel = /** @class */ (function (_super) {
        __extends(MarkersPanel, _super);
        function MarkersPanel(instantiationService, editorGroupService, editorService, configurationService, telemetryService, themeService, markersWorkbenchService) {
            var _this = _super.call(this, constants_1.default.MARKERS_PANEL_ID, telemetryService, themeService) || this;
            _this.instantiationService = instantiationService;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            _this.configurationService = configurationService;
            _this.markersWorkbenchService = markersWorkbenchService;
            _this.lastSelectedRelativeTop = 0;
            _this.currentActiveResource = null;
            _this.currentResourceGotAddedToMarkersData = false;
            _this.delayedRefresh = new async_1.Delayer(500);
            _this.autoExpanded = new Set();
            return _this;
        }
        MarkersPanel.prototype.create = function (parent) {
            _super.prototype.create.call(this, parent);
            this.rangeHighlightDecorations = this.instantiationService.createInstance(rangeDecorations_1.RangeHighlightDecorations);
            this.toUnbind.push(this.rangeHighlightDecorations);
            dom.addClass(parent.getHTMLElement(), 'markers-panel');
            var container = dom.append(parent.getHTMLElement(), dom.$('.markers-panel-container'));
            this.createMessageBox(container);
            this.createTree(container);
            this.createActions();
            this.createListeners();
            return this.render();
        };
        MarkersPanel.prototype.getTitle = function () {
            return messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS;
        };
        MarkersPanel.prototype.layout = function (dimension) {
            this.tree.layout(dimension.height);
        };
        MarkersPanel.prototype.focus = function () {
            if (this.tree.isDOMFocused()) {
                return;
            }
            if (this.markersWorkbenchService.markersModel.hasFilteredResources()) {
                this.tree.DOMFocus();
                if (this.tree.getSelection().length === 0) {
                    this.tree.focusFirst();
                }
                this.highlightCurrentSelectedMarkerRange();
                this.autoReveal(true);
            }
            else {
                this.messageBox.focus();
            }
        };
        MarkersPanel.prototype.setVisible = function (visible) {
            var _this = this;
            var wasVisible = this.isVisible();
            return _super.prototype.setVisible.call(this, visible)
                .then(function () {
                if (_this.isVisible()) {
                    if (!wasVisible) {
                        _this.refreshPanel();
                    }
                }
                else {
                    _this.rangeHighlightDecorations.removeHighlightRange();
                }
            });
        };
        MarkersPanel.prototype.getActions = function () {
            this.collapseAllAction.enabled = this.markersWorkbenchService.markersModel.hasFilteredResources();
            return this.actions;
        };
        MarkersPanel.prototype.openFileAtElement = function (element, preserveFocus, sideByside, pinned) {
            var _this = this;
            if (element instanceof markersModel_1.Marker) {
                var marker_1 = element;
                /* __GDPR__
                    "problems.marker.opened" : {
                        "source" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog('problems.marker.opened', { source: marker_1.marker.source });
                this.editorService.openEditor({
                    resource: marker_1.resource,
                    options: {
                        selection: marker_1.range,
                        preserveFocus: preserveFocus,
                        pinned: pinned,
                        revealIfVisible: true
                    },
                }, sideByside).done(function (editor) {
                    if (editor && preserveFocus) {
                        _this.rangeHighlightDecorations.highlightRange(marker_1, editor.getControl());
                    }
                    else {
                        _this.rangeHighlightDecorations.removeHighlightRange();
                    }
                }, errors.onUnexpectedError);
                return true;
            }
            else {
                this.rangeHighlightDecorations.removeHighlightRange();
            }
            return false;
        };
        MarkersPanel.prototype.refreshPanel = function () {
            var _this = this;
            if (this.isVisible()) {
                this.collapseAllAction.enabled = this.markersWorkbenchService.markersModel.hasFilteredResources();
                dom.toggleClass(this.treeContainer, 'hidden', !this.markersWorkbenchService.markersModel.hasFilteredResources());
                this.renderMessage();
                if (this.markersWorkbenchService.markersModel.hasFilteredResources()) {
                    return this.tree.refresh().then(function () {
                        _this.autoExpand();
                    });
                }
            }
            return winjs_base_1.TPromise.as(null);
        };
        MarkersPanel.prototype.updateFilter = function (filter) {
            this.markersWorkbenchService.filter(filter);
            this.autoExpanded = new Set();
            this.refreshPanel();
            this.autoReveal();
        };
        MarkersPanel.prototype.createMessageBox = function (parent) {
            this.messageBoxContainer = dom.append(parent, dom.$('.message-box-container'));
            this.messageBox = dom.append(this.messageBoxContainer, dom.$('span'));
            this.messageBox.setAttribute('tabindex', '0');
        };
        MarkersPanel.prototype.createTree = function (parent) {
            var _this = this;
            this.treeContainer = dom.append(parent, dom.$('.tree-container'));
            dom.addClass(this.treeContainer, 'show-file-icons');
            var renderer = this.instantiationService.createInstance(Viewer.Renderer);
            var dnd = this.instantiationService.createInstance(dnd_1.SimpleFileResourceDragAndDrop, function (obj) { return obj instanceof markersModel_1.Resource ? obj.uri : void 0; });
            var controller = this.instantiationService.createInstance(markersTreeController_1.Controller);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchTree, this.treeContainer, {
                dataSource: new Viewer.DataSource(),
                renderer: renderer,
                controller: controller,
                sorter: new Viewer.Sorter(),
                accessibilityProvider: new Viewer.MarkersTreeAccessibilityProvider(),
                dnd: dnd
            }, {
                indentPixels: 0,
                twistiePixels: 20,
                ariaLabel: messages_1.default.MARKERS_PANEL_ARIA_LABEL_PROBLEMS_TREE
            });
            constants_1.default.MarkerFocusContextKey.bindTo(this.tree.contextKeyService);
            var markersNavigator = this._register(new listService_1.TreeResourceNavigator(this.tree, { openOnFocus: true }));
            this._register(event_1.debounceEvent(markersNavigator.openResource, function (last, event) { return event; }, 75, true)(function (options) {
                _this.openFileAtElement(options.element, options.editorOptions.preserveFocus, options.sideBySide, options.editorOptions.pinned);
            }));
        };
        MarkersPanel.prototype.createActions = function () {
            var _this = this;
            this.collapseAllAction = this.instantiationService.createInstance(markersPanelActions_1.CollapseAllAction, this.tree, true);
            this.filterAction = new markersPanelActions_1.FilterAction();
            this.actions = [
                this.filterAction,
                this.collapseAllAction
            ];
            this.actions.forEach(function (a) {
                _this.toUnbind.push(a);
            });
        };
        MarkersPanel.prototype.createListeners = function () {
            var _this = this;
            this.toUnbind.push(this.markersWorkbenchService.onDidChangeMarkersForResources(this.onMarkerChanged, this));
            this.toUnbind.push(this.editorGroupService.onEditorsChanged(this.onEditorsChanged, this));
            this.toUnbind.push(this.tree.onDidChangeSelection(function () { return _this.onSelected(); }));
        };
        MarkersPanel.prototype.onMarkerChanged = function (changedResources) {
            var _this = this;
            this.currentResourceGotAddedToMarkersData = this.currentResourceGotAddedToMarkersData || this.isCurrentResourceGotAddedToMarkersData(changedResources);
            this.updateResources(changedResources);
            this.delayedRefresh.trigger(function () {
                _this.refreshPanel();
                _this.updateRangeHighlights();
                if (_this.currentResourceGotAddedToMarkersData) {
                    _this.autoReveal();
                    _this.currentResourceGotAddedToMarkersData = false;
                }
            });
        };
        MarkersPanel.prototype.isCurrentResourceGotAddedToMarkersData = function (changedResources) {
            var _this = this;
            if (!this.currentActiveResource) {
                return false;
            }
            var resourceForCurrentActiveResource = this.getResourceForCurrentActiveResource();
            if (resourceForCurrentActiveResource) {
                return false;
            }
            return changedResources.some(function (r) { return r.toString() === _this.currentActiveResource.toString(); });
        };
        MarkersPanel.prototype.onEditorsChanged = function () {
            var activeInput = this.editorService.getActiveEditorInput();
            this.currentActiveResource = activeInput ? activeInput.getResource() : void 0;
            this.autoReveal();
        };
        MarkersPanel.prototype.onSelected = function () {
            var selection = this.tree.getSelection();
            if (selection && selection.length > 0) {
                this.lastSelectedRelativeTop = this.tree.getRelativeTop(selection[0]);
            }
        };
        MarkersPanel.prototype.updateResources = function (resources) {
            for (var _i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
                var resource = resources_1[_i];
                if (!this.markersWorkbenchService.markersModel.hasResource(resource)) {
                    this.autoExpanded.delete(resource.toString());
                }
            }
        };
        MarkersPanel.prototype.render = function () {
            var _this = this;
            dom.toggleClass(this.treeContainer, 'hidden', !this.markersWorkbenchService.markersModel.hasFilteredResources());
            return this.tree.setInput(this.markersWorkbenchService.markersModel)
                .then(function () {
                _this.renderMessage();
                _this.autoExpand();
            });
        };
        MarkersPanel.prototype.renderMessage = function () {
            this.messageBox.textContent = this.markersWorkbenchService.markersModel.getMessage();
            dom.toggleClass(this.messageBoxContainer, 'hidden', this.markersWorkbenchService.markersModel.hasFilteredResources());
        };
        MarkersPanel.prototype.autoExpand = function () {
            for (var _i = 0, _a = this.markersWorkbenchService.markersModel.filteredResources; _i < _a.length; _i++) {
                var resource = _a[_i];
                var resourceUri = resource.uri.toString();
                if (!this.autoExpanded.has(resourceUri)) {
                    this.tree.expand(resource).done(null, errors.onUnexpectedError);
                    this.autoExpanded.add(resourceUri);
                }
            }
        };
        MarkersPanel.prototype.autoReveal = function (focus) {
            if (focus === void 0) { focus = false; }
            var autoReveal = this.configurationService.getValue('problems.autoReveal');
            if (typeof autoReveal === 'boolean' && autoReveal) {
                this.revealMarkersForCurrentActiveEditor(focus);
            }
        };
        MarkersPanel.prototype.revealMarkersForCurrentActiveEditor = function (focus) {
            if (focus === void 0) { focus = false; }
            var currentActiveResource = this.getResourceForCurrentActiveResource();
            if (currentActiveResource) {
                if (this.tree.isExpanded(currentActiveResource) && this.hasSelectedMarkerFor(currentActiveResource)) {
                    this.tree.reveal(this.tree.getSelection()[0], this.lastSelectedRelativeTop);
                    if (focus) {
                        this.tree.setFocus(this.tree.getSelection()[0]);
                    }
                }
                else {
                    this.tree.reveal(currentActiveResource, 0);
                    if (focus) {
                        this.tree.setFocus(currentActiveResource);
                        this.tree.setSelection([currentActiveResource]);
                    }
                }
            }
            else if (focus) {
                this.tree.setSelection([]);
                this.tree.focusFirst();
            }
        };
        MarkersPanel.prototype.getResourceForCurrentActiveResource = function () {
            var _this = this;
            if (this.currentActiveResource) {
                var resources = this.markersWorkbenchService.markersModel.filteredResources.filter(function (resource) {
                    return _this.currentActiveResource.toString() === resource.uri.toString();
                });
                return resources.length > 0 ? resources[0] : null;
            }
            return null;
        };
        MarkersPanel.prototype.hasSelectedMarkerFor = function (resource) {
            var selectedElement = this.tree.getSelection();
            if (selectedElement && selectedElement.length > 0) {
                if (selectedElement[0] instanceof markersModel_1.Marker) {
                    if (resource.uri.toString() === selectedElement[0].marker.resource.toString()) {
                        return true;
                    }
                }
            }
            return false;
        };
        MarkersPanel.prototype.updateRangeHighlights = function () {
            this.rangeHighlightDecorations.removeHighlightRange();
            if (this.tree.isDOMFocused()) {
                this.highlightCurrentSelectedMarkerRange();
            }
        };
        MarkersPanel.prototype.highlightCurrentSelectedMarkerRange = function () {
            var selections = this.tree.getSelection();
            if (selections && selections.length === 1 && selections[0] instanceof markersModel_1.Marker) {
                var marker = selections[0];
                this.rangeHighlightDecorations.highlightRange(marker);
            }
        };
        MarkersPanel.prototype.getActionItem = function (action) {
            if (action.id === markersPanelActions_1.FilterAction.ID) {
                return this.instantiationService.createInstance(markersPanelActions_1.FilterInputBoxActionItem, this, action);
            }
            return _super.prototype.getActionItem.call(this, action);
        };
        MarkersPanel.prototype.getFocusElement = function () {
            return this.tree.getFocus();
        };
        MarkersPanel.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.delayedRefresh.cancel();
            this.tree.dispose();
        };
        MarkersPanel = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, groupService_1.IEditorGroupService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, telemetry_1.ITelemetryService),
            __param(5, themeService_1.IThemeService),
            __param(6, markers_1.IMarkersWorkbenchService)
        ], MarkersPanel);
        return MarkersPanel;
    }(panel_1.Panel));
    exports.MarkersPanel = MarkersPanel;
});
