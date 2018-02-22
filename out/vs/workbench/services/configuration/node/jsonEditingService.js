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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/json", "vs/base/node/encoding", "vs/base/common/strings", "vs/base/common/jsonEdit", "vs/base/common/async", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/editor/common/services/resolverService", "vs/workbench/services/configuration/common/jsonEditing"], function (require, exports, nls, winjs_base_1, json, encoding, strings, jsonEdit_1, async_1, editOperation_1, range_1, selection_1, textfiles_1, files_1, resolverService_1, jsonEditing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var JSONEditingService = /** @class */ (function () {
        function JSONEditingService(fileService, textModelResolverService, textFileService) {
            this.fileService = fileService;
            this.textModelResolverService = textModelResolverService;
            this.textFileService = textFileService;
            this.queue = new async_1.Queue();
        }
        JSONEditingService.prototype.write = function (resource, value, save) {
            var _this = this;
            return this.queue.queue(function () { return _this.doWriteConfiguration(resource, value, save); }); // queue up writes to prevent race conditions
        };
        JSONEditingService.prototype.doWriteConfiguration = function (resource, value, save) {
            var _this = this;
            return this.resolveAndValidate(resource, save)
                .then(function (reference) { return _this.writeToBuffer(reference.object.textEditorModel, value)
                .then(function () { return reference.dispose(); }); });
        };
        JSONEditingService.prototype.writeToBuffer = function (model, value) {
            var edit = this.getEdits(model, value)[0];
            if (this.applyEditsToBuffer(edit, model)) {
                return this.textFileService.save(model.uri);
            }
            return winjs_base_1.TPromise.as(null);
        };
        JSONEditingService.prototype.applyEditsToBuffer = function (edit, model) {
            var startPosition = model.getPositionAt(edit.offset);
            var endPosition = model.getPositionAt(edit.offset + edit.length);
            var range = new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
            var currentText = model.getValueInRange(range);
            if (edit.content !== currentText) {
                var editOperation = currentText ? editOperation_1.EditOperation.replace(range, edit.content) : editOperation_1.EditOperation.insert(startPosition, edit.content);
                model.pushEditOperations([new selection_1.Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], function () { return []; });
                return true;
            }
            return false;
        };
        JSONEditingService.prototype.getEdits = function (model, configurationValue) {
            var _a = model.getOptions(), tabSize = _a.tabSize, insertSpaces = _a.insertSpaces;
            var eol = model.getEOL();
            var key = configurationValue.key, value = configurationValue.value;
            // Without key, the entire settings file is being replaced, so we just use JSON.stringify
            if (!key) {
                var content = JSON.stringify(value, null, insertSpaces ? strings.repeat(' ', tabSize) : '\t');
                return [{
                        content: content,
                        length: content.length,
                        offset: 0
                    }];
            }
            return jsonEdit_1.setProperty(model.getValue(), [key], value, { tabSize: tabSize, insertSpaces: insertSpaces, eol: eol });
        };
        JSONEditingService.prototype.resolveModelReference = function (resource) {
            var _this = this;
            return this.fileService.existsFile(resource)
                .then(function (exists) {
                var result = exists ? winjs_base_1.TPromise.as(null) : _this.fileService.updateContent(resource, '{}', { encoding: encoding.UTF8 });
                return result.then(function () { return _this.textModelResolverService.createModelReference(resource); });
            });
        };
        JSONEditingService.prototype.hasParseErrors = function (model) {
            var parseErrors = [];
            json.parse(model.getValue(), parseErrors, { allowTrailingComma: true });
            return parseErrors.length > 0;
        };
        JSONEditingService.prototype.resolveAndValidate = function (resource, checkDirty) {
            var _this = this;
            return this.resolveModelReference(resource)
                .then(function (reference) {
                var model = reference.object.textEditorModel;
                if (_this.hasParseErrors(model)) {
                    return _this.wrapError(jsonEditing_1.JSONEditingErrorCode.ERROR_INVALID_FILE);
                }
                // Target cannot be dirty if not writing into buffer
                if (checkDirty && _this.textFileService.isDirty(resource)) {
                    return _this.wrapError(jsonEditing_1.JSONEditingErrorCode.ERROR_FILE_DIRTY);
                }
                return reference;
            });
        };
        JSONEditingService.prototype.wrapError = function (code) {
            var message = this.toErrorMessage(code);
            return winjs_base_1.TPromise.wrapError(new jsonEditing_1.JSONEditingError(message, code));
        };
        JSONEditingService.prototype.toErrorMessage = function (error) {
            switch (error) {
                // User issues
                case jsonEditing_1.JSONEditingErrorCode.ERROR_INVALID_FILE: {
                    return nls.localize('errorInvalidFile', "Unable to write into the file. Please open the file to correct errors/warnings in the file and try again.");
                }
                case jsonEditing_1.JSONEditingErrorCode.ERROR_FILE_DIRTY: {
                    return nls.localize('errorFileDirty', "Unable to write into the file because the file is dirty. Please save the file and try again.");
                }
            }
        };
        JSONEditingService = __decorate([
            __param(0, files_1.IFileService),
            __param(1, resolverService_1.ITextModelService),
            __param(2, textfiles_1.ITextFileService)
        ], JSONEditingService);
        return JSONEditingService;
    }());
    exports.JSONEditingService = JSONEditingService;
});
