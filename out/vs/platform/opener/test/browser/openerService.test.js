define(["require", "exports", "vs/base/common/uri", "assert", "vs/base/common/winjs.base", "vs/platform/commands/common/commands", "vs/platform/opener/browser/openerService"], function (require, exports, uri_1, assert, winjs_base_1, commands_1, openerService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OpenerService', function () {
        var lastInput;
        var editorService = new /** @class */ (function () {
            function class_1() {
            }
            class_1.prototype.openEditor = function (input) {
                lastInput = input;
            };
            return class_1;
        }());
        var lastCommand;
        var commandService = new /** @class */ (function () {
            function class_2() {
                this.onWillExecuteCommand = function () { return ({ dispose: function () { } }); };
            }
            class_2.prototype.executeCommand = function (id) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                lastCommand = { id: id, args: args };
                return winjs_base_1.TPromise.as(undefined);
            };
            return class_2;
        }());
        setup(function () {
            lastInput = undefined;
            lastCommand = undefined;
        });
        test('delegate to editorService, scheme:///fff', function () {
            var openerService = new openerService_1.OpenerService(editorService, commands_1.NullCommandService);
            openerService.open(uri_1.default.parse('another:///somepath'));
            assert.equal(lastInput.options.selection, undefined);
        });
        test('delegate to editorService, scheme:///fff#L123', function () {
            var openerService = new openerService_1.OpenerService(editorService, commands_1.NullCommandService);
            openerService.open(uri_1.default.parse('file:///somepath#L23'));
            assert.equal(lastInput.options.selection.startLineNumber, 23);
            assert.equal(lastInput.options.selection.startColumn, 1);
            assert.equal(lastInput.options.selection.endLineNumber, undefined);
            assert.equal(lastInput.options.selection.endColumn, undefined);
            assert.equal(lastInput.resource.fragment, '');
            openerService.open(uri_1.default.parse('another:///somepath#L23'));
            assert.equal(lastInput.options.selection.startLineNumber, 23);
            assert.equal(lastInput.options.selection.startColumn, 1);
            openerService.open(uri_1.default.parse('another:///somepath#L23,45'));
            assert.equal(lastInput.options.selection.startLineNumber, 23);
            assert.equal(lastInput.options.selection.startColumn, 45);
            assert.equal(lastInput.options.selection.endLineNumber, undefined);
            assert.equal(lastInput.options.selection.endColumn, undefined);
            assert.equal(lastInput.resource.fragment, '');
        });
        test('delegate to editorService, scheme:///fff#123,123', function () {
            var openerService = new openerService_1.OpenerService(editorService, commands_1.NullCommandService);
            openerService.open(uri_1.default.parse('file:///somepath#23'));
            assert.equal(lastInput.options.selection.startLineNumber, 23);
            assert.equal(lastInput.options.selection.startColumn, 1);
            assert.equal(lastInput.options.selection.endLineNumber, undefined);
            assert.equal(lastInput.options.selection.endColumn, undefined);
            assert.equal(lastInput.resource.fragment, '');
            openerService.open(uri_1.default.parse('file:///somepath#23,45'));
            assert.equal(lastInput.options.selection.startLineNumber, 23);
            assert.equal(lastInput.options.selection.startColumn, 45);
            assert.equal(lastInput.options.selection.endLineNumber, undefined);
            assert.equal(lastInput.options.selection.endColumn, undefined);
            assert.equal(lastInput.resource.fragment, '');
        });
        test('delegate to commandsService, command:someid', function () {
            var openerService = new openerService_1.OpenerService(editorService, commandService);
            // unknown command
            openerService.open(uri_1.default.parse('command:foobar'));
            assert.equal(lastCommand, undefined);
            assert.equal(lastInput.resource.toString(), 'command:foobar');
            assert.equal(lastInput.options.selection, undefined);
            var id = "aCommand" + Math.random();
            commands_1.CommandsRegistry.registerCommand(id, function () { });
            openerService.open(uri_1.default.parse('command:' + id));
            assert.equal(lastCommand.id, id);
            assert.equal(lastCommand.args.length, 0);
            openerService.open(uri_1.default.parse('command:' + id).with({ query: '123' }));
            assert.equal(lastCommand.id, id);
            assert.equal(lastCommand.args.length, 1);
            assert.equal(lastCommand.args[0], '123');
            openerService.open(uri_1.default.parse('command:' + id).with({ query: JSON.stringify([12, true]) }));
            assert.equal(lastCommand.id, id);
            assert.equal(lastCommand.args.length, 2);
            assert.equal(lastCommand.args[0], 12);
            assert.equal(lastCommand.args[1], true);
        });
    });
});
