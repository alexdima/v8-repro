define(["require", "exports", "vs/nls", "./json"], function (require, exports, nls_1, json_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getParseErrorMessage(errorCode) {
        switch (errorCode) {
            case json_1.ParseErrorCode.InvalidSymbol: return nls_1.localize('error.invalidSymbol', 'Invalid symbol');
            case json_1.ParseErrorCode.InvalidNumberFormat: return nls_1.localize('error.invalidNumberFormat', 'Invalid number format');
            case json_1.ParseErrorCode.PropertyNameExpected: return nls_1.localize('error.propertyNameExpected', 'Property name expected');
            case json_1.ParseErrorCode.ValueExpected: return nls_1.localize('error.valueExpected', 'Value expected');
            case json_1.ParseErrorCode.ColonExpected: return nls_1.localize('error.colonExpected', 'Colon expected');
            case json_1.ParseErrorCode.CommaExpected: return nls_1.localize('error.commaExpected', 'Comma expected');
            case json_1.ParseErrorCode.CloseBraceExpected: return nls_1.localize('error.closeBraceExpected', 'Closing brace expected');
            case json_1.ParseErrorCode.CloseBracketExpected: return nls_1.localize('error.closeBracketExpected', 'Closing bracket expected');
            case json_1.ParseErrorCode.EndOfFileExpected: return nls_1.localize('error.endOfFileExpected', 'End of file expected');
            default:
                return '';
        }
    }
    exports.getParseErrorMessage = getParseErrorMessage;
});
