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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/base/common/event", "vs/base/browser/event", "vs/workbench/parts/extensions/common/extensions", "vs/workbench/parts/extensions/browser/extensionsActions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/parts/extensions/browser/extensionsWidgets", "vs/platform/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/theme/common/themeService"], function (require, exports, dom_1, lifecycle_1, actionbar_1, instantiation_1, message_1, event_1, event_2, extensions_1, extensionsActions_1, extensionManagementUtil_1, extensionsWidgets_1, extensions_2, extensionManagement_1, themeService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Delegate = /** @class */ (function () {
        function Delegate() {
        }
        Delegate.prototype.getHeight = function () { return 62; };
        Delegate.prototype.getTemplateId = function () { return 'extension'; };
        return Delegate;
    }());
    exports.Delegate = Delegate;
    var actionOptions = { icon: true, label: true };
    var Renderer = /** @class */ (function () {
        function Renderer(instantiationService, messageService, extensionsWorkbenchService, extensionService, extensionTipsService, themeService) {
            this.instantiationService = instantiationService;
            this.messageService = messageService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionService = extensionService;
            this.extensionTipsService = extensionTipsService;
            this.themeService = themeService;
        }
        Object.defineProperty(Renderer.prototype, "templateId", {
            get: function () { return 'extension'; },
            enumerable: true,
            configurable: true
        });
        Renderer.prototype.renderTemplate = function (root) {
            var _this = this;
            var bookmark = dom_1.append(root, dom_1.$('span.bookmark'));
            dom_1.append(bookmark, dom_1.$('span.octicon.octicon-star'));
            var applyBookmarkStyle = function (theme) {
                var bgColor = theme.getColor(extensionsActions_1.extensionButtonProminentBackground);
                var fgColor = theme.getColor(extensionsActions_1.extensionButtonProminentForeground);
                bookmark.style.borderTopColor = bgColor ? bgColor.toString() : 'transparent';
                bookmark.style.color = fgColor ? fgColor.toString() : 'white';
            };
            applyBookmarkStyle(this.themeService.getTheme());
            var bookmarkStyler = this.themeService.onThemeChange(applyBookmarkStyle.bind(this));
            var element = dom_1.append(root, dom_1.$('.extension'));
            var icon = dom_1.append(element, dom_1.$('img.icon'));
            var details = dom_1.append(element, dom_1.$('.details'));
            var headerContainer = dom_1.append(details, dom_1.$('.header-container'));
            var header = dom_1.append(headerContainer, dom_1.$('.header'));
            var name = dom_1.append(header, dom_1.$('span.name'));
            var version = dom_1.append(header, dom_1.$('span.version'));
            var installCount = dom_1.append(header, dom_1.$('span.install-count'));
            var ratings = dom_1.append(header, dom_1.$('span.ratings'));
            var description = dom_1.append(details, dom_1.$('.description.ellipsis'));
            var footer = dom_1.append(details, dom_1.$('.footer'));
            var author = dom_1.append(footer, dom_1.$('.author.ellipsis'));
            var actionbar = new actionbar_1.ActionBar(footer, {
                animated: false,
                actionItemProvider: function (action) {
                    if (action.id === extensionsActions_1.ManageExtensionAction.ID) {
                        return action.actionItem;
                    }
                    return null;
                }
            });
            actionbar.onDidRun(function (_a) {
                var error = _a.error;
                return error && _this.messageService.show(message_1.Severity.Error, error);
            });
            var versionWidget = this.instantiationService.createInstance(extensionsWidgets_1.Label, version, function (e) { return e.version; });
            var installCountWidget = this.instantiationService.createInstance(extensionsWidgets_1.InstallCountWidget, installCount, { small: true });
            var ratingsWidget = this.instantiationService.createInstance(extensionsWidgets_1.RatingsWidget, ratings, { small: true });
            var builtinStatusAction = this.instantiationService.createInstance(extensionsActions_1.BuiltinStatusLabelAction);
            var maliciousStatusAction = this.instantiationService.createInstance(extensionsActions_1.MaliciousStatusLabelAction, false);
            var installAction = this.instantiationService.createInstance(extensionsActions_1.InstallAction);
            var updateAction = this.instantiationService.createInstance(extensionsActions_1.UpdateAction);
            var reloadAction = this.instantiationService.createInstance(extensionsActions_1.ReloadAction);
            var manageAction = this.instantiationService.createInstance(extensionsActions_1.ManageExtensionAction);
            actionbar.push([reloadAction, updateAction, installAction, builtinStatusAction, maliciousStatusAction, manageAction], actionOptions);
            var disposables = [versionWidget, installCountWidget, ratingsWidget, builtinStatusAction, maliciousStatusAction, updateAction, reloadAction, manageAction, actionbar, bookmarkStyler];
            return {
                root: root, element: element, icon: icon, name: name, installCount: installCount, ratings: ratings, author: author, description: description, disposables: disposables,
                extensionDisposables: [],
                set extension(extension) {
                    versionWidget.extension = extension;
                    installCountWidget.extension = extension;
                    ratingsWidget.extension = extension;
                    builtinStatusAction.extension = extension;
                    maliciousStatusAction.extension = extension;
                    installAction.extension = extension;
                    updateAction.extension = extension;
                    reloadAction.extension = extension;
                    manageAction.extension = extension;
                }
            };
        };
        Renderer.prototype.renderPlaceholder = function (index, data) {
            dom_1.addClass(data.element, 'loading');
            data.root.removeAttribute('aria-label');
            data.extensionDisposables = lifecycle_1.dispose(data.extensionDisposables);
            data.icon.src = '';
            data.name.textContent = '';
            data.author.textContent = '';
            data.description.textContent = '';
            data.installCount.style.display = 'none';
            data.ratings.style.display = 'none';
            data.extension = null;
        };
        Renderer.prototype.renderElement = function (extension, index, data) {
            dom_1.removeClass(data.element, 'loading');
            data.extensionDisposables = lifecycle_1.dispose(data.extensionDisposables);
            var isInstalled = this.extensionsWorkbenchService.local.some(function (e) { return e.id === extension.id; });
            this.extensionService.getExtensions().then(function (enabledExtensions) {
                var isExtensionRunning = enabledExtensions.some(function (e) { return extensionManagementUtil_1.areSameExtensions(e, extension); });
                dom_1.toggleClass(data.element, 'disabled', isInstalled && !isExtensionRunning);
            });
            var onError = event_1.once(event_2.domEvent(data.icon, 'error'));
            onError(function () { return data.icon.src = extension.iconUrlFallback; }, null, data.extensionDisposables);
            data.icon.src = extension.iconUrl;
            if (!data.icon.complete) {
                data.icon.style.visibility = 'hidden';
                data.icon.onload = function () { return data.icon.style.visibility = 'inherit'; };
            }
            else {
                data.icon.style.visibility = 'inherit';
            }
            data.root.setAttribute('aria-label', extension.displayName);
            dom_1.removeClass(data.root, 'recommended');
            var extRecommendations = this.extensionTipsService.getAllRecommendationsWithReason();
            if (extRecommendations[extension.id.toLowerCase()]) {
                data.root.setAttribute('aria-label', extension.displayName + '. ' + extRecommendations[extension.id]);
                dom_1.addClass(data.root, 'recommended');
                data.root.title = extRecommendations[extension.id.toLowerCase()].reasonText;
            }
            data.name.textContent = extension.displayName;
            data.author.textContent = extension.publisherDisplayName;
            data.description.textContent = extension.description;
            data.installCount.style.display = '';
            data.ratings.style.display = '';
            data.extension = extension;
        };
        Renderer.prototype.disposeTemplate = function (data) {
            data.disposables = lifecycle_1.dispose(data.disposables);
        };
        Renderer = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, message_1.IMessageService),
            __param(2, extensions_1.IExtensionsWorkbenchService),
            __param(3, extensions_2.IExtensionService),
            __param(4, extensionManagement_1.IExtensionTipsService),
            __param(5, themeService_1.IThemeService)
        ], Renderer);
        return Renderer;
    }());
    exports.Renderer = Renderer;
});
