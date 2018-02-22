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
define(["require", "exports", "assert", "vs/workbench/api/node/extHostCommands", "vs/platform/commands/common/commands", "./testRPCProtocol", "vs/workbench/test/electron-browser/api/mock", "vs/platform/log/common/log"], function (require, exports, assert, extHostCommands_1, commands_1, testRPCProtocol_1, mock_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostCommands', function () {
        test('dispose calls unregister', function () {
            var lastUnregister;
            var shape = new /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_1.prototype.$registerCommand = function (id) {
                    //
                };
                class_1.prototype.$unregisterCommand = function (id) {
                    lastUnregister = id;
                };
                return class_1;
            }(mock_1.mock()));
            var commands = new extHostCommands_1.ExtHostCommands(testRPCProtocol_1.SingleProxyRPCProtocol(shape), undefined, new log_1.NullLogService());
            commands.registerCommand('foo', function () { }).dispose();
            assert.equal(lastUnregister, 'foo');
            assert.equal(commands_1.CommandsRegistry.getCommand('foo'), undefined);
        });
        test('dispose bubbles only once', function () {
            var unregisterCounter = 0;
            var shape = new /** @class */ (function (_super) {
                __extends(class_2, _super);
                function class_2() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_2.prototype.$registerCommand = function (id) {
                    //
                };
                class_2.prototype.$unregisterCommand = function (id) {
                    unregisterCounter += 1;
                };
                return class_2;
            }(mock_1.mock()));
            var commands = new extHostCommands_1.ExtHostCommands(testRPCProtocol_1.SingleProxyRPCProtocol(shape), undefined, new log_1.NullLogService());
            var reg = commands.registerCommand('foo', function () { });
            reg.dispose();
            reg.dispose();
            reg.dispose();
            assert.equal(unregisterCounter, 1);
        });
    });
});
