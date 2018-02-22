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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/severity", "vs/workbench/api/node/extHostDiagnostics", "vs/workbench/api/node/extHostTypes", "vs/workbench/test/electron-browser/api/mock"], function (require, exports, assert, uri_1, severity_1, extHostDiagnostics_1, extHostTypes_1, mock_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDiagnostics', function () {
        var DiagnosticsShape = /** @class */ (function (_super) {
            __extends(DiagnosticsShape, _super);
            function DiagnosticsShape() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DiagnosticsShape.prototype.$changeMany = function (owner, entries) {
                //
            };
            DiagnosticsShape.prototype.$clear = function (owner) {
                //
            };
            return DiagnosticsShape;
        }(mock_1.mock()));
        test('disposeCheck', function () {
            var collection = new extHostDiagnostics_1.DiagnosticCollection('test', new DiagnosticsShape());
            collection.dispose();
            collection.dispose(); // that's OK
            assert.throws(function () { return collection.name; });
            assert.throws(function () { return collection.clear(); });
            assert.throws(function () { return collection.delete(uri_1.default.parse('aa:bb')); });
            // tslint:disable-next-line:semicolon
            assert.throws(function () { return collection.forEach(function () { ; }); });
            assert.throws(function () { return collection.get(uri_1.default.parse('aa:bb')); });
            assert.throws(function () { return collection.has(uri_1.default.parse('aa:bb')); });
            assert.throws(function () { return collection.set(uri_1.default.parse('aa:bb'), []); });
            assert.throws(function () { return collection.set(uri_1.default.parse('aa:bb'), undefined); });
        });
        test('diagnostic collection, forEach, clear, has', function () {
            var collection = new extHostDiagnostics_1.DiagnosticCollection('test', new DiagnosticsShape());
            assert.equal(collection.name, 'test');
            collection.dispose();
            assert.throws(function () { return collection.name; });
            var c = 0;
            collection = new extHostDiagnostics_1.DiagnosticCollection('test', new DiagnosticsShape());
            collection.forEach(function () { return c++; });
            assert.equal(c, 0);
            collection.set(uri_1.default.parse('foo:bar'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            collection.forEach(function () { return c++; });
            assert.equal(c, 1);
            c = 0;
            collection.clear();
            collection.forEach(function () { return c++; });
            assert.equal(c, 0);
            collection.set(uri_1.default.parse('foo:bar1'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            collection.set(uri_1.default.parse('foo:bar2'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            collection.forEach(function () { return c++; });
            assert.equal(c, 2);
            assert.ok(collection.has(uri_1.default.parse('foo:bar1')));
            assert.ok(collection.has(uri_1.default.parse('foo:bar2')));
            assert.ok(!collection.has(uri_1.default.parse('foo:bar3')));
            collection.delete(uri_1.default.parse('foo:bar1'));
            assert.ok(!collection.has(uri_1.default.parse('foo:bar1')));
            collection.dispose();
        });
        test('diagnostic collection, immutable read', function () {
            var collection = new extHostDiagnostics_1.DiagnosticCollection('test', new DiagnosticsShape());
            collection.set(uri_1.default.parse('foo:bar'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            var array = collection.get(uri_1.default.parse('foo:bar'));
            assert.throws(function () { return array.length = 0; });
            assert.throws(function () { return array.pop(); });
            assert.throws(function () { return array[0] = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 0), 'evil'); });
            collection.forEach(function (uri, array) {
                assert.throws(function () { return array.length = 0; });
                assert.throws(function () { return array.pop(); });
                assert.throws(function () { return array[0] = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 0), 'evil'); });
            });
            array = collection.get(uri_1.default.parse('foo:bar'));
            assert.equal(array.length, 2);
            collection.dispose();
        });
        test('diagnostics collection, set with dupliclated tuples', function () {
            var collection = new extHostDiagnostics_1.DiagnosticCollection('test', new DiagnosticsShape());
            var uri = uri_1.default.parse('sc:hightower');
            collection.set([
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-1')]],
                [uri_1.default.parse('some:thing'), [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'something')]],
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-2')]],
            ]);
            var array = collection.get(uri);
            assert.equal(array.length, 2);
            var first = array[0], second = array[1];
            assert.equal(first.message, 'message-1');
            assert.equal(second.message, 'message-2');
            // clear
            collection.delete(uri);
            assert.ok(!collection.has(uri));
            // bad tuple clears 1/2
            collection.set([
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-1')]],
                [uri_1.default.parse('some:thing'), [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'something')]],
                [uri, undefined]
            ]);
            assert.ok(!collection.has(uri));
            // clear
            collection.delete(uri);
            assert.ok(!collection.has(uri));
            // bad tuple clears 2/2
            collection.set([
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-1')]],
                [uri_1.default.parse('some:thing'), [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'something')]],
                [uri, undefined],
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-2')]],
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-3')]],
            ]);
            array = collection.get(uri);
            assert.equal(array.length, 2);
            first = array[0], second = array[1];
            assert.equal(first.message, 'message-2');
            assert.equal(second.message, 'message-3');
            collection.dispose();
        });
        test('diagnostics collection, set tuple overrides, #11547', function () {
            var lastEntries;
            var collection = new extHostDiagnostics_1.DiagnosticCollection('test', new /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_1.prototype.$changeMany = function (owner, entries) {
                    lastEntries = entries;
                    return _super.prototype.$changeMany.call(this, owner, entries);
                };
                return class_1;
            }(DiagnosticsShape)));
            var uri = uri_1.default.parse('sc:hightower');
            collection.set([[uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'error')]]]);
            assert.equal(collection.get(uri).length, 1);
            assert.equal(collection.get(uri)[0].message, 'error');
            assert.equal(lastEntries.length, 1);
            var _a = lastEntries[0], data1 = _a[1];
            assert.equal(data1.length, 1);
            assert.equal(data1[0].message, 'error');
            lastEntries = undefined;
            collection.set([[uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'warning')]]]);
            assert.equal(collection.get(uri).length, 1);
            assert.equal(collection.get(uri)[0].message, 'warning');
            assert.equal(lastEntries.length, 1);
            var _b = lastEntries[0], data2 = _b[1];
            assert.equal(data2.length, 1);
            assert.equal(data2[0].message, 'warning');
            lastEntries = undefined;
        });
        test('diagnostics collection, tuples and undefined (small array), #15585', function () {
            var collection = new extHostDiagnostics_1.DiagnosticCollection('test', new DiagnosticsShape());
            var uri = uri_1.default.parse('sc:hightower');
            var uri2 = uri_1.default.parse('sc:nomad');
            var diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'ffff');
            collection.set([
                [uri, [diag, diag, diag]],
                [uri, undefined],
                [uri, [diag]],
                [uri2, [diag, diag]],
                [uri2, undefined],
                [uri2, [diag]],
            ]);
            assert.equal(collection.get(uri).length, 1);
            assert.equal(collection.get(uri2).length, 1);
        });
        test('diagnostics collection, tuples and undefined (large array), #15585', function () {
            var collection = new extHostDiagnostics_1.DiagnosticCollection('test', new DiagnosticsShape());
            var tuples = [];
            for (var i = 0; i < 500; i++) {
                var uri = uri_1.default.parse('sc:hightower#' + i);
                var diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), i.toString());
                tuples.push([uri, [diag, diag, diag]]);
                tuples.push([uri, undefined]);
                tuples.push([uri, [diag]]);
            }
            collection.set(tuples);
            for (var i = 0; i < 500; i++) {
                var uri = uri_1.default.parse('sc:hightower#' + i);
                assert.equal(collection.has(uri), true);
                assert.equal(collection.get(uri).length, 1);
            }
        });
        test('diagnostic capping', function () {
            var lastEntries;
            var collection = new extHostDiagnostics_1.DiagnosticCollection('test', new /** @class */ (function (_super) {
                __extends(class_2, _super);
                function class_2() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_2.prototype.$changeMany = function (owner, entries) {
                    lastEntries = entries;
                    return _super.prototype.$changeMany.call(this, owner, entries);
                };
                return class_2;
            }(DiagnosticsShape)));
            var uri = uri_1.default.parse('aa:bb');
            var diagnostics = [];
            for (var i = 0; i < 500; i++) {
                diagnostics.push(new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(i, 0, i + 1, 0), "error#" + i, i < 300
                    ? extHostTypes_1.DiagnosticSeverity.Warning
                    : extHostTypes_1.DiagnosticSeverity.Error));
            }
            collection.set(uri, diagnostics);
            assert.equal(collection.get(uri).length, 500);
            assert.equal(lastEntries.length, 1);
            assert.equal(lastEntries[0][1].length, 251);
            assert.equal(lastEntries[0][1][0].severity, severity_1.default.Error);
            assert.equal(lastEntries[0][1][200].severity, severity_1.default.Warning);
            assert.equal(lastEntries[0][1][250].severity, severity_1.default.Error);
        });
    });
});
