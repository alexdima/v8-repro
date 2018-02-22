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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/parts/search/common/searchModel", "vs/workbench/parts/search/common/replace", "vs/workbench/parts/search/common/constants", "vs/workbench/services/editor/common/editorService", "vs/base/common/keyCodes", "vs/platform/keybinding/common/keybinding", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, DOM, winjs_base_1, actions_1, viewlet_1, searchModel_1, replace_1, Constants, editorService_1, keyCodes_1, keybinding_1, platform_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isSearchViewletFocused(viewletService) {
        var activeViewlet = viewletService.getActiveViewlet();
        var activeElement = document.activeElement;
        return activeViewlet && activeViewlet.getId() === Constants.VIEWLET_ID && activeElement && DOM.isAncestor(activeElement, activeViewlet.getContainer().getHTMLElement());
    }
    exports.isSearchViewletFocused = isSearchViewletFocused;
    function appendKeyBindingLabel(label, keyBinding, keyBindingService2) {
        if (typeof keyBinding === 'number') {
            var resolvedKeybindings = keyBindingService2.resolveKeybinding(keyCodes_1.createKeybinding(keyBinding, platform_1.OS));
            return doAppendKeyBindingLabel(label, resolvedKeybindings.length > 0 ? resolvedKeybindings[0] : null);
        }
        else {
            return doAppendKeyBindingLabel(label, keyBinding);
        }
    }
    exports.appendKeyBindingLabel = appendKeyBindingLabel;
    function doAppendKeyBindingLabel(label, keyBinding) {
        return keyBinding ? label + ' (' + keyBinding.getLabel() + ')' : label;
    }
    exports.toggleCaseSensitiveCommand = function (accessor) {
        var viewletService = accessor.get(viewlet_1.IViewletService);
        var searchViewlet = viewletService.getActiveViewlet();
        searchViewlet.toggleCaseSensitive();
    };
    exports.toggleWholeWordCommand = function (accessor) {
        var viewletService = accessor.get(viewlet_1.IViewletService);
        var searchViewlet = viewletService.getActiveViewlet();
        searchViewlet.toggleWholeWords();
    };
    exports.toggleRegexCommand = function (accessor) {
        var viewletService = accessor.get(viewlet_1.IViewletService);
        var searchViewlet = viewletService.getActiveViewlet();
        searchViewlet.toggleRegex();
    };
    var ShowNextSearchIncludeAction = /** @class */ (function (_super) {
        __extends(ShowNextSearchIncludeAction, _super);
        function ShowNextSearchIncludeAction(id, label, viewletService, contextKeyService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            _this.contextKeyService = contextKeyService;
            _this.enabled = _this.contextKeyService.contextMatchesRules(ShowNextSearchIncludeAction.CONTEXT_KEY_EXPRESSION);
            return _this;
        }
        ShowNextSearchIncludeAction.prototype.run = function () {
            var searchAndReplaceWidget = this.viewletService.getActiveViewlet().searchIncludePattern;
            searchAndReplaceWidget.showNextTerm();
            return winjs_base_1.TPromise.as(null);
        };
        ShowNextSearchIncludeAction.ID = 'search.history.showNextIncludePattern';
        ShowNextSearchIncludeAction.LABEL = nls.localize('nextSearchIncludePattern', "Show Next Search Include Pattern");
        ShowNextSearchIncludeAction.CONTEXT_KEY_EXPRESSION = contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.PatternIncludesFocusedKey);
        ShowNextSearchIncludeAction = __decorate([
            __param(2, viewlet_1.IViewletService),
            __param(3, contextkey_1.IContextKeyService)
        ], ShowNextSearchIncludeAction);
        return ShowNextSearchIncludeAction;
    }(actions_1.Action));
    exports.ShowNextSearchIncludeAction = ShowNextSearchIncludeAction;
    var ShowPreviousSearchIncludeAction = /** @class */ (function (_super) {
        __extends(ShowPreviousSearchIncludeAction, _super);
        function ShowPreviousSearchIncludeAction(id, label, viewletService, contextKeyService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            _this.contextKeyService = contextKeyService;
            _this.enabled = _this.contextKeyService.contextMatchesRules(ShowPreviousSearchIncludeAction.CONTEXT_KEY_EXPRESSION);
            return _this;
        }
        ShowPreviousSearchIncludeAction.prototype.run = function () {
            var searchAndReplaceWidget = this.viewletService.getActiveViewlet().searchIncludePattern;
            searchAndReplaceWidget.showPreviousTerm();
            return winjs_base_1.TPromise.as(null);
        };
        ShowPreviousSearchIncludeAction.ID = 'search.history.showPreviousIncludePattern';
        ShowPreviousSearchIncludeAction.LABEL = nls.localize('previousSearchIncludePattern', "Show Previous Search Include Pattern");
        ShowPreviousSearchIncludeAction.CONTEXT_KEY_EXPRESSION = contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.PatternIncludesFocusedKey);
        ShowPreviousSearchIncludeAction = __decorate([
            __param(2, viewlet_1.IViewletService),
            __param(3, contextkey_1.IContextKeyService)
        ], ShowPreviousSearchIncludeAction);
        return ShowPreviousSearchIncludeAction;
    }(actions_1.Action));
    exports.ShowPreviousSearchIncludeAction = ShowPreviousSearchIncludeAction;
    var ShowNextSearchExcludeAction = /** @class */ (function (_super) {
        __extends(ShowNextSearchExcludeAction, _super);
        function ShowNextSearchExcludeAction(id, label, viewletService, contextKeyService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            _this.contextKeyService = contextKeyService;
            _this.enabled = _this.contextKeyService.contextMatchesRules(ShowNextSearchExcludeAction.CONTEXT_KEY_EXPRESSION);
            return _this;
        }
        ShowNextSearchExcludeAction.prototype.run = function () {
            var searchAndReplaceWidget = this.viewletService.getActiveViewlet().searchExcludePattern;
            searchAndReplaceWidget.showNextTerm();
            return winjs_base_1.TPromise.as(null);
        };
        ShowNextSearchExcludeAction.ID = 'search.history.showNextExcludePattern';
        ShowNextSearchExcludeAction.LABEL = nls.localize('nextSearchExcludePattern', "Show Next Search Exclude Pattern");
        ShowNextSearchExcludeAction.CONTEXT_KEY_EXPRESSION = contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.PatternExcludesFocusedKey);
        ShowNextSearchExcludeAction = __decorate([
            __param(2, viewlet_1.IViewletService),
            __param(3, contextkey_1.IContextKeyService)
        ], ShowNextSearchExcludeAction);
        return ShowNextSearchExcludeAction;
    }(actions_1.Action));
    exports.ShowNextSearchExcludeAction = ShowNextSearchExcludeAction;
    var ShowPreviousSearchExcludeAction = /** @class */ (function (_super) {
        __extends(ShowPreviousSearchExcludeAction, _super);
        function ShowPreviousSearchExcludeAction(id, label, viewletService, contextKeyService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            _this.contextKeyService = contextKeyService;
            _this.enabled = _this.contextKeyService.contextMatchesRules(ShowPreviousSearchExcludeAction.CONTEXT_KEY_EXPRESSION);
            return _this;
        }
        ShowPreviousSearchExcludeAction.prototype.run = function () {
            var searchAndReplaceWidget = this.viewletService.getActiveViewlet().searchExcludePattern;
            searchAndReplaceWidget.showPreviousTerm();
            return winjs_base_1.TPromise.as(null);
        };
        ShowPreviousSearchExcludeAction.ID = 'search.history.showPreviousExcludePattern';
        ShowPreviousSearchExcludeAction.LABEL = nls.localize('previousSearchExcludePattern', "Show Previous Search Exclude Pattern");
        ShowPreviousSearchExcludeAction.CONTEXT_KEY_EXPRESSION = contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.PatternExcludesFocusedKey);
        ShowPreviousSearchExcludeAction = __decorate([
            __param(2, viewlet_1.IViewletService),
            __param(3, contextkey_1.IContextKeyService)
        ], ShowPreviousSearchExcludeAction);
        return ShowPreviousSearchExcludeAction;
    }(actions_1.Action));
    exports.ShowPreviousSearchExcludeAction = ShowPreviousSearchExcludeAction;
    var ShowNextSearchTermAction = /** @class */ (function (_super) {
        __extends(ShowNextSearchTermAction, _super);
        function ShowNextSearchTermAction(id, label, viewletService, contextKeyService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            _this.contextKeyService = contextKeyService;
            _this.enabled = _this.contextKeyService.contextMatchesRules(ShowNextSearchTermAction.CONTEXT_KEY_EXPRESSION);
            return _this;
        }
        ShowNextSearchTermAction.prototype.run = function () {
            var searchAndReplaceWidget = this.viewletService.getActiveViewlet().searchAndReplaceWidget;
            searchAndReplaceWidget.showNextSearchTerm();
            return winjs_base_1.TPromise.as(null);
        };
        ShowNextSearchTermAction.ID = 'search.history.showNext';
        ShowNextSearchTermAction.LABEL = nls.localize('nextSearchTerm', "Show Next Search Term");
        ShowNextSearchTermAction.CONTEXT_KEY_EXPRESSION = contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocusedKey);
        ShowNextSearchTermAction = __decorate([
            __param(2, viewlet_1.IViewletService),
            __param(3, contextkey_1.IContextKeyService)
        ], ShowNextSearchTermAction);
        return ShowNextSearchTermAction;
    }(actions_1.Action));
    exports.ShowNextSearchTermAction = ShowNextSearchTermAction;
    var ShowPreviousSearchTermAction = /** @class */ (function (_super) {
        __extends(ShowPreviousSearchTermAction, _super);
        function ShowPreviousSearchTermAction(id, label, viewletService, contextKeyService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            _this.contextKeyService = contextKeyService;
            _this.enabled = _this.contextKeyService.contextMatchesRules(ShowPreviousSearchTermAction.CONTEXT_KEY_EXPRESSION);
            return _this;
        }
        ShowPreviousSearchTermAction.prototype.run = function () {
            var searchAndReplaceWidget = this.viewletService.getActiveViewlet().searchAndReplaceWidget;
            searchAndReplaceWidget.showPreviousSearchTerm();
            return winjs_base_1.TPromise.as(null);
        };
        ShowPreviousSearchTermAction.ID = 'search.history.showPrevious';
        ShowPreviousSearchTermAction.LABEL = nls.localize('previousSearchTerm', "Show Previous Search Term");
        ShowPreviousSearchTermAction.CONTEXT_KEY_EXPRESSION = contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocusedKey);
        ShowPreviousSearchTermAction = __decorate([
            __param(2, viewlet_1.IViewletService),
            __param(3, contextkey_1.IContextKeyService)
        ], ShowPreviousSearchTermAction);
        return ShowPreviousSearchTermAction;
    }(actions_1.Action));
    exports.ShowPreviousSearchTermAction = ShowPreviousSearchTermAction;
    var FocusNextInputAction = /** @class */ (function (_super) {
        __extends(FocusNextInputAction, _super);
        function FocusNextInputAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusNextInputAction.prototype.run = function () {
            this.viewletService.getActiveViewlet().focusNextInputBox();
            return winjs_base_1.TPromise.as(null);
        };
        FocusNextInputAction.ID = 'search.focus.nextInputBox';
        FocusNextInputAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], FocusNextInputAction);
        return FocusNextInputAction;
    }(actions_1.Action));
    exports.FocusNextInputAction = FocusNextInputAction;
    var FocusPreviousInputAction = /** @class */ (function (_super) {
        __extends(FocusPreviousInputAction, _super);
        function FocusPreviousInputAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusPreviousInputAction.prototype.run = function () {
            this.viewletService.getActiveViewlet().focusPreviousInputBox();
            return winjs_base_1.TPromise.as(null);
        };
        FocusPreviousInputAction.ID = 'search.focus.previousInputBox';
        FocusPreviousInputAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], FocusPreviousInputAction);
        return FocusPreviousInputAction;
    }(actions_1.Action));
    exports.FocusPreviousInputAction = FocusPreviousInputAction;
    exports.FocusActiveEditorCommand = function (accessor) {
        var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
        var editor = editorService.getActiveEditor();
        if (editor) {
            editor.focus();
        }
        return winjs_base_1.TPromise.as(true);
    };
    var FindOrReplaceInFilesAction = /** @class */ (function (_super) {
        __extends(FindOrReplaceInFilesAction, _super);
        function FindOrReplaceInFilesAction(id, label, viewletService, expandSearchReplaceWidget, selectWidgetText, focusReplace) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            _this.expandSearchReplaceWidget = expandSearchReplaceWidget;
            _this.selectWidgetText = selectWidgetText;
            _this.focusReplace = focusReplace;
            return _this;
        }
        FindOrReplaceInFilesAction.prototype.run = function () {
            var _this = this;
            var viewlet = this.viewletService.getActiveViewlet();
            var searchViewletWasOpen = viewlet && viewlet.getId() === Constants.VIEWLET_ID;
            return this.viewletService.openViewlet(Constants.VIEWLET_ID, true).then(function (viewlet) {
                if (!searchViewletWasOpen || _this.expandSearchReplaceWidget) {
                    var searchAndReplaceWidget = viewlet.searchAndReplaceWidget;
                    searchAndReplaceWidget.toggleReplace(_this.expandSearchReplaceWidget);
                    // Focus replace only when there is text in the searchInput box
                    var focusReplace = _this.focusReplace && searchAndReplaceWidget.searchInput.getValue();
                    searchAndReplaceWidget.focus(_this.selectWidgetText, !!focusReplace);
                }
            });
        };
        return FindOrReplaceInFilesAction;
    }(actions_1.Action));
    exports.FindOrReplaceInFilesAction = FindOrReplaceInFilesAction;
    exports.SHOW_SEARCH_LABEL = nls.localize('showSearchViewlet', "Show Search");
    var FindInFilesAction = /** @class */ (function (_super) {
        __extends(FindInFilesAction, _super);
        function FindInFilesAction(id, label, viewletService) {
            return _super.call(this, id, label, viewletService, /*expandSearchReplaceWidget=*/ false, /*selectWidgetText=*/ true, /*focusReplace=*/ false) || this;
        }
        FindInFilesAction.LABEL = nls.localize('findInFiles', "Find in Files");
        FindInFilesAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], FindInFilesAction);
        return FindInFilesAction;
    }(FindOrReplaceInFilesAction));
    exports.FindInFilesAction = FindInFilesAction;
    var ReplaceInFilesAction = /** @class */ (function (_super) {
        __extends(ReplaceInFilesAction, _super);
        function ReplaceInFilesAction(id, label, viewletService) {
            return _super.call(this, id, label, viewletService, /*expandSearchReplaceWidget=*/ true, /*selectWidgetText=*/ false, /*focusReplace=*/ true) || this;
        }
        ReplaceInFilesAction.ID = 'workbench.action.replaceInFiles';
        ReplaceInFilesAction.LABEL = nls.localize('replaceInFiles', "Replace in Files");
        ReplaceInFilesAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], ReplaceInFilesAction);
        return ReplaceInFilesAction;
    }(FindOrReplaceInFilesAction));
    exports.ReplaceInFilesAction = ReplaceInFilesAction;
    var CloseReplaceAction = /** @class */ (function (_super) {
        __extends(CloseReplaceAction, _super);
        function CloseReplaceAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        CloseReplaceAction.prototype.run = function () {
            var searchAndReplaceWidget = this.viewletService.getActiveViewlet().searchAndReplaceWidget;
            searchAndReplaceWidget.toggleReplace(false);
            searchAndReplaceWidget.focus();
            return winjs_base_1.TPromise.as(null);
        };
        CloseReplaceAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], CloseReplaceAction);
        return CloseReplaceAction;
    }(actions_1.Action));
    exports.CloseReplaceAction = CloseReplaceAction;
    var SearchAction = /** @class */ (function (_super) {
        __extends(SearchAction, _super);
        function SearchAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        SearchAction.prototype.getSearchViewlet = function () {
            var activeViewlet = this.viewletService.getActiveViewlet();
            if (activeViewlet && activeViewlet.getId() === Constants.VIEWLET_ID) {
                return activeViewlet;
            }
            return null;
        };
        SearchAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], SearchAction);
        return SearchAction;
    }(actions_1.Action));
    exports.SearchAction = SearchAction;
    var RefreshAction = /** @class */ (function (_super) {
        __extends(RefreshAction, _super);
        function RefreshAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, viewletService) || this;
            _this.class = 'search-action refresh';
            _this.update();
            return _this;
        }
        RefreshAction.prototype.update = function () {
            var searchViewlet = this.getSearchViewlet();
            this.enabled = searchViewlet && searchViewlet.isSearchSubmitted();
        };
        RefreshAction.prototype.run = function () {
            var searchViewlet = this.getSearchViewlet();
            if (searchViewlet) {
                searchViewlet.onQueryChanged(true);
            }
            return winjs_base_1.TPromise.as(null);
        };
        RefreshAction.ID = 'search.action.refreshSearchResults';
        RefreshAction.LABEL = nls.localize('RefreshAction.label', "Refresh");
        RefreshAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], RefreshAction);
        return RefreshAction;
    }(SearchAction));
    exports.RefreshAction = RefreshAction;
    var CollapseDeepestExpandedLevelAction = /** @class */ (function (_super) {
        __extends(CollapseDeepestExpandedLevelAction, _super);
        function CollapseDeepestExpandedLevelAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, viewletService) || this;
            _this.class = 'search-action collapse';
            _this.update();
            return _this;
        }
        CollapseDeepestExpandedLevelAction.prototype.update = function () {
            var searchViewlet = this.getSearchViewlet();
            this.enabled = searchViewlet && searchViewlet.hasSearchResults();
        };
        CollapseDeepestExpandedLevelAction.prototype.run = function () {
            var searchViewlet = this.getSearchViewlet();
            if (searchViewlet) {
                var viewer = searchViewlet.getControl();
                if (viewer.getHighlight()) {
                    return winjs_base_1.TPromise.as(null); // Global action disabled if user is in edit mode from another action
                }
                viewer.collapseDeepestExpandedLevel();
                viewer.clearSelection();
                viewer.clearFocus();
                viewer.DOMFocus();
                viewer.focusFirst();
            }
            return winjs_base_1.TPromise.as(null);
        };
        CollapseDeepestExpandedLevelAction.ID = 'search.action.collapseSearchResults';
        CollapseDeepestExpandedLevelAction.LABEL = nls.localize('CollapseDeepestExpandedLevelAction.label', "Collapse All");
        CollapseDeepestExpandedLevelAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], CollapseDeepestExpandedLevelAction);
        return CollapseDeepestExpandedLevelAction;
    }(SearchAction));
    exports.CollapseDeepestExpandedLevelAction = CollapseDeepestExpandedLevelAction;
    var ClearSearchResultsAction = /** @class */ (function (_super) {
        __extends(ClearSearchResultsAction, _super);
        function ClearSearchResultsAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, viewletService) || this;
            _this.class = 'search-action clear-search-results';
            _this.update();
            return _this;
        }
        ClearSearchResultsAction.prototype.update = function () {
            var searchViewlet = this.getSearchViewlet();
            this.enabled = searchViewlet && searchViewlet.hasSearchResults();
        };
        ClearSearchResultsAction.prototype.run = function () {
            var searchViewlet = this.getSearchViewlet();
            if (searchViewlet) {
                searchViewlet.clearSearchResults();
            }
            return winjs_base_1.TPromise.as(null);
        };
        ClearSearchResultsAction.ID = 'search.action.clearSearchResults';
        ClearSearchResultsAction.LABEL = nls.localize('ClearSearchResultsAction.label', "Clear");
        ClearSearchResultsAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], ClearSearchResultsAction);
        return ClearSearchResultsAction;
    }(SearchAction));
    exports.ClearSearchResultsAction = ClearSearchResultsAction;
    var CancelSearchAction = /** @class */ (function (_super) {
        __extends(CancelSearchAction, _super);
        function CancelSearchAction(id, label, viewletService) {
            var _this = _super.call(this, id, label, viewletService) || this;
            _this.class = 'search-action cancel-search';
            _this.update();
            return _this;
        }
        CancelSearchAction.prototype.update = function () {
            var searchViewlet = this.getSearchViewlet();
            this.enabled = searchViewlet && searchViewlet.isSearching();
        };
        CancelSearchAction.prototype.run = function () {
            var searchViewlet = this.getSearchViewlet();
            if (searchViewlet) {
                searchViewlet.cancelSearch();
            }
            return winjs_base_1.TPromise.as(null);
        };
        CancelSearchAction.ID = 'search.action.cancelSearch';
        CancelSearchAction.LABEL = nls.localize('CancelSearchAction.label', "Cancel Search");
        CancelSearchAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], CancelSearchAction);
        return CancelSearchAction;
    }(SearchAction));
    exports.CancelSearchAction = CancelSearchAction;
    var FocusNextSearchResultAction = /** @class */ (function (_super) {
        __extends(FocusNextSearchResultAction, _super);
        function FocusNextSearchResultAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusNextSearchResultAction.prototype.run = function () {
            return this.viewletService.openViewlet(Constants.VIEWLET_ID).then(function (searchViewlet) {
                searchViewlet.selectNextMatch();
            });
        };
        FocusNextSearchResultAction.ID = 'search.action.focusNextSearchResult';
        FocusNextSearchResultAction.LABEL = nls.localize('FocusNextSearchResult.label', "Focus Next Search Result");
        FocusNextSearchResultAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], FocusNextSearchResultAction);
        return FocusNextSearchResultAction;
    }(actions_1.Action));
    exports.FocusNextSearchResultAction = FocusNextSearchResultAction;
    var FocusPreviousSearchResultAction = /** @class */ (function (_super) {
        __extends(FocusPreviousSearchResultAction, _super);
        function FocusPreviousSearchResultAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusPreviousSearchResultAction.prototype.run = function () {
            return this.viewletService.openViewlet(Constants.VIEWLET_ID).then(function (searchViewlet) {
                searchViewlet.selectPreviousMatch();
            });
        };
        FocusPreviousSearchResultAction.ID = 'search.action.focusPreviousSearchResult';
        FocusPreviousSearchResultAction.LABEL = nls.localize('FocusPreviousSearchResult.label', "Focus Previous Search Result");
        FocusPreviousSearchResultAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], FocusPreviousSearchResultAction);
        return FocusPreviousSearchResultAction;
    }(actions_1.Action));
    exports.FocusPreviousSearchResultAction = FocusPreviousSearchResultAction;
    var AbstractSearchAndReplaceAction = /** @class */ (function (_super) {
        __extends(AbstractSearchAndReplaceAction, _super);
        function AbstractSearchAndReplaceAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Returns element to focus after removing the given element
         */
        AbstractSearchAndReplaceAction.prototype.getElementToFocusAfterRemoved = function (viewer, elementToBeRemoved) {
            var elementToFocus = this.getNextElementAfterRemoved(viewer, elementToBeRemoved);
            if (!elementToFocus) {
                elementToFocus = this.getPreviousElementAfterRemoved(viewer, elementToBeRemoved);
            }
            return elementToFocus;
        };
        AbstractSearchAndReplaceAction.prototype.getNextElementAfterRemoved = function (viewer, element) {
            var navigator = this.getNavigatorAt(element, viewer);
            if (element instanceof searchModel_1.FolderMatch) {
                // If file match is removed then next element is the next file match
                while (!!navigator.next() && !(navigator.current() instanceof searchModel_1.FolderMatch)) { }
            }
            else if (element instanceof searchModel_1.FileMatch) {
                // If file match is removed then next element is the next file match
                while (!!navigator.next() && !(navigator.current() instanceof searchModel_1.FileMatch)) { }
            }
            else {
                navigator.next();
            }
            return navigator.current();
        };
        AbstractSearchAndReplaceAction.prototype.getPreviousElementAfterRemoved = function (viewer, element) {
            var navigator = this.getNavigatorAt(element, viewer);
            var previousElement = navigator.previous();
            if (element instanceof searchModel_1.Match && element.parent().matches().length === 1) {
                // If this is the only match, then the file match is also removed
                // Hence take the previous element to file match
                previousElement = navigator.previous();
            }
            return previousElement;
        };
        AbstractSearchAndReplaceAction.prototype.getNavigatorAt = function (element, viewer) {
            var navigator = viewer.getNavigator();
            while (navigator.current() !== element && !!navigator.next()) { }
            return navigator;
        };
        return AbstractSearchAndReplaceAction;
    }(actions_1.Action));
    exports.AbstractSearchAndReplaceAction = AbstractSearchAndReplaceAction;
    var RemoveAction = /** @class */ (function (_super) {
        __extends(RemoveAction, _super);
        function RemoveAction(viewer, element) {
            var _this = _super.call(this, 'remove', nls.localize('RemoveAction.label', "Dismiss"), 'action-remove') || this;
            _this.viewer = viewer;
            _this.element = element;
            return _this;
        }
        RemoveAction.prototype.run = function () {
            var nextFocusElement = this.getElementToFocusAfterRemoved(this.viewer, this.element);
            if (nextFocusElement) {
                this.viewer.setFocus(nextFocusElement);
            }
            var elementToRefresh;
            var element = this.element;
            if (element instanceof searchModel_1.FolderMatch) {
                var parent_1 = element.parent();
                parent_1.remove(element);
                elementToRefresh = parent_1;
            }
            else if (element instanceof searchModel_1.FileMatch) {
                var parent_2 = element.parent();
                parent_2.remove(element);
                elementToRefresh = parent_2;
            }
            else if (element instanceof searchModel_1.Match) {
                var parent_3 = element.parent();
                parent_3.remove(element);
                elementToRefresh = parent_3.count() === 0 ? parent_3.parent() : parent_3;
            }
            this.viewer.DOMFocus();
            return this.viewer.refresh(elementToRefresh);
        };
        return RemoveAction;
    }(AbstractSearchAndReplaceAction));
    exports.RemoveAction = RemoveAction;
    var ReplaceAllAction = /** @class */ (function (_super) {
        __extends(ReplaceAllAction, _super);
        function ReplaceAllAction(viewer, fileMatch, viewlet, keyBindingService) {
            var _this = _super.call(this, Constants.ReplaceAllInFileActionId, appendKeyBindingLabel(nls.localize('file.replaceAll.label', "Replace All"), keyBindingService.lookupKeybinding(Constants.ReplaceAllInFileActionId), keyBindingService), 'action-replace-all') || this;
            _this.viewer = viewer;
            _this.fileMatch = fileMatch;
            _this.viewlet = viewlet;
            return _this;
        }
        ReplaceAllAction.prototype.run = function () {
            var _this = this;
            var nextFocusElement = this.getElementToFocusAfterRemoved(this.viewer, this.fileMatch);
            return this.fileMatch.parent().replace(this.fileMatch).then(function () {
                if (nextFocusElement) {
                    _this.viewer.setFocus(nextFocusElement);
                }
                _this.viewer.DOMFocus();
                _this.viewlet.open(_this.fileMatch, true);
            });
        };
        ReplaceAllAction = __decorate([
            __param(3, keybinding_1.IKeybindingService)
        ], ReplaceAllAction);
        return ReplaceAllAction;
    }(AbstractSearchAndReplaceAction));
    exports.ReplaceAllAction = ReplaceAllAction;
    var ReplaceAllInFolderAction = /** @class */ (function (_super) {
        __extends(ReplaceAllInFolderAction, _super);
        function ReplaceAllInFolderAction(viewer, folderMatch, keyBindingService) {
            var _this = _super.call(this, Constants.ReplaceAllInFolderActionId, nls.localize('file.replaceAll.label', "Replace All"), 'action-replace-all') || this;
            _this.viewer = viewer;
            _this.folderMatch = folderMatch;
            return _this;
        }
        ReplaceAllInFolderAction.prototype.run = function () {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var nextFocusElement;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            nextFocusElement = this.getElementToFocusAfterRemoved(this.viewer, this.folderMatch);
                            return [4 /*yield*/, this.folderMatch.replaceAll()];
                        case 1:
                            _a.sent();
                            if (nextFocusElement) {
                                this.viewer.setFocus(nextFocusElement);
                            }
                            this.viewer.DOMFocus();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReplaceAllInFolderAction = __decorate([
            __param(2, keybinding_1.IKeybindingService)
        ], ReplaceAllInFolderAction);
        return ReplaceAllInFolderAction;
    }(AbstractSearchAndReplaceAction));
    exports.ReplaceAllInFolderAction = ReplaceAllInFolderAction;
    var ReplaceAction = /** @class */ (function (_super) {
        __extends(ReplaceAction, _super);
        function ReplaceAction(viewer, element, viewlet, replaceService, keyBindingService, editorService) {
            var _this = _super.call(this, Constants.ReplaceActionId, appendKeyBindingLabel(nls.localize('match.replace.label', "Replace"), keyBindingService.lookupKeybinding(Constants.ReplaceActionId), keyBindingService), 'action-replace') || this;
            _this.viewer = viewer;
            _this.element = element;
            _this.viewlet = viewlet;
            _this.replaceService = replaceService;
            _this.editorService = editorService;
            return _this;
        }
        ReplaceAction.prototype.run = function () {
            var _this = this;
            this.enabled = false;
            return this.element.parent().replace(this.element).then(function () {
                var elementToFocus = _this.getElementToFocusAfterReplace();
                if (elementToFocus) {
                    _this.viewer.setFocus(elementToFocus);
                }
                var elementToShowReplacePreview = _this.getElementToShowReplacePreview(elementToFocus);
                _this.viewer.DOMFocus();
                if (!elementToShowReplacePreview || _this.hasToOpenFile()) {
                    _this.viewlet.open(_this.element, true);
                }
                else {
                    _this.replaceService.openReplacePreview(elementToShowReplacePreview, true);
                }
            });
        };
        ReplaceAction.prototype.getElementToFocusAfterReplace = function () {
            var navigator = this.viewer.getNavigator();
            var fileMatched = false;
            var elementToFocus = null;
            do {
                elementToFocus = navigator.current();
                if (elementToFocus instanceof searchModel_1.Match) {
                    if (elementToFocus.parent().id() === this.element.parent().id()) {
                        fileMatched = true;
                        if (this.element.range().getStartPosition().isBeforeOrEqual(elementToFocus.range().getStartPosition())) {
                            // Closest next match in the same file
                            break;
                        }
                    }
                    else if (fileMatched) {
                        // First match in the next file (if expanded)
                        break;
                    }
                }
                else if (fileMatched) {
                    if (!this.viewer.isExpanded(elementToFocus)) {
                        // Next file match (if collapsed)
                        break;
                    }
                }
            } while (!!navigator.next());
            return elementToFocus;
        };
        ReplaceAction.prototype.getElementToShowReplacePreview = function (elementToFocus) {
            if (this.hasSameParent(elementToFocus)) {
                return elementToFocus;
            }
            var previousElement = this.getPreviousElementAfterRemoved(this.viewer, this.element);
            if (this.hasSameParent(previousElement)) {
                return previousElement;
            }
            return null;
        };
        ReplaceAction.prototype.hasSameParent = function (element) {
            return element && element instanceof searchModel_1.Match && element.parent().resource() === this.element.parent().resource();
        };
        ReplaceAction.prototype.hasToOpenFile = function () {
            var activeInput = this.editorService.getActiveEditorInput();
            var file = activeInput ? activeInput.getResource() : void 0;
            if (file) {
                return file.toString() === this.element.parent().resource().toString();
            }
            return false;
        };
        ReplaceAction = __decorate([
            __param(3, replace_1.IReplaceService),
            __param(4, keybinding_1.IKeybindingService),
            __param(5, editorService_1.IWorkbenchEditorService)
        ], ReplaceAction);
        return ReplaceAction;
    }(AbstractSearchAndReplaceAction));
    exports.ReplaceAction = ReplaceAction;
});
