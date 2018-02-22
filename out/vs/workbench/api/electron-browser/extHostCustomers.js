/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function extHostNamedCustomer(id) {
        return function (ctor) {
            ExtHostCustomersRegistryImpl.INSTANCE.registerNamedCustomer(id, ctor);
        };
    }
    exports.extHostNamedCustomer = extHostNamedCustomer;
    function extHostCustomer(ctor) {
        ExtHostCustomersRegistryImpl.INSTANCE.registerCustomer(ctor);
    }
    exports.extHostCustomer = extHostCustomer;
    var ExtHostCustomersRegistry;
    (function (ExtHostCustomersRegistry) {
        function getNamedCustomers() {
            return ExtHostCustomersRegistryImpl.INSTANCE.getNamedCustomers();
        }
        ExtHostCustomersRegistry.getNamedCustomers = getNamedCustomers;
        function getCustomers() {
            return ExtHostCustomersRegistryImpl.INSTANCE.getCustomers();
        }
        ExtHostCustomersRegistry.getCustomers = getCustomers;
    })(ExtHostCustomersRegistry = exports.ExtHostCustomersRegistry || (exports.ExtHostCustomersRegistry = {}));
    var ExtHostCustomersRegistryImpl = /** @class */ (function () {
        function ExtHostCustomersRegistryImpl() {
            this._namedCustomers = [];
            this._customers = [];
        }
        ExtHostCustomersRegistryImpl.prototype.registerNamedCustomer = function (id, ctor) {
            var entry = [id, ctor];
            this._namedCustomers.push(entry);
        };
        ExtHostCustomersRegistryImpl.prototype.getNamedCustomers = function () {
            return this._namedCustomers;
        };
        ExtHostCustomersRegistryImpl.prototype.registerCustomer = function (ctor) {
            this._customers.push(ctor);
        };
        ExtHostCustomersRegistryImpl.prototype.getCustomers = function () {
            return this._customers;
        };
        ExtHostCustomersRegistryImpl.INSTANCE = new ExtHostCustomersRegistryImpl();
        return ExtHostCustomersRegistryImpl;
    }());
});
