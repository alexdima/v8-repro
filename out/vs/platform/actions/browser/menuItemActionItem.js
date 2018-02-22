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
define(["require", "exports", "vs/nls", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/platform/message/common/message", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/event", "vs/base/common/event", "vs/platform/contextview/browser/contextView", "vs/base/common/decorators", "vs/base/common/idGenerator", "vs/base/browser/dom", "vs/base/common/uri"], function (require, exports, nls_1, keybinding_1, actions_1, message_1, severity_1, lifecycle_1, actionbar_1, event_1, event_2, contextView_1, decorators_1, idGenerator_1, dom_1, uri_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var AltKeyEmitter = /** @class */ (function (_super) {
        __extends(AltKeyEmitter, _super);
        function AltKeyEmitter(contextMenuService) {
            var _this = _super.call(this) || this;
            _this._subscriptions = [];
            _this._subscriptions.push(event_1.domEvent(document.body, 'keydown')(function (e) { return _this.isPressed = e.altKey; }));
            _this._subscriptions.push(event_1.domEvent(document.body, 'keyup')(function (e) { return _this.isPressed = false; }));
            _this._subscriptions.push(event_1.domEvent(document.body, 'mouseleave')(function (e) { return _this.isPressed = false; }));
            _this._subscriptions.push(event_1.domEvent(document.body, 'blur')(function (e) { return _this.isPressed = false; }));
            // Workaround since we do not get any events while a context menu is shown
            _this._subscriptions.push(contextMenuService.onDidContextMenu(function () { return _this.isPressed = false; }));
            return _this;
        }
        Object.defineProperty(AltKeyEmitter.prototype, "isPressed", {
            get: function () {
                return this._isPressed;
            },
            set: function (value) {
                this._isPressed = value;
                this.fire(this._isPressed);
            },
            enumerable: true,
            configurable: true
        });
        AltKeyEmitter.getInstance = function (contextMenuService) {
            return new AltKeyEmitter(contextMenuService);
        };
        AltKeyEmitter.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._subscriptions = lifecycle_1.dispose(this._subscriptions);
        };
        __decorate([
            decorators_1.memoize
        ], AltKeyEmitter, "getInstance", null);
        return AltKeyEmitter;
    }(event_2.Emitter));
    function fillInActions(menu, options, target, contextMenuService, isPrimaryGroup) {
        if (isPrimaryGroup === void 0) { isPrimaryGroup = function (group) { return group === 'navigation'; }; }
        var groups = menu.getActions(options);
        if (groups.length === 0) {
            return;
        }
        var altKey = AltKeyEmitter.getInstance(contextMenuService);
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var tuple = groups_1[_i];
            var group = tuple[0], actions = tuple[1];
            if (altKey.isPressed) {
                actions = actions.map(function (a) { return !!a.alt ? a.alt : a; });
            }
            if (isPrimaryGroup(group)) {
                var head = Array.isArray(target) ? target : target.primary;
                // split contributed actions at the point where order
                // changes form lt zero to gte
                var pivot = 0;
                for (; pivot < actions.length; pivot++) {
                    if (actions[pivot].order >= 0) {
                        break;
                    }
                }
                // prepend contributed actions with order lte zero
                head.unshift.apply(head, actions.slice(0, pivot));
                // find the first separator which marks the end of the
                // navigation group - might be the whole array length
                var sep = 0;
                while (sep < head.length) {
                    if (head[sep] instanceof actionbar_1.Separator) {
                        break;
                    }
                    sep++;
                }
                // append contributed actions with order gt zero
                head.splice.apply(head, [sep, 0].concat(actions.slice(pivot)));
            }
            else {
                var to = Array.isArray(target) ? target : target.secondary;
                if (to.length > 0) {
                    to.push(new actionbar_1.Separator());
                }
                to.push.apply(to, actions);
            }
        }
    }
    exports.fillInActions = fillInActions;
    function createActionItem(action, keybindingService, messageService, contextMenuService) {
        if (action instanceof actions_1.MenuItemAction) {
            return new MenuItemActionItem(action, keybindingService, messageService, contextMenuService);
        }
        return undefined;
    }
    exports.createActionItem = createActionItem;
    var ids = new idGenerator_1.IdGenerator('menu-item-action-item-icon-');
    var MenuItemActionItem = /** @class */ (function (_super) {
        __extends(MenuItemActionItem, _super);
        function MenuItemActionItem(_action, _keybindingService, _messageService, _contextMenuService) {
            var _this = _super.call(this, undefined, _action, { icon: !!(_action.class || _action.item.iconPath), label: !_action.class && !_action.item.iconPath }) || this;
            _this._action = _action;
            _this._keybindingService = _keybindingService;
            _this._messageService = _messageService;
            _this._contextMenuService = _contextMenuService;
            _this._wantsAltCommand = false;
            return _this;
        }
        Object.defineProperty(MenuItemActionItem.prototype, "_commandAction", {
            get: function () {
                return this._wantsAltCommand && this._action.alt || this._action;
            },
            enumerable: true,
            configurable: true
        });
        MenuItemActionItem.prototype.onClick = function (event) {
            var _this = this;
            event.preventDefault();
            event.stopPropagation();
            this.actionRunner.run(this._commandAction)
                .done(undefined, function (err) { return _this._messageService.show(severity_1.default.Error, err); });
        };
        MenuItemActionItem.prototype.render = function (container) {
            var _this = this;
            _super.prototype.render.call(this, container);
            this._updateItemClass(this._action.item);
            var mouseOver = false;
            var altDown = false;
            var updateAltState = function () {
                var wantsAltCommand = mouseOver && altDown;
                if (wantsAltCommand !== _this._wantsAltCommand) {
                    _this._wantsAltCommand = wantsAltCommand;
                    _this._updateLabel();
                    _this._updateTooltip();
                    _this._updateClass();
                }
            };
            this._callOnDispose.push(AltKeyEmitter.getInstance(this._contextMenuService).event(function (value) {
                altDown = value;
                updateAltState();
            }));
            this._callOnDispose.push(event_1.domEvent(container, 'mouseleave')(function (_) {
                mouseOver = false;
                updateAltState();
            }));
            this._callOnDispose.push(event_1.domEvent(container, 'mouseenter')(function (e) {
                mouseOver = true;
                updateAltState();
            }));
        };
        MenuItemActionItem.prototype._updateLabel = function () {
            if (this.options.label) {
                this.$e.text(this._commandAction.label);
            }
        };
        MenuItemActionItem.prototype._updateTooltip = function () {
            var element = this.$e.getHTMLElement();
            var keybinding = this._keybindingService.lookupKeybinding(this._commandAction.id);
            var keybindingLabel = keybinding && keybinding.getLabel();
            element.title = keybindingLabel
                ? nls_1.localize('titleAndKb', "{0} ({1})", this._commandAction.label, keybindingLabel)
                : this._commandAction.label;
        };
        MenuItemActionItem.prototype._updateClass = function () {
            if (this.options.icon) {
                if (this._commandAction !== this._action) {
                    this._updateItemClass(this._action.alt.item);
                }
                else if (this._action.alt) {
                    this._updateItemClass(this._action.item);
                }
            }
        };
        MenuItemActionItem.prototype._updateItemClass = function (item) {
            var _this = this;
            lifecycle_1.dispose(this._itemClassDispose);
            this._itemClassDispose = undefined;
            if (item.iconPath) {
                var iconClass_1;
                if (MenuItemActionItem.ICON_PATH_TO_CSS_RULES.has(item.iconPath.dark)) {
                    iconClass_1 = MenuItemActionItem.ICON_PATH_TO_CSS_RULES.get(item.iconPath.dark);
                }
                else {
                    iconClass_1 = ids.nextId();
                    dom_1.createCSSRule(".icon." + iconClass_1, "background-image: url(\"" + uri_1.default.file(item.iconPath.light || item.iconPath.dark).toString() + "\")");
                    dom_1.createCSSRule(".vs-dark .icon." + iconClass_1 + ", .hc-black .icon." + iconClass_1, "background-image: url(\"" + uri_1.default.file(item.iconPath.dark).toString() + "\")");
                    MenuItemActionItem.ICON_PATH_TO_CSS_RULES.set(item.iconPath.dark, iconClass_1);
                }
                this.$e.getHTMLElement().classList.add('icon', iconClass_1);
                this._itemClassDispose = { dispose: function () { return _this.$e.getHTMLElement().classList.remove('icon', iconClass_1); } };
            }
        };
        MenuItemActionItem.prototype.dispose = function () {
            if (this._itemClassDispose) {
                lifecycle_1.dispose(this._itemClassDispose);
                this._itemClassDispose = undefined;
            }
            _super.prototype.dispose.call(this);
        };
        MenuItemActionItem.ICON_PATH_TO_CSS_RULES = new Map();
        MenuItemActionItem = __decorate([
            __param(1, keybinding_1.IKeybindingService),
            __param(2, message_1.IMessageService),
            __param(3, contextView_1.IContextMenuService)
        ], MenuItemActionItem);
        return MenuItemActionItem;
    }(actionbar_1.ActionItem));
    exports.MenuItemActionItem = MenuItemActionItem;
    // Need to subclass MenuItemActionItem in order to respect
    // the action context coming from any action bar, without breaking
    // existing users
    var ContextAwareMenuItemActionItem = /** @class */ (function (_super) {
        __extends(ContextAwareMenuItemActionItem, _super);
        function ContextAwareMenuItemActionItem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ContextAwareMenuItemActionItem.prototype.onClick = function (event) {
            var _this = this;
            event.preventDefault();
            event.stopPropagation();
            this.actionRunner.run(this._commandAction, this._context)
                .done(undefined, function (err) { return _this._messageService.show(severity_1.default.Error, err); });
        };
        return ContextAwareMenuItemActionItem;
    }(MenuItemActionItem));
    exports.ContextAwareMenuItemActionItem = ContextAwareMenuItemActionItem;
});
