/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "assert", "vs/base/common/decorators"], function (require, exports, assert, decorators_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Decorators', function () {
        test('memoize should memoize methods', function () {
            var Foo = /** @class */ (function () {
                function Foo(_answer) {
                    this._answer = _answer;
                    this.count = 0;
                }
                Foo.prototype.answer = function () {
                    this.count++;
                    return this._answer;
                };
                __decorate([
                    decorators_1.memoize
                ], Foo.prototype, "answer", null);
                return Foo;
            }());
            var foo = new Foo(42);
            assert.equal(foo.count, 0);
            assert.equal(foo.answer(), 42);
            assert.equal(foo.count, 1);
            assert.equal(foo.answer(), 42);
            assert.equal(foo.count, 1);
            var foo2 = new Foo(1337);
            assert.equal(foo2.count, 0);
            assert.equal(foo2.answer(), 1337);
            assert.equal(foo2.count, 1);
            assert.equal(foo2.answer(), 1337);
            assert.equal(foo2.count, 1);
            assert.equal(foo.answer(), 42);
            assert.equal(foo.count, 1);
            var foo3 = new Foo(null);
            assert.equal(foo3.count, 0);
            assert.equal(foo3.answer(), null);
            assert.equal(foo3.count, 1);
            assert.equal(foo3.answer(), null);
            assert.equal(foo3.count, 1);
            var foo4 = new Foo(undefined);
            assert.equal(foo4.count, 0);
            assert.equal(foo4.answer(), undefined);
            assert.equal(foo4.count, 1);
            assert.equal(foo4.answer(), undefined);
            assert.equal(foo4.count, 1);
        });
        test('memoize should memoize getters', function () {
            var Foo = /** @class */ (function () {
                function Foo(_answer) {
                    this._answer = _answer;
                    this.count = 0;
                }
                Object.defineProperty(Foo.prototype, "answer", {
                    get: function () {
                        this.count++;
                        return this._answer;
                    },
                    enumerable: true,
                    configurable: true
                });
                __decorate([
                    decorators_1.memoize
                ], Foo.prototype, "answer", null);
                return Foo;
            }());
            var foo = new Foo(42);
            assert.equal(foo.count, 0);
            assert.equal(foo.answer, 42);
            assert.equal(foo.count, 1);
            assert.equal(foo.answer, 42);
            assert.equal(foo.count, 1);
            var foo2 = new Foo(1337);
            assert.equal(foo2.count, 0);
            assert.equal(foo2.answer, 1337);
            assert.equal(foo2.count, 1);
            assert.equal(foo2.answer, 1337);
            assert.equal(foo2.count, 1);
            assert.equal(foo.answer, 42);
            assert.equal(foo.count, 1);
            var foo3 = new Foo(null);
            assert.equal(foo3.count, 0);
            assert.equal(foo3.answer, null);
            assert.equal(foo3.count, 1);
            assert.equal(foo3.answer, null);
            assert.equal(foo3.count, 1);
            var foo4 = new Foo(undefined);
            assert.equal(foo4.count, 0);
            assert.equal(foo4.answer, undefined);
            assert.equal(foo4.count, 1);
            assert.equal(foo4.answer, undefined);
            assert.equal(foo4.count, 1);
        });
        test('memoized property should not be enumerable', function () {
            var Foo = /** @class */ (function () {
                function Foo() {
                }
                Object.defineProperty(Foo.prototype, "answer", {
                    get: function () { return 42; },
                    enumerable: true,
                    configurable: true
                });
                __decorate([
                    decorators_1.memoize
                ], Foo.prototype, "answer", null);
                return Foo;
            }());
            var foo = new Foo();
            assert.equal(foo.answer, 42);
            assert(!Object.keys(foo).some(function (k) { return /\$memoize\$/.test(k); }));
        });
        test('memoized property should not be writable', function () {
            var Foo = /** @class */ (function () {
                function Foo() {
                }
                Object.defineProperty(Foo.prototype, "answer", {
                    get: function () { return 42; },
                    enumerable: true,
                    configurable: true
                });
                __decorate([
                    decorators_1.memoize
                ], Foo.prototype, "answer", null);
                return Foo;
            }());
            var foo = new Foo();
            assert.equal(foo.answer, 42);
            try {
                foo['$memoize$answer'] = 1337;
                assert(false);
            }
            catch (e) {
                assert.equal(foo.answer, 42);
            }
        });
    });
});
