var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/commands/common/commands", "vs/base/common/winjs.base", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers", "vs/base/common/marshalling"], function (require, exports, commands_1, winjs_base_1, extHost_protocol_1, extHostCustomers_1, marshalling_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadCommands = /** @class */ (function () {
        function MainThreadCommands(extHostContext, _commandService) {
            var _this = this;
            this._commandService = _commandService;
            this._disposables = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostCommands);
            this._generateCommandsDocumentationRegistration = commands_1.CommandsRegistry.registerCommand('_generateCommandsDocumentation', function () { return _this._generateCommandsDocumentation(); });
        }
        MainThreadCommands.prototype.dispose = function () {
            this._disposables.forEach(function (value) { return value.dispose(); });
            this._disposables.clear();
            this._generateCommandsDocumentationRegistration.dispose();
        };
        MainThreadCommands.prototype._generateCommandsDocumentation = function () {
            return this._proxy.$getContributedCommandHandlerDescriptions().then(function (result) {
                // add local commands
                var commands = commands_1.CommandsRegistry.getCommands();
                for (var id in commands) {
                    var description = commands[id].description;
                    if (description) {
                        result[id] = description;
                    }
                }
                // print all as markdown
                var all = [];
                for (var id in result) {
                    all.push('`' + id + '` - ' + _generateMarkdown(result[id]));
                }
                console.log(all.join('\n'));
            });
        };
        MainThreadCommands.prototype.$registerCommand = function (id) {
            var _this = this;
            this._disposables.set(id, commands_1.CommandsRegistry.registerCommand(id, function (accessor) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return (_a = _this._proxy).$executeContributedCommand.apply(_a, [id].concat(args)).then(function (result) {
                    return marshalling_1.revive(result, 0);
                });
                var _a;
            }));
        };
        MainThreadCommands.prototype.$unregisterCommand = function (id) {
            if (this._disposables.has(id)) {
                this._disposables.get(id).dispose();
                this._disposables.delete(id);
            }
        };
        MainThreadCommands.prototype.$executeCommand = function (id, args) {
            for (var i = 0; i < args.length; i++) {
                args[i] = marshalling_1.revive(args[i], 0);
            }
            return (_a = this._commandService).executeCommand.apply(_a, [id].concat(args));
            var _a;
        };
        MainThreadCommands.prototype.$getCommands = function () {
            return winjs_base_1.TPromise.as(Object.keys(commands_1.CommandsRegistry.getCommands()));
        };
        MainThreadCommands = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadCommands),
            __param(1, commands_1.ICommandService)
        ], MainThreadCommands);
        return MainThreadCommands;
    }());
    exports.MainThreadCommands = MainThreadCommands;
    // --- command doc
    function _generateMarkdown(description) {
        if (typeof description === 'string') {
            return description;
        }
        else {
            var parts = [description.description];
            parts.push('\n\n');
            if (description.args) {
                for (var _i = 0, _a = description.args; _i < _a.length; _i++) {
                    var arg = _a[_i];
                    parts.push("* _" + arg.name + "_ " + (arg.description || '') + "\n");
                }
            }
            if (description.returns) {
                parts.push("* _(returns)_ " + description.returns);
            }
            parts.push('\n\n');
            return parts.join('');
        }
    }
});
