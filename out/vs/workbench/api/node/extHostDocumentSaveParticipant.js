define(["require", "exports", "vs/base/common/uri", "vs/base/common/async", "vs/base/common/errors", "vs/workbench/api/node/extHostTypes", "vs/workbench/api/node/extHostTypeConverters", "vs/base/common/linkedList"], function (require, exports, uri_1, async_1, errors_1, extHostTypes_1, extHostTypeConverters_1, linkedList_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostDocumentSaveParticipant = /** @class */ (function () {
        function ExtHostDocumentSaveParticipant(_logService, _documents, _mainThreadEditors, _thresholds) {
            if (_thresholds === void 0) { _thresholds = { timeout: 1500, errors: 3 }; }
            this._logService = _logService;
            this._documents = _documents;
            this._mainThreadEditors = _mainThreadEditors;
            this._thresholds = _thresholds;
            this._callbacks = new linkedList_1.LinkedList();
            this._badListeners = new WeakMap();
            //
        }
        ExtHostDocumentSaveParticipant.prototype.dispose = function () {
            this._callbacks.clear();
        };
        ExtHostDocumentSaveParticipant.prototype.getOnWillSaveTextDocumentEvent = function (extension) {
            var _this = this;
            return function (listener, thisArg, disposables) {
                var remove = _this._callbacks.push([listener, thisArg, extension]);
                var result = { dispose: remove };
                if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
        };
        ExtHostDocumentSaveParticipant.prototype.$participateInSave = function (data, reason) {
            var _this = this;
            var resource = uri_1.default.revive(data);
            var entries = this._callbacks.toArray();
            var didTimeout = false;
            var didTimeoutHandle = setTimeout(function () { return didTimeout = true; }, this._thresholds.timeout);
            var promise = async_1.sequence(entries.map(function (listener) {
                return function () {
                    if (didTimeout) {
                        // timeout - no more listeners
                        return undefined;
                    }
                    var document = _this._documents.getDocumentData(resource).document;
                    return _this._deliverEventAsyncAndBlameBadListeners(listener, { document: document, reason: extHostTypeConverters_1.TextDocumentSaveReason.to(reason) });
                };
            }));
            return async_1.always(promise, function () { return clearTimeout(didTimeoutHandle); });
        };
        ExtHostDocumentSaveParticipant.prototype._deliverEventAsyncAndBlameBadListeners = function (_a, stubEvent) {
            var _this = this;
            var listener = _a[0], thisArg = _a[1], extension = _a[2];
            var errors = this._badListeners.get(listener);
            if (errors > this._thresholds.errors) {
                // bad listener - ignore
                return Promise.resolve(false);
            }
            return this._deliverEventAsync(listener, thisArg, stubEvent).then(function () {
                // don't send result across the wire
                return true;
            }, function (err) {
                _this._logService.error('[onWillSaveTextDocument]', extension.id);
                _this._logService.error(err);
                if (!(err instanceof Error) || err.message !== 'concurrent_edits') {
                    var errors_2 = _this._badListeners.get(listener);
                    _this._badListeners.set(listener, !errors_2 ? 1 : errors_2 + 1);
                    // todo@joh signal to the listener?
                    // if (errors === this._thresholds.errors) {
                    // 	console.warn('BAD onWillSaveTextDocumentEvent-listener is from now on being ignored');
                    // }
                }
                return false;
            });
        };
        ExtHostDocumentSaveParticipant.prototype._deliverEventAsync = function (listener, thisArg, stubEvent) {
            var _this = this;
            var promises = [];
            var document = stubEvent.document, reason = stubEvent.reason;
            var version = document.version;
            var event = Object.freeze({
                document: document,
                reason: reason,
                waitUntil: function (p) {
                    if (Object.isFrozen(promises)) {
                        throw errors_1.illegalState('waitUntil can not be called async');
                    }
                    promises.push(Promise.resolve(p));
                }
            });
            try {
                // fire event
                listener.apply(thisArg, [event]);
            }
            catch (err) {
                return Promise.reject(err);
            }
            // freeze promises after event call
            Object.freeze(promises);
            return new Promise(function (resolve, reject) {
                // join on all listener promises, reject after timeout
                var handle = setTimeout(function () { return reject(new Error('timeout')); }, _this._thresholds.timeout);
                return Promise.all(promises).then(function (edits) {
                    clearTimeout(handle);
                    resolve(edits);
                }).catch(function (err) {
                    clearTimeout(handle);
                    reject(err);
                });
            }).then(function (values) {
                var resourceEdit = {
                    resource: document.uri,
                    edits: []
                };
                for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                    var value = values_1[_i];
                    if (Array.isArray(value) && value.every(function (e) { return e instanceof extHostTypes_1.TextEdit; })) {
                        for (var _a = 0, value_1 = value; _a < value_1.length; _a++) {
                            var _b = value_1[_a], newText = _b.newText, newEol = _b.newEol, range = _b.range;
                            resourceEdit.edits.push({
                                range: range && extHostTypeConverters_1.fromRange(range),
                                text: newText,
                                eol: extHostTypeConverters_1.EndOfLine.from(newEol)
                            });
                        }
                    }
                }
                // apply edits if any and if document
                // didn't change somehow in the meantime
                if (resourceEdit.edits.length === 0) {
                    return undefined;
                }
                if (version === document.version) {
                    return _this._mainThreadEditors.$tryApplyWorkspaceEdit({ edits: [resourceEdit] });
                }
                // TODO@joh bubble this to listener?
                return Promise.reject(new Error('concurrent_edits'));
            });
        };
        return ExtHostDocumentSaveParticipant;
    }());
    exports.ExtHostDocumentSaveParticipant = ExtHostDocumentSaveParticipant;
});
