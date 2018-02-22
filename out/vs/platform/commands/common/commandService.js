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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/platform/extensions/common/extensions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/log/common/log"], function (require, exports, winjs_base_1, instantiation_1, commands_1, extensions_1, event_1, lifecycle_1, log_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var CommandService = /** @class */ (function (_super) {
        __extends(CommandService, _super);
        function CommandService(_instantiationService, _extensionService, _logService) {
            var _this = _super.call(this) || this;
            _this._instantiationService = _instantiationService;
            _this._extensionService = _extensionService;
            _this._logService = _logService;
            _this._extensionHostIsReady = false;
            _this._onWillExecuteCommand = _this._register(new event_1.Emitter());
            _this.onWillExecuteCommand = _this._onWillExecuteCommand.event;
            _this._extensionService.whenInstalledExtensionsRegistered().then(function (value) { return _this._extensionHostIsReady = value; });
            return _this;
        }
        CommandService.prototype.executeCommand = function (id) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this._logService.trace('CommandService#executeCommand', id);
            // we always send an activation event, but
            // we don't wait for it when the extension
            // host didn't yet start and the command is already registered
            var activation = this._extensionService.activateByEvent("onCommand:" + id);
            var commandIsRegistered = !!commands_1.CommandsRegistry.getCommand(id);
            if (!this._extensionHostIsReady && commandIsRegistered) {
                return this._tryExecuteCommand(id, args);
            }
            else {
                var waitFor = activation;
                if (!commandIsRegistered) {
                    waitFor = winjs_base_1.TPromise.join([activation, this._extensionService.activateByEvent("*")]);
                }
                return waitFor.then(function (_) { return _this._tryExecuteCommand(id, args); });
            }
        };
        CommandService.prototype._tryExecuteCommand = function (id, args) {
            var command = commands_1.CommandsRegistry.getCommand(id);
            if (!command) {
                return winjs_base_1.TPromise.wrapError(new Error("command '" + id + "' not found"));
            }
            try {
                this._onWillExecuteCommand.fire({ commandId: id });
                var result = this._instantiationService.invokeFunction.apply(this._instantiationService, [command.handler].concat(args));
                return winjs_base_1.TPromise.as(result);
            }
            catch (err) {
                return winjs_base_1.TPromise.wrapError(err);
            }
        };
        CommandService = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, extensions_1.IExtensionService),
            __param(2, log_1.ILogService)
        ], CommandService);
        return CommandService;
    }(lifecycle_1.Disposable));
    exports.CommandService = CommandService;
});
