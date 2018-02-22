/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/platform/theme/common/colorRegistry", "vs/editor/common/view/editorColorRegistry", "vs/editor/contrib/wordHighlighter/wordHighlighter", "vs/editor/contrib/referenceSearch/referencesWidget"], function (require, exports, color_1, colorRegistry, editorColorRegistry, wordHighlighter, referencesWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var settingToColorIdMapping = {};
    function addSettingMapping(settingId, colorId) {
        var colorIds = settingToColorIdMapping[settingId];
        if (!colorIds) {
            settingToColorIdMapping[settingId] = colorIds = [];
        }
        colorIds.push(colorId);
    }
    function convertSettings(oldSettings, resultRules, resultColors) {
        for (var _i = 0, oldSettings_1 = oldSettings; _i < oldSettings_1.length; _i++) {
            var rule = oldSettings_1[_i];
            resultRules.push(rule);
            if (!rule.scope) {
                var settings = rule.settings;
                if (!settings) {
                    rule.settings = {};
                }
                else {
                    for (var key in settings) {
                        var mappings = settingToColorIdMapping[key];
                        if (mappings) {
                            var colorHex = settings[key];
                            if (typeof colorHex === 'string') {
                                var color = color_1.Color.fromHex(colorHex);
                                for (var _a = 0, mappings_1 = mappings; _a < mappings_1.length; _a++) {
                                    var colorId = mappings_1[_a];
                                    resultColors[colorId] = color;
                                }
                            }
                        }
                        if (key !== 'foreground' && key !== 'background' && key !== 'fontStyle') {
                            delete settings[key];
                        }
                    }
                }
            }
        }
    }
    exports.convertSettings = convertSettings;
    addSettingMapping('background', colorRegistry.editorBackground);
    addSettingMapping('foreground', colorRegistry.editorForeground);
    addSettingMapping('selection', colorRegistry.editorSelectionBackground);
    addSettingMapping('inactiveSelection', colorRegistry.editorInactiveSelection);
    addSettingMapping('selectionHighlightColor', colorRegistry.editorSelectionHighlight);
    addSettingMapping('findMatchHighlight', colorRegistry.editorFindMatchHighlight);
    addSettingMapping('currentFindMatchHighlight', colorRegistry.editorFindMatch);
    addSettingMapping('hoverHighlight', colorRegistry.editorHoverHighlight);
    addSettingMapping('wordHighlight', wordHighlighter.editorWordHighlight);
    addSettingMapping('wordHighlightStrong', wordHighlighter.editorWordHighlightStrong);
    addSettingMapping('findRangeHighlight', colorRegistry.editorFindRangeHighlight);
    addSettingMapping('findMatchHighlight', referencesWidget_1.peekViewResultsMatchHighlight);
    addSettingMapping('referenceHighlight', referencesWidget_1.peekViewEditorMatchHighlight);
    addSettingMapping('lineHighlight', editorColorRegistry.editorLineHighlight);
    addSettingMapping('rangeHighlight', editorColorRegistry.editorRangeHighlight);
    addSettingMapping('caret', editorColorRegistry.editorCursorForeground);
    addSettingMapping('invisibles', editorColorRegistry.editorWhitespaces);
    addSettingMapping('guide', editorColorRegistry.editorIndentGuides);
    var ansiColorMap = ['ansiBlack', 'ansiRed', 'ansiGreen', 'ansiYellow', 'ansiBlue', 'ansiMagenta', 'ansiCyan', 'ansiWhite',
        'ansiBrightBlack', 'ansiBrightRed', 'ansiBrightGreen', 'ansiBrightYellow', 'ansiBrightBlue', 'ansiBrightMagenta', 'ansiBrightCyan', 'ansiBrightWhite'
    ];
    for (var i = 0; i < ansiColorMap.length; i++) {
        addSettingMapping(ansiColorMap[i], 'terminal.' + ansiColorMap[i]);
    }
});
