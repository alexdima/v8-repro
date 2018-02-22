/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/idGenerator", "vs/base/common/strings", "vs/base/common/htmlContent", "vs/base/common/marked/marked"], function (require, exports, DOM, idGenerator_1, strings_1, htmlContent_1, marked_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createElement(options) {
        var tagName = options.inline ? 'span' : 'div';
        var element = document.createElement(tagName);
        if (options.className) {
            element.className = options.className;
        }
        return element;
    }
    function renderText(text, options) {
        if (options === void 0) { options = {}; }
        var element = createElement(options);
        element.textContent = text;
        return element;
    }
    exports.renderText = renderText;
    function renderFormattedText(formattedText, options) {
        if (options === void 0) { options = {}; }
        var element = createElement(options);
        _renderFormattedText(element, parseFormattedText(formattedText), options.actionCallback);
        return element;
    }
    exports.renderFormattedText = renderFormattedText;
    /**
     * Create html nodes for the given content element.
     *
     * @param content a html element description
     * @param actionCallback a callback function for any action links in the string. Argument is the zero-based index of the clicked action.
     */
    function renderMarkdown(markdown, options) {
        if (options === void 0) { options = {}; }
        var element = createElement(options);
        // signal to code-block render that the
        // element has been created
        var signalInnerHTML;
        var withInnerHTML = new Promise(function (c) { return signalInnerHTML = c; });
        var renderer = new marked_1.marked.Renderer();
        renderer.image = function (href, title, text) {
            var dimensions = [];
            if (href) {
                var splitted = href.split('|').map(function (s) { return s.trim(); });
                href = splitted[0];
                var parameters = splitted[1];
                if (parameters) {
                    var heightFromParams = /height=(\d+)/.exec(parameters);
                    var widthFromParams = /width=(\d+)/.exec(parameters);
                    var height = (heightFromParams && heightFromParams[1]);
                    var width = (widthFromParams && widthFromParams[1]);
                    var widthIsFinite = isFinite(parseInt(width));
                    var heightIsFinite = isFinite(parseInt(height));
                    if (widthIsFinite) {
                        dimensions.push("width=\"" + width + "\"");
                    }
                    if (heightIsFinite) {
                        dimensions.push("height=\"" + height + "\"");
                    }
                }
            }
            var attributes = [];
            if (href) {
                attributes.push("src=\"" + href + "\"");
            }
            if (text) {
                attributes.push("alt=\"" + text + "\"");
            }
            if (title) {
                attributes.push("title=\"" + title + "\"");
            }
            if (dimensions.length) {
                attributes = attributes.concat(dimensions);
            }
            return '<img ' + attributes.join(' ') + '>';
        };
        renderer.link = function (href, title, text) {
            // Remove markdown escapes. Workaround for https://github.com/chjj/marked/issues/829
            if (href === text) {
                text = htmlContent_1.removeMarkdownEscapes(text);
            }
            title = htmlContent_1.removeMarkdownEscapes(title);
            href = htmlContent_1.removeMarkdownEscapes(href);
            if (!href
                || href.match(/^data:|javascript:/i)
                || (href.match(/^command:/i) && !markdown.isTrusted)) {
                // drop the link
                return text;
            }
            else {
                return "<a href=\"#\" data-href=\"" + href + "\" title=\"" + (title || text) + "\">" + text + "</a>";
            }
        };
        renderer.paragraph = function (text) {
            return "<p>" + text + "</p>";
        };
        if (options.codeBlockRenderer) {
            renderer.code = function (code, lang) {
                var value = options.codeBlockRenderer(lang, code);
                // when code-block rendering is async we return sync
                // but update the node with the real result later.
                var id = idGenerator_1.defaultGenerator.nextId();
                var promise = Promise.all([value, withInnerHTML]).then(function (values) {
                    var strValue = values[0];
                    var span = element.querySelector("div[data-code=\"" + id + "\"]");
                    if (span) {
                        span.innerHTML = strValue;
                    }
                }).catch(function (err) {
                    // ignore
                });
                if (options.codeBlockRenderCallback) {
                    promise.then(options.codeBlockRenderCallback);
                }
                return "<div class=\"code\" data-code=\"" + id + "\">" + strings_1.escape(code) + "</div>";
            };
        }
        if (options.actionCallback) {
            DOM.addStandardDisposableListener(element, 'click', function (event) {
                var target = event.target;
                if (target.tagName !== 'A') {
                    target = target.parentElement;
                    if (!target || target.tagName !== 'A') {
                        return;
                    }
                }
                var href = target.dataset['href'];
                if (href) {
                    options.actionCallback(href, event);
                }
            });
        }
        element.innerHTML = marked_1.marked(markdown.value, {
            sanitize: true,
            renderer: renderer
        });
        signalInnerHTML();
        return element;
    }
    exports.renderMarkdown = renderMarkdown;
    // --- formatted string parsing
    var StringStream = /** @class */ (function () {
        function StringStream(source) {
            this.source = source;
            this.index = 0;
        }
        StringStream.prototype.eos = function () {
            return this.index >= this.source.length;
        };
        StringStream.prototype.next = function () {
            var next = this.peek();
            this.advance();
            return next;
        };
        StringStream.prototype.peek = function () {
            return this.source[this.index];
        };
        StringStream.prototype.advance = function () {
            this.index++;
        };
        return StringStream;
    }());
    var FormatType;
    (function (FormatType) {
        FormatType[FormatType["Invalid"] = 0] = "Invalid";
        FormatType[FormatType["Root"] = 1] = "Root";
        FormatType[FormatType["Text"] = 2] = "Text";
        FormatType[FormatType["Bold"] = 3] = "Bold";
        FormatType[FormatType["Italics"] = 4] = "Italics";
        FormatType[FormatType["Action"] = 5] = "Action";
        FormatType[FormatType["ActionClose"] = 6] = "ActionClose";
        FormatType[FormatType["NewLine"] = 7] = "NewLine";
    })(FormatType || (FormatType = {}));
    function _renderFormattedText(element, treeNode, actionCallback) {
        var child;
        if (treeNode.type === 2 /* Text */) {
            child = document.createTextNode(treeNode.content);
        }
        else if (treeNode.type === 3 /* Bold */) {
            child = document.createElement('b');
        }
        else if (treeNode.type === 4 /* Italics */) {
            child = document.createElement('i');
        }
        else if (treeNode.type === 5 /* Action */) {
            var a = document.createElement('a');
            a.href = '#';
            DOM.addStandardDisposableListener(a, 'click', function (event) {
                actionCallback(String(treeNode.index), event);
            });
            child = a;
        }
        else if (treeNode.type === 7 /* NewLine */) {
            child = document.createElement('br');
        }
        else if (treeNode.type === 1 /* Root */) {
            child = element;
        }
        if (element !== child) {
            element.appendChild(child);
        }
        if (Array.isArray(treeNode.children)) {
            treeNode.children.forEach(function (nodeChild) {
                _renderFormattedText(child, nodeChild, actionCallback);
            });
        }
    }
    function parseFormattedText(content) {
        var root = {
            type: 1 /* Root */,
            children: []
        };
        var actionItemIndex = 0;
        var current = root;
        var stack = [];
        var stream = new StringStream(content);
        while (!stream.eos()) {
            var next = stream.next();
            var isEscapedFormatType = (next === '\\' && formatTagType(stream.peek()) !== 0 /* Invalid */);
            if (isEscapedFormatType) {
                next = stream.next(); // unread the backslash if it escapes a format tag type
            }
            if (!isEscapedFormatType && isFormatTag(next) && next === stream.peek()) {
                stream.advance();
                if (current.type === 2 /* Text */) {
                    current = stack.pop();
                }
                var type = formatTagType(next);
                if (current.type === type || (current.type === 5 /* Action */ && type === 6 /* ActionClose */)) {
                    current = stack.pop();
                }
                else {
                    var newCurrent = {
                        type: type,
                        children: []
                    };
                    if (type === 5 /* Action */) {
                        newCurrent.index = actionItemIndex;
                        actionItemIndex++;
                    }
                    current.children.push(newCurrent);
                    stack.push(current);
                    current = newCurrent;
                }
            }
            else if (next === '\n') {
                if (current.type === 2 /* Text */) {
                    current = stack.pop();
                }
                current.children.push({
                    type: 7 /* NewLine */
                });
            }
            else {
                if (current.type !== 2 /* Text */) {
                    var textCurrent = {
                        type: 2 /* Text */,
                        content: next
                    };
                    current.children.push(textCurrent);
                    stack.push(current);
                    current = textCurrent;
                }
                else {
                    current.content += next;
                }
            }
        }
        if (current.type === 2 /* Text */) {
            current = stack.pop();
        }
        if (stack.length) {
            // incorrectly formatted string literal
        }
        return root;
    }
    function isFormatTag(char) {
        return formatTagType(char) !== 0 /* Invalid */;
    }
    function formatTagType(char) {
        switch (char) {
            case '*':
                return 3 /* Bold */;
            case '_':
                return 4 /* Italics */;
            case '[':
                return 5 /* Action */;
            case ']':
                return 6 /* ActionClose */;
            default:
                return 0 /* Invalid */;
        }
    }
});
