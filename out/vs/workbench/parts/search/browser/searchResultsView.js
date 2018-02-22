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
define(["require", "exports", "vs/nls", "vs/base/common/paths", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/browser/labels", "vs/workbench/parts/search/common/searchModel", "vs/platform/workspace/common/workspace", "vs/editor/common/core/range", "vs/workbench/parts/search/browser/searchActions", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/base/common/labels", "vs/platform/files/common/files"], function (require, exports, nls, paths, DOM, lifecycle_1, winjs_base_1, actionbar_1, countBadge_1, labels_1, searchModel_1, workspace_1, range_1, searchActions_1, instantiation_1, styler_1, themeService_1, labels_2, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SearchDataSource = /** @class */ (function () {
        function SearchDataSource(contextService) {
            var _this = this;
            this.contextService = contextService;
            this.updateIncludeFolderMatch();
            this.listener = this.contextService.onDidChangeWorkbenchState(function () { return _this.updateIncludeFolderMatch(); });
        }
        SearchDataSource.prototype.updateIncludeFolderMatch = function () {
            this.includeFolderMatch = (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE);
        };
        SearchDataSource.prototype.getId = function (tree, element) {
            if (element instanceof searchModel_1.FolderMatch) {
                return element.id();
            }
            if (element instanceof searchModel_1.FileMatch) {
                return element.id();
            }
            if (element instanceof searchModel_1.Match) {
                return element.id();
            }
            return 'root';
        };
        SearchDataSource.prototype._getChildren = function (element) {
            if (element instanceof searchModel_1.FileMatch) {
                return element.matches();
            }
            else if (element instanceof searchModel_1.FolderMatch) {
                return element.matches();
            }
            else if (element instanceof searchModel_1.SearchResult) {
                var folderMatches = element.folderMatches();
                return folderMatches.length > 2 ? // "Other files" + workspace folder = 2
                    folderMatches.filter(function (fm) { return !fm.isEmpty(); }) :
                    element.matches();
            }
            return [];
        };
        SearchDataSource.prototype.getChildren = function (tree, element) {
            return winjs_base_1.TPromise.as(this._getChildren(element));
        };
        SearchDataSource.prototype.hasChildren = function (tree, element) {
            return element instanceof searchModel_1.FileMatch || element instanceof searchModel_1.FolderMatch || element instanceof searchModel_1.SearchResult;
        };
        SearchDataSource.prototype.getParent = function (tree, element) {
            var value = null;
            if (element instanceof searchModel_1.Match) {
                value = element.parent();
            }
            else if (element instanceof searchModel_1.FileMatch) {
                value = this.includeFolderMatch ? element.parent() : element.parent().parent();
            }
            else if (element instanceof searchModel_1.FolderMatch) {
                value = element.parent();
            }
            return winjs_base_1.TPromise.as(value);
        };
        SearchDataSource.prototype.shouldAutoexpand = function (tree, element) {
            var numChildren = this._getChildren(element).length;
            if (numChildren <= 0) {
                return false;
            }
            return numChildren < SearchDataSource.AUTOEXPAND_CHILD_LIMIT || element instanceof searchModel_1.FolderMatch;
        };
        SearchDataSource.prototype.dispose = function () {
            this.listener = lifecycle_1.dispose(this.listener);
        };
        SearchDataSource.AUTOEXPAND_CHILD_LIMIT = 10;
        SearchDataSource = __decorate([
            __param(0, workspace_1.IWorkspaceContextService)
        ], SearchDataSource);
        return SearchDataSource;
    }());
    exports.SearchDataSource = SearchDataSource;
    var SearchSorter = /** @class */ (function () {
        function SearchSorter() {
        }
        SearchSorter.prototype.compare = function (tree, elementA, elementB) {
            if (elementA instanceof searchModel_1.FolderMatch && elementB instanceof searchModel_1.FolderMatch) {
                return elementA.index() - elementB.index();
            }
            if (elementA instanceof searchModel_1.FileMatch && elementB instanceof searchModel_1.FileMatch) {
                return elementA.resource().fsPath.localeCompare(elementB.resource().fsPath) || elementA.name().localeCompare(elementB.name());
            }
            if (elementA instanceof searchModel_1.Match && elementB instanceof searchModel_1.Match) {
                return range_1.Range.compareRangesUsingStarts(elementA.range(), elementB.range());
            }
            return undefined;
        };
        return SearchSorter;
    }());
    exports.SearchSorter = SearchSorter;
    var SearchRenderer = /** @class */ (function (_super) {
        __extends(SearchRenderer, _super);
        function SearchRenderer(actionRunner, viewlet, instantiationService, themeService) {
            var _this = _super.call(this) || this;
            _this.viewlet = viewlet;
            _this.instantiationService = instantiationService;
            _this.themeService = themeService;
            return _this;
        }
        SearchRenderer.prototype.getHeight = function (tree, element) {
            return 22;
        };
        SearchRenderer.prototype.getTemplateId = function (tree, element) {
            if (element instanceof searchModel_1.FolderMatch) {
                return SearchRenderer.FOLDER_MATCH_TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.FileMatch) {
                return SearchRenderer.FILE_MATCH_TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.Match) {
                return SearchRenderer.MATCH_TEMPLATE_ID;
            }
            return null;
        };
        SearchRenderer.prototype.renderTemplate = function (tree, templateId, container) {
            if (templateId === SearchRenderer.FOLDER_MATCH_TEMPLATE_ID) {
                return this.renderFolderMatchTemplate(tree, templateId, container);
            }
            if (templateId === SearchRenderer.FILE_MATCH_TEMPLATE_ID) {
                return this.renderFileMatchTemplate(tree, templateId, container);
            }
            if (templateId === SearchRenderer.MATCH_TEMPLATE_ID) {
                return this.renderMatchTemplate(tree, templateId, container);
            }
            return null;
        };
        SearchRenderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (SearchRenderer.FOLDER_MATCH_TEMPLATE_ID === templateId) {
                this.renderFolderMatch(tree, element, templateData);
            }
            else if (SearchRenderer.FILE_MATCH_TEMPLATE_ID === templateId) {
                this.renderFileMatch(tree, element, templateData);
            }
            else if (SearchRenderer.MATCH_TEMPLATE_ID === templateId) {
                this.renderMatch(tree, element, templateData);
            }
        };
        SearchRenderer.prototype.renderFolderMatchTemplate = function (tree, templateId, container) {
            var folderMatchElement = DOM.append(container, DOM.$('.foldermatch'));
            var label = this.instantiationService.createInstance(labels_1.FileLabel, folderMatchElement, void 0);
            var badge = new countBadge_1.CountBadge(DOM.append(folderMatchElement, DOM.$('.badge')));
            this._register(styler_1.attachBadgeStyler(badge, this.themeService));
            var actions = new actionbar_1.ActionBar(folderMatchElement, { animated: false });
            return { label: label, badge: badge, actions: actions };
        };
        SearchRenderer.prototype.renderFileMatchTemplate = function (tree, templateId, container) {
            var fileMatchElement = DOM.append(container, DOM.$('.filematch'));
            var label = this.instantiationService.createInstance(labels_1.FileLabel, fileMatchElement, void 0);
            var badge = new countBadge_1.CountBadge(DOM.append(fileMatchElement, DOM.$('.badge')));
            this._register(styler_1.attachBadgeStyler(badge, this.themeService));
            var actions = new actionbar_1.ActionBar(fileMatchElement, { animated: false });
            return { label: label, badge: badge, actions: actions };
        };
        SearchRenderer.prototype.renderMatchTemplate = function (tree, templateId, container) {
            DOM.addClass(container, 'linematch');
            var parent = DOM.append(container, DOM.$('a.plain.match'));
            var before = DOM.append(parent, DOM.$('span'));
            var match = DOM.append(parent, DOM.$('span.findInFileMatch'));
            var replace = DOM.append(parent, DOM.$('span.replaceMatch'));
            var after = DOM.append(parent, DOM.$('span'));
            var actions = new actionbar_1.ActionBar(container, { animated: false });
            return {
                parent: parent,
                before: before,
                match: match,
                replace: replace,
                after: after,
                actions: actions
            };
        };
        SearchRenderer.prototype.renderFolderMatch = function (tree, folderMatch, templateData) {
            if (folderMatch.hasRoot()) {
                templateData.label.setFile(folderMatch.resource(), { fileKind: files_1.FileKind.FOLDER });
            }
            else {
                templateData.label.setValue(nls.localize('searchFolderMatch.other.label', "Other files"));
            }
            var count = folderMatch.fileCount();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize('searchFileMatches', "{0} files found", count) : nls.localize('searchFileMatch', "{0} file found", count));
            templateData.actions.clear();
            var input = tree.getInput();
            var actions = [];
            if (input.searchModel.isReplaceActive() && count > 0) {
                actions.push(this.instantiationService.createInstance(searchActions_1.ReplaceAllInFolderAction, tree, folderMatch));
            }
            actions.push(new searchActions_1.RemoveAction(tree, folderMatch));
            templateData.actions.push(actions, { icon: true, label: false });
        };
        SearchRenderer.prototype.renderFileMatch = function (tree, fileMatch, templateData) {
            var folderMatch = fileMatch.parent();
            var root = folderMatch.hasRoot() ? folderMatch.resource() : undefined;
            templateData.label.setFile(fileMatch.resource(), { root: root });
            var count = fileMatch.count();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize('searchMatches', "{0} matches found", count) : nls.localize('searchMatch', "{0} match found", count));
            var input = tree.getInput();
            templateData.actions.clear();
            var actions = [];
            if (input.searchModel.isReplaceActive() && count > 0) {
                actions.push(this.instantiationService.createInstance(searchActions_1.ReplaceAllAction, tree, fileMatch, this.viewlet));
            }
            actions.push(new searchActions_1.RemoveAction(tree, fileMatch));
            templateData.actions.push(actions, { icon: true, label: false });
        };
        SearchRenderer.prototype.renderMatch = function (tree, match, templateData) {
            var preview = match.preview();
            var searchModel = tree.getInput().searchModel;
            var replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
            templateData.before.textContent = preview.before;
            templateData.match.textContent = preview.inside;
            DOM.toggleClass(templateData.match, 'replace', replace);
            templateData.replace.textContent = replace ? match.replaceString : '';
            templateData.after.textContent = preview.after;
            templateData.parent.title = (preview.before + (replace ? match.replaceString : preview.inside) + preview.after).trim().substr(0, 999);
            templateData.actions.clear();
            if (searchModel.isReplaceActive()) {
                templateData.actions.push([this.instantiationService.createInstance(searchActions_1.ReplaceAction, tree, match, this.viewlet), new searchActions_1.RemoveAction(tree, match)], { icon: true, label: false });
            }
            else {
                templateData.actions.push([new searchActions_1.RemoveAction(tree, match)], { icon: true, label: false });
            }
        };
        SearchRenderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            if (SearchRenderer.FOLDER_MATCH_TEMPLATE_ID === templateId) {
                templateData.label.dispose();
            }
            if (SearchRenderer.FILE_MATCH_TEMPLATE_ID === templateId) {
                templateData.label.dispose();
            }
        };
        SearchRenderer.FOLDER_MATCH_TEMPLATE_ID = 'folderMatch';
        SearchRenderer.FILE_MATCH_TEMPLATE_ID = 'fileMatch';
        SearchRenderer.MATCH_TEMPLATE_ID = 'match';
        SearchRenderer = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, themeService_1.IThemeService)
        ], SearchRenderer);
        return SearchRenderer;
    }(lifecycle_1.Disposable));
    exports.SearchRenderer = SearchRenderer;
    var SearchAccessibilityProvider = /** @class */ (function () {
        function SearchAccessibilityProvider(contextService) {
            this.contextService = contextService;
        }
        SearchAccessibilityProvider.prototype.getAriaLabel = function (tree, element) {
            if (element instanceof searchModel_1.FolderMatch) {
                return nls.localize('folderMatchAriaLabel', "{0} matches in folder root {1}, Search result", element.count(), element.name());
            }
            if (element instanceof searchModel_1.FileMatch) {
                var path = labels_2.getPathLabel(element.resource(), this.contextService) || element.resource().fsPath;
                return nls.localize('fileMatchAriaLabel', "{0} matches in file {1} of folder {2}, Search result", element.count(), element.name(), paths.dirname(path));
            }
            if (element instanceof searchModel_1.Match) {
                var match = element;
                var searchModel = tree.getInput().searchModel;
                var replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
                var matchString = match.getMatchString();
                var range = match.range();
                if (replace) {
                    return nls.localize('replacePreviewResultAria', "Replace term {0} with {1} at column position {2} in line with text {3}", matchString, match.replaceString, range.startColumn + 1, match.text());
                }
                return nls.localize('searchResultAria', "Found term {0} at column position {1} in line with text {2}", matchString, range.startColumn + 1, match.text());
            }
            return undefined;
        };
        SearchAccessibilityProvider = __decorate([
            __param(0, workspace_1.IWorkspaceContextService)
        ], SearchAccessibilityProvider);
        return SearchAccessibilityProvider;
    }());
    exports.SearchAccessibilityProvider = SearchAccessibilityProvider;
    var SearchFilter = /** @class */ (function () {
        function SearchFilter() {
        }
        SearchFilter.prototype.isVisible = function (tree, element) {
            return !(element instanceof searchModel_1.FileMatch || element instanceof searchModel_1.FolderMatch) || element.matches().length > 0;
        };
        return SearchFilter;
    }());
    exports.SearchFilter = SearchFilter;
});
