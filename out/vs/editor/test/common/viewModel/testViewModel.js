define(["require", "exports", "vs/editor/common/model/textModel", "vs/editor/test/common/mocks/testConfiguration", "vs/editor/common/viewModel/viewModelImpl"], function (require, exports, textModel_1, testConfiguration_1, viewModelImpl_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function testViewModel(text, options, callback) {
        var EDITOR_ID = 1;
        var configuration = new testConfiguration_1.TestConfiguration(options);
        var model = textModel_1.TextModel.createFromString(text.join('\n'));
        var viewModel = new viewModelImpl_1.ViewModel(EDITOR_ID, configuration, model, null);
        callback(viewModel, model);
        viewModel.dispose();
        model.dispose();
        configuration.dispose();
    }
    exports.testViewModel = testViewModel;
});
