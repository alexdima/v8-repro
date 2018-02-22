/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/performance", "vs/base/common/winjs.base", "vs/workbench/electron-browser/shell", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/comparers", "vs/base/common/platform", "vs/base/common/paths", "vs/base/common/uri", "vs/base/common/strings", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/node/configurationService", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/base/node/pfs", "vs/platform/environment/node/environmentService", "vs/workbench/services/timer/node/timerService", "vs/workbench/services/keybinding/electron-browser/keybindingService", "vs/platform/windows/common/windows", "vs/platform/windows/common/windowsIpc", "vs/platform/storage/common/storageService", "vs/base/parts/ipc/electron-browser/ipc.electron-browser", "electron", "vs/platform/update/common/updateIpc", "vs/platform/update/common/update", "vs/platform/url/common/urlIpc", "vs/platform/url/common/url", "vs/platform/workspaces/common/workspacesIpc", "vs/platform/workspaces/common/workspaces", "vs/platform/log/node/spdlogService", "vs/platform/log/common/log", "vs/platform/issue/common/issueIpc", "vs/platform/issue/common/issue", "vs/platform/log/common/logIpc"], function (require, exports, nls, perf, winjs_base_1, shell_1, browser, dom_1, errors, comparer, platform, paths, uri_1, strings, workspace_1, configurationService_1, descriptors_1, serviceCollection_1, pfs_1, environmentService_1, timerService_1, keybindingService_1, windows_1, windowsIpc_1, storageService_1, ipc_electron_browser_1, electron_1, updateIpc_1, update_1, urlIpc_1, url_1, workspacesIpc_1, workspaces_1, spdlogService_1, log_1, issueIpc_1, issue_1, logIpc_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var _initialize = function () {
        // TODO@snapshot
        // gracefulFs.gracefulify(fs); // enable gracefulFs
    };
    if (typeof MonacoSnapshotInitializeCallbacks !== 'undefined') {
        MonacoSnapshotInitializeCallbacks.push(_initialize);
    }
    else {
        _initialize();
    }
    function startup(configuration) {
        // Ensure others can listen to zoom level changes
        browser.setZoomFactor(electron_1.webFrame.getZoomFactor());
        // See https://github.com/Microsoft/vscode/issues/26151
        // Can be trusted because we are not setting it ourselves.
        browser.setZoomLevel(electron_1.webFrame.getZoomLevel(), true /* isTrusted */);
        browser.setFullscreen(!!configuration.fullscreen);
        keybindingService_1.KeyboardMapperFactory.INSTANCE._onKeyboardLayoutChanged();
        browser.setAccessibilitySupport(configuration.accessibilitySupport ? 2 /* Enabled */ : 1 /* Disabled */);
        // Setup Intl
        comparer.setFileNameComparer(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }));
        // Open workbench
        return openWorkbench(configuration);
    }
    exports.startup = startup;
    function openWorkbench(configuration) {
        var mainProcessClient = new ipc_electron_browser_1.Client(String("window" + configuration.windowId));
        var mainServices = createMainProcessServices(mainProcessClient, configuration);
        var environmentService = new environmentService_1.EnvironmentService(configuration, configuration.execPath);
        var logService = createLogService(mainProcessClient, configuration, environmentService);
        logService.trace('openWorkbench configuration', JSON.stringify(configuration));
        // Since the configuration service is one of the core services that is used in so many places, we initialize it
        // right before startup of the workbench shell to have its data ready for consumers
        return createAndInitializeWorkspaceService(configuration, environmentService).then(function (workspaceService) {
            var timerService = new timerService_1.TimerService(window.MonacoEnvironment.timers, workspaceService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY);
            var storageService = createStorageService(workspaceService, environmentService);
            return dom_1.domContentLoaded().then(function () {
                // Open Shell
                perf.mark('willStartWorkbench');
                var shell = new shell_1.WorkbenchShell(document.body, {
                    contextService: workspaceService,
                    configurationService: workspaceService,
                    environmentService: environmentService,
                    logService: logService,
                    timerService: timerService,
                    storageService: storageService
                }, mainServices, configuration);
                shell.open();
                // Inform user about loading issues from the loader
                self.require.config({
                    onError: function (err) {
                        if (err.errorCode === 'load') {
                            shell.onUnexpectedError(loaderError(err));
                        }
                    }
                });
            });
        });
    }
    function createAndInitializeWorkspaceService(configuration, environmentService) {
        return validateSingleFolderPath(configuration).then(function () {
            var workspaceService = new configurationService_1.WorkspaceService(environmentService);
            return workspaceService.initialize(configuration.workspace || configuration.folderPath || configuration).then(function () { return workspaceService; }, function (error) { return workspaceService; });
        });
    }
    function validateSingleFolderPath(configuration) {
        // Return early if we do not have a single folder path
        if (!configuration.folderPath) {
            return winjs_base_1.TPromise.as(void 0);
        }
        // Otherwise: use realpath to resolve symbolic links to the truth
        return pfs_1.realpath(configuration.folderPath).then(function (realFolderPath) {
            // For some weird reason, node adds a trailing slash to UNC paths
            // we never ever want trailing slashes as our workspace path unless
            // someone opens root ("/").
            // See also https://github.com/nodejs/io.js/issues/1765
            if (paths.isUNC(realFolderPath) && strings.endsWith(realFolderPath, paths.nativeSep)) {
                realFolderPath = strings.rtrim(realFolderPath, paths.nativeSep);
            }
            return realFolderPath;
        }, function (error) {
            if (configuration.verbose) {
                errors.onUnexpectedError(error);
            }
            // Treat any error case as empty workbench case (no folder path)
            return null;
        }).then(function (realFolderPathOrNull) {
            // Update config with real path if we have one
            configuration.folderPath = realFolderPathOrNull;
        });
    }
    function createStorageService(workspaceService, environmentService) {
        var workspaceId;
        var secondaryWorkspaceId;
        switch (workspaceService.getWorkbenchState()) {
            // in multi root workspace mode we use the provided ID as key for workspace storage
            case workspace_1.WorkbenchState.WORKSPACE:
                workspaceId = uri_1.default.from({ path: workspaceService.getWorkspace().id, scheme: 'root' }).toString();
                break;
            // in single folder mode we use the path of the opened folder as key for workspace storage
            // the ctime is used as secondary workspace id to clean up stale UI state if necessary
            case workspace_1.WorkbenchState.FOLDER:
                var workspace = workspaceService.getWorkspace();
                workspaceId = workspace.folders[0].uri.toString();
                secondaryWorkspaceId = workspace.ctime;
                break;
            // finaly, if we do not have a workspace open, we need to find another identifier for the window to store
            // workspace UI state. if we have a backup path in the configuration we can use that because this
            // will be a unique identifier per window that is stable between restarts as long as there are
            // dirty files in the workspace.
            // We use basename() to produce a short identifier, we do not need the full path. We use a custom
            // scheme so that we can later distinguish these identifiers from the workspace one.
            case workspace_1.WorkbenchState.EMPTY:
                workspaceId = workspaceService.getWorkspace().id;
                break;
        }
        var disableStorage = !!environmentService.extensionTestsPath; // never keep any state when running extension tests!
        var storage;
        if (disableStorage) {
            storage = storageService_1.inMemoryLocalStorageInstance;
        }
        else {
            // TODO@Ben remove me after a while
            perf.mark('willAccessLocalStorage');
            storage = window.localStorage;
            perf.mark('didAccessLocalStorage');
        }
        return new storageService_1.StorageService(storage, storage, workspaceId, secondaryWorkspaceId);
    }
    function createLogService(mainProcessClient, configuration, environmentService) {
        var spdlogService = spdlogService_1.createSpdLogService("renderer" + configuration.windowId, configuration.logLevel, environmentService.logsPath);
        var consoleLogService = new log_1.ConsoleLogService(configuration.logLevel);
        var logService = new log_1.MultiplexLogService([consoleLogService, spdlogService]);
        var logLevelClient = new logIpc_1.LogLevelSetterChannelClient(mainProcessClient.getChannel('loglevel'));
        return new logIpc_1.FollowerLogService(logLevelClient, logService);
    }
    function createMainProcessServices(mainProcessClient, configuration) {
        var serviceCollection = new serviceCollection_1.ServiceCollection();
        var windowsChannel = mainProcessClient.getChannel('windows');
        serviceCollection.set(windows_1.IWindowsService, new windowsIpc_1.WindowsChannelClient(windowsChannel));
        var updateChannel = mainProcessClient.getChannel('update');
        serviceCollection.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateIpc_1.UpdateChannelClient, updateChannel));
        var urlChannel = mainProcessClient.getChannel('url');
        serviceCollection.set(url_1.IURLService, new descriptors_1.SyncDescriptor(urlIpc_1.URLChannelClient, urlChannel, configuration.windowId));
        var issueChannel = mainProcessClient.getChannel('issue');
        serviceCollection.set(issue_1.IIssueService, new descriptors_1.SyncDescriptor(issueIpc_1.IssueChannelClient, issueChannel));
        var workspacesChannel = mainProcessClient.getChannel('workspaces');
        serviceCollection.set(workspaces_1.IWorkspacesService, new workspacesIpc_1.WorkspacesChannelClient(workspacesChannel));
        return serviceCollection;
    }
    function loaderError(err) {
        if (platform.isWeb) {
            return new Error(nls.localize('loaderError', "Failed to load a required file. Either you are no longer connected to the internet or the server you are connected to is offline. Please refresh the browser to try again."));
        }
        return new Error(nls.localize('loaderErrorNative', "Failed to load a required file. Please restart the application to try again. Details: {0}", JSON.stringify(err)));
    }
});
