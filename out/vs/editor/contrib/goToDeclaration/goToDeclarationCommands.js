/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "vs/nls", "vs/base/browser/ui/aria/aria", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/platform/editor/common/editor", "vs/platform/message/common/message", "vs/editor/common/core/range", "vs/editor/browser/editorExtensions", "./goToDeclaration", "vs/editor/contrib/referenceSearch/referencesController", "vs/editor/contrib/referenceSearch/referencesModel", "vs/editor/contrib/referenceSearch/peekViewWidget", "vs/platform/contextkey/common/contextkey", "vs/editor/contrib/message/messageController", "vs/editor/common/editorContextKeys", "vs/platform/progress/common/progress"], function (require, exports, nls, aria_1, keyCodes_1, platform, severity_1, winjs_base_1, editor_1, message_1, range_1, editorExtensions_1, goToDeclaration_1, referencesController_1, referencesModel_1, peekViewWidget_1, contextkey_1, messageController_1, editorContextKeys_1, progress_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var DefinitionActionConfig = /** @class */ (function () {
        function DefinitionActionConfig(openToSide, openInPeek, filterCurrent, showMessage) {
            if (openToSide === void 0) { openToSide = false; }
            if (openInPeek === void 0) { openInPeek = false; }
            if (filterCurrent === void 0) { filterCurrent = true; }
            if (showMessage === void 0) { showMessage = true; }
            this.openToSide = openToSide;
            this.openInPeek = openInPeek;
            this.filterCurrent = filterCurrent;
            this.showMessage = showMessage;
            //
        }
        return DefinitionActionConfig;
    }());
    exports.DefinitionActionConfig = DefinitionActionConfig;
    var DefinitionAction = /** @class */ (function (_super) {
        __extends(DefinitionAction, _super);
        function DefinitionAction(configuration, opts) {
            var _this = _super.call(this, opts) || this;
            _this._configuration = configuration;
            return _this;
        }
        DefinitionAction.prototype.run = function (accessor, editor) {
            var _this = this;
            var messageService = accessor.get(message_1.IMessageService);
            var editorService = accessor.get(editor_1.IEditorService);
            var progressService = accessor.get(progress_1.IProgressService);
            var model = editor.getModel();
            var pos = editor.getPosition();
            var definitionPromise = this._getDeclarationsAtPosition(model, pos).then(function (references) {
                if (model.isDisposed() || editor.getModel() !== model) {
                    // new model, no more model
                    return;
                }
                // * remove falsy references
                // * find reference at the current pos
                var idxOfCurrent = -1;
                var result = [];
                for (var i = 0; i < references.length; i++) {
                    var reference = references[i];
                    if (!reference || !reference.range) {
                        continue;
                    }
                    var uri = reference.uri, range = reference.range;
                    var newLen = result.push({
                        uri: uri,
                        range: range
                    });
                    if (_this._configuration.filterCurrent
                        && uri.toString() === model.uri.toString()
                        && range_1.Range.containsPosition(range, pos)
                        && idxOfCurrent === -1) {
                        idxOfCurrent = newLen - 1;
                    }
                }
                if (result.length === 0) {
                    // no result -> show message
                    if (_this._configuration.showMessage) {
                        var info = model.getWordAtPosition(pos);
                        messageController_1.MessageController.get(editor).showMessage(_this._getNoResultFoundMessage(info), pos);
                    }
                }
                else if (result.length === 1 && idxOfCurrent !== -1) {
                    // only the position at which we are -> adjust selection
                    var current = result[0];
                    _this._openReference(editorService, current, false);
                }
                else {
                    // handle multile results
                    _this._onResult(editorService, editor, new referencesModel_1.ReferencesModel(result));
                }
            }, function (err) {
                // report an error
                messageService.show(severity_1.default.Error, err);
            });
            progressService.showWhile(definitionPromise, 250);
            return definitionPromise;
        };
        DefinitionAction.prototype._getDeclarationsAtPosition = function (model, position) {
            return goToDeclaration_1.getDefinitionsAtPosition(model, position);
        };
        DefinitionAction.prototype._getNoResultFoundMessage = function (info) {
            return info && info.word
                ? nls.localize('noResultWord', "No definition found for '{0}'", info.word)
                : nls.localize('generic.noResults', "No definition found");
        };
        DefinitionAction.prototype._getMetaTitle = function (model) {
            return model.references.length > 1 && nls.localize('meta.title', " – {0} definitions", model.references.length);
        };
        DefinitionAction.prototype._onResult = function (editorService, editor, model) {
            var _this = this;
            var msg = model.getAriaMessage();
            aria_1.alert(msg);
            if (this._configuration.openInPeek) {
                this._openInPeek(editorService, editor, model);
            }
            else {
                var next = model.nearestReference(editor.getModel().uri, editor.getPosition());
                this._openReference(editorService, next, this._configuration.openToSide).then(function (editor) {
                    if (editor && model.references.length > 1) {
                        _this._openInPeek(editorService, editor, model);
                    }
                    else {
                        model.dispose();
                    }
                });
            }
        };
        DefinitionAction.prototype._openReference = function (editorService, reference, sideBySide) {
            var uri = reference.uri, range = reference.range;
            return editorService.openEditor({
                resource: uri,
                options: {
                    selection: range_1.Range.collapseToStart(range),
                    revealIfVisible: true,
                    revealInCenterIfOutsideViewport: true
                }
            }, sideBySide).then(function (editor) {
                return editor && editor.getControl();
            });
        };
        DefinitionAction.prototype._openInPeek = function (editorService, target, model) {
            var _this = this;
            var controller = referencesController_1.ReferencesController.get(target);
            if (controller) {
                controller.toggleWidget(target.getSelection(), winjs_base_1.TPromise.as(model), {
                    getMetaTitle: function (model) {
                        return _this._getMetaTitle(model);
                    },
                    onGoto: function (reference) {
                        controller.closeWidget();
                        return _this._openReference(editorService, reference, false);
                    }
                });
            }
            else {
                model.dispose();
            }
        };
        return DefinitionAction;
    }(editorExtensions_1.EditorAction));
    exports.DefinitionAction = DefinitionAction;
    var goToDeclarationKb = platform.isWeb
        ? 2048 /* CtrlCmd */ | 70 /* F12 */
        : 70 /* F12 */;
    var GoToDefinitionAction = /** @class */ (function (_super) {
        __extends(GoToDefinitionAction, _super);
        function GoToDefinitionAction() {
            return _super.call(this, new DefinitionActionConfig(), {
                id: GoToDefinitionAction.ID,
                label: nls.localize('actions.goToDecl.label', "Go to Definition"),
                alias: 'Go to Definition',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInEmbeddedEditor.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: goToDeclarationKb
                },
                menuOpts: {
                    group: 'navigation',
                    order: 1.1
                }
            }) || this;
        }
        GoToDefinitionAction.ID = 'editor.action.goToDeclaration';
        return GoToDefinitionAction;
    }(DefinitionAction));
    exports.GoToDefinitionAction = GoToDefinitionAction;
    var OpenDefinitionToSideAction = /** @class */ (function (_super) {
        __extends(OpenDefinitionToSideAction, _super);
        function OpenDefinitionToSideAction() {
            return _super.call(this, new DefinitionActionConfig(true), {
                id: OpenDefinitionToSideAction.ID,
                label: nls.localize('actions.goToDeclToSide.label', "Open Definition to the Side"),
                alias: 'Open Definition to the Side',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInEmbeddedEditor.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, goToDeclarationKb)
                }
            }) || this;
        }
        OpenDefinitionToSideAction.ID = 'editor.action.openDeclarationToTheSide';
        return OpenDefinitionToSideAction;
    }(DefinitionAction));
    exports.OpenDefinitionToSideAction = OpenDefinitionToSideAction;
    var PeekDefinitionAction = /** @class */ (function (_super) {
        __extends(PeekDefinitionAction, _super);
        function PeekDefinitionAction() {
            return _super.call(this, new DefinitionActionConfig(void 0, true, false), {
                id: 'editor.action.previewDeclaration',
                label: nls.localize('actions.previewDecl.label', "Peek Definition"),
                alias: 'Peek Definition',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasDefinitionProvider, peekViewWidget_1.PeekContext.notInPeekEditor, editorContextKeys_1.EditorContextKeys.isInEmbeddedEditor.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 512 /* Alt */ | 70 /* F12 */,
                    linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 68 /* F10 */ }
                },
                menuOpts: {
                    group: 'navigation',
                    order: 1.2
                }
            }) || this;
        }
        return PeekDefinitionAction;
    }(DefinitionAction));
    exports.PeekDefinitionAction = PeekDefinitionAction;
    var ImplementationAction = /** @class */ (function (_super) {
        __extends(ImplementationAction, _super);
        function ImplementationAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ImplementationAction.prototype._getDeclarationsAtPosition = function (model, position) {
            return goToDeclaration_1.getImplementationsAtPosition(model, position);
        };
        ImplementationAction.prototype._getNoResultFoundMessage = function (info) {
            return info && info.word
                ? nls.localize('goToImplementation.noResultWord', "No implementation found for '{0}'", info.word)
                : nls.localize('goToImplementation.generic.noResults', "No implementation found");
        };
        ImplementationAction.prototype._getMetaTitle = function (model) {
            return model.references.length > 1 && nls.localize('meta.implementations.title', " – {0} implementations", model.references.length);
        };
        return ImplementationAction;
    }(DefinitionAction));
    exports.ImplementationAction = ImplementationAction;
    var GoToImplementationAction = /** @class */ (function (_super) {
        __extends(GoToImplementationAction, _super);
        function GoToImplementationAction() {
            return _super.call(this, new DefinitionActionConfig(), {
                id: GoToImplementationAction.ID,
                label: nls.localize('actions.goToImplementation.label', "Go to Implementation"),
                alias: 'Go to Implementation',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasImplementationProvider, editorContextKeys_1.EditorContextKeys.isInEmbeddedEditor.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 70 /* F12 */
                }
            }) || this;
        }
        GoToImplementationAction.ID = 'editor.action.goToImplementation';
        return GoToImplementationAction;
    }(ImplementationAction));
    exports.GoToImplementationAction = GoToImplementationAction;
    var PeekImplementationAction = /** @class */ (function (_super) {
        __extends(PeekImplementationAction, _super);
        function PeekImplementationAction() {
            return _super.call(this, new DefinitionActionConfig(false, true, false), {
                id: PeekImplementationAction.ID,
                label: nls.localize('actions.peekImplementation.label', "Peek Implementation"),
                alias: 'Peek Implementation',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasImplementationProvider, editorContextKeys_1.EditorContextKeys.isInEmbeddedEditor.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 70 /* F12 */
                }
            }) || this;
        }
        PeekImplementationAction.ID = 'editor.action.peekImplementation';
        return PeekImplementationAction;
    }(ImplementationAction));
    exports.PeekImplementationAction = PeekImplementationAction;
    var TypeDefinitionAction = /** @class */ (function (_super) {
        __extends(TypeDefinitionAction, _super);
        function TypeDefinitionAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TypeDefinitionAction.prototype._getDeclarationsAtPosition = function (model, position) {
            return goToDeclaration_1.getTypeDefinitionsAtPosition(model, position);
        };
        TypeDefinitionAction.prototype._getNoResultFoundMessage = function (info) {
            return info && info.word
                ? nls.localize('goToTypeDefinition.noResultWord', "No type definition found for '{0}'", info.word)
                : nls.localize('goToTypeDefinition.generic.noResults', "No type definition found");
        };
        TypeDefinitionAction.prototype._getMetaTitle = function (model) {
            return model.references.length > 1 && nls.localize('meta.typeDefinitions.title', " – {0} type definitions", model.references.length);
        };
        return TypeDefinitionAction;
    }(DefinitionAction));
    exports.TypeDefinitionAction = TypeDefinitionAction;
    var GoToTypeDefintionAction = /** @class */ (function (_super) {
        __extends(GoToTypeDefintionAction, _super);
        function GoToTypeDefintionAction() {
            return _super.call(this, new DefinitionActionConfig(), {
                id: GoToTypeDefintionAction.ID,
                label: nls.localize('actions.goToTypeDefinition.label', "Go to Type Definition"),
                alias: 'Go to Type Definition',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInEmbeddedEditor.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 0
                },
                menuOpts: {
                    group: 'navigation',
                    order: 1.4
                }
            }) || this;
        }
        GoToTypeDefintionAction.ID = 'editor.action.goToTypeDefinition';
        return GoToTypeDefintionAction;
    }(TypeDefinitionAction));
    exports.GoToTypeDefintionAction = GoToTypeDefintionAction;
    var PeekTypeDefinitionAction = /** @class */ (function (_super) {
        __extends(PeekTypeDefinitionAction, _super);
        function PeekTypeDefinitionAction() {
            return _super.call(this, new DefinitionActionConfig(false, true, false), {
                id: PeekTypeDefinitionAction.ID,
                label: nls.localize('actions.peekTypeDefinition.label', "Peek Type Definition"),
                alias: 'Peek Type Definition',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasTypeDefinitionProvider, editorContextKeys_1.EditorContextKeys.isInEmbeddedEditor.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 0
                }
            }) || this;
        }
        PeekTypeDefinitionAction.ID = 'editor.action.peekTypeDefinition';
        return PeekTypeDefinitionAction;
    }(TypeDefinitionAction));
    exports.PeekTypeDefinitionAction = PeekTypeDefinitionAction;
    editorExtensions_1.registerEditorAction(GoToDefinitionAction);
    editorExtensions_1.registerEditorAction(OpenDefinitionToSideAction);
    editorExtensions_1.registerEditorAction(PeekDefinitionAction);
    editorExtensions_1.registerEditorAction(GoToImplementationAction);
    editorExtensions_1.registerEditorAction(PeekImplementationAction);
    editorExtensions_1.registerEditorAction(GoToTypeDefintionAction);
    editorExtensions_1.registerEditorAction(PeekTypeDefinitionAction);
});
