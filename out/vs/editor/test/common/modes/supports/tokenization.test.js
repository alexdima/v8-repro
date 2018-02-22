define(["require", "exports", "assert", "vs/editor/common/modes/supports/tokenization"], function (require, exports, assert, tokenization_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Token theme matching', function () {
        test('gives higher priority to deeper matches', function () {
            var theme = tokenization_1.TokenTheme.createFromRawTokenTheme([
                { token: '', foreground: '100000', background: '200000' },
                { token: 'punctuation.definition.string.begin.html', foreground: '300000' },
                { token: 'punctuation.definition.string', foreground: '400000' },
            ]);
            var colorMap = new tokenization_1.ColorMap();
            colorMap.getId('100000');
            var _B = colorMap.getId('200000');
            colorMap.getId('400000');
            var _D = colorMap.getId('300000');
            var actual = theme._match('punctuation.definition.string.begin.html');
            assert.deepEqual(actual, new tokenization_1.ThemeTrieElementRule(0 /* None */, _D, _B));
        });
        test('can match', function () {
            var theme = tokenization_1.TokenTheme.createFromRawTokenTheme([
                { token: '', foreground: 'F8F8F2', background: '272822' },
                { token: 'source', background: '100000' },
                { token: 'something', background: '100000' },
                { token: 'bar', background: '200000' },
                { token: 'baz', background: '200000' },
                { token: 'bar', fontStyle: 'bold' },
                { token: 'constant', fontStyle: 'italic', foreground: '300000' },
                { token: 'constant.numeric', foreground: '400000' },
                { token: 'constant.numeric.hex', fontStyle: 'bold' },
                { token: 'constant.numeric.oct', fontStyle: 'bold italic underline' },
                { token: 'constant.numeric.dec', fontStyle: '', foreground: '500000' },
                { token: 'storage.object.bar', fontStyle: '', foreground: '600000' },
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('F8F8F2');
            var _B = colorMap.getId('272822');
            var _C = colorMap.getId('200000');
            var _D = colorMap.getId('300000');
            var _E = colorMap.getId('400000');
            var _F = colorMap.getId('500000');
            var _G = colorMap.getId('100000');
            var _H = colorMap.getId('600000');
            function assertMatch(scopeName, expected) {
                var actual = theme._match(scopeName);
                assert.deepEqual(actual, expected, 'when matching <<' + scopeName + '>>');
            }
            function assertSimpleMatch(scopeName, fontStyle, foreground, background) {
                assertMatch(scopeName, new tokenization_1.ThemeTrieElementRule(fontStyle, foreground, background));
            }
            function assertNoMatch(scopeName) {
                assertMatch(scopeName, new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B));
            }
            // matches defaults
            assertNoMatch('');
            assertNoMatch('bazz');
            assertNoMatch('asdfg');
            // matches source
            assertSimpleMatch('source', 0 /* None */, _A, _G);
            assertSimpleMatch('source.ts', 0 /* None */, _A, _G);
            assertSimpleMatch('source.tss', 0 /* None */, _A, _G);
            // matches something
            assertSimpleMatch('something', 0 /* None */, _A, _G);
            assertSimpleMatch('something.ts', 0 /* None */, _A, _G);
            assertSimpleMatch('something.tss', 0 /* None */, _A, _G);
            // matches baz
            assertSimpleMatch('baz', 0 /* None */, _A, _C);
            assertSimpleMatch('baz.ts', 0 /* None */, _A, _C);
            assertSimpleMatch('baz.tss', 0 /* None */, _A, _C);
            // matches constant
            assertSimpleMatch('constant', 1 /* Italic */, _D, _B);
            assertSimpleMatch('constant.string', 1 /* Italic */, _D, _B);
            assertSimpleMatch('constant.hex', 1 /* Italic */, _D, _B);
            // matches constant.numeric
            assertSimpleMatch('constant.numeric', 1 /* Italic */, _E, _B);
            assertSimpleMatch('constant.numeric.baz', 1 /* Italic */, _E, _B);
            // matches constant.numeric.hex
            assertSimpleMatch('constant.numeric.hex', 2 /* Bold */, _E, _B);
            assertSimpleMatch('constant.numeric.hex.baz', 2 /* Bold */, _E, _B);
            // matches constant.numeric.oct
            assertSimpleMatch('constant.numeric.oct', 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, _E, _B);
            assertSimpleMatch('constant.numeric.oct.baz', 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, _E, _B);
            // matches constant.numeric.dec
            assertSimpleMatch('constant.numeric.dec', 0 /* None */, _F, _B);
            assertSimpleMatch('constant.numeric.dec.baz', 0 /* None */, _F, _B);
            // matches storage.object.bar
            assertSimpleMatch('storage.object.bar', 0 /* None */, _H, _B);
            assertSimpleMatch('storage.object.bar.baz', 0 /* None */, _H, _B);
            // does not match storage.object.bar
            assertSimpleMatch('storage.object.bart', 0 /* None */, _A, _B);
            assertSimpleMatch('storage.object', 0 /* None */, _A, _B);
            assertSimpleMatch('storage', 0 /* None */, _A, _B);
            assertSimpleMatch('bar', 2 /* Bold */, _A, _C);
        });
    });
    suite('Token theme parsing', function () {
        test('can parse', function () {
            var actual = tokenization_1.parseTokenTheme([
                { token: '', foreground: 'F8F8F2', background: '272822' },
                { token: 'source', background: '100000' },
                { token: 'something', background: '100000' },
                { token: 'bar', background: '010000' },
                { token: 'baz', background: '010000' },
                { token: 'bar', fontStyle: 'bold' },
                { token: 'constant', fontStyle: 'italic', foreground: 'ff0000' },
                { token: 'constant.numeric', foreground: '00ff00' },
                { token: 'constant.numeric.hex', fontStyle: 'bold' },
                { token: 'constant.numeric.oct', fontStyle: 'bold italic underline' },
                { token: 'constant.numeric.dec', fontStyle: '', foreground: '0000ff' },
            ]);
            var expected = [
                new tokenization_1.ParsedTokenThemeRule('', 0, -1 /* NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('source', 1, -1 /* NotSet */, null, '100000'),
                new tokenization_1.ParsedTokenThemeRule('something', 2, -1 /* NotSet */, null, '100000'),
                new tokenization_1.ParsedTokenThemeRule('bar', 3, -1 /* NotSet */, null, '010000'),
                new tokenization_1.ParsedTokenThemeRule('baz', 4, -1 /* NotSet */, null, '010000'),
                new tokenization_1.ParsedTokenThemeRule('bar', 5, 2 /* Bold */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant', 6, 1 /* Italic */, 'ff0000', null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric', 7, -1 /* NotSet */, '00ff00', null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.hex', 8, 2 /* Bold */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.oct', 9, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.dec', 10, 0 /* None */, '0000ff', null),
            ];
            assert.deepEqual(actual, expected);
        });
    });
    suite('Token theme resolving', function () {
        test('strcmp works', function () {
            var actual = ['bar', 'z', 'zu', 'a', 'ab', ''].sort(tokenization_1.strcmp);
            var expected = ['', 'a', 'ab', 'bar', 'z', 'zu'];
            assert.deepEqual(actual, expected);
        });
        test('always has defaults', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('000000');
            var _B = colorMap.getId('ffffff');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B)));
        });
        test('respects incoming defaults 1', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* NotSet */, null, null)
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('000000');
            var _B = colorMap.getId('ffffff');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B)));
        });
        test('respects incoming defaults 2', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, 0 /* None */, null, null)
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('000000');
            var _B = colorMap.getId('ffffff');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B)));
        });
        test('respects incoming defaults 3', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, 2 /* Bold */, null, null)
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('000000');
            var _B = colorMap.getId('ffffff');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* Bold */, _A, _B)));
        });
        test('respects incoming defaults 4', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* NotSet */, 'ff0000', null)
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('ff0000');
            var _B = colorMap.getId('ffffff');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B)));
        });
        test('respects incoming defaults 5', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* NotSet */, null, 'ff0000')
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('000000');
            var _B = colorMap.getId('ff0000');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B)));
        });
        test('can merge incoming defaults', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* NotSet */, null, 'ff0000'),
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* NotSet */, '00ff00', null),
                new tokenization_1.ParsedTokenThemeRule('', -1, 2 /* Bold */, null, null),
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('00ff00');
            var _B = colorMap.getId('ff0000');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* Bold */, _A, _B)));
        });
        test('defaults are inherited', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('var', -1, -1 /* NotSet */, 'ff0000', null)
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('F8F8F2');
            var _B = colorMap.getId('272822');
            var _C = colorMap.getId('ff0000');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            var root = new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B), {
                'var': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _C, _B))
            });
            assert.deepEqual(actual.getThemeTrieElement(), root);
        });
        test('same rules get merged', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('var', 1, 2 /* Bold */, null, null),
                new tokenization_1.ParsedTokenThemeRule('var', 0, -1 /* NotSet */, 'ff0000', null),
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('F8F8F2');
            var _B = colorMap.getId('272822');
            var _C = colorMap.getId('ff0000');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            var root = new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B), {
                'var': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* Bold */, _C, _B))
            });
            assert.deepEqual(actual.getThemeTrieElement(), root);
        });
        test('rules are inherited 1', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('var', -1, 2 /* Bold */, 'ff0000', null),
                new tokenization_1.ParsedTokenThemeRule('var.identifier', -1, -1 /* NotSet */, '00ff00', null),
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('F8F8F2');
            var _B = colorMap.getId('272822');
            var _C = colorMap.getId('ff0000');
            var _D = colorMap.getId('00ff00');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            var root = new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B), {
                'var': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* Bold */, _C, _B), {
                    'identifier': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* Bold */, _D, _B))
                })
            });
            assert.deepEqual(actual.getThemeTrieElement(), root);
        });
        test('rules are inherited 2', function () {
            var actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('var', -1, 2 /* Bold */, 'ff0000', null),
                new tokenization_1.ParsedTokenThemeRule('var.identifier', -1, -1 /* NotSet */, '00ff00', null),
                new tokenization_1.ParsedTokenThemeRule('constant', 4, 1 /* Italic */, '100000', null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric', 5, -1 /* NotSet */, '200000', null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.hex', 6, 2 /* Bold */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.oct', 7, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.dec', 8, 0 /* None */, '300000', null),
            ]);
            var colorMap = new tokenization_1.ColorMap();
            var _A = colorMap.getId('F8F8F2');
            var _B = colorMap.getId('272822');
            var _C = colorMap.getId('100000');
            var _D = colorMap.getId('200000');
            var _E = colorMap.getId('300000');
            var _F = colorMap.getId('ff0000');
            var _G = colorMap.getId('00ff00');
            assert.deepEqual(actual.getColorMap(), colorMap.getColorMap());
            var root = new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _A, _B), {
                'var': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* Bold */, _F, _B), {
                    'identifier': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* Bold */, _G, _B))
                }),
                'constant': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(1 /* Italic */, _C, _B), {
                    'numeric': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(1 /* Italic */, _D, _B), {
                        'hex': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* Bold */, _D, _B)),
                        'oct': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, _D, _B)),
                        'dec': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* None */, _E, _B)),
                    })
                })
            });
            assert.deepEqual(actual.getThemeTrieElement(), root);
        });
    });
});
