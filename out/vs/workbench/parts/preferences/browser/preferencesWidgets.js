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
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/browser/builder", "vs/base/browser/dom", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/base/browser/keyboardEvent", "vs/editor/browser/editorBrowser", "vs/base/browser/ui/inputbox/inputBox", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/workspace/common/workspace", "vs/base/common/actions", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/htmlContent", "vs/platform/configuration/common/configuration", "vs/workbench/common/theme", "vs/editor/common/model"], function (require, exports, nls_1, uri_1, builder_1, DOM, winjs_base_1, lifecycle_1, widget_1, event_1, keyboardEvent_1, editorBrowser_1, inputBox_1, instantiation_1, contextView_1, keybinding_1, workspace_1, actions_1, styler_1, themeService_1, colorRegistry_1, actionbar_1, htmlContent_1, configuration_1, theme_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SettingsHeaderWidget = /** @class */ (function (_super) {
        __extends(SettingsHeaderWidget, _super);
        function SettingsHeaderWidget(editor, title) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.title = title;
            _this.create();
            _this._register(_this.editor.onDidChangeConfiguration(function () { return _this.layout(); }));
            _this._register(_this.editor.onDidLayoutChange(function () { return _this.layout(); }));
            return _this;
        }
        Object.defineProperty(SettingsHeaderWidget.prototype, "domNode", {
            get: function () {
                return this._domNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SettingsHeaderWidget.prototype, "heightInLines", {
            get: function () {
                return 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SettingsHeaderWidget.prototype, "afterLineNumber", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        SettingsHeaderWidget.prototype.create = function () {
            var _this = this;
            this._domNode = DOM.$('.settings-header-widget');
            this.titleContainer = DOM.append(this._domNode, DOM.$('.title-container'));
            if (this.title) {
                DOM.append(this.titleContainer, DOM.$('.title')).textContent = this.title;
            }
            this.messageElement = DOM.append(this.titleContainer, DOM.$('.message'));
            if (this.title) {
                this.messageElement.style.paddingLeft = '12px';
            }
            this.editor.changeViewZones(function (accessor) {
                _this.id = accessor.addZone(_this);
                _this.layout();
            });
        };
        SettingsHeaderWidget.prototype.setMessage = function (message) {
            this.messageElement.textContent = message;
        };
        SettingsHeaderWidget.prototype.layout = function () {
            var configuration = this.editor.getConfiguration();
            this.titleContainer.style.fontSize = configuration.fontInfo.fontSize + 'px';
            if (!configuration.contribInfo.folding) {
                this.titleContainer.style.paddingLeft = '6px';
            }
        };
        SettingsHeaderWidget.prototype.dispose = function () {
            var _this = this;
            this.editor.changeViewZones(function (accessor) {
                accessor.removeZone(_this.id);
            });
            _super.prototype.dispose.call(this);
        };
        return SettingsHeaderWidget;
    }(widget_1.Widget));
    exports.SettingsHeaderWidget = SettingsHeaderWidget;
    var DefaultSettingsHeaderWidget = /** @class */ (function (_super) {
        __extends(DefaultSettingsHeaderWidget, _super);
        function DefaultSettingsHeaderWidget() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._onClick = _this._register(new event_1.Emitter());
            _this.onClick = _this._onClick.event;
            return _this;
        }
        DefaultSettingsHeaderWidget.prototype.create = function () {
            _super.prototype.create.call(this);
            this.toggleMessage(true);
        };
        DefaultSettingsHeaderWidget.prototype.toggleMessage = function (hasSettings) {
            if (hasSettings) {
                this.setMessage(nls_1.localize('defaultSettings', "Place your settings in the right hand side editor to override."));
            }
            else {
                this.setMessage(nls_1.localize('noSettingsFound', "No Settings Found."));
            }
        };
        return DefaultSettingsHeaderWidget;
    }(SettingsHeaderWidget));
    exports.DefaultSettingsHeaderWidget = DefaultSettingsHeaderWidget;
    var SettingsGroupTitleWidget = /** @class */ (function (_super) {
        __extends(SettingsGroupTitleWidget, _super);
        function SettingsGroupTitleWidget(editor, settingsGroup) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.settingsGroup = settingsGroup;
            _this._onToggled = _this._register(new event_1.Emitter());
            _this.onToggled = _this._onToggled.event;
            _this.create();
            _this._register(_this.editor.onDidChangeConfiguration(function () { return _this.layout(); }));
            _this._register(_this.editor.onDidLayoutChange(function () { return _this.layout(); }));
            _this._register(_this.editor.onDidChangeCursorPosition(function (e) { return _this.onCursorChange(e); }));
            return _this;
        }
        Object.defineProperty(SettingsGroupTitleWidget.prototype, "domNode", {
            get: function () {
                return this._domNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SettingsGroupTitleWidget.prototype, "heightInLines", {
            get: function () {
                return 1.5;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SettingsGroupTitleWidget.prototype, "afterLineNumber", {
            get: function () {
                return this._afterLineNumber;
            },
            enumerable: true,
            configurable: true
        });
        SettingsGroupTitleWidget.prototype.create = function () {
            var _this = this;
            this._domNode = DOM.$('.settings-group-title-widget');
            this.titleContainer = DOM.append(this._domNode, DOM.$('.title-container'));
            this.titleContainer.tabIndex = 0;
            this.onclick(this.titleContainer, function () { return _this.toggle(); });
            this.onkeydown(this.titleContainer, function (e) { return _this.onKeyDown(e); });
            var focusTracker = this._register(DOM.trackFocus(this.titleContainer));
            this._register(focusTracker.onDidFocus(function () { return _this.toggleFocus(true); }));
            this._register(focusTracker.onDidBlur(function () { return _this.toggleFocus(false); }));
            this.icon = DOM.append(this.titleContainer, DOM.$('.expand-collapse-icon'));
            this.title = DOM.append(this.titleContainer, DOM.$('.title'));
            this.title.textContent = this.settingsGroup.title + (" (" + this.settingsGroup.sections.reduce(function (count, section) { return count + section.settings.length; }, 0) + ")");
            this.layout();
        };
        SettingsGroupTitleWidget.prototype.render = function () {
            var _this = this;
            this._afterLineNumber = this.settingsGroup.range.startLineNumber - 2;
            this.editor.changeViewZones(function (accessor) {
                _this.id = accessor.addZone(_this);
                _this.layout();
            });
        };
        SettingsGroupTitleWidget.prototype.toggleCollapse = function (collapse) {
            DOM.toggleClass(this.titleContainer, 'collapsed', collapse);
        };
        SettingsGroupTitleWidget.prototype.toggleFocus = function (focus) {
            DOM.toggleClass(this.titleContainer, 'focused', focus);
        };
        SettingsGroupTitleWidget.prototype.isCollapsed = function () {
            return DOM.hasClass(this.titleContainer, 'collapsed');
        };
        SettingsGroupTitleWidget.prototype.layout = function () {
            var configuration = this.editor.getConfiguration();
            var layoutInfo = this.editor.getLayoutInfo();
            this._domNode.style.width = layoutInfo.contentWidth - layoutInfo.verticalScrollbarWidth + 'px';
            this.titleContainer.style.lineHeight = configuration.lineHeight + 3 + 'px';
            this.titleContainer.style.height = configuration.lineHeight + 3 + 'px';
            this.titleContainer.style.fontSize = configuration.fontInfo.fontSize + 'px';
            this.icon.style.minWidth = this.getIconSize(16) + "px";
        };
        SettingsGroupTitleWidget.prototype.getIconSize = function (minSize) {
            var fontSize = this.editor.getConfiguration().fontInfo.fontSize;
            return fontSize > 8 ? Math.max(fontSize, minSize) : 12;
        };
        SettingsGroupTitleWidget.prototype.onKeyDown = function (keyboardEvent) {
            switch (keyboardEvent.keyCode) {
                case 3 /* Enter */:
                case 10 /* Space */:
                    this.toggle();
                    break;
                case 15 /* LeftArrow */:
                    this.collapse(true);
                    break;
                case 17 /* RightArrow */:
                    this.collapse(false);
                    break;
                case 16 /* UpArrow */:
                    if (this.settingsGroup.range.startLineNumber - 3 !== 1) {
                        this.editor.focus();
                        var lineNumber_1 = this.settingsGroup.range.startLineNumber - 2;
                        this.editor.setPosition({ lineNumber: lineNumber_1, column: this.editor.getModel().getLineMinColumn(lineNumber_1) });
                    }
                    break;
                case 18 /* DownArrow */:
                    var lineNumber = this.isCollapsed() ? this.settingsGroup.range.startLineNumber : this.settingsGroup.range.startLineNumber - 1;
                    this.editor.focus();
                    this.editor.setPosition({ lineNumber: lineNumber, column: this.editor.getModel().getLineMinColumn(lineNumber) });
                    break;
            }
        };
        SettingsGroupTitleWidget.prototype.toggle = function () {
            this.collapse(!this.isCollapsed());
        };
        SettingsGroupTitleWidget.prototype.collapse = function (collapse) {
            if (collapse !== this.isCollapsed()) {
                DOM.toggleClass(this.titleContainer, 'collapsed', collapse);
                this._onToggled.fire(collapse);
            }
        };
        SettingsGroupTitleWidget.prototype.onCursorChange = function (e) {
            if (e.source !== 'mouse' && this.focusTitle(e.position)) {
                this.titleContainer.focus();
            }
        };
        SettingsGroupTitleWidget.prototype.focusTitle = function (currentPosition) {
            var previousPosition = this.previousPosition;
            this.previousPosition = currentPosition;
            if (!previousPosition) {
                return false;
            }
            if (previousPosition.lineNumber === currentPosition.lineNumber) {
                return false;
            }
            if (currentPosition.lineNumber === this.settingsGroup.range.startLineNumber - 1 || currentPosition.lineNumber === this.settingsGroup.range.startLineNumber - 2) {
                return true;
            }
            if (this.isCollapsed() && currentPosition.lineNumber === this.settingsGroup.range.endLineNumber) {
                return true;
            }
            return false;
        };
        SettingsGroupTitleWidget.prototype.dispose = function () {
            var _this = this;
            this.editor.changeViewZones(function (accessor) {
                accessor.removeZone(_this.id);
            });
            _super.prototype.dispose.call(this);
        };
        return SettingsGroupTitleWidget;
    }(widget_1.Widget));
    exports.SettingsGroupTitleWidget = SettingsGroupTitleWidget;
    var FolderSettingsActionItem = /** @class */ (function (_super) {
        __extends(FolderSettingsActionItem, _super);
        function FolderSettingsActionItem(action, contextService, contextMenuService) {
            var _this = _super.call(this, null, action) || this;
            _this.contextService = contextService;
            _this.contextMenuService = contextMenuService;
            _this._folderSettingCounts = new Map();
            _this.disposables = [];
            var workspace = _this.contextService.getWorkspace();
            _this._folder = workspace.folders.length === 1 ? workspace.folders[0] : null;
            _this.disposables.push(_this.contextService.onDidChangeWorkspaceFolders(function () { return _this.onWorkspaceFoldersChanged(); }));
            return _this;
        }
        Object.defineProperty(FolderSettingsActionItem.prototype, "folder", {
            get: function () {
                return this._folder;
            },
            set: function (folder) {
                this._folder = folder;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        FolderSettingsActionItem.prototype.setCount = function (settingsTarget, count) {
            var folder = this.contextService.getWorkspaceFolder(settingsTarget).uri;
            this._folderSettingCounts.set(folder.toString(), count);
            this.update();
        };
        FolderSettingsActionItem.prototype.render = function (container) {
            var _this = this;
            this.builder = builder_1.$(container);
            this.container = container;
            this.labelElement = DOM.$('.action-title');
            this.detailsElement = DOM.$('.action-details');
            this.dropDownElement = DOM.$('.dropdown-icon.octicon.octicon-triangle-down.hide');
            this.anchorElement = DOM.$('a.action-label', {
                role: 'button',
                'aria-haspopup': 'true',
                'tabindex': '0'
            }, this.labelElement, this.detailsElement, this.dropDownElement);
            this.disposables.push(DOM.addDisposableListener(this.anchorElement, DOM.EventType.CLICK, function (e) { return _this.onClick(e); }));
            this.disposables.push(DOM.addDisposableListener(this.anchorElement, DOM.EventType.KEY_UP, function (e) { return _this.onKeyUp(e); }));
            DOM.append(this.container, this.anchorElement);
            this.update();
        };
        FolderSettingsActionItem.prototype.onKeyUp = function (event) {
            var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(event);
            switch (keyboardEvent.keyCode) {
                case 3 /* Enter */:
                case 10 /* Space */:
                    this.onClick(event);
                    return;
            }
        };
        FolderSettingsActionItem.prototype.onClick = function (event) {
            DOM.EventHelper.stop(event, true);
            if (!this.folder || this._action.checked) {
                this.showMenu();
            }
            else {
                this._action.run(this._folder);
            }
        };
        FolderSettingsActionItem.prototype._updateEnabled = function () {
            this.update();
        };
        FolderSettingsActionItem.prototype._updateChecked = function () {
            this.update();
        };
        FolderSettingsActionItem.prototype.onWorkspaceFoldersChanged = function () {
            var _this = this;
            var oldFolder = this._folder;
            var workspace = this.contextService.getWorkspace();
            if (this._folder) {
                this._folder = workspace.folders.filter(function (folder) { return folder.uri.toString() === _this._folder.uri.toString(); })[0] || workspace.folders[0];
            }
            this._folder = this._folder ? this._folder : workspace.folders.length === 1 ? workspace.folders[0] : null;
            this.update();
            if (this._action.checked) {
                if ((oldFolder || !this._folder)
                    || (!oldFolder || this._folder)
                    || (oldFolder && this._folder && oldFolder.uri.toString() === this._folder.uri.toString())) {
                    this._action.run(this._folder);
                }
            }
        };
        FolderSettingsActionItem.prototype.update = function () {
            var total = 0;
            this._folderSettingCounts.forEach(function (n) { return total += n; });
            var workspace = this.contextService.getWorkspace();
            if (this._folder) {
                this.labelElement.textContent = this._folder.name;
                this.anchorElement.title = this._folder.name;
                var detailsText = this.labelWithCount(this._action.label, total);
                this.detailsElement.textContent = detailsText;
                DOM.toggleClass(this.dropDownElement, 'hide', workspace.folders.length === 1 || !this._action.checked);
            }
            else {
                var labelText = this.labelWithCount(this._action.label, total);
                this.labelElement.textContent = labelText;
                this.detailsElement.textContent = '';
                this.anchorElement.title = this._action.label;
                DOM.removeClass(this.dropDownElement, 'hide');
            }
            DOM.toggleClass(this.anchorElement, 'checked', this._action.checked);
            DOM.toggleClass(this.container, 'disabled', !this._action.enabled);
        };
        FolderSettingsActionItem.prototype.showMenu = function () {
            var _this = this;
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return _this.container; },
                getActions: function () { return winjs_base_1.TPromise.as(_this.getDropdownMenuActions()); },
                getActionItem: function (action) { return null; },
                onHide: function () {
                    _this.anchorElement.blur();
                }
            });
        };
        FolderSettingsActionItem.prototype.getDropdownMenuActions = function () {
            var _this = this;
            var actions = [];
            var workspaceFolders = this.contextService.getWorkspace().folders;
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE && workspaceFolders.length > 0) {
                actions.push(new actionbar_1.Separator());
                actions.push.apply(actions, workspaceFolders.map(function (folder, index) {
                    var folderCount = _this._folderSettingCounts.get(folder.uri.toString());
                    return {
                        id: 'folderSettingsTarget' + index,
                        label: _this.labelWithCount(folder.name, folderCount),
                        checked: _this.folder && _this.folder.uri.toString() === folder.uri.toString(),
                        enabled: true,
                        run: function () { return _this._action.run(folder); }
                    };
                }));
            }
            return actions;
        };
        FolderSettingsActionItem.prototype.labelWithCount = function (label, count) {
            // Append the count if it's >0 and not undefined
            if (count) {
                label += " (" + count + ")";
            }
            return label;
        };
        FolderSettingsActionItem.prototype.dispose = function () {
            lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        FolderSettingsActionItem = __decorate([
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, contextView_1.IContextMenuService)
        ], FolderSettingsActionItem);
        return FolderSettingsActionItem;
    }(actionbar_1.BaseActionItem));
    exports.FolderSettingsActionItem = FolderSettingsActionItem;
    var SettingsTargetsWidget = /** @class */ (function (_super) {
        __extends(SettingsTargetsWidget, _super);
        function SettingsTargetsWidget(parent, contextService, instantiationService) {
            var _this = _super.call(this) || this;
            _this.contextService = contextService;
            _this.instantiationService = instantiationService;
            _this._onDidTargetChange = new event_1.Emitter();
            _this.onDidTargetChange = _this._onDidTargetChange.event;
            _this.create(parent);
            _this._register(_this.contextService.onDidChangeWorkbenchState(function () { return _this.onWorkbenchStateChanged(); }));
            _this._register(_this.contextService.onDidChangeWorkspaceFolders(function () { return _this.update(); }));
            return _this;
        }
        SettingsTargetsWidget.prototype.create = function (parent) {
            var _this = this;
            var settingsTabsWidget = DOM.append(parent, DOM.$('.settings-tabs-widget'));
            this.settingsSwitcherBar = this._register(new actionbar_1.ActionBar(settingsTabsWidget, {
                orientation: actionbar_1.ActionsOrientation.HORIZONTAL,
                ariaLabel: nls_1.localize('settingsSwitcherBarAriaLabel', "Settings Switcher"),
                animated: false,
                actionItemProvider: function (action) { return action.id === 'folderSettings' ? _this.folderSettings : null; }
            }));
            this.userSettings = new actions_1.Action('userSettings', nls_1.localize('userSettings', "User Settings"), '.settings-tab', true, function () { return _this.updateTarget(configuration_1.ConfigurationTarget.USER); });
            this.userSettings.tooltip = this.userSettings.label;
            this.workspaceSettings = new actions_1.Action('workspaceSettings', nls_1.localize('workspaceSettings', "Workspace Settings"), '.settings-tab', false, function () { return _this.updateTarget(configuration_1.ConfigurationTarget.WORKSPACE); });
            this.workspaceSettings.tooltip = this.workspaceSettings.label;
            var folderSettingsAction = new actions_1.Action('folderSettings', nls_1.localize('folderSettings', "Folder Settings"), '.settings-tab', false, function (folder) { return _this.updateTarget(folder ? folder.uri : configuration_1.ConfigurationTarget.USER); });
            this.folderSettings = this.instantiationService.createInstance(FolderSettingsActionItem, folderSettingsAction);
            this.update();
            this.settingsSwitcherBar.push([this.userSettings, this.workspaceSettings, folderSettingsAction]);
        };
        Object.defineProperty(SettingsTargetsWidget.prototype, "settingsTarget", {
            get: function () {
                return this._settingsTarget;
            },
            set: function (settingsTarget) {
                this._settingsTarget = settingsTarget;
                this.userSettings.checked = configuration_1.ConfigurationTarget.USER === this.settingsTarget;
                this.workspaceSettings.checked = configuration_1.ConfigurationTarget.WORKSPACE === this.settingsTarget;
                if (this.settingsTarget instanceof uri_1.default) {
                    this.folderSettings.getAction().checked = true;
                    this.folderSettings.folder = this.contextService.getWorkspaceFolder(this.settingsTarget);
                }
                else {
                    this.folderSettings.getAction().checked = false;
                }
            },
            enumerable: true,
            configurable: true
        });
        SettingsTargetsWidget.prototype.setResultCount = function (settingsTarget, count) {
            if (settingsTarget === configuration_1.ConfigurationTarget.WORKSPACE) {
                var label = nls_1.localize('workspaceSettings', "Workspace Settings");
                if (count) {
                    label += " (" + count + ")";
                }
                this.workspaceSettings.label = label;
            }
            else if (settingsTarget === configuration_1.ConfigurationTarget.USER) {
                var label = nls_1.localize('userSettings', "User Settings");
                if (count) {
                    label += " (" + count + ")";
                }
                this.userSettings.label = label;
            }
            else if (settingsTarget instanceof uri_1.default) {
                this.folderSettings.setCount(settingsTarget, count);
            }
        };
        SettingsTargetsWidget.prototype.onWorkbenchStateChanged = function () {
            this.folderSettings.folder = null;
            this.update();
            if (this.settingsTarget === configuration_1.ConfigurationTarget.WORKSPACE && this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE) {
                this.updateTarget(configuration_1.ConfigurationTarget.USER);
            }
        };
        SettingsTargetsWidget.prototype.updateTarget = function (settingsTarget) {
            var isSameTarget = this.settingsTarget === settingsTarget || settingsTarget instanceof uri_1.default && this.settingsTarget instanceof uri_1.default && this.settingsTarget.toString() === settingsTarget.toString();
            if (!isSameTarget) {
                this.settingsTarget = settingsTarget;
                this._onDidTargetChange.fire(this.settingsTarget);
            }
            return winjs_base_1.TPromise.as(null);
        };
        SettingsTargetsWidget.prototype.update = function () {
            DOM.toggleClass(this.settingsSwitcherBar.domNode, 'empty-workbench', this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY);
            this.workspaceSettings.enabled = this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY;
            this.folderSettings.getAction().enabled = this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE && this.contextService.getWorkspace().folders.length > 0;
        };
        SettingsTargetsWidget = __decorate([
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, instantiation_1.IInstantiationService)
        ], SettingsTargetsWidget);
        return SettingsTargetsWidget;
    }(widget_1.Widget));
    exports.SettingsTargetsWidget = SettingsTargetsWidget;
    var SearchWidget = /** @class */ (function (_super) {
        __extends(SearchWidget, _super);
        function SearchWidget(parent, options, contextViewService, instantiationService, themeService) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.contextViewService = contextViewService;
            _this.instantiationService = instantiationService;
            _this.themeService = themeService;
            _this._onDidChange = _this._register(new event_1.Emitter());
            _this.onDidChange = _this._onDidChange.event;
            _this._onFocus = _this._register(new event_1.Emitter());
            _this.onFocus = _this._onFocus.event;
            _this.create(parent);
            return _this;
        }
        SearchWidget.prototype.create = function (parent) {
            var _this = this;
            this.domNode = DOM.append(parent, DOM.$('div.settings-header-widget'));
            this.createSearchContainer(DOM.append(this.domNode, DOM.$('div.settings-search-container')));
            this.controlsDiv = DOM.append(this.domNode, DOM.$('div.settings-search-controls'));
            if (this.options.showResultCount) {
                this.countElement = DOM.append(this.controlsDiv, DOM.$('.settings-count-widget'));
                this._register(styler_1.attachStylerCallback(this.themeService, { badgeBackground: colorRegistry_1.badgeBackground, contrastBorder: colorRegistry_1.contrastBorder }, function (colors) {
                    var background = colors.badgeBackground ? colors.badgeBackground.toString() : null;
                    var border = colors.contrastBorder ? colors.contrastBorder.toString() : null;
                    _this.countElement.style.backgroundColor = background;
                    _this.countElement.style.borderWidth = border ? '1px' : null;
                    _this.countElement.style.borderStyle = border ? 'solid' : null;
                    _this.countElement.style.borderColor = border;
                    _this.styleCountElementForeground();
                }));
            }
            this.inputBox.inputElement.setAttribute('aria-live', 'assertive');
            var focusTracker = this._register(DOM.trackFocus(this.inputBox.inputElement));
            this._register(focusTracker.onDidFocus(function () { return _this._onFocus.fire(); }));
            if (this.options.focusKey) {
                this._register(focusTracker.onDidFocus(function () { return _this.options.focusKey.set(true); }));
                this._register(focusTracker.onDidBlur(function () { return _this.options.focusKey.set(false); }));
            }
        };
        SearchWidget.prototype.createSearchContainer = function (searchContainer) {
            var _this = this;
            this.searchContainer = searchContainer;
            var searchInput = DOM.append(this.searchContainer, DOM.$('div.settings-search-input'));
            this.inputBox = this._register(this.createInputBox(searchInput));
            this._register(this.inputBox.onDidChange(function (value) { return _this._onDidChange.fire(value); }));
        };
        SearchWidget.prototype.createInputBox = function (parent) {
            var box = this._register(new inputBox_1.InputBox(parent, this.contextViewService, this.options));
            this._register(styler_1.attachInputBoxStyler(box, this.themeService));
            return box;
        };
        SearchWidget.prototype.showMessage = function (message, count) {
            if (this.countElement) {
                this.countElement.textContent = message;
                this.inputBox.inputElement.setAttribute('aria-label', message);
                DOM.toggleClass(this.countElement, 'no-results', count === 0);
                this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + 'px';
                this.styleCountElementForeground();
            }
        };
        SearchWidget.prototype.styleCountElementForeground = function () {
            var colorId = DOM.hasClass(this.countElement, 'no-results') ? colorRegistry_1.errorForeground : colorRegistry_1.badgeForeground;
            var color = this.themeService.getTheme().getColor(colorId);
            this.countElement.style.color = color ? color.toString() : null;
        };
        SearchWidget.prototype.layout = function (dimension) {
            if (dimension.width < 400) {
                if (this.countElement) {
                    DOM.addClass(this.countElement, 'hide');
                }
                this.inputBox.inputElement.style.paddingRight = '0px';
            }
            else {
                if (this.countElement) {
                    DOM.removeClass(this.countElement, 'hide');
                }
                this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + 'px';
            }
        };
        SearchWidget.prototype.getControlsWidth = function () {
            var countWidth = this.countElement ? DOM.getTotalWidth(this.countElement) : 0;
            return countWidth + 20;
        };
        SearchWidget.prototype.focus = function () {
            this.inputBox.focus();
            if (this.getValue()) {
                this.inputBox.select();
            }
        };
        SearchWidget.prototype.hasFocus = function () {
            return this.inputBox.hasFocus();
        };
        SearchWidget.prototype.clear = function () {
            this.inputBox.value = '';
        };
        SearchWidget.prototype.getValue = function () {
            return this.inputBox.value;
        };
        SearchWidget.prototype.setValue = function (value) {
            return this.inputBox.value = value;
        };
        SearchWidget.prototype.dispose = function () {
            if (this.options.focusKey) {
                this.options.focusKey.set(false);
            }
            _super.prototype.dispose.call(this);
        };
        SearchWidget = __decorate([
            __param(2, contextView_1.IContextViewService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, themeService_1.IThemeService)
        ], SearchWidget);
        return SearchWidget;
    }(widget_1.Widget));
    exports.SearchWidget = SearchWidget;
    var FloatingClickWidget = /** @class */ (function (_super) {
        __extends(FloatingClickWidget, _super);
        function FloatingClickWidget(editor, label, keyBindingAction, keybindingService, themeService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.label = label;
            _this.themeService = themeService;
            _this._onClick = _this._register(new event_1.Emitter());
            _this.onClick = _this._onClick.event;
            if (keyBindingAction) {
                var keybinding = keybindingService.lookupKeybinding(keyBindingAction);
                if (keybinding) {
                    _this.label += ' (' + keybinding.getLabel() + ')';
                }
            }
            return _this;
        }
        FloatingClickWidget.prototype.render = function () {
            var _this = this;
            this._domNode = DOM.$('.floating-click-widget');
            this._register(styler_1.attachStylerCallback(this.themeService, { buttonBackground: colorRegistry_1.buttonBackground, buttonForeground: colorRegistry_1.buttonForeground }, function (colors) {
                _this._domNode.style.backgroundColor = colors.buttonBackground;
                _this._domNode.style.color = colors.buttonForeground;
            }));
            DOM.append(this._domNode, DOM.$('')).textContent = this.label;
            this.onclick(this._domNode, function (e) { return _this._onClick.fire(); });
            this.editor.addOverlayWidget(this);
        };
        FloatingClickWidget.prototype.dispose = function () {
            this.editor.removeOverlayWidget(this);
            _super.prototype.dispose.call(this);
        };
        FloatingClickWidget.prototype.getId = function () {
            return 'editor.overlayWidget.floatingClickWidget';
        };
        FloatingClickWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        FloatingClickWidget.prototype.getPosition = function () {
            return {
                preference: editorBrowser_1.OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
            };
        };
        FloatingClickWidget = __decorate([
            __param(3, keybinding_1.IKeybindingService),
            __param(4, themeService_1.IThemeService)
        ], FloatingClickWidget);
        return FloatingClickWidget;
    }(widget_1.Widget));
    exports.FloatingClickWidget = FloatingClickWidget;
    var EditPreferenceWidget = /** @class */ (function (_super) {
        __extends(EditPreferenceWidget, _super);
        function EditPreferenceWidget(editor) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this._onClick = new event_1.Emitter();
            _this._editPreferenceDecoration = [];
            _this._register(_this.editor.onMouseDown(function (e) {
                var data = e.target.detail;
                if (e.target.type !== editorBrowser_1.MouseTargetType.GUTTER_GLYPH_MARGIN || data.isAfterLines || !_this.isVisible()) {
                    return;
                }
                _this._onClick.fire(e);
            }));
            return _this;
        }
        Object.defineProperty(EditPreferenceWidget.prototype, "onClick", {
            get: function () { return this._onClick.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditPreferenceWidget.prototype, "preferences", {
            get: function () {
                return this._preferences;
            },
            enumerable: true,
            configurable: true
        });
        EditPreferenceWidget.prototype.getLine = function () {
            return this._line;
        };
        EditPreferenceWidget.prototype.show = function (line, hoverMessage, preferences) {
            this._preferences = preferences;
            var newDecoration = [];
            this._line = line;
            newDecoration.push({
                options: {
                    glyphMarginClassName: EditPreferenceWidget.GLYPH_MARGIN_CLASS_NAME,
                    glyphMarginHoverMessage: new htmlContent_1.MarkdownString().appendText(hoverMessage),
                    stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                },
                range: {
                    startLineNumber: line,
                    startColumn: 1,
                    endLineNumber: line,
                    endColumn: 1
                }
            });
            this._editPreferenceDecoration = this.editor.deltaDecorations(this._editPreferenceDecoration, newDecoration);
        };
        EditPreferenceWidget.prototype.hide = function () {
            this._editPreferenceDecoration = this.editor.deltaDecorations(this._editPreferenceDecoration, []);
        };
        EditPreferenceWidget.prototype.isVisible = function () {
            return this._editPreferenceDecoration.length > 0;
        };
        EditPreferenceWidget.prototype.dispose = function () {
            this.hide();
            _super.prototype.dispose.call(this);
        };
        EditPreferenceWidget.GLYPH_MARGIN_CLASS_NAME = 'edit-preferences-widget';
        return EditPreferenceWidget;
    }(lifecycle_1.Disposable));
    exports.EditPreferenceWidget = EditPreferenceWidget;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        collector.addRule("\n\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label:focus,\n\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label.checked {\n\t\t\tborder-bottom: 1px solid;\n\t\t}\n\t");
        // Title Active
        var titleActive = theme.getColor(theme_1.PANEL_ACTIVE_TITLE_FOREGROUND);
        var titleActiveBorder = theme.getColor(theme_1.PANEL_ACTIVE_TITLE_BORDER);
        if (titleActive || titleActiveBorder) {
            collector.addRule("\n\t\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label:hover,\n\t\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label.checked {\n\t\t\t\tcolor: " + titleActive + ";\n\t\t\t\tborder-bottom-color: " + titleActiveBorder + ";\n\t\t\t}\n\t\t");
        }
        // Title Inactive
        var titleInactive = theme.getColor(theme_1.PANEL_INACTIVE_TITLE_FOREGROUND);
        if (titleInactive) {
            collector.addRule("\n\t\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label {\n\t\t\t\tcolor: " + titleInactive + ";\n\t\t\t}\n\t\t");
        }
        // Title focus
        var focusBorderColor = theme.getColor(colorRegistry_1.focusBorder);
        if (focusBorderColor) {
            collector.addRule("\n\t\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label:focus {\n\t\t\t\tborder-bottom-color: " + focusBorderColor + " !important;\n\t\t\t}\n\t\t\t");
            collector.addRule("\n\t\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label:focus {\n\t\t\t\toutline: none;\n\t\t\t}\n\t\t\t");
        }
        // Styling with Outline color (e.g. high contrast theme)
        var outline = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (outline) {
            var outline_1 = theme.getColor(colorRegistry_1.activeContrastBorder);
            collector.addRule("\n\t\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label.checked,\n\t\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label:hover {\n\t\t\t\toutline-color: " + outline_1 + ";\n\t\t\t\toutline-width: 1px;\n\t\t\t\toutline-style: solid;\n\t\t\t\tborder-bottom: none;\n\t\t\t\tpadding-bottom: 0;\n\t\t\t\toutline-offset: 3px;\n\t\t\t}\n\n\t\t\t.settings-tabs-widget > .monaco-action-bar .action-item .action-label:not(.checked):hover {\n\t\t\t\toutline-style: dashed;\n\t\t\t}\n\t\t");
        }
    });
});
