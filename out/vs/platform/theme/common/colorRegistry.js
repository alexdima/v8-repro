define(["require", "exports", "vs/platform/registry/common/platform", "vs/base/common/color", "vs/nls"], function (require, exports, platform, color_1, nls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // color registry
    exports.Extensions = {
        ColorContribution: 'base.contributions.colors'
    };
    var ColorRegistry = /** @class */ (function () {
        function ColorRegistry() {
            this.colorSchema = { type: 'object', description: nls.localize('schema.colors', "Colors used in the workbench."), properties: {}, additionalProperties: false };
            this.colorReferenceSchema = { type: 'string', enum: [], enumDescriptions: [] };
            this.colorsById = {};
        }
        ColorRegistry.prototype.registerColor = function (id, defaults, description, needsTransparency) {
            if (needsTransparency === void 0) { needsTransparency = false; }
            var colorContribution = { id: id, description: description, defaults: defaults, needsTransparency: needsTransparency };
            this.colorsById[id] = colorContribution;
            this.colorSchema.properties[id] = { type: 'string', description: description, format: 'color-hex', default: '#ff0000' };
            this.colorReferenceSchema.enum.push(id);
            this.colorReferenceSchema.enumDescriptions.push(description);
            return id;
        };
        ColorRegistry.prototype.getColors = function () {
            var _this = this;
            return Object.keys(this.colorsById).map(function (id) { return _this.colorsById[id]; });
        };
        ColorRegistry.prototype.resolveDefaultColor = function (id, theme) {
            var colorDesc = this.colorsById[id];
            if (colorDesc && colorDesc.defaults) {
                var colorValue = colorDesc.defaults[theme.type];
                return resolveColorValue(colorValue, theme);
            }
            return null;
        };
        ColorRegistry.prototype.getColorSchema = function () {
            return this.colorSchema;
        };
        ColorRegistry.prototype.getColorReferenceSchema = function () {
            return this.colorReferenceSchema;
        };
        ColorRegistry.prototype.toString = function () {
            var _this = this;
            var sorter = function (a, b) {
                var cat1 = a.indexOf('.') === -1 ? 0 : 1;
                var cat2 = b.indexOf('.') === -1 ? 0 : 1;
                if (cat1 !== cat2) {
                    return cat1 - cat2;
                }
                return a.localeCompare(b);
            };
            return Object.keys(this.colorsById).sort(sorter).map(function (k) { return "- `" + k + "`: " + _this.colorsById[k].description; }).join('\n');
        };
        return ColorRegistry;
    }());
    var colorRegistry = new ColorRegistry();
    platform.Registry.add(exports.Extensions.ColorContribution, colorRegistry);
    function registerColor(id, defaults, description, needsTransparency) {
        return colorRegistry.registerColor(id, defaults, description, needsTransparency);
    }
    exports.registerColor = registerColor;
    function getColorRegistry() {
        return colorRegistry;
    }
    exports.getColorRegistry = getColorRegistry;
    // ----- base colors
    exports.foreground = registerColor('foreground', { dark: '#CCCCCC', light: '#6C6C6C', hc: '#FFFFFF' }, nls.localize('foreground', "Overall foreground color. This color is only used if not overridden by a component."));
    exports.errorForeground = registerColor('errorForeground', { dark: '#F48771', light: '#A1260D', hc: '#F48771' }, nls.localize('errorForeground', "Overall foreground color for error messages. This color is only used if not overridden by a component."));
    exports.descriptionForeground = registerColor('descriptionForeground', { light: transparent(exports.foreground, 0.7), dark: transparent(exports.foreground, 0.7), hc: transparent(exports.foreground, 0.7) }, nls.localize('descriptionForeground', "Foreground color for description text providing additional information, for example for a label."));
    exports.focusBorder = registerColor('focusBorder', { dark: color_1.Color.fromHex('#0E639C').transparent(0.6), light: color_1.Color.fromHex('#007ACC').transparent(0.4), hc: '#F38518' }, nls.localize('focusBorder', "Overall border color for focused elements. This color is only used if not overridden by a component."));
    exports.contrastBorder = registerColor('contrastBorder', { light: null, dark: null, hc: '#6FC3DF' }, nls.localize('contrastBorder', "An extra border around elements to separate them from others for greater contrast."));
    exports.activeContrastBorder = registerColor('contrastActiveBorder', { light: null, dark: null, hc: exports.focusBorder }, nls.localize('activeContrastBorder', "An extra border around active elements to separate them from others for greater contrast."));
    exports.selectionBackground = registerColor('selection.background', { light: null, dark: null, hc: null }, nls.localize('selectionBackground', "The background color of text selections in the workbench (e.g. for input fields or text areas). Note that this does not apply to selections within the editor."));
    // ------ text colors
    exports.textSeparatorForeground = registerColor('textSeparator.foreground', { light: '#0000002e', dark: '#ffffff2e', hc: color_1.Color.black }, nls.localize('textSeparatorForeground', "Color for text separators."));
    exports.textLinkForeground = registerColor('textLink.foreground', { light: '#4080D0', dark: '#4080D0', hc: '#4080D0' }, nls.localize('textLinkForeground', "Foreground color for links in text."));
    exports.textLinkActiveForeground = registerColor('textLink.activeForeground', { light: '#4080D0', dark: '#4080D0', hc: '#4080D0' }, nls.localize('textLinkActiveForeground', "Foreground color for active links in text."));
    exports.textPreformatForeground = registerColor('textPreformat.foreground', { light: '#A31515', dark: '#D7BA7D', hc: '#D7BA7D' }, nls.localize('textPreformatForeground', "Foreground color for preformatted text segments."));
    exports.textBlockQuoteBackground = registerColor('textBlockQuote.background', { light: '#7f7f7f1a', dark: '#7f7f7f1a', hc: null }, nls.localize('textBlockQuoteBackground', "Background color for block quotes in text."));
    exports.textBlockQuoteBorder = registerColor('textBlockQuote.border', { light: '#007acc80', dark: '#007acc80', hc: color_1.Color.white }, nls.localize('textBlockQuoteBorder', "Border color for block quotes in text."));
    exports.textCodeBlockBackground = registerColor('textCodeBlock.background', { light: '#dcdcdc66', dark: '#0a0a0a66', hc: color_1.Color.black }, nls.localize('textCodeBlockBackground', "Background color for code blocks in text."));
    // ----- widgets
    exports.widgetShadow = registerColor('widget.shadow', { dark: '#000000', light: '#A8A8A8', hc: null }, nls.localize('widgetShadow', 'Shadow color of widgets such as find/replace inside the editor.'));
    exports.inputBackground = registerColor('input.background', { dark: '#3C3C3C', light: color_1.Color.white, hc: color_1.Color.black }, nls.localize('inputBoxBackground', "Input box background."));
    exports.inputForeground = registerColor('input.foreground', { dark: exports.foreground, light: exports.foreground, hc: exports.foreground }, nls.localize('inputBoxForeground', "Input box foreground."));
    exports.inputBorder = registerColor('input.border', { dark: null, light: null, hc: exports.contrastBorder }, nls.localize('inputBoxBorder', "Input box border."));
    exports.inputActiveOptionBorder = registerColor('inputOption.activeBorder', { dark: '#007ACC', light: '#007ACC', hc: exports.activeContrastBorder }, nls.localize('inputBoxActiveOptionBorder', "Border color of activated options in input fields."));
    exports.inputPlaceholderForeground = registerColor('input.placeholderForeground', { dark: null, light: null, hc: null }, nls.localize('inputPlaceholderForeground', "Input box foreground color for placeholder text."));
    exports.inputValidationInfoBackground = registerColor('inputValidation.infoBackground', { dark: '#063B49', light: '#D6ECF2', hc: color_1.Color.black }, nls.localize('inputValidationInfoBackground', "Input validation background color for information severity."));
    exports.inputValidationInfoBorder = registerColor('inputValidation.infoBorder', { dark: '#007acc', light: '#007acc', hc: exports.contrastBorder }, nls.localize('inputValidationInfoBorder', "Input validation border color for information severity."));
    exports.inputValidationWarningBackground = registerColor('inputValidation.warningBackground', { dark: '#352A05', light: '#F6F5D2', hc: color_1.Color.black }, nls.localize('inputValidationWarningBackground', "Input validation background color for information warning."));
    exports.inputValidationWarningBorder = registerColor('inputValidation.warningBorder', { dark: '#B89500', light: '#B89500', hc: exports.contrastBorder }, nls.localize('inputValidationWarningBorder', "Input validation border color for warning severity."));
    exports.inputValidationErrorBackground = registerColor('inputValidation.errorBackground', { dark: '#5A1D1D', light: '#F2DEDE', hc: color_1.Color.black }, nls.localize('inputValidationErrorBackground', "Input validation background color for error severity."));
    exports.inputValidationErrorBorder = registerColor('inputValidation.errorBorder', { dark: '#BE1100', light: '#BE1100', hc: exports.contrastBorder }, nls.localize('inputValidationErrorBorder', "Input validation border color for error severity."));
    exports.selectBackground = registerColor('dropdown.background', { dark: '#3C3C3C', light: color_1.Color.white, hc: color_1.Color.black }, nls.localize('dropdownBackground', "Dropdown background."));
    exports.selectListBackground = registerColor('dropdown.listBackground', { dark: null, light: null, hc: color_1.Color.black }, nls.localize('dropdownListBackground', "Dropdown list background."));
    exports.selectForeground = registerColor('dropdown.foreground', { dark: '#F0F0F0', light: null, hc: color_1.Color.white }, nls.localize('dropdownForeground', "Dropdown foreground."));
    exports.selectBorder = registerColor('dropdown.border', { dark: exports.selectBackground, light: '#CECECE', hc: exports.contrastBorder }, nls.localize('dropdownBorder', "Dropdown border."));
    exports.listFocusBackground = registerColor('list.focusBackground', { dark: '#073655', light: '#DCEBFC', hc: null }, nls.localize('listFocusBackground', "List/Tree background color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
    exports.listFocusForeground = registerColor('list.focusForeground', { dark: null, light: null, hc: null }, nls.localize('listFocusForeground', "List/Tree foreground color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
    exports.listActiveSelectionBackground = registerColor('list.activeSelectionBackground', { dark: '#094771', light: '#3399FF', hc: null }, nls.localize('listActiveSelectionBackground', "List/Tree background color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
    exports.listActiveSelectionForeground = registerColor('list.activeSelectionForeground', { dark: color_1.Color.white, light: color_1.Color.white, hc: null }, nls.localize('listActiveSelectionForeground', "List/Tree foreground color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
    exports.listInactiveSelectionBackground = registerColor('list.inactiveSelectionBackground', { dark: '#3F3F46', light: '#CCCEDB', hc: null }, nls.localize('listInactiveSelectionBackground', "List/Tree background color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."));
    exports.listInactiveSelectionForeground = registerColor('list.inactiveSelectionForeground', { dark: null, light: null, hc: null }, nls.localize('listInactiveSelectionForeground', "List/Tree foreground color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."));
    exports.listInactiveFocusBackground = registerColor('list.inactiveFocusBackground', { dark: '#313135', light: '#d8dae6', hc: null }, nls.localize('listInactiveSelectionBackground', "List/Tree background color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."));
    exports.listInactiveFocusForeground = registerColor('list.inactiveFocusForeground', { dark: null, light: null, hc: null }, nls.localize('listInactiveSelectionForeground', "List/Tree foreground color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."));
    exports.listHoverBackground = registerColor('list.hoverBackground', { dark: '#2A2D2E', light: '#F0F0F0', hc: null }, nls.localize('listHoverBackground', "List/Tree background when hovering over items using the mouse."));
    exports.listHoverForeground = registerColor('list.hoverForeground', { dark: null, light: null, hc: null }, nls.localize('listHoverForeground', "List/Tree foreground when hovering over items using the mouse."));
    exports.listDropBackground = registerColor('list.dropBackground', { dark: exports.listFocusBackground, light: exports.listFocusBackground, hc: null }, nls.localize('listDropBackground', "List/Tree drag and drop background when moving items around using the mouse."));
    exports.listHighlightForeground = registerColor('list.highlightForeground', { dark: '#0097fb', light: '#007acc', hc: exports.focusBorder }, nls.localize('highlight', 'List/Tree foreground color of the match highlights when searching inside the list/tree.'));
    exports.listInvalidItemForeground = registerColor('list.invalidItemForeground', { dark: '#B89500', light: '#B89500', hc: '#B89500' }, nls.localize('invalidItemForeground', 'List/Tree foreground color for invalid items, for example an unresolved root in explorer.'));
    exports.pickerGroupForeground = registerColor('pickerGroup.foreground', { dark: color_1.Color.fromHex('#0097FB').transparent(0.6), light: color_1.Color.fromHex('#007ACC').transparent(0.6), hc: color_1.Color.white }, nls.localize('pickerGroupForeground', "Quick picker color for grouping labels."));
    exports.pickerGroupBorder = registerColor('pickerGroup.border', { dark: '#3F3F46', light: '#CCCEDB', hc: color_1.Color.white }, nls.localize('pickerGroupBorder', "Quick picker color for grouping borders."));
    exports.buttonForeground = registerColor('button.foreground', { dark: color_1.Color.white, light: color_1.Color.white, hc: color_1.Color.white }, nls.localize('buttonForeground', "Button foreground color."));
    exports.buttonBackground = registerColor('button.background', { dark: '#0E639C', light: '#007ACC', hc: null }, nls.localize('buttonBackground', "Button background color."));
    exports.buttonHoverBackground = registerColor('button.hoverBackground', { dark: lighten(exports.buttonBackground, 0.2), light: darken(exports.buttonBackground, 0.2), hc: null }, nls.localize('buttonHoverBackground', "Button background color when hovering."));
    exports.badgeBackground = registerColor('badge.background', { dark: '#4D4D4D', light: '#BEBEBE', hc: color_1.Color.black }, nls.localize('badgeBackground', "Badge background color. Badges are small information labels, e.g. for search results count."));
    exports.badgeForeground = registerColor('badge.foreground', { dark: color_1.Color.white, light: color_1.Color.white, hc: color_1.Color.white }, nls.localize('badgeForeground', "Badge foreground color. Badges are small information labels, e.g. for search results count."));
    exports.scrollbarShadow = registerColor('scrollbar.shadow', { dark: '#000000', light: '#DDDDDD', hc: null }, nls.localize('scrollbarShadow', "Scrollbar shadow to indicate that the view is scrolled."));
    exports.scrollbarSliderBackground = registerColor('scrollbarSlider.background', { dark: color_1.Color.fromHex('#797979').transparent(0.4), light: color_1.Color.fromHex('#646464').transparent(0.4), hc: transparent(exports.contrastBorder, 0.6) }, nls.localize('scrollbarSliderBackground', "Scrollbar slider background color."));
    exports.scrollbarSliderHoverBackground = registerColor('scrollbarSlider.hoverBackground', { dark: color_1.Color.fromHex('#646464').transparent(0.7), light: color_1.Color.fromHex('#646464').transparent(0.7), hc: transparent(exports.contrastBorder, 0.8) }, nls.localize('scrollbarSliderHoverBackground', "Scrollbar slider background color when hovering."));
    exports.scrollbarSliderActiveBackground = registerColor('scrollbarSlider.activeBackground', { dark: color_1.Color.fromHex('#BFBFBF').transparent(0.4), light: color_1.Color.fromHex('#000000').transparent(0.6), hc: exports.contrastBorder }, nls.localize('scrollbarSliderActiveBackground', "Scrollbar slider background color when active."));
    exports.progressBarBackground = registerColor('progressBar.background', { dark: color_1.Color.fromHex('#0E70C0'), light: color_1.Color.fromHex('#0E70C0'), hc: exports.contrastBorder }, nls.localize('progressBarBackground', "Background color of the progress bar that can show for long running operations."));
    /**
     * Editor background color.
     * Because of bug https://monacotools.visualstudio.com/DefaultCollection/Monaco/_workitems/edit/13254
     * we are *not* using the color white (or #ffffff, rgba(255,255,255)) but something very close to white.
     */
    exports.editorBackground = registerColor('editor.background', { light: '#fffffe', dark: '#1E1E1E', hc: color_1.Color.black }, nls.localize('editorBackground', "Editor background color."));
    /**
     * Editor foreground color.
     */
    exports.editorForeground = registerColor('editor.foreground', { light: '#333333', dark: '#BBBBBB', hc: color_1.Color.white }, nls.localize('editorForeground', "Editor default foreground color."));
    /**
     * Editor widgets
     */
    exports.editorWidgetBackground = registerColor('editorWidget.background', { dark: '#2D2D30', light: '#EFEFF2', hc: '#0C141F' }, nls.localize('editorWidgetBackground', 'Background color of editor widgets, such as find/replace.'));
    exports.editorWidgetBorder = registerColor('editorWidget.border', { dark: '#454545', light: '#C8C8C8', hc: exports.contrastBorder }, nls.localize('editorWidgetBorder', 'Border color of editor widgets. The color is only used if the widget chooses to have a border and if the color is not overridden by a widget.'));
    /**
     * Editor selection colors.
     */
    exports.editorSelectionBackground = registerColor('editor.selectionBackground', { light: '#ADD6FF', dark: '#264F78', hc: '#f3f518' }, nls.localize('editorSelectionBackground', "Color of the editor selection."));
    exports.editorSelectionForeground = registerColor('editor.selectionForeground', { light: null, dark: null, hc: '#000000' }, nls.localize('editorSelectionForeground', "Color of the selected text for high contrast."));
    exports.editorInactiveSelection = registerColor('editor.inactiveSelectionBackground', { light: transparent(exports.editorSelectionBackground, 0.5), dark: transparent(exports.editorSelectionBackground, 0.5), hc: transparent(exports.editorSelectionBackground, 0.5) }, nls.localize('editorInactiveSelection', "Color of the selection in an inactive editor. The color must not be opaque to not hide underlying decorations."), true);
    exports.editorSelectionHighlight = registerColor('editor.selectionHighlightBackground', { light: lessProminent(exports.editorSelectionBackground, exports.editorBackground, 0.3, 0.6), dark: lessProminent(exports.editorSelectionBackground, exports.editorBackground, 0.3, 0.6), hc: null }, nls.localize('editorSelectionHighlight', 'Color for regions with the same content as the selection. The color must not be opaque to not hide underlying decorations.'), true);
    /**
     * Editor find match colors.
     */
    exports.editorFindMatch = registerColor('editor.findMatchBackground', { light: '#A8AC94', dark: '#515C6A', hc: null }, nls.localize('editorFindMatch', "Color of the current search match."));
    exports.editorFindMatchHighlight = registerColor('editor.findMatchHighlightBackground', { light: '#EA5C0055', dark: '#EA5C0055', hc: null }, nls.localize('findMatchHighlight', "Color of the other search matches. The color must not be opaque to not hide underlying decorations."), true);
    exports.editorFindRangeHighlight = registerColor('editor.findRangeHighlightBackground', { dark: '#3a3d4166', light: '#b4b4b44d', hc: null }, nls.localize('findRangeHighlight', "Color the range limiting the search. The color must not be opaque to not hide underlying decorations."), true);
    /**
     * Editor hover
     */
    exports.editorHoverHighlight = registerColor('editor.hoverHighlightBackground', { light: '#ADD6FF26', dark: '#264f7840', hc: '#ADD6FF26' }, nls.localize('hoverHighlight', 'Highlight below the word for which a hover is shown. The color must not be opaque to not hide underlying decorations.'), true);
    exports.editorHoverBackground = registerColor('editorHoverWidget.background', { light: exports.editorWidgetBackground, dark: exports.editorWidgetBackground, hc: exports.editorWidgetBackground }, nls.localize('hoverBackground', 'Background color of the editor hover.'));
    exports.editorHoverBorder = registerColor('editorHoverWidget.border', { light: exports.editorWidgetBorder, dark: exports.editorWidgetBorder, hc: exports.editorWidgetBorder }, nls.localize('hoverBorder', 'Border color of the editor hover.'));
    /**
     * Editor link colors
     */
    exports.editorActiveLinkForeground = registerColor('editorLink.activeForeground', { dark: '#4E94CE', light: color_1.Color.blue, hc: color_1.Color.cyan }, nls.localize('activeLinkForeground', 'Color of active links.'));
    /**
     * Diff Editor Colors
     */
    exports.defaultInsertColor = new color_1.Color(new color_1.RGBA(155, 185, 85, 0.2));
    exports.defaultRemoveColor = new color_1.Color(new color_1.RGBA(255, 0, 0, 0.2));
    exports.diffInserted = registerColor('diffEditor.insertedTextBackground', { dark: exports.defaultInsertColor, light: exports.defaultInsertColor, hc: null }, nls.localize('diffEditorInserted', 'Background color for text that got inserted. The color must not be opaque to not hide underlying decorations.'), true);
    exports.diffRemoved = registerColor('diffEditor.removedTextBackground', { dark: exports.defaultRemoveColor, light: exports.defaultRemoveColor, hc: null }, nls.localize('diffEditorRemoved', 'Background color for text that got removed. The color must not be opaque to not hide underlying decorations.'), true);
    exports.diffInsertedOutline = registerColor('diffEditor.insertedTextBorder', { dark: null, light: null, hc: '#33ff2eff' }, nls.localize('diffEditorInsertedOutline', 'Outline color for the text that got inserted.'));
    exports.diffRemovedOutline = registerColor('diffEditor.removedTextBorder', { dark: null, light: null, hc: '#FF008F' }, nls.localize('diffEditorRemovedOutline', 'Outline color for text that got removed.'));
    /**
     * Merge-conflict colors
     */
    var headerTransparency = 0.5;
    var currentBaseColor = color_1.Color.fromHex('#40C8AE').transparent(headerTransparency);
    var incomingBaseColor = color_1.Color.fromHex('#40A6FF').transparent(headerTransparency);
    var commonBaseColor = color_1.Color.fromHex('#606060').transparent(0.4);
    var contentTransparency = 0.4;
    var rulerTransparency = 1;
    exports.mergeCurrentHeaderBackground = registerColor('merge.currentHeaderBackground', { dark: currentBaseColor, light: currentBaseColor, hc: null }, nls.localize('mergeCurrentHeaderBackground', 'Current header background in inline merge-conflicts. The color must not be opaque to not hide underlying decorations.'), true);
    exports.mergeCurrentContentBackground = registerColor('merge.currentContentBackground', { dark: transparent(exports.mergeCurrentHeaderBackground, contentTransparency), light: transparent(exports.mergeCurrentHeaderBackground, contentTransparency), hc: transparent(exports.mergeCurrentHeaderBackground, contentTransparency) }, nls.localize('mergeCurrentContentBackground', 'Current content background in inline merge-conflicts. The color must not be opaque to not hide underlying decorations.'), true);
    exports.mergeIncomingHeaderBackground = registerColor('merge.incomingHeaderBackground', { dark: incomingBaseColor, light: incomingBaseColor, hc: null }, nls.localize('mergeIncomingHeaderBackground', 'Incoming header background in inline merge-conflicts. The color must not be opaque to not hide underlying decorations.'), true);
    exports.mergeIncomingContentBackground = registerColor('merge.incomingContentBackground', { dark: transparent(exports.mergeIncomingHeaderBackground, contentTransparency), light: transparent(exports.mergeIncomingHeaderBackground, contentTransparency), hc: transparent(exports.mergeIncomingHeaderBackground, contentTransparency) }, nls.localize('mergeIncomingContentBackground', 'Incoming content background in inline merge-conflicts. The color must not be opaque to not hide underlying decorations.'), true);
    exports.mergeCommonHeaderBackground = registerColor('merge.commonHeaderBackground', { dark: commonBaseColor, light: commonBaseColor, hc: null }, nls.localize('mergeCommonHeaderBackground', 'Common ancestor header background in inline merge-conflicts. The color must not be opaque to not hide underlying decorations.'), true);
    exports.mergeCommonContentBackground = registerColor('merge.commonContentBackground', { dark: transparent(exports.mergeCommonHeaderBackground, contentTransparency), light: transparent(exports.mergeCommonHeaderBackground, contentTransparency), hc: transparent(exports.mergeCommonHeaderBackground, contentTransparency) }, nls.localize('mergeCommonContentBackground', 'Common ancester content background in inline merge-conflicts. The color must not be opaque to not hide underlying decorations.'), true);
    exports.mergeBorder = registerColor('merge.border', { dark: null, light: null, hc: '#C3DF6F' }, nls.localize('mergeBorder', 'Border color on headers and the splitter in inline merge-conflicts.'));
    exports.overviewRulerCurrentContentForeground = registerColor('editorOverviewRuler.currentContentForeground', { dark: transparent(exports.mergeCurrentHeaderBackground, rulerTransparency), light: transparent(exports.mergeCurrentHeaderBackground, rulerTransparency), hc: exports.mergeBorder }, nls.localize('overviewRulerCurrentContentForeground', 'Current overview ruler foreground for inline merge-conflicts.'));
    exports.overviewRulerIncomingContentForeground = registerColor('editorOverviewRuler.incomingContentForeground', { dark: transparent(exports.mergeIncomingHeaderBackground, rulerTransparency), light: transparent(exports.mergeIncomingHeaderBackground, rulerTransparency), hc: exports.mergeBorder }, nls.localize('overviewRulerIncomingContentForeground', 'Incoming overview ruler foreground for inline merge-conflicts.'));
    exports.overviewRulerCommonContentForeground = registerColor('editorOverviewRuler.commonContentForeground', { dark: transparent(exports.mergeCommonHeaderBackground, rulerTransparency), light: transparent(exports.mergeCommonHeaderBackground, rulerTransparency), hc: exports.mergeBorder }, nls.localize('overviewRulerCommonContentForeground', 'Common ancestor overview ruler foreground for inline merge-conflicts.'));
    var findMatchColorDefault = new color_1.Color(new color_1.RGBA(246, 185, 77, 0.7));
    exports.overviewRulerFindMatchForeground = registerColor('editorOverviewRuler.findMatchForeground', { dark: findMatchColorDefault, light: findMatchColorDefault, hc: findMatchColorDefault }, nls.localize('overviewRulerFindMatchForeground', 'Overview ruler marker color for find matches.'));
    exports.overviewRulerSelectionHighlightForeground = registerColor('editorOverviewRuler.selectionHighlightForeground', { dark: '#A0A0A0', light: '#A0A0A0', hc: '#A0A0A0' }, nls.localize('overviewRulerSelectionHighlightForeground', 'Overview ruler marker color for selection highlights.'));
    // ----- color functions
    function darken(colorValue, factor) {
        return function (theme) {
            var color = resolveColorValue(colorValue, theme);
            if (color) {
                return color.darken(factor);
            }
            return null;
        };
    }
    exports.darken = darken;
    function lighten(colorValue, factor) {
        return function (theme) {
            var color = resolveColorValue(colorValue, theme);
            if (color) {
                return color.lighten(factor);
            }
            return null;
        };
    }
    exports.lighten = lighten;
    function transparent(colorValue, factor) {
        return function (theme) {
            var color = resolveColorValue(colorValue, theme);
            if (color) {
                return color.transparent(factor);
            }
            return null;
        };
    }
    exports.transparent = transparent;
    function oneOf() {
        var colorValues = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            colorValues[_i] = arguments[_i];
        }
        return function (theme) {
            for (var _i = 0, colorValues_1 = colorValues; _i < colorValues_1.length; _i++) {
                var colorValue = colorValues_1[_i];
                var color = resolveColorValue(colorValue, theme);
                if (color) {
                    return color;
                }
            }
            return null;
        };
    }
    exports.oneOf = oneOf;
    function lessProminent(colorValue, backgroundColorValue, factor, transparency) {
        return function (theme) {
            var from = resolveColorValue(colorValue, theme);
            if (from) {
                var backgroundColor = resolveColorValue(backgroundColorValue, theme);
                if (backgroundColor) {
                    if (from.isDarkerThan(backgroundColor)) {
                        return color_1.Color.getLighterColor(from, backgroundColor, factor).transparent(transparency);
                    }
                    return color_1.Color.getDarkerColor(from, backgroundColor, factor).transparent(transparency);
                }
                return from.transparent(factor * transparency);
            }
            return null;
        };
    }
    // ----- implementation
    /**
     * @param colorValue Resolve a color value in the context of a theme
     */
    function resolveColorValue(colorValue, theme) {
        if (colorValue === null) {
            return null;
        }
        else if (typeof colorValue === 'string') {
            if (colorValue[0] === '#') {
                return color_1.Color.fromHex(colorValue);
            }
            return theme.getColor(colorValue);
        }
        else if (colorValue instanceof color_1.Color) {
            return colorValue;
        }
        else if (typeof colorValue === 'function') {
            return colorValue(theme);
        }
        return null;
    }
});
// setTimeout(_ => console.log(colorRegistry.toString()), 5000);
