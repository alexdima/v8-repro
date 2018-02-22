/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/keyCodes", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionGalleryService", "vs/workbench/common/actions", "vs/workbench/parts/extensions/electron-browser/extensionTipsService", "vs/workbench/common/contributions", "vs/workbench/parts/output/common/output", "vs/platform/instantiation/common/descriptors", "../common/extensions", "vs/workbench/parts/extensions/node/extensionsWorkbenchService", "vs/workbench/parts/extensions/browser/extensionsActions", "vs/workbench/parts/extensions/electron-browser/extensionsActions", "vs/workbench/parts/extensions/common/extensionsInput", "vs/workbench/browser/viewlet", "vs/workbench/parts/extensions/browser/extensionEditor", "vs/workbench/parts/extensions/electron-browser/extensionsViewlet", "vs/workbench/browser/quickopen", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/parts/extensions/common/extensionsFileTemplate", "vs/platform/commands/common/commands", "vs/workbench/parts/extensions/electron-browser/extensionsUtils", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/parts/extensions/browser/extensionsQuickOpen", "vs/workbench/browser/editor", "vs/platform/lifecycle/common/lifecycle", "vs/workbench/parts/extensions/electron-browser/runtimeExtensionsEditor", "vs/workbench/common/editor", "vs/workbench/parts/extensions/electron-browser/extensionProfileService", "vs/css!./media/extensions"], function (require, exports, nls_1, errors, keyCodes_1, platform_1, actions_1, extensions_1, extensionManagement_1, extensionGalleryService_1, actions_2, extensionTipsService_1, contributions_1, output_1, descriptors_1, extensions_2, extensionsWorkbenchService_1, extensionsActions_1, extensionsActions_2, extensionsInput_1, viewlet_1, extensionEditor_1, extensionsViewlet_1, quickopen_1, configurationRegistry_1, jsonContributionRegistry, extensionsFileTemplate_1, commands_1, extensionsUtils_1, extensionManagementUtil_1, extensionsQuickOpen_1, editor_1, lifecycle_1, runtimeExtensionsEditor_1, editor_2, extensionProfileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Singletons
    extensions_1.registerSingleton(extensionManagement_1.IExtensionGalleryService, extensionGalleryService_1.ExtensionGalleryService);
    extensions_1.registerSingleton(extensionManagement_1.IExtensionTipsService, extensionTipsService_1.ExtensionTipsService);
    extensions_1.registerSingleton(extensions_2.IExtensionsWorkbenchService, extensionsWorkbenchService_1.ExtensionsWorkbenchService);
    extensions_1.registerSingleton(runtimeExtensionsEditor_1.IExtensionHostProfileService, extensionProfileService_1.ExtensionHostProfileService);
    var workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.StatusUpdater, lifecycle_1.LifecyclePhase.Running);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.MaliciousExtensionChecker, lifecycle_1.LifecyclePhase.Eventually);
    workbenchRegistry.registerWorkbenchContribution(extensionsActions_1.ConfigureRecommendedExtensionsCommandsContributor, lifecycle_1.LifecyclePhase.Eventually);
    workbenchRegistry.registerWorkbenchContribution(extensionsUtils_1.KeymapExtensions, lifecycle_1.LifecyclePhase.Running);
    workbenchRegistry.registerWorkbenchContribution(extensionsUtils_1.BetterMergeDisabled, lifecycle_1.LifecyclePhase.Running);
    platform_1.Registry.as(output_1.Extensions.OutputChannels)
        .registerChannel(extensionManagement_1.ExtensionsChannelId, extensionManagement_1.ExtensionsLabel);
    // Quickopen
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(extensionsQuickOpen_1.ExtensionsHandler, extensionsQuickOpen_1.ExtensionsHandler.ID, 'ext ', null, nls_1.localize('extensionsCommands', "Manage Extensions"), true));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(extensionsQuickOpen_1.GalleryExtensionsHandler, extensionsQuickOpen_1.GalleryExtensionsHandler.ID, 'ext install ', null, nls_1.localize('galleryExtensionsCommands', "Install Gallery Extensions"), true));
    // Editor
    var editorDescriptor = new editor_1.EditorDescriptor(extensionEditor_1.ExtensionEditor, extensionEditor_1.ExtensionEditor.ID, nls_1.localize('extension', "Extension"));
    platform_1.Registry.as(editor_1.Extensions.Editors)
        .registerEditor(editorDescriptor, [new descriptors_1.SyncDescriptor(extensionsInput_1.ExtensionsInput)]);
    // Running Extensions Editor
    var runtimeExtensionsEditorDescriptor = new editor_1.EditorDescriptor(runtimeExtensionsEditor_1.RuntimeExtensionsEditor, runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID, nls_1.localize('runtimeExtension', "Running Extensions"));
    platform_1.Registry.as(editor_1.Extensions.Editors)
        .registerEditor(runtimeExtensionsEditorDescriptor, [new descriptors_1.SyncDescriptor(runtimeExtensionsEditor_1.RuntimeExtensionsInput)]);
    var RuntimeExtensionsInputFactory = /** @class */ (function () {
        function RuntimeExtensionsInputFactory() {
        }
        RuntimeExtensionsInputFactory.prototype.serialize = function (editorInput) {
            return '';
        };
        RuntimeExtensionsInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            return new runtimeExtensionsEditor_1.RuntimeExtensionsInput();
        };
        return RuntimeExtensionsInputFactory;
    }());
    platform_1.Registry.as(editor_2.Extensions.EditorInputFactories).registerEditorInputFactory(runtimeExtensionsEditor_1.RuntimeExtensionsInput.ID, RuntimeExtensionsInputFactory);
    // Viewlet
    var viewletDescriptor = new viewlet_1.ViewletDescriptor(extensionsViewlet_1.ExtensionsViewlet, extensions_2.VIEWLET_ID, nls_1.localize('extensions', "Extensions"), 'extensions', 100);
    platform_1.Registry.as(viewlet_1.Extensions.Viewlets)
        .registerViewlet(viewletDescriptor);
    // Global actions
    var actionRegistry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    var openViewletActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.OpenExtensionsViewletAction, extensionsActions_1.OpenExtensionsViewletAction.ID, extensionsActions_1.OpenExtensionsViewletAction.LABEL, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 54 /* KEY_X */ });
    actionRegistry.registerWorkbenchAction(openViewletActionDescriptor, 'View: Show Extensions', nls_1.localize('view', "View"));
    var installActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.InstallExtensionsAction, extensionsActions_1.InstallExtensionsAction.ID, extensionsActions_1.InstallExtensionsAction.LABEL);
    actionRegistry.registerWorkbenchAction(installActionDescriptor, 'Extensions: Install Extensions', extensionManagement_1.ExtensionsLabel);
    var listOutdatedActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.ShowOutdatedExtensionsAction, extensionsActions_1.ShowOutdatedExtensionsAction.ID, extensionsActions_1.ShowOutdatedExtensionsAction.LABEL);
    actionRegistry.registerWorkbenchAction(listOutdatedActionDescriptor, 'Extensions: Show Outdated Extensions', extensionManagement_1.ExtensionsLabel);
    var recommendationsActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.ShowRecommendedExtensionsAction, extensionsActions_1.ShowRecommendedExtensionsAction.ID, extensionsActions_1.ShowRecommendedExtensionsAction.LABEL);
    actionRegistry.registerWorkbenchAction(recommendationsActionDescriptor, 'Extensions: Show Recommended Extensions', extensionManagement_1.ExtensionsLabel);
    var keymapRecommendationsActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.ShowRecommendedKeymapExtensionsAction, extensionsActions_1.ShowRecommendedKeymapExtensionsAction.ID, extensionsActions_1.ShowRecommendedKeymapExtensionsAction.SHORT_LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 43 /* KEY_M */) });
    actionRegistry.registerWorkbenchAction(keymapRecommendationsActionDescriptor, 'Preferences: Keymaps', extensionManagement_1.PreferencesLabel);
    var languageExtensionsActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.ShowLanguageExtensionsAction, extensionsActions_1.ShowLanguageExtensionsAction.ID, extensionsActions_1.ShowLanguageExtensionsAction.SHORT_LABEL);
    actionRegistry.registerWorkbenchAction(languageExtensionsActionDescriptor, 'Preferences: Language Extensions', extensionManagement_1.PreferencesLabel);
    var azureExtensionsActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.ShowAzureExtensionsAction, extensionsActions_1.ShowAzureExtensionsAction.ID, extensionsActions_1.ShowAzureExtensionsAction.SHORT_LABEL);
    actionRegistry.registerWorkbenchAction(azureExtensionsActionDescriptor, 'Preferences: Azure Extensions', extensionManagement_1.PreferencesLabel);
    var popularActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.ShowPopularExtensionsAction, extensionsActions_1.ShowPopularExtensionsAction.ID, extensionsActions_1.ShowPopularExtensionsAction.LABEL);
    actionRegistry.registerWorkbenchAction(popularActionDescriptor, 'Extensions: Show Popular Extensions', extensionManagement_1.ExtensionsLabel);
    var enabledActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.ShowEnabledExtensionsAction, extensionsActions_1.ShowEnabledExtensionsAction.ID, extensionsActions_1.ShowEnabledExtensionsAction.LABEL);
    actionRegistry.registerWorkbenchAction(enabledActionDescriptor, 'Extensions: Show Enabled Extensions', extensionManagement_1.ExtensionsLabel);
    var installedActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.ShowInstalledExtensionsAction, extensionsActions_1.ShowInstalledExtensionsAction.ID, extensionsActions_1.ShowInstalledExtensionsAction.LABEL);
    actionRegistry.registerWorkbenchAction(installedActionDescriptor, 'Extensions: Show Installed Extensions', extensionManagement_1.ExtensionsLabel);
    var disabledActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.ShowDisabledExtensionsAction, extensionsActions_1.ShowDisabledExtensionsAction.ID, extensionsActions_1.ShowDisabledExtensionsAction.LABEL);
    actionRegistry.registerWorkbenchAction(disabledActionDescriptor, 'Extensions: Show Disabled Extensions', extensionManagement_1.ExtensionsLabel);
    var updateAllActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_1.UpdateAllAction, extensionsActions_1.UpdateAllAction.ID, extensionsActions_1.UpdateAllAction.LABEL);
    actionRegistry.registerWorkbenchAction(updateAllActionDescriptor, 'Extensions: Update All Extensions', extensionManagement_1.ExtensionsLabel);
    var openExtensionsFolderActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_2.OpenExtensionsFolderAction, extensionsActions_2.OpenExtensionsFolderAction.ID, extensionsActions_2.OpenExtensionsFolderAction.LABEL);
    actionRegistry.registerWorkbenchAction(openExtensionsFolderActionDescriptor, 'Extensions: Open Extensions Folder', extensionManagement_1.ExtensionsLabel);
    var installVSIXActionDescriptor = new actions_1.SyncActionDescriptor(extensionsActions_2.InstallVSIXAction, extensionsActions_2.InstallVSIXAction.ID, extensionsActions_2.InstallVSIXAction.LABEL);
    actionRegistry.registerWorkbenchAction(installVSIXActionDescriptor, 'Extensions: Install from VSIX...', extensionManagement_1.ExtensionsLabel);
    var disableAllAction = new actions_1.SyncActionDescriptor(extensionsActions_1.DisableAllAction, extensionsActions_1.DisableAllAction.ID, extensionsActions_1.DisableAllAction.LABEL);
    actionRegistry.registerWorkbenchAction(disableAllAction, 'Extensions: Disable All Installed Extensions', extensionManagement_1.ExtensionsLabel);
    var disableAllWorkspaceAction = new actions_1.SyncActionDescriptor(extensionsActions_1.DisableAllWorkpsaceAction, extensionsActions_1.DisableAllWorkpsaceAction.ID, extensionsActions_1.DisableAllWorkpsaceAction.LABEL);
    actionRegistry.registerWorkbenchAction(disableAllWorkspaceAction, 'Extensions: Disable All Installed Extensions for this Workspace', extensionManagement_1.ExtensionsLabel);
    var enableAllAction = new actions_1.SyncActionDescriptor(extensionsActions_1.EnableAllAction, extensionsActions_1.EnableAllAction.ID, extensionsActions_1.EnableAllAction.LABEL);
    actionRegistry.registerWorkbenchAction(enableAllAction, 'Extensions: Enable All Installed Extensions', extensionManagement_1.ExtensionsLabel);
    var enableAllWorkspaceAction = new actions_1.SyncActionDescriptor(extensionsActions_1.EnableAllWorkpsaceAction, extensionsActions_1.EnableAllWorkpsaceAction.ID, extensionsActions_1.EnableAllWorkpsaceAction.LABEL);
    actionRegistry.registerWorkbenchAction(enableAllWorkspaceAction, 'Extensions: Enable All Installed Extensions for this Workspace', extensionManagement_1.ExtensionsLabel);
    var checkForUpdatesAction = new actions_1.SyncActionDescriptor(extensionsActions_1.CheckForUpdatesAction, extensionsActions_1.CheckForUpdatesAction.ID, extensionsActions_1.CheckForUpdatesAction.LABEL);
    actionRegistry.registerWorkbenchAction(checkForUpdatesAction, "Extensions: Check for Updates", extensionManagement_1.ExtensionsLabel);
    actionRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(extensionsActions_1.EnableAutoUpdateAction, extensionsActions_1.EnableAutoUpdateAction.ID, extensionsActions_1.EnableAutoUpdateAction.LABEL), "Extensions: Enable Auto Updating Extensions", extensionManagement_1.ExtensionsLabel);
    actionRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(extensionsActions_1.DisableAutoUpdateAction, extensionsActions_1.DisableAutoUpdateAction.ID, extensionsActions_1.DisableAutoUpdateAction.LABEL), "Extensions: Disable Auto Updating Extensions", extensionManagement_1.ExtensionsLabel);
    actionRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(runtimeExtensionsEditor_1.ShowRuntimeExtensionsAction, runtimeExtensionsEditor_1.ShowRuntimeExtensionsAction.ID, runtimeExtensionsEditor_1.ShowRuntimeExtensionsAction.LABEL), 'Show Running Extensions', nls_1.localize('developer', "Developer"));
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'extensions',
        order: 30,
        title: nls_1.localize('extensionsConfigurationTitle', "Extensions"),
        type: 'object',
        properties: {
            'extensions.autoUpdate': {
                type: 'boolean',
                description: nls_1.localize('extensionsAutoUpdate', "Automatically update extensions"),
                default: true
            },
            'extensions.ignoreRecommendations': {
                type: 'boolean',
                description: nls_1.localize('extensionsIgnoreRecommendations', "If set to true, the notifications for extension recommendations will stop showing up."),
                default: false
            },
            'extensions.showRecommendationsOnlyOnDemand': {
                type: 'boolean',
                description: nls_1.localize('extensionsShowRecommendationsOnlyOnDemand', "If set to true, recommendations will not be fetched or shown unless specifically requested by the user."),
                default: false
            }
        }
    });
    var jsonRegistry = platform_1.Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
    jsonRegistry.registerSchema(extensionsFileTemplate_1.ExtensionsConfigurationSchemaId, extensionsFileTemplate_1.ExtensionsConfigurationSchema);
    // Register Commands
    commands_1.CommandsRegistry.registerCommand('_extensions.manage', function (accessor, extensionId) {
        var extensionService = accessor.get(extensions_2.IExtensionsWorkbenchService);
        extensionId = extensionManagementUtil_1.adoptToGalleryExtensionId(extensionId);
        var extension = extensionService.local.filter(function (e) { return e.id === extensionId; });
        if (extension.length === 1) {
            extensionService.open(extension[0]).done(null, errors.onUnexpectedError);
        }
    });
});
