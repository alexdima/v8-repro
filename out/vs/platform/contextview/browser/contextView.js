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
define(["require", "exports", "vs/base/common/actions", "vs/platform/instantiation/common/instantiation"], function (require, exports, actions_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IContextViewService = instantiation_1.createDecorator('contextViewService');
    exports.IContextMenuService = instantiation_1.createDecorator('contextMenuService');
    var ContextSubMenu = /** @class */ (function (_super) {
        __extends(ContextSubMenu, _super);
        function ContextSubMenu(label, entries) {
            var _this = _super.call(this, 'contextsubmenu', label, '', true) || this;
            _this.entries = entries;
            return _this;
        }
        return ContextSubMenu;
    }(actions_1.Action));
    exports.ContextSubMenu = ContextSubMenu;
});
