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
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/event", "vs/workbench/browser/parts/compositebar/compositeBarActions", "vs/base/common/winjs.base"], function (require, exports, nls, errors_1, dom, arrays, lifecycle_1, storage_1, instantiation_1, actionbar_1, event_1, compositeBarActions_1, winjs_base_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var CompositeBar = /** @class */ (function () {
        function CompositeBar(options, instantiationService, storageService) {
            this.options = options;
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.toDispose = [];
            this.compositeIdToActionItems = Object.create(null);
            this.compositeIdToActions = Object.create(null);
            this.compositeIdToActivityStack = Object.create(null);
            this.compositeSizeInBar = new Map();
            this._onDidContextMenu = new event_1.Emitter();
            var pinnedComposites = JSON.parse(this.storageService.get(this.options.storageId, storage_1.StorageScope.GLOBAL, null));
            if (pinnedComposites) {
                var compositeIds_1 = this.options.composites.map(function (c) { return c.id; });
                this.pinnedComposites = pinnedComposites.filter(function (pcid) { return compositeIds_1.indexOf(pcid) >= 0; });
            }
            else {
                this.pinnedComposites = this.options.composites.map(function (c) { return c.id; });
            }
        }
        Object.defineProperty(CompositeBar.prototype, "onDidContextMenu", {
            get: function () {
                return this._onDidContextMenu.event;
            },
            enumerable: true,
            configurable: true
        });
        CompositeBar.prototype.activateComposite = function (id) {
            if (this.compositeIdToActions[id]) {
                if (this.compositeIdToActions[this.activeCompositeId]) {
                    this.compositeIdToActions[this.activeCompositeId].deactivate();
                }
                this.compositeIdToActions[id].activate();
            }
            this.activeCompositeId = id;
            var activeUnpinnedCompositeShouldClose = this.activeUnpinnedCompositeId && this.activeUnpinnedCompositeId !== id;
            var activeUnpinnedCompositeShouldShow = !this.pinnedComposites.some(function (pid) { return pid === id; });
            if (activeUnpinnedCompositeShouldShow || activeUnpinnedCompositeShouldClose) {
                this.updateCompositeSwitcher();
            }
        };
        CompositeBar.prototype.deactivateComposite = function (id) {
            if (this.compositeIdToActions[id]) {
                this.compositeIdToActions[id].deactivate();
            }
        };
        CompositeBar.prototype.showActivity = function (compositeId, badge, clazz, priority) {
            var _this = this;
            if (!badge) {
                throw errors_1.illegalArgument('badge');
            }
            if (typeof priority !== 'number') {
                priority = 0;
            }
            var activity = { badge: badge, clazz: clazz, priority: priority };
            var stack = this.compositeIdToActivityStack[compositeId] || (this.compositeIdToActivityStack[compositeId] = []);
            for (var i = 0; i <= stack.length; i++) {
                if (i === stack.length) {
                    stack.push(activity);
                    break;
                }
                else if (stack[i].priority <= priority) {
                    stack.splice(i, 0, activity);
                    break;
                }
            }
            this.updateActivity(compositeId);
            return {
                dispose: function () {
                    var stack = _this.compositeIdToActivityStack[compositeId];
                    if (!stack) {
                        return;
                    }
                    var idx = stack.indexOf(activity);
                    if (idx < 0) {
                        return;
                    }
                    stack.splice(idx, 1);
                    if (stack.length === 0) {
                        delete _this.compositeIdToActivityStack[compositeId];
                    }
                    _this.updateActivity(compositeId);
                }
            };
        };
        CompositeBar.prototype.updateActivity = function (compositeId) {
            var action = this.compositeIdToActions[compositeId];
            if (!action) {
                return;
            }
            var stack = this.compositeIdToActivityStack[compositeId];
            // reset
            if (!stack || !stack.length) {
                action.setBadge(undefined);
            }
            else {
                var _a = stack[0], badge = _a.badge, clazz = _a.clazz;
                action.setBadge(badge);
                if (clazz) {
                    action.class = clazz;
                }
            }
        };
        CompositeBar.prototype.create = function (parent) {
            var _this = this;
            var actionBarDiv = parent.appendChild(dom.$('.composite-bar'));
            this.compositeSwitcherBar = new actionbar_1.ActionBar(actionBarDiv, {
                actionItemProvider: function (action) { return action instanceof compositeBarActions_1.CompositeOverflowActivityAction ? _this.compositeOverflowActionItem : _this.compositeIdToActionItems[action.id]; },
                orientation: this.options.orientation,
                ariaLabel: nls.localize('activityBarAriaLabel', "Active View Switcher"),
                animated: false,
            });
            // Contextmenu for composites
            this.toDispose.push(dom.addDisposableListener(parent, dom.EventType.CONTEXT_MENU, function (e) {
                dom.EventHelper.stop(e, true);
                _this._onDidContextMenu.fire(e);
            }));
            // Allow to drop at the end to move composites to the end
            this.toDispose.push(dom.addDisposableListener(parent, dom.EventType.DROP, function (e) {
                var draggedCompositeId = compositeBarActions_1.CompositeActionItem.getDraggedCompositeId();
                if (draggedCompositeId) {
                    dom.EventHelper.stop(e, true);
                    compositeBarActions_1.CompositeActionItem.clearDraggedComposite();
                    var targetId = _this.pinnedComposites[_this.pinnedComposites.length - 1];
                    if (targetId !== draggedCompositeId) {
                        _this.move(draggedCompositeId, _this.pinnedComposites[_this.pinnedComposites.length - 1]);
                    }
                }
            }));
            return actionBarDiv;
        };
        CompositeBar.prototype.getAction = function (compositeId) {
            return this.compositeIdToActions[compositeId];
        };
        CompositeBar.prototype.updateCompositeSwitcher = function () {
            var _this = this;
            if (!this.compositeSwitcherBar || !this.dimension) {
                return; // We have not been rendered yet so there is nothing to update.
            }
            var compositesToShow = this.pinnedComposites.slice(0); // never modify original array
            // Always show the active composite even if it is marked to be hidden
            if (this.activeCompositeId && !compositesToShow.some(function (id) { return id === _this.activeCompositeId; })) {
                this.activeUnpinnedCompositeId = this.activeCompositeId;
                compositesToShow = compositesToShow.concat(this.activeUnpinnedCompositeId);
            }
            else {
                this.activeUnpinnedCompositeId = void 0;
            }
            // Ensure we are not showing more composites than we have height for
            var overflows = false;
            var maxVisible = compositesToShow.length;
            var size = 0;
            var limit = this.options.orientation === actionbar_1.ActionsOrientation.VERTICAL ? this.dimension.height : this.dimension.width;
            for (var i = 0; i < compositesToShow.length && size <= limit; i++) {
                size += this.compositeSizeInBar.get(compositesToShow[i]);
                if (size > limit) {
                    maxVisible = i;
                }
            }
            overflows = compositesToShow.length > maxVisible;
            if (overflows) {
                size -= this.compositeSizeInBar.get(compositesToShow[maxVisible]);
                compositesToShow = compositesToShow.slice(0, maxVisible);
                size += this.options.overflowActionSize;
            }
            // Check if we need to make extra room for the overflow action
            if (size > limit) {
                size -= this.compositeSizeInBar.get(compositesToShow.pop());
            }
            // We always try show the active composite
            if (this.activeCompositeId && compositesToShow.length && compositesToShow.indexOf(this.activeCompositeId) === -1) {
                var removedComposite = compositesToShow.pop();
                size = size - this.compositeSizeInBar.get(removedComposite) + this.compositeSizeInBar.get(this.activeCompositeId);
                compositesToShow.push(this.activeCompositeId);
            }
            // The active composite might have bigger size than the removed composite, check for overflow again
            if (size > limit) {
                compositesToShow.length ? compositesToShow.splice(compositesToShow.length - 2, 1) : compositesToShow.pop();
            }
            var visibleComposites = Object.keys(this.compositeIdToActions);
            var visibleCompositesChange = !arrays.equals(compositesToShow, visibleComposites);
            // Pull out overflow action if there is a composite change so that we can add it to the end later
            if (this.compositeOverflowAction && visibleCompositesChange) {
                this.compositeSwitcherBar.pull(this.compositeSwitcherBar.length() - 1);
                this.compositeOverflowAction.dispose();
                this.compositeOverflowAction = null;
                this.compositeOverflowActionItem.dispose();
                this.compositeOverflowActionItem = null;
            }
            // Pull out composites that overflow, got hidden or changed position
            visibleComposites.forEach(function (compositeId, index) {
                if (compositesToShow.indexOf(compositeId) !== index) {
                    _this.pullComposite(compositeId);
                }
            });
            // Built actions for composites to show
            var newCompositesToShow = compositesToShow
                .filter(function (compositeId) { return !_this.compositeIdToActions[compositeId]; })
                .map(function (compositeId) { return _this.toAction(compositeId); });
            // Update when we have new composites to show
            if (newCompositesToShow.length) {
                // Add to composite switcher
                this.compositeSwitcherBar.push(newCompositesToShow, { label: true, icon: this.options.icon });
                // Make sure to activate the active one
                if (this.activeCompositeId) {
                    var activeCompositeEntry = this.compositeIdToActions[this.activeCompositeId];
                    if (activeCompositeEntry) {
                        activeCompositeEntry.activate();
                    }
                }
                // Make sure to restore activity
                Object.keys(this.compositeIdToActions).forEach(function (compositeId) {
                    _this.updateActivity(compositeId);
                });
            }
            // Add overflow action as needed
            if ((visibleCompositesChange && overflows) || this.compositeSwitcherBar.length() === 0) {
                this.compositeOverflowAction = this.instantiationService.createInstance(compositeBarActions_1.CompositeOverflowActivityAction, function () { return _this.compositeOverflowActionItem.showMenu(); });
                this.compositeOverflowActionItem = this.instantiationService.createInstance(compositeBarActions_1.CompositeOverflowActivityActionItem, this.compositeOverflowAction, function () { return _this.getOverflowingComposites(); }, function () { return _this.activeCompositeId; }, function (compositeId) { return _this.compositeIdToActivityStack[compositeId] && _this.compositeIdToActivityStack[compositeId][0].badge; }, this.options.getOnCompositeClickAction, this.options.colors);
                this.compositeSwitcherBar.push(this.compositeOverflowAction, { label: false, icon: true });
            }
        };
        CompositeBar.prototype.getOverflowingComposites = function () {
            var overflowingIds = this.pinnedComposites;
            if (this.activeUnpinnedCompositeId) {
                overflowingIds = overflowingIds.concat(this.activeUnpinnedCompositeId);
            }
            var visibleComposites = Object.keys(this.compositeIdToActions);
            overflowingIds = overflowingIds.filter(function (compositeId) { return visibleComposites.indexOf(compositeId) === -1; });
            return this.options.composites.filter(function (c) { return overflowingIds.indexOf(c.id) !== -1; });
        };
        CompositeBar.prototype.getVisibleComposites = function () {
            return Object.keys(this.compositeIdToActions);
        };
        CompositeBar.prototype.pullComposite = function (compositeId) {
            var index = Object.keys(this.compositeIdToActions).indexOf(compositeId);
            if (index >= 0) {
                this.compositeSwitcherBar.pull(index);
                var action = this.compositeIdToActions[compositeId];
                action.dispose();
                delete this.compositeIdToActions[compositeId];
                var actionItem = this.compositeIdToActionItems[action.id];
                actionItem.dispose();
                delete this.compositeIdToActionItems[action.id];
            }
        };
        CompositeBar.prototype.toAction = function (compositeId) {
            if (this.compositeIdToActions[compositeId]) {
                return this.compositeIdToActions[compositeId];
            }
            var compositeActivityAction = this.options.getActivityAction(compositeId);
            var pinnedAction = this.options.getCompositePinnedAction(compositeId);
            this.compositeIdToActionItems[compositeId] = this.instantiationService.createInstance(compositeBarActions_1.CompositeActionItem, compositeActivityAction, pinnedAction, this.options.colors, this.options.icon, this);
            this.compositeIdToActions[compositeId] = compositeActivityAction;
            return compositeActivityAction;
        };
        CompositeBar.prototype.unpin = function (compositeId) {
            var _this = this;
            if (!this.isPinned(compositeId)) {
                return;
            }
            var defaultCompositeId = this.options.getDefaultCompositeId();
            var visibleComposites = this.getVisibleComposites();
            var unpinPromise;
            // remove from pinned
            var index = this.pinnedComposites.indexOf(compositeId);
            this.pinnedComposites.splice(index, 1);
            // Case: composite is not the active one or the active one is a different one
            // Solv: we do nothing
            if (!this.activeCompositeId || this.activeCompositeId !== compositeId) {
                unpinPromise = winjs_base_1.TPromise.as(null);
            }
            else if (defaultCompositeId !== compositeId && this.isPinned(defaultCompositeId)) {
                unpinPromise = this.options.openComposite(defaultCompositeId);
            }
            else if (visibleComposites.length === 1) {
                unpinPromise = this.options.hidePart();
            }
            else {
                unpinPromise = this.options.openComposite(visibleComposites.filter(function (cid) { return cid !== compositeId; })[0]);
            }
            unpinPromise.then(function () {
                _this.updateCompositeSwitcher();
            });
            // Persist
            this.savePinnedComposites();
        };
        CompositeBar.prototype.isPinned = function (compositeId) {
            return this.pinnedComposites.indexOf(compositeId) >= 0;
        };
        CompositeBar.prototype.pin = function (compositeId, update) {
            var _this = this;
            if (update === void 0) { update = true; }
            if (this.isPinned(compositeId)) {
                return;
            }
            this.options.openComposite(compositeId).then(function () {
                _this.pinnedComposites.push(compositeId);
                _this.pinnedComposites = arrays.distinct(_this.pinnedComposites);
                if (update) {
                    _this.updateCompositeSwitcher();
                }
                // Persist
                _this.savePinnedComposites();
            });
        };
        CompositeBar.prototype.move = function (compositeId, toCompositeId) {
            var _this = this;
            // Make sure both composites are known to this composite bar
            if (this.options.composites.filter(function (c) { return c.id === compositeId || c.id === toCompositeId; }).length !== 2) {
                return;
            }
            // Make sure a moved composite gets pinned
            if (!this.isPinned(compositeId)) {
                this.pin(compositeId, false /* defer update, we take care of it */);
            }
            var fromIndex = this.pinnedComposites.indexOf(compositeId);
            var toIndex = this.pinnedComposites.indexOf(toCompositeId);
            this.pinnedComposites.splice(fromIndex, 1);
            this.pinnedComposites.splice(toIndex, 0, compositeId);
            // Clear composites that are impacted by the move
            var visibleComposites = Object.keys(this.compositeIdToActions);
            for (var i = Math.min(fromIndex, toIndex); i < visibleComposites.length; i++) {
                this.pullComposite(visibleComposites[i]);
            }
            // timeout helps to prevent artifacts from showing up
            setTimeout(function () {
                _this.updateCompositeSwitcher();
            }, 0);
            // Persist
            this.savePinnedComposites();
        };
        CompositeBar.prototype.layout = function (dimension) {
            var _this = this;
            this.dimension = dimension;
            if (dimension.height === 0 || dimension.width === 0) {
                // Do not layout if not visible. Otherwise the size measurment would be computed wrongly
                return;
            }
            if (this.compositeSizeInBar.size === 0) {
                // Compute size of each composite by getting the size from the css renderer
                // Size is later used for overflow computation
                this.compositeSwitcherBar.clear();
                this.compositeSwitcherBar.push(this.options.composites.map(function (c) { return _this.options.getActivityAction(c.id); }));
                this.options.composites.map(function (c, index) { return _this.compositeSizeInBar.set(c.id, _this.options.orientation === actionbar_1.ActionsOrientation.VERTICAL
                    ? _this.compositeSwitcherBar.getHeight(index)
                    : _this.compositeSwitcherBar.getWidth(index)); });
                this.compositeSwitcherBar.clear();
            }
            this.updateCompositeSwitcher();
        };
        CompositeBar.prototype.savePinnedComposites = function () {
            this.storageService.store(this.options.storageId, JSON.stringify(this.pinnedComposites), storage_1.StorageScope.GLOBAL);
        };
        CompositeBar.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        CompositeBar = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, storage_1.IStorageService)
        ], CompositeBar);
        return CompositeBar;
    }());
    exports.CompositeBar = CompositeBar;
});
