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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/paths", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/css!./iconlabel"], function (require, exports, dom, highlightedLabel_1, paths, labels_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FastLabelNode = /** @class */ (function () {
        function FastLabelNode(_element) {
            this._element = _element;
        }
        Object.defineProperty(FastLabelNode.prototype, "element", {
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FastLabelNode.prototype, "textContent", {
            set: function (content) {
                if (this.disposed || content === this._textContent) {
                    return;
                }
                this._textContent = content;
                this._element.textContent = content;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FastLabelNode.prototype, "className", {
            set: function (className) {
                if (this.disposed || className === this._className) {
                    return;
                }
                this._className = className;
                this._element.className = className;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FastLabelNode.prototype, "title", {
            set: function (title) {
                if (this.disposed || title === this._title) {
                    return;
                }
                this._title = title;
                if (this._title) {
                    this._element.title = title;
                }
                else {
                    this._element.removeAttribute('title');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FastLabelNode.prototype, "empty", {
            set: function (empty) {
                if (this.disposed || empty === this._empty) {
                    return;
                }
                this._empty = empty;
                this._element.style.marginLeft = empty ? '0' : null;
            },
            enumerable: true,
            configurable: true
        });
        FastLabelNode.prototype.dispose = function () {
            this.disposed = true;
        };
        return FastLabelNode;
    }());
    var IconLabel = /** @class */ (function () {
        function IconLabel(container, options) {
            var _this = this;
            this.domNode = new FastLabelNode(dom.append(container, dom.$('.monaco-icon-label')));
            this.labelDescriptionContainer = new FastLabelNode(dom.append(this.domNode.element, dom.$('.monaco-icon-label-description-container')));
            if (options && options.supportHighlights) {
                this.labelNode = new highlightedLabel_1.HighlightedLabel(dom.append(this.labelDescriptionContainer.element, dom.$('a.label-name')));
            }
            else {
                this.labelNode = new FastLabelNode(dom.append(this.labelDescriptionContainer.element, dom.$('a.label-name')));
            }
            if (options && options.supportDescriptionHighlights) {
                this.descriptionNodeFactory = function () { return new highlightedLabel_1.HighlightedLabel(dom.append(_this.labelDescriptionContainer.element, dom.$('span.label-description'))); };
            }
            else {
                this.descriptionNodeFactory = function () { return new FastLabelNode(dom.append(_this.labelDescriptionContainer.element, dom.$('span.label-description'))); };
            }
        }
        Object.defineProperty(IconLabel.prototype, "element", {
            get: function () {
                return this.domNode.element;
            },
            enumerable: true,
            configurable: true
        });
        IconLabel.prototype.onClick = function (callback) {
            return lifecycle_1.combinedDisposable([
                dom.addDisposableListener(this.labelDescriptionContainer.element, dom.EventType.CLICK, function (e) { return callback(e); }),
            ]);
        };
        IconLabel.prototype.setValue = function (label, description, options) {
            var classes = ['monaco-icon-label'];
            if (options) {
                if (options.extraClasses) {
                    classes.push.apply(classes, options.extraClasses);
                }
                if (options.italic) {
                    classes.push('italic');
                }
            }
            this.domNode.className = classes.join(' ');
            this.domNode.title = options && options.title ? options.title : '';
            if (this.labelNode instanceof highlightedLabel_1.HighlightedLabel) {
                this.labelNode.set(label || '', options ? options.matches : void 0);
            }
            else {
                this.labelNode.textContent = label || '';
            }
            if (description || this.descriptionNode) {
                if (!this.descriptionNode) {
                    this.descriptionNode = this.descriptionNodeFactory(); // description node is created lazily on demand
                }
                if (this.descriptionNode instanceof highlightedLabel_1.HighlightedLabel) {
                    this.descriptionNode.set(description || '', options ? options.descriptionMatches : void 0);
                    if (options && options.descriptionTitle) {
                        this.descriptionNode.element.title = options.descriptionTitle;
                    }
                    else {
                        this.descriptionNode.element.removeAttribute('title');
                    }
                }
                else {
                    this.descriptionNode.textContent = description || '';
                    this.descriptionNode.title = options && options.descriptionTitle ? options.descriptionTitle : '';
                    this.descriptionNode.empty = !description;
                }
            }
        };
        IconLabel.prototype.dispose = function () {
            this.domNode.dispose();
            this.labelNode.dispose();
            if (this.descriptionNode) {
                this.descriptionNode.dispose();
            }
        };
        return IconLabel;
    }());
    exports.IconLabel = IconLabel;
    var FileLabel = /** @class */ (function (_super) {
        __extends(FileLabel, _super);
        function FileLabel(container, file, provider, userHome) {
            var _this = _super.call(this, container) || this;
            _this.setFile(file, provider, userHome);
            return _this;
        }
        FileLabel.prototype.setFile = function (file, provider, userHome) {
            var parent = paths.dirname(file.fsPath);
            this.setValue(labels_1.getBaseLabel(file), parent && parent !== '.' ? labels_1.getPathLabel(parent, provider, userHome) : '', { title: file.fsPath });
        };
        return FileLabel;
    }(IconLabel));
    exports.FileLabel = FileLabel;
});
