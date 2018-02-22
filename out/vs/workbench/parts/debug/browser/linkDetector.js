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
define(["require", "exports", "vs/base/common/platform", "vs/base/common/errors", "vs/base/browser/mouseEvent", "vs/nls", "vs/workbench/services/editor/common/editorService"], function (require, exports, platform_1, errors, mouseEvent_1, nls, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LinkDetector = /** @class */ (function () {
        function LinkDetector(editorService) {
            this.editorService = editorService;
            // noop
        }
        /**
         * Matches and handles relative and absolute file links in the string provided.
         * Returns <span/> element that wraps the processed string, where matched links are replaced by <a/> and unmatched parts are surrounded by <span/> elements.
         * 'onclick' event is attached to all anchored links that opens them in the editor.
         * If no links were detected, returns the original string.
         */
        LinkDetector.prototype.handleLinks = function (text) {
            var _this = this;
            if (text.length > LinkDetector.MAX_LENGTH) {
                return text;
            }
            var linkContainer;
            for (var _i = 0, _a = LinkDetector.FILE_LOCATION_PATTERNS; _i < _a.length; _i++) {
                var pattern = _a[_i];
                pattern.lastIndex = 0; // the holy grail of software development
                var lastMatchIndex = 0;
                var match = pattern.exec(text);
                var _loop_1 = function () {
                    var resource = null;
                    if (!resource) {
                        match = pattern.exec(text);
                        return "continue";
                    }
                    if (!linkContainer) {
                        linkContainer = document.createElement('span');
                    }
                    var textBeforeLink = text.substring(lastMatchIndex, match.index);
                    if (textBeforeLink) {
                        var span = document.createElement('span');
                        span.textContent = textBeforeLink;
                        linkContainer.appendChild(span);
                    }
                    var link = document.createElement('a');
                    link.textContent = text.substr(match.index, match[0].length);
                    link.title = platform_1.isMacintosh ? nls.localize('fileLinkMac', "Click to follow (Cmd + click opens to the side)") : nls.localize('fileLink', "Click to follow (Ctrl + click opens to the side)");
                    linkContainer.appendChild(link);
                    var line = Number(match[3]);
                    var column = match[4] ? Number(match[4]) : undefined;
                    link.onclick = function (e) { return _this.onLinkClick(new mouseEvent_1.StandardMouseEvent(e), resource, line, column); };
                    lastMatchIndex = pattern.lastIndex;
                    var currentMatch = match;
                    match = pattern.exec(text);
                    // Append last string part if no more link matches
                    if (!match) {
                        var textAfterLink = text.substr(currentMatch.index + currentMatch[0].length);
                        if (textAfterLink) {
                            var span = document.createElement('span');
                            span.textContent = textAfterLink;
                            linkContainer.appendChild(span);
                        }
                    }
                };
                while (match !== null) {
                    _loop_1();
                }
            }
            return linkContainer || text;
        };
        LinkDetector.prototype.onLinkClick = function (event, resource, line, column) {
            if (column === void 0) { column = 0; }
            var selection = window.getSelection();
            if (selection.type === 'Range') {
                return; // do not navigate when user is selecting
            }
            event.preventDefault();
            this.editorService.openEditor({
                resource: resource,
                options: {
                    selection: {
                        startLineNumber: line,
                        startColumn: column
                    }
                }
            }, event.ctrlKey || event.metaKey).done(null, errors.onUnexpectedError);
        };
        LinkDetector.MAX_LENGTH = 500;
        LinkDetector.FILE_LOCATION_PATTERNS = [
            // group 0: full path with line and column
            // group 1: full path without line and column, matched by `*.*` in the end to work only on paths with extensions in the end (s.t. node:10352 would not match)
            // group 2: drive letter on windows with trailing backslash or leading slash on mac/linux
            // group 3: line number, matched by (:(\d+))
            // group 4: column number, matched by ((?::(\d+))?)
            // eg: at Context.<anonymous> (c:\Users\someone\Desktop\mocha-runner\test\test.js:26:11)
            /(?![\(])(?:file:\/\/)?((?:([a-zA-Z]+:)|[^\(\)<>\'\"\[\]:\s]+)(?:[\\/][^\(\)<>\'\"\[\]:]*)?\.[a-zA-Z]+[0-9]*):(\d+)(?::(\d+))?/g
        ];
        LinkDetector = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService)
        ], LinkDetector);
        return LinkDetector;
    }());
    exports.LinkDetector = LinkDetector;
});
