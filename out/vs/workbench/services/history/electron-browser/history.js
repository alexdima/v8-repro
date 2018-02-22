/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/errors", "vs/base/common/uri", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/editor/common/core/selection", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/platform/lifecycle/common/lifecycle", "vs/platform/registry/common/platform", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/workbench/services/group/common/groupService", "vs/platform/windows/common/windows", "vs/editor/browser/services/codeEditorService", "vs/platform/search/common/search", "vs/platform/instantiation/common/instantiation", "vs/workbench/electron-browser/resources", "vs/base/common/network"], function (require, exports, errors, uri_1, editor_1, editorService_1, files_1, selection_1, workspace_1, lifecycle_1, storage_1, lifecycle_2, platform_1, event_1, configuration_1, groupService_1, windows_1, codeEditorService_1, search_1, instantiation_1, resources_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Stores the selection & view state of an editor and allows to compare it to other selection states.
     */
    var TextEditorState = /** @class */ (function () {
        function TextEditorState(_editorInput, _selection) {
            this._editorInput = _editorInput;
            this._selection = _selection;
            this.textEditorSelection = selection_1.Selection.isISelection(_selection) ? {
                startLineNumber: _selection.startLineNumber,
                startColumn: _selection.startColumn
            } : void 0;
        }
        Object.defineProperty(TextEditorState.prototype, "editorInput", {
            get: function () {
                return this._editorInput;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextEditorState.prototype, "selection", {
            get: function () {
                return this.textEditorSelection;
            },
            enumerable: true,
            configurable: true
        });
        TextEditorState.prototype.justifiesNewPushState = function (other, event) {
            if (event && event.source === 'api') {
                return true; // always let API source win (e.g. "Go to definition" should add a history entry)
            }
            if (!this._editorInput.matches(other._editorInput)) {
                return true; // different editor inputs
            }
            if (!selection_1.Selection.isISelection(this._selection) || !selection_1.Selection.isISelection(other._selection)) {
                return true; // unknown selections
            }
            var thisLineNumber = Math.min(this._selection.selectionStartLineNumber, this._selection.positionLineNumber);
            var otherLineNumber = Math.min(other._selection.selectionStartLineNumber, other._selection.positionLineNumber);
            if (Math.abs(thisLineNumber - otherLineNumber) < TextEditorState.EDITOR_SELECTION_THRESHOLD) {
                return false; // ignore selection changes in the range of EditorState.EDITOR_SELECTION_THRESHOLD lines
            }
            return true;
        };
        TextEditorState.EDITOR_SELECTION_THRESHOLD = 10; // number of lines to move in editor to justify for new state
        return TextEditorState;
    }());
    exports.TextEditorState = TextEditorState;
    var HistoryService = /** @class */ (function () {
        function HistoryService(editorService, editorGroupService, contextService, storageService, configurationService, lifecycleService, fileService, windowService, instantiationService) {
            var _this = this;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.contextService = contextService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.lifecycleService = lifecycleService;
            this.fileService = fileService;
            this.windowService = windowService;
            this.instantiationService = instantiationService;
            this.toUnbind = [];
            this.activeEditorListeners = [];
            this.fileInputFactory = platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).getFileInputFactory();
            this.index = -1;
            this.lastIndex = -1;
            this.stack = [];
            this.recentlyClosedFiles = [];
            this.loaded = false;
            this.resourceFilter = instantiationService.createInstance(resources_1.ResourceGlobMatcher, function (root) { return _this.getExcludes(root); }, function (event) { return event.affectsConfiguration(files_1.FILES_EXCLUDE_CONFIG) || event.affectsConfiguration('search.exclude'); });
            this.registerListeners();
        }
        HistoryService.prototype.getExcludes = function (root) {
            var scope = root ? { resource: root } : void 0;
            return search_1.getExcludes(this.configurationService.getValue(scope));
        };
        HistoryService.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.editorGroupService.onEditorsChanged(function () { return _this.onEditorsChanged(); }));
            this.toUnbind.push(this.lifecycleService.onShutdown(function (reason) { return _this.saveHistory(); }));
            this.toUnbind.push(this.editorGroupService.onEditorOpenFail(function (editor) { return _this.remove(editor); }));
            this.toUnbind.push(this.editorGroupService.getStacksModel().onEditorClosed(function (event) { return _this.onEditorClosed(event); }));
            this.toUnbind.push(this.fileService.onFileChanges(function (e) { return _this.onFileChanges(e); }));
            this.toUnbind.push(this.resourceFilter.onExpressionChange(function () { return _this.handleExcludesChange(); }));
        };
        HistoryService.prototype.onEditorsChanged = function () {
            var _this = this;
            var activeEditor = this.editorService.getActiveEditor();
            if (this.lastActiveEditor && this.matchesEditor(this.lastActiveEditor, activeEditor)) {
                return; // return if the active editor is still the same
            }
            // Remember as last active editor (can be undefined if none opened)
            this.lastActiveEditor = activeEditor ? { editor: activeEditor.input, position: activeEditor.position } : void 0;
            // Dispose old listeners
            lifecycle_1.dispose(this.activeEditorListeners);
            this.activeEditorListeners = [];
            // Propagate to history
            this.handleActiveEditorChange(activeEditor);
            // Apply listener for selection changes if this is a text editor
            var control = codeEditorService_1.getCodeEditor(activeEditor);
            if (control) {
                // Debounce the event with a timeout of 0ms so that multiple calls to
                // editor.setSelection() are folded into one. We do not want to record
                // subsequent history navigations for such API calls.
                this.activeEditorListeners.push(event_1.debounceEvent(control.onDidChangeCursorPosition, function (last, event) { return event; }, 0)((function (event) {
                    _this.handleEditorSelectionChangeEvent(activeEditor, event);
                })));
            }
        };
        HistoryService.prototype.matchesEditor = function (identifier, editor) {
            if (!editor) {
                return false;
            }
            if (identifier.position !== editor.position) {
                return false;
            }
            return identifier.editor.matches(editor.input);
        };
        HistoryService.prototype.onFileChanges = function (e) {
            if (e.gotDeleted()) {
                this.remove(e); // remove from history files that got deleted or moved
            }
        };
        HistoryService.prototype.onEditorClosed = function (event) {
            // Track closing of editor to support to reopen closed editors (unless editor was replaced)
            if (!event.replaced) {
                var resource = event.editor ? event.editor.getResource() : void 0;
                var supportsReopen = resource && this.fileService.canHandleResource(resource); // we only support file'ish things to reopen
                if (supportsReopen) {
                    // Remove all inputs matching and add as last recently closed
                    this.removeFromRecentlyClosedFiles(event.editor);
                    this.recentlyClosedFiles.push({ resource: resource, index: event.index });
                    // Bounding
                    if (this.recentlyClosedFiles.length > HistoryService.MAX_RECENTLY_CLOSED_EDITORS) {
                        this.recentlyClosedFiles.shift();
                    }
                }
            }
        };
        HistoryService.prototype.reopenLastClosedEditor = function () {
            this.ensureHistoryLoaded();
            var stacks = this.editorGroupService.getStacksModel();
            var lastClosedFile = this.recentlyClosedFiles.pop();
            while (lastClosedFile && this.isFileOpened(lastClosedFile.resource, stacks.activeGroup)) {
                lastClosedFile = this.recentlyClosedFiles.pop(); // pop until we find a file that is not opened
            }
            if (lastClosedFile) {
                this.editorService.openEditor({ resource: lastClosedFile.resource, options: { pinned: true, index: lastClosedFile.index } });
            }
        };
        HistoryService.prototype.forward = function (acrossEditors) {
            if (this.stack.length > this.index + 1) {
                if (acrossEditors) {
                    this.doForwardAcrossEditors();
                }
                else {
                    this.doForwardInEditors();
                }
            }
        };
        HistoryService.prototype.doForwardInEditors = function () {
            this.setIndex(this.index + 1);
            this.navigate();
        };
        HistoryService.prototype.setIndex = function (value) {
            this.lastIndex = this.index;
            this.index = value;
        };
        HistoryService.prototype.doForwardAcrossEditors = function () {
            var currentIndex = this.index;
            var currentEntry = this.stack[this.index];
            // Find the next entry that does not match our current entry
            while (this.stack.length > currentIndex + 1) {
                currentIndex++;
                var previousEntry = this.stack[currentIndex];
                if (!this.matches(currentEntry.input, previousEntry.input)) {
                    this.setIndex(currentIndex);
                    this.navigate(true /* across editors */);
                    break;
                }
            }
        };
        HistoryService.prototype.back = function (acrossEditors) {
            if (this.index > 0) {
                if (acrossEditors) {
                    this.doBackAcrossEditors();
                }
                else {
                    this.doBackInEditors();
                }
            }
        };
        HistoryService.prototype.last = function () {
            if (this.lastIndex === -1) {
                this.back();
            }
            else {
                this.setIndex(this.lastIndex);
                this.navigate();
            }
        };
        HistoryService.prototype.doBackInEditors = function () {
            this.setIndex(this.index - 1);
            this.navigate();
        };
        HistoryService.prototype.doBackAcrossEditors = function () {
            var currentIndex = this.index;
            var currentEntry = this.stack[this.index];
            // Find the next previous entry that does not match our current entry
            while (currentIndex > 0) {
                currentIndex--;
                var previousEntry = this.stack[currentIndex];
                if (!this.matches(currentEntry.input, previousEntry.input)) {
                    this.setIndex(currentIndex);
                    this.navigate(true /* across editors */);
                    break;
                }
            }
        };
        HistoryService.prototype.clear = function () {
            this.ensureHistoryLoaded();
            this.index = -1;
            this.lastIndex = -1;
            this.stack.splice(0);
            this.history = [];
            this.recentlyClosedFiles = [];
        };
        HistoryService.prototype.navigate = function (acrossEditors) {
            var _this = this;
            var entry = this.stack[this.index];
            var options = {
                revealIfOpened: true // support to navigate across editor groups
            };
            // Unless we navigate across editors, support selection and
            // minimize scrolling by setting revealInCenterIfOutsideViewport
            if (entry.selection && !acrossEditors) {
                options.selection = entry.selection;
                options.revealInCenterIfOutsideViewport = true;
            }
            this.navigatingInStack = true;
            var openEditorPromise;
            if (entry.input instanceof editor_1.EditorInput) {
                openEditorPromise = this.editorService.openEditor(entry.input, options);
            }
            else {
                openEditorPromise = this.editorService.openEditor({ resource: entry.input.resource, options: options });
            }
            openEditorPromise.done(function () {
                _this.navigatingInStack = false;
            }, function (error) {
                _this.navigatingInStack = false;
                errors.onUnexpectedError(error);
            });
        };
        HistoryService.prototype.handleEditorSelectionChangeEvent = function (editor, event) {
            this.handleEditorEventInStack(editor, event);
        };
        HistoryService.prototype.handleActiveEditorChange = function (editor) {
            this.handleEditorEventInHistory(editor);
            this.handleEditorEventInStack(editor);
        };
        HistoryService.prototype.handleEditorEventInHistory = function (editor) {
            var _this = this;
            var input = editor ? editor.input : void 0;
            // Ensure we have at least a name to show and not configured to exclude input
            if (!input || !input.getName() || !this.include(input)) {
                return;
            }
            this.ensureHistoryLoaded();
            var historyInput = this.preferResourceInput(input);
            // Remove any existing entry and add to the beginning
            this.removeFromHistory(input);
            this.history.unshift(historyInput);
            // Respect max entries setting
            if (this.history.length > HistoryService.MAX_HISTORY_ITEMS) {
                this.history.pop();
            }
            // Remove this from the history unless the history input is a resource
            // that can easily be restored even when the input gets disposed
            if (historyInput instanceof editor_1.EditorInput) {
                event_1.once(historyInput.onDispose)(function () { return _this.removeFromHistory(input); });
            }
        };
        HistoryService.prototype.include = function (input) {
            if (input instanceof editor_1.EditorInput) {
                return true; // include any non files
            }
            var resourceInput = input;
            return !this.resourceFilter.matches(resourceInput.resource);
        };
        HistoryService.prototype.handleExcludesChange = function () {
            this.removeExcludedFromHistory();
        };
        HistoryService.prototype.remove = function (arg1) {
            this.removeFromHistory(arg1);
            this.removeFromStack(arg1);
            this.removeFromRecentlyClosedFiles(arg1);
            this.removeFromRecentlyOpened(arg1);
        };
        HistoryService.prototype.removeExcludedFromHistory = function () {
            var _this = this;
            this.ensureHistoryLoaded();
            this.history = this.history.filter(function (e) { return _this.include(e); });
        };
        HistoryService.prototype.removeFromHistory = function (arg1) {
            var _this = this;
            this.ensureHistoryLoaded();
            this.history = this.history.filter(function (e) { return !_this.matches(arg1, e); });
        };
        HistoryService.prototype.handleEditorEventInStack = function (editor, event) {
            var control = codeEditorService_1.getCodeEditor(editor);
            // treat editor changes that happen as part of stack navigation specially
            // we do not want to add a new stack entry as a matter of navigating the
            // stack but we need to keep our currentTextEditorState up to date with
            // the navigtion that occurs.
            if (this.navigatingInStack) {
                if (control && editor.input) {
                    this.currentTextEditorState = new TextEditorState(editor.input, control.getSelection());
                }
                else {
                    this.currentTextEditorState = null; // we navigated to a non text editor
                }
            }
            else {
                // navigation inside text editor
                if (control && editor.input) {
                    this.handleTextEditorEvent(editor, control, event);
                }
                else {
                    this.currentTextEditorState = null; // at this time we have no active text editor view state
                    if (editor && editor.input) {
                        this.handleNonTextEditorEvent(editor);
                    }
                }
            }
        };
        HistoryService.prototype.handleTextEditorEvent = function (editor, editorControl, event) {
            var stateCandidate = new TextEditorState(editor.input, editorControl.getSelection());
            // Add to stack if we dont have a current state or this new state justifies a push
            if (!this.currentTextEditorState || this.currentTextEditorState.justifiesNewPushState(stateCandidate, event)) {
                this.add(editor.input, stateCandidate.selection);
            }
            else {
                this.replace(editor.input, stateCandidate.selection);
            }
            // Update our current text editor state
            this.currentTextEditorState = stateCandidate;
        };
        HistoryService.prototype.handleNonTextEditorEvent = function (editor) {
            var currentStack = this.stack[this.index];
            if (currentStack && this.matches(editor.input, currentStack.input)) {
                return; // do not push same editor input again
            }
            this.add(editor.input);
        };
        HistoryService.prototype.add = function (input, selection) {
            if (!this.navigatingInStack) {
                this.addOrReplaceInStack(input, selection);
            }
        };
        HistoryService.prototype.replace = function (input, selection) {
            if (!this.navigatingInStack) {
                this.addOrReplaceInStack(input, selection, true /* force replace */);
            }
        };
        HistoryService.prototype.addOrReplaceInStack = function (input, selection, forceReplace) {
            var _this = this;
            // Overwrite an entry in the stack if we have a matching input that comes
            // with editor options to indicate that this entry is more specific. Also
            // prevent entries that have the exact same options. Finally, Overwrite
            // entries if we detect that the change came in very fast which indicates
            // that it was not coming in from a user change but rather rapid programmatic
            // changes. We just take the last of the changes to not cause too many entries
            // on the stack.
            // We can also be instructed to force replace the last entry.
            var replace = false;
            var currentEntry = this.stack[this.index];
            if (currentEntry) {
                if (forceReplace) {
                    replace = true; // replace if we are forced to
                }
                else if (this.matches(input, currentEntry.input) && this.sameSelection(currentEntry.selection, selection)) {
                    replace = true; // replace if the input is the same as the current one and the selection as well
                }
            }
            var stackInput = this.preferResourceInput(input);
            var entry = { input: stackInput, selection: selection, timestamp: Date.now() };
            // Replace at current position
            if (replace) {
                this.stack[this.index] = entry;
            }
            else {
                // If we are not at the end of history, we remove anything after
                if (this.stack.length > this.index + 1) {
                    this.stack = this.stack.slice(0, this.index + 1);
                }
                this.stack.splice(this.index + 1, 0, entry);
                // Check for limit
                if (this.stack.length > HistoryService.MAX_STACK_ITEMS) {
                    this.stack.shift(); // remove first and dispose
                    if (this.lastIndex >= 0) {
                        this.lastIndex--;
                    }
                }
                else {
                    this.setIndex(this.index + 1);
                }
            }
            // Remove this from the stack unless the stack input is a resource
            // that can easily be restored even when the input gets disposed
            if (stackInput instanceof editor_1.EditorInput) {
                event_1.once(stackInput.onDispose)(function () { return _this.removeFromStack(input); });
            }
        };
        HistoryService.prototype.preferResourceInput = function (input) {
            if (this.fileInputFactory.isFileInput(input)) {
                return { resource: input.getResource() };
            }
            return input;
        };
        HistoryService.prototype.sameSelection = function (selectionA, selectionB) {
            if (!selectionA && !selectionB) {
                return true;
            }
            if ((!selectionA && selectionB) || (selectionA && !selectionB)) {
                return false;
            }
            return selectionA.startLineNumber === selectionB.startLineNumber; // we consider the history entry same if we are on the same line
        };
        HistoryService.prototype.removeFromStack = function (arg1) {
            var _this = this;
            this.stack = this.stack.filter(function (e) { return !_this.matches(arg1, e.input); });
            this.index = this.stack.length - 1; // reset index
            this.lastIndex = -1;
        };
        HistoryService.prototype.removeFromRecentlyClosedFiles = function (arg1) {
            var _this = this;
            this.recentlyClosedFiles = this.recentlyClosedFiles.filter(function (e) { return !_this.matchesFile(e.resource, arg1); });
        };
        HistoryService.prototype.removeFromRecentlyOpened = function (arg1) {
            if (arg1 instanceof editor_1.EditorInput || arg1 instanceof files_1.FileChangesEvent) {
                return; // for now do not delete from file events since recently open are likely out of workspace files for which there are no delete events
            }
            var input = arg1;
            this.windowService.removeFromRecentlyOpened([input.resource.fsPath]);
        };
        HistoryService.prototype.isFileOpened = function (resource, group) {
            var _this = this;
            if (!group) {
                return false;
            }
            if (!group.contains(resource)) {
                return false; // fast check
            }
            return group.getEditors().some(function (e) { return _this.matchesFile(resource, e); });
        };
        HistoryService.prototype.matches = function (arg1, inputB) {
            if (arg1 instanceof files_1.FileChangesEvent) {
                if (inputB instanceof editor_1.EditorInput) {
                    return false; // we only support this for IResourceInput
                }
                var resourceInputB_1 = inputB;
                return arg1.contains(resourceInputB_1.resource, files_1.FileChangeType.DELETED);
            }
            if (arg1 instanceof editor_1.EditorInput && inputB instanceof editor_1.EditorInput) {
                return arg1.matches(inputB);
            }
            if (arg1 instanceof editor_1.EditorInput) {
                return this.matchesFile(inputB.resource, arg1);
            }
            if (inputB instanceof editor_1.EditorInput) {
                return this.matchesFile(arg1.resource, inputB);
            }
            var resourceInputA = arg1;
            var resourceInputB = inputB;
            return resourceInputA && resourceInputB && resourceInputA.resource.toString() === resourceInputB.resource.toString();
        };
        HistoryService.prototype.matchesFile = function (resource, arg2) {
            if (arg2 instanceof files_1.FileChangesEvent) {
                return arg2.contains(resource, files_1.FileChangeType.DELETED);
            }
            if (arg2 instanceof editor_1.EditorInput) {
                var inputResource = arg2.getResource();
                return inputResource && this.fileService.canHandleResource(inputResource) && inputResource.toString() === resource.toString();
            }
            var resourceInput = arg2;
            return resourceInput && resourceInput.resource.toString() === resource.toString();
        };
        HistoryService.prototype.getHistory = function () {
            this.ensureHistoryLoaded();
            return this.history.slice(0);
        };
        HistoryService.prototype.ensureHistoryLoaded = function () {
            if (!this.loaded) {
                this.loadHistory();
            }
            this.loaded = true;
        };
        HistoryService.prototype.saveHistory = function () {
            if (!this.history) {
                return; // nothing to save because history was not used
            }
            var registry = platform_1.Registry.as(editor_1.Extensions.EditorInputFactories);
            var entries = this.history.map(function (input) {
                // Editor input: try via factory
                if (input instanceof editor_1.EditorInput) {
                    var factory = registry.getEditorInputFactory(input.getTypeId());
                    if (factory) {
                        var deserialized = factory.serialize(input);
                        if (deserialized) {
                            return { editorInputJSON: { typeId: input.getTypeId(), deserialized: deserialized } };
                        }
                    }
                }
                else {
                    return { resourceJSON: input.resource.toJSON() };
                }
                return void 0;
            }).filter(function (serialized) { return !!serialized; });
            this.storageService.store(HistoryService.STORAGE_KEY, JSON.stringify(entries), storage_1.StorageScope.WORKSPACE);
        };
        HistoryService.prototype.loadHistory = function () {
            var _this = this;
            var entries = [];
            var entriesRaw = this.storageService.get(HistoryService.STORAGE_KEY, storage_1.StorageScope.WORKSPACE);
            if (entriesRaw) {
                entries = JSON.parse(entriesRaw).filter(function (entry) { return !!entry; });
            }
            var registry = platform_1.Registry.as(editor_1.Extensions.EditorInputFactories);
            this.history = entries.map(function (entry) {
                var serializedEditorHistoryEntry = entry;
                // File resource: via URI.revive()
                if (serializedEditorHistoryEntry.resourceJSON) {
                    return { resource: uri_1.default.revive(serializedEditorHistoryEntry.resourceJSON) };
                }
                // Editor input: via factory
                var editorInputJSON = serializedEditorHistoryEntry.editorInputJSON;
                if (editorInputJSON && editorInputJSON.deserialized) {
                    var factory = registry.getEditorInputFactory(editorInputJSON.typeId);
                    if (factory) {
                        var input_1 = factory.deserialize(_this.instantiationService, editorInputJSON.deserialized);
                        if (input_1) {
                            event_1.once(input_1.onDispose)(function () { return _this.removeFromHistory(input_1); }); // remove from history once disposed
                        }
                        return input_1;
                    }
                }
                return void 0;
            }).filter(function (input) { return !!input; });
        };
        HistoryService.prototype.getLastActiveWorkspaceRoot = function (schemeFilter) {
            // No Folder: return early
            var folders = this.contextService.getWorkspace().folders;
            if (folders.length === 0) {
                return void 0;
            }
            // Single Folder: return early
            if (folders.length === 1) {
                var resource = folders[0].uri;
                if (!schemeFilter || resource.scheme === schemeFilter) {
                    return resource;
                }
                return void 0;
            }
            // Multiple folders: find the last active one
            var history = this.getHistory();
            for (var i = 0; i < history.length; i++) {
                var input = history[i];
                if (input instanceof editor_1.EditorInput) {
                    continue;
                }
                var resourceInput = input;
                if (schemeFilter && resourceInput.resource.scheme !== schemeFilter) {
                    continue;
                }
                var resourceWorkspace = this.contextService.getWorkspaceFolder(resourceInput.resource);
                if (resourceWorkspace) {
                    return resourceWorkspace.uri;
                }
            }
            // fallback to first workspace matching scheme filter if any
            for (var i = 0; i < folders.length; i++) {
                var resource = folders[i].uri;
                if (!schemeFilter || resource.scheme === schemeFilter) {
                    return resource;
                }
            }
            return void 0;
        };
        HistoryService.prototype.getLastActiveFile = function () {
            var history = this.getHistory();
            for (var i = 0; i < history.length; i++) {
                var resource = void 0;
                var input = history[i];
                if (input instanceof editor_1.EditorInput) {
                    resource = editor_1.toResource(input, { filter: network_1.Schemas.file });
                }
                else {
                    resource = input.resource;
                }
                if (resource && resource.scheme === network_1.Schemas.file) {
                    return resource;
                }
            }
            return void 0;
        };
        HistoryService.prototype.dispose = function () {
            this.toUnbind = lifecycle_1.dispose(this.toUnbind);
        };
        HistoryService.STORAGE_KEY = 'history.entries';
        HistoryService.MAX_HISTORY_ITEMS = 200;
        HistoryService.MAX_STACK_ITEMS = 20;
        HistoryService.MAX_RECENTLY_CLOSED_EDITORS = 20;
        HistoryService = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, groupService_1.IEditorGroupService),
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, storage_1.IStorageService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, lifecycle_2.ILifecycleService),
            __param(6, files_1.IFileService),
            __param(7, windows_1.IWindowsService),
            __param(8, instantiation_1.IInstantiationService)
        ], HistoryService);
        return HistoryService;
    }());
    exports.HistoryService = HistoryService;
});
