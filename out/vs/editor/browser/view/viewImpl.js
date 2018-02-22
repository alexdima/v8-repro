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
define(["require", "exports", "vs/base/common/errors", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/editor/common/core/range", "vs/editor/common/viewModel/viewEventHandler", "vs/editor/browser/controller/textAreaHandler", "vs/editor/browser/controller/pointerHandler", "vs/editor/browser/view/viewController", "vs/editor/common/view/viewEventDispatcher", "vs/editor/browser/view/viewOverlays", "vs/editor/browser/viewParts/contentWidgets/contentWidgets", "vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight", "vs/editor/browser/viewParts/currentLineMarginHighlight/currentLineMarginHighlight", "vs/editor/browser/viewParts/decorations/decorations", "vs/editor/browser/viewParts/glyphMargin/glyphMargin", "vs/editor/browser/viewParts/lineNumbers/lineNumbers", "vs/editor/browser/viewParts/indentGuides/indentGuides", "vs/editor/browser/viewParts/lines/viewLines", "vs/editor/browser/viewParts/margin/margin", "vs/editor/browser/viewParts/linesDecorations/linesDecorations", "vs/editor/browser/viewParts/marginDecorations/marginDecorations", "vs/editor/browser/viewParts/overlayWidgets/overlayWidgets", "vs/editor/browser/viewParts/overviewRuler/decorationsOverviewRuler", "vs/editor/browser/viewParts/overviewRuler/overviewRuler", "vs/editor/browser/viewParts/rulers/rulers", "vs/editor/browser/viewParts/scrollDecoration/scrollDecoration", "vs/editor/browser/viewParts/selections/selections", "vs/editor/browser/viewParts/viewCursors/viewCursors", "vs/editor/browser/viewParts/viewZones/viewZones", "vs/editor/browser/view/viewPart", "vs/editor/common/view/viewContext", "vs/editor/common/view/renderingContext", "vs/editor/browser/view/viewOutgoingEvents", "vs/editor/common/viewLayout/viewLinesViewportData", "vs/editor/browser/viewParts/editorScrollbar/editorScrollbar", "vs/editor/browser/viewParts/minimap/minimap", "vs/editor/common/view/viewEvents", "vs/platform/theme/common/themeService"], function (require, exports, errors_1, dom, fastDomNode_1, range_1, viewEventHandler_1, textAreaHandler_1, pointerHandler_1, viewController_1, viewEventDispatcher_1, viewOverlays_1, contentWidgets_1, currentLineHighlight_1, currentLineMarginHighlight_1, decorations_1, glyphMargin_1, lineNumbers_1, indentGuides_1, viewLines_1, margin_1, linesDecorations_1, marginDecorations_1, overlayWidgets_1, decorationsOverviewRuler_1, overviewRuler_1, rulers_1, scrollDecoration_1, selections_1, viewCursors_1, viewZones_1, viewPart_1, viewContext_1, renderingContext_1, viewOutgoingEvents_1, viewLinesViewportData_1, editorScrollbar_1, minimap_1, viewEvents, themeService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var View = /** @class */ (function (_super) {
        __extends(View, _super);
        function View(commandService, configuration, themeService, model, cursor, execCoreEditorCommandFunc) {
            var _this = _super.call(this) || this;
            _this._cursor = cursor;
            _this._renderAnimationFrame = null;
            _this.outgoingEvents = new viewOutgoingEvents_1.ViewOutgoingEvents(model);
            var viewController = new viewController_1.ViewController(configuration, model, execCoreEditorCommandFunc, _this.outgoingEvents, commandService);
            // The event dispatcher will always go through _renderOnce before dispatching any events
            _this.eventDispatcher = new viewEventDispatcher_1.ViewEventDispatcher(function (callback) { return _this._renderOnce(callback); });
            // Ensure the view is the first event handler in order to update the layout
            _this.eventDispatcher.addEventHandler(_this);
            // The view context is passed on to most classes (basically to reduce param. counts in ctors)
            _this._context = new viewContext_1.ViewContext(configuration, themeService.getTheme(), model, _this.eventDispatcher);
            _this._register(themeService.onThemeChange(function (theme) {
                _this._context.theme = theme;
                _this.eventDispatcher.emit(new viewEvents.ViewThemeChangedEvent());
                _this.render(true, false);
            }));
            _this.viewParts = [];
            // Keyboard handler
            _this._textAreaHandler = new textAreaHandler_1.TextAreaHandler(_this._context, viewController, _this.createTextAreaHandlerHelper());
            _this.viewParts.push(_this._textAreaHandler);
            _this.createViewParts();
            _this._setLayout();
            // Pointer handler
            _this.pointerHandler = new pointerHandler_1.PointerHandler(_this._context, viewController, _this.createPointerHandlerHelper());
            _this._register(model.addEventListener(function (events) {
                _this.eventDispatcher.emitMany(events);
            }));
            _this._register(_this._cursor.addEventListener(function (events) {
                _this.eventDispatcher.emitMany(events);
            }));
            return _this;
        }
        View.prototype.createViewParts = function () {
            // These two dom nodes must be constructed up front, since references are needed in the layout provider (scrolling & co.)
            this.linesContent = fastDomNode_1.createFastDomNode(document.createElement('div'));
            this.linesContent.setClassName('lines-content' + ' monaco-editor-background');
            this.linesContent.setPosition('absolute');
            this.domNode = fastDomNode_1.createFastDomNode(document.createElement('div'));
            this.domNode.setClassName(this.getEditorClassName());
            this.overflowGuardContainer = fastDomNode_1.createFastDomNode(document.createElement('div'));
            viewPart_1.PartFingerprints.write(this.overflowGuardContainer, 3 /* OverflowGuard */);
            this.overflowGuardContainer.setClassName('overflow-guard');
            this._scrollbar = new editorScrollbar_1.EditorScrollbar(this._context, this.linesContent, this.domNode, this.overflowGuardContainer);
            this.viewParts.push(this._scrollbar);
            // View Lines
            this.viewLines = new viewLines_1.ViewLines(this._context, this.linesContent);
            // View Zones
            this.viewZones = new viewZones_1.ViewZones(this._context);
            this.viewParts.push(this.viewZones);
            // Decorations overview ruler
            var decorationsOverviewRuler = new decorationsOverviewRuler_1.DecorationsOverviewRuler(this._context);
            this.viewParts.push(decorationsOverviewRuler);
            var scrollDecoration = new scrollDecoration_1.ScrollDecorationViewPart(this._context);
            this.viewParts.push(scrollDecoration);
            var contentViewOverlays = new viewOverlays_1.ContentViewOverlays(this._context);
            this.viewParts.push(contentViewOverlays);
            contentViewOverlays.addDynamicOverlay(new currentLineHighlight_1.CurrentLineHighlightOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new selections_1.SelectionsOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new decorations_1.DecorationsOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new indentGuides_1.IndentGuidesOverlay(this._context));
            var marginViewOverlays = new viewOverlays_1.MarginViewOverlays(this._context);
            this.viewParts.push(marginViewOverlays);
            marginViewOverlays.addDynamicOverlay(new currentLineMarginHighlight_1.CurrentLineMarginHighlightOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new glyphMargin_1.GlyphMarginOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new marginDecorations_1.MarginViewLineDecorationsOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new linesDecorations_1.LinesDecorationsOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new lineNumbers_1.LineNumbersOverlay(this._context));
            var margin = new margin_1.Margin(this._context);
            margin.getDomNode().appendChild(this.viewZones.marginDomNode);
            margin.getDomNode().appendChild(marginViewOverlays.getDomNode());
            this.viewParts.push(margin);
            // Content widgets
            this.contentWidgets = new contentWidgets_1.ViewContentWidgets(this._context, this.domNode);
            this.viewParts.push(this.contentWidgets);
            this.viewCursors = new viewCursors_1.ViewCursors(this._context);
            this.viewParts.push(this.viewCursors);
            // Overlay widgets
            this.overlayWidgets = new overlayWidgets_1.ViewOverlayWidgets(this._context);
            this.viewParts.push(this.overlayWidgets);
            var rulers = new rulers_1.Rulers(this._context);
            this.viewParts.push(rulers);
            var minimap = new minimap_1.Minimap(this._context);
            this.viewParts.push(minimap);
            // -------------- Wire dom nodes up
            if (decorationsOverviewRuler) {
                var overviewRulerData = this._scrollbar.getOverviewRulerLayoutInfo();
                overviewRulerData.parent.insertBefore(decorationsOverviewRuler.getDomNode(), overviewRulerData.insertBefore);
            }
            this.linesContent.appendChild(contentViewOverlays.getDomNode());
            this.linesContent.appendChild(rulers.domNode);
            this.linesContent.appendChild(this.viewZones.domNode);
            this.linesContent.appendChild(this.viewLines.getDomNode());
            this.linesContent.appendChild(this.contentWidgets.domNode);
            this.linesContent.appendChild(this.viewCursors.getDomNode());
            this.overflowGuardContainer.appendChild(margin.getDomNode());
            this.overflowGuardContainer.appendChild(this._scrollbar.getDomNode());
            this.overflowGuardContainer.appendChild(scrollDecoration.getDomNode());
            this.overflowGuardContainer.appendChild(this._textAreaHandler.textArea);
            this.overflowGuardContainer.appendChild(this._textAreaHandler.textAreaCover);
            this.overflowGuardContainer.appendChild(this.overlayWidgets.getDomNode());
            this.overflowGuardContainer.appendChild(minimap.getDomNode());
            this.domNode.appendChild(this.overflowGuardContainer);
            this.domNode.appendChild(this.contentWidgets.overflowingContentWidgetsDomNode);
        };
        View.prototype._flushAccumulatedAndRenderNow = function () {
            this._renderNow();
        };
        View.prototype.createPointerHandlerHelper = function () {
            var _this = this;
            return {
                viewDomNode: this.domNode.domNode,
                linesContentDomNode: this.linesContent.domNode,
                focusTextArea: function () {
                    _this.focus();
                },
                getLastViewCursorsRenderData: function () {
                    return _this.viewCursors.getLastRenderData() || [];
                },
                shouldSuppressMouseDownOnViewZone: function (viewZoneId) {
                    return _this.viewZones.shouldSuppressMouseDownOnViewZone(viewZoneId);
                },
                shouldSuppressMouseDownOnWidget: function (widgetId) {
                    return _this.contentWidgets.shouldSuppressMouseDownOnWidget(widgetId);
                },
                getPositionFromDOMInfo: function (spanNode, offset) {
                    _this._flushAccumulatedAndRenderNow();
                    return _this.viewLines.getPositionFromDOMInfo(spanNode, offset);
                },
                visibleRangeForPosition2: function (lineNumber, column) {
                    _this._flushAccumulatedAndRenderNow();
                    var visibleRanges = _this.viewLines.visibleRangesForRange2(new range_1.Range(lineNumber, column, lineNumber, column));
                    if (!visibleRanges) {
                        return null;
                    }
                    return visibleRanges[0];
                },
                getLineWidth: function (lineNumber) {
                    _this._flushAccumulatedAndRenderNow();
                    return _this.viewLines.getLineWidth(lineNumber);
                }
            };
        };
        View.prototype.createTextAreaHandlerHelper = function () {
            var _this = this;
            return {
                visibleRangeForPositionRelativeToEditor: function (lineNumber, column) {
                    _this._flushAccumulatedAndRenderNow();
                    var visibleRanges = _this.viewLines.visibleRangesForRange2(new range_1.Range(lineNumber, column, lineNumber, column));
                    if (!visibleRanges) {
                        return null;
                    }
                    return visibleRanges[0];
                }
            };
        };
        View.prototype._setLayout = function () {
            var layoutInfo = this._context.configuration.editor.layoutInfo;
            this.domNode.setWidth(layoutInfo.width);
            this.domNode.setHeight(layoutInfo.height);
            this.overflowGuardContainer.setWidth(layoutInfo.width);
            this.overflowGuardContainer.setHeight(layoutInfo.height);
            this.linesContent.setWidth(1000000);
            this.linesContent.setHeight(1000000);
        };
        View.prototype.getEditorClassName = function () {
            var focused = this._textAreaHandler.isFocused() ? ' focused' : '';
            return this._context.configuration.editor.editorClassName + ' ' + themeService_1.getThemeTypeSelector(this._context.theme.type) + focused;
        };
        // --- begin event handlers
        View.prototype.onConfigurationChanged = function (e) {
            if (e.editorClassName) {
                this.domNode.setClassName(this.getEditorClassName());
            }
            if (e.layoutInfo) {
                this._setLayout();
            }
            return false;
        };
        View.prototype.onFocusChanged = function (e) {
            this.domNode.setClassName(this.getEditorClassName());
            if (e.isFocused) {
                this.outgoingEvents.emitViewFocusGained();
            }
            else {
                this.outgoingEvents.emitViewFocusLost();
            }
            return false;
        };
        View.prototype.onScrollChanged = function (e) {
            this.outgoingEvents.emitScrollChanged(e);
            return false;
        };
        View.prototype.onThemeChanged = function (e) {
            this.domNode.setClassName(this.getEditorClassName());
            return false;
        };
        // --- end event handlers
        View.prototype.dispose = function () {
            if (this._renderAnimationFrame !== null) {
                this._renderAnimationFrame.dispose();
                this._renderAnimationFrame = null;
            }
            this.eventDispatcher.removeEventHandler(this);
            this.outgoingEvents.dispose();
            this.pointerHandler.dispose();
            this.viewLines.dispose();
            // Destroy view parts
            for (var i = 0, len = this.viewParts.length; i < len; i++) {
                this.viewParts[i].dispose();
            }
            this.viewParts = [];
            _super.prototype.dispose.call(this);
        };
        View.prototype._renderOnce = function (callback) {
            var r = safeInvokeNoArg(callback);
            this._scheduleRender();
            return r;
        };
        View.prototype._scheduleRender = function () {
            if (this._renderAnimationFrame === null) {
                this._renderAnimationFrame = dom.runAtThisOrScheduleAtNextAnimationFrame(this._onRenderScheduled.bind(this), 100);
            }
        };
        View.prototype._onRenderScheduled = function () {
            this._renderAnimationFrame = null;
            this._flushAccumulatedAndRenderNow();
        };
        View.prototype._renderNow = function () {
            var _this = this;
            safeInvokeNoArg(function () { return _this._actualRender(); });
        };
        View.prototype._getViewPartsToRender = function () {
            var result = [], resultLen = 0;
            for (var i = 0, len = this.viewParts.length; i < len; i++) {
                var viewPart = this.viewParts[i];
                if (viewPart.shouldRender()) {
                    result[resultLen++] = viewPart;
                }
            }
            return result;
        };
        View.prototype._actualRender = function () {
            if (!dom.isInDOM(this.domNode.domNode)) {
                return;
            }
            var viewPartsToRender = this._getViewPartsToRender();
            if (!this.viewLines.shouldRender() && viewPartsToRender.length === 0) {
                // Nothing to render
                return;
            }
            var partialViewportData = this._context.viewLayout.getLinesViewportData();
            this._context.model.setViewport(partialViewportData.startLineNumber, partialViewportData.endLineNumber, partialViewportData.centeredLineNumber);
            var viewportData = new viewLinesViewportData_1.ViewportData(this._cursor.getViewSelections(), partialViewportData, this._context.viewLayout.getWhitespaceViewportData(), this._context.model);
            if (this.contentWidgets.shouldRender()) {
                // Give the content widgets a chance to set their max width before a possible synchronous layout
                this.contentWidgets.onBeforeRender(viewportData);
            }
            if (this.viewLines.shouldRender()) {
                this.viewLines.renderText(viewportData);
                this.viewLines.onDidRender();
                // Rendering of viewLines might cause scroll events to occur, so collect view parts to render again
                viewPartsToRender = this._getViewPartsToRender();
            }
            var renderingContext = new renderingContext_1.RenderingContext(this._context.viewLayout, viewportData, this.viewLines);
            // Render the rest of the parts
            for (var i = 0, len = viewPartsToRender.length; i < len; i++) {
                var viewPart = viewPartsToRender[i];
                viewPart.prepareRender(renderingContext);
            }
            for (var i = 0, len = viewPartsToRender.length; i < len; i++) {
                var viewPart = viewPartsToRender[i];
                viewPart.render(renderingContext);
                viewPart.onDidRender();
            }
        };
        // --- BEGIN CodeEditor helpers
        View.prototype.delegateVerticalScrollbarMouseDown = function (browserEvent) {
            this._scrollbar.delegateVerticalScrollbarMouseDown(browserEvent);
        };
        View.prototype.restoreState = function (scrollPosition) {
            this._context.viewLayout.setScrollPositionNow({ scrollTop: scrollPosition.scrollTop });
            this._renderNow();
            this.viewLines.updateLineWidths();
            this._context.viewLayout.setScrollPositionNow({ scrollLeft: scrollPosition.scrollLeft });
        };
        View.prototype.getOffsetForColumn = function (modelLineNumber, modelColumn) {
            var modelPosition = this._context.model.validateModelPosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            var viewPosition = this._context.model.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            this._flushAccumulatedAndRenderNow();
            var visibleRanges = this.viewLines.visibleRangesForRange2(new range_1.Range(viewPosition.lineNumber, viewPosition.column, viewPosition.lineNumber, viewPosition.column));
            if (!visibleRanges) {
                return -1;
            }
            return visibleRanges[0].left;
        };
        View.prototype.getTargetAtClientPoint = function (clientX, clientY) {
            return this.pointerHandler.getTargetAtClientPoint(clientX, clientY);
        };
        View.prototype.getInternalEventBus = function () {
            return this.outgoingEvents;
        };
        View.prototype.createOverviewRuler = function (cssClassName) {
            return new overviewRuler_1.OverviewRuler(this._context, cssClassName);
        };
        View.prototype.change = function (callback) {
            var _this = this;
            var zonesHaveChanged = false;
            this._renderOnce(function () {
                var changeAccessor = {
                    addZone: function (zone) {
                        zonesHaveChanged = true;
                        return _this.viewZones.addZone(zone);
                    },
                    removeZone: function (id) {
                        if (!id) {
                            return;
                        }
                        zonesHaveChanged = _this.viewZones.removeZone(id) || zonesHaveChanged;
                    },
                    layoutZone: function (id) {
                        if (!id) {
                            return;
                        }
                        zonesHaveChanged = _this.viewZones.layoutZone(id) || zonesHaveChanged;
                    }
                };
                safeInvoke1Arg(callback, changeAccessor);
                // Invalidate changeAccessor
                changeAccessor.addZone = null;
                changeAccessor.removeZone = null;
                if (zonesHaveChanged) {
                    _this._context.viewLayout.onHeightMaybeChanged();
                    _this._context.privateViewEventBus.emit(new viewEvents.ViewZonesChangedEvent());
                }
            });
            return zonesHaveChanged;
        };
        View.prototype.render = function (now, everything) {
            if (everything) {
                // Force everything to render...
                this.viewLines.forceShouldRender();
                for (var i = 0, len = this.viewParts.length; i < len; i++) {
                    var viewPart = this.viewParts[i];
                    viewPart.forceShouldRender();
                }
            }
            if (now) {
                this._flushAccumulatedAndRenderNow();
            }
            else {
                this._scheduleRender();
            }
        };
        View.prototype.focus = function () {
            this._textAreaHandler.focusTextArea();
        };
        View.prototype.isFocused = function () {
            return this._textAreaHandler.isFocused();
        };
        View.prototype.addContentWidget = function (widgetData) {
            this.contentWidgets.addWidget(widgetData.widget);
            this.layoutContentWidget(widgetData);
            this._scheduleRender();
        };
        View.prototype.layoutContentWidget = function (widgetData) {
            var newPosition = widgetData.position ? widgetData.position.position : null;
            var newPreference = widgetData.position ? widgetData.position.preference : null;
            this.contentWidgets.setWidgetPosition(widgetData.widget, newPosition, newPreference);
            this._scheduleRender();
        };
        View.prototype.removeContentWidget = function (widgetData) {
            this.contentWidgets.removeWidget(widgetData.widget);
            this._scheduleRender();
        };
        View.prototype.addOverlayWidget = function (widgetData) {
            this.overlayWidgets.addWidget(widgetData.widget);
            this.layoutOverlayWidget(widgetData);
            this._scheduleRender();
        };
        View.prototype.layoutOverlayWidget = function (widgetData) {
            var newPreference = widgetData.position ? widgetData.position.preference : null;
            var shouldRender = this.overlayWidgets.setWidgetPosition(widgetData.widget, newPreference);
            if (shouldRender) {
                this._scheduleRender();
            }
        };
        View.prototype.removeOverlayWidget = function (widgetData) {
            this.overlayWidgets.removeWidget(widgetData.widget);
            this._scheduleRender();
        };
        return View;
    }(viewEventHandler_1.ViewEventHandler));
    exports.View = View;
    function safeInvokeNoArg(func) {
        try {
            return func();
        }
        catch (e) {
            errors_1.onUnexpectedError(e);
        }
    }
    function safeInvoke1Arg(func, arg1) {
        try {
            return func(arg1);
        }
        catch (e) {
            errors_1.onUnexpectedError(e);
        }
    }
});
