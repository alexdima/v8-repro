/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "crypto", "vs/workbench/parts/stats/node/workspaceStats"], function (require, exports, assert, crypto, workspaceStats_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function hash(value) {
        return crypto.createHash('sha1').update(value.toString()).digest('hex');
    }
    suite('Telemetry - WorkspaceStats', function () {
        var whitelist = [
            'github.com',
            'github2.com',
            'github3.com',
            'example.com',
            'example2.com',
            'example3.com',
            'server.org',
            'server2.org',
        ];
        test('HTTPS remotes', function () {
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('https://github.com/Microsoft/vscode.git'), whitelist), ['github.com']);
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('https://git.example.com/gitproject.git'), whitelist), ['example.com']);
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('https://username@github2.com/username/repository.git'), whitelist), ['github2.com']);
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('https://username:password@github3.com/username/repository.git'), whitelist), ['github3.com']);
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('https://username:password@example2.com:1234/username/repository.git'), whitelist), ['example2.com']);
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('https://example3.com:1234/username/repository.git'), whitelist), ['example3.com']);
        });
        test('SSH remotes', function () {
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('ssh://user@git.server.org/project.git'), whitelist), ['server.org']);
        });
        test('SCP-like remotes', function () {
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('git@github.com:Microsoft/vscode.git'), whitelist), ['github.com']);
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('user@git.server.org:project.git'), whitelist), ['server.org']);
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('git.server2.org:project.git'), whitelist), ['server2.org']);
        });
        test('Local remotes', function () {
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('/opt/git/project.git'), whitelist), []);
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(remote('file:///opt/git/project.git'), whitelist), []);
        });
        test('Multiple remotes', function () {
            var config = ['https://github.com/Microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join('');
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(config, whitelist).sort(), ['example.com', 'github.com']);
        });
        test('Whitelisting', function () {
            var config = ['https://github.com/Microsoft/vscode.git', 'https://git.foobar.com/gitproject.git'].map(remote).join('');
            assert.deepStrictEqual(workspaceStats_1.getDomainsOfRemotes(config, whitelist).sort(), ['aaaaaa.aaa', 'github.com']);
        });
        test('HTTPS remotes to be hashed', function () {
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://github.com/Microsoft/vscode.git')), ['github.com/Microsoft/vscode.git']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://git.example.com/gitproject.git')), ['git.example.com/gitproject.git']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://username@github2.com/username/repository.git')), ['github2.com/username/repository.git']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://username:password@github3.com/username/repository.git')), ['github3.com/username/repository.git']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://username:password@example2.com:1234/username/repository.git')), ['example2.com/username/repository.git']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://example3.com:1234/username/repository.git')), ['example3.com/username/repository.git']);
            // Strip .git
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://github.com/Microsoft/vscode.git'), true), ['github.com/Microsoft/vscode']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://git.example.com/gitproject.git'), true), ['git.example.com/gitproject']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://username@github2.com/username/repository.git'), true), ['github2.com/username/repository']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://username:password@github3.com/username/repository.git'), true), ['github3.com/username/repository']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://username:password@example2.com:1234/username/repository.git'), true), ['example2.com/username/repository']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://example3.com:1234/username/repository.git'), true), ['example3.com/username/repository']);
            // Compare Striped .git with no .git
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://github.com/Microsoft/vscode.git'), true), workspaceStats_1.getRemotes(remote('https://github.com/Microsoft/vscode')));
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://git.example.com/gitproject.git'), true), workspaceStats_1.getRemotes(remote('https://git.example.com/gitproject')));
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://username@github2.com/username/repository.git'), true), workspaceStats_1.getRemotes(remote('https://username@github2.com/username/repository')));
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://username:password@github3.com/username/repository.git'), true), workspaceStats_1.getRemotes(remote('https://username:password@github3.com/username/repository')));
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://username:password@example2.com:1234/username/repository.git'), true), workspaceStats_1.getRemotes(remote('https://username:password@example2.com:1234/username/repository')));
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('https://example3.com:1234/username/repository.git'), true), workspaceStats_1.getRemotes(remote('https://example3.com:1234/username/repository')));
        });
        test('SSH remotes to be hashed', function () {
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('ssh://user@git.server.org/project.git')), ['git.server.org/project.git']);
            // Strip .git
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('ssh://user@git.server.org/project.git'), true), ['git.server.org/project']);
            // Compare Striped .git with no .git
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('ssh://user@git.server.org/project.git'), true), workspaceStats_1.getRemotes(remote('ssh://user@git.server.org/project')));
        });
        test('SCP-like remotes to be hashed', function () {
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('git@github.com:Microsoft/vscode.git')), ['github.com/Microsoft/vscode.git']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('user@git.server.org:project.git')), ['git.server.org/project.git']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('git.server2.org:project.git')), ['git.server2.org/project.git']);
            // Strip .git
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('git@github.com:Microsoft/vscode.git'), true), ['github.com/Microsoft/vscode']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('user@git.server.org:project.git'), true), ['git.server.org/project']);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('git.server2.org:project.git'), true), ['git.server2.org/project']);
            // Compare Striped .git with no .git
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('git@github.com:Microsoft/vscode.git'), true), workspaceStats_1.getRemotes(remote('git@github.com:Microsoft/vscode')));
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('user@git.server.org:project.git'), true), workspaceStats_1.getRemotes(remote('user@git.server.org:project')));
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('git.server2.org:project.git'), true), workspaceStats_1.getRemotes(remote('git.server2.org:project')));
        });
        test('Local remotes to be hashed', function () {
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('/opt/git/project.git')), []);
            assert.deepStrictEqual(workspaceStats_1.getRemotes(remote('file:///opt/git/project.git')), []);
        });
        test('Multiple remotes to be hashed', function () {
            var config = ['https://github.com/Microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join(' ');
            assert.deepStrictEqual(workspaceStats_1.getRemotes(config), ['github.com/Microsoft/vscode.git', 'git.example.com/gitproject.git']);
            // Strip .git
            assert.deepStrictEqual(workspaceStats_1.getRemotes(config, true), ['github.com/Microsoft/vscode', 'git.example.com/gitproject']);
            // Compare Striped .git with no .git
            var noDotGitConfig = ['https://github.com/Microsoft/vscode', 'https://git.example.com/gitproject'].map(remote).join(' ');
            assert.deepStrictEqual(workspaceStats_1.getRemotes(config, true), workspaceStats_1.getRemotes(noDotGitConfig));
        });
        test('Single remote hashed', function () {
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('https://username:password@github3.com/username/repository.git')), [hash('github3.com/username/repository.git')]);
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('ssh://user@git.server.org/project.git')), [hash('git.server.org/project.git')]);
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('user@git.server.org:project.git')), [hash('git.server.org/project.git')]);
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('/opt/git/project.git')), []);
            // Strip .git
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('https://username:password@github3.com/username/repository.git'), true), [hash('github3.com/username/repository')]);
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('ssh://user@git.server.org/project.git'), true), [hash('git.server.org/project')]);
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('user@git.server.org:project.git'), true), [hash('git.server.org/project')]);
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('/opt/git/project.git'), true), []);
            // Compare Striped .git with no .git
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('https://username:password@github3.com/username/repository.git'), true), workspaceStats_1.getHashedRemotesFromConfig(remote('https://username:password@github3.com/username/repository')));
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('ssh://user@git.server.org/project.git'), true), workspaceStats_1.getHashedRemotesFromConfig(remote('ssh://user@git.server.org/project')));
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('user@git.server.org:project.git'), true), [hash('git.server.org/project')]);
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(remote('/opt/git/project.git'), true), workspaceStats_1.getHashedRemotesFromConfig(remote('/opt/git/project')));
        });
        test('Multiple remotes hashed', function () {
            var config = ['https://github.com/Microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join(' ');
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(config), [hash('github.com/Microsoft/vscode.git'), hash('git.example.com/gitproject.git')]);
            // Strip .git
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(config, true), [hash('github.com/Microsoft/vscode'), hash('git.example.com/gitproject')]);
            // Compare Striped .git with no .git
            var noDotGitConfig = ['https://github.com/Microsoft/vscode', 'https://git.example.com/gitproject'].map(remote).join(' ');
            assert.deepStrictEqual(workspaceStats_1.getHashedRemotesFromConfig(config, true), workspaceStats_1.getHashedRemotesFromConfig(noDotGitConfig));
        });
        function remote(url) {
            return "[remote \"origin\"]\n\turl = " + url + "\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n";
        }
    });
});
