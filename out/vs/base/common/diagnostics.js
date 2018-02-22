define(["require", "exports", "vs/base/common/platform"], function (require, exports, Platform) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * To enable diagnostics, open a browser console and type: window.Monaco.Diagnostics.<diagnostics name> = true.
     * Then trigger an action that will write to diagnostics to see all cached output from the past.
     */
    var globals = Platform.globals;
    if (!globals.Monaco) {
        globals.Monaco = {};
    }
    globals.Monaco.Diagnostics = {};
    var switches = globals.Monaco.Diagnostics;
    var map = new Map();
    var data = [];
    function fifo(array, size) {
        while (array.length > size) {
            array.shift();
        }
    }
    function register(what, fn) {
        var disable = true; // Otherwise we have unreachable code.
        if (disable) {
            return function () {
                // Intentional empty, disable for now because it is leaking memory
            };
        }
        // register switch
        var flag = switches[what] || false;
        switches[what] = flag;
        // register function
        var tracers = map.get(what) || [];
        tracers.push(fn);
        map.set(what, tracers);
        var result = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var idx;
            if (switches[what] === true) {
                // replay back-in-time functions
                var allArgs_1 = [arguments];
                idx = data.indexOf(fn);
                if (idx !== -1) {
                    allArgs_1.unshift.apply(allArgs_1, data[idx + 1] || []);
                    data[idx + 1] = [];
                }
                var doIt_1 = function () {
                    var thisArguments = allArgs_1.shift();
                    fn.apply(fn, thisArguments);
                    if (allArgs_1.length > 0) {
                        setTimeout(doIt_1, 500);
                    }
                };
                doIt_1();
            }
            else {
                // know where to store
                idx = data.indexOf(fn);
                idx = idx !== -1 ? idx : data.length;
                var dataIdx = idx + 1;
                // store arguments
                var allargs = data[dataIdx] || [];
                allargs.push(arguments);
                fifo(allargs, 50);
                // store data
                data[idx] = fn;
                data[dataIdx] = allargs;
            }
        };
        return result;
    }
    exports.register = register;
});
