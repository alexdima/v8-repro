/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sequence = /** @class */ (function () {
        function Sequence() {
            this.elements = [];
            this._onDidSplice = new event_1.Emitter();
            this.onDidSplice = this._onDidSplice.event;
        }
        Sequence.prototype.splice = function (start, deleteCount, toInsert) {
            if (toInsert === void 0) { toInsert = []; }
            (_a = this.elements).splice.apply(_a, [start, deleteCount].concat(toInsert));
            this._onDidSplice.fire({ start: start, deleteCount: deleteCount, toInsert: toInsert });
            var _a;
        };
        return Sequence;
    }());
    exports.Sequence = Sequence;
});
