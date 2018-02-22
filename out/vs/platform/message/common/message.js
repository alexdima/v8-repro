define(["require", "exports", "vs/nls", "vs/base/common/paths", "vs/base/common/winjs.base", "vs/base/common/severity", "vs/platform/instantiation/common/instantiation", "vs/base/common/actions"], function (require, exports, nls, paths, winjs_base_1, severity_1, instantiation_1, actions_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CloseAction = new actions_1.Action('close.message', nls.localize('close', "Close"), null, true, function () { return winjs_base_1.TPromise.as(true); });
    exports.LaterAction = new actions_1.Action('later.message', nls.localize('later', "Later"), null, true, function () { return winjs_base_1.TPromise.as(true); });
    exports.CancelAction = new actions_1.Action('cancel.message', nls.localize('cancel', "Cancel"), null, true, function () { return winjs_base_1.TPromise.as(true); });
    exports.IMessageService = instantiation_1.createDecorator('messageService');
    var MAX_CONFIRM_FILES = 10;
    function getConfirmMessage(start, resourcesToConfirm) {
        var message = [start];
        message.push('');
        message.push.apply(message, resourcesToConfirm.slice(0, MAX_CONFIRM_FILES).map(function (r) { return paths.basename(r.fsPath); }));
        if (resourcesToConfirm.length > MAX_CONFIRM_FILES) {
            if (resourcesToConfirm.length - MAX_CONFIRM_FILES === 1) {
                message.push(nls.localize('moreFile', "...1 additional file not shown"));
            }
            else {
                message.push(nls.localize('moreFiles', "...{0} additional files not shown", resourcesToConfirm.length - MAX_CONFIRM_FILES));
            }
        }
        message.push('');
        return message.join('\n');
    }
    exports.getConfirmMessage = getConfirmMessage;
    exports.IChoiceService = instantiation_1.createDecorator('choiceService');
    exports.Severity = severity_1.default;
});
