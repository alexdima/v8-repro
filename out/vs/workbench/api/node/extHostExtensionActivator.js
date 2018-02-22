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
define(["require", "exports", "vs/nls", "vs/base/common/severity", "vs/base/common/winjs.base"], function (require, exports, nls, severity_1, winjs_base_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var hasOwnProperty = Object.hasOwnProperty;
    var NO_OP_VOID_PROMISE = winjs_base_1.TPromise.wrap(void 0);
    var ExtensionActivationTimes = /** @class */ (function () {
        function ExtensionActivationTimes(startup, codeLoadingTime, activateCallTime, activateResolvedTime) {
            this.startup = startup;
            this.codeLoadingTime = codeLoadingTime;
            this.activateCallTime = activateCallTime;
            this.activateResolvedTime = activateResolvedTime;
        }
        ExtensionActivationTimes.NONE = new ExtensionActivationTimes(false, -1, -1, -1);
        return ExtensionActivationTimes;
    }());
    exports.ExtensionActivationTimes = ExtensionActivationTimes;
    var ExtensionActivationTimesBuilder = /** @class */ (function () {
        function ExtensionActivationTimesBuilder(startup) {
            this._startup = startup;
            this._codeLoadingStart = -1;
            this._codeLoadingStop = -1;
            this._activateCallStart = -1;
            this._activateCallStop = -1;
            this._activateResolveStart = -1;
            this._activateResolveStop = -1;
        }
        ExtensionActivationTimesBuilder.prototype._delta = function (start, stop) {
            if (start === -1 || stop === -1) {
                return -1;
            }
            return stop - start;
        };
        ExtensionActivationTimesBuilder.prototype.build = function () {
            return new ExtensionActivationTimes(this._startup, this._delta(this._codeLoadingStart, this._codeLoadingStop), this._delta(this._activateCallStart, this._activateCallStop), this._delta(this._activateResolveStart, this._activateResolveStop));
        };
        ExtensionActivationTimesBuilder.prototype.codeLoadingStart = function () {
            this._codeLoadingStart = Date.now();
        };
        ExtensionActivationTimesBuilder.prototype.codeLoadingStop = function () {
            this._codeLoadingStop = Date.now();
        };
        ExtensionActivationTimesBuilder.prototype.activateCallStart = function () {
            this._activateCallStart = Date.now();
        };
        ExtensionActivationTimesBuilder.prototype.activateCallStop = function () {
            this._activateCallStop = Date.now();
        };
        ExtensionActivationTimesBuilder.prototype.activateResolveStart = function () {
            this._activateResolveStart = Date.now();
        };
        ExtensionActivationTimesBuilder.prototype.activateResolveStop = function () {
            this._activateResolveStop = Date.now();
        };
        return ExtensionActivationTimesBuilder;
    }());
    exports.ExtensionActivationTimesBuilder = ExtensionActivationTimesBuilder;
    var ActivatedExtension = /** @class */ (function () {
        function ActivatedExtension(activationFailed, activationTimes, module, exports, subscriptions) {
            this.activationFailed = activationFailed;
            this.activationTimes = activationTimes;
            this.module = module;
            this.exports = exports;
            this.subscriptions = subscriptions;
        }
        return ActivatedExtension;
    }());
    exports.ActivatedExtension = ActivatedExtension;
    var EmptyExtension = /** @class */ (function (_super) {
        __extends(EmptyExtension, _super);
        function EmptyExtension(activationTimes) {
            return _super.call(this, false, activationTimes, { activate: undefined, deactivate: undefined }, undefined, []) || this;
        }
        return EmptyExtension;
    }(ActivatedExtension));
    exports.EmptyExtension = EmptyExtension;
    var FailedExtension = /** @class */ (function (_super) {
        __extends(FailedExtension, _super);
        function FailedExtension(activationTimes) {
            return _super.call(this, true, activationTimes, { activate: undefined, deactivate: undefined }, undefined, []) || this;
        }
        return FailedExtension;
    }(ActivatedExtension));
    exports.FailedExtension = FailedExtension;
    var ExtensionActivatedByEvent = /** @class */ (function () {
        function ExtensionActivatedByEvent(startup, activationEvent) {
            this.startup = startup;
            this.activationEvent = activationEvent;
        }
        return ExtensionActivatedByEvent;
    }());
    exports.ExtensionActivatedByEvent = ExtensionActivatedByEvent;
    var ExtensionActivatedByAPI = /** @class */ (function () {
        function ExtensionActivatedByAPI(startup) {
            this.startup = startup;
        }
        return ExtensionActivatedByAPI;
    }());
    exports.ExtensionActivatedByAPI = ExtensionActivatedByAPI;
    var ExtensionsActivator = /** @class */ (function () {
        function ExtensionsActivator(registry, host) {
            this._registry = registry;
            this._host = host;
            this._activatingExtensions = {};
            this._activatedExtensions = {};
            this._alreadyActivatedEvents = Object.create(null);
        }
        ExtensionsActivator.prototype.isActivated = function (extensionId) {
            return hasOwnProperty.call(this._activatedExtensions, extensionId);
        };
        ExtensionsActivator.prototype.getActivatedExtension = function (extensionId) {
            if (!hasOwnProperty.call(this._activatedExtensions, extensionId)) {
                throw new Error('Extension `' + extensionId + '` is not known or not activated');
            }
            return this._activatedExtensions[extensionId];
        };
        ExtensionsActivator.prototype.activateByEvent = function (activationEvent, reason) {
            var _this = this;
            if (this._alreadyActivatedEvents[activationEvent]) {
                return NO_OP_VOID_PROMISE;
            }
            var activateExtensions = this._registry.getExtensionDescriptionsForActivationEvent(activationEvent);
            return this._activateExtensions(activateExtensions, reason, 0).then(function () {
                _this._alreadyActivatedEvents[activationEvent] = true;
            });
        };
        ExtensionsActivator.prototype.activateById = function (extensionId, reason) {
            var desc = this._registry.getExtensionDescription(extensionId);
            if (!desc) {
                throw new Error('Extension `' + extensionId + '` is not known');
            }
            return this._activateExtensions([desc], reason, 0);
        };
        /**
         * Handle semantics related to dependencies for `currentExtension`.
         * semantics: `redExtensions` must wait for `greenExtensions`.
         */
        ExtensionsActivator.prototype._handleActivateRequest = function (currentExtension, greenExtensions, redExtensions) {
            var depIds = (typeof currentExtension.extensionDependencies === 'undefined' ? [] : currentExtension.extensionDependencies);
            var currentExtensionGetsGreenLight = true;
            for (var j = 0, lenJ = depIds.length; j < lenJ; j++) {
                var depId = depIds[j];
                var depDesc = this._registry.getExtensionDescription(depId);
                if (!depDesc) {
                    // Error condition 1: unknown dependency
                    this._host.showMessage(severity_1.default.Error, nls.localize('unknownDep', "Extension `{1}` failed to activate. Reason: unknown dependency `{0}`.", depId, currentExtension.id));
                    this._activatedExtensions[currentExtension.id] = new FailedExtension(ExtensionActivationTimes.NONE);
                    return;
                }
                if (hasOwnProperty.call(this._activatedExtensions, depId)) {
                    var dep = this._activatedExtensions[depId];
                    if (dep.activationFailed) {
                        // Error condition 2: a dependency has already failed activation
                        this._host.showMessage(severity_1.default.Error, nls.localize('failedDep1', "Extension `{1}` failed to activate. Reason: dependency `{0}` failed to activate.", depId, currentExtension.id));
                        this._activatedExtensions[currentExtension.id] = new FailedExtension(ExtensionActivationTimes.NONE);
                        return;
                    }
                }
                else {
                    // must first wait for the dependency to activate
                    currentExtensionGetsGreenLight = false;
                    greenExtensions[depId] = depDesc;
                }
            }
            if (currentExtensionGetsGreenLight) {
                greenExtensions[currentExtension.id] = currentExtension;
            }
            else {
                redExtensions.push(currentExtension);
            }
        };
        ExtensionsActivator.prototype._activateExtensions = function (extensionDescriptions, reason, recursionLevel) {
            var _this = this;
            // console.log(recursionLevel, '_activateExtensions: ', extensionDescriptions.map(p => p.id));
            if (extensionDescriptions.length === 0) {
                return winjs_base_1.TPromise.as(void 0);
            }
            extensionDescriptions = extensionDescriptions.filter(function (p) { return !hasOwnProperty.call(_this._activatedExtensions, p.id); });
            if (extensionDescriptions.length === 0) {
                return winjs_base_1.TPromise.as(void 0);
            }
            if (recursionLevel > 10) {
                // More than 10 dependencies deep => most likely a dependency loop
                for (var i = 0, len = extensionDescriptions.length; i < len; i++) {
                    // Error condition 3: dependency loop
                    this._host.showMessage(severity_1.default.Error, nls.localize('failedDep2', "Extension `{0}` failed to activate. Reason: more than 10 levels of dependencies (most likely a dependency loop).", extensionDescriptions[i].id));
                    this._activatedExtensions[extensionDescriptions[i].id] = new FailedExtension(ExtensionActivationTimes.NONE);
                }
                return winjs_base_1.TPromise.as(void 0);
            }
            var greenMap = Object.create(null), red = [];
            for (var i = 0, len = extensionDescriptions.length; i < len; i++) {
                this._handleActivateRequest(extensionDescriptions[i], greenMap, red);
            }
            // Make sure no red is also green
            for (var i = 0, len = red.length; i < len; i++) {
                if (greenMap[red[i].id]) {
                    delete greenMap[red[i].id];
                }
            }
            var green = Object.keys(greenMap).map(function (id) { return greenMap[id]; });
            // console.log('greenExtensions: ', green.map(p => p.id));
            // console.log('redExtensions: ', red.map(p => p.id));
            if (red.length === 0) {
                // Finally reached only leafs!
                return winjs_base_1.TPromise.join(green.map(function (p) { return _this._activateExtension(p, reason); })).then(function (_) { return void 0; });
            }
            return this._activateExtensions(green, reason, recursionLevel + 1).then(function (_) {
                return _this._activateExtensions(red, reason, recursionLevel + 1);
            });
        };
        ExtensionsActivator.prototype._activateExtension = function (extensionDescription, reason) {
            var _this = this;
            if (hasOwnProperty.call(this._activatedExtensions, extensionDescription.id)) {
                return winjs_base_1.TPromise.as(void 0);
            }
            if (hasOwnProperty.call(this._activatingExtensions, extensionDescription.id)) {
                return this._activatingExtensions[extensionDescription.id];
            }
            this._activatingExtensions[extensionDescription.id] = this._host.actualActivateExtension(extensionDescription, reason).then(null, function (err) {
                _this._host.showMessage(severity_1.default.Error, nls.localize('activationError', "Activating extension `{0}` failed: {1}.", extensionDescription.id, err.message));
                console.error('Activating extension `' + extensionDescription.id + '` failed: ', err.message);
                console.log('Here is the error stack: ', err.stack);
                // Treat the extension as being empty
                return new FailedExtension(ExtensionActivationTimes.NONE);
            }).then(function (x) {
                _this._activatedExtensions[extensionDescription.id] = x;
                delete _this._activatingExtensions[extensionDescription.id];
            });
            return this._activatingExtensions[extensionDescription.id];
        };
        return ExtensionsActivator;
    }());
    exports.ExtensionsActivator = ExtensionsActivator;
});
