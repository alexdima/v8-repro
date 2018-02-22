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
define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/workbench/services/progress/browser/progressService", "vs/base/common/event"], function (require, exports, assert, winjs_base_1, progressService_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var activeViewlet = {};
    var TestViewletService = /** @class */ (function () {
        function TestViewletService() {
            this.onDidViewletOpenEmitter = new event_1.Emitter();
            this.onDidViewletCloseEmitter = new event_1.Emitter();
            this.onDidViewletOpen = this.onDidViewletOpenEmitter.event;
            this.onDidViewletClose = this.onDidViewletCloseEmitter.event;
        }
        TestViewletService.prototype.openViewlet = function (id, focus) {
            return winjs_base_1.TPromise.as(null);
        };
        TestViewletService.prototype.getViewlets = function () {
            return [];
        };
        TestViewletService.prototype.getActiveViewlet = function () {
            return activeViewlet;
        };
        TestViewletService.prototype.dispose = function () {
        };
        TestViewletService.prototype.getDefaultViewletId = function () {
            return 'workbench.view.explorer';
        };
        TestViewletService.prototype.getViewlet = function (id) {
            return null;
        };
        TestViewletService.prototype.getProgressIndicator = function (id) {
            return null;
        };
        return TestViewletService;
    }());
    var TestPanelService = /** @class */ (function () {
        function TestPanelService() {
            this.onDidPanelOpen = new event_1.Emitter().event;
            this.onDidPanelClose = new event_1.Emitter().event;
        }
        TestPanelService.prototype.openPanel = function (id, focus) {
            return winjs_base_1.TPromise.as(null);
        };
        TestPanelService.prototype.getPanels = function () {
            return [];
        };
        TestPanelService.prototype.getActivePanel = function () {
            return activeViewlet;
        };
        TestPanelService.prototype.dispose = function () {
        };
        return TestPanelService;
    }());
    var TestViewlet = /** @class */ (function () {
        function TestViewlet(id) {
            this.id = id;
        }
        TestViewlet.prototype.getId = function () {
            return this.id;
        };
        /**
         * Returns the name of this composite to show in the title area.
         */
        TestViewlet.prototype.getTitle = function () {
            return this.id;
        };
        /**
         * Returns the primary actions of the composite.
         */
        TestViewlet.prototype.getActions = function () {
            return [];
        };
        /**
         * Returns the secondary actions of the composite.
         */
        TestViewlet.prototype.getSecondaryActions = function () {
            return [];
        };
        /**
         * Returns an array of actions to show in the context menu of the composite
         */
        TestViewlet.prototype.getContextMenuActions = function () {
            return [];
        };
        /**
         * Returns the action item for a specific action.
         */
        TestViewlet.prototype.getActionItem = function (action) {
            return null;
        };
        /**
         * Returns the underlying control of this composite.
         */
        TestViewlet.prototype.getControl = function () {
            return null;
        };
        /**
         * Asks the underlying control to focus.
         */
        TestViewlet.prototype.focus = function () {
        };
        TestViewlet.prototype.getOptimalWidth = function () {
            return 10;
        };
        return TestViewlet;
    }());
    var TestScopedService = /** @class */ (function (_super) {
        __extends(TestScopedService, _super);
        function TestScopedService(viewletService, panelService, scopeId) {
            return _super.call(this, viewletService, panelService, scopeId) || this;
        }
        TestScopedService.prototype.onScopeActivated = function () {
            this.isActive = true;
        };
        TestScopedService.prototype.onScopeDeactivated = function () {
            this.isActive = false;
        };
        return TestScopedService;
    }(progressService_1.ScopedService));
    var TestProgressBar = /** @class */ (function () {
        function TestProgressBar() {
        }
        TestProgressBar.prototype.infinite = function () {
            this.fDone = null;
            this.fInfinite = true;
            return this;
        };
        TestProgressBar.prototype.total = function (total) {
            this.fDone = null;
            this.fTotal = total;
            return this;
        };
        TestProgressBar.prototype.hasTotal = function () {
            return !!this.fTotal;
        };
        TestProgressBar.prototype.worked = function (worked) {
            this.fDone = null;
            if (this.fWorked) {
                this.fWorked += worked;
            }
            else {
                this.fWorked = worked;
            }
            return this;
        };
        TestProgressBar.prototype.done = function () {
            this.fDone = true;
            this.fInfinite = null;
            this.fWorked = null;
            this.fTotal = null;
            return this;
        };
        TestProgressBar.prototype.stop = function () {
            return this.done();
        };
        TestProgressBar.prototype.getContainer = function () {
            return {
                show: function () { },
                hide: function () { }
            };
        };
        return TestProgressBar;
    }());
    suite('Progress Service', function () {
        test('ScopedService', function () {
            var viewletService = new TestViewletService();
            var panelService = new TestPanelService();
            var service = new TestScopedService(viewletService, panelService, 'test.scopeId');
            var testViewlet = new TestViewlet('test.scopeId');
            assert(!service.isActive);
            viewletService.onDidViewletOpenEmitter.fire(testViewlet);
            assert(service.isActive);
            viewletService.onDidViewletCloseEmitter.fire(testViewlet);
            assert(!service.isActive);
        });
        test('WorkbenchProgressService', function () {
            var testProgressBar = new TestProgressBar();
            var viewletService = new TestViewletService();
            var panelService = new TestPanelService();
            var service = new progressService_1.WorkbenchProgressService(testProgressBar, 'test.scopeId', true, viewletService, panelService);
            // Active: Show (Infinite)
            var fn = service.show(true);
            assert.strictEqual(true, testProgressBar.fInfinite);
            fn.done();
            assert.strictEqual(true, testProgressBar.fDone);
            // Active: Show (Total / Worked)
            fn = service.show(100);
            assert.strictEqual(false, !!testProgressBar.fInfinite);
            assert.strictEqual(100, testProgressBar.fTotal);
            fn.worked(20);
            assert.strictEqual(20, testProgressBar.fWorked);
            fn.total(80);
            assert.strictEqual(80, testProgressBar.fTotal);
            fn.done();
            assert.strictEqual(true, testProgressBar.fDone);
            // Inactive: Show (Infinite)
            var testViewlet = new TestViewlet('test.scopeId');
            viewletService.onDidViewletCloseEmitter.fire(testViewlet);
            service.show(true);
            assert.strictEqual(false, !!testProgressBar.fInfinite);
            viewletService.onDidViewletOpenEmitter.fire(testViewlet);
            assert.strictEqual(true, testProgressBar.fInfinite);
            // Inactive: Show (Total / Worked)
            viewletService.onDidViewletCloseEmitter.fire(testViewlet);
            fn = service.show(100);
            fn.total(80);
            fn.worked(20);
            assert.strictEqual(false, !!testProgressBar.fTotal);
            viewletService.onDidViewletOpenEmitter.fire(testViewlet);
            assert.strictEqual(20, testProgressBar.fWorked);
            assert.strictEqual(80, testProgressBar.fTotal);
            // Acive: Show While
            var p = winjs_base_1.TPromise.as(null);
            service.showWhile(p).then(function () {
                assert.strictEqual(true, testProgressBar.fDone);
                viewletService.onDidViewletCloseEmitter.fire(testViewlet);
                p = winjs_base_1.TPromise.as(null);
                service.showWhile(p).then(function () {
                    assert.strictEqual(true, testProgressBar.fDone);
                    viewletService.onDidViewletOpenEmitter.fire(testViewlet);
                    assert.strictEqual(true, testProgressBar.fDone);
                });
            });
        });
    });
});
