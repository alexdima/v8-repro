/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/strings", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/instantiation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/core/position", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/contrib/format/format", "vs/editor/contrib/format/formatCommand", "vs/platform/configuration/common/configuration", "vs/workbench/services/textfile/common/textFileEditorModel", "../node/extHost.protocol", "vs/editor/common/core/editOperation", "vs/workbench/api/electron-browser/extHostCustomers", "vs/editor/common/services/editorWorkerService", "vs/platform/progress/common/progress", "vs/nls", "vs/base/common/arrays", "vs/platform/log/common/log"], function (require, exports, async_1, strings, codeEditorService_1, textfiles_1, instantiation_1, range_1, selection_1, position_1, trimTrailingWhitespaceCommand_1, format_1, formatCommand_1, configuration_1, textFileEditorModel_1, extHost_protocol_1, editOperation_1, extHostCustomers_1, editorWorkerService_1, progress_1, nls_1, arrays_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TrimWhitespaceParticipant = /** @class */ (function () {
        function TrimWhitespaceParticipant(configurationService, codeEditorService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            // Nothing
        }
        TrimWhitespaceParticipant.prototype.participate = function (model, env) {
            if (this.configurationService.getValue('files.trimTrailingWhitespace', { overrideIdentifier: model.textEditorModel.getLanguageIdentifier().language, resource: model.getResource() })) {
                this.doTrimTrailingWhitespace(model.textEditorModel, env.reason === textfiles_1.SaveReason.AUTO);
            }
        };
        TrimWhitespaceParticipant.prototype.doTrimTrailingWhitespace = function (model, isAutoSaved) {
            var prevSelection = [new selection_1.Selection(1, 1, 1, 1)];
            var cursors = [];
            var editor = findEditor(model, this.codeEditorService);
            if (editor) {
                // Find `prevSelection` in any case do ensure a good undo stack when pushing the edit
                // Collect active cursors in `cursors` only if `isAutoSaved` to avoid having the cursors jump
                prevSelection = editor.getSelections();
                if (isAutoSaved) {
                    cursors.push.apply(cursors, prevSelection.map(function (s) { return new position_1.Position(s.positionLineNumber, s.positionColumn); }));
                }
            }
            var ops = trimTrailingWhitespaceCommand_1.trimTrailingWhitespace(model, cursors);
            if (!ops.length) {
                return; // Nothing to do
            }
            model.pushEditOperations(prevSelection, ops, function (edits) { return prevSelection; });
        };
        TrimWhitespaceParticipant = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, codeEditorService_1.ICodeEditorService)
        ], TrimWhitespaceParticipant);
        return TrimWhitespaceParticipant;
    }());
    function findEditor(model, codeEditorService) {
        var candidate = null;
        if (model.isAttachedToEditor()) {
            for (var _i = 0, _a = codeEditorService.listCodeEditors(); _i < _a.length; _i++) {
                var editor = _a[_i];
                if (editor.getModel() === model) {
                    if (editor.isFocused()) {
                        return editor; // favour focused editor if there are multiple
                    }
                    candidate = editor;
                }
            }
        }
        return candidate;
    }
    var FinalNewLineParticipant = /** @class */ (function () {
        function FinalNewLineParticipant(configurationService, codeEditorService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            // Nothing
        }
        FinalNewLineParticipant.prototype.participate = function (model, env) {
            if (this.configurationService.getValue('files.insertFinalNewline', { overrideIdentifier: model.textEditorModel.getLanguageIdentifier().language, resource: model.getResource() })) {
                this.doInsertFinalNewLine(model.textEditorModel);
            }
        };
        FinalNewLineParticipant.prototype.doInsertFinalNewLine = function (model) {
            var lineCount = model.getLineCount();
            var lastLine = model.getLineContent(lineCount);
            var lastLineIsEmptyOrWhitespace = strings.lastNonWhitespaceIndex(lastLine) === -1;
            if (!lineCount || lastLineIsEmptyOrWhitespace) {
                return;
            }
            var prevSelection = [new selection_1.Selection(1, 1, 1, 1)];
            var editor = findEditor(model, this.codeEditorService);
            if (editor) {
                prevSelection = editor.getSelections();
            }
            model.pushEditOperations(prevSelection, [editOperation_1.EditOperation.insert(new position_1.Position(lineCount, model.getLineMaxColumn(lineCount)), model.getEOL())], function (edits) { return prevSelection; });
            if (editor) {
                editor.setSelections(prevSelection);
            }
        };
        FinalNewLineParticipant = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, codeEditorService_1.ICodeEditorService)
        ], FinalNewLineParticipant);
        return FinalNewLineParticipant;
    }());
    exports.FinalNewLineParticipant = FinalNewLineParticipant;
    var TrimFinalNewLinesParticipant = /** @class */ (function () {
        function TrimFinalNewLinesParticipant(configurationService, codeEditorService) {
            this.configurationService = configurationService;
            this.codeEditorService = codeEditorService;
            // Nothing
        }
        TrimFinalNewLinesParticipant.prototype.participate = function (model, env) {
            if (this.configurationService.getValue('files.trimFinalNewlines', { overrideIdentifier: model.textEditorModel.getLanguageIdentifier().language, resource: model.getResource() })) {
                this.doTrimFinalNewLines(model.textEditorModel);
            }
        };
        TrimFinalNewLinesParticipant.prototype.doTrimFinalNewLines = function (model) {
            var lineCount = model.getLineCount();
            // Do not insert new line if file does not end with new line
            if (lineCount === 1) {
                return;
            }
            var prevSelection = [new selection_1.Selection(1, 1, 1, 1)];
            var editor = findEditor(model, this.codeEditorService);
            if (editor) {
                prevSelection = editor.getSelections();
            }
            var currentLineNumber = model.getLineCount();
            var currentLine = model.getLineContent(currentLineNumber);
            var currentLineIsEmptyOrWhitespace = strings.lastNonWhitespaceIndex(currentLine) === -1;
            while (currentLineIsEmptyOrWhitespace) {
                currentLineNumber--;
                currentLine = model.getLineContent(currentLineNumber);
                currentLineIsEmptyOrWhitespace = strings.lastNonWhitespaceIndex(currentLine) === -1;
            }
            var deletionRange = new range_1.Range(currentLineNumber + 1, 1, lineCount + 1, 1);
            if (!deletionRange.isEmpty()) {
                model.pushEditOperations(prevSelection, [editOperation_1.EditOperation.delete(deletionRange)], function (edits) { return prevSelection; });
            }
            if (editor) {
                editor.setSelections(prevSelection);
            }
        };
        TrimFinalNewLinesParticipant = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, codeEditorService_1.ICodeEditorService)
        ], TrimFinalNewLinesParticipant);
        return TrimFinalNewLinesParticipant;
    }());
    exports.TrimFinalNewLinesParticipant = TrimFinalNewLinesParticipant;
    var FormatOnSaveParticipant = /** @class */ (function () {
        function FormatOnSaveParticipant(_editorService, _editorWorkerService, _configurationService) {
            this._editorService = _editorService;
            this._editorWorkerService = _editorWorkerService;
            this._configurationService = _configurationService;
            // Nothing
        }
        FormatOnSaveParticipant.prototype.participate = function (editorModel, env) {
            var _this = this;
            var model = editorModel.textEditorModel;
            if (env.reason === textfiles_1.SaveReason.AUTO
                || !this._configurationService.getValue('editor.formatOnSave', { overrideIdentifier: model.getLanguageIdentifier().language, resource: editorModel.getResource() })) {
                return undefined;
            }
            var versionNow = model.getVersionId();
            var _a = model.getOptions(), tabSize = _a.tabSize, insertSpaces = _a.insertSpaces;
            return new Promise(function (resolve, reject) {
                setTimeout(reject, 750);
                format_1.getDocumentFormattingEdits(model, { tabSize: tabSize, insertSpaces: insertSpaces })
                    .then(function (edits) { return _this._editorWorkerService.computeMoreMinimalEdits(model.uri, edits); })
                    .then(resolve, function (err) {
                    if (!(err instanceof Error) || err.name !== format_1.NoProviderError.Name) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }).then(function (edits) {
                if (!arrays_1.isFalsyOrEmpty(edits) && versionNow === model.getVersionId()) {
                    var editor = findEditor(model, _this._editorService);
                    if (editor) {
                        _this._editsWithEditor(editor, edits);
                    }
                    else {
                        _this._editWithModel(model, edits);
                    }
                }
            });
        };
        FormatOnSaveParticipant.prototype._editsWithEditor = function (editor, edits) {
            formatCommand_1.EditOperationsCommand.execute(editor, edits, false);
        };
        FormatOnSaveParticipant.prototype._editWithModel = function (model, edits) {
            var range = edits[0].range;
            var initialSelection = new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
            model.pushEditOperations([initialSelection], edits.map(FormatOnSaveParticipant._asIdentEdit), function (undoEdits) {
                for (var _i = 0, undoEdits_1 = undoEdits; _i < undoEdits_1.length; _i++) {
                    var range_2 = undoEdits_1[_i].range;
                    if (range_1.Range.areIntersectingOrTouching(range_2, initialSelection)) {
                        return [new selection_1.Selection(range_2.startLineNumber, range_2.startColumn, range_2.endLineNumber, range_2.endColumn)];
                    }
                }
                return undefined;
            });
        };
        FormatOnSaveParticipant._asIdentEdit = function (_a) {
            var text = _a.text, range = _a.range;
            return {
                text: text,
                range: range_1.Range.lift(range),
                forceMoveMarkers: true
            };
        };
        FormatOnSaveParticipant = __decorate([
            __param(0, codeEditorService_1.ICodeEditorService),
            __param(1, editorWorkerService_1.IEditorWorkerService),
            __param(2, configuration_1.IConfigurationService)
        ], FormatOnSaveParticipant);
        return FormatOnSaveParticipant;
    }());
    var ExtHostSaveParticipant = /** @class */ (function () {
        function ExtHostSaveParticipant(extHostContext) {
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDocumentSaveParticipant);
        }
        ExtHostSaveParticipant.prototype.participate = function (editorModel, env) {
            var _this = this;
            if (editorModel.textEditorModel.isTooLargeForHavingARichMode()) {
                // the model never made it to the extension
                // host meaning we cannot participate in its save
                return undefined;
            }
            return new Promise(function (resolve, reject) {
                setTimeout(reject, 1750);
                _this._proxy.$participateInSave(editorModel.getResource(), env.reason).then(function (values) {
                    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                        var success = values_1[_i];
                        if (!success) {
                            return Promise.reject(new Error('listener failed'));
                        }
                    }
                    return undefined;
                }).then(resolve, reject);
            });
        };
        return ExtHostSaveParticipant;
    }());
    // The save participant can change a model before its saved to support various scenarios like trimming trailing whitespace
    var SaveParticipant = /** @class */ (function () {
        function SaveParticipant(extHostContext, instantiationService, _progressService, _logService) {
            this._progressService = _progressService;
            this._logService = _logService;
            this._saveParticipants = [
                instantiationService.createInstance(TrimWhitespaceParticipant),
                instantiationService.createInstance(FormatOnSaveParticipant),
                instantiationService.createInstance(FinalNewLineParticipant),
                instantiationService.createInstance(TrimFinalNewLinesParticipant),
                instantiationService.createInstance(ExtHostSaveParticipant, extHostContext),
            ];
            // Hook into model
            textFileEditorModel_1.TextFileEditorModel.setSaveParticipant(this);
        }
        SaveParticipant.prototype.dispose = function () {
            textFileEditorModel_1.TextFileEditorModel.setSaveParticipant(undefined);
        };
        SaveParticipant.prototype.participate = function (model, env) {
            var _this = this;
            return this._progressService.withProgress({ location: progress_1.ProgressLocation.Window }, function (progress) {
                progress.report({ message: nls_1.localize('saveParticipants', "Running Save Participants...") });
                var promiseFactory = _this._saveParticipants.map(function (p) { return function () {
                    return Promise.resolve(p.participate(model, env));
                }; });
                return async_1.sequence(promiseFactory).then(function () { }, function (err) { return _this._logService.error(err); });
            });
        };
        SaveParticipant = __decorate([
            extHostCustomers_1.extHostCustomer,
            __param(1, instantiation_1.IInstantiationService),
            __param(2, progress_1.IProgressService2),
            __param(3, log_1.ILogService)
        ], SaveParticipant);
        return SaveParticipant;
    }());
    exports.SaveParticipant = SaveParticipant;
});
