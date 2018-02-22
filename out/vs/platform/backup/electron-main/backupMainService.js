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
define(["require", "exports", "vs/base/common/arrays", "fs", "path", "crypto", "vs/base/common/platform", "vs/base/node/extfs", "vs/platform/environment/common/environment", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/workspaces/common/workspaces"], function (require, exports, arrays, fs, path, crypto, platform, extfs, environment_1, configuration_1, files_1, log_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BackupMainService = /** @class */ (function () {
        function BackupMainService(environmentService, configurationService, logService) {
            this.configurationService = configurationService;
            this.logService = logService;
            this.backupHome = environmentService.backupHome;
            this.workspacesJsonPath = environmentService.backupWorkspacesPath;
            this.loadSync();
        }
        BackupMainService.prototype.getWorkspaceBackups = function () {
            if (this.isHotExitOnExitAndWindowClose()) {
                // Only non-folder windows are restored on main process launch when
                // hot exit is configured as onExitAndWindowClose.
                return [];
            }
            return this.backups.rootWorkspaces.slice(0); // return a copy
        };
        BackupMainService.prototype.getFolderBackupPaths = function () {
            if (this.isHotExitOnExitAndWindowClose()) {
                // Only non-folder windows are restored on main process launch when
                // hot exit is configured as onExitAndWindowClose.
                return [];
            }
            return this.backups.folderWorkspaces.slice(0); // return a copy
        };
        BackupMainService.prototype.isHotExitEnabled = function () {
            return this.getHotExitConfig() !== files_1.HotExitConfiguration.OFF;
        };
        BackupMainService.prototype.isHotExitOnExitAndWindowClose = function () {
            return this.getHotExitConfig() === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE;
        };
        BackupMainService.prototype.getHotExitConfig = function () {
            var config = this.configurationService.getValue();
            return (config && config.files && config.files.hotExit) || files_1.HotExitConfiguration.ON_EXIT;
        };
        BackupMainService.prototype.getEmptyWindowBackupPaths = function () {
            return this.backups.emptyWorkspaces.slice(0); // return a copy
        };
        BackupMainService.prototype.registerWorkspaceBackupSync = function (workspace, migrateFrom) {
            this.pushBackupPathsSync(workspace, this.backups.rootWorkspaces);
            var backupPath = path.join(this.backupHome, workspace.id);
            if (migrateFrom) {
                this.moveBackupFolderSync(backupPath, migrateFrom);
            }
            return backupPath;
        };
        BackupMainService.prototype.moveBackupFolderSync = function (backupPath, moveFromPath) {
            // Target exists: make sure to convert existing backups to empty window backups
            if (fs.existsSync(backupPath)) {
                this.convertToEmptyWindowBackup(backupPath);
            }
            // When we have data to migrate from, move it over to the target location
            if (fs.existsSync(moveFromPath)) {
                try {
                    fs.renameSync(moveFromPath, backupPath);
                }
                catch (ex) {
                    this.logService.error("Backup: Could not move backup folder to new location: " + ex.toString());
                }
            }
        };
        BackupMainService.prototype.registerFolderBackupSync = function (folderPath) {
            this.pushBackupPathsSync(folderPath, this.backups.folderWorkspaces);
            return path.join(this.backupHome, this.getFolderHash(folderPath));
        };
        BackupMainService.prototype.registerEmptyWindowBackupSync = function (backupFolder) {
            // Generate a new folder if this is a new empty workspace
            if (!backupFolder) {
                backupFolder = this.getRandomEmptyWindowId();
            }
            this.pushBackupPathsSync(backupFolder, this.backups.emptyWorkspaces);
            return path.join(this.backupHome, backupFolder);
        };
        BackupMainService.prototype.pushBackupPathsSync = function (workspaceIdentifier, target) {
            if (this.indexOf(workspaceIdentifier, target) === -1) {
                target.push(workspaceIdentifier);
                this.saveSync();
            }
        };
        BackupMainService.prototype.removeBackupPathSync = function (workspaceIdentifier, target) {
            if (!target) {
                return;
            }
            var index = this.indexOf(workspaceIdentifier, target);
            if (index === -1) {
                return;
            }
            target.splice(index, 1);
            this.saveSync();
        };
        BackupMainService.prototype.indexOf = function (workspaceIdentifier, target) {
            var _this = this;
            if (!target) {
                return -1;
            }
            var sanitizedWorkspaceIdentifier = this.sanitizeId(workspaceIdentifier);
            return arrays.firstIndex(target, function (id) { return _this.sanitizeId(id) === sanitizedWorkspaceIdentifier; });
        };
        BackupMainService.prototype.sanitizeId = function (workspaceIdentifier) {
            if (workspaces_1.isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
                return this.sanitizePath(workspaceIdentifier);
            }
            return workspaceIdentifier.id;
        };
        BackupMainService.prototype.loadSync = function () {
            var backups;
            try {
                backups = JSON.parse(fs.readFileSync(this.workspacesJsonPath, 'utf8').toString()); // invalid JSON or permission issue can happen here
            }
            catch (error) {
                backups = Object.create(null);
            }
            // Ensure rootWorkspaces is a object[]
            if (backups.rootWorkspaces) {
                var rws = backups.rootWorkspaces;
                if (!Array.isArray(rws) || rws.some(function (r) { return typeof r !== 'object'; })) {
                    backups.rootWorkspaces = [];
                }
            }
            else {
                backups.rootWorkspaces = [];
            }
            // Ensure folderWorkspaces is a string[]
            if (backups.folderWorkspaces) {
                var fws = backups.folderWorkspaces;
                if (!Array.isArray(fws) || fws.some(function (f) { return typeof f !== 'string'; })) {
                    backups.folderWorkspaces = [];
                }
            }
            else {
                backups.folderWorkspaces = [];
            }
            // Ensure emptyWorkspaces is a string[]
            if (backups.emptyWorkspaces) {
                var fws = backups.emptyWorkspaces;
                if (!Array.isArray(fws) || fws.some(function (f) { return typeof f !== 'string'; })) {
                    backups.emptyWorkspaces = [];
                }
            }
            else {
                backups.emptyWorkspaces = [];
            }
            this.backups = this.dedupeBackups(backups);
            // Validate backup workspaces
            this.validateBackupWorkspaces(backups);
        };
        BackupMainService.prototype.dedupeBackups = function (backups) {
            var _this = this;
            // De-duplicate folder/workspace backups. don't worry about cleaning them up any duplicates as
            // they will be removed when there are no backups.
            backups.folderWorkspaces = arrays.distinct(backups.folderWorkspaces, function (ws) { return _this.sanitizePath(ws); });
            backups.rootWorkspaces = arrays.distinct(backups.rootWorkspaces, function (ws) { return _this.sanitizePath(ws.id); });
            return backups;
        };
        BackupMainService.prototype.validateBackupWorkspaces = function (backups) {
            var _this = this;
            var staleBackupWorkspaces = [];
            var workspaceAndFolders = [];
            workspaceAndFolders.push.apply(workspaceAndFolders, backups.rootWorkspaces.map(function (r) { return ({ workspaceIdentifier: r, target: backups.rootWorkspaces }); }));
            workspaceAndFolders.push.apply(workspaceAndFolders, backups.folderWorkspaces.map(function (f) { return ({ workspaceIdentifier: f, target: backups.folderWorkspaces }); }));
            // Validate Workspace and Folder Backups
            workspaceAndFolders.forEach(function (workspaceOrFolder) {
                var workspaceId = workspaceOrFolder.workspaceIdentifier;
                var workspacePath = workspaces_1.isSingleFolderWorkspaceIdentifier(workspaceId) ? workspaceId : workspaceId.configPath;
                var backupPath = path.join(_this.backupHome, workspaces_1.isSingleFolderWorkspaceIdentifier(workspaceId) ? _this.getFolderHash(workspaceId) : workspaceId.id);
                var hasBackups = _this.hasBackupsSync(backupPath);
                var missingWorkspace = hasBackups && !fs.existsSync(workspacePath);
                // If the workspace/folder has no backups, make sure to delete it
                // If the workspace/folder has backups, but the target workspace is missing, convert backups to empty ones
                if (!hasBackups || missingWorkspace) {
                    staleBackupWorkspaces.push({ workspaceIdentifier: workspaceId, backupPath: backupPath, target: workspaceOrFolder.target });
                    if (missingWorkspace) {
                        _this.convertToEmptyWindowBackup(backupPath);
                    }
                }
            });
            // Validate Empty Windows
            backups.emptyWorkspaces.forEach(function (backupFolder) {
                var backupPath = path.join(_this.backupHome, backupFolder);
                if (!_this.hasBackupsSync(backupPath)) {
                    staleBackupWorkspaces.push({ workspaceIdentifier: backupFolder, backupPath: backupPath, target: backups.emptyWorkspaces });
                }
            });
            // Clean up stale backups
            staleBackupWorkspaces.forEach(function (staleBackupWorkspace) {
                var backupPath = staleBackupWorkspace.backupPath, workspaceIdentifier = staleBackupWorkspace.workspaceIdentifier, target = staleBackupWorkspace.target;
                try {
                    extfs.delSync(backupPath);
                }
                catch (ex) {
                    _this.logService.error("Backup: Could not delete stale backup: " + ex.toString());
                }
                _this.removeBackupPathSync(workspaceIdentifier, target);
            });
        };
        BackupMainService.prototype.convertToEmptyWindowBackup = function (backupPath) {
            // New empty window backup
            var identifier = this.getRandomEmptyWindowId();
            this.pushBackupPathsSync(identifier, this.backups.emptyWorkspaces);
            // Rename backupPath to new empty window backup path
            var newEmptyWindowBackupPath = path.join(this.backupHome, identifier);
            try {
                fs.renameSync(backupPath, newEmptyWindowBackupPath);
            }
            catch (ex) {
                this.logService.error("Backup: Could not rename backup folder: " + ex.toString());
                this.removeBackupPathSync(identifier, this.backups.emptyWorkspaces);
                return false;
            }
            return true;
        };
        BackupMainService.prototype.hasBackupsSync = function (backupPath) {
            try {
                var backupSchemas = extfs.readdirSync(backupPath);
                if (backupSchemas.length === 0) {
                    return false; // empty backups
                }
                return backupSchemas.some(function (backupSchema) {
                    try {
                        return extfs.readdirSync(path.join(backupPath, backupSchema)).length > 0;
                    }
                    catch (error) {
                        return false; // invalid folder
                    }
                });
            }
            catch (error) {
                return false; // backup path does not exist
            }
        };
        BackupMainService.prototype.saveSync = function () {
            try {
                // The user data directory must exist so only the Backup directory needs to be checked.
                if (!fs.existsSync(this.backupHome)) {
                    fs.mkdirSync(this.backupHome);
                }
                extfs.writeFileAndFlushSync(this.workspacesJsonPath, JSON.stringify(this.backups));
            }
            catch (ex) {
                this.logService.error("Backup: Could not save workspaces.json: " + ex.toString());
            }
        };
        BackupMainService.prototype.getRandomEmptyWindowId = function () {
            return (Date.now() + Math.round(Math.random() * 1000)).toString();
        };
        BackupMainService.prototype.sanitizePath = function (p) {
            return platform.isLinux ? p : p.toLowerCase();
        };
        BackupMainService.prototype.getFolderHash = function (folderPath) {
            return crypto.createHash('md5').update(this.sanitizePath(folderPath)).digest('hex');
        };
        BackupMainService = __decorate([
            __param(0, environment_1.IEnvironmentService),
            __param(1, configuration_1.IConfigurationService),
            __param(2, log_1.ILogService)
        ], BackupMainService);
        return BackupMainService;
    }());
    exports.BackupMainService = BackupMainService;
});
