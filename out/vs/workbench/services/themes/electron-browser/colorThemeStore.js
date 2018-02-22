var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/types", "path", "vs/platform/extensions/common/extensionsRegistry", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/services/themes/electron-browser/colorThemeData", "vs/platform/extensions/common/extensions", "vs/base/common/event"], function (require, exports, nls, types, Paths, extensionsRegistry_1, workbenchThemeService_1, colorThemeData_1, extensions_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var themesExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('themes', [], {
        description: nls.localize('vscode.extension.contributes.themes', 'Contributes textmate color themes.'),
        type: 'array',
        items: {
            type: 'object',
            defaultSnippets: [{ body: { label: '${1:label}', id: '${2:id}', uiTheme: workbenchThemeService_1.VS_DARK_THEME, path: './themes/${3:id}.tmTheme.' } }],
            properties: {
                id: {
                    description: nls.localize('vscode.extension.contributes.themes.id', 'Id of the icon theme as used in the user settings.'),
                    type: 'string'
                },
                label: {
                    description: nls.localize('vscode.extension.contributes.themes.label', 'Label of the color theme as shown in the UI.'),
                    type: 'string'
                },
                uiTheme: {
                    description: nls.localize('vscode.extension.contributes.themes.uiTheme', 'Base theme defining the colors around the editor: \'vs\' is the light color theme, \'vs-dark\' is the dark color theme. \'hc-black\' is the dark high contrast theme.'),
                    enum: [workbenchThemeService_1.VS_LIGHT_THEME, workbenchThemeService_1.VS_DARK_THEME, workbenchThemeService_1.VS_HC_THEME]
                },
                path: {
                    description: nls.localize('vscode.extension.contributes.themes.path', 'Path of the tmTheme file. The path is relative to the extension folder and is typically \'./themes/themeFile.tmTheme\'.'),
                    type: 'string'
                }
            },
            required: ['path', 'uiTheme']
        }
    });
    var ColorThemeStore = /** @class */ (function () {
        function ColorThemeStore(extensionService) {
            this.extensionService = extensionService;
            this.extensionsColorThemes = [];
            this.onDidChangeEmitter = new event_1.Emitter();
            this.initialize();
        }
        Object.defineProperty(ColorThemeStore.prototype, "onDidChange", {
            get: function () { return this.onDidChangeEmitter.event; },
            enumerable: true,
            configurable: true
        });
        ColorThemeStore.prototype.initialize = function () {
            var _this = this;
            themesExtPoint.setHandler(function (extensions) {
                for (var _i = 0, extensions_2 = extensions; _i < extensions_2.length; _i++) {
                    var ext = extensions_2[_i];
                    var extensionData = {
                        extensionId: ext.description.id,
                        extensionPublisher: ext.description.publisher,
                        extensionName: ext.description.name,
                        extensionIsBuiltin: ext.description.isBuiltin
                    };
                    _this.onThemes(ext.description.extensionFolderPath, extensionData, ext.value, ext.collector);
                }
                _this.onDidChangeEmitter.fire(_this.extensionsColorThemes);
            });
        };
        ColorThemeStore.prototype.onThemes = function (extensionFolderPath, extensionData, themes, collector) {
            var _this = this;
            if (!Array.isArray(themes)) {
                collector.error(nls.localize('reqarray', "Extension point `{0}` must be an array.", themesExtPoint.name));
                return;
            }
            themes.forEach(function (theme) {
                if (!theme.path || !types.isString(theme.path)) {
                    collector.error(nls.localize('reqpath', "Expected string in `contributes.{0}.path`. Provided value: {1}", themesExtPoint.name, String(theme.path)));
                    return;
                }
                var normalizedAbsolutePath = Paths.normalize(Paths.join(extensionFolderPath, theme.path));
                if (normalizedAbsolutePath.indexOf(Paths.normalize(extensionFolderPath)) !== 0) {
                    collector.warn(nls.localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", themesExtPoint.name, normalizedAbsolutePath, extensionFolderPath));
                }
                var themeData = colorThemeData_1.ColorThemeData.fromExtensionTheme(theme, normalizedAbsolutePath, extensionData);
                _this.extensionsColorThemes.push(themeData);
            });
        };
        ColorThemeStore.prototype.findThemeData = function (themeId, defaultId) {
            return this.getColorThemes().then(function (allThemes) {
                var defaultTheme = void 0;
                for (var _i = 0, allThemes_1 = allThemes; _i < allThemes_1.length; _i++) {
                    var t = allThemes_1[_i];
                    if (t.id === themeId) {
                        return t;
                    }
                    if (t.id === defaultId) {
                        defaultTheme = t;
                    }
                }
                return defaultTheme;
            });
        };
        ColorThemeStore.prototype.findThemeDataBySettingsId = function (settingsId, defaultId) {
            return this.getColorThemes().then(function (allThemes) {
                var defaultTheme = void 0;
                for (var _i = 0, allThemes_2 = allThemes; _i < allThemes_2.length; _i++) {
                    var t = allThemes_2[_i];
                    if (t.settingsId === settingsId) {
                        return t;
                    }
                    if (t.id === defaultId) {
                        defaultTheme = t;
                    }
                }
                return defaultTheme;
            });
        };
        ColorThemeStore.prototype.getColorThemes = function () {
            var _this = this;
            return this.extensionService.whenInstalledExtensionsRegistered().then(function (isReady) {
                return _this.extensionsColorThemes;
            });
        };
        ColorThemeStore = __decorate([
            __param(0, extensions_1.IExtensionService)
        ], ColorThemeStore);
        return ColorThemeStore;
    }());
    exports.ColorThemeStore = ColorThemeStore;
});
