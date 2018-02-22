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
define(["require", "exports", "vs/platform/issue/common/issue", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "electron", "vs/base/common/objects"], function (require, exports, issue_1, themeService_1, colorRegistry_1, theme_1, extensionManagement_1, extensionManagementUtil_1, electron_1, objects_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkbenchIssueService = /** @class */ (function () {
        function WorkbenchIssueService(issueService, themeService, extensionManagementService, extensionEnablementService) {
            this.issueService = issueService;
            this.themeService = themeService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
        }
        WorkbenchIssueService.prototype.openReporter = function (dataOverrides) {
            var _this = this;
            if (dataOverrides === void 0) { dataOverrides = {}; }
            return this.extensionManagementService.getInstalled(extensionManagement_1.LocalExtensionType.User).then(function (extensions) {
                var enabledExtensions = extensions.filter(function (extension) { return _this.extensionEnablementService.isEnabled({ id: extensionManagementUtil_1.getGalleryExtensionIdFromLocal(extension) }); });
                var theme = _this.themeService.getTheme();
                var issueReporterData = objects_1.assign({
                    styles: getIssueReporterStyles(theme),
                    zoomLevel: electron_1.webFrame.getZoomLevel(),
                    enabledExtensions: enabledExtensions
                }, dataOverrides);
                return _this.issueService.openReporter(issueReporterData);
            });
        };
        WorkbenchIssueService = __decorate([
            __param(0, issue_1.IIssueService),
            __param(1, themeService_1.IThemeService),
            __param(2, extensionManagement_1.IExtensionManagementService),
            __param(3, extensionManagement_1.IExtensionEnablementService)
        ], WorkbenchIssueService);
        return WorkbenchIssueService;
    }());
    exports.WorkbenchIssueService = WorkbenchIssueService;
    function getIssueReporterStyles(theme) {
        return {
            backgroundColor: theme.getColor(theme_1.SIDE_BAR_BACKGROUND) && theme.getColor(theme_1.SIDE_BAR_BACKGROUND).toString(),
            color: theme.getColor(colorRegistry_1.foreground).toString(),
            textLinkColor: theme.getColor(colorRegistry_1.textLinkForeground) && theme.getColor(colorRegistry_1.textLinkForeground).toString(),
            inputBackground: theme.getColor(colorRegistry_1.inputBackground) && theme.getColor(colorRegistry_1.inputBackground).toString(),
            inputForeground: theme.getColor(colorRegistry_1.inputForeground) && theme.getColor(colorRegistry_1.inputForeground).toString(),
            inputBorder: theme.getColor(colorRegistry_1.inputBorder) && theme.getColor(colorRegistry_1.inputBorder).toString(),
            inputActiveBorder: theme.getColor(colorRegistry_1.inputActiveOptionBorder) && theme.getColor(colorRegistry_1.inputActiveOptionBorder).toString(),
            inputErrorBorder: theme.getColor(colorRegistry_1.inputValidationErrorBorder) && theme.getColor(colorRegistry_1.inputValidationErrorBorder).toString(),
            buttonBackground: theme.getColor(colorRegistry_1.buttonBackground) && theme.getColor(colorRegistry_1.buttonBackground).toString(),
            buttonForeground: theme.getColor(colorRegistry_1.buttonForeground) && theme.getColor(colorRegistry_1.buttonForeground).toString(),
            buttonHoverBackground: theme.getColor(colorRegistry_1.buttonHoverBackground) && theme.getColor(colorRegistry_1.buttonHoverBackground).toString(),
            sliderActiveColor: theme.getColor(colorRegistry_1.scrollbarSliderActiveBackground) && theme.getColor(colorRegistry_1.scrollbarSliderActiveBackground).toString(),
            sliderBackgroundColor: theme.getColor(colorRegistry_1.scrollbarSliderBackground) && theme.getColor(colorRegistry_1.scrollbarSliderBackground).toString(),
            sliderHoverColor: theme.getColor(colorRegistry_1.scrollbarSliderHoverBackground) && theme.getColor(colorRegistry_1.scrollbarSliderHoverBackground).toString()
        };
    }
    exports.getIssueReporterStyles = getIssueReporterStyles;
});
