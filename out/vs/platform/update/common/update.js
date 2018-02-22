/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Updates are run as a state machine:
     *
     *      Uninitialized
     *           ↓
     *          Idle
     *          ↓  ↑
     *   Checking for Updates  →  Available for Download
     *         ↓
     *     Downloading  →   Ready
     *         ↓               ↑
     *     Downloaded   →  Updating
     *
     * Available: There is an update available for download (linux).
     * Ready: Code will be updated as soon as it restarts (win32, darwin).
     * Donwloaded: There is an update ready to be installed in the background (win32).
     */
    var StateType;
    (function (StateType) {
        StateType["Uninitialized"] = "uninitialized";
        StateType["Idle"] = "idle";
        StateType["CheckingForUpdates"] = "checking for updates";
        StateType["AvailableForDownload"] = "available for download";
        StateType["Downloading"] = "downloading";
        StateType["Downloaded"] = "downloaded";
        StateType["Updating"] = "updating";
        StateType["Ready"] = "ready";
    })(StateType = exports.StateType || (exports.StateType = {}));
    exports.State = {
        Uninitialized: { type: StateType.Uninitialized },
        Idle: { type: StateType.Idle },
        CheckingForUpdates: function (explicit) { return ({ type: StateType.CheckingForUpdates, explicit: explicit }); },
        AvailableForDownload: function (update) { return ({ type: StateType.AvailableForDownload, update: update }); },
        Downloading: function (update) { return ({ type: StateType.Downloading, update: update }); },
        Downloaded: function (update) { return ({ type: StateType.Downloaded, update: update }); },
        Updating: function (update) { return ({ type: StateType.Updating, update: update }); },
        Ready: function (update) { return ({ type: StateType.Ready, update: update }); },
    };
    exports.IUpdateService = instantiation_1.createDecorator('updateService');
});
