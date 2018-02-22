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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/platform/message/common/message", "vs/platform/opener/common/opener", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "vs/editor/browser/editorBrowser", "vs/editor/contrib/links/getLinks", "vs/base/common/lifecycle", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/editor/common/model/textModel", "vs/editor/contrib/goToDeclaration/clickLinkGesture", "vs/base/common/htmlContent", "vs/editor/common/model", "vs/css!./links"], function (require, exports, nls, errors_1, platform, severity_1, winjs_base_1, message_1, opener_1, editorExtensions_1, modes_1, editorBrowser_1, getLinks_1, lifecycle_1, themeService_1, colorRegistry_1, textModel_1, clickLinkGesture_1, htmlContent_1, model_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var HOVER_MESSAGE_GENERAL_META = new htmlContent_1.MarkdownString().appendText(platform.isMacintosh
        ? nls.localize('links.navigate.mac', "Cmd + click to follow link")
        : nls.localize('links.navigate', "Ctrl + click to follow link"));
    var HOVER_MESSAGE_COMMAND_META = new htmlContent_1.MarkdownString().appendText(platform.isMacintosh
        ? nls.localize('links.command.mac', "Cmd + click to execute command")
        : nls.localize('links.command', "Ctrl + click to execute command"));
    var HOVER_MESSAGE_GENERAL_ALT = new htmlContent_1.MarkdownString().appendText(nls.localize('links.navigate.al', "Alt + click to follow link"));
    var HOVER_MESSAGE_COMMAND_ALT = new htmlContent_1.MarkdownString().appendText(nls.localize('links.command.al', "Alt + click to execute command"));
    var decoration = {
        meta: textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'detected-link',
            hoverMessage: HOVER_MESSAGE_GENERAL_META
        }),
        metaActive: textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'detected-link-active',
            hoverMessage: HOVER_MESSAGE_GENERAL_META
        }),
        alt: textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'detected-link',
            hoverMessage: HOVER_MESSAGE_GENERAL_ALT
        }),
        altActive: textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'detected-link-active',
            hoverMessage: HOVER_MESSAGE_GENERAL_ALT
        }),
        altCommand: textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'detected-link',
            hoverMessage: HOVER_MESSAGE_COMMAND_ALT
        }),
        altCommandActive: textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'detected-link-active',
            hoverMessage: HOVER_MESSAGE_COMMAND_ALT
        }),
        metaCommand: textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'detected-link',
            hoverMessage: HOVER_MESSAGE_COMMAND_META
        }),
        metaCommandActive: textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            inlineClassName: 'detected-link-active',
            hoverMessage: HOVER_MESSAGE_COMMAND_META
        }),
    };
    var LinkOccurrence = /** @class */ (function () {
        function LinkOccurrence(link, decorationId) {
            this.link = link;
            this.decorationId = decorationId;
        }
        LinkOccurrence.decoration = function (link, useMetaKey) {
            return {
                range: link.range,
                options: LinkOccurrence._getOptions(link, useMetaKey, false)
            };
        };
        LinkOccurrence._getOptions = function (link, useMetaKey, isActive) {
            if (/^command:/i.test(link.url)) {
                if (useMetaKey) {
                    return (isActive ? decoration.metaCommandActive : decoration.metaCommand);
                }
                else {
                    return (isActive ? decoration.altCommandActive : decoration.altCommand);
                }
            }
            else {
                if (useMetaKey) {
                    return (isActive ? decoration.metaActive : decoration.meta);
                }
                else {
                    return (isActive ? decoration.altActive : decoration.alt);
                }
            }
        };
        LinkOccurrence.prototype.activate = function (changeAccessor, useMetaKey) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurrence._getOptions(this.link, useMetaKey, true));
        };
        LinkOccurrence.prototype.deactivate = function (changeAccessor, useMetaKey) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurrence._getOptions(this.link, useMetaKey, false));
        };
        return LinkOccurrence;
    }());
    var LinkDetector = /** @class */ (function () {
        function LinkDetector(editor, openerService, messageService) {
            var _this = this;
            this.editor = editor;
            this.openerService = openerService;
            this.messageService = messageService;
            this.listenersToRemove = [];
            var clickLinkGesture = new clickLinkGesture_1.ClickLinkGesture(editor);
            this.listenersToRemove.push(clickLinkGesture);
            this.listenersToRemove.push(clickLinkGesture.onMouseMoveOrRelevantKeyDown(function (_a) {
                var mouseEvent = _a[0], keyboardEvent = _a[1];
                _this._onEditorMouseMove(mouseEvent, keyboardEvent);
            }));
            this.listenersToRemove.push(clickLinkGesture.onExecute(function (e) {
                _this.onEditorMouseUp(e);
            }));
            this.listenersToRemove.push(clickLinkGesture.onCancel(function (e) {
                _this.cleanUpActiveLinkDecoration();
            }));
            this.enabled = editor.getConfiguration().contribInfo.links;
            this.listenersToRemove.push(editor.onDidChangeConfiguration(function (e) {
                var enabled = editor.getConfiguration().contribInfo.links;
                if (_this.enabled === enabled) {
                    // No change in our configuration option
                    return;
                }
                _this.enabled = enabled;
                // Remove any links (for the getting disabled case)
                _this.updateDecorations([]);
                // Stop any computation (for the getting disabled case)
                _this.stop();
                // Start computing (for the getting enabled case)
                _this.beginCompute();
            }));
            this.listenersToRemove.push(editor.onDidChangeModelContent(function (e) { return _this.onChange(); }));
            this.listenersToRemove.push(editor.onDidChangeModel(function (e) { return _this.onModelChanged(); }));
            this.listenersToRemove.push(editor.onDidChangeModelLanguage(function (e) { return _this.onModelModeChanged(); }));
            this.listenersToRemove.push(modes_1.LinkProviderRegistry.onDidChange(function (e) { return _this.onModelModeChanged(); }));
            this.timeoutPromise = null;
            this.computePromise = null;
            this.currentOccurrences = {};
            this.activeLinkDecorationId = null;
            this.beginCompute();
        }
        LinkDetector.get = function (editor) {
            return editor.getContribution(LinkDetector.ID);
        };
        LinkDetector.prototype.getId = function () {
            return LinkDetector.ID;
        };
        LinkDetector.prototype.onModelChanged = function () {
            this.currentOccurrences = {};
            this.activeLinkDecorationId = null;
            this.stop();
            this.beginCompute();
        };
        LinkDetector.prototype.onModelModeChanged = function () {
            this.stop();
            this.beginCompute();
        };
        LinkDetector.prototype.onChange = function () {
            var _this = this;
            if (!this.timeoutPromise) {
                this.timeoutPromise = winjs_base_1.TPromise.timeout(LinkDetector.RECOMPUTE_TIME);
                this.timeoutPromise.then(function () {
                    _this.timeoutPromise = null;
                    _this.beginCompute();
                });
            }
        };
        LinkDetector.prototype.beginCompute = function () {
            var _this = this;
            if (!this.editor.getModel() || !this.enabled) {
                return;
            }
            if (!modes_1.LinkProviderRegistry.has(this.editor.getModel())) {
                return;
            }
            this.computePromise = getLinks_1.getLinks(this.editor.getModel()).then(function (links) {
                _this.updateDecorations(links);
                _this.computePromise = null;
            });
        };
        LinkDetector.prototype.updateDecorations = function (links) {
            var _this = this;
            var useMetaKey = (this.editor.getConfiguration().multiCursorModifier === 'altKey');
            this.editor.changeDecorations(function (changeAccessor) {
                var oldDecorations = [];
                var keys = Object.keys(_this.currentOccurrences);
                for (var i_1 = 0, len = keys.length; i_1 < len; i_1++) {
                    var decorationId = keys[i_1];
                    var occurance_1 = _this.currentOccurrences[decorationId];
                    oldDecorations.push(occurance_1.decorationId);
                }
                var newDecorations = [];
                if (links) {
                    // Not sure why this is sometimes null
                    for (var i = 0; i < links.length; i++) {
                        newDecorations.push(LinkOccurrence.decoration(links[i], useMetaKey));
                    }
                }
                var decorations = changeAccessor.deltaDecorations(oldDecorations, newDecorations);
                _this.currentOccurrences = {};
                _this.activeLinkDecorationId = null;
                for (var i_2 = 0, len = decorations.length; i_2 < len; i_2++) {
                    var occurance = new LinkOccurrence(links[i_2], decorations[i_2]);
                    _this.currentOccurrences[occurance.decorationId] = occurance;
                }
            });
        };
        LinkDetector.prototype._onEditorMouseMove = function (mouseEvent, withKey) {
            var _this = this;
            var useMetaKey = (this.editor.getConfiguration().multiCursorModifier === 'altKey');
            if (this.isEnabled(mouseEvent, withKey)) {
                this.cleanUpActiveLinkDecoration(); // always remove previous link decoration as their can only be one
                var occurrence = this.getLinkOccurrence(mouseEvent.target.position);
                if (occurrence) {
                    this.editor.changeDecorations(function (changeAccessor) {
                        occurrence.activate(changeAccessor, useMetaKey);
                        _this.activeLinkDecorationId = occurrence.decorationId;
                    });
                }
            }
            else {
                this.cleanUpActiveLinkDecoration();
            }
        };
        LinkDetector.prototype.cleanUpActiveLinkDecoration = function () {
            var useMetaKey = (this.editor.getConfiguration().multiCursorModifier === 'altKey');
            if (this.activeLinkDecorationId) {
                var occurrence = this.currentOccurrences[this.activeLinkDecorationId];
                if (occurrence) {
                    this.editor.changeDecorations(function (changeAccessor) {
                        occurrence.deactivate(changeAccessor, useMetaKey);
                    });
                }
                this.activeLinkDecorationId = null;
            }
        };
        LinkDetector.prototype.onEditorMouseUp = function (mouseEvent) {
            if (!this.isEnabled(mouseEvent)) {
                return;
            }
            var occurrence = this.getLinkOccurrence(mouseEvent.target.position);
            if (!occurrence) {
                return;
            }
            this.openLinkOccurrence(occurrence, mouseEvent.hasSideBySideModifier);
        };
        LinkDetector.prototype.openLinkOccurrence = function (occurrence, openToSide) {
            var _this = this;
            if (!this.openerService) {
                return;
            }
            var link = occurrence.link;
            link.resolve().then(function (uri) {
                // open the uri
                return _this.openerService.open(uri, { openToSide: openToSide });
            }, function (err) {
                // different error cases
                if (err === 'invalid') {
                    _this.messageService.show(severity_1.default.Warning, nls.localize('invalid.url', 'Sorry, failed to open this link because it is not well-formed: {0}', link.url));
                }
                else if (err === 'missing') {
                    _this.messageService.show(severity_1.default.Warning, nls.localize('missing.url', 'Sorry, failed to open this link because its target is missing.'));
                }
                else {
                    errors_1.onUnexpectedError(err);
                }
            }).done(null, errors_1.onUnexpectedError);
        };
        LinkDetector.prototype.getLinkOccurrence = function (position) {
            var decorations = this.editor.getModel().getDecorationsInRange({
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            }, 0, true);
            for (var i = 0; i < decorations.length; i++) {
                var decoration = decorations[i];
                var currentOccurrence = this.currentOccurrences[decoration.id];
                if (currentOccurrence) {
                    return currentOccurrence;
                }
            }
            return null;
        };
        LinkDetector.prototype.isEnabled = function (mouseEvent, withKey) {
            return (mouseEvent.target.type === editorBrowser_1.MouseTargetType.CONTENT_TEXT
                && (mouseEvent.hasTriggerModifier || (withKey && withKey.keyCodeIsTriggerKey)));
        };
        LinkDetector.prototype.stop = function () {
            if (this.timeoutPromise) {
                this.timeoutPromise.cancel();
                this.timeoutPromise = null;
            }
            if (this.computePromise) {
                this.computePromise.cancel();
                this.computePromise = null;
            }
        };
        LinkDetector.prototype.dispose = function () {
            this.listenersToRemove = lifecycle_1.dispose(this.listenersToRemove);
            this.stop();
        };
        LinkDetector.ID = 'editor.linkDetector';
        LinkDetector.RECOMPUTE_TIME = 1000; // ms
        LinkDetector = __decorate([
            __param(1, opener_1.IOpenerService),
            __param(2, message_1.IMessageService)
        ], LinkDetector);
        return LinkDetector;
    }());
    var OpenLinkAction = /** @class */ (function (_super) {
        __extends(OpenLinkAction, _super);
        function OpenLinkAction() {
            return _super.call(this, {
                id: 'editor.action.openLink',
                label: nls.localize('label', "Open Link"),
                alias: 'Open Link',
                precondition: null
            }) || this;
        }
        OpenLinkAction.prototype.run = function (accessor, editor) {
            var linkDetector = LinkDetector.get(editor);
            if (!linkDetector) {
                return;
            }
            var selections = editor.getSelections();
            for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
                var sel = selections_1[_i];
                var link = linkDetector.getLinkOccurrence(sel.getEndPosition());
                if (link) {
                    linkDetector.openLinkOccurrence(link, false);
                }
            }
        };
        return OpenLinkAction;
    }(editorExtensions_1.EditorAction));
    editorExtensions_1.registerEditorContribution(LinkDetector);
    editorExtensions_1.registerEditorAction(OpenLinkAction);
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var activeLinkForeground = theme.getColor(colorRegistry_1.editorActiveLinkForeground);
        if (activeLinkForeground) {
            collector.addRule(".monaco-editor .detected-link-active { color: " + activeLinkForeground + " !important; }");
        }
    });
});
