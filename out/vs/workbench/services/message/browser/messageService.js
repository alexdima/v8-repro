define(["require", "exports", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/types", "vs/workbench/services/message/browser/messageList", "vs/base/common/lifecycle", "vs/platform/message/common/message", "vs/base/common/winjs.base"], function (require, exports, errors, errorMessage_1, types, messageList_1, lifecycle_1, message_1, winjs_base_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkbenchMessageService = /** @class */ (function () {
        function WorkbenchMessageService(container, telemetryService) {
            this.handler = new messageList_1.MessageList(container, telemetryService);
            this.messageBuffer = [];
            this.canShowMessages = true;
            this.toDispose = [this.handler];
        }
        Object.defineProperty(WorkbenchMessageService.prototype, "onMessagesShowing", {
            get: function () {
                return this.handler.onMessagesShowing;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchMessageService.prototype, "onMessagesCleared", {
            get: function () {
                return this.handler.onMessagesCleared;
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchMessageService.prototype.suspend = function () {
            this.canShowMessages = false;
            this.handler.hide();
        };
        WorkbenchMessageService.prototype.resume = function () {
            this.canShowMessages = true;
            this.handler.show();
            // Release messages from buffer
            while (this.messageBuffer.length) {
                var bufferedMessage = this.messageBuffer.pop();
                bufferedMessage.disposeFn = this.show(bufferedMessage.severity, bufferedMessage.message, bufferedMessage.onHide);
            }
        };
        WorkbenchMessageService.prototype.toBaseSeverity = function (severity) {
            switch (severity) {
                case message_1.Severity.Info:
                    return messageList_1.Severity.Info;
                case message_1.Severity.Warning:
                    return messageList_1.Severity.Warning;
            }
            return messageList_1.Severity.Error;
        };
        WorkbenchMessageService.prototype.show = function (sev, message, onHide) {
            var _this = this;
            if (!message) {
                return function () { return void 0; }; // guard against undefined messages
            }
            if (Array.isArray(message)) {
                var closeFns_1 = [];
                message.forEach(function (msg) { return closeFns_1.push(_this.show(sev, msg, onHide)); });
                return function () { return closeFns_1.forEach(function (fn) { return fn(); }); };
            }
            if (errors.isPromiseCanceledError(message)) {
                return function () { return void 0; }; // this kind of error should not be shown
            }
            if (types.isNumber(message.severity)) {
                sev = message.severity;
            }
            return this.doShow(sev, message, onHide);
        };
        WorkbenchMessageService.prototype.doShow = function (sev, message, onHide) {
            var _this = this;
            // Check flag if we can show a message now
            if (!this.canShowMessages) {
                var messageObj_1 = {
                    severity: sev,
                    message: message,
                    onHide: onHide,
                    disposeFn: function () { return _this.messageBuffer.splice(_this.messageBuffer.indexOf(messageObj_1), 1); }
                };
                this.messageBuffer.push(messageObj_1);
                // Return function that allows to remove message from buffer
                return function () { return messageObj_1.disposeFn(); };
            }
            // Show in Console
            if (sev === message_1.Severity.Error) {
                console.error(errorMessage_1.toErrorMessage(message, true));
            }
            // Show in Global Handler
            return this.handler.showMessage(this.toBaseSeverity(sev), message, onHide);
        };
        WorkbenchMessageService.prototype.hideAll = function () {
            if (this.handler) {
                this.handler.hideMessages();
            }
        };
        WorkbenchMessageService.prototype.confirm = function (confirmation) {
            var messageText = confirmation.message;
            if (confirmation.detail) {
                messageText = messageText + '\n\n' + confirmation.detail;
            }
            return winjs_base_1.TPromise.wrap(window.confirm(messageText));
        };
        WorkbenchMessageService.prototype.confirmWithCheckbox = function (confirmation) {
            return this.confirm(confirmation).then(function (confirmed) {
                return {
                    confirmed: confirmed,
                    checkboxChecked: false // unsupported
                };
            });
        };
        WorkbenchMessageService.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        return WorkbenchMessageService;
    }());
    exports.WorkbenchMessageService = WorkbenchMessageService;
});
