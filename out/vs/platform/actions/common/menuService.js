/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/actions/common/menu", "vs/platform/extensions/common/extensions", "vs/platform/commands/common/commands"], function (require, exports, menu_1, extensions_1, commands_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MenuService = /** @class */ (function () {
        function MenuService(_extensionService, _commandService) {
            this._extensionService = _extensionService;
            this._commandService = _commandService;
            //
        }
        MenuService.prototype.createMenu = function (id, contextKeyService) {
            return new menu_1.Menu(id, this._extensionService.whenInstalledExtensionsRegistered(), this._commandService, contextKeyService);
        };
        MenuService = __decorate([
            __param(0, extensions_1.IExtensionService),
            __param(1, commands_1.ICommandService)
        ], MenuService);
        return MenuService;
    }());
    exports.MenuService = MenuService;
});
