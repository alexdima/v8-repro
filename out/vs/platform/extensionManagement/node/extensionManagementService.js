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
define(["require", "exports", "vs/nls", "path", "vs/base/node/pfs", "vs/base/common/errors", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/base/node/zip", "vs/base/common/winjs.base", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "../common/extensionNls", "vs/platform/environment/common/environment", "vs/base/common/async", "vs/base/common/event", "semver", "vs/base/common/uri", "vs/platform/message/common/message", "vs/platform/node/package", "vs/base/common/platform", "vs/platform/log/common/log", "vs/platform/extensionManagement/node/extensionsManifestCache"], function (require, exports, nls, path, pfs, errors, objects_1, lifecycle_1, arrays_1, zip_1, winjs_base_1, extensionManagement_1, extensionManagementUtil_1, extensionNls_1, environment_1, async_1, event_1, semver, uri_1, message_1, package_1, platform_1, log_1, extensionsManifestCache_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SystemExtensionsRoot = path.normalize(path.join(uri_1.default.parse(require.toUrl('')).fsPath, '..', 'extensions'));
    var ERROR_SCANNING_SYS_EXTENSIONS = 'scanningSystem';
    var ERROR_SCANNING_USER_EXTENSIONS = 'scanningUser';
    var INSTALL_ERROR_UNSET_UNINSTALLED = 'unsetUninstalled';
    var INSTALL_ERROR_INCOMPATIBLE = 'incompatible';
    var INSTALL_ERROR_DOWNLOADING = 'downloading';
    var INSTALL_ERROR_VALIDATING = 'validating';
    var INSTALL_ERROR_GALLERY = 'gallery';
    var INSTALL_ERROR_LOCAL = 'local';
    var INSTALL_ERROR_EXTRACTING = 'extracting';
    var INSTALL_ERROR_DELETING = 'deleting';
    var INSTALL_ERROR_READING_EXTENSION_FROM_DISK = 'readingExtension';
    var INSTALL_ERROR_SAVING_METADATA = 'savingMetadata';
    var INSTALL_ERROR_UNKNOWN = 'unknown';
    var ExtensionManagementError = /** @class */ (function (_super) {
        __extends(ExtensionManagementError, _super);
        function ExtensionManagementError(message, code) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            return _this;
        }
        return ExtensionManagementError;
    }(Error));
    exports.ExtensionManagementError = ExtensionManagementError;
    function parseManifest(raw) {
        return new winjs_base_1.TPromise(function (c, e) {
            try {
                var manifest = JSON.parse(raw);
                var metadata = manifest.__metadata || null;
                delete manifest.__metadata;
                c({ manifest: manifest, metadata: metadata });
            }
            catch (err) {
                e(new Error(nls.localize('invalidManifest', "Extension invalid: package.json is not a JSON file.")));
            }
        });
    }
    function validateLocalExtension(zipPath) {
        return zip_1.buffer(zipPath, 'extension/package.json')
            .then(function (buffer) { return parseManifest(buffer.toString('utf8')); })
            .then(function (_a) {
            var manifest = _a.manifest;
            return winjs_base_1.TPromise.as(manifest);
        });
    }
    exports.validateLocalExtension = validateLocalExtension;
    function readManifest(extensionPath) {
        var promises = [
            pfs.readFile(path.join(extensionPath, 'package.json'), 'utf8')
                .then(function (raw) { return parseManifest(raw); }),
            pfs.readFile(path.join(extensionPath, 'package.nls.json'), 'utf8')
                .then(null, function (err) { return err.code !== 'ENOENT' ? winjs_base_1.TPromise.wrapError(err) : '{}'; })
                .then(function (raw) { return JSON.parse(raw); })
        ];
        return winjs_base_1.TPromise.join(promises).then(function (_a) {
            var _b = _a[0], manifest = _b.manifest, metadata = _b.metadata, translations = _a[1];
            return {
                manifest: extensionNls_1.localizeManifest(manifest, translations),
                metadata: metadata
            };
        });
    }
    var ExtensionManagementService = /** @class */ (function (_super) {
        __extends(ExtensionManagementService, _super);
        function ExtensionManagementService(environmentService, choiceService, galleryService, logService) {
            var _this = _super.call(this) || this;
            _this.choiceService = choiceService;
            _this.galleryService = galleryService;
            _this.logService = logService;
            _this.lastReportTimestamp = 0;
            _this.installingExtensions = new Map();
            _this._onInstallExtension = new event_1.Emitter();
            _this.onInstallExtension = _this._onInstallExtension.event;
            _this._onDidInstallExtension = new event_1.Emitter();
            _this.onDidInstallExtension = _this._onDidInstallExtension.event;
            _this._onUninstallExtension = new event_1.Emitter();
            _this.onUninstallExtension = _this._onUninstallExtension.event;
            _this._onDidUninstallExtension = new event_1.Emitter();
            _this.onDidUninstallExtension = _this._onDidUninstallExtension.event;
            _this.extensionsPath = environmentService.extensionsPath;
            _this.uninstalledPath = path.join(_this.extensionsPath, '.obsolete');
            _this.uninstalledFileLimiter = new async_1.Limiter(1);
            _this._register(lifecycle_1.toDisposable(function () { return _this.installingExtensions.clear(); }));
            _this.manifestCache = _this._register(new extensionsManifestCache_1.ExtensionsManifestCache(environmentService, _this));
            return _this;
        }
        ExtensionManagementService.prototype.install = function (zipPath) {
            var _this = this;
            zipPath = path.resolve(zipPath);
            return validateLocalExtension(zipPath)
                .then(function (manifest) {
                var identifier = { id: getLocalExtensionIdFromManifest(manifest) };
                return _this.unsetUninstalledAndRemove(identifier.id)
                    .then(function () { return _this.checkOutdated(manifest)
                    .then(function (validated) {
                    if (validated) {
                        _this.logService.info('Installing the extension:', identifier.id);
                        _this._onInstallExtension.fire({ identifier: identifier, zipPath: zipPath });
                        return _this.getMetadata(extensionManagementUtil_1.getGalleryExtensionId(manifest.publisher, manifest.name))
                            .then(function (metadata) { return _this.installFromZipPath(identifier, zipPath, metadata, manifest); }, function (error) { return _this.installFromZipPath(identifier, zipPath, null, manifest); })
                            .then(function () { return _this.logService.info('Successfully installed the extension:', identifier.id); }, function (e) {
                            _this.logService.error('Failed to install the extension:', identifier.id, e.message);
                            return winjs_base_1.TPromise.wrapError(e);
                        });
                    }
                    return null;
                }); }, function (e) { return winjs_base_1.TPromise.wrapError(new Error(nls.localize('restartCode', "Please restart Code before reinstalling {0}.", manifest.displayName || manifest.name))); });
            });
        };
        ExtensionManagementService.prototype.unsetUninstalledAndRemove = function (id) {
            var _this = this;
            return this.isUninstalled(id)
                .then(function (isUninstalled) {
                if (isUninstalled) {
                    _this.logService.trace('Removing the extension:', id);
                    var extensionPath = path.join(_this.extensionsPath, id);
                    return pfs.rimraf(extensionPath)
                        .then(function () { return _this.unsetUninstalled(id); })
                        .then(function () { return _this.logService.info('Removed the extension:', id); });
                }
                return null;
            });
        };
        ExtensionManagementService.prototype.checkOutdated = function (manifest) {
            var _this = this;
            var extensionIdentifier = { id: extensionManagementUtil_1.getGalleryExtensionId(manifest.publisher, manifest.name) };
            return this.getInstalled(extensionManagement_1.LocalExtensionType.User)
                .then(function (installedExtensions) {
                var newer = installedExtensions.filter(function (local) { return extensionManagementUtil_1.areSameExtensions(extensionIdentifier, { id: extensionManagementUtil_1.getGalleryExtensionIdFromLocal(local) }) && semver.gt(local.manifest.version, manifest.version); })[0];
                if (newer) {
                    var message = nls.localize('installingOutdatedExtension', "A newer version of this extension is already installed. Would you like to override this with the older version?");
                    var options = [
                        nls.localize('override', "Override"),
                        nls.localize('cancel', "Cancel")
                    ];
                    return _this.choiceService.choose(message_1.Severity.Info, message, options, 1, true)
                        .then(function (value) {
                        if (value === 0) {
                            return _this.uninstall(newer, true).then(function () { return true; });
                        }
                        return winjs_base_1.TPromise.wrapError(errors.canceled());
                    });
                }
                return true;
            });
        };
        ExtensionManagementService.prototype.installFromZipPath = function (identifier, zipPath, metadata, manifest) {
            var _this = this;
            return this.installExtension({ zipPath: zipPath, id: identifier.id, metadata: metadata })
                .then(function (local) {
                if (_this.galleryService.isEnabled() && local.manifest.extensionDependencies && local.manifest.extensionDependencies.length) {
                    return _this.getDependenciesToInstall(local.manifest.extensionDependencies)
                        .then(function (dependenciesToInstall) { return _this.downloadAndInstallExtensions(metadata ? dependenciesToInstall.filter(function (d) { return d.identifier.uuid !== metadata.id; }) : dependenciesToInstall); })
                        .then(function () { return local; }, function (error) {
                        _this.uninstallExtension(local);
                        return winjs_base_1.TPromise.wrapError(new Error(nls.localize('errorInstallingDependencies', "Error while installing dependencies. {0}", error instanceof Error ? error.message : error)));
                    });
                }
                return local;
            })
                .then(function (local) { return _this._onDidInstallExtension.fire({ identifier: identifier, zipPath: zipPath, local: local }); }, function (error) { _this._onDidInstallExtension.fire({ identifier: identifier, zipPath: zipPath, error: error }); return winjs_base_1.TPromise.wrapError(error); });
        };
        ExtensionManagementService.prototype.installFromGallery = function (extension) {
            var _this = this;
            this.onInstallExtensions([extension]);
            return this.collectExtensionsToInstall(extension)
                .then(function (extensionsToInstall) {
                if (extensionsToInstall.length > 1) {
                    _this.onInstallExtensions(extensionsToInstall.slice(1));
                }
                return _this.downloadAndInstallExtensions(extensionsToInstall)
                    .then(function (locals) { return _this.onDidInstallExtensions(extensionsToInstall, locals, []); }, function (errors) { return _this.onDidInstallExtensions(extensionsToInstall, [], errors); });
            }, function (error) { return _this.onDidInstallExtensions([extension], [], [error]); });
        };
        ExtensionManagementService.prototype.collectExtensionsToInstall = function (extension) {
            var _this = this;
            return this.galleryService.loadCompatibleVersion(extension)
                .then(function (compatible) {
                if (!compatible) {
                    return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(nls.localize('notFoundCompatible', "Unable to install '{0}'; there is no available version compatible with VS Code '{1}'.", extension.identifier.id, package_1.default.version), INSTALL_ERROR_INCOMPATIBLE));
                }
                return _this.getDependenciesToInstall(compatible.properties.dependencies)
                    .then(function (dependenciesToInstall) { return ([compatible].concat(dependenciesToInstall.filter(function (d) { return d.identifier.uuid !== compatible.identifier.uuid; }))); }, function (error) { return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(_this.joinErrors(error).message, INSTALL_ERROR_GALLERY)); });
            }, function (error) { return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(_this.joinErrors(error).message, INSTALL_ERROR_GALLERY)); });
        };
        ExtensionManagementService.prototype.downloadAndInstallExtensions = function (extensions) {
            var _this = this;
            return winjs_base_1.TPromise.join(extensions.map(function (extensionToInstall) { return _this.downloadAndInstallExtension(extensionToInstall); }))
                .then(null, function (errors) { return _this.rollback(extensions).then(function () { return winjs_base_1.TPromise.wrapError(errors); }, function () { return winjs_base_1.TPromise.wrapError(errors); }); });
        };
        ExtensionManagementService.prototype.downloadAndInstallExtension = function (extension) {
            var _this = this;
            var installingExtension = this.installingExtensions.get(extension.identifier.id);
            if (!installingExtension) {
                installingExtension = this.getExtensionsReport()
                    .then(function (report) {
                    if (extensionManagementUtil_1.getMaliciousExtensionsSet(report).has(extension.identifier.id)) {
                        throw new Error(nls.localize('malicious extension', "Can't install extension since it was reported to be problematic."));
                    }
                    else {
                        return extension;
                    }
                })
                    .then(function (extension) { return _this.downloadInstallableExtension(extension); })
                    .then(function (installableExtension) { return _this.installExtension(installableExtension); })
                    .then(function (local) { _this.installingExtensions.delete(extension.identifier.id); return local; }, function (e) { _this.installingExtensions.delete(extension.identifier.id); return winjs_base_1.TPromise.wrapError(e); });
                this.installingExtensions.set(extension.identifier.id, installingExtension);
            }
            return installingExtension;
        };
        ExtensionManagementService.prototype.downloadInstallableExtension = function (extension) {
            var _this = this;
            var metadata = {
                id: extension.identifier.uuid,
                publisherId: extension.publisherId,
                publisherDisplayName: extension.publisherDisplayName,
            };
            return this.galleryService.loadCompatibleVersion(extension)
                .then(function (compatible) {
                if (compatible) {
                    _this.logService.trace('Started downloading extension:', extension.name);
                    return _this.galleryService.download(extension)
                        .then(function (zipPath) {
                        _this.logService.info('Downloaded extension:', extension.name);
                        return validateLocalExtension(zipPath)
                            .then(function (manifest) { return ({ zipPath: zipPath, id: getLocalExtensionIdFromManifest(manifest), metadata: metadata }); }, function (error) { return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(_this.joinErrors(error).message, INSTALL_ERROR_VALIDATING)); });
                    }, function (error) { return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(_this.joinErrors(error).message, INSTALL_ERROR_DOWNLOADING)); });
                }
                else {
                    return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(nls.localize('notFoundCompatibleDependency', "Unable to install because, the depending extension '{0}' compatible with current version '{1}' of VS Code is not found.", extension.identifier.id, package_1.default.version), INSTALL_ERROR_INCOMPATIBLE));
                }
            }, function (error) { return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(_this.joinErrors(error).message, INSTALL_ERROR_GALLERY)); });
        };
        ExtensionManagementService.prototype.rollback = function (extensions) {
            var _this = this;
            return this.filterOutUninstalled(extensions)
                .then(function (installed) { return winjs_base_1.TPromise.join(installed.map(function (local) { return _this.uninstallExtension(local); })); })
                .then(function () { return null; }, function () { return null; });
        };
        ExtensionManagementService.prototype.onInstallExtensions = function (extensions) {
            for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
                var extension = extensions_1[_i];
                this.logService.info('Installing extension:', extension.name);
                var id = getLocalExtensionIdFromGallery(extension, extension.version);
                this._onInstallExtension.fire({ identifier: { id: id, uuid: extension.identifier.uuid }, gallery: extension });
            }
        };
        ExtensionManagementService.prototype.onDidInstallExtensions = function (extensions, locals, errors) {
            var _this = this;
            extensions.forEach(function (gallery, index) {
                var identifier = { id: getLocalExtensionIdFromGallery(gallery, gallery.version), uuid: gallery.identifier.uuid };
                var local = locals[index];
                var error = errors[index];
                if (local) {
                    _this.logService.info("Extensions installed successfully:", gallery.identifier.id);
                    _this._onDidInstallExtension.fire({ identifier: identifier, gallery: gallery, local: local });
                }
                else {
                    var errorCode = error && error.code ? error.code : INSTALL_ERROR_UNKNOWN;
                    _this.logService.error("Failed to install extension:", gallery.identifier.id, error ? error.message : errorCode);
                    _this._onDidInstallExtension.fire({ identifier: identifier, gallery: gallery, error: errorCode });
                }
            });
            return errors.length ? winjs_base_1.TPromise.wrapError(this.joinErrors(errors)) : winjs_base_1.TPromise.as(null);
        };
        ExtensionManagementService.prototype.getDependenciesToInstall = function (dependencies) {
            var _this = this;
            if (dependencies.length) {
                return this.getInstalled()
                    .then(function (installed) {
                    var uninstalledDeps = dependencies.filter(function (d) { return installed.every(function (i) { return extensionManagementUtil_1.getGalleryExtensionId(i.manifest.publisher, i.manifest.name) !== d; }); });
                    if (uninstalledDeps.length) {
                        return _this.galleryService.loadAllDependencies(uninstalledDeps.map(function (id) { return ({ id: id }); }))
                            .then(function (allDependencies) { return allDependencies.filter(function (d) {
                            var extensionId = getLocalExtensionIdFromGallery(d, d.version);
                            return installed.every(function (_a) {
                                var identifier = _a.identifier;
                                return identifier.id !== extensionId;
                            });
                        }); });
                    }
                    return [];
                });
            }
            return winjs_base_1.TPromise.as([]);
        };
        ExtensionManagementService.prototype.filterOutUninstalled = function (extensions) {
            var _this = this;
            return this.getInstalled()
                .then(function (installed) { return installed.filter(function (local) { return !!_this.getGalleryExtensionForLocalExtension(extensions, local); }); });
        };
        ExtensionManagementService.prototype.getGalleryExtensionForLocalExtension = function (galleryExtensions, localExtension) {
            var filtered = galleryExtensions.filter(function (galleryExtension) { return extensionManagementUtil_1.areSameExtensions(localExtension.identifier, { id: getLocalExtensionIdFromGallery(galleryExtension, galleryExtension.version), uuid: galleryExtension.identifier.uuid }); });
            return filtered.length ? filtered[0] : null;
        };
        ExtensionManagementService.prototype.installExtension = function (installableExtension) {
            var _this = this;
            return this.unsetUninstalledAndGetLocal(installableExtension.id)
                .then(function (local) {
                if (local) {
                    return local;
                }
                return _this.extractAndInstall(installableExtension);
            }, function (e) {
                if (platform_1.isMacintosh) {
                    return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(nls.localize('quitCode', "Unable to install the extension. Please Quit and Start VS Code before reinstalling."), INSTALL_ERROR_UNSET_UNINSTALLED));
                }
                return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(nls.localize('exitCode', "Unable to install the extension. Please Exit and Start VS Code before reinstalling."), INSTALL_ERROR_UNSET_UNINSTALLED));
            });
        };
        ExtensionManagementService.prototype.unsetUninstalledAndGetLocal = function (id) {
            var _this = this;
            return this.isUninstalled(id)
                .then(function (isUninstalled) {
                if (isUninstalled) {
                    _this.logService.trace('Removing the extension from uninstalled list:', id);
                    // If the same version of extension is marked as uninstalled, remove it from there and return the local.
                    return _this.unsetUninstalled(id)
                        .then(function () {
                        _this.logService.info('Removed the extension from uninstalled list:', id);
                        return _this.getInstalled(extensionManagement_1.LocalExtensionType.User);
                    })
                        .then(function (installed) { return installed.filter(function (i) { return i.identifier.id === id; })[0]; });
                }
                return null;
            });
        };
        ExtensionManagementService.prototype.extractAndInstall = function (_a) {
            var _this = this;
            var zipPath = _a.zipPath, id = _a.id, metadata = _a.metadata;
            var extensionPath = path.join(this.extensionsPath, id);
            return pfs.rimraf(extensionPath)
                .then(function () {
                _this.logService.trace("Started extracting the extension from " + zipPath + " to " + extensionPath);
                return zip_1.extract(zipPath, extensionPath, { sourcePath: 'extension', overwrite: true })
                    .then(function () {
                    _this.logService.info("Extracted extension to " + extensionPath + ":", id);
                    return winjs_base_1.TPromise.join([readManifest(extensionPath), pfs.readdir(extensionPath)])
                        .then(null, function (e) { return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(_this.joinErrors(e).message, INSTALL_ERROR_READING_EXTENSION_FROM_DISK)); });
                }, function (e) { return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(e.message, INSTALL_ERROR_EXTRACTING)); })
                    .then(function (_a) {
                    var manifest = _a[0].manifest, children = _a[1];
                    var readme = children.filter(function (child) { return /^readme(\.txt|\.md|)$/i.test(child); })[0];
                    var readmeUrl = readme ? uri_1.default.file(path.join(extensionPath, readme)).toString() : null;
                    var changelog = children.filter(function (child) { return /^changelog(\.txt|\.md|)$/i.test(child); })[0];
                    var changelogUrl = changelog ? uri_1.default.file(path.join(extensionPath, changelog)).toString() : null;
                    var type = extensionManagement_1.LocalExtensionType.User;
                    var identifier = { id: id, uuid: metadata ? metadata.id : null };
                    var local = { type: type, identifier: identifier, manifest: manifest, metadata: metadata, path: extensionPath, readmeUrl: readmeUrl, changelogUrl: changelogUrl };
                    _this.logService.trace("Updating metadata of the extension:", id);
                    return _this.saveMetadataForLocalExtension(local)
                        .then(function () {
                        _this.logService.info("Updated metadata of the extension:", id);
                        return local;
                    }, function (e) { return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(_this.joinErrors(e).message, INSTALL_ERROR_SAVING_METADATA)); });
                });
            }, function (e) { return winjs_base_1.TPromise.wrapError(new ExtensionManagementError(_this.joinErrors(e).message, INSTALL_ERROR_DELETING)); });
        };
        ExtensionManagementService.prototype.uninstall = function (extension, force) {
            var _this = this;
            if (force === void 0) { force = false; }
            return this.getInstalled(extensionManagement_1.LocalExtensionType.User)
                .then(function (installed) {
                var promises = installed
                    .filter(function (e) { return e.manifest.publisher === extension.manifest.publisher && e.manifest.name === extension.manifest.name; })
                    .map(function (e) { return _this.checkForDependenciesAndUninstall(e, installed, force); });
                return winjs_base_1.TPromise.join(promises).then(function () { return null; }, function (error) { return winjs_base_1.TPromise.wrapError(_this.joinErrors(error)); });
            });
        };
        ExtensionManagementService.prototype.updateMetadata = function (local, metadata) {
            var _this = this;
            local.metadata = metadata;
            return this.saveMetadataForLocalExtension(local)
                .then(function (localExtension) {
                _this.manifestCache.invalidate();
                return localExtension;
            });
        };
        ExtensionManagementService.prototype.saveMetadataForLocalExtension = function (local) {
            if (!local.metadata) {
                return winjs_base_1.TPromise.as(local);
            }
            var manifestPath = path.join(this.extensionsPath, local.identifier.id, 'package.json');
            return pfs.readFile(manifestPath, 'utf8')
                .then(function (raw) { return parseManifest(raw); })
                .then(function (_a) {
                var manifest = _a.manifest;
                return objects_1.assign(manifest, { __metadata: local.metadata });
            })
                .then(function (manifest) { return pfs.writeFile(manifestPath, JSON.stringify(manifest, null, '\t')); })
                .then(function () { return local; });
        };
        ExtensionManagementService.prototype.getMetadata = function (extensionName) {
            return this.galleryService.query({ names: [extensionName], pageSize: 1 })
                .then(function (galleryResult) {
                var galleryExtension = galleryResult.firstPage[0];
                return galleryExtension ? { id: galleryExtension.identifier.uuid, publisherDisplayName: galleryExtension.publisherDisplayName, publisherId: galleryExtension.publisherId } : null;
            });
        };
        ExtensionManagementService.prototype.joinErrors = function (errorOrErrors) {
            var errors = Array.isArray(errorOrErrors) ? errorOrErrors : [errorOrErrors];
            if (errors.length === 1) {
                return errors[0] instanceof Error ? errors[0] : new Error(errors[0]);
            }
            return errors.reduce(function (previousValue, currentValue) {
                return new Error("" + previousValue.message + (previousValue.message ? ',' : '') + (currentValue instanceof Error ? currentValue.message : currentValue));
            }, new Error(''));
        };
        ExtensionManagementService.prototype.checkForDependenciesAndUninstall = function (extension, installed, force) {
            var _this = this;
            return this.preUninstallExtension(extension)
                .then(function () { return _this.hasDependencies(extension, installed) ? _this.promptForDependenciesAndUninstall(extension, installed, force) : _this.promptAndUninstall(extension, installed, force); })
                .then(function () { return _this.postUninstallExtension(extension); }, function (error) {
                _this.postUninstallExtension(extension, INSTALL_ERROR_LOCAL);
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        ExtensionManagementService.prototype.hasDependencies = function (extension, installed) {
            if (extension.manifest.extensionDependencies && extension.manifest.extensionDependencies.length) {
                return installed.some(function (i) { return extension.manifest.extensionDependencies.indexOf(extensionManagementUtil_1.getGalleryExtensionIdFromLocal(i)) !== -1; });
            }
            return false;
        };
        ExtensionManagementService.prototype.promptForDependenciesAndUninstall = function (extension, installed, force) {
            var _this = this;
            if (force) {
                var dependencies = arrays_1.distinct(this.getDependenciesToUninstallRecursively(extension, installed, [])).filter(function (e) { return e !== extension; });
                return this.uninstallWithDependencies(extension, dependencies, installed);
            }
            var message = nls.localize('uninstallDependeciesConfirmation', "Would you like to uninstall '{0}' only or its dependencies also?", extension.manifest.displayName || extension.manifest.name);
            var options = [
                nls.localize('uninstallOnly', "Only"),
                nls.localize('uninstallAll', "All"),
                nls.localize('cancel', "Cancel")
            ];
            this.logService.info('Requesting for confirmation to uninstall extension with dependencies', extension.identifier.id);
            return this.choiceService.choose(message_1.Severity.Info, message, options, 2, true)
                .then(function (value) {
                if (value === 0) {
                    return _this.uninstallWithDependencies(extension, [], installed);
                }
                if (value === 1) {
                    var dependencies = arrays_1.distinct(_this.getDependenciesToUninstallRecursively(extension, installed, [])).filter(function (e) { return e !== extension; });
                    return _this.uninstallWithDependencies(extension, dependencies, installed);
                }
                _this.logService.info('Cancelled uninstalling extension:', extension.identifier.id);
                return winjs_base_1.TPromise.wrapError(errors.canceled());
            }, function (error) { return winjs_base_1.TPromise.wrapError(errors.canceled()); });
        };
        ExtensionManagementService.prototype.promptAndUninstall = function (extension, installed, force) {
            var _this = this;
            if (force) {
                return this.uninstallWithDependencies(extension, [], installed);
            }
            var message = nls.localize('uninstallConfirmation', "Are you sure you want to uninstall '{0}'?", extension.manifest.displayName || extension.manifest.name);
            var options = [
                nls.localize('ok', "OK"),
                nls.localize('cancel', "Cancel")
            ];
            this.logService.info('Requesting for confirmation to uninstall extension', extension.identifier.id);
            return this.choiceService.choose(message_1.Severity.Info, message, options, 1, true)
                .then(function (value) {
                if (value === 0) {
                    return _this.uninstallWithDependencies(extension, [], installed);
                }
                _this.logService.info('Cancelled uninstalling extension:', extension.identifier.id);
                return winjs_base_1.TPromise.wrapError(errors.canceled());
            }, function (error) { return winjs_base_1.TPromise.wrapError(errors.canceled()); });
        };
        ExtensionManagementService.prototype.uninstallWithDependencies = function (extension, dependencies, installed) {
            var _this = this;
            var dependenciesToUninstall = this.filterDependents(extension, dependencies, installed);
            var dependents = this.getDependents(extension, installed).filter(function (dependent) { return extension !== dependent && dependenciesToUninstall.indexOf(dependent) === -1; });
            if (dependents.length) {
                return winjs_base_1.TPromise.wrapError(new Error(this.getDependentsErrorMessage(extension, dependents)));
            }
            return winjs_base_1.TPromise.join([this.uninstallExtension(extension)].concat(dependenciesToUninstall.map(function (d) { return _this.doUninstall(d); }))).then(function () { return null; });
        };
        ExtensionManagementService.prototype.getDependentsErrorMessage = function (extension, dependents) {
            if (dependents.length === 1) {
                return nls.localize('singleDependentError', "Cannot uninstall extension '{0}'. Extension '{1}' depends on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
            }
            if (dependents.length === 2) {
                return nls.localize('twoDependentsError', "Cannot uninstall extension '{0}'. Extensions '{1}' and '{2}' depend on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            return nls.localize('multipleDependentsError', "Cannot uninstall extension '{0}'. Extensions '{1}', '{2}' and others depend on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        };
        ExtensionManagementService.prototype.getDependenciesToUninstallRecursively = function (extension, installed, checked) {
            if (checked.indexOf(extension) !== -1) {
                return [];
            }
            checked.push(extension);
            if (!extension.manifest.extensionDependencies || extension.manifest.extensionDependencies.length === 0) {
                return [];
            }
            var dependenciesToUninstall = installed.filter(function (i) { return extension.manifest.extensionDependencies.indexOf(extensionManagementUtil_1.getGalleryExtensionIdFromLocal(i)) !== -1; });
            var depsOfDeps = [];
            for (var _i = 0, dependenciesToUninstall_1 = dependenciesToUninstall; _i < dependenciesToUninstall_1.length; _i++) {
                var dep = dependenciesToUninstall_1[_i];
                depsOfDeps.push.apply(depsOfDeps, this.getDependenciesToUninstallRecursively(dep, installed, checked));
            }
            return dependenciesToUninstall.concat(depsOfDeps);
        };
        ExtensionManagementService.prototype.filterDependents = function (extension, dependencies, installed) {
            installed = installed.filter(function (i) { return i !== extension && i.manifest.extensionDependencies && i.manifest.extensionDependencies.length > 0; });
            var result = dependencies.slice(0);
            for (var i = 0; i < dependencies.length; i++) {
                var dep = dependencies[i];
                var dependents = this.getDependents(dep, installed).filter(function (e) { return dependencies.indexOf(e) === -1; });
                if (dependents.length) {
                    result.splice(i - (dependencies.length - result.length), 1);
                }
            }
            return result;
        };
        ExtensionManagementService.prototype.getDependents = function (extension, installed) {
            return installed.filter(function (e) { return e.manifest.extensionDependencies && e.manifest.extensionDependencies.indexOf(extensionManagementUtil_1.getGalleryExtensionIdFromLocal(extension)) !== -1; });
        };
        ExtensionManagementService.prototype.doUninstall = function (extension) {
            var _this = this;
            return this.preUninstallExtension(extension)
                .then(function () { return _this.uninstallExtension(extension); })
                .then(function () { return _this.postUninstallExtension(extension); }, function (error) {
                _this.postUninstallExtension(extension, INSTALL_ERROR_LOCAL);
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        ExtensionManagementService.prototype.preUninstallExtension = function (extension) {
            var _this = this;
            return pfs.exists(extension.path)
                .then(function (exists) { return exists ? null : winjs_base_1.TPromise.wrapError(new Error(nls.localize('notExists', "Could not find extension"))); })
                .then(function () {
                _this.logService.info('Uninstalling extension:', extension.identifier.id);
                _this._onUninstallExtension.fire(extension.identifier);
            });
        };
        ExtensionManagementService.prototype.uninstallExtension = function (local) {
            var _this = this;
            var identifier = { id: extensionManagementUtil_1.getGalleryExtensionIdFromLocal(local), uuid: local.identifier.uuid };
            return this.scanUserExtensions(false) // Uninstall all extensions which are same as requested
                .then(function (extensions) { return extensions.filter(function (i) { return extensionManagementUtil_1.areSameExtensions({ id: extensionManagementUtil_1.getGalleryExtensionIdFromLocal(i), uuid: i.identifier.uuid }, identifier); }); })
                .then(function (uninstalled) { return _this.setUninstalled.apply(_this, uninstalled.map(function (u) { return u.identifier.id; })); });
        };
        ExtensionManagementService.prototype.postUninstallExtension = function (extension, error) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!error) return [3 /*break*/, 1];
                            this.logService.error('Failed to uninstall extension:', extension.identifier.id, error);
                            return [3 /*break*/, 3];
                        case 1:
                            this.logService.info('Successfully uninstalled extension:', extension.identifier.id);
                            if (!extension.identifier.uuid) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.galleryService.reportStatistic(extension.manifest.publisher, extension.manifest.name, extension.manifest.version, extensionManagement_1.StatisticType.Uninstall)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            this._onDidUninstallExtension.fire({ identifier: extension.identifier, error: error });
                            return [2 /*return*/];
                    }
                });
            });
        };
        ExtensionManagementService.prototype.getInstalled = function (type) {
            var _this = this;
            if (type === void 0) { type = null; }
            var promises = [];
            if (type === null || type === extensionManagement_1.LocalExtensionType.System) {
                promises.push(this.scanSystemExtensions().then(null, function (e) { return new ExtensionManagementError(_this.joinErrors(e).message, ERROR_SCANNING_SYS_EXTENSIONS); }));
            }
            if (type === null || type === extensionManagement_1.LocalExtensionType.User) {
                promises.push(this.scanUserExtensions(true).then(null, function (e) { return new ExtensionManagementError(_this.joinErrors(e).message, ERROR_SCANNING_USER_EXTENSIONS); }));
            }
            return winjs_base_1.TPromise.join(promises).then(arrays_1.flatten, function (errors) { return winjs_base_1.TPromise.wrapError(_this.joinErrors(errors)); });
        };
        ExtensionManagementService.prototype.scanSystemExtensions = function () {
            var _this = this;
            this.logService.trace('Started scanning system extensions');
            return this.scanExtensions(SystemExtensionsRoot, extensionManagement_1.LocalExtensionType.System)
                .then(function (result) {
                _this.logService.info('Scanned system extensions:', result.length);
                return result;
            });
        };
        ExtensionManagementService.prototype.scanUserExtensions = function (excludeOutdated) {
            var _this = this;
            this.logService.trace('Started scanning user extensions');
            return winjs_base_1.TPromise.join([this.getUninstalledExtensions(), this.scanExtensions(this.extensionsPath, extensionManagement_1.LocalExtensionType.User)])
                .then(function (_a) {
                var uninstalled = _a[0], extensions = _a[1];
                extensions = extensions.filter(function (e) { return !uninstalled[e.identifier.id]; });
                if (excludeOutdated) {
                    var byExtension = extensionManagementUtil_1.groupByExtension(extensions, function (e) { return ({ id: extensionManagementUtil_1.getGalleryExtensionIdFromLocal(e), uuid: e.identifier.uuid }); });
                    extensions = byExtension.map(function (p) { return p.sort(function (a, b) { return semver.rcompare(a.manifest.version, b.manifest.version); })[0]; });
                }
                _this.logService.info('Scanned user extensions:', extensions.length);
                return extensions;
            });
        };
        ExtensionManagementService.prototype.scanExtensions = function (root, type) {
            var _this = this;
            var limiter = new async_1.Limiter(10);
            return pfs.readdir(root)
                .then(function (extensionsFolders) { return winjs_base_1.TPromise.join(extensionsFolders.map(function (extensionFolder) { return limiter.queue(function () { return _this.scanExtension(extensionFolder, root, type); }); })); })
                .then(function (extensions) { return arrays_1.coalesce(extensions); });
        };
        ExtensionManagementService.prototype.scanExtension = function (folderName, root, type) {
            var extensionPath = path.join(root, folderName);
            return pfs.readdir(extensionPath)
                .then(function (children) { return readManifest(extensionPath)
                .then(function (_a) {
                var manifest = _a.manifest, metadata = _a.metadata;
                var readme = children.filter(function (child) { return /^readme(\.txt|\.md|)$/i.test(child); })[0];
                var readmeUrl = readme ? uri_1.default.file(path.join(extensionPath, readme)).toString() : null;
                var changelog = children.filter(function (child) { return /^changelog(\.txt|\.md|)$/i.test(child); })[0];
                var changelogUrl = changelog ? uri_1.default.file(path.join(extensionPath, changelog)).toString() : null;
                if (manifest.extensionDependencies) {
                    manifest.extensionDependencies = manifest.extensionDependencies.map(function (id) { return extensionManagementUtil_1.adoptToGalleryExtensionId(id); });
                }
                var identifier = { id: type === extensionManagement_1.LocalExtensionType.System ? folderName : getLocalExtensionIdFromManifest(manifest), uuid: metadata ? metadata.id : null };
                return { type: type, identifier: identifier, manifest: manifest, metadata: metadata, path: extensionPath, readmeUrl: readmeUrl, changelogUrl: changelogUrl };
            }); })
                .then(null, function () { return null; });
        };
        ExtensionManagementService.prototype.removeDeprecatedExtensions = function () {
            var _this = this;
            return this.getUninstalledExtensions()
                .then(function (uninstalled) { return _this.scanExtensions(_this.extensionsPath, extensionManagement_1.LocalExtensionType.User) // All user extensions
                .then(function (extensions) {
                var toRemove = [];
                // Uninstalled extensions
                toRemove.push.apply(toRemove, extensions.filter(function (e) { return uninstalled[e.identifier.id]; }).map(function (e) { return ({ path: e.path, id: e.identifier.id }); }));
                // Outdated extensions
                var byExtension = extensionManagementUtil_1.groupByExtension(extensions, function (e) { return ({ id: extensionManagementUtil_1.getGalleryExtensionIdFromLocal(e), uuid: e.identifier.uuid }); });
                toRemove.push.apply(toRemove, arrays_1.flatten(byExtension.map(function (p) { return p.sort(function (a, b) { return semver.rcompare(a.manifest.version, b.manifest.version); }).slice(1); }))
                    .map(function (e) { return ({ path: e.path, id: e.identifier.id }); }));
                return winjs_base_1.TPromise.join(arrays_1.distinct(toRemove, function (e) { return e.path; }).map(function (_a) {
                    var path = _a.path, id = _a.id;
                    return pfs.rimraf(path)
                        .then(function () { return _this.withUninstalledExtensions(function (uninstalled) { return delete uninstalled[id]; }); });
                }));
            }); });
        };
        ExtensionManagementService.prototype.isUninstalled = function (id) {
            return this.filterUninstalled(id).then(function (uninstalled) { return uninstalled.length === 1; });
        };
        ExtensionManagementService.prototype.filterUninstalled = function () {
            var ids = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ids[_i] = arguments[_i];
            }
            return this.withUninstalledExtensions(function (allUninstalled) {
                var uninstalled = [];
                for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                    var id = ids_1[_i];
                    if (!!allUninstalled[id]) {
                        uninstalled.push(id);
                    }
                }
                return uninstalled;
            });
        };
        ExtensionManagementService.prototype.setUninstalled = function () {
            var ids = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ids[_i] = arguments[_i];
            }
            return this.withUninstalledExtensions(function (uninstalled) { return objects_1.assign(uninstalled, ids.reduce(function (result, id) { result[id] = true; return result; }, {})); });
        };
        ExtensionManagementService.prototype.unsetUninstalled = function (id) {
            return this.withUninstalledExtensions(function (uninstalled) { return delete uninstalled[id]; });
        };
        ExtensionManagementService.prototype.getUninstalledExtensions = function () {
            return this.withUninstalledExtensions(function (uninstalled) { return uninstalled; });
        };
        ExtensionManagementService.prototype.withUninstalledExtensions = function (fn) {
            var _this = this;
            return this.uninstalledFileLimiter.queue(function () {
                var result = null;
                return pfs.readFile(_this.uninstalledPath, 'utf8')
                    .then(null, function (err) { return err.code === 'ENOENT' ? winjs_base_1.TPromise.as('{}') : winjs_base_1.TPromise.wrapError(err); })
                    .then(function (raw) { try {
                    return JSON.parse(raw);
                }
                catch (e) {
                    return {};
                } })
                    .then(function (uninstalled) { result = fn(uninstalled); return uninstalled; })
                    .then(function (uninstalled) {
                    if (Object.keys(uninstalled).length === 0) {
                        return pfs.rimraf(_this.uninstalledPath);
                    }
                    else {
                        var raw = JSON.stringify(uninstalled);
                        return pfs.writeFile(_this.uninstalledPath, raw);
                    }
                })
                    .then(function () { return result; });
            });
        };
        ExtensionManagementService.prototype.getExtensionsReport = function () {
            var now = new Date().getTime();
            if (!this.reportedExtensions || now - this.lastReportTimestamp > 1000 * 60 * 5) {
                this.reportedExtensions = this.updateReportCache();
                this.lastReportTimestamp = now;
            }
            return this.reportedExtensions;
        };
        ExtensionManagementService.prototype.updateReportCache = function () {
            var _this = this;
            this.logService.trace('ExtensionManagementService.refreshReportedCache');
            return this.galleryService.getExtensionsReport()
                .then(function (result) {
                _this.logService.trace("ExtensionManagementService.refreshReportedCache - got " + result.length + " reported extensions from service");
                return result;
            }, function (err) {
                _this.logService.trace('ExtensionManagementService.refreshReportedCache - failed to get extension report');
                return [];
            });
        };
        ExtensionManagementService = __decorate([
            __param(0, environment_1.IEnvironmentService),
            __param(1, message_1.IChoiceService),
            __param(2, extensionManagement_1.IExtensionGalleryService),
            __param(3, log_1.ILogService)
        ], ExtensionManagementService);
        return ExtensionManagementService;
    }(lifecycle_1.Disposable));
    exports.ExtensionManagementService = ExtensionManagementService;
    function getLocalExtensionIdFromGallery(extension, version) {
        return extensionManagementUtil_1.getLocalExtensionId(extension.identifier.id, version);
    }
    exports.getLocalExtensionIdFromGallery = getLocalExtensionIdFromGallery;
    function getLocalExtensionIdFromManifest(manifest) {
        return extensionManagementUtil_1.getLocalExtensionId(extensionManagementUtil_1.getGalleryExtensionId(manifest.publisher, manifest.name), manifest.version);
    }
    exports.getLocalExtensionIdFromManifest = getLocalExtensionIdFromManifest;
});
