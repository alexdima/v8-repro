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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/browser/browser", "vs/base/browser/builder", "vs/base/common/strings", "vs/base/browser/dom", "vs/base/common/resources", "vs/base/common/idGenerator", "vs/base/common/types", "vs/base/common/actions", "vs/base/common/cancellation", "vs/base/parts/quickopen/common/quickOpen", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/base/parts/quickopen/browser/quickOpenWidget", "vs/workbench/browser/actions", "vs/base/common/labels", "vs/workbench/services/textfile/common/textfiles", "vs/platform/registry/common/platform", "vs/editor/common/services/modeService", "vs/workbench/browser/labels", "vs/editor/common/services/modelService", "vs/workbench/common/editor", "vs/workbench/common/component", "vs/base/common/event", "vs/workbench/services/part/common/partService", "vs/workbench/browser/quickopen", "vs/base/common/errors", "vs/workbench/services/editor/common/editorService", "vs/platform/quickOpen/common/quickOpen", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/platform/workspace/common/workspace", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/history/common/history", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/styler", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/base/parts/quickopen/common/quickOpenScorer", "vs/base/common/labels", "vs/platform/list/browser/listService", "vs/base/common/octicon", "vs/base/common/network", "vs/css!./media/quickopen"], function (require, exports, winjs_base_1, nls, browser, builder_1, strings, DOM, resources, idGenerator_1, types, actions_1, cancellation_1, quickOpen_1, quickOpenModel_1, quickOpenWidget_1, actions_2, labels, textfiles_1, platform_1, modeService_1, labels_1, modelService_1, editor_1, component_1, event_1, partService_1, quickopen_1, errors, editorService_1, quickOpen_2, configuration_1, instantiation_1, message_1, workspace_1, contextkey_1, history_1, themeService_1, theme_1, styler_1, environment_1, files_1, quickOpenScorer_1, labels_2, listService_1, octicon_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var HELP_PREFIX = '?';
    var QuickOpenController = /** @class */ (function (_super) {
        __extends(QuickOpenController, _super);
        function QuickOpenController(editorService, messageService, contextKeyService, configurationService, instantiationService, partService, environmentService, themeService) {
            var _this = _super.call(this, QuickOpenController.ID, themeService) || this;
            _this.editorService = editorService;
            _this.messageService = messageService;
            _this.contextKeyService = contextKeyService;
            _this.configurationService = configurationService;
            _this.instantiationService = instantiationService;
            _this.partService = partService;
            _this.environmentService = environmentService;
            _this.actionProvider = new actions_2.ContributableActionProvider();
            _this.mapResolvedHandlersToPrefix = {};
            _this.handlerOnOpenCalled = {};
            _this.mapContextKeyToContext = {};
            _this.promisesToCompleteOnHide = [];
            _this.editorHistoryHandler = _this.instantiationService.createInstance(EditorHistoryHandler);
            _this.inQuickOpenMode = new contextkey_1.RawContextKey('inQuickOpen', false).bindTo(contextKeyService);
            _this._onShow = new event_1.Emitter();
            _this._onHide = new event_1.Emitter();
            _this.updateConfiguration();
            _this.registerListeners();
            return _this;
        }
        QuickOpenController.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.updateConfiguration(); }));
            this.toUnbind.push(this.partService.onTitleBarVisibilityChange(function () { return _this.positionQuickOpenWidget(); }));
            this.toUnbind.push(browser.onDidChangeZoomLevel(function () { return _this.positionQuickOpenWidget(); }));
        };
        QuickOpenController.prototype.updateConfiguration = function () {
            if (this.environmentService.args['sticky-quickopen']) {
                this.closeOnFocusLost = false;
            }
            else {
                this.closeOnFocusLost = this.configurationService.getValue(quickopen_1.CLOSE_ON_FOCUS_LOST_CONFIG);
            }
        };
        Object.defineProperty(QuickOpenController.prototype, "onShow", {
            get: function () {
                return this._onShow.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QuickOpenController.prototype, "onHide", {
            get: function () {
                return this._onHide.event;
            },
            enumerable: true,
            configurable: true
        });
        QuickOpenController.prototype.navigate = function (next, quickNavigate) {
            if (this.quickOpenWidget) {
                this.quickOpenWidget.navigate(next, quickNavigate);
            }
            if (this.pickOpenWidget) {
                this.pickOpenWidget.navigate(next, quickNavigate);
            }
        };
        QuickOpenController.prototype.input = function (options, token) {
            var _this = this;
            if (options === void 0) { options = {}; }
            if (token === void 0) { token = cancellation_1.CancellationToken.None; }
            if (this.pickOpenWidget && this.pickOpenWidget.isVisible()) {
                this.pickOpenWidget.hide(quickOpenWidget_1.HideReason.CANCELED);
            }
            var defaultMessage = options.prompt
                ? nls.localize('inputModeEntryDescription', "{0} (Press 'Enter' to confirm or 'Escape' to cancel)", options.prompt)
                : nls.localize('inputModeEntry', "Press 'Enter' to confirm your input or 'Escape' to cancel");
            var currentPick = defaultMessage;
            var currentValidation;
            var currentDecoration;
            var lastValue;
            var init = function (resolve, reject) {
                // open quick pick with just one choice. we will recurse whenever
                // the validation/success message changes
                _this.doPick(winjs_base_1.TPromise.as([{ label: currentPick, tooltip: currentPick /* make sure message/validation can be read through the hover */ }]), {
                    ignoreFocusLost: options.ignoreFocusLost,
                    autoFocus: { autoFocusFirstEntry: true },
                    password: options.password,
                    placeHolder: options.placeHolder,
                    value: lastValue === void 0 ? options.value : lastValue,
                    valueSelection: options.valueSelection,
                    inputDecoration: currentDecoration,
                    onDidType: function (value) {
                        if (lastValue !== value) {
                            lastValue = value;
                            if (options.validateInput) {
                                if (currentValidation) {
                                    currentValidation.cancel();
                                }
                                currentValidation = winjs_base_1.TPromise.timeout(100).then(function () {
                                    return options.validateInput(value).then(function (message) {
                                        currentDecoration = !!message ? message_1.Severity.Error : void 0;
                                        var newPick = message || defaultMessage;
                                        if (newPick !== currentPick) {
                                            options.valueSelection = [lastValue.length, lastValue.length];
                                            currentPick = newPick;
                                            resolve(new winjs_base_1.TPromise(init));
                                        }
                                        return !message;
                                    });
                                }, function (err) {
                                    // ignore
                                    return null;
                                });
                            }
                        }
                    }
                }, token).then(resolve, reject);
            };
            return new winjs_base_1.TPromise(init).then(function (item) {
                if (!currentValidation) {
                    if (options.validateInput) {
                        currentValidation = options
                            .validateInput(lastValue === void 0 ? options.value : lastValue)
                            .then(function (message) { return !message; });
                    }
                    else {
                        currentValidation = winjs_base_1.TPromise.as(true);
                    }
                }
                return currentValidation.then(function (valid) {
                    if (valid && item) {
                        return lastValue === void 0 ? (options.value || '') : lastValue;
                    }
                    return void 0;
                });
            });
        };
        QuickOpenController.prototype.pick = function (arg1, options, token) {
            var _this = this;
            if (!options) {
                options = Object.create(null);
            }
            var arrayPromise;
            if (Array.isArray(arg1)) {
                arrayPromise = winjs_base_1.TPromise.as(arg1);
            }
            else if (winjs_base_1.TPromise.is(arg1)) {
                arrayPromise = arg1;
            }
            else {
                throw new Error('illegal input');
            }
            var isAboutStrings = false;
            var entryPromise = arrayPromise.then(function (elements) {
                return elements.map(function (element) {
                    if (typeof element === 'string') {
                        isAboutStrings = true;
                        return { label: element };
                    }
                    else {
                        return element;
                    }
                });
            });
            if (this.pickOpenWidget && this.pickOpenWidget.isVisible()) {
                this.pickOpenWidget.hide(quickOpenWidget_1.HideReason.CANCELED);
            }
            return new winjs_base_1.TPromise(function (resolve, reject, progress) {
                function onItem(item) {
                    return item && isAboutStrings ? item.label : item;
                }
                _this.doPick(entryPromise, options, token).then(function (item) { return resolve(onItem(item)); }, function (err) { return reject(err); }, function (item) { return progress(onItem(item)); });
            });
        };
        QuickOpenController.prototype.doPick = function (picksPromise, options, token) {
            var _this = this;
            if (token === void 0) { token = cancellation_1.CancellationToken.None; }
            var autoFocus = options.autoFocus;
            // Use a generated token to avoid race conditions from long running promises
            var currentPickerToken = idGenerator_1.defaultGenerator.nextId();
            this.currentPickerToken = currentPickerToken;
            // Update context
            this.setQuickOpenContextKey(options.contextKey);
            // Create upon first open
            if (!this.pickOpenWidget) {
                this.pickOpenWidget = new quickOpenWidget_1.QuickOpenWidget(builder_1.withElementById(this.partService.getWorkbenchElementId()).getHTMLElement(), {
                    onOk: function () { },
                    onCancel: function () { },
                    onType: function (value) { },
                    onShow: function () { return _this.handleOnShow(true); },
                    onHide: function (reason) { return _this.handleOnHide(true, reason); }
                }, {
                    inputPlaceHolder: options.placeHolder || '',
                    keyboardSupport: false,
                    treeCreator: function (container, config, opts) { return _this.instantiationService.createInstance(listService_1.WorkbenchTree, container, config, opts); }
                });
                this.toUnbind.push(styler_1.attachQuickOpenStyler(this.pickOpenWidget, this.themeService, { background: theme_1.SIDE_BAR_BACKGROUND, foreground: theme_1.SIDE_BAR_FOREGROUND }));
                var pickOpenContainer = this.pickOpenWidget.create();
                DOM.addClass(pickOpenContainer, 'show-file-icons');
                this.positionQuickOpenWidget();
            }
            else {
                this.pickOpenWidget.setPlaceHolder(options.placeHolder || '');
            }
            // Respect input value
            if (options.value) {
                this.pickOpenWidget.setValue(options.value, options.valueSelection);
            }
            // Respect password
            this.pickOpenWidget.setPassword(options.password);
            // Input decoration
            if (!types.isUndefinedOrNull(options.inputDecoration)) {
                this.pickOpenWidget.showInputDecoration(options.inputDecoration);
            }
            else {
                this.pickOpenWidget.clearInputDecoration();
            }
            // Layout
            if (this.layoutDimensions) {
                this.pickOpenWidget.layout(this.layoutDimensions);
            }
            return new winjs_base_1.TPromise(function (complete, error, progress) {
                // Detect cancellation while pick promise is loading
                _this.pickOpenWidget.setCallbacks({
                    onCancel: function () { complete(void 0); },
                    onOk: function () { },
                    onType: function (value) { },
                });
                // hide widget when being cancelled
                token.onCancellationRequested(function (e) {
                    if (_this.currentPickerToken === currentPickerToken) {
                        _this.pickOpenWidget.hide(quickOpenWidget_1.HideReason.CANCELED);
                    }
                });
                var picksPromiseDone = false;
                // Resolve picks
                picksPromise.then(function (picks) {
                    if (_this.currentPickerToken !== currentPickerToken) {
                        return complete(void 0); // Return as canceled if another request came after or user canceled
                    }
                    picksPromiseDone = true;
                    // Reset Progress
                    _this.pickOpenWidget.getProgressBar().stop().getContainer().hide();
                    // Model
                    var model = new quickOpenModel_1.QuickOpenModel([], new PickOpenActionProvider());
                    var entries = picks.map(function (e, index) { return _this.instantiationService.createInstance(PickOpenEntry, e, index, function () { return progress(e); }, function () { return _this.pickOpenWidget.refresh(); }); });
                    if (picks.length === 0) {
                        entries.push(_this.instantiationService.createInstance(PickOpenEntry, { label: nls.localize('emptyPicks', "There are no entries to pick from") }, 0, null, null));
                    }
                    model.setEntries(entries);
                    // Handlers
                    var callbacks = {
                        onOk: function () {
                            if (picks.length === 0) {
                                return complete(null);
                            }
                            var index = -1;
                            var context;
                            entries.forEach(function (entry) {
                                if (entry.shouldRunWithContext) {
                                    index = entry.index;
                                    context = entry.shouldRunWithContext;
                                }
                            });
                            var selectedPick = picks[index];
                            if (selectedPick && typeof selectedPick.run === 'function') {
                                selectedPick.run(context);
                            }
                            complete(selectedPick || null);
                        },
                        onCancel: function () { return complete(void 0); },
                        onFocusLost: function () { return !_this.closeOnFocusLost || options.ignoreFocusLost; },
                        onType: function (value) {
                            // the caller takes care of all input
                            if (options.onDidType) {
                                options.onDidType(value);
                                return;
                            }
                            if (picks.length === 0) {
                                return;
                            }
                            value = value ? strings.trim(value) : value;
                            // Reset filtering
                            if (!value) {
                                entries.forEach(function (e) {
                                    e.setHighlights(null);
                                    e.setHidden(false);
                                });
                            }
                            else {
                                entries.forEach(function (entry) {
                                    var _a = entry.matchesFuzzy(value, options), labelHighlights = _a.labelHighlights, descriptionHighlights = _a.descriptionHighlights, detailHighlights = _a.detailHighlights;
                                    if (entry.shouldAlwaysShow() || labelHighlights || descriptionHighlights || detailHighlights) {
                                        entry.setHighlights(labelHighlights, descriptionHighlights, detailHighlights);
                                        entry.setHidden(false);
                                    }
                                    else {
                                        entry.setHighlights(null, null, null);
                                        entry.setHidden(true);
                                    }
                                });
                            }
                            // Sort by value
                            var normalizedSearchValue = value ? strings.stripWildcards(value.toLowerCase()) : value;
                            model.entries.sort(function (pickA, pickB) {
                                if (!value) {
                                    return pickA.index - pickB.index; // restore natural order
                                }
                                return quickOpenModel_1.compareEntries(pickA, pickB, normalizedSearchValue);
                            });
                            _this.pickOpenWidget.refresh(model, value ? { autoFocusFirstEntry: true } : autoFocus);
                        },
                        onShow: function () { return _this.handleOnShow(true); },
                        onHide: function (reason) { return _this.handleOnHide(true, reason); }
                    };
                    _this.pickOpenWidget.setCallbacks(callbacks);
                    // Set input
                    if (!_this.pickOpenWidget.isVisible()) {
                        _this.pickOpenWidget.show(model, { autoFocus: autoFocus, quickNavigateConfiguration: options.quickNavigateConfiguration });
                    }
                    else {
                        _this.pickOpenWidget.setInput(model, autoFocus);
                    }
                    // The user might have typed something (or options.value was set) so we need to play back
                    // the input box value through our callbacks to filter the result accordingly.
                    var inputValue = _this.pickOpenWidget.getInputBox().value;
                    if (inputValue) {
                        callbacks.onType(inputValue);
                    }
                }, function (err) {
                    _this.pickOpenWidget.hide();
                    error(err);
                });
                // Progress if task takes a long time
                winjs_base_1.TPromise.timeout(800).then(function () {
                    if (!picksPromiseDone && _this.currentPickerToken === currentPickerToken) {
                        _this.pickOpenWidget.getProgressBar().infinite().getContainer().show();
                    }
                });
                // Show picker empty if resolving takes a while
                if (!picksPromiseDone) {
                    _this.pickOpenWidget.show(new quickOpenModel_1.QuickOpenModel());
                }
            });
        };
        QuickOpenController.prototype.accept = function () {
            [this.quickOpenWidget, this.pickOpenWidget].forEach(function (w) {
                if (w && w.isVisible()) {
                    w.accept();
                }
            });
        };
        QuickOpenController.prototype.focus = function () {
            [this.quickOpenWidget, this.pickOpenWidget].forEach(function (w) {
                if (w && w.isVisible()) {
                    w.focus();
                }
            });
        };
        QuickOpenController.prototype.close = function () {
            [this.quickOpenWidget, this.pickOpenWidget].forEach(function (w) {
                if (w && w.isVisible()) {
                    w.hide(quickOpenWidget_1.HideReason.CANCELED);
                }
            });
        };
        QuickOpenController.prototype.emitQuickOpenVisibilityChange = function (isVisible) {
            var _this = this;
            if (this.visibilityChangeTimeoutHandle) {
                window.clearTimeout(this.visibilityChangeTimeoutHandle);
            }
            this.visibilityChangeTimeoutHandle = setTimeout(function () {
                if (isVisible) {
                    _this._onShow.fire();
                }
                else {
                    _this._onHide.fire();
                }
                _this.visibilityChangeTimeoutHandle = void 0;
            }, 100 /* to prevent flashing, we accumulate visibility changes over a timeout of 100ms */);
        };
        QuickOpenController.prototype.show = function (prefix, options) {
            var _this = this;
            var quickNavigateConfiguration = options ? options.quickNavigateConfiguration : void 0;
            var inputSelection = options ? options.inputSelection : void 0;
            var autoFocus = options ? options.autoFocus : void 0;
            var promiseCompletedOnHide = new winjs_base_1.TPromise(function (c) {
                _this.promisesToCompleteOnHide.push(c);
            });
            // Telemetry: log that quick open is shown and log the mode
            var registry = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
            var handlerDescriptor = registry.getQuickOpenHandler(prefix) || registry.getDefaultQuickOpenHandler();
            // Trigger onOpen
            this.resolveHandler(handlerDescriptor).done(null, errors.onUnexpectedError);
            // Create upon first open
            if (!this.quickOpenWidget) {
                this.quickOpenWidget = new quickOpenWidget_1.QuickOpenWidget(builder_1.withElementById(this.partService.getWorkbenchElementId()).getHTMLElement(), {
                    onOk: function () { },
                    onCancel: function () { },
                    onType: function (value) { return _this.onType(value || ''); },
                    onShow: function () { return _this.handleOnShow(false); },
                    onHide: function (reason) { return _this.handleOnHide(false, reason); },
                    onFocusLost: function () { return !_this.closeOnFocusLost; }
                }, {
                    inputPlaceHolder: this.hasHandler(HELP_PREFIX) ? nls.localize('quickOpenInput', "Type '?' to get help on the actions you can take from here") : '',
                    keyboardSupport: false,
                    treeCreator: function (container, config, opts) { return _this.instantiationService.createInstance(listService_1.WorkbenchTree, container, config, opts); }
                });
                this.toUnbind.push(styler_1.attachQuickOpenStyler(this.quickOpenWidget, this.themeService, { background: theme_1.SIDE_BAR_BACKGROUND, foreground: theme_1.SIDE_BAR_FOREGROUND }));
                var quickOpenContainer = this.quickOpenWidget.create();
                DOM.addClass(quickOpenContainer, 'show-file-icons');
                this.positionQuickOpenWidget();
            }
            // Layout
            if (this.layoutDimensions) {
                this.quickOpenWidget.layout(this.layoutDimensions);
            }
            // Show quick open with prefix or editor history
            if (!this.quickOpenWidget.isVisible() || quickNavigateConfiguration) {
                if (prefix) {
                    this.quickOpenWidget.show(prefix, { quickNavigateConfiguration: quickNavigateConfiguration, inputSelection: inputSelection, autoFocus: autoFocus });
                }
                else {
                    var editorHistory = this.getEditorHistoryWithGroupLabel();
                    if (editorHistory.getEntries().length < 2) {
                        quickNavigateConfiguration = null; // If no entries can be shown, default to normal quick open mode
                    }
                    // Compute auto focus
                    if (!autoFocus) {
                        if (!quickNavigateConfiguration) {
                            autoFocus = { autoFocusFirstEntry: true };
                        }
                        else {
                            var visibleEditorCount = this.editorService.getVisibleEditors().length;
                            autoFocus = { autoFocusFirstEntry: visibleEditorCount === 0, autoFocusSecondEntry: visibleEditorCount !== 0 };
                        }
                    }
                    // Update context
                    var registry_1 = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
                    this.setQuickOpenContextKey(registry_1.getDefaultQuickOpenHandler().contextKey);
                    this.quickOpenWidget.show(editorHistory, { quickNavigateConfiguration: quickNavigateConfiguration, autoFocus: autoFocus, inputSelection: inputSelection });
                }
            }
            else {
                this.quickOpenWidget.show(prefix || '', { inputSelection: inputSelection });
            }
            return promiseCompletedOnHide;
        };
        QuickOpenController.prototype.positionQuickOpenWidget = function () {
            var titlebarOffset = this.partService.getTitleBarOffset();
            if (this.quickOpenWidget) {
                this.quickOpenWidget.getElement().style('top', titlebarOffset + "px");
            }
            if (this.pickOpenWidget) {
                this.pickOpenWidget.getElement().style('top', titlebarOffset + "px");
            }
        };
        QuickOpenController.prototype.handleOnShow = function (isPicker) {
            if (isPicker && this.quickOpenWidget) {
                this.quickOpenWidget.hide(quickOpenWidget_1.HideReason.FOCUS_LOST);
            }
            else if (!isPicker && this.pickOpenWidget) {
                this.pickOpenWidget.hide(quickOpenWidget_1.HideReason.FOCUS_LOST);
            }
            this.inQuickOpenMode.set(true);
            this.emitQuickOpenVisibilityChange(true);
        };
        QuickOpenController.prototype.handleOnHide = function (isPicker, reason) {
            var _this = this;
            if (!isPicker) {
                // Clear state
                this.previousActiveHandlerDescriptor = null;
                var _loop_1 = function (prefix) {
                    if (this_1.mapResolvedHandlersToPrefix.hasOwnProperty(prefix)) {
                        var promise = this_1.mapResolvedHandlersToPrefix[prefix];
                        promise.then(function (handler) {
                            _this.handlerOnOpenCalled[prefix] = false;
                            handler.onClose(reason === quickOpenWidget_1.HideReason.CANCELED); // Don't check if onOpen was called to preserve old behaviour for now
                        });
                    }
                };
                var this_1 = this;
                // Pass to handlers
                for (var prefix in this.mapResolvedHandlersToPrefix) {
                    _loop_1(prefix);
                }
                // Complete promises that are waiting
                while (this.promisesToCompleteOnHide.length) {
                    this.promisesToCompleteOnHide.pop()(true);
                }
            }
            if (reason !== quickOpenWidget_1.HideReason.FOCUS_LOST) {
                this.restoreFocus(); // focus back to editor unless user clicked somewhere else
            }
            // Reset context keys
            this.inQuickOpenMode.reset();
            this.resetQuickOpenContextKeys();
            // Events
            this.emitQuickOpenVisibilityChange(false);
        };
        QuickOpenController.prototype.resetQuickOpenContextKeys = function () {
            var _this = this;
            Object.keys(this.mapContextKeyToContext).forEach(function (k) { return _this.mapContextKeyToContext[k].reset(); });
        };
        QuickOpenController.prototype.setQuickOpenContextKey = function (id) {
            var key;
            if (id) {
                key = this.mapContextKeyToContext[id];
                if (!key) {
                    key = new contextkey_1.RawContextKey(id, false).bindTo(this.contextKeyService);
                    this.mapContextKeyToContext[id] = key;
                }
            }
            if (key && key.get()) {
                return; // already active context
            }
            this.resetQuickOpenContextKeys();
            if (key) {
                key.set(true);
            }
        };
        QuickOpenController.prototype.hasHandler = function (prefix) {
            return !!platform_1.Registry.as(quickopen_1.Extensions.Quickopen).getQuickOpenHandler(prefix);
        };
        QuickOpenController.prototype.getEditorHistoryWithGroupLabel = function () {
            var entries = this.editorHistoryHandler.getResults();
            // Apply label to first entry
            if (entries.length > 0) {
                entries[0] = new EditorHistoryEntryGroup(entries[0], nls.localize('historyMatches', "recently opened"), false);
            }
            return new quickOpenModel_1.QuickOpenModel(entries, this.actionProvider);
        };
        QuickOpenController.prototype.restoreFocus = function () {
            // Try to focus active editor
            var editor = this.editorService.getActiveEditor();
            if (editor) {
                editor.focus();
            }
        };
        QuickOpenController.prototype.onType = function (value) {
            var _this = this;
            // look for a handler
            var registry = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
            var handlerDescriptor = registry.getQuickOpenHandler(value);
            var defaultHandlerDescriptor = registry.getDefaultQuickOpenHandler();
            var instantProgress = handlerDescriptor && handlerDescriptor.instantProgress;
            var contextKey = handlerDescriptor ? handlerDescriptor.contextKey : defaultHandlerDescriptor.contextKey;
            // Use a generated token to avoid race conditions from long running promises
            var currentResultToken = idGenerator_1.defaultGenerator.nextId();
            this.currentResultToken = currentResultToken;
            // Reset Progress
            if (!instantProgress) {
                this.quickOpenWidget.getProgressBar().stop().getContainer().hide();
            }
            // Reset Extra Class
            this.quickOpenWidget.setExtraClass(null);
            // Update context
            this.setQuickOpenContextKey(contextKey);
            // Remove leading and trailing whitespace
            var trimmedValue = strings.trim(value);
            // If no value provided, default to editor history
            if (!trimmedValue) {
                // Trigger onOpen
                this.resolveHandler(handlerDescriptor || defaultHandlerDescriptor)
                    .done(null, errors.onUnexpectedError);
                this.quickOpenWidget.setInput(this.getEditorHistoryWithGroupLabel(), { autoFocusFirstEntry: true });
                return;
            }
            var resultPromise;
            var resultPromiseDone = false;
            if (handlerDescriptor) {
                resultPromise = this.handleSpecificHandler(handlerDescriptor, value, currentResultToken);
            }
            else {
                resultPromise = this.handleDefaultHandler(defaultHandlerDescriptor, value, currentResultToken);
            }
            // Remember as the active one
            this.previousActiveHandlerDescriptor = handlerDescriptor;
            // Progress if task takes a long time
            winjs_base_1.TPromise.timeout(instantProgress ? 0 : 800).then(function () {
                if (!resultPromiseDone && currentResultToken === _this.currentResultToken) {
                    _this.quickOpenWidget.getProgressBar().infinite().getContainer().show();
                }
            });
            // Promise done handling
            resultPromise.done(function () {
                resultPromiseDone = true;
                if (currentResultToken === _this.currentResultToken) {
                    _this.quickOpenWidget.getProgressBar().getContainer().hide();
                }
            }, function (error) {
                resultPromiseDone = true;
                errors.onUnexpectedError(error);
                _this.messageService.show(message_1.Severity.Error, types.isString(error) ? new Error(error) : error);
            });
        };
        QuickOpenController.prototype.handleDefaultHandler = function (handler, value, currentResultToken) {
            var _this = this;
            // Fill in history results if matching
            var matchingHistoryEntries = this.editorHistoryHandler.getResults(value);
            if (matchingHistoryEntries.length > 0) {
                matchingHistoryEntries[0] = new EditorHistoryEntryGroup(matchingHistoryEntries[0], nls.localize('historyMatches', "recently opened"), false);
            }
            // Resolve
            return this.resolveHandler(handler).then(function (resolvedHandler) {
                var quickOpenModel = new quickOpenModel_1.QuickOpenModel(matchingHistoryEntries, _this.actionProvider);
                var inputSet = false;
                // If we have matching entries from history we want to show them directly and not wait for the other results to come in
                // This also applies when we used to have entries from a previous run and now there are no more history results matching
                var previousInput = _this.quickOpenWidget.getInput();
                var wasShowingHistory = previousInput && previousInput.entries && previousInput.entries.some(function (e) { return e instanceof EditorHistoryEntry || e instanceof EditorHistoryEntryGroup; });
                if (wasShowingHistory || matchingHistoryEntries.length > 0) {
                    (resolvedHandler.hasShortResponseTime() ? winjs_base_1.TPromise.timeout(QuickOpenController.MAX_SHORT_RESPONSE_TIME) : winjs_base_1.TPromise.as(undefined)).then(function () {
                        if (_this.currentResultToken === currentResultToken && !inputSet) {
                            _this.quickOpenWidget.setInput(quickOpenModel, { autoFocusFirstEntry: true });
                            inputSet = true;
                        }
                    });
                }
                // Get results
                return resolvedHandler.getResults(value).then(function (result) {
                    if (_this.currentResultToken === currentResultToken) {
                        // now is the time to show the input if we did not have set it before
                        if (!inputSet) {
                            _this.quickOpenWidget.setInput(quickOpenModel, { autoFocusFirstEntry: true });
                            inputSet = true;
                        }
                        // merge history and default handler results
                        var handlerResults = (result && result.entries) || [];
                        _this.mergeResults(quickOpenModel, handlerResults, resolvedHandler.getGroupLabel());
                    }
                });
            });
        };
        QuickOpenController.prototype.mergeResults = function (quickOpenModel, handlerResults, groupLabel) {
            // Remove results already showing by checking for a "resource" property
            var mapEntryToResource = this.mapEntriesToResource(quickOpenModel);
            var additionalHandlerResults = [];
            for (var i = 0; i < handlerResults.length; i++) {
                var result = handlerResults[i];
                var resource = result.getResource();
                if (!result.mergeWithEditorHistory() || !resource || !mapEntryToResource[resource.toString()]) {
                    additionalHandlerResults.push(result);
                }
            }
            // Show additional handler results below any existing results
            if (additionalHandlerResults.length > 0) {
                var autoFocusFirstEntry = (quickOpenModel.getEntries().length === 0); // the user might have selected another entry meanwhile in local history (see https://github.com/Microsoft/vscode/issues/20828)
                var useTopBorder = quickOpenModel.getEntries().length > 0;
                additionalHandlerResults[0] = new quickOpenModel_1.QuickOpenEntryGroup(additionalHandlerResults[0], groupLabel, useTopBorder);
                quickOpenModel.addEntries(additionalHandlerResults);
                this.quickOpenWidget.refresh(quickOpenModel, { autoFocusFirstEntry: autoFocusFirstEntry });
            }
            else if (quickOpenModel.getEntries().length === 0) {
                quickOpenModel.addEntries([new PlaceholderQuickOpenEntry(nls.localize('noResultsFound1', "No results found"))]);
                this.quickOpenWidget.refresh(quickOpenModel, { autoFocusFirstEntry: true });
            }
        };
        QuickOpenController.prototype.handleSpecificHandler = function (handlerDescriptor, value, currentResultToken) {
            var _this = this;
            return this.resolveHandler(handlerDescriptor).then(function (resolvedHandler) {
                // Remove handler prefix from search value
                value = value.substr(handlerDescriptor.prefix.length);
                // Return early if the handler can not run in the current environment and inform the user
                var canRun = resolvedHandler.canRun();
                if (types.isUndefinedOrNull(canRun) || (typeof canRun === 'boolean' && !canRun) || typeof canRun === 'string') {
                    var placeHolderLabel = (typeof canRun === 'string') ? canRun : nls.localize('canNotRunPlaceholder', "This quick open handler can not be used in the current context");
                    var model = new quickOpenModel_1.QuickOpenModel([new PlaceholderQuickOpenEntry(placeHolderLabel)], _this.actionProvider);
                    _this.showModel(model, resolvedHandler.getAutoFocus(value, { model: model, quickNavigateConfiguration: _this.quickOpenWidget.getQuickNavigateConfiguration() }), resolvedHandler.getAriaLabel());
                    return winjs_base_1.TPromise.as(null);
                }
                // Support extra class from handler
                var extraClass = resolvedHandler.getClass();
                if (extraClass) {
                    _this.quickOpenWidget.setExtraClass(extraClass);
                }
                // When handlers change, clear the result list first before loading the new results
                if (_this.previousActiveHandlerDescriptor !== handlerDescriptor) {
                    _this.clearModel();
                }
                // Receive Results from Handler and apply
                return resolvedHandler.getResults(value).then(function (result) {
                    if (_this.currentResultToken === currentResultToken) {
                        if (!result || !result.entries.length) {
                            var model = new quickOpenModel_1.QuickOpenModel([new PlaceholderQuickOpenEntry(resolvedHandler.getEmptyLabel(value))]);
                            _this.showModel(model, resolvedHandler.getAutoFocus(value, { model: model, quickNavigateConfiguration: _this.quickOpenWidget.getQuickNavigateConfiguration() }), resolvedHandler.getAriaLabel());
                        }
                        else {
                            _this.showModel(result, resolvedHandler.getAutoFocus(value, { model: result, quickNavigateConfiguration: _this.quickOpenWidget.getQuickNavigateConfiguration() }), resolvedHandler.getAriaLabel());
                        }
                    }
                });
            });
        };
        QuickOpenController.prototype.showModel = function (model, autoFocus, ariaLabel) {
            // If the given model is already set in the widget, refresh and return early
            if (this.quickOpenWidget.getInput() === model) {
                this.quickOpenWidget.refresh(model, autoFocus);
                return;
            }
            // Otherwise just set it
            this.quickOpenWidget.setInput(model, autoFocus, ariaLabel);
        };
        QuickOpenController.prototype.clearModel = function () {
            this.showModel(new quickOpenModel_1.QuickOpenModel(), null);
        };
        QuickOpenController.prototype.mapEntriesToResource = function (model) {
            var entries = model.getEntries();
            var mapEntryToPath = {};
            entries.forEach(function (entry) {
                if (entry.getResource()) {
                    mapEntryToPath[entry.getResource().toString()] = entry;
                }
            });
            return mapEntryToPath;
        };
        QuickOpenController.prototype.resolveHandler = function (handler) {
            var _this = this;
            var result = this._resolveHandler(handler);
            var id = handler.getId();
            if (!this.handlerOnOpenCalled[id]) {
                var original_1 = result;
                this.handlerOnOpenCalled[id] = true;
                result = this.mapResolvedHandlersToPrefix[id] = original_1.then(function (resolved) {
                    _this.mapResolvedHandlersToPrefix[id] = original_1;
                    resolved.onOpen();
                    return resolved;
                });
            }
            return result.then(null, function (error) {
                delete _this.mapResolvedHandlersToPrefix[id];
                return winjs_base_1.TPromise.wrapError(new Error("Unable to instantiate quick open handler " + handler.getId() + ": " + JSON.stringify(error)));
            });
        };
        QuickOpenController.prototype._resolveHandler = function (handler) {
            var id = handler.getId();
            // Return Cached
            if (this.mapResolvedHandlersToPrefix[id]) {
                return this.mapResolvedHandlersToPrefix[id];
            }
            // Otherwise load and create
            return this.mapResolvedHandlersToPrefix[id] = winjs_base_1.TPromise.as(handler.instantiate(this.instantiationService));
        };
        QuickOpenController.prototype.layout = function (dimension) {
            this.layoutDimensions = dimension;
            if (this.quickOpenWidget) {
                this.quickOpenWidget.layout(this.layoutDimensions);
            }
            if (this.pickOpenWidget) {
                this.pickOpenWidget.layout(this.layoutDimensions);
            }
        };
        QuickOpenController.prototype.dispose = function () {
            if (this.quickOpenWidget) {
                this.quickOpenWidget.dispose();
            }
            if (this.pickOpenWidget) {
                this.pickOpenWidget.dispose();
            }
            _super.prototype.dispose.call(this);
        };
        QuickOpenController.MAX_SHORT_RESPONSE_TIME = 500;
        QuickOpenController.ID = 'workbench.component.quickopen';
        QuickOpenController = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, message_1.IMessageService),
            __param(2, contextkey_1.IContextKeyService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, partService_1.IPartService),
            __param(6, environment_1.IEnvironmentService),
            __param(7, themeService_1.IThemeService)
        ], QuickOpenController);
        return QuickOpenController;
    }(component_1.Component));
    exports.QuickOpenController = QuickOpenController;
    var PlaceholderQuickOpenEntry = /** @class */ (function (_super) {
        __extends(PlaceholderQuickOpenEntry, _super);
        function PlaceholderQuickOpenEntry(placeHolderLabel) {
            var _this = _super.call(this) || this;
            _this.placeHolderLabel = placeHolderLabel;
            return _this;
        }
        PlaceholderQuickOpenEntry.prototype.getLabel = function () {
            return this.placeHolderLabel;
        };
        return PlaceholderQuickOpenEntry;
    }(quickOpenModel_1.QuickOpenEntryGroup));
    var PickOpenEntry = /** @class */ (function (_super) {
        __extends(PickOpenEntry, _super);
        function PickOpenEntry(item, _index, onPreview, onRemove, modeService, modelService) {
            var _this = _super.call(this, item.label) || this;
            _this._index = _index;
            _this.onPreview = onPreview;
            _this.onRemove = onRemove;
            _this.modeService = modeService;
            _this.modelService = modelService;
            _this.description = item.description;
            _this.detail = item.detail;
            _this.tooltip = item.tooltip;
            _this.descriptionOcticons = item.description ? octicon_1.parseOcticons(item.description) : void 0;
            _this.descriptionTooltip = _this.descriptionOcticons ? _this.descriptionOcticons.text : void 0;
            _this.hasSeparator = item.separator && item.separator.border;
            _this.separatorLabel = item.separator && item.separator.label;
            _this.alwaysShow = item.alwaysShow;
            _this._action = item.action;
            _this.payload = item.payload;
            var fileItem = item;
            _this.resource = fileItem.resource;
            _this.fileKind = fileItem.fileKind;
            return _this;
        }
        PickOpenEntry.prototype.matchesFuzzy = function (query, options) {
            if (!this.labelOcticons) {
                this.labelOcticons = octicon_1.parseOcticons(this.getLabel()); // parse on demand
            }
            var detail = this.getDetail();
            if (detail && options.matchOnDetail && !this.detailOcticons) {
                this.detailOcticons = octicon_1.parseOcticons(detail); // parse on demand
            }
            return {
                labelHighlights: octicon_1.matchesFuzzyOcticonAware(query, this.labelOcticons),
                descriptionHighlights: options.matchOnDescription && this.descriptionOcticons ? octicon_1.matchesFuzzyOcticonAware(query, this.descriptionOcticons) : void 0,
                detailHighlights: options.matchOnDetail && this.detailOcticons ? octicon_1.matchesFuzzyOcticonAware(query, this.detailOcticons) : void 0
            };
        };
        PickOpenEntry.prototype.getPayload = function () {
            return this.payload;
        };
        PickOpenEntry.prototype.remove = function () {
            _super.prototype.setHidden.call(this, true);
            this.removed = true;
            this.onRemove();
        };
        PickOpenEntry.prototype.isHidden = function () {
            return this.removed || _super.prototype.isHidden.call(this);
        };
        Object.defineProperty(PickOpenEntry.prototype, "action", {
            get: function () {
                return this._action;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PickOpenEntry.prototype, "index", {
            get: function () {
                return this._index;
            },
            enumerable: true,
            configurable: true
        });
        PickOpenEntry.prototype.getLabelOptions = function () {
            return {
                extraClasses: this.resource ? labels_1.getIconClasses(this.modelService, this.modeService, this.resource, this.fileKind) : []
            };
        };
        Object.defineProperty(PickOpenEntry.prototype, "shouldRunWithContext", {
            get: function () {
                return this._shouldRunWithContext;
            },
            enumerable: true,
            configurable: true
        });
        PickOpenEntry.prototype.getDescription = function () {
            return this.description;
        };
        PickOpenEntry.prototype.getDetail = function () {
            return this.detail;
        };
        PickOpenEntry.prototype.getTooltip = function () {
            return this.tooltip;
        };
        PickOpenEntry.prototype.getDescriptionTooltip = function () {
            return this.descriptionTooltip;
        };
        PickOpenEntry.prototype.showBorder = function () {
            return this.hasSeparator;
        };
        PickOpenEntry.prototype.getGroupLabel = function () {
            return this.separatorLabel;
        };
        PickOpenEntry.prototype.shouldAlwaysShow = function () {
            return this.alwaysShow;
        };
        PickOpenEntry.prototype.getResource = function () {
            return this.resource;
        };
        PickOpenEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                this._shouldRunWithContext = context;
                return true;
            }
            if (mode === quickOpen_1.Mode.PREVIEW && this.onPreview) {
                this.onPreview();
            }
            return false;
        };
        PickOpenEntry = __decorate([
            __param(4, modeService_1.IModeService),
            __param(5, modelService_1.IModelService)
        ], PickOpenEntry);
        return PickOpenEntry;
    }(PlaceholderQuickOpenEntry));
    var PickOpenActionProvider = /** @class */ (function () {
        function PickOpenActionProvider() {
        }
        PickOpenActionProvider.prototype.hasActions = function (tree, element) {
            return !!element.action;
        };
        PickOpenActionProvider.prototype.getActions = function (tree, element) {
            return winjs_base_1.TPromise.as(element.action ? [element.action] : []);
        };
        PickOpenActionProvider.prototype.hasSecondaryActions = function (tree, element) {
            return false;
        };
        PickOpenActionProvider.prototype.getSecondaryActions = function (tree, element) {
            return winjs_base_1.TPromise.as([]);
        };
        PickOpenActionProvider.prototype.getActionItem = function (tree, element, action) {
            return null;
        };
        return PickOpenActionProvider;
    }());
    var EditorHistoryHandler = /** @class */ (function () {
        function EditorHistoryHandler(historyService, instantiationService, fileService) {
            this.historyService = historyService;
            this.instantiationService = instantiationService;
            this.fileService = fileService;
            this.scorerCache = Object.create(null);
        }
        EditorHistoryHandler.prototype.getResults = function (searchValue) {
            var _this = this;
            // Massage search for scoring
            var query = quickOpenScorer_1.prepareQuery(searchValue);
            // Just return all if we are not searching
            var history = this.historyService.getHistory();
            if (!query.value) {
                return history.map(function (input) { return _this.instantiationService.createInstance(EditorHistoryEntry, input); });
            }
            // Otherwise filter by search value and sort by score. Include matches on description
            // in case the user is explicitly including path separators.
            var accessor = query.containsPathSeparator ? MatchOnDescription : DoNotMatchOnDescription;
            return history
                .filter(function (input) {
                var resource;
                if (input instanceof editor_1.EditorInput) {
                    resource = resourceForEditorHistory(input, _this.fileService);
                }
                else {
                    resource = input.resource;
                }
                return !!resource;
            })
                .map(function (input) { return _this.instantiationService.createInstance(EditorHistoryEntry, input); })
                .filter(function (e) {
                var itemScore = quickOpenScorer_1.scoreItem(e, query, false, accessor, _this.scorerCache);
                if (!itemScore.score) {
                    return false;
                }
                e.setHighlights(itemScore.labelMatch, itemScore.descriptionMatch);
                return true;
            })
                .sort(function (e1, e2) { return quickOpenScorer_1.compareItemsByScore(e1, e2, query, false, accessor, _this.scorerCache, function (e1, e2, query, accessor) { return -1; }); });
        };
        EditorHistoryHandler = __decorate([
            __param(0, history_1.IHistoryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, files_1.IFileService)
        ], EditorHistoryHandler);
        return EditorHistoryHandler;
    }());
    var EditorHistoryItemAccessorClass = /** @class */ (function (_super) {
        __extends(EditorHistoryItemAccessorClass, _super);
        function EditorHistoryItemAccessorClass(allowMatchOnDescription) {
            var _this = _super.call(this) || this;
            _this.allowMatchOnDescription = allowMatchOnDescription;
            return _this;
        }
        EditorHistoryItemAccessorClass.prototype.getItemDescription = function (entry) {
            return this.allowMatchOnDescription ? entry.getDescription() : void 0;
        };
        return EditorHistoryItemAccessorClass;
    }(quickOpenModel_1.QuickOpenItemAccessorClass));
    var MatchOnDescription = new EditorHistoryItemAccessorClass(true);
    var DoNotMatchOnDescription = new EditorHistoryItemAccessorClass(false);
    var EditorHistoryEntryGroup = /** @class */ (function (_super) {
        __extends(EditorHistoryEntryGroup, _super);
        function EditorHistoryEntryGroup() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return EditorHistoryEntryGroup;
    }(quickOpenModel_1.QuickOpenEntryGroup));
    exports.EditorHistoryEntryGroup = EditorHistoryEntryGroup;
    var EditorHistoryEntry = /** @class */ (function (_super) {
        __extends(EditorHistoryEntry, _super);
        function EditorHistoryEntry(input, editorService, modeService, modelService, textFileService, contextService, configurationService, environmentService, fileService) {
            var _this = _super.call(this, editorService) || this;
            _this.modeService = modeService;
            _this.modelService = modelService;
            _this.textFileService = textFileService;
            _this.configurationService = configurationService;
            _this.input = input;
            if (input instanceof editor_1.EditorInput) {
                _this.resource = resourceForEditorHistory(input, fileService);
                _this.label = input.getName();
                _this.description = input.getDescription();
                _this.dirty = input.isDirty();
            }
            else {
                var resourceInput = input;
                _this.resource = resourceInput.resource;
                _this.label = labels_2.getBaseLabel(resourceInput.resource);
                _this.description = labels.getPathLabel(resources.dirname(_this.resource), contextService, environmentService);
                _this.dirty = _this.resource && _this.textFileService.isDirty(_this.resource);
                if (_this.dirty && _this.textFileService.getAutoSaveMode() === textfiles_1.AutoSaveMode.AFTER_SHORT_DELAY) {
                    _this.dirty = false; // no dirty decoration if auto save is on with a short timeout
                }
            }
            return _this;
        }
        EditorHistoryEntry.prototype.getIcon = function () {
            return this.dirty ? 'dirty' : '';
        };
        EditorHistoryEntry.prototype.getLabel = function () {
            return this.label;
        };
        EditorHistoryEntry.prototype.getLabelOptions = function () {
            return {
                extraClasses: labels_1.getIconClasses(this.modelService, this.modeService, this.resource)
            };
        };
        EditorHistoryEntry.prototype.getAriaLabel = function () {
            return nls.localize('entryAriaLabel', "{0}, recently opened", this.getLabel());
        };
        EditorHistoryEntry.prototype.getDescription = function () {
            return this.description;
        };
        EditorHistoryEntry.prototype.getResource = function () {
            return this.resource;
        };
        EditorHistoryEntry.prototype.getInput = function () {
            return this.input;
        };
        EditorHistoryEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN) {
                var sideBySide = !context.quickNavigateConfiguration && (context.keymods.alt || context.keymods.ctrlCmd);
                var pinned = !this.configurationService.getValue().workbench.editor.enablePreviewFromQuickOpen || context.keymods.alt;
                if (this.input instanceof editor_1.EditorInput) {
                    this.editorService.openEditor(this.input, { pinned: pinned }, sideBySide).done(null, errors.onUnexpectedError);
                }
                else {
                    this.editorService.openEditor({ resource: this.input.resource, options: { pinned: pinned } }, sideBySide);
                }
                return true;
            }
            return _super.prototype.run.call(this, mode, context);
        };
        EditorHistoryEntry = __decorate([
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, modeService_1.IModeService),
            __param(3, modelService_1.IModelService),
            __param(4, textfiles_1.ITextFileService),
            __param(5, workspace_1.IWorkspaceContextService),
            __param(6, configuration_1.IConfigurationService),
            __param(7, environment_1.IEnvironmentService),
            __param(8, files_1.IFileService)
        ], EditorHistoryEntry);
        return EditorHistoryEntry;
    }(quickopen_1.EditorQuickOpenEntry));
    exports.EditorHistoryEntry = EditorHistoryEntry;
    function resourceForEditorHistory(input, fileService) {
        var resource = input ? input.getResource() : void 0;
        // For the editor history we only prefer resources that are either untitled or
        // can be handled by the file service which indicates they are editable resources.
        if (resource && (fileService.canHandleResource(resource) || resource.scheme === network_1.Schemas.untitled)) {
            return resource;
        }
        return void 0;
    }
    var RemoveFromEditorHistoryAction = /** @class */ (function (_super) {
        __extends(RemoveFromEditorHistoryAction, _super);
        function RemoveFromEditorHistoryAction(id, label, quickOpenService, instantiationService, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            _this.instantiationService = instantiationService;
            _this.historyService = historyService;
            return _this;
        }
        RemoveFromEditorHistoryAction.prototype.run = function () {
            var _this = this;
            var history = this.historyService.getHistory();
            var picks = history.map(function (h) {
                var entry = _this.instantiationService.createInstance(EditorHistoryEntry, h);
                return {
                    input: h,
                    resource: entry.getResource(),
                    label: entry.getLabel(),
                    description: entry.getDescription()
                };
            });
            return this.quickOpenService.pick(picks, { placeHolder: nls.localize('pickHistory', "Select an editor entry to remove from history"), autoFocus: { autoFocusFirstEntry: true }, matchOnDescription: true }).then(function (pick) {
                if (pick) {
                    _this.historyService.remove(pick.input);
                }
            });
        };
        RemoveFromEditorHistoryAction.ID = 'workbench.action.removeFromEditorHistory';
        RemoveFromEditorHistoryAction.LABEL = nls.localize('removeFromEditorHistory', "Remove From History");
        RemoveFromEditorHistoryAction = __decorate([
            __param(2, quickOpen_2.IQuickOpenService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, history_1.IHistoryService)
        ], RemoveFromEditorHistoryAction);
        return RemoveFromEditorHistoryAction;
    }(actions_1.Action));
    exports.RemoveFromEditorHistoryAction = RemoveFromEditorHistoryAction;
});
