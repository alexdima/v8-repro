/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/winjs.base", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "vs/base/common/async"], function (require, exports, arrays_1, errors_1, winjs_base_1, editorExtensions_1, modes_1, async_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getHover(model, position) {
        var supports = modes_1.HoverProviderRegistry.ordered(model);
        var values = [];
        var promises = supports.map(function (support, idx) {
            return async_1.asWinJsPromise(function (token) {
                return support.provideHover(model, position, token);
            }).then(function (result) {
                if (result) {
                    var hasRange = (typeof result.range !== 'undefined');
                    var hasHtmlContent = typeof result.contents !== 'undefined' && result.contents && result.contents.length > 0;
                    if (hasRange && hasHtmlContent) {
                        values[idx] = result;
                    }
                }
            }, function (err) {
                errors_1.onUnexpectedExternalError(err);
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function () { return arrays_1.coalesce(values); });
    }
    exports.getHover = getHover;
    editorExtensions_1.registerDefaultLanguageCommand('_executeHoverProvider', getHover);
});
