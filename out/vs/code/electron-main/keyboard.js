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
define(["require", "exports", "native-keymap", "vs/platform/state/common/state", "vs/base/common/event", "vs/base/node/config", "vs/platform/environment/common/environment", "electron", "vs/platform/windows/electron-main/windows", "vs/platform/log/common/log"], function (require, exports, nativeKeymap, state_1, event_1, config_1, environment_1, electron_1, windows_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var KeyboardLayoutMonitor = /** @class */ (function () {
        function KeyboardLayoutMonitor() {
            this._emitter = new event_1.Emitter();
            this._registered = false;
        }
        KeyboardLayoutMonitor.prototype.onDidChangeKeyboardLayout = function (callback) {
            var _this = this;
            if (!this._registered) {
                this._registered = true;
                nativeKeymap.onDidChangeKeyboardLayout(function () {
                    _this._emitter.fire();
                });
            }
            return this._emitter.event(callback);
        };
        KeyboardLayoutMonitor.INSTANCE = new KeyboardLayoutMonitor();
        return KeyboardLayoutMonitor;
    }());
    exports.KeyboardLayoutMonitor = KeyboardLayoutMonitor;
    var KeybindingsResolver = /** @class */ (function () {
        function KeybindingsResolver(stateService, environmentService, windowsMainService, logService) {
            var _this = this;
            this.stateService = stateService;
            this.windowsMainService = windowsMainService;
            this.logService = logService;
            this._onKeybindingsChanged = new event_1.Emitter();
            this.onKeybindingsChanged = this._onKeybindingsChanged.event;
            this.commandIds = new Set();
            this.keybindings = this.stateService.getItem(KeybindingsResolver.lastKnownKeybindingsMapStorageKey) || Object.create(null);
            this.keybindingsWatcher = new config_1.ConfigWatcher(environmentService.appKeybindingsPath, { changeBufferDelay: 100, onError: function (error) { return _this.logService.error(error); } });
            this.registerListeners();
        }
        KeybindingsResolver.prototype.registerListeners = function () {
            var _this = this;
            // Listen to resolved keybindings from window
            electron_1.ipcMain.on('vscode:keybindingsResolved', function (event, rawKeybindings) {
                var keybindings = [];
                try {
                    keybindings = JSON.parse(rawKeybindings);
                }
                catch (error) {
                    // Should not happen
                }
                // Fill hash map of resolved keybindings and check for changes
                var keybindingsChanged = false;
                var keybindingsCount = 0;
                var resolvedKeybindings = Object.create(null);
                keybindings.forEach(function (keybinding) {
                    keybindingsCount++;
                    resolvedKeybindings[keybinding.id] = keybinding;
                    if (!_this.keybindings[keybinding.id] || keybinding.label !== _this.keybindings[keybinding.id].label) {
                        keybindingsChanged = true;
                    }
                });
                // A keybinding might have been unassigned, so we have to account for that too
                if (Object.keys(_this.keybindings).length !== keybindingsCount) {
                    keybindingsChanged = true;
                }
                if (keybindingsChanged) {
                    _this.keybindings = resolvedKeybindings;
                    _this.stateService.setItem(KeybindingsResolver.lastKnownKeybindingsMapStorageKey, _this.keybindings); // keep to restore instantly after restart
                    _this._onKeybindingsChanged.fire();
                }
            });
            // Resolve keybindings when any first window is loaded
            var onceOnWindowReady = event_1.once(this.windowsMainService.onWindowReady);
            onceOnWindowReady(function (win) { return _this.resolveKeybindings(win); });
            // Resolve keybindings again when keybindings.json changes
            this.keybindingsWatcher.onDidUpdateConfiguration(function () { return _this.resolveKeybindings(); });
            // Resolve keybindings when window reloads because an installed extension could have an impact
            this.windowsMainService.onWindowReload(function () { return _this.resolveKeybindings(); });
        };
        KeybindingsResolver.prototype.resolveKeybindings = function (win) {
            if (win === void 0) { win = this.windowsMainService.getLastActiveWindow(); }
            if (this.commandIds.size && win) {
                var commandIds_1 = [];
                this.commandIds.forEach(function (id) { return commandIds_1.push(id); });
                win.sendWhenReady('vscode:resolveKeybindings', JSON.stringify(commandIds_1));
            }
        };
        KeybindingsResolver.prototype.getKeybinding = function (commandId) {
            if (!commandId) {
                return void 0;
            }
            if (!this.commandIds.has(commandId)) {
                this.commandIds.add(commandId);
            }
            return this.keybindings[commandId];
        };
        KeybindingsResolver.prototype.dispose = function () {
            this._onKeybindingsChanged.dispose();
            this.keybindingsWatcher.dispose();
        };
        KeybindingsResolver.lastKnownKeybindingsMapStorageKey = 'lastKnownKeybindings';
        KeybindingsResolver = __decorate([
            __param(0, state_1.IStateService),
            __param(1, environment_1.IEnvironmentService),
            __param(2, windows_1.IWindowsMainService),
            __param(3, log_1.ILogService)
        ], KeybindingsResolver);
        return KeybindingsResolver;
    }());
    exports.KeybindingsResolver = KeybindingsResolver;
});
