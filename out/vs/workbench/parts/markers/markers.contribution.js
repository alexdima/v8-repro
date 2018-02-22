define(["require", "exports", "vs/workbench/parts/markers/browser/markersWorkbenchContributions", "vs/workbench/parts/markers/electron-browser/markersElectronContributions", "./browser/markersFileDecorations"], function (require, exports, markersWorkbenchContributions_1, markersElectronContributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    markersWorkbenchContributions_1.registerContributions();
    markersElectronContributions_1.registerContributions();
});
