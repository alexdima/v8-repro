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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/errors", "vs/base/parts/quickopen/common/quickOpen", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/workbench/browser/quickopen", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/parts/output/common/output", "vs/workbench/parts/terminal/common/terminal", "vs/workbench/services/panel/common/panelService", "vs/platform/quickOpen/common/quickOpen", "vs/base/common/actions", "vs/platform/keybinding/common/keybinding", "vs/base/common/strings", "vs/base/common/filters", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/workbench/parts/files/common/files", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/extensions/common/extensions"], function (require, exports, winjs_base_1, nls, errors, quickOpen_1, quickOpenModel_1, quickopen_1, viewlet_1, output_1, terminal_1, panelService_1, quickOpen_2, actions_1, keybinding_1, strings_1, filters_1, views_1, contextkey_1, files_1, debug_1, extensions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VIEW_PICKER_PREFIX = 'view ';
    var ViewEntry = /** @class */ (function (_super) {
        __extends(ViewEntry, _super);
        function ViewEntry(label, category, open) {
            var _this = _super.call(this) || this;
            _this.label = label;
            _this.category = category;
            _this.open = open;
            return _this;
        }
        ViewEntry.prototype.getLabel = function () {
            return this.label;
        };
        ViewEntry.prototype.getCategory = function () {
            return this.category;
        };
        ViewEntry.prototype.getAriaLabel = function () {
            return nls.localize('entryAriaLabel', "{0}, view picker", this.getLabel());
        };
        ViewEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                return this.runOpen(context);
            }
            return _super.prototype.run.call(this, mode, context);
        };
        ViewEntry.prototype.runOpen = function (context) {
            var _this = this;
            setTimeout(function () {
                _this.open();
            }, 0);
            return true;
        };
        return ViewEntry;
    }(quickOpenModel_1.QuickOpenEntryGroup));
    exports.ViewEntry = ViewEntry;
    var ViewPickerHandler = /** @class */ (function (_super) {
        __extends(ViewPickerHandler, _super);
        function ViewPickerHandler(viewletService, outputService, terminalService, panelService, contextKeyService) {
            var _this = _super.call(this) || this;
            _this.viewletService = viewletService;
            _this.outputService = outputService;
            _this.terminalService = terminalService;
            _this.panelService = panelService;
            _this.contextKeyService = contextKeyService;
            return _this;
        }
        ViewPickerHandler.prototype.getResults = function (searchValue) {
            searchValue = searchValue.trim();
            var normalizedSearchValueLowercase = strings_1.stripWildcards(searchValue).toLowerCase();
            var viewEntries = this.getViewEntries();
            var entries = viewEntries.filter(function (e) {
                if (!searchValue) {
                    return true;
                }
                var highlights = filters_1.matchesFuzzy(normalizedSearchValueLowercase, e.getLabel(), true);
                if (highlights) {
                    e.setHighlights(highlights);
                }
                if (!highlights && !strings_1.fuzzyContains(e.getCategory(), normalizedSearchValueLowercase)) {
                    return false;
                }
                return true;
            });
            var lastCategory;
            entries.forEach(function (e, index) {
                if (lastCategory !== e.getCategory()) {
                    lastCategory = e.getCategory();
                    e.setShowBorder(index > 0);
                    e.setGroupLabel(lastCategory);
                }
                else {
                    e.setShowBorder(false);
                    e.setGroupLabel(void 0);
                }
            });
            return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel(entries));
        };
        ViewPickerHandler.prototype.getViewEntries = function () {
            var _this = this;
            var viewEntries = [];
            var getViewEntriesForViewlet = function (viewlet, viewLocation) {
                var views = views_1.ViewsRegistry.getViews(viewLocation);
                var result = [];
                if (views.length) {
                    var _loop_1 = function (view) {
                        if (_this.contextKeyService.contextMatchesRules(view.when)) {
                            result.push(new ViewEntry(view.name, viewlet.name, function () { return _this.viewletService.openViewlet(viewlet.id, true).done(function (viewlet) { return viewlet.openView(view.id); }, errors.onUnexpectedError); }));
                        }
                    };
                    for (var _i = 0, views_2 = views; _i < views_2.length; _i++) {
                        var view = views_2[_i];
                        _loop_1(view);
                    }
                }
                return result;
            };
            // Viewlets
            var viewlets = this.viewletService.getViewlets();
            viewlets.forEach(function (viewlet, index) { return viewEntries.push(new ViewEntry(viewlet.name, nls.localize('views', "Views"), function () { return _this.viewletService.openViewlet(viewlet.id, true).done(null, errors.onUnexpectedError); })); });
            // Panels
            var panels = this.panelService.getPanels();
            panels.forEach(function (panel, index) { return viewEntries.push(new ViewEntry(panel.name, nls.localize('panels', "Panels"), function () { return _this.panelService.openPanel(panel.id, true).done(null, errors.onUnexpectedError); })); });
            // Views
            viewlets.forEach(function (viewlet, index) {
                var viewLocation = viewlet.id === files_1.VIEWLET_ID ? views_1.ViewLocation.Explorer
                    : viewlet.id === debug_1.VIEWLET_ID ? views_1.ViewLocation.Debug
                        : viewlet.id === extensions_1.VIEWLET_ID ? views_1.ViewLocation.Extensions
                            : null;
                if (viewLocation) {
                    var viewEntriesForViewlet = getViewEntriesForViewlet(viewlet, viewLocation);
                    viewEntries.push.apply(viewEntries, viewEntriesForViewlet);
                }
            });
            // Terminals
            var terminals = this.terminalService.terminalInstances;
            terminals.forEach(function (terminal, index) {
                var terminalsCategory = nls.localize('terminals', "Terminal");
                var entry = new ViewEntry(nls.localize('terminalTitle', "{0}: {1}", index + 1, terminal.title), terminalsCategory, function () {
                    _this.terminalService.showPanel(true).done(function () {
                        _this.terminalService.setActiveInstance(terminal);
                    }, errors.onUnexpectedError);
                });
                viewEntries.push(entry);
            });
            // Output Channels
            var channels = this.outputService.getChannels();
            channels.forEach(function (channel, index) {
                var outputCategory = nls.localize('channels', "Output");
                var entry = new ViewEntry(channel.label, outputCategory, function () { return _this.outputService.showChannel(channel.id).done(null, errors.onUnexpectedError); });
                viewEntries.push(entry);
            });
            return viewEntries;
        };
        ViewPickerHandler.prototype.getAutoFocus = function (searchValue, context) {
            return {
                autoFocusFirstEntry: !!searchValue || !!context.quickNavigateConfiguration
            };
        };
        ViewPickerHandler.ID = 'workbench.picker.views';
        ViewPickerHandler = __decorate([
            __param(0, viewlet_1.IViewletService),
            __param(1, output_1.IOutputService),
            __param(2, terminal_1.ITerminalService),
            __param(3, panelService_1.IPanelService),
            __param(4, contextkey_1.IContextKeyService)
        ], ViewPickerHandler);
        return ViewPickerHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.ViewPickerHandler = ViewPickerHandler;
    var OpenViewPickerAction = /** @class */ (function (_super) {
        __extends(OpenViewPickerAction, _super);
        function OpenViewPickerAction(id, label, quickOpenService) {
            return _super.call(this, id, label, exports.VIEW_PICKER_PREFIX, quickOpenService) || this;
        }
        OpenViewPickerAction.ID = 'workbench.action.openView';
        OpenViewPickerAction.LABEL = nls.localize('openView', "Open View");
        OpenViewPickerAction = __decorate([
            __param(2, quickOpen_2.IQuickOpenService)
        ], OpenViewPickerAction);
        return OpenViewPickerAction;
    }(quickopen_1.QuickOpenAction));
    exports.OpenViewPickerAction = OpenViewPickerAction;
    var QuickOpenViewPickerAction = /** @class */ (function (_super) {
        __extends(QuickOpenViewPickerAction, _super);
        function QuickOpenViewPickerAction(id, label, quickOpenService, keybindingService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            _this.keybindingService = keybindingService;
            return _this;
        }
        QuickOpenViewPickerAction.prototype.run = function () {
            var keys = this.keybindingService.lookupKeybindings(this.id);
            this.quickOpenService.show(exports.VIEW_PICKER_PREFIX, { quickNavigateConfiguration: { keybindings: keys } });
            return winjs_base_1.TPromise.as(true);
        };
        QuickOpenViewPickerAction.ID = 'workbench.action.quickOpenView';
        QuickOpenViewPickerAction.LABEL = nls.localize('quickOpenView', "Quick Open View");
        QuickOpenViewPickerAction = __decorate([
            __param(2, quickOpen_2.IQuickOpenService),
            __param(3, keybinding_1.IKeybindingService)
        ], QuickOpenViewPickerAction);
        return QuickOpenViewPickerAction;
    }(actions_1.Action));
    exports.QuickOpenViewPickerAction = QuickOpenViewPickerAction;
});
