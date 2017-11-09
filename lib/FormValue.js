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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Deferred_1 = require("./internal/Deferred");
var Subject_1 = require("rxjs/Subject");
var mobx_1 = require("mobx");
var lodash_1 = require("lodash");
require("rxjs/add/operator/toPromise");
require("rxjs/add/operator/switchMap");
var FormValue = /** @class */ (function () {
    function FormValue(form, options) {
        var _this = this;
        this.form = form;
        this.options = options;
        this._errors = [];
        this._touched = false;
        this._isValidating = false;
        this.disabled = false;
        this.initialize = lodash_1.once(function () {
            if (_this.options.reaction) {
                _this.reaction = _this.options.reaction(_this.form);
            }
        });
        this._initialValue = options.initialValue;
        this._value = options.initialValue;
        this.validator = options.validator;
        this.validationSubject = new Subject_1.Subject();
        this.validationSubject.asObservable()
            .switchMap(mobx_1.action(function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var errors, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._isValidating = !this.disabled;
                        if (this.disabled || this.validator == null) {
                            this._errors = [];
                            return [2 /*return*/, true];
                        }
                        errors = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, this.validator(this._value, form)];
                    case 2:
                        result = _a.sent();
                        if (result == null) {
                            errors = [];
                        }
                        else if (lodash_1.isArray(result)) {
                            errors = lodash_1.flatMap(result, function (r) { return lodash_1.isArray(r) ? r : [r]; })
                                .filter(function (it) { return it != null; });
                        }
                        else {
                            errors = [result];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        mobx_1.runInAction(function () {
                            _this._errors = errors;
                            _this._isValidating = false;
                        });
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/, this.isValid];
                }
            });
        }); }))
            .subscribe(function (isValid) {
            _this.deferred.resolve(isValid);
            _this.deferred = null;
        });
    }
    FormValue.isFormValue = function (t) {
        return t instanceof FormValue;
    };
    Object.defineProperty(FormValue.prototype, "value", {
        get: function () {
            return lodash_1.isObjectLike(this._value) ? mobx_1.toJS(this._value) : this._value;
        },
        set: function (value) {
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormValue.prototype, "errors", {
        get: function () {
            return this._errors;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormValue.prototype, "isTouched", {
        get: function () {
            return this._touched;
        },
        set: function (value) {
            this._touched = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormValue.prototype, "isDirty", {
        get: function () {
            return this.value !== this._initialValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormValue.prototype, "isPristine", {
        get: function () {
            return this.value === this._initialValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormValue.prototype, "isValidating", {
        get: function () {
            return this._isValidating;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormValue.prototype, "isValid", {
        get: function () {
            return !this._isValidating && this._errors.length === 0;
        },
        enumerable: true,
        configurable: true
    });
    FormValue.prototype.disable = function () {
        this.disabled = true;
    };
    FormValue.prototype.enable = function () {
        this.disabled = false;
    };
    FormValue.prototype.dispose = function () {
        if (this.reaction) {
            this.reaction();
        }
    };
    FormValue.prototype.reset = function () {
        this.value = this._initialValue;
    };
    FormValue.prototype.validate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.deferred == null) {
                    this.deferred = new Deferred_1.Deferred();
                }
                this.validationSubject.next();
                return [2 /*return*/, this.deferred.promise];
            });
        });
    };
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Object)
    ], FormValue.prototype, "_value", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Array)
    ], FormValue.prototype, "_errors", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Boolean)
    ], FormValue.prototype, "_touched", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Boolean)
    ], FormValue.prototype, "_isValidating", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Boolean)
    ], FormValue.prototype, "disabled", void 0);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], FormValue.prototype, "value", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], FormValue.prototype, "errors", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Boolean])
    ], FormValue.prototype, "isTouched", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], FormValue.prototype, "isDirty", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], FormValue.prototype, "isPristine", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], FormValue.prototype, "isValidating", null);
    __decorate([
        mobx_1.computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], FormValue.prototype, "isValid", null);
    __decorate([
        mobx_1.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], FormValue.prototype, "disable", null);
    __decorate([
        mobx_1.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], FormValue.prototype, "enable", null);
    __decorate([
        mobx_1.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], FormValue.prototype, "reset", null);
    return FormValue;
}());
exports.FormValue = FormValue;
//# sourceMappingURL=FormValue.js.map