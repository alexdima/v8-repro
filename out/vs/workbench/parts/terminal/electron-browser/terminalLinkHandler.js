/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "path", "vs/base/common/platform", "vs/base/node/pfs", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/platform/opener/common/opener", "vs/base/common/winjs.base", "vs/platform/configuration/common/configuration", "vs/workbench/parts/terminal/common/terminal"], function (require, exports, nls, path, platform, pfs, uri_1, lifecycle_1, opener_1, winjs_base_1, configuration_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var pathPrefix = '(\\.\\.?|\\~)';
    var pathSeparatorClause = '\\/';
    // '":; are allowed in paths but they are often separators so ignore them
    // Also disallow \\ to prevent a catastropic backtracking case #24798
    var excludedPathCharactersClause = '[^\\0\\s!$`&*()\\[\\]+\'":;\\\\]';
    /** A regex that matches paths in the form /foo, ~/foo, ./foo, ../foo, foo/bar */
    var unixLocalLinkClause = '((' + pathPrefix + '|(' + excludedPathCharactersClause + ')+)?(' + pathSeparatorClause + '(' + excludedPathCharactersClause + ')+)+)';
    var winDrivePrefix = '[a-zA-Z]:';
    var winPathPrefix = '(' + winDrivePrefix + '|\\.\\.?|\\~)';
    var winPathSeparatorClause = '(\\\\|\\/)';
    var winExcludedPathCharactersClause = '[^\\0<>\\?\\|\\/\\s!$`&*()\\[\\]+\'":;]';
    /** A regex that matches paths in the form c:\foo, ~\foo, .\foo, ..\foo, foo\bar */
    var winLocalLinkClause = '((' + winPathPrefix + '|(' + winExcludedPathCharactersClause + ')+)?(' + winPathSeparatorClause + '(' + winExcludedPathCharactersClause + ')+)+)';
    /** As xterm reads from DOM, space in that case is nonbreaking char ASCII code - 160,
    replacing space with nonBreakningSpace or space ASCII code - 32. */
    var lineAndColumnClause = [
        '((\\S*)", line ((\\d+)( column (\\d+))?))',
        '((\\S*) on line ((\\d+)(, column (\\d+))?))',
        '((\\S*):line ((\\d+)(, column (\\d+))?))',
        '(([^\\s\\(\\)]*)(\\s?[\\(\\[](\\d+)(,\\s?(\\d+))?)[\\)\\]])',
        '(([^:\\s\\(\\)<>\'\"\\[\\]]*)(:(\\d+))?(:(\\d+))?)' // (file path):336, (file path):336:9
    ].join('|').replace(/ /g, "[" + '\u00A0' + " ]");
    // Changing any regex may effect this value, hence changes this as well if required.
    var winLineAndColumnMatchIndex = 12;
    var unixLineAndColumnMatchIndex = 11;
    // Each line and column clause have 6 groups (ie no. of expressions in round brackets)
    var lineAndColumnClauseGroupCount = 6;
    /** Higher than local link, lower than hypertext */
    var CUSTOM_LINK_PRIORITY = -1;
    /** Lowest */
    var LOCAL_LINK_PRIORITY = -2;
    var TerminalLinkHandler = /** @class */ (function () {
        function TerminalLinkHandler(_xterm, _platform, _initialCwd, _openerService, _configurationService, _terminalService) {
            var _this = this;
            this._xterm = _xterm;
            this._platform = _platform;
            this._initialCwd = _initialCwd;
            this._openerService = _openerService;
            this._configurationService = _configurationService;
            this._terminalService = _terminalService;
            this._hoverDisposables = [];
            var baseLocalLinkClause = _platform === platform.Platform.Windows ? winLocalLinkClause : unixLocalLinkClause;
            // Append line and column number regex
            this._localLinkPattern = new RegExp(baseLocalLinkClause + "(" + lineAndColumnClause + ")");
            this._xterm.setHypertextLinkHandler(this._wrapLinkHandler(function (uri) {
                _this._handleHypertextLink(uri);
            }));
            this._xterm.setHypertextValidationCallback(function (uri, callback) {
                _this._validateWebLink(uri, callback);
            });
        }
        TerminalLinkHandler.prototype.setWidgetManager = function (widgetManager) {
            this._widgetManager = widgetManager;
        };
        TerminalLinkHandler.prototype.registerCustomLinkHandler = function (regex, handler, matchIndex, validationCallback) {
            var _this = this;
            return this._xterm.registerLinkMatcher(regex, this._wrapLinkHandler(handler), {
                matchIndex: matchIndex,
                validationCallback: function (uri, callback) { return validationCallback(uri, callback); },
                tooltipCallback: function (e) { return _this._widgetManager.showMessage(e.offsetX, e.offsetY, _this._getLinkHoverString()); },
                leaveCallback: function () { return _this._widgetManager.closeMessage(); },
                willLinkActivate: function (e) { return _this._isLinkActivationModifierDown(e); },
                priority: CUSTOM_LINK_PRIORITY
            });
        };
        TerminalLinkHandler.prototype.registerLocalLinkHandler = function () {
            var _this = this;
            var wrappedHandler = this._wrapLinkHandler(function (url) {
                _this._handleLocalLink(url);
            });
            return this._xterm.registerLinkMatcher(this._localLinkRegex, wrappedHandler, {
                validationCallback: function (uri, callback) { return _this._validateLocalLink(uri, callback); },
                tooltipCallback: function (e) { return _this._widgetManager.showMessage(e.offsetX, e.offsetY, _this._getLinkHoverString()); },
                leaveCallback: function () { return _this._widgetManager.closeMessage(); },
                willLinkActivate: function (e) { return _this._isLinkActivationModifierDown(e); },
                priority: LOCAL_LINK_PRIORITY
            });
        };
        TerminalLinkHandler.prototype.dispose = function () {
            this._hoverDisposables = lifecycle_1.dispose(this._hoverDisposables);
            this._mouseMoveDisposable = lifecycle_1.dispose(this._mouseMoveDisposable);
        };
        TerminalLinkHandler.prototype._wrapLinkHandler = function (handler) {
            var _this = this;
            return function (event, uri) {
                // Prevent default electron link handling so Alt+Click mode works normally
                event.preventDefault();
                // Require correct modifier on click
                if (!_this._isLinkActivationModifierDown(event)) {
                    // If the modifier is not pressed, the terminal should be
                    // focused if it's not already
                    _this._terminalService.getActiveInstance().focus(true);
                    return false;
                }
                return handler(uri);
            };
        };
        Object.defineProperty(TerminalLinkHandler.prototype, "_localLinkRegex", {
            get: function () {
                return this._localLinkPattern;
            },
            enumerable: true,
            configurable: true
        });
        TerminalLinkHandler.prototype._handleLocalLink = function (link) {
            var _this = this;
            return this._resolvePath(link).then(function (resolvedLink) {
                if (!resolvedLink) {
                    return void 0;
                }
                var normalizedPath = path.normalize(path.resolve(resolvedLink));
                var normalizedUrl = _this.extractLinkUrl(normalizedPath);
                normalizedPath = _this._formatLocalLinkPath(normalizedPath);
                var resource = uri_1.default.file(normalizedUrl);
                resource = resource.with({
                    fragment: uri_1.default.parse(normalizedPath).fragment
                });
                return _this._openerService.open(resource);
            });
        };
        TerminalLinkHandler.prototype._validateLocalLink = function (link, callback) {
            this._resolvePath(link).then(function (resolvedLink) { return callback(!!resolvedLink); });
        };
        TerminalLinkHandler.prototype._validateWebLink = function (link, callback) {
            callback(true);
        };
        TerminalLinkHandler.prototype._handleHypertextLink = function (url) {
            var uri = uri_1.default.parse(url);
            this._openerService.open(uri);
        };
        TerminalLinkHandler.prototype._isLinkActivationModifierDown = function (event) {
            var editorConf = this._configurationService.getValue('editor');
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                return !!event.altKey;
            }
            return platform.isMacintosh ? event.metaKey : event.ctrlKey;
        };
        TerminalLinkHandler.prototype._getLinkHoverString = function () {
            var editorConf = this._configurationService.getValue('editor');
            if (editorConf.multiCursorModifier === 'ctrlCmd') {
                return nls.localize('terminalLinkHandler.followLinkAlt', 'Alt + click to follow link');
            }
            if (platform.isMacintosh) {
                return nls.localize('terminalLinkHandler.followLinkCmd', 'Cmd + click to follow link');
            }
            return nls.localize('terminalLinkHandler.followLinkCtrl', 'Ctrl + click to follow link');
        };
        TerminalLinkHandler.prototype._preprocessPath = function (link) {
            if (this._platform === platform.Platform.Windows) {
                // Resolve ~ -> %HOMEDRIVE%\%HOMEPATH%
                if (link.charAt(0) === '~') {
                    if (!process.env.HOMEDRIVE || !process.env.HOMEPATH) {
                        return null;
                    }
                    link = process.env.HOMEDRIVE + "\\" + (process.env.HOMEPATH + link.substring(1));
                }
                // Resolve relative paths (.\a, ..\a, ~\a, a\b)
                if (!link.match('^' + winDrivePrefix)) {
                    if (!this._initialCwd) {
                        // Abort if no workspace is open
                        return null;
                    }
                    link = path.join(this._initialCwd, link);
                }
            }
            else if (link.charAt(0) !== '/' && link.charAt(0) !== '~') {
                if (!this._initialCwd) {
                    // Abort if no workspace is open
                    return null;
                }
                link = path.join(this._initialCwd, link);
            }
            return link;
        };
        TerminalLinkHandler.prototype._resolvePath = function (link) {
            link = this._preprocessPath(link);
            if (!link) {
                return winjs_base_1.TPromise.as(void 0);
            }
            var linkUrl = this.extractLinkUrl(link);
            if (!linkUrl) {
                return winjs_base_1.TPromise.as(void 0);
            }
            // Open an editor if the path exists
            return pfs.fileExists(linkUrl).then(function (isFile) {
                if (!isFile) {
                    return null;
                }
                return link;
            });
        };
        /**
         * Appends line number and column number to link if they exists.
         * @param link link to format, will become link#line_num,col_num.
         */
        TerminalLinkHandler.prototype._formatLocalLinkPath = function (link) {
            var lineColumnInfo = this.extractLineColumnInfo(link);
            if (lineColumnInfo.lineNumber) {
                link += "#" + lineColumnInfo.lineNumber;
                if (lineColumnInfo.columnNumber) {
                    link += "," + lineColumnInfo.columnNumber;
                }
            }
            return link;
        };
        /**
         * Returns line and column number of URl if that is present.
         *
         * @param link Url link which may contain line and column number.
         */
        TerminalLinkHandler.prototype.extractLineColumnInfo = function (link) {
            var matches = this._localLinkRegex.exec(link);
            var lineColumnInfo = {};
            var lineAndColumnMatchIndex = this._platform === platform.Platform.Windows ? winLineAndColumnMatchIndex : unixLineAndColumnMatchIndex;
            for (var i = 0; i < lineAndColumnClause.length; i++) {
                var lineMatchIndex = lineAndColumnMatchIndex + (lineAndColumnClauseGroupCount * i);
                var rowNumber = matches[lineMatchIndex];
                if (rowNumber) {
                    lineColumnInfo['lineNumber'] = rowNumber;
                    // Check if column number exists
                    var columnNumber = matches[lineMatchIndex + 2];
                    if (columnNumber) {
                        lineColumnInfo['columnNumber'] = columnNumber;
                    }
                    break;
                }
            }
            return lineColumnInfo;
        };
        /**
         * Returns url from link as link may contain line and column information.
         *
         * @param link url link which may contain line and column number.
         */
        TerminalLinkHandler.prototype.extractLinkUrl = function (link) {
            var matches = this._localLinkRegex.exec(link);
            if (!matches) {
                return null;
            }
            return matches[1];
        };
        TerminalLinkHandler = __decorate([
            __param(3, opener_1.IOpenerService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, terminal_1.ITerminalService)
        ], TerminalLinkHandler);
        return TerminalLinkHandler;
    }());
    exports.TerminalLinkHandler = TerminalLinkHandler;
});
