/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map", "assert", "vs/base/common/uri"], function (require, exports, map_1, assert, uri_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Map', function () {
        test('LinkedMap - Simple', function () {
            var map = new map_1.LinkedMap();
            map.set('ak', 'av');
            map.set('bk', 'bv');
            assert.deepStrictEqual(map.keys(), ['ak', 'bk']);
            assert.deepStrictEqual(map.values(), ['av', 'bv']);
        });
        test('LinkedMap - Touch Old one', function () {
            var map = new map_1.LinkedMap();
            map.set('ak', 'av');
            map.set('ak', 'av', map_1.Touch.AsOld);
            assert.deepStrictEqual(map.keys(), ['ak']);
            assert.deepStrictEqual(map.values(), ['av']);
        });
        test('LinkedMap - Touch New one', function () {
            var map = new map_1.LinkedMap();
            map.set('ak', 'av');
            map.set('ak', 'av', map_1.Touch.AsNew);
            assert.deepStrictEqual(map.keys(), ['ak']);
            assert.deepStrictEqual(map.values(), ['av']);
        });
        test('LinkedMap - Touch Old two', function () {
            var map = new map_1.LinkedMap();
            map.set('ak', 'av');
            map.set('bk', 'bv');
            map.set('bk', 'bv', map_1.Touch.AsOld);
            assert.deepStrictEqual(map.keys(), ['bk', 'ak']);
            assert.deepStrictEqual(map.values(), ['bv', 'av']);
        });
        test('LinkedMap - Touch New two', function () {
            var map = new map_1.LinkedMap();
            map.set('ak', 'av');
            map.set('bk', 'bv');
            map.set('ak', 'av', map_1.Touch.AsNew);
            assert.deepStrictEqual(map.keys(), ['bk', 'ak']);
            assert.deepStrictEqual(map.values(), ['bv', 'av']);
        });
        test('LinkedMap - Touch Old from middle', function () {
            var map = new map_1.LinkedMap();
            map.set('ak', 'av');
            map.set('bk', 'bv');
            map.set('ck', 'cv');
            map.set('bk', 'bv', map_1.Touch.AsOld);
            assert.deepStrictEqual(map.keys(), ['bk', 'ak', 'ck']);
            assert.deepStrictEqual(map.values(), ['bv', 'av', 'cv']);
        });
        test('LinkedMap - Touch New from middle', function () {
            var map = new map_1.LinkedMap();
            map.set('ak', 'av');
            map.set('bk', 'bv');
            map.set('ck', 'cv');
            map.set('bk', 'bv', map_1.Touch.AsNew);
            assert.deepStrictEqual(map.keys(), ['ak', 'ck', 'bk']);
            assert.deepStrictEqual(map.values(), ['av', 'cv', 'bv']);
        });
        test('LinkedMap - basics', function () {
            var map = new map_1.LinkedMap();
            assert.equal(map.size, 0);
            map.set('1', 1);
            map.set('2', '2');
            map.set('3', true);
            var obj = Object.create(null);
            map.set('4', obj);
            var date = Date.now();
            map.set('5', date);
            assert.equal(map.size, 5);
            assert.equal(map.get('1'), 1);
            assert.equal(map.get('2'), '2');
            assert.equal(map.get('3'), true);
            assert.equal(map.get('4'), obj);
            assert.equal(map.get('5'), date);
            assert.ok(!map.get('6'));
            map.delete('6');
            assert.equal(map.size, 5);
            assert.equal(map.delete('1'), true);
            assert.equal(map.delete('2'), true);
            assert.equal(map.delete('3'), true);
            assert.equal(map.delete('4'), true);
            assert.equal(map.delete('5'), true);
            assert.equal(map.size, 0);
            assert.ok(!map.get('5'));
            assert.ok(!map.get('4'));
            assert.ok(!map.get('3'));
            assert.ok(!map.get('2'));
            assert.ok(!map.get('1'));
            map.set('1', 1);
            map.set('2', '2');
            map.set('3', true);
            assert.ok(map.has('1'));
            assert.equal(map.get('1'), 1);
            assert.equal(map.get('2'), '2');
            assert.equal(map.get('3'), true);
            map.clear();
            assert.equal(map.size, 0);
            assert.ok(!map.get('1'));
            assert.ok(!map.get('2'));
            assert.ok(!map.get('3'));
            assert.ok(!map.has('1'));
        });
        test('LinkedMap - LRU Cache simple', function () {
            var cache = new map_1.LRUCache(5);
            [1, 2, 3, 4, 5].forEach(function (value) { return cache.set(value, value); });
            assert.strictEqual(cache.size, 5);
            cache.set(6, 6);
            assert.strictEqual(cache.size, 5);
            assert.deepStrictEqual(cache.keys(), [2, 3, 4, 5, 6]);
            cache.set(7, 7);
            assert.strictEqual(cache.size, 5);
            assert.deepStrictEqual(cache.keys(), [3, 4, 5, 6, 7]);
            var values = [];
            [3, 4, 5, 6, 7].forEach(function (key) { return values.push(cache.get(key)); });
            assert.deepStrictEqual(values, [3, 4, 5, 6, 7]);
        });
        test('LinkedMap - LRU Cache get', function () {
            var cache = new map_1.LRUCache(5);
            [1, 2, 3, 4, 5].forEach(function (value) { return cache.set(value, value); });
            assert.strictEqual(cache.size, 5);
            assert.deepStrictEqual(cache.keys(), [1, 2, 3, 4, 5]);
            cache.get(3);
            assert.deepStrictEqual(cache.keys(), [1, 2, 4, 5, 3]);
            cache.peek(4);
            assert.deepStrictEqual(cache.keys(), [1, 2, 4, 5, 3]);
            var values = [];
            [1, 2, 3, 4, 5].forEach(function (key) { return values.push(cache.get(key)); });
            assert.deepStrictEqual(values, [1, 2, 3, 4, 5]);
        });
        test('LinkedMap - LRU Cache limit', function () {
            var cache = new map_1.LRUCache(10);
            for (var i = 1; i <= 10; i++) {
                cache.set(i, i);
            }
            assert.strictEqual(cache.size, 10);
            cache.limit = 5;
            assert.strictEqual(cache.size, 5);
            assert.deepStrictEqual(cache.keys(), [6, 7, 8, 9, 10]);
            cache.limit = 20;
            assert.strictEqual(cache.size, 5);
            for (var i = 11; i <= 20; i++) {
                cache.set(i, i);
            }
            assert.deepEqual(cache.size, 15);
            var values = [];
            for (var i = 6; i <= 20; i++) {
                values.push(cache.get(i));
                assert.strictEqual(cache.get(i), i);
            }
            assert.deepStrictEqual(cache.values(), values);
        });
        test('LinkedMap - LRU Cache limit with ratio', function () {
            var cache = new map_1.LRUCache(10, 0.5);
            for (var i = 1; i <= 10; i++) {
                cache.set(i, i);
            }
            assert.strictEqual(cache.size, 10);
            cache.set(11, 11);
            assert.strictEqual(cache.size, 5);
            assert.deepStrictEqual(cache.keys(), [7, 8, 9, 10, 11]);
            var values = [];
            cache.keys().forEach(function (key) { return values.push(cache.get(key)); });
            assert.deepStrictEqual(values, [7, 8, 9, 10, 11]);
            assert.deepStrictEqual(cache.values(), values);
        });
        test('PathIterator', function () {
            var iter = new map_1.PathIterator();
            iter.reset('file:///usr/bin/file.txt');
            assert.equal(iter.value(), 'file:');
            assert.equal(iter.hasNext(), true);
            assert.equal(iter.cmp('file:'), 0);
            assert.ok(iter.cmp('a') < 0);
            assert.ok(iter.cmp('aile:') < 0);
            assert.ok(iter.cmp('z') > 0);
            assert.ok(iter.cmp('zile:') > 0);
            iter.next();
            assert.equal(iter.value(), 'usr');
            assert.equal(iter.hasNext(), true);
            iter.next();
            assert.equal(iter.value(), 'bin');
            assert.equal(iter.hasNext(), true);
            iter.next();
            assert.equal(iter.value(), 'file.txt');
            assert.equal(iter.hasNext(), false);
            iter.next();
            assert.equal(iter.value(), '');
            assert.equal(iter.hasNext(), false);
            iter.next();
            assert.equal(iter.value(), '');
            assert.equal(iter.hasNext(), false);
            //
            iter.reset('/foo/bar/');
            assert.equal(iter.value(), 'foo');
            assert.equal(iter.hasNext(), true);
            iter.next();
            assert.equal(iter.value(), 'bar');
            assert.equal(iter.hasNext(), false);
        });
        function assertTernarySearchTree(trie) {
            var elements = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                elements[_i - 1] = arguments[_i];
            }
            var map = new Map();
            for (var _a = 0, elements_1 = elements; _a < elements_1.length; _a++) {
                var _b = elements_1[_a], key = _b[0], value = _b[1];
                map.set(key, value);
            }
            map.forEach(function (value, key) {
                assert.equal(trie.get(key), value);
            });
            trie.forEach(function (element, key) {
                assert.equal(element, map.get(key));
                map.delete(key);
            });
            assert.equal(map.size, 0);
        }
        test('TernarySearchTree - set', function () {
            var trie = map_1.TernarySearchTree.forStrings();
            trie.set('foobar', 1);
            trie.set('foobaz', 2);
            assertTernarySearchTree(trie, ['foobar', 1], ['foobaz', 2]); // longer
            trie = map_1.TernarySearchTree.forStrings();
            trie.set('foobar', 1);
            trie.set('fooba', 2);
            assertTernarySearchTree(trie, ['foobar', 1], ['fooba', 2]); // shorter
            trie = map_1.TernarySearchTree.forStrings();
            trie.set('foo', 1);
            trie.set('foo', 2);
            assertTernarySearchTree(trie, ['foo', 2]);
            trie = map_1.TernarySearchTree.forStrings();
            trie.set('foo', 1);
            trie.set('foobar', 2);
            trie.set('bar', 3);
            trie.set('foob', 4);
            trie.set('bazz', 5);
            assertTernarySearchTree(trie, ['foo', 1], ['foobar', 2], ['bar', 3], ['foob', 4], ['bazz', 5]);
        });
        test('TernarySearchTree - findLongestMatch', function () {
            var trie = map_1.TernarySearchTree.forStrings();
            trie.set('foo', 1);
            trie.set('foobar', 2);
            trie.set('foobaz', 3);
            assert.equal(trie.findSubstr('f'), undefined);
            assert.equal(trie.findSubstr('z'), undefined);
            assert.equal(trie.findSubstr('foo'), 1);
            assert.equal(trie.findSubstr('fooö'), 1);
            assert.equal(trie.findSubstr('fooba'), 1);
            assert.equal(trie.findSubstr('foobarr'), 2);
            assert.equal(trie.findSubstr('foobazrr'), 3);
        });
        test('TernarySearchTree - basics', function () {
            var trie = new map_1.TernarySearchTree(new map_1.StringIterator());
            trie.set('foo', 1);
            trie.set('bar', 2);
            trie.set('foobar', 3);
            assert.equal(trie.get('foo'), 1);
            assert.equal(trie.get('bar'), 2);
            assert.equal(trie.get('foobar'), 3);
            assert.equal(trie.get('foobaz'), undefined);
            assert.equal(trie.get('foobarr'), undefined);
            assert.equal(trie.findSubstr('fo'), undefined);
            assert.equal(trie.findSubstr('foo'), 1);
            assert.equal(trie.findSubstr('foooo'), 1);
            trie.delete('foobar');
            trie.delete('bar');
            assert.equal(trie.get('foobar'), undefined);
            assert.equal(trie.get('bar'), undefined);
            trie.set('foobar', 17);
            trie.set('barr', 18);
            assert.equal(trie.get('foobar'), 17);
            assert.equal(trie.get('barr'), 18);
            assert.equal(trie.get('bar'), undefined);
        });
        test('TernarySearchTree - delete & cleanup', function () {
            var trie = new map_1.TernarySearchTree(new map_1.StringIterator());
            trie.set('foo', 1);
            trie.set('foobar', 2);
            trie.set('bar', 3);
            trie.delete('foo');
            trie.delete('foobar');
        });
        test('TernarySearchTree (PathSegments) - basics', function () {
            var trie = new map_1.TernarySearchTree(new map_1.PathIterator());
            trie.set('/user/foo/bar', 1);
            trie.set('/user/foo', 2);
            trie.set('/user/foo/flip/flop', 3);
            assert.equal(trie.get('/user/foo/bar'), 1);
            assert.equal(trie.get('/user/foo'), 2);
            assert.equal(trie.get('/user//foo'), 2);
            assert.equal(trie.get('/user\\foo'), 2);
            assert.equal(trie.get('/user/foo/flip/flop'), 3);
            assert.equal(trie.findSubstr('/user/bar'), undefined);
            assert.equal(trie.findSubstr('/user/foo'), 2);
            assert.equal(trie.findSubstr('\\user\\foo'), 2);
            assert.equal(trie.findSubstr('/user//foo'), 2);
            assert.equal(trie.findSubstr('/user/foo/ba'), 2);
            assert.equal(trie.findSubstr('/user/foo/far/boo'), 2);
            assert.equal(trie.findSubstr('/user/foo/bar'), 1);
            assert.equal(trie.findSubstr('/user/foo/bar/far/boo'), 1);
        });
        test('TernarySearchTree (PathSegments) - lookup', function () {
            var map = new map_1.TernarySearchTree(new map_1.PathIterator());
            map.set('/user/foo/bar', 1);
            map.set('/user/foo', 2);
            map.set('/user/foo/flip/flop', 3);
            assert.equal(map.get('/foo'), undefined);
            assert.equal(map.get('/user'), undefined);
            assert.equal(map.get('/user/foo'), 2);
            assert.equal(map.get('/user/foo/bar'), 1);
            assert.equal(map.get('/user/foo/bar/boo'), undefined);
        });
        test('TernarySearchTree (PathSegments) - superstr', function () {
            var map = new map_1.TernarySearchTree(new map_1.PathIterator());
            map.set('/user/foo/bar', 1);
            map.set('/user/foo', 2);
            map.set('/user/foo/flip/flop', 3);
            map.set('/usr/foo', 4);
            var elements = map.findSuperstr('/user');
            assertTernarySearchTree(elements, ['foo/bar', 1], ['foo', 2], ['foo/flip/flop', 3]);
            // assert.equal(elements.length, 3);
            assert.equal(elements.get('foo/bar'), 1);
            assert.equal(elements.get('foo'), 2);
            assert.equal(elements.get('foo/flip/flop'), 3);
            assertTernarySearchTree(map.findSuperstr('/usr'), ['foo', 4]);
            assert.equal(map.findSuperstr('/usr/foo'), undefined);
            assert.equal(map.get('/usr/foo'), 4);
            assert.equal(map.findSuperstr('/not'), undefined);
            assert.equal(map.findSuperstr('/us'), undefined);
            assert.equal(map.findSuperstr('/usrr'), undefined);
            assert.equal(map.findSuperstr('/userr'), undefined);
        });
        test('ResourceMap - basics', function () {
            var map = new map_1.ResourceMap();
            var resource1 = uri_1.default.parse('some://1');
            var resource2 = uri_1.default.parse('some://2');
            var resource3 = uri_1.default.parse('some://3');
            var resource4 = uri_1.default.parse('some://4');
            var resource5 = uri_1.default.parse('some://5');
            var resource6 = uri_1.default.parse('some://6');
            assert.equal(map.size, 0);
            map.set(resource1, 1);
            map.set(resource2, '2');
            map.set(resource3, true);
            var values = map.values();
            assert.equal(values[0], 1);
            assert.equal(values[1], '2');
            assert.equal(values[2], true);
            var counter = 0;
            map.forEach(function (value) {
                assert.equal(value, values[counter++]);
            });
            var obj = Object.create(null);
            map.set(resource4, obj);
            var date = Date.now();
            map.set(resource5, date);
            assert.equal(map.size, 5);
            assert.equal(map.get(resource1), 1);
            assert.equal(map.get(resource2), '2');
            assert.equal(map.get(resource3), true);
            assert.equal(map.get(resource4), obj);
            assert.equal(map.get(resource5), date);
            assert.ok(!map.get(resource6));
            map.delete(resource6);
            assert.equal(map.size, 5);
            assert.ok(map.delete(resource1));
            assert.ok(map.delete(resource2));
            assert.ok(map.delete(resource3));
            assert.ok(map.delete(resource4));
            assert.ok(map.delete(resource5));
            assert.equal(map.size, 0);
            assert.ok(!map.get(resource5));
            assert.ok(!map.get(resource4));
            assert.ok(!map.get(resource3));
            assert.ok(!map.get(resource2));
            assert.ok(!map.get(resource1));
            map.set(resource1, 1);
            map.set(resource2, '2');
            map.set(resource3, true);
            assert.ok(map.has(resource1));
            assert.equal(map.get(resource1), 1);
            assert.equal(map.get(resource2), '2');
            assert.equal(map.get(resource3), true);
            map.clear();
            assert.equal(map.size, 0);
            assert.ok(!map.get(resource1));
            assert.ok(!map.get(resource2));
            assert.ok(!map.get(resource3));
            assert.ok(!map.has(resource1));
            map.set(resource1, false);
            map.set(resource2, 0);
            assert.ok(map.has(resource1));
            assert.ok(map.has(resource2));
        });
        test('ResourceMap - files (do NOT ignorecase)', function () {
            var map = new map_1.ResourceMap();
            var fileA = uri_1.default.parse('file://some/filea');
            var fileB = uri_1.default.parse('some://some/other/fileb');
            var fileAUpper = uri_1.default.parse('file://SOME/FILEA');
            map.set(fileA, 'true');
            assert.equal(map.get(fileA), 'true');
            assert.ok(!map.get(fileAUpper));
            assert.ok(!map.get(fileB));
            map.set(fileAUpper, 'false');
            assert.equal(map.get(fileAUpper), 'false');
            assert.equal(map.get(fileA), 'true');
            var windowsFile = uri_1.default.file('c:\\test with %25\\c#code');
            var uncFile = uri_1.default.file('\\\\shäres\\path\\c#\\plugin.json');
            map.set(windowsFile, 'true');
            map.set(uncFile, 'true');
            assert.equal(map.get(windowsFile), 'true');
            assert.equal(map.get(uncFile), 'true');
        });
        test('ResourceMap - files (ignorecase)', function () {
            var map = new map_1.ResourceMap(true);
            var fileA = uri_1.default.parse('file://some/filea');
            var fileB = uri_1.default.parse('some://some/other/fileb');
            var fileAUpper = uri_1.default.parse('file://SOME/FILEA');
            map.set(fileA, 'true');
            assert.equal(map.get(fileA), 'true');
            assert.equal(map.get(fileAUpper), 'true');
            assert.ok(!map.get(fileB));
            map.set(fileAUpper, 'false');
            assert.equal(map.get(fileAUpper), 'false');
            assert.equal(map.get(fileA), 'false');
            var windowsFile = uri_1.default.file('c:\\test with %25\\c#code');
            var uncFile = uri_1.default.file('\\\\shäres\\path\\c#\\plugin.json');
            map.set(windowsFile, 'true');
            map.set(uncFile, 'true');
            assert.equal(map.get(windowsFile), 'true');
            assert.equal(map.get(uncFile), 'true');
        });
    });
});
