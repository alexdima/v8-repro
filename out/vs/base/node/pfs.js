/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/node/extfs", "path", "vs/base/common/async", "fs", "os", "vs/base/common/platform", "vs/base/common/event"], function (require, exports, winjs_base_1, extfs, path_1, async_1, fs, os, platform, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function readdir(path) {
        return async_1.nfcall(extfs.readdir, path);
    }
    exports.readdir = readdir;
    function exists(path) {
        return new winjs_base_1.TPromise(function (c) { return fs.exists(path, c); });
    }
    exports.exists = exists;
    function chmod(path, mode) {
        return async_1.nfcall(fs.chmod, path, mode);
    }
    exports.chmod = chmod;
    exports.mkdirp = extfs.mkdirp;
    function rimraf(path) {
        return lstat(path).then(function (stat) {
            if (stat.isDirectory() && !stat.isSymbolicLink()) {
                return readdir(path)
                    .then(function (children) { return winjs_base_1.TPromise.join(children.map(function (child) { return rimraf(path_1.join(path, child)); })); })
                    .then(function () { return rmdir(path); });
            }
            else {
                return unlink(path);
            }
        }, function (err) {
            if (err.code === 'ENOENT') {
                return void 0;
            }
            return winjs_base_1.TPromise.wrapError(err);
        });
    }
    exports.rimraf = rimraf;
    function realpath(path) {
        return async_1.nfcall(extfs.realpath, path);
    }
    exports.realpath = realpath;
    function stat(path) {
        return async_1.nfcall(fs.stat, path);
    }
    exports.stat = stat;
    function lstat(path) {
        return async_1.nfcall(fs.lstat, path);
    }
    exports.lstat = lstat;
    function rename(oldPath, newPath) {
        return async_1.nfcall(fs.rename, oldPath, newPath);
    }
    exports.rename = rename;
    function rmdir(path) {
        return async_1.nfcall(fs.rmdir, path);
    }
    exports.rmdir = rmdir;
    function unlink(path) {
        return async_1.nfcall(fs.unlink, path);
    }
    exports.unlink = unlink;
    function symlink(target, path, type) {
        return async_1.nfcall(fs.symlink, target, path, type);
    }
    exports.symlink = symlink;
    function readlink(path) {
        return async_1.nfcall(fs.readlink, path);
    }
    exports.readlink = readlink;
    function touch(path) {
        var now = Date.now() / 1000; // the value should be a Unix timestamp in seconds
        return async_1.nfcall(fs.utimes, path, now, now);
    }
    exports.touch = touch;
    function truncate(path, len) {
        return async_1.nfcall(fs.truncate, path, len);
    }
    exports.truncate = truncate;
    function readFile(path, encoding) {
        return async_1.nfcall(fs.readFile, path, encoding);
    }
    exports.readFile = readFile;
    // According to node.js docs (https://nodejs.org/docs/v6.5.0/api/fs.html#fs_fs_writefile_file_data_options_callback)
    // it is not safe to call writeFile() on the same path multiple times without waiting for the callback to return.
    // Therefor we use a Queue on the path that is given to us to sequentialize calls to the same path properly.
    var writeFilePathQueue = Object.create(null);
    function writeFile(path, data, options) {
        var queueKey = toQueueKey(path);
        return ensureWriteFileQueue(queueKey).queue(function () { return async_1.nfcall(extfs.writeFileAndFlush, path, data, options); });
    }
    exports.writeFile = writeFile;
    function toQueueKey(path) {
        var queueKey = path;
        if (platform.isWindows || platform.isMacintosh) {
            queueKey = queueKey.toLowerCase(); // accomodate for case insensitive file systems
        }
        return queueKey;
    }
    function ensureWriteFileQueue(queueKey) {
        var writeFileQueue = writeFilePathQueue[queueKey];
        if (!writeFileQueue) {
            writeFileQueue = new async_1.Queue();
            writeFilePathQueue[queueKey] = writeFileQueue;
            var onFinish = event_1.once(writeFileQueue.onFinished);
            onFinish(function () {
                delete writeFilePathQueue[queueKey];
                writeFileQueue.dispose();
            });
        }
        return writeFileQueue;
    }
    /**
    * Read a dir and return only subfolders
    */
    function readDirsInDir(dirPath) {
        return readdir(dirPath).then(function (children) {
            return winjs_base_1.TPromise.join(children.map(function (c) { return dirExists(path_1.join(dirPath, c)); })).then(function (exists) {
                return children.filter(function (_, i) { return exists[i]; });
            });
        });
    }
    exports.readDirsInDir = readDirsInDir;
    /**
    * `path` exists and is a directory
    */
    function dirExists(path) {
        return stat(path).then(function (stat) { return stat.isDirectory(); }, function () { return false; });
    }
    exports.dirExists = dirExists;
    /**
    * `path` exists and is a file.
    */
    function fileExists(path) {
        return stat(path).then(function (stat) { return stat.isFile(); }, function () { return false; });
    }
    exports.fileExists = fileExists;
    /**
     * Deletes a path from disk.
     */
    var _tmpDir = null;
    function getTmpDir() {
        if (!_tmpDir) {
            _tmpDir = os.tmpdir();
        }
        return _tmpDir;
    }
    function del(path, tmp) {
        if (tmp === void 0) { tmp = getTmpDir(); }
        return async_1.nfcall(extfs.del, path, tmp);
    }
    exports.del = del;
    function whenDeleted(path) {
        // Complete when wait marker file is deleted
        return new winjs_base_1.TPromise(function (c) {
            var running = false;
            var interval = setInterval(function () {
                if (!running) {
                    running = true;
                    fs.exists(path, function (exists) {
                        running = false;
                        if (!exists) {
                            clearInterval(interval);
                            c(null);
                        }
                    });
                }
            }, 1000);
        });
    }
    exports.whenDeleted = whenDeleted;
});
