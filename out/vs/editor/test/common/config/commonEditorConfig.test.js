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
define(["require", "exports", "assert", "vs/editor/common/config/editorZoom", "vs/editor/test/common/mocks/testConfiguration"], function (require, exports, assert, editorZoom_1, testConfiguration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Common Editor Config', function () {
        test('Zoom Level', function () {
            //Zoom levels are defined to go between -9, 9 inclusive
            var zoom = editorZoom_1.EditorZoom;
            zoom.setZoomLevel(0);
            assert.equal(zoom.getZoomLevel(), 0);
            zoom.setZoomLevel(-0);
            assert.equal(zoom.getZoomLevel(), 0);
            zoom.setZoomLevel(5);
            assert.equal(zoom.getZoomLevel(), 5);
            zoom.setZoomLevel(-1);
            assert.equal(zoom.getZoomLevel(), -1);
            zoom.setZoomLevel(9);
            assert.equal(zoom.getZoomLevel(), 9);
            zoom.setZoomLevel(-9);
            assert.equal(zoom.getZoomLevel(), -9);
            zoom.setZoomLevel(10);
            assert.equal(zoom.getZoomLevel(), 9);
            zoom.setZoomLevel(-10);
            assert.equal(zoom.getZoomLevel(), -9);
            zoom.setZoomLevel(9.1);
            assert.equal(zoom.getZoomLevel(), 9);
            zoom.setZoomLevel(-9.1);
            assert.equal(zoom.getZoomLevel(), -9);
            zoom.setZoomLevel(Infinity);
            assert.equal(zoom.getZoomLevel(), 9);
            zoom.setZoomLevel(Number.NEGATIVE_INFINITY);
            assert.equal(zoom.getZoomLevel(), -9);
        });
        var TestWrappingConfiguration = /** @class */ (function (_super) {
            __extends(TestWrappingConfiguration, _super);
            function TestWrappingConfiguration() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            TestWrappingConfiguration.prototype._getEnvConfiguration = function () {
                return {
                    extraEditorClassName: '',
                    outerWidth: 1000,
                    outerHeight: 100,
                    emptySelectionClipboard: true,
                    pixelRatio: 1,
                    zoomLevel: 0,
                    accessibilitySupport: 0 /* Unknown */
                };
            };
            return TestWrappingConfiguration;
        }(testConfiguration_1.TestConfiguration));
        function assertWrapping(config, isViewportWrapping, wrappingColumn) {
            assert.equal(config.editor.wrappingInfo.isViewportWrapping, isViewportWrapping);
            assert.equal(config.editor.wrappingInfo.wrappingColumn, wrappingColumn);
        }
        test('wordWrap default', function () {
            var config = new TestWrappingConfiguration({});
            assertWrapping(config, false, -1);
        });
        test('wordWrap compat false', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: false
            });
            assertWrapping(config, false, -1);
        });
        test('wordWrap compat true', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: true
            });
            assertWrapping(config, true, 81);
        });
        test('wordWrap on', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'on'
            });
            assertWrapping(config, true, 81);
        });
        test('wordWrap on without minimap', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'on',
                minimap: {
                    enabled: false
                }
            });
            assertWrapping(config, true, 89);
        });
        test('wordWrap on does not use wordWrapColumn', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'on',
                wordWrapColumn: 10
            });
            assertWrapping(config, true, 81);
        });
        test('wordWrap off', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'off'
            });
            assertWrapping(config, false, -1);
        });
        test('wordWrap off does not use wordWrapColumn', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'off',
                wordWrapColumn: 10
            });
            assertWrapping(config, false, -1);
        });
        test('wordWrap wordWrapColumn uses default wordWrapColumn', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'wordWrapColumn'
            });
            assertWrapping(config, false, 80);
        });
        test('wordWrap wordWrapColumn uses wordWrapColumn', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: 100
            });
            assertWrapping(config, false, 100);
        });
        test('wordWrap wordWrapColumn validates wordWrapColumn', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: -1
            });
            assertWrapping(config, false, 1);
        });
        test('wordWrap bounded uses default wordWrapColumn', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'bounded'
            });
            assertWrapping(config, true, 80);
        });
        test('wordWrap bounded uses wordWrapColumn', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'bounded',
                wordWrapColumn: 40
            });
            assertWrapping(config, true, 40);
        });
        test('wordWrap bounded validates wordWrapColumn', function () {
            var config = new TestWrappingConfiguration({
                wordWrap: 'bounded',
                wordWrapColumn: -1
            });
            assertWrapping(config, true, 1);
        });
    });
});
