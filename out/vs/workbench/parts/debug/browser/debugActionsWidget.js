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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/strings", "vs/base/browser/browser", "vs/base/common/severity", "vs/base/browser/builder", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/browser/mouseEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/services/part/common/partService", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/browser/debugActions", "vs/workbench/parts/debug/browser/debugActionItems", "vs/platform/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/platform/message/common/message", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/nls", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/editor/common/editorService", "vs/platform/contextview/browser/contextView", "vs/css!./media/debugActionsWidget"], function (require, exports, errors, strings, browser, severity_1, builder, dom, arrays, mouseEvent_1, actionbar_1, partService_1, debug_1, debugActions_1, debugActionItems_1, configuration_1, storage_1, message_1, telemetry_1, theme_1, themeService_1, colorRegistry_1, nls_1, keybinding_1, editorService_1, contextView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = builder.$;
    var DEBUG_ACTIONS_WIDGET_POSITION_KEY = 'debug.actionswidgetposition';
    exports.debugToolBarBackground = colorRegistry_1.registerColor('debugToolBar.background', {
        dark: '#333333',
        light: '#F3F3F3',
        hc: '#000000'
    }, nls_1.localize('debugToolBarBackground', "Debug toolbar background color."));
    exports.debugToolBarBorder = colorRegistry_1.registerColor('debugToolBar.border', {
        dark: null,
        light: null,
        hc: null
    }, nls_1.localize('debugToolBarBorder', "Debug toolbar border color."));
    var DebugActionsWidget = /** @class */ (function (_super) {
        __extends(DebugActionsWidget, _super);
        function DebugActionsWidget(messageService, telemetryService, debugService, partService, storageService, configurationService, themeService, keybindingService, editorService, contextViewService) {
            var _this = _super.call(this, themeService) || this;
            _this.messageService = messageService;
            _this.telemetryService = telemetryService;
            _this.debugService = debugService;
            _this.partService = partService;
            _this.storageService = storageService;
            _this.configurationService = configurationService;
            _this.keybindingService = keybindingService;
            _this.editorService = editorService;
            _this.$el = $().div().addClass('debug-actions-widget').style('top', partService.getTitleBarOffset() + "px");
            _this.dragArea = $().div().addClass('drag-area');
            _this.$el.append(_this.dragArea);
            var actionBarContainter = $().div().addClass('.action-bar-container');
            _this.$el.append(actionBarContainter);
            _this.activeActions = [];
            _this.actionBar = new actionbar_1.ActionBar(actionBarContainter, {
                orientation: actionbar_1.ActionsOrientation.HORIZONTAL,
                actionItemProvider: function (action) {
                    if (action.id === debugActions_1.FocusProcessAction.ID) {
                        return new debugActionItems_1.FocusProcessActionItem(action, _this.debugService, _this.themeService, contextViewService);
                    }
                    return null;
                }
            });
            _this.updateStyles();
            _this.toUnbind.push(_this.actionBar);
            _this.registerListeners();
            _this.hide();
            _this.isBuilt = false;
            return _this;
        }
        DebugActionsWidget.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.debugService.onDidChangeState(function (state) { return _this.update(state); }));
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onDidConfigurationChange(e); }));
            this.toUnbind.push(this.actionBar.actionRunner.onDidRun(function (e) {
                // check for error
                if (e.error && !errors.isPromiseCanceledError(e.error)) {
                    _this.messageService.show(severity_1.default.Error, e.error);
                }
                // log in telemetry
                if (_this.telemetryService) {
                    /* __GDPR__
                        "workbenchActionExecuted" : {
                            "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                        }
                    */
                    _this.telemetryService.publicLog('workbenchActionExecuted', { id: e.action.id, from: 'debugActionsWidget' });
                }
            }));
            $(window).on(dom.EventType.RESIZE, function () { return _this.setXCoordinate(); }, this.toUnbind);
            this.dragArea.on(dom.EventType.MOUSE_UP, function (event) {
                var mouseClickEvent = new mouseEvent_1.StandardMouseEvent(event);
                if (mouseClickEvent.detail === 2) {
                    // double click on debug bar centers it again #8250
                    var widgetWidth = _this.$el.getHTMLElement().clientWidth;
                    _this.setXCoordinate(0.5 * window.innerWidth - 0.5 * widgetWidth);
                    _this.storePosition();
                }
            });
            this.dragArea.on(dom.EventType.MOUSE_DOWN, function (event) {
                var $window = $(window);
                _this.dragArea.addClass('dragged');
                $window.on('mousemove', function (e) {
                    var mouseMoveEvent = new mouseEvent_1.StandardMouseEvent(e);
                    // Prevent default to stop editor selecting text #8524
                    mouseMoveEvent.preventDefault();
                    // Reduce x by width of drag handle to reduce jarring #16604
                    _this.setXCoordinate(mouseMoveEvent.posx - 14);
                }).once('mouseup', function (e) {
                    _this.storePosition();
                    _this.dragArea.removeClass('dragged');
                    $window.off('mousemove');
                });
            });
            this.toUnbind.push(this.partService.onTitleBarVisibilityChange(function () { return _this.positionDebugWidget(); }));
            this.toUnbind.push(browser.onDidChangeZoomLevel(function () { return _this.positionDebugWidget(); }));
        };
        DebugActionsWidget.prototype.storePosition = function () {
            var position = parseFloat(this.$el.getComputedStyle().left) / window.innerWidth;
            this.storageService.store(DEBUG_ACTIONS_WIDGET_POSITION_KEY, position, storage_1.StorageScope.WORKSPACE);
        };
        DebugActionsWidget.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            if (this.$el) {
                this.$el.style('background-color', this.getColor(exports.debugToolBarBackground));
                var widgetShadowColor = this.getColor(colorRegistry_1.widgetShadow);
                this.$el.style('box-shadow', widgetShadowColor ? "0 5px 8px " + widgetShadowColor : null);
                var contrastBorderColor = this.getColor(colorRegistry_1.contrastBorder);
                var borderColor = this.getColor(exports.debugToolBarBorder);
                if (contrastBorderColor) {
                    this.$el.style('border', "1px solid " + contrastBorderColor);
                }
                else {
                    this.$el.style({
                        'border': borderColor ? "solid " + borderColor : 'none',
                        'border-width': '1px 0'
                    });
                }
            }
        };
        DebugActionsWidget.prototype.positionDebugWidget = function () {
            var titlebarOffset = this.partService.getTitleBarOffset();
            $(this.$el).style('top', titlebarOffset + "px");
        };
        DebugActionsWidget.prototype.setXCoordinate = function (x) {
            if (!this.isVisible) {
                return;
            }
            var widgetWidth = this.$el.getHTMLElement().clientWidth;
            if (x === undefined) {
                var positionPercentage = this.storageService.get(DEBUG_ACTIONS_WIDGET_POSITION_KEY, storage_1.StorageScope.WORKSPACE);
                x = positionPercentage !== undefined ? parseFloat(positionPercentage) * window.innerWidth : (0.5 * window.innerWidth - 0.5 * widgetWidth);
            }
            x = Math.max(0, Math.min(x, window.innerWidth - widgetWidth)); // do not allow the widget to overflow on the right
            this.$el.style('left', x + "px");
        };
        DebugActionsWidget.prototype.onDidConfigurationChange = function (event) {
            if (event.affectsConfiguration('debug.hideActionBar')) {
                this.update(this.debugService.state);
            }
        };
        DebugActionsWidget.prototype.update = function (state) {
            if (state === debug_1.State.Inactive || state === debug_1.State.Initializing || this.configurationService.getValue('debug').hideActionBar) {
                return this.hide();
            }
            var actions = this.getActions();
            if (!arrays.equals(actions, this.activeActions, function (first, second) { return first.id === second.id; })) {
                this.actionBar.clear();
                this.actionBar.push(actions, { icon: true, label: false });
                this.activeActions = actions;
            }
            this.show();
        };
        DebugActionsWidget.prototype.show = function () {
            if (this.isVisible) {
                return;
            }
            if (!this.isBuilt) {
                this.isBuilt = true;
                this.$el.build(builder.withElementById(this.partService.getWorkbenchElementId()).getHTMLElement());
            }
            this.isVisible = true;
            this.$el.show();
            this.setXCoordinate();
        };
        DebugActionsWidget.prototype.hide = function () {
            this.isVisible = false;
            this.$el.hide();
        };
        DebugActionsWidget.prototype.getActions = function () {
            var _this = this;
            if (!this.allActions) {
                this.allActions = [];
                this.allActions.push(new debugActions_1.ContinueAction(debugActions_1.ContinueAction.ID, debugActions_1.ContinueAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.PauseAction(debugActions_1.PauseAction.ID, debugActions_1.PauseAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.StopAction(debugActions_1.StopAction.ID, debugActions_1.StopAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.DisconnectAction(debugActions_1.DisconnectAction.ID, debugActions_1.DisconnectAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.StepOverAction(debugActions_1.StepOverAction.ID, debugActions_1.StepOverAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.StepIntoAction(debugActions_1.StepIntoAction.ID, debugActions_1.StepIntoAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.StepOutAction(debugActions_1.StepOutAction.ID, debugActions_1.StepOutAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.RestartAction(debugActions_1.RestartAction.ID, debugActions_1.RestartAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.StepBackAction(debugActions_1.StepBackAction.ID, debugActions_1.StepBackAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.ReverseContinueAction(debugActions_1.ReverseContinueAction.ID, debugActions_1.ReverseContinueAction.LABEL, this.debugService, this.keybindingService));
                this.allActions.push(new debugActions_1.FocusProcessAction(debugActions_1.FocusProcessAction.ID, debugActions_1.FocusProcessAction.LABEL, this.debugService, this.keybindingService, this.editorService));
                this.allActions.forEach(function (a) {
                    _this.toUnbind.push(a);
                });
            }
            var state = this.debugService.state;
            var process = this.debugService.getViewModel().focusedProcess;
            var attached = process && process.configuration.request === 'attach' && process.configuration.type && !strings.equalsIgnoreCase(process.configuration.type, 'extensionHost');
            return this.allActions.filter(function (a) {
                if (a.id === debugActions_1.ContinueAction.ID) {
                    return state !== debug_1.State.Running;
                }
                if (a.id === debugActions_1.PauseAction.ID) {
                    return state === debug_1.State.Running;
                }
                if (a.id === debugActions_1.StepBackAction.ID) {
                    return process && process.session.capabilities.supportsStepBack;
                }
                if (a.id === debugActions_1.ReverseContinueAction.ID) {
                    return process && process.session.capabilities.supportsStepBack;
                }
                if (a.id === debugActions_1.DisconnectAction.ID) {
                    return attached;
                }
                if (a.id === debugActions_1.StopAction.ID) {
                    return !attached;
                }
                if (a.id === debugActions_1.FocusProcessAction.ID) {
                    return _this.debugService.getViewModel().isMultiProcessView();
                }
                return true;
            }).sort(function (first, second) { return first.weight - second.weight; });
        };
        DebugActionsWidget.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.$el) {
                this.$el.destroy();
                delete this.$el;
            }
        };
        DebugActionsWidget = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, telemetry_1.ITelemetryService),
            __param(2, debug_1.IDebugService),
            __param(3, partService_1.IPartService),
            __param(4, storage_1.IStorageService),
            __param(5, configuration_1.IConfigurationService),
            __param(6, themeService_1.IThemeService),
            __param(7, keybinding_1.IKeybindingService),
            __param(8, editorService_1.IWorkbenchEditorService),
            __param(9, contextView_1.IContextViewService)
        ], DebugActionsWidget);
        return DebugActionsWidget;
    }(theme_1.Themable));
    exports.DebugActionsWidget = DebugActionsWidget;
});
