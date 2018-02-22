var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/async", "vs/platform/quickOpen/common/quickOpen", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, winjs_base_1, async_1, quickOpen_1, extHost_protocol_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadQuickOpen = /** @class */ (function () {
        function MainThreadQuickOpen(extHostContext, quickOpenService) {
            this._token = 0;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostQuickOpen);
            this._quickOpenService = quickOpenService;
        }
        MainThreadQuickOpen.prototype.dispose = function () {
        };
        MainThreadQuickOpen.prototype.$show = function (options) {
            var _this = this;
            var myToken = ++this._token;
            this._contents = new winjs_base_1.TPromise(function (c, e) {
                _this._doSetItems = function (items) {
                    if (myToken === _this._token) {
                        c(items);
                    }
                };
                _this._doSetError = function (error) {
                    if (myToken === _this._token) {
                        e(error);
                    }
                };
            });
            return async_1.asWinJsPromise(function (token) { return _this._quickOpenService.pick(_this._contents, options, token); }).then(function (item) {
                if (item) {
                    return item.handle;
                }
                return undefined;
            }, undefined, function (progress) {
                if (progress) {
                    _this._proxy.$onItemSelected(progress.handle);
                }
            });
        };
        MainThreadQuickOpen.prototype.$setItems = function (items) {
            if (this._doSetItems) {
                this._doSetItems(items);
            }
            return undefined;
        };
        MainThreadQuickOpen.prototype.$setError = function (error) {
            if (this._doSetError) {
                this._doSetError(error);
            }
            return undefined;
        };
        // ---- input
        MainThreadQuickOpen.prototype.$input = function (options, validateInput) {
            var _this = this;
            var inputOptions = Object.create(null);
            if (options) {
                inputOptions.password = options.password;
                inputOptions.placeHolder = options.placeHolder;
                inputOptions.valueSelection = options.valueSelection;
                inputOptions.prompt = options.prompt;
                inputOptions.value = options.value;
                inputOptions.ignoreFocusLost = options.ignoreFocusOut;
            }
            if (validateInput) {
                inputOptions.validateInput = function (value) {
                    return _this._proxy.$validateInput(value);
                };
            }
            return async_1.asWinJsPromise(function (token) { return _this._quickOpenService.input(inputOptions, token); });
        };
        MainThreadQuickOpen = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadQuickOpen),
            __param(1, quickOpen_1.IQuickOpenService)
        ], MainThreadQuickOpen);
        return MainThreadQuickOpen;
    }());
    exports.MainThreadQuickOpen = MainThreadQuickOpen;
});
