define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/event", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/base/common/platform"], function (require, exports, keyCodes_1, event_1, usLayoutResolvedKeybinding_1, platform_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MockKeybindingContextKey = /** @class */ (function () {
        function MockKeybindingContextKey(defaultValue) {
            this._defaultValue = defaultValue;
            this._value = this._defaultValue;
        }
        MockKeybindingContextKey.prototype.set = function (value) {
            this._value = value;
        };
        MockKeybindingContextKey.prototype.reset = function () {
            this._value = this._defaultValue;
        };
        MockKeybindingContextKey.prototype.get = function () {
            return this._value;
        };
        return MockKeybindingContextKey;
    }());
    var MockContextKeyService = /** @class */ (function () {
        function MockContextKeyService() {
            this._keys = new Map();
        }
        MockContextKeyService.prototype.dispose = function () {
            //
        };
        MockContextKeyService.prototype.createKey = function (key, defaultValue) {
            var ret = new MockKeybindingContextKey(defaultValue);
            this._keys.set(key, ret);
            return ret;
        };
        MockContextKeyService.prototype.contextMatchesRules = function (rules) {
            return false;
        };
        Object.defineProperty(MockContextKeyService.prototype, "onDidChangeContext", {
            get: function () {
                return event_1.default.None;
            },
            enumerable: true,
            configurable: true
        });
        MockContextKeyService.prototype.getContextKeyValue = function (key) {
            if (this._keys.has(key)) {
                return this._keys.get(key).get();
            }
        };
        MockContextKeyService.prototype.getContext = function (domNode) {
            return null;
        };
        MockContextKeyService.prototype.createScoped = function (domNode) {
            return this;
        };
        return MockContextKeyService;
    }());
    exports.MockContextKeyService = MockContextKeyService;
    var MockKeybindingService = /** @class */ (function () {
        function MockKeybindingService() {
        }
        Object.defineProperty(MockKeybindingService.prototype, "onDidUpdateKeybindings", {
            get: function () {
                return event_1.default.None;
            },
            enumerable: true,
            configurable: true
        });
        MockKeybindingService.prototype.getDefaultKeybindingsContent = function () {
            return null;
        };
        MockKeybindingService.prototype.getDefaultKeybindings = function () {
            return [];
        };
        MockKeybindingService.prototype.getKeybindings = function () {
            return [];
        };
        MockKeybindingService.prototype.resolveKeybinding = function (keybinding) {
            return [new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keybinding, platform_1.OS)];
        };
        MockKeybindingService.prototype.resolveKeyboardEvent = function (keyboardEvent) {
            var keybinding = new keyCodes_1.SimpleKeybinding(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
            return this.resolveKeybinding(keybinding)[0];
        };
        MockKeybindingService.prototype.resolveUserBinding = function (userBinding) {
            return [];
        };
        MockKeybindingService.prototype.lookupKeybindings = function (commandId) {
            return [];
        };
        MockKeybindingService.prototype.lookupKeybinding = function (commandId) {
            return null;
        };
        MockKeybindingService.prototype.customKeybindingsCount = function () {
            return 0;
        };
        MockKeybindingService.prototype.softDispatch = function (keybinding, target) {
            return null;
        };
        return MockKeybindingService;
    }());
    exports.MockKeybindingService = MockKeybindingService;
});
