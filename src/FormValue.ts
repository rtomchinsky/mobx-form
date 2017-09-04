import { observable, computed, action, toJS } from 'mobx';
import { defer, flatMap, isObjectLike, isArray } from 'lodash';

import Validator from './Validator';
import Form from './Form';

export type FormValueOptions<T> = {
    initialValue: T;
    validators?: Array<Validator<T>>;
    onFormUpdate?: (this: FormValue<T>, form: Form) => void;
}

export default class FormValue<T = {}> {
    static isFormValue(t: any): t is FormValue<any> {
        return t instanceof FormValue;
    }

    private readonly _initialValue: T;
    private _onFormUpdate?: (this: FormValue<T>, form: Form) => void;
    @observable private _value: T;
    @observable private _errors: string[] = [];
    @observable private _touched: boolean = false;
    @observable private _isValidating: boolean = false;
    @observable public enabled: boolean = true;

    private validators: Validator<T>[];
    private aboutToValidate: Promise<boolean> | null;

    constructor(options: FormValueOptions<T>)
    constructor(initialValue: T, ...validators: Array<Validator<T>>)
    constructor(...args: any[]) {
        if (args.length === 1) {
            const options = args[0] as FormValueOptions<T>;
            this._initialValue = options.initialValue;
            this._value = options.initialValue;
            this._onFormUpdate = options.onFormUpdate;
        } else {
            this._initialValue = args[0];
            this._value = args[0];
            this.validators = args.slice(1);
        }
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

    @computed get isValidating() {
        return this._isValidating;
    }

    @computed get isValid() {
        return this._errors.length === 0;
    }

    @action disable() {
        this.enabled = false;
    }

    @action enable() {
        this.enabled = true;
    }

    update = (form: Form): void => {
        if (this._onFormUpdate) {
            this._onFormUpdate.call(this, form);
        }
    }

    validate(form: Form): Promise<boolean> {
        if (!this.enabled || this.validators == null) {
            this._errors = [];
            return Promise.resolve(true);
        }
        if (this.aboutToValidate == null) {
            this.aboutToValidate = new Promise((resolve, reject) => {
                defer(action(() => {
                    this._isValidating = true;
                    const all = this.validators
                        .map(v => v(this._value, form))
                        .map(v => Promise.resolve(v))
                    
                    Promise.all(all).then((results) => {
                        this._errors = flatMap(results, r => isArray(r) ? r : [ r ])
                            .filter(it => it != null) as string[]
                        return resolve(this.isValid);
                    }, (reason) => {
                        return reject(reason);
                    }).then(() => {
                        this._isValidating = false;
                        this.aboutToValidate = null;
                    })
                }));
            });
        }
        return this.aboutToValidate;
    }
}