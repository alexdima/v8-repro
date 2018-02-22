/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IWindowsService = instantiation_1.createDecorator('windowsService');
    exports.IWindowService = instantiation_1.createDecorator('windowService');
    var OpenContext;
    (function (OpenContext) {
        // opening when running from the command line
        OpenContext[OpenContext["CLI"] = 0] = "CLI";
        // macOS only: opening from the dock (also when opening files to a running instance from desktop)
        OpenContext[OpenContext["DOCK"] = 1] = "DOCK";
        // opening from the main application window
        OpenContext[OpenContext["MENU"] = 2] = "MENU";
        // opening from a file or folder dialog
        OpenContext[OpenContext["DIALOG"] = 3] = "DIALOG";
        // opening from the OS's UI
        OpenContext[OpenContext["DESKTOP"] = 4] = "DESKTOP";
        // opening through the API
        OpenContext[OpenContext["API"] = 5] = "API";
    })(OpenContext = exports.OpenContext || (exports.OpenContext = {}));
    var ReadyState;
    (function (ReadyState) {
        /**
         * This window has not loaded any HTML yet
         */
        ReadyState[ReadyState["NONE"] = 0] = "NONE";
        /**
         * This window is loading HTML
         */
        ReadyState[ReadyState["LOADING"] = 1] = "LOADING";
        /**
         * This window is navigating to another HTML
         */
        ReadyState[ReadyState["NAVIGATING"] = 2] = "NAVIGATING";
        /**
         * This window is done loading HTML
         */
        ReadyState[ReadyState["READY"] = 3] = "READY";
    })(ReadyState = exports.ReadyState || (exports.ReadyState = {}));
});
