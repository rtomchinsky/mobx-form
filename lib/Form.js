"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var lodash_1 = require("lodash");
var Subject_1 = require("rxjs/Subject");
require("rxjs/add/operator/do");
require("rxjs/add/operator/switchMap");
var FormValue_1 = require("./FormValue");
var Deferred_1 = require("./internal/Deferred");
var Form = /** @class */ (function () {
    function Form() {
        var _this = this;
        this.formValues = {};
        this.deferred = null;
        this.validationSubject = new Subject_1.Subject();
        this.subscription = null;
        this._isValidating = false;
        this._isSubmitting = false;
        this._isValid = false;
        this.initialize = lodash_1.once(function () {
            _this.subscription = _this.validationSubject.asObservable()
                .do(mobx_1.action(function () { return _this._isValidating = true; }))
                .switchMap(function () {
                return Promise.all(lodash_1.map(_this.formValues, function (it) { return it.validate(_this); }))
                    .then(mobx_1.action(function (results) {
                    var result = lodash_1.every(results);
                    _this._isValid = result;
                    return true;
                }), function (reason) {
                    console.error(reason);
                    return false;
                });
            })
                .do(mobx_1.action(function () { return _this._isValidating = false; }))
                .subscribe(function (result) {
                _this.deferred.resolve(result);
                _this.deferred = null;
            });
            _this.formValues = lodash_1.reduce(_this, function (acc, value, key) {
                if (FormValue_1.FormValue.isFormValue(value)) {
                    acc[key] = value;
                }
                return acc;
            }, {});
            mobx_1.reaction(function () { return lodash_1.map(_this.formValues, function (it) {
                return {
                    value: it.value,
                    isTouched: it.isTouched
                };
            }); }, function () {
                _this.update();
                _this.validateForm();
            }, {
                fireImmediately: true
            });
        });
        // Fail-safe if no functions are called on this Form
        // and fields are interacted with
        lodash_1.defer(function () { return _this.initialize(); });
    }
    Form.prototype.update = function () {
        var _this = this;
        this.initialize();
        lodash_1.forEach(this.formValues, function (it) { return it.update(_this); });
    };
    Form.prototype.dispose = function () {
        this.initialize();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    };
    Object.defineProperty(Form.prototype, "isPristine", {
        get: function () {
            this.initialize();
            return lodash_1.every(this.formValues, function (it) { return it.isPristine; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Form.prototype, "isDirty", {
        get: function () {
            this.initialize();
            return lodash_1.every(this.formValues, function (it) { return it.isDirty; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Form.prototype, "isSubmitting", {
        get: function () {
            this.initialize();
            return this._isSubmitting;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Form.prototype, "isValidating", {
        get: function () {
            this.initialize();
            return this._isValidating;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Form.prototype, "isValid", {
        get: function () {
            this.initialize();
            return !this._isValidating && this._isValid;
        },
        enumerable: true,
        configurable: true
    });
    Form.prototype.validateForm = function () {
        this.initialize();
        if (this.deferred == null) {
            this.deferred = new Deferred_1.Deferred();
        }
        this.validationSubject.next();
        return this.deferred.promise;
    };
    Form.prototype.submit = function (onSubmit) {
        var _this = this;
        this.initialize();
        lodash_1.forEach(this.formValues, mobx_1.action(function (it) {
            it.isTouched = true;
        }));
        if (this._isSubmitting) {
            return Promise.reject('submitting');
        }
        else if (!this.isValid) {
            return Promise.reject('invalid');
        }
        else {
            this._isSubmitting = true;
            return onSubmit(this).then(mobx_1.action(function (v) {
                _this._isSubmitting = false;
                return v;
            }), mobx_1.action(function (e) {
                _this._isSubmitting = false;
                throw e;
            }));
        }
    };
    Form.prototype.reset = function () {
        this.initialize();
        lodash_1.forEach(this.formValues, function (v) { return v.reset(); });
    };
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Boolean)
    ], Form.prototype, "_isValidating", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Boolean)
    ], Form.prototype, "_isSubmitting", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Boolean)
    ], Form.prototype, "_isValid", void 0);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [])
    ], Form.prototype, "isPristine", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [])
    ], Form.prototype, "isDirty", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [])
    ], Form.prototype, "isSubmitting", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [])
    ], Form.prototype, "isValidating", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [])
    ], Form.prototype, "isValid", null);
    __decorate([
        mobx_1.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Function]),
        __metadata("design:returntype", Promise)
    ], Form.prototype, "submit", null);
    __decorate([
        mobx_1.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Form.prototype, "reset", null);
    return Form;
}());
exports.Form = Form;
//# sourceMappingURL=Form.js.map