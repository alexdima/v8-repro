/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "path", "vs/workbench/api/node/extHostWorkspace", "./testRPCProtocol", "vs/base/common/paths"], function (require, exports, assert, uri_1, path_1, extHostWorkspace_1, testRPCProtocol_1, paths_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostWorkspace', function () {
        var extensionDescriptor = {
            id: 'nullExtensionDescription',
            name: 'ext',
            publisher: 'vscode',
            enableProposedApi: false,
            engines: undefined,
            extensionFolderPath: undefined,
            isBuiltin: false,
            version: undefined
        };
        function assertAsRelativePath(workspace, input, expected, includeWorkspace) {
            var actual = workspace.getRelativePath(input, includeWorkspace);
            if (actual === expected) {
                assert.ok(true);
            }
            else {
                assert.equal(actual, paths_1.normalize(expected, true));
            }
        }
        test('asRelativePath', function () {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.default.file('/Coding/Applications/NewsWoWBot'), 0)], name: 'Test' });
            assertAsRelativePath(ws, '/Coding/Applications/NewsWoWBot/bernd/das/brot', 'bernd/das/brot');
            assertAsRelativePath(ws, '/Apps/DartPubCache/hosted/pub.dartlang.org/convert-2.0.1/lib/src/hex.dart', '/Apps/DartPubCache/hosted/pub.dartlang.org/convert-2.0.1/lib/src/hex.dart');
            assertAsRelativePath(ws, '', '');
            assertAsRelativePath(ws, '/foo/bar', '/foo/bar');
            assertAsRelativePath(ws, 'in/out', 'in/out');
        });
        test('asRelativePath, same paths, #11402', function () {
            var root = '/home/aeschli/workspaces/samples/docker';
            var input = '/home/aeschli/workspaces/samples/docker';
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.default.file(root), 0)], name: 'Test' });
            assertAsRelativePath(ws, (input), input);
            var input2 = '/home/aeschli/workspaces/samples/docker/a.file';
            assertAsRelativePath(ws, (input2), 'a.file');
        });
        test('asRelativePath, no workspace', function () {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), null);
            assertAsRelativePath(ws, (''), '');
            assertAsRelativePath(ws, ('/foo/bar'), '/foo/bar');
        });
        test('asRelativePath, multiple folders', function () {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.default.file('/Coding/One'), 0), aWorkspaceFolderData(uri_1.default.file('/Coding/Two'), 1)], name: 'Test' });
            assertAsRelativePath(ws, '/Coding/One/file.txt', 'One/file.txt');
            assertAsRelativePath(ws, '/Coding/Two/files/out.txt', 'Two/files/out.txt');
            assertAsRelativePath(ws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt');
        });
        test('slightly inconsistent behaviour of asRelativePath and getWorkspaceFolder, #31553', function () {
            var mrws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.default.file('/Coding/One'), 0), aWorkspaceFolderData(uri_1.default.file('/Coding/Two'), 1)], name: 'Test' });
            assertAsRelativePath(mrws, '/Coding/One/file.txt', 'One/file.txt');
            assertAsRelativePath(mrws, '/Coding/One/file.txt', 'One/file.txt', true);
            assertAsRelativePath(mrws, '/Coding/One/file.txt', 'file.txt', false);
            assertAsRelativePath(mrws, '/Coding/Two/files/out.txt', 'Two/files/out.txt');
            assertAsRelativePath(mrws, '/Coding/Two/files/out.txt', 'Two/files/out.txt', true);
            assertAsRelativePath(mrws, '/Coding/Two/files/out.txt', 'files/out.txt', false);
            assertAsRelativePath(mrws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt');
            assertAsRelativePath(mrws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', true);
            assertAsRelativePath(mrws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', false);
            var srws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.default.file('/Coding/One'), 0)], name: 'Test' });
            assertAsRelativePath(srws, '/Coding/One/file.txt', 'file.txt');
            assertAsRelativePath(srws, '/Coding/One/file.txt', 'file.txt', false);
            assertAsRelativePath(srws, '/Coding/One/file.txt', 'One/file.txt', true);
            assertAsRelativePath(srws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt');
            assertAsRelativePath(srws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', true);
            assertAsRelativePath(srws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', false);
        });
        test('getPath, legacy', function () {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [] });
            assert.equal(ws.getPath(), undefined);
            ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), null);
            assert.equal(ws.getPath(), undefined);
            ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), undefined);
            assert.equal(ws.getPath(), undefined);
            ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.file('Folder'), 0), aWorkspaceFolderData(uri_1.default.file('Another/Folder'), 1)] });
            assert.equal(ws.getPath().replace(/\\/g, '/'), '/Folder');
            ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.file('/Folder'), 0)] });
            assert.equal(ws.getPath().replace(/\\/g, '/'), '/Folder');
        });
        test('WorkspaceFolder has name and index', function () {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.default.file('/Coding/One'), 0), aWorkspaceFolderData(uri_1.default.file('/Coding/Two'), 1)], name: 'Test' });
            var _a = ws.getWorkspaceFolders(), one = _a[0], two = _a[1];
            assert.equal(one.name, 'One');
            assert.equal(one.index, 0);
            assert.equal(two.name, 'Two');
            assert.equal(two.index, 1);
        });
        test('getContainingWorkspaceFolder', function () {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), {
                id: 'foo',
                name: 'Test',
                folders: [
                    aWorkspaceFolderData(uri_1.default.file('/Coding/One'), 0),
                    aWorkspaceFolderData(uri_1.default.file('/Coding/Two'), 1),
                    aWorkspaceFolderData(uri_1.default.file('/Coding/Two/Nested'), 2)
                ]
            });
            var folder = ws.getWorkspaceFolder(uri_1.default.file('/foo/bar'));
            assert.equal(folder, undefined);
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/One/file/path.txt'));
            assert.equal(folder.name, 'One');
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two/file/path.txt'));
            assert.equal(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two/Nest'));
            assert.equal(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two/Nested/file'));
            assert.equal(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two/Nested/f'));
            assert.equal(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two/Nested'), true);
            assert.equal(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two/Nested/'), true);
            assert.equal(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two/Nested'));
            assert.equal(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two/Nested/'));
            assert.equal(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two'), true);
            assert.equal(folder, undefined);
            folder = ws.getWorkspaceFolder(uri_1.default.file('/Coding/Two'), false);
            assert.equal(folder.name, 'Two');
        });
        test('Multiroot change event should have a delta, #29641', function (done) {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [] });
            var finished = false;
            var finish = function (error) {
                if (!finished) {
                    finished = true;
                    done(error);
                }
            };
            var sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.deepEqual(e.added, []);
                    assert.deepEqual(e.removed, []);
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [] });
            sub.dispose();
            sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.deepEqual(e.removed, []);
                    assert.equal(e.added.length, 1);
                    assert.equal(e.added[0].uri.toString(), 'foo:bar');
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 0)] });
            sub.dispose();
            sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.deepEqual(e.removed, []);
                    assert.equal(e.added.length, 1);
                    assert.equal(e.added[0].uri.toString(), 'foo:bar2');
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 0), aWorkspaceFolderData(uri_1.default.parse('foo:bar2'), 1)] });
            sub.dispose();
            sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.equal(e.removed.length, 2);
                    assert.equal(e.removed[0].uri.toString(), 'foo:bar');
                    assert.equal(e.removed[1].uri.toString(), 'foo:bar2');
                    assert.equal(e.added.length, 1);
                    assert.equal(e.added[0].uri.toString(), 'foo:bar3');
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar3'), 0)] });
            sub.dispose();
            finish();
        });
        test('Multiroot change keeps existing workspaces live', function () {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 0)] });
            var firstFolder = ws.getWorkspaceFolders()[0];
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar2'), 0), aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 1, 'renamed')] });
            assert.equal(ws.getWorkspaceFolders()[1], firstFolder);
            assert.equal(firstFolder.index, 1);
            assert.equal(firstFolder.name, 'renamed');
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar3'), 0), aWorkspaceFolderData(uri_1.default.parse('foo:bar2'), 1), aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 2)] });
            assert.equal(ws.getWorkspaceFolders()[2], firstFolder);
            assert.equal(firstFolder.index, 2);
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar3'), 0)] });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar3'), 0), aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 1)] });
            assert.notEqual(firstFolder, ws.workspace.folders[0]);
        });
        test('updateWorkspaceFolders - invalid arguments', function () {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [] });
            assert.equal(false, ws.updateWorkspaceFolders(extensionDescriptor, null, null));
            assert.equal(false, ws.updateWorkspaceFolders(extensionDescriptor, 0, 0));
            assert.equal(false, ws.updateWorkspaceFolders(extensionDescriptor, 0, 1));
            assert.equal(false, ws.updateWorkspaceFolders(extensionDescriptor, 1, 0));
            assert.equal(false, ws.updateWorkspaceFolders(extensionDescriptor, -1, 0));
            assert.equal(false, ws.updateWorkspaceFolders(extensionDescriptor, -1, -1));
            ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 0)] });
            assert.equal(false, ws.updateWorkspaceFolders(extensionDescriptor, 1, 1));
            assert.equal(false, ws.updateWorkspaceFolders(extensionDescriptor, 0, 2));
            assert.equal(false, ws.updateWorkspaceFolders(extensionDescriptor, 0, 1, asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar'))));
        });
        test('updateWorkspaceFolders - valid arguments', function (done) {
            var finished = false;
            var finish = function (error) {
                if (!finished) {
                    finished = true;
                    done(error);
                }
            };
            var protocol = {
                getProxy: function () { return undefined; },
                set: undefined,
                assertRegistered: undefined
            };
            var ws = new extHostWorkspace_1.ExtHostWorkspace(protocol, { id: 'foo', name: 'Test', folders: [] });
            //
            // Add one folder
            //
            assert.equal(true, ws.updateWorkspaceFolders(extensionDescriptor, 0, 0, asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar'))));
            assert.equal(1, ws.workspace.folders.length);
            assert.equal(ws.workspace.folders[0].uri.toString(), uri_1.default.parse('foo:bar').toString());
            var firstAddedFolder = ws.getWorkspaceFolders()[0];
            var gotEvent = false;
            var sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.deepEqual(e.removed, []);
                    assert.equal(e.added.length, 1);
                    assert.equal(e.added[0].uri.toString(), 'foo:bar');
                    assert.equal(e.added[0], firstAddedFolder); // verify object is still live
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 0)] }); // simulate acknowledgement from main side
            assert.equal(gotEvent, true);
            sub.dispose();
            assert.equal(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            //
            // Add two more folders
            //
            assert.equal(true, ws.updateWorkspaceFolders(extensionDescriptor, 1, 0, asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar1')), asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar2'))));
            assert.equal(3, ws.workspace.folders.length);
            assert.equal(ws.workspace.folders[0].uri.toString(), uri_1.default.parse('foo:bar').toString());
            assert.equal(ws.workspace.folders[1].uri.toString(), uri_1.default.parse('foo:bar1').toString());
            assert.equal(ws.workspace.folders[2].uri.toString(), uri_1.default.parse('foo:bar2').toString());
            var secondAddedFolder = ws.getWorkspaceFolders()[1];
            var thirdAddedFolder = ws.getWorkspaceFolders()[2];
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.deepEqual(e.removed, []);
                    assert.equal(e.added.length, 2);
                    assert.equal(e.added[0].uri.toString(), 'foo:bar1');
                    assert.equal(e.added[1].uri.toString(), 'foo:bar2');
                    assert.equal(e.added[0], secondAddedFolder);
                    assert.equal(e.added[1], thirdAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 0), aWorkspaceFolderData(uri_1.default.parse('foo:bar1'), 1), aWorkspaceFolderData(uri_1.default.parse('foo:bar2'), 2)] }); // simulate acknowledgement from main side
            assert.equal(gotEvent, true);
            sub.dispose();
            assert.equal(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            assert.equal(ws.getWorkspaceFolders()[1], secondAddedFolder); // verify object is still live
            assert.equal(ws.getWorkspaceFolders()[2], thirdAddedFolder); // verify object is still live
            //
            // Remove one folder
            //
            assert.equal(true, ws.updateWorkspaceFolders(extensionDescriptor, 2, 1));
            assert.equal(2, ws.workspace.folders.length);
            assert.equal(ws.workspace.folders[0].uri.toString(), uri_1.default.parse('foo:bar').toString());
            assert.equal(ws.workspace.folders[1].uri.toString(), uri_1.default.parse('foo:bar1').toString());
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.deepEqual(e.added, []);
                    assert.equal(e.removed.length, 1);
                    assert.equal(e.removed[0], thirdAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 0), aWorkspaceFolderData(uri_1.default.parse('foo:bar1'), 1)] }); // simulate acknowledgement from main side
            assert.equal(gotEvent, true);
            sub.dispose();
            assert.equal(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            assert.equal(ws.getWorkspaceFolders()[1], secondAddedFolder); // verify object is still live
            //
            // Rename folder
            //
            assert.equal(true, ws.updateWorkspaceFolders(extensionDescriptor, 0, 2, asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar'), 'renamed 1'), asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar1'), 'renamed 2')));
            assert.equal(2, ws.workspace.folders.length);
            assert.equal(ws.workspace.folders[0].uri.toString(), uri_1.default.parse('foo:bar').toString());
            assert.equal(ws.workspace.folders[1].uri.toString(), uri_1.default.parse('foo:bar1').toString());
            assert.equal(ws.workspace.folders[0].name, 'renamed 1');
            assert.equal(ws.workspace.folders[1].name, 'renamed 2');
            assert.equal(ws.getWorkspaceFolders()[0].name, 'renamed 1');
            assert.equal(ws.getWorkspaceFolders()[1].name, 'renamed 2');
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.deepEqual(e.added, []);
                    assert.equal(e.removed.length, []);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar'), 0, 'renamed 1'), aWorkspaceFolderData(uri_1.default.parse('foo:bar1'), 1, 'renamed 2')] }); // simulate acknowledgement from main side
            assert.equal(gotEvent, true);
            sub.dispose();
            assert.equal(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            assert.equal(ws.getWorkspaceFolders()[1], secondAddedFolder); // verify object is still live
            assert.equal(ws.workspace.folders[0].name, 'renamed 1');
            assert.equal(ws.workspace.folders[1].name, 'renamed 2');
            assert.equal(ws.getWorkspaceFolders()[0].name, 'renamed 1');
            assert.equal(ws.getWorkspaceFolders()[1].name, 'renamed 2');
            //
            // Add and remove folders
            //
            assert.equal(true, ws.updateWorkspaceFolders(extensionDescriptor, 0, 2, asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar3')), asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar4'))));
            assert.equal(2, ws.workspace.folders.length);
            assert.equal(ws.workspace.folders[0].uri.toString(), uri_1.default.parse('foo:bar3').toString());
            assert.equal(ws.workspace.folders[1].uri.toString(), uri_1.default.parse('foo:bar4').toString());
            var fourthAddedFolder = ws.getWorkspaceFolders()[0];
            var fifthAddedFolder = ws.getWorkspaceFolders()[1];
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.equal(e.added.length, 2);
                    assert.equal(e.added[0], fourthAddedFolder);
                    assert.equal(e.added[1], fifthAddedFolder);
                    assert.equal(e.removed.length, 2);
                    assert.equal(e.removed[0], firstAddedFolder);
                    assert.equal(e.removed[1], secondAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar3'), 0), aWorkspaceFolderData(uri_1.default.parse('foo:bar4'), 1)] }); // simulate acknowledgement from main side
            assert.equal(gotEvent, true);
            sub.dispose();
            assert.equal(ws.getWorkspaceFolders()[0], fourthAddedFolder); // verify object is still live
            assert.equal(ws.getWorkspaceFolders()[1], fifthAddedFolder); // verify object is still live
            //
            // Swap folders
            //
            assert.equal(true, ws.updateWorkspaceFolders(extensionDescriptor, 0, 2, asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar4')), asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar3'))));
            assert.equal(2, ws.workspace.folders.length);
            assert.equal(ws.workspace.folders[0].uri.toString(), uri_1.default.parse('foo:bar4').toString());
            assert.equal(ws.workspace.folders[1].uri.toString(), uri_1.default.parse('foo:bar3').toString());
            assert.equal(ws.getWorkspaceFolders()[0], fifthAddedFolder); // verify object is still live
            assert.equal(ws.getWorkspaceFolders()[1], fourthAddedFolder); // verify object is still live
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.equal(e.added.length, 0);
                    assert.equal(e.removed.length, 0);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.default.parse('foo:bar4'), 0), aWorkspaceFolderData(uri_1.default.parse('foo:bar3'), 1)] }); // simulate acknowledgement from main side
            assert.equal(gotEvent, true);
            sub.dispose();
            assert.equal(ws.getWorkspaceFolders()[0], fifthAddedFolder); // verify object is still live
            assert.equal(ws.getWorkspaceFolders()[1], fourthAddedFolder); // verify object is still live
            assert.equal(fifthAddedFolder.index, 0);
            assert.equal(fourthAddedFolder.index, 1);
            //
            // Add one folder after the other without waiting for confirmation (not supported currently)
            //
            assert.equal(true, ws.updateWorkspaceFolders(extensionDescriptor, 2, 0, asUpdateWorkspaceFolderData(uri_1.default.parse('foo:bar5'))));
            assert.equal(3, ws.workspace.folders.length);
            assert.equal(ws.workspace.folders[0].uri.toString(), uri_1.default.parse('foo:bar4').toString());
            assert.equal(ws.workspace.folders[1].uri.toString(), uri_1.default.parse('foo:bar3').toString());
            assert.equal(ws.workspace.folders[2].uri.toString(), uri_1.default.parse('foo:bar5').toString());
            var sixthAddedFolder = ws.getWorkspaceFolders()[2];
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.equal(e.added.length, 1);
                    assert.equal(e.added[0], sixthAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({
                id: 'foo', name: 'Test', folders: [
                    aWorkspaceFolderData(uri_1.default.parse('foo:bar4'), 0),
                    aWorkspaceFolderData(uri_1.default.parse('foo:bar3'), 1),
                    aWorkspaceFolderData(uri_1.default.parse('foo:bar5'), 2)
                ]
            }); // simulate acknowledgement from main side
            assert.equal(gotEvent, true);
            sub.dispose();
            assert.equal(ws.getWorkspaceFolders()[0], fifthAddedFolder); // verify object is still live
            assert.equal(ws.getWorkspaceFolders()[1], fourthAddedFolder); // verify object is still live
            assert.equal(ws.getWorkspaceFolders()[2], sixthAddedFolder); // verify object is still live
            finish();
        });
        test('Multiroot change event is immutable', function (done) {
            var finished = false;
            var finish = function (error) {
                if (!finished) {
                    finished = true;
                    done(error);
                }
            };
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [] });
            var sub = ws.onDidChangeWorkspace(function (e) {
                try {
                    assert.throws(function () {
                        e.added = [];
                    });
                    assert.throws(function () {
                        e.added[0] = null;
                    });
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [] });
            sub.dispose();
            finish();
        });
        test('`vscode.workspace.getWorkspaceFolder(file)` don\'t return workspace folder when file open from command line. #36221', function () {
            var ws = new extHostWorkspace_1.ExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), {
                id: 'foo', name: 'Test', folders: [
                    aWorkspaceFolderData(uri_1.default.file('c:/Users/marek/Desktop/vsc_test/'), 0)
                ]
            });
            assert.ok(ws.getWorkspaceFolder(uri_1.default.file('c:/Users/marek/Desktop/vsc_test/a.txt')));
            assert.ok(ws.getWorkspaceFolder(uri_1.default.file('C:/Users/marek/Desktop/vsc_test/b.txt')));
        });
        function aWorkspaceFolderData(uri, index, name) {
            if (name === void 0) { name = ''; }
            return {
                uri: uri,
                index: index,
                name: name || path_1.basename(uri.path)
            };
        }
        function asUpdateWorkspaceFolderData(uri, name) {
            return { uri: uri, name: name };
        }
    });
});
