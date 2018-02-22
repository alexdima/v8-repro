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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/actions", "vs/platform/quickOpen/common/quickOpen", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands"], function (require, exports, winjs_base_1, nls, actions_1, quickOpen_1, keybinding_1, contextkey_1, commands_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.inQuickOpenContext = contextkey_1.ContextKeyExpr.has('inQuickOpen');
    exports.defaultQuickOpenContextKey = 'inFilesPicker';
    exports.defaultQuickOpenContext = contextkey_1.ContextKeyExpr.and(exports.inQuickOpenContext, contextkey_1.ContextKeyExpr.has(exports.defaultQuickOpenContextKey));
    exports.QUICKOPEN_ACTION_ID = 'workbench.action.quickOpen';
    exports.QUICKOPEN_ACION_LABEL = nls.localize('quickOpen', "Go to File...");
    commands_1.CommandsRegistry.registerCommand(exports.QUICKOPEN_ACTION_ID, function (accessor, prefix) {
        if (prefix === void 0) { prefix = null; }
        var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
        return quickOpenService.show(typeof prefix === 'string' ? prefix : null).then(function () {
            return void 0;
        });
    });
    exports.QUICKOPEN_FOCUS_SECONDARY_ACTION_ID = 'workbench.action.quickOpenPreviousEditor';
    commands_1.CommandsRegistry.registerCommand(exports.QUICKOPEN_FOCUS_SECONDARY_ACTION_ID, function (accessor, prefix) {
        if (prefix === void 0) { prefix = null; }
        var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
        return quickOpenService.show(null, { autoFocus: { autoFocusSecondEntry: true } }).then(function () {
            return void 0;
        });
    });
    var BaseQuickOpenNavigateAction = /** @class */ (function (_super) {
        __extends(BaseQuickOpenNavigateAction, _super);
        function BaseQuickOpenNavigateAction(id, label, next, quickNavigate, quickOpenService, keybindingService) {
            var _this = _super.call(this, id, label) || this;
            _this.next = next;
            _this.quickNavigate = quickNavigate;
            _this.quickOpenService = quickOpenService;
            _this.keybindingService = keybindingService;
            return _this;
        }
        BaseQuickOpenNavigateAction.prototype.run = function (event) {
            var keys = this.keybindingService.lookupKeybindings(this.id);
            var quickNavigate = this.quickNavigate ? { keybindings: keys } : void 0;
            this.quickOpenService.navigate(this.next, quickNavigate);
            return winjs_base_1.TPromise.as(true);
        };
        BaseQuickOpenNavigateAction = __decorate([
            __param(4, quickOpen_1.IQuickOpenService),
            __param(5, keybinding_1.IKeybindingService)
        ], BaseQuickOpenNavigateAction);
        return BaseQuickOpenNavigateAction;
    }(actions_1.Action));
    exports.BaseQuickOpenNavigateAction = BaseQuickOpenNavigateAction;
    function getQuickNavigateHandler(id, next) {
        return function (accessor) {
            var keybindingService = accessor.get(keybinding_1.IKeybindingService);
            var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
            var keys = keybindingService.lookupKeybindings(id);
            var quickNavigate = { keybindings: keys };
            quickOpenService.navigate(next, quickNavigate);
        };
    }
    exports.getQuickNavigateHandler = getQuickNavigateHandler;
    var QuickOpenNavigateNextAction = /** @class */ (function (_super) {
        __extends(QuickOpenNavigateNextAction, _super);
        function QuickOpenNavigateNextAction(id, label, quickOpenService, keybindingService) {
            return _super.call(this, id, label, true, true, quickOpenService, keybindingService) || this;
        }
        QuickOpenNavigateNextAction.ID = 'workbench.action.quickOpenNavigateNext';
        QuickOpenNavigateNextAction.LABEL = nls.localize('quickNavigateNext', "Navigate Next in Quick Open");
        QuickOpenNavigateNextAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, keybinding_1.IKeybindingService)
        ], QuickOpenNavigateNextAction);
        return QuickOpenNavigateNextAction;
    }(BaseQuickOpenNavigateAction));
    exports.QuickOpenNavigateNextAction = QuickOpenNavigateNextAction;
    var QuickOpenNavigatePreviousAction = /** @class */ (function (_super) {
        __extends(QuickOpenNavigatePreviousAction, _super);
        function QuickOpenNavigatePreviousAction(id, label, quickOpenService, keybindingService) {
            return _super.call(this, id, label, false, true, quickOpenService, keybindingService) || this;
        }
        QuickOpenNavigatePreviousAction.ID = 'workbench.action.quickOpenNavigatePrevious';
        QuickOpenNavigatePreviousAction.LABEL = nls.localize('quickNavigatePrevious', "Navigate Previous in Quick Open");
        QuickOpenNavigatePreviousAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, keybinding_1.IKeybindingService)
        ], QuickOpenNavigatePreviousAction);
        return QuickOpenNavigatePreviousAction;
    }(BaseQuickOpenNavigateAction));
    exports.QuickOpenNavigatePreviousAction = QuickOpenNavigatePreviousAction;
    var QuickOpenSelectNextAction = /** @class */ (function (_super) {
        __extends(QuickOpenSelectNextAction, _super);
        function QuickOpenSelectNextAction(id, label, quickOpenService, keybindingService) {
            return _super.call(this, id, label, true, false, quickOpenService, keybindingService) || this;
        }
        QuickOpenSelectNextAction.ID = 'workbench.action.quickOpenSelectNext';
        QuickOpenSelectNextAction.LABEL = nls.localize('quickSelectNext', "Select Next in Quick Open");
        QuickOpenSelectNextAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, keybinding_1.IKeybindingService)
        ], QuickOpenSelectNextAction);
        return QuickOpenSelectNextAction;
    }(BaseQuickOpenNavigateAction));
    exports.QuickOpenSelectNextAction = QuickOpenSelectNextAction;
    var QuickOpenSelectPreviousAction = /** @class */ (function (_super) {
        __extends(QuickOpenSelectPreviousAction, _super);
        function QuickOpenSelectPreviousAction(id, label, quickOpenService, keybindingService) {
            return _super.call(this, id, label, false, false, quickOpenService, keybindingService) || this;
        }
        QuickOpenSelectPreviousAction.ID = 'workbench.action.quickOpenSelectPrevious';
        QuickOpenSelectPreviousAction.LABEL = nls.localize('quickSelectPrevious', "Select Previous in Quick Open");
        QuickOpenSelectPreviousAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, keybinding_1.IKeybindingService)
        ], QuickOpenSelectPreviousAction);
        return QuickOpenSelectPreviousAction;
    }(BaseQuickOpenNavigateAction));
    exports.QuickOpenSelectPreviousAction = QuickOpenSelectPreviousAction;
});
