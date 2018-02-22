/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model", "vs/editor/common/model/textModel"], function (require, exports, model_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FoldingDecorationProvider = /** @class */ (function () {
        function FoldingDecorationProvider(editor) {
            this.editor = editor;
            this.COLLAPSED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
                stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                afterContentClassName: 'inline-folded',
                linesDecorationsClassName: 'folding collapsed'
            });
            this.EXPANDED_AUTO_HIDE_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
                stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                linesDecorationsClassName: 'folding'
            });
            this.EXPANDED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
                stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                linesDecorationsClassName: 'folding alwaysShowFoldIcons'
            });
            this.autoHideFoldingControls = true;
        }
        FoldingDecorationProvider.prototype.getDecorationOption = function (isCollapsed) {
            if (isCollapsed) {
                return this.COLLAPSED_VISUAL_DECORATION;
            }
            else if (this.autoHideFoldingControls) {
                return this.EXPANDED_AUTO_HIDE_VISUAL_DECORATION;
            }
            else {
                return this.EXPANDED_VISUAL_DECORATION;
            }
        };
        FoldingDecorationProvider.prototype.deltaDecorations = function (oldDecorations, newDecorations) {
            return this.editor.deltaDecorations(oldDecorations, newDecorations);
        };
        FoldingDecorationProvider.prototype.changeDecorations = function (callback) {
            return this.editor.changeDecorations(callback);
        };
        return FoldingDecorationProvider;
    }());
    exports.FoldingDecorationProvider = FoldingDecorationProvider;
});
