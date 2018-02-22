define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/winjs.base", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/browser/errorTelemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/errors", "sinon", "vs/platform/configuration/common/configuration"], function (require, exports, assert, event_1, winjs_base_1, telemetryService_1, errorTelemetry_1, telemetryUtils_1, Errors, sinon, configuration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var optInStatusEventName = 'optInStatus';
    var TestTelemetryAppender = /** @class */ (function () {
        function TestTelemetryAppender() {
            this.events = [];
            this.isDisposed = false;
        }
        TestTelemetryAppender.prototype.log = function (eventName, data) {
            this.events.push({ eventName: eventName, data: data });
        };
        TestTelemetryAppender.prototype.getEventsCount = function () {
            return this.events.length;
        };
        TestTelemetryAppender.prototype.dispose = function () {
            this.isDisposed = true;
        };
        return TestTelemetryAppender;
    }());
    var ErrorTestingSettings = /** @class */ (function () {
        function ErrorTestingSettings() {
            this.personalInfo = 'DANGEROUS/PATH';
            this.importantInfo = 'important/information';
            this.filePrefix = 'file:///';
            this.dangerousPathWithImportantInfo = this.filePrefix + this.personalInfo + '/resources/app/' + this.importantInfo;
            this.dangerousPathWithoutImportantInfo = this.filePrefix + this.personalInfo;
            this.missingModelPrefix = 'Received model events for missing model ';
            this.missingModelMessage = this.missingModelPrefix + ' ' + this.dangerousPathWithoutImportantInfo;
            this.noSuchFilePrefix = 'ENOENT: no such file or directory';
            this.noSuchFileMessage = this.noSuchFilePrefix + ' \'' + this.personalInfo + '\'';
            this.stack = ['at e._modelEvents (a/path/that/doesnt/contain/code/names.js:11:7309)',
                '    at t.AllWorkers (a/path/that/doesnt/contain/code/names.js:6:8844)',
                '    at e.(anonymous function) [as _modelEvents] (a/path/that/doesnt/contain/code/names.js:5:29552)',
                '    at Function.<anonymous> (a/path/that/doesnt/contain/code/names.js:6:8272)',
                '    at e.dispatch (a/path/that/doesnt/contain/code/names.js:5:26931)',
                '    at e.request (a/path/that/doesnt/contain/code/names.js:14:1745)',
                '    at t._handleMessage (another/path/that/doesnt/contain/code/names.js:14:17447)',
                '    at t._onmessage (another/path/that/doesnt/contain/code/names.js:14:16976)',
                '    at t.onmessage (another/path/that/doesnt/contain/code/names.js:14:15854)',
                '    at DedicatedWorkerGlobalScope.self.onmessage',
                this.dangerousPathWithImportantInfo,
                this.dangerousPathWithoutImportantInfo,
                this.missingModelMessage,
                this.noSuchFileMessage];
        }
        return ErrorTestingSettings;
    }());
    suite('TelemetryService', function () {
        test('Disposing', sinon.test(function () {
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            return service.publicLog('testPrivateEvent').then(function () {
                assert.equal(testAppender.getEventsCount(), 1);
                service.dispose();
                assert.equal(!testAppender.isDisposed, true);
            });
        }));
        // event reporting
        test('Simple event', sinon.test(function () {
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            return service.publicLog('testEvent').then(function (_) {
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'testEvent');
                assert.notEqual(testAppender.events[0].data, null);
                service.dispose();
            });
        }));
        test('Event with data', sinon.test(function () {
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            return service.publicLog('testEvent', {
                'stringProp': 'property',
                'numberProp': 1,
                'booleanProp': true,
                'complexProp': {
                    'value': 0
                }
            }).then(function () {
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'testEvent');
                assert.notEqual(testAppender.events[0].data, null);
                assert.equal(testAppender.events[0].data['stringProp'], 'property');
                assert.equal(testAppender.events[0].data['numberProp'], 1);
                assert.equal(testAppender.events[0].data['booleanProp'], true);
                assert.equal(testAppender.events[0].data['complexProp'].value, 0);
                service.dispose();
            });
        }));
        test('common properties added to *all* events, simple event', function () {
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({
                appender: testAppender,
                commonProperties: winjs_base_1.TPromise.as({ foo: 'JA!', get bar() { return Math.random(); } })
            }, undefined);
            return service.publicLog('testEvent').then(function (_) {
                var first = testAppender.events[0];
                assert.equal(Object.keys(first.data).length, 2);
                assert.equal(typeof first.data['foo'], 'string');
                assert.equal(typeof first.data['bar'], 'number');
                service.dispose();
            });
        });
        test('common properties added to *all* events, event with data', function () {
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({
                appender: testAppender,
                commonProperties: winjs_base_1.TPromise.as({ foo: 'JA!', get bar() { return Math.random(); } })
            }, undefined);
            return service.publicLog('testEvent', { hightower: 'xl', price: 8000 }).then(function (_) {
                var first = testAppender.events[0];
                assert.equal(Object.keys(first.data).length, 4);
                assert.equal(typeof first.data['foo'], 'string');
                assert.equal(typeof first.data['bar'], 'number');
                assert.equal(typeof first.data['hightower'], 'string');
                assert.equal(typeof first.data['price'], 'number');
                service.dispose();
            });
        });
        test('TelemetryInfo comes from properties', function () {
            var service = new telemetryService_1.TelemetryService({
                appender: telemetryUtils_1.NullAppender,
                commonProperties: winjs_base_1.TPromise.as((_a = {
                        sessionID: 'one'
                    },
                    _a['common.instanceId'] = 'two',
                    _a['common.machineId'] = 'three',
                    _a))
            }, undefined);
            return service.getTelemetryInfo().then(function (info) {
                assert.equal(info.sessionId, 'one');
                assert.equal(info.instanceId, 'two');
                assert.equal(info.machineId, 'three');
                service.dispose();
            });
            var _a;
        });
        test('enableTelemetry on by default', sinon.test(function () {
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            return service.publicLog('testEvent').then(function () {
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'testEvent');
                service.dispose();
            });
        }));
        test('Error events', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var testAppender = new TestTelemetryAppender();
                var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
                var errorTelemetry = new errorTelemetry_1.default(service);
                var e = new Error('This is a test.');
                // for Phantom
                if (!e.stack) {
                    e.stack = 'blah';
                }
                Errors.onUnexpectedError(e);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'UnhandledError');
                assert.equal(testAppender.events[0].data.message, 'This is a test.');
                errorTelemetry.dispose();
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        // 	test('Unhandled Promise Error events', sinon.test(function() {
        //
        // 		let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
        // 		Errors.setUnexpectedErrorHandler(() => {});
        //
        // 		try {
        // 			let service = new MainTelemetryService();
        // 			let testAppender = new TestTelemetryAppender();
        // 			service.addTelemetryAppender(testAppender);
        //
        // 			winjs.Promise.wrapError(new Error('This should not get logged'));
        // 			winjs.TPromise.as(true).then(() => {
        // 				throw new Error('This should get logged');
        // 			});
        // 			// prevent console output from failing the test
        // 			this.stub(console, 'log');
        // 			// allow for the promise to finish
        // 			this.clock.tick(MainErrorTelemetry.ERROR_FLUSH_TIMEOUT);
        //
        // 			assert.equal(testAppender.getEventsCount(), 1);
        // 			assert.equal(testAppender.events[0].eventName, 'UnhandledError');
        // 			assert.equal(testAppender.events[0].data.message,  'This should get logged');
        //
        // 			service.dispose();
        // 		} finally {
        // 			Errors.setUnexpectedErrorHandler(origErrorHandler);
        // 		}
        // 	}));
        test('Handle global errors', sinon.test(function () {
            var errorStub = sinon.stub();
            window.onerror = errorStub;
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            var errorTelemetry = new errorTelemetry_1.default(service);
            var testError = new Error('test');
            window.onerror('Error Message', 'file.js', 2, 42, testError);
            this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.alwaysCalledWithExactly('Error Message', 'file.js', 2, 42, testError), true);
            assert.equal(errorStub.callCount, 1);
            assert.equal(testAppender.getEventsCount(), 1);
            assert.equal(testAppender.events[0].eventName, 'UnhandledError');
            assert.equal(testAppender.events[0].data.message, 'Error Message');
            assert.equal(testAppender.events[0].data.filename, 'file.js');
            assert.equal(testAppender.events[0].data.line, 2);
            assert.equal(testAppender.events[0].data.column, 42);
            assert.equal(testAppender.events[0].data.error.message, 'test');
            errorTelemetry.dispose();
            service.dispose();
        }));
        test('Uncaught Error Telemetry removes PII from filename', sinon.test(function () {
            var errorStub = sinon.stub();
            window.onerror = errorStub;
            var settings = new ErrorTestingSettings();
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            var errorTelemetry = new errorTelemetry_1.default(service);
            var dangerousFilenameError = new Error('dangerousFilename');
            dangerousFilenameError.stack = settings.stack;
            window.onerror('dangerousFilename', settings.dangerousPathWithImportantInfo + '/test.js', 2, 42, dangerousFilenameError);
            this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 1);
            assert.equal(testAppender.events[0].data.filename.indexOf(settings.dangerousPathWithImportantInfo), -1);
            dangerousFilenameError = new Error('dangerousFilename');
            dangerousFilenameError.stack = settings.stack;
            window.onerror('dangerousFilename', settings.dangerousPathWithImportantInfo + '/test.js', 2, 42, dangerousFilenameError);
            this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 2);
            assert.equal(testAppender.events[0].data.filename.indexOf(settings.dangerousPathWithImportantInfo), -1);
            assert.equal(testAppender.events[0].data.filename, settings.importantInfo + '/test.js');
            errorTelemetry.dispose();
            service.dispose();
        }));
        test('Unexpected Error Telemetry removes PII', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var settings = new ErrorTestingSettings();
                var testAppender = new TestTelemetryAppender();
                var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
                var errorTelemetry = new errorTelemetry_1.default(service);
                var dangerousPathWithoutImportantInfoError = new Error(settings.dangerousPathWithoutImportantInfo);
                dangerousPathWithoutImportantInfoError.stack = settings.stack;
                Errors.onUnexpectedError(dangerousPathWithoutImportantInfoError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Uncaught Error Telemetry removes PII', sinon.test(function () {
            var errorStub = sinon.stub();
            window.onerror = errorStub;
            var settings = new ErrorTestingSettings();
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            var errorTelemetry = new errorTelemetry_1.default(service);
            var dangerousPathWithoutImportantInfoError = new Error('dangerousPathWithoutImportantInfo');
            dangerousPathWithoutImportantInfoError.stack = settings.stack;
            window.onerror(settings.dangerousPathWithoutImportantInfo, 'test.js', 2, 42, dangerousPathWithoutImportantInfoError);
            this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 1);
            // Test that no file information remains, esp. personal info
            assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
            assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
            errorTelemetry.dispose();
            service.dispose();
        }));
        test('Unexpected Error Telemetry removes PII but preserves Code file path', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var settings = new ErrorTestingSettings();
                var testAppender = new TestTelemetryAppender();
                var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
                var errorTelemetry = new errorTelemetry_1.default(service);
                var dangerousPathWithImportantInfoError = new Error(settings.dangerousPathWithImportantInfo);
                dangerousPathWithImportantInfoError.stack = settings.stack;
                // Test that important information remains but personal info does not
                Errors.onUnexpectedError(dangerousPathWithImportantInfoError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                assert.notEqual(testAppender.events[0].data.message.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Uncaught Error Telemetry removes PII but preserves Code file path', sinon.test(function () {
            var errorStub = sinon.stub();
            window.onerror = errorStub;
            var settings = new ErrorTestingSettings();
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            var errorTelemetry = new errorTelemetry_1.default(service);
            var dangerousPathWithImportantInfoError = new Error('dangerousPathWithImportantInfo');
            dangerousPathWithImportantInfoError.stack = settings.stack;
            window.onerror(settings.dangerousPathWithImportantInfo, 'test.js', 2, 42, dangerousPathWithImportantInfoError);
            this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 1);
            // Test that important information remains but personal info does not
            assert.notEqual(testAppender.events[0].data.message.indexOf(settings.importantInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.importantInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
            assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
            errorTelemetry.dispose();
            service.dispose();
        }));
        test('Unexpected Error Telemetry removes PII but preserves Code file path when PIIPath is configured', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var settings = new ErrorTestingSettings();
                var testAppender = new TestTelemetryAppender();
                var service = new telemetryService_1.TelemetryService({ appender: testAppender, piiPaths: [settings.personalInfo + '/resources/app/'] }, undefined);
                var errorTelemetry = new errorTelemetry_1.default(service);
                var dangerousPathWithImportantInfoError = new Error(settings.dangerousPathWithImportantInfo);
                dangerousPathWithImportantInfoError.stack = settings.stack;
                // Test that important information remains but personal info does not
                Errors.onUnexpectedError(dangerousPathWithImportantInfoError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                assert.notEqual(testAppender.events[0].data.message.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Uncaught Error Telemetry removes PII but preserves Code file path when PIIPath is configured', sinon.test(function () {
            var errorStub = sinon.stub();
            window.onerror = errorStub;
            var settings = new ErrorTestingSettings();
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender, piiPaths: [settings.personalInfo + '/resources/app/'] }, undefined);
            var errorTelemetry = new errorTelemetry_1.default(service);
            var dangerousPathWithImportantInfoError = new Error('dangerousPathWithImportantInfo');
            dangerousPathWithImportantInfoError.stack = settings.stack;
            window.onerror(settings.dangerousPathWithImportantInfo, 'test.js', 2, 42, dangerousPathWithImportantInfoError);
            this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 1);
            // Test that important information remains but personal info does not
            assert.notEqual(testAppender.events[0].data.message.indexOf(settings.importantInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.importantInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
            assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
            errorTelemetry.dispose();
            service.dispose();
        }));
        test('Unexpected Error Telemetry removes PII but preserves Missing Model error message', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var settings = new ErrorTestingSettings();
                var testAppender = new TestTelemetryAppender();
                var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
                var errorTelemetry = new errorTelemetry_1.default(service);
                var missingModelError = new Error(settings.missingModelMessage);
                missingModelError.stack = settings.stack;
                // Test that no file information remains, but this particular
                // error message does (Received model events for missing model)
                Errors.onUnexpectedError(missingModelError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                assert.notEqual(testAppender.events[0].data.message.indexOf(settings.missingModelPrefix), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.missingModelPrefix), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Uncaught Error Telemetry removes PII but preserves Missing Model error message', sinon.test(function () {
            var errorStub = sinon.stub();
            window.onerror = errorStub;
            var settings = new ErrorTestingSettings();
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            var errorTelemetry = new errorTelemetry_1.default(service);
            var missingModelError = new Error('missingModelMessage');
            missingModelError.stack = settings.stack;
            window.onerror(settings.missingModelMessage, 'test.js', 2, 42, missingModelError);
            this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
            assert.equal(errorStub.callCount, 1);
            // Test that no file information remains, but this particular
            // error message does (Received model events for missing model)
            assert.notEqual(testAppender.events[0].data.message.indexOf(settings.missingModelPrefix), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.missingModelPrefix), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
            assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
            assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
            assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
            errorTelemetry.dispose();
            service.dispose();
        }));
        test('Unexpected Error Telemetry removes PII but preserves No Such File error message', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var settings = new ErrorTestingSettings();
                var testAppender = new TestTelemetryAppender();
                var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
                var errorTelemetry = new errorTelemetry_1.default(service);
                var noSuchFileError = new Error(settings.noSuchFileMessage);
                noSuchFileError.stack = settings.stack;
                // Test that no file information remains, but this particular
                // error message does (ENOENT: no such file or directory)
                Errors.onUnexpectedError(noSuchFileError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                assert.notEqual(testAppender.events[0].data.message.indexOf(settings.noSuchFilePrefix), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.noSuchFilePrefix), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Uncaught Error Telemetry removes PII but preserves No Such File error message', sinon.test(function () {
            var origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
            Errors.setUnexpectedErrorHandler(function () { });
            try {
                var errorStub = sinon.stub();
                window.onerror = errorStub;
                var settings = new ErrorTestingSettings();
                var testAppender = new TestTelemetryAppender();
                var service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
                var errorTelemetry = new errorTelemetry_1.default(service);
                var noSuchFileError = new Error('noSuchFileMessage');
                noSuchFileError.stack = settings.stack;
                window.onerror(settings.noSuchFileMessage, 'test.js', 2, 42, noSuchFileError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                assert.equal(errorStub.callCount, 1);
                // Test that no file information remains, but this particular
                // error message does (ENOENT: no such file or directory)
                Errors.onUnexpectedError(noSuchFileError);
                assert.notEqual(testAppender.events[0].data.message.indexOf(settings.noSuchFilePrefix), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.message.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.noSuchFilePrefix), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.stack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.stack.indexOf(settings.stack[4]), -1);
                assert.equal(testAppender.events[0].data.stack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            }
            finally {
                Errors.setUnexpectedErrorHandler(origErrorHandler);
            }
        }));
        test('Telemetry Service respects user opt-in settings', sinon.test(function () {
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ userOptIn: false, appender: testAppender }, undefined);
            return service.publicLog('testEvent').then(function () {
                assert.equal(testAppender.getEventsCount(), 0);
                service.dispose();
            });
        }));
        test('Telemetry Service does not sent optInStatus when user opted out', sinon.test(function () {
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ userOptIn: false, appender: testAppender }, undefined);
            return service.publicLog(optInStatusEventName, { optIn: false }).then(function () {
                assert.equal(testAppender.getEventsCount(), 0);
                service.dispose();
            });
        }));
        test('Telemetry Service sends events when enableTelemetry is on even user optin is on', sinon.test(function () {
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({ userOptIn: true, appender: testAppender }, undefined);
            return service.publicLog('testEvent').then(function () {
                assert.equal(testAppender.getEventsCount(), 1);
                service.dispose();
            });
        }));
        test('Telemetry Service checks with config service', function () {
            var enableTelemetry = false;
            var emitter = new event_1.Emitter();
            var testAppender = new TestTelemetryAppender();
            var service = new telemetryService_1.TelemetryService({
                appender: testAppender
            }, {
                _serviceBrand: undefined,
                getValue: function () {
                    return {
                        enableTelemetry: enableTelemetry
                    };
                },
                updateValue: function () {
                    return null;
                },
                inspect: function (key) {
                    return {
                        value: configuration_1.getConfigurationValue(this.getValue(), key),
                        default: configuration_1.getConfigurationValue(this.getValue(), key),
                        user: configuration_1.getConfigurationValue(this.getValue(), key),
                        workspace: null,
                        workspaceFolder: null
                    };
                },
                keys: function () { return { default: [], user: [], workspace: [], workspaceFolder: [] }; },
                onDidChangeConfiguration: emitter.event,
                reloadConfiguration: function () { return null; },
                getConfigurationData: function () { return null; }
            });
            assert.equal(service.isOptedIn, false);
            enableTelemetry = true;
            emitter.fire({});
            assert.equal(service.isOptedIn, true);
            enableTelemetry = false;
            emitter.fire({});
            assert.equal(service.isOptedIn, false);
            service.dispose();
        });
    });
});
