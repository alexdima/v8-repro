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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/browser/builder", "vs/base/browser/dom", "vs/base/common/paths", "vs/workbench/browser/part", "vs/base/browser/browser", "vs/platform/windows/common/windows", "vs/base/common/errors", "vs/platform/contextview/browser/contextView", "vs/base/browser/mouseEvent", "vs/base/common/actions", "vs/platform/configuration/common/configuration", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/group/common/groupService", "vs/base/common/lifecycle", "vs/nls", "vs/base/common/labels", "vs/workbench/common/editor", "vs/platform/environment/common/environment", "vs/platform/workspace/common/workspace", "vs/platform/editor/common/editor", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/base/common/platform", "vs/platform/lifecycle/common/lifecycle", "vs/base/common/strings", "vs/css!./media/titlebarpart"], function (require, exports, winjs_base_1, builder_1, DOM, paths, part_1, browser_1, windows_1, errors, contextView_1, mouseEvent_1, actions_1, configuration_1, editorService_1, groupService_1, lifecycle_1, nls, labels, editor_1, environment_1, workspace_1, editor_2, themeService_1, theme_1, platform_1, lifecycle_2, strings_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TitlebarPart = /** @class */ (function (_super) {
        __extends(TitlebarPart, _super);
        function TitlebarPart(id, contextMenuService, windowService, configurationService, windowsService, editorService, editorGroupService, environmentService, contextService, themeService, lifecycleService) {
            var _this = _super.call(this, id, { hasTitle: false }, themeService) || this;
            _this.contextMenuService = contextMenuService;
            _this.windowService = windowService;
            _this.configurationService = configurationService;
            _this.windowsService = windowsService;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.environmentService = environmentService;
            _this.contextService = contextService;
            _this.lifecycleService = lifecycleService;
            _this.properties = { isPure: true, isAdmin: false };
            _this.activeEditorListeners = [];
            _this.init();
            _this.registerListeners();
            return _this;
        }
        TitlebarPart.prototype.init = function () {
            var _this = this;
            // Initial window title when loading is done
            this.lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () { return _this.setTitle(_this.getWindowTitle()); });
        };
        TitlebarPart.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(DOM.addDisposableListener(window, DOM.EventType.BLUR, function () { return _this.onBlur(); }));
            this.toUnbind.push(DOM.addDisposableListener(window, DOM.EventType.FOCUS, function () { return _this.onFocus(); }));
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationChanged(e); }));
            this.toUnbind.push(this.editorGroupService.onEditorsChanged(function () { return _this.onEditorsChanged(); }));
            this.toUnbind.push(this.contextService.onDidChangeWorkspaceFolders(function () { return _this.setTitle(_this.getWindowTitle()); }));
            this.toUnbind.push(this.contextService.onDidChangeWorkbenchState(function () { return _this.setTitle(_this.getWindowTitle()); }));
            this.toUnbind.push(this.contextService.onDidChangeWorkspaceName(function () { return _this.setTitle(_this.getWindowTitle()); }));
        };
        TitlebarPart.prototype.onBlur = function () {
            this.isInactive = true;
            this.updateStyles();
        };
        TitlebarPart.prototype.onFocus = function () {
            this.isInactive = false;
            this.updateStyles();
        };
        TitlebarPart.prototype.onConfigurationChanged = function (event) {
            if (event.affectsConfiguration('window.title')) {
                this.setTitle(this.getWindowTitle());
            }
        };
        TitlebarPart.prototype.onEditorsChanged = function () {
            var _this = this;
            // Dispose old listeners
            lifecycle_1.dispose(this.activeEditorListeners);
            this.activeEditorListeners = [];
            var activeEditor = this.editorService.getActiveEditor();
            var activeInput = activeEditor ? activeEditor.input : void 0;
            // Calculate New Window Title
            this.setTitle(this.getWindowTitle());
            // Apply listener for dirty and label changes
            if (activeInput instanceof editor_1.EditorInput) {
                this.activeEditorListeners.push(activeInput.onDidChangeDirty(function () {
                    _this.setTitle(_this.getWindowTitle());
                }));
                this.activeEditorListeners.push(activeInput.onDidChangeLabel(function () {
                    _this.setTitle(_this.getWindowTitle());
                }));
            }
        };
        TitlebarPart.prototype.getWindowTitle = function () {
            var title = this.doGetWindowTitle();
            if (!strings_1.trim(title)) {
                title = this.environmentService.appNameLong;
            }
            if (this.properties.isAdmin) {
                title = title + " " + TitlebarPart.NLS_USER_IS_ADMIN;
            }
            if (!this.properties.isPure) {
                title = title + " " + TitlebarPart.NLS_UNSUPPORTED;
            }
            // Extension Development Host gets a special title to identify itself
            if (this.environmentService.isExtensionDevelopment) {
                title = TitlebarPart.NLS_EXTENSION_HOST + " - " + title;
            }
            return title;
        };
        TitlebarPart.prototype.updateProperties = function (properties) {
            var isAdmin = typeof properties.isAdmin === 'boolean' ? properties.isAdmin : this.properties.isAdmin;
            var isPure = typeof properties.isPure === 'boolean' ? properties.isPure : this.properties.isPure;
            if (isAdmin !== this.properties.isAdmin || isPure !== this.properties.isPure) {
                this.properties.isAdmin = isAdmin;
                this.properties.isPure = isPure;
                this.setTitle(this.getWindowTitle());
            }
        };
        /**
         * Possible template values:
         *
         * {activeEditorLong}: e.g. /Users/Development/myProject/myFolder/myFile.txt
         * {activeEditorMedium}: e.g. myFolder/myFile.txt
         * {activeEditorShort}: e.g. myFile.txt
         * {rootName}: e.g. myFolder1, myFolder2, myFolder3
         * {rootPath}: e.g. /Users/Development/myProject
         * {folderName}: e.g. myFolder
         * {folderPath}: e.g. /Users/Development/myFolder
         * {appName}: e.g. VS Code
         * {dirty}: indiactor
         * {separator}: conditional separator
         */
        TitlebarPart.prototype.doGetWindowTitle = function () {
            var input = this.editorService.getActiveEditorInput();
            var workspace = this.contextService.getWorkspace();
            var root;
            if (workspace.configuration) {
                root = workspace.configuration;
            }
            else if (workspace.folders.length) {
                root = workspace.folders[0].uri;
            }
            // Compute folder resource
            // Single Root Workspace: always the root single workspace in this case
            // Otherwise: root folder of the currently active file if any
            var folder = this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.FOLDER ? workspace.folders[0] : this.contextService.getWorkspaceFolder(editor_1.toResource(input, { supportSideBySide: true }));
            // Variables
            var activeEditorShort = input ? input.getTitle(editor_2.Verbosity.SHORT) : '';
            var activeEditorMedium = input ? input.getTitle(editor_2.Verbosity.MEDIUM) : activeEditorShort;
            var activeEditorLong = input ? input.getTitle(editor_2.Verbosity.LONG) : activeEditorMedium;
            var rootName = workspace.name;
            var rootPath = root ? labels.getPathLabel(root, void 0, this.environmentService) : '';
            var folderName = folder ? folder.name : '';
            var folderPath = folder ? labels.getPathLabel(folder.uri, void 0, this.environmentService) : '';
            var dirty = input && input.isDirty() ? TitlebarPart.TITLE_DIRTY : '';
            var appName = this.environmentService.appNameLong;
            var separator = TitlebarPart.TITLE_SEPARATOR;
            var titleTemplate = this.configurationService.getValue('window.title');
            return labels.template(titleTemplate, {
                activeEditorShort: activeEditorShort,
                activeEditorLong: activeEditorLong,
                activeEditorMedium: activeEditorMedium,
                rootName: rootName,
                rootPath: rootPath,
                folderName: folderName,
                folderPath: folderPath,
                dirty: dirty,
                appName: appName,
                separator: { label: separator }
            });
        };
        TitlebarPart.prototype.createContentArea = function (parent) {
            var _this = this;
            this.titleContainer = builder_1.$(parent);
            // Title
            this.title = builder_1.$(this.titleContainer).div({ class: 'window-title' });
            if (this.pendingTitle) {
                this.title.text(this.pendingTitle);
            }
            // Maximize/Restore on doubleclick
            this.titleContainer.on(DOM.EventType.DBLCLICK, function (e) {
                DOM.EventHelper.stop(e);
                _this.onTitleDoubleclick();
            });
            // Context menu on title
            this.title.on([DOM.EventType.CONTEXT_MENU, DOM.EventType.MOUSE_DOWN], function (e) {
                if (e.type === DOM.EventType.CONTEXT_MENU || e.metaKey) {
                    DOM.EventHelper.stop(e);
                    _this.onContextMenu(e);
                }
            });
            // Since the title area is used to drag the window, we do not want to steal focus from the
            // currently active element. So we restore focus after a timeout back to where it was.
            this.titleContainer.on([DOM.EventType.MOUSE_DOWN], function () {
                var active = document.activeElement;
                setTimeout(function () {
                    if (active instanceof HTMLElement) {
                        active.focus();
                    }
                }, 0 /* need a timeout because we are in capture phase */);
            }, void 0, true /* use capture to know the currently active element properly */);
            return this.titleContainer;
        };
        TitlebarPart.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            // Part container
            var container = this.getContainer();
            if (container) {
                container.style('color', this.getColor(this.isInactive ? theme_1.TITLE_BAR_INACTIVE_FOREGROUND : theme_1.TITLE_BAR_ACTIVE_FOREGROUND));
                container.style('background-color', this.getColor(this.isInactive ? theme_1.TITLE_BAR_INACTIVE_BACKGROUND : theme_1.TITLE_BAR_ACTIVE_BACKGROUND));
                var titleBorder = this.getColor(theme_1.TITLE_BAR_BORDER);
                container.style('border-bottom', titleBorder ? "1px solid " + titleBorder : null);
            }
        };
        TitlebarPart.prototype.onTitleDoubleclick = function () {
            this.windowService.onWindowTitleDoubleClick().then(null, errors.onUnexpectedError);
        };
        TitlebarPart.prototype.onContextMenu = function (e) {
            // Find target anchor
            var event = new mouseEvent_1.StandardMouseEvent(e);
            var anchor = { x: event.posx, y: event.posy };
            // Show menu
            var actions = this.getContextMenuActions();
            if (actions.length) {
                this.contextMenuService.showContextMenu({
                    getAnchor: function () { return anchor; },
                    getActions: function () { return winjs_base_1.TPromise.as(actions); },
                    onHide: function () { return actions.forEach(function (a) { return a.dispose(); }); }
                });
            }
        };
        TitlebarPart.prototype.getContextMenuActions = function () {
            var actions = [];
            if (this.representedFileName) {
                var segments = this.representedFileName.split(paths.sep);
                for (var i = segments.length; i > 0; i--) {
                    var isFile = (i === segments.length);
                    var pathOffset = i;
                    if (!isFile) {
                        pathOffset++; // for segments which are not the file name we want to open the folder
                    }
                    var path = segments.slice(0, pathOffset).join(paths.sep);
                    var label = void 0;
                    if (!isFile) {
                        label = labels.getBaseLabel(paths.dirname(path));
                    }
                    else {
                        label = labels.getBaseLabel(path);
                    }
                    actions.push(new ShowItemInFolderAction(path, label || paths.sep, this.windowsService));
                }
            }
            return actions;
        };
        TitlebarPart.prototype.setTitle = function (title) {
            // Always set the native window title to identify us properly to the OS
            window.document.title = title;
            // Apply if we can
            if (this.title) {
                this.title.text(title);
            }
            else {
                this.pendingTitle = title;
            }
        };
        TitlebarPart.prototype.setRepresentedFilename = function (path) {
            // Apply to window
            this.windowService.setRepresentedFilename(path);
            // Keep for context menu
            this.representedFileName = path;
        };
        TitlebarPart.prototype.layout = function (dimension) {
            // To prevent zooming we need to adjust the font size with the zoom factor
            if (typeof this.initialTitleFontSize !== 'number') {
                this.initialTitleFontSize = parseInt(this.titleContainer.getComputedStyle().fontSize, 10);
            }
            this.titleContainer.style({ fontSize: this.initialTitleFontSize / browser_1.getZoomFactor() + "px" });
            return _super.prototype.layout.call(this, dimension);
        };
        TitlebarPart.NLS_UNSUPPORTED = nls.localize('patchedWindowTitle', "[Unsupported]");
        TitlebarPart.NLS_USER_IS_ADMIN = platform_1.isWindows ? nls.localize('userIsAdmin', "[Administrator]") : nls.localize('userIsSudo', "[Superuser]");
        TitlebarPart.NLS_EXTENSION_HOST = nls.localize('devExtensionWindowTitlePrefix', "[Extension Development Host]");
        TitlebarPart.TITLE_DIRTY = '\u25cf ';
        TitlebarPart.TITLE_SEPARATOR = platform_1.isMacintosh ? ' — ' : ' - '; // macOS uses special - separator
        TitlebarPart = __decorate([
            __param(1, contextView_1.IContextMenuService),
            __param(2, windows_1.IWindowService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, windows_1.IWindowsService),
            __param(5, editorService_1.IWorkbenchEditorService),
            __param(6, groupService_1.IEditorGroupService),
            __param(7, environment_1.IEnvironmentService),
            __param(8, workspace_1.IWorkspaceContextService),
            __param(9, themeService_1.IThemeService),
            __param(10, lifecycle_2.ILifecycleService)
        ], TitlebarPart);
        return TitlebarPart;
    }(part_1.Part));
    exports.TitlebarPart = TitlebarPart;
    var ShowItemInFolderAction = /** @class */ (function (_super) {
        __extends(ShowItemInFolderAction, _super);
        function ShowItemInFolderAction(path, label, windowsService) {
            var _this = _super.call(this, 'showItemInFolder.action.id', label) || this;
            _this.path = path;
            _this.windowsService = windowsService;
            return _this;
        }
        ShowItemInFolderAction.prototype.run = function () {
            return this.windowsService.showItemInFolder(this.path);
        };
        return ShowItemInFolderAction;
    }(actions_1.Action));
});
