/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        MARKERS_PANEL_ID: 'workbench.panel.markers',
        MARKER_COPY_ACTION_ID: 'problems.action.copy',
        MARKER_COPY_MESSAGE_ACTION_ID: 'problems.action.copyMessage',
        MARKER_OPEN_SIDE_ACTION_ID: 'problems.action.openToSide',
        MARKER_SHOW_PANEL_ID: 'workbench.action.showErrorsWarnings',
        MarkerFocusContextKey: new contextkey_1.RawContextKey('problemFocus', true)
    };
});
