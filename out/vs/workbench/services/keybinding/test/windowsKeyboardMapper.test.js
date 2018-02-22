/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/base/common/keyCodes", "vs/workbench/services/keybinding/test/keyboardMapperTestUtils", "vs/workbench/services/keybinding/common/scanCode"], function (require, exports, windowsKeyboardMapper_1, keyCodes_1, keyboardMapperTestUtils_1, scanCode_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WRITE_FILE_IF_DIFFERENT = false;
    function createKeyboardMapper(isUSStandard, file) {
        return keyboardMapperTestUtils_1.readRawMapping(file).then(function (rawMappings) {
            return new windowsKeyboardMapper_1.WindowsKeyboardMapper(isUSStandard, rawMappings);
        });
    }
    function _assertResolveKeybinding(mapper, k, expected) {
        keyboardMapperTestUtils_1.assertResolveKeybinding(mapper, keyCodes_1.createKeybinding(k, 1 /* Windows */), expected);
    }
    suite('keyboardMapper - WINDOWS de_ch', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(false, 'win_de_ch').then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'win_de_ch.txt', done);
        });
        test('resolveKeybinding Ctrl+A', function () {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 31 /* KEY_A */, [{
                    label: 'Ctrl+A',
                    ariaLabel: 'Control+A',
                    electronAccelerator: 'Ctrl+A',
                    userSettingsLabel: 'ctrl+a',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+A', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Z', function () {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 56 /* KEY_Z */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+Z', null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+Z', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 56 /* KEY_Z */,
                code: null
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+Z', null],
            });
        });
        test('resolveKeybinding Ctrl+]', function () {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 89 /* US_CLOSE_SQUARE_BRACKET */, [{
                    label: 'Ctrl+^',
                    ariaLabel: 'Control+^',
                    electronAccelerator: 'Ctrl+]',
                    userSettingsLabel: 'ctrl+oem_6',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['ctrl+]', null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 89 /* US_CLOSE_SQUARE_BRACKET */,
                code: null
            }, {
                label: 'Ctrl+^',
                ariaLabel: 'Control+^',
                electronAccelerator: 'Ctrl+]',
                userSettingsLabel: 'ctrl+oem_6',
                isWYSIWYG: false,
                isChord: false,
                dispatchParts: ['ctrl+]', null],
            });
        });
        test('resolveKeybinding Shift+]', function () {
            _assertResolveKeybinding(mapper, 1024 /* Shift */ | 89 /* US_CLOSE_SQUARE_BRACKET */, [{
                    label: 'Shift+^',
                    ariaLabel: 'Shift+^',
                    electronAccelerator: 'Shift+]',
                    userSettingsLabel: 'shift+oem_6',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['shift+]', null],
                }]);
        });
        test('resolveKeybinding Ctrl+/', function () {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 85 /* US_SLASH */, [{
                    label: 'Ctrl+§',
                    ariaLabel: 'Control+§',
                    electronAccelerator: 'Ctrl+/',
                    userSettingsLabel: 'ctrl+oem_2',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['ctrl+/', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Shift+/', function () {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 85 /* US_SLASH */, [{
                    label: 'Ctrl+Shift+§',
                    ariaLabel: 'Control+Shift+§',
                    electronAccelerator: 'Ctrl+Shift+/',
                    userSettingsLabel: 'ctrl+shift+oem_2',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['ctrl+shift+/', null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', function () {
            _assertResolveKeybinding(mapper, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */), [{
                    label: 'Ctrl+K Ctrl+ä',
                    ariaLabel: 'Control+K Control+ä',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+oem_5',
                    isWYSIWYG: false,
                    isChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+\\'],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', function () {
            _assertResolveKeybinding(mapper, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 81 /* US_EQUAL */), []);
        });
        test('resolveKeybinding Ctrl+DownArrow', function () {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 18 /* DownArrow */, [{
                    label: 'Ctrl+DownArrow',
                    ariaLabel: 'Control+DownArrow',
                    electronAccelerator: 'Ctrl+Down',
                    userSettingsLabel: 'ctrl+down',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+DownArrow', null],
                }]);
        });
        test('resolveKeybinding Ctrl+NUMPAD_0', function () {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 93 /* NUMPAD_0 */, [{
                    label: 'Ctrl+NumPad0',
                    ariaLabel: 'Control+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+numpad0',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+NumPad0', null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', function () {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 14 /* Home */, [{
                    label: 'Ctrl+Home',
                    ariaLabel: 'Control+Home',
                    electronAccelerator: 'Ctrl+Home',
                    userSettingsLabel: 'ctrl+home',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+Home', null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+Home', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 14 /* Home */,
                code: null
            }, {
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+Home', null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', function () {
            keyboardMapperTestUtils_1.assertResolveUserBinding(mapper, new scanCode_1.ScanCodeBinding(true, false, false, false, 60 /* Comma */), new keyCodes_1.SimpleKeybinding(true, false, false, false, 85 /* US_SLASH */), [{
                    label: 'Ctrl+, Ctrl+§',
                    ariaLabel: 'Control+, Control+§',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+oem_comma ctrl+oem_2',
                    isWYSIWYG: false,
                    isChord: true,
                    dispatchParts: ['ctrl+,', 'ctrl+/'],
                }]);
        });
        test('resolveKeyboardEvent Modifier only Ctrl+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 5 /* Ctrl */,
                code: null
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
    suite('keyboardMapper - WINDOWS en_us', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(true, 'win_en_us').then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'win_en_us.txt', done);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', function () {
            _assertResolveKeybinding(mapper, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */), [{
                    label: 'Ctrl+K Ctrl+\\',
                    ariaLabel: 'Control+K Control+\\',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+\\',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+\\'],
                }]);
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', function () {
            keyboardMapperTestUtils_1.assertResolveUserBinding(mapper, new scanCode_1.ScanCodeBinding(true, false, false, false, 60 /* Comma */), new keyCodes_1.SimpleKeybinding(true, false, false, false, 85 /* US_SLASH */), [{
                    label: 'Ctrl+, Ctrl+/',
                    ariaLabel: 'Control+, Control+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+, ctrl+/',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+,', 'ctrl+/'],
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
                    dispatchParts: ['ctrl+,', null],
                }]);
        });
        test('resolveKeyboardEvent Modifier only Ctrl+', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 5 /* Ctrl */,
                code: null
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
    suite('keyboardMapper - WINDOWS por_ptb', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(false, 'win_por_ptb').then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'win_por_ptb.txt', done);
        });
        test('resolveKeyboardEvent Ctrl+[IntlRo]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 110 /* ABNT_C1 */,
                code: null
            }, {
                label: 'Ctrl+/',
                ariaLabel: 'Control+/',
                electronAccelerator: 'Ctrl+ABNT_C1',
                userSettingsLabel: 'ctrl+abnt_c1',
                isWYSIWYG: false,
                isChord: false,
                dispatchParts: ['ctrl+ABNT_C1', null],
            });
        });
        test('resolveKeyboardEvent Ctrl+[NumpadComma]', function () {
            keyboardMapperTestUtils_1.assertResolveKeyboardEvent(mapper, {
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 111 /* ABNT_C2 */,
                code: null
            }, {
                label: 'Ctrl+.',
                ariaLabel: 'Control+.',
                electronAccelerator: 'Ctrl+ABNT_C2',
                userSettingsLabel: 'ctrl+abnt_c2',
                isWYSIWYG: false,
                isChord: false,
                dispatchParts: ['ctrl+ABNT_C2', null],
            });
        });
    });
    suite('keyboardMapper - WINDOWS ru', function () {
        var mapper;
        suiteSetup(function (done) {
            createKeyboardMapper(false, 'win_ru').then(function (_mapper) {
                mapper = _mapper;
                done();
            }, done);
        });
        test('mapping', function (done) {
            keyboardMapperTestUtils_1.assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'win_ru.txt', done);
        });
        test('issue ##24361: resolveKeybinding Ctrl+K Ctrl+K', function () {
            _assertResolveKeybinding(mapper, keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 41 /* KEY_K */), [{
                    label: 'Ctrl+K Ctrl+K',
                    ariaLabel: 'Control+K Control+K',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+k',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+K'],
                }]);
        });
    });
    suite('keyboardMapper - misc', function () {
        test('issue #23513: Toggle Sidebar Visibility and Go to Line display same key mapping in Arabic keyboard', function () {
            var mapper = new windowsKeyboardMapper_1.WindowsKeyboardMapper(false, {
                'KeyB': {
                    'vkey': 'VK_B',
                    'value': 'لا',
                    'withShift': 'لآ',
                    'withAltGr': '',
                    'withShiftAltGr': ''
                },
                'KeyG': {
                    'vkey': 'VK_G',
                    'value': 'ل',
                    'withShift': 'لأ',
                    'withAltGr': '',
                    'withShiftAltGr': ''
                }
            });
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 32 /* KEY_B */, [{
                    label: 'Ctrl+B',
                    ariaLabel: 'Control+B',
                    electronAccelerator: 'Ctrl+B',
                    userSettingsLabel: 'ctrl+b',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+B', null],
                }]);
        });
    });
});
