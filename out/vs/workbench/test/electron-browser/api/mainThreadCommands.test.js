/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/electron-browser/mainThreadCommands", "vs/platform/commands/common/commands", "./testRPCProtocol"], function (require, exports, assert, mainThreadCommands_1, commands_1, testRPCProtocol_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadCommands', function () {
        test('dispose on unregister', function () {
            var commands = new mainThreadCommands_1.MainThreadCommands(testRPCProtocol_1.SingleProxyRPCProtocol(null), undefined);
            assert.equal(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            // register
            commands.$registerCommand('foo');
            assert.ok(commands_1.CommandsRegistry.getCommand('foo'));
            // unregister
            commands.$unregisterCommand('foo');
            assert.equal(commands_1.CommandsRegistry.getCommand('foo'), undefined);
        });
        test('unregister all on dispose', function () {
            var commands = new mainThreadCommands_1.MainThreadCommands(testRPCProtocol_1.SingleProxyRPCProtocol(null), undefined);
            assert.equal(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            commands.$registerCommand('foo');
            commands.$registerCommand('bar');
            assert.ok(commands_1.CommandsRegistry.getCommand('foo'));
            assert.ok(commands_1.CommandsRegistry.getCommand('bar'));
            commands.dispose();
            assert.equal(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            assert.equal(commands_1.CommandsRegistry.getCommand('bar'), undefined);
        });
    });
});
