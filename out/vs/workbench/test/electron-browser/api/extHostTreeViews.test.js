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
define(["require", "exports", "assert", "vs/base/common/event", "vs/workbench/api/node/extHostTreeViews", "vs/workbench/api/node/extHostCommands", "vs/workbench/api/node/extHost.protocol", "./testRPCProtocol", "vs/workbench/api/node/extHostHeapService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/api/electron-browser/mainThreadCommands", "vs/workbench/test/electron-browser/api/mock", "vs/base/common/winjs.base", "vs/workbench/common/views", "vs/platform/log/common/log"], function (require, exports, assert, event_1, extHostTreeViews_1, extHostCommands_1, extHost_protocol_1, testRPCProtocol_1, extHostHeapService_1, instantiationServiceMock_1, mainThreadCommands_1, mock_1, winjs_base_1, views_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTreeView', function () {
        var RecordingShape = /** @class */ (function (_super) {
            __extends(RecordingShape, _super);
            function RecordingShape() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.onRefresh = new event_1.Emitter();
                return _this;
            }
            RecordingShape.prototype.$registerTreeViewDataProvider = function (treeViewId) {
            };
            RecordingShape.prototype.$refresh = function (viewId, itemsToRefresh) {
                this.onRefresh.fire(itemsToRefresh);
            };
            return RecordingShape;
        }(mock_1.mock()));
        var testObject;
        var target;
        var onDidChangeTreeNode;
        var onDidChangeTreeNodeWithId;
        var tree, labels, nodes;
        setup(function () {
            tree = {
                'a': {
                    'aa': {},
                    'ab': {}
                },
                'b': {
                    'ba': {},
                    'bb': {}
                }
            };
            labels = {};
            nodes = {};
            var rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            // Use IInstantiationService to get typechecking when instantiating
            var inst;
            {
                var instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                inst = instantiationService;
            }
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadCommands, inst.createInstance(mainThreadCommands_1.MainThreadCommands, rpcProtocol));
            target = new RecordingShape();
            testObject = new extHostTreeViews_1.ExtHostTreeViews(target, new extHostCommands_1.ExtHostCommands(rpcProtocol, new extHostHeapService_1.ExtHostHeapService(), new log_1.NullLogService()));
            onDidChangeTreeNode = new event_1.Emitter();
            onDidChangeTreeNodeWithId = new event_1.Emitter();
            testObject.registerTreeDataProvider('testNodeTreeProvider', aNodeTreeDataProvider());
            testObject.registerTreeDataProvider('testNodeWithIdTreeProvider', aNodeWithIdTreeDataProvider());
            testObject.$getChildren('testNodeTreeProvider').then(function (elements) {
                for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                    var element = elements_1[_i];
                    testObject.$getChildren('testNodeTreeProvider', element.handle);
                }
            });
        });
        test('construct node tree', function () {
            return testObject.$getChildren('testNodeTreeProvider')
                .then(function (elements) {
                var actuals = elements.map(function (e) { return e.handle; });
                assert.deepEqual(actuals, ['0/0:a', '0/0:b']);
                return winjs_base_1.TPromise.join([
                    testObject.$getChildren('testNodeTreeProvider', '0/0:a')
                        .then(function (children) {
                        var actuals = children.map(function (e) { return e.handle; });
                        assert.deepEqual(actuals, ['0/0:a/0:aa', '0/0:a/0:ab']);
                        return winjs_base_1.TPromise.join([
                            testObject.$getChildren('testNodeTreeProvider', '0/0:a/0:aa').then(function (children) { return assert.equal(children.length, 0); }),
                            testObject.$getChildren('testNodeTreeProvider', '0/0:a/0:ab').then(function (children) { return assert.equal(children.length, 0); })
                        ]);
                    }),
                    testObject.$getChildren('testNodeTreeProvider', '0/0:b')
                        .then(function (children) {
                        var actuals = children.map(function (e) { return e.handle; });
                        assert.deepEqual(actuals, ['0/0:b/0:ba', '0/0:b/0:bb']);
                        return winjs_base_1.TPromise.join([
                            testObject.$getChildren('testNodeTreeProvider', '0/0:b/0:ba').then(function (children) { return assert.equal(children.length, 0); }),
                            testObject.$getChildren('testNodeTreeProvider', '0/0:b/0:bb').then(function (children) { return assert.equal(children.length, 0); })
                        ]);
                    })
                ]);
            });
        });
        test('construct id tree', function () {
            return testObject.$getChildren('testNodeWithIdTreeProvider')
                .then(function (elements) {
                var actuals = elements.map(function (e) { return e.handle; });
                assert.deepEqual(actuals, ['1/a', '1/b']);
                return winjs_base_1.TPromise.join([
                    testObject.$getChildren('testNodeWithIdTreeProvider', '1/a')
                        .then(function (children) {
                        var actuals = children.map(function (e) { return e.handle; });
                        assert.deepEqual(actuals, ['1/aa', '1/ab']);
                        return winjs_base_1.TPromise.join([
                            testObject.$getChildren('testNodeWithIdTreeProvider', '1/aa').then(function (children) { return assert.equal(children.length, 0); }),
                            testObject.$getChildren('testNodeWithIdTreeProvider', '1/ab').then(function (children) { return assert.equal(children.length, 0); })
                        ]);
                    }),
                    testObject.$getChildren('testNodeWithIdTreeProvider', '1/b')
                        .then(function (children) {
                        var actuals = children.map(function (e) { return e.handle; });
                        assert.deepEqual(actuals, ['1/ba', '1/bb']);
                        return winjs_base_1.TPromise.join([
                            testObject.$getChildren('testNodeWithIdTreeProvider', '1/ba').then(function (children) { return assert.equal(children.length, 0); }),
                            testObject.$getChildren('testNodeWithIdTreeProvider', '1/bb').then(function (children) { return assert.equal(children.length, 0); })
                        ]);
                    })
                ]);
            });
        });
        test('error is thrown if id is not unique', function () {
            tree['a'] = {
                'a': {}
            };
            return testObject.$getChildren('testNodeWithIdTreeProvider')
                .then(function (elements) {
                var actuals = elements.map(function (e) { return e.handle; });
                assert.deepEqual(actuals, ['1/a', '1/b']);
                return testObject.$getChildren('testNodeWithIdTreeProvider', '1/a')
                    .then(function (children) { return assert.fail('Should fail with duplicate id'); }, function () { return null; });
            });
        });
        test('refresh root', function (done) {
            target.onRefresh.event(function (actuals) {
                assert.equal(undefined, actuals);
                done();
            });
            onDidChangeTreeNode.fire();
        });
        test('refresh a parent node', function () {
            return new winjs_base_1.TPromise(function (c, e) {
                target.onRefresh.event(function (actuals) {
                    assert.deepEqual(['0/0:b'], Object.keys(actuals));
                    assert.deepEqual(removeUnsetKeys(actuals['0/0:b']), {
                        handle: '0/0:b',
                        label: 'b',
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                    });
                    c(null);
                });
                onDidChangeTreeNode.fire(getNode('b'));
            });
        });
        test('refresh a leaf node', function (done) {
            target.onRefresh.event(function (actuals) {
                assert.deepEqual(['0/0:b/0:bb'], Object.keys(actuals));
                assert.deepEqual(removeUnsetKeys(actuals['0/0:b/0:bb']), {
                    handle: '0/0:b/0:bb',
                    parentHandle: '0/0:b',
                    label: 'bb',
                    collapsibleState: views_1.TreeItemCollapsibleState.None
                });
                done();
            });
            onDidChangeTreeNode.fire(getNode('bb'));
        });
        test('refresh parent and child node trigger refresh only on parent - scenario 1', function (done) {
            target.onRefresh.event(function (actuals) {
                assert.deepEqual(['0/0:b', '0/0:a/0:aa'], Object.keys(actuals));
                assert.deepEqual(removeUnsetKeys(actuals['0/0:b']), {
                    handle: '0/0:b',
                    label: 'b',
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                });
                assert.deepEqual(removeUnsetKeys(actuals['0/0:a/0:aa']), {
                    handle: '0/0:a/0:aa',
                    parentHandle: '0/0:a',
                    label: 'aa',
                    collapsibleState: views_1.TreeItemCollapsibleState.None
                });
                done();
            });
            onDidChangeTreeNode.fire(getNode('b'));
            onDidChangeTreeNode.fire(getNode('aa'));
            onDidChangeTreeNode.fire(getNode('bb'));
        });
        test('refresh parent and child node trigger refresh only on parent - scenario 2', function (done) {
            target.onRefresh.event(function (actuals) {
                assert.deepEqual(['0/0:a/0:aa', '0/0:b'], Object.keys(actuals));
                assert.deepEqual(removeUnsetKeys(actuals['0/0:b']), {
                    handle: '0/0:b',
                    label: 'b',
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                });
                assert.deepEqual(removeUnsetKeys(actuals['0/0:a/0:aa']), {
                    handle: '0/0:a/0:aa',
                    parentHandle: '0/0:a',
                    label: 'aa',
                    collapsibleState: views_1.TreeItemCollapsibleState.None
                });
                done();
            });
            onDidChangeTreeNode.fire(getNode('bb'));
            onDidChangeTreeNode.fire(getNode('aa'));
            onDidChangeTreeNode.fire(getNode('b'));
        });
        test('refresh an element for label change', function (done) {
            labels['a'] = 'aa';
            target.onRefresh.event(function (actuals) {
                assert.deepEqual(['0/0:a'], Object.keys(actuals));
                assert.deepEqual(removeUnsetKeys(actuals['0/0:a']), {
                    handle: '0/0:aa',
                    label: 'aa',
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                });
                done();
            });
            onDidChangeTreeNode.fire(getNode('a'));
        });
        test('refresh calls are throttled on roots', function (done) {
            target.onRefresh.event(function (actuals) {
                assert.equal(undefined, actuals);
                done();
            });
            onDidChangeTreeNode.fire();
            onDidChangeTreeNode.fire();
            onDidChangeTreeNode.fire();
            onDidChangeTreeNode.fire();
        });
        test('refresh calls are throttled on elements', function (done) {
            target.onRefresh.event(function (actuals) {
                assert.deepEqual(['0/0:a', '0/0:b'], Object.keys(actuals));
                done();
            });
            onDidChangeTreeNode.fire(getNode('a'));
            onDidChangeTreeNode.fire(getNode('b'));
            onDidChangeTreeNode.fire(getNode('b'));
            onDidChangeTreeNode.fire(getNode('a'));
        });
        test('refresh calls are throttled on unknown elements', function (done) {
            target.onRefresh.event(function (actuals) {
                assert.deepEqual(['0/0:a', '0/0:b'], Object.keys(actuals));
                done();
            });
            onDidChangeTreeNode.fire(getNode('a'));
            onDidChangeTreeNode.fire(getNode('b'));
            onDidChangeTreeNode.fire(getNode('g'));
            onDidChangeTreeNode.fire(getNode('a'));
        });
        test('refresh calls are throttled on unknown elements and root', function (done) {
            target.onRefresh.event(function (actuals) {
                assert.equal(undefined, actuals);
                done();
            });
            onDidChangeTreeNode.fire(getNode('a'));
            onDidChangeTreeNode.fire(getNode('b'));
            onDidChangeTreeNode.fire(getNode('g'));
            onDidChangeTreeNode.fire();
        });
        test('refresh calls are throttled on elements and root', function (done) {
            target.onRefresh.event(function (actuals) {
                assert.equal(undefined, actuals);
                done();
            });
            onDidChangeTreeNode.fire(getNode('a'));
            onDidChangeTreeNode.fire(getNode('b'));
            onDidChangeTreeNode.fire();
            onDidChangeTreeNode.fire(getNode('a'));
        });
        test('generate unique handles from labels by escaping them', function () {
            tree = {
                'a/0:b': {}
            };
            onDidChangeTreeNode.fire();
            return testObject.$getChildren('testNodeTreeProvider')
                .then(function (elements) {
                assert.deepEqual(elements.map(function (e) { return e.handle; }), ['0/0:a//0:b']);
            });
        });
        test('tree with duplicate labels', function () {
            var dupItems = {
                'adup1': 'c',
                'adup2': 'g',
                'bdup1': 'e',
                'hdup1': 'i',
                'hdup2': 'l',
                'jdup1': 'k'
            };
            labels['c'] = 'a';
            labels['e'] = 'b';
            labels['g'] = 'a';
            labels['i'] = 'h';
            labels['l'] = 'h';
            labels['k'] = 'j';
            tree[dupItems['adup1']] = {};
            tree['d'] = {};
            var bdup1Tree = {};
            bdup1Tree['h'] = {};
            bdup1Tree[dupItems['hdup1']] = {};
            bdup1Tree['j'] = {};
            bdup1Tree[dupItems['jdup1']] = {};
            bdup1Tree[dupItems['hdup2']] = {};
            tree[dupItems['bdup1']] = bdup1Tree;
            tree['f'] = {};
            tree[dupItems['adup2']] = {};
            return testObject.$getChildren('testNodeTreeProvider')
                .then(function (elements) {
                var actuals = elements.map(function (e) { return e.handle; });
                assert.deepEqual(actuals, ['0/0:a', '0/0:b', '0/1:a', '0/0:d', '0/1:b', '0/0:f', '0/2:a']);
                return testObject.$getChildren('testNodeTreeProvider', '0/1:b')
                    .then(function (elements) {
                    var actuals = elements.map(function (e) { return e.handle; });
                    assert.deepEqual(actuals, ['0/1:b/0:h', '0/1:b/1:h', '0/1:b/0:j', '0/1:b/1:j', '0/1:b/2:h']);
                });
            });
        });
        function removeUnsetKeys(obj) {
            var result = {};
            for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
                var key = _a[_i];
                if (obj[key] !== void 0) {
                    result[key] = obj[key];
                }
            }
            return result;
        }
        function aNodeTreeDataProvider() {
            return {
                getChildren: function (element) {
                    return getChildren(element ? element.key : undefined).map(function (key) { return getNode(key); });
                },
                getTreeItem: function (element) {
                    return getTreeItem(element.key);
                },
                onDidChangeTreeData: onDidChangeTreeNode.event
            };
        }
        function aNodeWithIdTreeDataProvider() {
            return {
                getChildren: function (element) {
                    return getChildren(element ? element.key : undefined).map(function (key) { return getNode(key); });
                },
                getTreeItem: function (element) {
                    var treeItem = getTreeItem(element.key);
                    treeItem.id = element.key;
                    return treeItem;
                },
                onDidChangeTreeData: onDidChangeTreeNodeWithId.event
            };
        }
        function getTreeElement(element) {
            var parent = tree;
            for (var i = 0; i < element.length; i++) {
                parent = parent[element.substring(0, i + 1)];
                if (!parent) {
                    return null;
                }
            }
            return parent;
        }
        function getChildren(key) {
            if (!key) {
                return Object.keys(tree);
            }
            var treeElement = getTreeElement(key);
            if (treeElement) {
                return Object.keys(treeElement);
            }
            return [];
        }
        function getTreeItem(key) {
            var treeElement = getTreeElement(key);
            return {
                label: labels[key] || key,
                collapsibleState: treeElement && Object.keys(treeElement).length ? views_1.TreeItemCollapsibleState.Collapsed : views_1.TreeItemCollapsibleState.None
            };
        }
        function getNode(key) {
            if (!nodes[key]) {
                nodes[key] = { key: key };
            }
            return nodes[key];
        }
    });
});
