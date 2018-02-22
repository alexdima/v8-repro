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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/editorExtensions", "./parameterHintsWidget", "vs/editor/contrib/parameterHints/provideSignatureHelp", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, nls, lifecycle_1, instantiation_1, editorContextKeys_1, contextkey_1, editorExtensions_1, parameterHintsWidget_1, provideSignatureHelp_1, keybindingsRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ParameterHintsController = /** @class */ (function () {
        function ParameterHintsController(editor, instantiationService) {
            this.editor = editor;
            this.widget = instantiationService.createInstance(parameterHintsWidget_1.ParameterHintsWidget, this.editor);
        }
        ParameterHintsController.get = function (editor) {
            return editor.getContribution(ParameterHintsController.ID);
        };
        ParameterHintsController.prototype.getId = function () {
            return ParameterHintsController.ID;
        };
        ParameterHintsController.prototype.cancel = function () {
            this.widget.cancel();
        };
        ParameterHintsController.prototype.previous = function () {
            this.widget.previous();
        };
        ParameterHintsController.prototype.next = function () {
            this.widget.next();
        };
        ParameterHintsController.prototype.trigger = function () {
            this.widget.trigger();
        };
        ParameterHintsController.prototype.dispose = function () {
            this.widget = lifecycle_1.dispose(this.widget);
        };
        ParameterHintsController.ID = 'editor.controller.parameterHints';
        ParameterHintsController = __decorate([
            __param(1, instantiation_1.IInstantiationService)
        ], ParameterHintsController);
        return ParameterHintsController;
    }());
    var TriggerParameterHintsAction = /** @class */ (function (_super) {
        __extends(TriggerParameterHintsAction, _super);
        function TriggerParameterHintsAction() {
            return _super.call(this, {
                id: 'editor.action.triggerParameterHints',
                label: nls.localize('parameterHints.trigger.label', "Trigger Parameter Hints"),
                alias: 'Trigger Parameter Hints',
                precondition: editorContextKeys_1.EditorContextKeys.hasSignatureHelpProvider,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 10 /* Space */
                }
            }) || this;
        }
        TriggerParameterHintsAction.prototype.run = function (accessor, editor) {
            var controller = ParameterHintsController.get(editor);
            if (controller) {
                controller.trigger();
            }
        };
        return TriggerParameterHintsAction;
    }(editorExtensions_1.EditorAction));
    exports.TriggerParameterHintsAction = TriggerParameterHintsAction;
    editorExtensions_1.registerEditorContribution(ParameterHintsController);
    editorExtensions_1.registerEditorAction(TriggerParameterHintsAction);
    var weight = keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(75);
    var ParameterHintsCommand = editorExtensions_1.EditorCommand.bindToContribution(ParameterHintsController.get);
    editorExtensions_1.registerEditorCommand(new ParameterHintsCommand({
        id: 'closeParameterHints',
        precondition: provideSignatureHelp_1.Context.Visible,
        handler: function (x) { return x.cancel(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 9 /* Escape */,
            secondary: [1024 /* Shift */ | 9 /* Escape */]
        }
    }));
    editorExtensions_1.registerEditorCommand(new ParameterHintsCommand({
        id: 'showPrevParameterHint',
        precondition: contextkey_1.ContextKeyExpr.and(provideSignatureHelp_1.Context.Visible, provideSignatureHelp_1.Context.MultipleSignatures),
        handler: function (x) { return x.previous(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 16 /* UpArrow */,
            secondary: [512 /* Alt */ | 16 /* UpArrow */],
            mac: { primary: 16 /* UpArrow */, secondary: [512 /* Alt */ | 16 /* UpArrow */, 256 /* WinCtrl */ | 46 /* KEY_P */] }
        }
    }));
    editorExtensions_1.registerEditorCommand(new ParameterHintsCommand({
        id: 'showNextParameterHint',
        precondition: contextkey_1.ContextKeyExpr.and(provideSignatureHelp_1.Context.Visible, provideSignatureHelp_1.Context.MultipleSignatures),
        handler: function (x) { return x.next(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 18 /* DownArrow */,
            secondary: [512 /* Alt */ | 18 /* DownArrow */],
            mac: { primary: 18 /* DownArrow */, secondary: [512 /* Alt */ | 18 /* DownArrow */, 256 /* WinCtrl */ | 44 /* KEY_N */] }
        }
    }));
});
