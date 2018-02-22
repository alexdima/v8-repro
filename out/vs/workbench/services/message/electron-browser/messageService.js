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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/platform/node/product", "vs/base/common/winjs.base", "vs/workbench/services/message/browser/messageService", "vs/platform/message/common/message", "vs/base/common/platform", "vs/platform/telemetry/common/telemetry", "vs/base/common/actions", "vs/platform/windows/common/windows", "vs/base/common/labels"], function (require, exports, nls, product_1, winjs_base_1, messageService_1, message_1, platform_1, telemetry_1, actions_1, windows_1, labels_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MessageService = /** @class */ (function (_super) {
        __extends(MessageService, _super);
        function MessageService(container, windowService, telemetryService) {
            var _this = _super.call(this, container, telemetryService) || this;
            _this.windowService = windowService;
            return _this;
        }
        MessageService.prototype.confirmWithCheckbox = function (confirmation) {
            var opts = this.massageMessageBoxOptions(this.getConfirmOptions(confirmation));
            return this.windowService.showMessageBox(opts).then(function (result) {
                var button = platform_1.isLinux ? opts.buttons.length - result.button - 1 : result.button;
                return {
                    confirmed: button === 0 ? true : false,
                    checkboxChecked: result.checkboxChecked
                };
            });
        };
        MessageService.prototype.confirm = function (confirmation) {
            var opts = this.getConfirmOptions(confirmation);
            return this.doShowMessageBox(opts).then(function (result) { return result === 0 ? true : false; });
        };
        MessageService.prototype.getConfirmOptions = function (confirmation) {
            var buttons = [];
            if (confirmation.primaryButton) {
                buttons.push(confirmation.primaryButton);
            }
            else {
                buttons.push(nls.localize({ key: 'yesButton', comment: ['&& denotes a mnemonic'] }, "&&Yes"));
            }
            if (confirmation.secondaryButton) {
                buttons.push(confirmation.secondaryButton);
            }
            else if (typeof confirmation.secondaryButton === 'undefined') {
                buttons.push(nls.localize('cancelButton', "Cancel"));
            }
            var opts = {
                title: confirmation.title,
                message: confirmation.message,
                buttons: buttons,
                defaultId: 0,
                cancelId: 1
            };
            if (confirmation.detail) {
                opts.detail = confirmation.detail;
            }
            if (confirmation.type) {
                opts.type = confirmation.type;
            }
            if (confirmation.checkbox) {
                opts.checkboxLabel = confirmation.checkbox.label;
                opts.checkboxChecked = confirmation.checkbox.checked;
            }
            return opts;
        };
        MessageService.prototype.choose = function (severity, message, options, cancelId, modal) {
            if (modal === void 0) { modal = false; }
            if (modal) {
                return this.doChooseModal(severity, message, options, cancelId);
            }
            return this.doChooseWithMessage(severity, message, options);
        };
        MessageService.prototype.doChooseModal = function (severity, message, options, cancelId) {
            var type = severity === message_1.Severity.Info ? 'question' : severity === message_1.Severity.Error ? 'error' : severity === message_1.Severity.Warning ? 'warning' : 'none';
            return this.doShowMessageBox({ message: message, buttons: options, type: type, cancelId: cancelId });
        };
        MessageService.prototype.doChooseWithMessage = function (severity, message, options) {
            var _this = this;
            var onCancel = null;
            var promise = new winjs_base_1.TPromise(function (c, e) {
                var callback = function (index) { return function () {
                    c(index);
                    return winjs_base_1.TPromise.as(true);
                }; };
                var actions = options.map(function (option, index) { return new actions_1.Action('?', option, '', true, callback(index)); });
                onCancel = _this.show(severity, { message: message, actions: actions }, function () { return promise.cancel(); });
            }, function () { return onCancel(); });
            return promise;
        };
        MessageService.prototype.doShowMessageBox = function (opts) {
            opts = this.massageMessageBoxOptions(opts);
            return this.windowService.showMessageBox(opts).then(function (result) { return platform_1.isLinux ? opts.buttons.length - result.button - 1 : result.button; });
        };
        MessageService.prototype.massageMessageBoxOptions = function (opts) {
            opts.buttons = opts.buttons.map(function (button) { return labels_1.mnemonicButtonLabel(button); });
            opts.buttons = platform_1.isLinux ? opts.buttons.reverse() : opts.buttons;
            if (opts.defaultId !== void 0) {
                opts.defaultId = platform_1.isLinux ? opts.buttons.length - opts.defaultId - 1 : opts.defaultId;
            }
            else if (platform_1.isLinux) {
                opts.defaultId = opts.buttons.length - 1; // since we reversed the buttons
            }
            if (opts.cancelId !== void 0) {
                opts.cancelId = platform_1.isLinux ? opts.buttons.length - opts.cancelId - 1 : opts.cancelId;
            }
            opts.noLink = true;
            opts.title = opts.title || product_1.default.nameLong;
            return opts;
        };
        MessageService = __decorate([
            __param(1, windows_1.IWindowService),
            __param(2, telemetry_1.ITelemetryService)
        ], MessageService);
        return MessageService;
    }(messageService_1.WorkbenchMessageService));
    exports.MessageService = MessageService;
});
