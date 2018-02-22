/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/parts/extensions/common/extensionQuery"], function (require, exports, assert, extensionQuery_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Extension query', function () {
        test('parse', function () {
            var query = extensionQuery_1.Query.parse('');
            assert.equal(query.value, '');
            assert.equal(query.sortBy, '');
            query = extensionQuery_1.Query.parse('hello');
            assert.equal(query.value, 'hello');
            assert.equal(query.sortBy, '');
            query = extensionQuery_1.Query.parse('   hello world ');
            assert.equal(query.value, 'hello world');
            assert.equal(query.sortBy, '');
            query = extensionQuery_1.Query.parse('@sort');
            assert.equal(query.value, '@sort');
            assert.equal(query.sortBy, '');
            query = extensionQuery_1.Query.parse('@sort:');
            assert.equal(query.value, '@sort:');
            assert.equal(query.sortBy, '');
            query = extensionQuery_1.Query.parse('  @sort:  ');
            assert.equal(query.value, '@sort:');
            assert.equal(query.sortBy, '');
            query = extensionQuery_1.Query.parse('@sort:installs');
            assert.equal(query.value, '');
            assert.equal(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('   @sort:installs   ');
            assert.equal(query.value, '');
            assert.equal(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs-');
            assert.equal(query.value, '');
            assert.equal(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs-foo');
            assert.equal(query.value, '');
            assert.equal(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs');
            assert.equal(query.value, '');
            assert.equal(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs');
            assert.equal(query.value, '');
            assert.equal(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('vs @sort:installs');
            assert.equal(query.value, 'vs');
            assert.equal(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('vs @sort:installs code');
            assert.equal(query.value, 'vs  code');
            assert.equal(query.sortBy, 'installs');
            query = extensionQuery_1.Query.parse('@sort:installs @sort:ratings');
            assert.equal(query.value, '');
            assert.equal(query.sortBy, 'ratings');
        });
        test('toString', function () {
            var query = new extensionQuery_1.Query('hello', '');
            assert.equal(query.toString(), 'hello');
            query = new extensionQuery_1.Query('hello world', '');
            assert.equal(query.toString(), 'hello world');
            query = new extensionQuery_1.Query('  hello    ', '');
            assert.equal(query.toString(), 'hello');
            query = new extensionQuery_1.Query('', 'installs');
            assert.equal(query.toString(), '@sort:installs');
            query = new extensionQuery_1.Query('', 'installs');
            assert.equal(query.toString(), '@sort:installs');
            query = new extensionQuery_1.Query('', 'installs');
            assert.equal(query.toString(), '@sort:installs');
            query = new extensionQuery_1.Query('hello', 'installs');
            assert.equal(query.toString(), 'hello @sort:installs');
            query = new extensionQuery_1.Query('  hello      ', 'installs');
            assert.equal(query.toString(), 'hello @sort:installs');
        });
        test('isValid', function () {
            var query = new extensionQuery_1.Query('hello', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('hello world', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('  hello    ', '');
            assert(query.isValid());
            query = new extensionQuery_1.Query('', 'installs');
            assert(query.isValid());
            query = new extensionQuery_1.Query('', 'installs');
            assert(query.isValid());
            query = new extensionQuery_1.Query('', 'installs');
            assert(query.isValid());
            query = new extensionQuery_1.Query('', 'installs');
            assert(query.isValid());
            query = new extensionQuery_1.Query('hello', 'installs');
            assert(query.isValid());
            query = new extensionQuery_1.Query('  hello      ', 'installs');
            assert(query.isValid());
        });
        test('equals', function () {
            var query1 = new extensionQuery_1.Query('hello', '');
            var query2 = new extensionQuery_1.Query('hello', '');
            assert(query1.equals(query2));
            query2 = new extensionQuery_1.Query('hello world', '');
            assert(!query1.equals(query2));
            query2 = new extensionQuery_1.Query('hello', 'installs');
            assert(!query1.equals(query2));
            query2 = new extensionQuery_1.Query('hello', 'installs');
            assert(!query1.equals(query2));
        });
    });
});
