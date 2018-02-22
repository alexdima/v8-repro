/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CodeActionKind = /** @class */ (function () {
        function CodeActionKind(value) {
            this.value = value;
        }
        CodeActionKind.prototype.contains = function (other) {
            return this.value === other || strings_1.startsWith(other, this.value + CodeActionKind.sep);
        };
        CodeActionKind.sep = '.';
        CodeActionKind.Empty = new CodeActionKind('');
        CodeActionKind.Refactor = new CodeActionKind('refactor');
        return CodeActionKind;
    }());
    exports.CodeActionKind = CodeActionKind;
    var CodeActionAutoApply;
    (function (CodeActionAutoApply) {
        CodeActionAutoApply[CodeActionAutoApply["IfSingle"] = 1] = "IfSingle";
        CodeActionAutoApply[CodeActionAutoApply["First"] = 2] = "First";
        CodeActionAutoApply[CodeActionAutoApply["Never"] = 3] = "Never";
    })(CodeActionAutoApply = exports.CodeActionAutoApply || (exports.CodeActionAutoApply = {}));
});
