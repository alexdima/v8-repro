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
define(["require", "exports", "assert", "vs/platform/contextkey/browser/contextKeyService", "vs/editor/standalone/browser/simpleServices", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, assert, contextKeyService_1, simpleServices_1, instantiationService_1, serviceCollection_1, telemetryUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StandaloneKeybindingService', function () {
        var TestStandaloneKeybindingService = /** @class */ (function (_super) {
            __extends(TestStandaloneKeybindingService, _super);
            function TestStandaloneKeybindingService() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            TestStandaloneKeybindingService.prototype.testDispatch = function (e) {
                _super.prototype._dispatch.call(this, e, null);
            };
            return TestStandaloneKeybindingService;
        }(simpleServices_1.StandaloneKeybindingService));
        test('issue Microsoft/monaco-editor#167', function () {
            var serviceCollection = new serviceCollection_1.ServiceCollection();
            var instantiationService = new instantiationService_1.InstantiationService(serviceCollection, true);
            var configurationService = new simpleServices_1.SimpleConfigurationService();
            var contextKeyService = new contextKeyService_1.ContextKeyService(configurationService);
            var commandService = new simpleServices_1.StandaloneCommandService(instantiationService);
            var messageService = new simpleServices_1.SimpleMessageService();
            var domElement = document.createElement('div');
            var keybindingService = new TestStandaloneKeybindingService(contextKeyService, commandService, telemetryUtils_1.NullTelemetryService, messageService, domElement);
            var commandInvoked = false;
            keybindingService.addDynamicKeybinding('testCommand', 67 /* F9 */, function () {
                commandInvoked = true;
            }, null);
            keybindingService.testDispatch({
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 67 /* F9 */,
                code: null
            });
            assert.ok(commandInvoked, 'command invoked');
        });
    });
});
