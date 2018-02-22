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
define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/platform/keybinding/common/abstractKeybindingService", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/contextkey/common/contextkey", "vs/base/common/winjs.base", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/base/common/platform", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, assert, keyCodes_1, abstractKeybindingService_1, usLayoutResolvedKeybinding_1, keybindingResolver_1, contextkey_1, winjs_base_1, resolvedKeybindingItem_1, platform_1, telemetryUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createContext(ctx) {
        return {
            getValue: function (key) {
                return ctx[key];
            }
        };
    }
    suite('AbstractKeybindingService', function () {
        var TestKeybindingService = /** @class */ (function (_super) {
            __extends(TestKeybindingService, _super);
            function TestKeybindingService(resolver, contextKeyService, commandService, messageService, statusService) {
                var _this = _super.call(this, contextKeyService, commandService, telemetryUtils_1.NullTelemetryService, messageService, statusService) || this;
                _this._resolver = resolver;
                return _this;
            }
            TestKeybindingService.prototype._getResolver = function () {
                return this._resolver;
            };
            TestKeybindingService.prototype.resolveKeybinding = function (kb) {
                return [new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(kb, platform_1.OS)];
            };
            TestKeybindingService.prototype.resolveKeyboardEvent = function (keyboardEvent) {
                var keybinding = new keyCodes_1.SimpleKeybinding(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
                return this.resolveKeybinding(keybinding)[0];
            };
            TestKeybindingService.prototype.resolveUserBinding = function (userBinding) {
                return [];
            };
            TestKeybindingService.prototype.testDispatch = function (kb) {
                var keybinding = keyCodes_1.createSimpleKeybinding(kb, platform_1.OS);
                return this._dispatch({
                    ctrlKey: keybinding.ctrlKey,
                    shiftKey: keybinding.shiftKey,
                    altKey: keybinding.altKey,
                    metaKey: keybinding.metaKey,
                    keyCode: keybinding.keyCode,
                    code: null
                }, null);
            };
            return TestKeybindingService;
        }(abstractKeybindingService_1.AbstractKeybindingService));
        var createTestKeybindingService = null;
        var currentContextValue = null;
        var executeCommandCalls = null;
        var showMessageCalls = null;
        var statusMessageCalls = null;
        var statusMessageCallsDisposed = null;
        setup(function () {
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            createTestKeybindingService = function (items) {
                var contextKeyService = {
                    _serviceBrand: undefined,
                    dispose: undefined,
                    onDidChangeContext: undefined,
                    createKey: undefined,
                    contextMatchesRules: undefined,
                    getContextKeyValue: undefined,
                    createScoped: undefined,
                    getContext: function (target) {
                        return currentContextValue;
                    }
                };
                var commandService = {
                    _serviceBrand: undefined,
                    onWillExecuteCommand: function () { return ({ dispose: function () { } }); },
                    executeCommand: function (commandId) {
                        var args = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            args[_i - 1] = arguments[_i];
                        }
                        executeCommandCalls.push({
                            commandId: commandId,
                            args: args
                        });
                        return winjs_base_1.TPromise.as(void 0);
                    }
                };
                var messageService = {
                    _serviceBrand: undefined,
                    hideAll: undefined,
                    confirm: undefined,
                    confirmWithCheckbox: undefined,
                    show: function (sev, message) {
                        showMessageCalls.push({
                            sev: sev,
                            message: message
                        });
                        return null;
                    }
                };
                var statusbarService = {
                    _serviceBrand: undefined,
                    addEntry: undefined,
                    setStatusMessage: function (message, autoDisposeAfter, delayBy) {
                        statusMessageCalls.push(message);
                        return {
                            dispose: function () {
                                statusMessageCallsDisposed.push(message);
                            }
                        };
                    }
                };
                var resolver = new keybindingResolver_1.KeybindingResolver(items, []);
                return new TestKeybindingService(resolver, contextKeyService, commandService, messageService, statusbarService);
            };
        });
        teardown(function () {
            currentContextValue = null;
            executeCommandCalls = null;
            showMessageCalls = null;
            createTestKeybindingService = null;
            statusMessageCalls = null;
            statusMessageCallsDisposed = null;
        });
        function kbItem(keybinding, command, when) {
            if (when === void 0) { when = null; }
            var resolvedKeybinding = (keybinding !== 0 ? new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keyCodes_1.createKeybinding(keybinding, platform_1.OS), platform_1.OS) : null);
            return new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybinding, command, null, when, true);
        }
        function toUsLabel(keybinding) {
            var usResolvedKeybinding = new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keyCodes_1.createKeybinding(keybinding, platform_1.OS), platform_1.OS);
            return usResolvedKeybinding.getLabel();
        }
        test('issue #16498: chord mode is quit for invalid chords', function () {
            var kbService = createTestKeybindingService([
                kbItem(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 54 /* KEY_X */), 'chordCommand'),
                kbItem(1 /* Backspace */, 'simpleCommand'),
            ]);
            // send Ctrl/Cmd + K
            var shouldPreventDefault = kbService.testDispatch(2048 /* CtrlCmd */ | 41 /* KEY_K */);
            assert.equal(shouldPreventDefault, true);
            assert.deepEqual(executeCommandCalls, []);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, [
                "(" + toUsLabel(2048 /* CtrlCmd */ | 41 /* KEY_K */) + ") was pressed. Waiting for second key of chord..."
            ]);
            assert.deepEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send backspace
            shouldPreventDefault = kbService.testDispatch(1 /* Backspace */);
            assert.equal(shouldPreventDefault, true);
            assert.deepEqual(executeCommandCalls, []);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, [
                "The key combination (" + toUsLabel(2048 /* CtrlCmd */ | 41 /* KEY_K */) + ", " + toUsLabel(1 /* Backspace */) + ") is not a command."
            ]);
            assert.deepEqual(statusMessageCallsDisposed, [
                "(" + toUsLabel(2048 /* CtrlCmd */ | 41 /* KEY_K */) + ") was pressed. Waiting for second key of chord..."
            ]);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send backspace
            shouldPreventDefault = kbService.testDispatch(1 /* Backspace */);
            assert.equal(shouldPreventDefault, true);
            assert.deepEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [{}]
                }]);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, []);
            assert.deepEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
        test('issue #16833: Keybinding service should not testDispatch on modifier keys', function () {
            var kbService = createTestKeybindingService([
                kbItem(5 /* Ctrl */, 'nope'),
                kbItem(57 /* Meta */, 'nope'),
                kbItem(6 /* Alt */, 'nope'),
                kbItem(4 /* Shift */, 'nope'),
                kbItem(2048 /* CtrlCmd */, 'nope'),
                kbItem(256 /* WinCtrl */, 'nope'),
                kbItem(512 /* Alt */, 'nope'),
                kbItem(1024 /* Shift */, 'nope'),
            ]);
            function assertIsIgnored(keybinding) {
                var shouldPreventDefault = kbService.testDispatch(keybinding);
                assert.equal(shouldPreventDefault, false);
                assert.deepEqual(executeCommandCalls, []);
                assert.deepEqual(showMessageCalls, []);
                assert.deepEqual(statusMessageCalls, []);
                assert.deepEqual(statusMessageCallsDisposed, []);
                executeCommandCalls = [];
                showMessageCalls = [];
                statusMessageCalls = [];
                statusMessageCallsDisposed = [];
            }
            assertIsIgnored(5 /* Ctrl */);
            assertIsIgnored(57 /* Meta */);
            assertIsIgnored(6 /* Alt */);
            assertIsIgnored(4 /* Shift */);
            assertIsIgnored(2048 /* CtrlCmd */);
            assertIsIgnored(256 /* WinCtrl */);
            assertIsIgnored(512 /* Alt */);
            assertIsIgnored(1024 /* Shift */);
            kbService.dispose();
        });
        test('can trigger command that is sharing keybinding with chord', function () {
            var kbService = createTestKeybindingService([
                kbItem(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 54 /* KEY_X */), 'chordCommand'),
                kbItem(2048 /* CtrlCmd */ | 41 /* KEY_K */, 'simpleCommand', contextkey_1.ContextKeyExpr.has('key1')),
            ]);
            // send Ctrl/Cmd + K
            currentContextValue = createContext({
                key1: true
            });
            var shouldPreventDefault = kbService.testDispatch(2048 /* CtrlCmd */ | 41 /* KEY_K */);
            assert.equal(shouldPreventDefault, true);
            assert.deepEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [{}]
                }]);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, []);
            assert.deepEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + K
            currentContextValue = createContext({});
            shouldPreventDefault = kbService.testDispatch(2048 /* CtrlCmd */ | 41 /* KEY_K */);
            assert.equal(shouldPreventDefault, true);
            assert.deepEqual(executeCommandCalls, []);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, [
                "(" + toUsLabel(2048 /* CtrlCmd */ | 41 /* KEY_K */) + ") was pressed. Waiting for second key of chord..."
            ]);
            assert.deepEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + X
            currentContextValue = createContext({});
            shouldPreventDefault = kbService.testDispatch(2048 /* CtrlCmd */ | 54 /* KEY_X */);
            assert.equal(shouldPreventDefault, true);
            assert.deepEqual(executeCommandCalls, [{
                    commandId: 'chordCommand',
                    args: [{}]
                }]);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, []);
            assert.deepEqual(statusMessageCallsDisposed, [
                "(" + toUsLabel(2048 /* CtrlCmd */ | 41 /* KEY_K */) + ") was pressed. Waiting for second key of chord..."
            ]);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
        test('cannot trigger chord if command is overwriting', function () {
            var kbService = createTestKeybindingService([
                kbItem(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 54 /* KEY_X */), 'chordCommand', contextkey_1.ContextKeyExpr.has('key1')),
                kbItem(2048 /* CtrlCmd */ | 41 /* KEY_K */, 'simpleCommand'),
            ]);
            // send Ctrl/Cmd + K
            currentContextValue = createContext({});
            var shouldPreventDefault = kbService.testDispatch(2048 /* CtrlCmd */ | 41 /* KEY_K */);
            assert.equal(shouldPreventDefault, true);
            assert.deepEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [{}]
                }]);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, []);
            assert.deepEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + K
            currentContextValue = createContext({
                key1: true
            });
            shouldPreventDefault = kbService.testDispatch(2048 /* CtrlCmd */ | 41 /* KEY_K */);
            assert.equal(shouldPreventDefault, true);
            assert.deepEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [{}]
                }]);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, []);
            assert.deepEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + X
            currentContextValue = createContext({
                key1: true
            });
            shouldPreventDefault = kbService.testDispatch(2048 /* CtrlCmd */ | 54 /* KEY_X */);
            assert.equal(shouldPreventDefault, false);
            assert.deepEqual(executeCommandCalls, []);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, []);
            assert.deepEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
        test('can have spying command', function () {
            var kbService = createTestKeybindingService([
                kbItem(2048 /* CtrlCmd */ | 41 /* KEY_K */, '^simpleCommand'),
            ]);
            // send Ctrl/Cmd + K
            currentContextValue = createContext({});
            var shouldPreventDefault = kbService.testDispatch(2048 /* CtrlCmd */ | 41 /* KEY_K */);
            assert.equal(shouldPreventDefault, false);
            assert.deepEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [{}]
                }]);
            assert.deepEqual(showMessageCalls, []);
            assert.deepEqual(statusMessageCalls, []);
            assert.deepEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
    });
});
