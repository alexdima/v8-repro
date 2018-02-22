/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SearchChannel = /** @class */ (function () {
        function SearchChannel(service) {
            this.service = service;
        }
        SearchChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'fileSearch': return this.service.fileSearch(arg);
                case 'textSearch': return this.service.textSearch(arg);
                case 'clearCache': return this.service.clearCache(arg);
                case 'fetchTelemetry': return this.service.fetchTelemetry();
            }
            return undefined;
        };
        return SearchChannel;
    }());
    exports.SearchChannel = SearchChannel;
    var SearchChannelClient = /** @class */ (function () {
        function SearchChannelClient(channel) {
            this.channel = channel;
        }
        SearchChannelClient.prototype.fileSearch = function (search) {
            return this.channel.call('fileSearch', search);
        };
        SearchChannelClient.prototype.textSearch = function (search) {
            return this.channel.call('textSearch', search);
        };
        SearchChannelClient.prototype.clearCache = function (cacheKey) {
            return this.channel.call('clearCache', cacheKey);
        };
        SearchChannelClient.prototype.fetchTelemetry = function () {
            return this.channel.call('fetchTelemetry');
        };
        return SearchChannelClient;
    }());
    exports.SearchChannelClient = SearchChannelClient;
});
