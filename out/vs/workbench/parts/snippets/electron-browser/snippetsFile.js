/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/json", "vs/base/common/collections", "vs/nls", "vs/base/node/pfs", "path", "vs/editor/contrib/snippet/snippetParser", "vs/editor/contrib/snippet/snippetVariables", "vs/base/common/strings"], function (require, exports, json_1, collections_1, nls_1, pfs_1, path_1, snippetParser_1, snippetVariables_1, strings_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Snippet = /** @class */ (function () {
        function Snippet(scopes, name, prefix, description, body, source, isFromExtension) {
            this.scopes = scopes;
            this.name = name;
            this.prefix = prefix;
            this.description = description;
            this.body = body;
            this.source = source;
            this.isFromExtension = isFromExtension;
            //
        }
        Object.defineProperty(Snippet.prototype, "codeSnippet", {
            get: function () {
                this._ensureCodeSnippet();
                return this._codeSnippet;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Snippet.prototype, "isBogous", {
            get: function () {
                this._ensureCodeSnippet();
                return this._isBogous;
            },
            enumerable: true,
            configurable: true
        });
        Snippet.prototype._ensureCodeSnippet = function () {
            if (!this._codeSnippet) {
                var rewrite = Snippet._rewriteBogousVariables(this.body);
                if (typeof rewrite === 'string') {
                    this._codeSnippet = rewrite;
                    this._isBogous = true;
                }
                else {
                    this._codeSnippet = this.body;
                    this._isBogous = false;
                }
            }
        };
        Snippet.compare = function (a, b) {
            if (a.isFromExtension !== b.isFromExtension) {
                if (a.isFromExtension) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
            else if (a.name > b.name) {
                return 1;
            }
            else if (a.name < b.name) {
                return -1;
            }
            else {
                return 0;
            }
        };
        Snippet._rewriteBogousVariables = function (template) {
            var textmateSnippet = new snippetParser_1.SnippetParser().parse(template, false);
            var placeholders = new Map();
            var placeholderMax = 0;
            for (var _i = 0, _a = textmateSnippet.placeholders; _i < _a.length; _i++) {
                var placeholder = _a[_i];
                placeholderMax = Math.max(placeholderMax, placeholder.index);
            }
            var didChange = false;
            var stack = textmateSnippet.children.slice();
            while (stack.length > 0) {
                var marker = stack.shift();
                if (marker instanceof snippetParser_1.Variable
                    && marker.children.length === 0
                    && !snippetVariables_1.KnownSnippetVariableNames[marker.name]) {
                    // a 'variable' without a default value and not being one of our supported
                    // variables is automatically turned into a placeholder. This is to restore
                    // a bug we had before. So `${foo}` becomes `${N:foo}`
                    var index = placeholders.has(marker.name) ? placeholders.get(marker.name) : ++placeholderMax;
                    placeholders.set(marker.name, index);
                    var synthetic = new snippetParser_1.Placeholder(index).appendChild(new snippetParser_1.Text(marker.name));
                    textmateSnippet.replace(marker, [synthetic]);
                    didChange = true;
                }
                else {
                    // recurse
                    stack.push.apply(stack, marker.children);
                }
            }
            if (!didChange) {
                return false;
            }
            else {
                return textmateSnippet.toTextmateString();
            }
        };
        return Snippet;
    }());
    exports.Snippet = Snippet;
    function isJsonSerializedSnippet(thing) {
        return Boolean(thing.body) && Boolean(thing.prefix);
    }
    var SnippetFile = /** @class */ (function () {
        function SnippetFile(filepath, defaultScopes, _extension) {
            this.filepath = filepath;
            this.defaultScopes = defaultScopes;
            this._extension = _extension;
            this.data = [];
            this.isGlobalSnippets = path_1.extname(filepath) === '.code-snippets';
            this.isUserSnippets = !this._extension;
        }
        SnippetFile.prototype.select = function (selector, bucket) {
            if (this.isGlobalSnippets || !this.isUserSnippets) {
                this._scopeSelect(selector, bucket);
            }
            else {
                this._filepathSelect(selector, bucket);
            }
        };
        SnippetFile.prototype._filepathSelect = function (selector, bucket) {
            // for `fooLang.json` files all snippets are accepted
            if (selector === path_1.basename(this.filepath, '.json')) {
                bucket.push.apply(bucket, this.data);
            }
        };
        SnippetFile.prototype._scopeSelect = function (selector, bucket) {
            // for `my.code-snippets` files we need to look at each snippet
            for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
                var snippet = _a[_i];
                var len = snippet.scopes.length;
                if (len === 0) {
                    // always accept
                    bucket.push(snippet);
                }
                else {
                    for (var i = 0; i < len; i++) {
                        // match
                        if (snippet.scopes[i] === selector) {
                            bucket.push(snippet);
                            break; // match only once!
                        }
                    }
                }
            }
            var idx = selector.lastIndexOf('.');
            if (idx >= 0) {
                this._scopeSelect(selector.substring(0, idx), bucket);
            }
        };
        SnippetFile.prototype.load = function () {
            var _this = this;
            if (!this._loadPromise) {
                this._loadPromise = Promise.resolve(pfs_1.readFile(this.filepath)).then(function (value) {
                    var data = json_1.parse(value.toString());
                    if (typeof data === 'object') {
                        collections_1.forEach(data, function (entry) {
                            var name = entry.key, scopeOrTemplate = entry.value;
                            if (isJsonSerializedSnippet(scopeOrTemplate)) {
                                _this._parseSnippet(name, scopeOrTemplate, _this.data);
                            }
                            else {
                                collections_1.forEach(scopeOrTemplate, function (entry) {
                                    var name = entry.key, template = entry.value;
                                    _this._parseSnippet(name, template, _this.data);
                                });
                            }
                        });
                    }
                    return _this;
                });
            }
            return this._loadPromise;
        };
        SnippetFile.prototype.reset = function () {
            this._loadPromise = undefined;
            this.data.length = 0;
        };
        SnippetFile.prototype._parseSnippet = function (name, snippet, bucket) {
            var prefix = snippet.prefix, body = snippet.body, description = snippet.description;
            if (Array.isArray(body)) {
                body = body.join('\n');
            }
            if (typeof prefix !== 'string' || typeof body !== 'string') {
                return;
            }
            var scopes;
            if (this.defaultScopes) {
                scopes = this.defaultScopes;
            }
            else if (typeof snippet.scope === 'string') {
                scopes = snippet.scope.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return !strings_1.isFalsyOrWhitespace(s); });
            }
            else {
                scopes = [];
            }
            var source;
            if (this._extension) {
                source = this._extension.displayName || this._extension.name;
            }
            else if (this.isGlobalSnippets) {
                source = nls_1.localize('source.snippetGlobal', "Global User Snippet");
            }
            else {
                source = nls_1.localize('source.snippet', "User Snippet");
            }
            bucket.push(new Snippet(scopes, name, prefix, description, body, source, this._extension !== void 0));
        };
        return SnippetFile;
    }());
    exports.SnippetFile = SnippetFile;
});
