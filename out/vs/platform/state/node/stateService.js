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
define(["require", "exports", "path", "original-fs", "vs/platform/environment/common/environment", "vs/base/node/extfs", "vs/base/common/types", "vs/platform/log/common/log"], function (require, exports, path, fs, environment_1, extfs_1, types_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileStorage = /** @class */ (function () {
        function FileStorage(dbPath, onError) {
            this.dbPath = dbPath;
            this.onError = onError;
            this.database = null;
        }
        FileStorage.prototype.ensureLoaded = function () {
            if (!this.database) {
                this.database = this.loadSync();
            }
        };
        FileStorage.prototype.getItem = function (key, defaultValue) {
            this.ensureLoaded();
            var res = this.database[key];
            if (types_1.isUndefinedOrNull(res)) {
                return defaultValue;
            }
            return res;
        };
        FileStorage.prototype.setItem = function (key, data) {
            this.ensureLoaded();
            // Remove an item when it is undefined or null
            if (types_1.isUndefinedOrNull(data)) {
                return this.removeItem(key);
            }
            // Shortcut for primitives that did not change
            if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
                if (this.database[key] === data) {
                    return;
                }
            }
            this.database[key] = data;
            this.saveSync();
        };
        FileStorage.prototype.removeItem = function (key) {
            this.ensureLoaded();
            // Only update if the key is actually present (not undefined)
            if (!types_1.isUndefined(this.database[key])) {
                this.database[key] = void 0;
                this.saveSync();
            }
        };
        FileStorage.prototype.loadSync = function () {
            try {
                return JSON.parse(fs.readFileSync(this.dbPath).toString()); // invalid JSON or permission issue can happen here
            }
            catch (error) {
                if (error && error.code !== 'ENOENT') {
                    this.onError(error);
                }
                return {};
            }
        };
        FileStorage.prototype.saveSync = function () {
            try {
                extfs_1.writeFileAndFlushSync(this.dbPath, JSON.stringify(this.database, null, 4)); // permission issue can happen here
            }
            catch (error) {
                this.onError(error);
            }
        };
        return FileStorage;
    }());
    exports.FileStorage = FileStorage;
    var StateService = /** @class */ (function () {
        function StateService(environmentService, logService) {
            this.fileStorage = new FileStorage(path.join(environmentService.userDataPath, 'storage.json'), function (error) { return logService.error(error); });
        }
        StateService.prototype.getItem = function (key, defaultValue) {
            return this.fileStorage.getItem(key, defaultValue);
        };
        StateService.prototype.setItem = function (key, data) {
            this.fileStorage.setItem(key, data);
        };
        StateService.prototype.removeItem = function (key) {
            this.fileStorage.removeItem(key);
        };
        StateService = __decorate([
            __param(0, environment_1.IEnvironmentService), __param(1, log_1.ILogService)
        ], StateService);
        return StateService;
    }());
    exports.StateService = StateService;
});
