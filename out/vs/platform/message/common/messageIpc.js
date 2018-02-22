/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/platform/message/common/message"], function (require, exports, winjs_base_1, message_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChoiceChannel = /** @class */ (function () {
        function ChoiceChannel(choiceService) {
            this.choiceService = choiceService;
        }
        ChoiceChannel.prototype.call = function (command, args) {
            switch (command) {
                case 'choose': return this.choiceService.choose(args[0], args[1], args[2], args[3], args[4]);
            }
            return winjs_base_1.TPromise.wrapError(new Error('invalid command'));
        };
        ChoiceChannel = __decorate([
            __param(0, message_1.IChoiceService)
        ], ChoiceChannel);
        return ChoiceChannel;
    }());
    exports.ChoiceChannel = ChoiceChannel;
    var ChoiceChannelClient = /** @class */ (function () {
        function ChoiceChannelClient(channel) {
            this.channel = channel;
        }
        ChoiceChannelClient.prototype.choose = function (severity, message, options, cancelId, modal) {
            return this.channel.call('choose', [severity, message, options, cancelId, modal]);
        };
        return ChoiceChannelClient;
    }());
    exports.ChoiceChannelClient = ChoiceChannelClient;
});
