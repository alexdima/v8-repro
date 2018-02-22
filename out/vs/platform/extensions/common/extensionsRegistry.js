define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/severity", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, nls, errors_1, severity_1, jsonContributionRegistry_1, platform_1, extensionManagement_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var hasOwnProperty = Object.hasOwnProperty;
    var schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    var ExtensionMessageCollector = /** @class */ (function () {
        function ExtensionMessageCollector(messageHandler, extension, extensionPointId) {
            this._messageHandler = messageHandler;
            this._extension = extension;
            this._extensionPointId = extensionPointId;
        }
        ExtensionMessageCollector.prototype._msg = function (type, message) {
            this._messageHandler({
                type: type,
                message: message,
                source: this._extension.extensionFolderPath,
                extensionId: this._extension.id,
                extensionPointId: this._extensionPointId
            });
        };
        ExtensionMessageCollector.prototype.error = function (message) {
            this._msg(severity_1.default.Error, message);
        };
        ExtensionMessageCollector.prototype.warn = function (message) {
            this._msg(severity_1.default.Warning, message);
        };
        ExtensionMessageCollector.prototype.info = function (message) {
            this._msg(severity_1.default.Info, message);
        };
        return ExtensionMessageCollector;
    }());
    exports.ExtensionMessageCollector = ExtensionMessageCollector;
    var ExtensionPoint = /** @class */ (function () {
        function ExtensionPoint(name) {
            this.name = name;
            this._handler = null;
            this._users = null;
            this._done = false;
        }
        ExtensionPoint.prototype.setHandler = function (handler) {
            if (this._handler !== null || this._done) {
                throw new Error('Handler already set!');
            }
            this._handler = handler;
            this._handle();
        };
        ExtensionPoint.prototype.acceptUsers = function (users) {
            if (this._users !== null || this._done) {
                throw new Error('Users already set!');
            }
            this._users = users;
            this._handle();
        };
        ExtensionPoint.prototype._handle = function () {
            if (this._handler === null || this._users === null) {
                return;
            }
            this._done = true;
            var handler = this._handler;
            this._handler = null;
            var users = this._users;
            this._users = null;
            try {
                handler(users);
            }
            catch (err) {
                errors_1.onUnexpectedError(err);
            }
        };
        return ExtensionPoint;
    }());
    exports.ExtensionPoint = ExtensionPoint;
    var schemaId = 'vscode://schemas/vscode-extensions';
    var schema = {
        properties: {
            engines: {
                type: 'object',
                properties: {
                    'vscode': {
                        type: 'string',
                        description: nls.localize('vscode.extension.engines.vscode', 'For VS Code extensions, specifies the VS Code version that the extension is compatible with. Cannot be *. For example: ^0.10.5 indicates compatibility with a minimum VS Code version of 0.10.5.'),
                        default: '^0.10.0',
                    }
                }
            },
            publisher: {
                description: nls.localize('vscode.extension.publisher', 'The publisher of the VS Code extension.'),
                type: 'string'
            },
            displayName: {
                description: nls.localize('vscode.extension.displayName', 'The display name for the extension used in the VS Code gallery.'),
                type: 'string'
            },
            categories: {
                description: nls.localize('vscode.extension.categories', 'The categories used by the VS Code gallery to categorize the extension.'),
                type: 'array',
                uniqueItems: true,
                items: {
                    type: 'string',
                    enum: ['Languages', 'Snippets', 'Linters', 'Themes', 'Debuggers', 'Other', 'Keymaps', 'Formatters', 'Extension Packs', 'SCM Providers', 'Azure']
                }
            },
            galleryBanner: {
                type: 'object',
                description: nls.localize('vscode.extension.galleryBanner', 'Banner used in the VS Code marketplace.'),
                properties: {
                    color: {
                        description: nls.localize('vscode.extension.galleryBanner.color', 'The banner color on the VS Code marketplace page header.'),
                        type: 'string'
                    },
                    theme: {
                        description: nls.localize('vscode.extension.galleryBanner.theme', 'The color theme for the font used in the banner.'),
                        type: 'string',
                        enum: ['dark', 'light']
                    }
                }
            },
            contributes: {
                description: nls.localize('vscode.extension.contributes', 'All contributions of the VS Code extension represented by this package.'),
                type: 'object',
                properties: {},
                default: {}
            },
            preview: {
                type: 'boolean',
                description: nls.localize('vscode.extension.preview', 'Sets the extension to be flagged as a Preview in the Marketplace.'),
            },
            activationEvents: {
                description: nls.localize('vscode.extension.activationEvents', 'Activation events for the VS Code extension.'),
                type: 'array',
                items: {
                    type: 'string',
                    defaultSnippets: [
                        {
                            label: 'onLanguage',
                            description: nls.localize('vscode.extension.activationEvents.onLanguage', 'An activation event emitted whenever a file that resolves to the specified language gets opened.'),
                            body: 'onLanguage:${1:languageId}'
                        },
                        {
                            label: 'onCommand',
                            description: nls.localize('vscode.extension.activationEvents.onCommand', 'An activation event emitted whenever the specified command gets invoked.'),
                            body: 'onCommand:${2:commandId}'
                        },
                        {
                            label: 'onDebug',
                            description: nls.localize('vscode.extension.activationEvents.onDebug', 'An activation event emitted whenever a user is about to start debugging or about to setup debug configurations.'),
                            body: 'onDebug'
                        },
                        {
                            label: 'onDebugInitialConfigurations',
                            description: nls.localize('vscode.extension.activationEvents.onDebugInitialConfigurations', 'An activation event emitted whenever a "launch.json" needs to be created (and all provideDebugConfigurations methods need to be called).'),
                            body: 'onDebugInitialConfigurations'
                        },
                        {
                            label: 'onDebugResolve',
                            description: nls.localize('vscode.extension.activationEvents.onDebugResolve', 'An activation event emitted whenever a debug session with the specific type is about to be launched (and a corresponding resolveDebugConfiguration method needs to be called).'),
                            body: 'onDebugResolve:${6:type}'
                        },
                        {
                            label: 'workspaceContains',
                            description: nls.localize('vscode.extension.activationEvents.workspaceContains', 'An activation event emitted whenever a folder is opened that contains at least a file matching the specified glob pattern.'),
                            body: 'workspaceContains:${4:filePattern}'
                        },
                        {
                            label: 'onView',
                            body: 'onView:${5:viewId}',
                            description: nls.localize('vscode.extension.activationEvents.onView', 'An activation event emitted whenever the specified view is expanded.'),
                        },
                        {
                            label: '*',
                            description: nls.localize('vscode.extension.activationEvents.star', 'An activation event emitted on VS Code startup. To ensure a great end user experience, please use this activation event in your extension only when no other activation events combination works in your use-case.'),
                            body: '*'
                        }
                    ],
                }
            },
            badges: {
                type: 'array',
                description: nls.localize('vscode.extension.badges', 'Array of badges to display in the sidebar of the Marketplace\'s extension page.'),
                items: {
                    type: 'object',
                    required: ['url', 'href', 'description'],
                    properties: {
                        url: {
                            type: 'string',
                            description: nls.localize('vscode.extension.badges.url', 'Badge image URL.')
                        },
                        href: {
                            type: 'string',
                            description: nls.localize('vscode.extension.badges.href', 'Badge link.')
                        },
                        description: {
                            type: 'string',
                            description: nls.localize('vscode.extension.badges.description', 'Badge description.')
                        }
                    }
                }
            },
            extensionDependencies: {
                description: nls.localize('vscode.extension.extensionDependencies', 'Dependencies to other extensions. The identifier of an extension is always ${publisher}.${name}. For example: vscode.csharp.'),
                type: 'array',
                uniqueItems: true,
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN
                }
            },
            scripts: {
                type: 'object',
                properties: {
                    'vscode:prepublish': {
                        description: nls.localize('vscode.extension.scripts.prepublish', 'Script executed before the package is published as a VS Code extension.'),
                        type: 'string'
                    }
                }
            },
            icon: {
                type: 'string',
                description: nls.localize('vscode.extension.icon', 'The path to a 128x128 pixel icon.')
            }
        }
    };
    var ExtensionsRegistryImpl = /** @class */ (function () {
        function ExtensionsRegistryImpl() {
            this._extensionPoints = {};
        }
        ExtensionsRegistryImpl.prototype.registerExtensionPoint = function (extensionPoint, deps, jsonSchema) {
            if (hasOwnProperty.call(this._extensionPoints, extensionPoint)) {
                throw new Error('Duplicate extension point: ' + extensionPoint);
            }
            var result = new ExtensionPoint(extensionPoint);
            this._extensionPoints[extensionPoint] = result;
            schema.properties['contributes'].properties[extensionPoint] = jsonSchema;
            schemaRegistry.registerSchema(schemaId, schema);
            return result;
        };
        ExtensionsRegistryImpl.prototype.getExtensionPoints = function () {
            var _this = this;
            return Object.keys(this._extensionPoints).map(function (point) { return _this._extensionPoints[point]; });
        };
        return ExtensionsRegistryImpl;
    }());
    exports.ExtensionsRegistryImpl = ExtensionsRegistryImpl;
    var PRExtensions = {
        ExtensionsRegistry: 'ExtensionsRegistry'
    };
    platform_1.Registry.add(PRExtensions.ExtensionsRegistry, new ExtensionsRegistryImpl());
    exports.ExtensionsRegistry = platform_1.Registry.as(PRExtensions.ExtensionsRegistry);
    schemaRegistry.registerSchema(schemaId, schema);
});
