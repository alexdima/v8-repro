define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/winjs.base", "vs/editor/common/modes/abstractMode", "vs/editor/common/services/languagesRegistry"], function (require, exports, errors_1, event_1, winjs_base_1, abstractMode_1, languagesRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ModeServiceImpl = /** @class */ (function () {
        function ModeServiceImpl(warnOnOverwrite) {
            if (warnOnOverwrite === void 0) { warnOnOverwrite = false; }
            this._onDidCreateMode = new event_1.Emitter();
            this.onDidCreateMode = this._onDidCreateMode.event;
            this._instantiatedModes = {};
            this._registry = new languagesRegistry_1.LanguagesRegistry(true, warnOnOverwrite);
        }
        ModeServiceImpl.prototype._onReady = function () {
            return winjs_base_1.TPromise.as(true);
        };
        ModeServiceImpl.prototype.isRegisteredMode = function (mimetypeOrModeId) {
            return this._registry.isRegisteredMode(mimetypeOrModeId);
        };
        ModeServiceImpl.prototype.getRegisteredModes = function () {
            return this._registry.getRegisteredModes();
        };
        ModeServiceImpl.prototype.getRegisteredLanguageNames = function () {
            return this._registry.getRegisteredLanguageNames();
        };
        ModeServiceImpl.prototype.getExtensions = function (alias) {
            return this._registry.getExtensions(alias);
        };
        ModeServiceImpl.prototype.getFilenames = function (alias) {
            return this._registry.getFilenames(alias);
        };
        ModeServiceImpl.prototype.getMimeForMode = function (modeId) {
            return this._registry.getMimeForMode(modeId);
        };
        ModeServiceImpl.prototype.getLanguageName = function (modeId) {
            return this._registry.getLanguageName(modeId);
        };
        ModeServiceImpl.prototype.getModeIdForLanguageName = function (alias) {
            return this._registry.getModeIdForLanguageNameLowercase(alias);
        };
        ModeServiceImpl.prototype.getModeIdByFilenameOrFirstLine = function (filename, firstLine) {
            var modeIds = this._registry.getModeIdsFromFilenameOrFirstLine(filename, firstLine);
            if (modeIds.length > 0) {
                return modeIds[0];
            }
            return null;
        };
        ModeServiceImpl.prototype.getModeId = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            var modeIds = this._registry.extractModeIds(commaSeparatedMimetypesOrCommaSeparatedIds);
            if (modeIds.length > 0) {
                return modeIds[0];
            }
            return null;
        };
        ModeServiceImpl.prototype.getLanguageIdentifier = function (modeId) {
            return this._registry.getLanguageIdentifier(modeId);
        };
        ModeServiceImpl.prototype.getConfigurationFiles = function (modeId) {
            return this._registry.getConfigurationFiles(modeId);
        };
        // --- instantiation
        ModeServiceImpl.prototype.getMode = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            var modeIds = this._registry.extractModeIds(commaSeparatedMimetypesOrCommaSeparatedIds);
            var isPlainText = false;
            for (var i = 0; i < modeIds.length; i++) {
                if (this._instantiatedModes.hasOwnProperty(modeIds[i])) {
                    return this._instantiatedModes[modeIds[i]];
                }
                isPlainText = isPlainText || (modeIds[i] === 'plaintext');
            }
            if (isPlainText) {
                // Try to do it synchronously
                var r_1 = null;
                this.getOrCreateMode(commaSeparatedMimetypesOrCommaSeparatedIds).then(function (mode) {
                    r_1 = mode;
                }).done(null, errors_1.onUnexpectedError);
                return r_1;
            }
            return null;
        };
        ModeServiceImpl.prototype.getOrCreateMode = function (commaSeparatedMimetypesOrCommaSeparatedIds) {
            var _this = this;
            return this._onReady().then(function () {
                var modeId = _this.getModeId(commaSeparatedMimetypesOrCommaSeparatedIds);
                // Fall back to plain text if no mode was found
                return _this._getOrCreateMode(modeId || 'plaintext');
            });
        };
        ModeServiceImpl.prototype.getOrCreateModeByLanguageName = function (languageName) {
            var _this = this;
            return this._onReady().then(function () {
                var modeId = _this._getModeIdByLanguageName(languageName);
                // Fall back to plain text if no mode was found
                return _this._getOrCreateMode(modeId || 'plaintext');
            });
        };
        ModeServiceImpl.prototype._getModeIdByLanguageName = function (languageName) {
            var modeIds = this._registry.getModeIdsFromLanguageName(languageName);
            if (modeIds.length > 0) {
                return modeIds[0];
            }
            return null;
        };
        ModeServiceImpl.prototype.getOrCreateModeByFilenameOrFirstLine = function (filename, firstLine) {
            var _this = this;
            return this._onReady().then(function () {
                var modeId = _this.getModeIdByFilenameOrFirstLine(filename, firstLine);
                // Fall back to plain text if no mode was found
                return _this._getOrCreateMode(modeId || 'plaintext');
            });
        };
        ModeServiceImpl.prototype._getOrCreateMode = function (modeId) {
            if (!this._instantiatedModes.hasOwnProperty(modeId)) {
                var languageIdentifier = this.getLanguageIdentifier(modeId);
                this._instantiatedModes[modeId] = new abstractMode_1.FrankensteinMode(languageIdentifier);
                this._onDidCreateMode.fire(this._instantiatedModes[modeId]);
            }
            return this._instantiatedModes[modeId];
        };
        return ModeServiceImpl;
    }());
    exports.ModeServiceImpl = ModeServiceImpl;
});
