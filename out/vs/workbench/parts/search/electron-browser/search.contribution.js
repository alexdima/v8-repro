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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/extensions", "vs/workbench/browser/viewlet", "vs/platform/configuration/common/configurationRegistry", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/base/common/objects", "vs/base/common/platform", "vs/workbench/parts/files/common/files", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/workbench/browser/quickopen", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/quickOpen/common/quickOpen", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/find/findController", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/parts/search/browser/searchActions", "vs/workbench/parts/search/common/constants", "vs/workbench/parts/search/browser/replaceContributions", "vs/workbench/parts/search/browser/searchWidget", "vs/platform/contextkey/common/contextkey", "vs/editor/contrib/find/findModel", "vs/workbench/parts/search/common/searchModel", "vs/platform/commands/common/commands", "vs/workbench/parts/search/browser/searchViewlet", "vs/workbench/browser/parts/quickopen/quickopen", "vs/workbench/parts/search/browser/openSymbolHandler", "vs/workbench/parts/search/browser/openAnythingHandler", "vs/editor/browser/editorExtensions", "vs/workbench/parts/search/common/search", "vs/base/common/errors", "vs/platform/list/browser/listService", "path", "vs/base/common/resources", "vs/workbench/common/resources", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/base/common/arrays", "vs/workbench/parts/files/browser/files", "vs/base/common/network", "vs/css!./media/search.contribution"], function (require, exports, platform_1, extensions_1, viewlet_1, configurationRegistry_1, nls, winjs_base_1, actions_1, objects, platform, files_1, actions_2, actions_3, quickopen_1, keybindingsRegistry_1, instantiation_1, quickOpen_1, codeEditorService_1, findController_1, viewlet_2, searchActions, Constants, replaceContributions_1, searchWidget_1, contextkey_1, findModel_1, searchModel_1, commands_1, searchViewlet_1, quickopen_2, openSymbolHandler_1, openAnythingHandler_1, editorExtensions_1, search_1, errors_1, listService_1, path_1, resources_1, resources_2, editorService_1, files_2, arrays_1, files_3, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    extensions_1.registerSingleton(searchModel_1.ISearchWorkbenchService, searchModel_1.SearchWorkbenchService);
    replaceContributions_1.registerContributions();
    searchWidget_1.registerContributions();
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.search.toggleQueryDetails',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: Constants.SearchViewletVisibleKey,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 40 /* KEY_J */,
        handler: function (accessor) {
            var viewletService = accessor.get(viewlet_2.IViewletService);
            viewletService.openViewlet(Constants.VIEWLET_ID, true)
                .then(function (viewlet) { return viewlet.toggleQueryDetails(); });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.FocusSearchFromResults,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.FirstMatchFocusKey),
        primary: 16 /* UpArrow */,
        handler: function (accessor, args) {
            var searchViewlet = accessor.get(viewlet_2.IViewletService).getActiveViewlet();
            searchViewlet.focusPreviousInputBox();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.OpenMatchToSide,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.FileMatchOrMatchFocusKey),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        mac: {
            primary: 256 /* WinCtrl */ | 3 /* Enter */
        },
        handler: function (accessor, args) {
            var searchViewlet = accessor.get(viewlet_2.IViewletService).getActiveViewlet();
            var tree = searchViewlet.getControl();
            searchViewlet.open(tree.getFocus(), false, true, true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.CancelActionId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, listService_1.WorkbenchListFocusContextKey),
        primary: 9 /* Escape */,
        handler: function (accessor, args) {
            var searchViewlet = accessor.get(viewlet_2.IViewletService).getActiveViewlet();
            searchViewlet.cancelSearch();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.RemoveActionId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.FileMatchOrMatchFocusKey),
        primary: 20 /* Delete */,
        mac: {
            primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
        },
        handler: function (accessor, args) {
            var searchViewlet = accessor.get(viewlet_2.IViewletService).getActiveViewlet();
            var tree = searchViewlet.getControl();
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions.RemoveAction, tree, tree.getFocus(), searchViewlet).run();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.ReplaceActionId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.ReplaceActiveKey, Constants.MatchFocusKey),
        primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 22 /* KEY_1 */,
        handler: function (accessor, args) {
            var searchViewlet = accessor.get(viewlet_2.IViewletService).getActiveViewlet();
            var tree = searchViewlet.getControl();
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions.ReplaceAction, tree, tree.getFocus(), searchViewlet).run();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.ReplaceAllInFileActionId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.ReplaceActiveKey, Constants.FileFocusKey),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */,
        handler: function (accessor, args) {
            var searchViewlet = accessor.get(viewlet_2.IViewletService).getActiveViewlet();
            var tree = searchViewlet.getControl();
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions.ReplaceAllAction, tree, tree.getFocus(), searchViewlet).run();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.ReplaceAllInFolderActionId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.ReplaceActiveKey, Constants.FolderFocusKey),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */,
        handler: function (accessor, args) {
            var searchViewlet = accessor.get(viewlet_2.IViewletService).getActiveViewlet();
            var tree = searchViewlet.getControl();
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions.ReplaceAllInFolderAction, tree, tree.getFocus()).run();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.CloseReplaceWidgetActionId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.ReplaceInputBoxFocusedKey),
        primary: 9 /* Escape */,
        handler: function (accessor, args) {
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions.CloseReplaceAction, Constants.CloseReplaceWidgetActionId, '').run();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: searchActions.FocusNextInputAction.ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.InputBoxFocusedKey),
        primary: 18 /* DownArrow */,
        handler: function (accessor, args) {
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions.FocusNextInputAction, searchActions.FocusNextInputAction.ID, '').run();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: searchActions.FocusPreviousInputAction.ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.InputBoxFocusedKey, Constants.SearchInputBoxFocusedKey.toNegated()),
        primary: 16 /* UpArrow */,
        handler: function (accessor, args) {
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions.FocusPreviousInputAction, searchActions.FocusPreviousInputAction.ID, '').run();
        }
    });
    var FIND_IN_FOLDER_ID = 'filesExplorer.findInFolder';
    commands_1.CommandsRegistry.registerCommand({
        id: FIND_IN_FOLDER_ID,
        handler: function (accessor, resource) {
            var listService = accessor.get(listService_1.IListService);
            var viewletService = accessor.get(viewlet_2.IViewletService);
            var fileService = accessor.get(files_2.IFileService);
            var resources = files_3.getMultiSelectedResources(resource, listService, accessor.get(editorService_1.IWorkbenchEditorService));
            return viewletService.openViewlet(Constants.VIEWLET_ID, true).then(function (viewlet) {
                if (resources && resources.length) {
                    return fileService.resolveFiles(resources.map(function (resource) { return ({ resource: resource }); })).then(function (results) {
                        var folders = [];
                        results.forEach(function (result) {
                            if (result.success) {
                                folders.push(result.stat.isDirectory ? result.stat.resource : resources_1.dirname(result.stat.resource));
                            }
                        });
                        viewlet.searchInFolders(arrays_1.distinct(folders, function (folder) { return folder.toString(); }), function (from, to) { return path_1.relative(from, to); });
                    });
                }
                return void 0;
            });
        }
    });
    var FIND_IN_WORKSPACE_ID = 'filesExplorer.findInWorkspace';
    commands_1.CommandsRegistry.registerCommand({
        id: FIND_IN_WORKSPACE_ID,
        handler: function (accessor) {
            var viewletService = accessor.get(viewlet_2.IViewletService);
            return viewletService.openViewlet(Constants.VIEWLET_ID, true).then(function (viewlet) {
                viewlet.searchInFolders(null, function (from, to) { return path_1.relative(from, to); });
            });
        }
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ExplorerContext, {
        group: '4_search',
        order: 10,
        command: {
            id: FIND_IN_FOLDER_ID,
            title: nls.localize('findInFolder', "Find in Folder...")
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext, resources_2.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file)) // todo@remote
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ExplorerContext, {
        group: '4_search',
        order: 10,
        command: {
            id: FIND_IN_WORKSPACE_ID,
            title: nls.localize('findInWorkspace', "Find in Workspace...")
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext, files_1.ExplorerFolderContext.toNegated())
    });
    var ShowAllSymbolsAction = /** @class */ (function (_super) {
        __extends(ShowAllSymbolsAction, _super);
        function ShowAllSymbolsAction(actionId, actionLabel, quickOpenService, editorService) {
            var _this = _super.call(this, actionId, actionLabel) || this;
            _this.quickOpenService = quickOpenService;
            _this.editorService = editorService;
            _this.enabled = !!_this.quickOpenService;
            return _this;
        }
        ShowAllSymbolsAction.prototype.run = function (context) {
            var prefix = ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX;
            var inputSelection = void 0;
            var editor = this.editorService.getFocusedCodeEditor();
            var word = editor && findController_1.getSelectionSearchString(editor);
            if (word) {
                prefix = prefix + word;
                inputSelection = { start: 1, end: word.length + 1 };
            }
            this.quickOpenService.show(prefix, { inputSelection: inputSelection });
            return winjs_base_1.TPromise.as(null);
        };
        ShowAllSymbolsAction.ID = 'workbench.action.showAllSymbols';
        ShowAllSymbolsAction.LABEL = nls.localize('showTriggerActions', "Go to Symbol in Workspace...");
        ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX = '#';
        ShowAllSymbolsAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, codeEditorService_1.ICodeEditorService)
        ], ShowAllSymbolsAction);
        return ShowAllSymbolsAction;
    }(actions_1.Action));
    // Register Viewlet
    platform_1.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet(new viewlet_1.ViewletDescriptor(searchViewlet_1.SearchViewlet, Constants.VIEWLET_ID, nls.localize('name', "Search"), 'search', 10));
    // Actions
    var registry = platform_1.Registry.as(actions_3.Extensions.WorkbenchActions);
    var category = nls.localize('search', "Search");
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.FindInFilesAction, Constants.VIEWLET_ID, nls.localize('showSearchViewlet', "Show Search"), { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KEY_F */ }, Constants.SearchViewletVisibleKey.toNegated()), 'View: Show Search', nls.localize('view', "View"));
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.FindInFilesAction, Constants.FindInFilesActionId, nls.localize('findInFiles', "Find in Files"), { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KEY_F */ }, Constants.SearchInputBoxFocusedKey.toNegated()), 'Find in Files', category);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.FocusActiveEditorCommandId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocusedKey),
        handler: searchActions.FocusActiveEditorCommand,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KEY_F */
    });
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.FocusNextSearchResultAction, searchActions.FocusNextSearchResultAction.ID, searchActions.FocusNextSearchResultAction.LABEL, { primary: 62 /* F4 */ }), 'Focus Next Search Result', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.FocusPreviousSearchResultAction, searchActions.FocusPreviousSearchResultAction.ID, searchActions.FocusPreviousSearchResultAction.LABEL, { primary: 1024 /* Shift */ | 62 /* F4 */ }), 'Focus Previous Search Result', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.ReplaceInFilesAction, searchActions.ReplaceInFilesAction.ID, searchActions.ReplaceInFilesAction.LABEL, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 38 /* KEY_H */ }), 'Replace in Files', category);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(objects.assign({
        id: Constants.ToggleCaseSensitiveCommandId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocusedKey),
        handler: searchActions.toggleCaseSensitiveCommand
    }, findModel_1.ToggleCaseSensitiveKeybinding));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(objects.assign({
        id: Constants.ToggleWholeWordCommandId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocusedKey),
        handler: searchActions.toggleWholeWordCommand
    }, findModel_1.ToggleWholeWordKeybinding));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(objects.assign({
        id: Constants.ToggleRegexCommandId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocusedKey),
        handler: searchActions.toggleRegexCommand
    }, findModel_1.ToggleRegexKeybinding));
    // Terms navigation actions
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.ShowNextSearchTermAction, searchActions.ShowNextSearchTermAction.ID, searchActions.ShowNextSearchTermAction.LABEL, findModel_1.ShowNextFindTermKeybinding, searchActions.ShowNextSearchTermAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Next Search Term', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.ShowPreviousSearchTermAction, searchActions.ShowPreviousSearchTermAction.ID, searchActions.ShowPreviousSearchTermAction.LABEL, findModel_1.ShowPreviousFindTermKeybinding, searchActions.ShowPreviousSearchTermAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Previous Search Term', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.ShowNextSearchIncludeAction, searchActions.ShowNextSearchIncludeAction.ID, searchActions.ShowNextSearchIncludeAction.LABEL, findModel_1.ShowNextFindTermKeybinding, searchActions.ShowNextSearchIncludeAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Next Search Include Pattern', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.ShowPreviousSearchIncludeAction, searchActions.ShowPreviousSearchIncludeAction.ID, searchActions.ShowPreviousSearchIncludeAction.LABEL, findModel_1.ShowPreviousFindTermKeybinding, searchActions.ShowPreviousSearchIncludeAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Previous Search Include Pattern', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.ShowNextSearchExcludeAction, searchActions.ShowNextSearchExcludeAction.ID, searchActions.ShowNextSearchExcludeAction.LABEL, findModel_1.ShowNextFindTermKeybinding, searchActions.ShowNextSearchExcludeAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Next Search Exclude Pattern', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.ShowPreviousSearchExcludeAction, searchActions.ShowPreviousSearchExcludeAction.ID, searchActions.ShowPreviousSearchExcludeAction.LABEL, findModel_1.ShowPreviousFindTermKeybinding, searchActions.ShowPreviousSearchExcludeAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Previous Search Exclude Pattern', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(searchActions.CollapseDeepestExpandedLevelAction, searchActions.CollapseDeepestExpandedLevelAction.ID, searchActions.CollapseDeepestExpandedLevelAction.LABEL), 'Search: Collapse All', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ShowAllSymbolsAction, ShowAllSymbolsAction.ID, ShowAllSymbolsAction.LABEL, { primary: 2048 /* CtrlCmd */ | 50 /* KEY_T */ }), 'Go to Symbol in Workspace...');
    // Register Quick Open Handler
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerDefaultQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(openAnythingHandler_1.OpenAnythingHandler, openAnythingHandler_1.OpenAnythingHandler.ID, '', quickopen_2.defaultQuickOpenContextKey, nls.localize('openAnythingHandlerDescription', "Go to File")));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(openSymbolHandler_1.OpenSymbolHandler, openSymbolHandler_1.OpenSymbolHandler.ID, ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX, 'inWorkspaceSymbolsPicker', [
        {
            prefix: ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX,
            needsEditor: false,
            description: nls.localize('openSymbolDescriptionNormal', "Go to Symbol in Workspace")
        }
    ]));
    // Configuration
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'search',
        'order': 13,
        'title': nls.localize('searchConfigurationTitle', "Search"),
        'type': 'object',
        'properties': {
            'search.exclude': {
                'type': 'object',
                'description': nls.localize('exclude', "Configure glob patterns for excluding files and folders in searches. Inherits all glob patterns from the files.exclude setting."),
                'default': { '**/node_modules': true, '**/bower_components': true },
                'additionalProperties': {
                    'anyOf': [
                        {
                            'type': 'boolean',
                            'description': nls.localize('exclude.boolean', "The glob pattern to match file paths against. Set to true or false to enable or disable the pattern."),
                        },
                        {
                            'type': 'object',
                            'properties': {
                                'when': {
                                    'type': 'string',
                                    'pattern': '\\w*\\$\\(basename\\)\\w*',
                                    'default': '$(basename).ext',
                                    'description': nls.localize('exclude.when', 'Additional check on the siblings of a matching file. Use $(basename) as variable for the matching file name.')
                                }
                            }
                        }
                    ]
                },
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
            },
            'search.useRipgrep': {
                'type': 'boolean',
                'description': nls.localize('useRipgrep', "Controls whether to use ripgrep in text and file search"),
                'default': true
            },
            'search.useIgnoreFiles': {
                'type': 'boolean',
                'description': nls.localize('useIgnoreFiles', "Controls whether to use .gitignore and .ignore files when searching for files."),
                'default': true,
                'scope': configurationRegistry_1.ConfigurationScope.RESOURCE
            },
            'search.quickOpen.includeSymbols': {
                'type': 'boolean',
                'description': nls.localize('search.quickOpen.includeSymbols', "Configure to include results from a global symbol search in the file results for Quick Open."),
                'default': false
            },
            'search.followSymlinks': {
                'type': 'boolean',
                'description': nls.localize('search.followSymlinks', "Controls whether to follow symlinks while searching."),
                'default': true
            },
            'search.smartCase': {
                'type': 'boolean',
                'description': nls.localize('search.smartCase', "Searches case-insensitively if the pattern is all lowercase, otherwise, searches case-sensitively"),
                'default': false
            },
            'search.globalFindClipboard': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('search.globalFindClipboard', "Controls if the Search Viewlet should read or modify the shared find clipboard on macOS"),
                'included': platform.isMacintosh
            }
        }
    });
    editorExtensions_1.registerLanguageCommand('_executeWorkspaceSymbolProvider', function (accessor, args) {
        var query = args.query;
        if (typeof query !== 'string') {
            throw errors_1.illegalArgument();
        }
        return search_1.getWorkspaceSymbols(query);
    });
});
