/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/platform/node/product", "electron", "vs/base/common/uri"], function (require, exports, event_1, product_1, electron_1, uri_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var URLService = /** @class */ (function () {
        function URLService(initial) {
            if (initial === void 0) { initial = []; }
            this.openUrlEmitter = new event_1.Emitter();
            var globalBuffer = (global.getOpenUrls() || []);
            var initialBuffer = (typeof initial === 'string' ? [initial] : initial).concat(globalBuffer);
            electron_1.app.setAsDefaultProtocolClient(product_1.default.urlProtocol, process.execPath, ['--open-url', '--']);
            var rawOnOpenUrl = event_1.fromNodeEventEmitter(electron_1.app, 'open-url', function (event, url) { return ({ event: event, url: url }); });
            // always prevent default and return the url as string
            var preventedOnOpenUrl = event_1.mapEvent(rawOnOpenUrl, function (_a) {
                var event = _a.event, url = _a.url;
                event.preventDefault();
                return url;
            });
            // echo all `onOpenUrl` events to each listener
            var bufferedOnOpenUrl = event_1.echo(preventedOnOpenUrl, true, initialBuffer);
            this.onOpenURL = event_1.chain(event_1.anyEvent(bufferedOnOpenUrl, this.openUrlEmitter.event))
                .map(function (url) {
                try {
                    return uri_1.default.parse(url);
                }
                catch (e) {
                    return null;
                }
            })
                .filter(function (uri) { return !!uri; })
                .event;
        }
        URLService.prototype.open = function (url) {
            this.openUrlEmitter.fire(url);
        };
        return URLService;
    }());
    exports.URLService = URLService;
});
