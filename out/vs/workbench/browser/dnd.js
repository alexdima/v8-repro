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
define(["require", "exports", "vs/platform/workspaces/common/workspaces", "vs/base/common/paths", "vs/platform/files/common/files", "vs/platform/windows/common/windows", "vs/base/common/uri", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/backup/common/backup", "vs/workbench/services/group/common/groupService", "vs/base/common/winjs.base", "vs/base/common/network", "vs/workbench/services/untitled/common/untitledEditorService", "vs/workbench/services/editor/common/editorService", "vs/base/common/errors", "vs/editor/common/model", "vs/platform/configuration/common/configuration", "vs/base/browser/dnd", "vs/base/parts/tree/browser/treeDefaults", "vs/base/common/labels", "vs/base/common/mime", "vs/base/common/platform", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation", "vs/editor/browser/services/codeEditorService", "vs/base/common/resources"], function (require, exports, workspaces_1, paths_1, files_1, windows_1, uri_1, textfiles_1, backup_1, groupService_1, winjs_base_1, network_1, untitledEditorService_1, editorService_1, errors_1, model_1, configuration_1, dnd_1, treeDefaults_1, labels_1, mime_1, platform_1, arrays_1, instantiation_1, codeEditorService_1, resources_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var DraggedEditorIdentifier = /** @class */ (function () {
        function DraggedEditorIdentifier(_identifier) {
            this._identifier = _identifier;
        }
        Object.defineProperty(DraggedEditorIdentifier.prototype, "identifier", {
            get: function () {
                return this._identifier;
            },
            enumerable: true,
            configurable: true
        });
        return DraggedEditorIdentifier;
    }());
    exports.DraggedEditorIdentifier = DraggedEditorIdentifier;
    exports.CodeDataTransfers = {
        EDITORS: 'CodeEditors',
        FILES: 'CodeFiles'
    };
    function extractResources(e, externalOnly) {
        var resources = [];
        if (e.dataTransfer.types.length > 0) {
            // Check for window-to-window DND
            if (!externalOnly) {
                // Data Transfer: Code Editors
                var rawEditorsData = e.dataTransfer.getData(exports.CodeDataTransfers.EDITORS);
                if (rawEditorsData) {
                    try {
                        var draggedEditors = JSON.parse(rawEditorsData);
                        draggedEditors.forEach(function (draggedEditor) {
                            resources.push({ resource: uri_1.default.parse(draggedEditor.resource), backupResource: draggedEditor.backupResource ? uri_1.default.parse(draggedEditor.backupResource) : void 0, viewState: draggedEditor.viewState, isExternal: false });
                        });
                    }
                    catch (error) {
                        // Invalid transfer
                    }
                }
                else {
                    try {
                        var rawResourcesData = e.dataTransfer.getData(dnd_1.DataTransfers.RESOURCES);
                        if (rawResourcesData) {
                            var uriStrArray = JSON.parse(rawResourcesData);
                            resources.push.apply(resources, uriStrArray.map(function (uriStr) { return ({ resource: uri_1.default.parse(uriStr), isExternal: false }); }));
                        }
                    }
                    catch (error) {
                        // Invalid transfer
                    }
                }
            }
            // Check for native file transfer
            if (e.dataTransfer && e.dataTransfer.files) {
                var _loop_1 = function (i) {
                    var file = e.dataTransfer.files[i];
                    if (file && file.path && !resources.some(function (r) { return r.resource.fsPath === file.path; }) /* prevent duplicates */) {
                        try {
                            resources.push({ resource: uri_1.default.file(file.path), isExternal: true });
                        }
                        catch (error) {
                            // Invalid URI
                        }
                    }
                };
                for (var i = 0; i < e.dataTransfer.files.length; i++) {
                    _loop_1(i);
                }
            }
            // Check for CodeFiles transfer
            var rawCodeFiles = e.dataTransfer.getData(exports.CodeDataTransfers.FILES);
            if (rawCodeFiles) {
                try {
                    var codeFiles = JSON.parse(rawCodeFiles);
                    codeFiles.forEach(function (codeFile) {
                        if (!resources.some(function (r) { return r.resource.fsPath === codeFile; }) /* prevent duplicates */) {
                            resources.push({ resource: uri_1.default.file(codeFile), isExternal: true });
                        }
                    });
                }
                catch (error) {
                    // Invalid transfer
                }
            }
        }
        return resources;
    }
    exports.extractResources = extractResources;
    /**
     * Shared function across some components to handle drag & drop of resources. E.g. of folders and workspace files
     * to open them in the window instead of the editor or to handle dirty editors being dropped between instances of Code.
     */
    var ResourcesDropHandler = /** @class */ (function () {
        function ResourcesDropHandler(options, fileService, windowsService, windowService, workspacesService, textFileService, backupFileService, groupService, untitledEditorService, editorService, configurationService) {
            this.options = options;
            this.fileService = fileService;
            this.windowsService = windowsService;
            this.windowService = windowService;
            this.workspacesService = workspacesService;
            this.textFileService = textFileService;
            this.backupFileService = backupFileService;
            this.groupService = groupService;
            this.untitledEditorService = untitledEditorService;
            this.editorService = editorService;
            this.configurationService = configurationService;
        }
        ResourcesDropHandler.prototype.handleDrop = function (event, afterDrop, targetPosition, targetIndex) {
            var _this = this;
            var untitledOrFileResources = extractResources(event).filter(function (r) { return _this.fileService.canHandleResource(r.resource) || r.resource.scheme === network_1.Schemas.untitled; });
            if (!untitledOrFileResources.length) {
                return;
            }
            // Make the window active to handle the drop properly within
            return this.windowService.focusWindow().then(function () {
                // Check for special things being dropped
                return _this.doHandleDrop(untitledOrFileResources).then(function (isWorkspaceOpening) {
                    if (isWorkspaceOpening) {
                        return void 0; // return early if the drop operation resulted in this window changing to a workspace
                    }
                    // Add external ones to recently open list unless dropped resource is a workspace
                    var filesToAddToHistory = untitledOrFileResources.filter(function (d) { return d.isExternal && d.resource.scheme === network_1.Schemas.file; }).map(function (d) { return d.resource; });
                    if (filesToAddToHistory.length) {
                        _this.windowsService.addRecentlyOpened(filesToAddToHistory.map(function (resource) { return resource.fsPath; }));
                    }
                    // Open in Editor
                    return _this.editorService.openEditors(untitledOrFileResources.map(function (untitledOrFileResource) {
                        return {
                            input: {
                                resource: untitledOrFileResource.resource,
                                options: {
                                    pinned: true,
                                    index: targetIndex,
                                    viewState: untitledOrFileResource.viewState
                                }
                            },
                            position: targetPosition
                        };
                    })).then(function () {
                        // Finish with provided function
                        afterDrop();
                    });
                });
            }).done(null, errors_1.onUnexpectedError);
        };
        ResourcesDropHandler.prototype.doHandleDrop = function (untitledOrFileResources) {
            var _this = this;
            // Check for dirty editors being dropped
            var resourcesWithBackups = untitledOrFileResources.filter(function (resource) { return !resource.isExternal && !!resource.backupResource; });
            if (resourcesWithBackups.length > 0) {
                return winjs_base_1.TPromise.join(resourcesWithBackups.map(function (resourceWithBackup) { return _this.handleDirtyEditorDrop(resourceWithBackup); })).then(function () { return false; });
            }
            // Check for workspace file being dropped if we are allowed to do so
            if (this.options.allowWorkspaceOpen) {
                var externalFileOnDiskResources = untitledOrFileResources.filter(function (d) { return d.isExternal && d.resource.scheme === network_1.Schemas.file; }).map(function (d) { return d.resource; });
                if (externalFileOnDiskResources.length > 0) {
                    return this.handleWorkspaceFileDrop(externalFileOnDiskResources);
                }
            }
            return winjs_base_1.TPromise.as(false);
        };
        ResourcesDropHandler.prototype.handleDirtyEditorDrop = function (droppedDirtyEditor) {
            var _this = this;
            // Untitled: always ensure that we open a new untitled for each file we drop
            if (droppedDirtyEditor.resource.scheme === network_1.Schemas.untitled) {
                droppedDirtyEditor.resource = this.untitledEditorService.createOrGet().getResource();
            }
            // Return early if the resource is already dirty in target or opened already
            if (this.textFileService.isDirty(droppedDirtyEditor.resource) || this.groupService.getStacksModel().isOpen(droppedDirtyEditor.resource)) {
                return winjs_base_1.TPromise.as(false);
            }
            // Resolve the contents of the dropped dirty resource from source
            return this.backupFileService.resolveBackupContent(droppedDirtyEditor.backupResource).then(function (content) {
                // Set the contents of to the resource to the target
                return _this.backupFileService.backupResource(droppedDirtyEditor.resource, content.create(_this.getDefaultEOL()).createSnapshot(true));
            }).then(function () { return false; }, function () { return false; } /* ignore any error */);
        };
        ResourcesDropHandler.prototype.getDefaultEOL = function () {
            var eol = this.configurationService.getValue('files.eol');
            if (eol === '\r\n') {
                return model_1.DefaultEndOfLine.CRLF;
            }
            return model_1.DefaultEndOfLine.LF;
        };
        ResourcesDropHandler.prototype.handleWorkspaceFileDrop = function (fileOnDiskResources) {
            var _this = this;
            var workspaceResources = {
                workspaces: [],
                folders: []
            };
            return winjs_base_1.TPromise.join(fileOnDiskResources.map(function (fileOnDiskResource) {
                // Check for Workspace
                if (paths_1.extname(fileOnDiskResource.fsPath) === "." + workspaces_1.WORKSPACE_EXTENSION) {
                    workspaceResources.workspaces.push(fileOnDiskResource);
                    return void 0;
                }
                // Check for Folder
                return _this.fileService.resolveFile(fileOnDiskResource).then(function (stat) {
                    if (stat.isDirectory) {
                        workspaceResources.folders.push(stat.resource);
                    }
                }, function (error) { return void 0; });
            })).then(function (_) {
                var workspaces = workspaceResources.workspaces, folders = workspaceResources.folders;
                // Return early if no external resource is a folder or workspace
                if (workspaces.length === 0 && folders.length === 0) {
                    return false;
                }
                // Pass focus to window
                _this.windowService.focusWindow();
                var workspacesToOpen;
                // Open in separate windows if we drop workspaces or just one folder
                if (workspaces.length > 0 || folders.length === 1) {
                    workspacesToOpen = winjs_base_1.TPromise.as(workspaces.concat(folders).map(function (resources) { return resources.fsPath; }));
                }
                else if (folders.length > 1) {
                    workspacesToOpen = _this.workspacesService.createWorkspace(folders.map(function (folder) { return ({ uri: folder }); })).then(function (workspace) { return [workspace.configPath]; });
                }
                // Open
                workspacesToOpen.then(function (workspaces) {
                    _this.windowsService.openWindow(workspaces, { forceReuseWindow: true });
                });
                return true;
            });
        };
        ResourcesDropHandler = __decorate([
            __param(1, files_1.IFileService),
            __param(2, windows_1.IWindowsService),
            __param(3, windows_1.IWindowService),
            __param(4, workspaces_1.IWorkspacesService),
            __param(5, textfiles_1.ITextFileService),
            __param(6, backup_1.IBackupFileService),
            __param(7, groupService_1.IEditorGroupService),
            __param(8, untitledEditorService_1.IUntitledEditorService),
            __param(9, editorService_1.IWorkbenchEditorService),
            __param(10, configuration_1.IConfigurationService)
        ], ResourcesDropHandler);
        return ResourcesDropHandler;
    }());
    exports.ResourcesDropHandler = ResourcesDropHandler;
    var SimpleFileResourceDragAndDrop = /** @class */ (function (_super) {
        __extends(SimpleFileResourceDragAndDrop, _super);
        function SimpleFileResourceDragAndDrop(toResource, instantiationService) {
            var _this = _super.call(this) || this;
            _this.toResource = toResource;
            _this.instantiationService = instantiationService;
            return _this;
        }
        SimpleFileResourceDragAndDrop.prototype.getDragURI = function (tree, obj) {
            var resource = this.toResource(obj);
            if (resource) {
                return resource.toString();
            }
            return void 0;
        };
        SimpleFileResourceDragAndDrop.prototype.getDragLabel = function (tree, elements) {
            if (elements.length > 1) {
                return String(elements.length);
            }
            var resource = this.toResource(elements[0]);
            if (resource) {
                return resources_1.basenameOrAuthority(resource);
            }
            return void 0;
        };
        SimpleFileResourceDragAndDrop.prototype.onDragStart = function (tree, data, originalEvent) {
            var _this = this;
            // Apply some datatransfer types to allow for dragging the element outside of the application
            var resources = data.getData().map(function (source) { return _this.toResource(source); });
            if (resources) {
                this.instantiationService.invokeFunction(fillResourceDataTransfers, arrays_1.coalesce(resources), originalEvent);
            }
        };
        SimpleFileResourceDragAndDrop = __decorate([
            __param(1, instantiation_1.IInstantiationService)
        ], SimpleFileResourceDragAndDrop);
        return SimpleFileResourceDragAndDrop;
    }(treeDefaults_1.DefaultDragAndDrop));
    exports.SimpleFileResourceDragAndDrop = SimpleFileResourceDragAndDrop;
    function fillResourceDataTransfers(accessor, resources, event) {
        if (resources.length === 0) {
            return;
        }
        var sources = resources.map(function (obj) {
            if (uri_1.default.isUri(obj)) {
                return { resource: obj, isDirectory: false /* assume resource is not a directory */ };
            }
            return obj;
        });
        var firstSource = sources[0];
        // Text: allows to paste into text-capable areas
        var lineDelimiter = platform_1.isWindows ? '\r\n' : '\n';
        event.dataTransfer.setData(dnd_1.DataTransfers.TEXT, sources.map(function (source) { return source.resource.scheme === network_1.Schemas.file ? labels_1.getPathLabel(source.resource) : source.resource.toString(); }).join(lineDelimiter));
        // Download URL: enables support to drag a tab as file to desktop (only single file supported)
        if (firstSource.resource.scheme === network_1.Schemas.file) {
            event.dataTransfer.setData(dnd_1.DataTransfers.DOWNLOAD_URL, [mime_1.MIME_BINARY, paths_1.basename(firstSource.resource.fsPath), firstSource.resource.toString()].join(':'));
        }
        // Resource URLs: allows to drop multiple resources to a target in VS Code (not directories)
        var files = sources.filter(function (s) { return !s.isDirectory; });
        if (files.length) {
            event.dataTransfer.setData(dnd_1.DataTransfers.RESOURCES, JSON.stringify(files.map(function (f) { return f.resource.toString(); })));
        }
        // Editors: enables cross window DND of tabs into the editor area
        var textFileService = accessor.get(textfiles_1.ITextFileService);
        var backupFileService = accessor.get(backup_1.IBackupFileService);
        var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
        var draggedEditors = [];
        files.forEach(function (file) {
            // Try to find editor view state from the visible editors that match given resource
            var viewState;
            var editors = editorService.getVisibleEditors();
            for (var i = 0; i < editors.length; i++) {
                var editor = editors[i];
                var codeEditor = codeEditorService_1.getCodeEditor(editor);
                if (codeEditor) {
                    var model = codeEditor.getModel();
                    if (model && model.uri && model.uri.toString() === file.resource.toString()) {
                        viewState = codeEditor.saveViewState();
                        break;
                    }
                }
            }
            // Add as dragged editor
            draggedEditors.push({
                resource: file.resource.toString(),
                backupResource: textFileService.isDirty(file.resource) ? backupFileService.toBackupResource(file.resource).toString() : void 0,
                viewState: viewState
            });
        });
        if (draggedEditors.length) {
            event.dataTransfer.setData(exports.CodeDataTransfers.EDITORS, JSON.stringify(draggedEditors));
        }
    }
    exports.fillResourceDataTransfers = fillResourceDataTransfers;
    /**
     * A singleton to store transfer data during drag & drop operations that are only valid within the application.
     */
    var LocalSelectionTransfer = /** @class */ (function () {
        function LocalSelectionTransfer() {
            // protect against external instantiation
        }
        LocalSelectionTransfer.getInstance = function () {
            return LocalSelectionTransfer.INSTANCE;
        };
        LocalSelectionTransfer.prototype.hasData = function (proto) {
            return proto && proto === this.proto;
        };
        LocalSelectionTransfer.prototype.clearData = function () {
            this.proto = void 0;
            this.data = void 0;
        };
        LocalSelectionTransfer.prototype.getData = function (proto) {
            if (this.hasData(proto)) {
                return this.data;
            }
            return void 0;
        };
        LocalSelectionTransfer.prototype.setData = function (data, proto) {
            if (proto) {
                this.data = data;
                this.proto = proto;
            }
        };
        LocalSelectionTransfer.INSTANCE = new LocalSelectionTransfer();
        return LocalSelectionTransfer;
    }());
    exports.LocalSelectionTransfer = LocalSelectionTransfer;
});
