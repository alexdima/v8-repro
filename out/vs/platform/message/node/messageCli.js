/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "readline", "vs/base/common/winjs.base"], function (require, exports, readline, winjs_base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChoiceCliService = /** @class */ (function () {
        function ChoiceCliService() {
        }
        ChoiceCliService.prototype.choose = function (severity, message, options, cancelId) {
            var _this = this;
            var promise = new winjs_base_1.TPromise(function (c, e) {
                var rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                    terminal: true
                });
                rl.prompt();
                rl.write(_this.toQuestion(message, options));
                rl.prompt();
                rl.once('line', function (answer) {
                    rl.close();
                    c(_this.toOption(answer, options));
                });
                rl.once('SIGINT', function () {
                    rl.close();
                    promise.cancel();
                });
            });
            return promise;
        };
        ChoiceCliService.prototype.toQuestion = function (message, options) {
            return options.reduce(function (previousValue, currentValue, currentIndex) {
                return previousValue + currentValue + '(' + currentIndex + ')' + (currentIndex < options.length - 1 ? ' | ' : '\n');
            }, message + ' ');
        };
        ChoiceCliService.prototype.toOption = function (answer, options) {
            var value = parseInt(answer);
            if (!isNaN(value)) {
                return value;
            }
            answer = answer.toLocaleLowerCase();
            for (var i = 0; i < options.length; i++) {
                if (options[i].toLocaleLowerCase() === answer) {
                    return i;
                }
            }
            return -1;
        };
        return ChoiceCliService;
    }());
    exports.ChoiceCliService = ChoiceCliService;
});
