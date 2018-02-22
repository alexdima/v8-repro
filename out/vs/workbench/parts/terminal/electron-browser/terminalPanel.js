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
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/common/platform", "vs/base/browser/builder", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/workbench/parts/terminal/common/terminal", "vs/platform/theme/common/themeService", "./terminalFindWidget", "vs/platform/theme/common/colorRegistry", "vs/workbench/parts/terminal/electron-browser/terminalActions", "vs/workbench/browser/panel", "vs/base/browser/mouseEvent", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/workbench/common/theme", "vs/workbench/parts/terminal/electron-browser/terminalColorRegistry", "vs/base/browser/dnd", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, dom, nls, platform, builder_1, actionbar_1, configuration_1, contextView_1, instantiation_1, telemetry_1, terminal_1, themeService_1, terminalFindWidget_1, colorRegistry_1, terminalActions_1, panel_1, mouseEvent_1, winjs_base_1, uri_1, theme_1, terminalColorRegistry_1, dnd_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TerminalPanel = /** @class */ (function (_super) {
        __extends(TerminalPanel, _super);
        function TerminalPanel(_configurationService, _contextMenuService, _instantiationService, _terminalService, _lifecycleService, themeService, telemetryService) {
            var _this = _super.call(this, terminal_1.TERMINAL_PANEL_ID, telemetryService, themeService) || this;
            _this._configurationService = _configurationService;
            _this._contextMenuService = _contextMenuService;
            _this._instantiationService = _instantiationService;
            _this._terminalService = _terminalService;
            _this._lifecycleService = _lifecycleService;
            _this.themeService = themeService;
            _this._cancelContextMenu = false;
            return _this;
        }
        TerminalPanel.prototype.create = function (parent) {
            var _this = this;
            _super.prototype.create.call(this, parent);
            this._parentDomElement = parent.getHTMLElement();
            dom.addClass(this._parentDomElement, 'integrated-terminal');
            this._themeStyleElement = document.createElement('style');
            this._fontStyleElement = document.createElement('style');
            this._terminalContainer = document.createElement('div');
            dom.addClass(this._terminalContainer, 'terminal-outer-container');
            this._findWidget = this._instantiationService.createInstance(terminalFindWidget_1.TerminalFindWidget);
            this._parentDomElement.appendChild(this._themeStyleElement);
            this._parentDomElement.appendChild(this._fontStyleElement);
            this._parentDomElement.appendChild(this._terminalContainer);
            this._parentDomElement.appendChild(this._findWidget.getDomNode());
            this._attachEventListeners();
            this._terminalService.setContainers(this.getContainer().getHTMLElement(), this._terminalContainer);
            this._register(this.themeService.onThemeChange(function (theme) { return _this._updateTheme(theme); }));
            this._register(this._configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration('terminal.integrated') || e.affectsConfiguration('editor.fontFamily')) {
                    _this._updateFont();
                }
            }));
            this._updateFont();
            this._updateTheme();
            // Force another layout (first is setContainers) since config has changed
            this.layout(new builder_1.Dimension(this._terminalContainer.offsetWidth, this._terminalContainer.offsetHeight));
            return winjs_base_1.TPromise.as(void 0);
        };
        TerminalPanel.prototype.layout = function (dimension) {
            if (!dimension) {
                return;
            }
            this._terminalService.terminalTabs.forEach(function (t) { return t.layout(dimension.width, dimension.height); });
        };
        TerminalPanel.prototype.setVisible = function (visible) {
            var _this = this;
            if (visible) {
                if (this._terminalService.terminalInstances.length > 0) {
                    this._updateFont();
                    this._updateTheme();
                }
                else {
                    return _super.prototype.setVisible.call(this, visible).then(function () {
                        // Ensure the "Running" lifecycle face has been reached before creating the
                        // first terminal.
                        _this._lifecycleService.when(lifecycle_1.LifecyclePhase.Running).then(function () {
                            // Allow time for the panel to display if it is being shown
                            // for the first time. If there is not wait here the initial
                            // dimensions of the pty could be wrong.
                            setTimeout(function () {
                                var instance = _this._terminalService.createInstance();
                                if (instance) {
                                    _this._updateFont();
                                    _this._updateTheme();
                                }
                            }, 0);
                        });
                        return winjs_base_1.TPromise.as(void 0);
                    });
                }
            }
            return _super.prototype.setVisible.call(this, visible);
        };
        TerminalPanel.prototype.getActions = function () {
            var _this = this;
            if (!this._actions) {
                this._actions = [
                    this._instantiationService.createInstance(terminalActions_1.SwitchTerminalAction, terminalActions_1.SwitchTerminalAction.ID, terminalActions_1.SwitchTerminalAction.LABEL),
                    this._instantiationService.createInstance(terminalActions_1.CreateNewTerminalAction, terminalActions_1.CreateNewTerminalAction.ID, terminalActions_1.CreateNewTerminalAction.PANEL_LABEL),
                    this._instantiationService.createInstance(terminalActions_1.KillTerminalAction, terminalActions_1.KillTerminalAction.ID, terminalActions_1.KillTerminalAction.PANEL_LABEL)
                ];
                this._actions.forEach(function (a) {
                    _this._register(a);
                });
            }
            return this._actions;
        };
        TerminalPanel.prototype._getContextMenuActions = function () {
            var _this = this;
            if (!this._contextMenuActions) {
                this._copyContextMenuAction = this._instantiationService.createInstance(terminalActions_1.CopyTerminalSelectionAction, terminalActions_1.CopyTerminalSelectionAction.ID, nls.localize('copy', "Copy"));
                this._contextMenuActions = [
                    this._instantiationService.createInstance(terminalActions_1.CreateNewTerminalAction, terminalActions_1.CreateNewTerminalAction.ID, terminalActions_1.CreateNewTerminalAction.PANEL_LABEL),
                    new actionbar_1.Separator(),
                    this._copyContextMenuAction,
                    this._instantiationService.createInstance(terminalActions_1.TerminalPasteAction, terminalActions_1.TerminalPasteAction.ID, nls.localize('paste', "Paste")),
                    this._instantiationService.createInstance(terminalActions_1.SelectAllTerminalAction, terminalActions_1.SelectAllTerminalAction.ID, nls.localize('selectAll', "Select All")),
                    new actionbar_1.Separator(),
                    this._instantiationService.createInstance(terminalActions_1.ClearTerminalAction, terminalActions_1.ClearTerminalAction.ID, nls.localize('clear', "Clear")),
                    new actionbar_1.Separator(),
                    this._instantiationService.createInstance(terminalActions_1.SplitVerticalTerminalAction, terminalActions_1.SplitVerticalTerminalAction.ID, nls.localize('splitVertically', "Split Vertically"))
                ];
                this._contextMenuActions.forEach(function (a) {
                    _this._register(a);
                });
            }
            var activeInstance = this._terminalService.getActiveInstance();
            this._copyContextMenuAction.enabled = activeInstance && activeInstance.hasSelection();
            return this._contextMenuActions;
        };
        TerminalPanel.prototype.getActionItem = function (action) {
            if (action.id === terminalActions_1.SwitchTerminalAction.ID) {
                return this._instantiationService.createInstance(terminalActions_1.SwitchTerminalActionItem, action);
            }
            return _super.prototype.getActionItem.call(this, action);
        };
        TerminalPanel.prototype.focus = function () {
            var activeInstance = this._terminalService.getActiveInstance();
            if (activeInstance) {
                activeInstance.focus(true);
            }
        };
        TerminalPanel.prototype.focusFindWidget = function () {
            var activeInstance = this._terminalService.getActiveInstance();
            if (activeInstance && activeInstance.hasSelection() && activeInstance.selection.indexOf('\n') === -1) {
                this._findWidget.reveal(activeInstance.selection);
            }
            else {
                this._findWidget.reveal();
            }
        };
        TerminalPanel.prototype.hideFindWidget = function () {
            this._findWidget.hide();
        };
        TerminalPanel.prototype.showNextFindTermFindWidget = function () {
            this._findWidget.showNextFindTerm();
        };
        TerminalPanel.prototype.showPreviousFindTermFindWidget = function () {
            this._findWidget.showPreviousFindTerm();
        };
        TerminalPanel.prototype._attachEventListeners = function () {
            var _this = this;
            this._register(dom.addDisposableListener(this._parentDomElement, 'mousedown', function (event) {
                if (_this._terminalService.terminalInstances.length === 0) {
                    return;
                }
                if (event.which === 2 && platform.isLinux) {
                    // Drop selection and focus terminal on Linux to enable middle button paste when click
                    // occurs on the selection itself.
                    _this._terminalService.getActiveInstance().focus();
                }
                else if (event.which === 3) {
                    if (_this._terminalService.configHelper.config.rightClickBehavior === 'copyPaste') {
                        var terminal_2 = _this._terminalService.getActiveInstance();
                        if (terminal_2.hasSelection()) {
                            terminal_2.copySelection();
                            terminal_2.clearSelection();
                        }
                        else {
                            terminal_2.paste();
                        }
                        // Clear selection after all click event bubbling is finished on Mac to prevent
                        // right-click selecting a word which is seemed cannot be disabled. There is a
                        // flicker when pasting but this appears to give the best experience if the
                        // setting is enabled.
                        if (platform.isMacintosh) {
                            setTimeout(function () {
                                terminal_2.clearSelection();
                            }, 0);
                        }
                        _this._cancelContextMenu = true;
                    }
                }
            }));
            this._register(dom.addDisposableListener(this._parentDomElement, 'mouseup', function (event) {
                if (_this._configurationService.getValue('terminal.integrated.copyOnSelection')) {
                    if (_this._terminalService.terminalInstances.length === 0) {
                        return;
                    }
                    if (event.which === 1) {
                        var terminal = _this._terminalService.getActiveInstance();
                        if (terminal.hasSelection()) {
                            terminal.copySelection();
                        }
                    }
                }
            }));
            this._register(dom.addDisposableListener(this._parentDomElement, 'contextmenu', function (event) {
                if (!_this._cancelContextMenu) {
                    var standardEvent = new mouseEvent_1.StandardMouseEvent(event);
                    var anchor_1 = { x: standardEvent.posx, y: standardEvent.posy };
                    _this._contextMenuService.showContextMenu({
                        getAnchor: function () { return anchor_1; },
                        getActions: function () { return winjs_base_1.TPromise.as(_this._getContextMenuActions()); },
                        getActionsContext: function () { return _this._parentDomElement; }
                    });
                }
                _this._cancelContextMenu = false;
            }));
            this._register(dom.addDisposableListener(this._parentDomElement, 'keyup', function (event) {
                if (event.keyCode === 27) {
                    // Keep terminal open on escape
                    event.stopPropagation();
                }
            }));
            this._register(dom.addDisposableListener(this._parentDomElement, dom.EventType.DROP, function (e) {
                if (e.target === _this._parentDomElement || dom.isAncestor(e.target, _this._parentDomElement)) {
                    if (!e.dataTransfer) {
                        return;
                    }
                    // Check if files were dragged from the tree explorer
                    var path = void 0;
                    var resources = e.dataTransfer.getData(dnd_1.DataTransfers.RESOURCES);
                    if (resources) {
                        path = uri_1.default.parse(JSON.parse(resources)[0]).path;
                    }
                    else if (e.dataTransfer.files.length > 0) {
                        // Check if the file was dragged from the filesystem
                        path = uri_1.default.file(e.dataTransfer.files[0].path).fsPath;
                    }
                    if (!path) {
                        return;
                    }
                    var terminal = _this._terminalService.getActiveInstance();
                    terminal.sendText(TerminalPanel.preparePathForTerminal(path), false);
                }
            }));
        };
        TerminalPanel.prototype._updateTheme = function (theme) {
            if (!theme) {
                theme = this.themeService.getTheme();
            }
            var css = '';
            var backgroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR) || theme.getColor(theme_1.PANEL_BACKGROUND);
            this._terminalContainer.style.backgroundColor = backgroundColor ? backgroundColor.toString() : '';
            var borderColor = theme.getColor(terminalColorRegistry_1.TERMINAL_BORDER_COLOR) || theme.getColor(theme_1.PANEL_BORDER);
            if (borderColor) {
                css += ".monaco-workbench .panel.integrated-terminal .split-view-view:not(:first-child) { border-left-color: " + borderColor.toString() + "; }";
            }
            // Borrow the editor's hover background for now
            var hoverBackground = theme.getColor(colorRegistry_1.editorHoverBackground);
            if (hoverBackground) {
                css += ".monaco-workbench .panel.integrated-terminal .terminal-message-widget { background-color: " + hoverBackground + "; }";
            }
            var hoverBorder = theme.getColor(colorRegistry_1.editorHoverBorder);
            if (hoverBorder) {
                css += ".monaco-workbench .panel.integrated-terminal .terminal-message-widget { border: 1px solid " + hoverBorder + "; }";
            }
            var hoverForeground = theme.getColor(colorRegistry_1.editorForeground);
            if (hoverForeground) {
                css += ".monaco-workbench .panel.integrated-terminal .terminal-message-widget { color: " + hoverForeground + "; }";
            }
            this._themeStyleElement.innerHTML = css;
            this._findWidget.updateTheme(theme);
        };
        TerminalPanel.prototype._updateFont = function () {
            if (this._terminalService.terminalInstances.length === 0) {
                return;
            }
            // TODO: Can we support ligatures?
            // dom.toggleClass(this._parentDomElement, 'enable-ligatures', this._terminalService.configHelper.config.fontLigatures);
            this.layout(new builder_1.Dimension(this._parentDomElement.offsetWidth, this._parentDomElement.offsetHeight));
        };
        /**
         * Adds quotes to a path if it contains whitespaces
         */
        TerminalPanel.preparePathForTerminal = function (path) {
            if (platform.isWindows) {
                if (/\s+/.test(path)) {
                    return "\"" + path + "\"";
                }
                return path;
            }
            path = path.replace(/(%5C|\\)/g, '\\\\');
            var charsToEscape = [
                ' ', '\'', '"', '?', ':', ';', '!', '*', '(', ')', '{', '}', '[', ']'
            ];
            for (var i = 0; i < path.length; i++) {
                var indexOfChar = charsToEscape.indexOf(path.charAt(i));
                if (indexOfChar >= 0) {
                    path = path.substring(0, i) + "\\" + path.charAt(i) + path.substring(i + 1);
                    i++; // Skip char due to escape char being added
                }
            }
            return path;
        };
        TerminalPanel = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, contextView_1.IContextMenuService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, terminal_1.ITerminalService),
            __param(4, lifecycle_1.ILifecycleService),
            __param(5, themeService_1.IThemeService),
            __param(6, telemetry_1.ITelemetryService)
        ], TerminalPanel);
        return TerminalPanel;
    }(panel_1.Panel));
    exports.TerminalPanel = TerminalPanel;
});
