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
define(["require", "exports", "vs/base/common/winjs.base", "stream", "vs/platform/request/node/requestService"], function (require, exports, winjs_base_1, stream_1, requestService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This service exposes the `request` API, while using the global
     * or configured proxy settings.
     */
    var RequestService = /** @class */ (function (_super) {
        __extends(RequestService, _super);
        function RequestService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RequestService.prototype.request = function (options) {
            return _super.prototype.request.call(this, options, exports.xhrRequest);
        };
        return RequestService;
    }(requestService_1.RequestService));
    exports.RequestService = RequestService;
    exports.xhrRequest = function (options) {
        var xhr = new XMLHttpRequest();
        return new winjs_base_1.TPromise(function (resolve, reject) {
            xhr.open(options.type || 'GET', options.url, true, options.user, options.password);
            setRequestHeaders(xhr, options);
            xhr.responseType = 'arraybuffer';
            xhr.onerror = function (e) { return reject(new Error(xhr.statusText && ('XHR failed: ' + xhr.statusText))); };
            xhr.onload = function (e) {
                resolve({
                    res: {
                        statusCode: xhr.status,
                        headers: getResponseHeaders(xhr)
                    },
                    stream: new /** @class */ (function (_super) {
                        __extends(ArrayBufferStream, _super);
                        function ArrayBufferStream(arraybuffer) {
                            var _this = _super.call(this) || this;
                            _this._buffer = new Buffer(new Uint8Array(arraybuffer));
                            _this._offset = 0;
                            _this._length = _this._buffer.length;
                            return _this;
                        }
                        ArrayBufferStream.prototype._read = function (size) {
                            if (this._offset < this._length) {
                                this.push(this._buffer.slice(this._offset, (this._offset + size)));
                                this._offset += size;
                            }
                            else {
                                this.push(null);
                            }
                        };
                        return ArrayBufferStream;
                    }(stream_1.Readable))(xhr.response)
                });
            };
            xhr.ontimeout = function (e) { return reject(new Error("XHR timeout: " + options.timeout + "ms")); };
            if (options.timeout) {
                xhr.timeout = options.timeout;
            }
            xhr.send(options.data);
            return null;
        }, function () {
            // cancel
            xhr.abort();
        });
    };
    function setRequestHeaders(xhr, options) {
        if (options.headers) {
            outer: for (var k in options.headers) {
                switch (k) {
                    case 'User-Agent':
                    case 'Accept-Encoding':
                    case 'Content-Length':
                        // unsafe headers
                        continue outer;
                }
                xhr.setRequestHeader(k, options.headers[k]);
            }
        }
    }
    function getResponseHeaders(xhr) {
        var headers = Object.create(null);
        for (var _i = 0, _a = xhr.getAllResponseHeaders().split(/\r\n|\n|\r/g); _i < _a.length; _i++) {
            var line = _a[_i];
            if (line) {
                var idx = line.indexOf(':');
                headers[line.substr(0, idx).trim().toLowerCase()] = line.substr(idx + 1).trim();
            }
        }
        return headers;
    }
});
