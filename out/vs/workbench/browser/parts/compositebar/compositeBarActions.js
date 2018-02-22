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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/winjs.base", "vs/base/browser/dom", "vs/base/browser/builder", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/commands/common/commands", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/workbench/services/activity/common/activity", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dnd", "vs/platform/keybinding/common/keybinding", "vs/base/common/event"], function (require, exports, nls, actions_1, winjs_base_1, dom, builder_1, actionbar_1, commands_1, lifecycle_1, contextView_1, themeService_1, activity_1, instantiation_1, colorRegistry_1, dnd_1, keybinding_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ActivityAction = /** @class */ (function (_super) {
        __extends(ActivityAction, _super);
        function ActivityAction(_activity) {
            var _this = _super.call(this, _activity.id, _activity.name, _activity.cssClass) || this;
            _this._activity = _activity;
            _this._onDidChangeBadge = new event_1.Emitter();
            _this.badge = null;
            return _this;
        }
        Object.defineProperty(ActivityAction.prototype, "activity", {
            get: function () {
                return this._activity;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivityAction.prototype, "onDidChangeBadge", {
            get: function () {
                return this._onDidChangeBadge.event;
            },
            enumerable: true,
            configurable: true
        });
        ActivityAction.prototype.activate = function () {
            if (!this.checked) {
                this._setChecked(true);
            }
        };
        ActivityAction.prototype.deactivate = function () {
            if (this.checked) {
                this._setChecked(false);
            }
        };
        ActivityAction.prototype.getBadge = function () {
            return this.badge;
        };
        ActivityAction.prototype.getClass = function () {
            return this.clazz;
        };
        ActivityAction.prototype.setBadge = function (badge, clazz) {
            this.badge = badge;
            this.clazz = clazz;
            this._onDidChangeBadge.fire(this);
        };
        return ActivityAction;
    }(actions_1.Action));
    exports.ActivityAction = ActivityAction;
    var ActivityActionItem = /** @class */ (function (_super) {
        __extends(ActivityActionItem, _super);
        function ActivityActionItem(action, options, themeService) {
            var _this = _super.call(this, null, action, options) || this;
            _this.themeService = themeService;
            _this.badgeDisposable = lifecycle_1.empty;
            _this.themeService.onThemeChange(_this.onThemeChange, _this, _this._callOnDispose);
            action.onDidChangeBadge(_this.handleBadgeChangeEvenet, _this, _this._callOnDispose);
            return _this;
        }
        Object.defineProperty(ActivityActionItem.prototype, "activity", {
            get: function () {
                return this._action.activity;
            },
            enumerable: true,
            configurable: true
        });
        ActivityActionItem.prototype.updateStyles = function () {
            var theme = this.themeService.getTheme();
            // Label
            if (this.$label && this.options.icon) {
                var background = theme.getColor(this.options.colors.backgroundColor);
                this.$label.style('background-color', background ? background.toString() : null);
            }
            // Badge
            if (this.$badgeContent) {
                var badgeForeground = theme.getColor(this.options.colors.badgeForeground);
                var badgeBackground = theme.getColor(this.options.colors.badgeBackground);
                var contrastBorderColor = theme.getColor(colorRegistry_1.contrastBorder);
                this.$badgeContent.style('color', badgeForeground ? badgeForeground.toString() : null);
                this.$badgeContent.style('background-color', badgeBackground ? badgeBackground.toString() : null);
                this.$badgeContent.style('border-style', contrastBorderColor ? 'solid' : null);
                this.$badgeContent.style('border-width', contrastBorderColor ? '1px' : null);
                this.$badgeContent.style('border-color', contrastBorderColor ? contrastBorderColor.toString() : null);
            }
        };
        ActivityActionItem.prototype.render = function (container) {
            var _this = this;
            _super.prototype.render.call(this, container);
            // Make the container tab-able for keyboard navigation
            this.$container = builder_1.$(container).attr({
                tabIndex: '0',
                role: 'button',
                title: this.activity.name
            });
            // Try hard to prevent keyboard only focus feedback when using mouse
            this.$container.on(dom.EventType.MOUSE_DOWN, function () {
                _this.$container.addClass('clicked');
            });
            this.$container.on(dom.EventType.MOUSE_UP, function () {
                if (_this.mouseUpTimeout) {
                    clearTimeout(_this.mouseUpTimeout);
                }
                _this.mouseUpTimeout = setTimeout(function () {
                    _this.$container.removeClass('clicked');
                }, 800); // delayed to prevent focus feedback from showing on mouse up
            });
            // Label
            this.$label = builder_1.$('a.action-label').appendTo(this.builder);
            if (this.activity.cssClass) {
                this.$label.addClass(this.activity.cssClass);
            }
            if (!this.options.icon) {
                this.$label.text(this.getAction().label);
            }
            this.$badge = this.builder.clone().div({ 'class': 'badge' }, function (badge) {
                _this.$badgeContent = badge.div({ 'class': 'badge-content' });
            });
            this.$badge.hide();
            this.updateStyles();
        };
        ActivityActionItem.prototype.onThemeChange = function (theme) {
            this.updateStyles();
        };
        ActivityActionItem.prototype.updateBadge = function (badge, clazz) {
            var _this = this;
            this.badgeDisposable.dispose();
            this.badgeDisposable = lifecycle_1.empty;
            this.$badgeContent.empty();
            this.$badge.hide();
            if (badge) {
                // Number
                if (badge instanceof activity_1.NumberBadge) {
                    if (badge.number) {
                        var number = badge.number.toString();
                        if (badge.number > 9999) {
                            number = nls.localize('largeNumberBadge', '10k+');
                        }
                        else if (badge.number > 999) {
                            number = number.charAt(0) + 'k';
                        }
                        this.$badgeContent.text(number);
                        this.$badge.show();
                    }
                }
                else if (badge instanceof activity_1.TextBadge) {
                    this.$badgeContent.text(badge.text);
                    this.$badge.show();
                }
                else if (badge instanceof activity_1.IconBadge) {
                    this.$badge.show();
                }
                else if (badge instanceof activity_1.ProgressBadge) {
                    this.$badge.show();
                }
                if (clazz) {
                    this.$badge.addClass(clazz);
                    this.badgeDisposable = lifecycle_1.toDisposable(function () { return _this.$badge.removeClass(clazz); });
                }
            }
            // Title
            var title;
            if (badge && badge.getDescription()) {
                if (this.activity.name) {
                    title = nls.localize('badgeTitle', "{0} - {1}", this.activity.name, badge.getDescription());
                }
                else {
                    title = badge.getDescription();
                }
            }
            else {
                title = this.activity.name;
            }
            [this.$label, this.$badge, this.$container].forEach(function (b) {
                if (b) {
                    b.attr('aria-label', title);
                    b.title(title);
                }
            });
        };
        ActivityActionItem.prototype.handleBadgeChangeEvenet = function () {
            var action = this.getAction();
            if (action instanceof ActivityAction) {
                this.updateBadge(action.getBadge(), action.getClass());
            }
        };
        ActivityActionItem.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.mouseUpTimeout) {
                clearTimeout(this.mouseUpTimeout);
            }
            this.$badge.destroy();
        };
        ActivityActionItem = __decorate([
            __param(2, themeService_1.IThemeService)
        ], ActivityActionItem);
        return ActivityActionItem;
    }(actionbar_1.BaseActionItem));
    exports.ActivityActionItem = ActivityActionItem;
    var CompositeOverflowActivityAction = /** @class */ (function (_super) {
        __extends(CompositeOverflowActivityAction, _super);
        function CompositeOverflowActivityAction(showMenu) {
            var _this = _super.call(this, {
                id: 'additionalComposites.action',
                name: nls.localize('additionalViews', "Additional Views"),
                cssClass: 'toggle-more'
            }) || this;
            _this.showMenu = showMenu;
            return _this;
        }
        CompositeOverflowActivityAction.prototype.run = function (event) {
            this.showMenu();
            return winjs_base_1.TPromise.as(true);
        };
        return CompositeOverflowActivityAction;
    }(ActivityAction));
    exports.CompositeOverflowActivityAction = CompositeOverflowActivityAction;
    var CompositeOverflowActivityActionItem = /** @class */ (function (_super) {
        __extends(CompositeOverflowActivityActionItem, _super);
        function CompositeOverflowActivityActionItem(action, getOverflowingComposites, getActiveCompositeId, getBadge, getCompositeOpenAction, colors, contextMenuService, themeService) {
            var _this = _super.call(this, action, { icon: true, colors: colors }, themeService) || this;
            _this.getOverflowingComposites = getOverflowingComposites;
            _this.getActiveCompositeId = getActiveCompositeId;
            _this.getBadge = getBadge;
            _this.getCompositeOpenAction = getCompositeOpenAction;
            _this.contextMenuService = contextMenuService;
            return _this;
        }
        CompositeOverflowActivityActionItem.prototype.showMenu = function () {
            var _this = this;
            if (this.actions) {
                lifecycle_1.dispose(this.actions);
            }
            this.actions = this.getActions();
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return _this.builder.getHTMLElement(); },
                getActions: function () { return winjs_base_1.TPromise.as(_this.actions); },
                onHide: function () { return lifecycle_1.dispose(_this.actions); }
            });
        };
        CompositeOverflowActivityActionItem.prototype.getActions = function () {
            var _this = this;
            return this.getOverflowingComposites().map(function (composite) {
                var action = _this.getCompositeOpenAction(composite.id);
                action.radio = _this.getActiveCompositeId() === action.id;
                var badge = _this.getBadge(composite.id);
                var suffix;
                if (badge instanceof activity_1.NumberBadge) {
                    suffix = badge.number;
                }
                else if (badge instanceof activity_1.TextBadge) {
                    suffix = badge.text;
                }
                if (suffix) {
                    action.label = nls.localize('numberBadge', "{0} ({1})", composite.name, suffix);
                }
                else {
                    action.label = composite.name;
                }
                return action;
            });
        };
        CompositeOverflowActivityActionItem.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.actions = lifecycle_1.dispose(this.actions);
        };
        CompositeOverflowActivityActionItem = __decorate([
            __param(6, contextView_1.IContextMenuService),
            __param(7, themeService_1.IThemeService)
        ], CompositeOverflowActivityActionItem);
        return CompositeOverflowActivityActionItem;
    }(ActivityActionItem));
    exports.CompositeOverflowActivityActionItem = CompositeOverflowActivityActionItem;
    var ManageExtensionAction = /** @class */ (function (_super) {
        __extends(ManageExtensionAction, _super);
        function ManageExtensionAction(commandService) {
            var _this = _super.call(this, 'activitybar.manage.extension', nls.localize('manageExtension', "Manage Extension")) || this;
            _this.commandService = commandService;
            return _this;
        }
        ManageExtensionAction.prototype.run = function (id) {
            return this.commandService.executeCommand('_extensions.manage', id);
        };
        ManageExtensionAction = __decorate([
            __param(0, commands_1.ICommandService)
        ], ManageExtensionAction);
        return ManageExtensionAction;
    }(actions_1.Action));
    var CompositeActionItem = /** @class */ (function (_super) {
        __extends(CompositeActionItem, _super);
        function CompositeActionItem(compositeActivityAction, toggleCompositePinnedAction, colors, icon, compositeBar, contextMenuService, keybindingService, instantiationService, themeService) {
            var _this = _super.call(this, compositeActivityAction, { draggable: true, colors: colors, icon: icon }, themeService) || this;
            _this.compositeActivityAction = compositeActivityAction;
            _this.toggleCompositePinnedAction = toggleCompositePinnedAction;
            _this.compositeBar = compositeBar;
            _this.contextMenuService = contextMenuService;
            _this.keybindingService = keybindingService;
            _this.cssClass = compositeActivityAction.class;
            if (!CompositeActionItem.manageExtensionAction) {
                CompositeActionItem.manageExtensionAction = instantiationService.createInstance(ManageExtensionAction);
            }
            return _this;
        }
        Object.defineProperty(CompositeActionItem.prototype, "activity", {
            get: function () {
                if (!this.compositeActivity) {
                    var activityName = void 0;
                    var keybinding = this.getKeybindingLabel(this.compositeActivityAction.activity.keybindingId);
                    if (keybinding) {
                        activityName = nls.localize('titleKeybinding', "{0} ({1})", this.compositeActivityAction.activity.name, keybinding);
                    }
                    else {
                        activityName = this.compositeActivityAction.activity.name;
                    }
                    this.compositeActivity = {
                        id: this.compositeActivityAction.activity.id,
                        cssClass: this.cssClass,
                        name: activityName
                    };
                }
                return this.compositeActivity;
            },
            enumerable: true,
            configurable: true
        });
        CompositeActionItem.prototype.getKeybindingLabel = function (id) {
            var kb = this.keybindingService.lookupKeybinding(id);
            if (kb) {
                return kb.getLabel();
            }
            return null;
        };
        CompositeActionItem.prototype.render = function (container) {
            var _this = this;
            _super.prototype.render.call(this, container);
            this.$container.on('contextmenu', function (e) {
                dom.EventHelper.stop(e, true);
                _this.showContextMenu(container);
            });
            // Allow to drag
            this.$container.on(dom.EventType.DRAG_START, function (e) {
                e.dataTransfer.effectAllowed = 'move';
                _this.setDraggedComposite(_this.activity.id);
                // Trigger the action even on drag start to prevent clicks from failing that started a drag
                if (!_this.getAction().checked) {
                    _this.getAction().run();
                }
            });
            // Drag enter
            var counter = 0; // see https://github.com/Microsoft/vscode/issues/14470
            this.$container.on(dom.EventType.DRAG_ENTER, function (e) {
                var draggedCompositeId = CompositeActionItem.getDraggedCompositeId();
                if (draggedCompositeId && draggedCompositeId !== _this.activity.id) {
                    counter++;
                    _this.updateFromDragging(container, true);
                }
            });
            // Drag leave
            this.$container.on(dom.EventType.DRAG_LEAVE, function (e) {
                var draggedCompositeId = CompositeActionItem.getDraggedCompositeId();
                if (draggedCompositeId) {
                    counter--;
                    if (counter === 0) {
                        _this.updateFromDragging(container, false);
                    }
                }
            });
            // Drag end
            this.$container.on(dom.EventType.DRAG_END, function (e) {
                var draggedCompositeId = CompositeActionItem.getDraggedCompositeId();
                if (draggedCompositeId) {
                    counter = 0;
                    _this.updateFromDragging(container, false);
                    CompositeActionItem.clearDraggedComposite();
                }
            });
            // Drop
            this.$container.on(dom.EventType.DROP, function (e) {
                dom.EventHelper.stop(e, true);
                var draggedCompositeId = CompositeActionItem.getDraggedCompositeId();
                if (draggedCompositeId && draggedCompositeId !== _this.activity.id) {
                    _this.updateFromDragging(container, false);
                    CompositeActionItem.clearDraggedComposite();
                    _this.compositeBar.move(draggedCompositeId, _this.activity.id);
                }
            });
            // Activate on drag over to reveal targets
            [this.$badge, this.$label].forEach(function (b) { return new dnd_1.DelayedDragHandler(b.getHTMLElement(), function () {
                if (!CompositeActionItem.getDraggedCompositeId() && !_this.getAction().checked) {
                    _this.getAction().run();
                }
            }); });
            this.updateStyles();
        };
        CompositeActionItem.prototype.updateFromDragging = function (element, isDragging) {
            var theme = this.themeService.getTheme();
            var dragBackground = theme.getColor(this.options.colors.dragAndDropBackground);
            element.style.backgroundColor = isDragging && dragBackground ? dragBackground.toString() : null;
        };
        CompositeActionItem.getDraggedCompositeId = function () {
            return CompositeActionItem.draggedCompositeId;
        };
        CompositeActionItem.prototype.setDraggedComposite = function (compositeId) {
            CompositeActionItem.draggedCompositeId = compositeId;
        };
        CompositeActionItem.clearDraggedComposite = function () {
            CompositeActionItem.draggedCompositeId = void 0;
        };
        CompositeActionItem.prototype.showContextMenu = function (container) {
            var _this = this;
            var actions = [this.toggleCompositePinnedAction];
            if (this.compositeActivityAction.activity.extensionId) {
                actions.push(new actionbar_1.Separator());
                actions.push(CompositeActionItem.manageExtensionAction);
            }
            var isPinned = this.compositeBar.isPinned(this.activity.id);
            if (isPinned) {
                this.toggleCompositePinnedAction.label = nls.localize('hide', "Hide");
                this.toggleCompositePinnedAction.checked = false;
            }
            else {
                this.toggleCompositePinnedAction.label = nls.localize('keep', "Keep");
            }
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return container; },
                getActionsContext: function () { return _this.activity.id; },
                getActions: function () { return winjs_base_1.TPromise.as(actions); }
            });
        };
        CompositeActionItem.prototype.focus = function () {
            this.$container.domFocus();
        };
        CompositeActionItem.prototype._updateClass = function () {
            if (this.cssClass) {
                this.$badge.removeClass(this.cssClass);
            }
            this.cssClass = this.getAction().class;
            this.$badge.addClass(this.cssClass);
        };
        CompositeActionItem.prototype._updateChecked = function () {
            if (this.getAction().checked) {
                this.$container.addClass('checked');
            }
            else {
                this.$container.removeClass('checked');
            }
        };
        CompositeActionItem.prototype._updateEnabled = function () {
            if (this.getAction().enabled) {
                this.builder.removeClass('disabled');
            }
            else {
                this.builder.addClass('disabled');
            }
        };
        CompositeActionItem.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            CompositeActionItem.clearDraggedComposite();
            this.$label.destroy();
        };
        CompositeActionItem = __decorate([
            __param(5, contextView_1.IContextMenuService),
            __param(6, keybinding_1.IKeybindingService),
            __param(7, instantiation_1.IInstantiationService),
            __param(8, themeService_1.IThemeService)
        ], CompositeActionItem);
        return CompositeActionItem;
    }(ActivityActionItem));
    exports.CompositeActionItem = CompositeActionItem;
    var ToggleCompositePinnedAction = /** @class */ (function (_super) {
        __extends(ToggleCompositePinnedAction, _super);
        function ToggleCompositePinnedAction(activity, compositeBar) {
            var _this = _super.call(this, 'show.toggleCompositePinned', activity ? activity.name : nls.localize('toggle', "Toggle View Pinned")) || this;
            _this.activity = activity;
            _this.compositeBar = compositeBar;
            _this.checked = _this.activity && _this.compositeBar.isPinned(_this.activity.id);
            return _this;
        }
        ToggleCompositePinnedAction.prototype.run = function (context) {
            var id = this.activity ? this.activity.id : context;
            if (this.compositeBar.isPinned(id)) {
                this.compositeBar.unpin(id);
            }
            else {
                this.compositeBar.pin(id);
            }
            return winjs_base_1.TPromise.as(true);
        };
        return ToggleCompositePinnedAction;
    }(actions_1.Action));
    exports.ToggleCompositePinnedAction = ToggleCompositePinnedAction;
});
