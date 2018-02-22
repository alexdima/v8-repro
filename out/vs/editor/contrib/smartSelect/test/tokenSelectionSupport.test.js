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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/editor/common/modes", "vs/editor/common/modes/languageConfiguration", "vs/editor/contrib/smartSelect/tokenSelectionSupport", "vs/editor/test/common/mocks/mockMode", "vs/editor/common/modes/languageConfigurationRegistry", "vs/editor/common/services/modelServiceImpl", "vs/platform/configuration/test/common/testConfigurationService"], function (require, exports, assert, uri_1, range_1, position_1, modes_1, languageConfiguration_1, tokenSelectionSupport_1, mockMode_1, languageConfigurationRegistry_1, modelServiceImpl_1, testConfigurationService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MockJSMode = /** @class */ (function (_super) {
        __extends(MockJSMode, _super);
        function MockJSMode() {
            var _this = _super.call(this, MockJSMode._id) || this;
            _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                brackets: [
                    ['(', ')'],
                    ['{', '}'],
                    ['[', ']']
                ],
                onEnterRules: [
                    {
                        // e.g. /** | */
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        afterText: /^\s*\*\/$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.IndentOutdent, appendText: ' * ' }
                    },
                    {
                        // e.g. /** ...|
                        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: ' * ' }
                    },
                    {
                        // e.g.  * ...|
                        beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: '* ' }
                    },
                    {
                        // e.g.  */|
                        beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
                    },
                    {
                        // e.g.  *-----*/|
                        beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
                        action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
                    }
                ]
            }));
            return _this;
        }
        MockJSMode._id = new modes_1.LanguageIdentifier('mockJSMode', 3);
        return MockJSMode;
    }(mockMode_1.MockMode));
    suite('TokenSelectionSupport', function () {
        var modelService = null;
        var tokenSelectionSupport;
        var mode = null;
        setup(function () {
            modelService = new modelServiceImpl_1.ModelServiceImpl(null, new testConfigurationService_1.TestConfigurationService());
            tokenSelectionSupport = new tokenSelectionSupport_1.TokenSelectionSupport(modelService);
            mode = new MockJSMode();
        });
        teardown(function () {
            modelService.dispose();
            mode.dispose();
        });
        function assertGetRangesToPosition(text, lineNumber, column, ranges) {
            var uri = uri_1.default.file('test.js');
            modelService.createModel(text.join('\n'), mode, uri);
            var actual = tokenSelectionSupport.getRangesToPositionSync(uri, new position_1.Position(lineNumber, column));
            var actualStr = actual.map(function (r) { return new range_1.Range(r.range.startLineNumber, r.range.startColumn, r.range.endLineNumber, r.range.endColumn).toString(); });
            var desiredStr = ranges.map(function (r) { return String(r); });
            assert.deepEqual(actualStr, desiredStr);
            modelService.destroyModel(uri);
        }
        test('getRangesToPosition #1', function () {
            assertGetRangesToPosition([
                'function a(bar, foo){',
                '\tif (bar) {',
                '\t\treturn (bar + (2 * foo))',
                '\t}',
                '}'
            ], 3, 20, [
                new range_1.Range(1, 1, 5, 2),
                new range_1.Range(1, 21, 5, 2),
                new range_1.Range(2, 1, 4, 3),
                new range_1.Range(2, 11, 4, 3),
                new range_1.Range(3, 1, 4, 2),
                new range_1.Range(3, 1, 3, 27),
                new range_1.Range(3, 10, 3, 27),
                new range_1.Range(3, 11, 3, 26),
                new range_1.Range(3, 17, 3, 26),
                new range_1.Range(3, 18, 3, 25),
            ]);
        });
    });
});
