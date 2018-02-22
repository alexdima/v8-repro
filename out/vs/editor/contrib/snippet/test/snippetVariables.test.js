define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/common/core/selection", "vs/editor/contrib/snippet/snippetVariables", "vs/editor/contrib/snippet/snippetParser", "vs/editor/common/model/textModel"], function (require, exports, assert, platform_1, uri_1, selection_1, snippetVariables_1, snippetParser_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Snippet Variables Resolver', function () {
        var model;
        var resolver;
        setup(function () {
            model = textModel_1.TextModel.createFromString([
                'this is line one',
                'this is line two',
                '    this is line three'
            ].join('\n'), undefined, undefined, uri_1.default.parse('file:///foo/files/text.txt'));
            resolver = new snippetVariables_1.CompositeSnippetVariableResolver([
                new snippetVariables_1.ModelBasedVariableResolver(model),
                new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(1, 1, 1, 1)),
            ]);
        });
        teardown(function () {
            model.dispose();
        });
        function assertVariableResolve(resolver, varName, expected) {
            var snippet = new snippetParser_1.SnippetParser().parse("$" + varName);
            var variable = snippet.children[0];
            variable.resolve(resolver);
            if (variable.children.length === 0) {
                assert.equal(undefined, expected);
            }
            else {
                assert.equal(variable.toString(), expected);
            }
        }
        test('editor variables, basics', function () {
            assertVariableResolve(resolver, 'TM_FILENAME', 'text.txt');
            assertVariableResolve(resolver, 'something', undefined);
        });
        test('editor variables, file/dir', function () {
            assertVariableResolve(resolver, 'TM_FILENAME', 'text.txt');
            if (!platform_1.isWindows) {
                assertVariableResolve(resolver, 'TM_DIRECTORY', '/foo/files');
                assertVariableResolve(resolver, 'TM_FILEPATH', '/foo/files/text.txt');
            }
            resolver = new snippetVariables_1.ModelBasedVariableResolver(textModel_1.TextModel.createFromString('', undefined, undefined, uri_1.default.parse('http://www.pb.o/abc/def/ghi')));
            assertVariableResolve(resolver, 'TM_FILENAME', 'ghi');
            if (!platform_1.isWindows) {
                assertVariableResolve(resolver, 'TM_DIRECTORY', '/abc/def');
                assertVariableResolve(resolver, 'TM_FILEPATH', '/abc/def/ghi');
            }
            resolver = new snippetVariables_1.ModelBasedVariableResolver(textModel_1.TextModel.createFromString('', undefined, undefined, uri_1.default.parse('mem:fff.ts')));
            assertVariableResolve(resolver, 'TM_DIRECTORY', '');
            assertVariableResolve(resolver, 'TM_FILEPATH', 'fff.ts');
        });
        test('editor variables, selection', function () {
            resolver = new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(1, 2, 2, 3));
            assertVariableResolve(resolver, 'TM_SELECTED_TEXT', 'his is line one\nth');
            assertVariableResolve(resolver, 'TM_CURRENT_LINE', 'this is line two');
            assertVariableResolve(resolver, 'TM_LINE_INDEX', '1');
            assertVariableResolve(resolver, 'TM_LINE_NUMBER', '2');
            resolver = new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(2, 3, 1, 2));
            assertVariableResolve(resolver, 'TM_SELECTED_TEXT', 'his is line one\nth');
            assertVariableResolve(resolver, 'TM_CURRENT_LINE', 'this is line one');
            assertVariableResolve(resolver, 'TM_LINE_INDEX', '0');
            assertVariableResolve(resolver, 'TM_LINE_NUMBER', '1');
            resolver = new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(1, 2, 1, 2));
            assertVariableResolve(resolver, 'TM_SELECTED_TEXT', undefined);
            assertVariableResolve(resolver, 'TM_CURRENT_WORD', 'this');
            resolver = new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(3, 1, 3, 1));
            assertVariableResolve(resolver, 'TM_CURRENT_WORD', undefined);
        });
        test('TextmateSnippet, resolve variable', function () {
            var snippet = new snippetParser_1.SnippetParser().parse('"$TM_CURRENT_WORD"', true);
            assert.equal(snippet.toString(), '""');
            snippet.resolveVariables(resolver);
            assert.equal(snippet.toString(), '"this"');
        });
        test('TextmateSnippet, resolve variable with default', function () {
            var snippet = new snippetParser_1.SnippetParser().parse('"${TM_CURRENT_WORD:foo}"', true);
            assert.equal(snippet.toString(), '"foo"');
            snippet.resolveVariables(resolver);
            assert.equal(snippet.toString(), '"this"');
        });
        test('More useful environment variables for snippets, #32737', function () {
            assertVariableResolve(resolver, 'TM_FILENAME_BASE', 'text');
            resolver = new snippetVariables_1.ModelBasedVariableResolver(textModel_1.TextModel.createFromString('', undefined, undefined, uri_1.default.parse('http://www.pb.o/abc/def/ghi')));
            assertVariableResolve(resolver, 'TM_FILENAME_BASE', 'ghi');
            resolver = new snippetVariables_1.ModelBasedVariableResolver(textModel_1.TextModel.createFromString('', undefined, undefined, uri_1.default.parse('mem:.git')));
            assertVariableResolve(resolver, 'TM_FILENAME_BASE', '.git');
            resolver = new snippetVariables_1.ModelBasedVariableResolver(textModel_1.TextModel.createFromString('', undefined, undefined, uri_1.default.parse('mem:foo.')));
            assertVariableResolve(resolver, 'TM_FILENAME_BASE', 'foo');
        });
        function assertVariableResolve2(input, expected, varValue) {
            var snippet = new snippetParser_1.SnippetParser().parse(input)
                .resolveVariables({ resolve: function (variable) { return varValue || variable.name; } });
            var actual = snippet.toString();
            assert.equal(actual, expected);
        }
        test('Variable Snippet Transform', function () {
            var snippet = new snippetParser_1.SnippetParser().parse('name=${TM_FILENAME/(.*)\\..+$/$1/}', true);
            snippet.resolveVariables(resolver);
            assert.equal(snippet.toString(), 'name=text');
            assertVariableResolve2('${ThisIsAVar/([A-Z]).*(Var)/$2/}', 'Var');
            assertVariableResolve2('${ThisIsAVar/([A-Z]).*(Var)/$2-${1:/downcase}/}', 'Var-t');
            assertVariableResolve2('${Foo/(.*)/${1:+Bar}/img}', 'Bar');
            //https://github.com/Microsoft/vscode/issues/33162
            assertVariableResolve2('export default class ${TM_FILENAME/(\\w+)\\.js/$1/g}', 'export default class FooFile', 'FooFile.js');
            assertVariableResolve2('${foobarfoobar/(foo)/${1:+FAR}/g}', 'FARbarFARbar'); // global
            assertVariableResolve2('${foobarfoobar/(foo)/${1:+FAR}/}', 'FARbarfoobar'); // first match
            assertVariableResolve2('${foobarfoobar/(bazz)/${1:+FAR}/g}', 'foobarfoobar'); // no match
            assertVariableResolve2('${foobarfoobar/(foo)/${2:+FAR}/g}', 'barbar'); // bad group reference
        });
        test('Snippet transforms do not handle regex with alternatives or optional matches, #36089', function () {
            assertVariableResolve2('${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}', 'MyClass', 'my-class.js');
            // no hyphens
            assertVariableResolve2('${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}', 'Myclass', 'myclass.js');
            // none matching suffix
            assertVariableResolve2('${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}', 'Myclass.foo', 'myclass.foo');
            // more than one hyphen
            assertVariableResolve2('${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}', 'ThisIsAFile', 'this-is-a-file.js');
            // KEBAB CASE
            assertVariableResolve2('${TM_FILENAME_BASE/([A-Z][a-z]+)([A-Z][a-z]+$)?/${1:/downcase}-${2:/downcase}/g}', 'capital-case', 'CapitalCase');
            assertVariableResolve2('${TM_FILENAME_BASE/([A-Z][a-z]+)([A-Z][a-z]+$)?/${1:/downcase}-${2:/downcase}/g}', 'capital-case-more', 'CapitalCaseMore');
        });
        test('Add variable to insert value from clipboard to a snippet #40153', function () {
            var readTextResult;
            var clipboardService = new /** @class */ (function () {
                function class_1() {
                    this._throw = function () { throw new Error(); };
                    this.writeText = this._throw;
                    this.readFindText = this._throw;
                    this.writeFindText = this._throw;
                    this.writeFiles = this._throw;
                    this.readFiles = this._throw;
                    this.hasFiles = this._throw;
                }
                class_1.prototype.readText = function () { return readTextResult; };
                return class_1;
            }());
            var resolver = new snippetVariables_1.ClipboardBasedVariableResolver(clipboardService, 1, 0);
            readTextResult = undefined;
            assertVariableResolve(resolver, 'CLIPBOARD', undefined);
            readTextResult = null;
            assertVariableResolve(resolver, 'CLIPBOARD', undefined);
            readTextResult = '';
            assertVariableResolve(resolver, 'CLIPBOARD', undefined);
            readTextResult = 'foo';
            assertVariableResolve(resolver, 'CLIPBOARD', 'foo');
            assertVariableResolve(resolver, 'foo', undefined);
            assertVariableResolve(resolver, 'cLIPBOARD', undefined);
        });
        test('Add variable to insert value from clipboard to a snippet #40153', function () {
            var readTextResult;
            var resolver;
            var clipboardService = new /** @class */ (function () {
                function class_2() {
                    this._throw = function () { throw new Error(); };
                    this.writeText = this._throw;
                    this.readFindText = this._throw;
                    this.writeFindText = this._throw;
                    this.writeFiles = this._throw;
                    this.readFiles = this._throw;
                    this.hasFiles = this._throw;
                }
                class_2.prototype.readText = function () { return readTextResult; };
                return class_2;
            }());
            resolver = new snippetVariables_1.ClipboardBasedVariableResolver(clipboardService, 1, 2);
            readTextResult = 'line1';
            assertVariableResolve(resolver, 'CLIPBOARD', 'line1');
            readTextResult = 'line1\nline2\nline3';
            assertVariableResolve(resolver, 'CLIPBOARD', 'line1\nline2\nline3');
            readTextResult = 'line1\nline2';
            assertVariableResolve(resolver, 'CLIPBOARD', 'line2');
            readTextResult = 'line1\nline2';
            resolver = new snippetVariables_1.ClipboardBasedVariableResolver(clipboardService, 0, 2);
            assertVariableResolve(resolver, 'CLIPBOARD', 'line1');
        });
        function assertVariableResolve3(resolver, varName) {
            var snippet = new snippetParser_1.SnippetParser().parse("$" + varName);
            var variable = snippet.children[0];
            assert.equal(variable.resolve(resolver), true, varName + " failed to resolve");
        }
        test('Add time variables for snippets #41631', function () {
            var resolver = new snippetVariables_1.TimeBasedVariableResolver;
            assertVariableResolve3(resolver, 'CURRENT_YEAR');
            assertVariableResolve3(resolver, 'CURRENT_YEAR_SHORT');
            assertVariableResolve3(resolver, 'CURRENT_MONTH');
            assertVariableResolve3(resolver, 'CURRENT_DATE');
            assertVariableResolve3(resolver, 'CURRENT_HOUR');
            assertVariableResolve3(resolver, 'CURRENT_MINUTE');
            assertVariableResolve3(resolver, 'CURRENT_SECOND');
        });
    });
});
