/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/platform/lifecycle/common/lifecycle", "vs/workbench/services/panel/common/panelService", "vs/workbench/services/part/common/partService", "vs/workbench/parts/terminal/common/terminal", "vs/base/common/winjs.base"], function (require, exports, errors, event_1, contextkey_1, lifecycle_1, panelService_1, partService_1, terminal_1, winjs_base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TerminalService = /** @class */ (function () {
        function TerminalService(_contextKeyService, _panelService, _partService, lifecycleService) {
            var _this = this;
            this._contextKeyService = _contextKeyService;
            this._panelService = _panelService;
            this._partService = _partService;
            this._activeTabIndex = 0;
            this._isShuttingDown = false;
            this._onActiveTabChanged = new event_1.Emitter();
            this._onTabDisposed = new event_1.Emitter();
            this._onInstanceDisposed = new event_1.Emitter();
            this._onInstanceProcessIdReady = new event_1.Emitter();
            this._onInstanceTitleChanged = new event_1.Emitter();
            this._onInstancesChanged = new event_1.Emitter();
            lifecycleService.onWillShutdown(function (event) { return event.veto(_this._onWillShutdown()); });
            lifecycleService.onShutdown(function () { return _this._onShutdown(); });
            this._terminalFocusContextKey = terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS.bindTo(this._contextKeyService);
            this._findWidgetVisible = terminal_1.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE.bindTo(this._contextKeyService);
            this.onTabDisposed(function (tab) { return _this._removeTab(tab); });
        }
        Object.defineProperty(TerminalService.prototype, "activeTabIndex", {
            get: function () { return this._activeTabIndex; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalService.prototype, "onActiveTabChanged", {
            get: function () { return this._onActiveTabChanged.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalService.prototype, "onTabDisposed", {
            get: function () { return this._onTabDisposed.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalService.prototype, "onInstanceDisposed", {
            get: function () { return this._onInstanceDisposed.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalService.prototype, "onInstanceProcessIdReady", {
            get: function () { return this._onInstanceProcessIdReady.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalService.prototype, "onInstanceTitleChanged", {
            get: function () { return this._onInstanceTitleChanged.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalService.prototype, "onInstancesChanged", {
            get: function () { return this._onInstancesChanged.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalService.prototype, "terminalInstances", {
            get: function () { return this._terminalInstances; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalService.prototype, "terminalTabs", {
            get: function () { return this._terminalTabs; },
            enumerable: true,
            configurable: true
        });
        TerminalService.prototype._onWillShutdown = function () {
            var _this = this;
            if (this.terminalInstances.length === 0) {
                // No terminal instances, don't veto
                return false;
            }
            if (this.configHelper.config.confirmOnExit) {
                // veto if configured to show confirmation and the user choosed not to exit
                return this._showTerminalCloseConfirmation().then(function (veto) {
                    if (!veto) {
                        _this._isShuttingDown = true;
                    }
                    return veto;
                });
            }
            this._isShuttingDown = true;
            return false;
        };
        TerminalService.prototype._onShutdown = function () {
            this.terminalInstances.forEach(function (instance) { return instance.dispose(); });
        };
        TerminalService.prototype.getTabLabels = function () {
            return this._terminalTabs.filter(function (tab) { return tab.terminalInstances.length > 0; }).map(function (tab, index) { return index + 1 + ": " + tab.title; });
        };
        TerminalService.prototype._removeTab = function (tab) {
            // Get the index of the tab and remove it from the list
            var index = this._terminalTabs.indexOf(tab);
            var wasActiveTab = tab === this.getActiveTab();
            if (index !== -1) {
                this._terminalTabs.splice(index, 1);
            }
            // Adjust focus if the tab was active
            if (wasActiveTab && this._terminalTabs.length > 0) {
                // TODO: Only focus the new tab if the removed tab had focus?
                // const hasFocusOnExit = tab.activeInstance.hadFocusOnExit;
                var newIndex = index < this._terminalTabs.length ? index : this._terminalTabs.length - 1;
                this.setActiveTabByIndex(newIndex);
                this.getActiveInstance().focus(true);
            }
            // Hide the panel if there are no more instances, provided that VS Code is not shutting
            // down. When shutting down the panel is locked in place so that it is restored upon next
            // launch.
            if (this._terminalTabs.length === 0 && !this._isShuttingDown) {
                this.hidePanel();
            }
            // Fire events
            this._onInstancesChanged.fire();
            if (wasActiveTab) {
                this._onActiveTabChanged.fire();
            }
        };
        TerminalService.prototype.getActiveTab = function () {
            if (this._activeTabIndex < 0 || this._activeTabIndex >= this._terminalTabs.length) {
                return null;
            }
            return this._terminalTabs[this._activeTabIndex];
        };
        TerminalService.prototype.getActiveInstance = function () {
            var tab = this.getActiveTab();
            if (!tab) {
                return null;
            }
            return tab.activeInstance;
        };
        TerminalService.prototype.getInstanceFromId = function (terminalId) {
            return this.terminalInstances[this._getIndexFromId(terminalId)];
        };
        TerminalService.prototype.getInstanceFromIndex = function (terminalIndex) {
            return this.terminalInstances[terminalIndex];
        };
        TerminalService.prototype.setActiveInstance = function (terminalInstance) {
            this.setActiveInstanceByIndex(this._getIndexFromId(terminalInstance.id));
        };
        TerminalService.prototype.setActiveTabByIndex = function (tabIndex) {
            var _this = this;
            if (tabIndex >= this._terminalTabs.length) {
                return;
            }
            var didTabChange = this._activeTabIndex !== tabIndex;
            this._activeTabIndex = tabIndex;
            this._terminalTabs.forEach(function (t, i) { return t.setVisible(i === _this._activeTabIndex); });
            if (didTabChange) {
                this._onActiveTabChanged.fire();
            }
        };
        TerminalService.prototype._getInstanceFromGlobalInstanceIndex = function (index) {
            var currentTabIndex = 0;
            while (index >= 0 && currentTabIndex < this._terminalTabs.length) {
                var tab = this._terminalTabs[currentTabIndex];
                var count = tab.terminalInstances.length;
                if (index < count) {
                    return {
                        tab: tab,
                        tabIndex: currentTabIndex,
                        instance: tab.terminalInstances[index],
                        localInstanceIndex: index
                    };
                }
                index -= count;
                currentTabIndex++;
            }
            return null;
        };
        TerminalService.prototype.setActiveInstanceByIndex = function (terminalIndex) {
            var query = this._getInstanceFromGlobalInstanceIndex(terminalIndex);
            if (!query) {
                return;
            }
            query.tab.setActiveInstanceByIndex(query.localInstanceIndex);
            var didTabChange = this._activeTabIndex !== query.tabIndex;
            this._activeTabIndex = query.tabIndex;
            this._terminalTabs.forEach(function (t, i) { return t.setVisible(i === query.tabIndex); });
            // Only fire the event if there was a change
            if (didTabChange) {
                this._onActiveTabChanged.fire();
            }
        };
        TerminalService.prototype.setActiveTabToNext = function () {
            if (this._terminalTabs.length <= 1) {
                return;
            }
            var newIndex = this._activeTabIndex + 1;
            if (newIndex >= this._terminalTabs.length) {
                newIndex = 0;
            }
            this.setActiveTabByIndex(newIndex);
        };
        TerminalService.prototype.setActiveTabToPrevious = function () {
            if (this._terminalTabs.length <= 1) {
                return;
            }
            var newIndex = this._activeTabIndex - 1;
            if (newIndex < 0) {
                newIndex = this._terminalTabs.length - 1;
            }
            this.setActiveTabByIndex(newIndex);
        };
        TerminalService.prototype.splitInstanceVertically = function (instanceToSplit) {
            var _this = this;
            var tab = this._getTabForInstance(instanceToSplit);
            if (!tab) {
                return;
            }
            var instance = tab.split(this._terminalFocusContextKey, this.configHelper, {});
            this._initInstanceListeners(instance);
            this._onInstancesChanged.fire();
            this._terminalTabs.forEach(function (t, i) { return t.setVisible(i === _this._activeTabIndex); });
        };
        TerminalService.prototype._initInstanceListeners = function (instance) {
            instance.addDisposable(instance.onDisposed(this._onInstanceDisposed.fire, this._onInstanceDisposed));
            instance.addDisposable(instance.onTitleChanged(this._onInstanceTitleChanged.fire, this._onInstanceTitleChanged));
            instance.addDisposable(instance.onProcessIdReady(this._onInstanceProcessIdReady.fire, this._onInstanceProcessIdReady));
        };
        TerminalService.prototype._getTabForInstance = function (instance) {
            for (var i = 0; i < this._terminalTabs.length; i++) {
                var tab = this._terminalTabs[i];
                if (tab.terminalInstances.indexOf(instance) !== -1) {
                    return tab;
                }
            }
            return null;
        };
        TerminalService.prototype.showPanel = function (focus) {
            var _this = this;
            return new winjs_base_1.TPromise(function (complete) {
                var panel = _this._panelService.getActivePanel();
                if (!panel || panel.getId() !== terminal_1.TERMINAL_PANEL_ID) {
                    return _this._panelService.openPanel(terminal_1.TERMINAL_PANEL_ID, focus).then(function () {
                        if (focus) {
                            // Do the focus call asynchronously as going through the
                            // command palette will force editor focus
                            setTimeout(function () { return _this.getActiveInstance().focus(true); }, 0);
                        }
                        complete(void 0);
                    });
                }
                else {
                    if (focus) {
                        // Do the focus call asynchronously as going through the
                        // command palette will force editor focus
                        setTimeout(function () { return _this.getActiveInstance().focus(true); }, 0);
                    }
                    complete(void 0);
                }
                return undefined;
            });
        };
        TerminalService.prototype.hidePanel = function () {
            var panel = this._panelService.getActivePanel();
            if (panel && panel.getId() === terminal_1.TERMINAL_PANEL_ID) {
                this._partService.setPanelHidden(true).done(undefined, errors.onUnexpectedError);
            }
        };
        TerminalService.prototype._getIndexFromId = function (terminalId) {
            var terminalIndex = -1;
            this.terminalInstances.forEach(function (terminalInstance, i) {
                if (terminalInstance.id === terminalId) {
                    terminalIndex = i;
                }
            });
            if (terminalIndex === -1) {
                throw new Error("Terminal with ID " + terminalId + " does not exist (has it already been disposed?)");
            }
            return terminalIndex;
        };
        TerminalService.prototype.setWorkspaceShellAllowed = function (isAllowed) {
            this.configHelper.setWorkspaceShellAllowed(isAllowed);
        };
        TerminalService = __decorate([
            __param(0, contextkey_1.IContextKeyService),
            __param(1, panelService_1.IPanelService),
            __param(2, partService_1.IPartService),
            __param(3, lifecycle_1.ILifecycleService)
        ], TerminalService);
        return TerminalService;
    }());
    exports.TerminalService = TerminalService;
});
