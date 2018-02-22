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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/async", "vs/base/browser/dom", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/group/common/groupService", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/platform/editor/common/editor", "vs/workbench/parts/files/electron-browser/fileActions", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/parts/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/parts/files/common/explorerModel", "vs/workbench/services/untitled/common/untitledEditorService", "vs/workbench/browser/parts/editor/editorActions", "vs/workbench/browser/actions/toggleEditorLayout", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/editor/editorStacksModel", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/platform/list/browser/listService", "vs/workbench/browser/labels", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/winjs.base", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService", "vs/base/common/lifecycle", "vs/platform/actions/browser/menuItemActionItem", "vs/platform/actions/common/actions", "vs/workbench/parts/files/electron-browser/fileCommands", "vs/workbench/common/resources", "vs/workbench/browser/dnd"], function (require, exports, nls, errors, async_1, dom, contextView_1, instantiation_1, groupService_1, configuration_1, keybinding_1, editor_1, fileActions_1, viewsViewlet_1, files_1, textfiles_1, explorerModel_1, untitledEditorService_1, editorActions_1, toggleEditorLayout_1, contextkey_1, editorStacksModel_1, styler_1, themeService_1, colorRegistry_1, listService_1, labels_1, actionbar_1, winjs_base_1, telemetry_1, editorService_1, lifecycle_1, menuItemActionItem_1, actions_1, fileCommands_1, resources_1, dnd_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var OpenEditorsView = /** @class */ (function (_super) {
        __extends(OpenEditorsView, _super);
        function OpenEditorsView(options, instantiationService, contextMenuService, textFileService, editorService, editorGroupService, configurationService, keybindingService, untitledEditorService, contextKeyService, themeService, telemetryService, menuService) {
            var _this = _super.call(this, __assign({}, options, { ariaHeaderLabel: nls.localize({ key: 'openEditosrSection', comment: ['Open is an adjective'] }, "Open Editors Section") }), keybindingService, contextMenuService, configurationService) || this;
            _this.instantiationService = instantiationService;
            _this.textFileService = textFileService;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.untitledEditorService = untitledEditorService;
            _this.contextKeyService = contextKeyService;
            _this.themeService = themeService;
            _this.telemetryService = telemetryService;
            _this.menuService = menuService;
            _this.model = editorGroupService.getStacksModel();
            _this.structuralRefreshDelay = 0;
            _this.listRefreshScheduler = new async_1.RunOnceScheduler(function () {
                var previousLength = _this.list.length;
                _this.list.splice(0, _this.list.length, _this.elements);
                _this.focusActiveEditor();
                if (previousLength !== _this.list.length) {
                    _this.updateSize();
                }
                _this.needsRefresh = false;
            }, _this.structuralRefreshDelay);
            // update on model changes
            _this.disposables.push(_this.model.onModelChanged(function (e) { return _this.onEditorStacksModelChanged(e); }));
            // Also handle configuration updates
            _this.disposables.push(_this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationChange(e); }));
            // Handle dirty counter
            _this.disposables.push(_this.untitledEditorService.onDidChangeDirty(function (e) { return _this.updateDirtyIndicator(); }));
            _this.disposables.push(_this.textFileService.models.onModelsDirty(function (e) { return _this.updateDirtyIndicator(); }));
            _this.disposables.push(_this.textFileService.models.onModelsSaved(function (e) { return _this.updateDirtyIndicator(); }));
            _this.disposables.push(_this.textFileService.models.onModelsSaveError(function (e) { return _this.updateDirtyIndicator(); }));
            _this.disposables.push(_this.textFileService.models.onModelsReverted(function (e) { return _this.updateDirtyIndicator(); }));
            return _this;
        }
        OpenEditorsView.prototype.renderHeaderTitle = function (container) {
            var _this = this;
            var title = dom.append(container, $('.title'));
            dom.append(title, $('span', null, this.name));
            var count = dom.append(container, $('.count'));
            this.dirtyCountElement = dom.append(count, $('.monaco-count-badge'));
            this.disposables.push((styler_1.attachStylerCallback(this.themeService, { badgeBackground: colorRegistry_1.badgeBackground, badgeForeground: colorRegistry_1.badgeForeground, contrastBorder: colorRegistry_1.contrastBorder }, function (colors) {
                var background = colors.badgeBackground ? colors.badgeBackground.toString() : null;
                var foreground = colors.badgeForeground ? colors.badgeForeground.toString() : null;
                var border = colors.contrastBorder ? colors.contrastBorder.toString() : null;
                _this.dirtyCountElement.style.backgroundColor = background;
                _this.dirtyCountElement.style.color = foreground;
                _this.dirtyCountElement.style.borderWidth = border ? '1px' : null;
                _this.dirtyCountElement.style.borderStyle = border ? 'solid' : null;
                _this.dirtyCountElement.style.borderColor = border;
            })));
            this.updateDirtyIndicator();
        };
        OpenEditorsView.prototype.renderBody = function (container) {
            var _this = this;
            dom.addClass(container, 'explorer-open-editors');
            dom.addClass(container, 'show-file-icons');
            var delegate = new OpenEditorsDelegate();
            var getSelectedElements = function () {
                var selected = _this.list.getSelectedElements();
                var focused = _this.list.getFocusedElements();
                if (focused.length && selected.indexOf(focused[0]) >= 0) {
                    return selected;
                }
                return focused;
            };
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchList, container, delegate, [
                new EditorGroupRenderer(this.keybindingService, this.instantiationService, this.editorGroupService),
                new OpenEditorRenderer(getSelectedElements, this.instantiationService, this.keybindingService, this.configurationService, this.editorGroupService)
            ], {
                identityProvider: function (element) { return element instanceof explorerModel_1.OpenEditor ? element.getId() : element.id.toString(); },
                selectOnMouseDown: false /* disabled to better support DND */
            });
            this.contributedContextMenu = this.menuService.createMenu(actions_1.MenuId.OpenEditorsContext, this.list.contextKeyService);
            this.disposables.push(this.contributedContextMenu);
            this.updateSize();
            // Bind context keys
            files_1.OpenEditorsFocusedContext.bindTo(this.list.contextKeyService);
            files_1.ExplorerFocusedContext.bindTo(this.list.contextKeyService);
            this.resourceContext = this.instantiationService.createInstance(resources_1.ResourceContextKey);
            this.groupFocusedContext = fileCommands_1.OpenEditorsGroupContext.bindTo(this.contextKeyService);
            this.dirtyEditorFocusedContext = fileCommands_1.DirtyEditorContext.bindTo(this.contextKeyService);
            this.disposables.push(this.list.onContextMenu(function (e) { return _this.onListContextMenu(e); }));
            this.list.onFocusChange(function (e) {
                _this.resourceContext.reset();
                _this.groupFocusedContext.reset();
                _this.dirtyEditorFocusedContext.reset();
                var element = e.elements.length ? e.elements[0] : undefined;
                if (element instanceof explorerModel_1.OpenEditor) {
                    _this.dirtyEditorFocusedContext.set(_this.textFileService.isDirty(element.getResource()));
                    _this.resourceContext.set(element.getResource());
                }
                else if (!!element) {
                    _this.groupFocusedContext.set(true);
                }
            });
            // Open when selecting via keyboard
            this.disposables.push(this.list.onOpen(function (e) {
                var browserEvent = e.browserEvent;
                var openToSide = false;
                var isSingleClick = false;
                var isDoubleClick = false;
                var isMiddleClick = false;
                if (browserEvent instanceof MouseEvent) {
                    isSingleClick = browserEvent.detail === 1;
                    isDoubleClick = browserEvent.detail === 2;
                    isMiddleClick = browserEvent.button === 1 /* middle button */;
                    openToSide = _this.list.useAltAsMultipleSelectionModifier ? (browserEvent.ctrlKey || browserEvent.metaKey) : browserEvent.altKey;
                }
                var focused = _this.list.getFocusedElements();
                var element = focused.length ? focused[0] : undefined;
                if (element instanceof explorerModel_1.OpenEditor) {
                    if (isMiddleClick) {
                        var position = _this.model.positionOfGroup(element.group);
                        _this.editorService.closeEditor(position, element.editor).done(null, errors.onUnexpectedError);
                    }
                    else {
                        _this.openEditor(element, { preserveFocus: isSingleClick, pinned: isDoubleClick, sideBySide: openToSide });
                    }
                }
            }));
            this.listRefreshScheduler.schedule(0);
        };
        OpenEditorsView.prototype.getActions = function () {
            return [
                this.instantiationService.createInstance(toggleEditorLayout_1.ToggleEditorLayoutAction, toggleEditorLayout_1.ToggleEditorLayoutAction.ID, toggleEditorLayout_1.ToggleEditorLayoutAction.LABEL),
                this.instantiationService.createInstance(fileActions_1.SaveAllAction, fileActions_1.SaveAllAction.ID, fileActions_1.SaveAllAction.LABEL),
                this.instantiationService.createInstance(editorActions_1.CloseAllEditorsAction, editorActions_1.CloseAllEditorsAction.ID, editorActions_1.CloseAllEditorsAction.LABEL)
            ];
        };
        OpenEditorsView.prototype.setExpanded = function (expanded) {
            _super.prototype.setExpanded.call(this, expanded);
            if (expanded && this.needsRefresh) {
                this.listRefreshScheduler.schedule(0);
            }
        };
        OpenEditorsView.prototype.setVisible = function (visible) {
            var _this = this;
            return _super.prototype.setVisible.call(this, visible).then(function () {
                if (visible && _this.needsRefresh) {
                    _this.listRefreshScheduler.schedule(0);
                }
            });
        };
        OpenEditorsView.prototype.focus = function () {
            this.list.domFocus();
            _super.prototype.focus.call(this);
        };
        OpenEditorsView.prototype.getList = function () {
            return this.list;
        };
        OpenEditorsView.prototype.layoutBody = function (size) {
            if (this.list) {
                this.list.layout(size);
            }
        };
        Object.defineProperty(OpenEditorsView.prototype, "elements", {
            get: function () {
                var _this = this;
                var result = [];
                this.model.groups.forEach(function (g) {
                    if (_this.model.groups.length > 1) {
                        result.push(g);
                    }
                    result.push.apply(result, g.getEditors().map(function (ei) { return new explorerModel_1.OpenEditor(ei, g); }));
                });
                return result;
            },
            enumerable: true,
            configurable: true
        });
        OpenEditorsView.prototype.getIndex = function (group, editor) {
            var index = editor ? group.indexOf(editor) : 0;
            if (this.model.groups.length === 1) {
                return index;
            }
            for (var _i = 0, _a = this.model.groups; _i < _a.length; _i++) {
                var g = _a[_i];
                if (g.id === group.id) {
                    return index + (!!editor ? 1 : 0);
                }
                else {
                    index += g.count + 1;
                }
            }
            return -1;
        };
        OpenEditorsView.prototype.openEditor = function (element, options) {
            var _this = this;
            if (element) {
                /* __GDPR__
                    "workbenchActionExecuted" : {
                        "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog('workbenchActionExecuted', { id: 'workbench.files.openFile', from: 'openEditors' });
                var position_1 = this.model.positionOfGroup(element.group);
                if (options.sideBySide && position_1 !== editor_1.Position.THREE) {
                    position_1++;
                }
                var preserveActivateGroup_1 = options.sideBySide && options.preserveFocus; // needed for https://github.com/Microsoft/vscode/issues/42399
                if (!preserveActivateGroup_1) {
                    this.editorGroupService.activateGroup(this.model.groupAt(position_1)); // needed for https://github.com/Microsoft/vscode/issues/6672
                }
                this.editorService.openEditor(element.editor, options, position_1).done(function () {
                    if (!preserveActivateGroup_1) {
                        _this.editorGroupService.activateGroup(_this.model.groupAt(position_1));
                    }
                }, errors.onUnexpectedError);
            }
        };
        OpenEditorsView.prototype.onListContextMenu = function (e) {
            var _this = this;
            var element = e.element;
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return e.anchor; },
                getActions: function () {
                    var actions = [];
                    menuItemActionItem_1.fillInActions(_this.contributedContextMenu, { shouldForwardArgs: true, arg: element instanceof explorerModel_1.OpenEditor ? element.editor.getResource() : {} }, actions, _this.contextMenuService);
                    return winjs_base_1.TPromise.as(actions);
                },
                getActionsContext: function () { return element instanceof explorerModel_1.OpenEditor ? { groupId: element.group.id, editorIndex: element.editorIndex } : { groupId: element.id }; }
            });
        };
        OpenEditorsView.prototype.onEditorStacksModelChanged = function (e) {
            if (!this.isVisible() || !this.list || !this.isExpanded()) {
                this.needsRefresh = true;
                return;
            }
            // Do a minimal list update based on if the change is structural or not #6670
            if (e.structural) {
                this.listRefreshScheduler.schedule(this.structuralRefreshDelay);
            }
            else if (!this.listRefreshScheduler.isScheduled()) {
                var newElement = e.editor ? new explorerModel_1.OpenEditor(e.editor, e.group) : e.group;
                var index = this.getIndex(e.group, e.editor);
                var previousLength = this.list.length;
                this.list.splice(index, 1, [newElement]);
                if (previousLength !== this.list.length) {
                    this.updateSize();
                }
                this.focusActiveEditor();
            }
        };
        OpenEditorsView.prototype.focusActiveEditor = function () {
            if (this.model.activeGroup && this.model.activeGroup.activeEditor /* could be empty */) {
                var index = this.getIndex(this.model.activeGroup, this.model.activeGroup.activeEditor);
                this.list.setFocus([index]);
                this.list.setSelection([index]);
                this.list.reveal(index);
            }
        };
        OpenEditorsView.prototype.onConfigurationChange = function (event) {
            if (event.affectsConfiguration('explorer.openEditors')) {
                this.updateSize();
            }
            // Trigger a 'repaint' when decoration settings change
            if (event.affectsConfiguration('explorer.decorations')) {
                this.listRefreshScheduler.schedule();
            }
        };
        OpenEditorsView.prototype.updateSize = function () {
            // Adjust expanded body size
            this.minimumBodySize = this.getMinExpandedBodySize();
            this.maximumBodySize = this.getMaxExpandedBodySize();
        };
        OpenEditorsView.prototype.updateDirtyIndicator = function () {
            var dirty = this.textFileService.getAutoSaveMode() !== textfiles_1.AutoSaveMode.AFTER_SHORT_DELAY ? this.textFileService.getDirty().length
                : this.untitledEditorService.getDirty().length;
            if (dirty === 0) {
                dom.addClass(this.dirtyCountElement, 'hidden');
            }
            else {
                this.dirtyCountElement.textContent = nls.localize('dirtyCounter', "{0} unsaved", dirty);
                dom.removeClass(this.dirtyCountElement, 'hidden');
            }
        };
        Object.defineProperty(OpenEditorsView.prototype, "elementCount", {
            get: function () {
                return this.model.groups.map(function (g) { return g.count; })
                    .reduce(function (first, second) { return first + second; }, this.model.groups.length > 1 ? this.model.groups.length : 0);
            },
            enumerable: true,
            configurable: true
        });
        OpenEditorsView.prototype.getMaxExpandedBodySize = function () {
            return this.elementCount * OpenEditorsDelegate.ITEM_HEIGHT;
        };
        OpenEditorsView.prototype.getMinExpandedBodySize = function () {
            var visibleOpenEditors = this.configurationService.getValue('explorer.openEditors.visible');
            if (typeof visibleOpenEditors !== 'number') {
                visibleOpenEditors = OpenEditorsView.DEFAULT_VISIBLE_OPEN_EDITORS;
            }
            return this.computeMinExpandedBodySize(visibleOpenEditors);
        };
        OpenEditorsView.prototype.computeMinExpandedBodySize = function (visibleOpenEditors) {
            if (visibleOpenEditors === void 0) { visibleOpenEditors = OpenEditorsView.DEFAULT_VISIBLE_OPEN_EDITORS; }
            var itemsToShow = Math.min(Math.max(visibleOpenEditors, 1), this.elementCount);
            return itemsToShow * OpenEditorsDelegate.ITEM_HEIGHT;
        };
        OpenEditorsView.prototype.setStructuralRefreshDelay = function (delay) {
            this.structuralRefreshDelay = delay;
        };
        OpenEditorsView.prototype.getOptimalWidth = function () {
            var parentNode = this.list.getHTMLElement();
            var childNodes = [].slice.call(parentNode.querySelectorAll('.open-editor > a'));
            return dom.getLargestChildWidth(parentNode, childNodes);
        };
        OpenEditorsView.DEFAULT_VISIBLE_OPEN_EDITORS = 9;
        OpenEditorsView.ID = 'workbench.explorer.openEditorsView';
        OpenEditorsView.NAME = nls.localize({ key: 'openEditors', comment: ['Open is an adjective'] }, "Open Editors");
        OpenEditorsView = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, contextView_1.IContextMenuService),
            __param(3, textfiles_1.ITextFileService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, groupService_1.IEditorGroupService),
            __param(6, configuration_1.IConfigurationService),
            __param(7, keybinding_1.IKeybindingService),
            __param(8, untitledEditorService_1.IUntitledEditorService),
            __param(9, contextkey_1.IContextKeyService),
            __param(10, themeService_1.IThemeService),
            __param(11, telemetry_1.ITelemetryService),
            __param(12, actions_1.IMenuService)
        ], OpenEditorsView);
        return OpenEditorsView;
    }(viewsViewlet_1.ViewsViewletPanel));
    exports.OpenEditorsView = OpenEditorsView;
    var OpenEditorsDelegate = /** @class */ (function () {
        function OpenEditorsDelegate() {
        }
        OpenEditorsDelegate.prototype.getHeight = function (element) {
            return OpenEditorsDelegate.ITEM_HEIGHT;
        };
        OpenEditorsDelegate.prototype.getTemplateId = function (element) {
            if (element instanceof editorStacksModel_1.EditorGroup) {
                return EditorGroupRenderer.ID;
            }
            return OpenEditorRenderer.ID;
        };
        OpenEditorsDelegate.ITEM_HEIGHT = 22;
        return OpenEditorsDelegate;
    }());
    var EditorGroupRenderer = /** @class */ (function () {
        function EditorGroupRenderer(keybindingService, instantiationService, editorGroupService) {
            this.keybindingService = keybindingService;
            this.instantiationService = instantiationService;
            this.editorGroupService = editorGroupService;
            this.transfer = dnd_1.LocalSelectionTransfer.getInstance();
            // noop
        }
        Object.defineProperty(EditorGroupRenderer.prototype, "templateId", {
            get: function () {
                return EditorGroupRenderer.ID;
            },
            enumerable: true,
            configurable: true
        });
        EditorGroupRenderer.prototype.renderTemplate = function (container) {
            var _this = this;
            var editorGroupTemplate = Object.create(null);
            editorGroupTemplate.root = dom.append(container, $('.editor-group'));
            editorGroupTemplate.name = dom.append(editorGroupTemplate.root, $('span.name'));
            editorGroupTemplate.actionBar = new actionbar_1.ActionBar(container);
            var saveAllInGroupAction = this.instantiationService.createInstance(fileActions_1.SaveAllInGroupAction, fileActions_1.SaveAllInGroupAction.ID, fileActions_1.SaveAllInGroupAction.LABEL);
            var key = this.keybindingService.lookupKeybinding(saveAllInGroupAction.id);
            editorGroupTemplate.actionBar.push(saveAllInGroupAction, { icon: true, label: false, keybinding: key ? key.getLabel() : void 0 });
            editorGroupTemplate.toDispose = [];
            editorGroupTemplate.toDispose.push(dom.addDisposableListener(container, dom.EventType.DRAG_OVER, function (e) {
                dom.addClass(container, 'focused');
            }));
            editorGroupTemplate.toDispose.push(dom.addDisposableListener(container, dom.EventType.DRAG_LEAVE, function (e) {
                dom.removeClass(container, 'focused');
            }));
            editorGroupTemplate.toDispose.push(dom.addDisposableListener(container, dom.EventType.DROP, function (e) {
                dom.removeClass(container, 'focused');
                var model = _this.editorGroupService.getStacksModel();
                var positionOfTargetGroup = model.positionOfGroup(editorGroupTemplate.editorGroup);
                if (_this.transfer.hasData(explorerModel_1.OpenEditor.prototype)) {
                    _this.transfer.getData(explorerModel_1.OpenEditor.prototype).forEach(function (oe) {
                        return _this.editorGroupService.moveEditor(oe.editor, model.positionOfGroup(oe.group), positionOfTargetGroup, { preserveFocus: true });
                    });
                    _this.editorGroupService.activateGroup(positionOfTargetGroup);
                }
                else {
                    var dropHandler = _this.instantiationService.createInstance(dnd_1.ResourcesDropHandler, { allowWorkspaceOpen: false });
                    dropHandler.handleDrop(e, function () { return _this.editorGroupService.activateGroup(positionOfTargetGroup); }, positionOfTargetGroup);
                }
            }));
            return editorGroupTemplate;
        };
        EditorGroupRenderer.prototype.renderElement = function (editorGroup, index, templateData) {
            templateData.editorGroup = editorGroup;
            templateData.name.textContent = editorGroup.label;
            templateData.actionBar.context = { groupId: editorGroup.id };
        };
        EditorGroupRenderer.prototype.disposeTemplate = function (templateData) {
            templateData.actionBar.dispose();
            lifecycle_1.dispose(templateData.toDispose);
        };
        EditorGroupRenderer.ID = 'editorgroup';
        return EditorGroupRenderer;
    }());
    var OpenEditorRenderer = /** @class */ (function () {
        function OpenEditorRenderer(getSelectedElements, instantiationService, keybindingService, configurationService, editorGroupService) {
            this.getSelectedElements = getSelectedElements;
            this.instantiationService = instantiationService;
            this.keybindingService = keybindingService;
            this.configurationService = configurationService;
            this.editorGroupService = editorGroupService;
            this.transfer = dnd_1.LocalSelectionTransfer.getInstance();
            // noop
        }
        Object.defineProperty(OpenEditorRenderer.prototype, "templateId", {
            get: function () {
                return OpenEditorRenderer.ID;
            },
            enumerable: true,
            configurable: true
        });
        OpenEditorRenderer.prototype.renderTemplate = function (container) {
            var _this = this;
            var editorTemplate = Object.create(null);
            editorTemplate.container = container;
            editorTemplate.actionBar = new actionbar_1.ActionBar(container);
            container.draggable = true;
            var closeEditorAction = this.instantiationService.createInstance(editorActions_1.CloseEditorAction, editorActions_1.CloseEditorAction.ID, editorActions_1.CloseEditorAction.LABEL);
            var key = this.keybindingService.lookupKeybinding(closeEditorAction.id);
            editorTemplate.actionBar.push(closeEditorAction, { icon: true, label: false, keybinding: key ? key.getLabel() : void 0 });
            editorTemplate.root = this.instantiationService.createInstance(labels_1.EditorLabel, container, void 0);
            editorTemplate.toDispose = [];
            editorTemplate.toDispose.push(dom.addDisposableListener(container, dom.EventType.DRAG_START, function (e) {
                var dragged = _this.getSelectedElements().filter(function (e) { return e instanceof explorerModel_1.OpenEditor && !!e.getResource(); });
                var dragImage = document.createElement('div');
                e.dataTransfer.effectAllowed = 'copyMove';
                dragImage.className = 'monaco-tree-drag-image';
                dragImage.textContent = dragged.length === 1 ? editorTemplate.openEditor.editor.getName() : String(dragged.length);
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, -10, -10);
                setTimeout(function () { return document.body.removeChild(dragImage); }, 0);
                _this.transfer.setData(dragged, explorerModel_1.OpenEditor.prototype);
                if (editorTemplate.openEditor && editorTemplate.openEditor.editor) {
                    _this.instantiationService.invokeFunction(dnd_1.fillResourceDataTransfers, dragged.map(function (d) { return d.getResource(); }), e);
                }
            }));
            editorTemplate.toDispose.push(dom.addDisposableListener(container, dom.EventType.DRAG_OVER, function () {
                dom.addClass(container, 'focused');
            }));
            editorTemplate.toDispose.push(dom.addDisposableListener(container, dom.EventType.DRAG_LEAVE, function () {
                dom.removeClass(container, 'focused');
            }));
            editorTemplate.toDispose.push(dom.addDisposableListener(container, dom.EventType.DROP, function (e) {
                dom.removeClass(container, 'focused');
                var model = _this.editorGroupService.getStacksModel();
                var positionOfTargetGroup = model.positionOfGroup(editorTemplate.openEditor.group);
                var index = editorTemplate.openEditor.group.indexOf(editorTemplate.openEditor.editor);
                if (_this.transfer.hasData(explorerModel_1.OpenEditor.prototype)) {
                    _this.transfer.getData(explorerModel_1.OpenEditor.prototype).forEach(function (oe) {
                        return _this.editorGroupService.moveEditor(oe.editor, model.positionOfGroup(oe.group), positionOfTargetGroup, { index: index, preserveFocus: true });
                    });
                    _this.editorGroupService.activateGroup(positionOfTargetGroup);
                }
                else {
                    var dropHandler = _this.instantiationService.createInstance(dnd_1.ResourcesDropHandler, { allowWorkspaceOpen: false });
                    dropHandler.handleDrop(e, function () { return _this.editorGroupService.activateGroup(positionOfTargetGroup); }, positionOfTargetGroup, index);
                }
            }));
            editorTemplate.toDispose.push(dom.addDisposableListener(container, dom.EventType.DRAG_END, function () {
                _this.transfer.clearData();
            }));
            return editorTemplate;
        };
        OpenEditorRenderer.prototype.renderElement = function (editor, index, templateData) {
            templateData.openEditor = editor;
            editor.isDirty() ? dom.addClass(templateData.container, 'dirty') : dom.removeClass(templateData.container, 'dirty');
            templateData.root.setEditor(editor.editor, {
                italic: editor.isPreview(),
                extraClasses: ['open-editor'],
                fileDecorations: this.configurationService.getValue().explorer.decorations
            });
            templateData.actionBar.context = { groupId: editor.group.id, editorIndex: editor.editorIndex };
        };
        OpenEditorRenderer.prototype.disposeTemplate = function (templateData) {
            templateData.actionBar.dispose();
            templateData.root.dispose();
            lifecycle_1.dispose(templateData.toDispose);
        };
        OpenEditorRenderer.ID = 'openeditor';
        return OpenEditorRenderer;
    }());
});
