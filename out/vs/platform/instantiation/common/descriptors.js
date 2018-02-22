define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SyncDescriptor = /** @class */ (function () {
        function SyncDescriptor(ctor) {
            var _staticArguments = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                _staticArguments[_i - 1] = arguments[_i];
            }
            this.ctor = ctor;
            this.staticArguments = _staticArguments;
        }
        return SyncDescriptor;
    }());
    exports.SyncDescriptor = SyncDescriptor;
    exports.createSyncDescriptor = function (ctor) {
        var staticArguments = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            staticArguments[_i - 1] = arguments[_i];
        }
        return new (SyncDescriptor.bind.apply(SyncDescriptor, [void 0, ctor].concat(staticArguments)))();
    };
});
