var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/base/common/event", "vs/editor/common/modes/languageSelector", "vs/base/common/platform", "vs/base/common/errors", "vs/platform/node/product", "vs/platform/node/package", "vs/workbench/api/node/extHostFileSystemEventService", "vs/workbench/api/node/extHostDocumentsAndEditors", "vs/workbench/api/node/extHostDocuments", "vs/workbench/api/node/extHostDocumentContentProviders", "vs/workbench/api/node/extHostDocumentSaveParticipant", "vs/workbench/api/node/extHostDiagnostics", "vs/workbench/api/node/extHostTreeViews", "vs/workbench/api/node/extHostQuickOpen", "vs/workbench/api/node/extHostProgress", "vs/workbench/api/node/extHostSCM", "vs/workbench/api/node/extHostHeapService", "vs/workbench/api/node/extHostStatusBar", "vs/workbench/api/node/extHostCommands", "vs/workbench/api/node/extHostOutputService", "vs/workbench/api/node/extHostTerminalService", "vs/workbench/api/node/extHostMessageService", "vs/workbench/api/node/extHostTextEditors", "vs/workbench/api/node/extHostLanguages", "vs/workbench/api/node/extHostLanguageFeatures", "vs/workbench/api/node/extHostApiCommands", "vs/workbench/api/node/extHostTask", "vs/workbench/api/node/extHostDebugService", "vs/workbench/api/node/extHostWindow", "vs/workbench/api/node/extHostTypes", "vs/base/common/uri", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/base/common/cancellation", "vs/base/common/paths", "./extHost.protocol", "vs/editor/common/modes/languageConfiguration", "vs/editor/common/config/editorOptions", "vs/workbench/api/node/extHostDialogs", "vs/workbench/api/node/extHostFileSystem", "vs/workbench/api/node/extHostDecorations", "vs/workbench/api/node/extHostTypeConverters", "vs/workbench/api/node/extHostExtensionActivator", "vs/base/common/arrays", "vs/editor/common/model", "vs/workbench/api/node/extHostWebview"], function (require, exports, event_1, languageSelector_1, Platform, errors, product_1, package_1, extHostFileSystemEventService_1, extHostDocumentsAndEditors_1, extHostDocuments_1, extHostDocumentContentProviders_1, extHostDocumentSaveParticipant_1, extHostDiagnostics_1, extHostTreeViews_1, extHostQuickOpen_1, extHostProgress_1, extHostSCM_1, extHostHeapService_1, extHostStatusBar_1, extHostCommands_1, extHostOutputService_1, extHostTerminalService_1, extHostMessageService_1, extHostTextEditors_1, extHostLanguages_1, extHostLanguageFeatures_1, extHostApiCommands_1, extHostTask_1, extHostDebugService_1, extHostWindow_1, extHostTypes, uri_1, severity_1, winjs_base_1, cancellation_1, paths, extHost_protocol_1, languageConfiguration, editorOptions_1, extHostDialogs_1, extHostFileSystem_1, extHostDecorations_1, extHostTypeConverters_1, extHostExtensionActivator_1, arrays_1, model_1, extHostWebview_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function checkProposedApiEnabled(extension) {
        if (!extension.enableProposedApi) {
            throwProposedApiError(extension);
        }
    }
    exports.checkProposedApiEnabled = checkProposedApiEnabled;
    function throwProposedApiError(extension) {
        throw new Error("[" + extension.id + "]: Proposed API is only available when running out of dev or with the following command line switch: --enable-proposed-api " + extension.id);
    }
    function proposedApiFunction(extension, fn) {
        if (extension.enableProposedApi) {
            return fn;
        }
        else {
            return throwProposedApiError;
        }
    }
    /**
     * This method instantiates and returns the extension API surface
     */
    function createApiFactory(initData, rpcProtocol, extHostWorkspace, extHostConfiguration, extensionService, extHostLogService) {
        // Addressable instances
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLogService, extHostLogService);
        var extHostHeapService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostHeapService, new extHostHeapService_1.ExtHostHeapService());
        var extHostDecorations = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDecorations, new extHostDecorations_1.ExtHostDecorations(rpcProtocol));
        var extHostDocumentsAndEditors = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentsAndEditors, new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(rpcProtocol));
        var extHostDocuments = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocuments, new extHostDocuments_1.ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors));
        var extHostDocumentContentProviders = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentContentProviders, new extHostDocumentContentProviders_1.ExtHostDocumentContentProvider(rpcProtocol, extHostDocumentsAndEditors));
        var extHostDocumentSaveParticipant = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentSaveParticipant, new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(extHostLogService, extHostDocuments, rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadTextEditors)));
        var extHostEditors = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostEditors, new extHostTextEditors_1.ExtHostEditors(rpcProtocol, extHostDocumentsAndEditors));
        var extHostCommands = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostCommands, new extHostCommands_1.ExtHostCommands(rpcProtocol, extHostHeapService, extHostLogService));
        var extHostTreeViews = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTreeViews, new extHostTreeViews_1.ExtHostTreeViews(rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadTreeViews), extHostCommands));
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWorkspace, extHostWorkspace);
        var extHostDebugService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDebugService, new extHostDebugService_1.ExtHostDebugService(rpcProtocol, extHostWorkspace));
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostConfiguration, extHostConfiguration);
        var extHostDiagnostics = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDiagnostics, new extHostDiagnostics_1.ExtHostDiagnostics(rpcProtocol));
        var extHostLanguageFeatures = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLanguageFeatures, new extHostLanguageFeatures_1.ExtHostLanguageFeatures(rpcProtocol, extHostDocuments, extHostCommands, extHostHeapService, extHostDiagnostics));
        var extHostFileSystem = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostFileSystem, new extHostFileSystem_1.ExtHostFileSystem(rpcProtocol, extHostLanguageFeatures));
        var extHostFileSystemEvent = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostFileSystemEventService, new extHostFileSystemEventService_1.ExtHostFileSystemEventService());
        var extHostQuickOpen = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostQuickOpen, new extHostQuickOpen_1.ExtHostQuickOpen(rpcProtocol, extHostWorkspace, extHostCommands));
        var extHostTerminalService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTerminalService, new extHostTerminalService_1.ExtHostTerminalService(rpcProtocol));
        var extHostSCM = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostSCM, new extHostSCM_1.ExtHostSCM(rpcProtocol, extHostCommands, extHostLogService));
        var extHostTask = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTask, new extHostTask_1.ExtHostTask(rpcProtocol, extHostWorkspace));
        var extHostWindow = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWindow, new extHostWindow_1.ExtHostWindow(rpcProtocol));
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostExtensionService, extensionService);
        var extHostWebviews = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWebviews, new extHostWebview_1.ExtHostWebviews(rpcProtocol));
        // Check that no named customers are missing
        var expected = Object.keys(extHost_protocol_1.ExtHostContext).map(function (key) { return extHost_protocol_1.ExtHostContext[key]; });
        rpcProtocol.assertRegistered(expected);
        // Other instances
        var extHostMessageService = new extHostMessageService_1.ExtHostMessageService(rpcProtocol);
        var extHostDialogs = new extHostDialogs_1.ExtHostDialogs(rpcProtocol);
        var extHostStatusBar = new extHostStatusBar_1.ExtHostStatusBar(rpcProtocol);
        var extHostProgress = new extHostProgress_1.ExtHostProgress(rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadProgress));
        var extHostOutputService = new extHostOutputService_1.ExtHostOutputService(rpcProtocol);
        var extHostLanguages = new extHostLanguages_1.ExtHostLanguages(rpcProtocol);
        // Register API-ish commands
        extHostApiCommands_1.ExtHostApiCommands.register(extHostCommands);
        return function (extension) {
            var _this = this;
            if (!arrays_1.isFalsyOrEmpty(product_1.default.extensionAllowedProposedApi)
                && product_1.default.extensionAllowedProposedApi.indexOf(extension.id) >= 0) {
                // fast lane -> proposed api is available to all extensions
                // that are listed in product.json-files
                extension.enableProposedApi = true;
            }
            else if (extension.enableProposedApi && !extension.isBuiltin) {
                if (!initData.environment.enableProposedApiForAll &&
                    initData.environment.enableProposedApiFor.indexOf(extension.id) < 0) {
                    extension.enableProposedApi = false;
                    console.error("Extension '" + extension.id + " cannot use PROPOSED API (must started out of dev or enabled via --enable-proposed-api)");
                }
                else {
                    // proposed api is available when developing or when an extension was explicitly
                    // spelled out via a command line argument
                    console.warn("Extension '" + extension.id + "' uses PROPOSED API which is subject to change and removal without notice.");
                }
            }
            // namespace: commands
            var commands = {
                registerCommand: function (id, command, thisArgs) {
                    return extHostCommands.registerCommand(id, command, thisArgs);
                },
                registerTextEditorCommand: function (id, callback, thisArg) {
                    return extHostCommands.registerCommand(id, function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var activeTextEditor = extHostEditors.getActiveTextEditor();
                        if (!activeTextEditor) {
                            console.warn('Cannot execute ' + id + ' because there is no active text editor.');
                            return undefined;
                        }
                        return activeTextEditor.edit(function (edit) {
                            args.unshift(activeTextEditor, edit);
                            callback.apply(thisArg, args);
                        }).then(function (result) {
                            if (!result) {
                                console.warn('Edits from command ' + id + ' were not applied.');
                            }
                        }, function (err) {
                            console.warn('An error occurred while running command ' + id, err);
                        });
                    });
                },
                registerDiffInformationCommand: proposedApiFunction(extension, function (id, callback, thisArg) {
                    return extHostCommands.registerCommand(id, function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return __awaiter(_this, void 0, void 0, function () {
                            var activeTextEditor, diff;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        activeTextEditor = extHostEditors.getActiveTextEditor();
                                        if (!activeTextEditor) {
                                            console.warn('Cannot execute ' + id + ' because there is no active text editor.');
                                            return [2 /*return*/, undefined];
                                        }
                                        return [4 /*yield*/, extHostEditors.getDiffInformation(activeTextEditor.id)];
                                    case 1:
                                        diff = _a.sent();
                                        callback.apply(thisArg, [diff].concat(args));
                                        return [2 /*return*/];
                                }
                            });
                        });
                    });
                }),
                executeCommand: function (id) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return extHostCommands.executeCommand.apply(extHostCommands, [id].concat(args));
                },
                getCommands: function (filterInternal) {
                    if (filterInternal === void 0) { filterInternal = false; }
                    return extHostCommands.getCommands(filterInternal);
                }
            };
            // namespace: env
            var env = Object.freeze({
                get machineId() { return initData.telemetryInfo.machineId; },
                get sessionId() { return initData.telemetryInfo.sessionId; },
                get language() { return Platform.language; },
                get appName() { return product_1.default.nameLong; },
                get appRoot() { return initData.environment.appRoot; },
            });
            // namespace: extensions
            var extensions = {
                getExtension: function (extensionId) {
                    var desc = extensionService.getExtensionDescription(extensionId);
                    if (desc) {
                        return new Extension(extensionService, desc);
                    }
                    return undefined;
                },
                get all() {
                    return extensionService.getAllExtensionDescriptions().map(function (desc) { return new Extension(extensionService, desc); });
                }
            };
            // namespace: languages
            var languages = {
                createDiagnosticCollection: function (name) {
                    return extHostDiagnostics.createDiagnosticCollection(name);
                },
                getLanguages: function () {
                    return extHostLanguages.getLanguages();
                },
                match: function (selector, document) {
                    return languageSelector_1.score(extHostTypeConverters_1.toLanguageSelector(selector), document.uri, document.languageId);
                },
                registerCodeActionsProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerCodeActionProvider(selector, provider);
                },
                registerCodeLensProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerCodeLensProvider(selector, provider);
                },
                registerDefinitionProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerDefinitionProvider(selector, provider);
                },
                registerImplementationProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerImplementationProvider(selector, provider);
                },
                registerTypeDefinitionProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerTypeDefinitionProvider(selector, provider);
                },
                registerHoverProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerHoverProvider(selector, provider, extension.id);
                },
                registerDocumentHighlightProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerDocumentHighlightProvider(selector, provider);
                },
                registerReferenceProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerReferenceProvider(selector, provider);
                },
                registerRenameProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerRenameProvider(selector, provider, extension.enableProposedApi);
                },
                registerDocumentSymbolProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerDocumentSymbolProvider(selector, provider);
                },
                registerWorkspaceSymbolProvider: function (provider) {
                    return extHostLanguageFeatures.registerWorkspaceSymbolProvider(provider);
                },
                registerDocumentFormattingEditProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerDocumentFormattingEditProvider(selector, provider);
                },
                registerDocumentRangeFormattingEditProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerDocumentRangeFormattingEditProvider(selector, provider);
                },
                registerOnTypeFormattingEditProvider: function (selector, provider, firstTriggerCharacter) {
                    var moreTriggerCharacters = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        moreTriggerCharacters[_i - 3] = arguments[_i];
                    }
                    return extHostLanguageFeatures.registerOnTypeFormattingEditProvider(selector, provider, [firstTriggerCharacter].concat(moreTriggerCharacters));
                },
                registerSignatureHelpProvider: function (selector, provider) {
                    var triggerCharacters = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        triggerCharacters[_i - 2] = arguments[_i];
                    }
                    return extHostLanguageFeatures.registerSignatureHelpProvider(selector, provider, triggerCharacters);
                },
                registerCompletionItemProvider: function (selector, provider) {
                    var triggerCharacters = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        triggerCharacters[_i - 2] = arguments[_i];
                    }
                    return extHostLanguageFeatures.registerCompletionItemProvider(selector, provider, triggerCharacters);
                },
                registerDocumentLinkProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerDocumentLinkProvider(selector, provider);
                },
                registerColorProvider: function (selector, provider) {
                    return extHostLanguageFeatures.registerColorProvider(selector, provider);
                },
                setLanguageConfiguration: function (language, configuration) {
                    return extHostLanguageFeatures.setLanguageConfiguration(language, configuration);
                }
            };
            // namespace: window
            var window = {
                get activeTextEditor() {
                    return extHostEditors.getActiveTextEditor();
                },
                get visibleTextEditors() {
                    return extHostEditors.getVisibleTextEditors();
                },
                showTextDocument: function (documentOrUri, columnOrOptions, preserveFocus) {
                    var documentPromise;
                    if (uri_1.default.isUri(documentOrUri)) {
                        documentPromise = winjs_base_1.TPromise.wrap(workspace.openTextDocument(documentOrUri));
                    }
                    else {
                        documentPromise = winjs_base_1.TPromise.wrap(documentOrUri);
                    }
                    return documentPromise.then(function (document) {
                        return extHostEditors.showTextDocument(document, columnOrOptions, preserveFocus);
                    });
                },
                createTextEditorDecorationType: function (options) {
                    return extHostEditors.createTextEditorDecorationType(options);
                },
                onDidChangeActiveTextEditor: function (listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeActiveTextEditor(listener, thisArg, disposables);
                },
                onDidChangeVisibleTextEditors: function (listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeVisibleTextEditors(listener, thisArg, disposables);
                },
                onDidChangeTextEditorSelection: function (listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorSelection(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorOptions: function (listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorOptions(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorViewColumn: function (listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeTextEditorViewColumn(listener, thisArg, disposables);
                },
                onDidCloseTerminal: function (listener, thisArg, disposables) {
                    return extHostTerminalService.onDidCloseTerminal(listener, thisArg, disposables);
                },
                get state() {
                    return extHostWindow.state;
                },
                onDidChangeWindowState: function (listener, thisArg, disposables) {
                    return extHostWindow.onDidChangeWindowState(listener, thisArg, disposables);
                },
                showInformationMessage: function (message, first) {
                    var rest = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        rest[_i - 2] = arguments[_i];
                    }
                    return extHostMessageService.showMessage(extension, severity_1.default.Info, message, first, rest);
                },
                showWarningMessage: function (message, first) {
                    var rest = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        rest[_i - 2] = arguments[_i];
                    }
                    return extHostMessageService.showMessage(extension, severity_1.default.Warning, message, first, rest);
                },
                showErrorMessage: function (message, first) {
                    var rest = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        rest[_i - 2] = arguments[_i];
                    }
                    return extHostMessageService.showMessage(extension, severity_1.default.Error, message, first, rest);
                },
                showQuickPick: function (items, options, token) {
                    return extHostQuickOpen.showQuickPick(items, options, token);
                },
                showWorkspaceFolderPick: function (options) {
                    return extHostQuickOpen.showWorkspaceFolderPick(options);
                },
                showInputBox: function (options, token) {
                    return extHostQuickOpen.showInput(options, token);
                },
                showOpenDialog: function (options) {
                    return extHostDialogs.showOpenDialog(options);
                },
                showSaveDialog: function (options) {
                    return extHostDialogs.showSaveDialog(options);
                },
                createStatusBarItem: function (position, priority) {
                    return extHostStatusBar.createStatusBarEntry(extension.id, position, priority);
                },
                setStatusBarMessage: function (text, timeoutOrThenable) {
                    return extHostStatusBar.setStatusBarMessage(text, timeoutOrThenable);
                },
                withScmProgress: function (task) {
                    console.warn("[Deprecation Warning] function 'withScmProgress' is deprecated and should no longer be used. Use 'withProgress' instead.");
                    return extHostProgress.withProgress(extension, { location: extHostTypes.ProgressLocation.SourceControl }, function (progress, token) { return task({ report: function (n) { } }); });
                },
                withProgress: function (options, task) {
                    return extHostProgress.withProgress(extension, options, task);
                },
                createOutputChannel: function (name) {
                    return extHostOutputService.createOutputChannel(name);
                },
                createTerminal: function (nameOrOptions, shellPath, shellArgs) {
                    if (typeof nameOrOptions === 'object') {
                        return extHostTerminalService.createTerminalFromOptions(nameOrOptions);
                    }
                    return extHostTerminalService.createTerminal(nameOrOptions, shellPath, shellArgs);
                },
                registerTreeDataProvider: function (viewId, treeDataProvider) {
                    return extHostTreeViews.registerTreeDataProvider(viewId, treeDataProvider);
                },
                // proposed API
                sampleFunction: proposedApiFunction(extension, function () {
                    return extHostMessageService.showMessage(extension, severity_1.default.Info, 'Hello Proposed Api!', {}, []);
                }),
                registerDecorationProvider: proposedApiFunction(extension, function (provider) {
                    return extHostDecorations.registerDecorationProvider(provider, extension.id);
                }),
                createWebview: proposedApiFunction(extension, function (name, column, options) {
                    return extHostWebviews.createWebview(name, column, options);
                })
            };
            // namespace: workspace
            var workspace = {
                get rootPath() {
                    return extHostWorkspace.getPath();
                },
                set rootPath(value) {
                    throw errors.readonly();
                },
                getWorkspaceFolder: function (resource) {
                    return extHostWorkspace.getWorkspaceFolder(resource);
                },
                get workspaceFolders() {
                    return extHostWorkspace.getWorkspaceFolders();
                },
                get name() {
                    return extHostWorkspace.workspace ? extHostWorkspace.workspace.name : undefined;
                },
                set name(value) {
                    throw errors.readonly();
                },
                updateWorkspaceFolders: proposedApiFunction(extension, function (index, deleteCount) {
                    var workspaceFoldersToAdd = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        workspaceFoldersToAdd[_i - 2] = arguments[_i];
                    }
                    return extHostWorkspace.updateWorkspaceFolders.apply(extHostWorkspace, [extension, index, deleteCount].concat(workspaceFoldersToAdd));
                }),
                onDidChangeWorkspaceFolders: function (listener, thisArgs, disposables) {
                    return extHostWorkspace.onDidChangeWorkspace(listener, thisArgs, disposables);
                },
                asRelativePath: function (pathOrUri, includeWorkspace) {
                    return extHostWorkspace.getRelativePath(pathOrUri, includeWorkspace);
                },
                findFiles: function (include, exclude, maxResults, token) {
                    return extHostWorkspace.findFiles(extHostTypeConverters_1.toGlobPattern(include), extHostTypeConverters_1.toGlobPattern(exclude), maxResults, token);
                },
                saveAll: function (includeUntitled) {
                    return extHostWorkspace.saveAll(includeUntitled);
                },
                applyEdit: function (edit) {
                    return extHostEditors.applyWorkspaceEdit(edit);
                },
                createFileSystemWatcher: function (pattern, ignoreCreate, ignoreChange, ignoreDelete) {
                    return extHostFileSystemEvent.createFileSystemWatcher(extHostTypeConverters_1.toGlobPattern(pattern), ignoreCreate, ignoreChange, ignoreDelete);
                },
                get textDocuments() {
                    return extHostDocuments.getAllDocumentData().map(function (data) { return data.document; });
                },
                set textDocuments(value) {
                    throw errors.readonly();
                },
                openTextDocument: function (uriOrFileNameOrOptions) {
                    var uriPromise;
                    var options = uriOrFileNameOrOptions;
                    if (typeof uriOrFileNameOrOptions === 'string') {
                        uriPromise = winjs_base_1.TPromise.as(uri_1.default.file(uriOrFileNameOrOptions));
                    }
                    else if (uriOrFileNameOrOptions instanceof uri_1.default) {
                        uriPromise = winjs_base_1.TPromise.as(uriOrFileNameOrOptions);
                    }
                    else if (!options || typeof options === 'object') {
                        uriPromise = extHostDocuments.createDocumentData(options);
                    }
                    else {
                        throw new Error('illegal argument - uriOrFileNameOrOptions');
                    }
                    return uriPromise.then(function (uri) {
                        return extHostDocuments.ensureDocumentData(uri).then(function () {
                            var data = extHostDocuments.getDocumentData(uri);
                            return data && data.document;
                        });
                    });
                },
                onDidOpenTextDocument: function (listener, thisArgs, disposables) {
                    return extHostDocuments.onDidAddDocument(listener, thisArgs, disposables);
                },
                onDidCloseTextDocument: function (listener, thisArgs, disposables) {
                    return extHostDocuments.onDidRemoveDocument(listener, thisArgs, disposables);
                },
                onDidChangeTextDocument: function (listener, thisArgs, disposables) {
                    return extHostDocuments.onDidChangeDocument(listener, thisArgs, disposables);
                },
                onDidSaveTextDocument: function (listener, thisArgs, disposables) {
                    return extHostDocuments.onDidSaveDocument(listener, thisArgs, disposables);
                },
                onWillSaveTextDocument: function (listener, thisArgs, disposables) {
                    return extHostDocumentSaveParticipant.getOnWillSaveTextDocumentEvent(extension)(listener, thisArgs, disposables);
                },
                onDidChangeConfiguration: function (listener, thisArgs, disposables) {
                    return extHostConfiguration.onDidChangeConfiguration(listener, thisArgs, disposables);
                },
                getConfiguration: function (section, resource) {
                    resource = arguments.length === 1 ? void 0 : resource;
                    return extHostConfiguration.getConfiguration(section, resource, extension.id);
                },
                registerTextDocumentContentProvider: function (scheme, provider) {
                    return extHostDocumentContentProviders.registerTextDocumentContentProvider(scheme, provider);
                },
                registerTaskProvider: function (type, provider) {
                    return extHostTask.registerTaskProvider(extension, provider);
                },
                registerFileSystemProvider: proposedApiFunction(extension, function (authority, provider) {
                    return extHostFileSystem.registerFileSystemProvider(authority, provider);
                })
            };
            // namespace: scm
            var scm = {
                get inputBox() {
                    return extHostSCM.getLastInputBox(extension);
                },
                createSourceControl: function (id, label, rootUri) {
                    return extHostSCM.createSourceControl(extension, id, label, rootUri);
                }
            };
            // namespace: debug
            var debug = {
                get activeDebugSession() {
                    return extHostDebugService.activeDebugSession;
                },
                get activeDebugConsole() {
                    return extHostDebugService.activeDebugConsole;
                },
                get breakpoints() {
                    return extHostDebugService.breakpoints;
                },
                onDidStartDebugSession: function (listener, thisArg, disposables) {
                    return extHostDebugService.onDidStartDebugSession(listener, thisArg, disposables);
                },
                onDidTerminateDebugSession: function (listener, thisArg, disposables) {
                    return extHostDebugService.onDidTerminateDebugSession(listener, thisArg, disposables);
                },
                onDidChangeActiveDebugSession: function (listener, thisArg, disposables) {
                    return extHostDebugService.onDidChangeActiveDebugSession(listener, thisArg, disposables);
                },
                onDidReceiveDebugSessionCustomEvent: function (listener, thisArg, disposables) {
                    return extHostDebugService.onDidReceiveDebugSessionCustomEvent(listener, thisArg, disposables);
                },
                onDidChangeBreakpoints: proposedApiFunction(extension, function (listener, thisArgs, disposables) {
                    return extHostDebugService.onDidChangeBreakpoints(listener, thisArgs, disposables);
                }),
                startDebugging: function (folder, nameOrConfig) {
                    return extHostDebugService.startDebugging(folder, nameOrConfig);
                },
                registerDebugConfigurationProvider: function (debugType, provider) {
                    return extHostDebugService.registerDebugConfigurationProvider(debugType, provider);
                },
                addBreakpoints: proposedApiFunction(extension, function (breakpoints) {
                    return extHostDebugService.addBreakpoints(breakpoints);
                }),
                removeBreakpoints: proposedApiFunction(extension, function (breakpoints) {
                    return extHostDebugService.removeBreakpoints(breakpoints);
                })
            };
            return {
                version: package_1.default.version,
                // namespaces
                commands: commands,
                env: env,
                extensions: extensions,
                languages: languages,
                window: window,
                workspace: workspace,
                scm: scm,
                debug: debug,
                // types
                Breakpoint: extHostTypes.Breakpoint,
                CancellationTokenSource: cancellation_1.CancellationTokenSource,
                CodeAction: extHostTypes.CodeAction,
                CodeActionKind: extHostTypes.CodeActionKind,
                CodeLens: extHostTypes.CodeLens,
                Color: extHostTypes.Color,
                ColorPresentation: extHostTypes.ColorPresentation,
                ColorInformation: extHostTypes.ColorInformation,
                EndOfLine: extHostTypes.EndOfLine,
                CompletionItem: extHostTypes.CompletionItem,
                CompletionItemKind: extHostTypes.CompletionItemKind,
                CompletionList: extHostTypes.CompletionList,
                CompletionTriggerKind: extHostTypes.CompletionTriggerKind,
                DebugAdapterExecutable: extHostTypes.DebugAdapterExecutable,
                Diagnostic: extHostTypes.Diagnostic,
                DiagnosticSeverity: extHostTypes.DiagnosticSeverity,
                Disposable: extHostTypes.Disposable,
                DocumentHighlight: extHostTypes.DocumentHighlight,
                DocumentHighlightKind: extHostTypes.DocumentHighlightKind,
                DocumentLink: extHostTypes.DocumentLink,
                EventEmitter: event_1.Emitter,
                FunctionBreakpoint: extHostTypes.FunctionBreakpoint,
                Hover: extHostTypes.Hover,
                IndentAction: languageConfiguration.IndentAction,
                Location: extHostTypes.Location,
                LogLevel: extHostTypes.LogLevel,
                MarkdownString: extHostTypes.MarkdownString,
                OverviewRulerLane: model_1.OverviewRulerLane,
                ParameterInformation: extHostTypes.ParameterInformation,
                Position: extHostTypes.Position,
                Range: extHostTypes.Range,
                Selection: extHostTypes.Selection,
                SignatureHelp: extHostTypes.SignatureHelp,
                SignatureInformation: extHostTypes.SignatureInformation,
                SnippetString: extHostTypes.SnippetString,
                SourceBreakpoint: extHostTypes.SourceBreakpoint,
                StatusBarAlignment: extHostTypes.StatusBarAlignment,
                SymbolInformation: extHostTypes.SymbolInformation,
                SymbolKind: extHostTypes.SymbolKind,
                SourceControlInputBoxValidationType: extHostTypes.SourceControlInputBoxValidationType,
                TextDocumentSaveReason: extHostTypes.TextDocumentSaveReason,
                TextEdit: extHostTypes.TextEdit,
                TextEditorCursorStyle: editorOptions_1.TextEditorCursorStyle,
                TextEditorLineNumbersStyle: extHostTypes.TextEditorLineNumbersStyle,
                TextEditorRevealType: extHostTypes.TextEditorRevealType,
                TextEditorSelectionChangeKind: extHostTypes.TextEditorSelectionChangeKind,
                DecorationRangeBehavior: extHostTypes.DecorationRangeBehavior,
                Uri: uri_1.default,
                ViewColumn: extHostTypes.ViewColumn,
                WorkspaceEdit: extHostTypes.WorkspaceEdit,
                ProgressLocation: extHostTypes.ProgressLocation,
                TreeItemCollapsibleState: extHostTypes.TreeItemCollapsibleState,
                TreeItem: extHostTypes.TreeItem,
                ThemeColor: extHostTypes.ThemeColor,
                // functions
                TaskRevealKind: extHostTypes.TaskRevealKind,
                TaskPanelKind: extHostTypes.TaskPanelKind,
                TaskGroup: extHostTypes.TaskGroup,
                ProcessExecution: extHostTypes.ProcessExecution,
                ShellExecution: extHostTypes.ShellExecution,
                TaskScope: extHostTypes.TaskScope,
                Task: extHostTypes.Task,
                ConfigurationTarget: extHostTypes.ConfigurationTarget,
                RelativePattern: extHostTypes.RelativePattern,
                FileChangeType: extHostTypes.FileChangeType,
                FileType: extHostTypes.FileType
            };
        };
    }
    exports.createApiFactory = createApiFactory;
    var Extension = /** @class */ (function () {
        function Extension(extensionService, description) {
            this._extensionService = extensionService;
            this.id = description.id;
            this.extensionPath = paths.normalize(description.extensionFolderPath, true);
            this.packageJSON = description;
        }
        Object.defineProperty(Extension.prototype, "isActive", {
            get: function () {
                return this._extensionService.isActivated(this.id);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Extension.prototype, "exports", {
            get: function () {
                return this._extensionService.getExtensionExports(this.id);
            },
            enumerable: true,
            configurable: true
        });
        Extension.prototype.activate = function () {
            var _this = this;
            return this._extensionService.activateById(this.id, new extHostExtensionActivator_1.ExtensionActivatedByAPI(false)).then(function () { return _this.exports; });
        };
        return Extension;
    }());
    function initializeExtensionApi(extensionService, apiFactory) {
        return extensionService.getExtensionPathIndex().then(function (trie) { return defineAPI(apiFactory, trie); });
    }
    exports.initializeExtensionApi = initializeExtensionApi;
    function defineAPI(factory, extensionPaths) {
        // each extension is meant to get its own api implementation
        var extApiImpl = new Map();
        var defaultApiImpl;
        var node_module = require.__$__nodeRequire('module');
        var original = node_module._load;
        node_module._load = function load(request, parent, isMain) {
            if (request !== 'vscode') {
                return original.apply(this, arguments);
            }
            // get extension id from filename and api for extension
            var ext = extensionPaths.findSubstr(parent.filename);
            if (ext) {
                var apiImpl = extApiImpl.get(ext.id);
                if (!apiImpl) {
                    apiImpl = factory(ext);
                    extApiImpl.set(ext.id, apiImpl);
                }
                return apiImpl;
            }
            // fall back to a default implementation
            if (!defaultApiImpl) {
                defaultApiImpl = factory(nullExtensionDescription);
            }
            return defaultApiImpl;
        };
    }
    var nullExtensionDescription = {
        id: 'nullExtensionDescription',
        name: 'Null Extension Description',
        publisher: 'vscode',
        activationEvents: undefined,
        contributes: undefined,
        enableProposedApi: false,
        engines: undefined,
        extensionDependencies: undefined,
        extensionFolderPath: undefined,
        isBuiltin: false,
        main: undefined,
        version: undefined
    };
});
