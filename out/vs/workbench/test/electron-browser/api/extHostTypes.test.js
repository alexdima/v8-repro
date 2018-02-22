/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/node/extHostTypes", "vs/base/common/platform"], function (require, exports, assert, uri_1, types, platform_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertToJSON(a, expected) {
        var raw = JSON.stringify(a);
        var actual = JSON.parse(raw);
        assert.deepEqual(actual, expected);
    }
    suite('ExtHostTypes', function () {
        test('URI, toJSON', function () {
            var uri = uri_1.default.parse('file:///path/test.file');
            var data = uri.toJSON();
            assert.deepEqual(data, {
                $mid: 1,
                scheme: 'file',
                path: '/path/test.file',
                fsPath: '/path/test.file'.replace(/\//g, platform_1.isWindows ? '\\' : '/'),
                external: 'file:///path/test.file'
            });
        });
        test('Disposable', function () {
            var count = 0;
            var d = new types.Disposable(function () {
                count += 1;
                return 12;
            });
            d.dispose();
            assert.equal(count, 1);
            d.dispose();
            assert.equal(count, 1);
            types.Disposable.from(undefined, { dispose: function () { count += 1; } }).dispose();
            assert.equal(count, 2);
            assert.throws(function () {
                new types.Disposable(function () {
                    throw new Error();
                }).dispose();
            });
            new types.Disposable(undefined).dispose();
        });
        test('Position', function () {
            assert.throws(function () { return new types.Position(-1, 0); });
            assert.throws(function () { return new types.Position(0, -1); });
            var pos = new types.Position(0, 0);
            assert.throws(function () { return pos.line = -1; });
            assert.throws(function () { return pos.character = -1; });
            assert.throws(function () { return pos.line = 12; });
            var _a = pos.toJSON(), line = _a.line, character = _a.character;
            assert.equal(line, 0);
            assert.equal(character, 0);
        });
        test('Position, toJSON', function () {
            var pos = new types.Position(4, 2);
            assertToJSON(pos, { line: 4, character: 2 });
        });
        test('Position, isBefore(OrEqual)?', function () {
            var p1 = new types.Position(1, 3);
            var p2 = new types.Position(1, 2);
            var p3 = new types.Position(0, 4);
            assert.ok(p1.isBeforeOrEqual(p1));
            assert.ok(!p1.isBefore(p1));
            assert.ok(p2.isBefore(p1));
            assert.ok(p3.isBefore(p2));
        });
        test('Position, isAfter(OrEqual)?', function () {
            var p1 = new types.Position(1, 3);
            var p2 = new types.Position(1, 2);
            var p3 = new types.Position(0, 4);
            assert.ok(p1.isAfterOrEqual(p1));
            assert.ok(!p1.isAfter(p1));
            assert.ok(p1.isAfter(p2));
            assert.ok(p2.isAfter(p3));
            assert.ok(p1.isAfter(p3));
        });
        test('Position, compareTo', function () {
            var p1 = new types.Position(1, 3);
            var p2 = new types.Position(1, 2);
            var p3 = new types.Position(0, 4);
            assert.equal(p1.compareTo(p1), 0);
            assert.equal(p2.compareTo(p1), -1);
            assert.equal(p1.compareTo(p2), 1);
            assert.equal(p2.compareTo(p3), 1);
            assert.equal(p1.compareTo(p3), 1);
        });
        test('Position, translate', function () {
            var p1 = new types.Position(1, 3);
            assert.ok(p1.translate() === p1);
            assert.ok(p1.translate({}) === p1);
            assert.ok(p1.translate(0, 0) === p1);
            assert.ok(p1.translate(0) === p1);
            assert.ok(p1.translate(undefined, 0) === p1);
            assert.ok(p1.translate(undefined) === p1);
            var res = p1.translate(-1);
            assert.equal(res.line, 0);
            assert.equal(res.character, 3);
            res = p1.translate({ lineDelta: -1 });
            assert.equal(res.line, 0);
            assert.equal(res.character, 3);
            res = p1.translate(undefined, -1);
            assert.equal(res.line, 1);
            assert.equal(res.character, 2);
            res = p1.translate({ characterDelta: -1 });
            assert.equal(res.line, 1);
            assert.equal(res.character, 2);
            res = p1.translate(11);
            assert.equal(res.line, 12);
            assert.equal(res.character, 3);
            assert.throws(function () { return p1.translate(null); });
            assert.throws(function () { return p1.translate(null, null); });
            assert.throws(function () { return p1.translate(-2); });
            assert.throws(function () { return p1.translate({ lineDelta: -2 }); });
            assert.throws(function () { return p1.translate(-2, null); });
            assert.throws(function () { return p1.translate(0, -4); });
        });
        test('Position, with', function () {
            var p1 = new types.Position(1, 3);
            assert.ok(p1.with() === p1);
            assert.ok(p1.with(1) === p1);
            assert.ok(p1.with(undefined, 3) === p1);
            assert.ok(p1.with(1, 3) === p1);
            assert.ok(p1.with(undefined) === p1);
            assert.ok(p1.with({ line: 1 }) === p1);
            assert.ok(p1.with({ character: 3 }) === p1);
            assert.ok(p1.with({ line: 1, character: 3 }) === p1);
            var p2 = p1.with({ line: 0, character: 11 });
            assert.equal(p2.line, 0);
            assert.equal(p2.character, 11);
            assert.throws(function () { return p1.with(null); });
            assert.throws(function () { return p1.with(-9); });
            assert.throws(function () { return p1.with(0, -9); });
            assert.throws(function () { return p1.with({ line: -1 }); });
            assert.throws(function () { return p1.with({ character: -1 }); });
        });
        test('Range', function () {
            assert.throws(function () { return new types.Range(-1, 0, 0, 0); });
            assert.throws(function () { return new types.Range(0, -1, 0, 0); });
            assert.throws(function () { return new types.Range(new types.Position(0, 0), undefined); });
            assert.throws(function () { return new types.Range(new types.Position(0, 0), null); });
            assert.throws(function () { return new types.Range(undefined, new types.Position(0, 0)); });
            assert.throws(function () { return new types.Range(null, new types.Position(0, 0)); });
            var range = new types.Range(1, 0, 0, 0);
            assert.throws(function () { return range.start = null; });
            assert.throws(function () { return range.start = new types.Position(0, 3); });
        });
        test('Range, toJSON', function () {
            var range = new types.Range(1, 2, 3, 4);
            assertToJSON(range, [{ line: 1, character: 2 }, { line: 3, character: 4 }]);
        });
        test('Range, sorting', function () {
            // sorts start/end
            var range = new types.Range(1, 0, 0, 0);
            assert.equal(range.start.line, 0);
            assert.equal(range.end.line, 1);
            range = new types.Range(0, 0, 1, 0);
            assert.equal(range.start.line, 0);
            assert.equal(range.end.line, 1);
        });
        test('Range, isEmpty|isSingleLine', function () {
            var range = new types.Range(1, 0, 0, 0);
            assert.ok(!range.isEmpty);
            assert.ok(!range.isSingleLine);
            range = new types.Range(1, 1, 1, 1);
            assert.ok(range.isEmpty);
            assert.ok(range.isSingleLine);
            range = new types.Range(0, 1, 0, 11);
            assert.ok(!range.isEmpty);
            assert.ok(range.isSingleLine);
            range = new types.Range(0, 0, 1, 1);
            assert.ok(!range.isEmpty);
            assert.ok(!range.isSingleLine);
        });
        test('Range, contains', function () {
            var range = new types.Range(1, 1, 2, 11);
            assert.ok(range.contains(range.start));
            assert.ok(range.contains(range.end));
            assert.ok(range.contains(range));
            assert.ok(!range.contains(new types.Range(1, 0, 2, 11)));
            assert.ok(!range.contains(new types.Range(0, 1, 2, 11)));
            assert.ok(!range.contains(new types.Range(1, 1, 2, 12)));
            assert.ok(!range.contains(new types.Range(1, 1, 3, 11)));
        });
        test('Range, intersection', function () {
            var range = new types.Range(1, 1, 2, 11);
            var res;
            res = range.intersection(range);
            assert.equal(res.start.line, 1);
            assert.equal(res.start.character, 1);
            assert.equal(res.end.line, 2);
            assert.equal(res.end.character, 11);
            res = range.intersection(new types.Range(2, 12, 4, 0));
            assert.equal(res, undefined);
            res = range.intersection(new types.Range(0, 0, 1, 0));
            assert.equal(res, undefined);
            res = range.intersection(new types.Range(0, 0, 1, 1));
            assert.ok(res.isEmpty);
            assert.equal(res.start.line, 1);
            assert.equal(res.start.character, 1);
            res = range.intersection(new types.Range(2, 11, 61, 1));
            assert.ok(res.isEmpty);
            assert.equal(res.start.line, 2);
            assert.equal(res.start.character, 11);
            assert.throws(function () { return range.intersection(null); });
            assert.throws(function () { return range.intersection(undefined); });
        });
        test('Range, union', function () {
            var ran1 = new types.Range(0, 0, 5, 5);
            assert.ok(ran1.union(new types.Range(0, 0, 1, 1)) === ran1);
            var res;
            res = ran1.union(new types.Range(2, 2, 9, 9));
            assert.ok(res.start === ran1.start);
            assert.equal(res.end.line, 9);
            assert.equal(res.end.character, 9);
            ran1 = new types.Range(2, 1, 5, 3);
            res = ran1.union(new types.Range(1, 0, 4, 2));
            assert.ok(res.end === ran1.end);
            assert.equal(res.start.line, 1);
            assert.equal(res.start.character, 0);
        });
        test('Range, with', function () {
            var range = new types.Range(1, 1, 2, 11);
            assert.ok(range.with(range.start) === range);
            assert.ok(range.with(undefined, range.end) === range);
            assert.ok(range.with(range.start, range.end) === range);
            assert.ok(range.with(new types.Position(1, 1)) === range);
            assert.ok(range.with(undefined, new types.Position(2, 11)) === range);
            assert.ok(range.with() === range);
            assert.ok(range.with({ start: range.start }) === range);
            assert.ok(range.with({ start: new types.Position(1, 1) }) === range);
            assert.ok(range.with({ end: range.end }) === range);
            assert.ok(range.with({ end: new types.Position(2, 11) }) === range);
            var res = range.with(undefined, new types.Position(9, 8));
            assert.equal(res.end.line, 9);
            assert.equal(res.end.character, 8);
            assert.equal(res.start.line, 1);
            assert.equal(res.start.character, 1);
            res = range.with({ end: new types.Position(9, 8) });
            assert.equal(res.end.line, 9);
            assert.equal(res.end.character, 8);
            assert.equal(res.start.line, 1);
            assert.equal(res.start.character, 1);
            res = range.with({ end: new types.Position(9, 8), start: new types.Position(2, 3) });
            assert.equal(res.end.line, 9);
            assert.equal(res.end.character, 8);
            assert.equal(res.start.line, 2);
            assert.equal(res.start.character, 3);
            assert.throws(function () { return range.with(null); });
            assert.throws(function () { return range.with(undefined, null); });
        });
        test('TextEdit', function () {
            var range = new types.Range(1, 1, 2, 11);
            var edit = new types.TextEdit(range, undefined);
            assert.equal(edit.newText, '');
            assertToJSON(edit, { range: [{ line: 1, character: 1 }, { line: 2, character: 11 }], newText: '' });
            edit = new types.TextEdit(range, null);
            assert.equal(edit.newText, '');
            edit = new types.TextEdit(range, '');
            assert.equal(edit.newText, '');
        });
        test('WorkspaceEdit', function () {
            var a = uri_1.default.file('a.ts');
            var b = uri_1.default.file('b.ts');
            var edit = new types.WorkspaceEdit();
            assert.ok(!edit.has(a));
            edit.set(a, [types.TextEdit.insert(new types.Position(0, 0), 'fff')]);
            assert.ok(edit.has(a));
            assert.equal(edit.size, 1);
            assertToJSON(edit, [[uri_1.default.parse('file:///a.ts').toJSON(), [{ range: [{ line: 0, character: 0 }, { line: 0, character: 0 }], newText: 'fff' }]]]);
            edit.insert(b, new types.Position(1, 1), 'fff');
            edit.delete(b, new types.Range(0, 0, 0, 0));
            assert.ok(edit.has(b));
            assert.equal(edit.size, 2);
            assertToJSON(edit, [
                [uri_1.default.parse('file:///a.ts').toJSON(), [{ range: [{ line: 0, character: 0 }, { line: 0, character: 0 }], newText: 'fff' }]],
                [uri_1.default.parse('file:///b.ts').toJSON(), [{ range: [{ line: 1, character: 1 }, { line: 1, character: 1 }], newText: 'fff' }, { range: [{ line: 0, character: 0 }, { line: 0, character: 0 }], newText: '' }]]
            ]);
            edit.set(b, undefined);
            assert.ok(edit.has(b));
            assert.equal(edit.size, 2);
            edit.set(b, [types.TextEdit.insert(new types.Position(0, 0), 'ffff')]);
            assert.equal(edit.get(b).length, 1);
        });
        // test('WorkspaceEdit should fail when editing deleted resource', () => {
        // 	const resource = URI.parse('file:///a.ts');
        // 	const edit = new types.WorkspaceEdit();
        // 	edit.deleteResource(resource);
        // 	try {
        // 		edit.insert(resource, new types.Position(0, 0), '');
        // 		assert.fail(false, 'Should disallow edit of deleted resource');
        // 	} catch {
        // 		// expected
        // 	}
        // });
        // test('WorkspaceEdit - keep order of text and file changes', function () {
        // 	const edit = new types.WorkspaceEdit();
        // 	edit.replace(URI.parse('foo:a'), new types.Range(1, 1, 1, 1), 'foo');
        // 	edit.renameResource(URI.parse('foo:a'), URI.parse('foo:b'));
        // 	edit.replace(URI.parse('foo:a'), new types.Range(2, 1, 2, 1), 'bar');
        // 	edit.replace(URI.parse('foo:b'), new types.Range(3, 1, 3, 1), 'bazz');
        // 	const all = edit.allEntries();
        // 	assert.equal(all.length, 3);
        // 	function isFileChange(thing: [URI, types.TextEdit[]] | [URI, URI]): thing is [URI, URI] {
        // 		const [f, s] = thing;
        // 		return URI.isUri(f) && URI.isUri(s);
        // 	}
        // 	function isTextChange(thing: [URI, types.TextEdit[]] | [URI, URI]): thing is [URI, types.TextEdit[]] {
        // 		const [f, s] = thing;
        // 		return URI.isUri(f) && Array.isArray(s);
        // 	}
        // 	const [first, second, third] = all;
        // 	assert.equal(first[0].toString(), 'foo:a');
        // 	assert.ok(!isFileChange(first));
        // 	assert.ok(isTextChange(first) && first[1].length === 2);
        // 	assert.equal(second[0].toString(), 'foo:a');
        // 	assert.ok(isFileChange(second));
        // 	assert.equal(third[0].toString(), 'foo:b');
        // 	assert.ok(!isFileChange(third));
        // 	assert.ok(isTextChange(third) && third[1].length === 1);
        // });
        test('DocumentLink', function () {
            assert.throws(function () { return new types.DocumentLink(null, null); });
            assert.throws(function () { return new types.DocumentLink(new types.Range(1, 1, 1, 1), null); });
        });
        test('toJSON & stringify', function () {
            assertToJSON(new types.Selection(3, 4, 2, 1), { start: { line: 2, character: 1 }, end: { line: 3, character: 4 }, anchor: { line: 3, character: 4 }, active: { line: 2, character: 1 } });
            assertToJSON(new types.Location(uri_1.default.file('u.ts'), new types.Position(3, 4)), { uri: uri_1.default.parse('file:///u.ts').toJSON(), range: [{ line: 3, character: 4 }, { line: 3, character: 4 }] });
            assertToJSON(new types.Location(uri_1.default.file('u.ts'), new types.Range(1, 2, 3, 4)), { uri: uri_1.default.parse('file:///u.ts').toJSON(), range: [{ line: 1, character: 2 }, { line: 3, character: 4 }] });
            var diag = new types.Diagnostic(new types.Range(0, 1, 2, 3), 'hello');
            assertToJSON(diag, { severity: 'Error', message: 'hello', range: [{ line: 0, character: 1 }, { line: 2, character: 3 }] });
            diag.source = 'me';
            assertToJSON(diag, { severity: 'Error', message: 'hello', range: [{ line: 0, character: 1 }, { line: 2, character: 3 }], source: 'me' });
            assertToJSON(new types.DocumentHighlight(new types.Range(2, 3, 4, 5)), { range: [{ line: 2, character: 3 }, { line: 4, character: 5 }], kind: 'Text' });
            assertToJSON(new types.DocumentHighlight(new types.Range(2, 3, 4, 5), types.DocumentHighlightKind.Read), { range: [{ line: 2, character: 3 }, { line: 4, character: 5 }], kind: 'Read' });
            assertToJSON(new types.SymbolInformation('test', types.SymbolKind.Boolean, new types.Range(0, 1, 2, 3)), {
                name: 'test',
                kind: 'Boolean',
                location: {
                    range: [{ line: 0, character: 1 }, { line: 2, character: 3 }]
                }
            });
            assertToJSON(new types.CodeLens(new types.Range(7, 8, 9, 10)), { range: [{ line: 7, character: 8 }, { line: 9, character: 10 }] });
            assertToJSON(new types.CodeLens(new types.Range(7, 8, 9, 10), { command: 'id', title: 'title' }), {
                range: [{ line: 7, character: 8 }, { line: 9, character: 10 }],
                command: { command: 'id', title: 'title' }
            });
            assertToJSON(new types.CompletionItem('complete'), { label: 'complete' });
            var item = new types.CompletionItem('complete');
            item.kind = types.CompletionItemKind.Interface;
            assertToJSON(item, { label: 'complete', kind: 'Interface' });
        });
        test('SymbolInformation, old ctor', function () {
            var info = new types.SymbolInformation('foo', types.SymbolKind.Array, new types.Range(1, 1, 2, 3));
            assert.ok(info.location instanceof types.Location);
            assert.equal(info.location.uri, undefined);
        });
        test('SnippetString, builder-methods', function () {
            var string;
            string = new types.SnippetString();
            assert.equal(string.appendText('I need $ and $').value, 'I need \\$ and \\$');
            string = new types.SnippetString();
            assert.equal(string.appendText('I need \\$').value, 'I need \\\\\\$');
            string = new types.SnippetString();
            string.appendPlaceholder('fo$o}');
            assert.equal(string.value, '${1:fo\\$o\\}}');
            string = new types.SnippetString();
            string.appendText('foo').appendTabstop(0).appendText('bar');
            assert.equal(string.value, 'foo$0bar');
            string = new types.SnippetString();
            string.appendText('foo').appendTabstop().appendText('bar');
            assert.equal(string.value, 'foo$1bar');
            string = new types.SnippetString();
            string.appendText('foo').appendTabstop(42).appendText('bar');
            assert.equal(string.value, 'foo$42bar');
            string = new types.SnippetString();
            string.appendText('foo').appendPlaceholder('farboo').appendText('bar');
            assert.equal(string.value, 'foo${1:farboo}bar');
            string = new types.SnippetString();
            string.appendText('foo').appendPlaceholder('far$boo').appendText('bar');
            assert.equal(string.value, 'foo${1:far\\$boo}bar');
            string = new types.SnippetString();
            string.appendText('foo').appendPlaceholder(function (b) { return b.appendText('abc').appendPlaceholder('nested'); }).appendText('bar');
            assert.equal(string.value, 'foo${1:abc${2:nested}}bar');
            string = new types.SnippetString();
            string.appendVariable('foo');
            assert.equal(string.value, '${foo}');
            string = new types.SnippetString();
            string.appendText('foo').appendVariable('TM_SELECTED_TEXT').appendText('bar');
            assert.equal(string.value, 'foo${TM_SELECTED_TEXT}bar');
            string = new types.SnippetString();
            string.appendVariable('BAR', function (b) { return b.appendPlaceholder('ops'); });
            assert.equal(string.value, '${BAR:${1:ops}}');
            string = new types.SnippetString();
            string.appendVariable('BAR', function (b) { });
            assert.equal(string.value, '${BAR}');
        });
    });
});
