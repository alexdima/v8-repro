/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/browser/ui/splitview/splitview"], function (require, exports, assert, event_1, splitview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestView = /** @class */ (function () {
        function TestView(_minimumSize, _maximumSize) {
            this._minimumSize = _minimumSize;
            this._maximumSize = _maximumSize;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._onDidRender = new event_1.Emitter();
            this.onDidRender = this._onDidRender.event;
            this._size = 0;
            this._onDidLayout = new event_1.Emitter();
            this.onDidLayout = this._onDidLayout.event;
            this._onDidFocus = new event_1.Emitter();
            this.onDidFocus = this._onDidFocus.event;
            assert(_minimumSize <= _maximumSize, 'splitview view minimum size must be <= maximum size');
        }
        Object.defineProperty(TestView.prototype, "minimumSize", {
            get: function () { return this._minimumSize; },
            set: function (size) { this._minimumSize = size; this._onDidChange.fire(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestView.prototype, "maximumSize", {
            get: function () { return this._maximumSize; },
            set: function (size) { this._maximumSize = size; this._onDidChange.fire(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestView.prototype, "size", {
            get: function () { return this._size; },
            enumerable: true,
            configurable: true
        });
        TestView.prototype.render = function (container, orientation) {
            this._onDidRender.fire({ container: container, orientation: orientation });
        };
        TestView.prototype.layout = function (size, orientation) {
            this._size = size;
            this._onDidLayout.fire({ size: size, orientation: orientation });
        };
        TestView.prototype.focus = function () {
            this._onDidFocus.fire();
        };
        TestView.prototype.dispose = function () {
            this._onDidChange.dispose();
            this._onDidRender.dispose();
            this._onDidLayout.dispose();
            this._onDidFocus.dispose();
        };
        return TestView;
    }());
    function getSashes(splitview) {
        return splitview.sashItems.map(function (i) { return i.sash; });
    }
    suite('Splitview', function () {
        var container;
        setup(function () {
            container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.width = 200 + "px";
            container.style.height = 200 + "px";
        });
        teardown(function () {
            container = null;
        });
        test('empty splitview has empty DOM', function () {
            var splitview = new splitview_1.SplitView(container);
            assert.equal(container.firstElementChild.childElementCount, 0, 'split view should be empty');
            splitview.dispose();
        });
        test('has views and sashes as children', function () {
            var view1 = new TestView(20, 20);
            var view2 = new TestView(20, 20);
            var view3 = new TestView(20, 20);
            var splitview = new splitview_1.SplitView(container);
            splitview.addView(view1, 20);
            splitview.addView(view2, 20);
            splitview.addView(view3, 20);
            var viewQuery = container.querySelectorAll('.monaco-split-view2 > .split-view-view');
            assert.equal(viewQuery.length, 3, 'split view should have 3 views');
            var sashQuery = container.querySelectorAll('.monaco-split-view2 > .monaco-sash');
            assert.equal(sashQuery.length, 2, 'split view should have 2 sashes');
            splitview.removeView(2);
            viewQuery = container.querySelectorAll('.monaco-split-view2 > .split-view-view');
            assert.equal(viewQuery.length, 2, 'split view should have 2 views');
            sashQuery = container.querySelectorAll('.monaco-split-view2 > .monaco-sash');
            assert.equal(sashQuery.length, 1, 'split view should have 1 sash');
            splitview.removeView(0);
            viewQuery = container.querySelectorAll('.monaco-split-view2 > .split-view-view');
            assert.equal(viewQuery.length, 1, 'split view should have 1 view');
            sashQuery = container.querySelectorAll('.monaco-split-view2 > .monaco-sash');
            assert.equal(sashQuery.length, 0, 'split view should have no sashes');
            splitview.removeView(0);
            viewQuery = container.querySelectorAll('.monaco-split-view2 > .split-view-view');
            assert.equal(viewQuery.length, 0, 'split view should have no views');
            sashQuery = container.querySelectorAll('.monaco-split-view2 > .monaco-sash');
            assert.equal(sashQuery.length, 0, 'split view should have no sashes');
            splitview.dispose();
            view1.dispose();
            view2.dispose();
            view3.dispose();
        });
        test('calls view methods on addView and removeView', function () {
            var view = new TestView(20, 20);
            var splitview = new splitview_1.SplitView(container);
            var didLayout = false;
            var layoutDisposable = view.onDidLayout(function () { return didLayout = true; });
            var didRender = false;
            var renderDisposable = view.onDidRender(function () { return didRender = true; });
            splitview.addView(view, 20);
            assert.equal(view.size, 20, 'view has right size');
            assert(didLayout, 'layout is called');
            assert(didLayout, 'render is called');
            splitview.dispose();
            layoutDisposable.dispose();
            renderDisposable.dispose();
            view.dispose();
        });
        test('stretches view to viewport', function () {
            var view = new TestView(20, Number.POSITIVE_INFINITY);
            var splitview = new splitview_1.SplitView(container);
            splitview.layout(200);
            splitview.addView(view, 20);
            assert.equal(view.size, 200, 'view is stretched');
            splitview.layout(200);
            assert.equal(view.size, 200, 'view stayed the same');
            splitview.layout(100);
            assert.equal(view.size, 100, 'view is collapsed');
            splitview.layout(20);
            assert.equal(view.size, 20, 'view is collapsed');
            splitview.layout(10);
            assert.equal(view.size, 20, 'view is clamped');
            splitview.layout(200);
            assert.equal(view.size, 200, 'view is stretched');
            splitview.dispose();
            view.dispose();
        });
        test('can resize views', function () {
            var view1 = new TestView(20, Number.POSITIVE_INFINITY);
            var view2 = new TestView(20, Number.POSITIVE_INFINITY);
            var view3 = new TestView(20, Number.POSITIVE_INFINITY);
            var splitview = new splitview_1.SplitView(container);
            splitview.layout(200);
            splitview.addView(view1, 20);
            splitview.addView(view2, 20);
            splitview.addView(view3, 20);
            assert.equal(view1.size, 160, 'view1 is stretched');
            assert.equal(view2.size, 20, 'view2 size is 20');
            assert.equal(view3.size, 20, 'view3 size is 20');
            splitview.resizeView(1, 40);
            assert.equal(view1.size, 140, 'view1 is collapsed');
            assert.equal(view2.size, 40, 'view2 is stretched');
            assert.equal(view3.size, 20, 'view3 stays the same');
            splitview.resizeView(0, 70);
            assert.equal(view1.size, 70, 'view1 is collapsed');
            assert.equal(view2.size, 110, 'view2 is expanded');
            assert.equal(view3.size, 20, 'view3 stays the same');
            splitview.resizeView(2, 40);
            assert.equal(view1.size, 70, 'view1 stays the same');
            assert.equal(view2.size, 90, 'view2 is collapsed');
            assert.equal(view3.size, 40, 'view3 is stretched');
            splitview.dispose();
            view3.dispose();
            view2.dispose();
            view1.dispose();
        });
        test('reacts to view changes', function () {
            var view1 = new TestView(20, Number.POSITIVE_INFINITY);
            var view2 = new TestView(20, Number.POSITIVE_INFINITY);
            var view3 = new TestView(20, Number.POSITIVE_INFINITY);
            var splitview = new splitview_1.SplitView(container);
            splitview.layout(200);
            splitview.addView(view1, 20);
            splitview.addView(view2, 20);
            splitview.addView(view3, 20);
            assert.equal(view1.size, 160, 'view1 is stretched');
            assert.equal(view2.size, 20, 'view2 size is 20');
            assert.equal(view3.size, 20, 'view3 size is 20');
            view1.maximumSize = 20;
            assert.equal(view1.size, 20, 'view1 is collapsed');
            assert.equal(view2.size, 20, 'view2 stays the same');
            assert.equal(view3.size, 160, 'view3 is stretched');
            view3.maximumSize = 40;
            assert.equal(view1.size, 20, 'view1 stays the same');
            assert.equal(view2.size, 140, 'view2 is stretched');
            assert.equal(view3.size, 40, 'view3 is collapsed');
            view2.maximumSize = 200;
            assert.equal(view1.size, 20, 'view1 stays the same');
            assert.equal(view2.size, 140, 'view2 stays the same');
            assert.equal(view3.size, 40, 'view3 stays the same');
            view3.maximumSize = Number.POSITIVE_INFINITY;
            view3.minimumSize = 100;
            assert.equal(view1.size, 20, 'view1 is collapsed');
            assert.equal(view2.size, 80, 'view2 is collapsed');
            assert.equal(view3.size, 100, 'view3 is stretched');
            splitview.dispose();
            view3.dispose();
            view2.dispose();
            view1.dispose();
        });
        test('sashes are properly enabled/disabled', function () {
            var view1 = new TestView(20, Number.POSITIVE_INFINITY);
            var view2 = new TestView(20, Number.POSITIVE_INFINITY);
            var view3 = new TestView(20, Number.POSITIVE_INFINITY);
            var splitview = new splitview_1.SplitView(container);
            splitview.layout(200);
            splitview.addView(view1, 20);
            splitview.addView(view2, 20);
            splitview.addView(view3, 20);
            var sashes = getSashes(splitview);
            assert.equal(sashes.length, 2, 'there are two sashes');
            assert.equal(sashes[0].enabled, true, 'first sash is enabled');
            assert.equal(sashes[1].enabled, true, 'second sash is enabled');
            splitview.layout(60);
            assert.equal(sashes[0].enabled, false, 'first sash is disabled');
            assert.equal(sashes[1].enabled, false, 'second sash is disabled');
            splitview.layout(20);
            assert.equal(sashes[0].enabled, false, 'first sash is disabled');
            assert.equal(sashes[1].enabled, false, 'second sash is disabled');
            splitview.layout(200);
            assert.equal(sashes[0].enabled, true, 'first sash is enabled');
            assert.equal(sashes[1].enabled, true, 'second sash is enabled');
            view1.maximumSize = 20;
            assert.equal(sashes[0].enabled, false, 'first sash is disabled');
            assert.equal(sashes[1].enabled, true, 'second sash is enabled');
            view2.maximumSize = 20;
            assert.equal(sashes[0].enabled, false, 'first sash is disabled');
            assert.equal(sashes[1].enabled, false, 'second sash is disabled');
            view1.maximumSize = 300;
            assert.equal(sashes[0].enabled, true, 'first sash is enabled');
            assert.equal(sashes[1].enabled, true, 'second sash is enabled');
            view2.maximumSize = 200;
            assert.equal(sashes[0].enabled, true, 'first sash is enabled');
            assert.equal(sashes[1].enabled, true, 'second sash is enabled');
            splitview.dispose();
            view3.dispose();
            view2.dispose();
            view1.dispose();
        });
        test('issue #35497', function () {
            var view1 = new TestView(160, Number.POSITIVE_INFINITY);
            var view2 = new TestView(66, 66);
            var splitview = new splitview_1.SplitView(container);
            splitview.layout(986);
            splitview.addView(view1, 142, 0);
            assert.equal(view1.size, 986, 'first view is stretched');
            view2.onDidRender(function () {
                assert.throws(function () { return splitview.resizeView(1, 922); });
                assert.throws(function () { return splitview.resizeView(1, 922); });
            });
            splitview.addView(view2, 66, 0);
            assert.equal(view2.size, 66, 'second view is fixed');
            assert.equal(view1.size, 986 - 66, 'first view is collapsed');
            var viewContainers = container.querySelectorAll('.split-view-view');
            assert.equal(viewContainers.length, 2, 'there are two view containers');
            assert.equal(viewContainers.item(0).style.height, '66px', 'second view container is 66px');
            assert.equal(viewContainers.item(1).style.height, 986 - 66 + "px", 'first view container is 66px');
            splitview.dispose();
            view2.dispose();
            view1.dispose();
        });
    });
});
