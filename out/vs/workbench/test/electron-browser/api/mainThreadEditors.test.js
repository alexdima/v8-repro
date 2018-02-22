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
define(["require", "exports", "assert", "vs/workbench/api/electron-browser/mainThreadDocumentsAndEditors", "./testRPCProtocol", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/test/browser/testCodeEditorService", "vs/workbench/api/node/extHost.protocol", "vs/workbench/test/electron-browser/api/mock", "vs/base/common/event", "vs/workbench/api/electron-browser/mainThreadEditors", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/editor/common/core/editOperation", "vs/workbench/test/workbenchTestServices", "vs/base/common/winjs.base"], function (require, exports, assert, mainThreadDocumentsAndEditors_1, testRPCProtocol_1, testConfigurationService_1, modelServiceImpl_1, testCodeEditorService_1, extHost_protocol_1, mock_1, event_1, mainThreadEditors_1, uri_1, range_1, position_1, editOperation_1, workbenchTestServices_1, winjs_base_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadEditors', function () {
        var resource = uri_1.default.parse('foo:bar');
        var modelService;
        var editors;
        var movedResources = new Map();
        var createdResources = new Set();
        var deletedResources = new Set();
        setup(function () {
            var configService = new testConfigurationService_1.TestConfigurationService();
            modelService = new modelServiceImpl_1.ModelServiceImpl(null, configService);
            var codeEditorService = new testCodeEditorService_1.TestCodeEditorService();
            movedResources.clear();
            createdResources.clear();
            deletedResources.clear();
            var fileService = new /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_1.prototype.moveFile = function (from, target) {
                    return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                        return __generator(this, function (_a) {
                            movedResources.set(from, target);
                            return [2 /*return*/, createMockFileStat(target)];
                        });
                    });
                };
                class_1.prototype.createFile = function (uri) {
                    return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                        return __generator(this, function (_a) {
                            createdResources.add(uri);
                            return [2 /*return*/, createMockFileStat(uri)];
                        });
                    });
                };
                class_1.prototype.del = function (uri) {
                    return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                        return __generator(this, function (_a) {
                            deletedResources.add(uri);
                            return [2 /*return*/];
                        });
                    });
                };
                return class_1;
            }(workbenchTestServices_1.TestFileService));
            var textFileService = new /** @class */ (function (_super) {
                __extends(class_2, _super);
                function class_2() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.models = {
                        onModelSaved: event_1.default.None,
                        onModelReverted: event_1.default.None,
                        onModelDirty: event_1.default.None,
                    };
                    return _this;
                }
                class_2.prototype.isDirty = function () { return false; };
                return class_2;
            }(mock_1.mock()));
            var workbenchEditorService = {
                getVisibleEditors: function () { return []; },
                getActiveEditor: function () { return undefined; }
            };
            var editorGroupService = new /** @class */ (function (_super) {
                __extends(class_3, _super);
                function class_3() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.onEditorsChanged = event_1.default.None;
                    _this.onEditorGroupMoved = event_1.default.None;
                    return _this;
                }
                return class_3;
            }(mock_1.mock()));
            var rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocuments, new /** @class */ (function (_super) {
                __extends(class_4, _super);
                function class_4() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_4.prototype.$acceptModelChanged = function () {
                };
                return class_4;
            }(mock_1.mock())));
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentsAndEditors, new /** @class */ (function (_super) {
                __extends(class_5, _super);
                function class_5() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_5.prototype.$acceptDocumentsAndEditorsDelta = function () {
                };
                return class_5;
            }(mock_1.mock())));
            var documentAndEditor = new mainThreadDocumentsAndEditors_1.MainThreadDocumentsAndEditors(rpcProtocol, modelService, textFileService, workbenchEditorService, codeEditorService, null, fileService, null, null, editorGroupService);
            editors = new mainThreadEditors_1.MainThreadTextEditors(documentAndEditor, testRPCProtocol_1.SingleProxyRPCProtocol(null), codeEditorService, workbenchEditorService, editorGroupService, null, fileService, modelService);
        });
        test("applyWorkspaceEdit returns false if model is changed by user", function () {
            var model = modelService.createModel('something', null, resource);
            var workspaceResourceEdit = {
                resource: resource,
                modelVersionId: model.getVersionId(),
                edits: [{
                        text: 'asdfg',
                        range: new range_1.Range(1, 1, 1, 1)
                    }]
            };
            // Act as if the user edited the model
            model.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(0, 0), 'something')]);
            return editors.$tryApplyWorkspaceEdit({ edits: [workspaceResourceEdit] }).then(function (result) {
                assert.equal(result, false);
            });
        });
        test("applyWorkspaceEdit with only resource edit", function () {
            return editors.$tryApplyWorkspaceEdit({
                edits: [
                    { oldUri: resource, newUri: resource },
                    { oldUri: undefined, newUri: resource },
                    { oldUri: resource, newUri: undefined }
                ]
            }).then(function (result) {
                assert.equal(result, true);
                assert.equal(movedResources.get(resource), resource);
                assert.equal(createdResources.has(resource), true);
                assert.equal(deletedResources.has(resource), true);
            });
        });
    });
    function createMockFileStat(target) {
        return {
            etag: '',
            isDirectory: false,
            name: target.path,
            mtime: 0,
            resource: target
        };
    }
});
