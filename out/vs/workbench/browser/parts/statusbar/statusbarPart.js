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
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/common/errorMessage", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/base/browser/builder", "vs/base/browser/ui/octiconLabel/octiconLabel", "vs/platform/registry/common/platform", "vs/platform/commands/common/commands", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/part", "vs/workbench/browser/parts/statusbar/statusbar", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/message/common/message", "vs/editor/browser/services/codeEditorService", "vs/platform/contextview/browser/contextView", "vs/base/common/actions", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/workspace/common/workspace", "vs/platform/theme/common/colorRegistry", "vs/editor/common/editorCommon", "vs/base/common/color", "vs/css!./media/statusbarpart"], function (require, exports, dom, nls, errorMessage_1, winjs_base_1, lifecycle_1, builder_1, octiconLabel_1, platform_1, commands_1, editorService_1, part_1, statusbar_1, instantiation_1, telemetry_1, message_1, codeEditorService_1, contextView_1, actions_1, themeService_1, theme_1, workspace_1, colorRegistry_1, editorCommon_1, color_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var StatusbarPart = /** @class */ (function (_super) {
        __extends(StatusbarPart, _super);
        function StatusbarPart(id, instantiationService, themeService, contextService) {
            var _this = _super.call(this, id, { hasTitle: false }, themeService) || this;
            _this.instantiationService = instantiationService;
            _this.contextService = contextService;
            _this.registerListeners();
            return _this;
        }
        StatusbarPart.prototype.registerListeners = function () {
            var _this = this;
            this.toUnbind.push(this.contextService.onDidChangeWorkbenchState(function () { return _this.updateStyles(); }));
        };
        StatusbarPart.prototype.addEntry = function (entry, alignment, priority) {
            if (priority === void 0) { priority = 0; }
            // Render entry in status bar
            var el = this.doCreateStatusItem(alignment, priority);
            var item = this.instantiationService.createInstance(StatusBarEntryItem, entry);
            var toDispose = item.render(el);
            // Insert according to priority
            var container = this.statusItemsContainer.getHTMLElement();
            var neighbours = this.getEntries(alignment);
            var inserted = false;
            for (var i = 0; i < neighbours.length; i++) {
                var neighbour = neighbours[i];
                var nPriority = builder_1.$(neighbour).getProperty(StatusbarPart.PRIORITY_PROP);
                if (alignment === statusbar_1.StatusbarAlignment.LEFT && nPriority < priority ||
                    alignment === statusbar_1.StatusbarAlignment.RIGHT && nPriority > priority) {
                    container.insertBefore(el, neighbour);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                container.appendChild(el);
            }
            return {
                dispose: function () {
                    builder_1.$(el).destroy();
                    if (toDispose) {
                        toDispose.dispose();
                    }
                }
            };
        };
        StatusbarPart.prototype.getEntries = function (alignment) {
            var entries = [];
            var container = this.statusItemsContainer.getHTMLElement();
            var children = container.children;
            for (var i = 0; i < children.length; i++) {
                var childElement = children.item(i);
                if (builder_1.$(childElement).getProperty(StatusbarPart.ALIGNMENT_PROP) === alignment) {
                    entries.push(childElement);
                }
            }
            return entries;
        };
        StatusbarPart.prototype.createContentArea = function (parent) {
            var _this = this;
            this.statusItemsContainer = builder_1.$(parent);
            // Fill in initial items that were contributed from the registry
            var registry = platform_1.Registry.as(statusbar_1.Extensions.Statusbar);
            var leftDescriptors = registry.items.filter(function (d) { return d.alignment === statusbar_1.StatusbarAlignment.LEFT; }).sort(function (a, b) { return b.priority - a.priority; });
            var rightDescriptors = registry.items.filter(function (d) { return d.alignment === statusbar_1.StatusbarAlignment.RIGHT; }).sort(function (a, b) { return a.priority - b.priority; });
            var descriptors = rightDescriptors.concat(leftDescriptors); // right first because they float
            (_a = this.toUnbind).push.apply(_a, descriptors.map(function (descriptor) {
                var item = _this.instantiationService.createInstance(descriptor.syncDescriptor);
                var el = _this.doCreateStatusItem(descriptor.alignment, descriptor.priority);
                var dispose = item.render(el);
                _this.statusItemsContainer.append(el);
                return dispose;
            }));
            return this.statusItemsContainer;
            var _a;
        };
        StatusbarPart.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            var container = this.getContainer();
            container.style('color', this.getColor(this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY ? theme_1.STATUS_BAR_FOREGROUND : theme_1.STATUS_BAR_NO_FOLDER_FOREGROUND));
            container.style('background-color', this.getColor(this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY ? theme_1.STATUS_BAR_BACKGROUND : theme_1.STATUS_BAR_NO_FOLDER_BACKGROUND));
            var borderColor = this.getColor(this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY ? theme_1.STATUS_BAR_BORDER : theme_1.STATUS_BAR_NO_FOLDER_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            container.style('border-top-width', borderColor ? '1px' : null);
            container.style('border-top-style', borderColor ? 'solid' : null);
            container.style('border-top-color', borderColor);
        };
        StatusbarPart.prototype.doCreateStatusItem = function (alignment, priority) {
            if (priority === void 0) { priority = 0; }
            var el = document.createElement('div');
            dom.addClass(el, 'statusbar-item');
            if (alignment === statusbar_1.StatusbarAlignment.RIGHT) {
                dom.addClass(el, 'right');
            }
            else {
                dom.addClass(el, 'left');
            }
            builder_1.$(el).setProperty(StatusbarPart.PRIORITY_PROP, priority);
            builder_1.$(el).setProperty(StatusbarPart.ALIGNMENT_PROP, alignment);
            return el;
        };
        StatusbarPart.prototype.setStatusMessage = function (message, autoDisposeAfter, delayBy) {
            var _this = this;
            if (autoDisposeAfter === void 0) { autoDisposeAfter = -1; }
            if (delayBy === void 0) { delayBy = 0; }
            if (this.statusMsgDispose) {
                this.statusMsgDispose.dispose(); // dismiss any previous
            }
            // Create new
            var statusDispose;
            var showHandle = setTimeout(function () {
                statusDispose = _this.addEntry({ text: message }, statusbar_1.StatusbarAlignment.LEFT, -Number.MAX_VALUE /* far right on left hand side */);
                showHandle = null;
            }, delayBy);
            var hideHandle;
            // Dispose function takes care of timeouts and actual entry
            var dispose = {
                dispose: function () {
                    if (showHandle) {
                        clearTimeout(showHandle);
                    }
                    if (hideHandle) {
                        clearTimeout(hideHandle);
                    }
                    if (statusDispose) {
                        statusDispose.dispose();
                    }
                }
            };
            this.statusMsgDispose = dispose;
            if (typeof autoDisposeAfter === 'number' && autoDisposeAfter > 0) {
                hideHandle = setTimeout(function () { return dispose.dispose(); }, autoDisposeAfter);
            }
            return dispose;
        };
        StatusbarPart.PRIORITY_PROP = 'priority';
        StatusbarPart.ALIGNMENT_PROP = 'alignment';
        StatusbarPart = __decorate([
            __param(1, instantiation_1.IInstantiationService),
            __param(2, themeService_1.IThemeService),
            __param(3, workspace_1.IWorkspaceContextService)
        ], StatusbarPart);
        return StatusbarPart;
    }(part_1.Part));
    exports.StatusbarPart = StatusbarPart;
    var manageExtensionAction;
    var StatusBarEntryItem = /** @class */ (function () {
        function StatusBarEntryItem(entry, commandService, instantiationService, messageService, telemetryService, contextMenuService, editorService, themeService) {
            this.commandService = commandService;
            this.instantiationService = instantiationService;
            this.messageService = messageService;
            this.telemetryService = telemetryService;
            this.contextMenuService = contextMenuService;
            this.editorService = editorService;
            this.themeService = themeService;
            this.entry = entry;
            if (!manageExtensionAction) {
                manageExtensionAction = this.instantiationService.createInstance(ManageExtensionAction);
            }
        }
        StatusBarEntryItem.prototype.render = function (el) {
            var _this = this;
            var toDispose = [];
            dom.addClass(el, 'statusbar-entry');
            // Text Container
            var textContainer;
            if (this.entry.command) {
                textContainer = document.createElement('a');
                builder_1.$(textContainer).on('click', function () { return _this.executeCommand(_this.entry.command, _this.entry.arguments); }, toDispose);
            }
            else {
                textContainer = document.createElement('span');
            }
            // Label
            new octiconLabel_1.OcticonLabel(textContainer).text = this.entry.text;
            // Tooltip
            if (this.entry.tooltip) {
                builder_1.$(textContainer).title(this.entry.tooltip);
            }
            // Color
            var color = this.entry.color;
            if (color) {
                if (editorCommon_1.isThemeColor(color)) {
                    var colorId_1 = color.id;
                    color = (this.themeService.getTheme().getColor(colorId_1) || color_1.Color.transparent).toString();
                    toDispose.push(this.themeService.onThemeChange(function (theme) {
                        var colorValue = (_this.themeService.getTheme().getColor(colorId_1) || color_1.Color.transparent).toString();
                        builder_1.$(textContainer).color(colorValue);
                    }));
                }
                builder_1.$(textContainer).color(color);
            }
            // Context Menu
            if (this.entry.extensionId) {
                builder_1.$(textContainer).on('contextmenu', function (e) {
                    dom.EventHelper.stop(e, true);
                    _this.contextMenuService.showContextMenu({
                        getAnchor: function () { return el; },
                        getActionsContext: function () { return _this.entry.extensionId; },
                        getActions: function () { return winjs_base_1.TPromise.as([manageExtensionAction]); }
                    });
                }, toDispose);
            }
            el.appendChild(textContainer);
            return {
                dispose: function () {
                    toDispose = lifecycle_1.dispose(toDispose);
                }
            };
        };
        StatusBarEntryItem.prototype.executeCommand = function (id, args) {
            var _this = this;
            args = args || [];
            // Maintain old behaviour of always focusing the editor here
            var activeEditor = this.editorService.getActiveEditor();
            var codeEditor = codeEditorService_1.getCodeEditor(activeEditor);
            if (codeEditor) {
                codeEditor.focus();
            }
            /* __GDPR__
                "workbenchActionExecuted" : {
                    "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('workbenchActionExecuted', { id: id, from: 'status bar' });
            (_a = this.commandService).executeCommand.apply(_a, [id].concat(args)).done(undefined, function (err) { return _this.messageService.show(message_1.Severity.Error, errorMessage_1.toErrorMessage(err)); });
            var _a;
        };
        StatusBarEntryItem = __decorate([
            __param(1, commands_1.ICommandService),
            __param(2, instantiation_1.IInstantiationService),
            __param(3, message_1.IMessageService),
            __param(4, telemetry_1.ITelemetryService),
            __param(5, contextView_1.IContextMenuService),
            __param(6, editorService_1.IWorkbenchEditorService),
            __param(7, themeService_1.IThemeService)
        ], StatusBarEntryItem);
        return StatusBarEntryItem;
    }());
    var ManageExtensionAction = /** @class */ (function (_super) {
        __extends(ManageExtensionAction, _super);
        function ManageExtensionAction(commandService) {
            var _this = _super.call(this, 'statusbar.manage.extension', nls.localize('manageExtension', "Manage Extension")) || this;
            _this.commandService = commandService;
            return _this;
        }
        ManageExtensionAction.prototype.run = function (extensionId) {
            return this.commandService.executeCommand('_extensions.manage', extensionId);
        };
        ManageExtensionAction = __decorate([
            __param(0, commands_1.ICommandService)
        ], ManageExtensionAction);
        return ManageExtensionAction;
    }(actions_1.Action));
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var statusBarItemHoverBackground = theme.getColor(theme_1.STATUS_BAR_ITEM_HOVER_BACKGROUND);
        if (statusBarItemHoverBackground) {
            collector.addRule(".monaco-workbench > .part.statusbar > .statusbar-item a:hover:not([disabled]):not(.disabled) { background-color: " + statusBarItemHoverBackground + "; }");
        }
        var statusBarItemActiveBackground = theme.getColor(theme_1.STATUS_BAR_ITEM_ACTIVE_BACKGROUND);
        if (statusBarItemActiveBackground) {
            collector.addRule(".monaco-workbench > .part.statusbar > .statusbar-item a:active:not([disabled]):not(.disabled) { background-color: " + statusBarItemActiveBackground + "; }");
        }
        var statusBarProminentItemBackground = theme.getColor(theme_1.STATUS_BAR_PROMINENT_ITEM_BACKGROUND);
        if (statusBarProminentItemBackground) {
            collector.addRule(".monaco-workbench > .part.statusbar > .statusbar-item .status-bar-info { background-color: " + statusBarProminentItemBackground + "; }");
        }
        var statusBarProminentItemHoverBackground = theme.getColor(theme_1.STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND);
        if (statusBarProminentItemHoverBackground) {
            collector.addRule(".monaco-workbench > .part.statusbar > .statusbar-item a.status-bar-info:hover:not([disabled]):not(.disabled) { background-color: " + statusBarProminentItemHoverBackground + "; }");
        }
    });
});
