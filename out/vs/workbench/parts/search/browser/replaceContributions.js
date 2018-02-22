define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/parts/search/common/replace", "vs/workbench/parts/search/browser/replaceService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, extensions_1, replace_1, replaceService_1, platform_1, contributions_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function registerContributions() {
        extensions_1.registerSingleton(replace_1.IReplaceService, replaceService_1.ReplaceService);
        platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(replaceService_1.ReplacePreviewContentProvider, lifecycle_1.LifecyclePhase.Starting);
    }
    exports.registerContributions = registerContributions;
});
