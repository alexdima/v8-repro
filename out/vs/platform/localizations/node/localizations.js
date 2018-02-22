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
define(["require", "exports", "vs/base/node/pfs", "crypto", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/lifecycle", "vs/platform/environment/common/environment", "vs/base/common/paths", "vs/base/common/winjs.base", "vs/base/common/async", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/log/common/log", "vs/platform/localizations/common/localizations", "vs/platform/node/product", "vs/base/common/arrays", "vs/base/common/event"], function (require, exports, pfs, crypto_1, extensionManagement_1, lifecycle_1, environment_1, paths_1, winjs_base_1, async_1, extensionManagementUtil_1, log_1, localizations_1, product_1, arrays_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var systemLanguages = ['de', 'en', 'en-US', 'es', 'fr', 'it', 'ja', 'ko', 'ru', 'zh-CN', 'zh-TW'];
    if (product_1.default.quality !== 'stable') {
        systemLanguages.push('hu');
    }
    var LocalizationsService = /** @class */ (function (_super) {
        __extends(LocalizationsService, _super);
        function LocalizationsService(extensionManagementService, environmentService, logService) {
            var _this = _super.call(this) || this;
            _this.extensionManagementService = extensionManagementService;
            _this.logService = logService;
            _this._onDidLanguagesChange = _this._register(new event_1.Emitter());
            _this.onDidLanguagesChange = _this._onDidLanguagesChange.event;
            _this.cache = _this._register(new LanguagePacksCache(environmentService, logService));
            _this._register(extensionManagementService.onDidInstallExtension(function (_a) {
                var local = _a.local;
                return _this.onDidInstallExtension(local);
            }));
            _this._register(extensionManagementService.onDidUninstallExtension(function (_a) {
                var identifier = _a.identifier;
                return _this.onDidUninstallExtension(identifier);
            }));
            _this.extensionManagementService.getInstalled().then(function (installed) { return _this.cache.update(installed); });
            return _this;
        }
        LocalizationsService.prototype.getLanguageIds = function () {
            return this.cache.getLanguagePacks()
                .then(function (languagePacks) {
                var languages = systemLanguages.concat(Object.keys(languagePacks));
                return winjs_base_1.TPromise.as(arrays_1.distinct(languages));
            });
        };
        LocalizationsService.prototype.onDidInstallExtension = function (extension) {
            if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
                this.logService.debug('Adding language packs from the extension', extension.identifier.id);
                this.update();
            }
        };
        LocalizationsService.prototype.onDidUninstallExtension = function (identifier) {
            var _this = this;
            this.cache.getLanguagePacks()
                .then(function (languagePacks) {
                identifier = { id: extensionManagementUtil_1.getIdFromLocalExtensionId(identifier.id), uuid: identifier.uuid };
                if (Object.keys(languagePacks).some(function (language) { return languagePacks[language] && languagePacks[language].extensions.some(function (e) { return extensionManagementUtil_1.areSameExtensions(e.extensionIdentifier, identifier); }); })) {
                    _this.logService.debug('Removing language packs from the extension', identifier.id);
                    _this.update();
                }
            });
        };
        LocalizationsService.prototype.update = function () {
            var _this = this;
            winjs_base_1.TPromise.join([this.cache.getLanguagePacks(), this.extensionManagementService.getInstalled()])
                .then(function (_a) {
                var current = _a[0], installed = _a[1];
                return _this.cache.update(installed)
                    .then(function (updated) {
                    if (!arrays_1.equals(Object.keys(current), Object.keys(updated))) {
                        _this._onDidLanguagesChange.fire();
                    }
                });
            });
        };
        LocalizationsService = __decorate([
            __param(0, extensionManagement_1.IExtensionManagementService),
            __param(1, environment_1.IEnvironmentService),
            __param(2, log_1.ILogService)
        ], LocalizationsService);
        return LocalizationsService;
    }(lifecycle_1.Disposable));
    exports.LocalizationsService = LocalizationsService;
    var LanguagePacksCache = /** @class */ (function (_super) {
        __extends(LanguagePacksCache, _super);
        function LanguagePacksCache(environmentService, logService) {
            var _this = _super.call(this) || this;
            _this.logService = logService;
            _this.languagePacks = {};
            _this.languagePacksFilePath = paths_1.join(environmentService.userDataPath, 'languagepacks.json');
            _this.languagePacksFileLimiter = new async_1.Limiter(1);
            return _this;
        }
        LanguagePacksCache.prototype.getLanguagePacks = function () {
            var _this = this;
            // if queue is not empty, fetch from disk
            if (this.languagePacksFileLimiter.size) {
                return this.withLanguagePacks()
                    .then(function () { return _this.languagePacks; });
            }
            return winjs_base_1.TPromise.as(this.languagePacks);
        };
        LanguagePacksCache.prototype.update = function (extensions) {
            var _this = this;
            return this.withLanguagePacks(function (languagePacks) {
                Object.keys(languagePacks).forEach(function (language) { return languagePacks[language] = undefined; });
                _this.createLanguagePacksFromExtensions.apply(_this, [languagePacks].concat(extensions));
            }).then(function () { return _this.languagePacks; });
        };
        LanguagePacksCache.prototype.createLanguagePacksFromExtensions = function (languagePacks) {
            var _this = this;
            var extensions = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                extensions[_i - 1] = arguments[_i];
            }
            for (var _a = 0, extensions_1 = extensions; _a < extensions_1.length; _a++) {
                var extension = extensions_1[_a];
                if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
                    this.createLanguagePacksFromExtension(languagePacks, extension);
                }
            }
            Object.keys(languagePacks).forEach(function (languageId) { return _this.updateHash(languagePacks[languageId]); });
        };
        LanguagePacksCache.prototype.createLanguagePacksFromExtension = function (languagePacks, extension) {
            var extensionIdentifier = { id: extensionManagementUtil_1.getGalleryExtensionIdFromLocal(extension), uuid: extension.identifier.uuid };
            for (var _i = 0, _a = extension.manifest.contributes.localizations; _i < _a.length; _i++) {
                var localizationContribution = _a[_i];
                if (localizations_1.isValidLocalization(localizationContribution)) {
                    var languagePack = languagePacks[localizationContribution.languageId];
                    if (!languagePack) {
                        languagePack = { hash: '', extensions: [], translations: {} };
                        languagePacks[localizationContribution.languageId] = languagePack;
                    }
                    var extensionInLanguagePack = languagePack.extensions.filter(function (e) { return extensionManagementUtil_1.areSameExtensions(e.extensionIdentifier, extensionIdentifier); })[0];
                    if (extensionInLanguagePack) {
                        extensionInLanguagePack.version = extension.manifest.version;
                    }
                    else {
                        languagePack.extensions.push({ extensionIdentifier: extensionIdentifier, version: extension.manifest.version });
                    }
                    for (var _b = 0, _c = localizationContribution.translations; _b < _c.length; _b++) {
                        var translation = _c[_b];
                        languagePack.translations[translation.id] = paths_1.join(extension.path, translation.path);
                    }
                }
            }
        };
        LanguagePacksCache.prototype.updateHash = function (languagePack) {
            if (languagePack) {
                var md5 = crypto_1.createHash('md5');
                for (var _i = 0, _a = languagePack.extensions; _i < _a.length; _i++) {
                    var extension = _a[_i];
                    md5.update(extension.extensionIdentifier.uuid || extension.extensionIdentifier.id).update(extension.version);
                }
                languagePack.hash = md5.digest('hex');
            }
        };
        LanguagePacksCache.prototype.withLanguagePacks = function (fn) {
            var _this = this;
            if (fn === void 0) { fn = function () { return null; }; }
            return this.languagePacksFileLimiter.queue(function () {
                var result = null;
                return pfs.readFile(_this.languagePacksFilePath, 'utf8')
                    .then(null, function (err) { return err.code === 'ENOENT' ? winjs_base_1.TPromise.as('{}') : winjs_base_1.TPromise.wrapError(err); })
                    .then(function (raw) { try {
                    return JSON.parse(raw);
                }
                catch (e) {
                    return {};
                } })
                    .then(function (languagePacks) { result = fn(languagePacks); return languagePacks; })
                    .then(function (languagePacks) {
                    for (var _i = 0, _a = Object.keys(languagePacks); _i < _a.length; _i++) {
                        var language = _a[_i];
                        if (!languagePacks[language]) {
                            delete languagePacks[language];
                        }
                    }
                    _this.languagePacks = languagePacks;
                    var raw = JSON.stringify(_this.languagePacks);
                    _this.logService.debug('Writing language packs', raw);
                    return pfs.writeFile(_this.languagePacksFilePath, raw);
                })
                    .then(function () { return result; }, function (error) { return _this.logService.error(error); });
            });
        };
        LanguagePacksCache = __decorate([
            __param(0, environment_1.IEnvironmentService),
            __param(1, log_1.ILogService)
        ], LanguagePacksCache);
        return LanguagePacksCache;
    }(lifecycle_1.Disposable));
});
