define(["require", "exports", "assert", "vs/platform/contextkey/common/contextkey"], function (require, exports, assert, contextkey_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createContext(ctx) {
        return {
            getValue: function (key) {
                return ctx[key];
            }
        };
    }
    suite('ContextKeyExpr', function () {
        test('ContextKeyExpr.equals', function () {
            var a = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('a1'), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('and.a')), contextkey_1.ContextKeyExpr.has('a2'), contextkey_1.ContextKeyExpr.regex('d3', /d.*/), contextkey_1.ContextKeyExpr.regex('d4', /\*\*3*/), contextkey_1.ContextKeyExpr.equals('b1', 'bb1'), contextkey_1.ContextKeyExpr.equals('b2', 'bb2'), contextkey_1.ContextKeyExpr.notEquals('c1', 'cc1'), contextkey_1.ContextKeyExpr.notEquals('c2', 'cc2'), contextkey_1.ContextKeyExpr.not('d1'), contextkey_1.ContextKeyExpr.not('d2'));
            var b = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('b2', 'bb2'), contextkey_1.ContextKeyExpr.notEquals('c1', 'cc1'), contextkey_1.ContextKeyExpr.not('d1'), contextkey_1.ContextKeyExpr.regex('d4', /\*\*3*/), contextkey_1.ContextKeyExpr.notEquals('c2', 'cc2'), contextkey_1.ContextKeyExpr.has('a2'), contextkey_1.ContextKeyExpr.equals('b1', 'bb1'), contextkey_1.ContextKeyExpr.regex('d3', /d.*/), contextkey_1.ContextKeyExpr.has('a1'), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('and.a', true)), contextkey_1.ContextKeyExpr.not('d2'));
            assert(a.equals(b), 'expressions should be equal');
        });
        test('normalize', function () {
            var key1IsTrue = contextkey_1.ContextKeyExpr.equals('key1', true);
            var key1IsNotFalse = contextkey_1.ContextKeyExpr.notEquals('key1', false);
            var key1IsFalse = contextkey_1.ContextKeyExpr.equals('key1', false);
            var key1IsNotTrue = contextkey_1.ContextKeyExpr.notEquals('key1', true);
            assert.ok(key1IsTrue.normalize().equals(contextkey_1.ContextKeyExpr.has('key1')));
            assert.ok(key1IsNotFalse.normalize().equals(contextkey_1.ContextKeyExpr.has('key1')));
            assert.ok(key1IsFalse.normalize().equals(contextkey_1.ContextKeyExpr.not('key1')));
            assert.ok(key1IsNotTrue.normalize().equals(contextkey_1.ContextKeyExpr.not('key1')));
        });
        test('evaluate', function () {
            /* tslint:disable:triple-equals */
            var context = createContext({
                'a': true,
                'b': false,
                'c': '5',
                'd': 'd'
            });
            function testExpression(expr, expected) {
                // console.log(expr + ' ' + expected);
                var rules = contextkey_1.ContextKeyExpr.deserialize(expr);
                assert.equal(rules.evaluate(context), expected, expr);
            }
            function testBatch(expr, value) {
                testExpression(expr, !!value);
                testExpression(expr + ' == true', !!value);
                testExpression(expr + ' != true', !value);
                testExpression(expr + ' == false', !value);
                testExpression(expr + ' != false', !!value);
                testExpression(expr + ' == 5', value == '5');
                testExpression(expr + ' != 5', value != '5');
                testExpression('!' + expr, !value);
                testExpression(expr + ' =~ /d.*/', /d.*/.test(value));
            }
            testBatch('a', true);
            testBatch('b', false);
            testBatch('c', '5');
            testBatch('d', 'd');
            testBatch('z', undefined);
            testExpression('a && !b', true && !false);
            testExpression('a && b', true && false);
            testExpression('a && !b && c == 5', true && !false && '5' == '5');
            testExpression('dddd =~ d.*', false);
            /* tslint:enable:triple-equals */
        });
    });
});
