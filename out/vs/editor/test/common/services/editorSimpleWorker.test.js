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
define(["require", "exports", "assert", "vs/editor/common/services/editorSimpleWorker", "vs/editor/common/core/range"], function (require, exports, assert, editorSimpleWorker_1, range_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorSimpleWorker', function () {
        var WorkerWithModels = /** @class */ (function (_super) {
            __extends(WorkerWithModels, _super);
            function WorkerWithModels() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            WorkerWithModels.prototype.getModel = function (uri) {
                return this._getModel(uri);
            };
            WorkerWithModels.prototype.addModel = function (lines, eol) {
                if (eol === void 0) { eol = '\n'; }
                var uri = 'test:file#' + Date.now();
                this.acceptNewModel({
                    url: uri,
                    versionId: 1,
                    lines: lines,
                    EOL: eol
                });
                return this._getModel(uri);
            };
            return WorkerWithModels;
        }(editorSimpleWorker_1.EditorSimpleWorkerImpl));
        var worker;
        var model;
        setup(function () {
            worker = new WorkerWithModels();
            model = worker.addModel([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ]);
        });
        function assertPositionAt(offset, line, column) {
            var position = model.positionAt(offset);
            assert.equal(position.lineNumber, line);
            assert.equal(position.column, column);
        }
        function assertOffsetAt(lineNumber, column, offset) {
            var actual = model.offsetAt({ lineNumber: lineNumber, column: column });
            assert.equal(actual, offset);
        }
        test('ICommonModel#offsetAt', function () {
            assertOffsetAt(1, 1, 0);
            assertOffsetAt(1, 2, 1);
            assertOffsetAt(1, 17, 16);
            assertOffsetAt(2, 1, 17);
            assertOffsetAt(2, 4, 20);
            assertOffsetAt(3, 1, 45);
            assertOffsetAt(5, 30, 95);
            assertOffsetAt(5, 31, 95);
            assertOffsetAt(5, Number.MAX_VALUE, 95);
            assertOffsetAt(6, 30, 95);
            assertOffsetAt(Number.MAX_VALUE, 30, 95);
            assertOffsetAt(Number.MAX_VALUE, Number.MAX_VALUE, 95);
        });
        test('ICommonModel#positionAt', function () {
            assertPositionAt(0, 1, 1);
            assertPositionAt(Number.MIN_VALUE, 1, 1);
            assertPositionAt(1, 1, 2);
            assertPositionAt(16, 1, 17);
            assertPositionAt(17, 2, 1);
            assertPositionAt(20, 2, 4);
            assertPositionAt(45, 3, 1);
            assertPositionAt(95, 4, 30);
            assertPositionAt(96, 4, 30);
            assertPositionAt(99, 4, 30);
            assertPositionAt(Number.MAX_VALUE, 4, 30);
        });
        test('ICommonModel#validatePosition, issue #15882', function () {
            var model = worker.addModel(['{"id": "0001","type": "donut","name": "Cake","image":{"url": "images/0001.jpg","width": 200,"height": 200},"thumbnail":{"url": "images/thumbnails/0001.jpg","width": 32,"height": 32}}']);
            assert.equal(model.offsetAt({ lineNumber: 1, column: 2 }), 1);
        });
        test('MoreMinimal', function () {
            return worker.computeMoreMinimalEdits(model.uri.toString(), [{ text: 'This is line One', range: new range_1.Range(1, 1, 1, 17) }]).then(function (edits) {
                assert.equal(edits.length, 1);
                var first = edits[0];
                assert.equal(first.text, 'O');
                assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 14, endLineNumber: 1, endColumn: 15 });
            });
        });
        test('MoreMinimal, issue #15385 newline changes only', function () {
            var model = worker.addModel([
                '{',
                '\t"a":1',
                '}'
            ], '\n');
            return worker.computeMoreMinimalEdits(model.uri.toString(), [{ text: '{\r\n\t"a":1\r\n}', range: new range_1.Range(1, 1, 3, 2) }]).then(function (edits) {
                assert.equal(edits.length, 0);
            });
        });
        test('MoreMinimal, issue #15385 newline changes and other', function () {
            var model = worker.addModel([
                '{',
                '\t"a":1',
                '}'
            ], '\n');
            return worker.computeMoreMinimalEdits(model.uri.toString(), [{ text: '{\r\n\t"b":1\r\n}', range: new range_1.Range(1, 1, 3, 2) }]).then(function (edits) {
                assert.equal(edits.length, 1);
                var first = edits[0];
                assert.equal(first.text, 'b');
                assert.deepEqual(first.range, { startLineNumber: 2, startColumn: 3, endLineNumber: 2, endColumn: 4 });
            });
        });
        test('MoreMinimal, issue #15385 newline changes and other', function () {
            var model = worker.addModel([
                'package main',
                'func foo() {',
                '}' // 3
            ]);
            return worker.computeMoreMinimalEdits(model.uri.toString(), [{ text: '\n', range: new range_1.Range(3, 2, 4, 1000) }]).then(function (edits) {
                assert.equal(edits.length, 1);
                var first = edits[0];
                assert.equal(first.text, '\n');
                assert.deepEqual(first.range, { startLineNumber: 3, startColumn: 2, endLineNumber: 3, endColumn: 2 });
            });
        });
        test('ICommonModel#getValueInRange, issue #17424', function () {
            var model = worker.addModel([
                'package main',
                'func foo() {',
                '}' // 3
            ]);
            var value = model.getValueInRange({ startLineNumber: 3, startColumn: 1, endLineNumber: 4, endColumn: 1 });
            assert.equal(value, '}');
        });
        test('textualSuggest, issue #17785', function () {
            var model = worker.addModel([
                'foobar',
                'f f' // 2
            ]);
            return worker.textualSuggest(model.uri.toString(), { lineNumber: 2, column: 2 }, '[a-z]+', 'img').then(function (result) {
                var suggestions = result.suggestions;
                assert.equal(suggestions.length, 1);
                assert.equal(suggestions[0].label, 'foobar');
            });
        });
    });
});
