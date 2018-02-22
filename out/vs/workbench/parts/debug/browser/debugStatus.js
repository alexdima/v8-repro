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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/quickOpen/common/quickOpen", "vs/platform/theme/common/themeService", "vs/workbench/parts/debug/common/debug", "vs/workbench/common/theme", "vs/platform/configuration/common/configuration"], function (require, exports, nls, dom, errors, lifecycle_1, quickOpen_1, themeService_1, debug_1, theme_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var DebugStatus = /** @class */ (function (_super) {
        __extends(DebugStatus, _super);
        function DebugStatus(quickOpenService, debugService, themeService, configurationService) {
            var _this = _super.call(this, themeService) || this;
            _this.quickOpenService = quickOpenService;
            _this.debugService = debugService;
            _this.toDispose = [];
            _this.toDispose.push(_this.debugService.getConfigurationManager().onDidSelectConfiguration(function (e) {
                _this.setLabel();
            }));
            _this.toDispose.push(_this.debugService.onDidChangeState(function (state) {
                if (state !== debug_1.State.Inactive && _this.showInStatusBar === 'onFirstSessionStart') {
                    _this.doRender();
                }
            }));
            _this.showInStatusBar = configurationService.getValue('debug').showInStatusBar;
            _this.toDispose.push(configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration('debug.showInStatusBar')) {
                    _this.showInStatusBar = configurationService.getValue('debug').showInStatusBar;
                    if (_this.showInStatusBar === 'never' && _this.statusBarItem) {
                        _this.statusBarItem.hidden = true;
                    }
                    else {
                        if (_this.statusBarItem) {
                            _this.statusBarItem.hidden = false;
                        }
                        if (_this.showInStatusBar === 'always') {
                            _this.doRender();
                        }
                    }
                }
            }));
            return _this;
        }
        DebugStatus.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            if (this.icon) {
                this.icon.style.backgroundColor = this.getColor(theme_1.STATUS_BAR_FOREGROUND);
            }
        };
        DebugStatus.prototype.render = function (container) {
            this.container = container;
            if (this.showInStatusBar === 'always') {
                this.doRender();
            }
            // noop, we render when we decide is best
            return this;
        };
        DebugStatus.prototype.doRender = function () {
            var _this = this;
            if (!this.statusBarItem && this.container) {
                this.statusBarItem = dom.append(this.container, $('.debug-statusbar-item'));
                this.toDispose.push(dom.addDisposableListener(this.statusBarItem, 'click', function () {
                    _this.quickOpenService.show('debug ').done(undefined, errors.onUnexpectedError);
                }));
                this.statusBarItem.title = nls.localize('selectAndStartDebug', "Select and start debug configuration");
                var a = dom.append(this.statusBarItem, $('a'));
                this.icon = dom.append(a, $('.icon'));
                this.label = dom.append(a, $('span.label'));
                this.setLabel();
                this.updateStyles();
            }
        };
        DebugStatus.prototype.setLabel = function () {
            if (this.label && this.statusBarItem) {
                var manager = this.debugService.getConfigurationManager();
                var name_1 = manager.selectedConfiguration.name;
                if (name_1) {
                    this.statusBarItem.style.display = 'block';
                    this.label.textContent = manager.getLaunches().length > 1 ? name_1 + " (" + manager.selectedConfiguration.launch.name + ")" : name_1;
                }
                else {
                    this.statusBarItem.style.display = 'none';
                }
            }
        };
        DebugStatus.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        DebugStatus = __decorate([
            __param(0, quickOpen_1.IQuickOpenService),
            __param(1, debug_1.IDebugService),
            __param(2, themeService_1.IThemeService),
            __param(3, configuration_1.IConfigurationService)
        ], DebugStatus);
        return DebugStatus;
    }(theme_1.Themable));
    exports.DebugStatus = DebugStatus;
});
