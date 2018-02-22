define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    //
    // The red-black tree is based on the "Introduction to Algorithms" by Cormen, Leiserson and Rivest.
    //
    /**
     * The class name sort order must match the severity order. Highest severity last.
     */
    exports.ClassName = {
        EditorInfoDecoration: 'squiggly-a-info',
        EditorWarningDecoration: 'squiggly-b-warning',
        EditorErrorDecoration: 'squiggly-c-error'
    };
    /**
     * Describes the behavior of decorations when typing/editing near their edges.
     * Note: Please do not edit the values, as they very carefully match `DecorationRangeBehavior`
     */
    var TrackedRangeStickiness;
    (function (TrackedRangeStickiness) {
        TrackedRangeStickiness[TrackedRangeStickiness["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
        TrackedRangeStickiness[TrackedRangeStickiness["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
        TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
        TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
    })(TrackedRangeStickiness || (TrackedRangeStickiness = {}));
    var NodeColor;
    (function (NodeColor) {
        NodeColor[NodeColor["Black"] = 0] = "Black";
        NodeColor[NodeColor["Red"] = 1] = "Red";
    })(NodeColor = exports.NodeColor || (exports.NodeColor = {}));
    var Constants;
    (function (Constants) {
        Constants[Constants["ColorMask"] = 1] = "ColorMask";
        Constants[Constants["ColorMaskInverse"] = 254] = "ColorMaskInverse";
        Constants[Constants["ColorOffset"] = 0] = "ColorOffset";
        Constants[Constants["IsVisitedMask"] = 2] = "IsVisitedMask";
        Constants[Constants["IsVisitedMaskInverse"] = 253] = "IsVisitedMaskInverse";
        Constants[Constants["IsVisitedOffset"] = 1] = "IsVisitedOffset";
        Constants[Constants["IsForValidationMask"] = 4] = "IsForValidationMask";
        Constants[Constants["IsForValidationMaskInverse"] = 251] = "IsForValidationMaskInverse";
        Constants[Constants["IsForValidationOffset"] = 2] = "IsForValidationOffset";
        Constants[Constants["IsInOverviewRulerMask"] = 8] = "IsInOverviewRulerMask";
        Constants[Constants["IsInOverviewRulerMaskInverse"] = 247] = "IsInOverviewRulerMaskInverse";
        Constants[Constants["IsInOverviewRulerOffset"] = 3] = "IsInOverviewRulerOffset";
        Constants[Constants["StickinessMask"] = 48] = "StickinessMask";
        Constants[Constants["StickinessMaskInverse"] = 207] = "StickinessMaskInverse";
        Constants[Constants["StickinessOffset"] = 4] = "StickinessOffset";
        /**
         * Due to how deletion works (in order to avoid always walking the right subtree of the deleted node),
         * the deltas for nodes can grow and shrink dramatically. It has been observed, in practice, that unless
         * the deltas are corrected, integer overflow will occur.
         *
         * The integer overflow occurs when 53 bits are used in the numbers, but we will try to avoid it as
         * a node's delta gets below a negative 30 bits number.
         *
         * MIN SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MIN_SAFE_DELTA"] = -1073741824] = "MIN_SAFE_DELTA";
        /**
         * MAX SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MAX_SAFE_DELTA"] = 1073741824] = "MAX_SAFE_DELTA";
    })(Constants || (Constants = {}));
    function getNodeColor(node) {
        return ((node.metadata & 1 /* ColorMask */) >>> 0 /* ColorOffset */);
    }
    exports.getNodeColor = getNodeColor;
    function setNodeColor(node, color) {
        node.metadata = ((node.metadata & 254 /* ColorMaskInverse */) | (color << 0 /* ColorOffset */));
    }
    function getNodeIsVisited(node) {
        return ((node.metadata & 2 /* IsVisitedMask */) >>> 1 /* IsVisitedOffset */) === 1;
    }
    function setNodeIsVisited(node, value) {
        node.metadata = ((node.metadata & 253 /* IsVisitedMaskInverse */) | ((value ? 1 : 0) << 1 /* IsVisitedOffset */));
    }
    function getNodeIsForValidation(node) {
        return ((node.metadata & 4 /* IsForValidationMask */) >>> 2 /* IsForValidationOffset */) === 1;
    }
    function setNodeIsForValidation(node, value) {
        node.metadata = ((node.metadata & 251 /* IsForValidationMaskInverse */) | ((value ? 1 : 0) << 2 /* IsForValidationOffset */));
    }
    function getNodeIsInOverviewRuler(node) {
        return ((node.metadata & 8 /* IsInOverviewRulerMask */) >>> 3 /* IsInOverviewRulerOffset */) === 1;
    }
    exports.getNodeIsInOverviewRuler = getNodeIsInOverviewRuler;
    function setNodeIsInOverviewRuler(node, value) {
        node.metadata = ((node.metadata & 247 /* IsInOverviewRulerMaskInverse */) | ((value ? 1 : 0) << 3 /* IsInOverviewRulerOffset */));
    }
    function getNodeStickiness(node) {
        return ((node.metadata & 48 /* StickinessMask */) >>> 4 /* StickinessOffset */);
    }
    function setNodeStickiness(node, stickiness) {
        node.metadata = ((node.metadata & 207 /* StickinessMaskInverse */) | (stickiness << 4 /* StickinessOffset */));
    }
    var IntervalNode = /** @class */ (function () {
        function IntervalNode(id, start, end) {
            this.metadata = 0;
            this.parent = null;
            this.left = null;
            this.right = null;
            setNodeColor(this, 1 /* Red */);
            this.start = start;
            this.end = end;
            // FORCE_OVERFLOWING_TEST: this.delta = start;
            this.delta = 0;
            this.maxEnd = end;
            this.id = id;
            this.ownerId = 0;
            this.options = null;
            setNodeIsForValidation(this, false);
            setNodeStickiness(this, 1 /* NeverGrowsWhenTypingAtEdges */);
            setNodeIsInOverviewRuler(this, false);
            this.cachedVersionId = 0;
            this.cachedAbsoluteStart = start;
            this.cachedAbsoluteEnd = end;
            this.range = null;
            setNodeIsVisited(this, false);
        }
        IntervalNode.prototype.reset = function (versionId, start, end, range) {
            this.start = start;
            this.end = end;
            this.maxEnd = end;
            this.cachedVersionId = versionId;
            this.cachedAbsoluteStart = start;
            this.cachedAbsoluteEnd = end;
            this.range = range;
        };
        IntervalNode.prototype.setOptions = function (options) {
            this.options = options;
            var className = this.options.className;
            setNodeIsForValidation(this, (className === exports.ClassName.EditorErrorDecoration
                || className === exports.ClassName.EditorWarningDecoration
                || className === exports.ClassName.EditorInfoDecoration));
            setNodeStickiness(this, this.options.stickiness);
            setNodeIsInOverviewRuler(this, this.options.overviewRuler.color ? true : false);
        };
        IntervalNode.prototype.setCachedOffsets = function (absoluteStart, absoluteEnd, cachedVersionId) {
            if (this.cachedVersionId !== cachedVersionId) {
                this.range = null;
            }
            this.cachedVersionId = cachedVersionId;
            this.cachedAbsoluteStart = absoluteStart;
            this.cachedAbsoluteEnd = absoluteEnd;
        };
        IntervalNode.prototype.detach = function () {
            this.parent = null;
            this.left = null;
            this.right = null;
        };
        return IntervalNode;
    }());
    exports.IntervalNode = IntervalNode;
    exports.SENTINEL = new IntervalNode(null, 0, 0);
    exports.SENTINEL.parent = exports.SENTINEL;
    exports.SENTINEL.left = exports.SENTINEL;
    exports.SENTINEL.right = exports.SENTINEL;
    setNodeColor(exports.SENTINEL, 0 /* Black */);
    var IntervalTree = /** @class */ (function () {
        function IntervalTree() {
            this.root = exports.SENTINEL;
            this.requestNormalizeDelta = false;
        }
        IntervalTree.prototype.intervalSearch = function (start, end, filterOwnerId, filterOutValidation, cachedVersionId) {
            if (this.root === exports.SENTINEL) {
                return [];
            }
            return intervalSearch(this, start, end, filterOwnerId, filterOutValidation, cachedVersionId);
        };
        IntervalTree.prototype.search = function (filterOwnerId, filterOutValidation, cachedVersionId) {
            if (this.root === exports.SENTINEL) {
                return [];
            }
            return search(this, filterOwnerId, filterOutValidation, cachedVersionId);
        };
        /**
         * Will not set `cachedAbsoluteStart` nor `cachedAbsoluteEnd` on the returned nodes!
         */
        IntervalTree.prototype.collectNodesFromOwner = function (ownerId) {
            return collectNodesFromOwner(this, ownerId);
        };
        /**
         * Will not set `cachedAbsoluteStart` nor `cachedAbsoluteEnd` on the returned nodes!
         */
        IntervalTree.prototype.collectNodesPostOrder = function () {
            return collectNodesPostOrder(this);
        };
        IntervalTree.prototype.insert = function (node) {
            rbTreeInsert(this, node);
            this._normalizeDeltaIfNecessary();
        };
        IntervalTree.prototype.delete = function (node) {
            rbTreeDelete(this, node);
            this._normalizeDeltaIfNecessary();
        };
        IntervalTree.prototype.resolveNode = function (node, cachedVersionId) {
            var initialNode = node;
            var delta = 0;
            while (node !== this.root) {
                if (node === node.parent.right) {
                    delta += node.parent.delta;
                }
                node = node.parent;
            }
            var nodeStart = initialNode.start + delta;
            var nodeEnd = initialNode.end + delta;
            initialNode.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
        };
        IntervalTree.prototype.acceptReplace = function (offset, length, textLength, forceMoveMarkers) {
            // Our strategy is to remove all directly impacted nodes, and then add them back to the tree.
            // (1) collect all nodes that are intersecting this edit as nodes of interest
            var nodesOfInterest = searchForEditing(this, offset, offset + length);
            // (2) remove all nodes that are intersecting this edit
            for (var i = 0, len = nodesOfInterest.length; i < len; i++) {
                var node = nodesOfInterest[i];
                rbTreeDelete(this, node);
            }
            this._normalizeDeltaIfNecessary();
            // (3) edit all tree nodes except the nodes of interest
            noOverlapReplace(this, offset, offset + length, textLength);
            this._normalizeDeltaIfNecessary();
            // (4) edit the nodes of interest and insert them back in the tree
            for (var i = 0, len = nodesOfInterest.length; i < len; i++) {
                var node = nodesOfInterest[i];
                node.start = node.cachedAbsoluteStart;
                node.end = node.cachedAbsoluteEnd;
                nodeAcceptEdit(node, offset, (offset + length), textLength, forceMoveMarkers);
                node.maxEnd = node.end;
                rbTreeInsert(this, node);
            }
            this._normalizeDeltaIfNecessary();
        };
        IntervalTree.prototype.getAllInOrder = function () {
            return search(this, 0, false, 0);
        };
        IntervalTree.prototype._normalizeDeltaIfNecessary = function () {
            if (!this.requestNormalizeDelta) {
                return;
            }
            this.requestNormalizeDelta = false;
            normalizeDelta(this);
        };
        return IntervalTree;
    }());
    exports.IntervalTree = IntervalTree;
    //#region Delta Normalization
    function normalizeDelta(T) {
        var node = T.root;
        var delta = 0;
        while (node !== exports.SENTINEL) {
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
            // handle current node
            node.start = delta + node.start;
            node.end = delta + node.end;
            node.delta = 0;
            recomputeMaxEnd(node);
            setNodeIsVisited(node, true);
            // going up from this node
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
        }
        setNodeIsVisited(T.root, false);
    }
    //#endregion
    //#region Editing
    var MarkerMoveSemantics;
    (function (MarkerMoveSemantics) {
        MarkerMoveSemantics[MarkerMoveSemantics["MarkerDefined"] = 0] = "MarkerDefined";
        MarkerMoveSemantics[MarkerMoveSemantics["ForceMove"] = 1] = "ForceMove";
        MarkerMoveSemantics[MarkerMoveSemantics["ForceStay"] = 2] = "ForceStay";
    })(MarkerMoveSemantics || (MarkerMoveSemantics = {}));
    function adjustMarkerBeforeColumn(markerOffset, markerStickToPreviousCharacter, checkOffset, moveSemantics) {
        if (markerOffset < checkOffset) {
            return true;
        }
        if (markerOffset > checkOffset) {
            return false;
        }
        if (moveSemantics === 1 /* ForceMove */) {
            return false;
        }
        if (moveSemantics === 2 /* ForceStay */) {
            return true;
        }
        return markerStickToPreviousCharacter;
    }
    /**
     * This is a lot more complicated than strictly necessary to maintain the same behaviour
     * as when decorations were implemented using two markers.
     */
    function nodeAcceptEdit(node, start, end, textLength, forceMoveMarkers) {
        var nodeStickiness = getNodeStickiness(node);
        var startStickToPreviousCharacter = (nodeStickiness === 0 /* AlwaysGrowsWhenTypingAtEdges */
            || nodeStickiness === 2 /* GrowsOnlyWhenTypingBefore */);
        var endStickToPreviousCharacter = (nodeStickiness === 1 /* NeverGrowsWhenTypingAtEdges */
            || nodeStickiness === 2 /* GrowsOnlyWhenTypingBefore */);
        var deletingCnt = (end - start);
        var insertingCnt = textLength;
        var commonLength = Math.min(deletingCnt, insertingCnt);
        var nodeStart = node.start;
        var startDone = false;
        var nodeEnd = node.end;
        var endDone = false;
        {
            var moveSemantics = forceMoveMarkers ? 1 /* ForceMove */ : (deletingCnt > 0 ? 2 /* ForceStay */ : 0 /* MarkerDefined */);
            if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start, moveSemantics)) {
                startDone = true;
            }
            if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start, moveSemantics)) {
                endDone = true;
            }
        }
        if (commonLength > 0 && !forceMoveMarkers) {
            var moveSemantics = (deletingCnt > insertingCnt ? 2 /* ForceStay */ : 0 /* MarkerDefined */);
            if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start + commonLength, moveSemantics)) {
                startDone = true;
            }
            if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start + commonLength, moveSemantics)) {
                endDone = true;
            }
        }
        {
            var moveSemantics = forceMoveMarkers ? 1 /* ForceMove */ : 0 /* MarkerDefined */;
            if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, end, moveSemantics)) {
                node.start = start + insertingCnt;
                startDone = true;
            }
            if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, end, moveSemantics)) {
                node.end = start + insertingCnt;
                endDone = true;
            }
        }
        // Finish
        var deltaColumn = (insertingCnt - deletingCnt);
        if (!startDone) {
            node.start = Math.max(0, nodeStart + deltaColumn);
            startDone = true;
        }
        if (!endDone) {
            node.end = Math.max(0, nodeEnd + deltaColumn);
            endDone = true;
        }
        if (node.start > node.end) {
            node.end = node.start;
        }
    }
    function searchForEditing(T, start, end) {
        // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
        // Now, it is known that two intervals A and B overlap only when both
        // A.low <= B.high and A.high >= B.low. When searching the trees for
        // nodes overlapping with a given interval, you can immediately skip:
        //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
        //  b) all nodes that have their maximum 'high' value below the start of the given interval.
        var node = T.root;
        var delta = 0;
        var nodeMaxEnd = 0;
        var nodeStart = 0;
        var nodeEnd = 0;
        var result = [];
        var resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                node = node.parent;
                continue;
            }
            if (!getNodeIsVisited(node.left)) {
                // first time seeing this node
                nodeMaxEnd = delta + node.maxEnd;
                if (nodeMaxEnd < start) {
                    // cover case b) from above
                    // there is no need to search this node or its children
                    setNodeIsVisited(node, true);
                    continue;
                }
                if (node.left !== exports.SENTINEL) {
                    // go left
                    node = node.left;
                    continue;
                }
            }
            // handle current node
            nodeStart = delta + node.start;
            if (nodeStart > end) {
                // cover case a) from above
                // there is no need to search this node or its right subtree
                setNodeIsVisited(node, true);
                continue;
            }
            nodeEnd = delta + node.end;
            if (nodeEnd >= start) {
                node.setCachedOffsets(nodeStart, nodeEnd, 0);
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function noOverlapReplace(T, start, end, textLength) {
        // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
        // Now, it is known that two intervals A and B overlap only when both
        // A.low <= B.high and A.high >= B.low. When searching the trees for
        // nodes overlapping with a given interval, you can immediately skip:
        //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
        //  b) all nodes that have their maximum 'high' value below the start of the given interval.
        var node = T.root;
        var delta = 0;
        var nodeMaxEnd = 0;
        var nodeStart = 0;
        var editDelta = (textLength - (end - start));
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                recomputeMaxEnd(node);
                node = node.parent;
                continue;
            }
            if (!getNodeIsVisited(node.left)) {
                // first time seeing this node
                nodeMaxEnd = delta + node.maxEnd;
                if (nodeMaxEnd < start) {
                    // cover case b) from above
                    // there is no need to search this node or its children
                    setNodeIsVisited(node, true);
                    continue;
                }
                if (node.left !== exports.SENTINEL) {
                    // go left
                    node = node.left;
                    continue;
                }
            }
            // handle current node
            nodeStart = delta + node.start;
            if (nodeStart > end) {
                node.start += editDelta;
                node.end += editDelta;
                node.delta += editDelta;
                if (node.delta < -1073741824 /* MIN_SAFE_DELTA */ || node.delta > 1073741824 /* MAX_SAFE_DELTA */) {
                    T.requestNormalizeDelta = true;
                }
                // cover case a) from above
                // there is no need to search this node or its right subtree
                setNodeIsVisited(node, true);
                continue;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
    }
    //#endregion
    //#region Searching
    function collectNodesFromOwner(T, ownerId) {
        var node = T.root;
        var result = [];
        var resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                node = node.parent;
                continue;
            }
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            // handle current node
            if (node.ownerId === ownerId) {
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function collectNodesPostOrder(T) {
        var node = T.root;
        var result = [];
        var resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                node = node.parent;
                continue;
            }
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                node = node.right;
                continue;
            }
            // handle current node
            result[resultLen++] = node;
            setNodeIsVisited(node, true);
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function search(T, filterOwnerId, filterOutValidation, cachedVersionId) {
        var node = T.root;
        var delta = 0;
        var nodeStart = 0;
        var nodeEnd = 0;
        var result = [];
        var resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                node = node.parent;
                continue;
            }
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            // handle current node
            nodeStart = delta + node.start;
            nodeEnd = delta + node.end;
            node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
            var include = true;
            if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
                include = false;
            }
            if (filterOutValidation && getNodeIsForValidation(node)) {
                include = false;
            }
            if (include) {
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function intervalSearch(T, intervalStart, intervalEnd, filterOwnerId, filterOutValidation, cachedVersionId) {
        // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
        // Now, it is known that two intervals A and B overlap only when both
        // A.low <= B.high and A.high >= B.low. When searching the trees for
        // nodes overlapping with a given interval, you can immediately skip:
        //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
        //  b) all nodes that have their maximum 'high' value below the start of the given interval.
        var node = T.root;
        var delta = 0;
        var nodeMaxEnd = 0;
        var nodeStart = 0;
        var nodeEnd = 0;
        var result = [];
        var resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                node = node.parent;
                continue;
            }
            if (!getNodeIsVisited(node.left)) {
                // first time seeing this node
                nodeMaxEnd = delta + node.maxEnd;
                if (nodeMaxEnd < intervalStart) {
                    // cover case b) from above
                    // there is no need to search this node or its children
                    setNodeIsVisited(node, true);
                    continue;
                }
                if (node.left !== exports.SENTINEL) {
                    // go left
                    node = node.left;
                    continue;
                }
            }
            // handle current node
            nodeStart = delta + node.start;
            if (nodeStart > intervalEnd) {
                // cover case a) from above
                // there is no need to search this node or its right subtree
                setNodeIsVisited(node, true);
                continue;
            }
            nodeEnd = delta + node.end;
            if (nodeEnd >= intervalStart) {
                // There is overlap
                node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
                var include = true;
                if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
                    include = false;
                }
                if (filterOutValidation && getNodeIsForValidation(node)) {
                    include = false;
                }
                if (include) {
                    result[resultLen++] = node;
                }
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    //#endregion
    //#region Insertion
    function rbTreeInsert(T, newNode) {
        if (T.root === exports.SENTINEL) {
            newNode.parent = exports.SENTINEL;
            newNode.left = exports.SENTINEL;
            newNode.right = exports.SENTINEL;
            setNodeColor(newNode, 0 /* Black */);
            T.root = newNode;
            return T.root;
        }
        treeInsert(T, newNode);
        recomputeMaxEndWalkToRoot(newNode.parent);
        // repair tree
        var x = newNode;
        while (x !== T.root && getNodeColor(x.parent) === 1 /* Red */) {
            if (x.parent === x.parent.parent.left) {
                var y = x.parent.parent.right;
                if (getNodeColor(y) === 1 /* Red */) {
                    setNodeColor(x.parent, 0 /* Black */);
                    setNodeColor(y, 0 /* Black */);
                    setNodeColor(x.parent.parent, 1 /* Red */);
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.right) {
                        x = x.parent;
                        leftRotate(T, x);
                    }
                    setNodeColor(x.parent, 0 /* Black */);
                    setNodeColor(x.parent.parent, 1 /* Red */);
                    rightRotate(T, x.parent.parent);
                }
            }
            else {
                var y = x.parent.parent.left;
                if (getNodeColor(y) === 1 /* Red */) {
                    setNodeColor(x.parent, 0 /* Black */);
                    setNodeColor(y, 0 /* Black */);
                    setNodeColor(x.parent.parent, 1 /* Red */);
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.left) {
                        x = x.parent;
                        rightRotate(T, x);
                    }
                    setNodeColor(x.parent, 0 /* Black */);
                    setNodeColor(x.parent.parent, 1 /* Red */);
                    leftRotate(T, x.parent.parent);
                }
            }
        }
        setNodeColor(T.root, 0 /* Black */);
        return newNode;
    }
    function treeInsert(T, z) {
        var delta = 0;
        var x = T.root;
        var zAbsoluteStart = z.start;
        var zAbsoluteEnd = z.end;
        while (true) {
            var cmp = intervalCompare(zAbsoluteStart, zAbsoluteEnd, x.start + delta, x.end + delta);
            if (cmp < 0) {
                // this node should be inserted to the left
                // => it is not affected by the node's delta
                if (x.left === exports.SENTINEL) {
                    z.start -= delta;
                    z.end -= delta;
                    z.maxEnd -= delta;
                    x.left = z;
                    break;
                }
                else {
                    x = x.left;
                }
            }
            else {
                // this node should be inserted to the right
                // => it is not affected by the node's delta
                if (x.right === exports.SENTINEL) {
                    z.start -= (delta + x.delta);
                    z.end -= (delta + x.delta);
                    z.maxEnd -= (delta + x.delta);
                    x.right = z;
                    break;
                }
                else {
                    delta += x.delta;
                    x = x.right;
                }
            }
        }
        z.parent = x;
        z.left = exports.SENTINEL;
        z.right = exports.SENTINEL;
        setNodeColor(z, 1 /* Red */);
    }
    //#endregion
    //#region Deletion
    function rbTreeDelete(T, z) {
        var x;
        var y;
        // RB-DELETE except we don't swap z and y in case c)
        // i.e. we always delete what's pointed at by z.
        if (z.left === exports.SENTINEL) {
            x = z.right;
            y = z;
            // x's delta is no longer influenced by z's delta
            x.delta += z.delta;
            if (x.delta < -1073741824 /* MIN_SAFE_DELTA */ || x.delta > 1073741824 /* MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
            x.start += z.delta;
            x.end += z.delta;
        }
        else if (z.right === exports.SENTINEL) {
            x = z.left;
            y = z;
        }
        else {
            y = leftest(z.right);
            x = y.right;
            // y's delta is no longer influenced by z's delta,
            // but we don't want to walk the entire right-hand-side subtree of x.
            // we therefore maintain z's delta in y, and adjust only x
            x.start += y.delta;
            x.end += y.delta;
            x.delta += y.delta;
            if (x.delta < -1073741824 /* MIN_SAFE_DELTA */ || x.delta > 1073741824 /* MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
            y.start += z.delta;
            y.end += z.delta;
            y.delta = z.delta;
            if (y.delta < -1073741824 /* MIN_SAFE_DELTA */ || y.delta > 1073741824 /* MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
        }
        if (y === T.root) {
            T.root = x;
            setNodeColor(x, 0 /* Black */);
            z.detach();
            resetSentinel();
            recomputeMaxEnd(x);
            T.root.parent = exports.SENTINEL;
            return;
        }
        var yWasRed = (getNodeColor(y) === 1 /* Red */);
        if (y === y.parent.left) {
            y.parent.left = x;
        }
        else {
            y.parent.right = x;
        }
        if (y === z) {
            x.parent = y.parent;
        }
        else {
            if (y.parent === z) {
                x.parent = y;
            }
            else {
                x.parent = y.parent;
            }
            y.left = z.left;
            y.right = z.right;
            y.parent = z.parent;
            setNodeColor(y, getNodeColor(z));
            if (z === T.root) {
                T.root = y;
            }
            else {
                if (z === z.parent.left) {
                    z.parent.left = y;
                }
                else {
                    z.parent.right = y;
                }
            }
            if (y.left !== exports.SENTINEL) {
                y.left.parent = y;
            }
            if (y.right !== exports.SENTINEL) {
                y.right.parent = y;
            }
        }
        z.detach();
        if (yWasRed) {
            recomputeMaxEndWalkToRoot(x.parent);
            if (y !== z) {
                recomputeMaxEndWalkToRoot(y);
                recomputeMaxEndWalkToRoot(y.parent);
            }
            resetSentinel();
            return;
        }
        recomputeMaxEndWalkToRoot(x);
        recomputeMaxEndWalkToRoot(x.parent);
        if (y !== z) {
            recomputeMaxEndWalkToRoot(y);
            recomputeMaxEndWalkToRoot(y.parent);
        }
        // RB-DELETE-FIXUP
        var w;
        while (x !== T.root && getNodeColor(x) === 0 /* Black */) {
            if (x === x.parent.left) {
                w = x.parent.right;
                if (getNodeColor(w) === 1 /* Red */) {
                    setNodeColor(w, 0 /* Black */);
                    setNodeColor(x.parent, 1 /* Red */);
                    leftRotate(T, x.parent);
                    w = x.parent.right;
                }
                if (getNodeColor(w.left) === 0 /* Black */ && getNodeColor(w.right) === 0 /* Black */) {
                    setNodeColor(w, 1 /* Red */);
                    x = x.parent;
                }
                else {
                    if (getNodeColor(w.right) === 0 /* Black */) {
                        setNodeColor(w.left, 0 /* Black */);
                        setNodeColor(w, 1 /* Red */);
                        rightRotate(T, w);
                        w = x.parent.right;
                    }
                    setNodeColor(w, getNodeColor(x.parent));
                    setNodeColor(x.parent, 0 /* Black */);
                    setNodeColor(w.right, 0 /* Black */);
                    leftRotate(T, x.parent);
                    x = T.root;
                }
            }
            else {
                w = x.parent.left;
                if (getNodeColor(w) === 1 /* Red */) {
                    setNodeColor(w, 0 /* Black */);
                    setNodeColor(x.parent, 1 /* Red */);
                    rightRotate(T, x.parent);
                    w = x.parent.left;
                }
                if (getNodeColor(w.left) === 0 /* Black */ && getNodeColor(w.right) === 0 /* Black */) {
                    setNodeColor(w, 1 /* Red */);
                    x = x.parent;
                }
                else {
                    if (getNodeColor(w.left) === 0 /* Black */) {
                        setNodeColor(w.right, 0 /* Black */);
                        setNodeColor(w, 1 /* Red */);
                        leftRotate(T, w);
                        w = x.parent.left;
                    }
                    setNodeColor(w, getNodeColor(x.parent));
                    setNodeColor(x.parent, 0 /* Black */);
                    setNodeColor(w.left, 0 /* Black */);
                    rightRotate(T, x.parent);
                    x = T.root;
                }
            }
        }
        setNodeColor(x, 0 /* Black */);
        resetSentinel();
    }
    function leftest(node) {
        while (node.left !== exports.SENTINEL) {
            node = node.left;
        }
        return node;
    }
    function resetSentinel() {
        exports.SENTINEL.parent = exports.SENTINEL;
        exports.SENTINEL.delta = 0; // optional
        exports.SENTINEL.start = 0; // optional
        exports.SENTINEL.end = 0; // optional
    }
    //#endregion
    //#region Rotations
    function leftRotate(T, x) {
        var y = x.right; // set y.
        y.delta += x.delta; // y's delta is no longer influenced by x's delta
        if (y.delta < -1073741824 /* MIN_SAFE_DELTA */ || y.delta > 1073741824 /* MAX_SAFE_DELTA */) {
            T.requestNormalizeDelta = true;
        }
        y.start += x.delta;
        y.end += x.delta;
        x.right = y.left; // turn y's left subtree into x's right subtree.
        if (y.left !== exports.SENTINEL) {
            y.left.parent = x;
        }
        y.parent = x.parent; // link x's parent to y.
        if (x.parent === exports.SENTINEL) {
            T.root = y;
        }
        else if (x === x.parent.left) {
            x.parent.left = y;
        }
        else {
            x.parent.right = y;
        }
        y.left = x; // put x on y's left.
        x.parent = y;
        recomputeMaxEnd(x);
        recomputeMaxEnd(y);
    }
    function rightRotate(T, y) {
        var x = y.left;
        y.delta -= x.delta;
        if (y.delta < -1073741824 /* MIN_SAFE_DELTA */ || y.delta > 1073741824 /* MAX_SAFE_DELTA */) {
            T.requestNormalizeDelta = true;
        }
        y.start -= x.delta;
        y.end -= x.delta;
        y.left = x.right;
        if (x.right !== exports.SENTINEL) {
            x.right.parent = y;
        }
        x.parent = y.parent;
        if (y.parent === exports.SENTINEL) {
            T.root = x;
        }
        else if (y === y.parent.right) {
            y.parent.right = x;
        }
        else {
            y.parent.left = x;
        }
        x.right = y;
        y.parent = x;
        recomputeMaxEnd(y);
        recomputeMaxEnd(x);
    }
    //#endregion
    //#region max end computation
    function computeMaxEnd(node) {
        var maxEnd = node.end;
        if (node.left !== exports.SENTINEL) {
            var leftMaxEnd = node.left.maxEnd;
            if (leftMaxEnd > maxEnd) {
                maxEnd = leftMaxEnd;
            }
        }
        if (node.right !== exports.SENTINEL) {
            var rightMaxEnd = node.right.maxEnd + node.delta;
            if (rightMaxEnd > maxEnd) {
                maxEnd = rightMaxEnd;
            }
        }
        return maxEnd;
    }
    function recomputeMaxEnd(node) {
        node.maxEnd = computeMaxEnd(node);
    }
    exports.recomputeMaxEnd = recomputeMaxEnd;
    function recomputeMaxEndWalkToRoot(node) {
        while (node !== exports.SENTINEL) {
            var maxEnd = computeMaxEnd(node);
            if (node.maxEnd === maxEnd) {
                // no need to go further
                return;
            }
            node.maxEnd = maxEnd;
            node = node.parent;
        }
    }
    //#endregion
    //#region utils
    function intervalCompare(aStart, aEnd, bStart, bEnd) {
        if (aStart === bStart) {
            return aEnd - bEnd;
        }
        return aStart - bStart;
    }
    exports.intervalCompare = intervalCompare;
});
//#endregion
