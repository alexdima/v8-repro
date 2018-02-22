/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/decorations/browser/decorationsService", "vs/base/common/uri", "vs/base/common/event", "vs/platform/theme/test/common/testThemeService"], function (require, exports, assert, decorationsService_1, uri_1, event_1, testThemeService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('DecorationsService', function () {
        var service;
        setup(function () {
            if (service) {
                service.dispose();
            }
            service = new decorationsService_1.FileDecorationsService(new testThemeService_1.TestThemeService());
        });
        test('Async provider, async/evented result', function () {
            var uri = uri_1.default.parse('foo:bar');
            var callCounter = 0;
            service.registerDecorationsProvider(new /** @class */ (function () {
                function class_1() {
                    this.label = 'Test';
                    this.onDidChange = event_1.default.None;
                }
                class_1.prototype.provideDecorations = function (uri) {
                    callCounter += 1;
                    return new Promise(function (resolve) {
                        setTimeout(function () { return resolve({
                            color: 'someBlue',
                            tooltip: 'T'
                        }); });
                    });
                };
                return class_1;
            }()));
            // trigger -> async
            assert.equal(service.getDecoration(uri, false), undefined);
            assert.equal(callCounter, 1);
            // event when result is computed
            return event_1.toPromise(service.onDidChangeDecorations).then(function (e) {
                assert.equal(e.affectsResource(uri), true);
                // sync result
                assert.deepEqual(service.getDecoration(uri, false).tooltip, 'T');
                assert.equal(callCounter, 1);
            });
        });
        test('Sync provider, sync result', function () {
            var uri = uri_1.default.parse('foo:bar');
            var callCounter = 0;
            service.registerDecorationsProvider(new /** @class */ (function () {
                function class_2() {
                    this.label = 'Test';
                    this.onDidChange = event_1.default.None;
                }
                class_2.prototype.provideDecorations = function (uri) {
                    callCounter += 1;
                    return { color: 'someBlue', tooltip: 'Z' };
                };
                return class_2;
            }()));
            // trigger -> sync
            assert.deepEqual(service.getDecoration(uri, false).tooltip, 'Z');
            assert.equal(callCounter, 1);
        });
        test('Clear decorations on provider dispose', function () {
            var uri = uri_1.default.parse('foo:bar');
            var callCounter = 0;
            var reg = service.registerDecorationsProvider(new /** @class */ (function () {
                function class_3() {
                    this.label = 'Test';
                    this.onDidChange = event_1.default.None;
                }
                class_3.prototype.provideDecorations = function (uri) {
                    callCounter += 1;
                    return { color: 'someBlue', tooltip: 'J' };
                };
                return class_3;
            }()));
            // trigger -> sync
            assert.deepEqual(service.getDecoration(uri, false).tooltip, 'J');
            assert.equal(callCounter, 1);
            // un-register -> ensure good event
            var didSeeEvent = false;
            service.onDidChangeDecorations(function (e) {
                assert.equal(e.affectsResource(uri), true);
                assert.deepEqual(service.getDecoration(uri, false), undefined);
                assert.equal(callCounter, 1);
                didSeeEvent = true;
            });
            reg.dispose();
            assert.equal(didSeeEvent, true);
        });
        test('No default bubbling', function () {
            var reg = service.registerDecorationsProvider({
                label: 'Test',
                onDidChange: event_1.default.None,
                provideDecorations: function (uri) {
                    return uri.path.match(/\.txt/)
                        ? { tooltip: '.txt', weight: 17 }
                        : undefined;
                }
            });
            var childUri = uri_1.default.parse('file:///some/path/some/file.txt');
            var deco = service.getDecoration(childUri, false);
            assert.equal(deco.tooltip, '.txt');
            deco = service.getDecoration(childUri.with({ path: 'some/path/' }), true);
            assert.equal(deco, undefined);
            reg.dispose();
            // bubble
            reg = service.registerDecorationsProvider({
                label: 'Test',
                onDidChange: event_1.default.None,
                provideDecorations: function (uri) {
                    return uri.path.match(/\.txt/)
                        ? { tooltip: '.txt.bubble', weight: 71, bubble: true }
                        : undefined;
                }
            });
            deco = service.getDecoration(childUri, false);
            assert.equal(deco.tooltip, '.txt.bubble');
            deco = service.getDecoration(childUri.with({ path: 'some/path/' }), true);
            assert.equal(typeof deco.tooltip, 'string');
        });
        test('Overwrite data', function () {
            var someUri = uri_1.default.parse('file:///some/path/some/file.txt');
            var deco = service.getDecoration(someUri, false);
            assert.equal(deco, undefined);
            deco = service.getDecoration(someUri, false, { tooltip: 'Overwrite' });
            assert.equal(deco.tooltip, 'Overwrite');
            var reg = service.registerDecorationsProvider({
                label: 'Test',
                onDidChange: event_1.default.None,
                provideDecorations: function (uri) {
                    return { tooltip: 'FromMe', source: 'foo' };
                }
            });
            deco = service.getDecoration(someUri, false);
            assert.equal(deco.tooltip, 'FromMe');
            deco = service.getDecoration(someUri, false, { source: 'foo', tooltip: 'O' });
            assert.equal(deco.tooltip, 'O');
            reg.dispose();
        });
    });
});
