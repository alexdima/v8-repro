/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/color"], function (require, exports, assert, color_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Color', function () {
        test('isLighterColor', function () {
            var color1 = new color_1.Color(new color_1.HSLA(60, 1, 0.5, 1)), color2 = new color_1.Color(new color_1.HSLA(0, 0, 0.753, 1));
            assert.ok(color1.isLighterThan(color2));
            // Abyss theme
            assert.ok(color_1.Color.fromHex('#770811').isLighterThan(color_1.Color.fromHex('#000c18')));
        });
        test('getLighterColor', function () {
            var color1 = new color_1.Color(new color_1.HSLA(60, 1, 0.5, 1)), color2 = new color_1.Color(new color_1.HSLA(0, 0, 0.753, 1));
            assert.deepEqual(color1.hsla, color_1.Color.getLighterColor(color1, color2).hsla);
            assert.deepEqual(new color_1.HSLA(0, 0, 0.916, 1), color_1.Color.getLighterColor(color2, color1).hsla);
            assert.deepEqual(new color_1.HSLA(0, 0, 0.851, 1), color_1.Color.getLighterColor(color2, color1, 0.3).hsla);
            assert.deepEqual(new color_1.HSLA(0, 0, 0.981, 1), color_1.Color.getLighterColor(color2, color1, 0.7).hsla);
            assert.deepEqual(new color_1.HSLA(0, 0, 1, 1), color_1.Color.getLighterColor(color2, color1, 1).hsla);
        });
        test('isDarkerColor', function () {
            var color1 = new color_1.Color(new color_1.HSLA(60, 1, 0.5, 1)), color2 = new color_1.Color(new color_1.HSLA(0, 0, 0.753, 1));
            assert.ok(color2.isDarkerThan(color1));
        });
        test('getDarkerColor', function () {
            var color1 = new color_1.Color(new color_1.HSLA(60, 1, 0.5, 1)), color2 = new color_1.Color(new color_1.HSLA(0, 0, 0.753, 1));
            assert.deepEqual(color2.hsla, color_1.Color.getDarkerColor(color2, color1).hsla);
            assert.deepEqual(new color_1.HSLA(60, 1, 0.392, 1), color_1.Color.getDarkerColor(color1, color2).hsla);
            assert.deepEqual(new color_1.HSLA(60, 1, 0.435, 1), color_1.Color.getDarkerColor(color1, color2, 0.3).hsla);
            assert.deepEqual(new color_1.HSLA(60, 1, 0.349, 1), color_1.Color.getDarkerColor(color1, color2, 0.7).hsla);
            assert.deepEqual(new color_1.HSLA(60, 1, 0.284, 1), color_1.Color.getDarkerColor(color1, color2, 1).hsla);
            // Abyss theme
            assert.deepEqual(new color_1.HSLA(355, 0.874, 0.157, 1), color_1.Color.getDarkerColor(color_1.Color.fromHex('#770811'), color_1.Color.fromHex('#000c18'), 0.4).hsla);
        });
        test('luminance', function () {
            assert.deepEqual(0, new color_1.Color(new color_1.RGBA(0, 0, 0, 1)).getRelativeLuminance());
            assert.deepEqual(1, new color_1.Color(new color_1.RGBA(255, 255, 255, 1)).getRelativeLuminance());
            assert.deepEqual(0.2126, new color_1.Color(new color_1.RGBA(255, 0, 0, 1)).getRelativeLuminance());
            assert.deepEqual(0.7152, new color_1.Color(new color_1.RGBA(0, 255, 0, 1)).getRelativeLuminance());
            assert.deepEqual(0.0722, new color_1.Color(new color_1.RGBA(0, 0, 255, 1)).getRelativeLuminance());
            assert.deepEqual(0.9278, new color_1.Color(new color_1.RGBA(255, 255, 0, 1)).getRelativeLuminance());
            assert.deepEqual(0.7874, new color_1.Color(new color_1.RGBA(0, 255, 255, 1)).getRelativeLuminance());
            assert.deepEqual(0.2848, new color_1.Color(new color_1.RGBA(255, 0, 255, 1)).getRelativeLuminance());
            assert.deepEqual(0.5271, new color_1.Color(new color_1.RGBA(192, 192, 192, 1)).getRelativeLuminance());
            assert.deepEqual(0.2159, new color_1.Color(new color_1.RGBA(128, 128, 128, 1)).getRelativeLuminance());
            assert.deepEqual(0.0459, new color_1.Color(new color_1.RGBA(128, 0, 0, 1)).getRelativeLuminance());
            assert.deepEqual(0.2003, new color_1.Color(new color_1.RGBA(128, 128, 0, 1)).getRelativeLuminance());
            assert.deepEqual(0.1544, new color_1.Color(new color_1.RGBA(0, 128, 0, 1)).getRelativeLuminance());
            assert.deepEqual(0.0615, new color_1.Color(new color_1.RGBA(128, 0, 128, 1)).getRelativeLuminance());
            assert.deepEqual(0.17, new color_1.Color(new color_1.RGBA(0, 128, 128, 1)).getRelativeLuminance());
            assert.deepEqual(0.0156, new color_1.Color(new color_1.RGBA(0, 0, 128, 1)).getRelativeLuminance());
        });
        test('blending', function () {
            assert.deepEqual(new color_1.Color(new color_1.RGBA(0, 0, 0, 0)).blend(new color_1.Color(new color_1.RGBA(243, 34, 43))), new color_1.Color(new color_1.RGBA(243, 34, 43)));
            assert.deepEqual(new color_1.Color(new color_1.RGBA(255, 255, 255)).blend(new color_1.Color(new color_1.RGBA(243, 34, 43))), new color_1.Color(new color_1.RGBA(255, 255, 255)));
            assert.deepEqual(new color_1.Color(new color_1.RGBA(122, 122, 122, 0.7)).blend(new color_1.Color(new color_1.RGBA(243, 34, 43))), new color_1.Color(new color_1.RGBA(158, 95, 98)));
            assert.deepEqual(new color_1.Color(new color_1.RGBA(0, 0, 0, 0.58)).blend(new color_1.Color(new color_1.RGBA(255, 255, 255, 0.33))), new color_1.Color(new color_1.RGBA(49, 49, 49, 0.719)));
        });
        suite('HSLA', function () {
            test('HSLA.toRGBA', function () {
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(0, 0, 0, 0)), new color_1.RGBA(0, 0, 0, 0));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(0, 0, 0, 1)), new color_1.RGBA(0, 0, 0, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(0, 0, 1, 1)), new color_1.RGBA(255, 255, 255, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(0, 1, 0.5, 1)), new color_1.RGBA(255, 0, 0, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(120, 1, 0.5, 1)), new color_1.RGBA(0, 255, 0, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(240, 1, 0.5, 1)), new color_1.RGBA(0, 0, 255, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(60, 1, 0.5, 1)), new color_1.RGBA(255, 255, 0, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(180, 1, 0.5, 1)), new color_1.RGBA(0, 255, 255, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(300, 1, 0.5, 1)), new color_1.RGBA(255, 0, 255, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(0, 0, 0.753, 1)), new color_1.RGBA(192, 192, 192, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(0, 0, 0.502, 1)), new color_1.RGBA(128, 128, 128, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(0, 1, 0.251, 1)), new color_1.RGBA(128, 0, 0, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(60, 1, 0.251, 1)), new color_1.RGBA(128, 128, 0, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(120, 1, 0.251, 1)), new color_1.RGBA(0, 128, 0, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(300, 1, 0.251, 1)), new color_1.RGBA(128, 0, 128, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(180, 1, 0.251, 1)), new color_1.RGBA(0, 128, 128, 1));
                assert.deepEqual(color_1.HSLA.toRGBA(new color_1.HSLA(240, 1, 0.251, 1)), new color_1.RGBA(0, 0, 128, 1));
            });
            test('HSLA.fromRGBA', function () {
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(0, 0, 0, 0)), new color_1.HSLA(0, 0, 0, 0));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(0, 0, 0, 1)), new color_1.HSLA(0, 0, 0, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(255, 255, 255, 1)), new color_1.HSLA(0, 0, 1, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(255, 0, 0, 1)), new color_1.HSLA(0, 1, 0.5, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(0, 255, 0, 1)), new color_1.HSLA(120, 1, 0.5, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(0, 0, 255, 1)), new color_1.HSLA(240, 1, 0.5, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(255, 255, 0, 1)), new color_1.HSLA(60, 1, 0.5, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(0, 255, 255, 1)), new color_1.HSLA(180, 1, 0.5, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(255, 0, 255, 1)), new color_1.HSLA(300, 1, 0.5, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(192, 192, 192, 1)), new color_1.HSLA(0, 0, 0.753, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(128, 128, 128, 1)), new color_1.HSLA(0, 0, 0.502, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(128, 0, 0, 1)), new color_1.HSLA(0, 1, 0.251, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(128, 128, 0, 1)), new color_1.HSLA(60, 1, 0.251, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(0, 128, 0, 1)), new color_1.HSLA(120, 1, 0.251, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(128, 0, 128, 1)), new color_1.HSLA(300, 1, 0.251, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(0, 128, 128, 1)), new color_1.HSLA(180, 1, 0.251, 1));
                assert.deepEqual(color_1.HSLA.fromRGBA(new color_1.RGBA(0, 0, 128, 1)), new color_1.HSLA(240, 1, 0.251, 1));
            });
        });
        suite('HSVA', function () {
            test('HSVA.toRGBA', function () {
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(0, 0, 0, 0)), new color_1.RGBA(0, 0, 0, 0));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(0, 0, 0, 1)), new color_1.RGBA(0, 0, 0, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(0, 0, 1, 1)), new color_1.RGBA(255, 255, 255, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(0, 1, 1, 1)), new color_1.RGBA(255, 0, 0, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(120, 1, 1, 1)), new color_1.RGBA(0, 255, 0, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(240, 1, 1, 1)), new color_1.RGBA(0, 0, 255, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(60, 1, 1, 1)), new color_1.RGBA(255, 255, 0, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(180, 1, 1, 1)), new color_1.RGBA(0, 255, 255, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(300, 1, 1, 1)), new color_1.RGBA(255, 0, 255, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(0, 0, 0.753, 1)), new color_1.RGBA(192, 192, 192, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(0, 0, 0.502, 1)), new color_1.RGBA(128, 128, 128, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(0, 1, 0.502, 1)), new color_1.RGBA(128, 0, 0, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(60, 1, 0.502, 1)), new color_1.RGBA(128, 128, 0, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(120, 1, 0.502, 1)), new color_1.RGBA(0, 128, 0, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(300, 1, 0.502, 1)), new color_1.RGBA(128, 0, 128, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(180, 1, 0.502, 1)), new color_1.RGBA(0, 128, 128, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(240, 1, 0.502, 1)), new color_1.RGBA(0, 0, 128, 1));
            });
            test('HSVA.fromRGBA', function () {
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(0, 0, 0, 0)), new color_1.HSVA(0, 0, 0, 0));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(0, 0, 0, 1)), new color_1.HSVA(0, 0, 0, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(255, 255, 255, 1)), new color_1.HSVA(0, 0, 1, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(255, 0, 0, 1)), new color_1.HSVA(0, 1, 1, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(0, 255, 0, 1)), new color_1.HSVA(120, 1, 1, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(0, 0, 255, 1)), new color_1.HSVA(240, 1, 1, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(255, 255, 0, 1)), new color_1.HSVA(60, 1, 1, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(0, 255, 255, 1)), new color_1.HSVA(180, 1, 1, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(255, 0, 255, 1)), new color_1.HSVA(300, 1, 1, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(192, 192, 192, 1)), new color_1.HSVA(0, 0, 0.753, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(128, 128, 128, 1)), new color_1.HSVA(0, 0, 0.502, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(128, 0, 0, 1)), new color_1.HSVA(0, 1, 0.502, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(128, 128, 0, 1)), new color_1.HSVA(60, 1, 0.502, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(0, 128, 0, 1)), new color_1.HSVA(120, 1, 0.502, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(128, 0, 128, 1)), new color_1.HSVA(300, 1, 0.502, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(0, 128, 128, 1)), new color_1.HSVA(180, 1, 0.502, 1));
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(0, 0, 128, 1)), new color_1.HSVA(240, 1, 0.502, 1));
            });
            test('Keep hue value when saturation is 0', function () {
                assert.deepEqual(color_1.HSVA.toRGBA(new color_1.HSVA(10, 0, 0, 0)), color_1.HSVA.toRGBA(new color_1.HSVA(20, 0, 0, 0)));
                assert.deepEqual(new color_1.Color(new color_1.HSVA(10, 0, 0, 0)).rgba, new color_1.Color(new color_1.HSVA(20, 0, 0, 0)).rgba);
                assert.notDeepEqual(new color_1.Color(new color_1.HSVA(10, 0, 0, 0)).hsva, new color_1.Color(new color_1.HSVA(20, 0, 0, 0)).hsva);
            });
            test('bug#36240', function () {
                assert.deepEqual(color_1.HSVA.fromRGBA(new color_1.RGBA(92, 106, 196, 1)), new color_1.HSVA(232, .531, .769, 1));
                assert.deepEqual(color_1.HSVA.toRGBA(color_1.HSVA.fromRGBA(new color_1.RGBA(92, 106, 196, 1))), new color_1.RGBA(92, 106, 196, 1));
            });
        });
        suite('Format', function () {
            suite('CSS', function () {
                test('parseHex', function () {
                    // invalid
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex(null), null);
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex(''), null);
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#'), null);
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#0102030'), null);
                    // somewhat valid
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#FFFFG0').rgba, new color_1.RGBA(255, 255, 0, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#FFFFg0').rgba, new color_1.RGBA(255, 255, 0, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#-FFF00').rgba, new color_1.RGBA(15, 255, 0, 1));
                    // valid
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#000000').rgba, new color_1.RGBA(0, 0, 0, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#FFFFFF').rgba, new color_1.RGBA(255, 255, 255, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#FF0000').rgba, new color_1.RGBA(255, 0, 0, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#00FF00').rgba, new color_1.RGBA(0, 255, 0, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#0000FF').rgba, new color_1.RGBA(0, 0, 255, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#FFFF00').rgba, new color_1.RGBA(255, 255, 0, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#00FFFF').rgba, new color_1.RGBA(0, 255, 255, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#FF00FF').rgba, new color_1.RGBA(255, 0, 255, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#C0C0C0').rgba, new color_1.RGBA(192, 192, 192, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#808080').rgba, new color_1.RGBA(128, 128, 128, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#800000').rgba, new color_1.RGBA(128, 0, 0, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#808000').rgba, new color_1.RGBA(128, 128, 0, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#008000').rgba, new color_1.RGBA(0, 128, 0, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#800080').rgba, new color_1.RGBA(128, 0, 128, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#008080').rgba, new color_1.RGBA(0, 128, 128, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#000080').rgba, new color_1.RGBA(0, 0, 128, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#010203').rgba, new color_1.RGBA(1, 2, 3, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#040506').rgba, new color_1.RGBA(4, 5, 6, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#070809').rgba, new color_1.RGBA(7, 8, 9, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#0a0A0a').rgba, new color_1.RGBA(10, 10, 10, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#0b0B0b').rgba, new color_1.RGBA(11, 11, 11, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#0c0C0c').rgba, new color_1.RGBA(12, 12, 12, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#0d0D0d').rgba, new color_1.RGBA(13, 13, 13, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#0e0E0e').rgba, new color_1.RGBA(14, 14, 14, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#0f0F0f').rgba, new color_1.RGBA(15, 15, 15, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#a0A0a0').rgba, new color_1.RGBA(160, 160, 160, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#CFA').rgba, new color_1.RGBA(204, 255, 170, 1));
                    assert.deepEqual(color_1.Color.Format.CSS.parseHex('#CFA8').rgba, new color_1.RGBA(204, 255, 170, 0.533));
                });
            });
        });
    });
});
