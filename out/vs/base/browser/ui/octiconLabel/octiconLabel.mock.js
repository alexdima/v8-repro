define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings_1) {
    "use strict";
    function render(text) {
        return strings_1.escape(text);
    }
    var MockOcticonLabel = /** @class */ (function () {
        function MockOcticonLabel(container) {
            this._container = container;
        }
        Object.defineProperty(MockOcticonLabel.prototype, "text", {
            set: function (text) {
                this._container.innerHTML = render(text || '');
            },
            enumerable: true,
            configurable: true
        });
        return MockOcticonLabel;
    }());
    var mock = {
        render: render,
        OcticonLabel: MockOcticonLabel
    };
    return mock;
});
