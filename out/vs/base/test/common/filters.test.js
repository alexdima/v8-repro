define(["require", "exports", "assert", "vs/base/common/filters"], function (require, exports, assert, filters_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function filterOk(filter, word, wordToMatchAgainst, highlights) {
        var r = filter(word, wordToMatchAgainst);
        assert(r);
        if (highlights) {
            assert.deepEqual(r, highlights);
        }
    }
    function filterNotOk(filter, word, suggestion) {
        assert(!filter(word, suggestion));
    }
    suite('Filters', function () {
        test('or', function () {
            var filter;
            var counters;
            var newFilter = function (i, r) {
                return function () { counters[i]++; return r; };
            };
            counters = [0, 0];
            filter = filters_1.or(newFilter(0, false), newFilter(1, false));
            filterNotOk(filter, 'anything', 'anything');
            assert.deepEqual(counters, [1, 1]);
            counters = [0, 0];
            filter = filters_1.or(newFilter(0, true), newFilter(1, false));
            filterOk(filter, 'anything', 'anything');
            assert.deepEqual(counters, [1, 0]);
            counters = [0, 0];
            filter = filters_1.or(newFilter(0, true), newFilter(1, true));
            filterOk(filter, 'anything', 'anything');
            assert.deepEqual(counters, [1, 0]);
            counters = [0, 0];
            filter = filters_1.or(newFilter(0, false), newFilter(1, true));
            filterOk(filter, 'anything', 'anything');
            assert.deepEqual(counters, [1, 1]);
        });
        test('PrefixFilter - case sensitive', function () {
            filterNotOk(filters_1.matchesStrictPrefix, '', '');
            filterOk(filters_1.matchesStrictPrefix, '', 'anything', []);
            filterOk(filters_1.matchesStrictPrefix, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesStrictPrefix, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesStrictPrefix, 'alpha', 'alp');
            filterOk(filters_1.matchesStrictPrefix, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.matchesStrictPrefix, 'x', 'alpha');
            filterNotOk(filters_1.matchesStrictPrefix, 'A', 'alpha');
            filterNotOk(filters_1.matchesStrictPrefix, 'AlPh', 'alPHA');
        });
        test('PrefixFilter - ignore case', function () {
            filterOk(filters_1.matchesPrefix, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesPrefix, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesPrefix, 'alpha', 'alp');
            filterOk(filters_1.matchesPrefix, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.matchesPrefix, 'ä', 'Älpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.matchesPrefix, 'x', 'alpha');
            filterOk(filters_1.matchesPrefix, 'A', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.matchesPrefix, 'AlPh', 'alPHA', [{ start: 0, end: 4 }]);
            filterNotOk(filters_1.matchesPrefix, 'T', '4'); // see https://github.com/Microsoft/vscode/issues/22401
        });
        test('CamelCaseFilter', function () {
            filterNotOk(filters_1.matchesCamelCase, '', '');
            filterOk(filters_1.matchesCamelCase, '', 'anything', []);
            filterOk(filters_1.matchesCamelCase, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesCamelCase, 'AlPhA', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesCamelCase, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesCamelCase, 'alpha', 'alp');
            filterOk(filters_1.matchesCamelCase, 'c', 'CamelCaseRocks', [
                { start: 0, end: 1 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cc', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 6 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'ccr', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 6 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cacr', 'CamelCaseRocks', [
                { start: 0, end: 2 },
                { start: 5, end: 6 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cacar', 'CamelCaseRocks', [
                { start: 0, end: 2 },
                { start: 5, end: 7 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'ccarocks', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 7 },
                { start: 9, end: 14 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cr', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fba', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbar', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 6 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbara', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 7 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbaa', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 },
                { start: 6, end: 7 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbaab', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 },
                { start: 6, end: 8 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'c2d', 'canvasCreation2D', [
                { start: 0, end: 1 },
                { start: 14, end: 16 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cce', '_canvasCreationEvent', [
                { start: 1, end: 2 },
                { start: 7, end: 8 },
                { start: 15, end: 16 }
            ]);
        });
        test('CamelCaseFilter - #19256', function () {
            assert(filters_1.matchesCamelCase('Debug Console', 'Open: Debug Console'));
            assert(filters_1.matchesCamelCase('Debug console', 'Open: Debug Console'));
            assert(filters_1.matchesCamelCase('debug console', 'Open: Debug Console'));
        });
        test('matchesContiguousSubString', function () {
            filterOk(filters_1.matchesContiguousSubString, 'cela', 'cancelAnimationFrame()', [
                { start: 3, end: 7 }
            ]);
        });
        test('matchesSubString', function () {
            filterOk(filters_1.matchesSubString, 'cmm', 'cancelAnimationFrame()', [
                { start: 0, end: 1 },
                { start: 9, end: 10 },
                { start: 18, end: 19 }
            ]);
            filterOk(filters_1.matchesSubString, 'abc', 'abcabc', [
                { start: 0, end: 3 },
            ]);
            filterOk(filters_1.matchesSubString, 'abc', 'aaabbbccc', [
                { start: 0, end: 1 },
                { start: 3, end: 4 },
                { start: 6, end: 7 },
            ]);
        });
        test('matchesSubString performance (#35346)', function () {
            filterNotOk(filters_1.matchesSubString, 'aaaaaaaaaaaaaaaaaaaax', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        });
        test('WordFilter', function () {
            filterOk(filters_1.matchesWords, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesWords, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesWords, 'alpha', 'alp');
            filterOk(filters_1.matchesWords, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.matchesWords, 'x', 'alpha');
            filterOk(filters_1.matchesWords, 'A', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.matchesWords, 'AlPh', 'alPHA', [{ start: 0, end: 4 }]);
            assert(filters_1.matchesWords('Debug Console', 'Open: Debug Console'));
            filterOk(filters_1.matchesWords, 'gp', 'Git: Pull', [{ start: 0, end: 1 }, { start: 5, end: 6 }]);
            filterOk(filters_1.matchesWords, 'g p', 'Git: Pull', [{ start: 0, end: 1 }, { start: 4, end: 6 }]);
            filterOk(filters_1.matchesWords, 'gipu', 'Git: Pull', [{ start: 0, end: 2 }, { start: 5, end: 7 }]);
            filterOk(filters_1.matchesWords, 'gp', 'Category: Git: Pull', [{ start: 10, end: 11 }, { start: 15, end: 16 }]);
            filterOk(filters_1.matchesWords, 'g p', 'Category: Git: Pull', [{ start: 10, end: 11 }, { start: 14, end: 16 }]);
            filterOk(filters_1.matchesWords, 'gipu', 'Category: Git: Pull', [{ start: 10, end: 12 }, { start: 15, end: 17 }]);
            filterNotOk(filters_1.matchesWords, 'it', 'Git: Pull');
            filterNotOk(filters_1.matchesWords, 'll', 'Git: Pull');
            filterOk(filters_1.matchesWords, 'git: プル', 'git: プル', [{ start: 0, end: 7 }]);
            filterOk(filters_1.matchesWords, 'git プル', 'git: プル', [{ start: 0, end: 3 }, { start: 4, end: 7 }]);
            filterOk(filters_1.matchesWords, 'öäk', 'Öhm: Älles Klar', [{ start: 0, end: 1 }, { start: 5, end: 6 }, { start: 11, end: 12 }]);
            assert.ok(filters_1.matchesWords('gipu', 'Category: Git: Pull', true) === null);
            assert.deepEqual(filters_1.matchesWords('pu', 'Category: Git: Pull', true), [{ start: 15, end: 17 }]);
        });
        function assertMatches(pattern, word, decoratedWord, filter) {
            var r = filter(pattern, word);
            assert.ok(!decoratedWord === (!r || r[1].length === 0));
            if (r) {
                var matches = r[1];
                var pos = 0;
                for (var i = 0; i < matches.length; i++) {
                    var actual = matches[i];
                    var expected = decoratedWord.indexOf('^', pos) - i;
                    assert.equal(actual, expected);
                    pos = expected + 1 + i;
                }
            }
        }
        test('fuzzyScore, #23215', function () {
            assertMatches('tit', 'win.tit', 'win.^t^i^t', filters_1.fuzzyScore);
            assertMatches('title', 'win.title', 'win.^t^i^t^l^e', filters_1.fuzzyScore);
            assertMatches('WordCla', 'WordCharacterClassifier', '^W^o^r^dCharacter^C^l^assifier', filters_1.fuzzyScore);
            assertMatches('WordCCla', 'WordCharacterClassifier', '^W^o^r^d^Character^C^l^assifier', filters_1.fuzzyScore);
        });
        test('fuzzyScore, #23332', function () {
            assertMatches('dete', '"editor.quickSuggestionsDelay"', undefined, filters_1.fuzzyScore);
        });
        test('fuzzyScore, #23190', function () {
            assertMatches('c:\\do', '& \'C:\\Documents and Settings\'', '& \'^C^:^\\^D^ocuments and Settings\'', filters_1.fuzzyScore);
            assertMatches('c:\\do', '& \'c:\\Documents and Settings\'', '& \'^c^:^\\^D^ocuments and Settings\'', filters_1.fuzzyScore);
        });
        test('fuzzyScore, #23581', function () {
            assertMatches('close', 'css.lint.importStatement', '^css.^lint.imp^ort^Stat^ement', filters_1.fuzzyScore);
            assertMatches('close', 'css.colorDecorators.enable', '^css.co^l^orDecorator^s.^enable', filters_1.fuzzyScore);
            assertMatches('close', 'workbench.quickOpen.closeOnFocusOut', 'workbench.quickOpen.^c^l^o^s^eOnFocusOut', filters_1.fuzzyScore);
            assertTopScore(filters_1.fuzzyScore, 'close', 2, 'css.lint.importStatement', 'css.colorDecorators.enable', 'workbench.quickOpen.closeOnFocusOut');
        });
        test('fuzzyScore, #23458', function () {
            assertMatches('highlight', 'editorHoverHighlight', 'editorHover^H^i^g^h^l^i^g^h^t', filters_1.fuzzyScore);
            assertMatches('hhighlight', 'editorHoverHighlight', 'editor^Hover^H^i^g^h^l^i^g^h^t', filters_1.fuzzyScore);
            assertMatches('dhhighlight', 'editorHoverHighlight', undefined, filters_1.fuzzyScore);
        });
        test('fuzzyScore, #23746', function () {
            assertMatches('-moz', '-moz-foo', '^-^m^o^z-foo', filters_1.fuzzyScore);
            assertMatches('moz', '-moz-foo', '-^m^o^z-foo', filters_1.fuzzyScore);
            assertMatches('moz', '-moz-animation', '-^m^o^z-animation', filters_1.fuzzyScore);
            assertMatches('moza', '-moz-animation', '-^m^o^z-^animation', filters_1.fuzzyScore);
        });
        test('fuzzyScore', function () {
            assertMatches('ab', 'abA', '^a^bA', filters_1.fuzzyScore);
            assertMatches('ccm', 'cacmelCase', '^ca^c^melCase', filters_1.fuzzyScore);
            assertMatches('bti', 'the_black_knight', undefined, filters_1.fuzzyScore);
            assertMatches('ccm', 'camelCase', undefined, filters_1.fuzzyScore);
            assertMatches('cmcm', 'camelCase', undefined, filters_1.fuzzyScore);
            assertMatches('BK', 'the_black_knight', 'the_^black_^knight', filters_1.fuzzyScore);
            assertMatches('KeyboardLayout=', 'KeyboardLayout', undefined, filters_1.fuzzyScore);
            assertMatches('LLL', 'SVisualLoggerLogsList', 'SVisual^Logger^Logs^List', filters_1.fuzzyScore);
            assertMatches('LLLL', 'SVilLoLosLi', undefined, filters_1.fuzzyScore);
            assertMatches('LLLL', 'SVisualLoggerLogsList', undefined, filters_1.fuzzyScore);
            assertMatches('TEdit', 'TextEdit', '^Text^E^d^i^t', filters_1.fuzzyScore);
            assertMatches('TEdit', 'TextEditor', '^Text^E^d^i^tor', filters_1.fuzzyScore);
            assertMatches('TEdit', 'Textedit', '^T^exte^d^i^t', filters_1.fuzzyScore);
            assertMatches('TEdit', 'text_edit', '^text_^e^d^i^t', filters_1.fuzzyScore);
            assertMatches('TEditDit', 'TextEditorDecorationType', '^Text^E^d^i^tor^Decorat^ion^Type', filters_1.fuzzyScore);
            assertMatches('TEdit', 'TextEditorDecorationType', '^Text^E^d^i^torDecorationType', filters_1.fuzzyScore);
            assertMatches('Tedit', 'TextEdit', '^Text^E^d^i^t', filters_1.fuzzyScore);
            assertMatches('ba', '?AB?', undefined, filters_1.fuzzyScore);
            assertMatches('bkn', 'the_black_knight', 'the_^black_^k^night', filters_1.fuzzyScore);
            assertMatches('bt', 'the_black_knight', 'the_^black_knigh^t', filters_1.fuzzyScore);
            assertMatches('ccm', 'camelCasecm', '^camel^Casec^m', filters_1.fuzzyScore);
            assertMatches('fdm', 'findModel', '^fin^d^Model', filters_1.fuzzyScore);
            assertMatches('fob', 'foobar', '^f^oo^bar', filters_1.fuzzyScore);
            assertMatches('fobz', 'foobar', undefined, filters_1.fuzzyScore);
            assertMatches('foobar', 'foobar', '^f^o^o^b^a^r', filters_1.fuzzyScore);
            assertMatches('form', 'editor.formatOnSave', 'editor.^f^o^r^matOnSave', filters_1.fuzzyScore);
            assertMatches('g p', 'Git: Pull', '^Git:^ ^Pull', filters_1.fuzzyScore);
            assertMatches('g p', 'Git: Pull', '^Git:^ ^Pull', filters_1.fuzzyScore);
            assertMatches('gip', 'Git: Pull', '^G^it: ^Pull', filters_1.fuzzyScore);
            assertMatches('gip', 'Git: Pull', '^G^it: ^Pull', filters_1.fuzzyScore);
            assertMatches('gp', 'Git: Pull', '^Git: ^Pull', filters_1.fuzzyScore);
            assertMatches('gp', 'Git_Git_Pull', '^Git_Git_^Pull', filters_1.fuzzyScore);
            assertMatches('is', 'ImportStatement', '^Import^Statement', filters_1.fuzzyScore);
            assertMatches('is', 'isValid', '^i^sValid', filters_1.fuzzyScore);
            assertMatches('lowrd', 'lowWord', '^l^o^wWo^r^d', filters_1.fuzzyScore);
            assertMatches('myvable', 'myvariable', '^m^y^v^aria^b^l^e', filters_1.fuzzyScore);
            assertMatches('no', '', undefined, filters_1.fuzzyScore);
            assertMatches('no', 'match', undefined, filters_1.fuzzyScore);
            assertMatches('ob', 'foobar', undefined, filters_1.fuzzyScore);
            assertMatches('sl', 'SVisualLoggerLogsList', '^SVisual^LoggerLogsList', filters_1.fuzzyScore);
            assertMatches('sllll', 'SVisualLoggerLogsList', '^SVisua^l^Logger^Logs^List', filters_1.fuzzyScore);
            assertMatches('Three', 'HTMLHRElement', 'H^TML^H^R^El^ement', filters_1.fuzzyScore);
            assertMatches('Three', 'Three', '^T^h^r^e^e', filters_1.fuzzyScore);
            assertMatches('fo', 'barfoo', undefined, filters_1.fuzzyScore);
            assertMatches('fo', 'bar_foo', 'bar_^f^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar_Foo', 'bar_^F^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar foo', 'bar ^f^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar.foo', 'bar.^f^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar/foo', 'bar/^f^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar\\foo', 'bar\\^f^oo', filters_1.fuzzyScore);
        });
        test('fuzzyScore, many matches', function () {
            assertMatches('aaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '^a^a^a^a^a^aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', filters_1.fuzzyScore);
        });
        test('fuzzyScore, issue #26423', function () {
            assertMatches('baba', 'abababab', undefined, filters_1.fuzzyScore);
            assertMatches('fsfsfs', 'dsafdsafdsafdsafdsafdsafdsafasdfdsa', undefined, filters_1.fuzzyScore);
            assertMatches('fsfsfsfsfsfsfsf', 'dsafdsafdsafdsafdsafdsafdsafasdfdsafdsafdsafdsafdsfdsafdsfdfdfasdnfdsajfndsjnafjndsajlknfdsa', undefined, filters_1.fuzzyScore);
        });
        test('Fuzzy IntelliSense matching vs Haxe metadata completion, #26995', function () {
            assertMatches('f', ':Foo', ':^Foo', filters_1.fuzzyScore);
            assertMatches('f', ':foo', ':^foo', filters_1.fuzzyScore);
        });
        test('Cannot set property \'1\' of undefined, #26511', function () {
            var word = new Array(123).join('a');
            var pattern = new Array(120).join('a');
            filters_1.fuzzyScore(pattern, word);
            assert.ok(true); // must not explode
        });
        test('Vscode 1.12 no longer obeys \'sortText\' in completion items (from language server), #26096', function () {
            assertMatches('  ', '  group', undefined, filters_1.fuzzyScore);
            assertMatches('  g', '  group', '  ^group', filters_1.fuzzyScore);
            assertMatches('g', '  group', '  ^group', filters_1.fuzzyScore);
            assertMatches('g g', '  groupGroup', undefined, filters_1.fuzzyScore);
            assertMatches('g g', '  group Group', '  ^group^ ^Group', filters_1.fuzzyScore);
            assertMatches(' g g', '  group Group', '  ^group^ ^Group', filters_1.fuzzyScore);
            assertMatches('zz', 'zzGroup', '^z^zGroup', filters_1.fuzzyScore);
            assertMatches('zzg', 'zzGroup', '^z^z^Group', filters_1.fuzzyScore);
            assertMatches('g', 'zzGroup', 'zz^Group', filters_1.fuzzyScore);
        });
        function assertTopScore(filter, pattern, expected) {
            var words = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                words[_i - 3] = arguments[_i];
            }
            var topScore = -(100 * 10);
            var topIdx = 0;
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                var m = filter(pattern, word);
                if (m) {
                    var score = m[0];
                    if (score > topScore) {
                        topScore = score;
                        topIdx = i;
                    }
                }
            }
            assert.equal(topIdx, expected, pattern + " -> actual=" + words[topIdx] + " <> expected=" + words[expected]);
        }
        test('topScore - fuzzyScore', function () {
            assertTopScore(filters_1.fuzzyScore, 'cons', 2, 'ArrayBufferConstructor', 'Console', 'console');
            assertTopScore(filters_1.fuzzyScore, 'Foo', 1, 'foo', 'Foo', 'foo');
            // #24904
            assertTopScore(filters_1.fuzzyScore, 'onMess', 1, 'onmessage', 'onMessage', 'onThisMegaEscape');
            assertTopScore(filters_1.fuzzyScore, 'CC', 1, 'camelCase', 'CamelCase');
            assertTopScore(filters_1.fuzzyScore, 'cC', 0, 'camelCase', 'CamelCase');
            // assertTopScore(fuzzyScore, 'cC', 1, 'ccfoo', 'camelCase');
            // assertTopScore(fuzzyScore, 'cC', 1, 'ccfoo', 'camelCase', 'foo-cC-bar');
            // issue #17836
            // assertTopScore(fuzzyScore, 'TEdit', 1, 'TextEditorDecorationType', 'TextEdit', 'TextEditor');
            assertTopScore(filters_1.fuzzyScore, 'p', 4, 'parse', 'posix', 'pafdsa', 'path', 'p');
            assertTopScore(filters_1.fuzzyScore, 'pa', 0, 'parse', 'pafdsa', 'path');
            // issue #14583
            assertTopScore(filters_1.fuzzyScore, 'log', 3, 'HTMLOptGroupElement', 'ScrollLogicalPosition', 'SVGFEMorphologyElement', 'log', 'logger');
            assertTopScore(filters_1.fuzzyScore, 'e', 2, 'AbstractWorker', 'ActiveXObject', 'else');
            // issue #14446
            assertTopScore(filters_1.fuzzyScore, 'workbench.sideb', 1, 'workbench.editor.defaultSideBySideLayout', 'workbench.sideBar.location');
            // issue #11423
            assertTopScore(filters_1.fuzzyScore, 'editor.r', 2, 'diffEditor.renderSideBySide', 'editor.overviewRulerlanes', 'editor.renderControlCharacter', 'editor.renderWhitespace');
            // assertTopScore(fuzzyScore, 'editor.R', 1, 'diffEditor.renderSideBySide', 'editor.overviewRulerlanes', 'editor.renderControlCharacter', 'editor.renderWhitespace');
            // assertTopScore(fuzzyScore, 'Editor.r', 0, 'diffEditor.renderSideBySide', 'editor.overviewRulerlanes', 'editor.renderControlCharacter', 'editor.renderWhitespace');
            assertTopScore(filters_1.fuzzyScore, '-mo', 1, '-ms-ime-mode', '-moz-columns');
            // // dupe, issue #14861
            assertTopScore(filters_1.fuzzyScore, 'convertModelPosition', 0, 'convertModelPositionToViewPosition', 'convertViewToModelPosition');
            // // dupe, issue #14942
            assertTopScore(filters_1.fuzzyScore, 'is', 0, 'isValidViewletId', 'import statement');
            assertTopScore(filters_1.fuzzyScore, 'title', 1, 'files.trimTrailingWhitespace', 'window.title');
            assertTopScore(filters_1.fuzzyScore, 'const', 1, 'constructor', 'const', 'cuOnstrul');
        });
        test('Unexpected suggestion scoring, #28791', function () {
            assertTopScore(filters_1.fuzzyScore, '_lines', 1, '_lineStarts', '_lines');
            assertTopScore(filters_1.fuzzyScore, '_lines', 1, '_lineS', '_lines');
            assertTopScore(filters_1.fuzzyScore, '_lineS', 0, '_lineS', '_lines');
        });
        test('HTML closing tag proposal filtered out #38880', function () {
            assertMatches('\t\t<', '\t\t</body>', '^\t^\t^</body>', function (pattern, word) { return filters_1.fuzzyScore(pattern, word, 0); });
            assertMatches('\t\t<', '\t\t</body>', '\t\t^</body>', function (pattern, word) { return filters_1.fuzzyScore(pattern, word, 3); });
            assertMatches('\t<', '\t</body>', '\t^</body>', function (pattern, word) { return filters_1.fuzzyScore(pattern, word, 2); });
        });
        test('fuzzyScoreGraceful', function () {
            assertMatches('rlut', 'result', undefined, filters_1.fuzzyScore);
            assertMatches('rlut', 'result', '^res^u^l^t', filters_1.fuzzyScoreGraceful);
            assertMatches('cno', 'console', '^co^ns^ole', filters_1.fuzzyScore);
            assertMatches('cno', 'console', '^co^ns^ole', filters_1.fuzzyScoreGraceful);
            assertMatches('cno', 'console', '^c^o^nsole', filters_1.fuzzyScoreGracefulAggressive);
            assertMatches('cno', 'co_new', '^c^o_^new', filters_1.fuzzyScoreGraceful);
            assertMatches('cno', 'co_new', '^c^o_^new', filters_1.fuzzyScoreGracefulAggressive);
        });
    });
});
