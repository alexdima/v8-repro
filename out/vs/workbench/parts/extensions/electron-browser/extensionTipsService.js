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
define(["require", "exports", "vs/nls", "vs/base/common/paths", "vs/base/common/winjs.base", "vs/base/common/collections", "vs/base/common/lifecycle", "vs/base/common/glob", "vs/base/common/json", "vs/platform/extensionManagement/common/extensionManagement", "vs/editor/common/services/modelService", "vs/platform/storage/common/storage", "vs/platform/node/product", "vs/platform/message/common/message", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/extensions/browser/extensionsActions", "vs/base/common/severity", "vs/platform/workspace/common/workspace", "vs/base/common/network", "vs/platform/files/common/files", "vs/workbench/parts/extensions/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/telemetry/common/telemetry", "vs/base/node/pfs", "os", "vs/base/common/arrays", "vs/platform/environment/common/environment", "vs/base/common/mime", "vs/workbench/browser/parts/editor/editorStatus", "vs/platform/extensions/common/extensions", "vs/workbench/parts/stats/node/workspaceStats", "vs/platform/request/node/request", "vs/base/node/request", "vs/base/common/types"], function (require, exports, nls_1, paths, winjs_base_1, collections_1, lifecycle_1, glob_1, json, extensionManagement_1, modelService_1, storage_1, product_1, message_1, instantiation_1, extensionsActions_1, severity_1, workspace_1, network_1, files_1, extensions_1, configuration_1, telemetry_1, pfs, os, arrays_1, environment_1, mime_1, editorStatus_1, extensions_2, workspaceStats_1, request_1, request_2, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var empty = Object.create(null);
    var milliSecondsInADay = 1000 * 60 * 60 * 24;
    var choiceNever = nls_1.localize('neverShowAgain', "Don't Show Again");
    var choiceClose = nls_1.localize('close', "Close");
    var ExtensionTipsService = /** @class */ (function (_super) {
        __extends(ExtensionTipsService, _super);
        function ExtensionTipsService(_galleryService, _modelService, storageService, choiceService, extensionsService, instantiationService, fileService, contextService, configurationService, messageService, telemetryService, environmentService, extensionService, requestService) {
            var _this = _super.call(this) || this;
            _this._galleryService = _galleryService;
            _this._modelService = _modelService;
            _this.storageService = storageService;
            _this.choiceService = choiceService;
            _this.extensionsService = extensionsService;
            _this.instantiationService = instantiationService;
            _this.fileService = fileService;
            _this.contextService = contextService;
            _this.configurationService = configurationService;
            _this.messageService = messageService;
            _this.telemetryService = telemetryService;
            _this.environmentService = environmentService;
            _this.extensionService = extensionService;
            _this.requestService = requestService;
            _this._fileBasedRecommendations = Object.create(null);
            _this._exeBasedRecommendations = Object.create(null);
            _this._availableRecommendations = Object.create(null);
            _this._allWorkspaceRecommendedExtensions = [];
            _this._dynamicWorkspaceRecommendations = [];
            _this._disposables = [];
            _this.proactiveRecommendationsFetched = false;
            if (!_this.isEnabled()) {
                return _this;
            }
            if (product_1.default.extensionsGallery && product_1.default.extensionsGallery.recommendationsUrl) {
                _this._extensionsRecommendationsUrl = product_1.default.extensionsGallery.recommendationsUrl;
            }
            _this.getCachedDynamicWorkspaceRecommendations();
            _this._suggestFileBasedRecommendations();
            _this.promptWorkspaceRecommendationsPromise = _this._suggestWorkspaceRecommendations();
            if (!_this.configurationService.getValue(extensions_1.ShowRecommendationsOnlyOnDemandKey)) {
                _this.fetchProactiveRecommendations(true);
            }
            _this._register(_this.contextService.onDidChangeWorkspaceFolders(function (e) { return _this.onWorkspaceFoldersChanged(e); }));
            _this._register(_this.configurationService.onDidChangeConfiguration(function (e) {
                if (!_this.proactiveRecommendationsFetched && !_this.configurationService.getValue(extensions_1.ShowRecommendationsOnlyOnDemandKey)) {
                    _this.fetchProactiveRecommendations();
                }
            }));
            return _this;
        }
        ExtensionTipsService.prototype.fetchProactiveRecommendations = function (calledDuringStartup) {
            var _this = this;
            var fetchPromise = winjs_base_1.TPromise.as(null);
            if (!this.proactiveRecommendationsFetched) {
                this.proactiveRecommendationsFetched = true;
                // Executable based recommendations carry out a lot of file stats, so run them after 10 secs
                // So that the startup is not affected
                fetchPromise = new winjs_base_1.TPromise(function (c, e) {
                    setTimeout(function () {
                        winjs_base_1.TPromise.join([_this._suggestBasedOnExecutables(), _this.getDynamicWorkspaceRecommendations()]).then(function () { return c(null); });
                    }, calledDuringStartup ? 10000 : 0);
                });
            }
            return fetchPromise;
        };
        ExtensionTipsService.prototype.isEnabled = function () {
            return this._galleryService.isEnabled() && !this.environmentService.extensionDevelopmentPath;
        };
        ExtensionTipsService.prototype.getAllRecommendationsWithReason = function () {
            var output = Object.create(null);
            if (!this.proactiveRecommendationsFetched) {
                return output;
            }
            if (this.contextService.getWorkspace().folders && this.contextService.getWorkspace().folders.length === 1) {
                var currentRepo_1 = this.contextService.getWorkspace().folders[0].name;
                this._dynamicWorkspaceRecommendations.forEach(function (x) { return output[x.toLowerCase()] = {
                    reasonId: extensionManagement_1.ExtensionRecommendationReason.DynamicWorkspace,
                    reasonText: nls_1.localize('dynamicWorkspaceRecommendation', "This extension may interest you because it's popular among users of the {0} repository.", currentRepo_1)
                }; });
            }
            collections_1.forEach(this._exeBasedRecommendations, function (entry) { return output[entry.key.toLowerCase()] = {
                reasonId: extensionManagement_1.ExtensionRecommendationReason.Executable,
                reasonText: nls_1.localize('exeBasedRecommendation', "This extension is recommended because you have {0} installed.", entry.value)
            }; });
            Object.keys(this._fileBasedRecommendations).forEach(function (x) { return output[x.toLowerCase()] = {
                reasonId: extensionManagement_1.ExtensionRecommendationReason.File,
                reasonText: nls_1.localize('fileBasedRecommendation', "This extension is recommended based on the files you recently opened.")
            }; });
            this._allWorkspaceRecommendedExtensions.forEach(function (x) { return output[x.toLowerCase()] = {
                reasonId: extensionManagement_1.ExtensionRecommendationReason.Workspace,
                reasonText: nls_1.localize('workspaceRecommendation', "This extension is recommended by users of the current workspace.")
            }; });
            return output;
        };
        ExtensionTipsService.prototype.getWorkspaceRecommendations = function () {
            var _this = this;
            if (!this.isEnabled()) {
                return winjs_base_1.TPromise.as([]);
            }
            var workspace = this.contextService.getWorkspace();
            return winjs_base_1.TPromise.join([this.resolveWorkspaceRecommendations(workspace)].concat(workspace.folders.map(function (workspaceFolder) { return _this.resolveWorkspaceFolderRecommendations(workspaceFolder); })))
                .then(function (recommendations) {
                _this._allWorkspaceRecommendedExtensions = arrays_1.distinct(arrays_1.flatten(recommendations));
                return _this._allWorkspaceRecommendedExtensions;
            });
        };
        ExtensionTipsService.prototype.resolveWorkspaceRecommendations = function (workspace) {
            var _this = this;
            if (workspace.configuration) {
                return this.fileService.resolveContent(workspace.configuration)
                    .then(function (content) { return _this.processWorkspaceRecommendations(json.parse(content.value, [])['extensions']); }, function (err) { return []; });
            }
            return winjs_base_1.TPromise.as([]);
        };
        ExtensionTipsService.prototype.resolveWorkspaceFolderRecommendations = function (workspaceFolder) {
            var _this = this;
            return this.fileService.resolveContent(workspaceFolder.toResource(paths.join('.vscode', 'extensions.json')))
                .then(function (content) { return _this.processWorkspaceRecommendations(json.parse(content.value, [])); }, function (err) { return []; });
        };
        ExtensionTipsService.prototype.processWorkspaceRecommendations = function (extensionsContent) {
            var regEx = new RegExp(extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN);
            if (extensionsContent && extensionsContent.recommendations && extensionsContent.recommendations.length) {
                var countBadRecommendations_1 = 0;
                var badRecommendationsString_1 = '';
                var filteredRecommendations_1 = extensionsContent.recommendations.filter(function (element, position) {
                    if (extensionsContent.recommendations.indexOf(element) !== position) {
                        // This is a duplicate entry, it doesn't hurt anybody
                        // but it shouldn't be sent in the gallery query
                        return false;
                    }
                    else if (!regEx.test(element)) {
                        countBadRecommendations_1++;
                        badRecommendationsString_1 += element + " (bad format) Expected: <provider>.<name>\n";
                        return false;
                    }
                    return true;
                });
                return this._galleryService.query({ names: filteredRecommendations_1 }).then(function (pager) {
                    var page = pager.firstPage;
                    var validRecommendations = page.map(function (extension) {
                        return extension.identifier.id.toLowerCase();
                    });
                    if (validRecommendations.length !== filteredRecommendations_1.length) {
                        filteredRecommendations_1.forEach(function (element) {
                            if (validRecommendations.indexOf(element.toLowerCase()) === -1) {
                                countBadRecommendations_1++;
                                badRecommendationsString_1 += element + " (not found in marketplace)\n";
                            }
                        });
                    }
                    if (countBadRecommendations_1 > 0) {
                        console.log('The below ' +
                            countBadRecommendations_1 +
                            ' extension(s) in workspace recommendations have issues:\n' +
                            badRecommendationsString_1);
                    }
                    return validRecommendations;
                });
            }
            return winjs_base_1.TPromise.as([]);
        };
        ExtensionTipsService.prototype.onWorkspaceFoldersChanged = function (event) {
            var _this = this;
            if (event.added.length) {
                winjs_base_1.TPromise.join(event.added.map(function (workspaceFolder) { return _this.resolveWorkspaceFolderRecommendations(workspaceFolder); }))
                    .then(function (result) {
                    var newRecommendations = arrays_1.flatten(result);
                    // Suggest only if atleast one of the newly added recommendtations was not suggested before
                    if (newRecommendations.some(function (e) { return _this._allWorkspaceRecommendedExtensions.indexOf(e) === -1; })) {
                        _this._suggestWorkspaceRecommendations();
                    }
                });
            }
            this._dynamicWorkspaceRecommendations = [];
        };
        ExtensionTipsService.prototype.getFileBasedRecommendations = function () {
            var _this = this;
            var fileBased = Object.keys(this._fileBasedRecommendations)
                .sort(function (a, b) {
                if (_this._fileBasedRecommendations[a] === _this._fileBasedRecommendations[b]) {
                    if (!product_1.default.extensionImportantTips || product_1.default.extensionImportantTips[a]) {
                        return -1;
                    }
                    if (product_1.default.extensionImportantTips[b]) {
                        return 1;
                    }
                }
                return _this._fileBasedRecommendations[a] > _this._fileBasedRecommendations[b] ? -1 : 1;
            });
            return fileBased;
        };
        ExtensionTipsService.prototype.getOtherRecommendations = function () {
            var _this = this;
            return this.fetchProactiveRecommendations().then(function () {
                var others = arrays_1.distinct(Object.keys(_this._exeBasedRecommendations).concat(_this._dynamicWorkspaceRecommendations));
                arrays_1.shuffle(others);
                return others;
            });
        };
        ExtensionTipsService.prototype.getKeymapRecommendations = function () {
            return product_1.default.keymapExtensionTips || [];
        };
        ExtensionTipsService.prototype._suggestFileBasedRecommendations = function () {
            var _this = this;
            var extensionTips = product_1.default.extensionTips;
            if (!extensionTips) {
                return;
            }
            // group ids by pattern, like {**/*.md} -> [ext.foo1, ext.bar2]
            this._availableRecommendations = Object.create(null);
            collections_1.forEach(extensionTips, function (entry) {
                var id = entry.key, pattern = entry.value;
                var ids = _this._availableRecommendations[pattern];
                if (!ids) {
                    _this._availableRecommendations[pattern] = [id];
                }
                else {
                    ids.push(id);
                }
            });
            collections_1.forEach(product_1.default.extensionImportantTips, function (entry) {
                var id = entry.key, value = entry.value;
                var pattern = value.pattern;
                var ids = _this._availableRecommendations[pattern];
                if (!ids) {
                    _this._availableRecommendations[pattern] = [id];
                }
                else {
                    ids.push(id);
                }
            });
            var allRecommendations = [];
            collections_1.forEach(this._availableRecommendations, function (_a) {
                var ids = _a.value;
                allRecommendations.push.apply(allRecommendations, ids);
            });
            // retrieve ids of previous recommendations
            var storedRecommendationsJson = JSON.parse(this.storageService.get('extensionsAssistant/recommendations', storage_1.StorageScope.GLOBAL, '[]'));
            if (Array.isArray(storedRecommendationsJson)) {
                for (var _i = 0, _a = storedRecommendationsJson; _i < _a.length; _i++) {
                    var id = _a[_i];
                    if (allRecommendations.indexOf(id) > -1) {
                        this._fileBasedRecommendations[id] = Date.now();
                    }
                }
            }
            else {
                var now_1 = Date.now();
                collections_1.forEach(storedRecommendationsJson, function (entry) {
                    if (typeof entry.value === 'number') {
                        var diff = (now_1 - entry.value) / milliSecondsInADay;
                        if (diff <= 7 && allRecommendations.indexOf(entry.key) > -1) {
                            _this._fileBasedRecommendations[entry.key] = entry.value;
                        }
                    }
                });
            }
            this._modelService.onModelAdded(this._suggest, this, this._disposables);
            this._modelService.getModels().forEach(function (model) { return _this._suggest(model); });
        };
        ExtensionTipsService.prototype.getMimeTypes = function (path) {
            return this.extensionService.whenInstalledExtensionsRegistered().then(function () {
                return mime_1.guessMimeTypes(path);
            });
        };
        ExtensionTipsService.prototype._suggest = function (model) {
            var _this = this;
            var uri = model.uri;
            var hasSuggestion = false;
            if (!uri || uri.scheme !== network_1.Schemas.file) {
                return;
            }
            // re-schedule this bit of the operation to be off
            // the critical path - in case glob-match is slow
            setImmediate(function () {
                var now = Date.now();
                collections_1.forEach(_this._availableRecommendations, function (entry) {
                    var pattern = entry.key, ids = entry.value;
                    if (glob_1.match(pattern, uri.fsPath)) {
                        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                            var id = ids_1[_i];
                            _this._fileBasedRecommendations[id] = now;
                        }
                    }
                });
                _this.storageService.store('extensionsAssistant/recommendations', JSON.stringify(_this._fileBasedRecommendations), storage_1.StorageScope.GLOBAL);
                var config = _this.configurationService.getValue(extensions_1.ConfigurationKey);
                if (config.ignoreRecommendations || config.showRecommendationsOnlyOnDemand) {
                    return;
                }
                var importantRecommendationsIgnoreList = JSON.parse(_this.storageService.get('extensionsAssistant/importantRecommendationsIgnore', storage_1.StorageScope.GLOBAL, '[]'));
                var recommendationsToSuggest = Object.keys(product_1.default.extensionImportantTips || [])
                    .filter(function (id) { return importantRecommendationsIgnoreList.indexOf(id) === -1 && glob_1.match(product_1.default.extensionImportantTips[id]['pattern'], uri.fsPath); });
                var importantTipsPromise = recommendationsToSuggest.length === 0 ? winjs_base_1.TPromise.as(null) : _this.extensionsService.getInstalled(extensionManagement_1.LocalExtensionType.User).then(function (local) {
                    recommendationsToSuggest = recommendationsToSuggest.filter(function (id) { return local.every(function (local) { return local.manifest.publisher + "." + local.manifest.name !== id; }); });
                    if (!recommendationsToSuggest.length) {
                        return;
                    }
                    var id = recommendationsToSuggest[0];
                    var name = product_1.default.extensionImportantTips[id]['name'];
                    // Indicates we have a suggested extension via the whitelist
                    hasSuggestion = true;
                    var message = nls_1.localize('reallyRecommended2', "The '{0}' extension is recommended for this file type.", name);
                    // Temporary fix for the only extension pack we recommend. See https://github.com/Microsoft/vscode/issues/35364
                    if (id === 'vscjava.vscode-java-pack') {
                        message = nls_1.localize('reallyRecommendedExtensionPack', "The '{0}' extension pack is recommended for this file type.", name);
                    }
                    var recommendationsAction = _this.instantiationService.createInstance(extensionsActions_1.ShowRecommendedExtensionsAction, extensionsActions_1.ShowRecommendedExtensionsAction.ID, nls_1.localize('showRecommendations', "Show Recommendations"));
                    var installAction = _this.instantiationService.createInstance(extensionsActions_1.InstallRecommendedExtensionAction, id);
                    var options = [
                        nls_1.localize('install', 'Install'),
                        recommendationsAction.label,
                        choiceNever,
                        choiceClose
                    ];
                    _this.choiceService.choose(severity_1.default.Info, message, options, 3).done(function (choice) {
                        switch (choice) {
                            case 0:
                                /* __GDPR__
                                    "extensionRecommendations:popup" : {
                                        "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                        "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                                    }
                                */
                                _this.telemetryService.publicLog('extensionRecommendations:popup', { userReaction: 'install', extensionId: name });
                                return installAction.run();
                            case 1:
                                /* __GDPR__
                                    "extensionRecommendations:popup" : {
                                        "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                        "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                                    }
                                */
                                _this.telemetryService.publicLog('extensionRecommendations:popup', { userReaction: 'show', extensionId: name });
                                return recommendationsAction.run();
                            case 2:
                                importantRecommendationsIgnoreList.push(id);
                                _this.storageService.store('extensionsAssistant/importantRecommendationsIgnore', JSON.stringify(importantRecommendationsIgnoreList), storage_1.StorageScope.GLOBAL);
                                /* __GDPR__
                                    "extensionRecommendations:popup" : {
                                        "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                        "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                                    }
                                */
                                _this.telemetryService.publicLog('extensionRecommendations:popup', { userReaction: 'neverShowAgain', extensionId: name });
                                return _this.ignoreExtensionRecommendations();
                            case 3:
                                /* __GDPR__
                                    "extensionRecommendations:popup" : {
                                        "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                        "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                                    }
                                */
                                _this.telemetryService.publicLog('extensionRecommendations:popup', { userReaction: 'close', extensionId: name });
                        }
                    }, function () {
                        /* __GDPR__
                            "extensionRecommendations:popup" : {
                                "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                            }
                        */
                        _this.telemetryService.publicLog('extensionRecommendations:popup', { userReaction: 'cancelled', extensionId: name });
                    });
                });
                var mimeTypesPromise = _this.getMimeTypes(uri.fsPath);
                winjs_base_1.TPromise.join([importantTipsPromise, mimeTypesPromise]).then(function (result) {
                    var fileExtensionSuggestionIgnoreList = JSON.parse(_this.storageService.get('extensionsAssistant/fileExtensionsSuggestionIgnore', storage_1.StorageScope.GLOBAL, '[]'));
                    var mimeTypes = result[1];
                    var fileExtension = paths.extname(uri.fsPath);
                    if (fileExtension) {
                        fileExtension = fileExtension.substr(1); // Strip the dot
                    }
                    if (hasSuggestion ||
                        !fileExtension ||
                        mimeTypes.length !== 1 ||
                        mimeTypes[0] !== mime_1.MIME_UNKNOWN ||
                        fileExtensionSuggestionIgnoreList.indexOf(fileExtension) > -1) {
                        return;
                    }
                    var keywords = _this.getKeywordsForExtension(fileExtension);
                    _this._galleryService.query({ text: "tag:\"__ext_" + fileExtension + "\" " + keywords.map(function (tag) { return "tag:\"" + tag + "\""; }) }).then(function (pager) {
                        if (!pager || !pager.firstPage || !pager.firstPage.length) {
                            return;
                        }
                        var message = nls_1.localize('showLanguageExtensions', "The Marketplace has extensions that can help with '.{0}' files", fileExtension);
                        var searchMarketplaceAction = _this.instantiationService.createInstance(editorStatus_1.ShowLanguageExtensionsAction, fileExtension);
                        var options = [
                            nls_1.localize('searchMarketplace', "Search Marketplace"),
                            choiceNever,
                            choiceClose
                        ];
                        _this.choiceService.choose(severity_1.default.Info, message, options, 2).done(function (choice) {
                            switch (choice) {
                                case 0:
                                    /* __GDPR__
                                        "fileExtensionSuggestion:popup" : {
                                            "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                            "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                                        }
                                    */
                                    _this.telemetryService.publicLog('fileExtensionSuggestion:popup', { userReaction: 'ok', fileExtension: fileExtension });
                                    searchMarketplaceAction.run();
                                    break;
                                case 1:
                                    fileExtensionSuggestionIgnoreList.push(fileExtension);
                                    _this.storageService.store('extensionsAssistant/fileExtensionsSuggestionIgnore', JSON.stringify(fileExtensionSuggestionIgnoreList), storage_1.StorageScope.GLOBAL);
                                    /* __GDPR__
                                        "fileExtensionSuggestion:popup" : {
                                            "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                            "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                                        }
                                    */
                                    _this.telemetryService.publicLog('fileExtensionSuggestion:popup', { userReaction: 'neverShowAgain', fileExtension: fileExtension });
                                case 2:
                                    /* __GDPR__
                                        "fileExtensionSuggestion:popup" : {
                                            "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                            "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                                        }
                                    */
                                    _this.telemetryService.publicLog('fileExtensionSuggestion:popup', { userReaction: 'close', fileExtension: fileExtension });
                                    break;
                            }
                        }, function () {
                            /* __GDPR__
                                "fileExtensionSuggestion:popup" : {
                                    "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                    "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                                }
                            */
                            _this.telemetryService.publicLog('fileExtensionSuggestion:popup', { userReaction: 'cancelled', fileExtension: fileExtension });
                        });
                    });
                });
            });
        };
        ExtensionTipsService.prototype._suggestWorkspaceRecommendations = function () {
            var _this = this;
            var storageKey = 'extensionsAssistant/workspaceRecommendationsIgnore';
            var config = this.configurationService.getValue(extensions_1.ConfigurationKey);
            return this.getWorkspaceRecommendations().then(function (allRecommendations) {
                if (!allRecommendations.length || config.ignoreRecommendations || config.showRecommendationsOnlyOnDemand || _this.storageService.getBoolean(storageKey, storage_1.StorageScope.WORKSPACE, false)) {
                    return;
                }
                return _this.extensionsService.getInstalled(extensionManagement_1.LocalExtensionType.User).done(function (local) {
                    var recommendations = allRecommendations
                        .filter(function (id) { return local.every(function (local) { return local.manifest.publisher.toLowerCase() + "." + local.manifest.name.toLowerCase() !== id; }); });
                    if (!recommendations.length) {
                        return;
                    }
                    var message = nls_1.localize('workspaceRecommended', "This workspace has extension recommendations.");
                    var showAction = _this.instantiationService.createInstance(extensionsActions_1.ShowRecommendedExtensionsAction, extensionsActions_1.ShowRecommendedExtensionsAction.ID, nls_1.localize('showRecommendations', "Show Recommendations"));
                    var installAllAction = _this.instantiationService.createInstance(extensionsActions_1.InstallWorkspaceRecommendedExtensionsAction, extensionsActions_1.InstallWorkspaceRecommendedExtensionsAction.ID, nls_1.localize('installAll', "Install All"));
                    var options = [
                        installAllAction.label,
                        showAction.label,
                        choiceNever,
                        choiceClose
                    ];
                    return _this.choiceService.choose(severity_1.default.Info, message, options, 3).done(function (choice) {
                        switch (choice) {
                            case 0:
                                /* __GDPR__
                                    "extensionRecommendations:popup" : {
                                        "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                    }
                                */
                                _this.telemetryService.publicLog('extensionWorkspaceRecommendations:popup', { userReaction: 'install' });
                                return installAllAction.run();
                            case 1:
                                /* __GDPR__
                                    "extensionRecommendations:popup" : {
                                        "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                    }
                                */
                                _this.telemetryService.publicLog('extensionWorkspaceRecommendations:popup', { userReaction: 'show' });
                                return showAction.run();
                            case 2:
                                /* __GDPR__
                                    "extensionRecommendations:popup" : {
                                        "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                    }
                                */
                                _this.telemetryService.publicLog('extensionWorkspaceRecommendations:popup', { userReaction: 'neverShowAgain' });
                                return _this.storageService.store(storageKey, true, storage_1.StorageScope.WORKSPACE);
                            case 3:
                                /* __GDPR__
                                    "extensionRecommendations:popup" : {
                                        "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                    }
                                */
                                _this.telemetryService.publicLog('extensionWorkspaceRecommendations:popup', { userReaction: 'close' });
                        }
                    }, function () {
                        /* __GDPR__
                            "extensionRecommendations:popup" : {
                                "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                            }
                        */
                        _this.telemetryService.publicLog('extensionWorkspaceRecommendations:popup', { userReaction: 'cancelled' });
                    });
                });
            });
        };
        ExtensionTipsService.prototype.ignoreExtensionRecommendations = function () {
            var _this = this;
            var message = nls_1.localize('ignoreExtensionRecommendations', "Do you want to ignore all extension recommendations?");
            var options = [
                nls_1.localize('ignoreAll', "Yes, Ignore All"),
                nls_1.localize('no', "No"),
                nls_1.localize('cancel', "Cancel")
            ];
            this.choiceService.choose(severity_1.default.Info, message, options, 2).done(function (choice) {
                switch (choice) {
                    case 0:// If the user ignores the current message and selects different file type
                        // we should hide all the stacked up messages as he has selected Yes, Ignore All
                        _this.messageService.hideAll();
                        return _this.setIgnoreRecommendationsConfig(true);
                    case 1: return _this.setIgnoreRecommendationsConfig(false);
                }
            });
        };
        ExtensionTipsService.prototype._suggestBasedOnExecutables = function () {
            var _this = this;
            var homeDir = os.homedir();
            var foundExecutables = new Set();
            var findExecutable = function (exeName, path) {
                return pfs.fileExists(path).then(function (exists) {
                    if (exists && !foundExecutables.has(exeName)) {
                        foundExecutables.add(exeName);
                        (product_1.default.exeBasedExtensionTips[exeName]['recommendations'] || [])
                            .forEach(function (x) {
                            if (product_1.default.exeBasedExtensionTips[exeName]['friendlyName']) {
                                _this._exeBasedRecommendations[x] = product_1.default.exeBasedExtensionTips[exeName]['friendlyName'];
                            }
                        });
                    }
                });
            };
            var promises = [];
            // Loop through recommended extensions
            collections_1.forEach(product_1.default.exeBasedExtensionTips, function (entry) {
                if (typeof entry.value !== 'object' || !Array.isArray(entry.value['recommendations'])) {
                    return;
                }
                var exeName = entry.key;
                if (process.platform === 'win32') {
                    var windowsPath = entry.value['windowsPath'];
                    if (!windowsPath || typeof windowsPath !== 'string') {
                        return;
                    }
                    windowsPath = windowsPath.replace('%USERPROFILE%', process.env['USERPROFILE'])
                        .replace('%ProgramFiles(x86)%', process.env['ProgramFiles(x86)'])
                        .replace('%ProgramFiles%', process.env['ProgramFiles'])
                        .replace('%APPDATA%', process.env['APPDATA']);
                    promises.push(findExecutable(exeName, windowsPath));
                }
                else {
                    promises.push(findExecutable(exeName, paths.join('/usr/local/bin', exeName)));
                    promises.push(findExecutable(exeName, paths.join(homeDir, exeName)));
                }
            });
            return winjs_base_1.TPromise.join(promises);
        };
        ExtensionTipsService.prototype.setIgnoreRecommendationsConfig = function (configVal) {
            this.configurationService.updateValue('extensions.ignoreRecommendations', configVal, configuration_1.ConfigurationTarget.USER);
            if (configVal) {
                var ignoreWorkspaceRecommendationsStorageKey = 'extensionsAssistant/workspaceRecommendationsIgnore';
                this.storageService.store(ignoreWorkspaceRecommendationsStorageKey, true, storage_1.StorageScope.WORKSPACE);
            }
        };
        ExtensionTipsService.prototype.getCachedDynamicWorkspaceRecommendations = function () {
            if (this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.FOLDER) {
                return;
            }
            var storageKey = 'extensionsAssistant/dynamicWorkspaceRecommendations';
            var storedRecommendationsJson = {};
            try {
                storedRecommendationsJson = JSON.parse(this.storageService.get(storageKey, storage_1.StorageScope.WORKSPACE, '{}'));
            }
            catch (e) {
                this.storageService.remove(storageKey, storage_1.StorageScope.WORKSPACE);
            }
            if (Array.isArray(storedRecommendationsJson['recommendations'])
                && types_1.isNumber(storedRecommendationsJson['timestamp'])
                && storedRecommendationsJson['timestamp'] > 0
                && (Date.now() - storedRecommendationsJson['timestamp']) / milliSecondsInADay < 14) {
                this._dynamicWorkspaceRecommendations = storedRecommendationsJson['recommendations'];
                /* __GDPR__
                    "dynamicWorkspaceRecommendations" : {
                        "count" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "cache" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog('dynamicWorkspaceRecommendations', { count: this._dynamicWorkspaceRecommendations.length, cache: 1 });
            }
        };
        ExtensionTipsService.prototype.getDynamicWorkspaceRecommendations = function () {
            var _this = this;
            if (this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.FOLDER
                || this._dynamicWorkspaceRecommendations.length
                || !this._extensionsRecommendationsUrl) {
                return winjs_base_1.TPromise.as(null);
            }
            var storageKey = 'extensionsAssistant/dynamicWorkspaceRecommendations';
            var workspaceUri = this.contextService.getWorkspace().folders[0].uri;
            return winjs_base_1.TPromise.join([workspaceStats_1.getHashedRemotesFromUri(workspaceUri, this.fileService, false), workspaceStats_1.getHashedRemotesFromUri(workspaceUri, this.fileService, true)]).then(function (_a) {
                var hashedRemotes1 = _a[0], hashedRemotes2 = _a[1];
                var hashedRemotes = (hashedRemotes1 || []).concat(hashedRemotes2 || []);
                if (!hashedRemotes.length) {
                    return null;
                }
                return _this.requestService.request({ type: 'GET', url: _this._extensionsRecommendationsUrl }).then(function (context) {
                    if (context.res.statusCode !== 200) {
                        return winjs_base_1.TPromise.as(null);
                    }
                    return request_2.asJson(context).then(function (result) {
                        var allRecommendations = Array.isArray(result['workspaceRecommendations']) ? result['workspaceRecommendations'] : [];
                        if (!allRecommendations.length) {
                            return;
                        }
                        var foundRemote = false;
                        for (var i = 0; i < hashedRemotes.length && !foundRemote; i++) {
                            for (var j = 0; j < allRecommendations.length && !foundRemote; j++) {
                                if (Array.isArray(allRecommendations[j].remoteSet) && allRecommendations[j].remoteSet.indexOf(hashedRemotes[i]) > -1) {
                                    foundRemote = true;
                                    _this._dynamicWorkspaceRecommendations = allRecommendations[j].recommendations || [];
                                    _this.storageService.store(storageKey, JSON.stringify({
                                        recommendations: _this._dynamicWorkspaceRecommendations,
                                        timestamp: Date.now()
                                    }), storage_1.StorageScope.WORKSPACE);
                                    /* __GDPR__
                                        "dynamicWorkspaceRecommendations" : {
                                            "count" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                            "cache" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                        }
                                    */
                                    _this.telemetryService.publicLog('dynamicWorkspaceRecommendations', { count: _this._dynamicWorkspaceRecommendations.length, cache: 0 });
                                }
                            }
                        }
                    });
                });
            });
        };
        ExtensionTipsService.prototype.getKeywordsForExtension = function (extension) {
            var keywords = product_1.default.extensionKeywords || {};
            return keywords[extension] || [];
        };
        ExtensionTipsService.prototype.getRecommendationsForExtension = function (extension) {
            var str = "." + extension;
            var result = Object.create(null);
            collections_1.forEach(product_1.default.extensionTips || empty, function (entry) {
                var id = entry.key, pattern = entry.value;
                if (glob_1.match(pattern, str)) {
                    result[id] = true;
                }
            });
            collections_1.forEach(product_1.default.extensionImportantTips || empty, function (entry) {
                var id = entry.key, value = entry.value;
                if (glob_1.match(value.pattern, str)) {
                    result[id] = true;
                }
            });
            return Object.keys(result);
        };
        ExtensionTipsService.prototype.dispose = function () {
            this._disposables = lifecycle_1.dispose(this._disposables);
        };
        ExtensionTipsService = __decorate([
            __param(0, extensionManagement_1.IExtensionGalleryService),
            __param(1, modelService_1.IModelService),
            __param(2, storage_1.IStorageService),
            __param(3, message_1.IChoiceService),
            __param(4, extensionManagement_1.IExtensionManagementService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, files_1.IFileService),
            __param(7, workspace_1.IWorkspaceContextService),
            __param(8, configuration_1.IConfigurationService),
            __param(9, message_1.IMessageService),
            __param(10, telemetry_1.ITelemetryService),
            __param(11, environment_1.IEnvironmentService),
            __param(12, extensions_2.IExtensionService),
            __param(13, request_1.IRequestService)
        ], ExtensionTipsService);
        return ExtensionTipsService;
    }(lifecycle_1.Disposable));
    exports.ExtensionTipsService = ExtensionTipsService;
});
