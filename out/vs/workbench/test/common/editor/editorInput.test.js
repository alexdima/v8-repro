/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "assert", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput"], function (require, exports, assert, editor_1, diffEditorInput_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MyEditorInput = /** @class */ (function (_super) {
        __extends(MyEditorInput, _super);
        function MyEditorInput() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MyEditorInput.prototype.getTypeId = function () {
            return '';
        };
        MyEditorInput.prototype.resolve = function (refresh) {
            return null;
        };
        return MyEditorInput;
    }(editor_1.EditorInput));
    suite('Workbench - EditorInput', function () {
        test('EditorInput', function () {
            var counter = 0;
            var input = new MyEditorInput();
            var otherInput = new MyEditorInput();
            assert(input.matches(input));
            assert(!input.matches(otherInput));
            assert(!input.matches(null));
            assert(!input.getName());
            input.onDispose(function () {
                assert(true);
                counter++;
            });
            input.dispose();
            assert.equal(counter, 1);
        });
        test('DiffEditorInput', function () {
            var counter = 0;
            var input = new MyEditorInput();
            input.onDispose(function () {
                assert(true);
                counter++;
            });
            var otherInput = new MyEditorInput();
            otherInput.onDispose(function () {
                assert(true);
                counter++;
            });
            var diffInput = new diffEditorInput_1.DiffEditorInput('name', 'description', input, otherInput);
            assert.equal(diffInput.originalInput, input);
            assert.equal(diffInput.modifiedInput, otherInput);
            assert(diffInput.matches(diffInput));
            assert(!diffInput.matches(otherInput));
            assert(!diffInput.matches(null));
            diffInput.dispose();
            assert.equal(counter, 0);
        });
        test('DiffEditorInput disposes when input inside disposes', function () {
            var counter = 0;
            var input = new MyEditorInput();
            var otherInput = new MyEditorInput();
            var diffInput = new diffEditorInput_1.DiffEditorInput('name', 'description', input, otherInput);
            diffInput.onDispose(function () {
                counter++;
                assert(true);
            });
            input.dispose();
            input = new MyEditorInput();
            otherInput = new MyEditorInput();
            var diffInput2 = new diffEditorInput_1.DiffEditorInput('name', 'description', input, otherInput);
            diffInput2.onDispose(function () {
                counter++;
                assert(true);
            });
            otherInput.dispose();
            assert.equal(counter, 2);
        });
    });
});
