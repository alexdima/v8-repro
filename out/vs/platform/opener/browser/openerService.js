var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/winjs.base", "vs/platform/editor/common/editor", "vs/base/common/paths", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, dom, marshalling_1, network_1, winjs_base_1, editor_1, paths_1, commands_1, telemetry_1, instantiation_1, telemetryUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var OpenerService = /** @class */ (function () {
        function OpenerService(_editorService, _commandService, _telemetryService) {
            if (_telemetryService === void 0) { _telemetryService = telemetryUtils_1.NullTelemetryService; }
            this._editorService = _editorService;
            this._commandService = _commandService;
            this._telemetryService = _telemetryService;
            //
        }
        OpenerService.prototype.open = function (resource, options) {
            /* __GDPR__
                "openerService" : {
                    "scheme" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this._telemetryService.publicLog('openerService', { scheme: resource.scheme });
            var scheme = resource.scheme, path = resource.path, query = resource.query, fragment = resource.fragment;
            var promise = winjs_base_1.TPromise.wrap(void 0);
            if (scheme === network_1.Schemas.http || scheme === network_1.Schemas.https || scheme === network_1.Schemas.mailto) {
                // open http or default mail application
                dom.windowOpenNoOpener(resource.toString(true));
            }
            else if (scheme === 'command' && commands_1.CommandsRegistry.getCommand(path)) {
                // execute as command
                var args = [];
                try {
                    args = marshalling_1.parse(query);
                    if (!Array.isArray(args)) {
                        args = [args];
                    }
                }
                catch (e) {
                    //
                }
                promise = (_a = this._commandService).executeCommand.apply(_a, [path].concat(args));
            }
            else {
                var selection = void 0;
                var match = /^L?(\d+)(?:,(\d+))?/.exec(fragment);
                if (match) {
                    // support file:///some/file.js#73,84
                    // support file:///some/file.js#L73
                    selection = {
                        startLineNumber: parseInt(match[1]),
                        startColumn: match[2] ? parseInt(match[2]) : 1
                    };
                    // remove fragment
                    resource = resource.with({ fragment: '' });
                }
                if (!resource.scheme) {
                    // we cannot handle those
                    return winjs_base_1.TPromise.as(undefined);
                }
                else if (resource.scheme === network_1.Schemas.file) {
                    resource = resource.with({ path: paths_1.normalize(resource.path) }); // workaround for non-normalized paths (https://github.com/Microsoft/vscode/issues/12954)
                }
                promise = this._editorService.openEditor({ resource: resource, options: { selection: selection, } }, options && options.openToSide);
            }
            return promise;
            var _a;
        };
        OpenerService = __decorate([
            __param(0, editor_1.IEditorService),
            __param(1, commands_1.ICommandService),
            __param(2, instantiation_1.optional(telemetry_1.ITelemetryService))
        ], OpenerService);
        return OpenerService;
    }());
    exports.OpenerService = OpenerService;
});
