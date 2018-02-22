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
define(["require", "exports", "vs/base/common/async", "vs/editor/common/services/modelService", "vs/editor/common/modes", "vs/platform/workspace/common/workspace", "vs/workbench/parts/output/common/output", "vs/editor/common/services/webWorker", "vs/base/common/lifecycle"], function (require, exports, async_1, modelService_1, modes_1, workspace_1, output_1, webWorker_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var OutputLinkProvider = /** @class */ (function () {
        function OutputLinkProvider(contextService, modelService) {
            var _this = this;
            this.contextService = contextService;
            this.modelService = modelService;
            this.disposeWorkerScheduler = new async_1.RunOnceScheduler(function () { return _this.disposeWorker(); }, OutputLinkProvider.DISPOSE_WORKER_TIME);
            this.registerListeners();
            this.updateLinkProviderWorker();
        }
        OutputLinkProvider.prototype.registerListeners = function () {
            var _this = this;
            this.contextService.onDidChangeWorkspaceFolders(function () { return _this.updateLinkProviderWorker(); });
        };
        OutputLinkProvider.prototype.updateLinkProviderWorker = function () {
            var _this = this;
            // Setup link provider depending on folders being opened or not
            var folders = this.contextService.getWorkspace().folders;
            if (folders.length > 0) {
                if (!this.linkProviderRegistration) {
                    this.linkProviderRegistration = modes_1.LinkProviderRegistry.register({ language: output_1.OUTPUT_MODE_ID, scheme: '*' }, {
                        provideLinks: function (model, token) {
                            return async_1.wireCancellationToken(token, _this.provideLinks(model.uri));
                        }
                    });
                }
            }
            else {
                this.linkProviderRegistration = lifecycle_1.dispose(this.linkProviderRegistration);
            }
            // Dispose worker to recreate with folders on next provideLinks request
            this.disposeWorker();
            this.disposeWorkerScheduler.cancel();
        };
        OutputLinkProvider.prototype.getOrCreateWorker = function () {
            this.disposeWorkerScheduler.schedule();
            if (!this.worker) {
                var createData = {
                    workspaceFolders: this.contextService.getWorkspace().folders.map(function (folder) { return folder.uri.toString(); })
                };
                this.worker = webWorker_1.createWebWorker(this.modelService, {
                    moduleId: 'vs/workbench/parts/output/common/outputLinkComputer',
                    createData: createData,
                    label: 'outputLinkComputer'
                });
            }
            return this.worker;
        };
        OutputLinkProvider.prototype.provideLinks = function (modelUri) {
            return this.getOrCreateWorker().withSyncedResources([modelUri]).then(function (linkComputer) {
                return linkComputer.computeLinks(modelUri.toString());
            });
        };
        OutputLinkProvider.prototype.disposeWorker = function () {
            if (this.worker) {
                this.worker.dispose();
                this.worker = null;
            }
        };
        OutputLinkProvider.DISPOSE_WORKER_TIME = 3 * 60 * 1000; // dispose worker after 3 minutes of inactivity
        OutputLinkProvider = __decorate([
            __param(0, workspace_1.IWorkspaceContextService),
            __param(1, modelService_1.IModelService)
        ], OutputLinkProvider);
        return OutputLinkProvider;
    }());
    exports.OutputLinkProvider = OutputLinkProvider;
});
