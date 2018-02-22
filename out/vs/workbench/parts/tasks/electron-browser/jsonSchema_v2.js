define(["require", "exports", "vs/nls", "vs/base/common/objects", "./jsonSchemaCommon", "vs/platform/markers/common/problemMatcher", "../common/taskDefinitionRegistry"], function (require, exports, nls, Objects, jsonSchemaCommon_1, problemMatcher_1, taskDefinitionRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function fixReferences(literal) {
        if (Array.isArray(literal)) {
            literal.forEach(fixReferences);
        }
        else if (typeof literal === 'object') {
            if (literal['$ref']) {
                literal['$ref'] = literal['$ref'] + '2';
            }
            Object.getOwnPropertyNames(literal).forEach(function (property) {
                var value = literal[property];
                if (Array.isArray(value) || typeof value === 'object') {
                    fixReferences(value);
                }
            });
        }
    }
    var shellCommand = {
        anyOf: [
            {
                type: 'boolean',
                default: true,
                description: nls.localize('JsonSchema.shell', 'Specifies whether the command is a shell command or an external program. Defaults to false if omitted.')
            },
            {
                $ref: '#definitions/shellConfiguration'
            }
        ],
        deprecationMessage: nls.localize('JsonSchema.tasks.isShellCommand.deprecated', 'The property isShellCommand is deprecated. Use the type property of the task and the shell property in the options instead. See also the 1.14 release notes.')
    };
    var dependsOn = {
        anyOf: [
            {
                type: 'string',
                default: true,
                description: nls.localize('JsonSchema.tasks.dependsOn.string', 'Another task this task depends on.')
            },
            {
                type: 'array',
                description: nls.localize('JsonSchema.tasks.dependsOn.array', 'The other tasks this task depends on.'),
                items: {
                    type: 'string'
                }
            }
        ]
    };
    var presentation = {
        type: 'object',
        default: {
            echo: true,
            reveal: 'always',
            focus: false,
            panel: 'shared'
        },
        description: nls.localize('JsonSchema.tasks.presentation', 'Configures the panel that is used to present the task\'s ouput and reads its input.'),
        additionalProperties: false,
        properties: {
            echo: {
                type: 'boolean',
                default: true,
                description: nls.localize('JsonSchema.tasks.presentation.echo', 'Controls whether the executed command is echoed to the panel. Default is true.')
            },
            focus: {
                type: 'boolean',
                default: false,
                description: nls.localize('JsonSchema.tasks.presentation.focus', 'Controls whether the panel takes focus. Default is false. If set to true the panel is revealed as well.')
            },
            reveal: {
                type: 'string',
                enum: ['always', 'silent', 'never'],
                enumDescriptions: [
                    nls.localize('JsonSchema.tasks.presentation.reveal.always', 'Always reveals the terminal when this task is executed.'),
                    nls.localize('JsonSchema.tasks.presentation.reveal.silent', 'Only reveals the terminal if no problem matcher is associated with the task and an errors occurs executing it.'),
                    nls.localize('JsonSchema.tasks.presentation.reveal.never', 'Never reveals the terminal when this task is executed.'),
                ],
                default: 'always',
                description: nls.localize('JsonSchema.tasks.presentation.reveals', 'Controls whether the panel running the task is revealed or not. Default is \"always\".')
            },
            panel: {
                type: 'string',
                enum: ['shared', 'dedicated', 'new'],
                default: 'shared',
                description: nls.localize('JsonSchema.tasks.presentation.instance', 'Controls if the panel is shared between tasks, dedicated to this task or a new one is created on every run.')
            }
        }
    };
    var terminal = Objects.deepClone(presentation);
    terminal.deprecationMessage = nls.localize('JsonSchema.tasks.terminal', 'The terminal property is deprecated. Use presentation instead');
    var group = {
        oneOf: [
            {
                type: 'string',
            },
            {
                type: 'object',
                properties: {
                    kind: {
                        type: 'string',
                        default: 'none',
                        description: nls.localize('JsonSchema.tasks.group.kind', 'The task\'s execution group.')
                    },
                    isDefault: {
                        type: 'boolean',
                        default: false,
                        description: nls.localize('JsonSchema.tasks.group.isDefault', 'Defines if this task is the default task in the group.')
                    }
                }
            },
        ],
        enum: [
            { kind: 'build', isDefault: true },
            { kind: 'test', isDefault: true },
            'build',
            'test',
            'none'
        ],
        enumDescriptions: [
            nls.localize('JsonSchema.tasks.group.defaultBuild', 'Marks the task as the default build task.'),
            nls.localize('JsonSchema.tasks.group.defaultTest', 'Marks the task as the default test task.'),
            nls.localize('JsonSchema.tasks.group.build', 'Marks the task as a build task accesible through the \'Run Build Task\' command.'),
            nls.localize('JsonSchema.tasks.group.test', 'Marks the task as a test task accesible through the \'Run Test Task\' command.'),
            nls.localize('JsonSchema.tasks.group.none', 'Assigns the task to no group')
        ],
        description: nls.localize('JsonSchema.tasks.group', 'Defines to which execution group this task belongs to. It supports "build" to add it to the build group and "test" to add it to the test group.')
    };
    var taskType = {
        type: 'string',
        enum: ['shell', 'process'],
        default: 'shell',
        description: nls.localize('JsonSchema.tasks.type', 'Defines whether the task is run as a process or as a command inside a shell.')
    };
    var label = {
        type: 'string',
        description: nls.localize('JsonSchema.tasks.label', "The task's user interface label")
    };
    var version = {
        type: 'string',
        enum: ['2.0.0'],
        description: nls.localize('JsonSchema.version', 'The config\'s version number.')
    };
    var identifier = {
        type: 'string',
        description: nls.localize('JsonSchema.tasks.identifier', 'A user defined identifier to reference the task in launch.json or a dependsOn clause.')
    };
    var taskConfiguration = {
        type: 'object',
        additionalProperties: false,
        properties: {
            label: {
                type: 'string',
                description: nls.localize('JsonSchema.tasks.taskLabel', "The task's label")
            },
            taskName: {
                type: 'string',
                description: nls.localize('JsonSchema.tasks.taskName', 'The task\'s name'),
                deprecationMessage: nls.localize('JsonSchema.tasks.taskName.deprecated', 'The task\'s name property is deprecated. Use the label property instead.')
            },
            identifier: Objects.deepClone(identifier),
            group: Objects.deepClone(group),
            isBackground: {
                type: 'boolean',
                description: nls.localize('JsonSchema.tasks.background', 'Whether the executed task is kept alive and is running in the background.'),
                default: true
            },
            promptOnClose: {
                type: 'boolean',
                description: nls.localize('JsonSchema.tasks.promptOnClose', 'Whether the user is prompted when VS Code closes with a running task.'),
                default: false
            },
            presentation: Objects.deepClone(presentation),
            problemMatcher: {
                $ref: '#/definitions/problemMatcherType',
                description: nls.localize('JsonSchema.tasks.matchers', 'The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.')
            }
        }
    };
    var taskDefinitions = [];
    taskDefinitionRegistry_1.TaskDefinitionRegistry.onReady().then(function () {
        for (var _i = 0, _a = taskDefinitionRegistry_1.TaskDefinitionRegistry.all(); _i < _a.length; _i++) {
            var taskType_1 = _a[_i];
            var schema_1 = Objects.deepClone(taskConfiguration);
            // Since we do this after the schema is assigned we need to patch the refs.
            schema_1.properties.type = {
                type: 'string',
                description: nls.localize('JsonSchema.customizations.customizes.type', 'The task type to customize'),
                enum: [taskType_1.taskType]
            };
            if (taskType_1.required) {
                schema_1.required = taskType_1.required.slice();
            }
            for (var _b = 0, _c = Object.keys(taskType_1.properties); _b < _c.length; _b++) {
                var key = _c[_b];
                var property = taskType_1.properties[key];
                schema_1.properties[key] = Objects.deepClone(property);
            }
            fixReferences(schema_1);
            taskDefinitions.push(schema_1);
        }
    });
    var customize = Objects.deepClone(taskConfiguration);
    customize.properties.customize = {
        type: 'string',
        deprecationMessage: nls.localize('JsonSchema.tasks.customize.deprecated', 'The customize property is deprecated. See the 1.14 release notes on how to migrate to the new task customization approach')
    };
    taskDefinitions.push(customize);
    var definitions = Objects.deepClone(jsonSchemaCommon_1.default.definitions);
    var taskDescription = definitions.taskDescription;
    taskDescription.required = ['label'];
    taskDescription.properties.label = Objects.deepClone(label);
    taskDescription.properties.isShellCommand = Objects.deepClone(shellCommand);
    taskDescription.properties.dependsOn = dependsOn;
    taskDescription.properties.identifier = Objects.deepClone(identifier);
    taskDescription.properties.type = Objects.deepClone(taskType);
    taskDescription.properties.presentation = Objects.deepClone(presentation);
    taskDescription.properties.terminal = terminal;
    taskDescription.properties.group = Objects.deepClone(group);
    taskDescription.properties.taskName.deprecationMessage = nls.localize('JsonSchema.tasks.taskName.deprecated', 'The task\'s name property is deprecated. Use the label property instead.');
    taskDescription.default = {
        label: 'My Task',
        type: 'shell',
        command: 'echo Hello',
        problemMatcher: []
    };
    definitions.showOutputType.deprecationMessage = nls.localize('JsonSchema.tasks.showOputput.deprecated', 'The property showOutput is deprecated. Use the reveal property inside the presentation property instead. See also the 1.14 release notes.');
    definitions.taskDescription.properties.echoCommand.deprecationMessage = nls.localize('JsonSchema.tasks.echoCommand.deprecated', 'The property echoCommand is deprecated. Use the echo property inside the presentation property instead. See also the 1.14 release notes.');
    definitions.taskDescription.properties.suppressTaskName.deprecationMessage = nls.localize('JsonSchema.tasks.suppressTaskName.deprecated', 'The property suppressTaskName is deprecated. Inline the command with its arguments into the task instead. See also the 1.14 release notes.');
    definitions.taskDescription.properties.isBuildCommand.deprecationMessage = nls.localize('JsonSchema.tasks.isBuildCommand.deprecated', 'The property isBuildCommand is deprecated. Use the group property instead. See also the 1.14 release notes.');
    definitions.taskDescription.properties.isTestCommand.deprecationMessage = nls.localize('JsonSchema.tasks.isTestCommand.deprecated', 'The property isTestCommand is deprecated. Use the group property instead. See also the 1.14 release notes.');
    taskDefinitions.push({
        $ref: '#/definitions/taskDescription'
    });
    var tasks = definitions.taskRunnerConfiguration.properties.tasks;
    tasks.items = {
        oneOf: taskDefinitions
    };
    definitions.commandConfiguration.properties.isShellCommand = Objects.deepClone(shellCommand);
    definitions.options.properties.shell = {
        $ref: '#/definitions/shellConfiguration'
    };
    definitions.taskRunnerConfiguration.properties.isShellCommand = Objects.deepClone(shellCommand);
    definitions.taskRunnerConfiguration.properties.type = Objects.deepClone(taskType);
    definitions.taskRunnerConfiguration.properties.group = Objects.deepClone(group);
    definitions.taskRunnerConfiguration.properties.presentation = Objects.deepClone(presentation);
    definitions.taskRunnerConfiguration.properties.suppressTaskName.deprecationMessage = nls.localize('JsonSchema.tasks.suppressTaskName.deprecated', 'The property suppressTaskName is deprecated. Inline the command with its arguments into the task instead. See also the 1.14 release notes.');
    definitions.taskRunnerConfiguration.properties.taskSelector.deprecationMessage = nls.localize('JsonSchema.tasks.taskSelector.deprecated', 'The property taskSelector is deprecated. Inline the command with its arguments into the task instead. See also the 1.14 release notes.');
    var osSpecificTaskRunnerConfiguration = Objects.deepClone(definitions.taskRunnerConfiguration);
    delete osSpecificTaskRunnerConfiguration.properties.tasks;
    osSpecificTaskRunnerConfiguration.additionalProperties = false;
    definitions.osSpecificTaskRunnerConfiguration = osSpecificTaskRunnerConfiguration;
    definitions.taskRunnerConfiguration.properties.version = Objects.deepClone(version);
    var schema = {
        oneOf: [
            {
                'allOf': [
                    {
                        type: 'object',
                        required: ['version'],
                        properties: {
                            version: Objects.deepClone(version),
                            windows: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize('JsonSchema.windows', 'Windows specific command configuration')
                            },
                            osx: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize('JsonSchema.mac', 'Mac specific command configuration')
                            },
                            linux: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize('JsonSchema.linux', 'Linux specific command configuration')
                            }
                        }
                    },
                    {
                        $ref: '#/definitions/taskRunnerConfiguration'
                    }
                ]
            }
        ]
    };
    schema.definitions = definitions;
    Object.getOwnPropertyNames(definitions).forEach(function (key) {
        var newKey = key + '2';
        definitions[newKey] = definitions[key];
        delete definitions[key];
    });
    fixReferences(schema);
    problemMatcher_1.ProblemMatcherRegistry.onReady().then(function () {
        try {
            var matcherIds = problemMatcher_1.ProblemMatcherRegistry.keys().map(function (key) { return '$' + key; });
            definitions.problemMatcherType2.oneOf[0].enum = matcherIds;
            definitions.problemMatcherType2.oneOf[2].items.anyOf[1].enum = matcherIds;
        }
        catch (err) {
            console.log('Installing problem matcher ids failed');
        }
    });
    exports.default = schema;
});
