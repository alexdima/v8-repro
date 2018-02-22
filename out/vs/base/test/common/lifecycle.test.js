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
define(["require", "exports", "assert", "vs/base/common/lifecycle"], function (require, exports, assert, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Disposable = /** @class */ (function () {
        function Disposable() {
            this.isDisposed = false;
        }
        Disposable.prototype.dispose = function () { this.isDisposed = true; };
        return Disposable;
    }());
    suite('Lifecycle', function () {
        test('dispose single disposable', function () {
            var disposable = new Disposable();
            assert(!disposable.isDisposed);
            lifecycle_1.dispose(disposable);
            assert(disposable.isDisposed);
        });
        test('dispose disposable array', function () {
            var disposable = new Disposable();
            var disposable2 = new Disposable();
            assert(!disposable.isDisposed);
            assert(!disposable2.isDisposed);
            lifecycle_1.dispose([disposable, disposable2]);
            assert(disposable.isDisposed);
            assert(disposable2.isDisposed);
        });
        test('dispose disposables', function () {
            var disposable = new Disposable();
            var disposable2 = new Disposable();
            assert(!disposable.isDisposed);
            assert(!disposable2.isDisposed);
            lifecycle_1.dispose(disposable, disposable2);
            assert(disposable.isDisposed);
            assert(disposable2.isDisposed);
        });
    });
    suite('Reference Collection', function () {
        var Collection = /** @class */ (function (_super) {
            __extends(Collection, _super);
            function Collection() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this._count = 0;
                return _this;
            }
            Object.defineProperty(Collection.prototype, "count", {
                get: function () { return this._count; },
                enumerable: true,
                configurable: true
            });
            Collection.prototype.createReferencedObject = function (key) { this._count++; return key.length; };
            Collection.prototype.destroyReferencedObject = function (object) { this._count--; };
            return Collection;
        }(lifecycle_1.ReferenceCollection));
        test('simple', function () {
            var collection = new Collection();
            var ref1 = collection.acquire('test');
            assert(ref1);
            assert.equal(ref1.object, 4);
            assert.equal(collection.count, 1);
            ref1.dispose();
            assert.equal(collection.count, 0);
            var ref2 = collection.acquire('test');
            var ref3 = collection.acquire('test');
            assert.equal(ref2.object, ref3.object);
            assert.equal(collection.count, 1);
            var ref4 = collection.acquire('monkey');
            assert.equal(ref4.object, 6);
            assert.equal(collection.count, 2);
            ref2.dispose();
            assert.equal(collection.count, 2);
            ref3.dispose();
            assert.equal(collection.count, 1);
            ref4.dispose();
            assert.equal(collection.count, 0);
        });
    });
});
