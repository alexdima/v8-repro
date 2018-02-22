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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/node/extHostDocumentData", "vs/workbench/api/node/extHostTypes", "vs/editor/common/core/range", "vs/base/common/winjs.base", "vs/workbench/test/electron-browser/api/mock"], function (require, exports, assert, uri_1, extHostDocumentData_1, extHostTypes_1, range_1, winjs_base_1, mock_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDocumentData', function () {
        var data;
        function assertPositionAt(offset, line, character) {
            var position = data.document.positionAt(offset);
            assert.equal(position.line, line);
            assert.equal(position.character, character);
        }
        function assertOffsetAt(line, character, offset) {
            var pos = new extHostTypes_1.Position(line, character);
            var actual = data.document.offsetAt(pos);
            assert.equal(actual, offset);
        }
        setup(function () {
            data = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.default.file(''), [
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], '\n', 'text', 1, false);
        });
        test('readonly-ness', function () {
            assert.throws(function () { return data.document.uri = null; });
            assert.throws(function () { return data.document.fileName = 'foofile'; });
            assert.throws(function () { return data.document.isDirty = false; });
            assert.throws(function () { return data.document.isUntitled = false; });
            assert.throws(function () { return data.document.languageId = 'dddd'; });
            assert.throws(function () { return data.document.lineCount = 9; });
        });
        test('save, when disposed', function () {
            var saved;
            var data = new extHostDocumentData_1.ExtHostDocumentData(new /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_1.prototype.$trySaveDocument = function (uri) {
                    assert.ok(!saved);
                    saved = uri;
                    return winjs_base_1.TPromise.as(true);
                };
                return class_1;
            }(mock_1.mock())), uri_1.default.parse('foo:bar'), [], '\n', 'text', 1, true);
            return data.document.save().then(function () {
                assert.equal(saved.toString(), 'foo:bar');
                data.dispose();
                return data.document.save().then(function () {
                    assert.ok(false, 'expected failure');
                }, function (err) {
                    assert.ok(err);
                });
            });
        });
        test('read, when disposed', function () {
            data.dispose();
            var document = data.document;
            assert.equal(document.lineCount, 4);
            assert.equal(document.lineAt(0).text, 'This is line one');
        });
        test('lines', function () {
            assert.equal(data.document.lineCount, 4);
            assert.throws(function () { return data.document.lineAt(-1); });
            assert.throws(function () { return data.document.lineAt(data.document.lineCount); });
            assert.throws(function () { return data.document.lineAt(Number.MAX_VALUE); });
            assert.throws(function () { return data.document.lineAt(Number.MIN_VALUE); });
            assert.throws(function () { return data.document.lineAt(0.8); });
            var line = data.document.lineAt(0);
            assert.equal(line.lineNumber, 0);
            assert.equal(line.text.length, 16);
            assert.equal(line.text, 'This is line one');
            assert.equal(line.isEmptyOrWhitespace, false);
            assert.equal(line.firstNonWhitespaceCharacterIndex, 0);
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
                        rangeLength: undefined,
                        text: '\t '
                    }],
                eol: undefined,
                versionId: undefined,
            });
            // line didn't change
            assert.equal(line.text, 'This is line one');
            assert.equal(line.firstNonWhitespaceCharacterIndex, 0);
            // fetch line again
            line = data.document.lineAt(0);
            assert.equal(line.text, '\t This is line one');
            assert.equal(line.firstNonWhitespaceCharacterIndex, 2);
        });
        test('line, issue #5704', function () {
            var line = data.document.lineAt(0);
            var range = line.range, rangeIncludingLineBreak = line.rangeIncludingLineBreak;
            assert.equal(range.end.line, 0);
            assert.equal(range.end.character, 16);
            assert.equal(rangeIncludingLineBreak.end.line, 1);
            assert.equal(rangeIncludingLineBreak.end.character, 0);
            line = data.document.lineAt(data.document.lineCount - 1);
            range = line.range;
            rangeIncludingLineBreak = line.rangeIncludingLineBreak;
            assert.equal(range.end.line, 3);
            assert.equal(range.end.character, 29);
            assert.equal(rangeIncludingLineBreak.end.line, 3);
            assert.equal(rangeIncludingLineBreak.end.character, 29);
        });
        test('offsetAt', function () {
            assertOffsetAt(0, 0, 0);
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 16, 16);
            assertOffsetAt(1, 0, 17);
            assertOffsetAt(1, 3, 20);
            assertOffsetAt(2, 0, 45);
            assertOffsetAt(4, 29, 95);
            assertOffsetAt(4, 30, 95);
            assertOffsetAt(4, Number.MAX_VALUE, 95);
            assertOffsetAt(5, 29, 95);
            assertOffsetAt(Number.MAX_VALUE, 29, 95);
            assertOffsetAt(Number.MAX_VALUE, Number.MAX_VALUE, 95);
        });
        test('offsetAt, after remove', function () {
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 3, endLineNumber: 1, endColumn: 6 },
                        rangeLength: undefined,
                        text: ''
                    }],
                eol: undefined,
                versionId: undefined,
            });
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 13, 13);
            assertOffsetAt(1, 0, 14);
        });
        test('offsetAt, after replace', function () {
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 3, endLineNumber: 1, endColumn: 6 },
                        rangeLength: undefined,
                        text: 'is could be'
                    }],
                eol: undefined,
                versionId: undefined,
            });
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 24, 24);
            assertOffsetAt(1, 0, 25);
        });
        test('offsetAt, after insert line', function () {
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 3, endLineNumber: 1, endColumn: 6 },
                        rangeLength: undefined,
                        text: 'is could be\na line with number'
                    }],
                eol: undefined,
                versionId: undefined,
            });
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 13, 13);
            assertOffsetAt(1, 0, 14);
            assertOffsetAt(1, 18, 13 + 1 + 18);
            assertOffsetAt(1, 29, 13 + 1 + 29);
            assertOffsetAt(2, 0, 13 + 1 + 29 + 1);
        });
        test('offsetAt, after remove line', function () {
            data.onEvents({
                changes: [{
                        range: { startLineNumber: 1, startColumn: 3, endLineNumber: 2, endColumn: 6 },
                        rangeLength: undefined,
                        text: ''
                    }],
                eol: undefined,
                versionId: undefined,
            });
            assertOffsetAt(0, 1, 1);
            assertOffsetAt(0, 2, 2);
            assertOffsetAt(1, 0, 25);
        });
        test('positionAt', function () {
            assertPositionAt(0, 0, 0);
            assertPositionAt(Number.MIN_VALUE, 0, 0);
            assertPositionAt(1, 0, 1);
            assertPositionAt(16, 0, 16);
            assertPositionAt(17, 1, 0);
            assertPositionAt(20, 1, 3);
            assertPositionAt(45, 2, 0);
            assertPositionAt(95, 3, 29);
            assertPositionAt(96, 3, 29);
            assertPositionAt(99, 3, 29);
            assertPositionAt(Number.MAX_VALUE, 3, 29);
        });
        test('getWordRangeAtPosition', function () {
            data = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.default.file(''), [
                'aaaa bbbb+cccc abc'
            ], '\n', 'text', 1, false);
            var range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 2));
            assert.equal(range.start.line, 0);
            assert.equal(range.start.character, 0);
            assert.equal(range.end.line, 0);
            assert.equal(range.end.character, 4);
            // ignore bad regular expresson /.*/
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 2), /.*/);
            assert.equal(range.start.line, 0);
            assert.equal(range.start.character, 0);
            assert.equal(range.end.line, 0);
            assert.equal(range.end.character, 4);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 5), /[a-z+]+/);
            assert.equal(range.start.line, 0);
            assert.equal(range.start.character, 5);
            assert.equal(range.end.line, 0);
            assert.equal(range.end.character, 14);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 17), /[a-z+]+/);
            assert.equal(range.start.line, 0);
            assert.equal(range.start.character, 15);
            assert.equal(range.end.line, 0);
            assert.equal(range.end.character, 18);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 11), /yy/);
            assert.equal(range, undefined);
        });
        test('getWordRangeAtPosition doesn\'t quite use the regex as expected, #29102', function () {
            data = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.default.file(''), [
                'some text here',
                '/** foo bar */',
                'function() {',
                '	"far boo"',
                '}'
            ], '\n', 'text', 1, false);
            var range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(0, 0), /\/\*.+\*\//);
            assert.equal(range, undefined);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(1, 0), /\/\*.+\*\//);
            assert.equal(range.start.line, 1);
            assert.equal(range.start.character, 0);
            assert.equal(range.end.line, 1);
            assert.equal(range.end.character, 14);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(3, 0), /("|').*\1/);
            assert.equal(range, undefined);
            range = data.document.getWordRangeAtPosition(new extHostTypes_1.Position(3, 1), /("|').*\1/);
            assert.equal(range.start.line, 3);
            assert.equal(range.start.character, 1);
            assert.equal(range.end.line, 3);
            assert.equal(range.end.character, 10);
        });
    });
    var AssertDocumentLineMappingDirection;
    (function (AssertDocumentLineMappingDirection) {
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["OffsetToPosition"] = 0] = "OffsetToPosition";
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["PositionToOffset"] = 1] = "PositionToOffset";
    })(AssertDocumentLineMappingDirection || (AssertDocumentLineMappingDirection = {}));
    suite('ExtHostDocumentData updates line mapping', function () {
        function positionToStr(position) {
            return '(' + position.line + ',' + position.character + ')';
        }
        function assertDocumentLineMapping(doc, direction) {
            var allText = doc.getText();
            var line = 0, character = 0, previousIsCarriageReturn = false;
            for (var offset = 0; offset <= allText.length; offset++) {
                // The position coordinate system cannot express the position between \r and \n
                var position = new extHostTypes_1.Position(line, character + (previousIsCarriageReturn ? -1 : 0));
                if (direction === AssertDocumentLineMappingDirection.OffsetToPosition) {
                    var actualPosition = doc.document.positionAt(offset);
                    assert.equal(positionToStr(actualPosition), positionToStr(position), 'positionAt mismatch for offset ' + offset);
                }
                else {
                    // The position coordinate system cannot express the position between \r and \n
                    var expectedOffset = offset + (previousIsCarriageReturn ? -1 : 0);
                    var actualOffset = doc.document.offsetAt(position);
                    assert.equal(actualOffset, expectedOffset, 'offsetAt mismatch for position ' + positionToStr(position));
                }
                if (allText.charAt(offset) === '\n') {
                    line++;
                    character = 0;
                }
                else {
                    character++;
                }
                previousIsCarriageReturn = (allText.charAt(offset) === '\r');
            }
        }
        function createChangeEvent(range, text, eol) {
            return {
                changes: [{
                        range: range,
                        rangeLength: undefined,
                        text: text
                    }],
                eol: eol,
                versionId: undefined,
            };
        }
        function testLineMappingDirectionAfterEvents(lines, eol, direction, e) {
            var myDocument = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.default.file(''), lines.slice(0), eol, 'text', 1, false);
            assertDocumentLineMapping(myDocument, direction);
            myDocument.onEvents(e);
            assertDocumentLineMapping(myDocument, direction);
        }
        function testLineMappingAfterEvents(lines, e) {
            testLineMappingDirectionAfterEvents(lines, '\n', AssertDocumentLineMappingDirection.PositionToOffset, e);
            testLineMappingDirectionAfterEvents(lines, '\n', AssertDocumentLineMappingDirection.OffsetToPosition, e);
            testLineMappingDirectionAfterEvents(lines, '\r\n', AssertDocumentLineMappingDirection.PositionToOffset, e);
            testLineMappingDirectionAfterEvents(lines, '\r\n', AssertDocumentLineMappingDirection.OffsetToPosition, e);
        }
        test('line mapping', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], { changes: [], eol: undefined, versionId: 7 });
        });
        test('after remove', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 1, 6), ''));
        });
        test('after replace', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 1, 6), 'is could be'));
        });
        test('after insert line', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 1, 6), 'is could be\na line with number'));
        });
        test('after insert two lines', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 1, 6), 'is could be\na line with number\nyet another line'));
        });
        test('after remove line', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 2, 6), ''));
        });
        test('after remove two lines', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 3, 6), ''));
        });
        test('after deleting entire content', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 4, 30), ''));
        });
        test('after replacing entire content', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 3, 4, 30), 'some new text\nthat\nspans multiple lines'));
        });
        test('after changing EOL to CRLF', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 1, 1, 1), '', '\r\n'));
        });
        test('after changing EOL to LF', function () {
            testLineMappingAfterEvents([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ], createChangeEvent(new range_1.Range(1, 1, 1, 1), '', '\n'));
        });
    });
});
