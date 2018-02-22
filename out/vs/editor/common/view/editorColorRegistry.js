/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/color"], function (require, exports, nls, colorRegistry_1, themeService_1, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Definition of the editor colors
     */
    exports.editorLineHighlight = colorRegistry_1.registerColor('editor.lineHighlightBackground', { dark: null, light: null, hc: null }, nls.localize('lineHighlight', 'Background color for the highlight of line at the cursor position.'));
    exports.editorLineHighlightBorder = colorRegistry_1.registerColor('editor.lineHighlightBorder', { dark: '#282828', light: '#eeeeee', hc: '#f38518' }, nls.localize('lineHighlightBorderBox', 'Background color for the border around the line at the cursor position.'));
    exports.editorRangeHighlight = colorRegistry_1.registerColor('editor.rangeHighlightBackground', { dark: '#ffffff0b', light: '#fdff0033', hc: null }, nls.localize('rangeHighlight', 'Background color of highlighted ranges, like by quick open and find features. The color must not be opaque to not hide underlying decorations.'), true);
    exports.editorRangeHighlightBorder = colorRegistry_1.registerColor('editor.rangeHighlightBorder', { dark: null, light: null, hc: colorRegistry_1.activeContrastBorder }, nls.localize('rangeHighlightBorder', 'Background color of the border around highlighted ranges.'), true);
    exports.editorCursorForeground = colorRegistry_1.registerColor('editorCursor.foreground', { dark: '#AEAFAD', light: color_1.Color.black, hc: color_1.Color.white }, nls.localize('caret', 'Color of the editor cursor.'));
    exports.editorCursorBackground = colorRegistry_1.registerColor('editorCursor.background', null, nls.localize('editorCursorBackground', 'The background color of the editor cursor. Allows customizing the color of a character overlapped by a block cursor.'));
    exports.editorWhitespaces = colorRegistry_1.registerColor('editorWhitespace.foreground', { dark: '#e3e4e229', light: '#33333333', hc: '#e3e4e229' }, nls.localize('editorWhitespaces', 'Color of whitespace characters in the editor.'));
    exports.editorIndentGuides = colorRegistry_1.registerColor('editorIndentGuide.background', { dark: exports.editorWhitespaces, light: exports.editorWhitespaces, hc: exports.editorWhitespaces }, nls.localize('editorIndentGuides', 'Color of the editor indentation guides.'));
    exports.editorLineNumbers = colorRegistry_1.registerColor('editorLineNumber.foreground', { dark: '#5A5A5A', light: '#2B91AF', hc: color_1.Color.white }, nls.localize('editorLineNumbers', 'Color of editor line numbers.'));
    exports.editorRuler = colorRegistry_1.registerColor('editorRuler.foreground', { dark: '#5A5A5A', light: color_1.Color.lightgrey, hc: color_1.Color.white }, nls.localize('editorRuler', 'Color of the editor rulers.'));
    exports.editorCodeLensForeground = colorRegistry_1.registerColor('editorCodeLens.foreground', { dark: '#999999', light: '#999999', hc: '#999999' }, nls.localize('editorCodeLensForeground', 'Foreground color of editor code lenses'));
    exports.editorBracketMatchBackground = colorRegistry_1.registerColor('editorBracketMatch.background', { dark: '#0064001a', light: '#0064001a', hc: '#0064001a' }, nls.localize('editorBracketMatchBackground', 'Background color behind matching brackets'));
    exports.editorBracketMatchBorder = colorRegistry_1.registerColor('editorBracketMatch.border', { dark: '#888', light: '#B9B9B9', hc: '#fff' }, nls.localize('editorBracketMatchBorder', 'Color for matching brackets boxes'));
    exports.editorOverviewRulerBorder = colorRegistry_1.registerColor('editorOverviewRuler.border', { dark: '#7f7f7f4d', light: '#7f7f7f4d', hc: '#7f7f7f4d' }, nls.localize('editorOverviewRulerBorder', 'Color of the overview ruler border.'));
    exports.editorGutter = colorRegistry_1.registerColor('editorGutter.background', { dark: colorRegistry_1.editorBackground, light: colorRegistry_1.editorBackground, hc: colorRegistry_1.editorBackground }, nls.localize('editorGutter', 'Background color of the editor gutter. The gutter contains the glyph margins and the line numbers.'));
    exports.editorErrorForeground = colorRegistry_1.registerColor('editorError.foreground', { dark: '#ea4646', light: '#d60a0a', hc: null }, nls.localize('errorForeground', 'Foreground color of error squigglies in the editor.'));
    exports.editorErrorBorder = colorRegistry_1.registerColor('editorError.border', { dark: null, light: null, hc: color_1.Color.fromHex('#E47777').transparent(0.8) }, nls.localize('errorBorder', 'Border color of error squigglies in the editor.'));
    exports.editorWarningForeground = colorRegistry_1.registerColor('editorWarning.foreground', { dark: '#4d9e4d', light: '#117711', hc: null }, nls.localize('warningForeground', 'Foreground color of warning squigglies in the editor.'));
    exports.editorWarningBorder = colorRegistry_1.registerColor('editorWarning.border', { dark: null, light: null, hc: color_1.Color.fromHex('#71B771').transparent(0.8) }, nls.localize('warningBorder', 'Border color of warning squigglies in the editor.'));
    exports.editorInfoForeground = colorRegistry_1.registerColor('editorInfo.foreground', { dark: '#008000', light: '#008000', hc: null }, nls.localize('infoForeground', 'Foreground color of info squigglies in the editor.'));
    exports.editorInfoBorder = colorRegistry_1.registerColor('editorInfo.border', { dark: null, light: null, hc: color_1.Color.fromHex('#71B771').transparent(0.8) }, nls.localize('infoBorder', 'Border color of info squigglies in the editor.'));
    var rulerRangeDefault = new color_1.Color(new color_1.RGBA(0, 122, 204, 0.6));
    exports.overviewRulerRangeHighlight = colorRegistry_1.registerColor('editorOverviewRuler.rangeHighlightForeground', { dark: rulerRangeDefault, light: rulerRangeDefault, hc: rulerRangeDefault }, nls.localize('overviewRulerRangeHighlight', 'Overview ruler marker color for range highlights.'));
    exports.overviewRulerError = colorRegistry_1.registerColor('editorOverviewRuler.errorForeground', { dark: new color_1.Color(new color_1.RGBA(255, 18, 18, 0.7)), light: new color_1.Color(new color_1.RGBA(255, 18, 18, 0.7)), hc: new color_1.Color(new color_1.RGBA(255, 50, 50, 1)) }, nls.localize('overviewRuleError', 'Overview ruler marker color for errors.'));
    exports.overviewRulerWarning = colorRegistry_1.registerColor('editorOverviewRuler.warningForeground', { dark: new color_1.Color(new color_1.RGBA(18, 136, 18, 0.7)), light: new color_1.Color(new color_1.RGBA(18, 136, 18, 0.7)), hc: new color_1.Color(new color_1.RGBA(50, 255, 50, 1)) }, nls.localize('overviewRuleWarning', 'Overview ruler marker color for warnings.'));
    exports.overviewRulerInfo = colorRegistry_1.registerColor('editorOverviewRuler.infoForeground', { dark: new color_1.Color(new color_1.RGBA(18, 18, 136, 0.7)), light: new color_1.Color(new color_1.RGBA(18, 18, 136, 0.7)), hc: new color_1.Color(new color_1.RGBA(50, 50, 255, 1)) }, nls.localize('overviewRuleInfo', 'Overview ruler marker color for infos.'));
    // contains all color rules that used to defined in editor/browser/widget/editor.css
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var background = theme.getColor(colorRegistry_1.editorBackground);
        if (background) {
            collector.addRule(".monaco-editor, .monaco-editor-background, .monaco-editor .inputarea.ime-input { background-color: " + background + "; }");
        }
        var foreground = theme.getColor(colorRegistry_1.editorForeground);
        if (foreground) {
            collector.addRule(".monaco-editor, .monaco-editor .inputarea.ime-input { color: " + foreground + "; }");
        }
        var gutter = theme.getColor(exports.editorGutter);
        if (gutter) {
            collector.addRule(".monaco-editor .margin { background-color: " + gutter + "; }");
        }
        var rangeHighlight = theme.getColor(exports.editorRangeHighlight);
        if (rangeHighlight) {
            collector.addRule(".monaco-editor .rangeHighlight { background-color: " + rangeHighlight + "; }");
        }
        var rangeHighlightBorder = theme.getColor(exports.editorRangeHighlightBorder);
        if (rangeHighlightBorder) {
            collector.addRule(".monaco-editor .rangeHighlight { border: 1px dotted " + rangeHighlightBorder + "; }");
        }
        var invisibles = theme.getColor(exports.editorWhitespaces);
        if (invisibles) {
            collector.addRule(".vs-whitespace { color: " + invisibles + " !important; }");
        }
    });
});
