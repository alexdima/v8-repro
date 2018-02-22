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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/selectBox/selectBox", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/workbench/parts/debug/common/debug", "vs/platform/theme/common/themeService", "vs/platform/theme/common/styler", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/platform/contextview/browser/contextView", "vs/platform/workspace/common/workspace"], function (require, exports, nls, lifecycle, errors, dom, keyboardEvent_1, selectBox_1, actionbar_1, configuration_1, commands_1, debug_1, themeService_1, styler_1, theme_1, colorRegistry_1, contextView_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var StartDebugActionItem = /** @class */ (function () {
        function StartDebugActionItem(context, action, debugService, themeService, configurationService, commandService, contextService, contextViewService) {
            this.context = context;
            this.action = action;
            this.debugService = debugService;
            this.themeService = themeService;
            this.configurationService = configurationService;
            this.commandService = commandService;
            this.contextService = contextService;
            this.toDispose = [];
            this.selectBox = new selectBox_1.SelectBox([], -1, contextViewService);
            this.toDispose.push(styler_1.attachSelectBoxStyler(this.selectBox, themeService, {
                selectBackground: theme_1.SIDE_BAR_BACKGROUND
            }));
            this.registerListeners();
        }
        StartDebugActionItem.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration('launch')) {
                    _this.updateOptions();
                }
            }));
            this.toDispose.push(this.selectBox.onDidSelect(function (e) {
                if (_this.options[e.index].handler()) {
                    _this.selected = e.index;
                }
                else {
                    // Some select options should not remain selected https://github.com/Microsoft/vscode/issues/31526
                    _this.selectBox.select(_this.selected);
                }
            }));
            this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration(function () {
                _this.updateOptions();
            }));
        };
        StartDebugActionItem.prototype.render = function (container) {
            var _this = this;
            this.container = container;
            dom.addClass(container, 'start-debug-action-item');
            this.start = dom.append(container, $('.icon'));
            this.start.title = this.action.label;
            this.start.tabIndex = 0;
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.CLICK, function () {
                _this.start.blur();
                _this.actionRunner.run(_this.action, _this.context).done(null, errors.onUnexpectedError);
            }));
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_DOWN, function (e) {
                if (_this.action.enabled && e.button === 0) {
                    dom.addClass(_this.start, 'active');
                }
            }));
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_UP, function () {
                dom.removeClass(_this.start, 'active');
            }));
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_OUT, function () {
                dom.removeClass(_this.start, 'active');
            }));
            this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.KEY_DOWN, function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(3 /* Enter */)) {
                    _this.actionRunner.run(_this.action, _this.context).done(null, errors.onUnexpectedError);
                }
                if (event.equals(17 /* RightArrow */)) {
                    _this.selectBox.focus();
                    event.stopPropagation();
                }
            }));
            var selectBoxContainer = $('.configuration');
            this.selectBox.render(dom.append(container, selectBoxContainer));
            this.toDispose.push(dom.addDisposableListener(selectBoxContainer, dom.EventType.KEY_DOWN, function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(15 /* LeftArrow */)) {
                    _this.start.focus();
                    event.stopPropagation();
                }
            }));
            this.toDispose.push(styler_1.attachStylerCallback(this.themeService, { selectBorder: colorRegistry_1.selectBorder }, function (colors) {
                _this.container.style.border = colors.selectBorder ? "1px solid " + colors.selectBorder : null;
                selectBoxContainer.style.borderLeft = colors.selectBorder ? "1px solid " + colors.selectBorder : null;
            }));
            this.updateOptions();
        };
        StartDebugActionItem.prototype.setActionContext = function (context) {
            this.context = context;
        };
        StartDebugActionItem.prototype.isEnabled = function () {
            return true;
        };
        StartDebugActionItem.prototype.focus = function (fromRight) {
            if (fromRight) {
                this.selectBox.focus();
            }
            else {
                this.start.focus();
            }
        };
        StartDebugActionItem.prototype.blur = function () {
            this.container.blur();
        };
        StartDebugActionItem.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        StartDebugActionItem.prototype.updateOptions = function () {
            var _this = this;
            this.selected = 0;
            this.options = [];
            var manager = this.debugService.getConfigurationManager();
            var launches = manager.getLaunches();
            var inWorkspace = this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE;
            launches.forEach(function (launch) {
                return launch.getConfigurationNames().forEach(function (name) {
                    if (name === manager.selectedConfiguration.name && launch === manager.selectedConfiguration.launch) {
                        _this.selected = _this.options.length;
                    }
                    var label = inWorkspace ? name + " (" + launch.name + ")" : name;
                    _this.options.push({ label: label, handler: function () { manager.selectConfiguration(launch, name); return true; } });
                });
            });
            if (this.options.length === 0) {
                this.options.push({ label: nls.localize('noConfigurations', "No Configurations"), handler: function () { return false; } });
            }
            this.options.push({ label: StartDebugActionItem.SEPARATOR, handler: undefined });
            var disabledIdx = this.options.length - 1;
            launches.filter(function (l) { return !l.hidden; }).forEach(function (l) {
                var label = inWorkspace ? nls.localize("addConfigTo", "Add Config ({0})...", l.name) : nls.localize('addConfiguration', "Add Configuration...");
                _this.options.push({
                    label: label, handler: function () {
                        _this.commandService.executeCommand('debug.addConfiguration', l.uri.toString()).done(undefined, errors.onUnexpectedError);
                        return false;
                    }
                });
            });
            this.selectBox.setOptions(this.options.map(function (data) { return data.label; }), this.selected, disabledIdx);
        };
        StartDebugActionItem.SEPARATOR = '─────────';
        StartDebugActionItem = __decorate([
            __param(2, debug_1.IDebugService),
            __param(3, themeService_1.IThemeService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, commands_1.ICommandService),
            __param(6, workspace_1.IWorkspaceContextService),
            __param(7, contextView_1.IContextViewService)
        ], StartDebugActionItem);
        return StartDebugActionItem;
    }());
    exports.StartDebugActionItem = StartDebugActionItem;
    var FocusProcessActionItem = /** @class */ (function (_super) {
        __extends(FocusProcessActionItem, _super);
        function FocusProcessActionItem(action, debugService, themeService, contextViewService) {
            var _this = _super.call(this, null, action, [], -1, contextViewService) || this;
            _this.debugService = debugService;
            _this.toDispose.push(styler_1.attachSelectBoxStyler(_this.selectBox, themeService));
            _this.debugService.getViewModel().onDidFocusStackFrame(function () {
                var process = _this.debugService.getViewModel().focusedProcess;
                if (process) {
                    var index = _this.debugService.getModel().getProcesses().indexOf(process);
                    _this.select(index);
                }
            });
            _this.debugService.getModel().onDidChangeCallStack(function () { return _this.update(); });
            _this.update();
            return _this;
        }
        FocusProcessActionItem.prototype.update = function () {
            var process = this.debugService.getViewModel().focusedProcess;
            var processes = this.debugService.getModel().getProcesses();
            var showRootName = this.debugService.getConfigurationManager().getLaunches().length > 1;
            var names = processes.map(function (p) { return p.getName(showRootName); });
            this.setOptions(names, process ? processes.indexOf(process) : undefined);
        };
        FocusProcessActionItem = __decorate([
            __param(1, debug_1.IDebugService),
            __param(2, themeService_1.IThemeService),
            __param(3, contextView_1.IContextViewService)
        ], FocusProcessActionItem);
        return FocusProcessActionItem;
    }(actionbar_1.SelectActionItem));
    exports.FocusProcessActionItem = FocusProcessActionItem;
});
