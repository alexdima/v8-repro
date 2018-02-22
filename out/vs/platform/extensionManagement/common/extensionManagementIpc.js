/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/common/ipc", "vs/base/common/event"], function (require, exports, ipc_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtensionManagementChannel = /** @class */ (function () {
        function ExtensionManagementChannel(service) {
            this.service = service;
            this.onInstallExtension = event_1.buffer(service.onInstallExtension, true);
            this.onDidInstallExtension = event_1.buffer(service.onDidInstallExtension, true);
            this.onUninstallExtension = event_1.buffer(service.onUninstallExtension, true);
            this.onDidUninstallExtension = event_1.buffer(service.onDidUninstallExtension, true);
        }
        ExtensionManagementChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'event:onInstallExtension': return ipc_1.eventToCall(this.onInstallExtension);
                case 'event:onDidInstallExtension': return ipc_1.eventToCall(this.onDidInstallExtension);
                case 'event:onUninstallExtension': return ipc_1.eventToCall(this.onUninstallExtension);
                case 'event:onDidUninstallExtension': return ipc_1.eventToCall(this.onDidUninstallExtension);
                case 'install': return this.service.install(arg);
                case 'installFromGallery': return this.service.installFromGallery(arg[0]);
                case 'uninstall': return this.service.uninstall(arg[0], arg[1]);
                case 'getInstalled': return this.service.getInstalled(arg);
                case 'updateMetadata': return this.service.updateMetadata(arg[0], arg[1]);
                case 'getExtensionsReport': return this.service.getExtensionsReport();
            }
            return undefined;
        };
        return ExtensionManagementChannel;
    }());
    exports.ExtensionManagementChannel = ExtensionManagementChannel;
    var ExtensionManagementChannelClient = /** @class */ (function () {
        function ExtensionManagementChannelClient(channel) {
            this.channel = channel;
            this._onInstallExtension = ipc_1.eventFromCall(this.channel, 'event:onInstallExtension');
            this._onDidInstallExtension = ipc_1.eventFromCall(this.channel, 'event:onDidInstallExtension');
            this._onUninstallExtension = ipc_1.eventFromCall(this.channel, 'event:onUninstallExtension');
            this._onDidUninstallExtension = ipc_1.eventFromCall(this.channel, 'event:onDidUninstallExtension');
        }
        Object.defineProperty(ExtensionManagementChannelClient.prototype, "onInstallExtension", {
            get: function () { return this._onInstallExtension; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionManagementChannelClient.prototype, "onDidInstallExtension", {
            get: function () { return this._onDidInstallExtension; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionManagementChannelClient.prototype, "onUninstallExtension", {
            get: function () { return this._onUninstallExtension; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionManagementChannelClient.prototype, "onDidUninstallExtension", {
            get: function () { return this._onDidUninstallExtension; },
            enumerable: true,
            configurable: true
        });
        ExtensionManagementChannelClient.prototype.install = function (zipPath) {
            return this.channel.call('install', zipPath);
        };
        ExtensionManagementChannelClient.prototype.installFromGallery = function (extension) {
            return this.channel.call('installFromGallery', [extension]);
        };
        ExtensionManagementChannelClient.prototype.uninstall = function (extension, force) {
            if (force === void 0) { force = false; }
            return this.channel.call('uninstall', [extension, force]);
        };
        ExtensionManagementChannelClient.prototype.getInstalled = function (type) {
            if (type === void 0) { type = null; }
            return this.channel.call('getInstalled', type);
        };
        ExtensionManagementChannelClient.prototype.updateMetadata = function (local, metadata) {
            return this.channel.call('updateMetadata', [local, metadata]);
        };
        ExtensionManagementChannelClient.prototype.getExtensionsReport = function () {
            return this.channel.call('getExtensionsReport');
        };
        return ExtensionManagementChannelClient;
    }());
    exports.ExtensionManagementChannelClient = ExtensionManagementChannelClient;
});
