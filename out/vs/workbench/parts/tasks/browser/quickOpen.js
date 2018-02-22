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
define(["require", "exports", "vs/nls", "vs/base/common/filters", "vs/base/common/actions", "vs/workbench/browser/quickopen", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/platform/quickOpen/common/quickOpen", "vs/workbench/parts/tasks/common/tasks", "vs/workbench/parts/tasks/common/taskService", "vs/workbench/browser/actions"], function (require, exports, nls, Filters, actions_1, Quickopen, Model, quickOpen_1, tasks_1, taskService_1, actions_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TaskEntry = /** @class */ (function (_super) {
        __extends(TaskEntry, _super);
        function TaskEntry(quickOpenService, taskService, _task, highlights) {
            if (highlights === void 0) { highlights = []; }
            var _this = _super.call(this, highlights) || this;
            _this.quickOpenService = quickOpenService;
            _this.taskService = taskService;
            _this._task = _task;
            return _this;
        }
        TaskEntry.prototype.getLabel = function () {
            return this.task._label;
        };
        TaskEntry.prototype.getDescription = function () {
            if (!this.taskService.needsFolderQualification()) {
                return null;
            }
            var workspaceFolder = tasks_1.Task.getWorkspaceFolder(this.task);
            if (!workspaceFolder) {
                return null;
            }
            return "" + workspaceFolder.name;
        };
        TaskEntry.prototype.getAriaLabel = function () {
            return nls.localize('entryAriaLabel', "{0}, tasks", this.getLabel());
        };
        Object.defineProperty(TaskEntry.prototype, "task", {
            get: function () {
                return this._task;
            },
            enumerable: true,
            configurable: true
        });
        TaskEntry.prototype.doRun = function (task, options) {
            this.taskService.run(task, options);
            if (!task.command || task.command.presentation.focus) {
                this.quickOpenService.close();
                return false;
            }
            return true;
        };
        return TaskEntry;
    }(Model.QuickOpenEntry));
    exports.TaskEntry = TaskEntry;
    var TaskGroupEntry = /** @class */ (function (_super) {
        __extends(TaskGroupEntry, _super);
        function TaskGroupEntry(entry, groupLabel, withBorder) {
            return _super.call(this, entry, groupLabel, withBorder) || this;
        }
        return TaskGroupEntry;
    }(Model.QuickOpenEntryGroup));
    exports.TaskGroupEntry = TaskGroupEntry;
    var QuickOpenHandler = /** @class */ (function (_super) {
        __extends(QuickOpenHandler, _super);
        function QuickOpenHandler(quickOpenService, taskService) {
            var _this = _super.call(this) || this;
            _this.quickOpenService = quickOpenService;
            _this.taskService = taskService;
            _this.quickOpenService = quickOpenService;
            _this.taskService = taskService;
            return _this;
        }
        QuickOpenHandler.prototype.onOpen = function () {
            this.tasks = this.getTasks();
        };
        QuickOpenHandler.prototype.onClose = function (canceled) {
            this.tasks = undefined;
        };
        QuickOpenHandler.prototype.getResults = function (input) {
            var _this = this;
            return this.tasks.then(function (tasks) {
                var entries = [];
                if (tasks.length === 0) {
                    return new Model.QuickOpenModel(entries);
                }
                var recentlyUsedTasks = _this.taskService.getRecentlyUsedTasks();
                var recent = [];
                var configured = [];
                var detected = [];
                var taskMap = Object.create(null);
                tasks.forEach(function (task) {
                    var key = tasks_1.Task.getRecentlyUsedKey(task);
                    if (key) {
                        taskMap[key] = task;
                    }
                });
                recentlyUsedTasks.keys().forEach(function (key) {
                    var task = taskMap[key];
                    if (task) {
                        recent.push(task);
                    }
                });
                for (var _i = 0, tasks_2 = tasks; _i < tasks_2.length; _i++) {
                    var task = tasks_2[_i];
                    var key = tasks_1.Task.getRecentlyUsedKey(task);
                    if (!key || !recentlyUsedTasks.has(key)) {
                        if (tasks_1.CustomTask.is(task)) {
                            configured.push(task);
                        }
                        else {
                            detected.push(task);
                        }
                    }
                }
                var sorter = _this.taskService.createSorter();
                var hasRecentlyUsed = recent.length > 0;
                _this.fillEntries(entries, input, recent, nls.localize('recentlyUsed', 'recently used tasks'));
                configured = configured.sort(function (a, b) { return sorter.compare(a, b); });
                var hasConfigured = configured.length > 0;
                _this.fillEntries(entries, input, configured, nls.localize('configured', 'configured tasks'), hasRecentlyUsed);
                detected = detected.sort(function (a, b) { return sorter.compare(a, b); });
                _this.fillEntries(entries, input, detected, nls.localize('detected', 'detected tasks'), hasRecentlyUsed || hasConfigured);
                return new Model.QuickOpenModel(entries, new actions_2.ContributableActionProvider());
            });
        };
        QuickOpenHandler.prototype.fillEntries = function (entries, input, tasks, groupLabel, withBorder) {
            if (withBorder === void 0) { withBorder = false; }
            var first = true;
            for (var _i = 0, tasks_3 = tasks; _i < tasks_3.length; _i++) {
                var task = tasks_3[_i];
                var highlights = Filters.matchesFuzzy(input, task._label);
                if (!highlights) {
                    continue;
                }
                if (first) {
                    first = false;
                    entries.push(new TaskGroupEntry(this.createEntry(task, highlights), groupLabel, withBorder));
                }
                else {
                    entries.push(this.createEntry(task, highlights));
                }
            }
        };
        QuickOpenHandler.prototype.getAutoFocus = function (input) {
            return {
                autoFocusFirstEntry: !!input
            };
        };
        return QuickOpenHandler;
    }(Quickopen.QuickOpenHandler));
    exports.QuickOpenHandler = QuickOpenHandler;
    var CustomizeTaskAction = /** @class */ (function (_super) {
        __extends(CustomizeTaskAction, _super);
        function CustomizeTaskAction(taskService, quickOpenService) {
            var _this = _super.call(this, CustomizeTaskAction.ID, CustomizeTaskAction.LABEL) || this;
            _this.taskService = taskService;
            _this.quickOpenService = quickOpenService;
            _this.updateClass();
            return _this;
        }
        CustomizeTaskAction.prototype.updateClass = function () {
            this.class = 'quick-open-task-configure';
        };
        CustomizeTaskAction.prototype.run = function (element) {
            var _this = this;
            var task = this.getTask(element);
            if (tasks_1.ContributedTask.is(task)) {
                return this.taskService.customize(task, undefined, true).then(function () {
                    _this.quickOpenService.close();
                });
            }
            else {
                return this.taskService.openConfig(task).then(function () {
                    _this.quickOpenService.close();
                });
            }
        };
        CustomizeTaskAction.prototype.getTask = function (element) {
            if (element instanceof TaskEntry) {
                return element.task;
            }
            else if (element instanceof TaskGroupEntry) {
                return element.getEntry().task;
            }
            return undefined;
        };
        CustomizeTaskAction.ID = 'workbench.action.tasks.customizeTask';
        CustomizeTaskAction.LABEL = nls.localize('customizeTask', "Configure Task");
        return CustomizeTaskAction;
    }(actions_1.Action));
    var QuickOpenActionContributor = /** @class */ (function (_super) {
        __extends(QuickOpenActionContributor, _super);
        function QuickOpenActionContributor(taskService, quickOpenService) {
            var _this = _super.call(this) || this;
            _this.action = new CustomizeTaskAction(taskService, quickOpenService);
            return _this;
        }
        QuickOpenActionContributor.prototype.hasActions = function (context) {
            var task = this.getTask(context);
            return !!task;
        };
        QuickOpenActionContributor.prototype.getActions = function (context) {
            var actions = [];
            var task = this.getTask(context);
            if (task && tasks_1.ContributedTask.is(task) || tasks_1.CustomTask.is(task)) {
                actions.push(this.action);
            }
            return actions;
        };
        QuickOpenActionContributor.prototype.getTask = function (context) {
            if (!context) {
                return undefined;
            }
            var element = context.element;
            if (element instanceof TaskEntry) {
                return element.task;
            }
            else if (element instanceof TaskGroupEntry) {
                return element.getEntry().task;
            }
            return undefined;
        };
        QuickOpenActionContributor = __decorate([
            __param(0, taskService_1.ITaskService), __param(1, quickOpen_1.IQuickOpenService)
        ], QuickOpenActionContributor);
        return QuickOpenActionContributor;
    }(actions_2.ActionBarContributor));
    exports.QuickOpenActionContributor = QuickOpenActionContributor;
});
