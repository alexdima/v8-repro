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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/workbench/services/scm/common/scm", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers", "vs/base/common/sequence"], function (require, exports, winjs_base_1, uri_1, event_1, objects_1, lifecycle_1, scm_1, extHost_protocol_1, extHostCustomers_1, sequence_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadSCMResourceGroup = /** @class */ (function () {
        function MainThreadSCMResourceGroup(sourceControlHandle, handle, provider, features, label, id) {
            this.sourceControlHandle = sourceControlHandle;
            this.handle = handle;
            this.provider = provider;
            this.features = features;
            this.label = label;
            this.id = id;
            this.elements = [];
            this._onDidSplice = new event_1.Emitter();
            this.onDidSplice = this._onDidSplice.event;
            this._onDidChange = new event_1.Emitter();
        }
        Object.defineProperty(MainThreadSCMResourceGroup.prototype, "hideWhenEmpty", {
            get: function () { return this.features.hideWhenEmpty; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMResourceGroup.prototype, "onDidChange", {
            get: function () { return this._onDidChange.event; },
            enumerable: true,
            configurable: true
        });
        MainThreadSCMResourceGroup.prototype.toJSON = function () {
            return {
                $mid: 4,
                sourceControlHandle: this.sourceControlHandle,
                groupHandle: this.handle
            };
        };
        MainThreadSCMResourceGroup.prototype.splice = function (start, deleteCount, toInsert) {
            (_a = this.elements).splice.apply(_a, [start, deleteCount].concat(toInsert));
            this._onDidSplice.fire({ start: start, deleteCount: deleteCount, toInsert: toInsert });
            var _a;
        };
        MainThreadSCMResourceGroup.prototype.$updateGroup = function (features) {
            this.features = objects_1.assign(this.features, features);
            this._onDidChange.fire();
        };
        MainThreadSCMResourceGroup.prototype.$updateGroupLabel = function (label) {
            this.label = label;
            this._onDidChange.fire();
        };
        return MainThreadSCMResourceGroup;
    }());
    var MainThreadSCMResource = /** @class */ (function () {
        function MainThreadSCMResource(proxy, sourceControlHandle, groupHandle, handle, sourceUri, resourceGroup, decorations) {
            this.proxy = proxy;
            this.sourceControlHandle = sourceControlHandle;
            this.groupHandle = groupHandle;
            this.handle = handle;
            this.sourceUri = sourceUri;
            this.resourceGroup = resourceGroup;
            this.decorations = decorations;
        }
        MainThreadSCMResource.prototype.open = function () {
            return this.proxy.$executeResourceCommand(this.sourceControlHandle, this.groupHandle, this.handle);
        };
        MainThreadSCMResource.prototype.toJSON = function () {
            return {
                $mid: 3,
                sourceControlHandle: this.sourceControlHandle,
                groupHandle: this.groupHandle,
                handle: this.handle
            };
        };
        return MainThreadSCMResource;
    }());
    var MainThreadSCMProvider = /** @class */ (function () {
        function MainThreadSCMProvider(proxy, _handle, _contextValue, _label, _rootUri, scmService) {
            this.proxy = proxy;
            this._handle = _handle;
            this._contextValue = _contextValue;
            this._label = _label;
            this._rootUri = _rootUri;
            this._id = "scm" + MainThreadSCMProvider.ID_HANDLE++;
            this.groups = new sequence_1.Sequence();
            this._groupsByHandle = Object.create(null);
            // get groups(): ISequence<ISCMResourceGroup> {
            // 	return {
            // 		elements: this._groups,
            // 		onDidSplice: this._onDidSplice.event
            // 	};
            // 	// return this._groups
            // 	// 	.filter(g => g.resources.elements.length > 0 || !g.features.hideWhenEmpty);
            // }
            this._onDidChangeResources = new event_1.Emitter();
            this.features = {};
            this._onDidChangeCommitTemplate = new event_1.Emitter();
            this._onDidChange = new event_1.Emitter();
        }
        Object.defineProperty(MainThreadSCMProvider.prototype, "id", {
            get: function () { return this._id; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "onDidChangeResources", {
            get: function () { return this._onDidChangeResources.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "handle", {
            get: function () { return this._handle; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "label", {
            get: function () { return this._label; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "rootUri", {
            get: function () { return this._rootUri; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "contextValue", {
            get: function () { return this._contextValue; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "commitTemplate", {
            get: function () { return this.features.commitTemplate; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "acceptInputCommand", {
            get: function () { return this.features.acceptInputCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "statusBarCommands", {
            get: function () { return this.features.statusBarCommands; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "count", {
            get: function () { return this.features.count; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "onDidChangeCommitTemplate", {
            get: function () { return this._onDidChangeCommitTemplate.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainThreadSCMProvider.prototype, "onDidChange", {
            get: function () { return this._onDidChange.event; },
            enumerable: true,
            configurable: true
        });
        MainThreadSCMProvider.prototype.$updateSourceControl = function (features) {
            this.features = objects_1.assign(this.features, features);
            this._onDidChange.fire();
            if (typeof features.commitTemplate !== 'undefined') {
                this._onDidChangeCommitTemplate.fire(this.commitTemplate);
            }
        };
        MainThreadSCMProvider.prototype.$registerGroup = function (handle, id, label) {
            var group = new MainThreadSCMResourceGroup(this.handle, handle, this, {}, label, id);
            this._groupsByHandle[handle] = group;
            this.groups.splice(this.groups.elements.length, 0, [group]);
        };
        MainThreadSCMProvider.prototype.$updateGroup = function (handle, features) {
            var group = this._groupsByHandle[handle];
            if (!group) {
                return;
            }
            group.$updateGroup(features);
        };
        MainThreadSCMProvider.prototype.$updateGroupLabel = function (handle, label) {
            var group = this._groupsByHandle[handle];
            if (!group) {
                return;
            }
            group.$updateGroupLabel(label);
        };
        MainThreadSCMProvider.prototype.$spliceGroupResourceStates = function (splices) {
            var _this = this;
            var _loop_1 = function (groupHandle, groupSlices) {
                var group = this_1._groupsByHandle[groupHandle];
                if (!group) {
                    console.warn("SCM group " + groupHandle + " not found in provider " + this_1.label);
                    return "continue";
                }
                // reverse the splices sequence in order to apply them correctly
                groupSlices.reverse();
                for (var _i = 0, groupSlices_1 = groupSlices; _i < groupSlices_1.length; _i++) {
                    var _a = groupSlices_1[_i], start = _a[0], deleteCount = _a[1], rawResources = _a[2];
                    var resources = rawResources.map(function (rawResource) {
                        var handle = rawResource[0], sourceUri = rawResource[1], icons = rawResource[2], tooltip = rawResource[3], strikeThrough = rawResource[4], faded = rawResource[5], source = rawResource[6], letter = rawResource[7], color = rawResource[8];
                        var icon = icons[0];
                        var iconDark = icons[1] || icon;
                        var decorations = {
                            icon: icon && uri_1.default.parse(icon),
                            iconDark: iconDark && uri_1.default.parse(iconDark),
                            tooltip: tooltip,
                            strikeThrough: strikeThrough,
                            faded: faded,
                            source: source,
                            letter: letter,
                            color: color && color.id
                        };
                        return new MainThreadSCMResource(_this.proxy, _this.handle, groupHandle, handle, uri_1.default.revive(sourceUri), group, decorations);
                    });
                    group.splice(start, deleteCount, resources);
                }
            };
            var this_1 = this;
            for (var _i = 0, splices_1 = splices; _i < splices_1.length; _i++) {
                var _a = splices_1[_i], groupHandle = _a[0], groupSlices = _a[1];
                _loop_1(groupHandle, groupSlices);
            }
            this._onDidChangeResources.fire();
        };
        MainThreadSCMProvider.prototype.$unregisterGroup = function (handle) {
            var group = this._groupsByHandle[handle];
            if (!group) {
                return;
            }
            delete this._groupsByHandle[handle];
            this.groups.splice(this.groups.elements.indexOf(group), 1);
        };
        MainThreadSCMProvider.prototype.getOriginalResource = function (uri) {
            if (!this.features.hasQuickDiffProvider) {
                return winjs_base_1.TPromise.as(null);
            }
            return this.proxy.$provideOriginalResource(this.handle, uri)
                .then(function (result) { return result && uri_1.default.revive(result); });
        };
        MainThreadSCMProvider.prototype.toJSON = function () {
            return {
                $mid: 5,
                handle: this.handle
            };
        };
        MainThreadSCMProvider.prototype.dispose = function () {
        };
        MainThreadSCMProvider.ID_HANDLE = 0;
        MainThreadSCMProvider = __decorate([
            __param(5, scm_1.ISCMService)
        ], MainThreadSCMProvider);
        return MainThreadSCMProvider;
    }());
    var MainThreadSCM = /** @class */ (function () {
        function MainThreadSCM(extHostContext, scmService) {
            this.scmService = scmService;
            this._repositories = Object.create(null);
            this._inputDisposables = Object.create(null);
            this._disposables = [];
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostSCM);
        }
        MainThreadSCM.prototype.dispose = function () {
            var _this = this;
            Object.keys(this._repositories)
                .forEach(function (id) { return _this._repositories[id].dispose(); });
            this._repositories = Object.create(null);
            Object.keys(this._inputDisposables)
                .forEach(function (id) { return _this._inputDisposables[id].dispose(); });
            this._inputDisposables = Object.create(null);
            this._disposables = lifecycle_1.dispose(this._disposables);
        };
        MainThreadSCM.prototype.$registerSourceControl = function (handle, id, label, rootUri) {
            var _this = this;
            var provider = new MainThreadSCMProvider(this._proxy, handle, id, label, rootUri && uri_1.default.revive(rootUri), this.scmService);
            var repository = this.scmService.registerSCMProvider(provider);
            this._repositories[handle] = repository;
            var inputDisposable = repository.input.onDidChange(function (value) { return _this._proxy.$onInputBoxValueChange(handle, value); });
            this._inputDisposables[handle] = inputDisposable;
        };
        MainThreadSCM.prototype.$updateSourceControl = function (handle, features) {
            var repository = this._repositories[handle];
            if (!repository) {
                return;
            }
            var provider = repository.provider;
            provider.$updateSourceControl(features);
        };
        MainThreadSCM.prototype.$unregisterSourceControl = function (handle) {
            var repository = this._repositories[handle];
            if (!repository) {
                return;
            }
            this._inputDisposables[handle].dispose();
            delete this._inputDisposables[handle];
            repository.dispose();
            delete this._repositories[handle];
        };
        MainThreadSCM.prototype.$registerGroup = function (sourceControlHandle, groupHandle, id, label) {
            var repository = this._repositories[sourceControlHandle];
            if (!repository) {
                return;
            }
            var provider = repository.provider;
            provider.$registerGroup(groupHandle, id, label);
        };
        MainThreadSCM.prototype.$updateGroup = function (sourceControlHandle, groupHandle, features) {
            var repository = this._repositories[sourceControlHandle];
            if (!repository) {
                return;
            }
            var provider = repository.provider;
            provider.$updateGroup(groupHandle, features);
        };
        MainThreadSCM.prototype.$updateGroupLabel = function (sourceControlHandle, groupHandle, label) {
            var repository = this._repositories[sourceControlHandle];
            if (!repository) {
                return;
            }
            var provider = repository.provider;
            provider.$updateGroupLabel(groupHandle, label);
        };
        MainThreadSCM.prototype.$spliceResourceStates = function (sourceControlHandle, splices) {
            var repository = this._repositories[sourceControlHandle];
            if (!repository) {
                return;
            }
            var provider = repository.provider;
            provider.$spliceGroupResourceStates(splices);
        };
        MainThreadSCM.prototype.$unregisterGroup = function (sourceControlHandle, handle) {
            var repository = this._repositories[sourceControlHandle];
            if (!repository) {
                return;
            }
            var provider = repository.provider;
            provider.$unregisterGroup(handle);
        };
        MainThreadSCM.prototype.$setInputBoxValue = function (sourceControlHandle, value) {
            var repository = this._repositories[sourceControlHandle];
            if (!repository) {
                return;
            }
            repository.input.value = value;
        };
        MainThreadSCM.prototype.$setInputBoxPlaceholder = function (sourceControlHandle, placeholder) {
            var repository = this._repositories[sourceControlHandle];
            if (!repository) {
                return;
            }
            repository.input.placeholder = placeholder;
        };
        MainThreadSCM.prototype.$setValidationProviderIsEnabled = function (sourceControlHandle, enabled) {
            var _this = this;
            var repository = this._repositories[sourceControlHandle];
            if (!repository) {
                return;
            }
            if (enabled) {
                repository.input.validateInput = function (value, pos) { return __awaiter(_this, void 0, winjs_base_1.TPromise, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this._proxy.$validateInput(sourceControlHandle, value, pos)];
                            case 1:
                                result = _a.sent();
                                if (!result) {
                                    return [2 /*return*/, undefined];
                                }
                                return [2 /*return*/, {
                                        message: result[0],
                                        type: result[1]
                                    }];
                        }
                    });
                }); };
            }
            else {
                repository.input.validateInput = function () { return winjs_base_1.TPromise.as(undefined); };
            }
        };
        MainThreadSCM = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadSCM),
            __param(1, scm_1.ISCMService)
        ], MainThreadSCM);
        return MainThreadSCM;
    }());
    exports.MainThreadSCM = MainThreadSCM;
});
