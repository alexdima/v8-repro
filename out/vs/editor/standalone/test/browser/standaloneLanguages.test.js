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
define(["require", "exports", "assert", "vs/editor/standalone/browser/standaloneLanguages", "vs/platform/theme/common/themeService", "vs/editor/common/modes", "vs/editor/common/core/token", "vs/editor/common/modes/supports/tokenization"], function (require, exports, assert, standaloneLanguages_1, themeService_1, modes_1, token_1, tokenization_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TokenizationSupport2Adapter', function () {
        var languageIdentifier = new modes_1.LanguageIdentifier('tttt', 1 /* PlainText */);
        var tokenMetadata = (languageIdentifier.id << 0 /* LANGUAGEID_OFFSET */);
        var MockTokenTheme = /** @class */ (function (_super) {
            __extends(MockTokenTheme, _super);
            function MockTokenTheme() {
                var _this = _super.call(this, null, null) || this;
                _this.counter = 0;
                return _this;
            }
            MockTokenTheme.prototype.match = function (languageId, token) {
                return (((this.counter++) << 14 /* FOREGROUND_OFFSET */)
                    | (languageId << 0 /* LANGUAGEID_OFFSET */)) >>> 0;
            };
            return MockTokenTheme;
        }(tokenization_1.TokenTheme));
        var MockThemeService = /** @class */ (function () {
            function MockThemeService() {
                this._serviceBrand = null;
                this.onThemeChange = null;
            }
            MockThemeService.prototype.setTheme = function (themeName) {
                throw new Error('Not implemented');
            };
            MockThemeService.prototype.defineTheme = function (themeName, themeData) {
                throw new Error('Not implemented');
            };
            MockThemeService.prototype.getTheme = function () {
                return {
                    tokenTheme: new MockTokenTheme(),
                    themeName: themeService_1.LIGHT,
                    type: themeService_1.LIGHT,
                    getColor: function (color, useDefault) {
                        throw new Error('Not implemented');
                    },
                    defines: function (color) {
                        throw new Error('Not implemented');
                    }
                };
            };
            return MockThemeService;
        }());
        var MockState = /** @class */ (function () {
            function MockState() {
            }
            MockState.prototype.clone = function () {
                return this;
            };
            MockState.prototype.equals = function (other) {
                return this === other;
            };
            MockState.INSTANCE = new MockState();
            return MockState;
        }());
        function testBadTokensProvider(providerTokens, offsetDelta, expectedClassicTokens, expectedModernTokens) {
            var BadTokensProvider = /** @class */ (function () {
                function BadTokensProvider() {
                }
                BadTokensProvider.prototype.getInitialState = function () {
                    return MockState.INSTANCE;
                };
                BadTokensProvider.prototype.tokenize = function (line, state) {
                    return {
                        tokens: providerTokens,
                        endState: MockState.INSTANCE
                    };
                };
                return BadTokensProvider;
            }());
            var adapter = new standaloneLanguages_1.TokenizationSupport2Adapter(new MockThemeService(), languageIdentifier, new BadTokensProvider());
            var actualClassicTokens = adapter.tokenize('whatever', MockState.INSTANCE, offsetDelta);
            assert.deepEqual(actualClassicTokens.tokens, expectedClassicTokens);
            var actualModernTokens = adapter.tokenize2('whatever', MockState.INSTANCE, offsetDelta);
            var modernTokens = [];
            for (var i = 0; i < actualModernTokens.tokens.length; i++) {
                modernTokens[i] = actualModernTokens.tokens[i];
            }
            assert.deepEqual(modernTokens, expectedModernTokens);
        }
        test('tokens always start at index 0 (no offset delta)', function () {
            testBadTokensProvider([
                { startIndex: 7, scopes: 'foo' },
                { startIndex: 0, scopes: 'bar' }
            ], 0, [
                new token_1.Token(0, 'foo', languageIdentifier.language),
                new token_1.Token(0, 'bar', languageIdentifier.language),
            ], [
                0, tokenMetadata | (0 << 14 /* FOREGROUND_OFFSET */),
                0, tokenMetadata | (1 << 14 /* FOREGROUND_OFFSET */)
            ]);
        });
        test('tokens always start after each other (no offset delta)', function () {
            testBadTokensProvider([
                { startIndex: 0, scopes: 'foo' },
                { startIndex: 5, scopes: 'bar' },
                { startIndex: 3, scopes: 'foo' },
            ], 0, [
                new token_1.Token(0, 'foo', languageIdentifier.language),
                new token_1.Token(5, 'bar', languageIdentifier.language),
                new token_1.Token(5, 'foo', languageIdentifier.language),
            ], [
                0, tokenMetadata | (0 << 14 /* FOREGROUND_OFFSET */),
                5, tokenMetadata | (1 << 14 /* FOREGROUND_OFFSET */),
                5, tokenMetadata | (2 << 14 /* FOREGROUND_OFFSET */)
            ]);
        });
        test('tokens always start at index 0 (with offset delta)', function () {
            testBadTokensProvider([
                { startIndex: 7, scopes: 'foo' },
                { startIndex: 0, scopes: 'bar' }
            ], 7, [
                new token_1.Token(7, 'foo', languageIdentifier.language),
                new token_1.Token(7, 'bar', languageIdentifier.language),
            ], [
                7, tokenMetadata | (0 << 14 /* FOREGROUND_OFFSET */),
                7, tokenMetadata | (1 << 14 /* FOREGROUND_OFFSET */)
            ]);
        });
        test('tokens always start after each other (with offset delta)', function () {
            testBadTokensProvider([
                { startIndex: 0, scopes: 'foo' },
                { startIndex: 5, scopes: 'bar' },
                { startIndex: 3, scopes: 'foo' },
            ], 7, [
                new token_1.Token(7, 'foo', languageIdentifier.language),
                new token_1.Token(12, 'bar', languageIdentifier.language),
                new token_1.Token(12, 'foo', languageIdentifier.language),
            ], [
                7, tokenMetadata | (0 << 14 /* FOREGROUND_OFFSET */),
                12, tokenMetadata | (1 << 14 /* FOREGROUND_OFFSET */),
                12, tokenMetadata | (2 << 14 /* FOREGROUND_OFFSET */)
            ]);
        });
    });
});
