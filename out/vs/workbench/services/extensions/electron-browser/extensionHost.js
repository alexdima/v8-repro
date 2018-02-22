/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/errorMessage", "vs/base/common/objects", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/base/common/platform", "vs/base/node/ports", "vs/platform/message/common/message", "vs/platform/lifecycle/common/lifecycle", "vs/platform/windows/common/windows", "vs/platform/workspace/common/workspace", "vs/platform/telemetry/common/telemetry", "child_process", "electron", "vs/platform/node/product", "vs/platform/environment/common/environment", "vs/base/parts/ipc/node/ipc.net", "net", "vs/base/common/event", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/crashReporter/electron-browser/crashReporterService", "vs/platform/broadcast/electron-browser/broadcastService", "vs/base/common/paths", "vs/platform/extensions/common/extensionHost", "vs/base/common/lifecycle", "vs/base/node/console", "vs/platform/configuration/common/configurationRegistry", "vs/platform/log/common/log"], function (require, exports, nls, errorMessage_1, objects, uri_1, winjs_base_1, platform_1, ports_1, message_1, lifecycle_1, windows_1, workspace_1, telemetry_1, child_process_1, electron_1, product_1, environment_1, ipc_net_1, net_1, event_1, configuration_1, crashReporterService_1, broadcastService_1, paths_1, extensionHost_1, lifecycle_2, console_1, configurationRegistry_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtensionHostProcessWorker = /** @class */ (function () {
        function ExtensionHostProcessWorker(
            /* intentionally not injected */ _extensionService, _contextService, _messageService, _windowsService, _windowService, _broadcastService, _lifecycleService, _environmentService, _configurationService, _telemetryService, _crashReporterService, _logService) {
            var _this = this;
            this._extensionService = _extensionService;
            this._contextService = _contextService;
            this._messageService = _messageService;
            this._windowsService = _windowsService;
            this._windowService = _windowService;
            this._broadcastService = _broadcastService;
            this._lifecycleService = _lifecycleService;
            this._environmentService = _environmentService;
            this._configurationService = _configurationService;
            this._telemetryService = _telemetryService;
            this._crashReporterService = _crashReporterService;
            this._logService = _logService;
            this._onCrashed = new event_1.Emitter();
            this.onCrashed = this._onCrashed.event;
            // handle extension host lifecycle a bit special when we know we are developing an extension that runs inside
            this._isExtensionDevHost = this._environmentService.isExtensionDevelopment;
            this._isExtensionDevDebug = (typeof this._environmentService.debugExtensionHost.port === 'number');
            this._isExtensionDevDebugBrk = !!this._environmentService.debugExtensionHost.break;
            this._isExtensionDevTestFromCli = this._isExtensionDevHost && !!this._environmentService.extensionTestsPath && !this._environmentService.debugExtensionHost.break;
            this._lastExtensionHostError = null;
            this._terminating = false;
            this._namedPipeServer = null;
            this._extensionHostProcess = null;
            this._extensionHostConnection = null;
            this._messageProtocol = null;
            this._toDispose = [];
            this._toDispose.push(this._onCrashed);
            this._toDispose.push(this._lifecycleService.onWillShutdown(function (e) { return _this._onWillShutdown(e); }));
            this._toDispose.push(this._lifecycleService.onShutdown(function (reason) { return _this.terminate(); }));
            this._toDispose.push(this._broadcastService.onBroadcast(function (b) { return _this._onBroadcast(b); }));
            var globalExitListener = function () { return _this.terminate(); };
            process.once('exit', globalExitListener);
            this._toDispose.push({
                dispose: function () {
                    process.removeListener('exit', globalExitListener);
                }
            });
        }
        ExtensionHostProcessWorker.prototype.dispose = function () {
            this.terminate();
        };
        ExtensionHostProcessWorker.prototype._onBroadcast = function (broadcast) {
            var _this = this;
            // Close Ext Host Window Request
            if (broadcast.channel === extensionHost_1.EXTENSION_CLOSE_EXTHOST_BROADCAST_CHANNEL && this._isExtensionDevHost) {
                var extensionPaths = broadcast.payload;
                if (Array.isArray(extensionPaths) && extensionPaths.some(function (path) { return paths_1.isEqual(_this._environmentService.extensionDevelopmentPath, path, !platform_1.isLinux); })) {
                    this._windowService.closeWindow();
                }
            }
            if (broadcast.channel === extensionHost_1.EXTENSION_RELOAD_BROADCAST_CHANNEL && this._isExtensionDevHost) {
                var extensionPaths = broadcast.payload;
                if (Array.isArray(extensionPaths) && extensionPaths.some(function (path) { return paths_1.isEqual(_this._environmentService.extensionDevelopmentPath, path, !platform_1.isLinux); })) {
                    this._windowService.reloadWindow();
                }
            }
        };
        ExtensionHostProcessWorker.prototype.start = function () {
            var _this = this;
            if (this._terminating) {
                // .terminate() was called
                return null;
            }
            if (!this._messageProtocol) {
                this._messageProtocol = winjs_base_1.TPromise.join([this._tryListenOnPipe(), this._tryFindDebugPort()]).then(function (data) {
                    var pipeName = data[0];
                    var portData = data[1];
                    var opts = {
                        env: objects.mixin(objects.deepClone(process.env), {
                            AMD_ENTRYPOINT: 'vs/workbench/node/extensionHostProcess',
                            PIPE_LOGGING: 'true',
                            VERBOSE_LOGGING: true,
                            VSCODE_WINDOW_ID: String(_this._windowService.getCurrentWindowId()),
                            VSCODE_IPC_HOOK_EXTHOST: pipeName,
                            VSCODE_HANDLES_UNCAUGHT_ERRORS: true,
                            VSCODE_LOG_STACK: !_this._isExtensionDevTestFromCli && (_this._isExtensionDevHost || !_this._environmentService.isBuilt || product_1.default.quality !== 'stable' || _this._environmentService.verbose)
                        }),
                        // We only detach the extension host on windows. Linux and Mac orphan by default
                        // and detach under Linux and Mac create another process group.
                        // We detach because we have noticed that when the renderer exits, its child processes
                        // (i.e. extension host) are taken down in a brutal fashion by the OS
                        detached: !!platform_1.isWindows,
                        execArgv: undefined,
                        silent: true
                    };
                    if (portData.actual) {
                        opts.execArgv = [
                            '--nolazy',
                            (_this._isExtensionDevDebugBrk ? '--inspect-brk=' : '--inspect=') + portData.actual
                        ];
                        if (!portData.expected) {
                            // No one asked for 'inspect' or 'inspect-brk', only us. We add another
                            // option such that the extension host can manipulate the execArgv array
                            opts.env.VSCODE_PREVENT_FOREIGN_INSPECT = true;
                        }
                    }
                    var crashReporterOptions = _this._crashReporterService.getChildProcessStartOptions('extensionHost');
                    if (crashReporterOptions) {
                        opts.env.CRASH_REPORTER_START_OPTIONS = JSON.stringify(crashReporterOptions);
                    }
                    // Run Extension Host as fork of current process
                    _this._extensionHostProcess = child_process_1.fork(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, ['--type=extensionHost'], opts);
                    _this._extensionHostProcess.stdout.setEncoding('utf8');
                    _this._extensionHostProcess.stderr.setEncoding('utf8');
                    var onStdout = event_1.fromNodeEventEmitter(_this._extensionHostProcess.stdout, 'data');
                    var onStderr = event_1.fromNodeEventEmitter(_this._extensionHostProcess.stderr, 'data');
                    var onOutput = event_1.anyEvent(event_1.mapEvent(onStdout, function (o) { return ({ data: "%c" + o, format: [''] }); }), event_1.mapEvent(onStderr, function (o) { return ({ data: "%c" + o, format: ['color: red'] }); }));
                    // Debounce all output, so we can render it in the Chrome console as a group
                    var onDebouncedOutput = event_1.debounceEvent(onOutput, function (r, o) {
                        return r
                            ? { data: r.data + o.data, format: r.format.concat(o.format) }
                            : { data: o.data, format: o.format };
                    }, 100);
                    // Print out extension host output
                    onDebouncedOutput(function (data) {
                        var inspectorUrlIndex = !_this._environmentService.isBuilt && data.data && data.data.indexOf('chrome-devtools://');
                        if (inspectorUrlIndex >= 0) {
                            console.log("%c[Extension Host] %cdebugger inspector at " + data.data.substr(inspectorUrlIndex), 'color: blue', 'color: black');
                        }
                        else {
                            console.group('Extension Host');
                            console.log.apply(console, [data.data].concat(data.format));
                            console.groupEnd();
                        }
                    });
                    // Support logging from extension host
                    _this._extensionHostProcess.on('message', function (msg) {
                        if (msg && msg.type === '__$console') {
                            _this._logExtensionHostMessage(msg);
                        }
                    });
                    // Lifecycle
                    _this._extensionHostProcess.on('error', function (err) { return _this._onExtHostProcessError(err); });
                    _this._extensionHostProcess.on('exit', function (code, signal) { return _this._onExtHostProcessExit(code, signal); });
                    // Notify debugger that we are ready to attach to the process if we run a development extension
                    if (_this._isExtensionDevHost && portData.actual) {
                        _this._broadcastService.broadcast({
                            channel: extensionHost_1.EXTENSION_ATTACH_BROADCAST_CHANNEL,
                            payload: {
                                debugId: _this._environmentService.debugExtensionHost.debugId,
                                port: portData.actual
                            }
                        });
                    }
                    _this._inspectPort = portData.actual;
                    // Help in case we fail to start it
                    var startupTimeoutHandle;
                    if (!_this._environmentService.isBuilt || _this._isExtensionDevHost) {
                        startupTimeoutHandle = setTimeout(function () {
                            var msg = _this._isExtensionDevDebugBrk
                                ? nls.localize('extensionHostProcess.startupFailDebug', "Extension host did not start in 10 seconds, it might be stopped on the first line and needs a debugger to continue.")
                                : nls.localize('extensionHostProcess.startupFail', "Extension host did not start in 10 seconds, that might be a problem.");
                            _this._messageService.show(message_1.Severity.Warning, msg);
                        }, 10000);
                    }
                    // Initialize extension host process with hand shakes
                    return _this._tryExtHostHandshake().then(function (protocol) {
                        clearTimeout(startupTimeoutHandle);
                        return protocol;
                    });
                });
            }
            return this._messageProtocol;
        };
        /**
         * Start a server (`this._namedPipeServer`) that listens on a named pipe and return the named pipe name.
         */
        ExtensionHostProcessWorker.prototype._tryListenOnPipe = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (resolve, reject) {
                var pipeName = ipc_net_1.generateRandomPipeName();
                _this._namedPipeServer = net_1.createServer();
                _this._namedPipeServer.on('error', reject);
                _this._namedPipeServer.listen(pipeName, function () {
                    _this._namedPipeServer.removeListener('error', reject);
                    resolve(pipeName);
                });
            });
        };
        /**
         * Find a free port if extension host debugging is enabled.
         */
        ExtensionHostProcessWorker.prototype._tryFindDebugPort = function () {
            var _this = this;
            var expected;
            var startPort = 9333;
            if (typeof this._environmentService.debugExtensionHost.port === 'number') {
                startPort = expected = this._environmentService.debugExtensionHost.port;
            }
            else {
                return winjs_base_1.TPromise.as({ expected: undefined, actual: 0 });
            }
            return new winjs_base_1.TPromise(function (c, e) {
                return ports_1.findFreePort(startPort, 10 /* try 10 ports */, 5000 /* try up to 5 seconds */).then(function (port) {
                    if (!port) {
                        console.warn('%c[Extension Host] %cCould not find a free port for debugging', 'color: blue', 'color: black');
                    }
                    else {
                        if (expected && port !== expected) {
                            console.warn("%c[Extension Host] %cProvided debugging port " + expected + " is not free, using " + port + " instead.", 'color: blue', 'color: black');
                        }
                        if (_this._isExtensionDevDebugBrk) {
                            console.warn("%c[Extension Host] %cSTOPPED on first line for debugging on port " + port, 'color: blue', 'color: black');
                        }
                        else {
                            console.info("%c[Extension Host] %cdebugger listening on port " + port, 'color: blue', 'color: black');
                        }
                    }
                    return c({ expected: expected, actual: port });
                });
            });
        };
        ExtensionHostProcessWorker.prototype._tryExtHostHandshake = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (resolve, reject) {
                // Wait for the extension host to connect to our named pipe
                // and wrap the socket in the message passing protocol
                var handle = setTimeout(function () {
                    _this._namedPipeServer.close();
                    _this._namedPipeServer = null;
                    reject('timeout');
                }, 60 * 1000);
                _this._namedPipeServer.on('connection', function (socket) {
                    clearTimeout(handle);
                    _this._namedPipeServer.close();
                    _this._namedPipeServer = null;
                    _this._extensionHostConnection = socket;
                    resolve(new ipc_net_1.Protocol(_this._extensionHostConnection));
                });
            }).then(function (protocol) {
                // 1) wait for the incoming `ready` event and send the initialization data.
                // 2) wait for the incoming `initialized` event.
                return new winjs_base_1.TPromise(function (resolve, reject) {
                    var handle = setTimeout(function () {
                        reject('timeout');
                    }, 60 * 1000);
                    var disposable = protocol.onMessage(function (msg) {
                        if (msg === 'ready') {
                            // 1) Extension Host is ready to receive messages, initialize it
                            _this._createExtHostInitData().then(function (data) { return protocol.send(JSON.stringify(data)); });
                            return;
                        }
                        if (msg === 'initialized') {
                            // 2) Extension Host is initialized
                            clearTimeout(handle);
                            // stop listening for messages here
                            disposable.dispose();
                            // release this promise
                            resolve(protocol);
                            return;
                        }
                        console.error("received unexpected message during handshake phase from the extension host: ", msg);
                    });
                });
            });
        };
        ExtensionHostProcessWorker.prototype._createExtHostInitData = function () {
            var _this = this;
            return winjs_base_1.TPromise.join([this._telemetryService.getTelemetryInfo(), this._extensionService.getExtensions()]).then(function (_a) {
                var telemetryInfo = _a[0], extensionDescriptions = _a[1];
                var configurationData = __assign({}, _this._configurationService.getConfigurationData(), { configurationScopes: {} });
                var r = {
                    parentPid: process.pid,
                    environment: {
                        isExtensionDevelopmentDebug: _this._isExtensionDevDebug,
                        appRoot: _this._environmentService.appRoot,
                        appSettingsHome: _this._environmentService.appSettingsHome,
                        disableExtensions: _this._environmentService.disableExtensions,
                        userExtensionsHome: _this._environmentService.extensionsPath,
                        extensionDevelopmentPath: _this._environmentService.extensionDevelopmentPath,
                        extensionTestsPath: _this._environmentService.extensionTestsPath,
                        // globally disable proposed api when built and not insiders developing extensions
                        enableProposedApiForAll: !_this._environmentService.isBuilt || (!!_this._environmentService.extensionDevelopmentPath && product_1.default.nameLong.indexOf('Insiders') >= 0),
                        enableProposedApiFor: _this._environmentService.args['enable-proposed-api'] || []
                    },
                    workspace: _this._contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY ? null : _this._contextService.getWorkspace(),
                    extensions: extensionDescriptions,
                    // Send configurations scopes only in development mode.
                    configuration: !_this._environmentService.isBuilt || _this._environmentService.isExtensionDevelopment ? __assign({}, configurationData, { configurationScopes: configurationRegistry_1.getScopes() }) : configurationData,
                    telemetryInfo: telemetryInfo,
                    args: _this._environmentService.args,
                    execPath: _this._environmentService.execPath,
                    windowId: _this._windowService.getCurrentWindowId(),
                    logLevel: _this._logService.getLevel()
                };
                return r;
            });
        };
        ExtensionHostProcessWorker.prototype._logExtensionHostMessage = function (entry) {
            // Send to local console unless we run tests from cli
            if (!this._isExtensionDevTestFromCli) {
                console_1.log(entry, 'Extension Host');
            }
            // Log on main side if running tests from cli
            if (this._isExtensionDevTestFromCli) {
                (_a = this._windowsService).log.apply(_a, [entry.severity].concat(console_1.parse(entry).args));
            }
            else if (!this._environmentService.isBuilt || this._isExtensionDevHost) {
                this._broadcastService.broadcast({
                    channel: extensionHost_1.EXTENSION_LOG_BROADCAST_CHANNEL,
                    payload: {
                        logEntry: entry,
                        debugId: this._environmentService.debugExtensionHost.debugId
                    }
                });
            }
            var _a;
        };
        ExtensionHostProcessWorker.prototype._onExtHostProcessError = function (err) {
            var errorMessage = errorMessage_1.toErrorMessage(err);
            if (errorMessage === this._lastExtensionHostError) {
                return; // prevent error spam
            }
            this._lastExtensionHostError = errorMessage;
            this._messageService.show(message_1.Severity.Error, nls.localize('extensionHostProcess.error', "Error from the extension host: {0}", errorMessage));
        };
        ExtensionHostProcessWorker.prototype._onExtHostProcessExit = function (code, signal) {
            if (this._terminating) {
                // Expected termination path (we asked the process to terminate)
                return;
            }
            // Unexpected termination
            if (!this._isExtensionDevHost) {
                this._onCrashed.fire([code, signal]);
            }
            else if (!this._isExtensionDevTestFromCli) {
                this._windowService.closeWindow();
            }
            else {
                electron_1.ipcRenderer.send('vscode:exit', code);
            }
        };
        ExtensionHostProcessWorker.prototype.getInspectPort = function () {
            return this._inspectPort;
        };
        ExtensionHostProcessWorker.prototype.terminate = function () {
            var _this = this;
            if (this._terminating) {
                return;
            }
            this._terminating = true;
            lifecycle_2.dispose(this._toDispose);
            if (!this._messageProtocol) {
                // .start() was not called
                return;
            }
            this._messageProtocol.then(function (protocol) {
                // Send the extension host a request to terminate itself
                // (graceful termination)
                protocol.send({
                    type: '__$terminate'
                });
                // Give the extension host 60s, after which we will
                // try to kill the process and release any resources
                setTimeout(function () { return _this._cleanResources(); }, 60 * 1000);
            }, function (err) {
                // Establishing a protocol with the extension host failed, so
                // try to kill the process and release any resources.
                _this._cleanResources();
            });
        };
        ExtensionHostProcessWorker.prototype._cleanResources = function () {
            if (this._namedPipeServer) {
                this._namedPipeServer.close();
                this._namedPipeServer = null;
            }
            if (this._extensionHostConnection) {
                this._extensionHostConnection.end();
                this._extensionHostConnection = null;
            }
            if (this._extensionHostProcess) {
                this._extensionHostProcess.kill();
                this._extensionHostProcess = null;
            }
        };
        ExtensionHostProcessWorker.prototype._onWillShutdown = function (event) {
            // If the extension development host was started without debugger attached we need
            // to communicate this back to the main side to terminate the debug session
            if (this._isExtensionDevHost && !this._isExtensionDevTestFromCli && !this._isExtensionDevDebug) {
                this._broadcastService.broadcast({
                    channel: extensionHost_1.EXTENSION_TERMINATE_BROADCAST_CHANNEL,
                    payload: {
                        debugId: this._environmentService.debugExtensionHost.debugId
                    }
                });
                event.veto(winjs_base_1.TPromise.timeout(100 /* wait a bit for IPC to get delivered */).then(function () { return false; }));
            }
        };
        ExtensionHostProcessWorker = __decorate([
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, message_1.IMessageService),
            __param(3, windows_1.IWindowsService),
            __param(4, windows_1.IWindowService),
            __param(5, broadcastService_1.IBroadcastService),
            __param(6, lifecycle_1.ILifecycleService),
            __param(7, environment_1.IEnvironmentService),
            __param(8, configuration_1.IWorkspaceConfigurationService),
            __param(9, telemetry_1.ITelemetryService),
            __param(10, crashReporterService_1.ICrashReporterService),
            __param(11, log_1.ILogService)
        ], ExtensionHostProcessWorker);
        return ExtensionHostProcessWorker;
    }());
    exports.ExtensionHostProcessWorker = ExtensionHostProcessWorker;
});
