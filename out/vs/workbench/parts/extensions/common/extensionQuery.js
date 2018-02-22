/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Query = /** @class */ (function () {
        function Query(value, sortBy) {
            this.value = value;
            this.sortBy = sortBy;
            this.value = value.trim();
        }
        Query.parse = function (value) {
            var sortBy = '';
            value = value.replace(/@sort:(\w+)(-\w*)?/g, function (match, by, order) {
                sortBy = by;
                return '';
            });
            return new Query(value, sortBy);
        };
        Query.prototype.toString = function () {
            var result = this.value;
            if (this.sortBy) {
                result = "" + result + (result ? ' ' : '') + "@sort:" + this.sortBy;
            }
            return result;
        };
        Query.prototype.isValid = function () {
            return !/@outdated/.test(this.value);
        };
        Query.prototype.equals = function (other) {
            return this.value === other.value && this.sortBy === other.sortBy;
        };
        return Query;
    }());
    exports.Query = Query;
});
