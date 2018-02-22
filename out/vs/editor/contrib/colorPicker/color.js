/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/winjs.base", "vs/editor/common/modes", "vs/base/common/async"], function (require, exports, winjs_base_1, modes_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getColors(model) {
        var colors = [];
        var providers = modes_1.ColorProviderRegistry.ordered(model).reverse();
        var promises = providers.map(function (provider) { return async_1.asWinJsPromise(function (token) { return provider.provideDocumentColors(model, token); }).then(function (result) {
            if (Array.isArray(result)) {
                for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                    var colorInfo = result_1[_i];
                    colors.push({ colorInfo: colorInfo, provider: provider });
                }
            }
        }); });
        return winjs_base_1.TPromise.join(promises).then(function () { return colors; });
    }
    exports.getColors = getColors;
    function getColorPresentations(model, colorInfo, provider) {
        return async_1.asWinJsPromise(function (token) { return provider.provideColorPresentations(model, colorInfo, token); });
    }
    exports.getColorPresentations = getColorPresentations;
});
