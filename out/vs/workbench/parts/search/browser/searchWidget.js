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
define(["require", "exports", "vs/nls", "vs/base/common/strings", "vs/base/browser/dom", "vs/base/common/winjs.base", "vs/base/browser/ui/widget", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/findinput/findInput", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/button/button", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/base/common/event", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/parts/search/browser/searchActions", "vs/base/common/history", "vs/workbench/parts/search/common/constants", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/editor/contrib/find/findModel", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration"], function (require, exports, nls, strings, dom, winjs_base_1, widget_1, actions_1, actionbar_1, findInput_1, inputBox_1, button_1, keybindingsRegistry_1, keybinding_1, contextkey_1, contextView_1, event_1, viewlet_1, searchActions_1, history_1, Constants, styler_1, themeService_1, theme_1, findModel_1, clipboardService_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ReplaceAllAction = /** @class */ (function (_super) {
        __extends(ReplaceAllAction, _super);
        function ReplaceAllAction() {
            var _this = _super.call(this, ReplaceAllAction.ID, '', 'action-replace-all', false) || this;
            _this._searchWidget = null;
            return _this;
        }
        Object.defineProperty(ReplaceAllAction, "INSTANCE", {
            get: function () {
                if (ReplaceAllAction.fgInstance === null) {
                    ReplaceAllAction.fgInstance = new ReplaceAllAction();
                }
                return ReplaceAllAction.fgInstance;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReplaceAllAction.prototype, "searchWidget", {
            set: function (searchWidget) {
                this._searchWidget = searchWidget;
            },
            enumerable: true,
            configurable: true
        });
        ReplaceAllAction.prototype.run = function () {
            if (this._searchWidget) {
                return this._searchWidget.triggerReplaceAll();
            }
            return winjs_base_1.TPromise.as(null);
        };
        ReplaceAllAction.fgInstance = null;
        ReplaceAllAction.ID = 'search.action.replaceAll';
        return ReplaceAllAction;
    }(actions_1.Action));
    var SearchWidget = /** @class */ (function (_super) {
        __extends(SearchWidget, _super);
        function SearchWidget(container, options, contextViewService, themeService, keyBindingService, keyBindingService2, clipboardServce, configurationService) {
            var _this = _super.call(this) || this;
            _this.contextViewService = contextViewService;
            _this.themeService = themeService;
            _this.keyBindingService = keyBindingService;
            _this.keyBindingService2 = keyBindingService2;
            _this.clipboardServce = clipboardServce;
            _this.configurationService = configurationService;
            _this.ignoreGlobalFindBufferOnNextFocus = false;
            _this._onSearchSubmit = _this._register(new event_1.Emitter());
            _this.onSearchSubmit = _this._onSearchSubmit.event;
            _this._onSearchCancel = _this._register(new event_1.Emitter());
            _this.onSearchCancel = _this._onSearchCancel.event;
            _this._onReplaceToggled = _this._register(new event_1.Emitter());
            _this.onReplaceToggled = _this._onReplaceToggled.event;
            _this._onReplaceStateChange = _this._register(new event_1.Emitter());
            _this.onReplaceStateChange = _this._onReplaceStateChange.event;
            _this._onReplaceValueChanged = _this._register(new event_1.Emitter());
            _this.onReplaceValueChanged = _this._onReplaceValueChanged.event;
            _this._onReplaceAll = _this._register(new event_1.Emitter());
            _this.onReplaceAll = _this._onReplaceAll.event;
            _this.searchHistory = new history_1.HistoryNavigator(options.history);
            _this.replaceActive = Constants.ReplaceActiveKey.bindTo(_this.keyBindingService);
            _this.searchInputBoxFocused = Constants.SearchInputBoxFocusedKey.bindTo(_this.keyBindingService);
            _this.replaceInputBoxFocused = Constants.ReplaceInputBoxFocusedKey.bindTo(_this.keyBindingService);
            _this.render(container, options);
            return _this;
        }
        SearchWidget.prototype.focus = function (select, focusReplace, suppressGlobalSearchBuffer) {
            if (select === void 0) { select = true; }
            if (focusReplace === void 0) { focusReplace = false; }
            if (suppressGlobalSearchBuffer === void 0) { suppressGlobalSearchBuffer = false; }
            this.ignoreGlobalFindBufferOnNextFocus = suppressGlobalSearchBuffer;
            if (focusReplace && this.isReplaceShown()) {
                this.replaceInput.focus();
                if (select) {
                    this.replaceInput.select();
                }
            }
            else {
                this.searchInput.focus();
                if (select) {
                    this.searchInput.select();
                }
            }
        };
        SearchWidget.prototype.setWidth = function (width) {
            this.searchInput.setWidth(width);
            this.replaceInput.width = width - 28;
        };
        SearchWidget.prototype.clear = function () {
            this.searchInput.clear();
            this.replaceInput.value = '';
            this.setReplaceAllActionState(false);
        };
        SearchWidget.prototype.isReplaceShown = function () {
            return !dom.hasClass(this.replaceContainer, 'disabled');
        };
        SearchWidget.prototype.getReplaceValue = function () {
            return this.replaceInput.value;
        };
        SearchWidget.prototype.toggleReplace = function (show) {
            if (show === void 0 || show !== this.isReplaceShown()) {
                this.onToggleReplaceButton();
            }
        };
        SearchWidget.prototype.getHistory = function () {
            return this.searchHistory.getHistory();
        };
        SearchWidget.prototype.showNextSearchTerm = function () {
            var next = this.searchHistory.next();
            if (next) {
                this.searchInput.setValue(next);
            }
        };
        SearchWidget.prototype.showPreviousSearchTerm = function () {
            var previous;
            if (this.searchInput.getValue().length === 0) {
                previous = this.searchHistory.current();
            }
            else {
                this.searchHistory.addIfNotPresent(this.searchInput.getValue());
                previous = this.searchHistory.previous();
            }
            if (previous) {
                this.searchInput.setValue(previous);
            }
        };
        SearchWidget.prototype.searchInputHasFocus = function () {
            return this.searchInputBoxFocused.get();
        };
        SearchWidget.prototype.replaceInputHasFocus = function () {
            return this.replaceInput.hasFocus();
        };
        SearchWidget.prototype.render = function (container, options) {
            this.domNode = container.div({ 'class': 'search-widget' }).style({ position: 'relative' }).getHTMLElement();
            this.renderToggleReplaceButton(this.domNode);
            this.renderSearchInput(this.domNode, options);
            this.renderReplaceInput(this.domNode);
        };
        SearchWidget.prototype.renderToggleReplaceButton = function (parent) {
            var _this = this;
            this.toggleReplaceButton = this._register(new button_1.Button(parent));
            styler_1.attachButtonStyler(this.toggleReplaceButton, this.themeService, {
                buttonBackground: theme_1.SIDE_BAR_BACKGROUND,
                buttonHoverBackground: theme_1.SIDE_BAR_BACKGROUND
            });
            this.toggleReplaceButton.icon = 'toggle-replace-button collapse';
            // TODO@joh need to dispose this listener eventually
            this.toggleReplaceButton.onDidClick(function () { return _this.onToggleReplaceButton(); });
            this.toggleReplaceButton.getElement().title = nls.localize('search.replace.toggle.button.title', "Toggle Replace");
        };
        SearchWidget.prototype.renderSearchInput = function (parent, options) {
            var _this = this;
            var inputOptions = {
                label: nls.localize('label.Search', 'Search: Type Search Term and press Enter to search or Escape to cancel'),
                validation: function (value) { return _this.validateSearchInput(value); },
                placeholder: nls.localize('search.placeHolder', "Search"),
                appendCaseSensitiveLabel: searchActions_1.appendKeyBindingLabel('', this.keyBindingService2.lookupKeybinding(Constants.ToggleCaseSensitiveCommandId), this.keyBindingService2),
                appendWholeWordsLabel: searchActions_1.appendKeyBindingLabel('', this.keyBindingService2.lookupKeybinding(Constants.ToggleWholeWordCommandId), this.keyBindingService2),
                appendRegexLabel: searchActions_1.appendKeyBindingLabel('', this.keyBindingService2.lookupKeybinding(Constants.ToggleRegexCommandId), this.keyBindingService2)
            };
            var searchInputContainer = dom.append(parent, dom.$('.search-container.input-box'));
            this.searchInput = this._register(new findInput_1.FindInput(searchInputContainer, this.contextViewService, inputOptions));
            this._register(styler_1.attachFindInputBoxStyler(this.searchInput, this.themeService));
            this.searchInput.onKeyUp(function (keyboardEvent) { return _this.onSearchInputKeyUp(keyboardEvent); });
            this.searchInput.setValue(options.value || '');
            this.searchInput.setRegex(!!options.isRegex);
            this.searchInput.setCaseSensitive(!!options.isCaseSensitive);
            this.searchInput.setWholeWords(!!options.isWholeWords);
            this._register(this.onSearchSubmit(function () {
                _this.searchHistory.add(_this.searchInput.getValue());
            }));
            this.searchInputFocusTracker = this._register(dom.trackFocus(this.searchInput.inputBox.inputElement));
            this._register(this.searchInputFocusTracker.onDidFocus(function () {
                _this.searchInputBoxFocused.set(true);
                var useGlobalFindBuffer = _this.configurationService.getValue('search').globalFindClipboard;
                if (!_this.ignoreGlobalFindBufferOnNextFocus && useGlobalFindBuffer) {
                    var globalBufferText = _this.clipboardServce.readFindText();
                    if (_this.previousGlobalFindBufferValue !== globalBufferText) {
                        _this.searchHistory.add(_this.searchInput.getValue());
                        _this.searchInput.setValue(globalBufferText);
                        _this.searchInput.select();
                    }
                    _this.previousGlobalFindBufferValue = globalBufferText;
                }
                _this.ignoreGlobalFindBufferOnNextFocus = false;
            }));
            this._register(this.searchInputFocusTracker.onDidBlur(function () { return _this.searchInputBoxFocused.set(false); }));
        };
        SearchWidget.prototype.renderReplaceInput = function (parent) {
            var _this = this;
            this.replaceContainer = dom.append(parent, dom.$('.replace-container.disabled'));
            var replaceBox = dom.append(this.replaceContainer, dom.$('.input-box'));
            this.replaceInput = this._register(new inputBox_1.InputBox(replaceBox, this.contextViewService, {
                ariaLabel: nls.localize('label.Replace', 'Replace: Type replace term and press Enter to preview or Escape to cancel'),
                placeholder: nls.localize('search.replace.placeHolder', "Replace")
            }));
            this._register(styler_1.attachInputBoxStyler(this.replaceInput, this.themeService));
            this.onkeyup(this.replaceInput.inputElement, function (keyboardEvent) { return _this.onReplaceInputKeyUp(keyboardEvent); });
            this.replaceInput.onDidChange(function () { return _this._onReplaceValueChanged.fire(); });
            this.searchInput.inputBox.onDidChange(function () { return _this.onSearchInputChanged(); });
            this.replaceAllAction = ReplaceAllAction.INSTANCE;
            this.replaceAllAction.searchWidget = this;
            this.replaceAllAction.label = SearchWidget.REPLACE_ALL_DISABLED_LABEL;
            this.replaceActionBar = this._register(new actionbar_1.ActionBar(this.replaceContainer));
            this.replaceActionBar.push([this.replaceAllAction], { icon: true, label: false });
            this.replaceInputFocusTracker = this._register(dom.trackFocus(this.replaceInput.inputElement));
            this._register(this.replaceInputFocusTracker.onDidFocus(function () { return _this.replaceInputBoxFocused.set(true); }));
            this._register(this.replaceInputFocusTracker.onDidBlur(function () { return _this.replaceInputBoxFocused.set(false); }));
        };
        SearchWidget.prototype.triggerReplaceAll = function () {
            this._onReplaceAll.fire();
            return winjs_base_1.TPromise.as(null);
        };
        SearchWidget.prototype.onToggleReplaceButton = function () {
            dom.toggleClass(this.replaceContainer, 'disabled');
            dom.toggleClass(this.toggleReplaceButton.getElement(), 'collapse');
            dom.toggleClass(this.toggleReplaceButton.getElement(), 'expand');
            this.updateReplaceActiveState();
            this._onReplaceToggled.fire();
        };
        SearchWidget.prototype.setReplaceAllActionState = function (enabled) {
            if (this.replaceAllAction.enabled !== enabled) {
                this.replaceAllAction.enabled = enabled;
                this.replaceAllAction.label = enabled ? SearchWidget.REPLACE_ALL_ENABLED_LABEL(this.keyBindingService2) : SearchWidget.REPLACE_ALL_DISABLED_LABEL;
                this.updateReplaceActiveState();
            }
        };
        SearchWidget.prototype.isReplaceActive = function () {
            return this.replaceActive.get();
        };
        SearchWidget.prototype.updateReplaceActiveState = function () {
            var currentState = this.isReplaceActive();
            var newState = this.isReplaceShown() && this.replaceAllAction.enabled;
            if (currentState !== newState) {
                this.replaceActive.set(newState);
                this._onReplaceStateChange.fire(newState);
            }
        };
        SearchWidget.prototype.validateSearchInput = function (value) {
            if (value.length === 0) {
                return null;
            }
            if (!this.searchInput.getRegex()) {
                return null;
            }
            var regExp;
            try {
                regExp = new RegExp(value);
            }
            catch (e) {
                return { content: e.message };
            }
            if (strings.regExpLeadsToEndlessLoop(regExp)) {
                return { content: nls.localize('regexp.validationFailure', "Expression matches everything") };
            }
            if (strings.regExpContainsBackreference(value)) {
                return { content: nls.localize('regexp.backreferenceValidationFailure', "Backreferences are not supported") };
            }
            return null;
        };
        SearchWidget.prototype.onSearchInputChanged = function () {
            this.setReplaceAllActionState(false);
        };
        SearchWidget.prototype.onSearchInputKeyUp = function (keyboardEvent) {
            switch (keyboardEvent.keyCode) {
                case 3 /* Enter */:
                    this.submitSearch();
                    return;
                case 9 /* Escape */:
                    this._onSearchCancel.fire();
                    return;
                default:
                    return;
            }
        };
        SearchWidget.prototype.onReplaceInputKeyUp = function (keyboardEvent) {
            switch (keyboardEvent.keyCode) {
                case 3 /* Enter */:
                    this.submitSearch();
                    return;
                default:
                    return;
            }
        };
        SearchWidget.prototype.submitSearch = function (refresh) {
            if (refresh === void 0) { refresh = true; }
            var value = this.searchInput.getValue();
            var useGlobalFindBuffer = this.configurationService.getValue('search').globalFindClipboard;
            if (value) {
                if (useGlobalFindBuffer) {
                    this.clipboardServce.writeFindText(value);
                }
                this._onSearchSubmit.fire(refresh);
            }
        };
        SearchWidget.prototype.dispose = function () {
            this.setReplaceAllActionState(false);
            this.replaceAllAction.searchWidget = null;
            this.replaceActionBar = null;
            _super.prototype.dispose.call(this);
        };
        SearchWidget.REPLACE_ALL_DISABLED_LABEL = nls.localize('search.action.replaceAll.disabled.label', "Replace All (Submit Search to Enable)");
        SearchWidget.REPLACE_ALL_ENABLED_LABEL = function (keyBindingService2) {
            var kb = keyBindingService2.lookupKeybinding(ReplaceAllAction.ID);
            return searchActions_1.appendKeyBindingLabel(nls.localize('search.action.replaceAll.enabled.label', "Replace All"), kb, keyBindingService2);
        };
        SearchWidget = __decorate([
            __param(2, contextView_1.IContextViewService),
            __param(3, themeService_1.IThemeService),
            __param(4, contextkey_1.IContextKeyService),
            __param(5, keybinding_1.IKeybindingService),
            __param(6, clipboardService_1.IClipboardService),
            __param(7, configuration_1.IConfigurationService)
        ], SearchWidget);
        return SearchWidget;
    }(widget_1.Widget));
    exports.SearchWidget = SearchWidget;
    function registerContributions() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: ReplaceAllAction.ID,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.ReplaceActiveKey, findModel_1.CONTEXT_FIND_WIDGET_NOT_VISIBLE),
            primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 3 /* Enter */,
            handler: function (accessor) {
                if (searchActions_1.isSearchViewletFocused(accessor.get(viewlet_1.IViewletService))) {
                    ReplaceAllAction.INSTANCE.run();
                }
            }
        });
    }
    exports.registerContributions = registerContributions;
});
