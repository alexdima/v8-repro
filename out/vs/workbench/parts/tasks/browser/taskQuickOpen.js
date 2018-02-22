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
define(["require", "exports", "vs/nls", "vs/base/parts/quickopen/common/quickOpen", "vs/platform/quickOpen/common/quickOpen", "vs/workbench/parts/tasks/common/tasks", "vs/workbench/parts/tasks/common/taskService", "vs/platform/extensions/common/extensions", "./quickOpen"], function (require, exports, nls, QuickOpen, quickOpen_1, tasks_1, taskService_1, extensions_1, base) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TaskEntry = /** @class */ (function (_super) {
        __extends(TaskEntry, _super);
        function TaskEntry(quickOpenService, taskService, task, highlights) {
            if (highlights === void 0) { highlights = []; }
            return _super.call(this, quickOpenService, taskService, task, highlights) || this;
        }
        TaskEntry.prototype.run = function (mode, context) {
            if (mode === QuickOpen.Mode.PREVIEW) {
                return false;
            }
            var task = this._task;
            return this.doRun(task, { attachProblemMatcher: true });
        };
        return TaskEntry;
    }(base.TaskEntry));
    var QuickOpenHandler = /** @class */ (function (_super) {
        __extends(QuickOpenHandler, _super);
        function QuickOpenHandler(quickOpenService, extensionService, taskService) {
            var _this = _super.call(this, quickOpenService, taskService) || this;
            _this.activationPromise = extensionService.activateByEvent('onCommand:workbench.action.tasks.runTask');
            return _this;
        }
        QuickOpenHandler.prototype.getAriaLabel = function () {
            return nls.localize('tasksAriaLabel', "Type the name of a task to run");
        };
        QuickOpenHandler.prototype.getTasks = function () {
            var _this = this;
            return this.activationPromise.then(function () {
                return _this.taskService.tasks().then(function (tasks) { return tasks.filter(function (task) { return tasks_1.ContributedTask.is(task) || tasks_1.CustomTask.is(task); }); });
            });
        };
        QuickOpenHandler.prototype.createEntry = function (task, highlights) {
            return new TaskEntry(this.quickOpenService, this.taskService, task, highlights);
        };
        QuickOpenHandler.prototype.getEmptyLabel = function (searchString) {
            if (searchString.length > 0) {
                return nls.localize('noTasksMatching', "No tasks matching");
            }
            return nls.localize('noTasksFound', "No tasks found");
        };
        QuickOpenHandler.ID = 'workbench.picker.tasks';
        QuickOpenHandler = __decorate([
            __param(0, quickOpen_1.IQuickOpenService),
            __param(1, extensions_1.IExtensionService),
            __param(2, taskService_1.ITaskService)
        ], QuickOpenHandler);
        return QuickOpenHandler;
    }(base.QuickOpenHandler));
    exports.QuickOpenHandler = QuickOpenHandler;
});
