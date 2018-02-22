define(["require", "exports", "vs/base/common/paths", "vs/base/common/strings"], function (require, exports, paths, strings_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function basenameOrAuthority(resource) {
        return paths.basename(resource.fsPath) || resource.authority;
    }
    exports.basenameOrAuthority = basenameOrAuthority;
    function isEqualOrParent(resource, candidate, ignoreCase) {
        if (resource.scheme === candidate.scheme && resource.authority === candidate.authority) {
            return paths.isEqualOrParent(resource.fsPath, candidate.fsPath, ignoreCase);
        }
        return false;
    }
    exports.isEqualOrParent = isEqualOrParent;
    function isEqual(first, second, ignoreCase) {
        var identityEquals = (first === second);
        if (identityEquals) {
            return true;
        }
        if (!first || !second) {
            return false;
        }
        if (ignoreCase) {
            return strings_1.equalsIgnoreCase(first.toString(), second.toString());
        }
        return first.toString() === second.toString();
    }
    exports.isEqual = isEqual;
    function dirname(resource) {
        var dirname = paths.dirname(resource.path);
        if (resource.authority && dirname && !paths.isAbsolute(dirname)) {
            return null; // If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character
        }
        return resource.with({
            path: dirname
        });
    }
    exports.dirname = dirname;
    function distinctParents(items, resourceAccessor) {
        var distinctParents = [];
        var _loop_1 = function (i) {
            var candidateResource = resourceAccessor(items[i]);
            if (items.some(function (otherItem, index) {
                if (index === i) {
                    return false;
                }
                return isEqualOrParent(candidateResource, resourceAccessor(otherItem));
            })) {
                return "continue";
            }
            distinctParents.push(items[i]);
        };
        for (var i = 0; i < items.length; i++) {
            _loop_1(i);
        }
        return distinctParents;
    }
    exports.distinctParents = distinctParents;
});
