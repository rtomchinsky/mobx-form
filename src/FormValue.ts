import { Deferred } from './internal/Deferred';
import { Subject } from 'rxjs/Subject';
import { observable, computed, action, runInAction, toJS } from 'mobx';
import { flatMap, isObjectLike, isArray } from 'lodash';

import { Validator } from './Validator';
import { Form } from './Form';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/switchMap';

export type FormValueOptions<T, F extends Form = Form> = {
    initialValue: T;
    validator?: Validator<T, F>;
    onFormUpdate?: (this: FormValue<T, F>, form: F) => void;
}

export class FormValue<T = {}, F extends Form = Form> {
    static isFormValue(t: any): t is FormValue<any> {
        return t instanceof FormValue;
    }

    private readonly _initialValue: T;
    @observable private _value: T;
    @observable private _errors: string[] = [];
    @observable private _touched: boolean = false;
    @observable private _isValidating: boolean = false;
    @observable public enabled: boolean = true;

    private validator?: Validator<T, F>;
    private onFormUpdate?: (this: FormValue<T, F>, form: F) => void;
    private deferred: Deferred<boolean> | null = null;
    private validationSubject: Subject<F>;

    constructor(options: FormValueOptions<T, F>) {
        this._initialValue = options.initialValue;
        this._value = options.initialValue;
        this.onFormUpdate = options.onFormUpdate;
        this.validator = options.validator;

        this.validationSubject = new Subject<F>();
        this.validationSubject.asObservable()
            .switchMap(action(async (form: F) => {
                this._isValidating = true;
                if (!this.enabled || this.validator == null) {
                    this._errors = [];
                    return true;
                }
                let errors: string[] = [];
                try {
                    const result = await this.validator(this._value, form);
                    if (result == null) {
                        errors = [];
                    } else if (isArray(result)) {
                        errors = flatMap(result, r => isArray(r) ? r : [r])
                            .filter(it => it != null) as string[]
                    } else {
                        errors = [result as string];
                    }
                } finally {
                    runInAction(() => {
                        this._errors = errors;
                        this._isValidating = false;
                    });
                }
                return this.isValid;
            }))
            .subscribe((isValid: boolean) => {
                this.deferred!.resolve(isValid);
                this.deferred = null;
            });
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
        return !this._isValidating && this._errors.length === 0;
    }

    @action disable() {
        this.enabled = false;
    }

    @action enable() {
        this.enabled = true;
    }

    update(form: F): void {
        if (this.onFormUpdate) {
            this.onFormUpdate.call(this, form);
        }
    }

    @action
    reset(): void {
        this.value = this._initialValue;
    }

    async validate(form: F): Promise<boolean> {
        if (this.deferred == null) {
            this.deferred = new Deferred();
        }
        this.validationSubject.next(form);
        return this.deferred.promise;
    }
}