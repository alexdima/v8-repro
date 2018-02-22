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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/browser/dom", "vs/workbench/parts/files/common/files", "vs/workbench/browser/parts/views/viewsViewlet", "vs/platform/configuration/common/configuration", "vs/workbench/parts/files/electron-browser/views/explorerViewer", "vs/workbench/parts/files/electron-browser/views/explorerView", "vs/workbench/parts/files/electron-browser/views/emptyView", "vs/workbench/parts/files/electron-browser/views/openEditorsView", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/group/common/groupService", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/workbench/common/views", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/css!./media/explorerviewlet"], function (require, exports, nls_1, winjs_base_1, DOM, files_1, viewsViewlet_1, configuration_1, explorerViewer_1, explorerView_1, emptyView_1, openEditorsView_1, storage_1, instantiation_1, extensions_1, workspace_1, telemetry_1, serviceCollection_1, editorService_1, groupService_1, contextkey_1, themeService_1, views_1, contextView_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExplorerViewletViewsContribution = /** @class */ (function (_super) {
        __extends(ExplorerViewletViewsContribution, _super);
        function ExplorerViewletViewsContribution(workspaceContextService, configurationService, contextKeyService) {
            var _this = _super.call(this) || this;
            _this.workspaceContextService = workspaceContextService;
            _this.configurationService = configurationService;
            _this.registerViews();
            _this.openEditorsVisibleContextKey = files_1.OpenEditorsVisibleContext.bindTo(contextKeyService);
            _this.updateOpenEditorsVisibility();
            _this._register(workspaceContextService.onDidChangeWorkbenchState(function () { return _this.registerViews(); }));
            _this._register(workspaceContextService.onDidChangeWorkspaceFolders(function () { return _this.registerViews(); }));
            _this._register(_this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationUpdated(e); }));
            return _this;
        }
        ExplorerViewletViewsContribution.prototype.registerViews = function () {
            var viewDescriptors = views_1.ViewsRegistry.getViews(views_1.ViewLocation.Explorer);
            var viewDescriptorsToRegister = [];
            var viewDescriptorsToDeregister = [];
            var openEditorsViewDescriptor = this.createOpenEditorsViewDescriptor();
            var openEditorsViewDescriptorExists = viewDescriptors.some(function (v) { return v.id === openEditorsViewDescriptor.id; });
            var explorerViewDescriptor = this.createExplorerViewDescriptor();
            var explorerViewDescriptorExists = viewDescriptors.some(function (v) { return v.id === explorerViewDescriptor.id; });
            var emptyViewDescriptor = this.createEmptyViewDescriptor();
            var emptyViewDescriptorExists = viewDescriptors.some(function (v) { return v.id === emptyViewDescriptor.id; });
            if (!openEditorsViewDescriptorExists) {
                viewDescriptorsToRegister.push(openEditorsViewDescriptor);
            }
            if (this.workspaceContextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY || this.workspaceContextService.getWorkspace().folders.length === 0) {
                if (explorerViewDescriptorExists) {
                    viewDescriptorsToDeregister.push(explorerViewDescriptor.id);
                }
                if (!emptyViewDescriptorExists) {
                    viewDescriptorsToRegister.push(emptyViewDescriptor);
                }
            }
            else {
                if (emptyViewDescriptorExists) {
                    viewDescriptorsToDeregister.push(emptyViewDescriptor.id);
                }
                if (!explorerViewDescriptorExists) {
                    viewDescriptorsToRegister.push(explorerViewDescriptor);
                }
            }
            if (viewDescriptorsToRegister.length) {
                views_1.ViewsRegistry.registerViews(viewDescriptorsToRegister);
            }
            if (viewDescriptorsToDeregister.length) {
                views_1.ViewsRegistry.deregisterViews(viewDescriptorsToDeregister, views_1.ViewLocation.Explorer);
            }
        };
        ExplorerViewletViewsContribution.prototype.createOpenEditorsViewDescriptor = function () {
            return {
                id: openEditorsView_1.OpenEditorsView.ID,
                name: openEditorsView_1.OpenEditorsView.NAME,
                location: views_1.ViewLocation.Explorer,
                ctor: openEditorsView_1.OpenEditorsView,
                order: 0,
                when: files_1.OpenEditorsVisibleCondition,
                canToggleVisibility: true
            };
        };
        ExplorerViewletViewsContribution.prototype.createEmptyViewDescriptor = function () {
            return {
                id: emptyView_1.EmptyView.ID,
                name: emptyView_1.EmptyView.NAME,
                location: views_1.ViewLocation.Explorer,
                ctor: emptyView_1.EmptyView,
                order: 1,
                canToggleVisibility: false
            };
        };
        ExplorerViewletViewsContribution.prototype.createExplorerViewDescriptor = function () {
            return {
                id: explorerView_1.ExplorerView.ID,
                name: nls_1.localize('folders', "Folders"),
                location: views_1.ViewLocation.Explorer,
                ctor: explorerView_1.ExplorerView,
                order: 1,
                canToggleVisibility: false
            };
        };
        ExplorerViewletViewsContribution.prototype.onConfigurationUpdated = function (e) {
            if (e.affectsConfiguration('explorer.openEditors.visible')) {
                this.updateOpenEditorsVisibility();
            }
        };
        ExplorerViewletViewsContribution.prototype.updateOpenEditorsVisibility = function () {
            this.openEditorsVisibleContextKey.set(this.workspaceContextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY || this.configurationService.getValue('explorer.openEditors.visible') !== 0);
        };
        ExplorerViewletViewsContribution = __decorate([
            __param(0, workspace_1.IWorkspaceContextService),
            __param(1, configuration_1.IConfigurationService),
            __param(2, contextkey_1.IContextKeyService)
        ], ExplorerViewletViewsContribution);
        return ExplorerViewletViewsContribution;
    }(lifecycle_1.Disposable));
    exports.ExplorerViewletViewsContribution = ExplorerViewletViewsContribution;
    var ExplorerViewlet = /** @class */ (function (_super) {
        __extends(ExplorerViewlet, _super);
        function ExplorerViewlet(telemetryService, contextService, storageService, editorGroupService, editorService, configurationService, instantiationService, contextKeyService, themeService, contextMenuService, extensionService) {
            var _this = _super.call(this, files_1.VIEWLET_ID, views_1.ViewLocation.Explorer, ExplorerViewlet.EXPLORER_VIEWS_STATE, true, telemetryService, storageService, instantiationService, themeService, contextService, contextKeyService, contextMenuService, extensionService) || this;
            _this.contextService = contextService;
            _this.storageService = storageService;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            _this.configurationService = configurationService;
            _this.instantiationService = instantiationService;
            _this.viewletState = new explorerViewer_1.FileViewletState();
            _this.viewletVisibleContextKey = files_1.ExplorerViewletVisibleContext.bindTo(contextKeyService);
            _this._register(_this.contextService.onDidChangeWorkspaceName(function (e) { return _this.updateTitleArea(); }));
            return _this;
        }
        ExplorerViewlet.prototype.create = function (parent) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var el;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, _super.prototype.create.call(this, parent)];
                        case 1:
                            _a.sent();
                            el = parent.getHTMLElement();
                            DOM.addClass(el, 'explorer-viewlet');
                            return [2 /*return*/];
                    }
                });
            });
        };
        ExplorerViewlet.prototype.isOpenEditorsVisible = function () {
            return this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY || this.configurationService.getValue('explorer.openEditors.visible') !== 0;
        };
        ExplorerViewlet.prototype.createView = function (viewDescriptor, options) {
            var _this = this;
            if (viewDescriptor.id === explorerView_1.ExplorerView.ID) {
                // Create a delegating editor service for the explorer to be able to delay the refresh in the opened
                // editors view above. This is a workaround for being able to double click on a file to make it pinned
                // without causing the animation in the opened editors view to kick in and change scroll position.
                // We try to be smart and only use the delay if we recognize that the user action is likely to cause
                // a new entry in the opened editors view.
                var delegatingEditorService = this.instantiationService.createInstance(editorService_1.DelegatingWorkbenchEditorService);
                delegatingEditorService.setEditorOpenHandler(function (input, options, arg3) {
                    var openEditorsView = _this.getOpenEditorsView();
                    if (openEditorsView) {
                        var delay = 0;
                        var config = _this.configurationService.getValue();
                        // No need to delay if preview is disabled
                        var delayEditorOpeningInOpenedEditors = !!config.workbench.editor.enablePreview;
                        if (delayEditorOpeningInOpenedEditors && (arg3 === false /* not side by side */ || typeof arg3 !== 'number' /* no explicit position */)) {
                            var activeGroup = _this.editorGroupService.getStacksModel().activeGroup;
                            if (!activeGroup || !activeGroup.previewEditor) {
                                delay = 250; // a new editor entry is likely because there is either no group or no preview in group
                            }
                        }
                        openEditorsView.setStructuralRefreshDelay(delay);
                    }
                    var onSuccessOrError = function (editor) {
                        var openEditorsView = _this.getOpenEditorsView();
                        if (openEditorsView) {
                            openEditorsView.setStructuralRefreshDelay(0);
                        }
                        return editor;
                    };
                    return _this.editorService.openEditor(input, options, arg3).then(onSuccessOrError, onSuccessOrError);
                });
                var explorerInstantiator = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([editorService_1.IWorkbenchEditorService, delegatingEditorService]));
                return explorerInstantiator.createInstance(explorerView_1.ExplorerView, __assign({}, options, { viewletState: this.viewletState }));
            }
            return _super.prototype.createView.call(this, viewDescriptor, options);
        };
        ExplorerViewlet.prototype.getExplorerView = function () {
            return this.getView(explorerView_1.ExplorerView.ID);
        };
        ExplorerViewlet.prototype.getOpenEditorsView = function () {
            return this.getView(openEditorsView_1.OpenEditorsView.ID);
        };
        ExplorerViewlet.prototype.getEmptyView = function () {
            return this.getView(emptyView_1.EmptyView.ID);
        };
        ExplorerViewlet.prototype.setVisible = function (visible) {
            this.viewletVisibleContextKey.set(visible);
            return _super.prototype.setVisible.call(this, visible);
        };
        ExplorerViewlet.prototype.getActionRunner = function () {
            if (!this.actionRunner) {
                this.actionRunner = new explorerViewer_1.ActionRunner(this.viewletState);
            }
            return this.actionRunner;
        };
        ExplorerViewlet.prototype.getViewletState = function () {
            return this.viewletState;
        };
        ExplorerViewlet.prototype.loadViewsStates = function () {
            _super.prototype.loadViewsStates.call(this);
            // Remove the open editors view state if it is removed globally
            if (!this.isOpenEditorsVisible()) {
                this.viewsStates.delete(openEditorsView_1.OpenEditorsView.ID);
            }
        };
        ExplorerViewlet.EXPLORER_VIEWS_STATE = 'workbench.explorer.views.state';
        ExplorerViewlet = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, storage_1.IStorageService),
            __param(3, groupService_1.IEditorGroupService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, configuration_1.IConfigurationService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, contextkey_1.IContextKeyService),
            __param(8, themeService_1.IThemeService),
            __param(9, contextView_1.IContextMenuService),
            __param(10, extensions_1.IExtensionService)
        ], ExplorerViewlet);
        return ExplorerViewlet;
    }(viewsViewlet_1.PersistentViewsViewlet));
    exports.ExplorerViewlet = ExplorerViewlet;
});
