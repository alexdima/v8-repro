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
define(["require", "exports", "vs/nls", "os", "vs/platform/node/product", "vs/base/common/uri", "vs/workbench/common/editor", "vs/platform/node/package", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/workbench/browser/parts/editor/baseEditor", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/workbench/services/editor/common/editorService", "vs/platform/extensions/common/extensions", "vs/platform/list/browser/listService", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/message/common/message", "vs/base/common/lifecycle", "vs/base/common/async", "electron", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/contextview/browser/contextView", "vs/platform/windows/common/windows", "vs/base/node/pfs", "vs/platform/environment/common/environment", "vs/base/common/decorators", "vs/base/common/arrays", "vs/workbench/parts/extensions/browser/extensionsActions", "vs/css!./media/runtimeExtensionsEditor"], function (require, exports, nls, os, product_1, uri_1, editor_1, package_1, winjs_base_1, actions_1, baseEditor_1, telemetry_1, instantiation_1, extensions_1, themeService_1, editorService_1, extensions_2, listService_1, dom_1, actionbar_1, message_1, lifecycle_1, async_1, electron_1, extensionManagement_1, contextView_1, windows_1, pfs_1, environment_1, decorators_1, arrays_1, extensionsActions_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionHostProfileService = instantiation_1.createDecorator('extensionHostProfileService');
    var ProfileSessionState;
    (function (ProfileSessionState) {
        ProfileSessionState[ProfileSessionState["None"] = 0] = "None";
        ProfileSessionState[ProfileSessionState["Starting"] = 1] = "Starting";
        ProfileSessionState[ProfileSessionState["Running"] = 2] = "Running";
        ProfileSessionState[ProfileSessionState["Stopping"] = 3] = "Stopping";
    })(ProfileSessionState = exports.ProfileSessionState || (exports.ProfileSessionState = {}));
    var RuntimeExtensionsEditor = /** @class */ (function (_super) {
        __extends(RuntimeExtensionsEditor, _super);
        function RuntimeExtensionsEditor(telemetryService, themeService, _extensionsWorkbenchService, _extensionService, _messageService, _contextMenuService, _instantiationService, _extensionHostProfileService) {
            var _this = _super.call(this, RuntimeExtensionsEditor.ID, telemetryService, themeService) || this;
            _this._extensionsWorkbenchService = _extensionsWorkbenchService;
            _this._extensionService = _extensionService;
            _this._messageService = _messageService;
            _this._contextMenuService = _contextMenuService;
            _this._instantiationService = _instantiationService;
            _this._extensionHostProfileService = _extensionHostProfileService;
            _this._list = null;
            _this._profileInfo = _this._extensionHostProfileService.lastProfile;
            _this._register(_this._extensionHostProfileService.onDidChangeLastProfile(function () {
                _this._profileInfo = _this._extensionHostProfileService.lastProfile;
                _this._updateExtensions();
            }));
            _this._elements = null;
            _this._extensionsDescriptions = [];
            _this._updateExtensions();
            _this._updateSoon = _this._register(new async_1.RunOnceScheduler(function () { return _this._updateExtensions(); }, 200));
            _this._extensionService.getExtensions().then(function (extensions) {
                // We only deal with extensions with source code!
                _this._extensionsDescriptions = extensions.filter(function (extension) {
                    return !!extension.main;
                });
                _this._updateExtensions();
            });
            _this._register(_this._extensionService.onDidChangeExtensionsStatus(function () { return _this._updateSoon.schedule(); }));
            return _this;
        }
        RuntimeExtensionsEditor.prototype._updateExtensions = function () {
            this._elements = this._resolveExtensions();
            if (this._list) {
                this._list.splice(0, this._list.length, this._elements);
            }
        };
        RuntimeExtensionsEditor.prototype._resolveExtensions = function () {
            var marketplaceMap = Object.create(null);
            for (var _i = 0, _a = this._extensionsWorkbenchService.local; _i < _a.length; _i++) {
                var extension = _a[_i];
                marketplaceMap[extension.id] = extension;
            }
            var statusMap = this._extensionService.getExtensionsStatus();
            // group profile segments by extension
            var segments = Object.create(null);
            if (this._profileInfo) {
                var currentStartTime = this._profileInfo.startTime;
                for (var i = 0, len = this._profileInfo.deltas.length; i < len; i++) {
                    var id = this._profileInfo.ids[i];
                    var delta = this._profileInfo.deltas[i];
                    var extensionSegments = segments[id];
                    if (!extensionSegments) {
                        extensionSegments = [];
                        segments[id] = extensionSegments;
                    }
                    extensionSegments.push(currentStartTime);
                    currentStartTime = currentStartTime + delta;
                    extensionSegments.push(currentStartTime);
                }
            }
            var result = [];
            for (var i = 0, len = this._extensionsDescriptions.length; i < len; i++) {
                var extensionDescription = this._extensionsDescriptions[i];
                var profileInfo = null;
                if (this._profileInfo) {
                    var extensionSegments = segments[extensionDescription.id] || [];
                    var extensionTotalTime = 0;
                    for (var j = 0, lenJ = extensionSegments.length / 2; j < lenJ; j++) {
                        var startTime = extensionSegments[2 * j];
                        var endTime = extensionSegments[2 * j + 1];
                        extensionTotalTime += (endTime - startTime);
                    }
                    profileInfo = {
                        segments: extensionSegments,
                        totalTime: extensionTotalTime
                    };
                }
                result[i] = {
                    originalIndex: i,
                    description: extensionDescription,
                    marketplaceInfo: marketplaceMap[extensionDescription.id],
                    status: statusMap[extensionDescription.id],
                    profileInfo: profileInfo
                };
            }
            result = result.filter(function (element) { return element.status.activationTimes; });
            if (this._profileInfo) {
                // sort descending by time spent in the profiler
                result = result.sort(function (a, b) {
                    if (a.profileInfo.totalTime === b.profileInfo.totalTime) {
                        return a.originalIndex - b.originalIndex;
                    }
                    return b.profileInfo.totalTime - a.profileInfo.totalTime;
                });
            }
            return result;
        };
        RuntimeExtensionsEditor.prototype.createEditor = function (parent) {
            var _this = this;
            var container = parent.getHTMLElement();
            dom_1.addClass(container, 'runtime-extensions-editor');
            var TEMPLATE_ID = 'runtimeExtensionElementTemplate';
            var delegate = new /** @class */ (function () {
                function class_1() {
                }
                class_1.prototype.getHeight = function (element) {
                    return 62;
                };
                class_1.prototype.getTemplateId = function (element) {
                    return TEMPLATE_ID;
                };
                return class_1;
            }());
            var renderer = {
                templateId: TEMPLATE_ID,
                renderTemplate: function (root) {
                    var element = dom_1.append(root, dom_1.$('.extension'));
                    var desc = dom_1.append(element, dom_1.$('div.desc'));
                    var name = dom_1.append(desc, dom_1.$('div.name'));
                    var msgContainer = dom_1.append(desc, dom_1.$('div.msg'));
                    var msgIcon = dom_1.append(msgContainer, dom_1.$('.'));
                    var msgLabel = dom_1.append(msgContainer, dom_1.$('span.msg-label'));
                    var timeContainer = dom_1.append(element, dom_1.$('.time'));
                    var activationTime = dom_1.append(timeContainer, dom_1.$('div.activation-time'));
                    var profileTime = dom_1.append(timeContainer, dom_1.$('div.profile-time'));
                    var profileTimeline = dom_1.append(element, dom_1.$('div.profile-timeline'));
                    var actionbar = new actionbar_1.ActionBar(element, {
                        animated: false
                    });
                    actionbar.onDidRun(function (_a) {
                        var error = _a.error;
                        return error && _this._messageService.show(message_1.Severity.Error, error);
                    });
                    actionbar.push(new ReportExtensionIssueAction(), { icon: true, label: true });
                    var disposables = [actionbar];
                    return {
                        root: root,
                        element: element,
                        name: name,
                        actionbar: actionbar,
                        activationTime: activationTime,
                        profileTime: profileTime,
                        profileTimeline: profileTimeline,
                        msgIcon: msgIcon,
                        msgLabel: msgLabel,
                        disposables: disposables,
                        elementDisposables: []
                    };
                },
                renderElement: function (element, index, data) {
                    data.elementDisposables = lifecycle_1.dispose(data.elementDisposables);
                    dom_1.toggleClass(data.root, 'odd', index % 2 === 1);
                    data.name.textContent = element.marketplaceInfo ? element.marketplaceInfo.displayName : element.description.displayName;
                    var activationTimes = element.status.activationTimes;
                    var syncTime = activationTimes.codeLoadingTime + activationTimes.activateCallTime;
                    data.activationTime.textContent = activationTimes.startup ? "Startup Activation: " + syncTime + "ms" : "Activation: " + syncTime + "ms";
                    data.actionbar.context = element;
                    dom_1.toggleClass(data.actionbar.getContainer().getHTMLElement(), 'hidden', element.marketplaceInfo && element.marketplaceInfo.type === extensionManagement_1.LocalExtensionType.User && (!element.description.repository || !element.description.repository.url));
                    var title;
                    if (activationTimes.activationEvent === '*') {
                        title = nls.localize('starActivation', "Activated on start-up");
                    }
                    else if (/^workspaceContains:/.test(activationTimes.activationEvent)) {
                        var fileNameOrGlob = activationTimes.activationEvent.substr('workspaceContains:'.length);
                        if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0) {
                            title = nls.localize('workspaceContainsGlobActivation', "Activated because a file matching {0} exists in your workspace", fileNameOrGlob);
                        }
                        else {
                            title = nls.localize('workspaceContainsFileActivation', "Activated because file {0} exists in your workspace", fileNameOrGlob);
                        }
                    }
                    else if (/^onLanguage:/.test(activationTimes.activationEvent)) {
                        var language = activationTimes.activationEvent.substr('onLanguage:'.length);
                        title = nls.localize('languageActivation', "Activated because you opened a {0} file", language);
                    }
                    else {
                        title = nls.localize('workspaceGenericActivation', "Activated on {0}", activationTimes.activationEvent);
                    }
                    data.activationTime.title = title;
                    if (!arrays_1.isFalsyOrEmpty(element.status.runtimeErrors)) {
                        data.msgIcon.className = 'octicon octicon-bug';
                        data.msgLabel.textContent = nls.localize('errors', "{0} uncaught errors", element.status.runtimeErrors.length);
                    }
                    else if (element.status.messages && element.status.messages.length > 0) {
                        data.msgIcon.className = 'octicon octicon-alert';
                        data.msgLabel.textContent = element.status.messages[0].message;
                    }
                    else {
                        data.msgIcon.className = '';
                        data.msgLabel.textContent = '';
                    }
                    if (_this._profileInfo) {
                        data.profileTime.textContent = "Profile: " + (element.profileInfo.totalTime / 1000).toFixed(2) + "ms";
                        var elementSegments = element.profileInfo.segments;
                        var inner = '<rect x="0" y="99" width="100" height="1" />';
                        for (var i = 0, len = elementSegments.length / 2; i < len; i++) {
                            var absoluteStart = elementSegments[2 * i];
                            var absoluteEnd = elementSegments[2 * i + 1];
                            var start = absoluteStart - _this._profileInfo.startTime;
                            var end = absoluteEnd - _this._profileInfo.startTime;
                            var absoluteDuration = _this._profileInfo.endTime - _this._profileInfo.startTime;
                            var xStart = start / absoluteDuration * 100;
                            var xEnd = end / absoluteDuration * 100;
                            inner += "<rect x=\"" + xStart + "\" y=\"0\" width=\"" + (xEnd - xStart) + "\" height=\"100\" />";
                        }
                        var svg = "<svg class=\"profile-timeline-svg\" preserveAspectRatio=\"none\" height=\"16\" viewBox=\"0 0 100 100\">" + inner + "</svg>";
                        data.profileTimeline.innerHTML = svg;
                        data.profileTimeline.style.display = 'inherit';
                    }
                    else {
                        data.profileTime.textContent = '';
                        data.profileTimeline.innerHTML = '';
                    }
                },
                disposeTemplate: function (data) {
                    data.disposables = lifecycle_1.dispose(data.disposables);
                }
            };
            this._list = this._instantiationService.createInstance(listService_1.WorkbenchList, container, delegate, [renderer], {
                multipleSelectionSupport: false
            });
            this._list.splice(0, this._list.length, this._elements);
            this._list.onContextMenu(function (e) {
                var actions = [];
                if (e.element.marketplaceInfo.type === extensionManagement_1.LocalExtensionType.User) {
                    actions.push(_this._instantiationService.createInstance(extensionsActions_1.DisableForWorkspaceAction, extensionsActions_1.DisableForWorkspaceAction.LABEL));
                    actions.push(_this._instantiationService.createInstance(extensionsActions_1.DisableGloballyAction, extensionsActions_1.DisableGloballyAction.LABEL));
                    actions.forEach(function (a) { return a.extension = e.element.marketplaceInfo; });
                    actions.push(new actionbar_1.Separator());
                }
                actions.push(_this.extensionHostProfileAction, _this.saveExtensionHostProfileAction);
                _this._contextMenuService.showContextMenu({
                    getAnchor: function () { return e.anchor; },
                    getActions: function () { return winjs_base_1.TPromise.as(actions); }
                });
            });
        };
        RuntimeExtensionsEditor.prototype.getActions = function () {
            return [
                this.saveExtensionHostProfileAction,
                this.extensionHostProfileAction
            ];
        };
        Object.defineProperty(RuntimeExtensionsEditor.prototype, "extensionHostProfileAction", {
            get: function () {
                return this._instantiationService.createInstance(ExtensionHostProfileAction, ExtensionHostProfileAction.ID, ExtensionHostProfileAction.LABEL_START);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RuntimeExtensionsEditor.prototype, "saveExtensionHostProfileAction", {
            get: function () {
                return this._instantiationService.createInstance(SaveExtensionHostProfileAction, SaveExtensionHostProfileAction.ID, SaveExtensionHostProfileAction.LABEL);
            },
            enumerable: true,
            configurable: true
        });
        RuntimeExtensionsEditor.prototype.layout = function (dimension) {
            this._list.layout(dimension.height);
        };
        RuntimeExtensionsEditor.ID = 'workbench.editor.runtimeExtensions';
        __decorate([
            decorators_1.memoize
        ], RuntimeExtensionsEditor.prototype, "extensionHostProfileAction", null);
        __decorate([
            decorators_1.memoize
        ], RuntimeExtensionsEditor.prototype, "saveExtensionHostProfileAction", null);
        RuntimeExtensionsEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, themeService_1.IThemeService),
            __param(2, extensions_1.IExtensionsWorkbenchService),
            __param(3, extensions_2.IExtensionService),
            __param(4, message_1.IMessageService),
            __param(5, contextView_1.IContextMenuService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, exports.IExtensionHostProfileService)
        ], RuntimeExtensionsEditor);
        return RuntimeExtensionsEditor;
    }(baseEditor_1.BaseEditor));
    exports.RuntimeExtensionsEditor = RuntimeExtensionsEditor;
    var RuntimeExtensionsInput = /** @class */ (function (_super) {
        __extends(RuntimeExtensionsInput, _super);
        function RuntimeExtensionsInput() {
            return _super.call(this) || this;
        }
        RuntimeExtensionsInput.prototype.getTypeId = function () {
            return RuntimeExtensionsInput.ID;
        };
        RuntimeExtensionsInput.prototype.getName = function () {
            return nls.localize('extensionsInputName', "Running Extensions");
        };
        RuntimeExtensionsInput.prototype.matches = function (other) {
            if (!(other instanceof RuntimeExtensionsInput)) {
                return false;
            }
            return true;
        };
        RuntimeExtensionsInput.prototype.resolve = function (refresh) {
            return winjs_base_1.TPromise.as(null);
        };
        RuntimeExtensionsInput.prototype.supportsSplitEditor = function () {
            return false;
        };
        RuntimeExtensionsInput.prototype.getResource = function () {
            return uri_1.default.from({
                scheme: 'runtime-extensions',
                path: 'default'
            });
        };
        RuntimeExtensionsInput.ID = 'workbench.runtimeExtensions.input';
        return RuntimeExtensionsInput;
    }(editor_1.EditorInput));
    exports.RuntimeExtensionsInput = RuntimeExtensionsInput;
    var ShowRuntimeExtensionsAction = /** @class */ (function (_super) {
        __extends(ShowRuntimeExtensionsAction, _super);
        function ShowRuntimeExtensionsAction(id, label, _editorService, _instantiationService) {
            var _this = _super.call(this, id, label) || this;
            _this._editorService = _editorService;
            _this._instantiationService = _instantiationService;
            return _this;
        }
        ShowRuntimeExtensionsAction.prototype.run = function (e) {
            return this._editorService.openEditor(this._instantiationService.createInstance(RuntimeExtensionsInput), { revealIfOpened: true });
        };
        ShowRuntimeExtensionsAction.ID = 'workbench.action.showRuntimeExtensions';
        ShowRuntimeExtensionsAction.LABEL = nls.localize('showRuntimeExtensions', "Show Running Extensions");
        ShowRuntimeExtensionsAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, instantiation_1.IInstantiationService)
        ], ShowRuntimeExtensionsAction);
        return ShowRuntimeExtensionsAction;
    }(actions_1.Action));
    exports.ShowRuntimeExtensionsAction = ShowRuntimeExtensionsAction;
    var ReportExtensionIssueAction = /** @class */ (function (_super) {
        __extends(ReportExtensionIssueAction, _super);
        function ReportExtensionIssueAction(id, label) {
            if (id === void 0) { id = ReportExtensionIssueAction.ID; }
            if (label === void 0) { label = ReportExtensionIssueAction.LABEL; }
            return _super.call(this, id, label, 'extension-action report-issue') || this;
        }
        ReportExtensionIssueAction.prototype.run = function (extension) {
            electron_1.clipboard.writeText('```json \n' + JSON.stringify(extension.status, null, '\t') + '\n```');
            window.open(this.generateNewIssueUrl(extension));
            return winjs_base_1.TPromise.as(null);
        };
        ReportExtensionIssueAction.prototype.generateNewIssueUrl = function (extension) {
            var baseUrl = extension.marketplaceInfo && extension.marketplaceInfo.type === extensionManagement_1.LocalExtensionType.User && extension.description.repository ? extension.description.repository.url : undefined;
            if (!!baseUrl) {
                baseUrl = (baseUrl.indexOf('.git') !== -1 ? baseUrl.substr(0, baseUrl.length - 4) : baseUrl) + "/issues/new/";
            }
            else {
                baseUrl = product_1.default.reportIssueUrl;
            }
            var osVersion = os.type() + " " + os.arch() + " " + os.release();
            var queryStringPrefix = baseUrl.indexOf('?') === -1 ? '?' : '&';
            var body = encodeURIComponent("- Extension Name: " + extension.description.name + "\n- Extension Version: " + extension.description.version + "\n- OS Version: " + osVersion + "\n- VSCode version: " + package_1.default.version + '\n\n We have written the needed data into your clipboard. Please paste:');
            return "" + baseUrl + queryStringPrefix + "body=" + body;
        };
        ReportExtensionIssueAction.ID = 'workbench.extensions.action.reportExtensionIssue';
        ReportExtensionIssueAction.LABEL = nls.localize('reportExtensionIssue', "Report Issue");
        return ReportExtensionIssueAction;
    }(actions_1.Action));
    var ExtensionHostProfileAction = /** @class */ (function (_super) {
        __extends(ExtensionHostProfileAction, _super);
        function ExtensionHostProfileAction(id, label, _extensionHostProfileService) {
            if (id === void 0) { id = ExtensionHostProfileAction.ID; }
            if (label === void 0) { label = ExtensionHostProfileAction.LABEL_START; }
            var _this = _super.call(this, id, label, ExtensionHostProfileAction.START_CSS_CLASS) || this;
            _this._extensionHostProfileService = _extensionHostProfileService;
            _this._extensionHostProfileService.onDidChangeState(function () { return _this._update(); });
            return _this;
        }
        ExtensionHostProfileAction.prototype._update = function () {
            var state = this._extensionHostProfileService.state;
            if (state === 2 /* Running */) {
                this.class = ExtensionHostProfileAction.STOP_CSS_CLASS;
                this.label = ExtensionHostProfileAction.LABEL_STOP;
            }
            else {
                this.class = ExtensionHostProfileAction.START_CSS_CLASS;
                this.label = ExtensionHostProfileAction.LABEL_START;
            }
        };
        ExtensionHostProfileAction.prototype.run = function () {
            var state = this._extensionHostProfileService.state;
            if (state === 2 /* Running */) {
                this._extensionHostProfileService.stopProfiling();
            }
            else if (state === 0 /* None */) {
                this._extensionHostProfileService.startProfiling();
            }
            return winjs_base_1.TPromise.as(null);
        };
        ExtensionHostProfileAction.ID = 'workbench.extensions.action.extensionHostProfile';
        ExtensionHostProfileAction.LABEL_START = nls.localize('extensionHostProfileStart', "Start Extension Host Profile");
        ExtensionHostProfileAction.LABEL_STOP = nls.localize('extensionHostProfileStop', "Stop Extension Host Profile");
        ExtensionHostProfileAction.STOP_CSS_CLASS = 'extension-host-profile-stop';
        ExtensionHostProfileAction.START_CSS_CLASS = 'extension-host-profile-start';
        ExtensionHostProfileAction = __decorate([
            __param(2, exports.IExtensionHostProfileService)
        ], ExtensionHostProfileAction);
        return ExtensionHostProfileAction;
    }(actions_1.Action));
    var SaveExtensionHostProfileAction = /** @class */ (function (_super) {
        __extends(SaveExtensionHostProfileAction, _super);
        function SaveExtensionHostProfileAction(id, label, _windowService, _environmentService, _extensionHostProfileService) {
            if (id === void 0) { id = SaveExtensionHostProfileAction.ID; }
            if (label === void 0) { label = SaveExtensionHostProfileAction.LABEL; }
            var _this = _super.call(this, id, label, 'save-extension-host-profile', false) || this;
            _this._windowService = _windowService;
            _this._environmentService = _environmentService;
            _this._extensionHostProfileService = _extensionHostProfileService;
            _this.enabled = (_this._extensionHostProfileService.lastProfile !== null);
            _this._extensionHostProfileService.onDidChangeLastProfile(function () {
                _this.enabled = (_this._extensionHostProfileService.lastProfile !== null);
            });
            return _this;
        }
        SaveExtensionHostProfileAction.prototype.run = function () {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var picked, profileInfo, dataToWrite, profiler, tmp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._windowService.showSaveDialog({
                                title: 'Save Extension Host Profile',
                                buttonLabel: 'Save',
                                defaultPath: "CPU-" + new Date().toISOString().replace(/[\-:]/g, '') + ".cpuprofile",
                                filters: [{
                                        name: 'CPU Profiles',
                                        extensions: ['cpuprofile', 'txt']
                                    }]
                            })];
                        case 1:
                            picked = _a.sent();
                            if (!picked) {
                                return [2 /*return*/];
                            }
                            profileInfo = this._extensionHostProfileService.lastProfile;
                            dataToWrite = profileInfo.data;
                            if (!this._environmentService.isBuilt) return [3 /*break*/, 3];
                            return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(['v8-inspect-profiler'], resolve_1, reject_1); })];
                        case 2:
                            profiler = _a.sent();
                            tmp = profiler.rewriteAbsolutePaths({ profile: dataToWrite }, 'piiRemoved');
                            dataToWrite = tmp.profile;
                            picked = picked + '.txt';
                            _a.label = 3;
                        case 3: return [2 /*return*/, pfs_1.writeFile(picked, JSON.stringify(profileInfo.data, null, '\t'))];
                    }
                });
            });
        };
        SaveExtensionHostProfileAction.LABEL = nls.localize('saveExtensionHostProfile', "Save Extension Host Profile");
        SaveExtensionHostProfileAction.ID = 'workbench.extensions.action.saveExtensionHostProfile';
        SaveExtensionHostProfileAction = __decorate([
            __param(2, windows_1.IWindowService),
            __param(3, environment_1.IEnvironmentService),
            __param(4, exports.IExtensionHostProfileService)
        ], SaveExtensionHostProfileAction);
        return SaveExtensionHostProfileAction;
    }(actions_1.Action));
});
