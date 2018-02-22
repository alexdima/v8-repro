/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/contrib/suggest/suggestMemory", "vs/editor/common/model/textModel", "vs/editor/contrib/suggest/test/completionModel.test"], function (require, exports, assert, suggestMemory_1, textModel_1, completionModel_test_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SuggestMemories', function () {
        var pos;
        var buffer;
        var items;
        setup(function () {
            pos = { lineNumber: 1, column: 1 };
            buffer = textModel_1.TextModel.createFromString('This is some text');
            items = [
                completionModel_test_1.createSuggestItem('foo', 0),
                completionModel_test_1.createSuggestItem('bar', 0)
            ];
        });
        test('NoMemory', function () {
            var mem = new suggestMemory_1.NoMemory();
            assert.equal(mem.select(buffer, pos, items), 0);
            assert.equal(mem.select(buffer, pos, []), 0);
            mem.memorize(buffer, pos, items[0]);
            mem.memorize(buffer, pos, null);
        });
        test('ShyMemories', function () {
            var mem = new suggestMemory_1.LRUMemory();
            mem.memorize(buffer, pos, items[1]);
            assert.equal(mem.select(buffer, pos, items), 1);
            assert.equal(mem.select(buffer, { lineNumber: 1, column: 3 }, items), 0);
            mem.memorize(buffer, pos, items[0]);
            assert.equal(mem.select(buffer, pos, items), 0);
            assert.equal(mem.select(buffer, pos, [
                completionModel_test_1.createSuggestItem('new', 0),
                completionModel_test_1.createSuggestItem('bar', 0)
            ]), 1);
            assert.equal(mem.select(buffer, pos, [
                completionModel_test_1.createSuggestItem('new1', 0),
                completionModel_test_1.createSuggestItem('new2', 0)
            ]), 0);
        });
        test('PrefixMemory', function () {
            var mem = new suggestMemory_1.PrefixMemory();
            buffer.setValue('constructor');
            var item0 = completionModel_test_1.createSuggestItem('console', 0);
            var item1 = completionModel_test_1.createSuggestItem('const', 0);
            var item2 = completionModel_test_1.createSuggestItem('constructor', 0);
            var item3 = completionModel_test_1.createSuggestItem('constant', 0);
            var items = [item0, item1, item2, item3];
            mem.memorize(buffer, { lineNumber: 1, column: 2 }, item1); // c -> const
            mem.memorize(buffer, { lineNumber: 1, column: 3 }, item0); // co -> console
            mem.memorize(buffer, { lineNumber: 1, column: 4 }, item2); // con -> constructor
            assert.equal(mem.select(buffer, { lineNumber: 1, column: 1 }, items), 0);
            assert.equal(mem.select(buffer, { lineNumber: 1, column: 2 }, items), 1);
            assert.equal(mem.select(buffer, { lineNumber: 1, column: 3 }, items), 0);
            assert.equal(mem.select(buffer, { lineNumber: 1, column: 4 }, items), 2);
            assert.equal(mem.select(buffer, { lineNumber: 1, column: 7 }, items), 2); // find substr
        });
    });
});
