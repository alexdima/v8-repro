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
define(["require", "exports", "vs/nls", "vs/base/node/pfs", "vs/base/common/winjs.base", "path", "vs/base/common/json", "vs/base/common/types", "vs/platform/extensions/node/extensionValidator", "semver", "vs/platform/extensionManagement/node/extensionManagementUtil", "vs/base/common/jsonErrorMessages", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, nls, pfs, winjs_base_1, path_1, json, types, extensionValidator_1, semver, extensionManagementUtil_1, jsonErrorMessages_1, extensionManagementUtil_2) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MANIFEST_FILE = 'package.json';
    var Translations;
    (function (Translations) {
        function equals(a, b) {
            if (a === b) {
                return true;
            }
            var aKeys = Object.keys(a);
            var bKeys = new Set();
            for (var _i = 0, _a = Object.keys(b); _i < _a.length; _i++) {
                var key = _a[_i];
                bKeys.add(key);
            }
            if (aKeys.length !== bKeys.size) {
                return false;
            }
            for (var _b = 0, aKeys_1 = aKeys; _b < aKeys_1.length; _b++) {
                var key = aKeys_1[_b];
                if (a[key] !== b[key]) {
                    return false;
                }
                bKeys.delete(key);
            }
            return bKeys.size === 0;
        }
        Translations.equals = equals;
    })(Translations || (Translations = {}));
    var ExtensionManifestHandler = /** @class */ (function () {
        function ExtensionManifestHandler(ourVersion, log, absoluteFolderPath, isBuiltin) {
            this._ourVersion = ourVersion;
            this._log = log;
            this._absoluteFolderPath = absoluteFolderPath;
            this._isBuiltin = isBuiltin;
            this._absoluteManifestPath = path_1.join(absoluteFolderPath, MANIFEST_FILE);
        }
        return ExtensionManifestHandler;
    }());
    var ExtensionManifestParser = /** @class */ (function (_super) {
        __extends(ExtensionManifestParser, _super);
        function ExtensionManifestParser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ExtensionManifestParser.prototype.parse = function () {
            var _this = this;
            return pfs.readFile(this._absoluteManifestPath).then(function (manifestContents) {
                try {
                    var manifest = JSON.parse(manifestContents.toString());
                    if (manifest.__metadata) {
                        manifest.uuid = manifest.__metadata.id;
                    }
                    delete manifest.__metadata;
                    return manifest;
                }
                catch (e) {
                    _this._log.error(_this._absoluteFolderPath, nls.localize('jsonParseFail', "Failed to parse {0}: {1}.", _this._absoluteManifestPath, jsonErrorMessages_1.getParseErrorMessage(e.message)));
                }
                return null;
            }, function (err) {
                if (err.code === 'ENOENT') {
                    return null;
                }
                _this._log.error(_this._absoluteFolderPath, nls.localize('fileReadFail', "Cannot read file {0}: {1}.", _this._absoluteManifestPath, err.message));
                return null;
            });
        };
        return ExtensionManifestParser;
    }(ExtensionManifestHandler));
    var ExtensionManifestNLSReplacer = /** @class */ (function (_super) {
        __extends(ExtensionManifestNLSReplacer, _super);
        function ExtensionManifestNLSReplacer(ourVersion, log, absoluteFolderPath, isBuiltin, nlsConfig) {
            var _this = _super.call(this, ourVersion, log, absoluteFolderPath, isBuiltin) || this;
            _this._nlsConfig = nlsConfig;
            return _this;
        }
        ExtensionManifestNLSReplacer.prototype.replaceNLS = function (extensionDescription) {
            var _this = this;
            var reportErrors = function (localized, errors) {
                errors.forEach(function (error) {
                    _this._log.error(_this._absoluteFolderPath, nls.localize('jsonsParseReportErrors', "Failed to parse {0}: {1}.", localized, jsonErrorMessages_1.getParseErrorMessage(error.error)));
                });
            };
            var extension = path_1.extname(this._absoluteManifestPath);
            var basename = this._absoluteManifestPath.substr(0, this._absoluteManifestPath.length - extension.length);
            var translationId = extensionDescription.publisher + "." + extensionDescription.name;
            var translationPath = this._nlsConfig.translations[translationId];
            var localizedMessages;
            if (translationPath) {
                localizedMessages = pfs.readFile(translationPath, 'utf8').then(function (content) {
                    var errors = [];
                    var translationBundle = json.parse(content, errors);
                    if (errors.length > 0) {
                        reportErrors(translationPath, errors);
                        return { values: undefined, default: basename + ".nls.json" };
                    }
                    else {
                        var values = translationBundle.contents ? translationBundle.contents.package : undefined;
                        return { values: values, default: basename + ".nls.json" };
                    }
                }, function (error) {
                    return { values: undefined, default: basename + ".nls.json" };
                });
            }
            else {
                localizedMessages = pfs.fileExists(basename + '.nls' + extension).then(function (exists) {
                    if (!exists) {
                        return undefined;
                    }
                    return ExtensionManifestNLSReplacer.findMessageBundles(_this._nlsConfig, basename).then(function (messageBundle) {
                        if (!messageBundle.localized) {
                            return { values: undefined, default: messageBundle.original };
                        }
                        return pfs.readFile(messageBundle.localized, 'utf8').then(function (messageBundleContent) {
                            var errors = [];
                            var messages = json.parse(messageBundleContent, errors);
                            if (errors.length > 0) {
                                reportErrors(messageBundle.localized, errors);
                                return { values: undefined, default: messageBundle.original };
                            }
                            return { values: messages, default: messageBundle.original };
                        }, function (err) {
                            return { values: undefined, default: messageBundle.original };
                        });
                    }, function (err) {
                        return undefined;
                    });
                });
            }
            return localizedMessages.then(function (localizedMessages) {
                if (localizedMessages === undefined) {
                    return extensionDescription;
                }
                var errors = [];
                // resolveOriginalMessageBundle returns null if localizedMessages.default === undefined;
                return ExtensionManifestNLSReplacer.resolveOriginalMessageBundle(localizedMessages.default, errors).then(function (defaults) {
                    if (errors.length > 0) {
                        reportErrors(localizedMessages.default, errors);
                        return extensionDescription;
                    }
                    var localized = localizedMessages.values || Object.create(null);
                    ExtensionManifestNLSReplacer._replaceNLStrings(_this._nlsConfig, extensionDescription, localized, defaults, _this._log, _this._absoluteFolderPath);
                    return extensionDescription;
                });
            }, function (err) {
                return extensionDescription;
            });
        };
        /**
         * Parses original message bundle, returns null if the original message bundle is null.
         */
        ExtensionManifestNLSReplacer.resolveOriginalMessageBundle = function (originalMessageBundle, errors) {
            return new winjs_base_1.TPromise(function (c, e, p) {
                if (originalMessageBundle) {
                    pfs.readFile(originalMessageBundle).then(function (originalBundleContent) {
                        c(json.parse(originalBundleContent.toString(), errors));
                    }, function (err) {
                        c(null);
                    });
                }
                else {
                    c(null);
                }
            });
        };
        /**
         * Finds localized message bundle and the original (unlocalized) one.
         * If the localized file is not present, returns null for the original and marks original as localized.
         */
        ExtensionManifestNLSReplacer.findMessageBundles = function (nlsConfig, basename) {
            return new winjs_base_1.TPromise(function (c, e, p) {
                function loop(basename, locale) {
                    var toCheck = basename + ".nls." + locale + ".json";
                    pfs.fileExists(toCheck).then(function (exists) {
                        if (exists) {
                            c({ localized: toCheck, original: basename + ".nls.json" });
                        }
                        var index = locale.lastIndexOf('-');
                        if (index === -1) {
                            c({ localized: basename + ".nls.json", original: null });
                        }
                        else {
                            locale = locale.substring(0, index);
                            loop(basename, locale);
                        }
                    });
                }
                if (nlsConfig.devMode || nlsConfig.pseudo || !nlsConfig.locale) {
                    return c({ localized: basename + '.nls.json', original: null });
                }
                loop(basename, nlsConfig.locale);
            });
        };
        /**
         * This routine makes the following assumptions:
         * The root element is an object literal
         */
        ExtensionManifestNLSReplacer._replaceNLStrings = function (nlsConfig, literal, messages, originalMessages, log, messageScope) {
            function processEntry(obj, key, command) {
                var value = obj[key];
                if (types.isString(value)) {
                    var str = value;
                    var length_1 = str.length;
                    if (length_1 > 1 && str[0] === '%' && str[length_1 - 1] === '%') {
                        var messageKey = str.substr(1, length_1 - 2);
                        var message = messages[messageKey];
                        // If the messages come from a language pack they might miss some keys
                        // Fill them from the original messages.
                        if (message === undefined && originalMessages) {
                            message = originalMessages[messageKey];
                        }
                        if (message) {
                            if (nlsConfig.pseudo) {
                                // FF3B and FF3D is the Unicode zenkaku representation for [ and ]
                                message = '\uFF3B' + message.replace(/[aouei]/g, '$&$&') + '\uFF3D';
                            }
                            obj[key] = command && (key === 'title' || key === 'category') && originalMessages ? { value: message, original: originalMessages[messageKey] } : message;
                        }
                        else {
                            log.warn(messageScope, nls.localize('missingNLSKey', "Couldn't find message for key {0}.", messageKey));
                        }
                    }
                }
                else if (types.isObject(value)) {
                    for (var k in value) {
                        if (value.hasOwnProperty(k)) {
                            k === 'commands' ? processEntry(value, k, true) : processEntry(value, k, command);
                        }
                    }
                }
                else if (types.isArray(value)) {
                    for (var i = 0; i < value.length; i++) {
                        processEntry(value, i, command);
                    }
                }
            }
            for (var key in literal) {
                if (literal.hasOwnProperty(key)) {
                    processEntry(literal, key);
                }
            }
        };
        return ExtensionManifestNLSReplacer;
    }(ExtensionManifestHandler));
    var ExtensionManifestValidator = /** @class */ (function (_super) {
        __extends(ExtensionManifestValidator, _super);
        function ExtensionManifestValidator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ExtensionManifestValidator.prototype.validate = function (_extensionDescription) {
            var _this = this;
            var extensionDescription = _extensionDescription;
            extensionDescription.isBuiltin = this._isBuiltin;
            var notices = [];
            if (!extensionValidator_1.isValidExtensionDescription(this._ourVersion, this._absoluteFolderPath, extensionDescription, notices)) {
                notices.forEach(function (error) {
                    _this._log.error(_this._absoluteFolderPath, error);
                });
                return null;
            }
            // in this case the notices are warnings
            notices.forEach(function (error) {
                _this._log.warn(_this._absoluteFolderPath, error);
            });
            // id := `publisher.name`
            extensionDescription.id = extensionDescription.publisher + "." + extensionDescription.name;
            // main := absolutePath(`main`)
            if (extensionDescription.main) {
                extensionDescription.main = path_1.join(this._absoluteFolderPath, extensionDescription.main);
            }
            extensionDescription.extensionFolderPath = this._absoluteFolderPath;
            return extensionDescription;
        };
        return ExtensionManifestValidator;
    }(ExtensionManifestHandler));
    var ExtensionScannerInput = /** @class */ (function () {
        function ExtensionScannerInput(ourVersion, commit, locale, devMode, absoluteFolderPath, isBuiltin, tanslations) {
            this.ourVersion = ourVersion;
            this.commit = commit;
            this.locale = locale;
            this.devMode = devMode;
            this.absoluteFolderPath = absoluteFolderPath;
            this.isBuiltin = isBuiltin;
            this.tanslations = tanslations;
            // Keep empty!! (JSON.parse)
        }
        ExtensionScannerInput.createNLSConfig = function (input) {
            return {
                devMode: input.devMode,
                locale: input.locale,
                pseudo: input.locale === 'pseudo',
                translations: input.tanslations
            };
        };
        ExtensionScannerInput.equals = function (a, b) {
            return (a.ourVersion === b.ourVersion
                && a.commit === b.commit
                && a.locale === b.locale
                && a.devMode === b.devMode
                && a.absoluteFolderPath === b.absoluteFolderPath
                && a.isBuiltin === b.isBuiltin
                && a.mtime === b.mtime
                && Translations.equals(a.tanslations, b.tanslations));
        };
        return ExtensionScannerInput;
    }());
    exports.ExtensionScannerInput = ExtensionScannerInput;
    var DefaultExtensionResolver = /** @class */ (function () {
        function DefaultExtensionResolver(root) {
            this.root = root;
        }
        DefaultExtensionResolver.prototype.resolveExtensions = function () {
            var _this = this;
            return pfs.readDirsInDir(this.root)
                .then(function (folders) { return folders.map(function (name) { return ({ name: name, path: path_1.join(_this.root, name) }); }); });
        };
        return DefaultExtensionResolver;
    }());
    var ExtensionScanner = /** @class */ (function () {
        function ExtensionScanner() {
        }
        /**
         * Read the extension defined in `absoluteFolderPath`
         */
        ExtensionScanner.scanExtension = function (version, log, absoluteFolderPath, isBuiltin, nlsConfig) {
            absoluteFolderPath = path_1.normalize(absoluteFolderPath);
            var parser = new ExtensionManifestParser(version, log, absoluteFolderPath, isBuiltin);
            return parser.parse().then(function (extensionDescription) {
                if (extensionDescription === null) {
                    return null;
                }
                var nlsReplacer = new ExtensionManifestNLSReplacer(version, log, absoluteFolderPath, isBuiltin, nlsConfig);
                return nlsReplacer.replaceNLS(extensionDescription);
            }).then(function (extensionDescription) {
                if (extensionDescription === null) {
                    return null;
                }
                var validator = new ExtensionManifestValidator(version, log, absoluteFolderPath, isBuiltin);
                return validator.validate(extensionDescription);
            });
        };
        /**
         * Scan a list of extensions defined in `absoluteFolderPath`
         */
        ExtensionScanner.scanExtensions = function (input, log, resolver) {
            if (resolver === void 0) { resolver = null; }
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _this = this;
                var absoluteFolderPath, isBuiltin, obsolete_1, obsoleteFileContents, err_1, refs, nonGallery_1, gallery_1, nlsConfig_1, extensionDescriptions, byExtension, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            absoluteFolderPath = input.absoluteFolderPath;
                            isBuiltin = input.isBuiltin;
                            if (!resolver) {
                                resolver = new DefaultExtensionResolver(absoluteFolderPath);
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 8, , 9]);
                            obsolete_1 = {};
                            if (!!isBuiltin) return [3 /*break*/, 5];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, pfs.readFile(path_1.join(absoluteFolderPath, '.obsolete'), 'utf8')];
                        case 3:
                            obsoleteFileContents = _a.sent();
                            obsolete_1 = JSON.parse(obsoleteFileContents);
                            return [3 /*break*/, 5];
                        case 4:
                            err_1 = _a.sent();
                            return [3 /*break*/, 5];
                        case 5: return [4 /*yield*/, resolver.resolveExtensions()];
                        case 6:
                            refs = _a.sent();
                            // Ensure the same extension order
                            refs.sort(function (a, b) { return a.name < b.name ? -1 : 1; });
                            if (!isBuiltin) {
                                nonGallery_1 = [];
                                gallery_1 = [];
                                refs.forEach(function (ref) {
                                    var _a = extensionManagementUtil_1.getIdAndVersionFromLocalExtensionId(ref.name), id = _a.id, version = _a.version;
                                    if (!id || !version) {
                                        nonGallery_1.push(ref);
                                    }
                                    else {
                                        gallery_1.push(ref);
                                    }
                                });
                                refs = nonGallery_1.concat(gallery_1);
                            }
                            nlsConfig_1 = ExtensionScannerInput.createNLSConfig(input);
                            return [4 /*yield*/, winjs_base_1.TPromise.join(refs.map(function (r) { return _this.scanExtension(input.ourVersion, log, r.path, isBuiltin, nlsConfig_1); }))];
                        case 7:
                            extensionDescriptions = _a.sent();
                            extensionDescriptions = extensionDescriptions.filter(function (item) { return item !== null && !obsolete_1[extensionManagementUtil_2.getLocalExtensionId(extensionManagementUtil_2.getGalleryExtensionId(item.publisher, item.name), item.version)]; });
                            if (!isBuiltin) {
                                byExtension = extensionManagementUtil_2.groupByExtension(extensionDescriptions, function (e) { return ({ id: e.id, uuid: e.uuid }); });
                                extensionDescriptions = byExtension.map(function (p) { return p.sort(function (a, b) { return semver.rcompare(a.version, b.version); })[0]; });
                            }
                            extensionDescriptions.sort(function (a, b) {
                                if (a.extensionFolderPath < b.extensionFolderPath) {
                                    return -1;
                                }
                                return 1;
                            });
                            return [2 /*return*/, extensionDescriptions];
                        case 8:
                            err_2 = _a.sent();
                            log.error(absoluteFolderPath, err_2);
                            return [2 /*return*/, []];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Combination of scanExtension and scanExtensions: If an extension manifest is found at root, we load just this extension,
         * otherwise we assume the folder contains multiple extensions.
         */
        ExtensionScanner.scanOneOrMultipleExtensions = function (input, log) {
            var _this = this;
            var absoluteFolderPath = input.absoluteFolderPath;
            var isBuiltin = input.isBuiltin;
            return pfs.fileExists(path_1.join(absoluteFolderPath, MANIFEST_FILE)).then(function (exists) {
                if (exists) {
                    var nlsConfig = ExtensionScannerInput.createNLSConfig(input);
                    return _this.scanExtension(input.ourVersion, log, absoluteFolderPath, isBuiltin, nlsConfig).then(function (extensionDescription) {
                        if (extensionDescription === null) {
                            return [];
                        }
                        return [extensionDescription];
                    });
                }
                return _this.scanExtensions(input, log);
            }, function (err) {
                log.error(absoluteFolderPath, err);
                return [];
            });
        };
        return ExtensionScanner;
    }());
    exports.ExtensionScanner = ExtensionScanner;
});
