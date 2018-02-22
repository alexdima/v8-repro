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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/browser/dom", "vs/base/common/platform", "vs/base/common/labels", "vs/base/common/actions", "vs/platform/editor/common/editor", "vs/workbench/common/editor", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/workbench/browser/labels", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/services/editor/common/editorService", "vs/platform/contextview/browser/contextView", "vs/workbench/services/group/common/groupService", "vs/platform/message/common/message", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/editor/titleControl", "vs/platform/quickOpen/common/quickOpen", "vs/base/common/lifecycle", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/scrollable", "vs/base/common/map", "vs/platform/instantiation/common/serviceCollection", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dom", "vs/workbench/browser/dnd", "vs/css!./media/tabstitle"], function (require, exports, nls, winjs_base_1, errors, DOM, platform_1, labels_1, actions_1, editor_1, editor_2, keyboardEvent_1, touch_1, labels_2, actionbar_1, editorService_1, contextView_1, groupService_1, message_1, telemetry_1, instantiation_1, keybinding_1, contextkey_1, actions_2, titleControl_1, quickOpen_1, lifecycle_1, scrollableElement_1, scrollable_1, map_1, serviceCollection_1, themeService_1, theme_1, colorRegistry_1, dom_1, dnd_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TabsTitleControl = /** @class */ (function (_super) {
        __extends(TabsTitleControl, _super);
        function TabsTitleControl(contextMenuService, instantiationService, editorService, editorGroupService, contextKeyService, keybindingService, telemetryService, messageService, menuService, quickOpenService, themeService) {
            var _this = _super.call(this, contextMenuService, instantiationService, editorService, editorGroupService, contextKeyService, keybindingService, telemetryService, messageService, menuService, quickOpenService, themeService) || this;
            _this.transfer = dnd_1.LocalSelectionTransfer.getInstance();
            _this.tabDisposeables = [];
            _this.editorLabels = [];
            return _this;
        }
        TabsTitleControl.prototype.initActions = function (services) {
            _super.prototype.initActions.call(this, this.createScopedInstantiationService());
        };
        TabsTitleControl.prototype.createScopedInstantiationService = function () {
            var _this = this;
            var stacks = this.editorGroupService.getStacksModel();
            var delegatingEditorService = this.instantiationService.createInstance(editorService_1.DelegatingWorkbenchEditorService);
            // We create a scoped instantiation service to override the behaviour when closing an inactive editor
            // Specifically we want to move focus back to the editor when an inactive editor is closed from anywhere
            // in the tabs title control (e.g. mouse middle click, context menu on tab). This is only needed for
            // the inactive editors because closing the active one will always cause a tab switch that sets focus.
            // We also want to block the tabs container to reveal the currently active tab because that makes it very
            // hard to close multiple inactive tabs next to each other.
            delegatingEditorService.setEditorCloseHandler(function (position, editor) {
                var group = stacks.groupAt(position);
                if (group && stacks.isActive(group) && !group.isActive(editor)) {
                    _this.editorGroupService.focusGroup(group);
                }
                _this.blockRevealActiveTab = true;
                return winjs_base_1.TPromise.as(void 0);
            });
            return this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([editorService_1.IWorkbenchEditorService, delegatingEditorService]));
        };
        TabsTitleControl.prototype.create = function (parent) {
            var _this = this;
            _super.prototype.create.call(this, parent);
            this.titleContainer = parent;
            // Tabs Container
            this.tabsContainer = document.createElement('div');
            this.tabsContainer.setAttribute('role', 'tablist');
            DOM.addClass(this.tabsContainer, 'tabs-container');
            // Forward scrolling inside the container to our custom scrollbar
            this.toUnbind.push(DOM.addDisposableListener(this.tabsContainer, DOM.EventType.SCROLL, function (e) {
                if (DOM.hasClass(_this.tabsContainer, 'scroll')) {
                    _this.scrollbar.setScrollPosition({
                        scrollLeft: _this.tabsContainer.scrollLeft // during DND the  container gets scrolled so we need to update the custom scrollbar
                    });
                }
            }));
            // New file when double clicking on tabs container (but not tabs)
            this.toUnbind.push(DOM.addDisposableListener(this.tabsContainer, DOM.EventType.DBLCLICK, function (e) {
                var target = e.target;
                if (target instanceof HTMLElement && target.className.indexOf('tabs-container') === 0) {
                    DOM.EventHelper.stop(e);
                    var group = _this.context;
                    if (group) {
                        _this.editorService.openEditor({ options: { pinned: true, index: group.count /* always at the end */ } }).done(null, errors.onUnexpectedError); // untitled are always pinned
                    }
                }
            }));
            this.toUnbind.push(DOM.addDisposableListener(this.tabsContainer, DOM.EventType.MOUSE_DOWN, function (e) {
                if (e.button === 1) {
                    e.preventDefault(); // required to prevent auto-scrolling (https://github.com/Microsoft/vscode/issues/16690)
                }
            }));
            // Custom Scrollbar
            this.scrollbar = new scrollableElement_1.ScrollableElement(this.tabsContainer, {
                horizontal: scrollable_1.ScrollbarVisibility.Auto,
                vertical: scrollable_1.ScrollbarVisibility.Hidden,
                scrollYToX: true,
                useShadows: false,
                horizontalScrollbarSize: 3
            });
            this.scrollbar.onScroll(function (e) {
                _this.tabsContainer.scrollLeft = e.scrollLeft;
            });
            this.titleContainer.appendChild(this.scrollbar.getDomNode());
            // Drag over
            this.toUnbind.push(DOM.addDisposableListener(this.tabsContainer, DOM.EventType.DRAG_OVER, function (e) {
                var draggedEditor = _this.transfer.hasData(dnd_1.DraggedEditorIdentifier.prototype) ? _this.transfer.getData(dnd_1.DraggedEditorIdentifier.prototype)[0].identifier : void 0;
                // update the dropEffect, otherwise it would look like a "move" operation. but only if we are
                // not dragging a tab actually because there we support both moving as well as copying
                if (!draggedEditor) {
                    e.dataTransfer.dropEffect = 'copy';
                }
                DOM.addClass(_this.tabsContainer, 'scroll'); // enable support to scroll while dragging
                var target = e.target;
                if (target instanceof HTMLElement && target.className.indexOf('tabs-container') === 0) {
                    // Find out if the currently dragged editor is the last tab of this group and in that
                    // case we do not want to show any drop feedback because the drop would be a no-op
                    var draggedEditorIsLastTab = false;
                    if (draggedEditor && _this.context === draggedEditor.group && _this.context.indexOf(draggedEditor.editor) === _this.context.count - 1) {
                        draggedEditorIsLastTab = true;
                    }
                    if (!draggedEditorIsLastTab) {
                        _this.updateDropFeedback(_this.tabsContainer, true);
                    }
                }
            }));
            // Drag leave
            this.toUnbind.push(DOM.addDisposableListener(this.tabsContainer, DOM.EventType.DRAG_LEAVE, function (e) {
                _this.updateDropFeedback(_this.tabsContainer, false);
                DOM.removeClass(_this.tabsContainer, 'scroll');
            }));
            // Drag end
            this.toUnbind.push(DOM.addDisposableListener(this.tabsContainer, DOM.EventType.DRAG_END, function (e) {
                _this.updateDropFeedback(_this.tabsContainer, false);
                DOM.removeClass(_this.tabsContainer, 'scroll');
            }));
            // Drop onto tabs container
            this.toUnbind.push(DOM.addDisposableListener(this.tabsContainer, DOM.EventType.DROP, function (e) {
                _this.updateDropFeedback(_this.tabsContainer, false);
                DOM.removeClass(_this.tabsContainer, 'scroll');
                var target = e.target;
                if (target instanceof HTMLElement && target.className.indexOf('tabs-container') === 0) {
                    var group = _this.context;
                    if (group) {
                        var targetPosition = _this.stacks.positionOfGroup(group);
                        var targetIndex = group.count;
                        _this.onDrop(e, group, targetPosition, targetIndex);
                    }
                }
            }));
            // Editor Toolbar Container
            this.editorToolbarContainer = document.createElement('div');
            DOM.addClass(this.editorToolbarContainer, 'editor-actions');
            this.titleContainer.appendChild(this.editorToolbarContainer);
            // Editor Actions Toolbar
            this.createEditorActionsToolBar(this.editorToolbarContainer);
        };
        TabsTitleControl.prototype.updateDropFeedback = function (element, isDND, index) {
            var isTab = (typeof index === 'number');
            var isActiveTab = isTab && this.context && this.context.isActive(this.context.getEditor(index));
            // Background
            var noDNDBackgroundColor = isTab ? this.getColor(isActiveTab ? theme_1.TAB_ACTIVE_BACKGROUND : theme_1.TAB_INACTIVE_BACKGROUND) : null;
            element.style.backgroundColor = isDND ? this.getColor(theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND) : noDNDBackgroundColor;
            // Outline
            var activeContrastBorderColor = this.getColor(colorRegistry_1.activeContrastBorder);
            if (activeContrastBorderColor && isDND) {
                element.style.outlineWidth = '2px';
                element.style.outlineStyle = 'dashed';
                element.style.outlineColor = activeContrastBorderColor;
                element.style.outlineOffset = isTab ? '-5px' : '-3px';
            }
            else {
                element.style.outlineWidth = null;
                element.style.outlineStyle = null;
                element.style.outlineColor = activeContrastBorderColor;
                element.style.outlineOffset = null;
            }
        };
        TabsTitleControl.prototype.allowDragging = function (element) {
            return (element.className === 'tabs-container');
        };
        TabsTitleControl.prototype.doUpdate = function () {
            var _this = this;
            if (!this.context) {
                return;
            }
            var group = this.context;
            // Tabs container activity state
            var isGroupActive = this.stacks.isActive(group);
            if (isGroupActive) {
                DOM.addClass(this.titleContainer, 'active');
                DOM.removeClass(this.titleContainer, 'inactive');
            }
            else {
                DOM.addClass(this.titleContainer, 'inactive');
                DOM.removeClass(this.titleContainer, 'active');
            }
            // Compute labels and protect against duplicates
            var editorsOfGroup = this.context.getEditors();
            var labels = this.getTabLabels(editorsOfGroup);
            // Tab label and styles
            editorsOfGroup.forEach(function (editor, index) {
                var tabContainer = _this.tabsContainer.children[index];
                if (!tabContainer) {
                    return; // could be a race condition between updating tabs and creating tabs
                }
                var isPinned = group.isPinned(index);
                var isTabActive = group.isActive(editor);
                var isDirty = editor.isDirty();
                var label = labels[index];
                var name = label.name;
                var description = label.description || '';
                var title = label.title || '';
                // Container
                tabContainer.setAttribute('aria-label', name + ", tab");
                tabContainer.title = title;
                tabContainer.style.borderLeftColor = (index !== 0) ? (_this.getColor(theme_1.TAB_BORDER) || _this.getColor(colorRegistry_1.contrastBorder)) : null;
                tabContainer.style.borderRightColor = (index === editorsOfGroup.length - 1) ? (_this.getColor(theme_1.TAB_BORDER) || _this.getColor(colorRegistry_1.contrastBorder)) : null;
                tabContainer.style.outlineColor = _this.getColor(colorRegistry_1.activeContrastBorder);
                var tabOptions = _this.editorGroupService.getTabOptions();
                ['off', 'left', 'right'].forEach(function (option) {
                    var domAction = tabOptions.tabCloseButton === option ? DOM.addClass : DOM.removeClass;
                    domAction(tabContainer, "close-button-" + option);
                });
                ['fit', 'shrink'].forEach(function (option) {
                    var domAction = tabOptions.tabSizing === option ? DOM.addClass : DOM.removeClass;
                    domAction(tabContainer, "sizing-" + option);
                });
                if (tabOptions.showIcons && !!tabOptions.iconTheme) {
                    DOM.addClass(tabContainer, 'has-icon-theme');
                }
                else {
                    DOM.removeClass(tabContainer, 'has-icon-theme');
                }
                // Label
                var tabLabel = _this.editorLabels[index];
                tabLabel.setLabel({ name: name, description: description, resource: editor_2.toResource(editor, { supportSideBySide: true }) }, { extraClasses: ['tab-label'], italic: !isPinned });
                // Active state
                if (isTabActive) {
                    DOM.addClass(tabContainer, 'active');
                    tabContainer.setAttribute('aria-selected', 'true');
                    tabContainer.style.backgroundColor = _this.getColor(theme_1.TAB_ACTIVE_BACKGROUND);
                    tabLabel.element.style.color = _this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_FOREGROUND : theme_1.TAB_UNFOCUSED_ACTIVE_FOREGROUND);
                    // Use boxShadow for the active tab border because if we also have a editor group header
                    // color, the two colors would collide and the tab border never shows up.
                    // see https://github.com/Microsoft/vscode/issues/33111
                    var activeTabBorderColor = _this.getColor(isGroupActive ? theme_1.TAB_ACTIVE_BORDER : theme_1.TAB_UNFOCUSED_ACTIVE_BORDER);
                    if (activeTabBorderColor) {
                        tabContainer.style.boxShadow = activeTabBorderColor + " 0 -1px inset";
                    }
                    else {
                        tabContainer.style.boxShadow = null;
                    }
                    _this.activeTab = tabContainer;
                }
                else {
                    DOM.removeClass(tabContainer, 'active');
                    tabContainer.setAttribute('aria-selected', 'false');
                    tabContainer.style.backgroundColor = _this.getColor(theme_1.TAB_INACTIVE_BACKGROUND);
                    tabLabel.element.style.color = _this.getColor(isGroupActive ? theme_1.TAB_INACTIVE_FOREGROUND : theme_1.TAB_UNFOCUSED_INACTIVE_FOREGROUND);
                    tabContainer.style.boxShadow = null;
                }
                // Dirty State
                if (isDirty) {
                    DOM.addClass(tabContainer, 'dirty');
                }
                else {
                    DOM.removeClass(tabContainer, 'dirty');
                }
            });
            // Update Editor Actions Toolbar
            this.updateEditorActionsToolbar();
            // Ensure the active tab is always revealed
            this.layout(this.dimension);
        };
        TabsTitleControl.prototype.getTabLabels = function (editors) {
            var labelFormat = this.editorGroupService.getTabOptions().labelFormat;
            var _a = this.getLabelConfigFlags(labelFormat), verbosity = _a.verbosity, shortenDuplicates = _a.shortenDuplicates;
            // Build labels and descriptions for each editor
            var labels = editors.map(function (editor) { return ({
                editor: editor,
                name: editor.getName(),
                description: editor.getDescription(verbosity),
                title: editor.getTitle(editor_1.Verbosity.LONG)
            }); });
            // Shorten labels as needed
            if (shortenDuplicates) {
                this.shortenTabLabels(labels);
            }
            return labels;
        };
        TabsTitleControl.prototype.shortenTabLabels = function (labels) {
            // Gather duplicate titles, while filtering out invalid descriptions
            var mapTitleToDuplicates = new Map();
            for (var _i = 0, labels_3 = labels; _i < labels_3.length; _i++) {
                var label = labels_3[_i];
                if (typeof label.description === 'string') {
                    map_1.getOrSet(mapTitleToDuplicates, label.name, []).push(label);
                }
                else {
                    label.description = '';
                }
            }
            // Identify duplicate titles and shorten descriptions
            mapTitleToDuplicates.forEach(function (duplicateTitles) {
                // Remove description if the title isn't duplicated
                if (duplicateTitles.length === 1) {
                    duplicateTitles[0].description = '';
                    return;
                }
                // Identify duplicate descriptions
                var mapDescriptionToDuplicates = new Map();
                for (var _i = 0, duplicateTitles_1 = duplicateTitles; _i < duplicateTitles_1.length; _i++) {
                    var label = duplicateTitles_1[_i];
                    map_1.getOrSet(mapDescriptionToDuplicates, label.description, []).push(label);
                }
                // For editors with duplicate descriptions, check whether any long descriptions differ
                var useLongDescriptions = false;
                mapDescriptionToDuplicates.forEach(function (duplicateDescriptions, name) {
                    if (!useLongDescriptions && duplicateDescriptions.length > 1) {
                        var _a = duplicateDescriptions.map(function (_a) {
                            var editor = _a.editor;
                            return editor.getDescription(editor_1.Verbosity.LONG);
                        }), first_1 = _a[0], rest = _a.slice(1);
                        useLongDescriptions = rest.some(function (description) { return description !== first_1; });
                    }
                });
                // If so, replace all descriptions with long descriptions
                if (useLongDescriptions) {
                    mapDescriptionToDuplicates.clear();
                    duplicateTitles.forEach(function (label) {
                        label.description = label.editor.getDescription(editor_1.Verbosity.LONG);
                        map_1.getOrSet(mapDescriptionToDuplicates, label.description, []).push(label);
                    });
                }
                // Obtain final set of descriptions
                var descriptions = [];
                mapDescriptionToDuplicates.forEach(function (_, description) { return descriptions.push(description); });
                // Remove description if all descriptions are identical
                if (descriptions.length === 1) {
                    for (var _a = 0, _b = mapDescriptionToDuplicates.get(descriptions[0]); _a < _b.length; _a++) {
                        var label = _b[_a];
                        label.description = '';
                    }
                    return;
                }
                // Shorten descriptions
                var shortenedDescriptions = labels_1.shorten(descriptions);
                descriptions.forEach(function (description, i) {
                    for (var _i = 0, _a = mapDescriptionToDuplicates.get(description); _i < _a.length; _i++) {
                        var label = _a[_i];
                        label.description = shortenedDescriptions[i];
                    }
                });
            });
        };
        TabsTitleControl.prototype.getLabelConfigFlags = function (value) {
            switch (value) {
                case 'short':
                    return { verbosity: editor_1.Verbosity.SHORT, shortenDuplicates: false };
                case 'medium':
                    return { verbosity: editor_1.Verbosity.MEDIUM, shortenDuplicates: false };
                case 'long':
                    return { verbosity: editor_1.Verbosity.LONG, shortenDuplicates: false };
                default:
                    return { verbosity: editor_1.Verbosity.MEDIUM, shortenDuplicates: true };
            }
        };
        TabsTitleControl.prototype.doRefresh = function () {
            var group = this.context;
            var editor = group && group.activeEditor;
            if (!editor) {
                this.clearTabs();
                this.clearEditorActionsToolbar();
                return; // return early if we are being closed
            }
            // Handle Tabs
            this.handleTabs(group.count);
            DOM.removeClass(this.titleContainer, 'empty');
            // Update Tabs
            this.doUpdate();
        };
        TabsTitleControl.prototype.clearTabs = function () {
            DOM.clearNode(this.tabsContainer);
            this.tabDisposeables = lifecycle_1.dispose(this.tabDisposeables);
            this.editorLabels = [];
            DOM.addClass(this.titleContainer, 'empty');
        };
        TabsTitleControl.prototype.handleTabs = function (tabsNeeded) {
            var tabs = this.tabsContainer.children;
            var tabsCount = tabs.length;
            // Nothing to do if count did not change
            if (tabsCount === tabsNeeded) {
                return;
            }
            // We need more tabs: create new ones
            if (tabsCount < tabsNeeded) {
                for (var i = tabsCount; i < tabsNeeded; i++) {
                    this.tabsContainer.appendChild(this.createTab(i));
                }
            }
            else {
                for (var i = 0; i < tabsCount - tabsNeeded; i++) {
                    this.tabsContainer.lastChild.remove();
                    this.editorLabels.pop();
                    this.tabDisposeables.pop().dispose();
                }
            }
        };
        TabsTitleControl.prototype.createTab = function (index) {
            var _this = this;
            // Tab Container
            var tabContainer = document.createElement('div');
            tabContainer.draggable = true;
            tabContainer.tabIndex = 0;
            tabContainer.setAttribute('role', 'presentation'); // cannot use role "tab" here due to https://github.com/Microsoft/vscode/issues/8659
            DOM.addClass(tabContainer, 'tab');
            // Gesture Support
            touch_1.Gesture.addTarget(tabContainer);
            // Tab Editor Label
            var editorLabel = this.instantiationService.createInstance(labels_2.ResourceLabel, tabContainer, void 0);
            this.editorLabels.push(editorLabel);
            // Tab Close
            var tabCloseContainer = document.createElement('div');
            DOM.addClass(tabCloseContainer, 'tab-close');
            tabContainer.appendChild(tabCloseContainer);
            var bar = new actionbar_1.ActionBar(tabCloseContainer, { ariaLabel: nls.localize('araLabelTabActions', "Tab actions"), actionRunner: new TabActionRunner(function () { return _this.context; }, index) });
            bar.push(this.closeEditorAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(this.closeEditorAction) });
            // Eventing
            var disposable = this.hookTabListeners(tabContainer, index);
            this.tabDisposeables.push(lifecycle_1.combinedDisposable([disposable, bar, editorLabel]));
            return tabContainer;
        };
        TabsTitleControl.prototype.layout = function (dimension) {
            var _this = this;
            if (!this.activeTab || !dimension) {
                return;
            }
            this.dimension = dimension;
            // The layout of tabs can be an expensive operation because we access DOM properties
            // that can result in the browser doing a full page layout to validate them. To buffer
            // this a little bit we try at least to schedule this work on the next animation frame.
            if (!this.layoutScheduled) {
                this.layoutScheduled = dom_1.scheduleAtNextAnimationFrame(function () {
                    _this.doLayout(_this.dimension);
                    _this.layoutScheduled = void 0;
                });
            }
        };
        TabsTitleControl.prototype.doLayout = function (dimension) {
            var visibleContainerWidth = this.tabsContainer.offsetWidth;
            var totalContainerWidth = this.tabsContainer.scrollWidth;
            var activeTabPosX;
            var activeTabWidth;
            if (!this.blockRevealActiveTab) {
                activeTabPosX = this.activeTab.offsetLeft;
                activeTabWidth = this.activeTab.offsetWidth;
            }
            // Update scrollbar
            this.scrollbar.setScrollDimensions({
                width: visibleContainerWidth,
                scrollWidth: totalContainerWidth
            });
            // Return now if we are blocked to reveal the active tab and clear flag
            if (this.blockRevealActiveTab) {
                this.blockRevealActiveTab = false;
                return;
            }
            // Reveal the active one
            var containerScrollPosX = this.scrollbar.getScrollPosition().scrollLeft;
            var activeTabFits = activeTabWidth <= visibleContainerWidth;
            // Tab is overflowing to the right: Scroll minimally until the element is fully visible to the right
            // Note: only try to do this if we actually have enough width to give to show the tab fully!
            if (activeTabFits && containerScrollPosX + visibleContainerWidth < activeTabPosX + activeTabWidth) {
                this.scrollbar.setScrollPosition({
                    scrollLeft: containerScrollPosX + ((activeTabPosX + activeTabWidth) /* right corner of tab */ - (containerScrollPosX + visibleContainerWidth) /* right corner of view port */)
                });
            }
            else if (containerScrollPosX > activeTabPosX || !activeTabFits) {
                this.scrollbar.setScrollPosition({
                    scrollLeft: activeTabPosX
                });
            }
        };
        TabsTitleControl.prototype.hookTabListeners = function (tab, index) {
            var _this = this;
            var disposables = [];
            var handleClickOrTouch = function (e) {
                tab.blur();
                if (e instanceof MouseEvent && e.button !== 0) {
                    if (e.button === 1) {
                        e.preventDefault(); // required to prevent auto-scrolling (https://github.com/Microsoft/vscode/issues/16690)
                    }
                    return void 0; // only for left mouse click
                }
                var _a = _this.getGroupPositionAndEditor(index), editor = _a.editor, position = _a.position;
                if (!_this.isTabActionBar((e.initialTarget || e.target || e.srcElement))) {
                    setTimeout(function () { return _this.editorService.openEditor(editor, null, position).done(null, errors.onUnexpectedError); }); // timeout to keep focus in editor after mouse up
                }
                return void 0;
            };
            var showContextMenu = function (e) {
                DOM.EventHelper.stop(e);
                var _a = _this.getGroupPositionAndEditor(index), group = _a.group, editor = _a.editor;
                _this.onContextMenu({ group: group, editor: editor }, e, tab);
            };
            // Open on Click
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.MOUSE_DOWN, function (e) { return handleClickOrTouch(e); }));
            // Open on Touch
            disposables.push(DOM.addDisposableListener(tab, touch_1.EventType.Tap, function (e) { return handleClickOrTouch(e); }));
            // Touch Scroll Support
            disposables.push(DOM.addDisposableListener(tab, touch_1.EventType.Change, function (e) {
                _this.scrollbar.setScrollPosition({ scrollLeft: _this.scrollbar.getScrollPosition().scrollLeft - e.translationX });
            }));
            // Close on mouse middle click
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.MOUSE_UP, function (e) {
                DOM.EventHelper.stop(e);
                tab.blur();
                if (e.button === 1 /* Middle Button*/ && !_this.isTabActionBar((e.target || e.srcElement))) {
                    _this.closeEditorAction.run({ groupId: _this.context.id, editorIndex: index }).done(null, errors.onUnexpectedError);
                }
            }));
            // Context menu on Shift+F10
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.KEY_DOWN, function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.shiftKey && event.keyCode === 68 /* F10 */) {
                    showContextMenu(e);
                }
            }));
            // Context menu on touch context menu gesture
            disposables.push(DOM.addDisposableListener(tab, touch_1.EventType.Contextmenu, function (e) {
                showContextMenu(e);
            }));
            // Keyboard accessibility
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.KEY_UP, function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                var handled = false;
                var _a = _this.getGroupPositionAndEditor(index), group = _a.group, position = _a.position, editor = _a.editor;
                // Run action on Enter/Space
                if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
                    handled = true;
                    _this.editorService.openEditor(editor, null, position).done(null, errors.onUnexpectedError);
                }
                else if ([15 /* LeftArrow */, 17 /* RightArrow */, 16 /* UpArrow */, 18 /* DownArrow */, 14 /* Home */, 13 /* End */].some(function (kb) { return event.equals(kb); })) {
                    var targetIndex = void 0;
                    if (event.equals(15 /* LeftArrow */) || event.equals(16 /* UpArrow */)) {
                        targetIndex = index - 1;
                    }
                    else if (event.equals(17 /* RightArrow */) || event.equals(18 /* DownArrow */)) {
                        targetIndex = index + 1;
                    }
                    else if (event.equals(14 /* Home */)) {
                        targetIndex = 0;
                    }
                    else {
                        targetIndex = group.count - 1;
                    }
                    var target = group.getEditor(targetIndex);
                    if (target) {
                        handled = true;
                        _this.editorService.openEditor(target, { preserveFocus: true }, position).done(null, errors.onUnexpectedError);
                        _this.tabsContainer.childNodes[targetIndex].focus();
                    }
                }
                if (handled) {
                    DOM.EventHelper.stop(e, true);
                }
                // moving in the tabs container can have an impact on scrolling position, so we need to update the custom scrollbar
                _this.scrollbar.setScrollPosition({
                    scrollLeft: _this.tabsContainer.scrollLeft
                });
            }));
            // Pin on double click
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.DBLCLICK, function (e) {
                DOM.EventHelper.stop(e);
                var _a = _this.getGroupPositionAndEditor(index), group = _a.group, editor = _a.editor;
                _this.editorGroupService.pinEditor(group, editor);
            }));
            // Context menu
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.CONTEXT_MENU, function (e) {
                DOM.EventHelper.stop(e, true);
                var _a = _this.getGroupPositionAndEditor(index), group = _a.group, editor = _a.editor;
                _this.onContextMenu({ group: group, editor: editor }, e, tab);
            }, true /* use capture to fix https://github.com/Microsoft/vscode/issues/19145 */));
            // Drag start
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.DRAG_START, function (e) {
                var _a = _this.getGroupPositionAndEditor(index), group = _a.group, editor = _a.editor;
                _this.transfer.setData([new dnd_1.DraggedEditorIdentifier({ editor: editor, group: group })], dnd_1.DraggedEditorIdentifier.prototype);
                e.dataTransfer.effectAllowed = 'copyMove';
                // Apply some datatransfer types to allow for dragging the element outside of the application
                var resource = editor_2.toResource(editor, { supportSideBySide: true });
                if (resource) {
                    _this.instantiationService.invokeFunction(dnd_1.fillResourceDataTransfers, [resource], e);
                }
                // Fixes https://github.com/Microsoft/vscode/issues/18733
                DOM.addClass(tab, 'dragged');
                dom_1.scheduleAtNextAnimationFrame(function () { return DOM.removeClass(tab, 'dragged'); });
            }));
            // We need to keep track of DRAG_ENTER and DRAG_LEAVE events because a tab is not just a div without children,
            // it contains a label and a close button. HTML gives us DRAG_ENTER and DRAG_LEAVE events when hovering over
            // these children and this can cause flicker of the drop feedback. The workaround is to count the events and only
            // remove the drop feedback when the counter is 0 (see https://github.com/Microsoft/vscode/issues/14470)
            var counter = 0;
            // Drag over
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.DRAG_ENTER, function (e) {
                counter++;
                // Find out if the currently dragged editor is this tab and in that
                // case we do not want to show any drop feedback
                var draggedEditorIsTab = false;
                var draggedEditor = _this.transfer.hasData(dnd_1.DraggedEditorIdentifier.prototype) ? _this.transfer.getData(dnd_1.DraggedEditorIdentifier.prototype)[0].identifier : void 0;
                if (draggedEditor) {
                    var _a = _this.getGroupPositionAndEditor(index), group = _a.group, editor = _a.editor;
                    if (draggedEditor.editor === editor && draggedEditor.group === group) {
                        draggedEditorIsTab = true;
                    }
                }
                DOM.addClass(tab, 'dragged-over');
                if (!draggedEditorIsTab) {
                    _this.updateDropFeedback(tab, true, index);
                }
            }));
            // Drag leave
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.DRAG_LEAVE, function (e) {
                counter--;
                if (counter === 0) {
                    DOM.removeClass(tab, 'dragged-over');
                    _this.updateDropFeedback(tab, false, index);
                }
            }));
            // Drag end
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.DRAG_END, function (e) {
                counter = 0;
                DOM.removeClass(tab, 'dragged-over');
                _this.updateDropFeedback(tab, false, index);
                _this.transfer.clearData();
            }));
            // Drop
            disposables.push(DOM.addDisposableListener(tab, DOM.EventType.DROP, function (e) {
                counter = 0;
                DOM.removeClass(tab, 'dragged-over');
                _this.updateDropFeedback(tab, false, index);
                var _a = _this.getGroupPositionAndEditor(index), group = _a.group, position = _a.position;
                _this.onDrop(e, group, position, index);
            }));
            return lifecycle_1.combinedDisposable(disposables);
        };
        TabsTitleControl.prototype.isTabActionBar = function (element) {
            return !!DOM.findParentWithClass(element, 'monaco-action-bar', 'tab');
        };
        TabsTitleControl.prototype.getGroupPositionAndEditor = function (index) {
            var group = this.context;
            var position = this.stacks.positionOfGroup(group);
            var editor = group.getEditor(index);
            return { group: group, position: position, editor: editor };
        };
        TabsTitleControl.prototype.onDrop = function (e, group, targetPosition, targetIndex) {
            var _this = this;
            DOM.EventHelper.stop(e, true);
            this.updateDropFeedback(this.tabsContainer, false);
            DOM.removeClass(this.tabsContainer, 'scroll');
            // Local DND
            var draggedEditor = this.transfer.hasData(dnd_1.DraggedEditorIdentifier.prototype) ? this.transfer.getData(dnd_1.DraggedEditorIdentifier.prototype)[0].identifier : void 0;
            if (draggedEditor) {
                // Move editor to target position and index
                if (this.isMoveOperation(e, draggedEditor.group, group)) {
                    this.editorGroupService.moveEditor(draggedEditor.editor, draggedEditor.group, group, { index: targetIndex });
                }
                else {
                    this.editorService.openEditor(draggedEditor.editor, { pinned: true, index: targetIndex }, targetPosition).done(null, errors.onUnexpectedError);
                }
                this.transfer.clearData();
            }
            else {
                var dropHandler = this.instantiationService.createInstance(dnd_1.ResourcesDropHandler, { allowWorkspaceOpen: false /* open workspace file as file if dropped */ });
                dropHandler.handleDrop(e, function () { return _this.editorGroupService.focusGroup(targetPosition); }, targetPosition, targetIndex);
            }
        };
        TabsTitleControl.prototype.isMoveOperation = function (e, source, target) {
            var isCopy = (e.ctrlKey && !platform_1.isMacintosh) || (e.altKey && platform_1.isMacintosh);
            return !isCopy || source.id === target.id;
        };
        TabsTitleControl.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.layoutScheduled = lifecycle_1.dispose(this.layoutScheduled);
        };
        TabsTitleControl = __decorate([
            __param(0, contextView_1.IContextMenuService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService),
            __param(4, contextkey_1.IContextKeyService),
            __param(5, keybinding_1.IKeybindingService),
            __param(6, telemetry_1.ITelemetryService),
            __param(7, message_1.IMessageService),
            __param(8, actions_2.IMenuService),
            __param(9, quickOpen_1.IQuickOpenService),
            __param(10, themeService_1.IThemeService)
        ], TabsTitleControl);
        return TabsTitleControl;
    }(titleControl_1.TitleControl));
    exports.TabsTitleControl = TabsTitleControl;
    var TabActionRunner = /** @class */ (function (_super) {
        __extends(TabActionRunner, _super);
        function TabActionRunner(group, index) {
            var _this = _super.call(this) || this;
            _this.group = group;
            _this.index = index;
            return _this;
        }
        TabActionRunner.prototype.run = function (action, context) {
            var group = this.group();
            if (!group) {
                return winjs_base_1.TPromise.as(void 0);
            }
            return _super.prototype.run.call(this, action, { groupId: group.id, editorIndex: this.index });
        };
        return TabActionRunner;
    }(actions_1.ActionRunner));
    themeService_1.registerThemingParticipant(function (theme, collector) {
        // Styling with Outline color (e.g. high contrast theme)
        var activeContrastBorderColor = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (activeContrastBorderColor) {
            collector.addRule("\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title .tabs-container > .tab.active,\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title .tabs-container > .tab.active:hover  {\n\t\t\t\toutline: 1px solid;\n\t\t\t\toutline-offset: -5px;\n\t\t\t}\n\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title .tabs-container > .tab:hover  {\n\t\t\t\toutline: 1px dashed;\n\t\t\t\toutline-offset: -5px;\n\t\t\t}\n\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title .tabs-container > .tab.active > .tab-close .action-label,\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title .tabs-container > .tab.active:hover > .tab-close .action-label,\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title .tabs-container > .tab.dirty > .tab-close .action-label,\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title .tabs-container > .tab:hover > .tab-close .action-label {\n\t\t\t\topacity: 1 !important;\n\t\t\t}\n\t\t");
        }
        // Hover Background
        var tabHoverBackground = theme.getColor(theme_1.TAB_HOVER_BACKGROUND);
        if (tabHoverBackground) {
            collector.addRule("\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title.active .tabs-container > .tab:hover  {\n\t\t\t\tbackground: " + tabHoverBackground + " !important;\n\t\t\t}\n\t\t");
        }
        var tabUnfocusedHoverBackground = theme.getColor(theme_1.TAB_UNFOCUSED_HOVER_BACKGROUND);
        if (tabUnfocusedHoverBackground) {
            collector.addRule("\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title.inactive .tabs-container > .tab:hover  {\n\t\t\t\tbackground: " + tabUnfocusedHoverBackground + " !important;\n\t\t\t}\n\t\t");
        }
        // Hover Border
        var tabHoverBorder = theme.getColor(theme_1.TAB_HOVER_BORDER);
        if (tabHoverBorder) {
            collector.addRule("\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title.active .tabs-container > .tab:hover  {\n\t\t\t\tbox-shadow: " + tabHoverBorder + " 0 -1px inset !important;\n\t\t\t}\n\t\t");
        }
        var tabUnfocusedHoverBorder = theme.getColor(theme_1.TAB_UNFOCUSED_HOVER_BORDER);
        if (tabUnfocusedHoverBorder) {
            collector.addRule("\n\t\t\t.monaco-workbench > .part.editor > .content > .one-editor-silo > .container > .title.inactive .tabs-container > .tab:hover  {\n\t\t\t\tbox-shadow: " + tabUnfocusedHoverBorder + " 0 -1px inset !important;\n\t\t\t}\n\t\t");
        }
        // Fade out styles via linear gradient (when tabs are set to shrink)
        if (theme.type !== 'hc') {
            var workbenchBackground = theme_1.WORKBENCH_BACKGROUND(theme);
            var editorBackgroundColor = theme.getColor(colorRegistry_1.editorBackground);
            var editorGroupBackground = theme.getColor(theme_1.EDITOR_GROUP_BACKGROUND);
            var editorGroupHeaderTabsBackground = theme.getColor(theme_1.EDITOR_GROUP_HEADER_TABS_BACKGROUND);
            var editorDragAndDropBackground = theme.getColor(theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND);
            var adjustedTabBackground = void 0;
            if (editorGroupHeaderTabsBackground && editorBackgroundColor && editorGroupBackground) {
                adjustedTabBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorGroupBackground, editorBackgroundColor, workbenchBackground);
            }
            var adjustedTabDragBackground = void 0;
            if (editorGroupHeaderTabsBackground && editorBackgroundColor && editorDragAndDropBackground && editorBackgroundColor) {
                adjustedTabDragBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorDragAndDropBackground, editorBackgroundColor, workbenchBackground);
            }
            // Adjust gradient for (focused) hover background
            if (tabHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
                var adjustedColor = tabHoverBackground.flatten(adjustedTabBackground);
                var adjustedColorDrag = tabHoverBackground.flatten(adjustedTabDragBackground);
                collector.addRule("\n\t\t\t\t.monaco-workbench > .part.editor > .content:not(.dragged-over) > .one-editor-silo > .container > .title.active .tabs-container > .tab.sizing-shrink:not(.dragged):hover > .tab-label::after {\n\t\t\t\t\tbackground: linear-gradient(to left, " + adjustedColor + ", transparent);\n\t\t\t\t}\n\n\t\t\t\t.monaco-workbench > .part.editor > .content.dragged-over > .one-editor-silo > .container > .title.active .tabs-container > .tab.sizing-shrink:not(.dragged):hover > .tab-label::after {\n\t\t\t\t\tbackground: linear-gradient(to left, " + adjustedColorDrag + ", transparent);\n\t\t\t\t}\n\t\t\t");
            }
            // Adjust gradient for unfocused hover background
            if (tabUnfocusedHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
                var adjustedColor = tabUnfocusedHoverBackground.flatten(adjustedTabBackground);
                var adjustedColorDrag = tabUnfocusedHoverBackground.flatten(adjustedTabDragBackground);
                collector.addRule("\n\t\t\t\t.monaco-workbench > .part.editor > .content:not(.dragged-over) > .one-editor-silo > .container > .title.inactive .tabs-container > .tab.sizing-shrink:not(.dragged):hover > .tab-label::after {\n\t\t\t\t\tbackground: linear-gradient(to left, " + adjustedColor + ", transparent);\n\t\t\t\t}\n\n\t\t\t\t.monaco-workbench > .part.editor > .content.dragged-over > .one-editor-silo > .container > .title.inactive .tabs-container > .tab.sizing-shrink:not(.dragged):hover > .tab-label::after {\n\t\t\t\t\tbackground: linear-gradient(to left, " + adjustedColorDrag + ", transparent);\n\t\t\t\t}\n\t\t\t");
            }
            // Adjust gradient for drag and drop background
            if (editorDragAndDropBackground && adjustedTabDragBackground) {
                var adjustedColorDrag = editorDragAndDropBackground.flatten(adjustedTabDragBackground);
                collector.addRule("\n\t\t\t.monaco-workbench > .part.editor > .content.dragged-over > .one-editor-silo > .container > .title.active .tabs-container > .tab.sizing-shrink.dragged-over:not(.active):not(.dragged) > .tab-label::after,\n\t\t\t.monaco-workbench > .part.editor > .content.dragged-over > .one-editor-silo > .container > .title.inactive .tabs-container > .tab.sizing-shrink.dragged-over:not(.dragged) > .tab-label::after {\n\t\t\t\tbackground: linear-gradient(to left, " + adjustedColorDrag + ", transparent);\n\t\t\t}\n\t\t");
            }
            // Adjust gradient for active tab background
            var tabActiveBackground = theme.getColor(theme_1.TAB_ACTIVE_BACKGROUND);
            if (tabActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                var adjustedColor = tabActiveBackground.flatten(adjustedTabBackground);
                var adjustedColorDrag = tabActiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule("\n\t\t\t\t.monaco-workbench > .part.editor > .content:not(.dragged-over) > .one-editor-silo > .container > .title .tabs-container > .tab.sizing-shrink.active:not(.dragged) > .tab-label::after {\n\t\t\t\t\tbackground: linear-gradient(to left, " + adjustedColor + ", transparent);\n\t\t\t\t}\n\n\t\t\t\t.monaco-workbench > .part.editor > .content.dragged-over > .one-editor-silo > .container > .title .tabs-container > .tab.sizing-shrink.active:not(.dragged) > .tab-label::after {\n\t\t\t\t\tbackground: linear-gradient(to left, " + adjustedColorDrag + ", transparent);\n\t\t\t\t}\n\t\t\t");
            }
            // Adjust gradient for inactive tab background
            var tabInactiveBackground = theme.getColor(theme_1.TAB_INACTIVE_BACKGROUND);
            if (tabInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
                var adjustedColor = tabInactiveBackground.flatten(adjustedTabBackground);
                var adjustedColorDrag = tabInactiveBackground.flatten(adjustedTabDragBackground);
                collector.addRule("\n\t\t\t.monaco-workbench > .part.editor > .content:not(.dragged-over) > .one-editor-silo > .container > .title .tabs-container > .tab.sizing-shrink:not(.dragged) > .tab-label::after {\n\t\t\t\tbackground: linear-gradient(to left, " + adjustedColor + ", transparent);\n\t\t\t}\n\n\t\t\t.monaco-workbench > .part.editor > .content.dragged-over > .one-editor-silo > .container > .title .tabs-container > .tab.sizing-shrink:not(.dragged) > .tab-label::after {\n\t\t\t\tbackground: linear-gradient(to left, " + adjustedColorDrag + ", transparent);\n\t\t\t}\n\t\t");
            }
        }
    });
});
