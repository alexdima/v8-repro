/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/builder", "vs/base/common/lifecycle", "vs/base/browser/mouseEvent", "vs/base/common/actions", "vs/base/browser/ui/menu/menu", "vs/base/common/severity", "vs/css!./contextMenuHandler"], function (require, exports, builder_1, lifecycle_1, mouseEvent_1, actions_1, menu_1, severity_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContextMenuHandler = /** @class */ (function () {
        function ContextMenuHandler(element, contextViewService, telemetryService, messageService) {
            var _this = this;
            this.setContainer(element);
            this.contextViewService = contextViewService;
            this.telemetryService = telemetryService;
            this.messageService = messageService;
            this.actionRunner = new actions_1.ActionRunner();
            this.menuContainerElement = null;
            this.toDispose = [];
            var hideViewOnRun = false;
            this.toDispose.push(this.actionRunner.onDidBeforeRun(function (e) {
                if (_this.telemetryService) {
                    /* __GDPR__
                        "workbenchActionExecuted" : {
                            "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                        }
                    */
                    _this.telemetryService.publicLog('workbenchActionExecuted', { id: e.action.id, from: 'contextMenu' });
                }
                hideViewOnRun = !!e.retainActionItem;
                if (!hideViewOnRun) {
                    _this.contextViewService.hideContextView(false);
                }
            }));
            this.toDispose.push(this.actionRunner.onDidRun(function (e) {
                if (hideViewOnRun) {
                    _this.contextViewService.hideContextView(false);
                }
                hideViewOnRun = false;
                if (e.error && _this.messageService) {
                    _this.messageService.show(severity_1.default.Error, e.error);
                }
            }));
        }
        ContextMenuHandler.prototype.setContainer = function (container) {
            var _this = this;
            if (this.$el) {
                this.$el.off(['click', 'mousedown']);
                this.$el = null;
            }
            if (container) {
                this.$el = builder_1.$(container);
                this.$el.on('mousedown', function (e) { return _this.onMouseDown(e); });
            }
        };
        ContextMenuHandler.prototype.showContextMenu = function (delegate) {
            var _this = this;
            delegate.getActions().done(function (actions) {
                _this.contextViewService.showContextView({
                    getAnchor: function () { return delegate.getAnchor(); },
                    canRelayout: false,
                    render: function (container) {
                        _this.menuContainerElement = container;
                        var className = delegate.getMenuClassName ? delegate.getMenuClassName() : '';
                        if (className) {
                            container.className += ' ' + className;
                        }
                        var menu = new menu_1.Menu(container, actions, {
                            actionItemProvider: delegate.getActionItem,
                            context: delegate.getActionsContext ? delegate.getActionsContext() : null,
                            actionRunner: _this.actionRunner
                        });
                        var listener1 = menu.onDidCancel(function () {
                            _this.contextViewService.hideContextView(true);
                        });
                        var listener2 = menu.onDidBlur(function () {
                            _this.contextViewService.hideContextView(true);
                        });
                        menu.focus();
                        return lifecycle_1.combinedDisposable([listener1, listener2, menu]);
                    },
                    onHide: function (didCancel) {
                        if (delegate.onHide) {
                            delegate.onHide(didCancel);
                        }
                        _this.menuContainerElement = null;
                    }
                });
            });
        };
        ContextMenuHandler.prototype.onMouseDown = function (e) {
            if (!this.menuContainerElement) {
                return;
            }
            var event = new mouseEvent_1.StandardMouseEvent(e);
            var element = event.target;
            while (element) {
                if (element === this.menuContainerElement) {
                    return;
                }
                element = element.parentElement;
            }
            this.contextViewService.hideContextView();
        };
        ContextMenuHandler.prototype.dispose = function () {
            this.setContainer(null);
        };
        return ContextMenuHandler;
    }());
    exports.ContextMenuHandler = ContextMenuHandler;
});
