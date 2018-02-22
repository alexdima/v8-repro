define(["require", "exports", "assert", "vs/base/browser/dom"], function (require, exports, assert, dom) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    suite('dom', function () {
        test('hasClass', function () {
            var element = document.createElement('div');
            element.className = 'foobar boo far';
            assert(dom.hasClass(element, 'foobar'));
            assert(dom.hasClass(element, 'boo'));
            assert(dom.hasClass(element, 'far'));
            assert(!dom.hasClass(element, 'bar'));
            assert(!dom.hasClass(element, 'foo'));
            assert(!dom.hasClass(element, ''));
        });
        test('removeClass', function () {
            var element = document.createElement('div');
            element.className = 'foobar boo far';
            dom.removeClass(element, 'boo');
            assert(dom.hasClass(element, 'far'));
            assert(!dom.hasClass(element, 'boo'));
            assert(dom.hasClass(element, 'foobar'));
            assert.equal(element.className, 'foobar far');
            element = document.createElement('div');
            element.className = 'foobar boo far';
            dom.removeClass(element, 'far');
            assert(!dom.hasClass(element, 'far'));
            assert(dom.hasClass(element, 'boo'));
            assert(dom.hasClass(element, 'foobar'));
            assert.equal(element.className, 'foobar boo');
            dom.removeClass(element, 'boo');
            assert(!dom.hasClass(element, 'far'));
            assert(!dom.hasClass(element, 'boo'));
            assert(dom.hasClass(element, 'foobar'));
            assert.equal(element.className, 'foobar');
            dom.removeClass(element, 'foobar');
            assert(!dom.hasClass(element, 'far'));
            assert(!dom.hasClass(element, 'boo'));
            assert(!dom.hasClass(element, 'foobar'));
            assert.equal(element.className, '');
        });
        test('removeClass should consider hyphens', function () {
            var element = document.createElement('div');
            dom.addClass(element, 'foo-bar');
            dom.addClass(element, 'bar');
            assert(dom.hasClass(element, 'foo-bar'));
            assert(dom.hasClass(element, 'bar'));
            dom.removeClass(element, 'bar');
            assert(dom.hasClass(element, 'foo-bar'));
            assert(!dom.hasClass(element, 'bar'));
            dom.removeClass(element, 'foo-bar');
            assert(!dom.hasClass(element, 'foo-bar'));
            assert(!dom.hasClass(element, 'bar'));
        });
        //test('[perf] hasClass * 100000', () => {
        //
        //	for (let i = 0; i < 100000; i++) {
        //		let element = document.createElement('div');
        //		element.className = 'foobar boo far';
        //
        //		assert(dom.hasClass(element, 'far'));
        //		assert(dom.hasClass(element, 'boo'));
        //		assert(dom.hasClass(element, 'foobar'));
        //	}
        //});
        suite('$', function () {
            test('should build simple nodes', function () {
                var div = $('div');
                assert(div);
                assert(div instanceof HTMLElement);
                assert.equal(div.tagName, 'DIV');
                assert(!div.firstChild);
            });
            test('should build nodes with attributes', function () {
                var div = $('div', { class: 'test' });
                assert.equal(div.className, 'test');
                div = $('div', null);
                assert.equal(div.className, '');
            });
            test('should build nodes with children', function () {
                var div = $('div', null, $('span', { id: 'demospan' }));
                var firstChild = div.firstChild;
                assert.equal(firstChild.tagName, 'SPAN');
                assert.equal(firstChild.id, 'demospan');
                div = $('div', null, 'hello');
                assert.equal(div.firstChild.textContent, 'hello');
            });
        });
    });
});
