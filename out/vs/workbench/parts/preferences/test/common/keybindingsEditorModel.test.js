/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "assert", "vs/base/common/uuid", "vs/base/common/winjs.base", "vs/base/common/platform", "vs/platform/registry/common/platform", "vs/base/common/actions", "vs/base/common/keyCodes", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/workbench/common/actions", "vs/platform/keybinding/common/keybinding", "vs/platform/extensions/common/extensions", "vs/platform/contextkey/common/contextkey", "vs/workbench/parts/preferences/common/keybindingsEditorModel", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/platform/instantiation/test/common/instantiationServiceMock"], function (require, exports, assert, uuid, winjs_base_1, platform_1, platform_2, actions_1, keyCodes_1, actions_2, commands_1, actions_3, keybinding_1, extensions_1, contextkey_1, keybindingsEditorModel_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1, instantiationServiceMock_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AnAction = /** @class */ (function (_super) {
        __extends(AnAction, _super);
        function AnAction(id) {
            return _super.call(this, id) || this;
        }
        return AnAction;
    }(actions_1.Action));
    suite('Keybindings Editor Model test', function () {
        var instantiationService;
        var testObject;
        setup(function () {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(keybinding_1.IKeybindingService, {});
            instantiationService.stub(extensions_1.IExtensionService, {}, 'whenInstalledExtensionsRegistered', function () { return winjs_base_1.TPromise.as(null); });
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, platform_1.OS);
            commands_1.CommandsRegistry.registerCommand('command_without_keybinding', function () { });
        });
        test('fetch returns default keybindings', function () {
            var expected = prepareKeybindingService(aResolvedKeybindingItem({ command: 'a' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'b' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ } }));
            return testObject.resolve({}).then(function () {
                var actuals = asResolvedKeybindingItems(testObject.fetch(''));
                assertKeybindingItems(actuals, expected);
            });
        });
        test('fetch returns default keybindings at the top', function () {
            var expected = prepareKeybindingService(aResolvedKeybindingItem({ command: 'a' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'b' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ } }));
            return testObject.resolve({}).then(function () {
                var actuals = asResolvedKeybindingItems(testObject.fetch('').slice(0, 2), true);
                assertKeybindingItems(actuals, expected);
            });
        });
        test('fetch returns default keybindings sorted by command id', function () {
            var keybindings = prepareKeybindingService(aResolvedKeybindingItem({ command: 'b' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'c' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'a' + uuid.generateUuid(), firstPart: { keyCode: 1 /* Backspace */ } }));
            var expected = [keybindings[2], keybindings[0], keybindings[1]];
            return testObject.resolve({}).then(function () {
                var actuals = asResolvedKeybindingItems(testObject.fetch(''));
                assertKeybindingItems(actuals, expected);
            });
        });
        test('fetch returns user keybinding first if default and user has same id', function () {
            var sameId = 'b' + uuid.generateUuid();
            var keybindings = prepareKeybindingService(aResolvedKeybindingItem({ command: sameId, firstPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: sameId, firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ }, isDefault: false }));
            var expected = [keybindings[1], keybindings[0]];
            return testObject.resolve({}).then(function () {
                var actuals = asResolvedKeybindingItems(testObject.fetch(''));
                assertKeybindingItems(actuals, expected);
            });
        });
        test('fetch returns keybinding with titles first', function () {
            var keybindings = prepareKeybindingService(aResolvedKeybindingItem({ command: 'a' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'b' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'c' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'd' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ } }));
            registerCommandWithTitle(keybindings[1].command, 'B Title');
            registerCommandWithTitle(keybindings[3].command, 'A Title');
            var expected = [keybindings[3], keybindings[1], keybindings[0], keybindings[2]];
            instantiationService.stub(keybinding_1.IKeybindingService, 'getKeybindings', function () { return keybindings; });
            instantiationService.stub(keybinding_1.IKeybindingService, 'getDefaultKeybindings', function () { return keybindings; });
            return testObject.resolve({}).then(function () {
                var actuals = asResolvedKeybindingItems(testObject.fetch(''));
                assertKeybindingItems(actuals, expected);
            });
        });
        test('fetch returns keybinding with user first if title and id matches', function () {
            var sameId = 'b' + uuid.generateUuid();
            var keybindings = prepareKeybindingService(aResolvedKeybindingItem({ command: 'a' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: sameId, firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'c' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: sameId, firstPart: { keyCode: 9 /* Escape */ }, isDefault: false }));
            registerCommandWithTitle(keybindings[1].command, 'Same Title');
            registerCommandWithTitle(keybindings[3].command, 'Same Title');
            var expected = [keybindings[3], keybindings[1], keybindings[0], keybindings[2]];
            return testObject.resolve({}).then(function () {
                var actuals = asResolvedKeybindingItems(testObject.fetch(''));
                assertKeybindingItems(actuals, expected);
            });
        });
        test('fetch returns default keybindings sorted by precedence', function () {
            var expected = prepareKeybindingService(aResolvedKeybindingItem({ command: 'b' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'c' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, chordPart: { keyCode: 9 /* Escape */ } }), aResolvedKeybindingItem({ command: 'a' + uuid.generateUuid(), firstPart: { keyCode: 1 /* Backspace */ } }));
            return testObject.resolve({}).then(function () {
                var actuals = asResolvedKeybindingItems(testObject.fetch('', true));
                assertKeybindingItems(actuals, expected);
            });
        });
        test('convert keybinding without title to entry', function () {
            var expected = aResolvedKeybindingItem({ command: 'a' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, when: 'context1 && context2' });
            prepareKeybindingService(expected);
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('')[0];
                assert.equal(actual.keybindingItem.command, expected.command);
                assert.equal(actual.keybindingItem.commandLabel, '');
                assert.equal(actual.keybindingItem.commandDefaultLabel, null);
                assert.equal(actual.keybindingItem.keybinding.getAriaLabel(), expected.resolvedKeybinding.getAriaLabel());
                assert.equal(actual.keybindingItem.when, expected.when.serialize());
            });
        });
        test('convert keybinding with title to entry', function () {
            var expected = aResolvedKeybindingItem({ command: 'a' + uuid.generateUuid(), firstPart: { keyCode: 9 /* Escape */ }, when: 'context1 && context2' });
            prepareKeybindingService(expected);
            registerCommandWithTitle(expected.command, 'Some Title');
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('')[0];
                assert.equal(actual.keybindingItem.command, expected.command);
                assert.equal(actual.keybindingItem.commandLabel, 'Some Title');
                assert.equal(actual.keybindingItem.commandDefaultLabel, null);
                assert.equal(actual.keybindingItem.keybinding.getAriaLabel(), expected.resolvedKeybinding.getAriaLabel());
                assert.equal(actual.keybindingItem.when, expected.when.serialize());
            });
        });
        test('convert without title and binding to entry', function () {
            commands_1.CommandsRegistry.registerCommand('command_without_keybinding', function () { });
            prepareKeybindingService();
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('').filter(function (element) { return element.keybindingItem.command === 'command_without_keybinding'; })[0];
                assert.equal(actual.keybindingItem.command, 'command_without_keybinding');
                assert.equal(actual.keybindingItem.commandLabel, '');
                assert.equal(actual.keybindingItem.commandDefaultLabel, null);
                assert.equal(actual.keybindingItem.keybinding, null);
                assert.equal(actual.keybindingItem.when, '');
            });
        });
        test('convert with title and wihtout binding to entry', function () {
            var id = 'a' + uuid.generateUuid();
            registerCommandWithTitle(id, 'some title');
            prepareKeybindingService();
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('').filter(function (element) { return element.keybindingItem.command === id; })[0];
                assert.equal(actual.keybindingItem.command, id);
                assert.equal(actual.keybindingItem.commandLabel, 'some title');
                assert.equal(actual.keybindingItem.commandDefaultLabel, null);
                assert.equal(actual.keybindingItem.keybinding, null);
                assert.equal(actual.keybindingItem.when, '');
            });
        });
        test('filter by command id', function () {
            var id = 'workbench.action.increaseViewSize';
            registerCommandWithTitle(id, 'some title');
            prepareKeybindingService();
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('workbench action view size').filter(function (element) { return element.keybindingItem.command === id; })[0];
                assert.ok(actual);
            });
        });
        test('filter by command title', function () {
            var id = 'a' + uuid.generateUuid();
            registerCommandWithTitle(id, 'Increase view size');
            prepareKeybindingService();
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('increase size').filter(function (element) { return element.keybindingItem.command === id; })[0];
                assert.ok(actual);
            });
        });
        test('filter by default source', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */ }, when: 'context1 && context2' });
            prepareKeybindingService(expected);
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('default').filter(function (element) { return element.keybindingItem.command === command; })[0];
                assert.ok(actual);
            });
        });
        test('filter by user source', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */ }, when: 'context1 && context2', isDefault: false });
            prepareKeybindingService(expected);
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('user').filter(function (element) { return element.keybindingItem.command === command; })[0];
                assert.ok(actual);
            });
        });
        test('filter by when context', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */ }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected);
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('when context').filter(function (element) { return element.keybindingItem.command === command; })[0];
                assert.ok(actual);
            });
        });
        test('filter by cmd key', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 2 /* Macintosh */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected);
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('cmd').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { metaKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by meta key', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 2 /* Macintosh */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('meta').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { metaKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by command key', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 2 /* Macintosh */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { altKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('command').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { metaKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by windows key', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 1 /* Windows */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('windows').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { metaKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by alt key', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { altKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('alt').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { altKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by option key', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { altKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('option').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { altKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by ctrl key', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('ctrl').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { ctrlKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by control key', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('control').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { ctrlKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by shift key', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('shift').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { shiftKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by arrow', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 17 /* RightArrow */, modifiers: { shiftKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('arrow').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by modifier and key', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 17 /* RightArrow */, modifiers: { altKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 17 /* RightArrow */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('alt right').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { altKey: true, keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by key and modifier', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 17 /* RightArrow */, modifiers: { altKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 17 /* RightArrow */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('right alt').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(0, actual.length);
            });
        });
        test('filter by modifiers and key', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 2 /* Macintosh */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { altKey: true, metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('alt cmd esc').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { altKey: true, metaKey: true, keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by modifiers in random order and key', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 2 /* Macintosh */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('cmd shift esc').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { metaKey: true, shiftKey: true, keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter by first part', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 2 /* Macintosh */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 20 /* Delete */ }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('cmd shift esc').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { metaKey: true, shiftKey: true, keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter matches in chord part', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 2 /* Macintosh */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 20 /* Delete */ }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('cmd del').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { metaKey: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, { keyCode: true });
            });
        });
        test('filter matches first part and in chord part', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 2 /* Macintosh */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 20 /* Delete */ }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 16 /* UpArrow */ }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('cmd shift esc del').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { shiftKey: true, metaKey: true, keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, { keyCode: true });
            });
        });
        test('filter exact matches', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 33 /* KEY_C */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 33 /* KEY_C */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('"ctrl c"').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { ctrlKey: true, keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter exact matches with first and chord part', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 33 /* KEY_C */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 33 /* KEY_C */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('"shift meta escape ctrl c"').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { shiftKey: true, metaKey: true, keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, { ctrlKey: true, keyCode: true });
            });
        });
        test('filter exact matches with first and chord part no results', function () {
            testObject = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, 2 /* Macintosh */);
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 20 /* Delete */, modifiers: { metaKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 16 /* UpArrow */ }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('"cmd shift esc del"').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(0, actual.length);
            });
        });
        test('filter matches with + separator', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 33 /* KEY_C */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 33 /* KEY_C */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('"control+c"').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { ctrlKey: true, keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, {});
            });
        });
        test('filter matches with + separator in first and chord parts', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 9 /* Escape */, modifiers: { shiftKey: true, metaKey: true } }, chordPart: { keyCode: 33 /* KEY_C */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 33 /* KEY_C */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('"shift+meta+escape ctrl+c"').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
                assert.deepEqual(actual[0].keybindingMatches.firstPart, { shiftKey: true, metaKey: true, keyCode: true });
                assert.deepEqual(actual[0].keybindingMatches.chordPart, { keyCode: true, ctrlKey: true });
            });
        });
        test('filter exact matches with space #32993', function () {
            var command = 'a' + uuid.generateUuid();
            var expected = aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 10 /* Space */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false });
            prepareKeybindingService(expected, aResolvedKeybindingItem({ command: command, firstPart: { keyCode: 1 /* Backspace */, modifiers: { ctrlKey: true } }, when: 'whenContext1 && whenContext2', isDefault: false }));
            return testObject.resolve({}).then(function () {
                var actual = testObject.fetch('"ctrl+space"').filter(function (element) { return element.keybindingItem.command === command; });
                assert.equal(1, actual.length);
            });
        });
        function prepareKeybindingService() {
            var keybindingItems = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keybindingItems[_i] = arguments[_i];
            }
            instantiationService.stub(keybinding_1.IKeybindingService, 'getKeybindings', function () { return keybindingItems; });
            instantiationService.stub(keybinding_1.IKeybindingService, 'getDefaultKeybindings', function () { return keybindingItems; });
            return keybindingItems;
        }
        function registerCommandWithTitle(command, title) {
            var registry = platform_2.Registry.as(actions_3.Extensions.WorkbenchActions);
            registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(AnAction, command, title, { primary: null }), '');
        }
        function assertKeybindingItems(actual, expected) {
            assert.equal(actual.length, expected.length);
            for (var i = 0; i < actual.length; i++) {
                assertKeybindingItem(actual[i], expected[i]);
            }
        }
        function assertKeybindingItem(actual, expected) {
            assert.equal(actual.command, expected.command);
            if (actual.when) {
                assert.ok(!!expected.when);
                assert.equal(actual.when.serialize(), expected.when.serialize());
            }
            else {
                assert.ok(!expected.when);
            }
            assert.equal(actual.isDefault, expected.isDefault);
            if (actual.resolvedKeybinding) {
                assert.ok(!!expected.resolvedKeybinding);
                assert.equal(actual.resolvedKeybinding.getLabel(), expected.resolvedKeybinding.getLabel());
            }
            else {
                assert.ok(!expected.resolvedKeybinding);
            }
        }
        function aResolvedKeybindingItem(_a) {
            var command = _a.command, when = _a.when, isDefault = _a.isDefault, firstPart = _a.firstPart, chordPart = _a.chordPart;
            var aSimpleKeybinding = function (part) {
                var _a = part.modifiers || { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false }, ctrlKey = _a.ctrlKey, shiftKey = _a.shiftKey, altKey = _a.altKey, metaKey = _a.metaKey;
                return new keyCodes_1.SimpleKeybinding(ctrlKey, shiftKey, altKey, metaKey, part.keyCode);
            };
            var keybinding = firstPart ? chordPart ? new keyCodes_1.ChordKeybinding(aSimpleKeybinding(firstPart), aSimpleKeybinding(chordPart)) : aSimpleKeybinding(firstPart) : null;
            return new resolvedKeybindingItem_1.ResolvedKeybindingItem(keybinding ? new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(keybinding, platform_1.OS) : null, command || 'some command', null, when ? contextkey_1.ContextKeyExpr.deserialize(when) : null, isDefault === void 0 ? true : isDefault);
        }
        function asResolvedKeybindingItems(keybindingEntries, keepUnassigned) {
            if (keepUnassigned === void 0) { keepUnassigned = false; }
            if (!keepUnassigned) {
                keybindingEntries = keybindingEntries.filter(function (keybindingEntry) { return !!keybindingEntry.keybindingItem.keybinding; });
            }
            return keybindingEntries.map(function (entry) { return entry.keybindingItem.keybindingItem; });
        }
    });
});
