define(["require", "exports", "vs/base/common/winjs.base", "vs/platform/instantiation/common/instantiation"], function (require, exports, winjs_base_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IOpenerService = instantiation_1.createDecorator('openerService');
    exports.NullOpenerService = Object.freeze({
        _serviceBrand: undefined,
        open: function () { return winjs_base_1.TPromise.as(undefined); }
    });
});
