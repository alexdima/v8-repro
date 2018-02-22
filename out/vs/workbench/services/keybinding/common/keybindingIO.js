define(["require", "exports", "vs/base/common/keyCodes", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/keybinding/common/scanCode"], function (require, exports, keyCodes_1, contextkey_1, scanCode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var KeybindingIO = /** @class */ (function () {
        function KeybindingIO() {
        }
        KeybindingIO.writeKeybindingItem = function (out, item, OS) {
            var quotedSerializedKeybinding = JSON.stringify(item.resolvedKeybinding.getUserSettingsLabel());
            out.write("{ \"key\": " + rightPaddedString(quotedSerializedKeybinding + ',', 25) + " \"command\": ");
            var serializedWhen = item.when ? item.when.serialize() : '';
            var quotedSerializeCommand = JSON.stringify(item.command);
            if (serializedWhen.length > 0) {
                out.write(quotedSerializeCommand + ",");
                out.writeLine();
                out.write("                                     \"when\": \"" + serializedWhen + "\" ");
            }
            else {
                out.write(quotedSerializeCommand + " ");
            }
            // out.write(String(item.weight1 + '-' + item.weight2));
            out.write('}');
        };
        KeybindingIO.readUserKeybindingItem = function (input, OS) {
            var _a = (typeof input.key === 'string' ? this._readUserBinding(input.key) : [null, null]), firstPart = _a[0], chordPart = _a[1];
            var when = (typeof input.when === 'string' ? contextkey_1.ContextKeyExpr.deserialize(input.when) : null);
            var command = (typeof input.command === 'string' ? input.command : null);
            var commandArgs = (typeof input.args !== 'undefined' ? input.args : null);
            return {
                firstPart: firstPart,
                chordPart: chordPart,
                command: command,
                commandArgs: commandArgs,
                when: when
            };
        };
        KeybindingIO._readModifiers = function (input) {
            input = input.toLowerCase().trim();
            var ctrl = false;
            var shift = false;
            var alt = false;
            var meta = false;
            var matchedModifier;
            do {
                matchedModifier = false;
                if (/^ctrl(\+|\-)/.test(input)) {
                    ctrl = true;
                    input = input.substr('ctrl-'.length);
                    matchedModifier = true;
                }
                if (/^shift(\+|\-)/.test(input)) {
                    shift = true;
                    input = input.substr('shift-'.length);
                    matchedModifier = true;
                }
                if (/^alt(\+|\-)/.test(input)) {
                    alt = true;
                    input = input.substr('alt-'.length);
                    matchedModifier = true;
                }
                if (/^meta(\+|\-)/.test(input)) {
                    meta = true;
                    input = input.substr('meta-'.length);
                    matchedModifier = true;
                }
                if (/^win(\+|\-)/.test(input)) {
                    meta = true;
                    input = input.substr('win-'.length);
                    matchedModifier = true;
                }
                if (/^cmd(\+|\-)/.test(input)) {
                    meta = true;
                    input = input.substr('cmd-'.length);
                    matchedModifier = true;
                }
            } while (matchedModifier);
            var key;
            var firstSpaceIdx = input.indexOf(' ');
            if (firstSpaceIdx > 0) {
                key = input.substring(0, firstSpaceIdx);
                input = input.substring(firstSpaceIdx);
            }
            else {
                key = input;
                input = '';
            }
            return {
                remains: input,
                ctrl: ctrl,
                shift: shift,
                alt: alt,
                meta: meta,
                key: key
            };
        };
        KeybindingIO._readSimpleKeybinding = function (input) {
            var mods = this._readModifiers(input);
            var keyCode = keyCodes_1.KeyCodeUtils.fromUserSettings(mods.key);
            return [new keyCodes_1.SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
        };
        KeybindingIO.readKeybinding = function (input, OS) {
            if (!input) {
                return null;
            }
            var _a = this._readSimpleKeybinding(input), firstPart = _a[0], remains = _a[1];
            var chordPart = null;
            if (remains.length > 0) {
                chordPart = this._readSimpleKeybinding(remains)[0];
            }
            if (chordPart) {
                return new keyCodes_1.ChordKeybinding(firstPart, chordPart);
            }
            return firstPart;
        };
        KeybindingIO._readSimpleUserBinding = function (input) {
            var mods = this._readModifiers(input);
            var scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
            if (scanCodeMatch) {
                var strScanCode = scanCodeMatch[1];
                var scanCode = scanCode_1.ScanCodeUtils.lowerCaseToEnum(strScanCode);
                return [new scanCode_1.ScanCodeBinding(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
            }
            var keyCode = keyCodes_1.KeyCodeUtils.fromUserSettings(mods.key);
            return [new keyCodes_1.SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
        };
        KeybindingIO._readUserBinding = function (input) {
            if (!input) {
                return [null, null];
            }
            var _a = this._readSimpleUserBinding(input), firstPart = _a[0], remains = _a[1];
            var chordPart = null;
            if (remains.length > 0) {
                chordPart = this._readSimpleUserBinding(remains)[0];
            }
            return [firstPart, chordPart];
        };
        return KeybindingIO;
    }());
    exports.KeybindingIO = KeybindingIO;
    function rightPaddedString(str, minChars) {
        if (str.length < minChars) {
            return str + (new Array(minChars - str.length).join(' '));
        }
        return str;
    }
    var OutputBuilder = /** @class */ (function () {
        function OutputBuilder() {
            this._lines = [];
            this._currentLine = '';
        }
        OutputBuilder.prototype.write = function (str) {
            this._currentLine += str;
        };
        OutputBuilder.prototype.writeLine = function (str) {
            if (str === void 0) { str = ''; }
            this._lines.push(this._currentLine + str);
            this._currentLine = '';
        };
        OutputBuilder.prototype.toString = function () {
            this.writeLine();
            return this._lines.join('\n');
        };
        return OutputBuilder;
    }());
    exports.OutputBuilder = OutputBuilder;
});
