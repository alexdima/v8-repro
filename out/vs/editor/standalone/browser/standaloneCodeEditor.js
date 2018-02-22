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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/services/codeEditorService", "vs/editor/common/services/editorWorkerService", "vs/editor/standalone/browser/simpleServices", "vs/editor/browser/codeEditor", "vs/editor/browser/widget/diffEditorWidget", "vs/editor/standalone/common/standaloneThemeService", "vs/editor/common/editorAction", "vs/platform/actions/common/actions", "vs/platform/theme/common/themeService", "vs/base/browser/ui/aria/aria", "vs/platform/message/common/message", "vs/nls", "vs/base/browser/browser"], function (require, exports, lifecycle_1, winjs_base_1, contextView_1, instantiation_1, commands_1, keybinding_1, contextkey_1, codeEditorService_1, editorWorkerService_1, simpleServices_1, codeEditor_1, diffEditorWidget_1, standaloneThemeService_1, editorAction_1, actions_1, themeService_1, aria, message_1, nls, browser) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var LAST_GENERATED_COMMAND_ID = 0;
    var ariaDomNodeCreated = false;
    function createAriaDomNode() {
        if (ariaDomNodeCreated) {
            return;
        }
        ariaDomNodeCreated = true;
        aria.setARIAContainer(document.body);
    }
    /**
     * A code editor to be used both by the standalone editor and the standalone diff editor.
     */
    var StandaloneCodeEditor = /** @class */ (function (_super) {
        __extends(StandaloneCodeEditor, _super);
        function StandaloneCodeEditor(domElement, options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService) {
            var _this = this;
            options = options || {};
            options.ariaLabel = options.ariaLabel || nls.localize('editorViewAccessibleLabel', "Editor content");
            options.ariaLabel = options.ariaLabel + ';' + (browser.isIE
                ? nls.localize('accessibilityHelpMessageIE', "Press Ctrl+F1 for Accessibility Options.")
                : nls.localize('accessibilityHelpMessage', "Press Alt+F1 for Accessibility Options."));
            _this = _super.call(this, domElement, options, instantiationService, codeEditorService, commandService, contextKeyService, themeService) || this;
            if (keybindingService instanceof simpleServices_1.StandaloneKeybindingService) {
                _this._standaloneKeybindingService = keybindingService;
            }
            // Create the ARIA dom node as soon as the first editor is instantiated
            createAriaDomNode();
            return _this;
        }
        StandaloneCodeEditor.prototype.addCommand = function (keybinding, handler, context) {
            if (!this._standaloneKeybindingService) {
                console.warn('Cannot add command because the editor is configured with an unrecognized KeybindingService');
                return null;
            }
            var commandId = 'DYNAMIC_' + (++LAST_GENERATED_COMMAND_ID);
            var whenExpression = contextkey_1.ContextKeyExpr.deserialize(context);
            this._standaloneKeybindingService.addDynamicKeybinding(commandId, keybinding, handler, whenExpression);
            return commandId;
        };
        StandaloneCodeEditor.prototype.createContextKey = function (key, defaultValue) {
            return this._contextKeyService.createKey(key, defaultValue);
        };
        StandaloneCodeEditor.prototype.addAction = function (_descriptor) {
            var _this = this;
            if ((typeof _descriptor.id !== 'string') || (typeof _descriptor.label !== 'string') || (typeof _descriptor.run !== 'function')) {
                throw new Error('Invalid action descriptor, `id`, `label` and `run` are required properties!');
            }
            if (!this._standaloneKeybindingService) {
                console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
                return lifecycle_1.empty;
            }
            // Read descriptor options
            var id = _descriptor.id;
            var label = _descriptor.label;
            var precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('editorId', this.getId()), contextkey_1.ContextKeyExpr.deserialize(_descriptor.precondition));
            var keybindings = _descriptor.keybindings;
            var keybindingsWhen = contextkey_1.ContextKeyExpr.and(precondition, contextkey_1.ContextKeyExpr.deserialize(_descriptor.keybindingContext));
            var contextMenuGroupId = _descriptor.contextMenuGroupId || null;
            var contextMenuOrder = _descriptor.contextMenuOrder || 0;
            var run = function () {
                var r = _descriptor.run(_this);
                return r ? r : winjs_base_1.TPromise.as(void 0);
            };
            var toDispose = [];
            // Generate a unique id to allow the same descriptor.id across multiple editor instances
            var uniqueId = this.getId() + ':' + id;
            // Register the command
            toDispose.push(commands_1.CommandsRegistry.registerCommand(uniqueId, run));
            // Register the context menu item
            if (contextMenuGroupId) {
                var menuItem = {
                    command: {
                        id: uniqueId,
                        title: label
                    },
                    when: precondition,
                    group: contextMenuGroupId,
                    order: contextMenuOrder
                };
                toDispose.push(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, menuItem));
            }
            // Register the keybindings
            if (Array.isArray(keybindings)) {
                toDispose = toDispose.concat(keybindings.map(function (kb) {
                    return _this._standaloneKeybindingService.addDynamicKeybinding(uniqueId, kb, run, keybindingsWhen);
                }));
            }
            // Finally, register an internal editor action
            var internalAction = new editorAction_1.InternalEditorAction(uniqueId, label, label, precondition, run, this._contextKeyService);
            // Store it under the original id, such that trigger with the original id will work
            this._actions[id] = internalAction;
            toDispose.push({
                dispose: function () {
                    delete _this._actions[id];
                }
            });
            return lifecycle_1.combinedDisposable(toDispose);
        };
        StandaloneCodeEditor = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, codeEditorService_1.ICodeEditorService),
            __param(4, commands_1.ICommandService),
            __param(5, contextkey_1.IContextKeyService),
            __param(6, keybinding_1.IKeybindingService),
            __param(7, themeService_1.IThemeService)
        ], StandaloneCodeEditor);
        return StandaloneCodeEditor;
    }(codeEditor_1.CodeEditor));
    exports.StandaloneCodeEditor = StandaloneCodeEditor;
    var StandaloneEditor = /** @class */ (function (_super) {
        __extends(StandaloneEditor, _super);
        function StandaloneEditor(domElement, options, toDispose, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, contextViewService, themeService) {
            var _this = this;
            options = options || {};
            if (typeof options.theme === 'string') {
                themeService.setTheme(options.theme);
            }
            var model = options.model;
            delete options.model;
            _this = _super.call(this, domElement, options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService) || this;
            _this._contextViewService = contextViewService;
            _this._register(toDispose);
            if (typeof model === 'undefined') {
                model = self.monaco.editor.createModel(options.value || '', options.language || 'text/plain');
                _this._ownsModel = true;
            }
            else {
                _this._ownsModel = false;
            }
            _this._attachModel(model);
            if (model) {
                var e = {
                    oldModelUrl: null,
                    newModelUrl: model.uri
                };
                _this._onDidChangeModel.fire(e);
            }
            return _this;
        }
        StandaloneEditor.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        StandaloneEditor.prototype._attachModel = function (model) {
            _super.prototype._attachModel.call(this, model);
            if (this._view) {
                this._contextViewService.setContainer(this._view.domNode.domNode);
            }
        };
        StandaloneEditor.prototype._postDetachModelCleanup = function (detachedModel) {
            _super.prototype._postDetachModelCleanup.call(this, detachedModel);
            if (detachedModel && this._ownsModel) {
                detachedModel.dispose();
                this._ownsModel = false;
            }
        };
        StandaloneEditor = __decorate([
            __param(3, instantiation_1.IInstantiationService),
            __param(4, codeEditorService_1.ICodeEditorService),
            __param(5, commands_1.ICommandService),
            __param(6, contextkey_1.IContextKeyService),
            __param(7, keybinding_1.IKeybindingService),
            __param(8, contextView_1.IContextViewService),
            __param(9, standaloneThemeService_1.IStandaloneThemeService)
        ], StandaloneEditor);
        return StandaloneEditor;
    }(StandaloneCodeEditor));
    exports.StandaloneEditor = StandaloneEditor;
    var StandaloneDiffEditor = /** @class */ (function (_super) {
        __extends(StandaloneDiffEditor, _super);
        function StandaloneDiffEditor(domElement, options, toDispose, instantiationService, contextKeyService, keybindingService, contextViewService, editorWorkerService, codeEditorService, themeService, messageService) {
            var _this = this;
            options = options || {};
            if (typeof options.theme === 'string') {
                options.theme = themeService.setTheme(options.theme);
            }
            _this = _super.call(this, domElement, options, editorWorkerService, contextKeyService, instantiationService, codeEditorService, themeService, messageService) || this;
            _this._contextViewService = contextViewService;
            _this._register(toDispose);
            _this._contextViewService.setContainer(_this._containerDomElement);
            return _this;
        }
        StandaloneDiffEditor.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        StandaloneDiffEditor.prototype._createInnerEditor = function (instantiationService, container, options) {
            return instantiationService.createInstance(StandaloneCodeEditor, container, options);
        };
        StandaloneDiffEditor.prototype.getOriginalEditor = function () {
            return _super.prototype.getOriginalEditor.call(this);
        };
        StandaloneDiffEditor.prototype.getModifiedEditor = function () {
            return _super.prototype.getModifiedEditor.call(this);
        };
        StandaloneDiffEditor.prototype.addCommand = function (keybinding, handler, context) {
            return this.getModifiedEditor().addCommand(keybinding, handler, context);
        };
        StandaloneDiffEditor.prototype.createContextKey = function (key, defaultValue) {
            return this.getModifiedEditor().createContextKey(key, defaultValue);
        };
        StandaloneDiffEditor.prototype.addAction = function (descriptor) {
            return this.getModifiedEditor().addAction(descriptor);
        };
        StandaloneDiffEditor = __decorate([
            __param(3, instantiation_1.IInstantiationService),
            __param(4, contextkey_1.IContextKeyService),
            __param(5, keybinding_1.IKeybindingService),
            __param(6, contextView_1.IContextViewService),
            __param(7, editorWorkerService_1.IEditorWorkerService),
            __param(8, codeEditorService_1.ICodeEditorService),
            __param(9, standaloneThemeService_1.IStandaloneThemeService),
            __param(10, message_1.IMessageService)
        ], StandaloneDiffEditor);
        return StandaloneDiffEditor;
    }(diffEditorWidget_1.DiffEditorWidget));
    exports.StandaloneDiffEditor = StandaloneDiffEditor;
});
