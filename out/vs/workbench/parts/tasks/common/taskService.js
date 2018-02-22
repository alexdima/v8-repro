define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/tasks/common/tasks"], function (require, exports, instantiation_1, tasks_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Task = tasks_1.Task;
    exports.ITaskService = instantiation_1.createDecorator('taskService');
});
