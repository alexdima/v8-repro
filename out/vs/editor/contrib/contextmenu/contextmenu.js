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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/editor/common/editorContextKeys", "vs/editor/browser/editorExtensions", "vs/editor/browser/editorBrowser"], function (require, exports, nls, lifecycle_1, winjs_base_1, dom, actionbar_1, contextView_1, keybinding_1, contextkey_1, actions_1, editorContextKeys_1, editorExtensions_1, editorBrowser_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContextMenuController = /** @class */ (function () {
        function ContextMenuController(editor, _contextMenuService, _contextViewService, _contextKeyService, _keybindingService, _menuService) {
            var _this = this;
            this._contextMenuService = _contextMenuService;
            this._contextViewService = _contextViewService;
            this._contextKeyService = _contextKeyService;
            this._keybindingService = _keybindingService;
            this._menuService = _menuService;
            this._toDispose = [];
            this._contextMenuIsBeingShownCount = 0;
            this._editor = editor;
            this._toDispose.push(this._editor.onContextMenu(function (e) { return _this._onContextMenu(e); }));
            this._toDispose.push(this._editor.onDidScrollChange(function (e) {
                if (_this._contextMenuIsBeingShownCount > 0) {
                    _this._contextViewService.hideContextView();
                }
            }));
            this._toDispose.push(this._editor.onKeyDown(function (e) {
                if (e.keyCode === 58 /* ContextMenu */) {
                    // Chrome is funny like that
                    e.preventDefault();
                    e.stopPropagation();
                    _this.showContextMenu();
                }
            }));
        }
        ContextMenuController.get = function (editor) {
            return editor.getContribution(ContextMenuController.ID);
        };
        ContextMenuController.prototype._onContextMenu = function (e) {
            if (!this._editor.getConfiguration().contribInfo.contextmenu) {
                this._editor.focus();
                // Ensure the cursor is at the position of the mouse click
                if (e.target.position && !this._editor.getSelection().containsPosition(e.target.position)) {
                    this._editor.setPosition(e.target.position);
                }
                return; // Context menu is turned off through configuration
            }
            if (e.target.type === editorBrowser_1.MouseTargetType.OVERLAY_WIDGET) {
                return; // allow native menu on widgets to support right click on input field for example in find
            }
            e.event.preventDefault();
            if (e.target.type !== editorBrowser_1.MouseTargetType.CONTENT_TEXT && e.target.type !== editorBrowser_1.MouseTargetType.CONTENT_EMPTY && e.target.type !== editorBrowser_1.MouseTargetType.TEXTAREA) {
                return; // only support mouse click into text or native context menu key for now
            }
            // Ensure the editor gets focus if it hasn't, so the right events are being sent to other contributions
            this._editor.focus();
            // Ensure the cursor is at the position of the mouse click
            if (e.target.position && !this._editor.getSelection().containsPosition(e.target.position)) {
                this._editor.setPosition(e.target.position);
            }
            // Unless the user triggerd the context menu through Shift+F10, use the mouse position as menu position
            var forcedPosition;
            if (e.target.type !== editorBrowser_1.MouseTargetType.TEXTAREA) {
                forcedPosition = { x: e.event.posx, y: e.event.posy + 1 };
            }
            // Show the context menu
            this.showContextMenu(forcedPosition);
        };
        ContextMenuController.prototype.showContextMenu = function (forcedPosition) {
            if (!this._editor.getConfiguration().contribInfo.contextmenu) {
                return; // Context menu is turned off through configuration
            }
            if (!this._contextMenuService) {
                this._editor.focus();
                return; // We need the context menu service to function
            }
            // Find actions available for menu
            var menuActions = this._getMenuActions();
            // Show menu if we have actions to show
            if (menuActions.length > 0) {
                this._doShowContextMenu(menuActions, forcedPosition);
            }
        };
        ContextMenuController.prototype._getMenuActions = function () {
            var result = [];
            var contextMenu = this._menuService.createMenu(actions_1.MenuId.EditorContext, this._contextKeyService);
            var groups = contextMenu.getActions({ arg: this._editor.getModel().uri });
            contextMenu.dispose();
            for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                var group = groups_1[_i];
                var actions = group[1];
                result.push.apply(result, actions);
                result.push(new actionbar_1.Separator());
            }
            result.pop(); // remove last separator
            return result;
        };
        ContextMenuController.prototype._doShowContextMenu = function (actions, forcedPosition) {
            var _this = this;
            if (forcedPosition === void 0) { forcedPosition = null; }
            // Disable hover
            var oldHoverSetting = this._editor.getConfiguration().contribInfo.hover;
            this._editor.updateOptions({
                hover: false
            });
            var menuPosition = forcedPosition;
            if (!menuPosition) {
                // Ensure selection is visible
                this._editor.revealPosition(this._editor.getPosition(), 1 /* Immediate */);
                this._editor.render();
                var cursorCoords = this._editor.getScrolledVisiblePosition(this._editor.getPosition());
                // Translate to absolute editor position
                var editorCoords = dom.getDomNodePagePosition(this._editor.getDomNode());
                var posx = editorCoords.left + cursorCoords.left;
                var posy = editorCoords.top + cursorCoords.top + cursorCoords.height;
                menuPosition = { x: posx, y: posy };
            }
            // Show menu
            this._contextMenuIsBeingShownCount++;
            this._contextMenuService.showContextMenu({
                getAnchor: function () { return menuPosition; },
                getActions: function () {
                    return winjs_base_1.TPromise.as(actions);
                },
                getActionItem: function (action) {
                    var keybinding = _this._keybindingFor(action);
                    if (keybinding) {
                        return new actionbar_1.ActionItem(action, action, { label: true, keybinding: keybinding.getLabel(), isMenu: true });
                    }
                    var customActionItem = action;
                    if (typeof customActionItem.getActionItem === 'function') {
                        return customActionItem.getActionItem();
                    }
                    return new actionbar_1.ActionItem(action, action, { icon: true, label: true, isMenu: true });
                },
                getKeyBinding: function (action) {
                    return _this._keybindingFor(action);
                },
                onHide: function (wasCancelled) {
                    _this._contextMenuIsBeingShownCount--;
                    _this._editor.focus();
                    _this._editor.updateOptions({
                        hover: oldHoverSetting
                    });
                }
            });
        };
        ContextMenuController.prototype._keybindingFor = function (action) {
            return this._keybindingService.lookupKeybinding(action.id);
        };
        ContextMenuController.prototype.getId = function () {
            return ContextMenuController.ID;
        };
        ContextMenuController.prototype.dispose = function () {
            if (this._contextMenuIsBeingShownCount > 0) {
                this._contextViewService.hideContextView();
            }
            this._toDispose = lifecycle_1.dispose(this._toDispose);
        };
        ContextMenuController.ID = 'editor.contrib.contextmenu';
        ContextMenuController = __decorate([
            __param(1, contextView_1.IContextMenuService),
            __param(2, contextView_1.IContextViewService),
            __param(3, contextkey_1.IContextKeyService),
            __param(4, keybinding_1.IKeybindingService),
            __param(5, actions_1.IMenuService)
        ], ContextMenuController);
        return ContextMenuController;
    }());
    exports.ContextMenuController = ContextMenuController;
    var ShowContextMenu = /** @class */ (function (_super) {
        __extends(ShowContextMenu, _super);
        function ShowContextMenu() {
            return _super.call(this, {
                id: 'editor.action.showContextMenu',
                label: nls.localize('action.showContextMenu.label', "Show Editor Context Menu"),
                alias: 'Show Editor Context Menu',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 1024 /* Shift */ | 68 /* F10 */
                }
            }) || this;
        }
        ShowContextMenu.prototype.run = function (accessor, editor) {
            var contribution = ContextMenuController.get(editor);
            contribution.showContextMenu();
        };
        return ShowContextMenu;
    }(editorExtensions_1.EditorAction));
    editorExtensions_1.registerEditorContribution(ContextMenuController);
    editorExtensions_1.registerEditorAction(ShowContextMenu);
});
