/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/workbench/node/extensionHostMain", "vs/base/parts/ipc/node/ipc.net", "net", "vs/base/common/event"], function (require, exports, errors_1, extensionHostMain_1, ipc_net_1, net_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // This calls exit directly in case the initialization is not finished and we need to exit
    // Otherwise, if initialization completed we go to extensionHostMain.terminate()
    var onTerminate = function () {
        extensionHostMain_1.exit();
    };
    function createExtHostProtocol() {
        var pipeName = process.env.VSCODE_IPC_HOOK_EXTHOST;
        return new Promise(function (resolve, reject) {
            var socket = net_1.createConnection(pipeName, function () {
                socket.removeListener('error', reject);
                resolve(new ipc_net_1.Protocol(socket));
            });
            socket.once('error', reject);
        }).then(function (protocol) {
            return new /** @class */ (function () {
                function class_1() {
                    var _this = this;
                    this._terminating = false;
                    this.onMessage = event_1.filterEvent(protocol.onMessage, function (msg) {
                        if (msg.type !== '__$terminate') {
                            return true;
                        }
                        _this._terminating = true;
                        onTerminate();
                        return false;
                    });
                }
                class_1.prototype.send = function (msg) {
                    if (!this._terminating) {
                        protocol.send(msg);
                    }
                };
                return class_1;
            }());
        });
    }
    function connectToRenderer(protocol) {
        return new Promise(function (c, e) {
            // Listen init data message
            var first = protocol.onMessage(function (raw) {
                first.dispose();
                var initData = JSON.parse(raw);
                // Print a console message when rejection isn't handled within N seconds. For details:
                // see https://nodejs.org/api/process.html#process_event_unhandledrejection
                // and https://nodejs.org/api/process.html#process_event_rejectionhandled
                var unhandledPromises = [];
                process.on('unhandledRejection', function (reason, promise) {
                    unhandledPromises.push(promise);
                    setTimeout(function () {
                        var idx = unhandledPromises.indexOf(promise);
                        if (idx >= 0) {
                            unhandledPromises.splice(idx, 1);
                            console.warn('rejected promise not handled within 1 second');
                            errors_1.onUnexpectedError(reason);
                        }
                    }, 1000);
                });
                process.on('rejectionHandled', function (promise) {
                    var idx = unhandledPromises.indexOf(promise);
                    if (idx >= 0) {
                        unhandledPromises.splice(idx, 1);
                    }
                });
                // Print a console message when an exception isn't handled.
                process.on('uncaughtException', function (err) {
                    errors_1.onUnexpectedError(err);
                });
                // Kill oneself if one's parent dies. Much drama.
                setInterval(function () {
                    try {
                        process.kill(initData.parentPid, 0); // throws an exception if the main process doesn't exist anymore.
                    }
                    catch (e) {
                        onTerminate();
                    }
                }, 5000);
                // Tell the outside that we are initialized
                protocol.send('initialized');
                c({ protocol: protocol, initData: initData });
            });
            // Tell the outside that we are ready to receive messages
            protocol.send('ready');
        });
    }
    patchExecArgv();
    createExtHostProtocol().then(function (protocol) {
        // connect to main side
        return connectToRenderer(protocol);
    }).then(function (renderer) {
        // setup things
        var extensionHostMain = new extensionHostMain_1.ExtensionHostMain(renderer.protocol, renderer.initData);
        onTerminate = function () { return extensionHostMain.terminate(); };
        return extensionHostMain.start();
    }).catch(function (err) { return console.error(err); });
    function patchExecArgv() {
        // when encountering the prevent-inspect flag we delete this
        // and the prior flag
        if (process.env.VSCODE_PREVENT_FOREIGN_INSPECT) {
            for (var i = 0; i < process.execArgv.length; i++) {
                if (process.execArgv[i].match(/--inspect-brk=\d+|--inspect=\d+/)) {
                    process.execArgv.splice(i, 1);
                    break;
                }
            }
        }
    }
});
