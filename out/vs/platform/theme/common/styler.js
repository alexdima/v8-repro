/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/colorRegistry"], function (require, exports, colorRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function attachStyler(themeService, optionsMapping, widgetOrCallback) {
        function applyStyles(theme) {
            var styles = Object.create(null);
            for (var key in optionsMapping) {
                var value = optionsMapping[key];
                if (typeof value === 'string') {
                    styles[key] = theme.getColor(value);
                }
                else if (typeof value === 'function') {
                    styles[key] = value(theme);
                }
            }
            if (typeof widgetOrCallback === 'function') {
                widgetOrCallback(styles);
            }
            else {
                widgetOrCallback.style(styles);
            }
        }
        applyStyles(themeService.getTheme());
        return themeService.onThemeChange(applyStyles);
    }
    exports.attachStyler = attachStyler;
    function attachCheckboxStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            inputActiveOptionBorder: (style && style.inputActiveOptionBorderColor) || colorRegistry_1.inputActiveOptionBorder
        }, widget);
    }
    exports.attachCheckboxStyler = attachCheckboxStyler;
    function attachBadgeStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            badgeBackground: (style && style.badgeBackground) || colorRegistry_1.badgeBackground,
            badgeForeground: (style && style.badgeForeground) || colorRegistry_1.badgeForeground,
            badgeBorder: colorRegistry_1.contrastBorder
        }, widget);
    }
    exports.attachBadgeStyler = attachBadgeStyler;
    function attachInputBoxStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            inputBackground: (style && style.inputBackground) || colorRegistry_1.inputBackground,
            inputForeground: (style && style.inputForeground) || colorRegistry_1.inputForeground,
            inputBorder: (style && style.inputBorder) || colorRegistry_1.inputBorder,
            inputValidationInfoBorder: (style && style.inputValidationInfoBorder) || colorRegistry_1.inputValidationInfoBorder,
            inputValidationInfoBackground: (style && style.inputValidationInfoBackground) || colorRegistry_1.inputValidationInfoBackground,
            inputValidationWarningBorder: (style && style.inputValidationWarningBorder) || colorRegistry_1.inputValidationWarningBorder,
            inputValidationWarningBackground: (style && style.inputValidationWarningBackground) || colorRegistry_1.inputValidationWarningBackground,
            inputValidationErrorBorder: (style && style.inputValidationErrorBorder) || colorRegistry_1.inputValidationErrorBorder,
            inputValidationErrorBackground: (style && style.inputValidationErrorBackground) || colorRegistry_1.inputValidationErrorBackground
        }, widget);
    }
    exports.attachInputBoxStyler = attachInputBoxStyler;
    function attachSelectBoxStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            selectBackground: (style && style.selectBackground) || colorRegistry_1.selectBackground,
            selectListBackground: (style && style.selectListBackground) || colorRegistry_1.selectListBackground,
            selectForeground: (style && style.selectForeground) || colorRegistry_1.selectForeground,
            selectBorder: (style && style.selectBorder) || colorRegistry_1.selectBorder,
            focusBorder: (style && style.focusBorder) || colorRegistry_1.focusBorder,
            listFocusBackground: (style && style.listFocusBackground) || colorRegistry_1.listFocusBackground,
            listFocusForeground: (style && style.listFocusForeground) || colorRegistry_1.listFocusForeground,
            listFocusOutline: (style && style.listFocusOutline) || colorRegistry_1.activeContrastBorder,
            listHoverBackground: (style && style.listHoverBackground) || colorRegistry_1.listHoverBackground,
            listHoverForeground: (style && style.listHoverForeground) || colorRegistry_1.listHoverForeground,
            listHoverOutline: (style && style.listFocusOutline) || colorRegistry_1.activeContrastBorder
        }, widget);
    }
    exports.attachSelectBoxStyler = attachSelectBoxStyler;
    function attachFindInputBoxStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            inputBackground: (style && style.inputBackground) || colorRegistry_1.inputBackground,
            inputForeground: (style && style.inputForeground) || colorRegistry_1.inputForeground,
            inputBorder: (style && style.inputBorder) || colorRegistry_1.inputBorder,
            inputActiveOptionBorder: (style && style.inputActiveOptionBorder) || colorRegistry_1.inputActiveOptionBorder,
            inputValidationInfoBorder: (style && style.inputValidationInfoBorder) || colorRegistry_1.inputValidationInfoBorder,
            inputValidationInfoBackground: (style && style.inputValidationInfoBackground) || colorRegistry_1.inputValidationInfoBackground,
            inputValidationWarningBorder: (style && style.inputValidationWarningBorder) || colorRegistry_1.inputValidationWarningBorder,
            inputValidationWarningBackground: (style && style.inputValidationWarningBackground) || colorRegistry_1.inputValidationWarningBackground,
            inputValidationErrorBorder: (style && style.inputValidationErrorBorder) || colorRegistry_1.inputValidationErrorBorder,
            inputValidationErrorBackground: (style && style.inputValidationErrorBackground) || colorRegistry_1.inputValidationErrorBackground
        }, widget);
    }
    exports.attachFindInputBoxStyler = attachFindInputBoxStyler;
    function attachQuickOpenStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            foreground: (style && style.foreground) || colorRegistry_1.foreground,
            background: (style && style.background) || colorRegistry_1.editorBackground,
            borderColor: style && style.borderColor || colorRegistry_1.contrastBorder,
            widgetShadow: style && style.widgetShadow || colorRegistry_1.widgetShadow,
            progressBarBackground: style && style.progressBarBackground || colorRegistry_1.progressBarBackground,
            pickerGroupForeground: style && style.pickerGroupForeground || colorRegistry_1.pickerGroupForeground,
            pickerGroupBorder: style && style.pickerGroupBorder || colorRegistry_1.pickerGroupBorder,
            inputBackground: (style && style.inputBackground) || colorRegistry_1.inputBackground,
            inputForeground: (style && style.inputForeground) || colorRegistry_1.inputForeground,
            inputBorder: (style && style.inputBorder) || colorRegistry_1.inputBorder,
            inputValidationInfoBorder: (style && style.inputValidationInfoBorder) || colorRegistry_1.inputValidationInfoBorder,
            inputValidationInfoBackground: (style && style.inputValidationInfoBackground) || colorRegistry_1.inputValidationInfoBackground,
            inputValidationWarningBorder: (style && style.inputValidationWarningBorder) || colorRegistry_1.inputValidationWarningBorder,
            inputValidationWarningBackground: (style && style.inputValidationWarningBackground) || colorRegistry_1.inputValidationWarningBackground,
            inputValidationErrorBorder: (style && style.inputValidationErrorBorder) || colorRegistry_1.inputValidationErrorBorder,
            inputValidationErrorBackground: (style && style.inputValidationErrorBackground) || colorRegistry_1.inputValidationErrorBackground,
            listFocusBackground: (style && style.listFocusBackground) || colorRegistry_1.listFocusBackground,
            listFocusForeground: (style && style.listFocusForeground) || colorRegistry_1.listFocusForeground,
            listActiveSelectionBackground: (style && style.listActiveSelectionBackground) || colorRegistry_1.lighten(colorRegistry_1.listActiveSelectionBackground, 0.1),
            listActiveSelectionForeground: (style && style.listActiveSelectionForeground) || colorRegistry_1.listActiveSelectionForeground,
            listFocusAndSelectionBackground: style && style.listFocusAndSelectionBackground || colorRegistry_1.listActiveSelectionBackground,
            listFocusAndSelectionForeground: (style && style.listFocusAndSelectionForeground) || colorRegistry_1.listActiveSelectionForeground,
            listInactiveSelectionBackground: (style && style.listInactiveSelectionBackground) || colorRegistry_1.listInactiveSelectionBackground,
            listInactiveSelectionForeground: (style && style.listInactiveSelectionForeground) || colorRegistry_1.listInactiveSelectionForeground,
            listInactiveFocusBackground: (style && style.listInactiveFocusBackground) || colorRegistry_1.listInactiveFocusBackground,
            listInactiveFocusForeground: (style && style.listInactiveFocusForeground) || colorRegistry_1.listInactiveFocusForeground,
            listHoverBackground: (style && style.listHoverBackground) || colorRegistry_1.listHoverBackground,
            listHoverForeground: (style && style.listHoverForeground) || colorRegistry_1.listHoverForeground,
            listDropBackground: (style && style.listDropBackground) || colorRegistry_1.listDropBackground,
            listFocusOutline: (style && style.listFocusOutline) || colorRegistry_1.activeContrastBorder,
            listSelectionOutline: (style && style.listSelectionOutline) || colorRegistry_1.activeContrastBorder,
            listHoverOutline: (style && style.listHoverOutline) || colorRegistry_1.activeContrastBorder
        }, widget);
    }
    exports.attachQuickOpenStyler = attachQuickOpenStyler;
    function attachListStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            listFocusBackground: (style && style.listFocusBackground) || colorRegistry_1.listFocusBackground,
            listFocusForeground: (style && style.listFocusForeground) || colorRegistry_1.listFocusForeground,
            listActiveSelectionBackground: (style && style.listActiveSelectionBackground) || colorRegistry_1.lighten(colorRegistry_1.listActiveSelectionBackground, 0.1),
            listActiveSelectionForeground: (style && style.listActiveSelectionForeground) || colorRegistry_1.listActiveSelectionForeground,
            listFocusAndSelectionBackground: style && style.listFocusAndSelectionBackground || colorRegistry_1.listActiveSelectionBackground,
            listFocusAndSelectionForeground: (style && style.listFocusAndSelectionForeground) || colorRegistry_1.listActiveSelectionForeground,
            listInactiveSelectionBackground: (style && style.listInactiveSelectionBackground) || colorRegistry_1.listInactiveSelectionBackground,
            listInactiveSelectionForeground: (style && style.listInactiveSelectionForeground) || colorRegistry_1.listInactiveSelectionForeground,
            listInactiveFocusBackground: (style && style.listInactiveFocusBackground) || colorRegistry_1.listInactiveFocusBackground,
            listInactiveFocusForeground: (style && style.listInactiveFocusForeground) || colorRegistry_1.listInactiveFocusForeground,
            listHoverBackground: (style && style.listHoverBackground) || colorRegistry_1.listHoverBackground,
            listHoverForeground: (style && style.listHoverForeground) || colorRegistry_1.listHoverForeground,
            listDropBackground: (style && style.listDropBackground) || colorRegistry_1.listDropBackground,
            listFocusOutline: (style && style.listFocusOutline) || colorRegistry_1.activeContrastBorder,
            listSelectionOutline: (style && style.listSelectionOutline) || colorRegistry_1.activeContrastBorder,
            listHoverOutline: (style && style.listHoverOutline) || colorRegistry_1.activeContrastBorder,
            listInactiveFocusOutline: style && style.listInactiveFocusOutline // not defined by default, only opt-in
        }, widget);
    }
    exports.attachListStyler = attachListStyler;
    function attachButtonStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            buttonForeground: (style && style.buttonForeground) || colorRegistry_1.buttonForeground,
            buttonBackground: (style && style.buttonBackground) || colorRegistry_1.buttonBackground,
            buttonHoverBackground: (style && style.buttonHoverBackground) || colorRegistry_1.buttonHoverBackground,
            buttonBorder: colorRegistry_1.contrastBorder
        }, widget);
    }
    exports.attachButtonStyler = attachButtonStyler;
    function attachProgressBarStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            progressBarBackground: (style && style.progressBarBackground) || colorRegistry_1.progressBarBackground
        }, widget);
    }
    exports.attachProgressBarStyler = attachProgressBarStyler;
    function attachStylerCallback(themeService, colors, callback) {
        return attachStyler(themeService, colors, callback);
    }
    exports.attachStylerCallback = attachStylerCallback;
});
