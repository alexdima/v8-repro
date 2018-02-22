define(["require", "exports", "assert", "vs/base/browser/builder", "vs/base/common/types", "vs/base/browser/dom", "vs/base/common/winjs.base"], function (require, exports, assert, builder_1, Types, DomUtils, winjs_base_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var withElementsBySelector = function (selector, offdom) {
        if (offdom === void 0) { offdom = false; }
        var elements = window.document.querySelectorAll(selector);
        var builders = [];
        for (var i = 0; i < elements.length; i++) {
            builders.push(new builder_1.Builder(elements.item(i), offdom));
        }
        return new builder_1.MultiBuilder(builders);
    };
    var withBuilder = function (builder, offdom) {
        if (builder instanceof builder_1.MultiBuilder) {
            return new builder_1.MultiBuilder(builder);
        }
        return new builder_1.Builder(builder.getHTMLElement(), offdom);
    };
    function select(builder, selector, offdom) {
        var elements = builder.getHTMLElement().querySelectorAll(selector);
        var builders = [];
        for (var i = 0; i < elements.length; i++) {
            builders.push(builder_1.withElement(elements.item(i), offdom));
        }
        return new builder_1.MultiBuilder(builders);
    }
    suite('Builder', function () {
        var fixture;
        var fixtureId = 'builder-fixture';
        setup(function () {
            fixture = document.createElement('div');
            fixture.id = fixtureId;
            document.body.appendChild(fixture);
        });
        teardown(function () {
            document.body.removeChild(fixture);
        });
        test('Binding', function () {
            var b = builder_1.Build.withElementById(fixtureId, false);
            var element = b.getHTMLElement();
            assert(element);
            // Properties
            builder_1.setPropertyOnElement(element, 'foo', 'bar');
            assert.strictEqual(builder_1.getPropertyFromElement(element, 'foo'), 'bar');
            builder_1.setPropertyOnElement(element, 'foo', { foo: 'bar' });
            assert.deepEqual(builder_1.getPropertyFromElement(element, 'foo'), { foo: 'bar' });
            builder_1.setPropertyOnElement(element, 'bar', 'bar');
            assert.strictEqual(builder_1.getPropertyFromElement(element, 'bar'), 'bar');
            builder_1.setPropertyOnElement(element, 'bar', { foo: 'bar' });
            assert.deepEqual(builder_1.getPropertyFromElement(element, 'bar'), { foo: 'bar' });
        });
        test('Select', function () {
            var b = builder_1.Build.withElementById(fixtureId, false);
            assert(b);
            var allDivs = withElementsBySelector('div');
            assert(allDivs);
            assert(allDivs.length >= 1);
            assert(Types.isFunction(allDivs.push));
            assert(allDivs instanceof builder_1.MultiBuilder);
            for (var key in b) {
                if (b.hasOwnProperty(key) && Types.isFunction(b[key])) {
                    assert(allDivs.hasOwnProperty(key));
                }
            }
            var noElement = withElementsBySelector('#thiselementdoesnotexist');
            assert(noElement);
            assert(noElement.length === 0);
            assert(Types.isFunction(noElement.push));
            assert(noElement instanceof builder_1.MultiBuilder);
            for (var key in b) {
                if (b.hasOwnProperty(key) && Types.isFunction(b[key])) {
                    assert(noElement.hasOwnProperty(key));
                }
            }
        });
        test('Build.withElement()', function () {
            var f = builder_1.Build.withElementById(fixtureId, false);
            var b = builder_1.$(f.getHTMLElement());
            b.addClass('foo');
            assert(b.hasClass('foo'));
            b.removeClass('foo');
            assert(!b.hasClass('foo'));
            assert.strictEqual(f.getHTMLElement(), document.getElementById(fixtureId));
            assert.strictEqual(b.getHTMLElement(), document.getElementById(fixtureId));
        });
        test('Build.withBuilder()', function () {
            var f = builder_1.Build.withElementById(fixtureId, false);
            var b = withBuilder(f, false);
            b.addClass('foo');
            assert(b.hasClass('foo'));
            b.removeClass('foo');
            assert(!b.hasClass('foo'));
            assert.strictEqual(f.getHTMLElement(), document.getElementById(fixtureId));
            assert.strictEqual(b.getHTMLElement(), document.getElementById(fixtureId));
        });
        test('Build.withBuilder() - Multibuilder', function () {
            var f = withElementsBySelector('#' + fixtureId);
            var b = withBuilder(f, false);
            b.addClass('foo');
            assert(b.hasClass('foo')[0]);
            b.removeClass('foo');
            assert(!b.hasClass('foo')[0]);
        });
        test('Build.offDOM()', function () {
            var b = builder_1.$();
            assert(b);
            b.div({
                id: 'foobar'
            }, function (div) {
                div.span({
                    id: 'foobarspan',
                    innerHtml: 'foo bar'
                });
            });
            assert(builder_1.Build.withElementById('foobar') === null);
            b.build(builder_1.Build.withElementById(fixtureId, false));
            assert(builder_1.Build.withElementById('foobar'));
            assert(builder_1.Build.withElementById('foobarspan'));
            assert.strictEqual(builder_1.Build.withElementById('foobarspan').getHTMLElement().innerHTML, 'foo bar');
        });
        test('Build.withElementById()', function () {
            var b = builder_1.Build.withElementById(fixtureId, false);
            b.addClass('foo');
            assert(b.hasClass('foo'));
            b.removeClass('foo');
            assert(!b.hasClass('foo'));
            assert.strictEqual(b.getHTMLElement(), document.getElementById(fixtureId));
        });
        test('withElementsBySelector()', function () {
            var b = withElementsBySelector('#' + fixtureId, false);
            b.addClass('foo');
            assert(b.hasClass('foo')[0]);
            b.removeClass('foo');
            assert(!b.hasClass('foo')[0]);
        });
        test('Off DOM withElementById and container passed in', function () {
            var b = builder_1.Build.withElementById(fixtureId, true);
            assert(b);
            assert.strictEqual(b.getHTMLElement(), document.getElementById(fixtureId));
            b.div({
                id: 'foobar'
            }, function (div) {
                div.span({
                    id: 'foobarspan',
                    innerHtml: 'foo bar'
                });
            });
            assert(builder_1.Build.withElementById('foobar') === null);
            b.build();
            assert(builder_1.Build.withElementById('foobar'));
            assert(builder_1.Build.withElementById('foobarspan'));
            assert.strictEqual(builder_1.Build.withElementById('foobarspan').getHTMLElement().innerHTML, 'foo bar');
        });
        test('Off DOM withSelector and container passed in', function () {
            var b = withElementsBySelector('#' + fixtureId, true);
            assert(b);
            b.div({
                id: 'foobar'
            }, function (div) {
                div.span({
                    id: 'foobarspan',
                    innerHtml: 'foo bar'
                });
            });
            assert(builder_1.Build.withElementById('foobar') === null);
            b.build();
            assert(builder_1.Build.withElementById('foobar'));
            assert(builder_1.Build.withElementById('foobarspan'));
            assert.strictEqual(builder_1.Build.withElementById('foobarspan').getHTMLElement().innerHTML, 'foo bar');
        });
        test('Builder.build() with index specified', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.empty();
            b.div({ id: '1' });
            b.div({ id: '2' });
            b.div({ id: '3' });
            b = builder_1.$();
            b.div({ id: '4' });
            b.build(builder_1.Build.withElementById(fixtureId), 0);
            b = builder_1.Build.withElementById(fixtureId);
            var divs = select(b, 'div');
            assert.strictEqual(divs.length, 4);
            var ids = divs.attr('id');
            assert.strictEqual(ids.length, 4);
            assert.strictEqual(ids[0], '4');
            assert.strictEqual(ids[1], '1');
            assert.strictEqual(ids[2], '2');
            assert.strictEqual(ids[3], '3');
            b = builder_1.$();
            b.div({ id: '5' });
            b.build(builder_1.Build.withElementById(fixtureId), 2);
            b = builder_1.Build.withElementById(fixtureId);
            divs = select(b, 'div');
            assert.strictEqual(divs.length, 5);
            ids = divs.attr('id');
            assert.strictEqual(ids.length, 5);
            assert.strictEqual(ids[0], '4');
            assert.strictEqual(ids[1], '1');
            assert.strictEqual(ids[2], '5');
            assert.strictEqual(ids[3], '2');
            assert.strictEqual(ids[4], '3');
        });
        test('Builder.asContainer()', function () {
            var f = builder_1.Build.withElementById(fixtureId, false);
            f.div({
                id: 'foobar'
            });
            var divBuilder = f.asContainer();
            divBuilder.span({
                innerHtml: 'see man'
            });
        });
        test('Builder.clone()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            var clone = b.clone();
            assert(clone);
            assert(clone instanceof builder_1.Builder);
            assert.strictEqual(b.getHTMLElement(), clone.getHTMLElement());
            assert.deepEqual(b, clone);
            var multiB = withElementsBySelector('div');
            var multiClone = multiB.clone();
            assert(multiClone);
        });
        test('Builder Multibuilder fn call that returns Multibuilder', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div(function (div) {
                div.span();
            });
            b.div(function (div) {
                div.span();
            });
            b.div(function (div) {
                div.span();
            });
            var multiBuilder = select(builder_1.Build.withElementById(fixtureId), 'div');
            assert(multiBuilder.length === 3);
        });
        test('Builder.p() and other elements', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.empty();
            b.div(function (div) {
                assert(div !== b);
                assert.strictEqual('div', div.getHTMLElement().nodeName.toLowerCase());
                div.p(function (p) {
                    p.ul(function (ul) {
                        ul.li(function (li) {
                            li.span({
                                id: 'builderspan',
                                innerHtml: 'Foo Bar'
                            });
                            assert.strictEqual('span', li.getHTMLElement().nodeName.toLowerCase());
                            li.img({
                                id: 'builderimg',
                                src: '#'
                            });
                            assert.strictEqual('img', li.getHTMLElement().nodeName.toLowerCase());
                            li.a({
                                id: 'builderlink',
                                href: '#',
                                innerHtml: 'Link'
                            });
                            assert.strictEqual('a', li.getHTMLElement().nodeName.toLowerCase());
                        });
                    });
                });
                assert.strictEqual('p', div.getHTMLElement().nodeName.toLowerCase());
            });
            assert.strictEqual(select(builder_1.Build.withElementById(fixtureId), 'div').length, 1);
            assert.strictEqual(select(builder_1.Build.withElementById(fixtureId), '*').length, 7);
            assert.strictEqual(builder_1.Build.withElementById('builderspan').getHTMLElement().innerHTML, 'Foo Bar');
            assert.strictEqual(builder_1.Build.withElementById('builderimg').attr('src'), '#');
            assert.strictEqual(builder_1.Build.withElementById('builderlink').attr('href'), '#');
            // Assert HTML through DOM
            var root = document.getElementById(fixtureId);
            assert.strictEqual(root.childNodes.length, 1);
            var div = root.childNodes[0];
            assert.strictEqual('div', div.nodeName.toLowerCase());
            assert.strictEqual(b.getHTMLElement(), div);
            assert.strictEqual(div.childNodes.length, 1);
            var p = div.childNodes[0];
            assert.strictEqual('p', p.nodeName.toLowerCase());
            assert.strictEqual(p.childNodes.length, 1);
            var ul = p.childNodes[0];
            assert.strictEqual('ul', ul.nodeName.toLowerCase());
            assert.strictEqual(ul.childNodes.length, 1);
            var li = ul.childNodes[0];
            assert.strictEqual('li', li.nodeName.toLowerCase());
            assert.strictEqual(li.childNodes.length, 3);
            var span = li.childNodes[0];
            assert.strictEqual('span', span.nodeName.toLowerCase());
            assert.strictEqual(span.childNodes.length, 1);
            assert.strictEqual(span.innerHTML, 'Foo Bar');
            var img = li.childNodes[1];
            assert.strictEqual('img', img.nodeName.toLowerCase());
            assert.strictEqual(img.childNodes.length, 0);
            assert.strictEqual(img.getAttribute('src'), '#');
            var a = li.childNodes[2];
            assert.strictEqual('a', a.nodeName.toLowerCase());
            assert.strictEqual(a.childNodes.length, 1);
            assert.strictEqual(a.getAttribute('href'), '#');
            assert.strictEqual(a.innerHTML, 'Link');
        });
        test('Builder.p() and other elements', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.element('div', function (div) {
                div.element('p', function (p) {
                    p.element('ul', function (ul) {
                        ul.element('li', function (li) {
                            li.element('span', {
                                id: 'builderspan',
                                innerHtml: 'Foo Bar'
                            });
                            li.element('img', {
                                id: 'builderimg',
                                src: '#'
                            });
                            li.element('a', {
                                id: 'builderlink',
                                href: '#',
                                innerHtml: 'Link'
                            });
                        });
                    });
                });
            });
            assert.strictEqual(select(builder_1.Build.withElementById(fixtureId), 'div').length, 1);
            assert.strictEqual(select(builder_1.Build.withElementById(fixtureId), '*').length, 7);
            assert.strictEqual(builder_1.Build.withElementById('builderspan').getHTMLElement().innerHTML, 'Foo Bar');
            assert.strictEqual(builder_1.Build.withElementById('builderimg').attr('src'), '#');
            assert.strictEqual(builder_1.Build.withElementById('builderlink').attr('href'), '#');
        });
        test('Builder.attr()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            assert(!b.attr('id'));
            b.attr('id', 'foobar');
            assert.strictEqual(b.attr('id'), 'foobar');
            b.attr({
                id: 'barfoo',
                padding: [4, 3, 2, 1],
                margin: '4px 3px 2px 1px'
            });
            assert.strictEqual(b.attr('id'), 'barfoo');
            assert.strictEqual(b.getHTMLElement().getAttribute('id'), 'barfoo');
            assert.strictEqual(b.style('margin-top'), '4px');
            assert.strictEqual(b.getHTMLElement().style.marginTop, '4px');
            assert.strictEqual(b.style('margin-right'), '3px');
            assert.strictEqual(b.style('margin-bottom'), '2px');
            assert.strictEqual(b.style('margin-left'), '1px');
            assert.strictEqual(b.style('padding-top'), '4px');
            assert.strictEqual(b.style('padding-right'), '3px');
            assert.strictEqual(b.style('padding-bottom'), '2px');
            assert.strictEqual(b.style('padding-left'), '1px');
            b.attr({
                padding: '1 2 3 4',
                position: '100 200 300 400',
                size: '200 300'
            });
            assert.strictEqual(b.style('padding-top'), '1px');
            assert.strictEqual(b.style('padding-right'), '2px');
            assert.strictEqual(b.style('padding-bottom'), '3px');
            assert.strictEqual(b.style('padding-left'), '4px');
            assert.strictEqual(b.style('top'), '100px');
            assert.strictEqual(b.style('right'), '200px');
            assert.strictEqual(b.style('bottom'), '300px');
            assert.strictEqual(b.style('left'), '400px');
            assert.strictEqual(b.style('width'), '200px');
            assert.strictEqual(b.style('height'), '300px');
        });
        test('Builder.style()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.style('padding-bottom', '5px');
            b.style('paddingTop', '4px');
            assert.strictEqual(b.style('paddingBottom'), '5px');
            assert.strictEqual(b.style('padding-bottom'), '5px');
            assert.strictEqual(b.style('paddingTop'), '4px');
            assert.strictEqual(b.style('padding-top'), '4px');
        });
        test('Builder.style() as object literal', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.style({
                'padding-bottom': '5px',
                paddingTop: '4px',
                border: '1px solid red'
            });
            assert.strictEqual(b.getHTMLElement().style.paddingBottom, '5px');
            assert.strictEqual(b.style('paddingBottom'), '5px');
            assert.strictEqual(b.style('padding-bottom'), '5px');
            assert.strictEqual(b.style('paddingTop'), '4px');
            assert.strictEqual(b.style('padding-top'), '4px');
            assert.strictEqual(b.style('border-width'), '1px');
            assert.strictEqual(b.style('border-style'), 'solid');
            assert.strictEqual(b.style('border-color'), 'red');
        });
        test('Builder.attributes', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.id('foobar');
            b.title('foobar');
            b.type('foobar');
            b.value('foobar');
            b.tabindex(0);
            assert.strictEqual(b.attr('id'), 'foobar');
            assert.strictEqual(b.attr('title'), 'foobar');
            assert.strictEqual(b.attr('type'), 'foobar');
            assert.strictEqual(b.attr('value'), 'foobar');
            assert.strictEqual(b.attr('tabindex'), '0');
            assert.strictEqual(b.getHTMLElement().getAttribute('id'), 'foobar');
            assert.strictEqual(b.getHTMLElement().getAttribute('title'), 'foobar');
            assert.strictEqual(b.getHTMLElement().getAttribute('type'), 'foobar');
            assert.strictEqual(b.getHTMLElement().getAttribute('value'), 'foobar');
            assert.strictEqual(b.getHTMLElement().getAttribute('tabindex'), '0');
        });
        test('Builder.addClass() and Co', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            assert(!b.hasClass('foobar'));
            assert(!b.getHTMLElement().className);
            b.addClass('foobar');
            assert(b.getComputedStyle());
            assert(b.hasClass('foobar'));
            assert.strictEqual(b.getHTMLElement().className, 'foobar');
            b.removeClass('foobar');
            assert(!b.hasClass('foobar'));
            assert(!b.getHTMLElement().className);
            assert(!b.hasClass('foobar'));
            b.attr({ 'class': 'foobar' });
            assert(b.hasClass('foobar'));
            assert.strictEqual(b.getHTMLElement().className, 'foobar');
            b.removeClass('foobar');
            assert(!b.hasClass('foobar'));
            assert(!b.getHTMLElement().className);
            b.addClass('foobar').addClass('barfoo').addClass('foobar');
            assert(b.hasClass('barfoo'));
            assert(b.hasClass('foobar'));
            b.removeClass('foobar').removeClass('barfoo');
            assert(!b.hasClass('barfoo'));
            assert(!b.hasClass('foobar'));
            assert(!b.getHTMLElement().className);
        });
        test('Builder.padding() and .margin()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.padding(4, 3, 2, 1).margin(1, 2, 3, 4);
            assert.strictEqual(b.style('padding-top'), '4px');
            assert.strictEqual(b.style('padding-right'), '3px');
            assert.strictEqual(b.style('padding-bottom'), '2px');
            assert.strictEqual(b.style('padding-left'), '1px');
            assert.strictEqual(b.style('margin-top'), '1px');
            assert.strictEqual(b.style('margin-right'), '2px');
            assert.strictEqual(b.style('margin-bottom'), '3px');
            assert.strictEqual(b.style('margin-left'), '4px');
            assert(b.getComputedStyle());
        });
        test('Builder.position()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.position(100, 200, 300, 400, 'relative');
            assert.strictEqual(b.style('top'), '100px');
            assert.strictEqual(b.style('right'), '200px');
            assert.strictEqual(b.style('bottom'), '300px');
            assert.strictEqual(b.style('left'), '400px');
            assert.strictEqual(b.style('position'), 'relative');
        });
        test('Builder.size(), .minSize() and .maxSize()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.size(100, 200);
            assert.strictEqual(b.style('width'), '100px');
            assert.strictEqual(b.style('height'), '200px');
            b.minSize(300, 400);
            b.maxSize(500, 600);
            assert.strictEqual(b.style('minWidth'), '300px');
            assert.strictEqual(b.style('minHeight'), '400px');
            assert.strictEqual(b.style('maxWidth'), '500px');
            assert.strictEqual(b.style('maxHeight'), '600px');
        });
        test('Builder.show() and .hide()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.show();
            assert(!b.hasClass('builder-hidden'));
            assert(!b.isHidden());
            b.hide();
            assert(b.isHidden());
            assert(!b.hasClass('builder-visible'));
            b.show();
            b.hide();
            assert(b.hasClass('builder-hidden'));
            assert(b.isHidden());
        });
        test('Builder.showDelayed()', function (done) {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div().hide();
            b.showDelayed(20);
            assert(b.hasClass('builder-hidden'));
            winjs_base_1.TPromise.timeout(30).then(function () {
                assert(!b.hasClass('builder-hidden'));
                done();
            });
        });
        test('Builder.showDelayed() but interrupted', function (done) {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div().hide();
            b.showDelayed(20);
            assert(b.hasClass('builder-hidden'));
            b.hide(); // Should cancel the visibility promise
            winjs_base_1.TPromise.timeout(30).then(function () {
                assert(b.hasClass('builder-hidden'));
                done();
            });
        });
        test('Builder.border(), .borderTop(), .borderBottom(), .borderLeft(), .borderRight()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.border('1px solid red');
            assert.strictEqual(b.style('border-width'), '1px');
            assert.strictEqual(b.style('border-color'), 'red');
            assert.strictEqual(b.style('border-style'), 'solid');
            b.borderTop('2px dotted yellow');
            assert.strictEqual(b.style('border-top-width'), '2px');
            assert.strictEqual(b.style('border-top-color'), 'yellow');
            assert.strictEqual(b.style('border-top-style'), 'dotted');
            b.borderRight('3px dashed green');
            assert.strictEqual(b.style('border-right-width'), '3px');
            assert.strictEqual(b.style('border-right-color'), 'green');
            assert.strictEqual(b.style('border-right-style'), 'dashed');
            b.borderBottom('4px solid blue');
            assert.strictEqual(b.style('border-bottom-width'), '4px');
            assert.strictEqual(b.style('border-bottom-color'), 'blue');
            assert.strictEqual(b.style('border-bottom-style'), 'solid');
            b.borderLeft('5px dashed white');
            assert.strictEqual(b.style('border-left-width'), '5px');
            assert.strictEqual(b.style('border-left-color'), 'white');
            assert.strictEqual(b.style('border-left-style'), 'dashed');
        });
        test('Builder.innerHtml()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.innerHtml('<b>Foo Bar</b>');
            assert.strictEqual(b.getHTMLElement().innerHTML, '<b>Foo Bar</b>');
        });
        test('Builder.safeInnerHtml()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div();
            b.safeInnerHtml('<b>Foo Bar</b>');
            assert.strictEqual(b.getHTMLElement().innerHTML, '&lt;b&gt;Foo Bar&lt;/b&gt;');
            b.safeInnerHtml('Foo Bar');
            assert.strictEqual(b.getHTMLElement().innerHTML, 'Foo Bar');
        });
        test('Build Client Area', function () {
            // Global
            var dimensions = builder_1.$(document.body).getClientArea();
            assert(dimensions.width > 0);
            assert(dimensions.height > 0);
            // Local
            var b = builder_1.Build.withElementById(fixtureId);
            dimensions = b.getClientArea();
            // assert(dimensions.width >= 0);
            // assert(dimensions.height >= 0);
        });
        test('Builder.once()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.element('input', {
                type: 'button'
            });
            var counter = 0;
            b.once(DomUtils.EventType.CLICK, function (e) {
                counter++;
                assert(counter <= 1);
            });
            b.getHTMLElement().click();
            b.getHTMLElement().click();
        });
        test('Builder.once() with capture', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.element('input', {
                type: 'button'
            });
            var counter = 0;
            b.once(DomUtils.EventType.CLICK, function (e) {
                counter++;
                assert(counter <= 1);
            }, null, true);
            b.getHTMLElement().click();
            b.getHTMLElement().click();
        });
        test('Builder.on() and .off()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.element('input', {
                type: 'button'
            });
            var listeners = [];
            var counter = 0;
            b.on(DomUtils.EventType.CLICK, function (e) {
                counter++;
            }, listeners);
            assert(listeners.length === 1);
            b.getHTMLElement().click();
            b.off(DomUtils.EventType.BLUR);
            b.getHTMLElement().click();
            b.off(DomUtils.EventType.CLICK);
            b.getHTMLElement().click();
            b.getHTMLElement().click();
            assert.equal(counter, 2);
        });
        test('Builder.on() and .off() with capture', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.element('input', {
                type: 'button'
            });
            var listeners = [];
            var counter = 0;
            b.on(DomUtils.EventType.CLICK, function (e) {
                counter++;
            }, listeners, true);
            assert(listeners.length === 1);
            b.getHTMLElement().click();
            b.off(DomUtils.EventType.BLUR);
            b.getHTMLElement().click();
            b.off(DomUtils.EventType.BLUR, true);
            b.getHTMLElement().click();
            b.off(DomUtils.EventType.CLICK);
            b.getHTMLElement().click();
            b.off(DomUtils.EventType.CLICK, true);
            b.getHTMLElement().click();
            b.getHTMLElement().click();
            assert(counter === 4);
        });
        test('Builder.empty()', function () {
            var inputs = [];
            var bindings = [];
            var b = builder_1.Build.withElementById(fixtureId);
            var counter1 = 0;
            var counter2 = 0;
            var counter3 = 0;
            var counter4 = 0;
            var counter5 = 0;
            var counter6 = 0;
            var counter7 = 0;
            b.div(function (div) {
                builder_1.bindElement(div.getHTMLElement(), 'Foo Bar');
                div.setProperty('Foo', 'Bar');
                bindings.push(div.clone());
                div.element('input', {
                    type: 'button'
                }).on(DomUtils.EventType.CLICK, function () {
                    counter1++;
                    assert(counter1 <= 1);
                });
                inputs.push(div.clone());
                div.p(function (p) {
                    builder_1.bindElement(p.getHTMLElement(), 'Foo Bar');
                    p.setProperty('Foo', 'Bar');
                    bindings.push(p.clone());
                    p.element('input', {
                        type: 'button'
                    }).on(DomUtils.EventType.CLICK, function () {
                        counter2++;
                        assert(counter2 <= 1);
                    });
                    inputs.push(p.clone());
                    p.ul(function (ul) {
                        builder_1.bindElement(ul.getHTMLElement(), 'Foo Bar');
                        ul.setProperty('Foo', 'Bar');
                        bindings.push(ul.clone());
                        ul.element('input', {
                            type: 'button'
                        }).on(DomUtils.EventType.CLICK, function (e) {
                            counter3++;
                            assert(counter3 <= 1);
                        });
                        inputs.push(ul.clone());
                        ul.li(function (li) {
                            builder_1.bindElement(li.getHTMLElement(), 'Foo Bar');
                            li.setProperty('Foo', 'Bar');
                            bindings.push(li.clone());
                            li.element('input', {
                                type: 'button'
                            }).on(DomUtils.EventType.CLICK, function (e) {
                                counter4++;
                                assert(counter4 <= 1);
                            });
                            inputs.push(li.clone());
                            li.span({
                                id: 'builderspan',
                                innerHtml: 'Foo Bar'
                            }, function (span) {
                                builder_1.bindElement(span.getHTMLElement(), 'Foo Bar');
                                span.setProperty('Foo', 'Bar');
                                bindings.push(span.clone());
                                span.element('input', {
                                    type: 'button'
                                }).on(DomUtils.EventType.CLICK, function (e) {
                                    counter5++;
                                    assert(counter5 <= 1);
                                });
                                inputs.push(span.clone());
                            });
                            li.img({
                                id: 'builderimg',
                                src: '#'
                            }, function (img) {
                                builder_1.bindElement(img.getHTMLElement(), 'Foo Bar');
                                img.setProperty('Foo', 'Bar');
                                bindings.push(img.clone());
                                img.element('input', {
                                    type: 'button'
                                }).on(DomUtils.EventType.CLICK, function (e) {
                                    counter6++;
                                    assert(counter6 <= 1);
                                });
                                inputs.push(img.clone());
                            });
                            li.a({
                                id: 'builderlink',
                                href: '#',
                                innerHtml: 'Link'
                            }, function (a) {
                                builder_1.bindElement(a.getHTMLElement(), 'Foo Bar');
                                a.setProperty('Foo', 'Bar');
                                bindings.push(a.clone());
                                a.element('input', {
                                    type: 'button'
                                }).on(DomUtils.EventType.CLICK, function (e) {
                                    counter7++;
                                    assert(counter7 <= 1);
                                });
                                inputs.push(a.clone());
                            });
                        });
                    });
                });
            });
            inputs.forEach(function (input) {
                input.getHTMLElement().click();
            });
            for (var i = 0; i < bindings.length; i++) {
                assert(bindings[i].getProperty('Foo'));
            }
            builder_1.Build.withElementById(fixtureId).empty();
            assert(select(builder_1.Build.withElementById(fixtureId), '*').length === 0);
            inputs.forEach(function (input) {
                input.getHTMLElement().click();
            });
            for (var i = 0; i < bindings.length; i++) {
                assert(!bindings[i].getProperty('Foo'));
            }
            assert.equal(counter1, 1);
            assert.equal(counter2, 1);
            assert.equal(counter3, 1);
            assert.equal(counter4, 1);
            assert.equal(counter5, 1);
            assert.equal(counter6, 1);
            assert.equal(counter7, 1);
        });
        test('Builder.empty() cleans all listeners', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            var unbindCounter = 0;
            var old = DomUtils.addDisposableListener;
            try {
                DomUtils.addDisposableListener = function (node, type, handler) {
                    var unbind = old.call(null, node, type, handler);
                    return {
                        dispose: function () {
                            unbindCounter++;
                            unbind.dispose();
                        }
                    };
                };
                b.div(function (div) {
                    div.p(function (p) {
                        p.span().on([DomUtils.EventType.CLICK, DomUtils.EventType.KEY_DOWN], function (e) { });
                        p.img().on([DomUtils.EventType.KEY_PRESS, DomUtils.EventType.MOUSE_OUT], function (e) { }, null, true); // useCapture
                        p.a(function (a) {
                            a.span().on([DomUtils.EventType.CLICK, DomUtils.EventType.KEY_DOWN], function (e) { });
                        }).on([DomUtils.EventType.SELECT, DomUtils.EventType.BLUR], function (e) { });
                    });
                });
                b.empty();
                assert.strictEqual(unbindCounter, 8);
            }
            finally {
                DomUtils.addDisposableListener = old;
            }
        });
        test('Builder.destroy()', function () {
            var inputs = [];
            var bindings = [];
            var b = builder_1.Build.withElementById(fixtureId);
            var counter1 = 0;
            var counter2 = 0;
            var counter3 = 0;
            var counter4 = 0;
            var counter5 = 0;
            var counter6 = 0;
            var counter7 = 0;
            b.div(function (div) {
                builder_1.bindElement(div.getHTMLElement(), 'Foo Bar');
                div.setProperty('Foo', 'Bar');
                bindings.push(div.clone());
                div.element('input', {
                    type: 'button'
                }).on(DomUtils.EventType.CLICK, function (e) {
                    counter1++;
                    assert(counter1 <= 1);
                }, null, true); // useCapture
                inputs.push(div.clone());
                div.p(function (p) {
                    builder_1.bindElement(p.getHTMLElement(), 'Foo Bar');
                    p.setProperty('Foo', 'Bar');
                    bindings.push(p.clone());
                    p.element('input', {
                        type: 'button'
                    }).on(DomUtils.EventType.CLICK, function (e) {
                        counter2++;
                        assert(counter2 <= 1);
                    });
                    inputs.push(p.clone());
                    p.ul(function (ul) {
                        builder_1.bindElement(ul.getHTMLElement(), 'Foo Bar');
                        ul.setProperty('Foo', 'Bar');
                        bindings.push(ul.clone());
                        ul.element('input', {
                            type: 'button'
                        }).on(DomUtils.EventType.CLICK, function (e) {
                            counter3++;
                            assert(counter3 <= 1);
                        });
                        inputs.push(ul.clone());
                        ul.li(function (li) {
                            builder_1.bindElement(li.getHTMLElement(), 'Foo Bar');
                            li.setProperty('Foo', 'Bar');
                            bindings.push(li.clone());
                            li.element('input', {
                                type: 'button'
                            }).on(DomUtils.EventType.CLICK, function () {
                                counter4++;
                                assert(counter4 <= 1);
                            });
                            inputs.push(li.clone());
                            li.span({
                                id: 'builderspan',
                                innerHtml: 'Foo Bar'
                            }, function (span) {
                                builder_1.bindElement(span.getHTMLElement(), 'Foo Bar');
                                span.setProperty('Foo', 'Bar');
                                bindings.push(span.clone());
                                span.element('input', {
                                    type: 'button'
                                }).on(DomUtils.EventType.CLICK, function (e) {
                                    counter5++;
                                    assert(counter5 <= 1);
                                });
                                inputs.push(span.clone());
                            });
                            li.img({
                                id: 'builderimg',
                                src: '#'
                            }, function (img) {
                                builder_1.bindElement(img.getHTMLElement(), 'Foo Bar');
                                img.setProperty('Foo', 'Bar');
                                bindings.push(img.clone());
                                img.element('input', {
                                    type: 'button'
                                }).on(DomUtils.EventType.CLICK, function (e) {
                                    counter6++;
                                    assert(counter6 <= 1);
                                });
                                inputs.push(img.clone());
                            });
                            li.a({
                                id: 'builderlink',
                                href: '#',
                                innerHtml: 'Link'
                            }, function (a) {
                                builder_1.bindElement(a.getHTMLElement(), 'Foo Bar');
                                a.setProperty('Foo', 'Bar');
                                bindings.push(a.clone());
                                a.element('input', {
                                    type: 'button'
                                }).on(DomUtils.EventType.CLICK, function (e) {
                                    counter7++;
                                    assert(counter7 <= 1);
                                });
                                inputs.push(a.clone());
                            });
                        });
                    });
                });
            });
            inputs.forEach(function (input) {
                input.getHTMLElement().click();
            });
            for (var i = 0; i < bindings.length; i++) {
                assert(bindings[i].getProperty('Foo'));
            }
            select(builder_1.Build.withElementById(fixtureId), 'div').destroy();
            assert(select(builder_1.Build.withElementById(fixtureId), '*').length === 0);
            inputs.forEach(function (input) {
                input.getHTMLElement().click();
            });
            for (var i = 0; i < bindings.length; i++) {
                assert(!bindings[i].getProperty('Foo'));
            }
            assert.equal(counter1, 1);
            assert.equal(counter2, 1);
            assert.equal(counter3, 1);
            assert.equal(counter4, 1);
            assert.equal(counter5, 1);
            assert.equal(counter6, 1);
            assert.equal(counter7, 1);
        });
        test('Builder.destroy() cleans all listeners', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            var unbindCounter = 0;
            var old = DomUtils.addDisposableListener;
            try {
                DomUtils.addDisposableListener = function (node, type, handler) {
                    var unbind = old.call(null, node, type, handler);
                    return {
                        dispose: function () {
                            unbindCounter++;
                            unbind.dispose();
                        }
                    };
                };
                b.div(function (div) {
                    div.p(function (p) {
                        p.span().on([DomUtils.EventType.CLICK, DomUtils.EventType.KEY_DOWN], function (e) { });
                        p.img().on([DomUtils.EventType.KEY_PRESS, DomUtils.EventType.MOUSE_OUT], function (e) { });
                        p.a(function (a) {
                            a.span().on([DomUtils.EventType.CLICK, DomUtils.EventType.KEY_DOWN], function (e) { });
                        }).on([DomUtils.EventType.SELECT, DomUtils.EventType.BLUR], function (e) { });
                    });
                })
                    .on([DomUtils.EventType.CLICK, DomUtils.EventType.KEY_DOWN], function (e) { })
                    .on([DomUtils.EventType.BLUR, DomUtils.EventType.FOCUS], function (e) { }, null, true); //useCapture
                b.destroy();
                assert.strictEqual(unbindCounter, 16);
            }
            finally {
                DomUtils.addDisposableListener = old;
            }
        });
        test('Builder.offDOM()', function () {
            var b = builder_1.Build.withElementById(fixtureId);
            b.div({ id: '1' });
            assert(builder_1.Build.withElementById('1'));
            b.offDOM();
            assert(!builder_1.Build.withElementById('1'));
        });
        test('$ - selector construction', function () {
            var obj = builder_1.$('div');
            assert(obj instanceof builder_1.Builder);
            assert(DomUtils.isHTMLElement(obj.getHTMLElement()));
            assert.equal(obj.getHTMLElement().tagName.toLowerCase(), 'div');
            assert.equal(obj.getHTMLElement().id, '');
            assert.equal(obj.getHTMLElement().className, '');
            obj = builder_1.$('#myid');
            assert(obj instanceof builder_1.Builder);
            assert(DomUtils.isHTMLElement(obj.getHTMLElement()));
            assert.equal(obj.getHTMLElement().tagName.toLowerCase(), 'div');
            assert.equal(obj.getHTMLElement().id, 'myid');
            assert.equal(obj.getHTMLElement().className, '');
            obj = builder_1.$('.myclass');
            assert(obj instanceof builder_1.Builder);
            assert(DomUtils.isHTMLElement(obj.getHTMLElement()));
            assert.equal(obj.getHTMLElement().tagName.toLowerCase(), 'div');
            assert.equal(obj.getHTMLElement().id, '');
            assert.equal(obj.getHTMLElement().className, 'myclass');
            obj = builder_1.$('.myclass.element');
            assert(obj instanceof builder_1.Builder);
            assert(DomUtils.isHTMLElement(obj.getHTMLElement()));
            assert.equal(obj.getHTMLElement().tagName.toLowerCase(), 'div');
            assert.equal(obj.getHTMLElement().id, '');
            assert.equal(obj.getHTMLElement().className, 'myclass element');
            obj = builder_1.$('#myid.element');
            assert(obj instanceof builder_1.Builder);
            assert(DomUtils.isHTMLElement(obj.getHTMLElement()));
            assert.equal(obj.getHTMLElement().tagName.toLowerCase(), 'div');
            assert.equal(obj.getHTMLElement().id, 'myid');
            assert.equal(obj.getHTMLElement().className, 'element');
            obj = builder_1.$('ul#myid');
            assert(obj instanceof builder_1.Builder);
            assert(DomUtils.isHTMLElement(obj.getHTMLElement()));
            assert.equal(obj.getHTMLElement().tagName.toLowerCase(), 'ul');
            assert.equal(obj.getHTMLElement().id, 'myid');
            assert.equal(obj.getHTMLElement().className, '');
            obj = builder_1.$('header#monaco.container');
            assert(obj instanceof builder_1.Builder);
            assert(DomUtils.isHTMLElement(obj.getHTMLElement()));
            assert.equal(obj.getHTMLElement().tagName.toLowerCase(), 'header');
            assert.equal(obj.getHTMLElement().id, 'monaco');
            assert.equal(obj.getHTMLElement().className, 'container');
            obj = builder_1.$('header#monaco.container.box');
            assert(obj instanceof builder_1.Builder);
            assert(DomUtils.isHTMLElement(obj.getHTMLElement()));
            assert.equal(obj.getHTMLElement().tagName.toLowerCase(), 'header');
            assert.equal(obj.getHTMLElement().id, 'monaco');
            assert.equal(obj.getHTMLElement().className, 'container box');
        });
        test('$ - wrap elements and builders', function () {
            var obj = builder_1.$('#' + fixtureId);
            assert(obj instanceof builder_1.Builder);
            obj = builder_1.$(obj.getHTMLElement());
            assert(obj instanceof builder_1.Builder);
            obj = builder_1.$(obj);
            assert(obj instanceof builder_1.Builder);
        });
        test('$ - delegate to #element', function () {
            var obj = builder_1.$('a', { 'class': 'a1', innerHtml: 'Hello' });
            assert(obj instanceof builder_1.Builder);
            var el = obj.getHTMLElement();
            assert.equal(el.tagName.toLowerCase(), 'a');
            assert.equal(el.className, 'a1');
            assert.equal(el.innerHTML, 'Hello');
        });
        test('$ - html', function () {
            var obj = builder_1.$('<a class="a1">Hello</a>');
            assert(obj instanceof builder_1.Builder);
            var el = obj.getHTMLElement();
            assert.equal(el.tagName.toLowerCase(), 'a');
            assert.equal(el.className, 'a1');
            assert.equal(el.innerHTML, 'Hello');
        });
        test('$ - multiple html tags', function () {
            var objs = builder_1.$('<a class="a1">Hello</a><a class="a2">There</a>');
            assert(objs instanceof builder_1.MultiBuilder);
            assert.equal(objs.length, 2);
            var obj = objs.item(0).getHTMLElement();
            assert.equal(obj.tagName.toLowerCase(), 'a');
            assert.equal(obj.className, 'a1');
            assert.equal(obj.innerHTML, 'Hello');
            obj = objs.item(1).getHTMLElement();
            assert.equal(obj.tagName.toLowerCase(), 'a');
            assert.equal(obj.className, 'a2');
            assert.equal(obj.innerHTML, 'There');
        });
        test('$ - html format', function () {
            var objs = builder_1.$('<a class="{0}">{1}</a><a class="{2}">{3}</a>', 'a1', 'Hello', 'a2', 'There');
            assert(objs instanceof builder_1.MultiBuilder);
            assert.equal(objs.length, 2);
            var obj = objs.item(0).getHTMLElement();
            assert.equal(obj.tagName.toLowerCase(), 'a');
            assert.equal(obj.className, 'a1');
            assert.equal(obj.innerHTML, 'Hello');
            obj = objs.item(1).getHTMLElement();
            assert.equal(obj.tagName.toLowerCase(), 'a');
            assert.equal(obj.className, 'a2');
            assert.equal(obj.innerHTML, 'There');
        });
        test('$ - exceptions', function () {
            assert.throws(function () { builder_1.$(''); });
            assert.throws(function () { builder_1.$(123); });
        });
        test('$ - appendTo, append', function () {
            var peel = builder_1.$('<div class="peel"></div>');
            var core = builder_1.$('<span class="core"></span>').appendTo(peel);
            var obj = peel.getHTMLElement();
            assert(obj);
            assert.equal(obj.tagName.toLowerCase(), 'div');
            assert.equal(obj.className, 'peel');
            assert.equal(obj.children.length, 1);
            assert(obj.firstChild);
            assert.equal(obj.firstChild.children.length, 0);
            assert.equal(obj.firstChild.tagName.toLowerCase(), 'span');
            assert.equal(obj.firstChild.className, 'core');
            obj = core.getHTMLElement();
            assert.equal(obj.children.length, 0);
            assert.equal(obj.tagName.toLowerCase(), 'span');
            assert.equal(obj.className, 'core');
            peel = builder_1.$('<div class="peel"></div>').append(builder_1.$('<span class="core"></span>'));
            obj = peel.getHTMLElement();
            assert(obj);
            assert.equal(obj.tagName.toLowerCase(), 'div');
            assert.equal(obj.className, 'peel');
            assert.equal(obj.children.length, 1);
            assert(obj.firstChild);
            assert.equal(obj.firstChild.children.length, 0);
            assert.equal(obj.firstChild.tagName.toLowerCase(), 'span');
            assert.equal(obj.firstChild.className, 'core');
        });
    });
});
