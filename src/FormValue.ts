import { observable, computed, action, toJS } from 'mobx';
import { defer, flatMap, isObjectLike } from 'lodash';

import Validator from './Validator';
import Form from './Form';

export default class FormValue<T = {}> {
    static isFormValue(t: any): t is FormValue<any> {
        return t instanceof FormValue;
    }

    private readonly _initialValue: T;
    @observable private _value: T;
    @observable private _errors: string[] = [];
    @observable private _touched: boolean = false;

    private validators: Validator<T>[];
    private aboutToValidate: Promise<boolean> | null;

    constructor(initialValue: T, ...validators: Array<Validator<T>>) {
        this._initialValue = initialValue;
        this._value = initialValue;
        this.validators = validators;
    }
    
    @computed get value() {
        return isObjectLike(this._value) ? toJS(this._value) : this._value;
    }
    set value(value: T) {
        this._value = value;
    }

    @computed get errors() {
        return this._errors;
    }

    @computed get isTouched() {
        return this._touched;
    }

    set isTouched(value: boolean) {
        this._touched = value;
    }

    @computed get isDirty() {
        return this.value !== this._initialValue;
    }

    @computed get isPristine() {
        return this.value === this._initialValue;
    }

    validate(form: Form): Promise<boolean> {
        if (this.validators != null && this.aboutToValidate == null) {
            this.aboutToValidate = new Promise((resolve) => {
                defer(action(() => {
                    this._errors = flatMap(this.validators, v => v(this._value, form) || '')
                        .filter(it => it.length > 0);
                    this.aboutToValidate = null;

                    resolve(this._errors.length === 0);
                }));
            });
        }
        return this.aboutToValidate as Promise<boolean>;
    }
}