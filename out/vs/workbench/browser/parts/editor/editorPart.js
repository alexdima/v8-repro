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
define(["require", "exports", "vs/base/common/winjs.base", "vs/platform/registry/common/platform", "vs/base/browser/builder", "vs/nls", "vs/base/common/strings", "vs/base/common/arrays", "vs/base/common/types", "vs/base/common/errors", "vs/base/common/objects", "vs/editor/browser/services/codeEditorService", "vs/base/common/errorMessage", "vs/workbench/common/memento", "vs/workbench/browser/part", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editorGroupsControl", "vs/workbench/services/progress/browser/progressService", "vs/platform/configuration/common/configuration", "vs/workbench/services/part/common/partService", "vs/platform/editor/common/editor", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/message/common/message", "vs/platform/telemetry/common/telemetry", "vs/platform/progress/common/progress", "vs/workbench/common/editor/editorStacksModel", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/base/browser/dom", "vs/platform/environment/common/environment", "vs/base/common/paths", "vs/workbench/browser/editor", "vs/base/common/async", "vs/editor/browser/editorBrowser", "vs/base/common/types", "vs/css!./media/editorpart", "vs/workbench/browser/parts/editor/editor.contribution"], function (require, exports, winjs_base_1, platform_1, builder_1, nls, strings, arrays, types, errors, objects, codeEditorService_1, errorMessage_1, memento_1, part_1, editor_1, editorGroupsControl_1, progressService_1, configuration_1, partService_1, editor_2, storage_1, instantiation_1, serviceCollection_1, message_1, telemetry_1, progress_1, editorStacksModel_1, event_1, contextkey_1, themeService_1, colorRegistry_1, theme_1, dom_1, environment_1, paths_1, editor_3, async_1, editorBrowser_1, types_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProgressMonitor = /** @class */ (function () {
        function ProgressMonitor(_token, progressPromise) {
            this._token = _token;
            this.progressPromise = progressPromise;
        }
        Object.defineProperty(ProgressMonitor.prototype, "token", {
            get: function () {
                return this._token;
            },
            enumerable: true,
            configurable: true
        });
        ProgressMonitor.prototype.cancel = function () {
            this.progressPromise.cancel();
        };
        return ProgressMonitor;
    }());
    /**
     * The editor part is the container for editors in the workbench. Based on the editor input being opened, it asks the registered
     * editor for the given input to show the contents. The editor part supports up to 3 side-by-side editors.
     */
    var EditorPart = /** @class */ (function (_super) {
        __extends(EditorPart, _super);
        function EditorPart(id, restoreFromStorage, messageService, telemetryService, storageService, partService, configurationService, contextKeyService, instantiationService, themeService, environmentService) {
            var _this = _super.call(this, id, { hasTitle: false }, themeService) || this;
            _this.messageService = messageService;
            _this.telemetryService = telemetryService;
            _this.storageService = storageService;
            _this.partService = partService;
            _this.configurationService = configurationService;
            _this.instantiationService = instantiationService;
            _this.environmentService = environmentService;
            _this.onLayoutEmitter = new event_1.Emitter();
            _this.onLayout = _this.onLayoutEmitter.event;
            _this._onEditorsChanged = new async_1.ThrottledEmitter();
            _this._onEditorOpening = new event_1.Emitter();
            _this._onEditorGroupMoved = new event_1.Emitter();
            _this._onEditorOpenFail = new event_1.Emitter();
            _this._onGroupOrientationChanged = new event_1.Emitter();
            _this._onTabOptionsChanged = new event_1.Emitter();
            _this.visibleEditors = [];
            _this.editorOpenToken = arrays.fill(editor_2.POSITIONS.length, function () { return 0; });
            _this.instantiatedEditors = arrays.fill(editor_2.POSITIONS.length, function () { return []; });
            _this.pendingEditorInputsToClose = [];
            _this.pendingEditorInputCloseTimeout = null;
            _this.stacks = _this.instantiationService.createInstance(editorStacksModel_1.EditorStacksModel, restoreFromStorage);
            _this.textCompareEditorVisible = editor_1.TextCompareEditorVisible.bindTo(contextKeyService);
            var config = configurationService.getValue();
            if (config && config.workbench && config.workbench.editor) {
                var editorConfig = config.workbench.editor;
                _this.tabOptions = {
                    previewEditors: editorConfig.enablePreview,
                    showIcons: editorConfig.showIcons,
                    showTabs: editorConfig.showTabs,
                    tabCloseButton: editorConfig.tabCloseButton,
                    tabSizing: editorConfig.tabSizing,
                    labelFormat: editorConfig.labelFormat,
                    iconTheme: config.workbench.iconTheme
                };
                _this.revealIfOpen = editorConfig.revealIfOpen;
            }
            else {
                _this.tabOptions = {
                    previewEditors: true,
                    showIcons: false,
                    showTabs: true,
                    tabCloseButton: 'right',
                    tabSizing: 'fit',
                    labelFormat: 'default',
                    iconTheme: 'vs-seti'
                };
                _this.revealIfOpen = false;
            }
            _this.initStyles();
            _this.registerListeners();
            return _this;
        }
        EditorPart.prototype.initStyles = function () {
            // Letterpress Background when Empty
            dom_1.createCSSRule('.vs .monaco-workbench > .part.editor.empty', "background-image: url('" + paths_1.join(this.environmentService.appRoot, 'resources/letterpress.svg') + "')");
            dom_1.createCSSRule('.vs-dark .monaco-workbench > .part.editor.empty', "background-image: url('" + paths_1.join(this.environmentService.appRoot, 'resources/letterpress-dark.svg') + "')");
            dom_1.createCSSRule('.hc-black .monaco-workbench > .part.editor.empty', "background-image: url('" + paths_1.join(this.environmentService.appRoot, 'resources/letterpress-hc.svg') + "')");
        };
        EditorPart.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.stacks.onEditorDirty(function (identifier) { return _this.onEditorDirty(identifier); }));
            this.toUnbind.push(this.stacks.onEditorDisposed(function (identifier) { return _this.onEditorDisposed(identifier); }));
            this.toUnbind.push(this.stacks.onEditorOpened(function (identifier) { return _this.onEditorOpened(identifier); }));
            this.toUnbind.push(this.stacks.onEditorClosed(function (event) { return _this.onEditorClosed(event); }));
            this.toUnbind.push(this.stacks.onGroupOpened(function (event) { return _this.onEditorGroupOpenedOrClosed(); }));
            this.toUnbind.push(this.stacks.onGroupClosed(function (event) { return _this.onEditorGroupOpenedOrClosed(); }));
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationUpdated(e); }));
        };
        EditorPart.prototype.onEditorGroupOpenedOrClosed = function () {
            this.updateStyles();
        };
        EditorPart.prototype.onConfigurationUpdated = function (event) {
            var _this = this;
            if (event.affectsConfiguration('workbench.editor') || event.affectsConfiguration('workbench.iconTheme')) {
                var configuration = this.configurationService.getValue();
                if (configuration && configuration.workbench && configuration.workbench.editor) {
                    var editorConfig = configuration.workbench.editor;
                    // Pin all preview editors of the user chose to disable preview
                    var newPreviewEditors = editorConfig.enablePreview;
                    if (this.tabOptions.previewEditors !== newPreviewEditors && !newPreviewEditors) {
                        this.stacks.groups.forEach(function (group) {
                            if (group.previewEditor) {
                                _this.pinEditor(group, group.previewEditor);
                            }
                        });
                    }
                    var oldTabOptions = objects.deepClone(this.tabOptions);
                    this.tabOptions = {
                        previewEditors: newPreviewEditors,
                        showIcons: editorConfig.showIcons,
                        tabCloseButton: editorConfig.tabCloseButton,
                        tabSizing: editorConfig.tabSizing,
                        showTabs: this.forceHideTabs ? false : editorConfig.showTabs,
                        labelFormat: editorConfig.labelFormat,
                        iconTheme: configuration.workbench.iconTheme
                    };
                    if (!this.doNotFireTabOptionsChanged && !objects.equals(oldTabOptions, this.tabOptions)) {
                        this._onTabOptionsChanged.fire(this.tabOptions);
                    }
                    this.revealIfOpen = editorConfig.revealIfOpen;
                }
            }
        };
        EditorPart.prototype.onEditorDirty = function (identifier) {
            // we pin every editor that becomes dirty
            this.pinEditor(identifier.group, identifier.editor);
        };
        EditorPart.prototype.onEditorDisposed = function (identifier) {
            this.pendingEditorInputsToClose.push(identifier);
            this.startDelayedCloseEditorsFromInputDispose();
        };
        EditorPart.prototype.onEditorOpened = function (identifier) {
            /* __GDPR__
                "editorOpened" : {
                    "${include}": [
                        "${EditorTelemetryDescriptor}"
                    ]
                }
            */
            this.telemetryService.publicLog('editorOpened', identifier.editor.getTelemetryDescriptor());
        };
        EditorPart.prototype.onEditorClosed = function (event) {
            /* __GDPR__
                "editorClosed" : {
                    "${include}": [
                        "${EditorTelemetryDescriptor}"
                    ]
                }
            */
            this.telemetryService.publicLog('editorClosed', event.editor.getTelemetryDescriptor());
        };
        EditorPart.prototype.hideTabs = function (forceHide) {
            this.forceHideTabs = forceHide;
            var config = this.configurationService.getValue();
            this.tabOptions.showTabs = forceHide ? false : config && config.workbench && config.workbench.editor && config.workbench.editor.showTabs;
            this._onTabOptionsChanged.fire(this.tabOptions);
        };
        EditorPart.prototype.resizeGroup = function (position, groupSizeChange) {
            this.editorGroupsControl.resizeGroup(position, groupSizeChange);
        };
        Object.defineProperty(EditorPart.prototype, "onEditorsChanged", {
            get: function () {
                return this._onEditorsChanged.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorPart.prototype, "onEditorOpening", {
            get: function () {
                return this._onEditorOpening.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorPart.prototype, "onEditorGroupMoved", {
            get: function () {
                return this._onEditorGroupMoved.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorPart.prototype, "onEditorOpenFail", {
            get: function () {
                return this._onEditorOpenFail.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorPart.prototype, "onGroupOrientationChanged", {
            get: function () {
                return this._onGroupOrientationChanged.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorPart.prototype, "onTabOptionsChanged", {
            get: function () {
                return this._onTabOptionsChanged.event;
            },
            enumerable: true,
            configurable: true
        });
        EditorPart.prototype.getTabOptions = function () {
            return this.tabOptions;
        };
        EditorPart.prototype.openEditor = function (input, options, arg3, ratio) {
            if (!options) {
                options = null;
            }
            // Determine position to open editor in (one, two, three)
            var position = this.findPosition(input, options, arg3, ratio);
            // Some conditions under which we prevent the request
            if (!input || // no input
                position === null || // invalid position
                !this.editorGroupsControl || // too early
                this.editorGroupsControl.isDragging() // pending editor DND
            ) {
                return winjs_base_1.TPromise.wrap(null);
            }
            // Editor opening event (can be prevented and overridden)
            var event = new editor_1.EditorOpeningEvent(input, options, position);
            this._onEditorOpening.fire(event);
            var prevented = event.isPrevented();
            if (prevented) {
                return prevented();
            }
            // Open through UI
            return this.doOpenEditor(position, input, options, ratio);
        };
        EditorPart.prototype.doOpenEditor = function (position, input, options, ratio) {
            var _this = this;
            // We need an editor descriptor for the input
            var descriptor = platform_1.Registry.as(editor_3.Extensions.Editors).getEditor(input);
            if (!descriptor) {
                return winjs_base_1.TPromise.wrapError(new Error(strings.format('Can not find a registered editor for the input {0}', input)));
            }
            // Update stacks: We do this early on before the UI is there because we want our stacks model to have
            // a consistent view of the editor world and updating it later async after the UI is there will cause
            // issues (e.g. when a closeEditor call is made that expects the openEditor call to have updated the
            // stacks model).
            // This can however cause a race condition where the stacks model indicates the opened editor is there
            // while the UI is not yet ready. Clients have to deal with this fact and we have to make sure that the
            // stacks model gets updated if any of the UI updating fails with an error.
            var _a = this.ensureGroup(position, !options || !options.preserveFocus), group = _a[0], newGroupOpened = _a[1];
            var pinned = !this.tabOptions.previewEditors || (options && (options.pinned || typeof options.index === 'number')) || input.isDirty();
            var active = (group.count === 0) || !options || !options.inactive;
            group.openEditor(input, { active: active, pinned: pinned, index: options && options.index });
            // Return early if the editor is to be open inactive and there are other editors in this group to show
            if (!active) {
                return winjs_base_1.TPromise.wrap(null);
            }
            // Progress Monitor & Ref Counting
            this.editorOpenToken[position]++;
            var editorOpenToken = this.editorOpenToken[position];
            var monitor = new ProgressMonitor(editorOpenToken, winjs_base_1.TPromise.timeout(this.partService.isCreated() ? 800 : 3200 /* less ugly initial startup */).then(function () {
                var position = _this.stacks.positionOfGroup(group); // might have changed due to a rochade meanwhile
                if (editorOpenToken === _this.editorOpenToken[position]) {
                    _this.editorGroupsControl.updateProgress(position, editorGroupsControl_1.ProgressState.INFINITE);
                }
            }));
            // Show editor
            var editor = this.doShowEditor(group, descriptor, input, options, ratio, monitor);
            if (!editor) {
                return winjs_base_1.TPromise.wrap(null); // canceled or other error
            }
            // Set input to editor
            var inputPromise = this.doSetInput(group, editor, input, options, monitor);
            // A new active group got opened. Since this involves updating the title area controls to show
            // the new editor and actions we trigger a direct update of title controls from here to avoid
            // some UI flickering if we rely on the event handlers that all use schedulers.
            // The reason we can trigger this now is that after the input is set to the editor group, the
            // resource context is updated and the correct number of actions will be resolved from the title
            // area.
            if (newGroupOpened && this.stacks.isActive(group)) {
                this.editorGroupsControl.updateTitleAreas(true /* refresh new active group */);
            }
            return inputPromise;
        };
        EditorPart.prototype.doShowEditor = function (group, descriptor, input, options, ratio, monitor) {
            var position = this.stacks.positionOfGroup(group);
            var editorAtPosition = this.visibleEditors[position];
            // Return early if the currently visible editor can handle the input
            if (editorAtPosition && descriptor.describes(editorAtPosition)) {
                return editorAtPosition;
            }
            // Hide active one first
            if (editorAtPosition) {
                this.doHideEditor(editorAtPosition, position, false);
            }
            // Create Editor
            var editor = this.doCreateEditor(group, descriptor, monitor);
            position = this.stacks.positionOfGroup(group); // might have changed due to a rochade meanwhile
            // Make sure that the user meanwhile did not open another editor or something went wrong
            if (!editor || !this.visibleEditors[position] || editor.getId() !== this.visibleEditors[position].getId()) {
                monitor.cancel();
                return null;
            }
            // Show in side by side control
            this.editorGroupsControl.show(editor, position, options && options.preserveFocus, ratio);
            // Indicate to editor that it is now visible
            editor.setVisible(true, position);
            // Update text compare editor visible context
            this.updateTextCompareEditorVisible();
            // Make sure the editor is layed out
            this.editorGroupsControl.layout(position);
            return editor;
        };
        EditorPart.prototype.doCreateEditor = function (group, descriptor, monitor) {
            // Instantiate editor
            var editor = this.doInstantiateEditor(group, descriptor);
            var position = this.stacks.positionOfGroup(group); // might have changed due to a rochade meanwhile
            // Make sure that the user meanwhile did not open another editor
            if (monitor.token !== this.editorOpenToken[position]) {
                monitor.cancel();
                return null;
            }
            // Remember Editor at position
            this.visibleEditors[position] = editor;
            // Create editor as needed
            if (!editor.getContainer()) {
                editor.create(builder_1.$().div({
                    'class': 'editor-container',
                    'role': 'tabpanel',
                    id: descriptor.getId()
                }));
            }
            return editor;
        };
        EditorPart.prototype.doInstantiateEditor = function (group, descriptor) {
            var position = this.stacks.positionOfGroup(group);
            // Return early if already instantiated
            var instantiatedEditor = this.instantiatedEditors[position].filter(function (e) { return descriptor.describes(e); })[0];
            if (instantiatedEditor) {
                return instantiatedEditor;
            }
            // Otherwise instantiate
            var progressService = this.instantiationService.createInstance(progressService_1.WorkbenchProgressService, this.editorGroupsControl.getProgressBar(position), descriptor.getId(), true);
            var editorInstantiationService = this.editorGroupsControl.getInstantiationService(position).createChild(new serviceCollection_1.ServiceCollection([progress_1.IProgressService, progressService]));
            var editor = descriptor.instantiate(editorInstantiationService);
            this.instantiatedEditors[position].push(editor);
            return editor;
        };
        EditorPart.prototype.doSetInput = function (group, editor, input, options, monitor) {
            var _this = this;
            // Emit Input-Changed Event as appropiate
            var previousInput = editor.input;
            var inputChanged = (!previousInput || !previousInput.matches(input) || (options && options.forceOpen));
            // Call into Editor
            return editor.setInput(input, options).then(function () {
                // Stop loading promise if any
                monitor.cancel();
                var position = _this.stacks.positionOfGroup(group); // might have changed due to a rochade meanwhile
                if (position === -1) {
                    return null; // in theory a call to editor.setInput() could have resulted in the editor being closed due to an error, so we guard against it here
                }
                // Focus (unless prevented)
                var focus = !options || !options.preserveFocus;
                if (focus) {
                    editor.focus();
                }
                // Progress Done
                _this.editorGroupsControl.updateProgress(position, editorGroupsControl_1.ProgressState.DONE);
                // Emit Change Event (if input changed)
                if (inputChanged) {
                    _this._onEditorsChanged.fire();
                }
                // Fullfill promise with Editor that is being used
                return editor;
            }, function (e) {
                _this.doHandleSetInputError(e, group, editor, input, options, monitor);
                return null;
            });
        };
        EditorPart.prototype.doHandleSetInputError = function (e, group, editor, input, options, monitor) {
            var position = this.stacks.positionOfGroup(group);
            // Stop loading promise if any
            monitor.cancel();
            // Report error only if this was not us restoring previous error state
            if (this.partService.isCreated() && !errors.isPromiseCanceledError(e)) {
                var errorMessage = nls.localize('editorOpenError', "Unable to open '{0}': {1}.", input.getName(), errorMessage_1.toErrorMessage(e));
                var error = void 0;
                if (e && e.actions && e.actions.length) {
                    error = errors.create(errorMessage, { actions: e.actions }); // Support error actions from thrower
                }
                else {
                    error = errorMessage;
                }
                this.messageService.show(message_1.Severity.Error, types.isString(error) ? new Error(error) : error);
            }
            this.editorGroupsControl.updateProgress(position, editorGroupsControl_1.ProgressState.DONE);
            // Event
            this._onEditorOpenFail.fire(input);
            // Recover by closing the active editor (if the input is still the active one)
            if (group.activeEditor === input) {
                this.doCloseActiveEditor(group, !(options && options.preserveFocus) /* still preserve focus as needed */);
            }
        };
        EditorPart.prototype.closeEditor = function (position, input) {
            var _this = this;
            var group = this.stacks.groupAt(position);
            if (!group) {
                return winjs_base_1.TPromise.wrap(null);
            }
            // Check for dirty and veto
            return this.handleDirty([{ group: group, editor: input }], true /* ignore if opened in other group */).then(function (veto) {
                if (veto) {
                    return;
                }
                // Do close
                _this.doCloseEditor(group, input);
            });
        };
        EditorPart.prototype.doCloseEditor = function (group, input, focusNext) {
            if (focusNext === void 0) { focusNext = this.stacks.isActive(group); }
            // Closing the active editor of the group is a bit more work
            if (group.activeEditor && group.activeEditor.matches(input)) {
                this.doCloseActiveEditor(group, focusNext);
            }
            else {
                this.doCloseInactiveEditor(group, input);
            }
        };
        EditorPart.prototype.doCloseActiveEditor = function (group, focusNext) {
            if (focusNext === void 0) { focusNext = true; }
            var position = this.stacks.positionOfGroup(group);
            // Update stacks model
            group.closeEditor(group.activeEditor);
            // Close group is this is the last editor in group
            if (group.count === 0) {
                this.doCloseGroup(group, focusNext);
            }
            else {
                this.openEditor(group.activeEditor, !focusNext ? editor_1.EditorOptions.create({ preserveFocus: true }) : null, position).done(null, errors.onUnexpectedError);
            }
        };
        EditorPart.prototype.doCloseInactiveEditor = function (group, input) {
            // Closing inactive editor is just a model update
            group.closeEditor(input);
        };
        EditorPart.prototype.doCloseGroup = function (group, focusNext) {
            var _this = this;
            if (focusNext === void 0) { focusNext = true; }
            var position = this.stacks.positionOfGroup(group);
            // Update stacks model
            this.modifyGroups(function () { return _this.stacks.closeGroup(group); });
            // Hide Editor if there is one
            var editor = this.visibleEditors[position];
            if (editor) {
                this.doHideEditor(editor, position, true);
            }
            // Emit Change Event
            this._onEditorsChanged.fire();
            // Focus next group if we have an active one left
            var currentActiveGroup = this.stacks.activeGroup;
            if (currentActiveGroup) {
                if (focusNext) {
                    this.focusGroup(currentActiveGroup);
                }
                else {
                    this.activateGroup(currentActiveGroup);
                }
                // Explicitly trigger the focus changed handler because the side by side control will not trigger it unless
                // the user is actively changing focus with the mouse from left/top to right/bottom.
                this.onGroupFocusChanged();
                // Update title area sync to avoid some flickering with actions
                this.editorGroupsControl.updateTitleAreas();
            }
        };
        EditorPart.prototype.doHideEditor = function (editor, position, layoutAndRochade) {
            // Hide in side by side control
            var rochade = this.editorGroupsControl.hide(editor, position, layoutAndRochade);
            // Clear any running Progress
            this.editorGroupsControl.updateProgress(position, editorGroupsControl_1.ProgressState.STOP);
            // Indicate to Editor
            editor.clearInput();
            editor.setVisible(false);
            // Update text compare editor visible context
            this.updateTextCompareEditorVisible();
            // Clear active editor
            this.visibleEditors[position] = null;
            // Rochade as needed
            this.rochade(rochade);
            // Emit Editor move event
            if (rochade !== editorGroupsControl_1.Rochade.NONE) {
                this._onEditorGroupMoved.fire();
            }
        };
        EditorPart.prototype.updateTextCompareEditorVisible = function () {
            this.textCompareEditorVisible.set(this.visibleEditors.some(function (e) { return e && e.isVisible() && e.getId() === editor_1.TEXT_DIFF_EDITOR_ID; }));
        };
        EditorPart.prototype.closeEditors = function (positionsOrEditors, filterOrEditors) {
            // First check for specific position to close
            if (typeof positionsOrEditors === 'number') {
                return this.doCloseEditorsAtPosition(positionsOrEditors, filterOrEditors);
            }
            // Then check for array of positions to close
            if (Array.isArray(positionsOrEditors) || types_1.isUndefinedOrNull(positionsOrEditors)) {
                return this.doCloseAllEditorsAtPositions(positionsOrEditors);
            }
            // Finally, close specific editors at multiple positions
            return this.doCloseEditorsAtPositions(positionsOrEditors);
        };
        EditorPart.prototype.doCloseEditorsAtPositions = function (editors) {
            var _this = this;
            // Extract editors to close for veto
            var editorsToClose = [];
            var groupsWithEditorsToClose = 0;
            editor_2.POSITIONS.forEach(function (position) {
                var details = (position === editor_2.Position.ONE) ? editors.positionOne : (position === editor_2.Position.TWO) ? editors.positionTwo : editors.positionThree;
                if (details && _this.stacks.groupAt(position)) {
                    groupsWithEditorsToClose++;
                    editorsToClose.push.apply(editorsToClose, _this.extractCloseEditorDetails(position, details).editorsToClose);
                }
            });
            // Check for dirty and veto
            var ignoreDirtyIfOpenedInOtherGroup = (groupsWithEditorsToClose === 1);
            return this.handleDirty(editorsToClose, ignoreDirtyIfOpenedInOtherGroup).then(function (veto) {
                if (veto) {
                    return void 0;
                }
                // Close by positions starting from last to first to prevent issues when
                // editor groups close and thus move other editors around that are still open.
                [editor_2.Position.THREE, editor_2.Position.TWO, editor_2.Position.ONE].forEach(function (position) {
                    var details = (position === editor_2.Position.ONE) ? editors.positionOne : (position === editor_2.Position.TWO) ? editors.positionTwo : editors.positionThree;
                    if (details && _this.stacks.groupAt(position)) {
                        var _a = _this.extractCloseEditorDetails(position, details), group = _a.group, editorsToClose_1 = _a.editorsToClose, filter = _a.filter;
                        // Close with filter
                        if (filter) {
                            _this.doCloseEditorsWithFilter(group, filter);
                        }
                        else {
                            _this.doCloseEditors(group, editorsToClose_1.map(function (e) { return e.editor; }));
                        }
                        return void 0;
                    }
                });
            });
        };
        EditorPart.prototype.doCloseAllEditorsAtPositions = function (positions) {
            var _this = this;
            var groups = this.stacks.groups.reverse(); // start from the end to prevent layout to happen through rochade
            // Remove positions that are not being asked for if provided
            if (Array.isArray(positions)) {
                groups = groups.filter(function (group) { return positions.indexOf(_this.stacks.positionOfGroup(group)) >= 0; });
            }
            // Check for dirty and veto
            var ignoreDirtyIfOpenedInOtherGroup = (groups.length === 1);
            return this.handleDirty(arrays.flatten(groups.map(function (group) { return group.getEditors(true /* in MRU order */).map(function (editor) { return ({ group: group, editor: editor }); }); })), ignoreDirtyIfOpenedInOtherGroup).then(function (veto) {
                if (veto) {
                    return;
                }
                groups.forEach(function (group) { return _this.doCloseAllEditorsInGroup(group); });
            });
        };
        EditorPart.prototype.doCloseAllEditorsInGroup = function (group) {
            // Update stacks model: remove all non active editors first to prevent opening the next editor in group
            group.closeEditors(group.activeEditor);
            // Now close active editor in group which will close the group
            this.doCloseActiveEditor(group);
        };
        EditorPart.prototype.doCloseEditorsAtPosition = function (position, filterOrEditors) {
            var _this = this;
            var closeEditorsDetails = this.extractCloseEditorDetails(position, filterOrEditors);
            if (!closeEditorsDetails) {
                return winjs_base_1.TPromise.wrap(void 0);
            }
            var group = closeEditorsDetails.group, editorsToClose = closeEditorsDetails.editorsToClose, filter = closeEditorsDetails.filter;
            // Check for dirty and veto
            return this.handleDirty(editorsToClose, true /* ignore if opened in other group */).then(function (veto) {
                if (veto) {
                    return void 0;
                }
                // Close with filter
                if (filter) {
                    _this.doCloseEditorsWithFilter(group, filter);
                }
                else {
                    _this.doCloseEditors(group, editorsToClose.map(function (e) { return e.editor; }));
                }
                return void 0;
            });
        };
        EditorPart.prototype.extractCloseEditorDetails = function (position, filterOrEditors) {
            var group = this.stacks.groupAt(position);
            if (!group) {
                return void 0;
            }
            var editorsToClose;
            var filter;
            // Close: Specific Editors
            if (Array.isArray(filterOrEditors)) {
                editorsToClose = filterOrEditors;
            }
            else {
                editorsToClose = group.getEditors(true /* in MRU order */);
                filter = filterOrEditors || Object.create(null);
                // Filter: unmodified only
                if (filter.unmodifiedOnly) {
                    editorsToClose = editorsToClose.filter(function (e) { return !e.isDirty(); });
                }
                else if (!types.isUndefinedOrNull(filter.direction)) {
                    editorsToClose = (filter.direction === editor_2.Direction.LEFT) ? editorsToClose.slice(0, group.indexOf(filter.except)) : editorsToClose.slice(group.indexOf(filter.except) + 1);
                }
                else if (filter.except) {
                    editorsToClose = editorsToClose.filter(function (e) { return !e.matches(filter.except); });
                }
            }
            return { group: group, editorsToClose: editorsToClose.map(function (editor) { return ({ editor: editor, group: group }); }), filter: filter };
        };
        EditorPart.prototype.doCloseEditors = function (group, editors) {
            var _this = this;
            // Close all editors in group
            if (editors.length === group.count) {
                this.doCloseAllEditorsInGroup(group);
            }
            else {
                // Editors to close are not active, so we can just close them
                if (!editors.some(function (editor) { return group.activeEditor.matches(editor); })) {
                    editors.forEach(function (editor) { return _this.doCloseInactiveEditor(group, editor); });
                }
                else {
                    var firstEditorToKeep = group.getEditors(true).filter(function (editorInGroup) { return !editors.some(function (editor) { return editor.matches(editorInGroup); }); })[0];
                    this.openEditor(firstEditorToKeep, null, this.stacks.positionOfGroup(group)).done(function () {
                        editors.forEach(function (editor) { return _this.doCloseInactiveEditor(group, editor); });
                    }, errors.onUnexpectedError);
                }
            }
        };
        EditorPart.prototype.doCloseEditorsWithFilter = function (group, filter) {
            var _this = this;
            // Close all editors if there is no editor to except and
            // we either are not only closing unmodified editors or
            // there are no dirty editors.
            var closeAllEditors = false;
            if (!filter.except) {
                if (!filter.unmodifiedOnly) {
                    closeAllEditors = true;
                }
                else {
                    closeAllEditors = !group.getEditors().some(function (e) { return e.isDirty(); });
                }
            }
            // Close all editors in group
            if (closeAllEditors) {
                this.doCloseAllEditorsInGroup(group);
            }
            else if (filter.unmodifiedOnly) {
                // We can just close all unmodified editors around the currently active dirty one
                if (group.activeEditor.isDirty()) {
                    group.getEditors().filter(function (editor) { return !editor.isDirty() && !editor.matches(filter.except); }).forEach(function (editor) { return _this.doCloseInactiveEditor(group, editor); });
                }
                else {
                    var firstDirtyEditor = group.getEditors(true).filter(function (editor) { return editor.isDirty(); })[0];
                    this.openEditor(firstDirtyEditor, null, this.stacks.positionOfGroup(group)).done(function () {
                        _this.doCloseEditorsWithFilter(group, filter);
                    }, errors.onUnexpectedError);
                }
            }
            else if (filter.except && filter.except.matches(group.activeEditor)) {
                // Update stacks model: close non active editors supporting the direction
                group.closeEditors(group.activeEditor, filter.direction);
            }
            else {
                this.openEditor(filter.except, null, this.stacks.positionOfGroup(group)).done(function () {
                    // since the opening might have failed, we have to check again for the active editor
                    // being the expected one, otherwise we end up in an endless loop trying to open the
                    // editor
                    if (filter.except.matches(group.activeEditor)) {
                        _this.doCloseEditorsWithFilter(group, filter);
                    }
                }, errors.onUnexpectedError);
            }
        };
        EditorPart.prototype.handleDirty = function (identifiers, ignoreIfOpenedInOtherGroup) {
            var _this = this;
            if (!identifiers.length) {
                return winjs_base_1.TPromise.as(false); // no veto
            }
            return this.doHandleDirty(identifiers.shift(), ignoreIfOpenedInOtherGroup).then(function (veto) {
                if (veto) {
                    return veto;
                }
                return _this.handleDirty(identifiers, ignoreIfOpenedInOtherGroup);
            });
        };
        EditorPart.prototype.doHandleDirty = function (identifier, ignoreIfOpenedInOtherGroup) {
            if (!identifier || !identifier.editor || !identifier.editor.isDirty() || (ignoreIfOpenedInOtherGroup && this.countEditors(identifier.editor) > 1 /* allow to close a dirty editor if it is opened in another group */)) {
                return winjs_base_1.TPromise.as(false); // no veto
            }
            var editor = identifier.editor;
            // Switch to editor that we want to handle
            return this.openEditor(identifier.editor, null, this.stacks.positionOfGroup(identifier.group)).then(function () {
                return editor.confirmSave().then(function (res) {
                    // It could be that the editor saved meanwhile, so we check again
                    // to see if anything needs to happen before closing for good.
                    // This can happen for example if autoSave: onFocusChange is configured
                    // so that the save happens when the dialog opens. 
                    if (!editor.isDirty()) {
                        return res === editor_1.ConfirmResult.CANCEL ? true : false;
                    }
                    // Otherwise, handle accordingly
                    switch (res) {
                        case editor_1.ConfirmResult.SAVE:
                            return editor.save().then(function (ok) { return !ok; });
                        case editor_1.ConfirmResult.DONT_SAVE:
                            // first try a normal revert where the contents of the editor are restored
                            return editor.revert().then(function (ok) { return !ok; }, function (error) {
                                // if that fails, since we are about to close the editor, we accept that
                                // the editor cannot be reverted and instead do a soft revert that just
                                // enables us to close the editor. With this, a user can always close a
                                // dirty editor even when reverting fails.
                                return editor.revert({ soft: true }).then(function (ok) { return !ok; });
                            });
                        case editor_1.ConfirmResult.CANCEL:
                            return true; // veto
                    }
                });
            });
        };
        EditorPart.prototype.countEditors = function (editor) {
            var _this = this;
            var editors = [editor];
            if (editor instanceof editor_1.SideBySideEditorInput) {
                editors.push(editor.master);
            }
            return editors.reduce(function (prev, e) { return prev += _this.stacks.count(e); }, 0);
        };
        EditorPart.prototype.getStacksModel = function () {
            return this.stacks;
        };
        EditorPart.prototype.getActiveEditorInput = function () {
            var lastActiveEditor = this.getActiveEditor();
            return lastActiveEditor ? lastActiveEditor.input : null;
        };
        EditorPart.prototype.getActiveEditor = function () {
            if (!this.editorGroupsControl) {
                return null; // too early
            }
            return this.editorGroupsControl.getActiveEditor();
        };
        EditorPart.prototype.getVisibleEditors = function () {
            return this.visibleEditors ? this.visibleEditors.filter(function (editor) { return !!editor; }) : [];
        };
        EditorPart.prototype.moveGroup = function (arg1, arg2) {
            var _this = this;
            var fromGroup = (typeof arg1 === 'number') ? this.stacks.groupAt(arg1) : arg1;
            var toGroup = (typeof arg2 === 'number') ? this.stacks.groupAt(arg2) : arg2;
            if (!fromGroup || !toGroup || fromGroup === toGroup) {
                return; // Ignore if we cannot move
            }
            var fromPosition = this.stacks.positionOfGroup(fromGroup);
            var toPosition = this.stacks.positionOfGroup(toGroup);
            // Update stacks model
            this.modifyGroups(function () { return _this.stacks.moveGroup(fromGroup, toPosition); });
            // Move widgets
            this.editorGroupsControl.move(fromPosition, toPosition);
            // Move data structures
            arrays.move(this.visibleEditors, fromPosition, toPosition);
            arrays.move(this.editorOpenToken, fromPosition, toPosition);
            arrays.move(this.instantiatedEditors, fromPosition, toPosition);
            // Restore focus
            this.focusGroup(fromGroup);
            // Events
            this._onEditorGroupMoved.fire();
        };
        EditorPart.prototype.moveEditor = function (input, arg2, arg3, moveOptions) {
            var fromGroup = (typeof arg2 === 'number') ? this.stacks.groupAt(arg2) : arg2;
            if (!fromGroup) {
                return;
            }
            // Move within group
            if (arg2 === arg3) {
                this.doMoveEditorInsideGroups(input, fromGroup, moveOptions);
            }
            else {
                var toPosition = (typeof arg3 === 'number') ? arg3 : this.stacks.positionOfGroup(arg3);
                this.doMoveEditorAcrossGroups(input, fromGroup, toPosition, moveOptions);
            }
        };
        EditorPart.prototype.doMoveEditorInsideGroups = function (input, group, moveOptions) {
            var toIndex = moveOptions && moveOptions.index;
            if (typeof toIndex !== 'number') {
                return; // do nothing if we move into same group without index
            }
            var currentIndex = group.indexOf(input);
            if (currentIndex === toIndex) {
                return; // do nothing if editor is already at the given index
            }
            // Update stacks model
            group.moveEditor(input, toIndex);
            group.pin(input);
        };
        EditorPart.prototype.doMoveEditorAcrossGroups = function (input, fromGroup, to, moveOptions) {
            if (fromGroup.count === 1) {
                var toGroup = this.stacks.groupAt(to);
                if (!toGroup && this.stacks.positionOfGroup(fromGroup) < to) {
                    return; // do nothing if the group to move only has one editor and is the last group already
                }
            }
            var index = moveOptions && moveOptions.index;
            var inactive = moveOptions && moveOptions.inactive;
            var preserveFocus = moveOptions && moveOptions.preserveFocus;
            // When moving an editor, try to preserve as much view state as possible by checking
            // for the editor to be a text editor and creating the options accordingly if so
            var options = editor_1.EditorOptions.create({ pinned: true, index: index, inactive: inactive, preserveFocus: preserveFocus });
            var activeEditor = this.getActiveEditor();
            var codeEditor = codeEditorService_1.getCodeEditor(activeEditor);
            if (codeEditor && activeEditor.position === this.stacks.positionOfGroup(fromGroup) && input.matches(activeEditor.input)) {
                options = editor_1.TextEditorOptions.fromEditor(codeEditor, { pinned: true, index: index, inactive: inactive, preserveFocus: preserveFocus });
            }
            // A move to another group is an open first...
            this.openEditor(input, options, to).done(null, errors.onUnexpectedError);
            // and a close afterwards...
            this.doCloseEditor(fromGroup, input, false /* do not activate next one behind if any */);
        };
        EditorPart.prototype.arrangeGroups = function (arrangement) {
            this.editorGroupsControl.arrangeGroups(arrangement);
        };
        EditorPart.prototype.setGroupOrientation = function (orientation) {
            this.editorGroupsControl.setGroupOrientation(orientation);
            this._onGroupOrientationChanged.fire();
            // Rename groups when layout changes
            this.renameGroups();
        };
        EditorPart.prototype.getGroupOrientation = function () {
            return this.editorGroupsControl.getGroupOrientation();
        };
        EditorPart.prototype.createContentArea = function (parent) {
            var _this = this;
            // Content Container
            var contentArea = builder_1.$(parent)
                .div()
                .addClass('content');
            // get settings
            this.memento = this.getMemento(this.storageService, memento_1.Scope.WORKSPACE);
            // Side by Side Control
            var editorPartState = this.memento[EditorPart.EDITOR_PART_UI_STATE_STORAGE_KEY];
            this.editorGroupsControl = this.instantiationService.createInstance(editorGroupsControl_1.EditorGroupsControl, contentArea, editorPartState && editorPartState.groupOrientation);
            this.toUnbind.push(this.editorGroupsControl.onGroupFocusChanged(function () { return _this.onGroupFocusChanged(); }));
            return contentArea;
        };
        EditorPart.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            // Part container
            var container = this.getContainer();
            container.style('background-color', this.getColor(colorRegistry_1.editorBackground));
            // Content area
            var content = this.getContentArea();
            var groupCount = this.stacks.groups.length;
            if (groupCount > 1) {
                content.addClass('multiple-groups');
            }
            else {
                content.removeClass('multiple-groups');
            }
            content.style('background-color', groupCount > 0 ? this.getColor(theme_1.EDITOR_GROUP_BACKGROUND) : null);
        };
        EditorPart.prototype.onGroupFocusChanged = function () {
            // Update stacks model
            var activePosition = this.editorGroupsControl.getActivePosition();
            if (typeof activePosition === 'number') {
                this.stacks.setActive(this.stacks.groupAt(activePosition));
            }
            // Emit as change event so that clients get aware of new active editor
            var activeEditor = this.editorGroupsControl.getActiveEditor();
            if (activeEditor) {
                this._onEditorsChanged.fire();
            }
        };
        EditorPart.prototype.replaceEditors = function (editors, position) {
            var _this = this;
            var activeReplacements = [];
            var hiddenReplacements = [];
            // Find editors across groups to close
            editors.forEach(function (editor) {
                if (editor.toReplace.isDirty()) {
                    return; // we do not handle dirty in this method, so ignore all dirty
                }
                // For each group
                _this.stacks.groups.forEach(function (group) {
                    if (position === void 0 || _this.stacks.positionOfGroup(group) === position) {
                        var index = group.indexOf(editor.toReplace);
                        if (index >= 0) {
                            if (editor.options) {
                                editor.options.index = index; // make sure we respect the index of the editor to replace!
                            }
                            else {
                                editor.options = editor_1.EditorOptions.create({ index: index });
                            }
                            var replacement = { group: group, editor: editor.toReplace, replaceWith: editor.replaceWith, options: editor.options };
                            if (group.activeEditor.matches(editor.toReplace)) {
                                activeReplacements.push(replacement);
                            }
                            else {
                                hiddenReplacements.push(replacement);
                            }
                        }
                    }
                });
            });
            // Deal with hidden replacements first
            hiddenReplacements.forEach(function (replacement) {
                var group = replacement.group;
                group.openEditor(replacement.replaceWith, { active: false, pinned: true, index: replacement.options.index });
                group.closeEditor(replacement.editor);
            });
            // Now deal with active editors to be opened
            var res = this.openEditors(activeReplacements.map(function (replacement) {
                var group = replacement.group;
                return {
                    input: replacement.replaceWith,
                    position: _this.stacks.positionOfGroup(group),
                    options: replacement.options
                };
            }));
            // Close active editors to be replaced now (they are no longer active)
            activeReplacements.forEach(function (replacement) {
                _this.doCloseEditor(replacement.group, replacement.editor, false);
            });
            return res;
        };
        EditorPart.prototype.openEditors = function (editors, sideBySide) {
            if (!editors.length) {
                return winjs_base_1.TPromise.as([]);
            }
            var activePosition;
            if (this.stacks.activeGroup) {
                activePosition = this.stacks.positionOfGroup(this.stacks.activeGroup);
            }
            var ratio = this.editorGroupsControl.getRatio();
            return this.doOpenEditors(editors, activePosition, ratio, sideBySide);
        };
        EditorPart.prototype.hasEditorsToRestore = function () {
            return this.stacks.groups.some(function (g) { return g.count > 0; });
        };
        EditorPart.prototype.restoreEditors = function () {
            var editors = this.stacks.groups.map(function (group, index) {
                return {
                    input: group.activeEditor,
                    position: index,
                    options: group.isPinned(group.activeEditor) ? editor_1.EditorOptions.create({ pinned: true }) : void 0
                };
            });
            if (!editors.length) {
                return winjs_base_1.TPromise.as([]);
            }
            var activePosition;
            if (this.stacks.groups.length) {
                activePosition = this.stacks.positionOfGroup(this.stacks.activeGroup);
            }
            var editorState = this.memento[EditorPart.EDITOR_PART_UI_STATE_STORAGE_KEY];
            // Open editors (throttle editor change events)
            return this._onEditorsChanged.throttle(this.doOpenEditors(editors, activePosition, editorState && editorState.ratio));
        };
        EditorPart.prototype.doOpenEditors = function (editors, activePosition, ratio, sideBySide) {
            var _this = this;
            // Find position if not provided already from calling side
            editors.forEach(function (editor) {
                if (typeof editor.position !== 'number') {
                    editor.position = _this.findPosition(editor.input, editor.options, sideBySide);
                }
            });
            var positionOneEditors = editors.filter(function (e) { return e.position === editor_2.Position.ONE; });
            var positionTwoEditors = editors.filter(function (e) { return e.position === editor_2.Position.TWO; });
            var positionThreeEditors = editors.filter(function (e) { return e.position === editor_2.Position.THREE; });
            var groupOne = this.stacks.groupAt(editor_2.Position.ONE);
            var groupTwo = this.stacks.groupAt(editor_2.Position.TWO);
            var groupThree = this.stacks.groupAt(editor_2.Position.THREE);
            // Compute the imaginary count if we const all editors open as the way requested
            var oneCount = positionOneEditors.length + (groupOne ? groupOne.count : 0);
            var twoCount = positionTwoEditors.length + (groupTwo ? groupTwo.count : 0);
            var threeCount = positionThreeEditors.length + (groupThree ? groupThree.count : 0);
            // Validate we do not produce empty groups given our imaginary count model
            if ((!oneCount && (twoCount || threeCount) || (!twoCount && threeCount))) {
                positionOneEditors.push.apply(positionOneEditors, positionTwoEditors);
                positionOneEditors.push.apply(positionOneEditors, positionThreeEditors);
                positionTwoEditors.splice(0, positionTwoEditors.length);
                positionThreeEditors.splice(0, positionThreeEditors.length);
            }
            // Validate active input
            if (typeof activePosition !== 'number') {
                activePosition = editor_2.Position.ONE;
            }
            // Validate ratios
            var positions = positionThreeEditors.length ? 3 : positionTwoEditors.length ? 2 : 1;
            if (!ratio || ratio.length !== positions) {
                if (!this.getVisibleEditors().length) {
                    ratio = (positions === 3) ? [0.33, 0.33, 0.34] : (positions === 2) ? [0.5, 0.5] : [1];
                }
                else {
                    ratio = void 0;
                }
            }
            var focusGroup = false;
            var activeGroup = this.stacks.groupAt(activePosition);
            if (!this.stacks.activeGroup || !activeGroup) {
                focusGroup = true; // always focus group if this is the first group or we are about to open a new group
            }
            else {
                focusGroup = editors.some(function (e) { return !e.options || (!e.options.inactive && !e.options.preserveFocus); }); // only focus if the editors to open are not opening as inactive or preserveFocus
            }
            // Open each input respecting the options. Since there can only be one active editor in each
            // position, we have to pick the first input from each position and add the others as inactive
            var promises = [];
            [positionOneEditors.shift(), positionTwoEditors.shift(), positionThreeEditors.shift()].forEach(function (editor, position) {
                if (!editor) {
                    return; // unused position
                }
                var input = editor.input;
                // Resolve editor options
                var preserveFocus = (activePosition !== position && ratio && ratio.length > 0); // during restore, preserve focus to reduce flicker
                var options;
                if (editor.options) {
                    options = editor.options;
                    if (typeof options.preserveFocus !== 'boolean') {
                        options.preserveFocus = preserveFocus;
                    }
                }
                else {
                    options = editor_1.EditorOptions.create({ preserveFocus: preserveFocus });
                }
                promises.push(_this.openEditor(input, options, position, ratio));
            });
            return winjs_base_1.TPromise.join(promises).then(function (editors) {
                // Adjust focus as needed
                if (focusGroup) {
                    _this.focusGroup(activePosition);
                }
                // Update stacks model for remaining inactive editors
                [positionOneEditors, positionTwoEditors, positionThreeEditors].forEach(function (editors, index) {
                    var group = _this.stacks.groupAt(index);
                    if (group) {
                        // Make sure we are keeping the order as the editors are passed to us. We have to set
                        // an explicit index because otherwise we would put editors in the wrong order
                        // (see https://github.com/Microsoft/vscode/issues/30364)
                        var startingIndex_1 = group.indexOf(group.activeEditor) + 1;
                        editors.forEach(function (editor, offset) { return group.openEditor(editor.input, { pinned: true, index: (startingIndex_1 + offset) }); });
                    }
                });
                // Full layout side by side
                _this.editorGroupsControl.layout(_this.dimension);
                return editors;
            });
        };
        EditorPart.prototype.activateGroup = function (arg1) {
            var group = (typeof arg1 === 'number') ? this.stacks.groupAt(arg1) : arg1;
            if (group) {
                // Update stacks model
                this.stacks.setActive(group);
                // Update UI
                var editor = this.visibleEditors[this.stacks.positionOfGroup(group)];
                if (editor) {
                    this.editorGroupsControl.setActive(editor);
                }
            }
        };
        EditorPart.prototype.focusGroup = function (arg1) {
            var group = (typeof arg1 === 'number') ? this.stacks.groupAt(arg1) : arg1;
            if (group) {
                // Make active
                this.activateGroup(group);
                // Focus Editor
                var editor = this.visibleEditors[this.stacks.positionOfGroup(group)];
                if (editor) {
                    editor.focus();
                }
            }
        };
        EditorPart.prototype.pinEditor = function (arg1, input) {
            var group = (typeof arg1 === 'number') ? this.stacks.groupAt(arg1) : arg1;
            if (group) {
                if (group.isPinned(input)) {
                    return;
                }
                // Update stacks model
                group.pin(input);
            }
        };
        EditorPart.prototype.invokeWithinEditorContext = function (fn) {
            var activeEditor = this.getActiveEditor();
            if (activeEditor) {
                var activeEditorControl = activeEditor.getControl();
                if (editorBrowser_1.isCodeEditor(activeEditorControl)) {
                    return activeEditorControl.invokeWithinContext(fn);
                }
                return this.editorGroupsControl.getInstantiationService(activeEditor.position).invokeFunction(fn);
            }
            return this.instantiationService.invokeFunction(fn);
        };
        EditorPart.prototype.layout = function (dimension) {
            // Pass to super
            var sizes = _super.prototype.layout.call(this, dimension);
            // Pass to Side by Side Control
            this.dimension = sizes[1];
            this.editorGroupsControl.layout(this.dimension);
            this.onLayoutEmitter.fire(dimension);
            return sizes;
        };
        EditorPart.prototype.shutdown = function () {
            // Persist UI State
            var editorState = { ratio: this.editorGroupsControl.getRatio(), groupOrientation: this.editorGroupsControl.getGroupOrientation() };
            if (editorState.ratio.length || editorState.groupOrientation !== 'vertical') {
                this.memento[EditorPart.EDITOR_PART_UI_STATE_STORAGE_KEY] = editorState;
            }
            else {
                delete this.memento[EditorPart.EDITOR_PART_UI_STATE_STORAGE_KEY];
            }
            // Unload all Instantiated Editors
            for (var i = 0; i < this.instantiatedEditors.length; i++) {
                for (var j = 0; j < this.instantiatedEditors[i].length; j++) {
                    this.instantiatedEditors[i][j].shutdown();
                }
            }
            // Pass to super
            _super.prototype.shutdown.call(this);
        };
        EditorPart.prototype.dispose = function () {
            var _this = this;
            // Emitters
            this._onEditorsChanged.dispose();
            this._onEditorOpening.dispose();
            this._onEditorGroupMoved.dispose();
            this._onEditorOpenFail.dispose();
            // Reset Tokens
            this.editorOpenToken = [];
            for (var i = 0; i < editor_2.POSITIONS.length; i++) {
                this.editorOpenToken[i] = 0;
            }
            // Widgets
            this.editorGroupsControl.dispose();
            // Pass to active editors
            this.visibleEditors.forEach(function (editor) {
                if (editor) {
                    editor.dispose();
                }
            });
            var _loop_1 = function (i) {
                var _loop_2 = function (j) {
                    if (this_1.visibleEditors.some(function (editor) { return editor === _this.instantiatedEditors[i][j]; })) {
                        return "continue";
                    }
                    this_1.instantiatedEditors[i][j].dispose();
                };
                for (var j = 0; j < this_1.instantiatedEditors[i].length; j++) {
                    _loop_2(j);
                }
            };
            var this_1 = this;
            // Pass to instantiated editors
            for (var i = 0; i < this.instantiatedEditors.length; i++) {
                _loop_1(i);
            }
            this.visibleEditors = null;
            // Pass to super
            _super.prototype.dispose.call(this);
        };
        EditorPart.prototype.findPosition = function (input, options, arg1, ratio) {
            // With defined ratios, always trust the provided position
            if (ratio && types.isNumber(arg1)) {
                return arg1;
            }
            // No editor open
            var visibleEditors = this.getVisibleEditors();
            var activeEditor = this.getActiveEditor();
            if (visibleEditors.length === 0 || !activeEditor) {
                return editor_2.Position.ONE; // can only be ONE
            }
            // Ignore revealIfVisible/revealIfOpened option if we got instructed explicitly to
            // * open at a specific index
            // * open to the side
            // * open in a specific group
            var skipReveal = (options && options.index) || arg1 === true /* open to side */ || typeof arg1 === 'number' /* open specific group */;
            // Respect option to reveal an editor if it is already visible
            if (!skipReveal && options && options.revealIfVisible) {
                var group = this.stacks.findGroup(input, true);
                if (group) {
                    return this.stacks.positionOfGroup(group);
                }
            }
            // Respect option to reveal an editor if it is open (not necessarily visible)
            if (!skipReveal && (this.revealIfOpen || (options && options.revealIfOpened))) {
                var group = this.stacks.findGroup(input);
                if (group) {
                    return this.stacks.positionOfGroup(group);
                }
            }
            // Position is unknown: pick last active or ONE
            if (types.isUndefinedOrNull(arg1) || arg1 === false) {
                var lastActivePosition = this.editorGroupsControl.getActivePosition();
                return lastActivePosition || editor_2.Position.ONE;
            }
            // Position is sideBySide: Find position relative to active editor
            if (arg1 === true) {
                switch (activeEditor.position) {
                    case editor_2.Position.ONE:
                        return editor_2.Position.TWO;
                    case editor_2.Position.TWO:
                        return editor_2.Position.THREE;
                    case editor_2.Position.THREE:
                        return null; // Cannot open to the side of the right/bottom most editor
                }
                return null; // Prevent opening to the side
            }
            // Position is provided, validate it
            if (arg1 === editor_2.Position.THREE && visibleEditors.length === 1) {
                return editor_2.Position.TWO;
            }
            return arg1;
        };
        EditorPart.prototype.startDelayedCloseEditorsFromInputDispose = function () {
            var _this = this;
            // To prevent race conditions, we call the close in a timeout because it can well be
            // that an input is being disposed with the intent to replace it with some other input
            // right after.
            if (this.pendingEditorInputCloseTimeout === null) {
                this.pendingEditorInputCloseTimeout = setTimeout(function () {
                    // Split between visible and hidden editors
                    var visibleEditors = [];
                    var hiddenEditors = [];
                    _this.pendingEditorInputsToClose.forEach(function (identifier) {
                        var group = identifier.group, editor = identifier.editor;
                        if (group.isActive(editor)) {
                            visibleEditors.push(identifier);
                        }
                        else if (group.contains(editor)) {
                            hiddenEditors.push(identifier);
                        }
                    });
                    // Close all hidden first
                    hiddenEditors.forEach(function (hidden) { return _this.doCloseEditor(hidden.group, hidden.editor, false); });
                    // Close visible ones second
                    visibleEditors
                        .sort(function (a1, a2) { return _this.stacks.positionOfGroup(a2.group) - _this.stacks.positionOfGroup(a1.group); }) // reduce layout work by starting right/bottom first
                        .forEach(function (visible) { return _this.doCloseEditor(visible.group, visible.editor, false); });
                    // Reset
                    _this.pendingEditorInputCloseTimeout = null;
                    _this.pendingEditorInputsToClose = [];
                }, 0);
            }
        };
        EditorPart.prototype.rochade = function (arg1, arg2) {
            if (types.isUndefinedOrNull(arg2)) {
                var rochade = arg1;
                switch (rochade) {
                    case editorGroupsControl_1.Rochade.TWO_TO_ONE:
                        this.rochade(editor_2.Position.TWO, editor_2.Position.ONE);
                        break;
                    case editorGroupsControl_1.Rochade.THREE_TO_TWO:
                        this.rochade(editor_2.Position.THREE, editor_2.Position.TWO);
                        break;
                    case editorGroupsControl_1.Rochade.TWO_AND_THREE_TO_ONE:
                        this.rochade(editor_2.Position.TWO, editor_2.Position.ONE);
                        this.rochade(editor_2.Position.THREE, editor_2.Position.TWO);
                }
            }
            else {
                var from = arg1;
                var to = arg2;
                this.doRochade(this.visibleEditors, from, to, null);
                this.doRochade(this.editorOpenToken, from, to, null);
                this.doRochade(this.instantiatedEditors, from, to, []);
            }
        };
        EditorPart.prototype.doRochade = function (array, from, to, empty) {
            array[to] = array[from];
            array[from] = empty;
        };
        EditorPart.prototype.ensureGroup = function (position, activate) {
            var _this = this;
            if (activate === void 0) { activate = true; }
            var newGroupOpened = false;
            var group = this.stacks.groupAt(position);
            if (!group) {
                newGroupOpened = true;
                // Race condition: it could be that someone quickly opens editors one after
                // the other and we are asked to open an editor in position 2 before position
                // 1 was opened. Therefor we must ensure that all groups are created up to
                // the point where we are asked for.
                this.modifyGroups(function () {
                    for (var i = 0; i < position; i++) {
                        if (!_this.hasGroup(i)) {
                            _this.stacks.openGroup('', false, i);
                        }
                    }
                    group = _this.stacks.openGroup('', activate, position);
                });
            }
            else {
                this.renameGroups(); // ensure group labels are proper
            }
            if (activate) {
                this.stacks.setActive(group);
            }
            return [group, newGroupOpened];
        };
        EditorPart.prototype.modifyGroups = function (modification) {
            // Run the modification
            modification();
            // Adjust group labels as needed
            this.renameGroups();
        };
        EditorPart.prototype.renameGroups = function () {
            var groups = this.stacks.groups;
            if (groups.length > 0) {
                var layoutVertically = (this.editorGroupsControl.getGroupOrientation() !== 'horizontal');
                // ONE | TWO | THREE
                if (groups.length > 2) {
                    this.stacks.renameGroup(this.stacks.groupAt(editor_2.Position.ONE), layoutVertically ? EditorPart.GROUP_LEFT : EditorPart.GROUP_TOP);
                    this.stacks.renameGroup(this.stacks.groupAt(editor_2.Position.TWO), layoutVertically ? EditorPart.GROUP_CENTER : EditorPart.GROUP_MIDDLE);
                    this.stacks.renameGroup(this.stacks.groupAt(editor_2.Position.THREE), layoutVertically ? EditorPart.GROUP_RIGHT : EditorPart.GROUP_BOTTOM);
                }
                else if (groups.length > 1) {
                    this.stacks.renameGroup(this.stacks.groupAt(editor_2.Position.ONE), layoutVertically ? EditorPart.GROUP_LEFT : EditorPart.GROUP_TOP);
                    this.stacks.renameGroup(this.stacks.groupAt(editor_2.Position.TWO), layoutVertically ? EditorPart.GROUP_RIGHT : EditorPart.GROUP_BOTTOM);
                }
                else {
                    this.stacks.renameGroup(this.stacks.groupAt(editor_2.Position.ONE), layoutVertically ? EditorPart.GROUP_LEFT : EditorPart.GROUP_TOP);
                }
            }
        };
        EditorPart.prototype.hasGroup = function (position) {
            return !!this.stacks.groupAt(position);
        };
        EditorPart.GROUP_LEFT = nls.localize('groupOneVertical', "Left");
        EditorPart.GROUP_CENTER = nls.localize('groupTwoVertical', "Center");
        EditorPart.GROUP_RIGHT = nls.localize('groupThreeVertical', "Right");
        EditorPart.GROUP_TOP = nls.localize('groupOneHorizontal', "Top");
        EditorPart.GROUP_MIDDLE = nls.localize('groupTwoHorizontal', "Center");
        EditorPart.GROUP_BOTTOM = nls.localize('groupThreeHorizontal', "Bottom");
        EditorPart.EDITOR_PART_UI_STATE_STORAGE_KEY = 'editorpart.uiState';
        EditorPart = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, storage_1.IStorageService),
            __param(5, partService_1.IPartService),
            __param(6, configuration_1.IConfigurationService),
            __param(7, contextkey_1.IContextKeyService),
            __param(8, instantiation_1.IInstantiationService),
            __param(9, themeService_1.IThemeService),
            __param(10, environment_1.IEnvironmentService)
        ], EditorPart);
        return EditorPart;
    }(part_1.Part));
    exports.EditorPart = EditorPart;
});
