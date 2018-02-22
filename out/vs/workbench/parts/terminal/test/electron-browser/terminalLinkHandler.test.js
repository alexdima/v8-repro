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
define(["require", "exports", "assert", "vs/base/common/platform", "vs/workbench/parts/terminal/electron-browser/terminalLinkHandler", "vs/base/common/strings", "path", "sinon"], function (require, exports, assert, platform_1, terminalLinkHandler_1, strings, path, sinon) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestTerminalLinkHandler = /** @class */ (function (_super) {
        __extends(TestTerminalLinkHandler, _super);
        function TestTerminalLinkHandler() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(TestTerminalLinkHandler.prototype, "localLinkRegex", {
            get: function () {
                return this._localLinkRegex;
            },
            enumerable: true,
            configurable: true
        });
        TestTerminalLinkHandler.prototype.preprocessPath = function (link) {
            return this._preprocessPath(link);
        };
        return TestTerminalLinkHandler;
    }(terminalLinkHandler_1.TerminalLinkHandler));
    var TestXterm = /** @class */ (function () {
        function TestXterm() {
        }
        TestXterm.prototype.setHypertextLinkHandler = function () { };
        TestXterm.prototype.setHypertextValidationCallback = function () { };
        return TestXterm;
    }());
    suite('Workbench - TerminalLinkHandler', function () {
        suite('localLinkRegex', function () {
            test('Windows', function () {
                var terminalLinkHandler = new TestTerminalLinkHandler(new TestXterm(), platform_1.Platform.Windows, null, null, null, null);
                function testLink(link, linkUrl, lineNo, columnNo) {
                    assert.equal(terminalLinkHandler.extractLinkUrl(link), linkUrl);
                    assert.equal(terminalLinkHandler.extractLinkUrl(":" + link + ":"), linkUrl);
                    assert.equal(terminalLinkHandler.extractLinkUrl(";" + link + ";"), linkUrl);
                    assert.equal(terminalLinkHandler.extractLinkUrl("(" + link + ")"), linkUrl);
                    if (lineNo) {
                        var lineColumnInfo = terminalLinkHandler.extractLineColumnInfo(link);
                        assert.equal(lineColumnInfo.lineNumber, lineNo);
                        if (columnNo) {
                            assert.equal(lineColumnInfo.columnNumber, columnNo);
                        }
                    }
                }
                function generateAndTestLinks() {
                    var linkUrls = [
                        'c:\\foo',
                        'c:/foo',
                        '.\\foo',
                        './foo',
                        '..\\foo',
                        '~\\foo',
                        '~/foo',
                        'c:/a/long/path',
                        'c:\\a\\long\\path',
                        'c:\\mixed/slash\\path',
                        'a/relative/path'
                    ];
                    var supportedLinkFormats = [
                        { urlFormat: '{0}' },
                        { urlFormat: '{0} on line {1}', line: '5' },
                        { urlFormat: '{0} on line {1}, column {2}', line: '5', column: '3' },
                        { urlFormat: '{0}:line {1}', line: '5' },
                        { urlFormat: '{0}:line {1}, column {2}', line: '5', column: '3' },
                        { urlFormat: '{0}({1})', line: '5' },
                        { urlFormat: '{0} ({1})', line: '5' },
                        { urlFormat: '{0}({1},{2})', line: '5', column: '3' },
                        { urlFormat: '{0} ({1},{2})', line: '5', column: '3' },
                        { urlFormat: '{0}({1}, {2})', line: '5', column: '3' },
                        { urlFormat: '{0} ({1}, {2})', line: '5', column: '3' },
                        { urlFormat: '{0}:{1}', line: '5' },
                        { urlFormat: '{0}:{1}:{2}', line: '5', column: '3' },
                        { urlFormat: '{0}[{1}]', line: '5' },
                        { urlFormat: '{0} [{1}]', line: '5' },
                        { urlFormat: '{0}[{1},{2}]', line: '5', column: '3' },
                        { urlFormat: '{0} [{1},{2}]', line: '5', column: '3' },
                        { urlFormat: '{0}[{1}, {2}]', line: '5', column: '3' },
                        { urlFormat: '{0} [{1}, {2}]', line: '5', column: '3' }
                    ];
                    linkUrls.forEach(function (linkUrl) {
                        supportedLinkFormats.forEach(function (linkFormatInfo) {
                            testLink(strings.format(linkFormatInfo.urlFormat, linkUrl, linkFormatInfo.line, linkFormatInfo.column), linkUrl, linkFormatInfo.line, linkFormatInfo.column);
                        });
                    });
                }
                generateAndTestLinks();
            });
            test('Linux', function () {
                var terminalLinkHandler = new TestTerminalLinkHandler(new TestXterm(), platform_1.Platform.Linux, null, null, null, null);
                function testLink(link, linkUrl, lineNo, columnNo) {
                    assert.equal(terminalLinkHandler.extractLinkUrl(link), linkUrl);
                    assert.equal(terminalLinkHandler.extractLinkUrl(":" + link + ":"), linkUrl);
                    assert.equal(terminalLinkHandler.extractLinkUrl(";" + link + ";"), linkUrl);
                    assert.equal(terminalLinkHandler.extractLinkUrl("(" + link + ")"), linkUrl);
                    if (lineNo) {
                        var lineColumnInfo = terminalLinkHandler.extractLineColumnInfo(link);
                        assert.equal(lineColumnInfo.lineNumber, lineNo);
                        if (columnNo) {
                            assert.equal(lineColumnInfo.columnNumber, columnNo);
                        }
                    }
                }
                function generateAndTestLinks() {
                    var linkUrls = [
                        '/foo',
                        '~/foo',
                        './foo',
                        '../foo',
                        '/a/long/path',
                        'a/relative/path'
                    ];
                    var supportedLinkFormats = [
                        { urlFormat: '{0}' },
                        { urlFormat: '{0} on line {1}', line: '5' },
                        { urlFormat: '{0} on line {1}, column {2}', line: '5', column: '3' },
                        { urlFormat: '{0}:line {1}', line: '5' },
                        { urlFormat: '{0}:line {1}, column {2}', line: '5', column: '3' },
                        { urlFormat: '{0}({1})', line: '5' },
                        { urlFormat: '{0} ({1})', line: '5' },
                        { urlFormat: '{0}({1},{2})', line: '5', column: '3' },
                        { urlFormat: '{0} ({1},{2})', line: '5', column: '3' },
                        { urlFormat: '{0}:{1}', line: '5' },
                        { urlFormat: '{0}:{1}:{2}', line: '5', column: '3' },
                        { urlFormat: '{0}[{1}]', line: '5' },
                        { urlFormat: '{0} [{1}]', line: '5' },
                        { urlFormat: '{0}[{1},{2}]', line: '5', column: '3' },
                        { urlFormat: '{0} [{1},{2}]', line: '5', column: '3' }
                    ];
                    linkUrls.forEach(function (linkUrl) {
                        supportedLinkFormats.forEach(function (linkFormatInfo) {
                            // console.log('linkFormatInfo: ', linkFormatInfo);
                            testLink(strings.format(linkFormatInfo.urlFormat, linkUrl, linkFormatInfo.line, linkFormatInfo.column), linkUrl, linkFormatInfo.line, linkFormatInfo.column);
                        });
                    });
                }
                generateAndTestLinks();
            });
        });
        suite('preprocessPath', function () {
            test('Windows', function () {
                var linkHandler = new TestTerminalLinkHandler(new TestXterm(), platform_1.Platform.Windows, 'C:\\base', null, null, null);
                var stub = sinon.stub(path, 'join', function (arg1, arg2) {
                    return arg1 + '\\' + arg2;
                });
                assert.equal(linkHandler.preprocessPath('./src/file1'), 'C:\\base\\./src/file1');
                assert.equal(linkHandler.preprocessPath('src\\file2'), 'C:\\base\\src\\file2');
                assert.equal(linkHandler.preprocessPath('C:\\absolute\\path\\file3'), 'C:\\absolute\\path\\file3');
                stub.restore();
            });
            test('Linux', function () {
                var linkHandler = new TestTerminalLinkHandler(new TestXterm(), platform_1.Platform.Linux, '/base', null, null, null);
                var stub = sinon.stub(path, 'join', function (arg1, arg2) {
                    return arg1 + '/' + arg2;
                });
                assert.equal(linkHandler.preprocessPath('./src/file1'), '/base/./src/file1');
                assert.equal(linkHandler.preprocessPath('src/file2'), '/base/src/file2');
                assert.equal(linkHandler.preprocessPath('/absolute/path/file3'), '/absolute/path/file3');
                stub.restore();
            });
            test('No Workspace', function () {
                var linkHandler = new TestTerminalLinkHandler(new TestXterm(), platform_1.Platform.Linux, null, null, null, null);
                assert.equal(linkHandler.preprocessPath('./src/file1'), null);
                assert.equal(linkHandler.preprocessPath('src/file2'), null);
                assert.equal(linkHandler.preprocessPath('/absolute/path/file3'), '/absolute/path/file3');
            });
        });
    });
});
