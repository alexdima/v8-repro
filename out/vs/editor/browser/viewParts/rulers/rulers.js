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
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart", "vs/platform/theme/common/themeService", "vs/editor/common/view/editorColorRegistry", "vs/base/browser/dom", "vs/css!./rulers"], function (require, exports, fastDomNode_1, viewPart_1, themeService_1, editorColorRegistry_1, dom) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Rulers = /** @class */ (function (_super) {
        __extends(Rulers, _super);
        function Rulers(context) {
            var _this = _super.call(this, context) || this;
            _this.domNode = fastDomNode_1.createFastDomNode(document.createElement('div'));
            _this.domNode.setAttribute('role', 'presentation');
            _this.domNode.setAttribute('aria-hidden', 'true');
            _this.domNode.setClassName('view-rulers');
            _this._renderedRulers = [];
            _this._rulers = _this._context.configuration.editor.viewInfo.rulers;
            _this._typicalHalfwidthCharacterWidth = _this._context.configuration.editor.fontInfo.typicalHalfwidthCharacterWidth;
            return _this;
        }
        Rulers.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        // --- begin event handlers
        Rulers.prototype.onConfigurationChanged = function (e) {
            if (e.viewInfo || e.layoutInfo || e.fontInfo) {
                this._rulers = this._context.configuration.editor.viewInfo.rulers;
                this._typicalHalfwidthCharacterWidth = this._context.configuration.editor.fontInfo.typicalHalfwidthCharacterWidth;
                return true;
            }
            return false;
        };
        Rulers.prototype.onScrollChanged = function (e) {
            return e.scrollHeightChanged;
        };
        // --- end event handlers
        Rulers.prototype.prepareRender = function (ctx) {
            // Nothing to read
        };
        Rulers.prototype._ensureRulersCount = function () {
            var currentCount = this._renderedRulers.length;
            var desiredCount = this._rulers.length;
            if (currentCount === desiredCount) {
                // Nothing to do
                return;
            }
            if (currentCount < desiredCount) {
                var rulerWidth = dom.computeScreenAwareSize(1);
                var addCount = desiredCount - currentCount;
                while (addCount > 0) {
                    var node = fastDomNode_1.createFastDomNode(document.createElement('div'));
                    node.setClassName('view-ruler');
                    node.setWidth(rulerWidth);
                    this.domNode.appendChild(node);
                    this._renderedRulers.push(node);
                    addCount--;
                }
                return;
            }
            var removeCount = currentCount - desiredCount;
            while (removeCount > 0) {
                var node = this._renderedRulers.pop();
                this.domNode.removeChild(node);
                removeCount--;
            }
        };
        Rulers.prototype.render = function (ctx) {
            this._ensureRulersCount();
            for (var i = 0, len = this._rulers.length; i < len; i++) {
                var node = this._renderedRulers[i];
                node.setHeight(Math.min(ctx.scrollHeight, 1000000));
                node.setLeft(this._rulers[i] * this._typicalHalfwidthCharacterWidth);
            }
        };
        return Rulers;
    }(viewPart_1.ViewPart));
    exports.Rulers = Rulers;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var rulerColor = theme.getColor(editorColorRegistry_1.editorRuler);
        if (rulerColor) {
            collector.addRule(".monaco-editor .view-ruler { background-color: " + rulerColor + "; }");
        }
    });
});
