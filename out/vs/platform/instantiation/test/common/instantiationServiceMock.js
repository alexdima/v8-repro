/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "sinon", "vs/base/common/winjs.base", "vs/base/common/types", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, sinon, winjs_base_1, types, instantiationService_1, serviceCollection_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestInstantiationService = /** @class */ (function (_super) {
        __extends(TestInstantiationService, _super);
        function TestInstantiationService(_serviceCollection) {
            if (_serviceCollection === void 0) { _serviceCollection = new serviceCollection_1.ServiceCollection(); }
            var _this = _super.call(this, _serviceCollection) || this;
            _this._serviceCollection = _serviceCollection;
            _this._servciesMap = new Map();
            return _this;
        }
        TestInstantiationService.prototype.get = function (service) {
            return this._serviceCollection.get(service);
        };
        TestInstantiationService.prototype.set = function (service, instance) {
            return this._serviceCollection.set(service, instance);
        };
        TestInstantiationService.prototype.mock = function (service) {
            return this._create(service, { mock: true });
        };
        TestInstantiationService.prototype.stub = function (serviceIdentifier, arg2, arg3, arg4) {
            var service = typeof arg2 !== 'string' ? arg2 : void 0;
            var serviceMock = { id: serviceIdentifier, service: service };
            var property = typeof arg2 === 'string' ? arg2 : arg3;
            var value = typeof arg2 === 'string' ? arg3 : arg4;
            var stubObject = this._create(serviceMock, { stub: true }, service && !property);
            if (property) {
                if (stubObject[property]) {
                    if (stubObject[property].hasOwnProperty('restore')) {
                        stubObject[property].restore();
                    }
                    if (typeof value === 'function') {
                        stubObject[property] = value;
                    }
                    else {
                        var stub = value ? sinon.stub().returns(value) : sinon.stub();
                        stubObject[property] = stub;
                        return stub;
                    }
                }
                else {
                    stubObject[property] = value;
                }
            }
            return stubObject;
        };
        TestInstantiationService.prototype.stubPromise = function (arg1, arg2, arg3, arg4) {
            arg3 = typeof arg2 === 'string' ? winjs_base_1.TPromise.as(arg3) : arg3;
            arg4 = typeof arg2 !== 'string' && typeof arg3 === 'string' ? winjs_base_1.TPromise.as(arg4) : arg4;
            return this.stub(arg1, arg2, arg3, arg4);
        };
        TestInstantiationService.prototype.spy = function (service, fnProperty) {
            var spy = sinon.spy();
            this.stub(service, fnProperty, spy);
            return spy;
        };
        TestInstantiationService.prototype._create = function (arg1, options, reset) {
            if (reset === void 0) { reset = false; }
            if (this.isServiceMock(arg1)) {
                var service = this._getOrCreateService(arg1, options, reset);
                this._serviceCollection.set(arg1.id, service);
                return service;
            }
            return options.mock ? sinon.mock(arg1) : this._createStub(arg1);
        };
        TestInstantiationService.prototype._getOrCreateService = function (serviceMock, opts, reset) {
            var service = this._serviceCollection.get(serviceMock.id);
            if (!reset && service) {
                if (opts.mock && service['sinonOptions'] && !!service['sinonOptions'].mock) {
                    return service;
                }
                if (opts.stub && service['sinonOptions'] && !!service['sinonOptions'].stub) {
                    return service;
                }
            }
            return this._createService(serviceMock, opts);
        };
        TestInstantiationService.prototype._createService = function (serviceMock, opts) {
            serviceMock.service = serviceMock.service ? serviceMock.service : this._servciesMap.get(serviceMock.id);
            var service = opts.mock ? sinon.mock(serviceMock.service) : this._createStub(serviceMock.service);
            service['sinonOptions'] = opts;
            return service;
        };
        TestInstantiationService.prototype._createStub = function (arg) {
            return typeof arg === 'object' ? arg : sinon.createStubInstance(arg);
        };
        TestInstantiationService.prototype.isServiceMock = function (arg1) {
            return typeof arg1 === 'object' && arg1.hasOwnProperty('id');
        };
        return TestInstantiationService;
    }(instantiationService_1.InstantiationService));
    exports.TestInstantiationService = TestInstantiationService;
    function stubFunction(ctor, fnProperty, value) {
        var stub = sinon.createStubInstance(ctor);
        stub[fnProperty].restore();
        sinon.stub(stub, fnProperty, types.isFunction(value) ? value : function () { return value; });
        return stub;
    }
    exports.stubFunction = stubFunction;
});
