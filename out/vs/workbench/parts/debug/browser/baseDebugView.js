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
define(["require", "exports", "vs/base/browser/dom", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/common/debugModel", "vs/platform/contextview/browser/contextView", "vs/base/browser/ui/inputbox/inputBox", "vs/platform/theme/common/styler", "vs/base/common/lifecycle", "vs/base/common/functional", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuItemActionItem", "vs/base/common/errors", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration"], function (require, exports, dom, debug_1, debugModel_1, contextView_1, inputBox_1, styler_1, lifecycle_1, functional_1, contextkey_1, actions_1, menuItemActionItem_1, errors_1, listService_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
    exports.twistiePixels = 20;
    var booleanRegex = /^true|false$/i;
    var stringRegex = /^(['"]).*\1$/;
    var $ = dom.$;
    function renderViewTree(container) {
        var treeContainer = document.createElement('div');
        dom.addClass(treeContainer, 'debug-view-content');
        container.appendChild(treeContainer);
        return treeContainer;
    }
    exports.renderViewTree = renderViewTree;
    function replaceWhitespace(value) {
        var map = { '\n': '\\n', '\r': '\\r', '\t': '\\t' };
        return value.replace(/[\n\r\t]/g, function (char) { return map[char]; });
    }
    function renderExpressionValue(expressionOrValue, container, options) {
        var value = typeof expressionOrValue === 'string' ? expressionOrValue : expressionOrValue.value;
        // remove stale classes
        container.className = 'value';
        // when resolving expressions we represent errors from the server as a variable with name === null.
        if (value === null || ((expressionOrValue instanceof debugModel_1.Expression || expressionOrValue instanceof debugModel_1.Variable) && !expressionOrValue.available)) {
            dom.addClass(container, 'unavailable');
            if (value !== debugModel_1.Expression.DEFAULT_VALUE) {
                dom.addClass(container, 'error');
            }
        }
        if (options.colorize && typeof expressionOrValue !== 'string') {
            if (expressionOrValue.type === 'number' || expressionOrValue.type === 'boolean' || expressionOrValue.type === 'string') {
                dom.addClass(container, expressionOrValue.type);
            }
            else if (!isNaN(+value)) {
                dom.addClass(container, 'number');
            }
            else if (booleanRegex.test(value)) {
                dom.addClass(container, 'boolean');
            }
            else if (stringRegex.test(value)) {
                dom.addClass(container, 'string');
            }
        }
        if (options.showChanged && expressionOrValue.valueChanged && value !== debugModel_1.Expression.DEFAULT_VALUE) {
            // value changed color has priority over other colors.
            container.className = 'value changed';
        }
        if (options.maxValueLength && value.length > options.maxValueLength) {
            value = value.substr(0, options.maxValueLength) + '...';
        }
        if (value && !options.preserveWhitespace) {
            container.textContent = replaceWhitespace(value);
        }
        else {
            container.textContent = value;
        }
        if (options.showHover) {
            container.title = value;
        }
    }
    exports.renderExpressionValue = renderExpressionValue;
    function renderVariable(tree, variable, data, showChanged) {
        if (variable.available) {
            data.name.textContent = replaceWhitespace(variable.name);
            data.name.title = variable.type ? variable.type : variable.name;
            dom.toggleClass(data.name, 'virtual', !!variable.presentationHint && variable.presentationHint.kind === 'virtual');
        }
        if (variable.value) {
            data.name.textContent += variable.name ? ':' : '';
            renderExpressionValue(variable, data.value, {
                showChanged: showChanged,
                maxValueLength: exports.MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
                preserveWhitespace: false,
                showHover: true,
                colorize: true
            });
        }
        else {
            data.value.textContent = '';
            data.value.title = '';
        }
    }
    exports.renderVariable = renderVariable;
    function renderRenameBox(debugService, contextViewService, themeService, tree, element, container, options) {
        var inputBoxContainer = dom.append(container, $('.inputBoxContainer'));
        var inputBox = new inputBox_1.InputBox(inputBoxContainer, contextViewService, {
            validationOptions: options.validationOptions,
            placeholder: options.placeholder,
            ariaLabel: options.ariaLabel
        });
        var styler = styler_1.attachInputBoxStyler(inputBox, themeService);
        inputBox.value = options.initialValue ? options.initialValue : '';
        inputBox.focus();
        inputBox.select();
        var disposed = false;
        var toDispose = [inputBox, styler];
        var wrapUp = functional_1.once(function (renamed) {
            if (!disposed) {
                disposed = true;
                if (element instanceof debugModel_1.Expression && renamed && inputBox.value) {
                    debugService.renameWatchExpression(element.getId(), inputBox.value);
                    debugService.getViewModel().setSelectedExpression(undefined);
                }
                else if (element instanceof debugModel_1.Expression && !element.name) {
                    debugService.removeWatchExpressions(element.getId());
                    debugService.getViewModel().setSelectedExpression(undefined);
                }
                else if (element instanceof debugModel_1.Variable) {
                    element.errorMessage = null;
                    if (renamed && element.value !== inputBox.value) {
                        element.setVariable(inputBox.value)
                            .done(function () {
                            tree.refresh(element, false);
                            // Need to force watch expressions to update since a variable change can have an effect on watches
                            debugService.focusStackFrame(debugService.getViewModel().focusedStackFrame);
                        }, errors_1.onUnexpectedError);
                    }
                }
                tree.DOMFocus();
                tree.setFocus(element);
                // need to remove the input box since this template will be reused.
                container.removeChild(inputBoxContainer);
                lifecycle_1.dispose(toDispose);
            }
        });
        toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', function (e) {
            var isEscape = e.equals(9 /* Escape */);
            var isEnter = e.equals(3 /* Enter */);
            if (isEscape || isEnter) {
                e.preventDefault();
                e.stopPropagation();
                wrapUp(isEnter);
            }
        }));
        toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', function () {
            wrapUp(true);
        }));
    }
    exports.renderRenameBox = renderRenameBox;
    var BaseDebugController = /** @class */ (function (_super) {
        __extends(BaseDebugController, _super);
        function BaseDebugController(actionProvider, menuId, options, debugService, contextMenuService, contextKeyService, menuService, configurationService) {
            var _this = _super.call(this, options, configurationService) || this;
            _this.actionProvider = actionProvider;
            _this.debugService = debugService;
            _this.contextMenuService = contextMenuService;
            _this.contributedContextMenu = menuService.createMenu(menuId, contextKeyService);
            return _this;
        }
        BaseDebugController.prototype.onContextMenu = function (tree, element, event, focusElement) {
            var _this = this;
            if (focusElement === void 0) { focusElement = true; }
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'input') {
                return false;
            }
            event.preventDefault();
            event.stopPropagation();
            if (focusElement) {
                tree.setFocus(element);
            }
            if (this.actionProvider.hasSecondaryActions(tree, element)) {
                var anchor_1 = { x: event.posx, y: event.posy };
                this.contextMenuService.showContextMenu({
                    getAnchor: function () { return anchor_1; },
                    getActions: function () { return _this.actionProvider.getSecondaryActions(tree, element).then(function (actions) {
                        menuItemActionItem_1.fillInActions(_this.contributedContextMenu, { arg: _this.getContext(element) }, actions, _this.contextMenuService);
                        return actions;
                    }); },
                    onHide: function (wasCancelled) {
                        if (wasCancelled) {
                            tree.DOMFocus();
                        }
                    },
                    getActionsContext: function () { return element; }
                });
                return true;
            }
            return false;
        };
        BaseDebugController.prototype.getContext = function (element) {
            return undefined;
        };
        BaseDebugController = __decorate([
            __param(3, debug_1.IDebugService),
            __param(4, contextView_1.IContextMenuService),
            __param(5, contextkey_1.IContextKeyService),
            __param(6, actions_1.IMenuService),
            __param(7, configuration_1.IConfigurationService)
        ], BaseDebugController);
        return BaseDebugController;
    }(listService_1.WorkbenchTreeController));
    exports.BaseDebugController = BaseDebugController;
});
