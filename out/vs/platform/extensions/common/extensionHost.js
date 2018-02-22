/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Broadcast communication constants
    exports.EXTENSION_LOG_BROADCAST_CHANNEL = 'vscode:extensionLog';
    exports.EXTENSION_ATTACH_BROADCAST_CHANNEL = 'vscode:extensionAttach';
    exports.EXTENSION_TERMINATE_BROADCAST_CHANNEL = 'vscode:extensionTerminate';
    exports.EXTENSION_RELOAD_BROADCAST_CHANNEL = 'vscode:extensionReload';
    exports.EXTENSION_CLOSE_EXTHOST_BROADCAST_CHANNEL = 'vscode:extensionCloseExtensionHost';
});
