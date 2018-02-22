var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/extensions", "vs/editor/contrib/suggest/suggest", "vs/editor/common/services/modeService", "vs/editor/common/core/position", "vs/base/common/strings", "vs/editor/contrib/snippet/snippetParser", "vs/platform/environment/common/environment", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "path", "vs/base/node/pfs", "vs/base/node/extfs", "vs/workbench/parts/snippets/electron-browser/snippetsFile", "vs/workbench/parts/snippets/electron-browser/snippets.contribution", "vs/platform/extensions/common/extensionsRegistry", "vs/workbench/services/mode/common/workbenchModeService", "vs/base/common/htmlContent", "vs/platform/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/base/common/map"], function (require, exports, nls_1, extensions_1, suggest_1, modeService_1, position_1, strings_1, snippetParser_1, environment_1, extensions_2, lifecycle_1, path_1, pfs_1, extfs_1, snippetsFile_1, snippets_contribution_1, extensionsRegistry_1, workbenchModeService_1, htmlContent_1, lifecycle_2, log_1, map_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var schema;
    (function (schema) {
        function isValidSnippet(extension, snippet, modeService) {
            if (strings_1.isFalsyOrWhitespace(snippet.path)) {
                extension.collector.error(nls_1.localize('invalid.path.0', "Expected string in `contributes.{0}.path`. Provided value: {1}", extension.description.name, String(snippet.path)));
                return false;
            }
            else if (strings_1.isFalsyOrWhitespace(snippet.language) && !strings_1.endsWith(snippet.path, '.code-snippets')) {
                extension.collector.error(nls_1.localize('invalid.language.0', "When omitting the language, the value of `contributes.{0}.path` must be a `.code-snippets`-file. Provided value: {1}", extension.description.name, String(snippet.path)));
                return false;
            }
            else if (!strings_1.isFalsyOrWhitespace(snippet.language) && !modeService.isRegisteredMode(snippet.language)) {
                extension.collector.error(nls_1.localize('invalid.language', "Unknown language in `contributes.{0}.language`. Provided value: {1}", extension.description.name, String(snippet.language)));
                return false;
            }
            else {
                var normalizedAbsolutePath = path_1.join(extension.description.extensionFolderPath, snippet.path);
                if (normalizedAbsolutePath.indexOf(extension.description.extensionFolderPath) !== 0) {
                    extension.collector.error(nls_1.localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", extension.description.name, normalizedAbsolutePath, extension.description.extensionFolderPath));
                    return false;
                }
                snippet.path = normalizedAbsolutePath;
                return true;
            }
        }
        schema.isValidSnippet = isValidSnippet;
        schema.snippetsContribution = {
            description: nls_1.localize('vscode.extension.contributes.snippets', 'Contributes snippets.'),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '', path: '' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { language: '${1:id}', path: './snippets/${2:id}.json.' } }],
                properties: {
                    language: {
                        description: nls_1.localize('vscode.extension.contributes.snippets-language', 'Language identifier for which this snippet is contributed to.'),
                        type: 'string'
                    },
                    path: {
                        description: nls_1.localize('vscode.extension.contributes.snippets-path', 'Path of the snippets file. The path is relative to the extension folder and typically starts with \'./snippets/\'.'),
                        type: 'string'
                    }
                }
            }
        };
    })(schema || (schema = {}));
    var SnippetsService = /** @class */ (function () {
        function SnippetsService(_environmentService, _modeService, _logService, extensionService, lifecycleService) {
            var _this = this;
            this._environmentService = _environmentService;
            this._modeService = _modeService;
            this._logService = _logService;
            this._disposables = [];
            this._files = new Map();
            this._initExtensionSnippets();
            this._initPromise = Promise.resolve(lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () { return _this._initUserSnippets(); }));
            suggest_1.setSnippetSuggestSupport(new SnippetSuggestProvider(this._modeService, this));
        }
        SnippetsService.prototype.dispose = function () {
            lifecycle_1.dispose(this._disposables);
        };
        SnippetsService.prototype.getSnippetFiles = function () {
            var _this = this;
            return this._initPromise.then(function () { return map_1.values(_this._files); });
        };
        SnippetsService.prototype.getSnippets = function (languageId) {
            var _this = this;
            return this._initPromise.then(function () {
                var langName = _this._modeService.getLanguageIdentifier(languageId).language;
                var result = [];
                var promises = [];
                _this._files.forEach(function (file) {
                    promises.push(file.load()
                        .then(function (file) { return file.select(langName, result); })
                        .catch(function (err) { return _this._logService.error(err, file.filepath); }));
                });
                return Promise.all(promises).then(function () { return result; });
            });
        };
        SnippetsService.prototype.getSnippetsSync = function (languageId) {
            var langName = this._modeService.getLanguageIdentifier(languageId).language;
            var result = [];
            this._files.forEach(function (file) {
                // kick off loading (which is a noop in case it's already loaded)
                // and optimistically collect snippets
                file.load().catch(function (err) { });
                file.select(langName, result);
            });
            return result;
        };
        // --- loading, watching
        SnippetsService.prototype._initExtensionSnippets = function () {
            var _this = this;
            extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('snippets', [workbenchModeService_1.languagesExtPoint], schema.snippetsContribution).setHandler(function (extensions) {
                var _loop_1 = function (extension) {
                    var _loop_2 = function (contribution) {
                        if (!schema.isValidSnippet(extension, contribution, _this._modeService)) {
                            return "continue";
                        }
                        if (_this._files.has(contribution.path)) {
                            _this._files.get(contribution.path).defaultScopes.push(contribution.language);
                        }
                        else {
                            var file_1 = new snippetsFile_1.SnippetFile(contribution.path, contribution.language ? [contribution.language] : undefined, extension.description);
                            _this._files.set(file_1.filepath, file_1);
                            if (_this._environmentService.isExtensionDevelopment) {
                                file_1.load().then(function (file) {
                                    // warn about bad tabstop/variable usage
                                    if (file.data.some(function (snippet) { return snippet.isBogous; })) {
                                        extension.collector.warn(nls_1.localize('badVariableUse', "One or more snippets from the extension '{0}' very likely confuse snippet-variables and snippet-placeholders (see https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax for more details)", extension.description.name));
                                    }
                                }, function (err) {
                                    // generic error
                                    extension.collector.warn(nls_1.localize('badFile', "The snippet file \"{0}\" could not be read.", file_1.filepath));
                                });
                            }
                        }
                    };
                    for (var _i = 0, _a = extension.value; _i < _a.length; _i++) {
                        var contribution = _a[_i];
                        _loop_2(contribution);
                    }
                };
                for (var _i = 0, extensions_3 = extensions; _i < extensions_3.length; _i++) {
                    var extension = extensions_3[_i];
                    _loop_1(extension);
                }
            });
        };
        SnippetsService.prototype._initUserSnippets = function () {
            var _this = this;
            var addUserSnippet = function (filepath) {
                var ext = path_1.extname(filepath);
                if (ext === '.json') {
                    var langName = path_1.basename(filepath, '.json');
                    _this._files.set(filepath, new snippetsFile_1.SnippetFile(filepath, [langName], undefined));
                }
                else if (ext === '.code-snippets') {
                    _this._files.set(filepath, new snippetsFile_1.SnippetFile(filepath, undefined, undefined));
                }
            };
            var userSnippetsFolder = path_1.join(this._environmentService.appSettingsHome, 'snippets');
            return pfs_1.mkdirp(userSnippetsFolder).then(function () {
                return pfs_1.readdir(userSnippetsFolder);
            }).then(function (entries) {
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var entry = entries_1[_i];
                    addUserSnippet(path_1.join(userSnippetsFolder, entry));
                }
            }).then(function () {
                // watch
                var watcher = extfs_1.watch(userSnippetsFolder, function (type, filename) {
                    if (typeof filename !== 'string') {
                        return;
                    }
                    var filepath = path_1.join(userSnippetsFolder, filename);
                    pfs_1.exists(filepath).then(function (value) {
                        if (value) {
                            // file created or changed
                            if (_this._files.has(filepath)) {
                                _this._files.get(filepath).reset();
                            }
                            else {
                                addUserSnippet(filepath);
                            }
                        }
                        else {
                            // file not found
                            _this._files.delete(filepath);
                        }
                    });
                }, function (error) { return _this._logService.error(error); });
                _this._disposables.push({
                    dispose: function () {
                        if (watcher) {
                            watcher.removeAllListeners();
                            watcher.close();
                        }
                    }
                });
            }).then(undefined, function (err) {
                _this._logService.error('Failed to load user snippets', err);
            });
        };
        SnippetsService = __decorate([
            __param(0, environment_1.IEnvironmentService),
            __param(1, modeService_1.IModeService),
            __param(2, log_1.ILogService),
            __param(3, extensions_2.IExtensionService),
            __param(4, lifecycle_2.ILifecycleService)
        ], SnippetsService);
        return SnippetsService;
    }());
    extensions_1.registerSingleton(snippets_contribution_1.ISnippetsService, SnippetsService);
    var SnippetSuggestion = /** @class */ (function () {
        function SnippetSuggestion(snippet, overwriteBefore) {
            this.snippet = snippet;
            this.label = snippet.prefix;
            this.detail = nls_1.localize('detail.snippet', "{0} ({1})", snippet.description || snippet.name, snippet.source);
            this.insertText = snippet.body;
            this.overwriteBefore = overwriteBefore;
            this.sortText = (snippet.isFromExtension ? 'z' : 'a') + "-" + snippet.prefix;
            this.noAutoAccept = true;
            this.type = 'snippet';
            this.snippetType = 'textmate';
        }
        SnippetSuggestion.prototype.resolve = function () {
            this.documentation = new htmlContent_1.MarkdownString().appendCodeblock('', new snippetParser_1.SnippetParser().text(this.snippet.codeSnippet));
            this.insertText = this.snippet.codeSnippet;
            return this;
        };
        SnippetSuggestion.compareByLabel = function (a, b) {
            return strings_1.compare(a.label, b.label);
        };
        return SnippetSuggestion;
    }());
    exports.SnippetSuggestion = SnippetSuggestion;
    var SnippetSuggestProvider = /** @class */ (function () {
        function SnippetSuggestProvider(_modeService, _snippets) {
            this._modeService = _modeService;
            this._snippets = _snippets;
            //
        }
        SnippetSuggestProvider.prototype.provideCompletionItems = function (model, position) {
            var languageId = this._getLanguageIdAtPosition(model, position);
            return this._snippets.getSnippets(languageId).then(function (snippets) {
                var suggestions = [];
                var lowWordUntil = model.getWordUntilPosition(position).word.toLowerCase();
                var lowLineUntil = model.getLineContent(position.lineNumber).substr(Math.max(0, position.column - 100), position.column - 1).toLowerCase();
                for (var _i = 0, snippets_1 = snippets; _i < snippets_1.length; _i++) {
                    var snippet = snippets_1[_i];
                    var lowPrefix = snippet.prefix.toLowerCase();
                    var overwriteBefore = 0;
                    var accetSnippet = true;
                    if (lowWordUntil.length > 0 && strings_1.startsWith(lowPrefix, lowWordUntil)) {
                        // cheap match on the (none-empty) current word
                        overwriteBefore = lowWordUntil.length;
                        accetSnippet = true;
                    }
                    else if (lowLineUntil.length > 0 && lowLineUntil.match(/[^\s]$/)) {
                        // compute overlap between snippet and (none-empty) line on text
                        overwriteBefore = strings_1.overlap(lowLineUntil, snippet.prefix.toLowerCase());
                        accetSnippet = overwriteBefore > 0 && !model.getWordAtPosition(new position_1.Position(position.lineNumber, position.column - overwriteBefore));
                    }
                    if (accetSnippet) {
                        suggestions.push(new SnippetSuggestion(snippet, overwriteBefore));
                    }
                }
                // dismbiguate suggestions with same labels
                var lastItem;
                for (var _a = 0, _b = suggestions.sort(SnippetSuggestion.compareByLabel); _a < _b.length; _a++) {
                    var item = _b[_a];
                    if (lastItem && lastItem.label === item.label) {
                        // use the disambiguateLabel instead of the actual label
                        lastItem.label = nls_1.localize('snippetSuggest.longLabel', "{0}, {1}", lastItem.label, lastItem.snippet.name);
                        item.label = nls_1.localize('snippetSuggest.longLabel', "{0}, {1}", item.label, item.snippet.name);
                    }
                    lastItem = item;
                }
                return { suggestions: suggestions };
            });
        };
        SnippetSuggestProvider.prototype.resolveCompletionItem = function (model, position, item) {
            return (item instanceof SnippetSuggestion) ? item.resolve() : item;
        };
        SnippetSuggestProvider.prototype._getLanguageIdAtPosition = function (model, position) {
            // validate the `languageId` to ensure this is a user
            // facing language with a name and the chance to have
            // snippets, else fall back to the outer language
            model.tokenizeIfCheap(position.lineNumber);
            var languageId = model.getLanguageIdAtPosition(position.lineNumber, position.column);
            var language = this._modeService.getLanguageIdentifier(languageId).language;
            if (!this._modeService.getLanguageName(language)) {
                languageId = model.getLanguageIdentifier().id;
            }
            return languageId;
        };
        SnippetSuggestProvider = __decorate([
            __param(0, modeService_1.IModeService),
            __param(1, snippets_contribution_1.ISnippetsService)
        ], SnippetSuggestProvider);
        return SnippetSuggestProvider;
    }());
    exports.SnippetSuggestProvider = SnippetSuggestProvider;
    function getNonWhitespacePrefix(model, position) {
        /**
         * Do not analyze more characters
         */
        var MAX_PREFIX_LENGTH = 100;
        var line = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
        var minChIndex = Math.max(0, line.length - MAX_PREFIX_LENGTH);
        for (var chIndex = line.length - 1; chIndex >= minChIndex; chIndex--) {
            var ch = line.charAt(chIndex);
            if (/\s/.test(ch)) {
                return line.substr(chIndex + 1);
            }
        }
        if (minChIndex === 0) {
            return line;
        }
        return '';
    }
    exports.getNonWhitespacePrefix = getNonWhitespacePrefix;
});
