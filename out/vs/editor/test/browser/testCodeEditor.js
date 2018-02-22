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
define(["require", "exports", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/instantiationService", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/editor/common/commonCodeEditor", "vs/editor/common/model/textModel", "vs/editor/test/common/mocks/testConfiguration", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/base/common/winjs.base", "vs/base/common/errors"], function (require, exports, serviceCollection_1, instantiationService_1, contextkey_1, mockKeybindingService_1, commonCodeEditor_1, textModel_1, testConfiguration_1, event_1, editorExtensions_1, winjs_base_1, errors_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestCodeEditor = /** @class */ (function (_super) {
        __extends(TestCodeEditor, _super);
        function TestCodeEditor() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._onMouseUp = _this._register(new event_1.Emitter());
            _this.onMouseUp = _this._onMouseUp.event;
            _this._onMouseDown = _this._register(new event_1.Emitter());
            _this.onMouseDown = _this._onMouseDown.event;
            _this._onMouseDrag = _this._register(new event_1.Emitter());
            _this.onMouseDrag = _this._onMouseDrag.event;
            _this._onMouseDrop = _this._register(new event_1.Emitter());
            _this.onMouseDrop = _this._onMouseDrop.event;
            _this._onContextMenu = _this._register(new event_1.Emitter());
            _this.onContextMenu = _this._onContextMenu.event;
            _this._onMouseMove = _this._register(new event_1.Emitter());
            _this.onMouseMove = _this._onMouseMove.event;
            _this._onMouseLeave = _this._register(new event_1.Emitter());
            _this.onMouseLeave = _this._onMouseLeave.event;
            _this._onKeyUp = _this._register(new event_1.Emitter());
            _this.onKeyUp = _this._onKeyUp.event;
            _this._onKeyDown = _this._register(new event_1.Emitter());
            _this.onKeyDown = _this._onKeyDown.event;
            _this._onDidScrollChange = _this._register(new event_1.Emitter());
            _this.onDidScrollChange = _this._onDidScrollChange.event;
            _this._onDidChangeViewZones = _this._register(new event_1.Emitter());
            _this.onDidChangeViewZones = _this._onDidChangeViewZones.event;
            _this._isFocused = true;
            return _this;
            //#endregion ICodeEditor
        }
        TestCodeEditor.prototype._createConfiguration = function (options) {
            return new testConfiguration_1.TestConfiguration(options);
        };
        TestCodeEditor.prototype.layout = function (dimension) { };
        TestCodeEditor.prototype.focus = function () { };
        TestCodeEditor.prototype.isFocused = function () { return this._isFocused; };
        TestCodeEditor.prototype.hasWidgetFocus = function () { return true; };
        TestCodeEditor.prototype._enableEmptySelectionClipboard = function () { return false; };
        TestCodeEditor.prototype._scheduleAtNextAnimationFrame = function (callback) { throw new Error('Notimplemented'); };
        TestCodeEditor.prototype._createView = function () { };
        TestCodeEditor.prototype._registerDecorationType = function (key, options, parentTypeKey) { throw new Error('NotImplemented'); };
        TestCodeEditor.prototype._removeDecorationType = function (key) { throw new Error('NotImplemented'); };
        TestCodeEditor.prototype._resolveDecorationOptions = function (typeKey, writable) { throw new Error('NotImplemented'); };
        // --- test utils
        TestCodeEditor.prototype.getCursor = function () {
            return this.cursor;
        };
        TestCodeEditor.prototype.registerAndInstantiateContribution = function (ctor) {
            var r = this._instantiationService.createInstance(ctor, this);
            this._contributions[r.getId()] = r;
            return r;
        };
        TestCodeEditor.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.model) {
                this.model.dispose();
            }
            this._contextKeyService.dispose();
        };
        TestCodeEditor.prototype._triggerEditorCommand = function (source, handlerId, payload) {
            var command = editorExtensions_1.EditorExtensionsRegistry.getEditorCommand(handlerId);
            if (command) {
                payload = payload || {};
                payload.source = source;
                winjs_base_1.TPromise.as(command.runEditorCommand(null, this, payload)).done(null, errors_1.onUnexpectedError);
                return true;
            }
            return false;
        };
        //#region ICodeEditor
        TestCodeEditor.prototype.getDomNode = function () { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.addContentWidget = function (widget) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.layoutContentWidget = function (widget) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.removeContentWidget = function (widget) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.addOverlayWidget = function (widget) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.layoutOverlayWidget = function (widget) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.removeOverlayWidget = function (widget) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.changeViewZones = function (callback) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.getOffsetForColumn = function (lineNumber, column) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.render = function () { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.getTargetAtClientPoint = function (clientX, clientY) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.getScrolledVisiblePosition = function (position) { throw new Error('Not implemented'); };
        TestCodeEditor.prototype.applyFontInfo = function (target) { throw new Error('Not implemented'); };
        return TestCodeEditor;
    }(commonCodeEditor_1.CommonCodeEditor));
    exports.TestCodeEditor = TestCodeEditor;
    var MockScopeLocation = /** @class */ (function () {
        function MockScopeLocation() {
            this.parentElement = null;
        }
        MockScopeLocation.prototype.setAttribute = function (attr, value) { };
        MockScopeLocation.prototype.removeAttribute = function (attr) { };
        MockScopeLocation.prototype.hasAttribute = function (attr) { return false; };
        MockScopeLocation.prototype.getAttribute = function (attr) { return undefined; };
        return MockScopeLocation;
    }());
    exports.MockScopeLocation = MockScopeLocation;
    function withTestCodeEditor(text, options, callback) {
        // create a model if necessary and remember it in order to dispose it.
        var modelToDispose = null;
        if (!options.model) {
            modelToDispose = textModel_1.TextModel.createFromString(text.join('\n'));
            options.model = modelToDispose;
        }
        var editor = _createTestCodeEditor(options);
        callback(editor, editor.getCursor());
        if (modelToDispose) {
            modelToDispose.dispose();
        }
        editor.dispose();
    }
    exports.withTestCodeEditor = withTestCodeEditor;
    function createTestCodeEditor(model) {
        return _createTestCodeEditor({ model: model });
    }
    exports.createTestCodeEditor = createTestCodeEditor;
    function _createTestCodeEditor(options) {
        var contextKeyService = new mockKeybindingService_1.MockContextKeyService();
        var services = options.serviceCollection || new serviceCollection_1.ServiceCollection();
        services.set(contextkey_1.IContextKeyService, contextKeyService);
        var instantiationService = new instantiationService_1.InstantiationService(services);
        var editor = new TestCodeEditor(new MockScopeLocation(), options, instantiationService, contextKeyService);
        editor.setModel(options.model);
        return editor;
    }
});
