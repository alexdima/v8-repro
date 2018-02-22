define(["require", "exports", "vs/platform/markers/common/problemMatcher", "assert", "vs/base/common/parsers"], function (require, exports, matchers, assert, parsers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProblemReporter = /** @class */ (function () {
        function ProblemReporter() {
            this._validationStatus = new parsers_1.ValidationStatus();
            this._messages = [];
        }
        ProblemReporter.prototype.info = function (message) {
            this._messages.push(message);
            this._validationStatus.state = parsers_1.ValidationState.Info;
        };
        ProblemReporter.prototype.warn = function (message) {
            this._messages.push(message);
            this._validationStatus.state = parsers_1.ValidationState.Warning;
        };
        ProblemReporter.prototype.error = function (message) {
            this._messages.push(message);
            this._validationStatus.state = parsers_1.ValidationState.Error;
        };
        ProblemReporter.prototype.fatal = function (message) {
            this._messages.push(message);
            this._validationStatus.state = parsers_1.ValidationState.Fatal;
        };
        ProblemReporter.prototype.hasMessage = function (message) {
            return this._messages.indexOf(message) !== null;
        };
        Object.defineProperty(ProblemReporter.prototype, "messages", {
            get: function () {
                return this._messages;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProblemReporter.prototype, "state", {
            get: function () {
                return this._validationStatus.state;
            },
            enumerable: true,
            configurable: true
        });
        ProblemReporter.prototype.isOK = function () {
            return this._validationStatus.isOK();
        };
        Object.defineProperty(ProblemReporter.prototype, "status", {
            get: function () {
                return this._validationStatus;
            },
            enumerable: true,
            configurable: true
        });
        return ProblemReporter;
    }());
    suite('ProblemPatternParser', function () {
        var reporter;
        var parser;
        var testRegexp = new RegExp('test');
        setup(function () {
            reporter = new ProblemReporter();
            parser = new matchers.ProblemPatternParser(reporter);
        });
        suite('single-pattern definitions', function () {
            test('parses a pattern defined by only a regexp', function () {
                var problemPattern = {
                    regexp: 'test'
                };
                var parsed = parser.parse(problemPattern);
                assert(reporter.isOK());
                assert.deepEqual(parsed, {
                    regexp: testRegexp,
                    kind: matchers.ProblemLocationKind.Location,
                    file: 1,
                    line: 2,
                    character: 3,
                    message: 0
                });
            });
            test('does not sets defaults for line and character if kind is File', function () {
                var problemPattern = {
                    regexp: 'test',
                    kind: 'file'
                };
                var parsed = parser.parse(problemPattern);
                assert.deepEqual(parsed, {
                    regexp: testRegexp,
                    kind: matchers.ProblemLocationKind.File,
                    file: 1,
                    message: 0
                });
            });
        });
        suite('multi-pattern definitions', function () {
            test('defines a pattern based on regexp and property fields, with file/line location', function () {
                var problemPattern = [
                    { regexp: 'test', file: 3, line: 4, column: 5, message: 6 }
                ];
                var parsed = parser.parse(problemPattern);
                assert(reporter.isOK());
                assert.deepEqual(parsed, [{
                        regexp: testRegexp,
                        kind: matchers.ProblemLocationKind.Location,
                        file: 3,
                        line: 4,
                        character: 5,
                        message: 6
                    }]);
            });
            test('defines a pattern bsaed on regexp and property fields, with location', function () {
                var problemPattern = [
                    { regexp: 'test', file: 3, location: 4, message: 6 }
                ];
                var parsed = parser.parse(problemPattern);
                assert(reporter.isOK());
                assert.deepEqual(parsed, [{
                        regexp: testRegexp,
                        kind: matchers.ProblemLocationKind.Location,
                        file: 3,
                        location: 4,
                        message: 6
                    }]);
            });
            test('accepts a pattern that provides the fields from multiple entries', function () {
                var problemPattern = [
                    { regexp: 'test', file: 3 },
                    { regexp: 'test1', line: 4 },
                    { regexp: 'test2', column: 5 },
                    { regexp: 'test3', message: 6 }
                ];
                var parsed = parser.parse(problemPattern);
                assert(reporter.isOK());
                assert.deepEqual(parsed, [
                    { regexp: testRegexp, kind: matchers.ProblemLocationKind.Location, file: 3 },
                    { regexp: new RegExp('test1'), line: 4 },
                    { regexp: new RegExp('test2'), character: 5 },
                    { regexp: new RegExp('test3'), message: 6 }
                ]);
            });
            test('forbids setting the loop flag outside of the last element in the array', function () {
                var problemPattern = [
                    { regexp: 'test', file: 3, loop: true },
                    { regexp: 'test1', line: 4 }
                ];
                var parsed = parser.parse(problemPattern);
                assert.equal(null, parsed);
                assert.equal(parsers_1.ValidationState.Error, reporter.state);
                assert(reporter.hasMessage('The loop property is only supported on the last line matcher.'));
            });
            test('forbids setting the kind outside of the first element of the array', function () {
                var problemPattern = [
                    { regexp: 'test', file: 3 },
                    { regexp: 'test1', kind: 'file', line: 4 }
                ];
                var parsed = parser.parse(problemPattern);
                assert.equal(null, parsed);
                assert.equal(parsers_1.ValidationState.Error, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. The kind property must be provided only in the first element'));
            });
            test('kind: Location requires a regexp', function () {
                var problemPattern = [
                    { file: 0, line: 1, column: 20, message: 0 }
                ];
                var parsed = parser.parse(problemPattern);
                assert.equal(null, parsed);
                assert.equal(parsers_1.ValidationState.Error, reporter.state);
                assert(reporter.hasMessage('The problem pattern is missing a regular expression.'));
            });
            test('kind: Location requires a regexp on every entry', function () {
                var problemPattern = [
                    { regexp: 'test', file: 3 },
                    { line: 4 },
                    { regexp: 'test2', column: 5 },
                    { regexp: 'test3', message: 6 }
                ];
                var parsed = parser.parse(problemPattern);
                assert.equal(null, parsed);
                assert.equal(parsers_1.ValidationState.Error, reporter.state);
                assert(reporter.hasMessage('The problem pattern is missing a regular expression.'));
            });
            test('kind: Location requires a message', function () {
                var problemPattern = [
                    { regexp: 'test', file: 0, line: 1, column: 20 }
                ];
                var parsed = parser.parse(problemPattern);
                assert.equal(null, parsed);
                assert.equal(parsers_1.ValidationState.Error, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must have at least have a file and a message.'));
            });
            test('kind: Location requires a file', function () {
                var problemPattern = [
                    { regexp: 'test', line: 1, column: 20, message: 0 }
                ];
                var parsed = parser.parse(problemPattern);
                assert.equal(null, parsed);
                assert.equal(parsers_1.ValidationState.Error, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must either have kind: "file" or have a line or location match group.'));
            });
            test('kind: Location requires either a line or location', function () {
                var problemPattern = [
                    { regexp: 'test', file: 1, column: 20, message: 0 }
                ];
                var parsed = parser.parse(problemPattern);
                assert.equal(null, parsed);
                assert.equal(parsers_1.ValidationState.Error, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must either have kind: "file" or have a line or location match group.'));
            });
            test('kind: File accepts a regexp, file and message', function () {
                var problemPattern = [
                    { regexp: 'test', file: 2, kind: 'file', message: 6 }
                ];
                var parsed = parser.parse(problemPattern);
                console.log(reporter.messages);
                assert(reporter.isOK());
                assert.deepEqual(parsed, [{
                        regexp: testRegexp,
                        kind: matchers.ProblemLocationKind.File,
                        file: 2,
                        message: 6
                    }]);
            });
            test('kind: File requires a file', function () {
                var problemPattern = [
                    { regexp: 'test', kind: 'file', message: 6 }
                ];
                var parsed = parser.parse(problemPattern);
                assert.equal(null, parsed);
                assert.equal(parsers_1.ValidationState.Error, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must have at least have a file and a message.'));
            });
            test('kind: File requires a message', function () {
                var problemPattern = [
                    { regexp: 'test', kind: 'file', file: 6 }
                ];
                var parsed = parser.parse(problemPattern);
                assert.equal(null, parsed);
                assert.equal(parsers_1.ValidationState.Error, reporter.state);
                assert(reporter.hasMessage('The problem pattern is invalid. It must have at least have a file and a message.'));
            });
        });
    });
});
