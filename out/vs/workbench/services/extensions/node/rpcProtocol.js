define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/workbench/services/extensions/node/lazyPromise"], function (require, exports, winjs_base_1, errors, lazyPromise_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var RPCProtocol = /** @class */ (function () {
        function RPCProtocol(protocol) {
            var _this = this;
            this._isDisposed = false;
            this._locals = Object.create(null);
            this._proxies = Object.create(null);
            this._lastMessageId = 0;
            this._invokedHandlers = Object.create(null);
            this._pendingRPCReplies = {};
            this._multiplexor = new RPCMultiplexer(protocol, function (msg) { return _this._receiveOneMessage(msg); });
        }
        RPCProtocol.prototype.dispose = function () {
            var _this = this;
            this._isDisposed = true;
            // Release all outstanding promises with a canceled error
            Object.keys(this._pendingRPCReplies).forEach(function (msgId) {
                var pending = _this._pendingRPCReplies[msgId];
                pending.resolveErr(errors.canceled());
            });
        };
        RPCProtocol.prototype.getProxy = function (identifier) {
            if (!this._proxies[identifier.id]) {
                this._proxies[identifier.id] = this._createProxy(identifier.id);
            }
            return this._proxies[identifier.id];
        };
        RPCProtocol.prototype._createProxy = function (proxyId) {
            var _this = this;
            var handler = {
                get: function (target, name) {
                    if (!target[name] && name.charCodeAt(0) === 36 /* DollarSign */) {
                        target[name] = function () {
                            var myArgs = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                myArgs[_i] = arguments[_i];
                            }
                            return _this._remoteCall(proxyId, name, myArgs);
                        };
                    }
                    return target[name];
                }
            };
            return new Proxy(Object.create(null), handler);
        };
        RPCProtocol.prototype.set = function (identifier, value) {
            this._locals[identifier.id] = value;
            return value;
        };
        RPCProtocol.prototype.assertRegistered = function (identifiers) {
            for (var i = 0, len = identifiers.length; i < len; i++) {
                var identifier = identifiers[i];
                if (!this._locals[identifier.id]) {
                    throw new Error("Missing actor " + identifier.id + " (isMain: " + identifier.isMain + ")");
                }
            }
        };
        RPCProtocol.prototype._receiveOneMessage = function (rawmsg) {
            if (this._isDisposed) {
                return;
            }
            var msg = JSON.parse(rawmsg);
            switch (msg.type) {
                case 1 /* Request */:
                    this._receiveRequest(msg);
                    break;
                case 2 /* Cancel */:
                    this._receiveCancel(msg);
                    break;
                case 3 /* Reply */:
                    this._receiveReply(msg);
                    break;
                case 4 /* ReplyErr */:
                    this._receiveReplyErr(msg);
                    break;
            }
        };
        RPCProtocol.prototype._receiveRequest = function (msg) {
            var _this = this;
            var callId = msg.id;
            var proxyId = msg.proxyId;
            this._invokedHandlers[callId] = this._invokeHandler(proxyId, msg.method, msg.args);
            this._invokedHandlers[callId].then(function (r) {
                delete _this._invokedHandlers[callId];
                _this._multiplexor.send(MessageFactory.replyOK(callId, r));
            }, function (err) {
                delete _this._invokedHandlers[callId];
                _this._multiplexor.send(MessageFactory.replyErr(callId, err));
            });
        };
        RPCProtocol.prototype._receiveCancel = function (msg) {
            var callId = msg.id;
            if (this._invokedHandlers[callId]) {
                this._invokedHandlers[callId].cancel();
            }
        };
        RPCProtocol.prototype._receiveReply = function (msg) {
            var callId = msg.id;
            if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
                return;
            }
            var pendingReply = this._pendingRPCReplies[callId];
            delete this._pendingRPCReplies[callId];
            pendingReply.resolveOk(msg.res);
        };
        RPCProtocol.prototype._receiveReplyErr = function (msg) {
            var callId = msg.id;
            if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
                return;
            }
            var pendingReply = this._pendingRPCReplies[callId];
            delete this._pendingRPCReplies[callId];
            var err = null;
            if (msg.err && msg.err.$isError) {
                err = new Error();
                err.name = msg.err.name;
                err.message = msg.err.message;
                err.stack = msg.err.stack;
            }
            pendingReply.resolveErr(err);
        };
        RPCProtocol.prototype._invokeHandler = function (proxyId, methodName, args) {
            try {
                return winjs_base_1.TPromise.as(this._doInvokeHandler(proxyId, methodName, args));
            }
            catch (err) {
                return winjs_base_1.TPromise.wrapError(err);
            }
        };
        RPCProtocol.prototype._doInvokeHandler = function (proxyId, methodName, args) {
            if (!this._locals[proxyId]) {
                throw new Error('Unknown actor ' + proxyId);
            }
            var actor = this._locals[proxyId];
            var method = actor[methodName];
            if (typeof method !== 'function') {
                throw new Error('Unknown method ' + methodName + ' on actor ' + proxyId);
            }
            return method.apply(actor, args);
        };
        RPCProtocol.prototype._remoteCall = function (proxyId, methodName, args) {
            var _this = this;
            if (this._isDisposed) {
                return winjs_base_1.TPromise.wrapError(errors.canceled());
            }
            var callId = String(++this._lastMessageId);
            var result = new lazyPromise_1.LazyPromise(function () {
                _this._multiplexor.send(MessageFactory.cancel(callId));
            });
            this._pendingRPCReplies[callId] = result;
            this._multiplexor.send(MessageFactory.request(callId, proxyId, methodName, args));
            return result;
        };
        return RPCProtocol;
    }());
    exports.RPCProtocol = RPCProtocol;
    /**
     * Sends/Receives multiple messages in one go:
     *  - multiple messages to be sent from one stack get sent in bulk at `process.nextTick`.
     *  - each incoming message is handled in a separate `process.nextTick`.
     */
    var RPCMultiplexer = /** @class */ (function () {
        function RPCMultiplexer(protocol, onMessage) {
            this._protocol = protocol;
            this._sendAccumulatedBound = this._sendAccumulated.bind(this);
            this._messagesToSend = [];
            this._protocol.onMessage(function (data) {
                for (var i = 0, len = data.length; i < len; i++) {
                    onMessage(data[i]);
                }
            });
        }
        RPCMultiplexer.prototype._sendAccumulated = function () {
            var tmp = this._messagesToSend;
            this._messagesToSend = [];
            this._protocol.send(tmp);
        };
        RPCMultiplexer.prototype.send = function (msg) {
            if (this._messagesToSend.length === 0) {
                process.nextTick(this._sendAccumulatedBound);
            }
            this._messagesToSend.push(msg);
        };
        return RPCMultiplexer;
    }());
    var MessageFactory = /** @class */ (function () {
        function MessageFactory() {
        }
        MessageFactory.cancel = function (req) {
            return "{\"type\":" + 2 /* Cancel */ + ",\"id\":\"" + req + "\"}";
        };
        MessageFactory.request = function (req, rpcId, method, args) {
            return "{\"type\":" + 1 /* Request */ + ",\"id\":\"" + req + "\",\"proxyId\":\"" + rpcId + "\",\"method\":\"" + method + "\",\"args\":" + JSON.stringify(args) + "}";
        };
        MessageFactory.replyOK = function (req, res) {
            if (typeof res === 'undefined') {
                return "{\"type\":" + 3 /* Reply */ + ",\"id\":\"" + req + "\"}";
            }
            return "{\"type\":" + 3 /* Reply */ + ",\"id\":\"" + req + "\",\"res\":" + JSON.stringify(res) + "}";
        };
        MessageFactory.replyErr = function (req, err) {
            if (err instanceof Error) {
                return "{\"type\":" + 4 /* ReplyErr */ + ",\"id\":\"" + req + "\",\"err\":" + JSON.stringify(errors.transformErrorForSerialization(err)) + "}";
            }
            return "{\"type\":" + 4 /* ReplyErr */ + ",\"id\":\"" + req + "\",\"err\":null}";
        };
        return MessageFactory;
    }());
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["Request"] = 1] = "Request";
        MessageType[MessageType["Cancel"] = 2] = "Cancel";
        MessageType[MessageType["Reply"] = 3] = "Reply";
        MessageType[MessageType["ReplyErr"] = 4] = "ReplyErr";
    })(MessageType || (MessageType = {}));
    var RequestMessage = /** @class */ (function () {
        function RequestMessage() {
        }
        return RequestMessage;
    }());
    var CancelMessage = /** @class */ (function () {
        function CancelMessage() {
        }
        return CancelMessage;
    }());
    var ReplyMessage = /** @class */ (function () {
        function ReplyMessage() {
        }
        return ReplyMessage;
    }());
    var ReplyErrMessage = /** @class */ (function () {
        function ReplyErrMessage() {
        }
        return ReplyErrMessage;
    }());
});
