define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/editor/contrib/referenceSearch/referencesModel"], function (require, exports, assert, uri_1, range_1, position_1, referencesModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('references', function () {
        test('nearestReference', function () {
            var model = new referencesModel_1.ReferencesModel([{
                    uri: uri_1.default.file('/out/obj/can'),
                    range: new range_1.Range(1, 1, 1, 1)
                }, {
                    uri: uri_1.default.file('/out/obj/can2'),
                    range: new range_1.Range(1, 1, 1, 1)
                }, {
                    uri: uri_1.default.file('/src/can'),
                    range: new range_1.Range(1, 1, 1, 1)
                }]);
            var ref = model.nearestReference(uri_1.default.file('/src/can'), new position_1.Position(1, 1));
            assert.equal(ref.uri.path, '/src/can');
            ref = model.nearestReference(uri_1.default.file('/src/someOtherFileInSrc'), new position_1.Position(1, 1));
            assert.equal(ref.uri.path, '/src/can');
            ref = model.nearestReference(uri_1.default.file('/out/someOtherFile'), new position_1.Position(1, 1));
            assert.equal(ref.uri.path, '/out/obj/can');
            ref = model.nearestReference(uri_1.default.file('/out/obj/can2222'), new position_1.Position(1, 1));
            assert.equal(ref.uri.path, '/out/obj/can2');
        });
    });
});
