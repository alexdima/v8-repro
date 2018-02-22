var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/base/common/objects"], function (require, exports, configuration_1, storage_1, instantiation_1, objects_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExperimentService = instantiation_1.createDecorator('experimentService');
    var ExperimentService = /** @class */ (function () {
        function ExperimentService(storageService, configurationService) {
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.experiments = {}; // Shortcut while there are no experiments.
        }
        ExperimentService.prototype.getExperiments = function () {
            if (!this.experiments) {
                this.experiments = loadExperiments(this.storageService, this.configurationService);
            }
            return this.experiments;
        };
        ExperimentService = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, configuration_1.IConfigurationService)
        ], ExperimentService);
        return ExperimentService;
    }());
    exports.ExperimentService = ExperimentService;
    function loadExperiments(storageService, configurationService) {
        var experiments = splitExperimentsRandomness(storageService);
        return applyOverrides(experiments, configurationService);
    }
    function applyOverrides(experiments, configurationService) {
        var experimentsConfig = getExperimentsOverrides(configurationService);
        Object.keys(experiments).forEach(function (key) {
            if (key in experimentsConfig) {
                experiments[key] = experimentsConfig[key];
            }
        });
        return experiments;
    }
    function splitExperimentsRandomness(storageService) {
        var random1 = getExperimentsRandomness(storageService);
        var _a = splitRandom(random1);
        // const [/* random3 */, /* deployToAzureQuickLink */] = splitRandom(random2);
        // const [random4, /* mergeQuickLinks */] = splitRandom(random3);
        // const [random5, /* enableWelcomePage */] = splitRandom(random4);
        return {};
    }
    function getExperimentsRandomness(storageService) {
        var key = 'experiments.randomness';
        var valueString = storageService.get(key);
        if (!valueString) {
            valueString = Math.random().toString();
            storageService.store(key, valueString);
        }
        return parseFloat(valueString);
    }
    function splitRandom(random) {
        var scaled = random * 2;
        var i = Math.floor(scaled);
        return [scaled - i, i === 1];
    }
    function getExperimentsOverrides(configurationService) {
        return objects_1.deepClone(configurationService.getValue('experiments')) || {};
    }
});
