"use strict";
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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var mobx_react_1 = require("mobx-react");
var lodash_1 = require("lodash");
function isEvent(e) {
    return e.target || e.nativeEvent;
}
var Field = /** @class */ (function (_super) {
    __extends(Field, _super);
    function Field() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (e) {
            var _a = _this.props, formValue = _a.formValue, stringToFormValue = _a.stringToFormValue;
            var value;
            if (isEvent(e)) {
                var stringValue = lodash_1.get(e.target, 'value') || lodash_1.get(e.nativeEvent, 'data') || lodash_1.get(e.nativeEvent, 'text') || '';
                if (stringToFormValue == null) {
                    if (typeof formValue.value !== 'string') {
                        throw new Error('A Field with a non-string FormValue must be provided with stringToFormValue');
                    }
                    value = stringValue;
                }
                else {
                    value = stringToFormValue(stringValue);
                }
            }
            else {
                value = e;
            }
            formValue.value = value;
        };
        _this.touch = lodash_1.once(function () { return _this.props.formValue.isTouched = true; });
        _this.handleFocus = function (e) {
            if (_this.props.onFocus) {
                _this.props.onFocus(e);
            }
        };
        _this.handleBlur = function (e) {
            _this.touch();
            if (_this.props.onBlur) {
                _this.props.onBlur(e);
            }
        };
        return _this;
    }
    Field.prototype.render = function () {
        var _a = this.props, formValue = _a.formValue, stringToFormValue = _a.stringToFormValue, Component = _a.component, _b = _a.fieldInputProps, fieldInputProps = _b === void 0 ? {} : _b, rest = __rest(_a, ["formValue", "stringToFormValue", "component", "fieldInputProps"]);
        var hasError = formValue.isTouched && !lodash_1.isEmpty(formValue.errors);
        if (!formValue.enabled) {
            return null;
        }
        return (React.createElement(Component, __assign({}, rest, { input: __assign({}, fieldInputProps, { onBlur: this.handleBlur, onFocus: this.handleFocus, onChange: this.handleChange, value: formValue.value }), errors: hasError ? formValue.errors : undefined })));
    };
    Field = __decorate([
        mobx_react_1.observer
    ], Field);
    return Field;
}(React.Component));
exports.Field = Field;
//# sourceMappingURL=Field.js.map