/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "path", "fs", "os", "crypto", "assert", "vs/platform/files/common/files", "vs/platform/files/node/files", "vs/base/common/paths", "vs/base/common/map", "vs/base/common/arrays", "vs/base/common/mime", "vs/base/common/winjs.base", "vs/base/common/objects", "vs/base/node/extfs", "vs/base/common/async", "vs/base/common/uri", "vs/nls", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/platform/workspace/common/workspace", "vs/base/node/pfs", "vs/base/node/encoding", "vs/base/node/mime", "vs/base/node/flow", "vs/workbench/services/files/node/watcher/unix/watcherService", "vs/workbench/services/files/node/watcher/win32/watcherService", "vs/workbench/services/files/node/watcher/common", "vs/base/common/event", "vs/workbench/services/files/node/watcher/nsfw/watcherService", "vs/base/common/cancellation", "vs/platform/lifecycle/common/lifecycle", "vs/base/common/labels", "vs/base/common/objects", "stream", "vs/base/common/network"], function (require, exports, paths, fs, os, crypto, assert, files_1, files_2, paths_1, map_1, arrays, baseMime, winjs_base_1, objects, extfs, async_1, uri_1, nls, platform_1, lifecycle_1, workspace_1, pfs, encoding, mime_1, flow, watcherService_1, watcherService_2, common_1, event_1, watcherService_3, cancellation_1, lifecycle_2, labels_1, objects_1, stream_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function etag(arg1, arg2) {
        var size;
        var mtime;
        if (typeof arg2 === 'number') {
            size = arg1;
            mtime = arg2;
        }
        else {
            size = arg1.size;
            mtime = arg1.mtime.getTime();
        }
        return "\"" + crypto.createHash('sha1').update(String(size) + String(mtime)).digest('hex') + "\"";
    }
    var BufferPool = /** @class */ (function () {
        function BufferPool(bufferSize, _capacity, _free) {
            if (_free === void 0) { _free = []; }
            this.bufferSize = bufferSize;
            this._capacity = _capacity;
            this._free = _free;
            //
        }
        BufferPool.prototype.acquire = function () {
            if (this._free.length === 0) {
                return Buffer.allocUnsafe(this.bufferSize);
            }
            else {
                return this._free.shift();
            }
        };
        BufferPool.prototype.release = function (buf) {
            if (this._free.length <= this._capacity) {
                this._free.push(buf);
            }
        };
        BufferPool._64K = new BufferPool(64 * 1024, 5);
        return BufferPool;
    }());
    var FileService = /** @class */ (function () {
        function FileService(contextService, environmentService, textResourceConfigurationService, configurationService, lifecycleService, options) {
            var _this = this;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.textResourceConfigurationService = textResourceConfigurationService;
            this.configurationService = configurationService;
            this.lifecycleService = lifecycleService;
            this.toDispose = [];
            this.options = options || Object.create(null);
            this.tmpPath = this.options.tmpDir || os.tmpdir();
            this._onFileChanges = new event_1.Emitter();
            this.toDispose.push(this._onFileChanges);
            this._onAfterOperation = new event_1.Emitter();
            this.toDispose.push(this._onAfterOperation);
            if (!this.options.errorLogger) {
                this.options.errorLogger = console.error;
            }
            this.activeFileChangesWatchers = new map_1.ResourceMap();
            this.fileChangesWatchDelayer = new async_1.ThrottledDelayer(FileService.FS_EVENT_DELAY);
            this.undeliveredRawFileChangesEvents = [];
            lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () {
                _this.setupFileWatching(); // wait until we are fully running before starting file watchers
            });
            this.registerListeners();
        }
        FileService.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.contextService.onDidChangeWorkbenchState(function () {
                if (_this.lifecycleService.phase === lifecycle_2.LifecyclePhase.Running) {
                    _this.setupFileWatching();
                }
            }));
        };
        Object.defineProperty(FileService.prototype, "onFileChanges", {
            get: function () {
                return this._onFileChanges.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileService.prototype, "onAfterOperation", {
            get: function () {
                return this._onAfterOperation.event;
            },
            enumerable: true,
            configurable: true
        });
        FileService.prototype.updateOptions = function (options) {
            if (options) {
                objects.mixin(this.options, options); // overwrite current options
            }
        };
        FileService.prototype.setupFileWatching = function () {
            // dispose old if any
            if (this.activeWorkspaceFileChangeWatcher) {
                this.activeWorkspaceFileChangeWatcher.dispose();
            }
            // Return if not aplicable
            var workbenchState = this.contextService.getWorkbenchState();
            if (workbenchState === workspace_1.WorkbenchState.EMPTY || this.options.disableWatcher) {
                return;
            }
            // new watcher: use it if setting tells us so or we run in multi-root environment
            if (this.options.useExperimentalFileWatcher || workbenchState === workspace_1.WorkbenchState.WORKSPACE) {
                this.activeWorkspaceFileChangeWatcher = lifecycle_1.toDisposable(this.setupNsfwWorkspaceWatching().startWatching());
            }
            else {
                if (platform_1.isWindows) {
                    this.activeWorkspaceFileChangeWatcher = lifecycle_1.toDisposable(this.setupWin32WorkspaceWatching().startWatching());
                }
                else {
                    this.activeWorkspaceFileChangeWatcher = lifecycle_1.toDisposable(this.setupUnixWorkspaceWatching().startWatching());
                }
            }
        };
        FileService.prototype.setupWin32WorkspaceWatching = function () {
            var _this = this;
            return new watcherService_2.FileWatcher(this.contextService, this.options.watcherIgnoredPatterns, function (e) { return _this._onFileChanges.fire(e); }, this.options.errorLogger, this.options.verboseLogging);
        };
        FileService.prototype.setupUnixWorkspaceWatching = function () {
            var _this = this;
            return new watcherService_1.FileWatcher(this.contextService, this.options.watcherIgnoredPatterns, function (e) { return _this._onFileChanges.fire(e); }, this.options.errorLogger, this.options.verboseLogging);
        };
        FileService.prototype.setupNsfwWorkspaceWatching = function () {
            var _this = this;
            return new watcherService_3.FileWatcher(this.contextService, this.configurationService, function (e) { return _this._onFileChanges.fire(e); }, this.options.errorLogger, this.options.verboseLogging);
        };
        FileService.prototype.resolveFile = function (resource, options) {
            return this.resolve(resource, options);
        };
        FileService.prototype.resolveFiles = function (toResolve) {
            var _this = this;
            return winjs_base_1.TPromise.join(toResolve.map(function (resourceAndOptions) { return _this.resolve(resourceAndOptions.resource, resourceAndOptions.options)
                .then(function (stat) { return ({ stat: stat, success: true }); }, function (error) { return ({ stat: void 0, success: false }); }); }));
        };
        FileService.prototype.existsFile = function (resource) {
            return this.resolveFile(resource).then(function () { return true; }, function () { return false; });
        };
        FileService.prototype.resolveContent = function (resource, options) {
            return this.resolveStreamContent(resource, options).then(function (streamContent) {
                return new winjs_base_1.TPromise(function (resolve, reject) {
                    var result = {
                        resource: streamContent.resource,
                        name: streamContent.name,
                        mtime: streamContent.mtime,
                        etag: streamContent.etag,
                        encoding: streamContent.encoding,
                        value: ''
                    };
                    streamContent.value.on('data', function (chunk) { return result.value += chunk; });
                    streamContent.value.on('error', function (err) { return reject(err); });
                    streamContent.value.on('end', function (_) { return resolve(result); });
                    return result;
                });
            });
        };
        FileService.prototype.resolveStreamContent = function (resource, options) {
            var _this = this;
            // Guard early against attempts to resolve an invalid file path
            if (resource.scheme !== network_1.Schemas.file || !resource.fsPath) {
                return winjs_base_1.TPromise.wrapError(new files_1.FileOperationError(nls.localize('fileInvalidPath', "Invalid file resource ({0})", resource.toString(true)), files_1.FileOperationResult.FILE_INVALID_PATH, options));
            }
            var result = {
                resource: void 0,
                name: void 0,
                mtime: void 0,
                etag: void 0,
                encoding: void 0,
                value: void 0
            };
            var contentResolverToken = new cancellation_1.CancellationTokenSource();
            var onStatError = function (error) {
                // error: stop reading the file the stat and content resolve call
                // usually race, mostly likely the stat call will win and cancel
                // the content call
                contentResolverToken.cancel();
                // forward error
                return winjs_base_1.TPromise.wrapError(error);
            };
            var statsPromise = this.resolveFile(resource).then(function (stat) {
                result.resource = stat.resource;
                result.name = stat.name;
                result.mtime = stat.mtime;
                result.etag = stat.etag;
                // Return early if resource is a directory
                if (stat.isDirectory) {
                    return onStatError(new files_1.FileOperationError(nls.localize('fileIsDirectoryError', "File is directory"), files_1.FileOperationResult.FILE_IS_DIRECTORY, options));
                }
                // Return early if file not modified since
                if (options && options.etag && options.etag === stat.etag) {
                    return onStatError(new files_1.FileOperationError(nls.localize('fileNotModifiedError', "File not modified since"), files_1.FileOperationResult.FILE_NOT_MODIFIED_SINCE, options));
                }
                // Return early if file is too large to load
                if (typeof stat.size === 'number') {
                    if (stat.size > Math.max(_this.environmentService.args['max-memory'] * 1024 * 1024 || 0, files_2.MAX_HEAP_SIZE)) {
                        return onStatError(new files_1.FileOperationError(nls.localize('fileTooLargeForHeapError', "File size exceeds window memory limit, please try to run code --max-memory=NEWSIZE"), files_1.FileOperationResult.FILE_EXCEED_MEMORY_LIMIT));
                    }
                    if (stat.size > files_2.MAX_FILE_SIZE) {
                        return onStatError(new files_1.FileOperationError(nls.localize('fileTooLargeError', "File too large to open"), files_1.FileOperationResult.FILE_TOO_LARGE));
                    }
                }
                return void 0;
            }, function (err) {
                // Wrap file not found errors
                if (err.code === 'ENOENT') {
                    return onStatError(new files_1.FileOperationError(nls.localize('fileNotFoundError', "File not found ({0})", resource.toString(true)), files_1.FileOperationResult.FILE_NOT_FOUND, options));
                }
                return onStatError(err);
            });
            var completePromise;
            // await the stat iff we already have an etag so that we compare the
            // etag from the stat before we actually read the file again.
            if (options && options.etag) {
                completePromise = statsPromise.then(function () {
                    return _this.fillInContents(result, resource, options, contentResolverToken.token); // Waterfall -> only now resolve the contents
                });
            }
            else {
                completePromise = Promise.all([statsPromise, this.fillInContents(result, resource, options, contentResolverToken.token)]);
            }
            return winjs_base_1.TPromise.wrap(completePromise).then(function () { return result; });
        };
        FileService.prototype.fillInContents = function (content, resource, options, token) {
            return this.resolveFileData(resource, options, token).then(function (data) {
                content.encoding = data.encoding;
                content.value = data.stream;
            });
        };
        FileService.prototype.resolveFileData = function (resource, options, token) {
            var _this = this;
            var chunkBuffer = BufferPool._64K.acquire();
            var result = {
                encoding: void 0,
                stream: void 0
            };
            return new Promise(function (resolve, reject) {
                fs.open(_this.toAbsolutePath(resource), 'r', function (err, fd) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            // Wrap file not found errors
                            err = new files_1.FileOperationError(nls.localize('fileNotFoundError', "File not found ({0})", resource.toString(true)), files_1.FileOperationResult.FILE_NOT_FOUND, options);
                        }
                        return reject(err);
                    }
                    var decoder;
                    var totalBytesRead = 0;
                    var finish = function (err) {
                        if (err) {
                            if (err.code === 'EISDIR') {
                                // Wrap EISDIR errors (fs.open on a directory works, but you cannot read from it)
                                err = new files_1.FileOperationError(nls.localize('fileIsDirectoryError', "File is directory"), files_1.FileOperationResult.FILE_IS_DIRECTORY, options);
                            }
                            if (decoder) {
                                // If the decoder already started, we have to emit the error through it as
                                // event because the promise is already resolved!
                                decoder.emit('error', err);
                            }
                            else {
                                reject(err);
                            }
                        }
                        if (decoder) {
                            decoder.end();
                        }
                        // return the shared buffer
                        BufferPool._64K.release(chunkBuffer);
                        if (fd) {
                            fs.close(fd, function (err) {
                                if (err) {
                                    _this.options.errorLogger("resolveFileData#close(): " + err.toString());
                                }
                            });
                        }
                    };
                    var handleChunk = function (bytesRead) {
                        if (token.isCancellationRequested) {
                            // cancellation -> finish
                            finish(new Error('cancelled'));
                        }
                        else if (bytesRead === 0) {
                            // no more data -> finish
                            finish();
                        }
                        else if (bytesRead < chunkBuffer.length) {
                            // write the sub-part of data we received -> repeat
                            decoder.write(chunkBuffer.slice(0, bytesRead), readChunk);
                        }
                        else {
                            // write all data we received -> repeat
                            decoder.write(chunkBuffer, readChunk);
                        }
                    };
                    var currentPosition = (options && options.position) || null;
                    var readChunk = function () {
                        fs.read(fd, chunkBuffer, 0, chunkBuffer.length, currentPosition, function (err, bytesRead) {
                            totalBytesRead += bytesRead;
                            if (typeof currentPosition === 'number') {
                                // if we received a position argument as option we need to ensure that
                                // we advance the position by the number of bytesread
                                currentPosition += bytesRead;
                            }
                            if (totalBytesRead > Math.max(_this.environmentService.args['max-memory'] * 1024 * 1024 || 0, files_2.MAX_HEAP_SIZE)) {
                                finish(new files_1.FileOperationError(nls.localize('fileTooLargeForHeapError', "File size exceeds window memory limit, please try to run code --max-memory=NEWSIZE"), files_1.FileOperationResult.FILE_EXCEED_MEMORY_LIMIT));
                            }
                            if (totalBytesRead > files_2.MAX_FILE_SIZE) {
                                // stop when reading too much
                                finish(new files_1.FileOperationError(nls.localize('fileTooLargeError', "File too large to open"), files_1.FileOperationResult.FILE_TOO_LARGE, options));
                            }
                            else if (err) {
                                // some error happened
                                finish(err);
                            }
                            else if (decoder) {
                                // pass on to decoder
                                handleChunk(bytesRead);
                            }
                            else {
                                // when receiving the first chunk of data we need to create the
                                // decoding stream which is then used to drive the string stream.
                                winjs_base_1.TPromise.as(mime_1.detectMimeAndEncodingFromBuffer({ buffer: chunkBuffer, bytesRead: bytesRead }, options && options.autoGuessEncoding || _this.configuredAutoGuessEncoding(resource))).then(function (value) {
                                    if (options && options.acceptTextOnly && value.mimes.indexOf(baseMime.MIME_BINARY) >= 0) {
                                        // Return error early if client only accepts text and this is not text
                                        finish(new files_1.FileOperationError(nls.localize('fileBinaryError', "File seems to be binary and cannot be opened as text"), files_1.FileOperationResult.FILE_IS_BINARY, options));
                                    }
                                    else {
                                        result.encoding = _this.getEncoding(resource, _this.getPeferredEncoding(resource, options, value));
                                        result.stream = decoder = encoding.decodeStream(result.encoding);
                                        resolve(result);
                                        handleChunk(bytesRead);
                                    }
                                }).then(void 0, function (err) {
                                    // failed to get encoding
                                    finish(err);
                                });
                            }
                        });
                    };
                    // start reading
                    readChunk();
                });
            });
        };
        FileService.prototype.updateContent = function (resource, value, options) {
            if (options === void 0) { options = Object.create(null); }
            if (this.options.elevationSupport && options.writeElevated) {
                return this.doUpdateContentElevated(resource, value, options);
            }
            return this.doUpdateContent(resource, value, options);
        };
        FileService.prototype.doUpdateContent = function (resource, value, options) {
            var _this = this;
            if (options === void 0) { options = Object.create(null); }
            var absolutePath = this.toAbsolutePath(resource);
            // 1.) check file
            return this.checkFile(absolutePath, options).then(function (exists) {
                var createParentsPromise;
                if (exists) {
                    createParentsPromise = winjs_base_1.TPromise.as(null);
                }
                else {
                    createParentsPromise = pfs.mkdirp(paths.dirname(absolutePath));
                }
                // 2.) create parents as needed
                return createParentsPromise.then(function () {
                    var encodingToWrite = _this.getEncoding(resource, options.encoding);
                    var addBomPromise = winjs_base_1.TPromise.as(false);
                    // UTF_16 BE and LE as well as UTF_8 with BOM always have a BOM
                    if (encodingToWrite === encoding.UTF16be || encodingToWrite === encoding.UTF16le || encodingToWrite === encoding.UTF8_with_bom) {
                        addBomPromise = winjs_base_1.TPromise.as(true);
                    }
                    else if (exists && encodingToWrite === encoding.UTF8) {
                        if (options.overwriteEncoding) {
                            addBomPromise = winjs_base_1.TPromise.as(false); // if we are to overwrite the encoding, we do not preserve it if found
                        }
                        else {
                            addBomPromise = encoding.detectEncodingByBOM(absolutePath).then(function (enc) { return enc === encoding.UTF8; }); // otherwise preserve it if found
                        }
                    }
                    // 3.) check to add UTF BOM
                    return addBomPromise.then(function (addBom) {
                        // 4.) set contents and resolve
                        return _this.doSetContentsAndResolve(resource, absolutePath, value, addBom, encodingToWrite).then(void 0, function (error) {
                            if (!exists || error.code !== 'EPERM' || !platform_1.isWindows) {
                                return winjs_base_1.TPromise.wrapError(error);
                            }
                            // On Windows and if the file exists with an EPERM error, we try a different strategy of saving the file
                            // by first truncating the file and then writing with r+ mode. This helps to save hidden files on Windows
                            // (see https://github.com/Microsoft/vscode/issues/931)
                            // 5.) truncate
                            return pfs.truncate(absolutePath, 0).then(function () {
                                // 6.) set contents (this time with r+ mode) and resolve again
                                return _this.doSetContentsAndResolve(resource, absolutePath, value, addBom, encodingToWrite, { flag: 'r+' });
                            });
                        });
                    });
                });
            }).then(null, function (error) {
                if (error.code === 'EACCES' || error.code === 'EPERM') {
                    return winjs_base_1.TPromise.wrapError(new files_1.FileOperationError(nls.localize('filePermission', "Permission denied writing to file ({0})", resource.toString(true)), files_1.FileOperationResult.FILE_PERMISSION_DENIED, options));
                }
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        FileService.prototype.doSetContentsAndResolve = function (resource, absolutePath, value, addBOM, encodingToWrite, options) {
            var _this = this;
            var writeFilePromise;
            // Configure encoding related options as needed
            var writeFileOptions = options ? options : Object.create(null);
            if (addBOM || encodingToWrite !== encoding.UTF8) {
                writeFileOptions.encoding = {
                    charset: encodingToWrite,
                    addBOM: addBOM
                };
            }
            if (typeof value === 'string') {
                writeFilePromise = pfs.writeFile(absolutePath, value, writeFileOptions);
            }
            else {
                writeFilePromise = pfs.writeFile(absolutePath, this.snapshotToReadableStream(value), writeFileOptions);
            }
            // set contents
            return writeFilePromise.then(function () {
                // resolve
                return _this.resolve(resource);
            });
        };
        FileService.prototype.snapshotToReadableStream = function (snapshot) {
            return new stream_1.Readable({
                read: function () {
                    try {
                        var chunk = void 0;
                        var canPush = true;
                        // Push all chunks as long as we can push and as long as
                        // the underlying snapshot returns strings to us
                        while (canPush && typeof (chunk = snapshot.read()) === 'string') {
                            canPush = this.push(chunk);
                        }
                        // Signal EOS by pushing NULL
                        if (typeof chunk !== 'string') {
                            this.push(null);
                        }
                    }
                    catch (error) {
                        this.emit('error', error);
                    }
                },
                encoding: encoding.UTF8 // very important, so that strings are passed around and not buffers!
            });
        };
        FileService.prototype.doUpdateContentElevated = function (resource, value, options) {
            var _this = this;
            if (options === void 0) { options = Object.create(null); }
            var absolutePath = this.toAbsolutePath(resource);
            // 1.) check file
            return this.checkFile(absolutePath, options, options.overwriteReadonly /* ignore readonly if we overwrite readonly, this is handled via sudo later */).then(function (exists) {
                var writeOptions = objects_1.assign(Object.create(null), options);
                writeOptions.writeElevated = false;
                writeOptions.encoding = _this.getEncoding(resource, options.encoding);
                // 2.) write to a temporary file to be able to copy over later
                var tmpPath = paths.join(_this.tmpPath, "code-elevated-" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6));
                return _this.updateContent(uri_1.default.file(tmpPath), value, writeOptions).then(function () {
                    // 3.) invoke our CLI as super user
                    return (new Promise(function (resolve_1, reject_1) { require(['sudo-prompt'], resolve_1, reject_1); })).then(function (sudoPrompt) {
                        return new winjs_base_1.TPromise(function (c, e) {
                            var promptOptions = { name: _this.options.elevationSupport.promptTitle.replace('-', ''), icns: _this.options.elevationSupport.promptIcnsPath };
                            var sudoCommand = ["\"" + _this.options.elevationSupport.cliPath + "\""];
                            if (options.overwriteReadonly) {
                                sudoCommand.push('--file-chmod');
                            }
                            sudoCommand.push('--file-write', "\"" + tmpPath + "\"", "\"" + absolutePath + "\"");
                            sudoPrompt.exec(sudoCommand.join(' '), promptOptions, function (error, stdout, stderr) {
                                if (error || stderr) {
                                    e(error || stderr);
                                }
                                else {
                                    c(void 0);
                                }
                            });
                        });
                    }).then(function () {
                        // 3.) delete temp file
                        return pfs.del(tmpPath, _this.tmpPath).then(function () {
                            // 4.) resolve again
                            return _this.resolve(resource);
                        });
                    });
                });
            }).then(null, function (error) {
                if (_this.options.verboseLogging) {
                    _this.options.errorLogger("Unable to write to file '" + resource.toString(true) + "' as elevated user (" + error + ")");
                }
                if (!files_1.FileOperationError.isFileOperationError(error)) {
                    error = new files_1.FileOperationError(nls.localize('filePermission', "Permission denied writing to file ({0})", resource.toString(true)), files_1.FileOperationResult.FILE_PERMISSION_DENIED, options);
                }
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        FileService.prototype.createFile = function (resource, content, options) {
            var _this = this;
            if (content === void 0) { content = ''; }
            if (options === void 0) { options = Object.create(null); }
            var absolutePath = this.toAbsolutePath(resource);
            var checkFilePromise;
            if (options.overwrite) {
                checkFilePromise = winjs_base_1.TPromise.as(false);
            }
            else {
                checkFilePromise = pfs.exists(absolutePath);
            }
            // Check file exists
            return checkFilePromise.then(function (exists) {
                if (exists && !options.overwrite) {
                    return winjs_base_1.TPromise.wrapError(new files_1.FileOperationError(nls.localize('fileExists', "File to create already exists ({0})", resource.toString(true)), files_1.FileOperationResult.FILE_MODIFIED_SINCE, options));
                }
                // Create file
                return _this.updateContent(resource, content).then(function (result) {
                    // Events
                    _this._onAfterOperation.fire(new files_1.FileOperationEvent(resource, files_1.FileOperation.CREATE, result));
                    return result;
                });
            });
        };
        FileService.prototype.createFolder = function (resource) {
            var _this = this;
            // 1.) Create folder
            var absolutePath = this.toAbsolutePath(resource);
            return pfs.mkdirp(absolutePath).then(function () {
                // 2.) Resolve
                return _this.resolve(resource).then(function (result) {
                    // Events
                    _this._onAfterOperation.fire(new files_1.FileOperationEvent(resource, files_1.FileOperation.CREATE, result));
                    return result;
                });
            });
        };
        FileService.prototype.touchFile = function (resource) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(resource);
            // 1.) check file
            return this.checkFile(absolutePath).then(function (exists) {
                var createPromise;
                if (exists) {
                    createPromise = winjs_base_1.TPromise.as(null);
                }
                else {
                    createPromise = _this.createFile(resource);
                }
                // 2.) create file as needed
                return createPromise.then(function () {
                    // 3.) update atime and mtime
                    return pfs.touch(absolutePath).then(function () {
                        // 4.) resolve
                        return _this.resolve(resource);
                    });
                });
            });
        };
        FileService.prototype.rename = function (resource, newName) {
            var newPath = paths.join(paths.dirname(resource.fsPath), newName);
            return this.moveFile(resource, uri_1.default.file(newPath));
        };
        FileService.prototype.moveFile = function (source, target, overwrite) {
            return this.moveOrCopyFile(source, target, false, overwrite);
        };
        FileService.prototype.copyFile = function (source, target, overwrite) {
            return this.moveOrCopyFile(source, target, true, overwrite);
        };
        FileService.prototype.moveOrCopyFile = function (source, target, keepCopy, overwrite) {
            var _this = this;
            var sourcePath = this.toAbsolutePath(source);
            var targetPath = this.toAbsolutePath(target);
            // 1.) move / copy
            return this.doMoveOrCopyFile(sourcePath, targetPath, keepCopy, overwrite).then(function () {
                // 2.) resolve
                return _this.resolve(target).then(function (result) {
                    // Events
                    _this._onAfterOperation.fire(new files_1.FileOperationEvent(source, keepCopy ? files_1.FileOperation.COPY : files_1.FileOperation.MOVE, result));
                    return result;
                });
            });
        };
        FileService.prototype.doMoveOrCopyFile = function (sourcePath, targetPath, keepCopy, overwrite) {
            var _this = this;
            // 1.) check if target exists
            return pfs.exists(targetPath).then(function (exists) {
                var isCaseRename = sourcePath.toLowerCase() === targetPath.toLowerCase();
                var isSameFile = sourcePath === targetPath;
                // Return early with conflict if target exists and we are not told to overwrite
                if (exists && !isCaseRename && !overwrite) {
                    return winjs_base_1.TPromise.wrapError(new files_1.FileOperationError(nls.localize('fileMoveConflict', "Unable to move/copy. File already exists at destination."), files_1.FileOperationResult.FILE_MOVE_CONFLICT));
                }
                // 2.) make sure target is deleted before we move/copy unless this is a case rename of the same file
                var deleteTargetPromise = winjs_base_1.TPromise.wrap(void 0);
                if (exists && !isCaseRename) {
                    if (paths_1.isEqualOrParent(sourcePath, targetPath, !platform_1.isLinux /* ignorecase */)) {
                        return winjs_base_1.TPromise.wrapError(new Error(nls.localize('unableToMoveCopyError', "Unable to move/copy. File would replace folder it is contained in."))); // catch this corner case!
                    }
                    deleteTargetPromise = _this.del(uri_1.default.file(targetPath));
                }
                return deleteTargetPromise.then(function () {
                    // 3.) make sure parents exists
                    return pfs.mkdirp(paths.dirname(targetPath)).then(function () {
                        // 4.) copy/move
                        if (isSameFile) {
                            return winjs_base_1.TPromise.wrap(null);
                        }
                        else if (keepCopy) {
                            return async_1.nfcall(extfs.copy, sourcePath, targetPath);
                        }
                        else {
                            return async_1.nfcall(extfs.mv, sourcePath, targetPath);
                        }
                    }).then(function () { return exists; });
                });
            });
        };
        FileService.prototype.importFile = function (source, targetFolder) {
            var _this = this;
            var sourcePath = this.toAbsolutePath(source);
            var targetResource = uri_1.default.file(paths.join(targetFolder.fsPath, paths.basename(source.fsPath)));
            var targetPath = this.toAbsolutePath(targetResource);
            // 1.) resolve
            return pfs.stat(sourcePath).then(function (stat) {
                if (stat.isDirectory()) {
                    return winjs_base_1.TPromise.wrapError(new Error(nls.localize('foldersCopyError', "Folders cannot be copied into the workspace. Please select individual files to copy them."))); // for now we do not allow to import a folder into a workspace
                }
                // 2.) copy
                return _this.doMoveOrCopyFile(sourcePath, targetPath, true, true).then(function (exists) {
                    // 3.) resolve
                    return _this.resolve(targetResource).then(function (stat) {
                        // Events
                        _this._onAfterOperation.fire(new files_1.FileOperationEvent(source, files_1.FileOperation.IMPORT, stat));
                        return { isNew: !exists, stat: stat };
                    });
                });
            });
        };
        FileService.prototype.del = function (resource) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(resource);
            return pfs.del(absolutePath, this.tmpPath).then(function () {
                // Events
                _this._onAfterOperation.fire(new files_1.FileOperationEvent(resource, files_1.FileOperation.DELETE));
            });
        };
        // Helpers
        FileService.prototype.toAbsolutePath = function (arg1) {
            var resource;
            if (arg1 instanceof uri_1.default) {
                resource = arg1;
            }
            else {
                resource = arg1.resource;
            }
            assert.ok(resource && resource.scheme === network_1.Schemas.file, "Invalid resource: " + resource);
            return paths.normalize(resource.fsPath);
        };
        FileService.prototype.resolve = function (resource, options) {
            if (options === void 0) { options = Object.create(null); }
            return this.toStatResolver(resource)
                .then(function (model) { return model.resolve(options); });
        };
        FileService.prototype.toStatResolver = function (resource) {
            var _this = this;
            var absolutePath = this.toAbsolutePath(resource);
            return pfs.stat(absolutePath).then(function (stat) {
                return new StatResolver(resource, stat.isDirectory(), stat.mtime.getTime(), stat.size, _this.options.verboseLogging ? _this.options.errorLogger : void 0);
            });
        };
        FileService.prototype.getPeferredEncoding = function (resource, options, detected) {
            var preferredEncoding;
            if (options && options.encoding) {
                if (detected.encoding === encoding.UTF8 && options.encoding === encoding.UTF8) {
                    preferredEncoding = encoding.UTF8_with_bom; // indicate the file has BOM if we are to resolve with UTF 8
                }
                else {
                    preferredEncoding = options.encoding; // give passed in encoding highest priority
                }
            }
            else if (detected.encoding) {
                if (detected.encoding === encoding.UTF8) {
                    preferredEncoding = encoding.UTF8_with_bom; // if we detected UTF-8, it can only be because of a BOM
                }
                else {
                    preferredEncoding = detected.encoding;
                }
            }
            else if (this.configuredEncoding(resource) === encoding.UTF8_with_bom) {
                preferredEncoding = encoding.UTF8; // if we did not detect UTF 8 BOM before, this can only be UTF 8 then
            }
            return preferredEncoding;
        };
        FileService.prototype.getEncoding = function (resource, preferredEncoding) {
            var fileEncoding;
            var override = this.getEncodingOverride(resource);
            if (override) {
                fileEncoding = override;
            }
            else if (preferredEncoding) {
                fileEncoding = preferredEncoding;
            }
            else {
                fileEncoding = this.configuredEncoding(resource);
            }
            if (!fileEncoding || !encoding.encodingExists(fileEncoding)) {
                fileEncoding = encoding.UTF8; // the default is UTF 8
            }
            return fileEncoding;
        };
        FileService.prototype.configuredAutoGuessEncoding = function (resource) {
            return this.textResourceConfigurationService.getValue(resource, 'files.autoGuessEncoding');
        };
        FileService.prototype.configuredEncoding = function (resource) {
            return this.textResourceConfigurationService.getValue(resource, 'files.encoding');
        };
        FileService.prototype.getEncodingOverride = function (resource) {
            if (resource && this.options.encodingOverride && this.options.encodingOverride.length) {
                for (var i = 0; i < this.options.encodingOverride.length; i++) {
                    var override = this.options.encodingOverride[i];
                    // check if the resource is a child of the resource with override and use
                    // the provided encoding in that case
                    if (files_1.isParent(resource.fsPath, override.resource.fsPath, !platform_1.isLinux /* ignorecase */)) {
                        return override.encoding;
                    }
                }
            }
            return null;
        };
        FileService.prototype.checkFile = function (absolutePath, options, ignoreReadonly) {
            var _this = this;
            if (options === void 0) { options = Object.create(null); }
            return pfs.exists(absolutePath).then(function (exists) {
                if (exists) {
                    return pfs.stat(absolutePath).then(function (stat) {
                        if (stat.isDirectory()) {
                            return winjs_base_1.TPromise.wrapError(new Error('Expected file is actually a directory'));
                        }
                        // Dirty write prevention
                        if (typeof options.mtime === 'number' && typeof options.etag === 'string' && options.mtime < stat.mtime.getTime()) {
                            // Find out if content length has changed
                            if (options.etag !== etag(stat.size, options.mtime)) {
                                return winjs_base_1.TPromise.wrapError(new files_1.FileOperationError(nls.localize('fileModifiedError', "File Modified Since"), files_1.FileOperationResult.FILE_MODIFIED_SINCE, options));
                            }
                        }
                        // Throw if file is readonly and we are not instructed to overwrite
                        if (!ignoreReadonly && !(stat.mode & 128) /* readonly */) {
                            if (!options.overwriteReadonly) {
                                return _this.readOnlyError(options);
                            }
                            // Try to change mode to writeable
                            var mode = stat.mode;
                            mode = mode | 128;
                            return pfs.chmod(absolutePath, mode).then(function () {
                                // Make sure to check the mode again, it could have failed
                                return pfs.stat(absolutePath).then(function (stat) {
                                    if (!(stat.mode & 128) /* readonly */) {
                                        return _this.readOnlyError(options);
                                    }
                                    return exists;
                                });
                            });
                        }
                        return winjs_base_1.TPromise.as(exists);
                    });
                }
                return winjs_base_1.TPromise.as(exists);
            });
        };
        FileService.prototype.readOnlyError = function (options) {
            return winjs_base_1.TPromise.wrapError(new files_1.FileOperationError(nls.localize('fileReadOnlyError', "File is Read Only"), files_1.FileOperationResult.FILE_READ_ONLY, options));
        };
        FileService.prototype.watchFileChanges = function (resource) {
            var _this = this;
            assert.ok(resource && resource.scheme === network_1.Schemas.file, "Invalid resource for watching: " + resource);
            // Create or get watcher for provided path
            var watcher = this.activeFileChangesWatchers.get(resource);
            if (!watcher) {
                var fsPath_1 = resource.fsPath;
                var fsName_1 = paths.basename(resource.fsPath);
                watcher = extfs.watch(fsPath_1, function (eventType, filename) {
                    var renamedOrDeleted = ((filename && filename !== fsName_1) || eventType === 'rename');
                    // The file was either deleted or renamed. Many tools apply changes to files in an
                    // atomic way ("Atomic Save") by first renaming the file to a temporary name and then
                    // renaming it back to the original name. Our watcher will detect this as a rename
                    // and then stops to work on Mac and Linux because the watcher is applied to the
                    // inode and not the name. The fix is to detect this case and trying to watch the file
                    // again after a certain delay.
                    // In addition, we send out a delete event if after a timeout we detect that the file
                    // does indeed not exist anymore.
                    if (renamedOrDeleted) {
                        // Very important to dispose the watcher which now points to a stale inode
                        _this.unwatchFileChanges(resource);
                        // Wait a bit and try to install watcher again, assuming that the file was renamed quickly ("Atomic Save")
                        setTimeout(function () {
                            _this.existsFile(resource).done(function (exists) {
                                // File still exists, so reapply the watcher
                                if (exists) {
                                    _this.watchFileChanges(resource);
                                }
                                else {
                                    _this.onRawFileChange({
                                        type: files_1.FileChangeType.DELETED,
                                        path: fsPath_1
                                    });
                                }
                            });
                        }, FileService.FS_REWATCH_DELAY);
                    }
                    // Handle raw file change
                    _this.onRawFileChange({
                        type: files_1.FileChangeType.UPDATED,
                        path: fsPath_1
                    });
                }, function (error) { return _this.options.errorLogger(error); });
                if (watcher) {
                    this.activeFileChangesWatchers.set(resource, watcher);
                }
            }
        };
        FileService.prototype.onRawFileChange = function (event) {
            var _this = this;
            // add to bucket of undelivered events
            this.undeliveredRawFileChangesEvents.push(event);
            if (this.options.verboseLogging) {
                console.log('%c[node.js Watcher]%c', 'color: green', 'color: black', event.type === files_1.FileChangeType.ADDED ? '[ADDED]' : event.type === files_1.FileChangeType.DELETED ? '[DELETED]' : '[CHANGED]', event.path);
            }
            // handle emit through delayer to accommodate for bulk changes
            this.fileChangesWatchDelayer.trigger(function () {
                var buffer = _this.undeliveredRawFileChangesEvents;
                _this.undeliveredRawFileChangesEvents = [];
                // Normalize
                var normalizedEvents = common_1.normalize(buffer);
                // Logging
                if (_this.options.verboseLogging) {
                    normalizedEvents.forEach(function (r) {
                        console.log('%c[node.js Watcher]%c >> normalized', 'color: green', 'color: black', r.type === files_1.FileChangeType.ADDED ? '[ADDED]' : r.type === files_1.FileChangeType.DELETED ? '[DELETED]' : '[CHANGED]', r.path);
                    });
                }
                // Emit
                _this._onFileChanges.fire(common_1.toFileChangesEvent(normalizedEvents));
                return winjs_base_1.TPromise.as(null);
            });
        };
        FileService.prototype.unwatchFileChanges = function (resource) {
            var watcher = this.activeFileChangesWatchers.get(resource);
            if (watcher) {
                watcher.close();
                this.activeFileChangesWatchers.delete(resource);
            }
        };
        FileService.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            if (this.activeWorkspaceFileChangeWatcher) {
                this.activeWorkspaceFileChangeWatcher.dispose();
                this.activeWorkspaceFileChangeWatcher = null;
            }
            this.activeFileChangesWatchers.forEach(function (watcher) { return watcher.close(); });
            this.activeFileChangesWatchers.clear();
        };
        FileService.FS_EVENT_DELAY = 50; // aggregate and only emit events when changes have stopped for this duration (in ms)
        FileService.FS_REWATCH_DELAY = 300; // delay to rewatch a file that was renamed or deleted (in ms)
        return FileService;
    }());
    exports.FileService = FileService;
    var StatResolver = /** @class */ (function () {
        function StatResolver(resource, isDirectory, mtime, size, errorLogger) {
            assert.ok(resource && resource.scheme === network_1.Schemas.file, "Invalid resource: " + resource);
            this.resource = resource;
            this.isDirectory = isDirectory;
            this.mtime = mtime;
            this.name = labels_1.getBaseLabel(resource);
            this.etag = etag(size, mtime);
            this.size = size;
            this.errorLogger = errorLogger;
        }
        StatResolver.prototype.resolve = function (options) {
            var _this = this;
            // General Data
            var fileStat = {
                resource: this.resource,
                isDirectory: this.isDirectory,
                name: this.name,
                etag: this.etag,
                size: this.size,
                mtime: this.mtime
            };
            // File Specific Data
            if (!this.isDirectory) {
                return winjs_base_1.TPromise.as(fileStat);
            }
            else {
                // Convert the paths from options.resolveTo to absolute paths
                var absoluteTargetPaths_1 = null;
                if (options && options.resolveTo) {
                    absoluteTargetPaths_1 = [];
                    options.resolveTo.forEach(function (resource) {
                        absoluteTargetPaths_1.push(resource.fsPath);
                    });
                }
                return new winjs_base_1.TPromise(function (c, e) {
                    // Load children
                    _this.resolveChildren(_this.resource.fsPath, absoluteTargetPaths_1, options && options.resolveSingleChildDescendants, function (children) {
                        children = arrays.coalesce(children); // we don't want those null children (could be permission denied when reading a child)
                        fileStat.children = children || [];
                        c(fileStat);
                    });
                });
            }
        };
        StatResolver.prototype.resolveChildren = function (absolutePath, absoluteTargetPaths, resolveSingleChildDescendants, callback) {
            var _this = this;
            extfs.readdir(absolutePath, function (error, files) {
                if (error) {
                    if (_this.errorLogger) {
                        _this.errorLogger(error);
                    }
                    return callback(null); // return - we might not have permissions to read the folder
                }
                // for each file in the folder
                flow.parallel(files, function (file, clb) {
                    var fileResource = uri_1.default.file(paths.resolve(absolutePath, file));
                    var fileStat;
                    var $this = _this;
                    flow.sequence(function onError(error) {
                        if ($this.errorLogger) {
                            $this.errorLogger(error);
                        }
                        clb(null, null); // return - we might not have permissions to read the folder or stat the file
                    }, function stat() {
                        fs.stat(fileResource.fsPath, this);
                    }, function countChildren(fsstat) {
                        var _this = this;
                        fileStat = fsstat;
                        if (fileStat.isDirectory()) {
                            extfs.readdir(fileResource.fsPath, function (error, result) {
                                _this(null, result ? result.length : 0);
                            });
                        }
                        else {
                            this(null, 0);
                        }
                    }, function resolve(childCount) {
                        var childStat = {
                            resource: fileResource,
                            isDirectory: fileStat.isDirectory(),
                            name: file,
                            mtime: fileStat.mtime.getTime(),
                            etag: etag(fileStat),
                            size: fileStat.size
                        };
                        // Return early for files
                        if (!fileStat.isDirectory()) {
                            return clb(null, childStat);
                        }
                        // Handle Folder
                        var resolveFolderChildren = false;
                        if (files.length === 1 && resolveSingleChildDescendants) {
                            resolveFolderChildren = true;
                        }
                        else if (childCount > 0 && absoluteTargetPaths && absoluteTargetPaths.some(function (targetPath) { return paths_1.isEqualOrParent(targetPath, fileResource.fsPath, !platform_1.isLinux /* ignorecase */); })) {
                            resolveFolderChildren = true;
                        }
                        // Continue resolving children based on condition
                        if (resolveFolderChildren) {
                            $this.resolveChildren(fileResource.fsPath, absoluteTargetPaths, resolveSingleChildDescendants, function (children) {
                                children = arrays.coalesce(children); // we don't want those null children
                                childStat.children = children || [];
                                clb(null, childStat);
                            });
                        }
                        else {
                            clb(null, childStat);
                        }
                    });
                }, function (errors, result) {
                    callback(result);
                });
            });
        };
        return StatResolver;
    }());
    exports.StatResolver = StatResolver;
});
