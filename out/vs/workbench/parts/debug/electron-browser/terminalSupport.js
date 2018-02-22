/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/platform", "child_process", "vs/base/common/winjs.base"], function (require, exports, nls, platform, cp, winjs_base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ShellType;
    (function (ShellType) {
        ShellType[ShellType["cmd"] = 0] = "cmd";
        ShellType[ShellType["powershell"] = 1] = "powershell";
        ShellType[ShellType["bash"] = 2] = "bash";
    })(ShellType || (ShellType = {}));
    var TerminalSupport = /** @class */ (function () {
        function TerminalSupport() {
        }
        TerminalSupport.runInTerminal = function (terminalService, nativeTerminalService, configurationService, args, response) {
            if (args.kind === 'external') {
                return nativeTerminalService.runInTerminal(args.title, args.cwd, args.args, args.env || {});
            }
            if (!TerminalSupport.terminalDisposedListener) {
                // React on terminal disposed and check if that is the debug terminal #12956
                TerminalSupport.terminalDisposedListener = terminalService.onInstanceDisposed(function (terminal) {
                    if (TerminalSupport.integratedTerminalInstance && TerminalSupport.integratedTerminalInstance.id === terminal.id) {
                        TerminalSupport.integratedTerminalInstance = null;
                    }
                });
            }
            var t = TerminalSupport.integratedTerminalInstance;
            if ((t && this.isBusy(t)) || !t) {
                t = terminalService.createInstance({ name: args.title || nls.localize('debug.terminal.title', "debuggee") });
                TerminalSupport.integratedTerminalInstance = t;
            }
            terminalService.setActiveInstance(t);
            terminalService.showPanel(true);
            var command = this.prepareCommand(args, configurationService);
            t.sendText(command, true);
            return winjs_base_1.TPromise.as(void 0);
        };
        TerminalSupport.isBusy = function (t) {
            if (t.processId) {
                try {
                    // if shell has at least one child process, assume that shell is busy
                    if (platform.isWindows) {
                        var result = cp.spawnSync('wmic', ['process', 'get', 'ParentProcessId']);
                        if (result.stdout) {
                            var pids = result.stdout.toString().split('\r\n');
                            return pids.some(function (p) { return parseInt(p) === t.processId; });
                        }
                    }
                    else {
                        var result = cp.spawnSync('/usr/bin/pgrep', ['-P', String(t.processId)]);
                        if (result.stdout) {
                            return result.stdout.toString().trim().length > 0;
                        }
                    }
                }
                catch (e) {
                    // silently ignore
                }
            }
            // fall back to safe side
            return true;
        };
        TerminalSupport.prepareCommand = function (args, configurationService) {
            var shellType;
            // get the shell configuration for the current platform
            var shell;
            var shell_config = configurationService.getValue().terminal.integrated.shell;
            if (platform.isWindows) {
                shell = shell_config.windows;
                shellType = 0 /* cmd */;
            }
            else if (platform.isLinux) {
                shell = shell_config.linux;
                shellType = 2 /* bash */;
            }
            else if (platform.isMacintosh) {
                shell = shell_config.osx;
                shellType = 2 /* bash */;
            }
            // try to determine the shell type
            shell = shell.trim().toLowerCase();
            if (shell.indexOf('powershell') >= 0) {
                shellType = 1 /* powershell */;
            }
            else if (shell.indexOf('cmd.exe') >= 0) {
                shellType = 0 /* cmd */;
            }
            else if (shell.indexOf('bash') >= 0) {
                shellType = 2 /* bash */;
            }
            else if (shell.indexOf('git\\bin\\bash.exe') >= 0) {
                shellType = 2 /* bash */;
            }
            var quote;
            var command = '';
            switch (shellType) {
                case 1 /* powershell */:
                    quote = function (s) {
                        s = s.replace(/\'/g, '\'\'');
                        return "'" + s + "'";
                        //return s.indexOf(' ') >= 0 || s.indexOf('\'') >= 0 || s.indexOf('"') >= 0 ? `'${s}'` : s;
                    };
                    if (args.cwd) {
                        command += "cd '" + args.cwd + "'; ";
                    }
                    if (args.env) {
                        for (var key in args.env) {
                            var value = args.env[key];
                            if (value === null) {
                                command += "Remove-Item env:" + key + "; ";
                            }
                            else {
                                command += "${env:" + key + "}='" + value + "'; ";
                            }
                        }
                    }
                    if (args.args && args.args.length > 0) {
                        var cmd = quote(args.args.shift());
                        command += (cmd[0] === '\'') ? "& " + cmd + " " : cmd + " ";
                        for (var _i = 0, _a = args.args; _i < _a.length; _i++) {
                            var a = _a[_i];
                            command += quote(a) + " ";
                        }
                    }
                    break;
                case 0 /* cmd */:
                    quote = function (s) {
                        s = s.replace(/\"/g, '""');
                        return (s.indexOf(' ') >= 0 || s.indexOf('"') >= 0) ? "\"" + s + "\"" : s;
                    };
                    if (args.cwd) {
                        command += "cd " + quote(args.cwd) + " && ";
                    }
                    if (args.env) {
                        command += 'cmd /C "';
                        for (var key in args.env) {
                            var value = args.env[key];
                            if (value === null) {
                                command += "set \"" + key + "=\" && ";
                            }
                            else {
                                command += "set \"" + key + "=" + args.env[key] + "\" && ";
                            }
                        }
                    }
                    for (var _b = 0, _c = args.args; _b < _c.length; _b++) {
                        var a = _c[_b];
                        command += quote(a) + " ";
                    }
                    if (args.env) {
                        command += '"';
                    }
                    break;
                case 2 /* bash */:
                    quote = function (s) {
                        s = s.replace(/\"/g, '\\"');
                        return (s.indexOf(' ') >= 0 || s.indexOf('\\') >= 0) ? "\"" + s + "\"" : s;
                    };
                    if (args.cwd) {
                        command += "cd " + quote(args.cwd) + " ; ";
                    }
                    if (args.env) {
                        command += 'env';
                        for (var key in args.env) {
                            var value = args.env[key];
                            if (value === null) {
                                command += " -u \"" + key + "\"";
                            }
                            else {
                                command += " \"" + key + "=" + value + "\"";
                            }
                        }
                        command += ' ';
                    }
                    for (var _d = 0, _e = args.args; _d < _e.length; _d++) {
                        var a = _e[_d];
                        command += quote(a) + " ";
                    }
                    break;
            }
            return command;
        };
        return TerminalSupport;
    }());
    exports.TerminalSupport = TerminalSupport;
});
