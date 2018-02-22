/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/base/common/uri", "vs/base/common/platform", "vs/base/common/network"], function (require, exports, electron_1, uri_1, platform_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ClipboardService = /** @class */ (function () {
        function ClipboardService() {
        }
        ClipboardService.prototype.writeText = function (text) {
            electron_1.clipboard.writeText(text);
        };
        ClipboardService.prototype.readText = function () {
            return electron_1.clipboard.readText();
        };
        ClipboardService.prototype.readFindText = function () {
            if (platform_1.isMacintosh) {
                return electron_1.clipboard.readFindText();
            }
            return '';
        };
        ClipboardService.prototype.writeFindText = function (text) {
            if (platform_1.isMacintosh) {
                electron_1.clipboard.writeFindText(text);
            }
        };
        ClipboardService.prototype.writeFiles = function (resources) {
            var files = resources.filter(function (f) { return f.scheme === network_1.Schemas.file; });
            if (files.length) {
                electron_1.clipboard.writeBuffer(ClipboardService.FILE_FORMAT, this.filesToBuffer(files));
            }
        };
        ClipboardService.prototype.readFiles = function () {
            return this.bufferToFiles(electron_1.clipboard.readBuffer(ClipboardService.FILE_FORMAT));
        };
        ClipboardService.prototype.hasFiles = function () {
            return electron_1.clipboard.has(ClipboardService.FILE_FORMAT);
        };
        ClipboardService.prototype.filesToBuffer = function (resources) {
            return new Buffer(resources.map(function (r) { return r.fsPath; }).join('\n'));
        };
        ClipboardService.prototype.bufferToFiles = function (buffer) {
            if (!buffer) {
                return [];
            }
            var bufferValue = buffer.toString();
            if (!bufferValue) {
                return [];
            }
            try {
                return bufferValue.split('\n').map(function (f) { return uri_1.default.file(f); });
            }
            catch (error) {
                return []; // do not trust clipboard data
            }
        };
        // Clipboard format for files
        ClipboardService.FILE_FORMAT = 'code/file-list';
        return ClipboardService;
    }());
    exports.ClipboardService = ClipboardService;
});
