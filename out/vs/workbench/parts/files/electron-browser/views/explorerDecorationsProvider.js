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
define(["require", "exports", "vs/base/common/event", "vs/nls", "vs/platform/workspace/common/workspace", "vs/platform/theme/common/colorRegistry"], function (require, exports, event_1, nls_1, workspace_1, colorRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExplorerDecorationsProvider = /** @class */ (function () {
        function ExplorerDecorationsProvider(model, contextService) {
            var _this = this;
            this.model = model;
            this.label = nls_1.localize('label', "Explorer");
            this._onDidChange = new event_1.Emitter();
            contextService.onDidChangeWorkspaceFolders(function (e) {
                _this._onDidChange.fire(e.changed.map(function (wf) { return wf.uri; }));
            });
        }
        Object.defineProperty(ExplorerDecorationsProvider.prototype, "onDidChange", {
            get: function () {
                return this._onDidChange.event;
            },
            enumerable: true,
            configurable: true
        });
        ExplorerDecorationsProvider.prototype.provideDecorations = function (resource) {
            var fileStat = this.model.roots.filter(function (r) { return r.resource.toString() === resource.toString(); }).pop();
            if (fileStat && fileStat.nonexistentRoot) {
                return {
                    tooltip: nls_1.localize('canNotResolve', "Can not resolve workspace folder"),
                    letter: '!',
                    color: colorRegistry_1.listInvalidItemForeground,
                };
            }
            return undefined;
        };
        ExplorerDecorationsProvider = __decorate([
            __param(1, workspace_1.IWorkspaceContextService)
        ], ExplorerDecorationsProvider);
        return ExplorerDecorationsProvider;
    }());
    exports.ExplorerDecorationsProvider = ExplorerDecorationsProvider;
});
