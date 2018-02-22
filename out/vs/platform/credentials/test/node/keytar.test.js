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
define(["require", "exports", "assert", "vs/base/common/platform"], function (require, exports, assert, platform) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Keytar', function () {
        test('loads and is functional', function (done) {
            if (platform.isLinux) {
                // Skip test due to set up issue with Travis.
                done();
                return;
            }
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var keytar, name, _a, _b, _c, _d, err_1;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(['keytar'], resolve_1, reject_1); })];
                        case 1:
                            keytar = _e.sent();
                            name = "VSCode Test " + Math.floor(Math.random() * 1e9);
                            _e.label = 2;
                        case 2:
                            _e.trys.push([2, 7, , 12]);
                            return [4 /*yield*/, keytar.setPassword(name, 'foo', 'bar')];
                        case 3:
                            _e.sent();
                            _b = (_a = assert).equal;
                            return [4 /*yield*/, keytar.getPassword(name, 'foo')];
                        case 4:
                            _b.apply(_a, [_e.sent(), 'bar']);
                            return [4 /*yield*/, keytar.deletePassword(name, 'foo')];
                        case 5:
                            _e.sent();
                            _d = (_c = assert).equal;
                            return [4 /*yield*/, keytar.getPassword(name, 'foo')];
                        case 6:
                            _d.apply(_c, [_e.sent(), undefined]);
                            return [3 /*break*/, 12];
                        case 7:
                            err_1 = _e.sent();
                            _e.label = 8;
                        case 8:
                            _e.trys.push([8, , 10, 11]);
                            return [4 /*yield*/, keytar.deletePassword(name, 'foo')];
                        case 9:
                            _e.sent();
                            return [3 /*break*/, 11];
                        case 10: throw err_1;
                        case 11: return [3 /*break*/, 12];
                        case 12: return [2 /*return*/];
                    }
                });
            }); })().then(done, done);
        });
    });
});
