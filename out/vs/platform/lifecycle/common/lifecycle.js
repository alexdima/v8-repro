define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/event", "vs/platform/instantiation/common/instantiation"], function (require, exports, winjs_base_1, event_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ILifecycleService = instantiation_1.createDecorator('lifecycleService');
    var ShutdownReason;
    (function (ShutdownReason) {
        /** Window is closed */
        ShutdownReason[ShutdownReason["CLOSE"] = 1] = "CLOSE";
        /** Application is quit */
        ShutdownReason[ShutdownReason["QUIT"] = 2] = "QUIT";
        /** Window is reloaded */
        ShutdownReason[ShutdownReason["RELOAD"] = 3] = "RELOAD";
        /** Other configuration loaded into window */
        ShutdownReason[ShutdownReason["LOAD"] = 4] = "LOAD";
    })(ShutdownReason = exports.ShutdownReason || (exports.ShutdownReason = {}));
    var StartupKind;
    (function (StartupKind) {
        StartupKind[StartupKind["NewWindow"] = 1] = "NewWindow";
        StartupKind[StartupKind["ReloadedWindow"] = 3] = "ReloadedWindow";
        StartupKind[StartupKind["ReopenedWindow"] = 4] = "ReopenedWindow";
    })(StartupKind = exports.StartupKind || (exports.StartupKind = {}));
    var LifecyclePhase;
    (function (LifecyclePhase) {
        LifecyclePhase[LifecyclePhase["Starting"] = 1] = "Starting";
        LifecyclePhase[LifecyclePhase["Restoring"] = 2] = "Restoring";
        LifecyclePhase[LifecyclePhase["Running"] = 3] = "Running";
        LifecyclePhase[LifecyclePhase["Eventually"] = 4] = "Eventually";
    })(LifecyclePhase = exports.LifecyclePhase || (exports.LifecyclePhase = {}));
    exports.NullLifecycleService = {
        _serviceBrand: null,
        phase: LifecyclePhase.Running,
        when: function () { return Promise.resolve(); },
        startupKind: StartupKind.NewWindow,
        onWillShutdown: event_1.default.None,
        onShutdown: event_1.default.None
    };
    // Shared veto handling across main and renderer
    function handleVetos(vetos, onError) {
        if (vetos.length === 0) {
            return winjs_base_1.TPromise.as(false);
        }
        var promises = [];
        var lazyValue = false;
        for (var _i = 0, vetos_1 = vetos; _i < vetos_1.length; _i++) {
            var valueOrPromise = vetos_1[_i];
            // veto, done
            if (valueOrPromise === true) {
                return winjs_base_1.TPromise.as(true);
            }
            if (winjs_base_1.TPromise.is(valueOrPromise)) {
                promises.push(valueOrPromise.then(function (value) {
                    if (value) {
                        lazyValue = true; // veto, done
                    }
                }, function (err) {
                    onError(err); // error, treated like a veto, done
                    lazyValue = true;
                }));
            }
        }
        return winjs_base_1.TPromise.join(promises).then(function () { return lazyValue; });
    }
    exports.handleVetos = handleVetos;
});
