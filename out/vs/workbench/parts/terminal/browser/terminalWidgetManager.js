/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TerminalWidgetManager = /** @class */ (function () {
        function TerminalWidgetManager(terminalWrapper) {
            this._messageListeners = [];
            this._container = document.createElement('div');
            this._container.classList.add('terminal-widget-overlay');
            terminalWrapper.appendChild(this._container);
            this._initTerminalHeightWatcher(terminalWrapper);
        }
        TerminalWidgetManager.prototype._initTerminalHeightWatcher = function (terminalWrapper) {
            var _this = this;
            // Watch the xterm.js viewport for style changes and do a layout if it changes
            this._xtermViewport = terminalWrapper.querySelector('.xterm-viewport');
            var mutationObserver = new MutationObserver(function () { return _this._refreshHeight(); });
            mutationObserver.observe(this._xtermViewport, { attributes: true, attributeFilter: ['style'] });
        };
        TerminalWidgetManager.prototype.showMessage = function (left, top, text) {
            lifecycle_1.dispose(this._messageWidget);
            this._messageListeners = lifecycle_1.dispose(this._messageListeners);
            this._messageWidget = new MessageWidget(this._container, left, top, text);
        };
        TerminalWidgetManager.prototype.closeMessage = function () {
            this._messageListeners = lifecycle_1.dispose(this._messageListeners);
            if (this._messageWidget) {
                this._messageListeners.push(MessageWidget.fadeOut(this._messageWidget));
            }
        };
        TerminalWidgetManager.prototype._refreshHeight = function () {
            this._container.style.height = this._xtermViewport.style.height;
        };
        return TerminalWidgetManager;
    }());
    exports.TerminalWidgetManager = TerminalWidgetManager;
    var MessageWidget = /** @class */ (function () {
        function MessageWidget(_container, _left, _top, _text) {
            this._container = _container;
            this._left = _left;
            this._top = _top;
            this._text = _text;
            this._domNode = document.createElement('div');
            this._domNode.style.position = 'absolute';
            this._domNode.style.left = _left + "px";
            this._domNode.style.bottom = _container.offsetHeight - _top + "px";
            this._domNode.classList.add('terminal-message-widget', 'fadeIn');
            this._domNode.textContent = _text;
            this._container.appendChild(this._domNode);
        }
        Object.defineProperty(MessageWidget.prototype, "left", {
            get: function () { return this._left; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MessageWidget.prototype, "top", {
            get: function () { return this._top; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MessageWidget.prototype, "text", {
            get: function () { return this._text; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MessageWidget.prototype, "domNode", {
            get: function () { return this._domNode; },
            enumerable: true,
            configurable: true
        });
        MessageWidget.fadeOut = function (messageWidget) {
            var handle;
            var dispose = function () {
                messageWidget.dispose();
                clearTimeout(handle);
                messageWidget.domNode.removeEventListener('animationend', dispose);
            };
            handle = setTimeout(dispose, 110);
            messageWidget.domNode.addEventListener('animationend', dispose);
            messageWidget.domNode.classList.add('fadeOut');
            return { dispose: dispose };
        };
        MessageWidget.prototype.dispose = function () {
            if (this.domNode.parentElement === this._container) {
                this._container.removeChild(this.domNode);
            }
        };
        return MessageWidget;
    }());
});
