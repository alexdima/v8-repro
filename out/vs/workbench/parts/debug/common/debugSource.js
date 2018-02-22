/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/base/common/paths", "vs/base/common/resources", "vs/workbench/parts/debug/common/debug", "vs/base/common/network"], function (require, exports, nls, winjs_base_1, uri_1, paths, resources, debug_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UNKNOWN_SOURCE_LABEL = nls.localize('unknownSource', "Unknown Source");
    var Source = /** @class */ (function () {
        function Source(raw, sessionId) {
            this.raw = raw;
            if (!raw) {
                this.raw = { name: UNKNOWN_SOURCE_LABEL };
            }
            this.available = this.raw.name !== UNKNOWN_SOURCE_LABEL;
            var path = this.raw.path || this.raw.name;
            if (this.raw.sourceReference > 0) {
                this.uri = uri_1.default.parse(debug_1.DEBUG_SCHEME + ":" + encodeURIComponent(path) + "?session=" + encodeURIComponent(sessionId) + "&ref=" + this.raw.sourceReference);
            }
            else {
                if (paths.isAbsolute(path)) {
                    this.uri = uri_1.default.file(path); // path should better be absolute!
                }
                else {
                    this.uri = uri_1.default.parse(path);
                }
            }
        }
        Object.defineProperty(Source.prototype, "name", {
            get: function () {
                return this.raw.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Source.prototype, "origin", {
            get: function () {
                return this.raw.origin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Source.prototype, "presentationHint", {
            get: function () {
                return this.raw.presentationHint;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Source.prototype, "reference", {
            get: function () {
                return this.raw.sourceReference;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Source.prototype, "inMemory", {
            get: function () {
                return this.uri.scheme === debug_1.DEBUG_SCHEME;
            },
            enumerable: true,
            configurable: true
        });
        Source.prototype.openInEditor = function (editorService, selection, preserveFocus, sideBySide, pinned) {
            return !this.available ? winjs_base_1.TPromise.as(null) : editorService.openEditor({
                resource: this.uri,
                description: this.origin,
                options: {
                    preserveFocus: preserveFocus,
                    selection: selection,
                    revealIfVisible: true,
                    revealInCenterIfOutsideViewport: true,
                    pinned: pinned || (!preserveFocus && !this.inMemory)
                }
            }, sideBySide);
        };
        Source.getEncodedDebugData = function (modelUri) {
            var path;
            var sourceReference;
            var processId;
            switch (modelUri.scheme) {
                case network_1.Schemas.file:
                    path = paths.normalize(modelUri.fsPath, true);
                    break;
                case debug_1.DEBUG_SCHEME:
                    path = modelUri.path;
                    if (modelUri.query) {
                        var keyvalues = modelUri.query.split('&');
                        for (var _i = 0, keyvalues_1 = keyvalues; _i < keyvalues_1.length; _i++) {
                            var keyvalue = keyvalues_1[_i];
                            var pair = keyvalue.split('=');
                            if (pair.length === 2) {
                                switch (pair[0]) {
                                    case 'session':
                                        processId = decodeURIComponent(pair[1]);
                                        break;
                                    case 'ref':
                                        sourceReference = parseInt(pair[1]);
                                        break;
                                }
                            }
                        }
                    }
                    break;
                default:
                    path = modelUri.toString();
                    break;
            }
            return {
                name: resources.basenameOrAuthority(modelUri),
                path: path,
                sourceReference: sourceReference,
                processId: processId
            };
        };
        return Source;
    }());
    exports.Source = Source;
});
