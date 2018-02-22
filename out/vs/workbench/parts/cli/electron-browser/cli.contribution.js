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
define(["require", "exports", "vs/nls", "path", "child_process", "vs/base/node/pfs", "vs/base/common/platform", "vs/base/common/async", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/base/common/actions", "vs/workbench/common/actions", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/message/common/message", "vs/platform/node/product"], function (require, exports, nls, path, cp, pfs, platform, async_1, winjs_base_1, uri_1, actions_1, actions_2, platform_1, actions_3, message_1, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ignore(code, value) {
        if (value === void 0) { value = null; }
        return function (err) { return err.code === code ? winjs_base_1.TPromise.as(value) : winjs_base_1.TPromise.wrapError(err); };
    }
    var _source = null;
    function getSource() {
        if (!_source) {
            var root = uri_1.default.parse(require.toUrl('')).fsPath;
            _source = path.resolve(root, '..', 'bin', 'code');
        }
        return _source;
    }
    function isAvailable() {
        return pfs.exists(getSource());
    }
    var InstallAction = /** @class */ (function (_super) {
        __extends(InstallAction, _super);
        function InstallAction(id, label, messageService) {
            var _this = _super.call(this, id, label) || this;
            _this.messageService = messageService;
            return _this;
        }
        Object.defineProperty(InstallAction.prototype, "target", {
            get: function () {
                return "/usr/local/bin/" + product_1.default.applicationName;
            },
            enumerable: true,
            configurable: true
        });
        InstallAction.prototype.run = function () {
            var _this = this;
            return isAvailable().then(function (isAvailable) {
                if (!isAvailable) {
                    var message = nls.localize('not available', "This command is not available");
                    _this.messageService.show(message_1.Severity.Info, message);
                    return undefined;
                }
                return _this.isInstalled()
                    .then(function (isInstalled) {
                    if (!isAvailable || isInstalled) {
                        return winjs_base_1.TPromise.as(null);
                    }
                    else {
                        var createSymlink_1 = function () {
                            return pfs.unlink(_this.target)
                                .then(null, ignore('ENOENT'))
                                .then(function () { return pfs.symlink(getSource(), _this.target); });
                        };
                        return createSymlink_1().then(null, function (err) {
                            if (err.code === 'EACCES' || err.code === 'ENOENT') {
                                return _this.createBinFolder()
                                    .then(function () { return createSymlink_1(); });
                            }
                            return winjs_base_1.TPromise.wrapError(err);
                        });
                    }
                })
                    .then(function () {
                    _this.messageService.show(message_1.Severity.Info, nls.localize('successIn', "Shell command '{0}' successfully installed in PATH.", product_1.default.applicationName));
                });
            });
        };
        InstallAction.prototype.isInstalled = function () {
            var _this = this;
            return pfs.lstat(this.target)
                .then(function (stat) { return stat.isSymbolicLink(); })
                .then(function () { return pfs.readlink(_this.target); })
                .then(function (link) { return link === getSource(); })
                .then(null, ignore('ENOENT', false));
        };
        InstallAction.prototype.createBinFolder = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (c, e) {
                var message = nls.localize('warnEscalation', "Code will now prompt with 'osascript' for Administrator privileges to install the shell command.");
                var actions = [
                    new actions_1.Action('ok', nls.localize('ok', "OK"), '', true, function () {
                        var command = 'osascript -e "do shell script \\"mkdir -p /usr/local/bin && chown \\" & (do shell script (\\"whoami\\")) & \\" /usr/local/bin\\" with administrator privileges"';
                        async_1.nfcall(cp.exec, command, {})
                            .then(null, function (_) { return winjs_base_1.TPromise.wrapError(new Error(nls.localize('cantCreateBinFolder', "Unable to create '/usr/local/bin'."))); })
                            .done(c, e);
                        return null;
                    }),
                    new actions_1.Action('cancel2', nls.localize('cancel2', "Cancel"), '', true, function () { e(new Error(nls.localize('aborted', "Aborted"))); return null; })
                ];
                _this.messageService.show(message_1.Severity.Info, { message: message, actions: actions });
            });
        };
        InstallAction.ID = 'workbench.action.installCommandLine';
        InstallAction.LABEL = nls.localize('install', "Install '{0}' command in PATH", product_1.default.applicationName);
        InstallAction = __decorate([
            __param(2, message_1.IMessageService)
        ], InstallAction);
        return InstallAction;
    }(actions_1.Action));
    var UninstallAction = /** @class */ (function (_super) {
        __extends(UninstallAction, _super);
        function UninstallAction(id, label, messageService) {
            var _this = _super.call(this, id, label) || this;
            _this.messageService = messageService;
            return _this;
        }
        Object.defineProperty(UninstallAction.prototype, "target", {
            get: function () {
                return "/usr/local/bin/" + product_1.default.applicationName;
            },
            enumerable: true,
            configurable: true
        });
        UninstallAction.prototype.run = function () {
            var _this = this;
            return isAvailable().then(function (isAvailable) {
                if (!isAvailable) {
                    var message = nls.localize('not available', "This command is not available");
                    _this.messageService.show(message_1.Severity.Info, message);
                    return undefined;
                }
                return pfs.unlink(_this.target)
                    .then(null, ignore('ENOENT'))
                    .then(function () {
                    _this.messageService.show(message_1.Severity.Info, nls.localize('successFrom', "Shell command '{0}' successfully uninstalled from PATH.", product_1.default.applicationName));
                });
            });
        };
        UninstallAction.ID = 'workbench.action.uninstallCommandLine';
        UninstallAction.LABEL = nls.localize('uninstall', "Uninstall '{0}' command from PATH", product_1.default.applicationName);
        UninstallAction = __decorate([
            __param(2, message_1.IMessageService)
        ], UninstallAction);
        return UninstallAction;
    }(actions_1.Action));
    if (platform.isMacintosh) {
        var category = nls.localize('shellCommand', "Shell Command");
        var workbenchActionsRegistry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(InstallAction, InstallAction.ID, InstallAction.LABEL), 'Shell Command: Install \'code\' command in PATH', category);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(UninstallAction, UninstallAction.ID, UninstallAction.LABEL), 'Shell Command: Uninstall \'code\' command from PATH', category);
    }
});
