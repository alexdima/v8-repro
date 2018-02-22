/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/parts/terminal/electron-browser/terminalConfigHelper", "vs/editor/common/config/editorOptions", "vs/workbench/parts/terminal/electron-browser/terminal", "vs/platform/configuration/test/common/testConfigurationService"], function (require, exports, assert, terminalConfigHelper_1, editorOptions_1, terminal_1, testConfigurationService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TerminalConfigHelper', function () {
        var fixture;
        setup(function () {
            fixture = document.body;
        });
        test('TerminalConfigHelper - getFont fontFamily', function () {
            var configurationService = new testConfigurationService_1.TestConfigurationService();
            configurationService.setUserConfiguration('editor', { fontFamily: 'foo' });
            configurationService.setUserConfiguration('terminal', { integrated: { fontFamily: 'bar' } });
            var configHelper = new terminalConfigHelper_1.TerminalConfigHelper(configurationService, null, null, null);
            configHelper.panelContainer = fixture;
            assert.equal(configHelper.getFont().fontFamily, 'bar', 'terminal.integrated.fontFamily should be selected over editor.fontFamily');
            configurationService.setUserConfiguration('terminal', { integrated: { fontFamily: null } });
            // Recreate config helper as onDidChangeConfiguration isn't implemented in TestConfigurationService
            configHelper = new terminalConfigHelper_1.TerminalConfigHelper(configurationService, null, null, null);
            configHelper.panelContainer = fixture;
            if (terminal_1.isFedora) {
                assert.equal(configHelper.getFont().fontFamily, '\'DejaVu Sans Mono\'', 'Fedora should have its font overridden when terminal.integrated.fontFamily not set');
            }
            else {
                assert.equal(configHelper.getFont().fontFamily, 'foo', 'editor.fontFamily should be the fallback when terminal.integrated.fontFamily not set');
            }
        });
        test('TerminalConfigHelper - getFont fontSize', function () {
            var configurationService = new testConfigurationService_1.TestConfigurationService();
            configurationService.setUserConfiguration('editor', {
                fontFamily: 'foo',
                fontSize: 9
            });
            configurationService.setUserConfiguration('terminal', {
                integrated: {
                    fontFamily: 'bar',
                    fontSize: 10
                }
            });
            var configHelper = new terminalConfigHelper_1.TerminalConfigHelper(configurationService, null, null, null);
            configHelper.panelContainer = fixture;
            assert.equal(configHelper.getFont().fontSize, 10, 'terminal.integrated.fontSize should be selected over editor.fontSize');
            configurationService.setUserConfiguration('editor', {
                fontFamily: 'foo'
            });
            configurationService.setUserConfiguration('terminal', {
                integrated: {
                    fontFamily: null,
                    fontSize: 0
                }
            });
            configHelper = new terminalConfigHelper_1.TerminalConfigHelper(configurationService, null, null, null);
            configHelper.panelContainer = fixture;
            assert.equal(configHelper.getFont().fontSize, 6, 'The minimum terminal font size should be used when terminal.integrated.fontSize less than it');
            configurationService.setUserConfiguration('editor', {
                fontFamily: 'foo'
            });
            configurationService.setUserConfiguration('terminal', {
                integrated: {
                    fontFamily: 0,
                    fontSize: 1500
                }
            });
            configHelper = new terminalConfigHelper_1.TerminalConfigHelper(configurationService, null, null, null);
            configHelper.panelContainer = fixture;
            assert.equal(configHelper.getFont().fontSize, 25, 'The maximum terminal font size should be used when terminal.integrated.fontSize more than it');
            configurationService.setUserConfiguration('editor', {
                fontFamily: 'foo'
            });
            configurationService.setUserConfiguration('terminal', {
                integrated: {
                    fontFamily: 0,
                    fontSize: null
                }
            });
            configHelper = new terminalConfigHelper_1.TerminalConfigHelper(configurationService, null, null, null);
            configHelper.panelContainer = fixture;
            assert.equal(configHelper.getFont().fontSize, editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize, 'The default editor font size should be used when terminal.integrated.fontSize is not set');
        });
        test('TerminalConfigHelper - getFont lineHeight', function () {
            var configurationService = new testConfigurationService_1.TestConfigurationService();
            configurationService.setUserConfiguration('editor', {
                fontFamily: 'foo',
                lineHeight: 1
            });
            configurationService.setUserConfiguration('terminal', {
                integrated: {
                    fontFamily: 0,
                    lineHeight: 2
                }
            });
            var configHelper = new terminalConfigHelper_1.TerminalConfigHelper(configurationService, null, null, null);
            configHelper.panelContainer = fixture;
            assert.equal(configHelper.getFont().lineHeight, 2, 'terminal.integrated.lineHeight should be selected over editor.lineHeight');
            configurationService.setUserConfiguration('editor', {
                fontFamily: 'foo',
                lineHeight: 1
            });
            configurationService.setUserConfiguration('terminal', {
                integrated: {
                    fontFamily: 0,
                    lineHeight: 0
                }
            });
            configHelper = new terminalConfigHelper_1.TerminalConfigHelper(configurationService, null, null, null);
            configHelper.panelContainer = fixture;
            assert.equal(configHelper.getFont().lineHeight, 1, 'editor.lineHeight should be 1 when terminal.integrated.lineHeight not set');
        });
    });
});
