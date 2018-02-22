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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/editor/common/model/textModel", "vs/editor/common/editorCommon", "vs/editor/common/modes", "vs/editor/contrib/suggest/suggestModel", "vs/editor/test/browser/testCodeEditor", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/instantiationService", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/browser/controller/coreCommands", "vs/editor/contrib/suggest/suggestController", "vs/platform/storage/common/storage", "vs/editor/contrib/snippet/snippetController2"], function (require, exports, assert, uri_1, lifecycle_1, textModel_1, editorCommon_1, modes_1, suggestModel_1, testCodeEditor_1, serviceCollection_1, instantiationService_1, contextkey_1, mockKeybindingService_1, telemetry_1, telemetryUtils_1, editOperation_1, range_1, coreCommands_1, suggestController_1, storage_1, snippetController2_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createMockEditor(model) {
        var contextKeyService = new mockKeybindingService_1.MockContextKeyService();
        var telemetryService = telemetryUtils_1.NullTelemetryService;
        var instantiationService = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyService], [telemetry_1.ITelemetryService, telemetryService], [storage_1.IStorageService, storage_1.NullStorageService]));
        var editor = new testCodeEditor_1.TestCodeEditor(new testCodeEditor_1.MockScopeLocation(), {}, instantiationService, contextKeyService);
        editor.setModel(model);
        return editor;
    }
    suite('SuggestModel - Context', function () {
        var model;
        setup(function () {
            model = textModel_1.TextModel.createFromString('Das Pferd frisst keinen Gurkensalat - Philipp Reis 1861.\nWer hat\'s erfunden?');
        });
        teardown(function () {
            model.dispose();
        });
        test('Context - shouldAutoTrigger', function () {
            function assertAutoTrigger(offset, expected) {
                var pos = model.getPositionAt(offset);
                var editor = createMockEditor(model);
                editor.setPosition(pos);
                assert.equal(suggestModel_1.LineContext.shouldAutoTrigger(editor), expected);
                editor.dispose();
            }
            assertAutoTrigger(3, true); // end of word, Das|
            assertAutoTrigger(4, false); // no word Das |
            assertAutoTrigger(1, false); // middle of word D|as
            assertAutoTrigger(55, false); // number, 1861|
        });
    });
    suite('SuggestModel - TriggerAndCancelOracle', function () {
        var alwaysEmptySupport = {
            provideCompletionItems: function (doc, pos) {
                return {
                    incomplete: false,
                    suggestions: []
                };
            }
        };
        var alwaysSomethingSupport = {
            provideCompletionItems: function (doc, pos) {
                return {
                    incomplete: false,
                    suggestions: [{
                            label: doc.getWordUntilPosition(pos).word,
                            type: 'property',
                            insertText: 'foofoo'
                        }]
                };
            }
        };
        var disposables = [];
        var model;
        setup(function () {
            disposables = lifecycle_1.dispose(disposables);
            model = textModel_1.TextModel.createFromString('abc def', undefined, undefined, uri_1.default.parse('test:somefile.ttt'));
            disposables.push(model);
        });
        function withOracle(callback) {
            return new Promise(function (resolve, reject) {
                var editor = createMockEditor(model);
                var oracle = new suggestModel_1.SuggestModel(editor);
                disposables.push(oracle, editor);
                try {
                    resolve(callback(oracle, editor));
                }
                catch (err) {
                    reject(err);
                }
            });
        }
        function assertEvent(event, action, assert) {
            return new Promise(function (resolve, reject) {
                var sub = event(function (e) {
                    sub.dispose();
                    try {
                        resolve(assert(e));
                    }
                    catch (err) {
                        reject(err);
                    }
                });
                try {
                    action();
                }
                catch (err) {
                    reject(err);
                }
            });
        }
        test('events - cancel/trigger', function () {
            return withOracle(function (model) {
                return Promise.all([
                    assertEvent(model.onDidCancel, function () {
                        model.cancel();
                    }, function (event) {
                        assert.equal(event.retrigger, false);
                    }),
                    assertEvent(model.onDidCancel, function () {
                        model.cancel(true);
                    }, function (event) {
                        assert.equal(event.retrigger, true);
                    }),
                    // cancel on trigger
                    assertEvent(model.onDidCancel, function () {
                        model.trigger({ auto: false });
                    }, function (event) {
                        assert.equal(event.retrigger, false);
                    }),
                    assertEvent(model.onDidCancel, function () {
                        model.trigger({ auto: false }, true);
                    }, function (event) {
                        assert.equal(event.retrigger, true);
                    }),
                    assertEvent(model.onDidTrigger, function () {
                        model.trigger({ auto: true });
                    }, function (event) {
                        assert.equal(event.auto, true);
                    }),
                    assertEvent(model.onDidTrigger, function () {
                        model.trigger({ auto: false });
                    }, function (event) {
                        assert.equal(event.auto, false);
                    })
                ]);
            });
        });
        test('events - suggest/empty', function () {
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, alwaysEmptySupport));
            return withOracle(function (model) {
                return Promise.all([
                    assertEvent(model.onDidCancel, function () {
                        model.trigger({ auto: true });
                    }, function (event) {
                        assert.equal(event.retrigger, false);
                    }),
                    assertEvent(model.onDidSuggest, function () {
                        model.trigger({ auto: false });
                    }, function (event) {
                        assert.equal(event.auto, false);
                        assert.equal(event.isFrozen, false);
                        assert.equal(event.completionModel.items.length, 0);
                    })
                ]);
            });
        });
        test('trigger - on type', function () {
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, alwaysSomethingSupport));
            return withOracle(function (model, editor) {
                return assertEvent(model.onDidSuggest, function () {
                    editor.setPosition({ lineNumber: 1, column: 4 });
                    editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: 'd' });
                }, function (event) {
                    assert.equal(event.auto, true);
                    assert.equal(event.completionModel.items.length, 1);
                    var first = event.completionModel.items[0];
                    assert.equal(first.support, alwaysSomethingSupport);
                });
            });
        });
        test('#17400: Keep filtering suggestModel.ts after space', function () {
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, {
                provideCompletionItems: function (doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'My Table',
                                type: 'property',
                                insertText: 'My Table'
                            }]
                    };
                }
            }));
            model.setValue('');
            return withOracle(function (model, editor) {
                return assertEvent(model.onDidSuggest, function () {
                    // make sure completionModel starts here!
                    model.trigger({ auto: true });
                }, function (event) {
                    return assertEvent(model.onDidSuggest, function () {
                        editor.setPosition({ lineNumber: 1, column: 1 });
                        editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: 'My' });
                    }, function (event) {
                        assert.equal(event.auto, true);
                        assert.equal(event.completionModel.items.length, 1);
                        var first = event.completionModel.items[0];
                        assert.equal(first.suggestion.label, 'My Table');
                        return assertEvent(model.onDidSuggest, function () {
                            editor.setPosition({ lineNumber: 1, column: 3 });
                            editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: ' ' });
                        }, function (event) {
                            assert.equal(event.auto, true);
                            assert.equal(event.completionModel.items.length, 1);
                            var first = event.completionModel.items[0];
                            assert.equal(first.suggestion.label, 'My Table');
                        });
                    });
                });
            });
        });
        test('#21484: Trigger character always force a new completion session', function () {
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, {
                provideCompletionItems: function (doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'foo.bar',
                                type: 'property',
                                insertText: 'foo.bar',
                                overwriteBefore: pos.column - 1
                            }]
                    };
                }
            }));
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, {
                triggerCharacters: ['.'],
                provideCompletionItems: function (doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'boom',
                                type: 'property',
                                insertText: 'boom',
                                overwriteBefore: doc.getLineContent(pos.lineNumber)[pos.column - 2] === '.' ? 0 : pos.column - 1
                            }]
                    };
                }
            }));
            model.setValue('');
            return withOracle(function (model, editor) {
                return assertEvent(model.onDidSuggest, function () {
                    editor.setPosition({ lineNumber: 1, column: 1 });
                    editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: 'foo' });
                }, function (event) {
                    assert.equal(event.auto, true);
                    assert.equal(event.completionModel.items.length, 1);
                    var first = event.completionModel.items[0];
                    assert.equal(first.suggestion.label, 'foo.bar');
                    return assertEvent(model.onDidSuggest, function () {
                        editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: '.' });
                    }, function (event) {
                        assert.equal(event.auto, true);
                        assert.equal(event.completionModel.items.length, 2);
                        var _a = event.completionModel.items, first = _a[0], second = _a[1];
                        assert.equal(first.suggestion.label, 'foo.bar');
                        assert.equal(second.suggestion.label, 'boom');
                    });
                });
            });
        });
        test('Intellisense Completion doesn\'t respect space after equal sign (.html file), #29353 [1/2]', function () {
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, alwaysSomethingSupport));
            return withOracle(function (model, editor) {
                editor.getModel().setValue('fo');
                editor.setPosition({ lineNumber: 1, column: 3 });
                return assertEvent(model.onDidSuggest, function () {
                    model.trigger({ auto: false });
                }, function (event) {
                    assert.equal(event.auto, false);
                    assert.equal(event.isFrozen, false);
                    assert.equal(event.completionModel.items.length, 1);
                    return assertEvent(model.onDidCancel, function () {
                        editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: '+' });
                    }, function (event) {
                        assert.equal(event.retrigger, false);
                    });
                });
            });
        });
        test('Intellisense Completion doesn\'t respect space after equal sign (.html file), #29353 [2/2]', function () {
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, alwaysSomethingSupport));
            return withOracle(function (model, editor) {
                editor.getModel().setValue('fo');
                editor.setPosition({ lineNumber: 1, column: 3 });
                return assertEvent(model.onDidSuggest, function () {
                    model.trigger({ auto: false });
                }, function (event) {
                    assert.equal(event.auto, false);
                    assert.equal(event.isFrozen, false);
                    assert.equal(event.completionModel.items.length, 1);
                    return assertEvent(model.onDidCancel, function () {
                        editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: ' ' });
                    }, function (event) {
                        assert.equal(event.retrigger, false);
                    });
                });
            });
        });
        test('Incomplete suggestion results cause re-triggering when typing w/o further context, #28400 (1/2)', function () {
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, {
                provideCompletionItems: function (doc, pos) {
                    return {
                        incomplete: true,
                        suggestions: [{
                                label: 'foo',
                                type: 'property',
                                insertText: 'foo',
                                overwriteBefore: pos.column - 1
                            }]
                    };
                }
            }));
            return withOracle(function (model, editor) {
                editor.getModel().setValue('foo');
                editor.setPosition({ lineNumber: 1, column: 4 });
                return assertEvent(model.onDidSuggest, function () {
                    model.trigger({ auto: false });
                }, function (event) {
                    assert.equal(event.auto, false);
                    assert.equal(event.completionModel.incomplete, true);
                    assert.equal(event.completionModel.items.length, 1);
                    return assertEvent(model.onDidCancel, function () {
                        editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: ';' });
                    }, function (event) {
                        assert.equal(event.retrigger, false);
                    });
                });
            });
        });
        test('Incomplete suggestion results cause re-triggering when typing w/o further context, #28400 (2/2)', function () {
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, {
                provideCompletionItems: function (doc, pos) {
                    return {
                        incomplete: true,
                        suggestions: [{
                                label: 'foo;',
                                type: 'property',
                                insertText: 'foo',
                                overwriteBefore: pos.column - 1
                            }]
                    };
                }
            }));
            return withOracle(function (model, editor) {
                editor.getModel().setValue('foo');
                editor.setPosition({ lineNumber: 1, column: 4 });
                return assertEvent(model.onDidSuggest, function () {
                    model.trigger({ auto: false });
                }, function (event) {
                    assert.equal(event.auto, false);
                    assert.equal(event.completionModel.incomplete, true);
                    assert.equal(event.completionModel.items.length, 1);
                    return assertEvent(model.onDidSuggest, function () {
                        // while we cancel incrementally enriching the set of
                        // completions we still filter against those that we have
                        // until now
                        editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: ';' });
                    }, function (event) {
                        assert.equal(event.auto, false);
                        assert.equal(event.completionModel.incomplete, true);
                        assert.equal(event.completionModel.items.length, 1);
                    });
                });
            });
        });
        test('Trigger character is provided in suggest context', function () {
            var triggerCharacter = '';
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, {
                triggerCharacters: ['.'],
                provideCompletionItems: function (doc, pos, context) {
                    assert.equal(context.triggerKind, modes_1.SuggestTriggerKind.TriggerCharacter);
                    triggerCharacter = context.triggerCharacter;
                    return {
                        incomplete: false,
                        suggestions: [
                            {
                                label: 'foo.bar',
                                type: 'property',
                                insertText: 'foo.bar',
                                overwriteBefore: pos.column - 1
                            }
                        ]
                    };
                }
            }));
            model.setValue('');
            return withOracle(function (model, editor) {
                return assertEvent(model.onDidSuggest, function () {
                    editor.setPosition({ lineNumber: 1, column: 1 });
                    editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: 'foo.' });
                }, function (event) {
                    assert.equal(triggerCharacter, '.');
                });
            });
        });
        test('Mac press and hold accent character insertion does not update suggestions, #35269', function () {
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, {
                provideCompletionItems: function (doc, pos) {
                    return {
                        incomplete: true,
                        suggestions: [{
                                label: 'abc',
                                type: 'property',
                                insertText: 'abc',
                                overwriteBefore: pos.column - 1
                            }, {
                                label: 'äbc',
                                type: 'property',
                                insertText: 'äbc',
                                overwriteBefore: pos.column - 1
                            }]
                    };
                }
            }));
            model.setValue('');
            return withOracle(function (model, editor) {
                return assertEvent(model.onDidSuggest, function () {
                    editor.setPosition({ lineNumber: 1, column: 1 });
                    editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: 'a' });
                }, function (event) {
                    assert.equal(event.completionModel.items.length, 1);
                    assert.equal(event.completionModel.items[0].suggestion.label, 'abc');
                    return assertEvent(model.onDidSuggest, function () {
                        editor.executeEdits('test', [editOperation_1.EditOperation.replace(new range_1.Range(1, 1, 1, 2), 'ä')]);
                    }, function (event) {
                        // suggest model changed to äbc
                        assert.equal(event.completionModel.items.length, 1);
                        assert.equal(event.completionModel.items[0].suggestion.label, 'äbc');
                    });
                });
            });
        });
        test('Backspace should not always cancel code completion, #36491', function () {
            var _this = this;
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, alwaysSomethingSupport));
            return withOracle(function (model, editor) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assertEvent(model.onDidSuggest, function () {
                                editor.setPosition({ lineNumber: 1, column: 4 });
                                editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: 'd' });
                            }, function (event) {
                                assert.equal(event.auto, true);
                                assert.equal(event.completionModel.items.length, 1);
                                var first = event.completionModel.items[0];
                                assert.equal(first.support, alwaysSomethingSupport);
                            })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, assertEvent(model.onDidSuggest, function () {
                                    coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                                }, function (event) {
                                    assert.equal(event.auto, true);
                                    assert.equal(event.completionModel.items.length, 1);
                                    var first = event.completionModel.items[0];
                                    assert.equal(first.support, alwaysSomethingSupport);
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        test('Text changes for completion CodeAction are affected by the completion #39893', function () {
            var _this = this;
            disposables.push(modes_1.SuggestRegistry.register({ scheme: 'test' }, {
                provideCompletionItems: function (doc, pos) {
                    return {
                        incomplete: true,
                        suggestions: [{
                                label: 'bar',
                                type: 'property',
                                insertText: 'bar',
                                overwriteBefore: 2,
                                additionalTextEdits: [{
                                        text: ', bar',
                                        range: { startLineNumber: 1, endLineNumber: 1, startColumn: 17, endColumn: 17 }
                                    }]
                            }]
                    };
                }
            }));
            model.setValue('ba; import { foo } from "./b"');
            return withOracle(function (sugget, editor) { return __awaiter(_this, void 0, void 0, function () {
                var TestCtrl, ctrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            TestCtrl = /** @class */ (function (_super) {
                                __extends(TestCtrl, _super);
                                function TestCtrl() {
                                    return _super !== null && _super.apply(this, arguments) || this;
                                }
                                TestCtrl.prototype._onDidSelectItem = function (item) {
                                    _super.prototype._onDidSelectItem.call(this, item);
                                };
                                return TestCtrl;
                            }(suggestController_1.SuggestController));
                            ctrl = editor.registerAndInstantiateContribution(TestCtrl);
                            editor.registerAndInstantiateContribution(snippetController2_1.SnippetController2);
                            return [4 /*yield*/, assertEvent(sugget.onDidSuggest, function () {
                                    editor.setPosition({ lineNumber: 1, column: 3 });
                                    sugget.trigger({ auto: false });
                                }, function (event) {
                                    assert.equal(event.completionModel.items.length, 1);
                                    var first = event.completionModel.items[0];
                                    assert.equal(first.suggestion.label, 'bar');
                                    ctrl._onDidSelectItem({ item: first, index: 0, model: event.completionModel });
                                })];
                        case 1:
                            _a.sent();
                            assert.equal(model.getValue(), 'bar; import { foo, bar } from "./b"');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
