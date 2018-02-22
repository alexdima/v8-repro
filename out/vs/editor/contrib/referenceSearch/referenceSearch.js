var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/platform/editor/common/editor", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "./peekViewWidget", "./referencesController", "./referencesModel", "vs/base/common/async", "vs/base/common/errors", "vs/editor/common/editorContextKeys", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/browser/editorBrowser", "vs/platform/list/browser/listService", "vs/editor/contrib/referenceSearch/referencesWidget"], function (require, exports, nls, uri_1, winjs_base_1, editor_1, commands_1, contextkey_1, keybindingsRegistry_1, position_1, range_1, editorExtensions_1, modes_1, peekViewWidget_1, referencesController_1, referencesModel_1, async_1, errors_1, editorContextKeys_1, embeddedCodeEditorWidget_1, editorBrowser_1, listService_1, referencesWidget_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var defaultReferenceSearchOptions = {
        getMetaTitle: function (model) {
            return model.references.length > 1 && nls.localize('meta.titleReference', " – {0} references", model.references.length);
        }
    };
    var ReferenceController = /** @class */ (function () {
        function ReferenceController(editor, contextKeyService) {
            if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
                peekViewWidget_1.PeekContext.inPeekEditor.bindTo(contextKeyService);
            }
        }
        ReferenceController.prototype.dispose = function () {
        };
        ReferenceController.prototype.getId = function () {
            return ReferenceController.ID;
        };
        ReferenceController.ID = 'editor.contrib.referenceController';
        ReferenceController = __decorate([
            __param(1, contextkey_1.IContextKeyService)
        ], ReferenceController);
        return ReferenceController;
    }());
    exports.ReferenceController = ReferenceController;
    var ReferenceAction = /** @class */ (function (_super) {
        __extends(ReferenceAction, _super);
        function ReferenceAction() {
            return _super.call(this, {
                id: 'editor.action.referenceSearch.trigger',
                label: nls.localize('references.action.label', "Find All References"),
                alias: 'Find All References',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasReferenceProvider, peekViewWidget_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInEmbeddedEditor.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 1024 /* Shift */ | 70 /* F12 */
                },
                menuOpts: {
                    group: 'navigation',
                    order: 1.5
                }
            }) || this;
        }
        ReferenceAction.prototype.run = function (accessor, editor) {
            var controller = referencesController_1.ReferencesController.get(editor);
            if (!controller) {
                return;
            }
            var range = editor.getSelection();
            var model = editor.getModel();
            var references = provideReferences(model, range.getStartPosition()).then(function (references) { return new referencesModel_1.ReferencesModel(references); });
            controller.toggleWidget(range, references, defaultReferenceSearchOptions);
        };
        return ReferenceAction;
    }(editorExtensions_1.EditorAction));
    exports.ReferenceAction = ReferenceAction;
    editorExtensions_1.registerEditorContribution(ReferenceController);
    editorExtensions_1.registerEditorAction(ReferenceAction);
    var findReferencesCommand = function (accessor, resource, position) {
        if (!(resource instanceof uri_1.default)) {
            throw new Error('illegal argument, uri');
        }
        if (!position) {
            throw new Error('illegal argument, position');
        }
        return accessor.get(editor_1.IEditorService).openEditor({ resource: resource }).then(function (editor) {
            var control = editor.getControl();
            if (!editorBrowser_1.isCodeEditor(control)) {
                return undefined;
            }
            var controller = referencesController_1.ReferencesController.get(control);
            if (!controller) {
                return undefined;
            }
            var references = provideReferences(control.getModel(), position_1.Position.lift(position)).then(function (references) { return new referencesModel_1.ReferencesModel(references); });
            var range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            return winjs_base_1.TPromise.as(controller.toggleWidget(range, references, defaultReferenceSearchOptions));
        });
    };
    var showReferencesCommand = function (accessor, resource, position, references) {
        if (!(resource instanceof uri_1.default)) {
            throw new Error('illegal argument, uri expected');
        }
        return accessor.get(editor_1.IEditorService).openEditor({ resource: resource }).then(function (editor) {
            var control = editor.getControl();
            if (!editorBrowser_1.isCodeEditor(control)) {
                return undefined;
            }
            var controller = referencesController_1.ReferencesController.get(control);
            if (!controller) {
                return undefined;
            }
            return winjs_base_1.TPromise.as(controller.toggleWidget(new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column), winjs_base_1.TPromise.as(new referencesModel_1.ReferencesModel(references)), defaultReferenceSearchOptions)).then(function () { return true; });
        });
    };
    // register commands
    commands_1.CommandsRegistry.registerCommand({
        id: 'editor.action.findReferences',
        handler: findReferencesCommand
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'editor.action.showReferences',
        handler: showReferencesCommand,
        description: {
            description: 'Show references at a position in a file',
            args: [
                { name: 'uri', description: 'The text document in which to show references', constraint: uri_1.default },
                { name: 'position', description: 'The position at which to show', constraint: position_1.Position.isIPosition },
                { name: 'locations', description: 'An array of locations.', constraint: Array },
            ]
        }
    });
    function closeActiveReferenceSearch(accessor, args) {
        withController(accessor, function (controller) { return controller.closeWidget(); });
    }
    function openReferenceToSide(accessor, args) {
        var listService = accessor.get(listService_1.IListService);
        var focus = listService.lastFocusedList && listService.lastFocusedList.getFocus();
        if (focus instanceof referencesModel_1.OneReference) {
            withController(accessor, function (controller) { return controller.openReference(focus, true); });
        }
    }
    function withController(accessor, fn) {
        var outerEditor = peekViewWidget_1.getOuterEditor(accessor);
        if (!outerEditor) {
            return;
        }
        var controller = referencesController_1.ReferencesController.get(outerEditor);
        if (!controller) {
            return;
        }
        fn(controller);
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'closeReferenceSearch',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50),
        primary: 9 /* Escape */,
        secondary: [1024 /* Shift */ | 9 /* Escape */],
        when: contextkey_1.ContextKeyExpr.and(referencesController_1.ctxReferenceSearchVisible, contextkey_1.ContextKeyExpr.not('config.editor.stablePeek')),
        handler: closeActiveReferenceSearch
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'closeReferenceSearchEditor',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(-101),
        primary: 9 /* Escape */,
        secondary: [1024 /* Shift */ | 9 /* Escape */],
        when: contextkey_1.ContextKeyExpr.and(peekViewWidget_1.PeekContext.inPeekEditor, contextkey_1.ContextKeyExpr.not('config.editor.stablePeek')),
        handler: closeActiveReferenceSearch
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'openReferenceToSide',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        mac: {
            primary: 256 /* WinCtrl */ | 3 /* Enter */
        },
        when: contextkey_1.ContextKeyExpr.and(referencesController_1.ctxReferenceSearchVisible, referencesWidget_1.ctxReferenceWidgetSearchTreeFocused),
        handler: openReferenceToSide
    });
    function provideReferences(model, position) {
        // collect references from all providers
        var promises = modes_1.ReferenceProviderRegistry.ordered(model).map(function (provider) {
            return async_1.asWinJsPromise(function (token) {
                return provider.provideReferences(model, position, { includeDeclaration: true }, token);
            }).then(function (result) {
                if (Array.isArray(result)) {
                    return result;
                }
                return undefined;
            }, function (err) {
                errors_1.onUnexpectedExternalError(err);
            });
        });
        return winjs_base_1.TPromise.join(promises).then(function (references) {
            var result = [];
            for (var _i = 0, references_1 = references; _i < references_1.length; _i++) {
                var ref = references_1[_i];
                if (ref) {
                    result.push.apply(result, ref);
                }
            }
            return result;
        });
    }
    exports.provideReferences = provideReferences;
    editorExtensions_1.registerDefaultLanguageCommand('_executeReferenceProvider', provideReferences);
});
