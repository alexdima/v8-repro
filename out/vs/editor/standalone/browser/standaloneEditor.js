define(["require", "exports", "vs/editor/common/editorCommon", "vs/editor/browser/editorBrowser", "vs/editor/standalone/browser/standaloneCodeEditor", "vs/base/common/scrollable", "vs/editor/standalone/browser/standaloneServices", "vs/platform/opener/browser/openerService", "vs/platform/opener/common/opener", "vs/editor/standalone/browser/colorizer", "vs/editor/standalone/browser/simpleServices", "vs/editor/common/modes", "vs/editor/common/services/webWorker", "vs/editor/browser/widget/diffNavigator", "vs/platform/editor/common/editor", "vs/platform/commands/common/commands", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/services/codeEditorService", "vs/editor/common/services/editorWorkerService", "vs/editor/common/services/resolverService", "vs/editor/common/modes/nullMode", "vs/editor/standalone/common/standaloneThemeService", "vs/editor/common/config/fontInfo", "vs/editor/common/config/editorOptions", "vs/editor/common/controller/cursorEvents", "vs/platform/message/common/message", "vs/editor/common/model", "vs/css!./standalone-tokens"], function (require, exports, editorCommon, editorBrowser_1, standaloneCodeEditor_1, scrollable_1, standaloneServices_1, openerService_1, opener_1, colorizer_1, simpleServices_1, modes, webWorker_1, diffNavigator_1, editor_1, commands_1, contextView_1, instantiation_1, keybinding_1, contextkey_1, codeEditorService_1, editorWorkerService_1, resolverService_1, nullMode_1, standaloneThemeService_1, fontInfo_1, editorOptions, cursorEvents_1, message_1, model_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function withAllStandaloneServices(domElement, override, callback) {
        var services = new standaloneServices_1.DynamicStandaloneServices(domElement, override);
        // The editorService is a lovely beast. It needs to point back to the code editor instance...
        var simpleEditorService = null;
        if (!services.has(editor_1.IEditorService)) {
            simpleEditorService = new simpleServices_1.SimpleEditorService();
            services.set(editor_1.IEditorService, simpleEditorService);
        }
        var simpleEditorModelResolverService = null;
        if (!services.has(resolverService_1.ITextModelService)) {
            simpleEditorModelResolverService = new simpleServices_1.SimpleEditorModelResolverService();
            services.set(resolverService_1.ITextModelService, simpleEditorModelResolverService);
        }
        if (!services.has(opener_1.IOpenerService)) {
            services.set(opener_1.IOpenerService, new openerService_1.OpenerService(services.get(editor_1.IEditorService), services.get(commands_1.ICommandService)));
        }
        var result = callback(services);
        if (simpleEditorService) {
            simpleEditorService.setEditor(result);
        }
        if (simpleEditorModelResolverService) {
            simpleEditorModelResolverService.setEditor(result);
        }
        return result;
    }
    /**
     * Create a new editor under `domElement`.
     * `domElement` should be empty (not contain other dom nodes).
     * The editor will read the size of `domElement`.
     */
    function create(domElement, options, override) {
        return withAllStandaloneServices(domElement, override, function (services) {
            return new standaloneCodeEditor_1.StandaloneEditor(domElement, options, services, services.get(instantiation_1.IInstantiationService), services.get(codeEditorService_1.ICodeEditorService), services.get(commands_1.ICommandService), services.get(contextkey_1.IContextKeyService), services.get(keybinding_1.IKeybindingService), services.get(contextView_1.IContextViewService), services.get(standaloneThemeService_1.IStandaloneThemeService));
        });
    }
    exports.create = create;
    /**
     * Emitted when an editor is created.
     * Creating a diff editor might cause this listener to be invoked with the two editors.
     * @event
     */
    function onDidCreateEditor(listener) {
        return standaloneServices_1.StaticServices.codeEditorService.get().onCodeEditorAdd(function (editor) {
            listener(editor);
        });
    }
    exports.onDidCreateEditor = onDidCreateEditor;
    /**
     * Create a new diff editor under `domElement`.
     * `domElement` should be empty (not contain other dom nodes).
     * The editor will read the size of `domElement`.
     */
    function createDiffEditor(domElement, options, override) {
        return withAllStandaloneServices(domElement, override, function (services) {
            return new standaloneCodeEditor_1.StandaloneDiffEditor(domElement, options, services, services.get(instantiation_1.IInstantiationService), services.get(contextkey_1.IContextKeyService), services.get(keybinding_1.IKeybindingService), services.get(contextView_1.IContextViewService), services.get(editorWorkerService_1.IEditorWorkerService), services.get(codeEditorService_1.ICodeEditorService), services.get(standaloneThemeService_1.IStandaloneThemeService), services.get(message_1.IMessageService));
        });
    }
    exports.createDiffEditor = createDiffEditor;
    function createDiffNavigator(diffEditor, opts) {
        return new diffNavigator_1.DiffNavigator(diffEditor, opts);
    }
    exports.createDiffNavigator = createDiffNavigator;
    function doCreateModel(value, mode, uri) {
        return standaloneServices_1.StaticServices.modelService.get().createModel(value, mode, uri);
    }
    /**
     * Create a new editor model.
     * You can specify the language that should be set for this model or let the language be inferred from the `uri`.
     */
    function createModel(value, language, uri) {
        value = value || '';
        if (!language) {
            var path = uri ? uri.path : null;
            var firstLF = value.indexOf('\n');
            var firstLine = value;
            if (firstLF !== -1) {
                firstLine = value.substring(0, firstLF);
            }
            return doCreateModel(value, standaloneServices_1.StaticServices.modeService.get().getOrCreateModeByFilenameOrFirstLine(path, firstLine), uri);
        }
        return doCreateModel(value, standaloneServices_1.StaticServices.modeService.get().getOrCreateMode(language), uri);
    }
    exports.createModel = createModel;
    /**
     * Change the language for a model.
     */
    function setModelLanguage(model, language) {
        standaloneServices_1.StaticServices.modelService.get().setMode(model, standaloneServices_1.StaticServices.modeService.get().getOrCreateMode(language));
    }
    exports.setModelLanguage = setModelLanguage;
    /**
     * Set the markers for a model.
     */
    function setModelMarkers(model, owner, markers) {
        if (model) {
            standaloneServices_1.StaticServices.markerService.get().changeOne(owner, model.uri, markers);
        }
    }
    exports.setModelMarkers = setModelMarkers;
    /**
     * Get markers for owner and/or resource
     * @returns {IMarker[]} list of markers
     * @param filter
     */
    function getModelMarkers(filter) {
        return standaloneServices_1.StaticServices.markerService.get().read(filter);
    }
    exports.getModelMarkers = getModelMarkers;
    /**
     * Get the model that has `uri` if it exists.
     */
    function getModel(uri) {
        return standaloneServices_1.StaticServices.modelService.get().getModel(uri);
    }
    exports.getModel = getModel;
    /**
     * Get all the created models.
     */
    function getModels() {
        return standaloneServices_1.StaticServices.modelService.get().getModels();
    }
    exports.getModels = getModels;
    /**
     * Emitted when a model is created.
     * @event
     */
    function onDidCreateModel(listener) {
        return standaloneServices_1.StaticServices.modelService.get().onModelAdded(listener);
    }
    exports.onDidCreateModel = onDidCreateModel;
    /**
     * Emitted right before a model is disposed.
     * @event
     */
    function onWillDisposeModel(listener) {
        return standaloneServices_1.StaticServices.modelService.get().onModelRemoved(listener);
    }
    exports.onWillDisposeModel = onWillDisposeModel;
    /**
     * Emitted when a different language is set to a model.
     * @event
     */
    function onDidChangeModelLanguage(listener) {
        return standaloneServices_1.StaticServices.modelService.get().onModelModeChanged(function (e) {
            listener({
                model: e.model,
                oldLanguage: e.oldModeId
            });
        });
    }
    exports.onDidChangeModelLanguage = onDidChangeModelLanguage;
    /**
     * Create a new web worker that has model syncing capabilities built in.
     * Specify an AMD module to load that will `create` an object that will be proxied.
     */
    function createWebWorker(opts) {
        return webWorker_1.createWebWorker(standaloneServices_1.StaticServices.modelService.get(), opts);
    }
    exports.createWebWorker = createWebWorker;
    /**
     * Colorize the contents of `domNode` using attribute `data-lang`.
     */
    function colorizeElement(domNode, options) {
        return colorizer_1.Colorizer.colorizeElement(standaloneServices_1.StaticServices.standaloneThemeService.get(), standaloneServices_1.StaticServices.modeService.get(), domNode, options);
    }
    exports.colorizeElement = colorizeElement;
    /**
     * Colorize `text` using language `languageId`.
     */
    function colorize(text, languageId, options) {
        return colorizer_1.Colorizer.colorize(standaloneServices_1.StaticServices.modeService.get(), text, languageId, options);
    }
    exports.colorize = colorize;
    /**
     * Colorize a line in a model.
     */
    function colorizeModelLine(model, lineNumber, tabSize) {
        if (tabSize === void 0) { tabSize = 4; }
        return colorizer_1.Colorizer.colorizeModelLine(model, lineNumber, tabSize);
    }
    exports.colorizeModelLine = colorizeModelLine;
    /**
     * @internal
     */
    function getSafeTokenizationSupport(languageId) {
        var tokenizationSupport = modes.TokenizationRegistry.get(languageId);
        if (tokenizationSupport) {
            return tokenizationSupport;
        }
        return {
            getInitialState: function () { return nullMode_1.NULL_STATE; },
            tokenize: function (line, state, deltaOffset) { return nullMode_1.nullTokenize(languageId, line, state, deltaOffset); },
            tokenize2: undefined,
        };
    }
    /**
     * Tokenize `text` using language `languageId`
     */
    function tokenize(text, languageId) {
        var modeService = standaloneServices_1.StaticServices.modeService.get();
        // Needed in order to get the mode registered for subsequent look-ups
        modeService.getOrCreateMode(languageId);
        var tokenizationSupport = getSafeTokenizationSupport(languageId);
        var lines = text.split(/\r\n|\r|\n/);
        var result = [];
        var state = tokenizationSupport.getInitialState();
        for (var i = 0, len = lines.length; i < len; i++) {
            var line = lines[i];
            var tokenizationResult = tokenizationSupport.tokenize(line, state, 0);
            result[i] = tokenizationResult.tokens;
            state = tokenizationResult.endState;
        }
        return result;
    }
    exports.tokenize = tokenize;
    /**
     * Define a new theme.
     */
    function defineTheme(themeName, themeData) {
        standaloneServices_1.StaticServices.standaloneThemeService.get().defineTheme(themeName, themeData);
    }
    exports.defineTheme = defineTheme;
    /**
     * Switches to a theme.
     */
    function setTheme(themeName) {
        standaloneServices_1.StaticServices.standaloneThemeService.get().setTheme(themeName);
    }
    exports.setTheme = setTheme;
    /**
     * @internal
     * --------------------------------------------
     * This is repeated here so it can be exported
     * because TS inlines const enums
     * --------------------------------------------
     */
    var ScrollType;
    (function (ScrollType) {
        ScrollType[ScrollType["Smooth"] = 0] = "Smooth";
        ScrollType[ScrollType["Immediate"] = 1] = "Immediate";
    })(ScrollType || (ScrollType = {}));
    /**
     * @internal
     * --------------------------------------------
     * This is repeated here so it can be exported
     * because TS inlines const enums
     * --------------------------------------------
     */
    var RenderLineNumbersType;
    (function (RenderLineNumbersType) {
        RenderLineNumbersType[RenderLineNumbersType["Off"] = 0] = "Off";
        RenderLineNumbersType[RenderLineNumbersType["On"] = 1] = "On";
        RenderLineNumbersType[RenderLineNumbersType["Relative"] = 2] = "Relative";
        RenderLineNumbersType[RenderLineNumbersType["Interval"] = 3] = "Interval";
        RenderLineNumbersType[RenderLineNumbersType["Custom"] = 4] = "Custom";
    })(RenderLineNumbersType || (RenderLineNumbersType = {}));
    /**
     * @internal
     */
    function createMonacoEditorAPI() {
        return {
            // methods
            create: create,
            onDidCreateEditor: onDidCreateEditor,
            createDiffEditor: createDiffEditor,
            createDiffNavigator: createDiffNavigator,
            createModel: createModel,
            setModelLanguage: setModelLanguage,
            setModelMarkers: setModelMarkers,
            getModelMarkers: getModelMarkers,
            getModels: getModels,
            getModel: getModel,
            onDidCreateModel: onDidCreateModel,
            onWillDisposeModel: onWillDisposeModel,
            onDidChangeModelLanguage: onDidChangeModelLanguage,
            createWebWorker: createWebWorker,
            colorizeElement: colorizeElement,
            colorize: colorize,
            colorizeModelLine: colorizeModelLine,
            tokenize: tokenize,
            defineTheme: defineTheme,
            setTheme: setTheme,
            // enums
            ScrollbarVisibility: scrollable_1.ScrollbarVisibility,
            WrappingIndent: editorOptions.WrappingIndent,
            OverviewRulerLane: model_1.OverviewRulerLane,
            EndOfLinePreference: model_1.EndOfLinePreference,
            DefaultEndOfLine: model_1.DefaultEndOfLine,
            EndOfLineSequence: model_1.EndOfLineSequence,
            TrackedRangeStickiness: model_1.TrackedRangeStickiness,
            CursorChangeReason: cursorEvents_1.CursorChangeReason,
            MouseTargetType: editorBrowser_1.MouseTargetType,
            TextEditorCursorStyle: editorOptions.TextEditorCursorStyle,
            TextEditorCursorBlinkingStyle: editorOptions.TextEditorCursorBlinkingStyle,
            ContentWidgetPositionPreference: editorBrowser_1.ContentWidgetPositionPreference,
            OverlayWidgetPositionPreference: editorBrowser_1.OverlayWidgetPositionPreference,
            RenderMinimap: editorOptions.RenderMinimap,
            ScrollType: ScrollType,
            RenderLineNumbersType: RenderLineNumbersType,
            // classes
            InternalEditorOptions: editorOptions.InternalEditorOptions,
            BareFontInfo: fontInfo_1.BareFontInfo,
            FontInfo: fontInfo_1.FontInfo,
            TextModelResolvedOptions: model_1.TextModelResolvedOptions,
            FindMatch: model_1.FindMatch,
            // vars
            EditorType: editorCommon.EditorType
        };
    }
    exports.createMonacoEditorAPI = createMonacoEditorAPI;
});
