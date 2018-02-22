define(["require", "exports", "vs/base/common/errors", "vs/base/common/strings", "vs/editor/common/modes/languageConfiguration"], function (require, exports, errors_1, strings, languageConfiguration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var OnEnterSupport = /** @class */ (function () {
        function OnEnterSupport(opts) {
            opts = opts || {};
            opts.brackets = opts.brackets || [
                ['(', ')'],
                ['{', '}'],
                ['[', ']']
            ];
            this._brackets = opts.brackets.map(function (bracket) {
                return {
                    open: bracket[0],
                    openRegExp: OnEnterSupport._createOpenBracketRegExp(bracket[0]),
                    close: bracket[1],
                    closeRegExp: OnEnterSupport._createCloseBracketRegExp(bracket[1]),
                };
            });
            this._regExpRules = opts.regExpRules || [];
        }
        OnEnterSupport.prototype.onEnter = function (oneLineAboveText, beforeEnterText, afterEnterText) {
            // (1): `regExpRules`
            for (var i = 0, len = this._regExpRules.length; i < len; i++) {
                var rule = this._regExpRules[i];
                if (rule.beforeText.test(beforeEnterText)) {
                    if (rule.afterText) {
                        if (rule.afterText.test(afterEnterText)) {
                            return rule.action;
                        }
                    }
                    else {
                        return rule.action;
                    }
                }
            }
            // (2): Special indent-outdent
            if (beforeEnterText.length > 0 && afterEnterText.length > 0) {
                for (var i = 0, len = this._brackets.length; i < len; i++) {
                    var bracket = this._brackets[i];
                    if (bracket.openRegExp.test(beforeEnterText) && bracket.closeRegExp.test(afterEnterText)) {
                        return { indentAction: languageConfiguration_1.IndentAction.IndentOutdent };
                    }
                }
            }
            // (4): Open bracket based logic
            if (beforeEnterText.length > 0) {
                for (var i = 0, len = this._brackets.length; i < len; i++) {
                    var bracket = this._brackets[i];
                    if (bracket.openRegExp.test(beforeEnterText)) {
                        return { indentAction: languageConfiguration_1.IndentAction.Indent };
                    }
                }
            }
            return null;
        };
        OnEnterSupport._createOpenBracketRegExp = function (bracket) {
            var str = strings.escapeRegExpCharacters(bracket);
            if (!/\B/.test(str.charAt(0))) {
                str = '\\b' + str;
            }
            str += '\\s*$';
            return OnEnterSupport._safeRegExp(str);
        };
        OnEnterSupport._createCloseBracketRegExp = function (bracket) {
            var str = strings.escapeRegExpCharacters(bracket);
            if (!/\B/.test(str.charAt(str.length - 1))) {
                str = str + '\\b';
            }
            str = '^\\s*' + str;
            return OnEnterSupport._safeRegExp(str);
        };
        OnEnterSupport._safeRegExp = function (def) {
            try {
                return new RegExp(def);
            }
            catch (err) {
                errors_1.onUnexpectedError(err);
                return null;
            }
        };
        return OnEnterSupport;
    }());
    exports.OnEnterSupport = OnEnterSupport;
});
