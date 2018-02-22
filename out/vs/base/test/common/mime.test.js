define(["require", "exports", "assert", "vs/base/common/mime"], function (require, exports, assert, mime_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Mime', function () {
        test('Dynamically Register Text Mime', function () {
            var guess = mime_1.guessMimeTypes('foo.monaco');
            assert.deepEqual(guess, ['application/unknown']);
            mime_1.registerTextMime({ id: 'monaco', extension: '.monaco', mime: 'text/monaco' });
            guess = mime_1.guessMimeTypes('foo.monaco');
            assert.deepEqual(guess, ['text/monaco', 'text/plain']);
            guess = mime_1.guessMimeTypes('.monaco');
            assert.deepEqual(guess, ['text/monaco', 'text/plain']);
            mime_1.registerTextMime({ id: 'codefile', filename: 'Codefile', mime: 'text/code' });
            guess = mime_1.guessMimeTypes('Codefile');
            assert.deepEqual(guess, ['text/code', 'text/plain']);
            guess = mime_1.guessMimeTypes('foo.Codefile');
            assert.deepEqual(guess, ['application/unknown']);
            mime_1.registerTextMime({ id: 'docker', filepattern: 'Docker*', mime: 'text/docker' });
            guess = mime_1.guessMimeTypes('Docker-debug');
            assert.deepEqual(guess, ['text/docker', 'text/plain']);
            guess = mime_1.guessMimeTypes('docker-PROD');
            assert.deepEqual(guess, ['text/docker', 'text/plain']);
            mime_1.registerTextMime({ id: 'niceregex', mime: 'text/nice-regex', firstline: /RegexesAreNice/ });
            guess = mime_1.guessMimeTypes('Randomfile.noregistration', 'RegexesAreNice');
            assert.deepEqual(guess, ['text/nice-regex', 'text/plain']);
            guess = mime_1.guessMimeTypes('Randomfile.noregistration', 'RegexesAreNotNice');
            assert.deepEqual(guess, ['application/unknown']);
            guess = mime_1.guessMimeTypes('Codefile', 'RegexesAreNice');
            assert.deepEqual(guess, ['text/code', 'text/plain']);
        });
        test('Mimes Priority', function () {
            mime_1.registerTextMime({ id: 'monaco', extension: '.monaco', mime: 'text/monaco' });
            mime_1.registerTextMime({ id: 'foobar', mime: 'text/foobar', firstline: /foobar/ });
            var guess = mime_1.guessMimeTypes('foo.monaco');
            assert.deepEqual(guess, ['text/monaco', 'text/plain']);
            guess = mime_1.guessMimeTypes('foo.monaco', 'foobar');
            assert.deepEqual(guess, ['text/monaco', 'text/plain']);
            mime_1.registerTextMime({ id: 'docker', filename: 'dockerfile', mime: 'text/winner' });
            mime_1.registerTextMime({ id: 'docker', filepattern: 'dockerfile*', mime: 'text/looser' });
            guess = mime_1.guessMimeTypes('dockerfile');
            assert.deepEqual(guess, ['text/winner', 'text/plain']);
        });
        test('Specificity priority 1', function () {
            mime_1.registerTextMime({ id: 'monaco2', extension: '.monaco2', mime: 'text/monaco2' });
            mime_1.registerTextMime({ id: 'monaco2', filename: 'specific.monaco2', mime: 'text/specific-monaco2' });
            assert.deepEqual(mime_1.guessMimeTypes('specific.monaco2'), ['text/specific-monaco2', 'text/plain']);
            assert.deepEqual(mime_1.guessMimeTypes('foo.monaco2'), ['text/monaco2', 'text/plain']);
        });
        test('Specificity priority 2', function () {
            mime_1.registerTextMime({ id: 'monaco3', filename: 'specific.monaco3', mime: 'text/specific-monaco3' });
            mime_1.registerTextMime({ id: 'monaco3', extension: '.monaco3', mime: 'text/monaco3' });
            assert.deepEqual(mime_1.guessMimeTypes('specific.monaco3'), ['text/specific-monaco3', 'text/plain']);
            assert.deepEqual(mime_1.guessMimeTypes('foo.monaco3'), ['text/monaco3', 'text/plain']);
        });
        test('Mimes Priority - Longest Extension wins', function () {
            mime_1.registerTextMime({ id: 'monaco', extension: '.monaco', mime: 'text/monaco' });
            mime_1.registerTextMime({ id: 'monaco', extension: '.monaco.xml', mime: 'text/monaco-xml' });
            mime_1.registerTextMime({ id: 'monaco', extension: '.monaco.xml.build', mime: 'text/monaco-xml-build' });
            var guess = mime_1.guessMimeTypes('foo.monaco');
            assert.deepEqual(guess, ['text/monaco', 'text/plain']);
            guess = mime_1.guessMimeTypes('foo.monaco.xml');
            assert.deepEqual(guess, ['text/monaco-xml', 'text/plain']);
            guess = mime_1.guessMimeTypes('foo.monaco.xml.build');
            assert.deepEqual(guess, ['text/monaco-xml-build', 'text/plain']);
        });
        test('Mimes Priority - User configured wins', function () {
            mime_1.registerTextMime({ id: 'monaco', extension: '.monaco.xnl', mime: 'text/monaco', userConfigured: true });
            mime_1.registerTextMime({ id: 'monaco', extension: '.monaco.xml', mime: 'text/monaco-xml' });
            var guess = mime_1.guessMimeTypes('foo.monaco.xnl');
            assert.deepEqual(guess, ['text/monaco', 'text/plain']);
        });
        test('Mimes Priority - Pattern matches on path if specified', function () {
            mime_1.registerTextMime({ id: 'monaco', filepattern: '**/dot.monaco.xml', mime: 'text/monaco' });
            mime_1.registerTextMime({ id: 'other', filepattern: '*ot.other.xml', mime: 'text/other' });
            var guess = mime_1.guessMimeTypes('/some/path/dot.monaco.xml');
            assert.deepEqual(guess, ['text/monaco', 'text/plain']);
        });
        test('Mimes Priority - Last registered mime wins', function () {
            mime_1.registerTextMime({ id: 'monaco', filepattern: '**/dot.monaco.xml', mime: 'text/monaco' });
            mime_1.registerTextMime({ id: 'other', filepattern: '**/dot.monaco.xml', mime: 'text/other' });
            var guess = mime_1.guessMimeTypes('/some/path/dot.monaco.xml');
            assert.deepEqual(guess, ['text/other', 'text/plain']);
        });
    });
});
