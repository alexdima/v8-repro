define(["require", "exports", "./linesTextBufferBuilder.test", "vs/editor/test/common/model/linesTextBuffer/textBufferAutoTestUtils"], function (require, exports, linesTextBufferBuilder_test_1, textBufferAutoTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var GENERATE_TESTS = false;
    suite('ModelBuilder Auto Tests', function () {
        test('auto1', function () {
            linesTextBufferBuilder_test_1.testModelBuilder(['sarjniow', '\r', '\nbpb', 'ofb', '\njzldgxx', '\r\nkzwfjysng']);
        });
        test('auto2', function () {
            linesTextBufferBuilder_test_1.testModelBuilder(['i', 'yyernubi\r\niimgn\n', 'ut\r']);
        });
    });
    function generateRandomFile() {
        var lineCount = textBufferAutoTestUtils_1.getRandomInt(1, 10);
        var mixedEOLSequence = textBufferAutoTestUtils_1.getRandomInt(1, 2) === 1 ? true : false;
        var fixedEOL = textBufferAutoTestUtils_1.getRandomEOLSequence();
        var lines = [];
        for (var i = 0; i < lineCount; i++) {
            if (i !== 0) {
                if (mixedEOLSequence) {
                    lines.push(textBufferAutoTestUtils_1.getRandomEOLSequence());
                }
                else {
                    lines.push(fixedEOL);
                }
            }
            lines.push(textBufferAutoTestUtils_1.getRandomString(0, 10));
        }
        return lines.join('');
    }
    function generateRandomChunks(file) {
        var result = [];
        var cnt = textBufferAutoTestUtils_1.getRandomInt(1, 20);
        var maxOffset = file.length;
        while (cnt > 0 && maxOffset > 0) {
            var offset = textBufferAutoTestUtils_1.getRandomInt(0, maxOffset);
            result.unshift(file.substring(offset, maxOffset));
            // let length = getRandomInt(0, maxOffset - offset);
            // let text = generateFile(true);
            // result.push({
            // 	offset: offset,
            // 	length: length,
            // 	text: text
            // });
            maxOffset = offset;
            cnt--;
        }
        if (maxOffset !== 0) {
            result.unshift(file.substring(0, maxOffset));
        }
        return result;
    }
    function testRandomFile(file) {
        var tests = textBufferAutoTestUtils_1.getRandomInt(5, 10);
        for (var i = 0; i < tests; i++) {
            var chunks = generateRandomChunks(file);
            try {
                linesTextBufferBuilder_test_1.testModelBuilder(chunks);
            }
            catch (err) {
                console.log(err);
                console.log(JSON.stringify(chunks));
                return false;
            }
        }
        return true;
    }
    if (GENERATE_TESTS) {
        var number = 1;
        while (true) {
            console.log('------BEGIN NEW TEST: ' + number);
            if (!testRandomFile(generateRandomFile())) {
                break;
            }
            console.log('------END NEW TEST: ' + (number++));
        }
    }
});
