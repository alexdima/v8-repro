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
define(["require", "exports", "vs/base/common/objects", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "electron", "vs/base/common/async"], function (require, exports, objects_1, decorators_1, lifecycle_1, winjs_base_1, electron_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SharedProcess = /** @class */ (function () {
        function SharedProcess(environmentService, machineId, userEnv, logService) {
            this.environmentService = environmentService;
            this.machineId = machineId;
            this.userEnv = userEnv;
            this.logService = logService;
            this.barrier = new async_1.Barrier();
            this.disposables = [];
        }
        Object.defineProperty(SharedProcess.prototype, "_whenReady", {
            get: function () {
                var _this = this;
                this.window = new electron_1.BrowserWindow({
                    show: false,
                    webPreferences: {
                        images: false,
                        webaudio: false,
                        webgl: false
                    }
                });
                var config = objects_1.assign({
                    appRoot: this.environmentService.appRoot,
                    machineId: this.machineId,
                    nodeCachedDataDir: this.environmentService.nodeCachedDataDir,
                    userEnv: this.userEnv
                });
                var url = require.toUrl('vs/code/electron-browser/sharedProcess/sharedProcess.html') + "?config=" + encodeURIComponent(JSON.stringify(config));
                this.window.loadURL(url);
                // Prevent the window from dying
                var onClose = function (e) {
                    if (_this.window.isVisible()) {
                        e.preventDefault();
                        _this.window.hide();
                    }
                };
                this.window.on('close', onClose);
                this.disposables.push(lifecycle_1.toDisposable(function () { return _this.window.removeListener('close', onClose); }));
                this.disposables.push(lifecycle_1.toDisposable(function () {
                    // Electron seems to crash on Windows without this setTimeout :|
                    setTimeout(function () {
                        try {
                            _this.window.close();
                        }
                        catch (err) {
                            // ignore, as electron is already shutting down
                        }
                        _this.window = null;
                    }, 0);
                }));
                return new winjs_base_1.TPromise(function (c, e) {
                    electron_1.ipcMain.once('handshake:hello', function (_a) {
                        var sender = _a.sender;
                        sender.send('handshake:hey there', {
                            sharedIPCHandle: _this.environmentService.sharedIPCHandle,
                            args: _this.environmentService.args,
                            logLevel: _this.logService.getLevel()
                        });
                        electron_1.ipcMain.once('handshake:im ready', function () { return c(null); });
                    });
                });
            },
            enumerable: true,
            configurable: true
        });
        SharedProcess.prototype.spawn = function () {
            this.barrier.open();
        };
        SharedProcess.prototype.whenReady = function () {
            var _this = this;
            return this.barrier.wait().then(function () { return _this._whenReady; });
        };
        SharedProcess.prototype.toggle = function () {
            if (this.window.isVisible()) {
                this.hide();
            }
            else {
                this.show();
            }
        };
        SharedProcess.prototype.show = function () {
            this.window.show();
            this.window.webContents.openDevTools();
        };
        SharedProcess.prototype.hide = function () {
            this.window.webContents.closeDevTools();
            this.window.hide();
        };
        SharedProcess.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        __decorate([
            decorators_1.memoize
        ], SharedProcess.prototype, "_whenReady", null);
        return SharedProcess;
    }());
    exports.SharedProcess = SharedProcess;
});
