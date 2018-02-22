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
define(["require", "exports", "electron", "vs/base/common/winjs.base", "vs/platform/log/common/log", "vs/platform/state/common/state", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/windows/common/windows", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, electron_1, winjs_base_1, log_1, state_1, event_1, instantiation_1, windows_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ILifecycleService = instantiation_1.createDecorator('lifecycleService');
    var UnloadReason;
    (function (UnloadReason) {
        UnloadReason[UnloadReason["CLOSE"] = 1] = "CLOSE";
        UnloadReason[UnloadReason["QUIT"] = 2] = "QUIT";
        UnloadReason[UnloadReason["RELOAD"] = 3] = "RELOAD";
        UnloadReason[UnloadReason["LOAD"] = 4] = "LOAD";
    })(UnloadReason = exports.UnloadReason || (exports.UnloadReason = {}));
    var LifecycleService = /** @class */ (function () {
        function LifecycleService(logService, stateService) {
            this.logService = logService;
            this.stateService = stateService;
            this._onBeforeQuit = new event_1.Emitter();
            this.onBeforeQuit = this._onBeforeQuit.event;
            this._onBeforeWindowClose = new event_1.Emitter();
            this.onBeforeWindowClose = this._onBeforeWindowClose.event;
            this._onBeforeWindowUnload = new event_1.Emitter();
            this.onBeforeWindowUnload = this._onBeforeWindowUnload.event;
            this.windowToCloseRequest = Object.create(null);
            this.quitRequested = false;
            this.oneTimeListenerTokenGenerator = 0;
            this._wasRestarted = false;
            this.handleRestarted();
        }
        LifecycleService.prototype.handleRestarted = function () {
            this._wasRestarted = !!this.stateService.getItem(LifecycleService.QUIT_FROM_RESTART_MARKER);
            if (this._wasRestarted) {
                this.stateService.removeItem(LifecycleService.QUIT_FROM_RESTART_MARKER); // remove the marker right after if found
            }
        };
        Object.defineProperty(LifecycleService.prototype, "wasRestarted", {
            get: function () {
                return this._wasRestarted;
            },
            enumerable: true,
            configurable: true
        });
        LifecycleService.prototype.ready = function () {
            this.registerListeners();
        };
        LifecycleService.prototype.registerListeners = function () {
            var _this = this;
            // before-quit
            electron_1.app.on('before-quit', function (e) {
                _this.logService.trace('Lifecycle#before-quit');
                if (!_this.quitRequested) {
                    _this._onBeforeQuit.fire(); // only send this if this is the first quit request we have
                }
                _this.quitRequested = true;
            });
            // window-all-closed
            electron_1.app.on('window-all-closed', function () {
                _this.logService.trace('Lifecycle#window-all-closed');
                // Windows/Linux: we quit when all windows have closed
                // Mac: we only quit when quit was requested
                if (_this.quitRequested || process.platform !== 'darwin') {
                    electron_1.app.quit();
                }
            });
        };
        LifecycleService.prototype.registerWindow = function (window) {
            var _this = this;
            // Window Before Closing: Main -> Renderer
            window.win.on('close', function (e) {
                var windowId = window.id;
                _this.logService.trace('Lifecycle#window-before-close', windowId);
                // The window already acknowledged to be closed
                if (_this.windowToCloseRequest[windowId]) {
                    _this.logService.trace('Lifecycle#window-close', windowId);
                    delete _this.windowToCloseRequest[windowId];
                    return;
                }
                // Otherwise prevent unload and handle it from window
                e.preventDefault();
                _this.unload(window, UnloadReason.CLOSE).done(function (veto) {
                    if (!veto) {
                        _this.windowToCloseRequest[windowId] = true;
                        _this._onBeforeWindowClose.fire(window);
                        window.close();
                    }
                    else {
                        _this.quitRequested = false;
                        delete _this.windowToCloseRequest[windowId];
                    }
                });
            });
        };
        LifecycleService.prototype.unload = function (window, reason) {
            var _this = this;
            // Always allow to unload a window that is not yet ready
            if (window.readyState !== windows_1.ReadyState.READY) {
                return winjs_base_1.TPromise.as(false);
            }
            this.logService.trace('Lifecycle#unload()', window.id);
            var windowUnloadReason = this.quitRequested ? UnloadReason.QUIT : reason;
            // first ask the window itself if it vetos the unload
            return this.onBeforeUnloadWindowInRenderer(window, windowUnloadReason).then(function (veto) {
                if (veto) {
                    _this.logService.trace('Lifecycle#unload(): veto in renderer', window.id);
                    return _this.handleVeto(veto);
                }
                // then check for vetos in the main side
                return _this.onBeforeUnloadWindowInMain(window, windowUnloadReason).then(function (veto) {
                    if (veto) {
                        _this.logService.trace('Lifecycle#unload(): veto in main', window.id);
                        return _this.handleVeto(veto);
                    }
                    else {
                        _this.logService.trace('Lifecycle#unload(): unload continues without veto', window.id);
                    }
                    // finally if there are no vetos, unload the renderer
                    return _this.onWillUnloadWindowInRenderer(window, windowUnloadReason).then(function () { return false; });
                });
            });
        };
        LifecycleService.prototype.handleVeto = function (veto) {
            // Any cancellation also cancels a pending quit if present
            if (veto && this.pendingQuitPromiseComplete) {
                this.pendingQuitPromiseComplete(true /* veto */);
                this.pendingQuitPromiseComplete = null;
                this.pendingQuitPromise = null;
            }
            return veto;
        };
        LifecycleService.prototype.onBeforeUnloadWindowInRenderer = function (window, reason) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c) {
                var oneTimeEventToken = _this.oneTimeListenerTokenGenerator++;
                var okChannel = "vscode:ok" + oneTimeEventToken;
                var cancelChannel = "vscode:cancel" + oneTimeEventToken;
                electron_1.ipcMain.once(okChannel, function () {
                    c(false); // no veto
                });
                electron_1.ipcMain.once(cancelChannel, function () {
                    c(true); // veto
                });
                window.send('vscode:onBeforeUnload', { okChannel: okChannel, cancelChannel: cancelChannel, reason: reason });
            });
        };
        LifecycleService.prototype.onBeforeUnloadWindowInMain = function (window, reason) {
            var _this = this;
            var vetos = [];
            this._onBeforeWindowUnload.fire({
                reason: reason,
                window: window,
                veto: function (value) {
                    vetos.push(value);
                }
            });
            return lifecycle_1.handleVetos(vetos, function (err) { return _this.logService.error(err); });
        };
        LifecycleService.prototype.onWillUnloadWindowInRenderer = function (window, reason) {
            var _this = this;
            return new winjs_base_1.TPromise(function (c) {
                var oneTimeEventToken = _this.oneTimeListenerTokenGenerator++;
                var replyChannel = "vscode:reply" + oneTimeEventToken;
                electron_1.ipcMain.once(replyChannel, function () { return c(void 0); });
                window.send('vscode:onWillUnload', { replyChannel: replyChannel, reason: reason });
            });
        };
        /**
         * A promise that completes to indicate if the quit request has been veto'd
         * by the user or not.
         */
        LifecycleService.prototype.quit = function (fromUpdate) {
            var _this = this;
            this.logService.trace('Lifecycle#quit()');
            if (!this.pendingQuitPromise) {
                this.pendingQuitPromise = new winjs_base_1.TPromise(function (c) {
                    // Store as field to access it from a window cancellation
                    _this.pendingQuitPromiseComplete = c;
                    electron_1.app.once('will-quit', function () {
                        if (_this.pendingQuitPromiseComplete) {
                            if (fromUpdate) {
                                _this.stateService.setItem(LifecycleService.QUIT_FROM_RESTART_MARKER, true);
                            }
                            _this.pendingQuitPromiseComplete(false /* no veto */);
                            _this.pendingQuitPromiseComplete = null;
                            _this.pendingQuitPromise = null;
                        }
                    });
                    electron_1.app.quit();
                });
            }
            return this.pendingQuitPromise;
        };
        LifecycleService.prototype.kill = function (code) {
            this.logService.trace('Lifecycle#kill()');
            electron_1.app.exit(code);
        };
        LifecycleService.prototype.relaunch = function (options) {
            var _this = this;
            this.logService.trace('Lifecycle#relaunch()');
            var args = process.argv.slice(1);
            if (options && options.addArgs) {
                args.push.apply(args, options.addArgs);
            }
            if (options && options.removeArgs) {
                for (var _i = 0, _a = options.removeArgs; _i < _a.length; _i++) {
                    var a = _a[_i];
                    var idx = args.indexOf(a);
                    if (idx >= 0) {
                        args.splice(idx, 1);
                    }
                }
            }
            var vetoed = false;
            electron_1.app.once('quit', function () {
                if (!vetoed) {
                    _this.stateService.setItem(LifecycleService.QUIT_FROM_RESTART_MARKER, true);
                    electron_1.app.relaunch({ args: args });
                }
            });
            this.quit().then(function (veto) {
                vetoed = veto;
            });
        };
        LifecycleService.prototype.isQuitRequested = function () {
            return !!this.quitRequested;
        };
        LifecycleService.QUIT_FROM_RESTART_MARKER = 'quit.from.restart'; // use a marker to find out if the session was restarted
        LifecycleService = __decorate([
            __param(0, log_1.ILogService),
            __param(1, state_1.IStateService)
        ], LifecycleService);
        return LifecycleService;
    }());
    exports.LifecycleService = LifecycleService;
});
