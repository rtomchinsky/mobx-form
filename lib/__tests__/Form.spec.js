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
var ava_1 = require("ava");
var Form_1 = require("../Form");
var FormValue_1 = require("../FormValue");
var lodash_1 = require("lodash");
var TestForm = /** @class */ (function (_super) {
    __extends(TestForm, _super);
    function TestForm() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fieldOne = new FormValue_1.FormValue({
            initialValue: '',
            validator: function (_, form) { return form.fieldTwo.enabled ? undefined : 'error'; }
        });
        _this.fieldTwo = new FormValue_1.FormValue({
            initialValue: '',
            onFormUpdate: function () {
                if (this.value.length > 1) {
                    this.disable();
                }
                else {
                    this.enable();
                }
            }
        });
        return _this;
    }
    return TestForm;
}(Form_1.Form));
ava_1.default('Form should update before validating', function (t) {
    var form = new TestForm();
    return form.validateForm().then(function () {
        t.true(form.isValid);
        form.fieldTwo.value = 'sample text';
        return new Promise(function (resolve) {
            lodash_1.defer(function () {
                t.false(form.isValid);
                resolve();
            });
        });
    });
});
//# sourceMappingURL=Form.spec.js.map