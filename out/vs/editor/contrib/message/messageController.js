/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/browser/ui/aria/aria", "vs/editor/common/core/range", "vs/editor/common/editorCommon", "vs/editor/browser/editorExtensions", "vs/editor/browser/editorBrowser", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/platform/keybinding/common/keybindingsRegistry", "vs/css!./messageController"], function (require, exports, async_1, lifecycle_1, aria_1, range_1, editorCommon, editorExtensions_1, editorBrowser_1, contextkey_1, themeService_1, colorRegistry_1, keybindingsRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MessageController = /** @class */ (function () {
        function MessageController(editor, contextKeyService) {
            this._messageListeners = [];
            this._editor = editor;
            this._visible = MessageController.CONTEXT_SNIPPET_MODE.bindTo(contextKeyService);
        }
        MessageController.get = function (editor) {
            return editor.getContribution(MessageController._id);
        };
        MessageController.prototype.getId = function () {
            return MessageController._id;
        };
        MessageController.prototype.dispose = function () {
            this._visible.reset();
        };
        MessageController.prototype.isVisible = function () {
            return this._visible.get();
        };
        MessageController.prototype.showMessage = function (message, position) {
            var _this = this;
            aria_1.alert(message);
            this._visible.set(true);
            lifecycle_1.dispose(this._messageWidget);
            this._messageListeners = lifecycle_1.dispose(this._messageListeners);
            this._messageWidget = new MessageWidget(this._editor, position, message);
            // close on blur, cursor, model change, dispose
            this._messageListeners.push(this._editor.onDidBlurEditorText(function () { return _this.closeMessage(); }));
            this._messageListeners.push(this._editor.onDidChangeCursorPosition(function () { return _this.closeMessage(); }));
            this._messageListeners.push(this._editor.onDidDispose(function () { return _this.closeMessage(); }));
            this._messageListeners.push(this._editor.onDidChangeModel(function () { return _this.closeMessage(); }));
            // close after 3s
            this._messageListeners.push(async_1.setDisposableTimeout(function () { return _this.closeMessage(); }, 3000));
            // close on mouse move
            var bounds;
            this._messageListeners.push(this._editor.onMouseMove(function (e) {
                // outside the text area
                if (!e.target.position) {
                    return;
                }
                if (!bounds) {
                    // define bounding box around position and first mouse occurance
                    bounds = new range_1.Range(position.lineNumber - 3, 1, e.target.position.lineNumber + 3, 1);
                }
                else if (!bounds.containsPosition(e.target.position)) {
                    // check if position is still in bounds
                    _this.closeMessage();
                }
            }));
        };
        MessageController.prototype.closeMessage = function () {
            this._visible.reset();
            this._messageListeners = lifecycle_1.dispose(this._messageListeners);
            this._messageListeners.push(MessageWidget.fadeOut(this._messageWidget));
        };
        MessageController._id = 'editor.contrib.messageController';
        MessageController.CONTEXT_SNIPPET_MODE = new contextkey_1.RawContextKey('messageVisible', false);
        MessageController = __decorate([
            __param(1, contextkey_1.IContextKeyService)
        ], MessageController);
        return MessageController;
    }());
    exports.MessageController = MessageController;
    var MessageCommand = editorExtensions_1.EditorCommand.bindToContribution(MessageController.get);
    editorExtensions_1.registerEditorCommand(new MessageCommand({
        id: 'leaveEditorMessage',
        precondition: MessageController.CONTEXT_SNIPPET_MODE,
        handler: function (c) { return c.closeMessage(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(30),
            primary: 9 /* Escape */
        }
    }));
    var MessageWidget = /** @class */ (function () {
        function MessageWidget(editor, _a, text) {
            var lineNumber = _a.lineNumber, column = _a.column;
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.suppressMouseDown = false;
            this._editor = editor;
            this._editor.revealLinesInCenterIfOutsideViewport(lineNumber, lineNumber, 0 /* Smooth */);
            this._position = { lineNumber: lineNumber, column: column - 1 };
            this._domNode = document.createElement('div');
            this._domNode.classList.add('monaco-editor-overlaymessage');
            var message = document.createElement('div');
            message.classList.add('message');
            message.textContent = text;
            this._domNode.appendChild(message);
            var anchor = document.createElement('div');
            anchor.classList.add('anchor');
            this._domNode.appendChild(anchor);
            this._editor.addContentWidget(this);
            this._domNode.classList.add('fadeIn');
        }
        MessageWidget.fadeOut = function (messageWidget) {
            var handle;
            var dispose = function () {
                messageWidget.dispose();
                clearTimeout(handle);
                messageWidget.getDomNode().removeEventListener('animationend', dispose);
            };
            handle = setTimeout(dispose, 110);
            messageWidget.getDomNode().addEventListener('animationend', dispose);
            messageWidget.getDomNode().classList.add('fadeOut');
            return { dispose: dispose };
        };
        MessageWidget.prototype.dispose = function () {
            this._editor.removeContentWidget(this);
        };
        MessageWidget.prototype.getId = function () {
            return 'messageoverlay';
        };
        MessageWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        MessageWidget.prototype.getPosition = function () {
            return { position: this._position, preference: [editorBrowser_1.ContentWidgetPositionPreference.ABOVE] };
        };
        return MessageWidget;
    }());
    editorExtensions_1.registerEditorContribution(MessageController);
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var border = theme.getColor(colorRegistry_1.inputValidationInfoBorder);
        if (border) {
            var borderWidth = theme.type === themeService_1.HIGH_CONTRAST ? 2 : 1;
            collector.addRule(".monaco-editor .monaco-editor-overlaymessage .anchor { border-top-color: " + border + "; }");
            collector.addRule(".monaco-editor .monaco-editor-overlaymessage .message { border: " + borderWidth + "px solid " + border + "; }");
        }
        var background = theme.getColor(colorRegistry_1.inputValidationInfoBackground);
        if (background) {
            collector.addRule(".monaco-editor .monaco-editor-overlaymessage .message { background-color: " + background + "; }");
        }
    });
});
