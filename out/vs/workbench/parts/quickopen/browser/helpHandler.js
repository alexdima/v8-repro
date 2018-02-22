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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/types", "vs/platform/registry/common/platform", "vs/base/parts/quickopen/common/quickOpen", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/workbench/browser/quickopen", "vs/platform/quickOpen/common/quickOpen"], function (require, exports, winjs_base_1, nls, types, platform_1, quickOpen_1, quickOpenModel_1, quickopen_1, quickOpen_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HELP_PREFIX = '?';
    var HelpEntry = /** @class */ (function (_super) {
        __extends(HelpEntry, _super);
        function HelpEntry(prefix, description, quickOpenService, openOnPreview) {
            var _this = _super.call(this) || this;
            if (!prefix) {
                _this.prefix = '';
                _this.prefixLabel = '\u2026' /* ... */;
            }
            else {
                _this.prefix = _this.prefixLabel = prefix;
            }
            _this.description = description;
            _this.quickOpenService = quickOpenService;
            _this.openOnPreview = openOnPreview;
            return _this;
        }
        HelpEntry.prototype.getLabel = function () {
            return this.prefixLabel;
        };
        HelpEntry.prototype.getAriaLabel = function () {
            return nls.localize('entryAriaLabel', "{0}, picker help", this.getLabel());
        };
        HelpEntry.prototype.getDescription = function () {
            return this.description;
        };
        HelpEntry.prototype.run = function (mode, context) {
            if (mode === quickOpen_1.Mode.OPEN || this.openOnPreview) {
                this.quickOpenService.show(this.prefix);
            }
            return false;
        };
        return HelpEntry;
    }(quickOpenModel_1.QuickOpenEntryGroup));
    var HelpHandler = /** @class */ (function (_super) {
        __extends(HelpHandler, _super);
        function HelpHandler(quickOpenService) {
            var _this = _super.call(this) || this;
            _this.quickOpenService = quickOpenService;
            return _this;
        }
        HelpHandler.prototype.getResults = function (searchValue) {
            var _this = this;
            searchValue = searchValue.trim();
            var registry = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
            var handlerDescriptors = registry.getQuickOpenHandlers();
            var defaultHandler = registry.getDefaultQuickOpenHandler();
            if (defaultHandler) {
                handlerDescriptors.push(defaultHandler);
            }
            var workbenchScoped = [];
            var editorScoped = [];
            var entry;
            handlerDescriptors.sort(function (h1, h2) { return h1.prefix.localeCompare(h2.prefix); }).forEach(function (handlerDescriptor) {
                if (handlerDescriptor.prefix !== exports.HELP_PREFIX) {
                    // Descriptor has multiple help entries
                    if (types.isArray(handlerDescriptor.helpEntries)) {
                        for (var j = 0; j < handlerDescriptor.helpEntries.length; j++) {
                            var helpEntry = handlerDescriptor.helpEntries[j];
                            if (helpEntry.prefix.indexOf(searchValue) === 0) {
                                entry = new HelpEntry(helpEntry.prefix, helpEntry.description, _this.quickOpenService, searchValue.length > 0);
                                if (helpEntry.needsEditor) {
                                    editorScoped.push(entry);
                                }
                                else {
                                    workbenchScoped.push(entry);
                                }
                            }
                        }
                    }
                    else if (handlerDescriptor.prefix.indexOf(searchValue) === 0) {
                        entry = new HelpEntry(handlerDescriptor.prefix, handlerDescriptor.description, _this.quickOpenService, searchValue.length > 0);
                        workbenchScoped.push(entry);
                    }
                }
            });
            // Add separator for workbench scoped handlers
            if (workbenchScoped.length > 0) {
                workbenchScoped[0].setGroupLabel(nls.localize('globalCommands', "global commands"));
            }
            // Add separator for editor scoped handlers
            if (editorScoped.length > 0) {
                editorScoped[0].setGroupLabel(nls.localize('editorCommands', "editor commands"));
                if (workbenchScoped.length > 0) {
                    editorScoped[0].setShowBorder(true);
                }
            }
            return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel(workbenchScoped.concat(editorScoped)));
        };
        HelpHandler.prototype.getAutoFocus = function (searchValue) {
            searchValue = searchValue.trim();
            return {
                autoFocusFirstEntry: searchValue.length > 0,
                autoFocusPrefixMatch: searchValue
            };
        };
        HelpHandler.ID = 'workbench.picker.help';
        HelpHandler = __decorate([
            __param(0, quickOpen_2.IQuickOpenService)
        ], HelpHandler);
        return HelpHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.HelpHandler = HelpHandler;
});
