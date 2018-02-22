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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/base/browser/dom", "vs/workbench/browser/parts/statusbar/statusbar", "vs/platform/registry/common/platform", "vs/workbench/parts/extensions/electron-browser/runtimeExtensionsEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/message/common/message"], function (require, exports, nls, event_1, instantiation_1, extensions_1, lifecycle_1, errors_1, dom_1, statusbar_1, platform_1, runtimeExtensionsEditor_1, editorService_1, message_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtensionHostProfileService = /** @class */ (function (_super) {
        __extends(ExtensionHostProfileService, _super);
        function ExtensionHostProfileService(_extensionService, _editorService, _instantiationService, _messageService) {
            var _this = _super.call(this) || this;
            _this._extensionService = _extensionService;
            _this._editorService = _editorService;
            _this._instantiationService = _instantiationService;
            _this._messageService = _messageService;
            _this._onDidChangeState = _this._register(new event_1.Emitter());
            _this.onDidChangeState = _this._onDidChangeState.event;
            _this._onDidChangeLastProfile = _this._register(new event_1.Emitter());
            _this.onDidChangeLastProfile = _this._onDidChangeLastProfile.event;
            _this._profile = null;
            _this._profileSession = null;
            _this._setState(0 /* None */);
            return _this;
        }
        Object.defineProperty(ExtensionHostProfileService.prototype, "state", {
            get: function () { return this._state; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionHostProfileService.prototype, "lastProfile", {
            get: function () { return this._profile; },
            enumerable: true,
            configurable: true
        });
        ExtensionHostProfileService.prototype._setState = function (state) {
            var _this = this;
            if (this._state === state) {
                return;
            }
            this._state = state;
            if (this._state === 2 /* Running */) {
                ProfileExtHostStatusbarItem.instance.show(function () {
                    _this.stopProfiling();
                    _this._editorService.openEditor(_this._instantiationService.createInstance(runtimeExtensionsEditor_1.RuntimeExtensionsInput), { revealIfOpened: true });
                });
            }
            else if (this._state === 3 /* Stopping */) {
                ProfileExtHostStatusbarItem.instance.hide();
            }
            this._onDidChangeState.fire(void 0);
        };
        ExtensionHostProfileService.prototype.startProfiling = function () {
            var _this = this;
            if (this._state !== 0 /* None */) {
                return;
            }
            if (!this._extensionService.canProfileExtensionHost()) {
                this._messageService.show(message_1.Severity.Info, nls.localize('noPro', "To profile extensions, launch with `--inspect-extensions=<port>`."));
                return;
            }
            this._setState(1 /* Starting */);
            this._extensionService.startExtensionHostProfile().then(function (value) {
                _this._profileSession = value;
                _this._setState(2 /* Running */);
            }, function (err) {
                errors_1.onUnexpectedError(err);
                _this._setState(0 /* None */);
            });
        };
        ExtensionHostProfileService.prototype.stopProfiling = function () {
            var _this = this;
            if (this._state !== 2 /* Running */) {
                return;
            }
            this._setState(3 /* Stopping */);
            this._profileSession.stop().then(function (result) {
                _this._setLastProfile(result);
                _this._setState(0 /* None */);
            }, function (err) {
                errors_1.onUnexpectedError(err);
                _this._setState(0 /* None */);
            });
            this._profileSession = null;
        };
        ExtensionHostProfileService.prototype._setLastProfile = function (profile) {
            this._profile = profile;
            this._onDidChangeLastProfile.fire(void 0);
        };
        ExtensionHostProfileService.prototype.getLastProfile = function () {
            return this._profile;
        };
        ExtensionHostProfileService.prototype.clearLastProfile = function () {
            this._setLastProfile(null);
        };
        ExtensionHostProfileService = __decorate([
            __param(0, extensions_1.IExtensionService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, message_1.IMessageService)
        ], ExtensionHostProfileService);
        return ExtensionHostProfileService;
    }(lifecycle_1.Disposable));
    exports.ExtensionHostProfileService = ExtensionHostProfileService;
    var ProfileExtHostStatusbarItem = /** @class */ (function () {
        function ProfileExtHostStatusbarItem() {
            ProfileExtHostStatusbarItem.instance = this;
            this.toDispose = [];
            this.timeStarted = 0;
        }
        ProfileExtHostStatusbarItem.prototype.show = function (clickHandler) {
            var _this = this;
            this.clickHandler = clickHandler;
            if (this.timeStarted === 0) {
                this.timeStarted = new Date().getTime();
                this.statusBarItem.hidden = false;
                this.labelUpdater = setInterval(function () {
                    _this.updateLabel();
                }, 1000);
                this.updateLabel();
            }
        };
        ProfileExtHostStatusbarItem.prototype.hide = function () {
            this.clickHandler = null;
            this.statusBarItem.hidden = true;
            this.timeStarted = 0;
            clearInterval(this.labelUpdater);
            this.labelUpdater = null;
        };
        ProfileExtHostStatusbarItem.prototype.render = function (container) {
            var _this = this;
            if (!this.statusBarItem && container) {
                this.statusBarItem = dom_1.append(container, dom_1.$('.profileExtHost-statusbar-item'));
                this.toDispose.push(dom_1.addDisposableListener(this.statusBarItem, 'click', function () {
                    if (_this.clickHandler) {
                        _this.clickHandler();
                    }
                }));
                this.statusBarItem.title = nls.localize('selectAndStartDebug', "Click to stop profiling.");
                var a = dom_1.append(this.statusBarItem, dom_1.$('a'));
                dom_1.append(a, dom_1.$('.icon'));
                this.label = dom_1.append(a, dom_1.$('span.label'));
                this.updateLabel();
                this.statusBarItem.hidden = true;
            }
            return this;
        };
        ProfileExtHostStatusbarItem.prototype.updateLabel = function () {
            var label = 'Profiling Extension Host';
            if (this.timeStarted > 0) {
                var secondsRecoreded = (new Date().getTime() - this.timeStarted) / 1000;
                label = "Profiling Extension Host (" + Math.round(secondsRecoreded) + " sec)";
            }
            this.label.textContent = label;
        };
        ProfileExtHostStatusbarItem.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        return ProfileExtHostStatusbarItem;
    }());
    exports.ProfileExtHostStatusbarItem = ProfileExtHostStatusbarItem;
    platform_1.Registry.as(statusbar_1.Extensions.Statusbar).registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(ProfileExtHostStatusbarItem, statusbar_1.StatusbarAlignment.RIGHT));
});
