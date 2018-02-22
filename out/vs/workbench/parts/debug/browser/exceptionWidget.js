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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/editor/contrib/zoneWidget/zoneWidget", "vs/base/common/async", "vs/platform/theme/common/themeService", "vs/base/common/color", "vs/platform/theme/common/colorRegistry", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/debug/browser/linkDetector", "vs/css!../browser/media/exceptionWidget"], function (require, exports, nls, dom, zoneWidget_1, async_1, themeService_1, color_1, colorRegistry_1, instantiation_1, linkDetector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    // theming
    exports.debugExceptionWidgetBorder = colorRegistry_1.registerColor('debugExceptionWidget.border', { dark: '#a31515', light: '#a31515', hc: '#a31515' }, nls.localize('debugExceptionWidgetBorder', 'Exception widget border color.'));
    exports.debugExceptionWidgetBackground = colorRegistry_1.registerColor('debugExceptionWidget.background', { dark: '#420b0d', light: '#f1dfde', hc: '#420b0d' }, nls.localize('debugExceptionWidgetBackground', 'Exception widget background color.'));
    var ExceptionWidget = /** @class */ (function (_super) {
        __extends(ExceptionWidget, _super);
        function ExceptionWidget(editor, exceptionInfo, themeService, instantiationService) {
            var _this = _super.call(this, editor, { showFrame: true, showArrow: true, frameWidth: 1, className: 'exception-widget-container' }) || this;
            _this.exceptionInfo = exceptionInfo;
            _this.instantiationService = instantiationService;
            _this._backgroundColor = color_1.Color.white;
            _this._applyTheme(themeService.getTheme());
            _this._disposables.push(themeService.onThemeChange(_this._applyTheme.bind(_this)));
            _this.create();
            var onDidLayoutChangeScheduler = new async_1.RunOnceScheduler(function () { return _this._doLayout(undefined, undefined); }, 50);
            _this._disposables.push(_this.editor.onDidLayoutChange(function () { return onDidLayoutChangeScheduler.schedule(); }));
            _this._disposables.push(onDidLayoutChangeScheduler);
            return _this;
        }
        ExceptionWidget.prototype._applyTheme = function (theme) {
            this._backgroundColor = theme.getColor(exports.debugExceptionWidgetBackground);
            var frameColor = theme.getColor(exports.debugExceptionWidgetBorder);
            this.style({
                arrowColor: frameColor,
                frameColor: frameColor
            }); // style() will trigger _applyStyles
        };
        ExceptionWidget.prototype._applyStyles = function () {
            if (this.container) {
                this.container.style.backgroundColor = this._backgroundColor.toString();
            }
            _super.prototype._applyStyles.call(this);
        };
        ExceptionWidget.prototype._fillContainer = function (container) {
            this.setCssClass('exception-widget');
            // Set the font size and line height to the one from the editor configuration.
            var fontInfo = this.editor.getConfiguration().fontInfo;
            this.container.style.fontSize = fontInfo.fontSize + "px";
            this.container.style.lineHeight = fontInfo.lineHeight + "px";
            var title = $('.title');
            title.textContent = this.exceptionInfo.id ? nls.localize('exceptionThrownWithId', 'Exception has occurred: {0}', this.exceptionInfo.id) : nls.localize('exceptionThrown', 'Exception has occurred.');
            dom.append(container, title);
            if (this.exceptionInfo.description) {
                var description = $('.description');
                description.textContent = this.exceptionInfo.description;
                dom.append(container, description);
            }
            if (this.exceptionInfo.details && this.exceptionInfo.details.stackTrace) {
                var stackTrace = $('.stack-trace');
                var linkDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
                var linkedStackTrace = linkDetector.handleLinks(this.exceptionInfo.details.stackTrace);
                typeof linkedStackTrace === 'string' ? stackTrace.textContent = linkedStackTrace : stackTrace.appendChild(linkedStackTrace);
                dom.append(container, stackTrace);
            }
        };
        ExceptionWidget.prototype._doLayout = function (heightInPixel, widthInPixel) {
            // Reload the height with respect to the exception text content and relayout it to match the line count.
            this.container.style.height = 'initial';
            var lineHeight = this.editor.getConfiguration().lineHeight;
            var arrowHeight = Math.round(lineHeight / 3);
            var computedLinesNumber = Math.ceil((this.container.offsetHeight + arrowHeight) / lineHeight);
            this._relayout(computedLinesNumber);
        };
        ExceptionWidget = __decorate([
            __param(2, themeService_1.IThemeService),
            __param(3, instantiation_1.IInstantiationService)
        ], ExceptionWidget);
        return ExceptionWidget;
    }(zoneWidget_1.ZoneWidget));
    exports.ExceptionWidget = ExceptionWidget;
});
