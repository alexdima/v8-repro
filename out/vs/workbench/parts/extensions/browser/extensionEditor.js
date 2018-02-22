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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/marked/marked", "vs/base/common/async", "vs/base/common/arrays", "vs/base/common/platform", "vs/base/common/event", "vs/base/common/cache", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/base/browser/event", "vs/base/browser/dom", "vs/workbench/browser/parts/editor/baseEditor", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/parts/extensions/common/extensions", "vs/workbench/parts/extensions/browser/dependenciesViewer", "vs/workbench/parts/extensions/browser/extensionsWidgets", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/parts/extensions/browser/extensionsActions", "vs/workbench/parts/html/browser/webview", "vs/workbench/services/keybinding/common/keybindingIO", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/platform/message/common/message", "vs/platform/opener/common/opener", "vs/workbench/services/part/common/partService", "vs/platform/theme/common/themeService", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/editorExtensions", "vs/workbench/services/editor/common/editorService", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/color", "vs/platform/list/browser/listService", "vs/platform/environment/common/environment", "vs/base/common/objects", "vs/platform/workspace/common/workspace", "vs/css!./media/extensionEditor"], function (require, exports, nls_1, winjs_base_1, marked_1, async_1, arrays, platform_1, event_1, cache_1, actions_1, errors_1, severity_1, lifecycle_1, event_2, dom_1, baseEditor_1, viewlet_1, telemetry_1, instantiation_1, extensionManagement_1, extensions_1, dependenciesViewer_1, extensionsWidgets_1, actionbar_1, extensionsActions_1, webview_1, keybindingIO_1, keybinding_1, scrollableElement_1, message_1, opener_1, partService_1, themeService_1, keybindingLabel_1, contextView_1, contextkey_1, editorExtensions_1, editorService_1, keybindingsRegistry_1, color_1, listService_1, environment_1, objects_1, workspace_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**  A context key that is set when an extension editor webview has focus. */
    exports.KEYBINDING_CONTEXT_EXTENSIONEDITOR_WEBVIEW_FOCUS = new contextkey_1.RawContextKey('extensionEditorWebviewFocus', undefined);
    /**  A context key that is set when the find widget find input in extension editor webview is focused. */
    exports.KEYBINDING_CONTEXT_EXTENSIONEDITOR_FIND_WIDGET_INPUT_FOCUSED = new contextkey_1.RawContextKey('extensionEditorFindWidgetInputFocused', false);
    function renderBody(body) {
        var styleSheetPath = require.toUrl('./media/markdown.css').replace('file://', 'vscode-core-resource://');
        return "<!DOCTYPE html>\n\t\t<html>\n\t\t\t<head>\n\t\t\t\t<meta http-equiv=\"Content-type\" content=\"text/html;charset=UTF-8\">\n\t\t\t\t<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src vscode-core-resource:; child-src 'none'; frame-src 'none';\">\n\t\t\t\t<link rel=\"stylesheet\" type=\"text/css\" href=\"" + styleSheetPath + "\">\n\t\t\t</head>\n\t\t\t<body>\n\t\t\t\t<a id=\"scroll-to-top\" role=\"button\" aria-label=\"scroll to top\" href=\"#\"><span class=\"icon\"></span></a>\n\t\t\t\t" + body + "\n\t\t\t</body>\n\t\t</html>";
    }
    function removeEmbeddedSVGs(documentContent) {
        var newDocument = new DOMParser().parseFromString(documentContent, 'text/html');
        // remove all inline svgs
        var allSVGs = newDocument.documentElement.querySelectorAll('svg');
        for (var i = 0; i < allSVGs.length; i++) {
            allSVGs[i].parentNode.removeChild(allSVGs[i]);
        }
        return newDocument.documentElement.outerHTML;
    }
    var NavBar = /** @class */ (function () {
        function NavBar(container) {
            this._onChange = new event_1.Emitter();
            this.currentId = null;
            var element = dom_1.append(container, dom_1.$('.navbar'));
            this.actions = [];
            this.actionbar = new actionbar_1.ActionBar(element, { animated: false });
        }
        Object.defineProperty(NavBar.prototype, "onChange", {
            get: function () { return this._onChange.event; },
            enumerable: true,
            configurable: true
        });
        NavBar.prototype.push = function (id, label) {
            var _this = this;
            var run = function () { return _this._update(id); };
            var action = new actions_1.Action(id, label, null, true, run);
            this.actions.push(action);
            this.actionbar.push(action);
            if (this.actions.length === 1) {
                run();
            }
        };
        NavBar.prototype.clear = function () {
            this.actions = lifecycle_1.dispose(this.actions);
            this.actionbar.clear();
        };
        NavBar.prototype.update = function () {
            this._update(this.currentId);
        };
        NavBar.prototype._update = function (id) {
            if (id === void 0) { id = this.currentId; }
            this.currentId = id;
            this._onChange.fire(id);
            this.actions.forEach(function (a) { return a.enabled = a.id !== id; });
            return winjs_base_1.TPromise.as(null);
        };
        NavBar.prototype.dispose = function () {
            this.actionbar = lifecycle_1.dispose(this.actionbar);
        };
        return NavBar;
    }());
    var NavbarSection = {
        Readme: 'readme',
        Contributions: 'contributions',
        Changelog: 'changelog',
        Dependencies: 'dependencies'
    };
    var ExtensionEditor = /** @class */ (function (_super) {
        __extends(ExtensionEditor, _super);
        function ExtensionEditor(telemetryService, instantiationService, viewletService, extensionsWorkbenchService, themeService, keybindingService, messageService, openerService, partService, contextViewService, contextKeyService, extensionTipsService, environmentService, contextService) {
            var _this = _super.call(this, ExtensionEditor.ID, telemetryService, themeService) || this;
            _this.instantiationService = instantiationService;
            _this.viewletService = viewletService;
            _this.extensionsWorkbenchService = extensionsWorkbenchService;
            _this.themeService = themeService;
            _this.keybindingService = keybindingService;
            _this.messageService = messageService;
            _this.openerService = openerService;
            _this.partService = partService;
            _this.contextViewService = contextViewService;
            _this.contextKeyService = contextKeyService;
            _this.extensionTipsService = extensionTipsService;
            _this.environmentService = environmentService;
            _this.contextService = contextService;
            _this.layoutParticipants = [];
            _this.contentDisposables = [];
            _this.transientDisposables = [];
            _this.disposables = [];
            _this.extensionReadme = null;
            _this.extensionChangelog = null;
            _this.extensionManifest = null;
            _this.extensionDependencies = null;
            _this.contextKey = exports.KEYBINDING_CONTEXT_EXTENSIONEDITOR_WEBVIEW_FOCUS.bindTo(_this.contextKeyService);
            _this.findInputFocusContextKey = exports.KEYBINDING_CONTEXT_EXTENSIONEDITOR_FIND_WIDGET_INPUT_FOCUSED.bindTo(_this.contextKeyService);
            return _this;
        }
        ExtensionEditor.prototype.createEditor = function (parent) {
            var container = parent.getHTMLElement();
            var root = dom_1.append(container, dom_1.$('.extension-editor'));
            this.header = dom_1.append(root, dom_1.$('.header'));
            this.icon = dom_1.append(this.header, dom_1.$('img.icon', { draggable: false }));
            var details = dom_1.append(this.header, dom_1.$('.details'));
            var title = dom_1.append(details, dom_1.$('.title'));
            this.name = dom_1.append(title, dom_1.$('span.name.clickable', { title: nls_1.localize('name', "Extension name") }));
            this.identifier = dom_1.append(title, dom_1.$('span.identifier', { title: nls_1.localize('extension id', "Extension identifier") }));
            this.preview = dom_1.append(title, dom_1.$('span.preview', { title: nls_1.localize('preview', "Preview") }));
            var subtitle = dom_1.append(details, dom_1.$('.subtitle'));
            this.publisher = dom_1.append(subtitle, dom_1.$('span.publisher.clickable', { title: nls_1.localize('publisher', "Publisher name") }));
            this.installCount = dom_1.append(subtitle, dom_1.$('span.install', { title: nls_1.localize('install count', "Install count") }));
            this.rating = dom_1.append(subtitle, dom_1.$('span.rating.clickable', { title: nls_1.localize('rating', "Rating") }));
            this.repository = dom_1.append(subtitle, dom_1.$('span.repository.clickable'));
            this.repository.textContent = nls_1.localize('repository', 'Repository');
            this.repository.style.display = 'none';
            this.license = dom_1.append(subtitle, dom_1.$('span.license.clickable'));
            this.license.textContent = nls_1.localize('license', 'License');
            this.license.style.display = 'none';
            this.description = dom_1.append(details, dom_1.$('.description'));
            var extensionActions = dom_1.append(details, dom_1.$('.actions'));
            this.extensionActionBar = new actionbar_1.ActionBar(extensionActions, {
                animated: false,
                actionItemProvider: function (action) {
                    if (action.id === extensionsActions_1.EnableAction.ID) {
                        return action.actionItem;
                    }
                    if (action.id === extensionsActions_1.DisableAction.ID) {
                        return action.actionItem;
                    }
                    return null;
                }
            });
            this.disposables.push(this.extensionActionBar);
            this.recommendation = dom_1.append(details, dom_1.$('.recommendation'));
            event_1.chain(this.extensionActionBar.onDidRun)
                .map(function (_a) {
                var error = _a.error;
                return error;
            })
                .filter(function (error) { return !!error; })
                .on(this.onError, this, this.disposables);
            var body = dom_1.append(root, dom_1.$('.body'));
            this.navbar = new NavBar(body);
            this.content = dom_1.append(body, dom_1.$('.content'));
        };
        ExtensionEditor.prototype.setInput = function (input, options) {
            var _this = this;
            var extension = input.extension;
            this.transientDisposables = lifecycle_1.dispose(this.transientDisposables);
            this.extensionReadme = new cache_1.default(function () { return extension.getReadme(); });
            this.extensionChangelog = new cache_1.default(function () { return extension.getChangelog(); });
            this.extensionManifest = new cache_1.default(function () { return extension.getManifest(); });
            this.extensionDependencies = new cache_1.default(function () { return _this.extensionsWorkbenchService.loadDependencies(extension); });
            var onError = event_1.once(event_2.domEvent(this.icon, 'error'));
            onError(function () { return _this.icon.src = extension.iconUrlFallback; }, null, this.transientDisposables);
            this.icon.src = extension.iconUrl;
            this.name.textContent = extension.displayName;
            this.identifier.textContent = extension.id;
            if (extension.preview) {
                this.preview.textContent = nls_1.localize('preview', "Preview");
            }
            else {
                this.preview.textContent = null;
            }
            this.publisher.textContent = extension.publisherDisplayName;
            this.description.textContent = extension.description;
            var extRecommendations = this.extensionTipsService.getAllRecommendationsWithReason();
            var recommendationsData = {};
            if (extRecommendations[extension.id.toLowerCase()]) {
                dom_1.addClass(this.header, 'recommended');
                this.recommendation.textContent = extRecommendations[extension.id.toLowerCase()].reasonText;
                recommendationsData = { recommendationReason: extRecommendations[extension.id.toLowerCase()].reasonId };
            }
            else {
                dom_1.removeClass(this.header, 'recommended');
                this.recommendation.textContent = '';
            }
            /* __GDPR__
                "extensionGallery:openExtension" : {
                    "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            this.telemetryService.publicLog('extensionGallery:openExtension', objects_1.assign(extension.telemetryData, recommendationsData));
            if (extension.url) {
                this.name.onclick = dom_1.finalHandler(function () { return window.open(extension.url); });
                this.rating.onclick = dom_1.finalHandler(function () { return window.open(extension.url + "#review-details"); });
                this.publisher.onclick = dom_1.finalHandler(function () {
                    _this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                        .then(function (viewlet) { return viewlet; })
                        .done(function (viewlet) { return viewlet.search("publisher:\"" + extension.publisherDisplayName + "\""); });
                });
                if (extension.licenseUrl) {
                    this.license.onclick = dom_1.finalHandler(function () { return window.open(extension.licenseUrl); });
                    this.license.style.display = 'initial';
                }
                else {
                    this.license.onclick = null;
                    this.license.style.display = 'none';
                }
            }
            if (extension.repository) {
                this.repository.onclick = dom_1.finalHandler(function () { return window.open(extension.repository); });
                this.repository.style.display = 'initial';
            }
            else {
                this.repository.onclick = null;
                this.repository.style.display = 'none';
            }
            var install = this.instantiationService.createInstance(extensionsWidgets_1.InstallCountWidget, this.installCount, { extension: extension });
            this.transientDisposables.push(install);
            var ratings = this.instantiationService.createInstance(extensionsWidgets_1.RatingsWidget, this.rating, { extension: extension });
            this.transientDisposables.push(ratings);
            var builtinStatusAction = this.instantiationService.createInstance(extensionsActions_1.BuiltinStatusLabelAction);
            var maliciousStatusAction = this.instantiationService.createInstance(extensionsActions_1.MaliciousStatusLabelAction, true);
            var installAction = this.instantiationService.createInstance(extensionsActions_1.CombinedInstallAction);
            var updateAction = this.instantiationService.createInstance(extensionsActions_1.UpdateAction);
            var enableAction = this.instantiationService.createInstance(extensionsActions_1.EnableAction);
            var disableAction = this.instantiationService.createInstance(extensionsActions_1.DisableAction);
            var reloadAction = this.instantiationService.createInstance(extensionsActions_1.ReloadAction);
            installAction.extension = extension;
            builtinStatusAction.extension = extension;
            maliciousStatusAction.extension = extension;
            updateAction.extension = extension;
            enableAction.extension = extension;
            disableAction.extension = extension;
            reloadAction.extension = extension;
            this.extensionActionBar.clear();
            this.extensionActionBar.push([reloadAction, updateAction, enableAction, disableAction, installAction, builtinStatusAction, maliciousStatusAction], { icon: true, label: true });
            this.transientDisposables.push(enableAction, updateAction, reloadAction, disableAction, installAction, builtinStatusAction, maliciousStatusAction);
            this.navbar.clear();
            this.navbar.onChange(this.onNavbarChange.bind(this, extension), this, this.transientDisposables);
            this.navbar.push(NavbarSection.Readme, nls_1.localize('details', "Details"));
            this.navbar.push(NavbarSection.Contributions, nls_1.localize('contributions', "Contributions"));
            this.navbar.push(NavbarSection.Changelog, nls_1.localize('changelog', "Changelog"));
            this.navbar.push(NavbarSection.Dependencies, nls_1.localize('dependencies', "Dependencies"));
            this.content.innerHTML = '';
            return _super.prototype.setInput.call(this, input, options);
        };
        ExtensionEditor.prototype.changePosition = function (position) {
            this.navbar.update();
            _super.prototype.changePosition.call(this, position);
        };
        ExtensionEditor.prototype.showFind = function () {
            if (this.activeWebview) {
                this.activeWebview.showFind();
            }
        };
        ExtensionEditor.prototype.showNextFindTerm = function () {
            if (this.activeWebview) {
                this.activeWebview.showNextFindTerm();
            }
        };
        ExtensionEditor.prototype.showPreviousFindTerm = function () {
            if (this.activeWebview) {
                this.activeWebview.showPreviousFindTerm();
            }
        };
        ExtensionEditor.prototype.onNavbarChange = function (extension, id) {
            this.contentDisposables = lifecycle_1.dispose(this.contentDisposables);
            this.content.innerHTML = '';
            this.activeWebview = null;
            switch (id) {
                case NavbarSection.Readme: return this.openReadme();
                case NavbarSection.Contributions: return this.openContributions();
                case NavbarSection.Changelog: return this.openChangelog();
                case NavbarSection.Dependencies: return this.openDependencies(extension);
            }
        };
        ExtensionEditor.prototype.openMarkdown = function (content, noContentCopy) {
            var _this = this;
            return this.loadContents(function () { return content
                .then(marked_1.marked.parse)
                .then(renderBody)
                .then(removeEmbeddedSVGs)
                .then(function (body) {
                var allowedBadgeProviders = _this.extensionsWorkbenchService.allowedBadgeProviders;
                var webViewOptions = allowedBadgeProviders.length > 0 ? { allowScripts: false, allowSvgs: false, svgWhiteList: allowedBadgeProviders } : {};
                _this.activeWebview = new webview_1.Webview(_this.content, _this.partService.getContainer(partService_1.Parts.EDITOR_PART), _this.environmentService, _this.contextService, _this.contextViewService, _this.contextKey, _this.findInputFocusContextKey, webViewOptions, false);
                var removeLayoutParticipant = arrays.insert(_this.layoutParticipants, _this.activeWebview);
                _this.contentDisposables.push(lifecycle_1.toDisposable(removeLayoutParticipant));
                _this.activeWebview.style(_this.themeService.getTheme());
                _this.activeWebview.contents = body;
                _this.activeWebview.onDidClickLink(function (link) {
                    // Whitelist supported schemes for links
                    if (link && ['http', 'https', 'mailto'].indexOf(link.scheme) >= 0) {
                        _this.openerService.open(link);
                    }
                }, null, _this.contentDisposables);
                _this.themeService.onThemeChange(function (theme) { return _this.activeWebview.style(theme); }, null, _this.contentDisposables);
                _this.contentDisposables.push(_this.activeWebview);
            })
                .then(null, function () {
                var p = dom_1.append(_this.content, dom_1.$('p.nocontent'));
                p.textContent = noContentCopy;
            }); });
        };
        ExtensionEditor.prototype.openReadme = function () {
            return this.openMarkdown(this.extensionReadme.get(), nls_1.localize('noReadme', "No README available."));
        };
        ExtensionEditor.prototype.openChangelog = function () {
            return this.openMarkdown(this.extensionChangelog.get(), nls_1.localize('noChangelog', "No Changelog available."));
        };
        ExtensionEditor.prototype.openContributions = function () {
            var _this = this;
            return this.loadContents(function () { return _this.extensionManifest.get()
                .then(function (manifest) {
                var content = dom_1.$('div', { class: 'subcontent' });
                var scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
                var layout = function () { return scrollableContent.scanDomNode(); };
                var removeLayoutParticipant = arrays.insert(_this.layoutParticipants, { layout: layout });
                _this.contentDisposables.push(lifecycle_1.toDisposable(removeLayoutParticipant));
                var renders = [
                    _this.renderSettings(content, manifest, layout),
                    _this.renderCommands(content, manifest, layout),
                    _this.renderLanguages(content, manifest, layout),
                    _this.renderColorThemes(content, manifest, layout),
                    _this.renderIconThemes(content, manifest, layout),
                    _this.renderColors(content, manifest, layout),
                    _this.renderJSONValidation(content, manifest, layout),
                    _this.renderDebuggers(content, manifest, layout),
                    _this.renderViews(content, manifest, layout),
                    _this.renderLocalizations(content, manifest, layout)
                ];
                var isEmpty = !renders.reduce(function (v, r) { return r || v; }, false);
                scrollableContent.scanDomNode();
                if (isEmpty) {
                    dom_1.append(_this.content, dom_1.$('p.nocontent')).textContent = nls_1.localize('noContributions', "No Contributions");
                    return;
                }
                else {
                    dom_1.append(_this.content, scrollableContent.getDomNode());
                    _this.contentDisposables.push(scrollableContent);
                }
            }, function () {
                dom_1.append(_this.content, dom_1.$('p.nocontent')).textContent = nls_1.localize('noContributions', "No Contributions");
            }); });
        };
        ExtensionEditor.prototype.openDependencies = function (extension) {
            var _this = this;
            if (extension.dependencies.length === 0) {
                dom_1.append(this.content, dom_1.$('p.nocontent')).textContent = nls_1.localize('noDependencies', "No Dependencies");
                return;
            }
            return this.loadContents(function () {
                return _this.extensionDependencies.get().then(function (extensionDependencies) {
                    var content = dom_1.$('div', { class: 'subcontent' });
                    var scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
                    dom_1.append(_this.content, scrollableContent.getDomNode());
                    _this.contentDisposables.push(scrollableContent);
                    var tree = _this.renderDependencies(content, extensionDependencies);
                    var layout = function () {
                        scrollableContent.scanDomNode();
                        var scrollDimensions = scrollableContent.getScrollDimensions();
                        tree.layout(scrollDimensions.height);
                    };
                    var removeLayoutParticipant = arrays.insert(_this.layoutParticipants, { layout: layout });
                    _this.contentDisposables.push(lifecycle_1.toDisposable(removeLayoutParticipant));
                    _this.contentDisposables.push(tree);
                    scrollableContent.scanDomNode();
                }, function (error) {
                    dom_1.append(_this.content, dom_1.$('p.nocontent')).textContent = error;
                    _this.messageService.show(severity_1.default.Error, error);
                });
            });
        };
        ExtensionEditor.prototype.renderDependencies = function (container, extensionDependencies) {
            var renderer = this.instantiationService.createInstance(dependenciesViewer_1.Renderer);
            var controller = this.instantiationService.createInstance(dependenciesViewer_1.Controller);
            var tree = this.instantiationService.createInstance(listService_1.WorkbenchTree, container, {
                dataSource: new dependenciesViewer_1.DataSource(),
                renderer: renderer,
                controller: controller
            }, {
                indentPixels: 40,
                twistiePixels: 20
            });
            tree.setInput(extensionDependencies);
            this.contentDisposables.push(tree.onDidChangeSelection(function (event) {
                if (event && event.payload && event.payload.origin === 'keyboard') {
                    controller.openExtension(tree, false);
                }
            }));
            return tree;
        };
        ExtensionEditor.prototype.renderSettings = function (container, manifest, onDetailsToggle) {
            var contributes = manifest.contributes;
            var configuration = contributes && contributes.configuration;
            var properties = configuration && configuration.properties;
            var contrib = properties ? Object.keys(properties) : [];
            if (!contrib.length) {
                return false;
            }
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('settings', "Settings ({0})", contrib.length)), dom_1.$.apply(void 0, ['table', null,
                dom_1.$('tr', null, dom_1.$('th', null, nls_1.localize('setting name', "Name")), dom_1.$('th', null, nls_1.localize('description', "Description")), dom_1.$('th', null, nls_1.localize('default', "Default")))].concat(contrib.map(function (key) { return dom_1.$('tr', null, dom_1.$('td', null, dom_1.$('code', null, key)), dom_1.$('td', null, properties[key].description), dom_1.$('td', null, dom_1.$('code', null, properties[key].default))); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.renderDebuggers = function (container, manifest, onDetailsToggle) {
            var contributes = manifest.contributes;
            var contrib = contributes && contributes.debuggers || [];
            if (!contrib.length) {
                return false;
            }
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('debuggers', "Debuggers ({0})", contrib.length)), dom_1.$.apply(void 0, ['table', null,
                dom_1.$('tr', null, dom_1.$('th', null, nls_1.localize('debugger name', "Name")), dom_1.$('th', null, nls_1.localize('debugger type', "Type")))].concat(contrib.map(function (d) { return dom_1.$('tr', null, dom_1.$('td', null, d.label), dom_1.$('td', null, d.type)); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.renderViews = function (container, manifest, onDetailsToggle) {
            var contributes = manifest.contributes;
            var contrib = contributes && contributes.views || {};
            var views = Object.keys(contrib).reduce(function (result, location) {
                var viewsForLocation = contrib[location];
                result.push.apply(result, viewsForLocation.map(function (view) { return (__assign({}, view, { location: location })); }));
                return result;
            }, []);
            if (!views.length) {
                return false;
            }
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('views', "Views ({0})", views.length)), dom_1.$.apply(void 0, ['table', null,
                dom_1.$('tr', null, dom_1.$('th', null, nls_1.localize('view id', "ID")), dom_1.$('th', null, nls_1.localize('view name', "Name")), dom_1.$('th', null, nls_1.localize('view location', "Where")))].concat(views.map(function (view) { return dom_1.$('tr', null, dom_1.$('td', null, view.id), dom_1.$('td', null, view.name), dom_1.$('td', null, view.location)); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.renderLocalizations = function (container, manifest, onDetailsToggle) {
            var contributes = manifest.contributes;
            var localizations = contributes && contributes.localizations || [];
            if (!localizations.length) {
                return false;
            }
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('localizations', "Localizations ({0})", localizations.length)), dom_1.$.apply(void 0, ['table', null,
                dom_1.$('tr', null, dom_1.$('th', null, nls_1.localize('localizations language id', "Language Id")), dom_1.$('th', null, nls_1.localize('localizations language name', "Langauge Name")), dom_1.$('th', null, nls_1.localize('localizations localized language name', "Langauge Name (Localized)")))].concat(localizations.map(function (localization) { return dom_1.$('tr', null, dom_1.$('td', null, localization.languageId), dom_1.$('td', null, localization.languageName), dom_1.$('td', null, localization.languageNameLocalized)); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.renderColorThemes = function (container, manifest, onDetailsToggle) {
            var contributes = manifest.contributes;
            var contrib = contributes && contributes.themes || [];
            if (!contrib.length) {
                return false;
            }
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('colorThemes', "Color Themes ({0})", contrib.length)), dom_1.$.apply(void 0, ['ul', null].concat(contrib.map(function (theme) { return dom_1.$('li', null, theme.label); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.renderIconThemes = function (container, manifest, onDetailsToggle) {
            var contributes = manifest.contributes;
            var contrib = contributes && contributes.iconThemes || [];
            if (!contrib.length) {
                return false;
            }
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('iconThemes', "Icon Themes ({0})", contrib.length)), dom_1.$.apply(void 0, ['ul', null].concat(contrib.map(function (theme) { return dom_1.$('li', null, theme.label); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.renderColors = function (container, manifest, onDetailsToggle) {
            var contributes = manifest.contributes;
            var colors = contributes && contributes.colors;
            if (!colors || !colors.length) {
                return false;
            }
            function colorPreview(colorReference) {
                var result = [];
                if (colorReference && colorReference[0] === '#') {
                    var color = color_1.Color.fromHex(colorReference);
                    if (color) {
                        result.push(dom_1.$('span', { class: 'colorBox', style: 'background-color: ' + color_1.Color.Format.CSS.format(color) }, ''));
                    }
                }
                result.push(dom_1.$('code', null, colorReference));
                return result;
            }
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('colors', "Colors ({0})", colors.length)), dom_1.$.apply(void 0, ['table', null,
                dom_1.$('tr', null, dom_1.$('th', null, nls_1.localize('colorId', "Id")), dom_1.$('th', null, nls_1.localize('description', "Description")), dom_1.$('th', null, nls_1.localize('defaultDark', "Dark Default")), dom_1.$('th', null, nls_1.localize('defaultLight', "Light Default")), dom_1.$('th', null, nls_1.localize('defaultHC', "High Contrast Default")))].concat(colors.map(function (color) { return dom_1.$('tr', null, dom_1.$('td', null, dom_1.$('code', null, color.id)), dom_1.$('td', null, color.description), dom_1.$.apply(void 0, ['td', null].concat(colorPreview(color.defaults.dark))), dom_1.$.apply(void 0, ['td', null].concat(colorPreview(color.defaults.light))), dom_1.$.apply(void 0, ['td', null].concat(colorPreview(color.defaults.highContrast)))); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.renderJSONValidation = function (container, manifest, onDetailsToggle) {
            var contributes = manifest.contributes;
            var contrib = contributes && contributes.jsonValidation || [];
            if (!contrib.length) {
                return false;
            }
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('JSON Validation', "JSON Validation ({0})", contrib.length)), dom_1.$.apply(void 0, ['ul', null].concat(contrib.map(function (v) { return dom_1.$('li', null, v.fileMatch); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.renderCommands = function (container, manifest, onDetailsToggle) {
            var _this = this;
            var contributes = manifest.contributes;
            var rawCommands = contributes && contributes.commands || [];
            var commands = rawCommands.map(function (c) { return ({
                id: c.command,
                title: c.title,
                keybindings: [],
                menus: []
            }); });
            var byId = arrays.index(commands, function (c) { return c.id; });
            var menus = contributes && contributes.menus || {};
            Object.keys(menus).forEach(function (context) {
                menus[context].forEach(function (menu) {
                    var command = byId[menu.command];
                    if (!command) {
                        command = { id: menu.command, title: '', keybindings: [], menus: [context] };
                        byId[command.id] = command;
                        commands.push(command);
                    }
                    else {
                        command.menus.push(context);
                    }
                });
            });
            var rawKeybindings = contributes && contributes.keybindings || [];
            rawKeybindings.forEach(function (rawKeybinding) {
                var keybinding = _this.resolveKeybinding(rawKeybinding);
                if (!keybinding) {
                    return;
                }
                var command = byId[rawKeybinding.command];
                if (!command) {
                    command = { id: rawKeybinding.command, title: '', keybindings: [keybinding], menus: [] };
                    byId[command.id] = command;
                    commands.push(command);
                }
                else {
                    command.keybindings.push(keybinding);
                }
            });
            if (!commands.length) {
                return false;
            }
            var renderKeybinding = function (keybinding) {
                var element = dom_1.$('');
                new keybindingLabel_1.KeybindingLabel(element, platform_1.OS).set(keybinding, null);
                return element;
            };
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('commands', "Commands ({0})", commands.length)), dom_1.$.apply(void 0, ['table', null,
                dom_1.$('tr', null, dom_1.$('th', null, nls_1.localize('command name', "Name")), dom_1.$('th', null, nls_1.localize('description', "Description")), dom_1.$('th', null, nls_1.localize('keyboard shortcuts', "Keyboard Shortcuts")), dom_1.$('th', null, nls_1.localize('menuContexts', "Menu Contexts")))].concat(commands.map(function (c) { return dom_1.$('tr', null, dom_1.$('td', null, dom_1.$('code', null, c.id)), dom_1.$('td', null, c.title), dom_1.$.apply(void 0, ['td', null].concat(c.keybindings.map(function (keybinding) { return renderKeybinding(keybinding); }))), dom_1.$.apply(void 0, ['td', null].concat(c.menus.map(function (context) { return dom_1.$('code', null, context); })))); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.renderLanguages = function (container, manifest, onDetailsToggle) {
            var contributes = manifest.contributes;
            var rawLanguages = contributes && contributes.languages || [];
            var languages = rawLanguages.map(function (l) { return ({
                id: l.id,
                name: (l.aliases || [])[0] || l.id,
                extensions: l.extensions || [],
                hasGrammar: false,
                hasSnippets: false
            }); });
            var byId = arrays.index(languages, function (l) { return l.id; });
            var grammars = contributes && contributes.grammars || [];
            grammars.forEach(function (grammar) {
                var language = byId[grammar.language];
                if (!language) {
                    language = { id: grammar.language, name: grammar.language, extensions: [], hasGrammar: true, hasSnippets: false };
                    byId[language.id] = language;
                    languages.push(language);
                }
                else {
                    language.hasGrammar = true;
                }
            });
            var snippets = contributes && contributes.snippets || [];
            snippets.forEach(function (snippet) {
                var language = byId[snippet.language];
                if (!language) {
                    language = { id: snippet.language, name: snippet.language, extensions: [], hasGrammar: false, hasSnippets: true };
                    byId[language.id] = language;
                    languages.push(language);
                }
                else {
                    language.hasSnippets = true;
                }
            });
            if (!languages.length) {
                return false;
            }
            var details = dom_1.$('details', { open: true, ontoggle: onDetailsToggle }, dom_1.$('summary', null, nls_1.localize('languages', "Languages ({0})", languages.length)), dom_1.$.apply(void 0, ['table', null,
                dom_1.$('tr', null, dom_1.$('th', null, nls_1.localize('language id', "ID")), dom_1.$('th', null, nls_1.localize('language name', "Name")), dom_1.$('th', null, nls_1.localize('file extensions', "File Extensions")), dom_1.$('th', null, nls_1.localize('grammar', "Grammar")), dom_1.$('th', null, nls_1.localize('snippets', "Snippets")))].concat(languages.map(function (l) { return dom_1.$('tr', null, dom_1.$('td', null, l.id), dom_1.$('td', null, l.name), dom_1.$.apply(void 0, ['td', null].concat(dom_1.join(l.extensions.map(function (ext) { return dom_1.$('code', null, ext); }), ' '))), dom_1.$('td', null, document.createTextNode(l.hasGrammar ? '✔︎' : '—')), dom_1.$('td', null, document.createTextNode(l.hasSnippets ? '✔︎' : '—'))); }))));
            dom_1.append(container, details);
            return true;
        };
        ExtensionEditor.prototype.resolveKeybinding = function (rawKeyBinding) {
            var key;
            switch (process.platform) {
                case 'win32':
                    key = rawKeyBinding.win;
                    break;
                case 'linux':
                    key = rawKeyBinding.linux;
                    break;
                case 'darwin':
                    key = rawKeyBinding.mac;
                    break;
            }
            var keyBinding = keybindingIO_1.KeybindingIO.readKeybinding(key || rawKeyBinding.key, platform_1.OS);
            if (!keyBinding) {
                return null;
            }
            return this.keybindingService.resolveKeybinding(keyBinding)[0];
        };
        ExtensionEditor.prototype.loadContents = function (loadingTask) {
            var _this = this;
            dom_1.addClass(this.content, 'loading');
            var promise = loadingTask();
            promise = async_1.always(promise, function () { return dom_1.removeClass(_this.content, 'loading'); });
            this.contentDisposables.push(lifecycle_1.toDisposable(function () { return promise.cancel(); }));
        };
        ExtensionEditor.prototype.layout = function () {
            this.layoutParticipants.forEach(function (p) { return p.layout(); });
        };
        ExtensionEditor.prototype.onError = function (err) {
            if (errors_1.isPromiseCanceledError(err)) {
                return;
            }
            this.messageService.show(severity_1.default.Error, err);
        };
        ExtensionEditor.prototype.dispose = function () {
            this.transientDisposables = lifecycle_1.dispose(this.transientDisposables);
            this.disposables = lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        ExtensionEditor.ID = 'workbench.editor.extension';
        ExtensionEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, viewlet_1.IViewletService),
            __param(3, extensions_1.IExtensionsWorkbenchService),
            __param(4, themeService_1.IThemeService),
            __param(5, keybinding_1.IKeybindingService),
            __param(6, message_1.IMessageService),
            __param(7, opener_1.IOpenerService),
            __param(8, partService_1.IPartService),
            __param(9, contextView_1.IContextViewService),
            __param(10, contextkey_1.IContextKeyService),
            __param(11, extensionManagement_1.IExtensionTipsService),
            __param(12, environment_1.IEnvironmentService),
            __param(13, workspace_1.IWorkspaceContextService)
        ], ExtensionEditor);
        return ExtensionEditor;
    }(baseEditor_1.BaseEditor));
    exports.ExtensionEditor = ExtensionEditor;
    var ShowExtensionEditorFindCommand = /** @class */ (function (_super) {
        __extends(ShowExtensionEditorFindCommand, _super);
        function ShowExtensionEditorFindCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ShowExtensionEditorFindCommand.prototype.runCommand = function (accessor, args) {
            var extensionEditor = this.getExtensionEditor(accessor);
            if (extensionEditor) {
                extensionEditor.showFind();
            }
        };
        ShowExtensionEditorFindCommand.prototype.getExtensionEditor = function (accessor) {
            var activeEditor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            if (activeEditor instanceof ExtensionEditor) {
                return activeEditor;
            }
            return null;
        };
        return ShowExtensionEditorFindCommand;
    }(editorExtensions_1.Command));
    var showCommand = new ShowExtensionEditorFindCommand({
        id: 'editor.action.extensioneditor.showfind',
        precondition: exports.KEYBINDING_CONTEXT_EXTENSIONEDITOR_WEBVIEW_FOCUS,
        kbOpts: {
            primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(showCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
    var ShowExtensionEditorFindTermCommand = /** @class */ (function (_super) {
        __extends(ShowExtensionEditorFindTermCommand, _super);
        function ShowExtensionEditorFindTermCommand(opts, _next) {
            var _this = _super.call(this, opts) || this;
            _this._next = _next;
            return _this;
        }
        ShowExtensionEditorFindTermCommand.prototype.runCommand = function (accessor, args) {
            var extensionEditor = this.getExtensionEditor(accessor);
            if (extensionEditor) {
                if (this._next) {
                    extensionEditor.showNextFindTerm();
                }
                else {
                    extensionEditor.showPreviousFindTerm();
                }
            }
        };
        ShowExtensionEditorFindTermCommand.prototype.getExtensionEditor = function (accessor) {
            var activeEditor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            if (activeEditor instanceof ExtensionEditor) {
                return activeEditor;
            }
            return null;
        };
        return ShowExtensionEditorFindTermCommand;
    }(editorExtensions_1.Command));
    var showNextFindTermCommand = new ShowExtensionEditorFindTermCommand({
        id: 'editor.action.extensioneditor.showNextFindTerm',
        precondition: exports.KEYBINDING_CONTEXT_EXTENSIONEDITOR_FIND_WIDGET_INPUT_FOCUSED,
        kbOpts: {
            primary: 512 /* Alt */ | 18 /* DownArrow */
        }
    }, true);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(showNextFindTermCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
    var showPreviousFindTermCommand = new ShowExtensionEditorFindTermCommand({
        id: 'editor.action.extensioneditor.showPreviousFindTerm',
        precondition: exports.KEYBINDING_CONTEXT_EXTENSIONEDITOR_FIND_WIDGET_INPUT_FOCUSED,
        kbOpts: {
            primary: 512 /* Alt */ | 16 /* UpArrow */
        }
    }, false);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(showPreviousFindTermCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
});
