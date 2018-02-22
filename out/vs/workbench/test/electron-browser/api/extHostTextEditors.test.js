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
define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/workbench/api/node/extHostTypes", "vs/workbench/api/node/extHost.protocol", "vs/base/common/uri", "vs/workbench/test/electron-browser/api/mock", "vs/workbench/api/node/extHostDocumentsAndEditors", "vs/workbench/test/electron-browser/api/testRPCProtocol", "vs/workbench/api/node/extHostTextEditors"], function (require, exports, assert, winjs_base_1, extHostTypes, extHost_protocol_1, uri_1, mock_1, extHostDocumentsAndEditors_1, testRPCProtocol_1, extHostTextEditors_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTextEditors.applyWorkspaceEdit', function () {
        var resource = uri_1.default.parse('foo:bar');
        var editors;
        var workspaceResourceEdits;
        setup(function () {
            workspaceResourceEdits = null;
            var rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadTextEditors, new /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_1.prototype.$tryApplyWorkspaceEdit = function (_workspaceResourceEdits) {
                    workspaceResourceEdits = _workspaceResourceEdits;
                    return winjs_base_1.TPromise.as(true);
                };
                return class_1;
            }(mock_1.mock())));
            var documentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(testRPCProtocol_1.SingleProxyRPCProtocol(null));
            documentsAndEditors.$acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        isDirty: false,
                        modeId: 'foo',
                        uri: resource,
                        versionId: 1337,
                        lines: ['foo'],
                        EOL: '\n',
                    }]
            });
            editors = new extHostTextEditors_1.ExtHostEditors(rpcProtocol, documentsAndEditors);
        });
        test('uses version id if document available', function () {
            var edit = new extHostTypes.WorkspaceEdit();
            edit.replace(resource, new extHostTypes.Range(0, 0, 0, 0), 'hello');
            return editors.applyWorkspaceEdit(edit).then(function (result) {
                assert.equal(workspaceResourceEdits.edits.length, 1);
                assert.equal(workspaceResourceEdits.edits[0].modelVersionId, 1337);
            });
        });
        test('does not use version id if document is not available', function () {
            var edit = new extHostTypes.WorkspaceEdit();
            edit.replace(uri_1.default.parse('foo:bar2'), new extHostTypes.Range(0, 0, 0, 0), 'hello');
            return editors.applyWorkspaceEdit(edit).then(function (result) {
                assert.equal(workspaceResourceEdits.edits.length, 1);
                assert.ok(typeof workspaceResourceEdits.edits[0].modelVersionId === 'undefined');
            });
        });
    });
});
