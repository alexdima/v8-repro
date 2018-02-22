/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/winjs.base", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "vs/base/common/async", "vs/base/common/arrays"], function (require, exports, errors_1, winjs_base_1, editorExtensions_1, modes_1, async_1, arrays_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getDefinitions(model, position, registry, provide) {
        var provider = registry.ordered(model);
        // get results
        var promises = provider.map(function (provider, idx) {
            return async_1.asWinJsPromise(function (token) {
                return provide(provider, model, position, token);
            }).then(undefined, function (err) {
                errors_1.onUnexpectedExternalError(err);
                return null;
            });
        });
        return winjs_base_1.TPromise.join(promises)
            .then(arrays_1.flatten)
            .then(function (references) { return references.filter(function (x) { return !!x; }); });
    }
    function getDefinitionsAtPosition(model, position) {
        return getDefinitions(model, position, modes_1.DefinitionProviderRegistry, function (provider, model, position, token) {
            return provider.provideDefinition(model, position, token);
        });
    }
    exports.getDefinitionsAtPosition = getDefinitionsAtPosition;
    function getImplementationsAtPosition(model, position) {
        return getDefinitions(model, position, modes_1.ImplementationProviderRegistry, function (provider, model, position, token) {
            return provider.provideImplementation(model, position, token);
        });
    }
    exports.getImplementationsAtPosition = getImplementationsAtPosition;
    function getTypeDefinitionsAtPosition(model, position) {
        return getDefinitions(model, position, modes_1.TypeDefinitionProviderRegistry, function (provider, model, position, token) {
            return provider.provideTypeDefinition(model, position, token);
        });
    }
    exports.getTypeDefinitionsAtPosition = getTypeDefinitionsAtPosition;
    editorExtensions_1.registerDefaultLanguageCommand('_executeDefinitionProvider', getDefinitionsAtPosition);
    editorExtensions_1.registerDefaultLanguageCommand('_executeImplementationProvider', getImplementationsAtPosition);
    editorExtensions_1.registerDefaultLanguageCommand('_executeTypeDefinitionProvider', getTypeDefinitionsAtPosition);
});
