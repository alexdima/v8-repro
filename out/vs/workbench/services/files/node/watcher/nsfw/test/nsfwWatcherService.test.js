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
define(["require", "exports", "assert", "vs/base/common/platform", "vs/workbench/services/files/node/watcher/nsfw/nsfwWatcherService"], function (require, exports, assert, platform, nsfwWatcherService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestNsfwWatcherService = /** @class */ (function (_super) {
        __extends(TestNsfwWatcherService, _super);
        function TestNsfwWatcherService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TestNsfwWatcherService.prototype.normalizeRoots = function (roots) {
            // Work with strings as paths to simplify testing
            var requests = roots.map(function (r) {
                return { basePath: r, ignored: [] };
            });
            return this._normalizeRoots(requests).map(function (r) { return r.basePath; });
        };
        return TestNsfwWatcherService;
    }(nsfwWatcherService_1.NsfwWatcherService));
    suite('NSFW Watcher Service', function () {
        suite('_normalizeRoots', function () {
            test('should not impacts roots that don\'t overlap', function () {
                var service = new TestNsfwWatcherService();
                if (platform.isWindows) {
                    assert.deepEqual(service.normalizeRoots(['C:\\a']), ['C:\\a']);
                    assert.deepEqual(service.normalizeRoots(['C:\\a', 'C:\\b']), ['C:\\a', 'C:\\b']);
                    assert.deepEqual(service.normalizeRoots(['C:\\a', 'C:\\b', 'C:\\c\\d\\e']), ['C:\\a', 'C:\\b', 'C:\\c\\d\\e']);
                }
                else {
                    assert.deepEqual(service.normalizeRoots(['/a']), ['/a']);
                    assert.deepEqual(service.normalizeRoots(['/a', '/b']), ['/a', '/b']);
                    assert.deepEqual(service.normalizeRoots(['/a', '/b', '/c/d/e']), ['/a', '/b', '/c/d/e']);
                }
            });
            test('should remove sub-folders of other roots', function () {
                var service = new TestNsfwWatcherService();
                if (platform.isWindows) {
                    assert.deepEqual(service.normalizeRoots(['C:\\a', 'C:\\a\\b']), ['C:\\a']);
                    assert.deepEqual(service.normalizeRoots(['C:\\a', 'C:\\b', 'C:\\a\\b']), ['C:\\a', 'C:\\b']);
                    assert.deepEqual(service.normalizeRoots(['C:\\b\\a', 'C:\\a', 'C:\\b', 'C:\\a\\b']), ['C:\\a', 'C:\\b']);
                    assert.deepEqual(service.normalizeRoots(['C:\\a', 'C:\\a\\b', 'C:\\a\\c\\d']), ['C:\\a']);
                }
                else {
                    assert.deepEqual(service.normalizeRoots(['/a', '/a/b']), ['/a']);
                    assert.deepEqual(service.normalizeRoots(['/a', '/b', '/a/b']), ['/a', '/b']);
                    assert.deepEqual(service.normalizeRoots(['/b/a', '/a', '/b', '/a/b']), ['/a', '/b']);
                    assert.deepEqual(service.normalizeRoots(['/a', '/a/b', '/a/c/d']), ['/a']);
                }
            });
        });
    });
});
