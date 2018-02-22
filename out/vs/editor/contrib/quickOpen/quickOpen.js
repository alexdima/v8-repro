/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/editor/common/core/range", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "vs/editor/common/services/modelService", "vs/base/common/async"], function (require, exports, errors_1, uri_1, winjs_base_1, range_1, editorExtensions_1, modes_1, modelService_1, async_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getDocumentSymbols(model) {
        var entries = [];
        var promises = modes_1.DocumentSymbolProviderRegistry.all(model).map(function (support) {
            return async_1.asWinJsPromise(function (token) {
                return support.provideDocumentSymbols(model, token);
            }).then(function (result) {
                if (Array.isArray(result)) {
                    entries.push.apply(entries, result);
                }
            }, function (err) {
                errors_1.onUnexpectedExternalError(err);
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function () {
            var flatEntries = [];
            flatten(flatEntries, entries, '');
            flatEntries.sort(compareEntriesUsingStart);
            return {
                entries: flatEntries,
            };
        });
    }
    exports.getDocumentSymbols = getDocumentSymbols;
    function compareEntriesUsingStart(a, b) {
        return range_1.Range.compareRangesUsingStarts(range_1.Range.lift(a.location.range), range_1.Range.lift(b.location.range));
    }
    function flatten(bucket, entries, overrideContainerLabel) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            bucket.push({
                kind: entry.kind,
                location: entry.location,
                name: entry.name,
                containerName: entry.containerName || overrideContainerLabel
            });
        }
    }
    editorExtensions_1.registerLanguageCommand('_executeDocumentSymbolProvider', function (accessor, args) {
        var resource = args.resource;
        if (!(resource instanceof uri_1.default)) {
            throw errors_1.illegalArgument('resource');
        }
        var model = accessor.get(modelService_1.IModelService).getModel(resource);
        if (!model) {
            throw errors_1.illegalArgument('resource');
        }
        return getDocumentSymbols(model);
    });
});
