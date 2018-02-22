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
define(["require", "exports", "assert", "vs/platform/actions/common/actions", "vs/platform/actions/common/menuService", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/base/common/winjs.base", "vs/base/common/event"], function (require, exports, assert, actions_1, menuService_1, lifecycle_1, commands_1, mockKeybindingService_1, winjs_base_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- service instances
    var MockExtensionService = /** @class */ (function () {
        function MockExtensionService() {
            this._onDidRegisterExtensions = new event_1.Emitter();
            this.onDidChangeExtensionsStatus = null;
        }
        Object.defineProperty(MockExtensionService.prototype, "onDidRegisterExtensions", {
            get: function () {
                return this._onDidRegisterExtensions.event;
            },
            enumerable: true,
            configurable: true
        });
        MockExtensionService.prototype.activateByEvent = function (activationEvent) {
            throw new Error('Not implemented');
        };
        MockExtensionService.prototype.whenInstalledExtensionsRegistered = function () {
            return winjs_base_1.TPromise.as(true);
        };
        MockExtensionService.prototype.getExtensions = function () {
            throw new Error('Not implemented');
        };
        MockExtensionService.prototype.readExtensionPointContributions = function (extPoint) {
            throw new Error('Not implemented');
        };
        MockExtensionService.prototype.getExtensionsStatus = function () {
            throw new Error('Not implemented');
        };
        MockExtensionService.prototype.canProfileExtensionHost = function () {
            return false;
        };
        MockExtensionService.prototype.startExtensionHostProfile = function () {
            throw new Error('Not implemented');
        };
        MockExtensionService.prototype.restartExtensionHost = function () {
            throw new Error('Method not implemented.');
        };
        MockExtensionService.prototype.startExtensionHost = function () {
            throw new Error('Method not implemented.');
        };
        MockExtensionService.prototype.stopExtensionHost = function () {
            throw new Error('Method not implemented.');
        };
        return MockExtensionService;
    }());
    var extensionService = new MockExtensionService();
    var contextKeyService = new /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.contextMatchesRules = function () {
            return true;
        };
        return class_1;
    }(mockKeybindingService_1.MockContextKeyService));
    // --- tests
    suite('MenuService', function () {
        var menuService;
        var disposables;
        var testMenuId;
        setup(function () {
            menuService = new menuService_1.MenuService(extensionService, commands_1.NullCommandService);
            testMenuId = new actions_1.MenuId();
            disposables = [];
        });
        teardown(function () {
            lifecycle_1.dispose(disposables);
        });
        test('group sorting', function () {
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'one', title: 'FOO' },
                group: '0_hello'
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'two', title: 'FOO' },
                group: 'hello'
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'three', title: 'FOO' },
                group: 'Hello'
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'four', title: 'FOO' },
                group: ''
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'five', title: 'FOO' },
                group: 'navigation'
            }));
            var groups = menuService.createMenu(testMenuId, contextKeyService).getActions();
            assert.equal(groups.length, 5);
            var one = groups[0], two = groups[1], three = groups[2], four = groups[3], five = groups[4];
            assert.equal(one[0], 'navigation');
            assert.equal(two[0], '0_hello');
            assert.equal(three[0], 'hello');
            assert.equal(four[0], 'Hello');
            assert.equal(five[0], '');
        });
        test('in group sorting, by title', function () {
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'a', title: 'aaa' },
                group: 'Hello'
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'b', title: 'fff' },
                group: 'Hello'
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'c', title: 'zzz' },
                group: 'Hello'
            }));
            var groups = menuService.createMenu(testMenuId, contextKeyService).getActions();
            assert.equal(groups.length, 1);
            var _a = groups[0], actions = _a[1];
            assert.equal(actions.length, 3);
            var one = actions[0], two = actions[1], three = actions[2];
            assert.equal(one.id, 'a');
            assert.equal(two.id, 'b');
            assert.equal(three.id, 'c');
        });
        test('in group sorting, by title and order', function () {
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'a', title: 'aaa' },
                group: 'Hello',
                order: 10
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'b', title: 'fff' },
                group: 'Hello'
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'c', title: 'zzz' },
                group: 'Hello',
                order: -1
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'd', title: 'yyy' },
                group: 'Hello',
                order: -1
            }));
            var groups = menuService.createMenu(testMenuId, contextKeyService).getActions();
            assert.equal(groups.length, 1);
            var _a = groups[0], actions = _a[1];
            assert.equal(actions.length, 4);
            var one = actions[0], two = actions[1], three = actions[2], four = actions[3];
            assert.equal(one.id, 'd');
            assert.equal(two.id, 'c');
            assert.equal(three.id, 'b');
            assert.equal(four.id, 'a');
        });
        test('in group sorting, special: navigation', function () {
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'a', title: 'aaa' },
                group: 'navigation',
                order: 1.3
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'b', title: 'fff' },
                group: 'navigation',
                order: 1.2
            }));
            disposables.push(actions_1.MenuRegistry.appendMenuItem(testMenuId, {
                command: { id: 'c', title: 'zzz' },
                group: 'navigation',
                order: 1.1
            }));
            var groups = menuService.createMenu(testMenuId, contextKeyService).getActions();
            assert.equal(groups.length, 1);
            var _a = groups[0], actions = _a[1];
            assert.equal(actions.length, 3);
            var one = actions[0], two = actions[1], three = actions[2];
            assert.equal(one.id, 'c');
            assert.equal(two.id, 'b');
            assert.equal(three.id, 'a');
        });
        test('special MenuId palette', function () {
            disposables.push(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
                command: { id: 'a', title: 'Explicit' }
            }));
            actions_1.MenuRegistry.addCommand({ id: 'b', title: 'Implicit' });
            var foundA = false;
            var foundB = false;
            for (var _i = 0, _a = actions_1.MenuRegistry.getMenuItems(actions_1.MenuId.CommandPalette); _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.command.id === 'a') {
                    assert.equal(item.command.title, 'Explicit');
                    foundA = true;
                }
                if (item.command.id === 'b') {
                    assert.equal(item.command.title, 'Implicit');
                    foundB = true;
                }
            }
            assert.equal(foundA, true);
            assert.equal(foundB, true);
        });
    });
});
