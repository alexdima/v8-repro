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
define(["require", "exports", "vs/base/common/map", "vs/base/common/winjs.base", "vs/workbench/api/node/extHost.protocol", "vs/base/common/lifecycle", "./extHostCustomers", "vs/workbench/common/editor", "vs/platform/editor/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/parts/html/browser/webviewEditor", "vs/base/browser/builder", "vs/workbench/parts/html/browser/webview", "vs/platform/contextkey/common/contextkey", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/services/part/common/partService", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/workbench/browser/editor", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/opener/common/opener", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/group/common/groupService", "vs/platform/workspace/common/workspace"], function (require, exports, map, winjs_base_1, extHost_protocol_1, lifecycle_1, extHostCustomers_1, editor_1, editor_2, editorService_1, webviewEditor_1, builder_1, webview_1, contextkey_1, telemetry_1, themeService_1, partService_1, storage_1, contextView_1, editor_3, platform_1, descriptors_1, nls_1, environment_1, opener_1, instantiation_1, groupService_1, workspace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WebviewInput = /** @class */ (function (_super) {
        __extends(WebviewInput, _super);
        function WebviewInput(name, options, html, events) {
            var _this = _super.call(this) || this;
            _this.events = events;
            _this._name = name;
            _this._options = options;
            _this._html = html;
            return _this;
        }
        WebviewInput.prototype.getName = function () {
            return this._name;
        };
        WebviewInput.prototype.setName = function (value) {
            this._name = value;
            this._onDidChangeLabel.fire();
        };
        Object.defineProperty(WebviewInput.prototype, "html", {
            get: function () {
                return this._html;
            },
            set: function (value) {
                this._html = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebviewInput.prototype, "options", {
            get: function () {
                return this._options;
            },
            set: function (value) {
                this._options = value;
            },
            enumerable: true,
            configurable: true
        });
        WebviewInput.prototype.getTypeId = function () {
            return 'webview';
        };
        WebviewInput.prototype.resolve = function (refresh) {
            return winjs_base_1.TPromise.as(new editor_1.EditorModel());
        };
        return WebviewInput;
    }(editor_1.EditorInput));
    var WebviewEditor = /** @class */ (function (_super) {
        __extends(WebviewEditor, _super);
        function WebviewEditor(telemetryService, storageService, _contextKeyService, themeService, _partService, _contextViewService, _environmentService, _contextService, _openerService) {
            var _this = _super.call(this, WebviewEditor.ID, telemetryService, themeService, storageService, _contextKeyService) || this;
            _this._contextKeyService = _contextKeyService;
            _this._partService = _partService;
            _this._contextViewService = _contextViewService;
            _this._environmentService = _environmentService;
            _this._contextService = _contextService;
            _this._openerService = _openerService;
            _this._contentDisposables = [];
            return _this;
        }
        WebviewEditor.prototype.createEditor = function (parent) {
            this.frame = parent.getHTMLElement();
            this.container = this._partService.getContainer(partService_1.Parts.EDITOR_PART);
            this.webviewContent = document.createElement('div');
            this.webviewContent.id = "webview-" + WebviewEditor.webviewIndex++;
            this._contextKeyService = this._contextKeyService.createScoped(this.webviewContent);
            this.contextKey = webviewEditor_1.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FOCUS.bindTo(this._contextKeyService);
            this.findInputFocusContextKey = webviewEditor_1.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FIND_WIDGET_INPUT_FOCUSED.bindTo(this._contextKeyService);
            this.findWidgetVisible = webviewEditor_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE.bindTo(this._contextKeyService);
            this.container.appendChild(this.webviewContent);
            this.content = document.createElement('div');
            this.content.setAttribute('aria-flowto', this.webviewContent.id);
            parent.append(this.content);
            this.doUpdateContainer();
        };
        WebviewEditor.prototype.doUpdateContainer = function () {
            var frameRect = this.frame.getBoundingClientRect();
            var containerRect = this.container.getBoundingClientRect();
            this.webviewContent.style.position = 'absolute';
            this.webviewContent.style.top = frameRect.top - containerRect.top + "px";
            this.webviewContent.style.left = frameRect.left - containerRect.left + "px";
            this.webviewContent.style.width = frameRect.width + "px";
            this.webviewContent.style.height = frameRect.height + "px";
        };
        WebviewEditor.prototype.layout = function (dimension) {
            if (this._webview) {
                this.doUpdateContainer();
                this._webview.layout();
            }
        };
        WebviewEditor.prototype.focus = function () {
            if (this._webview) {
                this._webview.focus();
            }
        };
        WebviewEditor.prototype.dispose = function () {
            this._contentDisposables = lifecycle_1.dispose(this._contentDisposables);
            _super.prototype.dispose.call(this);
        };
        WebviewEditor.prototype.sendMessage = function (data) {
            if (this._webview) {
                this._webview.sendMessage(data);
            }
        };
        WebviewEditor.prototype.getFocusContainer = function () {
            return new builder_1.Builder(this.webviewContent, false);
        };
        WebviewEditor.prototype.setEditorVisible = function (visible, position) {
            if (visible) {
                this.webviewContent.style.visibility = 'visible';
                this.doUpdateContainer();
            }
            else {
                if (this._webview) {
                    this.webviewContent.style.visibility = 'hidden';
                }
            }
            _super.prototype.setEditorVisible.call(this, visible, position);
        };
        WebviewEditor.prototype.clearInput = function () {
            if (this.input && this.input instanceof WebviewInput) {
                if (this.input.options.keepAlive) {
                    // Noop
                    return;
                }
            }
            _super.prototype.clearInput.call(this);
        };
        WebviewEditor.prototype.setInput = function (input, options) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.input && this.input.matches(input)) {
                                return [2 /*return*/, undefined];
                            }
                            return [4 /*yield*/, _super.prototype.setInput.call(this, input, options)];
                        case 1:
                            _a.sent();
                            this.webview.options = {
                                allowScripts: input.options.enableScripts,
                                enableWrappedPostMessage: true
                            };
                            this.webview.contents = input.html;
                            this.webview.style(this.themeService.getTheme());
                            return [2 /*return*/];
                    }
                });
            });
        };
        Object.defineProperty(WebviewEditor.prototype, "webview", {
            get: function () {
                var _this = this;
                if (!this._webview) {
                    this._contentDisposables = lifecycle_1.dispose(this._contentDisposables);
                    this._webview = new webview_1.Webview(this.webviewContent, this._partService.getContainer(partService_1.Parts.EDITOR_PART), this._environmentService, this._contextService, this._contextViewService, this.contextKey, this.findInputFocusContextKey, {
                        enableWrappedPostMessage: true
                    }, false);
                    this.webview.style(this.themeService.getTheme());
                    this._webview.onDidClickLink(this.onDidClickLink, this, this._contentDisposables);
                    this.themeService.onThemeChange(function (theme) {
                        if (_this._webview) {
                            _this._webview.style(theme);
                        }
                    }, null, this._contentDisposables);
                    this._webview.onMessage(function (message) {
                        if (_this.input) {
                            _this.input.events.onMessage(message);
                        }
                    }, null, this._contentDisposables);
                    this._contentDisposables.push(this._webview);
                    this._contentDisposables.push(lifecycle_1.toDisposable(function () { return _this._webview = null; }));
                }
                return this._webview;
            },
            enumerable: true,
            configurable: true
        });
        WebviewEditor.prototype.onDidClickLink = function (link) {
            if (!link) {
                return;
            }
            var enableCommandUris = this.input.options.enableCommandUris;
            if (WebviewEditor.standardSupportedLinkSchemes.indexOf(link.scheme) >= 0 || enableCommandUris && link.scheme === 'command') {
                this._openerService.open(link);
            }
        };
        WebviewEditor.webviewIndex = 0;
        WebviewEditor.ID = 'WebviewEditor';
        WebviewEditor.standardSupportedLinkSchemes = ['http', 'https', 'mailto'];
        WebviewEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, storage_1.IStorageService),
            __param(2, contextkey_1.IContextKeyService),
            __param(3, themeService_1.IThemeService),
            __param(4, partService_1.IPartService),
            __param(5, contextView_1.IContextViewService),
            __param(6, environment_1.IEnvironmentService),
            __param(7, workspace_1.IWorkspaceContextService),
            __param(8, opener_1.IOpenerService)
        ], WebviewEditor);
        return WebviewEditor;
    }(webviewEditor_1.WebviewEditor));
    var MainThreadWebview = /** @class */ (function () {
        function MainThreadWebview(context, _editorGroupService, _editorService, _instantiationService) {
            this._editorService = _editorService;
            this._instantiationService = _instantiationService;
            this._toDispose = [];
            this._webviews = new Map();
            this._activeWebview = undefined;
            this._proxy = context.getProxy(extHost_protocol_1.ExtHostContext.ExtHostWebviews);
            _editorGroupService.onEditorsChanged(this.onEditorsChanged, this, this._toDispose);
        }
        MainThreadWebview.prototype.dispose = function () {
            lifecycle_1.dispose(this._toDispose);
        };
        MainThreadWebview.prototype.$createWebview = function (handle) {
            var _this = this;
            var webview = new WebviewInput('', {}, '', {
                onMessage: function (message) { return _this._proxy.$onMessage(handle, message); },
                onFocus: function () { return _this._proxy.$onBecameActive(handle); },
                onBlur: function () { return _this._proxy.$onBecameInactive(handle); }
            });
            this._webviews.set(handle, webview);
        };
        MainThreadWebview.prototype.$disposeWebview = function (handle) {
            var webview = this._webviews.get(handle);
            this._editorService.closeEditor(editor_2.Position.ONE, webview);
        };
        MainThreadWebview.prototype.$setTitle = function (handle, value) {
            var webview = this._webviews.get(handle);
            webview.setName(value);
        };
        MainThreadWebview.prototype.$setHtml = function (handle, value) {
            var _this = this;
            this.updateInput(handle, function (existingInput) {
                return _this._instantiationService.createInstance(WebviewInput, existingInput.getName(), existingInput.options, value, existingInput.events);
            });
        };
        MainThreadWebview.prototype.$setOptions = function (handle, newOptions) {
            var _this = this;
            this.updateInput(handle, function (existingInput) {
                return _this._instantiationService.createInstance(WebviewInput, existingInput.getName(), newOptions, existingInput.html, existingInput.events);
            });
        };
        MainThreadWebview.prototype.$show = function (handle, column) {
            var webviewInput = this._webviews.get(handle);
            this._editorService.openEditor(webviewInput, { pinned: true }, column);
        };
        MainThreadWebview.prototype.$sendMessage = function (handle, message) {
            return __awaiter(this, void 0, void 0, function () {
                var webviewInput, editors, _i, editors_1, editor;
                return __generator(this, function (_a) {
                    webviewInput = this._webviews.get(handle);
                    editors = this._editorService.getVisibleEditors()
                        .filter(function (e) { return e instanceof WebviewInput; })
                        .map(function (e) { return e; })
                        .filter(function (e) { return e.input.matches(webviewInput); });
                    for (_i = 0, editors_1 = editors; _i < editors_1.length; _i++) {
                        editor = editors_1[_i];
                        editor.sendMessage(message);
                    }
                    return [2 /*return*/, (editors.length > 0)];
                });
            });
        };
        MainThreadWebview.prototype.updateInput = function (handle, f) {
            var existingInput = this._webviews.get(handle);
            var newInput = f(existingInput);
            this._webviews.set(handle, newInput);
            this._editorService.replaceEditors([{ toReplace: existingInput, replaceWith: newInput }]);
        };
        MainThreadWebview.prototype.onEditorsChanged = function () {
            var activeEditor = this._editorService.getActiveEditor();
            var newActiveWebview = undefined;
            if (activeEditor.input instanceof WebviewInput) {
                for (var _i = 0, _a = map.keys(this._webviews); _i < _a.length; _i++) {
                    var handle = _a[_i];
                    var input = this._webviews.get(handle);
                    if (input.matches(activeEditor.input)) {
                        newActiveWebview = input;
                        break;
                    }
                }
            }
            if (newActiveWebview) {
                if (!this._activeWebview || !newActiveWebview.matches(this._activeWebview)) {
                    if (this._activeWebview) {
                        this._activeWebview.events.onBlur();
                    }
                    newActiveWebview.events.onFocus();
                    this._activeWebview = newActiveWebview;
                }
            }
            else {
                if (this._activeWebview) {
                    this._activeWebview.events.onBlur();
                    this._activeWebview = undefined;
                }
            }
        };
        MainThreadWebview = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadWebview),
            __param(1, groupService_1.IEditorGroupService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, instantiation_1.IInstantiationService)
        ], MainThreadWebview);
        return MainThreadWebview;
    }());
    exports.MainThreadWebview = MainThreadWebview;
    platform_1.Registry.as(editor_3.Extensions.Editors).registerEditor(new editor_3.EditorDescriptor(WebviewEditor, WebviewEditor.ID, nls_1.localize('webview.editor.label', "webview editor")), [new descriptors_1.SyncDescriptor(WebviewInput)]);
});
