define(["require", "exports", "vs/base/common/severity", "vs/platform/instantiation/common/instantiation"], function (require, exports, severity_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var IMarkerData;
    (function (IMarkerData) {
        var emptyString = '';
        function makeKey(markerData) {
            var result = [emptyString];
            if (markerData.source) {
                result.push(markerData.source.replace('¦', '\¦'));
            }
            else {
                result.push(emptyString);
            }
            if (markerData.code) {
                result.push(markerData.code.replace('¦', '\¦'));
            }
            else {
                result.push(emptyString);
            }
            if (markerData.severity !== void 0 && markerData.severity !== null) {
                result.push(severity_1.default.toString(markerData.severity));
            }
            else {
                result.push(emptyString);
            }
            if (markerData.message) {
                result.push(markerData.message.replace('¦', '\¦'));
            }
            else {
                result.push(emptyString);
            }
            if (markerData.startLineNumber !== void 0 && markerData.startLineNumber !== null) {
                result.push(markerData.startLineNumber.toString());
            }
            else {
                result.push(emptyString);
            }
            if (markerData.startColumn !== void 0 && markerData.startColumn !== null) {
                result.push(markerData.startColumn.toString());
            }
            else {
                result.push(emptyString);
            }
            if (markerData.endLineNumber !== void 0 && markerData.endLineNumber !== null) {
                result.push(markerData.endLineNumber.toString());
            }
            else {
                result.push(emptyString);
            }
            if (markerData.endColumn !== void 0 && markerData.endColumn !== null) {
                result.push(markerData.endColumn.toString());
            }
            else {
                result.push(emptyString);
            }
            result.push(emptyString);
            return result.join('¦');
        }
        IMarkerData.makeKey = makeKey;
    })(IMarkerData = exports.IMarkerData || (exports.IMarkerData = {}));
    exports.IMarkerService = instantiation_1.createDecorator('markerService');
});
