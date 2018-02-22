define(["require", "exports", "vs/base/common/jsonFormatter", "assert"], function (require, exports, Formatter, assert) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('JSON - formatter', function () {
        function format(content, expected, insertSpaces) {
            if (insertSpaces === void 0) { insertSpaces = true; }
            var range = void 0;
            var rangeStart = content.indexOf('|');
            var rangeEnd = content.lastIndexOf('|');
            if (rangeStart !== -1 && rangeEnd !== -1) {
                content = content.substring(0, rangeStart) + content.substring(rangeStart + 1, rangeEnd) + content.substring(rangeEnd + 1);
                range = { offset: rangeStart, length: rangeEnd - rangeStart };
            }
            var edits = Formatter.format(content, range, { tabSize: 2, insertSpaces: insertSpaces, eol: '\n' });
            var lastEditOffset = content.length;
            for (var i = edits.length - 1; i >= 0; i--) {
                var edit = edits[i];
                assert(edit.offset >= 0 && edit.length >= 0 && edit.offset + edit.length <= content.length);
                assert(typeof edit.content === 'string');
                assert(lastEditOffset >= edit.offset + edit.length); // make sure all edits are ordered
                lastEditOffset = edit.offset;
                content = content.substring(0, edit.offset) + edit.content + content.substring(edit.offset + edit.length);
            }
            assert.equal(content, expected);
        }
        test('object - single property', function () {
            var content = [
                '{"x" : 1}'
            ].join('\n');
            var expected = [
                '{',
                '  "x": 1',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('object - multiple properties', function () {
            var content = [
                '{"x" : 1,  "y" : "foo", "z"  : true}'
            ].join('\n');
            var expected = [
                '{',
                '  "x": 1,',
                '  "y": "foo",',
                '  "z": true',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('object - no properties ', function () {
            var content = [
                '{"x" : {    },  "y" : {}}'
            ].join('\n');
            var expected = [
                '{',
                '  "x": {},',
                '  "y": {}',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('object - nesting', function () {
            var content = [
                '{"x" : {  "y" : { "z"  : { }}, "a": true}}'
            ].join('\n');
            var expected = [
                '{',
                '  "x": {',
                '    "y": {',
                '      "z": {}',
                '    },',
                '    "a": true',
                '  }',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('array - single items', function () {
            var content = [
                '["[]"]'
            ].join('\n');
            var expected = [
                '[',
                '  "[]"',
                ']'
            ].join('\n');
            format(content, expected);
        });
        test('array - multiple items', function () {
            var content = [
                '[true,null,1.2]'
            ].join('\n');
            var expected = [
                '[',
                '  true,',
                '  null,',
                '  1.2',
                ']'
            ].join('\n');
            format(content, expected);
        });
        test('array - no items', function () {
            var content = [
                '[      ]'
            ].join('\n');
            var expected = [
                '[]'
            ].join('\n');
            format(content, expected);
        });
        test('array - nesting', function () {
            var content = [
                '[ [], [ [ {} ], "a" ]  ]'
            ].join('\n');
            var expected = [
                '[',
                '  [],',
                '  [',
                '    [',
                '      {}',
                '    ],',
                '    "a"',
                '  ]',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('syntax errors', function () {
            var content = [
                '[ null 1.2 ]'
            ].join('\n');
            var expected = [
                '[',
                '  null 1.2',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('empty lines', function () {
            var content = [
                '{',
                '"a": true,',
                '',
                '"b": true',
                '}',
            ].join('\n');
            var expected = [
                '{',
                '\t"a": true,',
                '\t"b": true',
                '}',
            ].join('\n');
            format(content, expected, false);
        });
        test('single line comment', function () {
            var content = [
                '[ ',
                '//comment',
                '"foo", "bar"',
                '] '
            ].join('\n');
            var expected = [
                '[',
                '  //comment',
                '  "foo",',
                '  "bar"',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('block line comment', function () {
            var content = [
                '[{',
                '        /*comment*/     ',
                '"foo" : true',
                '}] '
            ].join('\n');
            var expected = [
                '[',
                '  {',
                '    /*comment*/',
                '    "foo": true',
                '  }',
                ']',
            ].join('\n');
            format(content, expected);
        });
        test('single line comment on same line', function () {
            var content = [
                ' {  ',
                '        "a": {}// comment    ',
                ' } '
            ].join('\n');
            var expected = [
                '{',
                '  "a": {} // comment    ',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('single line comment on same line 2', function () {
            var content = [
                '{ //comment',
                '}'
            ].join('\n');
            var expected = [
                '{ //comment',
                '}'
            ].join('\n');
            format(content, expected);
        });
        test('block comment on same line', function () {
            var content = [
                '{      "a": {}, /*comment*/    ',
                '        /*comment*/ "b": {},    ',
                '        "c": {/*comment*/}    } ',
            ].join('\n');
            var expected = [
                '{',
                '  "a": {}, /*comment*/',
                '  /*comment*/ "b": {},',
                '  "c": { /*comment*/}',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('block comment on same line advanced', function () {
            var content = [
                ' {       "d": [',
                '             null',
                '        ] /*comment*/',
                '        ,"e": /*comment*/ [null] }',
            ].join('\n');
            var expected = [
                '{',
                '  "d": [',
                '    null',
                '  ] /*comment*/,',
                '  "e": /*comment*/ [',
                '    null',
                '  ]',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('multiple block comments on same line', function () {
            var content = [
                '{      "a": {} /*comment*/, /*comment*/   ',
                '        /*comment*/ "b": {}  /*comment*/  } '
            ].join('\n');
            var expected = [
                '{',
                '  "a": {} /*comment*/, /*comment*/',
                '  /*comment*/ "b": {} /*comment*/',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('multiple mixed comments on same line', function () {
            var content = [
                '[ /*comment*/  /*comment*/   // comment ',
                ']'
            ].join('\n');
            var expected = [
                '[ /*comment*/ /*comment*/ // comment ',
                ']'
            ].join('\n');
            format(content, expected);
        });
        test('range', function () {
            var content = [
                '{ "a": {},',
                '|"b": [null, null]|',
                '} '
            ].join('\n');
            var expected = [
                '{ "a": {},',
                '"b": [',
                '  null,',
                '  null',
                ']',
                '} ',
            ].join('\n');
            format(content, expected);
        });
        test('range with existing indent', function () {
            var content = [
                '{ "a": {},',
                '   |"b": [null],',
                '"c": {}',
                '} |'
            ].join('\n');
            var expected = [
                '{ "a": {},',
                '  "b": [',
                '    null',
                '  ],',
                '  "c": {}',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('range with existing indent - tabs', function () {
            var content = [
                '{ "a": {},',
                '|  "b": [null],   ',
                '"c": {}',
                '} |    '
            ].join('\n');
            var expected = [
                '{ "a": {},',
                '\t"b": [',
                '\t\tnull',
                '\t],',
                '\t"c": {}',
                '}',
            ].join('\n');
            format(content, expected, false);
        });
        test('block comment none-line breaking symbols', function () {
            var content = [
                '{ "a": [ 1',
                '/* comment */',
                ', 2',
                '/* comment */',
                ']',
                '/* comment */',
                ',',
                ' "b": true',
                '/* comment */',
                '}'
            ].join('\n');
            var expected = [
                '{',
                '  "a": [',
                '    1',
                '    /* comment */',
                '    ,',
                '    2',
                '    /* comment */',
                '  ]',
                '  /* comment */',
                '  ,',
                '  "b": true',
                '  /* comment */',
                '}',
            ].join('\n');
            format(content, expected);
        });
        test('line comment after none-line breaking symbols', function () {
            var content = [
                '{ "a":',
                '// comment',
                'null,',
                ' "b"',
                '// comment',
                ': null',
                '// comment',
                '}'
            ].join('\n');
            var expected = [
                '{',
                '  "a":',
                '  // comment',
                '  null,',
                '  "b"',
                '  // comment',
                '  : null',
                '  // comment',
                '}',
            ].join('\n');
            format(content, expected);
        });
    });
});
