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
define(["require", "exports", "vs/nls", "vs/platform/message/common/message", "vs/base/common/actions", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, nls, message_1, actions_1, extHost_protocol_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadMessageService = /** @class */ (function () {
        function MainThreadMessageService(extHostContext, _messageService, _choiceService) {
            this._messageService = _messageService;
            this._choiceService = _choiceService;
            //
        }
        MainThreadMessageService.prototype.dispose = function () {
            //
        };
        MainThreadMessageService.prototype.$showMessage = function (severity, message, options, commands) {
            if (options.modal) {
                return this._showModalMessage(severity, message, commands);
            }
            else {
                return this._showMessage(severity, message, commands, options.extension);
            }
        };
        MainThreadMessageService.prototype._showMessage = function (severity, message, commands, extension) {
            var _this = this;
            return new Promise(function (resolve) {
                var messageHide;
                var actions = [];
                var hasCloseAffordance = false;
                var MessageItemAction = /** @class */ (function (_super) {
                    __extends(MessageItemAction, _super);
                    function MessageItemAction(id, label, handle) {
                        return _super.call(this, id, label, undefined, true, function () {
                            resolve(handle);
                            messageHide(); // triggers dispose! make sure promise is already resolved
                            return undefined;
                        }) || this;
                    }
                    MessageItemAction.prototype.dispose = function () {
                        resolve(undefined);
                    };
                    return MessageItemAction;
                }(actions_1.Action));
                commands.forEach(function (command) {
                    if (command.isCloseAffordance === true) {
                        hasCloseAffordance = true;
                    }
                    actions.push(new MessageItemAction('_extension_message_handle_' + command.handle, command.title, command.handle));
                });
                if (!hasCloseAffordance) {
                    actions.push(new MessageItemAction('__close', nls.localize('close', "Close"), undefined));
                }
                messageHide = _this._messageService.show(severity, {
                    message: message,
                    actions: actions,
                    source: extension && "" + (extension.displayName || extension.name)
                });
            });
        };
        MainThreadMessageService.prototype._showModalMessage = function (severity, message, commands) {
            var cancelId = void 0;
            var options = commands.map(function (command, index) {
                if (command.isCloseAffordance === true) {
                    cancelId = index;
                }
                return command.title;
            });
            if (cancelId === void 0) {
                if (options.length > 0) {
                    options.push(nls.localize('cancel', "Cancel"));
                }
                else {
                    options.push(nls.localize('ok', "OK"));
                }
                cancelId = options.length - 1;
            }
            return this._choiceService.choose(severity, message, options, cancelId, true)
                .then(function (result) { return result === commands.length ? undefined : commands[result].handle; });
        };
        MainThreadMessageService = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadMessageService),
            __param(1, message_1.IMessageService),
            __param(2, message_1.IChoiceService)
        ], MainThreadMessageService);
        return MainThreadMessageService;
    }());
    exports.MainThreadMessageService = MainThreadMessageService;
});
