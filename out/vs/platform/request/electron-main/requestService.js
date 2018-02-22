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
define(["require", "exports", "vs/base/node/request", "vs/platform/request/node/requestService", "vs/base/common/objects", "electron"], function (require, exports, request_1, requestService_1, objects_1, electron_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getRawRequest(options) {
        return electron_1.net.request;
    }
    var RequestService = /** @class */ (function (_super) {
        __extends(RequestService, _super);
        function RequestService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RequestService.prototype.request = function (options) {
            return _super.prototype.request.call(this, options, function (options) { return request_1.request(objects_1.assign({}, options || {}, { getRawRequest: getRawRequest })); });
        };
        return RequestService;
    }(requestService_1.RequestService));
    exports.RequestService = RequestService;
});
