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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/parts/feedback/electron-browser/feedback", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/node/product", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "vs/base/browser/dom", "vs/base/browser/builder", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/actions"], function (require, exports, lifecycle_1, feedback_1, contextView_1, instantiation_1, product_1, theme_1, themeService_1, workspace_1, configuration_1, dom_1, builder_1, nls_1, winjs_base_1, actions_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TwitterFeedbackService = /** @class */ (function () {
        function TwitterFeedbackService() {
        }
        TwitterFeedbackService.prototype.combineHashTagsAsString = function () {
            return TwitterFeedbackService.HASHTAGS.join(',');
        };
        TwitterFeedbackService.prototype.submitFeedback = function (feedback) {
            var queryString = "?" + (feedback.sentiment === 1 ? "hashtags=" + this.combineHashTagsAsString() + "&" : null) + "ref_src=twsrc%5Etfw&related=twitterapi%2Ctwitter&text=" + encodeURIComponent(feedback.feedback) + "&tw_p=tweetbutton&via=" + TwitterFeedbackService.VIA_NAME;
            var url = TwitterFeedbackService.TWITTER_URL + queryString;
            window.open(url);
        };
        TwitterFeedbackService.prototype.getCharacterLimit = function (sentiment) {
            var length = 0;
            if (sentiment === 1) {
                TwitterFeedbackService.HASHTAGS.forEach(function (element) {
                    length += element.length + 2;
                });
            }
            if (TwitterFeedbackService.VIA_NAME) {
                length += (" via @" + TwitterFeedbackService.VIA_NAME).length;
            }
            return 280 - length;
        };
        TwitterFeedbackService.TWITTER_URL = 'https://twitter.com/intent/tweet';
        TwitterFeedbackService.VIA_NAME = 'code';
        TwitterFeedbackService.HASHTAGS = ['HappyCoding'];
        return TwitterFeedbackService;
    }());
    var FeedbackStatusbarItem = /** @class */ (function (_super) {
        __extends(FeedbackStatusbarItem, _super);
        function FeedbackStatusbarItem(instantiationService, contextViewService, contextService, contextMenuService, configurationService, themeService) {
            var _this = _super.call(this, themeService) || this;
            _this.instantiationService = instantiationService;
            _this.contextViewService = contextViewService;
            _this.contextService = contextService;
            _this.contextMenuService = contextMenuService;
            _this.configurationService = configurationService;
            _this.enabled = _this.configurationService.getValue(feedback_1.FEEDBACK_VISIBLE_CONFIG);
            _this.hideAction = _this.instantiationService.createInstance(HideAction);
            _this.toUnbind.push(_this.hideAction);
            _this.registerListeners();
            return _this;
        }
        FeedbackStatusbarItem.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.contextService.onDidChangeWorkbenchState(function () { return _this.updateStyles(); }));
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationUpdated(e); }));
        };
        FeedbackStatusbarItem.prototype.onConfigurationUpdated = function (event) {
            if (event.affectsConfiguration(feedback_1.FEEDBACK_VISIBLE_CONFIG)) {
                this.enabled = this.configurationService.getValue(feedback_1.FEEDBACK_VISIBLE_CONFIG);
                this.update();
            }
        };
        FeedbackStatusbarItem.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            if (this.dropdown) {
                this.dropdown.label.style('background-color', this.getColor(this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY ? theme_1.STATUS_BAR_FOREGROUND : theme_1.STATUS_BAR_NO_FOLDER_FOREGROUND));
            }
        };
        FeedbackStatusbarItem.prototype.render = function (element) {
            var _this = this;
            this.container = element;
            // Prevent showing dropdown on anything but left click
            builder_1.$(this.container).on('mousedown', function (e) {
                if (e.button !== 0) {
                    dom_1.EventHelper.stop(e, true);
                }
            }, this.toUnbind, true);
            // Offer context menu to hide status bar entry
            builder_1.$(this.container).on('contextmenu', function (e) {
                dom_1.EventHelper.stop(e, true);
                _this.contextMenuService.showContextMenu({
                    getAnchor: function () { return _this.container; },
                    getActions: function () { return winjs_base_1.TPromise.as([_this.hideAction]); }
                });
            }, this.toUnbind);
            return this.update();
        };
        FeedbackStatusbarItem.prototype.update = function () {
            var enabled = product_1.default.sendASmile && this.enabled;
            // Create
            if (enabled) {
                if (!this.dropdown) {
                    this.dropdown = this.instantiationService.createInstance(feedback_1.FeedbackDropdown, this.container, {
                        contextViewProvider: this.contextViewService,
                        feedbackService: this.instantiationService.createInstance(TwitterFeedbackService)
                    });
                    this.toUnbind.push(this.dropdown);
                    this.updateStyles();
                    return this.dropdown;
                }
            }
            else {
                lifecycle_1.dispose(this.dropdown);
                this.dropdown = void 0;
                dom_1.clearNode(this.container);
            }
            return null;
        };
        FeedbackStatusbarItem = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, contextView_1.IContextViewService),
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, configuration_1.IWorkspaceConfigurationService),
            __param(5, themeService_1.IThemeService)
        ], FeedbackStatusbarItem);
        return FeedbackStatusbarItem;
    }(theme_1.Themable));
    exports.FeedbackStatusbarItem = FeedbackStatusbarItem;
    var HideAction = /** @class */ (function (_super) {
        __extends(HideAction, _super);
        function HideAction(configurationService) {
            var _this = _super.call(this, 'feedback.hide', nls_1.localize('hide', "Hide")) || this;
            _this.configurationService = configurationService;
            return _this;
        }
        HideAction.prototype.run = function (extensionId) {
            return this.configurationService.updateValue(feedback_1.FEEDBACK_VISIBLE_CONFIG, false);
        };
        HideAction = __decorate([
            __param(0, configuration_1.IWorkspaceConfigurationService)
        ], HideAction);
        return HideAction;
    }(actions_1.Action));
});
