/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/comparers", "assert"], function (require, exports, comparers_1, assert) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Comparers', function () {
        test('compareFileNames', function () {
            // Setup Intl
            comparers_1.setFileNameComparer(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }));
            assert(comparers_1.compareFileNames(null, null) === 0, 'null should be equal');
            assert(comparers_1.compareFileNames(null, 'abc') < 0, 'null should be come before real values');
            assert(comparers_1.compareFileNames('', '') === 0, 'empty should be equal');
            assert(comparers_1.compareFileNames('abc', 'abc') === 0, 'equal names should be equal');
            assert(comparers_1.compareFileNames('.abc', '.abc') === 0, 'equal full names should be equal');
            assert(comparers_1.compareFileNames('.env', '.env.example') < 0, 'filenames with extensions should come after those without');
            assert(comparers_1.compareFileNames('.env.example', '.gitattributes') < 0, 'filenames starting with dots and with extensions should still sort properly');
            assert(comparers_1.compareFileNames('1', '1') === 0, 'numerically equal full names should be equal');
            assert(comparers_1.compareFileNames('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert(comparers_1.compareFileNames('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert(comparers_1.compareFileNames('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
        });
        test('compareFileExtensions', function () {
            // Setup Intl
            comparers_1.setFileNameComparer(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }));
            assert(comparers_1.compareFileExtensions(null, null) === 0, 'null should be equal');
            assert(comparers_1.compareFileExtensions(null, '.abc') < 0, 'null should come before real files');
            assert(comparers_1.compareFileExtensions(null, 'abc') < 0, 'null should come before real files without extension');
            assert(comparers_1.compareFileExtensions('', '') === 0, 'empty should be equal');
            assert(comparers_1.compareFileExtensions('abc', 'abc') === 0, 'equal names should be equal');
            assert(comparers_1.compareFileExtensions('.abc', '.abc') === 0, 'equal full names should be equal');
            assert(comparers_1.compareFileExtensions('file.ext', 'file.ext') === 0, 'equal full names should be equal');
            assert(comparers_1.compareFileExtensions('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert(comparers_1.compareFileExtensions('.ext', 'a.ext') < 0, 'if equal extensions, filenames should be compared, empty filename should come before others');
            assert(comparers_1.compareFileExtensions('file.aaa', 'file.bbb') < 0, 'files should be compared by extensions');
            assert(comparers_1.compareFileExtensions('bbb.aaa', 'aaa.bbb') < 0, 'files should be compared by extensions even if filenames compare differently');
            assert(comparers_1.compareFileExtensions('1', '1') === 0, 'numerically equal full names should be equal');
            assert(comparers_1.compareFileExtensions('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert(comparers_1.compareFileExtensions('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert(comparers_1.compareFileExtensions('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
            assert(comparers_1.compareFileExtensions('txt.abc1', 'txt.abc1') === 0, 'equal extensions with numbers should be equal');
            assert(comparers_1.compareFileExtensions('txt.abc1', 'txt.abc2') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert(comparers_1.compareFileExtensions('txt.abc2', 'txt.abc10') < 0, 'extensions with numbers should be in numerical order even when they are multiple digits long');
            assert(comparers_1.compareFileExtensions('a.ext1', 'b.ext1') < 0, 'if equal extensions with numbers, filenames should be compared');
            assert(comparers_1.compareFileExtensions('file2.ext2', 'file1.ext10') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert(comparers_1.compareFileExtensions('file.ext01', 'file.ext1') < 0, 'extensions with equal numbers should be in alphabetical order');
        });
    });
});
