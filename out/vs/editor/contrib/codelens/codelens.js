/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/arrays", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "vs/editor/common/services/modelService", "vs/base/common/async"], function (require, exports, errors_1, arrays_1, uri_1, winjs_base_1, editorExtensions_1, modes_1, modelService_1, async_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getCodeLensData(model) {
        var symbols = [];
        var provider = modes_1.CodeLensProviderRegistry.ordered(model);
        var promises = provider.map(function (provider) { return async_1.asWinJsPromise(function (token) { return provider.provideCodeLenses(model, token); }).then(function (result) {
            if (Array.isArray(result)) {
                for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                    var symbol = result_1[_i];
                    symbols.push({ symbol: symbol, provider: provider });
                }
            }
        }, errors_1.onUnexpectedExternalError); });
        return winjs_base_1.TPromise.join(promises).then(function () {
            return arrays_1.mergeSort(symbols, function (a, b) {
                // sort by lineNumber, provider-rank, and column
                if (a.symbol.range.startLineNumber < b.symbol.range.startLineNumber) {
                    return -1;
                }
                else if (a.symbol.range.startLineNumber > b.symbol.range.startLineNumber) {
                    return 1;
                }
                else if (provider.indexOf(a.provider) < provider.indexOf(b.provider)) {
                    return -1;
                }
                else if (provider.indexOf(a.provider) > provider.indexOf(b.provider)) {
                    return 1;
                }
                else if (a.symbol.range.startColumn < b.symbol.range.startColumn) {
                    return -1;
                }
                else if (a.symbol.range.startColumn > b.symbol.range.startColumn) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
        });
    }
    exports.getCodeLensData = getCodeLensData;
    editorExtensions_1.registerLanguageCommand('_executeCodeLensProvider', function (accessor, args) {
        var resource = args.resource;
        if (!(resource instanceof uri_1.default)) {
            throw errors_1.illegalArgument();
        }
        var model = accessor.get(modelService_1.IModelService).getModel(resource);
        if (!model) {
            throw errors_1.illegalArgument();
        }
        return getCodeLensData(model).then(function (value) { return value.map(function (item) { return item.symbol; }); });
    });
});
