var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/base/common/winjs.base", "path", "vs/base/node/pfs", "vs/platform/environment/common/environment", "vs/platform/node/product"], function (require, exports, lifecycle_1, errors_1, winjs_base_1, path_1, pfs_1, environment_1, product_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var NodeCachedDataCleaner = /** @class */ (function () {
        function NodeCachedDataCleaner(_environmentService) {
            this._environmentService = _environmentService;
            this._disposables = [];
            this._manageCachedDataSoon();
        }
        NodeCachedDataCleaner.prototype.dispose = function () {
            this._disposables = lifecycle_1.dispose(this._disposables);
        };
        NodeCachedDataCleaner.prototype._manageCachedDataSoon = function () {
            // Cached data is stored as user data and we run a cleanup task everytime
            // the editor starts. The strategy is to delete all files that are older than
            // 3 months (1 week respectively)
            if (!this._environmentService.nodeCachedDataDir) {
                return;
            }
            // The folder which contains folders of cached data. Each of these folder is per
            // version
            var nodeCachedDataRootDir = path_1.dirname(this._environmentService.nodeCachedDataDir);
            var nodeCachedDataCurrent = path_1.basename(this._environmentService.nodeCachedDataDir);
            var handle = setTimeout(function () {
                handle = undefined;
                pfs_1.readdir(nodeCachedDataRootDir).then(function (entries) {
                    var now = Date.now();
                    var deletes = [];
                    entries.forEach(function (entry) {
                        // name check
                        // * not the current cached data folder
                        if (entry !== nodeCachedDataCurrent) {
                            var path_2 = path_1.join(nodeCachedDataRootDir, entry);
                            deletes.push(pfs_1.stat(path_2).then(function (stats) {
                                // stat check
                                // * only directories
                                // * only when old enough
                                if (stats.isDirectory()) {
                                    var diff = now - stats.mtime.getTime();
                                    if (diff > NodeCachedDataCleaner._DataMaxAge) {
                                        return pfs_1.rimraf(path_2);
                                    }
                                }
                                return undefined;
                            }));
                        }
                    });
                    return winjs_base_1.TPromise.join(deletes);
                }).done(undefined, errors_1.onUnexpectedError);
            }, 30 * 1000);
            this._disposables.push({
                dispose: function () { clearTimeout(handle); }
            });
        };
        NodeCachedDataCleaner._DataMaxAge = product_1.default.nameLong.indexOf('Insiders') >= 0
            ? 1000 * 60 * 60 * 24 * 7 // roughly 1 week
            : 1000 * 60 * 60 * 24 * 30 * 3; // roughly 3 months
        NodeCachedDataCleaner = __decorate([
            __param(0, environment_1.IEnvironmentService)
        ], NodeCachedDataCleaner);
        return NodeCachedDataCleaner;
    }());
    exports.NodeCachedDataCleaner = NodeCachedDataCleaner;
});
