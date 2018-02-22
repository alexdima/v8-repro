/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/dom", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "./webviewFindWidget", "vs/base/common/paths", "vs/base/common/strings"], function (require, exports, uri_1, lifecycle_1, event_1, dom_1, colorRegistry_1, themeService_1, webviewFindWidget_1, paths_1, strings_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Webview = /** @class */ (function () {
        function Webview(parent, _styleElement, _environmentService, _contextService, _contextViewService, _contextKey, _findInputContextKey, _options, useSameOriginForRoot) {
            var _this = this;
            this.parent = parent;
            this._styleElement = _styleElement;
            this._environmentService = _environmentService;
            this._contextService = _contextService;
            this._contextViewService = _contextViewService;
            this._contextKey = _contextKey;
            this._findInputContextKey = _findInputContextKey;
            this._options = _options;
            this._disposables = [];
            this._findStarted = false;
            this._onDidClickLink = new event_1.Emitter();
            this.onDidClickLink = this._onDidClickLink.event;
            this._onDidScroll = new event_1.Emitter();
            this.onDidScroll = this._onDidScroll.event;
            this._onFoundInPageResults = new event_1.Emitter();
            this.onFindResults = this._onFoundInPageResults.event;
            this._onMessage = new event_1.Emitter();
            this.onMessage = this._onMessage.event;
            this._onFocus = new event_1.Emitter();
            this.onFocus = this._onFocus.event;
            this._onBlur = new event_1.Emitter();
            this.onBlur = this._onBlur.event;
            this._webview = document.createElement('webview');
            this._webview.setAttribute('partition', this._options.allowSvgs ? 'webview' : "webview" + Date.now());
            // disable auxclick events (see https://developers.google.com/web/updates/2016/10/auxclick)
            this._webview.setAttribute('disableblinkfeatures', 'Auxclick');
            this._webview.setAttribute('disableguestresize', '');
            this._webview.setAttribute('webpreferences', 'contextIsolation=yes');
            this._webview.style.flex = '0 1';
            this._webview.style.width = '0';
            this._webview.style.height = '0';
            this._webview.style.outline = '0';
            this._webview.preload = require.toUrl('./webview-pre.js');
            this._webview.src = useSameOriginForRoot ? require.toUrl('./webview.html') : 'data:text/html;charset=utf-8,%3C%21DOCTYPE%20html%3E%0D%0A%3Chtml%20lang%3D%22en%22%20style%3D%22width%3A%20100%25%3B%20height%3A%20100%25%22%3E%0D%0A%3Chead%3E%0D%0A%09%3Ctitle%3EVirtual%20Document%3C%2Ftitle%3E%0D%0A%3C%2Fhead%3E%0D%0A%3Cbody%20style%3D%22margin%3A%200%3B%20overflow%3A%20hidden%3B%20width%3A%20100%25%3B%20height%3A%20100%25%22%3E%0D%0A%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E';
            this._ready = new Promise(function (resolve) {
                var subscription = dom_1.addDisposableListener(_this._webview, 'ipc-message', function (event) {
                    if (event.channel === 'webview-ready') {
                        // console.info('[PID Webview] ' event.args[0]);
                        dom_1.addClass(_this._webview, 'ready'); // can be found by debug command
                        subscription.dispose();
                        resolve(_this);
                    }
                });
            });
            if (!useSameOriginForRoot) {
                var loaded_1 = false;
                this._disposables.push(dom_1.addDisposableListener(this._webview, 'did-start-loading', function () {
                    if (loaded_1) {
                        return;
                    }
                    loaded_1 = true;
                    var contents = _this._webview.getWebContents();
                    _this.registerFileProtocols(contents);
                }));
            }
            if (!this._options.allowSvgs) {
                var loaded_2 = false;
                this._disposables.push(dom_1.addDisposableListener(this._webview, 'did-start-loading', function () {
                    if (loaded_2) {
                        return;
                    }
                    loaded_2 = true;
                    var contents = _this._webview.getWebContents();
                    if (!contents) {
                        return;
                    }
                    contents.session.webRequest.onBeforeRequest(function (details, callback) {
                        if (details.url.indexOf('.svg') > 0) {
                            var uri = uri_1.default.parse(details.url);
                            if (uri && !uri.scheme.match(/file/i) && uri.path.endsWith('.svg') && !_this.isAllowedSvg(uri)) {
                                _this.onDidBlockSvg();
                                return callback({ cancel: true });
                            }
                        }
                        return callback({});
                    });
                    contents.session.webRequest.onHeadersReceived(function (details, callback) {
                        var contentType = (details.responseHeaders['content-type'] || details.responseHeaders['Content-Type']);
                        if (contentType && Array.isArray(contentType) && contentType.some(function (x) { return x.toLowerCase().indexOf('image/svg') >= 0; })) {
                            var uri = uri_1.default.parse(details.url);
                            if (uri && !_this.isAllowedSvg(uri)) {
                                _this.onDidBlockSvg();
                                return callback({ cancel: true });
                            }
                        }
                        return callback({ cancel: false, responseHeaders: details.responseHeaders });
                    });
                }));
            }
            this._disposables.push(dom_1.addDisposableListener(this._webview, 'console-message', function (e) {
                console.log("[Embedded Page] " + e.message);
            }), dom_1.addDisposableListener(this._webview, 'dom-ready', function () {
                _this.layout();
            }), dom_1.addDisposableListener(this._webview, 'crashed', function () {
                console.error('embedded page crashed');
            }), dom_1.addDisposableListener(this._webview, 'ipc-message', function (event) {
                switch (event.channel) {
                    case 'onmessage':
                        if (_this._options.enableWrappedPostMessage && event.args && event.args.length) {
                            _this._onMessage.fire(event.args[0]);
                        }
                        return;
                    case 'did-click-link':
                        var uri = event.args[0];
                        _this._onDidClickLink.fire(uri_1.default.parse(uri));
                        return;
                    case 'did-set-content':
                        _this._webview.style.flex = '';
                        _this._webview.style.width = '100%';
                        _this._webview.style.height = '100%';
                        _this.layout();
                        return;
                    case 'did-scroll':
                        if (event.args && typeof event.args[0] === 'number') {
                            _this._onDidScroll.fire({ scrollYPercentage: event.args[0] });
                        }
                        return;
                }
            }), dom_1.addDisposableListener(this._webview, 'focus', function () {
                if (_this._contextKey) {
                    _this._contextKey.set(true);
                }
                _this._onFocus.fire();
            }), dom_1.addDisposableListener(this._webview, 'blur', function () {
                if (_this._contextKey) {
                    _this._contextKey.reset();
                }
                _this._onBlur.fire();
            }), dom_1.addDisposableListener(this._webview, 'found-in-page', function (event) {
                _this._onFoundInPageResults.fire(event.result);
            }));
            this._webviewFindWidget = new webviewFindWidget_1.WebviewFindWidget(this._contextViewService, this);
            this._disposables.push(this._webviewFindWidget);
            if (parent) {
                parent.appendChild(this._webviewFindWidget.getDomNode());
                parent.appendChild(this._webview);
            }
        }
        Webview.prototype.notifyFindWidgetFocusChanged = function (isFocused) {
            this._contextKey.set(isFocused || document.activeElement === this._webview);
        };
        Webview.prototype.notifyFindWidgetInputFocusChanged = function (isFocused) {
            this._findInputContextKey.set(isFocused);
        };
        Webview.prototype.dispose = function () {
            this._onDidClickLink.dispose();
            this._disposables = lifecycle_1.dispose(this._disposables);
            if (this._contextKey) {
                this._contextKey.reset();
            }
            if (this._webview.parentElement) {
                this._webview.parentElement.removeChild(this._webview);
                var findWidgetDomNode = this._webviewFindWidget.getDomNode();
                findWidgetDomNode.parentElement.removeChild(findWidgetDomNode);
            }
        };
        Webview.prototype._send = function (channel) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this._ready
                .then(function () {
                return (_a = _this._webview).send.apply(_a, [channel].concat(args));
                var _a;
            })
                .catch(function (err) { return console.error(err); });
        };
        Object.defineProperty(Webview.prototype, "initialScrollProgress", {
            set: function (value) {
                this._send('initial-scroll-position', value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Webview.prototype, "options", {
            set: function (value) {
                this._options = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Webview.prototype, "contents", {
            set: function (value) {
                this._send('content', {
                    contents: value,
                    options: this._options
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Webview.prototype, "baseUrl", {
            set: function (value) {
                this._send('baseUrl', value);
            },
            enumerable: true,
            configurable: true
        });
        Webview.prototype.focus = function () {
            this._webview.focus();
            this._send('focus');
        };
        Webview.prototype.sendMessage = function (data) {
            this._send('message', data);
        };
        Webview.prototype.onDidBlockSvg = function () {
            this.sendMessage({
                name: 'vscode-did-block-svg'
            });
        };
        Webview.prototype.style = function (theme) {
            var _a = window.getComputedStyle(this._styleElement), fontFamily = _a.fontFamily, fontWeight = _a.fontWeight, fontSize = _a.fontSize; // TODO@theme avoid styleElement
            var styles = {
                'background-color': theme.getColor(colorRegistry_1.editorBackground).toString(),
                'color': theme.getColor(colorRegistry_1.editorForeground).toString(),
                'font-family': fontFamily,
                'font-weight': fontWeight,
                'font-size': fontSize,
                'link-color': theme.getColor(colorRegistry_1.textLinkForeground).toString()
            };
            var activeTheme = ApiThemeClassName.fromTheme(theme);
            this._send('styles', styles, activeTheme);
            this._webviewFindWidget.updateTheme(theme);
        };
        Webview.prototype.layout = function () {
            var _this = this;
            var contents = this._webview.getWebContents();
            if (!contents || contents.isDestroyed()) {
                return;
            }
            var window = contents.getOwnerBrowserWindow();
            if (!window || !window.webContents || window.webContents.isDestroyed()) {
                return;
            }
            window.webContents.getZoomFactor(function (factor) {
                if (contents.isDestroyed()) {
                    return;
                }
                contents.setZoomFactor(factor);
                var width = _this.parent.clientWidth;
                var height = _this.parent.clientHeight;
                contents.setSize({
                    normal: {
                        width: Math.floor(width * factor),
                        height: Math.floor(height * factor)
                    }
                });
            });
        };
        Webview.prototype.isAllowedSvg = function (uri) {
            if (this._options.allowSvgs) {
                return true;
            }
            if (this._options.svgWhiteList) {
                return this._options.svgWhiteList.indexOf(uri.authority.toLowerCase()) >= 0;
            }
            return false;
        };
        Webview.prototype.registerFileProtocols = function (contents) {
            if (!contents || contents.isDestroyed()) {
                return;
            }
            registerFileProtocol(contents, 'vscode-core-resource', [
                this._environmentService.appRoot
            ]);
            registerFileProtocol(contents, 'vscode-extension-resource', [
                this._environmentService.extensionsPath,
                this._environmentService.appRoot,
                this._environmentService.extensionDevelopmentPath
            ]);
            registerFileProtocol(contents, 'vscode-workspace-resource', this._contextService.getWorkspace().folders.map(function (folder) { return folder.uri.fsPath; }));
        };
        Webview.prototype.startFind = function (value, options) {
            if (!value) {
                return;
            }
            // ensure options is defined without modifying the original
            options = options || {};
            // FindNext must be false for a first request
            var findOptions = {
                forward: options.forward,
                findNext: false,
                matchCase: options.matchCase,
                medialCapitalAsWordStart: options.medialCapitalAsWordStart
            };
            this._findStarted = true;
            this._webview.findInPage(value, findOptions);
            return;
        };
        /**
         * Webviews expose a stateful find API.
         * Successive calls to find will move forward or backward through onFindResults
         * depending on the supplied options.
         *
         * @param value The string to search for. Empty strings are ignored.
         * @param options
         */
        Webview.prototype.find = function (value, options) {
            // Searching with an empty value will throw an exception
            if (!value) {
                return;
            }
            if (!this._findStarted) {
                this.startFind(value, options);
                return;
            }
            this._webview.findInPage(value, options);
        };
        Webview.prototype.stopFind = function (keepSelection) {
            this._findStarted = false;
            this._webview.stopFindInPage(keepSelection ? 'keepSelection' : 'clearSelection');
        };
        Webview.prototype.showFind = function () {
            this._webviewFindWidget.reveal();
        };
        Webview.prototype.hideFind = function () {
            this._webviewFindWidget.hide();
        };
        Webview.prototype.showNextFindTerm = function () {
            this._webviewFindWidget.showNextFindTerm();
        };
        Webview.prototype.showPreviousFindTerm = function () {
            this._webviewFindWidget.showPreviousFindTerm();
        };
        return Webview;
    }());
    exports.Webview = Webview;
    var ApiThemeClassName;
    (function (ApiThemeClassName) {
        ApiThemeClassName["light"] = "vscode-light";
        ApiThemeClassName["dark"] = "vscode-dark";
        ApiThemeClassName["highContrast"] = "vscode-high-contrast";
    })(ApiThemeClassName || (ApiThemeClassName = {}));
    (function (ApiThemeClassName) {
        function fromTheme(theme) {
            if (theme.type === themeService_1.LIGHT) {
                return ApiThemeClassName.light;
            }
            else if (theme.type === themeService_1.DARK) {
                return ApiThemeClassName.dark;
            }
            else {
                return ApiThemeClassName.highContrast;
            }
        }
        ApiThemeClassName.fromTheme = fromTheme;
    })(ApiThemeClassName || (ApiThemeClassName = {}));
    function registerFileProtocol(contents, protocol, roots) {
        contents.session.protocol.registerFileProtocol(protocol, function (request, callback) {
            var requestPath = uri_1.default.parse(request.url).fsPath;
            for (var _i = 0, roots_1 = roots; _i < roots_1.length; _i++) {
                var root = roots_1[_i];
                var normalizedPath = paths_1.normalize(requestPath, true);
                if (strings_1.startsWith(normalizedPath, root + paths_1.nativeSep)) {
                    callback({ path: normalizedPath });
                    return;
                }
            }
            callback({ error: 'Cannot load resource outside of protocol root' });
        }, function (error) {
            if (error) {
                console.error('Failed to register protocol ' + protocol);
            }
        });
    }
});
