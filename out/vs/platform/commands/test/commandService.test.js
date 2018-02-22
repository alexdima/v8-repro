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
define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/platform/commands/common/commands", "vs/platform/commands/common/commandService", "vs/platform/instantiation/common/instantiationService", "vs/base/common/event", "vs/platform/log/common/log"], function (require, exports, assert, winjs_base_1, commands_1, commandService_1, instantiationService_1, event_1, log_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SimpleExtensionService = /** @class */ (function () {
        function SimpleExtensionService() {
            this._onDidRegisterExtensions = new event_1.Emitter();
            this.onDidChangeExtensionsStatus = null;
        }
        Object.defineProperty(SimpleExtensionService.prototype, "onDidRegisterExtensions", {
            get: function () {
                return this._onDidRegisterExtensions.event;
            },
            enumerable: true,
            configurable: true
        });
        SimpleExtensionService.prototype.activateByEvent = function (activationEvent) {
            return this.whenInstalledExtensionsRegistered().then(function () { });
        };
        SimpleExtensionService.prototype.whenInstalledExtensionsRegistered = function () {
            return winjs_base_1.TPromise.as(true);
        };
        SimpleExtensionService.prototype.readExtensionPointContributions = function (extPoint) {
            return winjs_base_1.TPromise.as([]);
        };
        SimpleExtensionService.prototype.getExtensionsStatus = function () {
            return undefined;
        };
        SimpleExtensionService.prototype.getExtensions = function () {
            return winjs_base_1.TPromise.wrap([]);
        };
        SimpleExtensionService.prototype.canProfileExtensionHost = function () {
            return false;
        };
        SimpleExtensionService.prototype.startExtensionHostProfile = function () {
            throw new Error('Not implemented');
        };
        SimpleExtensionService.prototype.restartExtensionHost = function () {
        };
        SimpleExtensionService.prototype.startExtensionHost = function () {
        };
        SimpleExtensionService.prototype.stopExtensionHost = function () {
        };
        return SimpleExtensionService;
    }());
    suite('CommandService', function () {
        var commandRegistration;
        setup(function () {
            commandRegistration = commands_1.CommandsRegistry.registerCommand('foo', function () { });
        });
        teardown(function () {
            commandRegistration.dispose();
        });
        test('activateOnCommand', function () {
            var lastEvent;
            var service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), new /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_1.prototype.activateByEvent = function (activationEvent) {
                    lastEvent = activationEvent;
                    return _super.prototype.activateByEvent.call(this, activationEvent);
                };
                return class_1;
            }(SimpleExtensionService)), new log_1.NullLogService());
            return service.executeCommand('foo').then(function () {
                assert.ok(lastEvent, 'onCommand:foo');
                return service.executeCommand('unknownCommandId');
            }).then(function () {
                assert.ok(false);
            }, function () {
                assert.ok(lastEvent, 'onCommand:unknownCommandId');
            });
        });
        test('fwd activation error', function () {
            var service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), new /** @class */ (function (_super) {
                __extends(class_2, _super);
                function class_2() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_2.prototype.activateByEvent = function (activationEvent) {
                    return winjs_base_1.TPromise.wrapError(new Error('bad_activate'));
                };
                return class_2;
            }(SimpleExtensionService)), new log_1.NullLogService());
            return service.executeCommand('foo').then(function () { return assert.ok(false); }, function (err) {
                assert.equal(err.message, 'bad_activate');
            });
        });
        test('!onReady, but executeCommand', function () {
            var callCounter = 0;
            var reg = commands_1.CommandsRegistry.registerCommand('bar', function () { return callCounter += 1; });
            var service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), new /** @class */ (function (_super) {
                __extends(class_3, _super);
                function class_3() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_3.prototype.whenInstalledExtensionsRegistered = function () {
                    return new winjs_base_1.TPromise(function (_resolve) { });
                };
                return class_3;
            }(SimpleExtensionService)), new log_1.NullLogService());
            service.executeCommand('bar');
            assert.equal(callCounter, 1);
            reg.dispose();
        });
        test('issue #34913: !onReady, unknown command', function () {
            var callCounter = 0;
            var resolveFunc;
            var whenInstalledExtensionsRegistered = new winjs_base_1.TPromise(function (_resolve) { resolveFunc = _resolve; });
            var service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), new /** @class */ (function (_super) {
                __extends(class_4, _super);
                function class_4() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_4.prototype.whenInstalledExtensionsRegistered = function () {
                    return whenInstalledExtensionsRegistered;
                };
                return class_4;
            }(SimpleExtensionService)), new log_1.NullLogService());
            var r = service.executeCommand('bar');
            assert.equal(callCounter, 0);
            var reg = commands_1.CommandsRegistry.registerCommand('bar', function () { return callCounter += 1; });
            resolveFunc(true);
            return r.then(function () {
                reg.dispose();
                assert.equal(callCounter, 1);
            });
        });
    });
});
