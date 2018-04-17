"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        this._resolve = null;
        this._reject = null;
        this.promise = new Promise(function (resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
        });
    }
    Object.defineProperty(Deferred.prototype, "resolve", {
        get: function () {
            return this._resolve;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Deferred.prototype, "reject", {
        get: function () {
            return this._reject;
        },
        enumerable: true,
        configurable: true
    });
    return Deferred;
}());
exports.Deferred = Deferred;
//# sourceMappingURL=Deferred.js.map