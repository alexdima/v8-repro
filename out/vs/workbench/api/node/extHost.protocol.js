define(["require", "exports", "vs/workbench/services/extensions/node/proxyIdentifier", "vs/base/common/uri"], function (require, exports, proxyIdentifier_1, uri_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextEditorRevealType;
    (function (TextEditorRevealType) {
        TextEditorRevealType[TextEditorRevealType["Default"] = 0] = "Default";
        TextEditorRevealType[TextEditorRevealType["InCenter"] = 1] = "InCenter";
        TextEditorRevealType[TextEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        TextEditorRevealType[TextEditorRevealType["AtTop"] = 3] = "AtTop";
    })(TextEditorRevealType = exports.TextEditorRevealType || (exports.TextEditorRevealType = {}));
    var ObjectIdentifier;
    (function (ObjectIdentifier) {
        ObjectIdentifier.name = '$ident';
        function mixin(obj, id) {
            Object.defineProperty(obj, ObjectIdentifier.name, { value: id, enumerable: true });
            return obj;
        }
        ObjectIdentifier.mixin = mixin;
        function of(obj) {
            return obj[ObjectIdentifier.name];
        }
        ObjectIdentifier.of = of;
    })(ObjectIdentifier = exports.ObjectIdentifier || (exports.ObjectIdentifier = {}));
    var IdObject = /** @class */ (function () {
        function IdObject() {
        }
        IdObject.mixin = function (object) {
            object._id = IdObject._n++;
            return object;
        };
        IdObject._n = 0;
        return IdObject;
    }());
    exports.IdObject = IdObject;
    function reviveWorkspaceEditDto(data) {
        if (data && data.edits) {
            for (var _i = 0, _a = data.edits; _i < _a.length; _i++) {
                var edit = _a[_i];
                if (typeof edit.resource === 'object') {
                    edit.resource = uri_1.default.revive(edit.resource);
                }
                else {
                    edit.newUri = uri_1.default.revive(edit.newUri);
                    edit.oldUri = uri_1.default.revive(edit.oldUri);
                }
            }
        }
        return data;
    }
    exports.reviveWorkspaceEditDto = reviveWorkspaceEditDto;
    // --- proxy identifiers
    exports.MainContext = {
        MainThreadCommands: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadCommands'),
        MainThreadConfiguration: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadConfiguration'),
        MainThreadDebugService: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadDebugService'),
        MainThreadDecorations: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadDecorations'),
        MainThreadDiagnostics: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadDiagnostics'),
        MainThreadDialogs: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadDiaglogs'),
        MainThreadDocuments: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadDocuments'),
        MainThreadDocumentContentProviders: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadDocumentContentProviders'),
        MainThreadTextEditors: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadTextEditors'),
        MainThreadErrors: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadErrors'),
        MainThreadTreeViews: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadTreeViews'),
        MainThreadLanguageFeatures: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadLanguageFeatures'),
        MainThreadLanguages: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadLanguages'),
        MainThreadMessageService: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadMessageService'),
        MainThreadOutputService: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadOutputService'),
        MainThreadProgress: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadProgress'),
        MainThreadQuickOpen: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadQuickOpen'),
        MainThreadStatusBar: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadStatusBar'),
        MainThreadStorage: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadStorage'),
        MainThreadTelemetry: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadTelemetry'),
        MainThreadTerminalService: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadTerminalService'),
        MainThreadWebview: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadWebview'),
        MainThreadWorkspace: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadWorkspace'),
        MainThreadFileSystem: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadFileSystem'),
        MainThreadExtensionService: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadExtensionService'),
        MainThreadSCM: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadSCM'),
        MainThreadTask: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadTask'),
        MainThreadWindow: proxyIdentifier_1.createMainContextProxyIdentifier('MainThreadWindow'),
    };
    exports.ExtHostContext = {
        ExtHostCommands: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostCommands'),
        ExtHostConfiguration: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostConfiguration'),
        ExtHostDiagnostics: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostDiagnostics'),
        ExtHostDebugService: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostDebugService'),
        ExtHostDecorations: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostDecorations'),
        ExtHostDocumentsAndEditors: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostDocumentsAndEditors'),
        ExtHostDocuments: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostDocuments'),
        ExtHostDocumentContentProviders: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostDocumentContentProviders'),
        ExtHostDocumentSaveParticipant: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostDocumentSaveParticipant'),
        ExtHostEditors: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostEditors'),
        ExtHostTreeViews: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostTreeViews'),
        ExtHostFileSystem: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostFileSystem'),
        ExtHostFileSystemEventService: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostFileSystemEventService'),
        ExtHostHeapService: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostHeapMonitor'),
        ExtHostLanguageFeatures: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostLanguageFeatures'),
        ExtHostQuickOpen: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostQuickOpen'),
        ExtHostExtensionService: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostExtensionService'),
        ExtHostLogService: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostLogService'),
        ExtHostTerminalService: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostTerminalService'),
        ExtHostSCM: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostSCM'),
        ExtHostTask: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostTask'),
        ExtHostWorkspace: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostWorkspace'),
        ExtHostWindow: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostWindow'),
        ExtHostWebviews: proxyIdentifier_1.createExtHostContextProxyIdentifier('ExtHostWebviews')
    };
});
