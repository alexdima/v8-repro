define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/base/common/paths", "vs/workbench/parts/execution/common/execution", "vs/platform/actions/common/actions", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/parts/terminal/common/terminal", "vs/workbench/parts/execution/electron-browser/terminal", "vs/workbench/parts/execution/electron-browser/terminalService", "vs/workbench/services/history/common/history", "vs/workbench/common/resources", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/files/common/files", "vs/platform/list/browser/listService", "vs/workbench/parts/files/browser/files", "vs/platform/commands/common/commands", "vs/base/common/network"], function (require, exports, nls, env, platform_1, configuration_1, extensions_1, paths, execution_1, actions_1, editorService_1, configurationRegistry_1, terminal_1, terminal_2, terminalService_1, history_1, resources_1, keybindingsRegistry_1, files_1, listService_1, files_2, commands_1, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    if (env.isWindows) {
        extensions_1.registerSingleton(execution_1.ITerminalService, terminalService_1.WinTerminalService);
    }
    else if (env.isMacintosh) {
        extensions_1.registerSingleton(execution_1.ITerminalService, terminalService_1.MacTerminalService);
    }
    else if (env.isLinux) {
        extensions_1.registerSingleton(execution_1.ITerminalService, terminalService_1.LinuxTerminalService);
    }
    var _initialize = function () {
        terminal_2.getDefaultTerminalLinuxReady().then(function (defaultTerminalLinux) {
            var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                'id': 'externalTerminal',
                'order': 100,
                'title': nls.localize('terminalConfigurationTitle', "External Terminal"),
                'type': 'object',
                'properties': {
                    'terminal.explorerKind': {
                        'type': 'string',
                        'enum': [
                            'integrated',
                            'external'
                        ],
                        'description': nls.localize('explorer.openInTerminalKind', "Customizes what kind of terminal to launch."),
                        'default': 'integrated',
                        'isExecutable': false
                    },
                    'terminal.external.windowsExec': {
                        'type': 'string',
                        'description': nls.localize('terminal.external.windowsExec', "Customizes which terminal to run on Windows."),
                        'default': terminal_2.getDefaultTerminalWindows(),
                        'isExecutable': true
                    },
                    'terminal.external.osxExec': {
                        'type': 'string',
                        'description': nls.localize('terminal.external.osxExec', "Customizes which terminal application to run on OS X."),
                        'default': terminal_2.DEFAULT_TERMINAL_OSX,
                        'isExecutable': true
                    },
                    'terminal.external.linuxExec': {
                        'type': 'string',
                        'description': nls.localize('terminal.external.linuxExec', "Customizes which terminal to run on Linux."),
                        'default': defaultTerminalLinux,
                        'isExecutable': true
                    }
                }
            });
        });
    };
    if (typeof MonacoSnapshotInitializeCallbacks !== 'undefined') {
        MonacoSnapshotInitializeCallbacks.push(_initialize);
    }
    else {
        _initialize();
    }
    var OPEN_IN_TERMINAL_COMMAND_ID = 'openInTerminal';
    commands_1.CommandsRegistry.registerCommand({
        id: OPEN_IN_TERMINAL_COMMAND_ID,
        handler: function (accessor, resource) {
            var configurationService = accessor.get(configuration_1.IConfigurationService);
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var fileService = accessor.get(files_1.IFileService);
            var integratedTerminalService = accessor.get(terminal_1.ITerminalService);
            var terminalService = accessor.get(execution_1.ITerminalService);
            var directorySet = new Set();
            var resources = files_2.getMultiSelectedResources(resource, accessor.get(listService_1.IListService), editorService);
            return resources.map(function (r) {
                return fileService.resolveFile(r).then(function (stat) {
                    return stat.isDirectory ? stat.resource.fsPath : paths.dirname(stat.resource.fsPath);
                }).then(function (directoryToOpen) {
                    if (!directorySet.has(directoryToOpen)) {
                        directorySet.add(directoryToOpen);
                        if (configurationService.getValue().terminal.explorerKind === 'integrated') {
                            var instance = integratedTerminalService.createInstance({ cwd: directoryToOpen }, true);
                            if (instance && (resource === r || resources.length === 1)) {
                                integratedTerminalService.setActiveInstance(instance);
                                integratedTerminalService.showPanel(true);
                            }
                        }
                        else {
                            terminalService.openTerminal(directoryToOpen);
                        }
                    }
                });
            });
        }
    });
    var OPEN_NATIVE_CONSOLE_COMMAND_ID = 'workbench.action.terminal.openNativeConsole';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KEY_C */,
        when: terminal_1.KEYBINDING_CONTEXT_TERMINAL_NOT_FOCUSED,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        handler: function (accessor) {
            var historyService = accessor.get(history_1.IHistoryService);
            var terminalService = accessor.get(execution_1.ITerminalService);
            var root = historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
            if (root) {
                terminalService.openTerminal(root.fsPath);
            }
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
            title: env.isWindows ? nls.localize('globalConsoleActionWin', "Open New Command Prompt") :
                nls.localize('globalConsoleActionMacLinux', "Open New Terminal")
        }
    });
    var openConsoleCommand = {
        id: OPEN_IN_TERMINAL_COMMAND_ID,
        title: env.isWindows ? nls.localize('scopedConsoleActionWin', "Open in Command Prompt") :
            nls.localize('scopedConsoleActionMacLinux', "Open in Terminal")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: 'navigation',
        order: 30,
        command: openConsoleCommand,
        when: resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 30,
        command: openConsoleCommand,
        when: resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file)
    });
});
