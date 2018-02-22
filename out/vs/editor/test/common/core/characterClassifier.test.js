define(["require", "exports", "assert", "vs/editor/common/core/characterClassifier"], function (require, exports, assert, characterClassifier_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CharacterClassifier', function () {
        test('works', function () {
            var classifier = new characterClassifier_1.CharacterClassifier(0);
            assert.equal(classifier.get(-1), 0);
            assert.equal(classifier.get(0), 0);
            assert.equal(classifier.get(97 /* a */), 0);
            assert.equal(classifier.get(98 /* b */), 0);
            assert.equal(classifier.get(122 /* z */), 0);
            assert.equal(classifier.get(255), 0);
            assert.equal(classifier.get(1000), 0);
            assert.equal(classifier.get(2000), 0);
            classifier.set(97 /* a */, 1);
            classifier.set(122 /* z */, 2);
            classifier.set(1000, 3);
            assert.equal(classifier.get(-1), 0);
            assert.equal(classifier.get(0), 0);
            assert.equal(classifier.get(97 /* a */), 1);
            assert.equal(classifier.get(98 /* b */), 0);
            assert.equal(classifier.get(122 /* z */), 2);
            assert.equal(classifier.get(255), 0);
            assert.equal(classifier.get(1000), 3);
            assert.equal(classifier.get(2000), 0);
        });
    });
});
