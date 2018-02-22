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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/event", "vs/base/common/errors", "vs/base/browser/ui/aria/aria", "vs/base/common/platform", "vs/base/common/async", "vs/base/common/strings", "vs/base/common/paths", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/builder", "vs/base/browser/ui/findinput/findInput", "vs/workbench/common/memento", "vs/workbench/parts/preferences/common/preferences", "vs/workbench/services/group/common/groupService", "vs/platform/files/common/files", "vs/workbench/browser/viewlet", "vs/workbench/parts/search/common/searchModel", "vs/workbench/parts/search/common/queryBuilder", "vs/base/browser/ui/inputbox/inputBox", "vs/workbench/services/editor/common/editorService", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/platform/progress/common/progress", "vs/platform/workspace/common/workspace", "vs/platform/contextkey/common/contextkey", "vs/platform/telemetry/common/telemetry", "vs/workbench/parts/search/browser/patternInputWidget", "vs/workbench/parts/search/browser/searchResultsView", "vs/workbench/parts/search/browser/searchWidget", "vs/workbench/parts/search/browser/searchActions", "vs/workbench/parts/search/common/replace", "vs/base/common/severity", "vs/workbench/services/untitled/common/untitledEditorService", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/parts/search/common/constants", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/parts/search/common/search", "vs/workbench/parts/preferences/browser/preferencesEditor", "vs/editor/browser/editorBrowser", "vs/platform/list/browser/listService", "vs/workbench/browser/dnd", "vs/css!./media/searchviewlet"], function (require, exports, nls, winjs_base_1, event_1, errors, aria, env, async_1, strings, paths, dom, keyboardEvent_1, builder_1, findInput_1, memento_1, preferences_1, groupService_1, files_1, viewlet_1, searchModel_1, queryBuilder_1, inputBox_1, editorService_1, storage_1, configuration_1, contextView_1, instantiation_1, message_1, progress_1, workspace_1, contextkey_1, telemetry_1, patternInputWidget_1, searchResultsView_1, searchWidget_1, searchActions_1, replace_1, severity_1, untitledEditorService_1, workspaceActions_1, Constants, themeService_1, colorRegistry_1, search_1, preferencesEditor_1, editorBrowser_1, listService_1, dnd_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SearchViewlet = /** @class */ (function (_super) {
        __extends(SearchViewlet, _super);
        function SearchViewlet(telemetryService, fileService, editorService, editorGroupService, progressService, messageService, storageService, contextViewService, instantiationService, configurationService, contextService, searchWorkbenchService, contextKeyService, replaceService, untitledEditorService, preferencesService, themeService) {
            var _this = _super.call(this, Constants.VIEWLET_ID, telemetryService, themeService) || this;
            _this.fileService = fileService;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.progressService = progressService;
            _this.messageService = messageService;
            _this.storageService = storageService;
            _this.contextViewService = contextViewService;
            _this.instantiationService = instantiationService;
            _this.configurationService = configurationService;
            _this.contextService = contextService;
            _this.searchWorkbenchService = searchWorkbenchService;
            _this.contextKeyService = contextKeyService;
            _this.replaceService = replaceService;
            _this.untitledEditorService = untitledEditorService;
            _this.preferencesService = preferencesService;
            _this.themeService = themeService;
            _this.actions = [];
            _this.viewletVisible = Constants.SearchViewletVisibleKey.bindTo(contextKeyService);
            _this.inputBoxFocused = Constants.InputBoxFocusedKey.bindTo(_this.contextKeyService);
            _this.inputPatternIncludesFocused = Constants.PatternIncludesFocusedKey.bindTo(_this.contextKeyService);
            _this.inputPatternExclusionsFocused = Constants.PatternExcludesFocusedKey.bindTo(_this.contextKeyService);
            _this.firstMatchFocused = Constants.FirstMatchFocusKey.bindTo(contextKeyService);
            _this.fileMatchOrMatchFocused = Constants.FileMatchOrMatchFocusKey.bindTo(contextKeyService);
            _this.fileMatchFocused = Constants.FileFocusKey.bindTo(contextKeyService);
            _this.folderMatchFocused = Constants.FolderFocusKey.bindTo(contextKeyService);
            _this.matchFocused = Constants.MatchFocusKey.bindTo(_this.contextKeyService);
            _this.queryBuilder = _this.instantiationService.createInstance(queryBuilder_1.QueryBuilder);
            _this.viewletSettings = _this.getMemento(storageService, memento_1.Scope.WORKSPACE);
            _this.toUnbind.push(_this.fileService.onFileChanges(function (e) { return _this.onFilesChanged(e); }));
            _this.toUnbind.push(_this.untitledEditorService.onDidChangeDirty(function (e) { return _this.onUntitledDidChangeDirty(e); }));
            _this.toUnbind.push(_this.contextService.onDidChangeWorkbenchState(function () { return _this.onDidChangeWorkbenchState(); }));
            _this.selectCurrentMatchEmitter = new event_1.Emitter();
            event_1.debounceEvent(_this.selectCurrentMatchEmitter.event, function (l, e) { return e; }, 100, /*leading=*/ true)(function () { return _this.selectCurrentMatch(); });
            _this.delayedRefresh = new async_1.Delayer(250);
            return _this;
        }
        SearchViewlet.prototype.onDidChangeWorkbenchState = function () {
            if (this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY && this.searchWithoutFolderMessageBuilder) {
                this.searchWithoutFolderMessageBuilder.hide();
            }
        };
        SearchViewlet.prototype.create = function (parent) {
            var _this = this;
            _super.prototype.create.call(this, parent);
            this.viewModel = this.searchWorkbenchService.searchModel;
            var builder;
            parent.div({
                'class': 'search-viewlet'
            }, function (div) {
                builder = div;
            });
            builder.div({ 'class': ['search-widgets-container'] }, function (div) {
                _this.searchWidgetsContainer = div;
            });
            this.createSearchWidget(this.searchWidgetsContainer);
            var filePatterns = this.viewletSettings['query.filePatterns'] || '';
            var patternExclusions = this.viewletSettings['query.folderExclusions'] || '';
            var patternExclusionsHistory = this.viewletSettings['query.folderExclusionsHistory'] || [];
            var patternIncludes = this.viewletSettings['query.folderIncludes'] || '';
            var patternIncludesHistory = this.viewletSettings['query.folderIncludesHistory'] || [];
            var queryDetailsExpanded = this.viewletSettings['query.queryDetailsExpanded'] || '';
            var useExcludesAndIgnoreFiles = typeof this.viewletSettings['query.useExcludesAndIgnoreFiles'] === 'boolean' ?
                this.viewletSettings['query.useExcludesAndIgnoreFiles'] : true;
            this.queryDetails = this.searchWidgetsContainer.div({ 'class': ['query-details'] }, function (builder) {
                builder.div({ 'class': 'more', 'tabindex': 0, 'role': 'button', 'title': nls.localize('moreSearch', "Toggle Search Details") })
                    .on(dom.EventType.CLICK, function (e) {
                    dom.EventHelper.stop(e);
                    _this.toggleQueryDetails(true);
                }).on(dom.EventType.KEY_UP, function (e) {
                    var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
                        dom.EventHelper.stop(e);
                        _this.toggleQueryDetails();
                    }
                });
                //folder includes list
                builder.div({ 'class': 'file-types' }, function (builder) {
                    var title = nls.localize('searchScope.includes', "files to include");
                    builder.element('h4', { text: title });
                    _this.inputPatternIncludes = new patternInputWidget_1.PatternInputWidget(builder.getContainer(), _this.contextViewService, _this.themeService, {
                        ariaLabel: nls.localize('label.includes', 'Search Include Patterns')
                    });
                    _this.inputPatternIncludes.setValue(patternIncludes);
                    _this.inputPatternIncludes.setHistory(patternIncludesHistory);
                    _this.inputPatternIncludes
                        .on(findInput_1.FindInput.OPTION_CHANGE, function (e) {
                        _this.onQueryChanged(false);
                    });
                    _this.inputPatternIncludes.onSubmit(function () { return _this.onQueryChanged(true, true); });
                    _this.inputPatternIncludes.onCancel(function () { return _this.viewModel.cancelSearch(); }); // Cancel search without focusing the search widget
                    _this.trackInputBox(_this.inputPatternIncludes.inputFocusTracker, _this.inputPatternIncludesFocused);
                });
                //pattern exclusion list
                builder.div({ 'class': 'file-types' }, function (builder) {
                    var title = nls.localize('searchScope.excludes', "files to exclude");
                    builder.element('h4', { text: title });
                    _this.inputPatternExcludes = new patternInputWidget_1.ExcludePatternInputWidget(builder.getContainer(), _this.contextViewService, _this.themeService, {
                        ariaLabel: nls.localize('label.excludes', 'Search Exclude Patterns')
                    });
                    _this.inputPatternExcludes.setValue(patternExclusions);
                    _this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(useExcludesAndIgnoreFiles);
                    _this.inputPatternExcludes.setHistory(patternExclusionsHistory);
                    _this.inputPatternExcludes
                        .on(findInput_1.FindInput.OPTION_CHANGE, function (e) {
                        _this.onQueryChanged(false);
                    });
                    _this.inputPatternExcludes.onSubmit(function () { return _this.onQueryChanged(true, true); });
                    _this.inputPatternExcludes.onSubmit(function () { return _this.onQueryChanged(true, true); });
                    _this.inputPatternExcludes.onCancel(function () { return _this.viewModel.cancelSearch(); }); // Cancel search without focusing the search widget
                    _this.trackInputBox(_this.inputPatternExcludes.inputFocusTracker, _this.inputPatternExclusionsFocused);
                });
            }).getHTMLElement();
            this.messages = builder.div({ 'class': 'messages' }).hide().clone();
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                this.searchWithoutFolderMessage(this.clearMessage());
            }
            this.createSearchResultsView(builder);
            this.actions = [
                this.instantiationService.createInstance(searchActions_1.RefreshAction, searchActions_1.RefreshAction.ID, searchActions_1.RefreshAction.LABEL),
                this.instantiationService.createInstance(searchActions_1.CollapseDeepestExpandedLevelAction, searchActions_1.CollapseDeepestExpandedLevelAction.ID, searchActions_1.CollapseDeepestExpandedLevelAction.LABEL),
                this.instantiationService.createInstance(searchActions_1.ClearSearchResultsAction, searchActions_1.ClearSearchResultsAction.ID, searchActions_1.ClearSearchResultsAction.LABEL)
            ];
            if (filePatterns !== '' || patternExclusions !== '' || patternIncludes !== '' || queryDetailsExpanded !== '' || !useExcludesAndIgnoreFiles) {
                this.toggleQueryDetails(true, true, true);
            }
            this.toUnbind.push(this.viewModel.searchResult.onChange(function (event) { return _this.onSearchResultsChanged(event); }));
            return winjs_base_1.TPromise.as(null);
        };
        Object.defineProperty(SearchViewlet.prototype, "searchAndReplaceWidget", {
            get: function () {
                return this.searchWidget;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchViewlet.prototype, "searchIncludePattern", {
            get: function () {
                return this.inputPatternIncludes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchViewlet.prototype, "searchExcludePattern", {
            get: function () {
                return this.inputPatternExcludes;
            },
            enumerable: true,
            configurable: true
        });
        SearchViewlet.prototype.updateActions = function () {
            for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
                var action = _a[_i];
                action.update();
            }
        };
        SearchViewlet.prototype.createSearchWidget = function (builder) {
            var _this = this;
            var contentPattern = this.viewletSettings['query.contentPattern'] || '';
            var isRegex = this.viewletSettings['query.regex'] === true;
            var isWholeWords = this.viewletSettings['query.wholeWords'] === true;
            var isCaseSensitive = this.viewletSettings['query.caseSensitive'] === true;
            var searchHistory = this.viewletSettings['query.searchHistory'] || [];
            this.searchWidget = this.instantiationService.createInstance(searchWidget_1.SearchWidget, builder, {
                value: contentPattern,
                isRegex: isRegex,
                isCaseSensitive: isCaseSensitive,
                isWholeWords: isWholeWords,
                history: searchHistory
            });
            if (this.storageService.getBoolean(SearchViewlet.SHOW_REPLACE_STORAGE_KEY, storage_1.StorageScope.WORKSPACE, true)) {
                this.searchWidget.toggleReplace(true);
            }
            this.toUnbind.push(this.searchWidget);
            this.toUnbind.push(this.searchWidget.onSearchSubmit(function (refresh) { return _this.onQueryChanged(refresh); }));
            this.toUnbind.push(this.searchWidget.onSearchCancel(function () { return _this.cancelSearch(); }));
            this.toUnbind.push(this.searchWidget.searchInput.onDidOptionChange(function (viaKeyboard) { return _this.onQueryChanged(true, viaKeyboard); }));
            this.toUnbind.push(this.searchWidget.onReplaceToggled(function () { return _this.onReplaceToggled(); }));
            this.toUnbind.push(this.searchWidget.onReplaceStateChange(function (state) {
                _this.viewModel.replaceActive = state;
                _this.tree.refresh();
            }));
            this.toUnbind.push(this.searchWidget.onReplaceValueChanged(function (value) {
                _this.viewModel.replaceString = _this.searchWidget.getReplaceValue();
                _this.delayedRefresh.trigger(function () { return _this.tree.refresh(); });
            }));
            this.toUnbind.push(this.searchWidget.onReplaceAll(function () { return _this.replaceAll(); }));
            this.trackInputBox(this.searchWidget.searchInputFocusTracker);
            this.trackInputBox(this.searchWidget.replaceInputFocusTracker);
        };
        SearchViewlet.prototype.trackInputBox = function (inputFocusTracker, contextKey) {
            var _this = this;
            this.toUnbind.push(inputFocusTracker.onDidFocus(function () {
                _this.inputBoxFocused.set(true);
                if (contextKey) {
                    contextKey.set(true);
                }
            }));
            this.toUnbind.push(inputFocusTracker.onDidBlur(function () {
                _this.inputBoxFocused.set(_this.searchWidget.searchInputHasFocus()
                    || _this.searchWidget.replaceInputHasFocus()
                    || _this.inputPatternIncludes.inputHasFocus()
                    || _this.inputPatternExcludes.inputHasFocus());
                if (contextKey) {
                    contextKey.set(false);
                }
            }));
        };
        SearchViewlet.prototype.onReplaceToggled = function () {
            this.layout(this.size);
            var isReplaceShown = this.searchAndReplaceWidget.isReplaceShown();
            if (!isReplaceShown) {
                this.storageService.store(SearchViewlet.SHOW_REPLACE_STORAGE_KEY, false, storage_1.StorageScope.WORKSPACE);
            }
            else {
                this.storageService.remove(SearchViewlet.SHOW_REPLACE_STORAGE_KEY);
            }
        };
        SearchViewlet.prototype.onSearchResultsChanged = function (event) {
            if (this.isVisible()) {
                return this.refreshAndUpdateCount(event);
            }
            else {
                this.changedWhileHidden = true;
                return winjs_base_1.TPromise.wrap(null);
            }
        };
        SearchViewlet.prototype.refreshAndUpdateCount = function (event) {
            var _this = this;
            return this.refreshTree(event).then(function () {
                _this.searchWidget.setReplaceAllActionState(!_this.viewModel.searchResult.isEmpty());
                _this.updateSearchResultCount();
            });
        };
        SearchViewlet.prototype.refreshTree = function (event) {
            if (!event || event.added || event.removed) {
                return this.tree.refresh(this.viewModel.searchResult);
            }
            else {
                if (event.elements.length === 1) {
                    return this.tree.refresh(event.elements[0]);
                }
                else {
                    return this.tree.refresh(event.elements);
                }
            }
        };
        SearchViewlet.prototype.replaceAll = function () {
            var _this = this;
            if (this.viewModel.searchResult.count() === 0) {
                return;
            }
            var progressRunner = this.progressService.show(100);
            var occurrences = this.viewModel.searchResult.count();
            var fileCount = this.viewModel.searchResult.fileCount();
            var replaceValue = this.searchWidget.getReplaceValue() || '';
            var afterReplaceAllMessage = this.buildAfterReplaceAllMessage(occurrences, fileCount, replaceValue);
            var confirmation = {
                title: nls.localize('replaceAll.confirmation.title', "Replace All"),
                message: this.buildReplaceAllConfirmationMessage(occurrences, fileCount, replaceValue),
                primaryButton: nls.localize('replaceAll.confirm.button', "&&Replace"),
                type: 'question'
            };
            this.messageService.confirm(confirmation).then(function (confirmed) {
                if (confirmed) {
                    _this.searchWidget.setReplaceAllActionState(false);
                    _this.viewModel.searchResult.replaceAll(progressRunner).then(function () {
                        progressRunner.done();
                        _this.clearMessage()
                            .p({ text: afterReplaceAllMessage });
                    }, function (error) {
                        progressRunner.done();
                        errors.isPromiseCanceledError(error);
                        _this.messageService.show(severity_1.default.Error, error);
                    });
                }
            });
        };
        SearchViewlet.prototype.buildAfterReplaceAllMessage = function (occurrences, fileCount, replaceValue) {
            if (occurrences === 1) {
                if (fileCount === 1) {
                    if (replaceValue) {
                        return nls.localize('replaceAll.occurrence.file.message', "Replaced {0} occurrence across {1} file with '{2}'.", occurrences, fileCount, replaceValue);
                    }
                    return nls.localize('removeAll.occurrence.file.message', "Replaced {0} occurrence across {1} file'.", occurrences, fileCount);
                }
                if (replaceValue) {
                    return nls.localize('replaceAll.occurrence.files.message', "Replaced {0} occurrence across {1} files with '{2}'.", occurrences, fileCount, replaceValue);
                }
                return nls.localize('removeAll.occurrence.files.message', "Replaced {0} occurrence across {1} files.", occurrences, fileCount);
            }
            if (fileCount === 1) {
                if (replaceValue) {
                    return nls.localize('replaceAll.occurrences.file.message', "Replaced {0} occurrences across {1} file with '{2}'.", occurrences, fileCount, replaceValue);
                }
                return nls.localize('removeAll.occurrences.file.message', "Replaced {0} occurrences across {1} file'.", occurrences, fileCount);
            }
            if (replaceValue) {
                return nls.localize('replaceAll.occurrences.files.message', "Replaced {0} occurrences across {1} files with '{2}'.", occurrences, fileCount, replaceValue);
            }
            return nls.localize('removeAll.occurrences.files.message', "Replaced {0} occurrences across {1} files.", occurrences, fileCount);
        };
        SearchViewlet.prototype.buildReplaceAllConfirmationMessage = function (occurrences, fileCount, replaceValue) {
            if (occurrences === 1) {
                if (fileCount === 1) {
                    if (replaceValue) {
                        return nls.localize('removeAll.occurrence.file.confirmation.message', "Replace {0} occurrence across {1} file with '{2}'?", occurrences, fileCount, replaceValue);
                    }
                    return nls.localize('replaceAll.occurrence.file.confirmation.message', "Replace {0} occurrence across {1} file'?", occurrences, fileCount);
                }
                if (replaceValue) {
                    return nls.localize('removeAll.occurrence.files.confirmation.message', "Replace {0} occurrence across {1} files with '{2}'?", occurrences, fileCount, replaceValue);
                }
                return nls.localize('replaceAll.occurrence.files.confirmation.message', "Replace {0} occurrence across {1} files?", occurrences, fileCount);
            }
            if (fileCount === 1) {
                if (replaceValue) {
                    return nls.localize('removeAll.occurrences.file.confirmation.message', "Replace {0} occurrences across {1} file with '{2}'?", occurrences, fileCount, replaceValue);
                }
                return nls.localize('replaceAll.occurrences.file.confirmation.message', "Replace {0} occurrences across {1} file'?", occurrences, fileCount);
            }
            if (replaceValue) {
                return nls.localize('removeAll.occurrences.files.confirmation.message', "Replace {0} occurrences across {1} files with '{2}'?", occurrences, fileCount, replaceValue);
            }
            return nls.localize('replaceAll.occurrences.files.confirmation.message', "Replace {0} occurrences across {1} files?", occurrences, fileCount);
        };
        SearchViewlet.prototype.clearMessage = function () {
            this.searchWithoutFolderMessageBuilder = void 0;
            return this.messages.empty().show()
                .asContainer().div({ 'class': 'message' })
                .asContainer();
        };
        SearchViewlet.prototype.createSearchResultsView = function (builder) {
            var _this = this;
            builder.div({ 'class': 'results' }, function (div) {
                _this.results = div;
                _this.results.addClass('show-file-icons');
                var dataSource = _this.instantiationService.createInstance(searchResultsView_1.SearchDataSource);
                _this.toUnbind.push(dataSource);
                var renderer = _this.instantiationService.createInstance(searchResultsView_1.SearchRenderer, _this.getActionRunner(), _this);
                _this.toUnbind.push(renderer);
                var dnd = _this.instantiationService.createInstance(dnd_1.SimpleFileResourceDragAndDrop, function (obj) { return obj instanceof searchModel_1.FileMatch ? obj.resource() : void 0; });
                _this.tree = _this.instantiationService.createInstance(listService_1.WorkbenchTree, div.getHTMLElement(), {
                    dataSource: dataSource,
                    renderer: renderer,
                    sorter: new searchResultsView_1.SearchSorter(),
                    filter: new searchResultsView_1.SearchFilter(),
                    accessibilityProvider: _this.instantiationService.createInstance(searchResultsView_1.SearchAccessibilityProvider),
                    dnd: dnd
                }, {
                    ariaLabel: nls.localize('treeAriaLabel', "Search Results")
                });
                _this.tree.setInput(_this.viewModel.searchResult);
                _this.toUnbind.push(renderer);
                var searchResultsNavigator = _this._register(new listService_1.TreeResourceNavigator(_this.tree, { openOnFocus: true }));
                _this._register(event_1.debounceEvent(searchResultsNavigator.openResource, function (last, event) { return event; }, 75, true)(function (options) {
                    if (options.element instanceof searchModel_1.Match) {
                        var selectedMatch = options.element;
                        if (_this.currentSelectedFileMatch) {
                            _this.currentSelectedFileMatch.setSelectedMatch(null);
                        }
                        _this.currentSelectedFileMatch = selectedMatch.parent();
                        _this.currentSelectedFileMatch.setSelectedMatch(selectedMatch);
                        if (!(options.payload && options.payload.preventEditorOpen)) {
                            _this.onFocus(selectedMatch, options.editorOptions.preserveFocus, options.sideBySide, options.editorOptions.pinned);
                        }
                    }
                }));
                var treeHasFocus = false;
                _this.tree.onDidFocus(function () {
                    treeHasFocus = true;
                });
                _this.toUnbind.push(_this.tree.onDidChangeFocus(function (e) {
                    if (treeHasFocus) {
                        var focus_1 = e.focus;
                        _this.firstMatchFocused.set(_this.tree.getNavigator().first() === focus_1);
                        _this.fileMatchOrMatchFocused.set(true);
                        _this.fileMatchFocused.set(focus_1 instanceof searchModel_1.FileMatch);
                        _this.folderMatchFocused.set(focus_1 instanceof searchModel_1.FolderMatch);
                        _this.matchFocused.set(focus_1 instanceof searchModel_1.Match);
                    }
                }));
                _this.toUnbind.push(_this.tree.onDidBlur(function (e) {
                    treeHasFocus = false;
                    _this.firstMatchFocused.reset();
                    _this.fileMatchOrMatchFocused.reset();
                    _this.fileMatchFocused.reset();
                    _this.folderMatchFocused.reset();
                    _this.matchFocused.reset();
                }));
            });
        };
        SearchViewlet.prototype.selectCurrentMatch = function () {
            var focused = this.tree.getFocus();
            var eventPayload = { focusEditor: true };
            this.tree.setSelection([focused], eventPayload);
        };
        SearchViewlet.prototype.selectNextMatch = function () {
            var selected = this.tree.getSelection()[0];
            // Expand the initial selected node, if needed
            if (selected instanceof searchModel_1.FileMatch) {
                if (!this.tree.isExpanded(selected)) {
                    this.tree.expand(selected);
                }
            }
            var navigator = this.tree.getNavigator(selected, /*subTreeOnly=*/ false);
            var next = navigator.next();
            if (!next) {
                // Reached the end - get a new navigator from the root.
                // .first and .last only work when subTreeOnly = true. Maybe there's a simpler way.
                navigator = this.tree.getNavigator(this.tree.getInput(), /*subTreeOnly*/ true);
                next = navigator.first();
            }
            // Expand and go past FileMatch nodes
            if (!(next instanceof searchModel_1.Match)) {
                if (!this.tree.isExpanded(next)) {
                    this.tree.expand(next);
                }
                // Select the FileMatch's first child
                next = navigator.next();
            }
            // Reveal the newly selected element
            if (next) {
                var eventPayload = { preventEditorOpen: true };
                this.tree.setFocus(next, eventPayload);
                this.tree.setSelection([next], eventPayload);
                this.tree.reveal(next);
                this.selectCurrentMatchEmitter.fire();
            }
        };
        SearchViewlet.prototype.selectPreviousMatch = function () {
            var selected = this.tree.getSelection()[0];
            var navigator = this.tree.getNavigator(selected, /*subTreeOnly=*/ false);
            var prev = navigator.previous();
            // Expand and go past FileMatch nodes
            if (!(prev instanceof searchModel_1.Match)) {
                prev = navigator.previous();
                if (!prev) {
                    // Wrap around. Get a new tree starting from the root
                    navigator = this.tree.getNavigator(this.tree.getInput(), /*subTreeOnly*/ true);
                    prev = navigator.last();
                    // This is complicated because .last will set the navigator to the last FileMatch,
                    // so expand it and FF to its last child
                    this.tree.expand(prev);
                    var tmp = void 0;
                    while (tmp = navigator.next()) {
                        prev = tmp;
                    }
                }
                if (!(prev instanceof searchModel_1.Match)) {
                    // There is a second non-Match result, which must be a collapsed FileMatch.
                    // Expand it then select its last child.
                    navigator.next();
                    this.tree.expand(prev);
                    prev = navigator.previous();
                }
            }
            // Reveal the newly selected element
            if (prev) {
                var eventPayload = { preventEditorOpen: true };
                this.tree.setFocus(prev, eventPayload);
                this.tree.setSelection([prev], eventPayload);
                this.tree.reveal(prev);
                this.selectCurrentMatchEmitter.fire();
            }
        };
        SearchViewlet.prototype.setVisible = function (visible) {
            var promise;
            this.viewletVisible.set(visible);
            if (visible) {
                if (this.changedWhileHidden) {
                    // Render if results changed while viewlet was hidden - #37818
                    this.refreshAndUpdateCount();
                    this.changedWhileHidden = false;
                }
                promise = _super.prototype.setVisible.call(this, visible);
                this.tree.onVisible();
            }
            else {
                this.tree.onHidden();
                promise = _super.prototype.setVisible.call(this, visible);
            }
            // Enable highlights if there are searchresults
            if (this.viewModel) {
                this.viewModel.searchResult.toggleHighlights(visible);
            }
            // Open focused element from results in case the editor area is otherwise empty
            if (visible && !this.editorService.getActiveEditor()) {
                var focus_2 = this.tree.getFocus();
                if (focus_2) {
                    this.onFocus(focus_2, true);
                }
            }
            return promise;
        };
        SearchViewlet.prototype.focus = function () {
            _super.prototype.focus.call(this);
            var updatedText = false;
            var seedSearchStringFromSelection = this.configurationService.getValue('editor').find.seedSearchStringFromSelection;
            if (seedSearchStringFromSelection) {
                var selectedText = this.getSearchTextFromEditor();
                if (selectedText) {
                    this.searchWidget.searchInput.setValue(selectedText);
                    updatedText = true;
                }
            }
            this.searchWidget.focus(undefined, undefined, updatedText);
        };
        SearchViewlet.prototype.focusNextInputBox = function () {
            if (this.searchWidget.searchInputHasFocus()) {
                if (this.searchWidget.isReplaceShown()) {
                    this.searchWidget.focus(true, true);
                }
                else {
                    this.moveFocusFromSearchOrReplace();
                }
                return;
            }
            if (this.searchWidget.replaceInputHasFocus()) {
                this.moveFocusFromSearchOrReplace();
                return;
            }
            if (this.inputPatternIncludes.inputHasFocus()) {
                this.inputPatternExcludes.focus();
                this.inputPatternExcludes.select();
                return;
            }
            if (this.inputPatternExcludes.inputHasFocus()) {
                this.selectTreeIfNotSelected();
                return;
            }
        };
        SearchViewlet.prototype.moveFocusFromSearchOrReplace = function () {
            if (this.showsFileTypes()) {
                this.toggleQueryDetails(true, this.showsFileTypes());
            }
            else {
                this.selectTreeIfNotSelected();
            }
        };
        SearchViewlet.prototype.focusPreviousInputBox = function () {
            if (this.searchWidget.searchInputHasFocus()) {
                return;
            }
            if (this.searchWidget.replaceInputHasFocus()) {
                this.searchWidget.focus(true);
                return;
            }
            if (this.inputPatternIncludes.inputHasFocus()) {
                this.searchWidget.focus(true, true);
                return;
            }
            if (this.inputPatternExcludes.inputHasFocus()) {
                this.inputPatternIncludes.focus();
                this.inputPatternIncludes.select();
                return;
            }
            if (this.tree.isDOMFocused()) {
                this.moveFocusFromResults();
                return;
            }
        };
        SearchViewlet.prototype.moveFocusFromResults = function () {
            if (this.showsFileTypes()) {
                this.toggleQueryDetails(true, true, false, true);
            }
            else {
                this.searchWidget.focus(true, true);
            }
        };
        SearchViewlet.prototype.reLayout = function () {
            if (this.isDisposed) {
                return;
            }
            this.searchWidget.setWidth(this.size.width - 28 /* container margin */);
            this.inputPatternExcludes.setWidth(this.size.width - 28 /* container margin */);
            this.inputPatternIncludes.setWidth(this.size.width - 28 /* container margin */);
            var messagesSize = this.messages.isHidden() ? 0 : dom.getTotalHeight(this.messages.getHTMLElement());
            var searchResultContainerSize = this.size.height -
                messagesSize -
                dom.getTotalHeight(this.searchWidgetsContainer.getContainer());
            this.results.style({ height: searchResultContainerSize + 'px' });
            this.tree.layout(searchResultContainerSize);
        };
        SearchViewlet.prototype.layout = function (dimension) {
            this.size = dimension;
            this.reLayout();
        };
        SearchViewlet.prototype.getControl = function () {
            return this.tree;
        };
        SearchViewlet.prototype.isSearchSubmitted = function () {
            return this.searchSubmitted;
        };
        SearchViewlet.prototype.isSearching = function () {
            return this.searching;
        };
        SearchViewlet.prototype.hasSearchResults = function () {
            return !this.viewModel.searchResult.isEmpty();
        };
        SearchViewlet.prototype.clearSearchResults = function () {
            this.viewModel.searchResult.clear();
            this.showEmptyStage();
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                this.searchWithoutFolderMessage(this.clearMessage());
            }
            this.searchWidget.clear();
            this.viewModel.cancelSearch();
        };
        SearchViewlet.prototype.cancelSearch = function () {
            if (this.viewModel.cancelSearch()) {
                this.searchWidget.focus();
                return true;
            }
            return false;
        };
        SearchViewlet.prototype.selectTreeIfNotSelected = function () {
            if (this.tree.getInput()) {
                this.tree.DOMFocus();
                var selection = this.tree.getSelection();
                if (selection.length === 0) {
                    this.tree.focusNext();
                }
            }
        };
        SearchViewlet.prototype.getSearchTextFromEditor = function () {
            if (!this.editorService.getActiveEditor()) {
                return null;
            }
            var editorControl = this.editorService.getActiveEditor().getControl();
            if (editorBrowser_1.isDiffEditor(editorControl)) {
                if (editorControl.getOriginalEditor().isFocused()) {
                    editorControl = editorControl.getOriginalEditor();
                }
                else {
                    editorControl = editorControl.getModifiedEditor();
                }
            }
            if (!editorBrowser_1.isCodeEditor(editorControl)) {
                return null;
            }
            var codeEditor = editorControl;
            var range = codeEditor.getSelection();
            if (!range) {
                return null;
            }
            if (range.isEmpty() && !this.searchWidget.searchInput.getValue()) {
                var wordAtPosition = codeEditor.getModel().getWordAtPosition(range.getStartPosition());
                if (wordAtPosition) {
                    return wordAtPosition.word;
                }
            }
            if (!range.isEmpty() && range.startLineNumber === range.endLineNumber) {
                var searchText = editorControl.getModel().getLineContent(range.startLineNumber);
                searchText = searchText.substring(range.startColumn - 1, range.endColumn - 1);
                return searchText;
            }
            return null;
        };
        SearchViewlet.prototype.showsFileTypes = function () {
            return dom.hasClass(this.queryDetails, 'more');
        };
        SearchViewlet.prototype.toggleCaseSensitive = function () {
            this.searchWidget.searchInput.setCaseSensitive(!this.searchWidget.searchInput.getCaseSensitive());
            this.onQueryChanged(true, true);
        };
        SearchViewlet.prototype.toggleWholeWords = function () {
            this.searchWidget.searchInput.setWholeWords(!this.searchWidget.searchInput.getWholeWords());
            this.onQueryChanged(true, true);
        };
        SearchViewlet.prototype.toggleRegex = function () {
            this.searchWidget.searchInput.setRegex(!this.searchWidget.searchInput.getRegex());
            this.onQueryChanged(true, true);
        };
        SearchViewlet.prototype.toggleQueryDetails = function (moveFocus, show, skipLayout, reverse) {
            var cls = 'more';
            show = typeof show === 'undefined' ? !dom.hasClass(this.queryDetails, cls) : Boolean(show);
            this.viewletSettings['query.queryDetailsExpanded'] = show;
            skipLayout = Boolean(skipLayout);
            if (show) {
                dom.addClass(this.queryDetails, cls);
                if (moveFocus) {
                    if (reverse) {
                        this.inputPatternExcludes.focus();
                        this.inputPatternExcludes.select();
                    }
                    else {
                        this.inputPatternIncludes.focus();
                        this.inputPatternIncludes.select();
                    }
                }
            }
            else {
                dom.removeClass(this.queryDetails, cls);
                if (moveFocus) {
                    this.searchWidget.focus();
                }
            }
            if (!skipLayout && this.size) {
                this.layout(this.size);
            }
        };
        SearchViewlet.prototype.searchInFolders = function (resources, pathToRelative) {
            var _this = this;
            var folderPaths = [];
            var workspace = this.contextService.getWorkspace();
            if (resources) {
                resources.forEach(function (resource) {
                    var folderPath;
                    if (_this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.FOLDER) {
                        // Show relative path from the root for single-root mode
                        folderPath = paths.normalize(pathToRelative(workspace.folders[0].uri.fsPath, resource.fsPath));
                        if (folderPath && folderPath !== '.') {
                            folderPath = './' + folderPath;
                        }
                    }
                    else {
                        var owningFolder = _this.contextService.getWorkspaceFolder(resource);
                        if (owningFolder) {
                            var owningRootBasename_1 = paths.basename(owningFolder.uri.fsPath);
                            // If this root is the only one with its basename, use a relative ./ path. If there is another, use an absolute path
                            var isUniqueFolder = workspace.folders.filter(function (folder) { return paths.basename(folder.uri.fsPath) === owningRootBasename_1; }).length === 1;
                            if (isUniqueFolder) {
                                folderPath = "./" + owningRootBasename_1 + "/" + paths.normalize(pathToRelative(owningFolder.uri.fsPath, resource.fsPath));
                            }
                            else {
                                folderPath = resource.fsPath;
                            }
                        }
                    }
                    if (folderPath) {
                        folderPaths.push(folderPath);
                    }
                });
            }
            if (!folderPaths.length || folderPaths.some(function (folderPath) { return folderPath === '.'; })) {
                this.inputPatternIncludes.setValue('');
                this.searchWidget.focus();
                return;
            }
            // Show 'files to include' box
            if (!this.showsFileTypes()) {
                this.toggleQueryDetails(true, true);
            }
            this.inputPatternIncludes.setValue(folderPaths.join(', '));
            this.searchWidget.focus(false);
        };
        SearchViewlet.prototype.onQueryChanged = function (rerunQuery, preserveFocus) {
            var _this = this;
            var isRegex = this.searchWidget.searchInput.getRegex();
            var isWholeWords = this.searchWidget.searchInput.getWholeWords();
            var isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
            var contentPattern = this.searchWidget.searchInput.getValue();
            var excludePatternText = this.inputPatternExcludes.getValue().trim();
            var includePatternText = this.inputPatternIncludes.getValue().trim();
            var useExcludesAndIgnoreFiles = this.inputPatternExcludes.useExcludesAndIgnoreFiles();
            if (!rerunQuery) {
                return;
            }
            if (contentPattern.length === 0) {
                return;
            }
            // Validate regex is OK
            if (isRegex) {
                var regExp = void 0;
                try {
                    regExp = new RegExp(contentPattern);
                }
                catch (e) {
                    return; // malformed regex
                }
                if (strings.regExpLeadsToEndlessLoop(regExp)) {
                    return; // endless regex
                }
            }
            var content = {
                pattern: contentPattern,
                isRegExp: isRegex,
                isCaseSensitive: isCaseSensitive,
                isWordMatch: isWholeWords,
                wordSeparators: this.configurationService.getValue().editor.wordSeparators,
                isSmartCase: this.configurationService.getValue().search.smartCase
            };
            var excludePattern = this.inputPatternExcludes.getValue();
            var includePattern = this.inputPatternIncludes.getValue();
            var options = {
                extraFileResources: search_1.getOutOfWorkspaceEditorResources(this.editorGroupService, this.contextService),
                maxResults: SearchViewlet.MAX_TEXT_RESULTS,
                disregardIgnoreFiles: !useExcludesAndIgnoreFiles,
                disregardExcludeSettings: !useExcludesAndIgnoreFiles,
                excludePattern: excludePattern,
                includePattern: includePattern
            };
            var folderResources = this.contextService.getWorkspace().folders;
            var onQueryValidationError = function (err) {
                _this.searchWidget.searchInput.showMessage({ content: err.message, type: inputBox_1.MessageType.ERROR });
                _this.viewModel.searchResult.clear();
            };
            var query;
            try {
                query = this.queryBuilder.text(content, folderResources.map(function (folder) { return folder.uri; }), options);
            }
            catch (err) {
                onQueryValidationError(err);
                return;
            }
            this.validateQuery(query).then(function () {
                _this.onQueryTriggered(query, excludePatternText, includePatternText);
                if (!preserveFocus) {
                    _this.searchWidget.focus(false); // focus back to input field
                }
            }, onQueryValidationError);
        };
        SearchViewlet.prototype.validateQuery = function (query) {
            var _this = this;
            // Validate folderQueries
            var folderQueriesExistP = query.folderQueries.map(function (fq) {
                return _this.fileService.existsFile(fq.folder);
            });
            return winjs_base_1.TPromise.join(folderQueriesExistP).then(function (existResults) {
                // If no folders exist, show an error message about the first one
                var existingFolderQueries = query.folderQueries.filter(function (folderQuery, i) { return existResults[i]; });
                if (!query.folderQueries.length || existingFolderQueries.length) {
                    query.folderQueries = existingFolderQueries;
                }
                else {
                    var nonExistantPath = query.folderQueries[0].folder.fsPath;
                    var searchPathNotFoundError = nls.localize('searchPathNotFoundError', "Search path not found: {0}", nonExistantPath);
                    return winjs_base_1.TPromise.wrapError(new Error(searchPathNotFoundError));
                }
                return undefined;
            });
        };
        SearchViewlet.prototype.onQueryTriggered = function (query, excludePatternText, includePatternText) {
            var _this = this;
            this.inputPatternExcludes.onSearchSubmit();
            this.inputPatternIncludes.onSearchSubmit();
            this.viewModel.cancelSearch();
            // Progress total is 100.0% for more progress bar granularity
            var progressTotal = 1000;
            var progressWorked = 0;
            var progressRunner = query.useRipgrep ?
                this.progressService.show(/*infinite=*/ true) :
                this.progressService.show(progressTotal);
            this.searchWidget.searchInput.clearMessage();
            this.searching = true;
            setTimeout(function () {
                if (_this.searching) {
                    _this.changeActionAtPosition(0, _this.instantiationService.createInstance(searchActions_1.CancelSearchAction, searchActions_1.CancelSearchAction.ID, searchActions_1.CancelSearchAction.LABEL));
                }
            }, 2000);
            this.showEmptyStage();
            var onComplete = function (completed) {
                _this.searching = false;
                _this.changeActionAtPosition(0, _this.instantiationService.createInstance(searchActions_1.RefreshAction, searchActions_1.RefreshAction.ID, searchActions_1.RefreshAction.LABEL));
                // Complete up to 100% as needed
                if (completed && !query.useRipgrep) {
                    progressRunner.worked(progressTotal - progressWorked);
                    setTimeout(function () { return progressRunner.done(); }, 200);
                }
                else {
                    progressRunner.done();
                }
                // Do final render, then expand if just 1 file with less than 50 matches
                _this.onSearchResultsChanged().then(function () {
                    if (_this.viewModel.searchResult.count() === 1) {
                        var onlyMatch = _this.viewModel.searchResult.matches()[0];
                        if (onlyMatch.count() < 50) {
                            return _this.tree.expand(onlyMatch);
                        }
                    }
                    return null;
                }).done(null, errors.onUnexpectedError);
                _this.viewModel.replaceString = _this.searchWidget.getReplaceValue();
                var hasResults = !_this.viewModel.searchResult.isEmpty();
                _this.searchSubmitted = true;
                _this.updateActions();
                if (completed && completed.limitHit) {
                    _this.searchWidget.searchInput.showMessage({
                        content: nls.localize('searchMaxResultsWarning', "The result set only contains a subset of all matches. Please be more specific in your search to narrow down the results."),
                        type: inputBox_1.MessageType.WARNING
                    });
                }
                if (!hasResults) {
                    var hasExcludes = !!excludePatternText;
                    var hasIncludes = !!includePatternText;
                    var message = void 0;
                    if (!completed) {
                        message = nls.localize('searchCanceled', "Search was canceled before any results could be found - ");
                    }
                    else if (hasIncludes && hasExcludes) {
                        message = nls.localize('noResultsIncludesExcludes', "No results found in '{0}' excluding '{1}' - ", includePatternText, excludePatternText);
                    }
                    else if (hasIncludes) {
                        message = nls.localize('noResultsIncludes', "No results found in '{0}' - ", includePatternText);
                    }
                    else if (hasExcludes) {
                        message = nls.localize('noResultsExcludes', "No results found excluding '{0}' - ", excludePatternText);
                    }
                    else {
                        message = nls.localize('noResultsFound', "No results found. Review your settings for configured exclusions and ignore files - ");
                    }
                    // Indicate as status to ARIA
                    aria.status(message);
                    _this.tree.onHidden();
                    _this.results.hide();
                    var div = _this.clearMessage();
                    var p = builder_1.$(div).p({ text: message });
                    if (!completed) {
                        builder_1.$(p).a({
                            'class': ['pointer', 'prominent'],
                            text: nls.localize('rerunSearch.message', "Search again")
                        }).on(dom.EventType.CLICK, function (e) {
                            dom.EventHelper.stop(e, false);
                            _this.onQueryChanged(true);
                        });
                    }
                    else if (hasIncludes || hasExcludes) {
                        builder_1.$(p).a({
                            'class': ['pointer', 'prominent'],
                            'tabindex': '0',
                            text: nls.localize('rerunSearchInAll.message', "Search again in all files")
                        }).on(dom.EventType.CLICK, function (e) {
                            dom.EventHelper.stop(e, false);
                            _this.inputPatternExcludes.setValue('');
                            _this.inputPatternIncludes.setValue('');
                            _this.onQueryChanged(true);
                        });
                    }
                    else {
                        builder_1.$(p).a({
                            'class': ['pointer', 'prominent'],
                            'tabindex': '0',
                            text: nls.localize('openSettings.message', "Open Settings")
                        }).on(dom.EventType.CLICK, function (e) {
                            dom.EventHelper.stop(e, false);
                            var editorPromise = _this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY ? _this.preferencesService.openWorkspaceSettings() : _this.preferencesService.openGlobalSettings();
                            editorPromise.done(function (editor) {
                                if (editor instanceof preferencesEditor_1.PreferencesEditor) {
                                    editor.focusSearch('.exclude');
                                }
                            }, errors.onUnexpectedError);
                        });
                    }
                    if (completed) {
                        builder_1.$(p).span({
                            text: ' - '
                        });
                        builder_1.$(p).a({
                            'class': ['pointer', 'prominent'],
                            'tabindex': '0',
                            text: nls.localize('openSettings.learnMore', "Learn More")
                        }).on(dom.EventType.CLICK, function (e) {
                            dom.EventHelper.stop(e, false);
                            window.open('https://go.microsoft.com/fwlink/?linkid=853977');
                        });
                    }
                    if (_this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                        _this.searchWithoutFolderMessage(div);
                    }
                }
                else {
                    _this.viewModel.searchResult.toggleHighlights(true); // show highlights
                    // Indicate final search result count for ARIA
                    aria.status(nls.localize('ariaSearchResultsStatus', "Search returned {0} results in {1} files", _this.viewModel.searchResult.count(), _this.viewModel.searchResult.fileCount()));
                }
            };
            var onError = function (e) {
                if (errors.isPromiseCanceledError(e)) {
                    onComplete(null);
                }
                else {
                    _this.searching = false;
                    _this.changeActionAtPosition(0, _this.instantiationService.createInstance(searchActions_1.RefreshAction, searchActions_1.RefreshAction.ID, searchActions_1.RefreshAction.LABEL));
                    progressRunner.done();
                    _this.searchWidget.searchInput.showMessage({ content: e.message, type: inputBox_1.MessageType.ERROR });
                    _this.viewModel.searchResult.clear();
                }
            };
            var total = 0;
            var worked = 0;
            var visibleMatches = 0;
            var onProgress = function (p) {
                // Progress
                if (p.total) {
                    total = p.total;
                }
                if (p.worked) {
                    worked = p.worked;
                }
            };
            // Handle UI updates in an interval to show frequent progress and results
            var uiRefreshHandle = setInterval(function () {
                if (!_this.searching) {
                    window.clearInterval(uiRefreshHandle);
                    return;
                }
                if (!query.useRipgrep) {
                    // Progress bar update
                    var fakeProgress = true;
                    if (total > 0 && worked > 0) {
                        var ratio = Math.round((worked / total) * progressTotal);
                        if (ratio > progressWorked) {
                            progressRunner.worked(ratio - progressWorked);
                            progressWorked = ratio;
                            fakeProgress = false;
                        }
                    }
                    // Fake progress up to 90%, or when actual progress beats it
                    var fakeMax = 900;
                    var fakeMultiplier = 12;
                    if (fakeProgress && progressWorked < fakeMax) {
                        // Linearly decrease the rate of fake progress.
                        // 1 is the smallest allowed amount of progress.
                        var fakeAmt = Math.round((fakeMax - progressWorked) / fakeMax * fakeMultiplier) || 1;
                        progressWorked += fakeAmt;
                        progressRunner.worked(fakeAmt);
                    }
                }
                // Search result tree update
                var fileCount = _this.viewModel.searchResult.fileCount();
                if (visibleMatches !== fileCount) {
                    visibleMatches = fileCount;
                    _this.tree.refresh().done(null, errors.onUnexpectedError);
                    _this.updateSearchResultCount();
                }
                if (fileCount > 0) {
                    _this.updateActions();
                }
            }, 100);
            this.searchWidget.setReplaceAllActionState(false);
            this.viewModel.search(query).done(onComplete, onError, onProgress);
        };
        SearchViewlet.prototype.updateSearchResultCount = function () {
            var fileCount = this.viewModel.searchResult.fileCount();
            var msgWasHidden = this.messages.isHidden();
            if (fileCount > 0) {
                var div = this.clearMessage();
                builder_1.$(div).p({ text: this.buildResultCountMessage(this.viewModel.searchResult.count(), fileCount) });
                if (msgWasHidden) {
                    this.reLayout();
                }
            }
            else if (!msgWasHidden) {
                this.messages.hide();
            }
        };
        SearchViewlet.prototype.buildResultCountMessage = function (resultCount, fileCount) {
            if (resultCount === 1 && fileCount === 1) {
                return nls.localize('search.file.result', "{0} result in {1} file", resultCount, fileCount);
            }
            else if (resultCount === 1) {
                return nls.localize('search.files.result', "{0} result in {1} files", resultCount, fileCount);
            }
            else if (fileCount === 1) {
                return nls.localize('search.file.results', "{0} results in {1} file", resultCount, fileCount);
            }
            else {
                return nls.localize('search.files.results', "{0} results in {1} files", resultCount, fileCount);
            }
        };
        SearchViewlet.prototype.searchWithoutFolderMessage = function (div) {
            var _this = this;
            this.searchWithoutFolderMessageBuilder = builder_1.$(div);
            this.searchWithoutFolderMessageBuilder.p({ text: nls.localize('searchWithoutFolder', "You have not yet opened a folder. Only open files are currently searched - ") })
                .asContainer().a({
                'class': ['pointer', 'prominent'],
                'tabindex': '0',
                text: nls.localize('openFolder', "Open Folder")
            }).on(dom.EventType.CLICK, function (e) {
                dom.EventHelper.stop(e, false);
                var actionClass = env.isMacintosh ? workspaceActions_1.OpenFileFolderAction : workspaceActions_1.OpenFolderAction;
                var action = _this.instantiationService.createInstance(actionClass, actionClass.ID, actionClass.LABEL);
                _this.actionRunner.run(action).done(function () {
                    action.dispose();
                }, function (err) {
                    action.dispose();
                    errors.onUnexpectedError(err);
                });
            });
        };
        SearchViewlet.prototype.showEmptyStage = function () {
            // disable 'result'-actions
            this.searchSubmitted = false;
            this.updateActions();
            // clean up ui
            // this.replaceService.disposeAllReplacePreviews();
            this.messages.hide();
            this.results.show();
            this.tree.onVisible();
            this.currentSelectedFileMatch = null;
        };
        SearchViewlet.prototype.onFocus = function (lineMatch, preserveFocus, sideBySide, pinned) {
            if (!(lineMatch instanceof searchModel_1.Match)) {
                this.viewModel.searchResult.rangeHighlightDecorations.removeHighlightRange();
                return winjs_base_1.TPromise.as(true);
            }
            return (this.viewModel.isReplaceActive() && !!this.viewModel.replaceString) ?
                this.replaceService.openReplacePreview(lineMatch, preserveFocus, sideBySide, pinned) :
                this.open(lineMatch, preserveFocus, sideBySide, pinned);
        };
        SearchViewlet.prototype.open = function (element, preserveFocus, sideBySide, pinned) {
            var _this = this;
            var selection = this.getSelectionFrom(element);
            var resource = element instanceof searchModel_1.Match ? element.parent().resource() : element.resource();
            return this.editorService.openEditor({
                resource: resource,
                options: {
                    preserveFocus: preserveFocus,
                    pinned: pinned,
                    selection: selection,
                    revealIfVisible: true
                }
            }, sideBySide).then(function (editor) {
                if (editor && element instanceof searchModel_1.Match && preserveFocus) {
                    _this.viewModel.searchResult.rangeHighlightDecorations.highlightRange(editor.getControl().getModel(), element.range());
                }
                else {
                    _this.viewModel.searchResult.rangeHighlightDecorations.removeHighlightRange();
                }
            }, errors.onUnexpectedError);
        };
        SearchViewlet.prototype.getSelectionFrom = function (element) {
            var match = null;
            if (element instanceof searchModel_1.Match) {
                match = element;
            }
            if (element instanceof searchModel_1.FileMatch && element.count() > 0) {
                match = element.matches()[element.matches().length - 1];
            }
            if (match) {
                var range = match.range();
                if (this.viewModel.isReplaceActive() && !!this.viewModel.replaceString) {
                    var replaceString = match.replaceString;
                    return {
                        startLineNumber: range.startLineNumber,
                        startColumn: range.startColumn,
                        endLineNumber: range.startLineNumber,
                        endColumn: range.startColumn + replaceString.length
                    };
                }
                return range;
            }
            return void 0;
        };
        SearchViewlet.prototype.onUntitledDidChangeDirty = function (resource) {
            if (!this.viewModel) {
                return;
            }
            // remove search results from this resource as it got disposed
            if (!this.untitledEditorService.isDirty(resource)) {
                var matches = this.viewModel.searchResult.matches();
                for (var i = 0, len = matches.length; i < len; i++) {
                    if (resource.toString() === matches[i].resource().toString()) {
                        this.viewModel.searchResult.remove(matches[i]);
                    }
                }
            }
        };
        SearchViewlet.prototype.onFilesChanged = function (e) {
            if (!this.viewModel) {
                return;
            }
            var matches = this.viewModel.searchResult.matches();
            for (var i = 0, len = matches.length; i < len; i++) {
                if (e.contains(matches[i].resource(), files_1.FileChangeType.DELETED)) {
                    this.viewModel.searchResult.remove(matches[i]);
                }
            }
        };
        SearchViewlet.prototype.getActions = function () {
            return this.actions;
        };
        SearchViewlet.prototype.changeActionAtPosition = function (index, newAction) {
            this.actions.splice(index, 1, newAction);
            this.updateTitleArea();
        };
        SearchViewlet.prototype.shutdown = function () {
            var isRegex = this.searchWidget.searchInput.getRegex();
            var isWholeWords = this.searchWidget.searchInput.getWholeWords();
            var isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
            var contentPattern = this.searchWidget.searchInput.getValue();
            var patternExcludes = this.inputPatternExcludes.getValue().trim();
            var patternIncludes = this.inputPatternIncludes.getValue().trim();
            var useExcludesAndIgnoreFiles = this.inputPatternExcludes.useExcludesAndIgnoreFiles();
            var searchHistory = this.searchWidget.getHistory();
            var patternExcludesHistory = this.inputPatternExcludes.getHistory();
            var patternIncludesHistory = this.inputPatternIncludes.getHistory();
            // store memento
            this.viewletSettings['query.contentPattern'] = contentPattern;
            this.viewletSettings['query.searchHistory'] = searchHistory;
            this.viewletSettings['query.regex'] = isRegex;
            this.viewletSettings['query.wholeWords'] = isWholeWords;
            this.viewletSettings['query.caseSensitive'] = isCaseSensitive;
            this.viewletSettings['query.folderExclusions'] = patternExcludes;
            this.viewletSettings['query.folderIncludes'] = patternIncludes;
            this.viewletSettings['query.folderExclusionsHistory'] = patternExcludesHistory;
            this.viewletSettings['query.folderIncludesHistory'] = patternIncludesHistory;
            this.viewletSettings['query.useExcludesAndIgnoreFiles'] = useExcludesAndIgnoreFiles;
            _super.prototype.shutdown.call(this);
        };
        SearchViewlet.prototype.dispose = function () {
            this.isDisposed = true;
            if (this.tree) {
                this.tree.dispose();
            }
            this.searchWidget.dispose();
            this.inputPatternIncludes.dispose();
            this.inputPatternExcludes.dispose();
            this.viewModel.dispose();
            _super.prototype.dispose.call(this);
        };
        SearchViewlet.MAX_TEXT_RESULTS = 10000;
        SearchViewlet.SHOW_REPLACE_STORAGE_KEY = 'vs.search.show.replace';
        SearchViewlet = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, files_1.IFileService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService),
            __param(4, progress_1.IProgressService),
            __param(5, message_1.IMessageService),
            __param(6, storage_1.IStorageService),
            __param(7, contextView_1.IContextViewService),
            __param(8, instantiation_1.IInstantiationService),
            __param(9, configuration_1.IConfigurationService),
            __param(10, workspace_1.IWorkspaceContextService),
            __param(11, searchModel_1.ISearchWorkbenchService),
            __param(12, contextkey_1.IContextKeyService),
            __param(13, replace_1.IReplaceService),
            __param(14, untitledEditorService_1.IUntitledEditorService),
            __param(15, preferences_1.IPreferencesService),
            __param(16, themeService_1.IThemeService)
        ], SearchViewlet);
        return SearchViewlet;
    }(viewlet_1.Viewlet));
    exports.SearchViewlet = SearchViewlet;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var matchHighlightColor = theme.getColor(colorRegistry_1.editorFindMatchHighlight);
        if (matchHighlightColor) {
            collector.addRule(".monaco-workbench .search-viewlet .findInFileMatch { background-color: " + matchHighlightColor + "; }");
        }
        var diffInsertedColor = theme.getColor(colorRegistry_1.diffInserted);
        if (diffInsertedColor) {
            collector.addRule(".monaco-workbench .search-viewlet .replaceMatch { background-color: " + diffInsertedColor + "; }");
        }
        var diffRemovedColor = theme.getColor(colorRegistry_1.diffRemoved);
        if (diffRemovedColor) {
            collector.addRule(".monaco-workbench .search-viewlet .replace.findInFileMatch { background-color: " + diffRemovedColor + "; }");
        }
        var diffInsertedOutlineColor = theme.getColor(colorRegistry_1.diffInsertedOutline);
        if (diffInsertedOutlineColor) {
            collector.addRule(".monaco-workbench .search-viewlet .replaceMatch:not(:empty) { border: 1px dashed " + diffInsertedOutlineColor + "; }");
        }
        var diffRemovedOutlineColor = theme.getColor(colorRegistry_1.diffRemovedOutline);
        if (diffRemovedOutlineColor) {
            collector.addRule(".monaco-workbench .search-viewlet .replace.findInFileMatch { border: 1px dashed " + diffRemovedOutlineColor + "; }");
        }
        var activeContrastBorderColor = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (activeContrastBorderColor) {
            collector.addRule("\n\t\t\t.monaco-workbench .search-viewlet .findInFileMatch { border: 1px dashed " + activeContrastBorderColor + "; }\n\t\t");
        }
    });
});
