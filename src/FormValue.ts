import { observable, computed, action, runInAction, toJS } from 'mobx';
import { flatMap, isObjectLike, isArray } from 'lodash';

import { Validator, ValidationResult } from './Validator';
import { Form } from './Form';
import { Deferred } from './internal/Deferred';

export type FormValueOptions<T> = {
    initialValue: T;
    validator?: Validator<T>;
    onFormUpdate?: (this: FormValue<T>, form: Form) => void;
}

export class FormValue<T = {}> {
    static isFormValue(t: any): t is FormValue<any> {
        return t instanceof FormValue;
    }

    private readonly _initialValue: T;
    @observable private _value: T;
    @observable private _errors: string[] = [];
    @observable private _touched: boolean = false;
    @observable private _isValidating: boolean = false;
    @observable public enabled: boolean = true;
    
    private validator?: Validator<T>;
    private onFormUpdate?: (this: FormValue<T>, form: Form) => void;
    private deferred: Deferred<boolean> | null;
    
    constructor(options: FormValueOptions<T>) {
        this._initialValue = options.initialValue;
        this._value = options.initialValue;
        this.onFormUpdate = options.onFormUpdate;
        this.validator = options.validator;
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
        if (this.onFormUpdate) {
            this.onFormUpdate.call(this, form);
        }
    }

    async validate(form: Form): Promise<boolean> {
        if (!this.enabled || this.validator == null) {
            runInAction(() => {
                this._errors = [];
            });
            return Promise.resolve(true);
        }
        if (this.deferred == null) {
            this._isValidating = true;
            const deferred = this.deferred = new Deferred();
            const validationResult = this.validator(this._value, form);
            
            Promise.resolve(validationResult).then(action((result: ValidationResult) => {
                if (result == null) {
                    this._errors = [];
                } else if (isArray(result)) {
                    this._errors = flatMap(result, r => isArray(r) ? r : [ r ])
                        .filter(it => it != null) as string[]
                } else {
                    this._errors = [ result as string ];
                }
                return deferred.resolve(this.isValid);
            }), (reason: any) => {
                return deferred.reject(reason);
            }).then(action(() => {
                this._isValidating = false;
                this.deferred = null;
            }))
        }
        return this.deferred.promise;
    }
}