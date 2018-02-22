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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/severity", "vs/editor/common/model/textModel", "vs/editor/common/modes", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/contrib/quickFix/quickFix", "vs/editor/contrib/quickFix/codeActionTrigger"], function (require, exports, assert, uri_1, severity_1, textModel_1, modes_1, lifecycle_1, range_1, quickFix_1, codeActionTrigger_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('QuickFix', function () {
        var langId = new modes_1.LanguageIdentifier('fooLang', 17);
        var uri = uri_1.default.parse('untitled:path');
        var model;
        var disposables = [];
        var testData = {
            diagnostics: {
                abc: {
                    title: 'bTitle',
                    diagnostics: [{
                            startLineNumber: 1,
                            startColumn: 1,
                            endLineNumber: 2,
                            endColumn: 1,
                            severity: severity_1.default.Error,
                            message: 'abc'
                        }]
                },
                bcd: {
                    title: 'aTitle',
                    diagnostics: [{
                            startLineNumber: 1,
                            startColumn: 1,
                            endLineNumber: 2,
                            endColumn: 1,
                            severity: severity_1.default.Error,
                            message: 'bcd'
                        }]
                }
            },
            command: {
                abc: {
                    command: new /** @class */ (function () {
                        function class_1() {
                        }
                        return class_1;
                    }()),
                    title: 'Extract to inner function in function "test"'
                }
            },
            spelling: {
                bcd: {
                    diagnostics: [],
                    edit: new /** @class */ (function () {
                        function class_2() {
                        }
                        return class_2;
                    }()),
                    title: 'abc'
                }
            },
            tsLint: {
                abc: {
                    $ident: 57,
                    arguments: [],
                    id: '_internal_command_delegation',
                    title: 'abc'
                },
                bcd: {
                    $ident: 47,
                    arguments: [],
                    id: '_internal_command_delegation',
                    title: 'bcd'
                }
            }
        };
        setup(function () {
            model = textModel_1.TextModel.createFromString('test1\ntest2\ntest3', undefined, langId, uri);
            disposables = [model];
        });
        teardown(function () {
            lifecycle_1.dispose(disposables);
        });
        test('CodeActions are sorted by type, #38623', function () {
            return __awaiter(this, void 0, void 0, function () {
                var provider, expected, actions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            provider = new /** @class */ (function () {
                                function class_3() {
                                }
                                class_3.prototype.provideCodeActions = function () {
                                    return [
                                        testData.command.abc,
                                        testData.diagnostics.bcd,
                                        testData.spelling.bcd,
                                        testData.tsLint.bcd,
                                        testData.tsLint.abc,
                                        testData.diagnostics.abc
                                    ];
                                };
                                return class_3;
                            }());
                            disposables.push(modes_1.CodeActionProviderRegistry.register('fooLang', provider));
                            expected = [
                                // CodeActions with a diagnostics array are shown first ordered by diagnostics.message
                                testData.diagnostics.abc,
                                testData.diagnostics.bcd,
                                // CodeActions without diagnostics are shown in the given order without any further sorting
                                testData.command.abc,
                                testData.spelling.bcd,
                                testData.tsLint.bcd,
                                testData.tsLint.abc
                            ];
                            return [4 /*yield*/, quickFix_1.getCodeActions(model, new range_1.Range(1, 1, 2, 1))];
                        case 1:
                            actions = _a.sent();
                            assert.equal(actions.length, 6);
                            assert.deepEqual(actions, expected);
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('getCodeActions should filter by scope', function () {
            return __awaiter(this, void 0, void 0, function () {
                var provider, actions, actions, actions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            provider = new /** @class */ (function () {
                                function class_4() {
                                }
                                class_4.prototype.provideCodeActions = function () {
                                    return [
                                        { title: 'a', kind: 'a' },
                                        { title: 'b', kind: 'b' },
                                        { title: 'a.b', kind: 'a.b' }
                                    ];
                                };
                                return class_4;
                            }());
                            disposables.push(modes_1.CodeActionProviderRegistry.register('fooLang', provider));
                            return [4 /*yield*/, quickFix_1.getCodeActions(model, new range_1.Range(1, 1, 2, 1), new codeActionTrigger_1.CodeActionKind('a'))];
                        case 1:
                            actions = _a.sent();
                            assert.equal(actions.length, 2);
                            assert.strictEqual(actions[0].title, 'a');
                            assert.strictEqual(actions[1].title, 'a.b');
                            return [4 /*yield*/, quickFix_1.getCodeActions(model, new range_1.Range(1, 1, 2, 1), new codeActionTrigger_1.CodeActionKind('a.b'))];
                        case 2:
                            actions = _a.sent();
                            assert.equal(actions.length, 1);
                            assert.strictEqual(actions[0].title, 'a.b');
                            return [4 /*yield*/, quickFix_1.getCodeActions(model, new range_1.Range(1, 1, 2, 1), new codeActionTrigger_1.CodeActionKind('a.b.c'))];
                        case 3:
                            actions = _a.sent();
                            assert.equal(actions.length, 0);
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('getCodeActions should forward requested scope to providers', function () {
            return __awaiter(this, void 0, void 0, function () {
                var provider, actions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            provider = new /** @class */ (function () {
                                function class_5() {
                                }
                                class_5.prototype.provideCodeActions = function (_model, _range, context, _token) {
                                    return [
                                        { title: context.only, kind: context.only }
                                    ];
                                };
                                return class_5;
                            }());
                            disposables.push(modes_1.CodeActionProviderRegistry.register('fooLang', provider));
                            return [4 /*yield*/, quickFix_1.getCodeActions(model, new range_1.Range(1, 1, 2, 1), new codeActionTrigger_1.CodeActionKind('a'))];
                        case 1:
                            actions = _a.sent();
                            assert.equal(actions.length, 1);
                            assert.strictEqual(actions[0].title, 'a');
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
});
