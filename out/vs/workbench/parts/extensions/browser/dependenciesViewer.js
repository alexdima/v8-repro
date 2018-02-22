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
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/workbench/parts/extensions/common/extensions", "vs/base/common/event", "vs/base/browser/event", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration"], function (require, exports, dom, nls_1, lifecycle_1, winjs_base_1, actions_1, extensions_1, event_1, event_2, instantiation_1, listService_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DataSource = /** @class */ (function () {
        function DataSource() {
        }
        DataSource.prototype.getId = function (tree, element) {
            var _this = this;
            var id = element.identifier;
            this.getParent(tree, element).then(function (parent) {
                id = parent ? _this.getId(tree, parent) + '/' + id : id;
            });
            return id;
        };
        DataSource.prototype.hasChildren = function (tree, element) {
            return element.hasDependencies;
        };
        DataSource.prototype.getChildren = function (tree, element) {
            return winjs_base_1.TPromise.as(element.dependencies);
        };
        DataSource.prototype.getParent = function (tree, element) {
            return winjs_base_1.TPromise.as(element.dependent);
        };
        return DataSource;
    }());
    exports.DataSource = DataSource;
    var Renderer = /** @class */ (function () {
        function Renderer(instantiationService) {
            this.instantiationService = instantiationService;
        }
        Renderer.prototype.getHeight = function (tree, element) {
            return 62;
        };
        Renderer.prototype.getTemplateId = function (tree, element) {
            return element.extension ? Renderer.EXTENSION_TEMPLATE_ID : Renderer.UNKNOWN_EXTENSION_TEMPLATE_ID;
        };
        Renderer.prototype.renderTemplate = function (tree, templateId, container) {
            if (Renderer.EXTENSION_TEMPLATE_ID === templateId) {
                return this.renderExtensionTemplate(tree, container);
            }
            return this.renderUnknownExtensionTemplate(tree, container);
        };
        Renderer.prototype.renderExtensionTemplate = function (tree, container) {
            dom.addClass(container, 'dependency');
            var icon = dom.append(container, dom.$('img.icon'));
            var details = dom.append(container, dom.$('.details'));
            var header = dom.append(details, dom.$('.header'));
            var name = dom.append(header, dom.$('span.name'));
            var openExtensionAction = this.instantiationService.createInstance(OpenExtensionAction);
            var extensionDisposables = [dom.addDisposableListener(name, 'click', function (e) {
                    tree.setFocus(openExtensionAction.extensionDependencies);
                    tree.setSelection([openExtensionAction.extensionDependencies]);
                    openExtensionAction.run(e.ctrlKey || e.metaKey);
                    e.stopPropagation();
                    e.preventDefault();
                })];
            var identifier = dom.append(header, dom.$('span.identifier'));
            var footer = dom.append(details, dom.$('.footer'));
            var author = dom.append(footer, dom.$('.author'));
            return {
                icon: icon,
                name: name,
                identifier: identifier,
                author: author,
                extensionDisposables: extensionDisposables,
                set extensionDependencies(e) {
                    openExtensionAction.extensionDependencies = e;
                }
            };
        };
        Renderer.prototype.renderUnknownExtensionTemplate = function (tree, container) {
            var messageContainer = dom.append(container, dom.$('div.unknown-dependency'));
            dom.append(messageContainer, dom.$('span.error-marker')).textContent = nls_1.localize('error', "Error");
            dom.append(messageContainer, dom.$('span.message')).textContent = nls_1.localize('Unknown Dependency', "Unknown Dependency:");
            var identifier = dom.append(messageContainer, dom.$('span.message'));
            return { identifier: identifier };
        };
        Renderer.prototype.renderElement = function (tree, element, templateId, templateData) {
            if (templateId === Renderer.EXTENSION_TEMPLATE_ID) {
                this.renderExtension(tree, element, templateData);
                return;
            }
            this.renderUnknownExtension(tree, element, templateData);
        };
        Renderer.prototype.renderExtension = function (tree, element, data) {
            var extension = element.extension;
            var onError = event_1.once(event_2.domEvent(data.icon, 'error'));
            onError(function () { return data.icon.src = extension.iconUrlFallback; }, null, data.extensionDisposables);
            data.icon.src = extension.iconUrl;
            if (!data.icon.complete) {
                data.icon.style.visibility = 'hidden';
                data.icon.onload = function () { return data.icon.style.visibility = 'inherit'; };
            }
            else {
                data.icon.style.visibility = 'inherit';
            }
            data.name.textContent = extension.displayName;
            data.identifier.textContent = extension.id;
            data.author.textContent = extension.publisherDisplayName;
            data.extensionDependencies = element;
        };
        Renderer.prototype.renderUnknownExtension = function (tree, element, data) {
            data.identifier.textContent = element.identifier;
        };
        Renderer.prototype.disposeTemplate = function (tree, templateId, templateData) {
            if (templateId === Renderer.EXTENSION_TEMPLATE_ID) {
                templateData.extensionDisposables = lifecycle_1.dispose(templateData.extensionDisposables);
            }
        };
        Renderer.EXTENSION_TEMPLATE_ID = 'extension-template';
        Renderer.UNKNOWN_EXTENSION_TEMPLATE_ID = 'unknown-extension-template';
        Renderer = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], Renderer);
        return Renderer;
    }());
    exports.Renderer = Renderer;
    var Controller = /** @class */ (function (_super) {
        __extends(Controller, _super);
        function Controller(extensionsWorkdbenchService, configurationService) {
            var _this = _super.call(this, {}, configurationService) || this;
            _this.extensionsWorkdbenchService = extensionsWorkdbenchService;
            // TODO@Sandeep this should be a command
            _this.downKeyBindingDispatcher.set(2048 /* CtrlCmd */ | 3 /* Enter */, function (tree, event) { return _this.openExtension(tree, true); });
            return _this;
        }
        Controller.prototype.onLeftClick = function (tree, element, event) {
            var currentFocused = tree.getFocus();
            if (_super.prototype.onLeftClick.call(this, tree, element, event)) {
                if (element.dependent === null) {
                    if (currentFocused) {
                        tree.setFocus(currentFocused);
                    }
                    else {
                        tree.focusFirst();
                    }
                    return true;
                }
            }
            return false;
        };
        Controller.prototype.openExtension = function (tree, sideByside) {
            var element = tree.getFocus();
            if (element.extension) {
                this.extensionsWorkdbenchService.open(element.extension, sideByside);
                return true;
            }
            return false;
        };
        Controller = __decorate([
            __param(0, extensions_1.IExtensionsWorkbenchService),
            __param(1, configuration_1.IConfigurationService)
        ], Controller);
        return Controller;
    }(listService_1.WorkbenchTreeController));
    exports.Controller = Controller;
    var OpenExtensionAction = /** @class */ (function (_super) {
        __extends(OpenExtensionAction, _super);
        function OpenExtensionAction(extensionsWorkdbenchService) {
            var _this = _super.call(this, 'extensions.action.openDependency', '') || this;
            _this.extensionsWorkdbenchService = extensionsWorkdbenchService;
            return _this;
        }
        Object.defineProperty(OpenExtensionAction.prototype, "extensionDependencies", {
            get: function () {
                return this._extensionDependencies;
            },
            set: function (extensionDependencies) {
                this._extensionDependencies = extensionDependencies;
            },
            enumerable: true,
            configurable: true
        });
        OpenExtensionAction.prototype.run = function (sideByside) {
            return this.extensionsWorkdbenchService.open(this._extensionDependencies.extension, sideByside);
        };
        OpenExtensionAction = __decorate([
            __param(0, extensions_1.IExtensionsWorkbenchService)
        ], OpenExtensionAction);
        return OpenExtensionAction;
    }(actions_1.Action));
});
