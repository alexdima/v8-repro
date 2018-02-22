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
define(["require", "exports", "crypto", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/environment/common/environment", "vs/platform/windows/common/windows", "vs/base/common/strings"], function (require, exports, crypto, winjs_base_1, errors_1, uri_1, files_1, telemetry_1, workspace_1, environment_1, windows_1, strings_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SshProtocolMatcher = /^([^@:]+@)?([^:]+):/;
    var SshUrlMatcher = /^([^@:]+@)?([^:]+):(.+)$/;
    var AuthorityMatcher = /^([^@]+@)?([^:]+)(:\d+)?$/;
    var SecondLevelDomainMatcher = /([^@:.]+\.[^@:.]+)(:\d+)?$/;
    var RemoteMatcher = /^\s*url\s*=\s*(.+\S)\s*$/mg;
    var AnyButDot = /[^.]/g;
    var SecondLevelDomainWhitelist = [
        'github.com',
        'bitbucket.org',
        'visualstudio.com',
        'gitlab.com',
        'heroku.com',
        'azurewebsites.net',
        'ibm.com',
        'amazon.com',
        'amazonaws.com',
        'cloudapp.net',
        'rhcloud.com',
        'google.com'
    ];
    function stripLowLevelDomains(domain) {
        var match = domain.match(SecondLevelDomainMatcher);
        return match ? match[1] : null;
    }
    function extractDomain(url) {
        if (url.indexOf('://') === -1) {
            var match = url.match(SshProtocolMatcher);
            if (match) {
                return stripLowLevelDomains(match[2]);
            }
        }
        try {
            var uri = uri_1.default.parse(url);
            if (uri.authority) {
                return stripLowLevelDomains(uri.authority);
            }
        }
        catch (e) {
            // ignore invalid URIs
        }
        return null;
    }
    function getDomainsOfRemotes(text, whitelist) {
        var domains = new Set();
        var match;
        while (match = RemoteMatcher.exec(text)) {
            var domain = extractDomain(match[1]);
            if (domain) {
                domains.add(domain);
            }
        }
        var whitemap = whitelist.reduce(function (map, key) {
            map[key] = true;
            return map;
        }, Object.create(null));
        var elements = [];
        domains.forEach(function (e) { return elements.push(e); });
        return elements
            .map(function (key) { return whitemap[key] ? key : key.replace(AnyButDot, 'a'); });
    }
    exports.getDomainsOfRemotes = getDomainsOfRemotes;
    function stripPort(authority) {
        var match = authority.match(AuthorityMatcher);
        return match ? match[2] : null;
    }
    function normalizeRemote(host, path, stripEndingDotGit) {
        if (host && path) {
            if (stripEndingDotGit && strings_1.endsWith(path, '.git')) {
                path = path.substr(0, path.length - 4);
            }
            return (path.indexOf('/') === 0) ? "" + host + path : host + "/" + path;
        }
        return null;
    }
    function extractRemote(url, stripEndingDotGit) {
        if (url.indexOf('://') === -1) {
            var match = url.match(SshUrlMatcher);
            if (match) {
                return normalizeRemote(match[2], match[3], stripEndingDotGit);
            }
        }
        try {
            var uri = uri_1.default.parse(url);
            if (uri.authority) {
                return normalizeRemote(stripPort(uri.authority), uri.path, stripEndingDotGit);
            }
        }
        catch (e) {
            // ignore invalid URIs
        }
        return null;
    }
    function getRemotes(text, stripEndingDotGit) {
        if (stripEndingDotGit === void 0) { stripEndingDotGit = false; }
        var remotes = [];
        var match;
        while (match = RemoteMatcher.exec(text)) {
            var remote = extractRemote(match[1], stripEndingDotGit);
            if (remote) {
                remotes.push(remote);
            }
        }
        return remotes;
    }
    exports.getRemotes = getRemotes;
    function getHashedRemotesFromConfig(text, stripEndingDotGit) {
        if (stripEndingDotGit === void 0) { stripEndingDotGit = false; }
        return getRemotes(text, stripEndingDotGit).map(function (r) {
            return crypto.createHash('sha1').update(r).digest('hex');
        });
    }
    exports.getHashedRemotesFromConfig = getHashedRemotesFromConfig;
    function getHashedRemotesFromUri(workspaceUri, fileService, stripEndingDotGit) {
        if (stripEndingDotGit === void 0) { stripEndingDotGit = false; }
        var path = workspaceUri.path;
        var uri = workspaceUri.with({ path: (path !== '/' ? path : '') + "/.git/config" });
        return fileService.resolveContent(uri, { acceptTextOnly: true }).then(function (content) { return getHashedRemotesFromConfig(content.value, stripEndingDotGit); }, function (err) { return []; } // ignore missing or binary file
        );
    }
    exports.getHashedRemotesFromUri = getHashedRemotesFromUri;
    var WorkspaceStats = /** @class */ (function () {
        function WorkspaceStats(fileService, contextService, telemetryService, environmentService, windowService) {
            this.fileService = fileService;
            this.contextService = contextService;
            this.telemetryService = telemetryService;
            this.environmentService = environmentService;
            this.reportWorkspaceTags(windowService.getConfiguration());
            this.reportCloudStats();
        }
        WorkspaceStats.prototype.searchArray = function (arr, regEx) {
            return arr.some(function (v) { return v.search(regEx) > -1; }) || undefined;
        };
        /* __GDPR__FRAGMENT__
            "WorkspaceTags" : {
                "workbench.filesToOpen" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "workbench.filesToCreate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "workbench.filesToDiff" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "workspace.id" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.roots" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.empty" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.grunt" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.gulp" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.jake" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.tsconfig" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.jsconfig" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.config.xml" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.vsc.extension" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.ASP5" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.sln" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.unity" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.npm" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.bower" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.yeoman.code.ext" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.cordova.high" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.cordova.low" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.xamarin.android" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.xamarin.ios" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.android.cpp" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                "workspace.reactNative" : { "classification": "CustomerContent", "purpose": "FeatureInsight" }
            }
        */
        WorkspaceStats.prototype.getWorkspaceTags = function (configuration) {
            var _this = this;
            var tags = Object.create(null);
            var state = this.contextService.getWorkbenchState();
            var workspace = this.contextService.getWorkspace();
            var workspaceId;
            switch (state) {
                case workspace_1.WorkbenchState.EMPTY:
                    workspaceId = void 0;
                    break;
                case workspace_1.WorkbenchState.FOLDER:
                    workspaceId = crypto.createHash('sha1').update(workspace.folders[0].uri.fsPath).digest('hex');
                    break;
                case workspace_1.WorkbenchState.WORKSPACE:
                    workspaceId = crypto.createHash('sha1').update(workspace.configuration.fsPath).digest('hex');
            }
            tags['workspace.id'] = workspaceId;
            var filesToOpen = configuration.filesToOpen, filesToCreate = configuration.filesToCreate, filesToDiff = configuration.filesToDiff;
            tags['workbench.filesToOpen'] = filesToOpen && filesToOpen.length || 0;
            tags['workbench.filesToCreate'] = filesToCreate && filesToCreate.length || 0;
            tags['workbench.filesToDiff'] = filesToDiff && filesToDiff.length || 0;
            var isEmpty = state === workspace_1.WorkbenchState.EMPTY;
            tags['workspace.roots'] = isEmpty ? 0 : workspace.folders.length;
            tags['workspace.empty'] = isEmpty;
            var folders = !isEmpty ? workspace.folders.map(function (folder) { return folder.uri; }) : this.environmentService.appQuality !== 'stable' && this.findFolders(configuration);
            if (folders && folders.length && this.fileService) {
                return this.fileService.resolveFiles(folders.map(function (resource) { return ({ resource: resource }); })).then(function (results) {
                    var names = (_a = []).concat.apply(_a, results.map(function (result) { return result.success ? (result.stat.children || []) : []; })).map(function (c) { return c.name; });
                    var nameSet = names.reduce(function (s, n) { return s.add(n.toLowerCase()); }, new Set());
                    tags['workspace.grunt'] = nameSet.has('gruntfile.js');
                    tags['workspace.gulp'] = nameSet.has('gulpfile.js');
                    tags['workspace.jake'] = nameSet.has('jakefile.js');
                    tags['workspace.tsconfig'] = nameSet.has('tsconfig.json');
                    tags['workspace.jsconfig'] = nameSet.has('jsconfig.json');
                    tags['workspace.config.xml'] = nameSet.has('config.xml');
                    tags['workspace.vsc.extension'] = nameSet.has('vsc-extension-quickstart.md');
                    tags['workspace.ASP5'] = nameSet.has('project.json') && _this.searchArray(names, /^.+\.cs$/i);
                    tags['workspace.sln'] = _this.searchArray(names, /^.+\.sln$|^.+\.csproj$/i);
                    tags['workspace.unity'] = nameSet.has('assets') && nameSet.has('library') && nameSet.has('projectsettings');
                    tags['workspace.npm'] = nameSet.has('package.json') || nameSet.has('node_modules');
                    tags['workspace.bower'] = nameSet.has('bower.json') || nameSet.has('bower_components');
                    tags['workspace.yeoman.code.ext'] = nameSet.has('vsc-extension-quickstart.md');
                    var mainActivity = nameSet.has('mainactivity.cs') || nameSet.has('mainactivity.fs');
                    var appDelegate = nameSet.has('appdelegate.cs') || nameSet.has('appdelegate.fs');
                    var androidManifest = nameSet.has('androidmanifest.xml');
                    var platforms = nameSet.has('platforms');
                    var plugins = nameSet.has('plugins');
                    var www = nameSet.has('www');
                    var properties = nameSet.has('properties');
                    var resources = nameSet.has('resources');
                    var jni = nameSet.has('jni');
                    if (tags['workspace.config.xml'] &&
                        !tags['workspace.language.cs'] && !tags['workspace.language.vb'] && !tags['workspace.language.aspx']) {
                        if (platforms && plugins && www) {
                            tags['workspace.cordova.high'] = true;
                        }
                        else {
                            tags['workspace.cordova.low'] = true;
                        }
                    }
                    if (mainActivity && properties && resources) {
                        tags['workspace.xamarin.android'] = true;
                    }
                    if (appDelegate && resources) {
                        tags['workspace.xamarin.ios'] = true;
                    }
                    if (androidManifest && jni) {
                        tags['workspace.android.cpp'] = true;
                    }
                    tags['workspace.reactNative'] = nameSet.has('android') && nameSet.has('ios') &&
                        nameSet.has('index.android.js') && nameSet.has('index.ios.js');
                    return tags;
                    var _a;
                }, function (error) { errors_1.onUnexpectedError(error); return null; });
            }
            else {
                return winjs_base_1.TPromise.as(tags);
            }
        };
        WorkspaceStats.prototype.findFolders = function (configuration) {
            var folder = this.findFolder(configuration);
            return folder && [folder];
        };
        WorkspaceStats.prototype.findFolder = function (_a) {
            var filesToOpen = _a.filesToOpen, filesToCreate = _a.filesToCreate, filesToDiff = _a.filesToDiff;
            if (filesToOpen && filesToOpen.length) {
                return this.parentURI(uri_1.default.file(filesToOpen[0].filePath));
            }
            else if (filesToCreate && filesToCreate.length) {
                return this.parentURI(uri_1.default.file(filesToCreate[0].filePath));
            }
            else if (filesToDiff && filesToDiff.length) {
                return this.parentURI(uri_1.default.file(filesToDiff[0].filePath));
            }
            return undefined;
        };
        WorkspaceStats.prototype.parentURI = function (uri) {
            var path = uri.path;
            var i = path.lastIndexOf('/');
            return i !== -1 ? uri.with({ path: path.substr(0, i) }) : undefined;
        };
        WorkspaceStats.prototype.reportWorkspaceTags = function (configuration) {
            var _this = this;
            this.getWorkspaceTags(configuration).then(function (tags) {
                /* __GDPR__
                    "workspce.tags" : {
                        "${include}": [
                            "${WorkspaceTags}"
                        ]
                    }
                */
                _this.telemetryService.publicLog('workspce.tags', tags);
            }, function (error) { return errors_1.onUnexpectedError(error); });
        };
        WorkspaceStats.prototype.reportRemoteDomains = function (workspaceUris) {
            var _this = this;
            winjs_base_1.TPromise.join(workspaceUris.map(function (workspaceUri) {
                var path = workspaceUri.path;
                var uri = workspaceUri.with({ path: (path !== '/' ? path : '') + "/.git/config" });
                return _this.fileService.resolveContent(uri, { acceptTextOnly: true }).then(function (content) { return getDomainsOfRemotes(content.value, SecondLevelDomainWhitelist); }, function (err) { return []; } // ignore missing or binary file
                );
            })).then(function (domains) {
                var set = domains.reduce(function (set, list) { return list.reduce(function (set, item) { return set.add(item); }, set); }, new Set());
                var list = [];
                set.forEach(function (item) { return list.push(item); });
                /* __GDPR__
                    "workspace.remotes" : {
                        "domains" : { "classification": "CustomerContent", "purpose": "FeatureInsight" }
                    }
                */
                _this.telemetryService.publicLog('workspace.remotes', { domains: list.sort() });
            }, errors_1.onUnexpectedError);
        };
        WorkspaceStats.prototype.reportRemotes = function (workspaceUris) {
            var _this = this;
            winjs_base_1.TPromise.join(workspaceUris.map(function (workspaceUri) {
                return getHashedRemotesFromUri(workspaceUri, _this.fileService, true);
            })).then(function (hashedRemotes) {
                /* __GDPR__
                        "workspace.hashedRemotes" : {
                            "remotes" : { "classification": "CustomerContent", "purpose": "FeatureInsight" }
                        }
                    */
                _this.telemetryService.publicLog('workspace.hashedRemotes', { remotes: hashedRemotes });
            }, errors_1.onUnexpectedError);
        };
        /* __GDPR__FRAGMENT__
            "AzureTags" : {
                "node" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        WorkspaceStats.prototype.reportAzureNode = function (workspaceUris, tags) {
            var _this = this;
            // TODO: should also work for `node_modules` folders several levels down
            var uris = workspaceUris.map(function (workspaceUri) {
                var path = workspaceUri.path;
                return workspaceUri.with({ path: (path !== '/' ? path : '') + "/node_modules" });
            });
            return this.fileService.resolveFiles(uris.map(function (resource) { return ({ resource: resource }); })).then(function (results) {
                var names = (_a = []).concat.apply(_a, results.map(function (result) { return result.success ? (result.stat.children || []) : []; })).map(function (c) { return c.name; });
                var referencesAzure = _this.searchArray(names, /azure/i);
                if (referencesAzure) {
                    tags['node'] = true;
                }
                return tags;
                var _a;
            }, function (err) {
                return tags;
            });
        };
        /* __GDPR__FRAGMENT__
            "AzureTags" : {
                "java" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        WorkspaceStats.prototype.reportAzureJava = function (workspaceUris, tags) {
            var _this = this;
            return winjs_base_1.TPromise.join(workspaceUris.map(function (workspaceUri) {
                var path = workspaceUri.path;
                var uri = workspaceUri.with({ path: (path !== '/' ? path : '') + "/pom.xml" });
                return _this.fileService.resolveContent(uri, { acceptTextOnly: true }).then(function (content) { return !!content.value.match(/azure/i); }, function (err) { return false; });
            })).then(function (javas) {
                if (javas.indexOf(true) !== -1) {
                    tags['java'] = true;
                }
                return tags;
            });
        };
        WorkspaceStats.prototype.reportAzure = function (uris) {
            var _this = this;
            var tags = Object.create(null);
            this.reportAzureNode(uris, tags).then(function (tags) {
                return _this.reportAzureJava(uris, tags);
            }).then(function (tags) {
                if (Object.keys(tags).length) {
                    /* __GDPR__
                        "workspace.azure" : {
                            "${include}": [
                                "${AzureTags}"
                            ]
                        }
                    */
                    _this.telemetryService.publicLog('workspace.azure', tags);
                }
            }).then(null, errors_1.onUnexpectedError);
        };
        WorkspaceStats.prototype.reportCloudStats = function () {
            var uris = this.contextService.getWorkspace().folders.map(function (folder) { return folder.uri; });
            if (uris.length && this.fileService) {
                this.reportRemoteDomains(uris);
                this.reportRemotes(uris);
                this.reportAzure(uris);
            }
        };
        WorkspaceStats = __decorate([
            __param(0, files_1.IFileService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, telemetry_1.ITelemetryService),
            __param(3, environment_1.IEnvironmentService),
            __param(4, windows_1.IWindowService)
        ], WorkspaceStats);
        return WorkspaceStats;
    }());
    exports.WorkspaceStats = WorkspaceStats;
});
