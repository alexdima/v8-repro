define(["require", "exports", "vs/editor/common/core/lineTokens", "vs/editor/common/modes/supports"], function (require, exports, lineTokens_1, supports_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createFakeScopedLineTokens(rawTokens) {
        var tokens = new Uint32Array(rawTokens.length << 1);
        var line = '';
        for (var i = 0, len = rawTokens.length; i < len; i++) {
            var rawToken = rawTokens[i];
            var startOffset = line.length;
            var metadata = ((rawToken.type << 8 /* TOKEN_TYPE_OFFSET */)) >>> 0;
            tokens[(i << 1)] = startOffset;
            tokens[(i << 1) + 1] = metadata;
            line += rawToken.text;
        }
        lineTokens_1.LineTokens.convertToEndOffset(tokens, line.length);
        return supports_1.createScopedLineTokens(new lineTokens_1.LineTokens(tokens, line), 0);
    }
    exports.createFakeScopedLineTokens = createFakeScopedLineTokens;
});
