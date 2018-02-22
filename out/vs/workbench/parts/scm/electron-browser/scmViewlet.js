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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/event", "vs/base/browser/event", "vs/base/common/paths", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/workbench/browser/parts/views/panelViewlet", "vs/base/browser/dom", "vs/platform/telemetry/common/telemetry", "vs/workbench/parts/scm/common/scm", "vs/workbench/browser/labels", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/services/scm/common/scm", "vs/workbench/services/group/common/groupService", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/platform/message/common/message", "vs/platform/actions/common/actions", "vs/base/common/actions", "vs/platform/actions/browser/menuItemActionItem", "./scmMenus", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/theme/common/themeService", "./scmUtil", "vs/platform/theme/common/styler", "vs/platform/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/parts/extensions/common/extensions", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/octiconLabel/octiconLabel", "vs/base/browser/mouseEvent", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/arrays", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/base/common/async", "vs/css!./media/scmViewlet"], function (require, exports, nls_1, winjs_base_1, event_1, event_2, paths_1, errors_1, lifecycle_1, panelViewlet_1, dom_1, telemetry_1, scm_1, labels_1, countBadge_1, scm_2, groupService_1, editorService_1, instantiation_1, contextView_1, contextkey_1, commands_1, keybinding_1, message_1, actions_1, actions_2, menuItemActionItem_1, scmMenus_1, actionbar_1, themeService_1, scmUtil_1, styler_1, extensions_1, workspace_1, storage_1, viewlet_1, extensions_2, inputBox_1, keyboardEvent_1, octiconLabel_1, mouseEvent_1, platform, strings_1, arrays_1, listService_1, configuration_1, async_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProvidersListDelegate = /** @class */ (function () {
        function ProvidersListDelegate() {
        }
        ProvidersListDelegate.prototype.getHeight = function (element) {
            return 22;
        };
        ProvidersListDelegate.prototype.getTemplateId = function (element) {
            return 'provider';
        };
        return ProvidersListDelegate;
    }());
    var StatusBarAction = /** @class */ (function (_super) {
        __extends(StatusBarAction, _super);
        function StatusBarAction(command, commandService) {
            var _this = _super.call(this, "statusbaraction{" + command.id + "}", command.title, '', true) || this;
            _this.command = command;
            _this.commandService = commandService;
            _this.tooltip = command.tooltip;
            return _this;
        }
        StatusBarAction.prototype.run = function () {
            return (_a = this.commandService).executeCommand.apply(_a, [this.command.id].concat(this.command.arguments));
            var _a;
        };
        return StatusBarAction;
    }(actions_2.Action));
    var StatusBarActionItem = /** @class */ (function (_super) {
        __extends(StatusBarActionItem, _super);
        function StatusBarActionItem(action) {
            return _super.call(this, null, action, {}) || this;
        }
        StatusBarActionItem.prototype._updateLabel = function () {
            if (this.options.label) {
                this.$e.innerHtml(octiconLabel_1.render(this.getAction().label));
            }
        };
        return StatusBarActionItem;
    }(actionbar_1.ActionItem));
    var ProviderRenderer = /** @class */ (function () {
        function ProviderRenderer(commandService, themeService) {
            this.commandService = commandService;
            this.themeService = themeService;
            this.templateId = 'provider';
        }
        ProviderRenderer.prototype.renderTemplate = function (container) {
            var provider = dom_1.append(container, dom_1.$('.scm-provider'));
            var name = dom_1.append(provider, dom_1.$('.name'));
            var title = dom_1.append(name, dom_1.$('span.title'));
            var type = dom_1.append(name, dom_1.$('span.type'));
            var countContainer = dom_1.append(provider, dom_1.$('.count'));
            var count = new countBadge_1.CountBadge(countContainer);
            var badgeStyler = styler_1.attachBadgeStyler(count, this.themeService);
            var actionBar = new actionbar_1.ActionBar(provider, { actionItemProvider: function (a) { return new StatusBarActionItem(a); } });
            var disposable = lifecycle_1.empty;
            var templateDisposable = lifecycle_1.combinedDisposable([actionBar, badgeStyler]);
            return { title: title, type: type, countContainer: countContainer, count: count, actionBar: actionBar, disposable: disposable, templateDisposable: templateDisposable };
        };
        ProviderRenderer.prototype.renderElement = function (repository, index, templateData) {
            var _this = this;
            templateData.disposable.dispose();
            var disposables = [];
            if (repository.provider.rootUri) {
                templateData.title.textContent = paths_1.basename(repository.provider.rootUri.fsPath);
                templateData.type.textContent = repository.provider.label;
            }
            else {
                templateData.title.textContent = repository.provider.label;
                templateData.type.textContent = '';
            }
            // const disposables = commands.map(c => this.statusbarService.addEntry({
            // 	text: c.title,
            // 	tooltip: `${repository.provider.label} - ${c.tooltip}`,
            // 	command: c.id,
            // 	arguments: c.arguments
            // }, MainThreadStatusBarAlignment.LEFT, 10000));
            var actions = [];
            var disposeActions = function () { return lifecycle_1.dispose(actions); };
            disposables.push({ dispose: disposeActions });
            var update = function () {
                disposeActions();
                var commands = repository.provider.statusBarCommands || [];
                actions.splice.apply(actions, [0, actions.length].concat(commands.map(function (c) { return new StatusBarAction(c, _this.commandService); })));
                templateData.actionBar.clear();
                templateData.actionBar.push(actions);
                var count = repository.provider.count || 0;
                dom_1.toggleClass(templateData.countContainer, 'hidden', count === 0);
                templateData.count.setCount(repository.provider.count);
            };
            repository.provider.onDidChange(update, null, disposables);
            update();
            templateData.disposable = lifecycle_1.combinedDisposable(disposables);
        };
        ProviderRenderer.prototype.disposeTemplate = function (templateData) {
            templateData.disposable.dispose();
            templateData.templateDisposable.dispose();
        };
        ProviderRenderer = __decorate([
            __param(0, commands_1.ICommandService),
            __param(1, themeService_1.IThemeService)
        ], ProviderRenderer);
        return ProviderRenderer;
    }());
    var MainPanel = /** @class */ (function (_super) {
        __extends(MainPanel, _super);
        function MainPanel(viewModel, keybindingService, contextMenuService, scmService, instantiationService, contextKeyService, menuService, configurationService) {
            var _this = _super.call(this, nls_1.localize('scm providers', "Source Control Providers"), {}, keybindingService, contextMenuService, configurationService) || this;
            _this.viewModel = viewModel;
            _this.keybindingService = keybindingService;
            _this.contextMenuService = contextMenuService;
            _this.scmService = scmService;
            _this.instantiationService = instantiationService;
            _this.contextKeyService = contextKeyService;
            _this.menuService = menuService;
            _this.visibilityDisposables = [];
            _this.previousSelection = undefined;
            _this._onSelectionChange = new event_1.Emitter();
            _this.onSelectionChange = _this._onSelectionChange.event;
            _this.updateBodySize();
            return _this;
        }
        MainPanel.prototype.focus = function () {
            _super.prototype.focus.call(this);
            this.list.domFocus();
        };
        MainPanel.prototype.hide = function (repository) {
            var selectedElements = this.list.getSelectedElements();
            var index = selectedElements.indexOf(repository);
            if (index === -1) {
                return;
            }
            var selection = this.list.getSelection();
            this.list.setSelection(selection.slice(0, index).concat(selection.slice(index + 1)));
        };
        MainPanel.prototype.getSelection = function () {
            return this.list.getSelectedElements();
        };
        MainPanel.prototype.renderBody = function (container) {
            var delegate = new ProvidersListDelegate();
            var renderer = this.instantiationService.createInstance(ProviderRenderer);
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchList, container, delegate, [renderer], {
                identityProvider: function (repository) { return repository.provider.id; }
            });
            this.disposables.push(this.list);
            this.list.onSelectionChange(this.onListSelectionChange, this, this.disposables);
            this.list.onContextMenu(this.onListContextMenu, this, this.disposables);
            this.viewModel.onDidChangeVisibility(this.onDidChangeVisibility, this, this.disposables);
            this.onDidChangeVisibility(this.viewModel.isVisible());
        };
        MainPanel.prototype.onDidChangeVisibility = function (visible) {
            var _this = this;
            if (visible) {
                this.viewModel.onDidSplice(function (_a) {
                    var index = _a.index, deleteCount = _a.deleteCount, elements = _a.elements;
                    return _this.splice(index, deleteCount, elements);
                }, null, this.visibilityDisposables);
                this.splice(0, 0, this.viewModel.repositories);
            }
            else {
                this.visibilityDisposables = lifecycle_1.dispose(this.visibilityDisposables);
                this.splice(0, this.list.length);
            }
        };
        MainPanel.prototype.splice = function (index, deleteCount, repositories) {
            if (repositories === void 0) { repositories = []; }
            var wasEmpty = this.list.length === 0;
            this.list.splice(index, deleteCount, repositories);
            this.updateBodySize();
            // Automatically select the first one
            if (wasEmpty && this.list.length > 0) {
                this.restoreSelection();
            }
        };
        MainPanel.prototype.layoutBody = function (size) {
            this.list.layout(size);
        };
        MainPanel.prototype.updateBodySize = function () {
            var count = this.viewModel.repositories.length;
            if (count <= 5) {
                var size = count * 22;
                this.minimumBodySize = size;
                this.maximumBodySize = size;
            }
            else {
                this.minimumBodySize = 5 * 22;
                this.maximumBodySize = Number.POSITIVE_INFINITY;
            }
        };
        MainPanel.prototype.onListContextMenu = function (e) {
            var repository = e.element;
            var contextKeyService = this.contextKeyService.createScoped();
            var scmProviderKey = contextKeyService.createKey('scmProvider', void 0);
            scmProviderKey.set(repository.provider.contextValue);
            var menu = this.menuService.createMenu(actions_1.MenuId.SCMSourceControl, contextKeyService);
            var primary = [];
            var secondary = [];
            var result = { primary: primary, secondary: secondary };
            menuItemActionItem_1.fillInActions(menu, { shouldForwardArgs: true }, result, this.contextMenuService, function (g) { return g === 'inline'; });
            menu.dispose();
            contextKeyService.dispose();
            if (secondary.length === 0) {
                return;
            }
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return e.anchor; },
                getActions: function () { return winjs_base_1.TPromise.as(secondary); },
                getActionsContext: function () { return repository.provider; }
            });
        };
        MainPanel.prototype.onListSelectionChange = function (e) {
            // select one repository if the selected one is gone
            if (e.elements.length === 0 && this.list.length > 0) {
                this.restoreSelection();
                return;
            }
            if (e.elements.length > 0) {
                this.previousSelection = e.elements;
            }
            this._onSelectionChange.fire(e.elements);
        };
        MainPanel.prototype.restoreSelection = function () {
            var _this = this;
            var selection;
            if (this.previousSelection) {
                selection = this.previousSelection
                    .map(function (r) { return _this.viewModel.repositories.indexOf(r); })
                    .filter(function (i) { return i > -1; });
            }
            if (!selection || selection.length === 0) {
                selection = [0];
            }
            this.list.setSelection(selection);
            this.list.setFocus([selection[0]]);
        };
        MainPanel = __decorate([
            __param(1, keybinding_1.IKeybindingService),
            __param(2, contextView_1.IContextMenuService),
            __param(3, scm_2.ISCMService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, contextkey_1.IContextKeyService),
            __param(6, actions_1.IMenuService),
            __param(7, configuration_1.IConfigurationService)
        ], MainPanel);
        return MainPanel;
    }(panelViewlet_1.ViewletPanel));
    var ResourceGroupRenderer = /** @class */ (function () {
        function ResourceGroupRenderer(actionItemProvider, themeService, contextKeyService, contextMenuService, menuService) {
            this.actionItemProvider = actionItemProvider;
            this.themeService = themeService;
            this.contextKeyService = contextKeyService;
            this.contextMenuService = contextMenuService;
            this.menuService = menuService;
        }
        Object.defineProperty(ResourceGroupRenderer.prototype, "templateId", {
            get: function () { return ResourceGroupRenderer.TEMPLATE_ID; },
            enumerable: true,
            configurable: true
        });
        ResourceGroupRenderer.prototype.renderTemplate = function (container) {
            var element = dom_1.append(container, dom_1.$('.resource-group'));
            var name = dom_1.append(element, dom_1.$('.name'));
            var actionsContainer = dom_1.append(element, dom_1.$('.actions'));
            var actionBar = new actionbar_1.ActionBar(actionsContainer, { actionItemProvider: this.actionItemProvider });
            var countContainer = dom_1.append(element, dom_1.$('.count'));
            var count = new countBadge_1.CountBadge(countContainer);
            var styler = styler_1.attachBadgeStyler(count, this.themeService);
            var elementDisposable = lifecycle_1.empty;
            return {
                name: name, count: count, actionBar: actionBar, elementDisposable: elementDisposable, dispose: function () {
                    actionBar.dispose();
                    styler.dispose();
                }
            };
        };
        ResourceGroupRenderer.prototype.renderElement = function (group, index, template) {
            var _this = this;
            template.elementDisposable.dispose();
            template.name.textContent = group.label;
            template.actionBar.clear();
            template.actionBar.context = group;
            var disposables = [];
            var contextKeyService = this.contextKeyService.createScoped();
            disposables.push(contextKeyService);
            contextKeyService.createKey('scmProvider', group.provider.contextValue);
            contextKeyService.createKey('scmResourceGroup', scmUtil_1.getSCMResourceContextKey(group));
            var menu = this.menuService.createMenu(actions_1.MenuId.SCMResourceGroupContext, contextKeyService);
            disposables.push(menu);
            var updateActions = function () {
                var primary = [];
                var secondary = [];
                var result = { primary: primary, secondary: secondary };
                menuItemActionItem_1.fillInActions(menu, { shouldForwardArgs: true }, result, _this.contextMenuService, function (g) { return /^inline/.test(g); });
                template.actionBar.clear();
                template.actionBar.push(primary, { icon: true, label: false });
            };
            menu.onDidChange(updateActions, null, disposables);
            updateActions();
            var updateCount = function () { return template.count.setCount(group.elements.length); };
            group.onDidSplice(updateCount, null, disposables);
            updateCount();
            template.elementDisposable = lifecycle_1.combinedDisposable(disposables);
        };
        ResourceGroupRenderer.prototype.disposeTemplate = function (template) {
            template.dispose();
        };
        ResourceGroupRenderer.TEMPLATE_ID = 'resource group';
        return ResourceGroupRenderer;
    }());
    var MultipleSelectionActionRunner = /** @class */ (function (_super) {
        __extends(MultipleSelectionActionRunner, _super);
        function MultipleSelectionActionRunner(getSelectedResources) {
            var _this = _super.call(this) || this;
            _this.getSelectedResources = getSelectedResources;
            return _this;
        }
        MultipleSelectionActionRunner.prototype.runAction = function (action, context) {
            if (action instanceof actions_1.MenuItemAction) {
                var selection = this.getSelectedResources();
                var filteredSelection = selection.filter(function (s) { return s !== context; });
                if (selection.length === filteredSelection.length || selection.length === 1) {
                    return action.run(context);
                }
                return action.run.apply(action, [context].concat(filteredSelection));
            }
            return _super.prototype.runAction.call(this, action, context);
        };
        return MultipleSelectionActionRunner;
    }(actions_2.ActionRunner));
    var ResourceRenderer = /** @class */ (function () {
        function ResourceRenderer(actionItemProvider, getSelectedResources, themeService, instantiationService, contextKeyService, contextMenuService, menuService) {
            this.actionItemProvider = actionItemProvider;
            this.getSelectedResources = getSelectedResources;
            this.themeService = themeService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.contextMenuService = contextMenuService;
            this.menuService = menuService;
        }
        Object.defineProperty(ResourceRenderer.prototype, "templateId", {
            get: function () { return ResourceRenderer.TEMPLATE_ID; },
            enumerable: true,
            configurable: true
        });
        ResourceRenderer.prototype.renderTemplate = function (container) {
            var element = dom_1.append(container, dom_1.$('.resource'));
            var name = dom_1.append(element, dom_1.$('.name'));
            var fileLabel = this.instantiationService.createInstance(labels_1.FileLabel, name, void 0);
            var actionsContainer = dom_1.append(fileLabel.element, dom_1.$('.actions'));
            var actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionItemProvider: this.actionItemProvider,
                actionRunner: new MultipleSelectionActionRunner(this.getSelectedResources)
            });
            var decorationIcon = dom_1.append(element, dom_1.$('.decoration-icon'));
            return {
                element: element, name: name, fileLabel: fileLabel, decorationIcon: decorationIcon, actionBar: actionBar, elementDisposable: lifecycle_1.empty, dispose: function () {
                    actionBar.dispose();
                    fileLabel.dispose();
                }
            };
        };
        ResourceRenderer.prototype.renderElement = function (resource, index, template) {
            var _this = this;
            template.elementDisposable.dispose();
            var theme = this.themeService.getTheme();
            var icon = theme.type === themeService_1.LIGHT ? resource.decorations.icon : resource.decorations.iconDark;
            template.fileLabel.setFile(resource.sourceUri, { fileDecorations: { colors: false, badges: !icon, data: resource.decorations } });
            template.actionBar.context = resource;
            var disposables = [];
            var contextKeyService = this.contextKeyService.createScoped();
            disposables.push(contextKeyService);
            contextKeyService.createKey('scmProvider', resource.resourceGroup.provider.contextValue);
            contextKeyService.createKey('scmResourceGroup', scmUtil_1.getSCMResourceContextKey(resource.resourceGroup));
            var menu = this.menuService.createMenu(actions_1.MenuId.SCMResourceContext, contextKeyService);
            disposables.push(menu);
            var updateActions = function () {
                var primary = [];
                var secondary = [];
                var result = { primary: primary, secondary: secondary };
                menuItemActionItem_1.fillInActions(menu, { shouldForwardArgs: true }, result, _this.contextMenuService, function (g) { return /^inline/.test(g); });
                template.actionBar.clear();
                template.actionBar.push(primary, { icon: true, label: false });
            };
            menu.onDidChange(updateActions, null, disposables);
            updateActions();
            dom_1.toggleClass(template.name, 'strike-through', resource.decorations.strikeThrough);
            dom_1.toggleClass(template.element, 'faded', resource.decorations.faded);
            if (icon) {
                template.decorationIcon.style.display = '';
                template.decorationIcon.style.backgroundImage = "url('" + icon + "')";
                template.decorationIcon.title = resource.decorations.tooltip;
            }
            else {
                template.decorationIcon.style.display = 'none';
                template.decorationIcon.style.backgroundImage = '';
            }
            template.element.setAttribute('data-tooltip', resource.decorations.tooltip);
            template.elementDisposable = lifecycle_1.combinedDisposable(disposables);
        };
        ResourceRenderer.prototype.disposeTemplate = function (template) {
            template.elementDisposable.dispose();
            template.dispose();
        };
        ResourceRenderer.TEMPLATE_ID = 'resource';
        return ResourceRenderer;
    }());
    var ProviderListDelegate = /** @class */ (function () {
        function ProviderListDelegate() {
        }
        ProviderListDelegate.prototype.getHeight = function () { return 22; };
        ProviderListDelegate.prototype.getTemplateId = function (element) {
            return scmUtil_1.isSCMResource(element) ? ResourceRenderer.TEMPLATE_ID : ResourceGroupRenderer.TEMPLATE_ID;
        };
        return ProviderListDelegate;
    }());
    function scmResourceIdentityProvider(r) {
        if (scmUtil_1.isSCMResource(r)) {
            var group = r.resourceGroup;
            var provider = group.provider;
            return provider.contextValue + "/" + group.id + "/" + r.sourceUri.toString();
        }
        else {
            var provider = r.provider;
            return provider.contextValue + "/" + r.id;
        }
    }
    function isGroupVisible(group) {
        return group.elements.length > 0 || !group.hideWhenEmpty;
    }
    var ResourceGroupSplicer = /** @class */ (function () {
        function ResourceGroupSplicer(groupSequence, spliceable) {
            this.spliceable = spliceable;
            this.items = [];
            this.disposables = [];
            groupSequence.onDidSplice(this.onDidSpliceGroups, this, this.disposables);
            this.onDidSpliceGroups({ start: 0, deleteCount: 0, toInsert: groupSequence.elements });
        }
        ResourceGroupSplicer.prototype.onDidSpliceGroups = function (_a) {
            var _this = this;
            var start = _a.start, deleteCount = _a.deleteCount, toInsert = _a.toInsert;
            var absoluteStart = 0;
            for (var i = 0; i < start; i++) {
                var item = this.items[i];
                absoluteStart += (item.visible ? 1 : 0) + item.group.elements.length;
            }
            var absoluteDeleteCount = 0;
            for (var i = 0; i < deleteCount; i++) {
                var item = this.items[start + i];
                absoluteDeleteCount += (item.visible ? 1 : 0) + item.group.elements.length;
            }
            var itemsToInsert = [];
            var absoluteToInsert = [];
            var _loop_1 = function (group) {
                var visible = isGroupVisible(group);
                if (visible) {
                    absoluteToInsert.push(group);
                }
                for (var _i = 0, _a = group.elements; _i < _a.length; _i++) {
                    var element = _a[_i];
                    absoluteToInsert.push(element);
                }
                var disposable = lifecycle_1.combinedDisposable([
                    group.onDidChange(function () { return _this.onDidChangeGroup(group); }),
                    group.onDidSplice(function (splice) { return _this.onDidSpliceGroup(group, splice); })
                ]);
                itemsToInsert.push({ group: group, visible: visible, disposable: disposable });
            };
            for (var _i = 0, toInsert_1 = toInsert; _i < toInsert_1.length; _i++) {
                var group = toInsert_1[_i];
                _loop_1(group);
            }
            var itemsToDispose = (_b = this.items).splice.apply(_b, [start, deleteCount].concat(itemsToInsert));
            for (var _c = 0, itemsToDispose_1 = itemsToDispose; _c < itemsToDispose_1.length; _c++) {
                var item = itemsToDispose_1[_c];
                item.disposable.dispose();
            }
            this.spliceable.splice(absoluteStart, absoluteDeleteCount, absoluteToInsert);
            var _b;
        };
        ResourceGroupSplicer.prototype.onDidChangeGroup = function (group) {
            var itemIndex = arrays_1.firstIndex(this.items, function (item) { return item.group === group; });
            if (itemIndex < 0) {
                return;
            }
            var item = this.items[itemIndex];
            var visible = isGroupVisible(group);
            if (item.visible === visible) {
                return;
            }
            var absoluteStart = 0;
            for (var i = 0; i < itemIndex; i++) {
                var item_1 = this.items[i];
                absoluteStart += (item_1.visible ? 1 : 0) + item_1.group.elements.length;
            }
            if (visible) {
                this.spliceable.splice(absoluteStart, 0, [group].concat(group.elements));
            }
            else {
                this.spliceable.splice(absoluteStart, 1 + group.elements.length, []);
            }
            item.visible = visible;
        };
        ResourceGroupSplicer.prototype.onDidSpliceGroup = function (group, _a) {
            var start = _a.start, deleteCount = _a.deleteCount, toInsert = _a.toInsert;
            var itemIndex = arrays_1.firstIndex(this.items, function (item) { return item.group === group; });
            if (itemIndex < 0) {
                return;
            }
            var item = this.items[itemIndex];
            var visible = isGroupVisible(group);
            if (!item.visible && !visible) {
                return;
            }
            var absoluteStart = start;
            for (var i = 0; i < itemIndex; i++) {
                var item_2 = this.items[i];
                absoluteStart += (item_2.visible ? 1 : 0) + item_2.group.elements.length;
            }
            if (item.visible && !visible) {
                this.spliceable.splice(absoluteStart, 1 + deleteCount, toInsert);
            }
            else if (!item.visible && visible) {
                this.spliceable.splice(absoluteStart, deleteCount, [group].concat(toInsert));
            }
            else {
                this.spliceable.splice(absoluteStart + 1, deleteCount, toInsert);
            }
            item.visible = visible;
        };
        ResourceGroupSplicer.prototype.dispose = function () {
            this.onDidSpliceGroups({ start: 0, deleteCount: this.items.length, toInsert: [] });
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        return ResourceGroupSplicer;
    }());
    function convertValidationType(type) {
        switch (type) {
            case scm_2.InputValidationType.Information: return inputBox_1.MessageType.INFO;
            case scm_2.InputValidationType.Warning: return inputBox_1.MessageType.WARNING;
            case scm_2.InputValidationType.Error: return inputBox_1.MessageType.ERROR;
        }
    }
    var RepositoryPanel = /** @class */ (function (_super) {
        __extends(RepositoryPanel, _super);
        function RepositoryPanel(repository, viewModel, keybindingService, themeService, contextMenuService, contextViewService, commandService, messageService, editorService, editorGroupService, instantiationService, configurationService, contextKeyService, menuService) {
            var _this = _super.call(this, repository.provider.label, {}, keybindingService, contextMenuService, configurationService) || this;
            _this.repository = repository;
            _this.viewModel = viewModel;
            _this.keybindingService = keybindingService;
            _this.themeService = themeService;
            _this.contextMenuService = contextMenuService;
            _this.contextViewService = contextViewService;
            _this.commandService = commandService;
            _this.messageService = messageService;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.instantiationService = instantiationService;
            _this.configurationService = configurationService;
            _this.contextKeyService = contextKeyService;
            _this.menuService = menuService;
            _this.cachedHeight = undefined;
            _this.visibilityDisposables = [];
            _this.menus = instantiationService.createInstance(scmMenus_1.SCMMenus, repository.provider);
            return _this;
        }
        Object.defineProperty(RepositoryPanel.prototype, "onDidChangeTitle", {
            get: function () {
                return this.menus.onDidChangeTitle;
            },
            enumerable: true,
            configurable: true
        });
        RepositoryPanel.prototype.render = function (container) {
            _super.prototype.render.call(this, container);
            this.menus.onDidChangeTitle(this.updateActions, this, this.disposables);
        };
        RepositoryPanel.prototype.renderHeaderTitle = function (container) {
            var header = dom_1.append(container, dom_1.$('.title.scm-provider'));
            var name = dom_1.append(header, dom_1.$('.name'));
            var title = dom_1.append(name, dom_1.$('span.title'));
            var type = dom_1.append(name, dom_1.$('span.type'));
            if (this.repository.provider.rootUri) {
                title.textContent = paths_1.basename(this.repository.provider.rootUri.fsPath);
                type.textContent = this.repository.provider.label;
            }
            else {
                title.textContent = this.repository.provider.label;
                type.textContent = '';
            }
            var onContextMenu = event_1.mapEvent(event_2.stop(event_2.domEvent(container, 'contextmenu')), function (e) { return new mouseEvent_1.StandardMouseEvent(e); });
            onContextMenu(this.onContextMenu, this, this.disposables);
        };
        RepositoryPanel.prototype.onContextMenu = function (event) {
            var _this = this;
            if (this.viewModel.selectedRepositories.length <= 1) {
                return;
            }
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return ({ x: event.posx, y: event.posy }); },
                getActions: function () { return winjs_base_1.TPromise.as([{
                        id: "scm.hideRepository",
                        label: nls_1.localize('hideRepository', "Hide"),
                        enabled: true,
                        run: function () { return _this.viewModel.hide(_this.repository); }
                    }]); },
            });
        };
        RepositoryPanel.prototype.renderBody = function (container) {
            var _this = this;
            var focusTracker = dom_1.trackFocus(container);
            this.disposables.push(focusTracker.onDidFocus(function () { return _this.repository.focus(); }));
            this.disposables.push(focusTracker);
            // Input
            this.inputBoxContainer = dom_1.append(container, dom_1.$('.scm-editor'));
            var updatePlaceholder = function () {
                var placeholder = strings_1.format(_this.repository.input.placeholder, platform.isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter');
                _this.inputBox.setPlaceHolder(placeholder);
            };
            var validationDelayer = new async_1.ThrottledDelayer(200);
            var validate = function () {
                validationDelayer.trigger(function () { return __awaiter(_this, void 0, winjs_base_1.TPromise, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.repository.input.validateInput(this.inputBox.value, this.inputBox.inputElement.selectionStart)];
                            case 1:
                                result = _a.sent();
                                if (!result) {
                                    this.inputBox.inputElement.removeAttribute('aria-invalid');
                                    this.inputBox.hideMessage();
                                }
                                else {
                                    this.inputBox.inputElement.setAttribute('aria-invalid', 'true');
                                    this.inputBox.showMessage({ content: result.message, type: convertValidationType(result.type) });
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
            };
            this.inputBox = new inputBox_1.InputBox(this.inputBoxContainer, this.contextViewService, { flexibleHeight: true });
            this.disposables.push(styler_1.attachInputBoxStyler(this.inputBox, this.themeService));
            this.disposables.push(this.inputBox);
            this.inputBox.onDidChange(validate, null, this.disposables);
            var onKeyUp = event_2.domEvent(this.inputBox.inputElement, 'keyup');
            var onMouseUp = event_2.domEvent(this.inputBox.inputElement, 'mouseup');
            event_1.anyEvent(onKeyUp, onMouseUp)(function () { return validate(); }, null, this.disposables);
            this.inputBox.value = this.repository.input.value;
            this.inputBox.onDidChange(function (value) { return _this.repository.input.value = value; }, null, this.disposables);
            this.repository.input.onDidChange(function (value) { return _this.inputBox.value = value; }, null, this.disposables);
            updatePlaceholder();
            this.repository.input.onDidChangePlaceholder(updatePlaceholder, null, this.disposables);
            this.disposables.push(this.inputBox.onDidHeightChange(function () { return _this.layoutBody(); }));
            event_1.chain(event_2.domEvent(this.inputBox.inputElement, 'keydown'))
                .map(function (e) { return new keyboardEvent_1.StandardKeyboardEvent(e); })
                .filter(function (e) { return e.equals(2048 /* CtrlCmd */ | 3 /* Enter */) || e.equals(2048 /* CtrlCmd */ | 49 /* KEY_S */); })
                .on(this.onDidAcceptInput, this, this.disposables);
            if (this.repository.provider.onDidChangeCommitTemplate) {
                this.repository.provider.onDidChangeCommitTemplate(this.updateInputBox, this, this.disposables);
            }
            this.updateInputBox();
            // List
            this.listContainer = dom_1.append(container, dom_1.$('.scm-status.show-file-icons'));
            var delegate = new ProviderListDelegate();
            var actionItemProvider = function (action) { return _this.getActionItem(action); };
            var renderers = [
                new ResourceGroupRenderer(actionItemProvider, this.themeService, this.contextKeyService, this.contextMenuService, this.menuService),
                new ResourceRenderer(actionItemProvider, function () { return _this.getSelectedResources(); }, this.themeService, this.instantiationService, this.contextKeyService, this.contextMenuService, this.menuService)
            ];
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchList, this.listContainer, delegate, renderers, {
                identityProvider: scmResourceIdentityProvider
            });
            event_1.chain(this.list.onOpen)
                .map(function (e) { return e.elements[0]; })
                .filter(function (e) { return !!e && scmUtil_1.isSCMResource(e); })
                .on(this.open, this, this.disposables);
            event_1.chain(this.list.onPin)
                .map(function (e) { return e.elements[0]; })
                .filter(function (e) { return !!e && scmUtil_1.isSCMResource(e); })
                .on(this.pin, this, this.disposables);
            this.list.onContextMenu(this.onListContextMenu, this, this.disposables);
            this.disposables.push(this.list);
            this.viewModel.onDidChangeVisibility(this.onDidChangeVisibility, this, this.disposables);
            this.onDidChangeVisibility(this.viewModel.isVisible());
        };
        RepositoryPanel.prototype.onDidChangeVisibility = function (visible) {
            if (visible) {
                var listSplicer = new ResourceGroupSplicer(this.repository.provider.groups, this.list);
                this.visibilityDisposables.push(listSplicer);
            }
            else {
                this.visibilityDisposables = lifecycle_1.dispose(this.visibilityDisposables);
            }
        };
        RepositoryPanel.prototype.layoutBody = function (height) {
            if (height === void 0) { height = this.cachedHeight; }
            if (height === undefined) {
                return;
            }
            this.cachedHeight = height;
            this.inputBox.layout();
            var editorHeight = this.inputBox.height;
            var listHeight = height - (editorHeight + 12 /* margin */);
            this.listContainer.style.height = listHeight + "px";
            this.list.layout(listHeight);
            dom_1.toggleClass(this.inputBoxContainer, 'scroll', editorHeight >= 134);
        };
        RepositoryPanel.prototype.focus = function () {
            _super.prototype.focus.call(this);
            if (this.isExpanded()) {
                this.inputBox.focus();
            }
        };
        RepositoryPanel.prototype.getActions = function () {
            return this.menus.getTitleActions();
        };
        RepositoryPanel.prototype.getSecondaryActions = function () {
            return this.menus.getTitleSecondaryActions();
        };
        RepositoryPanel.prototype.getActionItem = function (action) {
            if (!(action instanceof actions_1.MenuItemAction)) {
                return undefined;
            }
            return new menuItemActionItem_1.ContextAwareMenuItemActionItem(action, this.keybindingService, this.messageService, this.contextMenuService);
        };
        RepositoryPanel.prototype.getActionsContext = function () {
            return this.repository.provider;
        };
        RepositoryPanel.prototype.open = function (e) {
            e.open().done(undefined, errors_1.onUnexpectedError);
        };
        RepositoryPanel.prototype.pin = function () {
            var activeEditor = this.editorService.getActiveEditor();
            var activeEditorInput = this.editorService.getActiveEditorInput();
            if (!activeEditor) {
                return;
            }
            this.editorGroupService.pinEditor(activeEditor.position, activeEditorInput);
            activeEditor.focus();
        };
        RepositoryPanel.prototype.onListContextMenu = function (e) {
            var _this = this;
            var element = e.element;
            var actions;
            if (scmUtil_1.isSCMResource(element)) {
                actions = this.menus.getResourceContextActions(element);
            }
            else {
                actions = this.menus.getResourceGroupContextActions(element);
            }
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return e.anchor; },
                getActions: function () { return winjs_base_1.TPromise.as(actions); },
                getActionsContext: function () { return element; },
                actionRunner: new MultipleSelectionActionRunner(function () { return _this.getSelectedResources(); })
            });
        };
        RepositoryPanel.prototype.getSelectedResources = function () {
            return this.list.getSelectedElements()
                .filter(function (r) { return scmUtil_1.isSCMResource(r); });
        };
        RepositoryPanel.prototype.updateInputBox = function () {
            if (typeof this.repository.provider.commitTemplate === 'undefined') {
                return;
            }
            this.inputBox.value = this.repository.provider.commitTemplate;
        };
        RepositoryPanel.prototype.onDidAcceptInput = function () {
            if (!this.repository.provider.acceptInputCommand) {
                return;
            }
            var id = this.repository.provider.acceptInputCommand.id;
            var args = this.repository.provider.acceptInputCommand.arguments;
            (_a = this.commandService).executeCommand.apply(_a, [id].concat(args)).done(undefined, errors_1.onUnexpectedError);
            var _a;
        };
        RepositoryPanel.prototype.dispose = function () {
            this.visibilityDisposables = lifecycle_1.dispose(this.visibilityDisposables);
            _super.prototype.dispose.call(this);
        };
        RepositoryPanel = __decorate([
            __param(2, keybinding_1.IKeybindingService),
            __param(3, themeService_1.IThemeService),
            __param(4, contextView_1.IContextMenuService),
            __param(5, contextView_1.IContextViewService),
            __param(6, commands_1.ICommandService),
            __param(7, message_1.IMessageService),
            __param(8, editorService_1.IWorkbenchEditorService),
            __param(9, groupService_1.IEditorGroupService),
            __param(10, instantiation_1.IInstantiationService),
            __param(11, configuration_1.IConfigurationService),
            __param(12, contextkey_1.IContextKeyService),
            __param(13, actions_1.IMenuService)
        ], RepositoryPanel);
        return RepositoryPanel;
    }(panelViewlet_1.ViewletPanel));
    exports.RepositoryPanel = RepositoryPanel;
    var InstallAdditionalSCMProvidersAction = /** @class */ (function (_super) {
        __extends(InstallAdditionalSCMProvidersAction, _super);
        function InstallAdditionalSCMProvidersAction(viewletService) {
            var _this = _super.call(this, 'scm.installAdditionalSCMProviders', nls_1.localize('installAdditionalSCMProviders', "Install Additional SCM Providers..."), '', true) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        InstallAdditionalSCMProvidersAction.prototype.run = function () {
            return this.viewletService.openViewlet(extensions_2.VIEWLET_ID, true).then(function (viewlet) { return viewlet; })
                .then(function (viewlet) {
                viewlet.search('category:"SCM Providers" @sort:installs');
                viewlet.focus();
            });
        };
        InstallAdditionalSCMProvidersAction = __decorate([
            __param(0, viewlet_1.IViewletService)
        ], InstallAdditionalSCMProvidersAction);
        return InstallAdditionalSCMProvidersAction;
    }(actions_2.Action));
    var SCMViewlet = /** @class */ (function (_super) {
        __extends(SCMViewlet, _super);
        function SCMViewlet(telemetryService, scmService, instantiationService, contextViewService, contextKeyService, keybindingService, messageService, contextMenuService, themeService, commandService, editorGroupService, editorService, contextService, storageService, extensionService, configurationService) {
            var _this = _super.call(this, scm_1.VIEWLET_ID, { showHeaderInTitleWhenSingleView: true }, telemetryService, themeService) || this;
            _this.scmService = scmService;
            _this.instantiationService = instantiationService;
            _this.contextViewService = contextViewService;
            _this.keybindingService = keybindingService;
            _this.messageService = messageService;
            _this.contextMenuService = contextMenuService;
            _this.themeService = themeService;
            _this.commandService = commandService;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            _this.configurationService = configurationService;
            _this.mainPanel = null;
            _this.mainPanelDisposable = lifecycle_1.empty;
            _this._repositories = [];
            _this.repositoryPanels = [];
            _this.singleRepositoryPanelTitleActionsDisposable = lifecycle_1.empty;
            _this.disposables = [];
            _this._onDidSplice = new event_1.Emitter();
            _this.onDidSplice = _this._onDidSplice.event;
            _this._onDidChangeVisibility = new event_1.Emitter();
            _this.onDidChangeVisibility = _this._onDidChangeVisibility.event;
            _this._height = undefined;
            _this.menus = instantiationService.createInstance(scmMenus_1.SCMMenus, undefined);
            _this.menus.onDidChangeTitle(_this.updateTitleArea, _this, _this.disposables);
            return _this;
        }
        Object.defineProperty(SCMViewlet.prototype, "height", {
            get: function () { return this._height; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCMViewlet.prototype, "repositories", {
            get: function () { return this._repositories; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCMViewlet.prototype, "selectedRepositories", {
            get: function () { return this.repositoryPanels.map(function (p) { return p.repository; }); },
            enumerable: true,
            configurable: true
        });
        SCMViewlet.prototype.create = function (parent) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _this = this;
                var onDidUpdateConfiguration;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, _super.prototype.create.call(this, parent)];
                        case 1:
                            _a.sent();
                            this.el = parent.getHTMLElement();
                            dom_1.addClass(this.el, 'scm-viewlet');
                            dom_1.addClass(this.el, 'empty');
                            dom_1.append(parent.getHTMLElement(), dom_1.$('div.empty-message', null, nls_1.localize('no open repo', "There are no active source control providers.")));
                            this.scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
                            this.scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
                            this.scmService.repositories.forEach(function (r) { return _this.onDidAddRepository(r); });
                            onDidUpdateConfiguration = event_1.filterEvent(this.configurationService.onDidChangeConfiguration, function (e) { return e.affectsConfiguration('scm.alwaysShowProviders'); });
                            onDidUpdateConfiguration(this.onDidChangeRepositories, this, this.disposables);
                            this.onDidChangeRepositories();
                            return [2 /*return*/];
                    }
                });
            });
        };
        SCMViewlet.prototype.onDidAddRepository = function (repository) {
            var index = this._repositories.length;
            this._repositories.push(repository);
            this._onDidSplice.fire({ index: index, deleteCount: 0, elements: [repository] });
            this.onDidChangeRepositories();
            if (!this.mainPanel) {
                this.onSelectionChange(this.repositories);
            }
        };
        SCMViewlet.prototype.onDidRemoveRepository = function (repository) {
            var index = this._repositories.indexOf(repository);
            if (index === -1) {
                return;
            }
            this._repositories.splice(index, 1);
            this._onDidSplice.fire({ index: index, deleteCount: 1, elements: [] });
            this.onDidChangeRepositories();
            if (!this.mainPanel) {
                this.onSelectionChange(this.repositories);
            }
        };
        SCMViewlet.prototype.onDidChangeRepositories = function () {
            var _this = this;
            dom_1.toggleClass(this.el, 'empty', this.scmService.repositories.length === 0);
            var shouldMainPanelAlwaysBeVisible = this.configurationService.getValue('scm.alwaysShowProviders');
            var shouldMainPanelBeVisible = shouldMainPanelAlwaysBeVisible || this.scmService.repositories.length > 1;
            if (!!this.mainPanel === shouldMainPanelBeVisible) {
                return;
            }
            if (shouldMainPanelBeVisible) {
                this.mainPanel = this.instantiationService.createInstance(MainPanel, this);
                this.addPanel(this.mainPanel, this.mainPanel.minimumSize, 0);
                var selectionChangeDisposable_1 = this.mainPanel.onSelectionChange(this.onSelectionChange, this);
                this.onSelectionChange(this.mainPanel.getSelection());
                this.mainPanelDisposable = lifecycle_1.toDisposable(function () {
                    _this.removePanel(_this.mainPanel);
                    selectionChangeDisposable_1.dispose();
                    _this.mainPanel.dispose();
                });
            }
            else {
                this.mainPanelDisposable.dispose();
                this.mainPanelDisposable = lifecycle_1.empty;
                this.mainPanel = null;
            }
        };
        SCMViewlet.prototype.setVisible = function (visible) {
            var result = _super.prototype.setVisible.call(this, visible);
            if (!visible) {
                this.cachedMainPanelHeight = this.getPanelSize(this.mainPanel);
            }
            this._onDidChangeVisibility.fire(visible);
            return result;
        };
        SCMViewlet.prototype.getOptimalWidth = function () {
            return 400;
        };
        SCMViewlet.prototype.getTitle = function () {
            var title = nls_1.localize('source control', "Source Control");
            if (this.repositories.length === 1) {
                var repository = this.repositories[0];
                return nls_1.localize('viewletTitle', "{0}: {1}", title, repository.provider.label);
            }
            else {
                return title;
            }
        };
        SCMViewlet.prototype.getActions = function () {
            if (this.isSingleView()) {
                var panel = this.repositoryPanels[0];
                return panel.getActions();
            }
            return this.menus.getTitleActions();
        };
        SCMViewlet.prototype.getSecondaryActions = function () {
            var result;
            if (this.isSingleView()) {
                var panel = this.repositoryPanels[0];
                result = panel.getSecondaryActions().concat([
                    new actionbar_1.Separator()
                ]);
            }
            else {
                result = this.menus.getTitleSecondaryActions();
                if (result.length > 0) {
                    result.push(new actionbar_1.Separator());
                }
            }
            result.push(this.instantiationService.createInstance(InstallAdditionalSCMProvidersAction));
            return result;
        };
        SCMViewlet.prototype.getActionItem = function (action) {
            if (!(action instanceof actions_1.MenuItemAction)) {
                return undefined;
            }
            return new menuItemActionItem_1.ContextAwareMenuItemActionItem(action, this.keybindingService, this.messageService, this.contextMenuService);
        };
        SCMViewlet.prototype.layout = function (dimension) {
            _super.prototype.layout.call(this, dimension);
            this._height = dimension.height;
        };
        SCMViewlet.prototype.onSelectionChange = function (repositories) {
            var _this = this;
            var wasSingleView = this.isSingleView();
            // Collect unselected panels
            var panelsToRemove = this.repositoryPanels
                .filter(function (p) { return repositories.every(function (r) { return p.repository !== r; }); });
            // Collect panels still selected
            var repositoryPanels = this.repositoryPanels
                .filter(function (p) { return repositories.some(function (r) { return p.repository === r; }); });
            // Collect new selected panels
            var newRepositoryPanels = repositories
                .filter(function (r) { return _this.repositoryPanels.every(function (p) { return p.repository !== r; }); })
                .map(function (r) { return _this.instantiationService.createInstance(RepositoryPanel, r, _this); });
            // Add new selected panels
            this.repositoryPanels = repositoryPanels.concat(newRepositoryPanels);
            newRepositoryPanels.forEach(function (panel) {
                _this.addPanel(panel, panel.minimumSize, _this.length);
                panel.repository.focus();
            });
            // Remove unselected panels
            panelsToRemove.forEach(function (panel) { return _this.removePanel(panel); });
            // Restore main panel height
            if (this.isVisible() && typeof this.cachedMainPanelHeight === 'number') {
                this.resizePanel(this.mainPanel, this.cachedMainPanelHeight);
                this.cachedMainPanelHeight = undefined;
            }
            // Resize all panels equally
            var height = typeof this.height === 'number' ? this.height : 1000;
            var mainPanelHeight = this.getPanelSize(this.mainPanel);
            var size = (height - mainPanelHeight) / repositories.length;
            for (var _i = 0, _a = this.repositoryPanels; _i < _a.length; _i++) {
                var panel = _a[_i];
                this.resizePanel(panel, size);
            }
            // React to menu changes for single view mode
            if (wasSingleView !== this.isSingleView()) {
                this.singleRepositoryPanelTitleActionsDisposable.dispose();
                if (this.isSingleView()) {
                    this.singleRepositoryPanelTitleActionsDisposable = this.repositoryPanels[0].onDidChangeTitle(this.updateTitleArea, this);
                }
                this.updateTitleArea();
            }
        };
        SCMViewlet.prototype.isSingleView = function () {
            return _super.prototype.isSingleView.call(this) && this.repositoryPanels.length === 1;
        };
        SCMViewlet.prototype.hide = function (repository) {
            if (!this.mainPanel) {
                return;
            }
            this.mainPanel.hide(repository);
        };
        SCMViewlet.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            this.mainPanelDisposable.dispose();
            _super.prototype.dispose.call(this);
        };
        SCMViewlet = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, scm_2.ISCMService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, contextView_1.IContextViewService),
            __param(4, contextkey_1.IContextKeyService),
            __param(5, keybinding_1.IKeybindingService),
            __param(6, message_1.IMessageService),
            __param(7, contextView_1.IContextMenuService),
            __param(8, themeService_1.IThemeService),
            __param(9, commands_1.ICommandService),
            __param(10, groupService_1.IEditorGroupService),
            __param(11, editorService_1.IWorkbenchEditorService),
            __param(12, workspace_1.IWorkspaceContextService),
            __param(13, storage_1.IStorageService),
            __param(14, extensions_1.IExtensionService),
            __param(15, configuration_1.IConfigurationService)
        ], SCMViewlet);
        return SCMViewlet;
    }(panelViewlet_1.PanelViewlet));
    exports.SCMViewlet = SCMViewlet;
});
