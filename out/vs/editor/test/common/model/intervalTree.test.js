define(["require", "exports", "assert", "vs/editor/common/model/intervalTree"], function (require, exports, assert, intervalTree_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var GENERATE_TESTS = false;
    var TEST_COUNT = GENERATE_TESTS ? 10000 : 0;
    var PRINT_TREE = false;
    var MIN_INTERVAL_START = 1;
    var MAX_INTERVAL_END = 100;
    var MIN_INSERTS = 1;
    var MAX_INSERTS = 30;
    var MIN_CHANGE_CNT = 10;
    var MAX_CHANGE_CNT = 20;
    suite('IntervalTree', function () {
        var Interval = /** @class */ (function () {
            function Interval(start, end) {
                this.start = start;
                this.end = end;
            }
            return Interval;
        }());
        var Oracle = /** @class */ (function () {
            function Oracle() {
                this.intervals = [];
            }
            Oracle.prototype.insert = function (interval) {
                this.intervals.push(interval);
                this.intervals.sort(function (a, b) {
                    if (a.start === b.start) {
                        return a.end - b.end;
                    }
                    return a.start - b.start;
                });
                return interval;
            };
            Oracle.prototype.delete = function (interval) {
                for (var i = 0, len = this.intervals.length; i < len; i++) {
                    if (this.intervals[i] === interval) {
                        this.intervals.splice(i, 1);
                        return;
                    }
                }
            };
            Oracle.prototype.search = function (interval) {
                var result = [];
                for (var i = 0, len = this.intervals.length; i < len; i++) {
                    var int = this.intervals[i];
                    if (int.start <= interval.end && int.end >= interval.start) {
                        result.push(int);
                    }
                }
                return result;
            };
            return Oracle;
        }());
        var TestState = /** @class */ (function () {
            function TestState() {
                this._oracle = new Oracle();
                this._tree = new intervalTree_1.IntervalTree();
                this._lastNodeId = -1;
                this._treeNodes = [];
                this._oracleNodes = [];
            }
            TestState.prototype.acceptOp = function (op) {
                if (op.type === 'insert') {
                    if (PRINT_TREE) {
                        console.log("insert: {" + JSON.stringify(new Interval(op.begin, op.end)) + "}");
                    }
                    var nodeId = (++this._lastNodeId);
                    this._treeNodes[nodeId] = new intervalTree_1.IntervalNode(null, op.begin, op.end);
                    this._tree.insert(this._treeNodes[nodeId]);
                    this._oracleNodes[nodeId] = this._oracle.insert(new Interval(op.begin, op.end));
                }
                else if (op.type === 'delete') {
                    if (PRINT_TREE) {
                        console.log("delete: {" + JSON.stringify(this._oracleNodes[op.id]) + "}");
                    }
                    this._tree.delete(this._treeNodes[op.id]);
                    this._oracle.delete(this._oracleNodes[op.id]);
                    this._treeNodes[op.id] = null;
                    this._oracleNodes[op.id] = null;
                }
                else if (op.type === 'change') {
                    this._tree.delete(this._treeNodes[op.id]);
                    this._treeNodes[op.id].reset(0, op.begin, op.end, null);
                    this._tree.insert(this._treeNodes[op.id]);
                    this._oracle.delete(this._oracleNodes[op.id]);
                    this._oracleNodes[op.id].start = op.begin;
                    this._oracleNodes[op.id].end = op.end;
                    this._oracle.insert(this._oracleNodes[op.id]);
                }
                else {
                    var actualNodes = this._tree.intervalSearch(op.begin, op.end, 0, false, 0);
                    var actual_1 = actualNodes.map(function (n) { return new Interval(n.cachedAbsoluteStart, n.cachedAbsoluteEnd); });
                    var expected_1 = this._oracle.search(new Interval(op.begin, op.end));
                    assert.deepEqual(actual_1, expected_1);
                    return;
                }
                if (PRINT_TREE) {
                    printTree(this._tree);
                }
                assertTreeInvariants(this._tree);
                var actual = this._tree.getAllInOrder().map(function (n) { return new Interval(n.cachedAbsoluteStart, n.cachedAbsoluteEnd); });
                var expected = this._oracle.intervals;
                assert.deepEqual(actual, expected);
            };
            TestState.prototype.getExistingNodeId = function (index) {
                var currIndex = -1;
                for (var i = 0; i < this._treeNodes.length; i++) {
                    if (this._treeNodes[i] === null) {
                        continue;
                    }
                    currIndex++;
                    if (currIndex === index) {
                        return i;
                    }
                }
                throw new Error('unexpected');
            };
            return TestState;
        }());
        function testIntervalTree(ops) {
            var state = new TestState();
            for (var i = 0; i < ops.length; i++) {
                state.acceptOp(ops[i]);
            }
        }
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        function getRandomRange(min, max) {
            var begin = getRandomInt(min, max);
            var length;
            if (getRandomInt(1, 10) <= 2) {
                // large range
                length = getRandomInt(0, max - begin);
            }
            else {
                // small range
                length = getRandomInt(0, Math.min(max - begin, 10));
            }
            return [begin, begin + length];
        }
        var AutoTest = /** @class */ (function () {
            function AutoTest() {
                this._ops = [];
                this._state = new TestState();
                this._insertCnt = getRandomInt(MIN_INSERTS, MAX_INSERTS);
                this._changeCnt = getRandomInt(MIN_CHANGE_CNT, MAX_CHANGE_CNT);
                this._deleteCnt = 0;
            }
            AutoTest.prototype._doRandomInsert = function () {
                var range = getRandomRange(MIN_INTERVAL_START, MAX_INTERVAL_END);
                this._run({
                    type: 'insert',
                    begin: range[0],
                    end: range[1]
                });
            };
            AutoTest.prototype._doRandomDelete = function () {
                var idx = getRandomInt(Math.floor(this._deleteCnt / 2), this._deleteCnt - 1);
                this._run({
                    type: 'delete',
                    id: this._state.getExistingNodeId(idx)
                });
            };
            AutoTest.prototype._doRandomChange = function () {
                var idx = getRandomInt(0, this._deleteCnt - 1);
                var range = getRandomRange(MIN_INTERVAL_START, MAX_INTERVAL_END);
                this._run({
                    type: 'change',
                    id: this._state.getExistingNodeId(idx),
                    begin: range[0],
                    end: range[1]
                });
            };
            AutoTest.prototype.run = function () {
                while (this._insertCnt > 0 || this._deleteCnt > 0 || this._changeCnt > 0) {
                    if (this._insertCnt > 0) {
                        this._doRandomInsert();
                        this._insertCnt--;
                        this._deleteCnt++;
                    }
                    else if (this._changeCnt > 0) {
                        this._doRandomChange();
                        this._changeCnt--;
                    }
                    else {
                        this._doRandomDelete();
                        this._deleteCnt--;
                    }
                    // Let's also search for something...
                    var searchRange = getRandomRange(MIN_INTERVAL_START, MAX_INTERVAL_END);
                    this._run({
                        type: 'search',
                        begin: searchRange[0],
                        end: searchRange[1]
                    });
                }
            };
            AutoTest.prototype._run = function (op) {
                this._ops.push(op);
                this._state.acceptOp(op);
            };
            AutoTest.prototype.print = function () {
                console.log("testIntervalTree(" + JSON.stringify(this._ops) + ")");
            };
            return AutoTest;
        }());
        suite('generated', function () {
            test('gen01', function () {
                testIntervalTree([
                    { type: 'insert', begin: 28, end: 35 },
                    { type: 'insert', begin: 52, end: 54 },
                    { type: 'insert', begin: 63, end: 69 }
                ]);
            });
            test('gen02', function () {
                testIntervalTree([
                    { type: 'insert', begin: 80, end: 89 },
                    { type: 'insert', begin: 92, end: 100 },
                    { type: 'insert', begin: 99, end: 99 }
                ]);
            });
            test('gen03', function () {
                testIntervalTree([
                    { type: 'insert', begin: 89, end: 96 },
                    { type: 'insert', begin: 71, end: 74 },
                    { type: 'delete', id: 1 }
                ]);
            });
            test('gen04', function () {
                testIntervalTree([
                    { type: 'insert', begin: 44, end: 46 },
                    { type: 'insert', begin: 85, end: 88 },
                    { type: 'delete', id: 0 }
                ]);
            });
            test('gen05', function () {
                testIntervalTree([
                    { type: 'insert', begin: 82, end: 90 },
                    { type: 'insert', begin: 69, end: 73 },
                    { type: 'delete', id: 0 },
                    { type: 'delete', id: 1 }
                ]);
            });
            test('gen06', function () {
                testIntervalTree([
                    { type: 'insert', begin: 41, end: 63 },
                    { type: 'insert', begin: 98, end: 98 },
                    { type: 'insert', begin: 47, end: 51 },
                    { type: 'delete', id: 2 }
                ]);
            });
            test('gen07', function () {
                testIntervalTree([
                    { type: 'insert', begin: 24, end: 26 },
                    { type: 'insert', begin: 11, end: 28 },
                    { type: 'insert', begin: 27, end: 30 },
                    { type: 'insert', begin: 80, end: 85 },
                    { type: 'delete', id: 1 }
                ]);
            });
            test('gen08', function () {
                testIntervalTree([
                    { type: 'insert', begin: 100, end: 100 },
                    { type: 'insert', begin: 100, end: 100 }
                ]);
            });
            test('gen09', function () {
                testIntervalTree([
                    { type: 'insert', begin: 58, end: 65 },
                    { type: 'insert', begin: 82, end: 96 },
                    { type: 'insert', begin: 58, end: 65 }
                ]);
            });
            test('gen10', function () {
                testIntervalTree([
                    { type: 'insert', begin: 32, end: 40 },
                    { type: 'insert', begin: 25, end: 29 },
                    { type: 'insert', begin: 24, end: 32 }
                ]);
            });
            test('gen11', function () {
                testIntervalTree([
                    { type: 'insert', begin: 25, end: 70 },
                    { type: 'insert', begin: 99, end: 100 },
                    { type: 'insert', begin: 46, end: 51 },
                    { type: 'insert', begin: 57, end: 57 },
                    { type: 'delete', id: 2 }
                ]);
            });
            test('gen12', function () {
                testIntervalTree([
                    { type: 'insert', begin: 20, end: 26 },
                    { type: 'insert', begin: 10, end: 18 },
                    { type: 'insert', begin: 99, end: 99 },
                    { type: 'insert', begin: 37, end: 59 },
                    { type: 'delete', id: 2 }
                ]);
            });
            test('gen13', function () {
                testIntervalTree([
                    { type: 'insert', begin: 3, end: 91 },
                    { type: 'insert', begin: 57, end: 57 },
                    { type: 'insert', begin: 35, end: 44 },
                    { type: 'insert', begin: 72, end: 81 },
                    { type: 'delete', id: 2 }
                ]);
            });
            test('gen14', function () {
                testIntervalTree([
                    { type: 'insert', begin: 58, end: 61 },
                    { type: 'insert', begin: 34, end: 35 },
                    { type: 'insert', begin: 56, end: 62 },
                    { type: 'insert', begin: 69, end: 78 },
                    { type: 'delete', id: 0 }
                ]);
            });
            test('gen15', function () {
                testIntervalTree([
                    { type: 'insert', begin: 63, end: 69 },
                    { type: 'insert', begin: 17, end: 24 },
                    { type: 'insert', begin: 3, end: 13 },
                    { type: 'insert', begin: 84, end: 94 },
                    { type: 'insert', begin: 18, end: 23 },
                    { type: 'insert', begin: 96, end: 98 },
                    { type: 'delete', id: 1 }
                ]);
            });
            test('gen16', function () {
                testIntervalTree([
                    { type: 'insert', begin: 27, end: 27 },
                    { type: 'insert', begin: 42, end: 87 },
                    { type: 'insert', begin: 42, end: 49 },
                    { type: 'insert', begin: 69, end: 71 },
                    { type: 'insert', begin: 20, end: 27 },
                    { type: 'insert', begin: 8, end: 9 },
                    { type: 'insert', begin: 42, end: 49 },
                    { type: 'delete', id: 1 }
                ]);
            });
            test('gen17', function () {
                testIntervalTree([
                    { type: 'insert', begin: 21, end: 23 },
                    { type: 'insert', begin: 83, end: 87 },
                    { type: 'insert', begin: 56, end: 58 },
                    { type: 'insert', begin: 1, end: 55 },
                    { type: 'insert', begin: 56, end: 59 },
                    { type: 'insert', begin: 58, end: 60 },
                    { type: 'insert', begin: 56, end: 65 },
                    { type: 'delete', id: 1 },
                    { type: 'delete', id: 0 },
                    { type: 'delete', id: 6 }
                ]);
            });
            test('gen18', function () {
                testIntervalTree([
                    { type: 'insert', begin: 25, end: 25 },
                    { type: 'insert', begin: 67, end: 79 },
                    { type: 'delete', id: 0 },
                    { type: 'search', begin: 65, end: 75 }
                ]);
            });
            test('force delta overflow', function () {
                // Search the IntervalNode ctor for FORCE_OVERFLOWING_TEST
                // to force that this test leads to a delta normalization
                testIntervalTree([
                    { type: 'insert', begin: 686081138593427, end: 733009856502260 },
                    { type: 'insert', begin: 591031326181669, end: 591031326181672 },
                    { type: 'insert', begin: 940037682731896, end: 940037682731903 },
                    { type: 'insert', begin: 598413641151120, end: 598413641151128 },
                    { type: 'insert', begin: 800564156553344, end: 800564156553351 },
                    { type: 'insert', begin: 894198957565481, end: 894198957565491 }
                ]);
            });
        });
        // TEST_COUNT = 0;
        // PRINT_TREE = true;
        for (var i = 0; i < TEST_COUNT; i++) {
            if (i % 100 === 0) {
                console.log("TEST " + (i + 1) + "/" + TEST_COUNT);
            }
            var test_1 = new AutoTest();
            try {
                test_1.run();
            }
            catch (err) {
                console.log(err);
                test_1.print();
                return;
            }
        }
        suite('searching', function () {
            function createCormenTree() {
                var r = new intervalTree_1.IntervalTree();
                var data = [
                    [16, 21],
                    [8, 9],
                    [25, 30],
                    [5, 8],
                    [15, 23],
                    [17, 19],
                    [26, 26],
                    [0, 3],
                    [6, 10],
                    [19, 20]
                ];
                data.forEach(function (int) {
                    var node = new intervalTree_1.IntervalNode(null, int[0], int[1]);
                    r.insert(node);
                });
                return r;
            }
            var T = createCormenTree();
            function assertIntervalSearch(start, end, expected) {
                var actualNodes = T.intervalSearch(start, end, 0, false, 0);
                var actual = actualNodes.map(function (n) { return [n.cachedAbsoluteStart, n.cachedAbsoluteEnd]; });
                assert.deepEqual(actual, expected);
            }
            test('cormen 1->2', function () {
                assertIntervalSearch(1, 2, [
                    [0, 3],
                ]);
            });
            test('cormen 4->8', function () {
                assertIntervalSearch(4, 8, [
                    [5, 8],
                    [6, 10],
                    [8, 9],
                ]);
            });
            test('cormen 10->15', function () {
                assertIntervalSearch(10, 15, [
                    [6, 10],
                    [15, 23],
                ]);
            });
            test('cormen 21->25', function () {
                assertIntervalSearch(21, 25, [
                    [15, 23],
                    [16, 21],
                    [25, 30],
                ]);
            });
            test('cormen 24->24', function () {
                assertIntervalSearch(24, 24, []);
            });
        });
    });
    function printTree(T) {
        if (T.root === intervalTree_1.SENTINEL) {
            console.log("~~ empty");
            return;
        }
        var out = [];
        _printTree(T, T.root, '', 0, out);
        console.log(out.join(''));
    }
    function _printTree(T, n, indent, delta, out) {
        out.push(indent + "[" + (intervalTree_1.getNodeColor(n) === 1 /* Red */ ? 'R' : 'B') + "," + n.delta + ", " + n.start + "->" + n.end + ", " + n.maxEnd + "] : {" + (delta + n.start) + "->" + (delta + n.end) + "}, maxEnd: " + (n.maxEnd + delta) + "\n");
        if (n.left !== intervalTree_1.SENTINEL) {
            _printTree(T, n.left, indent + '    ', delta, out);
        }
        else {
            out.push(indent + "    NIL\n");
        }
        if (n.right !== intervalTree_1.SENTINEL) {
            _printTree(T, n.right, indent + '    ', delta + n.delta, out);
        }
        else {
            out.push(indent + "    NIL\n");
        }
    }
    //#region Assertion
    function assertTreeInvariants(T) {
        assert(intervalTree_1.getNodeColor(intervalTree_1.SENTINEL) === 0 /* Black */);
        assert(intervalTree_1.SENTINEL.parent === intervalTree_1.SENTINEL);
        assert(intervalTree_1.SENTINEL.left === intervalTree_1.SENTINEL);
        assert(intervalTree_1.SENTINEL.right === intervalTree_1.SENTINEL);
        assert(intervalTree_1.SENTINEL.start === 0);
        assert(intervalTree_1.SENTINEL.end === 0);
        assert(intervalTree_1.SENTINEL.delta === 0);
        assert(T.root.parent === intervalTree_1.SENTINEL);
        assertValidTree(T);
    }
    function depth(n) {
        if (n === intervalTree_1.SENTINEL) {
            // The leafs are black
            return 1;
        }
        assert(depth(n.left) === depth(n.right));
        return (intervalTree_1.getNodeColor(n) === 0 /* Black */ ? 1 : 0) + depth(n.left);
    }
    function assertValidNode(n, delta) {
        if (n === intervalTree_1.SENTINEL) {
            return;
        }
        var l = n.left;
        var r = n.right;
        if (intervalTree_1.getNodeColor(n) === 1 /* Red */) {
            assert(intervalTree_1.getNodeColor(l) === 0 /* Black */);
            assert(intervalTree_1.getNodeColor(r) === 0 /* Black */);
        }
        var expectedMaxEnd = n.end;
        if (l !== intervalTree_1.SENTINEL) {
            assert(intervalTree_1.intervalCompare(l.start + delta, l.end + delta, n.start + delta, n.end + delta) <= 0);
            expectedMaxEnd = Math.max(expectedMaxEnd, l.maxEnd);
        }
        if (r !== intervalTree_1.SENTINEL) {
            assert(intervalTree_1.intervalCompare(n.start + delta, n.end + delta, r.start + delta + n.delta, r.end + delta + n.delta) <= 0);
            expectedMaxEnd = Math.max(expectedMaxEnd, r.maxEnd + n.delta);
        }
        assert(n.maxEnd === expectedMaxEnd);
        assertValidNode(l, delta);
        assertValidNode(r, delta + n.delta);
    }
    function assertValidTree(T) {
        if (T.root === intervalTree_1.SENTINEL) {
            return;
        }
        assert(intervalTree_1.getNodeColor(T.root) === 0 /* Black */);
        assert(depth(T.root.left) === depth(T.root.right));
        assertValidNode(T.root, 0);
    }
});
//#endregion
