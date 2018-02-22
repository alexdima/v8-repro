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
define(["require", "exports", "vs/base/browser/builder", "vs/base/browser/dom", "vs/platform/registry/common/platform", "vs/platform/keybinding/common/keybinding", "vs/workbench/parts/quickopen/browser/commandsHandler", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/part/common/partService", "vs/nls", "vs/base/common/actions", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/css!./welcomeOverlay"], function (require, exports, builder_1, dom, platform_1, keybinding_1, commandsHandler_1, editorService_1, partService_1, nls_1, actions_1, actions_2, actions_3, commands_1, lifecycle_1, contextkey_1, instantiation_1, themeService_1, colorRegistry_1, color_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var keys = [
        {
            id: 'explorer',
            arrow: '&larr;',
            label: nls_1.localize('welcomeOverlay.explorer', "File explorer"),
            command: 'workbench.view.explorer'
        },
        {
            id: 'search',
            arrow: '&larr;',
            label: nls_1.localize('welcomeOverlay.search', "Search across files"),
            command: 'workbench.view.search'
        },
        {
            id: 'git',
            arrow: '&larr;',
            label: nls_1.localize('welcomeOverlay.git', "Source code management"),
            command: 'workbench.view.scm'
        },
        {
            id: 'debug',
            arrow: '&larr;',
            label: nls_1.localize('welcomeOverlay.debug', "Launch and debug"),
            command: 'workbench.view.debug'
        },
        {
            id: 'extensions',
            arrow: '&larr;',
            label: nls_1.localize('welcomeOverlay.extensions', "Manage extensions"),
            command: 'workbench.view.extensions'
        },
        // {
        // 	id: 'watermark',
        // 	arrow: '&larrpl;',
        // 	label: localize('welcomeOverlay.watermark', "Command Hints"),
        // 	withEditor: false
        // },
        {
            id: 'problems',
            arrow: '&larrpl;',
            label: nls_1.localize('welcomeOverlay.problems', "View errors and warnings"),
            command: 'workbench.actions.view.problems'
        },
        // {
        // 	id: 'openfile',
        // 	arrow: '&cudarrl;',
        // 	label: localize('welcomeOverlay.openfile', "File Properties"),
        // 	arrowLast: true,
        // 	withEditor: true
        // },
        {
            id: 'commandPalette',
            arrow: '&nwarr;',
            label: nls_1.localize('welcomeOverlay.commandPalette', "Find and run all commands"),
            command: commandsHandler_1.ShowAllCommandsAction.ID
        },
    ];
    var OVERLAY_VISIBLE = new contextkey_1.RawContextKey('interfaceOverviewVisible', false);
    var welcomeOverlay;
    var WelcomeOverlayAction = /** @class */ (function (_super) {
        __extends(WelcomeOverlayAction, _super);
        function WelcomeOverlayAction(id, label, instantiationService) {
            var _this = _super.call(this, id, label) || this;
            _this.instantiationService = instantiationService;
            return _this;
        }
        WelcomeOverlayAction.prototype.run = function () {
            if (!welcomeOverlay) {
                welcomeOverlay = this.instantiationService.createInstance(WelcomeOverlay);
            }
            welcomeOverlay.show();
            return null;
        };
        WelcomeOverlayAction.ID = 'workbench.action.showInterfaceOverview';
        WelcomeOverlayAction.LABEL = nls_1.localize('welcomeOverlay', "User Interface Overview");
        WelcomeOverlayAction = __decorate([
            __param(2, instantiation_1.IInstantiationService)
        ], WelcomeOverlayAction);
        return WelcomeOverlayAction;
    }(actions_1.Action));
    exports.WelcomeOverlayAction = WelcomeOverlayAction;
    var HideWelcomeOverlayAction = /** @class */ (function (_super) {
        __extends(HideWelcomeOverlayAction, _super);
        function HideWelcomeOverlayAction(id, label) {
            return _super.call(this, id, label) || this;
        }
        HideWelcomeOverlayAction.prototype.run = function () {
            if (welcomeOverlay) {
                welcomeOverlay.hide();
            }
            return null;
        };
        HideWelcomeOverlayAction.ID = 'workbench.action.hideInterfaceOverview';
        HideWelcomeOverlayAction.LABEL = nls_1.localize('hideWelcomeOverlay', "Hide Interface Overview");
        return HideWelcomeOverlayAction;
    }(actions_1.Action));
    exports.HideWelcomeOverlayAction = HideWelcomeOverlayAction;
    var WelcomeOverlay = /** @class */ (function () {
        function WelcomeOverlay(partService, editorService, commandService, _contextKeyService, keybindingService) {
            this.partService = partService;
            this.editorService = editorService;
            this.commandService = commandService;
            this._contextKeyService = _contextKeyService;
            this.keybindingService = keybindingService;
            this._toDispose = [];
            this._overlayVisible = OVERLAY_VISIBLE.bindTo(this._contextKeyService);
            this.create();
        }
        WelcomeOverlay.prototype.create = function () {
            var _this = this;
            var container = this.partService.getContainer(partService_1.Parts.EDITOR_PART);
            var offset = this.partService.getTitleBarOffset();
            this._overlay = builder_1.$(container.parentElement)
                .div({ 'class': 'welcomeOverlay' })
                .style({ top: offset + "px" })
                .style({ height: "calc(100% - " + offset + "px)" })
                .display('none');
            this._overlay.on('click', function () { return _this.hide(); }, this._toDispose);
            this.commandService.onWillExecuteCommand(function () { return _this.hide(); });
            builder_1.$(this._overlay).div({ 'class': 'commandPalettePlaceholder' });
            var editorOpen = !!this.editorService.getVisibleEditors().length;
            keys.filter(function (key) { return !('withEditor' in key) || key.withEditor === editorOpen; })
                .forEach(function (_a) {
                var id = _a.id, arrow = _a.arrow, label = _a.label, command = _a.command, arrowLast = _a.arrowLast;
                var div = builder_1.$(_this._overlay).div({ 'class': ['key', id] });
                if (!arrowLast) {
                    builder_1.$(div).span({ 'class': 'arrow' }).innerHtml(arrow);
                }
                builder_1.$(div).span({ 'class': 'label' }).text(label);
                if (command) {
                    var shortcut = _this.keybindingService.lookupKeybinding(command);
                    if (shortcut) {
                        builder_1.$(div).span({ 'class': 'shortcut' }).text(shortcut.getLabel());
                    }
                }
                if (arrowLast) {
                    builder_1.$(div).span({ 'class': 'arrow' }).innerHtml(arrow);
                }
            });
        };
        WelcomeOverlay.prototype.show = function () {
            if (this._overlay.style('display') !== 'block') {
                this._overlay.display('block');
                var workbench = document.querySelector('.monaco-workbench');
                dom.addClass(workbench, 'blur-background');
                this._overlayVisible.set(true);
                this.updateProblemsKey();
            }
        };
        WelcomeOverlay.prototype.updateProblemsKey = function () {
            var problems = document.querySelector('.task-statusbar-item');
            var key = this._overlay.getHTMLElement().querySelector('.key.problems');
            if (problems instanceof HTMLElement) {
                var target = problems.getBoundingClientRect();
                var bounds = this._overlay.getHTMLElement().getBoundingClientRect();
                var bottom = bounds.bottom - target.top + 3;
                var left = (target.left + target.right) / 2 - bounds.left;
                key.style.bottom = bottom + 'px';
                key.style.left = left + 'px';
            }
            else {
                key.style.bottom = null;
                key.style.left = null;
            }
        };
        WelcomeOverlay.prototype.hide = function () {
            if (this._overlay.style('display') !== 'none') {
                this._overlay.display('none');
                var workbench = document.querySelector('.monaco-workbench');
                dom.removeClass(workbench, 'blur-background');
                this._overlayVisible.reset();
            }
        };
        WelcomeOverlay.prototype.dispose = function () {
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        WelcomeOverlay = __decorate([
            __param(0, partService_1.IPartService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, commands_1.ICommandService),
            __param(3, contextkey_1.IContextKeyService),
            __param(4, keybinding_1.IKeybindingService)
        ], WelcomeOverlay);
        return WelcomeOverlay;
    }());
    platform_1.Registry.as(actions_2.Extensions.WorkbenchActions)
        .registerWorkbenchAction(new actions_3.SyncActionDescriptor(WelcomeOverlayAction, WelcomeOverlayAction.ID, WelcomeOverlayAction.LABEL), 'Help: User Interface Overview', nls_1.localize('help', "Help"));
    platform_1.Registry.as(actions_2.Extensions.WorkbenchActions)
        .registerWorkbenchAction(new actions_3.SyncActionDescriptor(HideWelcomeOverlayAction, HideWelcomeOverlayAction.ID, HideWelcomeOverlayAction.LABEL, { primary: 9 /* Escape */ }, OVERLAY_VISIBLE), 'Help: Hide Interface Overview', nls_1.localize('help', "Help"));
    // theming
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var key = theme.getColor(colorRegistry_1.foreground);
        if (key) {
            collector.addRule(".monaco-workbench > .welcomeOverlay > .key { color: " + key + "; }");
        }
        var backgroundColor = color_1.Color.fromHex(theme.type === 'light' ? '#FFFFFF85' : '#00000085');
        if (backgroundColor) {
            collector.addRule(".monaco-workbench > .welcomeOverlay { background: " + backgroundColor + "; }");
        }
        var shortcut = theme.getColor(colorRegistry_1.textPreformatForeground);
        if (shortcut) {
            collector.addRule(".monaco-workbench > .welcomeOverlay > .key > .shortcut { color: " + shortcut + "; }");
        }
    });
});
