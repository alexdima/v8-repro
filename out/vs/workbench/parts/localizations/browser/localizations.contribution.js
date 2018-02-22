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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/base/common/lifecycle", "vs/workbench/parts/localizations/browser/localizationsActions", "vs/platform/extensions/common/extensionsRegistry", "vs/platform/localizations/common/localizations", "vs/platform/lifecycle/common/lifecycle", "vs/base/common/platform"], function (require, exports, nls_1, platform_1, contributions_1, jsonContributionRegistry_1, actions_1, actions_2, lifecycle_1, localizationsActions_1, extensionsRegistry_1, localizations_1, lifecycle_2, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register action to configure locale and related settings
    var registry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(localizationsActions_1.ConfigureLocaleAction, localizationsActions_1.ConfigureLocaleAction.ID, localizationsActions_1.ConfigureLocaleAction.LABEL), 'Configure Language');
    var LocalesSchemaUpdater = /** @class */ (function (_super) {
        __extends(LocalesSchemaUpdater, _super);
        function LocalesSchemaUpdater(localizationService) {
            var _this = _super.call(this) || this;
            _this.localizationService = localizationService;
            _this.update();
            _this._register(_this.localizationService.onDidLanguagesChange(function () { return _this.update(); }));
            return _this;
        }
        LocalesSchemaUpdater.prototype.update = function () {
            this.localizationService.getLanguageIds()
                .then(function (languageIds) { return registerLocaleDefinitionSchema(languageIds); });
        };
        LocalesSchemaUpdater = __decorate([
            __param(0, localizations_1.ILocalizationsService)
        ], LocalesSchemaUpdater);
        return LocalesSchemaUpdater;
    }(lifecycle_1.Disposable));
    exports.LocalesSchemaUpdater = LocalesSchemaUpdater;
    function registerLocaleDefinitionSchema(languages) {
        var localeDefinitionFileSchemaId = 'vscode://schemas/locale';
        var jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        // Keep en-US since we generated files with that content.
        jsonRegistry.registerSchema(localeDefinitionFileSchemaId, {
            id: localeDefinitionFileSchemaId,
            allowComments: true,
            description: 'Locale Definition file',
            type: 'object',
            default: {
                'locale': 'en'
            },
            required: ['locale'],
            properties: {
                locale: {
                    type: 'string',
                    enum: languages,
                    description: nls_1.localize('JsonSchema.locale', 'The UI Language to use.')
                }
            }
        });
    }
    registerLocaleDefinitionSchema([platform_2.language]);
    var workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(LocalesSchemaUpdater, lifecycle_2.LifecyclePhase.Eventually);
    extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('localizations', [], {
        description: nls_1.localize('vscode.extension.contributes.localizations', "Contributes localizations to the editor"),
        type: 'array',
        default: [],
        items: {
            type: 'object',
            required: ['languageId', 'translations'],
            defaultSnippets: [{ body: { languageId: '', languageName: '', languageNameLocalized: '', translations: [{ id: 'vscode', path: '' }] } }],
            properties: {
                languageId: {
                    description: nls_1.localize('vscode.extension.contributes.localizations.languageId', 'Id of the language into which the display strings are translated.'),
                    type: 'string'
                },
                languageName: {
                    description: nls_1.localize('vscode.extension.contributes.localizations.languageName', 'Name of the language in English.'),
                    type: 'string'
                },
                languageNameLocalized: {
                    description: nls_1.localize('vscode.extension.contributes.localizations.languageNameLocalized', 'Name of the language in contributed language.'),
                    type: 'string'
                },
                translations: {
                    description: nls_1.localize('vscode.extension.contributes.localizations.translations', 'List of translations associated to the language.'),
                    type: 'array',
                    default: [{ id: 'vscode', path: '' }],
                    items: {
                        type: 'object',
                        required: ['id', 'path'],
                        properties: {
                            id: {
                                type: 'string',
                                description: nls_1.localize('vscode.extension.contributes.localizations.translations.id', "Id of VS Code or Extension for which this translation is contributed to. Id of VS Code is always `vscode` and of extension should be in format `publisherId.extensionName`."),
                                pattern: '^((vscode)|([a-z0-9A-Z][a-z0-9\-A-Z]*)\\.([a-z0-9A-Z][a-z0-9\-A-Z]*))$',
                                patternErrorMessage: nls_1.localize('vscode.extension.contributes.localizations.translations.id.pattern', "Id should be `vscode` or in format `publisherId.extensionName` for translating VS code or an extension respectively.")
                            },
                            path: {
                                type: 'string',
                                description: nls_1.localize('vscode.extension.contributes.localizations.translations.path', "A relative path to a file containing translations for the language.")
                            }
                        },
                        defaultSnippets: [{ body: { id: '', path: '' } }],
                    },
                }
            }
        }
    });
});
