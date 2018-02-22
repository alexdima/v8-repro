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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/objects", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/base/common/glob", "path", "vs/base/common/paths"], function (require, exports, uri_1, objects, workspace_1, lifecycle_1, event_1, configuration_1, glob_1, path_1, paths_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResourceGlobMatcher = /** @class */ (function () {
        function ResourceGlobMatcher(globFn, shouldUpdate, contextService, configurationService) {
            this.globFn = globFn;
            this.shouldUpdate = shouldUpdate;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.toUnbind = [];
            this.mapRootToParsedExpression = new Map();
            this.mapRootToExpressionConfig = new Map();
            this._onExpressionChange = new event_1.Emitter();
            this.toUnbind.push(this._onExpressionChange);
            this.updateExcludes(false);
            this.registerListeners();
        }
        Object.defineProperty(ResourceGlobMatcher.prototype, "onExpressionChange", {
            get: function () {
                return this._onExpressionChange.event;
            },
            enumerable: true,
            configurable: true
        });
        ResourceGlobMatcher.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (_this.shouldUpdate(e)) {
                    _this.updateExcludes(true);
                }
            }));
            this.toUnbind.push(this.contextService.onDidChangeWorkspaceFolders(function () { return _this.updateExcludes(true); }));
        };
        ResourceGlobMatcher.prototype.updateExcludes = function (fromEvent) {
            var _this = this;
            var changed = false;
            // Add excludes per workspaces that got added
            this.contextService.getWorkspace().folders.forEach(function (folder) {
                var rootExcludes = _this.globFn(folder.uri);
                if (!_this.mapRootToExpressionConfig.has(folder.uri.toString()) || !objects.equals(_this.mapRootToExpressionConfig.get(folder.uri.toString()), rootExcludes)) {
                    changed = true;
                    _this.mapRootToParsedExpression.set(folder.uri.toString(), glob_1.parse(rootExcludes));
                    _this.mapRootToExpressionConfig.set(folder.uri.toString(), objects.deepClone(rootExcludes));
                }
            });
            // Remove excludes per workspace no longer present
            this.mapRootToExpressionConfig.forEach(function (value, root) {
                if (root === ResourceGlobMatcher.NO_ROOT) {
                    return; // always keep this one
                }
                if (!_this.contextService.getWorkspaceFolder(uri_1.default.parse(root))) {
                    _this.mapRootToParsedExpression.delete(root);
                    _this.mapRootToExpressionConfig.delete(root);
                    changed = true;
                }
            });
            // Always set for resources outside root as well
            var globalExcludes = this.globFn();
            if (!this.mapRootToExpressionConfig.has(ResourceGlobMatcher.NO_ROOT) || !objects.equals(this.mapRootToExpressionConfig.get(ResourceGlobMatcher.NO_ROOT), globalExcludes)) {
                changed = true;
                this.mapRootToParsedExpression.set(ResourceGlobMatcher.NO_ROOT, glob_1.parse(globalExcludes));
                this.mapRootToExpressionConfig.set(ResourceGlobMatcher.NO_ROOT, objects.deepClone(globalExcludes));
            }
            if (fromEvent && changed) {
                this._onExpressionChange.fire();
            }
        };
        ResourceGlobMatcher.prototype.matches = function (resource) {
            var folder = this.contextService.getWorkspaceFolder(resource);
            var expressionForRoot;
            if (folder && this.mapRootToParsedExpression.has(folder.uri.toString())) {
                expressionForRoot = this.mapRootToParsedExpression.get(folder.uri.toString());
            }
            else {
                expressionForRoot = this.mapRootToParsedExpression.get(ResourceGlobMatcher.NO_ROOT);
            }
            // If the resource if from a workspace, convert its absolute path to a relative
            // path so that glob patterns have a higher probability to match. For example
            // a glob pattern of "src/**" will not match on an absolute path "/folder/src/file.txt"
            // but can match on "src/file.txt"
            var resourcePathToMatch;
            if (folder) {
                resourcePathToMatch = paths_1.normalize(path_1.relative(folder.uri.fsPath, resource.fsPath));
            }
            else {
                resourcePathToMatch = resource.fsPath;
            }
            return !!expressionForRoot(resourcePathToMatch);
        };
        ResourceGlobMatcher.prototype.dispose = function () {
            this.toUnbind = lifecycle_1.dispose(this.toUnbind);
        };
        ResourceGlobMatcher.NO_ROOT = null;
        ResourceGlobMatcher = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, configuration_1.IConfigurationService)
        ], ResourceGlobMatcher);
        return ResourceGlobMatcher;
    }());
    exports.ResourceGlobMatcher = ResourceGlobMatcher;
});
