/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/parts/ipc/common/ipc", "vs/base/common/uri"], function (require, exports, event_1, ipc_1, uri_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindowsChannel = /** @class */ (function () {
        function WindowsChannel(service) {
            this.service = service;
            this.onWindowOpen = event_1.buffer(service.onWindowOpen, true);
            this.onWindowFocus = event_1.buffer(service.onWindowFocus, true);
            this.onWindowBlur = event_1.buffer(service.onWindowBlur, true);
        }
        WindowsChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'event:onWindowOpen': return ipc_1.eventToCall(this.onWindowOpen);
                case 'event:onWindowFocus': return ipc_1.eventToCall(this.onWindowFocus);
                case 'event:onWindowBlur': return ipc_1.eventToCall(this.onWindowBlur);
                case 'pickFileFolderAndOpen': return this.service.pickFileFolderAndOpen(arg);
                case 'pickFileAndOpen': return this.service.pickFileAndOpen(arg);
                case 'pickFolderAndOpen': return this.service.pickFolderAndOpen(arg);
                case 'pickWorkspaceAndOpen': return this.service.pickWorkspaceAndOpen(arg);
                case 'showMessageBox': return this.service.showMessageBox(arg[0], arg[1]);
                case 'showSaveDialog': return this.service.showSaveDialog(arg[0], arg[1]);
                case 'showOpenDialog': return this.service.showOpenDialog(arg[0], arg[1]);
                case 'reloadWindow': return this.service.reloadWindow(arg);
                case 'openDevTools': return this.service.openDevTools(arg);
                case 'toggleDevTools': return this.service.toggleDevTools(arg);
                case 'closeWorkspace': return this.service.closeWorkspace(arg);
                case 'createAndEnterWorkspace': {
                    var rawFolders = arg[1];
                    var folders = void 0;
                    if (Array.isArray(rawFolders)) {
                        folders = rawFolders.map(function (rawFolder) {
                            return {
                                uri: uri_1.default.revive(rawFolder.uri),
                                name: rawFolder.name
                            };
                        });
                    }
                    return this.service.createAndEnterWorkspace(arg[0], folders, arg[2]);
                }
                case 'saveAndEnterWorkspace': return this.service.saveAndEnterWorkspace(arg[0], arg[1]);
                case 'toggleFullScreen': return this.service.toggleFullScreen(arg);
                case 'setRepresentedFilename': return this.service.setRepresentedFilename(arg[0], arg[1]);
                case 'addRecentlyOpened': return this.service.addRecentlyOpened(arg);
                case 'removeFromRecentlyOpened': return this.service.removeFromRecentlyOpened(arg);
                case 'clearRecentlyOpened': return this.service.clearRecentlyOpened();
                case 'showPreviousWindowTab': return this.service.showPreviousWindowTab();
                case 'showNextWindowTab': return this.service.showNextWindowTab();
                case 'moveWindowTabToNewWindow': return this.service.moveWindowTabToNewWindow();
                case 'mergeAllWindowTabs': return this.service.mergeAllWindowTabs();
                case 'toggleWindowTabsBar': return this.service.toggleWindowTabsBar();
                case 'updateTouchBar': return this.service.updateTouchBar(arg[0], arg[1]);
                case 'getRecentlyOpened': return this.service.getRecentlyOpened(arg);
                case 'focusWindow': return this.service.focusWindow(arg);
                case 'closeWindow': return this.service.closeWindow(arg);
                case 'isFocused': return this.service.isFocused(arg);
                case 'isMaximized': return this.service.isMaximized(arg);
                case 'maximizeWindow': return this.service.maximizeWindow(arg);
                case 'unmaximizeWindow': return this.service.unmaximizeWindow(arg);
                case 'onWindowTitleDoubleClick': return this.service.onWindowTitleDoubleClick(arg);
                case 'setDocumentEdited': return this.service.setDocumentEdited(arg[0], arg[1]);
                case 'openWindow': return this.service.openWindow(arg[0], arg[1]);
                case 'openNewWindow': return this.service.openNewWindow();
                case 'showWindow': return this.service.showWindow(arg);
                case 'getWindows': return this.service.getWindows();
                case 'getWindowCount': return this.service.getWindowCount();
                case 'relaunch': return this.service.relaunch(arg[0]);
                case 'whenSharedProcessReady': return this.service.whenSharedProcessReady();
                case 'toggleSharedProcess': return this.service.toggleSharedProcess();
                case 'quit': return this.service.quit();
                case 'log': return this.service.log(arg[0], arg[1]);
                case 'showItemInFolder': return this.service.showItemInFolder(arg);
                case 'openExternal': return this.service.openExternal(arg);
                case 'startCrashReporter': return this.service.startCrashReporter(arg);
                case 'openAboutDialog': return this.service.openAboutDialog();
            }
            return undefined;
        };
        return WindowsChannel;
    }());
    exports.WindowsChannel = WindowsChannel;
    var WindowsChannelClient = /** @class */ (function () {
        function WindowsChannelClient(channel) {
            this.channel = channel;
            this._onWindowOpen = ipc_1.eventFromCall(this.channel, 'event:onWindowOpen');
            this._onWindowFocus = ipc_1.eventFromCall(this.channel, 'event:onWindowFocus');
            this._onWindowBlur = ipc_1.eventFromCall(this.channel, 'event:onWindowBlur');
        }
        Object.defineProperty(WindowsChannelClient.prototype, "onWindowOpen", {
            get: function () { return this._onWindowOpen; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WindowsChannelClient.prototype, "onWindowFocus", {
            get: function () { return this._onWindowFocus; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WindowsChannelClient.prototype, "onWindowBlur", {
            get: function () { return this._onWindowBlur; },
            enumerable: true,
            configurable: true
        });
        WindowsChannelClient.prototype.pickFileFolderAndOpen = function (options) {
            return this.channel.call('pickFileFolderAndOpen', options);
        };
        WindowsChannelClient.prototype.pickFileAndOpen = function (options) {
            return this.channel.call('pickFileAndOpen', options);
        };
        WindowsChannelClient.prototype.pickFolderAndOpen = function (options) {
            return this.channel.call('pickFolderAndOpen', options);
        };
        WindowsChannelClient.prototype.pickWorkspaceAndOpen = function (options) {
            return this.channel.call('pickWorkspaceAndOpen', options);
        };
        WindowsChannelClient.prototype.showMessageBox = function (windowId, options) {
            return this.channel.call('showMessageBox', [windowId, options]);
        };
        WindowsChannelClient.prototype.showSaveDialog = function (windowId, options) {
            return this.channel.call('showSaveDialog', [windowId, options]);
        };
        WindowsChannelClient.prototype.showOpenDialog = function (windowId, options) {
            return this.channel.call('showOpenDialog', [windowId, options]);
        };
        WindowsChannelClient.prototype.reloadWindow = function (windowId) {
            return this.channel.call('reloadWindow', windowId);
        };
        WindowsChannelClient.prototype.openDevTools = function (windowId) {
            return this.channel.call('openDevTools', windowId);
        };
        WindowsChannelClient.prototype.toggleDevTools = function (windowId) {
            return this.channel.call('toggleDevTools', windowId);
        };
        WindowsChannelClient.prototype.closeWorkspace = function (windowId) {
            return this.channel.call('closeWorkspace', windowId);
        };
        WindowsChannelClient.prototype.createAndEnterWorkspace = function (windowId, folders, path) {
            return this.channel.call('createAndEnterWorkspace', [windowId, folders, path]);
        };
        WindowsChannelClient.prototype.saveAndEnterWorkspace = function (windowId, path) {
            return this.channel.call('saveAndEnterWorkspace', [windowId, path]);
        };
        WindowsChannelClient.prototype.toggleFullScreen = function (windowId) {
            return this.channel.call('toggleFullScreen', windowId);
        };
        WindowsChannelClient.prototype.setRepresentedFilename = function (windowId, fileName) {
            return this.channel.call('setRepresentedFilename', [windowId, fileName]);
        };
        WindowsChannelClient.prototype.addRecentlyOpened = function (files) {
            return this.channel.call('addRecentlyOpened', files);
        };
        WindowsChannelClient.prototype.removeFromRecentlyOpened = function (paths) {
            return this.channel.call('removeFromRecentlyOpened', paths);
        };
        WindowsChannelClient.prototype.clearRecentlyOpened = function () {
            return this.channel.call('clearRecentlyOpened');
        };
        WindowsChannelClient.prototype.getRecentlyOpened = function (windowId) {
            return this.channel.call('getRecentlyOpened', windowId);
        };
        WindowsChannelClient.prototype.showPreviousWindowTab = function () {
            return this.channel.call('showPreviousWindowTab');
        };
        WindowsChannelClient.prototype.showNextWindowTab = function () {
            return this.channel.call('showNextWindowTab');
        };
        WindowsChannelClient.prototype.moveWindowTabToNewWindow = function () {
            return this.channel.call('moveWindowTabToNewWindow');
        };
        WindowsChannelClient.prototype.mergeAllWindowTabs = function () {
            return this.channel.call('mergeAllWindowTabs');
        };
        WindowsChannelClient.prototype.toggleWindowTabsBar = function () {
            return this.channel.call('toggleWindowTabsBar');
        };
        WindowsChannelClient.prototype.focusWindow = function (windowId) {
            return this.channel.call('focusWindow', windowId);
        };
        WindowsChannelClient.prototype.closeWindow = function (windowId) {
            return this.channel.call('closeWindow', windowId);
        };
        WindowsChannelClient.prototype.isFocused = function (windowId) {
            return this.channel.call('isFocused', windowId);
        };
        WindowsChannelClient.prototype.isMaximized = function (windowId) {
            return this.channel.call('isMaximized', windowId);
        };
        WindowsChannelClient.prototype.maximizeWindow = function (windowId) {
            return this.channel.call('maximizeWindow', windowId);
        };
        WindowsChannelClient.prototype.unmaximizeWindow = function (windowId) {
            return this.channel.call('unmaximizeWindow', windowId);
        };
        WindowsChannelClient.prototype.onWindowTitleDoubleClick = function (windowId) {
            return this.channel.call('onWindowTitleDoubleClick', windowId);
        };
        WindowsChannelClient.prototype.setDocumentEdited = function (windowId, flag) {
            return this.channel.call('setDocumentEdited', [windowId, flag]);
        };
        WindowsChannelClient.prototype.quit = function () {
            return this.channel.call('quit');
        };
        WindowsChannelClient.prototype.relaunch = function (options) {
            return this.channel.call('relaunch', [options]);
        };
        WindowsChannelClient.prototype.whenSharedProcessReady = function () {
            return this.channel.call('whenSharedProcessReady');
        };
        WindowsChannelClient.prototype.toggleSharedProcess = function () {
            return this.channel.call('toggleSharedProcess');
        };
        WindowsChannelClient.prototype.openWindow = function (paths, options) {
            return this.channel.call('openWindow', [paths, options]);
        };
        WindowsChannelClient.prototype.openNewWindow = function () {
            return this.channel.call('openNewWindow');
        };
        WindowsChannelClient.prototype.showWindow = function (windowId) {
            return this.channel.call('showWindow', windowId);
        };
        WindowsChannelClient.prototype.getWindows = function () {
            return this.channel.call('getWindows');
        };
        WindowsChannelClient.prototype.getWindowCount = function () {
            return this.channel.call('getWindowCount');
        };
        WindowsChannelClient.prototype.log = function (severity) {
            var messages = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                messages[_i - 1] = arguments[_i];
            }
            return this.channel.call('log', [severity, messages]);
        };
        WindowsChannelClient.prototype.showItemInFolder = function (path) {
            return this.channel.call('showItemInFolder', path);
        };
        WindowsChannelClient.prototype.openExternal = function (url) {
            return this.channel.call('openExternal', url);
        };
        WindowsChannelClient.prototype.startCrashReporter = function (config) {
            return this.channel.call('startCrashReporter', config);
        };
        WindowsChannelClient.prototype.updateTouchBar = function (windowId, items) {
            return this.channel.call('updateTouchBar', [windowId, items]);
        };
        WindowsChannelClient.prototype.openAboutDialog = function () {
            return this.channel.call('openAboutDialog');
        };
        return WindowsChannelClient;
    }());
    exports.WindowsChannelClient = WindowsChannelClient;
});
