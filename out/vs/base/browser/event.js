define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.domEvent = function (element, type, useCapture) {
        var fn = function (e) { return emitter.fire(e); };
        var emitter = new event_1.Emitter({
            onFirstListenerAdd: function () {
                element.addEventListener(type, fn, useCapture);
            },
            onLastListenerRemove: function () {
                element.removeEventListener(type, fn, useCapture);
            }
        });
        return emitter.event;
    };
    function stop(event) {
        return event_1.mapEvent(event, function (e) {
            e.preventDefault();
            e.stopPropagation();
            return e;
        });
    }
    exports.stop = stop;
});
