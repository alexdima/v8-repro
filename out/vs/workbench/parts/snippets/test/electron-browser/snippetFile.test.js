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
define(["require", "exports", "assert", "vs/workbench/parts/snippets/electron-browser/snippetsFile"], function (require, exports, assert, snippetsFile_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Snippets', function () {
        var TestSnippetFile = /** @class */ (function (_super) {
            __extends(TestSnippetFile, _super);
            function TestSnippetFile(filepath, snippets) {
                var _this = _super.call(this, filepath, undefined, undefined) || this;
                (_a = _this.data).push.apply(_a, snippets);
                return _this;
                var _a;
            }
            return TestSnippetFile;
        }(snippetsFile_1.SnippetFile));
        test('SnippetFile#select', function () {
            var file = new TestSnippetFile('somepath/foo.code-snippets', []);
            var bucket = [];
            file.select('', bucket);
            assert.equal(bucket.length, 0);
            file = new TestSnippetFile('somepath/foo.code-snippets', [
                new snippetsFile_1.Snippet(['foo'], 'FooSnippet1', 'foo', '', 'snippet', 'test'),
                new snippetsFile_1.Snippet(['foo'], 'FooSnippet2', 'foo', '', 'snippet', 'test'),
                new snippetsFile_1.Snippet(['bar'], 'BarSnippet1', 'foo', '', 'snippet', 'test'),
                new snippetsFile_1.Snippet(['bar.comment'], 'BarSnippet2', 'foo', '', 'snippet', 'test'),
                new snippetsFile_1.Snippet(['bar.strings'], 'BarSnippet2', 'foo', '', 'snippet', 'test'),
                new snippetsFile_1.Snippet(['bazz', 'bazz'], 'BazzSnippet1', 'foo', '', 'snippet', 'test'),
            ]);
            bucket = [];
            file.select('foo', bucket);
            assert.equal(bucket.length, 2);
            bucket = [];
            file.select('fo', bucket);
            assert.equal(bucket.length, 0);
            bucket = [];
            file.select('bar', bucket);
            assert.equal(bucket.length, 1);
            bucket = [];
            file.select('bar.comment', bucket);
            assert.equal(bucket.length, 2);
            bucket = [];
            file.select('bazz', bucket);
            assert.equal(bucket.length, 1);
        });
        test('SnippetFile#select - any scope', function () {
            var file = new TestSnippetFile('somepath/foo.code-snippets', [
                new snippetsFile_1.Snippet([], 'AnySnippet1', 'foo', '', 'snippet', 'test'),
                new snippetsFile_1.Snippet(['foo'], 'FooSnippet1', 'foo', '', 'snippet', 'test'),
            ]);
            var bucket = [];
            file.select('foo', bucket);
            assert.equal(bucket.length, 2);
        });
    });
});
