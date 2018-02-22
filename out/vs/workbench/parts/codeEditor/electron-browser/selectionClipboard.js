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
define(["require", "exports", "electron", "vs/base/common/platform", "vs/editor/browser/editorBrowser", "vs/base/common/lifecycle", "vs/editor/common/model", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/base/common/async", "vs/editor/common/core/range"], function (require, exports, electron_1, platform, editorBrowser_1, lifecycle_1, model_1, editorExtensions_1, contextkey_1, async_1, range_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SelectionClipboard = /** @class */ (function (_super) {
        __extends(SelectionClipboard, _super);
        function SelectionClipboard(editor, contextKeyService) {
            var _this = _super.call(this) || this;
            if (platform.isLinux) {
                var isEnabled_1 = editor.getConfiguration().contribInfo.selectionClipboard;
                _this._register(editor.onDidChangeConfiguration(function (e) {
                    if (e.contribInfo) {
                        isEnabled_1 = editor.getConfiguration().contribInfo.selectionClipboard;
                    }
                }));
                _this._register(editor.onMouseDown(function (e) {
                    if (!isEnabled_1) {
                        return;
                    }
                    if (!editor.getModel()) {
                        return;
                    }
                    if (e.event.middleButton) {
                        e.event.preventDefault();
                        editor.focus();
                        if (e.target.position) {
                            editor.setPosition(e.target.position);
                        }
                        if (e.target.type === editorBrowser_1.MouseTargetType.SCROLLBAR) {
                            return;
                        }
                        process.nextTick(function () {
                            // TODO@Alex: electron weirdness: calling clipboard.readText('selection') generates a paste event, so no need to execute paste ourselves
                            electron_1.clipboard.readText('selection');
                            // keybindingService.executeCommand(Handler.Paste, {
                            // 	text: clipboard.readText('selection'),
                            // 	pasteOnNewLine: false
                            // });
                        });
                    }
                }));
                var setSelectionToClipboard_1 = _this._register(new async_1.RunOnceScheduler(function () {
                    var model = editor.getModel();
                    if (!model) {
                        return;
                    }
                    var selections = editor.getSelections();
                    selections = selections.slice(0);
                    selections.sort(range_1.Range.compareRangesUsingStarts);
                    var result = [];
                    for (var i = 0; i < selections.length; i++) {
                        var sel = selections[i];
                        if (sel.isEmpty()) {
                            // Only write if all cursors have selection
                            return;
                        }
                        result.push(model.getValueInRange(sel, model_1.EndOfLinePreference.TextDefined));
                    }
                    var textToCopy = result.join(model.getEOL());
                    electron_1.clipboard.writeText(textToCopy, 'selection');
                }, 100));
                _this._register(editor.onDidChangeCursorSelection(function (e) {
                    if (!isEnabled_1) {
                        return;
                    }
                    setSelectionToClipboard_1.schedule();
                }));
            }
            return _this;
        }
        SelectionClipboard.prototype.getId = function () {
            return SelectionClipboard.ID;
        };
        SelectionClipboard.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        SelectionClipboard.ID = 'editor.contrib.selectionClipboard';
        SelectionClipboard = __decorate([
            __param(1, contextkey_1.IContextKeyService)
        ], SelectionClipboard);
        return SelectionClipboard;
    }(lifecycle_1.Disposable));
    exports.SelectionClipboard = SelectionClipboard;
    editorExtensions_1.registerEditorContribution(SelectionClipboard);
});
