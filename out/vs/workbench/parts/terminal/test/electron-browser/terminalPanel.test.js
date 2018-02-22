/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/parts/terminal/electron-browser/terminalPanel", "vs/base/common/platform"], function (require, exports, assert, terminalPanel_1, platform) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TerminalPanel', function () {
        test('preparePathForTerminal', function () {
            if (platform.isWindows) {
                assert.equal(terminalPanel_1.TerminalPanel.preparePathForTerminal('C:\\foo'), 'C:\\foo');
                assert.equal(terminalPanel_1.TerminalPanel.preparePathForTerminal('C:\\foo bar'), '"C:\\foo bar"');
                return;
            }
            assert.equal(terminalPanel_1.TerminalPanel.preparePathForTerminal('/a/\\foo bar"\'? ;\'??  :'), '/a/\\\\foo\\ bar\\"\\\'\\?\\ \\;\\\'\\?\\?\\ \\ \\:');
            assert.equal(terminalPanel_1.TerminalPanel.preparePathForTerminal('/\\\'"?:;!*(){}[]'), '/\\\\\\\'\\"\\?\\:\\;\\!\\*\\(\\)\\{\\}\\[\\]');
        });
    });
});
