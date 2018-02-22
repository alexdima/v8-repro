/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/node/product", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, nls, product_1, platform_1, configurationRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'update',
        'order': 15,
        'title': nls.localize('updateConfigurationTitle', "Update"),
        'type': 'object',
        'properties': {
            'update.channel': {
                'type': 'string',
                'enum': ['none', 'default'],
                'default': 'default',
                'description': nls.localize('updateChannel', "Configure whether you receive automatic updates from an update channel. Requires a restart after change.")
            },
            'update.enableWindowsBackgroundUpdates': {
                'type': 'boolean',
                'default': product_1.default.quality === 'insider',
                'description': nls.localize('enableWindowsBackgroundUpdates', "Enables Windows background updates.")
            }
        }
    });
});
