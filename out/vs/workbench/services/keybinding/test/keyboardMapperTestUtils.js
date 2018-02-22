/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/node/pfs"], function (require, exports, assert, pfs_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function toIResolvedKeybinding(kb) {
        return {
            label: kb.getLabel(),
            ariaLabel: kb.getAriaLabel(),
            electronAccelerator: kb.getElectronAccelerator(),
            userSettingsLabel: kb.getUserSettingsLabel(),
            isWYSIWYG: kb.isWYSIWYG(),
            isChord: kb.isChord(),
            dispatchParts: kb.getDispatchParts(),
        };
    }
    function assertResolveKeybinding(mapper, keybinding, expected) {
        var actual = mapper.resolveKeybinding(keybinding).map(toIResolvedKeybinding);
        assert.deepEqual(actual, expected);
    }
    exports.assertResolveKeybinding = assertResolveKeybinding;
    function assertResolveKeyboardEvent(mapper, keyboardEvent, expected) {
        var actual = toIResolvedKeybinding(mapper.resolveKeyboardEvent(keyboardEvent));
        assert.deepEqual(actual, expected);
    }
    exports.assertResolveKeyboardEvent = assertResolveKeyboardEvent;
    function assertResolveUserBinding(mapper, firstPart, chordPart, expected) {
        var actual = mapper.resolveUserBinding(firstPart, chordPart).map(toIResolvedKeybinding);
        assert.deepEqual(actual, expected);
    }
    exports.assertResolveUserBinding = assertResolveUserBinding;
    function readRawMapping(file) {
        return pfs_1.readFile(require.toUrl("vs/workbench/services/keybinding/test/" + file + ".js")).then(function (buff) {
            var contents = buff.toString();
            var func = new Function('define', contents);
            var rawMappings = null;
            func(function (value) {
                rawMappings = value;
            });
            return rawMappings;
        });
    }
    exports.readRawMapping = readRawMapping;
    function assertMapping(writeFileIfDifferent, mapper, file, done) {
        var filePath = require.toUrl("vs/workbench/services/keybinding/test/" + file);
        pfs_1.readFile(filePath).then(function (buff) {
            var expected = buff.toString();
            var actual = mapper.dumpDebugInfo();
            if (actual !== expected && writeFileIfDifferent) {
                pfs_1.writeFile(filePath, actual);
            }
            try {
                assert.deepEqual(actual, expected);
            }
            catch (err) {
                return done(err);
            }
            done();
        }, done);
    }
    exports.assertMapping = assertMapping;
});
