/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/winjs.base", "vs/base/common/event"], function (require, exports, platform, winjs_base_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SHELL_EXECUTABLES = ['cmd.exe', 'powershell.exe', 'bash.exe'];
    var windowsProcessTree;
    var WindowsShellHelper = /** @class */ (function () {
        function WindowsShellHelper(_rootProcessId, _terminalInstance, _xterm) {
            var _this = this;
            this._rootProcessId = _rootProcessId;
            this._terminalInstance = _terminalInstance;
            this._xterm = _xterm;
            if (!platform.isWindows) {
                throw new Error("WindowsShellHelper cannot be instantiated on " + platform.platform);
            }
            if (!windowsProcessTree) {
                windowsProcessTree = require.__$__nodeRequire('windows-process-tree');
            }
            this._isDisposed = false;
            this._onCheckShell = new event_1.Emitter();
            // The debounce is necessary to prevent multiple processes from spawning when
            // the enter key or output is spammed
            event_1.debounceEvent(this._onCheckShell.event, function (l, e) { return e; }, 150, true)(function () {
                setTimeout(function () {
                    _this.checkShell();
                }, 50);
            });
            // We want to fire a new check for the shell on a linefeed, but only
            // when parsing has finished which is indicated by the cursormove event.
            // If this is done on every linefeed, parsing ends up taking
            // significantly longer due to resetting timers. Note that this is
            // private API.
            this._xterm.on('linefeed', function () { return _this._newLineFeed = true; });
            this._xterm.on('cursormove', function () {
                if (_this._newLineFeed) {
                    _this._onCheckShell.fire();
                }
            });
            // Fire a new check for the shell when any key is pressed.
            this._xterm.on('keypress', function () { return _this._onCheckShell.fire(); });
        }
        WindowsShellHelper.prototype.checkShell = function () {
            var _this = this;
            if (platform.isWindows && this._terminalInstance.isTitleSetByProcess) {
                this.getShellName().then(function (title) {
                    if (!_this._isDisposed) {
                        _this._terminalInstance.setTitle(title, true);
                    }
                });
            }
        };
        WindowsShellHelper.prototype.traverseTree = function (tree) {
            if (!tree) {
                return '';
            }
            if (SHELL_EXECUTABLES.indexOf(tree.name) === -1) {
                return tree.name;
            }
            if (!tree.children || tree.children.length === 0) {
                return tree.name;
            }
            var favouriteChild = 0;
            for (; favouriteChild < tree.children.length; favouriteChild++) {
                var child = tree.children[favouriteChild];
                if (!child.children || child.children.length === 0) {
                    break;
                }
                if (child.children[0].name !== 'conhost.exe') {
                    break;
                }
            }
            if (favouriteChild >= tree.children.length) {
                return tree.name;
            }
            return this.traverseTree(tree.children[favouriteChild]);
        };
        WindowsShellHelper.prototype.dispose = function () {
            this._isDisposed = true;
        };
        /**
         * Returns the innermost shell executable running in the terminal
         */
        WindowsShellHelper.prototype.getShellName = function () {
            var _this = this;
            if (this._isDisposed) {
                return winjs_base_1.TPromise.as('');
            }
            // Prevent multiple requests at once, instead return current request
            if (this._currentRequest) {
                return this._currentRequest;
            }
            this._currentRequest = new winjs_base_1.TPromise(function (resolve) {
                windowsProcessTree(_this._rootProcessId, function (tree) {
                    var name = _this.traverseTree(tree);
                    _this._currentRequest = null;
                    resolve(name);
                });
            });
            return this._currentRequest;
        };
        return WindowsShellHelper;
    }());
    exports.WindowsShellHelper = WindowsShellHelper;
});
