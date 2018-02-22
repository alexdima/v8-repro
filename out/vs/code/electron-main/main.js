/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
define(["require", "exports", "electron", "vs/base/common/objects", "vs/base/common/platform", "vs/platform/node/product", "path", "vs/platform/environment/node/argv", "vs/base/node/pfs", "vs/code/node/paths", "vs/platform/lifecycle/electron-main/lifecycleMain", "vs/base/parts/ipc/node/ipc.net", "vs/base/common/winjs.base", "vs/code/electron-main/launch", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/descriptors", "vs/platform/log/common/log", "vs/platform/state/node/stateService", "vs/platform/state/common/state", "vs/platform/backup/common/backup", "vs/platform/backup/electron-main/backupMainService", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/node/configurationService", "vs/platform/request/node/request", "vs/platform/request/electron-main/requestService", "vs/platform/url/common/url", "vs/platform/url/electron-main/urlService", "original-fs", "vs/code/electron-main/app", "vs/platform/history/electron-main/historyMainService", "vs/platform/history/common/history", "vs/platform/workspaces/electron-main/workspacesMainService", "vs/platform/workspaces/common/workspaces", "vs/nls", "vs/base/common/labels", "vs/platform/log/node/spdlogService", "vs/code/electron-main/diagnostics", "vs/platform/log/common/bufferLog", "vs/code/electron-main/logUploader", "vs/platform/message/common/message", "vs/platform/message/node/messageCli", "vs/base/common/errors", "vs/code/electron-main/contributions"], function (require, exports, electron_1, objects_1, platform, product_1, path, argv_1, pfs_1, paths_1, lifecycleMain_1, ipc_net_1, winjs_base_1, launch_1, instantiationService_1, serviceCollection_1, descriptors_1, log_1, stateService_1, state_1, backup_1, backupMainService_1, environment_1, environmentService_1, configuration_1, configurationService_1, request_1, requestService_1, url_1, urlService_1, fs, app_1, historyMainService_1, history_1, workspacesMainService_1, workspaces_1, nls_1, labels_1, spdlogService_1, diagnostics_1, bufferLog_1, logUploader_1, message_1, messageCli_1, errors_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createServices(args, bufferLogService) {
        var services = new serviceCollection_1.ServiceCollection();
        var environmentService = new environmentService_1.EnvironmentService(args, process.execPath);
        var consoleLogService = new log_1.ConsoleLogMainService(log_1.getLogLevel(environmentService));
        var logService = new log_1.MultiplexLogService([consoleLogService, bufferLogService]);
        process.once('exit', function () { return logService.dispose(); });
        // Eventually cleanup
        setTimeout(function () { return cleanupOlderLogs(environmentService).then(null, function (err) { return console.error(err); }); }, 10000);
        services.set(environment_1.IEnvironmentService, environmentService);
        services.set(log_1.ILogService, logService);
        services.set(workspaces_1.IWorkspacesMainService, new descriptors_1.SyncDescriptor(workspacesMainService_1.WorkspacesMainService));
        services.set(history_1.IHistoryMainService, new descriptors_1.SyncDescriptor(historyMainService_1.HistoryMainService));
        services.set(lifecycleMain_1.ILifecycleService, new descriptors_1.SyncDescriptor(lifecycleMain_1.LifecycleService));
        services.set(state_1.IStateService, new descriptors_1.SyncDescriptor(stateService_1.StateService));
        services.set(configuration_1.IConfigurationService, new descriptors_1.SyncDescriptor(configurationService_1.ConfigurationService));
        services.set(request_1.IRequestService, new descriptors_1.SyncDescriptor(requestService_1.RequestService));
        services.set(url_1.IURLService, new descriptors_1.SyncDescriptor(urlService_1.URLService, args['open-url'] ? args._urls : []));
        services.set(backup_1.IBackupMainService, new descriptors_1.SyncDescriptor(backupMainService_1.BackupMainService));
        services.set(message_1.IChoiceService, new descriptors_1.SyncDescriptor(messageCli_1.ChoiceCliService));
        return new instantiationService_1.InstantiationService(services, true);
    }
    /**
     * Cleans up older logs, while keeping the 10 most recent ones.
    */
    function cleanupOlderLogs(environmentService) {
        return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
            var currentLog, logsRoot, children, allSessions, oldSessions, toDelete;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentLog = path.basename(environmentService.logsPath);
                        logsRoot = path.dirname(environmentService.logsPath);
                        return [4 /*yield*/, pfs_1.readdir(logsRoot)];
                    case 1:
                        children = _a.sent();
                        allSessions = children.filter(function (name) { return /^\d{8}T\d{6}$/.test(name); });
                        oldSessions = allSessions.sort().filter(function (d, i) { return d !== currentLog; });
                        toDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 9));
                        return [4 /*yield*/, winjs_base_1.TPromise.join(toDelete.map(function (name) { return pfs_1.rimraf(path.join(logsRoot, name)); }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function createPaths(environmentService) {
        var paths = [
            environmentService.appSettingsHome,
            environmentService.extensionsPath,
            environmentService.nodeCachedDataDir,
            environmentService.logsPath
        ];
        return winjs_base_1.TPromise.join(paths.map(function (p) { return p && pfs_1.mkdirp(p); }));
    }
    var ExpectedError = /** @class */ (function (_super) {
        __extends(ExpectedError, _super);
        function ExpectedError() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isExpected = true;
            return _this;
        }
        return ExpectedError;
    }(Error));
    function setupIPC(accessor) {
        var logService = accessor.get(log_1.ILogService);
        var environmentService = accessor.get(environment_1.IEnvironmentService);
        var requestService = accessor.get(request_1.IRequestService);
        function allowSetForegroundWindow(service) {
            var promise = winjs_base_1.TPromise.wrap(void 0);
            if (platform.isWindows) {
                promise = service.getMainProcessId()
                    .then(function (processId) {
                    logService.trace('Sending some foreground love to the running instance:', processId);
                    try {
                        var allowSetForegroundWindow_1 = require.__$__nodeRequire('windows-foreground-love').allowSetForegroundWindow;
                        allowSetForegroundWindow_1(processId);
                    }
                    catch (e) {
                        // noop
                    }
                });
            }
            return promise;
        }
        function setup(retry) {
            return ipc_net_1.serve(environmentService.mainIPCHandle).then(function (server) {
                // Print --status usage info
                if (environmentService.args.status) {
                    logService.warn('Warning: The --status argument can only be used if Code is already running. Please run it again after Code has started.');
                    throw new ExpectedError('Terminating...');
                }
                // Log uploader usage info
                if (typeof environmentService.args['upload-logs'] !== 'undefined') {
                    logService.warn('Warning: The --upload-logs argument can only be used if Code is already running. Please run it again after Code has started.');
                    throw new ExpectedError('Terminating...');
                }
                // dock might be hidden at this case due to a retry
                if (platform.isMacintosh) {
                    electron_1.app.dock.show();
                }
                // Set the VSCODE_PID variable here when we are sure we are the first
                // instance to startup. Otherwise we would wrongly overwrite the PID
                process.env['VSCODE_PID'] = String(process.pid);
                return server;
            }, function (err) {
                if (err.code !== 'EADDRINUSE') {
                    return winjs_base_1.TPromise.wrapError(err);
                }
                // Since we are the second instance, we do not want to show the dock
                if (platform.isMacintosh) {
                    electron_1.app.dock.hide();
                }
                // there's a running instance, let's connect to it
                return ipc_net_1.connect(environmentService.mainIPCHandle, 'main').then(function (client) {
                    // Tests from CLI require to be the only instance currently
                    if (environmentService.extensionTestsPath && !environmentService.debugExtensionHost.break) {
                        var msg = 'Running extension tests from the command line is currently only supported if no other instance of Code is running.';
                        logService.error(msg);
                        client.dispose();
                        return winjs_base_1.TPromise.wrapError(new Error(msg));
                    }
                    // Show a warning dialog after some timeout if it takes long to talk to the other instance
                    // Skip this if we are running with --wait where it is expected that we wait for a while.
                    // Also skip when gathering diagnostics (--status) which can take a longer time.
                    var startupWarningDialogHandle;
                    if (!environmentService.wait && !environmentService.status && !environmentService.args['upload-logs']) {
                        startupWarningDialogHandle = setTimeout(function () {
                            showStartupWarningDialog(nls_1.localize('secondInstanceNoResponse', "Another instance of {0} is running but not responding", product_1.default.nameShort), nls_1.localize('secondInstanceNoResponseDetail', "Please close all other instances and try again."));
                        }, 10000);
                    }
                    var channel = client.getChannel('launch');
                    var service = new launch_1.LaunchChannelClient(channel);
                    // Process Info
                    if (environmentService.args.status) {
                        return service.getMainProcessInfo().then(function (info) {
                            return diagnostics_1.printDiagnostics(info).then(function () { return winjs_base_1.TPromise.wrapError(new ExpectedError()); });
                        });
                    }
                    // Log uploader
                    if (typeof environmentService.args['upload-logs'] !== 'undefined') {
                        return logUploader_1.uploadLogs(channel, requestService, environmentService)
                            .then(function () { return winjs_base_1.TPromise.wrapError(new ExpectedError()); });
                    }
                    logService.trace('Sending env to running instance...');
                    return allowSetForegroundWindow(service)
                        .then(function () { return service.start(environmentService.args, process.env); })
                        .then(function () { return client.dispose(); })
                        .then(function () {
                        // Now that we started, make sure the warning dialog is prevented
                        if (startupWarningDialogHandle) {
                            clearTimeout(startupWarningDialogHandle);
                        }
                        return winjs_base_1.TPromise.wrapError(new ExpectedError('Sent env to running instance. Terminating...'));
                    });
                }, function (err) {
                    if (!retry || platform.isWindows || err.code !== 'ECONNREFUSED') {
                        if (err.code === 'EPERM') {
                            showStartupWarningDialog(nls_1.localize('secondInstanceAdmin', "A second instance of {0} is already running as administrator.", product_1.default.nameShort), nls_1.localize('secondInstanceAdminDetail', "Please close the other instance and try again."));
                        }
                        return winjs_base_1.TPromise.wrapError(err);
                    }
                    // it happens on Linux and OS X that the pipe is left behind
                    // let's delete it, since we can't connect to it
                    // and then retry the whole thing
                    try {
                        fs.unlinkSync(environmentService.mainIPCHandle);
                    }
                    catch (e) {
                        logService.warn('Could not delete obsolete instance handle', e);
                        return winjs_base_1.TPromise.wrapError(e);
                    }
                    return setup(false);
                });
            });
        }
        return setup(true);
    }
    function showStartupWarningDialog(message, detail) {
        electron_1.dialog.showMessageBox({
            title: product_1.default.nameLong,
            type: 'warning',
            buttons: [labels_1.mnemonicButtonLabel(nls_1.localize({ key: 'close', comment: ['&& denotes a mnemonic'] }, "&&Close"))],
            message: message,
            detail: detail,
            noLink: true
        });
    }
    function quit(accessor, reason) {
        var logService = accessor.get(log_1.ILogService);
        var lifecycleService = accessor.get(lifecycleMain_1.ILifecycleService);
        var exitCode = 0;
        if (reason) {
            if (reason.isExpected) {
                if (reason.message) {
                    logService.trace(reason.message);
                }
            }
            else {
                exitCode = 1; // signal error to the outside
                if (reason.stack) {
                    logService.error(reason.stack);
                }
                else {
                    logService.error("Startup error: " + reason.toString());
                }
            }
        }
        lifecycleService.kill(exitCode);
    }
    function main() {
        // Set the error handler early enough so that we are not getting the
        // default electron error dialog popping up
        errors_1.setUnexpectedErrorHandler(function (err) { return console.error(err); });
        var args;
        try {
            args = argv_1.parseMainProcessArgv(process.argv);
            args = paths_1.validatePaths(args);
        }
        catch (err) {
            console.error(err.message);
            electron_1.app.exit(1);
            return;
        }
        // We need to buffer the spdlog logs until we are sure
        // we are the only instance running, otherwise we'll have concurrent
        // log file access on Windows
        // https://github.com/Microsoft/vscode/issues/41218
        var bufferLogService = new bufferLog_1.BufferLogService();
        var instantiationService = createServices(args, bufferLogService);
        return instantiationService.invokeFunction(function (accessor) {
            // Patch `process.env` with the instance's environment
            var environmentService = accessor.get(environment_1.IEnvironmentService);
            var instanceEnv = {
                VSCODE_IPC_HOOK: environmentService.mainIPCHandle,
                VSCODE_NLS_CONFIG: process.env['VSCODE_NLS_CONFIG'],
                VSCODE_LOGS: process.env['VSCODE_LOGS']
            };
            objects_1.assign(process.env, instanceEnv);
            // Startup
            return instantiationService.invokeFunction(function (a) { return createPaths(a.get(environment_1.IEnvironmentService)); })
                .then(function () { return instantiationService.invokeFunction(setupIPC); })
                .then(function (mainIpcServer) {
                bufferLogService.logger = spdlogService_1.createSpdLogService('main', bufferLogService.getLevel(), environmentService.logsPath);
                return instantiationService.createInstance(app_1.CodeApplication, mainIpcServer, instanceEnv).startup();
            });
        }).done(null, function (err) { return instantiationService.invokeFunction(quit, err); });
    }
    main();
});
