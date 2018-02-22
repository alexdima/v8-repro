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
define(["require", "exports", "vs/nls", "vs/base/node/pfs", "vs/base/common/winjs.base", "path", "vs/workbench/api/node/extHostExtensionService", "vs/workbench/api/node/extHostConfiguration", "vs/workbench/api/node/extHostWorkspace", "vs/platform/search/common/search", "vs/workbench/services/search/node/searchService", "vs/workbench/api/node/extHost.protocol", "vs/base/common/errors", "native-watchdog", "vs/workbench/api/node/extHostExtensionActivator", "vs/platform/environment/node/environmentService", "vs/base/common/lifecycle", "vs/workbench/services/extensions/node/rpcProtocol", "vs/base/common/uri", "vs/workbench/api/node/extHostLogService"], function (require, exports, nls, pfs, winjs_base_1, path_1, extHostExtensionService_1, extHostConfiguration_1, extHostWorkspace_1, search_1, searchService_1, extHost_protocol_1, errors, watchdog, extHostExtensionActivator_1, environmentService_1, lifecycle_1, rpcProtocol_1, uri_1, extHostLogService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // const nativeExit = process.exit.bind(process);
    function patchProcess(allowExit) {
        process.exit = function (code) {
            if (allowExit) {
                exit(code);
            }
            else {
                var err = new Error('An extension called process.exit() and this was prevented.');
                console.warn(err.stack);
            }
        };
        process.crash = function () {
            var err = new Error('An extension called process.crash() and this was prevented.');
            console.warn(err.stack);
        };
    }
    function exit(code) {
        //nativeExit(code);
        // TODO@electron
        // See https://github.com/Microsoft/vscode/issues/32990
        // calling process.exit() does not exit the process when the process is being debugged
        // It waits for the debugger to disconnect, but in our version, the debugger does not
        // receive an event that the process desires to exit such that it can disconnect.
        // Do exactly what node.js would have done, minus the wait for the debugger part
        if (code || code === 0) {
            process.exitCode = code;
        }
        if (!process._exiting) {
            process._exiting = true;
            process.emit('exit', process.exitCode || 0);
        }
        watchdog.exit(process.exitCode || 0);
    }
    exports.exit = exit;
    var ExtensionHostMain = /** @class */ (function () {
        function ExtensionHostMain(protocol, initData) {
            this._isTerminating = false;
            this.disposables = [];
            this._environment = initData.environment;
            this._workspace = initData.workspace;
            var allowExit = !!this._environment.extensionTestsPath; // to support other test frameworks like Jasmin that use process.exit (https://github.com/Microsoft/vscode/issues/37708)
            patchProcess(allowExit);
            // services
            var rpcProtocol = new rpcProtocol_1.RPCProtocol(protocol);
            var extHostWorkspace = new extHostWorkspace_1.ExtHostWorkspace(rpcProtocol, initData.workspace);
            var environmentService = new environmentService_1.EnvironmentService(initData.args, initData.execPath);
            this._extHostLogService = new extHostLogService_1.ExtHostLogService(initData.windowId, initData.logLevel, environmentService);
            this.disposables.push(this._extHostLogService);
            this._extHostLogService.info('extension host started');
            this._extHostLogService.trace('initData', initData);
            this._extHostConfiguration = new extHostConfiguration_1.ExtHostConfiguration(rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadConfiguration), extHostWorkspace, initData.configuration);
            this._extensionService = new extHostExtensionService_1.ExtHostExtensionService(initData, rpcProtocol, extHostWorkspace, this._extHostConfiguration, this._extHostLogService, environmentService);
            // error forwarding and stack trace scanning
            var extensionErrors = new WeakMap();
            this._extensionService.getExtensionPathIndex().then(function (map) {
                Error.prepareStackTrace = function (error, stackTrace) {
                    var stackTraceMessage = '';
                    var extension;
                    var fileName;
                    for (var _i = 0, stackTrace_1 = stackTrace; _i < stackTrace_1.length; _i++) {
                        var call = stackTrace_1[_i];
                        stackTraceMessage += "\n\tat " + call.toString();
                        fileName = call.getFileName();
                        if (!extension && fileName) {
                            extension = map.findSubstr(fileName);
                        }
                    }
                    extensionErrors.set(error, extension);
                    return (error.name || 'Error') + ": " + (error.message || '') + stackTraceMessage;
                };
            });
            var mainThreadExtensions = rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadExtensionService);
            var mainThreadErrors = rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadErrors);
            errors.setUnexpectedErrorHandler(function (err) {
                var data = errors.transformErrorForSerialization(err);
                var extension = extensionErrors.get(err);
                if (extension) {
                    mainThreadExtensions.$onExtensionRuntimeError(extension.id, data);
                }
                else {
                    mainThreadErrors.$onUnexpectedError(data);
                }
            });
            // Configure the watchdog to kill our process if the JS event loop is unresponsive for more than 10s
            // if (!initData.environment.isExtensionDevelopmentDebug) {
            // 	watchdog.start(10000);
            // }
        }
        ExtensionHostMain.prototype.start = function () {
            var _this = this;
            return this._extensionService.onExtensionAPIReady()
                .then(function () { return _this.handleEagerExtensions(); })
                .then(function () { return _this.handleExtensionTests(); })
                .then(function () {
                _this._extHostLogService.info("eager extensions activated");
            });
        };
        ExtensionHostMain.prototype.terminate = function () {
            var _this = this;
            if (this._isTerminating) {
                // we are already shutting down...
                return;
            }
            this._isTerminating = true;
            this.disposables = lifecycle_1.dispose(this.disposables);
            errors.setUnexpectedErrorHandler(function (err) {
                // TODO: write to log once we have one
            });
            var allPromises = [];
            try {
                var allExtensions = this._extensionService.getAllExtensionDescriptions();
                var allExtensionsIds = allExtensions.map(function (ext) { return ext.id; });
                var activatedExtensions = allExtensionsIds.filter(function (id) { return _this._extensionService.isActivated(id); });
                allPromises = activatedExtensions.map(function (extensionId) {
                    return _this._extensionService.deactivate(extensionId);
                });
            }
            catch (err) {
                // TODO: write to log once we have one
            }
            var extensionsDeactivated = winjs_base_1.TPromise.join(allPromises).then(function () { return void 0; });
            // Give extensions 1 second to wrap up any async dispose, then exit
            setTimeout(function () {
                winjs_base_1.TPromise.any([winjs_base_1.TPromise.timeout(4000), extensionsDeactivated]).then(function () { return exit(); }, function () { return exit(); });
            }, 1000);
        };
        // Handle "eager" activation extensions
        ExtensionHostMain.prototype.handleEagerExtensions = function () {
            this._extensionService.activateByEvent('*', true).then(null, function (err) {
                console.error(err);
            });
            return this.handleWorkspaceContainsEagerExtensions();
        };
        ExtensionHostMain.prototype.handleWorkspaceContainsEagerExtensions = function () {
            var _this = this;
            if (!this._workspace || this._workspace.folders.length === 0) {
                return winjs_base_1.TPromise.as(null);
            }
            return winjs_base_1.TPromise.join(this._extensionService.getAllExtensionDescriptions().map(function (desc) {
                return _this.handleWorkspaceContainsEagerExtension(desc);
            })).then(function () { });
        };
        ExtensionHostMain.prototype.handleWorkspaceContainsEagerExtension = function (desc) {
            var _this = this;
            var activationEvents = desc.activationEvents;
            if (!activationEvents) {
                return winjs_base_1.TPromise.as(void 0);
            }
            var fileNames = [];
            var globPatterns = [];
            for (var i = 0; i < activationEvents.length; i++) {
                if (/^workspaceContains:/.test(activationEvents[i])) {
                    var fileNameOrGlob = activationEvents[i].substr('workspaceContains:'.length);
                    if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0) {
                        globPatterns.push(fileNameOrGlob);
                    }
                    else {
                        fileNames.push(fileNameOrGlob);
                    }
                }
            }
            if (fileNames.length === 0 && globPatterns.length === 0) {
                return winjs_base_1.TPromise.as(void 0);
            }
            var fileNamePromise = winjs_base_1.TPromise.join(fileNames.map(function (fileName) { return _this.activateIfFileName(desc.id, fileName); })).then(function () { });
            var globPatternPromise = this.activateIfGlobPatterns(desc.id, globPatterns);
            return winjs_base_1.TPromise.join([fileNamePromise, globPatternPromise]).then(function () { });
        };
        ExtensionHostMain.prototype.activateIfFileName = function (extensionId, fileName) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _i, _a, uri;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _i = 0, _a = this._workspace.folders;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            uri = _a[_i].uri;
                            return [4 /*yield*/, pfs.exists(path_1.join(uri_1.default.revive(uri).fsPath, fileName))];
                        case 2:
                            if (_b.sent()) {
                                // the file was found
                                return [2 /*return*/, (this._extensionService.activateById(extensionId, new extHostExtensionActivator_1.ExtensionActivatedByEvent(true, "workspaceContains:" + fileName))
                                        .done(null, function (err) { return console.error(err); }))];
                            }
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, undefined];
                    }
                });
            });
        };
        ExtensionHostMain.prototype.activateIfGlobPatterns = function (extensionId, globPatterns) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var includes, folderQueries, config, useRipgrep, followSymlinks, query, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (globPatterns.length === 0) {
                                return [2 /*return*/, winjs_base_1.TPromise.as(void 0)];
                            }
                            if (!this._diskSearch) {
                                // Shut down this search process after 1s
                                this._diskSearch = new searchService_1.DiskSearch(false, 1000);
                            }
                            includes = {};
                            globPatterns.forEach(function (globPattern) {
                                includes[globPattern] = true;
                            });
                            folderQueries = this._workspace.folders.map(function (folder) { return ({ folder: uri_1.default.revive(folder.uri) }); });
                            config = this._extHostConfiguration.getConfiguration('search');
                            useRipgrep = config.get('useRipgrep', true);
                            followSymlinks = config.get('followSymlinks', true);
                            query = {
                                folderQueries: folderQueries,
                                type: search_1.QueryType.File,
                                exists: true,
                                includePattern: includes,
                                useRipgrep: useRipgrep,
                                ignoreSymlinks: !followSymlinks
                            };
                            return [4 /*yield*/, this._diskSearch.search(query)];
                        case 1:
                            result = _a.sent();
                            if (result.limitHit) {
                                // a file was found matching one of the glob patterns
                                return [2 /*return*/, (this._extensionService.activateById(extensionId, new extHostExtensionActivator_1.ExtensionActivatedByEvent(true, "workspaceContains:" + globPatterns.join(',')))
                                        .done(null, function (err) { return console.error(err); }))];
                            }
                            return [2 /*return*/, winjs_base_1.TPromise.as(void 0)];
                    }
                });
            });
        };
        ExtensionHostMain.prototype.handleExtensionTests = function () {
            var _this = this;
            if (!this._environment.extensionTestsPath || !this._environment.extensionDevelopmentPath) {
                return winjs_base_1.TPromise.as(null);
            }
            // Require the test runner via node require from the provided path
            var testRunner;
            var requireError;
            try {
                testRunner = require.__$__nodeRequire(this._environment.extensionTestsPath);
            }
            catch (error) {
                requireError = error;
            }
            // Execute the runner if it follows our spec
            if (testRunner && typeof testRunner.run === 'function') {
                return new winjs_base_1.TPromise(function (c, e) {
                    testRunner.run(_this._environment.extensionTestsPath, function (error, failures) {
                        if (error) {
                            e(error.toString());
                        }
                        else {
                            c(null);
                        }
                        // after tests have run, we shutdown the host
                        _this.gracefulExit(failures && failures > 0 ? 1 /* ERROR */ : 0 /* OK */);
                    });
                });
            }
            else {
                this.gracefulExit(1 /* ERROR */);
            }
            return winjs_base_1.TPromise.wrapError(new Error(requireError ? requireError.toString() : nls.localize('extensionTestError', "Path {0} does not point to a valid extension test runner.", this._environment.extensionTestsPath)));
        };
        ExtensionHostMain.prototype.gracefulExit = function (code) {
            // to give the PH process a chance to flush any outstanding console
            // messages to the main process, we delay the exit() by some time
            setTimeout(function () { return exit(code); }, 500);
        };
        return ExtensionHostMain;
    }());
    exports.ExtensionHostMain = ExtensionHostMain;
});
