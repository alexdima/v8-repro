define(["require", "exports", "crypto", "vs/nls", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uuid", "vs/platform/markers/common/problemMatcher", "../common/tasks", "../common/taskDefinitionRegistry"], function (require, exports, crypto, nls, Objects, Platform, Types, UUID, problemMatcher_1, Tasks, taskDefinitionRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProblemMatcherKind;
    (function (ProblemMatcherKind) {
        ProblemMatcherKind[ProblemMatcherKind["Unknown"] = 0] = "Unknown";
        ProblemMatcherKind[ProblemMatcherKind["String"] = 1] = "String";
        ProblemMatcherKind[ProblemMatcherKind["ProblemMatcher"] = 2] = "ProblemMatcher";
        ProblemMatcherKind[ProblemMatcherKind["Array"] = 3] = "Array";
    })(ProblemMatcherKind || (ProblemMatcherKind = {}));
    var EMPTY_ARRAY = [];
    Object.freeze(EMPTY_ARRAY);
    function assignProperty(target, source, key) {
        if (source[key] !== void 0) {
            target[key] = source[key];
        }
    }
    function fillProperty(target, source, key) {
        if (target[key] === void 0 && source[key] !== void 0) {
            target[key] = source[key];
        }
    }
    function _isEmpty(value, properties) {
        if (value === void 0 || value === null) {
            return true;
        }
        for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
            var meta = properties_1[_i];
            var property = value[meta.property];
            if (property !== void 0 && property !== null) {
                if (meta.type !== void 0 && !meta.type.isEmpty(property)) {
                    return false;
                }
                else if (!Array.isArray(property) || property.length > 0) {
                    return false;
                }
            }
        }
        return true;
    }
    function _assignProperties(target, source, properties) {
        if (_isEmpty(source, properties)) {
            return target;
        }
        if (_isEmpty(target, properties)) {
            return source;
        }
        for (var _i = 0, properties_2 = properties; _i < properties_2.length; _i++) {
            var meta = properties_2[_i];
            var property = meta.property;
            var value = void 0;
            if (meta.type !== void 0) {
                value = meta.type.assignProperties(target[property], source[property]);
            }
            else {
                value = source[property];
            }
            if (value !== void 0 && value !== null) {
                target[property] = value;
            }
        }
        return target;
    }
    function _fillProperties(target, source, properties) {
        if (_isEmpty(source, properties)) {
            return target;
        }
        if (_isEmpty(target, properties)) {
            return source;
        }
        for (var _i = 0, properties_3 = properties; _i < properties_3.length; _i++) {
            var meta = properties_3[_i];
            var property = meta.property;
            var value = void 0;
            if (meta.type) {
                value = meta.type.fillProperties(target[property], source[property]);
            }
            else if (target[property] === void 0) {
                value = source[property];
            }
            if (value !== void 0 && value !== null) {
                target[property] = value;
            }
        }
        return target;
    }
    function _fillDefaults(target, defaults, properties, context) {
        if (target && Object.isFrozen(target)) {
            return target;
        }
        if (target === void 0 || target === null) {
            if (defaults !== void 0 && defaults !== null) {
                return Objects.deepClone(defaults);
            }
            else {
                return undefined;
            }
        }
        for (var _i = 0, properties_4 = properties; _i < properties_4.length; _i++) {
            var meta = properties_4[_i];
            var property = meta.property;
            if (target[property] !== void 0) {
                continue;
            }
            var value = void 0;
            if (meta.type) {
                value = meta.type.fillDefaults(target[property], context);
            }
            else {
                value = defaults[property];
            }
            if (value !== void 0 && value !== null) {
                target[property] = value;
            }
        }
        return target;
    }
    function _freeze(target, properties) {
        if (target === void 0 || target === null) {
            return undefined;
        }
        if (Object.isFrozen(target)) {
            return target;
        }
        for (var _i = 0, properties_5 = properties; _i < properties_5.length; _i++) {
            var meta = properties_5[_i];
            if (meta.type) {
                var value = target[meta.property];
                if (value) {
                    meta.type.freeze(value);
                }
            }
        }
        Object.freeze(target);
        return target;
    }
    var ShellConfiguration;
    (function (ShellConfiguration) {
        var properties = [{ property: 'executable' }, { property: 'args' }];
        function is(value) {
            var candidate = value;
            return candidate && Types.isString(candidate.executable) && (candidate.args === void 0 || Types.isStringArray(candidate.args));
        }
        ShellConfiguration.is = is;
        function from(config, context) {
            if (!is(config)) {
                return undefined;
            }
            var result = { executable: config.executable };
            if (config.args !== void 0) {
                result.args = config.args.slice();
            }
            return result;
        }
        ShellConfiguration.from = from;
        function isEmpty(value) {
            return _isEmpty(value, properties);
        }
        ShellConfiguration.isEmpty = isEmpty;
        function assignProperties(target, source) {
            return _assignProperties(target, source, properties);
        }
        ShellConfiguration.assignProperties = assignProperties;
        function fillProperties(target, source) {
            return _fillProperties(target, source, properties);
        }
        ShellConfiguration.fillProperties = fillProperties;
        function fillDefaults(value, context) {
            return value;
        }
        ShellConfiguration.fillDefaults = fillDefaults;
        function freeze(value) {
            if (!value) {
                return undefined;
            }
            return Object.freeze(value);
        }
        ShellConfiguration.freeze = freeze;
    })(ShellConfiguration || (ShellConfiguration = {}));
    var CommandOptions;
    (function (CommandOptions) {
        var properties = [{ property: 'cwd' }, { property: 'env' }, { property: 'shell', type: ShellConfiguration }];
        var defaults = { cwd: '${workspaceFolder}' };
        function from(options, context) {
            var result = {};
            if (options.cwd !== void 0) {
                if (Types.isString(options.cwd)) {
                    result.cwd = options.cwd;
                }
                else {
                    context.problemReporter.warn(nls.localize('ConfigurationParser.invalidCWD', 'Warning: options.cwd must be of type string. Ignoring value {0}\n', options.cwd));
                }
            }
            if (options.env !== void 0) {
                result.env = Objects.deepClone(options.env);
            }
            result.shell = ShellConfiguration.from(options.shell, context);
            return isEmpty(result) ? undefined : result;
        }
        CommandOptions.from = from;
        function isEmpty(value) {
            return _isEmpty(value, properties);
        }
        CommandOptions.isEmpty = isEmpty;
        function assignProperties(target, source) {
            if (isEmpty(source)) {
                return target;
            }
            if (isEmpty(target)) {
                return source;
            }
            assignProperty(target, source, 'cwd');
            if (target.env === void 0) {
                target.env = source.env;
            }
            else if (source.env !== void 0) {
                var env_1 = Object.create(null);
                Object.keys(target.env).forEach(function (key) { return env_1[key] = target.env[key]; });
                Object.keys(source.env).forEach(function (key) { return env_1[key] = source.env[key]; });
                target.env = env_1;
            }
            target.shell = ShellConfiguration.assignProperties(target.shell, source.shell);
            return target;
        }
        CommandOptions.assignProperties = assignProperties;
        function fillProperties(target, source) {
            return _fillProperties(target, source, properties);
        }
        CommandOptions.fillProperties = fillProperties;
        function fillDefaults(value, context) {
            return _fillDefaults(value, defaults, properties, context);
        }
        CommandOptions.fillDefaults = fillDefaults;
        function freeze(value) {
            return _freeze(value, properties);
        }
        CommandOptions.freeze = freeze;
    })(CommandOptions || (CommandOptions = {}));
    var CommandConfiguration;
    (function (CommandConfiguration) {
        var PresentationOptions;
        (function (PresentationOptions) {
            var properties = [{ property: 'echo' }, { property: 'reveal' }, { property: 'focus' }, { property: 'panel' }];
            function from(config, context) {
                var echo;
                var reveal;
                var focus;
                var panel;
                if (Types.isBoolean(config.echoCommand)) {
                    echo = config.echoCommand;
                }
                if (Types.isString(config.showOutput)) {
                    reveal = Tasks.RevealKind.fromString(config.showOutput);
                }
                var presentation = config.presentation || config.terminal;
                if (presentation) {
                    if (Types.isBoolean(presentation.echo)) {
                        echo = presentation.echo;
                    }
                    if (Types.isString(presentation.reveal)) {
                        reveal = Tasks.RevealKind.fromString(presentation.reveal);
                    }
                    if (Types.isBoolean(presentation.focus)) {
                        focus = presentation.focus;
                    }
                    if (Types.isString(presentation.panel)) {
                        panel = Tasks.PanelKind.fromString(presentation.panel);
                    }
                }
                if (echo === void 0 && reveal === void 0 && focus === void 0 && panel === void 0) {
                    return undefined;
                }
                return { echo: echo, reveal: reveal, focus: focus, panel: panel };
            }
            PresentationOptions.from = from;
            function assignProperties(target, source) {
                return _assignProperties(target, source, properties);
            }
            PresentationOptions.assignProperties = assignProperties;
            function fillProperties(target, source) {
                return _fillProperties(target, source, properties);
            }
            PresentationOptions.fillProperties = fillProperties;
            function fillDefaults(value, context) {
                var defaultEcho = context.engine === Tasks.ExecutionEngine.Terminal ? true : false;
                return _fillDefaults(value, { echo: defaultEcho, reveal: Tasks.RevealKind.Always, focus: false, panel: Tasks.PanelKind.Shared }, properties, context);
            }
            PresentationOptions.fillDefaults = fillDefaults;
            function freeze(value) {
                return _freeze(value, properties);
            }
            PresentationOptions.freeze = freeze;
            function isEmpty(value) {
                return _isEmpty(value, properties);
            }
            PresentationOptions.isEmpty = isEmpty;
        })(PresentationOptions = CommandConfiguration.PresentationOptions || (CommandConfiguration.PresentationOptions = {}));
        var properties = [
            { property: 'runtime' }, { property: 'name' }, { property: 'options', type: CommandOptions },
            { property: 'args' }, { property: 'taskSelector' }, { property: 'suppressTaskName' },
            { property: 'presentation', type: PresentationOptions }
        ];
        function from(config, context) {
            var result = fromBase(config, context);
            var osConfig = undefined;
            if (config.windows && Platform.platform === Platform.Platform.Windows) {
                osConfig = fromBase(config.windows, context);
            }
            else if (config.osx && Platform.platform === Platform.Platform.Mac) {
                osConfig = fromBase(config.osx, context);
            }
            else if (config.linux && Platform.platform === Platform.Platform.Linux) {
                osConfig = fromBase(config.linux, context);
            }
            if (osConfig) {
                result = assignProperties(result, osConfig);
            }
            return isEmpty(result) ? undefined : result;
        }
        CommandConfiguration.from = from;
        function fromBase(config, context) {
            var result = {
                name: undefined,
                runtime: undefined,
                presentation: undefined
            };
            if (Types.isString(config.command)) {
                result.name = config.command;
            }
            if (Types.isString(config.type)) {
                if (config.type === 'shell' || config.type === 'process') {
                    result.runtime = Tasks.RuntimeType.fromString(config.type);
                }
            }
            var isShellConfiguration = ShellConfiguration.is(config.isShellCommand);
            if (Types.isBoolean(config.isShellCommand) || isShellConfiguration) {
                result.runtime = Tasks.RuntimeType.Shell;
            }
            else if (config.isShellCommand !== void 0) {
                result.runtime = !!config.isShellCommand ? Tasks.RuntimeType.Shell : Tasks.RuntimeType.Process;
            }
            if (Types.isString(config.runtime)) {
                result.runtime = Tasks.RuntimeType.fromString(config.runtime);
            }
            if (config.args !== void 0) {
                if (Types.isStringArray(config.args)) {
                    result.args = config.args.slice(0);
                }
                else {
                    context.problemReporter.error(nls.localize('ConfigurationParser.noargs', 'Error: command arguments must be an array of strings. Provided value is:\n{0}', config.args ? JSON.stringify(config.args, undefined, 4) : 'undefined'));
                }
            }
            if (config.options !== void 0) {
                result.options = CommandOptions.from(config.options, context);
                if (result.options && result.options.shell === void 0 && isShellConfiguration) {
                    result.options.shell = ShellConfiguration.from(config.isShellCommand, context);
                    if (context.engine !== Tasks.ExecutionEngine.Terminal) {
                        context.problemReporter.warn(nls.localize('ConfigurationParser.noShell', 'Warning: shell configuration is only supported when executing tasks in the terminal.'));
                    }
                }
            }
            var panel = PresentationOptions.from(config, context);
            if (panel) {
                result.presentation = panel;
            }
            if (Types.isString(config.taskSelector)) {
                result.taskSelector = config.taskSelector;
            }
            if (Types.isBoolean(config.suppressTaskName)) {
                result.suppressTaskName = config.suppressTaskName;
            }
            return isEmpty(result) ? undefined : result;
        }
        function hasCommand(value) {
            return value && !!value.name;
        }
        CommandConfiguration.hasCommand = hasCommand;
        function isEmpty(value) {
            return _isEmpty(value, properties);
        }
        CommandConfiguration.isEmpty = isEmpty;
        function assignProperties(target, source) {
            if (isEmpty(source)) {
                return target;
            }
            if (isEmpty(target)) {
                return source;
            }
            assignProperty(target, source, 'name');
            assignProperty(target, source, 'runtime');
            assignProperty(target, source, 'taskSelector');
            assignProperty(target, source, 'suppressTaskName');
            if (source.args !== void 0) {
                if (target.args === void 0) {
                    target.args = source.args;
                }
                else {
                    target.args = target.args.concat(source.args);
                }
            }
            target.presentation = PresentationOptions.assignProperties(target.presentation, source.presentation);
            target.options = CommandOptions.assignProperties(target.options, source.options);
            return target;
        }
        CommandConfiguration.assignProperties = assignProperties;
        function fillProperties(target, source) {
            return _fillProperties(target, source, properties);
        }
        CommandConfiguration.fillProperties = fillProperties;
        function fillGlobals(target, source, taskName) {
            if (isEmpty(source)) {
                return target;
            }
            target = target || {
                name: undefined,
                runtime: undefined,
                presentation: undefined
            };
            if (target.name === void 0) {
                fillProperty(target, source, 'name');
                fillProperty(target, source, 'taskSelector');
                fillProperty(target, source, 'suppressTaskName');
                var args = source.args ? source.args.slice() : [];
                if (!target.suppressTaskName) {
                    if (target.taskSelector !== void 0) {
                        args.push(target.taskSelector + taskName);
                    }
                    else {
                        args.push(taskName);
                    }
                }
                if (target.args) {
                    args = args.concat(target.args);
                }
                target.args = args;
            }
            fillProperty(target, source, 'runtime');
            target.presentation = PresentationOptions.fillProperties(target.presentation, source.presentation);
            target.options = CommandOptions.fillProperties(target.options, source.options);
            return target;
        }
        CommandConfiguration.fillGlobals = fillGlobals;
        function fillDefaults(value, context) {
            if (!value || Object.isFrozen(value)) {
                return;
            }
            if (value.name !== void 0 && value.runtime === void 0) {
                value.runtime = Tasks.RuntimeType.Process;
            }
            value.presentation = PresentationOptions.fillDefaults(value.presentation, context);
            if (!isEmpty(value)) {
                value.options = CommandOptions.fillDefaults(value.options, context);
            }
            if (value.args === void 0) {
                value.args = EMPTY_ARRAY;
            }
            if (value.suppressTaskName === void 0) {
                value.suppressTaskName = false;
            }
        }
        CommandConfiguration.fillDefaults = fillDefaults;
        function freeze(value) {
            return _freeze(value, properties);
        }
        CommandConfiguration.freeze = freeze;
    })(CommandConfiguration || (CommandConfiguration = {}));
    var ProblemMatcherConverter;
    (function (ProblemMatcherConverter) {
        function namedFrom(declares, context) {
            var result = Object.create(null);
            if (!Types.isArray(declares)) {
                return result;
            }
            declares.forEach(function (value) {
                var namedProblemMatcher = (new problemMatcher_1.ProblemMatcherParser(context.problemReporter)).parse(value);
                if (problemMatcher_1.isNamedProblemMatcher(namedProblemMatcher)) {
                    result[namedProblemMatcher.name] = namedProblemMatcher;
                }
                else {
                    context.problemReporter.error(nls.localize('ConfigurationParser.noName', 'Error: Problem Matcher in declare scope must have a name:\n{0}\n', JSON.stringify(value, undefined, 4)));
                }
            });
            return result;
        }
        ProblemMatcherConverter.namedFrom = namedFrom;
        function from(config, context) {
            var result = [];
            if (config === void 0) {
                return result;
            }
            var kind = getProblemMatcherKind(config);
            if (kind === ProblemMatcherKind.Unknown) {
                context.problemReporter.warn(nls.localize('ConfigurationParser.unknownMatcherKind', 'Warning: the defined problem matcher is unknown. Supported types are string | ProblemMatcher | (string | ProblemMatcher)[].\n{0}\n', JSON.stringify(config, null, 4)));
                return result;
            }
            else if (kind === ProblemMatcherKind.String || kind === ProblemMatcherKind.ProblemMatcher) {
                var matcher = resolveProblemMatcher(config, context);
                if (matcher) {
                    result.push(matcher);
                }
            }
            else if (kind === ProblemMatcherKind.Array) {
                var problemMatchers = config;
                problemMatchers.forEach(function (problemMatcher) {
                    var matcher = resolveProblemMatcher(problemMatcher, context);
                    if (matcher) {
                        result.push(matcher);
                    }
                });
            }
            return result;
        }
        ProblemMatcherConverter.from = from;
        function getProblemMatcherKind(value) {
            if (Types.isString(value)) {
                return ProblemMatcherKind.String;
            }
            else if (Types.isArray(value)) {
                return ProblemMatcherKind.Array;
            }
            else if (!Types.isUndefined(value)) {
                return ProblemMatcherKind.ProblemMatcher;
            }
            else {
                return ProblemMatcherKind.Unknown;
            }
        }
        function resolveProblemMatcher(value, context) {
            if (Types.isString(value)) {
                var variableName = value;
                if (variableName.length > 1 && variableName[0] === '$') {
                    variableName = variableName.substring(1);
                    var global_1 = problemMatcher_1.ProblemMatcherRegistry.get(variableName);
                    if (global_1) {
                        return Objects.deepClone(global_1);
                    }
                    var localProblemMatcher = context.namedProblemMatchers[variableName];
                    if (localProblemMatcher) {
                        localProblemMatcher = Objects.deepClone(localProblemMatcher);
                        // remove the name
                        delete localProblemMatcher.name;
                        return localProblemMatcher;
                    }
                }
                context.problemReporter.error(nls.localize('ConfigurationParser.invalidVaraibleReference', 'Error: Invalid problemMatcher reference: {0}\n', value));
                return undefined;
            }
            else {
                var json = value;
                return new problemMatcher_1.ProblemMatcherParser(context.problemReporter).parse(json);
            }
        }
    })(ProblemMatcherConverter || (ProblemMatcherConverter = {}));
    var TaskIdentifier;
    (function (TaskIdentifier) {
        function from(value) {
            if (!value || !Types.isString(value.type)) {
                return undefined;
            }
            var hash = crypto.createHash('md5');
            hash.update(JSON.stringify(value));
            var key = hash.digest('hex');
            var result = {
                _key: key,
                type: value.type
            };
            result = Objects.assign(result, value);
            return result;
        }
        TaskIdentifier.from = from;
    })(TaskIdentifier || (TaskIdentifier = {}));
    var source = {
        kind: Tasks.TaskSourceKind.Workspace,
        label: 'Workspace',
        config: undefined
    };
    var GroupKind;
    (function (GroupKind) {
        function from(external) {
            if (external === void 0) {
                return undefined;
            }
            if (Types.isString(external)) {
                if (Tasks.TaskGroup.is(external)) {
                    return [external, Tasks.GroupType.user];
                }
                else {
                    return undefined;
                }
            }
            if (!Types.isString(external.kind) || !Tasks.TaskGroup.is(external.kind)) {
                return undefined;
            }
            var group = external.kind;
            var isDefault = !!external.isDefault;
            return [group, isDefault ? Tasks.GroupType.default : Tasks.GroupType.user];
        }
        GroupKind.from = from;
    })(GroupKind || (GroupKind = {}));
    var ConfigurationProperties;
    (function (ConfigurationProperties) {
        var properties = [
            { property: 'name' }, { property: 'identifier' }, { property: 'group' }, { property: 'isBackground' },
            { property: 'promptOnClose' }, { property: 'dependsOn' },
            { property: 'presentation', type: CommandConfiguration.PresentationOptions }, { property: 'problemMatchers' }
        ];
        function from(external, context, includePresentation) {
            if (!external) {
                return undefined;
            }
            var result = {};
            if (Types.isString(external.taskName)) {
                result.name = external.taskName;
            }
            if (Types.isString(external.label) && context.schemaVersion === Tasks.JsonSchemaVersion.V2_0_0) {
                result.name = external.label;
            }
            if (Types.isString(external.identifier)) {
                result.identifier = external.identifier;
            }
            if (external.isBackground !== void 0) {
                result.isBackground = !!external.isBackground;
            }
            if (external.promptOnClose !== void 0) {
                result.promptOnClose = !!external.promptOnClose;
            }
            if (external.group !== void 0) {
                if (Types.isString(external.group) && Tasks.TaskGroup.is(external.group)) {
                    result.group = external.group;
                    result.groupType = Tasks.GroupType.user;
                }
                else {
                    var values = GroupKind.from(external.group);
                    if (values) {
                        result.group = values[0];
                        result.groupType = values[1];
                    }
                }
            }
            if (external.dependsOn !== void 0) {
                if (Types.isString(external.dependsOn)) {
                    result.dependsOn = [{ workspaceFolder: context.workspaceFolder, task: external.dependsOn }];
                }
                else if (Types.isStringArray(external.dependsOn)) {
                    result.dependsOn = external.dependsOn.map(function (task) { return { workspaceFolder: context.workspaceFolder, task: task }; });
                }
            }
            if (includePresentation && (external.presentation !== void 0 || external.terminal !== void 0)) {
                result.presentation = CommandConfiguration.PresentationOptions.from(external, context);
            }
            if (external.problemMatcher) {
                result.problemMatchers = ProblemMatcherConverter.from(external.problemMatcher, context);
            }
            return isEmpty(result) ? undefined : result;
        }
        ConfigurationProperties.from = from;
        function isEmpty(value) {
            return _isEmpty(value, properties);
        }
        ConfigurationProperties.isEmpty = isEmpty;
    })(ConfigurationProperties || (ConfigurationProperties = {}));
    var ConfiguringTask;
    (function (ConfiguringTask) {
        var grunt = 'grunt.';
        var jake = 'jake.';
        var gulp = 'gulp.';
        var npm = 'vscode.npm.';
        var typescript = 'vscode.typescript.';
        function from(external, context, index) {
            if (!external) {
                return undefined;
            }
            var type = external.type;
            var customize = external.customize;
            if (!type && !customize) {
                context.problemReporter.error(nls.localize('ConfigurationParser.noTaskType', 'Error: tasks configuration must have a type property. The configuration will be ignored.\n{0}\n', JSON.stringify(external, null, 4)));
                return undefined;
            }
            var typeDeclaration = taskDefinitionRegistry_1.TaskDefinitionRegistry.get(type);
            if (!typeDeclaration) {
                var message = nls.localize('ConfigurationParser.noTypeDefinition', 'Error: there is no registered task type \'{0}\'. Did you miss to install an extension that provides a corresponding task provider?', type);
                context.problemReporter.error(message);
                return undefined;
            }
            var identifier;
            if (Types.isString(customize)) {
                if (customize.indexOf(grunt) === 0) {
                    identifier = { type: 'grunt', task: customize.substring(grunt.length) };
                }
                else if (customize.indexOf(jake) === 0) {
                    identifier = { type: 'jake', task: customize.substring(jake.length) };
                }
                else if (customize.indexOf(gulp) === 0) {
                    identifier = { type: 'gulp', task: customize.substring(gulp.length) };
                }
                else if (customize.indexOf(npm) === 0) {
                    identifier = { type: 'npm', script: customize.substring(npm.length + 4) };
                }
                else if (customize.indexOf(typescript) === 0) {
                    identifier = { type: 'typescript', tsconfig: customize.substring(typescript.length + 6) };
                }
            }
            else {
                identifier = {
                    type: type
                };
                var properties = typeDeclaration.properties;
                var required_1 = new Set();
                if (Array.isArray(typeDeclaration.required)) {
                    typeDeclaration.required.forEach(function (element) { return Types.isString(element) ? required_1.add(element) : required_1; });
                }
                for (var _i = 0, _a = Object.keys(properties); _i < _a.length; _i++) {
                    var property = _a[_i];
                    var value = external[property];
                    if (value !== void 0 && value !== null) {
                        identifier[property] = value;
                    }
                    else if (required_1.has(property)) {
                        var schema = properties[property];
                        if (schema.default !== void 0) {
                            identifier[property] = Objects.deepClone(schema.default);
                        }
                        else {
                            switch (schema.type) {
                                case 'boolean':
                                    identifier[property] = false;
                                    break;
                                case 'number':
                                case 'integer':
                                    identifier[property] = 0;
                                    break;
                                case 'string':
                                    identifier[property] = '';
                                    break;
                                default:
                                    var message = nls.localize('ConfigurationParser.missingRequiredProperty', 'Error: the task configuration \'{0}\' missed the required property \'{1}\'. The task configuration will be ignored.', JSON.stringify(external, undefined, 0), property);
                                    context.problemReporter.error(message);
                                    return undefined;
                            }
                        }
                    }
                }
            }
            var taskIdentifier = TaskIdentifier.from(identifier);
            var configElement = {
                workspaceFolder: context.workspaceFolder,
                file: '.vscode\\tasks.json',
                index: index,
                element: external
            };
            var result = {
                type: type,
                configures: taskIdentifier,
                _id: typeDeclaration.extensionId + "." + taskIdentifier._key,
                _source: Objects.assign({}, source, { config: configElement }),
                _label: undefined
            };
            var configuration = ConfigurationProperties.from(external, context, true);
            if (configuration) {
                result = Objects.assign(result, configuration);
                if (result.name) {
                    result._label = result.name;
                }
                else {
                    var label = result.configures.type;
                    if (typeDeclaration.required && typeDeclaration.required.length > 0) {
                        for (var _b = 0, _c = typeDeclaration.required; _b < _c.length; _b++) {
                            var required = _c[_b];
                            var value = result.configures[required];
                            if (value) {
                                label = label + ' ' + value;
                                break;
                            }
                        }
                    }
                    result._label = label;
                }
                if (!result.identifier) {
                    result.identifier = taskIdentifier._key;
                }
            }
            return result;
        }
        ConfiguringTask.from = from;
    })(ConfiguringTask || (ConfiguringTask = {}));
    var CustomTask;
    (function (CustomTask) {
        function from(external, context, index) {
            if (!external) {
                return undefined;
            }
            var type = external.type;
            if (type === void 0 || type === null) {
                type = 'custom';
            }
            if (type !== 'custom' && type !== 'shell' && type !== 'process') {
                context.problemReporter.error(nls.localize('ConfigurationParser.notCustom', 'Error: tasks is not declared as a custom task. The configuration will be ignored.\n{0}\n', JSON.stringify(external, null, 4)));
                return undefined;
            }
            var taskName = external.taskName;
            if (Types.isString(external.label) && context.schemaVersion === Tasks.JsonSchemaVersion.V2_0_0) {
                taskName = external.label;
            }
            if (!taskName) {
                context.problemReporter.error(nls.localize('ConfigurationParser.noTaskName', 'Error: a task must provide a label property. The task will be ignored.\n{0}\n', JSON.stringify(external, null, 4)));
                return undefined;
            }
            var result = {
                type: 'custom',
                _id: context.uuidMap.getUUID(taskName),
                _source: Objects.assign({}, source, { config: { index: index, element: external, file: '.vscode\\tasks.json', workspaceFolder: context.workspaceFolder } }),
                _label: taskName,
                name: taskName,
                identifier: taskName,
                command: undefined
            };
            var configuration = ConfigurationProperties.from(external, context, false);
            if (configuration) {
                result = Objects.assign(result, configuration);
            }
            var supportLegacy = true; //context.schemaVersion === Tasks.JsonSchemaVersion.V2_0_0;
            if (supportLegacy) {
                var legacy = external;
                if (result.isBackground === void 0 && legacy.isWatching !== void 0) {
                    result.isBackground = !!legacy.isWatching;
                }
                if (result.group === void 0) {
                    if (legacy.isBuildCommand === true) {
                        result.group = Tasks.TaskGroup.Build;
                    }
                    else if (legacy.isTestCommand === true) {
                        result.group = Tasks.TaskGroup.Test;
                    }
                }
            }
            var command = CommandConfiguration.from(external, context);
            if (command) {
                result.command = command;
            }
            if (external.command !== void 0) {
                // if the task has its own command then we suppress the
                // task name by default.
                command.suppressTaskName = true;
            }
            return result;
        }
        CustomTask.from = from;
        function fillGlobals(task, globals) {
            // We only merge a command from a global definition if there is no dependsOn
            // or there is a dependsOn and a defined command.
            if (CommandConfiguration.hasCommand(task.command) || task.dependsOn === void 0) {
                task.command = CommandConfiguration.fillGlobals(task.command, globals.command, task.name);
            }
            // promptOnClose is inferred from isBackground if available
            if (task.promptOnClose === void 0 && task.isBackground === void 0 && globals.promptOnClose !== void 0) {
                task.promptOnClose = globals.promptOnClose;
            }
        }
        CustomTask.fillGlobals = fillGlobals;
        function fillDefaults(task, context) {
            CommandConfiguration.fillDefaults(task.command, context);
            if (task.promptOnClose === void 0) {
                task.promptOnClose = task.isBackground !== void 0 ? !task.isBackground : true;
            }
            if (task.isBackground === void 0) {
                task.isBackground = false;
            }
            if (task.problemMatchers === void 0) {
                task.problemMatchers = EMPTY_ARRAY;
            }
            if (task.group !== void 0 && task.groupType === void 0) {
                task.groupType = Tasks.GroupType.user;
            }
        }
        CustomTask.fillDefaults = fillDefaults;
        function createCustomTask(contributedTask, configuredProps) {
            var result = {
                _id: configuredProps._id,
                _source: Objects.assign({}, configuredProps._source, { customizes: contributedTask.defines }),
                _label: configuredProps.name || contributedTask._label,
                type: 'custom',
                command: contributedTask.command,
                name: configuredProps.name || contributedTask.name,
                identifier: configuredProps.identifier || contributedTask.identifier
            };
            var resultConfigProps = result;
            assignProperty(resultConfigProps, configuredProps, 'group');
            assignProperty(resultConfigProps, configuredProps, 'groupType');
            assignProperty(resultConfigProps, configuredProps, 'isBackground');
            assignProperty(resultConfigProps, configuredProps, 'dependsOn');
            assignProperty(resultConfigProps, configuredProps, 'problemMatchers');
            assignProperty(resultConfigProps, configuredProps, 'promptOnClose');
            result.command.presentation = CommandConfiguration.PresentationOptions.assignProperties(result.command.presentation, configuredProps.presentation);
            var contributedConfigProps = contributedTask;
            fillProperty(resultConfigProps, contributedConfigProps, 'group');
            fillProperty(resultConfigProps, contributedConfigProps, 'groupType');
            fillProperty(resultConfigProps, contributedConfigProps, 'isBackground');
            fillProperty(resultConfigProps, contributedConfigProps, 'dependsOn');
            fillProperty(resultConfigProps, contributedConfigProps, 'problemMatchers');
            fillProperty(resultConfigProps, contributedConfigProps, 'promptOnClose');
            result.command.presentation = CommandConfiguration.PresentationOptions.fillProperties(result.command.presentation, contributedConfigProps.presentation);
            return result;
        }
        CustomTask.createCustomTask = createCustomTask;
    })(CustomTask || (CustomTask = {}));
    var TaskParser;
    (function (TaskParser) {
        function isCustomTask(value) {
            var type = value.type;
            var customize = value.customize;
            return customize === void 0 && (type === void 0 || type === null || type === 'custom' || type === 'shell' || type === 'process');
        }
        function from(externals, globals, context) {
            var result = { custom: [], configured: [] };
            if (!externals) {
                return result;
            }
            var defaultBuildTask = { task: undefined, rank: -1 };
            var defaultTestTask = { task: undefined, rank: -1 };
            var schema2_0_0 = context.schemaVersion === Tasks.JsonSchemaVersion.V2_0_0;
            for (var index = 0; index < externals.length; index++) {
                var external_1 = externals[index];
                if (isCustomTask(external_1)) {
                    var customTask = CustomTask.from(external_1, context, index);
                    if (customTask) {
                        CustomTask.fillGlobals(customTask, globals);
                        CustomTask.fillDefaults(customTask, context);
                        if (context.engine === Tasks.ExecutionEngine.Terminal && customTask.command && customTask.command.name && customTask.command.runtime === Tasks.RuntimeType.Shell && customTask.command.args && customTask.command.args.length > 0) {
                            if (customTask.command.args.some(hasUnescapedSpaces)) {
                                context.problemReporter.warn(nls.localize('taskConfiguration.shellArgs', 'Warning: the task \'{0}\' is a shell command and one of its arguments might have unescaped spaces. To ensure correct command line quoting please merge args into the command.', customTask.name));
                            }
                        }
                        if (schema2_0_0) {
                            if ((customTask.command === void 0 || customTask.command.name === void 0) && (customTask.dependsOn === void 0 || customTask.dependsOn.length === 0)) {
                                context.problemReporter.error(nls.localize('taskConfiguration.noCommandOrDependsOn', 'Error: the task \'{0}\' neither specifies a command nor a dependsOn property. The task will be ignored. Its definition is:\n{1}', customTask.name, JSON.stringify(external_1, undefined, 4)));
                                continue;
                            }
                        }
                        else {
                            if (customTask.command === void 0 || customTask.command.name === void 0) {
                                context.problemReporter.warn(nls.localize('taskConfiguration.noCommand', 'Error: the task \'{0}\' doesn\'t define a command. The task will be ignored. Its definition is:\n{1}', customTask.name, JSON.stringify(external_1, undefined, 4)));
                                continue;
                            }
                        }
                        if (customTask.group === Tasks.TaskGroup.Build && defaultBuildTask.rank < 2) {
                            defaultBuildTask.task = customTask;
                            defaultBuildTask.rank = 2;
                        }
                        else if (customTask.group === Tasks.TaskGroup.Test && defaultTestTask.rank < 2) {
                            defaultTestTask.task = customTask;
                            defaultTestTask.rank = 2;
                        }
                        else if (customTask.name === 'build' && defaultBuildTask.rank < 1) {
                            defaultBuildTask.task = customTask;
                            defaultBuildTask.rank = 1;
                        }
                        else if (customTask.name === 'test' && defaultTestTask.rank < 1) {
                            defaultTestTask.task = customTask;
                            defaultTestTask.rank = 1;
                        }
                        result.custom.push(customTask);
                    }
                }
                else {
                    var configuredTask = ConfiguringTask.from(external_1, context, index);
                    if (configuredTask) {
                        result.configured.push(configuredTask);
                    }
                }
            }
            if (defaultBuildTask.rank > -1 && defaultBuildTask.rank < 2) {
                defaultBuildTask.task.group = Tasks.TaskGroup.Build;
                defaultBuildTask.task.groupType = Tasks.GroupType.user;
            }
            else if (defaultTestTask.rank > -1 && defaultTestTask.rank < 2) {
                defaultTestTask.task.group = Tasks.TaskGroup.Test;
                defaultTestTask.task.groupType = Tasks.GroupType.user;
            }
            return result;
        }
        TaskParser.from = from;
        function assignTasks(target, source) {
            if (source === void 0 || source.length === 0) {
                return target;
            }
            if (target === void 0 || target.length === 0) {
                return source;
            }
            if (source) {
                // Tasks are keyed by ID but we need to merge by name
                var map_1 = Object.create(null);
                target.forEach(function (task) {
                    map_1[task.name] = task;
                });
                source.forEach(function (task) {
                    map_1[task.name] = task;
                });
                var newTarget_1 = [];
                target.forEach(function (task) {
                    newTarget_1.push(map_1[task.name]);
                    delete map_1[task.name];
                });
                Object.keys(map_1).forEach(function (key) { return newTarget_1.push(map_1[key]); });
                target = newTarget_1;
            }
            return target;
        }
        TaskParser.assignTasks = assignTasks;
        function hasUnescapedSpaces(value) {
            var escapeChar = Platform.isWindows ? '`' : '\\';
            if (value.length >= 2 && ((value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') || (value.charAt(0) === '\'' && value.charAt(value.length - 1) === '\''))) {
                return false;
            }
            for (var i = 0; i < value.length; i++) {
                var ch = value.charAt(i);
                if (ch === ' ') {
                    if (i === 0 || value.charAt(i - 1) !== escapeChar) {
                        return true;
                    }
                }
            }
            return false;
        }
    })(TaskParser || (TaskParser = {}));
    var Globals;
    (function (Globals) {
        function from(config, context) {
            var result = fromBase(config, context);
            var osGlobals = undefined;
            if (config.windows && Platform.platform === Platform.Platform.Windows) {
                osGlobals = fromBase(config.windows, context);
            }
            else if (config.osx && Platform.platform === Platform.Platform.Mac) {
                osGlobals = fromBase(config.osx, context);
            }
            else if (config.linux && Platform.platform === Platform.Platform.Linux) {
                osGlobals = fromBase(config.linux, context);
            }
            if (osGlobals) {
                result = Globals.assignProperties(result, osGlobals);
            }
            var command = CommandConfiguration.from(config, context);
            if (command) {
                result.command = command;
            }
            Globals.fillDefaults(result, context);
            Globals.freeze(result);
            return result;
        }
        Globals.from = from;
        function fromBase(config, context) {
            var result = {};
            if (config.suppressTaskName !== void 0) {
                result.suppressTaskName = !!config.suppressTaskName;
            }
            if (config.promptOnClose !== void 0) {
                result.promptOnClose = !!config.promptOnClose;
            }
            return result;
        }
        Globals.fromBase = fromBase;
        function isEmpty(value) {
            return !value || value.command === void 0 && value.promptOnClose === void 0 && value.suppressTaskName === void 0;
        }
        Globals.isEmpty = isEmpty;
        function assignProperties(target, source) {
            if (isEmpty(source)) {
                return target;
            }
            if (isEmpty(target)) {
                return source;
            }
            assignProperty(target, source, 'promptOnClose');
            assignProperty(target, source, 'suppressTaskName');
            return target;
        }
        Globals.assignProperties = assignProperties;
        function fillDefaults(value, context) {
            if (!value) {
                return;
            }
            CommandConfiguration.fillDefaults(value.command, context);
            if (value.suppressTaskName === void 0) {
                value.suppressTaskName = false;
            }
            if (value.promptOnClose === void 0) {
                value.promptOnClose = true;
            }
        }
        Globals.fillDefaults = fillDefaults;
        function freeze(value) {
            Object.freeze(value);
            if (value.command) {
                CommandConfiguration.freeze(value.command);
            }
        }
        Globals.freeze = freeze;
    })(Globals || (Globals = {}));
    var ExecutionEngine;
    (function (ExecutionEngine) {
        function from(config) {
            var runner = config.runner || config._runner;
            var result;
            if (runner) {
                switch (runner) {
                    case 'terminal':
                        result = Tasks.ExecutionEngine.Terminal;
                        break;
                    case 'process':
                        result = Tasks.ExecutionEngine.Process;
                        break;
                }
            }
            var schemaVersion = JsonSchemaVersion.from(config);
            if (schemaVersion === Tasks.JsonSchemaVersion.V0_1_0) {
                return result || Tasks.ExecutionEngine.Process;
            }
            else if (schemaVersion === Tasks.JsonSchemaVersion.V2_0_0) {
                return Tasks.ExecutionEngine.Terminal;
            }
            else {
                throw new Error('Shouldn\'t happen.');
            }
        }
        ExecutionEngine.from = from;
    })(ExecutionEngine = exports.ExecutionEngine || (exports.ExecutionEngine = {}));
    var JsonSchemaVersion;
    (function (JsonSchemaVersion) {
        var _default = Tasks.JsonSchemaVersion.V2_0_0;
        function from(config) {
            var version = config.version;
            if (!version) {
                return _default;
            }
            switch (version) {
                case '0.1.0':
                    return Tasks.JsonSchemaVersion.V0_1_0;
                case '2.0.0':
                    return Tasks.JsonSchemaVersion.V2_0_0;
                default:
                    return _default;
            }
        }
        JsonSchemaVersion.from = from;
    })(JsonSchemaVersion = exports.JsonSchemaVersion || (exports.JsonSchemaVersion = {}));
    var UUIDMap = /** @class */ (function () {
        function UUIDMap(other) {
            this.current = Object.create(null);
            if (other) {
                for (var _i = 0, _a = Object.keys(other.current); _i < _a.length; _i++) {
                    var key = _a[_i];
                    var value = other.current[key];
                    if (Array.isArray(value)) {
                        this.current[key] = value.slice();
                    }
                    else {
                        this.current[key] = value;
                    }
                }
            }
        }
        UUIDMap.prototype.start = function () {
            this.last = this.current;
            this.current = Object.create(null);
        };
        UUIDMap.prototype.getUUID = function (identifier) {
            var lastValue = this.last[identifier];
            var result;
            if (lastValue !== void 0) {
                if (Array.isArray(lastValue)) {
                    result = lastValue.shift();
                    if (lastValue.length === 0) {
                        delete this.last[identifier];
                    }
                }
                else {
                    result = lastValue;
                    delete this.last[identifier];
                }
            }
            if (result === void 0) {
                result = UUID.generateUuid();
            }
            var currentValue = this.current[identifier];
            if (currentValue === void 0) {
                this.current[identifier] = result;
            }
            else {
                if (Array.isArray(currentValue)) {
                    currentValue.push(result);
                }
                else {
                    var arrayValue = [currentValue];
                    arrayValue.push(result);
                    this.current[identifier] = arrayValue;
                }
            }
            return result;
        };
        UUIDMap.prototype.finish = function () {
            this.last = undefined;
        };
        return UUIDMap;
    }());
    var ConfigurationParser = /** @class */ (function () {
        function ConfigurationParser(workspaceFolder, problemReporter, uuidMap) {
            this.workspaceFolder = workspaceFolder;
            this.problemReporter = problemReporter;
            this.uuidMap = uuidMap;
        }
        ConfigurationParser.prototype.run = function (fileConfig) {
            var engine = ExecutionEngine.from(fileConfig);
            var schemaVersion = JsonSchemaVersion.from(fileConfig);
            var context = {
                workspaceFolder: this.workspaceFolder,
                problemReporter: this.problemReporter,
                uuidMap: this.uuidMap,
                namedProblemMatchers: undefined,
                engine: engine,
                schemaVersion: schemaVersion
            };
            var taskParseResult = this.createTaskRunnerConfiguration(fileConfig, context);
            return {
                validationStatus: this.problemReporter.status,
                custom: taskParseResult.custom,
                configured: taskParseResult.configured,
                engine: engine
            };
        };
        ConfigurationParser.prototype.createTaskRunnerConfiguration = function (fileConfig, context) {
            var globals = Globals.from(fileConfig, context);
            if (this.problemReporter.status.isFatal()) {
                return { custom: [], configured: [] };
            }
            context.namedProblemMatchers = ProblemMatcherConverter.namedFrom(fileConfig.declares, context);
            var globalTasks;
            var externalGlobalTasks;
            if (fileConfig.windows && Platform.platform === Platform.Platform.Windows) {
                globalTasks = TaskParser.from(fileConfig.windows.tasks, globals, context).custom;
                externalGlobalTasks = fileConfig.windows.tasks;
            }
            else if (fileConfig.osx && Platform.platform === Platform.Platform.Mac) {
                globalTasks = TaskParser.from(fileConfig.osx.tasks, globals, context).custom;
                externalGlobalTasks = fileConfig.osx.tasks;
            }
            else if (fileConfig.linux && Platform.platform === Platform.Platform.Linux) {
                globalTasks = TaskParser.from(fileConfig.linux.tasks, globals, context).custom;
                externalGlobalTasks = fileConfig.linux.tasks;
            }
            if (context.schemaVersion === Tasks.JsonSchemaVersion.V2_0_0 && globalTasks && globalTasks.length > 0 && externalGlobalTasks && externalGlobalTasks.length > 0) {
                var taskContent = [];
                for (var _i = 0, externalGlobalTasks_1 = externalGlobalTasks; _i < externalGlobalTasks_1.length; _i++) {
                    var task = externalGlobalTasks_1[_i];
                    taskContent.push(JSON.stringify(task, null, 4));
                }
                context.problemReporter.error(nls.localize('TaskParse.noOsSpecificGlobalTasks', 'Task version 2.0.0 doesn\'t support global OS specific tasks. Convert them to a task with a OS specific command. Affected tasks are:\n{0}', taskContent.join('\n')));
            }
            var result = { custom: undefined, configured: undefined };
            if (fileConfig.tasks) {
                result = TaskParser.from(fileConfig.tasks, globals, context);
            }
            if (globalTasks) {
                result.custom = TaskParser.assignTasks(result.custom, globalTasks);
            }
            if ((!result.custom || result.custom.length === 0) && (globals.command && globals.command.name)) {
                var matchers = ProblemMatcherConverter.from(fileConfig.problemMatcher, context);
                var isBackground = fileConfig.isBackground ? !!fileConfig.isBackground : fileConfig.isWatching ? !!fileConfig.isWatching : undefined;
                var task = {
                    _id: context.uuidMap.getUUID(globals.command.name),
                    _source: Objects.assign({}, source, { config: { index: -1, element: fileConfig, workspaceFolder: context.workspaceFolder } }),
                    _label: globals.command.name,
                    type: 'custom',
                    name: globals.command.name,
                    identifier: globals.command.name,
                    group: Tasks.TaskGroup.Build,
                    command: {
                        name: undefined,
                        runtime: undefined,
                        presentation: undefined,
                        suppressTaskName: true
                    },
                    isBackground: isBackground,
                    problemMatchers: matchers
                };
                var value = GroupKind.from(fileConfig.group);
                if (value) {
                    task.group = value[0];
                    task.groupType = value[1];
                }
                else if (fileConfig.group === 'none') {
                    task.group = undefined;
                }
                CustomTask.fillGlobals(task, globals);
                CustomTask.fillDefaults(task, context);
                result.custom = [task];
            }
            result.custom = result.custom || [];
            result.configured = result.configured || [];
            return result;
        };
        return ConfigurationParser;
    }());
    var uuidMaps = new Map();
    function parse(workspaceFolder, configuration, logger) {
        var uuidMap = uuidMaps.get(workspaceFolder.uri.toString());
        if (!uuidMap) {
            uuidMap = new UUIDMap();
            uuidMaps.set(workspaceFolder.uri.toString(), uuidMap);
        }
        try {
            uuidMap.start();
            return (new ConfigurationParser(workspaceFolder, logger, uuidMap)).run(configuration);
        }
        finally {
            uuidMap.finish();
        }
    }
    exports.parse = parse;
    function createCustomTask(contributedTask, configuredProps) {
        return CustomTask.createCustomTask(contributedTask, configuredProps);
    }
    exports.createCustomTask = createCustomTask;
    function getTaskIdentifier(value) {
        return TaskIdentifier.from(value);
    }
    exports.getTaskIdentifier = getTaskIdentifier;
});
/*
class VersionConverter {
    constructor(private problemReporter: IProblemReporter) {
    }

    public convert(fromConfig: ExternalTaskRunnerConfiguration): ExternalTaskRunnerConfiguration {
        let result: ExternalTaskRunnerConfiguration;
        result.version = '2.0.0';
        if (Array.isArray(fromConfig.tasks)) {

        } else {
            result.tasks = [];
        }


        return result;
    }

    private convertGlobalTask(fromConfig: ExternalTaskRunnerConfiguration): TaskDescription {
        let command: string = this.getGlobalCommand(fromConfig);
        if (!command) {
            this.problemReporter.error(nls.localize('Converter.noGlobalName', 'No global command specified. Can\'t convert to 2.0.0 version.'));
            return undefined;
        }
        let result: TaskDescription = {
            taskName: command
        };
        if (fromConfig.isShellCommand) {
            result.type = 'shell';
        } else {
            result.type = 'process';
            result.args = fromConfig.args;
        }
        if (fromConfig.)

        return result;
    }

    private getGlobalCommand(fromConfig: ExternalTaskRunnerConfiguration): string {
        if (fromConfig.command) {
            return fromConfig.command;
        } else if (fromConfig.windows && fromConfig.windows.command) {
            return fromConfig.windows.command;
        } else if (fromConfig.osx && fromConfig.osx.command) {
            return fromConfig.osx.command;
        } else if (fromConfig.linux && fromConfig.linux.command) {
            return fromConfig.linux.command;
        } else {
            return undefined;
        }
    }

    private createCommandLine(command: string, args: string[], isWindows: boolean): string {
        let result: string[];
        let commandHasSpace = false;
        let argHasSpace = false;
        if (TaskDescription.hasUnescapedSpaces(command)) {
            result.push(`"${command}"`);
            commandHasSpace = true;
        } else {
            result.push(command);
        }
        if (args) {
            for (let arg of args) {
                if (TaskDescription.hasUnescapedSpaces(arg)) {
                    result.push(`"${arg}"`);
                    argHasSpace= true;
                } else {
                    result.push(arg);
                }
            }
        }
        return result.join(' ');
    }

}
*/
