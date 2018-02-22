var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/editor/common/model/textModel", "vs/editor/test/browser/testCodeEditor", "vs/platform/markers/common/markerService", "vs/editor/contrib/quickFix/quickFixModel", "vs/editor/common/modes"], function (require, exports, assert, uri_1, winjs_base_1, textModel_1, testCodeEditor_1, markerService_1, quickFixModel_1, modes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('QuickFix', function () {
        var languageIdentifier = new modes_1.LanguageIdentifier('foo-lang', 3);
        var uri = uri_1.default.parse('untitled:path');
        var model;
        var markerService;
        var editor;
        var reg;
        setup(function () {
            reg = modes_1.CodeActionProviderRegistry.register(languageIdentifier.language, {
                provideCodeActions: function () {
                    return [{ id: 'test-command', title: 'test', arguments: [] }];
                }
            });
            markerService = new markerService_1.MarkerService();
            model = textModel_1.TextModel.createFromString('foobar  foo bar\nfarboo far boo', undefined, languageIdentifier, uri);
            editor = testCodeEditor_1.createTestCodeEditor(model);
            editor.setPosition({ lineNumber: 1, column: 1 });
        });
        teardown(function () {
            reg.dispose();
            editor.dispose();
            model.dispose();
            markerService.dispose();
        });
        test('Orcale -> marker added', function (done) {
            var oracle = new quickFixModel_1.QuickFixOracle(editor, markerService, function (e) {
                assert.equal(e.trigger.type, 'auto');
                assert.ok(e.fixes);
                e.fixes.then(function (fixes) {
                    oracle.dispose();
                    assert.equal(fixes.length, 1);
                    done();
                }, done);
            });
            // start here
            markerService.changeOne('fake', uri, [{
                    startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6,
                    message: 'error',
                    severity: 1,
                    code: '',
                    source: ''
                }]);
        });
        test('Orcale -> position changed', function () {
            markerService.changeOne('fake', uri, [{
                    startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6,
                    message: 'error',
                    severity: 1,
                    code: '',
                    source: ''
                }]);
            editor.setPosition({ lineNumber: 2, column: 1 });
            return new Promise(function (resolve, reject) {
                var oracle = new quickFixModel_1.QuickFixOracle(editor, markerService, function (e) {
                    assert.equal(e.trigger.type, 'auto');
                    assert.ok(e.fixes);
                    e.fixes.then(function (fixes) {
                        oracle.dispose();
                        assert.equal(fixes.length, 1);
                        resolve(undefined);
                    }, reject);
                });
                // start here
                editor.setPosition({ lineNumber: 1, column: 1 });
            });
        });
        test('Oracle -> marker wins over selection', function () {
            var range;
            var reg = modes_1.CodeActionProviderRegistry.register(languageIdentifier.language, {
                provideCodeActions: function (doc, _range) {
                    range = _range;
                    return [];
                }
            });
            markerService.changeOne('fake', uri, [{
                    startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6,
                    message: 'error',
                    severity: 1,
                    code: '',
                    source: ''
                }]);
            var fixes = [];
            var oracle = new quickFixModel_1.QuickFixOracle(editor, markerService, function (e) {
                fixes.push(e.fixes);
            }, 10);
            editor.setSelection({ startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 13 });
            return winjs_base_1.TPromise.join([winjs_base_1.TPromise.timeout(20)].concat(fixes)).then(function (_) {
                // -> marker wins
                assert.deepEqual(range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6 });
                // 'auto' triggered, non-empty selection BUT within a marker
                editor.setSelection({ startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 4 });
                return winjs_base_1.TPromise.join([winjs_base_1.TPromise.timeout(20)].concat(fixes)).then(function (_) {
                    reg.dispose();
                    oracle.dispose();
                    // assert marker
                    assert.deepEqual(range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6 });
                });
            });
        });
        test('Lightbulb is in the wrong place, #29933', function () {
            return __awaiter(this, void 0, void 0, function () {
                var reg;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reg = modes_1.CodeActionProviderRegistry.register(languageIdentifier.language, {
                                provideCodeActions: function (doc, _range) {
                                    return [];
                                }
                            });
                            editor.getModel().setValue('// @ts-check\n2\ncon\n');
                            markerService.changeOne('fake', uri, [{
                                    startLineNumber: 3, startColumn: 1, endLineNumber: 3, endColumn: 4,
                                    message: 'error',
                                    severity: 1,
                                    code: '',
                                    source: ''
                                }]);
                            // case 1 - drag selection over multiple lines -> range of enclosed marker, position or marker
                            return [4 /*yield*/, new Promise(function (resolve) {
                                    var oracle = new quickFixModel_1.QuickFixOracle(editor, markerService, function (e) {
                                        assert.equal(e.trigger.type, 'auto');
                                        assert.deepEqual(e.range, { startLineNumber: 3, startColumn: 1, endLineNumber: 3, endColumn: 4 });
                                        assert.deepEqual(e.position, { lineNumber: 3, column: 1 });
                                        oracle.dispose();
                                        resolve(null);
                                    }, 5);
                                    editor.setSelection({ startLineNumber: 1, startColumn: 1, endLineNumber: 4, endColumn: 1 });
                                })];
                        case 1:
                            // case 1 - drag selection over multiple lines -> range of enclosed marker, position or marker
                            _a.sent();
                            // // case 2 - selection over multiple lines & manual trigger -> lightbulb
                            // await new TPromise(resolve => {
                            // 	editor.setSelection({ startLineNumber: 1, startColumn: 1, endLineNumber: 4, endColumn: 1 });
                            // 	let oracle = new QuickFixOracle(editor, markerService, e => {
                            // 		assert.equal(e.type, 'manual');
                            // 		assert.ok(e.range.equalsRange({ startLineNumber: 1, startColumn: 1, endLineNumber: 4, endColumn: 1 }));
                            // 		oracle.dispose();
                            // 		resolve(null);
                            // 	}, 5);
                            // 	oracle.trigger('manual');
                            // });
                            reg.dispose();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
});
