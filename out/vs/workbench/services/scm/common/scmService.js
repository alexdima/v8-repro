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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/log/common/log", "vs/base/common/winjs.base"], function (require, exports, lifecycle_1, event_1, log_1, winjs_base_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SCMInput = /** @class */ (function () {
        function SCMInput() {
            this._value = '';
            this._onDidChange = new event_1.Emitter();
            this._placeholder = '';
            this._onDidChangePlaceholder = new event_1.Emitter();
            this._validateInput = function () { return winjs_base_1.TPromise.as(undefined); };
            this._onDidChangeValidateInput = new event_1.Emitter();
        }
        Object.defineProperty(SCMInput.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                this._value = value;
                this._onDidChange.fire(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCMInput.prototype, "onDidChange", {
            get: function () { return this._onDidChange.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCMInput.prototype, "placeholder", {
            get: function () {
                return this._placeholder;
            },
            set: function (placeholder) {
                this._placeholder = placeholder;
                this._onDidChangePlaceholder.fire(placeholder);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCMInput.prototype, "onDidChangePlaceholder", {
            get: function () { return this._onDidChangePlaceholder.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCMInput.prototype, "validateInput", {
            get: function () {
                return this._validateInput;
            },
            set: function (validateInput) {
                this._validateInput = validateInput;
                this._onDidChangeValidateInput.fire();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCMInput.prototype, "onDidChangeValidateInput", {
            get: function () { return this._onDidChangeValidateInput.event; },
            enumerable: true,
            configurable: true
        });
        return SCMInput;
    }());
    var SCMRepository = /** @class */ (function () {
        function SCMRepository(provider, disposable) {
            this.provider = provider;
            this.disposable = disposable;
            this._onDidFocus = new event_1.Emitter();
            this.onDidFocus = this._onDidFocus.event;
            this.input = new SCMInput();
        }
        SCMRepository.prototype.focus = function () {
            this._onDidFocus.fire();
        };
        SCMRepository.prototype.dispose = function () {
            this.disposable.dispose();
            this.provider.dispose();
        };
        return SCMRepository;
    }());
    var SCMService = /** @class */ (function () {
        function SCMService(logService) {
            this.logService = logService;
            this._providerIds = new Set();
            this._repositories = [];
            this._onDidAddProvider = new event_1.Emitter();
            this._onDidRemoveProvider = new event_1.Emitter();
        }
        Object.defineProperty(SCMService.prototype, "repositories", {
            get: function () { return this._repositories.slice(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCMService.prototype, "onDidAddRepository", {
            get: function () { return this._onDidAddProvider.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SCMService.prototype, "onDidRemoveRepository", {
            get: function () { return this._onDidRemoveProvider.event; },
            enumerable: true,
            configurable: true
        });
        SCMService.prototype.registerSCMProvider = function (provider) {
            var _this = this;
            this.logService.trace('SCMService#registerSCMProvider');
            if (this._providerIds.has(provider.id)) {
                throw new Error("SCM Provider " + provider.id + " already exists.");
            }
            this._providerIds.add(provider.id);
            var disposable = lifecycle_1.toDisposable(function () {
                var index = _this._repositories.indexOf(repository);
                if (index < 0) {
                    return;
                }
                _this._providerIds.delete(provider.id);
                _this._repositories.splice(index, 1);
                _this._onDidRemoveProvider.fire(repository);
            });
            var repository = new SCMRepository(provider, disposable);
            this._repositories.push(repository);
            this._onDidAddProvider.fire(repository);
            return repository;
        };
        SCMService = __decorate([
            __param(0, log_1.ILogService)
        ], SCMService);
        return SCMService;
    }());
    exports.SCMService = SCMService;
});
