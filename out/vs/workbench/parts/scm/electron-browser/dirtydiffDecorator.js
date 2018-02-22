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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/base/common/event", "vs/editor/browser/codeEditor", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/editor/common/services/resolverService", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/editorWorkerService", "vs/platform/configuration/common/configuration", "vs/workbench/services/group/common/groupService", "vs/workbench/services/scm/common/scm", "vs/editor/common/model/textModel", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/nls", "vs/base/common/color", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/contrib/referenceSearch/peekViewWidget", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/common/core/position", "vs/base/common/numbers", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/contrib/referenceSearch/referencesWidget", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/keybinding/common/keybinding", "vs/base/common/paths", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuItemActionItem", "vs/editor/common/model", "vs/base/common/arrays", "vs/editor/browser/services/codeEditorService", "vs/platform/contextview/browser/contextView", "../../../../base/browser/dom", "vs/css!./media/dirtydiffDecorator"], function (require, exports, nls, async_1, lifecycle_1, winjs_base_1, event_1, codeEditor_1, instantiation_1, message_1, resolverService_1, editorService_1, editorWorkerService_1, configuration_1, groupService_1, scm_1, textModel_1, themeService_1, colorRegistry_1, nls_1, color_1, editorBrowser_1, editorExtensions_1, peekViewWidget_1, contextkey_1, editorContextKeys_1, position_1, numbers_1, keybindingsRegistry_1, referencesWidget_1, embeddedCodeEditorWidget_1, actions_1, actionbar_1, keybinding_1, paths_1, actions_2, menuItemActionItem_1, model_1, arrays_1, codeEditorService_1, contextView_1, dom_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // TODO@Joao
    // Need to subclass MenuItemActionItem in order to respect
    // the action context coming from any action bar, without breaking
    // existing users
    var DiffMenuItemActionItem = /** @class */ (function (_super) {
        __extends(DiffMenuItemActionItem, _super);
        function DiffMenuItemActionItem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DiffMenuItemActionItem.prototype.onClick = function (event) {
            var _this = this;
            event.preventDefault();
            event.stopPropagation();
            this.actionRunner.run(this._commandAction, this._context)
                .done(undefined, function (err) { return _this._messageService.show(message_1.Severity.Error, err); });
        };
        return DiffMenuItemActionItem;
    }(menuItemActionItem_1.MenuItemActionItem));
    var DiffActionRunner = /** @class */ (function (_super) {
        __extends(DiffActionRunner, _super);
        function DiffActionRunner() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DiffActionRunner.prototype.runAction = function (action, context) {
            if (action instanceof actions_2.MenuItemAction) {
                return action.run.apply(action, context);
            }
            return _super.prototype.runAction.call(this, action, context);
        };
        return DiffActionRunner;
    }(actions_1.ActionRunner));
    exports.isDirtyDiffVisible = new contextkey_1.RawContextKey('dirtyDiffVisible', false);
    function getChangeHeight(change) {
        var modified = change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
        var original = change.originalEndLineNumber - change.originalStartLineNumber + 1;
        if (change.originalEndLineNumber === 0) {
            return modified;
        }
        else if (change.modifiedEndLineNumber === 0) {
            return original;
        }
        else {
            return modified + original;
        }
    }
    function getModifiedEndLineNumber(change) {
        if (change.modifiedEndLineNumber === 0) {
            return change.modifiedStartLineNumber === 0 ? 1 : change.modifiedStartLineNumber;
        }
        else {
            return change.modifiedEndLineNumber;
        }
    }
    function lineIntersectsChange(lineNumber, change) {
        // deletion at the beginning of the file
        if (lineNumber === 1 && change.modifiedStartLineNumber === 0 && change.modifiedEndLineNumber === 0) {
            return true;
        }
        return lineNumber >= change.modifiedStartLineNumber && lineNumber <= (change.modifiedEndLineNumber || change.modifiedStartLineNumber);
    }
    var UIEditorAction = /** @class */ (function (_super) {
        __extends(UIEditorAction, _super);
        function UIEditorAction(editor, action, cssClass, keybindingService, instantiationService) {
            var _this = this;
            var keybinding = keybindingService.lookupKeybinding(action.id);
            var label = action.label + (keybinding ? " (" + keybinding.getLabel() + ")" : '');
            _this = _super.call(this, action.id, label, cssClass) || this;
            _this.instantiationService = instantiationService;
            _this.action = action;
            _this.editor = editor;
            return _this;
        }
        UIEditorAction.prototype.run = function () {
            var _this = this;
            return winjs_base_1.TPromise.wrap(this.instantiationService.invokeFunction(function (accessor) { return _this.action.run(accessor, _this.editor, null); }));
        };
        UIEditorAction = __decorate([
            __param(3, keybinding_1.IKeybindingService),
            __param(4, instantiation_1.IInstantiationService)
        ], UIEditorAction);
        return UIEditorAction;
    }(actions_1.Action));
    var ChangeType;
    (function (ChangeType) {
        ChangeType[ChangeType["Modify"] = 0] = "Modify";
        ChangeType[ChangeType["Add"] = 1] = "Add";
        ChangeType[ChangeType["Delete"] = 2] = "Delete";
    })(ChangeType || (ChangeType = {}));
    function getChangeType(change) {
        if (change.originalEndLineNumber === 0) {
            return ChangeType.Add;
        }
        else if (change.modifiedEndLineNumber === 0) {
            return ChangeType.Delete;
        }
        else {
            return ChangeType.Modify;
        }
    }
    function getChangeTypeColor(theme, changeType) {
        switch (changeType) {
            case ChangeType.Modify: return theme.getColor(exports.editorGutterModifiedBackground);
            case ChangeType.Add: return theme.getColor(exports.editorGutterAddedBackground);
            case ChangeType.Delete: return theme.getColor(exports.editorGutterDeletedBackground);
        }
    }
    function getOuterEditorFromDiffEditor(accessor) {
        var diffEditors = accessor.get(codeEditorService_1.ICodeEditorService).listDiffEditors();
        for (var _i = 0, diffEditors_1 = diffEditors; _i < diffEditors_1.length; _i++) {
            var diffEditor = diffEditors_1[_i];
            if (diffEditor.isFocused() && diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget) {
                return diffEditor.getParentEditor();
            }
        }
        return peekViewWidget_1.getOuterEditor(accessor);
    }
    var DirtyDiffWidget = /** @class */ (function (_super) {
        __extends(DirtyDiffWidget, _super);
        function DirtyDiffWidget(editor, model, themeService, instantiationService, menuService, keybindingService, messageService, contextKeyService, contextMenuService) {
            var _this = _super.call(this, editor, { isResizeable: true, frameWidth: 1, keepEditorSelection: true }) || this;
            _this.model = model;
            _this.themeService = themeService;
            _this.instantiationService = instantiationService;
            _this.keybindingService = keybindingService;
            _this.messageService = messageService;
            _this.contextMenuService = contextMenuService;
            _this.height = undefined;
            themeService.onThemeChange(_this._applyTheme, _this, _this._disposables);
            _this._applyTheme(themeService.getTheme());
            _this.contextKeyService = contextKeyService.createScoped();
            _this.contextKeyService.createKey('originalResourceScheme', _this.model.original.uri.scheme);
            _this.menu = menuService.createMenu(actions_2.MenuId.SCMChangeContext, _this.contextKeyService);
            _this.create();
            _this.title = paths_1.basename(editor.getModel().uri.fsPath);
            _this.setTitle(_this.title);
            model.onDidChange(_this.renderTitle, _this, _this._disposables);
            return _this;
        }
        DirtyDiffWidget.prototype.showChange = function (index) {
            var _this = this;
            var change = this.model.changes[index];
            this.index = index;
            this.change = change;
            var originalModel = this.model.original;
            if (!originalModel) {
                return;
            }
            var onFirstDiffUpdate = event_1.once(this.diffEditor.onDidUpdateDiff);
            // TODO@joao TODO@alex need this setTimeout probably because the
            // non-side-by-side diff still hasn't created the view zones
            onFirstDiffUpdate(function () { return setTimeout(function () { return _this.revealChange(change); }, 0); });
            this.diffEditor.setModel(this.model);
            var position = new position_1.Position(getModifiedEndLineNumber(change), 1);
            var lineHeight = this.editor.getConfiguration().lineHeight;
            var editorHeight = this.editor.getLayoutInfo().height;
            var editorHeightInLines = Math.floor(editorHeight / lineHeight);
            var height = Math.min(getChangeHeight(change) + /* padding */ 8, Math.floor(editorHeightInLines / 3));
            this.renderTitle();
            var changeType = getChangeType(change);
            var changeTypeColor = getChangeTypeColor(this.themeService.getTheme(), changeType);
            this.style({ frameColor: changeTypeColor, arrowColor: changeTypeColor });
            this._actionbarWidget.context = [this.model.modified.uri, this.model.changes, index];
            this.show(position, height);
            this.editor.focus();
        };
        DirtyDiffWidget.prototype.renderTitle = function () {
            var detail = this.model.changes.length > 1
                ? nls_1.localize('changes', "{0} of {1} changes", this.index + 1, this.model.changes.length)
                : nls_1.localize('change', "{0} of {1} change", this.index + 1, this.model.changes.length);
            this.setTitle(this.title, detail);
        };
        DirtyDiffWidget.prototype._fillHead = function (container) {
            _super.prototype._fillHead.call(this, container);
            var previous = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowPreviousChangeAction(), 'show-previous-change octicon octicon-chevron-up');
            var next = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowNextChangeAction(), 'show-next-change octicon octicon-chevron-down');
            this._disposables.push(previous);
            this._disposables.push(next);
            this._actionbarWidget.push([previous, next], { label: false, icon: true });
            var actions = [];
            menuItemActionItem_1.fillInActions(this.menu, { shouldForwardArgs: true }, actions, this.contextMenuService);
            this._actionbarWidget.push(actions, { label: false, icon: true });
        };
        DirtyDiffWidget.prototype._getActionBarOptions = function () {
            var _this = this;
            return {
                actionRunner: new DiffActionRunner(),
                actionItemProvider: function (action) { return _this.getActionItem(action); },
                orientation: actionbar_1.ActionsOrientation.HORIZONTAL_REVERSE
            };
        };
        DirtyDiffWidget.prototype.getActionItem = function (action) {
            if (!(action instanceof actions_2.MenuItemAction)) {
                return undefined;
            }
            return new DiffMenuItemActionItem(action, this.keybindingService, this.messageService, this.contextMenuService);
        };
        DirtyDiffWidget.prototype._fillBody = function (container) {
            var options = {
                scrollBeyondLastLine: true,
                scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false
                },
                overviewRulerLanes: 2,
                fixedOverflowWidgets: true,
                minimap: { enabled: false },
                renderSideBySide: false,
                readOnly: true
            };
            this.diffEditor = this.instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, container, options, this.editor);
        };
        DirtyDiffWidget.prototype._onWidth = function (width) {
            if (typeof this.height === 'undefined') {
                return;
            }
            this.diffEditor.layout({ height: this.height, width: width });
        };
        DirtyDiffWidget.prototype._doLayoutBody = function (height, width) {
            _super.prototype._doLayoutBody.call(this, height, width);
            this.diffEditor.layout({ height: height, width: width });
            if (typeof this.height === 'undefined') {
                this.revealChange(this.change);
            }
            this.height = height;
        };
        DirtyDiffWidget.prototype.revealChange = function (change) {
            var start, end;
            if (change.modifiedEndLineNumber === 0) {
                start = change.modifiedStartLineNumber;
                end = change.modifiedStartLineNumber + 1;
            }
            else if (change.originalEndLineNumber > 0) {
                start = change.modifiedStartLineNumber - 1;
                end = change.modifiedEndLineNumber + 1;
            }
            else {
                start = change.modifiedStartLineNumber;
                end = change.modifiedEndLineNumber;
            }
            this.diffEditor.revealLinesInCenter(start, end, 1 /* Immediate */);
        };
        DirtyDiffWidget.prototype._applyTheme = function (theme) {
            var borderColor = theme.getColor(referencesWidget_1.peekViewBorder) || color_1.Color.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: theme.getColor(referencesWidget_1.peekViewTitleBackground) || color_1.Color.transparent,
                primaryHeadingColor: theme.getColor(referencesWidget_1.peekViewTitleForeground),
                secondaryHeadingColor: theme.getColor(referencesWidget_1.peekViewTitleInfoForeground)
            });
        };
        DirtyDiffWidget.prototype.revealLine = function (lineNumber) {
            this.editor.revealLineInCenterIfOutsideViewport(lineNumber, 0 /* Smooth */);
        };
        DirtyDiffWidget = __decorate([
            __param(2, themeService_1.IThemeService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, actions_2.IMenuService),
            __param(5, keybinding_1.IKeybindingService),
            __param(6, message_1.IMessageService),
            __param(7, contextkey_1.IContextKeyService),
            __param(8, contextView_1.IContextMenuService)
        ], DirtyDiffWidget);
        return DirtyDiffWidget;
    }(peekViewWidget_1.PeekViewWidget));
    var ShowPreviousChangeAction = /** @class */ (function (_super) {
        __extends(ShowPreviousChangeAction, _super);
        function ShowPreviousChangeAction() {
            return _super.call(this, {
                id: 'editor.action.dirtydiff.previous',
                label: nls.localize('show previous change', "Show Previous Change"),
                alias: 'Show Previous Change',
                precondition: null,
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.textFocus, primary: 1024 /* Shift */ | 512 /* Alt */ | 61 /* F3 */ }
            }) || this;
        }
        ShowPreviousChangeAction.prototype.run = function (accessor, editor) {
            var outerEditor = getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            var controller = DirtyDiffController.get(outerEditor);
            if (!controller) {
                return;
            }
            if (!controller.canNavigate()) {
                return;
            }
            controller.previous();
        };
        return ShowPreviousChangeAction;
    }(editorExtensions_1.EditorAction));
    exports.ShowPreviousChangeAction = ShowPreviousChangeAction;
    editorExtensions_1.registerEditorAction(ShowPreviousChangeAction);
    var ShowNextChangeAction = /** @class */ (function (_super) {
        __extends(ShowNextChangeAction, _super);
        function ShowNextChangeAction() {
            return _super.call(this, {
                id: 'editor.action.dirtydiff.next',
                label: nls.localize('show next change', "Show Next Change"),
                alias: 'Show Next Change',
                precondition: null,
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.textFocus, primary: 512 /* Alt */ | 61 /* F3 */ }
            }) || this;
        }
        ShowNextChangeAction.prototype.run = function (accessor, editor) {
            var outerEditor = getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            var controller = DirtyDiffController.get(outerEditor);
            if (!controller) {
                return;
            }
            if (!controller.canNavigate()) {
                return;
            }
            controller.next();
        };
        return ShowNextChangeAction;
    }(editorExtensions_1.EditorAction));
    exports.ShowNextChangeAction = ShowNextChangeAction;
    editorExtensions_1.registerEditorAction(ShowNextChangeAction);
    var MoveToPreviousChangeAction = /** @class */ (function (_super) {
        __extends(MoveToPreviousChangeAction, _super);
        function MoveToPreviousChangeAction() {
            return _super.call(this, {
                id: 'workbench.action.editor.previousChange',
                label: nls.localize('move to previous change', "Move to Previous Change"),
                alias: 'Move to Previous Change',
                precondition: null,
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.textFocus, primary: 1024 /* Shift */ | 512 /* Alt */ | 63 /* F5 */ }
            }) || this;
        }
        MoveToPreviousChangeAction.prototype.run = function (accessor, editor) {
            var outerEditor = getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            var controller = DirtyDiffController.get(outerEditor);
            if (!controller || !controller.modelRegistry) {
                return;
            }
            var lineNumber = outerEditor.getPosition().lineNumber;
            var model = controller.modelRegistry.getModel(outerEditor.getModel());
            var index = model.findPreviousClosestChange(lineNumber, false);
            var change = model.changes[index];
            outerEditor.setPosition(new position_1.Position(change.modifiedStartLineNumber, 1));
        };
        return MoveToPreviousChangeAction;
    }(editorExtensions_1.EditorAction));
    exports.MoveToPreviousChangeAction = MoveToPreviousChangeAction;
    editorExtensions_1.registerEditorAction(MoveToPreviousChangeAction);
    var MoveToNextChangeAction = /** @class */ (function (_super) {
        __extends(MoveToNextChangeAction, _super);
        function MoveToNextChangeAction() {
            return _super.call(this, {
                id: 'workbench.action.editor.nextChange',
                label: nls.localize('move to next change', "Move to Next Change"),
                alias: 'Move to Next Change',
                precondition: null,
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.textFocus, primary: 512 /* Alt */ | 63 /* F5 */ }
            }) || this;
        }
        MoveToNextChangeAction.prototype.run = function (accessor, editor) {
            var outerEditor = getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            var controller = DirtyDiffController.get(outerEditor);
            if (!controller || !controller.modelRegistry) {
                return;
            }
            var lineNumber = outerEditor.getPosition().lineNumber;
            var model = controller.modelRegistry.getModel(outerEditor.getModel());
            var index = model.findNextClosestChange(lineNumber, false);
            var change = model.changes[index];
            outerEditor.setPosition(new position_1.Position(change.modifiedStartLineNumber, 1));
        };
        return MoveToNextChangeAction;
    }(editorExtensions_1.EditorAction));
    exports.MoveToNextChangeAction = MoveToNextChangeAction;
    editorExtensions_1.registerEditorAction(MoveToNextChangeAction);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'closeDirtyDiff',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(50),
        primary: 9 /* Escape */,
        secondary: [1024 /* Shift */ | 9 /* Escape */],
        when: contextkey_1.ContextKeyExpr.and(exports.isDirtyDiffVisible),
        handler: function (accessor) {
            var outerEditor = getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            var controller = DirtyDiffController.get(outerEditor);
            if (!controller) {
                return;
            }
            controller.close();
        }
    });
    var DirtyDiffController = /** @class */ (function () {
        function DirtyDiffController(editor, contextKeyService, instantiationService) {
            var _this = this;
            this.editor = editor;
            this.instantiationService = instantiationService;
            this.modelRegistry = null;
            this.model = null;
            this.widget = null;
            this.currentIndex = -1;
            this.session = lifecycle_1.empty;
            this.mouseDownInfo = null;
            this.enabled = false;
            this.disposables = [];
            this.enabled = !contextKeyService.getContextKeyValue('isInDiffEditor');
            if (this.enabled) {
                this.isDirtyDiffVisible = exports.isDirtyDiffVisible.bindTo(contextKeyService);
                this.disposables.push(editor.onMouseDown(function (e) { return _this.onEditorMouseDown(e); }));
                this.disposables.push(editor.onMouseUp(function (e) { return _this.onEditorMouseUp(e); }));
                this.disposables.push(editor.onDidChangeModel(function () { return _this.close(); }));
            }
        }
        DirtyDiffController.get = function (editor) {
            return editor.getContribution(DirtyDiffController.ID);
        };
        DirtyDiffController.prototype.getId = function () {
            return DirtyDiffController.ID;
        };
        DirtyDiffController.prototype.canNavigate = function () {
            return this.currentIndex === -1 || this.model.changes.length > 1;
        };
        DirtyDiffController.prototype.next = function (lineNumber) {
            if (!this.assertWidget()) {
                return;
            }
            if (typeof lineNumber === 'number' || this.currentIndex === -1) {
                this.currentIndex = this.model.findNextClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber);
            }
            else {
                this.currentIndex = numbers_1.rot(this.currentIndex + 1, this.model.changes.length);
            }
            this.widget.showChange(this.currentIndex);
        };
        DirtyDiffController.prototype.previous = function (lineNumber) {
            if (!this.assertWidget()) {
                return;
            }
            if (typeof lineNumber === 'number' || this.currentIndex === -1) {
                this.currentIndex = this.model.findPreviousClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber);
            }
            else {
                this.currentIndex = numbers_1.rot(this.currentIndex - 1, this.model.changes.length);
            }
            this.widget.showChange(this.currentIndex);
        };
        DirtyDiffController.prototype.close = function () {
            this.session.dispose();
            this.session = lifecycle_1.empty;
        };
        DirtyDiffController.prototype.assertWidget = function () {
            var _this = this;
            if (!this.enabled) {
                return false;
            }
            if (this.widget) {
                if (this.model.changes.length === 0) {
                    this.close();
                    return false;
                }
                return true;
            }
            if (!this.modelRegistry) {
                return false;
            }
            var editorModel = this.editor.getModel();
            if (!editorModel) {
                return false;
            }
            var model = this.modelRegistry.getModel(editorModel);
            if (!model) {
                return false;
            }
            if (model.changes.length === 0) {
                return false;
            }
            this.currentIndex = -1;
            this.model = model;
            this.widget = this.instantiationService.createInstance(DirtyDiffWidget, this.editor, model);
            this.isDirtyDiffVisible.set(true);
            var disposables = [];
            event_1.once(this.widget.onDidClose)(this.close, this, disposables);
            model.onDidChange(this.onDidModelChange, this, disposables);
            disposables.push(this.widget, lifecycle_1.toDisposable(function () {
                _this.model = null;
                _this.widget = null;
                _this.currentIndex = -1;
                _this.isDirtyDiffVisible.set(false);
                _this.editor.focus();
            }));
            this.session = lifecycle_1.combinedDisposable(disposables);
            return true;
        };
        DirtyDiffController.prototype.onDidModelChange = function (splices) {
            for (var _i = 0, splices_1 = splices; _i < splices_1.length; _i++) {
                var splice = splices_1[_i];
                if (splice.start <= this.currentIndex) {
                    if (this.currentIndex < splice.start + splice.deleteCount) {
                        this.currentIndex = -1;
                        this.next();
                    }
                    else {
                        this.currentIndex = numbers_1.rot(this.currentIndex + splice.toInsert.length - splice.deleteCount - 1, this.model.changes.length);
                        this.next();
                    }
                }
            }
        };
        DirtyDiffController.prototype.onEditorMouseDown = function (e) {
            this.mouseDownInfo = null;
            var range = e.target.range;
            if (!range) {
                return;
            }
            if (!e.event.leftButton) {
                return;
            }
            if (e.target.type !== editorBrowser_1.MouseTargetType.GUTTER_LINE_DECORATIONS) {
                return;
            }
            var data = e.target.detail;
            var gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth;
            // TODO@joao TODO@alex TODO@martin this is such that we don't collide with folding
            if (gutterOffsetX > 10) {
                return;
            }
            this.mouseDownInfo = { lineNumber: range.startLineNumber };
        };
        DirtyDiffController.prototype.onEditorMouseUp = function (e) {
            if (!this.mouseDownInfo) {
                return;
            }
            var lineNumber = this.mouseDownInfo.lineNumber;
            this.mouseDownInfo = null;
            var range = e.target.range;
            if (!range || range.startLineNumber !== lineNumber) {
                return;
            }
            if (e.target.type !== editorBrowser_1.MouseTargetType.GUTTER_LINE_DECORATIONS) {
                return;
            }
            if (!this.modelRegistry) {
                return;
            }
            var editorModel = this.editor.getModel();
            if (!editorModel) {
                return;
            }
            var model = this.modelRegistry.getModel(editorModel);
            if (!model) {
                return;
            }
            var index = arrays_1.firstIndex(model.changes, function (change) { return lineIntersectsChange(lineNumber, change); });
            if (index < 0) {
                return;
            }
            if (index === this.currentIndex) {
                this.close();
            }
            else {
                this.next(lineNumber);
            }
        };
        DirtyDiffController.prototype.dispose = function () {
            return;
        };
        DirtyDiffController.ID = 'editor.contrib.dirtydiff';
        DirtyDiffController = __decorate([
            __param(1, contextkey_1.IContextKeyService),
            __param(2, instantiation_1.IInstantiationService)
        ], DirtyDiffController);
        return DirtyDiffController;
    }());
    exports.DirtyDiffController = DirtyDiffController;
    exports.editorGutterModifiedBackground = colorRegistry_1.registerColor('editorGutter.modifiedBackground', {
        dark: new color_1.Color(new color_1.RGBA(12, 125, 157)),
        light: new color_1.Color(new color_1.RGBA(102, 175, 224)),
        hc: new color_1.Color(new color_1.RGBA(0, 73, 122))
    }, nls_1.localize('editorGutterModifiedBackground', "Editor gutter background color for lines that are modified."));
    exports.editorGutterAddedBackground = colorRegistry_1.registerColor('editorGutter.addedBackground', {
        dark: new color_1.Color(new color_1.RGBA(88, 124, 12)),
        light: new color_1.Color(new color_1.RGBA(129, 184, 139)),
        hc: new color_1.Color(new color_1.RGBA(27, 82, 37))
    }, nls_1.localize('editorGutterAddedBackground', "Editor gutter background color for lines that are added."));
    exports.editorGutterDeletedBackground = colorRegistry_1.registerColor('editorGutter.deletedBackground', {
        dark: new color_1.Color(new color_1.RGBA(148, 21, 27)),
        light: new color_1.Color(new color_1.RGBA(202, 75, 81)),
        hc: new color_1.Color(new color_1.RGBA(141, 14, 20))
    }, nls_1.localize('editorGutterDeletedBackground', "Editor gutter background color for lines that are deleted."));
    var overviewRulerDefault = new color_1.Color(new color_1.RGBA(0, 122, 204, 0.6));
    exports.overviewRulerModifiedForeground = colorRegistry_1.registerColor('editorOverviewRuler.modifiedForeground', { dark: overviewRulerDefault, light: overviewRulerDefault, hc: overviewRulerDefault }, nls.localize('overviewRulerModifiedForeground', 'Overview ruler marker color for modified content.'));
    exports.overviewRulerAddedForeground = colorRegistry_1.registerColor('editorOverviewRuler.addedForeground', { dark: overviewRulerDefault, light: overviewRulerDefault, hc: overviewRulerDefault }, nls.localize('overviewRulerAddedForeground', 'Overview ruler marker color for added content.'));
    exports.overviewRulerDeletedForeground = colorRegistry_1.registerColor('editorOverviewRuler.deletedForeground', { dark: overviewRulerDefault, light: overviewRulerDefault, hc: overviewRulerDefault }, nls.localize('overviewRulerDeletedForeground', 'Overview ruler marker color for deleted content.'));
    var DirtyDiffDecorator = /** @class */ (function () {
        function DirtyDiffDecorator(editorModel, model, configurationService) {
            this.editorModel = editorModel;
            this.model = model;
            this.decorations = [];
            this.disposables = [];
            var decorations = configurationService.getValue('scm.diffDecorations');
            var gutter = decorations === 'all' || decorations === 'gutter';
            var overview = decorations === 'all' || decorations === 'overview';
            var options = { gutter: gutter, overview: overview };
            this.modifiedOptions = DirtyDiffDecorator.createDecoration('dirty-diff-modified', exports.overviewRulerModifiedForeground, options);
            this.addedOptions = DirtyDiffDecorator.createDecoration('dirty-diff-added', exports.overviewRulerAddedForeground, options);
            this.deletedOptions = DirtyDiffDecorator.createDecoration('dirty-diff-deleted', exports.overviewRulerDeletedForeground, options);
            model.onDidChange(this.onDidChange, this, this.disposables);
        }
        DirtyDiffDecorator.createDecoration = function (className, foregroundColor, options) {
            var decorationOptions = {
                isWholeLine: true,
            };
            if (options.gutter) {
                decorationOptions.linesDecorationsClassName = "dirty-diff-glyph " + className;
            }
            if (options.overview) {
                decorationOptions.overviewRuler = {
                    color: themeService_1.themeColorFromId(foregroundColor),
                    darkColor: themeService_1.themeColorFromId(foregroundColor),
                    position: model_1.OverviewRulerLane.Left
                };
            }
            return textModel_1.ModelDecorationOptions.createDynamic(decorationOptions);
        };
        DirtyDiffDecorator.prototype.onDidChange = function () {
            var _this = this;
            var decorations = this.model.changes.map(function (change) {
                var changeType = getChangeType(change);
                var startLineNumber = change.modifiedStartLineNumber;
                var endLineNumber = change.modifiedEndLineNumber || startLineNumber;
                switch (changeType) {
                    case ChangeType.Add:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: 1,
                                endLineNumber: endLineNumber, endColumn: 1
                            },
                            options: _this.addedOptions
                        };
                    case ChangeType.Delete:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: 1,
                                endLineNumber: startLineNumber, endColumn: 1
                            },
                            options: _this.deletedOptions
                        };
                    case ChangeType.Modify:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: 1,
                                endLineNumber: endLineNumber, endColumn: 1
                            },
                            options: _this.modifiedOptions
                        };
                }
            });
            this.decorations = this.editorModel.deltaDecorations(this.decorations, decorations);
        };
        DirtyDiffDecorator.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            if (this.editorModel && !this.editorModel.isDisposed()) {
                this.editorModel.deltaDecorations(this.decorations, []);
            }
            this.editorModel = null;
            this.decorations = [];
        };
        DirtyDiffDecorator = __decorate([
            __param(2, configuration_1.IConfigurationService)
        ], DirtyDiffDecorator);
        return DirtyDiffDecorator;
    }());
    function compareChanges(a, b) {
        var result = a.modifiedStartLineNumber - b.modifiedStartLineNumber;
        if (result !== 0) {
            return result;
        }
        result = a.modifiedEndLineNumber - b.modifiedEndLineNumber;
        if (result !== 0) {
            return result;
        }
        result = a.originalStartLineNumber - b.originalStartLineNumber;
        if (result !== 0) {
            return result;
        }
        return a.originalEndLineNumber - b.originalEndLineNumber;
    }
    var DirtyDiffModel = /** @class */ (function () {
        function DirtyDiffModel(_editorModel, scmService, editorWorkerService, textModelResolverService, configurationService) {
            var _this = this;
            this._editorModel = _editorModel;
            this.scmService = scmService;
            this.editorWorkerService = editorWorkerService;
            this.textModelResolverService = textModelResolverService;
            this.configurationService = configurationService;
            this.repositoryDisposables = new Set();
            this.disposables = [];
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._changes = [];
            this.diffDelayer = new async_1.ThrottledDelayer(200);
            this.disposables.push(_editorModel.onDidChangeContent(function () { return _this.triggerDiff(); }));
            scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            scmService.repositories.forEach(function (r) { return _this.onDidAddRepository(r); });
            this.triggerDiff();
        }
        Object.defineProperty(DirtyDiffModel.prototype, "original", {
            get: function () { return this._originalModel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DirtyDiffModel.prototype, "modified", {
            get: function () { return this._editorModel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DirtyDiffModel.prototype, "changes", {
            get: function () {
                return this._changes;
            },
            enumerable: true,
            configurable: true
        });
        DirtyDiffModel.prototype.onDidAddRepository = function (repository) {
            var _this = this;
            var disposables = [];
            this.repositoryDisposables.add(disposables);
            disposables.push(lifecycle_1.toDisposable(function () { return _this.repositoryDisposables.delete(disposables); }));
            var onDidChange = event_1.anyEvent(repository.provider.onDidChange, repository.provider.onDidChangeResources);
            onDidChange(this.triggerDiff, this, disposables);
            var onDidRemoveThis = event_1.filterEvent(this.scmService.onDidRemoveRepository, function (r) { return r === repository; });
            onDidRemoveThis(function () { return lifecycle_1.dispose(disposables); });
            this.triggerDiff();
        };
        DirtyDiffModel.prototype.triggerDiff = function () {
            var _this = this;
            if (!this.diffDelayer) {
                return winjs_base_1.TPromise.as(null);
            }
            return this.diffDelayer
                .trigger(function () { return _this.diff(); })
                .then(function (changes) {
                if (!_this._editorModel || _this._editorModel.isDisposed() || !_this._originalModel || _this._originalModel.isDisposed()) {
                    return undefined; // disposed
                }
                if (_this._originalModel.getValueLength() === 0) {
                    changes = [];
                }
                var diff = arrays_1.sortedDiff(_this._changes, changes, compareChanges);
                _this._changes = changes;
                if (diff.length > 0) {
                    _this._onDidChange.fire(diff);
                }
            });
        };
        DirtyDiffModel.prototype.diff = function () {
            var _this = this;
            return this.getOriginalURIPromise().then(function (originalURI) {
                if (!_this._editorModel || _this._editorModel.isDisposed() || !originalURI) {
                    return winjs_base_1.TPromise.as([]); // disposed
                }
                if (!_this.editorWorkerService.canComputeDirtyDiff(originalURI, _this._editorModel.uri)) {
                    return winjs_base_1.TPromise.as([]); // Files too large
                }
                var ignoreTrimWhitespace = _this.configurationService.getValue('diffEditor.ignoreTrimWhitespace');
                return _this.editorWorkerService.computeDirtyDiff(originalURI, _this._editorModel.uri, ignoreTrimWhitespace);
            });
        };
        DirtyDiffModel.prototype.getOriginalURIPromise = function () {
            var _this = this;
            if (this._originalURIPromise) {
                return this._originalURIPromise;
            }
            this._originalURIPromise = this.getOriginalResource()
                .then(function (originalUri) {
                if (!originalUri) {
                    _this._originalModel = null;
                    return null;
                }
                return _this.textModelResolverService.createModelReference(originalUri)
                    .then(function (ref) {
                    _this._originalModel = ref.object.textEditorModel;
                    _this.disposables.push(ref);
                    _this.disposables.push(ref.object.textEditorModel.onDidChangeContent(function () { return _this.triggerDiff(); }));
                    return originalUri;
                });
            });
            return async_1.always(this._originalURIPromise, function () {
                _this._originalURIPromise = null;
            });
        };
        DirtyDiffModel.prototype.getOriginalResource = function () {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _i, _a, repository, result;
                return __generator(this, function (_b) {
                    if (!this._editorModel) {
                        return [2 /*return*/, null];
                    }
                    for (_i = 0, _a = this.scmService.repositories; _i < _a.length; _i++) {
                        repository = _a[_i];
                        result = repository.provider.getOriginalResource(this._editorModel.uri);
                        if (result) {
                            return [2 /*return*/, result];
                        }
                    }
                    return [2 /*return*/, null];
                });
            });
        };
        DirtyDiffModel.prototype.findNextClosestChange = function (lineNumber, inclusive) {
            if (inclusive === void 0) { inclusive = true; }
            for (var i = 0; i < this.changes.length; i++) {
                var change = this.changes[i];
                if (inclusive) {
                    if (getModifiedEndLineNumber(change) >= lineNumber) {
                        return i;
                    }
                }
                else {
                    if (change.modifiedStartLineNumber > lineNumber) {
                        return i;
                    }
                }
            }
            return 0;
        };
        DirtyDiffModel.prototype.findPreviousClosestChange = function (lineNumber, inclusive) {
            if (inclusive === void 0) { inclusive = true; }
            for (var i = this.changes.length - 1; i >= 0; i--) {
                var change = this.changes[i];
                if (inclusive) {
                    if (change.modifiedStartLineNumber <= lineNumber) {
                        return i;
                    }
                }
                else {
                    if (getModifiedEndLineNumber(change) < lineNumber) {
                        return i;
                    }
                }
            }
            return this.changes.length - 1;
        };
        DirtyDiffModel.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            this._editorModel = null;
            this._originalModel = null;
            if (this.diffDelayer) {
                this.diffDelayer.cancel();
                this.diffDelayer = null;
            }
            this.repositoryDisposables.forEach(function (d) { return lifecycle_1.dispose(d); });
            this.repositoryDisposables.clear();
        };
        DirtyDiffModel = __decorate([
            __param(1, scm_1.ISCMService),
            __param(2, editorWorkerService_1.IEditorWorkerService),
            __param(3, resolverService_1.ITextModelService),
            __param(4, configuration_1.IConfigurationService)
        ], DirtyDiffModel);
        return DirtyDiffModel;
    }());
    exports.DirtyDiffModel = DirtyDiffModel;
    var DirtyDiffItem = /** @class */ (function () {
        function DirtyDiffItem(model, decorator) {
            this.model = model;
            this.decorator = decorator;
        }
        DirtyDiffItem.prototype.dispose = function () {
            this.decorator.dispose();
            this.model.dispose();
        };
        return DirtyDiffItem;
    }());
    var DirtyDiffWorkbenchController = /** @class */ (function () {
        function DirtyDiffWorkbenchController(editorService, editorGroupService, instantiationService, configurationService) {
            var _this = this;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.enabled = false;
            this.models = [];
            this.items = Object.create(null);
            this.transientDisposables = [];
            this.disposables = [];
            this.stylesheet = dom_1.createStyleSheet();
            this.disposables.push(lifecycle_1.toDisposable(function () { return _this.stylesheet.parentElement.removeChild(_this.stylesheet); }));
            var onDidChangeConfiguration = event_1.filterEvent(configurationService.onDidChangeConfiguration, function (e) { return e.affectsConfiguration('scm.diffDecorations'); });
            onDidChangeConfiguration(this.onDidChangeConfiguration, this, this.disposables);
            this.onDidChangeConfiguration();
            var onDidChangeDiffWidthConfiguration = event_1.filterEvent(configurationService.onDidChangeConfiguration, function (e) { return e.affectsConfiguration('scm.diffDecorationsGutterWidth'); });
            onDidChangeDiffWidthConfiguration(this.onDidChangeDiffWidthConfiguration, this);
            this.onDidChangeDiffWidthConfiguration();
        }
        DirtyDiffWorkbenchController.prototype.onDidChangeConfiguration = function () {
            var enabled = this.configurationService.getValue('scm.diffDecorations') !== 'none';
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        };
        DirtyDiffWorkbenchController.prototype.onDidChangeDiffWidthConfiguration = function () {
            var width = this.configurationService.getValue('scm.diffDecorationsGutterWidth');
            if (isNaN(width) || width <= 0 || width > 5) {
                width = 3;
            }
            this.stylesheet.innerHTML = ".monaco-editor .dirty-diff-modified,.monaco-editor .dirty-diff-added{border-left-width:" + width + "px;}";
        };
        DirtyDiffWorkbenchController.prototype.enable = function () {
            var _this = this;
            if (this.enabled) {
                this.disable();
            }
            this.transientDisposables.push(this.editorGroupService.onEditorsChanged(function () { return _this.onEditorsChanged(); }));
            this.onEditorsChanged();
            this.enabled = true;
        };
        DirtyDiffWorkbenchController.prototype.disable = function () {
            var _this = this;
            if (!this.enabled) {
                return;
            }
            this.transientDisposables = lifecycle_1.dispose(this.transientDisposables);
            this.models.forEach(function (m) { return _this.items[m.id].dispose(); });
            this.models = [];
            this.items = Object.create(null);
            this.enabled = false;
        };
        // HACK: This is the best current way of figuring out whether to draw these decorations
        // or not. Needs context from the editor, to know whether it is a diff editor, in place editor
        // etc.
        DirtyDiffWorkbenchController.prototype.onEditorsChanged = function () {
            var _this = this;
            var models = this.editorService.getVisibleEditors()
                .map(function (e) { return e.getControl(); })
                .filter(function (c) { return c instanceof codeEditor_1.CodeEditor; })
                .map(function (editor) {
                var codeEditor = editor;
                var controller = DirtyDiffController.get(codeEditor);
                controller.modelRegistry = _this;
                return codeEditor.getModel();
            })
                .filter(function (m, i, a) { return !!m && !!m.uri && a.indexOf(m, i + 1) === -1; });
            var newModels = models.filter(function (o) { return _this.models.every(function (m) { return o !== m; }); });
            var oldModels = this.models.filter(function (m) { return models.every(function (o) { return o !== m; }); });
            oldModels.forEach(function (m) { return _this.onModelInvisible(m); });
            newModels.forEach(function (m) { return _this.onModelVisible(m); });
            this.models = models;
        };
        DirtyDiffWorkbenchController.prototype.onModelVisible = function (editorModel) {
            var model = this.instantiationService.createInstance(DirtyDiffModel, editorModel);
            var decorator = new DirtyDiffDecorator(editorModel, model, this.configurationService);
            this.items[editorModel.id] = new DirtyDiffItem(model, decorator);
        };
        DirtyDiffWorkbenchController.prototype.onModelInvisible = function (editorModel) {
            this.items[editorModel.id].dispose();
            delete this.items[editorModel.id];
        };
        DirtyDiffWorkbenchController.prototype.getModel = function (editorModel) {
            var item = this.items[editorModel.id];
            if (!item) {
                return null;
            }
            return item.model;
        };
        DirtyDiffWorkbenchController.prototype.dispose = function () {
            this.disable();
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        DirtyDiffWorkbenchController = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, groupService_1.IEditorGroupService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, configuration_1.IConfigurationService)
        ], DirtyDiffWorkbenchController);
        return DirtyDiffWorkbenchController;
    }());
    exports.DirtyDiffWorkbenchController = DirtyDiffWorkbenchController;
    editorExtensions_1.registerEditorContribution(DirtyDiffController);
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var editorGutterModifiedBackgroundColor = theme.getColor(exports.editorGutterModifiedBackground);
        if (editorGutterModifiedBackgroundColor) {
            collector.addRule("\n\t\t\t.monaco-editor .dirty-diff-modified {\n\t\t\t\tborder-left: 3px solid " + editorGutterModifiedBackgroundColor + ";\n\t\t\t}\n\t\t\t.monaco-editor .dirty-diff-modified:before {\n\t\t\t\tbackground: " + editorGutterModifiedBackgroundColor + ";\n\t\t\t}\n\t\t");
        }
        var editorGutterAddedBackgroundColor = theme.getColor(exports.editorGutterAddedBackground);
        if (editorGutterAddedBackgroundColor) {
            collector.addRule("\n\t\t\t.monaco-editor .dirty-diff-added {\n\t\t\t\tborder-left: 3px solid " + editorGutterAddedBackgroundColor + ";\n\t\t\t}\n\t\t\t.monaco-editor .dirty-diff-added:before {\n\t\t\t\tbackground: " + editorGutterAddedBackgroundColor + ";\n\t\t\t}\n\t\t");
        }
        var editorGutteDeletedBackgroundColor = theme.getColor(exports.editorGutterDeletedBackground);
        if (editorGutteDeletedBackgroundColor) {
            collector.addRule("\n\t\t\t.monaco-editor .dirty-diff-deleted:after {\n\t\t\t\tborder-left: 4px solid " + editorGutteDeletedBackgroundColor + ";\n\t\t\t}\n\t\t\t.monaco-editor .dirty-diff-deleted:before {\n\t\t\t\tbackground: " + editorGutteDeletedBackgroundColor + ";\n\t\t\t}\n\t\t");
        }
    });
});
