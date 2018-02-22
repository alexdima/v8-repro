/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/types", "url", "fs", "vs/base/common/objects", "zlib"], function (require, exports, winjs_base_1, types_1, url_1, fs_1, objects_1, zlib_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getNodeRequest(options) {
        return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
            var endpoint, module, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        endpoint = url_1.parse(options.url);
                        if (!(endpoint.protocol === 'https:')) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(['https'], resolve_1, reject_1); })];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, new Promise(function (resolve_2, reject_2) { require(['http'], resolve_2, reject_2); })];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        module = _a;
                        return [2 /*return*/, module.request];
                }
            });
        });
    }
    function request(options) {
        var req;
        var rawRequestPromise = options.getRawRequest
            ? winjs_base_1.TPromise.as(options.getRawRequest(options))
            : getNodeRequest(options);
        return rawRequestPromise.then(function (rawRequest) {
            return new winjs_base_1.TPromise(function (c, e) {
                var endpoint = url_1.parse(options.url);
                var opts = {
                    hostname: endpoint.hostname,
                    port: endpoint.port ? parseInt(endpoint.port) : (endpoint.protocol === 'https:' ? 443 : 80),
                    protocol: endpoint.protocol,
                    path: endpoint.path,
                    method: options.type || 'GET',
                    headers: options.headers,
                    agent: options.agent,
                    rejectUnauthorized: types_1.isBoolean(options.strictSSL) ? options.strictSSL : true
                };
                if (options.user && options.password) {
                    opts.auth = options.user + ':' + options.password;
                }
                req = rawRequest(opts, function (res) {
                    var followRedirects = types_1.isNumber(options.followRedirects) ? options.followRedirects : 3;
                    if (res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers['location']) {
                        request(objects_1.assign({}, options, {
                            url: res.headers['location'],
                            followRedirects: followRedirects - 1
                        })).done(c, e);
                    }
                    else {
                        var stream = res;
                        if (res.headers['content-encoding'] === 'gzip') {
                            stream = stream.pipe(zlib_1.createGunzip());
                        }
                        c({ res: res, stream: stream });
                    }
                });
                req.on('error', e);
                if (options.timeout) {
                    req.setTimeout(options.timeout);
                }
                if (options.data) {
                    if (typeof options.data === 'string') {
                        req.write(options.data);
                    }
                    else {
                        options.data.pipe(req);
                        return;
                    }
                }
                req.end();
            }, function () { return req && req.abort(); });
        });
    }
    exports.request = request;
    function isSuccess(context) {
        return (context.res.statusCode >= 200 && context.res.statusCode < 300) || context.res.statusCode === 1223;
    }
    function hasNoContent(context) {
        return context.res.statusCode === 204;
    }
    function download(filePath, context) {
        return new winjs_base_1.TPromise(function (c, e) {
            var out = fs_1.createWriteStream(filePath);
            out.once('finish', function () { return c(null); });
            context.stream.once('error', e);
            context.stream.pipe(out);
        });
    }
    exports.download = download;
    function asText(context) {
        return new winjs_base_1.TPromise(function (c, e) {
            if (!isSuccess(context)) {
                return e('Server returned ' + context.res.statusCode);
            }
            if (hasNoContent(context)) {
                return c(null);
            }
            var buffer = [];
            context.stream.on('data', function (d) { return buffer.push(d); });
            context.stream.on('end', function () { return c(buffer.join('')); });
            context.stream.on('error', e);
        });
    }
    exports.asText = asText;
    function asJson(context) {
        return new winjs_base_1.TPromise(function (c, e) {
            if (!isSuccess(context)) {
                return e('Server returned ' + context.res.statusCode);
            }
            if (hasNoContent(context)) {
                return c(null);
            }
            var buffer = [];
            context.stream.on('data', function (d) { return buffer.push(d); });
            context.stream.on('end', function () {
                try {
                    c(JSON.parse(buffer.join('')));
                }
                catch (err) {
                    e(err);
                }
            });
            context.stream.on('error', e);
        });
    }
    exports.asJson = asJson;
});
