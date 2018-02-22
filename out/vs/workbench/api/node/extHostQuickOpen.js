define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/async", "vs/base/common/cancellation", "./extHost.protocol"], function (require, exports, winjs_base_1, async_1, cancellation_1, extHost_protocol_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostQuickOpen = /** @class */ (function () {
        function ExtHostQuickOpen(mainContext, workspace, commands) {
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadQuickOpen);
            this._workspace = workspace;
            this._commands = commands;
        }
        ExtHostQuickOpen.prototype.showQuickPick = function (itemsOrItemsPromise, options, token) {
            var _this = this;
            if (token === void 0) { token = cancellation_1.CancellationToken.None; }
            // clear state from last invocation
            this._onDidSelectItem = undefined;
            var itemsPromise = winjs_base_1.TPromise.wrap(itemsOrItemsPromise);
            var quickPickWidget = this._proxy.$show({
                autoFocus: { autoFocusFirstEntry: true },
                placeHolder: options && options.placeHolder,
                matchOnDescription: options && options.matchOnDescription,
                matchOnDetail: options && options.matchOnDetail,
                ignoreFocusLost: options && options.ignoreFocusOut
            });
            var promise = winjs_base_1.TPromise.any([quickPickWidget, itemsPromise]).then(function (values) {
                if (values.key === '0') {
                    return undefined;
                }
                return itemsPromise.then(function (items) {
                    var pickItems = [];
                    for (var handle = 0; handle < items.length; handle++) {
                        var item = items[handle];
                        var label = void 0;
                        var description = void 0;
                        var detail = void 0;
                        if (typeof item === 'string') {
                            label = item;
                        }
                        else {
                            label = item.label;
                            description = item.description;
                            detail = item.detail;
                        }
                        pickItems.push({
                            label: label,
                            description: description,
                            handle: handle,
                            detail: detail
                        });
                    }
                    // handle selection changes
                    if (options && typeof options.onDidSelectItem === 'function') {
                        _this._onDidSelectItem = function (handle) {
                            options.onDidSelectItem(items[handle]);
                        };
                    }
                    // show items
                    _this._proxy.$setItems(pickItems);
                    return quickPickWidget.then(function (handle) {
                        if (typeof handle === 'number') {
                            return items[handle];
                        }
                        return undefined;
                    });
                }, function (err) {
                    _this._proxy.$setError(err);
                    return winjs_base_1.TPromise.wrapError(err);
                });
            });
            return async_1.wireCancellationToken(token, promise, true);
        };
        ExtHostQuickOpen.prototype.$onItemSelected = function (handle) {
            if (this._onDidSelectItem) {
                this._onDidSelectItem(handle);
            }
        };
        // ---- input
        ExtHostQuickOpen.prototype.showInput = function (options, token) {
            if (token === void 0) { token = cancellation_1.CancellationToken.None; }
            // global validate fn used in callback below
            this._validateInput = options && options.validateInput;
            var promise = this._proxy.$input(options, typeof this._validateInput === 'function');
            return async_1.wireCancellationToken(token, promise, true);
        };
        ExtHostQuickOpen.prototype.$validateInput = function (input) {
            var _this = this;
            if (this._validateInput) {
                return async_1.asWinJsPromise(function (_) { return _this._validateInput(input); });
            }
            return undefined;
        };
        // ---- workspace folder picker
        ExtHostQuickOpen.prototype.showWorkspaceFolderPick = function (options, token) {
            var _this = this;
            if (token === void 0) { token = cancellation_1.CancellationToken.None; }
            return this._commands.executeCommand('_workbench.pickWorkspaceFolder', [options]).then(function (selectedFolder) {
                if (!selectedFolder) {
                    return undefined;
                }
                return _this._workspace.getWorkspaceFolders().filter(function (folder) { return folder.uri.toString() === selectedFolder.uri.toString(); })[0];
            });
        };
        return ExtHostQuickOpen;
    }());
    exports.ExtHostQuickOpen = ExtHostQuickOpen;
});
