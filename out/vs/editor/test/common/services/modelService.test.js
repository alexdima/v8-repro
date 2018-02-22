define(["require", "exports", "assert", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/base/common/uri", "vs/base/common/platform", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/stringBuilder"], function (require, exports, assert, testConfigurationService_1, modelServiceImpl_1, uri_1, platform, model_1, textModel_1, editOperation_1, range_1, stringBuilder_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var GENERATE_TESTS = false;
    suite('ModelService', function () {
        var modelService;
        setup(function () {
            var configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'eol': '\n' });
            configService.setUserConfiguration('files', { 'eol': '\r\n' }, uri_1.default.file(platform.isWindows ? 'c:\\myroot' : '/myroot'));
            modelService = new modelServiceImpl_1.ModelServiceImpl(null, configService);
        });
        teardown(function () {
            modelService.dispose();
        });
        test('EOL setting respected depending on root', function () {
            var model1 = modelService.createModel('farboo', null, null);
            var model2 = modelService.createModel('farboo', null, uri_1.default.file(platform.isWindows ? 'c:\\myroot\\myfile.txt' : '/myroot/myfile.txt'));
            var model3 = modelService.createModel('farboo', null, uri_1.default.file(platform.isWindows ? 'c:\\other\\myfile.txt' : '/other/myfile.txt'));
            assert.equal(model1.getOptions().defaultEOL, model_1.DefaultEndOfLine.LF);
            assert.equal(model2.getOptions().defaultEOL, model_1.DefaultEndOfLine.CRLF);
            assert.equal(model3.getOptions().defaultEOL, model_1.DefaultEndOfLine.LF);
        });
        test('_computeEdits first line changed', function () {
            var model = textModel_1.TextModel.createFromString([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ].join('\n'));
            var textBuffer = textModel_1.createTextBuffer([
                'This is line One',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ].join('\n'), model_1.DefaultEndOfLine.LF);
            var actual = modelServiceImpl_1.ModelServiceImpl._computeEdits(model, textBuffer);
            assert.deepEqual(actual, [
                editOperation_1.EditOperation.replace(new range_1.Range(1, 1, 1, 17), 'This is line One')
            ]);
        });
        test('_computeEdits EOL changed', function () {
            var model = textModel_1.TextModel.createFromString([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ].join('\n'));
            var textBuffer = textModel_1.createTextBuffer([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ].join('\r\n'), model_1.DefaultEndOfLine.LF);
            var actual = modelServiceImpl_1.ModelServiceImpl._computeEdits(model, textBuffer);
            assert.deepEqual(actual, []);
        });
        test('_computeEdits EOL and other change 1', function () {
            var model = textModel_1.TextModel.createFromString([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.',
            ].join('\n'));
            var textBuffer = textModel_1.createTextBuffer([
                'This is line One',
                'and this is line number two',
                'It is followed by #3',
                'and finished with the fourth.',
            ].join('\r\n'), model_1.DefaultEndOfLine.LF);
            var actual = modelServiceImpl_1.ModelServiceImpl._computeEdits(model, textBuffer);
            assert.deepEqual(actual, [
                editOperation_1.EditOperation.replace(new range_1.Range(1, 1, 1, 17), 'This is line One'),
                editOperation_1.EditOperation.replace(new range_1.Range(3, 1, 3, 21), 'It is followed by #3')
            ]);
        });
        test('_computeEdits EOL and other change 2', function () {
            var model = textModel_1.TextModel.createFromString([
                'package main',
                'func foo() {',
                '}' // 3
            ].join('\n'));
            var textBuffer = textModel_1.createTextBuffer([
                'package main',
                'func foo() {',
                '}',
                ''
            ].join('\r\n'), model_1.DefaultEndOfLine.LF);
            var actual = modelServiceImpl_1.ModelServiceImpl._computeEdits(model, textBuffer);
            assert.deepEqual(actual, [
                editOperation_1.EditOperation.replace(new range_1.Range(3, 2, 3, 2), '\n')
            ]);
        });
        test('generated1', function () {
            var file1 = ['pram', 'okctibad', 'pjuwtemued', 'knnnm', 'u', ''];
            var file2 = ['tcnr', 'rxwlicro', 'vnzy', '', '', 'pjzcogzur', 'ptmxyp', 'dfyshia', 'pee', 'ygg'];
            assertComputeEdits(file1, file2);
        });
        test('generated2', function () {
            var file1 = ['', 'itls', 'hrilyhesv', ''];
            var file2 = ['vdl', '', 'tchgz', 'bhx', 'nyl'];
            assertComputeEdits(file1, file2);
        });
        test('generated3', function () {
            var file1 = ['ubrbrcv', 'wv', 'xodspybszt', 's', 'wednjxm', 'fklajt', 'fyfc', 'lvejgge', 'rtpjlodmmk', 'arivtgmjdm'];
            var file2 = ['s', 'qj', 'tu', 'ur', 'qerhjjhyvx', 't'];
            assertComputeEdits(file1, file2);
        });
        test('generated4', function () {
            var file1 = ['ig', 'kh', 'hxegci', 'smvker', 'pkdmjjdqnv', 'vgkkqqx', '', 'jrzeb'];
            var file2 = ['yk', ''];
            assertComputeEdits(file1, file2);
        });
        test('does insertions in the middle of the document', function () {
            var file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            var file2 = [
                'line 1',
                'line 2',
                'line 5',
                'line 3'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does insertions at the end of the document', function () {
            var file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            var file2 = [
                'line 1',
                'line 2',
                'line 3',
                'line 4'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does insertions at the beginning of the document', function () {
            var file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            var file2 = [
                'line 0',
                'line 1',
                'line 2',
                'line 3'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does replacements', function () {
            var file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            var file2 = [
                'line 1',
                'line 7',
                'line 3'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does deletions', function () {
            var file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            var file2 = [
                'line 1',
                'line 3'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does insert, replace, and delete', function () {
            var file1 = [
                'line 1',
                'line 2',
                'line 3',
                'line 4',
                'line 5',
            ];
            var file2 = [
                'line 0',
                'line 1',
                'replace line 2',
                'line 3',
                // delete line 4
                'line 5',
            ];
            assertComputeEdits(file1, file2);
        });
    });
    function assertComputeEdits(lines1, lines2) {
        var model = textModel_1.TextModel.createFromString(lines1.join('\n'));
        var textBuffer = textModel_1.createTextBuffer(lines2.join('\n'), model_1.DefaultEndOfLine.LF);
        // compute required edits
        // let start = Date.now();
        var edits = modelServiceImpl_1.ModelServiceImpl._computeEdits(model, textBuffer);
        // console.log(`took ${Date.now() - start} ms.`);
        // apply edits
        model.pushEditOperations(null, edits, null);
        assert.equal(model.getValue(), lines2.join('\n'));
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function getRandomString(minLength, maxLength) {
        var length = getRandomInt(minLength, maxLength);
        var t = stringBuilder_1.createStringBuilder(length);
        for (var i = 0; i < length; i++) {
            t.appendASCII(getRandomInt(97 /* a */, 122 /* z */));
        }
        return t.build();
    }
    function generateFile(small) {
        var lineCount = getRandomInt(1, small ? 3 : 10000);
        var lines = [];
        for (var i = 0; i < lineCount; i++) {
            lines.push(getRandomString(0, small ? 3 : 10000));
        }
        return lines;
    }
    if (GENERATE_TESTS) {
        var number = 1;
        while (true) {
            console.log('------TEST: ' + number++);
            var file1 = generateFile(true);
            var file2 = generateFile(true);
            console.log('------TEST GENERATED');
            try {
                assertComputeEdits(file1, file2);
            }
            catch (err) {
                console.log(err);
                console.log("\nconst file1 = " + JSON.stringify(file1).replace(/"/g, '\'') + ";\nconst file2 = " + JSON.stringify(file2).replace(/"/g, '\'') + ";\nassertComputeEdits(file1, file2);\n");
                break;
            }
        }
    }
});
