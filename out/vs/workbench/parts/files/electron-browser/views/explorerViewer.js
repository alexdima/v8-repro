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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/browser/dom", "vs/base/common/uri", "vs/base/common/functional", "vs/base/common/paths", "vs/base/common/resources", "vs/base/common/errors", "vs/base/common/actions", "vs/base/common/comparers", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/platform", "vs/base/common/glob", "vs/workbench/browser/labels", "vs/base/common/lifecycle", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/base/common/map", "vs/workbench/parts/files/electron-browser/fileActions", "vs/base/parts/tree/browser/tree", "vs/base/parts/tree/browser/treeDnd", "vs/base/parts/tree/browser/treeDefaults", "vs/workbench/parts/files/common/explorerModel", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/part/common/partService", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuItemActionItem", "vs/workbench/services/backup/common/backup", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/windows/common/windows", "vs/workbench/services/workspace/common/workspaceEditing", "vs/workbench/browser/dnd", "path", "vs/base/common/resources", "vs/platform/list/browser/listService", "vs/platform/clipboard/common/clipboardService", "vs/base/browser/dnd", "vs/base/common/network"], function (require, exports, winjs_base_1, nls, lifecycle, objects, DOM, uri_1, functional_1, paths, resources, errors, actions_1, comparers, inputBox_1, platform_1, glob, labels_1, lifecycle_1, textfiles_1, files_1, map_1, fileActions_1, tree_1, treeDnd_1, treeDefaults_1, explorerModel_1, editorService_1, partService_1, workspace_1, configuration_1, contextkey_1, contextView_1, instantiation_1, message_1, progress_1, telemetry_1, actions_2, menuItemActionItem_1, backup_1, styler_1, themeService_1, windows_1, workspaceEditing_1, dnd_1, path_1, resources_1, listService_1, clipboardService_1, dnd_2, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileDataSource = /** @class */ (function () {
        function FileDataSource(progressService, messageService, fileService, partService) {
            this.progressService = progressService;
            this.messageService = messageService;
            this.fileService = fileService;
            this.partService = partService;
        }
        FileDataSource.prototype.getId = function (tree, stat) {
            if (stat instanceof explorerModel_1.Model) {
                return 'model';
            }
            return stat.root.resource.toString() + ":" + stat.getId();
        };
        FileDataSource.prototype.hasChildren = function (tree, stat) {
            return stat instanceof explorerModel_1.Model || (stat instanceof explorerModel_1.FileStat && stat.isDirectory);
        };
        FileDataSource.prototype.getChildren = function (tree, stat) {
            var _this = this;
            if (stat instanceof explorerModel_1.Model) {
                return winjs_base_1.TPromise.as(stat.roots);
            }
            // Return early if stat is already resolved
            if (stat.isDirectoryResolved) {
                return winjs_base_1.TPromise.as(stat.children);
            }
            else {
                // Resolve
                var promise = this.fileService.resolveFile(stat.resource, { resolveSingleChildDescendants: true }).then(function (dirStat) {
                    // Convert to view model
                    var modelDirStat = explorerModel_1.FileStat.create(dirStat, stat.root);
                    // Add children to folder
                    for (var i = 0; i < modelDirStat.children.length; i++) {
                        stat.addChild(modelDirStat.children[i]);
                    }
                    stat.isDirectoryResolved = true;
                    return stat.children;
                }, function (e) {
                    _this.messageService.show(message_1.Severity.Error, e);
                    return []; // we could not resolve any children because of an error
                });
                this.progressService.showWhile(promise, this.partService.isCreated() ? 800 : 3200 /* less ugly initial startup */);
                return promise;
            }
        };
        FileDataSource.prototype.getParent = function (tree, stat) {
            if (!stat) {
                return winjs_base_1.TPromise.as(null); // can be null if nothing selected in the tree
            }
            // Return if root reached
            if (tree.getInput() === stat) {
                return winjs_base_1.TPromise.as(null);
            }
            // Return if parent already resolved
            if (stat instanceof explorerModel_1.FileStat && stat.parent) {
                return winjs_base_1.TPromise.as(stat.parent);
            }
            // We never actually resolve the parent from the disk for performance reasons. It wouldnt make
            // any sense to resolve parent by parent with requests to walk up the chain. Instead, the explorer
            // makes sure to properly resolve a deep path to a specific file and merges the result with the model.
            return winjs_base_1.TPromise.as(null);
        };
        FileDataSource = __decorate([
            __param(0, progress_1.IProgressService),
            __param(1, message_1.IMessageService),
            __param(2, files_1.IFileService),
            __param(3, partService_1.IPartService)
        ], FileDataSource);
        return FileDataSource;
    }());
    exports.FileDataSource = FileDataSource;
    var FileViewletState = /** @class */ (function () {
        function FileViewletState() {
            this.editableStats = new map_1.ResourceMap();
        }
        FileViewletState.prototype.getEditableData = function (stat) {
            return this.editableStats.get(stat.resource);
        };
        FileViewletState.prototype.setEditable = function (stat, editableData) {
            if (editableData) {
                this.editableStats.set(stat.resource, editableData);
            }
        };
        FileViewletState.prototype.clearEditable = function (stat) {
            this.editableStats.delete(stat.resource);
        };
        return FileViewletState;
    }());
    exports.FileViewletState = FileViewletState;
    var ActionRunner = /** @class */ (function (_super) {
        __extends(ActionRunner, _super);
        function ActionRunner(state) {
            var _this = _super.call(this) || this;
            _this.viewletState = state;
            return _this;
        }
        ActionRunner.prototype.run = function (action, context) {
            return _super.prototype.run.call(this, action, { viewletState: this.viewletState });
        };
        return ActionRunner;
    }(actions_1.ActionRunner));
    exports.ActionRunner = ActionRunner;
    // Explorer Renderer
    var FileRenderer = /** @class */ (function () {
        function FileRenderer(state, contextViewService, instantiationService, themeService, configurationService) {
            var _this = this;
            this.contextViewService = contextViewService;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
            this.configurationService = configurationService;
            this.state = state;
            this.config = this.configurationService.getValue();
            this.configListener = this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration('explorer')) {
                    _this.config = _this.configurationService.getValue();
                }
            });
        }
        FileRenderer.prototype.dispose = function () {
            this.configListener.dispose();
        };
        FileRenderer.prototype.getHeight = function (tree, element) {
            return FileRenderer.ITEM_HEIGHT;
        };
        FileRenderer.prototype.getTemplateId = function (tree, element) {
            return FileRenderer.FILE_TEMPLATE_ID;
        };
        FileRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            templateData.label.dispose();
        };
        FileRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            var label = this.instantiationService.createInstance(labels_1.FileLabel, container, void 0);
            return { label: label, container: container };
        };
        FileRenderer.prototype.renderElement = function (tree, stat, templateId, templateData) {
            var editableData = this.state.getEditableData(stat);
            // File Label
            if (!editableData) {
                templateData.label.element.style.display = 'flex';
                var extraClasses = ['explorer-item'];
                templateData.label.setFile(stat.resource, {
                    hidePath: true,
                    fileKind: stat.isRoot ? files_1.FileKind.ROOT_FOLDER : stat.isDirectory ? files_1.FileKind.FOLDER : files_1.FileKind.FILE,
                    extraClasses: extraClasses,
                    fileDecorations: this.config.explorer.decorations
                });
            }
            else {
                templateData.label.element.style.display = 'none';
                this.renderInputBox(templateData.container, tree, stat, editableData);
            }
        };
        FileRenderer.prototype.renderInputBox = function (container, tree, stat, editableData) {
            // Use a file label only for the icon next to the input box
            var label = this.instantiationService.createInstance(labels_1.FileLabel, container, void 0);
            var extraClasses = ['explorer-item', 'explorer-item-edited'];
            var fileKind = stat.isRoot ? files_1.FileKind.ROOT_FOLDER : (stat.isDirectory || (stat instanceof explorerModel_1.NewStatPlaceholder && stat.isDirectoryPlaceholder())) ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            var labelOptions = { hidePath: true, hideLabel: true, fileKind: fileKind, extraClasses: extraClasses };
            label.setFile(stat.resource, labelOptions);
            // Input field for name
            var inputBox = new inputBox_1.InputBox(label.element, this.contextViewService, {
                validationOptions: {
                    validation: editableData.validator
                },
                ariaLabel: nls.localize('fileInputAriaLabel', "Type file name. Press Enter to confirm or Escape to cancel.")
            });
            var styler = styler_1.attachInputBoxStyler(inputBox, this.themeService);
            var parent = resources.dirname(stat.resource);
            inputBox.onDidChange(function (value) {
                label.setFile(parent.with({ path: paths.join(parent.path, value) }), labelOptions); // update label icon while typing!
            });
            var value = stat.name || '';
            var lastDot = value.lastIndexOf('.');
            inputBox.value = value;
            inputBox.select({ start: 0, end: lastDot > 0 && !stat.isDirectory ? lastDot : value.length });
            inputBox.focus();
            var done = functional_1.once(function (commit, blur) {
                tree.clearHighlight();
                if (commit && inputBox.value) {
                    editableData.action.run({ value: inputBox.value });
                }
                setTimeout(function () {
                    if (!blur) {
                        tree.DOMFocus();
                    }
                    lifecycle.dispose(toDispose);
                    container.removeChild(label.element);
                }, 0);
            });
            var toDispose = [
                inputBox,
                DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, function (e) {
                    if (e.equals(3 /* Enter */)) {
                        if (inputBox.validate()) {
                            done(true, false);
                        }
                    }
                    else if (e.equals(9 /* Escape */)) {
                        done(false, false);
                    }
                }),
                DOM.addDisposableListener(inputBox.inputElement, DOM.EventType.BLUR, function () {
                    done(inputBox.isInputValid(), true);
                }),
                label,
                styler
            ];
        };
        FileRenderer.ITEM_HEIGHT = 22;
        FileRenderer.FILE_TEMPLATE_ID = 'file';
        FileRenderer = __decorate([
            __param(1, contextView_1.IContextViewService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, themeService_1.IThemeService),
            __param(4, configuration_1.IConfigurationService)
        ], FileRenderer);
        return FileRenderer;
    }());
    exports.FileRenderer = FileRenderer;
    // Explorer Accessibility Provider
    var FileAccessibilityProvider = /** @class */ (function () {
        function FileAccessibilityProvider() {
        }
        FileAccessibilityProvider.prototype.getAriaLabel = function (tree, stat) {
            return nls.localize('filesExplorerViewerAriaLabel', "{0}, Files Explorer", stat.name);
        };
        return FileAccessibilityProvider;
    }());
    exports.FileAccessibilityProvider = FileAccessibilityProvider;
    // Explorer Controller
    var FileController = /** @class */ (function (_super) {
        __extends(FileController, _super);
        function FileController(editorService, contextMenuService, telemetryService, menuService, contextKeyService, clipboardService, configurationService) {
            var _this = _super.call(this, { clickBehavior: treeDefaults_1.ClickBehavior.ON_MOUSE_UP /* do not change to not break DND */ }, configurationService) || this;
            _this.editorService = editorService;
            _this.contextMenuService = contextMenuService;
            _this.telemetryService = telemetryService;
            _this.menuService = menuService;
            _this.clipboardService = clipboardService;
            _this.fileCopiedContextKey = fileActions_1.FileCopiedContext.bindTo(contextKeyService);
            _this.toDispose = [];
            return _this;
        }
        FileController.prototype.onLeftClick = function (tree, stat, event, origin) {
            if (origin === void 0) { origin = 'mouse'; }
            var payload = { origin: origin };
            var isDoubleClick = (origin === 'mouse' && event.detail === 2);
            // Handle Highlight Mode
            if (tree.getHighlight()) {
                // Cancel Event
                event.preventDefault();
                event.stopPropagation();
                tree.clearHighlight(payload);
                return false;
            }
            // Handle root
            if (stat instanceof explorerModel_1.Model) {
                tree.clearFocus(payload);
                tree.clearSelection(payload);
                return false;
            }
            // Cancel Event
            var isMouseDown = event && event.browserEvent && event.browserEvent.type === 'mousedown';
            if (!isMouseDown) {
                event.preventDefault(); // we cannot preventDefault onMouseDown because this would break DND otherwise
            }
            event.stopPropagation();
            // Set DOM focus
            tree.DOMFocus();
            if (stat instanceof explorerModel_1.NewStatPlaceholder) {
                return true;
            }
            // Allow to multiselect
            if ((tree.useAltAsMultipleSelectionModifier && event.altKey) || !tree.useAltAsMultipleSelectionModifier && (event.ctrlKey || event.metaKey)) {
                var selection = tree.getSelection();
                this.previousSelectionRangeStop = undefined;
                if (selection.indexOf(stat) >= 0) {
                    tree.setSelection(selection.filter(function (s) { return s !== stat; }));
                }
                else {
                    tree.setSelection(selection.concat(stat));
                    tree.setFocus(stat, payload);
                }
            }
            else if (event.shiftKey) {
                var focus_1 = tree.getFocus();
                if (focus_1) {
                    if (this.previousSelectionRangeStop) {
                        tree.deselectRange(stat, this.previousSelectionRangeStop);
                    }
                    tree.selectRange(focus_1, stat, payload);
                    this.previousSelectionRangeStop = stat;
                }
            }
            else {
                // Expand / Collapse
                if (isDoubleClick || this.openOnSingleClick || this.isClickOnTwistie(event)) {
                    tree.toggleExpansion(stat, event.altKey);
                    this.previousSelectionRangeStop = undefined;
                }
                var preserveFocus = !isDoubleClick;
                tree.setFocus(stat, payload);
                if (isDoubleClick) {
                    event.preventDefault(); // focus moves to editor, we need to prevent default
                }
                tree.setSelection([stat], payload);
                if (!stat.isDirectory && (isDoubleClick || this.openOnSingleClick)) {
                    var sideBySide = false;
                    if (event) {
                        sideBySide = tree.useAltAsMultipleSelectionModifier ? (event.ctrlKey || event.metaKey) : event.altKey;
                    }
                    this.openEditor(stat, { preserveFocus: preserveFocus, sideBySide: sideBySide, pinned: isDoubleClick });
                }
            }
            return true;
        };
        FileController.prototype.onContextMenu = function (tree, stat, event) {
            var _this = this;
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'input') {
                return false;
            }
            event.preventDefault();
            event.stopPropagation();
            tree.setFocus(stat);
            // update dynamic contexts
            this.fileCopiedContextKey.set(this.clipboardService.hasFiles());
            if (!this.contributedContextMenu) {
                this.contributedContextMenu = this.menuService.createMenu(actions_2.MenuId.ExplorerContext, tree.contextKeyService);
                this.toDispose.push(this.contributedContextMenu);
            }
            var anchor = { x: event.posx, y: event.posy };
            var selection = tree.getSelection();
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return anchor; },
                getActions: function () {
                    var actions = [];
                    menuItemActionItem_1.fillInActions(_this.contributedContextMenu, { arg: stat instanceof explorerModel_1.FileStat ? stat.resource : {}, shouldForwardArgs: true }, actions, _this.contextMenuService);
                    return winjs_base_1.TPromise.as(actions);
                },
                onHide: function (wasCancelled) {
                    if (wasCancelled) {
                        tree.DOMFocus();
                    }
                },
                getActionsContext: function () { return selection && selection.indexOf(stat) >= 0
                    ? selection.map(function (fs) { return fs.resource; })
                    : stat instanceof explorerModel_1.FileStat ? [stat.resource] : []; }
            });
            return true;
        };
        FileController.prototype.openEditor = function (stat, options) {
            if (stat && !stat.isDirectory) {
                /* __GDPR__
                    "workbenchActionExecuted" : {
                        "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'explorer' });
                this.editorService.openEditor({ resource: stat.resource, options: options }, options.sideBySide).done(null, errors.onUnexpectedError);
            }
        };
        FileController.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        FileController = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, contextView_1.IContextMenuService),
            __param(2, telemetry_1.ITelemetryService),
            __param(3, actions_2.IMenuService),
            __param(4, contextkey_1.IContextKeyService),
            __param(5, clipboardService_1.IClipboardService),
            __param(6, configuration_1.IConfigurationService)
        ], FileController);
        return FileController;
    }(listService_1.WorkbenchTreeController));
    exports.FileController = FileController;
    // Explorer Sorter
    var FileSorter = /** @class */ (function () {
        function FileSorter(configurationService, contextService) {
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.toDispose = [];
            this.updateSortOrder();
            this.registerListeners();
        }
        FileSorter.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.updateSortOrder(); }));
        };
        FileSorter.prototype.updateSortOrder = function () {
            this.sortOrder = this.configurationService.getValue('explorer.sortOrder') || 'default';
        };
        FileSorter.prototype.compare = function (tree, statA, statB) {
            // Do not sort roots
            if (statA.isRoot) {
                if (statB.isRoot) {
                    return this.contextService.getWorkspaceFolder(statA.resource).index - this.contextService.getWorkspaceFolder(statB.resource).index;
                }
                return -1;
            }
            if (statB.isRoot) {
                return 1;
            }
            // Sort Directories
            switch (this.sortOrder) {
                case 'type':
                    if (statA.isDirectory && !statB.isDirectory) {
                        return -1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return 1;
                    }
                    if (statA.isDirectory && statB.isDirectory) {
                        return comparers.compareFileNames(statA.name, statB.name);
                    }
                    break;
                case 'filesFirst':
                    if (statA.isDirectory && !statB.isDirectory) {
                        return 1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return -1;
                    }
                    break;
                case 'mixed':
                    break; // not sorting when "mixed" is on
                default:/* 'default', 'modified' */ 
                    if (statA.isDirectory && !statB.isDirectory) {
                        return -1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return 1;
                    }
                    break;
            }
            // Sort "New File/Folder" placeholders
            if (statA instanceof explorerModel_1.NewStatPlaceholder) {
                return -1;
            }
            if (statB instanceof explorerModel_1.NewStatPlaceholder) {
                return 1;
            }
            // Sort Files
            switch (this.sortOrder) {
                case 'type':
                    return comparers.compareFileExtensions(statA.name, statB.name);
                case 'modified':
                    if (statA.mtime !== statB.mtime) {
                        return statA.mtime < statB.mtime ? 1 : -1;
                    }
                    return comparers.compareFileNames(statA.name, statB.name);
                default:/* 'default', 'mixed', 'filesFirst' */ 
                    return comparers.compareFileNames(statA.name, statB.name);
            }
        };
        FileSorter.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        FileSorter = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, workspace_1.IWorkspaceContextService)
        ], FileSorter);
        return FileSorter;
    }());
    exports.FileSorter = FileSorter;
    // Explorer Filter
    var FileFilter = /** @class */ (function () {
        function FileFilter(contextService, configurationService) {
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.hiddenExpressionPerRoot = new Map();
            this.registerListeners();
        }
        FileFilter.prototype.registerListeners = function () {
            var _this = this;
            this.workspaceFolderChangeListener = this.contextService.onDidChangeWorkspaceFolders(function () { return _this.updateConfiguration(); });
        };
        FileFilter.prototype.updateConfiguration = function () {
            var _this = this;
            var needsRefresh = false;
            this.contextService.getWorkspace().folders.forEach(function (folder) {
                var configuration = _this.configurationService.getValue({ resource: folder.uri });
                var excludesConfig = (configuration && configuration.files && configuration.files.exclude) || Object.create(null);
                needsRefresh = needsRefresh || !objects.equals(_this.hiddenExpressionPerRoot.get(folder.uri.toString()), excludesConfig);
                _this.hiddenExpressionPerRoot.set(folder.uri.toString(), objects.deepClone(excludesConfig)); // do not keep the config, as it gets mutated under our hoods
            });
            return needsRefresh;
        };
        FileFilter.prototype.isVisible = function (tree, stat) {
            return this.doIsVisible(stat);
        };
        FileFilter.prototype.doIsVisible = function (stat) {
            if (stat instanceof explorerModel_1.NewStatPlaceholder || stat.isRoot) {
                return true; // always visible
            }
            // Workaround for O(N^2) complexity (https://github.com/Microsoft/vscode/issues/9962)
            var siblings = stat.parent && stat.parent.children && stat.parent.children;
            if (siblings && siblings.length > FileFilter.MAX_SIBLINGS_FILTER_THRESHOLD) {
                siblings = void 0;
            }
            // Hide those that match Hidden Patterns
            var siblingsFn = function () { return siblings && siblings.map(function (c) { return c.name; }); };
            var expression = this.hiddenExpressionPerRoot.get(stat.root.resource.toString()) || Object.create(null);
            if (glob.match(expression, paths.normalize(path_1.relative(stat.root.resource.fsPath, stat.resource.fsPath), true), siblingsFn)) {
                return false; // hidden through pattern
            }
            return true;
        };
        FileFilter.prototype.dispose = function () {
            this.workspaceFolderChangeListener = lifecycle_1.dispose(this.workspaceFolderChangeListener);
        };
        FileFilter.MAX_SIBLINGS_FILTER_THRESHOLD = 2000;
        FileFilter = __decorate([
            __param(0, workspace_1.IWorkspaceContextService),
            __param(1, configuration_1.IConfigurationService)
        ], FileFilter);
        return FileFilter;
    }());
    exports.FileFilter = FileFilter;
    // Explorer Drag And Drop Controller
    var FileDragAndDrop = /** @class */ (function (_super) {
        __extends(FileDragAndDrop, _super);
        function FileDragAndDrop(messageService, contextService, fileService, configurationService, instantiationService, textFileService, backupFileService, windowService, workspaceEditingService) {
            var _this = _super.call(this, function (stat) { return _this.statToResource(stat); }, instantiationService) || this;
            _this.messageService = messageService;
            _this.contextService = contextService;
            _this.fileService = fileService;
            _this.configurationService = configurationService;
            _this.textFileService = textFileService;
            _this.backupFileService = backupFileService;
            _this.windowService = windowService;
            _this.workspaceEditingService = workspaceEditingService;
            _this.toDispose = [];
            _this.updateDropEnablement();
            _this.registerListeners();
            return _this;
        }
        FileDragAndDrop.prototype.statToResource = function (stat) {
            if (stat.isDirectory) {
                return uri_1.default.from({ scheme: 'folder', path: stat.resource.path }); // indicates that we are dragging a folder
            }
            return stat.resource;
        };
        FileDragAndDrop.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.updateDropEnablement(); }));
        };
        FileDragAndDrop.prototype.updateDropEnablement = function () {
            this.dropEnabled = this.configurationService.getValue('explorer.enableDragAndDrop');
        };
        FileDragAndDrop.prototype.onDragStart = function (tree, data, originalEvent) {
            var sources = data.getData();
            if (sources && sources.length) {
                // When dragging folders, make sure to collapse them to free up some space
                sources.forEach(function (s) {
                    if (s.isDirectory && tree.isExpanded(s)) {
                        tree.collapse(s, false);
                    }
                });
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.instantiationService.invokeFunction(dnd_1.fillResourceDataTransfers, sources, originalEvent);
                // The only custom data transfer we set from the explorer is a file transfer
                // to be able to DND between multiple code file explorers across windows
                var fileResources = sources.filter(function (s) { return !s.isDirectory && s.resource.scheme === network_1.Schemas.file; }).map(function (r) { return r.resource.fsPath; });
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_1.CodeDataTransfers.FILES, JSON.stringify(fileResources));
                }
            }
        };
        FileDragAndDrop.prototype.onDragOver = function (tree, data, target, originalEvent) {
            if (!this.dropEnabled) {
                return tree_1.DRAG_OVER_REJECT;
            }
            var isCopy = originalEvent && ((originalEvent.ctrlKey && !platform_1.isMacintosh) || (originalEvent.altKey && platform_1.isMacintosh));
            var fromDesktop = data instanceof treeDnd_1.DesktopDragAndDropData;
            // Desktop DND
            if (fromDesktop) {
                var types = originalEvent.dataTransfer.types;
                var typesArray = [];
                for (var i = 0; i < types.length; i++) {
                    typesArray.push(types[i].toLowerCase()); // somehow the types are lowercase
                }
                if (typesArray.indexOf(dnd_2.DataTransfers.FILES.toLowerCase()) === -1 && typesArray.indexOf(dnd_1.CodeDataTransfers.FILES.toLowerCase()) === -1) {
                    return tree_1.DRAG_OVER_REJECT;
                }
            }
            else if (data instanceof treeDnd_1.ExternalElementsDragAndDropData) {
                return tree_1.DRAG_OVER_REJECT;
            }
            else {
                if (target instanceof explorerModel_1.Model) {
                    return tree_1.DRAG_OVER_REJECT;
                }
                var sources = data.getData();
                if (!Array.isArray(sources)) {
                    return tree_1.DRAG_OVER_REJECT;
                }
                if (sources.some(function (source) {
                    if (source instanceof explorerModel_1.NewStatPlaceholder) {
                        return true; // NewStatPlaceholders can not be moved
                    }
                    if (source.isRoot) {
                        return true; // Root folder can not be moved
                    }
                    if (source.resource.toString() === target.resource.toString()) {
                        return true; // Can not move anything onto itself
                    }
                    if (!isCopy && resources.dirname(source.resource).toString() === target.resource.toString()) {
                        return true; // Can not move a file to the same parent unless we copy
                    }
                    if (resources.isEqualOrParent(target.resource, source.resource, !platform_1.isLinux /* ignorecase */)) {
                        return true; // Can not move a parent folder into one of its children
                    }
                    return false;
                })) {
                    return tree_1.DRAG_OVER_REJECT;
                }
            }
            // All (target = model)
            if (target instanceof explorerModel_1.Model) {
                return this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE ? tree_1.DRAG_OVER_ACCEPT_BUBBLE_DOWN_COPY(false) : tree_1.DRAG_OVER_REJECT; // can only drop folders to workspace
            }
            else {
                if (target.isDirectory) {
                    return fromDesktop || isCopy ? tree_1.DRAG_OVER_ACCEPT_BUBBLE_DOWN_COPY(true) : tree_1.DRAG_OVER_ACCEPT_BUBBLE_DOWN(true);
                }
                if (this.contextService.getWorkspace().folders.every(function (folder) { return folder.uri.toString() !== target.resource.toString(); })) {
                    return fromDesktop || isCopy ? tree_1.DRAG_OVER_ACCEPT_BUBBLE_UP_COPY : tree_1.DRAG_OVER_ACCEPT_BUBBLE_UP;
                }
            }
            return tree_1.DRAG_OVER_REJECT;
        };
        FileDragAndDrop.prototype.drop = function (tree, data, target, originalEvent) {
            var promise = winjs_base_1.TPromise.as(null);
            // Desktop DND (Import file)
            if (data instanceof treeDnd_1.DesktopDragAndDropData) {
                promise = this.handleExternalDrop(tree, data, target, originalEvent);
            }
            else {
                if (target instanceof explorerModel_1.FileStat) {
                    promise = this.handleExplorerDrop(tree, data, target, originalEvent);
                }
            }
            promise.done(null, errors.onUnexpectedError);
        };
        FileDragAndDrop.prototype.handleExternalDrop = function (tree, data, target, originalEvent) {
            var _this = this;
            var droppedResources = dnd_1.extractResources(originalEvent.browserEvent, true);
            // Check for dropped external files to be folders
            return this.fileService.resolveFiles(droppedResources).then(function (result) {
                // Pass focus to window
                _this.windowService.focusWindow();
                // Handle folders by adding to workspace if we are in workspace context
                var folders = result.filter(function (r) { return r.success && r.stat.isDirectory; }).map(function (result) { return ({ uri: result.stat.resource }); });
                if (folders.length > 0) {
                    // If we are in no-workspace context, ask for confirmation to create a workspace
                    var confirmedPromise = winjs_base_1.TPromise.wrap(true);
                    if (_this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.WORKSPACE) {
                        confirmedPromise = _this.messageService.confirm({
                            message: folders.length > 1 ? nls.localize('dropFolders', "Do you want to add the folders to the workspace?") : nls.localize('dropFolder', "Do you want to add the folder to the workspace?"),
                            type: 'question',
                            primaryButton: folders.length > 1 ? nls.localize('addFolders', "&&Add Folders") : nls.localize('addFolder', "&&Add Folder")
                        });
                    }
                    return confirmedPromise.then(function (confirmed) {
                        if (confirmed) {
                            return _this.workspaceEditingService.addFolders(folders);
                        }
                        return void 0;
                    });
                }
                else if (target instanceof explorerModel_1.FileStat) {
                    var importAction = _this.instantiationService.createInstance(fileActions_1.ImportFileAction, tree, target, null);
                    return importAction.run(droppedResources.map(function (res) { return res.resource; }));
                }
                return void 0;
            });
        };
        FileDragAndDrop.prototype.handleExplorerDrop = function (tree, data, target, originalEvent) {
            var _this = this;
            var sources = resources_1.distinctParents(data.getData(), function (s) { return s.resource; });
            var isCopy = (originalEvent.ctrlKey && !platform_1.isMacintosh) || (originalEvent.altKey && platform_1.isMacintosh);
            var confirmPromise;
            // Handle confirm setting
            var confirmDragAndDrop = !isCopy && this.configurationService.getValue(FileDragAndDrop.CONFIRM_DND_SETTING_KEY);
            if (confirmDragAndDrop) {
                confirmPromise = this.messageService.confirmWithCheckbox({
                    message: sources.length > 1 ? message_1.getConfirmMessage(nls.localize('confirmMultiMove', "Are you sure you want to move the following {0} files?", sources.length), sources.map(function (s) { return s.resource; }))
                        : nls.localize('confirmMove', "Are you sure you want to move '{0}'?", sources[0].name),
                    checkbox: {
                        label: nls.localize('doNotAskAgain', "Do not ask me again")
                    },
                    type: 'question',
                    primaryButton: nls.localize({ key: 'moveButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Move")
                });
            }
            else {
                confirmPromise = winjs_base_1.TPromise.as({ confirmed: true });
            }
            return confirmPromise.then(function (confirmation) {
                // Check for confirmation checkbox
                var updateConfirmSettingsPromise = winjs_base_1.TPromise.as(void 0);
                if (confirmation.confirmed && confirmation.checkboxChecked === true) {
                    updateConfirmSettingsPromise = _this.configurationService.updateValue(FileDragAndDrop.CONFIRM_DND_SETTING_KEY, false, configuration_1.ConfigurationTarget.USER);
                }
                return updateConfirmSettingsPromise.then(function () {
                    if (confirmation.confirmed) {
                        return winjs_base_1.TPromise.join(sources.map(function (source) { return _this.doHandleExplorerDrop(tree, data, source, target, isCopy); })).then(function () { return void 0; });
                    }
                    return winjs_base_1.TPromise.as(void 0);
                });
            });
        };
        FileDragAndDrop.prototype.doHandleExplorerDrop = function (tree, data, source, target, isCopy) {
            var _this = this;
            return tree.expand(target).then(function () {
                // Reuse duplicate action if user copies
                if (isCopy) {
                    return _this.instantiationService.createInstance(fileActions_1.DuplicateFileAction, tree, source, target).run();
                }
                var dirtyMoved = [];
                // Success: load all files that are dirty again to restore their dirty contents
                // Error: discard any backups created during the process
                var onSuccess = function () { return winjs_base_1.TPromise.join(dirtyMoved.map(function (t) { return _this.textFileService.models.loadOrCreate(t); })); };
                var onError = function (error, showError) {
                    if (showError) {
                        _this.messageService.show(message_1.Severity.Error, error);
                    }
                    return winjs_base_1.TPromise.join(dirtyMoved.map(function (d) { return _this.backupFileService.discardResourceBackup(d); }));
                };
                // 1. check for dirty files that are being moved and backup to new target
                var dirty = _this.textFileService.getDirty().filter(function (d) { return resources.isEqualOrParent(d, source.resource, !platform_1.isLinux /* ignorecase */); });
                return winjs_base_1.TPromise.join(dirty.map(function (d) {
                    var moved;
                    // If the dirty file itself got moved, just reparent it to the target folder
                    if (source.resource.toString() === d.toString()) {
                        moved = target.resource.with({ path: paths.join(target.resource.path, source.name) });
                    }
                    else {
                        moved = target.resource.with({ path: paths.join(target.resource.path, d.path.substr(source.parent.resource.path.length + 1)) });
                    }
                    dirtyMoved.push(moved);
                    var model = _this.textFileService.models.get(d);
                    return _this.backupFileService.backupResource(moved, model.createSnapshot(), model.getVersionId());
                }))
                    .then(function () { return _this.textFileService.revertAll(dirty, { soft: true /* do not attempt to load content from disk */ }); })
                    .then(function () {
                    var targetResource = target.resource.with({ path: paths.join(target.resource.path, source.name) });
                    return _this.fileService.moveFile(source.resource, targetResource).then(null, function (error) {
                        // Conflict
                        if (error.fileOperationResult === files_1.FileOperationResult.FILE_MOVE_CONFLICT) {
                            var confirm_1 = {
                                message: nls.localize('confirmOverwriteMessage', "'{0}' already exists in the destination folder. Do you want to replace it?", source.name),
                                detail: nls.localize('irreversible', "This action is irreversible!"),
                                primaryButton: nls.localize({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
                                type: 'warning'
                            };
                            // Move with overwrite if the user confirms
                            return _this.messageService.confirm(confirm_1).then(function (confirmed) {
                                if (confirmed) {
                                    var targetDirty = _this.textFileService.getDirty().filter(function (d) { return resources.isEqualOrParent(d, targetResource, !platform_1.isLinux /* ignorecase */); });
                                    // Make sure to revert all dirty in target first to be able to overwrite properly
                                    return _this.textFileService.revertAll(targetDirty, { soft: true /* do not attempt to load content from disk */ }).then(function () {
                                        // Then continue to do the move operation
                                        return _this.fileService.moveFile(source.resource, targetResource, true).then(onSuccess, function (error) { return onError(error, true); });
                                    });
                                }
                                return onError();
                            });
                        }
                        return onError(error, true);
                    });
                })
                    .then(onSuccess, onError);
            }, errors.onUnexpectedError);
        };
        FileDragAndDrop.CONFIRM_DND_SETTING_KEY = 'explorer.confirmDragAndDrop';
        FileDragAndDrop = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, files_1.IFileService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, textfiles_1.ITextFileService),
            __param(6, backup_1.IBackupFileService),
            __param(7, windows_1.IWindowService),
            __param(8, workspaceEditing_1.IWorkspaceEditingService)
        ], FileDragAndDrop);
        return FileDragAndDrop;
    }(dnd_1.SimpleFileResourceDragAndDrop));
    exports.FileDragAndDrop = FileDragAndDrop;
});
