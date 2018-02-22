/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, nls_1, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsConfigurationSchemaId = 'vscode://schemas/extensions';
    exports.ExtensionsConfigurationSchema = {
        id: exports.ExtensionsConfigurationSchemaId,
        allowComments: true,
        type: 'object',
        title: nls_1.localize('app.extensions.json.title', "Extensions"),
        properties: {
            recommendations: {
                type: 'array',
                description: nls_1.localize('app.extensions.json.recommendations', "List of extensions recommendations. The identifier of an extension is always '${publisher}.${name}'. For example: 'vscode.csharp'."),
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN,
                    errorMessage: nls_1.localize('app.extension.identifier.errorMessage', "Expected format '${publisher}.${name}'. Example: 'vscode.csharp'.")
                },
            },
        }
    };
    exports.ExtensionsConfigurationInitialContent = [
        '{',
        '\t// See http://go.microsoft.com/fwlink/?LinkId=827846',
        '\t// for the documentation about the extensions.json format',
        '\t"recommendations": [',
        '\t\t// Extension identifier format: ${publisher}.${name}. Example: vscode.csharp',
        '\t\t',
        '\t]',
        '}'
    ].join('\n');
});
