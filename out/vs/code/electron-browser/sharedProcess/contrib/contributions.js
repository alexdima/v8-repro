define(["require", "exports", "vs/code/electron-browser/sharedProcess/contrib/nodeCachedDataCleaner", "vs/base/common/lifecycle"], function (require, exports, nodeCachedDataCleaner_1, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createSharedProcessContributions(service) {
        return lifecycle_1.combinedDisposable([
            service.createInstance(nodeCachedDataCleaner_1.NodeCachedDataCleaner),
        ]);
    }
    exports.createSharedProcessContributions = createSharedProcessContributions;
});
