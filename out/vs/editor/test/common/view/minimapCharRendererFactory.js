define(["require", "exports", "vs/editor/common/view/minimapCharRenderer"], function (require, exports, minimapCharRenderer_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var InternalConstants;
    (function (InternalConstants) {
        InternalConstants[InternalConstants["CA_CHANNELS_CNT"] = 2] = "CA_CHANNELS_CNT";
    })(InternalConstants || (InternalConstants = {}));
    var MinimapCharRendererFactory = /** @class */ (function () {
        function MinimapCharRendererFactory() {
        }
        MinimapCharRendererFactory.create = function (source) {
            var expectedLength = (16 /* SAMPLED_CHAR_HEIGHT */ * 10 /* SAMPLED_CHAR_WIDTH */ * 4 /* RGBA_CHANNELS_CNT */ * 95 /* CHAR_COUNT */);
            if (source.length !== expectedLength) {
                throw new Error('Unexpected source in MinimapCharRenderer');
            }
            var x2CharData = this.toGrayscale(MinimapCharRendererFactory._downsample2x(source));
            var x1CharData = this.toGrayscale(MinimapCharRendererFactory._downsample1x(source));
            return new minimapCharRenderer_1.MinimapCharRenderer(x2CharData, x1CharData);
        };
        MinimapCharRendererFactory.toGrayscale = function (charData) {
            var newLength = charData.length / 2;
            var result = new Uint8ClampedArray(newLength);
            var sourceOffset = 0;
            for (var i = 0; i < newLength; i++) {
                var color = charData[sourceOffset];
                var alpha = charData[sourceOffset + 1];
                var newColor = Math.round((color * alpha) / 255);
                result[i] = newColor;
                sourceOffset += 2;
            }
            return result;
        };
        MinimapCharRendererFactory._extractSampledChar = function (source, charIndex, dest) {
            var destOffset = 0;
            for (var i = 0; i < 16 /* SAMPLED_CHAR_HEIGHT */; i++) {
                var sourceOffset = (10 /* SAMPLED_CHAR_WIDTH */ * 4 /* RGBA_CHANNELS_CNT */ * 95 /* CHAR_COUNT */ * i
                    + 10 /* SAMPLED_CHAR_WIDTH */ * 4 /* RGBA_CHANNELS_CNT */ * charIndex);
                for (var j = 0; j < 10 /* SAMPLED_CHAR_WIDTH */; j++) {
                    for (var c = 0; c < 4 /* RGBA_CHANNELS_CNT */; c++) {
                        dest[destOffset] = source[sourceOffset];
                        sourceOffset++;
                        destOffset++;
                    }
                }
            }
        };
        MinimapCharRendererFactory._downsample2xChar = function (source, dest) {
            // chars are 2 x 4px (width x height)
            var resultLen = 4 /* x2_CHAR_HEIGHT */ * 2 /* x2_CHAR_WIDTH */ * 2 /* CA_CHANNELS_CNT */;
            var result = new Uint16Array(resultLen);
            for (var i = 0; i < resultLen; i++) {
                result[i] = 0;
            }
            var inputOffset = 0, globalOutputOffset = 0;
            for (var i = 0; i < 16 /* SAMPLED_CHAR_HEIGHT */; i++) {
                var outputOffset = globalOutputOffset;
                var color = 0;
                var alpha = 0;
                for (var j = 0; j < 5 /* SAMPLED_HALF_CHAR_WIDTH */; j++) {
                    color += source[inputOffset]; // R
                    alpha += source[inputOffset + 3]; // A
                    inputOffset += 4 /* RGBA_CHANNELS_CNT */;
                }
                result[outputOffset] += color;
                result[outputOffset + 1] += alpha;
                outputOffset += 2 /* CA_CHANNELS_CNT */;
                color = 0;
                alpha = 0;
                for (var j = 0; j < 5 /* SAMPLED_HALF_CHAR_WIDTH */; j++) {
                    color += source[inputOffset]; // R
                    alpha += source[inputOffset + 3]; // A
                    inputOffset += 4 /* RGBA_CHANNELS_CNT */;
                }
                result[outputOffset] += color;
                result[outputOffset + 1] += alpha;
                outputOffset += 2 /* CA_CHANNELS_CNT */;
                if (i === 2 || i === 5 || i === 8) {
                    globalOutputOffset = outputOffset;
                }
            }
            for (var i = 0; i < resultLen; i++) {
                dest[i] = result[i] / 12; // 15 it should be
            }
        };
        MinimapCharRendererFactory._downsample2x = function (data) {
            var resultLen = 4 /* x2_CHAR_HEIGHT */ * 2 /* x2_CHAR_WIDTH */ * 2 /* CA_CHANNELS_CNT */ * 95 /* CHAR_COUNT */;
            var result = new Uint8ClampedArray(resultLen);
            var sampledChar = new Uint8ClampedArray(16 /* SAMPLED_CHAR_HEIGHT */ * 10 /* SAMPLED_CHAR_WIDTH */ * 4 /* RGBA_CHANNELS_CNT */);
            var downsampledChar = new Uint8ClampedArray(4 /* x2_CHAR_HEIGHT */ * 2 /* x2_CHAR_WIDTH */ * 2 /* CA_CHANNELS_CNT */);
            for (var charIndex = 0; charIndex < 95 /* CHAR_COUNT */; charIndex++) {
                this._extractSampledChar(data, charIndex, sampledChar);
                this._downsample2xChar(sampledChar, downsampledChar);
                var resultOffset = (4 /* x2_CHAR_HEIGHT */ * 2 /* x2_CHAR_WIDTH */ * 2 /* CA_CHANNELS_CNT */ * charIndex);
                for (var i = 0; i < downsampledChar.length; i++) {
                    result[resultOffset + i] = downsampledChar[i];
                }
            }
            return result;
        };
        MinimapCharRendererFactory._downsample1xChar = function (source, dest) {
            // chars are 1 x 2px (width x height)
            var resultLen = 2 /* x1_CHAR_HEIGHT */ * 1 /* x1_CHAR_WIDTH */ * 2 /* CA_CHANNELS_CNT */;
            var result = new Uint16Array(resultLen);
            for (var i = 0; i < resultLen; i++) {
                result[i] = 0;
            }
            var inputOffset = 0, globalOutputOffset = 0;
            for (var i = 0; i < 16 /* SAMPLED_CHAR_HEIGHT */; i++) {
                var outputOffset = globalOutputOffset;
                var color = 0;
                var alpha = 0;
                for (var j = 0; j < 10 /* SAMPLED_CHAR_WIDTH */; j++) {
                    color += source[inputOffset]; // R
                    alpha += source[inputOffset + 3]; // A
                    inputOffset += 4 /* RGBA_CHANNELS_CNT */;
                }
                result[outputOffset] += color;
                result[outputOffset + 1] += alpha;
                outputOffset += 2 /* CA_CHANNELS_CNT */;
                if (i === 5) {
                    globalOutputOffset = outputOffset;
                }
            }
            for (var i = 0; i < resultLen; i++) {
                dest[i] = result[i] / 50; // 60 it should be
            }
        };
        MinimapCharRendererFactory._downsample1x = function (data) {
            var resultLen = 2 /* x1_CHAR_HEIGHT */ * 1 /* x1_CHAR_WIDTH */ * 2 /* CA_CHANNELS_CNT */ * 95 /* CHAR_COUNT */;
            var result = new Uint8ClampedArray(resultLen);
            var sampledChar = new Uint8ClampedArray(16 /* SAMPLED_CHAR_HEIGHT */ * 10 /* SAMPLED_CHAR_WIDTH */ * 4 /* RGBA_CHANNELS_CNT */);
            var downsampledChar = new Uint8ClampedArray(2 /* x1_CHAR_HEIGHT */ * 1 /* x1_CHAR_WIDTH */ * 2 /* CA_CHANNELS_CNT */);
            for (var charIndex = 0; charIndex < 95 /* CHAR_COUNT */; charIndex++) {
                this._extractSampledChar(data, charIndex, sampledChar);
                this._downsample1xChar(sampledChar, downsampledChar);
                var resultOffset = (2 /* x1_CHAR_HEIGHT */ * 1 /* x1_CHAR_WIDTH */ * 2 /* CA_CHANNELS_CNT */ * charIndex);
                for (var i = 0; i < downsampledChar.length; i++) {
                    result[resultOffset + i] = downsampledChar[i];
                }
            }
            return result;
        };
        return MinimapCharRendererFactory;
    }());
    exports.MinimapCharRendererFactory = MinimapCharRendererFactory;
});
