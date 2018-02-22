define(["require", "exports", "vs/base/common/winjs.base", "vs/platform/registry/common/platform", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/platform/message/common/message", "vs/platform/instantiation/common/instantiation", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, winjs_base_1, platform_1, keybindingsRegistry_1, commands_1, actions_1, message_1, instantiation_1, severity_1, lifecycle_1, lifecycle_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Extensions = {
        WorkbenchActions: 'workbench.contributions.actions'
    };
    platform_1.Registry.add(exports.Extensions.WorkbenchActions, new /** @class */ (function () {
        function class_1() {
        }
        class_1.prototype.registerWorkbenchAction = function (descriptor, alias, category) {
            return this._registerWorkbenchCommandFromAction(descriptor, alias, category);
        };
        class_1.prototype._registerWorkbenchCommandFromAction = function (descriptor, alias, category) {
            var registrations = [];
            // command
            registrations.push(commands_1.CommandsRegistry.registerCommand(descriptor.id, this._createCommandHandler(descriptor)));
            // keybinding
            var when = descriptor.keybindingContext;
            var weight = (typeof descriptor.keybindingWeight === 'undefined' ? keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib() : descriptor.keybindingWeight);
            var keybindings = descriptor.keybindings;
            keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
                id: descriptor.id,
                weight: weight,
                when: when,
                primary: keybindings && keybindings.primary,
                secondary: keybindings && keybindings.secondary,
                win: keybindings && keybindings.win,
                mac: keybindings && keybindings.mac,
                linux: keybindings && keybindings.linux
            });
            // menu item
            // TODO@Rob slightly weird if-check required because of
            // https://github.com/Microsoft/vscode/blob/master/src/vs/workbench/parts/search/electron-browser/search.contribution.ts#L266
            if (descriptor.label) {
                var idx = alias.indexOf(': ');
                var categoryOriginal = void 0;
                if (idx > 0) {
                    categoryOriginal = alias.substr(0, idx);
                    alias = alias.substr(idx + 2);
                }
                var command = {
                    id: descriptor.id,
                    title: { value: descriptor.label, original: alias },
                    category: category && { value: category, original: categoryOriginal }
                };
                actions_1.MenuRegistry.addCommand(command);
                registrations.push(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: command }));
            }
            // TODO@alex,joh
            // support removal of keybinding rule
            // support removal of command-ui
            return lifecycle_1.combinedDisposable(registrations);
        };
        class_1.prototype._createCommandHandler = function (descriptor) {
            var _this = this;
            return function (accessor, args) {
                var messageService = accessor.get(message_1.IMessageService);
                var instantiationService = accessor.get(instantiation_1.IInstantiationService);
                var lifecycleService = accessor.get(lifecycle_2.ILifecycleService);
                winjs_base_1.TPromise.as(_this._triggerAndDisposeAction(instantiationService, lifecycleService, descriptor, args)).then(null, function (err) {
                    messageService.show(severity_1.default.Error, err);
                });
            };
        };
        class_1.prototype._triggerAndDisposeAction = function (instantitationService, lifecycleService, descriptor, args) {
            var actionInstance = instantitationService.createInstance(descriptor.syncDescriptor);
            actionInstance.label = descriptor.label || actionInstance.label;
            // don't run the action when not enabled
            if (!actionInstance.enabled) {
                actionInstance.dispose();
                return void 0;
            }
            var from = args && args.from || 'keybinding';
            // run action when workbench is created
            return lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () {
                try {
                    return winjs_base_1.TPromise.as(actionInstance.run(undefined, { from: from })).then(function () {
                        actionInstance.dispose();
                    }, function (err) {
                        actionInstance.dispose();
                        return winjs_base_1.TPromise.wrapError(err);
                    });
                }
                catch (err) {
                    actionInstance.dispose();
                    return winjs_base_1.TPromise.wrapError(err);
                }
            });
        };
        return class_1;
    }()));
});
