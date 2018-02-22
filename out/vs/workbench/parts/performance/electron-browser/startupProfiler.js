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
define(["require", "exports", "vs/platform/environment/common/environment", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/platform/lifecycle/common/lifecycle", "vs/platform/windows/common/windows", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/electron-browser/actions", "vs/base/common/winjs.base", "path", "vs/nls", "vs/base/node/pfs", "vs/base/common/paths"], function (require, exports, environment_1, extensions_1, instantiation_1, message_1, lifecycle_1, windows_1, contributions_1, platform_1, actions_1, winjs_base_1, path_1, nls_1, pfs_1, paths_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var StartupProfiler = /** @class */ (function () {
        function StartupProfiler(_windowsService, _messageService, _environmentService, _instantiationService, lifecycleService, extensionService) {
            var _this = this;
            this._windowsService = _windowsService;
            this._messageService = _messageService;
            this._environmentService = _environmentService;
            this._instantiationService = _instantiationService;
            // wait for everything to be ready
            Promise.all([
                lifecycleService.when(lifecycle_1.LifecyclePhase.Eventually),
                extensionService.whenInstalledExtensionsRegistered()
            ]).then(function () {
                _this._stopProfiling();
            });
        }
        StartupProfiler.prototype._stopProfiling = function () {
            var _this = this;
            var profileFilenamePrefix = this._environmentService.args['prof-startup-prefix'];
            if (!profileFilenamePrefix) {
                return;
            }
            var dir = path_1.dirname(profileFilenamePrefix);
            var prefix = paths_1.basename(profileFilenamePrefix);
            var removeArgs = ['--prof-startup'];
            var markerFile = pfs_1.readFile(profileFilenamePrefix).then(function (value) { return removeArgs.push.apply(removeArgs, value.toString().split('|')); })
                .then(function () { return pfs_1.del(profileFilenamePrefix); })
                .then(function () { return winjs_base_1.TPromise.timeout(1000); });
            markerFile.then(function () {
                return pfs_1.readdir(dir).then(function (files) { return files.filter(function (value) { return value.indexOf(prefix) === 0; }); });
            }).then(function (files) {
                var profileFiles = files.reduce(function (prev, cur) { return "" + prev + path_1.join(dir, cur) + "\n"; }, '\n');
                return _this._messageService.confirm({
                    type: 'info',
                    message: nls_1.localize('prof.message', "Successfully created profiles."),
                    detail: nls_1.localize('prof.detail', "Please create an issue and manually attach the following files:\n{0}", profileFiles),
                    primaryButton: nls_1.localize('prof.restartAndFileIssue', "Create Issue and Restart"),
                    secondaryButton: nls_1.localize('prof.restart', "Restart")
                }).then(function (primaryButton) {
                    if (primaryButton) {
                        var action = _this._instantiationService.createInstance(actions_1.ReportPerformanceIssueAction, actions_1.ReportPerformanceIssueAction.ID, actions_1.ReportPerformanceIssueAction.LABEL);
                        winjs_base_1.TPromise.join([
                            _this._windowsService.showItemInFolder(path_1.join(dir, files[0])),
                            action.run(":warning: Make sure to **attach** these files from your *home*-directory: :warning:\n" + files.map(function (file) { return "-`" + file + "`"; }).join('\n'))
                        ]).then(function () {
                            // keep window stable until restart is selected
                            return _this._messageService.confirm({
                                type: 'info',
                                message: nls_1.localize('prof.thanks', "Thanks for helping us."),
                                detail: nls_1.localize('prof.detail.restart', "A final restart is required to continue to use '{0}'. Again, thank you for your contribution.", _this._environmentService.appNameLong),
                                primaryButton: nls_1.localize('prof.restart', "Restart"),
                                secondaryButton: null
                            }).then(function () {
                                // now we are ready to restart
                                _this._windowsService.relaunch({ removeArgs: removeArgs });
                            });
                        });
                    }
                    else {
                        // simply restart
                        _this._windowsService.relaunch({ removeArgs: removeArgs });
                    }
                });
            });
        };
        StartupProfiler = __decorate([
            __param(0, windows_1.IWindowsService),
            __param(1, message_1.IMessageService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, lifecycle_1.ILifecycleService),
            __param(5, extensions_1.IExtensionService)
        ], StartupProfiler);
        return StartupProfiler;
    }());
    var registry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    registry.registerWorkbenchContribution(StartupProfiler, lifecycle_1.LifecyclePhase.Running);
});
