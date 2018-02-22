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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/editor/textEditorModel", "vs/workbench/parts/html/common/htmlInput", "vs/platform/theme/common/themeService", "vs/platform/opener/common/opener", "vs/editor/common/services/resolverService", "vs/workbench/services/part/common/partService", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "./webview", "vs/platform/storage/common/storage", "./webviewEditor", "vs/platform/environment/common/environment", "vs/platform/workspace/common/workspace"], function (require, exports, nls_1, winjs_base_1, lifecycle_1, telemetry_1, textEditorModel_1, htmlInput_1, themeService_1, opener_1, resolverService_1, partService_1, contextView_1, contextkey_1, webview_1, storage_1, webviewEditor_1, environment_1, workspace_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An implementation of editor for showing HTML content in an IFrame by leveraging the HTML input.
     */
    var HtmlPreviewPart = /** @class */ (function (_super) {
        __extends(HtmlPreviewPart, _super);
        function HtmlPreviewPart(telemetryService, themeService, storageService, contextKeyService, textModelResolverService, openerService, partService, _contextViewService, _environmentService, _contextService) {
            var _this = _super.call(this, HtmlPreviewPart.ID, telemetryService, themeService, storageService, contextKeyService) || this;
            _this.textModelResolverService = textModelResolverService;
            _this.openerService = openerService;
            _this.partService = partService;
            _this._contextViewService = _contextViewService;
            _this._environmentService = _environmentService;
            _this._contextService = _contextService;
            _this._modelChangeSubscription = lifecycle_1.empty;
            _this._themeChangeSubscription = lifecycle_1.empty;
            _this.scrollYPercentage = 0;
            return _this;
        }
        Object.defineProperty(HtmlPreviewPart.prototype, "model", {
            get: function () { return this._modelRef && this._modelRef.object.textEditorModel; },
            enumerable: true,
            configurable: true
        });
        HtmlPreviewPart.prototype.dispose = function () {
            // remove from dom
            this._webviewDisposables = lifecycle_1.dispose(this._webviewDisposables);
            // unhook listeners
            this._themeChangeSubscription.dispose();
            this._modelChangeSubscription.dispose();
            // dipose model ref
            lifecycle_1.dispose(this._modelRef);
            _super.prototype.dispose.call(this);
        };
        HtmlPreviewPart.prototype.createEditor = function (parent) {
            this.content = document.createElement('div');
            this.content.style.position = 'absolute';
            this.content.classList.add(HtmlPreviewPart.class);
            parent.getHTMLElement().appendChild(this.content);
        };
        Object.defineProperty(HtmlPreviewPart.prototype, "webview", {
            get: function () {
                var _this = this;
                if (!this._webview) {
                    var webviewOptions = {};
                    if (this.input && this.input instanceof htmlInput_1.HtmlInput) {
                        webviewOptions = this.input.options;
                    }
                    this._webview = new webview_1.Webview(this.content, this.partService.getContainer(partService_1.Parts.EDITOR_PART), this._environmentService, this._contextService, this._contextViewService, this.contextKey, this.findInputFocusContextKey, webviewOptions, true);
                    if (this.input && this.input instanceof htmlInput_1.HtmlInput) {
                        var state = this.loadViewState(this.input.getResource());
                        this.scrollYPercentage = state ? state.scrollYPercentage : 0;
                        this.webview.initialScrollProgress = this.scrollYPercentage;
                        var resourceUri = this.input.getResource();
                        this.webview.baseUrl = resourceUri.toString(true);
                    }
                    this.onThemeChange(this.themeService.getTheme());
                    this._webviewDisposables = [
                        this._webview,
                        this._webview.onDidClickLink(function (uri) { return _this.openerService.open(uri); }),
                        this._webview.onDidScroll(function (data) {
                            _this.scrollYPercentage = data.scrollYPercentage;
                        }),
                    ];
                }
                return this._webview;
            },
            enumerable: true,
            configurable: true
        });
        HtmlPreviewPart.prototype.changePosition = function (position) {
            // what this actually means is that we got reparented. that
            // has caused the webview to stop working and we need to reset it
            this._doSetVisible(false);
            this._doSetVisible(true);
            _super.prototype.changePosition.call(this, position);
        };
        HtmlPreviewPart.prototype.setEditorVisible = function (visible, position) {
            this._doSetVisible(visible);
            _super.prototype.setEditorVisible.call(this, visible, position);
        };
        HtmlPreviewPart.prototype._doSetVisible = function (visible) {
            var _this = this;
            if (!visible) {
                this._themeChangeSubscription.dispose();
                this._modelChangeSubscription.dispose();
                this._webviewDisposables = lifecycle_1.dispose(this._webviewDisposables);
                this._webview = undefined;
            }
            else {
                this._themeChangeSubscription = this.themeService.onThemeChange(this.onThemeChange.bind(this));
                if (this._hasValidModel()) {
                    this._modelChangeSubscription = this.model.onDidChangeContent(function () { return _this.webview.contents = _this.model.getLinesContent().join('\n'); });
                    this.webview.contents = this.model.getLinesContent().join('\n');
                }
            }
        };
        HtmlPreviewPart.prototype._hasValidModel = function () {
            return this._modelRef && this.model && !this.model.isDisposed();
        };
        HtmlPreviewPart.prototype.layout = function (dimension) {
            var width = dimension.width, height = dimension.height;
            this.content.style.width = width + "px";
            this.content.style.height = height + "px";
            if (this._webview) {
                this._webview.layout();
            }
        };
        HtmlPreviewPart.prototype.focus = function () {
            this.webview.focus();
        };
        HtmlPreviewPart.prototype.clearInput = function () {
            if (this.input instanceof htmlInput_1.HtmlInput) {
                this.saveViewState(this.input.getResource(), {
                    scrollYPercentage: this.scrollYPercentage
                });
            }
            lifecycle_1.dispose(this._modelRef);
            this._modelRef = undefined;
            _super.prototype.clearInput.call(this);
        };
        HtmlPreviewPart.prototype.shutdown = function () {
            if (this.input instanceof htmlInput_1.HtmlInput) {
                this.saveViewState(this.input.getResource(), {
                    scrollYPercentage: this.scrollYPercentage
                });
            }
            _super.prototype.shutdown.call(this);
        };
        HtmlPreviewPart.prototype.sendMessage = function (data) {
            this.webview.sendMessage(data);
        };
        HtmlPreviewPart.prototype.setInput = function (input, options) {
            var _this = this;
            if (this.input && this.input.matches(input) && this._hasValidModel() && this.input instanceof htmlInput_1.HtmlInput && input instanceof htmlInput_1.HtmlInput && htmlInput_1.areHtmlInputOptionsEqual(this.input.options, input.options)) {
                return winjs_base_1.TPromise.as(undefined);
            }
            var oldOptions = undefined;
            if (this.input instanceof htmlInput_1.HtmlInput) {
                oldOptions = this.input.options;
                this.saveViewState(this.input.getResource(), {
                    scrollYPercentage: this.scrollYPercentage
                });
            }
            if (this._modelRef) {
                this._modelRef.dispose();
            }
            this._modelChangeSubscription.dispose();
            if (!(input instanceof htmlInput_1.HtmlInput)) {
                return winjs_base_1.TPromise.wrapError(new Error('Invalid input'));
            }
            return _super.prototype.setInput.call(this, input, options).then(function () {
                var resourceUri = input.getResource();
                return _this.textModelResolverService.createModelReference(resourceUri).then(function (ref) {
                    var model = ref.object;
                    if (model instanceof textEditorModel_1.BaseTextEditorModel) {
                        _this._modelRef = ref;
                    }
                    if (!_this.model) {
                        return winjs_base_1.TPromise.wrapError(new Error(nls_1.localize('html.voidInput', "Invalid editor input.")));
                    }
                    if (oldOptions && !htmlInput_1.areHtmlInputOptionsEqual(oldOptions, input.options)) {
                        _this._doSetVisible(false);
                    }
                    _this._modelChangeSubscription = _this.model.onDidChangeContent(function () {
                        if (_this.model) {
                            _this.scrollYPercentage = 0;
                            _this.webview.contents = _this.model.getLinesContent().join('\n');
                        }
                    });
                    var state = _this.loadViewState(resourceUri);
                    _this.scrollYPercentage = state ? state.scrollYPercentage : 0;
                    _this.webview.baseUrl = resourceUri.toString(true);
                    _this.webview.options = input.options;
                    _this.webview.contents = _this.model.getLinesContent().join('\n');
                    _this.webview.initialScrollProgress = _this.scrollYPercentage;
                    return undefined;
                });
            });
        };
        HtmlPreviewPart.ID = 'workbench.editor.htmlPreviewPart';
        HtmlPreviewPart.class = 'htmlPreviewPart';
        HtmlPreviewPart = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, themeService_1.IThemeService),
            __param(2, storage_1.IStorageService),
            __param(3, contextkey_1.IContextKeyService),
            __param(4, resolverService_1.ITextModelService),
            __param(5, opener_1.IOpenerService),
            __param(6, partService_1.IPartService),
            __param(7, contextView_1.IContextViewService),
            __param(8, environment_1.IEnvironmentService),
            __param(9, workspace_1.IWorkspaceContextService)
        ], HtmlPreviewPart);
        return HtmlPreviewPart;
    }(webviewEditor_1.WebviewEditor));
    exports.HtmlPreviewPart = HtmlPreviewPart;
});
