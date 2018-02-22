/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/strings", "vs/base/common/color", "vs/base/common/objects", "vs/css!./countBadge"], function (require, exports, dom_1, strings_1, color_1, objects_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var defaultOpts = {
        badgeBackground: color_1.Color.fromHex('#4D4D4D'),
        badgeForeground: color_1.Color.fromHex('#FFFFFF')
    };
    var CountBadge = /** @class */ (function () {
        function CountBadge(container, options) {
            this.options = options || Object.create(null);
            objects_1.mixin(this.options, defaultOpts, false);
            this.badgeBackground = this.options.badgeBackground;
            this.badgeForeground = this.options.badgeForeground;
            this.badgeBorder = this.options.badgeBorder;
            this.element = dom_1.append(container, dom_1.$('.monaco-count-badge'));
            this.titleFormat = this.options.titleFormat || '';
            this.setCount(this.options.count || 0);
        }
        CountBadge.prototype.setCount = function (count) {
            this.count = count;
            this.render();
        };
        CountBadge.prototype.setTitleFormat = function (titleFormat) {
            this.titleFormat = titleFormat;
            this.render();
        };
        CountBadge.prototype.render = function () {
            this.element.textContent = '' + this.count;
            this.element.title = strings_1.format(this.titleFormat, this.count);
            this.applyStyles();
        };
        CountBadge.prototype.style = function (styles) {
            this.badgeBackground = styles.badgeBackground;
            this.badgeForeground = styles.badgeForeground;
            this.badgeBorder = styles.badgeBorder;
            this.applyStyles();
        };
        CountBadge.prototype.applyStyles = function () {
            if (this.element) {
                var background = this.badgeBackground ? this.badgeBackground.toString() : null;
                var foreground = this.badgeForeground ? this.badgeForeground.toString() : null;
                var border = this.badgeBorder ? this.badgeBorder.toString() : null;
                this.element.style.backgroundColor = background;
                this.element.style.color = foreground;
                this.element.style.borderWidth = border ? '1px' : null;
                this.element.style.borderStyle = border ? 'solid' : null;
                this.element.style.borderColor = border;
            }
        };
        return CountBadge;
    }());
    exports.CountBadge = CountBadge;
});
