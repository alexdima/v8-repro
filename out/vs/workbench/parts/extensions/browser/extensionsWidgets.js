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
define(["require", "exports", "vs/base/common/lifecycle", "../common/extensions", "vs/base/browser/dom", "vs/base/common/platform", "vs/nls", "vs/css!./media/extensionsWidgets"], function (require, exports, lifecycle_1, extensions_1, dom_1, platform, nls_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Label = /** @class */ (function () {
        function Label(element, fn, extensionsWorkbenchService) {
            this.element = element;
            this.fn = fn;
            this.render();
            this.listener = extensionsWorkbenchService.onChange(this.render, this);
        }
        Object.defineProperty(Label.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.render(); },
            enumerable: true,
            configurable: true
        });
        Label.prototype.render = function () {
            this.element.textContent = this.extension ? this.fn(this.extension) : '';
        };
        Label.prototype.dispose = function () {
            this.listener = lifecycle_1.dispose(this.listener);
        };
        Label = __decorate([
            __param(2, extensions_1.IExtensionsWorkbenchService)
        ], Label);
        return Label;
    }());
    exports.Label = Label;
    var InstallCountWidget = /** @class */ (function () {
        function InstallCountWidget(container, options, extensionsWorkbenchService) {
            var _this = this;
            this.container = container;
            this.options = options;
            this.disposables = [];
            this._extension = options.extension;
            this.disposables.push(extensionsWorkbenchService.onChange(function () { return _this.render(); }));
            dom_1.addClass(container, 'extension-install-count');
            this.render();
        }
        Object.defineProperty(InstallCountWidget.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.render(); },
            enumerable: true,
            configurable: true
        });
        InstallCountWidget.prototype.render = function () {
            this.container.innerHTML = '';
            if (!this.extension) {
                return;
            }
            var installCount = this.extension.installCount;
            if (installCount === null) {
                return;
            }
            var installLabel;
            if (this.options.small) {
                if (installCount > 1000000) {
                    installLabel = Math.floor(installCount / 100000) / 10 + "M";
                }
                else if (installCount > 1000) {
                    installLabel = Math.floor(installCount / 1000) + "K";
                }
                else {
                    installLabel = String(installCount);
                }
            }
            else {
                installLabel = installCount.toLocaleString(platform.locale);
            }
            dom_1.append(this.container, dom_1.$('span.octicon.octicon-cloud-download'));
            var count = dom_1.append(this.container, dom_1.$('span.count'));
            count.textContent = installLabel;
        };
        InstallCountWidget.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        InstallCountWidget = __decorate([
            __param(2, extensions_1.IExtensionsWorkbenchService)
        ], InstallCountWidget);
        return InstallCountWidget;
    }());
    exports.InstallCountWidget = InstallCountWidget;
    var RatingsWidget = /** @class */ (function () {
        function RatingsWidget(container, options, extensionsWorkbenchService) {
            var _this = this;
            this.container = container;
            this.options = options;
            this.disposables = [];
            this._extension = options.extension;
            this.disposables.push(extensionsWorkbenchService.onChange(function () { return _this.render(); }));
            dom_1.addClass(container, 'extension-ratings');
            if (options.small) {
                dom_1.addClass(container, 'small');
            }
            this.render();
        }
        Object.defineProperty(RatingsWidget.prototype, "extension", {
            get: function () { return this._extension; },
            set: function (extension) { this._extension = extension; this.render(); },
            enumerable: true,
            configurable: true
        });
        RatingsWidget.prototype.render = function () {
            this.container.innerHTML = '';
            if (!this.extension) {
                return;
            }
            var rating = Math.round(this.extension.rating * 2) / 2;
            if (this.extension.rating === null) {
                return;
            }
            if (this.options.small && this.extension.ratingCount === 0) {
                return;
            }
            if (this.options.small) {
                dom_1.append(this.container, dom_1.$('span.full.star'));
                var count = dom_1.append(this.container, dom_1.$('span.count'));
                count.textContent = String(rating);
                this.container.title = this.extension.ratingCount > 1 ? nls_1.localize('ratedByUsers', "Rated by {0} users", this.extension.ratingCount) : nls_1.localize('ratedBySingleUser', "Rated by 1 user");
            }
            else {
                for (var i = 1; i <= 5; i++) {
                    if (rating >= i) {
                        dom_1.append(this.container, dom_1.$('span.full.star'));
                    }
                    else if (rating >= i - 0.5) {
                        dom_1.append(this.container, dom_1.$('span.half.star'));
                    }
                    else {
                        dom_1.append(this.container, dom_1.$('span.empty.star'));
                    }
                }
            }
        };
        RatingsWidget.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        RatingsWidget = __decorate([
            __param(2, extensions_1.IExtensionsWorkbenchService)
        ], RatingsWidget);
        return RatingsWidget;
    }());
    exports.RatingsWidget = RatingsWidget;
});
