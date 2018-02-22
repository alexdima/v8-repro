var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/base/common/arrays", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers", "vs/platform/windows/common/windows", "vs/base/common/collections"], function (require, exports, uri_1, arrays_1, extHost_protocol_1, extHostCustomers_1, windows_1, collections_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadDialogs = /** @class */ (function () {
        function MainThreadDialogs(context, _windowService) {
            this._windowService = _windowService;
            //
        }
        MainThreadDialogs_1 = MainThreadDialogs;
        MainThreadDialogs.prototype.dispose = function () {
            //
        };
        MainThreadDialogs.prototype.$showOpenDialog = function (options) {
            var _this = this;
            // TODO@joh what about remote dev setup?
            if (options.defaultUri && options.defaultUri.scheme !== 'file') {
                return Promise.reject(new Error('Not supported - Open-dialogs can only be opened on `file`-uris.'));
            }
            return new Promise(function (resolve) {
                _this._windowService.showOpenDialog(MainThreadDialogs_1._convertOpenOptions(options)).then(function (filenames) { return resolve(arrays_1.isFalsyOrEmpty(filenames) ? undefined : filenames); });
            });
        };
        MainThreadDialogs.prototype.$showSaveDialog = function (options) {
            var _this = this;
            // TODO@joh what about remote dev setup?
            if (options.defaultUri && options.defaultUri.scheme !== 'file') {
                return Promise.reject(new Error('Not supported - Save-dialogs can only be opened on `file`-uris.'));
            }
            return new Promise(function (resolve) {
                _this._windowService.showSaveDialog(MainThreadDialogs_1._convertSaveOptions(options)).then(function (filename) { return resolve(!filename ? undefined : filename); });
            });
        };
        MainThreadDialogs._convertOpenOptions = function (options) {
            var result = {
                properties: ['createDirectory']
            };
            if (options.openLabel) {
                result.buttonLabel = options.openLabel;
            }
            if (options.defaultUri) {
                result.defaultPath = uri_1.default.revive(options.defaultUri).fsPath;
            }
            if (!options.canSelectFiles && !options.canSelectFolders) {
                options.canSelectFiles = true;
            }
            if (options.canSelectFiles) {
                result.properties.push('openFile');
            }
            if (options.canSelectFolders) {
                result.properties.push('openDirectory');
            }
            if (options.canSelectMany) {
                result.properties.push('multiSelections');
            }
            if (options.filters) {
                result.filters = [];
                collections_1.forEach(options.filters, function (entry) { return result.filters.push({ name: entry.key, extensions: entry.value }); });
            }
            return result;
        };
        MainThreadDialogs._convertSaveOptions = function (options) {
            var result = {};
            if (options.defaultUri) {
                result.defaultPath = uri_1.default.revive(options.defaultUri).fsPath;
            }
            if (options.saveLabel) {
                result.buttonLabel = options.saveLabel;
            }
            if (options.filters) {
                result.filters = [];
                collections_1.forEach(options.filters, function (entry) { return result.filters.push({ name: entry.key, extensions: entry.value }); });
            }
            return result;
        };
        MainThreadDialogs = MainThreadDialogs_1 = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadDialogs),
            __param(1, windows_1.IWindowService)
        ], MainThreadDialogs);
        return MainThreadDialogs;
        var MainThreadDialogs_1;
    }());
    exports.MainThreadDialogs = MainThreadDialogs;
});
