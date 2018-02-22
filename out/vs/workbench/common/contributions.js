define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, platform_1, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Extensions;
    (function (Extensions) {
        Extensions.Workbench = 'workbench.contributions.kind';
    })(Extensions = exports.Extensions || (exports.Extensions = {}));
    var WorkbenchContributionsRegistry = /** @class */ (function () {
        function WorkbenchContributionsRegistry() {
            this.toBeInstantiated = new Map();
        }
        WorkbenchContributionsRegistry.prototype.registerWorkbenchContribution = function (ctor, phase) {
            if (phase === void 0) { phase = lifecycle_1.LifecyclePhase.Starting; }
            // Instantiate directly if we are already matching the provided phase
            if (this.instantiationService && this.lifecycleService && this.lifecycleService.phase >= phase) {
                this.instantiationService.createInstance(ctor);
            }
            else {
                var toBeInstantiated = this.toBeInstantiated.get(phase);
                if (!toBeInstantiated) {
                    toBeInstantiated = [];
                    this.toBeInstantiated.set(phase, toBeInstantiated);
                }
                toBeInstantiated.push(ctor);
            }
        };
        WorkbenchContributionsRegistry.prototype.start = function (instantiationService, lifecycleService) {
            var _this = this;
            this.instantiationService = instantiationService;
            this.lifecycleService = lifecycleService;
            [lifecycle_1.LifecyclePhase.Starting, lifecycle_1.LifecyclePhase.Restoring, lifecycle_1.LifecyclePhase.Running, lifecycle_1.LifecyclePhase.Eventually].forEach(function (phase) {
                _this.instantiateByPhase(instantiationService, lifecycleService, phase);
            });
        };
        WorkbenchContributionsRegistry.prototype.instantiateByPhase = function (instantiationService, lifecycleService, phase) {
            var _this = this;
            // Instantiate contributions directly when phase is already reached
            if (lifecycleService.phase >= phase) {
                this.doInstantiateByPhase(instantiationService, phase);
            }
            else {
                lifecycleService.when(phase).then(function () {
                    _this.doInstantiateByPhase(instantiationService, phase);
                });
            }
        };
        WorkbenchContributionsRegistry.prototype.doInstantiateByPhase = function (instantiationService, phase) {
            var toBeInstantiated = this.toBeInstantiated.get(phase);
            if (toBeInstantiated) {
                while (toBeInstantiated.length > 0) {
                    instantiationService.createInstance(toBeInstantiated.shift());
                }
            }
        };
        return WorkbenchContributionsRegistry;
    }());
    exports.WorkbenchContributionsRegistry = WorkbenchContributionsRegistry;
    platform_1.Registry.add(Extensions.Workbench, new WorkbenchContributionsRegistry());
});
