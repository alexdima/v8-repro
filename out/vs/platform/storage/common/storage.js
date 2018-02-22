define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ID = 'storageService';
    exports.IStorageService = instantiation_1.createDecorator(exports.ID);
    var StorageScope;
    (function (StorageScope) {
        /**
         * The stored data will be scoped to all workspaces of this domain.
         */
        StorageScope[StorageScope["GLOBAL"] = 0] = "GLOBAL";
        /**
         * The stored data will be scoped to the current workspace.
         */
        StorageScope[StorageScope["WORKSPACE"] = 1] = "WORKSPACE";
    })(StorageScope = exports.StorageScope || (exports.StorageScope = {}));
    exports.NullStorageService = {
        _serviceBrand: undefined,
        store: function () { return undefined; },
        remove: function () { return undefined; },
        get: function (a, b, defaultValue) { return defaultValue; },
        getInteger: function (a, b, defaultValue) { return defaultValue; },
        getBoolean: function (a, b, defaultValue) { return defaultValue; }
    };
});
