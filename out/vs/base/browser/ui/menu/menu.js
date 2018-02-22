/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/builder", "vs/base/browser/ui/actionbar/actionbar", "vs/css!./menu"], function (require, exports, builder_1, actionbar_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Menu = /** @class */ (function () {
        function Menu(container, actions, options) {
            if (options === void 0) { options = {}; }
            builder_1.$(container).addClass('monaco-menu-container');
            var $menu = builder_1.$('.monaco-menu').appendTo(container);
            this.actionBar = new actionbar_1.ActionBar($menu, {
                orientation: actionbar_1.ActionsOrientation.VERTICAL,
                actionItemProvider: options.actionItemProvider,
                context: options.context,
                actionRunner: options.actionRunner,
                isMenu: true
            });
            this.actionBar.push(actions, { icon: true, label: true });
        }
        Object.defineProperty(Menu.prototype, "onDidCancel", {
            get: function () {
                return this.actionBar.onDidCancel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Menu.prototype, "onDidBlur", {
            get: function () {
                return this.actionBar.onDidBlur;
            },
            enumerable: true,
            configurable: true
        });
        Menu.prototype.focus = function () {
            this.actionBar.focus(true);
        };
        Menu.prototype.dispose = function () {
            if (this.actionBar) {
                this.actionBar.dispose();
                this.actionBar = null;
            }
            if (this.listener) {
                this.listener.dispose();
                this.listener = null;
            }
        };
        return Menu;
    }());
    exports.Menu = Menu;
});
