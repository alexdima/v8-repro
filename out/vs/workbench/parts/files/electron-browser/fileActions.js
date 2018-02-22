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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/platform", "vs/base/common/async", "vs/base/common/paths", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/strings", "vs/base/common/severity", "vs/base/common/diagnostics", "vs/base/common/actions", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/lifecycle", "vs/workbench/parts/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/workbench/parts/files/common/explorerModel", "vs/workbench/services/untitled/common/untitledEditorService", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/viewlet", "vs/workbench/services/group/common/groupService", "vs/platform/quickOpen/common/quickOpen", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/workbench/services/backup/common/backup", "vs/platform/windows/common/windows", "vs/workbench/parts/files/electron-browser/fileCommands", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/platform/clipboard/common/clipboardService", "vs/editor/common/services/modeService", "vs/editor/common/services/modelService", "vs/platform/commands/common/commands", "vs/platform/list/browser/listService", "vs/platform/contextkey/common/contextkey", "vs/base/common/resources", "vs/base/common/network", "vs/css!./media/fileactions"], function (require, exports, winjs_base_1, nls, platform_1, async_1, paths, resources, uri_1, errors, errorMessage_1, strings, severity_1, diagnostics, actions_1, inputBox_1, lifecycle_1, files_1, textfiles_1, files_2, editor_1, explorerModel_1, untitledEditorService_1, editorService_1, viewlet_1, groupService_1, quickOpen_1, viewlet_2, instantiation_1, message_1, backup_1, windows_1, fileCommands_1, resolverService_1, configuration_1, event_1, clipboardService_1, modeService_1, modelService_1, commands_1, listService_1, contextkey_1, resources_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NEW_FILE_COMMAND_ID = 'explorer.newFile';
    exports.NEW_FILE_LABEL = nls.localize('newFile', "New File");
    exports.NEW_FOLDER_COMMAND_ID = 'explorer.newFolder';
    exports.NEW_FOLDER_LABEL = nls.localize('newFolder', "New Folder");
    exports.TRIGGER_RENAME_LABEL = nls.localize('rename', "Rename");
    exports.MOVE_FILE_TO_TRASH_LABEL = nls.localize('delete', "Delete");
    exports.COPY_FILE_LABEL = nls.localize('copyFile', "Copy");
    exports.PASTE_FILE_LABEL = nls.localize('pasteFile', "Paste");
    exports.FileCopiedContext = new contextkey_1.RawContextKey('fileCopied', false);
    var BaseErrorReportingAction = /** @class */ (function (_super) {
        __extends(BaseErrorReportingAction, _super);
        function BaseErrorReportingAction(id, label, _messageService) {
            var _this = _super.call(this, id, label) || this;
            _this._messageService = _messageService;
            return _this;
        }
        Object.defineProperty(BaseErrorReportingAction.prototype, "messageService", {
            get: function () {
                return this._messageService;
            },
            enumerable: true,
            configurable: true
        });
        BaseErrorReportingAction.prototype.onError = function (error) {
            if (error.message === 'string') {
                error = error.message;
            }
            this._messageService.show(message_1.Severity.Error, errorMessage_1.toErrorMessage(error, false));
        };
        BaseErrorReportingAction.prototype.onErrorWithRetry = function (error, retry, extraAction) {
            var actions = [
                new actions_1.Action(this.id, nls.localize('retry', "Retry"), null, true, function () { return retry(); }),
                message_1.CancelAction
            ];
            if (extraAction) {
                actions.unshift(extraAction);
            }
            var errorWithRetry = {
                actions: actions,
                message: errorMessage_1.toErrorMessage(error, false)
            };
            this._messageService.show(message_1.Severity.Error, errorWithRetry);
        };
        return BaseErrorReportingAction;
    }(actions_1.Action));
    exports.BaseErrorReportingAction = BaseErrorReportingAction;
    var BaseFileAction = /** @class */ (function (_super) {
        __extends(BaseFileAction, _super);
        function BaseFileAction(id, label, fileService, _messageService, textFileService) {
            var _this = _super.call(this, id, label, _messageService) || this;
            _this.fileService = fileService;
            _this.textFileService = textFileService;
            _this.enabled = false;
            return _this;
        }
        BaseFileAction.prototype._isEnabled = function () {
            return true;
        };
        BaseFileAction.prototype._updateEnablement = function () {
            this.enabled = !!(this.fileService && this._isEnabled());
        };
        BaseFileAction = __decorate([
            __param(2, files_2.IFileService),
            __param(3, message_1.IMessageService),
            __param(4, textfiles_1.ITextFileService)
        ], BaseFileAction);
        return BaseFileAction;
    }(BaseErrorReportingAction));
    exports.BaseFileAction = BaseFileAction;
    var TriggerRenameFileAction = /** @class */ (function (_super) {
        __extends(TriggerRenameFileAction, _super);
        function TriggerRenameFileAction(tree, element, fileService, messageService, textFileService, instantiationService) {
            var _this = _super.call(this, TriggerRenameFileAction.ID, exports.TRIGGER_RENAME_LABEL, fileService, messageService, textFileService) || this;
            _this.tree = tree;
            _this.element = element;
            _this.renameAction = instantiationService.createInstance(RenameFileAction, element);
            _this._updateEnablement();
            return _this;
        }
        TriggerRenameFileAction.prototype.validateFileName = function (parent, name) {
            return this.renameAction.validateFileName(this.element.parent, name);
        };
        TriggerRenameFileAction.prototype.run = function (context) {
            var _this = this;
            if (!context) {
                return winjs_base_1.TPromise.wrapError(new Error('No context provided to BaseEnableFileRenameAction.'));
            }
            var viewletState = context.viewletState;
            if (!viewletState) {
                return winjs_base_1.TPromise.wrapError(new Error('Invalid viewlet state provided to BaseEnableFileRenameAction.'));
            }
            var stat = context.stat;
            if (!stat) {
                return winjs_base_1.TPromise.wrapError(new Error('Invalid stat provided to BaseEnableFileRenameAction.'));
            }
            viewletState.setEditable(stat, {
                action: this.renameAction,
                validator: function (value) {
                    var message = _this.validateFileName(_this.element.parent, value);
                    if (!message) {
                        return null;
                    }
                    return {
                        content: message,
                        formatContent: true,
                        type: inputBox_1.MessageType.ERROR
                    };
                }
            });
            this.tree.refresh(stat, false).then(function () {
                _this.tree.setHighlight(stat);
                var unbind = _this.tree.onDidChangeHighlight(function (e) {
                    if (!e.highlight) {
                        viewletState.clearEditable(stat);
                        _this.tree.refresh(stat).done(null, errors.onUnexpectedError);
                        unbind.dispose();
                    }
                });
            }).done(null, errors.onUnexpectedError);
            return void 0;
        };
        TriggerRenameFileAction.ID = 'renameFile';
        TriggerRenameFileAction = __decorate([
            __param(2, files_2.IFileService),
            __param(3, message_1.IMessageService),
            __param(4, textfiles_1.ITextFileService),
            __param(5, instantiation_1.IInstantiationService)
        ], TriggerRenameFileAction);
        return TriggerRenameFileAction;
    }(BaseFileAction));
    var BaseRenameAction = /** @class */ (function (_super) {
        __extends(BaseRenameAction, _super);
        function BaseRenameAction(id, label, element, fileService, messageService, textFileService) {
            var _this = _super.call(this, id, label, fileService, messageService, textFileService) || this;
            _this.element = element;
            return _this;
        }
        BaseRenameAction.prototype.run = function (context) {
            var _this = this;
            if (!context) {
                return winjs_base_1.TPromise.wrapError(new Error('No context provided to BaseRenameFileAction.'));
            }
            var name = context.value;
            if (!name) {
                return winjs_base_1.TPromise.wrapError(new Error('No new name provided to BaseRenameFileAction.'));
            }
            // Automatically trim whitespaces and trailing dots to produce nice file names
            name = getWellFormedFileName(name);
            var existingName = getWellFormedFileName(this.element.name);
            // Return early if name is invalid or didn't change
            if (name === existingName || this.validateFileName(this.element.parent, name)) {
                return winjs_base_1.TPromise.as(null);
            }
            // Call function and Emit Event through viewer
            var promise = this.runAction(name).then(null, function (error) {
                _this.onError(error);
            });
            return promise;
        };
        BaseRenameAction.prototype.validateFileName = function (parent, name) {
            var source = this.element.name;
            var target = name;
            if (!platform_1.isLinux) {
                source = source.toLowerCase();
                target = target.toLowerCase();
            }
            if (getWellFormedFileName(source) === getWellFormedFileName(target)) {
                return null;
            }
            return validateFileName(parent, name, false);
        };
        BaseRenameAction = __decorate([
            __param(3, files_2.IFileService),
            __param(4, message_1.IMessageService),
            __param(5, textfiles_1.ITextFileService)
        ], BaseRenameAction);
        return BaseRenameAction;
    }(BaseFileAction));
    exports.BaseRenameAction = BaseRenameAction;
    var RenameFileAction = /** @class */ (function (_super) {
        __extends(RenameFileAction, _super);
        function RenameFileAction(element, fileService, messageService, textFileService, backupFileService) {
            var _this = _super.call(this, RenameFileAction.ID, nls.localize('rename', "Rename"), element, fileService, messageService, textFileService) || this;
            _this.backupFileService = backupFileService;
            _this._updateEnablement();
            return _this;
        }
        RenameFileAction.prototype.runAction = function (newName) {
            var _this = this;
            var dirty = this.textFileService.getDirty().filter(function (d) { return resources.isEqualOrParent(d, _this.element.resource, !platform_1.isLinux /* ignorecase */); });
            var dirtyRenamed = [];
            return winjs_base_1.TPromise.join(dirty.map(function (d) {
                var renamed;
                // If the dirty file itself got moved, just reparent it to the target folder
                var targetPath = paths.join(_this.element.parent.resource.path, newName);
                if (_this.element.resource.toString() === d.toString()) {
                    renamed = _this.element.parent.resource.with({ path: targetPath });
                }
                else {
                    renamed = _this.element.parent.resource.with({ path: paths.join(targetPath, d.path.substr(_this.element.resource.path.length + 1)) });
                }
                dirtyRenamed.push(renamed);
                var model = _this.textFileService.models.get(d);
                return _this.backupFileService.backupResource(renamed, model.createSnapshot(), model.getVersionId());
            }))
                .then(function () { return _this.textFileService.revertAll(dirty, { soft: true /* do not attempt to load content from disk */ }); })
                .then(function () { return _this.fileService.rename(_this.element.resource, newName).then(null, function (error) {
                return winjs_base_1.TPromise.join(dirtyRenamed.map(function (d) { return _this.backupFileService.discardResourceBackup(d); })).then(function () {
                    _this.onErrorWithRetry(error, function () { return _this.runAction(newName); });
                });
            }); })
                .then(function () {
                return winjs_base_1.TPromise.join(dirtyRenamed.map(function (t) { return _this.textFileService.models.loadOrCreate(t); }));
            });
        };
        RenameFileAction.ID = 'workbench.files.action.renameFile';
        RenameFileAction = __decorate([
            __param(1, files_2.IFileService),
            __param(2, message_1.IMessageService),
            __param(3, textfiles_1.ITextFileService),
            __param(4, backup_1.IBackupFileService)
        ], RenameFileAction);
        return RenameFileAction;
    }(BaseRenameAction));
    /* Base New File/Folder Action */
    var BaseNewAction = /** @class */ (function (_super) {
        __extends(BaseNewAction, _super);
        function BaseNewAction(id, label, tree, isFile, editableAction, element, fileService, messageService, textFileService) {
            var _this = _super.call(this, id, label, fileService, messageService, textFileService) || this;
            if (element) {
                _this.presetFolder = element.isDirectory ? element : element.parent;
            }
            _this.tree = tree;
            _this.isFile = isFile;
            _this.renameAction = editableAction;
            return _this;
        }
        BaseNewAction.prototype.run = function (context) {
            var _this = this;
            if (!context) {
                return winjs_base_1.TPromise.wrapError(new Error('No context provided to BaseNewAction.'));
            }
            var viewletState = context.viewletState;
            if (!viewletState) {
                return winjs_base_1.TPromise.wrapError(new Error('Invalid viewlet state provided to BaseNewAction.'));
            }
            var folder = this.presetFolder;
            if (!folder) {
                var focus_1 = this.tree.getFocus();
                if (focus_1) {
                    folder = focus_1.isDirectory ? focus_1 : focus_1.parent;
                }
                else {
                    var input = this.tree.getInput();
                    folder = input instanceof explorerModel_1.Model ? input.roots[0] : input;
                }
            }
            if (!folder) {
                return winjs_base_1.TPromise.wrapError(new Error('Invalid parent folder to create.'));
            }
            return this.tree.reveal(folder, 0.5).then(function () {
                return _this.tree.expand(folder).then(function () {
                    var stat = explorerModel_1.NewStatPlaceholder.addNewStatPlaceholder(folder, !_this.isFile);
                    _this.renameAction.element = stat;
                    viewletState.setEditable(stat, {
                        action: _this.renameAction,
                        validator: function (value) {
                            var message = _this.renameAction.validateFileName(folder, value);
                            if (!message) {
                                return null;
                            }
                            return {
                                content: message,
                                formatContent: true,
                                type: inputBox_1.MessageType.ERROR
                            };
                        }
                    });
                    return _this.tree.refresh(folder).then(function () {
                        return _this.tree.expand(folder).then(function () {
                            return _this.tree.reveal(stat, 0.5).then(function () {
                                _this.tree.setHighlight(stat);
                                var unbind = _this.tree.onDidChangeHighlight(function (e) {
                                    if (!e.highlight) {
                                        stat.destroy();
                                        _this.tree.refresh(folder).done(null, errors.onUnexpectedError);
                                        unbind.dispose();
                                    }
                                });
                            });
                        });
                    });
                });
            });
        };
        BaseNewAction = __decorate([
            __param(6, files_2.IFileService),
            __param(7, message_1.IMessageService),
            __param(8, textfiles_1.ITextFileService)
        ], BaseNewAction);
        return BaseNewAction;
    }(BaseFileAction));
    exports.BaseNewAction = BaseNewAction;
    /* New File */
    var NewFileAction = /** @class */ (function (_super) {
        __extends(NewFileAction, _super);
        function NewFileAction(tree, element, fileService, messageService, textFileService, instantiationService) {
            var _this = _super.call(this, 'explorer.newFile', exports.NEW_FILE_LABEL, tree, true, instantiationService.createInstance(CreateFileAction, element), null, fileService, messageService, textFileService) || this;
            _this.class = 'explorer-action new-file';
            _this._updateEnablement();
            return _this;
        }
        NewFileAction = __decorate([
            __param(2, files_2.IFileService),
            __param(3, message_1.IMessageService),
            __param(4, textfiles_1.ITextFileService),
            __param(5, instantiation_1.IInstantiationService)
        ], NewFileAction);
        return NewFileAction;
    }(BaseNewAction));
    exports.NewFileAction = NewFileAction;
    /* New Folder */
    var NewFolderAction = /** @class */ (function (_super) {
        __extends(NewFolderAction, _super);
        function NewFolderAction(tree, element, fileService, messageService, textFileService, instantiationService) {
            var _this = _super.call(this, 'explorer.newFolder', exports.NEW_FOLDER_LABEL, tree, false, instantiationService.createInstance(CreateFolderAction, element), null, fileService, messageService, textFileService) || this;
            _this.class = 'explorer-action new-folder';
            _this._updateEnablement();
            return _this;
        }
        NewFolderAction = __decorate([
            __param(2, files_2.IFileService),
            __param(3, message_1.IMessageService),
            __param(4, textfiles_1.ITextFileService),
            __param(5, instantiation_1.IInstantiationService)
        ], NewFolderAction);
        return NewFolderAction;
    }(BaseNewAction));
    exports.NewFolderAction = NewFolderAction;
    /* Create new file from anywhere: Open untitled */
    var GlobalNewUntitledFileAction = /** @class */ (function (_super) {
        __extends(GlobalNewUntitledFileAction, _super);
        function GlobalNewUntitledFileAction(id, label, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            return _this;
        }
        GlobalNewUntitledFileAction.prototype.run = function () {
            return this.editorService.openEditor({ options: { pinned: true } }); // untitled are always pinned
        };
        GlobalNewUntitledFileAction.ID = 'workbench.action.files.newUntitledFile';
        GlobalNewUntitledFileAction.LABEL = nls.localize('newUntitledFile', "New Untitled File");
        GlobalNewUntitledFileAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService)
        ], GlobalNewUntitledFileAction);
        return GlobalNewUntitledFileAction;
    }(actions_1.Action));
    exports.GlobalNewUntitledFileAction = GlobalNewUntitledFileAction;
    /* Create New File/Folder (only used internally by explorerViewer) */
    var BaseCreateAction = /** @class */ (function (_super) {
        __extends(BaseCreateAction, _super);
        function BaseCreateAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BaseCreateAction.prototype.validateFileName = function (parent, name) {
            if (this.element instanceof explorerModel_1.NewStatPlaceholder) {
                return validateFileName(parent, name, false);
            }
            return _super.prototype.validateFileName.call(this, parent, name);
        };
        return BaseCreateAction;
    }(BaseRenameAction));
    exports.BaseCreateAction = BaseCreateAction;
    /* Create New File (only used internally by explorerViewer) */
    var CreateFileAction = /** @class */ (function (_super) {
        __extends(CreateFileAction, _super);
        function CreateFileAction(element, fileService, editorService, messageService, textFileService) {
            var _this = _super.call(this, CreateFileAction.ID, CreateFileAction.LABEL, element, fileService, messageService, textFileService) || this;
            _this.editorService = editorService;
            _this._updateEnablement();
            return _this;
        }
        CreateFileAction.prototype.runAction = function (fileName) {
            var _this = this;
            var resource = this.element.parent.resource;
            return this.fileService.createFile(resource.with({ path: paths.join(resource.path, fileName) })).then(function (stat) {
                return _this.editorService.openEditor({ resource: stat.resource, options: { pinned: true } });
            }, function (error) {
                _this.onErrorWithRetry(error, function () { return _this.runAction(fileName); });
            });
        };
        CreateFileAction.ID = 'workbench.files.action.createFileFromExplorer';
        CreateFileAction.LABEL = nls.localize('createNewFile', "New File");
        CreateFileAction = __decorate([
            __param(1, files_2.IFileService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, message_1.IMessageService),
            __param(4, textfiles_1.ITextFileService)
        ], CreateFileAction);
        return CreateFileAction;
    }(BaseCreateAction));
    /* Create New Folder (only used internally by explorerViewer) */
    var CreateFolderAction = /** @class */ (function (_super) {
        __extends(CreateFolderAction, _super);
        function CreateFolderAction(element, fileService, messageService, textFileService) {
            var _this = _super.call(this, CreateFolderAction.ID, CreateFolderAction.LABEL, null, fileService, messageService, textFileService) || this;
            _this._updateEnablement();
            return _this;
        }
        CreateFolderAction.prototype.runAction = function (fileName) {
            var _this = this;
            var resource = this.element.parent.resource;
            return this.fileService.createFolder(resource.with({ path: paths.join(resource.path, fileName) })).then(null, function (error) {
                _this.onErrorWithRetry(error, function () { return _this.runAction(fileName); });
            });
        };
        CreateFolderAction.ID = 'workbench.files.action.createFolderFromExplorer';
        CreateFolderAction.LABEL = nls.localize('createNewFolder', "New Folder");
        CreateFolderAction = __decorate([
            __param(1, files_2.IFileService),
            __param(2, message_1.IMessageService),
            __param(3, textfiles_1.ITextFileService)
        ], CreateFolderAction);
        return CreateFolderAction;
    }(BaseCreateAction));
    var BaseDeleteFileAction = /** @class */ (function (_super) {
        __extends(BaseDeleteFileAction, _super);
        function BaseDeleteFileAction(tree, elements, useTrash, fileService, messageService, textFileService, configurationService) {
            var _this = _super.call(this, 'moveFileToTrash', exports.MOVE_FILE_TO_TRASH_LABEL, fileService, messageService, textFileService) || this;
            _this.tree = tree;
            _this.elements = elements;
            _this.useTrash = useTrash;
            _this.configurationService = configurationService;
            _this.tree = tree;
            _this.useTrash = useTrash && elements.every(function (e) { return !paths.isUNC(e.resource.fsPath); }); // on UNC shares there is no trash
            _this._updateEnablement();
            return _this;
        }
        BaseDeleteFileAction.prototype.run = function () {
            var _this = this;
            // Remove highlight
            if (this.tree) {
                this.tree.clearHighlight();
            }
            var primaryButton;
            if (this.useTrash) {
                primaryButton = platform_1.isWindows ? nls.localize('deleteButtonLabelRecycleBin', "&&Move to Recycle Bin") : nls.localize({ key: 'deleteButtonLabelTrash', comment: ['&& denotes a mnemonic'] }, "&&Move to Trash");
            }
            else {
                primaryButton = nls.localize({ key: 'deleteButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Delete");
            }
            var distinctElements = resources_1.distinctParents(this.elements, function (e) { return e.resource; });
            // Handle dirty
            var confirmDirtyPromise = winjs_base_1.TPromise.as(true);
            var dirty = this.textFileService.getDirty().filter(function (d) { return distinctElements.some(function (e) { return resources.isEqualOrParent(d, e.resource, !platform_1.isLinux /* ignorecase */); }); });
            if (dirty.length) {
                var message = void 0;
                if (distinctElements.length > 1) {
                    message = nls.localize('dirtyMessageFilesDelete', "You are deleting files with unsaved changes. Do you want to continue?");
                }
                else if (distinctElements[0].isDirectory) {
                    if (dirty.length === 1) {
                        message = nls.localize('dirtyMessageFolderOneDelete', "You are deleting a folder with unsaved changes in 1 file. Do you want to continue?");
                    }
                    else {
                        message = nls.localize('dirtyMessageFolderDelete', "You are deleting a folder with unsaved changes in {0} files. Do you want to continue?", dirty.length);
                    }
                }
                else {
                    message = nls.localize('dirtyMessageFileDelete', "You are deleting a file with unsaved changes. Do you want to continue?");
                }
                confirmDirtyPromise = this.messageService.confirm({
                    message: message,
                    type: 'warning',
                    detail: nls.localize('dirtyWarning', "Your changes will be lost if you don't save them."),
                    primaryButton: primaryButton
                }).then(function (confirmed) {
                    if (!confirmed) {
                        return false;
                    }
                    _this.skipConfirm = true; // since we already asked for confirmation
                    return _this.textFileService.revertAll(dirty).then(function () { return true; });
                });
            }
            // Check if file is dirty in editor and save it to avoid data loss
            return confirmDirtyPromise.then(function (confirmed) {
                if (!confirmed) {
                    return null;
                }
                var confirmDeletePromise;
                // Check if we need to ask for confirmation at all
                if (_this.skipConfirm || (_this.useTrash && _this.configurationService.getValue(BaseDeleteFileAction.CONFIRM_DELETE_SETTING_KEY) === false)) {
                    confirmDeletePromise = winjs_base_1.TPromise.as({ confirmed: true });
                }
                else if (_this.useTrash) {
                    var message = distinctElements.length > 1 ? message_1.getConfirmMessage(nls.localize('confirmMoveTrashMessageMultiple', "Are you sure you want to delete the following {0} files?", distinctElements.length), distinctElements.map(function (e) { return e.resource; }))
                        : distinctElements[0].isDirectory ? nls.localize('confirmMoveTrashMessageFolder', "Are you sure you want to delete '{0}' and its contents?", distinctElements[0].name)
                            : nls.localize('confirmMoveTrashMessageFile', "Are you sure you want to delete '{0}'?", distinctElements[0].name);
                    confirmDeletePromise = _this.messageService.confirmWithCheckbox({
                        message: message,
                        detail: platform_1.isWindows ? nls.localize('undoBin', "You can restore from the recycle bin.") : nls.localize('undoTrash', "You can restore from the trash."),
                        primaryButton: primaryButton,
                        checkbox: {
                            label: nls.localize('doNotAskAgain', "Do not ask me again")
                        },
                        type: 'question'
                    });
                }
                else {
                    var message = distinctElements.length > 1 ? message_1.getConfirmMessage(nls.localize('confirmDeleteMessageMultiple', "Are you sure you want to permanently delete the following {0} files?", distinctElements.length), distinctElements.map(function (e) { return e.resource; }))
                        : distinctElements[0].isDirectory ? nls.localize('confirmDeleteMessageFolder', "Are you sure you want to permanently delete '{0}' and its contents?", distinctElements[0].name)
                            : nls.localize('confirmDeleteMessageFile', "Are you sure you want to permanently delete '{0}'?", distinctElements[0].name);
                    confirmDeletePromise = _this.messageService.confirmWithCheckbox({
                        message: message,
                        detail: nls.localize('irreversible', "This action is irreversible!"),
                        primaryButton: primaryButton,
                        type: 'warning'
                    });
                }
                return confirmDeletePromise.then(function (confirmation) {
                    // Check for confirmation checkbox
                    var updateConfirmSettingsPromise = winjs_base_1.TPromise.as(void 0);
                    if (confirmation.confirmed && confirmation.checkboxChecked === true) {
                        updateConfirmSettingsPromise = _this.configurationService.updateValue(BaseDeleteFileAction.CONFIRM_DELETE_SETTING_KEY, false, configuration_1.ConfigurationTarget.USER);
                    }
                    return updateConfirmSettingsPromise.then(function () {
                        // Check for confirmation
                        if (!confirmation.confirmed) {
                            return winjs_base_1.TPromise.as(null);
                        }
                        // Call function
                        var servicePromise = winjs_base_1.TPromise.join(distinctElements.map(function (e) { return _this.fileService.del(e.resource, _this.useTrash); })).then(function () {
                            if (distinctElements[0].parent) {
                                _this.tree.setFocus(distinctElements[0].parent); // move focus to parent
                            }
                        }, function (error) {
                            // Allow to retry
                            var extraAction;
                            if (_this.useTrash) {
                                extraAction = new actions_1.Action('permanentDelete', nls.localize('permDelete', "Delete Permanently"), null, true, function () { _this.useTrash = false; _this.skipConfirm = true; return _this.run(); });
                            }
                            _this.onErrorWithRetry(error, function () { return _this.run(); }, extraAction);
                            // Focus back to tree
                            _this.tree.DOMFocus();
                        });
                        return servicePromise;
                    });
                });
            });
        };
        BaseDeleteFileAction.CONFIRM_DELETE_SETTING_KEY = 'explorer.confirmDelete';
        BaseDeleteFileAction = __decorate([
            __param(3, files_2.IFileService),
            __param(4, message_1.IMessageService),
            __param(5, textfiles_1.ITextFileService),
            __param(6, configuration_1.IConfigurationService)
        ], BaseDeleteFileAction);
        return BaseDeleteFileAction;
    }(BaseFileAction));
    /* Import File */
    var ImportFileAction = /** @class */ (function (_super) {
        __extends(ImportFileAction, _super);
        function ImportFileAction(tree, element, clazz, fileService, editorService, messageService, textFileService) {
            var _this = _super.call(this, 'workbench.files.action.importFile', nls.localize('importFiles', "Import Files"), fileService, messageService, textFileService) || this;
            _this.editorService = editorService;
            _this.tree = tree;
            _this.element = element;
            if (clazz) {
                _this.class = clazz;
            }
            _this._updateEnablement();
            return _this;
        }
        ImportFileAction.prototype.run = function (resources) {
            var _this = this;
            var importPromise = winjs_base_1.TPromise.as(null).then(function () {
                if (resources && resources.length > 0) {
                    // Find parent for import
                    var targetElement_1;
                    if (_this.element) {
                        targetElement_1 = _this.element;
                    }
                    else {
                        var input = _this.tree.getInput();
                        targetElement_1 = _this.tree.getFocus() || (input instanceof explorerModel_1.Model ? input.roots[0] : input);
                    }
                    if (!targetElement_1.isDirectory) {
                        targetElement_1 = targetElement_1.parent;
                    }
                    // Resolve target to check for name collisions and ask user
                    return _this.fileService.resolveFile(targetElement_1.resource).then(function (targetStat) {
                        // Check for name collisions
                        var targetNames = {};
                        targetStat.children.forEach(function (child) {
                            targetNames[platform_1.isLinux ? child.name : child.name.toLowerCase()] = child;
                        });
                        var overwritePromise = winjs_base_1.TPromise.as(true);
                        if (resources.some(function (resource) {
                            return !!targetNames[platform_1.isLinux ? paths.basename(resource.fsPath) : paths.basename(resource.fsPath).toLowerCase()];
                        })) {
                            var confirm_1 = {
                                message: nls.localize('confirmOverwrite', "A file or folder with the same name already exists in the destination folder. Do you want to replace it?"),
                                detail: nls.localize('irreversible', "This action is irreversible!"),
                                primaryButton: nls.localize({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
                                type: 'warning'
                            };
                            overwritePromise = _this.messageService.confirm(confirm_1);
                        }
                        return overwritePromise.then(function (overwrite) {
                            if (!overwrite) {
                                return void 0;
                            }
                            // Run import in sequence
                            var importPromisesFactory = [];
                            resources.forEach(function (resource) {
                                importPromisesFactory.push(function () {
                                    var sourceFile = resource;
                                    var targetFile = targetElement_1.resource.with({ path: paths.join(targetElement_1.resource.path, paths.basename(sourceFile.path)) });
                                    // if the target exists and is dirty, make sure to revert it. otherwise the dirty contents
                                    // of the target file would replace the contents of the imported file. since we already
                                    // confirmed the overwrite before, this is OK.
                                    var revertPromise = winjs_base_1.TPromise.wrap(null);
                                    if (_this.textFileService.isDirty(targetFile)) {
                                        revertPromise = _this.textFileService.revertAll([targetFile], { soft: true });
                                    }
                                    return revertPromise.then(function () {
                                        return _this.fileService.importFile(sourceFile, targetElement_1.resource).then(function (res) {
                                            // if we only import one file, just open it directly
                                            if (resources.length === 1) {
                                                _this.editorService.openEditor({ resource: res.stat.resource, options: { pinned: true } }).done(null, errors.onUnexpectedError);
                                            }
                                        }, function (error) { return _this.onError(error); });
                                    });
                                });
                            });
                            return async_1.sequence(importPromisesFactory);
                        });
                    });
                }
                return void 0;
            });
            return importPromise.then(function () {
                _this.tree.clearHighlight();
            }, function (error) {
                _this.onError(error);
                _this.tree.clearHighlight();
            });
        };
        ImportFileAction = __decorate([
            __param(3, files_2.IFileService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, message_1.IMessageService),
            __param(6, textfiles_1.ITextFileService)
        ], ImportFileAction);
        return ImportFileAction;
    }(BaseFileAction));
    exports.ImportFileAction = ImportFileAction;
    // Copy File/Folder
    var CopyFileAction = /** @class */ (function (_super) {
        __extends(CopyFileAction, _super);
        function CopyFileAction(tree, elements, fileService, messageService, textFileService, contextKeyService, clipboardService) {
            var _this = _super.call(this, 'filesExplorer.copy', exports.COPY_FILE_LABEL, fileService, messageService, textFileService) || this;
            _this.elements = elements;
            _this.clipboardService = clipboardService;
            _this.tree = tree;
            _this._updateEnablement();
            return _this;
        }
        CopyFileAction.prototype.run = function () {
            // Write to clipboard as file/folder to copy
            this.clipboardService.writeFiles(this.elements.map(function (e) { return e.resource; }));
            // Remove highlight
            if (this.tree) {
                this.tree.clearHighlight();
            }
            this.tree.DOMFocus();
            return winjs_base_1.TPromise.as(null);
        };
        CopyFileAction = __decorate([
            __param(2, files_2.IFileService),
            __param(3, message_1.IMessageService),
            __param(4, textfiles_1.ITextFileService),
            __param(5, contextkey_1.IContextKeyService),
            __param(6, clipboardService_1.IClipboardService)
        ], CopyFileAction);
        return CopyFileAction;
    }(BaseFileAction));
    // Paste File/Folder
    var PasteFileAction = /** @class */ (function (_super) {
        __extends(PasteFileAction, _super);
        function PasteFileAction(tree, element, fileService, messageService, textFileService, editorService) {
            var _this = _super.call(this, PasteFileAction.ID, exports.PASTE_FILE_LABEL, fileService, messageService, textFileService) || this;
            _this.editorService = editorService;
            _this.tree = tree;
            _this.element = element;
            if (!_this.element) {
                var input = _this.tree.getInput();
                _this.element = input instanceof explorerModel_1.Model ? input.roots[0] : input;
            }
            _this._updateEnablement();
            return _this;
        }
        PasteFileAction.prototype.run = function (fileToPaste) {
            var _this = this;
            // Check if target is ancestor of pasted folder
            if (this.element.resource.toString() !== fileToPaste.toString() && resources.isEqualOrParent(this.element.resource, fileToPaste, !platform_1.isLinux /* ignorecase */)) {
                throw new Error(nls.localize('fileIsAncestor', "File to paste is an ancestor of the destination folder"));
            }
            return this.fileService.resolveFile(fileToPaste).then(function (fileToPasteStat) {
                // Remove highlight
                if (_this.tree) {
                    _this.tree.clearHighlight();
                }
                // Find target
                var target;
                if (_this.element.resource.toString() === fileToPaste.toString()) {
                    target = _this.element.parent;
                }
                else {
                    target = _this.element.isDirectory ? _this.element : _this.element.parent;
                }
                var targetFile = findValidPasteFileTarget(target, { resource: fileToPaste, isDirectory: fileToPasteStat.isDirectory });
                // Copy File
                return _this.fileService.copyFile(fileToPaste, targetFile).then(function (stat) {
                    if (!stat.isDirectory) {
                        return _this.editorService.openEditor({ resource: stat.resource, options: { pinned: true } });
                    }
                    return void 0;
                }, function (error) { return _this.onError(error); }).then(function () {
                    _this.tree.DOMFocus();
                });
            }, function (error) {
                _this.onError(new Error(nls.localize('fileDeleted', "File to paste was deleted or moved meanwhile")));
            });
        };
        PasteFileAction.ID = 'filesExplorer.paste';
        PasteFileAction = __decorate([
            __param(2, files_2.IFileService),
            __param(3, message_1.IMessageService),
            __param(4, textfiles_1.ITextFileService),
            __param(5, editorService_1.IWorkbenchEditorService)
        ], PasteFileAction);
        return PasteFileAction;
    }(BaseFileAction));
    // Duplicate File/Folder
    var DuplicateFileAction = /** @class */ (function (_super) {
        __extends(DuplicateFileAction, _super);
        function DuplicateFileAction(tree, fileToDuplicate, target, fileService, editorService, messageService, textFileService) {
            var _this = _super.call(this, 'workbench.files.action.duplicateFile', nls.localize('duplicateFile', "Duplicate"), fileService, messageService, textFileService) || this;
            _this.editorService = editorService;
            _this.tree = tree;
            _this.element = fileToDuplicate;
            _this.target = (target && target.isDirectory) ? target : fileToDuplicate.parent;
            _this._updateEnablement();
            return _this;
        }
        DuplicateFileAction.prototype.run = function () {
            var _this = this;
            // Remove highlight
            if (this.tree) {
                this.tree.clearHighlight();
            }
            // Copy File
            var result = this.fileService.copyFile(this.element.resource, findValidPasteFileTarget(this.target, { resource: this.element.resource, isDirectory: this.element.isDirectory })).then(function (stat) {
                if (!stat.isDirectory) {
                    return _this.editorService.openEditor({ resource: stat.resource, options: { pinned: true } });
                }
                return void 0;
            }, function (error) { return _this.onError(error); });
            return result;
        };
        DuplicateFileAction = __decorate([
            __param(3, files_2.IFileService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, message_1.IMessageService),
            __param(6, textfiles_1.ITextFileService)
        ], DuplicateFileAction);
        return DuplicateFileAction;
    }(BaseFileAction));
    exports.DuplicateFileAction = DuplicateFileAction;
    function findValidPasteFileTarget(targetFolder, fileToPaste) {
        var name = resources_1.basenameOrAuthority(fileToPaste.resource);
        var candidate = targetFolder.resource.with({ path: paths.join(targetFolder.resource.path, name) });
        while (true) {
            if (!targetFolder.root.find(candidate)) {
                break;
            }
            name = incrementFileName(name, fileToPaste.isDirectory);
            candidate = targetFolder.resource.with({ path: paths.join(targetFolder.resource.path, name) });
        }
        return candidate;
    }
    function incrementFileName(name, isFolder) {
        // file.1.txt=>file.2.txt
        if (!isFolder && name.match(/(.*\.)(\d+)(\..*)$/)) {
            return name.replace(/(.*\.)(\d+)(\..*)$/, function (match, g1, g2, g3) { return g1 + (parseInt(g2) + 1) + g3; });
        }
        // file.txt=>file.1.txt
        var lastIndexOfDot = name.lastIndexOf('.');
        if (!isFolder && lastIndexOfDot >= 0) {
            return strings.format('{0}.1{1}', name.substr(0, lastIndexOfDot), name.substr(lastIndexOfDot));
        }
        // folder.1=>folder.2
        if (isFolder && name.match(/(\d+)$/)) {
            return name.replace(/(\d+)$/, function (match) {
                var groups = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    groups[_i - 1] = arguments[_i];
                }
                return String(parseInt(groups[0]) + 1);
            });
        }
        // file/folder=>file.1/folder.1
        return strings.format('{0}.1', name);
    }
    // Global Compare with
    var GlobalCompareResourcesAction = /** @class */ (function (_super) {
        __extends(GlobalCompareResourcesAction, _super);
        function GlobalCompareResourcesAction(id, label, quickOpenService, editorService, messageService, editorGroupService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            _this.editorService = editorService;
            _this.messageService = messageService;
            _this.editorGroupService = editorGroupService;
            return _this;
        }
        GlobalCompareResourcesAction.prototype.run = function () {
            var _this = this;
            var activeInput = this.editorService.getActiveEditorInput();
            var activeResource = activeInput ? activeInput.getResource() : void 0;
            if (activeResource) {
                // Compare with next editor that opens
                var unbind_1 = event_1.once(this.editorGroupService.onEditorOpening)(function (e) {
                    var resource = e.input.getResource();
                    if (resource) {
                        e.prevent(function () {
                            return _this.editorService.openEditor({
                                leftResource: activeResource,
                                rightResource: resource
                            });
                        });
                    }
                });
                // Bring up quick open
                this.quickOpenService.show('', { autoFocus: { autoFocusSecondEntry: true } }).then(function () {
                    unbind_1.dispose(); // make sure to unbind if quick open is closing
                });
            }
            else {
                this.messageService.show(message_1.Severity.Info, nls.localize('openFileToCompare', "Open a file first to compare it with another file."));
            }
            return winjs_base_1.TPromise.as(true);
        };
        GlobalCompareResourcesAction.ID = 'workbench.files.action.compareFileWith';
        GlobalCompareResourcesAction.LABEL = nls.localize('globalCompareFile', "Compare Active File With...");
        GlobalCompareResourcesAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, message_1.IMessageService),
            __param(5, groupService_1.IEditorGroupService)
        ], GlobalCompareResourcesAction);
        return GlobalCompareResourcesAction;
    }(actions_1.Action));
    exports.GlobalCompareResourcesAction = GlobalCompareResourcesAction;
    // Refresh Explorer Viewer
    var RefreshViewExplorerAction = /** @class */ (function (_super) {
        __extends(RefreshViewExplorerAction, _super);
        function RefreshViewExplorerAction(explorerView, clazz) {
            return _super.call(this, 'workbench.files.action.refreshFilesExplorer', nls.localize('refresh', "Refresh"), clazz, true, function (context) { return explorerView.refresh(); }) || this;
        }
        return RefreshViewExplorerAction;
    }(actions_1.Action));
    exports.RefreshViewExplorerAction = RefreshViewExplorerAction;
    var BaseSaveAllAction = /** @class */ (function (_super) {
        __extends(BaseSaveAllAction, _super);
        function BaseSaveAllAction(id, label, textFileService, untitledEditorService, commandService, messageService) {
            var _this = _super.call(this, id, label, messageService) || this;
            _this.textFileService = textFileService;
            _this.untitledEditorService = untitledEditorService;
            _this.commandService = commandService;
            _this.toDispose = [];
            _this.lastIsDirty = _this.textFileService.isDirty();
            _this.enabled = _this.lastIsDirty;
            _this.registerListeners();
            return _this;
        }
        BaseSaveAllAction.prototype.registerListeners = function () {
            var _this = this;
            // listen to files being changed locally
            this.toDispose.push(this.textFileService.models.onModelsDirty(function (e) { return _this.updateEnablement(true); }));
            this.toDispose.push(this.textFileService.models.onModelsSaved(function (e) { return _this.updateEnablement(false); }));
            this.toDispose.push(this.textFileService.models.onModelsReverted(function (e) { return _this.updateEnablement(false); }));
            this.toDispose.push(this.textFileService.models.onModelsSaveError(function (e) { return _this.updateEnablement(true); }));
            if (this.includeUntitled()) {
                this.toDispose.push(this.untitledEditorService.onDidChangeDirty(function (resource) { return _this.updateEnablement(_this.untitledEditorService.isDirty(resource)); }));
            }
        };
        BaseSaveAllAction.prototype.updateEnablement = function (isDirty) {
            if (this.lastIsDirty !== isDirty) {
                this.enabled = this.textFileService.isDirty();
                this.lastIsDirty = this.enabled;
            }
        };
        BaseSaveAllAction.prototype.run = function (context) {
            var _this = this;
            return this.doRun(context).then(function () { return true; }, function (error) {
                _this.onError(error);
                return null;
            });
        };
        BaseSaveAllAction.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        BaseSaveAllAction = __decorate([
            __param(2, textfiles_1.ITextFileService),
            __param(3, untitledEditorService_1.IUntitledEditorService),
            __param(4, commands_1.ICommandService),
            __param(5, message_1.IMessageService)
        ], BaseSaveAllAction);
        return BaseSaveAllAction;
    }(BaseErrorReportingAction));
    exports.BaseSaveAllAction = BaseSaveAllAction;
    var SaveAllAction = /** @class */ (function (_super) {
        __extends(SaveAllAction, _super);
        function SaveAllAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(SaveAllAction.prototype, "class", {
            get: function () {
                return 'explorer-action save-all';
            },
            enumerable: true,
            configurable: true
        });
        SaveAllAction.prototype.doRun = function (context) {
            return this.commandService.executeCommand(fileCommands_1.SAVE_ALL_COMMAND_ID);
        };
        SaveAllAction.prototype.includeUntitled = function () {
            return true;
        };
        SaveAllAction.ID = 'workbench.action.files.saveAll';
        SaveAllAction.LABEL = fileCommands_1.SAVE_ALL_LABEL;
        return SaveAllAction;
    }(BaseSaveAllAction));
    exports.SaveAllAction = SaveAllAction;
    var SaveAllInGroupAction = /** @class */ (function (_super) {
        __extends(SaveAllInGroupAction, _super);
        function SaveAllInGroupAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(SaveAllInGroupAction.prototype, "class", {
            get: function () {
                return 'explorer-action save-all';
            },
            enumerable: true,
            configurable: true
        });
        SaveAllInGroupAction.prototype.doRun = function (context) {
            return this.commandService.executeCommand(fileCommands_1.SAVE_ALL_IN_GROUP_COMMAND_ID);
        };
        SaveAllInGroupAction.prototype.includeUntitled = function () {
            return true;
        };
        SaveAllInGroupAction.ID = 'workbench.files.action.saveAllInGroup';
        SaveAllInGroupAction.LABEL = nls.localize('saveAllInGroup', "Save All in Group");
        return SaveAllInGroupAction;
    }(BaseSaveAllAction));
    exports.SaveAllInGroupAction = SaveAllInGroupAction;
    var FocusOpenEditorsView = /** @class */ (function (_super) {
        __extends(FocusOpenEditorsView, _super);
        function FocusOpenEditorsView(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusOpenEditorsView.prototype.run = function () {
            return this.viewletService.openViewlet(files_1.VIEWLET_ID, true).then(function (viewlet) {
                var openEditorsView = viewlet.getOpenEditorsView();
                if (openEditorsView) {
                    openEditorsView.setExpanded(true);
                    openEditorsView.getList().domFocus();
                }
            });
        };
        FocusOpenEditorsView.ID = 'workbench.files.action.focusOpenEditorsView';
        FocusOpenEditorsView.LABEL = nls.localize({ key: 'focusOpenEditors', comment: ['Open is an adjective'] }, "Focus on Open Editors View");
        FocusOpenEditorsView = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], FocusOpenEditorsView);
        return FocusOpenEditorsView;
    }(actions_1.Action));
    exports.FocusOpenEditorsView = FocusOpenEditorsView;
    var FocusFilesExplorer = /** @class */ (function (_super) {
        __extends(FocusFilesExplorer, _super);
        function FocusFilesExplorer(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusFilesExplorer.prototype.run = function () {
            return this.viewletService.openViewlet(files_1.VIEWLET_ID, true).then(function (viewlet) {
                var view = viewlet.getExplorerView();
                if (view) {
                    view.setExpanded(true);
                    view.getViewer().DOMFocus();
                }
            });
        };
        FocusFilesExplorer.ID = 'workbench.files.action.focusFilesExplorer';
        FocusFilesExplorer.LABEL = nls.localize('focusFilesExplorer', "Focus on Files Explorer");
        FocusFilesExplorer = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], FocusFilesExplorer);
        return FocusFilesExplorer;
    }(actions_1.Action));
    exports.FocusFilesExplorer = FocusFilesExplorer;
    var ShowActiveFileInExplorer = /** @class */ (function (_super) {
        __extends(ShowActiveFileInExplorer, _super);
        function ShowActiveFileInExplorer(id, label, editorService, messageService, commandService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            _this.messageService = messageService;
            _this.commandService = commandService;
            return _this;
        }
        ShowActiveFileInExplorer.prototype.run = function () {
            var resource = editor_1.toResource(this.editorService.getActiveEditorInput(), { supportSideBySide: true });
            if (resource) {
                this.commandService.executeCommand(fileCommands_1.REVEAL_IN_EXPLORER_COMMAND_ID, resource);
            }
            else {
                this.messageService.show(severity_1.default.Info, nls.localize('openFileToShow', "Open a file first to show it in the explorer"));
            }
            return winjs_base_1.TPromise.as(true);
        };
        ShowActiveFileInExplorer.ID = 'workbench.files.action.showActiveFileInExplorer';
        ShowActiveFileInExplorer.LABEL = nls.localize('showInExplorer', "Reveal Active File in Side Bar");
        ShowActiveFileInExplorer = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, message_1.IMessageService),
            __param(4, commands_1.ICommandService)
        ], ShowActiveFileInExplorer);
        return ShowActiveFileInExplorer;
    }(actions_1.Action));
    exports.ShowActiveFileInExplorer = ShowActiveFileInExplorer;
    var CollapseExplorerView = /** @class */ (function (_super) {
        __extends(CollapseExplorerView, _super);
        function CollapseExplorerView(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        CollapseExplorerView.prototype.run = function () {
            return this.viewletService.openViewlet(files_1.VIEWLET_ID, true).then(function (viewlet) {
                var explorerView = viewlet.getExplorerView();
                if (explorerView) {
                    var viewer = explorerView.getViewer();
                    if (viewer) {
                        var action = new viewlet_1.CollapseAction(viewer, true, null);
                        action.run().done();
                        action.dispose();
                    }
                }
            });
        };
        CollapseExplorerView.ID = 'workbench.files.action.collapseExplorerFolders';
        CollapseExplorerView.LABEL = nls.localize('collapseExplorerFolders', "Collapse Folders in Explorer");
        CollapseExplorerView = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], CollapseExplorerView);
        return CollapseExplorerView;
    }(actions_1.Action));
    exports.CollapseExplorerView = CollapseExplorerView;
    var RefreshExplorerView = /** @class */ (function (_super) {
        __extends(RefreshExplorerView, _super);
        function RefreshExplorerView(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        RefreshExplorerView.prototype.run = function () {
            return this.viewletService.openViewlet(files_1.VIEWLET_ID, true).then(function (viewlet) {
                var explorerView = viewlet.getExplorerView();
                if (explorerView) {
                    explorerView.refresh();
                }
            });
        };
        RefreshExplorerView.ID = 'workbench.files.action.refreshFilesExplorer';
        RefreshExplorerView.LABEL = nls.localize('refreshExplorer', "Refresh Explorer");
        RefreshExplorerView = __decorate([
            __param(2, viewlet_2.IViewletService)
        ], RefreshExplorerView);
        return RefreshExplorerView;
    }(actions_1.Action));
    exports.RefreshExplorerView = RefreshExplorerView;
    var ShowOpenedFileInNewWindow = /** @class */ (function (_super) {
        __extends(ShowOpenedFileInNewWindow, _super);
        function ShowOpenedFileInNewWindow(id, label, windowsService, editorService, messageService) {
            var _this = _super.call(this, id, label) || this;
            _this.windowsService = windowsService;
            _this.editorService = editorService;
            _this.messageService = messageService;
            return _this;
        }
        ShowOpenedFileInNewWindow.prototype.run = function () {
            var fileResource = editor_1.toResource(this.editorService.getActiveEditorInput(), { supportSideBySide: true, filter: network_1.Schemas.file /* todo@remote */ });
            if (fileResource) {
                this.windowsService.openWindow([fileResource.fsPath], { forceNewWindow: true, forceOpenWorkspaceAsFile: true });
            }
            else {
                this.messageService.show(severity_1.default.Info, nls.localize('openFileToShowInNewWindow', "Open a file first to open in new window"));
            }
            return winjs_base_1.TPromise.as(true);
        };
        ShowOpenedFileInNewWindow.ID = 'workbench.action.files.showOpenedFileInNewWindow';
        ShowOpenedFileInNewWindow.LABEL = nls.localize('openFileInNewWindow', "Open Active File in New Window");
        ShowOpenedFileInNewWindow = __decorate([
            __param(2, windows_1.IWindowsService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, message_1.IMessageService)
        ], ShowOpenedFileInNewWindow);
        return ShowOpenedFileInNewWindow;
    }(actions_1.Action));
    exports.ShowOpenedFileInNewWindow = ShowOpenedFileInNewWindow;
    var CopyPathAction = /** @class */ (function (_super) {
        __extends(CopyPathAction, _super);
        function CopyPathAction(resource, commandService) {
            var _this = _super.call(this, 'copyFilePath', CopyPathAction.LABEL) || this;
            _this.resource = resource;
            _this.commandService = commandService;
            _this.order = 140;
            return _this;
        }
        CopyPathAction.prototype.run = function () {
            return this.commandService.executeCommand(fileCommands_1.COPY_PATH_COMMAND_ID, this.resource);
        };
        CopyPathAction.LABEL = nls.localize('copyPath', "Copy Path");
        CopyPathAction = __decorate([
            __param(1, commands_1.ICommandService)
        ], CopyPathAction);
        return CopyPathAction;
    }(actions_1.Action));
    exports.CopyPathAction = CopyPathAction;
    function validateFileName(parent, name, allowOverwriting) {
        if (allowOverwriting === void 0) { allowOverwriting = false; }
        // Produce a well formed file name
        name = getWellFormedFileName(name);
        // Name not provided
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return nls.localize('emptyFileNameError', "A file or folder name must be provided.");
        }
        // Do not allow to overwrite existing file
        if (!allowOverwriting) {
            if (parent.children && parent.children.some(function (c) {
                if (platform_1.isLinux) {
                    return c.name === name;
                }
                return c.name.toLowerCase() === name.toLowerCase();
            })) {
                return nls.localize('fileNameExistsError', "A file or folder **{0}** already exists at this location. Please choose a different name.", name);
            }
        }
        // Invalid File name
        if (!paths.isValidBasename(name)) {
            return nls.localize('invalidFileNameError', "The name **{0}** is not valid as a file or folder name. Please choose a different name.", trimLongName(name));
        }
        // Max length restriction (on Windows)
        if (platform_1.isWindows) {
            var fullPathLength = name.length + parent.resource.fsPath.length + 1 /* path segment */;
            if (fullPathLength > 255) {
                return nls.localize('filePathTooLongError', "The name **{0}** results in a path that is too long. Please choose a shorter name.", trimLongName(name));
            }
        }
        return null;
    }
    exports.validateFileName = validateFileName;
    function trimLongName(name) {
        if (name && name.length > 255) {
            return name.substr(0, 255) + "...";
        }
        return name;
    }
    function getWellFormedFileName(filename) {
        if (!filename) {
            return filename;
        }
        // Trim whitespaces
        filename = strings.trim(strings.trim(filename, ' '), '\t');
        // Remove trailing dots
        filename = strings.rtrim(filename, '.');
        return filename;
    }
    exports.getWellFormedFileName = getWellFormedFileName;
    var CompareWithClipboardAction = /** @class */ (function (_super) {
        __extends(CompareWithClipboardAction, _super);
        function CompareWithClipboardAction(id, label, editorService, instantiationService, textModelService, fileService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            _this.instantiationService = instantiationService;
            _this.textModelService = textModelService;
            _this.fileService = fileService;
            _this.enabled = true;
            return _this;
        }
        CompareWithClipboardAction.prototype.run = function () {
            var _this = this;
            var resource = editor_1.toResource(this.editorService.getActiveEditorInput(), { supportSideBySide: true });
            if (resource && (this.fileService.canHandleResource(resource) || resource.scheme === network_1.Schemas.untitled)) {
                if (!this.registrationDisposal) {
                    var provider = this.instantiationService.createInstance(ClipboardContentProvider);
                    this.registrationDisposal = this.textModelService.registerTextModelContentProvider(CompareWithClipboardAction.SCHEME, provider);
                }
                var name_1 = paths.basename(resource.fsPath);
                var editorLabel = nls.localize('clipboardComparisonLabel', "Clipboard ↔ {0}", name_1);
                var cleanUp = function () {
                    _this.registrationDisposal = lifecycle_1.dispose(_this.registrationDisposal);
                };
                return async_1.always(this.editorService.openEditor({ leftResource: uri_1.default.from({ scheme: CompareWithClipboardAction.SCHEME, path: resource.fsPath }), rightResource: resource, label: editorLabel }), cleanUp);
            }
            return winjs_base_1.TPromise.as(true);
        };
        CompareWithClipboardAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.registrationDisposal = lifecycle_1.dispose(this.registrationDisposal);
        };
        CompareWithClipboardAction.ID = 'workbench.files.action.compareWithClipboard';
        CompareWithClipboardAction.LABEL = nls.localize('compareWithClipboard', "Compare Active File with Clipboard");
        CompareWithClipboardAction.SCHEME = 'clipboardCompare';
        CompareWithClipboardAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, resolverService_1.ITextModelService),
            __param(5, files_2.IFileService)
        ], CompareWithClipboardAction);
        return CompareWithClipboardAction;
    }(actions_1.Action));
    exports.CompareWithClipboardAction = CompareWithClipboardAction;
    var ClipboardContentProvider = /** @class */ (function () {
        function ClipboardContentProvider(clipboardService, modeService, modelService) {
            this.clipboardService = clipboardService;
            this.modeService = modeService;
            this.modelService = modelService;
        }
        ClipboardContentProvider.prototype.provideTextContent = function (resource) {
            var model = this.modelService.createModel(this.clipboardService.readText(), this.modeService.getOrCreateMode('text/plain'), resource);
            return winjs_base_1.TPromise.as(model);
        };
        ClipboardContentProvider = __decorate([
            __param(0, clipboardService_1.IClipboardService),
            __param(1, modeService_1.IModeService),
            __param(2, modelService_1.IModelService)
        ], ClipboardContentProvider);
        return ClipboardContentProvider;
    }());
    // Diagnostics support
    var diag;
    if (!diag) {
        diag = diagnostics.register('FileActionsDiagnostics', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log(args[1] + ' - ' + args[0] + ' (time: ' + args[2].getTime() + ' [' + args[2].toUTCString() + '])');
        });
    }
    function getContext(listWidget, viewletService) {
        // These commands can only be triggered when explorer viewlet is visible so get it using the active viewlet
        var tree = listWidget;
        var stat = tree.getFocus();
        var selection = tree.getSelection();
        // Only respect the selection if user clicked inside it (focus belongs to it)
        return { stat: stat, selection: selection && selection.indexOf(stat) >= 0 ? selection : [], viewletState: viewletService.getActiveViewlet().getViewletState() };
    }
    // TODO@isidor these commands are calling into actions due to the complex inheritance action structure.
    // It should be the other way around, that actions call into commands.
    function openExplorerAndRunAction(accessor, constructor) {
        var instantationService = accessor.get(instantiation_1.IInstantiationService);
        var listService = accessor.get(listService_1.IListService);
        var viewletService = accessor.get(viewlet_2.IViewletService);
        var activeViewlet = viewletService.getActiveViewlet();
        var explorerPromise = winjs_base_1.TPromise.as(activeViewlet);
        if (!activeViewlet || activeViewlet.getId() !== files_1.VIEWLET_ID) {
            explorerPromise = viewletService.openViewlet(files_1.VIEWLET_ID, true);
        }
        return explorerPromise.then(function (explorer) {
            var explorerView = explorer.getExplorerView();
            if (explorerView && explorerView.isVisible() && explorerView.isExpanded()) {
                explorerView.focus();
                var explorerContext = getContext(listService.lastFocusedList, viewletService);
                var action = instantationService.createInstance(constructor, listService.lastFocusedList, explorerContext.stat);
                return action.run(explorerContext);
            }
            return undefined;
        });
    }
    commands_1.CommandsRegistry.registerCommand({
        id: exports.NEW_FILE_COMMAND_ID,
        handler: function (accessor) {
            return openExplorerAndRunAction(accessor, NewFileAction);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.NEW_FOLDER_COMMAND_ID,
        handler: function (accessor) {
            return openExplorerAndRunAction(accessor, NewFolderAction);
        }
    });
    exports.renameHandler = function (accessor) {
        var instantationService = accessor.get(instantiation_1.IInstantiationService);
        var listService = accessor.get(listService_1.IListService);
        var explorerContext = getContext(listService.lastFocusedList, accessor.get(viewlet_2.IViewletService));
        var renameAction = instantationService.createInstance(TriggerRenameFileAction, listService.lastFocusedList, explorerContext.stat);
        return renameAction.run(explorerContext);
    };
    exports.moveFileToTrashHandler = function (accessor) {
        var instantationService = accessor.get(instantiation_1.IInstantiationService);
        var listService = accessor.get(listService_1.IListService);
        var explorerContext = getContext(listService.lastFocusedList, accessor.get(viewlet_2.IViewletService));
        var stats = explorerContext.selection.length > 1 ? explorerContext.selection : [explorerContext.stat];
        var moveFileToTrashAction = instantationService.createInstance(BaseDeleteFileAction, listService.lastFocusedList, stats, true);
        return moveFileToTrashAction.run();
    };
    exports.deleteFileHandler = function (accessor) {
        var instantationService = accessor.get(instantiation_1.IInstantiationService);
        var listService = accessor.get(listService_1.IListService);
        var explorerContext = getContext(listService.lastFocusedList, accessor.get(viewlet_2.IViewletService));
        var stats = explorerContext.selection.length > 1 ? explorerContext.selection : [explorerContext.stat];
        var deleteFileAction = instantationService.createInstance(BaseDeleteFileAction, listService.lastFocusedList, stats, false);
        return deleteFileAction.run();
    };
    exports.copyFileHandler = function (accessor) {
        var instantationService = accessor.get(instantiation_1.IInstantiationService);
        var listService = accessor.get(listService_1.IListService);
        var explorerContext = getContext(listService.lastFocusedList, accessor.get(viewlet_2.IViewletService));
        var stats = explorerContext.selection.length > 1 ? explorerContext.selection : [explorerContext.stat];
        var copyFileAction = instantationService.createInstance(CopyFileAction, listService.lastFocusedList, stats);
        return copyFileAction.run();
    };
    exports.pasteFileHandler = function (accessor) {
        var instantationService = accessor.get(instantiation_1.IInstantiationService);
        var listService = accessor.get(listService_1.IListService);
        var clipboardService = accessor.get(clipboardService_1.IClipboardService);
        var explorerContext = getContext(listService.lastFocusedList, accessor.get(viewlet_2.IViewletService));
        return winjs_base_1.TPromise.join(resources_1.distinctParents(clipboardService.readFiles(), function (r) { return r; }).map(function (toCopy) {
            var pasteFileAction = instantationService.createInstance(PasteFileAction, listService.lastFocusedList, explorerContext.stat);
            return pasteFileAction.run(toCopy);
        }));
    };
});
