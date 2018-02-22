define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/types", "vs/base/common/objects", "vs/platform/extensions/common/extensionsRegistry"], function (require, exports, nls, winjs_base_1, Types, Objects, extensionsRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var taskDefinitionSchema = {
        type: 'object',
        additionalProperties: false,
        properties: {
            type: {
                type: 'string',
                description: nls.localize('TaskDefinition.description', 'The actual task type')
            },
            required: {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            properties: {
                type: 'object',
                description: nls.localize('TaskDefinition.properties', 'Additional properties of the task type'),
                additionalProperties: {
                    $ref: 'http://json-schema.org/draft-04/schema#'
                }
            }
        }
    };
    var Configuration;
    (function (Configuration) {
        function from(value, extensionId, messageCollector) {
            if (!value) {
                return undefined;
            }
            var taskType = Types.isString(value.type) ? value.type : undefined;
            if (!taskType || taskType.length === 0) {
                messageCollector.error(nls.localize('TaskTypeConfiguration.noType', 'The task type configuration is missing the required \'taskType\' property'));
                return undefined;
            }
            var required = [];
            if (Array.isArray(value.required)) {
                for (var _i = 0, _a = value.required; _i < _a.length; _i++) {
                    var element = _a[_i];
                    if (Types.isString(element)) {
                        required.push(element);
                    }
                }
            }
            return { extensionId: extensionId, taskType: taskType, required: required.length >= 0 ? required : undefined, properties: value.properties ? Objects.deepClone(value.properties) : undefined };
        }
        Configuration.from = from;
    })(Configuration || (Configuration = {}));
    var taskDefinitionsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint('taskDefinitions', [], {
        description: nls.localize('TaskDefinitionExtPoint', 'Contributes task kinds'),
        type: 'array',
        items: taskDefinitionSchema
    });
    var TaskDefinitionRegistryImpl = /** @class */ (function () {
        function TaskDefinitionRegistryImpl() {
            var _this = this;
            this.taskTypes = Object.create(null);
            this.readyPromise = new winjs_base_1.TPromise(function (resolve, reject) {
                taskDefinitionsExtPoint.setHandler(function (extensions) {
                    try {
                        for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
                            var extension = extensions_1[_i];
                            var taskTypes = extension.value;
                            for (var _a = 0, taskTypes_1 = taskTypes; _a < taskTypes_1.length; _a++) {
                                var taskType = taskTypes_1[_a];
                                var type = Configuration.from(taskType, extension.description.id, extension.collector);
                                if (type) {
                                    _this.taskTypes[type.taskType] = type;
                                }
                            }
                        }
                    }
                    catch (error) {
                    }
                    resolve(undefined);
                });
            });
        }
        TaskDefinitionRegistryImpl.prototype.onReady = function () {
            return this.readyPromise;
        };
        TaskDefinitionRegistryImpl.prototype.get = function (key) {
            return this.taskTypes[key];
        };
        TaskDefinitionRegistryImpl.prototype.all = function () {
            var _this = this;
            return Object.keys(this.taskTypes).map(function (key) { return _this.taskTypes[key]; });
        };
        return TaskDefinitionRegistryImpl;
    }());
    exports.TaskDefinitionRegistry = new TaskDefinitionRegistryImpl();
});
