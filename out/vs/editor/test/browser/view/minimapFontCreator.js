define(["require", "exports", "vs/editor/test/common/view/minimapCharRendererFactory", "vs/editor/common/view/runtimeMinimapCharRenderer", "vs/editor/common/core/rgba"], function (require, exports, minimapCharRendererFactory_1, runtimeMinimapCharRenderer_1, rgba_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var canvas = document.getElementById('my-canvas');
    var ctx = canvas.getContext('2d');
    canvas.style.height = 100 + 'px';
    canvas.height = 100;
    canvas.width = 95 /* CHAR_COUNT */ * 10 /* SAMPLED_CHAR_WIDTH */;
    canvas.style.width = (95 /* CHAR_COUNT */ * 10 /* SAMPLED_CHAR_WIDTH */) + 'px';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    for (var chCode = 32 /* START_CH_CODE */; chCode <= 126 /* END_CH_CODE */; chCode++) {
        ctx.fillText(String.fromCharCode(chCode), (chCode - 32 /* START_CH_CODE */) * 10 /* SAMPLED_CHAR_WIDTH */, 16 /* SAMPLED_CHAR_HEIGHT */);
    }
    var sampleData = ctx.getImageData(0, 4, 10 /* SAMPLED_CHAR_WIDTH */ * 95 /* CHAR_COUNT */, 16 /* SAMPLED_CHAR_HEIGHT */);
    var minimapCharRenderer = minimapCharRendererFactory_1.MinimapCharRendererFactory.create(sampleData.data);
    renderImageData(sampleData, 10, 100);
    renderMinimapCharRenderer(minimapCharRenderer, 400);
    renderMinimapCharRenderer(runtimeMinimapCharRenderer_1.getOrCreateMinimapCharRenderer(), 600);
    function createFakeImageData(width, height) {
        return {
            width: width,
            height: height,
            data: new Uint8ClampedArray(width * height * 4 /* RGBA_CHANNELS_CNT */)
        };
    }
    function renderMinimapCharRenderer(minimapCharRenderer, y) {
        var background = new rgba_1.RGBA8(0, 0, 0, 255);
        var color = new rgba_1.RGBA8(255, 255, 255, 255);
        {
            var x2 = createFakeImageData(2 /* x2_CHAR_WIDTH */ * 95 /* CHAR_COUNT */, 4 /* x2_CHAR_HEIGHT */);
            // set the background color
            for (var i = 0, len = x2.data.length / 4; i < len; i++) {
                x2.data[4 * i + 0] = background.r;
                x2.data[4 * i + 1] = background.g;
                x2.data[4 * i + 2] = background.b;
                x2.data[4 * i + 3] = 255;
            }
            var dx = 0;
            for (var chCode = 32 /* START_CH_CODE */; chCode <= 126 /* END_CH_CODE */; chCode++) {
                minimapCharRenderer.x2RenderChar(x2, dx, 0, chCode, color, background, false);
                dx += 2 /* x2_CHAR_WIDTH */;
            }
            renderImageData(x2, 10, y);
        }
        {
            var x1 = createFakeImageData(1 /* x1_CHAR_WIDTH */ * 95 /* CHAR_COUNT */, 2 /* x1_CHAR_HEIGHT */);
            // set the background color
            for (var i = 0, len = x1.data.length / 4; i < len; i++) {
                x1.data[4 * i + 0] = background.r;
                x1.data[4 * i + 1] = background.g;
                x1.data[4 * i + 2] = background.b;
                x1.data[4 * i + 3] = 255;
            }
            var dx = 0;
            for (var chCode = 32 /* START_CH_CODE */; chCode <= 126 /* END_CH_CODE */; chCode++) {
                minimapCharRenderer.x1RenderChar(x1, dx, 0, chCode, color, background, false);
                dx += 1 /* x1_CHAR_WIDTH */;
            }
            renderImageData(x1, 10, y + 100);
        }
    }
    (function () {
        var r = 'let x2Data = [', offset = 0;
        for (var charIndex = 0; charIndex < 95 /* CHAR_COUNT */; charIndex++) {
            var charCode = charIndex + 32 /* START_CH_CODE */;
            r += '\n\n// ' + String.fromCharCode(charCode);
            for (var i = 0; i < 4 /* x2_CHAR_HEIGHT */ * 2 /* x2_CHAR_WIDTH */; i++) {
                if (i % 2 === 0) {
                    r += '\n';
                }
                r += minimapCharRenderer.x2charData[offset] + ',';
                offset++;
            }
        }
        r += '\n\n]';
        console.log(r);
    })();
    (function () {
        var r = 'let x1Data = [', offset = 0;
        for (var charIndex = 0; charIndex < 95 /* CHAR_COUNT */; charIndex++) {
            var charCode = charIndex + 32 /* START_CH_CODE */;
            r += '\n\n// ' + String.fromCharCode(charCode);
            for (var i = 0; i < 2 /* x1_CHAR_HEIGHT */ * 1 /* x1_CHAR_WIDTH */; i++) {
                r += '\n';
                r += minimapCharRenderer.x1charData[offset] + ',';
                offset++;
            }
        }
        r += '\n\n]';
        console.log(r);
    })();
    function renderImageData(imageData, left, top) {
        var output = '';
        var offset = 0;
        var PX_SIZE = 15;
        for (var i = 0; i < imageData.height; i++) {
            for (var j = 0; j < imageData.width; j++) {
                var R = imageData.data[offset];
                var G = imageData.data[offset + 1];
                var B = imageData.data[offset + 2];
                var A = imageData.data[offset + 3];
                offset += 4;
                output += "<div style=\"position:absolute;top:" + PX_SIZE * i + "px;left:" + PX_SIZE * j + "px;width:" + PX_SIZE + "px;height:" + PX_SIZE + "px;background:rgba(" + R + "," + G + "," + B + "," + A / 256 + ")\"></div>";
            }
        }
        var domNode = document.createElement('div');
        domNode.style.position = 'absolute';
        domNode.style.top = top + 'px';
        domNode.style.left = left + 'px';
        domNode.style.width = (imageData.width * PX_SIZE) + 'px';
        domNode.style.height = (imageData.height * PX_SIZE) + 'px';
        domNode.style.border = '1px solid #ccc';
        domNode.style.background = '#000000';
        domNode.innerHTML = output;
        document.body.appendChild(domNode);
    }
});
