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
define(["require", "exports", "vs/base/common/lifecycle", "path", "vs/platform/extensions/common/extensions", "vs/base/node/pfs"], function (require, exports, lifecycle_1, path_1, extensions_1, pfs) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtensionsManifestCache = /** @class */ (function (_super) {
        __extends(ExtensionsManifestCache, _super);
        function ExtensionsManifestCache(environmentService, extensionsManagementServuce) {
            var _this = _super.call(this) || this;
            _this.environmentService = environmentService;
            _this.extensionsManifestCache = path_1.join(_this.environmentService.userDataPath, extensions_1.MANIFEST_CACHE_FOLDER, extensions_1.USER_MANIFEST_CACHE_FILE);
            _this._register(extensionsManagementServuce.onDidInstallExtension(function (e) { return _this.onDidInstallExtension(e); }));
            _this._register(extensionsManagementServuce.onDidUninstallExtension(function (e) { return _this.onDidUnInstallExtension(e); }));
            return _this;
        }
        ExtensionsManifestCache.prototype.onDidInstallExtension = function (e) {
            if (!e.error) {
                this.invalidate();
            }
        };
        ExtensionsManifestCache.prototype.onDidUnInstallExtension = function (e) {
            if (!e.error) {
                this.invalidate();
            }
        };
        ExtensionsManifestCache.prototype.invalidate = function () {
            pfs.del(this.extensionsManifestCache).done(function () { }, function () { });
        };
        return ExtensionsManifestCache;
    }(lifecycle_1.Disposable));
    exports.ExtensionsManifestCache = ExtensionsManifestCache;
});
