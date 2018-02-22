/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/markers/common/markers", "vs/workbench/services/decorations/browser/decorations", "vs/base/common/lifecycle", "vs/nls", "vs/platform/registry/common/platform", "vs/base/common/severity", "vs/editor/common/view/editorColorRegistry", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, contributions_1, markers_1, decorations_1, lifecycle_1, nls_1, platform_1, severity_1, editorColorRegistry_1, configuration_1, configurationRegistry_1, lifecycle_2) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MarkersDecorationsProvider = /** @class */ (function () {
        function MarkersDecorationsProvider(_markerService) {
            this._markerService = _markerService;
            this.label = nls_1.localize('label', "Problems");
            this.onDidChange = _markerService.onMarkerChanged;
        }
        MarkersDecorationsProvider.prototype.provideDecorations = function (resource) {
            var markers = this._markerService.read({ resource: resource });
            var first;
            for (var _i = 0, markers_2 = markers; _i < markers_2.length; _i++) {
                var marker = markers_2[_i];
                if (!first || marker.severity > first.severity) {
                    first = marker;
                }
            }
            if (!first) {
                return undefined;
            }
            return {
                weight: 100 * first.severity,
                bubble: true,
                tooltip: markers.length === 1 ? nls_1.localize('tooltip.1', "1 problem in this file") : nls_1.localize('tooltip.N', "{0} problems in this file", markers.length),
                letter: markers.length < 10 ? markers.length.toString() : '+9',
                color: first.severity === severity_1.default.Error ? editorColorRegistry_1.editorErrorForeground : editorColorRegistry_1.editorWarningForeground,
            };
        };
        return MarkersDecorationsProvider;
    }());
    var MarkersFileDecorations = /** @class */ (function () {
        function MarkersFileDecorations(_markerService, _decorationsService, _configurationService) {
            this._markerService = _markerService;
            this._decorationsService = _decorationsService;
            this._configurationService = _configurationService;
            //
            this._disposables = [
                this._configurationService.onDidChangeConfiguration(this._updateEnablement, this),
            ];
            this._updateEnablement();
        }
        MarkersFileDecorations.prototype.dispose = function () {
            lifecycle_1.dispose(this._provider);
            lifecycle_1.dispose(this._disposables);
        };
        MarkersFileDecorations.prototype._updateEnablement = function () {
            var value = this._configurationService.getValue('problems');
            if (value.decorations.enabled === this._enabled) {
                return;
            }
            this._enabled = value.decorations.enabled;
            if (this._enabled) {
                var provider = new MarkersDecorationsProvider(this._markerService);
                this._provider = this._decorationsService.registerDecorationsProvider(provider);
            }
            else if (this._provider) {
                this._enabled = value.decorations.enabled;
                this._provider.dispose();
            }
        };
        MarkersFileDecorations = __decorate([
            __param(0, markers_1.IMarkerService),
            __param(1, decorations_1.IDecorationsService),
            __param(2, configuration_1.IConfigurationService)
        ], MarkersFileDecorations);
        return MarkersFileDecorations;
    }());
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(MarkersFileDecorations, lifecycle_2.LifecyclePhase.Running);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'id': 'problems',
        'order': 101,
        'type': 'object',
        'properties': {
            'problems.decorations.enabled': {
                'description': nls_1.localize('markers.showOnFile', "Show Errors & Warnings on files and folder."),
                'type': 'boolean',
                'default': true
            }
        }
    });
});
