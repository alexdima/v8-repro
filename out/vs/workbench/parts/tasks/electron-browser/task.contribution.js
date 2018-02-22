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
define(["require", "exports", "vs/nls", "vs/workbench/parts/tasks/browser/taskQuickOpen", "vs/base/common/winjs.base", "vs/base/common/severity", "vs/base/common/objects", "vs/base/common/uri", "vs/base/common/actions", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/builder", "vs/base/common/types", "vs/base/common/processes", "vs/base/common/strings", "vs/base/common/parsers", "vs/base/common/uuid", "vs/base/common/map", "vs/base/browser/ui/octiconLabel/octiconLabel", "vs/platform/registry/common/platform", "vs/platform/lifecycle/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/platform/message/common/message", "vs/platform/markers/common/markers", "vs/platform/telemetry/common/telemetry", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/extensions/common/extensions", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/markers/common/problemMatcher", "vs/platform/storage/common/storage", "vs/platform/progress/common/progress", "vs/platform/opener/common/opener", "vs/platform/windows/common/windows", "vs/editor/common/services/modelService", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/browser/parts/statusbar/statusbar", "vs/workbench/browser/quickopen", "vs/platform/quickOpen/common/quickOpen", "vs/workbench/services/panel/common/panelService", "vs/workbench/parts/markers/common/constants", "vs/workbench/services/part/common/partService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/platform/workspace/common/workspace", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/parts/output/common/output", "vs/workbench/browser/actions", "vs/workbench/parts/terminal/common/terminal", "vs/workbench/parts/tasks/common/taskSystem", "vs/workbench/parts/tasks/common/tasks", "vs/workbench/parts/tasks/common/taskService", "vs/workbench/parts/tasks/common/taskTemplates", "../node/taskConfiguration", "vs/workbench/parts/tasks/node/processTaskSystem", "./terminalTaskSystem", "vs/workbench/parts/tasks/node/processRunnerDetector", "../browser/quickOpen", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/workbench/electron-browser/actions", "./jsonSchema_v1", "./jsonSchema_v2", "vs/css!./media/task.contribution"], function (require, exports, nls, taskQuickOpen_1, winjs_base_1, severity_1, Objects, uri_1, actions_1, Dom, lifecycle_1, event_1, Builder, Types, processes_1, strings, parsers_1, UUID, map_1, octiconLabel_1, platform_1, lifecycle_2, actions_2, extensions_1, message_1, markers_1, telemetry_1, configuration_1, files_1, extensions_2, commands_1, keybindingsRegistry_1, problemMatcher_1, storage_1, progress_1, opener_1, windows_1, modelService_1, jsonContributionRegistry, statusbar_1, quickopen_1, quickOpen_1, panelService_1, constants_1, partService_1, editorService_1, configurationResolver_1, workspace_1, textfiles_1, output_1, actions_3, terminal_1, taskSystem_1, tasks_1, taskService_1, taskTemplates_1, TaskConfig, processTaskSystem_1, terminalTaskSystem_1, processRunnerDetector_1, quickOpen_2, theme_1, themeService_1, actions_4, jsonSchema_v1_1, jsonSchema_v2_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = Builder.$;
    var tasksCategory = nls.localize('tasksCategory', "Tasks");
    var ConfigureTaskAction;
    (function (ConfigureTaskAction) {
        ConfigureTaskAction.ID = 'workbench.action.tasks.configureTaskRunner';
        ConfigureTaskAction.TEXT = nls.localize('ConfigureTaskRunnerAction.label', "Configure Task");
    })(ConfigureTaskAction || (ConfigureTaskAction = {}));
    var CloseMessageAction = /** @class */ (function (_super) {
        __extends(CloseMessageAction, _super);
        function CloseMessageAction() {
            return _super.call(this, CloseMessageAction.ID, CloseMessageAction.TEXT) || this;
        }
        CloseMessageAction.prototype.run = function () {
            if (this.closeFunction) {
                this.closeFunction();
            }
            return winjs_base_1.TPromise.as(undefined);
        };
        CloseMessageAction.ID = 'workbench.action.build.closeMessage';
        CloseMessageAction.TEXT = nls.localize('CloseMessageAction.label', 'Close');
        return CloseMessageAction;
    }(actions_1.Action));
    var BuildStatusBarItem = /** @class */ (function (_super) {
        __extends(BuildStatusBarItem, _super);
        function BuildStatusBarItem(panelService, markerService, taskService, partService, themeService, contextService) {
            var _this = _super.call(this, themeService) || this;
            _this.panelService = panelService;
            _this.markerService = markerService;
            _this.taskService = taskService;
            _this.partService = partService;
            _this.contextService = contextService;
            _this.activeCount = 0;
            _this.icons = [];
            _this.registerListeners();
            return _this;
        }
        BuildStatusBarItem.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.contextService.onDidChangeWorkbenchState(function () { return _this.updateStyles(); }));
        };
        BuildStatusBarItem.prototype.updateStyles = function () {
            var _this = this;
            _super.prototype.updateStyles.call(this);
            this.icons.forEach(function (icon) {
                icon.style.backgroundColor = _this.getColor(_this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY ? theme_1.STATUS_BAR_FOREGROUND : theme_1.STATUS_BAR_NO_FOLDER_FOREGROUND);
            });
        };
        BuildStatusBarItem.prototype.render = function (container) {
            var _this = this;
            var callOnDispose = [];
            var element = document.createElement('div');
            var label = document.createElement('a');
            var errorIcon = document.createElement('div');
            var warningIcon = document.createElement('div');
            var infoIcon = document.createElement('div');
            var error = document.createElement('div');
            var warning = document.createElement('div');
            var info = document.createElement('div');
            var building = document.createElement('div');
            Dom.addClass(element, 'task-statusbar-item');
            Dom.addClass(label, 'task-statusbar-item-label');
            element.appendChild(label);
            element.title = nls.localize('problems', "Problems");
            Dom.addClass(errorIcon, 'task-statusbar-item-label-error');
            Dom.addClass(errorIcon, 'mask-icon');
            label.appendChild(errorIcon);
            this.icons.push(errorIcon);
            Dom.addClass(error, 'task-statusbar-item-label-counter');
            error.innerHTML = '0';
            label.appendChild(error);
            Dom.addClass(warningIcon, 'task-statusbar-item-label-warning');
            Dom.addClass(warningIcon, 'mask-icon');
            label.appendChild(warningIcon);
            this.icons.push(warningIcon);
            Dom.addClass(warning, 'task-statusbar-item-label-counter');
            warning.innerHTML = '0';
            label.appendChild(warning);
            Dom.addClass(infoIcon, 'task-statusbar-item-label-info');
            Dom.addClass(infoIcon, 'mask-icon');
            label.appendChild(infoIcon);
            this.icons.push(infoIcon);
            $(infoIcon).hide();
            Dom.addClass(info, 'task-statusbar-item-label-counter');
            label.appendChild(info);
            $(info).hide();
            Dom.addClass(building, 'task-statusbar-item-building');
            element.appendChild(building);
            building.innerHTML = nls.localize('building', 'Building...');
            $(building).hide();
            callOnDispose.push(Dom.addDisposableListener(label, 'click', function (e) {
                var panel = _this.panelService.getActivePanel();
                if (panel && panel.getId() === constants_1.default.MARKERS_PANEL_ID) {
                    _this.partService.setPanelHidden(true);
                }
                else {
                    _this.panelService.openPanel(constants_1.default.MARKERS_PANEL_ID, true);
                }
            }));
            var updateStatus = function (element, icon, stats) {
                if (stats > 0) {
                    element.innerHTML = stats.toString();
                    $(element).show();
                    $(icon).show();
                    return true;
                }
                else {
                    $(element).hide();
                    $(icon).hide();
                    return false;
                }
            };
            var manyMarkers = nls.localize('manyMarkers', "99+");
            var updateLabel = function (stats) {
                error.innerHTML = stats.errors < 100 ? stats.errors.toString() : manyMarkers;
                warning.innerHTML = stats.warnings < 100 ? stats.warnings.toString() : manyMarkers;
                updateStatus(info, infoIcon, stats.infos);
            };
            this.markerService.onMarkerChanged(function (changedResources) {
                updateLabel(_this.markerService.getStatistics());
            });
            callOnDispose.push(this.taskService.onDidStateChange(function (event) {
                if (_this.ignoreEvent(event)) {
                    return;
                }
                switch (event.kind) {
                    case tasks_1.TaskEventKind.Active:
                        _this.activeCount++;
                        if (_this.activeCount === 1) {
                            $(building).show();
                        }
                        break;
                    case tasks_1.TaskEventKind.Inactive:
                        // Since the exiting of the sub process is communicated async we can't order inactive and terminate events.
                        // So try to treat them accordingly.
                        if (_this.activeCount > 0) {
                            _this.activeCount--;
                            if (_this.activeCount === 0) {
                                $(building).hide();
                            }
                        }
                        break;
                    case tasks_1.TaskEventKind.Terminated:
                        if (_this.activeCount !== 0) {
                            $(building).hide();
                            _this.activeCount = 0;
                        }
                        break;
                }
            }));
            container.appendChild(element);
            this.updateStyles();
            return {
                dispose: function () {
                    callOnDispose = lifecycle_1.dispose(callOnDispose);
                }
            };
        };
        BuildStatusBarItem.prototype.ignoreEvent = function (event) {
            if (!this.taskService.inTerminal()) {
                return false;
            }
            if (event.group !== tasks_1.TaskGroup.Build) {
                return true;
            }
            if (!event.__task) {
                return false;
            }
            return event.__task.problemMatchers === void 0 || event.__task.problemMatchers.length === 0;
        };
        BuildStatusBarItem = __decorate([
            __param(0, panelService_1.IPanelService),
            __param(1, markers_1.IMarkerService),
            __param(2, taskService_1.ITaskService),
            __param(3, partService_1.IPartService),
            __param(4, themeService_1.IThemeService),
            __param(5, workspace_1.IWorkspaceContextService)
        ], BuildStatusBarItem);
        return BuildStatusBarItem;
    }(theme_1.Themable));
    var TaskStatusBarItem = /** @class */ (function (_super) {
        __extends(TaskStatusBarItem, _super);
        function TaskStatusBarItem(taskService, themeService) {
            var _this = _super.call(this, themeService) || this;
            _this.taskService = taskService;
            return _this;
        }
        TaskStatusBarItem.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
        };
        TaskStatusBarItem.prototype.render = function (container) {
            var _this = this;
            var callOnDispose = [];
            var element = document.createElement('a');
            Dom.addClass(element, 'task-statusbar-runningItem');
            var labelElement = document.createElement('div');
            Dom.addClass(labelElement, 'task-statusbar-runningItem-label');
            element.appendChild(labelElement);
            var label = new octiconLabel_1.OcticonLabel(labelElement);
            label.title = nls.localize('runningTasks', "Show Running Tasks");
            $(element).hide();
            callOnDispose.push(Dom.addDisposableListener(labelElement, 'click', function (e) {
                _this.taskService.runShowTasks();
            }));
            var updateStatus = function () {
                _this.taskService.getActiveTasks().then(function (tasks) {
                    if (tasks.length === 0) {
                        $(element).hide();
                    }
                    else {
                        label.text = "$(tools) " + tasks.length;
                        $(element).show();
                    }
                });
            };
            callOnDispose.push(this.taskService.onDidStateChange(function (event) {
                if (event.kind === tasks_1.TaskEventKind.Changed) {
                    updateStatus();
                }
            }));
            container.appendChild(element);
            this.updateStyles();
            updateStatus();
            return {
                dispose: function () {
                    callOnDispose = lifecycle_1.dispose(callOnDispose);
                }
            };
        };
        TaskStatusBarItem = __decorate([
            __param(0, taskService_1.ITaskService),
            __param(1, themeService_1.IThemeService)
        ], TaskStatusBarItem);
        return TaskStatusBarItem;
    }(theme_1.Themable));
    var ProblemReporter = /** @class */ (function () {
        function ProblemReporter(_outputChannel) {
            this._outputChannel = _outputChannel;
            this._validationStatus = new parsers_1.ValidationStatus();
        }
        ProblemReporter.prototype.info = function (message) {
            this._validationStatus.state = parsers_1.ValidationState.Info;
            this._outputChannel.append(message + '\n');
        };
        ProblemReporter.prototype.warn = function (message) {
            this._validationStatus.state = parsers_1.ValidationState.Warning;
            this._outputChannel.append(message + '\n');
        };
        ProblemReporter.prototype.error = function (message) {
            this._validationStatus.state = parsers_1.ValidationState.Error;
            this._outputChannel.append(message + '\n');
        };
        ProblemReporter.prototype.fatal = function (message) {
            this._validationStatus.state = parsers_1.ValidationState.Fatal;
            this._outputChannel.append(message + '\n');
        };
        Object.defineProperty(ProblemReporter.prototype, "status", {
            get: function () {
                return this._validationStatus;
            },
            enumerable: true,
            configurable: true
        });
        return ProblemReporter;
    }());
    var TaskMap = /** @class */ (function () {
        function TaskMap() {
            this._store = new Map();
        }
        TaskMap.prototype.forEach = function (callback) {
            this._store.forEach(callback);
        };
        TaskMap.prototype.get = function (workspaceFolder) {
            var result = Types.isString(workspaceFolder) ? this._store.get(workspaceFolder) : this._store.get(workspaceFolder.uri.toString());
            if (!result) {
                result = [];
                Types.isString(workspaceFolder) ? this._store.set(workspaceFolder, result) : this._store.set(workspaceFolder.uri.toString(), result);
            }
            return result;
        };
        TaskMap.prototype.add = function (workspaceFolder) {
            var task = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                task[_i - 1] = arguments[_i];
            }
            var values = Types.isString(workspaceFolder) ? this._store.get(workspaceFolder) : this._store.get(workspaceFolder.uri.toString());
            if (!values) {
                values = [];
                Types.isString(workspaceFolder) ? this._store.set(workspaceFolder, values) : this._store.set(workspaceFolder.uri.toString(), values);
            }
            values.push.apply(values, task);
        };
        TaskMap.prototype.all = function () {
            var result = [];
            this._store.forEach(function (values) { return result.push.apply(result, values); });
            return result;
        };
        return TaskMap;
    }());
    var TaskService = /** @class */ (function () {
        function TaskService(configurationService, markerService, outputService, messageService, choiceService, editorService, fileService, contextService, telemetryService, textFileService, lifecycleService, modelService, extensionService, quickOpenService, configurationResolverService, terminalService, storageService, progressService, openerService, _windowServive) {
            var _this = this;
            this.configurationResolverService = configurationResolverService;
            this.terminalService = terminalService;
            this.storageService = storageService;
            this.progressService = progressService;
            this.openerService = openerService;
            this._windowServive = _windowServive;
            this.configurationService = configurationService;
            this.markerService = markerService;
            this.outputService = outputService;
            this.messageService = messageService;
            this.choiceService = choiceService;
            this.editorService = editorService;
            this.fileService = fileService;
            this.contextService = contextService;
            this.telemetryService = telemetryService;
            this.textFileService = textFileService;
            this.modelService = modelService;
            this.extensionService = extensionService;
            this.quickOpenService = quickOpenService;
            this._configHasErrors = false;
            this._workspaceTasksPromise = undefined;
            this._taskSystem = undefined;
            this._taskSystemListener = undefined;
            this._outputChannel = this.outputService.getChannel(TaskService.OutputChannelId);
            this._providers = new Map();
            this.configurationService.onDidChangeConfiguration(function () {
                if (!_this._taskSystem && !_this._workspaceTasksPromise) {
                    return;
                }
                if (!_this._taskSystem || _this._taskSystem instanceof terminalTaskSystem_1.TerminalTaskSystem) {
                    _this._outputChannel.clear();
                }
                var folderSetup = _this.computeWorkspaceFolderSetup();
                if (_this.executionEngine !== folderSetup[2]) {
                    if (_this._taskSystem && _this._taskSystem.getActiveTasks().length > 0) {
                        _this.messageService.show(severity_1.default.Info, {
                            message: nls.localize('TaskSystem.noHotSwap', 'Changing the task execution engine with an active task running requires to reload the Window'),
                            actions: [
                                new actions_4.ReloadWindowAction(actions_4.ReloadWindowAction.ID, actions_4.ReloadWindowAction.LABEL, _this._windowServive),
                                new CloseMessageAction()
                            ]
                        });
                        return;
                    }
                    else {
                        _this.disposeTaskSystemListeners();
                        _this._taskSystem = undefined;
                    }
                }
                _this.updateSetup(folderSetup);
                _this.updateWorkspaceTasks();
            });
            lifecycleService.onWillShutdown(function (event) { return event.veto(_this.beforeShutdown()); });
            this._onDidStateChange = new event_1.Emitter();
            this.registerCommands();
        }
        Object.defineProperty(TaskService.prototype, "onDidStateChange", {
            get: function () {
                return this._onDidStateChange.event;
            },
            enumerable: true,
            configurable: true
        });
        TaskService.prototype.registerCommands = function () {
            var _this = this;
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.runTask', function (accessor, arg) {
                _this.runTaskCommand(accessor, arg);
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.restartTask', function (accessor, arg) {
                _this.runRestartTaskCommand(accessor, arg);
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.terminate', function (accessor, arg) {
                _this.runTerminateCommand();
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.showLog', function () {
                if (!_this.canRunCommand()) {
                    return;
                }
                _this.showOutput();
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.build', function () {
                if (!_this.canRunCommand()) {
                    return;
                }
                _this.runBuildCommand();
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
                id: 'workbench.action.tasks.build',
                weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
                when: undefined,
                primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 32 /* KEY_B */
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.test', function () {
                if (!_this.canRunCommand()) {
                    return;
                }
                _this.runTestCommand();
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.configureTaskRunner', function () {
                _this.runConfigureTasks();
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.configureDefaultBuildTask', function () {
                _this.runConfigureDefaultBuildTask();
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.configureDefaultTestTask', function () {
                _this.runConfigureDefaultTestTask();
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.showTasks', function () {
                _this.runShowTasks();
            });
        };
        Object.defineProperty(TaskService.prototype, "workspaceFolders", {
            get: function () {
                if (!this.__workspaceFolders) {
                    this.updateSetup();
                }
                return this.__workspaceFolders;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TaskService.prototype, "ignoredWorkspaceFolders", {
            get: function () {
                if (!this.__ignoredWorkspaceFolders) {
                    this.updateSetup();
                }
                return this.__ignoredWorkspaceFolders;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TaskService.prototype, "executionEngine", {
            get: function () {
                if (this.__executionEngine === void 0) {
                    this.updateSetup();
                }
                return this.__executionEngine;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TaskService.prototype, "schemaVersion", {
            get: function () {
                if (this.__schemaVersion === void 0) {
                    this.updateSetup();
                }
                return this.__schemaVersion;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TaskService.prototype, "showIgnoreMessage", {
            get: function () {
                if (this.__showIgnoreMessage === void 0) {
                    this.__showIgnoreMessage = !this.storageService.getBoolean(TaskService.IgnoreTask010DonotShowAgain_key, storage_1.StorageScope.WORKSPACE, false);
                }
                return this.__showIgnoreMessage;
            },
            enumerable: true,
            configurable: true
        });
        TaskService.prototype.updateSetup = function (setup) {
            if (!setup) {
                setup = this.computeWorkspaceFolderSetup();
            }
            this.__workspaceFolders = setup[0];
            if (this.__ignoredWorkspaceFolders) {
                if (this.__ignoredWorkspaceFolders.length !== setup[1].length) {
                    this.__showIgnoreMessage = undefined;
                }
                else {
                    var set_1 = new Set();
                    this.__ignoredWorkspaceFolders.forEach(function (folder) { return set_1.add(folder.uri.toString()); });
                    for (var _i = 0, _a = setup[1]; _i < _a.length; _i++) {
                        var folder = _a[_i];
                        if (!set_1.has(folder.uri.toString())) {
                            this.__showIgnoreMessage = undefined;
                            break;
                        }
                    }
                }
            }
            this.__ignoredWorkspaceFolders = setup[1];
            this.__executionEngine = setup[2];
            this.__schemaVersion = setup[3];
        };
        TaskService.prototype.showOutput = function () {
            this.outputService.showChannel(this._outputChannel.id, true);
        };
        TaskService.prototype.disposeTaskSystemListeners = function () {
            if (this._taskSystemListener) {
                this._taskSystemListener.dispose();
            }
        };
        TaskService.prototype.registerTaskProvider = function (handle, provider) {
            if (!provider) {
                return;
            }
            this._providers.set(handle, provider);
        };
        TaskService.prototype.unregisterTaskProvider = function (handle) {
            return this._providers.delete(handle);
        };
        TaskService.prototype.getTask = function (folder, alias) {
            var name = Types.isString(folder) ? folder : folder.name;
            if (this.ignoredWorkspaceFolders.some(function (ignored) { return ignored.name === name; })) {
                return winjs_base_1.TPromise.wrapError(new Error(nls.localize('TaskServer.folderIgnored', 'The folder {0} is ignored since it uses task version 0.1.0', name)));
            }
            return this.getGroupedTasks().then(function (map) {
                var values = map.get(folder);
                if (!values) {
                    return undefined;
                }
                for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                    var task = values_1[_i];
                    if (tasks_1.Task.matches(task, alias)) {
                        return task;
                    }
                }
                return undefined;
            });
        };
        TaskService.prototype.tasks = function () {
            return this.getGroupedTasks().then(function (result) { return result.all(); });
        };
        TaskService.prototype.createSorter = function () {
            return new tasks_1.TaskSorter(this.contextService.getWorkspace() ? this.contextService.getWorkspace().folders : []);
        };
        TaskService.prototype.isActive = function () {
            if (!this._taskSystem) {
                return winjs_base_1.TPromise.as(false);
            }
            return this._taskSystem.isActive();
        };
        TaskService.prototype.getActiveTasks = function () {
            if (!this._taskSystem) {
                return winjs_base_1.TPromise.as([]);
            }
            return winjs_base_1.TPromise.as(this._taskSystem.getActiveTasks());
        };
        TaskService.prototype.getRecentlyUsedTasks = function () {
            if (this._recentlyUsedTasks) {
                return this._recentlyUsedTasks;
            }
            this._recentlyUsedTasks = new map_1.LinkedMap();
            var storageValue = this.storageService.get(TaskService.RecentlyUsedTasks_Key, storage_1.StorageScope.WORKSPACE);
            if (storageValue) {
                try {
                    var values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (var _i = 0, values_2 = values; _i < values_2.length; _i++) {
                            var value = values_2[_i];
                            this._recentlyUsedTasks.set(value, value);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this._recentlyUsedTasks;
        };
        TaskService.prototype.saveRecentlyUsedTasks = function () {
            if (!this._recentlyUsedTasks) {
                return;
            }
            var values = this._recentlyUsedTasks.values();
            if (values.length > 30) {
                values = values.slice(0, 30);
            }
            this.storageService.store(TaskService.RecentlyUsedTasks_Key, JSON.stringify(values), storage_1.StorageScope.WORKSPACE);
        };
        TaskService.prototype.openDocumentation = function () {
            this.openerService.open(uri_1.default.parse('https://go.microsoft.com/fwlink/?LinkId=733558'));
        };
        TaskService.prototype.build = function () {
            var _this = this;
            return this.getGroupedTasks().then(function (tasks) {
                var runnable = _this.createRunnableTask(tasks, tasks_1.TaskGroup.Build);
                if (!runnable || !runnable.task) {
                    if (_this.schemaVersion === tasks_1.JsonSchemaVersion.V0_1_0) {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noBuildTask1', 'No build task defined. Mark a task with \'isBuildCommand\' in the tasks.json file.'), taskSystem_1.TaskErrors.NoBuildTask);
                    }
                    else {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noBuildTask2', 'No build task defined. Mark a task with as a \'build\' group in the tasks.json file.'), taskSystem_1.TaskErrors.NoBuildTask);
                    }
                }
                return _this.executeTask(runnable.task, runnable.resolver);
            }).then(function (value) { return value; }, function (error) {
                _this.handleError(error);
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TaskService.prototype.runTest = function () {
            var _this = this;
            return this.getGroupedTasks().then(function (tasks) {
                var runnable = _this.createRunnableTask(tasks, tasks_1.TaskGroup.Test);
                if (!runnable || !runnable.task) {
                    if (_this.schemaVersion === tasks_1.JsonSchemaVersion.V0_1_0) {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noTestTask1', 'No test task defined. Mark a task with \'isTestCommand\' in the tasks.json file.'), taskSystem_1.TaskErrors.NoTestTask);
                    }
                    else {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noTestTask2', 'No test task defined. Mark a task with as a \'test\' group in the tasks.json file.'), taskSystem_1.TaskErrors.NoTestTask);
                    }
                }
                return _this.executeTask(runnable.task, runnable.resolver);
            }).then(function (value) { return value; }, function (error) {
                _this.handleError(error);
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TaskService.prototype.run = function (task, options) {
            var _this = this;
            return this.getGroupedTasks().then(function (grouped) {
                if (!task) {
                    throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskServer.noTask', 'Requested task {0} to execute not found.', task.name), taskSystem_1.TaskErrors.TaskNotFound);
                }
                else {
                    var resolver_1 = _this.createResolver(grouped);
                    if (options && options.attachProblemMatcher && _this.shouldAttachProblemMatcher(task) && !tasks_1.InMemoryTask.is(task)) {
                        return _this.attachProblemMatcher(task).then(function (toExecute) {
                            if (toExecute) {
                                return _this.executeTask(toExecute, resolver_1);
                            }
                            else {
                                return winjs_base_1.TPromise.as(undefined);
                            }
                        });
                    }
                    return _this.executeTask(task, resolver_1);
                }
            }).then(function (value) { return value; }, function (error) {
                _this.handleError(error);
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TaskService.prototype.shouldAttachProblemMatcher = function (task) {
            if (!this.canCustomize(task)) {
                return false;
            }
            if (task.group !== void 0 && task.group !== tasks_1.TaskGroup.Build) {
                return false;
            }
            if (task.problemMatchers !== void 0 && task.problemMatchers.length > 0) {
                return false;
            }
            if (tasks_1.ContributedTask.is(task)) {
                return !task.hasDefinedMatchers && task.problemMatchers.length === 0;
            }
            if (tasks_1.CustomTask.is(task)) {
                var configProperties = task._source.config.element;
                return configProperties.problemMatcher === void 0;
            }
            return false;
        };
        TaskService.prototype.attachProblemMatcher = function (task) {
            var _this = this;
            var entries = [];
            for (var _i = 0, _a = problemMatcher_1.ProblemMatcherRegistry.keys(); _i < _a.length; _i++) {
                var key = _a[_i];
                var matcher = problemMatcher_1.ProblemMatcherRegistry.get(key);
                if (matcher.deprecated) {
                    continue;
                }
                if (matcher.name === matcher.label) {
                    entries.push({ label: matcher.name, matcher: matcher });
                }
                else {
                    entries.push({
                        label: matcher.label,
                        description: "$" + matcher.name,
                        matcher: matcher
                    });
                }
            }
            if (entries.length > 0) {
                entries = entries.sort(function (a, b) { return a.label.localeCompare(b.label); });
                entries[0].separator = { border: true, label: nls.localize('TaskService.associate', 'associate') };
                entries.unshift({ label: nls.localize('TaskService.attachProblemMatcher.continueWithout', 'Continue without scanning the task output'), matcher: undefined }, { label: nls.localize('TaskService.attachProblemMatcher.never', 'Never scan the task output'), matcher: undefined, never: true }, { label: nls.localize('TaskService.attachProblemMatcher.learnMoreAbout', 'Learn more about scanning the task output'), matcher: undefined, learnMore: true });
                return this.quickOpenService.pick(entries, {
                    placeHolder: nls.localize('selectProblemMatcher', 'Select for which kind of errors and warnings to scan the task output'),
                    autoFocus: { autoFocusFirstEntry: true }
                }).then(function (selected) {
                    if (selected) {
                        if (selected.learnMore) {
                            _this.openDocumentation();
                            return undefined;
                        }
                        else if (selected.never) {
                            _this.customize(task, { problemMatcher: [] }, true);
                            return task;
                        }
                        else if (selected.matcher) {
                            var newTask = tasks_1.Task.clone(task);
                            var matcherReference = "$" + selected.matcher.name;
                            var properties = { problemMatcher: [matcherReference] };
                            newTask.problemMatchers = [matcherReference];
                            var matcher = problemMatcher_1.ProblemMatcherRegistry.get(selected.matcher.name);
                            if (matcher && matcher.watching !== void 0) {
                                properties.isBackground = true;
                                newTask.isBackground = true;
                            }
                            _this.customize(task, properties, true);
                            return newTask;
                        }
                        else {
                            return task;
                        }
                    }
                    else {
                        return undefined;
                    }
                });
            }
            return winjs_base_1.TPromise.as(task);
        };
        TaskService.prototype.getTasksForGroup = function (group) {
            return this.getGroupedTasks().then(function (groups) {
                var result = [];
                groups.forEach(function (tasks) {
                    for (var _i = 0, tasks_2 = tasks; _i < tasks_2.length; _i++) {
                        var task = tasks_2[_i];
                        if (task.group === group) {
                            result.push(task);
                        }
                    }
                });
                return result;
            });
        };
        TaskService.prototype.needsFolderQualification = function () {
            return this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE;
        };
        TaskService.prototype.canCustomize = function (task) {
            if (this.schemaVersion !== tasks_1.JsonSchemaVersion.V2_0_0) {
                return false;
            }
            if (tasks_1.CustomTask.is(task)) {
                return true;
            }
            if (tasks_1.ContributedTask.is(task)) {
                return !!tasks_1.Task.getWorkspaceFolder(task);
            }
            return false;
        };
        TaskService.prototype.customize = function (task, properties, openConfig) {
            var _this = this;
            var workspaceFolder = tasks_1.Task.getWorkspaceFolder(task);
            if (!workspaceFolder) {
                return winjs_base_1.TPromise.wrap(undefined);
            }
            var configuration = this.getConfiguration(workspaceFolder);
            if (configuration.hasParseErrors) {
                this.messageService.show(severity_1.default.Warning, nls.localize('customizeParseErrors', 'The current task configuration has errors. Please fix the errors first before customizing a task.'));
                return winjs_base_1.TPromise.wrap(undefined);
            }
            var fileConfig = configuration.config;
            var index;
            var toCustomize;
            var taskConfig = tasks_1.CustomTask.is(task) ? task._source.config : undefined;
            if (taskConfig && taskConfig.element) {
                index = taskConfig.index;
                toCustomize = taskConfig.element;
            }
            else if (tasks_1.ContributedTask.is(task)) {
                toCustomize = {};
                var identifier_1 = Objects.assign(Object.create(null), task.defines);
                delete identifier_1['_key'];
                Object.keys(identifier_1).forEach(function (key) { return toCustomize[key] = identifier_1[key]; });
                if (task.problemMatchers && task.problemMatchers.length > 0 && Types.isStringArray(task.problemMatchers)) {
                    toCustomize.problemMatcher = task.problemMatchers;
                }
            }
            if (!toCustomize) {
                return winjs_base_1.TPromise.as(undefined);
            }
            if (properties) {
                for (var _i = 0, _a = Object.getOwnPropertyNames(properties); _i < _a.length; _i++) {
                    var property = _a[_i];
                    var value = properties[property];
                    if (value !== void 0 && value !== null) {
                        toCustomize[property] = value;
                    }
                }
            }
            else {
                if (toCustomize.problemMatcher === void 0 && task.problemMatchers === void 0 || task.problemMatchers.length === 0) {
                    toCustomize.problemMatcher = [];
                }
            }
            var promise;
            if (!fileConfig) {
                var value = {
                    version: '2.0.0',
                    tasks: [toCustomize]
                };
                var content = [
                    '{',
                    '\t// See https://go.microsoft.com/fwlink/?LinkId=733558',
                    '\t// for the documentation about the tasks.json format',
                ].join('\n') + JSON.stringify(value, null, '\t').substr(1);
                var editorConfig_1 = this.configurationService.getValue();
                if (editorConfig_1.editor.insertSpaces) {
                    content = content.replace(/(\n)(\t+)/g, function (_, s1, s2) { return s1 + strings.repeat(' ', s2.length * editorConfig_1.editor.tabSize); });
                }
                promise = this.fileService.createFile(workspaceFolder.toResource('.vscode/tasks.json'), content).then(function () { });
            }
            else {
                // We have a global task configuration
                if (index === -1) {
                    if (properties.problemMatcher !== void 0) {
                        fileConfig.problemMatcher = properties.problemMatcher;
                        promise = this.writeConfiguration(workspaceFolder, 'tasks.problemMatchers', fileConfig.problemMatcher);
                    }
                    else if (properties.group !== void 0) {
                        fileConfig.group = properties.group;
                        promise = this.writeConfiguration(workspaceFolder, 'tasks.group', fileConfig.group);
                    }
                }
                else {
                    if (!Array.isArray(fileConfig.tasks)) {
                        fileConfig.tasks = [];
                    }
                    if (index === void 0) {
                        fileConfig.tasks.push(toCustomize);
                    }
                    else {
                        fileConfig.tasks[index] = toCustomize;
                    }
                    promise = this.writeConfiguration(workspaceFolder, 'tasks.tasks', fileConfig.tasks);
                }
            }
            if (!promise) {
                return winjs_base_1.TPromise.as(undefined);
            }
            return promise.then(function () {
                var event = {
                    properties: properties ? Object.getOwnPropertyNames(properties) : []
                };
                /* __GDPR__
                    "taskService.customize" : {
                        "properties" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                _this.telemetryService.publicLog(TaskService.CustomizationTelemetryEventName, event);
                if (openConfig) {
                    var resource = workspaceFolder.toResource('.vscode/tasks.json');
                    _this.editorService.openEditor({
                        resource: resource,
                        options: {
                            forceOpen: true,
                            pinned: false
                        }
                    }, false);
                }
            });
        };
        TaskService.prototype.writeConfiguration = function (workspaceFolder, key, value) {
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.FOLDER) {
                return this.configurationService.updateValue(key, value, { resource: workspaceFolder.uri }, configuration_1.ConfigurationTarget.WORKSPACE);
            }
            else if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE) {
                return this.configurationService.updateValue(key, value, { resource: workspaceFolder.uri }, configuration_1.ConfigurationTarget.WORKSPACE_FOLDER);
            }
            else {
                return undefined;
            }
        };
        TaskService.prototype.openConfig = function (task) {
            var resource = tasks_1.Task.getWorkspaceFolder(task).toResource(task._source.config.file);
            return this.editorService.openEditor({
                resource: resource,
                options: {
                    forceOpen: true,
                    pinned: false
                }
            }, false).then(function () { return undefined; });
        };
        TaskService.prototype.createRunnableTask = function (tasks, group) {
            var resolverData = new Map();
            var workspaceTasks = [];
            var extensionTasks = [];
            tasks.forEach(function (tasks, folder) {
                var data = resolverData.get(folder);
                if (!data) {
                    data = {
                        id: new Map(),
                        label: new Map(),
                        identifier: new Map()
                    };
                    resolverData.set(folder, data);
                }
                for (var _i = 0, tasks_3 = tasks; _i < tasks_3.length; _i++) {
                    var task = tasks_3[_i];
                    data.id.set(task._id, task);
                    data.label.set(task._label, task);
                    data.identifier.set(task.identifier, task);
                    if (group && task.group === group) {
                        if (task._source.kind === tasks_1.TaskSourceKind.Workspace) {
                            workspaceTasks.push(task);
                        }
                        else {
                            extensionTasks.push(task);
                        }
                    }
                }
            });
            var resolver = {
                resolve: function (workspaceFolder, alias) {
                    var data = resolverData.get(workspaceFolder.uri.toString());
                    if (!data) {
                        return undefined;
                    }
                    return data.id.get(alias) || data.label.get(alias) || data.identifier.get(alias);
                }
            };
            if (workspaceTasks.length > 0) {
                if (workspaceTasks.length > 1) {
                    this._outputChannel.append(nls.localize('moreThanOneBuildTask', 'There are many build tasks defined in the tasks.json. Executing the first one.\n'));
                }
                return { task: workspaceTasks[0], resolver: resolver };
            }
            if (extensionTasks.length === 0) {
                return undefined;
            }
            // We can only have extension tasks if we are in version 2.0.0. Then we can even run
            // multiple build tasks.
            if (extensionTasks.length === 1) {
                return { task: extensionTasks[0], resolver: resolver };
            }
            else {
                var id = UUID.generateUuid();
                var task = {
                    _id: id,
                    _source: { kind: tasks_1.TaskSourceKind.InMemory, label: 'inMemory' },
                    _label: id,
                    type: 'inMemory',
                    name: id,
                    identifier: id,
                    dependsOn: extensionTasks.map(function (task) { return { workspaceFolder: tasks_1.Task.getWorkspaceFolder(task), task: task._id }; })
                };
                return { task: task, resolver: resolver };
            }
        };
        TaskService.prototype.createResolver = function (grouped) {
            var resolverData = new Map();
            grouped.forEach(function (tasks, folder) {
                var data = resolverData.get(folder);
                if (!data) {
                    data = { label: new Map(), identifier: new Map() };
                    resolverData.set(folder, data);
                }
                for (var _i = 0, tasks_4 = tasks; _i < tasks_4.length; _i++) {
                    var task = tasks_4[_i];
                    data.label.set(task._label, task);
                    data.identifier.set(task.identifier, task);
                }
            });
            return {
                resolve: function (workspaceFolder, alias) {
                    var data = resolverData.get(workspaceFolder.uri.toString());
                    if (!data) {
                        return undefined;
                    }
                    return data.label.get(alias) || data.identifier.get(alias);
                }
            };
        };
        TaskService.prototype.executeTask = function (task, resolver) {
            var _this = this;
            if (!this.storageService.get(TaskService.RanTaskBefore_Key, storage_1.StorageScope.GLOBAL)) {
                this.storageService.store(TaskService.RanTaskBefore_Key, true, storage_1.StorageScope.GLOBAL);
            }
            return problemMatcher_1.ProblemMatcherRegistry.onReady().then(function () {
                return _this.textFileService.saveAll().then(function (value) {
                    var executeResult = _this.getTaskSystem().run(task, resolver);
                    var key = tasks_1.Task.getRecentlyUsedKey(task);
                    if (key) {
                        _this.getRecentlyUsedTasks().set(key, key, map_1.Touch.AsOld);
                    }
                    if (executeResult.kind === taskSystem_1.TaskExecuteKind.Active) {
                        var active = executeResult.active;
                        if (active.same) {
                            if (active.background) {
                                _this.messageService.show(severity_1.default.Info, nls.localize('TaskSystem.activeSame.background', 'The task \'{0}\' is already active and in background mode. To terminate it use `Terminate Task...` from the Tasks menu.', tasks_1.Task.getQualifiedLabel(task)));
                            }
                            else {
                                _this.messageService.show(severity_1.default.Info, nls.localize('TaskSystem.activeSame.noBackground', 'The task \'{0}\' is already active. To terminate it use `Terminate Task...` from the Tasks menu.', tasks_1.Task.getQualifiedLabel(task)));
                            }
                        }
                        else {
                            throw new taskSystem_1.TaskError(severity_1.default.Warning, nls.localize('TaskSystem.active', 'There is already a task running. Terminate it first before executing another task.'), taskSystem_1.TaskErrors.RunningTask);
                        }
                    }
                    return executeResult.promise;
                });
            });
        };
        TaskService.prototype.restart = function (task) {
            var _this = this;
            if (!this._taskSystem) {
                return;
            }
            this._taskSystem.terminate(task).then(function (response) {
                if (response.success) {
                    _this.run(task);
                }
                else {
                    _this.messageService.show(severity_1.default.Warning, nls.localize('TaskSystem.restartFailed', 'Failed to terminate and restart task {0}', Types.isString(task) ? task : task.name));
                }
                return response;
            });
        };
        TaskService.prototype.terminate = function (task) {
            if (!this._taskSystem) {
                return winjs_base_1.TPromise.as({ success: true, task: undefined });
            }
            return this._taskSystem.terminate(task);
        };
        TaskService.prototype.terminateAll = function () {
            if (!this._taskSystem) {
                return winjs_base_1.TPromise.as([]);
            }
            return this._taskSystem.terminateAll();
        };
        TaskService.prototype.getTaskSystem = function () {
            var _this = this;
            if (this._taskSystem) {
                return this._taskSystem;
            }
            if (this.executionEngine === tasks_1.ExecutionEngine.Terminal) {
                this._taskSystem = new terminalTaskSystem_1.TerminalTaskSystem(this.terminalService, this.outputService, this.markerService, this.modelService, this.configurationResolverService, this.telemetryService, this.contextService, TaskService.OutputChannelId);
            }
            else {
                var system = new processTaskSystem_1.ProcessTaskSystem(this.markerService, this.modelService, this.telemetryService, this.outputService, this.configurationResolverService, TaskService.OutputChannelId);
                system.hasErrors(this._configHasErrors);
                this._taskSystem = system;
            }
            this._taskSystemListener = this._taskSystem.onDidStateChange(function (event) {
                _this._onDidStateChange.fire(event);
            });
            return this._taskSystem;
        };
        TaskService.prototype.getGroupedTasks = function () {
            var _this = this;
            return this.extensionService.activateByEvent('onCommand:workbench.action.tasks.runTask').then(function () {
                return new winjs_base_1.TPromise(function (resolve, reject) {
                    var result = [];
                    var counter = 0;
                    var done = function (value) {
                        if (value) {
                            result.push(value);
                        }
                        if (--counter === 0) {
                            resolve(result);
                        }
                    };
                    var error = function (error) {
                        try {
                            if (Types.isString(error.message)) {
                                _this._outputChannel.append('Error: ');
                                _this._outputChannel.append(error.message);
                                _this._outputChannel.append('\n');
                                _this.outputService.showChannel(_this._outputChannel.id, true);
                            }
                        }
                        finally {
                            if (--counter === 0) {
                                resolve(result);
                            }
                        }
                    };
                    if (_this.schemaVersion === tasks_1.JsonSchemaVersion.V2_0_0 && _this._providers.size > 0) {
                        _this._providers.forEach(function (provider) {
                            counter++;
                            provider.provideTasks().done(done, error);
                        });
                    }
                    else {
                        resolve(result);
                    }
                });
            }).then(function (contributedTaskSets) {
                var result = new TaskMap();
                var contributedTasks = new TaskMap();
                for (var _i = 0, contributedTaskSets_1 = contributedTaskSets; _i < contributedTaskSets_1.length; _i++) {
                    var set = contributedTaskSets_1[_i];
                    for (var _a = 0, _b = set.tasks; _a < _b.length; _a++) {
                        var task = _b[_a];
                        var workspaceFolder = tasks_1.Task.getWorkspaceFolder(task);
                        if (workspaceFolder) {
                            contributedTasks.add(workspaceFolder, task);
                        }
                    }
                }
                return _this.getWorkspaceTasks().then(function (customTasks) {
                    customTasks.forEach(function (folderTasks, key) {
                        var contributed = contributedTasks.get(key);
                        if (!folderTasks.set) {
                            if (contributed) {
                                result.add.apply(result, [key].concat(contributed));
                            }
                            return;
                        }
                        if (!contributed) {
                            result.add.apply(result, [key].concat(folderTasks.set.tasks));
                        }
                        else {
                            var configurations_1 = folderTasks.configurations;
                            var legacyTaskConfigurations = folderTasks.set ? _this.getLegacyTaskConfigurations(folderTasks.set) : undefined;
                            var customTasksToDelete = [];
                            if (configurations_1 || legacyTaskConfigurations) {
                                var unUsedConfigurations_1 = new Set();
                                if (configurations_1) {
                                    Object.keys(configurations_1.byIdentifier).forEach(function (key) { return unUsedConfigurations_1.add(key); });
                                }
                                for (var _i = 0, contributed_1 = contributed; _i < contributed_1.length; _i++) {
                                    var task = contributed_1[_i];
                                    if (!tasks_1.ContributedTask.is(task)) {
                                        continue;
                                    }
                                    if (configurations_1) {
                                        var configuringTask = configurations_1.byIdentifier[task.defines._key];
                                        if (configuringTask) {
                                            unUsedConfigurations_1.delete(task.defines._key);
                                            result.add(key, TaskConfig.createCustomTask(task, configuringTask));
                                        }
                                        else {
                                            result.add(key, task);
                                        }
                                    }
                                    else if (legacyTaskConfigurations) {
                                        var configuringTask = legacyTaskConfigurations[task.defines._key];
                                        if (configuringTask) {
                                            result.add(key, TaskConfig.createCustomTask(task, configuringTask));
                                            customTasksToDelete.push(configuringTask);
                                        }
                                        else {
                                            result.add(key, task);
                                        }
                                    }
                                    else {
                                        result.add(key, task);
                                    }
                                }
                                if (customTasksToDelete.length > 0) {
                                    var toDelete = customTasksToDelete.reduce(function (map, task) {
                                        map[task._id] = true;
                                        return map;
                                    }, Object.create(null));
                                    for (var _a = 0, _b = folderTasks.set.tasks; _a < _b.length; _a++) {
                                        var task = _b[_a];
                                        if (toDelete[task._id]) {
                                            continue;
                                        }
                                        result.add(key, task);
                                    }
                                }
                                else {
                                    result.add.apply(result, [key].concat(folderTasks.set.tasks));
                                }
                                unUsedConfigurations_1.forEach(function (value) {
                                    var configuringTask = configurations_1.byIdentifier[value];
                                    _this._outputChannel.append(nls.localize('TaskService.noConfiguration', 'Error: The {0} task detection didn\'t contribute a task for the following configuration:\n{1}\nThe task will be ignored.\n', configuringTask.configures.type, JSON.stringify(configuringTask._source.config.element, undefined, 4)));
                                    _this.showOutput();
                                });
                            }
                            else {
                                result.add.apply(result, [key].concat(folderTasks.set.tasks));
                                result.add.apply(result, [key].concat(contributed));
                            }
                        }
                    });
                    return result;
                }, function () {
                    // If we can't read the tasks.json file provide at least the contributed tasks
                    var result = new TaskMap();
                    for (var _i = 0, contributedTaskSets_2 = contributedTaskSets; _i < contributedTaskSets_2.length; _i++) {
                        var set = contributedTaskSets_2[_i];
                        for (var _a = 0, _b = set.tasks; _a < _b.length; _a++) {
                            var task = _b[_a];
                            result.add(tasks_1.Task.getWorkspaceFolder(task), task);
                        }
                    }
                    return result;
                });
            });
        };
        TaskService.prototype.getLegacyTaskConfigurations = function (workspaceTasks) {
            var result;
            function getResult() {
                if (result) {
                    return result;
                }
                result = Object.create(null);
                return result;
            }
            for (var _i = 0, _a = workspaceTasks.tasks; _i < _a.length; _i++) {
                var task = _a[_i];
                if (tasks_1.CustomTask.is(task)) {
                    var commandName = task.command && task.command.name;
                    // This is for backwards compatibility with the 0.1.0 task annotation code
                    // if we had a gulp, jake or grunt command a task specification was a annotation
                    if (commandName === 'gulp' || commandName === 'grunt' || commandName === 'jake') {
                        var identifier = TaskConfig.getTaskIdentifier({
                            type: commandName,
                            task: task.name
                        });
                        getResult()[identifier._key] = task;
                    }
                }
            }
            return result;
        };
        TaskService.prototype.getWorkspaceTasks = function () {
            if (this._workspaceTasksPromise) {
                return this._workspaceTasksPromise;
            }
            this.updateWorkspaceTasks();
            return this._workspaceTasksPromise;
        };
        TaskService.prototype.updateWorkspaceTasks = function () {
            var _this = this;
            this._workspaceTasksPromise = this.computeWorkspaceTasks().then(function (value) {
                if (_this.executionEngine === tasks_1.ExecutionEngine.Process && _this._taskSystem instanceof processTaskSystem_1.ProcessTaskSystem) {
                    // We can only have a process engine if we have one folder.
                    value.forEach(function (value) {
                        _this._configHasErrors = value.hasErrors;
                        _this._taskSystem.hasErrors(_this._configHasErrors);
                    });
                }
                return value;
            });
        };
        TaskService.prototype.computeWorkspaceTasks = function () {
            if (this.workspaceFolders.length === 0) {
                return winjs_base_1.TPromise.as(new Map());
            }
            else {
                var promises = [];
                for (var _i = 0, _a = this.workspaceFolders; _i < _a.length; _i++) {
                    var folder = _a[_i];
                    promises.push(this.computeWorkspaceFolderTasks(folder).then(function (value) { return value; }, function () { return undefined; }));
                }
                return winjs_base_1.TPromise.join(promises).then(function (values) {
                    var result = new Map();
                    for (var _i = 0, values_3 = values; _i < values_3.length; _i++) {
                        var value = values_3[_i];
                        if (value) {
                            result.set(value.workspaceFolder.uri.toString(), value);
                        }
                    }
                    return result;
                });
            }
        };
        TaskService.prototype.computeWorkspaceFolderTasks = function (workspaceFolder) {
            var _this = this;
            return (this.executionEngine === tasks_1.ExecutionEngine.Process
                ? this.computeLegacyConfiguration(workspaceFolder)
                : this.computeConfiguration(workspaceFolder)).
                then(function (workspaceFolderConfiguration) {
                if (!workspaceFolderConfiguration || !workspaceFolderConfiguration.config || workspaceFolderConfiguration.hasErrors) {
                    return winjs_base_1.TPromise.as({ workspaceFolder: workspaceFolder, set: undefined, configurations: undefined, hasErrors: workspaceFolderConfiguration ? workspaceFolderConfiguration.hasErrors : false });
                }
                return problemMatcher_1.ProblemMatcherRegistry.onReady().then(function () {
                    var problemReporter = new ProblemReporter(_this._outputChannel);
                    var parseResult = TaskConfig.parse(workspaceFolder, workspaceFolderConfiguration.config, problemReporter);
                    var hasErrors = false;
                    if (!parseResult.validationStatus.isOK()) {
                        hasErrors = true;
                        _this.showOutput();
                    }
                    if (problemReporter.status.isFatal()) {
                        problemReporter.fatal(nls.localize('TaskSystem.configurationErrors', 'Error: the provided task configuration has validation errors and can\'t not be used. Please correct the errors first.'));
                        return { workspaceFolder: workspaceFolder, set: undefined, configurations: undefined, hasErrors: hasErrors };
                    }
                    var customizedTasks;
                    if (parseResult.configured && parseResult.configured.length > 0) {
                        customizedTasks = {
                            byIdentifier: Object.create(null)
                        };
                        for (var _i = 0, _a = parseResult.configured; _i < _a.length; _i++) {
                            var task = _a[_i];
                            customizedTasks.byIdentifier[task.configures._key] = task;
                        }
                    }
                    return { workspaceFolder: workspaceFolder, set: { tasks: parseResult.custom }, configurations: customizedTasks, hasErrors: hasErrors };
                });
            });
        };
        TaskService.prototype.computeConfiguration = function (workspaceFolder) {
            var _a = this.getConfiguration(workspaceFolder), config = _a.config, hasParseErrors = _a.hasParseErrors;
            return winjs_base_1.TPromise.as({ workspaceFolder: workspaceFolder, config: config, hasErrors: hasParseErrors });
        };
        TaskService.prototype.computeLegacyConfiguration = function (workspaceFolder) {
            var _this = this;
            var _a = this.getConfiguration(workspaceFolder), config = _a.config, hasParseErrors = _a.hasParseErrors;
            if (hasParseErrors) {
                return winjs_base_1.TPromise.as({ workspaceFolder: workspaceFolder, hasErrors: true, config: undefined });
            }
            if (config) {
                if (this.hasDetectorSupport(config)) {
                    return new processRunnerDetector_1.ProcessRunnerDetector(workspaceFolder, this.fileService, this.contextService, this.configurationResolverService, config).detect(true).then(function (value) {
                        var hasErrors = _this.printStderr(value.stderr);
                        var detectedConfig = value.config;
                        if (!detectedConfig) {
                            return { workspaceFolder: workspaceFolder, config: config, hasErrors: hasErrors };
                        }
                        var result = Objects.deepClone(config);
                        var configuredTasks = Object.create(null);
                        if (!result.tasks) {
                            if (detectedConfig.tasks) {
                                result.tasks = detectedConfig.tasks;
                            }
                        }
                        else {
                            result.tasks.forEach(function (task) { return configuredTasks[task.taskName] = task; });
                            detectedConfig.tasks.forEach(function (task) {
                                if (!configuredTasks[task.taskName]) {
                                    result.tasks.push(task);
                                }
                            });
                        }
                        return { workspaceFolder: workspaceFolder, config: result, hasErrors: hasErrors };
                    });
                }
                else {
                    return winjs_base_1.TPromise.as({ workspaceFolder: workspaceFolder, config: config, hasErrors: false });
                }
            }
            else {
                return new processRunnerDetector_1.ProcessRunnerDetector(workspaceFolder, this.fileService, this.contextService, this.configurationResolverService).detect(true).then(function (value) {
                    var hasErrors = _this.printStderr(value.stderr);
                    return { workspaceFolder: workspaceFolder, config: value.config, hasErrors: hasErrors };
                });
            }
        };
        TaskService.prototype.computeWorkspaceFolderSetup = function () {
            var workspaceFolders = [];
            var ignoredWorkspaceFolders = [];
            var executionEngine = tasks_1.ExecutionEngine.Terminal;
            var schemaVersion = tasks_1.JsonSchemaVersion.V2_0_0;
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.FOLDER) {
                var workspaceFolder = this.contextService.getWorkspace().folders[0];
                workspaceFolders.push(workspaceFolder);
                executionEngine = this.computeExecutionEngine(workspaceFolder);
                schemaVersion = this.computeJsonSchemaVersion(workspaceFolder);
            }
            else if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE) {
                for (var _i = 0, _a = this.contextService.getWorkspace().folders; _i < _a.length; _i++) {
                    var workspaceFolder = _a[_i];
                    if (schemaVersion === this.computeJsonSchemaVersion(workspaceFolder)) {
                        workspaceFolders.push(workspaceFolder);
                    }
                    else {
                        ignoredWorkspaceFolders.push(workspaceFolder);
                        this._outputChannel.append(nls.localize('taskService.ignoreingFolder', 'Ignoring task configurations for workspace folder {0}. Multi folder workspace task support requires that all folders use task version 2.0.0\n', workspaceFolder.uri.fsPath));
                    }
                }
            }
            return [workspaceFolders, ignoredWorkspaceFolders, executionEngine, schemaVersion];
        };
        TaskService.prototype.computeExecutionEngine = function (workspaceFolder) {
            var config = this.getConfiguration(workspaceFolder).config;
            if (!config) {
                return tasks_1.ExecutionEngine._default;
            }
            return TaskConfig.ExecutionEngine.from(config);
        };
        TaskService.prototype.computeJsonSchemaVersion = function (workspaceFolder) {
            var config = this.getConfiguration(workspaceFolder).config;
            if (!config) {
                return tasks_1.JsonSchemaVersion.V2_0_0;
            }
            return TaskConfig.JsonSchemaVersion.from(config);
        };
        TaskService.prototype.getConfiguration = function (workspaceFolder) {
            var result = this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY
                ? Objects.deepClone(this.configurationService.getValue('tasks', { resource: workspaceFolder.uri }))
                : undefined;
            if (!result) {
                return { config: undefined, hasParseErrors: false };
            }
            var parseErrors = result.$parseErrors;
            if (parseErrors) {
                var isAffected = false;
                for (var i = 0; i < parseErrors.length; i++) {
                    if (/tasks\.json$/.test(parseErrors[i])) {
                        isAffected = true;
                        break;
                    }
                }
                if (isAffected) {
                    this._outputChannel.append(nls.localize('TaskSystem.invalidTaskJson', 'Error: The content of the tasks.json file has syntax errors. Please correct them before executing a task.\n'));
                    this.showOutput();
                    return { config: undefined, hasParseErrors: true };
                }
            }
            return { config: result, hasParseErrors: false };
        };
        TaskService.prototype.printStderr = function (stderr) {
            var _this = this;
            var result = false;
            if (stderr && stderr.length > 0) {
                stderr.forEach(function (line) {
                    result = true;
                    _this._outputChannel.append(line + '\n');
                });
                this.outputService.showChannel(this._outputChannel.id, true);
            }
            return result;
        };
        TaskService.prototype.inTerminal = function () {
            if (this._taskSystem) {
                return this._taskSystem instanceof terminalTaskSystem_1.TerminalTaskSystem;
            }
            return this.executionEngine === tasks_1.ExecutionEngine.Terminal;
        };
        TaskService.prototype.hasDetectorSupport = function (config) {
            if (!config.command || this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                return false;
            }
            return processRunnerDetector_1.ProcessRunnerDetector.supports(config.command);
        };
        TaskService.prototype.configureAction = function () {
            var _this = this;
            var run = function () { _this.runConfigureTasks(); return winjs_base_1.TPromise.as(undefined); };
            return new /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    return _super.call(this, ConfigureTaskAction.ID, ConfigureTaskAction.TEXT, undefined, true, run) || this;
                }
                return class_1;
            }(actions_1.Action));
        };
        TaskService.prototype.configureBuildTask = function () {
            var _this = this;
            var run = function () { _this.runConfigureTasks(); return winjs_base_1.TPromise.as(undefined); };
            return new /** @class */ (function (_super) {
                __extends(class_2, _super);
                function class_2() {
                    return _super.call(this, ConfigureTaskAction.ID, ConfigureTaskAction.TEXT, undefined, true, run) || this;
                }
                return class_2;
            }(actions_1.Action));
        };
        TaskService.prototype.beforeShutdown = function () {
            var _this = this;
            if (!this._taskSystem) {
                return false;
            }
            this.saveRecentlyUsedTasks();
            if (!this._taskSystem.isActiveSync()) {
                return false;
            }
            // The terminal service kills all terminal on shutdown. So there
            // is nothing we can do to prevent this here.
            if (this._taskSystem instanceof terminalTaskSystem_1.TerminalTaskSystem) {
                return false;
            }
            var terminatePromise;
            if (this._taskSystem.canAutoTerminate()) {
                terminatePromise = winjs_base_1.TPromise.wrap(true);
            }
            else {
                terminatePromise = this.messageService.confirm({
                    message: nls.localize('TaskSystem.runningTask', 'There is a task running. Do you want to terminate it?'),
                    primaryButton: nls.localize({ key: 'TaskSystem.terminateTask', comment: ['&& denotes a mnemonic'] }, "&&Terminate Task"),
                    type: 'question'
                });
            }
            return terminatePromise.then(function (terminate) {
                if (terminate) {
                    return _this._taskSystem.terminateAll().then(function (responses) {
                        var success = true;
                        var code = undefined;
                        for (var _i = 0, responses_1 = responses; _i < responses_1.length; _i++) {
                            var response = responses_1[_i];
                            success = success && response.success;
                            // We only have a code in the old output runner which only has one task
                            // So we can use the first code.
                            if (code === void 0 && response.code !== void 0) {
                                code = response.code;
                            }
                        }
                        if (success) {
                            _this._taskSystem = null;
                            _this.disposeTaskSystemListeners();
                            return false; // no veto
                        }
                        else if (code && code === processes_1.TerminateResponseCode.ProcessNotFound) {
                            return _this.messageService.confirm({
                                message: nls.localize('TaskSystem.noProcess', 'The launched task doesn\'t exist anymore. If the task spawned background processes exiting VS Code might result in orphaned processes. To avoid this start the last background process with a wait flag.'),
                                primaryButton: nls.localize({ key: 'TaskSystem.exitAnyways', comment: ['&& denotes a mnemonic'] }, "&&Exit Anyways"),
                                type: 'info'
                            }).then(function (confirmed) { return !confirmed; });
                        }
                        return true; // veto
                    }, function (err) {
                        return true; // veto
                    });
                }
                return true; // veto
            });
        };
        TaskService.prototype.getConfigureAction = function (code) {
            switch (code) {
                case taskSystem_1.TaskErrors.NoBuildTask:
                    return this.configureBuildTask();
                default:
                    return this.configureAction();
            }
        };
        TaskService.prototype.handleError = function (err) {
            var _this = this;
            var showOutput = true;
            if (err instanceof taskSystem_1.TaskError) {
                var buildError = err;
                var needsConfig = buildError.code === taskSystem_1.TaskErrors.NotConfigured || buildError.code === taskSystem_1.TaskErrors.NoBuildTask || buildError.code === taskSystem_1.TaskErrors.NoTestTask;
                var needsTerminate = buildError.code === taskSystem_1.TaskErrors.RunningTask;
                if (needsConfig || needsTerminate) {
                    var closeAction = new CloseMessageAction();
                    var action = needsConfig
                        ? this.getConfigureAction(buildError.code)
                        : new actions_1.Action('workbench.action.tasks.terminate', nls.localize('TerminateAction.label', "Terminate Task"), undefined, true, function () { _this.runTerminateCommand(); return winjs_base_1.TPromise.wrap(undefined); });
                    closeAction.closeFunction = this.messageService.show(buildError.severity, { message: buildError.message, actions: [action, closeAction] });
                }
                else {
                    this.messageService.show(buildError.severity, buildError.message);
                }
            }
            else if (err instanceof Error) {
                var error = err;
                this.messageService.show(severity_1.default.Error, error.message);
            }
            else if (Types.isString(err)) {
                this.messageService.show(severity_1.default.Error, err);
            }
            else {
                this.messageService.show(severity_1.default.Error, nls.localize('TaskSystem.unknownError', 'An error has occurred while running a task. See task log for details.'));
            }
            if (showOutput) {
                this.outputService.showChannel(this._outputChannel.id, true);
            }
        };
        TaskService.prototype.canRunCommand = function () {
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                this.messageService.show(severity_1.default.Info, nls.localize('TaskService.noWorkspace', 'Tasks are only available on a workspace folder.'));
                return false;
            }
            return true;
        };
        TaskService.prototype.createTaskQuickPickEntries = function (tasks, group, sort) {
            var _this = this;
            if (group === void 0) { group = false; }
            if (sort === void 0) { sort = false; }
            if (tasks === void 0 || tasks === null || tasks.length === 0) {
                return [];
            }
            var TaskQuickPickEntry = function (task) {
                var description;
                if (_this.needsFolderQualification()) {
                    var workspaceFolder = tasks_1.Task.getWorkspaceFolder(task);
                    if (workspaceFolder) {
                        description = workspaceFolder.name;
                    }
                }
                return { label: task._label, description: description, task: task };
            };
            var taskService = this;
            var action = new /** @class */ (function (_super) {
                __extends(class_3, _super);
                function class_3() {
                    return _super.call(this, 'configureAction', 'Configure Task', 'quick-open-task-configure', true) || this;
                }
                class_3.prototype.run = function (item) {
                    var task = item.getPayload();
                    taskService.quickOpenService.close();
                    if (tasks_1.ContributedTask.is(task)) {
                        taskService.customize(task, undefined, true);
                    }
                    else if (tasks_1.CustomTask.is(task)) {
                        taskService.openConfig(task);
                    }
                    return winjs_base_1.TPromise.as(false);
                };
                return class_3;
            }(actions_1.Action));
            function fillEntries(entries, tasks, groupLabel, withBorder) {
                if (withBorder === void 0) { withBorder = false; }
                var first = true;
                for (var _i = 0, tasks_5 = tasks; _i < tasks_5.length; _i++) {
                    var task = tasks_5[_i];
                    var entry = TaskQuickPickEntry(task);
                    if (first) {
                        first = false;
                        entry.separator = { label: groupLabel, border: withBorder };
                    }
                    entry.action = action;
                    entry.payload = task;
                    entries.push(entry);
                }
            }
            var entries;
            if (group) {
                entries = [];
                if (tasks.length === 1) {
                    entries.push(TaskQuickPickEntry(tasks[0]));
                }
                else {
                    var recentlyUsedTasks = this.getRecentlyUsedTasks();
                    var recent_1 = [];
                    var configured = [];
                    var detected = [];
                    var taskMap_1 = Object.create(null);
                    tasks.forEach(function (task) {
                        var key = tasks_1.Task.getRecentlyUsedKey(task);
                        if (key) {
                            taskMap_1[key] = task;
                        }
                    });
                    recentlyUsedTasks.keys().forEach(function (key) {
                        var task = taskMap_1[key];
                        if (task) {
                            recent_1.push(task);
                        }
                    });
                    for (var _i = 0, tasks_6 = tasks; _i < tasks_6.length; _i++) {
                        var task = tasks_6[_i];
                        var key = tasks_1.Task.getRecentlyUsedKey(task);
                        if (!key || !recentlyUsedTasks.has(key)) {
                            if (task._source.kind === tasks_1.TaskSourceKind.Workspace) {
                                configured.push(task);
                            }
                            else {
                                detected.push(task);
                            }
                        }
                    }
                    var sorter_1 = this.createSorter();
                    var hasRecentlyUsed = recent_1.length > 0;
                    fillEntries(entries, recent_1, nls.localize('recentlyUsed', 'recently used tasks'));
                    configured = configured.sort(function (a, b) { return sorter_1.compare(a, b); });
                    var hasConfigured = configured.length > 0;
                    fillEntries(entries, configured, nls.localize('configured', 'configured tasks'), hasRecentlyUsed);
                    detected = detected.sort(function (a, b) { return sorter_1.compare(a, b); });
                    fillEntries(entries, detected, nls.localize('detected', 'detected tasks'), hasRecentlyUsed || hasConfigured);
                }
            }
            else {
                if (sort) {
                    var sorter_2 = this.createSorter();
                    tasks = tasks.sort(function (a, b) { return sorter_2.compare(a, b); });
                }
                entries = tasks.map(function (task) { return TaskQuickPickEntry(task); });
            }
            return entries;
        };
        TaskService.prototype.showQuickPick = function (tasks, placeHolder, defaultEntry, group, sort) {
            var _this = this;
            if (group === void 0) { group = false; }
            if (sort === void 0) { sort = false; }
            var _createEntries = function () {
                if (Array.isArray(tasks)) {
                    return winjs_base_1.TPromise.as(_this.createTaskQuickPickEntries(tasks, group, sort));
                }
                else {
                    return tasks.then(function (tasks) { return _this.createTaskQuickPickEntries(tasks, group, sort); });
                }
            };
            return this.quickOpenService.pick(_createEntries().then(function (entries) {
                if (entries.length === 0 && defaultEntry) {
                    entries.push(defaultEntry);
                }
                return entries;
            }), { placeHolder: placeHolder, autoFocus: { autoFocusFirstEntry: true }, matchOnDescription: true }).then(function (entry) { return entry ? entry.task : undefined; });
        };
        TaskService.prototype.showIgnoredFoldersMessage = function () {
            var _this = this;
            if (this.ignoredWorkspaceFolders.length === 0 || !this.showIgnoreMessage) {
                return winjs_base_1.TPromise.as(undefined);
            }
            var message = nls.localize('TaskService.ignoredFolder', 'The following workspace folders are ignored since they use task version 0.1.0: ');
            for (var i = 0; i < this.ignoredWorkspaceFolders.length; i++) {
                message = message + this.ignoredWorkspaceFolders[i].name;
                if (i < this.ignoredWorkspaceFolders.length - 1) {
                    message = message + ', ';
                }
            }
            var notAgain = nls.localize('TaskService.notAgain', 'Don\'t Show Again');
            var ok = nls.localize('TaskService.ok', 'OK');
            return this.choiceService.choose(severity_1.default.Info, message, [notAgain, ok], 0).then(function (choice) {
                if (choice === 0) {
                    _this.storageService.store(TaskService.IgnoreTask010DonotShowAgain_key, true, storage_1.StorageScope.WORKSPACE);
                }
                _this.__showIgnoreMessage = false;
                return undefined;
            }, function () { return undefined; });
        };
        TaskService.prototype.runTaskCommand = function (accessor, arg) {
            var _this = this;
            if (!this.canRunCommand()) {
                return;
            }
            if (Types.isString(arg)) {
                this.getGroupedTasks().then(function (grouped) {
                    var resolver = _this.createResolver(grouped);
                    var folders = _this.contextService.getWorkspace().folders;
                    for (var _i = 0, folders_1 = folders; _i < folders_1.length; _i++) {
                        var folder = folders_1[_i];
                        var task = resolver.resolve(folder, arg);
                        if (task) {
                            _this.run(task);
                            return;
                        }
                    }
                    _this.doRunTaskCommand(grouped.all());
                }, function () {
                    _this.doRunTaskCommand();
                });
            }
            else {
                this.doRunTaskCommand();
            }
        };
        TaskService.prototype.doRunTaskCommand = function (tasks) {
            var _this = this;
            this.showIgnoredFoldersMessage().then(function () {
                _this.showQuickPick(tasks ? tasks : _this.tasks(), nls.localize('TaskService.pickRunTask', 'Select the task to run'), {
                    label: nls.localize('TaslService.noEntryToRun', 'No task to run found. Configure Tasks...'),
                    task: null
                }, true).
                    then(function (task) {
                    if (task === void 0) {
                        return;
                    }
                    if (task === null) {
                        _this.runConfigureTasks();
                    }
                    else {
                        _this.run(task, { attachProblemMatcher: true });
                    }
                });
            });
        };
        TaskService.prototype.splitPerGroupType = function (tasks) {
            var none = [];
            var defaults = [];
            var users = [];
            for (var _i = 0, tasks_7 = tasks; _i < tasks_7.length; _i++) {
                var task = tasks_7[_i];
                if (task.groupType === tasks_1.GroupType.default) {
                    defaults.push(task);
                }
                else if (task.groupType === tasks_1.GroupType.user) {
                    users.push(task);
                }
                else {
                    none.push(task);
                }
            }
            return { none: none, defaults: defaults, users: users };
        };
        TaskService.prototype.runBuildCommand = function () {
            var _this = this;
            if (!this.canRunCommand()) {
                return;
            }
            if (this.schemaVersion === tasks_1.JsonSchemaVersion.V0_1_0) {
                this.build();
                return;
            }
            var options = {
                location: progress_1.ProgressLocation.Window,
                title: nls.localize('TaskService.fetchingBuildTasks', 'Fetching build tasks...')
            };
            var promise = this.getTasksForGroup(tasks_1.TaskGroup.Build).then(function (tasks) {
                if (tasks.length > 0) {
                    var _a = _this.splitPerGroupType(tasks), defaults = _a.defaults, users = _a.users;
                    if (defaults.length === 1) {
                        _this.run(defaults[0]);
                        return;
                    }
                    else if (defaults.length + users.length > 0) {
                        tasks = defaults.concat(users);
                    }
                }
                _this.showIgnoredFoldersMessage().then(function () {
                    _this.showQuickPick(tasks, nls.localize('TaskService.pickBuildTask', 'Select the build task to run'), {
                        label: nls.localize('TaskService.noBuildTask', 'No build task to run found. Configure Build Task...'),
                        task: null
                    }, true).then(function (task) {
                        if (task === void 0) {
                            return;
                        }
                        if (task === null) {
                            _this.runConfigureDefaultBuildTask();
                            return;
                        }
                        _this.run(task, { attachProblemMatcher: true });
                    });
                });
            });
            this.progressService.withProgress(options, function () { return promise; });
        };
        TaskService.prototype.runTestCommand = function () {
            var _this = this;
            if (!this.canRunCommand()) {
                return;
            }
            if (this.schemaVersion === tasks_1.JsonSchemaVersion.V0_1_0) {
                this.runTest();
                return;
            }
            var options = {
                location: progress_1.ProgressLocation.Window,
                title: nls.localize('TaskService.fetchingTestTasks', 'Fetching test tasks...')
            };
            var promise = this.getTasksForGroup(tasks_1.TaskGroup.Test).then(function (tasks) {
                if (tasks.length > 0) {
                    var _a = _this.splitPerGroupType(tasks), defaults = _a.defaults, users = _a.users;
                    if (defaults.length === 1) {
                        _this.run(defaults[0]);
                        return;
                    }
                    else if (defaults.length + users.length > 0) {
                        tasks = defaults.concat(users);
                    }
                }
                _this.showIgnoredFoldersMessage().then(function () {
                    _this.showQuickPick(tasks, nls.localize('TaskService.pickTestTask', 'Select the test task to run'), {
                        label: nls.localize('TaskService.noTestTaskTerminal', 'No test task to run found. Configure Tasks...'),
                        task: null
                    }, true).then(function (task) {
                        if (task === void 0) {
                            return;
                        }
                        if (task === null) {
                            _this.runConfigureTasks();
                            return;
                        }
                        _this.run(task);
                    });
                });
            });
            this.progressService.withProgress(options, function () { return promise; });
        };
        TaskService.prototype.runTerminateCommand = function () {
            var _this = this;
            if (!this.canRunCommand()) {
                return;
            }
            if (this.inTerminal()) {
                this.showQuickPick(this.getActiveTasks(), nls.localize('TaskService.tastToTerminate', 'Select task to terminate'), {
                    label: nls.localize('TaskService.noTaskRunning', 'No task is currently running'),
                    task: null
                }, false, true).then(function (task) {
                    if (task === void 0 || task === null) {
                        return;
                    }
                    _this.terminate(task);
                });
            }
            else {
                this.isActive().then(function (active) {
                    if (active) {
                        _this.terminateAll().then(function (responses) {
                            // the output runner has only one task
                            var response = responses[0];
                            if (response.success) {
                                return;
                            }
                            if (response.code && response.code === processes_1.TerminateResponseCode.ProcessNotFound) {
                                _this.messageService.show(severity_1.default.Error, nls.localize('TerminateAction.noProcess', 'The launched process doesn\'t exist anymore. If the task spawned background tasks exiting VS Code might result in orphaned processes.'));
                            }
                            else {
                                _this.messageService.show(severity_1.default.Error, nls.localize('TerminateAction.failed', 'Failed to terminate running task'));
                            }
                        });
                    }
                });
            }
        };
        TaskService.prototype.runRestartTaskCommand = function (accessor, arg) {
            var _this = this;
            if (!this.canRunCommand()) {
                return;
            }
            if (this.inTerminal()) {
                this.showQuickPick(this.getActiveTasks(), nls.localize('TaskService.tastToRestart', 'Select the task to restart'), {
                    label: nls.localize('TaskService.noTaskToRestart', 'No task to restart'),
                    task: null
                }, false, true).then(function (task) {
                    if (task === void 0 || task === null) {
                        return;
                    }
                    _this.restart(task);
                });
            }
            else {
                this.getActiveTasks().then(function (activeTasks) {
                    if (activeTasks.length === 0) {
                        return;
                    }
                    var task = activeTasks[0];
                    _this.restart(task);
                });
            }
        };
        TaskService.prototype.runConfigureTasks = function () {
            var _this = this;
            if (!this.canRunCommand()) {
                return undefined;
            }
            var taskPromise;
            if (this.schemaVersion === tasks_1.JsonSchemaVersion.V2_0_0) {
                taskPromise = this.getGroupedTasks();
            }
            else {
                taskPromise = winjs_base_1.TPromise.as(new TaskMap());
            }
            var openTaskFile = function (workspaceFolder) {
                var resource = workspaceFolder.toResource('.vscode/tasks.json');
                var configFileCreated = false;
                _this.fileService.resolveFile(resource).then(function (stat) { return stat; }, function () { return undefined; }).then(function (stat) {
                    if (stat) {
                        return stat.resource;
                    }
                    return _this.quickOpenService.pick(taskTemplates_1.getTemplates(), { placeHolder: nls.localize('TaskService.template', 'Select a Task Template') }).then(function (selection) {
                        if (!selection) {
                            return undefined;
                        }
                        var content = selection.content;
                        var editorConfig = _this.configurationService.getValue();
                        if (editorConfig.editor.insertSpaces) {
                            content = content.replace(/(\n)(\t+)/g, function (_, s1, s2) { return s1 + strings.repeat(' ', s2.length * editorConfig.editor.tabSize); });
                        }
                        configFileCreated = true;
                        return _this.fileService.createFile(resource, content).then(function (result) {
                            _this.telemetryService.publicLog(TaskService.TemplateTelemetryEventName, {
                                templateId: selection.id,
                                autoDetect: selection.autoDetect
                            });
                            return result.resource;
                        });
                    });
                }).then(function (resource) {
                    if (!resource) {
                        return;
                    }
                    _this.editorService.openEditor({
                        resource: resource,
                        options: {
                            forceOpen: true,
                            pinned: configFileCreated // pin only if config file is created #8727
                        }
                    }, false);
                });
            };
            var configureTask = function (task) {
                if (tasks_1.ContributedTask.is(task)) {
                    _this.customize(task, undefined, true);
                }
                else if (tasks_1.CustomTask.is(task)) {
                    _this.openConfig(task);
                }
                else if (tasks_1.ConfiguringTask.is(task)) {
                    // Do nothing.
                }
            };
            function isTaskEntry(value) {
                var candidate = value;
                return candidate && !!candidate.task;
            }
            var stats = this.contextService.getWorkspace().folders.map(function (folder) {
                return _this.fileService.resolveFile(folder.toResource('.vscode/tasks.json')).then(function (stat) { return stat; }, function () { return undefined; });
            });
            var createLabel = nls.localize('TaskService.createJsonFile', 'Create tasks.json file from template');
            var openLabel = nls.localize('TaskService.openJsonFile', 'Open tasks.json file');
            var entries = winjs_base_1.TPromise.join(stats).then(function (stats) {
                return taskPromise.then(function (taskMap) {
                    var entries = [];
                    if (_this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.FOLDER) {
                        var tasks = taskMap.all();
                        var needsCreateOrOpen = true;
                        if (tasks.length > 0) {
                            tasks = tasks.sort(function (a, b) { return a._label.localeCompare(b._label); });
                            for (var _i = 0, tasks_8 = tasks; _i < tasks_8.length; _i++) {
                                var task = tasks_8[_i];
                                entries.push({ label: task._label, task: task });
                                if (!tasks_1.ContributedTask.is(task)) {
                                    needsCreateOrOpen = false;
                                }
                            }
                        }
                        if (needsCreateOrOpen) {
                            var label = stats[0] !== void 0 ? openLabel : createLabel;
                            entries.push({ label: label, folder: _this.contextService.getWorkspace().folders[0], separator: entries.length > 0 ? { border: true } : undefined });
                        }
                    }
                    else {
                        var folders = _this.contextService.getWorkspace().folders;
                        var index = 0;
                        for (var _a = 0, folders_2 = folders; _a < folders_2.length; _a++) {
                            var folder = folders_2[_a];
                            var tasks = taskMap.get(folder);
                            if (tasks.length > 0) {
                                tasks = tasks.slice().sort(function (a, b) { return a._label.localeCompare(b._label); });
                                for (var i = 0; i < tasks.length; i++) {
                                    var entry = { label: tasks[i]._label, task: tasks[i], description: folder.name };
                                    if (i === 0) {
                                        entry.separator = { label: folder.name, border: index > 0 };
                                    }
                                    entries.push(entry);
                                }
                            }
                            else {
                                var label = stats[index] !== void 0 ? openLabel : createLabel;
                                var entry = { label: label, folder: folder };
                                entry.separator = { label: folder.name, border: index > 0 };
                                entries.push(entry);
                            }
                            index++;
                        }
                    }
                    return entries;
                });
            });
            this.quickOpenService.pick(entries, { placeHolder: nls.localize('TaskService.pickTask', 'Select a task to configure'), autoFocus: { autoFocusFirstEntry: true } }).
                then(function (selection) {
                if (!selection) {
                    return;
                }
                if (isTaskEntry(selection)) {
                    configureTask(selection.task);
                }
                else {
                    openTaskFile(selection.folder);
                }
            });
        };
        TaskService.prototype.runConfigureDefaultBuildTask = function () {
            var _this = this;
            if (!this.canRunCommand()) {
                return;
            }
            if (this.schemaVersion === tasks_1.JsonSchemaVersion.V2_0_0) {
                this.tasks().then((function (tasks) {
                    if (tasks.length === 0) {
                        _this.runConfigureTasks();
                        return;
                    }
                    var defaultTask;
                    var defaultEntry;
                    for (var _i = 0, tasks_9 = tasks; _i < tasks_9.length; _i++) {
                        var task = tasks_9[_i];
                        if (task.group === tasks_1.TaskGroup.Build && task.groupType === tasks_1.GroupType.default) {
                            defaultTask = task;
                            break;
                        }
                    }
                    if (defaultTask) {
                        tasks = [];
                        defaultEntry = {
                            label: nls.localize('TaskService.defaultBuildTaskExists', '{0} is already marked as the default build task', tasks_1.Task.getQualifiedLabel(defaultTask)),
                            task: defaultTask
                        };
                    }
                    _this.showIgnoredFoldersMessage().then(function () {
                        _this.showQuickPick(tasks, nls.localize('TaskService.pickDefaultBuildTask', 'Select the task to be used as the default build task'), defaultEntry, true).
                            then(function (task) {
                            if (task === void 0) {
                                return;
                            }
                            if (task === defaultTask && tasks_1.CustomTask.is(task)) {
                                _this.openConfig(task);
                            }
                            if (!tasks_1.InMemoryTask.is(task)) {
                                _this.customize(task, { group: { kind: 'build', isDefault: true } }, true);
                            }
                        });
                    });
                }));
            }
            else {
                this.runConfigureTasks();
            }
        };
        TaskService.prototype.runConfigureDefaultTestTask = function () {
            var _this = this;
            if (!this.canRunCommand()) {
                return;
            }
            if (this.schemaVersion === tasks_1.JsonSchemaVersion.V2_0_0) {
                this.tasks().then((function (tasks) {
                    if (tasks.length === 0) {
                        _this.runConfigureTasks();
                    }
                    var defaultTask;
                    for (var _i = 0, tasks_10 = tasks; _i < tasks_10.length; _i++) {
                        var task = tasks_10[_i];
                        if (task.group === tasks_1.TaskGroup.Test && task.groupType === tasks_1.GroupType.default) {
                            defaultTask = task;
                            break;
                        }
                    }
                    if (defaultTask) {
                        _this.messageService.show(severity_1.default.Info, nls.localize('TaskService.defaultTestTaskExists', '{0} is already marked as the default test task.', tasks_1.Task.getQualifiedLabel(defaultTask)));
                        return;
                    }
                    _this.showIgnoredFoldersMessage().then(function () {
                        _this.showQuickPick(tasks, nls.localize('TaskService.pickDefaultTestTask', 'Select the task to be used as the default test task'), undefined, true).then(function (task) {
                            if (!task) {
                                return;
                            }
                            if (!tasks_1.InMemoryTask.is(task)) {
                                _this.customize(task, { group: { kind: 'test', isDefault: true } }, true);
                            }
                        });
                    });
                }));
            }
            else {
                this.runConfigureTasks();
            }
        };
        TaskService.prototype.runShowTasks = function () {
            var _this = this;
            if (!this.canRunCommand()) {
                return;
            }
            this.showQuickPick(this.getActiveTasks(), nls.localize('TaskService.pickShowTask', 'Select the task to show its output'), {
                label: nls.localize('TaskService.noTaskIsRunning', 'No task is running'),
                task: null
            }, false, true).then(function (task) {
                if (task === void 0 || task === null) {
                    return;
                }
                _this._taskSystem.revealTask(task);
            });
        };
        // private static autoDetectTelemetryName: string = 'taskServer.autoDetect';
        TaskService.RecentlyUsedTasks_Key = 'workbench.tasks.recentlyUsedTasks';
        TaskService.RanTaskBefore_Key = 'workbench.tasks.ranTaskBefore';
        TaskService.IgnoreTask010DonotShowAgain_key = 'workbench.tasks.ignoreTask010Shown';
        TaskService.CustomizationTelemetryEventName = 'taskService.customize';
        TaskService.TemplateTelemetryEventName = 'taskService.template';
        TaskService.OutputChannelId = 'tasks';
        TaskService.OutputChannelLabel = nls.localize('tasks', "Tasks");
        TaskService = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, markers_1.IMarkerService), __param(2, output_1.IOutputService),
            __param(3, message_1.IMessageService), __param(4, message_1.IChoiceService),
            __param(5, editorService_1.IWorkbenchEditorService),
            __param(6, files_1.IFileService), __param(7, workspace_1.IWorkspaceContextService),
            __param(8, telemetry_1.ITelemetryService), __param(9, textfiles_1.ITextFileService),
            __param(10, lifecycle_2.ILifecycleService),
            __param(11, modelService_1.IModelService), __param(12, extensions_2.IExtensionService),
            __param(13, quickOpen_1.IQuickOpenService),
            __param(14, configurationResolver_1.IConfigurationResolverService),
            __param(15, terminal_1.ITerminalService),
            __param(16, storage_1.IStorageService),
            __param(17, progress_1.IProgressService2),
            __param(18, opener_1.IOpenerService),
            __param(19, windows_1.IWindowService)
        ], TaskService);
        return TaskService;
    }());
    actions_2.MenuRegistry.addCommand({ id: ConfigureTaskAction.ID, title: { value: ConfigureTaskAction.TEXT, original: 'Configure Task' }, category: { value: tasksCategory, original: 'Tasks' } });
    actions_2.MenuRegistry.addCommand({ id: 'workbench.action.tasks.showLog', title: { value: nls.localize('ShowLogAction.label', "Show Task Log"), original: 'Show Task Log' }, category: { value: tasksCategory, original: 'Tasks' } });
    actions_2.MenuRegistry.addCommand({ id: 'workbench.action.tasks.runTask', title: { value: nls.localize('RunTaskAction.label', "Run Task"), original: 'Run Task' }, category: { value: tasksCategory, original: 'Tasks' } });
    actions_2.MenuRegistry.addCommand({ id: 'workbench.action.tasks.restartTask', title: { value: nls.localize('RestartTaskAction.label', "Restart Running Task"), original: 'Restart Running Task' }, category: { value: tasksCategory, original: 'Tasks' } });
    actions_2.MenuRegistry.addCommand({ id: 'workbench.action.tasks.showTasks', title: { value: nls.localize('ShowTasksAction.label', "Show Running Tasks"), original: 'Show Running Tasks' }, category: { value: tasksCategory, original: 'Tasks' } });
    actions_2.MenuRegistry.addCommand({ id: 'workbench.action.tasks.terminate', title: { value: nls.localize('TerminateAction.label', "Terminate Task"), original: 'Terminate Task' }, category: { value: tasksCategory, original: 'Tasks' } });
    actions_2.MenuRegistry.addCommand({ id: 'workbench.action.tasks.build', title: { value: nls.localize('BuildAction.label', "Run Build Task"), original: 'Run Build Task' }, category: { value: tasksCategory, original: 'Tasks' } });
    actions_2.MenuRegistry.addCommand({ id: 'workbench.action.tasks.test', title: { value: nls.localize('TestAction.label', "Run Test Task"), original: 'Run Test Task' }, category: { value: tasksCategory, original: 'Tasks' } });
    actions_2.MenuRegistry.addCommand({ id: 'workbench.action.tasks.configureDefaultBuildTask', title: { value: nls.localize('ConfigureDefaultBuildTask.label', "Configure Default Build Task"), original: 'Configure Default Build Task' }, category: { value: tasksCategory, original: 'Tasks' } });
    actions_2.MenuRegistry.addCommand({ id: 'workbench.action.tasks.configureDefaultTestTask', title: { value: nls.localize('ConfigureDefaultTestTask.label', "Configure Default Test Task"), original: 'Configure Default Test Task' }, category: { value: tasksCategory, original: 'Tasks' } });
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.rebuild', title: nls.localize('RebuildAction.label', 'Run Rebuild Task'), category: tasksCategory });
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.clean', title: nls.localize('CleanAction.label', 'Run Clean Task'), category: tasksCategory });
    // Tasks Output channel. Register it before using it in Task Service.
    var outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
    outputChannelRegistry.registerChannel(TaskService.OutputChannelId, TaskService.OutputChannelLabel);
    // Task Service
    extensions_1.registerSingleton(taskService_1.ITaskService, TaskService);
    // Register Quick Open
    var quickOpenRegistry = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
    var tasksPickerContextKey = 'inTasksPicker';
    quickOpenRegistry.registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(taskQuickOpen_1.QuickOpenHandler, taskQuickOpen_1.QuickOpenHandler.ID, 'task ', tasksPickerContextKey, nls.localize('quickOpen.task', "Run Task")));
    var actionBarRegistry = platform_1.Registry.as(actions_3.Extensions.Actionbar);
    actionBarRegistry.registerActionBarContributor(actions_3.Scope.VIEWER, quickOpen_2.QuickOpenActionContributor);
    // Status bar
    var statusbarRegistry = platform_1.Registry.as(statusbar_1.Extensions.Statusbar);
    statusbarRegistry.registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(BuildStatusBarItem, statusbar_1.StatusbarAlignment.LEFT, 50 /* Medium Priority */));
    statusbarRegistry.registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(TaskStatusBarItem, statusbar_1.StatusbarAlignment.LEFT, 50 /* Medium Priority */));
    // tasks.json validation
    var schemaId = 'vscode://schemas/tasks';
    var schema = {
        id: schemaId,
        description: 'Task definition file',
        type: 'object',
        default: {
            version: '0.1.0',
            command: 'myCommand',
            isShellCommand: false,
            args: [],
            showOutput: 'always',
            tasks: [
                {
                    taskName: 'build',
                    showOutput: 'silent',
                    isBuildCommand: true,
                    problemMatcher: ['$tsc', '$lessCompile']
                }
            ]
        }
    };
    schema.definitions = __assign({}, jsonSchema_v1_1.default.definitions, jsonSchema_v2_1.default.definitions);
    schema.oneOf = jsonSchema_v2_1.default.oneOf.concat(jsonSchema_v1_1.default.oneOf);
    var jsonRegistry = platform_1.Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
    jsonRegistry.registerSchema(schemaId, schema);
});
