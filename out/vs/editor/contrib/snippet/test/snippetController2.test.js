define(["require", "exports", "assert", "vs/editor/common/core/selection", "vs/editor/contrib/snippet/snippetController2", "vs/editor/test/browser/testCodeEditor", "vs/editor/common/model/textModel", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log"], function (require, exports, assert, selection_1, snippetController2_1, testCodeEditor_1, textModel_1, mockKeybindingService_1, log_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SnippetController2', function () {
        function assertSelections(editor) {
            var s = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                s[_i - 1] = arguments[_i];
            }
            for (var _a = 0, _b = editor.getSelections(); _a < _b.length; _a++) {
                var selection = _b[_a];
                var actual = s.shift();
                assert.ok(selection.equalsSelection(actual), "actual=" + selection.toString() + " <> expected=" + actual.toString());
            }
            assert.equal(s.length, 0);
        }
        function assertContextKeys(service, inSnippet, hasPrev, hasNext) {
            assert.equal(snippetController2_1.SnippetController2.InSnippetMode.getValue(service), inSnippet, "inSnippetMode");
            assert.equal(snippetController2_1.SnippetController2.HasPrevTabstop.getValue(service), hasPrev, "HasPrevTabstop");
            assert.equal(snippetController2_1.SnippetController2.HasNextTabstop.getValue(service), hasNext, "HasNextTabstop");
        }
        var editor;
        var model;
        var contextKeys;
        var logService = new log_1.NullLogService();
        setup(function () {
            contextKeys = new mockKeybindingService_1.MockContextKeyService();
            model = textModel_1.TextModel.createFromString('if\n    $state\nfi');
            editor = testCodeEditor_1.createTestCodeEditor(model);
            editor.setSelections([new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5)]);
            assert.equal(model.getEOL(), '\n');
        });
        teardown(function () {
            model.dispose();
        });
        test('creation', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            assertContextKeys(contextKeys, false, false, false);
            ctrl.dispose();
        });
        test('insert, insert -> abort', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('foo${1:bar}foo$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            ctrl.cancel();
            assertContextKeys(contextKeys, false, false, false);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
        });
        test('insert, insert -> tab, tab, done', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('${1:one}${2:two}$0');
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertContextKeys(contextKeys, true, true, true);
            ctrl.next();
            assertContextKeys(contextKeys, false, false, false);
            editor.trigger('test', 'type', { text: '\t' });
            assert.equal(snippetController2_1.SnippetController2.InSnippetMode.getValue(contextKeys), false);
            assert.equal(snippetController2_1.SnippetController2.HasNextTabstop.getValue(contextKeys), false);
            assert.equal(snippetController2_1.SnippetController2.HasPrevTabstop.getValue(contextKeys), false);
        });
        test('insert, insert -> cursor moves out (left/right)', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('foo${1:bar}foo$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            // bad selection change
            editor.setSelections([new selection_1.Selection(1, 12, 1, 12), new selection_1.Selection(2, 16, 2, 16)]);
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, insert -> cursor moves out (up/down)', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('foo${1:bar}foo$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            // bad selection change
            editor.setSelections([new selection_1.Selection(2, 4, 2, 7), new selection_1.Selection(3, 8, 3, 11)]);
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, insert -> cursors collapse', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('foo${1:bar}foo$0');
            assert.equal(snippetController2_1.SnippetController2.InSnippetMode.getValue(contextKeys), true);
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 7), new selection_1.Selection(2, 8, 2, 11));
            // bad selection change
            editor.setSelections([new selection_1.Selection(1, 4, 1, 7)]);
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, insert plain text -> no snippet mode', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('foobar');
            assertContextKeys(contextKeys, false, false, false);
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
        });
        test('insert, delete snippet text', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('${1:foobar}$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 7), new selection_1.Selection(2, 5, 2, 11));
            editor.trigger('test', 'cut', {});
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 5, 2, 5));
            editor.trigger('test', 'type', { text: 'abc' });
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertContextKeys(contextKeys, false, false, false);
            editor.trigger('test', 'tab', {});
            assertContextKeys(contextKeys, false, false, false);
            // editor.trigger('test', 'type', { text: 'abc' });
            // assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, nested snippet', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('${1:foobar}$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 7), new selection_1.Selection(2, 5, 2, 11));
            ctrl.insert('far$1boo$0');
            assertSelections(editor, new selection_1.Selection(1, 4, 1, 4), new selection_1.Selection(2, 8, 2, 8));
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            assertContextKeys(contextKeys, true, true, true);
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            assertContextKeys(contextKeys, false, false, false);
        });
        test('insert, nested plain text', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('${1:foobar}$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 7), new selection_1.Selection(2, 5, 2, 11));
            ctrl.insert('farboo');
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(1, 7, 1, 7), new selection_1.Selection(2, 11, 2, 11));
            assertContextKeys(contextKeys, false, false, false);
        });
        test('Nested snippets without final placeholder jumps to next outer placeholder, #27898', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('for(const ${1:element} of ${2:array}) {$0}');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 11, 1, 18), new selection_1.Selection(2, 15, 2, 22));
            ctrl.next();
            assertContextKeys(contextKeys, true, true, true);
            assertSelections(editor, new selection_1.Selection(1, 22, 1, 27), new selection_1.Selection(2, 26, 2, 31));
            ctrl.insert('document');
            assertContextKeys(contextKeys, true, true, true);
            assertSelections(editor, new selection_1.Selection(1, 30, 1, 30), new selection_1.Selection(2, 34, 2, 34));
            ctrl.next();
            assertContextKeys(contextKeys, false, false, false);
        });
        test('Inconsistent tab stop behaviour with recursive snippets and tab / shift tab, #27543', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            ctrl.insert('1_calize(${1:nl}, \'${2:value}\')$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 10, 1, 12), new selection_1.Selection(2, 14, 2, 16));
            ctrl.insert('2_calize(${1:nl}, \'${2:value}\')$0');
            assertSelections(editor, new selection_1.Selection(1, 19, 1, 21), new selection_1.Selection(2, 23, 2, 25));
            ctrl.next(); // inner `value`
            assertSelections(editor, new selection_1.Selection(1, 24, 1, 29), new selection_1.Selection(2, 28, 2, 33));
            ctrl.next(); // inner `$0`
            assertSelections(editor, new selection_1.Selection(1, 31, 1, 31), new selection_1.Selection(2, 35, 2, 35));
            ctrl.next(); // outer `value`
            assertSelections(editor, new selection_1.Selection(1, 34, 1, 39), new selection_1.Selection(2, 38, 2, 43));
            ctrl.prev(); // inner `$0`
            assertSelections(editor, new selection_1.Selection(1, 31, 1, 31), new selection_1.Selection(2, 35, 2, 35));
        });
        test('Snippet tabstop selecting content of previously entered variable only works when separated by space, #23728', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('import ${2:${1:module}} from \'${1:module}\'$0');
            assertContextKeys(contextKeys, true, false, true);
            assertSelections(editor, new selection_1.Selection(1, 8, 1, 14), new selection_1.Selection(1, 21, 1, 27));
            ctrl.insert('foo');
            assertSelections(editor, new selection_1.Selection(1, 11, 1, 11), new selection_1.Selection(1, 21, 1, 21));
            ctrl.next(); // ${2:...}
            assertSelections(editor, new selection_1.Selection(1, 8, 1, 11));
        });
        test('HTML Snippets Combine, #32211', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            model.setValue('');
            model.updateOptions({ insertSpaces: false, tabSize: 4, trimAutoWhitespace: false });
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert("\n\t\t\t<!DOCTYPE html>\n\t\t\t<html lang=\"en\">\n\t\t\t<head>\n\t\t\t\t<meta charset=\"UTF-8\">\n\t\t\t\t<meta name=\"viewport\" content=\"width=${2:device-width}, initial-scale=${3:1.0}\">\n\t\t\t\t<meta http-equiv=\"X-UA-Compatible\" content=\"${5:ie=edge}\">\n\t\t\t\t<title>${7:Document}</title>\n\t\t\t</head>\n\t\t\t<body>\n\t\t\t\t${8}\n\t\t\t</body>\n\t\t\t</html>\n\t\t");
            ctrl.next();
            ctrl.next();
            ctrl.next();
            ctrl.next();
            assertSelections(editor, new selection_1.Selection(11, 5, 11, 5));
            ctrl.insert('<input type="${2:text}">');
            assertSelections(editor, new selection_1.Selection(11, 18, 11, 22));
        });
        test('Problems with nested snippet insertion #39594', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('$1 = ConvertTo-Json $1');
            assertSelections(editor, new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(1, 19, 1, 19));
            editor.setSelection(new selection_1.Selection(1, 19, 1, 19));
            // snippet mode should stop because $1 has two occurrences
            // and we only have one selection left
            assertContextKeys(contextKeys, false, false, false);
        });
        test('Problems with nested snippet insertion #39594', function () {
            // ensure selection-change-to-cancel logic isn't too aggressive
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            model.setValue('a-\naaa-');
            editor.setSelections([new selection_1.Selection(2, 5, 2, 5), new selection_1.Selection(1, 3, 1, 3)]);
            ctrl.insert('log($1);$0');
            assertSelections(editor, new selection_1.Selection(2, 9, 2, 9), new selection_1.Selection(1, 7, 1, 7));
            assertContextKeys(contextKeys, true, false, true);
        });
        test('“Nested” snippets terminating abruptly in VSCode 1.19.2. #42012', function () {
            var ctrl = new snippetController2_1.SnippetController2(editor, logService, contextKeys);
            model.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            ctrl.insert('var ${2:${1:name}} = ${1:name} + 1;${0}');
            assertSelections(editor, new selection_1.Selection(1, 5, 1, 9), new selection_1.Selection(1, 12, 1, 16));
            assertContextKeys(contextKeys, true, false, true);
            ctrl.next();
            assertContextKeys(contextKeys, true, true, true);
        });
    });
});
