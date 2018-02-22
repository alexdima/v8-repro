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
define(["require", "exports", "os", "child_process", "fs", "path", "vs/nls", "vs/base/common/winjs.base", "vs/platform/node/product"], function (require, exports, os, cp, fs, path, nls_1, winjs_base_1, product_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Endpoint = /** @class */ (function () {
        function Endpoint(url) {
            this.url = url;
        }
        Endpoint.getFromProduct = function () {
            var logUploaderUrl = product_1.default.logUploaderUrl;
            return logUploaderUrl ? new Endpoint(logUploaderUrl) : undefined;
        };
        return Endpoint;
    }());
    function uploadLogs(channel, requestService, environmentService) {
        return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
            var endpoint, logsPath, outZip, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = Endpoint.getFromProduct();
                        if (!endpoint) {
                            console.error(nls_1.localize('invalidEndpoint', 'Invalid log uploader endpoint'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, channel.call('get-logs-path', null)];
                    case 1:
                        logsPath = _a.sent();
                        return [4 /*yield*/, promptUserToConfirmLogUpload(logsPath, environmentService)];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        console.log(nls_1.localize('beginUploading', 'Uploading...'));
                        return [4 /*yield*/, zipLogs(logsPath)];
                    case 3:
                        outZip = _a.sent();
                        return [4 /*yield*/, postLogs(endpoint, outZip, requestService)];
                    case 4:
                        result = _a.sent();
                        console.log(nls_1.localize('didUploadLogs', 'Upload successful! Log file ID: {0}', result.blob_id));
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    exports.uploadLogs = uploadLogs;
    function promptUserToConfirmLogUpload(logsPath, environmentService) {
        var confirmKey = 'iConfirmLogsUpload';
        if ((environmentService.args['upload-logs'] || '').toLowerCase() === confirmKey.toLowerCase()) {
            return true;
        }
        else {
            var message = nls_1.localize('logUploadPromptHeader', 'You are about to upload your session logs to a secure Microsoft endpoint that only Microsoft\'s members of the VS Code team can access.')
                + '\n\n' + nls_1.localize('logUploadPromptBody', 'Session logs may contain personal information such as full paths or file contents. Please review and redact your session log files here: \'{0}\'', logsPath)
                + '\n\n' + nls_1.localize('logUploadPromptBodyDetails', 'By continuing you confirm that you have reviewed and redacted your session log files and that you agree to Microsoft using them to debug VS Code.')
                + '\n\n' + nls_1.localize('logUploadPromptAcceptInstructions', 'Please run code with \'--upload-logs={0}\' to proceed with upload', confirmKey);
            console.log(message);
            return false;
        }
    }
    function postLogs(endpoint, outZip, requestService) {
        return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
            var dotter, result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dotter = setInterval(function () { return console.log('.'); }, 5000);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, requestService.request({
                                url: endpoint.url,
                                type: 'POST',
                                data: new Buffer(fs.readFileSync(outZip)).toString('base64'),
                                headers: {
                                    'Content-Type': 'application/zip'
                                }
                            })];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        clearInterval(dotter);
                        console.log(nls_1.localize('postError', 'Error posting logs: {0}', e_1));
                        throw e_1;
                    case 4: return [2 /*return*/, new winjs_base_1.TPromise(function (res, reject) {
                            var parts = [];
                            result.stream.on('data', function (data) {
                                parts.push(data);
                            });
                            result.stream.on('end', function () {
                                clearInterval(dotter);
                                try {
                                    var response = Buffer.concat(parts).toString('utf-8');
                                    if (result.res.statusCode === 200) {
                                        res(JSON.parse(response));
                                    }
                                    else {
                                        var errorMessage = nls_1.localize('responseError', 'Error posting logs. Got {0} — {1}', result.res.statusCode, response);
                                        console.log(errorMessage);
                                        reject(new Error(errorMessage));
                                    }
                                }
                                catch (e) {
                                    console.log(nls_1.localize('parseError', 'Error parsing response'));
                                    reject(e);
                                }
                            });
                        })];
                }
            });
        });
    }
    function zipLogs(logsPath) {
        var tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-log-upload'));
        var outZip = path.join(tempDir, 'logs.zip');
        return new winjs_base_1.TPromise(function (resolve, reject) {
            doZip(logsPath, outZip, tempDir, function (err, stdout, stderr) {
                if (err) {
                    console.error(nls_1.localize('zipError', 'Error zipping logs: {0}', err));
                    reject(err);
                }
                else {
                    resolve(outZip);
                }
            });
        });
    }
    function doZip(logsPath, outZip, tempDir, callback) {
        switch (os.platform()) {
            case 'win32':
                // Copy directory first to avoid file locking issues
                var sub = path.join(tempDir, 'sub');
                return cp.execFile('powershell', ['-Command',
                    "[System.IO.Directory]::CreateDirectory(\"" + sub + "\"); Copy-Item -recurse \"" + logsPath + "\" \"" + sub + "\"; Compress-Archive -Path \"" + sub + "\" -DestinationPath \"" + outZip + "\""], { cwd: logsPath }, callback);
            default:
                return cp.execFile('zip', ['-r', outZip, '.'], { cwd: logsPath }, callback);
        }
    }
});
