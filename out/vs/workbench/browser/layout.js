var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/builder", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/browser/ui/sash/sash", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/part/common/partService", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/services/group/common/groupService", "vs/base/browser/browser", "vs/platform/theme/common/themeService", "vs/base/common/decorators"], function (require, exports, builder_1, winjs_base_1, errors, sash_1, editorService_1, partService_1, viewlet_1, storage_1, contextView_1, lifecycle_1, groupService_1, browser_1, themeService_1, decorators_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MIN_SIDEBAR_PART_WIDTH = 170;
    var MIN_EDITOR_PART_HEIGHT = 70;
    var MIN_EDITOR_PART_WIDTH = 220;
    var MIN_PANEL_PART_HEIGHT = 77;
    var MIN_PANEL_PART_WIDTH = 300;
    var DEFAULT_PANEL_SIZE_COEFFICIENT = 0.4;
    var PANEL_SIZE_BEFORE_MAXIMIZED_BOUNDARY = 0.7;
    var HIDE_SIDEBAR_WIDTH_THRESHOLD = 50;
    var HIDE_PANEL_HEIGHT_THRESHOLD = 50;
    var HIDE_PANEL_WIDTH_THRESHOLD = 100;
    var TITLE_BAR_HEIGHT = 22;
    var STATUS_BAR_HEIGHT = 22;
    var ACTIVITY_BAR_WIDTH = 50;
    /**
     * The workbench layout is responsible to lay out all parts that make the Workbench.
     */
    var WorkbenchLayout = /** @class */ (function () {
        // Take parts as an object bag since instatation service does not have typings for constructors with 9+ arguments
        function WorkbenchLayout(parent, workbenchContainer, parts, quickopen, storageService, contextViewService, editorService, editorGroupService, partService, viewletService, themeService) {
            var _this = this;
            this.storageService = storageService;
            this.contextViewService = contextViewService;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.partService = partService;
            this.viewletService = viewletService;
            this.parent = parent;
            this.workbenchContainer = workbenchContainer;
            this.titlebar = parts.titlebar;
            this.activitybar = parts.activitybar;
            this.editor = parts.editor;
            this.sidebar = parts.sidebar;
            this.panel = parts.panel;
            this.statusbar = parts.statusbar;
            this.quickopen = quickopen;
            this.toUnbind = [];
            this.panelSizeBeforeMaximized = this.storageService.getInteger(WorkbenchLayout.panelSizeBeforeMaximizedKey, storage_1.StorageScope.GLOBAL, 0);
            this.panelMaximized = false;
            this.sashXOne = new sash_1.Sash(this.workbenchContainer.getHTMLElement(), this, {
                baseSize: 5
            });
            this.sashXTwo = new sash_1.Sash(this.workbenchContainer.getHTMLElement(), this, {
                baseSize: 5
            });
            this.sashY = new sash_1.Sash(this.workbenchContainer.getHTMLElement(), this, {
                baseSize: 4,
                orientation: sash_1.Orientation.HORIZONTAL
            });
            this._sidebarWidth = this.storageService.getInteger(WorkbenchLayout.sashXOneWidthSettingsKey, storage_1.StorageScope.GLOBAL, -1);
            this._panelHeight = this.storageService.getInteger(WorkbenchLayout.sashYHeightSettingsKey, storage_1.StorageScope.GLOBAL, 0);
            this._panelWidth = this.storageService.getInteger(WorkbenchLayout.sashXTwoWidthSettingsKey, storage_1.StorageScope.GLOBAL, 0);
            this.layoutEditorGroupsVertically = (this.editorGroupService.getGroupOrientation() !== 'horizontal');
            this.toUnbind.push(themeService.onThemeChange(function (_) { return _this.layout(); }));
            this.toUnbind.push(editorGroupService.onEditorsChanged(function () { return _this.onEditorsChanged(); }));
            this.toUnbind.push(editorGroupService.onGroupOrientationChanged(function (e) { return _this.onGroupOrientationChanged(); }));
            this.registerSashListeners();
        }
        Object.defineProperty(WorkbenchLayout.prototype, "editorCountForHeight", {
            get: function () {
                return Math.max(1, this.editorGroupService.getGroupOrientation() === 'horizontal' ? this.editorGroupService.getStacksModel().groups.length : 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchLayout.prototype, "editorCountForWidth", {
            get: function () {
                return Math.max(1, this.editorGroupService.getGroupOrientation() === 'vertical' ? this.editorGroupService.getStacksModel().groups.length : 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchLayout.prototype, "activitybarWidth", {
            get: function () {
                if (this.partService.isVisible(partService_1.Parts.ACTIVITYBAR_PART)) {
                    return this.partLayoutInfo.activitybar.width;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchLayout.prototype, "panelHeight", {
            get: function () {
                var panelPosition = this.partService.getPanelPosition();
                if (panelPosition === partService_1.Position.RIGHT) {
                    return this.sidebarHeight;
                }
                return this._panelHeight;
            },
            set: function (value) {
                this._panelHeight = Math.min(this.computeMaxPanelHeight(), Math.max(this.partLayoutInfo.panel.minHeight, value));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchLayout.prototype, "panelWidth", {
            get: function () {
                var panelPosition = this.partService.getPanelPosition();
                if (panelPosition === partService_1.Position.BOTTOM) {
                    return this.workbenchSize.width - this.activitybarWidth - this.sidebarWidth;
                }
                return this._panelWidth;
            },
            set: function (value) {
                this._panelWidth = Math.min(this.computeMaxPanelWidth(), Math.max(this.partLayoutInfo.panel.minWidth, value));
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchLayout.prototype.computeMaxPanelWidth = function () {
            var minSidebarSize = this.partService.isVisible(partService_1.Parts.SIDEBAR_PART) ? (this.partService.getSideBarPosition() === partService_1.Position.LEFT ? this.partLayoutInfo.sidebar.minWidth : this.sidebarWidth) : 0;
            return Math.max(this.partLayoutInfo.panel.minWidth, this.workbenchSize.width - this.editorCountForWidth * this.partLayoutInfo.editor.minWidth - minSidebarSize - this.activitybarWidth);
        };
        WorkbenchLayout.prototype.computeMaxPanelHeight = function () {
            return Math.max(this.partLayoutInfo.panel.minHeight, this.sidebarHeight - this.editorCountForHeight * this.partLayoutInfo.editor.minHeight);
        };
        Object.defineProperty(WorkbenchLayout.prototype, "sidebarWidth", {
            get: function () {
                if (this.partService.isVisible(partService_1.Parts.SIDEBAR_PART)) {
                    return this._sidebarWidth;
                }
                return 0;
            },
            set: function (value) {
                var panelMinWidth = this.partService.getPanelPosition() === partService_1.Position.RIGHT && this.partService.isVisible(partService_1.Parts.PANEL_PART) ? this.partLayoutInfo.panel.minWidth : 0;
                var maxSidebarWidth = this.workbenchSize.width - this.activitybarWidth - this.editorCountForWidth * this.partLayoutInfo.editor.minWidth - panelMinWidth;
                this._sidebarWidth = Math.max(this.partLayoutInfo.sidebar.minWidth, Math.min(maxSidebarWidth, value));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchLayout.prototype, "partLayoutInfo", {
            get: function () {
                return {
                    titlebar: {
                        height: TITLE_BAR_HEIGHT
                    },
                    activitybar: {
                        width: ACTIVITY_BAR_WIDTH
                    },
                    sidebar: {
                        minWidth: MIN_SIDEBAR_PART_WIDTH
                    },
                    panel: {
                        minHeight: MIN_PANEL_PART_HEIGHT,
                        minWidth: MIN_PANEL_PART_WIDTH
                    },
                    editor: {
                        minWidth: MIN_EDITOR_PART_WIDTH,
                        minHeight: MIN_EDITOR_PART_HEIGHT
                    },
                    statusbar: {
                        height: STATUS_BAR_HEIGHT
                    }
                };
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchLayout.prototype.registerSashListeners = function () {
            var _this = this;
            var startX = 0;
            var startY = 0;
            var startXTwo = 0;
            var startSidebarWidth;
            var startPanelHeight;
            var startPanelWidth;
            this.toUnbind.push(this.sashXOne.onDidStart(function (e) {
                startSidebarWidth = _this.sidebarWidth;
                startX = e.startX;
            }));
            this.toUnbind.push(this.sashY.onDidStart(function (e) {
                startPanelHeight = _this.panelHeight;
                startY = e.startY;
            }));
            this.toUnbind.push(this.sashXTwo.onDidStart(function (e) {
                startPanelWidth = _this.panelWidth;
                startXTwo = e.startX;
            }));
            this.toUnbind.push(this.sashXOne.onDidChange(function (e) {
                var doLayout = false;
                var sidebarPosition = _this.partService.getSideBarPosition();
                var isSidebarVisible = _this.partService.isVisible(partService_1.Parts.SIDEBAR_PART);
                var newSashWidth = (sidebarPosition === partService_1.Position.LEFT) ? startSidebarWidth + e.currentX - startX : startSidebarWidth - e.currentX + startX;
                var promise = winjs_base_1.TPromise.wrap(null);
                // Sidebar visible
                if (isSidebarVisible) {
                    // Automatically hide side bar when a certain threshold is met
                    if (newSashWidth + HIDE_SIDEBAR_WIDTH_THRESHOLD < _this.partLayoutInfo.sidebar.minWidth) {
                        var dragCompensation = _this.partLayoutInfo.sidebar.minWidth - HIDE_SIDEBAR_WIDTH_THRESHOLD;
                        promise = _this.partService.setSideBarHidden(true);
                        startX = (sidebarPosition === partService_1.Position.LEFT) ? Math.max(_this.activitybarWidth, e.currentX - dragCompensation) : Math.min(e.currentX + dragCompensation, _this.workbenchSize.width - _this.activitybarWidth);
                        _this.sidebarWidth = startSidebarWidth; // when restoring sidebar, restore to the sidebar width we started from
                    }
                    else {
                        _this.sidebarWidth = Math.max(_this.partLayoutInfo.sidebar.minWidth, newSashWidth); // Sidebar can not become smaller than MIN_PART_WIDTH
                        doLayout = newSashWidth >= _this.partLayoutInfo.sidebar.minWidth;
                    }
                }
                else {
                    if ((sidebarPosition === partService_1.Position.LEFT && e.currentX - startX >= _this.partLayoutInfo.sidebar.minWidth) ||
                        (sidebarPosition === partService_1.Position.RIGHT && startX - e.currentX >= _this.partLayoutInfo.sidebar.minWidth)) {
                        startSidebarWidth = _this.partLayoutInfo.sidebar.minWidth - (sidebarPosition === partService_1.Position.LEFT ? e.currentX - startX : startX - e.currentX);
                        _this.sidebarWidth = _this.partLayoutInfo.sidebar.minWidth;
                        promise = _this.partService.setSideBarHidden(false);
                    }
                }
                if (doLayout) {
                    promise.done(function () { return _this.layout({ source: partService_1.Parts.SIDEBAR_PART }); }, errors.onUnexpectedError);
                }
            }));
            this.toUnbind.push(this.sashY.onDidChange(function (e) {
                var doLayout = false;
                var isPanelVisible = _this.partService.isVisible(partService_1.Parts.PANEL_PART);
                var newSashHeight = startPanelHeight - (e.currentY - startY);
                var promise = winjs_base_1.TPromise.wrap(null);
                // Panel visible
                if (isPanelVisible) {
                    // Automatically hide panel when a certain threshold is met
                    if (newSashHeight + HIDE_PANEL_HEIGHT_THRESHOLD < _this.partLayoutInfo.panel.minHeight) {
                        var dragCompensation = _this.partLayoutInfo.panel.minHeight - HIDE_PANEL_HEIGHT_THRESHOLD;
                        promise = _this.partService.setPanelHidden(true);
                        startY = Math.min(_this.sidebarHeight - _this.statusbarHeight - _this.titlebarHeight, e.currentY + dragCompensation);
                        _this.panelHeight = startPanelHeight; // when restoring panel, restore to the panel height we started from
                    }
                    else {
                        _this.panelHeight = Math.max(_this.partLayoutInfo.panel.minHeight, newSashHeight); // Panel can not become smaller than MIN_PART_HEIGHT
                        doLayout = newSashHeight >= _this.partLayoutInfo.panel.minHeight;
                    }
                }
                else {
                    if (startY - e.currentY >= _this.partLayoutInfo.panel.minHeight) {
                        startPanelHeight = 0;
                        _this.panelHeight = _this.partLayoutInfo.panel.minHeight;
                        promise = _this.partService.setPanelHidden(false);
                    }
                }
                if (doLayout) {
                    promise.done(function () { return _this.layout({ source: partService_1.Parts.PANEL_PART }); }, errors.onUnexpectedError);
                }
            }));
            this.toUnbind.push(this.sashXTwo.onDidChange(function (e) {
                var doLayout = false;
                var isPanelVisible = _this.partService.isVisible(partService_1.Parts.PANEL_PART);
                var newSashWidth = startPanelWidth - (e.currentX - startXTwo);
                var promise = winjs_base_1.TPromise.wrap(null);
                // Panel visible
                if (isPanelVisible) {
                    // Automatically hide panel when a certain threshold is met
                    if (newSashWidth + HIDE_PANEL_WIDTH_THRESHOLD < _this.partLayoutInfo.panel.minWidth) {
                        var dragCompensation = _this.partLayoutInfo.panel.minWidth - HIDE_PANEL_WIDTH_THRESHOLD;
                        promise = _this.partService.setPanelHidden(true);
                        startXTwo = Math.min(_this.workbenchSize.width - _this.activitybarWidth, e.currentX + dragCompensation);
                        _this.panelWidth = startPanelWidth; // when restoring panel, restore to the panel height we started from
                    }
                    else {
                        _this.panelWidth = newSashWidth;
                        doLayout = newSashWidth >= _this.partLayoutInfo.panel.minWidth;
                    }
                }
                else {
                    if (startXTwo - e.currentX >= _this.partLayoutInfo.panel.minWidth) {
                        startPanelWidth = 0;
                        _this.panelWidth = _this.partLayoutInfo.panel.minWidth;
                        promise = _this.partService.setPanelHidden(false);
                    }
                }
                if (doLayout) {
                    promise.done(function () { return _this.layout({ source: partService_1.Parts.PANEL_PART }); }, errors.onUnexpectedError);
                }
            }));
            this.toUnbind.push(this.sashXOne.onDidEnd(function () {
                _this.storageService.store(WorkbenchLayout.sashXOneWidthSettingsKey, _this.sidebarWidth, storage_1.StorageScope.GLOBAL);
            }));
            this.toUnbind.push(this.sashY.onDidEnd(function () {
                _this.storageService.store(WorkbenchLayout.sashYHeightSettingsKey, _this.panelHeight, storage_1.StorageScope.GLOBAL);
            }));
            this.toUnbind.push(this.sashXTwo.onDidEnd(function () {
                _this.storageService.store(WorkbenchLayout.sashXTwoWidthSettingsKey, _this.panelWidth, storage_1.StorageScope.GLOBAL);
            }));
            this.toUnbind.push(this.sashY.onDidReset(function () {
                _this.panelHeight = _this.sidebarHeight * DEFAULT_PANEL_SIZE_COEFFICIENT;
                _this.storageService.store(WorkbenchLayout.sashYHeightSettingsKey, _this.panelHeight, storage_1.StorageScope.GLOBAL);
                _this.layout();
            }));
            this.toUnbind.push(this.sashXOne.onDidReset(function () {
                var activeViewlet = _this.viewletService.getActiveViewlet();
                var optimalWidth = activeViewlet && activeViewlet.getOptimalWidth();
                _this.sidebarWidth = optimalWidth || 0;
                _this.storageService.store(WorkbenchLayout.sashXOneWidthSettingsKey, _this.sidebarWidth, storage_1.StorageScope.GLOBAL);
                _this.partService.setSideBarHidden(false).done(function () { return _this.layout(); }, errors.onUnexpectedError);
            }));
            this.toUnbind.push(this.sashXTwo.onDidReset(function () {
                _this.panelWidth = (_this.workbenchSize.width - _this.sidebarWidth - _this.activitybarWidth) * DEFAULT_PANEL_SIZE_COEFFICIENT;
                _this.storageService.store(WorkbenchLayout.sashXTwoWidthSettingsKey, _this.panelWidth, storage_1.StorageScope.GLOBAL);
                _this.layout();
            }));
        };
        WorkbenchLayout.prototype.onEditorsChanged = function () {
            // Make sure that we layout properly in case we detect that the sidebar or panel is large enought to cause
            // multiple opened editors to go below minimal size. The fix is to trigger a layout for any editor
            // input change that falls into this category.
            if (this.workbenchSize && (this.sidebarWidth || this.panelHeight)) {
                var visibleEditors = this.editorService.getVisibleEditors().length;
                var panelVertical = this.partService.getPanelPosition() === partService_1.Position.RIGHT;
                if (visibleEditors > 1) {
                    var sidebarOverflow = this.layoutEditorGroupsVertically && (this.workbenchSize.width - this.sidebarWidth < visibleEditors * this.partLayoutInfo.editor.minWidth);
                    var panelOverflow = !this.layoutEditorGroupsVertically && !panelVertical && (this.workbenchSize.height - this.panelHeight < visibleEditors * this.partLayoutInfo.editor.minHeight) ||
                        panelVertical && this.layoutEditorGroupsVertically && (this.workbenchSize.width - this.panelWidth - this.sidebarWidth < visibleEditors * this.partLayoutInfo.editor.minWidth);
                    if (sidebarOverflow || panelOverflow) {
                        this.layout();
                    }
                }
            }
        };
        WorkbenchLayout.prototype.onGroupOrientationChanged = function () {
            var newLayoutEditorGroupsVertically = (this.editorGroupService.getGroupOrientation() !== 'horizontal');
            var doLayout = this.layoutEditorGroupsVertically !== newLayoutEditorGroupsVertically;
            this.layoutEditorGroupsVertically = newLayoutEditorGroupsVertically;
            if (doLayout) {
                this.layout();
            }
        };
        WorkbenchLayout.prototype.layout = function (options) {
            this.workbenchSize = this.parent.getClientArea();
            var isActivityBarHidden = !this.partService.isVisible(partService_1.Parts.ACTIVITYBAR_PART);
            var isTitlebarHidden = !this.partService.isVisible(partService_1.Parts.TITLEBAR_PART);
            var isPanelHidden = !this.partService.isVisible(partService_1.Parts.PANEL_PART);
            var isStatusbarHidden = !this.partService.isVisible(partService_1.Parts.STATUSBAR_PART);
            var isSidebarHidden = !this.partService.isVisible(partService_1.Parts.SIDEBAR_PART);
            var sidebarPosition = this.partService.getSideBarPosition();
            var panelPosition = this.partService.getPanelPosition();
            // Sidebar
            if (this.sidebarWidth === -1) {
                this.sidebarWidth = this.workbenchSize.width / 5;
            }
            this.statusbarHeight = isStatusbarHidden ? 0 : this.partLayoutInfo.statusbar.height;
            this.titlebarHeight = isTitlebarHidden ? 0 : this.partLayoutInfo.titlebar.height / browser_1.getZoomFactor(); // adjust for zoom prevention
            this.sidebarHeight = this.workbenchSize.height - this.statusbarHeight - this.titlebarHeight;
            var sidebarSize = new builder_1.Dimension(this.sidebarWidth, this.sidebarHeight);
            // Activity Bar
            var activityBarSize = new builder_1.Dimension(this.activitybarWidth, sidebarSize.height);
            // Panel part
            var panelHeight;
            var panelWidth;
            var maxPanelHeight = this.computeMaxPanelHeight();
            var maxPanelWidth = this.computeMaxPanelWidth();
            if (isPanelHidden) {
                panelHeight = 0;
                panelWidth = 0;
            }
            else if (panelPosition === partService_1.Position.BOTTOM) {
                if (this.panelHeight > 0) {
                    panelHeight = Math.min(maxPanelHeight, Math.max(this.partLayoutInfo.panel.minHeight, this.panelHeight));
                }
                else {
                    panelHeight = sidebarSize.height * DEFAULT_PANEL_SIZE_COEFFICIENT;
                }
                panelWidth = this.workbenchSize.width - sidebarSize.width - activityBarSize.width;
                if (options && options.toggleMaximizedPanel) {
                    panelHeight = this.panelMaximized ? Math.max(this.partLayoutInfo.panel.minHeight, Math.min(this.panelSizeBeforeMaximized, maxPanelHeight)) : maxPanelHeight;
                }
                this.panelMaximized = panelHeight === maxPanelHeight;
                if (panelHeight / maxPanelHeight < PANEL_SIZE_BEFORE_MAXIMIZED_BOUNDARY) {
                    this.panelSizeBeforeMaximized = panelHeight;
                }
            }
            else {
                panelHeight = sidebarSize.height;
                if (this.panelWidth > 0) {
                    panelWidth = Math.min(maxPanelWidth, Math.max(this.partLayoutInfo.panel.minWidth, this.panelWidth));
                }
                else {
                    panelWidth = (this.workbenchSize.width - activityBarSize.width - sidebarSize.width) * DEFAULT_PANEL_SIZE_COEFFICIENT;
                }
                if (options && options.toggleMaximizedPanel) {
                    panelWidth = this.panelMaximized ? Math.max(this.partLayoutInfo.panel.minWidth, Math.min(this.panelSizeBeforeMaximized, maxPanelWidth)) : maxPanelWidth;
                }
                this.panelMaximized = panelWidth === maxPanelWidth;
                if (panelWidth / maxPanelWidth < PANEL_SIZE_BEFORE_MAXIMIZED_BOUNDARY) {
                    this.panelSizeBeforeMaximized = panelWidth;
                }
            }
            this.storageService.store(WorkbenchLayout.panelSizeBeforeMaximizedKey, this.panelSizeBeforeMaximized, storage_1.StorageScope.GLOBAL);
            var panelDimension = new builder_1.Dimension(panelWidth, panelHeight);
            // Editor
            var editorSize = {
                width: 0,
                height: 0
            };
            editorSize.width = this.workbenchSize.width - sidebarSize.width - activityBarSize.width - (panelPosition === partService_1.Position.RIGHT ? panelDimension.width : 0);
            editorSize.height = sidebarSize.height - (panelPosition === partService_1.Position.BOTTOM ? panelDimension.height : 0);
            // Assert Sidebar and Editor Size to not overflow
            var editorMinWidth = this.partLayoutInfo.editor.minWidth;
            var editorMinHeight = this.partLayoutInfo.editor.minHeight;
            var visibleEditorCount = this.editorService.getVisibleEditors().length;
            if (visibleEditorCount > 1) {
                if (this.layoutEditorGroupsVertically) {
                    editorMinWidth *= visibleEditorCount; // when editors layout vertically, multiply the min editor width by number of visible editors
                }
                else {
                    editorMinHeight *= visibleEditorCount; // when editors layout horizontally, multiply the min editor height by number of visible editors
                }
            }
            if (editorSize.width < editorMinWidth) {
                var diff = editorMinWidth - editorSize.width;
                editorSize.width = editorMinWidth;
                if (panelPosition === partService_1.Position.BOTTOM) {
                    panelDimension.width = editorMinWidth;
                }
                else if (panelDimension.width >= diff && (!options || options.source !== partService_1.Parts.PANEL_PART)) {
                    var oldWidth = panelDimension.width;
                    panelDimension.width = Math.max(this.partLayoutInfo.panel.minWidth, panelDimension.width - diff);
                    diff = diff - (oldWidth - panelDimension.width);
                }
                if (sidebarSize.width >= diff) {
                    sidebarSize.width -= diff;
                    sidebarSize.width = Math.max(this.partLayoutInfo.sidebar.minWidth, sidebarSize.width);
                }
            }
            if (editorSize.height < editorMinHeight && panelPosition === partService_1.Position.BOTTOM) {
                var diff = editorMinHeight - editorSize.height;
                editorSize.height = editorMinHeight;
                panelDimension.height -= diff;
                panelDimension.height = Math.max(this.partLayoutInfo.panel.minHeight, panelDimension.height);
            }
            if (!isSidebarHidden) {
                this.sidebarWidth = sidebarSize.width;
                this.storageService.store(WorkbenchLayout.sashXOneWidthSettingsKey, this.sidebarWidth, storage_1.StorageScope.GLOBAL);
            }
            if (!isPanelHidden) {
                if (panelPosition === partService_1.Position.BOTTOM) {
                    this.panelHeight = panelDimension.height;
                    this.storageService.store(WorkbenchLayout.sashYHeightSettingsKey, this.panelHeight, storage_1.StorageScope.GLOBAL);
                }
                else {
                    this.panelWidth = panelDimension.width;
                    this.storageService.store(WorkbenchLayout.sashXTwoWidthSettingsKey, this.panelWidth, storage_1.StorageScope.GLOBAL);
                }
            }
            // Workbench
            this.workbenchContainer
                .position(0, 0, 0, 0, 'relative')
                .size(this.workbenchSize.width, this.workbenchSize.height);
            // Bug on Chrome: Sometimes Chrome wants to scroll the workbench container on layout changes. The fix is to reset scrolling in this case.
            var workbenchContainer = this.workbenchContainer.getHTMLElement();
            if (workbenchContainer.scrollTop > 0) {
                workbenchContainer.scrollTop = 0;
            }
            if (workbenchContainer.scrollLeft > 0) {
                workbenchContainer.scrollLeft = 0;
            }
            // Title Part
            if (isTitlebarHidden) {
                this.titlebar.getContainer().hide();
            }
            else {
                this.titlebar.getContainer().show();
            }
            // Editor Part and Panel part
            this.editor.getContainer().size(editorSize.width, editorSize.height);
            this.panel.getContainer().size(panelDimension.width, panelDimension.height);
            if (panelPosition === partService_1.Position.BOTTOM) {
                if (sidebarPosition === partService_1.Position.LEFT) {
                    this.editor.getContainer().position(this.titlebarHeight, 0, this.statusbarHeight + panelDimension.height, sidebarSize.width + activityBarSize.width);
                    this.panel.getContainer().position(editorSize.height + this.titlebarHeight, 0, this.statusbarHeight, sidebarSize.width + activityBarSize.width);
                }
                else {
                    this.editor.getContainer().position(this.titlebarHeight, sidebarSize.width, this.statusbarHeight + panelDimension.height, 0);
                    this.panel.getContainer().position(editorSize.height + this.titlebarHeight, sidebarSize.width, this.statusbarHeight, 0);
                }
            }
            else {
                if (sidebarPosition === partService_1.Position.LEFT) {
                    this.editor.getContainer().position(this.titlebarHeight, panelDimension.width, this.statusbarHeight, sidebarSize.width + activityBarSize.width);
                    this.panel.getContainer().position(this.titlebarHeight, 0, this.statusbarHeight, sidebarSize.width + activityBarSize.width + editorSize.width);
                }
                else {
                    this.editor.getContainer().position(this.titlebarHeight, sidebarSize.width + activityBarSize.width + panelWidth, this.statusbarHeight, 0);
                    this.panel.getContainer().position(this.titlebarHeight, sidebarSize.width + activityBarSize.width, this.statusbarHeight, editorSize.width);
                }
            }
            // Activity Bar Part
            this.activitybar.getContainer().size(null, activityBarSize.height);
            if (sidebarPosition === partService_1.Position.LEFT) {
                this.activitybar.getContainer().getHTMLElement().style.right = '';
                this.activitybar.getContainer().position(this.titlebarHeight, null, 0, 0);
            }
            else {
                this.activitybar.getContainer().getHTMLElement().style.left = '';
                this.activitybar.getContainer().position(this.titlebarHeight, 0, 0, null);
            }
            if (isActivityBarHidden) {
                this.activitybar.getContainer().hide();
            }
            else {
                this.activitybar.getContainer().show();
            }
            // Sidebar Part
            this.sidebar.getContainer().size(sidebarSize.width, sidebarSize.height);
            var editorAndPanelWidth = editorSize.width + (panelPosition === partService_1.Position.RIGHT ? panelWidth : 0);
            if (sidebarPosition === partService_1.Position.LEFT) {
                this.sidebar.getContainer().position(this.titlebarHeight, editorAndPanelWidth, this.statusbarHeight, activityBarSize.width);
            }
            else {
                this.sidebar.getContainer().position(this.titlebarHeight, activityBarSize.width, this.statusbarHeight, editorAndPanelWidth);
            }
            // Statusbar Part
            this.statusbar.getContainer().position(this.workbenchSize.height - this.statusbarHeight);
            if (isStatusbarHidden) {
                this.statusbar.getContainer().hide();
            }
            else {
                this.statusbar.getContainer().show();
            }
            // Quick open
            this.quickopen.layout(this.workbenchSize);
            // Sashes
            this.sashXOne.layout();
            if (panelPosition === partService_1.Position.BOTTOM) {
                this.sashXTwo.hide();
                this.sashY.layout();
                this.sashY.show();
            }
            else {
                this.sashY.hide();
                this.sashXTwo.layout();
                this.sashXTwo.show();
            }
            // Propagate to Part Layouts
            this.titlebar.layout(new builder_1.Dimension(this.workbenchSize.width, this.titlebarHeight));
            this.editor.layout(new builder_1.Dimension(editorSize.width, editorSize.height));
            this.sidebar.layout(sidebarSize);
            this.panel.layout(panelDimension);
            this.activitybar.layout(activityBarSize);
            // Propagate to Context View
            this.contextViewService.layout();
        };
        WorkbenchLayout.prototype.getVerticalSashTop = function (sash) {
            return this.titlebarHeight;
        };
        WorkbenchLayout.prototype.getVerticalSashLeft = function (sash) {
            var sidebarPosition = this.partService.getSideBarPosition();
            if (sash === this.sashXOne) {
                if (sidebarPosition === partService_1.Position.LEFT) {
                    return this.sidebarWidth + this.activitybarWidth;
                }
                return this.workbenchSize.width - this.sidebarWidth - this.activitybarWidth;
            }
            return this.workbenchSize.width - this.panelWidth - (sidebarPosition === partService_1.Position.RIGHT ? this.sidebarWidth + this.activitybarWidth : 0);
        };
        WorkbenchLayout.prototype.getVerticalSashHeight = function (sash) {
            if (sash === this.sashXTwo && !this.partService.isVisible(partService_1.Parts.PANEL_PART)) {
                return 0;
            }
            return this.sidebarHeight;
        };
        WorkbenchLayout.prototype.getHorizontalSashTop = function (sash) {
            // Horizontal sash should be a bit lower than the editor area, thus add 2px #5524
            return 2 + (this.partService.isVisible(partService_1.Parts.PANEL_PART) ? this.sidebarHeight - this.panelHeight + this.titlebarHeight : this.sidebarHeight + this.titlebarHeight);
        };
        WorkbenchLayout.prototype.getHorizontalSashLeft = function (sash) {
            if (this.partService.getSideBarPosition() === partService_1.Position.RIGHT) {
                return 0;
            }
            return this.sidebarWidth + this.activitybarWidth;
        };
        WorkbenchLayout.prototype.getHorizontalSashWidth = function (sash) {
            return this.panelWidth;
        };
        WorkbenchLayout.prototype.isPanelMaximized = function () {
            return this.panelMaximized;
        };
        // change part size along the main axis
        WorkbenchLayout.prototype.resizePart = function (part, sizeChange) {
            var panelPosition = this.partService.getPanelPosition();
            var sizeChangePxWidth = this.workbenchSize.width * (sizeChange / 100);
            var sizeChangePxHeight = this.workbenchSize.height * (sizeChange / 100);
            var doLayout = false;
            switch (part) {
                case partService_1.Parts.SIDEBAR_PART:
                    this.sidebarWidth = this.sidebarWidth + sizeChangePxWidth; // Sidebar can not become smaller than MIN_PART_WIDTH
                    if (this.layoutEditorGroupsVertically && (this.workbenchSize.width - this.sidebarWidth < this.editorCountForWidth * MIN_EDITOR_PART_WIDTH)) {
                        this.sidebarWidth = (this.workbenchSize.width - this.editorCountForWidth * MIN_EDITOR_PART_WIDTH);
                    }
                    doLayout = true;
                    break;
                case partService_1.Parts.PANEL_PART:
                    if (panelPosition === partService_1.Position.BOTTOM) {
                        this.panelHeight = this.panelHeight + sizeChangePxHeight;
                    }
                    else if (panelPosition === partService_1.Position.RIGHT) {
                        this.panelWidth = this.panelWidth + sizeChangePxWidth;
                    }
                    doLayout = true;
                    break;
                case partService_1.Parts.EDITOR_PART:
                    // If we have one editor we can cheat and resize sidebar with the negative delta
                    // If the sidebar is not visible and panel is, resize panel main axis with negative Delta
                    if (this.editorCountForWidth === 1) {
                        if (this.partService.isVisible(partService_1.Parts.SIDEBAR_PART)) {
                            this.sidebarWidth = this.sidebarWidth - sizeChangePxWidth;
                            doLayout = true;
                        }
                        else if (this.partService.isVisible(partService_1.Parts.PANEL_PART)) {
                            if (panelPosition === partService_1.Position.BOTTOM) {
                                this.panelHeight = this.panelHeight - sizeChangePxHeight;
                            }
                            else if (panelPosition === partService_1.Position.RIGHT) {
                                this.panelWidth = this.panelWidth - sizeChangePxWidth;
                            }
                            doLayout = true;
                        }
                    }
                    else {
                        var stacks = this.editorGroupService.getStacksModel();
                        var activeGroup = stacks.positionOfGroup(stacks.activeGroup);
                        this.editorGroupService.resizeGroup(activeGroup, sizeChangePxWidth);
                        doLayout = false;
                    }
            }
            if (doLayout) {
                this.layout();
            }
        };
        WorkbenchLayout.prototype.dispose = function () {
            if (this.toUnbind) {
                lifecycle_1.dispose(this.toUnbind);
                this.toUnbind = null;
            }
        };
        WorkbenchLayout.sashXOneWidthSettingsKey = 'workbench.sidebar.width';
        WorkbenchLayout.sashXTwoWidthSettingsKey = 'workbench.panel.width';
        WorkbenchLayout.sashYHeightSettingsKey = 'workbench.panel.height';
        WorkbenchLayout.panelSizeBeforeMaximizedKey = 'workbench.panel.sizeBeforeMaximized';
        __decorate([
            decorators_1.memoize
        ], WorkbenchLayout.prototype, "partLayoutInfo", null);
        WorkbenchLayout = __decorate([
            __param(4, storage_1.IStorageService),
            __param(5, contextView_1.IContextViewService),
            __param(6, editorService_1.IWorkbenchEditorService),
            __param(7, groupService_1.IEditorGroupService),
            __param(8, partService_1.IPartService),
            __param(9, viewlet_1.IViewletService),
            __param(10, themeService_1.IThemeService)
        ], WorkbenchLayout);
        return WorkbenchLayout;
    }());
    exports.WorkbenchLayout = WorkbenchLayout;
});
