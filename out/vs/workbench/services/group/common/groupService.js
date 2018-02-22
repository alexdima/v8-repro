/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var GroupArrangement;
    (function (GroupArrangement) {
        GroupArrangement[GroupArrangement["MINIMIZE_OTHERS"] = 0] = "MINIMIZE_OTHERS";
        GroupArrangement[GroupArrangement["EVEN"] = 1] = "EVEN";
    })(GroupArrangement = exports.GroupArrangement || (exports.GroupArrangement = {}));
    exports.IEditorGroupService = instantiation_1.createDecorator('editorGroupService');
});
