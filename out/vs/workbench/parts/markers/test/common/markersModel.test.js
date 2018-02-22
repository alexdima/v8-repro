/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/severity", "vs/workbench/parts/markers/common/markersModel"], function (require, exports, assert, uri_1, severity_1, markersModel_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MarkersModel Test', function () {
        test('getFilteredResource return markers grouped by resource', function () {
            var marker1 = aMarker('res1');
            var marker2 = aMarker('res2');
            var marker3 = aMarker('res1');
            var marker4 = aMarker('res3');
            var marker5 = aMarker('res4');
            var marker6 = aMarker('res2');
            var testObject = new markersModel_1.MarkersModel([marker1, marker2, marker3, marker4, marker5, marker6]);
            var actuals = testObject.filteredResources;
            assert.equal(4, actuals.length);
            assert.ok(compareResource(actuals[0], 'res1'));
            assert.equal(2, actuals[0].markers.length);
            assert.ok(hasMarker(actuals[0].markers, marker1));
            assert.ok(hasMarker(actuals[0].markers, marker3));
            assert.ok(compareResource(actuals[1], 'res2'));
            assert.equal(2, actuals[1].markers.length);
            assert.ok(hasMarker(actuals[1].markers, marker2));
            assert.ok(hasMarker(actuals[1].markers, marker6));
            assert.ok(compareResource(actuals[2], 'res3'));
            assert.equal(1, actuals[2].markers.length);
            assert.ok(hasMarker(actuals[2].markers, marker4));
            assert.ok(compareResource(actuals[3], 'res4'));
            assert.equal(1, actuals[3].markers.length);
            assert.ok(hasMarker(actuals[3].markers, marker5));
        });
        test('sort palces resources with no errors at the end', function () {
            var marker1 = aMarker('a/res1', severity_1.default.Warning);
            var marker2 = aMarker('a/res2');
            var marker3 = aMarker('res4');
            var marker4 = aMarker('b/res3');
            var marker5 = aMarker('res4');
            var marker6 = aMarker('c/res2', severity_1.default.Info);
            var testObject = new markersModel_1.MarkersModel([marker1, marker2, marker3, marker4, marker5, marker6]);
            var actuals = testObject.filteredResources.sort(markersModel_1.MarkersModel.compare);
            assert.equal(5, actuals.length);
            assert.ok(compareResource(actuals[0], 'a/res2'));
            assert.ok(compareResource(actuals[1], 'b/res3'));
            assert.ok(compareResource(actuals[2], 'res4'));
            assert.ok(compareResource(actuals[3], 'a/res1'));
            assert.ok(compareResource(actuals[4], 'c/res2'));
        });
        test('sort resources by file path', function () {
            var marker1 = aMarker('a/res1');
            var marker2 = aMarker('a/res2');
            var marker3 = aMarker('res4');
            var marker4 = aMarker('b/res3');
            var marker5 = aMarker('res4');
            var marker6 = aMarker('c/res2');
            var testObject = new markersModel_1.MarkersModel([marker1, marker2, marker3, marker4, marker5, marker6]);
            var actuals = testObject.filteredResources.sort(markersModel_1.MarkersModel.compare);
            assert.equal(5, actuals.length);
            assert.ok(compareResource(actuals[0], 'a/res1'));
            assert.ok(compareResource(actuals[1], 'a/res2'));
            assert.ok(compareResource(actuals[2], 'b/res3'));
            assert.ok(compareResource(actuals[3], 'c/res2'));
            assert.ok(compareResource(actuals[4], 'res4'));
        });
        test('sort markers by severity, line and column', function () {
            var marker1 = aWarningWithRange(8, 1, 9, 3);
            var marker2 = aWarningWithRange(3);
            var marker3 = anErrorWithRange(8, 1, 9, 3);
            var marker4 = anIgnoreWithRange(5);
            var marker5 = anInfoWithRange(8, 1, 8, 4, 'ab');
            var marker6 = anErrorWithRange(3);
            var marker7 = anErrorWithRange(5);
            var marker8 = anInfoWithRange(5);
            var marker9 = anErrorWithRange(8, 1, 8, 4, 'ab');
            var marker10 = anErrorWithRange(10);
            var marker11 = anErrorWithRange(8, 1, 8, 4, 'ba');
            var marker12 = anIgnoreWithRange(3);
            var marker13 = aWarningWithRange(5);
            var marker14 = anErrorWithRange(4);
            var marker15 = anErrorWithRange(8, 2, 8, 4);
            var testObject = new markersModel_1.MarkersModel([marker1, marker2, marker3, marker4, marker5, marker6, marker7, marker8, marker9, marker10, marker11, marker12, marker13, marker14, marker15]);
            var actuals = testObject.filteredResources[0].markers.sort(markersModel_1.MarkersModel.compare);
            assert.equal(actuals[0].marker, marker6);
            assert.equal(actuals[1].marker, marker14);
            assert.equal(actuals[2].marker, marker7);
            assert.equal(actuals[3].marker, marker9);
            assert.equal(actuals[4].marker, marker11);
            assert.equal(actuals[5].marker, marker3);
            assert.equal(actuals[6].marker, marker15);
            assert.equal(actuals[7].marker, marker10);
            assert.equal(actuals[8].marker, marker2);
            assert.equal(actuals[9].marker, marker13);
            assert.equal(actuals[10].marker, marker1);
            assert.equal(actuals[11].marker, marker8);
            assert.equal(actuals[12].marker, marker5);
            assert.equal(actuals[13].marker, marker12);
            assert.equal(actuals[14].marker, marker4);
        });
        test('toString()', function () {
            var res1Marker = aMarker('a/res1');
            res1Marker.code = '1234';
            assert.equal("file: 'file:///a/res1'\nseverity: 'Error'\nmessage: 'some message'\nat: '10,5'\nsource: 'tslint'\ncode: '1234'", new markersModel_1.Marker('', res1Marker).toString());
            assert.equal("file: 'file:///a/res2'\nseverity: 'Warning'\nmessage: 'some message'\nat: '10,5'\nsource: 'tslint'\ncode: ''", new markersModel_1.Marker('', aMarker('a/res2', severity_1.default.Warning)).toString());
            assert.equal("file: 'file:///a/res2'\nseverity: 'Info'\nmessage: 'Info'\nat: '1,2'\nsource: ''\ncode: ''", new markersModel_1.Marker('', aMarker('a/res2', severity_1.default.Info, 1, 2, 1, 8, 'Info', '')).toString());
            assert.equal("file: 'file:///a/res2'\nseverity: ''\nmessage: 'Ignore message'\nat: '1,2'\nsource: 'Ignore'\ncode: ''", new markersModel_1.Marker('', aMarker('a/res2', severity_1.default.Ignore, 1, 2, 1, 8, 'Ignore message', 'Ignore')).toString());
        });
        function hasMarker(markers, marker) {
            return markers.filter(function (m) {
                return m.marker === marker;
            }).length === 1;
        }
        function compareResource(a, b) {
            return a.uri.toString() === uri_1.default.file(b).toString();
        }
        function anErrorWithRange(startLineNumber, startColumn, endLineNumber, endColumn, message) {
            if (startLineNumber === void 0) { startLineNumber = 10; }
            if (startColumn === void 0) { startColumn = 5; }
            if (endLineNumber === void 0) { endLineNumber = startLineNumber + 1; }
            if (endColumn === void 0) { endColumn = startColumn + 5; }
            if (message === void 0) { message = 'some message'; }
            return aMarker('some resource', severity_1.default.Error, startLineNumber, startColumn, endLineNumber, endColumn, message);
        }
        function aWarningWithRange(startLineNumber, startColumn, endLineNumber, endColumn, message) {
            if (startLineNumber === void 0) { startLineNumber = 10; }
            if (startColumn === void 0) { startColumn = 5; }
            if (endLineNumber === void 0) { endLineNumber = startLineNumber + 1; }
            if (endColumn === void 0) { endColumn = startColumn + 5; }
            if (message === void 0) { message = 'some message'; }
            return aMarker('some resource', severity_1.default.Warning, startLineNumber, startColumn, endLineNumber, endColumn, message);
        }
        function anInfoWithRange(startLineNumber, startColumn, endLineNumber, endColumn, message) {
            if (startLineNumber === void 0) { startLineNumber = 10; }
            if (startColumn === void 0) { startColumn = 5; }
            if (endLineNumber === void 0) { endLineNumber = startLineNumber + 1; }
            if (endColumn === void 0) { endColumn = startColumn + 5; }
            if (message === void 0) { message = 'some message'; }
            return aMarker('some resource', severity_1.default.Info, startLineNumber, startColumn, endLineNumber, endColumn, message);
        }
        function anIgnoreWithRange(startLineNumber, startColumn, endLineNumber, endColumn, message) {
            if (startLineNumber === void 0) { startLineNumber = 10; }
            if (startColumn === void 0) { startColumn = 5; }
            if (endLineNumber === void 0) { endLineNumber = startLineNumber + 1; }
            if (endColumn === void 0) { endColumn = startColumn + 5; }
            if (message === void 0) { message = 'some message'; }
            return aMarker('some resource', severity_1.default.Ignore, startLineNumber, startColumn, endLineNumber, endColumn, message);
        }
        function aMarker(resource, severity, startLineNumber, startColumn, endLineNumber, endColumn, message, source) {
            if (resource === void 0) { resource = 'some resource'; }
            if (severity === void 0) { severity = severity_1.default.Error; }
            if (startLineNumber === void 0) { startLineNumber = 10; }
            if (startColumn === void 0) { startColumn = 5; }
            if (endLineNumber === void 0) { endLineNumber = startLineNumber + 1; }
            if (endColumn === void 0) { endColumn = startColumn + 5; }
            if (message === void 0) { message = 'some message'; }
            if (source === void 0) { source = 'tslint'; }
            return {
                owner: 'someOwner',
                resource: uri_1.default.file(resource),
                severity: severity,
                message: message,
                startLineNumber: startLineNumber,
                startColumn: startColumn,
                endLineNumber: endLineNumber,
                endColumn: endColumn,
                source: source
            };
        }
    });
});
