/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/workbench/services/keybinding/common/macLinuxKeyboardMapper", "vs/base/common/keybindingLabels", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/workbench/services/keybinding/common/scanCode", "vs/workbench/services/keybinding/test/keyboardMapperTestUtils"], function (require, exports, assert, keyCodes_1, macLinuxKeyboardMapper_1, keybindingLabels_1, usLayoutResolvedKeybinding_1, scanCode_1, keyboardMapperTestUtils_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WRITE_FILE_IF_DIFFERENT = false;
    function createKeyboardMapper(isUSStandard, file, OS) {
        return keyboardMapperTestUtils_1.readRawMapping(file).then(function (rawMappings) {
            return new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(isUSStandard, rawMappings, OS);
        });
    }
    suite('keyboardMapper - MAC de_ch', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(false, 'mac_de_ch', 2 /* Macintosh */).then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_de_ch.txt', done);
        });
        function assertKeybindingTranslation(kb, expected) {
            _assertKeybindingTranslation(mapper, 2 /* Macintosh */, kb, expected);
        }
        function _assertResolveKeybinding(k, expected) {
            keyboardMapperTestUtils_1.assertResolveKeybinding(mapper, keyCodes_1.createKeybinding(k, 2 /* Macintosh */), expected);
        }
        test('kb => hw', function () {
            // unchanged
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 22 /* KEY_1 */, 'cmd+Digit1');
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 32 /* KEY_B */, 'cmd+KeyB');
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 1024 /* Shift */ | 32 /* KEY_B */, 'shift+cmd+KeyB');
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 32 /* KEY_B */, 'ctrl+shift+alt+cmd+KeyB');
            // flips Y and Z
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 56 /* KEY_Z */, 'cmd+KeyY');
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 55 /* KEY_Y */, 'cmd+KeyZ');
            // Ctrl+/
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 85 /* US_SLASH */, 'shift+cmd+Digit7');
        });
        test('resolveKeybinding Cmd+A', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 31 /* KEY_A */, [{
                    label: '⌘A',
                    ariaLabel: 'Command+A',
                    electronAccelerator: 'Cmd+A',
                    userSettingsLabel: 'cmd+a',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['meta+[KeyA]', null],
                }]);
        });
        test('resolveKeybinding Cmd+B', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 32 /* KEY_B */, [{
                    label: '⌘B',
                    ariaLabel: 'Command+B',
                    electronAccelerator: 'Cmd+B',
                    userSettingsLabel: 'cmd+b',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['meta+[KeyB]', null],
                }]);
        });
        test('resolveKeybinding Cmd+Z', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 56 /* KEY_Z */, [{
                    label: '⌘Z',
                    ariaLabel: 'Command+Z',
                    electronAccelerator: 'Cmd+Z',
                    userSettingsLabel: 'cmd+z',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['meta+[KeyY]', null],
                }]);
        });
        test('resolveKeyboardEvent Cmd+[KeyY]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: -1,
                code: 'KeyY'
            }, {
                label: '⌘Z',
                ariaLabel: 'Command+Z',
                electronAccelerator: 'Cmd+Z',
                userSettingsLabel: 'cmd+z',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['meta+[KeyY]', null],
            });
        });
        test('resolveKeybinding Cmd+]', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 89 /* US_CLOSE_SQUARE_BRACKET */, [{
                    label: '⌃⌥⌘6',
                    ariaLabel: 'Control+Alt+Command+6',
                    electronAccelerator: 'Ctrl+Alt+Cmd+6',
                    userSettingsLabel: 'ctrl+alt+cmd+6',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+alt+meta+[Digit6]', null],
                }]);
        });
        test('resolveKeyboardEvent Cmd+[BracketRight]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: -1,
                code: 'BracketRight'
            }, {
                label: '⌘¨',
                ariaLabel: 'Command+¨',
                electronAccelerator: null,
                userSettingsLabel: 'cmd+[BracketRight]',
                isWYSIWYG: false,
                isChord: false,
                dispatchParts: ['meta+[BracketRight]', null],
            });
        });
        test('resolveKeybinding Shift+]', function () {
            _assertResolveKeybinding(1024 /* Shift */ | 89 /* US_CLOSE_SQUARE_BRACKET */, [{
                    label: '⌃⌥9',
                    ariaLabel: 'Control+Alt+9',
                    electronAccelerator: 'Ctrl+Alt+9',
                    userSettingsLabel: 'ctrl+alt+9',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+alt+[Digit9]', null],
                }]);
        });
        test('resolveKeybinding Cmd+/', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 85 /* US_SLASH */, [{
                    label: '⇧⌘7',
                    ariaLabel: 'Shift+Command+7',
                    electronAccelerator: 'Shift+Cmd+7',
                    userSettingsLabel: 'shift+cmd+7',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['shift+meta+[Digit7]', null],
                }]);
        });
        test('resolveKeybinding Cmd+Shift+/', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 1024 /* Shift */ | 85 /* US_SLASH */, [{
                    label: '⇧⌘\'',
                    ariaLabel: 'Shift+Command+\'',
                    electronAccelerator: null,
                    userSettingsLabel: 'shift+cmd+[Minus]',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['shift+meta+[Minus]', null],
                }]);
        });
        test('resolveKeybinding Cmd+K Cmd+\\', function () {
            _assertResolveKeybinding(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */), [{
                    label: '⌘K ⌃⇧⌥⌘7',
                    ariaLabel: 'Command+K Control+Shift+Alt+Command+7',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+k ctrl+shift+alt+cmd+7',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['meta+[KeyK]', 'ctrl+shift+alt+meta+[Digit7]'],
                }]);
        });
        test('resolveKeybinding Cmd+K Cmd+=', function () {
            _assertResolveKeybinding(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 81 /* US_EQUAL */), [{
                    label: '⌘K ⇧⌘0',
                    ariaLabel: 'Command+K Shift+Command+0',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+k shift+cmd+0',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['meta+[KeyK]', 'shift+meta+[Digit0]'],
                }]);
        });
        test('resolveKeybinding Cmd+DownArrow', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 18 /* DownArrow */, [{
                    label: '⌘↓',
                    ariaLabel: 'Command+DownArrow',
                    electronAccelerator: 'Cmd+Down',
                    userSettingsLabel: 'cmd+down',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['meta+[ArrowDown]', null],
                }]);
        });
        test('resolveKeybinding Cmd+NUMPAD_0', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 93 /* NUMPAD_0 */, [{
                    label: '⌘NumPad0',
                    ariaLabel: 'Command+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+numpad0',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['meta+[Numpad0]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 14 /* Home */, [{
                    label: '⌘Home',
                    ariaLabel: 'Command+Home',
                    electronAccelerator: 'Cmd+Home',
                    userSettingsLabel: 'cmd+home',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['meta+[Home]', null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[Home]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: -1,
                code: 'Home'
            }, {
                label: '⌘Home',
                ariaLabel: 'Command+Home',
                electronAccelerator: 'Cmd+Home',
                userSettingsLabel: 'cmd+home',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['meta+[Home]', null],
            });
        });
        test('resolveUserBinding Cmd+[Comma] Cmd+/', function () {
            keyboardMapperTestUtils_1.assertResolveUserBinding(mapper, new scanCode_1.ScanCodeBinding(false, false, false, true, 60 /* Comma */), new keyCodes_1.SimpleKeybinding(false, false, false, true, 85 /* US_SLASH */), [{
                    label: '⌘, ⇧⌘7',
                    ariaLabel: 'Command+, Shift+Command+7',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+[Comma] shift+cmd+7',
                    isWYSIWYG: false,
                    isChord: true,
                    dispatchParts: ['meta+[Comma]', 'shift+meta+[Digit7]'],
                }]);
        });
        test('resolveKeyboardEvent Modifier only MetaLeft+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: -1,
                code: 'MetaLeft'
            }, {
                label: '⌘',
                ariaLabel: 'Command+',
                electronAccelerator: null,
                userSettingsLabel: 'cmd+',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null, null],
            });
        });
        test('resolveKeyboardEvent Modifier only MetaRight+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: -1,
                code: 'MetaRight'
            }, {
                label: '⌘',
                ariaLabel: 'Command+',
                electronAccelerator: null,
                userSettingsLabel: 'cmd+',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null, null],
            });
        });
    });
    suite('keyboardMapper - MAC en_us', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(true, 'mac_en_us', 2 /* Macintosh */).then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_en_us.txt', done);
        });
        test('resolveUserBinding Cmd+[Comma] Cmd+/', function () {
            keyboardMapperTestUtils_1.assertResolveUserBinding(mapper, new scanCode_1.ScanCodeBinding(false, false, false, true, 60 /* Comma */), new keyCodes_1.SimpleKeybinding(false, false, false, true, 85 /* US_SLASH */), [{
                    label: '⌘, ⌘/',
                    ariaLabel: 'Command+, Command+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+, cmd+/',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['meta+[Comma]', 'meta+[Slash]'],
                }]);
        });
        test('resolveKeyboardEvent Modifier only MetaLeft+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: -1,
                code: 'MetaLeft'
            }, {
                label: '⌘',
                ariaLabel: 'Command+',
                electronAccelerator: null,
                userSettingsLabel: 'cmd+',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null, null],
            });
        });
        test('resolveKeyboardEvent Modifier only MetaRight+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: -1,
                code: 'MetaRight'
            }, {
                label: '⌘',
                ariaLabel: 'Command+',
                electronAccelerator: null,
                userSettingsLabel: 'cmd+',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null, null],
            });
        });
    });
    suite('keyboardMapper - LINUX de_ch', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(false, 'linux_de_ch', 3 /* Linux */).then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_de_ch.txt', done);
        });
        function assertKeybindingTranslation(kb, expected) {
            _assertKeybindingTranslation(mapper, 3 /* Linux */, kb, expected);
        }
        function _assertResolveKeybinding(k, expected) {
            keyboardMapperTestUtils_1.assertResolveKeybinding(mapper, keyCodes_1.createKeybinding(k, 3 /* Linux */), expected);
        }
        test('kb => hw', function () {
            // unchanged
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 22 /* KEY_1 */, 'ctrl+Digit1');
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 32 /* KEY_B */, 'ctrl+KeyB');
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 1024 /* Shift */ | 32 /* KEY_B */, 'ctrl+shift+KeyB');
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 32 /* KEY_B */, 'ctrl+shift+alt+meta+KeyB');
            // flips Y and Z
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 56 /* KEY_Z */, 'ctrl+KeyY');
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 55 /* KEY_Y */, 'ctrl+KeyZ');
            // Ctrl+/
            assertKeybindingTranslation(2048 /* CtrlCmd */ | 85 /* US_SLASH */, 'ctrl+shift+Digit7');
        });
        test('resolveKeybinding Ctrl+A', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 31 /* KEY_A */, [{
                    label: 'Ctrl+A',
                    ariaLabel: 'Control+A',
                    electronAccelerator: 'Ctrl+A',
                    userSettingsLabel: 'ctrl+a',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[KeyA]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Z', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 56 /* KEY_Z */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[KeyY]', null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[KeyY]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'KeyY'
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+[KeyY]', null],
            });
        });
        test('resolveKeybinding Ctrl+]', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 89 /* US_CLOSE_SQUARE_BRACKET */, []);
        });
        test('resolveKeyboardEvent Ctrl+[BracketRight]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'BracketRight'
            }, {
                label: 'Ctrl+¨',
                ariaLabel: 'Control+¨',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+[BracketRight]',
                isWYSIWYG: false,
                isChord: false,
                dispatchParts: ['ctrl+[BracketRight]', null],
            });
        });
        test('resolveKeybinding Shift+]', function () {
            _assertResolveKeybinding(1024 /* Shift */ | 89 /* US_CLOSE_SQUARE_BRACKET */, [{
                    label: 'Ctrl+Alt+0',
                    ariaLabel: 'Control+Alt+0',
                    electronAccelerator: 'Ctrl+Alt+0',
                    userSettingsLabel: 'ctrl+alt+0',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+alt+[Digit0]', null],
                }, {
                    label: 'Ctrl+Alt+$',
                    ariaLabel: 'Control+Alt+$',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+alt+[Backslash]',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['ctrl+alt+[Backslash]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+/', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 85 /* US_SLASH */, [{
                    label: 'Ctrl+Shift+7',
                    ariaLabel: 'Control+Shift+7',
                    electronAccelerator: 'Ctrl+Shift+7',
                    userSettingsLabel: 'ctrl+shift+7',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+shift+[Digit7]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Shift+/', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 1024 /* Shift */ | 85 /* US_SLASH */, [{
                    label: 'Ctrl+Shift+\'',
                    ariaLabel: 'Control+Shift+\'',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+shift+[Minus]',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['ctrl+shift+[Minus]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', function () {
            _assertResolveKeybinding(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */), []);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', function () {
            _assertResolveKeybinding(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 81 /* US_EQUAL */), [{
                    label: 'Ctrl+K Ctrl+Shift+0',
                    ariaLabel: 'Control+K Control+Shift+0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+shift+0',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+[KeyK]', 'ctrl+shift+[Digit0]'],
                }]);
        });
        test('resolveKeybinding Ctrl+DownArrow', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 18 /* DownArrow */, [{
                    label: 'Ctrl+DownArrow',
                    ariaLabel: 'Control+DownArrow',
                    electronAccelerator: 'Ctrl+Down',
                    userSettingsLabel: 'ctrl+down',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[ArrowDown]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+NUMPAD_0', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 93 /* NUMPAD_0 */, [{
                    label: 'Ctrl+NumPad0',
                    ariaLabel: 'Control+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+numpad0',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[Numpad0]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 14 /* Home */, [{
                    label: 'Ctrl+Home',
                    ariaLabel: 'Control+Home',
                    electronAccelerator: 'Ctrl+Home',
                    userSettingsLabel: 'ctrl+home',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[Home]', null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[Home]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'Home'
            }, {
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+[Home]', null],
            });
        });
        test('resolveKeyboardEvent Ctrl+[KeyX]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'KeyX'
            }, {
                label: 'Ctrl+X',
                ariaLabel: 'Control+X',
                electronAccelerator: 'Ctrl+X',
                userSettingsLabel: 'ctrl+x',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+[KeyX]', null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', function () {
            keyboardMapperTestUtils_1.assertResolveUserBinding(mapper, new scanCode_1.ScanCodeBinding(true, false, false, false, 60 /* Comma */), new keyCodes_1.SimpleKeybinding(true, false, false, false, 85 /* US_SLASH */), [{
                    label: 'Ctrl+, Ctrl+Shift+7',
                    ariaLabel: 'Control+, Control+Shift+7',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+[Comma] ctrl+shift+7',
                    isWYSIWYG: false,
                    isChord: true,
                    dispatchParts: ['ctrl+[Comma]', 'ctrl+shift+[Digit7]'],
                }]);
        });
        test('resolveKeyboardEvent Modifier only ControlLeft+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'ControlLeft'
            }, {
                label: 'Ctrl+',
                ariaLabel: 'Control+',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null, null],
            });
        });
        test('resolveKeyboardEvent Modifier only ControlRight+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'ControlRight'
            }, {
                label: 'Ctrl+',
                ariaLabel: 'Control+',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null, null],
            });
        });
    });
    suite('keyboardMapper - LINUX en_us', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(true, 'linux_en_us', 3 /* Linux */).then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_en_us.txt', done);
        });
        function _assertResolveKeybinding(k, expected) {
            keyboardMapperTestUtils_1.assertResolveKeybinding(mapper, keyCodes_1.createKeybinding(k, 3 /* Linux */), expected);
        }
        test('resolveKeybinding Ctrl+A', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 31 /* KEY_A */, [{
                    label: 'Ctrl+A',
                    ariaLabel: 'Control+A',
                    electronAccelerator: 'Ctrl+A',
                    userSettingsLabel: 'ctrl+a',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[KeyA]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Z', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 56 /* KEY_Z */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[KeyZ]', null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[KeyZ]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'KeyZ'
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+[KeyZ]', null],
            });
        });
        test('resolveKeybinding Ctrl+]', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 89 /* US_CLOSE_SQUARE_BRACKET */, [{
                    label: 'Ctrl+]',
                    ariaLabel: 'Control+]',
                    electronAccelerator: 'Ctrl+]',
                    userSettingsLabel: 'ctrl+]',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[BracketRight]', null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[BracketRight]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'BracketRight'
            }, {
                label: 'Ctrl+]',
                ariaLabel: 'Control+]',
                electronAccelerator: 'Ctrl+]',
                userSettingsLabel: 'ctrl+]',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+[BracketRight]', null],
            });
        });
        test('resolveKeybinding Shift+]', function () {
            _assertResolveKeybinding(1024 /* Shift */ | 89 /* US_CLOSE_SQUARE_BRACKET */, [{
                    label: 'Shift+]',
                    ariaLabel: 'Shift+]',
                    electronAccelerator: 'Shift+]',
                    userSettingsLabel: 'shift+]',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['shift+[BracketRight]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+/', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 85 /* US_SLASH */, [{
                    label: 'Ctrl+/',
                    ariaLabel: 'Control+/',
                    electronAccelerator: 'Ctrl+/',
                    userSettingsLabel: 'ctrl+/',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[Slash]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Shift+/', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 1024 /* Shift */ | 85 /* US_SLASH */, [{
                    label: 'Ctrl+Shift+/',
                    ariaLabel: 'Control+Shift+/',
                    electronAccelerator: 'Ctrl+Shift+/',
                    userSettingsLabel: 'ctrl+shift+/',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+shift+[Slash]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', function () {
            _assertResolveKeybinding(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */), [{
                    label: 'Ctrl+K Ctrl+\\',
                    ariaLabel: 'Control+K Control+\\',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+\\',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+[KeyK]', 'ctrl+[Backslash]'],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', function () {
            _assertResolveKeybinding(keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 81 /* US_EQUAL */), [{
                    label: 'Ctrl+K Ctrl+=',
                    ariaLabel: 'Control+K Control+=',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+=',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+[KeyK]', 'ctrl+[Equal]'],
                }]);
        });
        test('resolveKeybinding Ctrl+DownArrow', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 18 /* DownArrow */, [{
                    label: 'Ctrl+DownArrow',
                    ariaLabel: 'Control+DownArrow',
                    electronAccelerator: 'Ctrl+Down',
                    userSettingsLabel: 'ctrl+down',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[ArrowDown]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+NUMPAD_0', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 93 /* NUMPAD_0 */, [{
                    label: 'Ctrl+NumPad0',
                    ariaLabel: 'Control+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+numpad0',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[Numpad0]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 14 /* Home */, [{
                    label: 'Ctrl+Home',
                    ariaLabel: 'Control+Home',
                    electronAccelerator: 'Ctrl+Home',
                    userSettingsLabel: 'ctrl+home',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[Home]', null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[Home]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'Home'
            }, {
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+[Home]', null],
            });
        });
        test('resolveKeybinding Ctrl+Shift+,', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 1024 /* Shift */ | 82 /* US_COMMA */, [{
                    label: 'Ctrl+Shift+,',
                    ariaLabel: 'Control+Shift+,',
                    electronAccelerator: 'Ctrl+Shift+,',
                    userSettingsLabel: 'ctrl+shift+,',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+shift+[Comma]', null],
                }, {
                    label: 'Ctrl+<',
                    ariaLabel: 'Control+<',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+[IntlBackslash]',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['ctrl+[IntlBackslash]', null],
                }]);
        });
        test('issue #23393: resolveKeybinding Ctrl+Enter', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 3 /* Enter */, [{
                    label: 'Ctrl+Enter',
                    ariaLabel: 'Control+Enter',
                    electronAccelerator: 'Ctrl+Enter',
                    userSettingsLabel: 'ctrl+enter',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[Enter]', null],
                }]);
        });
        test('issue #23393: resolveKeyboardEvent Ctrl+[NumpadEnter]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'NumpadEnter'
            }, {
                label: 'Ctrl+Enter',
                ariaLabel: 'Control+Enter',
                electronAccelerator: 'Ctrl+Enter',
                userSettingsLabel: 'ctrl+enter',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+[Enter]', null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', function () {
            keyboardMapperTestUtils_1.assertResolveUserBinding(mapper, new scanCode_1.ScanCodeBinding(true, false, false, false, 60 /* Comma */), new keyCodes_1.SimpleKeybinding(true, false, false, false, 85 /* US_SLASH */), [{
                    label: 'Ctrl+, Ctrl+/',
                    ariaLabel: 'Control+, Control+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+, ctrl+/',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+[Comma]', 'ctrl+[Slash]'],
                }]);
        });
        test('resolveUserBinding Ctrl+[Comma]', function () {
            keyboardMapperTestUtils_1.assertResolveUserBinding(mapper, new scanCode_1.ScanCodeBinding(true, false, false, false, 60 /* Comma */), null, [{
                    label: 'Ctrl+,',
                    ariaLabel: 'Control+,',
                    electronAccelerator: 'Ctrl+,',
                    userSettingsLabel: 'ctrl+,',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[Comma]', null],
                }]);
        });
        test('resolveKeyboardEvent Modifier only ControlLeft+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'ControlLeft'
            }, {
                label: 'Ctrl+',
                ariaLabel: 'Control+',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null, null],
            });
        });
        test('resolveKeyboardEvent Modifier only ControlRight+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'ControlRight'
            }, {
                label: 'Ctrl+',
                ariaLabel: 'Control+',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null, null],
            });
        });
    });
    suite('keyboardMapper', function () {
        test('issue #23706: Linux UK layout: Ctrl + Apostrophe also toggles terminal', function () {
            var mapper = new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(false, {
                'Backquote': {
                    'value': '`',
                    'withShift': '¬',
                    'withAltGr': '|',
                    'withShiftAltGr': '|'
                }
            }, 3 /* Linux */);
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: -1,
                code: 'Backquote'
            }, {
                label: 'Ctrl+`',
                ariaLabel: 'Control+`',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+`',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+[Backquote]', null],
            });
        });
        test('issue #24064: NumLock/NumPad keys stopped working in 1.11 on Linux', function () {
            var mapper = new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(false, {}, 3 /* Linux */);
            function assertNumpadKeyboardEvent(keyCode, code, label, electronAccelerator, userSettingsLabel, dispatch) {
                keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false,
                    metaKey: false,
                    keyCode: keyCode,
                    code: code
                }, {
                    label: label,
                    ariaLabel: label,
                    electronAccelerator: electronAccelerator,
                    userSettingsLabel: userSettingsLabel,
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: [dispatch, null],
                });
            }
            assertNumpadKeyboardEvent(13 /* End */, 'Numpad1', 'End', 'End', 'end', '[End]');
            assertNumpadKeyboardEvent(18 /* DownArrow */, 'Numpad2', 'DownArrow', 'Down', 'down', '[ArrowDown]');
            assertNumpadKeyboardEvent(12 /* PageDown */, 'Numpad3', 'PageDown', 'PageDown', 'pagedown', '[PageDown]');
            assertNumpadKeyboardEvent(15 /* LeftArrow */, 'Numpad4', 'LeftArrow', 'Left', 'left', '[ArrowLeft]');
            assertNumpadKeyboardEvent(0 /* Unknown */, 'Numpad5', 'NumPad5', null, 'numpad5', '[Numpad5]');
            assertNumpadKeyboardEvent(17 /* RightArrow */, 'Numpad6', 'RightArrow', 'Right', 'right', '[ArrowRight]');
            assertNumpadKeyboardEvent(14 /* Home */, 'Numpad7', 'Home', 'Home', 'home', '[Home]');
            assertNumpadKeyboardEvent(16 /* UpArrow */, 'Numpad8', 'UpArrow', 'Up', 'up', '[ArrowUp]');
            assertNumpadKeyboardEvent(11 /* PageUp */, 'Numpad9', 'PageUp', 'PageUp', 'pageup', '[PageUp]');
            assertNumpadKeyboardEvent(19 /* Insert */, 'Numpad0', 'Insert', 'Insert', 'insert', '[Insert]');
            assertNumpadKeyboardEvent(20 /* Delete */, 'NumpadDecimal', 'Delete', 'Delete', 'delete', '[Delete]');
        });
        test('issue #24107: Delete, Insert, Home, End, PgUp, PgDn, and arrow keys no longer work editor in 1.11', function () {
            var mapper = new macLinuxKeyboardMapper_1.MacLinuxKeyboardMapper(false, {}, 3 /* Linux */);
            function assertKeyboardEvent(keyCode, code, label, electronAccelerator, userSettingsLabel, dispatch) {
                keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false,
                    metaKey: false,
                    keyCode: keyCode,
                    code: code
                }, {
                    label: label,
                    ariaLabel: label,
                    electronAccelerator: electronAccelerator,
                    userSettingsLabel: userSettingsLabel,
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: [dispatch, null],
                });
            }
            // https://github.com/Microsoft/vscode/issues/24107#issuecomment-292318497
            assertKeyboardEvent(16 /* UpArrow */, 'Lang3', 'UpArrow', 'Up', 'up', '[ArrowUp]');
            assertKeyboardEvent(18 /* DownArrow */, 'NumpadEnter', 'DownArrow', 'Down', 'down', '[ArrowDown]');
            assertKeyboardEvent(15 /* LeftArrow */, 'Convert', 'LeftArrow', 'Left', 'left', '[ArrowLeft]');
            assertKeyboardEvent(17 /* RightArrow */, 'NonConvert', 'RightArrow', 'Right', 'right', '[ArrowRight]');
            assertKeyboardEvent(20 /* Delete */, 'PrintScreen', 'Delete', 'Delete', 'delete', '[Delete]');
            assertKeyboardEvent(19 /* Insert */, 'NumpadDivide', 'Insert', 'Insert', 'insert', '[Insert]');
            assertKeyboardEvent(13 /* End */, 'Unknown', 'End', 'End', 'end', '[End]');
            assertKeyboardEvent(14 /* Home */, 'IntlRo', 'Home', 'Home', 'home', '[Home]');
            assertKeyboardEvent(12 /* PageDown */, 'ControlRight', 'PageDown', 'PageDown', 'pagedown', '[PageDown]');
            assertKeyboardEvent(11 /* PageUp */, 'Lang4', 'PageUp', 'PageUp', 'pageup', '[PageUp]');
            // https://github.com/Microsoft/vscode/issues/24107#issuecomment-292323924
            assertKeyboardEvent(12 /* PageDown */, 'ControlRight', 'PageDown', 'PageDown', 'pagedown', '[PageDown]');
            assertKeyboardEvent(11 /* PageUp */, 'Lang4', 'PageUp', 'PageUp', 'pageup', '[PageUp]');
            assertKeyboardEvent(13 /* End */, '', 'End', 'End', 'end', '[End]');
            assertKeyboardEvent(14 /* Home */, 'IntlRo', 'Home', 'Home', 'home', '[Home]');
            assertKeyboardEvent(20 /* Delete */, 'PrintScreen', 'Delete', 'Delete', 'delete', '[Delete]');
            assertKeyboardEvent(19 /* Insert */, 'NumpadDivide', 'Insert', 'Insert', 'insert', '[Insert]');
            assertKeyboardEvent(17 /* RightArrow */, 'NonConvert', 'RightArrow', 'Right', 'right', '[ArrowRight]');
            assertKeyboardEvent(15 /* LeftArrow */, 'Convert', 'LeftArrow', 'Left', 'left', '[ArrowLeft]');
            assertKeyboardEvent(18 /* DownArrow */, 'NumpadEnter', 'DownArrow', 'Down', 'down', '[ArrowDown]');
            assertKeyboardEvent(16 /* UpArrow */, 'Lang3', 'UpArrow', 'Up', 'up', '[ArrowUp]');
        });
    });
    suite('keyboardMapper - LINUX ru', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(false, 'linux_ru', 3 /* Linux */).then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_ru.txt', done);
        });
        function _assertResolveKeybinding(k, expected) {
            keyboardMapperTestUtils_1.assertResolveKeybinding(mapper, keyCodes_1.createKeybinding(k, 3 /* Linux */), expected);
        }
        test('resolveKeybinding Ctrl+S', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 49 /* KEY_S */, [{
                    label: 'Ctrl+S',
                    ariaLabel: 'Control+S',
                    electronAccelerator: 'Ctrl+S',
                    userSettingsLabel: 'ctrl+s',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+[KeyS]', null],
                }]);
        });
    });
    suite('keyboardMapper - LINUX en_uk', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(false, 'linux_en_uk', 3 /* Linux */).then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_en_uk.txt', done);
        });
        test('issue #24522: resolveKeyboardEvent Ctrl+Alt+[Minus]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                keyCode: -1,
                code: 'Minus'
            }, {
                label: 'Ctrl+Alt+-',
                ariaLabel: 'Control+Alt+-',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+alt+[Minus]',
                isWYSIWYG: false,
                isChord: false,
                dispatchParts: ['ctrl+alt+[Minus]', null],
            });
        });
    });
    suite('keyboardMapper - MAC zh_hant', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(false, 'mac_zh_hant', 2 /* Macintosh */).then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_zh_hant.txt', done);
        });
        function _assertResolveKeybinding(k, expected) {
            keyboardMapperTestUtils_1.assertResolveKeybinding(mapper, keyCodes_1.createKeybinding(k, 2 /* Macintosh */), expected);
        }
        test('issue #28237 resolveKeybinding Cmd+C', function () {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 33 /* KEY_C */, [{
                    label: '⌘C',
                    ariaLabel: 'Command+C',
                    electronAccelerator: 'Cmd+C',
                    userSettingsLabel: 'cmd+c',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['meta+[KeyC]', null],
                }]);
        });
    });
    function _assertKeybindingTranslation(mapper, OS, kb, _expected) {
        var expected;
        if (typeof _expected === 'string') {
            expected = [_expected];
        }
        else if (Array.isArray(_expected)) {
            expected = _expected;
        }
        else {
            expected = [];
        }
        var runtimeKeybinding = keyCodes_1.createKeybinding(kb, OS);
        var keybindingLabel = new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(runtimeKeybinding, OS).getUserSettingsLabel();
        var actualHardwareKeypresses = mapper.simpleKeybindingToScanCodeBinding(runtimeKeybinding);
        if (actualHardwareKeypresses.length === 0) {
            assert.deepEqual([], expected, "simpleKeybindingToHardwareKeypress -- \"" + keybindingLabel + "\" -- actual: \"[]\" -- expected: \"" + expected + "\"");
            return;
        }
        var actual = actualHardwareKeypresses
            .map(function (k) { return keybindingLabels_1.UserSettingsLabelProvider.toLabel(k, scanCode_1.ScanCodeUtils.toString(k.scanCode), null, null, OS); });
        assert.deepEqual(actual, expected, "simpleKeybindingToHardwareKeypress -- \"" + keybindingLabel + "\" -- actual: \"" + actual + "\" -- expected: \"" + expected + "\"");
    }
});
