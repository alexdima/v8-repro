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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/strings", "vs/base/common/objects", "vs/base/browser/builder", "vs/base/common/event", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/zoneWidget/zoneWidget", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/platform/contextkey/common/contextkey", "vs/base/common/color", "vs/css!./media/peekViewWidget"], function (require, exports, nls, actions_1, strings, objects, builder_1, event_1, dom, actionbar_1, codeEditorService_1, zoneWidget_1, embeddedCodeEditorWidget_1, contextkey_1, color_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var PeekContext;
    (function (PeekContext) {
        PeekContext.inPeekEditor = new contextkey_1.RawContextKey('inReferenceSearchEditor', true);
        PeekContext.notInPeekEditor = PeekContext.inPeekEditor.toNegated();
    })(PeekContext = exports.PeekContext || (exports.PeekContext = {}));
    function getOuterEditor(accessor) {
        var editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
        if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
            return editor.getParentEditor();
        }
        return editor;
    }
    exports.getOuterEditor = getOuterEditor;
    var defaultOptions = {
        headerBackgroundColor: color_1.Color.white,
        primaryHeadingColor: color_1.Color.fromHex('#333333'),
        secondaryHeadingColor: color_1.Color.fromHex('#6c6c6cb3')
    };
    var PeekViewWidget = /** @class */ (function (_super) {
        __extends(PeekViewWidget, _super);
        function PeekViewWidget(editor, options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this, editor, options) || this;
            _this._onDidClose = new event_1.Emitter();
            objects.mixin(_this.options, defaultOptions, false);
            return _this;
        }
        PeekViewWidget.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._onDidClose.fire(this);
        };
        Object.defineProperty(PeekViewWidget.prototype, "onDidClose", {
            get: function () {
                return this._onDidClose.event;
            },
            enumerable: true,
            configurable: true
        });
        PeekViewWidget.prototype.style = function (styles) {
            var options = this.options;
            if (styles.headerBackgroundColor) {
                options.headerBackgroundColor = styles.headerBackgroundColor;
            }
            if (styles.primaryHeadingColor) {
                options.primaryHeadingColor = styles.primaryHeadingColor;
            }
            if (styles.secondaryHeadingColor) {
                options.secondaryHeadingColor = styles.secondaryHeadingColor;
            }
            _super.prototype.style.call(this, styles);
        };
        PeekViewWidget.prototype._applyStyles = function () {
            _super.prototype._applyStyles.call(this);
            var options = this.options;
            if (this._headElement) {
                this._headElement.style.backgroundColor = options.headerBackgroundColor.toString();
            }
            if (this._primaryHeading) {
                this._primaryHeading.style.color = options.primaryHeadingColor.toString();
            }
            if (this._secondaryHeading) {
                this._secondaryHeading.style.color = options.secondaryHeadingColor.toString();
            }
            if (this._bodyElement) {
                this._bodyElement.style.borderColor = options.frameColor.toString();
            }
        };
        PeekViewWidget.prototype._fillContainer = function (container) {
            this.setCssClass('peekview-widget');
            this._headElement = builder_1.$('.head').getHTMLElement();
            this._bodyElement = builder_1.$('.body').getHTMLElement();
            this._fillHead(this._headElement);
            this._fillBody(this._bodyElement);
            container.appendChild(this._headElement);
            container.appendChild(this._bodyElement);
        };
        PeekViewWidget.prototype._fillHead = function (container) {
            var _this = this;
            var titleElement = builder_1.$('.peekview-title').
                on(dom.EventType.CLICK, function (e) { return _this._onTitleClick(e); }).
                appendTo(this._headElement).
                getHTMLElement();
            this._primaryHeading = builder_1.$('span.filename').appendTo(titleElement).getHTMLElement();
            this._secondaryHeading = builder_1.$('span.dirname').appendTo(titleElement).getHTMLElement();
            this._metaHeading = builder_1.$('span.meta').appendTo(titleElement).getHTMLElement();
            var actionsContainer = builder_1.$('.peekview-actions').appendTo(this._headElement);
            var actionBarOptions = this._getActionBarOptions();
            this._actionbarWidget = new actionbar_1.ActionBar(actionsContainer, actionBarOptions);
            this._actionbarWidget.push(new actions_1.Action('peekview.close', nls.localize('label.close', "Close"), 'close-peekview-action', true, function () {
                _this.dispose();
                return null;
            }), { label: false, icon: true });
        };
        PeekViewWidget.prototype._getActionBarOptions = function () {
            return {};
        };
        PeekViewWidget.prototype._onTitleClick = function (event) {
            // implement me
        };
        PeekViewWidget.prototype.setTitle = function (primaryHeading, secondaryHeading) {
            builder_1.$(this._primaryHeading).safeInnerHtml(primaryHeading);
            this._primaryHeading.setAttribute('aria-label', primaryHeading);
            if (secondaryHeading) {
                builder_1.$(this._secondaryHeading).safeInnerHtml(secondaryHeading);
            }
            else {
                dom.clearNode(this._secondaryHeading);
            }
        };
        PeekViewWidget.prototype.setMetaTitle = function (value) {
            if (value) {
                builder_1.$(this._metaHeading).safeInnerHtml(value);
            }
            else {
                dom.clearNode(this._metaHeading);
            }
        };
        PeekViewWidget.prototype._doLayout = function (heightInPixel, widthInPixel) {
            if (!this._isShowing && heightInPixel < 0) {
                // Looks like the view zone got folded away!
                this.dispose();
                return;
            }
            var headHeight = Math.ceil(this.editor.getConfiguration().lineHeight * 1.2), bodyHeight = heightInPixel - (headHeight + 2 /* the border-top/bottom width*/);
            this._doLayoutHead(headHeight, widthInPixel);
            this._doLayoutBody(bodyHeight, widthInPixel);
        };
        PeekViewWidget.prototype._doLayoutHead = function (heightInPixel, widthInPixel) {
            this._headElement.style.height = strings.format('{0}px', heightInPixel);
            this._headElement.style.lineHeight = this._headElement.style.height;
        };
        PeekViewWidget.prototype._doLayoutBody = function (heightInPixel, widthInPixel) {
            this._bodyElement.style.height = strings.format('{0}px', heightInPixel);
        };
        return PeekViewWidget;
    }(zoneWidget_1.ZoneWidget));
    exports.PeekViewWidget = PeekViewWidget;
});
