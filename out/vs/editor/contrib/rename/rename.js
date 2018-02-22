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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/platform/files/common/files", "vs/platform/contextkey/common/contextkey", "vs/platform/message/common/message", "vs/platform/progress/common/progress", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/browser/services/bulkEdit", "./renameInputField", "vs/editor/common/services/resolverService", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/base/common/async", "vs/editor/common/modes", "vs/base/browser/ui/aria/aria", "vs/editor/common/core/range", "vs/editor/contrib/message/messageController", "vs/editor/browser/core/editorState", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, nls, errors_1, severity_1, winjs_base_1, files_1, contextkey_1, message_1, progress_1, editorExtensions_1, editorContextKeys_1, bulkEdit_1, renameInputField_1, resolverService_1, instantiation_1, themeService_1, async_1, modes_1, aria_1, range_1, messageController_1, editorState_1, keybindingsRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function rename(model, position, newName) {
        var supports = modes_1.RenameProviderRegistry.ordered(model);
        var rejects = [];
        var hasResult = false;
        var factory = supports.map(function (support) {
            return function () {
                if (!hasResult) {
                    return async_1.asWinJsPromise(function (token) {
                        return support.provideRenameEdits(model, position, newName, token);
                    }).then(function (result) {
                        if (!result) {
                            // ignore
                        }
                        else if (!result.rejectReason) {
                            hasResult = true;
                            return result;
                        }
                        else {
                            rejects.push(result.rejectReason);
                        }
                        return undefined;
                    });
                }
                return undefined;
            };
        });
        return async_1.sequence(factory).then(function (values) {
            var result = values[0];
            if (rejects.length > 0) {
                return {
                    edits: undefined,
                    rejectReason: rejects.join('\n')
                };
            }
            else if (!result) {
                return {
                    edits: undefined,
                    rejectReason: nls.localize('no result', "No result.")
                };
            }
            else {
                return result;
            }
        });
    }
    exports.rename = rename;
    // TODO@joh
    // merge this into above function to make we always
    // use the same provider for resolving and renamin
    function resolveInitialRenameValue(model, position) {
        var first = modes_1.RenameProviderRegistry.ordered(model)[0];
        if (!first || typeof first.resolveInitialRenameValue !== 'function') {
            return winjs_base_1.TPromise.as(null);
        }
        //Use first rename provider so that we always use the same for resolving the location and for the actual rename
        return async_1.asWinJsPromise(function (token) { return first.resolveInitialRenameValue(model, position, token); }).then(function (result) {
            return !result ? undefined : result;
        }, function (err) {
            errors_1.onUnexpectedExternalError(err);
            return winjs_base_1.TPromise.wrapError(new Error('provider failed'));
        });
    }
    // ---  register actions and commands
    var CONTEXT_RENAME_INPUT_VISIBLE = new contextkey_1.RawContextKey('renameInputVisible', false);
    var RenameController = /** @class */ (function () {
        function RenameController(editor, _messageService, _textModelResolverService, _progressService, contextKeyService, themeService, _fileService) {
            this.editor = editor;
            this._messageService = _messageService;
            this._textModelResolverService = _textModelResolverService;
            this._progressService = _progressService;
            this._fileService = _fileService;
            this._renameInputField = new renameInputField_1.default(editor, themeService);
            this._renameInputVisible = CONTEXT_RENAME_INPUT_VISIBLE.bindTo(contextKeyService);
        }
        RenameController.get = function (editor) {
            return editor.getContribution(RenameController.ID);
        };
        RenameController.prototype.dispose = function () {
            this._renameInputField.dispose();
        };
        RenameController.prototype.getId = function () {
            return RenameController.ID;
        };
        RenameController.prototype.run = function () {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _this = this;
                var selection, lineNumber, selectionStart, selectionEnd, wordRange, word, initialValue, wordAtPosition;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            selection = this.editor.getSelection();
                            lineNumber = selection.startLineNumber, selectionStart = 0, selectionEnd = 0;
                            return [4 /*yield*/, resolveInitialRenameValue(this.editor.getModel(), this.editor.getPosition())];
                        case 1:
                            initialValue = _a.sent();
                            if (initialValue) {
                                lineNumber = initialValue.range.startLineNumber;
                                if (initialValue.text) {
                                    word = initialValue.text;
                                }
                                else {
                                    word = this.editor.getModel().getValueInRange(initialValue.range);
                                }
                                selectionEnd = word.length;
                                if (!selection.isEmpty() && selection.startLineNumber === selection.endLineNumber) {
                                    selectionStart = Math.max(0, selection.startColumn - initialValue.range.startColumn);
                                    selectionEnd = Math.min(initialValue.range.endColumn, selection.endColumn) - initialValue.range.startColumn;
                                }
                                wordRange = new range_1.Range(lineNumber, initialValue.range.startColumn, lineNumber, initialValue.range.endColumn);
                            }
                            else {
                                wordAtPosition = this.editor.getModel().getWordAtPosition(selection.getStartPosition());
                                if (!wordAtPosition) {
                                    return [2 /*return*/, undefined];
                                }
                                word = wordAtPosition.word;
                                selectionEnd = word.length;
                                if (!selection.isEmpty() && selection.startLineNumber === selection.endLineNumber) {
                                    selectionStart = Math.max(0, selection.startColumn - wordAtPosition.startColumn);
                                    selectionEnd = Math.min(wordAtPosition.endColumn, selection.endColumn) - wordAtPosition.startColumn;
                                }
                                wordRange = new range_1.Range(lineNumber, wordAtPosition.startColumn, lineNumber, wordAtPosition.endColumn);
                            }
                            this._renameInputVisible.set(true);
                            return [2 /*return*/, this._renameInputField.getInput(wordRange, word, selectionStart, selectionEnd).then(function (newName) {
                                    _this._renameInputVisible.reset();
                                    _this.editor.focus();
                                    var edit = new bulkEdit_1.BulkEdit(_this.editor, null, _this._textModelResolverService, _this._fileService);
                                    var state = new editorState_1.EditorState(_this.editor, 4 /* Position */ | 1 /* Value */ | 2 /* Selection */ | 8 /* Scroll */);
                                    var renameOperation = rename(_this.editor.getModel(), _this.editor.getPosition(), newName).then(function (result) {
                                        if (result.rejectReason) {
                                            if (state.validate(_this.editor)) {
                                                messageController_1.MessageController.get(_this.editor).showMessage(result.rejectReason, _this.editor.getPosition());
                                            }
                                            else {
                                                _this._messageService.show(severity_1.default.Info, result.rejectReason);
                                            }
                                            return undefined;
                                        }
                                        edit.add(result.edits);
                                        return edit.perform().then(function (selection) {
                                            if (selection) {
                                                _this.editor.setSelection(selection);
                                            }
                                            // alert
                                            aria_1.alert(nls.localize('aria', "Successfully renamed '{0}' to '{1}'. Summary: {2}", word, newName, edit.ariaMessage()));
                                        });
                                    }, function (err) {
                                        _this._messageService.show(severity_1.default.Error, nls.localize('rename.failed', "Sorry, rename failed to execute."));
                                        return winjs_base_1.TPromise.wrapError(err);
                                    });
                                    _this._progressService.showWhile(renameOperation, 250);
                                    return renameOperation;
                                }, function (err) {
                                    _this._renameInputVisible.reset();
                                    _this.editor.focus();
                                    if (!errors_1.isPromiseCanceledError(err)) {
                                        return winjs_base_1.TPromise.wrapError(err);
                                    }
                                    return undefined;
                                })];
                    }
                });
            });
        };
        RenameController.prototype.acceptRenameInput = function () {
            this._renameInputField.acceptInput();
        };
        RenameController.prototype.cancelRenameInput = function () {
            this._renameInputField.cancelInput();
        };
        RenameController.ID = 'editor.contrib.renameController';
        RenameController = __decorate([
            __param(1, message_1.IMessageService),
            __param(2, resolverService_1.ITextModelService),
            __param(3, progress_1.IProgressService),
            __param(4, contextkey_1.IContextKeyService),
            __param(5, themeService_1.IThemeService),
            __param(6, instantiation_1.optional(files_1.IFileService))
        ], RenameController);
        return RenameController;
    }());
    // ---- action implementation
    var RenameAction = /** @class */ (function (_super) {
        __extends(RenameAction, _super);
        function RenameAction() {
            return _super.call(this, {
                id: 'editor.action.rename',
                label: nls.localize('rename.label', "Rename Symbol"),
                alias: 'Rename Symbol',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasRenameProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 60 /* F2 */
                },
                menuOpts: {
                    group: '1_modification',
                    order: 1.1
                }
            }) || this;
        }
        RenameAction.prototype.run = function (accessor, editor) {
            var controller = RenameController.get(editor);
            if (controller) {
                return controller.run();
            }
            return undefined;
        };
        return RenameAction;
    }(editorExtensions_1.EditorAction));
    exports.RenameAction = RenameAction;
    editorExtensions_1.registerEditorContribution(RenameController);
    editorExtensions_1.registerEditorAction(RenameAction);
    var RenameCommand = editorExtensions_1.EditorCommand.bindToContribution(RenameController.get);
    editorExtensions_1.registerEditorCommand(new RenameCommand({
        id: 'acceptRenameInput',
        precondition: CONTEXT_RENAME_INPUT_VISIBLE,
        handler: function (x) { return x.acceptRenameInput(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(99),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 3 /* Enter */
        }
    }));
    editorExtensions_1.registerEditorCommand(new RenameCommand({
        id: 'cancelRenameInput',
        precondition: CONTEXT_RENAME_INPUT_VISIBLE,
        handler: function (x) { return x.cancelRenameInput(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(99),
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* Escape */,
            secondary: [1024 /* Shift */ | 9 /* Escape */]
        }
    }));
    // ---- api bridge command
    editorExtensions_1.registerDefaultLanguageCommand('_executeDocumentRenameProvider', function (model, position, args) {
        var newName = args.newName;
        if (typeof newName !== 'string') {
            throw errors_1.illegalArgument('newName');
        }
        return rename(model, position, newName);
    });
});
