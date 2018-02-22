define(["require", "exports", "vs/base/common/event", "./extHost.protocol"], function (require, exports, event_1, extHost_protocol_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostTerminal = /** @class */ (function () {
        function ExtHostTerminal(proxy, name, shellPath, shellArgs, cwd, env, waitOnExit) {
            var _this = this;
            this._name = name;
            this._queuedRequests = [];
            this._proxy = proxy;
            this._pidPromise = new Promise(function (c) {
                _this._pidPromiseComplete = c;
            });
            this._proxy.$createTerminal(name, shellPath, shellArgs, cwd, env, waitOnExit).then(function (id) {
                _this._id = id;
                _this._queuedRequests.forEach(function (r) {
                    r.run(_this._proxy, _this._id);
                });
                _this._queuedRequests = [];
            });
        }
        Object.defineProperty(ExtHostTerminal.prototype, "name", {
            get: function () {
                this._checkDisposed();
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostTerminal.prototype, "processId", {
            get: function () {
                this._checkDisposed();
                return this._pidPromise;
            },
            enumerable: true,
            configurable: true
        });
        ExtHostTerminal.prototype.sendText = function (text, addNewLine) {
            if (addNewLine === void 0) { addNewLine = true; }
            this._checkDisposed();
            this._queueApiRequest(this._proxy.$sendText, [text, addNewLine]);
        };
        ExtHostTerminal.prototype.show = function (preserveFocus) {
            this._checkDisposed();
            this._queueApiRequest(this._proxy.$show, [preserveFocus]);
        };
        ExtHostTerminal.prototype.hide = function () {
            this._checkDisposed();
            this._queueApiRequest(this._proxy.$hide, []);
        };
        ExtHostTerminal.prototype.dispose = function () {
            if (!this._disposed) {
                this._disposed = true;
                this._queueApiRequest(this._proxy.$dispose, []);
            }
        };
        ExtHostTerminal.prototype._setProcessId = function (processId) {
            this._pidPromiseComplete(processId);
            this._pidPromiseComplete = null;
        };
        ExtHostTerminal.prototype._queueApiRequest = function (callback, args) {
            var request = new ApiRequest(callback, args);
            if (!this._id) {
                this._queuedRequests.push(request);
                return;
            }
            request.run(this._proxy, this._id);
        };
        ExtHostTerminal.prototype._checkDisposed = function () {
            if (this._disposed) {
                throw new Error('Terminal has already been disposed');
            }
        };
        return ExtHostTerminal;
    }());
    exports.ExtHostTerminal = ExtHostTerminal;
    var ExtHostTerminalService = /** @class */ (function () {
        function ExtHostTerminalService(mainContext) {
            this._onDidCloseTerminal = new event_1.Emitter();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadTerminalService);
            this._terminals = [];
        }
        ExtHostTerminalService.prototype.createTerminal = function (name, shellPath, shellArgs) {
            var terminal = new ExtHostTerminal(this._proxy, name, shellPath, shellArgs);
            this._terminals.push(terminal);
            return terminal;
        };
        ExtHostTerminalService.prototype.createTerminalFromOptions = function (options) {
            var terminal = new ExtHostTerminal(this._proxy, options.name, options.shellPath, options.shellArgs, options.cwd, options.env /*, options.waitOnExit*/);
            this._terminals.push(terminal);
            return terminal;
        };
        Object.defineProperty(ExtHostTerminalService.prototype, "onDidCloseTerminal", {
            get: function () {
                return this._onDidCloseTerminal && this._onDidCloseTerminal.event;
            },
            enumerable: true,
            configurable: true
        });
        ExtHostTerminalService.prototype.$acceptTerminalClosed = function (id) {
            var index = this._getTerminalIndexById(id);
            if (index === null) {
                // The terminal was not created by the terminal API, ignore it
                return;
            }
            var terminal = this._terminals.splice(index, 1)[0];
            this._onDidCloseTerminal.fire(terminal);
        };
        ExtHostTerminalService.prototype.$acceptTerminalProcessId = function (id, processId) {
            var terminal = this._getTerminalById(id);
            if (terminal) {
                terminal._setProcessId(processId);
            }
        };
        ExtHostTerminalService.prototype._getTerminalById = function (id) {
            var index = this._getTerminalIndexById(id);
            return index !== null ? this._terminals[index] : null;
        };
        ExtHostTerminalService.prototype._getTerminalIndexById = function (id) {
            var index = null;
            this._terminals.some(function (terminal, i) {
                var thisId = terminal._id;
                if (thisId === id) {
                    index = i;
                    return true;
                }
                return false;
            });
            return index;
        };
        return ExtHostTerminalService;
    }());
    exports.ExtHostTerminalService = ExtHostTerminalService;
    var ApiRequest = /** @class */ (function () {
        function ApiRequest(callback, args) {
            this._callback = callback;
            this._args = args;
        }
        ApiRequest.prototype.run = function (proxy, id) {
            this._callback.apply(proxy, [id].concat(this._args));
        };
        return ApiRequest;
    }());
});
