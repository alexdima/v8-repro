/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/electron-browser/mainThreadMessageService", "vs/base/common/winjs.base"], function (require, exports, assert, mainThreadMessageService_1, winjs_base_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var emptyChoiceService = new /** @class */ (function () {
        function class_1() {
        }
        class_1.prototype.choose = function (severity, message, options, modal) {
            throw new Error('not implemented');
        };
        return class_1;
    }());
    var emptyMesssageService = new /** @class */ (function () {
        function class_2() {
        }
        class_2.prototype.show = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            throw new Error('not implemented');
        };
        class_2.prototype.hideAll = function () {
            throw new Error('not implemented.');
        };
        class_2.prototype.confirm = function (confirmation) {
            throw new Error('not implemented.');
        };
        class_2.prototype.confirmWithCheckbox = function (confirmation) {
            throw new Error('not implemented.');
        };
        return class_2;
    }());
    suite('ExtHostMessageService', function () {
        test('propagte handle on select', function () {
            var service = new mainThreadMessageService_1.MainThreadMessageService(null, {
                show: function (sev, m) {
                    assert.equal(m.actions.length, 1);
                    setImmediate(function () { return m.actions[0].run(); });
                    return function () { };
                }
            }, emptyChoiceService);
            return service.$showMessage(1, 'h', {}, [{ handle: 42, title: 'a thing', isCloseAffordance: true }]).then(function (handle) {
                assert.equal(handle, 42);
            });
        });
        test('isCloseAffordance', function () {
            var actions;
            var service = new mainThreadMessageService_1.MainThreadMessageService(null, {
                show: function (sev, m) {
                    actions = m.actions;
                }
            }, emptyChoiceService);
            // default close action
            service.$showMessage(1, '', {}, [{ title: 'a thing', isCloseAffordance: false, handle: 0 }]);
            assert.equal(actions.length, 2);
            var first = actions[0], second = actions[1];
            assert.equal(first.label, 'a thing');
            assert.equal(second.label, 'Close');
            // override close action
            service.$showMessage(1, '', {}, [{ title: 'a thing', isCloseAffordance: true, handle: 0 }]);
            assert.equal(actions.length, 1);
            first = actions[0];
            assert.equal(first.label, 'a thing');
        });
        test('hide on select', function () {
            var actions;
            var c;
            var service = new mainThreadMessageService_1.MainThreadMessageService(null, {
                show: function (sev, m) {
                    c = 0;
                    actions = m.actions;
                    return function () {
                        c += 1;
                    };
                }
            }, emptyChoiceService);
            service.$showMessage(1, '', {}, [{ title: 'a thing', isCloseAffordance: true, handle: 0 }]);
            assert.equal(actions.length, 1);
            actions[0].run();
            assert.equal(c, 1);
        });
        suite('modal', function () {
            test('calls choice service', function () {
                var service = new mainThreadMessageService_1.MainThreadMessageService(null, emptyMesssageService, {
                    choose: function (severity, message, options, modal) {
                        assert.equal(severity, 1);
                        assert.equal(message, 'h');
                        assert.equal(options.length, 2);
                        assert.equal(options[1], 'Cancel');
                        return winjs_base_1.TPromise.as(0);
                    }
                });
                return service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: false }]).then(function (handle) {
                    assert.equal(handle, 42);
                });
            });
            test('returns undefined when cancelled', function () {
                var service = new mainThreadMessageService_1.MainThreadMessageService(null, emptyMesssageService, {
                    choose: function (severity, message, options, modal) {
                        return winjs_base_1.TPromise.as(1);
                    }
                });
                return service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: false }]).then(function (handle) {
                    assert.equal(handle, undefined);
                });
            });
            test('hides Cancel button when not needed', function () {
                var service = new mainThreadMessageService_1.MainThreadMessageService(null, emptyMesssageService, {
                    choose: function (severity, message, options, modal) {
                        assert.equal(options.length, 1);
                        return winjs_base_1.TPromise.as(0);
                    }
                });
                return service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: true }]).then(function (handle) {
                    assert.equal(handle, 42);
                });
            });
        });
    });
});
