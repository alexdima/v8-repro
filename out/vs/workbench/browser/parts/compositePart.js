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
define(["require", "exports", "vs/nls", "vs/base/common/idGenerator", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/base/browser/builder", "vs/base/common/strings", "vs/base/common/event", "vs/base/common/types", "vs/base/common/errors", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/toolbar/toolbar", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/progressbar/progressbar", "vs/workbench/browser/actions", "vs/workbench/browser/part", "vs/workbench/services/progress/browser/progressService", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/serviceCollection", "vs/platform/message/common/message", "vs/platform/progress/common/progress", "vs/platform/theme/common/styler", "vs/css!./media/compositepart"], function (require, exports, nls, idGenerator_1, winjs_base_1, lifecycle_1, builder_1, strings, event_1, types, errors, DOM, mouseEvent_1, toolbar_1, actionbar_1, progressbar_1, actions_1, part_1, progressService_1, storage_1, serviceCollection_1, message_1, progress_1, styler_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var CompositePart = /** @class */ (function (_super) {
        __extends(CompositePart, _super);
        function CompositePart(messageService, storageService, telemetryService, contextMenuService, partService, keybindingService, instantiationService, themeService, registry, activeCompositeSettingsKey, defaultCompositeId, nameForTelemetry, compositeCSSClass, titleForegroundColor, id, options) {
            var _this = _super.call(this, id, options, themeService) || this;
            _this.messageService = messageService;
            _this.storageService = storageService;
            _this.telemetryService = telemetryService;
            _this.contextMenuService = contextMenuService;
            _this.partService = partService;
            _this.keybindingService = keybindingService;
            _this.instantiationService = instantiationService;
            _this.registry = registry;
            _this.activeCompositeSettingsKey = activeCompositeSettingsKey;
            _this.defaultCompositeId = defaultCompositeId;
            _this.nameForTelemetry = nameForTelemetry;
            _this.compositeCSSClass = compositeCSSClass;
            _this.titleForegroundColor = titleForegroundColor;
            _this._onDidCompositeOpen = new event_1.Emitter();
            _this._onDidCompositeClose = new event_1.Emitter();
            _this.instantiatedCompositeListeners = [];
            _this.mapCompositeToCompositeContainer = {};
            _this.mapActionsBindingToComposite = {};
            _this.mapProgressServiceToComposite = {};
            _this.activeComposite = null;
            _this.instantiatedComposites = [];
            _this.lastActiveCompositeId = storageService.get(activeCompositeSettingsKey, storage_1.StorageScope.WORKSPACE, _this.defaultCompositeId);
            return _this;
        }
        CompositePart.prototype.openComposite = function (id, focus) {
            // Check if composite already visible and just focus in that case
            if (this.activeComposite && this.activeComposite.getId() === id) {
                if (focus) {
                    this.activeComposite.focus();
                }
                // Fullfill promise with composite that is being opened
                return winjs_base_1.TPromise.as(this.activeComposite);
            }
            // Open
            return this.doOpenComposite(id, focus);
        };
        CompositePart.prototype.doOpenComposite = function (id, focus) {
            var _this = this;
            // Use a generated token to avoid race conditions from long running promises
            var currentCompositeOpenToken = idGenerator_1.defaultGenerator.nextId();
            this.currentCompositeOpenToken = currentCompositeOpenToken;
            // Hide current
            var hidePromise;
            if (this.activeComposite) {
                hidePromise = this.hideActiveComposite();
            }
            else {
                hidePromise = winjs_base_1.TPromise.as(null);
            }
            return hidePromise.then(function () {
                // Update Title
                _this.updateTitle(id);
                // Create composite
                var composite = _this.createComposite(id, true);
                // Check if another composite opened meanwhile and return in that case
                if ((_this.currentCompositeOpenToken !== currentCompositeOpenToken) || (_this.activeComposite && _this.activeComposite.getId() !== composite.getId())) {
                    return winjs_base_1.TPromise.as(null);
                }
                // Check if composite already visible and just focus in that case
                if (_this.activeComposite && _this.activeComposite.getId() === composite.getId()) {
                    if (focus) {
                        composite.focus();
                    }
                    // Fullfill promise with composite that is being opened
                    return winjs_base_1.TPromise.as(composite);
                }
                // Show Composite and Focus
                return _this.showComposite(composite).then(function () {
                    if (focus) {
                        composite.focus();
                    }
                    // Fullfill promise with composite that is being opened
                    return composite;
                });
            }).then(function (composite) {
                if (composite) {
                    _this._onDidCompositeOpen.fire(composite);
                }
                return composite;
            });
        };
        CompositePart.prototype.createComposite = function (id, isActive) {
            var _this = this;
            // Check if composite is already created
            for (var i = 0; i < this.instantiatedComposites.length; i++) {
                if (this.instantiatedComposites[i].getId() === id) {
                    return this.instantiatedComposites[i];
                }
            }
            // Instantiate composite from registry otherwise
            var compositeDescriptor = this.registry.getComposite(id);
            if (compositeDescriptor) {
                var progressService = this.instantiationService.createInstance(progressService_1.WorkbenchProgressService, this.progressBar, compositeDescriptor.id, isActive);
                var compositeInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([progress_1.IProgressService, progressService]));
                var composite_1 = compositeDescriptor.instantiate(compositeInstantiationService);
                this.mapProgressServiceToComposite[composite_1.getId()] = progressService;
                // Remember as Instantiated
                this.instantiatedComposites.push(composite_1);
                // Register to title area update events from the composite
                this.instantiatedCompositeListeners.push(composite_1.onTitleAreaUpdate(function () { return _this.onTitleAreaUpdate(composite_1.getId()); }));
                return composite_1;
            }
            throw new Error(strings.format('Unable to find composite with id {0}', id));
        };
        CompositePart.prototype.showComposite = function (composite) {
            var _this = this;
            // Remember Composite
            this.activeComposite = composite;
            // Store in preferences
            var id = this.activeComposite.getId();
            if (id !== this.defaultCompositeId) {
                this.storageService.store(this.activeCompositeSettingsKey, id, storage_1.StorageScope.WORKSPACE);
            }
            else {
                this.storageService.remove(this.activeCompositeSettingsKey, storage_1.StorageScope.WORKSPACE);
            }
            // Remember
            this.lastActiveCompositeId = this.activeComposite.getId();
            var createCompositePromise;
            // Composites created for the first time
            var compositeContainer = this.mapCompositeToCompositeContainer[composite.getId()];
            if (!compositeContainer) {
                // Build Container off-DOM
                compositeContainer = builder_1.$().div({
                    'class': ['composite', this.compositeCSSClass],
                    id: composite.getId()
                }, function (div) {
                    createCompositePromise = composite.create(div).then(function () {
                        composite.updateStyles();
                    });
                });
                // Remember composite container
                this.mapCompositeToCompositeContainer[composite.getId()] = compositeContainer;
            }
            else {
                createCompositePromise = winjs_base_1.TPromise.as(null);
            }
            // Report progress for slow loading composites (but only if we did not create the composites before already)
            var progressService = this.mapProgressServiceToComposite[composite.getId()];
            if (progressService && !compositeContainer) {
                this.mapProgressServiceToComposite[composite.getId()].showWhile(createCompositePromise, this.partService.isCreated() ? 800 : 3200 /* less ugly initial startup */);
            }
            // Fill Content and Actions
            return createCompositePromise.then(function () {
                // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
                if (!_this.activeComposite || composite.getId() !== _this.activeComposite.getId()) {
                    return void 0;
                }
                // Take Composite on-DOM and show
                compositeContainer.build(_this.getContentArea());
                compositeContainer.show();
                // Setup action runner
                _this.toolBar.actionRunner = composite.getActionRunner();
                // Update title with composite title if it differs from descriptor
                var descriptor = _this.registry.getComposite(composite.getId());
                if (descriptor && descriptor.name !== composite.getTitle()) {
                    _this.updateTitle(composite.getId(), composite.getTitle());
                }
                // Handle Composite Actions
                var actionsBinding = _this.mapActionsBindingToComposite[composite.getId()];
                if (!actionsBinding) {
                    actionsBinding = _this.collectCompositeActions(composite);
                    _this.mapActionsBindingToComposite[composite.getId()] = actionsBinding;
                }
                actionsBinding();
                if (_this.telemetryActionsListener) {
                    _this.telemetryActionsListener.dispose();
                    _this.telemetryActionsListener = null;
                }
                // Action Run Handling
                _this.telemetryActionsListener = _this.toolBar.actionRunner.onDidRun(function (e) {
                    // Check for Error
                    if (e.error && !errors.isPromiseCanceledError(e.error)) {
                        _this.messageService.show(message_1.Severity.Error, e.error);
                    }
                    // Log in telemetry
                    if (_this.telemetryService) {
                        /* __GDPR__
                            "workbenchActionExecuted" : {
                                "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                            }
                        */
                        _this.telemetryService.publicLog('workbenchActionExecuted', { id: e.action.id, from: _this.nameForTelemetry });
                    }
                });
                // Indicate to composite that it is now visible
                return composite.setVisible(true).then(function () {
                    // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
                    if (!_this.activeComposite || composite.getId() !== _this.activeComposite.getId()) {
                        return;
                    }
                    // Make sure the composite is layed out
                    if (_this.contentAreaSize) {
                        composite.layout(_this.contentAreaSize);
                    }
                });
            }, function (error) { return _this.onError(error); });
        };
        CompositePart.prototype.onTitleAreaUpdate = function (compositeId) {
            // Active Composite
            if (this.activeComposite && this.activeComposite.getId() === compositeId) {
                // Title
                this.updateTitle(this.activeComposite.getId(), this.activeComposite.getTitle());
                // Actions
                var actionsBinding = this.collectCompositeActions(this.activeComposite);
                this.mapActionsBindingToComposite[this.activeComposite.getId()] = actionsBinding;
                actionsBinding();
            }
            else {
                delete this.mapActionsBindingToComposite[compositeId];
            }
        };
        CompositePart.prototype.updateTitle = function (compositeId, compositeTitle) {
            var compositeDescriptor = this.registry.getComposite(compositeId);
            if (!compositeDescriptor || !this.titleLabel) {
                return;
            }
            if (!compositeTitle) {
                compositeTitle = compositeDescriptor.name;
            }
            var keybinding = this.keybindingService.lookupKeybinding(compositeId);
            this.titleLabel.updateTitle(compositeId, compositeTitle, keybinding ? keybinding.getLabel() : undefined);
            this.toolBar.setAriaLabel(nls.localize('ariaCompositeToolbarLabel', "{0} actions", compositeTitle));
        };
        CompositePart.prototype.collectCompositeActions = function (composite) {
            // From Composite
            var primaryActions = composite.getActions().slice(0);
            var secondaryActions = composite.getSecondaryActions().slice(0);
            // From Part
            primaryActions.push.apply(primaryActions, this.getActions());
            secondaryActions.push.apply(secondaryActions, this.getSecondaryActions());
            // Return fn to set into toolbar
            return this.toolBar.setActions(actions_1.prepareActions(primaryActions), actions_1.prepareActions(secondaryActions));
        };
        CompositePart.prototype.getActiveComposite = function () {
            return this.activeComposite;
        };
        CompositePart.prototype.getLastActiveCompositetId = function () {
            return this.lastActiveCompositeId;
        };
        CompositePart.prototype.hideActiveComposite = function () {
            var _this = this;
            if (!this.activeComposite) {
                return winjs_base_1.TPromise.as(null); // Nothing to do
            }
            var composite = this.activeComposite;
            this.activeComposite = null;
            var compositeContainer = this.mapCompositeToCompositeContainer[composite.getId()];
            // Indicate to Composite
            return composite.setVisible(false).then(function () {
                // Take Container Off-DOM and hide
                compositeContainer.offDOM();
                compositeContainer.hide();
                // Clear any running Progress
                _this.progressBar.stop().getContainer().hide();
                // Empty Actions
                _this.toolBar.setActions([])();
                _this._onDidCompositeClose.fire(composite);
                return composite;
            });
        };
        CompositePart.prototype.createTitleArea = function (parent) {
            var _this = this;
            // Title Area Container
            var titleArea = builder_1.$(parent).div({
                'class': ['composite', 'title']
            });
            builder_1.$(titleArea).on(DOM.EventType.CONTEXT_MENU, function (e) { return _this.onTitleAreaContextMenu(new mouseEvent_1.StandardMouseEvent(e)); });
            // Left Title Label
            this.titleLabel = this.createTitleLabel(titleArea);
            // Right Actions Container
            builder_1.$(titleArea).div({
                'class': 'title-actions'
            }, function (div) {
                // Toolbar
                _this.toolBar = new toolbar_1.ToolBar(div.getHTMLElement(), _this.contextMenuService, {
                    actionItemProvider: function (action) { return _this.actionItemProvider(action); },
                    orientation: actionbar_1.ActionsOrientation.HORIZONTAL,
                    getKeyBinding: function (action) { return _this.keybindingService.lookupKeybinding(action.id); }
                });
            });
            return titleArea;
        };
        CompositePart.prototype.createTitleLabel = function (parent) {
            var titleLabel;
            builder_1.$(parent).div({
                'class': 'title-label'
            }, function (div) {
                titleLabel = div.span();
            });
            var $this = this;
            return {
                updateTitle: function (id, title, keybinding) {
                    titleLabel.safeInnerHtml(title);
                    titleLabel.title(keybinding ? nls.localize('titleTooltip', "{0} ({1})", title, keybinding) : title);
                },
                updateStyles: function () {
                    titleLabel.style('color', $this.getColor($this.titleForegroundColor));
                }
            };
        };
        CompositePart.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            // Forward to title label
            this.titleLabel.updateStyles();
        };
        CompositePart.prototype.onTitleAreaContextMenu = function (event) {
            var _this = this;
            if (this.activeComposite) {
                var contextMenuActions_1 = this.getTitleAreaContextMenuActions();
                if (contextMenuActions_1.length) {
                    var anchor_1 = { x: event.posx, y: event.posy };
                    this.contextMenuService.showContextMenu({
                        getAnchor: function () { return anchor_1; },
                        getActions: function () { return winjs_base_1.TPromise.as(contextMenuActions_1); },
                        getActionItem: function (action) { return _this.actionItemProvider(action); },
                        actionRunner: this.activeComposite.getActionRunner(),
                        getKeyBinding: function (action) { return _this.keybindingService.lookupKeybinding(action.id); }
                    });
                }
            }
        };
        CompositePart.prototype.getTitleAreaContextMenuActions = function () {
            return this.activeComposite ? this.activeComposite.getContextMenuActions() : [];
        };
        CompositePart.prototype.actionItemProvider = function (action) {
            // Check Active Composite
            if (this.activeComposite) {
                return this.activeComposite.getActionItem(action);
            }
            return undefined;
        };
        CompositePart.prototype.createContentArea = function (parent) {
            var _this = this;
            return builder_1.$(parent).div({
                'class': 'content'
            }, function (div) {
                _this.progressBar = new progressbar_1.ProgressBar(div);
                _this.toUnbind.push(styler_1.attachProgressBarStyler(_this.progressBar, _this.themeService));
                _this.progressBar.getContainer().hide();
            });
        };
        CompositePart.prototype.onError = function (error) {
            this.messageService.show(message_1.Severity.Error, types.isString(error) ? new Error(error) : error);
        };
        CompositePart.prototype.getProgressIndicator = function (id) {
            return this.mapProgressServiceToComposite[id];
        };
        CompositePart.prototype.getActions = function () {
            return [];
        };
        CompositePart.prototype.getSecondaryActions = function () {
            return [];
        };
        CompositePart.prototype.layout = function (dimension) {
            // Pass to super
            var sizes = _super.prototype.layout.call(this, dimension);
            // Pass Contentsize to composite
            this.contentAreaSize = sizes[1];
            if (this.activeComposite) {
                this.activeComposite.layout(this.contentAreaSize);
            }
            return sizes;
        };
        CompositePart.prototype.shutdown = function () {
            this.instantiatedComposites.forEach(function (i) { return i.shutdown(); });
            _super.prototype.shutdown.call(this);
        };
        CompositePart.prototype.dispose = function () {
            this.mapCompositeToCompositeContainer = null;
            this.mapProgressServiceToComposite = null;
            this.mapActionsBindingToComposite = null;
            for (var i = 0; i < this.instantiatedComposites.length; i++) {
                this.instantiatedComposites[i].dispose();
            }
            this.instantiatedComposites = [];
            this.instantiatedCompositeListeners = lifecycle_1.dispose(this.instantiatedCompositeListeners);
            this.progressBar.dispose();
            this.toolBar.dispose();
            // Super Dispose
            _super.prototype.dispose.call(this);
        };
        return CompositePart;
    }(part_1.Part));
    exports.CompositePart = CompositePart;
});
