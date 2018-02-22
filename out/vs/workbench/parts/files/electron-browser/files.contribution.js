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
define(["require", "exports", "vs/base/common/uri", "vs/workbench/browser/viewlet", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/actions", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/platform/files/common/files", "vs/workbench/parts/files/common/files", "vs/workbench/parts/files/browser/editors/fileEditorTracker", "vs/workbench/parts/files/electron-browser/saveErrorHandler", "vs/workbench/parts/files/common/editors/fileEditorInput", "vs/workbench/parts/files/browser/editors/textFileEditor", "vs/workbench/parts/files/browser/editors/binaryFileEditor", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/services/editor/common/editorService", "vs/base/common/platform", "vs/workbench/parts/files/common/dirtyFilesTracker", "vs/workbench/parts/files/electron-browser/explorerViewlet", "vs/workbench/browser/editor", "vs/workbench/common/editor/dataUriEditorInput", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, uri_1, viewlet_1, nls, actions_1, platform_1, configurationRegistry_1, actions_2, contributions_1, editor_1, files_1, files_2, fileEditorTracker_1, saveErrorHandler_1, fileEditorInput_1, textFileEditor_1, binaryFileEditor_1, descriptors_1, viewlet_2, editorService_1, platform, dirtyFilesTracker_1, explorerViewlet_1, editor_2, dataUriEditorInput_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Viewlet Action
    var OpenExplorerViewletAction = /** @class */ (function (_super) {
        __extends(OpenExplorerViewletAction, _super);
        function OpenExplorerViewletAction(id, label, viewletService, editorService) {
            return _super.call(this, id, label, files_2.VIEWLET_ID, viewletService, editorService) || this;
        }
        OpenExplorerViewletAction.ID = files_2.VIEWLET_ID;
        OpenExplorerViewletAction.LABEL = nls.localize('showExplorerViewlet', "Show Explorer");
        OpenExplorerViewletAction = __decorate([
            __param(2, viewlet_2.IViewletService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenExplorerViewletAction);
        return OpenExplorerViewletAction;
    }(viewlet_1.ToggleViewletAction));
    exports.OpenExplorerViewletAction = OpenExplorerViewletAction;
    // Register Viewlet
    platform_1.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet(new viewlet_1.ViewletDescriptor(explorerViewlet_1.ExplorerViewlet, files_2.VIEWLET_ID, nls.localize('explore', "Explorer"), 'explore', 0));
    platform_1.Registry.as(viewlet_1.Extensions.Viewlets).setDefaultViewletId(files_2.VIEWLET_ID);
    var openViewletKb = {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 35 /* KEY_E */
    };
    // Register Action to Open Viewlet
    var registry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(OpenExplorerViewletAction, OpenExplorerViewletAction.ID, OpenExplorerViewletAction.LABEL, openViewletKb), 'View: Show Explorer', nls.localize('view', "View"));
    // Register file editors
    platform_1.Registry.as(editor_2.Extensions.Editors).registerEditor(new editor_2.EditorDescriptor(textFileEditor_1.TextFileEditor, textFileEditor_1.TextFileEditor.ID, nls.localize('textFileEditor', "Text File Editor")), [
        new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)
    ]);
    platform_1.Registry.as(editor_2.Extensions.Editors).registerEditor(new editor_2.EditorDescriptor(binaryFileEditor_1.BinaryFileEditor, binaryFileEditor_1.BinaryFileEditor.ID, nls.localize('binaryFileEditor', "Binary File Editor")), [
        new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput),
        new descriptors_1.SyncDescriptor(dataUriEditorInput_1.DataUriEditorInput)
    ]);
    // Register default file input factory
    platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).registerFileInputFactory({
        createFileInput: function (resource, encoding, instantiationService) {
            return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, encoding);
        },
        isFileInput: function (obj) {
            return obj instanceof fileEditorInput_1.FileEditorInput;
        }
    });
    // Register Editor Input Factory
    var FileEditorInputFactory = /** @class */ (function () {
        function FileEditorInputFactory() {
        }
        FileEditorInputFactory.prototype.serialize = function (editorInput) {
            var fileEditorInput = editorInput;
            var resource = fileEditorInput.getResource();
            var fileInput = {
                resource: resource.toString(),
                resourceJSON: resource.toJSON(),
                encoding: fileEditorInput.getEncoding()
            };
            return JSON.stringify(fileInput);
        };
        FileEditorInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            return instantiationService.invokeFunction(function (accessor) {
                var fileInput = JSON.parse(serializedEditorInput);
                var resource = !!fileInput.resourceJSON ? uri_1.default.revive(fileInput.resourceJSON) : uri_1.default.parse(fileInput.resource);
                var encoding = fileInput.encoding;
                return accessor.get(editorService_1.IWorkbenchEditorService).createInput({ resource: resource, encoding: encoding });
            });
        };
        return FileEditorInputFactory;
    }());
    platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).registerEditorInputFactory(files_2.FILE_EDITOR_INPUT_ID, FileEditorInputFactory);
    // Register Explorer views
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(explorerViewlet_1.ExplorerViewletViewsContribution, lifecycle_1.LifecyclePhase.Starting);
    // Register File Editor Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(fileEditorTracker_1.FileEditorTracker, lifecycle_1.LifecyclePhase.Starting);
    // Register Save Error Handler
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(saveErrorHandler_1.SaveErrorHandler, lifecycle_1.LifecyclePhase.Starting);
    // Register Dirty Files Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(dirtyFilesTracker_1.DirtyFilesTracker, lifecycle_1.LifecyclePhase.Starting);
    // Configuration
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'files',
        'order': 9,
        'title': nls.localize('filesConfigurationTitle', "Files"),
        'type': 'object',
        'properties': {
            'files.exclude': {
                'type': 'object',
                'description': nls.localize('exclude', "Configure glob patterns for excluding files and folders. For example, the files explorer decides which files and folders to show or hide based on this setting."),
                'default': { '**/.git': true, '**/.svn': true, '**/.hg': true, '**/CVS': true, '**/.DS_Store': true },
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE,
                'additionalProperties': {
                    'anyOf': [
                        {
                            'type': 'boolean',
                            'description': nls.localize('files.exclude.boolean', "The glob pattern to match file paths against. Set to true or false to enable or disable the pattern."),
                        },
                        {
                            'type': 'object',
                            'properties': {
                                'when': {
                                    'type': 'string',
                                    'pattern': '\\w*\\$\\(basename\\)\\w*',
                                    'default': '$(basename).ext',
                                    'description': nls.localize('files.exclude.when', "Additional check on the siblings of a matching file. Use $(basename) as variable for the matching file name.")
                                }
                            }
                        }
                    ]
                }
            },
            'files.associations': {
                'type': 'object',
                'description': nls.localize('associations', "Configure file associations to languages (e.g. \"*.extension\": \"html\"). These have precedence over the default associations of the languages installed."),
            },
            'files.encoding': {
                'type': 'string',
                'overridable': true,
                'enum': Object.keys(files_1.SUPPORTED_ENCODINGS),
                'default': 'utf8',
                'description': nls.localize('encoding', "The default character set encoding to use when reading and writing files. This setting can be configured per language too."),
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE,
                'enumDescriptions': Object.keys(files_1.SUPPORTED_ENCODINGS).map(function (key) { return files_1.SUPPORTED_ENCODINGS[key].labelLong; })
            },
            'files.autoGuessEncoding': {
                'type': 'boolean',
                'overridable': true,
                'default': false,
                'description': nls.localize('autoGuessEncoding', "When enabled, will attempt to guess the character set encoding when opening files. This setting can be configured per language too."),
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
            },
            'files.eol': {
                'type': 'string',
                'enum': [
                    '\n',
                    '\r\n'
                ],
                'default': (platform.isLinux || platform.isMacintosh) ? '\n' : '\r\n',
                'description': nls.localize('eol', "The default end of line character. Use \\n for LF and \\r\\n for CRLF."),
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
            },
            'files.trimTrailingWhitespace': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('trimTrailingWhitespace', "When enabled, will trim trailing whitespace when saving a file."),
                'overridable': true,
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
            },
            'files.insertFinalNewline': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('insertFinalNewline', "When enabled, insert a final new line at the end of the file when saving it."),
                'overridable': true,
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
            },
            'files.trimFinalNewlines': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('trimFinalNewlines', "When enabled, will trim all new lines after the final new line at the end of the file when saving it."),
                'overridable': true,
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
            },
            'files.autoSave': {
                'type': 'string',
                'enum': [files_1.AutoSaveConfiguration.OFF, files_1.AutoSaveConfiguration.AFTER_DELAY, files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE, , files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE],
                'enumDescriptions': [
                    nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'files.autoSave.off' }, "A dirty file is never automatically saved."),
                    nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'files.autoSave.afterDelay' }, "A dirty file is automatically saved after the configured 'files.autoSaveDelay'."),
                    nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'files.autoSave.onFocusChange' }, "A dirty file is automatically saved when the editor loses focus."),
                    nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'files.autoSave.onWindowChange' }, "A dirty file is automatically saved when the window loses focus.")
                ],
                'default': files_1.AutoSaveConfiguration.OFF,
                'description': nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'autoSave' }, "Controls auto save of dirty files. Accepted values:  '{0}', '{1}', '{2}' (editor loses focus), '{3}' (window loses focus). If set to '{4}', you can configure the delay in 'files.autoSaveDelay'.", files_1.AutoSaveConfiguration.OFF, files_1.AutoSaveConfiguration.AFTER_DELAY, files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE, files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE, files_1.AutoSaveConfiguration.AFTER_DELAY)
            },
            'files.autoSaveDelay': {
                'type': 'number',
                'default': 1000,
                'description': nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'autoSaveDelay' }, "Controls the delay in ms after which a dirty file is saved automatically. Only applies when 'files.autoSave' is set to '{0}'", files_1.AutoSaveConfiguration.AFTER_DELAY)
            },
            'files.watcherExclude': {
                'type': 'object',
                'default': platform.isWindows /* https://github.com/Microsoft/vscode/issues/23954 */ ? { '**/.git/objects/**': true, '**/.git/subtree-cache/**': true, '**/node_modules/*/**': true } : { '**/.git/objects/**': true, '**/.git/subtree-cache/**': true, '**/node_modules/**': true },
                'description': nls.localize('watcherExclude', "Configure glob patterns of file paths to exclude from file watching. Patterns must match on absolute paths (i.e. prefix with ** or the full path to match properly). Changing this setting requires a restart. When you experience Code consuming lots of cpu time on startup, you can exclude large folders to reduce the initial load."),
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
            },
            'files.hotExit': {
                'type': 'string',
                'enum': [files_1.HotExitConfiguration.OFF, files_1.HotExitConfiguration.ON_EXIT, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE],
                'default': files_1.HotExitConfiguration.ON_EXIT,
                'enumDescriptions': [
                    nls.localize('hotExit.off', 'Disable hot exit.'),
                    nls.localize('hotExit.onExit', 'Hot exit will be triggered when the application is closed, that is when the last window is closed on Windows/Linux or when the workbench.action.quit command is triggered (command palette, keybinding, menu). All windows with backups will be restored upon next launch.'),
                    nls.localize('hotExit.onExitAndWindowClose', 'Hot exit will be triggered when the application is closed, that is when the last window is closed on Windows/Linux or when the workbench.action.quit command is triggered (command palette, keybinding, menu), and also for any window with a folder opened regardless of whether it\'s the last window. All windows without folders opened will be restored upon next launch. To restore folder windows as they were before shutdown set "window.restoreWindows" to "all".')
                ],
                'description': nls.localize('hotExit', "Controls whether unsaved files are remembered between sessions, allowing the save prompt when exiting the editor to be skipped.", files_1.HotExitConfiguration.ON_EXIT, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE)
            },
            'files.useExperimentalFileWatcher': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('useExperimentalFileWatcher', "Use the new experimental file watcher.")
            },
            'files.defaultLanguage': {
                'type': 'string',
                'description': nls.localize('defaultLanguage', "The default language mode that is assigned to new files.")
            }
        }
    });
    configurationRegistry.registerConfiguration({
        id: 'editor',
        order: 5,
        title: nls.localize('editorConfigurationTitle', "Editor"),
        type: 'object',
        properties: {
            'editor.formatOnSave': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('formatOnSave', "Format a file on save. A formatter must be available, the file must not be auto-saved, and editor must not be shutting down."),
                'overridable': true,
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
            }
        }
    });
    configurationRegistry.registerConfiguration({
        'id': 'explorer',
        'order': 10,
        'title': nls.localize('explorerConfigurationTitle', "File Explorer"),
        'type': 'object',
        'properties': {
            'explorer.openEditors.visible': {
                'type': 'number',
                'description': nls.localize({ key: 'openEditorsVisible', comment: ['Open is an adjective'] }, "Number of editors shown in the Open Editors pane."),
                'default': 9
            },
            'explorer.autoReveal': {
                'type': 'boolean',
                'description': nls.localize('autoReveal', "Controls if the explorer should automatically reveal and select files when opening them."),
                'default': true
            },
            'explorer.enableDragAndDrop': {
                'type': 'boolean',
                'description': nls.localize('enableDragAndDrop', "Controls if the explorer should allow to move files and folders via drag and drop."),
                'default': true
            },
            'explorer.confirmDragAndDrop': {
                'type': 'boolean',
                'description': nls.localize('confirmDragAndDrop', "Controls if the explorer should ask for confirmation to move files and folders via drag and drop."),
                'default': true
            },
            'explorer.confirmDelete': {
                'type': 'boolean',
                'description': nls.localize('confirmDelete', "Controls if the explorer should ask for confirmation when deleting a file via the trash."),
                'default': true
            },
            'explorer.sortOrder': {
                'type': 'string',
                'enum': [files_2.SortOrderConfiguration.DEFAULT, files_2.SortOrderConfiguration.MIXED, files_2.SortOrderConfiguration.FILES_FIRST, files_2.SortOrderConfiguration.TYPE, files_2.SortOrderConfiguration.MODIFIED],
                'default': files_2.SortOrderConfiguration.DEFAULT,
                'enumDescriptions': [
                    nls.localize('sortOrder.default', 'Files and folders are sorted by their names, in alphabetical order. Folders are displayed before files.'),
                    nls.localize('sortOrder.mixed', 'Files and folders are sorted by their names, in alphabetical order. Files are interwoven with folders.'),
                    nls.localize('sortOrder.filesFirst', 'Files and folders are sorted by their names, in alphabetical order. Files are displayed before folders.'),
                    nls.localize('sortOrder.type', 'Files and folders are sorted by their extensions, in alphabetical order. Folders are displayed before files.'),
                    nls.localize('sortOrder.modified', 'Files and folders are sorted by last modified date, in descending order. Folders are displayed before files.')
                ],
                'description': nls.localize({ key: 'sortOrder', comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'] }, "Controls sorting order of files and folders in the explorer. In addition to the default sorting, you can set the order to 'mixed' (files and folders sorted combined), 'type' (by file type), 'modified' (by last modified date) or 'filesFirst' (sort files before folders).")
            },
            'explorer.decorations.colors': {
                type: 'boolean',
                description: nls.localize('explorer.decorations.colors', "Controls if file decorations should use colors."),
                default: true
            },
            'explorer.decorations.badges': {
                type: 'boolean',
                description: nls.localize('explorer.decorations.badges', "Controls if file decorations should use badges."),
                default: true
            },
        }
    });
});
