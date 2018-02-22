define(["require", "exports", "fs", "path", "vs/nls", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/platform", "vs/base/common/async", "vs/base/common/winjs.base", "vs/base/common/map", "vs/base/common/severity", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/paths", "vs/platform/workspace/common/workspace", "vs/platform/markers/common/problemMatcher", "vs/workbench/parts/tasks/common/problemCollectors", "vs/workbench/parts/tasks/common/tasks", "vs/workbench/parts/tasks/common/taskSystem"], function (require, exports, fs, path, nls, Objects, Types, Platform, Async, winjs_base_1, map_1, severity_1, event_1, lifecycle_1, TPath, workspace_1, problemMatcher_1, problemCollectors_1, tasks_1, taskSystem_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TerminalTaskSystem = /** @class */ (function () {
        function TerminalTaskSystem(terminalService, outputService, markerService, modelService, configurationResolverService, telemetryService, contextService, outputChannelId) {
            this.terminalService = terminalService;
            this.outputService = outputService;
            this.markerService = markerService;
            this.modelService = modelService;
            this.configurationResolverService = configurationResolverService;
            this.telemetryService = telemetryService;
            this.contextService = contextService;
            this.outputChannel = this.outputService.getChannel(outputChannelId);
            this.activeTasks = Object.create(null);
            this.terminals = Object.create(null);
            this.idleTaskTerminals = new map_1.LinkedMap();
            this.sameTaskTerminals = Object.create(null);
            this._onDidStateChange = new event_1.Emitter();
        }
        Object.defineProperty(TerminalTaskSystem.prototype, "onDidStateChange", {
            get: function () {
                return this._onDidStateChange.event;
            },
            enumerable: true,
            configurable: true
        });
        TerminalTaskSystem.prototype.log = function (value) {
            this.outputChannel.append(value + '\n');
        };
        TerminalTaskSystem.prototype.showOutput = function () {
            this.outputService.showChannel(this.outputChannel.id, true);
        };
        TerminalTaskSystem.prototype.run = function (task, resolver, trigger) {
            if (trigger === void 0) { trigger = taskSystem_1.Triggers.command; }
            var terminalData = this.activeTasks[tasks_1.Task.getMapKey(task)];
            if (terminalData && terminalData.promise) {
                var reveal = tasks_1.RevealKind.Always;
                var focus_1 = false;
                if (tasks_1.CustomTask.is(task) || tasks_1.ContributedTask.is(task)) {
                    reveal = task.command.presentation.reveal;
                    focus_1 = task.command.presentation.focus;
                }
                if (reveal === tasks_1.RevealKind.Always || focus_1) {
                    this.terminalService.setActiveInstance(terminalData.terminal);
                    this.terminalService.showPanel(focus_1);
                }
                return { kind: taskSystem_1.TaskExecuteKind.Active, active: { same: true, background: task.isBackground }, promise: terminalData.promise };
            }
            try {
                return { kind: taskSystem_1.TaskExecuteKind.Started, started: {}, promise: this.executeTask(Object.create(null), task, resolver, trigger) };
            }
            catch (error) {
                if (error instanceof taskSystem_1.TaskError) {
                    throw error;
                }
                else if (error instanceof Error) {
                    this.log(error.message);
                    throw new taskSystem_1.TaskError(severity_1.default.Error, error.message, taskSystem_1.TaskErrors.UnknownError);
                }
                else {
                    this.log(error.toString());
                    throw new taskSystem_1.TaskError(severity_1.default.Error, nls.localize('TerminalTaskSystem.unknownError', 'A unknown error has occurred while executing a task. See task output log for details.'), taskSystem_1.TaskErrors.UnknownError);
                }
            }
        };
        TerminalTaskSystem.prototype.revealTask = function (task) {
            var terminalData = this.activeTasks[tasks_1.Task.getMapKey(task)];
            if (!terminalData) {
                return false;
            }
            this.terminalService.setActiveInstance(terminalData.terminal);
            if (tasks_1.CustomTask.is(task) || tasks_1.ContributedTask.is(task)) {
                this.terminalService.showPanel(task.command.presentation.focus);
            }
            return true;
        };
        TerminalTaskSystem.prototype.isActive = function () {
            return winjs_base_1.TPromise.as(this.isActiveSync());
        };
        TerminalTaskSystem.prototype.isActiveSync = function () {
            return Object.keys(this.activeTasks).length > 0;
        };
        TerminalTaskSystem.prototype.canAutoTerminate = function () {
            var _this = this;
            return Object.keys(this.activeTasks).every(function (key) { return !_this.activeTasks[key].task.promptOnClose; });
        };
        TerminalTaskSystem.prototype.getActiveTasks = function () {
            var _this = this;
            return Object.keys(this.activeTasks).map(function (key) { return _this.activeTasks[key].task; });
        };
        TerminalTaskSystem.prototype.terminate = function (task) {
            var _this = this;
            var activeTerminal = this.activeTasks[tasks_1.Task.getMapKey(task)];
            if (!activeTerminal) {
                return winjs_base_1.TPromise.as({ success: false, task: undefined });
            }
            return new winjs_base_1.TPromise(function (resolve, reject) {
                var terminal = activeTerminal.terminal;
                var onExit = terminal.onExit(function () {
                    var task = activeTerminal.task;
                    try {
                        onExit.dispose();
                        _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Terminated, task));
                    }
                    catch (error) {
                        // Do nothing.
                    }
                    resolve({ success: true, task: task });
                });
                terminal.dispose();
            });
        };
        TerminalTaskSystem.prototype.terminateAll = function () {
            var _this = this;
            var promises = [];
            Object.keys(this.activeTasks).forEach(function (key) {
                var terminalData = _this.activeTasks[key];
                var terminal = terminalData.terminal;
                promises.push(new winjs_base_1.TPromise(function (resolve, reject) {
                    var onExit = terminal.onExit(function () {
                        var task = terminalData.task;
                        try {
                            onExit.dispose();
                            _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Terminated, task));
                        }
                        catch (error) {
                            // Do nothing.
                        }
                        resolve({ success: true, task: terminalData.task });
                    });
                }));
                terminal.dispose();
            });
            this.activeTasks = Object.create(null);
            return winjs_base_1.TPromise.join(promises);
        };
        TerminalTaskSystem.prototype.executeTask = function (startedTasks, task, resolver, trigger) {
            var _this = this;
            var promises = [];
            if (task.dependsOn) {
                task.dependsOn.forEach(function (dependency) {
                    var task = resolver.resolve(dependency.workspaceFolder, dependency.task);
                    if (task) {
                        var key = tasks_1.Task.getMapKey(task);
                        var promise = startedTasks[key];
                        if (!promise) {
                            promise = _this.executeTask(startedTasks, task, resolver, trigger);
                            startedTasks[key] = promise;
                        }
                        promises.push(promise);
                    }
                    else {
                        _this.log(nls.localize('dependencyFailed', 'Couldn\'t resolve dependent task \'{0}\' in workspace folder \'{1}\'', dependency.task, dependency.workspaceFolder.name));
                        _this.showOutput();
                    }
                });
            }
            if ((tasks_1.ContributedTask.is(task) || tasks_1.CustomTask.is(task)) && (task.command)) {
                return winjs_base_1.TPromise.join(promises).then(function (summaries) {
                    for (var _i = 0, summaries_1 = summaries; _i < summaries_1.length; _i++) {
                        var summary = summaries_1[_i];
                        if (summary.exitCode !== 0) {
                            return { exitCode: summary.exitCode };
                        }
                    }
                    return _this.executeCommand(task, trigger);
                });
            }
            else {
                return winjs_base_1.TPromise.join(promises).then(function (summaries) {
                    for (var _i = 0, summaries_2 = summaries; _i < summaries_2.length; _i++) {
                        var summary = summaries_2[_i];
                        if (summary.exitCode !== 0) {
                            return { exitCode: summary.exitCode };
                        }
                    }
                    return { exitCode: 0 };
                });
            }
        };
        TerminalTaskSystem.prototype.executeCommand = function (task, trigger) {
            var _this = this;
            var terminal = undefined;
            var executedCommand = undefined;
            var promise = undefined;
            if (task.isBackground) {
                promise = new winjs_base_1.TPromise(function (resolve, reject) {
                    var problemMatchers = _this.resolveMatchers(task, task.problemMatchers);
                    var watchingProblemMatcher = new problemCollectors_1.WatchingProblemCollector(problemMatchers, _this.markerService, _this.modelService);
                    var toUnbind = [];
                    var eventCounter = 0;
                    toUnbind.push(watchingProblemMatcher.onDidStateChange(function (event) {
                        if (event.kind === problemCollectors_1.ProblemCollectorEventKind.BackgroundProcessingBegins) {
                            eventCounter++;
                            _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Active, task));
                        }
                        else if (event.kind === problemCollectors_1.ProblemCollectorEventKind.BackgroundProcessingEnds) {
                            eventCounter--;
                            _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Inactive, task));
                        }
                    }));
                    watchingProblemMatcher.aboutToStart();
                    var delayer = undefined;
                    _a = _this.createTerminal(task), terminal = _a[0], executedCommand = _a[1];
                    var registeredLinkMatchers = _this.registerLinkMatchers(terminal, problemMatchers);
                    var onData = terminal.onLineData(function (line) {
                        watchingProblemMatcher.processLine(line);
                        if (!delayer) {
                            delayer = new Async.Delayer(3000);
                        }
                        delayer.trigger(function () {
                            watchingProblemMatcher.forceDelivery();
                            delayer = undefined;
                        });
                    });
                    var onExit = terminal.onExit(function (exitCode) {
                        onData.dispose();
                        onExit.dispose();
                        var key = tasks_1.Task.getMapKey(task);
                        delete _this.activeTasks[key];
                        _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Changed));
                        switch (task.command.presentation.panel) {
                            case tasks_1.PanelKind.Dedicated:
                                _this.sameTaskTerminals[key] = terminal.id.toString();
                                break;
                            case tasks_1.PanelKind.Shared:
                                _this.idleTaskTerminals.set(key, terminal.id.toString(), map_1.Touch.AsOld);
                                break;
                        }
                        watchingProblemMatcher.done();
                        watchingProblemMatcher.dispose();
                        registeredLinkMatchers.forEach(function (handle) { return terminal.deregisterLinkMatcher(handle); });
                        toUnbind = lifecycle_1.dispose(toUnbind);
                        toUnbind = null;
                        for (var i = 0; i < eventCounter; i++) {
                            var event_2 = tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Inactive, task);
                            _this._onDidStateChange.fire(event_2);
                        }
                        eventCounter = 0;
                        var reveal = task.command.presentation.reveal;
                        if (exitCode && exitCode === 1 && watchingProblemMatcher.numberOfMatches === 0 && reveal !== tasks_1.RevealKind.Never) {
                            _this.terminalService.setActiveInstance(terminal);
                            _this.terminalService.showPanel(false);
                        }
                        resolve({ exitCode: exitCode });
                    });
                    var _a;
                });
            }
            else {
                promise = new winjs_base_1.TPromise(function (resolve, reject) {
                    _a = _this.createTerminal(task), terminal = _a[0], executedCommand = _a[1];
                    _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Active, task));
                    var problemMatchers = _this.resolveMatchers(task, task.problemMatchers);
                    var startStopProblemMatcher = new problemCollectors_1.StartStopProblemCollector(problemMatchers, _this.markerService, _this.modelService);
                    var registeredLinkMatchers = _this.registerLinkMatchers(terminal, problemMatchers);
                    var onData = terminal.onLineData(function (line) {
                        startStopProblemMatcher.processLine(line);
                    });
                    var onExit = terminal.onExit(function (exitCode) {
                        onData.dispose();
                        onExit.dispose();
                        var key = tasks_1.Task.getMapKey(task);
                        delete _this.activeTasks[key];
                        _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Changed));
                        switch (task.command.presentation.panel) {
                            case tasks_1.PanelKind.Dedicated:
                                _this.sameTaskTerminals[key] = terminal.id.toString();
                                break;
                            case tasks_1.PanelKind.Shared:
                                _this.idleTaskTerminals.set(key, terminal.id.toString(), map_1.Touch.AsOld);
                                break;
                        }
                        startStopProblemMatcher.done();
                        startStopProblemMatcher.dispose();
                        registeredLinkMatchers.forEach(function (handle) { return terminal.deregisterLinkMatcher(handle); });
                        _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Inactive, task));
                        // See https://github.com/Microsoft/vscode/issues/31965
                        if (exitCode === 0 && startStopProblemMatcher.numberOfMatches > 0) {
                            exitCode = 1;
                        }
                        resolve({ exitCode: exitCode });
                    });
                    var _a;
                });
            }
            if (!terminal) {
                return winjs_base_1.TPromise.wrapError(new Error("Failed to create terminal for task " + task._label));
            }
            this.terminalService.setActiveInstance(terminal);
            if (task.command.presentation.reveal === tasks_1.RevealKind.Always || (task.command.presentation.reveal === tasks_1.RevealKind.Silent && task.problemMatchers.length === 0)) {
                this.terminalService.showPanel(task.command.presentation.focus);
            }
            this.activeTasks[tasks_1.Task.getMapKey(task)] = { terminal: terminal, task: task, promise: promise };
            this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Changed));
            return promise.then(function (summary) {
                try {
                    var telemetryEvent = {
                        trigger: trigger,
                        runner: 'terminal',
                        taskKind: tasks_1.Task.getTelemetryKind(task),
                        command: _this.getSanitizedCommand(executedCommand),
                        success: true,
                        exitCode: summary.exitCode
                    };
                    /* __GDPR__
                        "taskService" : {
                            "${include}": [
                                "${TelemetryEvent}"
                            ]
                        }
                    */
                    _this.telemetryService.publicLog(TerminalTaskSystem.TelemetryEventName, telemetryEvent);
                }
                catch (error) {
                }
                return summary;
            }, function (error) {
                try {
                    var telemetryEvent = {
                        trigger: trigger,
                        runner: 'terminal',
                        taskKind: tasks_1.Task.getTelemetryKind(task),
                        command: _this.getSanitizedCommand(executedCommand),
                        success: false
                    };
                    /* __GDPR__
                        "taskService" : {
                            "${include}": [
                                "${TelemetryEvent}"
                            ]
                        }
                    */
                    _this.telemetryService.publicLog(TerminalTaskSystem.TelemetryEventName, telemetryEvent);
                }
                catch (error) {
                }
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TerminalTaskSystem.prototype.createTerminal = function (task) {
            var _this = this;
            var options = this.resolveOptions(task, task.command.options);
            var _a = this.resolveCommandAndArgs(task), command = _a.command, args = _a.args;
            var workspaceFolder = tasks_1.Task.getWorkspaceFolder(task);
            var needsFolderQualification = workspaceFolder && this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE;
            var terminalName = nls.localize('TerminalTaskSystem.terminalName', 'Task - {0}', needsFolderQualification ? tasks_1.Task.getQualifiedLabel(task) : task.name);
            var waitOnExit = false;
            if (task.command.presentation.reveal !== tasks_1.RevealKind.Never || !task.isBackground) {
                if (task.command.presentation.panel === tasks_1.PanelKind.New) {
                    waitOnExit = nls.localize('closeTerminal', 'Press any key to close the terminal.');
                }
                else {
                    waitOnExit = nls.localize('reuseTerminal', 'Terminal will be reused by tasks, press any key to close it.');
                }
            }
            var shellLaunchConfig = undefined;
            var isShellCommand = task.command.runtime === tasks_1.RuntimeType.Shell;
            if (isShellCommand) {
                if (Platform.isWindows && ((options.cwd && TPath.isUNC(options.cwd)) || (!options.cwd && TPath.isUNC(process.cwd())))) {
                    throw new taskSystem_1.TaskError(severity_1.default.Error, nls.localize('TerminalTaskSystem', 'Can\'t execute a shell command on an UNC drive.'), taskSystem_1.TaskErrors.UnknownError);
                }
                shellLaunchConfig = { name: terminalName, executable: null, args: null, waitOnExit: waitOnExit };
                var shellSpecified = false;
                var shellOptions = task.command.options && task.command.options.shell;
                if (shellOptions && shellOptions.executable) {
                    shellLaunchConfig.executable = this.resolveVariable(task, shellOptions.executable);
                    shellSpecified = true;
                    if (shellOptions.args) {
                        shellLaunchConfig.args = this.resolveVariables(task, shellOptions.args.slice());
                    }
                    else {
                        shellLaunchConfig.args = [];
                    }
                }
                else {
                    this.terminalService.configHelper.mergeDefaultShellPathAndArgs(shellLaunchConfig);
                }
                var shellArgs_1 = shellLaunchConfig.args.slice(0);
                var toAdd = [];
                var commandLine = args && args.length > 0 ? command + " " + args.join(' ') : "" + command;
                var windowsShellArgs = false;
                if (Platform.isWindows) {
                    windowsShellArgs = true;
                    var basename = path.basename(shellLaunchConfig.executable).toLowerCase();
                    if (basename === 'powershell.exe') {
                        if (!shellSpecified) {
                            toAdd.push('-Command');
                        }
                    }
                    else if (basename === 'bash.exe') {
                        windowsShellArgs = false;
                        if (!shellSpecified) {
                            toAdd.push('-c');
                        }
                    }
                    else {
                        if (!shellSpecified) {
                            toAdd.push('/d', '/c');
                        }
                    }
                }
                else {
                    if (!shellSpecified) {
                        toAdd.push('-c');
                    }
                }
                toAdd.forEach(function (element) {
                    if (!shellArgs_1.some(function (arg) { return arg.toLowerCase() === element; })) {
                        shellArgs_1.push(element);
                    }
                });
                shellArgs_1.push(commandLine);
                shellLaunchConfig.args = windowsShellArgs ? shellArgs_1.join(' ') : shellArgs_1;
                if (task.command.presentation.echo) {
                    if (needsFolderQualification) {
                        shellLaunchConfig.initialText = "\u001B[1m> Executing task in folder " + workspaceFolder.name + ": " + commandLine + " <\u001B[0m\n";
                    }
                    else {
                        shellLaunchConfig.initialText = "\u001B[1m> Executing task: " + commandLine + " <\u001B[0m\n";
                    }
                }
            }
            else {
                var cwd = options && options.cwd ? options.cwd : process.cwd();
                // On Windows executed process must be described absolute. Since we allowed command without an
                // absolute path (e.g. "command": "node") we need to find the executable in the CWD or PATH.
                var executable = Platform.isWindows && !isShellCommand ? this.findExecutable(command, cwd) : command;
                shellLaunchConfig = {
                    name: terminalName,
                    executable: executable,
                    args: args,
                    waitOnExit: waitOnExit
                };
                if (task.command.presentation.echo) {
                    var getArgsToEcho = function (args) {
                        if (!args || args.length === 0) {
                            return '';
                        }
                        if (Types.isString(args)) {
                            return args;
                        }
                        return args.join(' ');
                    };
                    if (needsFolderQualification) {
                        shellLaunchConfig.initialText = "\u001B[1m> Executing task in folder " + workspaceFolder.name + ": " + shellLaunchConfig.executable + " " + getArgsToEcho(shellLaunchConfig.args) + " <\u001B[0m\n";
                    }
                    else {
                        shellLaunchConfig.initialText = "\u001B[1m> Executing task: " + shellLaunchConfig.executable + " " + getArgsToEcho(shellLaunchConfig.args) + " <\u001B[0m\n";
                    }
                }
            }
            if (options.cwd) {
                var cwd = options.cwd;
                if (!path.isAbsolute(cwd)) {
                    var workspaceFolder_1 = tasks_1.Task.getWorkspaceFolder(task);
                    if (workspaceFolder_1.uri.scheme === 'file') {
                        cwd = path.join(workspaceFolder_1.uri.fsPath, cwd);
                    }
                }
                // This must be normalized to the OS
                shellLaunchConfig.cwd = path.normalize(cwd);
            }
            if (options.env) {
                shellLaunchConfig.env = options.env;
            }
            var prefersSameTerminal = task.command.presentation.panel === tasks_1.PanelKind.Dedicated;
            var allowsSharedTerminal = task.command.presentation.panel === tasks_1.PanelKind.Shared;
            var taskKey = tasks_1.Task.getMapKey(task);
            var terminalToReuse;
            if (prefersSameTerminal) {
                var terminalId = this.sameTaskTerminals[taskKey];
                if (terminalId) {
                    terminalToReuse = this.terminals[terminalId];
                    delete this.sameTaskTerminals[taskKey];
                }
            }
            else if (allowsSharedTerminal) {
                var terminalId = this.idleTaskTerminals.remove(taskKey) || this.idleTaskTerminals.shift();
                if (terminalId) {
                    terminalToReuse = this.terminals[terminalId];
                }
            }
            if (terminalToReuse) {
                terminalToReuse.terminal.reuseTerminal(shellLaunchConfig);
                return [terminalToReuse.terminal, command];
            }
            var result = this.terminalService.createInstance(shellLaunchConfig);
            var terminalKey = result.id.toString();
            result.onDisposed(function (terminal) {
                var terminalData = _this.terminals[terminalKey];
                if (terminalData) {
                    delete _this.terminals[terminalKey];
                    delete _this.sameTaskTerminals[terminalData.lastTask];
                    _this.idleTaskTerminals.delete(terminalData.lastTask);
                }
            });
            this.terminals[terminalKey] = { terminal: result, lastTask: taskKey };
            return [result, command];
        };
        TerminalTaskSystem.prototype.resolveCommandAndArgs = function (task) {
            // First we need to use the command args:
            var args = task.command.args ? task.command.args.slice() : [];
            args = this.resolveVariables(task, args);
            var command = this.resolveVariable(task, task.command.name);
            return { command: command, args: args };
        };
        TerminalTaskSystem.prototype.findExecutable = function (command, cwd) {
            // If we have an absolute path then we take it.
            if (path.isAbsolute(command)) {
                return command;
            }
            var dir = path.dirname(command);
            if (dir !== '.') {
                // We have a directory. So leave the command as is.
                return command;
            }
            // We have a simple file name. We get the path variable from the env
            // and try to find the executable on the path.
            if (!process.env.PATH) {
                return command;
            }
            var paths = process.env.PATH.split(path.delimiter);
            for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                var pathEntry = paths_1[_i];
                // The path entry is absolute.
                var fullPath = void 0;
                if (path.isAbsolute(pathEntry)) {
                    fullPath = path.join(pathEntry, command);
                }
                else {
                    fullPath = path.join(cwd, pathEntry, command);
                }
                if (fs.existsSync(fullPath)) {
                    return fullPath;
                }
                var withExtension = fullPath + '.com';
                if (fs.existsSync(withExtension)) {
                    return withExtension;
                }
                withExtension = fullPath + '.exe';
                if (fs.existsSync(withExtension)) {
                    return withExtension;
                }
            }
            return command;
        };
        TerminalTaskSystem.prototype.resolveVariables = function (task, value) {
            var _this = this;
            return value.map(function (s) { return _this.resolveVariable(task, s); });
        };
        TerminalTaskSystem.prototype.resolveMatchers = function (task, values) {
            var _this = this;
            if (values === void 0 || values === null || values.length === 0) {
                return [];
            }
            var result = [];
            values.forEach(function (value) {
                var matcher;
                if (Types.isString(value)) {
                    if (value[0] === '$') {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value.substring(1));
                    }
                    else {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value);
                    }
                }
                else {
                    matcher = value;
                }
                if (!matcher) {
                    _this.outputChannel.append(nls.localize('unkownProblemMatcher', 'Problem matcher {0} can\'t be resolved. The matcher will be ignored'));
                    return;
                }
                if (!matcher.filePrefix) {
                    result.push(matcher);
                }
                else {
                    var copy = Objects.deepClone(matcher);
                    copy.filePrefix = _this.resolveVariable(task, copy.filePrefix);
                    result.push(copy);
                }
            });
            return result;
        };
        TerminalTaskSystem.prototype.resolveVariable = function (task, value) {
            // TODO@Dirk Task.getWorkspaceFolder should return a WorkspaceFolder that is defined in workspace.ts
            return this.configurationResolverService.resolve(tasks_1.Task.getWorkspaceFolder(task), value);
        };
        TerminalTaskSystem.prototype.resolveOptions = function (task, options) {
            var _this = this;
            if (options === void 0 || options === null) {
                return { cwd: this.resolveVariable(task, '${workspaceFolder}') };
            }
            var result = Types.isString(options.cwd)
                ? { cwd: this.resolveVariable(task, options.cwd) }
                : { cwd: this.resolveVariable(task, '${workspaceFolder}') };
            if (options.env) {
                result.env = Object.create(null);
                Object.keys(options.env).forEach(function (key) {
                    var value = options.env[key];
                    if (Types.isString(value)) {
                        result.env[key] = _this.resolveVariable(task, value);
                    }
                    else {
                        result.env[key] = value.toString();
                    }
                });
            }
            return result;
        };
        TerminalTaskSystem.prototype.registerLinkMatchers = function (terminal, problemMatchers) {
            var result = [];
            /*
            let handlePattern = (matcher: ProblemMatcher, pattern: ProblemPattern): void => {
                if (pattern.regexp instanceof RegExp && Types.isNumber(pattern.file)) {
                    result.push(terminal.registerLinkMatcher(pattern.regexp, (match: string) => {
                        let resource: URI = getResource(match, matcher);
                        if (resource) {
                            this.workbenchEditorService.openEditor({
                                resource: resource
                            });
                        }
                    }, 0));
                }
            };
    
            for (let problemMatcher of problemMatchers) {
                if (Array.isArray(problemMatcher.pattern)) {
                    for (let pattern of problemMatcher.pattern) {
                        handlePattern(problemMatcher, pattern);
                    }
                } else if (problemMatcher.pattern) {
                    handlePattern(problemMatcher, problemMatcher.pattern);
                }
            }
            */
            return result;
        };
        TerminalTaskSystem.prototype.getSanitizedCommand = function (cmd) {
            var result = cmd.toLowerCase();
            var index = result.lastIndexOf(path.sep);
            if (index !== -1) {
                result = result.substring(index + 1);
            }
            if (TerminalTaskSystem.WellKnowCommands[result]) {
                return result;
            }
            return 'other';
        };
        TerminalTaskSystem.TelemetryEventName = 'taskService';
        TerminalTaskSystem.WellKnowCommands = {
            'ant': true,
            'cmake': true,
            'eslint': true,
            'gradle': true,
            'grunt': true,
            'gulp': true,
            'jake': true,
            'jenkins': true,
            'jshint': true,
            'make': true,
            'maven': true,
            'msbuild': true,
            'msc': true,
            'nmake': true,
            'npm': true,
            'rake': true,
            'tsc': true,
            'xbuild': true
        };
        return TerminalTaskSystem;
    }());
    exports.TerminalTaskSystem = TerminalTaskSystem;
});
