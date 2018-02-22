define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/browser/dom", "vs/editor/browser/services/codeEditorServiceImpl", "vs/platform/theme/test/common/testThemeService"], function (require, exports, assert, uri_1, dom, codeEditorServiceImpl_1, testThemeService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var themeServiceMock = new testThemeService_1.TestThemeService();
    suite('Decoration Render Options', function () {
        var options = {
            gutterIconPath: uri_1.default.parse('https://github.com/Microsoft/vscode/blob/master/resources/linux/code.png'),
            gutterIconSize: 'contain',
            backgroundColor: 'red',
            borderColor: 'yellow'
        };
        test('register and resolve decoration type', function () {
            var s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeServiceMock);
            s.registerDecorationType('example', options);
            assert.notEqual(s.resolveDecorationOptions('example', false), undefined);
        });
        test('remove decoration type', function () {
            var s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeServiceMock);
            s.registerDecorationType('example', options);
            assert.notEqual(s.resolveDecorationOptions('example', false), undefined);
            s.removeDecorationType('example');
            assert.throws(function () { return s.resolveDecorationOptions('example', false); });
        });
        function readStyleSheet(styleSheet) {
            if (styleSheet.sheet.rules) {
                return Array.prototype.map.call(styleSheet.sheet.rules, function (r) { return r.cssText; }).join('\n');
            }
            return styleSheet.sheet.toString();
        }
        test('css properties', function () {
            var styleSheet = dom.createStyleSheet();
            var s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeServiceMock, styleSheet);
            s.registerDecorationType('example', options);
            var sheet = readStyleSheet(styleSheet);
            assert(sheet.indexOf('background: url(\'https://github.com/Microsoft/vscode/blob/master/resources/linux/code.png\') center center no-repeat;') > 0
                || sheet.indexOf('background: url("https://github.com/Microsoft/vscode/blob/master/resources/linux/code.png") center center / contain no-repeat;') > 0);
            assert(sheet.indexOf('border-color: yellow;') > 0);
            assert(sheet.indexOf('background-color: red;') > 0);
        });
        test('theme color', function () {
            var options = {
                backgroundColor: { id: 'editorBackground' },
                borderColor: { id: 'editorBorder' },
            };
            var colors = {
                editorBackground: '#FF0000'
            };
            var styleSheet = dom.createStyleSheet();
            var themeService = new testThemeService_1.TestThemeService(new testThemeService_1.TestTheme(colors));
            var s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeService, styleSheet);
            s.registerDecorationType('example', options);
            var sheet = readStyleSheet(styleSheet);
            assert.equal(sheet, '.monaco-editor .ced-example-0 { background-color: rgb(255, 0, 0); border-color: transparent; box-sizing: border-box; }');
            colors = {
                editorBackground: '#EE0000',
                editorBorder: '#00FFFF'
            };
            themeService.setTheme(new testThemeService_1.TestTheme(colors));
            sheet = readStyleSheet(styleSheet);
            assert.equal(sheet, '.monaco-editor .ced-example-0 { background-color: rgb(238, 0, 0); border-color: rgb(0, 255, 255); box-sizing: border-box; }');
            s.removeDecorationType('example');
            sheet = readStyleSheet(styleSheet);
            assert.equal(sheet, '');
        });
        test('theme overrides', function () {
            var options = {
                color: { id: 'editorBackground' },
                light: {
                    color: '#FF00FF'
                },
                dark: {
                    color: '#000000',
                    after: {
                        color: { id: 'infoForeground' }
                    }
                }
            };
            var colors = {
                editorBackground: '#FF0000',
                infoForeground: '#444444'
            };
            var styleSheet = dom.createStyleSheet();
            var themeService = new testThemeService_1.TestThemeService(new testThemeService_1.TestTheme(colors));
            var s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeService, styleSheet);
            s.registerDecorationType('example', options);
            var sheet = readStyleSheet(styleSheet);
            var expected = '.vs-dark.monaco-editor .ced-example-4::after, .hc-black.monaco-editor .ced-example-4::after { color: rgb(68, 68, 68) !important; }\n' +
                '.vs-dark.monaco-editor .ced-example-1, .hc-black.monaco-editor .ced-example-1 { color: rgb(0, 0, 0) !important; }\n' +
                '.vs.monaco-editor .ced-example-1 { color: rgb(255, 0, 255) !important; }\n' +
                '.monaco-editor .ced-example-1 { color: rgb(255, 0, 0) !important; }';
            assert.equal(sheet, expected);
            s.removeDecorationType('example');
            sheet = readStyleSheet(styleSheet);
            assert.equal(sheet, '');
        });
        test('css properties, gutterIconPaths', function () {
            var styleSheet = dom.createStyleSheet();
            // unix file path (used as string)
            var s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeServiceMock, styleSheet);
            s.registerDecorationType('example', { gutterIconPath: '/Users/foo/bar.png' });
            var sheet = readStyleSheet(styleSheet); //.innerHTML || styleSheet.sheet.toString();
            assert(sheet.indexOf('background: url(\'file:///Users/foo/bar.png\') center center no-repeat;') > 0
                || sheet.indexOf('background: url("file:///Users/foo/bar.png") center center no-repeat;') > 0);
            // windows file path (used as string)
            s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeServiceMock, styleSheet);
            s.registerDecorationType('example', { gutterIconPath: 'c:\\files\\miles\\more.png' });
            sheet = readStyleSheet(styleSheet);
            // TODO@Alex test fails
            // assert(
            // 	sheet.indexOf('background: url(\'file:///c%3A/files/miles/more.png\') center center no-repeat;') > 0
            // 	|| sheet.indexOf('background: url("file:///c%3A/files/miles/more.png") center center no-repeat;') > 0
            // );
            // URI, only minimal encoding
            s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeServiceMock, styleSheet);
            s.registerDecorationType('example', { gutterIconPath: uri_1.default.parse('data:image/svg+xml;base64,PHN2ZyB4b+') });
            sheet = readStyleSheet(styleSheet);
            assert(sheet.indexOf('background: url(\'data:image/svg+xml;base64,PHN2ZyB4b+\') center center no-repeat;') > 0
                || sheet.indexOf('background: url("data:image/svg+xml;base64,PHN2ZyB4b+") center center no-repeat;') > 0);
            // single quote must always be escaped/encoded
            s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeServiceMock, styleSheet);
            s.registerDecorationType('example', { gutterIconPath: '/Users/foo/b\'ar.png' });
            sheet = readStyleSheet(styleSheet);
            assert(sheet.indexOf('background: url(\'file:///Users/foo/b%27ar.png\') center center no-repeat;') > 0
                || sheet.indexOf('background: url("file:///Users/foo/b%27ar.png") center center no-repeat;') > 0);
            s = new codeEditorServiceImpl_1.CodeEditorServiceImpl(themeServiceMock, styleSheet);
            s.registerDecorationType('example', { gutterIconPath: uri_1.default.parse('http://test/pa\'th') });
            sheet = readStyleSheet(styleSheet);
            assert(sheet.indexOf('background: url(\'http://test/pa%27th\') center center no-repeat;') > 0
                || sheet.indexOf('background: url("http://test/pa%27th") center center no-repeat;') > 0);
        });
    });
});
