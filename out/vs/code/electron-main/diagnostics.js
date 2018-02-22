/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/node/stats", "vs/base/node/ps", "vs/platform/node/product", "vs/platform/node/package", "os", "vs/base/node/id", "vs/base/common/strings", "vs/base/common/platform", "electron", "path"], function (require, exports, stats_1, ps_1, product_1, package_1, os, id_1, strings_1, platform_1, electron_1, path_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getPerformanceInfo(info) {
        return ps_1.listProcesses(info.mainPID).then(function (rootProcess) {
            var workspaceInfoMessages = [];
            // Workspace Stats
            if (info.windows.some(function (window) { return window.folders && window.folders.length > 0; })) {
                info.windows.forEach(function (window) {
                    if (window.folders.length === 0) {
                        return;
                    }
                    workspaceInfoMessages.push("|  Window (" + window.title + ")");
                    window.folders.forEach(function (folder) {
                        try {
                            var stats = stats_1.collectWorkspaceStats(folder, ['node_modules', '.git']);
                            var countMessage = stats.fileCount + " files";
                            if (stats.maxFilesReached) {
                                countMessage = "more than " + countMessage;
                            }
                            workspaceInfoMessages.push("|    Folder (" + path_1.basename(folder) + "): " + countMessage);
                            workspaceInfoMessages.push(formatWorkspaceStats(stats));
                            var launchConfigs = stats_1.collectLaunchConfigs(folder);
                            if (launchConfigs.length > 0) {
                                workspaceInfoMessages.push(formatLaunchConfigs(launchConfigs));
                            }
                        }
                        catch (error) {
                            workspaceInfoMessages.push("|      Error: Unable to collect workpsace stats for folder " + folder + " (" + error.toString() + ")");
                        }
                    });
                });
            }
            return {
                processInfo: getProcessList(info, rootProcess),
                workspaceInfo: workspaceInfoMessages.join('\n')
            };
        });
    }
    exports.getPerformanceInfo = getPerformanceInfo;
    function getSystemInfo(info) {
        var MB = 1024 * 1024;
        var GB = 1024 * MB;
        var systemInfo = {
            'Memory (System)': (os.totalmem() / GB).toFixed(2) + "GB (" + (os.freemem() / GB).toFixed(2) + "GB free)",
            VM: Math.round((id_1.virtualMachineHint.value() * 100)) + "%",
            'Screen Reader': "" + (electron_1.app.isAccessibilitySupportEnabled() ? 'yes' : 'no'),
            'Process Argv': "" + info.mainArguments.join(' ')
        };
        var cpus = os.cpus();
        if (cpus && cpus.length > 0) {
            systemInfo.CPUs = cpus[0].model + " (" + cpus.length + " x " + cpus[0].speed + ")";
        }
        if (!platform_1.isWindows) {
            systemInfo['Load (avg)'] = "" + os.loadavg().map(function (l) { return Math.round(l); }).join(', ');
        }
        return systemInfo;
    }
    exports.getSystemInfo = getSystemInfo;
    function printDiagnostics(info) {
        return ps_1.listProcesses(info.mainPID).then(function (rootProcess) {
            // Environment Info
            console.log('');
            console.log(formatEnvironment(info));
            // Process List
            console.log('');
            console.log(formatProcessList(info, rootProcess));
            // Workspace Stats
            if (info.windows.some(function (window) { return window.folders && window.folders.length > 0; })) {
                console.log('');
                console.log('Workspace Stats: ');
                info.windows.forEach(function (window) {
                    if (window.folders.length === 0) {
                        return;
                    }
                    console.log("|  Window (" + window.title + ")");
                    window.folders.forEach(function (folder) {
                        try {
                            var stats = stats_1.collectWorkspaceStats(folder, ['node_modules', '.git']);
                            var countMessage = stats.fileCount + " files";
                            if (stats.maxFilesReached) {
                                countMessage = "more than " + countMessage;
                            }
                            console.log("|    Folder (" + path_1.basename(folder) + "): " + countMessage);
                            console.log(formatWorkspaceStats(stats));
                            var launchConfigs = stats_1.collectLaunchConfigs(folder);
                            if (launchConfigs.length > 0) {
                                console.log(formatLaunchConfigs(launchConfigs));
                            }
                        }
                        catch (error) {
                            console.log("|      Error: Unable to collect workpsace stats for folder " + folder + " (" + error.toString() + ")");
                        }
                    });
                });
            }
            console.log('');
            console.log('');
        });
    }
    exports.printDiagnostics = printDiagnostics;
    function formatWorkspaceStats(workspaceStats) {
        var output = [];
        var lineLength = 60;
        var col = 0;
        var appendAndWrap = function (name, count) {
            var item = " " + name + "(" + count + ")";
            if (col + item.length > lineLength) {
                output.push(line);
                line = '|                 ';
                col = line.length;
            }
            else {
                col += item.length;
            }
            line += item;
        };
        // File Types
        var line = '|      File types:';
        var maxShown = 10;
        var max = workspaceStats.fileTypes.length > maxShown ? maxShown : workspaceStats.fileTypes.length;
        for (var i = 0; i < max; i++) {
            var item = workspaceStats.fileTypes[i];
            appendAndWrap(item.name, item.count);
        }
        output.push(line);
        // Conf Files
        if (workspaceStats.configFiles.length >= 0) {
            line = '|      Conf files:';
            col = 0;
            workspaceStats.configFiles.forEach(function (item) {
                appendAndWrap(item.name, item.count);
            });
            output.push(line);
        }
        return output.join('\n');
    }
    function formatLaunchConfigs(configs) {
        var output = [];
        var line = '|      Launch Configs:';
        configs.forEach(function (each) {
            var item = each.count > 1 ? " " + each.name + "(" + each.count + ")" : " " + each.name;
            line += item;
        });
        output.push(line);
        return output.join('\n');
    }
    function getProcessList(info, rootProcess) {
        var mapPidToWindowTitle = new Map();
        info.windows.forEach(function (window) { return mapPidToWindowTitle.set(window.pid, window.title); });
        var processes = [];
        if (rootProcess) {
            getProcessItem(mapPidToWindowTitle, processes, rootProcess, 0);
        }
        return processes;
    }
    function getProcessItem(mapPidToWindowTitle, processes, item, indent) {
        var isRoot = (indent === 0);
        var MB = 1024 * 1024;
        // Format name with indent
        var name;
        if (isRoot) {
            name = product_1.default.applicationName + " main";
        }
        else {
            name = strings_1.repeat('--', indent) + " " + item.name;
            if (item.name === 'window') {
                name = name + " (" + mapPidToWindowTitle.get(item.pid) + ")";
            }
        }
        var memory = process.platform === 'win32' ? item.mem : (os.totalmem() * (item.mem / 100));
        processes.push({
            cpu: Number(item.load.toFixed(0)),
            memory: Number((memory / MB).toFixed(0)),
            pid: Number((item.pid).toFixed(0)),
            name: name
        });
        // Recurse into children if any
        if (Array.isArray(item.children)) {
            item.children.forEach(function (child) { return getProcessItem(mapPidToWindowTitle, processes, child, indent + 1); });
        }
    }
    function formatEnvironment(info) {
        var MB = 1024 * 1024;
        var GB = 1024 * MB;
        var output = [];
        output.push("Version:          " + package_1.default.name + " " + package_1.default.version + " (" + (product_1.default.commit || 'Commit unknown') + ", " + (product_1.default.date || 'Date unknown') + ")");
        output.push("OS Version:       " + os.type() + " " + os.arch() + " " + os.release());
        var cpus = os.cpus();
        if (cpus && cpus.length > 0) {
            output.push("CPUs:             " + cpus[0].model + " (" + cpus.length + " x " + cpus[0].speed + ")");
        }
        output.push("Memory (System):  " + (os.totalmem() / GB).toFixed(2) + "GB (" + (os.freemem() / GB).toFixed(2) + "GB free)");
        if (!platform_1.isWindows) {
            output.push("Load (avg):       " + os.loadavg().map(function (l) { return Math.round(l); }).join(', ')); // only provided on Linux/macOS
        }
        output.push("VM:               " + Math.round((id_1.virtualMachineHint.value() * 100)) + "%");
        output.push("Screen Reader:    " + (electron_1.app.isAccessibilitySupportEnabled() ? 'yes' : 'no'));
        output.push("Process Argv:     " + info.mainArguments.join(' '));
        return output.join('\n');
    }
    function formatProcessList(info, rootProcess) {
        var mapPidToWindowTitle = new Map();
        info.windows.forEach(function (window) { return mapPidToWindowTitle.set(window.pid, window.title); });
        var output = [];
        output.push('CPU %\tMem MB\t   PID\tProcess');
        if (rootProcess) {
            formatProcessItem(mapPidToWindowTitle, output, rootProcess, 0);
        }
        return output.join('\n');
    }
    function formatProcessItem(mapPidToWindowTitle, output, item, indent) {
        var isRoot = (indent === 0);
        var MB = 1024 * 1024;
        // Format name with indent
        var name;
        if (isRoot) {
            name = product_1.default.applicationName + " main";
        }
        else {
            name = strings_1.repeat('  ', indent) + " " + item.name;
            if (item.name === 'window') {
                name = name + " (" + mapPidToWindowTitle.get(item.pid) + ")";
            }
        }
        var memory = process.platform === 'win32' ? item.mem : (os.totalmem() * (item.mem / 100));
        output.push(strings_1.pad(Number(item.load.toFixed(0)), 5, ' ') + "\t" + strings_1.pad(Number((memory / MB).toFixed(0)), 6, ' ') + "\t" + strings_1.pad(Number((item.pid).toFixed(0)), 6, ' ') + "\t" + name);
        // Recurse into children if any
        if (Array.isArray(item.children)) {
            item.children.forEach(function (child) { return formatProcessItem(mapPidToWindowTitle, output, child, indent + 1); });
        }
    }
});
