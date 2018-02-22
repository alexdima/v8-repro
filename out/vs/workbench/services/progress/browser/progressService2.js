var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/common/lifecycle", "vs/platform/progress/common/progress", "vs/workbench/services/viewlet/browser/viewlet", "vs/base/browser/ui/octiconLabel/octiconLabel", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/statusbar/statusbar", "vs/base/common/winjs.base", "vs/base/common/async", "vs/workbench/services/activity/common/activity", "vs/css!./media/progressService2"], function (require, exports, dom, nls_1, lifecycle_1, progress_1, viewlet_1, octiconLabel_1, platform_1, statusbar_1, winjs_base_1, async_1, activity_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindowProgressItem = /** @class */ (function () {
        function WindowProgressItem() {
            WindowProgressItem.Instance = this;
        }
        WindowProgressItem.prototype.render = function (element) {
            this._element = element;
            this._label = new octiconLabel_1.OcticonLabel(this._element);
            this._element.classList.add('progress');
            this.hide();
            return null;
        };
        Object.defineProperty(WindowProgressItem.prototype, "text", {
            set: function (value) {
                this._label.text = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WindowProgressItem.prototype, "title", {
            set: function (value) {
                this._label.title = value;
            },
            enumerable: true,
            configurable: true
        });
        WindowProgressItem.prototype.hide = function () {
            dom.hide(this._element);
        };
        WindowProgressItem.prototype.show = function () {
            dom.show(this._element);
        };
        return WindowProgressItem;
    }());
    var ProgressService2 = /** @class */ (function () {
        function ProgressService2(_activityBar, _viewletService) {
            this._activityBar = _activityBar;
            this._viewletService = _viewletService;
            this._stack = [];
            //
        }
        ProgressService2.prototype.withProgress = function (options, task) {
            var location = options.location;
            switch (location) {
                case progress_1.ProgressLocation.Window:
                    return this._withWindowProgress(options, task);
                case progress_1.ProgressLocation.Explorer:
                    return this._withViewletProgress('workbench.view.explorer', task);
                case progress_1.ProgressLocation.Scm:
                    return this._withViewletProgress('workbench.view.scm', task);
                case progress_1.ProgressLocation.Extensions:
                    return this._withViewletProgress('workbench.view.extensions', task);
                default:
                    console.warn("Bad progress location: " + location);
                    return undefined;
            }
        };
        ProgressService2.prototype._withWindowProgress = function (options, callback) {
            var _this = this;
            var task = [options, new progress_1.Progress(function () { return _this._updateWindowProgress(); })];
            var promise = callback(task[1]);
            var delayHandle = setTimeout(function () {
                delayHandle = undefined;
                _this._stack.unshift(task);
                _this._updateWindowProgress();
                // show progress for at least 150ms
                async_1.always(winjs_base_1.TPromise.join([
                    winjs_base_1.TPromise.timeout(150),
                    promise
                ]), function () {
                    var idx = _this._stack.indexOf(task);
                    _this._stack.splice(idx, 1);
                    _this._updateWindowProgress();
                });
            }, 150);
            // cancel delay if promise finishes below 150ms
            async_1.always(winjs_base_1.TPromise.wrap(promise), function () { return clearTimeout(delayHandle); });
            return promise;
        };
        ProgressService2.prototype._updateWindowProgress = function (idx) {
            if (idx === void 0) { idx = 0; }
            if (idx >= this._stack.length) {
                WindowProgressItem.Instance.hide();
            }
            else {
                var _a = this._stack[idx], options = _a[0], progress = _a[1];
                var text = options.title;
                if (progress.value && progress.value.message) {
                    text = progress.value.message;
                }
                if (!text) {
                    // no message -> no progress. try with next on stack
                    this._updateWindowProgress(idx + 1);
                    return;
                }
                var title = text;
                if (options.title && options.title !== title) {
                    title = nls_1.localize('progress.subtitle', "{0} - {1}", options.title, title);
                }
                if (options.tooltip) {
                    title = nls_1.localize('progress.title', "{0}: {1}", options.tooltip, title);
                }
                WindowProgressItem.Instance.text = text;
                WindowProgressItem.Instance.title = title;
                WindowProgressItem.Instance.show();
            }
        };
        ProgressService2.prototype._withViewletProgress = function (viewletId, task) {
            var _this = this;
            var promise = task(progress_1.emptyProgress);
            // show in viewlet
            var viewletProgress = this._viewletService.getProgressIndicator(viewletId);
            if (viewletProgress) {
                viewletProgress.showWhile(winjs_base_1.TPromise.wrap(promise));
            }
            // show activity bar
            var activityProgress;
            var delayHandle = setTimeout(function () {
                delayHandle = undefined;
                var handle = _this._activityBar.showActivity(viewletId, new activity_1.ProgressBadge(function () { return ''; }), 'progress-badge', 100);
                var startTimeVisible = Date.now();
                var minTimeVisible = 300;
                activityProgress = {
                    dispose: function () {
                        var d = Date.now() - startTimeVisible;
                        if (d < minTimeVisible) {
                            // should at least show for Nms
                            setTimeout(function () { return handle.dispose(); }, minTimeVisible - d);
                        }
                        else {
                            // shown long enough
                            handle.dispose();
                        }
                    }
                };
            }, 300);
            var onDone = function () {
                clearTimeout(delayHandle);
                lifecycle_1.dispose(activityProgress);
            };
            promise.then(onDone, onDone);
            return promise;
        };
        ProgressService2 = __decorate([
            __param(0, activity_1.IActivityService),
            __param(1, viewlet_1.IViewletService)
        ], ProgressService2);
        return ProgressService2;
    }());
    exports.ProgressService2 = ProgressService2;
    platform_1.Registry.as(statusbar_1.Extensions.Statusbar).registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(WindowProgressItem, statusbar_1.StatusbarAlignment.LEFT));
});
