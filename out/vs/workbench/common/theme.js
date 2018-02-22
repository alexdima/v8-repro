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
define(["require", "exports", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/base/common/lifecycle", "vs/base/common/color"], function (require, exports, nls, colorRegistry_1, lifecycle_1, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // < --- Workbench (not customizable) --- >
    function WORKBENCH_BACKGROUND(theme) {
        switch (theme.type) {
            case 'dark':
                return color_1.Color.fromHex('#252526');
            case 'light':
                return color_1.Color.fromHex('#F3F3F3');
            default:
                return color_1.Color.fromHex('#000000');
        }
    }
    exports.WORKBENCH_BACKGROUND = WORKBENCH_BACKGROUND;
    // < --- Tabs --- >
    exports.TAB_ACTIVE_BACKGROUND = colorRegistry_1.registerColor('tab.activeBackground', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hc: colorRegistry_1.editorBackground
    }, nls.localize('tabActiveBackground', "Active tab background color. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_INACTIVE_BACKGROUND = colorRegistry_1.registerColor('tab.inactiveBackground', {
        dark: '#2D2D2D',
        light: '#ECECEC',
        hc: null
    }, nls.localize('tabInactiveBackground', "Inactive tab background color. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_HOVER_BACKGROUND = colorRegistry_1.registerColor('tab.hoverBackground', {
        dark: null,
        light: null,
        hc: null
    }, nls.localize('tabHoverBackground', "Tab background color when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_HOVER_BACKGROUND = colorRegistry_1.registerColor('tab.unfocusedHoverBackground', {
        dark: colorRegistry_1.transparent(exports.TAB_HOVER_BACKGROUND, 0.5),
        light: colorRegistry_1.transparent(exports.TAB_HOVER_BACKGROUND, 0.7),
        hc: null
    }, nls.localize('tabUnfocusedHoverBackground', "Tab background color in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_BORDER = colorRegistry_1.registerColor('tab.border', {
        dark: '#252526',
        light: '#F3F3F3',
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('tabBorder', "Border to separate tabs from each other. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_ACTIVE_BORDER = colorRegistry_1.registerColor('tab.activeBorder', {
        dark: null,
        light: null,
        hc: null
    }, nls.localize('tabActiveBorder', "Border to highlight active tabs. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_ACTIVE_BORDER = colorRegistry_1.registerColor('tab.unfocusedActiveBorder', {
        dark: colorRegistry_1.transparent(exports.TAB_ACTIVE_BORDER, 0.5),
        light: colorRegistry_1.transparent(exports.TAB_ACTIVE_BORDER, 0.7),
        hc: null
    }, nls.localize('tabActiveUnfocusedBorder', "Border to highlight active tabs in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_HOVER_BORDER = colorRegistry_1.registerColor('tab.hoverBorder', {
        dark: null,
        light: null,
        hc: null
    }, nls.localize('tabHoverBorder', "Border to highlight tabs when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_HOVER_BORDER = colorRegistry_1.registerColor('tab.unfocusedHoverBorder', {
        dark: colorRegistry_1.transparent(exports.TAB_HOVER_BORDER, 0.5),
        light: colorRegistry_1.transparent(exports.TAB_HOVER_BORDER, 0.7),
        hc: null
    }, nls.localize('tabUnfocusedHoverBorder', "Border to highlight tabs in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_ACTIVE_FOREGROUND = colorRegistry_1.registerColor('tab.activeForeground', {
        dark: color_1.Color.white,
        light: '#333333',
        hc: color_1.Color.white
    }, nls.localize('tabActiveForeground', "Active tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_INACTIVE_FOREGROUND = colorRegistry_1.registerColor('tab.inactiveForeground', {
        dark: colorRegistry_1.transparent(exports.TAB_ACTIVE_FOREGROUND, 0.5),
        light: colorRegistry_1.transparent(exports.TAB_ACTIVE_FOREGROUND, 0.5),
        hc: color_1.Color.white
    }, nls.localize('tabInactiveForeground', "Inactive tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_ACTIVE_FOREGROUND = colorRegistry_1.registerColor('tab.unfocusedActiveForeground', {
        dark: colorRegistry_1.transparent(exports.TAB_ACTIVE_FOREGROUND, 0.5),
        light: colorRegistry_1.transparent(exports.TAB_ACTIVE_FOREGROUND, 0.7),
        hc: color_1.Color.white
    }, nls.localize('tabUnfocusedActiveForeground', "Active tab foreground color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    exports.TAB_UNFOCUSED_INACTIVE_FOREGROUND = colorRegistry_1.registerColor('tab.unfocusedInactiveForeground', {
        dark: colorRegistry_1.transparent(exports.TAB_INACTIVE_FOREGROUND, 0.5),
        light: colorRegistry_1.transparent(exports.TAB_INACTIVE_FOREGROUND, 0.5),
        hc: color_1.Color.white
    }, nls.localize('tabUnfocusedInactiveForeground', "Inactive tab foreground color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));
    // < --- Editors --- >
    exports.EDITOR_GROUP_BACKGROUND = colorRegistry_1.registerColor('editorGroup.background', {
        dark: '#2D2D2D',
        light: '#ECECEC',
        hc: null
    }, nls.localize('editorGroupBackground', "Background color of an editor group. Editor groups are the containers of editors. The background color shows up when dragging editor groups around."));
    exports.EDITOR_GROUP_HEADER_TABS_BACKGROUND = colorRegistry_1.registerColor('editorGroupHeader.tabsBackground', {
        dark: '#252526',
        light: '#F3F3F3',
        hc: null
    }, nls.localize('tabsContainerBackground', "Background color of the editor group title header when tabs are enabled. Editor groups are the containers of editors."));
    exports.EDITOR_GROUP_HEADER_TABS_BORDER = colorRegistry_1.registerColor('editorGroupHeader.tabsBorder', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('tabsContainerBorder', "Border color of the editor group title header when tabs are enabled. Editor groups are the containers of editors."));
    exports.EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND = colorRegistry_1.registerColor('editorGroupHeader.noTabsBackground', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hc: colorRegistry_1.editorBackground
    }, nls.localize('editorGroupHeaderBackground', "Background color of the editor group title header when tabs are disabled (`\"workbench.editor.showTabs\": false`). Editor groups are the containers of editors."));
    exports.EDITOR_GROUP_BORDER = colorRegistry_1.registerColor('editorGroup.border', {
        dark: '#444444',
        light: '#E7E7E7',
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('editorGroupBorder', "Color to separate multiple editor groups from each other. Editor groups are the containers of editors."));
    exports.EDITOR_DRAG_AND_DROP_BACKGROUND = colorRegistry_1.registerColor('editorGroup.dropBackground', {
        dark: color_1.Color.fromHex('#53595D').transparent(0.5),
        light: color_1.Color.fromHex('#3399FF').transparent(0.18),
        hc: null
    }, nls.localize('editorDragAndDropBackground', "Background color when dragging editors around. The color should have transparency so that the editor contents can still shine through."));
    // < --- Panels --- >
    exports.PANEL_BACKGROUND = colorRegistry_1.registerColor('panel.background', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hc: colorRegistry_1.editorBackground
    }, nls.localize('panelBackground', "Panel background color. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_BORDER = colorRegistry_1.registerColor('panel.border', {
        dark: color_1.Color.fromHex('#808080').transparent(0.35),
        light: color_1.Color.fromHex('#808080').transparent(0.35),
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('panelBorder', "Panel border color to separate the panel from the editor. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_ACTIVE_TITLE_FOREGROUND = colorRegistry_1.registerColor('panelTitle.activeForeground', {
        dark: '#E7E7E7',
        light: '#424242',
        hc: color_1.Color.white
    }, nls.localize('panelActiveTitleForeground', "Title color for the active panel. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_INACTIVE_TITLE_FOREGROUND = colorRegistry_1.registerColor('panelTitle.inactiveForeground', {
        dark: colorRegistry_1.transparent(exports.PANEL_ACTIVE_TITLE_FOREGROUND, 0.5),
        light: colorRegistry_1.transparent(exports.PANEL_ACTIVE_TITLE_FOREGROUND, 0.75),
        hc: color_1.Color.white
    }, nls.localize('panelInactiveTitleForeground', "Title color for the inactive panel. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_ACTIVE_TITLE_BORDER = colorRegistry_1.registerColor('panelTitle.activeBorder', {
        dark: exports.PANEL_BORDER,
        light: exports.PANEL_BORDER,
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('panelActiveTitleBorder', "Border color for the active panel title. Panels are shown below the editor area and contain views like output and integrated terminal."));
    exports.PANEL_DRAG_AND_DROP_BACKGROUND = colorRegistry_1.registerColor('panel.dropBackground', {
        dark: color_1.Color.white.transparent(0.12),
        light: color_1.Color.fromHex('#3399FF').transparent(0.18),
        hc: color_1.Color.white.transparent(0.12)
    }, nls.localize('panelDragAndDropBackground', "Drag and drop feedback color for the panel title items. The color should have transparency so that the panel entries can still shine through. Panels are shown below the editor area and contain views like output and integrated terminal."));
    // < --- Status --- >
    exports.STATUS_BAR_FOREGROUND = colorRegistry_1.registerColor('statusBar.foreground', {
        dark: '#FFFFFF',
        light: '#FFFFFF',
        hc: '#FFFFFF'
    }, nls.localize('statusBarForeground', "Status bar foreground color when a workspace is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_NO_FOLDER_FOREGROUND = colorRegistry_1.registerColor('statusBar.noFolderForeground', {
        dark: exports.STATUS_BAR_FOREGROUND,
        light: exports.STATUS_BAR_FOREGROUND,
        hc: exports.STATUS_BAR_FOREGROUND
    }, nls.localize('statusBarNoFolderForeground', "Status bar foreground color when no folder is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_BACKGROUND = colorRegistry_1.registerColor('statusBar.background', {
        dark: '#007ACC',
        light: '#007ACC',
        hc: null
    }, nls.localize('statusBarBackground', "Status bar background color when a workspace is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_NO_FOLDER_BACKGROUND = colorRegistry_1.registerColor('statusBar.noFolderBackground', {
        dark: '#68217A',
        light: '#68217A',
        hc: null
    }, nls.localize('statusBarNoFolderBackground', "Status bar background color when no folder is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_BORDER = colorRegistry_1.registerColor('statusBar.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('statusBarBorder', "Status bar border color separating to the sidebar and editor. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_NO_FOLDER_BORDER = colorRegistry_1.registerColor('statusBar.noFolderBorder', {
        dark: exports.STATUS_BAR_BORDER,
        light: exports.STATUS_BAR_BORDER,
        hc: exports.STATUS_BAR_BORDER
    }, nls.localize('statusBarNoFolderBorder', "Status bar border color separating to the sidebar and editor when no folder is opened. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ITEM_ACTIVE_BACKGROUND = colorRegistry_1.registerColor('statusBarItem.activeBackground', {
        dark: color_1.Color.white.transparent(0.18),
        light: color_1.Color.white.transparent(0.18),
        hc: color_1.Color.white.transparent(0.18)
    }, nls.localize('statusBarItemActiveBackground', "Status bar item background color when clicking. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_ITEM_HOVER_BACKGROUND = colorRegistry_1.registerColor('statusBarItem.hoverBackground', {
        dark: color_1.Color.white.transparent(0.12),
        light: color_1.Color.white.transparent(0.12),
        hc: color_1.Color.white.transparent(0.12)
    }, nls.localize('statusBarItemHoverBackground', "Status bar item background color when hovering. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_PROMINENT_ITEM_BACKGROUND = colorRegistry_1.registerColor('statusBarItem.prominentBackground', {
        dark: '#388A34',
        light: '#388A34',
        hc: '#3883A4'
    }, nls.localize('statusBarProminentItemBackground', "Status bar prominent items background color. Prominent items stand out from other status bar entries to indicate importance. Change mode `Toggle Tab Key Moves Focus` from command palette to see an example. The status bar is shown in the bottom of the window."));
    exports.STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND = colorRegistry_1.registerColor('statusBarItem.prominentHoverBackground', {
        dark: '#369432',
        light: '#369432',
        hc: '#369432'
    }, nls.localize('statusBarProminentItemHoverBackground', "Status bar prominent items background color when hovering. Prominent items stand out from other status bar entries to indicate importance. Change mode `Toggle Tab Key Moves Focus` from command palette to see an example. The status bar is shown in the bottom of the window."));
    // < --- Activity Bar --- >
    exports.ACTIVITY_BAR_BACKGROUND = colorRegistry_1.registerColor('activityBar.background', {
        dark: '#333333',
        light: '#2C2C2C',
        hc: '#000000'
    }, nls.localize('activityBarBackground', "Activity bar background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_FOREGROUND = colorRegistry_1.registerColor('activityBar.foreground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hc: color_1.Color.white
    }, nls.localize('activityBarForeground', "Activity bar foreground color (e.g. used for the icons). The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_BORDER = colorRegistry_1.registerColor('activityBar.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('activityBarBorder', "Activity bar border color separating to the side bar. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_DRAG_AND_DROP_BACKGROUND = colorRegistry_1.registerColor('activityBar.dropBackground', {
        dark: color_1.Color.white.transparent(0.12),
        light: color_1.Color.white.transparent(0.12),
        hc: color_1.Color.white.transparent(0.12),
    }, nls.localize('activityBarDragAndDropBackground', "Drag and drop feedback color for the activity bar items. The color should have transparency so that the activity bar entries can still shine through. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_BADGE_BACKGROUND = colorRegistry_1.registerColor('activityBarBadge.background', {
        dark: '#007ACC',
        light: '#007ACC',
        hc: '#000000'
    }, nls.localize('activityBarBadgeBackground', "Activity notification badge background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    exports.ACTIVITY_BAR_BADGE_FOREGROUND = colorRegistry_1.registerColor('activityBarBadge.foreground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hc: color_1.Color.white
    }, nls.localize('activityBarBadgeForeground', "Activity notification badge foreground color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));
    // < --- Side Bar --- >
    exports.SIDE_BAR_BACKGROUND = colorRegistry_1.registerColor('sideBar.background', {
        dark: '#252526',
        light: '#F3F3F3',
        hc: '#000000'
    }, nls.localize('sideBarBackground', "Side bar background color. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_FOREGROUND = colorRegistry_1.registerColor('sideBar.foreground', {
        dark: null,
        light: null,
        hc: null
    }, nls.localize('sideBarForeground', "Side bar foreground color. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_BORDER = colorRegistry_1.registerColor('sideBar.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('sideBarBorder', "Side bar border color on the side separating to the editor. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_TITLE_FOREGROUND = colorRegistry_1.registerColor('sideBarTitle.foreground', {
        dark: exports.SIDE_BAR_FOREGROUND,
        light: exports.SIDE_BAR_FOREGROUND,
        hc: exports.SIDE_BAR_FOREGROUND
    }, nls.localize('sideBarTitleForeground', "Side bar title foreground color. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_DRAG_AND_DROP_BACKGROUND = colorRegistry_1.registerColor('sideBar.dropBackground', {
        dark: color_1.Color.white.transparent(0.12),
        light: color_1.Color.white.transparent(0.12),
        hc: color_1.Color.white.transparent(0.12),
    }, nls.localize('sideBarDragAndDropBackground', "Drag and drop feedback color for the side bar sections. The color should have transparency so that the side bar sections can still shine through. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_SECTION_HEADER_BACKGROUND = colorRegistry_1.registerColor('sideBarSectionHeader.background', {
        dark: color_1.Color.fromHex('#808080').transparent(0.2),
        light: color_1.Color.fromHex('#808080').transparent(0.2),
        hc: null
    }, nls.localize('sideBarSectionHeaderBackground', "Side bar section header background color. The side bar is the container for views like explorer and search."));
    exports.SIDE_BAR_SECTION_HEADER_FOREGROUND = colorRegistry_1.registerColor('sideBarSectionHeader.foreground', {
        dark: exports.SIDE_BAR_FOREGROUND,
        light: exports.SIDE_BAR_FOREGROUND,
        hc: exports.SIDE_BAR_FOREGROUND
    }, nls.localize('sideBarSectionHeaderForeground', "Side bar section header foreground color. The side bar is the container for views like explorer and search."));
    // < --- Title Bar --- >
    exports.TITLE_BAR_ACTIVE_FOREGROUND = colorRegistry_1.registerColor('titleBar.activeForeground', {
        dark: '#CCCCCC',
        light: '#333333',
        hc: '#FFFFFF'
    }, nls.localize('titleBarActiveForeground', "Title bar foreground when the window is active. Note that this color is currently only supported on macOS."));
    exports.TITLE_BAR_INACTIVE_FOREGROUND = colorRegistry_1.registerColor('titleBar.inactiveForeground', {
        dark: colorRegistry_1.transparent(exports.TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
        light: colorRegistry_1.transparent(exports.TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
        hc: null
    }, nls.localize('titleBarInactiveForeground', "Title bar foreground when the window is inactive. Note that this color is currently only supported on macOS."));
    exports.TITLE_BAR_ACTIVE_BACKGROUND = colorRegistry_1.registerColor('titleBar.activeBackground', {
        dark: '#3C3C3C',
        light: '#DDDDDD',
        hc: '#000000'
    }, nls.localize('titleBarActiveBackground', "Title bar background when the window is active. Note that this color is currently only supported on macOS."));
    exports.TITLE_BAR_INACTIVE_BACKGROUND = colorRegistry_1.registerColor('titleBar.inactiveBackground', {
        dark: colorRegistry_1.transparent(exports.TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
        light: colorRegistry_1.transparent(exports.TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
        hc: null
    }, nls.localize('titleBarInactiveBackground', "Title bar background when the window is inactive. Note that this color is currently only supported on macOS."));
    exports.TITLE_BAR_BORDER = colorRegistry_1.registerColor('titleBar.border', {
        dark: null,
        light: null,
        hc: null
    }, nls.localize('titleBarBorder', "Title bar border color. Note that this color is currently only supported on macOS."));
    // < --- Notifications --- >
    exports.NOTIFICATIONS_FOREGROUND = colorRegistry_1.registerColor('notification.foreground', {
        dark: '#EEEEEE',
        light: '#EEEEEE',
        hc: '#FFFFFF'
    }, nls.localize('notificationsForeground', "Notifications foreground color. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_BACKGROUND = colorRegistry_1.registerColor('notification.background', {
        dark: '#333333',
        light: '#2C2C2C',
        hc: '#000000'
    }, nls.localize('notificationsBackground', "Notifications background color. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_BUTTON_BACKGROUND = colorRegistry_1.registerColor('notification.buttonBackground', {
        dark: '#0E639C',
        light: '#007ACC',
        hc: null
    }, nls.localize('notificationsButtonBackground', "Notifications button background color. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_BUTTON_HOVER_BACKGROUND = colorRegistry_1.registerColor('notification.buttonHoverBackground', {
        dark: colorRegistry_1.lighten(exports.NOTIFICATIONS_BUTTON_BACKGROUND, 0.2),
        light: colorRegistry_1.darken(exports.NOTIFICATIONS_BUTTON_BACKGROUND, 0.2),
        hc: null
    }, nls.localize('notificationsButtonHoverBackground', "Notifications button background color when hovering. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_BUTTON_FOREGROUND = colorRegistry_1.registerColor('notification.buttonForeground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hc: color_1.Color.white
    }, nls.localize('notificationsButtonForeground', "Notifications button foreground color. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_INFO_BACKGROUND = colorRegistry_1.registerColor('notification.infoBackground', {
        dark: '#007acc',
        light: '#007acc',
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('notificationsInfoBackground', "Notifications info background color. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_INFO_FOREGROUND = colorRegistry_1.registerColor('notification.infoForeground', {
        dark: exports.NOTIFICATIONS_FOREGROUND,
        light: exports.NOTIFICATIONS_FOREGROUND,
        hc: null
    }, nls.localize('notificationsInfoForeground', "Notifications info foreground color. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_WARNING_BACKGROUND = colorRegistry_1.registerColor('notification.warningBackground', {
        dark: '#B89500',
        light: '#B89500',
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('notificationsWarningBackground', "Notifications warning background color. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_WARNING_FOREGROUND = colorRegistry_1.registerColor('notification.warningForeground', {
        dark: exports.NOTIFICATIONS_FOREGROUND,
        light: exports.NOTIFICATIONS_FOREGROUND,
        hc: null
    }, nls.localize('notificationsWarningForeground', "Notifications warning foreground color. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_ERROR_BACKGROUND = colorRegistry_1.registerColor('notification.errorBackground', {
        dark: '#BE1100',
        light: '#BE1100',
        hc: colorRegistry_1.contrastBorder
    }, nls.localize('notificationsErrorBackground', "Notifications error background color. Notifications slide in from the top of the window."));
    exports.NOTIFICATIONS_ERROR_FOREGROUND = colorRegistry_1.registerColor('notification.errorForeground', {
        dark: exports.NOTIFICATIONS_FOREGROUND,
        light: exports.NOTIFICATIONS_FOREGROUND,
        hc: null
    }, nls.localize('notificationsErrorForeground', "Notifications error foreground color. Notifications slide in from the top of the window."));
    /**
     * Base class for all themable workbench components.
     */
    var Themable = /** @class */ (function (_super) {
        __extends(Themable, _super);
        function Themable(themeService) {
            var _this = _super.call(this) || this;
            _this.themeService = themeService;
            _this._toUnbind = [];
            _this.theme = themeService.getTheme();
            // Hook up to theme changes
            _this._toUnbind.push(_this.themeService.onThemeChange(function (theme) { return _this.onThemeChange(theme); }));
            return _this;
        }
        Object.defineProperty(Themable.prototype, "toUnbind", {
            get: function () {
                return this._toUnbind;
            },
            enumerable: true,
            configurable: true
        });
        Themable.prototype.onThemeChange = function (theme) {
            this.theme = theme;
            this.updateStyles();
        };
        Themable.prototype.updateStyles = function () {
            // Subclasses to override
        };
        Themable.prototype.getColor = function (id, modify) {
            var color = this.theme.getColor(id);
            if (color && modify) {
                color = modify(color, this.theme);
            }
            return color ? color.toString() : null;
        };
        Themable.prototype.dispose = function () {
            this._toUnbind = lifecycle_1.dispose(this._toUnbind);
            _super.prototype.dispose.call(this);
        };
        return Themable;
    }(lifecycle_1.Disposable));
    exports.Themable = Themable;
});
