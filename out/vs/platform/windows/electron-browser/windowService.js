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
define(["require", "exports", "vs/base/common/event", "vs/platform/windows/common/windows"], function (require, exports, event_1, windows_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindowService = /** @class */ (function () {
        function WindowService(windowId, configuration, windowsService) {
            this.windowId = windowId;
            this.configuration = configuration;
            this.windowsService = windowsService;
            var onThisWindowFocus = event_1.mapEvent(event_1.filterEvent(windowsService.onWindowFocus, function (id) { return id === windowId; }), function (_) { return true; });
            var onThisWindowBlur = event_1.mapEvent(event_1.filterEvent(windowsService.onWindowBlur, function (id) { return id === windowId; }), function (_) { return false; });
            this.onDidChangeFocus = event_1.anyEvent(onThisWindowFocus, onThisWindowBlur);
        }
        WindowService.prototype.getCurrentWindowId = function () {
            return this.windowId;
        };
        WindowService.prototype.getConfiguration = function () {
            return this.configuration;
        };
        WindowService.prototype.pickFileFolderAndOpen = function (options) {
            options.windowId = this.windowId;
            return this.windowsService.pickFileFolderAndOpen(options);
        };
        WindowService.prototype.pickFileAndOpen = function (options) {
            options.windowId = this.windowId;
            return this.windowsService.pickFileAndOpen(options);
        };
        WindowService.prototype.pickFolderAndOpen = function (options) {
            options.windowId = this.windowId;
            return this.windowsService.pickFolderAndOpen(options);
        };
        WindowService.prototype.pickWorkspaceAndOpen = function (options) {
            options.windowId = this.windowId;
            return this.windowsService.pickWorkspaceAndOpen(options);
        };
        WindowService.prototype.reloadWindow = function () {
            return this.windowsService.reloadWindow(this.windowId);
        };
        WindowService.prototype.openDevTools = function () {
            return this.windowsService.openDevTools(this.windowId);
        };
        WindowService.prototype.toggleDevTools = function () {
            return this.windowsService.toggleDevTools(this.windowId);
        };
        WindowService.prototype.closeWorkspace = function () {
            return this.windowsService.closeWorkspace(this.windowId);
        };
        WindowService.prototype.createAndEnterWorkspace = function (folders, path) {
            return this.windowsService.createAndEnterWorkspace(this.windowId, folders, path);
        };
        WindowService.prototype.saveAndEnterWorkspace = function (path) {
            return this.windowsService.saveAndEnterWorkspace(this.windowId, path);
        };
        WindowService.prototype.closeWindow = function () {
            return this.windowsService.closeWindow(this.windowId);
        };
        WindowService.prototype.toggleFullScreen = function () {
            return this.windowsService.toggleFullScreen(this.windowId);
        };
        WindowService.prototype.setRepresentedFilename = function (fileName) {
            return this.windowsService.setRepresentedFilename(this.windowId, fileName);
        };
        WindowService.prototype.getRecentlyOpened = function () {
            return this.windowsService.getRecentlyOpened(this.windowId);
        };
        WindowService.prototype.focusWindow = function () {
            return this.windowsService.focusWindow(this.windowId);
        };
        WindowService.prototype.isFocused = function () {
            return this.windowsService.isFocused(this.windowId);
        };
        WindowService.prototype.onWindowTitleDoubleClick = function () {
            return this.windowsService.onWindowTitleDoubleClick(this.windowId);
        };
        WindowService.prototype.setDocumentEdited = function (flag) {
            return this.windowsService.setDocumentEdited(this.windowId, flag);
        };
        WindowService.prototype.show = function () {
            return this.windowsService.showWindow(this.windowId);
        };
        WindowService.prototype.showMessageBox = function (options) {
            return this.windowsService.showMessageBox(this.windowId, options);
        };
        WindowService.prototype.showSaveDialog = function (options) {
            return this.windowsService.showSaveDialog(this.windowId, options);
        };
        WindowService.prototype.showOpenDialog = function (options) {
            return this.windowsService.showOpenDialog(this.windowId, options);
        };
        WindowService.prototype.updateTouchBar = function (items) {
            return this.windowsService.updateTouchBar(this.windowId, items);
        };
        WindowService = __decorate([
            __param(2, windows_1.IWindowsService)
        ], WindowService);
        return WindowService;
    }());
    exports.WindowService = WindowService;
});
