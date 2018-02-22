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
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var BaseBadge = /** @class */ (function () {
        function BaseBadge(descriptorFn) {
            this.descriptorFn = descriptorFn;
        }
        BaseBadge.prototype.getDescription = function () {
            return this.descriptorFn(null);
        };
        return BaseBadge;
    }());
    exports.BaseBadge = BaseBadge;
    var NumberBadge = /** @class */ (function (_super) {
        __extends(NumberBadge, _super);
        function NumberBadge(number, descriptorFn) {
            var _this = _super.call(this, descriptorFn) || this;
            _this.number = number;
            return _this;
        }
        NumberBadge.prototype.getDescription = function () {
            return this.descriptorFn(this.number);
        };
        return NumberBadge;
    }(BaseBadge));
    exports.NumberBadge = NumberBadge;
    var TextBadge = /** @class */ (function (_super) {
        __extends(TextBadge, _super);
        function TextBadge(text, descriptorFn) {
            var _this = _super.call(this, descriptorFn) || this;
            _this.text = text;
            return _this;
        }
        return TextBadge;
    }(BaseBadge));
    exports.TextBadge = TextBadge;
    var IconBadge = /** @class */ (function (_super) {
        __extends(IconBadge, _super);
        function IconBadge(descriptorFn) {
            return _super.call(this, descriptorFn) || this;
        }
        return IconBadge;
    }(BaseBadge));
    exports.IconBadge = IconBadge;
    var ProgressBadge = /** @class */ (function (_super) {
        __extends(ProgressBadge, _super);
        function ProgressBadge() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ProgressBadge;
    }(BaseBadge));
    exports.ProgressBadge = ProgressBadge;
    exports.IActivityService = instantiation_1.createDecorator('activityService');
});
