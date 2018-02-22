/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/errors", "vs/base/common/uri", "vs/workbench/api/node/extHostTypes", "vs/editor/common/model/textModel", "vs/editor/common/core/position", "vs/editor/common/core/range", "./testRPCProtocol", "vs/platform/markers/common/markers", "vs/platform/markers/common/markerService", "vs/workbench/api/node/extHostLanguageFeatures", "vs/workbench/api/electron-browser/mainThreadLanguageFeatures", "vs/workbench/api/node/extHostCommands", "vs/workbench/api/electron-browser/mainThreadCommands", "vs/workbench/api/electron-browser/mainThreadHeapService", "vs/workbench/api/node/extHostDocuments", "vs/workbench/api/node/extHostDocumentsAndEditors", "vs/editor/contrib/quickOpen/quickOpen", "vs/editor/common/modes", "vs/editor/contrib/codelens/codelens", "vs/editor/contrib/goToDeclaration/goToDeclaration", "vs/editor/contrib/hover/getHover", "vs/editor/contrib/wordHighlighter/wordHighlighter", "vs/editor/contrib/referenceSearch/referenceSearch", "vs/editor/contrib/quickFix/quickFix", "vs/workbench/parts/search/common/search", "vs/editor/contrib/rename/rename", "vs/editor/contrib/parameterHints/provideSignatureHelp", "vs/editor/contrib/suggest/suggest", "vs/editor/contrib/format/format", "vs/editor/contrib/links/getLinks", "vs/base/common/async", "vs/workbench/api/node/extHost.protocol", "vs/workbench/api/node/extHostDiagnostics", "vs/workbench/api/node/extHostHeapService", "vs/platform/log/common/log", "vs/editor/common/model"], function (require, exports, assert, instantiationServiceMock_1, errors_1, uri_1, types, textModel_1, position_1, range_1, testRPCProtocol_1, markers_1, markerService_1, extHostLanguageFeatures_1, mainThreadLanguageFeatures_1, extHostCommands_1, mainThreadCommands_1, mainThreadHeapService_1, extHostDocuments_1, extHostDocumentsAndEditors_1, quickOpen_1, modes_1, codelens_1, goToDeclaration_1, getHover_1, wordHighlighter_1, referenceSearch_1, quickFix_1, search_1, rename_1, provideSignatureHelp_1, suggest_1, format_1, getLinks_1, async_1, extHost_protocol_1, extHostDiagnostics_1, extHostHeapService_1, log_1, model_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var defaultSelector = { scheme: 'far' };
    var model = textModel_1.TextModel.createFromString([
        'This is the first line',
        'This is the second line',
        'This is the third line',
    ].join('\n'), undefined, undefined, uri_1.default.parse('far://testing/file.a'));
    var extHost;
    var mainThread;
    var disposables = [];
    var rpcProtocol;
    var originalErrorHandler;
    suite('ExtHostLanguageFeatures', function () {
        suiteSetup(function () {
            rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            // Use IInstantiationService to get typechecking when instantiating
            var inst;
            {
                var instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                instantiationService.stub(markers_1.IMarkerService, markerService_1.MarkerService);
                instantiationService.stub(mainThreadHeapService_1.IHeapService, {
                    _serviceBrand: undefined,
                    trackRecursive: function (args) {
                        // nothing
                        return args;
                    }
                });
                inst = instantiationService;
            }
            originalErrorHandler = errors_1.errorHandler.getUnexpectedErrorHandler();
            errors_1.setUnexpectedErrorHandler(function () { });
            var extHostDocumentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(rpcProtocol);
            extHostDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        isDirty: false,
                        versionId: model.getVersionId(),
                        modeId: model.getLanguageIdentifier().language,
                        uri: model.uri,
                        lines: model.getValue().split(model.getEOL()),
                        EOL: model.getEOL(),
                    }]
            });
            var extHostDocuments = new extHostDocuments_1.ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors);
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocuments, extHostDocuments);
            var heapService = new extHostHeapService_1.ExtHostHeapService();
            var commands = new extHostCommands_1.ExtHostCommands(rpcProtocol, heapService, new log_1.NullLogService());
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostCommands, commands);
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadCommands, inst.createInstance(mainThreadCommands_1.MainThreadCommands, rpcProtocol));
            var diagnostics = new extHostDiagnostics_1.ExtHostDiagnostics(rpcProtocol);
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDiagnostics, diagnostics);
            extHost = new extHostLanguageFeatures_1.ExtHostLanguageFeatures(rpcProtocol, extHostDocuments, commands, heapService, diagnostics);
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLanguageFeatures, extHost);
            mainThread = rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadLanguageFeatures, inst.createInstance(mainThreadLanguageFeatures_1.MainThreadLanguageFeatures, rpcProtocol));
        });
        suiteTeardown(function () {
            errors_1.setUnexpectedErrorHandler(originalErrorHandler);
            model.dispose();
            mainThread.dispose();
        });
        teardown(function () {
            while (disposables.length) {
                disposables.pop().dispose();
            }
            return rpcProtocol.sync();
        });
        // --- outline
        test('DocumentSymbols, register/deregister', function () {
            assert.equal(modes_1.DocumentSymbolProviderRegistry.all(model).length, 0);
            var d1 = extHost.registerDocumentSymbolProvider(defaultSelector, {
                provideDocumentSymbols: function () {
                    return [];
                }
            });
            return rpcProtocol.sync().then(function () {
                assert.equal(modes_1.DocumentSymbolProviderRegistry.all(model).length, 1);
                d1.dispose();
                return rpcProtocol.sync();
            });
        });
        test('DocumentSymbols, evil provider', function () {
            disposables.push(extHost.registerDocumentSymbolProvider(defaultSelector, {
                provideDocumentSymbols: function () {
                    throw new Error('evil document symbol provider');
                }
            }));
            disposables.push(extHost.registerDocumentSymbolProvider(defaultSelector, {
                provideDocumentSymbols: function () {
                    return [new types.SymbolInformation('test', types.SymbolKind.Field, new types.Range(0, 0, 0, 0))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return quickOpen_1.getDocumentSymbols(model).then(function (value) {
                    assert.equal(value.entries.length, 1);
                });
            });
        });
        test('DocumentSymbols, data conversion', function () {
            disposables.push(extHost.registerDocumentSymbolProvider(defaultSelector, {
                provideDocumentSymbols: function () {
                    return [new types.SymbolInformation('test', types.SymbolKind.Field, new types.Range(0, 0, 0, 0))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return quickOpen_1.getDocumentSymbols(model).then(function (value) {
                    assert.equal(value.entries.length, 1);
                    var entry = value.entries[0];
                    assert.equal(entry.name, 'test');
                    assert.deepEqual(entry.location.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
                });
            });
        });
        // --- code lens
        test('CodeLens, evil provider', function () {
            disposables.push(extHost.registerCodeLensProvider(defaultSelector, {
                provideCodeLenses: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerCodeLensProvider(defaultSelector, {
                provideCodeLenses: function () {
                    return [new types.CodeLens(new types.Range(0, 0, 0, 0))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return codelens_1.getCodeLensData(model).then(function (value) {
                    assert.equal(value.length, 1);
                });
            });
        });
        test('CodeLens, do not resolve a resolved lens', function () {
            disposables.push(extHost.registerCodeLensProvider(defaultSelector, {
                provideCodeLenses: function () {
                    return [new types.CodeLens(new types.Range(0, 0, 0, 0), { command: 'id', title: 'Title' })];
                },
                resolveCodeLens: function () {
                    assert.ok(false, 'do not resolve');
                }
            }));
            return rpcProtocol.sync().then(function () {
                return codelens_1.getCodeLensData(model).then(function (value) {
                    assert.equal(value.length, 1);
                    var data = value[0];
                    return async_1.asWinJsPromise(function (token) {
                        return data.provider.resolveCodeLens(model, data.symbol, token);
                    }).then(function (symbol) {
                        assert.equal(symbol.command.id, 'id');
                        assert.equal(symbol.command.title, 'Title');
                    });
                });
            });
        });
        test('CodeLens, missing command', function () {
            disposables.push(extHost.registerCodeLensProvider(defaultSelector, {
                provideCodeLenses: function () {
                    return [new types.CodeLens(new types.Range(0, 0, 0, 0))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return codelens_1.getCodeLensData(model).then(function (value) {
                    assert.equal(value.length, 1);
                    var data = value[0];
                    return async_1.asWinJsPromise(function (token) {
                        return data.provider.resolveCodeLens(model, data.symbol, token);
                    }).then(function (symbol) {
                        assert.equal(symbol.command.id, 'missing');
                        assert.equal(symbol.command.title, '<<MISSING COMMAND>>');
                    });
                });
            });
        });
        // --- definition
        test('Definition, data conversion', function () {
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return [new types.Location(model.uri, new types.Range(1, 2, 3, 4))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return goToDeclaration_1.getDefinitionsAtPosition(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 2, startColumn: 3, endLineNumber: 4, endColumn: 5 });
                    assert.equal(entry.uri.toString(), model.uri.toString());
                });
            });
        });
        test('Definition, one or many', function () {
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return [new types.Location(model.uri, new types.Range(1, 1, 1, 1))];
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return new types.Location(model.uri, new types.Range(1, 1, 1, 1));
                }
            }));
            return rpcProtocol.sync().then(function () {
                return goToDeclaration_1.getDefinitionsAtPosition(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 2);
                });
            });
        });
        test('Definition, registration order', function () {
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return [new types.Location(uri_1.default.parse('far://first'), new types.Range(2, 3, 4, 5))];
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return new types.Location(uri_1.default.parse('far://second'), new types.Range(1, 2, 3, 4));
                }
            }));
            return rpcProtocol.sync().then(function () {
                return goToDeclaration_1.getDefinitionsAtPosition(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 2);
                    // let [first, second] = value;
                    assert.equal(value[0].uri.authority, 'second');
                    assert.equal(value[1].uri.authority, 'first');
                });
            });
        });
        test('Definition, evil provider', function () {
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    throw new Error('evil provider');
                }
            }));
            disposables.push(extHost.registerDefinitionProvider(defaultSelector, {
                provideDefinition: function () {
                    return new types.Location(model.uri, new types.Range(1, 1, 1, 1));
                }
            }));
            return rpcProtocol.sync().then(function () {
                return goToDeclaration_1.getDefinitionsAtPosition(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 1);
                });
            });
        });
        // --- implementation
        test('Implementation, data conversion', function () {
            disposables.push(extHost.registerImplementationProvider(defaultSelector, {
                provideImplementation: function () {
                    return [new types.Location(model.uri, new types.Range(1, 2, 3, 4))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return goToDeclaration_1.getImplementationsAtPosition(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 2, startColumn: 3, endLineNumber: 4, endColumn: 5 });
                    assert.equal(entry.uri.toString(), model.uri.toString());
                });
            });
        });
        // --- type definition
        test('Type Definition, data conversion', function () {
            disposables.push(extHost.registerTypeDefinitionProvider(defaultSelector, {
                provideTypeDefinition: function () {
                    return [new types.Location(model.uri, new types.Range(1, 2, 3, 4))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return goToDeclaration_1.getTypeDefinitionsAtPosition(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 2, startColumn: 3, endLineNumber: 4, endColumn: 5 });
                    assert.equal(entry.uri.toString(), model.uri.toString());
                });
            });
        });
        // --- extra info
        test('HoverProvider, word range at pos', function () {
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    return new types.Hover('Hello');
                }
            }));
            return rpcProtocol.sync().then(function () {
                getHover_1.getHover(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 5 });
                });
            });
        });
        test('HoverProvider, given range', function () {
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    return new types.Hover('Hello', new types.Range(3, 0, 8, 7));
                }
            }));
            return rpcProtocol.sync().then(function () {
                getHover_1.getHover(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 4, startColumn: 1, endLineNumber: 9, endColumn: 8 });
                });
            });
        });
        test('HoverProvider, registration order', function () {
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    return new types.Hover('registered first');
                }
            }));
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    return new types.Hover('registered second');
                }
            }));
            return rpcProtocol.sync().then(function () {
                return getHover_1.getHover(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 2);
                    var _a = value, first = _a[0], second = _a[1];
                    assert.equal(first.contents[0].value, 'registered second');
                    assert.equal(second.contents[0].value, 'registered first');
                });
            });
        });
        test('HoverProvider, evil provider', function () {
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerHoverProvider(defaultSelector, {
                provideHover: function () {
                    return new types.Hover('Hello');
                }
            }));
            return rpcProtocol.sync().then(function () {
                getHover_1.getHover(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value.length, 1);
                });
            });
        });
        // --- occurrences
        test('Occurrences, data conversion', function () {
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 4))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return wordHighlighter_1.getOccurrencesAtPosition(model, new position_1.Position(1, 2)).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 5 });
                    assert.equal(entry.kind, modes_1.DocumentHighlightKind.Text);
                });
            });
        });
        test('Occurrences, order 1/2', function () {
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    return [];
                }
            }));
            disposables.push(extHost.registerDocumentHighlightProvider('*', {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 4))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return wordHighlighter_1.getOccurrencesAtPosition(model, new position_1.Position(1, 2)).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 5 });
                    assert.equal(entry.kind, modes_1.DocumentHighlightKind.Text);
                });
            });
        });
        test('Occurrences, order 2/2', function () {
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 2))];
                }
            }));
            disposables.push(extHost.registerDocumentHighlightProvider('*', {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 4))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return wordHighlighter_1.getOccurrencesAtPosition(model, new position_1.Position(1, 2)).then(function (value) {
                    assert.equal(value.length, 1);
                    var entry = value[0];
                    assert.deepEqual(entry.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 3 });
                    assert.equal(entry.kind, modes_1.DocumentHighlightKind.Text);
                });
            });
        });
        test('Occurrences, evil provider', function () {
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerDocumentHighlightProvider(defaultSelector, {
                provideDocumentHighlights: function () {
                    return [new types.DocumentHighlight(new types.Range(0, 0, 0, 4))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return wordHighlighter_1.getOccurrencesAtPosition(model, new position_1.Position(1, 2)).then(function (value) {
                    assert.equal(value.length, 1);
                });
            });
        });
        // --- references
        test('References, registration order', function () {
            disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                provideReferences: function () {
                    return [new types.Location(uri_1.default.parse('far://register/first'), new types.Range(0, 0, 0, 0))];
                }
            }));
            disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                provideReferences: function () {
                    return [new types.Location(uri_1.default.parse('far://register/second'), new types.Range(0, 0, 0, 0))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return referenceSearch_1.provideReferences(model, new position_1.Position(1, 2)).then(function (value) {
                    assert.equal(value.length, 2);
                    var first = value[0], second = value[1];
                    assert.equal(first.uri.path, '/second');
                    assert.equal(second.uri.path, '/first');
                });
            });
        });
        test('References, data conversion', function () {
            disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                provideReferences: function () {
                    return [new types.Location(model.uri, new types.Position(0, 0))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return referenceSearch_1.provideReferences(model, new position_1.Position(1, 2)).then(function (value) {
                    assert.equal(value.length, 1);
                    var item = value[0];
                    assert.deepEqual(item.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
                    assert.equal(item.uri.toString(), model.uri.toString());
                });
            });
        });
        test('References, evil provider', function () {
            disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                provideReferences: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerReferenceProvider(defaultSelector, {
                provideReferences: function () {
                    return [new types.Location(model.uri, new types.Range(0, 0, 0, 0))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return referenceSearch_1.provideReferences(model, new position_1.Position(1, 2)).then(function (value) {
                    assert.equal(value.length, 1);
                });
            });
        });
        // --- quick fix
        test('Quick Fix, command data conversion', function () {
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    return [
                        { command: 'test1', title: 'Testing1' },
                        { command: 'test2', title: 'Testing2' }
                    ];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return quickFix_1.getCodeActions(model, model.getFullModelRange()).then(function (value) {
                    assert.equal(value.length, 2);
                    var first = value[0], second = value[1];
                    assert.equal(first.title, 'Testing1');
                    assert.equal(first.command.id, 'test1');
                    assert.equal(second.title, 'Testing2');
                    assert.equal(second.command.id, 'test2');
                });
            });
        });
        test('Quick Fix, code action data conversion', function () {
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    return [
                        {
                            title: 'Testing1',
                            command: { title: 'Testing1Command', command: 'test1' },
                            kind: types.CodeActionKind.Empty.append('test.scope')
                        }
                    ];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return quickFix_1.getCodeActions(model, model.getFullModelRange()).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.title, 'Testing1');
                    assert.equal(first.command.title, 'Testing1Command');
                    assert.equal(first.command.id, 'test1');
                    assert.equal(first.kind, 'test.scope');
                });
            });
        });
        test('Cannot read property \'id\' of undefined, #29469', function () {
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    return [
                        undefined,
                        null,
                        { command: 'test', title: 'Testing' }
                    ];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return quickFix_1.getCodeActions(model, model.getFullModelRange()).then(function (value) {
                    assert.equal(value.length, 1);
                });
            });
        });
        test('Quick Fix, evil provider', function () {
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerCodeActionProvider(defaultSelector, {
                provideCodeActions: function () {
                    return [{ command: 'test', title: 'Testing' }];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return quickFix_1.getCodeActions(model, model.getFullModelRange()).then(function (value) {
                    assert.equal(value.length, 1);
                });
            });
        });
        // --- navigate types
        test('Navigate types, evil provider', function () {
            disposables.push(extHost.registerWorkspaceSymbolProvider({
                provideWorkspaceSymbols: function () {
                    throw new Error('evil');
                }
            }));
            disposables.push(extHost.registerWorkspaceSymbolProvider({
                provideWorkspaceSymbols: function () {
                    return [new types.SymbolInformation('testing', types.SymbolKind.Array, new types.Range(0, 0, 1, 1))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return search_1.getWorkspaceSymbols('').then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    var symbols = first[1];
                    assert.equal(symbols.length, 1);
                    assert.equal(symbols[0].name, 'testing');
                });
            });
        });
        // --- rename
        test('Rename, evil provider 0/2', function () {
            disposables.push(extHost.registerRenameProvider(defaultSelector, {
                provideRenameEdits: function () {
                    throw new /** @class */ (function () {
                        function Foo() {
                        }
                        return Foo;
                    }());
                }
            }));
            return rpcProtocol.sync().then(function () {
                return rename_1.rename(model, new position_1.Position(1, 1), 'newName').then(function (value) {
                    throw Error();
                }, function (err) {
                    // expected
                });
            });
        });
        test('Rename, evil provider 1/2', function () {
            disposables.push(extHost.registerRenameProvider(defaultSelector, {
                provideRenameEdits: function () {
                    throw Error('evil');
                }
            }));
            return rpcProtocol.sync().then(function () {
                return rename_1.rename(model, new position_1.Position(1, 1), 'newName').then(function (value) {
                    assert.equal(value.rejectReason, 'evil');
                });
            });
        });
        test('Rename, evil provider 2/2', function () {
            disposables.push(extHost.registerRenameProvider('*', {
                provideRenameEdits: function () {
                    throw Error('evil');
                }
            }));
            disposables.push(extHost.registerRenameProvider(defaultSelector, {
                provideRenameEdits: function () {
                    var edit = new types.WorkspaceEdit();
                    edit.replace(model.uri, new types.Range(0, 0, 0, 0), 'testing');
                    return edit;
                }
            }));
            return rpcProtocol.sync().then(function () {
                return rename_1.rename(model, new position_1.Position(1, 1), 'newName').then(function (value) {
                    assert.equal(value.edits.length, 1);
                });
            });
        });
        test('Rename, ordering', function () {
            disposables.push(extHost.registerRenameProvider('*', {
                provideRenameEdits: function () {
                    var edit = new types.WorkspaceEdit();
                    edit.replace(model.uri, new types.Range(0, 0, 0, 0), 'testing');
                    edit.replace(model.uri, new types.Range(1, 0, 1, 0), 'testing');
                    return edit;
                }
            }));
            disposables.push(extHost.registerRenameProvider(defaultSelector, {
                provideRenameEdits: function () {
                    return;
                }
            }));
            return rpcProtocol.sync().then(function () {
                return rename_1.rename(model, new position_1.Position(1, 1), 'newName').then(function (value) {
                    assert.equal(value.edits.length, 1); // least relevant renamer
                    assert.equal(value.edits[0].edits.length, 2); // least relevant renamer
                });
            });
        });
        // --- parameter hints
        test('Parameter Hints, order', function () {
            disposables.push(extHost.registerSignatureHelpProvider(defaultSelector, {
                provideSignatureHelp: function () {
                    return undefined;
                }
            }, []));
            disposables.push(extHost.registerSignatureHelpProvider(defaultSelector, {
                provideSignatureHelp: function () {
                    return {
                        signatures: [],
                        activeParameter: 0,
                        activeSignature: 0
                    };
                }
            }, []));
            return rpcProtocol.sync().then(function () {
                return provideSignatureHelp_1.provideSignatureHelp(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.ok(value);
                });
            });
        });
        test('Parameter Hints, evil provider', function () {
            disposables.push(extHost.registerSignatureHelpProvider(defaultSelector, {
                provideSignatureHelp: function () {
                    throw new Error('evil');
                }
            }, []));
            return rpcProtocol.sync().then(function () {
                return provideSignatureHelp_1.provideSignatureHelp(model, new position_1.Position(1, 1)).then(function (value) {
                    assert.equal(value, undefined);
                });
            });
        });
        // --- suggestions
        test('Suggest, order 1/3', function () {
            disposables.push(extHost.registerCompletionItemProvider('*', {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('testing1')];
                }
            }, []));
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('testing2')];
                }
            }, []));
            return rpcProtocol.sync().then(function () {
                return suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), 'none').then(function (value) {
                    assert.equal(value.length, 1);
                    assert.equal(value[0].suggestion.insertText, 'testing2');
                });
            });
        });
        test('Suggest, order 2/3', function () {
            disposables.push(extHost.registerCompletionItemProvider('*', {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('weak-selector')]; // weaker selector but result
                }
            }, []));
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return []; // stronger selector but not a good result;
                }
            }, []));
            return rpcProtocol.sync().then(function () {
                return suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), 'none').then(function (value) {
                    assert.equal(value.length, 1);
                    assert.equal(value[0].suggestion.insertText, 'weak-selector');
                });
            });
        });
        test('Suggest, order 2/3', function () {
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('strong-1')];
                }
            }, []));
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('strong-2')];
                }
            }, []));
            return rpcProtocol.sync().then(function () {
                return suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), 'none').then(function (value) {
                    assert.equal(value.length, 2);
                    assert.equal(value[0].suggestion.insertText, 'strong-1'); // sort by label
                    assert.equal(value[1].suggestion.insertText, 'strong-2');
                });
            });
        });
        test('Suggest, evil provider', function () {
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    throw new Error('evil');
                }
            }, []));
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return [new types.CompletionItem('testing')];
                }
            }, []));
            return rpcProtocol.sync().then(function () {
                return suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), 'none').then(function (value) {
                    assert.equal(value[0].container.incomplete, undefined);
                });
            });
        });
        test('Suggest, CompletionList', function () {
            disposables.push(extHost.registerCompletionItemProvider(defaultSelector, {
                provideCompletionItems: function () {
                    return new types.CompletionList([new types.CompletionItem('hello')], true);
                }
            }, []));
            return rpcProtocol.sync().then(function () {
                suggest_1.provideSuggestionItems(model, new position_1.Position(1, 1), 'none').then(function (value) {
                    assert.equal(value[0].container.incomplete, true);
                });
            });
        });
        // --- format
        test('Format Doc, data conversion', function () {
            disposables.push(extHost.registerDocumentFormattingEditProvider(defaultSelector, {
                provideDocumentFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 0, 0), 'testing'), types.TextEdit.setEndOfLine(types.EndOfLine.LF)];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return format_1.getDocumentFormattingEdits(model, { insertSpaces: true, tabSize: 4 }).then(function (value) {
                    assert.equal(value.length, 2);
                    var first = value[0], second = value[1];
                    assert.equal(first.text, 'testing');
                    assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
                    assert.equal(second.eol, model_1.EndOfLineSequence.LF);
                    assert.equal(second.text, '');
                    assert.equal(second.range, undefined);
                });
            });
        });
        test('Format Doc, evil provider', function () {
            disposables.push(extHost.registerDocumentFormattingEditProvider(defaultSelector, {
                provideDocumentFormattingEdits: function () {
                    throw new Error('evil');
                }
            }));
            return rpcProtocol.sync().then(function () {
                return format_1.getDocumentFormattingEdits(model, { insertSpaces: true, tabSize: 4 });
            });
        });
        test('Format Doc, order', function () {
            disposables.push(extHost.registerDocumentFormattingEditProvider(defaultSelector, {
                provideDocumentFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 0, 0), 'testing')];
                }
            }));
            disposables.push(extHost.registerDocumentFormattingEditProvider(defaultSelector, {
                provideDocumentFormattingEdits: function () {
                    return undefined;
                }
            }));
            return rpcProtocol.sync().then(function () {
                return format_1.getDocumentFormattingEdits(model, { insertSpaces: true, tabSize: 4 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.text, 'testing');
                    assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
                });
            });
        });
        test('Format Range, data conversion', function () {
            disposables.push(extHost.registerDocumentRangeFormattingEditProvider(defaultSelector, {
                provideDocumentRangeFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 0, 0), 'testing')];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return format_1.getDocumentRangeFormattingEdits(model, new range_1.Range(1, 1, 1, 1), { insertSpaces: true, tabSize: 4 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.text, 'testing');
                    assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
                });
            });
        });
        test('Format Range, + format_doc', function () {
            disposables.push(extHost.registerDocumentRangeFormattingEditProvider(defaultSelector, {
                provideDocumentRangeFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 0, 0), 'range')];
                }
            }));
            disposables.push(extHost.registerDocumentFormattingEditProvider(defaultSelector, {
                provideDocumentFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 1, 1), 'doc')];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return format_1.getDocumentRangeFormattingEdits(model, new range_1.Range(1, 1, 1, 1), { insertSpaces: true, tabSize: 4 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.text, 'range');
                });
            });
        });
        test('Format Range, evil provider', function () {
            disposables.push(extHost.registerDocumentRangeFormattingEditProvider(defaultSelector, {
                provideDocumentRangeFormattingEdits: function () {
                    throw new Error('evil');
                }
            }));
            return rpcProtocol.sync().then(function () {
                return format_1.getDocumentRangeFormattingEdits(model, new range_1.Range(1, 1, 1, 1), { insertSpaces: true, tabSize: 4 });
            });
        });
        test('Format on Type, data conversion', function () {
            disposables.push(extHost.registerOnTypeFormattingEditProvider(defaultSelector, {
                provideOnTypeFormattingEdits: function () {
                    return [new types.TextEdit(new types.Range(0, 0, 0, 0), arguments[2])];
                }
            }, [';']));
            return rpcProtocol.sync().then(function () {
                return format_1.getOnTypeFormattingEdits(model, new position_1.Position(1, 1), ';', { insertSpaces: true, tabSize: 2 }).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.text, ';');
                    assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
                });
            });
        });
        test('Links, data conversion', function () {
            disposables.push(extHost.registerDocumentLinkProvider(defaultSelector, {
                provideDocumentLinks: function () {
                    return [new types.DocumentLink(new types.Range(0, 0, 1, 1), uri_1.default.parse('foo:bar#3'))];
                }
            }));
            return rpcProtocol.sync().then(function () {
                return getLinks_1.getLinks(model).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.url, 'foo:bar#3');
                    assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 2, endColumn: 2 });
                });
            });
        });
        test('Links, evil provider', function () {
            disposables.push(extHost.registerDocumentLinkProvider(defaultSelector, {
                provideDocumentLinks: function () {
                    return [new types.DocumentLink(new types.Range(0, 0, 1, 1), uri_1.default.parse('foo:bar#3'))];
                }
            }));
            disposables.push(extHost.registerDocumentLinkProvider(defaultSelector, {
                provideDocumentLinks: function () {
                    throw new Error();
                }
            }));
            return rpcProtocol.sync().then(function () {
                return getLinks_1.getLinks(model).then(function (value) {
                    assert.equal(value.length, 1);
                    var first = value[0];
                    assert.equal(first.url, 'foo:bar#3');
                    assert.deepEqual(first.range, { startLineNumber: 1, startColumn: 1, endLineNumber: 2, endColumn: 2 });
                });
            });
        });
    });
});
