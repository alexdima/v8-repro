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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/platform", "vs/base/browser/ui/checkbox/checkbox", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/editor/baseEditor", "vs/workbench/common/editor", "vs/platform/telemetry/common/telemetry", "vs/platform/clipboard/common/clipboardService", "vs/workbench/parts/preferences/common/keybindingsEditorModel", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/parts/preferences/browser/preferencesWidgets", "vs/workbench/parts/preferences/browser/keybindingWidgets", "vs/workbench/parts/preferences/common/preferences", "vs/platform/contextview/browser/contextView", "vs/workbench/services/keybinding/common/keybindingEditing", "vs/platform/theme/common/themeService", "vs/platform/contextkey/common/contextkey", "vs/platform/message/common/message", "vs/base/browser/keyboardEvent", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/editorExtensions", "vs/platform/list/browser/listService", "vs/css!./media/keybindingsEditor"], function (require, exports, nls_1, winjs_base_1, async_1, DOM, platform_1, checkbox_1, highlightedLabel_1, keybindingLabel_1, actionbar_1, baseEditor_1, editor_1, telemetry_1, clipboardService_1, keybindingsEditorModel_1, instantiation_1, keybinding_1, preferencesWidgets_1, keybindingWidgets_1, preferences_1, contextView_1, keybindingEditing_1, themeService_1, contextkey_1, message_1, keyboardEvent_1, colorRegistry_1, editorService_1, editorExtensions_1, listService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = DOM.$;
    var KeybindingsEditorInput = /** @class */ (function (_super) {
        __extends(KeybindingsEditorInput, _super);
        function KeybindingsEditorInput(instantiationService) {
            var _this = _super.call(this) || this;
            _this.keybindingsModel = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, platform_1.OS);
            return _this;
        }
        KeybindingsEditorInput.prototype.getTypeId = function () {
            return KeybindingsEditorInput.ID;
        };
        KeybindingsEditorInput.prototype.getName = function () {
            return nls_1.localize('keybindingsInputName', "Keyboard Shortcuts");
        };
        KeybindingsEditorInput.prototype.resolve = function (refresh) {
            return winjs_base_1.TPromise.as(this.keybindingsModel);
        };
        KeybindingsEditorInput.prototype.matches = function (otherInput) {
            return otherInput instanceof KeybindingsEditorInput;
        };
        KeybindingsEditorInput.ID = 'workbench.input.keybindings';
        KeybindingsEditorInput = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], KeybindingsEditorInput);
        return KeybindingsEditorInput;
    }(editor_1.EditorInput));
    exports.KeybindingsEditorInput = KeybindingsEditorInput;
    var KeybindingsEditor = /** @class */ (function (_super) {
        __extends(KeybindingsEditor, _super);
        function KeybindingsEditor(telemetryService, themeService, keybindingsService, contextMenuService, preferencesService, keybindingEditingService, contextKeyService, messageService, clipboardService, instantiationService, editorService) {
            var _this = _super.call(this, KeybindingsEditor.ID, telemetryService, themeService) || this;
            _this.keybindingsService = keybindingsService;
            _this.contextMenuService = contextMenuService;
            _this.preferencesService = preferencesService;
            _this.keybindingEditingService = keybindingEditingService;
            _this.contextKeyService = contextKeyService;
            _this.messageService = messageService;
            _this.clipboardService = clipboardService;
            _this.instantiationService = instantiationService;
            _this.editorService = editorService;
            _this.latestEmptyFilters = [];
            _this.delayedFiltering = new async_1.Delayer(300);
            _this._register(keybindingsService.onDidUpdateKeybindings(function () { return _this.render(); }));
            _this.keybindingsEditorContextKey = preferences_1.CONTEXT_KEYBINDINGS_EDITOR.bindTo(_this.contextKeyService);
            _this.searchFocusContextKey = preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS.bindTo(_this.contextKeyService);
            _this.keybindingFocusContextKey = preferences_1.CONTEXT_KEYBINDING_FOCUS.bindTo(_this.contextKeyService);
            _this.delayedFilterLogging = new async_1.Delayer(1000);
            return _this;
        }
        KeybindingsEditor.prototype.createEditor = function (parent) {
            var _this = this;
            var parentElement = parent.getHTMLElement();
            var keybindingsEditorElement = DOM.append(parentElement, $('div', { class: 'keybindings-editor' }));
            this.createOverlayContainer(keybindingsEditorElement);
            this.createHeader(keybindingsEditorElement);
            this.createBody(keybindingsEditorElement);
            var focusTracker = this._register(DOM.trackFocus(parentElement));
            this._register(focusTracker.onDidFocus(function () { return _this.keybindingsEditorContextKey.set(true); }));
            this._register(focusTracker.onDidBlur(function () { return _this.keybindingsEditorContextKey.reset(); }));
        };
        KeybindingsEditor.prototype.setInput = function (input, options) {
            var _this = this;
            var oldInput = this.input;
            return _super.prototype.setInput.call(this, input)
                .then(function () {
                if (!input.matches(oldInput)) {
                    _this.render(options && options.preserveFocus);
                }
            });
        };
        KeybindingsEditor.prototype.clearInput = function () {
            _super.prototype.clearInput.call(this);
            this.keybindingsEditorContextKey.reset();
            this.keybindingFocusContextKey.reset();
        };
        KeybindingsEditor.prototype.layout = function (dimension) {
            this.dimension = dimension;
            this.searchWidget.layout(dimension);
            this.overlayContainer.style.width = dimension.width + 'px';
            this.overlayContainer.style.height = dimension.height + 'px';
            this.defineKeybindingWidget.layout(this.dimension);
            this.layoutKebindingsList();
        };
        KeybindingsEditor.prototype.focus = function () {
            var activeKeybindingEntry = this.activeKeybindingEntry;
            if (activeKeybindingEntry) {
                this.selectEntry(activeKeybindingEntry);
            }
            else {
                this.searchWidget.focus();
            }
        };
        Object.defineProperty(KeybindingsEditor.prototype, "activeKeybindingEntry", {
            get: function () {
                var focusedElement = this.keybindingsList.getFocusedElements()[0];
                return focusedElement && focusedElement.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID ? focusedElement : null;
            },
            enumerable: true,
            configurable: true
        });
        KeybindingsEditor.prototype.defineKeybinding = function (keybindingEntry) {
            var _this = this;
            this.selectEntry(keybindingEntry);
            this.showOverlayContainer();
            return this.defineKeybindingWidget.define().then(function (key) {
                _this.reportKeybindingAction(preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE, keybindingEntry.keybindingItem.command, key);
                if (key) {
                    return _this.keybindingEditingService.editKeybinding(key, keybindingEntry.keybindingItem.keybindingItem)
                        .then(function () {
                        if (!keybindingEntry.keybindingItem.keybinding) {
                            _this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
                        }
                    });
                }
                return null;
            }).then(function () {
                _this.hideOverlayContainer();
                _this.selectEntry(keybindingEntry);
            }, function (error) {
                _this.hideOverlayContainer();
                _this.onKeybindingEditingError(error);
                _this.selectEntry(keybindingEntry);
                return error;
            });
        };
        KeybindingsEditor.prototype.removeKeybinding = function (keybindingEntry) {
            var _this = this;
            this.selectEntry(keybindingEntry);
            if (keybindingEntry.keybindingItem.keybinding) {
                this.reportKeybindingAction(preferences_1.KEYBINDINGS_EDITOR_COMMAND_REMOVE, keybindingEntry.keybindingItem.command, keybindingEntry.keybindingItem.keybinding);
                return this.keybindingEditingService.removeKeybinding(keybindingEntry.keybindingItem.keybindingItem)
                    .then(function () { return _this.focus(); }, function (error) {
                    _this.onKeybindingEditingError(error);
                    _this.selectEntry(keybindingEntry);
                });
            }
            return winjs_base_1.TPromise.as(null);
        };
        KeybindingsEditor.prototype.resetKeybinding = function (keybindingEntry) {
            var _this = this;
            this.selectEntry(keybindingEntry);
            this.reportKeybindingAction(preferences_1.KEYBINDINGS_EDITOR_COMMAND_RESET, keybindingEntry.keybindingItem.command, keybindingEntry.keybindingItem.keybinding);
            return this.keybindingEditingService.resetKeybinding(keybindingEntry.keybindingItem.keybindingItem)
                .then(function () {
                if (!keybindingEntry.keybindingItem.keybinding) {
                    _this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
                }
                _this.selectEntry(keybindingEntry);
            }, function (error) {
                _this.onKeybindingEditingError(error);
                _this.selectEntry(keybindingEntry);
            });
        };
        KeybindingsEditor.prototype.copyKeybinding = function (keybinding) {
            this.selectEntry(keybinding);
            this.reportKeybindingAction(preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY, keybinding.keybindingItem.command, keybinding.keybindingItem.keybinding);
            var userFriendlyKeybinding = {
                key: keybinding.keybindingItem.keybinding ? keybinding.keybindingItem.keybinding.getUserSettingsLabel() : '',
                command: keybinding.keybindingItem.command
            };
            if (keybinding.keybindingItem.when) {
                userFriendlyKeybinding.when = keybinding.keybindingItem.when;
            }
            this.clipboardService.writeText(JSON.stringify(userFriendlyKeybinding, null, '  '));
            return winjs_base_1.TPromise.as(null);
        };
        KeybindingsEditor.prototype.copyKeybindingCommand = function (keybinding) {
            this.selectEntry(keybinding);
            this.reportKeybindingAction(preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND, keybinding.keybindingItem.command, keybinding.keybindingItem.keybinding);
            this.clipboardService.writeText(keybinding.keybindingItem.command);
            return winjs_base_1.TPromise.as(null);
        };
        KeybindingsEditor.prototype.search = function (filter) {
            this.searchWidget.focus();
        };
        KeybindingsEditor.prototype.clearSearchResults = function () {
            this.searchWidget.clear();
        };
        KeybindingsEditor.prototype.showSimilarKeybindings = function (keybindingEntry) {
            var value = "\"" + keybindingEntry.keybindingItem.keybinding.getAriaLabel() + "\"";
            if (value !== this.searchWidget.getValue()) {
                this.searchWidget.setValue(value);
            }
            return winjs_base_1.TPromise.as(null);
        };
        KeybindingsEditor.prototype.createOverlayContainer = function (parent) {
            this.overlayContainer = DOM.append(parent, $('.overlay-container'));
            this.overlayContainer.style.position = 'absolute';
            this.overlayContainer.style.zIndex = '10';
            this.defineKeybindingWidget = this._register(this.instantiationService.createInstance(keybindingWidgets_1.DefineKeybindingWidget, this.overlayContainer));
            this.hideOverlayContainer();
        };
        KeybindingsEditor.prototype.showOverlayContainer = function () {
            this.overlayContainer.style.display = 'block';
        };
        KeybindingsEditor.prototype.hideOverlayContainer = function () {
            this.overlayContainer.style.display = 'none';
        };
        KeybindingsEditor.prototype.createHeader = function (parent) {
            var _this = this;
            this.headerContainer = DOM.append(parent, $('.keybindings-header'));
            var searchContainer = DOM.append(this.headerContainer, $('.search-container'));
            this.searchWidget = this._register(this.instantiationService.createInstance(preferencesWidgets_1.SearchWidget, searchContainer, {
                ariaLabel: nls_1.localize('SearchKeybindings.AriaLabel', "Search keybindings"),
                placeholder: nls_1.localize('SearchKeybindings.Placeholder', "Search keybindings"),
                focusKey: this.searchFocusContextKey
            }));
            this._register(this.searchWidget.onDidChange(function (searchValue) { return _this.delayedFiltering.trigger(function () { return _this.filterKeybindings(); }); }));
            this.sortByPrecedence = this._register(new checkbox_1.Checkbox({
                actionClassName: 'sort-by-precedence',
                isChecked: false,
                onChange: function () { return _this.renderKeybindingsEntries(false); },
                title: nls_1.localize('sortByPrecedene', "Sort by Precedence")
            }));
            searchContainer.appendChild(this.sortByPrecedence.domNode);
            this.createOpenKeybindingsElement(this.headerContainer);
        };
        KeybindingsEditor.prototype.createOpenKeybindingsElement = function (parent) {
            var _this = this;
            var openKeybindingsContainer = DOM.append(parent, $('.open-keybindings-container'));
            DOM.append(openKeybindingsContainer, $('', null, nls_1.localize('header-message', "For advanced customizations open and edit")));
            var fileElement = DOM.append(openKeybindingsContainer, $('.file-name', null, nls_1.localize('keybindings-file-name', "keybindings.json")));
            fileElement.tabIndex = 0;
            this._register(DOM.addDisposableListener(fileElement, DOM.EventType.CLICK, function () { return _this.preferencesService.openGlobalKeybindingSettings(true); }));
            this._register(DOM.addDisposableListener(fileElement, DOM.EventType.KEY_UP, function (e) {
                var keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                switch (keyboardEvent.keyCode) {
                    case 3 /* Enter */:
                        _this.preferencesService.openGlobalKeybindingSettings(true);
                        keyboardEvent.preventDefault();
                        keyboardEvent.stopPropagation();
                        return;
                }
            }));
        };
        KeybindingsEditor.prototype.createBody = function (parent) {
            var bodyContainer = DOM.append(parent, $('.keybindings-body'));
            this.createList(bodyContainer);
        };
        KeybindingsEditor.prototype.createList = function (parent) {
            var _this = this;
            this.keybindingsListContainer = DOM.append(parent, $('.keybindings-list-container'));
            this.keybindingsList = this._register(this.instantiationService.createInstance(listService_1.WorkbenchList, this.keybindingsListContainer, new Delegate(), [new KeybindingHeaderRenderer(), new KeybindingItemRenderer(this, this.keybindingsService)], { identityProvider: function (e) { return e.id; }, mouseSupport: true, ariaLabel: nls_1.localize('keybindingsLabel', "Keybindings") }));
            this._register(this.keybindingsList.onContextMenu(function (e) { return _this.onContextMenu(e); }));
            this._register(this.keybindingsList.onFocusChange(function (e) { return _this.onFocusChange(e); }));
            this._register(this.keybindingsList.onDidFocus(function () {
                DOM.addClass(_this.keybindingsList.getHTMLElement(), 'focused');
            }));
            this._register(this.keybindingsList.onDidBlur(function () {
                DOM.removeClass(_this.keybindingsList.getHTMLElement(), 'focused');
                _this.keybindingFocusContextKey.reset();
            }));
            this._register(this.keybindingsList.onMouseDblClick(function () { return _this.defineKeybinding(_this.activeKeybindingEntry); }));
            this._register(this.keybindingsList.onKeyDown(function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.keyCode === 3 /* Enter */) {
                    var keybindingEntry = _this.activeKeybindingEntry;
                    if (keybindingEntry) {
                        _this.defineKeybinding(_this.activeKeybindingEntry);
                    }
                    e.stopPropagation();
                }
            }));
        };
        KeybindingsEditor.prototype.render = function (preserveFocus) {
            var _this = this;
            if (this.input) {
                return this.input.resolve()
                    .then(function (keybindingsModel) { return _this.keybindingsEditorModel = keybindingsModel; })
                    .then(function () {
                    var editorActionsLabels = editorExtensions_1.EditorExtensionsRegistry.getEditorActions().reduce(function (editorActions, editorAction) {
                        editorActions[editorAction.id] = editorAction.label;
                        return editorActions;
                    }, {});
                    return _this.keybindingsEditorModel.resolve(editorActionsLabels);
                })
                    .then(function () { return _this.renderKeybindingsEntries(false, preserveFocus); });
            }
            return winjs_base_1.TPromise.as(null);
        };
        KeybindingsEditor.prototype.filterKeybindings = function () {
            var _this = this;
            this.renderKeybindingsEntries(this.searchWidget.hasFocus());
            this.delayedFilterLogging.trigger(function () { return _this.reportFilteringUsed(_this.searchWidget.getValue()); });
        };
        KeybindingsEditor.prototype.renderKeybindingsEntries = function (reset, preserveFocus) {
            if (this.keybindingsEditorModel) {
                var filter = this.searchWidget.getValue();
                var keybindingsEntries = this.keybindingsEditorModel.fetch(filter, this.sortByPrecedence.checked);
                if (keybindingsEntries.length === 0) {
                    this.latestEmptyFilters.push(filter);
                }
                var currentSelectedIndex = this.keybindingsList.getSelection()[0];
                this.listEntries = [{ id: 'keybinding-header-entry', templateId: keybindingsEditorModel_1.KEYBINDING_HEADER_TEMPLATE_ID }].concat(keybindingsEntries);
                this.keybindingsList.splice(0, this.keybindingsList.length, this.listEntries);
                this.layoutKebindingsList();
                if (reset) {
                    this.keybindingsList.setSelection([]);
                    this.keybindingsList.setFocus([]);
                }
                else {
                    if (this.unAssignedKeybindingItemToRevealAndFocus) {
                        var index = this.getNewIndexOfUnassignedKeybinding(this.unAssignedKeybindingItemToRevealAndFocus);
                        if (index !== -1) {
                            this.keybindingsList.reveal(index, 0.2);
                            this.selectEntry(index);
                        }
                        this.unAssignedKeybindingItemToRevealAndFocus = null;
                    }
                    else if (currentSelectedIndex !== -1 && currentSelectedIndex < this.listEntries.length) {
                        this.selectEntry(currentSelectedIndex);
                    }
                    else if (this.editorService.getActiveEditor() === this && !preserveFocus) {
                        this.focus();
                    }
                }
            }
        };
        KeybindingsEditor.prototype.layoutKebindingsList = function () {
            var listHeight = this.dimension.height - (DOM.getDomNodePagePosition(this.headerContainer).height + 12 /*padding*/);
            this.keybindingsListContainer.style.height = listHeight + "px";
            this.keybindingsList.layout(listHeight);
        };
        KeybindingsEditor.prototype.getIndexOf = function (listEntry) {
            var index = this.listEntries.indexOf(listEntry);
            if (index === -1) {
                for (var i = 0; i < this.listEntries.length; i++) {
                    if (this.listEntries[i].id === listEntry.id) {
                        return i;
                    }
                }
            }
            return index;
        };
        KeybindingsEditor.prototype.getNewIndexOfUnassignedKeybinding = function (unassignedKeybinding) {
            for (var index = 0; index < this.listEntries.length; index++) {
                var entry = this.listEntries[index];
                if (entry.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                    var keybindingItemEntry = entry;
                    if (keybindingItemEntry.keybindingItem.command === unassignedKeybinding.keybindingItem.command) {
                        return index;
                    }
                }
            }
            return -1;
        };
        KeybindingsEditor.prototype.selectEntry = function (keybindingItemEntry) {
            var index = typeof keybindingItemEntry === 'number' ? keybindingItemEntry : this.getIndexOf(keybindingItemEntry);
            if (index !== -1) {
                this.keybindingsList.getHTMLElement().focus();
                this.keybindingsList.setFocus([index]);
                this.keybindingsList.setSelection([index]);
            }
        };
        KeybindingsEditor.prototype.focusKeybindings = function () {
            this.keybindingsList.getHTMLElement().focus();
            var currentFocusIndices = this.keybindingsList.getFocus();
            this.keybindingsList.setFocus([currentFocusIndices.length ? currentFocusIndices[0] : 0]);
        };
        KeybindingsEditor.prototype.onContextMenu = function (e) {
            var _this = this;
            if (e.element.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                this.selectEntry(e.element);
                this.contextMenuService.showContextMenu({
                    getAnchor: function () { return e.anchor; },
                    getActions: function () { return winjs_base_1.TPromise.as([
                        _this.createCopyAction(e.element),
                        _this.createCopyCommandAction(e.element),
                        new actionbar_1.Separator(),
                        _this.createDefineAction(e.element),
                        _this.createRemoveAction(e.element),
                        _this.createResetAction(e.element),
                        new actionbar_1.Separator(),
                        _this.createShowConflictsAction(e.element)
                    ]); }
                });
            }
        };
        KeybindingsEditor.prototype.onFocusChange = function (e) {
            this.keybindingFocusContextKey.reset();
            var element = e.elements[0];
            if (!element) {
                return;
            }
            if (element.templateId === keybindingsEditorModel_1.KEYBINDING_HEADER_TEMPLATE_ID) {
                this.keybindingsList.focusNext();
                return;
            }
            if (element.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                this.keybindingFocusContextKey.set(true);
            }
        };
        KeybindingsEditor.prototype.createDefineAction = function (keybindingItemEntry) {
            var _this = this;
            return {
                label: keybindingItemEntry.keybindingItem.keybinding ? nls_1.localize('changeLabel', "Change Keybinding") : nls_1.localize('addLabel', "Add Keybinding"),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE,
                run: function () { return _this.defineKeybinding(keybindingItemEntry); }
            };
        };
        KeybindingsEditor.prototype.createRemoveAction = function (keybindingItem) {
            var _this = this;
            return {
                label: nls_1.localize('removeLabel', "Remove Keybinding"),
                enabled: !!keybindingItem.keybindingItem.keybinding,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_REMOVE,
                run: function () { return _this.removeKeybinding(keybindingItem); }
            };
        };
        KeybindingsEditor.prototype.createResetAction = function (keybindingItem) {
            var _this = this;
            return {
                label: nls_1.localize('resetLabel', "Reset Keybinding"),
                enabled: !keybindingItem.keybindingItem.keybindingItem.isDefault,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RESET,
                run: function () { return _this.resetKeybinding(keybindingItem); }
            };
        };
        KeybindingsEditor.prototype.createShowConflictsAction = function (keybindingItem) {
            var _this = this;
            return {
                label: nls_1.localize('showSameKeybindings', "Show Same Keybindings"),
                enabled: !!keybindingItem.keybindingItem.keybinding,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
                run: function () { return _this.showSimilarKeybindings(keybindingItem); }
            };
        };
        KeybindingsEditor.prototype.createCopyAction = function (keybindingItem) {
            var _this = this;
            return {
                label: nls_1.localize('copyLabel', "Copy"),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY,
                run: function () { return _this.copyKeybinding(keybindingItem); }
            };
        };
        KeybindingsEditor.prototype.createCopyCommandAction = function (keybinding) {
            var _this = this;
            return {
                label: nls_1.localize('copyCommandLabel', "Copy Command"),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
                run: function () { return _this.copyKeybindingCommand(keybinding); }
            };
        };
        KeybindingsEditor.prototype.reportFilteringUsed = function (filter) {
            if (filter) {
                var data = {
                    filter: filter,
                    emptyFilters: this.getLatestEmptyFiltersForTelemetry()
                };
                this.latestEmptyFilters = [];
                /* __GDPR__
                    "keybindings.filter" : {
                        "filter": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                        "emptyFilters" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog('keybindings.filter', data);
            }
        };
        /**
         * Put a rough limit on the size of the telemetry data, since otherwise it could be an unbounded large amount
         * of data. 8192 is the max size of a property value. This is rough since that probably includes ""s, etc.
         */
        KeybindingsEditor.prototype.getLatestEmptyFiltersForTelemetry = function () {
            var cumulativeSize = 0;
            return this.latestEmptyFilters.filter(function (filterText) { return (cumulativeSize += filterText.length) <= 8192; });
        };
        KeybindingsEditor.prototype.reportKeybindingAction = function (action, command, keybinding) {
            // __GDPR__TODO__ Need to move off dynamic event names and properties as they cannot be registered statically
            this.telemetryService.publicLog(action, { command: command, keybinding: keybinding ? (typeof keybinding === 'string' ? keybinding : keybinding.getUserSettingsLabel()) : '' });
        };
        KeybindingsEditor.prototype.onKeybindingEditingError = function (error) {
            this.messageService.show(message_1.Severity.Error, typeof error === 'string' ? error : nls_1.localize('error', "Error '{0}' while editing keybinding. Please open 'keybindings.json' file and check.", "" + error));
        };
        KeybindingsEditor.ID = 'workbench.editor.keybindings';
        KeybindingsEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, themeService_1.IThemeService),
            __param(2, keybinding_1.IKeybindingService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, preferences_1.IPreferencesService),
            __param(5, keybindingEditing_1.IKeybindingEditingService),
            __param(6, contextkey_1.IContextKeyService),
            __param(7, message_1.IMessageService),
            __param(8, clipboardService_1.IClipboardService),
            __param(9, instantiation_1.IInstantiationService),
            __param(10, editorService_1.IWorkbenchEditorService)
        ], KeybindingsEditor);
        return KeybindingsEditor;
    }(baseEditor_1.BaseEditor));
    exports.KeybindingsEditor = KeybindingsEditor;
    var Delegate = /** @class */ (function () {
        function Delegate() {
        }
        Delegate.prototype.getHeight = function (element) {
            if (element.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                var commandIdMatched = element.keybindingItem.commandLabel && element.commandIdMatches;
                var commandDefaultLabelMatched = !!element.commandDefaultLabelMatches;
                if (commandIdMatched && commandDefaultLabelMatched) {
                    return 60;
                }
                if (commandIdMatched || commandDefaultLabelMatched) {
                    return 40;
                }
            }
            if (element.templateId === keybindingsEditorModel_1.KEYBINDING_HEADER_TEMPLATE_ID) {
                return 30;
            }
            return 24;
        };
        Delegate.prototype.getTemplateId = function (element) {
            return element.templateId;
        };
        return Delegate;
    }());
    var KeybindingHeaderRenderer = /** @class */ (function () {
        function KeybindingHeaderRenderer() {
        }
        Object.defineProperty(KeybindingHeaderRenderer.prototype, "templateId", {
            get: function () { return keybindingsEditorModel_1.KEYBINDING_HEADER_TEMPLATE_ID; },
            enumerable: true,
            configurable: true
        });
        KeybindingHeaderRenderer.prototype.renderTemplate = function (container) {
            DOM.addClass(container, 'keybindings-list-header');
            DOM.append(container, $('.header.actions'), $('.header.command', null, nls_1.localize('command', "Command")), $('.header.keybinding', null, nls_1.localize('keybinding', "Keybinding")), $('.header.source', null, nls_1.localize('source', "Source")), $('.header.when', null, nls_1.localize('when', "When")));
            return {};
        };
        KeybindingHeaderRenderer.prototype.renderElement = function (entry, index, template) {
        };
        KeybindingHeaderRenderer.prototype.disposeTemplate = function (template) {
        };
        return KeybindingHeaderRenderer;
    }());
    var KeybindingItemRenderer = /** @class */ (function () {
        function KeybindingItemRenderer(keybindingsEditor, keybindingsService) {
            this.keybindingsEditor = keybindingsEditor;
            this.keybindingsService = keybindingsService;
        }
        Object.defineProperty(KeybindingItemRenderer.prototype, "templateId", {
            get: function () { return keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID; },
            enumerable: true,
            configurable: true
        });
        KeybindingItemRenderer.prototype.renderTemplate = function (container) {
            DOM.addClass(container, 'keybinding-item');
            var actions = new ActionsColumn(container, this.keybindingsEditor, this.keybindingsService);
            var command = new CommandColumn(container, this.keybindingsEditor);
            var keybinding = new KeybindingColumn(container, this.keybindingsEditor);
            var source = new SourceColumn(container, this.keybindingsEditor);
            var when = new WhenColumn(container, this.keybindingsEditor);
            container.setAttribute('aria-labelledby', [command.id, keybinding.id, source.id, when.id].join(' '));
            return {
                parent: container,
                actions: actions,
                command: command,
                keybinding: keybinding,
                source: source,
                when: when
            };
        };
        KeybindingItemRenderer.prototype.renderElement = function (keybindingEntry, index, template) {
            DOM.toggleClass(template.parent, 'odd', index % 2 === 1);
            template.actions.render(keybindingEntry);
            template.command.render(keybindingEntry);
            template.keybinding.render(keybindingEntry);
            template.source.render(keybindingEntry);
            template.when.render(keybindingEntry);
        };
        KeybindingItemRenderer.prototype.disposeTemplate = function (template) {
        };
        return KeybindingItemRenderer;
    }());
    var Column = /** @class */ (function () {
        function Column(parent, keybindingsEditor) {
            this.parent = parent;
            this.keybindingsEditor = keybindingsEditor;
            this.element = this.create(parent);
            this.id = this.element.getAttribute('id');
        }
        Column.COUNTER = 0;
        return Column;
    }());
    var ActionsColumn = /** @class */ (function (_super) {
        __extends(ActionsColumn, _super);
        function ActionsColumn(parent, keybindingsEditor, keybindingsService) {
            var _this = _super.call(this, parent, keybindingsEditor) || this;
            _this.keybindingsService = keybindingsService;
            return _this;
        }
        ActionsColumn.prototype.create = function (parent) {
            var actionsContainer = DOM.append(parent, $('.column.actions', { id: 'actions_' + ++Column.COUNTER }));
            this.actionBar = new actionbar_1.ActionBar(actionsContainer, { animated: false });
            return actionsContainer;
        };
        ActionsColumn.prototype.render = function (keybindingItemEntry) {
            this.actionBar.clear();
            var actions = [];
            if (keybindingItemEntry.keybindingItem.keybinding) {
                actions.push(this.createEditAction(keybindingItemEntry));
            }
            else {
                actions.push(this.createAddAction(keybindingItemEntry));
            }
            this.actionBar.push(actions, { icon: true });
        };
        ActionsColumn.prototype.createEditAction = function (keybindingItemEntry) {
            var _this = this;
            var keybinding = this.keybindingsService.lookupKeybinding(preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE);
            return {
                class: 'edit',
                enabled: true,
                id: 'editKeybinding',
                tooltip: keybinding ? nls_1.localize('editKeybindingLabelWithKey', "Change Keybinding {0}", "(" + keybinding.getLabel() + ")") : nls_1.localize('editKeybindingLabel', "Change Keybinding"),
                run: function () { return _this.keybindingsEditor.defineKeybinding(keybindingItemEntry); }
            };
        };
        ActionsColumn.prototype.createAddAction = function (keybindingItemEntry) {
            var _this = this;
            var keybinding = this.keybindingsService.lookupKeybinding(preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE);
            return {
                class: 'add',
                enabled: true,
                id: 'addKeybinding',
                tooltip: keybinding ? nls_1.localize('addKeybindingLabelWithKey', "Add Keybinding {0}", "(" + keybinding.getLabel() + ")") : nls_1.localize('addKeybindingLabel', "Add Keybinding"),
                run: function () { return _this.keybindingsEditor.defineKeybinding(keybindingItemEntry); }
            };
        };
        return ActionsColumn;
    }(Column));
    var CommandColumn = /** @class */ (function (_super) {
        __extends(CommandColumn, _super);
        function CommandColumn() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CommandColumn.prototype.create = function (parent) {
            this.commandColumn = DOM.append(parent, $('.column.command', { id: 'command_' + ++Column.COUNTER }));
            return this.commandColumn;
        };
        CommandColumn.prototype.render = function (keybindingItemEntry) {
            DOM.clearNode(this.commandColumn);
            var keybindingItem = keybindingItemEntry.keybindingItem;
            var commandIdMatched = !!(keybindingItem.commandLabel && keybindingItemEntry.commandIdMatches);
            var commandDefaultLabelMatched = !!keybindingItemEntry.commandDefaultLabelMatches;
            DOM.toggleClass(this.commandColumn, 'vertical-align-column', commandIdMatched || commandDefaultLabelMatched);
            this.commandColumn.setAttribute('aria-label', this.getAriaLabel(keybindingItemEntry));
            var commandLabel;
            if (keybindingItem.commandLabel) {
                commandLabel = new highlightedLabel_1.HighlightedLabel(this.commandColumn);
                commandLabel.set(keybindingItem.commandLabel, keybindingItemEntry.commandLabelMatches);
            }
            if (keybindingItemEntry.commandDefaultLabelMatches) {
                commandLabel = new highlightedLabel_1.HighlightedLabel(DOM.append(this.commandColumn, $('.command-default-label')));
                commandLabel.set(keybindingItem.commandDefaultLabel, keybindingItemEntry.commandDefaultLabelMatches);
            }
            if (keybindingItemEntry.commandIdMatches || !keybindingItem.commandLabel) {
                commandLabel = new highlightedLabel_1.HighlightedLabel(DOM.append(this.commandColumn, $('.code')));
                commandLabel.set(keybindingItem.command, keybindingItemEntry.commandIdMatches);
            }
            if (commandLabel) {
                commandLabel.element.title = keybindingItem.commandLabel ? nls_1.localize('title', "{0} ({1})", keybindingItem.commandLabel, keybindingItem.command) : keybindingItem.command;
            }
        };
        CommandColumn.prototype.getAriaLabel = function (keybindingItemEntry) {
            return nls_1.localize('commandAriaLabel', "Command is {0}.", keybindingItemEntry.keybindingItem.commandLabel ? keybindingItemEntry.keybindingItem.commandLabel : keybindingItemEntry.keybindingItem.command);
        };
        return CommandColumn;
    }(Column));
    var KeybindingColumn = /** @class */ (function (_super) {
        __extends(KeybindingColumn, _super);
        function KeybindingColumn() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        KeybindingColumn.prototype.create = function (parent) {
            this.keybindingColumn = DOM.append(parent, $('.column.keybinding', { id: 'keybinding_' + ++Column.COUNTER }));
            return this.keybindingColumn;
        };
        KeybindingColumn.prototype.render = function (keybindingItemEntry) {
            DOM.clearNode(this.keybindingColumn);
            this.keybindingColumn.setAttribute('aria-label', this.getAriaLabel(keybindingItemEntry));
            if (keybindingItemEntry.keybindingItem.keybinding) {
                new keybindingLabel_1.KeybindingLabel(this.keybindingColumn, platform_1.OS).set(keybindingItemEntry.keybindingItem.keybinding, keybindingItemEntry.keybindingMatches);
            }
        };
        KeybindingColumn.prototype.getAriaLabel = function (keybindingItemEntry) {
            return keybindingItemEntry.keybindingItem.keybinding ? nls_1.localize('keybindingAriaLabel', "Keybinding is {0}.", keybindingItemEntry.keybindingItem.keybinding.getAriaLabel()) : nls_1.localize('noKeybinding', "No Keybinding assigned.");
        };
        return KeybindingColumn;
    }(Column));
    var SourceColumn = /** @class */ (function (_super) {
        __extends(SourceColumn, _super);
        function SourceColumn() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SourceColumn.prototype.create = function (parent) {
            this.sourceColumn = DOM.append(parent, $('.column.source', { id: 'source_' + ++Column.COUNTER }));
            return this.sourceColumn;
        };
        SourceColumn.prototype.render = function (keybindingItemEntry) {
            DOM.clearNode(this.sourceColumn);
            this.sourceColumn.setAttribute('aria-label', this.getAriaLabel(keybindingItemEntry));
            new highlightedLabel_1.HighlightedLabel(this.sourceColumn).set(keybindingItemEntry.keybindingItem.source, keybindingItemEntry.sourceMatches);
        };
        SourceColumn.prototype.getAriaLabel = function (keybindingItemEntry) {
            return nls_1.localize('sourceAriaLabel', "Source is {0}.", keybindingItemEntry.keybindingItem.source);
        };
        return SourceColumn;
    }(Column));
    var WhenColumn = /** @class */ (function (_super) {
        __extends(WhenColumn, _super);
        function WhenColumn() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WhenColumn.prototype.create = function (parent) {
            var column = DOM.append(parent, $('.column.when'));
            this.whenColumn = DOM.append(column, $('div', { id: 'when_' + ++Column.COUNTER }));
            return this.whenColumn;
        };
        WhenColumn.prototype.render = function (keybindingItemEntry) {
            DOM.clearNode(this.whenColumn);
            this.whenColumn.setAttribute('aria-label', this.getAriaLabel(keybindingItemEntry));
            DOM.toggleClass(this.whenColumn, 'code', !!keybindingItemEntry.keybindingItem.when);
            DOM.toggleClass(this.whenColumn, 'empty', !keybindingItemEntry.keybindingItem.when);
            if (keybindingItemEntry.keybindingItem.when) {
                new highlightedLabel_1.HighlightedLabel(this.whenColumn).set(keybindingItemEntry.keybindingItem.when, keybindingItemEntry.whenMatches);
                this.whenColumn.title = keybindingItemEntry.keybindingItem.when;
            }
            else {
                this.whenColumn.textContent = '—';
            }
        };
        WhenColumn.prototype.getAriaLabel = function (keybindingItemEntry) {
            return keybindingItemEntry.keybindingItem.when ? nls_1.localize('whenAriaLabel', "When is {0}.", keybindingItemEntry.keybindingItem.when) : nls_1.localize('noWhen', "No when context.");
        };
        return WhenColumn;
    }(Column));
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var listHighlightForegroundColor = theme.getColor(colorRegistry_1.listHighlightForeground);
        if (listHighlightForegroundColor) {
            collector.addRule(".keybindings-editor > .keybindings-body > .keybindings-list-container .monaco-list-row > .column .highlight { color: " + listHighlightForegroundColor + "; }");
        }
    });
});
