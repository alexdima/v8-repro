define(["require", "exports", "assert", "vs/base/common/marked/marked", "vs/base/browser/htmlContentRenderer"], function (require, exports, assert, marked_1, htmlContentRenderer_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('HtmlContent', function () {
        test('render simple element', function () {
            var result = htmlContentRenderer_1.renderText('testing');
            assert.strictEqual(result.nodeType, document.ELEMENT_NODE);
            assert.strictEqual(result.textContent, 'testing');
            assert.strictEqual(result.tagName, 'DIV');
        });
        test('render element with class', function () {
            var result = htmlContentRenderer_1.renderText('testing', {
                className: 'testClass'
            });
            assert.strictEqual(result.nodeType, document.ELEMENT_NODE);
            assert.strictEqual(result.className, 'testClass');
        });
        test('simple formatting', function () {
            var result = htmlContentRenderer_1.renderFormattedText('**bold**');
            assert.strictEqual(result.children.length, 1);
            assert.strictEqual(result.firstChild.textContent, 'bold');
            assert.strictEqual(result.firstChild.tagName, 'B');
            assert.strictEqual(result.innerHTML, '<b>bold</b>');
            result = htmlContentRenderer_1.renderFormattedText('__italics__');
            assert.strictEqual(result.innerHTML, '<i>italics</i>');
            result = htmlContentRenderer_1.renderFormattedText('this string has **bold** and __italics__');
            assert.strictEqual(result.innerHTML, 'this string has <b>bold</b> and <i>italics</i>');
        });
        test('no formatting', function () {
            var result = htmlContentRenderer_1.renderFormattedText('this is just a string');
            assert.strictEqual(result.innerHTML, 'this is just a string');
        });
        test('preserve newlines', function () {
            var result = htmlContentRenderer_1.renderFormattedText('line one\nline two');
            assert.strictEqual(result.innerHTML, 'line one<br>line two');
        });
        test('action', function () {
            var callbackCalled = false;
            var result = htmlContentRenderer_1.renderFormattedText('[[action]]', {
                actionCallback: function (content) {
                    assert.strictEqual(content, '0');
                    callbackCalled = true;
                }
            });
            assert.strictEqual(result.innerHTML, '<a href="#">action</a>');
            var event = document.createEvent('MouseEvent');
            event.initEvent('click', true, true);
            result.firstChild.dispatchEvent(event);
            assert.strictEqual(callbackCalled, true);
        });
        test('fancy action', function () {
            var callbackCalled = false;
            var result = htmlContentRenderer_1.renderFormattedText('__**[[action]]**__', {
                actionCallback: function (content) {
                    assert.strictEqual(content, '0');
                    callbackCalled = true;
                }
            });
            assert.strictEqual(result.innerHTML, '<i><b><a href="#">action</a></b></i>');
            var event = document.createEvent('MouseEvent');
            event.initEvent('click', true, true);
            result.firstChild.firstChild.firstChild.dispatchEvent(event);
            assert.strictEqual(callbackCalled, true);
        });
        test('escaped formatting', function () {
            var result = htmlContentRenderer_1.renderFormattedText('\\*\\*bold\\*\\*');
            assert.strictEqual(result.children.length, 0);
            assert.strictEqual(result.innerHTML, '**bold**');
        });
        test('image rendering conforms to default', function () {
            var markdown = { value: "![image](someimageurl 'caption')" };
            var result = htmlContentRenderer_1.renderMarkdown(markdown);
            var renderer = new marked_1.marked.Renderer();
            var imageFromMarked = marked_1.marked(markdown.value, {
                sanitize: true,
                renderer: renderer
            }).trim();
            assert.strictEqual(result.innerHTML, imageFromMarked);
        });
        test('image rendering conforms to default without title', function () {
            var markdown = { value: "![image](someimageurl)" };
            var result = htmlContentRenderer_1.renderMarkdown(markdown);
            var renderer = new marked_1.marked.Renderer();
            var imageFromMarked = marked_1.marked(markdown.value, {
                sanitize: true,
                renderer: renderer
            }).trim();
            assert.strictEqual(result.innerHTML, imageFromMarked);
        });
        test('image width from title params', function () {
            var result = htmlContentRenderer_1.renderMarkdown({ value: "![image](someimageurl|width=100 'caption')" });
            assert.strictEqual(result.innerHTML, "<p><img src=\"someimageurl\" alt=\"image\" title=\"caption\" width=\"100\"></p>");
        });
        test('image height from title params', function () {
            var result = htmlContentRenderer_1.renderMarkdown({ value: "![image](someimageurl|height=100 'caption')" });
            assert.strictEqual(result.innerHTML, "<p><img src=\"someimageurl\" alt=\"image\" title=\"caption\" height=\"100\"></p>");
        });
        test('image width and height from title params', function () {
            var result = htmlContentRenderer_1.renderMarkdown({ value: "![image](someimageurl|height=200,width=100 'caption')" });
            assert.strictEqual(result.innerHTML, "<p><img src=\"someimageurl\" alt=\"image\" title=\"caption\" width=\"100\" height=\"200\"></p>");
        });
    });
});
