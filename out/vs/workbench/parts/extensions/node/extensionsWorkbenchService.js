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
define(["require", "exports", "vs/nls", "vs/base/node/pfs", "semver", "path", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/objects", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/base/common/paging", "vs/platform/telemetry/common/telemetry", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/platform/windows/common/windows", "vs/platform/message/common/message", "vs/base/common/severity", "vs/base/common/uri", "vs/workbench/parts/extensions/common/extensions", "vs/workbench/services/editor/common/editorService", "vs/platform/url/common/url", "vs/workbench/parts/extensions/common/extensionsInput", "vs/platform/node/product", "vs/platform/log/common/log", "vs/platform/progress/common/progress"], function (require, exports, nls, pfs_1, semver, path, event_1, arrays_1, objects_1, async_1, errors_1, winjs_base_1, lifecycle_1, paging_1, telemetry_1, extensionManagement_1, extensionManagementUtil_1, instantiation_1, configuration_1, windows_1, message_1, severity_1, uri_1, extensions_1, editorService_1, url_1, extensionsInput_1, product_1, log_1, progress_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Extension = /** @class */ (function () {
        function Extension(galleryService, stateProvider, local, gallery, telemetryService) {
            this.galleryService = galleryService;
            this.stateProvider = stateProvider;
            this.local = local;
            this.gallery = gallery;
            this.telemetryService = telemetryService;
            this.enablementState = extensionManagement_1.EnablementState.Enabled;
            this.isMalicious = false;
        }
        Object.defineProperty(Extension.prototype, "type", {
            get: function () {
                return this.local ? this.local.type : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "name", {
            get: function () {
                return this.gallery ? this.gallery.name : this.local.manifest.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "displayName", {
            get: function () {
                if (this.gallery) {
                    return this.gallery.displayName || this.gallery.name;
                }
                return this.local.manifest.displayName || this.local.manifest.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "id", {
            get: function () {
                if (this.gallery) {
                    return this.gallery.identifier.id;
                }
                return extensionManagementUtil_1.getGalleryExtensionIdFromLocal(this.local);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "uuid", {
            get: function () {
                return this.gallery ? this.gallery.identifier.uuid : this.local.identifier.uuid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "publisher", {
            get: function () {
                return this.gallery ? this.gallery.publisher : this.local.manifest.publisher;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "publisherDisplayName", {
            get: function () {
                if (this.gallery) {
                    return this.gallery.publisherDisplayName || this.gallery.publisher;
                }
                if (this.local.metadata && this.local.metadata.publisherDisplayName) {
                    return this.local.metadata.publisherDisplayName;
                }
                return this.local.manifest.publisher;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "version", {
            get: function () {
                return this.local ? this.local.manifest.version : this.gallery.version;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "latestVersion", {
            get: function () {
                return this.gallery ? this.gallery.version : this.local.manifest.version;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "description", {
            get: function () {
                return this.gallery ? this.gallery.description : this.local.manifest.description;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "url", {
            get: function () {
                if (!product_1.default.extensionsGallery) {
                    return null;
                }
                return product_1.default.extensionsGallery.itemUrl + "?itemName=" + this.publisher + "." + this.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "iconUrl", {
            get: function () {
                return this.galleryIconUrl || this.localIconUrl || this.defaultIconUrl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "iconUrlFallback", {
            get: function () {
                return this.galleryIconUrlFallback || this.localIconUrl || this.defaultIconUrl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "localIconUrl", {
            get: function () {
                return this.local && this.local.manifest.icon
                    && uri_1.default.file(path.join(this.local.path, this.local.manifest.icon)).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "galleryIconUrl", {
            get: function () {
                return this.gallery && this.gallery.assets.icon.uri;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "galleryIconUrlFallback", {
            get: function () {
                return this.gallery && this.gallery.assets.icon.fallbackUri;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "defaultIconUrl", {
            get: function () {
                return require.toUrl('../browser/media/defaultIcon.png');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "repository", {
            get: function () {
                return this.gallery && this.gallery.assets.repository.uri;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "licenseUrl", {
            get: function () {
                return this.gallery && this.gallery.assets.license && this.gallery.assets.license.uri;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "state", {
            get: function () {
                return this.stateProvider(this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "installCount", {
            get: function () {
                return this.gallery ? this.gallery.installCount : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "rating", {
            get: function () {
                return this.gallery ? this.gallery.rating : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "ratingCount", {
            get: function () {
                return this.gallery ? this.gallery.ratingCount : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "outdated", {
            get: function () {
                return !!this.gallery && this.type === extensionManagement_1.LocalExtensionType.User && semver.gt(this.latestVersion, this.version);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "telemetryData", {
            get: function () {
                var _a = this, local = _a.local, gallery = _a.gallery;
                if (gallery) {
                    return extensionManagementUtil_1.getGalleryExtensionTelemetryData(gallery);
                }
                else {
                    return extensionManagementUtil_1.getLocalExtensionTelemetryData(local);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "preview", {
            get: function () {
                return this.gallery ? this.gallery.preview : false;
            },
            enumerable: true,
            configurable: true
        });
        Extension.prototype.isGalleryOutdated = function () {
            return this.local && this.gallery && semver.gt(this.local.manifest.version, this.gallery.version);
        };
        Extension.prototype.getManifest = function () {
            if (this.gallery && !this.isGalleryOutdated()) {
                if (this.gallery.assets.manifest) {
                    return this.galleryService.getManifest(this.gallery);
                }
                this.telemetryService.publicLog('extensions:NotFoundManifest', this.telemetryData);
                return winjs_base_1.TPromise.wrapError(new Error('not available'));
            }
            return winjs_base_1.TPromise.as(this.local.manifest);
        };
        Extension.prototype.getReadme = function () {
            if (this.gallery && !this.isGalleryOutdated()) {
                if (this.gallery.assets.readme) {
                    return this.galleryService.getReadme(this.gallery);
                }
                this.telemetryService.publicLog('extensions:NotFoundReadMe', this.telemetryData);
            }
            if (this.local && this.local.readmeUrl) {
                var uri = uri_1.default.parse(this.local.readmeUrl);
                return pfs_1.readFile(uri.fsPath, 'utf8');
            }
            return winjs_base_1.TPromise.wrapError(new Error('not available'));
        };
        Extension.prototype.getChangelog = function () {
            if (this.gallery && this.gallery.assets.changelog && !this.isGalleryOutdated()) {
                return this.galleryService.getChangelog(this.gallery);
            }
            var changelogUrl = this.local && this.local.changelogUrl;
            if (!changelogUrl) {
                return winjs_base_1.TPromise.wrapError(new Error('not available'));
            }
            var uri = uri_1.default.parse(changelogUrl);
            if (uri.scheme === 'file') {
                return pfs_1.readFile(uri.fsPath, 'utf8');
            }
            return winjs_base_1.TPromise.wrapError(new Error('not available'));
        };
        Object.defineProperty(Extension.prototype, "dependencies", {
            get: function () {
                var _a = this, local = _a.local, gallery = _a.gallery;
                if (gallery && !this.isGalleryOutdated()) {
                    return gallery.properties.dependencies;
                }
                if (local && local.manifest.extensionDependencies) {
                    return local.manifest.extensionDependencies;
                }
                return [];
            },
            enumerable: true,
            configurable: true
        });
        return Extension;
    }());
    var ExtensionDependencies = /** @class */ (function () {
        function ExtensionDependencies(_extension, _identifier, _map, _dependent) {
            if (_dependent === void 0) { _dependent = null; }
            this._extension = _extension;
            this._identifier = _identifier;
            this._map = _map;
            this._dependent = _dependent;
            this._hasDependencies = null;
        }
        Object.defineProperty(ExtensionDependencies.prototype, "hasDependencies", {
            get: function () {
                if (this._hasDependencies === null) {
                    this._hasDependencies = this.computeHasDependencies();
                }
                return this._hasDependencies;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionDependencies.prototype, "extension", {
            get: function () {
                return this._extension;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionDependencies.prototype, "identifier", {
            get: function () {
                return this._identifier;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionDependencies.prototype, "dependent", {
            get: function () {
                return this._dependent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionDependencies.prototype, "dependencies", {
            get: function () {
                var _this = this;
                if (!this.hasDependencies) {
                    return [];
                }
                return this._extension.dependencies.map(function (d) { return new ExtensionDependencies(_this._map.get(d), d, _this._map, _this); });
            },
            enumerable: true,
            configurable: true
        });
        ExtensionDependencies.prototype.computeHasDependencies = function () {
            if (this._extension && this._extension.dependencies.length > 0) {
                var dependent = this._dependent;
                while (dependent !== null) {
                    if (dependent.identifier === this.identifier) {
                        return false;
                    }
                    dependent = dependent.dependent;
                }
                return true;
            }
            return false;
        };
        return ExtensionDependencies;
    }());
    var Operation;
    (function (Operation) {
        Operation[Operation["Installing"] = 0] = "Installing";
        Operation[Operation["Updating"] = 1] = "Updating";
        Operation[Operation["Uninstalling"] = 2] = "Uninstalling";
    })(Operation || (Operation = {}));
    function toTelemetryEventName(operation) {
        switch (operation) {
            case Operation.Installing: return 'extensionGallery:install';
            case Operation.Updating: return 'extensionGallery:update';
            case Operation.Uninstalling: return 'extensionGallery:uninstall';
        }
        return '';
    }
    var ExtensionsWorkbenchService = /** @class */ (function () {
        function ExtensionsWorkbenchService(instantiationService, editorService, extensionService, galleryService, configurationService, telemetryService, messageService, choiceService, urlService, extensionEnablementService, windowService, logService, progressService, extensionTipsService) {
            var _this = this;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.extensionService = extensionService;
            this.galleryService = galleryService;
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.messageService = messageService;
            this.choiceService = choiceService;
            this.extensionEnablementService = extensionEnablementService;
            this.windowService = windowService;
            this.logService = logService;
            this.progressService = progressService;
            this.extensionTipsService = extensionTipsService;
            this.installing = [];
            this.uninstalling = [];
            this.installed = [];
            this.disposables = [];
            this._onChange = new event_1.Emitter();
            this.stateProvider = function (ext) { return _this.getExtensionState(ext); };
            extensionService.onInstallExtension(this.onInstallExtension, this, this.disposables);
            extensionService.onDidInstallExtension(this.onDidInstallExtension, this, this.disposables);
            extensionService.onUninstallExtension(this.onUninstallExtension, this, this.disposables);
            extensionService.onDidUninstallExtension(this.onDidUninstallExtension, this, this.disposables);
            extensionEnablementService.onEnablementChanged(this.onEnablementChanged, this, this.disposables);
            this.syncDelayer = new async_1.ThrottledDelayer(ExtensionsWorkbenchService.SyncPeriod);
            this.autoUpdateDelayer = new async_1.ThrottledDelayer(1000);
            event_1.chain(urlService.onOpenURL)
                .filter(function (uri) { return /^extension/.test(uri.path); })
                .on(this.onOpenExtensionUrl, this, this.disposables);
            this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(extensions_1.AutoUpdateConfigurationKey)) {
                    if (_this.isAutoUpdateEnabled()) {
                        _this.checkForUpdates();
                    }
                }
            }, this, this.disposables);
            this.queryLocal().done(function () { return _this.eventuallySyncWithGallery(true); });
        }
        Object.defineProperty(ExtensionsWorkbenchService.prototype, "onChange", {
            get: function () { return this._onChange.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtensionsWorkbenchService.prototype, "local", {
            get: function () {
                var _this = this;
                var installing = this.installing
                    .filter(function (e) { return !_this.installed.some(function (installed) { return installed.id === e.extension.id; }); })
                    .map(function (e) { return e.extension; });
                return this.installed.concat(installing);
            },
            enumerable: true,
            configurable: true
        });
        ExtensionsWorkbenchService.prototype.queryLocal = function () {
            var _this = this;
            return this.extensionService.getInstalled().then(function (result) {
                var installedById = arrays_1.index(_this.installed, function (e) { return e.local.identifier.id; });
                _this.installed = result.map(function (local) {
                    var extension = installedById[local.identifier.id] || new Extension(_this.galleryService, _this.stateProvider, local, null, _this.telemetryService);
                    extension.local = local;
                    extension.enablementState = _this.extensionEnablementService.getEnablementState({ id: extension.id, uuid: extension.uuid });
                    return extension;
                });
                _this._onChange.fire();
                return _this.local;
            });
        };
        ExtensionsWorkbenchService.prototype.queryGallery = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return this.extensionService.getExtensionsReport().then(function (report) {
                var maliciousSet = extensionManagementUtil_1.getMaliciousExtensionsSet(report);
                return _this.galleryService.query(options)
                    .then(function (result) { return paging_1.mapPager(result, function (gallery) { return _this.fromGallery(gallery, maliciousSet); }); })
                    .then(null, function (err) {
                    if (/No extension gallery service configured/.test(err.message)) {
                        return winjs_base_1.TPromise.as(paging_1.singlePagePager([]));
                    }
                    return winjs_base_1.TPromise.wrapError(err);
                });
            });
        };
        ExtensionsWorkbenchService.prototype.loadDependencies = function (extension) {
            var _this = this;
            if (!extension.dependencies.length) {
                return winjs_base_1.TPromise.wrap(null);
            }
            return this.extensionService.getExtensionsReport().then(function (report) {
                var maliciousSet = extensionManagementUtil_1.getMaliciousExtensionsSet(report);
                return _this.galleryService.loadAllDependencies(extension.dependencies.map(function (id) { return ({ id: id }); }))
                    .then(function (galleryExtensions) { return galleryExtensions.map(function (galleryExtension) { return _this.fromGallery(galleryExtension, maliciousSet); }); })
                    .then(function (extensions) { return _this.local.concat(extensions); })
                    .then(function (extensions) {
                    var map = new Map();
                    for (var _i = 0, extensions_2 = extensions; _i < extensions_2.length; _i++) {
                        var extension_1 = extensions_2[_i];
                        map.set(extension_1.id, extension_1);
                    }
                    return new ExtensionDependencies(extension, extension.id, map);
                });
            });
        };
        ExtensionsWorkbenchService.prototype.open = function (extension, sideByside) {
            if (sideByside === void 0) { sideByside = false; }
            return this.editorService.openEditor(this.instantiationService.createInstance(extensionsInput_1.ExtensionsInput, extension), null, sideByside);
        };
        ExtensionsWorkbenchService.prototype.fromGallery = function (gallery, maliciousExtensionSet) {
            var _this = this;
            var result = this.getInstalledExtensionMatchingGallery(gallery);
            if (result) {
                // Loading the compatible version only there is an engine property
                // Otherwise falling back to old way so that we will not make many roundtrips
                if (gallery.properties.engine) {
                    this.galleryService.loadCompatibleVersion(gallery)
                        .then(function (compatible) { return compatible ? _this.syncLocalWithGalleryExtension(result, compatible) : null; });
                }
                else {
                    this.syncLocalWithGalleryExtension(result, gallery);
                }
            }
            else {
                result = new Extension(this.galleryService, this.stateProvider, null, gallery, this.telemetryService);
            }
            if (maliciousExtensionSet.has(result.id)) {
                result.isMalicious = true;
            }
            return result;
        };
        ExtensionsWorkbenchService.prototype.getInstalledExtensionMatchingGallery = function (gallery) {
            for (var _i = 0, _a = this.installed; _i < _a.length; _i++) {
                var installed = _a[_i];
                if (installed.uuid) {
                    if (installed.uuid === gallery.identifier.uuid) {
                        return installed;
                    }
                }
                else {
                    if (installed.id === gallery.identifier.id) {
                        return installed;
                    }
                }
            }
            return null;
        };
        ExtensionsWorkbenchService.prototype.syncLocalWithGalleryExtension = function (local, gallery) {
            var _this = this;
            // Sync the local extension with gallery extension if local extension doesnot has metadata
            (local.local.metadata ? winjs_base_1.TPromise.as(local.local) : this.extensionService.updateMetadata(local.local, { id: gallery.identifier.uuid, publisherDisplayName: gallery.publisherDisplayName, publisherId: gallery.publisherId }))
                .then(function (localExtension) {
                local.local = localExtension;
                local.gallery = gallery;
                _this._onChange.fire();
                _this.eventuallyAutoUpdateExtensions();
            });
        };
        ExtensionsWorkbenchService.prototype.checkForUpdates = function () {
            var _this = this;
            return this.syncDelayer.trigger(function () { return _this.syncWithGallery(); }, 0);
        };
        ExtensionsWorkbenchService.prototype.isAutoUpdateEnabled = function () {
            return this.configurationService.getValue(extensions_1.AutoUpdateConfigurationKey);
        };
        ExtensionsWorkbenchService.prototype.eventuallySyncWithGallery = function (immediate) {
            var _this = this;
            if (immediate === void 0) { immediate = false; }
            var loop = function () { return _this.syncWithGallery().then(function () { return _this.eventuallySyncWithGallery(); }); };
            var delay = immediate ? 0 : ExtensionsWorkbenchService.SyncPeriod;
            this.syncDelayer.trigger(loop, delay)
                .done(null, function (err) { return null; });
        };
        ExtensionsWorkbenchService.prototype.syncWithGallery = function () {
            var ids = [], names = [];
            for (var _i = 0, _a = this.installed; _i < _a.length; _i++) {
                var installed = _a[_i];
                if (installed.type === extensionManagement_1.LocalExtensionType.User) {
                    if (installed.uuid) {
                        ids.push(installed.uuid);
                    }
                    else {
                        names.push(installed.id);
                    }
                }
            }
            var promises = [];
            if (ids.length) {
                promises.push(this.queryGallery({ ids: ids, pageSize: ids.length }));
            }
            if (names.length) {
                promises.push(this.queryGallery({ names: names, pageSize: names.length }));
            }
            return winjs_base_1.TPromise.join(promises);
        };
        ExtensionsWorkbenchService.prototype.eventuallyAutoUpdateExtensions = function () {
            var _this = this;
            this.autoUpdateDelayer.trigger(function () { return _this.autoUpdateExtensions(); })
                .done(null, function (err) { return null; });
        };
        ExtensionsWorkbenchService.prototype.autoUpdateExtensions = function () {
            var _this = this;
            if (!this.isAutoUpdateEnabled()) {
                return winjs_base_1.TPromise.as(null);
            }
            var toUpdate = this.local.filter(function (e) { return e.outdated && (e.state !== extensions_1.ExtensionState.Installing); });
            return winjs_base_1.TPromise.join(toUpdate.map(function (e) { return _this.install(e); }));
        };
        ExtensionsWorkbenchService.prototype.canInstall = function (extension) {
            if (!(extension instanceof Extension)) {
                return false;
            }
            if (extension.isMalicious) {
                return false;
            }
            return !!extension.gallery;
        };
        ExtensionsWorkbenchService.prototype.install = function (extension) {
            var _this = this;
            if (typeof extension === 'string') {
                return this.progressService.withProgress({
                    location: progress_1.ProgressLocation.Extensions,
                    title: nls.localize('installingVSIXExtension', 'Installing extension from VSIX...'),
                    tooltip: "" + extension
                }, function () { return _this.extensionService.install(extension); });
            }
            if (!(extension instanceof Extension)) {
                return undefined;
            }
            if (extension.isMalicious) {
                return winjs_base_1.TPromise.wrapError(new Error(nls.localize('malicious', "This extension is reported to be problematic.")));
            }
            var ext = extension;
            var gallery = ext.gallery;
            if (!gallery) {
                return winjs_base_1.TPromise.wrapError(new Error('Missing gallery'));
            }
            return this.progressService.withProgress({
                location: progress_1.ProgressLocation.Extensions,
                title: nls.localize('installingMarketPlaceExtension', 'Installing extension from Marketplace....'),
                tooltip: "" + extension.id
            }, function () { return _this.extensionService.installFromGallery(gallery); });
        };
        ExtensionsWorkbenchService.prototype.setEnablement = function (extension, enablementState) {
            var _this = this;
            if (extension.type === extensionManagement_1.LocalExtensionType.System) {
                return winjs_base_1.TPromise.wrap(void 0);
            }
            var enable = enablementState === extensionManagement_1.EnablementState.Enabled || enablementState === extensionManagement_1.EnablementState.WorkspaceEnabled;
            return this.promptAndSetEnablement(extension, enablementState, enable).then(function (reload) {
                /* __GDPR__
                    "extension:enable" : {
                        "${include}": [
                            "${GalleryExtensionTelemetryData}"
                        ]
                    }
                */
                /* __GDPR__
                    "extension:disable" : {
                        "${include}": [
                            "${GalleryExtensionTelemetryData}"
                        ]
                    }
                */
                _this.telemetryService.publicLog(enable ? 'extension:enable' : 'extension:disable', extension.telemetryData);
            });
        };
        ExtensionsWorkbenchService.prototype.uninstall = function (extension) {
            var _this = this;
            if (!(extension instanceof Extension)) {
                return undefined;
            }
            var ext = extension;
            var local = ext.local || this.installed.filter(function (e) { return e.id === extension.id; })[0].local;
            if (!local) {
                return winjs_base_1.TPromise.wrapError(new Error('Missing local'));
            }
            this.logService.info("Requested uninstalling the extension " + extension.id + " from window " + this.windowService.getCurrentWindowId());
            return this.progressService.withProgress({
                location: progress_1.ProgressLocation.Extensions,
                title: nls.localize('uninstallingExtension', 'Uninstalling extension....'),
                tooltip: "" + local.identifier.id
            }, function () { return _this.extensionService.uninstall(local); });
        };
        ExtensionsWorkbenchService.prototype.promptAndSetEnablement = function (extension, enablementState, enable) {
            var allDependencies = this.getDependenciesRecursively(extension, this.local, enablementState, []);
            if (allDependencies.length > 0) {
                if (enable) {
                    return this.promptForDependenciesAndEnable(extension, allDependencies, enablementState, enable);
                }
                else {
                    return this.promptForDependenciesAndDisable(extension, allDependencies, enablementState, enable);
                }
            }
            return this.checkAndSetEnablement(extension, [], enablementState, enable);
        };
        ExtensionsWorkbenchService.prototype.promptForDependenciesAndEnable = function (extension, dependencies, enablementState, enable) {
            var _this = this;
            var message = nls.localize('enableDependeciesConfirmation', "Enabling '{0}' also enables its dependencies. Would you like to continue?", extension.displayName);
            var options = [
                nls.localize('enable', "Yes"),
                nls.localize('doNotEnable', "No")
            ];
            return this.choiceService.choose(severity_1.default.Info, message, options, 1, true)
                .then(function (value) {
                if (value === 0) {
                    return _this.checkAndSetEnablement(extension, dependencies, enablementState, enable);
                }
                return winjs_base_1.TPromise.as(null);
            });
        };
        ExtensionsWorkbenchService.prototype.promptForDependenciesAndDisable = function (extension, dependencies, enablementState, enable) {
            var _this = this;
            var message = nls.localize('disableDependeciesConfirmation', "Would you like to disable '{0}' only or its dependencies also?", extension.displayName);
            var options = [
                nls.localize('disableOnly', "Only"),
                nls.localize('disableAll', "All"),
                nls.localize('cancel', "Cancel")
            ];
            return this.choiceService.choose(severity_1.default.Info, message, options, 2, true)
                .then(function (value) {
                if (value === 0) {
                    return _this.checkAndSetEnablement(extension, [], enablementState, enable);
                }
                if (value === 1) {
                    return _this.checkAndSetEnablement(extension, dependencies, enablementState, enable);
                }
                return winjs_base_1.TPromise.as(null);
            });
        };
        ExtensionsWorkbenchService.prototype.checkAndSetEnablement = function (extension, dependencies, enablementState, enable) {
            var _this = this;
            if (!enable) {
                var dependents = this.getDependentsAfterDisablement(extension, dependencies, this.local, enablementState);
                if (dependents.length) {
                    return winjs_base_1.TPromise.wrapError(new Error(this.getDependentsErrorMessage(extension, dependents)));
                }
            }
            return winjs_base_1.TPromise.join([extension].concat(dependencies).map(function (e) { return _this.doSetEnablement(e, enablementState); }));
        };
        ExtensionsWorkbenchService.prototype.getDependenciesRecursively = function (extension, installed, enablementState, checked) {
            if (checked.indexOf(extension) !== -1) {
                return [];
            }
            checked.push(extension);
            if (!extension.dependencies || extension.dependencies.length === 0) {
                return [];
            }
            var dependenciesToDisable = installed.filter(function (i) {
                // Do not include extensions which are already disabled and request is to disable
                if (i.enablementState === enablementState && (i.enablementState === extensionManagement_1.EnablementState.WorkspaceDisabled || i.enablementState === extensionManagement_1.EnablementState.Disabled)) {
                    return false;
                }
                return i.type === extensionManagement_1.LocalExtensionType.User && extension.dependencies.indexOf(i.id) !== -1;
            });
            var depsOfDeps = [];
            for (var _i = 0, dependenciesToDisable_1 = dependenciesToDisable; _i < dependenciesToDisable_1.length; _i++) {
                var dep = dependenciesToDisable_1[_i];
                depsOfDeps.push.apply(depsOfDeps, this.getDependenciesRecursively(dep, installed, enablementState, checked));
            }
            return dependenciesToDisable.concat(depsOfDeps);
        };
        ExtensionsWorkbenchService.prototype.getDependentsAfterDisablement = function (extension, dependencies, installed, enablementState) {
            return installed.filter(function (i) {
                if (i.dependencies.length === 0) {
                    return false;
                }
                if (i === extension) {
                    return false;
                }
                if (i.enablementState === extensionManagement_1.EnablementState.WorkspaceDisabled || i.enablementState === extensionManagement_1.EnablementState.Disabled) {
                    return false;
                }
                if (dependencies.indexOf(i) !== -1) {
                    return false;
                }
                return i.dependencies.some(function (dep) {
                    if (extension.id === dep) {
                        return true;
                    }
                    return dependencies.some(function (d) { return d.id === dep; });
                });
            });
        };
        ExtensionsWorkbenchService.prototype.getDependentsErrorMessage = function (extension, dependents) {
            if (dependents.length === 1) {
                return nls.localize('singleDependentError', "Cannot disable extension '{0}'. Extension '{1}' depends on this.", extension.displayName, dependents[0].displayName);
            }
            if (dependents.length === 2) {
                return nls.localize('twoDependentsError', "Cannot disable extension '{0}'. Extensions '{1}' and '{2}' depend on this.", extension.displayName, dependents[0].displayName, dependents[1].displayName);
            }
            return nls.localize('multipleDependentsError', "Cannot disable extension '{0}'. Extensions '{1}', '{2}' and others depend on this.", extension.displayName, dependents[0].displayName, dependents[1].displayName);
        };
        ExtensionsWorkbenchService.prototype.doSetEnablement = function (extension, enablementState) {
            return this.extensionEnablementService.setEnablement(extension.local, enablementState);
        };
        Object.defineProperty(ExtensionsWorkbenchService.prototype, "allowedBadgeProviders", {
            get: function () {
                if (!this._extensionAllowedBadgeProviders) {
                    this._extensionAllowedBadgeProviders = (product_1.default.extensionAllowedBadgeProviders || []).map(function (s) { return s.toLowerCase(); });
                }
                return this._extensionAllowedBadgeProviders;
            },
            enumerable: true,
            configurable: true
        });
        ExtensionsWorkbenchService.prototype.onInstallExtension = function (event) {
            var gallery = event.gallery;
            if (!gallery) {
                return;
            }
            var extension = this.installed.filter(function (e) { return extensionManagementUtil_1.areSameExtensions(e, gallery.identifier); })[0];
            if (!extension) {
                extension = new Extension(this.galleryService, this.stateProvider, null, gallery, this.telemetryService);
            }
            extension.gallery = gallery;
            var start = new Date();
            var operation = Operation.Installing;
            this.installing.push({ operation: operation, extension: extension, start: start });
            this._onChange.fire();
        };
        ExtensionsWorkbenchService.prototype.onDidInstallExtension = function (event) {
            var local = event.local, zipPath = event.zipPath, error = event.error, gallery = event.gallery;
            var installingExtension = gallery ? this.installing.filter(function (e) { return extensionManagementUtil_1.areSameExtensions(e.extension, gallery.identifier); })[0] : null;
            var extension = installingExtension ? installingExtension.extension : zipPath ? new Extension(this.galleryService, this.stateProvider, null, null, this.telemetryService) : null;
            if (extension) {
                this.installing = installingExtension ? this.installing.filter(function (e) { return e !== installingExtension; }) : this.installing;
                if (error) {
                    if (extension.gallery) {
                        // Updating extension can be only a gallery extension
                        var installed = this.installed.filter(function (e) { return e.id === extension.id; })[0];
                        if (installed && installingExtension) {
                            installingExtension.operation = Operation.Updating;
                        }
                    }
                }
                else {
                    extension.local = local;
                    var installed = this.installed.filter(function (e) { return e.id === extension.id; })[0];
                    if (installed) {
                        if (installingExtension) {
                            installingExtension.operation = Operation.Updating;
                        }
                        installed.local = local;
                    }
                    else {
                        this.installed.push(extension);
                    }
                }
                if (extension.gallery) {
                    // Report telemetry only for gallery extensions
                    this.reportTelemetry(installingExtension, error);
                }
            }
            this._onChange.fire();
        };
        ExtensionsWorkbenchService.prototype.onUninstallExtension = function (_a) {
            var id = _a.id;
            this.logService.info("Uninstalling the extension " + id + " from window " + this.windowService.getCurrentWindowId());
            var extension = this.installed.filter(function (e) { return e.local.identifier.id === id; })[0];
            var newLength = this.installed.filter(function (e) { return e.local.identifier.id !== id; }).length;
            // TODO: Ask @Joao why is this?
            if (newLength === this.installed.length) {
                return;
            }
            var start = new Date();
            var operation = Operation.Uninstalling;
            var uninstalling = this.uninstalling.filter(function (e) { return e.extension.local.identifier.id === id; })[0] || { id: id, operation: operation, extension: extension, start: start };
            this.uninstalling = [uninstalling].concat(this.uninstalling.filter(function (e) { return e.extension.local.identifier.id !== id; }));
            this._onChange.fire();
        };
        ExtensionsWorkbenchService.prototype.onDidUninstallExtension = function (_a) {
            var identifier = _a.identifier, error = _a.error;
            var id = identifier.id;
            if (!error) {
                this.installed = this.installed.filter(function (e) { return e.local.identifier.id !== id; });
            }
            var uninstalling = this.uninstalling.filter(function (e) { return e.extension.local.identifier.id === id; })[0];
            this.uninstalling = this.uninstalling.filter(function (e) { return e.extension.local.identifier.id !== id; });
            if (!uninstalling) {
                return;
            }
            if (!error) {
                this.reportTelemetry(uninstalling);
            }
            this._onChange.fire();
        };
        ExtensionsWorkbenchService.prototype.onEnablementChanged = function (extensionIdentifier) {
            var extension = this.local.filter(function (e) { return extensionManagementUtil_1.areSameExtensions(e, extensionIdentifier); })[0];
            if (extension) {
                var enablementState = this.extensionEnablementService.getEnablementState({ id: extension.id, uuid: extension.uuid });
                if (enablementState !== extension.enablementState) {
                    extension.enablementState = enablementState;
                    this._onChange.fire();
                }
            }
        };
        ExtensionsWorkbenchService.prototype.getExtensionState = function (extension) {
            if (extension.gallery && this.installing.some(function (e) { return e.extension.gallery && extensionManagementUtil_1.areSameExtensions(e.extension.gallery.identifier, extension.gallery.identifier); })) {
                return extensions_1.ExtensionState.Installing;
            }
            if (this.uninstalling.some(function (e) { return e.extension.id === extension.id; })) {
                return extensions_1.ExtensionState.Uninstalling;
            }
            var local = this.installed.filter(function (e) { return e === extension || (e.gallery && extension.gallery && extensionManagementUtil_1.areSameExtensions(e.gallery.identifier, extension.gallery.identifier)); })[0];
            return local ? extensions_1.ExtensionState.Installed : extensions_1.ExtensionState.Uninstalled;
        };
        ExtensionsWorkbenchService.prototype.reportTelemetry = function (active, errorcode) {
            var data = active.extension.telemetryData;
            var duration = new Date().getTime() - active.start.getTime();
            var eventName = toTelemetryEventName(active.operation);
            var extRecommendations = this.extensionTipsService.getAllRecommendationsWithReason() || {};
            var recommendationsData = extRecommendations[active.extension.id.toLowerCase()] ? { recommendationReason: extRecommendations[active.extension.id.toLowerCase()].reasonId } : {};
            /* __GDPR__
                "extensionGallery:install" : {
                    "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "errorcode": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            /* __GDPR__
                "extensionGallery:update" : {
                    "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "errorcode": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            /* __GDPR__
                "extensionGallery:uninstall" : {
                    "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "errorcode": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            this.telemetryService.publicLog(eventName, objects_1.assign(data, { success: !errorcode, duration: duration, errorcode: errorcode }, recommendationsData));
        };
        ExtensionsWorkbenchService.prototype.onError = function (err) {
            if (errors_1.isPromiseCanceledError(err)) {
                return;
            }
            var message = err && err.message || '';
            if (/getaddrinfo ENOTFOUND|getaddrinfo ENOENT|connect EACCES|connect ECONNREFUSED/.test(message)) {
                return;
            }
            this.messageService.show(severity_1.default.Error, err);
        };
        ExtensionsWorkbenchService.prototype.onOpenExtensionUrl = function (uri) {
            var _this = this;
            var match = /^extension\/([^/]+)$/.exec(uri.path);
            if (!match) {
                return;
            }
            var extensionId = match[1];
            this.queryLocal().then(function (local) {
                var extension = local.filter(function (local) { return local.id === extensionId; })[0];
                if (extension) {
                    return _this.windowService.show()
                        .then(function () { return _this.open(extension); });
                }
                return _this.queryGallery({ names: [extensionId], source: 'uri' }).then(function (result) {
                    if (result.total < 1) {
                        return winjs_base_1.TPromise.as(null);
                    }
                    var extension = result.firstPage[0];
                    return _this.windowService.show().then(function () {
                        return _this.open(extension).then(function () {
                            var message = nls.localize('installConfirmation', "Would you like to install the '{0}' extension?", extension.displayName, extension.publisher);
                            var options = [
                                nls.localize('install', "Install"),
                                nls.localize('cancel', "Cancel")
                            ];
                            return _this.choiceService.choose(severity_1.default.Info, message, options, 2, false).then(function (value) {
                                if (value !== 0) {
                                    return winjs_base_1.TPromise.as(null);
                                }
                                return _this.install(extension);
                            });
                        });
                    });
                });
            }).done(undefined, function (error) { return _this.onError(error); });
        };
        ExtensionsWorkbenchService.prototype.dispose = function () {
            this.syncDelayer.cancel();
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        ExtensionsWorkbenchService.SyncPeriod = 1000 * 60 * 60 * 12; // 12 hours
        ExtensionsWorkbenchService = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, extensionManagement_1.IExtensionManagementService),
            __param(3, extensionManagement_1.IExtensionGalleryService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, telemetry_1.ITelemetryService),
            __param(6, message_1.IMessageService),
            __param(7, message_1.IChoiceService),
            __param(8, url_1.IURLService),
            __param(9, extensionManagement_1.IExtensionEnablementService),
            __param(10, windows_1.IWindowService),
            __param(11, log_1.ILogService),
            __param(12, progress_1.IProgressService2),
            __param(13, extensionManagement_1.IExtensionTipsService)
        ], ExtensionsWorkbenchService);
        return ExtensionsWorkbenchService;
    }());
    exports.ExtensionsWorkbenchService = ExtensionsWorkbenchService;
});
