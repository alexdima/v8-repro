/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/platform/registry/common/platform", "vs/platform/extensions/common/extensionsRegistry", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/configuration/common/configuration"], function (require, exports, nls, objects, platform_1, extensionsRegistry_1, configurationRegistry_1, jsonContributionRegistry_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    var configurationEntrySchema = {
        type: 'object',
        defaultSnippets: [{ body: { title: '', properties: {} } }],
        properties: {
            title: {
                description: nls.localize('vscode.extension.contributes.configuration.title', 'A summary of the settings. This label will be used in the settings file as separating comment.'),
                type: 'string'
            },
            properties: {
                description: nls.localize('vscode.extension.contributes.configuration.properties', 'Description of the configuration properties.'),
                type: 'object',
                additionalProperties: {
                    anyOf: [
                        { $ref: 'http://json-schema.org/draft-04/schema#' },
                        {
                            type: 'object',
                            properties: {
                                isExecutable: {
                                    type: 'boolean'
                                },
                                scope: {
                                    type: 'string',
                                    enum: ['window', 'resource'],
                                    default: 'window',
                                    enumDescriptions: [
                                        nls.localize('scope.window.description', "Window specific configuration, which can be configured in the User or Workspace settings."),
                                        nls.localize('scope.resource.description', "Resource specific configuration, which can be configured in the User, Workspace or Folder settings.")
                                    ],
                                    description: nls.localize('scope.description', "Scope in which the configuration is applicable. Available scopes are `window` and `resource`.")
                                }
                            }
                        }
                    ]
                }
            }
        }
    };
    var registeredDefaultConfigurations = [];
    // BEGIN VSCode extension point `configurationDefaults`
    var defaultConfigurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('configurationDefaults', [], {
        description: nls.localize('vscode.extension.contributes.defaultConfiguration', 'Contributes default editor configuration settings by language.'),
        type: 'object',
        defaultSnippets: [{ body: {} }],
        patternProperties: {
            '\\[.*\\]$': {
                type: 'object',
                default: {},
                $ref: configurationRegistry_1.editorConfigurationSchemaId,
            }
        }
    });
    defaultConfigurationExtPoint.setHandler(function (extensions) {
        registeredDefaultConfigurations = extensions.map(function (extension) {
            var id = extension.description.id;
            var name = extension.description.name;
            var defaults = objects.deepClone(extension.value);
            return {
                id: id, name: name, defaults: defaults
            };
        });
    });
    // END VSCode extension point `configurationDefaults`
    // BEGIN VSCode extension point `configuration`
    var configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('configuration', [defaultConfigurationExtPoint], {
        description: nls.localize('vscode.extension.contributes.configuration', 'Contributes configuration settings.'),
        oneOf: [
            configurationEntrySchema,
            {
                type: 'array',
                items: configurationEntrySchema
            }
        ]
    });
    configurationExtPoint.setHandler(function (extensions) {
        var configurations = [];
        function handleConfiguration(node, extension) {
            var configuration = objects.deepClone(node);
            if (configuration.title && (typeof configuration.title !== 'string')) {
                extension.collector.error(nls.localize('invalid.title', "'configuration.title' must be a string"));
            }
            validateProperties(configuration, extension);
            configuration.id = extension.description.uuid || extension.description.id;
            configuration.title = configuration.title || extension.description.displayName || extension.description.id;
            configurations.push(configuration);
        }
        var _loop_1 = function (extension) {
            var value = extension.value;
            if (!Array.isArray(value)) {
                handleConfiguration(value, extension);
            }
            else {
                value.forEach(function (v) { return handleConfiguration(v, extension); });
            }
        };
        for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
            var extension = extensions_1[_i];
            _loop_1(extension);
        }
        configurationRegistry.registerConfigurations(configurations, registeredDefaultConfigurations, false);
    });
    // END VSCode extension point `configuration`
    function validateProperties(configuration, extension) {
        var properties = configuration.properties;
        if (properties) {
            if (typeof properties !== 'object') {
                extension.collector.error(nls.localize('invalid.properties', "'configuration.properties' must be an object"));
                configuration.properties = {};
            }
            for (var key in properties) {
                var message = configurationRegistry_1.validateProperty(key);
                var propertyConfiguration = configuration.properties[key];
                propertyConfiguration.scope = propertyConfiguration.scope && propertyConfiguration.scope.toString() === 'resource' ? configurationRegistry_1.ConfigurationScope.RESOURCE : configurationRegistry_1.ConfigurationScope.WINDOW;
                propertyConfiguration.notMultiRootAdopted = !(extension.description.isBuiltin || (Array.isArray(extension.description.keywords) && extension.description.keywords.indexOf('multi-root ready') !== -1));
                if (message) {
                    extension.collector.warn(message);
                    delete properties[key];
                }
            }
        }
        var subNodes = configuration.allOf;
        if (subNodes) {
            extension.collector.error(nls.localize('invalid.allOf', "'configuration.allOf' is deprecated and should no longer be used. Instead, pass multiple configuration sections as an array to the 'configuration' contribution point."));
            for (var _i = 0, subNodes_1 = subNodes; _i < subNodes_1.length; _i++) {
                var node = subNodes_1[_i];
                validateProperties(node, extension);
            }
        }
    }
    var jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    jsonRegistry.registerSchema('vscode://schemas/workspaceConfig', {
        allowComments: true,
        default: {
            folders: [
                {
                    path: ''
                }
            ],
            settings: {}
        },
        required: ['folders'],
        properties: {
            'folders': {
                minItems: 0,
                uniqueItems: true,
                description: nls.localize('workspaceConfig.folders.description', "List of folders to be loaded in the workspace."),
                items: {
                    type: 'object',
                    default: { path: '' },
                    oneOf: [{
                            properties: {
                                path: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.path.description', "A file path. e.g. `/root/folderA` or `./folderA` for a relative path that will be resolved against the location of the workspace file.")
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.name.description', "An optional name for the folder. ")
                                }
                            },
                            required: ['path']
                        }, {
                            properties: {
                                uri: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.uri.description', "URI of the folder")
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.name.description', "An optional name for the folder. ")
                                }
                            },
                            required: ['uri']
                        }]
                }
            },
            'settings': {
                type: 'object',
                default: {},
                description: nls.localize('workspaceConfig.settings.description', "Workspace settings"),
                $ref: configuration_1.workspaceSettingsSchemaId
            },
            'launch': {
                type: 'object',
                default: { configurations: [], compounds: [] },
                description: nls.localize('workspaceConfig.launch.description', "Workspace launch configurations"),
                $ref: configuration_1.launchSchemaId
            },
            'extensions': {
                type: 'object',
                default: {},
                description: nls.localize('workspaceConfig.extensions.description', "Workspace extensions"),
                $ref: 'vscode://schemas/extensions'
            }
        },
        additionalProperties: false,
        errorMessage: nls.localize('unknownWorkspaceProperty', "Unknown workspace configuration property")
    });
});
