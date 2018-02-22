define(["require", "exports", "vs/base/common/uri", "assert", "vs/base/common/severity", "vs/base/common/uuid", "vs/base/common/platform", "vs/base/common/parsers", "vs/platform/markers/common/problemMatcher", "vs/platform/workspace/common/workspace", "vs/workbench/parts/tasks/common/tasks", "vs/workbench/parts/tasks/node/taskConfiguration"], function (require, exports, uri_1, assert, severity_1, UUID, Platform, parsers_1, problemMatcher_1, workspace_1, Tasks, taskConfiguration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var workspaceFolder = new workspace_1.WorkspaceFolder({
        uri: uri_1.default.file('/workspace/folderOne'),
        name: 'folderOne',
        index: 0
    });
    var ProblemReporter = /** @class */ (function () {
        function ProblemReporter() {
            this._validationStatus = new parsers_1.ValidationStatus();
            this.receivedMessage = false;
            this.lastMessage = undefined;
        }
        ProblemReporter.prototype.info = function (message) {
            this.log(message);
        };
        ProblemReporter.prototype.warn = function (message) {
            this.log(message);
        };
        ProblemReporter.prototype.error = function (message) {
            this.log(message);
        };
        ProblemReporter.prototype.fatal = function (message) {
            this.log(message);
        };
        Object.defineProperty(ProblemReporter.prototype, "status", {
            get: function () {
                return this._validationStatus;
            },
            enumerable: true,
            configurable: true
        });
        ProblemReporter.prototype.log = function (message) {
            this.receivedMessage = true;
            this.lastMessage = message;
        };
        return ProblemReporter;
    }());
    var ConfiguationBuilder = /** @class */ (function () {
        function ConfiguationBuilder() {
            this.result = [];
            this.builders = [];
        }
        ConfiguationBuilder.prototype.task = function (name, command) {
            var builder = new CustomTaskBuilder(this, name, command);
            this.builders.push(builder);
            this.result.push(builder.result);
            return builder;
        };
        ConfiguationBuilder.prototype.done = function () {
            for (var _i = 0, _a = this.builders; _i < _a.length; _i++) {
                var builder = _a[_i];
                builder.done();
            }
        };
        return ConfiguationBuilder;
    }());
    var PresentationBuilder = /** @class */ (function () {
        function PresentationBuilder(parent) {
            this.parent = parent;
            this.result = { echo: false, reveal: Tasks.RevealKind.Always, focus: false, panel: Tasks.PanelKind.Shared };
        }
        PresentationBuilder.prototype.echo = function (value) {
            this.result.echo = value;
            return this;
        };
        PresentationBuilder.prototype.reveal = function (value) {
            this.result.reveal = value;
            return this;
        };
        PresentationBuilder.prototype.focus = function (value) {
            this.result.focus = value;
            return this;
        };
        PresentationBuilder.prototype.instance = function (value) {
            this.result.panel = value;
            return this;
        };
        PresentationBuilder.prototype.done = function () {
        };
        return PresentationBuilder;
    }());
    var CommandConfigurationBuilder = /** @class */ (function () {
        function CommandConfigurationBuilder(parent, command) {
            this.parent = parent;
            this.presentationBuilder = new PresentationBuilder(this);
            this.result = {
                name: command,
                runtime: Tasks.RuntimeType.Process,
                args: [],
                options: {
                    cwd: '${workspaceFolder}'
                },
                presentation: this.presentationBuilder.result,
                suppressTaskName: false
            };
        }
        CommandConfigurationBuilder.prototype.name = function (value) {
            this.result.name = value;
            return this;
        };
        CommandConfigurationBuilder.prototype.runtime = function (value) {
            this.result.runtime = value;
            return this;
        };
        CommandConfigurationBuilder.prototype.args = function (value) {
            this.result.args = value;
            return this;
        };
        CommandConfigurationBuilder.prototype.options = function (value) {
            this.result.options = value;
            return this;
        };
        CommandConfigurationBuilder.prototype.taskSelector = function (value) {
            this.result.taskSelector = value;
            return this;
        };
        CommandConfigurationBuilder.prototype.suppressTaskName = function (value) {
            this.result.suppressTaskName = value;
            return this;
        };
        CommandConfigurationBuilder.prototype.presentation = function () {
            return this.presentationBuilder;
        };
        CommandConfigurationBuilder.prototype.done = function (taskName) {
            this.result.args = this.result.args.map(function (arg) { return arg === '$name' ? taskName : arg; });
            this.presentationBuilder.done();
        };
        return CommandConfigurationBuilder;
    }());
    var CustomTaskBuilder = /** @class */ (function () {
        function CustomTaskBuilder(parent, name, command) {
            this.parent = parent;
            this.commandBuilder = new CommandConfigurationBuilder(this, command);
            this.result = {
                _id: name,
                _source: { kind: Tasks.TaskSourceKind.Workspace, label: 'workspace', config: { workspaceFolder: workspaceFolder, element: undefined, index: -1, file: '.vscode/tasks.json' } },
                _label: name,
                type: 'custom',
                identifier: name,
                name: name,
                command: this.commandBuilder.result,
                isBackground: false,
                promptOnClose: true,
                problemMatchers: []
            };
        }
        CustomTaskBuilder.prototype.identifier = function (value) {
            this.result.identifier = value;
            return this;
        };
        CustomTaskBuilder.prototype.group = function (value) {
            this.result.group = value;
            this.result.groupType = Tasks.GroupType.user;
            return this;
        };
        CustomTaskBuilder.prototype.groupType = function (value) {
            this.result.groupType = value;
            return this;
        };
        CustomTaskBuilder.prototype.isBackground = function (value) {
            this.result.isBackground = value;
            return this;
        };
        CustomTaskBuilder.prototype.promptOnClose = function (value) {
            this.result.promptOnClose = value;
            return this;
        };
        CustomTaskBuilder.prototype.problemMatcher = function () {
            var builder = new ProblemMatcherBuilder(this);
            this.result.problemMatchers.push(builder.result);
            return builder;
        };
        CustomTaskBuilder.prototype.command = function () {
            return this.commandBuilder;
        };
        CustomTaskBuilder.prototype.done = function () {
            this.commandBuilder.done(this.result.name);
        };
        return CustomTaskBuilder;
    }());
    var ProblemMatcherBuilder = /** @class */ (function () {
        function ProblemMatcherBuilder(parent) {
            this.parent = parent;
            this.result = {
                owner: ProblemMatcherBuilder.DEFAULT_UUID,
                applyTo: problemMatcher_1.ApplyToKind.allDocuments,
                severity: undefined,
                fileLocation: problemMatcher_1.FileLocationKind.Relative,
                filePrefix: '${workspaceFolder}',
                pattern: undefined
            };
        }
        ProblemMatcherBuilder.prototype.owner = function (value) {
            this.result.owner = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.applyTo = function (value) {
            this.result.applyTo = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.severity = function (value) {
            this.result.severity = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.fileLocation = function (value) {
            this.result.fileLocation = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.filePrefix = function (value) {
            this.result.filePrefix = value;
            return this;
        };
        ProblemMatcherBuilder.prototype.pattern = function (regExp) {
            var builder = new PatternBuilder(this, regExp);
            if (!this.result.pattern) {
                this.result.pattern = builder.result;
            }
            return builder;
        };
        ProblemMatcherBuilder.DEFAULT_UUID = UUID.generateUuid();
        return ProblemMatcherBuilder;
    }());
    var PatternBuilder = /** @class */ (function () {
        function PatternBuilder(parent, regExp) {
            this.parent = parent;
            this.result = {
                regexp: regExp,
                file: 1,
                message: 0,
                line: 2,
                character: 3
            };
        }
        PatternBuilder.prototype.file = function (value) {
            this.result.file = value;
            return this;
        };
        PatternBuilder.prototype.message = function (value) {
            this.result.message = value;
            return this;
        };
        PatternBuilder.prototype.location = function (value) {
            this.result.location = value;
            return this;
        };
        PatternBuilder.prototype.line = function (value) {
            this.result.line = value;
            return this;
        };
        PatternBuilder.prototype.character = function (value) {
            this.result.character = value;
            return this;
        };
        PatternBuilder.prototype.endLine = function (value) {
            this.result.endLine = value;
            return this;
        };
        PatternBuilder.prototype.endCharacter = function (value) {
            this.result.endCharacter = value;
            return this;
        };
        PatternBuilder.prototype.code = function (value) {
            this.result.code = value;
            return this;
        };
        PatternBuilder.prototype.severity = function (value) {
            this.result.severity = value;
            return this;
        };
        PatternBuilder.prototype.loop = function (value) {
            this.result.loop = value;
            return this;
        };
        return PatternBuilder;
    }());
    function testDefaultProblemMatcher(external, resolved) {
        var reporter = new ProblemReporter();
        var result = taskConfiguration_1.parse(workspaceFolder, external, reporter);
        assert.ok(!reporter.receivedMessage);
        assert.strictEqual(result.custom.length, 1);
        var task = result.custom[0];
        assert.ok(task);
        assert.strictEqual(task.problemMatchers.length, resolved);
    }
    function testConfiguration(external, builder) {
        builder.done();
        var reporter = new ProblemReporter();
        var result = taskConfiguration_1.parse(workspaceFolder, external, reporter);
        if (reporter.receivedMessage) {
            assert.ok(false, reporter.lastMessage);
        }
        assertConfiguration(result, builder.result);
    }
    var TaskGroupMap = /** @class */ (function () {
        function TaskGroupMap() {
            this._store = Object.create(null);
        }
        TaskGroupMap.prototype.add = function (group, task) {
            var tasks = this._store[group];
            if (!tasks) {
                tasks = [];
                this._store[group] = tasks;
            }
            tasks.push(task);
        };
        TaskGroupMap.assert = function (actual, expected) {
            var actualKeys = Object.keys(actual._store);
            var expectedKeys = Object.keys(expected._store);
            if (actualKeys.length === 0 && expectedKeys.length === 0) {
                return;
            }
            assert.strictEqual(actualKeys.length, expectedKeys.length);
            actualKeys.forEach(function (key) { return assert.ok(expected._store[key]); });
            expectedKeys.forEach(function (key) { return actual._store[key]; });
            actualKeys.forEach(function (key) {
                var actualTasks = actual._store[key];
                var expectedTasks = expected._store[key];
                assert.strictEqual(actualTasks.length, expectedTasks.length);
                if (actualTasks.length === 1) {
                    assert.strictEqual(actualTasks[0].name, expectedTasks[0].name);
                    return;
                }
                var expectedTaskMap = Object.create(null);
                expectedTasks.forEach(function (task) { return expectedTaskMap[task.name] = true; });
                actualTasks.forEach(function (task) { return delete expectedTaskMap[task.name]; });
                assert.strictEqual(Object.keys(expectedTaskMap).length, 0);
            });
        };
        return TaskGroupMap;
    }());
    function assertConfiguration(result, expected) {
        assert.ok(result.validationStatus.isOK());
        var actual = result.custom;
        assert.strictEqual(typeof actual, typeof expected);
        if (!actual) {
            return;
        }
        // We can't compare Ids since the parser uses UUID which are random
        // So create a new map using the name.
        var actualTasks = Object.create(null);
        var actualId2Name = Object.create(null);
        var actualTaskGroups = new TaskGroupMap();
        actual.forEach(function (task) {
            assert.ok(!actualTasks[task.name]);
            actualTasks[task.name] = task;
            actualId2Name[task._id] = task.name;
            if (task.group) {
                actualTaskGroups.add(task.group, task);
            }
        });
        var expectedTasks = Object.create(null);
        var expectedTaskGroup = new TaskGroupMap();
        expected.forEach(function (task) {
            assert.ok(!expectedTasks[task.name]);
            expectedTasks[task.name] = task;
            if (task.group) {
                expectedTaskGroup.add(task.group, task);
            }
        });
        var actualKeys = Object.keys(actualTasks);
        assert.strictEqual(actualKeys.length, expected.length);
        actualKeys.forEach(function (key) {
            var actualTask = actualTasks[key];
            var expectedTask = expectedTasks[key];
            assert.ok(expectedTask);
            assertTask(actualTask, expectedTask);
        });
        TaskGroupMap.assert(actualTaskGroups, expectedTaskGroup);
    }
    function assertTask(actual, expected) {
        assert.ok(actual._id);
        assert.strictEqual(actual.name, expected.name, 'name');
        if (!Tasks.InMemoryTask.is(actual) && !Tasks.InMemoryTask.is(expected)) {
            assertCommandConfiguration(actual.command, expected.command);
        }
        assert.strictEqual(actual.isBackground, expected.isBackground, 'isBackground');
        assert.strictEqual(typeof actual.problemMatchers, typeof expected.problemMatchers);
        assert.strictEqual(actual.promptOnClose, expected.promptOnClose, 'promptOnClose');
        assert.strictEqual(actual.group, expected.group, 'group');
        assert.strictEqual(actual.groupType, expected.groupType, 'groupType');
        if (actual.problemMatchers && expected.problemMatchers) {
            assert.strictEqual(actual.problemMatchers.length, expected.problemMatchers.length);
            for (var i = 0; i < actual.problemMatchers.length; i++) {
                assertProblemMatcher(actual.problemMatchers[i], expected.problemMatchers[i]);
            }
        }
    }
    function assertCommandConfiguration(actual, expected) {
        assert.strictEqual(typeof actual, typeof expected);
        if (actual && expected) {
            assertPresentation(actual.presentation, expected.presentation);
            assert.strictEqual(actual.name, expected.name, 'name');
            assert.strictEqual(actual.runtime, expected.runtime, 'runtime type');
            assert.strictEqual(actual.suppressTaskName, expected.suppressTaskName, 'suppressTaskName');
            assert.strictEqual(actual.taskSelector, expected.taskSelector, 'taskSelector');
            assert.deepEqual(actual.args, expected.args, 'args');
            assert.strictEqual(typeof actual.options, typeof expected.options);
            if (actual.options && expected.options) {
                assert.strictEqual(actual.options.cwd, expected.options.cwd, 'cwd');
                assert.strictEqual(typeof actual.options.env, typeof expected.options.env, 'env');
                if (actual.options.env && expected.options.env) {
                    assert.deepEqual(actual.options.env, expected.options.env, 'env');
                }
            }
        }
    }
    function assertPresentation(actual, expected) {
        assert.strictEqual(typeof actual, typeof expected);
        if (actual && expected) {
            assert.strictEqual(actual.echo, expected.echo);
            assert.strictEqual(actual.reveal, expected.reveal);
        }
    }
    function assertProblemMatcher(actual, expected) {
        assert.strictEqual(typeof actual, typeof expected);
        if (typeof actual === 'string' && typeof expected === 'string') {
            assert.strictEqual(actual, expected, 'Problem matcher references are different');
            return;
        }
        if (typeof actual !== 'string' && typeof expected !== 'string') {
            if (expected.owner === ProblemMatcherBuilder.DEFAULT_UUID) {
                try {
                    UUID.parse(actual.owner);
                }
                catch (err) {
                    assert.fail(actual.owner, 'Owner must be a UUID');
                }
            }
            else {
                assert.strictEqual(actual.owner, expected.owner);
            }
            assert.strictEqual(actual.applyTo, expected.applyTo);
            assert.strictEqual(actual.severity, expected.severity);
            assert.strictEqual(actual.fileLocation, expected.fileLocation);
            assert.strictEqual(actual.filePrefix, expected.filePrefix);
            if (actual.pattern && expected.pattern) {
                assertProblemPatterns(actual.pattern, expected.pattern);
            }
        }
    }
    function assertProblemPatterns(actual, expected) {
        assert.strictEqual(typeof actual, typeof expected);
        if (Array.isArray(actual)) {
            var actuals = actual;
            var expecteds = expected;
            assert.strictEqual(actuals.length, expecteds.length);
            for (var i = 0; i < actuals.length; i++) {
                assertProblemPattern(actuals[i], expecteds[i]);
            }
        }
        else {
            assertProblemPattern(actual, expected);
        }
    }
    function assertProblemPattern(actual, expected) {
        assert.equal(actual.regexp.toString(), expected.regexp.toString());
        assert.strictEqual(actual.file, expected.file);
        assert.strictEqual(actual.message, expected.message);
        if (typeof expected.location !== 'undefined') {
            assert.strictEqual(actual.location, expected.location);
        }
        else {
            assert.strictEqual(actual.line, expected.line);
            assert.strictEqual(actual.character, expected.character);
            assert.strictEqual(actual.endLine, expected.endLine);
            assert.strictEqual(actual.endCharacter, expected.endCharacter);
        }
        assert.strictEqual(actual.code, expected.code);
        assert.strictEqual(actual.severity, expected.severity);
        assert.strictEqual(actual.loop, expected.loop);
    }
    suite('Tasks version 0.1.0', function () {
        test('tasks: all default', function () {
            var builder = new ConfiguationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc'
            }, builder);
        });
        test('tasks: global isShellCommand', function () {
            var builder = new ConfiguationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                isShellCommand: true
            }, builder);
        });
        test('tasks: global show output silent', function () {
            var builder = new ConfiguationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().reveal(Tasks.RevealKind.Silent);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'silent'
            }, builder);
        });
        test('tasks: global promptOnClose default', function () {
            var builder = new ConfiguationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                promptOnClose: true
            }, builder);
        });
        test('tasks: global promptOnClose', function () {
            var builder = new ConfiguationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                promptOnClose(false).
                command().suppressTaskName(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                promptOnClose: false
            }, builder);
        });
        test('tasks: global promptOnClose default watching', function () {
            var builder = new ConfiguationBuilder();
            builder.task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                isBackground(true).
                promptOnClose(false).
                command().suppressTaskName(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                isWatching: true
            }, builder);
        });
        test('tasks: global show output never', function () {
            var builder = new ConfiguationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().reveal(Tasks.RevealKind.Never);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'never'
            }, builder);
        });
        test('tasks: global echo Command', function () {
            var builder = new ConfiguationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().
                echo(true);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                echoCommand: true
            }, builder);
        });
        test('tasks: global args', function () {
            var builder = new ConfiguationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                args(['--p']);
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                args: [
                    '--p'
                ]
            }, builder);
        });
        test('tasks: options - cwd', function () {
            var builder = new ConfiguationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                options({
                cwd: 'myPath'
            });
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                options: {
                    cwd: 'myPath'
                }
            }, builder);
        });
        test('tasks: options - env', function () {
            var builder = new ConfiguationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                options({ cwd: '${workspaceFolder}', env: { key: 'value' } });
            testConfiguration({
                version: '0.1.0',
                command: 'tsc',
                options: {
                    env: {
                        key: 'value'
                    }
                }
            }, builder);
        });
        test('tasks: os windows', function () {
            var name = Platform.isWindows ? 'tsc.win' : 'tsc';
            var builder = new ConfiguationBuilder();
            builder.
                task(name, name).
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                windows: {
                    command: 'tsc.win'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: os windows & global isShellCommand', function () {
            var name = Platform.isWindows ? 'tsc.win' : 'tsc';
            var builder = new ConfiguationBuilder();
            builder.
                task(name, name).
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                isShellCommand: true,
                windows: {
                    command: 'tsc.win'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: os mac', function () {
            var name = Platform.isMacintosh ? 'tsc.osx' : 'tsc';
            var builder = new ConfiguationBuilder();
            builder.
                task(name, name).
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                osx: {
                    command: 'tsc.osx'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: os linux', function () {
            var name = Platform.isLinux ? 'tsc.linux' : 'tsc';
            var builder = new ConfiguationBuilder();
            builder.
                task(name, name).
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                linux: {
                    command: 'tsc.linux'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: overwrite showOutput', function () {
            var builder = new ConfiguationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().reveal(Platform.isWindows ? Tasks.RevealKind.Always : Tasks.RevealKind.Never);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'never',
                windows: {
                    showOutput: 'always'
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: overwrite echo Command', function () {
            var builder = new ConfiguationBuilder();
            builder.
                task('tsc', 'tsc').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                presentation().
                echo(Platform.isWindows ? false : true);
            var external = {
                version: '0.1.0',
                command: 'tsc',
                echoCommand: true,
                windows: {
                    echoCommand: false
                }
            };
            testConfiguration(external, builder);
        });
        test('tasks: global problemMatcher one', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                problemMatcher: '$msCompile'
            };
            testDefaultProblemMatcher(external, 1);
        });
        test('tasks: global problemMatcher two', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                problemMatcher: ['$eslint-compact', '$msCompile']
            };
            testDefaultProblemMatcher(external, 2);
        });
        test('tasks: task definition', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: build task', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        isBuildCommand: true
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').group(Tasks.TaskGroup.Build).command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: default build task', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'build'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('build', 'tsc').group(Tasks.TaskGroup.Build).command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: test task', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        isTestCommand: true
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').group(Tasks.TaskGroup.Test).command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: default test task', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'test'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('test', 'tsc').group(Tasks.TaskGroup.Test).command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: task with values', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'test',
                        showOutput: 'never',
                        echoCommand: true,
                        args: ['--p'],
                        isWatching: true
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('test', 'tsc').
                group(Tasks.TaskGroup.Test).
                isBackground(true).
                promptOnClose(false).
                command().args(['$name', '--p']).
                presentation().
                echo(true).reveal(Tasks.RevealKind.Never);
            testConfiguration(external, builder);
        });
        test('tasks: task inherits global values', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                showOutput: 'never',
                echoCommand: true,
                tasks: [
                    {
                        taskName: 'test'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('test', 'tsc').
                group(Tasks.TaskGroup.Test).
                command().args(['$name']).presentation().
                echo(true).reveal(Tasks.RevealKind.Never);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher default', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: 'abc'
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().pattern(/abc/);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher .* regular expression', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: '.*'
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().pattern(/.*/);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher owner, applyTo, severity and fileLocation', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            owner: 'myOwner',
                            applyTo: 'closedDocuments',
                            severity: 'warning',
                            fileLocation: 'absolute',
                            pattern: {
                                regexp: 'abc'
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().
                owner('myOwner').
                applyTo(problemMatcher_1.ApplyToKind.closedDocuments).
                severity(severity_1.default.Warning).
                fileLocation(problemMatcher_1.FileLocationKind.Absolute).
                filePrefix(undefined).
                pattern(/abc/);
            testConfiguration(external, builder);
        });
        test('tasks: problem matcher fileLocation and filePrefix', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            fileLocation: ['relative', 'myPath'],
                            pattern: {
                                regexp: 'abc'
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().
                fileLocation(problemMatcher_1.FileLocationKind.Relative).
                filePrefix('myPath').
                pattern(/abc/);
            testConfiguration(external, builder);
        });
        test('tasks: problem pattern location', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: 'abc',
                                file: 10,
                                message: 11,
                                location: 12,
                                severity: 13,
                                code: 14
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().
                pattern(/abc/).file(10).message(11).location(12).severity(13).code(14);
            testConfiguration(external, builder);
        });
        test('tasks: problem pattern line & column', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        problemMatcher: {
                            pattern: {
                                regexp: 'abc',
                                file: 10,
                                message: 11,
                                line: 12,
                                column: 13,
                                endLine: 14,
                                endColumn: 15,
                                severity: 16,
                                code: 17
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                command().args(['$name']).parent.
                problemMatcher().
                pattern(/abc/).file(10).message(11).
                line(12).character(13).endLine(14).endCharacter(15).
                severity(16).code(17);
            testConfiguration(external, builder);
        });
        test('tasks: prompt on close default', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                promptOnClose(true).
                command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: prompt on close watching', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        isWatching: true
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                isBackground(true).promptOnClose(false).
                command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: prompt on close set', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskName',
                        promptOnClose: false
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                promptOnClose(false).
                command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: task selector set', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                taskSelector: '/t:',
                tasks: [
                    {
                        taskName: 'taskName',
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                command().
                taskSelector('/t:').
                args(['/t:taskName']);
            testConfiguration(external, builder);
        });
        test('tasks: suppress task name set', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                suppressTaskName: false,
                tasks: [
                    {
                        taskName: 'taskName',
                        suppressTaskName: true
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: suppress task name inherit', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                suppressTaskName: true,
                tasks: [
                    {
                        taskName: 'taskName'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskName', 'tsc').
                command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: two tasks', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskNameOne'
                    },
                    {
                        taskName: 'taskNameTwo'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskNameOne', 'tsc').
                command().args(['$name']);
            builder.task('taskNameTwo', 'tsc').
                command().args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: with command', function () {
            var external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        command: 'tsc'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskNameOne', 'tsc').command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: two tasks with command', function () {
            var external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        command: 'tsc'
                    },
                    {
                        taskName: 'taskNameTwo',
                        command: 'dir'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskNameOne', 'tsc').command().suppressTaskName(true);
            builder.task('taskNameTwo', 'dir').command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: with command and args', function () {
            var external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        command: 'tsc',
                        isShellCommand: true,
                        args: ['arg'],
                        options: {
                            cwd: 'cwd',
                            env: {
                                env: 'env'
                            }
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskNameOne', 'tsc').command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).args(['arg']).options({ cwd: 'cwd', env: { env: 'env' } });
            testConfiguration(external, builder);
        });
        test('tasks: with command os specific', function () {
            var name = Platform.isWindows ? 'tsc.win' : 'tsc';
            var external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        command: 'tsc',
                        windows: {
                            command: 'tsc.win'
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskNameOne', name).command().suppressTaskName(true);
            testConfiguration(external, builder);
        });
        test('tasks: with Windows specific args', function () {
            var args = Platform.isWindows ? ['arg1', 'arg2'] : ['arg1'];
            var external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'tsc',
                        command: 'tsc',
                        args: ['arg1'],
                        windows: {
                            args: ['arg2']
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('tsc', 'tsc').command().suppressTaskName(true).args(args);
            testConfiguration(external, builder);
        });
        test('tasks: with Linux specific args', function () {
            var args = Platform.isLinux ? ['arg1', 'arg2'] : ['arg1'];
            var external = {
                version: '0.1.0',
                tasks: [
                    {
                        taskName: 'tsc',
                        command: 'tsc',
                        args: ['arg1'],
                        linux: {
                            args: ['arg2']
                        }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('tsc', 'tsc').command().suppressTaskName(true).args(args);
            testConfiguration(external, builder);
        });
        test('tasks: global command and task command properties', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        isShellCommand: true,
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskNameOne', 'tsc').command().runtime(Tasks.RuntimeType.Shell).args(['$name']);
            testConfiguration(external, builder);
        });
        test('tasks: global and tasks args', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                args: ['global'],
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        args: ['local']
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskNameOne', 'tsc').command().args(['global', '$name', 'local']);
            testConfiguration(external, builder);
        });
        test('tasks: global and tasks args with task selector', function () {
            var external = {
                version: '0.1.0',
                command: 'tsc',
                args: ['global'],
                taskSelector: '/t:',
                tasks: [
                    {
                        taskName: 'taskNameOne',
                        args: ['local']
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('taskNameOne', 'tsc').command().taskSelector('/t:').args(['global', '/t:taskNameOne', 'local']);
            testConfiguration(external, builder);
        });
    });
    suite('Tasks version 2.0.0', function () {
        test('Build workspace task', function () {
            var external = {
                version: '2.0.0',
                tasks: [
                    {
                        taskName: 'dir',
                        command: 'dir',
                        type: 'shell',
                        group: 'build'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('dir', 'dir').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test('Global group none', function () {
            var external = {
                version: '2.0.0',
                command: 'dir',
                type: 'shell',
                group: 'none'
            };
            var builder = new ConfiguationBuilder();
            builder.task('dir', 'dir').
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test('Global group build', function () {
            var external = {
                version: '2.0.0',
                command: 'dir',
                type: 'shell',
                group: 'build'
            };
            var builder = new ConfiguationBuilder();
            builder.task('dir', 'dir').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test('Global group default build', function () {
            var external = {
                version: '2.0.0',
                command: 'dir',
                type: 'shell',
                group: { kind: 'build', isDefault: true }
            };
            var builder = new ConfiguationBuilder();
            builder.task('dir', 'dir').
                group(Tasks.TaskGroup.Build).
                groupType(Tasks.GroupType.default).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test('Local group none', function () {
            var external = {
                version: '2.0.0',
                tasks: [
                    {
                        taskName: 'dir',
                        command: 'dir',
                        type: 'shell',
                        group: 'none'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('dir', 'dir').
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test('Local group build', function () {
            var external = {
                version: '2.0.0',
                tasks: [
                    {
                        taskName: 'dir',
                        command: 'dir',
                        type: 'shell',
                        group: 'build'
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('dir', 'dir').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
        test('Local group default build', function () {
            var external = {
                version: '2.0.0',
                tasks: [
                    {
                        taskName: 'dir',
                        command: 'dir',
                        type: 'shell',
                        group: { kind: 'build', isDefault: true }
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('dir', 'dir').
                group(Tasks.TaskGroup.Build).
                groupType(Tasks.GroupType.default).
                command().suppressTaskName(true).
                runtime(Tasks.RuntimeType.Shell).
                presentation().echo(true);
            testConfiguration(external, builder);
        });
    });
    suite('Bugs / regression tests', function () {
        test('Bug 19548', function () {
            if (Platform.isLinux) {
                return;
            }
            var external = {
                version: '0.1.0',
                windows: {
                    command: 'powershell',
                    options: {
                        cwd: '${workspaceFolder}'
                    },
                    tasks: [
                        {
                            taskName: 'composeForDebug',
                            suppressTaskName: true,
                            args: [
                                '-ExecutionPolicy',
                                'RemoteSigned',
                                '.\\dockerTask.ps1',
                                '-ComposeForDebug',
                                '-Environment',
                                'debug'
                            ],
                            isBuildCommand: false,
                            showOutput: 'always',
                            echoCommand: true
                        }
                    ]
                },
                osx: {
                    command: '/bin/bash',
                    options: {
                        cwd: '${workspaceFolder}'
                    },
                    tasks: [
                        {
                            taskName: 'composeForDebug',
                            suppressTaskName: true,
                            args: [
                                '-c',
                                './dockerTask.sh composeForDebug debug'
                            ],
                            isBuildCommand: false,
                            showOutput: 'always'
                        }
                    ]
                }
            };
            var builder = new ConfiguationBuilder();
            if (Platform.isWindows) {
                builder.task('composeForDebug', 'powershell').
                    command().suppressTaskName(true).
                    args(['-ExecutionPolicy', 'RemoteSigned', '.\\dockerTask.ps1', '-ComposeForDebug', '-Environment', 'debug']).
                    options({ cwd: '${workspaceFolder}' }).
                    presentation().echo(true).reveal(Tasks.RevealKind.Always);
                testConfiguration(external, builder);
            }
            else if (Platform.isMacintosh) {
                builder.task('composeForDebug', '/bin/bash').
                    command().suppressTaskName(true).
                    args(['-c', './dockerTask.sh composeForDebug debug']).
                    options({ cwd: '${workspaceFolder}' }).
                    presentation().reveal(Tasks.RevealKind.Always);
                testConfiguration(external, builder);
            }
        });
        test('Bug 28489', function () {
            var external = {
                version: '0.1.0',
                command: '',
                isShellCommand: true,
                args: [''],
                showOutput: 'always',
                'tasks': [
                    {
                        taskName: 'build',
                        command: 'bash',
                        args: [
                            'build.sh'
                        ]
                    }
                ]
            };
            var builder = new ConfiguationBuilder();
            builder.task('build', 'bash').
                group(Tasks.TaskGroup.Build).
                command().suppressTaskName(true).
                args(['build.sh']).
                runtime(Tasks.RuntimeType.Shell);
            testConfiguration(external, builder);
        });
    });
});
