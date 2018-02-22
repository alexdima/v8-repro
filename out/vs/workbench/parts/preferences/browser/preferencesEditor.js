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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/uri", "vs/base/common/strings", "vs/base/common/errors", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/arrays", "vs/base/browser/builder", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/baseEditor", "vs/workbench/common/editor/resourceEditorInput", "vs/workbench/browser/parts/editor/textEditor", "vs/editor/browser/codeEditor", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/preferences/common/preferences", "vs/workbench/parts/preferences/common/preferencesModels", "vs/workbench/parts/preferences/browser/preferencesWidgets", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/editorExtensions", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage", "vs/editor/common/services/resourceConfiguration", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/resolverService", "vs/base/browser/ui/sash/sash", "vs/base/browser/ui/widget", "vs/workbench/parts/preferences/browser/preferencesRenderers", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/group/common/groupService", "vs/workbench/browser/editor", "vs/editor/contrib/folding/folding", "vs/editor/contrib/find/findController", "vs/editor/contrib/multicursor/multicursor", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/theme/common/styler", "vs/platform/theme/common/colorRegistry", "vs/platform/workspace/common/workspace", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/editor/contrib/message/messageController", "vs/platform/configuration/common/configuration", "vs/workbench/services/hash/common/hashService", "vs/platform/configuration/common/configurationRegistry", "vs/platform/progress/common/progress", "vs/platform/log/common/log"], function (require, exports, winjs_base_1, nls, uri_1, strings, errors_1, DOM, async_1, arrays, builder_1, iterator_1, lifecycle_1, editor_1, baseEditor_1, resourceEditorInput_1, textEditor_1, codeEditor_1, instantiation_1, preferences_1, preferencesModels_1, preferencesWidgets_1, contextkey_1, editorExtensions_1, telemetry_1, themeService_1, storage_1, resourceConfiguration_1, editorService_1, resolverService_1, sash_1, widget_1, preferencesRenderers_1, textfiles_1, groupService_1, editor_2, folding_1, findController_1, multicursor_1, keybindingsRegistry_1, styler_1, colorRegistry_1, workspace_1, event_1, platform_1, messageController_1, configuration_1, hashService_1, configurationRegistry_1, progress_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PreferencesEditorInput = /** @class */ (function (_super) {
        __extends(PreferencesEditorInput, _super);
        function PreferencesEditorInput() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PreferencesEditorInput.prototype.getTypeId = function () {
            return PreferencesEditorInput.ID;
        };
        PreferencesEditorInput.prototype.supportsSplitEditor = function () {
            return true;
        };
        PreferencesEditorInput.prototype.getTitle = function (verbosity) {
            return this.master.getTitle(verbosity);
        };
        PreferencesEditorInput.ID = 'workbench.editorinputs.preferencesEditorInput';
        return PreferencesEditorInput;
    }(editor_1.SideBySideEditorInput));
    exports.PreferencesEditorInput = PreferencesEditorInput;
    var DefaultPreferencesEditorInput = /** @class */ (function (_super) {
        __extends(DefaultPreferencesEditorInput, _super);
        function DefaultPreferencesEditorInput(defaultSettingsResource, textModelResolverService, hashService) {
            return _super.call(this, nls.localize('settingsEditorName', "Default Settings"), '', defaultSettingsResource, textModelResolverService, hashService) || this;
        }
        DefaultPreferencesEditorInput.prototype.getTypeId = function () {
            return DefaultPreferencesEditorInput.ID;
        };
        DefaultPreferencesEditorInput.prototype.matches = function (other) {
            if (other instanceof DefaultPreferencesEditorInput) {
                return true;
            }
            if (!_super.prototype.matches.call(this, other)) {
                return false;
            }
            return true;
        };
        DefaultPreferencesEditorInput.ID = 'workbench.editorinputs.defaultpreferences';
        DefaultPreferencesEditorInput = __decorate([
            __param(1, resolverService_1.ITextModelService),
            __param(2, hashService_1.IHashService)
        ], DefaultPreferencesEditorInput);
        return DefaultPreferencesEditorInput;
    }(resourceEditorInput_1.ResourceEditorInput));
    exports.DefaultPreferencesEditorInput = DefaultPreferencesEditorInput;
    var PreferencesEditor = /** @class */ (function (_super) {
        __extends(PreferencesEditor, _super);
        function PreferencesEditor(preferencesService, telemetryService, editorService, contextKeyService, instantiationService, themeService, progressService) {
            var _this = _super.call(this, PreferencesEditor.ID, telemetryService, themeService) || this;
            _this.preferencesService = preferencesService;
            _this.editorService = editorService;
            _this.contextKeyService = contextKeyService;
            _this.instantiationService = instantiationService;
            _this.progressService = progressService;
            _this.lastFocusedWidget = null;
            _this.defaultSettingsEditorContextKey = preferences_1.CONTEXT_SETTINGS_EDITOR.bindTo(_this.contextKeyService);
            _this.focusSettingsContextKey = preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS.bindTo(_this.contextKeyService);
            _this.delayedFilterLogging = new async_1.Delayer(1000);
            _this.localSearchDelayer = new async_1.Delayer(100);
            _this.remoteSearchThrottle = new async_1.ThrottledDelayer(200);
            return _this;
        }
        PreferencesEditor.prototype.createEditor = function (parent) {
            var _this = this;
            var parentElement = parent.getHTMLElement();
            DOM.addClass(parentElement, 'preferences-editor');
            this.headerContainer = DOM.append(parentElement, DOM.$('.preferences-header'));
            this.searchWidget = this._register(this.instantiationService.createInstance(preferencesWidgets_1.SearchWidget, this.headerContainer, {
                ariaLabel: nls.localize('SearchSettingsWidget.AriaLabel', "Search settings"),
                placeholder: nls.localize('SearchSettingsWidget.Placeholder', "Search Settings"),
                focusKey: this.focusSettingsContextKey,
                showResultCount: true
            }));
            this._register(this.searchWidget.onDidChange(function (value) { return _this.onInputChanged(); }));
            this._register(this.searchWidget.onFocus(function () { return _this.lastFocusedWidget = _this.searchWidget; }));
            this.lastFocusedWidget = this.searchWidget;
            var editorsContainer = DOM.append(parentElement, DOM.$('.preferences-editors-container'));
            this.sideBySidePreferencesWidget = this._register(this.instantiationService.createInstance(SideBySidePreferencesWidget, editorsContainer));
            this._register(this.sideBySidePreferencesWidget.onFocus(function () { return _this.lastFocusedWidget = _this.sideBySidePreferencesWidget; }));
            this._register(this.sideBySidePreferencesWidget.onDidSettingsTargetChange(function (target) { return _this.switchSettings(target); }));
            this.preferencesRenderers = this._register(this.instantiationService.createInstance(PreferencesRenderersController));
            this._register(this.preferencesRenderers.onDidFilterResultsCountChange(function (count) { return _this.showSearchResultsMessage(count); }));
        };
        PreferencesEditor.prototype.clearSearchResults = function () {
            if (this.searchWidget) {
                this.searchWidget.clear();
            }
        };
        PreferencesEditor.prototype.focusNextResult = function () {
            if (this.preferencesRenderers) {
                this.preferencesRenderers.focusNextPreference(true);
            }
        };
        PreferencesEditor.prototype.focusPreviousResult = function () {
            if (this.preferencesRenderers) {
                this.preferencesRenderers.focusNextPreference(false);
            }
        };
        PreferencesEditor.prototype.editFocusedPreference = function () {
            this.preferencesRenderers.editFocusedPreference();
        };
        PreferencesEditor.prototype.setInput = function (newInput, options) {
            var _this = this;
            this.defaultSettingsEditorContextKey.set(true);
            var oldInput = this.input;
            return _super.prototype.setInput.call(this, newInput, options).then(function () { return _this.updateInput(oldInput, newInput, options); });
        };
        PreferencesEditor.prototype.layout = function (dimension) {
            DOM.toggleClass(this.headerContainer, 'vertical-layout', dimension.width < 700);
            this.searchWidget.layout(dimension);
            var headerHeight = DOM.getTotalHeight(this.headerContainer);
            this.sideBySidePreferencesWidget.layout(new builder_1.Dimension(dimension.width, dimension.height - headerHeight));
        };
        PreferencesEditor.prototype.getControl = function () {
            return this.sideBySidePreferencesWidget.getControl();
        };
        PreferencesEditor.prototype.focus = function () {
            if (this.lastFocusedWidget) {
                this.lastFocusedWidget.focus();
            }
        };
        PreferencesEditor.prototype.focusSearch = function (filter) {
            if (filter) {
                this.searchWidget.setValue(filter);
            }
            this.searchWidget.focus();
        };
        PreferencesEditor.prototype.focusSettingsFileEditor = function () {
            if (this.sideBySidePreferencesWidget) {
                this.sideBySidePreferencesWidget.focus();
            }
        };
        PreferencesEditor.prototype.clearInput = function () {
            this.defaultSettingsEditorContextKey.set(false);
            this.sideBySidePreferencesWidget.clearInput();
            this.preferencesRenderers.onHidden();
            _super.prototype.clearInput.call(this);
        };
        PreferencesEditor.prototype.setEditorVisible = function (visible, position) {
            this.sideBySidePreferencesWidget.setEditorVisible(visible, position);
            _super.prototype.setEditorVisible.call(this, visible, position);
        };
        PreferencesEditor.prototype.changePosition = function (position) {
            this.sideBySidePreferencesWidget.changePosition(position);
            _super.prototype.changePosition.call(this, position);
        };
        PreferencesEditor.prototype.updateInput = function (oldInput, newInput, options) {
            var _this = this;
            return this.sideBySidePreferencesWidget.setInput(newInput.details, newInput.master, options).then(function (_a) {
                var defaultPreferencesRenderer = _a.defaultPreferencesRenderer, editablePreferencesRenderer = _a.editablePreferencesRenderer;
                _this.preferencesRenderers.defaultPreferencesRenderer = defaultPreferencesRenderer;
                _this.preferencesRenderers.editablePreferencesRenderer = editablePreferencesRenderer;
                _this.onInputChanged();
            });
        };
        PreferencesEditor.prototype.onInputChanged = function () {
            var _this = this;
            var query = this.searchWidget.getValue().trim();
            this.delayedFilterLogging.cancel();
            this.triggerSearch(query)
                .then(function () {
                var result = _this.preferencesRenderers.lastFilterResult;
                if (result) {
                    _this.delayedFilterLogging.trigger(function () { return _this.reportFilteringUsed(query, _this.preferencesRenderers.lastFilterResult); });
                }
            });
        };
        PreferencesEditor.prototype.triggerSearch = function (query) {
            var _this = this;
            if (query) {
                return winjs_base_1.TPromise.join([
                    this.localSearchDelayer.trigger(function () { return _this.preferencesRenderers.localFilterPreferences(query); }),
                    this.remoteSearchThrottle.trigger(function () { return _this.progressService.showWhile(_this.preferencesRenderers.remoteSearchPreferences(query), 500); })
                ]);
            }
            else {
                // When clearing the input, update immediately to clear it
                this.localSearchDelayer.cancel();
                this.preferencesRenderers.localFilterPreferences(query);
                this.remoteSearchThrottle.cancel();
                return this.preferencesRenderers.remoteSearchPreferences(query);
            }
        };
        PreferencesEditor.prototype.switchSettings = function (target) {
            var _this = this;
            // Focus the editor if this editor is not active editor
            if (this.editorService.getActiveEditor() !== this) {
                this.focus();
            }
            var promise = this.input && this.input.isDirty() ? this.input.save() : winjs_base_1.TPromise.as(true);
            promise.done(function (value) {
                if (target === configuration_1.ConfigurationTarget.USER) {
                    _this.preferencesService.switchSettings(configuration_1.ConfigurationTarget.USER, _this.preferencesService.userSettingsResource);
                }
                else if (target === configuration_1.ConfigurationTarget.WORKSPACE) {
                    _this.preferencesService.switchSettings(configuration_1.ConfigurationTarget.WORKSPACE, _this.preferencesService.workspaceSettingsResource);
                }
                else if (target instanceof uri_1.default) {
                    _this.preferencesService.switchSettings(configuration_1.ConfigurationTarget.WORKSPACE_FOLDER, target);
                }
            });
        };
        PreferencesEditor.prototype.showSearchResultsMessage = function (count) {
            var countValue = count.count;
            if (count.target) {
                this.sideBySidePreferencesWidget.setResultCount(count.target, count.count);
            }
            else if (this.searchWidget.getValue()) {
                if (countValue === 0) {
                    this.searchWidget.showMessage(nls.localize('noSettingsFound', "No Results"), countValue);
                }
                else if (countValue === 1) {
                    this.searchWidget.showMessage(nls.localize('oneSettingFound', "1 Setting Found"), countValue);
                }
                else {
                    this.searchWidget.showMessage(nls.localize('settingsFound', "{0} Settings Found", countValue), countValue);
                }
            }
            else {
                this.searchWidget.showMessage(nls.localize('totalSettingsMessage', "Total {0} Settings", countValue), countValue);
            }
        };
        PreferencesEditor.prototype._countById = function (settingsGroups) {
            var result = {};
            for (var _i = 0, settingsGroups_1 = settingsGroups; _i < settingsGroups_1.length; _i++) {
                var group = settingsGroups_1[_i];
                var i = 0;
                for (var _a = 0, _b = group.sections; _a < _b.length; _a++) {
                    var section = _b[_a];
                    i += section.settings.length;
                }
                result[group.id] = i;
            }
            return result;
        };
        PreferencesEditor.prototype.reportFilteringUsed = function (filter, filterResult) {
            if (filter && filter !== this._lastReportedFilter) {
                var metadata_1 = filterResult && filterResult.metadata;
                var counts = filterResult && this._countById(filterResult.filteredGroups);
                var durations_1;
                if (metadata_1) {
                    durations_1 = Object.create(null);
                    Object.keys(metadata_1).forEach(function (key) { return durations_1[key] = metadata_1[key].duration; });
                }
                var data = {
                    filter: filter,
                    durations: durations_1,
                    counts: counts,
                    requestCount: metadata_1 && metadata_1['nlpResult'] && metadata_1['nlpResult'].requestCount
                };
                /* __GDPR__
                    "defaultSettings.filter" : {
                        "filter": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "durations" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "counts" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "requestCount" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog('defaultSettings.filter', data);
                this._lastReportedFilter = filter;
            }
        };
        PreferencesEditor.ID = 'workbench.editor.preferencesEditor';
        PreferencesEditor = __decorate([
            __param(0, preferences_1.IPreferencesService),
            __param(1, telemetry_1.ITelemetryService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, contextkey_1.IContextKeyService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, themeService_1.IThemeService),
            __param(6, progress_1.IProgressService)
        ], PreferencesEditor);
        return PreferencesEditor;
    }(baseEditor_1.BaseEditor));
    exports.PreferencesEditor = PreferencesEditor;
    var SettingsNavigator = /** @class */ (function (_super) {
        __extends(SettingsNavigator, _super);
        function SettingsNavigator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SettingsNavigator.prototype.next = function () {
            return _super.prototype.next.call(this) || _super.prototype.first.call(this);
        };
        SettingsNavigator.prototype.previous = function () {
            return _super.prototype.previous.call(this) || _super.prototype.last.call(this);
        };
        SettingsNavigator.prototype.reset = function () {
            this.index = this.start - 1;
        };
        return SettingsNavigator;
    }(iterator_1.ArrayNavigator));
    var PreferencesRenderersController = /** @class */ (function (_super) {
        __extends(PreferencesRenderersController, _super);
        function PreferencesRenderersController(preferencesSearchService, telemetryService, preferencesService, workspaceContextService, logService) {
            var _this = _super.call(this) || this;
            _this.preferencesSearchService = preferencesSearchService;
            _this.telemetryService = telemetryService;
            _this.preferencesService = preferencesService;
            _this.workspaceContextService = workspaceContextService;
            _this.logService = logService;
            _this._defaultPreferencesRendererDisposables = [];
            _this._editablePreferencesRendererDisposables = [];
            _this._prefsModelsForSearch = new Map();
            _this._onDidFilterResultsCountChange = _this._register(new event_1.Emitter());
            _this.onDidFilterResultsCountChange = _this._onDidFilterResultsCountChange.event;
            return _this;
        }
        Object.defineProperty(PreferencesRenderersController.prototype, "lastFilterResult", {
            get: function () {
                return this._lastFilterResult;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PreferencesRenderersController.prototype, "defaultPreferencesRenderer", {
            get: function () {
                return this._defaultPreferencesRenderer;
            },
            set: function (defaultPreferencesRenderer) {
                var _this = this;
                if (this._defaultPreferencesRenderer !== defaultPreferencesRenderer) {
                    this._defaultPreferencesRenderer = defaultPreferencesRenderer;
                    this._defaultPreferencesRendererDisposables = lifecycle_1.dispose(this._defaultPreferencesRendererDisposables);
                    if (this._defaultPreferencesRenderer) {
                        this._defaultPreferencesRenderer.onUpdatePreference(function (_a) {
                            var key = _a.key, value = _a.value, source = _a.source;
                            _this._editablePreferencesRenderer.updatePreference(key, value, source);
                            _this._updatePreference(key, value, source);
                        }, this, this._defaultPreferencesRendererDisposables);
                        this._defaultPreferencesRenderer.onFocusPreference(function (preference) { return _this._focusPreference(preference, _this._editablePreferencesRenderer); }, this, this._defaultPreferencesRendererDisposables);
                        this._defaultPreferencesRenderer.onClearFocusPreference(function (preference) { return _this._clearFocus(preference, _this._editablePreferencesRenderer); }, this, this._defaultPreferencesRendererDisposables);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PreferencesRenderersController.prototype, "editablePreferencesRenderer", {
            get: function () {
                return this._editablePreferencesRenderer;
            },
            set: function (editableSettingsRenderer) {
                var _this = this;
                if (this._editablePreferencesRenderer !== editableSettingsRenderer) {
                    this._editablePreferencesRenderer = editableSettingsRenderer;
                    this._editablePreferencesRendererDisposables = lifecycle_1.dispose(this._editablePreferencesRendererDisposables);
                    if (this._editablePreferencesRenderer) {
                        this._editablePreferencesRenderer.preferencesModel
                            .onDidChangeGroups(this._onEditableContentDidChange, this, this._editablePreferencesRendererDisposables);
                        this._editablePreferencesRenderer.onUpdatePreference(function (_a) {
                            var key = _a.key, value = _a.value, source = _a.source;
                            return _this._updatePreference(key, value, source, true);
                        }, this, this._defaultPreferencesRendererDisposables);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        PreferencesRenderersController.prototype._onEditableContentDidChange = function () {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.localFilterPreferences(this._lastQuery, true)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.remoteSearchPreferences(this._lastQuery, true)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        PreferencesRenderersController.prototype.onHidden = function () {
            this._prefsModelsForSearch.forEach(function (model) { return model.dispose(); });
            this._prefsModelsForSearch = new Map();
        };
        PreferencesRenderersController.prototype.remoteSearchPreferences = function (query, updateCurrentResults) {
            var _this = this;
            if (this._remoteFilterInProgress && this._remoteFilterInProgress.cancel) {
                // Resolved/rejected promises have no .cancel()
                this._remoteFilterInProgress.cancel();
            }
            this._currentRemoteSearchProvider = (updateCurrentResults && this._currentRemoteSearchProvider) || this.preferencesSearchService.getRemoteSearchProvider(query);
            this._remoteFilterInProgress = this.filterOrSearchPreferences(query, this._currentRemoteSearchProvider, 'nlpResult', nls.localize('nlpResult', "Natural Language Results"), 1, updateCurrentResults);
            return this._remoteFilterInProgress.then(function () {
                _this._remoteFilterInProgress = null;
            }, function (err) {
                if (errors_1.isPromiseCanceledError(err)) {
                    return null;
                }
                else {
                    errors_1.onUnexpectedError(err);
                }
            });
        };
        PreferencesRenderersController.prototype.localFilterPreferences = function (query, updateCurrentResults) {
            if (this._settingsNavigator) {
                this._settingsNavigator.reset();
            }
            this._currentLocalSearchProvider = (updateCurrentResults && this._currentLocalSearchProvider) || this.preferencesSearchService.getLocalSearchProvider(query);
            return this.filterOrSearchPreferences(query, this._currentLocalSearchProvider, 'filterResult', nls.localize('filterResult', "Filtered Results"), 0, updateCurrentResults);
        };
        PreferencesRenderersController.prototype.filterOrSearchPreferences = function (query, searchProvider, groupId, groupLabel, groupOrder, editableContentOnly) {
            var _this = this;
            this._lastQuery = query;
            var filterPs = [this._filterOrSearchPreferences(query, this.editablePreferencesRenderer, searchProvider, groupId, groupLabel, groupOrder)];
            if (!editableContentOnly) {
                filterPs.push(this._filterOrSearchPreferences(query, this.defaultPreferencesRenderer, searchProvider, groupId, groupLabel, groupOrder));
            }
            filterPs.push(this.searchAllSettingsTargets(query, searchProvider, groupId, groupLabel, groupOrder));
            return winjs_base_1.TPromise.join(filterPs).then(function (results) {
                var editableFilterResult = results[0], defaultFilterResult = results[1];
                if (!defaultFilterResult && editableContentOnly) {
                    defaultFilterResult = _this.lastFilterResult;
                }
                _this.consolidateAndUpdate(defaultFilterResult, editableFilterResult);
                if (defaultFilterResult) {
                    _this._lastFilterResult = defaultFilterResult;
                }
            });
        };
        PreferencesRenderersController.prototype.searchAllSettingsTargets = function (query, searchProvider, groupId, groupLabel, groupOrder) {
            var searchPs = [
                this.searchSettingsTarget(query, searchProvider, configuration_1.ConfigurationTarget.WORKSPACE, groupId, groupLabel, groupOrder),
                this.searchSettingsTarget(query, searchProvider, configuration_1.ConfigurationTarget.USER, groupId, groupLabel, groupOrder)
            ];
            for (var _i = 0, _a = this.workspaceContextService.getWorkspace().folders; _i < _a.length; _i++) {
                var folder = _a[_i];
                var folderSettingsResource = this.preferencesService.getFolderSettingsResource(folder.uri);
                searchPs.push(this.searchSettingsTarget(query, searchProvider, folderSettingsResource, groupId, groupLabel, groupOrder));
            }
            return winjs_base_1.TPromise.join(searchPs).then(function () { });
        };
        PreferencesRenderersController.prototype.searchSettingsTarget = function (query, provider, target, groupId, groupLabel, groupOrder) {
            var _this = this;
            if (!query) {
                // Don't open the other settings targets when query is empty
                this._onDidFilterResultsCountChange.fire({ target: target, count: 0 });
                return winjs_base_1.TPromise.wrap(null);
            }
            return this.getPreferencesEditorModel(target).then(function (model) {
                return model && _this._filterOrSearchPreferencesModel('', model, provider, groupId, groupLabel, groupOrder);
            }).then(function (result) {
                var count = result ? _this._flatten(result.filteredGroups).length : 0;
                _this._onDidFilterResultsCountChange.fire({ target: target, count: count });
            }, function (err) {
                if (!errors_1.isPromiseCanceledError(err)) {
                    return winjs_base_1.TPromise.wrapError(err);
                }
                return null;
            });
        };
        PreferencesRenderersController.prototype.getPreferencesEditorModel = function (target) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var resource, targetKey, model, _a, e_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            resource = target === configuration_1.ConfigurationTarget.USER ? this.preferencesService.userSettingsResource :
                                target === configuration_1.ConfigurationTarget.WORKSPACE ? this.preferencesService.workspaceSettingsResource :
                                    target;
                            if (!resource) {
                                return [2 /*return*/, null];
                            }
                            targetKey = resource.toString();
                            if (!!this._prefsModelsForSearch.has(targetKey)) return [3 /*break*/, 4];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            _a = this._register;
                            return [4 /*yield*/, this.preferencesService.createPreferencesEditorModel(resource)];
                        case 2:
                            model = _a.apply(this, [_b.sent()]);
                            this._prefsModelsForSearch.set(targetKey, model);
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _b.sent();
                            // Will throw when the settings file doesn't exist.
                            return [2 /*return*/, null];
                        case 4: return [2 /*return*/, this._prefsModelsForSearch.get(targetKey)];
                    }
                });
            });
        };
        PreferencesRenderersController.prototype.focusNextPreference = function (forward) {
            if (forward === void 0) { forward = true; }
            if (!this._settingsNavigator) {
                return;
            }
            var setting = forward ? this._settingsNavigator.next() : this._settingsNavigator.previous();
            this._focusPreference(setting, this._defaultPreferencesRenderer);
            this._focusPreference(setting, this._editablePreferencesRenderer);
        };
        PreferencesRenderersController.prototype.editFocusedPreference = function () {
            if (!this._settingsNavigator || !this._settingsNavigator.current()) {
                return;
            }
            var setting = this._settingsNavigator.current();
            var shownInEditableRenderer = this._editablePreferencesRenderer.editPreference(setting);
            if (!shownInEditableRenderer) {
                this.defaultPreferencesRenderer.editPreference(setting);
            }
        };
        PreferencesRenderersController.prototype._filterOrSearchPreferences = function (filter, preferencesRenderer, provider, groupId, groupLabel, groupOrder) {
            if (!preferencesRenderer) {
                return winjs_base_1.TPromise.wrap(null);
            }
            var model = preferencesRenderer.preferencesModel;
            return this._filterOrSearchPreferencesModel(filter, model, provider, groupId, groupLabel, groupOrder).then(function (filterResult) {
                preferencesRenderer.filterPreferences(filterResult);
                return filterResult;
            });
        };
        PreferencesRenderersController.prototype._filterOrSearchPreferencesModel = function (filter, model, provider, groupId, groupLabel, groupOrder) {
            var _this = this;
            var searchP = provider ? provider.searchModel(model) : winjs_base_1.TPromise.wrap(null);
            return searchP
                .then(null, function (err) {
                if (errors_1.isPromiseCanceledError(err)) {
                    return winjs_base_1.TPromise.wrapError(err);
                }
                else {
                    /* __GDPR__
                        "defaultSettings.searchError" : {
                            "message": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "filter": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                        }
                    */
                    var message = errors_1.getErrorMessage(err).trim();
                    if (message && message !== 'Error') {
                        // "Error" = any generic network error
                        _this.telemetryService.publicLog('defaultSettings.searchError', { message: message, filter: filter });
                        _this.logService.info('Setting search error: ' + message);
                    }
                    return null;
                }
            })
                .then(function (searchResult) {
                var filterResult = searchResult ?
                    model.updateResultGroup(groupId, {
                        id: groupId,
                        label: groupLabel,
                        result: searchResult,
                        order: groupOrder
                    }) :
                    model.updateResultGroup(groupId, null);
                if (filterResult) {
                    filterResult.query = filter;
                }
                return filterResult;
            });
        };
        PreferencesRenderersController.prototype.consolidateAndUpdate = function (defaultFilterResult, editableFilterResult) {
            var defaultPreferencesFilteredGroups = defaultFilterResult ? defaultFilterResult.filteredGroups : this._getAllPreferences(this._defaultPreferencesRenderer);
            var editablePreferencesFilteredGroups = editableFilterResult ? editableFilterResult.filteredGroups : this._getAllPreferences(this._editablePreferencesRenderer);
            var consolidatedSettings = this._consolidateSettings(editablePreferencesFilteredGroups, defaultPreferencesFilteredGroups);
            // Maintain the current navigation position when updating SettingsNavigator
            var current = this._settingsNavigator && this._settingsNavigator.current();
            var navigatorSettings = this._lastQuery ? consolidatedSettings : [];
            var currentIndex = current ?
                arrays.firstIndex(navigatorSettings, function (s) { return s.key === current.key; }) :
                -1;
            this._settingsNavigator = new SettingsNavigator(navigatorSettings, Math.max(currentIndex, 0));
            if (currentIndex >= 0) {
                this._settingsNavigator.next();
                var newCurrent = this._settingsNavigator.current();
                this._focusPreference(newCurrent, this._defaultPreferencesRenderer);
                this._focusPreference(newCurrent, this._editablePreferencesRenderer);
            }
            var totalCount = consolidatedSettings.length;
            this._onDidFilterResultsCountChange.fire({ count: totalCount });
        };
        PreferencesRenderersController.prototype._getAllPreferences = function (preferencesRenderer) {
            return preferencesRenderer ? preferencesRenderer.preferencesModel.settingsGroups : [];
        };
        PreferencesRenderersController.prototype._focusPreference = function (preference, preferencesRenderer) {
            if (preference && preferencesRenderer) {
                preferencesRenderer.focusPreference(preference);
            }
        };
        PreferencesRenderersController.prototype._clearFocus = function (preference, preferencesRenderer) {
            if (preference && preferencesRenderer) {
                preferencesRenderer.clearFocus(preference);
            }
        };
        PreferencesRenderersController.prototype._updatePreference = function (key, value, source, fromEditableSettings) {
            var data = {
                userConfigurationKeys: [key]
            };
            if (this.lastFilterResult) {
                data['query'] = this.lastFilterResult.query;
                data['editableSide'] = !!fromEditableSettings;
                var nlpMetadata_1 = this.lastFilterResult.metadata && this.lastFilterResult.metadata['nlpResult'];
                if (nlpMetadata_1) {
                    var sortedKeys = Object.keys(nlpMetadata_1.scoredResults).sort(function (a, b) { return nlpMetadata_1.scoredResults[b].score - nlpMetadata_1.scoredResults[a].score; });
                    var suffix_1 = '##' + key;
                    data['nlpIndex'] = arrays.firstIndex(sortedKeys, function (key) { return strings.endsWith(key, suffix_1); });
                }
                var settingLocation = this._findSetting(this.lastFilterResult, key);
                if (settingLocation) {
                    data['groupId'] = this.lastFilterResult.filteredGroups[settingLocation.groupIdx].id;
                    data['displayIdx'] = settingLocation.overallSettingIdx;
                }
            }
            /* __GDPR__
                "defaultSettingsActions.copySetting" : {
                    "userConfigurationKeys" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "query" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "nlpIndex" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "groupId" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "displayIdx" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "editableSide" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('defaultSettingsActions.copySetting', data);
        };
        PreferencesRenderersController.prototype._findSetting = function (filterResult, key) {
            var overallSettingIdx = 0;
            for (var groupIdx = 0; groupIdx < filterResult.filteredGroups.length; groupIdx++) {
                var group = filterResult.filteredGroups[groupIdx];
                for (var settingIdx = 0; settingIdx < group.sections[0].settings.length; settingIdx++) {
                    var setting = group.sections[0].settings[settingIdx];
                    if (key === setting.key) {
                        return { groupIdx: groupIdx, settingIdx: settingIdx, overallSettingIdx: overallSettingIdx };
                    }
                    overallSettingIdx++;
                }
            }
            return null;
        };
        PreferencesRenderersController.prototype._consolidateSettings = function (editableSettingsGroups, defaultSettingsGroups) {
            var defaultSettings = this._flatten(defaultSettingsGroups);
            var editableSettings = this._flatten(editableSettingsGroups).filter(function (secondarySetting) { return defaultSettings.every(function (primarySetting) { return primarySetting.key !== secondarySetting.key; }); });
            return defaultSettings.concat(editableSettings);
        };
        PreferencesRenderersController.prototype._flatten = function (settingsGroups) {
            var settings = [];
            for (var _i = 0, settingsGroups_2 = settingsGroups; _i < settingsGroups_2.length; _i++) {
                var group = settingsGroups_2[_i];
                for (var _a = 0, _b = group.sections; _a < _b.length; _a++) {
                    var section = _b[_a];
                    settings.push.apply(settings, section.settings);
                }
            }
            return settings;
        };
        PreferencesRenderersController.prototype.dispose = function () {
            lifecycle_1.dispose(this._defaultPreferencesRendererDisposables);
            lifecycle_1.dispose(this._editablePreferencesRendererDisposables);
            _super.prototype.dispose.call(this);
        };
        PreferencesRenderersController = __decorate([
            __param(0, preferences_1.IPreferencesSearchService),
            __param(1, telemetry_1.ITelemetryService),
            __param(2, preferences_1.IPreferencesService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, log_1.ILogService)
        ], PreferencesRenderersController);
        return PreferencesRenderersController;
    }(lifecycle_1.Disposable));
    var SideBySidePreferencesWidget = /** @class */ (function (_super) {
        __extends(SideBySidePreferencesWidget, _super);
        function SideBySidePreferencesWidget(parent, instantiationService, themeService, workspaceContextService, preferencesService) {
            var _this = _super.call(this) || this;
            _this.instantiationService = instantiationService;
            _this.themeService = themeService;
            _this.workspaceContextService = workspaceContextService;
            _this.preferencesService = preferencesService;
            _this._onFocus = new event_1.Emitter();
            _this.onFocus = _this._onFocus.event;
            _this._onDidSettingsTargetChange = new event_1.Emitter();
            _this.onDidSettingsTargetChange = _this._onDidSettingsTargetChange.event;
            _this.create(parent);
            return _this;
        }
        SideBySidePreferencesWidget.prototype.create = function (parentElement) {
            var _this = this;
            DOM.addClass(parentElement, 'side-by-side-preferences-editor');
            this.createSash(parentElement);
            this.defaultPreferencesEditorContainer = DOM.append(parentElement, DOM.$('.default-preferences-editor-container'));
            this.defaultPreferencesEditorContainer.style.position = 'absolute';
            var defaultPreferencesHeaderContainer = DOM.append(this.defaultPreferencesEditorContainer, DOM.$('.preferences-header-container'));
            defaultPreferencesHeaderContainer.style.height = '30px';
            defaultPreferencesHeaderContainer.style.marginBottom = '4px';
            this.defaultPreferencesHeader = DOM.append(defaultPreferencesHeaderContainer, DOM.$('div.default-preferences-header'));
            this.defaultPreferencesHeader.textContent = nls.localize('defaultSettings', "Default Settings");
            this.defaultPreferencesEditor = this._register(this.instantiationService.createInstance(DefaultPreferencesEditor));
            this.defaultPreferencesEditor.create(new builder_1.Builder(this.defaultPreferencesEditorContainer));
            this.defaultPreferencesEditor.setVisible(true);
            this.defaultPreferencesEditor.getControl().onDidFocusEditor(function () { return _this.lastFocusedEditor = _this.defaultPreferencesEditor; });
            this.editablePreferencesEditorContainer = DOM.append(parentElement, DOM.$('.editable-preferences-editor-container'));
            this.editablePreferencesEditorContainer.style.position = 'absolute';
            var editablePreferencesHeaderContainer = DOM.append(this.editablePreferencesEditorContainer, DOM.$('.preferences-header-container'));
            editablePreferencesHeaderContainer.style.height = '30px';
            editablePreferencesHeaderContainer.style.marginBottom = '4px';
            this.settingsTargetsWidget = this._register(this.instantiationService.createInstance(preferencesWidgets_1.SettingsTargetsWidget, editablePreferencesHeaderContainer));
            this._register(this.settingsTargetsWidget.onDidTargetChange(function (target) { return _this._onDidSettingsTargetChange.fire(target); }));
            this._register(styler_1.attachStylerCallback(this.themeService, { scrollbarShadow: colorRegistry_1.scrollbarShadow }, function (colors) {
                var shadow = colors.scrollbarShadow ? colors.scrollbarShadow.toString() : null;
                if (shadow) {
                    _this.editablePreferencesEditorContainer.style.boxShadow = "-6px 0 5px -5px " + shadow;
                }
                else {
                    _this.editablePreferencesEditorContainer.style.boxShadow = null;
                }
            }));
            var focusTracker = this._register(DOM.trackFocus(parentElement));
            this._register(focusTracker.onDidFocus(function () { return _this._onFocus.fire(); }));
        };
        SideBySidePreferencesWidget.prototype.setInput = function (defaultPreferencesEditorInput, editablePreferencesEditorInput, options) {
            var _this = this;
            this.getOrCreateEditablePreferencesEditor(editablePreferencesEditorInput);
            this.settingsTargetsWidget.settingsTarget = this.getSettingsTarget(editablePreferencesEditorInput.getResource());
            this.dolayout(this.sash.getVerticalSashLeft());
            return winjs_base_1.TPromise.join([this.updateInput(this.defaultPreferencesEditor, defaultPreferencesEditorInput, DefaultSettingsEditorContribution.ID, editablePreferencesEditorInput.getResource(), options),
                this.updateInput(this.editablePreferencesEditor, editablePreferencesEditorInput, SettingsEditorContribution.ID, defaultPreferencesEditorInput.getResource(), options)])
                .then(function (_a) {
                var defaultPreferencesRenderer = _a[0], editablePreferencesRenderer = _a[1];
                _this.defaultPreferencesHeader.textContent = defaultPreferencesRenderer && defaultPreferencesRenderer.preferencesModel.configurationScope === configurationRegistry_1.ConfigurationScope.RESOURCE ? nls.localize('defaultFolderSettings', "Default Folder Settings") : nls.localize('defaultSettings', "Default Settings");
                return { defaultPreferencesRenderer: defaultPreferencesRenderer, editablePreferencesRenderer: editablePreferencesRenderer };
            });
        };
        SideBySidePreferencesWidget.prototype.setResultCount = function (settingsTarget, count) {
            this.settingsTargetsWidget.setResultCount(settingsTarget, count);
        };
        SideBySidePreferencesWidget.prototype.layout = function (dimension) {
            this.dimension = dimension;
            this.sash.setDimenesion(this.dimension);
        };
        SideBySidePreferencesWidget.prototype.focus = function () {
            if (this.lastFocusedEditor) {
                this.lastFocusedEditor.focus();
            }
        };
        SideBySidePreferencesWidget.prototype.getControl = function () {
            return this.editablePreferencesEditor ? this.editablePreferencesEditor.getControl() : null;
        };
        SideBySidePreferencesWidget.prototype.clearInput = function () {
            if (this.defaultPreferencesEditor) {
                this.defaultPreferencesEditor.clearInput();
            }
            if (this.editablePreferencesEditor) {
                this.editablePreferencesEditor.clearInput();
            }
        };
        SideBySidePreferencesWidget.prototype.setEditorVisible = function (visible, position) {
            if (this.editablePreferencesEditor) {
                this.editablePreferencesEditor.setVisible(visible, position);
            }
        };
        SideBySidePreferencesWidget.prototype.changePosition = function (position) {
            if (this.editablePreferencesEditor) {
                this.editablePreferencesEditor.changePosition(position);
            }
        };
        SideBySidePreferencesWidget.prototype.getOrCreateEditablePreferencesEditor = function (editorInput) {
            var _this = this;
            if (this.editablePreferencesEditor) {
                return this.editablePreferencesEditor;
            }
            var descriptor = platform_1.Registry.as(editor_2.Extensions.Editors).getEditor(editorInput);
            var editor = descriptor.instantiate(this.instantiationService);
            this.editablePreferencesEditor = editor;
            this.editablePreferencesEditor.create(new builder_1.Builder(this.editablePreferencesEditorContainer));
            this.editablePreferencesEditor.setVisible(true);
            this.editablePreferencesEditor.getControl().onDidFocusEditor(function () { return _this.lastFocusedEditor = _this.editablePreferencesEditor; });
            this.lastFocusedEditor = this.editablePreferencesEditor;
            return editor;
        };
        SideBySidePreferencesWidget.prototype.updateInput = function (editor, input, editorContributionId, associatedPreferencesModelUri, options) {
            return editor.setInput(input, options)
                .then(function () { return editor.getControl().getContribution(editorContributionId).updatePreferencesRenderer(associatedPreferencesModelUri); });
        };
        SideBySidePreferencesWidget.prototype.createSash = function (parentElement) {
            var _this = this;
            this.sash = this._register(new sash_1.VSash(parentElement, 220));
            this._register(this.sash.onPositionChange(function (position) { return _this.dolayout(position); }));
        };
        SideBySidePreferencesWidget.prototype.dolayout = function (splitPoint) {
            if (!this.editablePreferencesEditor || !this.dimension) {
                return;
            }
            var masterEditorWidth = this.dimension.width - splitPoint;
            var detailsEditorWidth = this.dimension.width - masterEditorWidth;
            this.defaultPreferencesEditorContainer.style.width = detailsEditorWidth + "px";
            this.defaultPreferencesEditorContainer.style.height = this.dimension.height + "px";
            this.defaultPreferencesEditorContainer.style.left = '0px';
            this.editablePreferencesEditorContainer.style.width = masterEditorWidth + "px";
            this.editablePreferencesEditorContainer.style.height = this.dimension.height + "px";
            this.editablePreferencesEditorContainer.style.left = splitPoint + "px";
            this.defaultPreferencesEditor.layout(new builder_1.Dimension(detailsEditorWidth, this.dimension.height - 34 /* height of header container */));
            this.editablePreferencesEditor.layout(new builder_1.Dimension(masterEditorWidth, this.dimension.height - 34 /* height of header container */));
        };
        SideBySidePreferencesWidget.prototype.getSettingsTarget = function (resource) {
            if (this.preferencesService.userSettingsResource.toString() === resource.toString()) {
                return configuration_1.ConfigurationTarget.USER;
            }
            var workspaceSettingsResource = this.preferencesService.workspaceSettingsResource;
            if (workspaceSettingsResource && workspaceSettingsResource.toString() === resource.toString()) {
                return configuration_1.ConfigurationTarget.WORKSPACE;
            }
            var folder = this.workspaceContextService.getWorkspaceFolder(resource);
            if (folder) {
                return folder.uri;
            }
            return configuration_1.ConfigurationTarget.USER;
        };
        SideBySidePreferencesWidget.prototype.disposeEditors = function () {
            if (this.defaultPreferencesEditor) {
                this.defaultPreferencesEditor.dispose();
                this.defaultPreferencesEditor = null;
            }
            if (this.editablePreferencesEditor) {
                this.editablePreferencesEditor.dispose();
                this.editablePreferencesEditor = null;
            }
        };
        SideBySidePreferencesWidget.prototype.dispose = function () {
            this.disposeEditors();
            _super.prototype.dispose.call(this);
        };
        SideBySidePreferencesWidget = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, themeService_1.IThemeService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, preferences_1.IPreferencesService)
        ], SideBySidePreferencesWidget);
        return SideBySidePreferencesWidget;
    }(widget_1.Widget));
    var DefaultPreferencesEditor = /** @class */ (function (_super) {
        __extends(DefaultPreferencesEditor, _super);
        function DefaultPreferencesEditor(telemetryService, instantiationService, storageService, configurationService, themeService, textFileService, editorGroupService) {
            return _super.call(this, DefaultPreferencesEditor.ID, telemetryService, instantiationService, storageService, configurationService, themeService, textFileService, editorGroupService) || this;
        }
        DefaultPreferencesEditor.prototype.createEditorControl = function (parent, configuration) {
            var _this = this;
            var editor = this.instantiationService.createInstance(DefaultPreferencesCodeEditor, parent.getHTMLElement(), configuration);
            // Inform user about editor being readonly if user starts type
            this.toUnbind.push(editor.onDidType(function () { return _this.showReadonlyHint(editor); }));
            this.toUnbind.push(editor.onDidPaste(function () { return _this.showReadonlyHint(editor); }));
            return editor;
        };
        DefaultPreferencesEditor.prototype.showReadonlyHint = function (editor) {
            var messageController = messageController_1.MessageController.get(editor);
            if (!messageController.isVisible()) {
                messageController.showMessage(nls.localize('defaultEditorReadonly', "Edit in the right hand side editor to override defaults."), editor.getSelection().getPosition());
            }
        };
        DefaultPreferencesEditor.prototype.getConfigurationOverrides = function () {
            var options = _super.prototype.getConfigurationOverrides.call(this);
            options.readOnly = true;
            if (this.input) {
                options.lineNumbers = 'off';
                options.renderLineHighlight = 'none';
                options.scrollBeyondLastLine = false;
                options.folding = false;
                options.renderWhitespace = 'none';
                options.wordWrap = 'on';
                options.renderIndentGuides = false;
                options.rulers = [];
                options.glyphMargin = true;
                options.minimap = {
                    enabled: false
                };
            }
            return options;
        };
        DefaultPreferencesEditor.prototype.setInput = function (input, options) {
            var _this = this;
            return _super.prototype.setInput.call(this, input, options)
                .then(function () { return _this.input.resolve()
                .then(function (editorModel) { return editorModel.load(); })
                .then(function (editorModel) { return _this.getControl().setModel(editorModel.textEditorModel); }); });
        };
        DefaultPreferencesEditor.prototype.clearInput = function () {
            // Clear Model
            this.getControl().setModel(null);
            // Pass to super
            _super.prototype.clearInput.call(this);
        };
        DefaultPreferencesEditor.prototype.layout = function (dimension) {
            this.getControl().layout(dimension);
        };
        DefaultPreferencesEditor.prototype.getAriaLabel = function () {
            return nls.localize('preferencesAriaLabel', "Default preferences. Readonly text editor.");
        };
        DefaultPreferencesEditor.ID = 'workbench.editor.defaultPreferences';
        DefaultPreferencesEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, storage_1.IStorageService),
            __param(3, resourceConfiguration_1.ITextResourceConfigurationService),
            __param(4, themeService_1.IThemeService),
            __param(5, textfiles_1.ITextFileService),
            __param(6, groupService_1.IEditorGroupService)
        ], DefaultPreferencesEditor);
        return DefaultPreferencesEditor;
    }(textEditor_1.BaseTextEditor));
    exports.DefaultPreferencesEditor = DefaultPreferencesEditor;
    var DefaultPreferencesCodeEditor = /** @class */ (function (_super) {
        __extends(DefaultPreferencesCodeEditor, _super);
        function DefaultPreferencesCodeEditor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DefaultPreferencesCodeEditor.prototype._getContributions = function () {
            var contributions = _super.prototype._getContributions.call(this);
            var skipContributions = [folding_1.FoldingController.prototype, multicursor_1.SelectionHighlighter.prototype, findController_1.FindController.prototype];
            contributions = contributions.filter(function (c) { return skipContributions.indexOf(c.prototype) === -1; });
            contributions.push(DefaultSettingsEditorContribution);
            return contributions;
        };
        return DefaultPreferencesCodeEditor;
    }(codeEditor_1.CodeEditor));
    var AbstractSettingsEditorContribution = /** @class */ (function (_super) {
        __extends(AbstractSettingsEditorContribution, _super);
        function AbstractSettingsEditorContribution(editor, instantiationService, preferencesService, workspaceContextService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.instantiationService = instantiationService;
            _this.preferencesService = preferencesService;
            _this.workspaceContextService = workspaceContextService;
            _this._register(_this.editor.onDidChangeModel(function () { return _this._onModelChanged(); }));
            return _this;
        }
        AbstractSettingsEditorContribution.prototype.updatePreferencesRenderer = function (associatedPreferencesModelUri) {
            var _this = this;
            if (!this.preferencesRendererCreationPromise) {
                this.preferencesRendererCreationPromise = this._createPreferencesRenderer();
            }
            if (this.preferencesRendererCreationPromise) {
                return this._hasAssociatedPreferencesModelChanged(associatedPreferencesModelUri)
                    .then(function (changed) { return changed ? _this._updatePreferencesRenderer(associatedPreferencesModelUri) : _this.preferencesRendererCreationPromise; });
            }
            return winjs_base_1.TPromise.as(null);
        };
        AbstractSettingsEditorContribution.prototype._onModelChanged = function () {
            var model = this.editor.getModel();
            this.disposePreferencesRenderer();
            if (model) {
                this.preferencesRendererCreationPromise = this._createPreferencesRenderer();
            }
        };
        AbstractSettingsEditorContribution.prototype._hasAssociatedPreferencesModelChanged = function (associatedPreferencesModelUri) {
            return this.preferencesRendererCreationPromise.then(function (preferencesRenderer) {
                return !(preferencesRenderer && preferencesRenderer.getAssociatedPreferencesModel() && preferencesRenderer.getAssociatedPreferencesModel().uri.toString() === associatedPreferencesModelUri.toString());
            });
        };
        AbstractSettingsEditorContribution.prototype._updatePreferencesRenderer = function (associatedPreferencesModelUri) {
            var _this = this;
            return this.preferencesService.createPreferencesEditorModel(associatedPreferencesModelUri)
                .then(function (associatedPreferencesEditorModel) {
                return _this.preferencesRendererCreationPromise.then(function (preferencesRenderer) {
                    if (preferencesRenderer) {
                        var associatedPreferencesModel = preferencesRenderer.getAssociatedPreferencesModel();
                        if (associatedPreferencesModel) {
                            associatedPreferencesModel.dispose();
                        }
                        preferencesRenderer.setAssociatedPreferencesModel(associatedPreferencesEditorModel);
                    }
                    return preferencesRenderer;
                });
            });
        };
        AbstractSettingsEditorContribution.prototype.disposePreferencesRenderer = function () {
            if (this.preferencesRendererCreationPromise) {
                this.preferencesRendererCreationPromise.then(function (preferencesRenderer) {
                    if (preferencesRenderer) {
                        var associatedPreferencesModel = preferencesRenderer.getAssociatedPreferencesModel();
                        if (associatedPreferencesModel) {
                            associatedPreferencesModel.dispose();
                        }
                        preferencesRenderer.preferencesModel.dispose();
                        preferencesRenderer.dispose();
                    }
                });
                this.preferencesRendererCreationPromise = winjs_base_1.TPromise.as(null);
            }
        };
        AbstractSettingsEditorContribution.prototype.dispose = function () {
            this.disposePreferencesRenderer();
            _super.prototype.dispose.call(this);
        };
        AbstractSettingsEditorContribution = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, preferences_1.IPreferencesService),
            __param(3, workspace_1.IWorkspaceContextService)
        ], AbstractSettingsEditorContribution);
        return AbstractSettingsEditorContribution;
    }(lifecycle_1.Disposable));
    var DefaultSettingsEditorContribution = /** @class */ (function (_super) {
        __extends(DefaultSettingsEditorContribution, _super);
        function DefaultSettingsEditorContribution() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DefaultSettingsEditorContribution.prototype.getId = function () {
            return DefaultSettingsEditorContribution.ID;
        };
        DefaultSettingsEditorContribution.prototype._createPreferencesRenderer = function () {
            var _this = this;
            return this.preferencesService.createPreferencesEditorModel(this.editor.getModel().uri)
                .then(function (editorModel) {
                if (editorModel instanceof preferencesModels_1.DefaultSettingsEditorModel && _this.editor.getModel()) {
                    var preferencesRenderer = _this.instantiationService.createInstance(preferencesRenderers_1.DefaultSettingsRenderer, _this.editor, editorModel);
                    preferencesRenderer.render();
                    return preferencesRenderer;
                }
                return null;
            });
        };
        DefaultSettingsEditorContribution.ID = 'editor.contrib.defaultsettings';
        return DefaultSettingsEditorContribution;
    }(AbstractSettingsEditorContribution));
    var SettingsEditorContribution = /** @class */ (function (_super) {
        __extends(SettingsEditorContribution, _super);
        function SettingsEditorContribution(editor, instantiationService, preferencesService, workspaceContextService) {
            var _this = _super.call(this, editor, instantiationService, preferencesService, workspaceContextService) || this;
            _this._register(_this.workspaceContextService.onDidChangeWorkbenchState(function () { return _this._onModelChanged(); }));
            return _this;
        }
        SettingsEditorContribution.prototype.getId = function () {
            return SettingsEditorContribution.ID;
        };
        SettingsEditorContribution.prototype._createPreferencesRenderer = function () {
            var _this = this;
            if (this.isSettingsModel()) {
                return this.preferencesService.createPreferencesEditorModel(this.editor.getModel().uri)
                    .then(function (settingsModel) {
                    if (settingsModel instanceof preferencesModels_1.SettingsEditorModel && _this.editor.getModel()) {
                        switch (settingsModel.configurationTarget) {
                            case configuration_1.ConfigurationTarget.USER:
                                return _this.instantiationService.createInstance(preferencesRenderers_1.UserSettingsRenderer, _this.editor, settingsModel);
                            case configuration_1.ConfigurationTarget.WORKSPACE:
                                return _this.instantiationService.createInstance(preferencesRenderers_1.WorkspaceSettingsRenderer, _this.editor, settingsModel);
                            case configuration_1.ConfigurationTarget.WORKSPACE_FOLDER:
                                return _this.instantiationService.createInstance(preferencesRenderers_1.FolderSettingsRenderer, _this.editor, settingsModel);
                        }
                    }
                    return null;
                })
                    .then(function (preferencesRenderer) {
                    if (preferencesRenderer) {
                        preferencesRenderer.render();
                    }
                    return preferencesRenderer;
                });
            }
            return null;
        };
        SettingsEditorContribution.prototype.isSettingsModel = function () {
            var model = this.editor.getModel();
            if (!model) {
                return false;
            }
            if (this.preferencesService.userSettingsResource && this.preferencesService.userSettingsResource.toString() === model.uri.toString()) {
                return true;
            }
            if (this.preferencesService.workspaceSettingsResource && this.preferencesService.workspaceSettingsResource.toString() === model.uri.toString()) {
                return true;
            }
            for (var _i = 0, _a = this.workspaceContextService.getWorkspace().folders; _i < _a.length; _i++) {
                var folder = _a[_i];
                var folderSettingsResource = this.preferencesService.getFolderSettingsResource(folder.uri);
                if (folderSettingsResource && folderSettingsResource.toString() === model.uri.toString()) {
                    return true;
                }
            }
            return false;
        };
        SettingsEditorContribution.ID = 'editor.contrib.settings';
        SettingsEditorContribution = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, preferences_1.IPreferencesService),
            __param(3, workspace_1.IWorkspaceContextService)
        ], SettingsEditorContribution);
        return SettingsEditorContribution;
    }(AbstractSettingsEditorContribution));
    editorExtensions_1.registerEditorContribution(SettingsEditorContribution);
    var SettingsCommand = /** @class */ (function (_super) {
        __extends(SettingsCommand, _super);
        function SettingsCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SettingsCommand.prototype.getPreferencesEditor = function (accessor) {
            var activeEditor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            if (activeEditor instanceof PreferencesEditor) {
                return activeEditor;
            }
            return null;
        };
        return SettingsCommand;
    }(editorExtensions_1.Command));
    var StartSearchDefaultSettingsCommand = /** @class */ (function (_super) {
        __extends(StartSearchDefaultSettingsCommand, _super);
        function StartSearchDefaultSettingsCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StartSearchDefaultSettingsCommand.prototype.runCommand = function (accessor, args) {
            var preferencesEditor = this.getPreferencesEditor(accessor);
            if (preferencesEditor) {
                preferencesEditor.focusSearch();
            }
        };
        return StartSearchDefaultSettingsCommand;
    }(SettingsCommand));
    var command = new StartSearchDefaultSettingsCommand({
        id: preferences_1.SETTINGS_EDITOR_COMMAND_SEARCH,
        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR),
        kbOpts: { primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */ }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(command.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
    var FocusSettingsFileEditorCommand = /** @class */ (function (_super) {
        __extends(FocusSettingsFileEditorCommand, _super);
        function FocusSettingsFileEditorCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FocusSettingsFileEditorCommand.prototype.runCommand = function (accessor, args) {
            var preferencesEditor = this.getPreferencesEditor(accessor);
            if (preferencesEditor) {
                preferencesEditor.focusSettingsFileEditor();
            }
        };
        return FocusSettingsFileEditorCommand;
    }(SettingsCommand));
    var focusSettingsFileEditorCommand = new FocusSettingsFileEditorCommand({
        id: preferences_1.SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
        precondition: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS,
        kbOpts: { primary: 18 /* DownArrow */ }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(focusSettingsFileEditorCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
    var ClearSearchResultsCommand = /** @class */ (function (_super) {
        __extends(ClearSearchResultsCommand, _super);
        function ClearSearchResultsCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ClearSearchResultsCommand.prototype.runCommand = function (accessor, args) {
            var preferencesEditor = this.getPreferencesEditor(accessor);
            if (preferencesEditor) {
                preferencesEditor.clearSearchResults();
            }
        };
        return ClearSearchResultsCommand;
    }(SettingsCommand));
    var clearSearchResultsCommand = new ClearSearchResultsCommand({
        id: preferences_1.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
        precondition: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS,
        kbOpts: { primary: 9 /* Escape */ }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(clearSearchResultsCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
    var FocusNextSearchResultCommand = /** @class */ (function (_super) {
        __extends(FocusNextSearchResultCommand, _super);
        function FocusNextSearchResultCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FocusNextSearchResultCommand.prototype.runCommand = function (accessor, args) {
            var preferencesEditor = this.getPreferencesEditor(accessor);
            if (preferencesEditor) {
                preferencesEditor.focusNextResult();
            }
        };
        return FocusNextSearchResultCommand;
    }(SettingsCommand));
    var focusNextSearchResultCommand = new FocusNextSearchResultCommand({
        id: preferences_1.SETTINGS_EDITOR_COMMAND_FOCUS_NEXT_SETTING,
        precondition: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS,
        kbOpts: { primary: 3 /* Enter */ }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(focusNextSearchResultCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
    var FocusPreviousSearchResultCommand = /** @class */ (function (_super) {
        __extends(FocusPreviousSearchResultCommand, _super);
        function FocusPreviousSearchResultCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FocusPreviousSearchResultCommand.prototype.runCommand = function (accessor, args) {
            var preferencesEditor = this.getPreferencesEditor(accessor);
            if (preferencesEditor) {
                preferencesEditor.focusPreviousResult();
            }
        };
        return FocusPreviousSearchResultCommand;
    }(SettingsCommand));
    var focusPreviousSearchResultCommand = new FocusPreviousSearchResultCommand({
        id: preferences_1.SETTINGS_EDITOR_COMMAND_FOCUS_PREVIOUS_SETTING,
        precondition: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS,
        kbOpts: { primary: 1024 /* Shift */ | 3 /* Enter */ }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(focusPreviousSearchResultCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
    var EditFocusedSettingCommand = /** @class */ (function (_super) {
        __extends(EditFocusedSettingCommand, _super);
        function EditFocusedSettingCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EditFocusedSettingCommand.prototype.runCommand = function (accessor, args) {
            var preferencesEditor = this.getPreferencesEditor(accessor);
            if (preferencesEditor) {
                preferencesEditor.editFocusedPreference();
            }
        };
        return EditFocusedSettingCommand;
    }(SettingsCommand));
    var editFocusedSettingCommand = new EditFocusedSettingCommand({
        id: preferences_1.SETTINGS_EDITOR_COMMAND_EDIT_FOCUSED_SETTING,
        precondition: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS,
        kbOpts: { primary: 2048 /* CtrlCmd */ | 84 /* US_DOT */ }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(editFocusedSettingCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
});
