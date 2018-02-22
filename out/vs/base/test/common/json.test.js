define(["require", "exports", "assert", "vs/base/common/json", "vs/base/common/jsonErrorMessages"], function (require, exports, assert, json_1, jsonErrorMessages_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertKinds(text) {
        var kinds = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            kinds[_i - 1] = arguments[_i];
        }
        var scanner = json_1.createScanner(text);
        var kind;
        while ((kind = scanner.scan()) !== json_1.SyntaxKind.EOF) {
            assert.equal(kind, kinds.shift());
        }
        assert.equal(kinds.length, 0);
    }
    function assertScanError(text, expectedKind, scanError) {
        var scanner = json_1.createScanner(text);
        scanner.scan();
        assert.equal(scanner.getToken(), expectedKind);
        assert.equal(scanner.getTokenError(), scanError);
    }
    function assertValidParse(input, expected, options) {
        var errors = [];
        var actual = json_1.parse(input, errors, options);
        if (errors.length !== 0) {
            assert(false, jsonErrorMessages_1.getParseErrorMessage(errors[0].error));
        }
        assert.deepEqual(actual, expected);
    }
    function assertInvalidParse(input, expected, options) {
        var errors = [];
        var actual = json_1.parse(input, errors, options);
        assert(errors.length > 0);
        assert.deepEqual(actual, expected);
    }
    function assertTree(input, expected, expectedErrors) {
        if (expectedErrors === void 0) { expectedErrors = []; }
        var errors = [];
        var actual = json_1.parseTree(input, errors);
        assert.deepEqual(errors.map(function (e) { return e.error; }, expected), expectedErrors);
        var checkParent = function (node) {
            if (node.children) {
                for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    assert.equal(node, child.parent);
                    delete child.parent; // delete to avoid recursion in deep equal
                    checkParent(child);
                }
            }
        };
        checkParent(actual);
        assert.deepEqual(actual, expected);
    }
    suite('JSON', function () {
        test('tokens', function () {
            assertKinds('{', json_1.SyntaxKind.OpenBraceToken);
            assertKinds('}', json_1.SyntaxKind.CloseBraceToken);
            assertKinds('[', json_1.SyntaxKind.OpenBracketToken);
            assertKinds(']', json_1.SyntaxKind.CloseBracketToken);
            assertKinds(':', json_1.SyntaxKind.ColonToken);
            assertKinds(',', json_1.SyntaxKind.CommaToken);
        });
        test('comments', function () {
            assertKinds('// this is a comment', json_1.SyntaxKind.LineCommentTrivia);
            assertKinds('// this is a comment\n', json_1.SyntaxKind.LineCommentTrivia, json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('/* this is a comment*/', json_1.SyntaxKind.BlockCommentTrivia);
            assertKinds('/* this is a \r\ncomment*/', json_1.SyntaxKind.BlockCommentTrivia);
            assertKinds('/* this is a \ncomment*/', json_1.SyntaxKind.BlockCommentTrivia);
            // unexpected end
            assertKinds('/* this is a', json_1.SyntaxKind.BlockCommentTrivia);
            assertKinds('/* this is a \ncomment', json_1.SyntaxKind.BlockCommentTrivia);
            // broken comment
            assertKinds('/ ttt', json_1.SyntaxKind.Unknown, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.Unknown);
        });
        test('strings', function () {
            assertKinds('"test"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\""', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\/"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\b"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\f"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\n"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\r"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\t"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\\v"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"\u88ff"', json_1.SyntaxKind.StringLiteral);
            assertKinds('"​\u2028"', json_1.SyntaxKind.StringLiteral);
            // unexpected end
            assertKinds('"test', json_1.SyntaxKind.StringLiteral);
            assertKinds('"test\n"', json_1.SyntaxKind.StringLiteral, json_1.SyntaxKind.LineBreakTrivia, json_1.SyntaxKind.StringLiteral);
            // invalid characters
            assertScanError('"\t"', json_1.SyntaxKind.StringLiteral, json_1.ScanError.InvalidCharacter);
            assertScanError('"\t "', json_1.SyntaxKind.StringLiteral, json_1.ScanError.InvalidCharacter);
        });
        test('numbers', function () {
            assertKinds('0', json_1.SyntaxKind.NumericLiteral);
            assertKinds('0.1', json_1.SyntaxKind.NumericLiteral);
            assertKinds('-0.1', json_1.SyntaxKind.NumericLiteral);
            assertKinds('-1', json_1.SyntaxKind.NumericLiteral);
            assertKinds('1', json_1.SyntaxKind.NumericLiteral);
            assertKinds('123456789', json_1.SyntaxKind.NumericLiteral);
            assertKinds('10', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90E+123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90e+123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90e-123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90E-123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90E123', json_1.SyntaxKind.NumericLiteral);
            assertKinds('90e123', json_1.SyntaxKind.NumericLiteral);
            // zero handling
            assertKinds('01', json_1.SyntaxKind.NumericLiteral, json_1.SyntaxKind.NumericLiteral);
            assertKinds('-01', json_1.SyntaxKind.NumericLiteral, json_1.SyntaxKind.NumericLiteral);
            // unexpected end
            assertKinds('-', json_1.SyntaxKind.Unknown);
            assertKinds('.0', json_1.SyntaxKind.Unknown);
        });
        test('keywords: true, false, null', function () {
            assertKinds('true', json_1.SyntaxKind.TrueKeyword);
            assertKinds('false', json_1.SyntaxKind.FalseKeyword);
            assertKinds('null', json_1.SyntaxKind.NullKeyword);
            assertKinds('true false null', json_1.SyntaxKind.TrueKeyword, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.FalseKeyword, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.NullKeyword);
            // invalid words
            assertKinds('nulllll', json_1.SyntaxKind.Unknown);
            assertKinds('True', json_1.SyntaxKind.Unknown);
            assertKinds('foo-bar', json_1.SyntaxKind.Unknown);
            assertKinds('foo bar', json_1.SyntaxKind.Unknown, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.Unknown);
        });
        test('trivia', function () {
            assertKinds(' ', json_1.SyntaxKind.Trivia);
            assertKinds('  \t  ', json_1.SyntaxKind.Trivia);
            assertKinds('  \t  \n  \t  ', json_1.SyntaxKind.Trivia, json_1.SyntaxKind.LineBreakTrivia, json_1.SyntaxKind.Trivia);
            assertKinds('\r\n', json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('\r', json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('\n', json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('\n\r', json_1.SyntaxKind.LineBreakTrivia, json_1.SyntaxKind.LineBreakTrivia);
            assertKinds('\n   \n', json_1.SyntaxKind.LineBreakTrivia, json_1.SyntaxKind.Trivia, json_1.SyntaxKind.LineBreakTrivia);
        });
        test('parse: literals', function () {
            assertValidParse('true', true);
            assertValidParse('false', false);
            assertValidParse('null', null);
            assertValidParse('"foo"', 'foo');
            assertValidParse('"\\"-\\\\-\\/-\\b-\\f-\\n-\\r-\\t"', '"-\\-/-\b-\f-\n-\r-\t');
            assertValidParse('"\\u00DC"', 'Ü');
            assertValidParse('9', 9);
            assertValidParse('-9', -9);
            assertValidParse('0.129', 0.129);
            assertValidParse('23e3', 23e3);
            assertValidParse('1.2E+3', 1.2E+3);
            assertValidParse('1.2E-3', 1.2E-3);
            assertValidParse('1.2E-3 // comment', 1.2E-3);
        });
        test('parse: objects', function () {
            assertValidParse('{}', {});
            assertValidParse('{ "foo": true }', { foo: true });
            assertValidParse('{ "bar": 8, "xoo": "foo" }', { bar: 8, xoo: 'foo' });
            assertValidParse('{ "hello": [], "world": {} }', { hello: [], world: {} });
            assertValidParse('{ "a": false, "b": true, "c": [ 7.4 ] }', { a: false, b: true, c: [7.4] });
            assertValidParse('{ "lineComment": "//", "blockComment": ["/*", "*/"], "brackets": [ ["{", "}"], ["[", "]"], ["(", ")"] ] }', { lineComment: '//', blockComment: ['/*', '*/'], brackets: [['{', '}'], ['[', ']'], ['(', ')']] });
            assertValidParse('{ "hello": [], "world": {} }', { hello: [], world: {} });
            assertValidParse('{ "hello": { "again": { "inside": 5 }, "world": 1 }}', { hello: { again: { inside: 5 }, world: 1 } });
            assertValidParse('{ "foo": /*hello*/true }', { foo: true });
        });
        test('parse: arrays', function () {
            assertValidParse('[]', []);
            assertValidParse('[ [],  [ [] ]]', [[], [[]]]);
            assertValidParse('[ 1, 2, 3 ]', [1, 2, 3]);
            assertValidParse('[ { "a": null } ]', [{ a: null }]);
        });
        test('parse: objects with errors', function () {
            assertInvalidParse('{,}', {});
            assertInvalidParse('{ "foo": true, }', { foo: true });
            assertInvalidParse('{ "bar": 8 "xoo": "foo" }', { bar: 8, xoo: 'foo' });
            assertInvalidParse('{ ,"bar": 8 }', { bar: 8 });
            assertInvalidParse('{ ,"bar": 8, "foo" }', { bar: 8 });
            assertInvalidParse('{ "bar": 8, "foo": }', { bar: 8 });
            assertInvalidParse('{ 8, "foo": 9 }', { foo: 9 });
        });
        test('parse: array with errors', function () {
            assertInvalidParse('[,]', []);
            assertInvalidParse('[ 1, 2, ]', [1, 2]);
            assertInvalidParse('[ 1 2, 3 ]', [1, 2, 3]);
            assertInvalidParse('[ ,1, 2, 3 ]', [1, 2, 3]);
            assertInvalidParse('[ ,1, 2, 3, ]', [1, 2, 3]);
        });
        test('parse: disallow commments', function () {
            var options = { disallowComments: true };
            assertValidParse('[ 1, 2, null, "foo" ]', [1, 2, null, 'foo'], options);
            assertValidParse('{ "hello": [], "world": {} }', { hello: [], world: {} }, options);
            assertInvalidParse('{ "foo": /*comment*/ true }', { foo: true }, options);
        });
        test('parse: trailing comma', function () {
            var options = { allowTrailingComma: true };
            assertValidParse('{ "hello": [], }', { hello: [] }, options);
            assertValidParse('{ "hello": [] }', { hello: [] }, options);
            assertValidParse('{ "hello": [], "world": {}, }', { hello: [], world: {} }, options);
            assertValidParse('{ "hello": [], "world": {} }', { hello: [], world: {} }, options);
            assertValidParse('{ "hello": [1,] }', { hello: [1] }, options);
            assertInvalidParse('{ "hello": [], }', { hello: [] });
            assertInvalidParse('{ "hello": [], "world": {}, }', { hello: [], world: {} });
        });
        test('tree: literals', function () {
            assertTree('true', { type: 'boolean', offset: 0, length: 4, value: true });
            assertTree('false', { type: 'boolean', offset: 0, length: 5, value: false });
            assertTree('null', { type: 'null', offset: 0, length: 4, value: null });
            assertTree('23', { type: 'number', offset: 0, length: 2, value: 23 });
            assertTree('-1.93e-19', { type: 'number', offset: 0, length: 9, value: -1.93e-19 });
            assertTree('"hello"', { type: 'string', offset: 0, length: 7, value: 'hello' });
        });
        test('tree: arrays', function () {
            assertTree('[]', { type: 'array', offset: 0, length: 2, children: [] });
            assertTree('[ 1 ]', { type: 'array', offset: 0, length: 5, children: [{ type: 'number', offset: 2, length: 1, value: 1 }] });
            assertTree('[ 1,"x"]', {
                type: 'array', offset: 0, length: 8, children: [
                    { type: 'number', offset: 2, length: 1, value: 1 },
                    { type: 'string', offset: 4, length: 3, value: 'x' }
                ]
            });
            assertTree('[[]]', {
                type: 'array', offset: 0, length: 4, children: [
                    { type: 'array', offset: 1, length: 2, children: [] }
                ]
            });
        });
        test('tree: objects', function () {
            assertTree('{ }', { type: 'object', offset: 0, length: 3, children: [] });
            assertTree('{ "val": 1 }', {
                type: 'object', offset: 0, length: 12, children: [
                    {
                        type: 'property', offset: 2, length: 8, columnOffset: 7, children: [
                            { type: 'string', offset: 2, length: 5, value: 'val' },
                            { type: 'number', offset: 9, length: 1, value: 1 }
                        ]
                    }
                ]
            });
            assertTree('{"id": "$", "v": [ null, null] }', {
                type: 'object', offset: 0, length: 32, children: [
                    {
                        type: 'property', offset: 1, length: 9, columnOffset: 5, children: [
                            { type: 'string', offset: 1, length: 4, value: 'id' },
                            { type: 'string', offset: 7, length: 3, value: '$' }
                        ]
                    },
                    {
                        type: 'property', offset: 12, length: 18, columnOffset: 15, children: [
                            { type: 'string', offset: 12, length: 3, value: 'v' },
                            {
                                type: 'array', offset: 17, length: 13, children: [
                                    { type: 'null', offset: 19, length: 4, value: null },
                                    { type: 'null', offset: 25, length: 4, value: null }
                                ]
                            }
                        ]
                    }
                ]
            });
            assertTree('{  "id": { "foo": { } } , }', {
                type: 'object', offset: 0, length: 27, children: [
                    {
                        type: 'property', offset: 3, length: 20, columnOffset: 7, children: [
                            { type: 'string', offset: 3, length: 4, value: 'id' },
                            {
                                type: 'object', offset: 9, length: 14, children: [
                                    {
                                        type: 'property', offset: 11, length: 10, columnOffset: 16, children: [
                                            { type: 'string', offset: 11, length: 5, value: 'foo' },
                                            { type: 'object', offset: 18, length: 3, children: [] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }, [json_1.ParseErrorCode.PropertyNameExpected, json_1.ParseErrorCode.ValueExpected]);
        });
    });
});
