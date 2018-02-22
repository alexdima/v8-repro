define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/base/common/event"], function (require, exports, instantiation_1, platform, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IThemeService = instantiation_1.createDecorator('themeService');
    function themeColorFromId(id) {
        return { id: id };
    }
    exports.themeColorFromId = themeColorFromId;
    // base themes
    exports.DARK = 'dark';
    exports.LIGHT = 'light';
    exports.HIGH_CONTRAST = 'hc';
    function getThemeTypeSelector(type) {
        switch (type) {
            case exports.DARK: return 'vs-dark';
            case exports.HIGH_CONTRAST: return 'hc-black';
            default: return 'vs';
        }
    }
    exports.getThemeTypeSelector = getThemeTypeSelector;
    // static theming participant
    exports.Extensions = {
        ThemingContribution: 'base.contributions.theming'
    };
    var ThemingRegistry = /** @class */ (function () {
        function ThemingRegistry() {
            this.themingParticipants = [];
            this.themingParticipants = [];
            this.onThemingParticipantAddedEmitter = new event_1.Emitter();
        }
        ThemingRegistry.prototype.onThemeChange = function (participant) {
            var _this = this;
            this.themingParticipants.push(participant);
            this.onThemingParticipantAddedEmitter.fire(participant);
            return {
                dispose: function () {
                    var idx = _this.themingParticipants.indexOf(participant);
                    _this.themingParticipants.splice(idx, 1);
                }
            };
        };
        Object.defineProperty(ThemingRegistry.prototype, "onThemingParticipantAdded", {
            get: function () {
                return this.onThemingParticipantAddedEmitter.event;
            },
            enumerable: true,
            configurable: true
        });
        ThemingRegistry.prototype.getThemingParticipants = function () {
            return this.themingParticipants;
        };
        return ThemingRegistry;
    }());
    var themingRegistry = new ThemingRegistry();
    platform.Registry.add(exports.Extensions.ThemingContribution, themingRegistry);
    function registerThemingParticipant(participant) {
        return themingRegistry.onThemeChange(participant);
    }
    exports.registerThemingParticipant = registerThemingParticipant;
});
