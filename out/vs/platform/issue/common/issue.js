/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IIssueService = instantiation_1.createDecorator('issueService');
    var IssueType;
    (function (IssueType) {
        IssueType[IssueType["Bug"] = 0] = "Bug";
        IssueType[IssueType["PerformanceIssue"] = 1] = "PerformanceIssue";
        IssueType[IssueType["FeatureRequest"] = 2] = "FeatureRequest";
        IssueType[IssueType["SettingsSearchIssue"] = 3] = "SettingsSearchIssue";
    })(IssueType = exports.IssueType || (exports.IssueType = {}));
});
