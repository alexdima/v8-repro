define(["require", "exports", "./contextMenuHandler", "vs/base/common/event"], function (require, exports, contextMenuHandler_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContextMenuService = /** @class */ (function () {
        function ContextMenuService(container, telemetryService, messageService, contextViewService) {
            this._onDidContextMenu = new event_1.Emitter();
            this.contextMenuHandler = new contextMenuHandler_1.ContextMenuHandler(container, contextViewService, telemetryService, messageService);
        }
        ContextMenuService.prototype.dispose = function () {
            this.contextMenuHandler.dispose();
        };
        ContextMenuService.prototype.setContainer = function (container) {
            this.contextMenuHandler.setContainer(container);
        };
        // ContextMenu
        ContextMenuService.prototype.showContextMenu = function (delegate) {
            this.contextMenuHandler.showContextMenu(delegate);
            this._onDidContextMenu.fire();
        };
        Object.defineProperty(ContextMenuService.prototype, "onDidContextMenu", {
            get: function () {
                return this._onDidContextMenu.event;
            },
            enumerable: true,
            configurable: true
        });
        return ContextMenuService;
    }());
    exports.ContextMenuService = ContextMenuService;
});
