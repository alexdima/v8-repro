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
define(["require", "exports", "vs/base/common/resources", "vs/base/browser/ui/iconLabel/iconLabel", "vs/platform/extensions/common/extensions", "vs/editor/common/services/modeService", "vs/workbench/common/editor", "vs/base/common/labels", "vs/editor/common/modes/modesRegistry", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/editor/common/services/modelService", "vs/platform/environment/common/environment", "vs/workbench/services/untitled/common/untitledEditorService", "vs/workbench/services/decorations/browser/decorations", "vs/base/common/network", "vs/platform/files/common/files", "vs/platform/theme/common/themeService"], function (require, exports, resources, iconLabel_1, extensions_1, modeService_1, editor_1, labels_1, modesRegistry_1, workspace_1, configuration_1, lifecycle_1, modelService_1, environment_1, untitledEditorService_1, decorations_1, network_1, files_1, themeService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResourceLabel = /** @class */ (function (_super) {
        __extends(ResourceLabel, _super);
        function ResourceLabel(container, options, extensionService, contextService, configurationService, modeService, modelService, environmentService, decorationsService, themeService) {
            var _this = _super.call(this, container, options) || this;
            _this.extensionService = extensionService;
            _this.contextService = contextService;
            _this.configurationService = configurationService;
            _this.modeService = modeService;
            _this.modelService = modelService;
            _this.environmentService = environmentService;
            _this.decorationsService = decorationsService;
            _this.themeService = themeService;
            _this.toDispose = [];
            _this.registerListeners();
            return _this;
        }
        ResourceLabel.prototype.registerListeners = function () {
            var _this = this;
            // update when extensions are registered with potentially new languages
            this.toDispose.push(this.extensionService.onDidRegisterExtensions(function () { return _this.render(true /* clear cache */); }));
            // react to model mode changes
            this.toDispose.push(this.modelService.onModelModeChanged(function (e) { return _this.onModelModeChanged(e); }));
            // react to file decoration changes
            this.toDispose.push(this.decorationsService.onDidChangeDecorations(this.onFileDecorationsChanges, this));
            // react to theme changes
            this.toDispose.push(this.themeService.onThemeChange(function () { return _this.render(false); }));
            // react to files.associations changes
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(files_1.FILES_ASSOCIATIONS_CONFIG)) {
                    _this.render(true /* clear cache */);
                }
            }));
        };
        ResourceLabel.prototype.onModelModeChanged = function (e) {
            if (!this.label || !this.label.resource) {
                return; // only update if label exists
            }
            if (!e.model.uri) {
                return; // we need the resource to compare
            }
            if (e.model.uri.scheme === network_1.Schemas.file && e.oldModeId === modesRegistry_1.PLAINTEXT_MODE_ID) {
                return; // ignore transitions in files from no mode to specific mode because this happens each time a model is created
            }
            if (e.model.uri.toString() === this.label.resource.toString()) {
                if (this.lastKnownConfiguredLangId !== e.model.getLanguageIdentifier().language) {
                    this.render(true); // update if the language id of the model has changed from our last known state
                }
            }
        };
        ResourceLabel.prototype.onFileDecorationsChanges = function (e) {
            if (!this.options || !this.label || !this.label.resource) {
                return;
            }
            if (this.options.fileDecorations && e.affectsResource(this.label.resource)) {
                this.render(false);
            }
        };
        ResourceLabel.prototype.setLabel = function (label, options) {
            var hasResourceChanged = this.hasResourceChanged(label, options);
            this.label = label;
            this.options = options;
            this.render(hasResourceChanged);
        };
        ResourceLabel.prototype.hasResourceChanged = function (label, options) {
            var newResource = label ? label.resource : void 0;
            var oldResource = this.label ? this.label.resource : void 0;
            var newFileKind = options ? options.fileKind : void 0;
            var oldFileKind = this.options ? this.options.fileKind : void 0;
            if (newFileKind !== oldFileKind) {
                return true; // same resource but different kind (file, folder)
            }
            if (newResource && oldResource) {
                return newResource.toString() !== oldResource.toString();
            }
            if (!newResource && !oldResource) {
                return false;
            }
            return true;
        };
        ResourceLabel.prototype.clear = function () {
            this.label = void 0;
            this.options = void 0;
            this.lastKnownConfiguredLangId = void 0;
            this.computedIconClasses = void 0;
            this.setValue();
        };
        ResourceLabel.prototype.render = function (clearIconCache) {
            if (this.label) {
                var configuredLangId = getConfiguredLangId(this.modelService, this.label.resource);
                if (this.lastKnownConfiguredLangId !== configuredLangId) {
                    clearIconCache = true;
                    this.lastKnownConfiguredLangId = configuredLangId;
                }
            }
            if (clearIconCache) {
                this.computedIconClasses = void 0;
            }
            if (!this.label) {
                return;
            }
            var iconLabelOptions = {
                title: '',
                italic: this.options && this.options.italic,
                matches: this.options && this.options.matches,
            };
            var resource = this.label.resource;
            var label = this.label.name;
            if (this.options && typeof this.options.title === 'string') {
                iconLabelOptions.title = this.options.title;
            }
            else if (resource && resource.scheme !== network_1.Schemas.data /* do not accidentally inline Data URIs */) {
                iconLabelOptions.title = labels_1.getPathLabel(resource, void 0, this.environmentService);
            }
            if (!this.computedIconClasses) {
                this.computedIconClasses = getIconClasses(this.modelService, this.modeService, resource, this.options && this.options.fileKind);
            }
            iconLabelOptions.extraClasses = this.computedIconClasses.slice(0);
            if (this.options && this.options.extraClasses) {
                (_a = iconLabelOptions.extraClasses).push.apply(_a, this.options.extraClasses);
            }
            if (this.options && this.options.fileDecorations && resource) {
                var deco = this.decorationsService.getDecoration(resource, this.options.fileKind !== files_1.FileKind.FILE, this.options.fileDecorations.data);
                if (deco) {
                    if (deco.tooltip) {
                        iconLabelOptions.title = iconLabelOptions.title + " \u2022 " + deco.tooltip;
                    }
                    if (this.options.fileDecorations.colors) {
                        iconLabelOptions.extraClasses.push(deco.labelClassName);
                    }
                    if (this.options.fileDecorations.badges) {
                        iconLabelOptions.extraClasses.push(deco.badgeClassName);
                    }
                }
            }
            this.setValue(label, this.label.description, iconLabelOptions);
            var _a;
        };
        ResourceLabel.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            this.label = void 0;
            this.options = void 0;
            this.lastKnownConfiguredLangId = void 0;
            this.computedIconClasses = void 0;
        };
        ResourceLabel = __decorate([
            __param(2, extensions_1.IExtensionService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, modeService_1.IModeService),
            __param(6, modelService_1.IModelService),
            __param(7, environment_1.IEnvironmentService),
            __param(8, decorations_1.IDecorationsService),
            __param(9, themeService_1.IThemeService)
        ], ResourceLabel);
        return ResourceLabel;
    }(iconLabel_1.IconLabel));
    exports.ResourceLabel = ResourceLabel;
    var EditorLabel = /** @class */ (function (_super) {
        __extends(EditorLabel, _super);
        function EditorLabel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EditorLabel.prototype.setEditor = function (editor, options) {
            this.setLabel({
                resource: editor_1.toResource(editor, { supportSideBySide: true }),
                name: editor.getName(),
                description: editor.getDescription()
            }, options);
        };
        return EditorLabel;
    }(ResourceLabel));
    exports.EditorLabel = EditorLabel;
    var FileLabel = /** @class */ (function (_super) {
        __extends(FileLabel, _super);
        function FileLabel(container, options, extensionService, contextService, configurationService, modeService, modelService, environmentService, decorationsService, themeService, untitledEditorService) {
            var _this = _super.call(this, container, options, extensionService, contextService, configurationService, modeService, modelService, environmentService, decorationsService, themeService) || this;
            _this.untitledEditorService = untitledEditorService;
            return _this;
        }
        FileLabel.prototype.setFile = function (resource, options) {
            var hideLabel = options && options.hideLabel;
            var name;
            if (!hideLabel) {
                if (options && options.fileKind === files_1.FileKind.ROOT_FOLDER) {
                    var workspaceFolder = this.contextService.getWorkspaceFolder(resource);
                    if (workspaceFolder) {
                        name = workspaceFolder.name;
                    }
                }
                if (!name) {
                    name = resources.basenameOrAuthority(resource);
                }
            }
            var description;
            var hidePath = (options && options.hidePath) || (resource.scheme === network_1.Schemas.untitled && !this.untitledEditorService.hasAssociatedFilePath(resource));
            if (!hidePath) {
                var rootProvider = void 0;
                if (options && options.root) {
                    rootProvider = {
                        getWorkspaceFolder: function () { return { uri: options.root }; },
                        getWorkspace: function () { return { folders: [{ uri: options.root }] }; },
                    };
                }
                else {
                    rootProvider = this.contextService;
                }
                description = labels_1.getPathLabel(resources.dirname(resource), rootProvider, this.environmentService);
            }
            this.setLabel({ resource: resource, name: name, description: description }, options);
        };
        FileLabel = __decorate([
            __param(2, extensions_1.IExtensionService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, modeService_1.IModeService),
            __param(6, modelService_1.IModelService),
            __param(7, environment_1.IEnvironmentService),
            __param(8, decorations_1.IDecorationsService),
            __param(9, themeService_1.IThemeService),
            __param(10, untitledEditorService_1.IUntitledEditorService)
        ], FileLabel);
        return FileLabel;
    }(ResourceLabel));
    exports.FileLabel = FileLabel;
    function getIconClasses(modelService, modeService, resource, fileKind) {
        // we always set these base classes even if we do not have a path
        var classes = fileKind === files_1.FileKind.ROOT_FOLDER ? ['rootfolder-icon'] : fileKind === files_1.FileKind.FOLDER ? ['folder-icon'] : ['file-icon'];
        if (resource) {
            var name_1 = cssEscape(resources.basenameOrAuthority(resource).toLowerCase());
            // Folders
            if (fileKind === files_1.FileKind.FOLDER) {
                classes.push(name_1 + "-name-folder-icon");
            }
            else {
                // Name
                classes.push(name_1 + "-name-file-icon");
                // Extension(s)
                var dotSegments = name_1.split('.');
                for (var i = 1; i < dotSegments.length; i++) {
                    classes.push(dotSegments.slice(i).join('.') + "-ext-file-icon"); // add each combination of all found extensions if more than one
                }
                classes.push("ext-file-icon"); // extra segment to increase file-ext score
                // Configured Language
                var configuredLangId = getConfiguredLangId(modelService, resource);
                configuredLangId = configuredLangId || modeService.getModeIdByFilenameOrFirstLine(name_1);
                if (configuredLangId) {
                    classes.push(cssEscape(configuredLangId) + "-lang-file-icon");
                }
            }
        }
        return classes;
    }
    exports.getIconClasses = getIconClasses;
    function getConfiguredLangId(modelService, resource) {
        var configuredLangId;
        if (resource) {
            var model = modelService.getModel(resource);
            if (model) {
                var modeId = model.getLanguageIdentifier().language;
                if (modeId && modeId !== modesRegistry_1.PLAINTEXT_MODE_ID) {
                    configuredLangId = modeId; // only take if the mode is specific (aka no just plain text)
                }
            }
        }
        return configuredLangId;
    }
    function cssEscape(val) {
        return val.replace(/\s/g, '\\$&'); // make sure to not introduce CSS classes from files that contain whitespace
    }
});
