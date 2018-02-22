var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/winjs.base"], function (require, exports, assert, event_1, Errors, winjs_base_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    var Samples;
    (function (Samples) {
        var EventCounter = /** @class */ (function () {
            function EventCounter() {
                this.count = 0;
            }
            EventCounter.prototype.reset = function () {
                this.count = 0;
            };
            EventCounter.prototype.onEvent = function () {
                this.count += 1;
            };
            return EventCounter;
        }());
        Samples.EventCounter = EventCounter;
        var Document3 = /** @class */ (function () {
            function Document3() {
                this._onDidChange = new event_1.Emitter();
                this.onDidChange = this._onDidChange.event;
            }
            Document3.prototype.setText = function (value) {
                //...
                this._onDidChange.fire(value);
            };
            return Document3;
        }());
        Samples.Document3 = Document3;
    })(Samples || (Samples = {}));
    suite('Event', function () {
        var counter = new Samples.EventCounter();
        setup(function () { return counter.reset(); });
        test('Emitter plain', function () {
            var doc = new Samples.Document3();
            document.createElement('div').onclick = function () { };
            var subscription = doc.onDidChange(counter.onEvent, counter);
            doc.setText('far');
            doc.setText('boo');
            // unhook listener
            subscription.dispose();
            doc.setText('boo');
            assert.equal(counter.count, 2);
        });
        test('Emitter, bucket', function () {
            var bucket = [];
            var doc = new Samples.Document3();
            var subscription = doc.onDidChange(counter.onEvent, counter, bucket);
            doc.setText('far');
            doc.setText('boo');
            // unhook listener
            while (bucket.length) {
                bucket.pop().dispose();
            }
            // noop
            subscription.dispose();
            doc.setText('boo');
            assert.equal(counter.count, 2);
        });
        test('onFirstAdd|onLastRemove', function () {
            var firstCount = 0;
            var lastCount = 0;
            var a = new event_1.Emitter({
                onFirstListenerAdd: function () { firstCount += 1; },
                onLastListenerRemove: function () { lastCount += 1; }
            });
            assert.equal(firstCount, 0);
            assert.equal(lastCount, 0);
            var subscription = a.event(function () { });
            assert.equal(firstCount, 1);
            assert.equal(lastCount, 0);
            subscription.dispose();
            assert.equal(firstCount, 1);
            assert.equal(lastCount, 1);
            subscription = a.event(function () { });
            assert.equal(firstCount, 2);
            assert.equal(lastCount, 1);
        });
        test('throwingListener', function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { return null; });
            try {
                var a = new event_1.Emitter();
                var hit_1 = false;
                a.event(function () {
                    throw 9;
                });
                a.event(function () {
                    hit_1 = true;
                });
                a.fire(undefined);
                assert.equal(hit_1, true);
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        });
        test('reusing event function and context', function () {
            var counter = 0;
            function listener() {
                counter += 1;
            }
            var context = {};
            var emitter = new event_1.Emitter();
            var reg1 = emitter.event(listener, context);
            var reg2 = emitter.event(listener, context);
            emitter.fire();
            assert.equal(counter, 2);
            reg1.dispose();
            emitter.fire();
            assert.equal(counter, 3);
            reg2.dispose();
            emitter.fire();
            assert.equal(counter, 3);
        });
        test('Debounce Event', function (done) {
            var doc = new Samples.Document3();
            var onDocDidChange = event_1.debounceEvent(doc.onDidChange, function (prev, cur) {
                if (!prev) {
                    prev = [cur];
                }
                else if (prev.indexOf(cur) < 0) {
                    prev.push(cur);
                }
                return prev;
            }, 10);
            var count = 0;
            onDocDidChange(function (keys) {
                count++;
                assert.ok(keys, 'was not expecting keys.');
                if (count === 1) {
                    doc.setText('4');
                    assert.deepEqual(keys, ['1', '2', '3']);
                }
                else if (count === 2) {
                    assert.deepEqual(keys, ['4']);
                    done();
                }
            });
            doc.setText('1');
            doc.setText('2');
            doc.setText('3');
        });
        test('Debounce Event - leading', function (done) {
            var emitter = new event_1.Emitter();
            var debounced = event_1.debounceEvent(emitter.event, function (l, e) { return e; }, 0, /*leading=*/ true);
            var calls = 0;
            debounced(function () {
                calls++;
            });
            // If the source event is fired once, the debounced (on the leading edge) event should be fired only once
            emitter.fire();
            setTimeout(function () {
                assert.equal(calls, 1);
                done();
            });
        });
        test('Debounce Event - leading', function (done) {
            var emitter = new event_1.Emitter();
            var debounced = event_1.debounceEvent(emitter.event, function (l, e) { return e; }, 0, /*leading=*/ true);
            var calls = 0;
            debounced(function () {
                calls++;
            });
            // If the source event is fired multiple times, the debounced (on the leading edge) event should be fired twice
            emitter.fire();
            emitter.fire();
            emitter.fire();
            setTimeout(function () {
                assert.equal(calls, 2);
                done();
            });
        });
        test('Emitter - In Order Delivery', function () {
            var a = new event_1.Emitter();
            var listener2Events = [];
            a.event(function listener1(event) {
                if (event === 'e1') {
                    a.fire('e2');
                    // assert that all events are delivered at this point
                    assert.deepEqual(listener2Events, ['e1', 'e2']);
                }
            });
            a.event(function listener2(event) {
                listener2Events.push(event);
            });
            a.fire('e1');
            // assert that all events are delivered in order
            assert.deepEqual(listener2Events, ['e1', 'e2']);
        });
    });
    suite('Event utils', function () {
        suite('EventBufferer', function () {
            test('should not buffer when not wrapped', function () {
                var bufferer = new event_1.EventBufferer();
                var counter = new Samples.EventCounter();
                var emitter = new event_1.Emitter();
                var event = bufferer.wrapEvent(emitter.event);
                var listener = event(counter.onEvent, counter);
                assert.equal(counter.count, 0);
                emitter.fire();
                assert.equal(counter.count, 1);
                emitter.fire();
                assert.equal(counter.count, 2);
                emitter.fire();
                assert.equal(counter.count, 3);
                listener.dispose();
            });
            test('should buffer when wrapped', function () {
                var bufferer = new event_1.EventBufferer();
                var counter = new Samples.EventCounter();
                var emitter = new event_1.Emitter();
                var event = bufferer.wrapEvent(emitter.event);
                var listener = event(counter.onEvent, counter);
                assert.equal(counter.count, 0);
                emitter.fire();
                assert.equal(counter.count, 1);
                bufferer.bufferEvents(function () {
                    emitter.fire();
                    assert.equal(counter.count, 1);
                    emitter.fire();
                    assert.equal(counter.count, 1);
                });
                assert.equal(counter.count, 3);
                emitter.fire();
                assert.equal(counter.count, 4);
                listener.dispose();
            });
            test('once', function () {
                var emitter = new event_1.Emitter();
                var counter1 = 0, counter2 = 0, counter3 = 0;
                var listener1 = emitter.event(function () { return counter1++; });
                var listener2 = event_1.once(emitter.event)(function () { return counter2++; });
                var listener3 = event_1.once(emitter.event)(function () { return counter3++; });
                assert.equal(counter1, 0);
                assert.equal(counter2, 0);
                assert.equal(counter3, 0);
                listener3.dispose();
                emitter.fire();
                assert.equal(counter1, 1);
                assert.equal(counter2, 1);
                assert.equal(counter3, 0);
                emitter.fire();
                assert.equal(counter1, 2);
                assert.equal(counter2, 1);
                assert.equal(counter3, 0);
                listener1.dispose();
                listener2.dispose();
            });
        });
        suite('fromPromise', function () {
            test('should emit when done', function () {
                var count = 0;
                var event = event_1.fromPromise(winjs_base_1.TPromise.as(null));
                event(function () { return count++; });
                assert.equal(count, 0);
                return winjs_base_1.TPromise.timeout(10).then(function () {
                    assert.equal(count, 1);
                });
            });
            test('should emit when done - setTimeout', function () { return __awaiter(_this, void 0, void 0, function () {
                var count, promise, event;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            count = 0;
                            promise = winjs_base_1.TPromise.timeout(5);
                            event = event_1.fromPromise(promise);
                            event(function () { return count++; });
                            assert.equal(count, 0);
                            return [4 /*yield*/, promise];
                        case 1:
                            _a.sent();
                            assert.equal(count, 1);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        suite('stopwatch', function () {
            test('should emit', function () {
                var emitter = new event_1.Emitter();
                var event = event_1.stopwatch(emitter.event);
                return new winjs_base_1.TPromise(function (c, e) {
                    event(function (duration) {
                        try {
                            assert(duration > 0);
                        }
                        catch (err) {
                            e(err);
                        }
                        c(null);
                    });
                    setTimeout(function () { return emitter.fire(); }, 10);
                });
            });
        });
        suite('buffer', function () {
            test('should buffer events', function () {
                var result = [];
                var emitter = new event_1.Emitter();
                var event = emitter.event;
                var bufferedEvent = event_1.buffer(event);
                emitter.fire(1);
                emitter.fire(2);
                emitter.fire(3);
                assert.deepEqual(result, []);
                var listener = bufferedEvent(function (num) { return result.push(num); });
                assert.deepEqual(result, [1, 2, 3]);
                emitter.fire(4);
                assert.deepEqual(result, [1, 2, 3, 4]);
                listener.dispose();
                emitter.fire(5);
                assert.deepEqual(result, [1, 2, 3, 4]);
            });
            test('should buffer events on next tick', function () {
                var result = [];
                var emitter = new event_1.Emitter();
                var event = emitter.event;
                var bufferedEvent = event_1.buffer(event, true);
                emitter.fire(1);
                emitter.fire(2);
                emitter.fire(3);
                assert.deepEqual(result, []);
                var listener = bufferedEvent(function (num) { return result.push(num); });
                assert.deepEqual(result, []);
                return winjs_base_1.TPromise.timeout(10).then(function () {
                    emitter.fire(4);
                    assert.deepEqual(result, [1, 2, 3, 4]);
                    listener.dispose();
                    emitter.fire(5);
                    assert.deepEqual(result, [1, 2, 3, 4]);
                });
            });
            test('should fire initial buffer events', function () {
                var result = [];
                var emitter = new event_1.Emitter();
                var event = emitter.event;
                var bufferedEvent = event_1.buffer(event, false, [-2, -1, 0]);
                emitter.fire(1);
                emitter.fire(2);
                emitter.fire(3);
                assert.deepEqual(result, []);
                bufferedEvent(function (num) { return result.push(num); });
                assert.deepEqual(result, [-2, -1, 0, 1, 2, 3]);
            });
        });
        suite('echo', function () {
            test('should echo events', function () {
                var result = [];
                var emitter = new event_1.Emitter();
                var event = emitter.event;
                var echoEvent = event_1.echo(event);
                emitter.fire(1);
                emitter.fire(2);
                emitter.fire(3);
                assert.deepEqual(result, []);
                var listener = echoEvent(function (num) { return result.push(num); });
                assert.deepEqual(result, [1, 2, 3]);
                emitter.fire(4);
                assert.deepEqual(result, [1, 2, 3, 4]);
                listener.dispose();
                emitter.fire(5);
                assert.deepEqual(result, [1, 2, 3, 4]);
            });
            test('should echo events for every listener', function () {
                var result1 = [];
                var result2 = [];
                var emitter = new event_1.Emitter();
                var event = emitter.event;
                var echoEvent = event_1.echo(event);
                emitter.fire(1);
                emitter.fire(2);
                emitter.fire(3);
                assert.deepEqual(result1, []);
                assert.deepEqual(result2, []);
                var listener1 = echoEvent(function (num) { return result1.push(num); });
                assert.deepEqual(result1, [1, 2, 3]);
                assert.deepEqual(result2, []);
                emitter.fire(4);
                assert.deepEqual(result1, [1, 2, 3, 4]);
                assert.deepEqual(result2, []);
                var listener2 = echoEvent(function (num) { return result2.push(num); });
                assert.deepEqual(result1, [1, 2, 3, 4]);
                assert.deepEqual(result2, [1, 2, 3, 4]);
                emitter.fire(5);
                assert.deepEqual(result1, [1, 2, 3, 4, 5]);
                assert.deepEqual(result2, [1, 2, 3, 4, 5]);
                listener1.dispose();
                listener2.dispose();
                emitter.fire(6);
                assert.deepEqual(result1, [1, 2, 3, 4, 5]);
                assert.deepEqual(result2, [1, 2, 3, 4, 5]);
            });
        });
        suite('EventMultiplexer', function () {
            test('works', function () {
                var result = [];
                var m = new event_1.EventMultiplexer();
                m.event(function (r) { return result.push(r); });
                var e1 = new event_1.Emitter();
                m.add(e1.event);
                assert.deepEqual(result, []);
                e1.fire(0);
                assert.deepEqual(result, [0]);
            });
            test('multiplexer dispose works', function () {
                var result = [];
                var m = new event_1.EventMultiplexer();
                m.event(function (r) { return result.push(r); });
                var e1 = new event_1.Emitter();
                m.add(e1.event);
                assert.deepEqual(result, []);
                e1.fire(0);
                assert.deepEqual(result, [0]);
                m.dispose();
                assert.deepEqual(result, [0]);
                e1.fire(0);
                assert.deepEqual(result, [0]);
            });
            test('event dispose works', function () {
                var result = [];
                var m = new event_1.EventMultiplexer();
                m.event(function (r) { return result.push(r); });
                var e1 = new event_1.Emitter();
                m.add(e1.event);
                assert.deepEqual(result, []);
                e1.fire(0);
                assert.deepEqual(result, [0]);
                e1.dispose();
                assert.deepEqual(result, [0]);
                e1.fire(0);
                assert.deepEqual(result, [0]);
            });
            test('mutliplexer event dispose works', function () {
                var result = [];
                var m = new event_1.EventMultiplexer();
                m.event(function (r) { return result.push(r); });
                var e1 = new event_1.Emitter();
                var l1 = m.add(e1.event);
                assert.deepEqual(result, []);
                e1.fire(0);
                assert.deepEqual(result, [0]);
                l1.dispose();
                assert.deepEqual(result, [0]);
                e1.fire(0);
                assert.deepEqual(result, [0]);
            });
            test('hot start works', function () {
                var result = [];
                var m = new event_1.EventMultiplexer();
                m.event(function (r) { return result.push(r); });
                var e1 = new event_1.Emitter();
                m.add(e1.event);
                var e2 = new event_1.Emitter();
                m.add(e2.event);
                var e3 = new event_1.Emitter();
                m.add(e3.event);
                e1.fire(1);
                e2.fire(2);
                e3.fire(3);
                assert.deepEqual(result, [1, 2, 3]);
            });
            test('cold start works', function () {
                var result = [];
                var m = new event_1.EventMultiplexer();
                var e1 = new event_1.Emitter();
                m.add(e1.event);
                var e2 = new event_1.Emitter();
                m.add(e2.event);
                var e3 = new event_1.Emitter();
                m.add(e3.event);
                m.event(function (r) { return result.push(r); });
                e1.fire(1);
                e2.fire(2);
                e3.fire(3);
                assert.deepEqual(result, [1, 2, 3]);
            });
            test('late add works', function () {
                var result = [];
                var m = new event_1.EventMultiplexer();
                var e1 = new event_1.Emitter();
                m.add(e1.event);
                var e2 = new event_1.Emitter();
                m.add(e2.event);
                m.event(function (r) { return result.push(r); });
                e1.fire(1);
                e2.fire(2);
                var e3 = new event_1.Emitter();
                m.add(e3.event);
                e3.fire(3);
                assert.deepEqual(result, [1, 2, 3]);
            });
            test('add dispose works', function () {
                var result = [];
                var m = new event_1.EventMultiplexer();
                var e1 = new event_1.Emitter();
                m.add(e1.event);
                var e2 = new event_1.Emitter();
                m.add(e2.event);
                m.event(function (r) { return result.push(r); });
                e1.fire(1);
                e2.fire(2);
                var e3 = new event_1.Emitter();
                var l3 = m.add(e3.event);
                e3.fire(3);
                assert.deepEqual(result, [1, 2, 3]);
                l3.dispose();
                e3.fire(4);
                assert.deepEqual(result, [1, 2, 3]);
                e2.fire(4);
                e1.fire(5);
                assert.deepEqual(result, [1, 2, 3, 4, 5]);
            });
        });
    });
});
