define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/base/common/platform"], function (require, exports, assert, keyCodes_1, keybindingResolver_1, contextkey_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1, platform_1) {
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
    suite('KeybindingResolver', function () {
        function kbItem(keybinding, command, commandArgs, when, isDefault) {
            var resolvedKeybinding = (keybinding !== 0 ? new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keyCodes_1.createKeybinding(keybinding, platform_1.OS), platform_1.OS) : null);
            return new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybinding, command, commandArgs, when ? when.normalize() : null, isDefault);
        }
        function getDispatchStr(runtimeKb) {
            return usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.getDispatchStr(runtimeKb);
        }
        test('resolve key', function () {
            var keybinding = 2048 /* CtrlCmd */ | 1024 /* Shift */ | 56 /* KEY_Z */;
            var runtimeKeybinding = keyCodes_1.createKeybinding(keybinding, platform_1.OS);
            var contextRules = contextkey_1.ContextKeyExpr.equals('bar', 'baz');
            var keybindingItem = kbItem(keybinding, 'yes', null, contextRules, true);
            assert.equal(keybindingResolver_1.KeybindingResolver.contextMatchesRules(createContext({ bar: 'baz' }), contextRules), true);
            assert.equal(keybindingResolver_1.KeybindingResolver.contextMatchesRules(createContext({ bar: 'bz' }), contextRules), false);
            var resolver = new keybindingResolver_1.KeybindingResolver([keybindingItem], []);
            assert.equal(resolver.resolve(createContext({ bar: 'baz' }), null, getDispatchStr(runtimeKeybinding)).commandId, 'yes');
            assert.equal(resolver.resolve(createContext({ bar: 'bz' }), null, getDispatchStr(runtimeKeybinding)), null);
        });
        test('resolve key with arguments', function () {
            var commandArgs = { text: 'no' };
            var keybinding = 2048 /* CtrlCmd */ | 1024 /* Shift */ | 56 /* KEY_Z */;
            var runtimeKeybinding = keyCodes_1.createKeybinding(keybinding, platform_1.OS);
            var contextRules = contextkey_1.ContextKeyExpr.equals('bar', 'baz');
            var keybindingItem = kbItem(keybinding, 'yes', commandArgs, contextRules, true);
            var resolver = new keybindingResolver_1.KeybindingResolver([keybindingItem], []);
            assert.equal(resolver.resolve(createContext({ bar: 'baz' }), null, getDispatchStr(runtimeKeybinding)).commandArgs, commandArgs);
        });
        test('KeybindingResolver.combine simple 1', function () {
            var defaults = [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true)
            ];
            var overrides = [
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), false)
            ];
            var actual = keybindingResolver_1.KeybindingResolver.combine(defaults, overrides);
            assert.deepEqual(actual, [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), false),
            ]);
        });
        test('KeybindingResolver.combine simple 2', function () {
            var defaults = [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ];
            var overrides = [
                kbItem(33 /* KEY_C */, 'yes3', null, contextkey_1.ContextKeyExpr.equals('3', 'c'), false)
            ];
            var actual = keybindingResolver_1.KeybindingResolver.combine(defaults, overrides);
            assert.deepEqual(actual, [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true),
                kbItem(33 /* KEY_C */, 'yes3', null, contextkey_1.ContextKeyExpr.equals('3', 'c'), false),
            ]);
        });
        test('KeybindingResolver.combine removal with not matching when', function () {
            var defaults = [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ];
            var overrides = [
                kbItem(31 /* KEY_A */, '-yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'b'), false)
            ];
            var actual = keybindingResolver_1.KeybindingResolver.combine(defaults, overrides);
            assert.deepEqual(actual, [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ]);
        });
        test('KeybindingResolver.combine removal with not matching keybinding', function () {
            var defaults = [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ];
            var overrides = [
                kbItem(32 /* KEY_B */, '-yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), false)
            ];
            var actual = keybindingResolver_1.KeybindingResolver.combine(defaults, overrides);
            assert.deepEqual(actual, [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ]);
        });
        test('KeybindingResolver.combine removal with matching keybinding and when', function () {
            var defaults = [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ];
            var overrides = [
                kbItem(31 /* KEY_A */, '-yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), false)
            ];
            var actual = keybindingResolver_1.KeybindingResolver.combine(defaults, overrides);
            assert.deepEqual(actual, [
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ]);
        });
        test('KeybindingResolver.combine removal with unspecified keybinding', function () {
            var defaults = [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ];
            var overrides = [
                kbItem(0, '-yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), false)
            ];
            var actual = keybindingResolver_1.KeybindingResolver.combine(defaults, overrides);
            assert.deepEqual(actual, [
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ]);
        });
        test('KeybindingResolver.combine removal with unspecified when', function () {
            var defaults = [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ];
            var overrides = [
                kbItem(31 /* KEY_A */, '-yes1', null, null, false)
            ];
            var actual = keybindingResolver_1.KeybindingResolver.combine(defaults, overrides);
            assert.deepEqual(actual, [
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ]);
        });
        test('KeybindingResolver.combine removal with unspecified when and unspecified keybinding', function () {
            var defaults = [
                kbItem(31 /* KEY_A */, 'yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ];
            var overrides = [
                kbItem(0, '-yes1', null, null, false)
            ];
            var actual = keybindingResolver_1.KeybindingResolver.combine(defaults, overrides);
            assert.deepEqual(actual, [
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ]);
        });
        test('issue #612#issuecomment-222109084 cannot remove keybindings for commands with ^', function () {
            var defaults = [
                kbItem(31 /* KEY_A */, '^yes1', null, contextkey_1.ContextKeyExpr.equals('1', 'a'), true),
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ];
            var overrides = [
                kbItem(31 /* KEY_A */, '-yes1', null, null, false)
            ];
            var actual = keybindingResolver_1.KeybindingResolver.combine(defaults, overrides);
            assert.deepEqual(actual, [
                kbItem(32 /* KEY_B */, 'yes2', null, contextkey_1.ContextKeyExpr.equals('2', 'b'), true)
            ]);
        });
        test('contextIsEntirelyIncluded', function () {
            var assertIsIncluded = function (a, b) {
                var tmpA = new contextkey_1.ContextKeyAndExpr(a).normalize();
                var tmpB = new contextkey_1.ContextKeyAndExpr(b).normalize();
                assert.equal(keybindingResolver_1.KeybindingResolver.whenIsEntirelyIncluded(tmpA, tmpB), true);
            };
            var assertIsNotIncluded = function (a, b) {
                var tmpA = new contextkey_1.ContextKeyAndExpr(a).normalize();
                var tmpB = new contextkey_1.ContextKeyAndExpr(b).normalize();
                assert.equal(keybindingResolver_1.KeybindingResolver.whenIsEntirelyIncluded(tmpA, tmpB), false);
            };
            var key1IsTrue = contextkey_1.ContextKeyExpr.equals('key1', true);
            var key1IsNotFalse = contextkey_1.ContextKeyExpr.notEquals('key1', false);
            var key1IsFalse = contextkey_1.ContextKeyExpr.equals('key1', false);
            var key1IsNotTrue = contextkey_1.ContextKeyExpr.notEquals('key1', true);
            var key2IsTrue = contextkey_1.ContextKeyExpr.equals('key2', true);
            var key2IsNotFalse = contextkey_1.ContextKeyExpr.notEquals('key2', false);
            var key3IsTrue = contextkey_1.ContextKeyExpr.equals('key3', true);
            var key4IsTrue = contextkey_1.ContextKeyExpr.equals('key4', true);
            assertIsIncluded([key1IsTrue], null);
            assertIsIncluded([key1IsTrue], []);
            assertIsIncluded([key1IsTrue], [key1IsTrue]);
            assertIsIncluded([key1IsTrue], [key1IsNotFalse]);
            assertIsIncluded([key1IsFalse], []);
            assertIsIncluded([key1IsFalse], [key1IsFalse]);
            assertIsIncluded([key1IsFalse], [key1IsNotTrue]);
            assertIsIncluded([key2IsNotFalse], []);
            assertIsIncluded([key2IsNotFalse], [key2IsNotFalse]);
            assertIsIncluded([key2IsNotFalse], [key2IsTrue]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], [key2IsTrue]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], [key2IsNotFalse]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], [key1IsTrue]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], [key1IsNotFalse]);
            assertIsIncluded([key1IsTrue, key2IsNotFalse], []);
            assertIsNotIncluded([key1IsTrue], [key1IsFalse]);
            assertIsNotIncluded([key1IsTrue], [key1IsNotTrue]);
            assertIsNotIncluded([key1IsNotFalse], [key1IsFalse]);
            assertIsNotIncluded([key1IsNotFalse], [key1IsNotTrue]);
            assertIsNotIncluded([key1IsFalse], [key1IsTrue]);
            assertIsNotIncluded([key1IsFalse], [key1IsNotFalse]);
            assertIsNotIncluded([key1IsNotTrue], [key1IsTrue]);
            assertIsNotIncluded([key1IsNotTrue], [key1IsNotFalse]);
            assertIsNotIncluded([key1IsTrue, key2IsNotFalse], [key3IsTrue]);
            assertIsNotIncluded([key1IsTrue, key2IsNotFalse], [key4IsTrue]);
            assertIsNotIncluded([key1IsTrue], [key2IsTrue]);
            assertIsNotIncluded([], [key2IsTrue]);
            assertIsNotIncluded(null, [key2IsTrue]);
        });
        test('resolve command', function () {
            function _kbItem(keybinding, command, when) {
                return kbItem(keybinding, command, null, when, true);
            }
            var items = [
                // This one will never match because its "when" is always overwritten by another one
                _kbItem(54 /* KEY_X */, 'first', contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('key1', true), contextkey_1.ContextKeyExpr.notEquals('key2', false))),
                // This one always overwrites first
                _kbItem(54 /* KEY_X */, 'second', contextkey_1.ContextKeyExpr.equals('key2', true)),
                // This one is a secondary mapping for `second`
                _kbItem(56 /* KEY_Z */, 'second', null),
                // This one sometimes overwrites first
                _kbItem(54 /* KEY_X */, 'third', contextkey_1.ContextKeyExpr.equals('key3', true)),
                // This one is always overwritten by another one
                _kbItem(2048 /* CtrlCmd */ | 55 /* KEY_Y */, 'fourth', contextkey_1.ContextKeyExpr.equals('key4', true)),
                // This one overwrites with a chord the previous one
                _kbItem(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 55 /* KEY_Y */, 56 /* KEY_Z */), 'fifth', null),
                // This one has no keybinding
                _kbItem(0, 'sixth', null),
                _kbItem(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 51 /* KEY_U */), 'seventh', null),
                _kbItem(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 41 /* KEY_K */), 'seventh', null),
                _kbItem(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 51 /* KEY_U */), 'uncomment lines', null),
                _kbItem(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 33 /* KEY_C */), 'comment lines', null),
                _kbItem(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 37 /* KEY_G */, 2048 /* CtrlCmd */ | 33 /* KEY_C */), 'unreachablechord', null),
                _kbItem(2048 /* CtrlCmd */ | 37 /* KEY_G */, 'eleven', null)
            ];
            var resolver = new keybindingResolver_1.KeybindingResolver(items, []);
            var testKey = function (commandId, expectedKeys) {
                // Test lookup
                var lookupResult = resolver.lookupKeybindings(commandId);
                assert.equal(lookupResult.length, expectedKeys.length, 'Length mismatch @ commandId ' + commandId + '; GOT: ' + JSON.stringify(lookupResult, null, '\t'));
                for (var i = 0, len = lookupResult.length; i < len; i++) {
                    var expected = new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keyCodes_1.createKeybinding(expectedKeys[i], platform_1.OS), platform_1.OS);
                    assert.equal(lookupResult[i].resolvedKeybinding.getUserSettingsLabel(), expected.getUserSettingsLabel(), 'value mismatch @ commandId ' + commandId);
                }
            };
            var testResolve = function (ctx, _expectedKey, commandId) {
                var expectedKey = keyCodes_1.createKeybinding(_expectedKey, platform_1.OS);
                if (expectedKey.type === 2 /* Chord */) {
                    var firstPart = getDispatchStr(expectedKey.firstPart);
                    var chordPart = getDispatchStr(expectedKey.chordPart);
                    var result = resolver.resolve(ctx, null, firstPart);
                    assert.ok(result !== null, 'Enters chord for ' + commandId);
                    assert.equal(result.commandId, null, 'Enters chord for ' + commandId);
                    assert.equal(result.enterChord, true, 'Enters chord for ' + commandId);
                    result = resolver.resolve(ctx, firstPart, chordPart);
                    assert.ok(result !== null, 'Enters chord for ' + commandId);
                    assert.equal(result.commandId, commandId, 'Finds chorded command ' + commandId);
                    assert.equal(result.enterChord, false, 'Finds chorded command ' + commandId);
                }
                else {
                    var result = resolver.resolve(ctx, null, getDispatchStr(expectedKey));
                    assert.ok(result !== null, 'Finds command ' + commandId);
                    assert.equal(result.commandId, commandId, 'Finds command ' + commandId);
                    assert.equal(result.enterChord, false, 'Finds command ' + commandId);
                }
            };
            testKey('first', []);
            testKey('second', [56 /* KEY_Z */, 54 /* KEY_X */]);
            testResolve(createContext({ key2: true }), 54 /* KEY_X */, 'second');
            testResolve(createContext({}), 56 /* KEY_Z */, 'second');
            testKey('third', [54 /* KEY_X */]);
            testResolve(createContext({ key3: true }), 54 /* KEY_X */, 'third');
            testKey('fourth', []);
            testKey('fifth', [keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 55 /* KEY_Y */, 56 /* KEY_Z */)]);
            testResolve(createContext({}), keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 55 /* KEY_Y */, 56 /* KEY_Z */), 'fifth');
            testKey('seventh', [keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 41 /* KEY_K */)]);
            testResolve(createContext({}), keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 41 /* KEY_K */), 'seventh');
            testKey('uncomment lines', [keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 51 /* KEY_U */)]);
            testResolve(createContext({}), keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 51 /* KEY_U */), 'uncomment lines');
            testKey('comment lines', [keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 33 /* KEY_C */)]);
            testResolve(createContext({}), keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 33 /* KEY_C */), 'comment lines');
            testKey('unreachablechord', []);
            testKey('eleven', [2048 /* CtrlCmd */ | 37 /* KEY_G */]);
            testResolve(createContext({}), 2048 /* CtrlCmd */ | 37 /* KEY_G */, 'eleven');
            testKey('sixth', []);
        });
    });
});
