/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/parts/quickopen/common/quickOpenScorer", "vs/base/common/uri", "vs/base/common/paths", "vs/base/common/platform"], function (require, exports, assert, scorer, uri_1, paths_1, platform_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResourceAccessorClass = /** @class */ (function () {
        function ResourceAccessorClass() {
        }
        ResourceAccessorClass.prototype.getItemLabel = function (resource) {
            return paths_1.basename(resource.fsPath);
        };
        ResourceAccessorClass.prototype.getItemDescription = function (resource) {
            return paths_1.dirname(resource.fsPath);
        };
        ResourceAccessorClass.prototype.getItemPath = function (resource) {
            return resource.fsPath;
        };
        return ResourceAccessorClass;
    }());
    var ResourceAccessor = new ResourceAccessorClass();
    var NullAccessorClass = /** @class */ (function () {
        function NullAccessorClass() {
        }
        NullAccessorClass.prototype.getItemLabel = function (resource) {
            return void 0;
        };
        NullAccessorClass.prototype.getItemDescription = function (resource) {
            return void 0;
        };
        NullAccessorClass.prototype.getItemPath = function (resource) {
            return void 0;
        };
        return NullAccessorClass;
    }());
    function _doScore(target, query, fuzzy) {
        return scorer.score(target, query, query.toLowerCase(), fuzzy);
    }
    function scoreItem(item, query, fuzzy, accessor, cache) {
        return scorer.scoreItem(item, scorer.prepareQuery(query), fuzzy, accessor, cache);
    }
    function compareItemsByScore(itemA, itemB, query, fuzzy, accessor, cache, fallbackComparer) {
        if (fallbackComparer === void 0) { fallbackComparer = scorer.fallbackCompare; }
        return scorer.compareItemsByScore(itemA, itemB, scorer.prepareQuery(query), fuzzy, accessor, cache, fallbackComparer);
    }
    var NullAccessor = new NullAccessorClass();
    var cache = Object.create(null);
    suite('Quick Open Scorer', function () {
        setup(function () {
            cache = Object.create(null);
        });
        test('score (fuzzy)', function () {
            var target = 'HeLlo-World';
            var scores = [];
            scores.push(_doScore(target, 'HelLo-World', true)); // direct case match
            scores.push(_doScore(target, 'hello-world', true)); // direct mix-case match
            scores.push(_doScore(target, 'HW', true)); // direct case prefix (multiple)
            scores.push(_doScore(target, 'hw', true)); // direct mix-case prefix (multiple)
            scores.push(_doScore(target, 'H', true)); // direct case prefix
            scores.push(_doScore(target, 'h', true)); // direct mix-case prefix
            scores.push(_doScore(target, 'ld', true)); // in-string mix-case match (consecutive, avoids scattered hit)
            scores.push(_doScore(target, 'W', true)); // direct case word prefix
            scores.push(_doScore(target, 'w', true)); // direct mix-case word prefix
            scores.push(_doScore(target, 'Ld', true)); // in-string case match (multiple)
            scores.push(_doScore(target, 'L', true)); // in-string case match
            scores.push(_doScore(target, 'l', true)); // in-string mix-case match
            scores.push(_doScore(target, '4', true)); // no match
            // Assert scoring order
            var sortedScores = scores.concat().sort(function (a, b) { return b[0] - a[0]; });
            assert.deepEqual(scores, sortedScores);
            // Assert scoring positions
            var positions = scores[0][1];
            assert.equal(positions.length, 'HelLo-World'.length);
            positions = scores[2][1];
            assert.equal(positions.length, 'HW'.length);
            assert.equal(positions[0], 0);
            assert.equal(positions[1], 6);
        });
        test('score (non fuzzy)', function () {
            var target = 'HeLlo-World';
            assert.ok(_doScore(target, 'HelLo-World', false)[0] > 0);
            assert.equal(_doScore(target, 'HelLo-World', false)[1].length, 'HelLo-World'.length);
            assert.ok(_doScore(target, 'hello-world', false)[0] > 0);
            assert.equal(_doScore(target, 'HW', false)[0], 0);
            assert.ok(_doScore(target, 'h', false)[0] > 0);
            assert.ok(_doScore(target, 'ello', false)[0] > 0);
            assert.ok(_doScore(target, 'ld', false)[0] > 0);
            assert.equal(_doScore(target, 'eo', false)[0], 0);
        });
        test('scoreItem - matches are proper', function () {
            var res = scoreItem(null, 'something', true, ResourceAccessor, cache);
            assert.ok(!res.score);
            var resource = uri_1.default.file('/xyz/some/path/someFile123.txt');
            res = scoreItem(resource, 'something', true, NullAccessor, cache);
            assert.ok(!res.score);
            // Path Identity
            var identityRes = scoreItem(resource, ResourceAccessor.getItemPath(resource), true, ResourceAccessor, cache);
            assert.ok(identityRes.score);
            assert.equal(identityRes.descriptionMatch.length, 1);
            assert.equal(identityRes.labelMatch.length, 1);
            assert.equal(identityRes.descriptionMatch[0].start, 0);
            assert.equal(identityRes.descriptionMatch[0].end, ResourceAccessor.getItemDescription(resource).length);
            assert.equal(identityRes.labelMatch[0].start, 0);
            assert.equal(identityRes.labelMatch[0].end, ResourceAccessor.getItemLabel(resource).length);
            // Basename Prefix
            var basenamePrefixRes = scoreItem(resource, 'som', true, ResourceAccessor, cache);
            assert.ok(basenamePrefixRes.score);
            assert.ok(!basenamePrefixRes.descriptionMatch);
            assert.equal(basenamePrefixRes.labelMatch.length, 1);
            assert.equal(basenamePrefixRes.labelMatch[0].start, 0);
            assert.equal(basenamePrefixRes.labelMatch[0].end, 'som'.length);
            // Basename Camelcase
            var basenameCamelcaseRes = scoreItem(resource, 'sF', true, ResourceAccessor, cache);
            assert.ok(basenameCamelcaseRes.score);
            assert.ok(!basenameCamelcaseRes.descriptionMatch);
            assert.equal(basenameCamelcaseRes.labelMatch.length, 2);
            assert.equal(basenameCamelcaseRes.labelMatch[0].start, 0);
            assert.equal(basenameCamelcaseRes.labelMatch[0].end, 1);
            assert.equal(basenameCamelcaseRes.labelMatch[1].start, 4);
            assert.equal(basenameCamelcaseRes.labelMatch[1].end, 5);
            // Basename Match
            var basenameRes = scoreItem(resource, 'of', true, ResourceAccessor, cache);
            assert.ok(basenameRes.score);
            assert.ok(!basenameRes.descriptionMatch);
            assert.equal(basenameRes.labelMatch.length, 2);
            assert.equal(basenameRes.labelMatch[0].start, 1);
            assert.equal(basenameRes.labelMatch[0].end, 2);
            assert.equal(basenameRes.labelMatch[1].start, 4);
            assert.equal(basenameRes.labelMatch[1].end, 5);
            // Path Match
            var pathRes = scoreItem(resource, 'xyz123', true, ResourceAccessor, cache);
            assert.ok(pathRes.score);
            assert.ok(pathRes.descriptionMatch);
            assert.ok(pathRes.labelMatch);
            assert.equal(pathRes.labelMatch.length, 1);
            assert.equal(pathRes.labelMatch[0].start, 8);
            assert.equal(pathRes.labelMatch[0].end, 11);
            assert.equal(pathRes.descriptionMatch.length, 1);
            assert.equal(pathRes.descriptionMatch[0].start, 1);
            assert.equal(pathRes.descriptionMatch[0].end, 4);
            // No Match
            var noRes = scoreItem(resource, '987', true, ResourceAccessor, cache);
            assert.ok(!noRes.score);
            assert.ok(!noRes.labelMatch);
            assert.ok(!noRes.descriptionMatch);
            // Verify Scores
            assert.ok(identityRes.score > basenamePrefixRes.score);
            assert.ok(basenamePrefixRes.score > basenameRes.score);
            assert.ok(basenameRes.score > pathRes.score);
            assert.ok(pathRes.score > noRes.score);
        });
        test('scoreItem - invalid input', function () {
            var res = scoreItem(null, null, true, ResourceAccessor, cache);
            assert.equal(res.score, 0);
            res = scoreItem(null, 'null', true, ResourceAccessor, cache);
            assert.equal(res.score, 0);
        });
        test('scoreItem - optimize for file paths', function () {
            var resource = uri_1.default.file('/xyz/others/spath/some/xsp/file123.txt');
            // xsp is more relevant to the end of the file path even though it matches
            // fuzzy also in the beginning. we verify the more relevant match at the
            // end gets returned.
            var pathRes = scoreItem(resource, 'xspfile123', true, ResourceAccessor, cache);
            assert.ok(pathRes.score);
            assert.ok(pathRes.descriptionMatch);
            assert.ok(pathRes.labelMatch);
            assert.equal(pathRes.labelMatch.length, 1);
            assert.equal(pathRes.labelMatch[0].start, 0);
            assert.equal(pathRes.labelMatch[0].end, 7);
            assert.equal(pathRes.descriptionMatch.length, 1);
            assert.equal(pathRes.descriptionMatch[0].start, 23);
            assert.equal(pathRes.descriptionMatch[0].end, 26);
        });
        test('scoreItem - avoid match scattering (bug #36119)', function () {
            var resource = uri_1.default.file('projects/ui/cula/ats/target.mk');
            var pathRes = scoreItem(resource, 'tcltarget.mk', true, ResourceAccessor, cache);
            assert.ok(pathRes.score);
            assert.ok(pathRes.descriptionMatch);
            assert.ok(pathRes.labelMatch);
            assert.equal(pathRes.labelMatch.length, 1);
            assert.equal(pathRes.labelMatch[0].start, 0);
            assert.equal(pathRes.labelMatch[0].end, 9);
        });
        test('scoreItem - prefers more compact matches', function () {
            var resource = uri_1.default.file('/1a111d1/11a1d1/something.txt');
            // expect "ad" to be matched towards the end of the file because the
            // match is more compact
            var res = scoreItem(resource, 'ad', true, ResourceAccessor, cache);
            assert.ok(res.score);
            assert.ok(res.descriptionMatch);
            assert.ok(!res.labelMatch.length);
            assert.equal(res.descriptionMatch.length, 2);
            assert.equal(res.descriptionMatch[0].start, 11);
            assert.equal(res.descriptionMatch[0].end, 12);
            assert.equal(res.descriptionMatch[1].start, 13);
            assert.equal(res.descriptionMatch[1].end, 14);
        });
        test('scoreItem - proper target offset', function () {
            var resource = uri_1.default.file('etem');
            var res = scoreItem(resource, 'teem', true, ResourceAccessor, cache);
            assert.ok(!res.score);
        });
        test('scoreItem - proper target offset #2', function () {
            var resource = uri_1.default.file('ede');
            var res = scoreItem(resource, 'de', true, ResourceAccessor, cache);
            assert.equal(res.labelMatch.length, 1);
            assert.equal(res.labelMatch[0].start, 1);
            assert.equal(res.labelMatch[0].end, 3);
        });
        test('scoreItem - proper target offset #3', function () {
            var resource = uri_1.default.file('/src/vs/editor/browser/viewParts/lineNumbers/flipped-cursor-2x.svg');
            var res = scoreItem(resource, 'debug', true, ResourceAccessor, cache);
            assert.equal(res.descriptionMatch.length, 3);
            assert.equal(res.descriptionMatch[0].start, 9);
            assert.equal(res.descriptionMatch[0].end, 10);
            assert.equal(res.descriptionMatch[1].start, 36);
            assert.equal(res.descriptionMatch[1].end, 37);
            assert.equal(res.descriptionMatch[2].start, 40);
            assert.equal(res.descriptionMatch[2].end, 41);
            assert.equal(res.labelMatch.length, 2);
            assert.equal(res.labelMatch[0].start, 9);
            assert.equal(res.labelMatch[0].end, 10);
            assert.equal(res.labelMatch[1].start, 20);
            assert.equal(res.labelMatch[1].end, 21);
        });
        test('scoreItem - no match unless query contained in sequence', function () {
            var resource = uri_1.default.file('abcde');
            var res = scoreItem(resource, 'edcda', true, ResourceAccessor, cache);
            assert.ok(!res.score);
        });
        test('compareItemsByScore - identity', function () {
            var resourceA = uri_1.default.file('/some/path/fileA.txt');
            var resourceB = uri_1.default.file('/some/path/other/fileB.txt');
            var resourceC = uri_1.default.file('/unrelated/some/path/other/fileC.txt');
            // Full resource A path
            var query = ResourceAccessor.getItemPath(resourceA);
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            // Full resource B path
            query = ResourceAccessor.getItemPath(resourceB);
            res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
        });
        test('compareFilesByScore - basename prefix', function () {
            var resourceA = uri_1.default.file('/some/path/fileA.txt');
            var resourceB = uri_1.default.file('/some/path/other/fileB.txt');
            var resourceC = uri_1.default.file('/unrelated/some/path/other/fileC.txt');
            // Full resource A basename
            var query = ResourceAccessor.getItemLabel(resourceA);
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            // Full resource B basename
            query = ResourceAccessor.getItemLabel(resourceB);
            res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
        });
        test('compareFilesByScore - basename camelcase', function () {
            var resourceA = uri_1.default.file('/some/path/fileA.txt');
            var resourceB = uri_1.default.file('/some/path/other/fileB.txt');
            var resourceC = uri_1.default.file('/unrelated/some/path/other/fileC.txt');
            // resource A camelcase
            var query = 'fA';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            // resource B camelcase
            query = 'fB';
            res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
        });
        test('compareFilesByScore - basename scores', function () {
            var resourceA = uri_1.default.file('/some/path/fileA.txt');
            var resourceB = uri_1.default.file('/some/path/other/fileB.txt');
            var resourceC = uri_1.default.file('/unrelated/some/path/other/fileC.txt');
            // Resource A part of basename
            var query = 'fileA';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            // Resource B part of basename
            query = 'fileB';
            res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
        });
        test('compareFilesByScore - path scores', function () {
            var resourceA = uri_1.default.file('/some/path/fileA.txt');
            var resourceB = uri_1.default.file('/some/path/other/fileB.txt');
            var resourceC = uri_1.default.file('/unrelated/some/path/other/fileC.txt');
            // Resource A part of path
            var query = 'pathfileA';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            // Resource B part of path
            query = 'pathfileB';
            res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
        });
        test('compareFilesByScore - prefer shorter basenames', function () {
            var resourceA = uri_1.default.file('/some/path/fileA.txt');
            var resourceB = uri_1.default.file('/some/path/other/fileBLonger.txt');
            var resourceC = uri_1.default.file('/unrelated/the/path/other/fileC.txt');
            // Resource A part of path
            var query = 'somepath';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
        });
        test('compareFilesByScore - prefer shorter basenames (match on basename)', function () {
            var resourceA = uri_1.default.file('/some/path/fileA.txt');
            var resourceB = uri_1.default.file('/some/path/other/fileBLonger.txt');
            var resourceC = uri_1.default.file('/unrelated/the/path/other/fileC.txt');
            // Resource A part of path
            var query = 'file';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceC);
            assert.equal(res[2], resourceB);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceC);
            assert.equal(res[2], resourceB);
        });
        test('compareFilesByScore - prefer shorter paths', function () {
            var resourceA = uri_1.default.file('/some/path/fileA.txt');
            var resourceB = uri_1.default.file('/some/path/other/fileB.txt');
            var resourceC = uri_1.default.file('/unrelated/some/path/other/fileC.txt');
            // Resource A part of path
            var query = 'somepath';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            assert.equal(res[2], resourceC);
        });
        test('compareFilesByScore - prefer shorter paths (bug #17443)', function () {
            var resourceA = uri_1.default.file('config/test/t1.js');
            var resourceB = uri_1.default.file('config/test.js');
            var resourceC = uri_1.default.file('config/test/t2.js');
            var query = 'co/te';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            assert.equal(res[2], resourceC);
        });
        test('compareFilesByScore - allow to provide fallback sorter (bug #31591)', function () {
            var resourceA = uri_1.default.file('virtual/vscode.d.ts');
            var resourceB = uri_1.default.file('vscode/src/vs/vscode.d.ts');
            var query = 'vscode';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache, function (r1, r2, query, ResourceAccessor) { return -1; }); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache, function (r1, r2, query, ResourceAccessor) { return -1; }); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
        });
        test('compareFilesByScore - prefer more compact camel case matches', function () {
            var resourceA = uri_1.default.file('config/test/openthisAnythingHandler.js');
            var resourceB = uri_1.default.file('config/test/openthisisnotsorelevantforthequeryAnyHand.js');
            var query = 'AH';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
        });
        test('compareFilesByScore - prefer more compact matches (label)', function () {
            var resourceA = uri_1.default.file('config/test/examasdaple.js');
            var resourceB = uri_1.default.file('config/test/exampleasdaasd.ts');
            var query = 'xp';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
        });
        test('compareFilesByScore - prefer more compact matches (path)', function () {
            var resourceA = uri_1.default.file('config/test/examasdaple/file.js');
            var resourceB = uri_1.default.file('config/test/exampleasdaasd/file.ts');
            var query = 'xp';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
        });
        test('compareFilesByScore - prefer more compact matches (label and path)', function () {
            var resourceA = uri_1.default.file('config/example/thisfile.ts');
            var resourceB = uri_1.default.file('config/24234243244/example/file.js');
            var query = 'exfile';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            assert.equal(res[1], resourceA);
        });
        test('compareFilesByScore - avoid match scattering (bug #34210)', function () {
            var resourceA = uri_1.default.file('node_modules1/bundle/lib/model/modules/ot1/index.js');
            var resourceB = uri_1.default.file('node_modules1/bundle/lib/model/modules/un1/index.js');
            var resourceC = uri_1.default.file('node_modules1/bundle/lib/model/modules/modu1/index.js');
            var resourceD = uri_1.default.file('node_modules1/bundle/lib/model/modules/oddl1/index.js');
            var query = platform_1.isWindows ? 'modu1\\index.js' : 'modu1/index.js';
            var res = [resourceA, resourceB, resourceC, resourceD].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceC);
            res = [resourceC, resourceB, resourceA, resourceD].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceC);
            query = platform_1.isWindows ? 'un1\\index.js' : 'un1/index.js';
            res = [resourceA, resourceB, resourceC, resourceD].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceC, resourceB, resourceA, resourceD].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #21019 1.)', function () {
            var resourceA = uri_1.default.file('app/containers/Services/NetworkData/ServiceDetails/ServiceLoad/index.js');
            var resourceB = uri_1.default.file('app/containers/Services/NetworkData/ServiceDetails/ServiceDistribution/index.js');
            var resourceC = uri_1.default.file('app/containers/Services/NetworkData/ServiceDetailTabs/ServiceTabs/StatVideo/index.js');
            var query = 'StatVideoindex';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceC);
        });
        test('compareFilesByScore - avoid match scattering (bug #21019 2.)', function () {
            var resourceA = uri_1.default.file('src/build-helper/store/redux.ts');
            var resourceB = uri_1.default.file('src/repository/store/redux.ts');
            var query = 'reproreduxts';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #26649)', function () {
            var resourceA = uri_1.default.file('photobook/src/components/AddPagesButton/index.js');
            var resourceB = uri_1.default.file('photobook/src/components/ApprovalPageHeader/index.js');
            var resourceC = uri_1.default.file('photobook/src/canvasComponents/BookPage/index.js');
            var query = 'bookpageIndex';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceC);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceC);
        });
        test('compareFilesByScore - avoid match scattering (bug #33247)', function () {
            var resourceA = uri_1.default.file('ui/src/utils/constants.js');
            var resourceB = uri_1.default.file('ui/src/ui/Icons/index.js');
            var query = platform_1.isWindows ? 'ui\\icons' : 'ui/icons';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #33247 comment)', function () {
            var resourceA = uri_1.default.file('ui/src/components/IDInput/index.js');
            var resourceB = uri_1.default.file('ui/src/ui/Input/index.js');
            var query = platform_1.isWindows ? 'ui\\input\\index' : 'ui/input/index';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #36166)', function () {
            var resourceA = uri_1.default.file('django/contrib/sites/locale/ga/LC_MESSAGES/django.mo');
            var resourceB = uri_1.default.file('django/core/signals.py');
            var query = 'djancosig';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #32918)', function () {
            var resourceA = uri_1.default.file('adsys/protected/config.php');
            var resourceB = uri_1.default.file('adsys/protected/framework/smarty/sysplugins/smarty_internal_config.php');
            var resourceC = uri_1.default.file('duowanVideo/wap/protected/config.php');
            var query = 'protectedconfig.php';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceC);
            assert.equal(res[2], resourceB);
            res = [resourceC, resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceA);
            assert.equal(res[1], resourceC);
            assert.equal(res[2], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #14879)', function () {
            var resourceA = uri_1.default.file('pkg/search/gradient/testdata/constraint_attrMatchString.yml');
            var resourceB = uri_1.default.file('cmd/gradient/main.go');
            var query = 'gradientmain';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #14727 1)', function () {
            var resourceA = uri_1.default.file('alpha-beta-cappa.txt');
            var resourceB = uri_1.default.file('abc.txt');
            var query = 'abc';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #14727 2)', function () {
            var resourceA = uri_1.default.file('xerxes-yak-zubba/index.js');
            var resourceB = uri_1.default.file('xyz/index.js');
            var query = 'xyz';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #18381)', function () {
            var resourceA = uri_1.default.file('AssymblyInfo.cs');
            var resourceB = uri_1.default.file('IAsynchronousTask.java');
            var query = 'async';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #35572)', function () {
            var resourceA = uri_1.default.file('static/app/source/angluar/-admin/-organization/-settings/layout/layout.js');
            var resourceB = uri_1.default.file('static/app/source/angular/-admin/-project/-settings/_settings/settings.js');
            var query = 'partisettings';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #36810)', function () {
            var resourceA = uri_1.default.file('Trilby.TrilbyTV.Web.Portal/Views/Systems/Index.cshtml');
            var resourceB = uri_1.default.file('Trilby.TrilbyTV.Web.Portal/Areas/Admins/Views/Tips/Index.cshtml');
            var query = 'tipsindex.cshtml';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - prefer shorter hit (bug #20546)', function () {
            var resourceA = uri_1.default.file('editor/core/components/tests/list-view-spec.js');
            var resourceB = uri_1.default.file('editor/core/components/list-view.js');
            var query = 'listview';
            var res = [resourceA, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceB, resourceA].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('compareFilesByScore - avoid match scattering (bug #12095)', function () {
            var resourceA = uri_1.default.file('src/vs/workbench/parts/files/common/explorerViewModel.ts');
            var resourceB = uri_1.default.file('src/vs/workbench/parts/files/browser/views/explorerView.ts');
            var resourceC = uri_1.default.file('src/vs/workbench/parts/files/browser/views/explorerViewer.ts');
            var query = 'filesexplorerview.ts';
            var res = [resourceA, resourceB, resourceC].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
            res = [resourceA, resourceC, resourceB].sort(function (r1, r2) { return compareItemsByScore(r1, r2, query, true, ResourceAccessor, cache); });
            assert.equal(res[0], resourceB);
        });
        test('prepareSearchForScoring', function () {
            assert.equal(scorer.prepareQuery(' f*a ').value, 'fa');
            assert.equal(scorer.prepareQuery('model Tester.ts').value, 'modelTester.ts');
            assert.equal(scorer.prepareQuery('Model Tester.ts').lowercase, 'modeltester.ts');
            assert.equal(scorer.prepareQuery('ModelTester.ts').containsPathSeparator, false);
            assert.equal(scorer.prepareQuery('Model' + paths_1.nativeSep + 'Tester.ts').containsPathSeparator, true);
        });
    });
});
