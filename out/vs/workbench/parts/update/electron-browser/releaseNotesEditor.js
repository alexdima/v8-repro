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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/marked/marked", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "./releaseNotesInput", "vs/workbench/parts/html/browser/webview", "vs/platform/opener/common/opener", "vs/editor/common/services/modeService", "vs/editor/common/modes/textToHtmlTokenizer", "vs/workbench/services/part/common/partService", "vs/workbench/parts/html/browser/webviewEditor", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/editor/common/modes", "vs/platform/environment/common/environment", "vs/base/common/errors", "vs/platform/telemetry/node/telemetryNodeUtils", "vs/editor/common/modes/supports/tokenization", "vs/platform/workspace/common/workspace"], function (require, exports, winjs_base_1, marked_1, lifecycle_1, dom_1, telemetry_1, themeService_1, releaseNotesInput_1, webview_1, opener_1, modeService_1, textToHtmlTokenizer_1, partService_1, webviewEditor_1, storage_1, contextView_1, contextkey_1, modes_1, environment_1, errors_1, telemetryNodeUtils_1, tokenization_1, workspace_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function renderBody(body, css) {
        var styleSheetPath = require.toUrl('./media/markdown.css').replace('file://', 'vscode-core-resource://');
        return "<!DOCTYPE html>\n\t\t<html>\n\t\t\t<head>\n\t\t\t\t<base href=\"https://code.visualstudio.com/raw/\">\n\t\t\t\t<meta http-equiv=\"Content-type\" content=\"text/html;charset=UTF-8\">\n\t\t\t\t<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src vscode-core-resource: https: 'unsafe-inline'; child-src 'none'; frame-src 'none';\">\n\t\t\t\t<link rel=\"stylesheet\" type=\"text/css\" href=\"" + styleSheetPath + "\">\n\t\t\t\t<style>" + css + "</style>\n\t\t\t</head>\n\t\t\t<body>" + body + "</body>\n\t\t</html>";
    }
    var ReleaseNotesEditor = /** @class */ (function (_super) {
        __extends(ReleaseNotesEditor, _super);
        function ReleaseNotesEditor(telemetryService, themeService, storageService, contextKeyService, environmentService, openerService, modeService, partService, _contextViewService, _contextService) {
            var _this = _super.call(this, ReleaseNotesEditor.ID, telemetryService, themeService, storageService, contextKeyService) || this;
            _this.themeService = themeService;
            _this.environmentService = environmentService;
            _this.openerService = openerService;
            _this.modeService = modeService;
            _this.partService = partService;
            _this._contextViewService = _contextViewService;
            _this._contextService = _contextService;
            _this.contentDisposables = [];
            _this.scrollYPercentage = 0;
            return _this;
        }
        ReleaseNotesEditor.prototype.createEditor = function (parent) {
            var container = parent.getHTMLElement();
            this.content = dom_1.append(container, dom_1.$('.release-notes', { 'style': 'height: 100%; position: relative; overflow: hidden;' }));
        };
        ReleaseNotesEditor.prototype.setInput = function (input, options) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _this = this;
                var text, result, renderer, colorMap, css, body, state;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.input && this.input.matches(input)) {
                                return [2 /*return*/, undefined];
                            }
                            text = input.text;
                            this.contentDisposables = lifecycle_1.dispose(this.contentDisposables);
                            this.content.innerHTML = '';
                            return [4 /*yield*/, _super.prototype.setInput.call(this, input, options)];
                        case 1:
                            _a.sent();
                            result = [];
                            renderer = new marked_1.marked.Renderer();
                            renderer.code = function (code, lang) {
                                var modeId = _this.modeService.getModeIdForLanguageName(lang);
                                result.push(_this.modeService.getOrCreateMode(modeId));
                                return '';
                            };
                            marked_1.marked(text, { renderer: renderer });
                            return [4 /*yield*/, winjs_base_1.TPromise.join(result)];
                        case 2:
                            _a.sent();
                            renderer.code = function (code, lang) {
                                var modeId = _this.modeService.getModeIdForLanguageName(lang);
                                return "<code>" + textToHtmlTokenizer_1.tokenizeToString(code, modeId) + "</code>";
                            };
                            colorMap = modes_1.TokenizationRegistry.getColorMap();
                            css = tokenization_1.generateTokensCSSForColorMap(colorMap);
                            body = renderBody(marked_1.marked(text, { renderer: renderer }), css);
                            this._webview = new webview_1.Webview(this.content, this.partService.getContainer(partService_1.Parts.EDITOR_PART), this.environmentService, this._contextService, this._contextViewService, this.contextKey, this.findInputFocusContextKey, {}, false);
                            if (this.input && this.input instanceof releaseNotesInput_1.ReleaseNotesInput) {
                                state = this.loadViewState(this.input.version);
                                if (state) {
                                    this._webview.initialScrollProgress = state.scrollYPercentage;
                                }
                            }
                            this.onThemeChange(this.themeService.getTheme());
                            this._webview.contents = body;
                            this._webview.onDidClickLink(function (link) {
                                telemetryNodeUtils_1.addGAParameters(_this.telemetryService, _this.environmentService, link, 'ReleaseNotes')
                                    .then(function (updated) { return _this.openerService.open(updated); })
                                    .then(null, errors_1.onUnexpectedError);
                            }, null, this.contentDisposables);
                            this._webview.onDidScroll(function (event) {
                                _this.scrollYPercentage = event.scrollYPercentage;
                            }, null, this.contentDisposables);
                            this.themeService.onThemeChange(this.onThemeChange, this, this.contentDisposables);
                            this.contentDisposables.push(this._webview);
                            this.contentDisposables.push(lifecycle_1.toDisposable(function () { return _this._webview = null; }));
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReleaseNotesEditor.prototype.layout = function () {
            if (this._webview) {
                this._webview.layout();
            }
        };
        ReleaseNotesEditor.prototype.focus = function () {
            if (!this._webview) {
                return;
            }
            this._webview.focus();
        };
        ReleaseNotesEditor.prototype.dispose = function () {
            this.contentDisposables = lifecycle_1.dispose(this.contentDisposables);
            _super.prototype.dispose.call(this);
        };
        ReleaseNotesEditor.prototype.getViewState = function () {
            return {
                scrollYPercentage: this.scrollYPercentage
            };
        };
        ReleaseNotesEditor.prototype.clearInput = function () {
            if (this.input instanceof releaseNotesInput_1.ReleaseNotesInput) {
                this.saveViewState(this.input.version, {
                    scrollYPercentage: this.scrollYPercentage
                });
            }
            _super.prototype.clearInput.call(this);
        };
        ReleaseNotesEditor.prototype.shutdown = function () {
            if (this.input instanceof releaseNotesInput_1.ReleaseNotesInput) {
                this.saveViewState(this.input.version, {
                    scrollYPercentage: this.scrollYPercentage
                });
            }
            _super.prototype.shutdown.call(this);
        };
        ReleaseNotesEditor.ID = 'workbench.editor.releaseNotes';
        ReleaseNotesEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, themeService_1.IThemeService),
            __param(2, storage_1.IStorageService),
            __param(3, contextkey_1.IContextKeyService),
            __param(4, environment_1.IEnvironmentService),
            __param(5, opener_1.IOpenerService),
            __param(6, modeService_1.IModeService),
            __param(7, partService_1.IPartService),
            __param(8, contextView_1.IContextViewService),
            __param(9, workspace_1.IWorkspaceContextService)
        ], ReleaseNotesEditor);
        return ReleaseNotesEditor;
    }(webviewEditor_1.WebviewEditor));
    exports.ReleaseNotesEditor = ReleaseNotesEditor;
});
