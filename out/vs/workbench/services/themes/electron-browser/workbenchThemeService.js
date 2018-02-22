var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/types", "vs/platform/extensions/common/extensions", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/registry/common/platform", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "./colorThemeData", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/base/browser/builder", "vs/base/common/event", "vs/workbench/services/themes/common/colorThemeSchema", "vs/workbench/services/themes/common/fileIconThemeSchema", "vs/platform/broadcast/electron-browser/broadcastService", "vs/workbench/services/themes/electron-browser/colorThemeStore", "vs/workbench/services/themes/electron-browser/fileIconThemeStore", "vs/workbench/services/themes/electron-browser/fileIconThemeData"], function (require, exports, winjs_base_1, nls, types, extensions_1, workbenchThemeService_1, storage_1, telemetry_1, platform_1, errors, configuration_1, configurationRegistry_1, instantiation_1, colorThemeData_1, themeService_1, colorRegistry_1, color_1, builder_1, event_1, colorThemeSchema, fileIconThemeSchema, broadcastService_1, colorThemeStore_1, fileIconThemeStore_1, fileIconThemeData_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // implementation
    var DEFAULT_THEME_ID = 'vs-dark vscode-theme-defaults-themes-dark_plus-json';
    var DEFAULT_THEME_SETTING_VALUE = 'Default Dark+';
    var PERSISTED_THEME_STORAGE_KEY = 'colorThemeData';
    var PERSISTED_ICON_THEME_STORAGE_KEY = 'iconThemeData';
    var defaultThemeExtensionId = 'vscode-theme-defaults';
    var oldDefaultThemeExtensionId = 'vscode-theme-colorful-defaults';
    var DEFAULT_ICON_THEME_SETTING_VALUE = 'vs-seti';
    var fileIconsEnabledClass = 'file-icons-enabled';
    var colorThemeRulesClassName = 'contributedColorTheme';
    var iconThemeRulesClassName = 'contributedIconTheme';
    var themingRegistry = platform_1.Registry.as(themeService_1.Extensions.ThemingContribution);
    function validateThemeId(theme) {
        // migrations
        switch (theme) {
            case workbenchThemeService_1.VS_LIGHT_THEME: return "vs " + defaultThemeExtensionId + "-themes-light_vs-json";
            case workbenchThemeService_1.VS_DARK_THEME: return "vs-dark " + defaultThemeExtensionId + "-themes-dark_vs-json";
            case workbenchThemeService_1.VS_HC_THEME: return "hc-black " + defaultThemeExtensionId + "-themes-hc_black-json";
            case "vs " + oldDefaultThemeExtensionId + "-themes-light_plus-tmTheme": return "vs " + defaultThemeExtensionId + "-themes-light_plus-json";
            case "vs-dark " + oldDefaultThemeExtensionId + "-themes-dark_plus-tmTheme": return "vs-dark " + defaultThemeExtensionId + "-themes-dark_plus-json";
        }
        return theme;
    }
    var WorkbenchThemeService = /** @class */ (function () {
        function WorkbenchThemeService(container, extensionService, storageService, broadcastService, configurationService, telemetryService, instantiationService) {
            var _this = this;
            this.storageService = storageService;
            this.broadcastService = broadcastService;
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.instantiationService = instantiationService;
            this.themeExtensionsActivated = new Map();
            this.container = container;
            this.colorThemeStore = new colorThemeStore_1.ColorThemeStore(extensionService);
            this.onFileIconThemeChange = new event_1.Emitter();
            this.iconThemeStore = new fileIconThemeStore_1.FileIconThemeStore(extensionService);
            this.onColorThemeChange = new event_1.Emitter();
            this.currentIconTheme = {
                id: '',
                label: '',
                settingsId: null,
                isLoaded: false,
                hasFileIcons: false,
                hasFolderIcons: false,
                hidesExplorerArrows: false,
                extensionData: null
            };
            // In order to avoid paint flashing for tokens, because
            // themes are loaded asynchronously, we need to initialize
            // a color theme document with good defaults until the theme is loaded
            var themeData = null;
            var persistedThemeData = this.storageService.get(PERSISTED_THEME_STORAGE_KEY);
            if (persistedThemeData) {
                themeData = colorThemeData_1.ColorThemeData.fromStorageData(persistedThemeData);
            }
            if (!themeData) {
                var isLightTheme = (Array.prototype.indexOf.call(document.body.classList, 'vs') >= 0);
                themeData = colorThemeData_1.ColorThemeData.createUnloadedTheme(isLightTheme ? workbenchThemeService_1.VS_LIGHT_THEME : workbenchThemeService_1.VS_DARK_THEME);
            }
            themeData.setCustomColors(this.colorCustomizations);
            themeData.setCustomTokenColors(this.tokenColorCustomizations);
            this.updateDynamicCSSRules(themeData);
            this.applyTheme(themeData, null, true);
            var iconData = null;
            var persistedIconThemeData = this.storageService.get(PERSISTED_ICON_THEME_STORAGE_KEY);
            if (persistedIconThemeData) {
                iconData = fileIconThemeData_1.FileIconThemeData.fromStorageData(persistedIconThemeData);
                if (iconData) {
                    _applyIconTheme(iconData, function () {
                        _this.doSetFileIconTheme(iconData);
                        return winjs_base_1.TPromise.wrap(iconData);
                    });
                }
            }
            this.initialize().then(null, errors.onUnexpectedError).then(function (_) {
                _this.installConfigurationListener();
            });
            // update settings schema setting
            this.colorThemeStore.onDidChange(function (themes) {
                var enumDescription = themeData.description || '';
                colorCustomizationsSchema.properties = colorThemeSchema.colorsSchema.properties;
                var copyColorCustomizationsSchema = __assign({}, colorCustomizationsSchema);
                copyColorCustomizationsSchema.properties = __assign({}, colorThemeSchema.colorsSchema.properties);
                customEditorColorSchema.properties = customEditorColorConfigurationProperties;
                var copyCustomEditorColorSchema = __assign({}, customEditorColorSchema);
                copyCustomEditorColorSchema.properties = __assign({}, customEditorColorConfigurationProperties);
                themes.forEach(function (t) {
                    colorThemeSettingSchema.enum.push(t.settingsId);
                    colorThemeSettingSchema.enumDescriptions.push(enumDescription);
                    var themeId = "[" + t.settingsId + "]";
                    colorCustomizationsSchema.properties[themeId] = copyColorCustomizationsSchema;
                    customEditorColorSchema.properties[themeId] = copyCustomEditorColorSchema;
                });
                configurationRegistry.notifyConfigurationSchemaUpdated(themeSettingsConfiguration);
                configurationRegistry.notifyConfigurationSchemaUpdated(customEditorColorConfiguration);
            });
            this.iconThemeStore.onDidChange(function (themes) {
                iconThemeSettingSchema.enum = [null].concat(themes.map(function (t) { return t.settingsId; }));
                iconThemeSettingSchema.enumDescriptions = [iconThemeSettingSchema.enumDescriptions[0]].concat(themes.map(function (t) { return themeData.description || ''; }));
                configurationRegistry.notifyConfigurationSchemaUpdated(themeSettingsConfiguration);
            });
        }
        Object.defineProperty(WorkbenchThemeService.prototype, "colorCustomizations", {
            get: function () {
                return this.configurationService.getValue(workbenchThemeService_1.CUSTOM_WORKBENCH_COLORS_SETTING) || {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchThemeService.prototype, "tokenColorCustomizations", {
            get: function () {
                return this.configurationService.getValue(workbenchThemeService_1.CUSTOM_EDITOR_COLORS_SETTING) || {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchThemeService.prototype, "onDidColorThemeChange", {
            get: function () {
                return this.onColorThemeChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchThemeService.prototype, "onDidFileIconThemeChange", {
            get: function () {
                return this.onFileIconThemeChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchThemeService.prototype, "onThemeChange", {
            get: function () {
                return this.onColorThemeChange.event;
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchThemeService.prototype.initialize = function () {
            var _this = this;
            var colorThemeSetting = this.configurationService.getValue(workbenchThemeService_1.COLOR_THEME_SETTING);
            var iconThemeSetting = this.configurationService.getValue(workbenchThemeService_1.ICON_THEME_SETTING) || '';
            return winjs_base_1.Promise.join([
                this.colorThemeStore.findThemeDataBySettingsId(colorThemeSetting, DEFAULT_THEME_ID).then(function (theme) {
                    return _this.setColorTheme(theme && theme.id, null);
                }),
                this.iconThemeStore.findThemeBySettingsId(iconThemeSetting).then(function (theme) {
                    return _this.setFileIconTheme(theme && theme.id, null);
                }),
            ]);
        };
        WorkbenchThemeService.prototype.installConfigurationListener = function () {
            var _this = this;
            this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(workbenchThemeService_1.COLOR_THEME_SETTING)) {
                    var colorThemeSetting = _this.configurationService.getValue(workbenchThemeService_1.COLOR_THEME_SETTING);
                    if (colorThemeSetting !== _this.currentColorTheme.settingsId) {
                        _this.colorThemeStore.findThemeDataBySettingsId(colorThemeSetting, null).then(function (theme) {
                            if (theme) {
                                _this.setColorTheme(theme.id, null);
                            }
                        });
                    }
                }
                if (e.affectsConfiguration(workbenchThemeService_1.ICON_THEME_SETTING)) {
                    var iconThemeSetting = _this.configurationService.getValue(workbenchThemeService_1.ICON_THEME_SETTING) || '';
                    if (iconThemeSetting !== _this.currentIconTheme.settingsId) {
                        _this.iconThemeStore.findThemeBySettingsId(iconThemeSetting).then(function (theme) {
                            _this.setFileIconTheme(theme && theme.id, null);
                        });
                    }
                }
                if (_this.currentColorTheme) {
                    var hasColorChanges = false;
                    if (e.affectsConfiguration(workbenchThemeService_1.CUSTOM_WORKBENCH_COLORS_SETTING)) {
                        _this.currentColorTheme.setCustomColors(_this.colorCustomizations);
                        hasColorChanges = true;
                    }
                    if (e.affectsConfiguration(workbenchThemeService_1.CUSTOM_EDITOR_COLORS_SETTING)) {
                        _this.currentColorTheme.setCustomTokenColors(_this.tokenColorCustomizations);
                        hasColorChanges = true;
                    }
                    if (hasColorChanges) {
                        _this.updateDynamicCSSRules(_this.currentColorTheme);
                        _this.onColorThemeChange.fire(_this.currentColorTheme);
                    }
                }
            });
        };
        WorkbenchThemeService.prototype.getColorTheme = function () {
            return this.currentColorTheme;
        };
        WorkbenchThemeService.prototype.getColorThemes = function () {
            return this.colorThemeStore.getColorThemes();
        };
        WorkbenchThemeService.prototype.getTheme = function () {
            return this.getColorTheme();
        };
        WorkbenchThemeService.prototype.setColorTheme = function (themeId, settingsTarget) {
            var _this = this;
            if (!themeId) {
                return winjs_base_1.TPromise.as(null);
            }
            if (themeId === this.currentColorTheme.id && this.currentColorTheme.isLoaded) {
                return this.writeColorThemeConfiguration(settingsTarget);
            }
            themeId = validateThemeId(themeId); // migrate theme ids
            return this.colorThemeStore.findThemeData(themeId, DEFAULT_THEME_ID).then(function (themeData) {
                if (themeData) {
                    return themeData.ensureLoaded(_this).then(function (_) {
                        if (themeId === _this.currentColorTheme.id && !_this.currentColorTheme.isLoaded && _this.currentColorTheme.hasEqualData(themeData)) {
                            // the loaded theme is identical to the perisisted theme. Don't need to send an event.
                            _this.currentColorTheme = themeData;
                            themeData.setCustomColors(_this.colorCustomizations);
                            themeData.setCustomTokenColors(_this.tokenColorCustomizations);
                            return winjs_base_1.TPromise.as(themeData);
                        }
                        themeData.setCustomColors(_this.colorCustomizations);
                        themeData.setCustomTokenColors(_this.tokenColorCustomizations);
                        _this.updateDynamicCSSRules(themeData);
                        return _this.applyTheme(themeData, settingsTarget);
                    }, function (error) {
                        return winjs_base_1.TPromise.wrapError(new Error(nls.localize('error.cannotloadtheme', "Unable to load {0}: {1}", themeData.path, error.message)));
                    });
                }
                return null;
            });
        };
        WorkbenchThemeService.prototype.updateDynamicCSSRules = function (themeData) {
            var cssRules = [];
            var hasRule = {};
            var ruleCollector = {
                addRule: function (rule) {
                    if (!hasRule[rule]) {
                        cssRules.push(rule);
                        hasRule[rule] = true;
                    }
                }
            };
            themingRegistry.getThemingParticipants().forEach(function (p) { return p(themeData, ruleCollector); });
            _applyRules(cssRules.join('\n'), colorThemeRulesClassName);
        };
        WorkbenchThemeService.prototype.applyTheme = function (newTheme, settingsTarget, silent) {
            var _this = this;
            if (silent === void 0) { silent = false; }
            if (this.container) {
                if (this.currentColorTheme) {
                    builder_1.$(this.container).removeClass(this.currentColorTheme.id);
                }
                else {
                    builder_1.$(this.container).removeClass(workbenchThemeService_1.VS_DARK_THEME, workbenchThemeService_1.VS_LIGHT_THEME, workbenchThemeService_1.VS_HC_THEME);
                }
                builder_1.$(this.container).addClass(newTheme.id);
            }
            this.currentColorTheme = newTheme;
            if (!this.themingParticipantChangeListener) {
                this.themingParticipantChangeListener = themingRegistry.onThemingParticipantAdded(function (p) { return _this.updateDynamicCSSRules(_this.currentColorTheme); });
            }
            this.sendTelemetry(newTheme.id, newTheme.extensionData, 'color');
            if (silent) {
                return winjs_base_1.TPromise.as(null);
            }
            this.onColorThemeChange.fire(this.currentColorTheme);
            if (settingsTarget !== configuration_1.ConfigurationTarget.WORKSPACE) {
                var background = color_1.Color.Format.CSS.formatHex(newTheme.getColor(colorRegistry_1.editorBackground)); // only take RGB, its what is used in the initial CSS
                var data = { id: newTheme.id, background: background };
                this.broadcastService.broadcast({ channel: 'vscode:changeColorTheme', payload: JSON.stringify(data) });
            }
            // remember theme data for a quick restore
            this.storageService.store(PERSISTED_THEME_STORAGE_KEY, newTheme.toStorageData());
            return this.writeColorThemeConfiguration(settingsTarget);
        };
        WorkbenchThemeService.prototype.writeColorThemeConfiguration = function (settingsTarget) {
            var _this = this;
            if (!types.isUndefinedOrNull(settingsTarget)) {
                return this.configurationWriter.writeConfiguration(workbenchThemeService_1.COLOR_THEME_SETTING, this.currentColorTheme.settingsId, settingsTarget).then(function (_) { return _this.currentColorTheme; });
            }
            return winjs_base_1.TPromise.as(this.currentColorTheme);
        };
        WorkbenchThemeService.prototype.sendTelemetry = function (themeId, themeData, themeType) {
            if (themeData) {
                var key = themeType + themeData.extensionId;
                if (!this.themeExtensionsActivated.get(key)) {
                    /* __GDPR__
                        "activatePlugin" : {
                            "id" : { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                            "name": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                            "isBuiltin": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "publisherDisplayName": { "classification": "PublicPersonalData", "purpose": "FeatureInsight" },
                            "themeId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                        }
                    */
                    this.telemetryService.publicLog('activatePlugin', {
                        id: themeData.extensionId,
                        name: themeData.extensionName,
                        isBuiltin: themeData.extensionIsBuiltin,
                        publisherDisplayName: themeData.extensionPublisher,
                        themeId: themeId
                    });
                    this.themeExtensionsActivated.set(key, true);
                }
            }
        };
        WorkbenchThemeService.prototype.getFileIconThemes = function () {
            return this.iconThemeStore.getFileIconThemes();
        };
        WorkbenchThemeService.prototype.getFileIconTheme = function () {
            return this.currentIconTheme;
        };
        WorkbenchThemeService.prototype.setFileIconTheme = function (iconTheme, settingsTarget) {
            var _this = this;
            iconTheme = iconTheme || '';
            if (iconTheme === this.currentIconTheme.id && this.currentIconTheme.isLoaded) {
                return this.writeFileIconConfiguration(settingsTarget);
            }
            var onApply = function (newIconTheme) {
                _this.doSetFileIconTheme(newIconTheme);
                // remember theme data for a quick restore
                _this.storageService.store(PERSISTED_ICON_THEME_STORAGE_KEY, newIconTheme.toStorageData());
                return _this.writeFileIconConfiguration(settingsTarget);
            };
            return this.iconThemeStore.findThemeData(iconTheme).then(function (iconThemeData) {
                if (!iconThemeData) {
                    iconThemeData = fileIconThemeData_1.FileIconThemeData.noIconTheme();
                }
                return iconThemeData.ensureLoaded(_this).then(function (_) {
                    return _applyIconTheme(iconThemeData, onApply);
                });
            });
        };
        WorkbenchThemeService.prototype.doSetFileIconTheme = function (iconThemeData) {
            this.currentIconTheme = iconThemeData;
            if (this.container) {
                if (iconThemeData.id) {
                    builder_1.$(this.container).addClass(fileIconsEnabledClass);
                }
                else {
                    builder_1.$(this.container).removeClass(fileIconsEnabledClass);
                }
            }
            if (iconThemeData.id) {
                this.sendTelemetry(iconThemeData.id, iconThemeData.extensionData, 'fileIcon');
            }
            this.onFileIconThemeChange.fire(this.currentIconTheme);
        };
        WorkbenchThemeService.prototype.writeFileIconConfiguration = function (settingsTarget) {
            var _this = this;
            if (!types.isUndefinedOrNull(settingsTarget)) {
                return this.configurationWriter.writeConfiguration(workbenchThemeService_1.ICON_THEME_SETTING, this.currentIconTheme.settingsId, settingsTarget).then(function (_) { return _this.currentIconTheme; });
            }
            return winjs_base_1.TPromise.wrap(this.currentIconTheme);
        };
        Object.defineProperty(WorkbenchThemeService.prototype, "configurationWriter", {
            get: function () {
                // separate out the ConfigurationWriter to avoid a dependency of the IConfigurationEditingService
                if (!this._configurationWriter) {
                    this._configurationWriter = this.instantiationService.createInstance(ConfigurationWriter);
                }
                return this._configurationWriter;
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchThemeService = __decorate([
            __param(1, extensions_1.IExtensionService),
            __param(2, storage_1.IStorageService),
            __param(3, broadcastService_1.IBroadcastService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, telemetry_1.ITelemetryService),
            __param(6, instantiation_1.IInstantiationService)
        ], WorkbenchThemeService);
        return WorkbenchThemeService;
    }());
    exports.WorkbenchThemeService = WorkbenchThemeService;
    function _applyIconTheme(data, onApply) {
        _applyRules(data.styleSheetContent, iconThemeRulesClassName);
        return onApply(data);
    }
    function _applyRules(styleSheetContent, rulesClassName) {
        var themeStyles = document.head.getElementsByClassName(rulesClassName);
        if (themeStyles.length === 0) {
            var elStyle = document.createElement('style');
            elStyle.type = 'text/css';
            elStyle.className = rulesClassName;
            elStyle.innerHTML = styleSheetContent;
            document.head.appendChild(elStyle);
        }
        else {
            themeStyles[0].innerHTML = styleSheetContent;
        }
    }
    colorThemeSchema.register();
    fileIconThemeSchema.register();
    var ConfigurationWriter = /** @class */ (function () {
        function ConfigurationWriter(configurationService) {
            this.configurationService = configurationService;
        }
        ConfigurationWriter.prototype.writeConfiguration = function (key, value, settingsTarget) {
            var settings = this.configurationService.inspect(key);
            if (settingsTarget === configuration_1.ConfigurationTarget.USER) {
                if (value === settings.user) {
                    return winjs_base_1.TPromise.as(null); // nothing to do
                }
                else if (value === settings.default) {
                    if (types.isUndefined(settings.user)) {
                        return winjs_base_1.TPromise.as(null); // nothing to do
                    }
                    value = void 0; // remove configuration from user settings
                }
            }
            else if (settingsTarget === configuration_1.ConfigurationTarget.WORKSPACE) {
                if (value === settings.value) {
                    return winjs_base_1.TPromise.as(null); // nothing to do
                }
            }
            return this.configurationService.updateValue(key, value, settingsTarget);
        };
        ConfigurationWriter = __decorate([
            __param(0, configuration_1.IConfigurationService)
        ], ConfigurationWriter);
        return ConfigurationWriter;
    }());
    // Configuration: Themes
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    var colorThemeSettingSchema = {
        type: 'string',
        description: nls.localize('colorTheme', "Specifies the color theme used in the workbench."),
        default: DEFAULT_THEME_SETTING_VALUE,
        enum: [],
        enumDescriptions: [],
        errorMessage: nls.localize('colorThemeError', "Theme is unknown or not installed."),
    };
    var iconThemeSettingSchema = {
        type: ['string', 'null'],
        default: DEFAULT_ICON_THEME_SETTING_VALUE,
        description: nls.localize('iconTheme', "Specifies the icon theme used in the workbench or 'null' to not show any file icons."),
        enum: [null],
        enumDescriptions: [nls.localize('noIconThemeDesc', 'No file icons')],
        errorMessage: nls.localize('iconThemeError', "File icon theme is unknown or not installed.")
    };
    var colorCustomizationsSchema = {
        type: 'object',
        description: nls.localize('workbenchColors', "Overrides colors from the currently selected color theme."),
        properties: {},
        additionalProperties: false,
        default: {},
        defaultSnippets: [{
                body: {
                    'statusBar.background': '#666666',
                    'panel.background': '#555555',
                    'sideBar.background': '#444444'
                }
            }]
    };
    var themeSettingsConfiguration = {
        id: 'workbench',
        order: 7.1,
        type: 'object',
        properties: (_a = {},
            _a[workbenchThemeService_1.COLOR_THEME_SETTING] = colorThemeSettingSchema,
            _a[workbenchThemeService_1.ICON_THEME_SETTING] = iconThemeSettingSchema,
            _a[workbenchThemeService_1.CUSTOM_WORKBENCH_COLORS_SETTING] = colorCustomizationsSchema,
            _a)
    };
    configurationRegistry.registerConfiguration(themeSettingsConfiguration);
    function tokenGroupSettings(description) {
        return {
            description: description,
            default: '#FF0000',
            anyOf: [
                {
                    type: 'string',
                    format: 'color-hex'
                },
                colorThemeSchema.tokenColorizationSettingSchema
            ]
        };
    }
    var customEditorColorConfigurationProperties = (_b = {
            comments: tokenGroupSettings(nls.localize('editorColors.comments', "Sets the colors and styles for comments")),
            strings: tokenGroupSettings(nls.localize('editorColors.strings', "Sets the colors and styles for strings literals.")),
            keywords: tokenGroupSettings(nls.localize('editorColors.keywords', "Sets the colors and styles for keywords.")),
            numbers: tokenGroupSettings(nls.localize('editorColors.numbers', "Sets the colors and styles for number literals.")),
            types: tokenGroupSettings(nls.localize('editorColors.types', "Sets the colors and styles for type declarations and references.")),
            functions: tokenGroupSettings(nls.localize('editorColors.functions', "Sets the colors and styles for functions declarations and references.")),
            variables: tokenGroupSettings(nls.localize('editorColors.variables', "Sets the colors and styles for variables declarations and references."))
        },
        _b[workbenchThemeService_1.CUSTOM_EDITOR_SCOPE_COLORS_SETTING] = colorThemeSchema.tokenColorsSchema(nls.localize('editorColors.textMateRules', 'Sets colors and styles using textmate theming rules (advanced).')),
        _b);
    var customEditorColorSchema = {
        description: nls.localize('editorColors', "Overrides editor colors and font style from the currently selected color theme."),
        default: {},
        additionalProperties: false,
        properties: {}
    };
    var customEditorColorConfiguration = {
        id: 'editor',
        order: 7.2,
        type: 'object',
        properties: (_c = {},
            _c[workbenchThemeService_1.CUSTOM_EDITOR_COLORS_SETTING] = customEditorColorSchema,
            _c)
    };
    configurationRegistry.registerConfiguration(customEditorColorConfiguration);
    var _a, _b, _c;
});
