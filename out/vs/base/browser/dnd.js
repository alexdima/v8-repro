/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/builder"], function (require, exports, builder_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A helper that will execute a provided function when the provided HTMLElement receives
     *  dragover event for 800ms. If the drag is aborted before, the callback will not be triggered.
     */
    var DelayedDragHandler = /** @class */ (function () {
        function DelayedDragHandler(container, callback) {
            var _this = this;
            builder_1.$(container).on('dragover', function () {
                if (!_this.timeout) {
                    _this.timeout = setTimeout(function () {
                        callback();
                        _this.timeout = null;
                    }, 800);
                }
            });
            builder_1.$(container).on(['dragleave', 'drop', 'dragend'], function () { return _this.clearDragTimeout(); });
        }
        DelayedDragHandler.prototype.clearDragTimeout = function () {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        };
        DelayedDragHandler.prototype.dispose = function () {
            this.clearDragTimeout();
        };
        return DelayedDragHandler;
    }());
    exports.DelayedDragHandler = DelayedDragHandler;
    // Common data transfers
    exports.DataTransfers = {
        /**
         * Application specific resource transfer type
         */
        RESOURCES: 'ResourceURLs',
        /**
         * Browser specific transfer type to download
         */
        DOWNLOAD_URL: 'DownloadURL',
        /**
         * Browser specific transfer type for files
         */
        FILES: 'Files',
        /**
         * Typicaly transfer type for copy/paste transfers.
         */
        TEXT: 'text/plain'
    };
});
