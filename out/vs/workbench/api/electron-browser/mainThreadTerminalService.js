var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/parts/terminal/common/terminal", "vs/base/common/winjs.base", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, lifecycle_1, terminal_1, winjs_base_1, extHost_protocol_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadTerminalService = /** @class */ (function () {
        function MainThreadTerminalService(extHostContext, terminalService) {
            var _this = this;
            this.terminalService = terminalService;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTerminalService);
            this._toDispose = [];
            this._toDispose.push(terminalService.onInstanceDisposed(function (terminalInstance) { return _this._onTerminalDisposed(terminalInstance); }));
            this._toDispose.push(terminalService.onInstanceProcessIdReady(function (terminalInstance) { return _this._onTerminalProcessIdReady(terminalInstance); }));
        }
        MainThreadTerminalService.prototype.dispose = function () {
            this._toDispose = lifecycle_1.dispose(this._toDispose);
            // TODO@Daniel: Should all the previously created terminals be disposed
            // when the extension host process goes down ?
        };
        MainThreadTerminalService.prototype.$createTerminal = function (name, shellPath, shellArgs, cwd, env, waitOnExit) {
            var shellLaunchConfig = {
                name: name,
                executable: shellPath,
                args: shellArgs,
                cwd: cwd,
                waitOnExit: waitOnExit,
                ignoreConfigurationCwd: true,
                env: env
            };
            return winjs_base_1.TPromise.as(this.terminalService.createInstance(shellLaunchConfig).id);
        };
        MainThreadTerminalService.prototype.$show = function (terminalId, preserveFocus) {
            var terminalInstance = this.terminalService.getInstanceFromId(terminalId);
            if (terminalInstance) {
                this.terminalService.setActiveInstance(terminalInstance);
                this.terminalService.showPanel(!preserveFocus);
            }
        };
        MainThreadTerminalService.prototype.$hide = function (terminalId) {
            if (this.terminalService.getActiveInstance().id === terminalId) {
                this.terminalService.hidePanel();
            }
        };
        MainThreadTerminalService.prototype.$dispose = function (terminalId) {
            var terminalInstance = this.terminalService.getInstanceFromId(terminalId);
            if (terminalInstance) {
                terminalInstance.dispose();
            }
        };
        MainThreadTerminalService.prototype.$sendText = function (terminalId, text, addNewLine) {
            var terminalInstance = this.terminalService.getInstanceFromId(terminalId);
            if (terminalInstance) {
                terminalInstance.sendText(text, addNewLine);
            }
        };
        MainThreadTerminalService.prototype._onTerminalDisposed = function (terminalInstance) {
            this._proxy.$acceptTerminalClosed(terminalInstance.id);
        };
        MainThreadTerminalService.prototype._onTerminalProcessIdReady = function (terminalInstance) {
            this._proxy.$acceptTerminalProcessId(terminalInstance.id, terminalInstance.processId);
        };
        MainThreadTerminalService = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadTerminalService),
            __param(1, terminal_1.ITerminalService)
        ], MainThreadTerminalService);
        return MainThreadTerminalService;
    }());
    exports.MainThreadTerminalService = MainThreadTerminalService;
});
