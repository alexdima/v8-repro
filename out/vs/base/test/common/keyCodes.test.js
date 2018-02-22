define(["require", "exports", "assert", "vs/base/common/keyCodes"], function (require, exports, assert, keyCodes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('keyCodes', function () {
        function testBinaryEncoding(expected, k, OS) {
            assert.deepEqual(keyCodes_1.createKeybinding(k, OS), expected);
        }
        test('MAC binary encoding', function () {
            function test(expected, k) {
                testBinaryEncoding(expected, k, 2 /* Macintosh */);
            }
            test(null, 0);
            test(new keyCodes_1.SimpleKeybinding(false, false, false, false, 3 /* Enter */), 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(true, false, false, false, 3 /* Enter */), 256 /* WinCtrl */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(false, false, true, false, 3 /* Enter */), 512 /* Alt */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(true, false, true, false, 3 /* Enter */), 512 /* Alt */ | 256 /* WinCtrl */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(false, true, false, false, 3 /* Enter */), 1024 /* Shift */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(true, true, false, false, 3 /* Enter */), 1024 /* Shift */ | 256 /* WinCtrl */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(false, true, true, false, 3 /* Enter */), 1024 /* Shift */ | 512 /* Alt */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(true, true, true, false, 3 /* Enter */), 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(false, false, false, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(true, false, false, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(false, false, true, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 512 /* Alt */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(true, false, true, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 512 /* Alt */ | 256 /* WinCtrl */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(false, true, false, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(true, true, false, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 1024 /* Shift */ | 256 /* WinCtrl */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(false, true, true, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 3 /* Enter */);
            test(new keyCodes_1.SimpleKeybinding(true, true, true, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 3 /* Enter */);
            test(new keyCodes_1.ChordKeybinding(new keyCodes_1.SimpleKeybinding(false, false, false, false, 3 /* Enter */), new keyCodes_1.SimpleKeybinding(false, false, false, false, 2 /* Tab */)), keyCodes_1.KeyChord(3 /* Enter */, 2 /* Tab */));
            test(new keyCodes_1.ChordKeybinding(new keyCodes_1.SimpleKeybinding(false, false, false, true, 55 /* KEY_Y */), new keyCodes_1.SimpleKeybinding(false, false, false, false, 56 /* KEY_Z */)), keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 55 /* KEY_Y */, 56 /* KEY_Z */));
        });
        test('WINDOWS & LINUX binary encoding', function () {
            [3 /* Linux */, 1 /* Windows */].forEach(function (OS) {
                function test(expected, k) {
                    testBinaryEncoding(expected, k, OS);
                }
                test(null, 0);
                test(new keyCodes_1.SimpleKeybinding(false, false, false, false, 3 /* Enter */), 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(false, false, false, true, 3 /* Enter */), 256 /* WinCtrl */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(false, false, true, false, 3 /* Enter */), 512 /* Alt */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(false, false, true, true, 3 /* Enter */), 512 /* Alt */ | 256 /* WinCtrl */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(false, true, false, false, 3 /* Enter */), 1024 /* Shift */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(false, true, false, true, 3 /* Enter */), 1024 /* Shift */ | 256 /* WinCtrl */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(false, true, true, false, 3 /* Enter */), 1024 /* Shift */ | 512 /* Alt */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(false, true, true, true, 3 /* Enter */), 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(true, false, false, false, 3 /* Enter */), 2048 /* CtrlCmd */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(true, false, false, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(true, false, true, false, 3 /* Enter */), 2048 /* CtrlCmd */ | 512 /* Alt */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(true, false, true, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 512 /* Alt */ | 256 /* WinCtrl */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(true, true, false, false, 3 /* Enter */), 2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(true, true, false, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 1024 /* Shift */ | 256 /* WinCtrl */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(true, true, true, false, 3 /* Enter */), 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 3 /* Enter */);
                test(new keyCodes_1.SimpleKeybinding(true, true, true, true, 3 /* Enter */), 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 256 /* WinCtrl */ | 3 /* Enter */);
                test(new keyCodes_1.ChordKeybinding(new keyCodes_1.SimpleKeybinding(false, false, false, false, 3 /* Enter */), new keyCodes_1.SimpleKeybinding(false, false, false, false, 2 /* Tab */)), keyCodes_1.KeyChord(3 /* Enter */, 2 /* Tab */));
                test(new keyCodes_1.ChordKeybinding(new keyCodes_1.SimpleKeybinding(true, false, false, false, 55 /* KEY_Y */), new keyCodes_1.SimpleKeybinding(false, false, false, false, 56 /* KEY_Z */)), keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 55 /* KEY_Y */, 56 /* KEY_Z */));
            });
        });
    });
});
