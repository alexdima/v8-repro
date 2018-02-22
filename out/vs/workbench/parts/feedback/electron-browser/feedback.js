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
define(["require", "exports", "vs/nls", "vs/base/browser/builder", "vs/base/browser/ui/dropdown/dropdown", "vs/platform/node/product", "vs/base/browser/dom", "vs/platform/commands/common/commands", "vs/base/common/errors", "vs/platform/integrity/common/integrity", "vs/platform/theme/common/themeService", "vs/platform/theme/common/styler", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/configuration/common/configuration", "../../../../platform/telemetry/common/telemetry", "vs/css!./media/feedback"], function (require, exports, nls, builder_1, dropdown_1, product_1, dom, commands_1, errors, integrity_1, themeService_1, styler_1, colorRegistry_1, configuration_1, telemetry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FEEDBACK_VISIBLE_CONFIG = 'workbench.statusBar.feedback.visible';
    var FormEvent;
    (function (FormEvent) {
        FormEvent[FormEvent["SENDING"] = 0] = "SENDING";
        FormEvent[FormEvent["SENT"] = 1] = "SENT";
        FormEvent[FormEvent["SEND_ERROR"] = 2] = "SEND_ERROR";
    })(FormEvent || (FormEvent = {}));
    var FeedbackDropdown = /** @class */ (function (_super) {
        __extends(FeedbackDropdown, _super);
        function FeedbackDropdown(container, options, commandService, telemetryService, integrityService, themeService, configurationService) {
            var _this = _super.call(this, container, {
                contextViewProvider: options.contextViewProvider,
                labelRenderer: function (container) {
                    builder_1.$(container).addClass('send-feedback', 'mask-icon');
                    return null;
                }
            }) || this;
            _this.commandService = commandService;
            _this.telemetryService = telemetryService;
            _this.integrityService = integrityService;
            _this.themeService = themeService;
            _this.configurationService = configurationService;
            _this._isPure = true;
            _this.integrityService.isPure().then(function (result) {
                if (!result.isPure) {
                    _this._isPure = false;
                }
            });
            _this.element.addClass('send-feedback');
            _this.element.title(nls.localize('sendFeedback', "Tweet Feedback"));
            _this.feedbackService = options.feedbackService;
            _this.feedback = '';
            _this.sentiment = 1;
            _this.maxFeedbackCharacters = _this.feedbackService.getCharacterLimit(_this.sentiment);
            _this.feedbackForm = null;
            _this.feedbackDescriptionInput = null;
            _this.smileyInput = null;
            _this.frownyInput = null;
            _this.sendButton = null;
            _this.requestFeatureLink = product_1.default.sendASmile.requestFeatureUrl;
            return _this;
        }
        FeedbackDropdown.prototype.renderContents = function (container) {
            var _this = this;
            var $form = builder_1.$('form.feedback-form').attr({
                action: 'javascript:void(0);',
                tabIndex: '-1'
            }).appendTo(container);
            builder_1.$(container).addClass('monaco-menu-container');
            this.feedbackForm = $form.getHTMLElement();
            builder_1.$('h2.title').text(nls.localize("label.sendASmile", "Tweet us your feedback.")).appendTo($form);
            this.invoke(builder_1.$('div.cancel').attr('tabindex', '0'), function () {
                _this.hide();
            }).appendTo($form);
            var $content = builder_1.$('div.content').appendTo($form);
            var $sentimentContainer = builder_1.$('div').appendTo($content);
            if (!this._isPure) {
                builder_1.$('span').text(nls.localize("patchedVersion1", "Your installation is corrupt.")).appendTo($sentimentContainer);
                builder_1.$('br').appendTo($sentimentContainer);
                builder_1.$('span').text(nls.localize("patchedVersion2", "Please specify this if you submit a bug.")).appendTo($sentimentContainer);
                builder_1.$('br').appendTo($sentimentContainer);
            }
            builder_1.$('span').text(nls.localize("sentiment", "How was your experience?")).appendTo($sentimentContainer);
            var $feedbackSentiment = builder_1.$('div.feedback-sentiment').appendTo($sentimentContainer);
            this.smileyInput = builder_1.$('div').addClass('sentiment smile').attr({
                'aria-checked': 'false',
                'aria-label': nls.localize('smileCaption', "Happy"),
                'tabindex': 0,
                'role': 'checkbox'
            });
            this.invoke(this.smileyInput, function () { _this.setSentiment(true); }).appendTo($feedbackSentiment);
            this.frownyInput = builder_1.$('div').addClass('sentiment frown').attr({
                'aria-checked': 'false',
                'aria-label': nls.localize('frownCaption', "Sad"),
                'tabindex': 0,
                'role': 'checkbox'
            });
            this.invoke(this.frownyInput, function () { _this.setSentiment(false); }).appendTo($feedbackSentiment);
            if (this.sentiment === 1) {
                this.smileyInput.addClass('checked').attr('aria-checked', 'true');
            }
            else {
                this.frownyInput.addClass('checked').attr('aria-checked', 'true');
            }
            var $contactUs = builder_1.$('div.contactus').appendTo($content);
            builder_1.$('span').text(nls.localize("other ways to contact us", "Other ways to contact us")).appendTo($contactUs);
            var $contactUsContainer = builder_1.$('div.channels').appendTo($contactUs);
            builder_1.$('div').append(builder_1.$('a').attr('target', '_blank').attr('href', '#').text(nls.localize("submit a bug", "Submit a bug")).attr('tabindex', '0'))
                .on('click', function (event) {
                dom.EventHelper.stop(event);
                var actionId = 'workbench.action.openIssueReporter';
                _this.commandService.executeCommand(actionId).done(null, errors.onUnexpectedError);
                /* __GDPR__
                    "workbenchActionExecuted" : {
                        "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                _this.telemetryService.publicLog('workbenchActionExecuted', { id: actionId, from: 'feedback' });
            })
                .appendTo($contactUsContainer);
            builder_1.$('div').append(builder_1.$('a').attr('target', '_blank').attr('href', this.requestFeatureLink).text(nls.localize("request a missing feature", "Request a missing feature")).attr('tabindex', '0'))
                .appendTo($contactUsContainer);
            this.remainingCharacterCount = builder_1.$('span.char-counter').text(this.getCharCountText(0));
            builder_1.$('h3').text(nls.localize("tell us why?", "Tell us why?"))
                .append(this.remainingCharacterCount)
                .appendTo($form);
            this.feedbackDescriptionInput = builder_1.$('textarea.feedback-description').attr({
                rows: 3,
                maxlength: this.maxFeedbackCharacters,
                'aria-label': nls.localize("commentsHeader", "Comments")
            })
                .text(this.feedback).attr('required', 'required')
                .on('keyup', function () {
                _this.updateCharCountText();
            })
                .appendTo($form).domFocus().getHTMLElement();
            var $buttons = builder_1.$('div.form-buttons').appendTo($form);
            var $hideButtonContainer = builder_1.$('div.hide-button-container').appendTo($buttons);
            this.hideButton = builder_1.$('input.hide-button').type('checkbox').attr('checked', '').id('hide-button').appendTo($hideButtonContainer).getHTMLElement();
            builder_1.$('label').attr('for', 'hide-button').text(nls.localize('showFeedback', "Show Feedback Smiley in Status Bar")).appendTo($hideButtonContainer);
            this.sendButton = this.invoke(builder_1.$('input.send').type('submit').attr('disabled', '').value(nls.localize('tweet', "Tweet")).appendTo($buttons), function () {
                if (_this.isSendingFeedback) {
                    return;
                }
                _this.onSubmit();
            });
            this.toDispose.push(styler_1.attachStylerCallback(this.themeService, { widgetShadow: colorRegistry_1.widgetShadow, editorWidgetBackground: colorRegistry_1.editorWidgetBackground, inputBackground: colorRegistry_1.inputBackground, inputForeground: colorRegistry_1.inputForeground, inputBorder: colorRegistry_1.inputBorder, editorBackground: colorRegistry_1.editorBackground, contrastBorder: colorRegistry_1.contrastBorder }, function (colors) {
                $form.style('background-color', colors.editorWidgetBackground);
                $form.style('box-shadow', colors.widgetShadow ? "0 2px 8px " + colors.widgetShadow : null);
                if (_this.feedbackDescriptionInput) {
                    _this.feedbackDescriptionInput.style.backgroundColor = colors.inputBackground;
                    _this.feedbackDescriptionInput.style.color = colors.inputForeground;
                    _this.feedbackDescriptionInput.style.border = "1px solid " + (colors.inputBorder || 'transparent');
                }
                $contactUs.style('background-color', colors.editorBackground);
                $contactUs.style('border', "1px solid " + (colors.contrastBorder || 'transparent'));
            }));
            return {
                dispose: function () {
                    _this.feedbackForm = null;
                    _this.feedbackDescriptionInput = null;
                    _this.smileyInput = null;
                    _this.frownyInput = null;
                }
            };
        };
        FeedbackDropdown.prototype.getCharCountText = function (charCount) {
            var remaining = this.maxFeedbackCharacters - charCount;
            var text = (remaining === 1)
                ? nls.localize("character left", "character left")
                : nls.localize("characters left", "characters left");
            return '(' + remaining + ' ' + text + ')';
        };
        FeedbackDropdown.prototype.updateCharCountText = function () {
            this.remainingCharacterCount.text(this.getCharCountText(this.feedbackDescriptionInput.value.length));
            this.feedbackDescriptionInput.value ? this.sendButton.removeAttribute('disabled') : this.sendButton.attr('disabled', '');
        };
        FeedbackDropdown.prototype.setSentiment = function (smile) {
            if (smile) {
                this.smileyInput.addClass('checked');
                this.smileyInput.attr('aria-checked', 'true');
                this.frownyInput.removeClass('checked');
                this.frownyInput.attr('aria-checked', 'false');
            }
            else {
                this.frownyInput.addClass('checked');
                this.frownyInput.attr('aria-checked', 'true');
                this.smileyInput.removeClass('checked');
                this.smileyInput.attr('aria-checked', 'false');
            }
            this.sentiment = smile ? 1 : 0;
            this.maxFeedbackCharacters = this.feedbackService.getCharacterLimit(this.sentiment);
            this.updateCharCountText();
            builder_1.$(this.feedbackDescriptionInput).attr({ maxlength: this.maxFeedbackCharacters });
        };
        FeedbackDropdown.prototype.invoke = function (element, callback) {
            element.on('click', callback);
            element.on('keypress', function (e) {
                if (e instanceof KeyboardEvent) {
                    var keyboardEvent = e;
                    if (keyboardEvent.keyCode === 13 || keyboardEvent.keyCode === 32) {
                        callback();
                    }
                }
            });
            return element;
        };
        FeedbackDropdown.prototype.hide = function () {
            if (this.feedbackDescriptionInput) {
                this.feedback = this.feedbackDescriptionInput.value;
            }
            if (this.autoHideTimeout) {
                clearTimeout(this.autoHideTimeout);
                this.autoHideTimeout = null;
            }
            if (this.hideButton && !this.hideButton.checked) {
                this.configurationService.updateValue(exports.FEEDBACK_VISIBLE_CONFIG, false).done(null, errors.onUnexpectedError);
            }
            _super.prototype.hide.call(this);
        };
        FeedbackDropdown.prototype.onEvent = function (e, activeElement) {
            if (e instanceof KeyboardEvent) {
                var keyboardEvent = e;
                if (keyboardEvent.keyCode === 27) {
                    this.hide();
                }
            }
        };
        FeedbackDropdown.prototype.onSubmit = function () {
            if ((this.feedbackForm.checkValidity && !this.feedbackForm.checkValidity())) {
                return;
            }
            this.changeFormStatus(FormEvent.SENDING);
            this.feedbackService.submitFeedback({
                feedback: this.feedbackDescriptionInput.value,
                sentiment: this.sentiment
            });
            this.changeFormStatus(FormEvent.SENT);
        };
        FeedbackDropdown.prototype.changeFormStatus = function (event) {
            var _this = this;
            switch (event) {
                case FormEvent.SENDING:
                    this.isSendingFeedback = true;
                    this.sendButton.setClass('send in-progress');
                    this.sendButton.value(nls.localize('feedbackSending', "Sending"));
                    break;
                case FormEvent.SENT:
                    this.isSendingFeedback = false;
                    this.sendButton.setClass('send success').value(nls.localize('feedbackSent', "Thanks"));
                    this.resetForm();
                    this.autoHideTimeout = setTimeout(function () {
                        _this.hide();
                    }, 1000);
                    this.sendButton.off(['click', 'keypress']);
                    this.invoke(this.sendButton, function () {
                        _this.hide();
                        _this.sendButton.off(['click', 'keypress']);
                    });
                    break;
                case FormEvent.SEND_ERROR:
                    this.isSendingFeedback = false;
                    this.sendButton.setClass('send error').value(nls.localize('feedbackSendingError', "Try again"));
                    break;
            }
        };
        FeedbackDropdown.prototype.resetForm = function () {
            if (this.feedbackDescriptionInput) {
                this.feedbackDescriptionInput.value = '';
            }
            this.sentiment = 1;
            this.maxFeedbackCharacters = this.feedbackService.getCharacterLimit(this.sentiment);
        };
        FeedbackDropdown = __decorate([
            __param(2, commands_1.ICommandService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, integrity_1.IIntegrityService),
            __param(5, themeService_1.IThemeService),
            __param(6, configuration_1.IWorkspaceConfigurationService)
        ], FeedbackDropdown);
        return FeedbackDropdown;
    }(dropdown_1.Dropdown));
    exports.FeedbackDropdown = FeedbackDropdown;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        // Sentiment Buttons
        var inputActiveOptionBorderColor = theme.getColor(colorRegistry_1.inputActiveOptionBorder);
        if (inputActiveOptionBorderColor) {
            collector.addRule(".monaco-shell .feedback-form .sentiment.checked { border: 1px solid " + inputActiveOptionBorderColor + "; }");
        }
        // Links
        var linkColor = theme.getColor(colorRegistry_1.buttonBackground) || theme.getColor(colorRegistry_1.contrastBorder);
        if (linkColor) {
            collector.addRule(".monaco-shell .feedback-form .content .channels a { color: " + linkColor + "; }");
        }
    });
});
