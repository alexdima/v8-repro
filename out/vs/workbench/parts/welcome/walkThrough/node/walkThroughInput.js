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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/strings", "vs/base/common/winjs.base", "vs/workbench/common/editor", "vs/base/common/lifecycle", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/services/resolverService", "vs/base/common/marked/marked", "vs/base/common/network", "vs/workbench/services/hash/common/hashService"], function (require, exports, strings, winjs_base_1, editor_1, lifecycle_1, telemetryUtils_1, resolverService_1, marked_1, network_1, hashService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WalkThroughModel = /** @class */ (function (_super) {
        __extends(WalkThroughModel, _super);
        function WalkThroughModel(mainRef, snippetRefs) {
            var _this = _super.call(this) || this;
            _this.mainRef = mainRef;
            _this.snippetRefs = snippetRefs;
            return _this;
        }
        Object.defineProperty(WalkThroughModel.prototype, "main", {
            get: function () {
                return this.mainRef.object;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WalkThroughModel.prototype, "snippets", {
            get: function () {
                return this.snippetRefs.map(function (snippet) { return snippet.object; });
            },
            enumerable: true,
            configurable: true
        });
        WalkThroughModel.prototype.dispose = function () {
            this.snippetRefs.forEach(function (ref) { return ref.dispose(); });
            this.mainRef.dispose();
            _super.prototype.dispose.call(this);
        };
        return WalkThroughModel;
    }(editor_1.EditorModel));
    exports.WalkThroughModel = WalkThroughModel;
    var WalkThroughInput = /** @class */ (function (_super) {
        __extends(WalkThroughInput, _super);
        function WalkThroughInput(options, textModelResolverService, hashService) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.textModelResolverService = textModelResolverService;
            _this.hashService = hashService;
            _this.disposables = [];
            _this.maxTopScroll = 0;
            _this.maxBottomScroll = 0;
            return _this;
        }
        WalkThroughInput.prototype.getResource = function () {
            return this.options.resource;
        };
        WalkThroughInput.prototype.getTypeId = function () {
            return this.options.typeId;
        };
        WalkThroughInput.prototype.getName = function () {
            return this.options.name;
        };
        WalkThroughInput.prototype.getDescription = function () {
            return this.options.description || '';
        };
        WalkThroughInput.prototype.getTelemetryFrom = function () {
            return this.options.telemetryFrom;
        };
        WalkThroughInput.prototype.getTelemetryDescriptor = function () {
            var _this = this;
            var descriptor = _super.prototype.getTelemetryDescriptor.call(this);
            descriptor['target'] = this.getTelemetryFrom();
            descriptor['resource'] = telemetryUtils_1.telemetryURIDescriptor(this.options.resource, function (path) { return _this.hashService.createSHA1(path); });
            /* __GDPR__FRAGMENT__
                "EditorTelemetryDescriptor" : {
                    "target" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "resource": { "${inline}": [ "${URIDescriptor}" ] }
                }
            */
            return descriptor;
        };
        Object.defineProperty(WalkThroughInput.prototype, "onReady", {
            get: function () {
                return this.options.onReady;
            },
            enumerable: true,
            configurable: true
        });
        WalkThroughInput.prototype.resolve = function (refresh) {
            var _this = this;
            if (!this.promise) {
                this.promise = this.textModelResolverService.createModelReference(this.options.resource)
                    .then(function (ref) {
                    if (strings.endsWith(_this.getResource().path, '.html')) {
                        return new WalkThroughModel(ref, []);
                    }
                    var snippets = [];
                    var i = 0;
                    var renderer = new marked_1.marked.Renderer();
                    renderer.code = function (code, lang) {
                        var resource = _this.options.resource.with({ scheme: network_1.Schemas.walkThroughSnippet, fragment: i++ + "." + lang });
                        snippets.push(_this.textModelResolverService.createModelReference(resource));
                        return '';
                    };
                    var markdown = ref.object.textEditorModel.getLinesContent().join('\n');
                    marked_1.marked(markdown, { renderer: renderer });
                    return winjs_base_1.TPromise.join(snippets)
                        .then(function (refs) { return new WalkThroughModel(ref, refs); });
                });
            }
            return this.promise;
        };
        WalkThroughInput.prototype.matches = function (otherInput) {
            if (_super.prototype.matches.call(this, otherInput) === true) {
                return true;
            }
            if (otherInput instanceof WalkThroughInput) {
                var otherResourceEditorInput = otherInput;
                // Compare by properties
                return otherResourceEditorInput.options.resource.toString() === this.options.resource.toString();
            }
            return false;
        };
        WalkThroughInput.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            if (this.promise) {
                this.promise.then(function (model) { return model.dispose(); });
                this.promise = null;
            }
            _super.prototype.dispose.call(this);
        };
        WalkThroughInput.prototype.relativeScrollPosition = function (topScroll, bottomScroll) {
            this.maxTopScroll = Math.max(this.maxTopScroll, topScroll);
            this.maxBottomScroll = Math.max(this.maxBottomScroll, bottomScroll);
        };
        WalkThroughInput = __decorate([
            __param(1, resolverService_1.ITextModelService),
            __param(2, hashService_1.IHashService)
        ], WalkThroughInput);
        return WalkThroughInput;
    }(editor_1.EditorInput));
    exports.WalkThroughInput = WalkThroughInput;
});
