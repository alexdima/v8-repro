var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/builder", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/platform/keybinding/common/keybinding", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/workspace/common/workspace", "vs/workbench/common/contributions", "vs/platform/lifecycle/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/workbench/electron-browser/actions", "vs/workbench/parts/files/electron-browser/fileActions", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/parts/quickopen/browser/commandsHandler", "vs/workbench/services/part/common/partService", "vs/workbench/parts/debug/browser/debugActions", "vs/workbench/parts/search/common/constants", "vs/workbench/parts/terminal/electron-browser/terminalActions", "vs/base/common/strings", "vs/workbench/browser/parts/quickopen/quickopen", "vs/css!./watermark"], function (require, exports, builder_1, lifecycle_1, objects_1, platform_1, keybinding_1, nls, platform_2, configurationRegistry_1, workspace_1, contributions_1, lifecycle_2, configuration_1, actions_1, fileActions_1, workspaceActions_1, commandsHandler_1, partService_1, debugActions_1, constants_1, terminalActions_1, strings_1, quickopen_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var showCommands = {
        text: nls.localize('watermark.showCommands', "Show All Commands"),
        ids: [commandsHandler_1.ShowAllCommandsAction.ID]
    };
    var quickOpen = {
        text: nls.localize('watermark.quickOpen', "Go to File"),
        ids: [quickopen_1.QUICKOPEN_ACTION_ID]
    };
    var openFileNonMacOnly = {
        text: nls.localize('watermark.openFile', "Open File"),
        ids: [workspaceActions_1.OpenFileAction.ID],
        mac: false
    };
    var openFolderNonMacOnly = {
        text: nls.localize('watermark.openFolder', "Open Folder"),
        ids: [workspaceActions_1.OpenFolderAction.ID],
        mac: false
    };
    var openFileOrFolderMacOnly = {
        text: nls.localize('watermark.openFileFolder', "Open File or Folder"),
        ids: [workspaceActions_1.OpenFileFolderAction.ID],
        mac: true
    };
    var openRecent = {
        text: nls.localize('watermark.openRecent', "Open Recent"),
        ids: [actions_1.OpenRecentAction.ID]
    };
    var newUntitledFile = {
        text: nls.localize('watermark.newUntitledFile', "New Untitled File"),
        ids: [fileActions_1.GlobalNewUntitledFileAction.ID]
    };
    var newUntitledFileMacOnly = objects_1.assign({ mac: true }, newUntitledFile);
    var toggleTerminal = {
        text: nls.localize({ key: 'watermark.toggleTerminal', comment: ['toggle is a verb here'] }, "Toggle Terminal"),
        ids: [terminalActions_1.ToggleTerminalAction.ID]
    };
    var findInFiles = {
        text: nls.localize('watermark.findInFiles', "Find in Files"),
        ids: [constants_1.FindInFilesActionId]
    };
    var startDebugging = {
        text: nls.localize('watermark.startDebugging', "Start Debugging"),
        ids: [debugActions_1.StartAction.ID]
    };
    var noFolderEntries = [
        showCommands,
        openFileNonMacOnly,
        openFolderNonMacOnly,
        openFileOrFolderMacOnly,
        openRecent,
        newUntitledFileMacOnly,
        toggleTerminal
    ];
    var folderEntries = [
        showCommands,
        quickOpen,
        findInFiles,
        startDebugging,
        toggleTerminal
    ];
    var UNBOUND = nls.localize('watermark.unboundCommand', "unbound");
    var WORKBENCH_TIPS_ENABLED_KEY = 'workbench.tips.enabled';
    var WatermarkContribution = /** @class */ (function () {
        function WatermarkContribution(lifecycleService, partService, keybindingService, contextService, configurationService) {
            var _this = this;
            this.partService = partService;
            this.keybindingService = keybindingService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.toDispose = [];
            this.workbenchState = contextService.getWorkbenchState();
            lifecycleService.onShutdown(this.dispose, this);
            this.enabled = this.configurationService.getValue(WORKBENCH_TIPS_ENABLED_KEY);
            if (this.enabled) {
                this.create();
            }
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(WORKBENCH_TIPS_ENABLED_KEY)) {
                    var enabled = _this.configurationService.getValue(WORKBENCH_TIPS_ENABLED_KEY);
                    if (enabled !== _this.enabled) {
                        _this.enabled = enabled;
                        if (_this.enabled) {
                            _this.create();
                        }
                        else {
                            _this.destroy();
                        }
                    }
                }
            }));
            this.toDispose.push(this.contextService.onDidChangeWorkbenchState(function (e) {
                var previousWorkbenchState = _this.workbenchState;
                _this.workbenchState = _this.contextService.getWorkbenchState();
                if (_this.enabled && _this.workbenchState !== previousWorkbenchState) {
                    _this.recreate();
                }
            }));
        }
        WatermarkContribution.prototype.create = function () {
            var _this = this;
            var container = this.partService.getContainer(partService_1.Parts.EDITOR_PART);
            container.classList.add('has-watermark');
            this.watermark = builder_1.$()
                .div({ 'class': 'watermark' });
            var box = builder_1.$(this.watermark)
                .div({ 'class': 'watermark-box' });
            var folder = this.workbenchState !== workspace_1.WorkbenchState.EMPTY;
            var selected = folder ? folderEntries : noFolderEntries
                .filter(function (entry) { return !('mac' in entry) || entry.mac === platform_1.isMacintosh; });
            var update = function () {
                var builder = builder_1.$(box);
                builder.clearChildren();
                selected.map(function (entry) {
                    builder.element('dl', {}, function (dl) {
                        dl.element('dt', {}, function (dt) { return dt.text(entry.text); });
                        dl.element('dd', {}, function (dd) { return dd.innerHtml(entry.ids
                            .map(function (id) {
                            var k = _this.keybindingService.lookupKeybinding(id);
                            if (k) {
                                return "<span class=\"shortcuts\">" + strings_1.escape(k.getLabel()) + "</span>";
                            }
                            return "<span class=\"unbound\">" + strings_1.escape(UNBOUND) + "</span>";
                        })
                            .join(' / ')); });
                    });
                });
            };
            update();
            this.watermark.build(container.firstElementChild, 0);
            this.toDispose.push(this.keybindingService.onDidUpdateKeybindings(update));
            this.toDispose.push(this.partService.onEditorLayout(function (_a) {
                var height = _a.height;
                container.classList[height <= 478 ? 'add' : 'remove']('max-height-478px');
            }));
        };
        WatermarkContribution.prototype.destroy = function () {
            if (this.watermark) {
                this.watermark.destroy();
                this.partService.getContainer(partService_1.Parts.EDITOR_PART).classList.remove('has-watermark');
                this.dispose();
            }
        };
        WatermarkContribution.prototype.recreate = function () {
            this.destroy();
            this.create();
        };
        WatermarkContribution.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        WatermarkContribution = __decorate([
            __param(0, lifecycle_2.ILifecycleService),
            __param(1, partService_1.IPartService),
            __param(2, keybinding_1.IKeybindingService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, configuration_1.IConfigurationService)
        ], WatermarkContribution);
        return WatermarkContribution;
    }());
    exports.WatermarkContribution = WatermarkContribution;
    platform_2.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WatermarkContribution, lifecycle_2.LifecyclePhase.Running);
    platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        'id': 'workbench',
        'order': 7,
        'title': nls.localize('workbenchConfigurationTitle', "Workbench"),
        'properties': {
            'workbench.tips.enabled': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('tips.enabled', "When enabled, will show the watermark tips when no editor is open.")
            },
        }
    });
});
