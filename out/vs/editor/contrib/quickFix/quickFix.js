define(["require", "exports", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/modes", "vs/base/common/async", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/editor/common/services/modelService", "vs/editor/browser/editorExtensions", "vs/base/common/arrays"], function (require, exports, uri_1, range_1, modes_1, async_1, winjs_base_1, errors_1, modelService_1, editorExtensions_1, arrays_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getCodeActions(model, range, scope) {
        var allResults = [];
        var promises = modes_1.CodeActionProviderRegistry.all(model).map(function (support) {
            return async_1.asWinJsPromise(function (token) { return support.provideCodeActions(model, range, { only: scope ? scope.value : undefined }, token); }).then(function (result) {
                if (Array.isArray(result)) {
                    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                        var quickFix = result_1[_i];
                        if (quickFix) {
                            if (!scope || (quickFix.kind && scope.contains(quickFix.kind))) {
                                allResults.push(quickFix);
                            }
                        }
                    }
                }
            }, function (err) {
                errors_1.onUnexpectedExternalError(err);
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function () { return allResults.sort(codeActionsComparator); });
    }
    exports.getCodeActions = getCodeActions;
    function codeActionsComparator(a, b) {
        var aHasDiags = !arrays_1.isFalsyOrEmpty(a.diagnostics);
        var bHasDiags = !arrays_1.isFalsyOrEmpty(b.diagnostics);
        if (aHasDiags) {
            if (bHasDiags) {
                return a.diagnostics[0].message.localeCompare(b.diagnostics[0].message);
            }
            else {
                return -1;
            }
        }
        else if (bHasDiags) {
            return 1;
        }
        else {
            return 0; // both have no diagnostics
        }
    }
    editorExtensions_1.registerLanguageCommand('_executeCodeActionProvider', function (accessor, args) {
        var resource = args.resource, range = args.range;
        if (!(resource instanceof uri_1.default) || !range_1.Range.isIRange(range)) {
            throw errors_1.illegalArgument();
        }
        var model = accessor.get(modelService_1.IModelService).getModel(resource);
        if (!model) {
            throw errors_1.illegalArgument();
        }
        return getCodeActions(model, model.validateRange(range));
    });
});
