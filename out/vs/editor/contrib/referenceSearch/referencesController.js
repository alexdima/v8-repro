var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/platform/editor/common/editor", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/platform/message/common/message", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/editor/browser/editorExtensions", "./referencesWidget", "vs/editor/common/services/resolverService", "vs/platform/theme/common/themeService", "vs/editor/common/core/position", "vs/platform/environment/common/environment"], function (require, exports, nls, errors_1, lifecycle_1, severity_1, editor_1, instantiation_1, contextkey_1, message_1, configuration_1, workspace_1, storage_1, editorExtensions_1, referencesWidget_1, resolverService_1, themeService_1, position_1, environment_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ctxReferenceSearchVisible = new contextkey_1.RawContextKey('referenceSearchVisible', false);
    var ReferencesController = /** @class */ (function () {
        function ReferencesController(editor, contextKeyService, _editorService, _textModelResolverService, _messageService, _instantiationService, _contextService, _storageService, _themeService, _configurationService, _environmentService) {
            this._editorService = _editorService;
            this._textModelResolverService = _textModelResolverService;
            this._messageService = _messageService;
            this._instantiationService = _instantiationService;
            this._contextService = _contextService;
            this._storageService = _storageService;
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this._environmentService = _environmentService;
            this._requestIdPool = 0;
            this._disposables = [];
            this._ignoreModelChangeEvent = false;
            this._editor = editor;
            this._referenceSearchVisible = exports.ctxReferenceSearchVisible.bindTo(contextKeyService);
        }
        ReferencesController.get = function (editor) {
            return editor.getContribution(ReferencesController.ID);
        };
        ReferencesController.prototype.getId = function () {
            return ReferencesController.ID;
        };
        ReferencesController.prototype.dispose = function () {
            if (this._widget) {
                this._widget.dispose();
                this._widget = null;
            }
            this._editor = null;
        };
        ReferencesController.prototype.toggleWidget = function (range, modelPromise, options) {
            var _this = this;
            // close current widget and return early is position didn't change
            var widgetPosition;
            if (this._widget) {
                widgetPosition = this._widget.position;
            }
            this.closeWidget();
            if (!!widgetPosition && range.containsPosition(widgetPosition)) {
                return null;
            }
            this._referenceSearchVisible.set(true);
            // close the widget on model/mode changes
            this._disposables.push(this._editor.onDidChangeModelLanguage(function () { _this.closeWidget(); }));
            this._disposables.push(this._editor.onDidChangeModel(function () {
                if (!_this._ignoreModelChangeEvent) {
                    _this.closeWidget();
                }
            }));
            var storageKey = 'peekViewLayout';
            var data = JSON.parse(this._storageService.get(storageKey, undefined, '{}'));
            this._widget = new referencesWidget_1.ReferenceWidget(this._editor, data, this._textModelResolverService, this._contextService, this._themeService, this._instantiationService, this._environmentService);
            this._widget.setTitle(nls.localize('labelLoading', "Loading..."));
            this._widget.show(range);
            this._disposables.push(this._widget.onDidClose(function () {
                modelPromise.cancel();
                _this._storageService.store(storageKey, JSON.stringify(_this._widget.layoutData));
                _this._widget = null;
                _this.closeWidget();
            }));
            this._disposables.push(this._widget.onDidSelectReference(function (event) {
                var element = event.element, kind = event.kind;
                switch (kind) {
                    case 'open':
                        if (event.source === 'editor'
                            && _this._configurationService.getValue('editor.stablePeek')) {
                            // when stable peek is configured we don't close
                            // the peek window on selecting the editor
                            break;
                        }
                    case 'side':
                        _this.openReference(element, kind === 'side');
                        break;
                    case 'goto':
                        if (options.onGoto) {
                            options.onGoto(element);
                        }
                        else {
                            _this._gotoReference(element);
                        }
                        break;
                }
            }));
            var requestId = ++this._requestIdPool;
            modelPromise.then(function (model) {
                // still current request? widget still open?
                if (requestId !== _this._requestIdPool || !_this._widget) {
                    return undefined;
                }
                if (_this._model) {
                    _this._model.dispose();
                }
                _this._model = model;
                // show widget
                return _this._widget.setModel(_this._model).then(function () {
                    // set title
                    _this._widget.setMetaTitle(options.getMetaTitle(_this._model));
                    // set 'best' selection
                    var uri = _this._editor.getModel().uri;
                    var pos = new position_1.Position(range.startLineNumber, range.startColumn);
                    var selection = _this._model.nearestReference(uri, pos);
                    if (selection) {
                        return _this._widget.setSelection(selection);
                    }
                    return undefined;
                });
            }, function (error) {
                _this._messageService.show(severity_1.default.Error, error);
            });
        };
        ReferencesController.prototype.closeWidget = function () {
            if (this._widget) {
                this._widget.dispose();
                this._widget = null;
            }
            this._referenceSearchVisible.reset();
            this._disposables = lifecycle_1.dispose(this._disposables);
            if (this._model) {
                this._model.dispose();
                this._model = null;
            }
            this._editor.focus();
            this._requestIdPool += 1; // Cancel pending requests
        };
        ReferencesController.prototype._gotoReference = function (ref) {
            var _this = this;
            this._widget.hide();
            this._ignoreModelChangeEvent = true;
            var uri = ref.uri, range = ref.range;
            this._editorService.openEditor({
                resource: uri,
                options: { selection: range }
            }).done(function (openedEditor) {
                _this._ignoreModelChangeEvent = false;
                if (!openedEditor || openedEditor.getControl() !== _this._editor) {
                    // TODO@Alex TODO@Joh
                    // when opening the current reference we might end up
                    // in a different editor instance. that means we also have
                    // a different instance of this reference search controller
                    // and cannot hold onto the widget (which likely doesn't
                    // exist). Instead of bailing out we should find the
                    // 'sister' action and pass our current model on to it.
                    _this.closeWidget();
                    return;
                }
                _this._widget.show(range);
                _this._widget.focus();
            }, function (err) {
                _this._ignoreModelChangeEvent = false;
                errors_1.onUnexpectedError(err);
            });
        };
        ReferencesController.prototype.openReference = function (ref, sideBySide) {
            var uri = ref.uri, range = ref.range;
            this._editorService.openEditor({
                resource: uri,
                options: { selection: range }
            }, sideBySide);
            // clear stage
            if (!sideBySide) {
                this.closeWidget();
            }
        };
        ReferencesController.ID = 'editor.contrib.referencesController';
        ReferencesController = __decorate([
            __param(1, contextkey_1.IContextKeyService),
            __param(2, editor_1.IEditorService),
            __param(3, resolverService_1.ITextModelService),
            __param(4, message_1.IMessageService),
            __param(5, instantiation_1.IInstantiationService),
            __param(6, workspace_1.IWorkspaceContextService),
            __param(7, storage_1.IStorageService),
            __param(8, themeService_1.IThemeService),
            __param(9, configuration_1.IConfigurationService),
            __param(10, instantiation_1.optional(environment_1.IEnvironmentService))
        ], ReferencesController);
        return ReferencesController;
    }());
    exports.ReferencesController = ReferencesController;
    editorExtensions_1.registerEditorContribution(ReferencesController);
});
