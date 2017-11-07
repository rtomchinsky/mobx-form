"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = require("ava");
var FormValue_1 = require("../FormValue");
ava_1.default('FormValue is pristine without changes', function (t) {
    var value = new FormValue_1.FormValue({
        initialValue: ''
    });
    t.is(value.value, '');
    t.true(value.isPristine);
    t.false(value.isDirty);
});
ava_1.default('FormValue is not pristine with changes', function (t) {
    var value = new FormValue_1.FormValue({
        initialValue: ''
    });
    value.value = 'changed';
    t.is(value.value, 'changed');
    t.false(value.isPristine);
    t.true(value.isDirty);
});
ava_1.default('FormValue accepts changes to isTouched', function (t) {
    var value = new FormValue_1.FormValue({
        initialValue: ''
    });
    t.false(value.isTouched);
    value.isTouched = true;
    t.true(value.isTouched);
});
ava_1.default('FormValue accepts validation with string result', function (t) {
    var value = new FormValue_1.FormValue({
        initialValue: '',
        validator: function (value) { return value.length === 1 ? undefined : 'Error'; }
    });
    return value.validate({}).then(function () {
        t.false(value.isValid);
        value.value = '1';
        t.is(value.errors.length, 1);
        t.is(value.errors[0], 'Error');
        return value.validate({}).then(function () {
            t.true(value.isValid);
            t.is(value.errors.length, 0);
        });
    });
});
ava_1.default('FormValue accepts validation with array of string result', function (t) {
    var value = new FormValue_1.FormValue({
        initialValue: '',
        validator: function (value) { return value.length === 1 ? undefined : ['Error', 'Other error']; }
    });
    return value.validate({}).then(function () {
        t.false(value.isValid);
        value.value = '1';
        t.is(value.errors.length, 2);
        t.is(value.errors[0], 'Error');
        t.is(value.errors[1], 'Other error');
        return value.validate({}).then(function () {
            t.true(value.isValid);
            t.is(value.errors.length, 0);
        });
    });
});
ava_1.default('FormValue accepts validation with Promise result', function (t) {
    var value = new FormValue_1.FormValue({
        initialValue: '',
        validator: function (value) { return Promise.resolve(value.length === 1 ? undefined : ['Error', 'Other error']); }
    });
    return value.validate({}).then(function () {
        t.false(value.isValid);
        value.value = '1';
        t.is(value.errors.length, 2);
        t.is(value.errors[0], 'Error');
        t.is(value.errors[1], 'Other error');
        return value.validate({}).then(function () {
            t.true(value.isValid);
            t.is(value.errors.length, 0);
        });
    });
});
ava_1.default('FormValue accepts an onFormUpdate function', function (t) {
    var value = new FormValue_1.FormValue({
        initialValue: '',
        onFormUpdate: function () {
            t.pass();
        }
    });
    value.update({});
    t.plan(1);
});
ava_1.default('FormValue can be reset', function (t) {
    var value = new FormValue_1.FormValue({
        initialValue: ''
    });
    value.value = '123';
    t.is(value.value, '123');
    value.reset();
    t.is(value.value, '');
});
ava_1.default('FormValue is only valid if not validating', function (t) {
    var value = new FormValue_1.FormValue({
        initialValue: '',
        validator: function () {
            return new Promise(function (resolve) {
                setTimeout(resolve, 0);
            });
        }
    });
    var promise = value.validate(null).then(function () {
        t.true(value.isValid);
    });
    t.false(value.isValid);
    return promise;
});
//# sourceMappingURL=FormValue.spec.js.map