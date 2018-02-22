/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/browser/builder", "vs/base/browser/dom", "vs/base/browser/browser", "vs/base/common/errorMessage", "vs/base/browser/ui/aria/aria", "vs/base/common/types", "vs/base/common/event", "vs/base/common/actions", "vs/base/browser/htmlContentRenderer", "vs/base/browser/keyboardEvent", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/common/lifecycle", "vs/base/common/color", "vs/css!./media/messageList"], function (require, exports, nls, winjs_base_1, builder_1, DOM, browser, errorMessage_1, aria, types, event_1, actions_1, htmlRenderer, keyboardEvent_1, theme_1, themeService_1, colorRegistry_1, lifecycle_1, color_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Severity;
    (function (Severity) {
        Severity[Severity["Info"] = 0] = "Info";
        Severity[Severity["Warning"] = 1] = "Warning";
        Severity[Severity["Error"] = 2] = "Error";
    })(Severity = exports.Severity || (exports.Severity = {}));
    var IMessageListOptions = /** @class */ (function () {
        function IMessageListOptions() {
        }
        return IMessageListOptions;
    }());
    exports.IMessageListOptions = IMessageListOptions;
    var DEFAULT_MESSAGE_LIST_OPTIONS = {
        purgeInterval: 10000,
        maxMessages: 5,
        maxMessageLength: 500
    };
    var MessageList = /** @class */ (function () {
        function MessageList(container, telemetryService, options) {
            if (options === void 0) { options = DEFAULT_MESSAGE_LIST_OPTIONS; }
            this.telemetryService = telemetryService;
            this.background = color_1.Color.fromHex('#333333');
            this.foreground = color_1.Color.fromHex('#EEEEEE');
            this.widgetShadow = color_1.Color.fromHex('#000000');
            this.buttonBackground = color_1.Color.fromHex('#0E639C');
            this.buttonForeground = this.foreground;
            this.infoBackground = color_1.Color.fromHex('#007ACC');
            this.infoForeground = this.foreground;
            this.warningBackground = color_1.Color.fromHex('#B89500');
            this.warningForeground = this.foreground;
            this.errorBackground = color_1.Color.fromHex('#BE1100');
            this.errorForeground = this.foreground;
            this.toDispose = [];
            this.messages = [];
            this.messageListPurger = null;
            this.container = container;
            this.options = options;
            this._onMessagesShowing = new event_1.Emitter();
            this._onMessagesCleared = new event_1.Emitter();
            this.registerListeners();
        }
        MessageList.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(browser.onDidChangeFullscreen(function () { return _this.positionMessageList(); }));
            this.toDispose.push(browser.onDidChangeZoomLevel(function () { return _this.positionMessageList(); }));
            this.toDispose.push(themeService_1.registerThemingParticipant(function (theme, collector) {
                _this.background = theme.getColor(theme_1.NOTIFICATIONS_BACKGROUND);
                _this.foreground = theme.getColor(theme_1.NOTIFICATIONS_FOREGROUND);
                _this.widgetShadow = theme.getColor(colorRegistry_1.widgetShadow);
                _this.outlineBorder = theme.getColor(colorRegistry_1.contrastBorder);
                _this.buttonBackground = theme.getColor(theme_1.NOTIFICATIONS_BUTTON_BACKGROUND);
                _this.buttonForeground = theme.getColor(theme_1.NOTIFICATIONS_BUTTON_FOREGROUND);
                _this.infoBackground = theme.getColor(theme_1.NOTIFICATIONS_INFO_BACKGROUND);
                _this.infoForeground = theme.getColor(theme_1.NOTIFICATIONS_INFO_FOREGROUND);
                _this.warningBackground = theme.getColor(theme_1.NOTIFICATIONS_WARNING_BACKGROUND);
                _this.warningForeground = theme.getColor(theme_1.NOTIFICATIONS_WARNING_FOREGROUND);
                _this.errorBackground = theme.getColor(theme_1.NOTIFICATIONS_ERROR_BACKGROUND);
                _this.errorForeground = theme.getColor(theme_1.NOTIFICATIONS_ERROR_FOREGROUND);
                var buttonHoverBackgroundColor = theme.getColor(theme_1.NOTIFICATIONS_BUTTON_HOVER_BACKGROUND);
                if (buttonHoverBackgroundColor) {
                    collector.addRule(".global-message-list li.message-list-entry .actions-container .message-action .action-button:hover { background-color: " + buttonHoverBackgroundColor + " !important; }");
                }
                _this.updateStyles();
            }));
        };
        Object.defineProperty(MessageList.prototype, "onMessagesShowing", {
            get: function () {
                return this._onMessagesShowing.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MessageList.prototype, "onMessagesCleared", {
            get: function () {
                return this._onMessagesCleared.event;
            },
            enumerable: true,
            configurable: true
        });
        MessageList.prototype.updateStyles = function () {
            if (this.messageListContainer) {
                this.messageListContainer.style('background-color', this.background ? this.background.toString() : null);
                this.messageListContainer.style('color', this.foreground ? this.foreground.toString() : null);
                this.messageListContainer.style('outline-color', this.outlineBorder ? this.outlineBorder.toString() : null);
                this.messageListContainer.style('box-shadow', this.widgetShadow ? "0 5px 8px " + this.widgetShadow : null);
            }
        };
        MessageList.prototype.showMessage = function (severity, message, onHide) {
            var _this = this;
            if (Array.isArray(message)) {
                var closeFns_1 = [];
                message.forEach(function (msg) { return closeFns_1.push(_this.showMessage(severity, msg, onHide)); });
                return function () { return closeFns_1.forEach(function (fn) { return fn(); }); };
            }
            // Return only if we are unable to extract a message text
            var messageText = this.getMessageText(message);
            if (!messageText || typeof messageText !== 'string') {
                return function () { };
            }
            // Show message
            return this.doShowMessage(message, messageText, severity, onHide);
        };
        MessageList.prototype.getMessageText = function (message) {
            if (types.isString(message)) {
                return message;
            }
            if (message instanceof Error) {
                return errorMessage_1.toErrorMessage(message, false);
            }
            if (message && message.message) {
                return message.message;
            }
            return null;
        };
        MessageList.prototype.doShowMessage = function (id, message, severity, onHide) {
            var _this = this;
            var actions = id.actions;
            var source = id.source || 'vscode';
            // Telemetry (TODO@Ben remove me later)
            /* __GDPR__
                "showMessage" : {
                    "message" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "source" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "buttons" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('showMessage', { message: message, source: source, buttons: actions ? actions.map(function (a) { return a.label; }) : void 0 });
            // Trigger Auto-Purge of messages to keep list small
            this.purgeMessages();
            // Store in Memory (new messages come first so that they show up on top)
            this.messages.unshift({
                id: id,
                text: message,
                severity: severity,
                time: Date.now(),
                actions: actions,
                source: source,
                onHide: onHide
            });
            // Render
            this.renderMessages(true, 1);
            // Support in Screen Readers too
            var alertText;
            if (severity === Severity.Error) {
                alertText = nls.localize('alertErrorMessage', "Error: {0}", message);
            }
            else if (severity === Severity.Warning) {
                alertText = nls.localize('alertWarningMessage', "Warning: {0}", message);
            }
            else {
                alertText = nls.localize('alertInfoMessage', "Info: {0}", message);
            }
            aria.alert(alertText);
            return function () { return _this.hideMessage(id); };
        };
        MessageList.prototype.renderMessages = function (animate, delta) {
            var _this = this;
            var container = builder_1.$(this.container);
            // Lazily create, otherwise clear old
            if (!this.messageListContainer) {
                this.messageListContainer = builder_1.$('.global-message-list').appendTo(container);
            }
            else {
                builder_1.$(this.messageListContainer).empty();
                builder_1.$(this.messageListContainer).removeClass('transition');
            }
            // Support animation for messages by moving the container out of view and then in
            if (animate) {
                builder_1.$(this.messageListContainer).style('top', '-35px');
            }
            // Render Messages as List Items
            builder_1.$(this.messageListContainer).ul({ 'class': 'message-list' }, function (ul) {
                var messages = _this.prepareMessages();
                if (messages.length > 0) {
                    _this._onMessagesShowing.fire();
                }
                else {
                    _this._onMessagesCleared.fire();
                }
                messages.forEach(function (message, index) {
                    _this.renderMessage(message, builder_1.$(ul), messages.length, delta);
                });
                // Support animation for messages by moving the container out of view and then in
                if (animate) {
                    setTimeout(function () {
                        _this.positionMessageList();
                        builder_1.$(_this.messageListContainer).addClass('transition');
                    }, 50 /* Need this delay to reliably get the animation on some browsers */);
                }
            });
            // Styles
            this.updateStyles();
        };
        MessageList.prototype.positionMessageList = function (animate) {
            if (!this.messageListContainer) {
                return; // not yet created
            }
            builder_1.$(this.messageListContainer).removeClass('transition'); // disable any animations
            var position = 0;
            if (!browser.isFullscreen() && DOM.hasClass(this.container, 'titlebar-style-custom')) {
                position = 22 / browser.getZoomFactor(); // adjust the position based on title bar size and zoom factor
            }
            builder_1.$(this.messageListContainer).style('top', position + "px");
        };
        MessageList.prototype.renderMessage = function (message, container, total, delta) {
            var _this = this;
            container.li({ class: 'message-list-entry message-list-entry-with-action' }, function (li) {
                // Actions (if none provided, add one default action to hide message)
                var messageActions = _this.getMessageActions(message);
                li.div({ class: 'actions-container' }, function (actionContainer) {
                    var _loop_1 = function (i) {
                        var action = messageActions[i];
                        actionContainer.div({ class: 'message-action' }, function (div) {
                            div.a({ class: 'action-button', tabindex: '0', role: 'button' })
                                .style('border-color', _this.outlineBorder ? _this.outlineBorder.toString() : null)
                                .style('background-color', _this.buttonBackground ? _this.buttonBackground.toString() : null)
                                .style('color', _this.buttonForeground ? _this.buttonForeground.toString() : null)
                                .text(action.label)
                                .on([DOM.EventType.CLICK, DOM.EventType.KEY_DOWN], function (e) {
                                if (e instanceof KeyboardEvent) {
                                    var event_2 = new keyboardEvent_1.StandardKeyboardEvent(e);
                                    if (!event_2.equals(3 /* Enter */) && !event_2.equals(10 /* Space */)) {
                                        return; // Only handle Enter/Escape for keyboard access
                                    }
                                }
                                DOM.EventHelper.stop(e, true);
                                /* __GDPR__
                                    "workbenchActionExecuted" : {
                                        "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                        "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                    }
                                */
                                _this.telemetryService.publicLog('workbenchActionExecuted', { id: action.id, from: 'message' });
                                (action.run() || winjs_base_1.TPromise.as(null))
                                    .then(null, function (error) { return _this.showMessage(Severity.Error, error); })
                                    .done(function (r) {
                                    if (typeof r === 'boolean' && r === false) {
                                        return;
                                    }
                                    _this.hideMessage(message.text); // hide all matching the text since there may be duplicates
                                });
                            });
                        });
                    };
                    for (var i = 0; i < messageActions.length; i++) {
                        _loop_1(i);
                    }
                });
                // Text
                var text = message.text.substr(0, _this.options.maxMessageLength);
                li.div({ class: 'message-left-side' }, function (div) {
                    div.addClass('message-overflow-ellipsis');
                    // Severity indicator
                    var sev = message.severity;
                    var label = (sev === Severity.Error) ? nls.localize('error', "Error") : (sev === Severity.Warning) ? nls.localize('warning', "Warn") : nls.localize('info', "Info");
                    var color = (sev === Severity.Error) ? _this.errorBackground : (sev === Severity.Warning) ? _this.warningBackground : _this.infoBackground;
                    var foregroundColor = (sev === Severity.Error) ? _this.errorForeground : (sev === Severity.Warning) ? _this.warningForeground : _this.infoForeground;
                    var sevLabel = builder_1.$().span({ class: "message-left-side severity " + (sev === Severity.Error ? 'app-error' : sev === Severity.Warning ? 'app-warning' : 'app-info'), text: label });
                    sevLabel.style('border-color', _this.outlineBorder ? _this.outlineBorder.toString() : null);
                    sevLabel.style('background-color', color ? color.toString() : null);
                    sevLabel.style('color', foregroundColor ? foregroundColor.toString() : null);
                    sevLabel.appendTo(div);
                    // Error message
                    var messageContentElement = htmlRenderer.renderFormattedText(text, {
                        inline: true,
                        className: 'message-left-side',
                    });
                    // Hover title
                    var title = message.source ? "[" + message.source + "] " + messageContentElement.textContent : messageContentElement.textContent;
                    sevLabel.title(title);
                    builder_1.$(messageContentElement).title(title).appendTo(div);
                });
            });
        };
        MessageList.prototype.getMessageActions = function (message) {
            var _this = this;
            var messageActions;
            if (message.actions && message.actions.length > 0) {
                messageActions = message.actions;
            }
            else {
                messageActions = [
                    new actions_1.Action('close.message.action', nls.localize('close', "Close"), null, true, function () {
                        _this.hideMessage(message.text); // hide all matching the text since there may be duplicates
                        return winjs_base_1.TPromise.as(true);
                    })
                ];
            }
            return messageActions;
        };
        MessageList.prototype.prepareMessages = function () {
            // Aggregate Messages by text to reduce their count
            var messages = [];
            var handledMessages = {};
            var offset = 0;
            for (var i = 0; i < this.messages.length; i++) {
                var message = this.messages[i];
                if (types.isUndefinedOrNull(handledMessages[message.text])) {
                    message.count = 1;
                    messages.push(message);
                    handledMessages[message.text] = offset++;
                }
                else {
                    messages[handledMessages[message.text]].count++;
                }
            }
            if (messages.length > this.options.maxMessages) {
                return messages.splice(messages.length - this.options.maxMessages, messages.length);
            }
            return messages;
        };
        MessageList.prototype.disposeMessages = function (messages) {
            messages.forEach(function (message) {
                if (message.onHide) {
                    message.onHide();
                }
                if (message.actions) {
                    message.actions.forEach(function (action) {
                        action.dispose();
                    });
                }
            });
        };
        MessageList.prototype.hideMessages = function () {
            this.hideMessage();
        };
        MessageList.prototype.show = function () {
            if (this.messageListContainer && this.messageListContainer.isHidden()) {
                this.messageListContainer.show();
            }
        };
        MessageList.prototype.hide = function () {
            if (this.messageListContainer && !this.messageListContainer.isHidden()) {
                this.messageListContainer.hide();
            }
        };
        MessageList.prototype.hideMessage = function (messageObj) {
            var messageFound = false;
            for (var i = 0; i < this.messages.length; i++) {
                var message = this.messages[i];
                var hide = false;
                // Hide specific message
                if (messageObj) {
                    hide = ((types.isString(messageObj) && message.text === messageObj) || message.id === messageObj);
                }
                else {
                    hide = true;
                }
                if (hide) {
                    this.disposeMessages(this.messages.splice(i, 1));
                    i--;
                    messageFound = true;
                }
            }
            if (messageFound) {
                this.renderMessages(false, -1);
            }
        };
        MessageList.prototype.purgeMessages = function () {
            var _this = this;
            // Cancel previous
            if (this.messageListPurger) {
                this.messageListPurger.cancel();
            }
            // Configure
            this.messageListPurger = winjs_base_1.TPromise.timeout(this.options.purgeInterval).then(function () {
                var needsUpdate = false;
                var counter = 0;
                for (var i = 0; i < _this.messages.length; i++) {
                    var message = _this.messages[i];
                    // Only purge infos and warnings and only if they are not providing actions
                    if (message.severity !== Severity.Error && !message.actions) {
                        _this.disposeMessages(_this.messages.splice(i, 1));
                        counter--;
                        i--;
                        needsUpdate = true;
                    }
                }
                if (needsUpdate) {
                    _this.renderMessages(false, counter);
                }
            });
        };
        MessageList.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        return MessageList;
    }());
    exports.MessageList = MessageList;
});
