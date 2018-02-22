/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "assert", "vs/workbench/common/editor/editorStacksModel", "vs/workbench/common/editor", "vs/base/common/uri", "vs/workbench/test/workbenchTestServices", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/platform/lifecycle/common/lifecycle", "vs/platform/workspace/common/workspace", "vs/platform/registry/common/platform", "vs/platform/editor/common/editor", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/common/editor/diffEditorInput"], function (require, exports, assert, editorStacksModel_1, editor_1, uri_1, workbenchTestServices_1, testConfigurationService_1, instantiationServiceMock_1, configuration_1, storage_1, lifecycle_1, workspace_1, platform_1, editor_2, telemetry_1, telemetryUtils_1, diffEditorInput_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function create() {
        var inst = new instantiationServiceMock_1.TestInstantiationService();
        inst.stub(storage_1.IStorageService, new workbenchTestServices_1.TestStorageService());
        inst.stub(lifecycle_1.ILifecycleService, new workbenchTestServices_1.TestLifecycleService());
        inst.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
        inst.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
        var config = new testConfigurationService_1.TestConfigurationService();
        config.setUserConfiguration('workbench', { editor: { openPositioning: 'right' } });
        inst.stub(configuration_1.IConfigurationService, config);
        return inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
    }
    function modelListener(model) {
        var modelEvents = {
            opened: [],
            activated: [],
            closed: [],
            moved: [],
            renamed: [],
            disposed: [],
            changed: [],
            editorClosed: [],
            editorWillClose: []
        };
        model.onGroupOpened(function (g) { return modelEvents.opened.push(g); });
        model.onGroupActivated(function (g) { return modelEvents.activated.push(g); });
        model.onGroupClosed(function (g) { return modelEvents.closed.push(g); });
        model.onGroupMoved(function (g) { return modelEvents.moved.push(g); });
        model.onGroupRenamed(function (g) { return modelEvents.renamed.push(g); });
        model.onEditorDisposed(function (e) { return modelEvents.disposed.push(e); });
        model.onModelChanged(function (e) { return modelEvents.changed.push(e); });
        model.onWillCloseEditor(function (e) { return modelEvents.editorWillClose.push(e); });
        model.onEditorClosed(function (e) { return modelEvents.editorClosed.push(e); });
        return modelEvents;
    }
    function groupListener(group) {
        var groupEvents = {
            opened: [],
            closed: [],
            activated: [],
            pinned: [],
            unpinned: [],
            moved: []
        };
        group.onEditorOpened(function (e) { return groupEvents.opened.push(e); });
        group.onEditorClosed(function (e) { return groupEvents.closed.push(e); });
        group.onEditorActivated(function (e) { return groupEvents.activated.push(e); });
        group.onEditorPinned(function (e) { return groupEvents.pinned.push(e); });
        group.onEditorUnpinned(function (e) { return groupEvents.unpinned.push(e); });
        group.onEditorMoved(function (e) { return groupEvents.moved.push(e); });
        return groupEvents;
    }
    var index = 0;
    var TestEditorInput = /** @class */ (function (_super) {
        __extends(TestEditorInput, _super);
        function TestEditorInput(id) {
            var _this = _super.call(this) || this;
            _this.id = id;
            return _this;
        }
        TestEditorInput.prototype.getTypeId = function () { return 'testEditorInput'; };
        TestEditorInput.prototype.resolve = function () { return null; };
        TestEditorInput.prototype.matches = function (other) {
            return other && this.id === other.id && other instanceof TestEditorInput;
        };
        TestEditorInput.prototype.setDirty = function () {
            this._onDidChangeDirty.fire();
        };
        TestEditorInput.prototype.setLabel = function () {
            this._onDidChangeLabel.fire();
        };
        return TestEditorInput;
    }(editor_1.EditorInput));
    var NonSerializableTestEditorInput = /** @class */ (function (_super) {
        __extends(NonSerializableTestEditorInput, _super);
        function NonSerializableTestEditorInput(id) {
            var _this = _super.call(this) || this;
            _this.id = id;
            return _this;
        }
        NonSerializableTestEditorInput.prototype.getTypeId = function () { return 'testEditorInput-nonSerializable'; };
        NonSerializableTestEditorInput.prototype.resolve = function () { return null; };
        NonSerializableTestEditorInput.prototype.matches = function (other) {
            return other && this.id === other.id && other instanceof NonSerializableTestEditorInput;
        };
        return NonSerializableTestEditorInput;
    }(editor_1.EditorInput));
    var TestFileEditorInput = /** @class */ (function (_super) {
        __extends(TestFileEditorInput, _super);
        function TestFileEditorInput(id, resource) {
            var _this = _super.call(this) || this;
            _this.id = id;
            _this.resource = resource;
            return _this;
        }
        TestFileEditorInput.prototype.getTypeId = function () { return 'testFileEditorInput'; };
        TestFileEditorInput.prototype.resolve = function () { return null; };
        TestFileEditorInput.prototype.matches = function (other) {
            return other && this.id === other.id && other instanceof TestFileEditorInput;
        };
        TestFileEditorInput.prototype.setEncoding = function (encoding) {
        };
        TestFileEditorInput.prototype.getEncoding = function () {
            return null;
        };
        TestFileEditorInput.prototype.setPreferredEncoding = function (encoding) {
        };
        TestFileEditorInput.prototype.getResource = function () {
            return this.resource;
        };
        TestFileEditorInput.prototype.setForceOpenAsBinary = function () {
        };
        return TestFileEditorInput;
    }(editor_1.EditorInput));
    function input(id, nonSerializable, resource) {
        if (id === void 0) { id = String(index++); }
        if (resource) {
            return new TestFileEditorInput(id, resource);
        }
        return nonSerializable ? new NonSerializableTestEditorInput(id) : new TestEditorInput(id);
    }
    var TestEditorInputFactory = /** @class */ (function () {
        function TestEditorInputFactory() {
        }
        TestEditorInputFactory.prototype.serialize = function (editorInput) {
            var testEditorInput = editorInput;
            var testInput = {
                id: testEditorInput.id
            };
            return JSON.stringify(testInput);
        };
        TestEditorInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            var testInput = JSON.parse(serializedEditorInput);
            return new TestEditorInput(testInput.id);
        };
        return TestEditorInputFactory;
    }());
    platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).registerEditorInputFactory('testEditorInput', TestEditorInputFactory);
    suite('Editor Stacks Model', function () {
        teardown(function () {
            index = 1;
        });
        test('Groups - Basic', function () {
            var model = create();
            var events = modelListener(model);
            assert.equal(model.groups.length, 0);
            assert.ok(!model.activeGroup);
            var first = model.openGroup('first');
            assert.equal(events.opened[0], first);
            assert.equal(events.activated[0], first);
            assert.equal(model.activeGroup, first);
            assert.equal(model.groups.length, 1);
            assert.equal(model.groups[0], first);
            var second = model.openGroup('second');
            assert.equal(events.opened[1], second);
            assert.equal(events.activated[1], second);
            assert.equal(model.activeGroup, second);
            assert.equal(model.groups.length, 2);
            assert.equal(model.groups[1], second);
            var third = model.openGroup('third');
            assert.equal(events.opened[2], third);
            assert.equal(events.activated[2], third);
            assert.equal(model.activeGroup, third);
            assert.equal(model.groups.length, 3);
            assert.equal(model.groups[2], third);
            model.closeGroup(first);
            assert.equal(events.closed[0], first);
            assert.equal(model.groups.length, 2);
            assert.equal(model.activeGroup, third);
            assert.equal(model.groups[0], second);
            assert.equal(model.groups[1], third);
            model.closeGroup(third);
            assert.equal(events.closed[1], third);
            assert.equal(events.activated[3], second);
            assert.equal(model.activeGroup, second);
            assert.equal(model.groups.length, 1);
            assert.equal(model.groups[0], second);
            var fourth = model.openGroup('fourth');
            assert.equal(fourth, model.activeGroup);
            model.closeGroup(fourth);
            assert.equal(second, model.activeGroup);
            model.closeGroup(second);
            assert.equal(model.groups.length, 0);
            model.openGroup('first');
            model.openGroup('second');
            model.openGroup('third');
            model.openGroup('fourth');
            assert.equal(model.groups.length, 4);
            model.closeGroups();
            assert.equal(model.groups.length, 0);
        });
        test('Groups - Close Group sends move event for others to the right', function () {
            var model = create();
            var events = modelListener(model);
            var first = model.openGroup('first');
            model.openGroup('second');
            var third = model.openGroup('third');
            model.closeGroup(first);
            assert.equal(events.moved.length, 2);
            model.closeGroup(third);
            assert.equal(events.moved.length, 2);
        });
        test('Groups - Move Groups', function () {
            var model = create();
            var events = modelListener(model);
            model.openGroup('first');
            var group2 = model.openGroup('second');
            model.renameGroup(group2, 'renamed');
            assert.equal(group2.label, 'renamed');
            assert.equal(group2, events.renamed[0]);
        });
        test('Groups - Position of Group', function () {
            var model = create();
            var group1 = model.openGroup('first');
            var group2 = model.openGroup('second');
            var group3 = model.openGroup('third');
            assert.equal(editor_2.Position.ONE, model.positionOfGroup(group1));
            assert.equal(editor_2.Position.TWO, model.positionOfGroup(group2));
            assert.equal(editor_2.Position.THREE, model.positionOfGroup(group3));
        });
        test('Groups - Rename Group', function () {
            var model = create();
            var group1 = model.openGroup('first');
            var group2 = model.openGroup('second');
            model.moveGroup(group1, 1);
            assert.equal(model.groups[0], group2);
            assert.equal(model.groups[1], group1);
            model.moveGroup(group1, 0);
            assert.equal(model.groups[0], group1);
            assert.equal(model.groups[1], group2);
            var group3 = model.openGroup('third');
            model.moveGroup(group1, 2);
            assert.equal(model.groups[0], group2);
            assert.equal(model.groups[1], group3);
            assert.equal(model.groups[2], group1);
        });
        test('Groups - Move Group sends move events for all moved groups', function () {
            var model = create();
            var events = modelListener(model);
            var group1 = model.openGroup('first');
            var group2 = model.openGroup('second');
            var group3 = model.openGroup('third');
            model.moveGroup(group1, 1);
            assert.equal(events.moved.length, 2);
            model.closeGroups();
            events = modelListener(model);
            group1 = model.openGroup('first');
            group2 = model.openGroup('second');
            group3 = model.openGroup('third');
            model.moveGroup(group1, 2);
            assert.equal(events.moved.length, 3);
            model.closeGroups();
            events = modelListener(model);
            group1 = model.openGroup('first');
            group2 = model.openGroup('second');
            group3 = model.openGroup('third');
            model.moveGroup(group3, 1);
            assert.equal(events.moved.length, 2);
            assert.ok(group2);
        });
        test('Groups - Event Aggregation', function () {
            var model = create();
            var groupEvents = [];
            var count = groupEvents.length;
            model.onModelChanged(function (group) {
                groupEvents.push(group);
            });
            var first = model.openGroup('first');
            assert.ok(groupEvents.length > count);
            count = groupEvents.length;
            var second = model.openGroup('second');
            assert.ok(groupEvents.length > count);
            count = groupEvents.length;
            model.renameGroup(second, 'renamed');
            assert.ok(groupEvents.length > count);
            count = groupEvents.length;
            var input1 = input();
            first.openEditor(input1);
            assert.ok(groupEvents.length > count);
            count = groupEvents.length;
            first.closeEditor(input1);
            assert.ok(groupEvents.length > count);
            count = groupEvents.length;
            model.closeGroup(second);
            assert.ok(groupEvents.length > count);
        });
        test('Groups - Open group but do not set active', function () {
            var model = create();
            var events = modelListener(model);
            var group1 = model.openGroup('first');
            model.openGroup('second', false);
            assert.equal(model.activeGroup, group1);
            assert.equal(events.activated.length, 1);
            assert.equal(events.activated[0], group1);
        });
        test('Groups - Group Identifiers', function () {
            var model = create();
            var group1 = model.openGroup('first');
            var group2 = model.openGroup('second');
            var group3 = model.openGroup('third');
            assert.equal(model.getGroup(group1.id), group1);
            assert.equal(model.getGroup(group2.id), group2);
            assert.equal(model.getGroup(group3.id), group3);
            model.closeGroup(group2);
            assert.equal(model.getGroup(group2.id), null);
            model.moveGroup(group1, 1);
            assert.equal(model.getGroup(group1.id), group1);
            assert.equal(model.getGroup(group3.id), group3);
            model.closeGroups();
            assert.equal(model.getGroup(group1.id), null);
            assert.equal(model.getGroup(group3.id), null);
        });
        test('Groups - Open Group at Index', function () {
            var model = create();
            var group1 = model.openGroup('first', false, 2);
            var group2 = model.openGroup('second', false, 1);
            var group3 = model.openGroup('third', false, 0);
            assert.equal(model.groups[0], group3);
            assert.equal(model.groups[1], group2);
            assert.equal(model.groups[2], group1);
        });
        test('Groups - Close All Groups except active', function () {
            var model = create();
            model.openGroup('first');
            model.openGroup('second');
            var group3 = model.openGroup('third');
            model.closeGroups(model.activeGroup);
            assert.equal(model.groups.length, 1);
            assert.equal(model.activeGroup, group3);
        });
        test('Groups - Close All Groups except inactive', function () {
            var model = create();
            model.openGroup('first');
            var group2 = model.openGroup('second');
            model.openGroup('third');
            model.closeGroups(group2);
            assert.equal(model.groups.length, 1);
            assert.equal(model.activeGroup, group2);
        });
        test('Stack - One Editor', function () {
            var model = create();
            var group = model.openGroup('group');
            var events = groupListener(group);
            assert.equal(group.count, 0);
            assert.equal(group.getEditors(true).length, 0);
            // Active && Pinned
            var input1 = input();
            group.openEditor(input1, { active: true, pinned: true });
            assert.equal(group.count, 1);
            assert.equal(group.getEditors(true).length, 1);
            assert.equal(group.activeEditor, input1);
            assert.equal(group.isActive(input1), true);
            assert.equal(group.isPreview(input1), false);
            assert.equal(group.isPinned(input1), true);
            assert.equal(group.isPinned(0), true);
            assert.equal(events.opened[0], input1);
            assert.equal(events.activated[0], input1);
            group.closeEditor(input1);
            assert.equal(group.count, 0);
            assert.equal(group.getEditors(true).length, 0);
            assert.equal(group.activeEditor, void 0);
            assert.equal(events.closed[0].editor, input1);
            assert.equal(events.closed[0].index, 0);
            assert.equal(events.closed[0].replaced, false);
            // Active && Preview
            var input2 = input();
            group.openEditor(input2, { active: true, pinned: false });
            assert.equal(group.count, 1);
            assert.equal(group.getEditors(true).length, 1);
            assert.equal(group.activeEditor, input2);
            assert.equal(group.isActive(input2), true);
            assert.equal(group.isPreview(input2), true);
            assert.equal(group.isPinned(input2), false);
            assert.equal(group.isPinned(0), false);
            assert.equal(events.opened[1], input2);
            assert.equal(events.activated[1], input2);
            group.closeEditor(input2);
            assert.equal(group.count, 0);
            assert.equal(group.getEditors(true).length, 0);
            assert.equal(group.activeEditor, void 0);
            assert.equal(events.closed[1].editor, input2);
            assert.equal(events.closed[1].index, 0);
            assert.equal(events.closed[1].replaced, false);
            group.closeEditor(input2);
            assert.equal(group.count, 0);
            assert.equal(group.getEditors(true).length, 0);
            assert.equal(group.activeEditor, void 0);
            assert.equal(events.closed[1].editor, input2);
            // Nonactive && Pinned => gets active because its first editor
            var input3 = input();
            group.openEditor(input3, { active: false, pinned: true });
            assert.equal(group.count, 1);
            assert.equal(group.getEditors(true).length, 1);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.isActive(input3), true);
            assert.equal(group.isPreview(input3), false);
            assert.equal(group.isPinned(input3), true);
            assert.equal(group.isPinned(0), true);
            assert.equal(events.opened[2], input3);
            assert.equal(events.activated[2], input3);
            group.closeEditor(input3);
            assert.equal(group.count, 0);
            assert.equal(group.getEditors(true).length, 0);
            assert.equal(group.activeEditor, void 0);
            assert.equal(events.closed[2].editor, input3);
            assert.equal(events.opened[2], input3);
            assert.equal(events.activated[2], input3);
            group.closeEditor(input3);
            assert.equal(group.count, 0);
            assert.equal(group.getEditors(true).length, 0);
            assert.equal(group.activeEditor, void 0);
            assert.equal(events.closed[2].editor, input3);
            // Nonactive && Preview => gets active because its first editor
            var input4 = input();
            group.openEditor(input4);
            assert.equal(group.count, 1);
            assert.equal(group.getEditors(true).length, 1);
            assert.equal(group.activeEditor, input4);
            assert.equal(group.isActive(input4), true);
            assert.equal(group.isPreview(input4), true);
            assert.equal(group.isPinned(input4), false);
            assert.equal(group.isPinned(0), false);
            assert.equal(events.opened[3], input4);
            assert.equal(events.activated[3], input4);
            group.closeEditor(input4);
            assert.equal(group.count, 0);
            assert.equal(group.getEditors(true).length, 0);
            assert.equal(group.activeEditor, void 0);
            assert.equal(events.closed[3].editor, input4);
        });
        test('Stack - Multiple Editors - Pinned and Active', function () {
            var model = create();
            var group = model.openGroup('group');
            var events = groupListener(group);
            var input1 = input();
            var input2 = input();
            var input3 = input();
            // Pinned and Active
            group.openEditor(input1, { pinned: true, active: true });
            group.openEditor(input2, { pinned: true, active: true });
            group.openEditor(input3, { pinned: true, active: true });
            assert.equal(group.count, 3);
            assert.equal(group.getEditors(true).length, 3);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.isActive(input1), false);
            assert.equal(group.isPinned(input1), true);
            assert.equal(group.isPreview(input1), false);
            assert.equal(group.isActive(input2), false);
            assert.equal(group.isPinned(input2), true);
            assert.equal(group.isPreview(input2), false);
            assert.equal(group.isActive(input3), true);
            assert.equal(group.isPinned(input3), true);
            assert.equal(group.isPreview(input3), false);
            assert.equal(events.opened[0], input1);
            assert.equal(events.opened[1], input2);
            assert.equal(events.opened[2], input3);
            var mru = group.getEditors(true);
            assert.equal(mru[0], input3);
            assert.equal(mru[1], input2);
            assert.equal(mru[2], input1);
            group.closeAllEditors();
            assert.equal(events.closed.length, 3);
            assert.equal(group.count, 0);
        });
        test('Stack - Multiple Editors - Preview editor moves to the side of the active one', function () {
            var model = create();
            var group = model.openGroup('group');
            var input1 = input();
            var input2 = input();
            var input3 = input();
            group.openEditor(input1, { pinned: false, active: true });
            group.openEditor(input2, { pinned: true, active: true });
            group.openEditor(input3, { pinned: true, active: true });
            assert.equal(input3, group.getEditors()[2]);
            var input4 = input();
            group.openEditor(input4, { pinned: false, active: true }); // this should cause the preview editor to move after input3
            assert.equal(input4, group.getEditors()[2]);
        });
        test('Stack - Multiple Editors - Pinned and Active (DEFAULT_OPEN_EDITOR_DIRECTION = Direction.LEFT)', function () {
            var inst = new instantiationServiceMock_1.TestInstantiationService();
            inst.stub(storage_1.IStorageService, new workbenchTestServices_1.TestStorageService());
            inst.stub(lifecycle_1.ILifecycleService, new workbenchTestServices_1.TestLifecycleService());
            inst.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            inst.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            var config = new testConfigurationService_1.TestConfigurationService();
            inst.stub(configuration_1.IConfigurationService, config);
            config.setUserConfiguration('workbench', { editor: { openPositioning: 'left' } });
            var model = inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
            var group = model.openGroup('group');
            var events = groupListener(group);
            var input1 = input();
            var input2 = input();
            var input3 = input();
            // Pinned and Active
            group.openEditor(input1, { pinned: true, active: true });
            group.openEditor(input2, { pinned: true, active: true });
            group.openEditor(input3, { pinned: true, active: true });
            assert.equal(group.getEditors()[0], input3);
            assert.equal(group.getEditors()[1], input2);
            assert.equal(group.getEditors()[2], input1);
            model.closeGroups();
            assert.equal(events.closed.length, 3);
            assert.equal(group.count, 0);
        });
        test('Stack - Multiple Editors - Pinned and Not Active', function () {
            var model = create();
            var group = model.openGroup('group');
            var input1 = input();
            var input2 = input();
            var input3 = input();
            // Pinned and Active
            group.openEditor(input1, { pinned: true });
            group.openEditor(input2, { pinned: true });
            group.openEditor(input3, { pinned: true });
            assert.equal(group.count, 3);
            assert.equal(group.getEditors(true).length, 3);
            assert.equal(group.activeEditor, input1);
            assert.equal(group.isActive(input1), true);
            assert.equal(group.isPinned(input1), true);
            assert.equal(group.isPinned(0), true);
            assert.equal(group.isPreview(input1), false);
            assert.equal(group.isActive(input2), false);
            assert.equal(group.isPinned(input2), true);
            assert.equal(group.isPinned(1), true);
            assert.equal(group.isPreview(input2), false);
            assert.equal(group.isActive(input3), false);
            assert.equal(group.isPinned(input3), true);
            assert.equal(group.isPinned(2), true);
            assert.equal(group.isPreview(input3), false);
            var mru = group.getEditors(true);
            assert.equal(mru[0], input1);
            assert.equal(mru[1], input2);
            assert.equal(mru[2], input3);
        });
        test('Stack - Multiple Editors - Preview gets overwritten', function () {
            var model = create();
            var group = model.openGroup('group');
            var events = groupListener(group);
            var input1 = input();
            var input2 = input();
            var input3 = input();
            // Non active, preview
            group.openEditor(input1); // becomes active, preview
            group.openEditor(input2); // overwrites preview
            group.openEditor(input3); // overwrites preview
            assert.equal(group.count, 1);
            assert.equal(group.getEditors(true).length, 1);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.isActive(input3), true);
            assert.equal(group.isPinned(input3), false);
            assert.equal(group.isPreview(input3), true);
            assert.equal(events.opened[0], input1);
            assert.equal(events.opened[1], input2);
            assert.equal(events.opened[2], input3);
            assert.equal(events.closed[0].editor, input1);
            assert.equal(events.closed[1].editor, input2);
            assert.equal(events.closed[0].replaced, true);
            assert.equal(events.closed[1].replaced, true);
            var mru = group.getEditors(true);
            assert.equal(mru[0], input3);
            assert.equal(mru.length, 1);
        });
        test('Stack - Multiple Editors - set active', function () {
            var model = create();
            var group = model.openGroup('group');
            var events = groupListener(group);
            var input1 = input();
            var input2 = input();
            var input3 = input();
            group.openEditor(input1, { pinned: true, active: true });
            group.openEditor(input2, { pinned: true, active: true });
            group.openEditor(input3, { pinned: false, active: true });
            assert.equal(group.activeEditor, input3);
            var mru = group.getEditors(true);
            assert.equal(mru[0], input3);
            assert.equal(mru[1], input2);
            assert.equal(mru[2], input1);
            group.setActive(input3);
            assert.equal(events.activated.length, 3);
            group.setActive(input1);
            assert.equal(events.activated[3], input1);
            assert.equal(group.activeEditor, input1);
            assert.equal(group.isActive(input1), true);
            assert.equal(group.isActive(input2), false);
            assert.equal(group.isActive(input3), false);
            mru = group.getEditors(true);
            assert.equal(mru[0], input1);
            assert.equal(mru[1], input3);
            assert.equal(mru[2], input2);
        });
        test('Stack - Multiple Editors - pin and unpin', function () {
            var model = create();
            var group = model.openGroup('group');
            var events = groupListener(group);
            var input1 = input();
            var input2 = input();
            var input3 = input();
            group.openEditor(input1, { pinned: true, active: true });
            group.openEditor(input2, { pinned: true, active: true });
            group.openEditor(input3, { pinned: false, active: true });
            assert.equal(group.activeEditor, input3);
            assert.equal(group.count, 3);
            group.pin(input3);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.isPinned(input3), true);
            assert.equal(group.isPreview(input3), false);
            assert.equal(group.isActive(input3), true);
            assert.equal(events.pinned[0], input3);
            assert.equal(group.count, 3);
            group.unpin(input1);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.isPinned(input1), false);
            assert.equal(group.isPreview(input1), true);
            assert.equal(group.isActive(input1), false);
            assert.equal(events.unpinned[0], input1);
            assert.equal(group.count, 3);
            group.unpin(input2);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.count, 2); // 2 previews got merged into one
            assert.equal(group.getEditors()[0], input2);
            assert.equal(group.getEditors()[1], input3);
            assert.equal(events.closed[0].editor, input1);
            assert.equal(group.count, 2);
            group.unpin(input3);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.count, 1); // pinning replaced the preview
            assert.equal(group.getEditors()[0], input3);
            assert.equal(events.closed[1].editor, input2);
            assert.equal(group.count, 1);
        });
        test('Stack - Multiple Editors - closing picks next from MRU list', function () {
            var model = create();
            var group = model.openGroup('group');
            var events = groupListener(group);
            var input1 = input();
            var input2 = input();
            var input3 = input();
            var input4 = input();
            var input5 = input();
            group.openEditor(input1, { pinned: true, active: true });
            group.openEditor(input2, { pinned: true, active: true });
            group.openEditor(input3, { pinned: true, active: true });
            group.openEditor(input4, { pinned: true, active: true });
            group.openEditor(input5, { pinned: true, active: true });
            assert.equal(group.activeEditor, input5);
            assert.equal(group.getEditors(true)[0], input5);
            assert.equal(group.count, 5);
            group.closeEditor(input5);
            assert.equal(group.activeEditor, input4);
            assert.equal(events.activated[5], input4);
            assert.equal(group.count, 4);
            group.setActive(input1);
            group.setActive(input4);
            group.closeEditor(input4);
            assert.equal(group.activeEditor, input1);
            assert.equal(group.count, 3);
            group.closeEditor(input1);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.count, 2);
            group.setActive(input2);
            group.closeEditor(input2);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.count, 1);
            group.closeEditor(input3);
            assert.ok(!group.activeEditor);
            assert.equal(group.count, 0);
        });
        test('Stack - Multiple Editors - move editor', function () {
            var model = create();
            var group = model.openGroup('group');
            var events = groupListener(group);
            var input1 = input();
            var input2 = input();
            var input3 = input();
            var input4 = input();
            var input5 = input();
            group.openEditor(input1, { pinned: true, active: true });
            group.openEditor(input2, { pinned: true, active: true });
            group.moveEditor(input1, 1);
            assert.equal(events.moved[0], input1);
            assert.equal(group.getEditors()[0], input2);
            assert.equal(group.getEditors()[1], input1);
            group.setActive(input1);
            group.openEditor(input3, { pinned: true, active: true });
            group.openEditor(input4, { pinned: true, active: true });
            group.openEditor(input5, { pinned: true, active: true });
            group.moveEditor(input4, 0);
            assert.equal(events.moved[1], input4);
            assert.equal(group.getEditors()[0], input4);
            assert.equal(group.getEditors()[1], input2);
            assert.equal(group.getEditors()[2], input1);
            assert.equal(group.getEditors()[3], input3);
            assert.equal(group.getEditors()[4], input5);
            group.moveEditor(input4, 3);
            group.moveEditor(input2, 1);
            assert.equal(group.getEditors()[0], input1);
            assert.equal(group.getEditors()[1], input2);
            assert.equal(group.getEditors()[2], input3);
            assert.equal(group.getEditors()[3], input4);
            assert.equal(group.getEditors()[4], input5);
        });
        test('Stack - Multiple Editors - move editor across groups', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group1');
            var g1_input1 = input();
            var g1_input2 = input();
            var g2_input1 = input();
            group1.openEditor(g1_input1, { active: true, pinned: true });
            group1.openEditor(g1_input2, { active: true, pinned: true });
            group2.openEditor(g2_input1, { active: true, pinned: true });
            // A move across groups is a close in the one group and an open in the other group at a specific index
            group2.closeEditor(g2_input1);
            group1.openEditor(g2_input1, { active: true, pinned: true, index: 1 });
            assert.equal(group1.count, 3);
            assert.equal(group1.getEditors()[0], g1_input1);
            assert.equal(group1.getEditors()[1], g2_input1);
            assert.equal(group1.getEditors()[2], g1_input2);
        });
        test('Stack - Multiple Editors - move editor across groups (input already exists in group 1)', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group1');
            var g1_input1 = input();
            var g1_input2 = input();
            var g1_input3 = input();
            var g2_input1 = g1_input2;
            group1.openEditor(g1_input1, { active: true, pinned: true });
            group1.openEditor(g1_input2, { active: true, pinned: true });
            group1.openEditor(g1_input3, { active: true, pinned: true });
            group2.openEditor(g2_input1, { active: true, pinned: true });
            // A move across groups is a close in the one group and an open in the other group at a specific index
            group2.closeEditor(g2_input1);
            group1.openEditor(g2_input1, { active: true, pinned: true, index: 0 });
            assert.equal(group1.count, 3);
            assert.equal(group1.getEditors()[0], g1_input2);
            assert.equal(group1.getEditors()[1], g1_input1);
            assert.equal(group1.getEditors()[2], g1_input3);
        });
        test('Stack - Multiple Editors - Pinned & Non Active', function () {
            var model = create();
            var group = model.openGroup('group');
            var input1 = input();
            group.openEditor(input1);
            assert.equal(group.activeEditor, input1);
            assert.equal(group.previewEditor, input1);
            assert.equal(group.getEditors()[0], input1);
            assert.equal(group.count, 1);
            var input2 = input();
            group.openEditor(input2, { pinned: true, active: false });
            assert.equal(group.activeEditor, input1);
            assert.equal(group.previewEditor, input1);
            assert.equal(group.getEditors()[0], input1);
            assert.equal(group.getEditors()[1], input2);
            assert.equal(group.count, 2);
            var input3 = input();
            group.openEditor(input3, { pinned: true, active: false });
            assert.equal(group.activeEditor, input1);
            assert.equal(group.previewEditor, input1);
            assert.equal(group.getEditors()[0], input1);
            assert.equal(group.getEditors()[1], input3);
            assert.equal(group.getEditors()[2], input2);
            assert.equal(group.isPinned(input1), false);
            assert.equal(group.isPinned(input2), true);
            assert.equal(group.isPinned(input3), true);
            assert.equal(group.count, 3);
        });
        test('Stack - Multiple Editors - Close Others, Close Left, Close Right', function () {
            var model = create();
            var group = model.openGroup('group');
            var input1 = input();
            var input2 = input();
            var input3 = input();
            var input4 = input();
            var input5 = input();
            group.openEditor(input1, { active: true, pinned: true });
            group.openEditor(input2, { active: true, pinned: true });
            group.openEditor(input3, { active: true, pinned: true });
            group.openEditor(input4, { active: true, pinned: true });
            group.openEditor(input5, { active: true, pinned: true });
            // Close Others
            group.closeEditors(group.activeEditor);
            assert.equal(group.activeEditor, input5);
            assert.equal(group.count, 1);
            group.closeAllEditors();
            group.openEditor(input1, { active: true, pinned: true });
            group.openEditor(input2, { active: true, pinned: true });
            group.openEditor(input3, { active: true, pinned: true });
            group.openEditor(input4, { active: true, pinned: true });
            group.openEditor(input5, { active: true, pinned: true });
            group.setActive(input3);
            // Close Left
            assert.equal(group.activeEditor, input3);
            group.closeEditors(group.activeEditor, editor_2.Direction.LEFT);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.count, 3);
            assert.equal(group.getEditors()[0], input3);
            assert.equal(group.getEditors()[1], input4);
            assert.equal(group.getEditors()[2], input5);
            group.closeAllEditors();
            group.openEditor(input1, { active: true, pinned: true });
            group.openEditor(input2, { active: true, pinned: true });
            group.openEditor(input3, { active: true, pinned: true });
            group.openEditor(input4, { active: true, pinned: true });
            group.openEditor(input5, { active: true, pinned: true });
            group.setActive(input3);
            // Close Right
            assert.equal(group.activeEditor, input3);
            group.closeEditors(group.activeEditor, editor_2.Direction.RIGHT);
            assert.equal(group.activeEditor, input3);
            assert.equal(group.count, 3);
            assert.equal(group.getEditors()[0], input1);
            assert.equal(group.getEditors()[1], input2);
            assert.equal(group.getEditors()[2], input3);
        });
        test('Stack - Multiple Editors - real user example', function () {
            var model = create();
            var group = model.openGroup('group');
            // [] -> /index.html/
            var indexHtml = input('index.html');
            group.openEditor(indexHtml);
            assert.equal(group.activeEditor, indexHtml);
            assert.equal(group.previewEditor, indexHtml);
            assert.equal(group.getEditors()[0], indexHtml);
            assert.equal(group.count, 1);
            // /index.html/ -> /style.css/
            var styleCss = input('style.css');
            group.openEditor(styleCss);
            assert.equal(group.activeEditor, styleCss);
            assert.equal(group.previewEditor, styleCss);
            assert.equal(group.getEditors()[0], styleCss);
            assert.equal(group.count, 1);
            // /style.css/ -> [/style.css/, test.js]
            var testJs = input('test.js');
            group.openEditor(testJs, { active: true, pinned: true });
            assert.equal(group.previewEditor, styleCss);
            assert.equal(group.activeEditor, testJs);
            assert.equal(group.isPreview(styleCss), true);
            assert.equal(group.isPinned(testJs), true);
            assert.equal(group.getEditors()[0], styleCss);
            assert.equal(group.getEditors()[1], testJs);
            assert.equal(group.count, 2);
            // [/style.css/, test.js] -> [test.js, /index.html/]
            indexHtml = input('index.html');
            group.openEditor(indexHtml, { active: true });
            assert.equal(group.activeEditor, indexHtml);
            assert.equal(group.previewEditor, indexHtml);
            assert.equal(group.isPreview(indexHtml), true);
            assert.equal(group.isPinned(testJs), true);
            assert.equal(group.getEditors()[0], testJs);
            assert.equal(group.getEditors()[1], indexHtml);
            assert.equal(group.count, 2);
            // make test.js active
            testJs = input('test.js');
            group.setActive(testJs);
            assert.equal(group.activeEditor, testJs);
            assert.equal(group.isActive(testJs), true);
            assert.equal(group.count, 2);
            // [test.js, /indexHtml/] -> [test.js, index.html]
            indexHtml = input('index.html');
            group.pin(indexHtml);
            assert.equal(group.isPinned(indexHtml), true);
            assert.equal(group.isPreview(indexHtml), false);
            assert.equal(group.activeEditor, testJs);
            // [test.js, index.html] -> [test.js, file.ts, index.html]
            var fileTs = input('file.ts');
            group.openEditor(fileTs, { active: true, pinned: true });
            assert.equal(group.isPinned(fileTs), true);
            assert.equal(group.isPreview(fileTs), false);
            assert.equal(group.count, 3);
            assert.equal(group.activeEditor, fileTs);
            // [test.js, index.html, file.ts] -> [test.js, /file.ts/, index.html]
            group.unpin(fileTs);
            assert.equal(group.count, 3);
            assert.equal(group.isPinned(fileTs), false);
            assert.equal(group.isPreview(fileTs), true);
            assert.equal(group.activeEditor, fileTs);
            // [test.js, /file.ts/, index.html] -> [test.js, /other.ts/, index.html]
            var otherTs = input('other.ts');
            group.openEditor(otherTs, { active: true });
            assert.equal(group.count, 3);
            assert.equal(group.activeEditor, otherTs);
            assert.ok(group.getEditors()[0].matches(testJs));
            assert.equal(group.getEditors()[1], otherTs);
            assert.ok(group.getEditors()[2].matches(indexHtml));
            // make index.html active
            indexHtml = input('index.html');
            group.setActive(indexHtml);
            assert.equal(group.activeEditor, indexHtml);
            // [test.js, /other.ts/, index.html] -> [test.js, /other.ts/]
            group.closeEditor(indexHtml);
            assert.equal(group.count, 2);
            assert.equal(group.activeEditor, otherTs);
            assert.ok(group.getEditors()[0].matches(testJs));
            assert.equal(group.getEditors()[1], otherTs);
            // [test.js, /other.ts/] -> [test.js]
            group.closeEditor(otherTs);
            assert.equal(group.count, 1);
            assert.equal(group.activeEditor, testJs);
            assert.ok(group.getEditors()[0].matches(testJs));
            // [test.js] -> /test.js/
            group.unpin(testJs);
            assert.equal(group.count, 1);
            assert.equal(group.activeEditor, testJs);
            assert.ok(group.getEditors()[0].matches(testJs));
            assert.equal(group.isPinned(testJs), false);
            assert.equal(group.isPreview(testJs), true);
            // /test.js/ -> []
            group.closeEditor(testJs);
            assert.equal(group.count, 0);
            assert.equal(group.activeEditor, null);
            assert.equal(group.previewEditor, null);
        });
        test('Stack - Single Group, Single Editor - persist', function () {
            var inst = new instantiationServiceMock_1.TestInstantiationService();
            inst.stub(storage_1.IStorageService, new workbenchTestServices_1.TestStorageService());
            inst.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            var lifecycle = new workbenchTestServices_1.TestLifecycleService();
            inst.stub(lifecycle_1.ILifecycleService, lifecycle);
            inst.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            var config = new testConfigurationService_1.TestConfigurationService();
            config.setUserConfiguration('workbench', { editor: { openPositioning: 'right' } });
            inst.stub(configuration_1.IConfigurationService, config);
            platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).setInstantiationService(inst);
            var model = inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
            var group = model.openGroup('group');
            var input1 = input();
            group.openEditor(input1);
            assert.equal(model.groups.length, 1);
            assert.equal(group.count, 1);
            assert.equal(group.activeEditor.matches(input1), true);
            assert.equal(group.previewEditor.matches(input1), true);
            assert.equal(group.label, 'group');
            assert.equal(group.isActive(input1), true);
            lifecycle.fireShutdown();
            // Create model again - should load from storage
            model = inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
            assert.equal(model.groups.length, 1);
            group = model.activeGroup;
            assert.equal(group.count, 1);
            assert.equal(group.activeEditor.matches(input1), true);
            assert.equal(group.previewEditor.matches(input1), true);
            assert.equal(group.label, 'group');
            assert.equal(group.isActive(input1), true);
        });
        test('Stack - Multiple Groups, Multiple editors - persist', function () {
            var inst = new instantiationServiceMock_1.TestInstantiationService();
            inst.stub(storage_1.IStorageService, new workbenchTestServices_1.TestStorageService());
            inst.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            var lifecycle = new workbenchTestServices_1.TestLifecycleService();
            inst.stub(lifecycle_1.ILifecycleService, lifecycle);
            inst.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            var config = new testConfigurationService_1.TestConfigurationService();
            config.setUserConfiguration('workbench', { editor: { openPositioning: 'right' } });
            inst.stub(configuration_1.IConfigurationService, config);
            platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).setInstantiationService(inst);
            var model = inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
            var group1 = model.openGroup('group1');
            var g1_input1 = input();
            var g1_input2 = input();
            var g1_input3 = input();
            group1.openEditor(g1_input1, { active: true, pinned: true });
            group1.openEditor(g1_input2, { active: true, pinned: false });
            group1.openEditor(g1_input3, { active: false, pinned: true });
            var group2 = model.openGroup('group2');
            var g2_input1 = input();
            var g2_input2 = input();
            var g2_input3 = input();
            group2.openEditor(g2_input1, { active: true, pinned: true });
            group2.openEditor(g2_input2, { active: false, pinned: false });
            group2.openEditor(g2_input3, { active: false, pinned: true });
            assert.equal(model.groups.length, 2);
            assert.equal(group1.count, 3);
            assert.equal(group2.count, 3);
            assert.equal(group1.activeEditor.matches(g1_input2), true);
            assert.equal(group2.activeEditor.matches(g2_input1), true);
            assert.equal(group1.previewEditor.matches(g1_input2), true);
            assert.equal(group2.previewEditor.matches(g2_input2), true);
            assert.equal(group1.label, 'group1');
            assert.equal(group2.label, 'group2');
            assert.equal(group1.getEditors(true)[0].matches(g1_input2), true);
            assert.equal(group1.getEditors(true)[1].matches(g1_input1), true);
            assert.equal(group1.getEditors(true)[2].matches(g1_input3), true);
            assert.equal(group2.getEditors(true)[0].matches(g2_input1), true);
            assert.equal(group2.getEditors(true)[1].matches(g2_input2), true);
            assert.equal(group2.getEditors(true)[2].matches(g2_input3), true);
            lifecycle.fireShutdown();
            // Create model again - should load from storage
            model = inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
            group1 = model.groups[0];
            group2 = model.groups[1];
            assert.equal(model.groups.length, 2);
            assert.equal(group1.count, 3);
            assert.equal(group2.count, 3);
            assert.equal(group1.activeEditor.matches(g1_input2), true);
            assert.equal(group2.activeEditor.matches(g2_input1), true);
            assert.equal(group1.previewEditor.matches(g1_input2), true);
            assert.equal(group2.previewEditor.matches(g2_input2), true);
            assert.equal(group1.label, 'group1');
            assert.equal(group2.label, 'group2');
            assert.equal(group1.getEditors(true)[0].matches(g1_input2), true);
            assert.equal(group1.getEditors(true)[1].matches(g1_input1), true);
            assert.equal(group1.getEditors(true)[2].matches(g1_input3), true);
            assert.equal(group2.getEditors(true)[0].matches(g2_input1), true);
            assert.equal(group2.getEditors(true)[1].matches(g2_input2), true);
            assert.equal(group2.getEditors(true)[2].matches(g2_input3), true);
        });
        test('Stack - Single group, multiple editors - persist (some not persistable)', function () {
            var inst = new instantiationServiceMock_1.TestInstantiationService();
            inst.stub(storage_1.IStorageService, new workbenchTestServices_1.TestStorageService());
            inst.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            var lifecycle = new workbenchTestServices_1.TestLifecycleService();
            inst.stub(lifecycle_1.ILifecycleService, lifecycle);
            inst.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            var config = new testConfigurationService_1.TestConfigurationService();
            config.setUserConfiguration('workbench', { editor: { openPositioning: 'right' } });
            inst.stub(configuration_1.IConfigurationService, config);
            platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).setInstantiationService(inst);
            var model = inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
            var group = model.openGroup('group1');
            var serializableInput1 = input();
            var nonSerializableInput2 = input('3', true);
            var serializableInput2 = input();
            group.openEditor(serializableInput1, { active: true, pinned: true });
            group.openEditor(nonSerializableInput2, { active: true, pinned: false });
            group.openEditor(serializableInput2, { active: false, pinned: true });
            assert.equal(group.count, 3);
            assert.equal(group.activeEditor.matches(nonSerializableInput2), true);
            assert.equal(group.previewEditor.matches(nonSerializableInput2), true);
            assert.equal(group.getEditors(true)[0].matches(nonSerializableInput2), true);
            assert.equal(group.getEditors(true)[1].matches(serializableInput1), true);
            assert.equal(group.getEditors(true)[2].matches(serializableInput2), true);
            lifecycle.fireShutdown();
            // Create model again - should load from storage
            model = inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
            group = model.groups[0];
            assert.equal(group.count, 2);
            assert.equal(group.activeEditor.matches(serializableInput1), true);
            assert.equal(group.previewEditor, null);
            assert.equal(group.getEditors(true)[0].matches(serializableInput1), true);
            assert.equal(group.getEditors(true)[1].matches(serializableInput2), true);
        });
        test('Stack - Multiple groups, multiple editors - persist (some not persistable, causes empty group)', function () {
            var inst = new instantiationServiceMock_1.TestInstantiationService();
            inst.stub(storage_1.IStorageService, new workbenchTestServices_1.TestStorageService());
            inst.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            var lifecycle = new workbenchTestServices_1.TestLifecycleService();
            inst.stub(lifecycle_1.ILifecycleService, lifecycle);
            inst.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            var config = new testConfigurationService_1.TestConfigurationService();
            config.setUserConfiguration('workbench', { editor: { openPositioning: 'right' } });
            inst.stub(configuration_1.IConfigurationService, config);
            platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).setInstantiationService(inst);
            var model = inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group1');
            var serializableInput1 = input();
            var serializableInput2 = input();
            var nonSerializableInput = input('2', true);
            group1.openEditor(serializableInput1, { pinned: true });
            group1.openEditor(serializableInput2);
            group2.openEditor(nonSerializableInput);
            lifecycle.fireShutdown();
            // Create model again - should load from storage
            model = inst.createInstance(editorStacksModel_1.EditorStacksModel, true);
            group1 = model.groups[0];
            assert.equal(model.groups.length, 1);
            assert.equal(group1.count, 2);
            assert.equal(group1.getEditors()[0].matches(serializableInput1), true);
            assert.equal(group1.getEditors()[1].matches(serializableInput2), true);
        });
        test('Stack - Multiple groups, multiple editors - persist (ignore persisted when editors to open on startup)', function () {
            var inst = new instantiationServiceMock_1.TestInstantiationService();
            inst.stub(storage_1.IStorageService, new workbenchTestServices_1.TestStorageService());
            var lifecycle = new workbenchTestServices_1.TestLifecycleService();
            inst.stub(lifecycle_1.ILifecycleService, lifecycle);
            inst.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            var config = new testConfigurationService_1.TestConfigurationService();
            config.setUserConfiguration('workbench', { editor: { openPositioning: 'right' } });
            inst.stub(configuration_1.IConfigurationService, config);
            platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).setInstantiationService(inst);
            var model = inst.createInstance(editorStacksModel_1.EditorStacksModel, false);
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group1');
            var serializableInput1 = input();
            var serializableInput2 = input();
            var nonSerializableInput = input('2', true);
            group1.openEditor(serializableInput1, { pinned: true });
            group1.openEditor(serializableInput2);
            group2.openEditor(nonSerializableInput);
            lifecycle.fireShutdown();
            // Create model again - should NOT load from storage
            model = inst.createInstance(editorStacksModel_1.EditorStacksModel, false);
            assert.equal(model.groups.length, 0);
        });
        test('Stack - Multiple Editors - Navigation (across groups)', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            var input1 = input();
            var input2 = input();
            var input3 = input();
            group1.openEditor(input1, { pinned: true, active: true });
            group1.openEditor(input2, { pinned: true, active: true });
            group1.openEditor(input3, { pinned: true, active: true });
            var input4 = input();
            var input5 = input();
            var input6 = input();
            group2.openEditor(input4, { pinned: true, active: true });
            group2.openEditor(input5, { pinned: true, active: true });
            group2.openEditor(input6, { pinned: true, active: true });
            model.setActive(group1);
            group1.setActive(input1);
            var previous = model.previous(true, false /* jump groups, do NOT cycle at start*/);
            assert.equal(previous, null);
            previous = model.previous(true /* jump groups */);
            assert.equal(previous.group, group2);
            assert.equal(previous.editor, input6);
            model.setActive(previous.group);
            previous.group.setActive(previous.editor);
            var next = model.next(true, false /* jump groups, do NOT cycle at end */);
            assert.equal(next, null);
            next = model.next(true /* jump groups */);
            assert.equal(next.group, group1);
            assert.equal(next.editor, input1);
            model.setActive(group1);
            group1.setActive(input3);
            next = model.next(true /* jump groups */);
            assert.equal(next.group, group2);
            assert.equal(next.editor, input4);
            model.setActive(next.group);
            next.group.setActive(next.editor);
            previous = model.previous(true /* jump groups */);
            assert.equal(previous.group, group1);
            assert.equal(previous.editor, input3);
            model.setActive(previous.group);
            next.group.setActive(previous.editor);
            var last = model.last();
            assert.equal(last.group, group1);
            assert.equal(last.editor, input3);
        });
        test('Stack - Multiple Editors - Navigation (in group)', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            var input1 = input();
            var input2 = input();
            var input3 = input();
            group1.openEditor(input1, { pinned: true, active: true });
            group1.openEditor(input2, { pinned: true, active: true });
            group1.openEditor(input3, { pinned: true, active: true });
            var input4 = input();
            var input5 = input();
            var input6 = input();
            group2.openEditor(input4, { pinned: true, active: true });
            group2.openEditor(input5, { pinned: true, active: true });
            group2.openEditor(input6, { pinned: true, active: true });
            model.setActive(group1);
            group1.setActive(input1);
            var previous = model.previous(false, false /* do NOT jump groups, do NOT cycle at start*/);
            assert.equal(previous, null);
            previous = model.previous(false /* do NOT jump groups */);
            assert.equal(previous.group, group1);
            assert.equal(previous.editor, input3);
            model.setActive(previous.group);
            previous.group.setActive(previous.editor);
            var next = model.next(false, false /* do NOT jump groups, do NOT cycle at end */);
            assert.equal(next, null);
            next = model.next(false /* do NOT jump groups */);
            assert.equal(next.group, group1);
            assert.equal(next.editor, input1);
            model.setActive(group1);
            group1.setActive(input3);
            next = model.next(false /* do NOT jump groups */);
            assert.equal(next.group, group1);
            assert.equal(next.editor, input1);
            model.setActive(next.group);
            next.group.setActive(next.editor);
            previous = model.previous(false /* do NOT jump groups */);
            assert.equal(previous.group, group1);
            assert.equal(previous.editor, input3);
        });
        test('Stack - Multiple Editors - Resources', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            assert.ok(!model.isOpen(uri_1.default.file('/hello/world.txt')));
            var input1Resource = uri_1.default.file('/hello/world.txt');
            var input1ResourceUpper = uri_1.default.file('/hello/WORLD.txt');
            var input1 = input(void 0, false, input1Resource);
            group1.openEditor(input1);
            assert.ok(model.isOpen(input1Resource));
            assert.ok(group1.contains(input1Resource));
            assert.equal(model.count(input1), 1);
            assert.equal(group1.getEditor(input1Resource), input1);
            assert.ok(!group1.getEditor(input1ResourceUpper));
            assert.ok(!model.isOpen(input1ResourceUpper));
            assert.ok(!group1.contains(input1ResourceUpper));
            group2.openEditor(input1);
            group1.closeEditor(input1);
            assert.ok(model.isOpen(input1Resource));
            assert.ok(!group1.contains(input1Resource));
            assert.ok(!group1.getEditor(input1Resource));
            assert.ok(!group1.getEditor(input1ResourceUpper));
            assert.ok(group2.contains(input1Resource));
            assert.equal(group2.getEditor(input1Resource), input1);
            assert.equal(model.count(input1), 1);
            var input1ResourceClone = uri_1.default.file('/hello/world.txt');
            var input1Clone = input(void 0, false, input1ResourceClone);
            group1.openEditor(input1Clone);
            assert.ok(group1.contains(input1Resource));
            group2.closeEditor(input1);
            assert.ok(model.isOpen(input1Resource));
            assert.ok(group1.contains(input1Resource));
            assert.equal(group1.getEditor(input1Resource), input1Clone);
            assert.ok(!group2.contains(input1Resource));
            group1.closeEditor(input1Clone);
            assert.ok(!model.isOpen(input1Resource));
            assert.ok(!group1.contains(input1Resource));
            group1.openEditor(input1);
            var input2Resource = uri_1.default.file('/hello/world_other.txt');
            var input2 = input(void 0, false, input2Resource);
            var input3Resource = uri_1.default.file('/hello/world_different.txt');
            var input3 = input(void 0, false, input3Resource);
            group1.openEditor(input2);
            assert.ok(model.isOpen(input2Resource));
            assert.ok(!model.isOpen(input1Resource));
            group1.openEditor(input3, { pinned: true });
            assert.ok(model.isOpen(input2Resource));
            assert.ok(model.isOpen(input3Resource));
            model.closeGroups();
            assert.ok(!model.isOpen(input2Resource));
            assert.ok(!model.isOpen(input3Resource));
        });
        test('Stack - Multiple Editors - Editor Dispose', function () {
            var model = create();
            var events = modelListener(model);
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            var input1 = input();
            var input2 = input();
            var input3 = input();
            group1.openEditor(input1, { pinned: true, active: true });
            group1.openEditor(input2, { pinned: true, active: true });
            group1.openEditor(input3, { pinned: true, active: true });
            group2.openEditor(input1, { pinned: true, active: true });
            group2.openEditor(input2, { pinned: true, active: true });
            input1.dispose();
            assert.equal(events.disposed.length, 2);
            assert.ok(events.disposed[0].editor.matches(input1));
            assert.ok(events.disposed[1].editor.matches(input1));
            input3.dispose();
            assert.equal(events.disposed.length, 3);
            assert.ok(events.disposed[2].editor.matches(input3));
            var input4 = input();
            var input5 = input();
            group1.openEditor(input4, { pinned: false, active: true });
            group1.openEditor(input5, { pinned: false, active: true });
            input4.dispose();
            assert.equal(events.disposed.length, 3);
            model.closeGroup(group2);
            input2.dispose();
            assert.equal(events.disposed.length, 4);
        });
        test('Stack - Multiple Editors - Editor Disposed on Close', function () {
            var model = create();
            var events = modelListener(model);
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            var input1 = input();
            var input2 = input();
            var input3 = input();
            var input4 = input();
            group1.openEditor(input1, { pinned: true, active: true });
            group1.openEditor(input2, { pinned: true, active: true });
            group1.openEditor(input3, { pinned: true, active: true });
            group1.openEditor(input4, { pinned: true, active: true });
            group1.closeEditor(input3);
            assert.equal(events.editorClosed.length, 1);
            assert.equal(events.editorClosed[0].editor, input3);
            assert.equal(events.editorWillClose.length, 1);
            assert.equal(events.editorWillClose[0].editor, input3);
            assert.equal(events.editorWillClose[0].group, group1);
            assert.equal(input3.isDisposed(), true);
            group2.openEditor(input2, { pinned: true, active: true });
            group2.openEditor(input3, { pinned: true, active: true });
            group2.openEditor(input4, { pinned: true, active: true });
            group1.closeEditor(input2);
            assert.equal(events.editorClosed.length, 2);
            assert.equal(events.editorClosed[1].editor, input2);
            assert.equal(events.editorWillClose.length, 2);
            assert.equal(events.editorWillClose[1].editor, input2);
            assert.equal(events.editorWillClose[1].group, group1);
            assert.equal(input2.isDisposed(), false);
            group2.closeEditor(input2);
            assert.equal(events.editorClosed.length, 3);
            assert.equal(events.editorClosed[2].editor, input2);
            assert.equal(events.editorWillClose.length, 3);
            assert.equal(events.editorWillClose[2].editor, input2);
            assert.equal(events.editorWillClose[2].group, group2);
            assert.equal(input2.isDisposed(), true);
            group1.closeAllEditors();
            assert.equal(events.editorClosed.length, 5);
            assert.equal(events.editorWillClose.length, 5);
            assert.equal(input4.isDisposed(), false);
            model.closeGroups();
            assert.equal(events.editorClosed.length, 7);
            assert.equal(events.editorWillClose.length, 7);
            assert.equal(input4.isDisposed(), true);
        });
        test('Stack - Multiple Editors - Editor Disposed on Close (Diff Editor)', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var input1 = input();
            var input2 = input();
            var diffInput = new diffEditorInput_1.DiffEditorInput('name', 'description', input1, input2);
            group1.openEditor(diffInput, { pinned: true, active: true });
            group1.openEditor(input1, { pinned: true, active: true });
            group1.closeEditor(diffInput);
            assert.equal(diffInput.isDisposed(), true);
            assert.equal(input2.isDisposed(), true);
            assert.equal(input1.isDisposed(), false);
        });
        test('Stack - Multiple Editors - Editor Not Disposed after Closing when opening Modified side (Diff Editor)', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var input1 = input();
            var input2 = input();
            var diffInput = new diffEditorInput_1.DiffEditorInput('name', 'description', input1, input2);
            group1.openEditor(diffInput, { pinned: false, active: true });
            group1.openEditor(input1, { pinned: false, active: true });
            assert.equal(diffInput.isDisposed(), true);
            assert.equal(input2.isDisposed(), true);
            assert.equal(input1.isDisposed(), false);
        });
        test('Stack - Multiple Editors - Editor Disposed on Close (same input, files)', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            var input1 = input(void 0, void 0, uri_1.default.file('/hello/world.txt'));
            group1.openEditor(input1, { pinned: true, active: true });
            group2.openEditor(input1, { pinned: true, active: true });
            group2.closeEditor(input1);
            assert.equal(input1.isDisposed(), false);
            group1.closeEditor(input1);
            assert.equal(input1.isDisposed(), true);
        });
        test('Stack - Multiple Editors - Editor Disposed on Close (same input, files, diff)', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            var input1 = input(void 0, void 0, uri_1.default.file('/hello/world.txt'));
            var input2 = input(void 0, void 0, uri_1.default.file('/hello/world_other.txt'));
            var diffInput = new diffEditorInput_1.DiffEditorInput('name', 'description', input2, input1);
            group1.openEditor(input1, { pinned: true, active: true });
            group2.openEditor(diffInput, { pinned: true, active: true });
            group1.closeEditor(input1);
            assert.equal(input1.isDisposed(), false);
            assert.equal(input2.isDisposed(), false);
            assert.equal(diffInput.isDisposed(), false);
            group2.closeEditor(diffInput);
            assert.equal(input1.isDisposed(), true);
            assert.equal(input2.isDisposed(), true);
            assert.equal(diffInput.isDisposed(), true);
        });
        test('Stack - Multiple Editors - Editor Disposed on Close (same input, files, diff, close diff)', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            var input1 = input(void 0, void 0, uri_1.default.file('/hello/world.txt'));
            var input2 = input(void 0, void 0, uri_1.default.file('/hello/world_other.txt'));
            var diffInput = new diffEditorInput_1.DiffEditorInput('name', 'description', input2, input1);
            group1.openEditor(input1, { pinned: true, active: true });
            group2.openEditor(diffInput, { pinned: true, active: true });
            group2.closeEditor(diffInput);
            assert.equal(input1.isDisposed(), false);
            assert.equal(input2.isDisposed(), true);
            assert.equal(diffInput.isDisposed(), true);
            group1.closeEditor(input1);
            assert.equal(input1.isDisposed(), true);
        });
        test('Stack - Multiple Editors - Editor Emits Dirty and Label Changed', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            var input1 = input();
            var input2 = input();
            group1.openEditor(input1, { pinned: true, active: true });
            group2.openEditor(input2, { pinned: true, active: true });
            var dirtyCounter = 0;
            model.onEditorDirty(function () {
                dirtyCounter++;
            });
            var labelChangeCounter = 0;
            model.onEditorLabelChange(function () {
                labelChangeCounter++;
            });
            input1.setDirty();
            input1.setLabel();
            assert.equal(dirtyCounter, 1);
            assert.equal(labelChangeCounter, 1);
            input2.setDirty();
            input2.setLabel();
            assert.equal(dirtyCounter, 2);
            assert.equal(labelChangeCounter, 2);
            group2.closeAllEditors();
            input2.setDirty();
            input2.setLabel();
            assert.equal(dirtyCounter, 2);
            assert.equal(labelChangeCounter, 2);
            model.closeGroups();
            input1.setDirty();
            input1.setLabel();
            assert.equal(dirtyCounter, 2);
            assert.equal(labelChangeCounter, 2);
        });
        test('Groups - Model change events (structural vs state)', function () {
            var model = create();
            var events = modelListener(model);
            var group1 = model.openGroup('first');
            assert.equal(events.changed[0].group, group1);
            assert.equal(events.changed[0].structural, true); // open group
            assert.equal(events.changed[1].group, group1);
            assert.ok(!events.changed[1].structural); // set active
            var input1 = input();
            group1.openEditor(input1, { pinned: true, active: true });
            assert.equal(events.changed[2].group, group1);
            assert.equal(events.changed[2].structural, true); // open editor
            assert.equal(events.changed[2].editor, input1);
            assert.equal(events.changed[3].group, group1);
            assert.ok(!events.changed[3].structural); // set active
            assert.equal(events.changed[3].editor, input1);
            group1.unpin(input1);
            assert.equal(events.changed[4].group, group1);
            assert.ok(!events.changed[4].structural); // unpin
            assert.equal(events.changed[4].editor, input1);
            group1.closeAllEditors();
            assert.equal(events.changed[5].group, group1);
            assert.ok(events.changed[5].structural); // close
            assert.equal(events.changed[5].editor, input1);
        });
        test('Preview tab does not have a stable position (https://github.com/Microsoft/vscode/issues/8245)', function () {
            var model = create();
            var group1 = model.openGroup('first');
            var input1 = input();
            var input2 = input();
            var input3 = input();
            group1.openEditor(input1, { pinned: true, active: true });
            group1.openEditor(input2, { active: true });
            group1.setActive(input1);
            group1.openEditor(input3, { active: true });
            assert.equal(group1.indexOf(input3), 1);
        });
        test('Stack - Multiple Editors - find group based on input', function () {
            var model = create();
            var group1 = model.openGroup('group1');
            var group2 = model.openGroup('group2');
            var g1_input1 = input();
            var g1_input2 = input();
            var g2_input1 = input();
            var g2_input2 = input();
            var unmatched_input = input();
            group1.openEditor(g1_input1, { active: true, pinned: true });
            group1.openEditor(g1_input2, { active: true, pinned: true });
            group2.openEditor(g2_input1, { active: true, pinned: true });
            group2.openEditor(g2_input2, { active: true, pinned: true });
            var found_group1 = model.findGroup(g1_input2, true);
            var notfound1 = model.findGroup(g1_input1, true);
            var found1_group2 = model.findGroup(g2_input1, false);
            var found2_group2 = model.findGroup(g2_input2, false);
            var notfound2 = model.findGroup(unmatched_input, false);
            var notfound3 = model.findGroup(unmatched_input, true);
            assert.equal(found_group1, group1);
            assert.equal(notfound1, null);
            assert.equal(found1_group2, group2);
            assert.equal(found2_group2, group2);
            assert.equal(notfound2, null);
            assert.equal(notfound3, null);
        });
    });
});
