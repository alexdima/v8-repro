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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/paths", "vs/editor/common/services/modeService", "vs/base/node/pfs", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor", "vs/workbench/services/textMate/electron-browser/textMateService", "vs/editor/common/modes", "vs/workbench/services/textMate/electron-browser/TMHelper", "vs/base/common/color"], function (require, exports, winjs_base_1, paths, modeService_1, pfs, commands_1, instantiation_1, workbenchThemeService_1, editorService_1, editor_1, textMateService_1, modes_1, TMHelper_1, color_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ThemeDocument = /** @class */ (function () {
        function ThemeDocument(theme) {
            this._theme = theme;
            this._cache = Object.create(null);
            this._defaultColor = '#000000';
            for (var i = 0, len = this._theme.tokenColors.length; i < len; i++) {
                var rule = this._theme.tokenColors[i];
                if (!rule.scope) {
                    this._defaultColor = rule.settings.foreground;
                }
            }
        }
        ThemeDocument.prototype._generateExplanation = function (selector, color) {
            return selector + ": " + color_1.Color.Format.CSS.formatHexA(color, true).toUpperCase();
        };
        ThemeDocument.prototype.explainTokenColor = function (scopes, color) {
            var matchingRule = this._findMatchingThemeRule(scopes);
            if (!matchingRule) {
                var expected_1 = color_1.Color.fromHex(this._defaultColor);
                // No matching rule
                if (!color.equals(expected_1)) {
                    throw new Error("[" + this._theme.label + "]: Unexpected color " + color_1.Color.Format.CSS.formatHexA(color) + " for " + scopes + ". Expected default " + color_1.Color.Format.CSS.formatHexA(expected_1));
                }
                return this._generateExplanation('default', color);
            }
            var expected = color_1.Color.fromHex(matchingRule.settings.foreground);
            if (!color.equals(expected)) {
                throw new Error("[" + this._theme.label + "]: Unexpected color " + color_1.Color.Format.CSS.formatHexA(color) + " for " + scopes + ". Expected " + color_1.Color.Format.CSS.formatHexA(expected) + " coming in from " + matchingRule.rawSelector);
            }
            return this._generateExplanation(matchingRule.rawSelector, color);
        };
        ThemeDocument.prototype._findMatchingThemeRule = function (scopes) {
            if (!this._cache[scopes]) {
                this._cache[scopes] = TMHelper_1.findMatchingThemeRule(this._theme, scopes.split(' '));
            }
            return this._cache[scopes];
        };
        return ThemeDocument;
    }());
    var Snapper = /** @class */ (function () {
        function Snapper(modeService, themeService, textMateService) {
            this.modeService = modeService;
            this.themeService = themeService;
            this.textMateService = textMateService;
        }
        Snapper.prototype._themedTokenize = function (grammar, lines) {
            var colorMap = modes_1.TokenizationRegistry.getColorMap();
            var state = null;
            var result = [], resultLen = 0;
            for (var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i];
                var tokenizationResult = grammar.tokenizeLine2(line, state);
                for (var j = 0, lenJ = tokenizationResult.tokens.length >>> 1; j < lenJ; j++) {
                    var startOffset = tokenizationResult.tokens[(j << 1)];
                    var metadata = tokenizationResult.tokens[(j << 1) + 1];
                    var endOffset = j + 1 < lenJ ? tokenizationResult.tokens[((j + 1) << 1)] : line.length;
                    var tokenText = line.substring(startOffset, endOffset);
                    var color = modes_1.TokenMetadata.getForeground(metadata);
                    result[resultLen++] = {
                        text: tokenText,
                        color: colorMap[color]
                    };
                }
                state = tokenizationResult.ruleStack;
            }
            return result;
        };
        Snapper.prototype._tokenize = function (grammar, lines) {
            var state = null;
            var result = [], resultLen = 0;
            for (var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i];
                var tokenizationResult = grammar.tokenizeLine(line, state);
                var lastScopes = null;
                for (var j = 0, lenJ = tokenizationResult.tokens.length; j < lenJ; j++) {
                    var token = tokenizationResult.tokens[j];
                    var tokenText = line.substring(token.startIndex, token.endIndex);
                    var tokenScopes = token.scopes.join(' ');
                    if (lastScopes === tokenScopes) {
                        result[resultLen - 1].c += tokenText;
                    }
                    else {
                        lastScopes = tokenScopes;
                        result[resultLen++] = {
                            c: tokenText,
                            t: tokenScopes,
                            r: {
                                dark_plus: null,
                                light_plus: null,
                                dark_vs: null,
                                light_vs: null,
                                hc_black: null,
                            }
                        };
                    }
                }
                state = tokenizationResult.ruleStack;
            }
            return result;
        };
        Snapper.prototype._getThemesResult = function (grammar, lines) {
            var _this = this;
            var currentTheme = this.themeService.getColorTheme();
            var getThemeName = function (id) {
                var part = 'vscode-theme-defaults-themes-';
                var startIdx = id.indexOf(part);
                if (startIdx !== -1) {
                    return id.substring(startIdx + part.length, id.length - 5);
                }
                return void 0;
            };
            var result = {};
            return this.themeService.getColorThemes().then(function (themeDatas) {
                var defaultThemes = themeDatas.filter(function (themeData) { return !!getThemeName(themeData.id); });
                return winjs_base_1.TPromise.join(defaultThemes.map(function (defaultTheme) {
                    var themeId = defaultTheme.id;
                    return _this.themeService.setColorTheme(themeId, null).then(function (success) {
                        if (success) {
                            var themeName = getThemeName(themeId);
                            result[themeName] = {
                                document: new ThemeDocument(_this.themeService.getColorTheme()),
                                tokens: _this._themedTokenize(grammar, lines)
                            };
                        }
                    });
                }));
            }).then(function (_) {
                return _this.themeService.setColorTheme(currentTheme.id, null).then(function (_) {
                    return result;
                });
            });
        };
        Snapper.prototype._enrichResult = function (result, themesResult) {
            var index = {};
            var themeNames = Object.keys(themesResult);
            for (var t = 0; t < themeNames.length; t++) {
                var themeName = themeNames[t];
                index[themeName] = 0;
            }
            for (var i = 0, len = result.length; i < len; i++) {
                var token = result[i];
                for (var t = 0; t < themeNames.length; t++) {
                    var themeName = themeNames[t];
                    var themedToken = themesResult[themeName].tokens[index[themeName]];
                    themedToken.text = themedToken.text.substr(token.c.length);
                    token.r[themeName] = themesResult[themeName].document.explainTokenColor(token.t, themedToken.color);
                    if (themedToken.text.length === 0) {
                        index[themeName]++;
                    }
                }
            }
        };
        Snapper.prototype.captureSyntaxTokens = function (fileName, content) {
            var _this = this;
            return this.modeService.getOrCreateModeByFilenameOrFirstLine(fileName).then(function (mode) {
                return _this.textMateService.createGrammar(mode.getId()).then(function (grammar) {
                    var lines = content.split(/\r\n|\r|\n/);
                    var result = _this._tokenize(grammar, lines);
                    return _this._getThemesResult(grammar, lines).then(function (themesResult) {
                        _this._enrichResult(result, themesResult);
                        return result.filter(function (t) { return t.c.length > 0; });
                    });
                });
            });
        };
        Snapper = __decorate([
            __param(0, modeService_1.IModeService),
            __param(1, workbenchThemeService_1.IWorkbenchThemeService),
            __param(2, textMateService_1.ITextMateService)
        ], Snapper);
        return Snapper;
    }());
    commands_1.CommandsRegistry.registerCommand('_workbench.captureSyntaxTokens', function (accessor, resource) {
        var process = function (resource) {
            var filePath = resource.fsPath;
            var fileName = paths.basename(filePath);
            var snapper = accessor.get(instantiation_1.IInstantiationService).createInstance(Snapper);
            return pfs.readFile(filePath).then(function (content) {
                return snapper.captureSyntaxTokens(fileName, content.toString());
            });
        };
        if (!resource) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var file = editor_1.toResource(editorService.getActiveEditorInput(), { filter: 'file' });
            if (file) {
                process(file).then(function (result) {
                    console.log(result);
                });
            }
            else {
                console.log('No file editor active');
            }
        }
        else {
            return process(resource);
        }
        return undefined;
    });
});
