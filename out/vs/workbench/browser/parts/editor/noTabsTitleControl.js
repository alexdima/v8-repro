/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "vs/base/common/errors", "vs/workbench/common/editor", "vs/base/browser/dom", "vs/workbench/browser/parts/editor/titleControl", "vs/workbench/browser/labels", "vs/platform/editor/common/editor", "vs/workbench/common/theme", "vs/base/browser/touch", "vs/css!./media/notabstitle"], function (require, exports, errors, editor_1, DOM, titleControl_1, labels_1, editor_2, theme_1, touch_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var NoTabsTitleControl = /** @class */ (function (_super) {
        __extends(NoTabsTitleControl, _super);
        function NoTabsTitleControl() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NoTabsTitleControl.prototype.create = function (parent) {
            var _this = this;
            _super.prototype.create.call(this, parent);
            this.titleContainer = parent;
            // Gesture Support
            touch_1.Gesture.addTarget(this.titleContainer);
            // Pin on double click
            this.toUnbind.push(DOM.addDisposableListener(this.titleContainer, DOM.EventType.DBLCLICK, function (e) { return _this.onTitleDoubleClick(e); }));
            // Detect mouse click
            this.toUnbind.push(DOM.addDisposableListener(this.titleContainer, DOM.EventType.CLICK, function (e) { return _this.onTitleClick(e); }));
            // Detect touch
            this.toUnbind.push(DOM.addDisposableListener(this.titleContainer, touch_1.EventType.Tap, function (e) { return _this.onTitleClick(e); }));
            // Editor Label
            this.editorLabel = this.instantiationService.createInstance(labels_1.ResourceLabel, this.titleContainer, void 0);
            this.toUnbind.push(this.editorLabel);
            this.toUnbind.push(this.editorLabel.onClick(function (e) { return _this.onTitleLabelClick(e); }));
            // Right Actions Container
            var actionsContainer = document.createElement('div');
            DOM.addClass(actionsContainer, 'title-actions');
            this.titleContainer.appendChild(actionsContainer);
            // Editor actions toolbar
            this.createEditorActionsToolBar(actionsContainer);
            // Context Menu
            this.toUnbind.push(DOM.addDisposableListener(this.titleContainer, DOM.EventType.CONTEXT_MENU, function (e) { return _this.onContextMenu({ group: _this.context, editor: _this.context.activeEditor }, e, _this.titleContainer); }));
            this.toUnbind.push(DOM.addDisposableListener(this.titleContainer, touch_1.EventType.Contextmenu, function (e) { return _this.onContextMenu({ group: _this.context, editor: _this.context.activeEditor }, e, _this.titleContainer); }));
        };
        NoTabsTitleControl.prototype.onTitleLabelClick = function (e) {
            var _this = this;
            DOM.EventHelper.stop(e, false);
            if (!this.dragged) {
                setTimeout(function () { return _this.quickOpenService.show(); }); // delayed to let the onTitleClick() come first which can cause a focus change which can close quick open
            }
        };
        NoTabsTitleControl.prototype.onTitleDoubleClick = function (e) {
            DOM.EventHelper.stop(e);
            if (!this.context) {
                return;
            }
            var group = this.context;
            this.editorGroupService.pinEditor(group, group.activeEditor);
        };
        NoTabsTitleControl.prototype.onTitleClick = function (e) {
            if (!this.context) {
                return;
            }
            var group = this.context;
            // Close editor on middle mouse click
            if (e instanceof MouseEvent && e.button === 1 /* Middle Button */) {
                this.closeEditorAction.run({ groupId: group.id, editorIndex: group.indexOf(group.activeEditor) }).done(null, errors.onUnexpectedError);
            }
            else if ((this.stacks.groups.length === 1 || !(e instanceof MouseEvent)) && !DOM.isAncestor((e.initialTarget || e.target || e.srcElement), this.editorActionsToolbar.getContainer().getHTMLElement())) {
                this.editorGroupService.focusGroup(group);
            }
        };
        NoTabsTitleControl.prototype.doRefresh = function () {
            var group = this.context;
            var editor = group && group.activeEditor;
            if (!editor) {
                this.editorLabel.clear();
                this.clearEditorActionsToolbar();
                return; // return early if we are being closed
            }
            var isPinned = group.isPinned(group.activeEditor);
            var isActive = this.stacks.isActive(group);
            // Activity state
            if (isActive) {
                DOM.addClass(this.titleContainer, 'active');
            }
            else {
                DOM.removeClass(this.titleContainer, 'active');
            }
            // Dirty state
            if (editor.isDirty()) {
                DOM.addClass(this.titleContainer, 'dirty');
            }
            else {
                DOM.removeClass(this.titleContainer, 'dirty');
            }
            // Editor Label
            var resource = editor_1.toResource(editor, { supportSideBySide: true });
            var name = editor.getName() || '';
            var labelFormat = this.editorGroupService.getTabOptions().labelFormat;
            var description;
            if (labelFormat === 'default' && !isActive) {
                description = ''; // hide description when group is not active and style is 'default'
            }
            else {
                description = editor.getDescription(this.getVerbosity(labelFormat)) || '';
            }
            var title = editor.getTitle(editor_2.Verbosity.LONG);
            if (description === title) {
                title = ''; // dont repeat what is already shown
            }
            this.editorLabel.setLabel({ name: name, description: description, resource: resource }, { title: title, italic: !isPinned, extraClasses: ['title-label'] });
            if (isActive) {
                this.editorLabel.element.style.color = this.getColor(theme_1.TAB_ACTIVE_FOREGROUND);
            }
            else {
                this.editorLabel.element.style.color = this.getColor(theme_1.TAB_UNFOCUSED_ACTIVE_FOREGROUND);
            }
            // Update Editor Actions Toolbar
            this.updateEditorActionsToolbar();
        };
        NoTabsTitleControl.prototype.getVerbosity = function (style) {
            switch (style) {
                case 'short': return editor_2.Verbosity.SHORT;
                case 'long': return editor_2.Verbosity.LONG;
                default: return editor_2.Verbosity.MEDIUM;
            }
        };
        return NoTabsTitleControl;
    }(titleControl_1.TitleControl));
    exports.NoTabsTitleControl = NoTabsTitleControl;
});
