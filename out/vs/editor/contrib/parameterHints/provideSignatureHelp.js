/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "vs/base/common/async", "vs/platform/contextkey/common/contextkey"], function (require, exports, errors_1, editorExtensions_1, modes_1, async_1, contextkey_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Context = {
        Visible: new contextkey_1.RawContextKey('parameterHintsVisible', false),
        MultipleSignatures: new contextkey_1.RawContextKey('parameterHintsMultipleSignatures', false),
    };
    function provideSignatureHelp(model, position) {
        var supports = modes_1.SignatureHelpProviderRegistry.ordered(model);
        var result;
        return async_1.sequence(supports.map(function (support) { return function () {
            if (result) {
                // stop when there is a result
                return undefined;
            }
            return async_1.asWinJsPromise(function (token) { return support.provideSignatureHelp(model, position, token); }).then(function (thisResult) {
                result = thisResult;
            }, errors_1.onUnexpectedExternalError);
        }; })).then(function () { return result; });
    }
    exports.provideSignatureHelp = provideSignatureHelp;
    editorExtensions_1.registerDefaultLanguageCommand('_executeSignatureHelpProvider', provideSignatureHelp);
});
