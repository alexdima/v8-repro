/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GlobalActivityExtensions = 'workbench.contributions.globalActivities';
    var GlobalActivityRegistry = /** @class */ (function () {
        function GlobalActivityRegistry() {
            this.activityDescriptors = new Set();
        }
        GlobalActivityRegistry.prototype.registerActivity = function (descriptor) {
            this.activityDescriptors.add(descriptor);
        };
        GlobalActivityRegistry.prototype.getActivities = function () {
            var result = [];
            this.activityDescriptors.forEach(function (d) { return result.push(d); });
            return result;
        };
        return GlobalActivityRegistry;
    }());
    exports.GlobalActivityRegistry = GlobalActivityRegistry;
    platform_1.Registry.add(exports.GlobalActivityExtensions, new GlobalActivityRegistry());
});
