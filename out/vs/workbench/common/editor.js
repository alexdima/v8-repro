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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/event", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/base/common/network"], function (require, exports, winjs_base_1, event_1, objects, types, lifecycle_1, contextkey_1, platform_1, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextCompareEditorVisible = new contextkey_1.RawContextKey('textCompareEditorVisible', false);
    var ConfirmResult;
    (function (ConfirmResult) {
        ConfirmResult[ConfirmResult["SAVE"] = 0] = "SAVE";
        ConfirmResult[ConfirmResult["DONT_SAVE"] = 1] = "DONT_SAVE";
        ConfirmResult[ConfirmResult["CANCEL"] = 2] = "CANCEL";
    })(ConfirmResult = exports.ConfirmResult || (exports.ConfirmResult = {}));
    /**
     * Text diff editor id.
     */
    exports.TEXT_DIFF_EDITOR_ID = 'workbench.editors.textDiffEditor';
    /**
     * Binary diff editor id.
     */
    exports.BINARY_DIFF_EDITOR_ID = 'workbench.editors.binaryResourceDiffEditor';
    /**
     * Editor inputs are lightweight objects that can be passed to the workbench API to open inside the editor part.
     * Each editor input is mapped to an editor that is capable of opening it through the Platform facade.
     */
    var EditorInput = /** @class */ (function () {
        function EditorInput() {
            this._onDidChangeDirty = new event_1.Emitter();
            this._onDidChangeLabel = new event_1.Emitter();
            this._onDispose = new event_1.Emitter();
            this.disposed = false;
        }
        Object.defineProperty(EditorInput.prototype, "onDidChangeDirty", {
            /**
             * Fired when the dirty state of this input changes.
             */
            get: function () {
                return this._onDidChangeDirty.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorInput.prototype, "onDidChangeLabel", {
            /**
             * Fired when the label this input changes.
             */
            get: function () {
                return this._onDidChangeLabel.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorInput.prototype, "onDispose", {
            /**
             * Fired when the model gets disposed.
             */
            get: function () {
                return this._onDispose.event;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Returns the associated resource of this input if any.
         */
        EditorInput.prototype.getResource = function () {
            return null;
        };
        /**
         * Returns the name of this input that can be shown to the user. Examples include showing the name of the input
         * above the editor area when the input is shown.
         */
        EditorInput.prototype.getName = function () {
            return null;
        };
        /**
         * Returns the description of this input that can be shown to the user. Examples include showing the description of
         * the input above the editor area to the side of the name of the input.
         */
        EditorInput.prototype.getDescription = function (verbosity) {
            return null;
        };
        EditorInput.prototype.getTitle = function (verbosity) {
            return this.getName();
        };
        /**
         * Returns the preferred editor for this input. A list of candidate editors is passed in that whee registered
         * for the input. This allows subclasses to decide late which editor to use for the input on a case by case basis.
         */
        EditorInput.prototype.getPreferredEditorId = function (candidates) {
            if (candidates && candidates.length > 0) {
                return candidates[0];
            }
            return null;
        };
        /**
         * Returns a descriptor suitable for telemetry events or null if none is available.
         *
         * Subclasses should extend if they can contribute.
         */
        EditorInput.prototype.getTelemetryDescriptor = function () {
            /* __GDPR__FRAGMENT__
                "EditorTelemetryDescriptor" : {
                    "typeId" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            return { typeId: this.getTypeId() };
        };
        /**
         * An editor that is dirty will be asked to be saved once it closes.
         */
        EditorInput.prototype.isDirty = function () {
            return false;
        };
        /**
         * Subclasses should bring up a proper dialog for the user if the editor is dirty and return the result.
         */
        EditorInput.prototype.confirmSave = function () {
            return winjs_base_1.TPromise.wrap(ConfirmResult.DONT_SAVE);
        };
        /**
         * Saves the editor if it is dirty. Subclasses return a promise with a boolean indicating the success of the operation.
         */
        EditorInput.prototype.save = function () {
            return winjs_base_1.TPromise.as(true);
        };
        /**
         * Reverts the editor if it is dirty. Subclasses return a promise with a boolean indicating the success of the operation.
         */
        EditorInput.prototype.revert = function (options) {
            return winjs_base_1.TPromise.as(true);
        };
        /**
         * Called when this input is no longer opened in any editor. Subclasses can free resources as needed.
         */
        EditorInput.prototype.close = function () {
            this.dispose();
        };
        /**
         * Subclasses can set this to false if it does not make sense to split the editor input.
         */
        EditorInput.prototype.supportsSplitEditor = function () {
            return true;
        };
        /**
         * Returns true if this input is identical to the otherInput.
         */
        EditorInput.prototype.matches = function (otherInput) {
            return this === otherInput;
        };
        /**
         * Called when an editor input is no longer needed. Allows to free up any resources taken by
         * resolving the editor input.
         */
        EditorInput.prototype.dispose = function () {
            this.disposed = true;
            this._onDispose.fire();
            this._onDidChangeDirty.dispose();
            this._onDidChangeLabel.dispose();
            this._onDispose.dispose();
        };
        /**
         * Returns whether this input was disposed or not.
         */
        EditorInput.prototype.isDisposed = function () {
            return this.disposed;
        };
        return EditorInput;
    }());
    exports.EditorInput = EditorInput;
    var EditorOpeningEvent = /** @class */ (function () {
        function EditorOpeningEvent(_input, _options, _position) {
            this._input = _input;
            this._options = _options;
            this._position = _position;
        }
        Object.defineProperty(EditorOpeningEvent.prototype, "input", {
            get: function () {
                return this._input;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorOpeningEvent.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditorOpeningEvent.prototype, "position", {
            get: function () {
                return this._position;
            },
            enumerable: true,
            configurable: true
        });
        EditorOpeningEvent.prototype.prevent = function (callback) {
            this.override = callback;
        };
        EditorOpeningEvent.prototype.isPrevented = function () {
            return this.override;
        };
        return EditorOpeningEvent;
    }());
    exports.EditorOpeningEvent = EditorOpeningEvent;
    var EncodingMode;
    (function (EncodingMode) {
        /**
         * Instructs the encoding support to encode the current input with the provided encoding
         */
        EncodingMode[EncodingMode["Encode"] = 0] = "Encode";
        /**
         * Instructs the encoding support to decode the current input with the provided encoding
         */
        EncodingMode[EncodingMode["Decode"] = 1] = "Decode";
    })(EncodingMode = exports.EncodingMode || (exports.EncodingMode = {}));
    /**
     * Side by side editor inputs that have a master and details side.
     */
    var SideBySideEditorInput = /** @class */ (function (_super) {
        __extends(SideBySideEditorInput, _super);
        function SideBySideEditorInput(name, description, _details, _master) {
            var _this = _super.call(this) || this;
            _this.name = name;
            _this.description = description;
            _this._details = _details;
            _this._master = _master;
            _this._toUnbind = [];
            _this.registerListeners();
            return _this;
        }
        Object.defineProperty(SideBySideEditorInput.prototype, "master", {
            get: function () {
                return this._master;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SideBySideEditorInput.prototype, "details", {
            get: function () {
                return this._details;
            },
            enumerable: true,
            configurable: true
        });
        SideBySideEditorInput.prototype.isDirty = function () {
            return this.master.isDirty();
        };
        SideBySideEditorInput.prototype.confirmSave = function () {
            return this.master.confirmSave();
        };
        SideBySideEditorInput.prototype.save = function () {
            return this.master.save();
        };
        SideBySideEditorInput.prototype.revert = function () {
            return this.master.revert();
        };
        SideBySideEditorInput.prototype.getTelemetryDescriptor = function () {
            var descriptor = this.master.getTelemetryDescriptor();
            return objects.assign(descriptor, _super.prototype.getTelemetryDescriptor.call(this));
        };
        SideBySideEditorInput.prototype.registerListeners = function () {
            var _this = this;
            // When the details or master input gets disposed, dispose this diff editor input
            var onceDetailsDisposed = event_1.once(this.details.onDispose);
            this._toUnbind.push(onceDetailsDisposed(function () {
                if (!_this.isDisposed()) {
                    _this.dispose();
                }
            }));
            var onceMasterDisposed = event_1.once(this.master.onDispose);
            this._toUnbind.push(onceMasterDisposed(function () {
                if (!_this.isDisposed()) {
                    _this.dispose();
                }
            }));
            // Reemit some events from the master side to the outside
            this._toUnbind.push(this.master.onDidChangeDirty(function () { return _this._onDidChangeDirty.fire(); }));
            this._toUnbind.push(this.master.onDidChangeLabel(function () { return _this._onDidChangeLabel.fire(); }));
        };
        Object.defineProperty(SideBySideEditorInput.prototype, "toUnbind", {
            get: function () {
                return this._toUnbind;
            },
            enumerable: true,
            configurable: true
        });
        SideBySideEditorInput.prototype.resolve = function (refresh) {
            return winjs_base_1.TPromise.as(null);
        };
        SideBySideEditorInput.prototype.getTypeId = function () {
            return SideBySideEditorInput.ID;
        };
        SideBySideEditorInput.prototype.getName = function () {
            return this.name;
        };
        SideBySideEditorInput.prototype.getDescription = function () {
            return this.description;
        };
        SideBySideEditorInput.prototype.supportsSplitEditor = function () {
            return false;
        };
        SideBySideEditorInput.prototype.matches = function (otherInput) {
            if (_super.prototype.matches.call(this, otherInput) === true) {
                return true;
            }
            if (otherInput) {
                if (!(otherInput instanceof SideBySideEditorInput)) {
                    return false;
                }
                var otherDiffInput = otherInput;
                return this.details.matches(otherDiffInput.details) && this.master.matches(otherDiffInput.master);
            }
            return false;
        };
        SideBySideEditorInput.prototype.dispose = function () {
            this._toUnbind = lifecycle_1.dispose(this._toUnbind);
            _super.prototype.dispose.call(this);
        };
        SideBySideEditorInput.ID = 'workbench.editorinputs.sidebysideEditorInput';
        return SideBySideEditorInput;
    }(EditorInput));
    exports.SideBySideEditorInput = SideBySideEditorInput;
    /**
     * The editor model is the heavyweight counterpart of editor input. Depending on the editor input, it
     * connects to the disk to retrieve content and may allow for saving it back or reverting it. Editor models
     * are typically cached for some while because they are expensive to construct.
     */
    var EditorModel = /** @class */ (function (_super) {
        __extends(EditorModel, _super);
        function EditorModel() {
            var _this = _super.call(this) || this;
            _this._onDispose = new event_1.Emitter();
            return _this;
        }
        Object.defineProperty(EditorModel.prototype, "onDispose", {
            /**
             * Fired when the model gets disposed.
             */
            get: function () {
                return this._onDispose.event;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Causes this model to load returning a promise when loading is completed.
         */
        EditorModel.prototype.load = function () {
            return winjs_base_1.TPromise.as(this);
        };
        /**
         * Returns whether this model was loaded or not.
         */
        EditorModel.prototype.isResolved = function () {
            return true;
        };
        /**
         * Subclasses should implement to free resources that have been claimed through loading.
         */
        EditorModel.prototype.dispose = function () {
            this._onDispose.fire();
            this._onDispose.dispose();
            _super.prototype.dispose.call(this);
        };
        return EditorModel;
    }(lifecycle_1.Disposable));
    exports.EditorModel = EditorModel;
    /**
     * The editor options is the base class of options that can be passed in when opening an editor.
     */
    var EditorOptions = /** @class */ (function () {
        function EditorOptions() {
        }
        /**
         * Helper to create EditorOptions inline.
         */
        EditorOptions.create = function (settings) {
            var options = new EditorOptions();
            options.preserveFocus = settings.preserveFocus;
            options.forceOpen = settings.forceOpen;
            options.revealIfVisible = settings.revealIfVisible;
            options.revealIfOpened = settings.revealIfOpened;
            options.pinned = settings.pinned;
            options.index = settings.index;
            options.inactive = settings.inactive;
            return options;
        };
        return EditorOptions;
    }());
    exports.EditorOptions = EditorOptions;
    /**
     * Base Text Editor Options.
     */
    var TextEditorOptions = /** @class */ (function (_super) {
        __extends(TextEditorOptions, _super);
        function TextEditorOptions() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TextEditorOptions.from = function (input) {
            if (!input || !input.options) {
                return null;
            }
            return TextEditorOptions.create(input.options);
        };
        /**
         * Helper to convert options bag to real class
         */
        TextEditorOptions.create = function (options) {
            if (options === void 0) { options = Object.create(null); }
            var textEditorOptions = new TextEditorOptions();
            if (options.selection) {
                var selection = options.selection;
                textEditorOptions.selection(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
            }
            if (options.viewState) {
                textEditorOptions.editorViewState = options.viewState;
            }
            if (options.forceOpen) {
                textEditorOptions.forceOpen = true;
            }
            if (options.revealIfVisible) {
                textEditorOptions.revealIfVisible = true;
            }
            if (options.revealIfOpened) {
                textEditorOptions.revealIfOpened = true;
            }
            if (options.preserveFocus) {
                textEditorOptions.preserveFocus = true;
            }
            if (options.revealInCenterIfOutsideViewport) {
                textEditorOptions.revealInCenterIfOutsideViewport = true;
            }
            if (options.pinned) {
                textEditorOptions.pinned = true;
            }
            if (options.inactive) {
                textEditorOptions.inactive = true;
            }
            if (typeof options.index === 'number') {
                textEditorOptions.index = options.index;
            }
            return textEditorOptions;
        };
        /**
         * Returns if this options object has objects defined for the editor.
         */
        TextEditorOptions.prototype.hasOptionsDefined = function () {
            return !!this.editorViewState || (!types.isUndefinedOrNull(this.startLineNumber) && !types.isUndefinedOrNull(this.startColumn));
        };
        /**
         * Tells the editor to set show the given selection when the editor is being opened.
         */
        TextEditorOptions.prototype.selection = function (startLineNumber, startColumn, endLineNumber, endColumn) {
            if (endLineNumber === void 0) { endLineNumber = startLineNumber; }
            if (endColumn === void 0) { endColumn = startColumn; }
            this.startLineNumber = startLineNumber;
            this.startColumn = startColumn;
            this.endLineNumber = endLineNumber;
            this.endColumn = endColumn;
            return this;
        };
        /**
         * Create a TextEditorOptions inline to be used when the editor is opening.
         */
        TextEditorOptions.fromEditor = function (editor, settings) {
            var options = TextEditorOptions.create(settings);
            // View state
            options.editorViewState = editor.saveViewState();
            return options;
        };
        /**
         * Apply the view state or selection to the given editor.
         *
         * @return if something was applied
         */
        TextEditorOptions.prototype.apply = function (editor, scrollType) {
            // View state
            return this.applyViewState(editor, scrollType);
        };
        TextEditorOptions.prototype.applyViewState = function (editor, scrollType) {
            var gotApplied = false;
            // First try viewstate
            if (this.editorViewState) {
                editor.restoreViewState(this.editorViewState);
                gotApplied = true;
            }
            else if (!types.isUndefinedOrNull(this.startLineNumber) && !types.isUndefinedOrNull(this.startColumn)) {
                // Select
                if (!types.isUndefinedOrNull(this.endLineNumber) && !types.isUndefinedOrNull(this.endColumn)) {
                    var range = {
                        startLineNumber: this.startLineNumber,
                        startColumn: this.startColumn,
                        endLineNumber: this.endLineNumber,
                        endColumn: this.endColumn
                    };
                    editor.setSelection(range);
                    if (this.revealInCenterIfOutsideViewport) {
                        editor.revealRangeInCenterIfOutsideViewport(range, scrollType);
                    }
                    else {
                        editor.revealRangeInCenter(range, scrollType);
                    }
                }
                else {
                    var pos = {
                        lineNumber: this.startLineNumber,
                        column: this.startColumn
                    };
                    editor.setPosition(pos);
                    if (this.revealInCenterIfOutsideViewport) {
                        editor.revealPositionInCenterIfOutsideViewport(pos, scrollType);
                    }
                    else {
                        editor.revealPositionInCenter(pos, scrollType);
                    }
                }
                gotApplied = true;
            }
            return gotApplied;
        };
        return TextEditorOptions;
    }(EditorOptions));
    exports.TextEditorOptions = TextEditorOptions;
    exports.EditorOpenPositioning = {
        LEFT: 'left',
        RIGHT: 'right',
        FIRST: 'first',
        LAST: 'last'
    };
    exports.OPEN_POSITIONING_CONFIG = 'workbench.editor.openPositioning';
    exports.ActiveEditorMovePositioning = {
        FIRST: 'first',
        LAST: 'last',
        LEFT: 'left',
        RIGHT: 'right',
        CENTER: 'center',
        POSITION: 'position',
    };
    exports.ActiveEditorMovePositioningBy = {
        TAB: 'tab',
        GROUP: 'group'
    };
    exports.EditorCommands = {
        MoveActiveEditor: 'moveActiveEditor'
    };
    function toResource(editor, options) {
        if (!editor) {
            return null;
        }
        // Check for side by side if we are asked to
        if (options && options.supportSideBySide && editor instanceof SideBySideEditorInput) {
            editor = editor.master;
        }
        var resource = editor.getResource();
        if (!options || !options.filter) {
            return resource; // return early if no filter is specified
        }
        if (!resource) {
            return null;
        }
        var includeFiles;
        var includeUntitled;
        if (Array.isArray(options.filter)) {
            includeFiles = (options.filter.indexOf(network_1.Schemas.file) >= 0);
            includeUntitled = (options.filter.indexOf(network_1.Schemas.untitled) >= 0);
        }
        else {
            includeFiles = (options.filter === network_1.Schemas.file);
            includeUntitled = (options.filter === network_1.Schemas.untitled);
        }
        if (includeFiles && resource.scheme === network_1.Schemas.file) {
            return resource;
        }
        if (includeUntitled && resource.scheme === network_1.Schemas.untitled) {
            return resource;
        }
        return null;
    }
    exports.toResource = toResource;
    var EditorInputFactoryRegistry = /** @class */ (function () {
        function EditorInputFactoryRegistry() {
            this.editorInputFactoryConstructors = Object.create(null);
            this.editorInputFactoryInstances = Object.create(null);
        }
        EditorInputFactoryRegistry.prototype.setInstantiationService = function (service) {
            this.instantiationService = service;
            for (var key in this.editorInputFactoryConstructors) {
                var element = this.editorInputFactoryConstructors[key];
                this.createEditorInputFactory(key, element);
            }
            this.editorInputFactoryConstructors = {};
        };
        EditorInputFactoryRegistry.prototype.createEditorInputFactory = function (editorInputId, ctor) {
            var instance = this.instantiationService.createInstance(ctor);
            this.editorInputFactoryInstances[editorInputId] = instance;
        };
        EditorInputFactoryRegistry.prototype.registerFileInputFactory = function (factory) {
            this.fileInputFactory = factory;
        };
        EditorInputFactoryRegistry.prototype.getFileInputFactory = function () {
            return this.fileInputFactory;
        };
        EditorInputFactoryRegistry.prototype.registerEditorInputFactory = function (editorInputId, ctor) {
            if (!this.instantiationService) {
                this.editorInputFactoryConstructors[editorInputId] = ctor;
            }
            else {
                this.createEditorInputFactory(editorInputId, ctor);
            }
        };
        EditorInputFactoryRegistry.prototype.getEditorInputFactory = function (editorInputId) {
            return this.editorInputFactoryInstances[editorInputId];
        };
        return EditorInputFactoryRegistry;
    }());
    exports.Extensions = {
        EditorInputFactories: 'workbench.contributions.editor.inputFactories'
    };
    platform_1.Registry.add(exports.Extensions.EditorInputFactories, new EditorInputFactoryRegistry());
});
