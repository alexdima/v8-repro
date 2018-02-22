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
define(["require", "exports", "assert", "vs/workbench/api/electron-browser/mainThreadSaveParticipant", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/workbenchTestServices", "vs/base/test/common/utils", "vs/editor/common/services/modelService", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files"], function (require, exports, assert, mainThreadSaveParticipant_1, testConfigurationService_1, workbenchTestServices_1, utils_1, modelService_1, range_1, selection_1, textFileEditorModel_1, textfiles_1, files_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(textFileService, modelService) {
            this.textFileService = textFileService;
            this.modelService = modelService;
        }
        ServiceAccessor = __decorate([
            __param(0, textfiles_1.ITextFileService), __param(1, modelService_1.IModelService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    suite('MainThreadSaveParticipant', function () {
        var instantiationService;
        var accessor;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
        });
        teardown(function () {
            accessor.textFileService.models.clear();
            textFileEditorModel_1.TextFileEditorModel.setSaveParticipant(null); // reset any set participant
        });
        test('insert final new line', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/final_new_line.txt'), 'utf8');
            model.load().then(function () {
                var configService = new testConfigurationService_1.TestConfigurationService();
                configService.setUserConfiguration('files', { 'insertFinalNewline': true });
                var participant = new mainThreadSaveParticipant_1.FinalNewLineParticipant(configService, undefined);
                // No new line for empty lines
                var lineContent = '';
                model.textEditorModel.setValue(lineContent);
                participant.participate(model, { reason: textfiles_1.SaveReason.EXPLICIT });
                assert.equal(files_1.snapshotToString(model.createSnapshot()), lineContent);
                // No new line if last line already empty
                lineContent = "Hello New Line" + model.textEditorModel.getEOL();
                model.textEditorModel.setValue(lineContent);
                participant.participate(model, { reason: textfiles_1.SaveReason.EXPLICIT });
                assert.equal(files_1.snapshotToString(model.createSnapshot()), lineContent);
                // New empty line added (single line)
                lineContent = 'Hello New Line';
                model.textEditorModel.setValue(lineContent);
                participant.participate(model, { reason: textfiles_1.SaveReason.EXPLICIT });
                assert.equal(files_1.snapshotToString(model.createSnapshot()), "" + lineContent + model.textEditorModel.getEOL());
                // New empty line added (multi line)
                lineContent = "Hello New Line" + model.textEditorModel.getEOL() + "Hello New Line" + model.textEditorModel.getEOL() + "Hello New Line";
                model.textEditorModel.setValue(lineContent);
                participant.participate(model, { reason: textfiles_1.SaveReason.EXPLICIT });
                assert.equal(files_1.snapshotToString(model.createSnapshot()), "" + lineContent + model.textEditorModel.getEOL());
                done();
            });
        });
        test('trim final new lines', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8');
            model.load().then(function () {
                var configService = new testConfigurationService_1.TestConfigurationService();
                configService.setUserConfiguration('files', { 'trimFinalNewlines': true });
                var participant = new mainThreadSaveParticipant_1.TrimFinalNewLinesParticipant(configService, undefined);
                var textContent = 'Trim New Line';
                var eol = "" + model.textEditorModel.getEOL();
                // No new line removal if last line is not new line
                var lineContent = "" + textContent;
                model.textEditorModel.setValue(lineContent);
                participant.participate(model, { reason: textfiles_1.SaveReason.EXPLICIT });
                assert.equal(files_1.snapshotToString(model.createSnapshot()), lineContent);
                // No new line removal if last line is single new line
                lineContent = "" + textContent + eol;
                model.textEditorModel.setValue(lineContent);
                participant.participate(model, { reason: textfiles_1.SaveReason.EXPLICIT });
                assert.equal(files_1.snapshotToString(model.createSnapshot()), lineContent);
                // Remove new line (single line with two new lines)
                lineContent = "" + textContent + eol + eol;
                model.textEditorModel.setValue(lineContent);
                participant.participate(model, { reason: textfiles_1.SaveReason.EXPLICIT });
                assert.equal(files_1.snapshotToString(model.createSnapshot()), "" + textContent + eol);
                // Remove new lines (multiple lines with multiple new lines)
                lineContent = "" + textContent + eol + textContent + eol + eol + eol;
                model.textEditorModel.setValue(lineContent);
                participant.participate(model, { reason: textfiles_1.SaveReason.EXPLICIT });
                assert.equal(files_1.snapshotToString(model.createSnapshot()), "" + textContent + eol + textContent + eol);
                done();
            });
        });
        test('trim final new lines bug#39750', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8');
            model.load().then(function () {
                var configService = new testConfigurationService_1.TestConfigurationService();
                configService.setUserConfiguration('files', { 'trimFinalNewlines': true });
                var participant = new mainThreadSaveParticipant_1.TrimFinalNewLinesParticipant(configService, undefined);
                var textContent = 'Trim New Line';
                // single line
                var lineContent = "" + textContent;
                model.textEditorModel.setValue(lineContent);
                // apply edits and push to undo stack.
                var textEdits = [{ identifier: null, range: new range_1.Range(1, 14, 1, 14), text: '.', forceMoveMarkers: false }];
                model.textEditorModel.pushEditOperations([new selection_1.Selection(1, 14, 1, 14)], textEdits, function () { return [new selection_1.Selection(1, 15, 1, 15)]; });
                // undo
                model.textEditorModel.undo();
                assert.equal(files_1.snapshotToString(model.createSnapshot()), "" + textContent);
                // trim final new lines should not mess the undo stack
                participant.participate(model, { reason: textfiles_1.SaveReason.EXPLICIT });
                model.textEditorModel.redo();
                assert.equal(files_1.snapshotToString(model.createSnapshot()), textContent + ".");
                done();
            });
        });
    });
});
