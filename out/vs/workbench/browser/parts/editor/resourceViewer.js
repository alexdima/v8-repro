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
define(["require", "exports", "vs/nls", "vs/base/common/mime", "vs/base/common/paths", "vs/base/browser/builder", "vs/base/browser/dom", "vs/base/common/map", "vs/base/common/network", "vs/base/common/numbers", "vs/workbench/common/theme", "vs/workbench/browser/parts/statusbar/statusbar", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/platform/registry/common/platform", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/workbench/services/group/common/groupService", "vs/base/common/decorators", "vs/base/common/platform", "vs/css!./media/resourceviewer"], function (require, exports, nls, mimes, paths, builder_1, DOM, map_1, network_1, numbers_1, theme_1, statusbar_1, contextView_1, themeService_1, platform_1, winjs_base_1, actions_1, groupService_1, decorators_1, platform) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Known media mimes that we can handle
    var mapExtToMediaMimes = {
        '.bmp': 'image/bmp',
        '.gif': 'image/gif',
        '.jpg': 'image/jpg',
        '.jpeg': 'image/jpg',
        '.jpe': 'image/jpg',
        '.png': 'image/png',
        '.tiff': 'image/tiff',
        '.tif': 'image/tiff',
        '.ico': 'image/x-icon',
        '.tga': 'image/x-tga',
        '.psd': 'image/vnd.adobe.photoshop',
        '.webp': 'image/webp',
        '.mid': 'audio/midi',
        '.midi': 'audio/midi',
        '.mp4a': 'audio/mp4',
        '.mpga': 'audio/mpeg',
        '.mp2': 'audio/mpeg',
        '.mp2a': 'audio/mpeg',
        '.mp3': 'audio/mpeg',
        '.m2a': 'audio/mpeg',
        '.m3a': 'audio/mpeg',
        '.oga': 'audio/ogg',
        '.ogg': 'audio/ogg',
        '.spx': 'audio/ogg',
        '.aac': 'audio/x-aac',
        '.wav': 'audio/x-wav',
        '.wma': 'audio/x-ms-wma',
        '.mp4': 'video/mp4',
        '.mp4v': 'video/mp4',
        '.mpg4': 'video/mp4',
        '.mpeg': 'video/mpeg',
        '.mpg': 'video/mpeg',
        '.mpe': 'video/mpeg',
        '.m1v': 'video/mpeg',
        '.m2v': 'video/mpeg',
        '.ogv': 'video/ogg',
        '.qt': 'video/quicktime',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska',
        '.mk3d': 'video/x-matroska',
        '.mks': 'video/x-matroska',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.avi': 'video/x-msvideo',
        '.movie': 'video/x-sgi-movie'
    };
    var BinarySize = /** @class */ (function () {
        function BinarySize() {
        }
        BinarySize.formatSize = function (size) {
            if (size < BinarySize.KB) {
                return nls.localize('sizeB', "{0}B", size);
            }
            if (size < BinarySize.MB) {
                return nls.localize('sizeKB', "{0}KB", (size / BinarySize.KB).toFixed(2));
            }
            if (size < BinarySize.GB) {
                return nls.localize('sizeMB', "{0}MB", (size / BinarySize.MB).toFixed(2));
            }
            if (size < BinarySize.TB) {
                return nls.localize('sizeGB', "{0}GB", (size / BinarySize.GB).toFixed(2));
            }
            return nls.localize('sizeTB', "{0}TB", (size / BinarySize.TB).toFixed(2));
        };
        BinarySize.KB = 1024;
        BinarySize.MB = BinarySize.KB * BinarySize.KB;
        BinarySize.GB = BinarySize.MB * BinarySize.KB;
        BinarySize.TB = BinarySize.GB * BinarySize.KB;
        return BinarySize;
    }());
    /**
     * Helper to actually render the given resource into the provided container. Will adjust scrollbar (if provided) automatically based on loading
     * progress of the binary resource.
     */
    var ResourceViewer = /** @class */ (function () {
        function ResourceViewer() {
        }
        ResourceViewer.show = function (descriptor, container, scrollbar, openExternal, metadataClb) {
            // Ensure CSS class
            builder_1.$(container).setClass('monaco-resource-viewer');
            if (ResourceViewer.isImageResource(descriptor)) {
                return ImageView.create(container, descriptor, scrollbar, openExternal, metadataClb);
            }
            GenericBinaryFileView.create(container, metadataClb, descriptor, scrollbar);
            return null;
        };
        ResourceViewer.isImageResource = function (descriptor) {
            var mime = ResourceViewer.getMime(descriptor);
            return mime.indexOf('image/') >= 0;
        };
        ResourceViewer.getMime = function (descriptor) {
            var mime = descriptor.mime;
            if (!mime && descriptor.resource.scheme !== network_1.Schemas.data) {
                var ext = paths.extname(descriptor.resource.toString());
                if (ext) {
                    mime = mapExtToMediaMimes[ext.toLowerCase()];
                }
            }
            return mime || mimes.MIME_BINARY;
        };
        return ResourceViewer;
    }());
    exports.ResourceViewer = ResourceViewer;
    var ImageView = /** @class */ (function () {
        function ImageView() {
        }
        ImageView.create = function (container, descriptor, scrollbar, openExternal, metadataClb) {
            if (ImageView.shouldShowImageInline(descriptor)) {
                return InlineImageView.create(container, descriptor, scrollbar, metadataClb);
            }
            LargeImageView.create(container, descriptor, openExternal);
            return null;
        };
        ImageView.shouldShowImageInline = function (descriptor) {
            var skipInlineImage;
            // Data URI
            if (descriptor.resource.scheme === network_1.Schemas.data) {
                var base64MarkerIndex = descriptor.resource.path.indexOf(ImageView.BASE64_MARKER);
                var hasData = base64MarkerIndex >= 0 && descriptor.resource.path.substring(base64MarkerIndex + ImageView.BASE64_MARKER.length).length > 0;
                skipInlineImage = !hasData || descriptor.size > ImageView.MAX_IMAGE_SIZE || descriptor.resource.path.length > ImageView.MAX_IMAGE_SIZE;
            }
            else {
                skipInlineImage = typeof descriptor.size !== 'number' || descriptor.size > ImageView.MAX_IMAGE_SIZE;
            }
            return !skipInlineImage;
        };
        ImageView.MAX_IMAGE_SIZE = BinarySize.MB; // showing images inline is memory intense, so we have a limit
        ImageView.BASE64_MARKER = 'base64,';
        return ImageView;
    }());
    var LargeImageView = /** @class */ (function () {
        function LargeImageView() {
        }
        LargeImageView.create = function (container, descriptor, openExternal) {
            var imageContainer = builder_1.$(container)
                .empty()
                .p({
                text: nls.localize('largeImageError', "The file size of the image is too large (>1MB) to display in the editor. ")
            });
            if (descriptor.resource.scheme !== network_1.Schemas.data) {
                imageContainer.append(builder_1.$('a', {
                    role: 'button',
                    class: 'open-external',
                    text: nls.localize('resourceOpenExternalButton', "Open image using external program?")
                }).on(DOM.EventType.CLICK, function (e) {
                    openExternal(descriptor.resource);
                }));
            }
        };
        return LargeImageView;
    }());
    var GenericBinaryFileView = /** @class */ (function () {
        function GenericBinaryFileView() {
        }
        GenericBinaryFileView.create = function (container, metadataClb, descriptor, scrollbar) {
            builder_1.$(container)
                .empty()
                .span({
                text: nls.localize('nativeBinaryError', "The file will not be displayed in the editor because it is either binary, very large or uses an unsupported text encoding.")
            });
            if (metadataClb) {
                metadataClb(BinarySize.formatSize(descriptor.size));
            }
            scrollbar.scanDomNode();
        };
        return GenericBinaryFileView;
    }());
    var ZoomStatusbarItem = /** @class */ (function (_super) {
        __extends(ZoomStatusbarItem, _super);
        function ZoomStatusbarItem(contextMenuService, editorGroupService, themeService) {
            var _this = _super.call(this, themeService) || this;
            _this.contextMenuService = contextMenuService;
            ZoomStatusbarItem.instance = _this;
            _this.toUnbind.push(editorGroupService.onEditorsChanged(function () { return _this.onEditorsChanged(); }));
            return _this;
        }
        ZoomStatusbarItem.prototype.onEditorsChanged = function () {
            this.hide();
            this.onSelectScale = undefined;
        };
        ZoomStatusbarItem.prototype.show = function (scale, onSelectScale) {
            var _this = this;
            clearTimeout(this.showTimeout);
            this.showTimeout = setTimeout(function () {
                _this.onSelectScale = onSelectScale;
                _this.statusBarItem.style.display = 'block';
                _this.updateLabel(scale);
            }, 0);
        };
        ZoomStatusbarItem.prototype.hide = function () {
            this.statusBarItem.style.display = 'none';
        };
        ZoomStatusbarItem.prototype.render = function (container) {
            var _this = this;
            if (!this.statusBarItem && container) {
                this.statusBarItem = builder_1.$(container).a()
                    .addClass('.zoom-statusbar-item')
                    .on('click', function () {
                    _this.contextMenuService.showContextMenu({
                        getAnchor: function () { return container; },
                        getActions: function () { return winjs_base_1.TPromise.as(_this.zoomActions); }
                    });
                })
                    .getHTMLElement();
                this.statusBarItem.style.display = 'none';
            }
            return this;
        };
        ZoomStatusbarItem.prototype.updateLabel = function (scale) {
            this.statusBarItem.textContent = ZoomStatusbarItem.zoomLabel(scale);
        };
        Object.defineProperty(ZoomStatusbarItem.prototype, "zoomActions", {
            get: function () {
                var _this = this;
                var scales = [10, 5, 2, 1, 0.5, 0.2, 'fit'];
                return scales.map(function (scale) {
                    return new actions_1.Action('zoom.' + scale, ZoomStatusbarItem.zoomLabel(scale), undefined, undefined, function () {
                        if (_this.onSelectScale) {
                            _this.onSelectScale(scale);
                        }
                        return null;
                    });
                });
            },
            enumerable: true,
            configurable: true
        });
        ZoomStatusbarItem.zoomLabel = function (scale) {
            return scale === 'fit'
                ? nls.localize('zoom.action.fit.label', 'Whole Image')
                : Math.round(scale * 100) + "%";
        };
        __decorate([
            decorators_1.memoize
        ], ZoomStatusbarItem.prototype, "zoomActions", null);
        ZoomStatusbarItem = __decorate([
            __param(0, contextView_1.IContextMenuService),
            __param(1, groupService_1.IEditorGroupService),
            __param(2, themeService_1.IThemeService)
        ], ZoomStatusbarItem);
        return ZoomStatusbarItem;
    }(theme_1.Themable));
    platform_1.Registry.as(statusbar_1.Extensions.Statusbar).registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(ZoomStatusbarItem, statusbar_1.StatusbarAlignment.RIGHT, 101));
    var InlineImageView = /** @class */ (function () {
        function InlineImageView() {
        }
        InlineImageView.create = function (container, descriptor, scrollbar, metadataClb) {
            var context = {
                layout: function (dimension) { }
            };
            var cacheKey = descriptor.resource.toString();
            var ctrlPressed = false;
            var altPressed = false;
            var initialState = InlineImageView.imageStateCache.get(cacheKey) || { scale: 'fit', offsetX: 0, offsetY: 0 };
            var scale = initialState.scale;
            var img = null;
            var imgElement = null;
            function updateScale(newScale) {
                if (!img || !imgElement.parentElement) {
                    return;
                }
                if (newScale === 'fit') {
                    scale = 'fit';
                    img.addClass('scale-to-fit');
                    img.removeClass('pixelated');
                    img.style('min-width', 'auto');
                    img.style('width', 'auto');
                    InlineImageView.imageStateCache.set(cacheKey, null);
                }
                else {
                    var oldWidth = imgElement.width;
                    var oldHeight = imgElement.height;
                    scale = numbers_1.clamp(newScale, InlineImageView.MIN_SCALE, InlineImageView.MAX_SCALE);
                    if (scale >= InlineImageView.PIXELATION_THRESHOLD) {
                        img.addClass('pixelated');
                    }
                    else {
                        img.removeClass('pixelated');
                    }
                    var _a = imgElement.parentElement, scrollTop = _a.scrollTop, scrollLeft = _a.scrollLeft;
                    var dx = (scrollLeft + imgElement.parentElement.clientWidth / 2) / imgElement.parentElement.scrollWidth;
                    var dy = (scrollTop + imgElement.parentElement.clientHeight / 2) / imgElement.parentElement.scrollHeight;
                    img.removeClass('scale-to-fit');
                    img.style('min-width', (imgElement.naturalWidth * scale) + "px");
                    img.style('width', (imgElement.naturalWidth * scale) + "px");
                    var newWidth = imgElement.width;
                    var scaleFactor = (newWidth - oldWidth) / oldWidth;
                    var newScrollLeft = ((oldWidth * scaleFactor * dx) + scrollLeft);
                    var newScrollTop = ((oldHeight * scaleFactor * dy) + scrollTop);
                    scrollbar.setScrollPosition({
                        scrollLeft: newScrollLeft,
                        scrollTop: newScrollTop,
                    });
                    InlineImageView.imageStateCache.set(cacheKey, { scale: scale, offsetX: newScrollLeft, offsetY: newScrollTop });
                }
                ZoomStatusbarItem.instance.show(scale, updateScale);
                scrollbar.scanDomNode();
            }
            function firstZoom() {
                scale = imgElement.clientWidth / imgElement.naturalWidth;
                updateScale(scale);
            }
            builder_1.$(container)
                .on(DOM.EventType.KEY_DOWN, function (e, c) {
                if (!img) {
                    return;
                }
                ctrlPressed = e.ctrlKey;
                altPressed = e.altKey;
                if (platform.isMacintosh ? altPressed : ctrlPressed) {
                    c.removeClass('zoom-in').addClass('zoom-out');
                }
            })
                .on(DOM.EventType.KEY_UP, function (e, c) {
                if (!img) {
                    return;
                }
                ctrlPressed = e.ctrlKey;
                altPressed = e.altKey;
                if (!(platform.isMacintosh ? altPressed : ctrlPressed)) {
                    c.removeClass('zoom-out').addClass('zoom-in');
                }
            })
                .on(DOM.EventType.CLICK, function (e) {
                if (!img) {
                    return;
                }
                if (e.button !== 0) {
                    return;
                }
                // left click
                if (scale === 'fit') {
                    firstZoom();
                }
                if (!(platform.isMacintosh ? altPressed : ctrlPressed)) {
                    var i = 0;
                    for (; i < InlineImageView.zoomLevels.length; ++i) {
                        if (InlineImageView.zoomLevels[i] > scale) {
                            break;
                        }
                    }
                    updateScale(InlineImageView.zoomLevels[i] || InlineImageView.MAX_SCALE);
                }
                else {
                    var i = InlineImageView.zoomLevels.length - 1;
                    for (; i >= 0; --i) {
                        if (InlineImageView.zoomLevels[i] < scale) {
                            break;
                        }
                    }
                    updateScale(InlineImageView.zoomLevels[i] || InlineImageView.MIN_SCALE);
                }
            })
                .on(DOM.EventType.WHEEL, function (e) {
                if (!img) {
                    return;
                }
                var isScrollWhellKeyPressed = platform.isMacintosh ? altPressed : ctrlPressed;
                if (!isScrollWhellKeyPressed && !e.ctrlKey) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                if (scale === 'fit') {
                    firstZoom();
                }
                var delta = e.deltaY < 0 ? 1 : -1;
                // Pinching should increase the scale
                if (e.ctrlKey && !isScrollWhellKeyPressed) {
                    delta *= -1;
                }
                updateScale(scale * (1 - delta * InlineImageView.SCALE_PINCH_FACTOR));
            })
                .on(DOM.EventType.SCROLL, function () {
                if (!imgElement || !imgElement.parentElement || scale === 'fit') {
                    return;
                }
                var entry = InlineImageView.imageStateCache.get(cacheKey);
                if (entry) {
                    var _a = imgElement.parentElement, scrollTop = _a.scrollTop, scrollLeft = _a.scrollLeft;
                    InlineImageView.imageStateCache.set(cacheKey, { scale: entry.scale, offsetX: scrollLeft, offsetY: scrollTop });
                }
            });
            builder_1.$(container)
                .empty()
                .addClass('image', 'zoom-in')
                .img({ src: InlineImageView.imageSrc(descriptor) })
                .style('visibility', 'hidden')
                .addClass('scale-to-fit')
                .on(DOM.EventType.LOAD, function (e, i) {
                img = i;
                imgElement = img.getHTMLElement();
                metadataClb(nls.localize('imgMeta', '{0}x{1} {2}', imgElement.naturalWidth, imgElement.naturalHeight, BinarySize.formatSize(descriptor.size)));
                scrollbar.scanDomNode();
                img.style('visibility', 'visible');
                updateScale(scale);
                if (initialState.scale !== 'fit') {
                    scrollbar.setScrollPosition({
                        scrollLeft: initialState.offsetX,
                        scrollTop: initialState.offsetY,
                    });
                }
            });
            return context;
        };
        InlineImageView.imageSrc = function (descriptor) {
            if (descriptor.resource.scheme === network_1.Schemas.data) {
                return descriptor.resource.toString(true /* skip encoding */);
            }
            var src = descriptor.resource.toString();
            var cached = InlineImageView.IMAGE_RESOURCE_ETAG_CACHE.get(src);
            if (!cached) {
                cached = { etag: descriptor.etag, src: src };
                InlineImageView.IMAGE_RESOURCE_ETAG_CACHE.set(src, cached);
            }
            if (cached.etag !== descriptor.etag) {
                cached.etag = descriptor.etag;
                cached.src = src + "?" + Date.now(); // bypass cache with this trick
            }
            return cached.src;
        };
        InlineImageView.SCALE_PINCH_FACTOR = 0.075;
        InlineImageView.MAX_SCALE = 20;
        InlineImageView.MIN_SCALE = 0.1;
        InlineImageView.zoomLevels = [
            0.1,
            0.2,
            0.3,
            0.4,
            0.5,
            0.6,
            0.7,
            0.8,
            0.9,
            1,
            1.5,
            2,
            3,
            5,
            7,
            10,
            15,
            20
        ];
        /**
         * Enable image-rendering: pixelated for images scaled by more than this.
         */
        InlineImageView.PIXELATION_THRESHOLD = 3;
        /**
         * Chrome is caching images very aggressively and so we use the ETag information to find out if
         * we need to bypass the cache or not. We could always bypass the cache everytime we show the image
         * however that has very bad impact on memory consumption because each time the image gets shown,
         * memory grows (see also https://github.com/electron/electron/issues/6275)
         */
        InlineImageView.IMAGE_RESOURCE_ETAG_CACHE = new map_1.LRUCache(100);
        /**
         * Store the scale and position of an image so it can be restored when changing editor tabs
         */
        InlineImageView.imageStateCache = new map_1.LRUCache(100);
        return InlineImageView;
    }());
});
