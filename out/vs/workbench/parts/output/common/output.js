define(["require", "exports", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey"], function (require, exports, event_1, platform_1, instantiation_1, contextkey_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Mime type used by the output editor.
     */
    exports.OUTPUT_MIME = 'text/x-code-output';
    /**
     * Output resource scheme.
     */
    exports.OUTPUT_SCHEME = 'output';
    /**
     * Output resource scheme.
     */
    exports.LOG_SCHEME = 'log';
    /**
     * Id used by the output editor.
     */
    exports.OUTPUT_MODE_ID = 'Log';
    /**
     * Output panel id
     */
    exports.OUTPUT_PANEL_ID = 'workbench.panel.output';
    /**
     * Open log viewer command id
     */
    exports.COMMAND_OPEN_LOG_VIEWER = 'workbench.action.openLogViewer';
    exports.Extensions = {
        OutputChannels: 'workbench.contributions.outputChannels'
    };
    exports.OUTPUT_SERVICE_ID = 'outputService';
    exports.MAX_OUTPUT_LENGTH = 10000 /* Max. number of output lines to show in output */ * 100 /* Guestimated chars per line */;
    exports.CONTEXT_IN_OUTPUT = new contextkey_1.RawContextKey('inOutput', false);
    exports.IOutputService = instantiation_1.createDecorator(exports.OUTPUT_SERVICE_ID);
    var OutputChannelRegistry = /** @class */ (function () {
        function OutputChannelRegistry() {
            this.channels = new Map();
            this._onDidRegisterChannel = new event_1.Emitter();
            this.onDidRegisterChannel = this._onDidRegisterChannel.event;
            this._onDidRemoveChannel = new event_1.Emitter();
            this.onDidRemoveChannel = this._onDidRemoveChannel.event;
        }
        OutputChannelRegistry.prototype.registerChannel = function (id, label, file) {
            if (!this.channels.has(id)) {
                this.channels.set(id, { id: id, label: label, file: file });
                this._onDidRegisterChannel.fire(id);
            }
        };
        OutputChannelRegistry.prototype.getChannels = function () {
            var result = [];
            this.channels.forEach(function (value) { return result.push(value); });
            return result;
        };
        OutputChannelRegistry.prototype.getChannel = function (id) {
            return this.channels.get(id);
        };
        OutputChannelRegistry.prototype.removeChannel = function (id) {
            this.channels.delete(id);
            this._onDidRemoveChannel.fire(id);
        };
        return OutputChannelRegistry;
    }());
    platform_1.Registry.add(exports.Extensions.OutputChannels, new OutputChannelRegistry());
});
