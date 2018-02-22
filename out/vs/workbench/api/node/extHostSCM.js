var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/base/common/event", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/base/common/async", "./extHost.protocol", "vs/base/common/arrays", "vs/base/common/comparers", "vs/platform/log/common/log"], function (require, exports, uri_1, winjs_base_1, event_1, decorators_1, lifecycle_1, async_1, extHost_protocol_1, arrays_1, comparers_1, log_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getIconPath(decorations) {
        if (!decorations) {
            return undefined;
        }
        else if (typeof decorations.iconPath === 'string') {
            return uri_1.default.file(decorations.iconPath).toString();
        }
        else if (decorations.iconPath) {
            return "" + decorations.iconPath;
        }
        return undefined;
    }
    function compareResourceThemableDecorations(a, b) {
        if (!a.iconPath && !b.iconPath) {
            return 0;
        }
        else if (!a.iconPath) {
            return -1;
        }
        else if (!b.iconPath) {
            return 1;
        }
        var aPath = typeof a.iconPath === 'string' ? a.iconPath : a.iconPath.fsPath;
        var bPath = typeof b.iconPath === 'string' ? b.iconPath : b.iconPath.fsPath;
        return comparers_1.comparePaths(aPath, bPath);
    }
    function compareResourceStatesDecorations(a, b) {
        var result = 0;
        if (a.strikeThrough !== b.strikeThrough) {
            return a.strikeThrough ? 1 : -1;
        }
        if (a.faded !== b.faded) {
            return a.faded ? 1 : -1;
        }
        if (a.tooltip !== b.tooltip) {
            return (a.tooltip || '').localeCompare(b.tooltip);
        }
        result = compareResourceThemableDecorations(a, b);
        if (result !== 0) {
            return result;
        }
        if (a.light && b.light) {
            result = compareResourceThemableDecorations(a.light, b.light);
        }
        else if (a.light) {
            return 1;
        }
        else if (b.light) {
            return -1;
        }
        if (result !== 0) {
            return result;
        }
        if (a.dark && b.dark) {
            result = compareResourceThemableDecorations(a.dark, b.dark);
        }
        else if (a.dark) {
            return 1;
        }
        else if (b.dark) {
            return -1;
        }
        return result;
    }
    function compareResourceStates(a, b) {
        var result = comparers_1.comparePaths(a.resourceUri.fsPath, b.resourceUri.fsPath, true);
        if (result !== 0) {
            return result;
        }
        if (a.decorations && b.decorations) {
            result = compareResourceStatesDecorations(a.decorations, b.decorations);
        }
        else if (a.decorations) {
            return 1;
        }
        else if (b.decorations) {
            return -1;
        }
        return result;
    }
    var ExtHostSCMInputBox = /** @class */ (function () {
        function ExtHostSCMInputBox(_extension, _proxy, _sourceControlHandle) {
            this._extension = _extension;
            this._proxy = _proxy;
            this._sourceControlHandle = _sourceControlHandle;
            this._value = '';
            this._onDidChange = new event_1.Emitter();
            this._placeholder = '';
            // noop
        }
        Object.defineProperty(ExtHostSCMInputBox.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                this._proxy.$setInputBoxValue(this._sourceControlHandle, value);
                this.updateValue(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSCMInputBox.prototype, "onDidChange", {
            get: function () {
                return this._onDidChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSCMInputBox.prototype, "placeholder", {
            get: function () {
                return this._placeholder;
            },
            set: function (placeholder) {
                this._proxy.$setInputBoxPlaceholder(this._sourceControlHandle, placeholder);
                this._placeholder = placeholder;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSCMInputBox.prototype, "validateInput", {
            get: function () {
                if (!this._extension.enableProposedApi) {
                    throw new Error("[" + this._extension.id + "]: Proposed API is only available when running out of dev or with the following command line switch: --enable-proposed-api " + this._extension.id);
                }
                return this._validateInput;
            },
            set: function (fn) {
                if (!this._extension.enableProposedApi) {
                    throw new Error("[" + this._extension.id + "]: Proposed API is only available when running out of dev or with the following command line switch: --enable-proposed-api " + this._extension.id);
                }
                if (fn && typeof fn !== 'function') {
                    console.warn('Invalid SCM input box validation function');
                    return;
                }
                this._validateInput = fn;
                this._proxy.$setValidationProviderIsEnabled(this._sourceControlHandle, !!fn);
            },
            enumerable: true,
            configurable: true
        });
        ExtHostSCMInputBox.prototype.$onInputBoxValueChange = function (value) {
            this.updateValue(value);
        };
        ExtHostSCMInputBox.prototype.updateValue = function (value) {
            this._value = value;
            this._onDidChange.fire(value);
        };
        return ExtHostSCMInputBox;
    }());
    exports.ExtHostSCMInputBox = ExtHostSCMInputBox;
    var ExtHostSourceControlResourceGroup = /** @class */ (function () {
        function ExtHostSourceControlResourceGroup(_proxy, _commands, _sourceControlHandle, _id, _label) {
            this._proxy = _proxy;
            this._commands = _commands;
            this._sourceControlHandle = _sourceControlHandle;
            this._id = _id;
            this._label = _label;
            this._resourceHandlePool = 0;
            this._resourceStates = [];
            this._resourceStatesMap = new Map();
            this._resourceStatesCommandsMap = new Map();
            this._onDidUpdateResourceStates = new event_1.Emitter();
            this.onDidUpdateResourceStates = this._onDidUpdateResourceStates.event;
            this._onDidDispose = new event_1.Emitter();
            this.onDidDispose = this._onDidDispose.event;
            this._handlesSnapshot = [];
            this._resourceSnapshot = [];
            this._hideWhenEmpty = undefined;
            this.handle = ExtHostSourceControlResourceGroup._handlePool++;
            this._disposables = [];
            this._proxy.$registerGroup(_sourceControlHandle, this.handle, _id, _label);
        }
        Object.defineProperty(ExtHostSourceControlResourceGroup.prototype, "id", {
            get: function () { return this._id; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControlResourceGroup.prototype, "label", {
            get: function () { return this._label; },
            set: function (label) {
                this._label = label;
                this._proxy.$updateGroupLabel(this._sourceControlHandle, this.handle, label);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControlResourceGroup.prototype, "hideWhenEmpty", {
            get: function () { return this._hideWhenEmpty; },
            set: function (hideWhenEmpty) {
                this._hideWhenEmpty = hideWhenEmpty;
                this._proxy.$updateGroup(this._sourceControlHandle, this.handle, { hideWhenEmpty: hideWhenEmpty });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControlResourceGroup.prototype, "resourceStates", {
            get: function () { return this._resourceStates.slice(); },
            set: function (resources) {
                this._resourceStates = resources.slice();
                this._onDidUpdateResourceStates.fire();
            },
            enumerable: true,
            configurable: true
        });
        ExtHostSourceControlResourceGroup.prototype.getResourceState = function (handle) {
            return this._resourceStatesMap.get(handle);
        };
        ExtHostSourceControlResourceGroup.prototype.$executeResourceCommand = function (handle) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var command, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            command = this._resourceStatesCommandsMap.get(handle);
                            if (!command) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, (_a = this._commands).executeCommand.apply(_a, [command.command].concat(command.arguments))];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ExtHostSourceControlResourceGroup.prototype._takeResourceStateSnapshot = function () {
            var _this = this;
            var snapshot = this._resourceStates.slice().sort(compareResourceStates);
            var diffs = arrays_1.sortedDiff(this._resourceSnapshot, snapshot, compareResourceStates);
            var splices = diffs.map(function (diff) {
                var toInsert = diff.toInsert.map(function (r) {
                    var handle = _this._resourceHandlePool++;
                    _this._resourceStatesMap.set(handle, r);
                    var sourceUri = r.resourceUri;
                    var iconPath = getIconPath(r.decorations);
                    var lightIconPath = r.decorations && getIconPath(r.decorations.light) || iconPath;
                    var darkIconPath = r.decorations && getIconPath(r.decorations.dark) || iconPath;
                    var icons = [];
                    if (r.command) {
                        _this._resourceStatesCommandsMap.set(handle, r.command);
                    }
                    if (lightIconPath || darkIconPath) {
                        icons.push(lightIconPath);
                    }
                    if (darkIconPath !== lightIconPath) {
                        icons.push(darkIconPath);
                    }
                    var tooltip = (r.decorations && r.decorations.tooltip) || '';
                    var strikeThrough = r.decorations && !!r.decorations.strikeThrough;
                    var faded = r.decorations && !!r.decorations.faded;
                    var source = r.decorations && r.decorations.source || undefined;
                    var letter = r.decorations && r.decorations.letter || undefined;
                    var color = r.decorations && r.decorations.color || undefined;
                    var rawResource = [handle, sourceUri, icons, tooltip, strikeThrough, faded, source, letter, color];
                    return { rawResource: rawResource, handle: handle };
                });
                return { start: diff.start, deleteCount: diff.deleteCount, toInsert: toInsert };
            });
            var rawResourceSplices = splices
                .map(function (_a) {
                var start = _a.start, deleteCount = _a.deleteCount, toInsert = _a.toInsert;
                return [start, deleteCount, toInsert.map(function (i) { return i.rawResource; })];
            });
            var reverseSplices = splices.reverse();
            for (var _i = 0, reverseSplices_1 = reverseSplices; _i < reverseSplices_1.length; _i++) {
                var _a = reverseSplices_1[_i], start = _a.start, deleteCount = _a.deleteCount, toInsert = _a.toInsert;
                var handles = toInsert.map(function (i) { return i.handle; });
                var handlesToDelete = (_b = this._handlesSnapshot).splice.apply(_b, [start, deleteCount].concat(handles));
                for (var _c = 0, handlesToDelete_1 = handlesToDelete; _c < handlesToDelete_1.length; _c++) {
                    var handle = handlesToDelete_1[_c];
                    this._resourceStatesMap.delete(handle);
                    this._resourceStatesCommandsMap.delete(handle);
                }
            }
            this._resourceSnapshot = snapshot;
            return rawResourceSplices;
            var _b;
        };
        ExtHostSourceControlResourceGroup.prototype.dispose = function () {
            this._proxy.$unregisterGroup(this._sourceControlHandle, this.handle);
            this._disposables = lifecycle_1.dispose(this._disposables);
            this._onDidDispose.fire();
        };
        ExtHostSourceControlResourceGroup._handlePool = 0;
        return ExtHostSourceControlResourceGroup;
    }());
    var ExtHostSourceControl = /** @class */ (function () {
        function ExtHostSourceControl(_extension, _proxy, _commands, _id, _label, _rootUri) {
            this._proxy = _proxy;
            this._commands = _commands;
            this._id = _id;
            this._label = _label;
            this._rootUri = _rootUri;
            this._groups = new Map();
            this._count = undefined;
            this._quickDiffProvider = undefined;
            this._commitTemplate = undefined;
            this._acceptInputCommand = undefined;
            this._statusBarCommands = undefined;
            this.handle = ExtHostSourceControl._handlePool++;
            this.updatedResourceGroups = new Set();
            this._inputBox = new ExtHostSCMInputBox(_extension, this._proxy, this.handle);
            this._proxy.$registerSourceControl(this.handle, _id, _label, _rootUri);
        }
        Object.defineProperty(ExtHostSourceControl.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControl.prototype, "label", {
            get: function () {
                return this._label;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControl.prototype, "rootUri", {
            get: function () {
                return this._rootUri;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControl.prototype, "inputBox", {
            get: function () { return this._inputBox; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControl.prototype, "count", {
            get: function () {
                return this._count;
            },
            set: function (count) {
                this._count = count;
                this._proxy.$updateSourceControl(this.handle, { count: count });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControl.prototype, "quickDiffProvider", {
            get: function () {
                return this._quickDiffProvider;
            },
            set: function (quickDiffProvider) {
                this._quickDiffProvider = quickDiffProvider;
                this._proxy.$updateSourceControl(this.handle, { hasQuickDiffProvider: !!quickDiffProvider });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControl.prototype, "commitTemplate", {
            get: function () {
                return this._commitTemplate;
            },
            set: function (commitTemplate) {
                this._commitTemplate = commitTemplate;
                this._proxy.$updateSourceControl(this.handle, { commitTemplate: commitTemplate });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControl.prototype, "acceptInputCommand", {
            get: function () {
                return this._acceptInputCommand;
            },
            set: function (acceptInputCommand) {
                this._acceptInputCommand = acceptInputCommand;
                var internal = this._commands.converter.toInternal(acceptInputCommand);
                this._proxy.$updateSourceControl(this.handle, { acceptInputCommand: internal });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostSourceControl.prototype, "statusBarCommands", {
            get: function () {
                return this._statusBarCommands;
            },
            set: function (statusBarCommands) {
                var _this = this;
                this._statusBarCommands = statusBarCommands;
                var internal = (statusBarCommands || []).map(function (c) { return _this._commands.converter.toInternal(c); });
                this._proxy.$updateSourceControl(this.handle, { statusBarCommands: internal });
            },
            enumerable: true,
            configurable: true
        });
        ExtHostSourceControl.prototype.createResourceGroup = function (id, label) {
            var _this = this;
            var group = new ExtHostSourceControlResourceGroup(this._proxy, this._commands, this.handle, id, label);
            var updateListener = group.onDidUpdateResourceStates(function () {
                _this.updatedResourceGroups.add(group);
                _this.eventuallyUpdateResourceStates();
            });
            event_1.once(group.onDidDispose)(function () {
                _this.updatedResourceGroups.delete(group);
                updateListener.dispose();
                _this._groups.delete(group.handle);
            });
            this._groups.set(group.handle, group);
            return group;
        };
        ExtHostSourceControl.prototype.eventuallyUpdateResourceStates = function () {
            var splices = [];
            this.updatedResourceGroups.forEach(function (group) {
                var snapshot = group._takeResourceStateSnapshot();
                if (snapshot.length === 0) {
                    return;
                }
                splices.push([group.handle, snapshot]);
            });
            if (splices.length > 0) {
                this._proxy.$spliceResourceStates(this.handle, splices);
            }
            this.updatedResourceGroups.clear();
        };
        ExtHostSourceControl.prototype.getResourceGroup = function (handle) {
            return this._groups.get(handle);
        };
        ExtHostSourceControl.prototype.dispose = function () {
            this._groups.forEach(function (group) { return group.dispose(); });
            this._proxy.$unregisterSourceControl(this.handle);
        };
        ExtHostSourceControl._handlePool = 0;
        __decorate([
            decorators_1.debounce(100)
        ], ExtHostSourceControl.prototype, "eventuallyUpdateResourceStates", null);
        return ExtHostSourceControl;
    }());
    var ExtHostSCM = /** @class */ (function () {
        function ExtHostSCM(mainContext, _commands, logService) {
            var _this = this;
            this._commands = _commands;
            this.logService = logService;
            this._sourceControls = new Map();
            this._sourceControlsByExtension = new Map();
            this._onDidChangeActiveProvider = new event_1.Emitter();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadSCM);
            _commands.registerArgumentProcessor({
                processArgument: function (arg) {
                    if (arg && arg.$mid === 3) {
                        var sourceControl = _this._sourceControls.get(arg.sourceControlHandle);
                        if (!sourceControl) {
                            return arg;
                        }
                        var group = sourceControl.getResourceGroup(arg.groupHandle);
                        if (!group) {
                            return arg;
                        }
                        return group.getResourceState(arg.handle);
                    }
                    else if (arg && arg.$mid === 4) {
                        var sourceControl = _this._sourceControls.get(arg.sourceControlHandle);
                        if (!sourceControl) {
                            return arg;
                        }
                        return sourceControl.getResourceGroup(arg.groupHandle);
                    }
                    else if (arg && arg.$mid === 5) {
                        var sourceControl = _this._sourceControls.get(arg.handle);
                        if (!sourceControl) {
                            return arg;
                        }
                        return sourceControl;
                    }
                    return arg;
                }
            });
        }
        Object.defineProperty(ExtHostSCM.prototype, "onDidChangeActiveProvider", {
            get: function () { return this._onDidChangeActiveProvider.event; },
            enumerable: true,
            configurable: true
        });
        ExtHostSCM.prototype.createSourceControl = function (extension, id, label, rootUri) {
            this.logService.trace('ExtHostSCM#createSourceControl', extension.id, id, label, rootUri);
            var handle = ExtHostSCM._handlePool++;
            var sourceControl = new ExtHostSourceControl(extension, this._proxy, this._commands, id, label, rootUri);
            this._sourceControls.set(handle, sourceControl);
            var sourceControls = this._sourceControlsByExtension.get(extension.id) || [];
            sourceControls.push(sourceControl);
            this._sourceControlsByExtension.set(extension.id, sourceControls);
            return sourceControl;
        };
        // Deprecated
        ExtHostSCM.prototype.getLastInputBox = function (extension) {
            this.logService.trace('ExtHostSCM#getLastInputBox', extension.id);
            var sourceControls = this._sourceControlsByExtension.get(extension.id);
            var sourceControl = sourceControls && sourceControls[sourceControls.length - 1];
            var inputBox = sourceControl && sourceControl.inputBox;
            return inputBox;
        };
        ExtHostSCM.prototype.$provideOriginalResource = function (sourceControlHandle, uriComponents) {
            var uri = uri_1.default.revive(uriComponents);
            this.logService.trace('ExtHostSCM#$provideOriginalResource', sourceControlHandle, uri.toString());
            var sourceControl = this._sourceControls.get(sourceControlHandle);
            if (!sourceControl || !sourceControl.quickDiffProvider) {
                return winjs_base_1.TPromise.as(null);
            }
            return async_1.asWinJsPromise(function (token) { return sourceControl.quickDiffProvider.provideOriginalResource(uri, token); });
        };
        ExtHostSCM.prototype.$onInputBoxValueChange = function (sourceControlHandle, value) {
            this.logService.trace('ExtHostSCM#$onInputBoxValueChange', sourceControlHandle);
            var sourceControl = this._sourceControls.get(sourceControlHandle);
            if (!sourceControl) {
                return winjs_base_1.TPromise.as(null);
            }
            sourceControl.inputBox.$onInputBoxValueChange(value);
            return winjs_base_1.TPromise.as(null);
        };
        ExtHostSCM.prototype.$executeResourceCommand = function (sourceControlHandle, groupHandle, handle) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var sourceControl, group;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logService.trace('ExtHostSCM#$executeResourceCommand', sourceControlHandle, groupHandle, handle);
                            sourceControl = this._sourceControls.get(sourceControlHandle);
                            if (!sourceControl) {
                                return [2 /*return*/];
                            }
                            group = sourceControl.getResourceGroup(groupHandle);
                            if (!group) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, group.$executeResourceCommand(handle)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ExtHostSCM.prototype.$validateInput = function (sourceControlHandle, value, cursorPosition) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var sourceControl, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logService.trace('ExtHostSCM#$validateInput', sourceControlHandle);
                            sourceControl = this._sourceControls.get(sourceControlHandle);
                            if (!sourceControl) {
                                return [2 /*return*/, winjs_base_1.TPromise.as(undefined)];
                            }
                            if (!sourceControl.inputBox.validateInput) {
                                return [2 /*return*/, winjs_base_1.TPromise.as(undefined)];
                            }
                            return [4 /*yield*/, sourceControl.inputBox.validateInput(value, cursorPosition)];
                        case 1:
                            result = _a.sent();
                            if (!result) {
                                return [2 /*return*/, winjs_base_1.TPromise.as(undefined)];
                            }
                            return [2 /*return*/, [result.message, result.type]];
                    }
                });
            });
        };
        ExtHostSCM._handlePool = 0;
        ExtHostSCM = __decorate([
            __param(2, log_1.ILogService)
        ], ExtHostSCM);
        return ExtHostSCM;
    }());
    exports.ExtHostSCM = ExtHostSCM;
});
