/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uri", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, objects, types, uri_1, platform_1, instantiation_1, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IConfigurationService = instantiation_1.createDecorator('configurationService');
    function isConfigurationOverrides(thing) {
        return thing
            && typeof thing === 'object'
            && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === 'string')
            && (!thing.resource || thing.resource instanceof uri_1.default);
    }
    exports.isConfigurationOverrides = isConfigurationOverrides;
    var ConfigurationTarget;
    (function (ConfigurationTarget) {
        ConfigurationTarget[ConfigurationTarget["USER"] = 1] = "USER";
        ConfigurationTarget[ConfigurationTarget["WORKSPACE"] = 2] = "WORKSPACE";
        ConfigurationTarget[ConfigurationTarget["WORKSPACE_FOLDER"] = 3] = "WORKSPACE_FOLDER";
        ConfigurationTarget[ConfigurationTarget["DEFAULT"] = 4] = "DEFAULT";
        ConfigurationTarget[ConfigurationTarget["MEMORY"] = 5] = "MEMORY";
    })(ConfigurationTarget = exports.ConfigurationTarget || (exports.ConfigurationTarget = {}));
    function compare(from, to) {
        var added = to.keys.filter(function (key) { return from.keys.indexOf(key) === -1; });
        var removed = from.keys.filter(function (key) { return to.keys.indexOf(key) === -1; });
        var updated = [];
        for (var _i = 0, _a = from.keys; _i < _a.length; _i++) {
            var key = _a[_i];
            var value1 = getConfigurationValue(from.contents, key);
            var value2 = getConfigurationValue(to.contents, key);
            if (!objects.equals(value1, value2)) {
                updated.push(key);
            }
        }
        return { added: added, removed: removed, updated: updated };
    }
    exports.compare = compare;
    function toOverrides(raw, conflictReporter) {
        var overrides = [];
        var configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
        for (var _i = 0, _a = Object.keys(raw); _i < _a.length; _i++) {
            var key = _a[_i];
            if (configurationRegistry_1.OVERRIDE_PROPERTY_PATTERN.test(key)) {
                var overrideRaw = {};
                for (var keyInOverrideRaw in raw[key]) {
                    if (configurationProperties[keyInOverrideRaw] && configurationProperties[keyInOverrideRaw].overridable) {
                        overrideRaw[keyInOverrideRaw] = raw[key][keyInOverrideRaw];
                    }
                }
                overrides.push({
                    identifiers: [overrideIdentifierFromKey(key).trim()],
                    contents: toValuesTree(overrideRaw, conflictReporter)
                });
            }
        }
        return overrides;
    }
    exports.toOverrides = toOverrides;
    function toValuesTree(properties, conflictReporter) {
        var root = Object.create(null);
        for (var key in properties) {
            addToValueTree(root, key, properties[key], conflictReporter);
        }
        return root;
    }
    exports.toValuesTree = toValuesTree;
    function addToValueTree(settingsTreeRoot, key, value, conflictReporter) {
        var segments = key.split('.');
        var last = segments.pop();
        var curr = settingsTreeRoot;
        for (var i = 0; i < segments.length; i++) {
            var s = segments[i];
            var obj = curr[s];
            switch (typeof obj) {
                case 'undefined':
                    obj = curr[s] = Object.create(null);
                    break;
                case 'object':
                    break;
                default:
                    conflictReporter("Ignoring " + key + " as " + segments.slice(0, i + 1).join('.') + " is " + JSON.stringify(obj));
                    return;
            }
            curr = obj;
        }
        if (typeof curr === 'object') {
            curr[last] = value; // workaround https://github.com/Microsoft/vscode/issues/13606
        }
        else {
            conflictReporter("Ignoring " + key + " as " + segments.join('.') + " is " + JSON.stringify(curr));
        }
    }
    exports.addToValueTree = addToValueTree;
    function removeFromValueTree(valueTree, key) {
        var segments = key.split('.');
        doRemoveFromValueTree(valueTree, segments);
    }
    exports.removeFromValueTree = removeFromValueTree;
    function doRemoveFromValueTree(valueTree, segments) {
        var first = segments.shift();
        if (segments.length === 0) {
            // Reached last segment
            delete valueTree[first];
            return;
        }
        if (Object.keys(valueTree).indexOf(first) !== -1) {
            var value = valueTree[first];
            if (typeof value === 'object' && !Array.isArray(value)) {
                doRemoveFromValueTree(value, segments);
                if (Object.keys(value).length === 0) {
                    delete valueTree[first];
                }
            }
        }
    }
    /**
     * A helper function to get the configuration value with a specific settings path (e.g. config.some.setting)
     */
    function getConfigurationValue(config, settingPath, defaultValue) {
        function accessSetting(config, path) {
            var current = config;
            for (var i = 0; i < path.length; i++) {
                if (typeof current !== 'object' || current === null) {
                    return undefined;
                }
                current = current[path[i]];
            }
            return current;
        }
        var path = settingPath.split('.');
        var result = accessSetting(config, path);
        return typeof result === 'undefined' ? defaultValue : result;
    }
    exports.getConfigurationValue = getConfigurationValue;
    function merge(base, add, overwrite) {
        Object.keys(add).forEach(function (key) {
            if (key in base) {
                if (types.isObject(base[key]) && types.isObject(add[key])) {
                    merge(base[key], add[key], overwrite);
                }
                else if (overwrite) {
                    base[key] = add[key];
                }
            }
            else {
                base[key] = add[key];
            }
        });
    }
    exports.merge = merge;
    function getConfigurationKeys() {
        var properties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
        return Object.keys(properties);
    }
    exports.getConfigurationKeys = getConfigurationKeys;
    function getDefaultValues() {
        var valueTreeRoot = Object.create(null);
        var properties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
        for (var key in properties) {
            var value = properties[key].default;
            addToValueTree(valueTreeRoot, key, value, function (message) { return console.error("Conflict in default settings: " + message); });
        }
        return valueTreeRoot;
    }
    exports.getDefaultValues = getDefaultValues;
    function overrideIdentifierFromKey(key) {
        return key.substring(1, key.length - 1);
    }
    exports.overrideIdentifierFromKey = overrideIdentifierFromKey;
    function keyFromOverrideIdentifier(overrideIdentifier) {
        return "[" + overrideIdentifier + "]";
    }
    exports.keyFromOverrideIdentifier = keyFromOverrideIdentifier;
});
