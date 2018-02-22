define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, assert, keyCodes_1, usLayoutResolvedKeybinding_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('KeybindingLabels', function () {
        function assertUSLabel(OS, keybinding, expected) {
            var usResolvedKeybinding = new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keyCodes_1.createKeybinding(keybinding, OS), OS);
            assert.equal(usResolvedKeybinding.getLabel(), expected);
        }
        test('Windows US label', function () {
            // no modifier
            assertUSLabel(1 /* Windows */, 31 /* KEY_A */, 'A');
            // one modifier
            assertUSLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 31 /* KEY_A */, 'Ctrl+A');
            assertUSLabel(1 /* Windows */, 1024 /* Shift */ | 31 /* KEY_A */, 'Shift+A');
            assertUSLabel(1 /* Windows */, 512 /* Alt */ | 31 /* KEY_A */, 'Alt+A');
            assertUSLabel(1 /* Windows */, 256 /* WinCtrl */ | 31 /* KEY_A */, 'Windows+A');
            // two modifiers
            assertUSLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KEY_A */, 'Ctrl+Shift+A');
            assertUSLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 31 /* KEY_A */, 'Ctrl+Alt+A');
            assertUSLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Windows+A');
            assertUSLabel(1 /* Windows */, 1024 /* Shift */ | 512 /* Alt */ | 31 /* KEY_A */, 'Shift+Alt+A');
            assertUSLabel(1 /* Windows */, 1024 /* Shift */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Shift+Windows+A');
            assertUSLabel(1 /* Windows */, 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Alt+Windows+A');
            // three modifiers
            assertUSLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 31 /* KEY_A */, 'Ctrl+Shift+Alt+A');
            assertUSLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Shift+Windows+A');
            assertUSLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Alt+Windows+A');
            assertUSLabel(1 /* Windows */, 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Shift+Alt+Windows+A');
            // four modifiers
            assertUSLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Shift+Alt+Windows+A');
            // chord
            assertUSLabel(1 /* Windows */, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 32 /* KEY_B */), 'Ctrl+A Ctrl+B');
        });
        test('Linux US label', function () {
            // no modifier
            assertUSLabel(3 /* Linux */, 31 /* KEY_A */, 'A');
            // one modifier
            assertUSLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 31 /* KEY_A */, 'Ctrl+A');
            assertUSLabel(3 /* Linux */, 1024 /* Shift */ | 31 /* KEY_A */, 'Shift+A');
            assertUSLabel(3 /* Linux */, 512 /* Alt */ | 31 /* KEY_A */, 'Alt+A');
            assertUSLabel(3 /* Linux */, 256 /* WinCtrl */ | 31 /* KEY_A */, 'Windows+A');
            // two modifiers
            assertUSLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KEY_A */, 'Ctrl+Shift+A');
            assertUSLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 31 /* KEY_A */, 'Ctrl+Alt+A');
            assertUSLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Windows+A');
            assertUSLabel(3 /* Linux */, 1024 /* Shift */ | 512 /* Alt */ | 31 /* KEY_A */, 'Shift+Alt+A');
            assertUSLabel(3 /* Linux */, 1024 /* Shift */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Shift+Windows+A');
            assertUSLabel(3 /* Linux */, 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Alt+Windows+A');
            // three modifiers
            assertUSLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 31 /* KEY_A */, 'Ctrl+Shift+Alt+A');
            assertUSLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Shift+Windows+A');
            assertUSLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Alt+Windows+A');
            assertUSLabel(3 /* Linux */, 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Shift+Alt+Windows+A');
            // four modifiers
            assertUSLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Shift+Alt+Windows+A');
            // chord
            assertUSLabel(3 /* Linux */, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 32 /* KEY_B */), 'Ctrl+A Ctrl+B');
        });
        test('Mac US label', function () {
            // no modifier
            assertUSLabel(2 /* Macintosh */, 31 /* KEY_A */, 'A');
            // one modifier
            assertUSLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 31 /* KEY_A */, '⌘A');
            assertUSLabel(2 /* Macintosh */, 1024 /* Shift */ | 31 /* KEY_A */, '⇧A');
            assertUSLabel(2 /* Macintosh */, 512 /* Alt */ | 31 /* KEY_A */, '⌥A');
            assertUSLabel(2 /* Macintosh */, 256 /* WinCtrl */ | 31 /* KEY_A */, '⌃A');
            // two modifiers
            assertUSLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KEY_A */, '⇧⌘A');
            assertUSLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 31 /* KEY_A */, '⌥⌘A');
            assertUSLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 31 /* KEY_A */, '⌃⌘A');
            assertUSLabel(2 /* Macintosh */, 1024 /* Shift */ | 512 /* Alt */ | 31 /* KEY_A */, '⇧⌥A');
            assertUSLabel(2 /* Macintosh */, 1024 /* Shift */ | 256 /* WinCtrl */ | 31 /* KEY_A */, '⌃⇧A');
            assertUSLabel(2 /* Macintosh */, 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, '⌃⌥A');
            // three modifiers
            assertUSLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 31 /* KEY_A */, '⇧⌥⌘A');
            assertUSLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 256 /* WinCtrl */ | 31 /* KEY_A */, '⌃⇧⌘A');
            assertUSLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, '⌃⌥⌘A');
            assertUSLabel(2 /* Macintosh */, 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, '⌃⇧⌥A');
            // four modifiers
            assertUSLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, '⌃⇧⌥⌘A');
            // chord
            assertUSLabel(2 /* Macintosh */, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 32 /* KEY_B */), '⌘A ⌘B');
            // special keys
            assertUSLabel(2 /* Macintosh */, 15 /* LeftArrow */, '←');
            assertUSLabel(2 /* Macintosh */, 16 /* UpArrow */, '↑');
            assertUSLabel(2 /* Macintosh */, 17 /* RightArrow */, '→');
            assertUSLabel(2 /* Macintosh */, 18 /* DownArrow */, '↓');
        });
        test('Aria label', function () {
            function assertAriaLabel(OS, keybinding, expected) {
                var usResolvedKeybinding = new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keyCodes_1.createKeybinding(keybinding, OS), OS);
                assert.equal(usResolvedKeybinding.getAriaLabel(), expected);
            }
            assertAriaLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Control+Shift+Alt+Windows+A');
            assertAriaLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Control+Shift+Alt+Windows+A');
            assertAriaLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Control+Shift+Alt+Command+A');
        });
        test('Electron Accelerator label', function () {
            function assertElectronAcceleratorLabel(OS, keybinding, expected) {
                var usResolvedKeybinding = new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keyCodes_1.createKeybinding(keybinding, OS), OS);
                assert.equal(usResolvedKeybinding.getElectronAccelerator(), expected);
            }
            assertElectronAcceleratorLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Shift+Alt+Super+A');
            assertElectronAcceleratorLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Shift+Alt+Super+A');
            assertElectronAcceleratorLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'Ctrl+Shift+Alt+Cmd+A');
            // electron cannot handle chords
            assertElectronAcceleratorLabel(1 /* Windows */, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 32 /* KEY_B */), null);
            assertElectronAcceleratorLabel(3 /* Linux */, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 32 /* KEY_B */), null);
            assertElectronAcceleratorLabel(2 /* Macintosh */, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 32 /* KEY_B */), null);
            // electron cannot handle numpad keys
            assertElectronAcceleratorLabel(1 /* Windows */, 94 /* NUMPAD_1 */, null);
            assertElectronAcceleratorLabel(3 /* Linux */, 94 /* NUMPAD_1 */, null);
            assertElectronAcceleratorLabel(2 /* Macintosh */, 94 /* NUMPAD_1 */, null);
            // special
            assertElectronAcceleratorLabel(2 /* Macintosh */, 15 /* LeftArrow */, 'Left');
            assertElectronAcceleratorLabel(2 /* Macintosh */, 16 /* UpArrow */, 'Up');
            assertElectronAcceleratorLabel(2 /* Macintosh */, 17 /* RightArrow */, 'Right');
            assertElectronAcceleratorLabel(2 /* Macintosh */, 18 /* DownArrow */, 'Down');
        });
        test('User Settings label', function () {
            function assertElectronAcceleratorLabel(OS, keybinding, expected) {
                var usResolvedKeybinding = new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keyCodes_1.createKeybinding(keybinding, OS), OS);
                assert.equal(usResolvedKeybinding.getUserSettingsLabel(), expected);
            }
            assertElectronAcceleratorLabel(1 /* Windows */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'ctrl+shift+alt+win+a');
            assertElectronAcceleratorLabel(3 /* Linux */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'ctrl+shift+alt+meta+a');
            assertElectronAcceleratorLabel(2 /* Macintosh */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 31 /* KEY_A */, 'ctrl+shift+alt+cmd+a');
            // electron cannot handle chords
            assertElectronAcceleratorLabel(1 /* Windows */, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 32 /* KEY_B */), 'ctrl+a ctrl+b');
            assertElectronAcceleratorLabel(3 /* Linux */, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 32 /* KEY_B */), 'ctrl+a ctrl+b');
            assertElectronAcceleratorLabel(2 /* Macintosh */, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 31 /* KEY_A */, 2048 /* CtrlCmd */ | 32 /* KEY_B */), 'cmd+a cmd+b');
        });
    });
});
