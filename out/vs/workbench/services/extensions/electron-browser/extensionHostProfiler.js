/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/base/common/winjs.base", "vs/base/common/map", "vs/base/node/extfs"], function (require, exports, extensions_1, winjs_base_1, map_1, extfs_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtensionHostProfiler = /** @class */ (function () {
        function ExtensionHostProfiler(_port, _extensionService) {
            this._port = _port;
            this._extensionService = _extensionService;
        }
        ExtensionHostProfiler.prototype.start = function () {
            var _this = this;
            return winjs_base_1.TPromise.wrap(new Promise(function (resolve_1, reject_1) { require(['v8-inspect-profiler'], resolve_1, reject_1); })).then(function (profiler) {
                return profiler.startProfiling({ port: _this._port }).then(function (session) {
                    return {
                        stop: function () {
                            return winjs_base_1.TPromise.wrap(session.stop()).then(function (profile) {
                                return _this._extensionService.getExtensions().then(function (extensions) {
                                    return _this.distill(profile.profile, extensions);
                                });
                            });
                        }
                    };
                });
            });
        };
        ExtensionHostProfiler.prototype.distill = function (profile, extensions) {
            var searchTree = map_1.TernarySearchTree.forPaths();
            for (var _i = 0, extensions_2 = extensions; _i < extensions_2.length; _i++) {
                var extension = extensions_2[_i];
                searchTree.set(extfs_1.realpathSync(extension.extensionFolderPath), extension);
            }
            var nodes = profile.nodes;
            var idsToNodes = new Map();
            var idsToSegmentId = new Map();
            for (var _a = 0, nodes_1 = nodes; _a < nodes_1.length; _a++) {
                var node = nodes_1[_a];
                idsToNodes.set(node.id, node);
            }
            function visit(node, segmentId) {
                if (!segmentId) {
                    switch (node.callFrame.functionName) {
                        case '(root)':
                            break;
                        case '(program)':
                            segmentId = 'program';
                            break;
                        case '(garbage collector)':
                            segmentId = 'gc';
                            break;
                        default:
                            segmentId = 'self';
                            break;
                    }
                }
                else if (segmentId === 'self' && node.callFrame.url) {
                    var extension = searchTree.findSubstr(node.callFrame.url);
                    if (extension) {
                        segmentId = extension.id;
                    }
                }
                idsToSegmentId.set(node.id, segmentId);
                if (node.children) {
                    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                        var child = _a[_i];
                        visit(idsToNodes.get(child), segmentId);
                    }
                }
            }
            visit(nodes[0], null);
            var samples = profile.samples;
            var timeDeltas = profile.timeDeltas;
            var distilledDeltas = [];
            var distilledIds = [];
            var currSegmentTime = 0;
            var currSegmentId = void 0;
            for (var i = 0; i < samples.length; i++) {
                var id = samples[i];
                var segmentId = idsToSegmentId.get(id);
                if (segmentId !== currSegmentId) {
                    if (currSegmentId) {
                        distilledIds.push(currSegmentId);
                        distilledDeltas.push(currSegmentTime);
                    }
                    currSegmentId = segmentId;
                    currSegmentTime = 0;
                }
                currSegmentTime += timeDeltas[i];
            }
            if (currSegmentId) {
                distilledIds.push(currSegmentId);
                distilledDeltas.push(currSegmentTime);
            }
            idsToNodes = null;
            idsToSegmentId = null;
            searchTree = null;
            return {
                startTime: profile.startTime,
                endTime: profile.endTime,
                deltas: distilledDeltas,
                ids: distilledIds,
                data: profile,
                getAggregatedTimes: function () {
                    var segmentsToTime = new Map();
                    for (var i = 0; i < distilledIds.length; i++) {
                        var id = distilledIds[i];
                        segmentsToTime.set(id, (segmentsToTime.get(id) || 0) + distilledDeltas[i]);
                    }
                    return segmentsToTime;
                }
            };
        };
        ExtensionHostProfiler = __decorate([
            __param(1, extensions_1.IExtensionService)
        ], ExtensionHostProfiler);
        return ExtensionHostProfiler;
    }());
    exports.ExtensionHostProfiler = ExtensionHostProfiler;
});
