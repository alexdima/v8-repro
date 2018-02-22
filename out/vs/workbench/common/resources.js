/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/paths", "vs/base/common/paths", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/modeService", "vs/platform/files/common/files"], function (require, exports, paths, paths_1, contextkey_1, modeService_1, files_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResourceContextKey = /** @class */ (function () {
        function ResourceContextKey(contextKeyService, _modeService, _fileService) {
            this._modeService = _modeService;
            this._fileService = _fileService;
            this._schemeKey = ResourceContextKey.Scheme.bindTo(contextKeyService);
            this._filenameKey = ResourceContextKey.Filename.bindTo(contextKeyService);
            this._langIdKey = ResourceContextKey.LangId.bindTo(contextKeyService);
            this._resourceKey = ResourceContextKey.Resource.bindTo(contextKeyService);
            this._extensionKey = ResourceContextKey.Extension.bindTo(contextKeyService);
            this._hasResource = ResourceContextKey.HasResource.bindTo(contextKeyService);
            this._isFile = ResourceContextKey.IsFile.bindTo(contextKeyService);
        }
        ResourceContextKey.prototype.set = function (value) {
            this._resourceKey.set(value);
            this._schemeKey.set(value && value.scheme);
            this._filenameKey.set(value && paths_1.basename(value.fsPath));
            this._langIdKey.set(value && this._modeService.getModeIdByFilenameOrFirstLine(value.fsPath));
            this._extensionKey.set(value && paths.extname(value.fsPath));
            this._hasResource.set(!!value);
            this._isFile.set(value && this._fileService.canHandleResource(value));
        };
        ResourceContextKey.prototype.reset = function () {
            this._schemeKey.reset();
            this._langIdKey.reset();
            this._resourceKey.reset();
            this._langIdKey.reset();
            this._extensionKey.reset();
            this._hasResource.reset();
            this._isFile.reset();
        };
        ResourceContextKey.prototype.get = function () {
            return this._resourceKey.get();
        };
        ResourceContextKey.Scheme = new contextkey_1.RawContextKey('resourceScheme', undefined);
        ResourceContextKey.Filename = new contextkey_1.RawContextKey('resourceFilename', undefined);
        ResourceContextKey.LangId = new contextkey_1.RawContextKey('resourceLangId', undefined);
        ResourceContextKey.Resource = new contextkey_1.RawContextKey('resource', undefined);
        ResourceContextKey.Extension = new contextkey_1.RawContextKey('resourceExtname', undefined);
        ResourceContextKey.HasResource = new contextkey_1.RawContextKey('resourceSet', false);
        ResourceContextKey.IsFile = new contextkey_1.RawContextKey('resourceIsFile', false);
        ResourceContextKey = __decorate([
            __param(0, contextkey_1.IContextKeyService),
            __param(1, modeService_1.IModeService),
            __param(2, files_1.IFileService)
        ], ResourceContextKey);
        return ResourceContextKey;
    }());
    exports.ResourceContextKey = ResourceContextKey;
    /**
     * Data URI related helpers.
     */
    var DataUri;
    (function (DataUri) {
        DataUri.META_DATA_LABEL = 'label';
        DataUri.META_DATA_DESCRIPTION = 'description';
        DataUri.META_DATA_SIZE = 'size';
        DataUri.META_DATA_MIME = 'mime';
        function parseMetaData(dataUri) {
            var metadata = new Map();
            // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
            // the metadata is: size:2313;label:SomeLabel;description:SomeDescription
            var meta = dataUri.path.substring(dataUri.path.indexOf(';') + 1, dataUri.path.lastIndexOf(';'));
            meta.split(';').forEach(function (property) {
                var _a = property.split(':'), key = _a[0], value = _a[1];
                if (key && value) {
                    metadata.set(key, value);
                }
            });
            // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
            // the mime is: image/png
            var mime = dataUri.path.substring(0, dataUri.path.indexOf(';'));
            if (mime) {
                metadata.set(DataUri.META_DATA_MIME, mime);
            }
            return metadata;
        }
        DataUri.parseMetaData = parseMetaData;
    })(DataUri = exports.DataUri || (exports.DataUri = {}));
});
