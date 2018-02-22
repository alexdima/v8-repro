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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/types", "vs/base/common/paths", "vs/base/common/actions", "vs/workbench/parts/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/browser/parts/editor/textEditor", "vs/workbench/common/editor/binaryEditorModel", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/files/common/files", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/editor/common/services/resourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/workbench/services/editor/common/editorService", "vs/platform/theme/common/themeService", "vs/workbench/services/group/common/groupService"], function (require, exports, winjs_base_1, nls, errors, errorMessage_1, types, paths, actions_1, files_1, textfiles_1, textEditor_1, binaryEditorModel_1, viewlet_1, files_2, telemetry_1, workspace_1, storage_1, resourceConfiguration_1, instantiation_1, message_1, editorService_1, themeService_1, groupService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An implementation of editor for file system resources.
     */
    var TextFileEditor = /** @class */ (function (_super) {
        __extends(TextFileEditor, _super);
        function TextFileEditor(telemetryService, fileService, viewletService, instantiationService, contextService, storageService, configurationService, editorService, themeService, editorGroupService, textFileService) {
            var _this = _super.call(this, TextFileEditor.ID, telemetryService, instantiationService, storageService, configurationService, themeService, textFileService, editorGroupService) || this;
            _this.fileService = fileService;
            _this.viewletService = viewletService;
            _this.contextService = contextService;
            _this.editorService = editorService;
            // Clear view state for deleted files
            _this.toUnbind.push(_this.fileService.onFileChanges(function (e) { return _this.onFilesChanged(e); }));
            // React to editors closing to preserve view state
            _this.toUnbind.push(editorGroupService.getStacksModel().onWillCloseEditor(function (e) { return _this.onWillCloseEditor(e); }));
            return _this;
        }
        TextFileEditor.prototype.onFilesChanged = function (e) {
            var deleted = e.getDeleted();
            if (deleted && deleted.length) {
                this.clearTextEditorViewState(deleted.map(function (d) { return d.resource; }));
            }
        };
        TextFileEditor.prototype.onWillCloseEditor = function (e) {
            if (e.editor === this.input && this.position === this.editorGroupService.getStacksModel().positionOfGroup(e.group)) {
                this.doSaveTextEditorViewState(this.input);
            }
        };
        TextFileEditor.prototype.getTitle = function () {
            return this.input ? this.input.getName() : nls.localize('textFileEditor', "Text File Editor");
        };
        Object.defineProperty(TextFileEditor.prototype, "input", {
            get: function () {
                return this._input;
            },
            enumerable: true,
            configurable: true
        });
        TextFileEditor.prototype.setInput = function (input, options) {
            var _this = this;
            // Return early for same input unless we force to open
            var forceOpen = options && options.forceOpen;
            if (!forceOpen && input.matches(this.input)) {
                // Still apply options if any (avoiding instanceof here for a reason, do not change!)
                if (options && types.isFunction(options.apply)) {
                    options.apply(this.getControl(), 0 /* Smooth */);
                }
                return winjs_base_1.TPromise.wrap(null);
            }
            // Remember view settings if input changes
            this.doSaveTextEditorViewState(this.input);
            // Set input and resolve
            return _super.prototype.setInput.call(this, input, options).then(function () {
                return input.resolve(true).then(function (resolvedModel) {
                    // There is a special case where the text editor has to handle binary file editor input: if a binary file
                    // has been resolved and cached before, it maybe an actual instance of BinaryEditorModel. In this case our text
                    // editor has to open this model using the binary editor. We return early in this case.
                    if (resolvedModel instanceof binaryEditorModel_1.BinaryEditorModel) {
                        return _this.openAsBinary(input, options);
                    }
                    // Check Model state
                    var textFileModel = resolvedModel;
                    var hasInput = !!_this.input;
                    var modelDisposed = textFileModel.isDisposed();
                    var inputChanged = hasInput && _this.input.getResource().toString() !== textFileModel.getResource().toString();
                    if (!hasInput || // editor got hidden meanwhile
                        modelDisposed || // input got disposed meanwhile
                        inputChanged // a different input was set meanwhile
                    ) {
                        return null;
                    }
                    // Editor
                    var textEditor = _this.getControl();
                    textEditor.setModel(textFileModel.textEditorModel);
                    // Always restore View State if any associated
                    var editorViewState = _this.loadTextEditorViewState(_this.input.getResource());
                    if (editorViewState) {
                        textEditor.restoreViewState(editorViewState);
                    }
                    // TextOptions (avoiding instanceof here for a reason, do not change!)
                    if (options && types.isFunction(options.apply)) {
                        options.apply(textEditor, 1 /* Immediate */);
                    }
                }, function (error) {
                    // In case we tried to open a file inside the text editor and the response
                    // indicates that this is not a text file, reopen the file through the binary
                    // editor.
                    if (error.fileOperationResult === files_2.FileOperationResult.FILE_IS_BINARY) {
                        return _this.openAsBinary(input, options);
                    }
                    // Similar, handle case where we were asked to open a folder in the text editor.
                    if (error.fileOperationResult === files_2.FileOperationResult.FILE_IS_DIRECTORY && _this.openAsFolder(input)) {
                        return;
                    }
                    // Offer to create a file from the error if we have a file not found and the name is valid
                    if (error.fileOperationResult === files_2.FileOperationResult.FILE_NOT_FOUND && paths.isValidBasename(paths.basename(input.getResource().fsPath))) {
                        return winjs_base_1.TPromise.wrapError(errors.create(errorMessage_1.toErrorMessage(error), {
                            actions: [
                                new actions_1.Action('workbench.files.action.createMissingFile', nls.localize('createFile', "Create File"), null, true, function () {
                                    return _this.fileService.updateContent(input.getResource(), '').then(function () {
                                        // Open
                                        return _this.editorService.openEditor({
                                            resource: input.getResource(),
                                            options: {
                                                pinned: true // new file gets pinned by default
                                            }
                                        });
                                    });
                                }),
                                message_1.CancelAction
                            ]
                        }));
                    }
                    // Otherwise make sure the error bubbles up
                    return winjs_base_1.TPromise.wrapError(error);
                });
            });
        };
        TextFileEditor.prototype.openAsBinary = function (input, options) {
            input.setForceOpenAsBinary();
            this.editorService.openEditor(input, options, this.position).done(null, errors.onUnexpectedError);
        };
        TextFileEditor.prototype.openAsFolder = function (input) {
            var _this = this;
            // Since we cannot open a folder, we have to restore the previous input if any and close the editor
            this.editorService.closeEditor(this.position, this.input).done(function () {
                // Best we can do is to reveal the folder in the explorer
                if (_this.contextService.isInsideWorkspace(input.getResource())) {
                    _this.viewletService.openViewlet(files_1.VIEWLET_ID, true).done(function (viewlet) {
                        return viewlet.getExplorerView().select(input.getResource(), true);
                    }, errors.onUnexpectedError);
                }
            }, errors.onUnexpectedError);
            return true; // in any case we handled it
        };
        TextFileEditor.prototype.getAriaLabel = function () {
            var input = this.input;
            var inputName = input && input.getName();
            var ariaLabel;
            if (inputName) {
                ariaLabel = nls.localize('fileEditorWithInputAriaLabel', "{0}. Text file editor.", inputName);
            }
            else {
                ariaLabel = nls.localize('fileEditorAriaLabel', "Text file editor.");
            }
            return ariaLabel;
        };
        TextFileEditor.prototype.clearInput = function () {
            // Keep editor view state in settings to restore when coming back
            this.doSaveTextEditorViewState(this.input);
            // Clear Model
            this.getControl().setModel(null);
            // Pass to super
            _super.prototype.clearInput.call(this);
        };
        TextFileEditor.prototype.shutdown = function () {
            // Save View State
            this.doSaveTextEditorViewState(this.input);
            // Call Super
            _super.prototype.shutdown.call(this);
        };
        TextFileEditor.prototype.doSaveTextEditorViewState = function (input) {
            if (input && !input.isDisposed()) {
                this.saveTextEditorViewState(input.getResource());
            }
        };
        TextFileEditor.ID = files_1.TEXT_FILE_EDITOR_ID;
        TextFileEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, files_2.IFileService),
            __param(2, viewlet_1.IViewletService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, workspace_1.IWorkspaceContextService),
            __param(5, storage_1.IStorageService),
            __param(6, resourceConfiguration_1.ITextResourceConfigurationService),
            __param(7, editorService_1.IWorkbenchEditorService),
            __param(8, themeService_1.IThemeService),
            __param(9, groupService_1.IEditorGroupService),
            __param(10, textfiles_1.ITextFileService)
        ], TextFileEditor);
        return TextFileEditor;
    }(textEditor_1.BaseTextEditor));
    exports.TextFileEditor = TextFileEditor;
});
