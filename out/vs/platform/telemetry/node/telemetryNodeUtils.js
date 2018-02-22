define(["require", "exports", "vs/base/common/winjs.base", "vs/platform/node/product"], function (require, exports, winjs_base_1, product_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function addGAParameters(telemetryService, environmentService, uri, origin, experiment) {
        if (experiment === void 0) { experiment = '1'; }
        if (environmentService.isBuilt && !environmentService.isExtensionDevelopment && !environmentService.args['disable-telemetry'] && !!product_1.default.enableTelemetry) {
            if (uri.scheme === 'https' && uri.authority === 'code.visualstudio.com') {
                return telemetryService.getTelemetryInfo()
                    .then(function (info) {
                    return uri.with({ query: (uri.query ? uri.query + '&' : '') + "utm_source=VsCode&utm_medium=" + encodeURIComponent(origin) + "&utm_campaign=" + encodeURIComponent(info.instanceId) + "&utm_content=" + encodeURIComponent(experiment) });
                });
            }
        }
        return winjs_base_1.TPromise.as(uri);
    }
    exports.addGAParameters = addGAParameters;
});
