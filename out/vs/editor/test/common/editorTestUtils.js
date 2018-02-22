define(["require", "exports", "vs/editor/common/model/textModel"], function (require, exports, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function withEditorModel(text, callback) {
        var model = textModel_1.TextModel.createFromString(text.join('\n'));
        callback(model);
        model.dispose();
    }
    exports.withEditorModel = withEditorModel;
});
