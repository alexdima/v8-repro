define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProxyIdentifier = /** @class */ (function () {
        function ProxyIdentifier(isMain, id) {
            this.isMain = isMain;
            this.id = id;
        }
        return ProxyIdentifier;
    }());
    exports.ProxyIdentifier = ProxyIdentifier;
    /**
     * Using `isFancy` indicates that arguments or results of type `URI` or `RegExp`
     * will be serialized/deserialized automatically, but this has a performance cost,
     * as each argument/result must be visited.
     */
    function createMainContextProxyIdentifier(identifier) {
        return new ProxyIdentifier(true, 'm' + identifier);
    }
    exports.createMainContextProxyIdentifier = createMainContextProxyIdentifier;
    function createExtHostContextProxyIdentifier(identifier) {
        return new ProxyIdentifier(false, 'e' + identifier);
    }
    exports.createExtHostContextProxyIdentifier = createExtHostContextProxyIdentifier;
});
