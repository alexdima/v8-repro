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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/base/common/scrollable", "vs/base/browser/dom", "vs/base/parts/tree/browser/treeDefaults", "vs/editor/common/core/range", "vs/editor/browser/editorBrowser", "vs/workbench/parts/debug/common/debugModel", "vs/workbench/parts/debug/browser/baseDebugView", "vs/workbench/parts/debug/electron-browser/variablesView", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/platform/theme/common/styler", "vs/platform/theme/common/colorRegistry", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration"], function (require, exports, nls, lifecycle, winjs_base_1, scrollable_1, dom, treeDefaults_1, range_1, editorBrowser_1, debugModel_1, baseDebugView_1, variablesView_1, scrollableElement_1, styler_1, colorRegistry_1, listService_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var MAX_ELEMENTS_SHOWN = 18;
    var DebugHoverWidget = /** @class */ (function () {
        function DebugHoverWidget(editor, debugService, instantiationService, themeService) {
            this.editor = editor;
            this.debugService = debugService;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
            // editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.toDispose = [];
            this._isVisible = false;
            this.showAtPosition = null;
            this.highlightDecorations = [];
        }
        DebugHoverWidget.prototype.create = function () {
            var _this = this;
            this.domNode = $('.debug-hover-widget');
            this.complexValueContainer = dom.append(this.domNode, $('.complex-value'));
            this.complexValueTitle = dom.append(this.complexValueContainer, $('.title'));
            this.treeContainer = dom.append(this.complexValueContainer, $('.debug-hover-tree'));
            this.treeContainer.setAttribute('role', 'tree');
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchTree, this.treeContainer, {
                dataSource: new variablesView_1.VariablesDataSource(),
                renderer: this.instantiationService.createInstance(VariablesHoverRenderer),
                controller: this.instantiationService.createInstance(DebugHoverController, this.editor)
            }, {
                indentPixels: 6,
                twistiePixels: 15,
                ariaLabel: nls.localize('treeAriaLabel', "Debug Hover")
            });
            this.valueContainer = $('.value');
            this.valueContainer.tabIndex = 0;
            this.valueContainer.setAttribute('role', 'tooltip');
            this.scrollbar = new scrollableElement_1.DomScrollableElement(this.valueContainer, { horizontal: scrollable_1.ScrollbarVisibility.Hidden });
            this.domNode.appendChild(this.scrollbar.getDomNode());
            this.toDispose.push(this.scrollbar);
            this.editor.applyFontInfo(this.domNode);
            this.toDispose.push(styler_1.attachStylerCallback(this.themeService, { editorHoverBackground: colorRegistry_1.editorHoverBackground, editorHoverBorder: colorRegistry_1.editorHoverBorder }, function (colors) {
                _this.domNode.style.backgroundColor = colors.editorHoverBackground;
                if (colors.editorHoverBorder) {
                    _this.domNode.style.border = "1px solid " + colors.editorHoverBorder;
                }
                else {
                    _this.domNode.style.border = null;
                }
            }));
            this.registerListeners();
            this.editor.addContentWidget(this);
        };
        DebugHoverWidget.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.tree.onDidExpandItem(function () {
                _this.layoutTree();
            }));
            this.toDispose.push(this.tree.onDidCollapseItem(function () {
                _this.layoutTree();
            }));
            this.toDispose.push(dom.addStandardDisposableListener(this.domNode, 'keydown', function (e) {
                if (e.equals(9 /* Escape */)) {
                    _this.hide();
                }
            }));
            this.toDispose.push(this.editor.onDidChangeConfiguration(function (e) {
                if (e.fontInfo) {
                    _this.editor.applyFontInfo(_this.domNode);
                }
            }));
        };
        DebugHoverWidget.prototype.isVisible = function () {
            return this._isVisible;
        };
        DebugHoverWidget.prototype.getId = function () {
            return DebugHoverWidget.ID;
        };
        DebugHoverWidget.prototype.getDomNode = function () {
            return this.domNode;
        };
        DebugHoverWidget.prototype.getExactExpressionRange = function (lineContent, range) {
            var matchingExpression = undefined;
            var startOffset = 0;
            // Some example supported expressions: myVar.prop, a.b.c.d, myVar?.prop, myVar->prop, MyClass::StaticProp, *myVar
            // Match any character except a set of characters which often break interesting sub-expressions
            var expression = /([^()\[\]{}<>\s+\-/%~#^;=|,`!]|\->)+/g;
            var result = undefined;
            // First find the full expression under the cursor
            while (result = expression.exec(lineContent)) {
                var start = result.index + 1;
                var end = start + result[0].length;
                if (start <= range.startColumn && end >= range.endColumn) {
                    matchingExpression = result[0];
                    startOffset = start;
                    break;
                }
            }
            // If there are non-word characters after the cursor, we want to truncate the expression then.
            // For example in expression 'a.b.c.d', if the focus was under 'b', 'a.b' would be evaluated.
            if (matchingExpression) {
                var subExpression = /\w+/g;
                var subExpressionResult = undefined;
                while (subExpressionResult = subExpression.exec(matchingExpression)) {
                    var subEnd = subExpressionResult.index + 1 + startOffset + subExpressionResult[0].length;
                    if (subEnd >= range.endColumn) {
                        break;
                    }
                }
                if (subExpressionResult) {
                    matchingExpression = matchingExpression.substring(0, subExpression.lastIndex);
                }
            }
            return matchingExpression ?
                new range_1.Range(range.startLineNumber, startOffset, range.endLineNumber, startOffset + matchingExpression.length - 1) :
                new range_1.Range(range.startLineNumber, 0, range.endLineNumber, 0);
        };
        DebugHoverWidget.prototype.showAt = function (range, focus) {
            var _this = this;
            var pos = range.getStartPosition();
            var process = this.debugService.getViewModel().focusedProcess;
            var lineContent = this.editor.getModel().getLineContent(pos.lineNumber);
            var expressionRange = this.getExactExpressionRange(lineContent, range);
            // use regex to extract the sub-expression #9821
            var matchingExpression = lineContent.substring(expressionRange.startColumn - 1, expressionRange.endColumn);
            if (!matchingExpression) {
                return winjs_base_1.TPromise.as(this.hide());
            }
            var promise;
            if (process.session.capabilities.supportsEvaluateForHovers) {
                var result_1 = new debugModel_1.Expression(matchingExpression);
                promise = result_1.evaluate(process, this.debugService.getViewModel().focusedStackFrame, 'hover').then(function () { return result_1; });
            }
            else {
                promise = this.findExpressionInStackFrame(matchingExpression.split('.').map(function (word) { return word.trim(); }).filter(function (word) { return !!word; }), expressionRange);
            }
            return promise.then(function (expression) {
                if (!expression || (expression instanceof debugModel_1.Expression && !expression.available)) {
                    _this.hide();
                    return undefined;
                }
                _this.highlightDecorations = _this.editor.deltaDecorations(_this.highlightDecorations, [{
                        range: new range_1.Range(pos.lineNumber, expressionRange.startColumn, pos.lineNumber, expressionRange.startColumn + matchingExpression.length),
                        options: {
                            className: 'hoverHighlight'
                        }
                    }]);
                return _this.doShow(pos, expression, focus);
            });
        };
        DebugHoverWidget.prototype.doFindExpression = function (container, namesToFind) {
            var _this = this;
            if (!container) {
                return winjs_base_1.TPromise.as(null);
            }
            return container.getChildren().then(function (children) {
                // look for our variable in the list. First find the parents of the hovered variable if there are any.
                var filtered = children.filter(function (v) { return namesToFind[0] === v.name; });
                if (filtered.length !== 1) {
                    return null;
                }
                if (namesToFind.length === 1) {
                    return filtered[0];
                }
                else {
                    return _this.doFindExpression(filtered[0], namesToFind.slice(1));
                }
            });
        };
        DebugHoverWidget.prototype.findExpressionInStackFrame = function (namesToFind, expressionRange) {
            var _this = this;
            return this.debugService.getViewModel().focusedStackFrame.getScopes()
                .then(function (scopes) { return scopes.filter(function (s) { return !s.expensive; }); })
                .then(function (scopes) { return winjs_base_1.TPromise.join(scopes.map(function (scope) { return _this.doFindExpression(scope, namesToFind); })); })
                .then(function (expressions) { return expressions.filter(function (exp) { return !!exp; }); })
                .then(function (expressions) { return (expressions.length > 0 && expressions.every(function (e) { return e.value === expressions[0].value; })) ? expressions[0] : null; });
        };
        DebugHoverWidget.prototype.doShow = function (position, expression, focus, forceValueHover) {
            var _this = this;
            if (forceValueHover === void 0) { forceValueHover = false; }
            if (!this.domNode) {
                this.create();
            }
            this.showAtPosition = position;
            this._isVisible = true;
            this.stoleFocus = focus;
            if (!expression.hasChildren || forceValueHover) {
                this.complexValueContainer.hidden = true;
                this.valueContainer.hidden = false;
                baseDebugView_1.renderExpressionValue(expression, this.valueContainer, {
                    showChanged: false,
                    preserveWhitespace: true,
                    colorize: true
                });
                this.valueContainer.title = '';
                this.editor.layoutContentWidget(this);
                this.scrollbar.scanDomNode();
                if (focus) {
                    this.editor.render();
                    this.valueContainer.focus();
                }
                return winjs_base_1.TPromise.as(null);
            }
            this.valueContainer.hidden = true;
            this.complexValueContainer.hidden = false;
            return this.tree.setInput(expression).then(function () {
                _this.complexValueTitle.textContent = expression.value;
                _this.complexValueTitle.title = expression.value;
                _this.layoutTree();
                _this.editor.layoutContentWidget(_this);
                _this.scrollbar.scanDomNode();
                if (focus) {
                    _this.editor.render();
                    _this.tree.DOMFocus();
                }
            });
        };
        DebugHoverWidget.prototype.layoutTree = function () {
            var navigator = this.tree.getNavigator();
            var visibleElementsCount = 0;
            while (navigator.next()) {
                visibleElementsCount++;
            }
            if (visibleElementsCount === 0) {
                this.doShow(this.showAtPosition, this.tree.getInput(), false, true);
            }
            else {
                var height = Math.min(visibleElementsCount, MAX_ELEMENTS_SHOWN) * 18;
                if (this.treeContainer.clientHeight !== height) {
                    this.treeContainer.style.height = height + "px";
                    this.tree.layout();
                }
            }
        };
        DebugHoverWidget.prototype.hide = function () {
            if (!this._isVisible) {
                return;
            }
            this._isVisible = false;
            this.editor.deltaDecorations(this.highlightDecorations, []);
            this.highlightDecorations = [];
            this.editor.layoutContentWidget(this);
            if (this.stoleFocus) {
                this.editor.focus();
            }
        };
        DebugHoverWidget.prototype.getPosition = function () {
            return this._isVisible ? {
                position: this.showAtPosition,
                preference: [
                    editorBrowser_1.ContentWidgetPositionPreference.ABOVE,
                    editorBrowser_1.ContentWidgetPositionPreference.BELOW
                ]
            } : null;
        };
        DebugHoverWidget.prototype.dispose = function () {
            this.toDispose = lifecycle.dispose(this.toDispose);
        };
        DebugHoverWidget.ID = 'debug.hoverWidget';
        return DebugHoverWidget;
    }());
    exports.DebugHoverWidget = DebugHoverWidget;
    var DebugHoverController = /** @class */ (function (_super) {
        __extends(DebugHoverController, _super);
        function DebugHoverController(editor, configurationService) {
            var _this = _super.call(this, { openMode: treeDefaults_1.OpenMode.SINGLE_CLICK }, configurationService) || this;
            _this.editor = editor;
            return _this;
        }
        DebugHoverController.prototype.onLeftClick = function (tree, element, eventish, origin) {
            if (origin === void 0) { origin = 'mouse'; }
            if (element.reference > 0) {
                _super.prototype.onLeftClick.call(this, tree, element, eventish, origin);
                tree.clearFocus();
                tree.deselect(element);
                this.editor.focus();
            }
            return true;
        };
        DebugHoverController = __decorate([
            __param(1, configuration_1.IConfigurationService)
        ], DebugHoverController);
        return DebugHoverController;
    }(listService_1.WorkbenchTreeController));
    var VariablesHoverRenderer = /** @class */ (function (_super) {
        __extends(VariablesHoverRenderer, _super);
        function VariablesHoverRenderer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        VariablesHoverRenderer.prototype.getHeight = function (tree, element) {
            return 18;
        };
        return VariablesHoverRenderer;
    }(variablesView_1.VariablesRenderer));
});
