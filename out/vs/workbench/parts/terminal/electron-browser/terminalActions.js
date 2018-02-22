/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "os", "vs/base/common/actions", "vs/editor/common/model", "vs/editor/browser/services/codeEditorService", "vs/workbench/parts/terminal/common/terminal", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/winjs.base", "vs/workbench/browser/panel", "vs/workbench/services/part/common/partService", "vs/workbench/services/panel/common/panelService", "vs/platform/message/common/message", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/quickOpen/common/quickOpen", "vs/workbench/browser/actions", "vs/workbench/parts/terminal/browser/terminalQuickOpen", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/commands/common/commands", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceCommands"], function (require, exports, nls, os, actions_1, model_1, codeEditorService_1, terminal_1, actionbar_1, winjs_base_1, panel_1, partService_1, panelService_1, message_1, styler_1, themeService_1, quickOpen_1, actions_2, terminalQuickOpen_1, instantiation_1, contextView_1, commands_1, workspace_1, workspaceCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TERMINAL_PICKER_PREFIX = 'term ';
    var ToggleTerminalAction = /** @class */ (function (_super) {
        __extends(ToggleTerminalAction, _super);
        function ToggleTerminalAction(id, label, panelService, partService, terminalService) {
            var _this = _super.call(this, id, label, terminal_1.TERMINAL_PANEL_ID, panelService, partService) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ToggleTerminalAction.prototype.run = function (event) {
            if (this.terminalService.terminalInstances.length === 0) {
                // If there is not yet an instance attempt to create it here so that we can suggest a
                // new shell on Windows (and not do so when the panel is restored on reload).
                this.terminalService.createInstance(undefined, true);
            }
            return _super.prototype.run.call(this);
        };
        ToggleTerminalAction.ID = 'workbench.action.terminal.toggleTerminal';
        ToggleTerminalAction.LABEL = nls.localize('workbench.action.terminal.toggleTerminal', "Toggle Integrated Terminal");
        ToggleTerminalAction = __decorate([
            __param(2, panelService_1.IPanelService),
            __param(3, partService_1.IPartService),
            __param(4, terminal_1.ITerminalService)
        ], ToggleTerminalAction);
        return ToggleTerminalAction;
    }(panel_1.TogglePanelAction));
    exports.ToggleTerminalAction = ToggleTerminalAction;
    var KillTerminalAction = /** @class */ (function (_super) {
        __extends(KillTerminalAction, _super);
        function KillTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            _this.class = 'terminal-action kill';
            return _this;
        }
        KillTerminalAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                this.terminalService.getActiveInstance().dispose();
                if (this.terminalService.terminalInstances.length > 0) {
                    this.terminalService.showPanel(true);
                }
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        KillTerminalAction.ID = 'workbench.action.terminal.kill';
        KillTerminalAction.LABEL = nls.localize('workbench.action.terminal.kill', "Kill the Active Terminal Instance");
        KillTerminalAction.PANEL_LABEL = nls.localize('workbench.action.terminal.kill.short', "Kill Terminal");
        KillTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], KillTerminalAction);
        return KillTerminalAction;
    }(actions_1.Action));
    exports.KillTerminalAction = KillTerminalAction;
    var QuickKillTerminalAction = /** @class */ (function (_super) {
        __extends(QuickKillTerminalAction, _super);
        function QuickKillTerminalAction(id, label, terminalEntry, terminalService, quickOpenService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalEntry = terminalEntry;
            _this.terminalService = terminalService;
            _this.quickOpenService = quickOpenService;
            _this.class = 'terminal-action kill';
            return _this;
        }
        QuickKillTerminalAction.prototype.run = function (event) {
            var _this = this;
            var terminalIndex = parseInt(this.terminalEntry.getLabel().split(':')[0]) - 1;
            var terminal = this.terminalService.getInstanceFromIndex(terminalIndex);
            if (terminal) {
                terminal.dispose();
            }
            // if (this.terminalService.terminalInstances.length > 0 && this.terminalService.activeTerminalInstanceIndex !== terminalIndex) {
            // 	this.terminalService.setActiveInstanceByIndex(Math.min(terminalIndex, this.terminalService.terminalInstances.length - 1));
            // }
            return winjs_base_1.TPromise.timeout(50).then(function (result) { return _this.quickOpenService.show(exports.TERMINAL_PICKER_PREFIX, null); });
        };
        QuickKillTerminalAction.ID = 'workbench.action.terminal.quickKill';
        QuickKillTerminalAction.LABEL = nls.localize('workbench.action.terminal.quickKill', "Kill Terminal Instance");
        QuickKillTerminalAction = __decorate([
            __param(3, terminal_1.ITerminalService),
            __param(4, quickOpen_1.IQuickOpenService)
        ], QuickKillTerminalAction);
        return QuickKillTerminalAction;
    }(actions_1.Action));
    exports.QuickKillTerminalAction = QuickKillTerminalAction;
    /**
     * Copies the terminal selection. Note that since the command palette takes focus from the terminal,
     * this cannot be triggered through the command palette.
     */
    var CopyTerminalSelectionAction = /** @class */ (function (_super) {
        __extends(CopyTerminalSelectionAction, _super);
        function CopyTerminalSelectionAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        CopyTerminalSelectionAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.copySelection();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        CopyTerminalSelectionAction.ID = 'workbench.action.terminal.copySelection';
        CopyTerminalSelectionAction.LABEL = nls.localize('workbench.action.terminal.copySelection', "Copy Selection");
        CopyTerminalSelectionAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], CopyTerminalSelectionAction);
        return CopyTerminalSelectionAction;
    }(actions_1.Action));
    exports.CopyTerminalSelectionAction = CopyTerminalSelectionAction;
    var SelectAllTerminalAction = /** @class */ (function (_super) {
        __extends(SelectAllTerminalAction, _super);
        function SelectAllTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        SelectAllTerminalAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.selectAll();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        SelectAllTerminalAction.ID = 'workbench.action.terminal.selectAll';
        SelectAllTerminalAction.LABEL = nls.localize('workbench.action.terminal.selectAll', "Select All");
        SelectAllTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], SelectAllTerminalAction);
        return SelectAllTerminalAction;
    }(actions_1.Action));
    exports.SelectAllTerminalAction = SelectAllTerminalAction;
    var BaseSendTextTerminalAction = /** @class */ (function (_super) {
        __extends(BaseSendTextTerminalAction, _super);
        function BaseSendTextTerminalAction(id, label, _text, _terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this._text = _text;
            _this._terminalService = _terminalService;
            return _this;
        }
        BaseSendTextTerminalAction.prototype.run = function (event) {
            var terminalInstance = this._terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.sendText(this._text, false);
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        BaseSendTextTerminalAction = __decorate([
            __param(3, terminal_1.ITerminalService)
        ], BaseSendTextTerminalAction);
        return BaseSendTextTerminalAction;
    }(actions_1.Action));
    exports.BaseSendTextTerminalAction = BaseSendTextTerminalAction;
    var DeleteWordLeftTerminalAction = /** @class */ (function (_super) {
        __extends(DeleteWordLeftTerminalAction, _super);
        function DeleteWordLeftTerminalAction(id, label, terminalService) {
            // Send ctrl+W
            return _super.call(this, id, label, String.fromCharCode('W'.charCodeAt(0) - 64), terminalService) || this;
        }
        DeleteWordLeftTerminalAction.ID = 'workbench.action.terminal.deleteWordLeft';
        DeleteWordLeftTerminalAction.LABEL = nls.localize('workbench.action.terminal.deleteWordLeft', "Delete Word Left");
        DeleteWordLeftTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], DeleteWordLeftTerminalAction);
        return DeleteWordLeftTerminalAction;
    }(BaseSendTextTerminalAction));
    exports.DeleteWordLeftTerminalAction = DeleteWordLeftTerminalAction;
    var DeleteWordRightTerminalAction = /** @class */ (function (_super) {
        __extends(DeleteWordRightTerminalAction, _super);
        function DeleteWordRightTerminalAction(id, label, terminalService) {
            // Send alt+D
            return _super.call(this, id, label, '\x1bD', terminalService) || this;
        }
        DeleteWordRightTerminalAction.ID = 'workbench.action.terminal.deleteWordRight';
        DeleteWordRightTerminalAction.LABEL = nls.localize('workbench.action.terminal.deleteWordRight', "Delete Word Right");
        DeleteWordRightTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], DeleteWordRightTerminalAction);
        return DeleteWordRightTerminalAction;
    }(BaseSendTextTerminalAction));
    exports.DeleteWordRightTerminalAction = DeleteWordRightTerminalAction;
    var MoveToLineStartTerminalAction = /** @class */ (function (_super) {
        __extends(MoveToLineStartTerminalAction, _super);
        function MoveToLineStartTerminalAction(id, label, terminalService) {
            // Send ctrl+A
            return _super.call(this, id, label, String.fromCharCode('A'.charCodeAt(0) - 64), terminalService) || this;
        }
        MoveToLineStartTerminalAction.ID = 'workbench.action.terminal.moveToLineStart';
        MoveToLineStartTerminalAction.LABEL = nls.localize('workbench.action.terminal.moveToLineStart', "Move To Line Start");
        MoveToLineStartTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], MoveToLineStartTerminalAction);
        return MoveToLineStartTerminalAction;
    }(BaseSendTextTerminalAction));
    exports.MoveToLineStartTerminalAction = MoveToLineStartTerminalAction;
    var MoveToLineEndTerminalAction = /** @class */ (function (_super) {
        __extends(MoveToLineEndTerminalAction, _super);
        function MoveToLineEndTerminalAction(id, label, terminalService) {
            // Send ctrl+E
            return _super.call(this, id, label, String.fromCharCode('E'.charCodeAt(0) - 64), terminalService) || this;
        }
        MoveToLineEndTerminalAction.ID = 'workbench.action.terminal.moveToLineEnd';
        MoveToLineEndTerminalAction.LABEL = nls.localize('workbench.action.terminal.moveToLineEnd', "Move To Line End");
        MoveToLineEndTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], MoveToLineEndTerminalAction);
        return MoveToLineEndTerminalAction;
    }(BaseSendTextTerminalAction));
    exports.MoveToLineEndTerminalAction = MoveToLineEndTerminalAction;
    var CreateNewTerminalAction = /** @class */ (function (_super) {
        __extends(CreateNewTerminalAction, _super);
        function CreateNewTerminalAction(id, label, terminalService, commandService, workspaceContextService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            _this.commandService = commandService;
            _this.workspaceContextService = workspaceContextService;
            _this.class = 'terminal-action new';
            return _this;
        }
        CreateNewTerminalAction.prototype.run = function (event) {
            var _this = this;
            var folders = this.workspaceContextService.getWorkspace().folders;
            var instancePromise;
            if (folders.length <= 1) {
                // Allow terminal service to handle the path when there is only a
                // single root
                instancePromise = winjs_base_1.TPromise.as(this.terminalService.createInstance(undefined, true));
            }
            else {
                var options = {
                    placeHolder: nls.localize('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal")
                };
                instancePromise = this.commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]).then(function (workspace) {
                    if (!workspace) {
                        // Don't create the instance if the workspace picker was canceled
                        return null;
                    }
                    return _this.terminalService.createInstance({ cwd: workspace.uri.fsPath }, true);
                });
            }
            return instancePromise.then(function (instance) {
                if (!instance) {
                    return winjs_base_1.TPromise.as(void 0);
                }
                _this.terminalService.setActiveInstance(instance);
                return _this.terminalService.showPanel(true);
            });
        };
        CreateNewTerminalAction.ID = 'workbench.action.terminal.new';
        CreateNewTerminalAction.LABEL = nls.localize('workbench.action.terminal.new', "Create New Integrated Terminal");
        CreateNewTerminalAction.PANEL_LABEL = nls.localize('workbench.action.terminal.new.short', "New Terminal");
        CreateNewTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService),
            __param(3, commands_1.ICommandService),
            __param(4, workspace_1.IWorkspaceContextService)
        ], CreateNewTerminalAction);
        return CreateNewTerminalAction;
    }(actions_1.Action));
    exports.CreateNewTerminalAction = CreateNewTerminalAction;
    var CreateNewInActiveWorkspaceTerminalAction = /** @class */ (function (_super) {
        __extends(CreateNewInActiveWorkspaceTerminalAction, _super);
        function CreateNewInActiveWorkspaceTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        CreateNewInActiveWorkspaceTerminalAction.prototype.run = function (event) {
            var instance = this.terminalService.createInstance(undefined, true);
            if (!instance) {
                return winjs_base_1.TPromise.as(void 0);
            }
            this.terminalService.setActiveInstance(instance);
            return this.terminalService.showPanel(true);
        };
        CreateNewInActiveWorkspaceTerminalAction.ID = 'workbench.action.terminal.newInActiveWorkspace';
        CreateNewInActiveWorkspaceTerminalAction.LABEL = nls.localize('workbench.action.terminal.newInActiveWorkspace', "Create New Integrated Terminal (In Active Workspace)");
        CreateNewInActiveWorkspaceTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], CreateNewInActiveWorkspaceTerminalAction);
        return CreateNewInActiveWorkspaceTerminalAction;
    }(actions_1.Action));
    exports.CreateNewInActiveWorkspaceTerminalAction = CreateNewInActiveWorkspaceTerminalAction;
    var SplitVerticalTerminalAction = /** @class */ (function (_super) {
        __extends(SplitVerticalTerminalAction, _super);
        function SplitVerticalTerminalAction(id, label, _terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this._terminalService = _terminalService;
            return _this;
        }
        SplitVerticalTerminalAction.prototype.run = function (event) {
            var instance = this._terminalService.getActiveInstance();
            if (!instance) {
                return winjs_base_1.TPromise.as(void 0);
            }
            this._terminalService.splitInstanceVertically(instance);
            return this._terminalService.showPanel(true);
        };
        SplitVerticalTerminalAction.ID = 'workbench.action.terminal.splitVertical';
        SplitVerticalTerminalAction.LABEL = nls.localize('workbench.action.terminal.splitVertical', "Split the terminal vertically");
        SplitVerticalTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], SplitVerticalTerminalAction);
        return SplitVerticalTerminalAction;
    }(actions_1.Action));
    exports.SplitVerticalTerminalAction = SplitVerticalTerminalAction;
    var BaseFocusDirectionTerminalAction = /** @class */ (function (_super) {
        __extends(BaseFocusDirectionTerminalAction, _super);
        function BaseFocusDirectionTerminalAction(id, label, _direction, _terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this._direction = _direction;
            _this._terminalService = _terminalService;
            return _this;
        }
        BaseFocusDirectionTerminalAction.prototype.run = function (event) {
            var tab = this._terminalService.getActiveTab();
            if (!tab) {
                return winjs_base_1.TPromise.as(void 0);
            }
            tab.focusDirection(this._direction);
            return this._terminalService.showPanel(true);
        };
        BaseFocusDirectionTerminalAction = __decorate([
            __param(3, terminal_1.ITerminalService)
        ], BaseFocusDirectionTerminalAction);
        return BaseFocusDirectionTerminalAction;
    }(actions_1.Action));
    exports.BaseFocusDirectionTerminalAction = BaseFocusDirectionTerminalAction;
    var FocusTerminalLeftAction = /** @class */ (function (_super) {
        __extends(FocusTerminalLeftAction, _super);
        function FocusTerminalLeftAction(id, label, terminalService) {
            return _super.call(this, id, label, 0 /* Left */, terminalService) || this;
        }
        FocusTerminalLeftAction.ID = 'workbench.action.terminal.focusTerminalLeft';
        FocusTerminalLeftAction.LABEL = nls.localize('workbench.action.terminal.focusTerminalLeft', "Focus terminal to the left");
        FocusTerminalLeftAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], FocusTerminalLeftAction);
        return FocusTerminalLeftAction;
    }(BaseFocusDirectionTerminalAction));
    exports.FocusTerminalLeftAction = FocusTerminalLeftAction;
    var FocusTerminalRightAction = /** @class */ (function (_super) {
        __extends(FocusTerminalRightAction, _super);
        function FocusTerminalRightAction(id, label, terminalService) {
            return _super.call(this, id, label, 1 /* Right */, terminalService) || this;
        }
        FocusTerminalRightAction.ID = 'workbench.action.terminal.focusTerminalRight';
        FocusTerminalRightAction.LABEL = nls.localize('workbench.action.terminal.focusTerminalRight', "Focus terminal to the right");
        FocusTerminalRightAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], FocusTerminalRightAction);
        return FocusTerminalRightAction;
    }(BaseFocusDirectionTerminalAction));
    exports.FocusTerminalRightAction = FocusTerminalRightAction;
    var FocusTerminalUpAction = /** @class */ (function (_super) {
        __extends(FocusTerminalUpAction, _super);
        function FocusTerminalUpAction(id, label, terminalService) {
            return _super.call(this, id, label, 2 /* Up */, terminalService) || this;
        }
        FocusTerminalUpAction.ID = 'workbench.action.terminal.focusTerminalUp';
        FocusTerminalUpAction.LABEL = nls.localize('workbench.action.terminal.focusTerminalUp', "Focus terminal above");
        FocusTerminalUpAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], FocusTerminalUpAction);
        return FocusTerminalUpAction;
    }(BaseFocusDirectionTerminalAction));
    exports.FocusTerminalUpAction = FocusTerminalUpAction;
    var FocusTerminalDownAction = /** @class */ (function (_super) {
        __extends(FocusTerminalDownAction, _super);
        function FocusTerminalDownAction(id, label, terminalService) {
            return _super.call(this, id, label, 3 /* Down */, terminalService) || this;
        }
        FocusTerminalDownAction.ID = 'workbench.action.terminal.focusTerminalDown';
        FocusTerminalDownAction.LABEL = nls.localize('workbench.action.terminal.focusTerminalDown', "Focus terminal below");
        FocusTerminalDownAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], FocusTerminalDownAction);
        return FocusTerminalDownAction;
    }(BaseFocusDirectionTerminalAction));
    exports.FocusTerminalDownAction = FocusTerminalDownAction;
    var FocusActiveTerminalAction = /** @class */ (function (_super) {
        __extends(FocusActiveTerminalAction, _super);
        function FocusActiveTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        FocusActiveTerminalAction.prototype.run = function (event) {
            var instance = this.terminalService.getActiveOrCreateInstance(true);
            if (!instance) {
                return winjs_base_1.TPromise.as(void 0);
            }
            this.terminalService.setActiveInstance(instance);
            return this.terminalService.showPanel(true);
        };
        FocusActiveTerminalAction.ID = 'workbench.action.terminal.focus';
        FocusActiveTerminalAction.LABEL = nls.localize('workbench.action.terminal.focus', "Focus Terminal");
        FocusActiveTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], FocusActiveTerminalAction);
        return FocusActiveTerminalAction;
    }(actions_1.Action));
    exports.FocusActiveTerminalAction = FocusActiveTerminalAction;
    var FocusNextTerminalAction = /** @class */ (function (_super) {
        __extends(FocusNextTerminalAction, _super);
        function FocusNextTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        FocusNextTerminalAction.prototype.run = function (event) {
            this.terminalService.setActiveTabToNext();
            return this.terminalService.showPanel(true);
        };
        FocusNextTerminalAction.ID = 'workbench.action.terminal.focusNext';
        FocusNextTerminalAction.LABEL = nls.localize('workbench.action.terminal.focusNext', "Focus Next Terminal");
        FocusNextTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], FocusNextTerminalAction);
        return FocusNextTerminalAction;
    }(actions_1.Action));
    exports.FocusNextTerminalAction = FocusNextTerminalAction;
    var FocusPreviousTerminalAction = /** @class */ (function (_super) {
        __extends(FocusPreviousTerminalAction, _super);
        function FocusPreviousTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        FocusPreviousTerminalAction.prototype.run = function (event) {
            this.terminalService.setActiveTabToPrevious();
            return this.terminalService.showPanel(true);
        };
        FocusPreviousTerminalAction.ID = 'workbench.action.terminal.focusPrevious';
        FocusPreviousTerminalAction.LABEL = nls.localize('workbench.action.terminal.focusPrevious', "Focus Previous Terminal");
        FocusPreviousTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], FocusPreviousTerminalAction);
        return FocusPreviousTerminalAction;
    }(actions_1.Action));
    exports.FocusPreviousTerminalAction = FocusPreviousTerminalAction;
    var TerminalPasteAction = /** @class */ (function (_super) {
        __extends(TerminalPasteAction, _super);
        function TerminalPasteAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        TerminalPasteAction.prototype.run = function (event) {
            var instance = this.terminalService.getActiveOrCreateInstance();
            if (instance) {
                instance.paste();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        TerminalPasteAction.ID = 'workbench.action.terminal.paste';
        TerminalPasteAction.LABEL = nls.localize('workbench.action.terminal.paste', "Paste into Active Terminal");
        TerminalPasteAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], TerminalPasteAction);
        return TerminalPasteAction;
    }(actions_1.Action));
    exports.TerminalPasteAction = TerminalPasteAction;
    var SelectDefaultShellWindowsTerminalAction = /** @class */ (function (_super) {
        __extends(SelectDefaultShellWindowsTerminalAction, _super);
        function SelectDefaultShellWindowsTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        SelectDefaultShellWindowsTerminalAction.prototype.run = function (event) {
            return this.terminalService.selectDefaultWindowsShell();
        };
        SelectDefaultShellWindowsTerminalAction.ID = 'workbench.action.terminal.selectDefaultShell';
        SelectDefaultShellWindowsTerminalAction.LABEL = nls.localize('workbench.action.terminal.DefaultShell', "Select Default Shell");
        SelectDefaultShellWindowsTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], SelectDefaultShellWindowsTerminalAction);
        return SelectDefaultShellWindowsTerminalAction;
    }(actions_1.Action));
    exports.SelectDefaultShellWindowsTerminalAction = SelectDefaultShellWindowsTerminalAction;
    var RunSelectedTextInTerminalAction = /** @class */ (function (_super) {
        __extends(RunSelectedTextInTerminalAction, _super);
        function RunSelectedTextInTerminalAction(id, label, codeEditorService, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.codeEditorService = codeEditorService;
            _this.terminalService = terminalService;
            return _this;
        }
        RunSelectedTextInTerminalAction.prototype.run = function (event) {
            var instance = this.terminalService.getActiveOrCreateInstance();
            if (!instance) {
                return winjs_base_1.TPromise.as(void 0);
            }
            var editor = this.codeEditorService.getFocusedCodeEditor();
            if (!editor) {
                return winjs_base_1.TPromise.as(void 0);
            }
            var selection = editor.getSelection();
            var text;
            if (selection.isEmpty()) {
                text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
            }
            else {
                var endOfLinePreference = os.EOL === '\n' ? model_1.EndOfLinePreference.LF : model_1.EndOfLinePreference.CRLF;
                text = editor.getModel().getValueInRange(selection, endOfLinePreference);
            }
            instance.sendText(text, true);
            return this.terminalService.showPanel();
        };
        RunSelectedTextInTerminalAction.ID = 'workbench.action.terminal.runSelectedText';
        RunSelectedTextInTerminalAction.LABEL = nls.localize('workbench.action.terminal.runSelectedText', "Run Selected Text In Active Terminal");
        RunSelectedTextInTerminalAction = __decorate([
            __param(2, codeEditorService_1.ICodeEditorService),
            __param(3, terminal_1.ITerminalService)
        ], RunSelectedTextInTerminalAction);
        return RunSelectedTextInTerminalAction;
    }(actions_1.Action));
    exports.RunSelectedTextInTerminalAction = RunSelectedTextInTerminalAction;
    var RunActiveFileInTerminalAction = /** @class */ (function (_super) {
        __extends(RunActiveFileInTerminalAction, _super);
        function RunActiveFileInTerminalAction(id, label, codeEditorService, terminalService, messageService) {
            var _this = _super.call(this, id, label) || this;
            _this.codeEditorService = codeEditorService;
            _this.terminalService = terminalService;
            _this.messageService = messageService;
            return _this;
        }
        RunActiveFileInTerminalAction.prototype.run = function (event) {
            var instance = this.terminalService.getActiveOrCreateInstance();
            if (!instance) {
                return winjs_base_1.TPromise.as(void 0);
            }
            var editor = this.codeEditorService.getFocusedCodeEditor();
            if (!editor) {
                return winjs_base_1.TPromise.as(void 0);
            }
            var uri = editor.getModel().uri;
            if (uri.scheme !== 'file') {
                this.messageService.show(message_1.Severity.Warning, nls.localize('workbench.action.terminal.runActiveFile.noFile', 'Only files on disk can be run in the terminal'));
                return winjs_base_1.TPromise.as(void 0);
            }
            instance.sendText(uri.fsPath, true);
            return this.terminalService.showPanel();
        };
        RunActiveFileInTerminalAction.ID = 'workbench.action.terminal.runActiveFile';
        RunActiveFileInTerminalAction.LABEL = nls.localize('workbench.action.terminal.runActiveFile', "Run Active File In Active Terminal");
        RunActiveFileInTerminalAction = __decorate([
            __param(2, codeEditorService_1.ICodeEditorService),
            __param(3, terminal_1.ITerminalService),
            __param(4, message_1.IMessageService)
        ], RunActiveFileInTerminalAction);
        return RunActiveFileInTerminalAction;
    }(actions_1.Action));
    exports.RunActiveFileInTerminalAction = RunActiveFileInTerminalAction;
    var SwitchTerminalAction = /** @class */ (function (_super) {
        __extends(SwitchTerminalAction, _super);
        function SwitchTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, SwitchTerminalAction.ID, SwitchTerminalAction.LABEL) || this;
            _this.terminalService = terminalService;
            _this.class = 'terminal-action switch-terminal';
            return _this;
        }
        SwitchTerminalAction.prototype.run = function (item) {
            if (!item || !item.split) {
                return winjs_base_1.TPromise.as(null);
            }
            var selectedTabIndex = parseInt(item.split(':')[0], 10) - 1;
            this.terminalService.setActiveTabByIndex(selectedTabIndex);
            return this.terminalService.showPanel(true);
        };
        SwitchTerminalAction.ID = 'workbench.action.terminal.switchTerminal';
        SwitchTerminalAction.LABEL = nls.localize('workbench.action.terminal.switchTerminal', "Switch Terminal");
        SwitchTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], SwitchTerminalAction);
        return SwitchTerminalAction;
    }(actions_1.Action));
    exports.SwitchTerminalAction = SwitchTerminalAction;
    var SwitchTerminalActionItem = /** @class */ (function (_super) {
        __extends(SwitchTerminalActionItem, _super);
        function SwitchTerminalActionItem(action, terminalService, themeService, contextViewService) {
            var _this = _super.call(this, null, action, terminalService.getTabLabels(), terminalService.activeTabIndex, contextViewService) || this;
            _this.terminalService = terminalService;
            _this.toDispose.push(terminalService.onInstancesChanged(_this._updateItems, _this));
            _this.toDispose.push(terminalService.onActiveTabChanged(_this._updateItems, _this));
            _this.toDispose.push(terminalService.onInstanceTitleChanged(_this._updateItems, _this));
            _this.toDispose.push(styler_1.attachSelectBoxStyler(_this.selectBox, themeService));
            return _this;
        }
        SwitchTerminalActionItem.prototype._updateItems = function () {
            this.setOptions(this.terminalService.getTabLabels(), this.terminalService.activeTabIndex);
        };
        SwitchTerminalActionItem = __decorate([
            __param(1, terminal_1.ITerminalService),
            __param(2, themeService_1.IThemeService),
            __param(3, contextView_1.IContextViewService)
        ], SwitchTerminalActionItem);
        return SwitchTerminalActionItem;
    }(actionbar_1.SelectActionItem));
    exports.SwitchTerminalActionItem = SwitchTerminalActionItem;
    var ScrollDownTerminalAction = /** @class */ (function (_super) {
        __extends(ScrollDownTerminalAction, _super);
        function ScrollDownTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ScrollDownTerminalAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.scrollDownLine();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        ScrollDownTerminalAction.ID = 'workbench.action.terminal.scrollDown';
        ScrollDownTerminalAction.LABEL = nls.localize('workbench.action.terminal.scrollDown', "Scroll Down (Line)");
        ScrollDownTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], ScrollDownTerminalAction);
        return ScrollDownTerminalAction;
    }(actions_1.Action));
    exports.ScrollDownTerminalAction = ScrollDownTerminalAction;
    var ScrollDownPageTerminalAction = /** @class */ (function (_super) {
        __extends(ScrollDownPageTerminalAction, _super);
        function ScrollDownPageTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ScrollDownPageTerminalAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.scrollDownPage();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        ScrollDownPageTerminalAction.ID = 'workbench.action.terminal.scrollDownPage';
        ScrollDownPageTerminalAction.LABEL = nls.localize('workbench.action.terminal.scrollDownPage', "Scroll Down (Page)");
        ScrollDownPageTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], ScrollDownPageTerminalAction);
        return ScrollDownPageTerminalAction;
    }(actions_1.Action));
    exports.ScrollDownPageTerminalAction = ScrollDownPageTerminalAction;
    var ScrollToBottomTerminalAction = /** @class */ (function (_super) {
        __extends(ScrollToBottomTerminalAction, _super);
        function ScrollToBottomTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ScrollToBottomTerminalAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.scrollToBottom();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        ScrollToBottomTerminalAction.ID = 'workbench.action.terminal.scrollToBottom';
        ScrollToBottomTerminalAction.LABEL = nls.localize('workbench.action.terminal.scrollToBottom', "Scroll to Bottom");
        ScrollToBottomTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], ScrollToBottomTerminalAction);
        return ScrollToBottomTerminalAction;
    }(actions_1.Action));
    exports.ScrollToBottomTerminalAction = ScrollToBottomTerminalAction;
    var ScrollUpTerminalAction = /** @class */ (function (_super) {
        __extends(ScrollUpTerminalAction, _super);
        function ScrollUpTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ScrollUpTerminalAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.scrollUpLine();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        ScrollUpTerminalAction.ID = 'workbench.action.terminal.scrollUp';
        ScrollUpTerminalAction.LABEL = nls.localize('workbench.action.terminal.scrollUp', "Scroll Up (Line)");
        ScrollUpTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], ScrollUpTerminalAction);
        return ScrollUpTerminalAction;
    }(actions_1.Action));
    exports.ScrollUpTerminalAction = ScrollUpTerminalAction;
    var ScrollUpPageTerminalAction = /** @class */ (function (_super) {
        __extends(ScrollUpPageTerminalAction, _super);
        function ScrollUpPageTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ScrollUpPageTerminalAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.scrollUpPage();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        ScrollUpPageTerminalAction.ID = 'workbench.action.terminal.scrollUpPage';
        ScrollUpPageTerminalAction.LABEL = nls.localize('workbench.action.terminal.scrollUpPage', "Scroll Up (Page)");
        ScrollUpPageTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], ScrollUpPageTerminalAction);
        return ScrollUpPageTerminalAction;
    }(actions_1.Action));
    exports.ScrollUpPageTerminalAction = ScrollUpPageTerminalAction;
    var ScrollToTopTerminalAction = /** @class */ (function (_super) {
        __extends(ScrollToTopTerminalAction, _super);
        function ScrollToTopTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ScrollToTopTerminalAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.scrollToTop();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        ScrollToTopTerminalAction.ID = 'workbench.action.terminal.scrollToTop';
        ScrollToTopTerminalAction.LABEL = nls.localize('workbench.action.terminal.scrollToTop', "Scroll to Top");
        ScrollToTopTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], ScrollToTopTerminalAction);
        return ScrollToTopTerminalAction;
    }(actions_1.Action));
    exports.ScrollToTopTerminalAction = ScrollToTopTerminalAction;
    var ClearTerminalAction = /** @class */ (function (_super) {
        __extends(ClearTerminalAction, _super);
        function ClearTerminalAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ClearTerminalAction.prototype.run = function (event) {
            var terminalInstance = this.terminalService.getActiveInstance();
            if (terminalInstance) {
                terminalInstance.clear();
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        ClearTerminalAction.ID = 'workbench.action.terminal.clear';
        ClearTerminalAction.LABEL = nls.localize('workbench.action.terminal.clear', "Clear");
        ClearTerminalAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], ClearTerminalAction);
        return ClearTerminalAction;
    }(actions_1.Action));
    exports.ClearTerminalAction = ClearTerminalAction;
    var AllowWorkspaceShellTerminalCommand = /** @class */ (function (_super) {
        __extends(AllowWorkspaceShellTerminalCommand, _super);
        function AllowWorkspaceShellTerminalCommand(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        AllowWorkspaceShellTerminalCommand.prototype.run = function (event) {
            this.terminalService.setWorkspaceShellAllowed(true);
            return winjs_base_1.TPromise.as(void 0);
        };
        AllowWorkspaceShellTerminalCommand.ID = 'workbench.action.terminal.allowWorkspaceShell';
        AllowWorkspaceShellTerminalCommand.LABEL = nls.localize('workbench.action.terminal.allowWorkspaceShell', "Allow Workspace Shell Configuration");
        AllowWorkspaceShellTerminalCommand = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], AllowWorkspaceShellTerminalCommand);
        return AllowWorkspaceShellTerminalCommand;
    }(actions_1.Action));
    exports.AllowWorkspaceShellTerminalCommand = AllowWorkspaceShellTerminalCommand;
    var DisallowWorkspaceShellTerminalCommand = /** @class */ (function (_super) {
        __extends(DisallowWorkspaceShellTerminalCommand, _super);
        function DisallowWorkspaceShellTerminalCommand(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        DisallowWorkspaceShellTerminalCommand.prototype.run = function (event) {
            this.terminalService.setWorkspaceShellAllowed(false);
            return winjs_base_1.TPromise.as(void 0);
        };
        DisallowWorkspaceShellTerminalCommand.ID = 'workbench.action.terminal.disallowWorkspaceShell';
        DisallowWorkspaceShellTerminalCommand.LABEL = nls.localize('workbench.action.terminal.disallowWorkspaceShell', "Disallow Workspace Shell Configuration");
        DisallowWorkspaceShellTerminalCommand = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], DisallowWorkspaceShellTerminalCommand);
        return DisallowWorkspaceShellTerminalCommand;
    }(actions_1.Action));
    exports.DisallowWorkspaceShellTerminalCommand = DisallowWorkspaceShellTerminalCommand;
    var RenameTerminalAction = /** @class */ (function (_super) {
        __extends(RenameTerminalAction, _super);
        function RenameTerminalAction(id, label, quickOpenService, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            _this.terminalService = terminalService;
            return _this;
        }
        RenameTerminalAction.prototype.run = function (terminal) {
            var terminalInstance = terminal ? this.terminalService.getInstanceFromIndex(parseInt(terminal.getLabel().split(':')[0], 10) - 1) : this.terminalService.getActiveInstance();
            if (!terminalInstance) {
                return winjs_base_1.TPromise.as(void 0);
            }
            return this.quickOpenService.input({
                value: terminalInstance.title,
                prompt: nls.localize('workbench.action.terminal.rename.prompt', "Enter terminal name"),
            }).then(function (name) {
                if (name) {
                    terminalInstance.setTitle(name, false);
                }
            });
        };
        RenameTerminalAction.ID = 'workbench.action.terminal.rename';
        RenameTerminalAction.LABEL = nls.localize('workbench.action.terminal.rename', "Rename");
        RenameTerminalAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, terminal_1.ITerminalService)
        ], RenameTerminalAction);
        return RenameTerminalAction;
    }(actions_1.Action));
    exports.RenameTerminalAction = RenameTerminalAction;
    var FocusTerminalFindWidgetAction = /** @class */ (function (_super) {
        __extends(FocusTerminalFindWidgetAction, _super);
        function FocusTerminalFindWidgetAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        FocusTerminalFindWidgetAction.prototype.run = function () {
            return this.terminalService.focusFindWidget();
        };
        FocusTerminalFindWidgetAction.ID = 'workbench.action.terminal.focusFindWidget';
        FocusTerminalFindWidgetAction.LABEL = nls.localize('workbench.action.terminal.focusFindWidget', "Focus Find Widget");
        FocusTerminalFindWidgetAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], FocusTerminalFindWidgetAction);
        return FocusTerminalFindWidgetAction;
    }(actions_1.Action));
    exports.FocusTerminalFindWidgetAction = FocusTerminalFindWidgetAction;
    var HideTerminalFindWidgetAction = /** @class */ (function (_super) {
        __extends(HideTerminalFindWidgetAction, _super);
        function HideTerminalFindWidgetAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        HideTerminalFindWidgetAction.prototype.run = function () {
            return winjs_base_1.TPromise.as(this.terminalService.hideFindWidget());
        };
        HideTerminalFindWidgetAction.ID = 'workbench.action.terminal.hideFindWidget';
        HideTerminalFindWidgetAction.LABEL = nls.localize('workbench.action.terminal.hideFindWidget', "Hide Find Widget");
        HideTerminalFindWidgetAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], HideTerminalFindWidgetAction);
        return HideTerminalFindWidgetAction;
    }(actions_1.Action));
    exports.HideTerminalFindWidgetAction = HideTerminalFindWidgetAction;
    var ShowNextFindTermTerminalFindWidgetAction = /** @class */ (function (_super) {
        __extends(ShowNextFindTermTerminalFindWidgetAction, _super);
        function ShowNextFindTermTerminalFindWidgetAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ShowNextFindTermTerminalFindWidgetAction.prototype.run = function () {
            return winjs_base_1.TPromise.as(this.terminalService.showNextFindTermFindWidget());
        };
        ShowNextFindTermTerminalFindWidgetAction.ID = 'workbench.action.terminal.findWidget.history.showNext';
        ShowNextFindTermTerminalFindWidgetAction.LABEL = nls.localize('nextTerminalFindTerm', "Show Next Find Term");
        ShowNextFindTermTerminalFindWidgetAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], ShowNextFindTermTerminalFindWidgetAction);
        return ShowNextFindTermTerminalFindWidgetAction;
    }(actions_1.Action));
    exports.ShowNextFindTermTerminalFindWidgetAction = ShowNextFindTermTerminalFindWidgetAction;
    var ShowPreviousFindTermTerminalFindWidgetAction = /** @class */ (function (_super) {
        __extends(ShowPreviousFindTermTerminalFindWidgetAction, _super);
        function ShowPreviousFindTermTerminalFindWidgetAction(id, label, terminalService) {
            var _this = _super.call(this, id, label) || this;
            _this.terminalService = terminalService;
            return _this;
        }
        ShowPreviousFindTermTerminalFindWidgetAction.prototype.run = function () {
            return winjs_base_1.TPromise.as(this.terminalService.showPreviousFindTermFindWidget());
        };
        ShowPreviousFindTermTerminalFindWidgetAction.ID = 'workbench.action.terminal.findWidget.history.showPrevious';
        ShowPreviousFindTermTerminalFindWidgetAction.LABEL = nls.localize('previousTerminalFindTerm', "Show Previous Find Term");
        ShowPreviousFindTermTerminalFindWidgetAction = __decorate([
            __param(2, terminal_1.ITerminalService)
        ], ShowPreviousFindTermTerminalFindWidgetAction);
        return ShowPreviousFindTermTerminalFindWidgetAction;
    }(actions_1.Action));
    exports.ShowPreviousFindTermTerminalFindWidgetAction = ShowPreviousFindTermTerminalFindWidgetAction;
    var QuickOpenActionTermContributor = /** @class */ (function (_super) {
        __extends(QuickOpenActionTermContributor, _super);
        function QuickOpenActionTermContributor(instantiationService) {
            var _this = _super.call(this) || this;
            _this.instantiationService = instantiationService;
            return _this;
        }
        QuickOpenActionTermContributor.prototype.getActions = function (context) {
            var actions = [];
            if (context.element instanceof terminalQuickOpen_1.TerminalEntry) {
                actions.push(this.instantiationService.createInstance(RenameTerminalQuickOpenAction, RenameTerminalQuickOpenAction.ID, RenameTerminalQuickOpenAction.LABEL, context.element));
                actions.push(this.instantiationService.createInstance(QuickKillTerminalAction, QuickKillTerminalAction.ID, QuickKillTerminalAction.LABEL, context.element));
            }
            return actions;
        };
        QuickOpenActionTermContributor.prototype.hasActions = function (context) {
            return true;
        };
        QuickOpenActionTermContributor = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], QuickOpenActionTermContributor);
        return QuickOpenActionTermContributor;
    }(actions_2.ActionBarContributor));
    exports.QuickOpenActionTermContributor = QuickOpenActionTermContributor;
    var QuickOpenTermAction = /** @class */ (function (_super) {
        __extends(QuickOpenTermAction, _super);
        function QuickOpenTermAction(id, label, quickOpenService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            return _this;
        }
        QuickOpenTermAction.prototype.run = function () {
            return this.quickOpenService.show(exports.TERMINAL_PICKER_PREFIX, null);
        };
        QuickOpenTermAction.ID = 'workbench.action.quickOpenTerm';
        QuickOpenTermAction.LABEL = nls.localize('quickOpenTerm', "Switch Active Terminal");
        QuickOpenTermAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService)
        ], QuickOpenTermAction);
        return QuickOpenTermAction;
    }(actions_1.Action));
    exports.QuickOpenTermAction = QuickOpenTermAction;
    var RenameTerminalQuickOpenAction = /** @class */ (function (_super) {
        __extends(RenameTerminalQuickOpenAction, _super);
        function RenameTerminalQuickOpenAction(id, label, terminal, quickOpenService, terminalService) {
            var _this = _super.call(this, id, label, quickOpenService, terminalService) || this;
            _this.terminal = terminal;
            _this.class = 'quick-open-terminal-configure';
            return _this;
        }
        RenameTerminalQuickOpenAction.prototype.run = function () {
            var _this = this;
            _super.prototype.run.call(this, this.terminal)
                .then(function () { return winjs_base_1.TPromise.timeout(50); })
                .then(function (result) { return _this.quickOpenService.show(exports.TERMINAL_PICKER_PREFIX, null); });
            return winjs_base_1.TPromise.as(null);
        };
        RenameTerminalQuickOpenAction = __decorate([
            __param(3, quickOpen_1.IQuickOpenService),
            __param(4, terminal_1.ITerminalService)
        ], RenameTerminalQuickOpenAction);
        return RenameTerminalQuickOpenAction;
    }(RenameTerminalAction));
    exports.RenameTerminalQuickOpenAction = RenameTerminalQuickOpenAction;
});
