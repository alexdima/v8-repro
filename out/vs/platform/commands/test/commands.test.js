define(["require", "exports", "assert", "vs/platform/commands/common/commands"], function (require, exports, assert, commands_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Command Tests', function () {
        test('register command - no handler', function () {
            assert.throws(function () { return commands_1.CommandsRegistry.registerCommand('foo', null); });
        });
        test('register/dispose', function () {
            var command = function () { };
            var reg = commands_1.CommandsRegistry.registerCommand('foo', command);
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command);
            reg.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo') === undefined);
        });
        test('register/register/dispose', function () {
            var command1 = function () { };
            var command2 = function () { };
            // dispose overriding command
            var reg1 = commands_1.CommandsRegistry.registerCommand('foo', command1);
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command1);
            var reg2 = commands_1.CommandsRegistry.registerCommand('foo', command2);
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command2);
            reg2.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command1);
            reg1.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo') === void 0);
            // dispose override command first
            reg1 = commands_1.CommandsRegistry.registerCommand('foo', command1);
            reg2 = commands_1.CommandsRegistry.registerCommand('foo', command2);
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command2);
            reg1.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command2);
            reg2.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo') === void 0);
        });
        test('command with description', function () {
            commands_1.CommandsRegistry.registerCommand('test', function (accessor, args) {
                assert.ok(typeof args === 'string');
            });
            commands_1.CommandsRegistry.registerCommand('test2', function (accessor, args) {
                assert.ok(typeof args === 'string');
            });
            commands_1.CommandsRegistry.registerCommand({
                id: 'test3',
                handler: function (accessor, args) {
                    return true;
                },
                description: {
                    description: 'a command',
                    args: [{ name: 'value', constraint: Number }]
                }
            });
            commands_1.CommandsRegistry.getCommands()['test'].handler.apply(undefined, [undefined, 'string']);
            commands_1.CommandsRegistry.getCommands()['test2'].handler.apply(undefined, [undefined, 'string']);
            assert.throws(function () { return commands_1.CommandsRegistry.getCommands()['test3'].handler.apply(undefined, [undefined, 'string']); });
            assert.equal(commands_1.CommandsRegistry.getCommands()['test3'].handler.apply(undefined, [undefined, 1]), true);
        });
    });
});
