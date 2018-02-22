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
define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/workbench/browser/viewlet", "vs/base/common/types"], function (require, exports, assert, Platform, viewlet_1, Types) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench Viewlet', function () {
        var TestViewlet = /** @class */ (function (_super) {
            __extends(TestViewlet, _super);
            function TestViewlet() {
                return _super.call(this, 'id', null, null) || this;
            }
            TestViewlet.prototype.layout = function (dimension) {
                throw new Error('Method not implemented.');
            };
            return TestViewlet;
        }(viewlet_1.Viewlet));
        test('ViewletDescriptor API', function () {
            var d = new viewlet_1.ViewletDescriptor(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            assert.strictEqual(d.cssClass, 'class');
            assert.strictEqual(d.order, 5);
        });
        test('Editor Aware ViewletDescriptor API', function () {
            var d = new viewlet_1.ViewletDescriptor(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            d = new viewlet_1.ViewletDescriptor(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
        });
        test('Viewlet extension point and registration', function () {
            assert(Types.isFunction(Platform.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet));
            assert(Types.isFunction(Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlet));
            assert(Types.isFunction(Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlets));
            var oldCount = Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlets().length;
            var d = new viewlet_1.ViewletDescriptor(TestViewlet, 'reg-test-id', 'name');
            Platform.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet(d);
            assert(d === Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlet('reg-test-id'));
            assert.equal(oldCount + 1, Platform.Registry.as(viewlet_1.Extensions.Viewlets).getViewlets().length);
        });
    });
});
