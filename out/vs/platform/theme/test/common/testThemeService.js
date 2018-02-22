/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/platform/theme/common/themeService", "vs/base/common/color"], function (require, exports, event_1, themeService_1, color_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestTheme = /** @class */ (function () {
        function TestTheme(colors, type) {
            if (colors === void 0) { colors = {}; }
            if (type === void 0) { type = themeService_1.DARK; }
            this.colors = colors;
            this.type = type;
        }
        TestTheme.prototype.getColor = function (color, useDefault) {
            var value = this.colors[color];
            if (value) {
                return color_1.Color.fromHex(value);
            }
            return void 0;
        };
        TestTheme.prototype.defines = function (color) {
            throw new Error('Method not implemented.');
        };
        return TestTheme;
    }());
    exports.TestTheme = TestTheme;
    var TestThemeService = /** @class */ (function () {
        function TestThemeService(theme) {
            if (theme === void 0) { theme = new TestTheme(); }
            this._onThemeChange = new event_1.Emitter();
            this._theme = theme;
        }
        TestThemeService.prototype.getTheme = function () {
            return this._theme;
        };
        TestThemeService.prototype.setTheme = function (theme) {
            this._theme = theme;
            this.fireThemeChange();
        };
        TestThemeService.prototype.fireThemeChange = function () {
            this._onThemeChange.fire(this._theme);
        };
        Object.defineProperty(TestThemeService.prototype, "onThemeChange", {
            get: function () {
                return this._onThemeChange.event;
            },
            enumerable: true,
            configurable: true
        });
        return TestThemeService;
    }());
    exports.TestThemeService = TestThemeService;
});
