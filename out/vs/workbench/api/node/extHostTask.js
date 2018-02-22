define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/objects", "vs/base/common/async", "vs/workbench/parts/tasks/common/tasks", "vs/workbench/api/node/extHost.protocol", "vs/workbench/api/node/extHostTypes"], function (require, exports, nls, winjs_base_1, Objects, async_1, TaskSystem, extHost_protocol_1, types) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /*
    namespace ProblemPattern {
        export function from(value: vscode.ProblemPattern | vscode.MultiLineProblemPattern): Problems.ProblemPattern | Problems.MultiLineProblemPattern {
            if (value === void 0 || value === null) {
                return undefined;
            }
            if (Array.isArray(value)) {
                let result: Problems.ProblemPattern[] = [];
                for (let pattern of value) {
                    let converted = fromSingle(pattern);
                    if (!converted) {
                        return undefined;
                    }
                    result.push(converted);
                }
                return result;
            } else {
                return fromSingle(value);
            }
        }
    
        function copyProperty(target: Problems.ProblemPattern, source: vscode.ProblemPattern, tk: keyof Problems.ProblemPattern) {
            let sk: keyof vscode.ProblemPattern = tk;
            let value = source[sk];
            if (typeof value === 'number') {
                target[tk] = value;
            }
        }
    
        function getValue(value: number, defaultValue: number): number {
            if (value !== void 0 && value === null) {
                return value;
            }
            return defaultValue;
        }
    
        function fromSingle(problemPattern: vscode.ProblemPattern): Problems.ProblemPattern {
            if (problemPattern === void 0 || problemPattern === null || !(problemPattern.regexp instanceof RegExp)) {
                return undefined;
            }
            let result: Problems.ProblemPattern = {
                regexp: problemPattern.regexp
            };
            copyProperty(result, problemPattern, 'file');
            copyProperty(result, problemPattern, 'location');
            copyProperty(result, problemPattern, 'line');
            copyProperty(result, problemPattern, 'character');
            copyProperty(result, problemPattern, 'endLine');
            copyProperty(result, problemPattern, 'endCharacter');
            copyProperty(result, problemPattern, 'severity');
            copyProperty(result, problemPattern, 'code');
            copyProperty(result, problemPattern, 'message');
            if (problemPattern.loop === true || problemPattern.loop === false) {
                result.loop = problemPattern.loop;
            }
            if (result.location) {
                result.file = getValue(result.file, 1);
                result.message = getValue(result.message, 0);
            } else {
                result.file = getValue(result.file, 1);
                result.line = getValue(result.line, 2);
                result.character = getValue(result.character, 3);
                result.message = getValue(result.message, 0);
            }
            return result;
        }
    }
    
    namespace ApplyTo {
        export function from(value: vscode.ApplyToKind): Problems.ApplyToKind {
            if (value === void 0 || value === null) {
                return Problems.ApplyToKind.allDocuments;
            }
            switch (value) {
                case types.ApplyToKind.OpenDocuments:
                    return Problems.ApplyToKind.openDocuments;
                case types.ApplyToKind.ClosedDocuments:
                    return Problems.ApplyToKind.closedDocuments;
            }
            return Problems.ApplyToKind.allDocuments;
        }
    }
    
    namespace FileLocation {
        export function from(value: vscode.FileLocationKind | string): { kind: Problems.FileLocationKind; prefix?: string } {
            if (value === void 0 || value === null) {
                return { kind: Problems.FileLocationKind.Auto };
            }
            if (typeof value === 'string') {
                return { kind: Problems.FileLocationKind.Relative, prefix: value };
            }
            switch (value) {
                case types.FileLocationKind.Absolute:
                    return { kind: Problems.FileLocationKind.Absolute };
                case types.FileLocationKind.Relative:
                    return { kind: Problems.FileLocationKind.Relative, prefix: '${workspaceFolder}' };
            }
            return { kind: Problems.FileLocationKind.Auto };
        }
    }
    
    namespace WatchingPattern {
        export function from(value: RegExp | vscode.BackgroundPattern): Problems.WatchingPattern {
            if (value === void 0 || value === null) {
                return undefined;
            }
            if (value instanceof RegExp) {
                return { regexp: value };
            }
            if (!(value.regexp instanceof RegExp)) {
                return undefined;
            }
            let result: Problems.WatchingPattern = {
                regexp: value.regexp
            };
            if (typeof value.file === 'number') {
                result.file = value.file;
            }
            return result;
        }
    }
    
    namespace BackgroundMonitor {
        export function from(value: vscode.BackgroundMonitor): Problems.WatchingMatcher {
            if (value === void 0 || value === null) {
                return undefined;
            }
            let result: Problems.WatchingMatcher = {
                activeOnStart: !!value.activeOnStart,
                beginsPattern: WatchingPattern.from(value.beginsPattern),
                endsPattern: WatchingPattern.from(value.endsPattern)
            };
            return result;
        }
    }
    
    namespace ProblemMatcher {
        export function from(values: (string | vscode.ProblemMatcher)[]): (string | Problems.ProblemMatcher)[] {
            if (values === void 0 || values === null) {
                return undefined;
            }
            let result: (string | Problems.ProblemMatcher)[] = [];
            for (let value of values) {
                let converted = typeof value === 'string' ? value : fromSingle(value);
                if (converted) {
                    result.push(converted);
                }
            }
            return result;
        }
    
        function fromSingle(problemMatcher: vscode.ProblemMatcher): Problems.ProblemMatcher {
            if (problemMatcher === void 0 || problemMatcher === null) {
                return undefined;
            }
    
            let location = FileLocation.from(problemMatcher.fileLocation);
            let result: Problems.ProblemMatcher = {
                owner: typeof problemMatcher.owner === 'string' ? problemMatcher.owner : UUID.generateUuid(),
                applyTo: ApplyTo.from(problemMatcher.applyTo),
                fileLocation: location.kind,
                filePrefix: location.prefix,
                pattern: ProblemPattern.from(problemMatcher.pattern),
                severity: fromDiagnosticSeverity(problemMatcher.severity),
            };
            return result;
        }
    }
    */
    var TaskRevealKind;
    (function (TaskRevealKind) {
        function from(value) {
            if (value === void 0 || value === null) {
                return TaskSystem.RevealKind.Always;
            }
            switch (value) {
                case types.TaskRevealKind.Silent:
                    return TaskSystem.RevealKind.Silent;
                case types.TaskRevealKind.Never:
                    return TaskSystem.RevealKind.Never;
            }
            return TaskSystem.RevealKind.Always;
        }
        TaskRevealKind.from = from;
    })(TaskRevealKind || (TaskRevealKind = {}));
    var TaskPanelKind;
    (function (TaskPanelKind) {
        function from(value) {
            if (value === void 0 || value === null) {
                return TaskSystem.PanelKind.Shared;
            }
            switch (value) {
                case types.TaskPanelKind.Dedicated:
                    return TaskSystem.PanelKind.Dedicated;
                case types.TaskPanelKind.New:
                    return TaskSystem.PanelKind.New;
                default:
                    return TaskSystem.PanelKind.Shared;
            }
        }
        TaskPanelKind.from = from;
    })(TaskPanelKind || (TaskPanelKind = {}));
    var PresentationOptions;
    (function (PresentationOptions) {
        function from(value) {
            if (value === void 0 || value === null) {
                return { reveal: TaskSystem.RevealKind.Always, echo: true, focus: false, panel: TaskSystem.PanelKind.Shared };
            }
            return {
                reveal: TaskRevealKind.from(value.reveal),
                echo: value.echo === void 0 ? true : !!value.echo,
                focus: !!value.focus,
                panel: TaskPanelKind.from(value.panel)
            };
        }
        PresentationOptions.from = from;
    })(PresentationOptions || (PresentationOptions = {}));
    var Strings;
    (function (Strings) {
        function from(value) {
            if (value === void 0 || value === null) {
                return undefined;
            }
            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                var element = value_1[_i];
                if (typeof element !== 'string') {
                    return [];
                }
            }
            return value;
        }
        Strings.from = from;
    })(Strings || (Strings = {}));
    var CommandOptions;
    (function (CommandOptions) {
        function isShellConfiguration(value) {
            return value && typeof value.executable === 'string';
        }
        function from(value) {
            if (value === void 0 || value === null) {
                return undefined;
            }
            var result = {};
            if (typeof value.cwd === 'string') {
                result.cwd = value.cwd;
            }
            if (value.env) {
                result.env = Object.create(null);
                Object.keys(value.env).forEach(function (key) {
                    var envValue = value.env[key];
                    if (typeof envValue === 'string') {
                        result.env[key] = envValue;
                    }
                });
            }
            if (isShellConfiguration(value)) {
                result.shell = ShellConfiguration.from(value);
            }
            return result;
        }
        CommandOptions.from = from;
    })(CommandOptions || (CommandOptions = {}));
    var ShellConfiguration;
    (function (ShellConfiguration) {
        function from(value) {
            if (value === void 0 || value === null || !value.executable) {
                return undefined;
            }
            var result = {
                executable: value.executable,
                args: Strings.from(value.shellArgs)
            };
            return result;
        }
        ShellConfiguration.from = from;
    })(ShellConfiguration || (ShellConfiguration = {}));
    var Tasks;
    (function (Tasks) {
        function from(tasks, rootFolder, extension) {
            if (tasks === void 0 || tasks === null) {
                return [];
            }
            var result = [];
            for (var _i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
                var task = tasks_1[_i];
                var converted = fromSingle(task, rootFolder, extension);
                if (converted) {
                    result.push(converted);
                }
            }
            return result;
        }
        Tasks.from = from;
        function fromSingle(task, rootFolder, extension) {
            if (typeof task.name !== 'string') {
                return undefined;
            }
            var command;
            var execution = task.execution;
            if (execution instanceof types.ProcessExecution) {
                command = getProcessCommand(execution);
            }
            else if (execution instanceof types.ShellExecution) {
                command = getShellCommand(execution);
            }
            else {
                return undefined;
            }
            if (command === void 0) {
                return undefined;
            }
            command.presentation = PresentationOptions.from(task.presentationOptions);
            var taskScope = task.scope;
            var workspaceFolder;
            var scope;
            // For backwards compatibility
            if (taskScope === void 0) {
                scope = TaskSystem.TaskScope.Folder;
                workspaceFolder = rootFolder;
            }
            else if (taskScope === types.TaskScope.Global) {
                scope = TaskSystem.TaskScope.Global;
            }
            else if (taskScope === types.TaskScope.Workspace) {
                scope = TaskSystem.TaskScope.Workspace;
            }
            else {
                scope = TaskSystem.TaskScope.Folder;
                workspaceFolder = taskScope;
            }
            var source = {
                kind: TaskSystem.TaskSourceKind.Extension,
                label: typeof task.source === 'string' ? task.source : extension.name,
                extension: extension.id,
                scope: scope,
                workspaceFolder: undefined
            };
            // We can't transfer a workspace folder object from the extension host to main since they differ
            // in shape and we don't have backwards converting function. So transfer the URI and resolve the
            // workspace folder on the main side.
            source.__workspaceFolder = workspaceFolder ? workspaceFolder.uri : undefined;
            var label = nls.localize('task.label', '{0}: {1}', source.label, task.name);
            var key = task.definitionKey;
            var kind = task.definition;
            var id = extension.id + "." + key;
            var taskKind = {
                _key: key,
                type: kind.type
            };
            Objects.assign(taskKind, kind);
            var result = {
                _id: id,
                _source: source,
                _label: label,
                type: kind.type,
                defines: taskKind,
                name: task.name,
                identifier: label,
                group: task.group ? task.group.id : undefined,
                command: command,
                isBackground: !!task.isBackground,
                problemMatchers: task.problemMatchers.slice(),
                hasDefinedMatchers: task.hasDefinedMatchers
            };
            return result;
        }
        function getProcessCommand(value) {
            if (typeof value.process !== 'string') {
                return undefined;
            }
            var result = {
                name: value.process,
                args: Strings.from(value.args),
                runtime: TaskSystem.RuntimeType.Process,
                suppressTaskName: true,
                presentation: undefined
            };
            if (value.options) {
                result.options = CommandOptions.from(value.options);
            }
            return result;
        }
        function getShellCommand(value) {
            if (typeof value.commandLine !== 'string') {
                return undefined;
            }
            var result = {
                name: value.commandLine,
                runtime: TaskSystem.RuntimeType.Shell,
                presentation: undefined
            };
            if (value.options) {
                result.options = CommandOptions.from(value.options);
            }
            return result;
        }
    })(Tasks || (Tasks = {}));
    var ExtHostTask = /** @class */ (function () {
        function ExtHostTask(mainContext, extHostWorkspace) {
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadTask);
            this._extHostWorkspace = extHostWorkspace;
            this._handleCounter = 0;
            this._handlers = new Map();
        }
        ExtHostTask.prototype.registerTaskProvider = function (extension, provider) {
            var _this = this;
            if (!provider) {
                return new types.Disposable(function () { });
            }
            var handle = this.nextHandle();
            this._handlers.set(handle, { provider: provider, extension: extension });
            this._proxy.$registerTaskProvider(handle);
            return new types.Disposable(function () {
                _this._handlers.delete(handle);
                _this._proxy.$unregisterTaskProvider(handle);
            });
        };
        ExtHostTask.prototype.$provideTasks = function (handle) {
            var _this = this;
            var handler = this._handlers.get(handle);
            if (!handler) {
                return winjs_base_1.TPromise.wrapError(new Error('no handler found'));
            }
            return async_1.asWinJsPromise(function (token) { return handler.provider.provideTasks(token); }).then(function (value) {
                var workspaceFolders = _this._extHostWorkspace.getWorkspaceFolders();
                return {
                    tasks: Tasks.from(value, workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0] : undefined, handler.extension),
                    extension: handler.extension
                };
            });
        };
        ExtHostTask.prototype.nextHandle = function () {
            return this._handleCounter++;
        };
        return ExtHostTask;
    }());
    exports.ExtHostTask = ExtHostTask;
});
