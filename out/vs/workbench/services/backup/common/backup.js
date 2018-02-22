/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IBackupFileService = instantiation_1.createDecorator('backupFileService');
    exports.BACKUP_FILE_RESOLVE_OPTIONS = { acceptTextOnly: true, encoding: 'utf8' };
    exports.BACKUP_FILE_UPDATE_OPTIONS = { encoding: 'utf8' };
});
