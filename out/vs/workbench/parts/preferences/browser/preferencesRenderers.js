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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/async", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/editor/common/editorCommon", "vs/editor/common/core/range", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/preferences/common/preferences", "vs/workbench/parts/preferences/common/preferencesModels", "vs/editor/browser/editorBrowser", "vs/platform/contextview/browser/contextView", "vs/workbench/parts/preferences/browser/preferencesWidgets", "vs/platform/telemetry/common/telemetry", "vs/workbench/browser/parts/editor/rangeDecorations", "vs/platform/markers/common/markers", "vs/platform/message/common/message", "vs/editor/common/model/textModel", "vs/platform/workspace/common/workspace", "vs/base/common/htmlContent", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/editor/common/model", "vs/editor/common/modes", "vs/base/browser/dom", "vs/platform/issue/common/issue", "vs/workbench/services/issue/common/issue", "vs/workbench/services/editor/common/editorService"], function (require, exports, winjs_base_1, nls, async_1, arrays, strings, lifecycle_1, position_1, event_1, platform_1, editorCommon, range_1, configurationRegistry_1, instantiation_1, preferences_1, preferencesModels_1, editorBrowser_1, contextView_1, preferencesWidgets_1, telemetry_1, rangeDecorations_1, markers_1, message_1, textModel_1, workspace_1, htmlContent_1, configuration_1, environment_1, model_1, modes_1, dom_1, issue_1, issue_2, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UserSettingsRenderer = /** @class */ (function (_super) {
        __extends(UserSettingsRenderer, _super);
        function UserSettingsRenderer(editor, preferencesModel, preferencesService, configurationService, instantiationService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.preferencesModel = preferencesModel;
            _this.preferencesService = preferencesService;
            _this.configurationService = configurationService;
            _this.instantiationService = instantiationService;
            _this.modelChangeDelayer = new async_1.Delayer(200);
            _this._onFocusPreference = new event_1.Emitter();
            _this.onFocusPreference = _this._onFocusPreference.event;
            _this._onClearFocusPreference = new event_1.Emitter();
            _this.onClearFocusPreference = _this._onClearFocusPreference.event;
            _this._onUpdatePreference = new event_1.Emitter();
            _this.onUpdatePreference = _this._onUpdatePreference.event;
            _this.settingHighlighter = _this._register(instantiationService.createInstance(SettingHighlighter, editor, _this._onFocusPreference, _this._onClearFocusPreference));
            _this.highlightMatchesRenderer = _this._register(instantiationService.createInstance(HighlightMatchesRenderer, editor));
            _this.editSettingActionRenderer = _this._register(_this.instantiationService.createInstance(EditSettingRenderer, _this.editor, _this.preferencesModel, _this.settingHighlighter));
            _this._register(_this.editSettingActionRenderer.onUpdateSetting(function (_a) {
                var key = _a.key, value = _a.value, source = _a.source;
                return _this._updatePreference(key, value, source);
            }));
            _this._register(_this.editor.getModel().onDidChangeContent(function () { return _this.modelChangeDelayer.trigger(function () { return _this.onModelChanged(); }); }));
            _this.createHeader();
            return _this;
        }
        UserSettingsRenderer.prototype.getAssociatedPreferencesModel = function () {
            return this.associatedPreferencesModel;
        };
        UserSettingsRenderer.prototype.setAssociatedPreferencesModel = function (associatedPreferencesModel) {
            this.associatedPreferencesModel = associatedPreferencesModel;
            this.editSettingActionRenderer.associatedPreferencesModel = associatedPreferencesModel;
        };
        UserSettingsRenderer.prototype.createHeader = function () {
            this._register(new preferencesWidgets_1.SettingsHeaderWidget(this.editor, '')).setMessage(nls.localize('emptyUserSettingsHeader', "Place your settings here to overwrite the Default Settings."));
        };
        UserSettingsRenderer.prototype.render = function () {
            this.editSettingActionRenderer.render(this.preferencesModel.settingsGroups, this.associatedPreferencesModel);
            if (this.filterResult) {
                this.filterPreferences(this.filterResult);
            }
        };
        UserSettingsRenderer.prototype._updatePreference = function (key, value, source) {
            this._onUpdatePreference.fire({ key: key, value: value, source: source });
            this.updatePreference(key, value, source);
        };
        UserSettingsRenderer.prototype.updatePreference = function (key, value, source) {
            var _this = this;
            var overrideIdentifier = source.overrideOf ? configuration_1.overrideIdentifierFromKey(source.overrideOf.key) : null;
            var resource = this.preferencesModel.uri;
            this.configurationService.updateValue(key, value, { overrideIdentifier: overrideIdentifier, resource: resource }, this.preferencesModel.configurationTarget)
                .then(function () { return _this.onSettingUpdated(source); });
        };
        UserSettingsRenderer.prototype.onModelChanged = function () {
            if (!this.editor.getModel()) {
                // model could have been disposed during the delay
                return;
            }
            this.render();
        };
        UserSettingsRenderer.prototype.onSettingUpdated = function (setting) {
            this.editor.focus();
            setting = this.getSetting(setting);
            if (setting) {
                // TODO:@sandy Selection range should be template range
                this.editor.setSelection(setting.valueRange);
                this.settingHighlighter.highlight(setting, true);
            }
        };
        UserSettingsRenderer.prototype.getSetting = function (setting) {
            var key = setting.key, overrideOf = setting.overrideOf;
            if (overrideOf) {
                var setting_1 = this.getSetting(overrideOf);
                for (var _i = 0, _a = setting_1.overrides; _i < _a.length; _i++) {
                    var override = _a[_i];
                    if (override.key === key) {
                        return override;
                    }
                }
                return null;
            }
            return this.preferencesModel.getPreference(key);
        };
        UserSettingsRenderer.prototype.filterPreferences = function (filterResult) {
            this.filterResult = filterResult;
            this.settingHighlighter.clear(true);
            this.highlightMatchesRenderer.render(filterResult ? filterResult.matches : []);
        };
        UserSettingsRenderer.prototype.focusPreference = function (setting) {
            var s = this.getSetting(setting);
            if (s) {
                this.settingHighlighter.highlight(s, true);
                this.editor.setPosition({ lineNumber: s.keyRange.startLineNumber, column: s.keyRange.startColumn });
            }
            else {
                this.settingHighlighter.clear(true);
            }
        };
        UserSettingsRenderer.prototype.clearFocus = function (setting) {
            this.settingHighlighter.clear(true);
        };
        UserSettingsRenderer.prototype.editPreference = function (setting) {
            var editableSetting = this.getSetting(setting);
            return editableSetting && this.editSettingActionRenderer.activateOnSetting(editableSetting);
        };
        UserSettingsRenderer = __decorate([
            __param(2, preferences_1.IPreferencesService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, instantiation_1.IInstantiationService)
        ], UserSettingsRenderer);
        return UserSettingsRenderer;
    }(lifecycle_1.Disposable));
    exports.UserSettingsRenderer = UserSettingsRenderer;
    var WorkspaceSettingsRenderer = /** @class */ (function (_super) {
        __extends(WorkspaceSettingsRenderer, _super);
        function WorkspaceSettingsRenderer(editor, preferencesModel, preferencesService, telemetryService, configurationService, instantiationService) {
            var _this = _super.call(this, editor, preferencesModel, preferencesService, configurationService, instantiationService) || this;
            _this.unsupportedSettingsRenderer = _this._register(instantiationService.createInstance(UnsupportedSettingsRenderer, editor, preferencesModel));
            _this.workspaceConfigurationRenderer = _this._register(instantiationService.createInstance(WorkspaceConfigurationRenderer, editor, preferencesModel));
            return _this;
        }
        WorkspaceSettingsRenderer.prototype.createHeader = function () {
            this._register(new preferencesWidgets_1.SettingsHeaderWidget(this.editor, '')).setMessage(nls.localize('emptyWorkspaceSettingsHeader', "Place your settings here to overwrite the User Settings."));
        };
        WorkspaceSettingsRenderer.prototype.setAssociatedPreferencesModel = function (associatedPreferencesModel) {
            _super.prototype.setAssociatedPreferencesModel.call(this, associatedPreferencesModel);
            this.workspaceConfigurationRenderer.render(this.getAssociatedPreferencesModel());
        };
        WorkspaceSettingsRenderer.prototype.render = function () {
            _super.prototype.render.call(this);
            this.unsupportedSettingsRenderer.render();
            this.workspaceConfigurationRenderer.render(this.getAssociatedPreferencesModel());
        };
        WorkspaceSettingsRenderer = __decorate([
            __param(2, preferences_1.IPreferencesService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, instantiation_1.IInstantiationService)
        ], WorkspaceSettingsRenderer);
        return WorkspaceSettingsRenderer;
    }(UserSettingsRenderer));
    exports.WorkspaceSettingsRenderer = WorkspaceSettingsRenderer;
    var FolderSettingsRenderer = /** @class */ (function (_super) {
        __extends(FolderSettingsRenderer, _super);
        function FolderSettingsRenderer(editor, preferencesModel, preferencesService, telemetryService, configurationService, instantiationService) {
            var _this = _super.call(this, editor, preferencesModel, preferencesService, configurationService, instantiationService) || this;
            _this.unsupportedSettingsRenderer = _this._register(instantiationService.createInstance(UnsupportedSettingsRenderer, editor, preferencesModel));
            return _this;
        }
        FolderSettingsRenderer.prototype.createHeader = function () {
            this._register(new preferencesWidgets_1.SettingsHeaderWidget(this.editor, '')).setMessage(nls.localize('emptyFolderSettingsHeader', "Place your folder settings here to overwrite those from the Workspace Settings."));
        };
        FolderSettingsRenderer.prototype.render = function () {
            _super.prototype.render.call(this);
            this.unsupportedSettingsRenderer.render();
        };
        FolderSettingsRenderer = __decorate([
            __param(2, preferences_1.IPreferencesService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, instantiation_1.IInstantiationService)
        ], FolderSettingsRenderer);
        return FolderSettingsRenderer;
    }(UserSettingsRenderer));
    exports.FolderSettingsRenderer = FolderSettingsRenderer;
    var DefaultSettingsRenderer = /** @class */ (function (_super) {
        __extends(DefaultSettingsRenderer, _super);
        function DefaultSettingsRenderer(editor, preferencesModel, preferencesService, instantiationService, configurationService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.preferencesModel = preferencesModel;
            _this.preferencesService = preferencesService;
            _this.instantiationService = instantiationService;
            _this.configurationService = configurationService;
            _this._onUpdatePreference = new event_1.Emitter();
            _this.onUpdatePreference = _this._onUpdatePreference.event;
            _this._onFocusPreference = new event_1.Emitter();
            _this.onFocusPreference = _this._onFocusPreference.event;
            _this._onClearFocusPreference = new event_1.Emitter();
            _this.onClearFocusPreference = _this._onClearFocusPreference.event;
            _this.settingHighlighter = _this._register(instantiationService.createInstance(SettingHighlighter, editor, _this._onFocusPreference, _this._onClearFocusPreference));
            _this.settingsHeaderRenderer = _this._register(instantiationService.createInstance(DefaultSettingsHeaderRenderer, editor, preferencesModel.configurationScope));
            _this.settingsGroupTitleRenderer = _this._register(instantiationService.createInstance(SettingsGroupTitleRenderer, editor));
            _this.filteredMatchesRenderer = _this._register(instantiationService.createInstance(FilteredMatchesRenderer, editor));
            _this.editSettingActionRenderer = _this._register(instantiationService.createInstance(EditSettingRenderer, editor, preferencesModel, _this.settingHighlighter));
            _this.issueWidgetRenderer = _this._register(instantiationService.createInstance(IssueWidgetRenderer, editor));
            _this.feedbackWidgetRenderer = _this._register(instantiationService.createInstance(FeedbackWidgetRenderer, editor));
            _this.bracesHidingRenderer = _this._register(instantiationService.createInstance(BracesHidingRenderer, editor, preferencesModel));
            _this.hiddenAreasRenderer = _this._register(instantiationService.createInstance(HiddenAreasRenderer, editor, [_this.settingsGroupTitleRenderer, _this.filteredMatchesRenderer, _this.bracesHidingRenderer]));
            _this.extensionCodelensRenderer = _this._register(instantiationService.createInstance(ExtensionCodelensRenderer, editor));
            _this._register(_this.editSettingActionRenderer.onUpdateSetting(function (e) { return _this._onUpdatePreference.fire(e); }));
            _this._register(_this.settingsGroupTitleRenderer.onHiddenAreasChanged(function () { return _this.hiddenAreasRenderer.render(); }));
            _this._register(preferencesModel.onDidChangeGroups(function () { return _this.render(); }));
            return _this;
        }
        DefaultSettingsRenderer.prototype.getAssociatedPreferencesModel = function () {
            return this._associatedPreferencesModel;
        };
        DefaultSettingsRenderer.prototype.setAssociatedPreferencesModel = function (associatedPreferencesModel) {
            this._associatedPreferencesModel = associatedPreferencesModel;
            this.editSettingActionRenderer.associatedPreferencesModel = associatedPreferencesModel;
        };
        DefaultSettingsRenderer.prototype.render = function () {
            this.settingsGroupTitleRenderer.render(this.preferencesModel.settingsGroups);
            this.editSettingActionRenderer.render(this.preferencesModel.settingsGroups, this._associatedPreferencesModel);
            this.issueWidgetRenderer.render(null);
            this.feedbackWidgetRenderer.render(null);
            this.settingHighlighter.clear(true);
            this.bracesHidingRenderer.render(null, this.preferencesModel.settingsGroups);
            this.settingsGroupTitleRenderer.showGroup(0);
            this.hiddenAreasRenderer.render();
        };
        DefaultSettingsRenderer.prototype.filterPreferences = function (filterResult) {
            this.filterResult = filterResult;
            if (filterResult) {
                this.filteredMatchesRenderer.render(filterResult, this.preferencesModel.settingsGroups);
                this.settingsGroupTitleRenderer.render(null);
                this.renderIssueWidget(filterResult);
                this.settingsHeaderRenderer.render(filterResult);
                this.settingHighlighter.clear(true);
                this.bracesHidingRenderer.render(filterResult, this.preferencesModel.settingsGroups);
                this.editSettingActionRenderer.render(filterResult.filteredGroups, this._associatedPreferencesModel);
                this.extensionCodelensRenderer.render(filterResult);
            }
            else {
                this.settingHighlighter.clear(true);
                this.filteredMatchesRenderer.render(null, this.preferencesModel.settingsGroups);
                this.renderIssueWidget(null);
                this.settingsHeaderRenderer.render(null);
                this.settingsGroupTitleRenderer.render(this.preferencesModel.settingsGroups);
                this.settingsGroupTitleRenderer.showGroup(0);
                this.bracesHidingRenderer.render(null, this.preferencesModel.settingsGroups);
                this.editSettingActionRenderer.render(this.preferencesModel.settingsGroups, this._associatedPreferencesModel);
                this.extensionCodelensRenderer.render(null);
            }
            this.hiddenAreasRenderer.render();
        };
        DefaultSettingsRenderer.prototype.renderIssueWidget = function (filterResult) {
            var workbenchSettings = this.configurationService.getValue().workbench.settings;
            if (workbenchSettings.enableNaturalLanguageSearchFeedback) {
                this.issueWidgetRenderer.render(null);
                this.feedbackWidgetRenderer.render(filterResult);
            }
            else {
                this.feedbackWidgetRenderer.render(null);
                this.issueWidgetRenderer.render(filterResult);
            }
        };
        DefaultSettingsRenderer.prototype.focusPreference = function (s) {
            var setting = this.getSetting(s);
            if (setting) {
                this.settingsGroupTitleRenderer.showSetting(setting);
                this.settingHighlighter.highlight(setting, true);
            }
            else {
                this.settingHighlighter.clear(true);
            }
        };
        DefaultSettingsRenderer.prototype.getSetting = function (setting) {
            var key = setting.key, overrideOf = setting.overrideOf;
            if (overrideOf) {
                var setting_2 = this.getSetting(overrideOf);
                for (var _i = 0, _a = setting_2.overrides; _i < _a.length; _i++) {
                    var override = _a[_i];
                    if (override.key === key) {
                        return override;
                    }
                }
                return null;
            }
            var settingsGroups = this.filterResult ? this.filterResult.filteredGroups : this.preferencesModel.settingsGroups;
            return this.getPreference(key, settingsGroups);
        };
        DefaultSettingsRenderer.prototype.getPreference = function (key, settingsGroups) {
            for (var _i = 0, settingsGroups_1 = settingsGroups; _i < settingsGroups_1.length; _i++) {
                var group = settingsGroups_1[_i];
                for (var _a = 0, _b = group.sections; _a < _b.length; _a++) {
                    var section = _b[_a];
                    for (var _c = 0, _d = section.settings; _c < _d.length; _c++) {
                        var setting = _d[_c];
                        if (setting.key === key) {
                            return setting;
                        }
                    }
                }
            }
            return null;
        };
        DefaultSettingsRenderer.prototype.clearFocus = function (setting) {
            this.settingHighlighter.clear(true);
        };
        DefaultSettingsRenderer.prototype.updatePreference = function (key, value, source) {
        };
        DefaultSettingsRenderer.prototype.editPreference = function (setting) {
            return this.editSettingActionRenderer.activateOnSetting(setting);
        };
        DefaultSettingsRenderer = __decorate([
            __param(2, preferences_1.IPreferencesService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, configuration_1.IConfigurationService)
        ], DefaultSettingsRenderer);
        return DefaultSettingsRenderer;
    }(lifecycle_1.Disposable));
    exports.DefaultSettingsRenderer = DefaultSettingsRenderer;
    var BracesHidingRenderer = /** @class */ (function (_super) {
        __extends(BracesHidingRenderer, _super);
        function BracesHidingRenderer(editor) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            return _this;
        }
        BracesHidingRenderer.prototype.render = function (result, settingsGroups) {
            this._result = result;
            this._settingsGroups = settingsGroups;
        };
        Object.defineProperty(BracesHidingRenderer.prototype, "hiddenAreas", {
            get: function () {
                // Opening square brace
                var hiddenAreas = [
                    {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 2,
                        endColumn: 1
                    }
                ];
                var hideBraces = function (group, hideExtraLine) {
                    // Opening curly brace
                    hiddenAreas.push({
                        startLineNumber: group.range.startLineNumber - 3,
                        startColumn: 1,
                        endLineNumber: group.range.startLineNumber - (hideExtraLine ? 1 : 3),
                        endColumn: 1
                    });
                    // Closing curly brace
                    hiddenAreas.push({
                        startLineNumber: group.range.endLineNumber + 1,
                        startColumn: 1,
                        endLineNumber: group.range.endLineNumber + 4,
                        endColumn: 1
                    });
                };
                this._settingsGroups.forEach(function (g) { return hideBraces(g); });
                if (this._result) {
                    this._result.filteredGroups.forEach(function (g, i) { return hideBraces(g, true); });
                }
                // Closing square brace
                var lineCount = this.editor.getModel().getLineCount();
                hiddenAreas.push({
                    startLineNumber: lineCount,
                    startColumn: 1,
                    endLineNumber: lineCount,
                    endColumn: 1
                });
                return hiddenAreas;
            },
            enumerable: true,
            configurable: true
        });
        return BracesHidingRenderer;
    }(lifecycle_1.Disposable));
    exports.BracesHidingRenderer = BracesHidingRenderer;
    var DefaultSettingsHeaderRenderer = /** @class */ (function (_super) {
        __extends(DefaultSettingsHeaderRenderer, _super);
        function DefaultSettingsHeaderRenderer(editor, scope) {
            var _this = _super.call(this) || this;
            _this.settingsHeaderWidget = _this._register(new preferencesWidgets_1.DefaultSettingsHeaderWidget(editor, ''));
            _this.onClick = _this.settingsHeaderWidget.onClick;
            return _this;
        }
        DefaultSettingsHeaderRenderer.prototype.render = function (filterResult) {
            var hasSettings = !filterResult || filterResult.filteredGroups.length > 0;
            this.settingsHeaderWidget.toggleMessage(hasSettings);
        };
        return DefaultSettingsHeaderRenderer;
    }(lifecycle_1.Disposable));
    var SettingsGroupTitleRenderer = /** @class */ (function (_super) {
        __extends(SettingsGroupTitleRenderer, _super);
        function SettingsGroupTitleRenderer(editor, instantiationService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.instantiationService = instantiationService;
            _this._onHiddenAreasChanged = new event_1.Emitter();
            _this.hiddenGroups = [];
            _this.disposables = [];
            return _this;
        }
        Object.defineProperty(SettingsGroupTitleRenderer.prototype, "onHiddenAreasChanged", {
            get: function () { return this._onHiddenAreasChanged.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SettingsGroupTitleRenderer.prototype, "hiddenAreas", {
            get: function () {
                var hiddenAreas = [];
                for (var _i = 0, _a = this.hiddenGroups; _i < _a.length; _i++) {
                    var group = _a[_i];
                    hiddenAreas.push(group.range);
                }
                return hiddenAreas;
            },
            enumerable: true,
            configurable: true
        });
        SettingsGroupTitleRenderer.prototype.render = function (settingsGroups) {
            var _this = this;
            this.disposeWidgets();
            if (!settingsGroups) {
                return;
            }
            this.settingsGroups = settingsGroups.slice();
            this.settingsGroupTitleWidgets = [];
            var _loop_1 = function (group) {
                if (group.sections.every(function (sect) { return sect.settings.length === 0; })) {
                    return "continue";
                }
                var settingsGroupTitleWidget = this_1.instantiationService.createInstance(preferencesWidgets_1.SettingsGroupTitleWidget, this_1.editor, group);
                settingsGroupTitleWidget.render();
                this_1.settingsGroupTitleWidgets.push(settingsGroupTitleWidget);
                this_1.disposables.push(settingsGroupTitleWidget);
                this_1.disposables.push(settingsGroupTitleWidget.onToggled(function (collapsed) { return _this.onToggled(collapsed, settingsGroupTitleWidget.settingsGroup); }));
            };
            var this_1 = this;
            for (var _i = 0, _a = this.settingsGroups.slice().reverse(); _i < _a.length; _i++) {
                var group = _a[_i];
                _loop_1(group);
            }
            this.settingsGroupTitleWidgets.reverse();
        };
        SettingsGroupTitleRenderer.prototype.showGroup = function (groupIdx) {
            var shownGroup = this.settingsGroupTitleWidgets[groupIdx].settingsGroup;
            this.hiddenGroups = this.settingsGroups.filter(function (g) { return g !== shownGroup; });
            for (var _i = 0, _a = this.settingsGroupTitleWidgets.filter(function (widget) { return widget.settingsGroup !== shownGroup; }); _i < _a.length; _i++) {
                var groupTitleWidget = _a[_i];
                groupTitleWidget.toggleCollapse(true);
            }
            this._onHiddenAreasChanged.fire();
        };
        SettingsGroupTitleRenderer.prototype.showSetting = function (setting) {
            var settingsGroupTitleWidget = this.settingsGroupTitleWidgets.filter(function (widget) { return range_1.Range.containsRange(widget.settingsGroup.range, setting.range); })[0];
            if (settingsGroupTitleWidget && settingsGroupTitleWidget.isCollapsed()) {
                settingsGroupTitleWidget.toggleCollapse(false);
                this.hiddenGroups.splice(this.hiddenGroups.indexOf(settingsGroupTitleWidget.settingsGroup), 1);
                this._onHiddenAreasChanged.fire();
            }
        };
        SettingsGroupTitleRenderer.prototype.onToggled = function (collapsed, group) {
            var index = this.hiddenGroups.indexOf(group);
            if (collapsed) {
                var currentPosition = this.editor.getPosition();
                if (group.range.startLineNumber <= currentPosition.lineNumber && group.range.endLineNumber >= currentPosition.lineNumber) {
                    this.editor.setPosition({ lineNumber: group.range.startLineNumber - 1, column: 1 });
                }
                this.hiddenGroups.push(group);
            }
            else {
                this.hiddenGroups.splice(index, 1);
            }
            this._onHiddenAreasChanged.fire();
        };
        SettingsGroupTitleRenderer.prototype.disposeWidgets = function () {
            this.hiddenGroups = [];
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        SettingsGroupTitleRenderer.prototype.dispose = function () {
            this.disposeWidgets();
            _super.prototype.dispose.call(this);
        };
        SettingsGroupTitleRenderer = __decorate([
            __param(1, instantiation_1.IInstantiationService)
        ], SettingsGroupTitleRenderer);
        return SettingsGroupTitleRenderer;
    }(lifecycle_1.Disposable));
    exports.SettingsGroupTitleRenderer = SettingsGroupTitleRenderer;
    var HiddenAreasRenderer = /** @class */ (function (_super) {
        __extends(HiddenAreasRenderer, _super);
        function HiddenAreasRenderer(editor, hiddenAreasProviders) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.hiddenAreasProviders = hiddenAreasProviders;
            return _this;
        }
        HiddenAreasRenderer.prototype.render = function () {
            var ranges = [];
            for (var _i = 0, _a = this.hiddenAreasProviders; _i < _a.length; _i++) {
                var hiddenAreaProvider = _a[_i];
                ranges.push.apply(ranges, hiddenAreaProvider.hiddenAreas);
            }
            this.editor.setHiddenAreas(ranges);
        };
        HiddenAreasRenderer.prototype.dispose = function () {
            this.editor.setHiddenAreas([]);
            _super.prototype.dispose.call(this);
        };
        return HiddenAreasRenderer;
    }(lifecycle_1.Disposable));
    exports.HiddenAreasRenderer = HiddenAreasRenderer;
    var FeedbackWidgetRenderer = /** @class */ (function (_super) {
        __extends(FeedbackWidgetRenderer, _super);
        function FeedbackWidgetRenderer(editor, instantiationService, editorService, telemetryService, messageService, environmentService, configurationService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.instantiationService = instantiationService;
            _this.editorService = editorService;
            _this.telemetryService = telemetryService;
            _this.messageService = messageService;
            _this.environmentService = environmentService;
            _this.configurationService = configurationService;
            return _this;
        }
        FeedbackWidgetRenderer.prototype.render = function (result) {
            this._currentResult = result;
            if (result && result.metadata) {
                this.showWidget();
            }
            else if (this._feedbackWidget) {
                this.disposeWidget();
            }
        };
        FeedbackWidgetRenderer.prototype.showWidget = function () {
            var _this = this;
            if (!this._feedbackWidget) {
                this._feedbackWidget = this._register(this.instantiationService.createInstance(preferencesWidgets_1.FloatingClickWidget, this.editor, 'Provide feedback', null));
                this._register(this._feedbackWidget.onClick(function () { return _this.getFeedback(); }));
                this._feedbackWidget.render();
            }
        };
        FeedbackWidgetRenderer.prototype.getFeedback = function () {
            var _this = this;
            if (!this.telemetryService.isOptedIn && this.environmentService.appQuality) {
                this.messageService.show(message_1.Severity.Error, 'Can\'t send feedback, user is opted out of telemetry');
                return;
            }
            var result = this._currentResult;
            var metadata = result.metadata['nlpResult']; // Feedback only on nlpResult set for now
            var actualResults = metadata ? metadata.scoredResults : {};
            var actualResultIds = Object.keys(actualResults);
            var feedbackQuery = {};
            feedbackQuery['comment'] = FeedbackWidgetRenderer.DEFAULT_COMMENT_TEXT;
            feedbackQuery['queryString'] = result.query;
            feedbackQuery['duration'] = metadata ? metadata.duration : -1;
            feedbackQuery['resultScores'] = [];
            actualResultIds.forEach(function (settingId) {
                feedbackQuery['resultScores'].push({
                    packageID: actualResults[settingId].packageId,
                    key: actualResults[settingId].key,
                    score: 10
                });
            });
            feedbackQuery['alts'] = [];
            var groupCountsText = result.filteredGroups
                .map(function (group) { return "// " + group.id + ": " + group.sections[0].settings.length; })
                .join('\n');
            var contents = FeedbackWidgetRenderer.INSTRUCTION_TEXT + '\n' +
                JSON.stringify(feedbackQuery, undefined, '    ') + '\n\n' +
                this.getScoreText(actualResults) + '\n\n' +
                groupCountsText + '\n';
            this.editorService.openEditor({ contents: contents, language: 'jsonc' }, /*sideBySide=*/ true).then(function (feedbackEditor) {
                var sendFeedbackWidget = _this._register(_this.instantiationService.createInstance(preferencesWidgets_1.FloatingClickWidget, feedbackEditor.getControl(), 'Send feedback', null));
                sendFeedbackWidget.render();
                _this._register(sendFeedbackWidget.onClick(function () {
                    _this.sendFeedback(feedbackEditor.getControl(), result, actualResults).then(function () {
                        sendFeedbackWidget.dispose();
                        _this.messageService.show(message_1.Severity.Info, 'Feedback sent successfully');
                    }, function (err) {
                        _this.messageService.show(message_1.Severity.Error, 'Error sending feedback: ' + err.message);
                    });
                }));
            });
        };
        FeedbackWidgetRenderer.prototype.getScoreText = function (results) {
            if (!results) {
                return '';
            }
            return Object.keys(results)
                .map(function (name) {
                return "// " + results[name].key + ": " + results[name].score;
            }).join('\n');
        };
        FeedbackWidgetRenderer.prototype.sendFeedback = function (feedbackEditor, result, scoredResults) {
            var model = feedbackEditor.getModel();
            var expectedQueryLines = model.getLinesContent()
                .filter(function (line) { return !strings.startsWith(line, '//'); });
            var expectedQuery;
            try {
                expectedQuery = JSON.parse(expectedQueryLines.join('\n'));
            }
            catch (e) {
                // invalid JSON
                return winjs_base_1.TPromise.wrapError(new Error('Invalid JSON: ' + e.message));
            }
            var userComment = expectedQuery.comment === FeedbackWidgetRenderer.DEFAULT_COMMENT_TEXT ? undefined : expectedQuery.comment;
            // validate alts
            if (!this.validateAlts(expectedQuery.alts)) {
                return winjs_base_1.TPromise.wrapError(new Error('alts must be an array of 2-element string arrays'));
            }
            var altsAdded = expectedQuery.alts && expectedQuery.alts.length;
            var alts = altsAdded ? expectedQuery.alts : undefined;
            var workbenchSettings = this.configurationService.getValue().workbench.settings;
            var autoIngest = workbenchSettings.naturalLanguageSearchAutoIngestFeedback;
            var nlpMetadata = result.metadata && result.metadata['nlpResult'];
            var duration = nlpMetadata && nlpMetadata.duration;
            var requestBody = nlpMetadata && nlpMetadata.requestBody;
            var actualResultScores = {};
            for (var key in scoredResults) {
                actualResultScores[key] = {
                    score: scoredResults[key].score
                };
            }
            /* __GDPR__
                "settingsSearchResultFeedback" : {
                    "query" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                    "requestBody" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                    "userComment" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                    "actualResults" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "expectedResults" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "duration" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "buildNumber" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "alts" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "autoIngest" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            return this.telemetryService.publicLog('settingsSearchResultFeedback', {
                query: result.query,
                requestBody: requestBody,
                userComment: userComment,
                actualResults: actualResultScores,
                expectedResults: expectedQuery.resultScores,
                duration: duration,
                buildNumber: this.environmentService.settingsSearchBuildId,
                alts: alts,
                autoIngest: autoIngest
            });
        };
        FeedbackWidgetRenderer.prototype.validateAlts = function (alts) {
            if (!alts) {
                return true;
            }
            if (!Array.isArray(alts)) {
                return false;
            }
            if (!alts.length) {
                return true;
            }
            if (!alts.every(function (altPair) { return Array.isArray(altPair) && altPair.length === 2 && typeof altPair[0] === 'string' && typeof altPair[1] === 'string'; })) {
                return false;
            }
            return true;
        };
        FeedbackWidgetRenderer.prototype.disposeWidget = function () {
            if (this._feedbackWidget) {
                this._feedbackWidget.dispose();
                this._feedbackWidget = null;
            }
        };
        FeedbackWidgetRenderer.prototype.dispose = function () {
            this.disposeWidget();
            _super.prototype.dispose.call(this);
        };
        FeedbackWidgetRenderer.DEFAULT_COMMENT_TEXT = 'Replace this comment with any text feedback.';
        FeedbackWidgetRenderer.INSTRUCTION_TEXT = [
            '// Modify the "resultScores" section to contain only your expected results. Assign scores to indicate their relevance.',
            '// Results present in "resultScores" will be automatically "boosted" for this query, if they are not already at the top of the result set.',
            '// Add phrase pairs to the "alts" section to have them considered to be synonyms in queries.'
        ].join('\n');
        FeedbackWidgetRenderer = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, message_1.IMessageService),
            __param(5, environment_1.IEnvironmentService),
            __param(6, configuration_1.IConfigurationService)
        ], FeedbackWidgetRenderer);
        return FeedbackWidgetRenderer;
    }(lifecycle_1.Disposable));
    exports.FeedbackWidgetRenderer = FeedbackWidgetRenderer;
    var IssueWidgetRenderer = /** @class */ (function (_super) {
        __extends(IssueWidgetRenderer, _super);
        function IssueWidgetRenderer(editor, instantiationService, issueService, environmentService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.instantiationService = instantiationService;
            _this.issueService = issueService;
            _this.environmentService = environmentService;
            return _this;
        }
        IssueWidgetRenderer.prototype.render = function (result) {
            this._currentResult = result;
            if (result && result.metadata && this.environmentService.appQuality !== 'stable') {
                this.showWidget();
            }
            else if (this._issueWidget) {
                this.disposeWidget();
            }
        };
        IssueWidgetRenderer.prototype.showWidget = function () {
            var _this = this;
            if (!this._issueWidget) {
                this._issueWidget = this._register(this.instantiationService.createInstance(preferencesWidgets_1.FloatingClickWidget, this.editor, nls.localize('reportSettingsSearchIssue', "Report Issue"), null));
                this._register(this._issueWidget.onClick(function () { return _this.showIssueReporter(); }));
                this._issueWidget.render();
            }
        };
        IssueWidgetRenderer.prototype.showIssueReporter = function () {
            var _this = this;
            var nlpMetadata = this._currentResult.metadata['nlpResult'];
            var results = nlpMetadata.scoredResults;
            var enabledExtensions = nlpMetadata.extensions;
            var issueResults = Object.keys(results)
                .map(function (key) { return ({
                key: key.split('##')[1],
                extensionId: results[key].packageId === 'core' ?
                    'core' :
                    _this.getExtensionIdByGuid(enabledExtensions, results[key].packageId),
                score: results[key].score
            }); })
                .slice(0, 20);
            var issueReporterData = {
                enabledExtensions: enabledExtensions,
                issueType: issue_1.IssueType.SettingsSearchIssue,
                actualSearchResults: issueResults,
                filterResultCount: this.getFilterResultCount(),
                query: this._currentResult.query
            };
            return this.issueService.openReporter(issueReporterData);
        };
        IssueWidgetRenderer.prototype.getFilterResultCount = function () {
            var filterResultGroup = arrays.first(this._currentResult.filteredGroups, function (group) { return group.id === 'filterResult'; });
            return filterResultGroup ?
                filterResultGroup.sections[0].settings.length :
                0;
        };
        IssueWidgetRenderer.prototype.getExtensionIdByGuid = function (extensions, guid) {
            var match = arrays.first(extensions, function (ext) { return ext.identifier.uuid === guid; });
            // identifier.id includes the version, not needed here
            return match && match.manifest.publisher + "." + match.manifest.name;
        };
        IssueWidgetRenderer.prototype.disposeWidget = function () {
            if (this._issueWidget) {
                this._issueWidget.dispose();
                this._issueWidget = null;
            }
        };
        IssueWidgetRenderer.prototype.dispose = function () {
            this.disposeWidget();
            _super.prototype.dispose.call(this);
        };
        IssueWidgetRenderer = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, issue_2.IWorkbenchIssueService),
            __param(3, environment_1.IEnvironmentService)
        ], IssueWidgetRenderer);
        return IssueWidgetRenderer;
    }(lifecycle_1.Disposable));
    exports.IssueWidgetRenderer = IssueWidgetRenderer;
    var FilteredMatchesRenderer = /** @class */ (function (_super) {
        __extends(FilteredMatchesRenderer, _super);
        function FilteredMatchesRenderer(editor) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.decorationIds = [];
            _this.hiddenAreas = [];
            return _this;
        }
        FilteredMatchesRenderer.prototype.render = function (result, allSettingsGroups) {
            var _this = this;
            var model = this.editor.getModel();
            this.hiddenAreas = [];
            this.editor.changeDecorations(function (changeAccessor) {
                _this.decorationIds = changeAccessor.deltaDecorations(_this.decorationIds, []);
            });
            if (result) {
                this.hiddenAreas = this.computeHiddenRanges(result.filteredGroups, result.allGroups, model);
                this.editor.changeDecorations(function (changeAccessor) {
                    _this.decorationIds = changeAccessor.deltaDecorations(_this.decorationIds, result.matches.map(function (match) { return _this.createDecoration(match, model); }));
                });
            }
            else {
                this.hiddenAreas = this.computeHiddenRanges(null, allSettingsGroups, model);
            }
        };
        FilteredMatchesRenderer.prototype.createDecoration = function (range, model) {
            return {
                range: range,
                options: {
                    stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                    className: 'findMatch'
                }
            };
        };
        FilteredMatchesRenderer.prototype.computeHiddenRanges = function (filteredGroups, allSettingsGroups, model) {
            // Hide the contents of hidden groups
            var notMatchesRanges = [];
            if (filteredGroups) {
                allSettingsGroups.forEach(function (group, i) {
                    notMatchesRanges.push({
                        startLineNumber: group.range.startLineNumber - 1,
                        startColumn: group.range.startColumn,
                        endLineNumber: group.range.endLineNumber,
                        endColumn: group.range.endColumn
                    });
                });
            }
            return notMatchesRanges;
        };
        FilteredMatchesRenderer.prototype.dispose = function () {
            var _this = this;
            if (this.decorationIds) {
                this.decorationIds = this.editor.changeDecorations(function (changeAccessor) {
                    return changeAccessor.deltaDecorations(_this.decorationIds, []);
                });
            }
            _super.prototype.dispose.call(this);
        };
        return FilteredMatchesRenderer;
    }(lifecycle_1.Disposable));
    exports.FilteredMatchesRenderer = FilteredMatchesRenderer;
    var HighlightMatchesRenderer = /** @class */ (function (_super) {
        __extends(HighlightMatchesRenderer, _super);
        function HighlightMatchesRenderer(editor) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.decorationIds = [];
            return _this;
        }
        HighlightMatchesRenderer.prototype.render = function (matches) {
            var _this = this;
            var model = this.editor.getModel();
            this.editor.changeDecorations(function (changeAccessor) {
                _this.decorationIds = changeAccessor.deltaDecorations(_this.decorationIds, []) || [];
            });
            if (matches.length) {
                this.editor.changeDecorations(function (changeAccessor) {
                    _this.decorationIds = changeAccessor.deltaDecorations(_this.decorationIds, matches.map(function (match) { return _this.createDecoration(match, model); })) || [];
                });
            }
        };
        HighlightMatchesRenderer.prototype.createDecoration = function (range, model) {
            return {
                range: range,
                options: HighlightMatchesRenderer._FIND_MATCH
            };
        };
        HighlightMatchesRenderer.prototype.dispose = function () {
            var _this = this;
            if (this.decorationIds) {
                this.decorationIds = this.editor.changeDecorations(function (changeAccessor) {
                    return changeAccessor.deltaDecorations(_this.decorationIds, []);
                }) || [];
            }
            _super.prototype.dispose.call(this);
        };
        HighlightMatchesRenderer._FIND_MATCH = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'findMatch'
        });
        return HighlightMatchesRenderer;
    }(lifecycle_1.Disposable));
    exports.HighlightMatchesRenderer = HighlightMatchesRenderer;
    var ExtensionCodelensRenderer = /** @class */ (function (_super) {
        __extends(ExtensionCodelensRenderer, _super);
        function ExtensionCodelensRenderer() {
            var _this = _super.call(this) || this;
            _this._register(modes_1.CodeLensProviderRegistry.register({ pattern: '**/settings.json' }, _this));
            return _this;
        }
        ExtensionCodelensRenderer.prototype.render = function (filterResult) {
            this.filterResult = filterResult;
        };
        ExtensionCodelensRenderer.prototype.provideCodeLenses = function (model, token) {
            if (!this.filterResult || !this.filterResult.filteredGroups) {
                return [];
            }
            var newExtensionGroup = arrays.first(this.filterResult.filteredGroups, function (g) { return g.id === 'newExtensionsResult'; });
            if (!newExtensionGroup) {
                return [];
            }
            return newExtensionGroup.sections[0].settings
                .filter(function (s) {
                // Skip any non IExtensionSettings that somehow got in here
                return s.extensionName && s.extensionPublisher;
            })
                .map(function (s) {
                var extId = s.extensionPublisher + '.' + s.extensionName;
                return {
                    command: {
                        title: nls.localize('newExtensionLabel', "Show Extension \"{0}\"", extId),
                        id: 'workbench.extensions.action.showExtensionsWithId',
                        arguments: [extId.toLowerCase()]
                    },
                    range: new range_1.Range(s.keyRange.startLineNumber, 1, s.keyRange.startLineNumber, 1)
                };
            });
        };
        ExtensionCodelensRenderer.prototype.resolveCodeLens = function (model, codeLens, token) {
            return codeLens;
        };
        return ExtensionCodelensRenderer;
    }(lifecycle_1.Disposable));
    exports.ExtensionCodelensRenderer = ExtensionCodelensRenderer;
    var EditSettingRenderer = /** @class */ (function (_super) {
        __extends(EditSettingRenderer, _super);
        function EditSettingRenderer(editor, masterSettingsModel, settingHighlighter, instantiationService, contextMenuService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.masterSettingsModel = masterSettingsModel;
            _this.settingHighlighter = settingHighlighter;
            _this.instantiationService = instantiationService;
            _this.contextMenuService = contextMenuService;
            _this._onUpdateSetting = new event_1.Emitter();
            _this.onUpdateSetting = _this._onUpdateSetting.event;
            _this.editPreferenceWidgetForCursorPosition = _this._register(_this.instantiationService.createInstance(preferencesWidgets_1.EditPreferenceWidget, editor));
            _this.editPreferenceWidgetForMouseMove = _this._register(_this.instantiationService.createInstance(preferencesWidgets_1.EditPreferenceWidget, editor));
            _this.toggleEditPreferencesForMouseMoveDelayer = new async_1.Delayer(75);
            _this._register(_this.editPreferenceWidgetForCursorPosition.onClick(function (e) { return _this.onEditSettingClicked(_this.editPreferenceWidgetForCursorPosition, e); }));
            _this._register(_this.editPreferenceWidgetForMouseMove.onClick(function (e) { return _this.onEditSettingClicked(_this.editPreferenceWidgetForMouseMove, e); }));
            _this._register(_this.editor.onDidChangeCursorPosition(function (positionChangeEvent) { return _this.onPositionChanged(positionChangeEvent); }));
            _this._register(_this.editor.onMouseMove(function (mouseMoveEvent) { return _this.onMouseMoved(mouseMoveEvent); }));
            _this._register(_this.editor.onDidChangeConfiguration(function () { return _this.onConfigurationChanged(); }));
            return _this;
        }
        EditSettingRenderer.prototype.render = function (settingsGroups, associatedPreferencesModel) {
            this.editPreferenceWidgetForCursorPosition.hide();
            this.editPreferenceWidgetForMouseMove.hide();
            this.settingsGroups = settingsGroups;
            this.associatedPreferencesModel = associatedPreferencesModel;
            var settings = this.getSettings(this.editor.getPosition().lineNumber);
            if (settings.length) {
                this.showEditPreferencesWidget(this.editPreferenceWidgetForCursorPosition, settings);
            }
        };
        EditSettingRenderer.prototype.isDefaultSettings = function () {
            return this.masterSettingsModel instanceof preferencesModels_1.DefaultSettingsEditorModel;
        };
        EditSettingRenderer.prototype.onConfigurationChanged = function () {
            if (!this.editor.getConfiguration().viewInfo.glyphMargin) {
                this.editPreferenceWidgetForCursorPosition.hide();
                this.editPreferenceWidgetForMouseMove.hide();
            }
        };
        EditSettingRenderer.prototype.onPositionChanged = function (positionChangeEvent) {
            this.editPreferenceWidgetForMouseMove.hide();
            var settings = this.getSettings(positionChangeEvent.position.lineNumber);
            if (settings.length) {
                this.showEditPreferencesWidget(this.editPreferenceWidgetForCursorPosition, settings);
            }
            else {
                this.editPreferenceWidgetForCursorPosition.hide();
            }
        };
        EditSettingRenderer.prototype.onMouseMoved = function (mouseMoveEvent) {
            var _this = this;
            var editPreferenceWidget = this.getEditPreferenceWidgetUnderMouse(mouseMoveEvent);
            if (editPreferenceWidget) {
                this.onMouseOver(editPreferenceWidget);
                return;
            }
            this.settingHighlighter.clear();
            this.toggleEditPreferencesForMouseMoveDelayer.trigger(function () { return _this.toggleEditPreferenceWidgetForMouseMove(mouseMoveEvent); });
        };
        EditSettingRenderer.prototype.getEditPreferenceWidgetUnderMouse = function (mouseMoveEvent) {
            if (mouseMoveEvent.target.type === editorBrowser_1.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                var line = mouseMoveEvent.target.position.lineNumber;
                if (this.editPreferenceWidgetForMouseMove.getLine() === line && this.editPreferenceWidgetForMouseMove.isVisible()) {
                    return this.editPreferenceWidgetForMouseMove;
                }
                if (this.editPreferenceWidgetForCursorPosition.getLine() === line && this.editPreferenceWidgetForCursorPosition.isVisible()) {
                    return this.editPreferenceWidgetForCursorPosition;
                }
            }
            return null;
        };
        EditSettingRenderer.prototype.toggleEditPreferenceWidgetForMouseMove = function (mouseMoveEvent) {
            var settings = mouseMoveEvent.target.position ? this.getSettings(mouseMoveEvent.target.position.lineNumber) : null;
            if (settings && settings.length) {
                this.showEditPreferencesWidget(this.editPreferenceWidgetForMouseMove, settings);
            }
            else {
                this.editPreferenceWidgetForMouseMove.hide();
            }
        };
        EditSettingRenderer.prototype.showEditPreferencesWidget = function (editPreferencesWidget, settings) {
            var line = settings[0].valueRange.startLineNumber;
            if (this.editor.getConfiguration().viewInfo.glyphMargin && this.marginFreeFromOtherDecorations(line)) {
                editPreferencesWidget.show(line, nls.localize('editTtile', "Edit"), settings);
                var editPreferenceWidgetToHide = editPreferencesWidget === this.editPreferenceWidgetForCursorPosition ? this.editPreferenceWidgetForMouseMove : this.editPreferenceWidgetForCursorPosition;
                editPreferenceWidgetToHide.hide();
            }
        };
        EditSettingRenderer.prototype.marginFreeFromOtherDecorations = function (line) {
            var decorations = this.editor.getLineDecorations(line);
            if (decorations) {
                for (var _i = 0, decorations_1 = decorations; _i < decorations_1.length; _i++) {
                    var options = decorations_1[_i].options;
                    if (options.glyphMarginClassName && options.glyphMarginClassName.indexOf(preferencesWidgets_1.EditPreferenceWidget.GLYPH_MARGIN_CLASS_NAME) === -1) {
                        return false;
                    }
                }
            }
            return true;
        };
        EditSettingRenderer.prototype.getSettings = function (lineNumber) {
            var _this = this;
            var configurationMap = this.getConfigurationsMap();
            return this.getSettingsAtLineNumber(lineNumber).filter(function (setting) {
                var configurationNode = configurationMap[setting.key];
                if (configurationNode) {
                    if (_this.isDefaultSettings()) {
                        if (setting.key === 'launch') {
                            // Do not show because of https://github.com/Microsoft/vscode/issues/32593
                            return false;
                        }
                        return true;
                    }
                    if (configurationNode.type === 'boolean' || configurationNode.enum) {
                        if (_this.masterSettingsModel.configurationTarget !== configuration_1.ConfigurationTarget.WORKSPACE_FOLDER) {
                            return true;
                        }
                        if (configurationNode.scope === configurationRegistry_1.ConfigurationScope.RESOURCE) {
                            return true;
                        }
                    }
                }
                return false;
            });
        };
        EditSettingRenderer.prototype.getSettingsAtLineNumber = function (lineNumber) {
            // index of setting, across all groups/sections
            var index = 0;
            var settings = [];
            for (var _i = 0, _a = this.settingsGroups; _i < _a.length; _i++) {
                var group = _a[_i];
                if (group.range.startLineNumber > lineNumber) {
                    break;
                }
                if (lineNumber >= group.range.startLineNumber && lineNumber <= group.range.endLineNumber) {
                    for (var _b = 0, _c = group.sections; _b < _c.length; _b++) {
                        var section = _c[_b];
                        for (var _d = 0, _e = section.settings; _d < _e.length; _d++) {
                            var setting = _e[_d];
                            if (setting.range.startLineNumber > lineNumber) {
                                break;
                            }
                            if (lineNumber >= setting.range.startLineNumber && lineNumber <= setting.range.endLineNumber) {
                                if (!this.isDefaultSettings() && setting.overrides.length) {
                                    // Only one level because override settings cannot have override settings
                                    for (var _f = 0, _g = setting.overrides; _f < _g.length; _f++) {
                                        var overrideSetting = _g[_f];
                                        if (lineNumber >= overrideSetting.range.startLineNumber && lineNumber <= overrideSetting.range.endLineNumber) {
                                            settings.push(__assign({}, overrideSetting, { index: index, groupId: group.id }));
                                        }
                                    }
                                }
                                else {
                                    settings.push(__assign({}, setting, { index: index, groupId: group.id }));
                                }
                            }
                            index++;
                        }
                    }
                }
            }
            return settings;
        };
        EditSettingRenderer.prototype.onMouseOver = function (editPreferenceWidget) {
            this.settingHighlighter.highlight(editPreferenceWidget.preferences[0]);
        };
        EditSettingRenderer.prototype.onEditSettingClicked = function (editPreferenceWidget, e) {
            var _this = this;
            var anchor = { x: e.event.posx, y: e.event.posy + 10 };
            var actions = this.getSettings(editPreferenceWidget.getLine()).length === 1 ? this.getActions(editPreferenceWidget.preferences[0], this.getConfigurationsMap()[editPreferenceWidget.preferences[0].key])
                : editPreferenceWidget.preferences.map(function (setting) { return new contextView_1.ContextSubMenu(setting.key, _this.getActions(setting, _this.getConfigurationsMap()[setting.key])); });
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return anchor; },
                getActions: function () { return winjs_base_1.TPromise.wrap(actions); }
            });
        };
        EditSettingRenderer.prototype.activateOnSetting = function (setting) {
            var _this = this;
            var startLine = setting.keyRange.startLineNumber;
            var settings = this.getSettings(startLine);
            if (!settings.length) {
                return false;
            }
            this.editPreferenceWidgetForMouseMove.show(startLine, '', settings);
            var actions = this.getActions(this.editPreferenceWidgetForMouseMove.preferences[0], this.getConfigurationsMap()[this.editPreferenceWidgetForMouseMove.preferences[0].key]);
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return _this.toAbsoluteCoords(new position_1.Position(startLine, 1)); },
                getActions: function () { return winjs_base_1.TPromise.wrap(actions); }
            });
            return true;
        };
        EditSettingRenderer.prototype.toAbsoluteCoords = function (position) {
            var positionCoords = this.editor.getScrolledVisiblePosition(position);
            var editorCoords = dom_1.getDomNodePagePosition(this.editor.getDomNode());
            var x = editorCoords.left + positionCoords.left;
            var y = editorCoords.top + positionCoords.top + positionCoords.height;
            return { x: x, y: y + 10 };
        };
        EditSettingRenderer.prototype.getConfigurationsMap = function () {
            return platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
        };
        EditSettingRenderer.prototype.getActions = function (setting, jsonSchema) {
            var _this = this;
            if (jsonSchema.type === 'boolean') {
                return [{
                        id: 'truthyValue',
                        label: 'true',
                        enabled: true,
                        run: function () { return _this.updateSetting(setting.key, true, setting); }
                    }, {
                        id: 'falsyValue',
                        label: 'false',
                        enabled: true,
                        run: function () { return _this.updateSetting(setting.key, false, setting); }
                    }];
            }
            if (jsonSchema.enum) {
                return jsonSchema.enum.map(function (value) {
                    return {
                        id: value,
                        label: JSON.stringify(value),
                        enabled: true,
                        run: function () { return _this.updateSetting(setting.key, value, setting); }
                    };
                });
            }
            return this.getDefaultActions(setting);
        };
        EditSettingRenderer.prototype.getDefaultActions = function (setting) {
            var _this = this;
            if (this.isDefaultSettings()) {
                var settingInOtherModel = this.associatedPreferencesModel.getPreference(setting.key);
                return [{
                        id: 'setDefaultValue',
                        label: settingInOtherModel ? nls.localize('replaceDefaultValue', "Replace in Settings") : nls.localize('copyDefaultValue', "Copy to Settings"),
                        enabled: true,
                        run: function () { return _this.updateSetting(setting.key, setting.value, setting); }
                    }];
            }
            return [];
        };
        EditSettingRenderer.prototype.updateSetting = function (key, value, source) {
            this._onUpdateSetting.fire({ key: key, value: value, source: source });
        };
        EditSettingRenderer = __decorate([
            __param(3, instantiation_1.IInstantiationService),
            __param(4, contextView_1.IContextMenuService)
        ], EditSettingRenderer);
        return EditSettingRenderer;
    }(lifecycle_1.Disposable));
    var SettingHighlighter = /** @class */ (function (_super) {
        __extends(SettingHighlighter, _super);
        function SettingHighlighter(editor, focusEventEmitter, clearFocusEventEmitter, instantiationService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.focusEventEmitter = focusEventEmitter;
            _this.clearFocusEventEmitter = clearFocusEventEmitter;
            _this.fixedHighlighter = _this._register(instantiationService.createInstance(rangeDecorations_1.RangeHighlightDecorations));
            _this.volatileHighlighter = _this._register(instantiationService.createInstance(rangeDecorations_1.RangeHighlightDecorations));
            _this.fixedHighlighter.onHighlghtRemoved(function () { return _this.clearFocusEventEmitter.fire(_this.highlightedSetting); });
            _this.volatileHighlighter.onHighlghtRemoved(function () { return _this.clearFocusEventEmitter.fire(_this.highlightedSetting); });
            return _this;
        }
        SettingHighlighter.prototype.highlight = function (setting, fix) {
            if (fix === void 0) { fix = false; }
            this.highlightedSetting = setting;
            this.volatileHighlighter.removeHighlightRange();
            this.fixedHighlighter.removeHighlightRange();
            var highlighter = fix ? this.fixedHighlighter : this.volatileHighlighter;
            highlighter.highlightRange({
                range: setting.valueRange,
                resource: this.editor.getModel().uri
            }, this.editor);
            this.editor.revealLineInCenterIfOutsideViewport(setting.valueRange.startLineNumber, 0 /* Smooth */);
            this.focusEventEmitter.fire(setting);
        };
        SettingHighlighter.prototype.clear = function (fix) {
            if (fix === void 0) { fix = false; }
            this.volatileHighlighter.removeHighlightRange();
            if (fix) {
                this.fixedHighlighter.removeHighlightRange();
            }
            this.clearFocusEventEmitter.fire(this.highlightedSetting);
        };
        SettingHighlighter = __decorate([
            __param(3, instantiation_1.IInstantiationService)
        ], SettingHighlighter);
        return SettingHighlighter;
    }(lifecycle_1.Disposable));
    var UnsupportedSettingsRenderer = /** @class */ (function (_super) {
        __extends(UnsupportedSettingsRenderer, _super);
        function UnsupportedSettingsRenderer(editor, settingsEditorModel, markerService, environmentService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.settingsEditorModel = settingsEditorModel;
            _this.markerService = markerService;
            _this.environmentService = environmentService;
            _this.decorationIds = [];
            _this.renderingDelayer = new async_1.Delayer(200);
            _this._register(_this.editor.getModel().onDidChangeContent(function () { return _this.renderingDelayer.trigger(function () { return _this.render(); }); }));
            return _this;
        }
        UnsupportedSettingsRenderer.prototype.render = function () {
            var _this = this;
            var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            var ranges = [];
            var markerData = [];
            for (var _i = 0, _a = this.settingsEditorModel.settingsGroups; _i < _a.length; _i++) {
                var settingsGroup = _a[_i];
                for (var _b = 0, _c = settingsGroup.sections; _b < _c.length; _b++) {
                    var section = _c[_b];
                    for (var _d = 0, _e = section.settings; _d < _e.length; _d++) {
                        var setting = _e[_d];
                        if (this.settingsEditorModel.configurationTarget === configuration_1.ConfigurationTarget.WORKSPACE || this.settingsEditorModel.configurationTarget === configuration_1.ConfigurationTarget.WORKSPACE_FOLDER) {
                            // Show warnings for executable settings
                            if (configurationRegistry[setting.key] && configurationRegistry[setting.key].isExecutable) {
                                markerData.push({
                                    severity: message_1.Severity.Warning,
                                    startLineNumber: setting.keyRange.startLineNumber,
                                    startColumn: setting.keyRange.startColumn,
                                    endLineNumber: setting.keyRange.endLineNumber,
                                    endColumn: setting.keyRange.endColumn,
                                    message: this.getMarkerMessage(setting.key)
                                });
                            }
                        }
                        if (this.settingsEditorModel.configurationTarget === configuration_1.ConfigurationTarget.WORKSPACE_FOLDER) {
                            // Dim and show information for window settings
                            if (configurationRegistry[setting.key] && configurationRegistry[setting.key].scope === configurationRegistry_1.ConfigurationScope.WINDOW) {
                                ranges.push({
                                    startLineNumber: setting.keyRange.startLineNumber,
                                    startColumn: setting.keyRange.startColumn - 1,
                                    endLineNumber: setting.valueRange.endLineNumber,
                                    endColumn: setting.valueRange.endColumn
                                });
                            }
                        }
                    }
                }
            }
            if (markerData.length) {
                this.markerService.changeOne('preferencesEditor', this.settingsEditorModel.uri, markerData);
            }
            else {
                this.markerService.remove('preferencesEditor', [this.settingsEditorModel.uri]);
            }
            this.editor.changeDecorations(function (changeAccessor) { return _this.decorationIds = changeAccessor.deltaDecorations(_this.decorationIds, ranges.map(function (range) { return _this.createDecoration(range, _this.editor.getModel()); })); });
        };
        UnsupportedSettingsRenderer.prototype.createDecoration = function (range, model) {
            return {
                range: range,
                options: !this.environmentService.isBuilt || this.environmentService.isExtensionDevelopment ? UnsupportedSettingsRenderer._DIM_CONFIGUARATION_DEV_MODE : UnsupportedSettingsRenderer._DIM_CONFIGUARATION_
            };
        };
        UnsupportedSettingsRenderer.prototype.getMarkerMessage = function (settingKey) {
            switch (settingKey) {
                case 'php.validate.executablePath':
                    return nls.localize('unsupportedPHPExecutablePathSetting', "This setting must be a User Setting. To configure PHP for the workspace, open a PHP file and click on 'PHP Path' in the status bar.");
                default:
                    return nls.localize('unsupportedWorkspaceSetting', "This setting must be a User Setting.");
            }
        };
        UnsupportedSettingsRenderer.prototype.dispose = function () {
            var _this = this;
            this.markerService.remove('preferencesEditor', [this.settingsEditorModel.uri]);
            if (this.decorationIds) {
                this.decorationIds = this.editor.changeDecorations(function (changeAccessor) {
                    return changeAccessor.deltaDecorations(_this.decorationIds, []);
                });
            }
            _super.prototype.dispose.call(this);
        };
        UnsupportedSettingsRenderer._DIM_CONFIGUARATION_ = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'dim-configuration',
            beforeContentClassName: 'unsupportedWorkbenhSettingInfo',
            hoverMessage: new htmlContent_1.MarkdownString().appendText(nls.localize('unsupportedWorkbenchSetting', "This setting cannot be applied now. It will be applied when you open this folder directly."))
        });
        UnsupportedSettingsRenderer._DIM_CONFIGUARATION_DEV_MODE = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'dim-configuration',
            beforeContentClassName: 'unsupportedWorkbenhSettingInfo',
            hoverMessage: new htmlContent_1.MarkdownString().appendText(nls.localize('unsupportedWorkbenchSettingDevMode', "This setting cannot be applied now. It will be applied if you define it's scope as 'resource' while registering, or when you open this folder directly."))
        });
        UnsupportedSettingsRenderer = __decorate([
            __param(2, markers_1.IMarkerService),
            __param(3, environment_1.IEnvironmentService)
        ], UnsupportedSettingsRenderer);
        return UnsupportedSettingsRenderer;
    }(lifecycle_1.Disposable));
    var WorkspaceConfigurationRenderer = /** @class */ (function (_super) {
        __extends(WorkspaceConfigurationRenderer, _super);
        function WorkspaceConfigurationRenderer(editor, workspaceSettingsEditorModel, workspaceContextService) {
            var _this = _super.call(this) || this;
            _this.editor = editor;
            _this.workspaceSettingsEditorModel = workspaceSettingsEditorModel;
            _this.workspaceContextService = workspaceContextService;
            _this.decorationIds = [];
            _this.renderingDelayer = new async_1.Delayer(200);
            _this._register(_this.editor.getModel().onDidChangeContent(function () { return _this.renderingDelayer.trigger(function () { return _this.render(_this.associatedSettingsEditorModel); }); }));
            return _this;
        }
        WorkspaceConfigurationRenderer.prototype.render = function (associatedSettingsEditorModel) {
            var _this = this;
            this.associatedSettingsEditorModel = associatedSettingsEditorModel;
            // Dim other configurations in workspace configuration file only in the context of Settings Editor
            if (this.associatedSettingsEditorModel && this.workspaceContextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE && this.workspaceSettingsEditorModel instanceof preferencesModels_1.WorkspaceConfigurationEditorModel) {
                this.editor.changeDecorations(function (changeAccessor) { return _this.decorationIds = changeAccessor.deltaDecorations(_this.decorationIds, []); });
                var ranges_1 = [];
                for (var _i = 0, _a = this.workspaceSettingsEditorModel.configurationGroups; _i < _a.length; _i++) {
                    var settingsGroup = _a[_i];
                    for (var _b = 0, _c = settingsGroup.sections; _b < _c.length; _b++) {
                        var section = _c[_b];
                        for (var _d = 0, _e = section.settings; _d < _e.length; _d++) {
                            var setting = _e[_d];
                            if (setting.key !== 'settings') {
                                ranges_1.push({
                                    startLineNumber: setting.keyRange.startLineNumber,
                                    startColumn: setting.keyRange.startColumn - 1,
                                    endLineNumber: setting.valueRange.endLineNumber,
                                    endColumn: setting.valueRange.endColumn
                                });
                            }
                        }
                    }
                }
                this.editor.changeDecorations(function (changeAccessor) { return _this.decorationIds = changeAccessor.deltaDecorations(_this.decorationIds, ranges_1.map(function (range) { return _this.createDecoration(range, _this.editor.getModel()); })); });
            }
        };
        WorkspaceConfigurationRenderer.prototype.createDecoration = function (range, model) {
            return {
                range: range,
                options: WorkspaceConfigurationRenderer._DIM_CONFIGURATION_
            };
        };
        WorkspaceConfigurationRenderer.prototype.dispose = function () {
            var _this = this;
            if (this.decorationIds) {
                this.decorationIds = this.editor.changeDecorations(function (changeAccessor) {
                    return changeAccessor.deltaDecorations(_this.decorationIds, []);
                });
            }
            _super.prototype.dispose.call(this);
        };
        WorkspaceConfigurationRenderer._DIM_CONFIGURATION_ = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'dim-configuration'
        });
        WorkspaceConfigurationRenderer = __decorate([
            __param(2, workspace_1.IWorkspaceContextService)
        ], WorkspaceConfigurationRenderer);
        return WorkspaceConfigurationRenderer;
    }(lifecycle_1.Disposable));
});
