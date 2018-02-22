define(["require", "exports", "vs/base/common/types", "vs/base/common/objects"], function (require, exports, Types, Objects) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var RevealKind;
    (function (RevealKind) {
        /**
         * Always brings the terminal to front if the task is executed.
         */
        RevealKind[RevealKind["Always"] = 1] = "Always";
        /**
         * Only brings the terminal to front if a problem is detected executing the task
         * (e.g. the task couldn't be started because).
         */
        RevealKind[RevealKind["Silent"] = 2] = "Silent";
        /**
         * The terminal never comes to front when the task is executed.
         */
        RevealKind[RevealKind["Never"] = 3] = "Never";
    })(RevealKind = exports.RevealKind || (exports.RevealKind = {}));
    (function (RevealKind) {
        function fromString(value) {
            switch (value.toLowerCase()) {
                case 'always':
                    return RevealKind.Always;
                case 'silent':
                    return RevealKind.Silent;
                case 'never':
                    return RevealKind.Never;
                default:
                    return RevealKind.Always;
            }
        }
        RevealKind.fromString = fromString;
    })(RevealKind = exports.RevealKind || (exports.RevealKind = {}));
    var PanelKind;
    (function (PanelKind) {
        /**
         * Shares a panel with other tasks. This is the default.
         */
        PanelKind[PanelKind["Shared"] = 1] = "Shared";
        /**
         * Uses a dedicated panel for this tasks. The panel is not
         * shared with other tasks.
         */
        PanelKind[PanelKind["Dedicated"] = 2] = "Dedicated";
        /**
         * Creates a new panel whenever this task is executed.
         */
        PanelKind[PanelKind["New"] = 3] = "New";
    })(PanelKind = exports.PanelKind || (exports.PanelKind = {}));
    (function (PanelKind) {
        function fromString(value) {
            switch (value.toLowerCase()) {
                case 'shared':
                    return PanelKind.Shared;
                case 'dedicated':
                    return PanelKind.Dedicated;
                case 'new':
                    return PanelKind.New;
                default:
                    return PanelKind.Shared;
            }
        }
        PanelKind.fromString = fromString;
    })(PanelKind = exports.PanelKind || (exports.PanelKind = {}));
    var RuntimeType;
    (function (RuntimeType) {
        RuntimeType[RuntimeType["Shell"] = 1] = "Shell";
        RuntimeType[RuntimeType["Process"] = 2] = "Process";
    })(RuntimeType = exports.RuntimeType || (exports.RuntimeType = {}));
    (function (RuntimeType) {
        function fromString(value) {
            switch (value.toLowerCase()) {
                case 'shell':
                    return RuntimeType.Shell;
                case 'process':
                    return RuntimeType.Process;
                default:
                    return RuntimeType.Process;
            }
        }
        RuntimeType.fromString = fromString;
    })(RuntimeType = exports.RuntimeType || (exports.RuntimeType = {}));
    var TaskGroup;
    (function (TaskGroup) {
        TaskGroup.Clean = 'clean';
        TaskGroup.Build = 'build';
        TaskGroup.Rebuild = 'rebuild';
        TaskGroup.Test = 'test';
        function is(value) {
            return value === TaskGroup.Clean || value === TaskGroup.Build || value === TaskGroup.Rebuild || value === TaskGroup.Test;
        }
        TaskGroup.is = is;
    })(TaskGroup = exports.TaskGroup || (exports.TaskGroup = {}));
    var TaskScope;
    (function (TaskScope) {
        TaskScope[TaskScope["Global"] = 1] = "Global";
        TaskScope[TaskScope["Workspace"] = 2] = "Workspace";
        TaskScope[TaskScope["Folder"] = 3] = "Folder";
    })(TaskScope = exports.TaskScope || (exports.TaskScope = {}));
    var TaskSourceKind;
    (function (TaskSourceKind) {
        TaskSourceKind.Workspace = 'workspace';
        TaskSourceKind.Extension = 'extension';
        TaskSourceKind.InMemory = 'inMemory';
    })(TaskSourceKind = exports.TaskSourceKind || (exports.TaskSourceKind = {}));
    var GroupType;
    (function (GroupType) {
        GroupType["default"] = "default";
        GroupType["user"] = "user";
    })(GroupType = exports.GroupType || (exports.GroupType = {}));
    var CustomTask;
    (function (CustomTask) {
        function is(value) {
            var candidate = value;
            return candidate && candidate.type === 'custom';
        }
        CustomTask.is = is;
    })(CustomTask = exports.CustomTask || (exports.CustomTask = {}));
    var ConfiguringTask;
    (function (ConfiguringTask) {
        function is(value) {
            var candidate = value;
            return candidate && candidate.configures && Types.isString(candidate.configures.type) && value.command === void 0;
        }
        ConfiguringTask.is = is;
    })(ConfiguringTask = exports.ConfiguringTask || (exports.ConfiguringTask = {}));
    var ContributedTask;
    (function (ContributedTask) {
        function is(value) {
            var candidate = value;
            return candidate && candidate.defines && Types.isString(candidate.defines.type) && candidate.command !== void 0;
        }
        ContributedTask.is = is;
    })(ContributedTask = exports.ContributedTask || (exports.ContributedTask = {}));
    var InMemoryTask;
    (function (InMemoryTask) {
        function is(value) {
            var candidate = value;
            return candidate && candidate._source && candidate._source.kind === TaskSourceKind.InMemory;
        }
        InMemoryTask.is = is;
    })(InMemoryTask = exports.InMemoryTask || (exports.InMemoryTask = {}));
    var Task;
    (function (Task) {
        function getRecentlyUsedKey(task) {
            if (InMemoryTask.is(task)) {
                return undefined;
            }
            if (CustomTask.is(task)) {
                var workspaceFolder = task._source.config.workspaceFolder;
                if (!workspaceFolder) {
                    return undefined;
                }
                var key = { type: 'custom', folder: workspaceFolder.uri.toString(), id: task.identifier };
                return JSON.stringify(key);
            }
            if (ContributedTask.is(task)) {
                var key = { type: 'contributed', scope: task._source.scope, id: task._id };
                if (task._source.scope === TaskScope.Folder && task._source.workspaceFolder) {
                    key.folder = task._source.workspaceFolder.uri.toString();
                }
                return JSON.stringify(key);
            }
            return undefined;
        }
        Task.getRecentlyUsedKey = getRecentlyUsedKey;
        function getMapKey(task) {
            if (CustomTask.is(task)) {
                var workspaceFolder = task._source.config.workspaceFolder;
                return workspaceFolder ? workspaceFolder.uri.toString() + "|" + task._id : task._id;
            }
            else if (ContributedTask.is(task)) {
                var workspaceFolder = task._source.workspaceFolder;
                return workspaceFolder
                    ? task._source.scope.toString() + "|" + workspaceFolder.uri.toString() + "|" + task._id
                    : task._source.scope.toString() + "|" + task._id;
            }
            else {
                return task._id;
            }
        }
        Task.getMapKey = getMapKey;
        function getWorkspaceFolder(task) {
            if (CustomTask.is(task)) {
                return task._source.config.workspaceFolder;
            }
            else if (ContributedTask.is(task)) {
                return task._source.workspaceFolder;
            }
            else {
                return undefined;
            }
        }
        Task.getWorkspaceFolder = getWorkspaceFolder;
        function clone(task) {
            return Objects.assign({}, task);
        }
        Task.clone = clone;
        function getTelemetryKind(task) {
            if (ContributedTask.is(task)) {
                return 'extension';
            }
            else if (CustomTask.is(task)) {
                if (task._source.customizes) {
                    return 'workspace>extension';
                }
                else {
                    return 'workspace';
                }
            }
            else if (InMemoryTask.is(task)) {
                return 'composite';
            }
            else {
                return 'unknown';
            }
        }
        Task.getTelemetryKind = getTelemetryKind;
        function matches(task, alias) {
            return alias === task._label || alias === task.identifier;
        }
        Task.matches = matches;
        function getQualifiedLabel(task) {
            var workspaceFolder = getWorkspaceFolder(task);
            if (workspaceFolder) {
                return task._label + " (" + workspaceFolder.name + ")";
            }
            else {
                return task._label;
            }
        }
        Task.getQualifiedLabel = getQualifiedLabel;
    })(Task = exports.Task || (exports.Task = {}));
    var ExecutionEngine;
    (function (ExecutionEngine) {
        ExecutionEngine[ExecutionEngine["Process"] = 1] = "Process";
        ExecutionEngine[ExecutionEngine["Terminal"] = 2] = "Terminal";
    })(ExecutionEngine = exports.ExecutionEngine || (exports.ExecutionEngine = {}));
    (function (ExecutionEngine) {
        ExecutionEngine._default = ExecutionEngine.Terminal;
    })(ExecutionEngine = exports.ExecutionEngine || (exports.ExecutionEngine = {}));
    var JsonSchemaVersion;
    (function (JsonSchemaVersion) {
        JsonSchemaVersion[JsonSchemaVersion["V0_1_0"] = 1] = "V0_1_0";
        JsonSchemaVersion[JsonSchemaVersion["V2_0_0"] = 2] = "V2_0_0";
    })(JsonSchemaVersion = exports.JsonSchemaVersion || (exports.JsonSchemaVersion = {}));
    var TaskSorter = /** @class */ (function () {
        function TaskSorter(workspaceFolders) {
            this._order = new Map();
            for (var i = 0; i < workspaceFolders.length; i++) {
                this._order.set(workspaceFolders[i].uri.toString(), i);
            }
        }
        TaskSorter.prototype.compare = function (a, b) {
            var aw = Task.getWorkspaceFolder(a);
            var bw = Task.getWorkspaceFolder(b);
            if (aw && bw) {
                var ai = this._order.get(aw.uri.toString());
                ai = ai === void 0 ? 0 : ai + 1;
                var bi = this._order.get(bw.uri.toString());
                bi = bi === void 0 ? 0 : bi + 1;
                if (ai === bi) {
                    return a._label.localeCompare(b._label);
                }
                else {
                    return ai - bi;
                }
            }
            else if (!aw && bw) {
                return -1;
            }
            else if (aw && !bw) {
                return +1;
            }
            else {
                return 0;
            }
        };
        return TaskSorter;
    }());
    exports.TaskSorter = TaskSorter;
    var TaskEventKind;
    (function (TaskEventKind) {
        TaskEventKind["Active"] = "active";
        TaskEventKind["Inactive"] = "inactive";
        TaskEventKind["Terminated"] = "terminated";
        TaskEventKind["Changed"] = "changed";
    })(TaskEventKind = exports.TaskEventKind || (exports.TaskEventKind = {}));
    var TaskRunType;
    (function (TaskRunType) {
        TaskRunType["SingleRun"] = "singleRun";
        TaskRunType["Background"] = "background";
    })(TaskRunType = exports.TaskRunType || (exports.TaskRunType = {}));
    var TaskEvent;
    (function (TaskEvent) {
        function create(kind, task) {
            if (task) {
                return Object.freeze({
                    kind: kind,
                    taskId: task._id,
                    taskName: task.name,
                    runType: task.isBackground ? TaskRunType.Background : TaskRunType.SingleRun,
                    group: task.group,
                    __task: task,
                });
            }
            else {
                return Object.freeze({ kind: TaskEventKind.Changed });
            }
        }
        TaskEvent.create = create;
    })(TaskEvent = exports.TaskEvent || (exports.TaskEvent = {}));
});
