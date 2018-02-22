var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/severity", "vs/base/common/errorMessage", "vs/platform/lifecycle/common/lifecycle", "vs/platform/message/common/message", "vs/platform/storage/common/storage", "electron", "vs/base/common/event", "vs/platform/windows/common/windows", "vs/base/common/performance", "vs/base/common/async", "vs/platform/log/common/log"], function (require, exports, severity_1, errorMessage_1, lifecycle_1, message_1, storage_1, electron_1, event_1, windows_1, performance_1, async_1, log_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var LifecycleService = /** @class */ (function () {
        function LifecycleService(_messageService, _windowService, _storageService, _logService) {
            this._messageService = _messageService;
            this._windowService = _windowService;
            this._storageService = _storageService;
            this._logService = _logService;
            this._onWillShutdown = new event_1.Emitter();
            this._onShutdown = new event_1.Emitter();
            this._phase = lifecycle_1.LifecyclePhase.Starting;
            this._phaseWhen = new Map();
            var lastShutdownReason = this._storageService.getInteger(LifecycleService._lastShutdownReasonKey, storage_1.StorageScope.WORKSPACE);
            this._storageService.remove(LifecycleService._lastShutdownReasonKey, storage_1.StorageScope.WORKSPACE);
            if (lastShutdownReason === lifecycle_1.ShutdownReason.RELOAD) {
                this._startupKind = lifecycle_1.StartupKind.ReloadedWindow;
            }
            else if (lastShutdownReason === lifecycle_1.ShutdownReason.LOAD) {
                this._startupKind = lifecycle_1.StartupKind.ReopenedWindow;
            }
            else {
                this._startupKind = lifecycle_1.StartupKind.NewWindow;
            }
            this._logService.trace("lifecycle: starting up (startup kind: " + this._startupKind + ")");
            this._registerListeners();
        }
        LifecycleService.prototype._registerListeners = function () {
            var _this = this;
            var windowId = this._windowService.getCurrentWindowId();
            // Main side indicates that window is about to unload, check for vetos
            electron_1.ipcRenderer.on('vscode:onBeforeUnload', function (event, reply) {
                _this._logService.trace("lifecycle: onBeforeUnload (reason: " + reply.reason + ")");
                // store shutdown reason to retrieve next startup
                _this._storageService.store(LifecycleService._lastShutdownReasonKey, JSON.stringify(reply.reason), storage_1.StorageScope.WORKSPACE);
                // trigger onWillShutdown events and veto collecting
                _this.onBeforeUnload(reply.reason).done(function (veto) {
                    if (veto) {
                        _this._logService.trace('lifecycle: onBeforeUnload prevented via veto');
                        _this._storageService.remove(LifecycleService._lastShutdownReasonKey, storage_1.StorageScope.WORKSPACE);
                        electron_1.ipcRenderer.send(reply.cancelChannel, windowId);
                    }
                    else {
                        _this._logService.trace('lifecycle: onBeforeUnload continues without veto');
                        electron_1.ipcRenderer.send(reply.okChannel, windowId);
                    }
                });
            });
            // Main side indicates that we will indeed shutdown
            electron_1.ipcRenderer.on('vscode:onWillUnload', function (event, reply) {
                _this._logService.trace("lifecycle: onWillUnload (reason: " + reply.reason + ")");
                _this._onShutdown.fire(reply.reason);
                electron_1.ipcRenderer.send(reply.replyChannel, windowId);
            });
        };
        LifecycleService.prototype.onBeforeUnload = function (reason) {
            var _this = this;
            var vetos = [];
            this._onWillShutdown.fire({
                veto: function (value) {
                    vetos.push(value);
                },
                reason: reason
            });
            return lifecycle_1.handleVetos(vetos, function (err) { return _this._messageService.show(severity_1.default.Error, errorMessage_1.toErrorMessage(err)); });
        };
        Object.defineProperty(LifecycleService.prototype, "phase", {
            get: function () {
                return this._phase;
            },
            set: function (value) {
                if (value < this.phase) {
                    throw new Error('Lifecycle cannot go backwards');
                }
                if (this._phase === value) {
                    return;
                }
                this._logService.trace("lifecycle: phase changed (value: " + value + ")");
                this._phase = value;
                performance_1.mark("LifecyclePhase/" + lifecycle_1.LifecyclePhase[value]);
                if (this._phaseWhen.has(this._phase)) {
                    this._phaseWhen.get(this._phase).open();
                    this._phaseWhen.delete(this._phase);
                }
            },
            enumerable: true,
            configurable: true
        });
        LifecycleService.prototype.when = function (phase) {
            if (phase <= this._phase) {
                return Promise.resolve();
            }
            var barrier = this._phaseWhen.get(phase);
            if (!barrier) {
                barrier = new async_1.Barrier();
                this._phaseWhen.set(phase, barrier);
            }
            return barrier.wait();
        };
        Object.defineProperty(LifecycleService.prototype, "startupKind", {
            get: function () {
                return this._startupKind;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LifecycleService.prototype, "onWillShutdown", {
            get: function () {
                return this._onWillShutdown.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LifecycleService.prototype, "onShutdown", {
            get: function () {
                return this._onShutdown.event;
            },
            enumerable: true,
            configurable: true
        });
        LifecycleService._lastShutdownReasonKey = 'lifecyle.lastShutdownReason';
        LifecycleService = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, windows_1.IWindowService),
            __param(2, storage_1.IStorageService),
            __param(3, log_1.ILogService)
        ], LifecycleService);
        return LifecycleService;
    }());
    exports.LifecycleService = LifecycleService;
});
