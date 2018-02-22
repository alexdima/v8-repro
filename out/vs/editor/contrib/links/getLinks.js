/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/editor/common/core/range", "vs/editor/common/modes", "vs/base/common/async", "vs/platform/commands/common/commands", "vs/editor/common/services/modelService"], function (require, exports, errors_1, uri_1, winjs_base_1, range_1, modes_1, async_1, commands_1, modelService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Link = /** @class */ (function () {
        function Link(link, provider) {
            this._link = link;
            this._provider = provider;
        }
        Link.prototype.toJSON = function () {
            return {
                range: this.range,
                url: this.url
            };
        };
        Object.defineProperty(Link.prototype, "range", {
            get: function () {
                return this._link.range;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Link.prototype, "url", {
            get: function () {
                return this._link.url;
            },
            enumerable: true,
            configurable: true
        });
        Link.prototype.resolve = function () {
            var _this = this;
            if (this._link.url) {
                try {
                    return winjs_base_1.TPromise.as(uri_1.default.parse(this._link.url));
                }
                catch (e) {
                    return winjs_base_1.TPromise.wrapError(new Error('invalid'));
                }
            }
            if (typeof this._provider.resolveLink === 'function') {
                return async_1.asWinJsPromise(function (token) { return _this._provider.resolveLink(_this._link, token); }).then(function (value) {
                    _this._link = value || _this._link;
                    if (_this._link.url) {
                        // recurse
                        return _this.resolve();
                    }
                    return winjs_base_1.TPromise.wrapError(new Error('missing'));
                });
            }
            return winjs_base_1.TPromise.wrapError(new Error('missing'));
        };
        return Link;
    }());
    exports.Link = Link;
    function getLinks(model) {
        var links = [];
        // ask all providers for links in parallel
        var promises = modes_1.LinkProviderRegistry.ordered(model).reverse().map(function (provider) {
            return async_1.asWinJsPromise(function (token) { return provider.provideLinks(model, token); }).then(function (result) {
                if (Array.isArray(result)) {
                    var newLinks = result.map(function (link) { return new Link(link, provider); });
                    links = union(links, newLinks);
                }
            }, errors_1.onUnexpectedExternalError);
        });
        return winjs_base_1.TPromise.join(promises).then(function () {
            return links;
        });
    }
    exports.getLinks = getLinks;
    function union(oldLinks, newLinks) {
        // reunite oldLinks with newLinks and remove duplicates
        var result = [], oldIndex, oldLen, newIndex, newLen, oldLink, newLink, comparisonResult;
        for (oldIndex = 0, newIndex = 0, oldLen = oldLinks.length, newLen = newLinks.length; oldIndex < oldLen && newIndex < newLen;) {
            oldLink = oldLinks[oldIndex];
            newLink = newLinks[newIndex];
            if (range_1.Range.areIntersectingOrTouching(oldLink.range, newLink.range)) {
                // Remove the oldLink
                oldIndex++;
                continue;
            }
            comparisonResult = range_1.Range.compareRangesUsingStarts(oldLink.range, newLink.range);
            if (comparisonResult < 0) {
                // oldLink is before
                result.push(oldLink);
                oldIndex++;
            }
            else {
                // newLink is before
                result.push(newLink);
                newIndex++;
            }
        }
        for (; oldIndex < oldLen; oldIndex++) {
            result.push(oldLinks[oldIndex]);
        }
        for (; newIndex < newLen; newIndex++) {
            result.push(newLinks[newIndex]);
        }
        return result;
    }
    commands_1.CommandsRegistry.registerCommand('_executeLinkProvider', function (accessor) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var uri = args[0];
        if (!(uri instanceof uri_1.default)) {
            return undefined;
        }
        var model = accessor.get(modelService_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        return getLinks(model);
    });
});
