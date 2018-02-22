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
define(["require", "exports", "vs/nls", "vs/base/common/paths", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/parts/scm/common/scm", "vs/workbench/services/scm/common/scm", "vs/workbench/services/activity/common/activity", "vs/platform/contextkey/common/contextkey", "vs/platform/statusbar/common/statusbar"], function (require, exports, nls_1, paths_1, lifecycle_1, event_1, scm_1, scm_2, activity_1, contextkey_1, statusbar_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var StatusUpdater = /** @class */ (function () {
        function StatusUpdater(scmService, activityService) {
            this.scmService = scmService;
            this.activityService = activityService;
            this.badgeDisposable = lifecycle_1.empty;
            this.disposables = [];
            this.scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            this.render();
        }
        StatusUpdater.prototype.onDidAddRepository = function (repository) {
            var _this = this;
            var provider = repository.provider;
            var onDidChange = event_1.anyEvent(provider.onDidChange, provider.onDidChangeResources);
            var changeDisposable = onDidChange(function () { return _this.render(); });
            var onDidRemove = event_1.filterEvent(this.scmService.onDidRemoveRepository, function (e) { return e === repository; });
            var removeDisposable = onDidRemove(function () {
                disposable.dispose();
                _this.disposables = _this.disposables.filter(function (d) { return d !== removeDisposable; });
                _this.render();
            });
            var disposable = lifecycle_1.combinedDisposable([changeDisposable, removeDisposable]);
            this.disposables.push(disposable);
        };
        StatusUpdater.prototype.render = function () {
            this.badgeDisposable.dispose();
            var count = this.scmService.repositories.reduce(function (r, repository) {
                if (typeof repository.provider.count === 'number') {
                    return r + repository.provider.count;
                }
                else {
                    return r + repository.provider.groups.elements.reduce(function (r, g) { return r + g.elements.length; }, 0);
                }
            }, 0);
            if (count > 0) {
                var badge = new activity_1.NumberBadge(count, function (num) { return nls_1.localize('scmPendingChangesBadge', '{0} pending changes', num); });
                this.badgeDisposable = this.activityService.showActivity(scm_1.VIEWLET_ID, badge, 'scm-viewlet-label');
            }
            else {
                this.badgeDisposable = lifecycle_1.empty;
            }
        };
        StatusUpdater.prototype.dispose = function () {
            this.badgeDisposable.dispose();
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        StatusUpdater = __decorate([
            __param(0, scm_2.ISCMService),
            __param(1, activity_1.IActivityService)
        ], StatusUpdater);
        return StatusUpdater;
    }());
    exports.StatusUpdater = StatusUpdater;
    var StatusBarController = /** @class */ (function () {
        function StatusBarController(scmService, statusbarService, contextKeyService) {
            this.scmService = scmService;
            this.statusbarService = statusbarService;
            this.statusBarDisposable = lifecycle_1.empty;
            this.focusDisposable = lifecycle_1.empty;
            this.focusedRepository = undefined;
            this.disposables = [];
            this.focusedProviderContextKey = contextKeyService.createKey('scmProvider', void 0);
            this.scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            if (this.scmService.repositories.length > 0) {
                this.onDidFocusRepository(this.scmService.repositories[0]);
            }
        }
        StatusBarController.prototype.onDidAddRepository = function (repository) {
            var _this = this;
            var changeDisposable = repository.onDidFocus(function () { return _this.onDidFocusRepository(repository); });
            var onDidRemove = event_1.filterEvent(this.scmService.onDidRemoveRepository, function (e) { return e === repository; });
            var removeDisposable = onDidRemove(function () {
                disposable.dispose();
                _this.disposables = _this.disposables.filter(function (d) { return d !== removeDisposable; });
                if (_this.scmService.repositories.length === 0) {
                    _this.focusedProviderContextKey.set(undefined);
                }
                else if (_this.focusedRepository === repository) {
                    _this.scmService.repositories[0].focus();
                }
            });
            var disposable = lifecycle_1.combinedDisposable([changeDisposable, removeDisposable]);
            this.disposables.push(disposable);
            if (this.scmService.repositories.length === 1) {
                this.onDidFocusRepository(repository);
            }
        };
        StatusBarController.prototype.onDidFocusRepository = function (repository) {
            var _this = this;
            if (this.focusedRepository !== repository) {
                this.focusedRepository = repository;
                this.focusedProviderContextKey.set(repository.provider.id);
            }
            this.focusDisposable.dispose();
            this.focusDisposable = repository.provider.onDidChange(function () { return _this.render(repository); });
            this.render(repository);
        };
        StatusBarController.prototype.render = function (repository) {
            var _this = this;
            this.statusBarDisposable.dispose();
            var commands = repository.provider.statusBarCommands || [];
            var label = repository.provider.rootUri
                ? paths_1.basename(repository.provider.rootUri.fsPath) + " (" + repository.provider.label + ")"
                : repository.provider.label;
            var disposables = commands.map(function (c) { return _this.statusbarService.addEntry({
                text: c.title,
                tooltip: label + " - " + c.tooltip,
                command: c.id,
                arguments: c.arguments
            }, statusbar_1.StatusbarAlignment.LEFT, 10000); });
            this.statusBarDisposable = lifecycle_1.combinedDisposable(disposables);
        };
        StatusBarController.prototype.dispose = function () {
            this.focusDisposable.dispose();
            this.statusBarDisposable.dispose();
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        StatusBarController = __decorate([
            __param(0, scm_2.ISCMService),
            __param(1, statusbar_1.IStatusbarService),
            __param(2, contextkey_1.IContextKeyService)
        ], StatusBarController);
        return StatusBarController;
    }());
    exports.StatusBarController = StatusBarController;
});
