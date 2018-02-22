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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/windows/electron-main/windows", "vs/base/common/event", "electron"], function (require, exports, nls_1, lifecycle_1, windows_1, event_1, electron_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProxyAuthHandler = /** @class */ (function () {
        function ProxyAuthHandler(windowsMainService) {
            this.windowsMainService = windowsMainService;
            this.retryCount = 0;
            this.disposables = [];
            var onLogin = event_1.fromNodeEventEmitter(electron_1.app, 'login', function (event, webContents, req, authInfo, cb) { return ({ event: event, webContents: webContents, req: req, authInfo: authInfo, cb: cb }); });
            onLogin(this.onLogin, this, this.disposables);
        }
        ProxyAuthHandler.prototype.onLogin = function (_a) {
            var event = _a.event, authInfo = _a.authInfo, cb = _a.cb;
            if (!authInfo.isProxy) {
                return;
            }
            if (this.retryCount++ > 1) {
                return;
            }
            event.preventDefault();
            var opts = {
                alwaysOnTop: true,
                skipTaskbar: true,
                resizable: false,
                width: 450,
                height: 220,
                show: true,
                title: 'VS Code'
            };
            var focusedWindow = this.windowsMainService.getFocusedWindow();
            if (focusedWindow) {
                opts.parent = focusedWindow.win;
                opts.modal = true;
            }
            var win = new electron_1.BrowserWindow(opts);
            var config = {};
            var baseUrl = require.toUrl('vs/code/electron-browser/proxy/auth.html');
            var url = baseUrl + "?config=" + encodeURIComponent(JSON.stringify(config));
            var proxyUrl = authInfo.host + ":" + authInfo.port;
            var title = nls_1.localize('authRequire', "Proxy Authentication Required");
            var message = nls_1.localize('proxyauth', "The proxy {0} requires authentication.", proxyUrl);
            var data = { title: title, message: message };
            var javascript = 'promptForCredentials(' + JSON.stringify(data) + ')';
            var onWindowClose = function () { return cb('', ''); };
            win.on('close', onWindowClose);
            win.setMenu(null);
            win.loadURL(url);
            win.webContents.executeJavaScript(javascript, true).then(function (_a) {
                var username = _a.username, password = _a.password;
                cb(username, password);
                win.removeListener('close', onWindowClose);
                win.close();
            });
        };
        ProxyAuthHandler.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        ProxyAuthHandler = __decorate([
            __param(0, windows_1.IWindowsMainService)
        ], ProxyAuthHandler);
        return ProxyAuthHandler;
    }());
    exports.ProxyAuthHandler = ProxyAuthHandler;
});
