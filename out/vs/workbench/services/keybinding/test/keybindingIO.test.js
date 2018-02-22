define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/workbench/services/keybinding/common/keybindingIO", "vs/base/common/platform", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/workbench/services/keybinding/common/scanCode"], function (require, exports, assert, keyCodes_1, keybindingIO_1, platform_1, usLayoutResolvedKeybinding_1, scanCode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('keybindingIO', function () {
        test('serialize/deserialize', function () {
            function testOneSerialization(keybinding, expected, msg, OS) {
                var usLayoutResolvedKeybinding = new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keyCodes_1.createKeybinding(keybinding, OS), OS);
                var actualSerialized = usLayoutResolvedKeybinding.getUserSettingsLabel();
                assert.equal(actualSerialized, expected, expected + ' - ' + msg);
            }
            function testSerialization(keybinding, expectedWin, expectedMac, expectedLinux) {
                testOneSerialization(keybinding, expectedWin, 'win', 1 /* Windows */);
                testOneSerialization(keybinding, expectedMac, 'mac', 2 /* Macintosh */);
                testOneSerialization(keybinding, expectedLinux, 'linux', 3 /* Linux */);
            }
            function testOneDeserialization(keybinding, _expected, msg, OS) {
                var actualDeserialized = keybindingIO_1.KeybindingIO.readKeybinding(keybinding, OS);
                var expected = keyCodes_1.createKeybinding(_expected, OS);
                assert.deepEqual(actualDeserialized, expected, keybinding + ' - ' + msg);
            }
            function testDeserialization(inWin, inMac, inLinux, expected) {
                testOneDeserialization(inWin, expected, 'win', 1 /* Windows */);
                testOneDeserialization(inMac, expected, 'mac', 2 /* Macintosh */);
                testOneDeserialization(inLinux, expected, 'linux', 3 /* Linux */);
            }
            function testRoundtrip(keybinding, expectedWin, expectedMac, expectedLinux) {
                testSerialization(keybinding, expectedWin, expectedMac, expectedLinux);
                testDeserialization(expectedWin, expectedMac, expectedLinux, keybinding);
            }
            testRoundtrip(21 /* KEY_0 */, '0', '0', '0');
            testRoundtrip(31 /* KEY_A */, 'a', 'a', 'a');
            testRoundtrip(16 /* UpArrow */, 'up', 'up', 'up');
            testRoundtrip(17 /* RightArrow */, 'right', 'right', 'right');
            testRoundtrip(18 /* DownArrow */, 'down', 'down', 'down');
            testRoundtrip(15 /* LeftArrow */, 'left', 'left', 'left');
            // one modifier
            testRoundtrip(512 /* Alt */ | 31 /* KEY_A */, 'alt+a', 'alt+a', 'alt+a');
            testRoundtrip(2048 /* CtrlCmd */ | 31 /* KEY_A */, 'ctrl+a', 'cmd+a', 'ctrl+a');
            testRoundtrip(1024 /* Shift */ | 31 /* KEY_A */, 'shift+a', 'shift+a', 'shift+a');
            testRoundtrip(256 /* WinCtrl */ | 31 /* KEY_A */, 'win+a', 'ctrl+a', 'meta+a');
            // two modifiers
            testRoundtrip(2048 /* CtrlCmd */ | 512 /* Alt */ | 31 /* KEY_A */, 'ctrl+alt+a', 'alt+cmd+a', 'ctrl+alt+a');
            testRoundtrip(2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KEY_A */, 'ctrl+shift+a', 'shift+cmd+a', 'ctrl+shift+a');
            testRoundtrip(2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'ctrl+win+a', 'ctrl+cmd+a', 'ctrl+meta+a');
            testRoundtrip(1024 /* Shift */ | 512 /* Alt */ | 31 /* KEY_A */, 'shift+alt+a', 'shift+alt+a', 'shift+alt+a');
            testRoundtrip(1024 /* Shift */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'shift+win+a', 'ctrl+shift+a', 'shift+meta+a');
            testRoundtrip(512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'alt+win+a', 'ctrl+alt+a', 'alt+meta+a');
            // three modifiers
            testRoundtrip(2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 31 /* KEY_A */, 'ctrl+shift+alt+a', 'shift+alt+cmd+a', 'ctrl+shift+alt+a');
            testRoundtrip(2048 /* CtrlCmd */ | 1024 /* Shift */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'ctrl+shift+win+a', 'ctrl+shift+cmd+a', 'ctrl+shift+meta+a');
            testRoundtrip(1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'shift+alt+win+a', 'ctrl+shift+alt+a', 'shift+alt+meta+a');
            // all modifiers
            testRoundtrip(2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'ctrl+shift+alt+win+a', 'ctrl+shift+alt+cmd+a', 'ctrl+shift+alt+meta+a');
            // chords
            testRoundtrip(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 31 /* KEY_A */), 'ctrl+a ctrl+a', 'cmd+a cmd+a', 'ctrl+a ctrl+a');
            testRoundtrip(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 16 /* UpArrow */, 2048 /* CtrlCmd */ | 16 /* UpArrow */), 'ctrl+up ctrl+up', 'cmd+up cmd+up', 'ctrl+up ctrl+up');
            // OEM keys
            testRoundtrip(80 /* US_SEMICOLON */, ';', ';', ';');
            testRoundtrip(81 /* US_EQUAL */, '=', '=', '=');
            testRoundtrip(82 /* US_COMMA */, ',', ',', ',');
            testRoundtrip(83 /* US_MINUS */, '-', '-', '-');
            testRoundtrip(84 /* US_DOT */, '.', '.', '.');
            testRoundtrip(85 /* US_SLASH */, '/', '/', '/');
            testRoundtrip(86 /* US_BACKTICK */, '`', '`', '`');
            testRoundtrip(110 /* ABNT_C1 */, 'abnt_c1', 'abnt_c1', 'abnt_c1');
            testRoundtrip(111 /* ABNT_C2 */, 'abnt_c2', 'abnt_c2', 'abnt_c2');
            testRoundtrip(87 /* US_OPEN_SQUARE_BRACKET */, '[', '[', '[');
            testRoundtrip(88 /* US_BACKSLASH */, '\\', '\\', '\\');
            testRoundtrip(89 /* US_CLOSE_SQUARE_BRACKET */, ']', ']', ']');
            testRoundtrip(90 /* US_QUOTE */, '\'', '\'', '\'');
            testRoundtrip(91 /* OEM_8 */, 'oem_8', 'oem_8', 'oem_8');
            testRoundtrip(92 /* OEM_102 */, 'oem_102', 'oem_102', 'oem_102');
            // OEM aliases
            testDeserialization('OEM_1', 'OEM_1', 'OEM_1', 80 /* US_SEMICOLON */);
            testDeserialization('OEM_PLUS', 'OEM_PLUS', 'OEM_PLUS', 81 /* US_EQUAL */);
            testDeserialization('OEM_COMMA', 'OEM_COMMA', 'OEM_COMMA', 82 /* US_COMMA */);
            testDeserialization('OEM_MINUS', 'OEM_MINUS', 'OEM_MINUS', 83 /* US_MINUS */);
            testDeserialization('OEM_PERIOD', 'OEM_PERIOD', 'OEM_PERIOD', 84 /* US_DOT */);
            testDeserialization('OEM_2', 'OEM_2', 'OEM_2', 85 /* US_SLASH */);
            testDeserialization('OEM_3', 'OEM_3', 'OEM_3', 86 /* US_BACKTICK */);
            testDeserialization('ABNT_C1', 'ABNT_C1', 'ABNT_C1', 110 /* ABNT_C1 */);
            testDeserialization('ABNT_C2', 'ABNT_C2', 'ABNT_C2', 111 /* ABNT_C2 */);
            testDeserialization('OEM_4', 'OEM_4', 'OEM_4', 87 /* US_OPEN_SQUARE_BRACKET */);
            testDeserialization('OEM_5', 'OEM_5', 'OEM_5', 88 /* US_BACKSLASH */);
            testDeserialization('OEM_6', 'OEM_6', 'OEM_6', 89 /* US_CLOSE_SQUARE_BRACKET */);
            testDeserialization('OEM_7', 'OEM_7', 'OEM_7', 90 /* US_QUOTE */);
            testDeserialization('OEM_8', 'OEM_8', 'OEM_8', 91 /* OEM_8 */);
            testDeserialization('OEM_102', 'OEM_102', 'OEM_102', 92 /* OEM_102 */);
            // accepts '-' as separator
            testDeserialization('ctrl-shift-alt-win-a', 'ctrl-shift-alt-cmd-a', 'ctrl-shift-alt-meta-a', 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */);
            // various input mistakes
            testDeserialization(' ctrl-shift-alt-win-A ', ' shift-alt-cmd-Ctrl-A ', ' ctrl-shift-alt-META-A ', 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */);
        });
        test('deserialize scan codes', function () {
            assert.deepEqual(keybindingIO_1.KeybindingIO._readUserBinding('ctrl+shift+[comma] ctrl+/'), [new scanCode_1.ScanCodeBinding(true, true, false, false, 60 /* Comma */), new keyCodes_1.SimpleKeybinding(true, false, false, false, 85 /* US_SLASH */)]);
        });
        test('issue #10452 - invalid command', function () {
            var strJSON = "[{ \"key\": \"ctrl+k ctrl+f\", \"command\": [\"firstcommand\", \"seccondcommand\"] }]";
            var userKeybinding = JSON.parse(strJSON)[0];
            var keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding, platform_1.OS);
            assert.equal(keybindingItem.command, null);
        });
        test('issue #10452 - invalid when', function () {
            var strJSON = "[{ \"key\": \"ctrl+k ctrl+f\", \"command\": \"firstcommand\", \"when\": [] }]";
            var userKeybinding = JSON.parse(strJSON)[0];
            var keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding, platform_1.OS);
            assert.equal(keybindingItem.when, null);
        });
        test('issue #10452 - invalid key', function () {
            var strJSON = "[{ \"key\": [], \"command\": \"firstcommand\" }]";
            var userKeybinding = JSON.parse(strJSON)[0];
            var keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding, platform_1.OS);
            assert.equal(keybindingItem.firstPart, null);
            assert.equal(keybindingItem.chordPart, null);
        });
        test('issue #10452 - invalid key 2', function () {
            var strJSON = "[{ \"key\": \"\", \"command\": \"firstcommand\" }]";
            var userKeybinding = JSON.parse(strJSON)[0];
            var keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding, platform_1.OS);
            assert.equal(keybindingItem.firstPart, null);
            assert.equal(keybindingItem.chordPart, null);
        });
        test('test commands args', function () {
            var strJSON = "[{ \"key\": \"ctrl+k ctrl+f\", \"command\": \"firstcommand\", \"when\": [], \"args\": { \"text\": \"theText\" } }]";
            var userKeybinding = JSON.parse(strJSON)[0];
            var keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding, platform_1.OS);
            assert.equal(keybindingItem.commandArgs.text, 'theText');
        });
    });
});
