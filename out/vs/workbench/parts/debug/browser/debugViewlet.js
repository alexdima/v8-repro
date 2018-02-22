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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/browser/dom", "vs/base/common/winjs.base", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/browser/debugActions", "vs/workbench/parts/debug/browser/debugActionItems", "vs/platform/instantiation/common/instantiation", "vs/platform/extensions/common/extensions", "vs/platform/progress/common/progress", "vs/platform/workspace/common/workspace", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/css!./media/debugViewlet"], function (require, exports, nls, actions_1, DOM, winjs_base_1, viewsViewlet_1, debug_1, debugActions_1, debugActionItems_1, instantiation_1, extensions_1, progress_1, workspace_1, telemetry_1, storage_1, themeService_1, viewlet_1, views_1, contextkey_1, contextView_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DebugViewlet = /** @class */ (function (_super) {
        __extends(DebugViewlet, _super);
        function DebugViewlet(telemetryService, progressService, debugService, instantiationService, contextService, storageService, themeService, contextKeyService, contextMenuService, extensionService) {
            var _this = _super.call(this, debug_1.VIEWLET_ID, views_1.ViewLocation.Debug, debug_1.VIEWLET_ID + ".state", false, telemetryService, storageService, instantiationService, themeService, contextService, contextKeyService, contextMenuService, extensionService) || this;
            _this.progressService = progressService;
            _this.debugService = debugService;
            _this.panelListeners = new Map();
            _this.progressRunner = null;
            _this._register(_this.debugService.onDidChangeState(function (state) { return _this.onDebugServiceStateChange(state); }));
            _this._register(_this.contextService.onDidChangeWorkbenchState(function () { return _this.updateTitleArea(); }));
            return _this;
        }
        DebugViewlet.prototype.create = function (parent) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var el;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, _super.prototype.create.call(this, parent)];
                        case 1:
                            _a.sent();
                            el = parent.getHTMLElement();
                            DOM.addClass(el, 'debug-viewlet');
                            return [2 /*return*/];
                    }
                });
            });
        };
        DebugViewlet.prototype.focus = function () {
            _super.prototype.focus.call(this);
            if (this.startDebugActionItem) {
                this.startDebugActionItem.focus();
            }
        };
        DebugViewlet.prototype.getActions = function () {
            var actions = [];
            actions.push(this.instantiationService.createInstance(debugActions_1.StartAction, debugActions_1.StartAction.ID, debugActions_1.StartAction.LABEL));
            actions.push(this.instantiationService.createInstance(debugActions_1.ConfigureAction, debugActions_1.ConfigureAction.ID, debugActions_1.ConfigureAction.LABEL));
            actions.push(this._register(this.instantiationService.createInstance(debugActions_1.ToggleReplAction, debugActions_1.ToggleReplAction.ID, debugActions_1.ToggleReplAction.LABEL)));
            return actions;
        };
        DebugViewlet.prototype.getSecondaryActions = function () {
            return [];
        };
        DebugViewlet.prototype.getActionItem = function (action) {
            if (action.id === debugActions_1.StartAction.ID) {
                this.startDebugActionItem = this.instantiationService.createInstance(debugActionItems_1.StartDebugActionItem, null, action);
                return this.startDebugActionItem;
            }
            return null;
        };
        DebugViewlet.prototype.focusView = function (id) {
            var view = this.getView(id);
            if (view) {
                view.focus();
            }
        };
        DebugViewlet.prototype.onDebugServiceStateChange = function (state) {
            if (this.progressRunner) {
                this.progressRunner.done();
            }
            if (state === debug_1.State.Initializing) {
                this.progressRunner = this.progressService.show(true);
            }
            else {
                this.progressRunner = null;
            }
        };
        DebugViewlet.prototype.addPanel = function (panel, size, index) {
            var _this = this;
            _super.prototype.addPanel.call(this, panel, size, index);
            // attach event listener to
            if (panel.id === debug_1.BREAKPOINTS_VIEW_ID) {
                this.breakpointView = panel;
                this.updateBreakpointsMaxSize();
            }
            else {
                this.panelListeners.set(panel.id, panel.onDidChange(function () { return _this.updateBreakpointsMaxSize(); }));
            }
        };
        DebugViewlet.prototype.removePanel = function (panel) {
            _super.prototype.removePanel.call(this, panel);
            lifecycle_1.dispose(this.panelListeners.get(panel.id));
            this.panelListeners.delete(panel.id);
        };
        DebugViewlet.prototype.updateBreakpointsMaxSize = function () {
            var _this = this;
            if (this.breakpointView) {
                // We need to update the breakpoints view since all other views are collapsed #25384
                var allOtherCollapsed = this.views.every(function (view) { return !view.isExpanded() || view === _this.breakpointView; });
                this.breakpointView.maximumBodySize = allOtherCollapsed ? Number.POSITIVE_INFINITY : this.breakpointView.minimumBodySize;
            }
        };
        DebugViewlet = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, progress_1.IProgressService),
            __param(2, debug_1.IDebugService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, workspace_1.IWorkspaceContextService),
            __param(5, storage_1.IStorageService),
            __param(6, themeService_1.IThemeService),
            __param(7, contextkey_1.IContextKeyService),
            __param(8, contextView_1.IContextMenuService),
            __param(9, extensions_1.IExtensionService)
        ], DebugViewlet);
        return DebugViewlet;
    }(viewsViewlet_1.PersistentViewsViewlet));
    exports.DebugViewlet = DebugViewlet;
    var FocusVariablesViewAction = /** @class */ (function (_super) {
        __extends(FocusVariablesViewAction, _super);
        function FocusVariablesViewAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusVariablesViewAction.prototype.run = function () {
            return this.viewletService.openViewlet(debug_1.VIEWLET_ID).then(function (viewlet) {
                viewlet.focusView(debug_1.VARIABLES_VIEW_ID);
            });
        };
        FocusVariablesViewAction.ID = 'workbench.debug.action.focusVariablesView';
        FocusVariablesViewAction.LABEL = nls.localize('debugFocusVariablesView', 'Focus Variables');
        FocusVariablesViewAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], FocusVariablesViewAction);
        return FocusVariablesViewAction;
    }(actions_1.Action));
    exports.FocusVariablesViewAction = FocusVariablesViewAction;
    var FocusWatchViewAction = /** @class */ (function (_super) {
        __extends(FocusWatchViewAction, _super);
        function FocusWatchViewAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusWatchViewAction.prototype.run = function () {
            return this.viewletService.openViewlet(debug_1.VIEWLET_ID).then(function (viewlet) {
                viewlet.focusView(debug_1.WATCH_VIEW_ID);
            });
        };
        FocusWatchViewAction.ID = 'workbench.debug.action.focusWatchView';
        FocusWatchViewAction.LABEL = nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'debugFocusWatchView' }, 'Focus Watch');
        FocusWatchViewAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], FocusWatchViewAction);
        return FocusWatchViewAction;
    }(actions_1.Action));
    exports.FocusWatchViewAction = FocusWatchViewAction;
    var FocusCallStackViewAction = /** @class */ (function (_super) {
        __extends(FocusCallStackViewAction, _super);
        function FocusCallStackViewAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusCallStackViewAction.prototype.run = function () {
            return this.viewletService.openViewlet(debug_1.VIEWLET_ID).then(function (viewlet) {
                viewlet.focusView(debug_1.CALLSTACK_VIEW_ID);
            });
        };
        FocusCallStackViewAction.ID = 'workbench.debug.action.focusCallStackView';
        FocusCallStackViewAction.LABEL = nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'debugFocusCallStackView' }, 'Focus CallStack');
        FocusCallStackViewAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], FocusCallStackViewAction);
        return FocusCallStackViewAction;
    }(actions_1.Action));
    exports.FocusCallStackViewAction = FocusCallStackViewAction;
    var FocusBreakpointsViewAction = /** @class */ (function (_super) {
        __extends(FocusBreakpointsViewAction, _super);
        function FocusBreakpointsViewAction(id, label, viewletService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            return _this;
        }
        FocusBreakpointsViewAction.prototype.run = function () {
            return this.viewletService.openViewlet(debug_1.VIEWLET_ID).then(function (viewlet) {
                viewlet.focusView(debug_1.BREAKPOINTS_VIEW_ID);
            });
        };
        FocusBreakpointsViewAction.ID = 'workbench.debug.action.focusBreakpointsView';
        FocusBreakpointsViewAction.LABEL = nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'debugFocusBreakpointsView' }, 'Focus Breakpoints');
        FocusBreakpointsViewAction = __decorate([
            __param(2, viewlet_1.IViewletService)
        ], FocusBreakpointsViewAction);
        return FocusBreakpointsViewAction;
    }(actions_1.Action));
    exports.FocusBreakpointsViewAction = FocusBreakpointsViewAction;
});
