var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/windows/common/windows", "../node/extHost.protocol", "vs/base/common/lifecycle", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, windows_1, extHost_protocol_1, lifecycle_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadWindow = /** @class */ (function () {
        function MainThreadWindow(extHostContext, windowService) {
            this.windowService = windowService;
            this.disposables = [];
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostWindow);
            windowService.onDidChangeFocus(this.proxy.$onDidChangeWindowFocus, this.proxy, this.disposables);
        }
        MainThreadWindow.prototype.$getWindowVisibility = function () {
            return this.windowService.isFocused();
        };
        MainThreadWindow.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        MainThreadWindow = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadWindow),
            __param(1, windows_1.IWindowService)
        ], MainThreadWindow);
        return MainThreadWindow;
    }());
    exports.MainThreadWindow = MainThreadWindow;
});
