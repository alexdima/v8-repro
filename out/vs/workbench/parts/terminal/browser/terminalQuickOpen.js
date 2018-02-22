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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/parts/quickopen/common/quickOpen", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/workbench/browser/quickopen", "vs/workbench/parts/terminal/common/terminal", "vs/workbench/browser/actions", "vs/base/common/strings", "vs/base/common/filters", "vs/platform/commands/common/commands"], function (require, exports, nls, winjs_base_1, quickOpen_1, quickOpenModel_1, quickopen_1, terminal_1, actions_1, strings_1, filters_1, commands_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TerminalEntry = /** @class */ (function (_super) {
        __extends(TerminalEntry, _super);
        function TerminalEntry(label, terminalService) {
            var _this = _super.call(this) || this;
            _this.label = label;
            _this.terminalService = terminalService;
            return _this;
        }
        TerminalEntry.prototype.getLabel = function () {
            return this.label;
        };
        TerminalEntry.prototype.getAriaLabel = function () {
            return nls.localize('termEntryAriaLabel', "{0}, terminal picker", this.getLabel());
        };
        TerminalEntry.prototype.run = function (mode, context) {
            var _this = this;
            if (mode === quickOpen_1.Mode.OPEN) {
                setTimeout(function () {
                    _this.terminalService.setActiveInstanceByIndex(parseInt(_this.label.split(':')[0], 10) - 1);
                    _this.terminalService.showPanel(true);
                }, 0);
                return true;
            }
            return _super.prototype.run.call(this, mode, context);
        };
        return TerminalEntry;
    }(quickOpenModel_1.QuickOpenEntry));
    exports.TerminalEntry = TerminalEntry;
    var CreateTerminal = /** @class */ (function (_super) {
        __extends(CreateTerminal, _super);
        function CreateTerminal(label, commandService) {
            var _this = _super.call(this) || this;
            _this.label = label;
            _this.commandService = commandService;
            return _this;
        }
        CreateTerminal.prototype.getLabel = function () {
            return this.label;
        };
        CreateTerminal.prototype.getAriaLabel = function () {
            return nls.localize('termCreateEntryAriaLabel', "{0}, create new terminal", this.getLabel());
        };
        CreateTerminal.prototype.run = function (mode, context) {
            var _this = this;
            if (mode === quickOpen_1.Mode.OPEN) {
                setTimeout(function () { return _this.commandService.executeCommand('workbench.action.terminal.new'); }, 0);
                return true;
            }
            return _super.prototype.run.call(this, mode, context);
        };
        return CreateTerminal;
    }(quickOpenModel_1.QuickOpenEntry));
    exports.CreateTerminal = CreateTerminal;
    var TerminalPickerHandler = /** @class */ (function (_super) {
        __extends(TerminalPickerHandler, _super);
        function TerminalPickerHandler(terminalService, commandService) {
            var _this = _super.call(this) || this;
            _this.terminalService = terminalService;
            _this.commandService = commandService;
            return _this;
        }
        TerminalPickerHandler.prototype.getResults = function (searchValue) {
            searchValue = searchValue.trim();
            var normalizedSearchValueLowercase = strings_1.stripWildcards(searchValue).toLowerCase();
            var terminalEntries = this.getTerminals();
            terminalEntries.push(new CreateTerminal(nls.localize("workbench.action.terminal.newplus", "$(plus) Create New Integrated Terminal"), this.commandService));
            var entries = terminalEntries.filter(function (e) {
                if (!searchValue) {
                    return true;
                }
                var highlights = filters_1.matchesFuzzy(normalizedSearchValueLowercase, e.getLabel(), true);
                if (!highlights) {
                    return false;
                }
                e.setHighlights(highlights);
                return true;
            });
            return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel(entries, new actions_1.ContributableActionProvider()));
        };
        TerminalPickerHandler.prototype.getTerminals = function () {
            var _this = this;
            var terminals = this.terminalService.getTabLabels();
            var terminalEntries = terminals.map(function (terminal) {
                return new TerminalEntry(terminal, _this.terminalService);
            });
            return terminalEntries;
        };
        TerminalPickerHandler.prototype.getAutoFocus = function (searchValue, context) {
            return {
                autoFocusFirstEntry: !!searchValue || !!context.quickNavigateConfiguration
            };
        };
        TerminalPickerHandler.prototype.getEmptyLabel = function (searchString) {
            if (searchString.length > 0) {
                return nls.localize('noTerminalsMatching', "No terminals matching");
            }
            return nls.localize('noTerminalsFound', "No terminals open");
        };
        TerminalPickerHandler.ID = 'workbench.picker.terminals';
        TerminalPickerHandler = __decorate([
            __param(0, terminal_1.ITerminalService),
            __param(1, commands_1.ICommandService)
        ], TerminalPickerHandler);
        return TerminalPickerHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.TerminalPickerHandler = TerminalPickerHandler;
});
