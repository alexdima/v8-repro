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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "vs/base/common/errors", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/editor/common/core/position", "vs/editor/common/services/modelService", "vs/platform/actions/common/actions", "vs/platform/editor/common/editor", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/services/codeEditorService"], function (require, exports, errors_1, uri_1, commands_1, keybindingsRegistry_1, platform_1, telemetry_1, position_1, modelService_1, actions_1, editor_1, contextkey_1, codeEditorService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Command = /** @class */ (function () {
        function Command(opts) {
            this.id = opts.id;
            this.precondition = opts.precondition;
            this._kbOpts = opts.kbOpts;
            this._description = opts.description;
        }
        Command.prototype.toCommandAndKeybindingRule = function (defaultWeight) {
            var _this = this;
            var kbOpts = this._kbOpts || { primary: 0 };
            var kbWhen = kbOpts.kbExpr;
            if (this.precondition) {
                if (kbWhen) {
                    kbWhen = contextkey_1.ContextKeyExpr.and(kbWhen, this.precondition);
                }
                else {
                    kbWhen = this.precondition;
                }
            }
            var weight = (typeof kbOpts.weight === 'number' ? kbOpts.weight : defaultWeight);
            return {
                id: this.id,
                handler: function (accessor, args) { return _this.runCommand(accessor, args); },
                weight: weight,
                when: kbWhen,
                primary: kbOpts.primary,
                secondary: kbOpts.secondary,
                win: kbOpts.win,
                linux: kbOpts.linux,
                mac: kbOpts.mac,
                description: this._description
            };
        };
        return Command;
    }());
    exports.Command = Command;
    //#endregion Command
    //#region EditorCommand
    function getWorkbenchActiveEditor(accessor) {
        var editorService = accessor.get(editor_1.IEditorService);
        var activeEditor = editorService.getActiveEditor && editorService.getActiveEditor();
        return codeEditorService_1.getCodeEditor(activeEditor);
    }
    var EditorCommand = /** @class */ (function (_super) {
        __extends(EditorCommand, _super);
        function EditorCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Create a command class that is bound to a certain editor contribution.
         */
        EditorCommand.bindToContribution = function (controllerGetter) {
            return /** @class */ (function (_super) {
                __extends(EditorControllerCommandImpl, _super);
                function EditorControllerCommandImpl(opts) {
                    var _this = _super.call(this, opts) || this;
                    _this._callback = opts.handler;
                    return _this;
                }
                EditorControllerCommandImpl.prototype.runEditorCommand = function (accessor, editor, args) {
                    var controller = controllerGetter(editor);
                    if (controller) {
                        this._callback(controllerGetter(editor));
                    }
                };
                return EditorControllerCommandImpl;
            }(EditorCommand));
        };
        EditorCommand.prototype.runCommand = function (accessor, args) {
            var _this = this;
            var codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            // Find the editor with text focus
            var editor = codeEditorService.getFocusedCodeEditor();
            if (!editor) {
                // Fallback to use what the workbench considers the active editor
                editor = getWorkbenchActiveEditor(accessor);
            }
            if (!editor) {
                // well, at least we tried...
                return;
            }
            return editor.invokeWithinContext(function (editorAccessor) {
                var kbService = editorAccessor.get(contextkey_1.IContextKeyService);
                if (!kbService.contextMatchesRules(_this.precondition)) {
                    // precondition does not hold
                    return;
                }
                return _this.runEditorCommand(editorAccessor, editor, args);
            });
        };
        return EditorCommand;
    }(Command));
    exports.EditorCommand = EditorCommand;
    var EditorAction = /** @class */ (function (_super) {
        __extends(EditorAction, _super);
        function EditorAction(opts) {
            var _this = _super.call(this, opts) || this;
            _this.label = opts.label;
            _this.alias = opts.alias;
            _this.menuOpts = opts.menuOpts;
            return _this;
        }
        EditorAction.prototype.toMenuItem = function () {
            if (!this.menuOpts) {
                return null;
            }
            return {
                command: {
                    id: this.id,
                    title: this.label
                },
                when: contextkey_1.ContextKeyExpr.and(this.precondition, this.menuOpts.when),
                group: this.menuOpts.group,
                order: this.menuOpts.order
            };
        };
        EditorAction.prototype.runEditorCommand = function (accessor, editor, args) {
            this.reportTelemetry(accessor, editor);
            return this.run(accessor, editor, args || {});
        };
        EditorAction.prototype.reportTelemetry = function (accessor, editor) {
            /* __GDPR__
                "editorActionInvoked" : {
                    "name" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "id": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${EditorTelemetryData}"
                    ]
                }
            */
            accessor.get(telemetry_1.ITelemetryService).publicLog('editorActionInvoked', __assign({ name: this.label, id: this.id }, editor.getTelemetryData()));
        };
        return EditorAction;
    }(EditorCommand));
    exports.EditorAction = EditorAction;
    //#endregion EditorAction
    // --- Registration of commands and actions
    function registerLanguageCommand(id, handler) {
        commands_1.CommandsRegistry.registerCommand(id, function (accessor, args) { return handler(accessor, args || {}); });
    }
    exports.registerLanguageCommand = registerLanguageCommand;
    function registerDefaultLanguageCommand(id, handler) {
        registerLanguageCommand(id, function (accessor, args) {
            var resource = args.resource, position = args.position;
            if (!(resource instanceof uri_1.default)) {
                throw errors_1.illegalArgument('resource');
            }
            if (!position_1.Position.isIPosition(position)) {
                throw errors_1.illegalArgument('position');
            }
            var model = accessor.get(modelService_1.IModelService).getModel(resource);
            if (!model) {
                throw errors_1.illegalArgument('Can not find open model for ' + resource);
            }
            var editorPosition = position_1.Position.lift(position);
            return handler(model, editorPosition, args);
        });
    }
    exports.registerDefaultLanguageCommand = registerDefaultLanguageCommand;
    function registerEditorCommand(editorCommand) {
        EditorContributionRegistry.INSTANCE.registerEditorCommand(editorCommand);
        return editorCommand;
    }
    exports.registerEditorCommand = registerEditorCommand;
    function registerEditorAction(ctor) {
        EditorContributionRegistry.INSTANCE.registerEditorAction(new ctor());
    }
    exports.registerEditorAction = registerEditorAction;
    function registerInstantiatedEditorAction(editorAction) {
        EditorContributionRegistry.INSTANCE.registerEditorAction(editorAction);
    }
    exports.registerInstantiatedEditorAction = registerInstantiatedEditorAction;
    function registerEditorContribution(ctor) {
        EditorContributionRegistry.INSTANCE.registerEditorContribution(ctor);
    }
    exports.registerEditorContribution = registerEditorContribution;
    var EditorExtensionsRegistry;
    (function (EditorExtensionsRegistry) {
        function getEditorCommand(commandId) {
            return EditorContributionRegistry.INSTANCE.getEditorCommand(commandId);
        }
        EditorExtensionsRegistry.getEditorCommand = getEditorCommand;
        function getEditorActions() {
            return EditorContributionRegistry.INSTANCE.getEditorActions();
        }
        EditorExtensionsRegistry.getEditorActions = getEditorActions;
        function getEditorContributions() {
            return EditorContributionRegistry.INSTANCE.getEditorContributions();
        }
        EditorExtensionsRegistry.getEditorContributions = getEditorContributions;
    })(EditorExtensionsRegistry = exports.EditorExtensionsRegistry || (exports.EditorExtensionsRegistry = {}));
    // Editor extension points
    var Extensions = {
        EditorCommonContributions: 'editor.contributions'
    };
    var EditorContributionRegistry = /** @class */ (function () {
        function EditorContributionRegistry() {
            this.editorContributions = [];
            this.editorActions = [];
            this.editorCommands = Object.create(null);
        }
        EditorContributionRegistry.prototype.registerEditorContribution = function (ctor) {
            this.editorContributions.push(ctor);
        };
        EditorContributionRegistry.prototype.registerEditorAction = function (action) {
            var menuItem = action.toMenuItem();
            if (menuItem) {
                actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, menuItem);
            }
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(action.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
            this.editorActions.push(action);
        };
        EditorContributionRegistry.prototype.getEditorContributions = function () {
            return this.editorContributions.slice(0);
        };
        EditorContributionRegistry.prototype.getEditorActions = function () {
            return this.editorActions.slice(0);
        };
        EditorContributionRegistry.prototype.registerEditorCommand = function (editorCommand) {
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(editorCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
            this.editorCommands[editorCommand.id] = editorCommand;
        };
        EditorContributionRegistry.prototype.getEditorCommand = function (commandId) {
            return (this.editorCommands[commandId] || null);
        };
        EditorContributionRegistry.INSTANCE = new EditorContributionRegistry();
        return EditorContributionRegistry;
    }());
    platform_1.Registry.add(Extensions.EditorCommonContributions, EditorContributionRegistry.INSTANCE);
});
