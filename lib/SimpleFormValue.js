"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var FormValue_1 = require("./FormValue");
var SimpleFormValue = /** @class */ (function (_super) {
    __extends(SimpleFormValue, _super);
    function SimpleFormValue(initialValue) {
        var validators = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            validators[_i - 1] = arguments[_i];
        }
        return _super.call(this, {
            initialValue: initialValue,
            validator: function (value, form) {
                var results = validators.map(function (it) { return Promise.resolve(it(value, form)); });
                return Promise.all(results).then(function (results) {
                    var meaningful = results.filter(function (it) { return it != null; });
                    var flattened = lodash_1.flatMap(meaningful, (function (it) { return lodash_1.isArray(it) ? it : [it]; }));
                    return flattened;
                });
            }
        }) || this;
    }
    return SimpleFormValue;
}(FormValue_1.FormValue));
exports.SimpleFormValue = SimpleFormValue;
//# sourceMappingURL=SimpleFormValue.js.map