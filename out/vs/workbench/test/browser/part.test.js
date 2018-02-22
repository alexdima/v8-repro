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
define(["require", "exports", "assert", "vs/base/browser/builder", "vs/workbench/browser/part", "vs/base/common/types", "vs/platform/storage/common/storageService", "vs/platform/theme/test/common/testThemeService", "vs/platform/workspace/test/common/testWorkspace"], function (require, exports, assert, builder_1, part_1, Types, storageService_1, testThemeService_1, testWorkspace_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MyPart = /** @class */ (function (_super) {
        __extends(MyPart, _super);
        function MyPart(expectedParent) {
            var _this = _super.call(this, 'myPart', { hasTitle: true }, new testThemeService_1.TestThemeService()) || this;
            _this.expectedParent = expectedParent;
            return _this;
        }
        MyPart.prototype.createTitleArea = function (parent) {
            assert.strictEqual(parent, this.expectedParent);
            return _super.prototype.createTitleArea.call(this, parent);
        };
        MyPart.prototype.createContentArea = function (parent) {
            assert.strictEqual(parent, this.expectedParent);
            return _super.prototype.createContentArea.call(this, parent);
        };
        MyPart.prototype.getMemento = function (storageService) {
            return _super.prototype.getMemento.call(this, storageService);
        };
        return MyPart;
    }(part_1.Part));
    var MyPart2 = /** @class */ (function (_super) {
        __extends(MyPart2, _super);
        function MyPart2() {
            return _super.call(this, 'myPart2', { hasTitle: true }, new testThemeService_1.TestThemeService()) || this;
        }
        MyPart2.prototype.createTitleArea = function (parent) {
            return parent.div(function (div) {
                div.span({
                    id: 'myPart.title',
                    innerHtml: 'Title'
                });
            });
        };
        MyPart2.prototype.createContentArea = function (parent) {
            return parent.div(function (div) {
                div.span({
                    id: 'myPart.content',
                    innerHtml: 'Content'
                });
            });
        };
        return MyPart2;
    }(part_1.Part));
    var MyPart3 = /** @class */ (function (_super) {
        __extends(MyPart3, _super);
        function MyPart3() {
            return _super.call(this, 'myPart2', { hasTitle: false }, new testThemeService_1.TestThemeService()) || this;
        }
        MyPart3.prototype.createTitleArea = function (parent) {
            return null;
        };
        MyPart3.prototype.createContentArea = function (parent) {
            return parent.div(function (div) {
                div.span({
                    id: 'myPart.content',
                    innerHtml: 'Content'
                });
            });
        };
        return MyPart3;
    }(part_1.Part));
    suite('Workbench Part', function () {
        var fixture;
        var fixtureId = 'workbench-part-fixture';
        var storage;
        setup(function () {
            fixture = document.createElement('div');
            fixture.id = fixtureId;
            document.body.appendChild(fixture);
            storage = new storageService_1.StorageService(new storageService_1.InMemoryLocalStorage(), null, testWorkspace_1.TestWorkspace.id);
        });
        teardown(function () {
            document.body.removeChild(fixture);
        });
        test('Creation', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div().hide();
            var part = new MyPart(b);
            part.create(b);
            assert.strictEqual(part.getId(), 'myPart');
            assert.strictEqual(part.getContainer(), b);
            // Memento
            var memento = part.getMemento(storage);
            assert(memento);
            memento.foo = 'bar';
            memento.bar = [1, 2, 3];
            part.shutdown();
            // Re-Create to assert memento contents
            part = new MyPart(b);
            memento = part.getMemento(storage);
            assert(memento);
            assert.strictEqual(memento.foo, 'bar');
            assert.strictEqual(memento.bar.length, 3);
            // Empty Memento stores empty object
            delete memento.foo;
            delete memento.bar;
            part.shutdown();
            part = new MyPart(b);
            memento = part.getMemento(storage);
            assert(memento);
            assert.strictEqual(Types.isEmptyObject(memento), true);
        });
        test('Part Layout with Title and Content', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div().hide();
            var part = new MyPart2();
            part.create(b);
            assert(builder_1.Build.withElementById('myPart.title'));
            assert(builder_1.Build.withElementById('myPart.content'));
        });
        test('Part Layout with Content only', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div().hide();
            var part = new MyPart3();
            part.create(b);
            assert(!builder_1.Build.withElementById('myPart.title'));
            assert(builder_1.Build.withElementById('myPart.content'));
        });
    });
});
