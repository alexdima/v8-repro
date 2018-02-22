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
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/filters", "vs/base/common/winjs.base", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/base/parts/quickopen/common/quickOpen", "vs/platform/keybinding/common/keybinding", "vs/editor/common/editorContextKeys", "./editorQuickOpen", "vs/editor/browser/editorExtensions", "vs/base/browser/browser"], function (require, exports, nls, errors_1, filters_1, winjs_base_1, quickOpenModel_1, quickOpen_1, keybinding_1, editorContextKeys_1, editorQuickOpen_1, editorExtensions_1, browser) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var EditorActionCommandEntry = /** @class */ (function (_super) {
        __extends(EditorActionCommandEntry, _super);
        function EditorActionCommandEntry(key, highlights, action, editor) {
            var _this = _super.call(this) || this;
            _this.key = key;
            _this.setHighlights(highlights);
            _this.action = action;
            _this.editor = editor;
            return _this;
        }
        EditorActionCommandEntry.prototype.getLabel = function () {
            return this.action.label;
        };
        EditorActionCommandEntry.prototype.getAriaLabel = function () {
            return nls.localize('ariaLabelEntry', "{0}, commands", this.getLabel());
        };
        EditorActionCommandEntry.prototype.getGroupLabel = function () {
            return this.key;
        };
        EditorActionCommandEntry.prototype.run = function (mode, context) {
            var _this = this;
            if (mode === quickOpen_1.Mode.OPEN) {
                // Use a timeout to give the quick open widget a chance to close itself first
                winjs_base_1.TPromise.timeout(50).done(function () {
                    // Some actions are enabled only when editor has focus
                    _this.editor.focus();
                    try {
                        var promise = _this.action.run() || winjs_base_1.TPromise.as(null);
                        promise.done(null, errors_1.onUnexpectedError);
                    }
                    catch (error) {
                        errors_1.onUnexpectedError(error);
                    }
                }, errors_1.onUnexpectedError);
                return true;
            }
            return false;
        };
        return EditorActionCommandEntry;
    }(quickOpenModel_1.QuickOpenEntryGroup));
    exports.EditorActionCommandEntry = EditorActionCommandEntry;
    var QuickCommandAction = /** @class */ (function (_super) {
        __extends(QuickCommandAction, _super);
        function QuickCommandAction() {
            return _super.call(this, nls.localize('quickCommandActionInput', "Type the name of an action you want to execute"), {
                id: 'editor.action.quickCommand',
                label: nls.localize('QuickCommandAction.label', "Command Palette"),
                alias: 'Command Palette',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: (browser.isIE ? 512 /* Alt */ | 59 /* F1 */ : 59 /* F1 */)
                },
                menuOpts: {}
            }) || this;
        }
        QuickCommandAction.prototype.run = function (accessor, editor) {
            var _this = this;
            var keybindingService = accessor.get(keybinding_1.IKeybindingService);
            this._show(this.getController(editor), {
                getModel: function (value) {
                    return new quickOpenModel_1.QuickOpenModel(_this._editorActionsToEntries(keybindingService, editor, value));
                },
                getAutoFocus: function (searchValue) {
                    return {
                        autoFocusFirstEntry: true,
                        autoFocusPrefixMatch: searchValue
                    };
                }
            });
        };
        QuickCommandAction.prototype._sort = function (elementA, elementB) {
            var elementAName = elementA.getLabel().toLowerCase();
            var elementBName = elementB.getLabel().toLowerCase();
            return elementAName.localeCompare(elementBName);
        };
        QuickCommandAction.prototype._editorActionsToEntries = function (keybindingService, editor, searchValue) {
            var actions = editor.getSupportedActions();
            var entries = [];
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                var keybind = keybindingService.lookupKeybinding(action.id);
                if (action.label) {
                    var highlights = filters_1.matchesFuzzy(searchValue, action.label);
                    if (highlights) {
                        entries.push(new EditorActionCommandEntry(keybind ? keybind.getLabel() : '', highlights, action, editor));
                    }
                }
            }
            // Sort by name
            entries = entries.sort(this._sort);
            return entries;
        };
        return QuickCommandAction;
    }(editorQuickOpen_1.BaseEditorQuickOpenAction));
    exports.QuickCommandAction = QuickCommandAction;
    editorExtensions_1.registerEditorAction(QuickCommandAction);
});
