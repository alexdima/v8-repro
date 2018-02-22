/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/paths", "vs/base/common/strings", "vs/base/node/extfs", "fs", "vs/base/common/winjs.base", "vs/base/common/event", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/workbench/parts/output/common/output", "vs/workbench/services/panel/common/panelService", "vs/editor/common/services/modelService", "vs/platform/workspace/common/workspace", "vs/workbench/parts/output/common/outputLinkProvider", "vs/editor/common/services/resolverService", "vs/editor/common/services/modeService", "vs/base/common/async", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/platform/files/common/files", "vs/workbench/common/editor/resourceEditorInput", "vs/platform/environment/common/environment", "spdlog", "vs/base/common/date", "vs/platform/windows/common/windows", "vs/platform/log/common/log", "vs/base/common/arrays", "vs/platform/telemetry/common/telemetry", "vs/base/common/network", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, nls, paths, strings, extfs, fs, winjs_base_1, event_1, uri_1, lifecycle_1, instantiation_1, storage_1, platform_1, editor_1, output_1, panelService_1, modelService_1, workspace_1, outputLinkProvider_1, resolverService_1, modeService_1, async_1, editOperation_1, position_1, files_1, resourceEditorInput_1, environment_1, spdlog_1, date_1, windows_1, log_1, arrays_1, telemetry_1, network_1, lifecycle_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OUTPUT_ACTIVE_CHANNEL_KEY = 'output.activechannel';
    var watchingOutputDir = false;
    var callbacks = [];
    function watchOutputDirectory(outputDir, logService, onChange) {
        callbacks.push(onChange);
        if (!watchingOutputDir) {
            var watcher_1 = extfs.watch(outputDir, function (eventType, fileName) {
                for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
                    var callback = callbacks_1[_i];
                    callback(eventType, fileName);
                }
            }, function (error) {
                logService.error(error);
            });
            watchingOutputDir = true;
            return lifecycle_1.toDisposable(function () {
                callbacks = [];
                if (watcher_1) {
                    watcher_1.removeAllListeners();
                    watcher_1.close();
                }
            });
        }
        return lifecycle_1.toDisposable(function () { });
    }
    var fileWatchers = new Map();
    function watchFile(file, callback) {
        var onFileChange = function (file) {
            for (var _i = 0, _a = fileWatchers.get(file); _i < _a.length; _i++) {
                var callback_1 = _a[_i];
                callback_1();
            }
        };
        var callbacks = fileWatchers.get(file);
        if (!callbacks) {
            callbacks = [];
            fileWatchers.set(file, callbacks);
            fs.watchFile(file, { interval: 1000 }, function (current, previous) {
                if ((previous && !current) || (!previous && !current)) {
                    onFileChange(file);
                    return;
                }
                if (previous && current && previous.mtime !== current.mtime) {
                    onFileChange(file);
                    return;
                }
            });
        }
        callbacks.push(callback);
        return lifecycle_1.toDisposable(function () {
            var allCallbacks = fileWatchers.get(file);
            allCallbacks.splice(allCallbacks.indexOf(callback), 1);
            if (!allCallbacks.length) {
                fs.unwatchFile(file);
                fileWatchers.delete(file);
            }
        });
    }
    function unWatchAllFiles() {
        fileWatchers.forEach(function (value, file) { return fs.unwatchFile(file); });
        fileWatchers.clear();
    }
    var AbstractFileOutputChannel = /** @class */ (function (_super) {
        __extends(AbstractFileOutputChannel, _super);
        function AbstractFileOutputChannel(outputChannelIdentifier, modelUri, fileService, modelService, modeService) {
            var _this = _super.call(this) || this;
            _this.outputChannelIdentifier = outputChannelIdentifier;
            _this.modelUri = modelUri;
            _this.fileService = fileService;
            _this.modelService = modelService;
            _this.modeService = modeService;
            _this.scrollLock = false;
            _this._onDidAppendedContent = new event_1.Emitter();
            _this.onDidAppendedContent = _this._onDidAppendedContent.event;
            _this._onDispose = new event_1.Emitter();
            _this.onDispose = _this._onDispose.event;
            _this.startOffset = 0;
            _this.endOffset = 0;
            _this.file = _this.outputChannelIdentifier.file;
            _this.modelUpdater = new async_1.RunOnceScheduler(function () { return _this.updateModel(); }, 300);
            _this._register(lifecycle_1.toDisposable(function () { return _this.modelUpdater.cancel(); }));
            return _this;
        }
        Object.defineProperty(AbstractFileOutputChannel.prototype, "id", {
            get: function () {
                return this.outputChannelIdentifier.id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractFileOutputChannel.prototype, "label", {
            get: function () {
                return this.outputChannelIdentifier.label;
            },
            enumerable: true,
            configurable: true
        });
        AbstractFileOutputChannel.prototype.clear = function () {
            if (this.modelUpdater.isScheduled()) {
                this.modelUpdater.cancel();
            }
            if (this.model) {
                this.model.setValue('');
            }
            this.startOffset = this.endOffset;
        };
        AbstractFileOutputChannel.prototype.createModel = function (content) {
            var _this = this;
            if (this.model) {
                this.model.setValue(content);
            }
            else {
                this.model = this.modelService.createModel(content, this.modeService.getOrCreateMode(output_1.OUTPUT_MIME), this.modelUri);
                this.onModelCreated(this.model);
                var disposables_1 = [];
                disposables_1.push(this.model.onWillDispose(function () {
                    _this.onModelWillDispose(_this.model);
                    _this.model = null;
                    lifecycle_1.dispose(disposables_1);
                }));
            }
            return this.model;
        };
        AbstractFileOutputChannel.prototype.appendToModel = function (content) {
            if (this.model && content) {
                var lastLine = this.model.getLineCount();
                var lastLineMaxColumn = this.model.getLineMaxColumn(lastLine);
                this.model.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(lastLine, lastLineMaxColumn), content)]);
                this._onDidAppendedContent.fire();
            }
        };
        AbstractFileOutputChannel.prototype.onModelCreated = function (model) { };
        AbstractFileOutputChannel.prototype.onModelWillDispose = function (model) { };
        AbstractFileOutputChannel.prototype.updateModel = function () { };
        AbstractFileOutputChannel.prototype.dispose = function () {
            this._onDispose.fire();
            _super.prototype.dispose.call(this);
        };
        return AbstractFileOutputChannel;
    }(lifecycle_1.Disposable));
    /**
     * An output channel that stores appended messages in a backup file.
     */
    var OutputChannelBackedByFile = /** @class */ (function (_super) {
        __extends(OutputChannelBackedByFile, _super);
        function OutputChannelBackedByFile(outputChannelIdentifier, outputDir, modelUri, fileService, modelService, modeService, logService) {
            var _this = _super.call(this, __assign({}, outputChannelIdentifier, { file: uri_1.default.file(paths.join(outputDir, outputChannelIdentifier.id + ".log")) }), modelUri, fileService, modelService, modeService) || this;
            _this.appendedMessage = '';
            _this.loadingFromFileInProgress = false;
            // Use one rotating file to check for main file reset
            _this.outputWriter = new spdlog_1.RotatingLogger(_this.id, _this.file.fsPath, 1024 * 1024 * 30, 1);
            _this.outputWriter.clearFormatters();
            _this.rotatingFilePath = outputChannelIdentifier.id + ".1.log";
            _this._register(watchOutputDirectory(paths.dirname(_this.file.fsPath), logService, function (eventType, file) { return _this.onFileChangedInOutputDirector(eventType, file); }));
            _this.resettingDelayer = new async_1.ThrottledDelayer(50);
            return _this;
        }
        OutputChannelBackedByFile.prototype.append = function (message) {
            // update end offset always as message is read
            this.endOffset = this.endOffset + new Buffer(message).byteLength;
            if (this.loadingFromFileInProgress) {
                this.appendedMessage += message;
            }
            else {
                this.write(message);
                if (this.model) {
                    this.appendedMessage += message;
                    if (!this.modelUpdater.isScheduled()) {
                        this.modelUpdater.schedule();
                    }
                }
            }
        };
        OutputChannelBackedByFile.prototype.clear = function () {
            _super.prototype.clear.call(this);
            this.appendedMessage = '';
        };
        OutputChannelBackedByFile.prototype.loadModel = function () {
            var _this = this;
            this.loadingFromFileInProgress = true;
            if (this.modelUpdater.isScheduled()) {
                this.modelUpdater.cancel();
            }
            this.appendedMessage = '';
            return this.loadFile()
                .then(function (content) {
                if (_this.endOffset !== _this.startOffset + new Buffer(content).byteLength) {
                    // Queue content is not written into the file
                    // Flush it and load file again
                    _this.flush();
                    return _this.loadFile();
                }
                return content;
            })
                .then(function (content) {
                if (_this.appendedMessage) {
                    _this.write(_this.appendedMessage);
                    _this.appendedMessage = '';
                }
                _this.loadingFromFileInProgress = false;
                return _this.createModel(content);
            });
        };
        OutputChannelBackedByFile.prototype.resetModel = function () {
            this.startOffset = 0;
            this.endOffset = 0;
            if (this.model) {
                return this.loadModel();
            }
            return winjs_base_1.TPromise.as(null);
        };
        OutputChannelBackedByFile.prototype.loadFile = function () {
            var _this = this;
            return this.fileService.resolveContent(this.file, { position: this.startOffset })
                .then(function (content) { return _this.appendedMessage ? content.value + _this.appendedMessage : content.value; });
        };
        OutputChannelBackedByFile.prototype.updateModel = function () {
            if (this.model && this.appendedMessage) {
                this.appendToModel(this.appendedMessage);
                this.appendedMessage = '';
            }
        };
        OutputChannelBackedByFile.prototype.onFileChangedInOutputDirector = function (eventType, fileName) {
            var _this = this;
            // Check if rotating file has changed. It changes only when the main file exceeds its limit.
            if (this.rotatingFilePath === fileName) {
                this.resettingDelayer.trigger(function () { return _this.resetModel(); });
            }
        };
        OutputChannelBackedByFile.prototype.write = function (content) {
            this.outputWriter.critical(content);
        };
        OutputChannelBackedByFile.prototype.flush = function () {
            this.outputWriter.flush();
        };
        OutputChannelBackedByFile = __decorate([
            __param(3, files_1.IFileService),
            __param(4, modelService_1.IModelService),
            __param(5, modeService_1.IModeService),
            __param(6, log_1.ILogService)
        ], OutputChannelBackedByFile);
        return OutputChannelBackedByFile;
    }(AbstractFileOutputChannel));
    var OutputFileListener = /** @class */ (function (_super) {
        __extends(OutputFileListener, _super);
        function OutputFileListener(file) {
            var _this = _super.call(this) || this;
            _this.file = file;
            _this._onDidChange = new event_1.Emitter();
            _this.onDidContentChange = _this._onDidChange.event;
            _this.watching = false;
            _this.disposables = [];
            return _this;
        }
        OutputFileListener.prototype.watch = function () {
            var _this = this;
            if (!this.watching) {
                this.disposables.push(watchFile(this.file.fsPath, function () { return _this._onDidChange.fire(); }));
                this.watching = true;
            }
        };
        OutputFileListener.prototype.unwatch = function () {
            if (this.watching) {
                this.disposables = lifecycle_1.dispose(this.disposables);
                this.watching = false;
            }
        };
        OutputFileListener.prototype.dispose = function () {
            this.unwatch();
            _super.prototype.dispose.call(this);
        };
        return OutputFileListener;
    }(lifecycle_1.Disposable));
    /**
     * An output channel driven by a file and does not support appending messages.
     */
    var FileOutputChannel = /** @class */ (function (_super) {
        __extends(FileOutputChannel, _super);
        function FileOutputChannel(outputChannelIdentifier, modelUri, fileService, modelService, modeService, logService) {
            var _this = _super.call(this, outputChannelIdentifier, modelUri, fileService, modelService, modeService) || this;
            _this.updateInProgress = false;
            _this.fileHandler = _this._register(new OutputFileListener(_this.file));
            _this._register(_this.fileHandler.onDidContentChange(function () { return _this.onDidContentChange(); }));
            _this._register(lifecycle_1.toDisposable(function () { return _this.fileHandler.unwatch(); }));
            return _this;
        }
        FileOutputChannel.prototype.loadModel = function () {
            var _this = this;
            return this.fileService.resolveContent(this.file, { position: this.startOffset })
                .then(function (content) {
                _this.endOffset = _this.startOffset + new Buffer(content.value).byteLength;
                return _this.createModel(content.value);
            });
        };
        FileOutputChannel.prototype.append = function (message) {
            throw new Error('Not supported');
        };
        FileOutputChannel.prototype.updateModel = function () {
            var _this = this;
            if (this.model) {
                this.fileService.resolveContent(this.file, { position: this.endOffset })
                    .then(function (content) {
                    if (content.value) {
                        _this.endOffset = _this.endOffset + new Buffer(content.value).byteLength;
                        _this.appendToModel(content.value);
                    }
                    _this.updateInProgress = false;
                }, function () { return _this.updateInProgress = false; });
            }
            else {
                this.updateInProgress = false;
            }
        };
        FileOutputChannel.prototype.onModelCreated = function (model) {
            this.fileHandler.watch();
        };
        FileOutputChannel.prototype.onModelWillDispose = function (model) {
            this.fileHandler.unwatch();
        };
        FileOutputChannel.prototype.onDidContentChange = function () {
            if (!this.updateInProgress) {
                this.updateInProgress = true;
                this.modelUpdater.schedule();
            }
        };
        FileOutputChannel = __decorate([
            __param(2, files_1.IFileService),
            __param(3, modelService_1.IModelService),
            __param(4, modeService_1.IModeService),
            __param(5, log_1.ILogService)
        ], FileOutputChannel);
        return FileOutputChannel;
    }(AbstractFileOutputChannel));
    var OutputService = /** @class */ (function (_super) {
        __extends(OutputService, _super);
        function OutputService(storageService, instantiationService, panelService, contextService, textModelResolverService, environmentService, windowService, telemetryService, logService, lifecycleService) {
            var _this = _super.call(this) || this;
            _this.storageService = storageService;
            _this.instantiationService = instantiationService;
            _this.panelService = panelService;
            _this.telemetryService = telemetryService;
            _this.logService = logService;
            _this.lifecycleService = lifecycleService;
            _this.channels = new Map();
            _this._onActiveOutputChannel = new event_1.Emitter();
            _this.onActiveOutputChannel = _this._onActiveOutputChannel.event;
            _this.activeChannelIdInStorage = _this.storageService.get(OUTPUT_ACTIVE_CHANNEL_KEY, storage_1.StorageScope.WORKSPACE, null);
            _this.outputDir = paths.join(environmentService.logsPath, "output_" + windowService.getCurrentWindowId() + "_" + date_1.toLocalISOString(new Date()).replace(/-|:|\.\d+Z$/g, ''));
            // Register as text model content provider for output
            textModelResolverService.registerTextModelContentProvider(output_1.OUTPUT_SCHEME, _this);
            instantiationService.createInstance(outputLinkProvider_1.OutputLinkProvider);
            // Create output channels for already registered channels
            var registry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
            for (var _i = 0, _a = registry.getChannels(); _i < _a.length; _i++) {
                var channelIdentifier = _a[_i];
                _this.onDidRegisterChannel(channelIdentifier.id);
            }
            _this._register(registry.onDidRegisterChannel(_this.onDidRegisterChannel, _this));
            panelService.onDidPanelOpen(_this.onDidPanelOpen, _this);
            panelService.onDidPanelClose(_this.onDidPanelClose, _this);
            _this._register(lifecycle_1.toDisposable(function () { return unWatchAllFiles(); }));
            // Set active channel to first channel if not set
            if (!_this.activeChannel) {
                var channels = _this.getChannels();
                _this.activeChannel = channels && channels.length > 0 ? _this.getChannel(channels[0].id) : null;
            }
            _this.lifecycleService.onShutdown(function () { return _this.onShutdown(); });
            return _this;
        }
        OutputService.prototype.provideTextContent = function (resource) {
            var channel = this.getChannel(resource.fsPath);
            if (channel) {
                return channel.loadModel();
            }
            return winjs_base_1.TPromise.as(null);
        };
        OutputService.prototype.showChannel = function (id, preserveFocus) {
            var _this = this;
            var channel = this.getChannel(id);
            if (!channel || this.isChannelShown(channel)) {
                return winjs_base_1.TPromise.as(null);
            }
            this.activeChannel = channel;
            var promise = winjs_base_1.TPromise.as(null);
            if (this.isPanelShown()) {
                this.doShowChannel(channel, preserveFocus);
            }
            else {
                promise = this.panelService.openPanel(output_1.OUTPUT_PANEL_ID);
            }
            return promise.then(function () { return _this._onActiveOutputChannel.fire(id); });
        };
        OutputService.prototype.getChannel = function (id) {
            return this.channels.get(id);
        };
        OutputService.prototype.getChannels = function () {
            return platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannels();
        };
        OutputService.prototype.getActiveChannel = function () {
            return this.activeChannel;
        };
        OutputService.prototype.onDidRegisterChannel = function (channelId) {
            var channel = this.createChannel(channelId);
            this.channels.set(channelId, channel);
            if (this.activeChannelIdInStorage === channelId) {
                this.activeChannel = channel;
                this.onDidPanelOpen(this.panelService.getActivePanel());
            }
        };
        OutputService.prototype.onDidPanelOpen = function (panel) {
            if (panel && panel.getId() === output_1.OUTPUT_PANEL_ID) {
                this._outputPanel = this.panelService.getActivePanel();
                if (this.activeChannel) {
                    this.doShowChannel(this.activeChannel, true);
                }
            }
        };
        OutputService.prototype.onDidPanelClose = function (panel) {
            if (this._outputPanel && panel.getId() === output_1.OUTPUT_PANEL_ID) {
                this._outputPanel.clearInput();
            }
        };
        OutputService.prototype.createChannel = function (id) {
            var _this = this;
            var channelDisposables = [];
            var channel = this.instantiateChannel(id);
            channel.onDidAppendedContent(function () {
                if (!channel.scrollLock) {
                    var panel = _this.panelService.getActivePanel();
                    if (panel && panel.getId() === output_1.OUTPUT_PANEL_ID && _this.isChannelShown(channel)) {
                        panel.revealLastLine();
                    }
                }
            }, channelDisposables);
            channel.onDispose(function () {
                platform_1.Registry.as(output_1.Extensions.OutputChannels).removeChannel(id);
                if (_this.activeChannel === channel) {
                    var channels = _this.getChannels();
                    if (_this.isPanelShown() && channels.length) {
                        _this.doShowChannel(_this.getChannel(channels[0].id), true);
                        _this._onActiveOutputChannel.fire(channels[0].id);
                    }
                    else {
                        _this._onActiveOutputChannel.fire(void 0);
                    }
                }
                lifecycle_1.dispose(channelDisposables);
            }, channelDisposables);
            return channel;
        };
        OutputService.prototype.instantiateChannel = function (id) {
            var channelData = platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannel(id);
            if (!channelData) {
                this.logService.error("Channel '" + id + "' is not registered yet");
                throw new Error("Channel '" + id + "' is not registered yet");
            }
            var uri = uri_1.default.from({ scheme: output_1.OUTPUT_SCHEME, path: id });
            if (channelData && channelData.file) {
                return this.instantiationService.createInstance(FileOutputChannel, channelData, uri);
            }
            try {
                return this.instantiationService.createInstance(OutputChannelBackedByFile, { id: id, label: channelData ? channelData.label : '' }, this.outputDir, uri);
            }
            catch (e) {
                this.logService.error(e);
                this.telemetryService.publicLog('output.used.bufferedChannel');
                return this.instantiationService.createInstance(BufferredOutputChannel, { id: id, label: channelData ? channelData.label : '' });
            }
        };
        OutputService.prototype.doShowChannel = function (channel, preserveFocus) {
            if (this._outputPanel) {
                this._outputPanel.setInput(this.createInput(channel), editor_1.EditorOptions.create({ preserveFocus: preserveFocus }));
                if (!preserveFocus) {
                    this._outputPanel.focus();
                }
            }
        };
        OutputService.prototype.isChannelShown = function (channel) {
            return this.isPanelShown() && this.activeChannel === channel;
        };
        OutputService.prototype.isPanelShown = function () {
            var panel = this.panelService.getActivePanel();
            return panel && panel.getId() === output_1.OUTPUT_PANEL_ID;
        };
        OutputService.prototype.createInput = function (channel) {
            var resource = uri_1.default.from({ scheme: output_1.OUTPUT_SCHEME, path: channel.id });
            return this.instantiationService.createInstance(resourceEditorInput_1.ResourceEditorInput, nls.localize('output', "{0} - Output", channel.label), nls.localize('channel', "Output channel for '{0}'", channel.label), resource);
        };
        OutputService.prototype.onShutdown = function () {
            if (this.activeChannel) {
                this.storageService.store(OUTPUT_ACTIVE_CHANNEL_KEY, this.activeChannel.id, storage_1.StorageScope.WORKSPACE);
            }
            this.dispose();
        };
        OutputService = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, panelService_1.IPanelService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, resolverService_1.ITextModelService),
            __param(5, environment_1.IEnvironmentService),
            __param(6, windows_1.IWindowService),
            __param(7, telemetry_1.ITelemetryService),
            __param(8, log_1.ILogService),
            __param(9, lifecycle_2.ILifecycleService)
        ], OutputService);
        return OutputService;
    }(lifecycle_1.Disposable));
    exports.OutputService = OutputService;
    var LogContentProvider = /** @class */ (function () {
        function LogContentProvider(instantiationService) {
            this.instantiationService = instantiationService;
            this.channels = new Map();
        }
        LogContentProvider.prototype.provideTextContent = function (resource) {
            if (resource.scheme === output_1.LOG_SCHEME) {
                var channel = this.getChannel(resource);
                if (channel) {
                    return channel.loadModel();
                }
            }
            return winjs_base_1.TPromise.as(null);
        };
        LogContentProvider.prototype.getChannel = function (resource) {
            var id = resource.path;
            var channel = this.channels.get(id);
            if (!channel) {
                var channelDisposables_1 = [];
                channel = this.instantiationService.createInstance(FileOutputChannel, { id: id, label: '', file: resource.with({ scheme: network_1.Schemas.file }) }, resource);
                channel.onDispose(function () { return lifecycle_1.dispose(channelDisposables_1); }, channelDisposables_1);
                this.channels.set(id, channel);
            }
            return channel;
        };
        LogContentProvider = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], LogContentProvider);
        return LogContentProvider;
    }());
    exports.LogContentProvider = LogContentProvider;
    // Remove this channel when there are no issues using Output channel backed by file
    var BufferredOutputChannel = /** @class */ (function (_super) {
        __extends(BufferredOutputChannel, _super);
        function BufferredOutputChannel(outputChannelIdentifier, modelService, modeService) {
            var _this = _super.call(this) || this;
            _this.outputChannelIdentifier = outputChannelIdentifier;
            _this.modelService = modelService;
            _this.modeService = modeService;
            _this.file = null;
            _this.scrollLock = false;
            _this._onDidAppendedContent = new event_1.Emitter();
            _this.onDidAppendedContent = _this._onDidAppendedContent.event;
            _this._onDispose = new event_1.Emitter();
            _this.onDispose = _this._onDispose.event;
            _this.lastReadId = void 0;
            _this.id = outputChannelIdentifier.id;
            _this.label = outputChannelIdentifier.label;
            _this.modelUpdater = new async_1.RunOnceScheduler(function () { return _this.updateModel(); }, 300);
            _this._register(lifecycle_1.toDisposable(function () { return _this.modelUpdater.cancel(); }));
            _this.bufferredContent = new BufferedContent();
            _this._register(lifecycle_1.toDisposable(function () { return _this.bufferredContent.clear(); }));
            return _this;
        }
        BufferredOutputChannel.prototype.append = function (output) {
            this.bufferredContent.append(output);
            if (!this.modelUpdater.isScheduled()) {
                this.modelUpdater.schedule();
            }
        };
        BufferredOutputChannel.prototype.clear = function () {
            if (this.modelUpdater.isScheduled()) {
                this.modelUpdater.cancel();
            }
            if (this.model) {
                this.model.setValue('');
            }
            this.bufferredContent.clear();
            this.lastReadId = void 0;
        };
        BufferredOutputChannel.prototype.loadModel = function () {
            var _a = this.bufferredContent.getDelta(this.lastReadId), value = _a.value, id = _a.id;
            if (this.model) {
                this.model.setValue(value);
            }
            else {
                this.model = this.createModel(value);
            }
            this.lastReadId = id;
            return winjs_base_1.TPromise.as(this.model);
        };
        BufferredOutputChannel.prototype.createModel = function (content) {
            var _this = this;
            var model = this.modelService.createModel(content, this.modeService.getOrCreateMode(output_1.OUTPUT_MIME), uri_1.default.from({ scheme: output_1.OUTPUT_SCHEME, path: this.id }));
            var disposables = [];
            disposables.push(model.onWillDispose(function () {
                _this.model = null;
                lifecycle_1.dispose(disposables);
            }));
            return model;
        };
        BufferredOutputChannel.prototype.updateModel = function () {
            if (this.model) {
                var _a = this.bufferredContent.getDelta(this.lastReadId), value = _a.value, id = _a.id;
                this.lastReadId = id;
                var lastLine = this.model.getLineCount();
                var lastLineMaxColumn = this.model.getLineMaxColumn(lastLine);
                this.model.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(lastLine, lastLineMaxColumn), value)]);
                this._onDidAppendedContent.fire();
            }
        };
        BufferredOutputChannel.prototype.dispose = function () {
            this._onDispose.fire();
            _super.prototype.dispose.call(this);
        };
        BufferredOutputChannel = __decorate([
            __param(1, modelService_1.IModelService),
            __param(2, modeService_1.IModeService)
        ], BufferredOutputChannel);
        return BufferredOutputChannel;
    }(lifecycle_1.Disposable));
    var BufferedContent = /** @class */ (function () {
        function BufferedContent() {
            this.data = [];
            this.dataIds = [];
            this.idPool = 0;
            this.length = 0;
        }
        BufferedContent.prototype.append = function (content) {
            this.data.push(content);
            this.dataIds.push(++this.idPool);
            this.length += content.length;
            this.trim();
        };
        BufferedContent.prototype.clear = function () {
            this.data.length = 0;
            this.dataIds.length = 0;
            this.length = 0;
        };
        BufferedContent.prototype.trim = function () {
            if (this.length < output_1.MAX_OUTPUT_LENGTH * 1.2) {
                return;
            }
            while (this.length > output_1.MAX_OUTPUT_LENGTH) {
                this.dataIds.shift();
                var removed = this.data.shift();
                this.length -= removed.length;
            }
        };
        BufferedContent.prototype.getDelta = function (previousId) {
            var idx = -1;
            if (previousId !== void 0) {
                idx = arrays_1.binarySearch(this.dataIds, previousId, function (a, b) { return a - b; });
            }
            var id = this.idPool;
            if (idx >= 0) {
                var value = strings.removeAnsiEscapeCodes(this.data.slice(idx + 1).join(''));
                return { value: value, id: id };
            }
            else {
                var value = strings.removeAnsiEscapeCodes(this.data.join(''));
                return { value: value, id: id };
            }
        };
        return BufferedContent;
    }());
});
