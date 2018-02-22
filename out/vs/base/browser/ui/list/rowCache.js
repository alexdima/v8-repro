/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom"], function (require, exports, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function removeFromParent(element) {
        try {
            element.parentElement.removeChild(element);
        }
        catch (e) {
            // this will throw if this happens due to a blur event, nasty business
        }
    }
    var RowCache = /** @class */ (function () {
        function RowCache(renderers) {
            this.renderers = renderers;
            this.cache = new Map();
        }
        /**
         * Returns a row either by creating a new one or reusing
         * a previously released row which shares the same templateId.
         */
        RowCache.prototype.alloc = function (templateId) {
            var result = this.getTemplateCache(templateId).pop();
            if (!result) {
                var domNode = dom_1.$('.monaco-list-row');
                var renderer = this.renderers.get(templateId);
                var templateData = renderer.renderTemplate(domNode);
                result = { domNode: domNode, templateId: templateId, templateData: templateData };
            }
            return result;
        };
        /**
         * Releases the row for eventual reuse.
         */
        RowCache.prototype.release = function (row) {
            if (!row) {
                return;
            }
            this.releaseRow(row);
        };
        RowCache.prototype.releaseRow = function (row) {
            var domNode = row.domNode, templateId = row.templateId;
            dom_1.removeClass(domNode, 'scrolling');
            removeFromParent(domNode);
            var cache = this.getTemplateCache(templateId);
            cache.push(row);
        };
        RowCache.prototype.getTemplateCache = function (templateId) {
            var result = this.cache.get(templateId);
            if (!result) {
                result = [];
                this.cache.set(templateId, result);
            }
            return result;
        };
        RowCache.prototype.garbageCollect = function () {
            var _this = this;
            if (!this.renderers) {
                return;
            }
            this.cache.forEach(function (cachedRows, templateId) {
                for (var _i = 0, cachedRows_1 = cachedRows; _i < cachedRows_1.length; _i++) {
                    var cachedRow = cachedRows_1[_i];
                    var renderer = _this.renderers[templateId];
                    renderer.disposeTemplate(cachedRow.templateData);
                    cachedRow.domNode = null;
                    cachedRow.templateData = null;
                }
            });
            this.cache.clear();
        };
        RowCache.prototype.dispose = function () {
            this.garbageCollect();
            this.cache.clear();
            this.renderers = null;
        };
        return RowCache;
    }());
    exports.RowCache = RowCache;
});
