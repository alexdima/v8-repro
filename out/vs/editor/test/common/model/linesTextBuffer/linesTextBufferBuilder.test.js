define(["require", "exports", "assert", "vs/editor/common/model/linesTextBuffer/linesTextBufferBuilder", "vs/editor/common/model/textModel", "vs/base/common/strings"], function (require, exports, assert, linesTextBufferBuilder_1, textModel_1, strings) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var RawTextSource = /** @class */ (function () {
        function RawTextSource() {
        }
        RawTextSource.fromString = function (rawText) {
            // Count the number of lines that end with \r\n
            var carriageReturnCnt = 0;
            var lastCarriageReturnIndex = -1;
            while ((lastCarriageReturnIndex = rawText.indexOf('\r', lastCarriageReturnIndex + 1)) !== -1) {
                carriageReturnCnt++;
            }
            var containsRTL = strings.containsRTL(rawText);
            var isBasicASCII = (containsRTL ? false : strings.isBasicASCII(rawText));
            // Split the text into lines
            var lines = rawText.split(/\r\n|\r|\n/);
            // Remove the BOM (if present)
            var BOM = '';
            if (strings.startsWithUTF8BOM(lines[0])) {
                BOM = strings.UTF8_BOM_CHARACTER;
                lines[0] = lines[0].substr(1);
            }
            return {
                BOM: BOM,
                lines: lines,
                containsRTL: containsRTL,
                isBasicASCII: isBasicASCII,
                totalCRCount: carriageReturnCnt
            };
        };
        return RawTextSource;
    }());
    function testModelBuilder(chunks, opts) {
        if (opts === void 0) { opts = textModel_1.TextModel.DEFAULT_CREATION_OPTIONS; }
        var expectedTextSource = RawTextSource.fromString(chunks.join(''));
        var builder = new linesTextBufferBuilder_1.LinesTextBufferBuilder();
        for (var i = 0, len = chunks.length; i < len; i++) {
            builder.acceptChunk(chunks[i]);
        }
        var actual = builder.finish();
        assert.deepEqual(actual.rawTextSource, expectedTextSource);
    }
    exports.testModelBuilder = testModelBuilder;
    suite('ModelBuilder', function () {
        test('no chunks', function () {
            testModelBuilder([]);
        });
        test('single empty chunk', function () {
            testModelBuilder(['']);
        });
        test('single line in one chunk', function () {
            testModelBuilder(['Hello world']);
        });
        test('single line in multiple chunks', function () {
            testModelBuilder(['Hello', ' ', 'world']);
        });
        test('two lines in single chunk', function () {
            testModelBuilder(['Hello world\nHow are you?']);
        });
        test('two lines in multiple chunks 1', function () {
            testModelBuilder(['Hello worl', 'd\nHow are you?']);
        });
        test('two lines in multiple chunks 2', function () {
            testModelBuilder(['Hello worl', 'd', '\n', 'H', 'ow are you?']);
        });
        test('two lines in multiple chunks 3', function () {
            testModelBuilder(['Hello worl', 'd', '\nHow are you?']);
        });
        test('multiple lines in single chunks', function () {
            testModelBuilder(['Hello world\nHow are you?\nIs everything good today?\nDo you enjoy the weather?']);
        });
        test('multiple lines in multiple chunks 1', function () {
            testModelBuilder(['Hello world\nHow are you', '?\nIs everything good today?\nDo you enjoy the weather?']);
        });
        test('multiple lines in multiple chunks 1', function () {
            testModelBuilder(['Hello world', '\nHow are you', '?\nIs everything good today?', '\nDo you enjoy the weather?']);
        });
        test('multiple lines in multiple chunks 1', function () {
            testModelBuilder(['Hello world\n', 'How are you', '?\nIs everything good today?', '\nDo you enjoy the weather?']);
        });
        test('carriage return detection (1 \\r\\n 2 \\n)', function () {
            testModelBuilder(['Hello world\r\n', 'How are you', '?\nIs everything good today?', '\nDo you enjoy the weather?']);
        });
        test('carriage return detection (2 \\r\\n 1 \\n)', function () {
            testModelBuilder(['Hello world\r\n', 'How are you', '?\r\nIs everything good today?', '\nDo you enjoy the weather?']);
        });
        test('carriage return detection (3 \\r\\n 0 \\n)', function () {
            testModelBuilder(['Hello world\r\n', 'How are you', '?\r\nIs everything good today?', '\r\nDo you enjoy the weather?']);
        });
        test('carriage return detection (isolated \\r)', function () {
            testModelBuilder(['Hello world', '\r', '\n', 'How are you', '?', '\r', '\n', 'Is everything good today?', '\r', '\n', 'Do you enjoy the weather?']);
        });
        test('BOM handling', function () {
            testModelBuilder([strings.UTF8_BOM_CHARACTER + 'Hello world!']);
        });
        test('BOM handling', function () {
            testModelBuilder([strings.UTF8_BOM_CHARACTER, 'Hello world!']);
        });
        test('RTL handling 1', function () {
            testModelBuilder(['Hello world!', 'זוהי עובדה מבוססת שדעתו']);
        });
        test('RTL handling 2', function () {
            testModelBuilder(['Hello world!זוהי עובדה מבוססת שדעתו']);
        });
        test('RTL handling 3', function () {
            testModelBuilder(['Hello world!זוהי \nעובדה מבוססת שדעתו']);
        });
        test('ASCII handling 1', function () {
            testModelBuilder(['Hello world!!\nHow do you do?']);
        });
        test('ASCII handling 1', function () {
            testModelBuilder(['Hello world!!\nHow do you do?Züricha📚📚b']);
        });
        test('issue #32819: some special string cannot be displayed completely', function () {
            testModelBuilder(['ＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡＡ123']);
        });
    });
});
