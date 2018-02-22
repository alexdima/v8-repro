/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, extensionManagement_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function areSameExtensions(a, b) {
        if (a.uuid && b.uuid) {
            return a.uuid === b.uuid;
        }
        if (a.id === b.id) {
            return true;
        }
        return adoptToGalleryExtensionId(a.id) === adoptToGalleryExtensionId(b.id);
    }
    exports.areSameExtensions = areSameExtensions;
    function getGalleryExtensionId(publisher, name) {
        return publisher + "." + name.toLocaleLowerCase();
    }
    exports.getGalleryExtensionId = getGalleryExtensionId;
    function getGalleryExtensionIdFromLocal(local) {
        return getGalleryExtensionId(local.manifest.publisher, local.manifest.name);
    }
    exports.getGalleryExtensionIdFromLocal = getGalleryExtensionIdFromLocal;
    exports.LOCAL_EXTENSION_ID_REGEX = /^([^.]+\..+)-(\d+\.\d+\.\d+(-.*)?)$/;
    function getIdFromLocalExtensionId(localExtensionId) {
        var matches = exports.LOCAL_EXTENSION_ID_REGEX.exec(localExtensionId);
        if (matches && matches[1]) {
            return adoptToGalleryExtensionId(matches[1]);
        }
        return adoptToGalleryExtensionId(localExtensionId);
    }
    exports.getIdFromLocalExtensionId = getIdFromLocalExtensionId;
    function adoptToGalleryExtensionId(id) {
        return id.replace(extensionManagement_1.EXTENSION_IDENTIFIER_REGEX, function (match, publisher, name) { return getGalleryExtensionId(publisher, name); });
    }
    exports.adoptToGalleryExtensionId = adoptToGalleryExtensionId;
    function getLocalExtensionId(id, version) {
        return id + "-" + version;
    }
    exports.getLocalExtensionId = getLocalExtensionId;
    function groupByExtension(extensions, getExtensionIdentifier) {
        var byExtension = [];
        var findGroup = function (extension) {
            for (var _i = 0, byExtension_1 = byExtension; _i < byExtension_1.length; _i++) {
                var group = byExtension_1[_i];
                if (group.some(function (e) { return areSameExtensions(getExtensionIdentifier(e), getExtensionIdentifier(extension)); })) {
                    return group;
                }
            }
            return null;
        };
        for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
            var extension = extensions_1[_i];
            var group = findGroup(extension);
            if (group) {
                group.push(extension);
            }
            else {
                byExtension.push([extension]);
            }
        }
        return byExtension;
    }
    exports.groupByExtension = groupByExtension;
    function getLocalExtensionTelemetryData(extension) {
        return {
            id: getGalleryExtensionIdFromLocal(extension),
            name: extension.manifest.name,
            galleryId: null,
            publisherId: extension.metadata ? extension.metadata.publisherId : null,
            publisherName: extension.manifest.publisher,
            publisherDisplayName: extension.metadata ? extension.metadata.publisherDisplayName : null,
            dependencies: extension.manifest.extensionDependencies && extension.manifest.extensionDependencies.length > 0
        };
    }
    exports.getLocalExtensionTelemetryData = getLocalExtensionTelemetryData;
    /* __GDPR__FRAGMENT__
        "GalleryExtensionTelemetryData" : {
            "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "name": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "galleryId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "publisherId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
            "publisherName": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
            "publisherDisplayName": { "classification": "PublicPersonalData", "purpose": "FeatureInsight" },
            "dependencies": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "${include}": [
                "${GalleryExtensionTelemetryData2}"
            ]
        }
    */
    function getGalleryExtensionTelemetryData(extension) {
        return __assign({ id: extension.identifier.id, name: extension.name, galleryId: extension.identifier.uuid, publisherId: extension.publisherId, publisherName: extension.publisher, publisherDisplayName: extension.publisherDisplayName, dependencies: extension.properties.dependencies.length > 0 }, extension.telemetryData);
    }
    exports.getGalleryExtensionTelemetryData = getGalleryExtensionTelemetryData;
    exports.BetterMergeDisabledNowKey = 'extensions/bettermergedisablednow';
    exports.BetterMergeId = 'pprice.better-merge';
    function getMaliciousExtensionsSet(report) {
        var result = new Set();
        for (var _i = 0, report_1 = report; _i < report_1.length; _i++) {
            var extension = report_1[_i];
            if (extension.malicious) {
                result.add(extension.id.id);
            }
        }
        return result;
    }
    exports.getMaliciousExtensionsSet = getMaliciousExtensionsSet;
});
