/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/parts/terminal/common/terminal"], function (require, exports, keybindingsRegistry_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function setup() {
        registerOpenTerminalAtIndexCommands();
    }
    exports.setup = setup;
    function registerOpenTerminalAtIndexCommands() {
        var _loop_1 = function (i) {
            var terminalIndex = i;
            var visibleIndex = i + 1;
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: "workbench.action.terminal.focusAtIndex" + visibleIndex,
                weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
                when: void 0,
                primary: null,
                handler: function (accessor) {
                    var terminalService = accessor.get(terminal_1.ITerminalService);
                    terminalService.setActiveInstanceByIndex(terminalIndex);
                    return terminalService.showPanel(true);
                }
            });
        };
        for (var i = 0; i < 9; i++) {
            _loop_1(i);
        }
    }
});
