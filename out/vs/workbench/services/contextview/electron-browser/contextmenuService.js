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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/severity", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/dom", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/message/common/message", "vs/platform/keybinding/common/keybinding", "electron", "vs/base/common/labels", "vs/base/common/event"], function (require, exports, winjs_base_1, severity_1, actions_1, actionbar_1, dom, contextView_1, telemetry_1, message_1, keybinding_1, electron_1, labels_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContextMenuService = /** @class */ (function () {
        function ContextMenuService(messageService, telemetryService, keybindingService) {
            this.messageService = messageService;
            this.telemetryService = telemetryService;
            this.keybindingService = keybindingService;
            this._onDidContextMenu = new event_1.Emitter();
        }
        Object.defineProperty(ContextMenuService.prototype, "onDidContextMenu", {
            get: function () {
                return this._onDidContextMenu.event;
            },
            enumerable: true,
            configurable: true
        });
        ContextMenuService.prototype.showContextMenu = function (delegate) {
            var _this = this;
            delegate.getActions().then(function (actions) {
                if (!actions.length) {
                    return winjs_base_1.TPromise.as(null);
                }
                return winjs_base_1.TPromise.timeout(0).then(function () {
                    var menu = _this.createMenu(delegate, actions);
                    var anchor = delegate.getAnchor();
                    var x, y;
                    if (dom.isHTMLElement(anchor)) {
                        var elementPosition = dom.getDomNodePagePosition(anchor);
                        x = elementPosition.left;
                        y = elementPosition.top + elementPosition.height;
                    }
                    else {
                        var pos = anchor;
                        x = pos.x + 1; /* prevent first item from being selected automatically under mouse */
                        y = pos.y;
                    }
                    var zoom = electron_1.webFrame.getZoomFactor();
                    x *= zoom;
                    y *= zoom;
                    menu.popup(electron_1.remote.getCurrentWindow(), { x: Math.floor(x), y: Math.floor(y), positioningItem: delegate.autoSelectFirstItem ? 0 : void 0 });
                    _this._onDidContextMenu.fire();
                    if (delegate.onHide) {
                        delegate.onHide(undefined);
                    }
                });
            });
        };
        ContextMenuService.prototype.createMenu = function (delegate, entries) {
            var _this = this;
            var menu = new electron_1.remote.Menu();
            var actionRunner = delegate.actionRunner || new actions_1.ActionRunner();
            entries.forEach(function (e) {
                if (e instanceof actionbar_1.Separator) {
                    menu.append(new electron_1.remote.MenuItem({ type: 'separator' }));
                }
                else if (e instanceof contextView_1.ContextSubMenu) {
                    var submenu = new electron_1.remote.MenuItem({
                        submenu: _this.createMenu(delegate, e.entries),
                        label: labels_1.unmnemonicLabel(e.label)
                    });
                    menu.append(submenu);
                }
                else {
                    var options = {
                        label: labels_1.unmnemonicLabel(e.label),
                        checked: !!e.checked || !!e.radio,
                        type: !!e.checked ? 'checkbox' : !!e.radio ? 'radio' : void 0,
                        enabled: !!e.enabled,
                        click: function (menuItem, win, event) {
                            _this.runAction(actionRunner, e, delegate, event);
                        }
                    };
                    var keybinding = !!delegate.getKeyBinding ? delegate.getKeyBinding(e) : _this.keybindingService.lookupKeybinding(e.id);
                    if (keybinding) {
                        var electronAccelerator = keybinding.getElectronAccelerator();
                        if (electronAccelerator) {
                            options.accelerator = electronAccelerator;
                        }
                        else {
                            var label = keybinding.getLabel();
                            if (label) {
                                options.label = options.label + " [" + label + "]";
                            }
                        }
                    }
                    var item = new electron_1.remote.MenuItem(options);
                    menu.append(item);
                }
            });
            return menu;
        };
        ContextMenuService.prototype.runAction = function (actionRunner, actionToRun, delegate, event) {
            var _this = this;
            /* __GDPR__
                "workbenchActionExecuted" : {
                    "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('workbenchActionExecuted', { id: actionToRun.id, from: 'contextMenu' });
            var context = delegate.getActionsContext ? delegate.getActionsContext(event) : event;
            var res = actionRunner.run(actionToRun, context) || winjs_base_1.TPromise.as(null);
            res.done(null, function (e) { return _this.messageService.show(severity_1.default.Error, e); });
        };
        ContextMenuService = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, telemetry_1.ITelemetryService),
            __param(2, keybinding_1.IKeybindingService)
        ], ContextMenuService);
        return ContextMenuService;
    }());
    exports.ContextMenuService = ContextMenuService;
});
