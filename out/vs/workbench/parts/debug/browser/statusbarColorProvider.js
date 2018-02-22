/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/theme/common/themeService", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/part/common/partService", "vs/workbench/parts/debug/common/debug", "vs/platform/workspace/common/workspace", "vs/workbench/common/theme", "vs/base/browser/dom"], function (require, exports, themeService_1, nls_1, colorRegistry_1, partService_1, debug_1, workspace_1, theme_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // colors for theming
    exports.STATUS_BAR_DEBUGGING_BACKGROUND = colorRegistry_1.registerColor('statusBar.debuggingBackground', {
        dark: '#CC6633',
        light: '#CC6633',
        hc: '#CC6633'
    }, nls_1.localize('statusBarDebuggingBackground', "Status bar background color when a program is being debugged. The status bar is shown in the bottom of the window"));
    exports.STATUS_BAR_DEBUGGING_FOREGROUND = colorRegistry_1.registerColor('statusBar.debuggingForeground', {
        dark: theme_1.STATUS_BAR_FOREGROUND,
        light: theme_1.STATUS_BAR_FOREGROUND,
        hc: theme_1.STATUS_BAR_FOREGROUND
    }, nls_1.localize('statusBarDebuggingForeground', "Status bar foreground color when a program is being debugged. The status bar is shown in the bottom of the window"));
    exports.STATUS_BAR_DEBUGGING_BORDER = colorRegistry_1.registerColor('statusBar.debuggingBorder', {
        dark: theme_1.STATUS_BAR_BORDER,
        light: theme_1.STATUS_BAR_BORDER,
        hc: theme_1.STATUS_BAR_BORDER
    }, nls_1.localize('statusBarDebuggingBorder', "Status bar border color separating to the sidebar and editor when a program is being debugged. The status bar is shown in the bottom of the window"));
    var StatusBarColorProvider = /** @class */ (function (_super) {
        __extends(StatusBarColorProvider, _super);
        function StatusBarColorProvider(themeService, debugService, contextService, partService) {
            var _this = _super.call(this, themeService) || this;
            _this.debugService = debugService;
            _this.contextService = contextService;
            _this.partService = partService;
            _this.registerListeners();
            return _this;
        }
        StatusBarColorProvider.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.debugService.onDidChangeState(function (state) { return _this.updateStyles(); }));
            this.toUnbind.push(this.contextService.onDidChangeWorkbenchState(function (state) { return _this.updateStyles(); }));
        };
        StatusBarColorProvider.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            var container = this.partService.getContainer(partService_1.Parts.STATUSBAR_PART);
            if (this.isDebugging()) {
                dom_1.addClass(container, 'debugging');
            }
            else {
                dom_1.removeClass(container, 'debugging');
            }
            container.style.backgroundColor = this.getColor(this.getColorKey(theme_1.STATUS_BAR_NO_FOLDER_BACKGROUND, exports.STATUS_BAR_DEBUGGING_BACKGROUND, theme_1.STATUS_BAR_BACKGROUND));
            container.style.color = this.getColor(this.getColorKey(theme_1.STATUS_BAR_NO_FOLDER_FOREGROUND, exports.STATUS_BAR_DEBUGGING_FOREGROUND, theme_1.STATUS_BAR_FOREGROUND));
            var borderColor = this.getColor(this.getColorKey(theme_1.STATUS_BAR_NO_FOLDER_BORDER, exports.STATUS_BAR_DEBUGGING_BORDER, theme_1.STATUS_BAR_BORDER)) || this.getColor(colorRegistry_1.contrastBorder);
            container.style.borderTopWidth = borderColor ? '1px' : null;
            container.style.borderTopStyle = borderColor ? 'solid' : null;
            container.style.borderTopColor = borderColor;
        };
        StatusBarColorProvider.prototype.getColorKey = function (noFolderColor, debuggingColor, normalColor) {
            // Not debugging
            if (!this.isDebugging()) {
                if (this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY) {
                    return normalColor;
                }
                return noFolderColor;
            }
            // Debugging
            return debuggingColor;
        };
        StatusBarColorProvider.prototype.isDebugging = function () {
            if (this.debugService.state === debug_1.State.Inactive || this.debugService.state === debug_1.State.Initializing) {
                return false;
            }
            if (this.isRunningWithoutDebug()) {
                return false;
            }
            return true;
        };
        StatusBarColorProvider.prototype.isRunningWithoutDebug = function () {
            var process = this.debugService.getViewModel().focusedProcess;
            return process && process.configuration && process.configuration.noDebug;
        };
        StatusBarColorProvider = __decorate([
            __param(0, themeService_1.IThemeService),
            __param(1, debug_1.IDebugService),
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, partService_1.IPartService)
        ], StatusBarColorProvider);
        return StatusBarColorProvider;
    }(theme_1.Themable));
    exports.StatusBarColorProvider = StatusBarColorProvider;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var statusBarItemDebuggingForeground = theme.getColor(exports.STATUS_BAR_DEBUGGING_FOREGROUND);
        if (statusBarItemDebuggingForeground) {
            collector.addRule(".monaco-workbench > .part.statusbar.debugging > .statusbar-item .mask-icon { background-color: " + statusBarItemDebuggingForeground + " !important; }");
        }
    });
});
