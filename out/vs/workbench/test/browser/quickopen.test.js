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
define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/platform/registry/common/platform", "vs/workbench/browser/quickopen", "vs/workbench/browser/parts/editor/editor.contribution"], function (require, exports, assert, winjs_base_1, platform_1, quickopen_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestQuickOpenService = /** @class */ (function () {
        function TestQuickOpenService(callback) {
            this.callback = callback;
        }
        TestQuickOpenService.prototype.pick = function (arg, options, token) {
            return winjs_base_1.TPromise.as(null);
        };
        TestQuickOpenService.prototype.input = function (options, token) {
            return winjs_base_1.TPromise.as(null);
        };
        TestQuickOpenService.prototype.accept = function () {
        };
        TestQuickOpenService.prototype.focus = function () {
        };
        TestQuickOpenService.prototype.close = function () {
        };
        TestQuickOpenService.prototype.show = function (prefix, options) {
            if (this.callback) {
                this.callback(prefix);
            }
            return winjs_base_1.TPromise.as(true);
        };
        Object.defineProperty(TestQuickOpenService.prototype, "onShow", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestQuickOpenService.prototype, "onHide", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        TestQuickOpenService.prototype.dispose = function () { };
        TestQuickOpenService.prototype.navigate = function () { };
        return TestQuickOpenService;
    }());
    exports.TestQuickOpenService = TestQuickOpenService;
    suite('Workbench QuickOpen', function () {
        var TestHandler = /** @class */ (function (_super) {
            __extends(TestHandler, _super);
            function TestHandler() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return TestHandler;
        }(quickopen_1.QuickOpenHandler));
        test('QuickOpen Handler and Registry', function () {
            var registry = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
            var handler = new quickopen_1.QuickOpenHandlerDescriptor(TestHandler, 'testhandler', ',', 'Handler', null);
            registry.registerQuickOpenHandler(handler);
            assert(registry.getQuickOpenHandler(',') === handler);
            var handlers = registry.getQuickOpenHandlers();
            assert(handlers.some(function (handler) { return handler.prefix === ','; }));
        });
        test('QuickOpen Action', function () {
            var defaultAction = new quickopen_1.QuickOpenAction('id', 'label', void 0, new TestQuickOpenService(function (prefix) { return assert(!prefix); }));
            var prefixAction = new quickopen_1.QuickOpenAction('id', 'label', ',', new TestQuickOpenService(function (prefix) { return assert(!!prefix); }));
            defaultAction.run();
            prefixAction.run();
        });
    });
});
