define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IWorkbenchThemeService = instantiation_1.createDecorator('themeService');
    exports.VS_LIGHT_THEME = 'vs';
    exports.VS_DARK_THEME = 'vs-dark';
    exports.VS_HC_THEME = 'hc-black';
    exports.COLOR_THEME_SETTING = 'workbench.colorTheme';
    exports.ICON_THEME_SETTING = 'workbench.iconTheme';
    exports.CUSTOM_WORKBENCH_COLORS_SETTING = 'workbench.colorCustomizations';
    exports.CUSTOM_EDITOR_COLORS_SETTING = 'editor.tokenColorCustomizations';
    exports.CUSTOM_EDITOR_SCOPE_COLORS_SETTING = 'textMateRules';
});
