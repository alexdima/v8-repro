var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/objects", "vs/base/node/request", "vs/base/node/proxy", "vs/platform/configuration/common/configuration", "../../log/common/log"], function (require, exports, winjs_base_1, objects_1, request_1, proxy_1, configuration_1, log_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This service exposes the `request` API, while using the global
     * or configured proxy settings.
     */
    var RequestService = /** @class */ (function () {
        function RequestService(configurationService, logService) {
            var _this = this;
            this.logService = logService;
            this.disposables = [];
            this.configure(configurationService.getValue());
            configurationService.onDidChangeConfiguration(function () { return _this.configure(configurationService.getValue()); }, this, this.disposables);
        }
        RequestService.prototype.configure = function (config) {
            this.proxyUrl = config.http && config.http.proxy;
            this.strictSSL = config.http && config.http.proxyStrictSSL;
            this.authorization = config.http && config.http.proxyAuthorization;
        };
        RequestService.prototype.request = function (options, requestFn) {
            if (requestFn === void 0) { requestFn = request_1.request; }
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _a, proxyUrl, strictSSL, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            this.logService.trace('RequestService#request', options.url);
                            _a = this, proxyUrl = _a.proxyUrl, strictSSL = _a.strictSSL;
                            _b = options;
                            _c = options.agent;
                            if (_c) return [3 /*break*/, 2];
                            return [4 /*yield*/, proxy_1.getProxyAgent(options.url, { proxyUrl: proxyUrl, strictSSL: strictSSL })];
                        case 1:
                            _c = (_d.sent());
                            _d.label = 2;
                        case 2:
                            _b.agent = _c;
                            options.strictSSL = strictSSL;
                            if (this.authorization) {
                                options.headers = objects_1.assign(options.headers || {}, { 'Proxy-Authorization': this.authorization });
                            }
                            return [2 /*return*/, requestFn(options)];
                    }
                });
            });
        };
        RequestService = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, log_1.ILogService)
        ], RequestService);
        return RequestService;
    }());
    exports.RequestService = RequestService;
});
