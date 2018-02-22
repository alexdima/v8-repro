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
define(["require", "exports", "vs/nls", "path", "vs/base/common/platform", "vs/editor/common/config/editorOptions", "vs/platform/configuration/common/configuration", "vs/workbench/services/configuration/common/configuration", "vs/platform/message/common/message", "vs/platform/storage/common/storage", "vs/workbench/parts/terminal/common/terminal", "vs/base/common/winjs.base", "vs/base/common/severity", "vs/workbench/parts/terminal/electron-browser/terminal"], function (require, exports, nls, path, platform, editorOptions_1, configuration_1, configuration_2, message_1, storage_1, terminal_1, winjs_base_1, severity_1, terminal_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_LINE_HEIGHT = 1.0;
    var MINIMUM_FONT_SIZE = 6;
    var MAXIMUM_FONT_SIZE = 25;
    /**
     * Encapsulates terminal configuration logic, the primary purpose of this file is so that platform
     * specific test cases can be written.
     */
    var TerminalConfigHelper = /** @class */ (function () {
        function TerminalConfigHelper(_configurationService, _workspaceConfigurationService, _choiceService, _storageService) {
            var _this = this;
            this._configurationService = _configurationService;
            this._workspaceConfigurationService = _workspaceConfigurationService;
            this._choiceService = _choiceService;
            this._storageService = _storageService;
            this._updateConfig();
            this._configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(terminal_1.TERMINAL_CONFIG_SECTION)) {
                    _this._updateConfig();
                }
            });
        }
        TerminalConfigHelper.prototype._updateConfig = function () {
            this.config = this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION);
        };
        TerminalConfigHelper.prototype._measureFont = function (fontFamily, fontSize, lineHeight) {
            // Create charMeasureElement if it hasn't been created or if it was orphaned by its parent
            if (!this._charMeasureElement || !this._charMeasureElement.parentElement) {
                this._charMeasureElement = document.createElement('div');
                this.panelContainer.appendChild(this._charMeasureElement);
            }
            // TODO: This should leverage CharMeasure
            var style = this._charMeasureElement.style;
            style.display = 'block';
            style.fontFamily = fontFamily;
            style.fontSize = fontSize + 'px';
            style.lineHeight = 'normal';
            this._charMeasureElement.innerText = 'X';
            var rect = this._charMeasureElement.getBoundingClientRect();
            style.display = 'none';
            // Bounding client rect was invalid, use last font measurement if available.
            if (this._lastFontMeasurement && !rect.width && !rect.height) {
                return this._lastFontMeasurement;
            }
            this._lastFontMeasurement = {
                fontFamily: fontFamily,
                fontSize: fontSize,
                lineHeight: lineHeight,
                charWidth: rect.width,
                charHeight: Math.ceil(rect.height)
            };
            return this._lastFontMeasurement;
        };
        /**
         * Gets the font information based on the terminal.integrated.fontFamily
         * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
         */
        TerminalConfigHelper.prototype.getFont = function (excludeDimensions) {
            var editorConfig = this._configurationService.getValue('editor');
            var fontFamily = this.config.fontFamily || editorConfig.fontFamily;
            // Work around bad font on Fedora
            if (!this.config.fontFamily) {
                if (terminal_2.isFedora) {
                    fontFamily = '\'DejaVu Sans Mono\'';
                }
            }
            var fontSize = this._toInteger(this.config.fontSize, MINIMUM_FONT_SIZE, MAXIMUM_FONT_SIZE, editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize);
            var lineHeight = this.config.lineHeight ? Math.max(this.config.lineHeight, 1) : DEFAULT_LINE_HEIGHT;
            if (excludeDimensions) {
                return {
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    lineHeight: lineHeight
                };
            }
            return this._measureFont(fontFamily, fontSize, lineHeight);
        };
        TerminalConfigHelper.prototype.setWorkspaceShellAllowed = function (isAllowed) {
            this._storageService.store(terminal_1.IS_WORKSPACE_SHELL_ALLOWED_STORAGE_KEY, isAllowed, storage_1.StorageScope.WORKSPACE);
        };
        TerminalConfigHelper.prototype.mergeDefaultShellPathAndArgs = function (shell) {
            var _this = this;
            // Check whether there is a workspace setting
            var platformKey = platform.isWindows ? 'windows' : platform.isMacintosh ? 'osx' : 'linux';
            var shellConfigValue = this._workspaceConfigurationService.inspect("terminal.integrated.shell." + platformKey);
            var shellArgsConfigValue = this._workspaceConfigurationService.inspect("terminal.integrated.shellArgs." + platformKey);
            // Check if workspace setting exists and whether it's whitelisted
            var isWorkspaceShellAllowed = false;
            if (shellConfigValue.workspace !== undefined || shellArgsConfigValue.workspace !== undefined) {
                isWorkspaceShellAllowed = this._storageService.getBoolean(terminal_1.IS_WORKSPACE_SHELL_ALLOWED_STORAGE_KEY, storage_1.StorageScope.WORKSPACE, undefined);
            }
            // Check if the value is neither blacklisted (false) or whitelisted (true) and ask for
            // permission
            if (isWorkspaceShellAllowed === undefined) {
                var shellString = void 0;
                if (shellConfigValue.workspace) {
                    shellString = "\"" + shellConfigValue.workspace + "\"";
                }
                var argsString = void 0;
                if (shellArgsConfigValue.workspace) {
                    argsString = "[" + shellArgsConfigValue.workspace.map(function (v) { return '"' + v + '"'; }).join(', ') + "]";
                }
                // Should not be localized as it's json-like syntax referencing settings keys
                var changeString = void 0;
                if (shellConfigValue.workspace !== undefined) {
                    if (shellArgsConfigValue.workspace !== undefined) {
                        changeString = "shell: " + shellString + ", shellArgs: " + argsString;
                    }
                    else {
                        changeString = "shell: " + shellString;
                    }
                }
                else {
                    changeString = "shellArgs: " + argsString;
                }
                var message = nls.localize('terminal.integrated.allowWorkspaceShell', "Do you allow {0} (defined as a workspace setting) to be launched in the terminal?", changeString);
                var options = [nls.localize('allow', "Allow"), nls.localize('disallow', "Disallow")];
                this._choiceService.choose(severity_1.default.Info, message, options, 1).then(function (choice) {
                    if (choice === 0) {
                        _this._storageService.store(terminal_1.IS_WORKSPACE_SHELL_ALLOWED_STORAGE_KEY, true, storage_1.StorageScope.WORKSPACE);
                    }
                    else {
                        _this._storageService.store(terminal_1.IS_WORKSPACE_SHELL_ALLOWED_STORAGE_KEY, false, storage_1.StorageScope.WORKSPACE);
                    }
                    return winjs_base_1.TPromise.as(null);
                });
            }
            shell.executable = (isWorkspaceShellAllowed ? shellConfigValue.value : shellConfigValue.user) || shellConfigValue.default;
            shell.args = (isWorkspaceShellAllowed ? shellArgsConfigValue.value : shellArgsConfigValue.user) || shellArgsConfigValue.default;
            // Change Sysnative to System32 if the OS is Windows but NOT WoW64. It's
            // safe to assume that this was used by accident as Sysnative does not
            // exist and will break the terminal in non-WoW64 environments.
            if (platform.isWindows && !process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
                var sysnativePath = path.join(process.env.windir, 'Sysnative').toLowerCase();
                if (shell.executable.toLowerCase().indexOf(sysnativePath) === 0) {
                    shell.executable = path.join(process.env.windir, 'System32', shell.executable.substr(sysnativePath.length));
                }
            }
        };
        TerminalConfigHelper.prototype._toInteger = function (source, minimum, maximum, fallback) {
            var r = parseInt(source, 10);
            if (isNaN(r)) {
                return fallback;
            }
            if (typeof minimum === 'number') {
                r = Math.max(minimum, r);
            }
            if (typeof maximum === 'number') {
                r = Math.min(maximum, r);
            }
            return r;
        };
        TerminalConfigHelper = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, configuration_2.IWorkspaceConfigurationService),
            __param(2, message_1.IChoiceService),
            __param(3, storage_1.IStorageService)
        ], TerminalConfigHelper);
        return TerminalConfigHelper;
    }());
    exports.TerminalConfigHelper = TerminalConfigHelper;
});
