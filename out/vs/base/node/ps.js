/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "path", "vs/nls", "vs/base/common/uri"], function (require, exports, child_process_1, path, nls, uri_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function listProcesses(rootPid) {
        return new Promise(function (resolve, reject) {
            var rootItem;
            var map = new Map();
            function addToTree(pid, ppid, cmd, load, mem) {
                var parent = map.get(ppid);
                if (pid === rootPid || parent) {
                    var item = {
                        name: findName(cmd),
                        cmd: cmd,
                        pid: pid,
                        ppid: ppid,
                        load: load,
                        mem: mem
                    };
                    map.set(pid, item);
                    if (pid === rootPid) {
                        rootItem = item;
                    }
                    if (parent) {
                        if (!parent.children) {
                            parent.children = [];
                        }
                        parent.children.push(item);
                        if (parent.children.length > 1) {
                            parent.children = parent.children.sort(function (a, b) { return a.pid - b.pid; });
                        }
                    }
                }
            }
            function findName(cmd) {
                var RENDERER_PROCESS_HINT = /--disable-blink-features=Auxclick/;
                var WINDOWS_WATCHER_HINT = /\\watcher\\win32\\CodeHelper\.exe/;
                var WINDOWS_CRASH_REPORTER = /--crashes-directory/;
                var WINDOWS_PTY = /\\pipe\\winpty-control/;
                var WINDOWS_CONSOLE_HOST = /conhost\.exe/;
                var TYPE = /--type=([a-zA-Z-]+)/;
                // find windows file watcher
                if (WINDOWS_WATCHER_HINT.exec(cmd)) {
                    return 'watcherService ';
                }
                // find windows crash reporter
                if (WINDOWS_CRASH_REPORTER.exec(cmd)) {
                    return 'electron-crash-reporter';
                }
                // find windows pty process
                if (WINDOWS_PTY.exec(cmd)) {
                    return 'winpty-process';
                }
                //find windows console host process
                if (WINDOWS_CONSOLE_HOST.exec(cmd)) {
                    return 'console-window-host (Windows internal process)';
                }
                // find "--type=xxxx"
                var matches = TYPE.exec(cmd);
                if (matches && matches.length === 2) {
                    if (matches[1] === 'renderer') {
                        if (!RENDERER_PROCESS_HINT.exec(cmd)) {
                            return 'shared-process';
                        }
                        return "window";
                    }
                    return matches[1];
                }
                // find all xxxx.js
                var JS = /[a-zA-Z-]+\.js/g;
                var result = '';
                do {
                    matches = JS.exec(cmd);
                    if (matches) {
                        result += matches + ' ';
                    }
                } while (matches);
                if (result) {
                    if (cmd.indexOf('node ') !== 0) {
                        return "electron_node " + result;
                    }
                }
                return cmd;
            }
            if (process.platform === 'win32') {
                console.log(nls.localize('collecting', 'Collecting CPU and memory information. This might take a couple of seconds.'));
                var cleanUNCPrefix_1 = function (value) {
                    if (value.indexOf('\\\\?\\') === 0) {
                        return value.substr(4);
                    }
                    else if (value.indexOf('\\??\\') === 0) {
                        return value.substr(4);
                    }
                    else if (value.indexOf('"\\\\?\\') === 0) {
                        return '"' + value.substr(5);
                    }
                    else if (value.indexOf('"\\??\\') === 0) {
                        return '"' + value.substr(5);
                    }
                    else {
                        return value;
                    }
                };
                var execMain = path.basename(process.execPath);
                var script = uri_1.default.parse(require.toUrl('vs/base/node/ps-win.ps1')).fsPath;
                var commandLine = "& {& '" + script + "' -ProcessName '" + execMain + "' -MaxSamples 3}";
                var cmd = child_process_1.spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', commandLine]);
                var stdout_1 = '';
                var stderr_1 = '';
                cmd.stdout.on('data', function (data) {
                    stdout_1 += data.toString();
                });
                cmd.stderr.on('data', function (data) {
                    stderr_1 += data.toString();
                });
                cmd.on('exit', function () {
                    if (stderr_1.length > 0) {
                        reject(new Error(stderr_1));
                        return;
                    }
                    var processItems = new Map();
                    try {
                        var items = JSON.parse(stdout_1);
                        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                            var item = items_1[_i];
                            if (item.type === 'processInfo') {
                                var load = 0;
                                if (item.cpuLoad) {
                                    for (var _a = 0, _b = item.cpuLoad; _a < _b.length; _a++) {
                                        var value = _b[_a];
                                        load += value;
                                    }
                                    load = load / item.cpuLoad.length;
                                }
                                else {
                                    load = -1;
                                }
                                var commandLine_1 = cleanUNCPrefix_1(item.commandLine);
                                processItems.set(item.processId, {
                                    name: findName(commandLine_1),
                                    cmd: commandLine_1,
                                    pid: item.processId,
                                    ppid: item.parentProcessId,
                                    load: load,
                                    mem: item.workingSetSize
                                });
                            }
                        }
                        rootItem = processItems.get(rootPid);
                        if (rootItem) {
                            processItems.forEach(function (item) {
                                var parent = processItems.get(item.ppid);
                                if (parent) {
                                    if (!parent.children) {
                                        parent.children = [];
                                    }
                                    parent.children.push(item);
                                }
                            });
                            processItems.forEach(function (item) {
                                if (item.children) {
                                    item.children = item.children.sort(function (a, b) { return a.pid - b.pid; });
                                }
                            });
                            resolve(rootItem);
                        }
                        else {
                            reject(new Error("Root process " + rootPid + " not found"));
                        }
                    }
                    catch (error) {
                        console.log(stdout_1);
                        reject(error);
                    }
                });
            }
            else {
                var CMD = '/bin/ps -ax -o pid=,ppid=,pcpu=,pmem=,command=';
                var PID_CMD_1 = /^\s*([0-9]+)\s+([0-9]+)\s+([0-9]+\.[0-9]+)\s+([0-9]+\.[0-9]+)\s+(.+)$/;
                child_process_1.exec(CMD, { maxBuffer: 1000 * 1024 }, function (err, stdout, stderr) {
                    if (err || stderr) {
                        reject(err || stderr.toString());
                    }
                    else {
                        var lines = stdout.toString().split('\n');
                        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                            var line = lines_1[_i];
                            var matches = PID_CMD_1.exec(line.trim());
                            if (matches && matches.length === 6) {
                                addToTree(parseInt(matches[1]), parseInt(matches[2]), matches[5], parseFloat(matches[3]), parseFloat(matches[4]));
                            }
                        }
                        resolve(rootItem);
                    }
                });
            }
        });
    }
    exports.listProcesses = listProcesses;
});
