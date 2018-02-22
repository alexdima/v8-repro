define(["require", "exports", "vs/base/common/event", "vs/base/common/uri", "vs/base/common/lifecycle", "./extHostTypeConverters", "vs/base/common/winjs.base", "./extHost.protocol", "./extHostDocumentData"], function (require, exports, event_1, uri_1, lifecycle_1, TypeConverters, winjs_base_1, extHost_protocol_1, extHostDocumentData_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostDocuments = /** @class */ (function () {
        function ExtHostDocuments(mainContext, documentsAndEditors) {
            var _this = this;
            this._onDidAddDocument = new event_1.Emitter();
            this._onDidRemoveDocument = new event_1.Emitter();
            this._onDidChangeDocument = new event_1.Emitter();
            this._onDidSaveDocument = new event_1.Emitter();
            this.onDidAddDocument = this._onDidAddDocument.event;
            this.onDidRemoveDocument = this._onDidRemoveDocument.event;
            this.onDidChangeDocument = this._onDidChangeDocument.event;
            this.onDidSaveDocument = this._onDidSaveDocument.event;
            this._documentLoader = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadDocuments);
            this._documentsAndEditors = documentsAndEditors;
            this._toDispose = [
                this._documentsAndEditors.onDidRemoveDocuments(function (documents) {
                    for (var _i = 0, documents_1 = documents; _i < documents_1.length; _i++) {
                        var data = documents_1[_i];
                        _this._onDidRemoveDocument.fire(data.document);
                    }
                }),
                this._documentsAndEditors.onDidAddDocuments(function (documents) {
                    for (var _i = 0, documents_2 = documents; _i < documents_2.length; _i++) {
                        var data = documents_2[_i];
                        _this._onDidAddDocument.fire(data.document);
                    }
                })
            ];
        }
        ExtHostDocuments.prototype.dispose = function () {
            lifecycle_1.dispose(this._toDispose);
        };
        ExtHostDocuments.prototype.getAllDocumentData = function () {
            return this._documentsAndEditors.allDocuments();
        };
        ExtHostDocuments.prototype.getDocumentData = function (resource) {
            if (!resource) {
                return undefined;
            }
            var data = this._documentsAndEditors.getDocument(resource.toString());
            if (data) {
                return data;
            }
            return undefined;
        };
        ExtHostDocuments.prototype.ensureDocumentData = function (uri) {
            var _this = this;
            var cached = this._documentsAndEditors.getDocument(uri.toString());
            if (cached) {
                return winjs_base_1.TPromise.as(cached);
            }
            var promise = this._documentLoader.get(uri.toString());
            if (!promise) {
                promise = this._proxy.$tryOpenDocument(uri).then(function () {
                    _this._documentLoader.delete(uri.toString());
                    return _this._documentsAndEditors.getDocument(uri.toString());
                }, function (err) {
                    _this._documentLoader.delete(uri.toString());
                    return winjs_base_1.TPromise.wrapError(err);
                });
                this._documentLoader.set(uri.toString(), promise);
            }
            return promise;
        };
        ExtHostDocuments.prototype.createDocumentData = function (options) {
            return this._proxy.$tryCreateDocument(options).then(function (data) { return uri_1.default.revive(data); });
        };
        ExtHostDocuments.prototype.$acceptModelModeChanged = function (uriComponents, oldModeId, newModeId) {
            var uri = uri_1.default.revive(uriComponents);
            var strURL = uri.toString();
            var data = this._documentsAndEditors.getDocument(strURL);
            // Treat a mode change as a remove + add
            this._onDidRemoveDocument.fire(data.document);
            data._acceptLanguageId(newModeId);
            this._onDidAddDocument.fire(data.document);
        };
        ExtHostDocuments.prototype.$acceptModelSaved = function (uriComponents) {
            var uri = uri_1.default.revive(uriComponents);
            var strURL = uri.toString();
            var data = this._documentsAndEditors.getDocument(strURL);
            this.$acceptDirtyStateChanged(uriComponents, false);
            this._onDidSaveDocument.fire(data.document);
        };
        ExtHostDocuments.prototype.$acceptDirtyStateChanged = function (uriComponents, isDirty) {
            var uri = uri_1.default.revive(uriComponents);
            var strURL = uri.toString();
            var data = this._documentsAndEditors.getDocument(strURL);
            data._acceptIsDirty(isDirty);
            this._onDidChangeDocument.fire({
                document: data.document,
                contentChanges: []
            });
        };
        ExtHostDocuments.prototype.$acceptModelChanged = function (uriComponents, events, isDirty) {
            var uri = uri_1.default.revive(uriComponents);
            var strURL = uri.toString();
            var data = this._documentsAndEditors.getDocument(strURL);
            data._acceptIsDirty(isDirty);
            data.onEvents(events);
            this._onDidChangeDocument.fire({
                document: data.document,
                contentChanges: events.changes.map(function (change) {
                    return {
                        range: TypeConverters.toRange(change.range),
                        rangeLength: change.rangeLength,
                        text: change.text
                    };
                })
            });
        };
        ExtHostDocuments.prototype.setWordDefinitionFor = function (modeId, wordDefinition) {
            extHostDocumentData_1.setWordDefinitionFor(modeId, wordDefinition);
        };
        return ExtHostDocuments;
    }());
    exports.ExtHostDocuments = ExtHostDocuments;
});
