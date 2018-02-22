define(["require", "exports", "vs/nls", "vs/platform/extensions/common/extensionsRegistry", "vs/base/common/uri", "vs/base/common/strings", "vs/base/common/paths"], function (require, exports, nls, extensionsRegistry_1, uri_1, strings, paths) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('jsonValidation', [], {
        description: nls.localize('contributes.jsonValidation', 'Contributes json schema configuration.'),
        type: 'array',
        defaultSnippets: [{ body: [{ fileMatch: '${1:file.json}', url: '${2:url}' }] }],
        items: {
            type: 'object',
            defaultSnippets: [{ body: { fileMatch: '${1:file.json}', url: '${2:url}' } }],
            properties: {
                fileMatch: {
                    type: 'string',
                    description: nls.localize('contributes.jsonValidation.fileMatch', 'The file pattern to match, for example "package.json" or "*.launch".'),
                },
                url: {
                    description: nls.localize('contributes.jsonValidation.url', 'A schema URL (\'http:\', \'https:\') or relative path to the extension folder (\'./\').'),
                    type: 'string'
                }
            }
        }
    });
    var JSONValidationExtensionPoint = /** @class */ (function () {
        function JSONValidationExtensionPoint() {
            configurationExtPoint.setHandler(function (extensions) {
                var _loop_1 = function (i) {
                    var extensionValue = extensions[i].value;
                    var collector = extensions[i].collector;
                    var extensionPath = extensions[i].description.extensionFolderPath;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize('invalid.jsonValidation', "'configuration.jsonValidation' must be a array"));
                        return { value: void 0 };
                    }
                    extensionValue.forEach(function (extension) {
                        if (typeof extension.fileMatch !== 'string') {
                            collector.error(nls.localize('invalid.fileMatch', "'configuration.jsonValidation.fileMatch' must be defined"));
                            return;
                        }
                        var uri = extension.url;
                        if (typeof extension.url !== 'string') {
                            collector.error(nls.localize('invalid.url', "'configuration.jsonValidation.url' must be a URL or relative path"));
                            return;
                        }
                        if (strings.startsWith(uri, './')) {
                            try {
                                uri = uri_1.default.file(paths.normalize(paths.join(extensionPath, uri))).toString();
                            }
                            catch (e) {
                                collector.error(nls.localize('invalid.url.fileschema', "'configuration.jsonValidation.url' is an invalid relative URL: {0}", e.message));
                            }
                        }
                        else if (!strings.startsWith(uri, 'https:/') && strings.startsWith(uri, 'https:/')) {
                            collector.error(nls.localize('invalid.url.schema', "'configuration.jsonValidation.url' must start with 'http:', 'https:' or './' to reference schemas located in the extension"));
                            return;
                        }
                    });
                };
                for (var i = 0; i < extensions.length; i++) {
                    var state_1 = _loop_1(i);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            });
        }
        return JSONValidationExtensionPoint;
    }());
    exports.JSONValidationExtensionPoint = JSONValidationExtensionPoint;
});
