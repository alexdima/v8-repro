define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Source;
    (function (Source) {
        Source[Source["stdout"] = 0] = "stdout";
        Source[Source["stderr"] = 1] = "stderr";
    })(Source = exports.Source || (exports.Source = {}));
    var TerminateResponseCode;
    (function (TerminateResponseCode) {
        TerminateResponseCode[TerminateResponseCode["Success"] = 0] = "Success";
        TerminateResponseCode[TerminateResponseCode["Unknown"] = 1] = "Unknown";
        TerminateResponseCode[TerminateResponseCode["AccessDenied"] = 2] = "AccessDenied";
        TerminateResponseCode[TerminateResponseCode["ProcessNotFound"] = 3] = "ProcessNotFound";
    })(TerminateResponseCode = exports.TerminateResponseCode || (exports.TerminateResponseCode = {}));
});
