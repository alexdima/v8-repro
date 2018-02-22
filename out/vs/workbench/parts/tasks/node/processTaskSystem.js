define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/platform", "vs/base/common/winjs.base", "vs/base/common/async", "vs/base/common/severity", "vs/base/common/strings", "vs/base/common/event", "vs/base/node/processes", "vs/platform/markers/common/problemMatcher", "vs/workbench/parts/tasks/common/problemCollectors", "vs/workbench/parts/tasks/common/taskSystem", "vs/workbench/parts/tasks/common/tasks", "vs/base/common/lifecycle"], function (require, exports, nls, Objects, Types, Platform, winjs_base_1, Async, severity_1, Strings, event_1, processes_1, problemMatcher_1, problemCollectors_1, taskSystem_1, tasks_1, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProcessTaskSystem = /** @class */ (function () {
        function ProcessTaskSystem(markerService, modelService, telemetryService, outputService, configurationResolverService, outputChannelId) {
            this.markerService = markerService;
            this.modelService = modelService;
            this.outputService = outputService;
            this.telemetryService = telemetryService;
            this.configurationResolverService = configurationResolverService;
            this.childProcess = null;
            this.activeTask = null;
            this.activeTaskPromise = null;
            this.outputChannel = this.outputService.getChannel(outputChannelId);
            this.errorsShown = true;
            this._onDidStateChange = new event_1.Emitter();
        }
        Object.defineProperty(ProcessTaskSystem.prototype, "onDidStateChange", {
            get: function () {
                return this._onDidStateChange.event;
            },
            enumerable: true,
            configurable: true
        });
        ProcessTaskSystem.prototype.isActive = function () {
            return winjs_base_1.TPromise.as(!!this.childProcess);
        };
        ProcessTaskSystem.prototype.isActiveSync = function () {
            return !!this.childProcess;
        };
        ProcessTaskSystem.prototype.getActiveTasks = function () {
            var result = [];
            if (this.activeTask) {
                result.push(this.activeTask);
            }
            return result;
        };
        ProcessTaskSystem.prototype.run = function (task) {
            if (this.activeTask) {
                return { kind: taskSystem_1.TaskExecuteKind.Active, active: { same: this.activeTask._id === task._id, background: this.activeTask.isBackground }, promise: this.activeTaskPromise };
            }
            return this.executeTask(task);
        };
        ProcessTaskSystem.prototype.revealTask = function (task) {
            this.showOutput();
            return true;
        };
        ProcessTaskSystem.prototype.hasErrors = function (value) {
            this.errorsShown = !value;
        };
        ProcessTaskSystem.prototype.canAutoTerminate = function () {
            if (this.childProcess) {
                if (this.activeTask) {
                    return !this.activeTask.promptOnClose;
                }
                return false;
            }
            return true;
        };
        ProcessTaskSystem.prototype.terminate = function (task) {
            if (!this.activeTask || tasks_1.Task.getMapKey(this.activeTask) !== tasks_1.Task.getMapKey(task)) {
                return winjs_base_1.TPromise.as({ success: false, task: undefined });
            }
            return this.terminateAll()[0];
        };
        ProcessTaskSystem.prototype.terminateAll = function () {
            var _this = this;
            if (this.childProcess) {
                var task_1 = this.activeTask;
                return this.childProcess.terminate().then(function (response) {
                    var result = Objects.assign({ task: task_1 }, response);
                    _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Terminated, task_1));
                    return [result];
                });
            }
            return winjs_base_1.TPromise.as([{ success: true, task: undefined }]);
        };
        ProcessTaskSystem.prototype.executeTask = function (task, trigger) {
            var _this = this;
            if (trigger === void 0) { trigger = taskSystem_1.Triggers.command; }
            if (!tasks_1.CustomTask.is(task)) {
                throw new Error('The process task system can only execute custom tasks.');
            }
            var telemetryEvent = {
                trigger: trigger,
                runner: 'output',
                taskKind: tasks_1.Task.getTelemetryKind(task),
                command: 'other',
                success: true
            };
            try {
                var result = this.doExecuteTask(task, telemetryEvent);
                result.promise = result.promise.then(function (success) {
                    /* __GDPR__
                        "taskService" : {
                            "${include}": [
                                "${TelemetryEvent}"
                            ]
                        }
                    */
                    _this.telemetryService.publicLog(ProcessTaskSystem.TelemetryEventName, telemetryEvent);
                    return success;
                }, function (err) {
                    telemetryEvent.success = false;
                    /* __GDPR__
                        "taskService" : {
                            "${include}": [
                                "${TelemetryEvent}"
                            ]
                        }
                    */
                    _this.telemetryService.publicLog(ProcessTaskSystem.TelemetryEventName, telemetryEvent);
                    return winjs_base_1.TPromise.wrapError(err);
                });
                return result;
            }
            catch (err) {
                telemetryEvent.success = false;
                /* __GDPR__
                    "taskService" : {
                        "${include}": [
                            "${TelemetryEvent}"
                        ]
                    }
                */
                this.telemetryService.publicLog(ProcessTaskSystem.TelemetryEventName, telemetryEvent);
                if (err instanceof taskSystem_1.TaskError) {
                    throw err;
                }
                else if (err instanceof Error) {
                    var error = err;
                    this.outputChannel.append(error.message);
                    throw new taskSystem_1.TaskError(severity_1.default.Error, error.message, taskSystem_1.TaskErrors.UnknownError);
                }
                else {
                    this.outputChannel.append(err.toString());
                    throw new taskSystem_1.TaskError(severity_1.default.Error, nls.localize('TaskRunnerSystem.unknownError', 'A unknown error has occurred while executing a task. See task output log for details.'), taskSystem_1.TaskErrors.UnknownError);
                }
            }
        };
        ProcessTaskSystem.prototype.doExecuteTask = function (task, telemetryEvent) {
            var _this = this;
            var taskSummary = {};
            var commandConfig = task.command;
            if (!this.errorsShown) {
                this.showOutput();
                this.errorsShown = true;
            }
            else {
                this.clearOutput();
            }
            var args = commandConfig.args ? commandConfig.args.slice() : [];
            args = this.resolveVariables(task, args);
            var command = this.resolveVariable(task, commandConfig.name);
            this.childProcess = new processes_1.LineProcess(command, args, commandConfig.runtime === tasks_1.RuntimeType.Shell, this.resolveOptions(task, commandConfig.options));
            telemetryEvent.command = this.childProcess.getSanitizedCommand();
            // we have no problem matchers defined. So show the output log
            var reveal = task.command.presentation.reveal;
            if (reveal === tasks_1.RevealKind.Always || (reveal === tasks_1.RevealKind.Silent && task.problemMatchers.length === 0)) {
                this.showOutput();
            }
            if (commandConfig.presentation.echo) {
                var prompt_1 = Platform.isWindows ? '>' : '$';
                this.log("running command" + prompt_1 + " " + command + " " + args.join(' '));
            }
            if (task.isBackground) {
                var watchingProblemMatcher_1 = new problemCollectors_1.WatchingProblemCollector(this.resolveMatchers(task, task.problemMatchers), this.markerService, this.modelService);
                var toUnbind_1 = [];
                var eventCounter_1 = 0;
                toUnbind_1.push(watchingProblemMatcher_1.onDidStateChange(function (event) {
                    if (event.kind === problemCollectors_1.ProblemCollectorEventKind.BackgroundProcessingBegins) {
                        eventCounter_1++;
                        _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Active, task));
                    }
                    else if (event.kind === problemCollectors_1.ProblemCollectorEventKind.BackgroundProcessingEnds) {
                        eventCounter_1--;
                        _this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Inactive, task));
                    }
                }));
                watchingProblemMatcher_1.aboutToStart();
                var delayer_1 = null;
                this.activeTask = task;
                var inactiveEvent_1 = tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Inactive, task);
                this.activeTaskPromise = this.childProcess.start().then(function (success) {
                    _this.childProcessEnded();
                    watchingProblemMatcher_1.done();
                    watchingProblemMatcher_1.dispose();
                    toUnbind_1 = lifecycle_1.dispose(toUnbind_1);
                    toUnbind_1 = null;
                    for (var i = 0; i < eventCounter_1; i++) {
                        _this._onDidStateChange.fire(inactiveEvent_1);
                    }
                    eventCounter_1 = 0;
                    if (!_this.checkTerminated(task, success)) {
                        _this.log(nls.localize('TaskRunnerSystem.watchingBuildTaskFinished', '\nWatching build tasks has finished.'));
                    }
                    if (success.cmdCode && success.cmdCode === 1 && watchingProblemMatcher_1.numberOfMatches === 0 && reveal !== tasks_1.RevealKind.Never) {
                        _this.showOutput();
                    }
                    taskSummary.exitCode = success.cmdCode;
                    return taskSummary;
                }, function (error) {
                    _this.childProcessEnded();
                    watchingProblemMatcher_1.dispose();
                    toUnbind_1 = lifecycle_1.dispose(toUnbind_1);
                    toUnbind_1 = null;
                    for (var i = 0; i < eventCounter_1; i++) {
                        _this._onDidStateChange.fire(inactiveEvent_1);
                    }
                    eventCounter_1 = 0;
                    return _this.handleError(task, error);
                }, function (progress) {
                    var line = Strings.removeAnsiEscapeCodes(progress.line);
                    _this.outputChannel.append(line + '\n');
                    watchingProblemMatcher_1.processLine(line);
                    if (delayer_1 === null) {
                        delayer_1 = new Async.Delayer(3000);
                    }
                    delayer_1.trigger(function () {
                        watchingProblemMatcher_1.forceDelivery();
                        return null;
                    }).then(function () {
                        delayer_1 = null;
                    });
                });
                var result = task.tscWatch
                    ? { kind: taskSystem_1.TaskExecuteKind.Started, started: { restartOnFileChanges: '**/*.ts' }, promise: this.activeTaskPromise }
                    : { kind: taskSystem_1.TaskExecuteKind.Started, started: {}, promise: this.activeTaskPromise };
                return result;
            }
            else {
                this._onDidStateChange.fire(tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Active, task));
                var startStopProblemMatcher_1 = new problemCollectors_1.StartStopProblemCollector(this.resolveMatchers(task, task.problemMatchers), this.markerService, this.modelService);
                this.activeTask = task;
                var inactiveEvent_2 = tasks_1.TaskEvent.create(tasks_1.TaskEventKind.Inactive, task);
                this.activeTaskPromise = this.childProcess.start().then(function (success) {
                    _this.childProcessEnded();
                    startStopProblemMatcher_1.done();
                    startStopProblemMatcher_1.dispose();
                    _this.checkTerminated(task, success);
                    _this._onDidStateChange.fire(inactiveEvent_2);
                    if (success.cmdCode && success.cmdCode === 1 && startStopProblemMatcher_1.numberOfMatches === 0 && reveal !== tasks_1.RevealKind.Never) {
                        _this.showOutput();
                    }
                    taskSummary.exitCode = success.cmdCode;
                    return taskSummary;
                }, function (error) {
                    _this.childProcessEnded();
                    startStopProblemMatcher_1.dispose();
                    _this._onDidStateChange.fire(inactiveEvent_2);
                    return _this.handleError(task, error);
                }, function (progress) {
                    var line = Strings.removeAnsiEscapeCodes(progress.line);
                    _this.outputChannel.append(line + '\n');
                    startStopProblemMatcher_1.processLine(line);
                });
                return { kind: taskSystem_1.TaskExecuteKind.Started, started: {}, promise: this.activeTaskPromise };
            }
        };
        ProcessTaskSystem.prototype.childProcessEnded = function () {
            this.childProcess = null;
            this.activeTask = null;
            this.activeTaskPromise = null;
        };
        ProcessTaskSystem.prototype.handleError = function (task, errorData) {
            var makeVisible = false;
            if (errorData.error && !errorData.terminated) {
                var args = task.command.args ? task.command.args.join(' ') : '';
                this.log(nls.localize('TaskRunnerSystem.childProcessError', 'Failed to launch external program {0} {1}.', task.command.name, args));
                this.outputChannel.append(errorData.error.message);
                makeVisible = true;
            }
            if (errorData.stdout) {
                this.outputChannel.append(errorData.stdout);
                makeVisible = true;
            }
            if (errorData.stderr) {
                this.outputChannel.append(errorData.stderr);
                makeVisible = true;
            }
            makeVisible = this.checkTerminated(task, errorData) || makeVisible;
            if (makeVisible) {
                this.showOutput();
            }
            var error = errorData.error || new Error();
            error.stderr = errorData.stderr;
            error.stdout = errorData.stdout;
            error.terminated = errorData.terminated;
            return winjs_base_1.TPromise.wrapError(error);
        };
        ProcessTaskSystem.prototype.checkTerminated = function (task, data) {
            if (data.terminated) {
                this.log(nls.localize('TaskRunnerSystem.cancelRequested', '\nThe task \'{0}\' was terminated per user request.', task.name));
                return true;
            }
            return false;
        };
        ProcessTaskSystem.prototype.resolveOptions = function (task, options) {
            var _this = this;
            var result = { cwd: this.resolveVariable(task, options.cwd) };
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
        ProcessTaskSystem.prototype.resolveVariables = function (task, value) {
            var _this = this;
            return value.map(function (s) { return _this.resolveVariable(task, s); });
        };
        ProcessTaskSystem.prototype.resolveMatchers = function (task, values) {
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
        ProcessTaskSystem.prototype.resolveVariable = function (task, value) {
            return this.configurationResolverService.resolve(tasks_1.Task.getWorkspaceFolder(task), value);
        };
        ProcessTaskSystem.prototype.log = function (value) {
            this.outputChannel.append(value + '\n');
        };
        ProcessTaskSystem.prototype.showOutput = function () {
            this.outputService.showChannel(this.outputChannel.id, true);
        };
        ProcessTaskSystem.prototype.clearOutput = function () {
            this.outputChannel.clear();
        };
        ProcessTaskSystem.TelemetryEventName = 'taskService';
        return ProcessTaskSystem;
    }());
    exports.ProcessTaskSystem = ProcessTaskSystem;
});
