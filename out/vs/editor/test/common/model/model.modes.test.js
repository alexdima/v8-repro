define(["require", "exports", "assert", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/modes", "vs/editor/common/modes/nullMode", "vs/editor/common/core/token"], function (require, exports, assert, editOperation_1, position_1, range_1, textModel_1, modes, nullMode_1, token_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // --------- utils
    suite('Editor Model - Model Modes 1', function () {
        var calledFor = [];
        function checkAndClear(arr) {
            assert.deepEqual(calledFor, arr);
            calledFor = [];
        }
        var tokenizationSupport = {
            getInitialState: function () { return nullMode_1.NULL_STATE; },
            tokenize: undefined,
            tokenize2: function (line, state) {
                calledFor.push(line.charAt(0));
                return new token_1.TokenizationResult2(null, state);
            }
        };
        var thisModel = null;
        var languageRegistration = null;
        setup(function () {
            var TEXT = '1\r\n' +
                '2\n' +
                '3\n' +
                '4\r\n' +
                '5';
            var LANGUAGE_ID = 'modelModeTest1';
            calledFor = [];
            languageRegistration = modes.TokenizationRegistry.register(LANGUAGE_ID, tokenizationSupport);
            thisModel = textModel_1.TextModel.createFromString(TEXT, undefined, new modes.LanguageIdentifier(LANGUAGE_ID, 0));
        });
        teardown(function () {
            thisModel.dispose();
            thisModel = null;
            languageRegistration.dispose();
            languageRegistration = null;
            calledFor = [];
        });
        test('model calls syntax highlighter 1', function () {
            thisModel.forceTokenization(1);
            checkAndClear(['1']);
        });
        test('model calls syntax highlighter 2', function () {
            thisModel.forceTokenization(2);
            checkAndClear(['1', '2']);
            thisModel.forceTokenization(2);
            checkAndClear([]);
        });
        test('model caches states', function () {
            thisModel.forceTokenization(1);
            checkAndClear(['1']);
            thisModel.forceTokenization(2);
            checkAndClear(['2']);
            thisModel.forceTokenization(3);
            checkAndClear(['3']);
            thisModel.forceTokenization(4);
            checkAndClear(['4']);
            thisModel.forceTokenization(5);
            checkAndClear(['5']);
            thisModel.forceTokenization(5);
            checkAndClear([]);
        });
        test('model invalidates states for one line insert', function () {
            thisModel.forceTokenization(5);
            checkAndClear(['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), '-')]);
            thisModel.forceTokenization(5);
            checkAndClear(['-']);
            thisModel.forceTokenization(5);
            checkAndClear([]);
        });
        test('model invalidates states for many lines insert', function () {
            thisModel.forceTokenization(5);
            checkAndClear(['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), '0\n-\n+')]);
            assert.equal(thisModel.getLineCount(), 7);
            thisModel.forceTokenization(7);
            checkAndClear(['0', '-', '+']);
            thisModel.forceTokenization(7);
            checkAndClear([]);
        });
        test('model invalidates states for one new line', function () {
            thisModel.forceTokenization(5);
            checkAndClear(['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 2), '\n')]);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(2, 1), 'a')]);
            thisModel.forceTokenization(6);
            checkAndClear(['1', 'a']);
        });
        test('model invalidates states for one line delete', function () {
            thisModel.forceTokenization(5);
            checkAndClear(['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 2), '-')]);
            thisModel.forceTokenization(5);
            checkAndClear(['1']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 2))]);
            thisModel.forceTokenization(5);
            checkAndClear(['-']);
            thisModel.forceTokenization(5);
            checkAndClear([]);
        });
        test('model invalidates states for many lines delete', function () {
            thisModel.forceTokenization(5);
            checkAndClear(['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 3, 1))]);
            thisModel.forceTokenization(3);
            checkAndClear(['3']);
            thisModel.forceTokenization(3);
            checkAndClear([]);
        });
    });
    suite('Editor Model - Model Modes 2', function () {
        var ModelState2 = /** @class */ (function () {
            function ModelState2(prevLineContent) {
                this.prevLineContent = prevLineContent;
            }
            ModelState2.prototype.clone = function () {
                return new ModelState2(this.prevLineContent);
            };
            ModelState2.prototype.equals = function (other) {
                return (other instanceof ModelState2) && other.prevLineContent === this.prevLineContent;
            };
            return ModelState2;
        }());
        var tokenizationSupport = {
            getInitialState: function () { return new ModelState2(''); },
            tokenize: undefined,
            tokenize2: function (line, state) {
                state.prevLineContent = line;
                return new token_1.TokenizationResult2(null, state);
            }
        };
        function invalidEqual(model, expected) {
            var actual = [];
            for (var i = 0, len = model.getLineCount(); i < len; i++) {
                if (model._tokens._isInvalid(i)) {
                    actual.push(i);
                }
            }
            assert.deepEqual(actual, expected);
        }
        function stateEqual(state, content) {
            assert.equal(state.prevLineContent, content);
        }
        function statesEqual(model, states) {
            var i, len = states.length - 1;
            for (i = 0; i < len; i++) {
                stateEqual(model._tokens._getState(i), states[i]);
            }
            stateEqual(model._tokens._lastState, states[len]);
        }
        var thisModel = null;
        var languageRegistration = null;
        setup(function () {
            var TEXT = 'Line1' + '\r\n' +
                'Line2' + '\n' +
                'Line3' + '\n' +
                'Line4' + '\r\n' +
                'Line5';
            var LANGUAGE_ID = 'modelModeTest2';
            languageRegistration = modes.TokenizationRegistry.register(LANGUAGE_ID, tokenizationSupport);
            thisModel = textModel_1.TextModel.createFromString(TEXT, undefined, new modes.LanguageIdentifier(LANGUAGE_ID, 0));
        });
        teardown(function () {
            thisModel.dispose();
            thisModel = null;
            languageRegistration.dispose();
            languageRegistration = null;
        });
        test('getTokensForInvalidLines one text insert', function () {
            thisModel.forceTokenization(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 6), '-')]);
            invalidEqual(thisModel, [0]);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.forceTokenization(5);
            statesEqual(thisModel, ['', 'Line1-', 'Line2', 'Line3', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines two text insert', function () {
            thisModel.forceTokenization(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([
                editOperation_1.EditOperation.insert(new position_1.Position(1, 6), '-'),
                editOperation_1.EditOperation.insert(new position_1.Position(3, 6), '-')
            ]);
            invalidEqual(thisModel, [0, 2]);
            thisModel.forceTokenization(5);
            statesEqual(thisModel, ['', 'Line1-', 'Line2', 'Line3-', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines one multi-line text insert, one small text insert', function () {
            thisModel.forceTokenization(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 6), '\nNew line\nAnother new line')]);
            invalidEqual(thisModel, [0, 1, 2]);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(5, 6), '-')]);
            invalidEqual(thisModel, [0, 1, 2, 4]);
            thisModel.forceTokenization(7);
            statesEqual(thisModel, ['', 'Line1', 'New line', 'Another new line', 'Line2', 'Line3-', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines one delete text', function () {
            thisModel.forceTokenization(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 5))]);
            invalidEqual(thisModel, [0]);
            thisModel.forceTokenization(5);
            statesEqual(thisModel, ['', '1', 'Line2', 'Line3', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines one line delete text', function () {
            thisModel.forceTokenization(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 2, 1))]);
            invalidEqual(thisModel, [0]);
            statesEqual(thisModel, ['', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.forceTokenization(4);
            statesEqual(thisModel, ['', 'Line2', 'Line3', 'Line4', 'Line5']);
        });
        test('getTokensForInvalidLines multiple lines delete text', function () {
            thisModel.forceTokenization(5);
            statesEqual(thisModel, ['', 'Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 3, 3))]);
            invalidEqual(thisModel, [0]);
            statesEqual(thisModel, ['', 'Line3', 'Line4', 'Line5']);
            thisModel.forceTokenization(3);
            statesEqual(thisModel, ['', 'ne3', 'Line4', 'Line5']);
        });
    });
});
