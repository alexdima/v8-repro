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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/workbench/api/node/extHostDocuments", "vs/workbench/api/node/extHostDocumentsAndEditors", "vs/workbench/api/node/extHostTypes", "vs/workbench/api/node/extHostDocumentSaveParticipant", "./testRPCProtocol", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/test/electron-browser/api/mock", "vs/platform/log/common/log", "vs/editor/common/modes"], function (require, exports, assert, uri_1, winjs_base_1, extHostDocuments_1, extHostDocumentsAndEditors_1, extHostTypes_1, extHostDocumentSaveParticipant_1, testRPCProtocol_1, textfiles_1, mock_1, log_1, modes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDocumentSaveParticipant', function () {
        var resource = uri_1.default.parse('foo:bar');
        var mainThreadEditors = new /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return class_1;
        }(mock_1.mock()));
        var documents;
        var nullLogService = new log_1.NullLogService();
        var nullExtensionDescription = {
            id: 'nullExtensionDescription',
            name: 'Null Extension Description',
            publisher: 'vscode',
            enableProposedApi: false,
            engines: undefined,
            extensionFolderPath: undefined,
            isBuiltin: false,
            version: undefined
        };
        setup(function () {
            var documentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(testRPCProtocol_1.SingleProxyRPCProtocol(null));
            documentsAndEditors.$acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        isDirty: false,
                        modeId: 'foo',
                        uri: resource,
                        versionId: 1,
                        lines: ['foo'],
                        EOL: '\n',
                    }]
            });
            documents = new extHostDocuments_1.ExtHostDocuments(testRPCProtocol_1.SingleProxyRPCProtocol(null), documentsAndEditors);
        });
        test('no listeners, no problem', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors);
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () { return assert.ok(true); });
        });
        test('event delivery', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors);
            var event;
            var sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () {
                sub.dispose();
                assert.ok(event);
                assert.equal(event.reason, extHostTypes_1.TextDocumentSaveReason.Manual);
                assert.equal(typeof event.waitUntil, 'function');
            });
        });
        test('event delivery, immutable', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors);
            var event;
            var sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () {
                sub.dispose();
                assert.ok(event);
                assert.throws(function () { return event.document = null; });
            });
        });
        test('event delivery, bad listener', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors);
            var sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                throw new Error('💀');
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function (values) {
                sub.dispose();
                var first = values[0];
                assert.equal(first, false);
            });
        });
        test('event delivery, bad listener doesn\'t prevent more events', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors);
            var sub1 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                throw new Error('💀');
            });
            var event;
            var sub2 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () {
                sub1.dispose();
                sub2.dispose();
                assert.ok(event);
            });
        });
        test('event delivery, in subscriber order', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors);
            var counter = 0;
            var sub1 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (event) {
                assert.equal(counter++, 0);
            });
            var sub2 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (event) {
                assert.equal(counter++, 1);
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () {
                sub1.dispose();
                sub2.dispose();
            });
        });
        test('event delivery, ignore bad listeners', function () { return __awaiter(_this, void 0, void 0, function () {
            var participant, callCount, sub;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors, { timeout: 5, errors: 1 });
                        callCount = 0;
                        sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (event) {
                            callCount += 1;
                            throw new Error('boom');
                        });
                        return [4 /*yield*/, participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT)];
                    case 4:
                        _a.sent();
                        sub.dispose();
                        assert.equal(callCount, 2);
                        return [2 /*return*/];
                }
            });
        }); });
        test('event delivery, overall timeout', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors, { timeout: 20, errors: 5 });
            var callCount = 0;
            var sub1 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (event) {
                callCount += 1;
                event.waitUntil(winjs_base_1.TPromise.timeout(17));
            });
            var sub2 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (event) {
                callCount += 1;
                event.waitUntil(winjs_base_1.TPromise.timeout(17));
            });
            var sub3 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (event) {
                callCount += 1;
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function (values) {
                sub1.dispose();
                sub2.dispose();
                sub3.dispose();
                assert.equal(callCount, 2);
                assert.equal(values.length, 2);
            });
        });
        test('event delivery, waitUntil', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors);
            var sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (event) {
                event.waitUntil(winjs_base_1.TPromise.timeout(10));
                event.waitUntil(winjs_base_1.TPromise.timeout(10));
                event.waitUntil(winjs_base_1.TPromise.timeout(10));
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () {
                sub.dispose();
            });
        });
        test('event delivery, waitUntil must be called sync', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors);
            var sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (event) {
                event.waitUntil(new winjs_base_1.TPromise(function (resolve, reject) {
                    setTimeout(function () {
                        try {
                            assert.throws(function () { return event.waitUntil(winjs_base_1.TPromise.timeout(10)); });
                            resolve(void 0);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }, 10);
                }));
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () {
                sub.dispose();
            });
        });
        test('event delivery, waitUntil will timeout', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors, { timeout: 5, errors: 3 });
            var sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (event) {
                event.waitUntil(winjs_base_1.TPromise.timeout(15));
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function (values) {
                sub.dispose();
                var first = values[0];
                assert.equal(first, false);
            });
        });
        test('event delivery, waitUntil failure handling', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, mainThreadEditors);
            var sub1 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                e.waitUntil(winjs_base_1.TPromise.wrapError(new Error('dddd')));
            });
            var event;
            var sub2 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                event = e;
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () {
                assert.ok(event);
                sub1.dispose();
                sub2.dispose();
            });
        });
        test('event delivery, pushEdits sync', function () {
            var dto;
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, new /** @class */ (function (_super) {
                __extends(class_2, _super);
                function class_2() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_2.prototype.$tryApplyWorkspaceEdit = function (_edits) {
                    dto = _edits;
                    return winjs_base_1.TPromise.as(true);
                };
                return class_2;
            }(mock_1.mock())));
            var sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                e.waitUntil(winjs_base_1.TPromise.as([extHostTypes_1.TextEdit.insert(new extHostTypes_1.Position(0, 0), 'bar')]));
                e.waitUntil(winjs_base_1.TPromise.as([extHostTypes_1.TextEdit.setEndOfLine(extHostTypes_1.EndOfLine.CRLF)]));
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () {
                sub.dispose();
                assert.equal(dto.edits.length, 1);
                assert.ok(modes_1.isResourceTextEdit(dto.edits[0]));
                assert.equal(dto.edits[0].edits.length, 2);
            });
        });
        test('event delivery, concurrent change', function () {
            var edits;
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, new /** @class */ (function (_super) {
                __extends(class_3, _super);
                function class_3() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_3.prototype.$tryApplyWorkspaceEdit = function (_edits) {
                    edits = _edits;
                    return winjs_base_1.TPromise.as(true);
                };
                return class_3;
            }(mock_1.mock())));
            var sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                // concurrent change from somewhere
                documents.$acceptModelChanged(resource, {
                    changes: [{
                            range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
                            rangeLength: undefined,
                            text: 'bar'
                        }],
                    eol: undefined,
                    versionId: 2
                }, true);
                e.waitUntil(winjs_base_1.TPromise.as([extHostTypes_1.TextEdit.insert(new extHostTypes_1.Position(0, 0), 'bar')]));
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function (values) {
                sub.dispose();
                assert.equal(edits, undefined);
                assert.equal(values[0], false);
            });
        });
        test('event delivery, two listeners -> two document states', function () {
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(nullLogService, documents, new /** @class */ (function (_super) {
                __extends(class_4, _super);
                function class_4() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_4.prototype.$tryApplyWorkspaceEdit = function (dto) {
                    for (var _i = 0, _a = dto.edits; _i < _a.length; _i++) {
                        var edit = _a[_i];
                        if (!modes_1.isResourceTextEdit(edit)) {
                            continue;
                        }
                        var resource_1 = edit.resource, edits = edit.edits;
                        var uri = uri_1.default.revive(resource_1);
                        for (var _b = 0, edits_1 = edits; _b < edits_1.length; _b++) {
                            var _c = edits_1[_b], text = _c.text, range = _c.range;
                            documents.$acceptModelChanged(uri, {
                                changes: [{
                                        range: range,
                                        text: text,
                                        rangeLength: undefined,
                                    }],
                                eol: undefined,
                                versionId: documents.getDocumentData(uri).version + 1
                            }, true);
                        }
                    }
                    return winjs_base_1.TPromise.as(true);
                };
                return class_4;
            }(mock_1.mock())));
            var document = documents.getDocumentData(resource).document;
            var sub1 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                // the document state we started with
                assert.equal(document.version, 1);
                assert.equal(document.getText(), 'foo');
                e.waitUntil(winjs_base_1.TPromise.as([extHostTypes_1.TextEdit.insert(new extHostTypes_1.Position(0, 0), 'bar')]));
            });
            var sub2 = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                // the document state AFTER the first listener kicked in
                assert.equal(document.version, 2);
                assert.equal(document.getText(), 'barfoo');
                e.waitUntil(winjs_base_1.TPromise.as([extHostTypes_1.TextEdit.insert(new extHostTypes_1.Position(0, 0), 'bar')]));
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function (values) {
                sub1.dispose();
                sub2.dispose();
                // the document state AFTER eventing is done
                assert.equal(document.version, 3);
                assert.equal(document.getText(), 'barbarfoo');
            });
        });
        test('Log failing listener', function () {
            var didLogSomething = false;
            var participant = new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(new /** @class */ (function (_super) {
                __extends(class_5, _super);
                function class_5() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_5.prototype.error = function (message) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    didLogSomething = true;
                };
                return class_5;
            }(log_1.NullLogService)), documents, mainThreadEditors);
            var sub = participant.getOnWillSaveTextDocumentEvent(nullExtensionDescription)(function (e) {
                throw new Error('boom');
            });
            return participant.$participateInSave(resource, textfiles_1.SaveReason.EXPLICIT).then(function () {
                sub.dispose();
                assert.equal(didLogSomething, true);
            });
        });
    });
});
