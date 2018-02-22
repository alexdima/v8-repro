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
define(["require", "exports", "vs/base/browser/ui/list/listWidget", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/base/browser/ui/list/listPaging", "vs/base/parts/tree/browser/treeImpl", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/workbench/common/contextkeys", "vs/platform/configuration/common/configuration", "vs/base/common/objects", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/base/parts/tree/browser/treeDefaults", "vs/base/common/types", "vs/base/common/event"], function (require, exports, listWidget_1, instantiation_1, lifecycle_1, contextkey_1, listPaging_1, treeImpl_1, styler_1, themeService_1, contextkeys_1, configuration_1, objects_1, nls_1, platform_1, configurationRegistry_1, treeDefaults_1, types_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IListService = instantiation_1.createDecorator('listService');
    var ListService = /** @class */ (function () {
        function ListService(contextKeyService) {
            this.lists = [];
            this._lastFocusedWidget = undefined;
        }
        Object.defineProperty(ListService.prototype, "lastFocusedList", {
            get: function () {
                return this._lastFocusedWidget;
            },
            enumerable: true,
            configurable: true
        });
        ListService.prototype.register = function (widget, extraContextKeys) {
            var _this = this;
            if (this.lists.some(function (l) { return l.widget === widget; })) {
                throw new Error('Cannot register the same widget multiple times');
            }
            // Keep in our lists list
            var registeredList = { widget: widget, extraContextKeys: extraContextKeys };
            this.lists.push(registeredList);
            // Check for currently being focused
            if (widget.isDOMFocused()) {
                this._lastFocusedWidget = widget;
            }
            var result = lifecycle_1.combinedDisposable([
                widget.onDidFocus(function () { return _this._lastFocusedWidget = widget; }),
                lifecycle_1.toDisposable(function () { return _this.lists.splice(_this.lists.indexOf(registeredList), 1); })
            ]);
            return result;
        };
        ListService = __decorate([
            __param(0, contextkey_1.IContextKeyService)
        ], ListService);
        return ListService;
    }());
    exports.ListService = ListService;
    var RawWorkbenchListFocusContextKey = new contextkey_1.RawContextKey('listFocus', true);
    exports.WorkbenchListSupportsMultiSelectContextKey = new contextkey_1.RawContextKey('listSupportsMultiselect', true);
    exports.WorkbenchListFocusContextKey = contextkey_1.ContextKeyExpr.and(RawWorkbenchListFocusContextKey, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey));
    exports.WorkbenchListDoubleSelection = new contextkey_1.RawContextKey('listDoubleSelection', false);
    exports.WorkbenchListMultiSelection = new contextkey_1.RawContextKey('listMultiSelection', false);
    function createScopedContextKeyService(contextKeyService, widget) {
        var result = contextKeyService.createScoped(widget.getHTMLElement());
        if (widget instanceof listWidget_1.List || widget instanceof listPaging_1.PagedList) {
            exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(result);
        }
        RawWorkbenchListFocusContextKey.bindTo(result);
        return result;
    }
    exports.multiSelectModifierSettingKey = 'workbench.list.multiSelectModifier';
    exports.openModeSettingKey = 'workbench.list.openMode';
    function useAltAsMultipleSelectionModifier(configurationService) {
        return configurationService.getValue(exports.multiSelectModifierSettingKey) === 'alt';
    }
    function useSingleClickToOpen(configurationService) {
        return configurationService.getValue(exports.openModeSettingKey) !== 'doubleClick';
    }
    var MultipleSelectionController = /** @class */ (function () {
        function MultipleSelectionController(configurationService) {
            this.configurationService = configurationService;
        }
        MultipleSelectionController.prototype.isSelectionSingleChangeEvent = function (event) {
            if (useAltAsMultipleSelectionModifier(this.configurationService)) {
                return event.browserEvent.altKey;
            }
            return listWidget_1.isSelectionSingleChangeEvent(event);
        };
        MultipleSelectionController.prototype.isSelectionRangeChangeEvent = function (event) {
            return listWidget_1.isSelectionRangeChangeEvent(event);
        };
        return MultipleSelectionController;
    }());
    var WorkbenchOpenController = /** @class */ (function () {
        function WorkbenchOpenController(configurationService) {
            this.configurationService = configurationService;
        }
        WorkbenchOpenController.prototype.shouldOpen = function (event) {
            if (event instanceof MouseEvent) {
                var isDoubleClick = event.detail === 2;
                if (!useSingleClickToOpen(this.configurationService) && !isDoubleClick) {
                    return false;
                }
                return event.button === 0 /* left mouse button */ || event.button === 1 /* middle mouse button */;
            }
            return true;
        };
        return WorkbenchOpenController;
    }());
    function handleListControllers(options, configurationService) {
        if (options.multipleSelectionSupport !== false && !options.multipleSelectionController) {
            options.multipleSelectionController = new MultipleSelectionController(configurationService);
        }
        options.openController = new WorkbenchOpenController(configurationService);
        return options;
    }
    function handleTreeController(configuration, instantiationService) {
        if (!configuration.controller) {
            configuration.controller = instantiationService.createInstance(WorkbenchTreeController, {});
        }
        return configuration;
    }
    var WorkbenchList = /** @class */ (function (_super) {
        __extends(WorkbenchList, _super);
        function WorkbenchList(container, delegate, renderers, options, contextKeyService, listService, themeService, configurationService) {
            var _this = _super.call(this, container, delegate, renderers, objects_1.mixin(handleListControllers(options, configurationService), { keyboardSupport: false, selectOnMouseDown: true }, false)) || this;
            _this.configurationService = configurationService;
            _this.contextKeyService = createScopedContextKeyService(contextKeyService, _this);
            _this.listDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(_this.contextKeyService);
            _this.listMultiSelection = exports.WorkbenchListMultiSelection.bindTo(_this.contextKeyService);
            _this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            _this.disposables.push(lifecycle_1.combinedDisposable([
                _this.contextKeyService,
                listService.register(_this),
                styler_1.attachListStyler(_this, themeService),
                _this.onSelectionChange(function () {
                    var selection = _this.getSelection();
                    _this.listMultiSelection.set(selection.length > 1);
                    _this.listDoubleSelection.set(selection.length === 2);
                })
            ]));
            _this.registerListeners();
            return _this;
        }
        Object.defineProperty(WorkbenchList.prototype, "useAltAsMultipleSelectionModifier", {
            get: function () {
                return this._useAltAsMultipleSelectionModifier;
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchList.prototype.registerListeners = function () {
            var _this = this;
            this.disposables.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(exports.multiSelectModifierSettingKey)) {
                    _this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(_this.configurationService);
                }
            }));
        };
        WorkbenchList = __decorate([
            __param(4, contextkey_1.IContextKeyService),
            __param(5, exports.IListService),
            __param(6, themeService_1.IThemeService),
            __param(7, configuration_1.IConfigurationService)
        ], WorkbenchList);
        return WorkbenchList;
    }(listWidget_1.List));
    exports.WorkbenchList = WorkbenchList;
    var WorkbenchPagedList = /** @class */ (function (_super) {
        __extends(WorkbenchPagedList, _super);
        function WorkbenchPagedList(container, delegate, renderers, options, contextKeyService, listService, themeService, configurationService) {
            var _this = _super.call(this, container, delegate, renderers, objects_1.mixin(handleListControllers(options, configurationService), { keyboardSupport: false, selectOnMouseDown: true }, false)) || this;
            _this.configurationService = configurationService;
            _this.disposables = [];
            _this.contextKeyService = createScopedContextKeyService(contextKeyService, _this);
            _this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            _this.disposables.push(lifecycle_1.combinedDisposable([
                _this.contextKeyService,
                listService.register(_this),
                styler_1.attachListStyler(_this, themeService)
            ]));
            _this.registerListeners();
            return _this;
        }
        Object.defineProperty(WorkbenchPagedList.prototype, "useAltAsMultipleSelectionModifier", {
            get: function () {
                return this._useAltAsMultipleSelectionModifier;
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchPagedList.prototype.registerListeners = function () {
            var _this = this;
            this.disposables.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(exports.multiSelectModifierSettingKey)) {
                    _this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(_this.configurationService);
                }
            }));
        };
        WorkbenchPagedList.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        WorkbenchPagedList = __decorate([
            __param(4, contextkey_1.IContextKeyService),
            __param(5, exports.IListService),
            __param(6, themeService_1.IThemeService),
            __param(7, configuration_1.IConfigurationService)
        ], WorkbenchPagedList);
        return WorkbenchPagedList;
    }(listPaging_1.PagedList));
    exports.WorkbenchPagedList = WorkbenchPagedList;
    var WorkbenchTree = /** @class */ (function (_super) {
        __extends(WorkbenchTree, _super);
        function WorkbenchTree(container, configuration, options, contextKeyService, listService, themeService, instantiationService, configurationService) {
            var _this = _super.call(this, container, handleTreeController(configuration, instantiationService), objects_1.mixin(options, { keyboardSupport: false }, false)) || this;
            _this.configurationService = configurationService;
            _this.disposables = [];
            _this.contextKeyService = createScopedContextKeyService(contextKeyService, _this);
            _this.listDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(_this.contextKeyService);
            _this.listMultiSelection = exports.WorkbenchListMultiSelection.bindTo(_this.contextKeyService);
            _this._openOnSingleClick = useSingleClickToOpen(configurationService);
            _this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            _this.disposables.push(_this.contextKeyService, listService.register(_this), styler_1.attachListStyler(_this, themeService));
            _this.registerListeners();
            return _this;
        }
        Object.defineProperty(WorkbenchTree.prototype, "openOnSingleClick", {
            get: function () {
                return this._openOnSingleClick;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkbenchTree.prototype, "useAltAsMultipleSelectionModifier", {
            get: function () {
                return this._useAltAsMultipleSelectionModifier;
            },
            enumerable: true,
            configurable: true
        });
        WorkbenchTree.prototype.registerListeners = function () {
            var _this = this;
            this.disposables.push(this.onDidChangeSelection(function () {
                var selection = _this.getSelection();
                _this.listDoubleSelection.set(selection && selection.length === 2);
                _this.listMultiSelection.set(selection && selection.length > 1);
            }));
            this.disposables.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(exports.openModeSettingKey)) {
                    _this._openOnSingleClick = useSingleClickToOpen(_this.configurationService);
                }
                if (e.affectsConfiguration(exports.multiSelectModifierSettingKey)) {
                    _this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(_this.configurationService);
                }
            }));
        };
        WorkbenchTree.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        WorkbenchTree = __decorate([
            __param(3, contextkey_1.IContextKeyService),
            __param(4, exports.IListService),
            __param(5, themeService_1.IThemeService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, configuration_1.IConfigurationService)
        ], WorkbenchTree);
        return WorkbenchTree;
    }(treeImpl_1.Tree));
    exports.WorkbenchTree = WorkbenchTree;
    function massageControllerOptions(options) {
        if (typeof options.keyboardSupport !== 'boolean') {
            options.keyboardSupport = false;
        }
        if (typeof options.clickBehavior !== 'number') {
            options.clickBehavior = treeDefaults_1.ClickBehavior.ON_MOUSE_DOWN;
        }
        return options;
    }
    var WorkbenchTreeController = /** @class */ (function (_super) {
        __extends(WorkbenchTreeController, _super);
        function WorkbenchTreeController(options, configurationService) {
            var _this = _super.call(this, massageControllerOptions(options)) || this;
            _this.configurationService = configurationService;
            _this.disposables = [];
            // if the open mode is not set, we configure it based on settings
            if (types_1.isUndefinedOrNull(options.openMode)) {
                _this.setOpenMode(_this.getOpenModeSetting());
                _this.registerListeners();
            }
            return _this;
        }
        WorkbenchTreeController.prototype.registerListeners = function () {
            var _this = this;
            this.disposables.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(exports.openModeSettingKey)) {
                    _this.setOpenMode(_this.getOpenModeSetting());
                }
            }));
        };
        WorkbenchTreeController.prototype.getOpenModeSetting = function () {
            return useSingleClickToOpen(this.configurationService) ? treeDefaults_1.OpenMode.SINGLE_CLICK : treeDefaults_1.OpenMode.DOUBLE_CLICK;
        };
        WorkbenchTreeController.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        WorkbenchTreeController = __decorate([
            __param(1, configuration_1.IConfigurationService)
        ], WorkbenchTreeController);
        return WorkbenchTreeController;
    }(treeDefaults_1.DefaultController));
    exports.WorkbenchTreeController = WorkbenchTreeController;
    var TreeResourceNavigator = /** @class */ (function (_super) {
        __extends(TreeResourceNavigator, _super);
        function TreeResourceNavigator(tree, options) {
            var _this = _super.call(this) || this;
            _this.tree = tree;
            _this.options = options;
            _this._openResource = new event_1.Emitter();
            _this.openResource = _this._openResource.event;
            _this.registerListeners();
            return _this;
        }
        TreeResourceNavigator.prototype.registerListeners = function () {
            var _this = this;
            if (this.options && this.options.openOnFocus) {
                this._register(this.tree.onDidChangeFocus(function (e) { return _this.onFocus(e); }));
            }
            this._register(this.tree.onDidChangeSelection(function (e) { return _this.onSelection(e); }));
        };
        TreeResourceNavigator.prototype.onFocus = function (_a) {
            var payload = _a.payload;
            var element = this.tree.getFocus();
            this.tree.setSelection([element], { fromFocus: true });
            var originalEvent = payload && payload.originalEvent;
            var isMouseEvent = payload && payload.origin === 'mouse';
            var isDoubleClick = isMouseEvent && originalEvent && originalEvent.detail === 2;
            if (!isMouseEvent || this.tree.openOnSingleClick || isDoubleClick) {
                this._openResource.fire({
                    editorOptions: {
                        preserveFocus: true,
                        pinned: false,
                        revealIfVisible: true
                    },
                    sideBySide: false,
                    element: element,
                    payload: payload
                });
            }
        };
        TreeResourceNavigator.prototype.onSelection = function (_a) {
            var payload = _a.payload;
            if (payload && payload.fromFocus) {
                return;
            }
            var originalEvent = payload && payload.originalEvent;
            var isMouseEvent = payload && payload.origin === 'mouse';
            var isDoubleClick = isMouseEvent && originalEvent && originalEvent.detail === 2;
            if (!isMouseEvent || this.tree.openOnSingleClick || isDoubleClick) {
                if (isDoubleClick && originalEvent) {
                    originalEvent.preventDefault(); // focus moves to editor, we need to prevent default
                }
                var isFromKeyboard = payload && payload.origin === 'keyboard';
                var sideBySide = (originalEvent && (originalEvent.ctrlKey || originalEvent.metaKey || originalEvent.altKey));
                var preserveFocus = !((isFromKeyboard && (!payload || !payload.preserveFocus)) || isDoubleClick || (payload && payload.focusEditor));
                this._openResource.fire({
                    editorOptions: {
                        preserveFocus: preserveFocus,
                        pinned: isDoubleClick,
                        revealIfVisible: true
                    },
                    sideBySide: sideBySide,
                    element: this.tree.getSelection()[0],
                    payload: payload
                });
            }
        };
        return TreeResourceNavigator;
    }(lifecycle_1.Disposable));
    exports.TreeResourceNavigator = TreeResourceNavigator;
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'workbench',
        'order': 7,
        'title': nls_1.localize('workbenchConfigurationTitle', "Workbench"),
        'type': 'object',
        'properties': {
            'workbench.list.multiSelectModifier': {
                'type': 'string',
                'enum': ['ctrlCmd', 'alt'],
                'enumDescriptions': [
                    nls_1.localize('multiSelectModifier.ctrlCmd', "Maps to `Control` on Windows and Linux and to `Command` on macOS."),
                    nls_1.localize('multiSelectModifier.alt', "Maps to `Alt` on Windows and Linux and to `Option` on macOS.")
                ],
                'default': 'ctrlCmd',
                'description': nls_1.localize({
                    key: 'multiSelectModifier',
                    comment: [
                        '- `ctrlCmd` refers to a value the setting can take and should not be localized.',
                        '- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized.'
                    ]
                }, "The modifier to be used to add an item in trees and lists to a multi-selection with the mouse (for example in the explorer, open editors and scm view). `ctrlCmd` maps to `Control` on Windows and Linux and to `Command` on macOS. The 'Open to Side' mouse gestures - if supported - will adapt such that they do not conflict with the multiselect modifier.")
            },
            'workbench.list.openMode': {
                'type': 'string',
                'enum': ['singleClick', 'doubleClick'],
                'enumDescriptions': [
                    nls_1.localize('openMode.singleClick', "Opens items on mouse single click."),
                    nls_1.localize('openMode.doubleClick', "Open items on mouse double click.")
                ],
                'default': 'singleClick',
                'description': nls_1.localize({
                    key: 'openModeModifier',
                    comment: ['`singleClick` and `doubleClick` refers to a value the setting can take and should not be localized.']
                }, "Controls how to open items in trees and lists using the mouse (if supported). Set to `singleClick` to open items with a single mouse click and `doubleClick` to only open via mouse double click. For parents with children in trees, this setting will control if a single click expands the parent or a double click. Note that some trees and lists might choose to ignore this setting if it is not applicable. ")
            }
        }
    });
});
