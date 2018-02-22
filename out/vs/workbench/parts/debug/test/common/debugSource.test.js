/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/parts/debug/common/debugSource"], function (require, exports, assert, uri_1, debugSource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Source', function () {
        test('from raw source', function () {
            var source = new debugSource_1.Source({
                name: 'zz',
                path: '/xx/yy/zz',
                sourceReference: 0,
                presentationHint: 'emphasize'
            }, 'aDebugSessionId');
            assert.equal(source.presentationHint, 'emphasize');
            assert.equal(source.name, 'zz');
            assert.equal(source.inMemory, false);
            assert.equal(source.reference, 0);
            assert.equal(source.uri.toString(), uri_1.default.file('/xx/yy/zz').toString());
        });
        test('from raw internal source', function () {
            var source = new debugSource_1.Source({
                name: 'internalModule.js',
                sourceReference: 11,
                presentationHint: 'deemphasize'
            }, 'aDebugSessionId');
            assert.equal(source.presentationHint, 'deemphasize');
            assert.equal(source.name, 'internalModule.js');
            assert.equal(source.inMemory, true);
            assert.equal(source.reference, 11);
            assert.equal(source.uri.toString(), 'debug:internalModule.js?session%3DaDebugSessionId%26ref%3D11');
        });
    });
});
