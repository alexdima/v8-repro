var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/platform/extensions/common/extensionsRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/keybinding/common/abstractKeybindingService", "vs/platform/statusbar/common/statusbar", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/message/common/message", "vs/base/node/config", "vs/platform/environment/common/environment", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/workbench/services/keybinding/common/keybindingIO", "native-keymap", "vs/workbench/services/keybinding/common/keyboardMapper", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/workbench/services/keybinding/common/macLinuxKeyboardMapper", "vs/workbench/services/keybinding/common/macLinuxFallbackKeyboardMapper", "vs/base/common/event", "vs/platform/configuration/common/configurationRegistry", "vs/platform/configuration/common/configuration", "vs/base/common/errors", "os"], function (require, exports, nls, platform_1, extensionsRegistry_1, jsonContributionRegistry_1, abstractKeybindingService_1, statusbar_1, keybindingResolver_1, commands_1, keybinding_1, contextkey_1, keybindingsRegistry_1, platform_2, telemetry_1, telemetryUtils_1, message_1, config_1, environment_1, dom, keyboardEvent_1, resolvedKeybindingItem_1, keybindingIO_1, nativeKeymap, keyboardMapper_1, windowsKeyboardMapper_1, macLinuxKeyboardMapper_1, macLinuxFallbackKeyboardMapper_1, event_1, configurationRegistry_1, configuration_1, errors_1, os_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var KeyboardMapperFactory = /** @class */ (function () {
        function KeyboardMapperFactory() {
            this._onDidChangeKeyboardMapper = new event_1.Emitter();
            this.onDidChangeKeyboardMapper = this._onDidChangeKeyboardMapper.event;
            this._layoutInfo = null;
            this._rawMapping = null;
            this._keyboardMapper = null;
            this._initialized = false;
        }
        KeyboardMapperFactory.prototype._onKeyboardLayoutChanged = function () {
            if (this._initialized) {
                this._setKeyboardData(nativeKeymap.getCurrentKeyboardLayout(), nativeKeymap.getKeyMap());
            }
        };
        KeyboardMapperFactory.prototype.getKeyboardMapper = function (dispatchConfig) {
            if (!this._initialized) {
                this._setKeyboardData(nativeKeymap.getCurrentKeyboardLayout(), nativeKeymap.getKeyMap());
            }
            if (dispatchConfig === 1 /* KeyCode */) {
                // Forcefully set to use keyCode
                return new macLinuxFallbackKeyboardMapper_1.MacLinuxFallbackKeyboardMapper(platform_1.OS);
            }
            return this._keyboardMapper;
        };
        KeyboardMapperFactory.prototype.getCurrentKeyboardLayout = function () {
            if (!this._initialized) {
                this._setKeyboardData(nativeKeymap.getCurrentKeyboardLayout(), nativeKeymap.getKeyMap());
            }
            return this._layoutInfo;
        };
        KeyboardMapperFactory._isUSStandard = function (_kbInfo) {
            if (platform_1.OS === 3 /* Linux */) {
                var kbInfo = _kbInfo;
                return (kbInfo && kbInfo.layout === 'us');
            }
            if (platform_1.OS === 2 /* Macintosh */) {
                var kbInfo = _kbInfo;
                return (kbInfo && kbInfo.id === 'com.apple.keylayout.US');
            }
            if (platform_1.OS === 1 /* Windows */) {
                var kbInfo = _kbInfo;
                return (kbInfo && kbInfo.name === '00000409');
            }
            return false;
        };
        KeyboardMapperFactory.prototype.getRawKeyboardMapping = function () {
            if (!this._initialized) {
                this._setKeyboardData(nativeKeymap.getCurrentKeyboardLayout(), nativeKeymap.getKeyMap());
            }
            return this._rawMapping;
        };
        KeyboardMapperFactory.prototype._setKeyboardData = function (layoutInfo, rawMapping) {
            this._layoutInfo = layoutInfo;
            if (this._initialized && KeyboardMapperFactory._equals(this._rawMapping, rawMapping)) {
                // nothing to do...
                return;
            }
            this._initialized = true;
            this._rawMapping = rawMapping;
            this._keyboardMapper = new keyboardMapper_1.CachedKeyboardMapper(KeyboardMapperFactory._createKeyboardMapper(this._layoutInfo, this._rawMapping));
            this._onDidChangeKeyboardMapper.fire();
        };
        KeyboardMapperFactory._createKeyboardMapper = function (layoutInfo, rawMapping) {
            var isUSStandard = KeyboardMapperFactory._isUSStandard(layoutInfo);
            if (platform_1.OS === 1 /* Windows */) {
                return new windowsKeyboardMapper_1.WindowsKeyboardMapper(isUSStandard, rawMapping);
            }
            if (Object.keys(rawMapping).length === 0) {
                // Looks like reading the mappings failed (most likely Mac + Japanese/Chinese keyboard layouts)
                return new macLinuxFallbackKeyboardMapper_1.MacLinuxFallbackKeyboardMapper(platform_1.OS);
            }
            if (platform_1.OS === 2 /* Macintosh */) {
                var kbInfo = layoutInfo;
                if (kbInfo.id === 'com.apple.keylayout.DVORAK-QWERTYCMD') {
                    // Use keyCode based dispatching for DVORAK - QWERTY ⌘
                    return new macLinuxFallbackKeyboardMapper_1.MacLinuxFallbackKeyboardMapper(platform_1.OS);
                }
            }
            return new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(isUSStandard, rawMapping, platform_1.OS);
        };
        KeyboardMapperFactory._equals = function (a, b) {
            if (platform_1.OS === 1 /* Windows */) {
                return windowsKeyboardMapper_1.windowsKeyboardMappingEquals(a, b);
            }
            return macLinuxKeyboardMapper_1.macLinuxKeyboardMappingEquals(a, b);
        };
        KeyboardMapperFactory.INSTANCE = new KeyboardMapperFactory();
        return KeyboardMapperFactory;
    }());
    exports.KeyboardMapperFactory = KeyboardMapperFactory;
    function isContributedKeyBindingsArray(thing) {
        return Array.isArray(thing);
    }
    function isValidContributedKeyBinding(keyBinding, rejects) {
        if (!keyBinding) {
            rejects.push(nls.localize('nonempty', "expected non-empty value."));
            return false;
        }
        if (typeof keyBinding.command !== 'string') {
            rejects.push(nls.localize('requirestring', "property `{0}` is mandatory and must be of type `string`", 'command'));
            return false;
        }
        if (typeof keyBinding.key !== 'string') {
            rejects.push(nls.localize('requirestring', "property `{0}` is mandatory and must be of type `string`", 'key'));
            return false;
        }
        if (keyBinding.when && typeof keyBinding.when !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'when'));
            return false;
        }
        if (keyBinding.mac && typeof keyBinding.mac !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'mac'));
            return false;
        }
        if (keyBinding.linux && typeof keyBinding.linux !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'linux'));
            return false;
        }
        if (keyBinding.win && typeof keyBinding.win !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'win'));
            return false;
        }
        return true;
    }
    var keybindingType = {
        type: 'object',
        default: { command: '', key: '' },
        properties: {
            command: {
                description: nls.localize('vscode.extension.contributes.keybindings.command', 'Identifier of the command to run when keybinding is triggered.'),
                type: 'string'
            },
            key: {
                description: nls.localize('vscode.extension.contributes.keybindings.key', 'Key or key sequence (separate keys with plus-sign and sequences with space, e.g Ctrl+O and Ctrl+L L for a chord).'),
                type: 'string'
            },
            mac: {
                description: nls.localize('vscode.extension.contributes.keybindings.mac', 'Mac specific key or key sequence.'),
                type: 'string'
            },
            linux: {
                description: nls.localize('vscode.extension.contributes.keybindings.linux', 'Linux specific key or key sequence.'),
                type: 'string'
            },
            win: {
                description: nls.localize('vscode.extension.contributes.keybindings.win', 'Windows specific key or key sequence.'),
                type: 'string'
            },
            when: {
                description: nls.localize('vscode.extension.contributes.keybindings.when', 'Condition when the key is active.'),
                type: 'string'
            }
        }
    };
    var keybindingsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('keybindings', [], {
        description: nls.localize('vscode.extension.contributes.keybindings', "Contributes keybindings."),
        oneOf: [
            keybindingType,
            {
                type: 'array',
                items: keybindingType
            }
        ]
    });
    var DispatchConfig;
    (function (DispatchConfig) {
        DispatchConfig[DispatchConfig["Code"] = 0] = "Code";
        DispatchConfig[DispatchConfig["KeyCode"] = 1] = "KeyCode";
    })(DispatchConfig = exports.DispatchConfig || (exports.DispatchConfig = {}));
    function getDispatchConfig(configurationService) {
        var keyboard = configurationService.getValue('keyboard');
        var r = (keyboard ? keyboard.dispatch : null);
        return (r === 'keyCode' ? 1 /* KeyCode */ : 0 /* Code */);
    }
    var WorkbenchKeybindingService = /** @class */ (function (_super) {
        __extends(WorkbenchKeybindingService, _super);
        function WorkbenchKeybindingService(windowElement, contextKeyService, commandService, telemetryService, messageService, environmentService, statusBarService, configurationService) {
            var _this = _super.call(this, contextKeyService, commandService, telemetryService, messageService, statusBarService) || this;
            var dispatchConfig = getDispatchConfig(configurationService);
            configurationService.onDidChangeConfiguration(function (e) {
                var newDispatchConfig = getDispatchConfig(configurationService);
                if (dispatchConfig === newDispatchConfig) {
                    return;
                }
                dispatchConfig = newDispatchConfig;
                _this._keyboardMapper = KeyboardMapperFactory.INSTANCE.getKeyboardMapper(dispatchConfig);
                _this.updateResolver({ source: keybinding_1.KeybindingSource.Default });
            });
            _this._keyboardMapper = KeyboardMapperFactory.INSTANCE.getKeyboardMapper(dispatchConfig);
            KeyboardMapperFactory.INSTANCE.onDidChangeKeyboardMapper(function () {
                _this._keyboardMapper = KeyboardMapperFactory.INSTANCE.getKeyboardMapper(dispatchConfig);
                _this.updateResolver({ source: keybinding_1.KeybindingSource.Default });
            });
            _this._cachedResolver = null;
            _this._firstTimeComputingResolver = true;
            _this.userKeybindings = new config_1.ConfigWatcher(environmentService.appKeybindingsPath, { defaultConfig: [], onError: function (error) { return errors_1.onUnexpectedError(error); } });
            _this.toDispose.push(_this.userKeybindings);
            keybindingsExtPoint.setHandler(function (extensions) {
                var commandAdded = false;
                for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
                    var extension = extensions_1[_i];
                    commandAdded = _this._handleKeybindingsExtensionPointUser(extension.description.isBuiltin, extension.value, extension.collector) || commandAdded;
                }
                if (commandAdded) {
                    _this.updateResolver({ source: keybinding_1.KeybindingSource.Default });
                }
            });
            _this.toDispose.push(_this.userKeybindings.onDidUpdateConfiguration(function (event) { return _this.updateResolver({
                source: keybinding_1.KeybindingSource.User,
                keybindings: event.config
            }); }));
            _this.toDispose.push(dom.addDisposableListener(windowElement, dom.EventType.KEY_DOWN, function (e) {
                var keyEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                var shouldPreventDefault = _this._dispatch(keyEvent, keyEvent.target);
                if (shouldPreventDefault) {
                    keyEvent.preventDefault();
                }
            }));
            telemetryUtils_1.keybindingsTelemetry(telemetryService, _this);
            var data = KeyboardMapperFactory.INSTANCE.getCurrentKeyboardLayout();
            /* __GDPR__
                "keyboardLayout" : {
                    "currentKeyboardLayout": { "${inline}": [ "${IKeyboardLayoutInfo}" ] }
                }
            */
            telemetryService.publicLog('keyboardLayout', {
                currentKeyboardLayout: data
            });
            return _this;
        }
        WorkbenchKeybindingService.prototype.dumpDebugInfo = function () {
            var layoutInfo = JSON.stringify(KeyboardMapperFactory.INSTANCE.getCurrentKeyboardLayout(), null, '\t');
            var mapperInfo = this._keyboardMapper.dumpDebugInfo();
            var rawMapping = JSON.stringify(KeyboardMapperFactory.INSTANCE.getRawKeyboardMapping(), null, '\t');
            return "Layout info:\n" + layoutInfo + "\n" + mapperInfo + "\n\nRaw mapping:\n" + rawMapping;
        };
        WorkbenchKeybindingService.prototype._safeGetConfig = function () {
            var rawConfig = this.userKeybindings.getConfig();
            if (Array.isArray(rawConfig)) {
                return rawConfig;
            }
            return [];
        };
        WorkbenchKeybindingService.prototype.customKeybindingsCount = function () {
            var userKeybindings = this._safeGetConfig();
            return userKeybindings.length;
        };
        WorkbenchKeybindingService.prototype.updateResolver = function (event) {
            this._cachedResolver = null;
            this._onDidUpdateKeybindings.fire(event);
        };
        WorkbenchKeybindingService.prototype._getResolver = function () {
            if (!this._cachedResolver) {
                var defaults = this._resolveKeybindingItems(keybindingsRegistry_1.KeybindingsRegistry.getDefaultKeybindings(), true);
                var overrides = this._resolveUserKeybindingItems(this._getExtraKeybindings(this._firstTimeComputingResolver), false);
                this._cachedResolver = new keybindingResolver_1.KeybindingResolver(defaults, overrides);
                this._firstTimeComputingResolver = false;
            }
            return this._cachedResolver;
        };
        WorkbenchKeybindingService.prototype._resolveKeybindingItems = function (items, isDefault) {
            var result = [], resultLen = 0;
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                var when = (item.when ? item.when.normalize() : null);
                var keybinding = item.keybinding;
                if (!keybinding) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
                }
                else {
                    var resolvedKeybindings = this.resolveKeybinding(keybinding);
                    for (var j = 0; j < resolvedKeybindings.length; j++) {
                        result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
                    }
                }
            }
            return result;
        };
        WorkbenchKeybindingService.prototype._resolveUserKeybindingItems = function (items, isDefault) {
            var result = [], resultLen = 0;
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                var when = (item.when ? item.when.normalize() : null);
                var firstPart = item.firstPart;
                var chordPart = item.chordPart;
                if (!firstPart) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(null, item.command, item.commandArgs, when, isDefault);
                }
                else {
                    var resolvedKeybindings = this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
                    for (var j = 0; j < resolvedKeybindings.length; j++) {
                        result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybindings[j], item.command, item.commandArgs, when, isDefault);
                    }
                }
            }
            return result;
        };
        WorkbenchKeybindingService.prototype._getExtraKeybindings = function (isFirstTime) {
            var extraUserKeybindings = this._safeGetConfig();
            if (!isFirstTime) {
                var cnt = extraUserKeybindings.length;
                /* __GDPR__
                    "customKeybindingsChanged" : {
                        "keyCount" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this._telemetryService.publicLog('customKeybindingsChanged', {
                    keyCount: cnt
                });
            }
            return extraUserKeybindings.map(function (k) { return keybindingIO_1.KeybindingIO.readUserKeybindingItem(k, platform_1.OS); });
        };
        WorkbenchKeybindingService.prototype.resolveKeybinding = function (kb) {
            return this._keyboardMapper.resolveKeybinding(kb);
        };
        WorkbenchKeybindingService.prototype.resolveKeyboardEvent = function (keyboardEvent) {
            return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
        };
        WorkbenchKeybindingService.prototype.resolveUserBinding = function (userBinding) {
            var _a = keybindingIO_1.KeybindingIO._readUserBinding(userBinding), firstPart = _a[0], chordPart = _a[1];
            return this._keyboardMapper.resolveUserBinding(firstPart, chordPart);
        };
        WorkbenchKeybindingService.prototype._handleKeybindingsExtensionPointUser = function (isBuiltin, keybindings, collector) {
            if (isContributedKeyBindingsArray(keybindings)) {
                var commandAdded = false;
                for (var i = 0, len = keybindings.length; i < len; i++) {
                    commandAdded = this._handleKeybinding(isBuiltin, i + 1, keybindings[i], collector) || commandAdded;
                }
                return commandAdded;
            }
            else {
                return this._handleKeybinding(isBuiltin, 1, keybindings, collector);
            }
        };
        WorkbenchKeybindingService.prototype._handleKeybinding = function (isBuiltin, idx, keybindings, collector) {
            var rejects = [];
            var commandAdded = false;
            if (isValidContributedKeyBinding(keybindings, rejects)) {
                var rule = this._asCommandRule(isBuiltin, idx++, keybindings);
                if (rule) {
                    keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule2(rule);
                    commandAdded = true;
                }
            }
            if (rejects.length > 0) {
                collector.error(nls.localize('invalid.keybindings', "Invalid `contributes.{0}`: {1}", keybindingsExtPoint.name, rejects.join('\n')));
            }
            return commandAdded;
        };
        WorkbenchKeybindingService.prototype._asCommandRule = function (isBuiltin, idx, binding) {
            var command = binding.command, when = binding.when, key = binding.key, mac = binding.mac, linux = binding.linux, win = binding.win;
            var weight;
            if (isBuiltin) {
                weight = keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.builtinExtension(idx);
            }
            else {
                weight = keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.externalExtension(idx);
            }
            var desc = {
                id: command,
                when: contextkey_1.ContextKeyExpr.deserialize(when),
                weight: weight,
                primary: keybindingIO_1.KeybindingIO.readKeybinding(key, platform_1.OS),
                mac: mac && { primary: keybindingIO_1.KeybindingIO.readKeybinding(mac, platform_1.OS) },
                linux: linux && { primary: keybindingIO_1.KeybindingIO.readKeybinding(linux, platform_1.OS) },
                win: win && { primary: keybindingIO_1.KeybindingIO.readKeybinding(win, platform_1.OS) }
            };
            if (!desc.primary && !desc.mac && !desc.linux && !desc.win) {
                return undefined;
            }
            return desc;
        };
        WorkbenchKeybindingService.prototype.getDefaultKeybindingsContent = function () {
            var resolver = this._getResolver();
            var defaultKeybindings = resolver.getDefaultKeybindings();
            var boundCommands = resolver.getDefaultBoundCommands();
            return (WorkbenchKeybindingService._getDefaultKeybindings(defaultKeybindings)
                + '\n\n'
                + WorkbenchKeybindingService._getAllCommandsAsComment(boundCommands));
        };
        WorkbenchKeybindingService._getDefaultKeybindings = function (defaultKeybindings) {
            var out = new keybindingIO_1.OutputBuilder();
            out.writeLine('[');
            var lastIndex = defaultKeybindings.length - 1;
            defaultKeybindings.forEach(function (k, index) {
                keybindingIO_1.KeybindingIO.writeKeybindingItem(out, k, platform_1.OS);
                if (index !== lastIndex) {
                    out.writeLine(',');
                }
                else {
                    out.writeLine();
                }
            });
            out.writeLine(']');
            return out.toString();
        };
        WorkbenchKeybindingService._getAllCommandsAsComment = function (boundCommands) {
            var unboundCommands = keybindingResolver_1.KeybindingResolver.getAllUnboundCommands(boundCommands);
            var pretty = unboundCommands.sort().join('\n// - ');
            return '// ' + nls.localize('unboundCommands', "Here are other available commands: ") + '\n// - ' + pretty;
        };
        WorkbenchKeybindingService = __decorate([
            __param(1, contextkey_1.IContextKeyService),
            __param(2, commands_1.ICommandService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, message_1.IMessageService),
            __param(5, environment_1.IEnvironmentService),
            __param(6, statusbar_1.IStatusbarService),
            __param(7, configuration_1.IConfigurationService)
        ], WorkbenchKeybindingService);
        return WorkbenchKeybindingService;
    }(abstractKeybindingService_1.AbstractKeybindingService));
    exports.WorkbenchKeybindingService = WorkbenchKeybindingService;
    var schemaId = 'vscode://schemas/keybindings';
    var schema = {
        'id': schemaId,
        'type': 'array',
        'title': nls.localize('keybindings.json.title', "Keybindings configuration"),
        'items': {
            'required': ['key'],
            'type': 'object',
            'defaultSnippets': [{ 'body': { 'key': '$1', 'command': '$2', 'when': '$3' } }],
            'properties': {
                'key': {
                    'type': 'string',
                    'description': nls.localize('keybindings.json.key', "Key or key sequence (separated by space)"),
                },
                'command': {
                    'description': nls.localize('keybindings.json.command', "Name of the command to execute"),
                },
                'when': {
                    'type': 'string',
                    'description': nls.localize('keybindings.json.when', "Condition when the key is active.")
                },
                'args': {
                    'description': nls.localize('keybindings.json.args', "Arguments to pass to the command to execute.")
                }
            }
        }
    };
    var schemaRegistry = platform_2.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(schemaId, schema);
    var configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    var _initialize = function () {
        var keyboardConfiguration = {
            'id': 'keyboard',
            'order': 15,
            'type': 'object',
            'title': nls.localize('keyboardConfigurationTitle', "Keyboard"),
            'overridable': true,
            'properties': {
                'keyboard.dispatch': {
                    'type': 'string',
                    'enum': ['code', 'keyCode'],
                    'default': 'code',
                    'description': nls.localize('dispatch', "Controls the dispatching logic for key presses to use either `code` (recommended) or `keyCode`."),
                    'included': platform_1.OS === 2 /* Macintosh */ || platform_1.OS === 3 /* Linux */
                },
                'keyboard.touchbar.enabled': {
                    'type': 'boolean',
                    'default': true,
                    'description': nls.localize('touchbar.enabled', "Enables the macOS touchbar buttons on the keyboard if available."),
                    'included': platform_1.OS === 2 /* Macintosh */ && parseFloat(os_1.release()) >= 16 // Minimum: macOS Sierra (10.12.x = darwin 16.x)
                }
            }
        };
        configurationRegistry.registerConfiguration(keyboardConfiguration);
    };
    if (typeof MonacoSnapshotInitializeCallbacks !== 'undefined') {
        MonacoSnapshotInitializeCallbacks.push(_initialize);
    }
    else {
        _initialize();
    }
});
