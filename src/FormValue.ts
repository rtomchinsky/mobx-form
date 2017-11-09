import { IReactionDisposer } from 'mobx';
import { Deferred } from './internal/Deferred';
import { Subject } from 'rxjs/Subject';
import { observable, computed, action, runInAction, toJS } from 'mobx';
import { flatMap, isObjectLike, isArray, once } from 'lodash';

import { Validator } from './Validator';
import { Form } from './Form';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/switchMap';

export type FormValueOptions<T> = {
    initialValue: T;
    validator?: Validator<T>;
    reaction?: (form: Form<any>) => IReactionDisposer;
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
    @observable public disabled: boolean = false;
    
    private validator?: FormValueOptions<T>['validator'];
    private reaction?: IReactionDisposer;
    private deferred: Deferred<boolean> | null;
    private validationSubject: Subject<void>;

    constructor(private form: Form<any>, private options: FormValueOptions<T>) {
        this._initialValue = options.initialValue;
        this._value = options.initialValue;
        this.validator = options.validator;

        this.validationSubject = new Subject();
        this.validationSubject.asObservable()
            .switchMap(action(async () => {
                this._isValidating = !this.disabled;
                if (this.disabled || this.validator == null) {
                    this._errors = [];
                    return true;
                }
                let errors: string[] = [];
                try {
                    const result = await this.validator(this._value, form);
                    if (result == null) {
                        errors = [];
                    } else if (isArray(result)) {
                        errors = flatMap(result, r => isArray(r) ? r : [ r ])
                            .filter(it => it != null) as string[]
                    } else {
                        errors = [ result as string ];
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
        this.disabled = true;
    }

    @action enable() {
        this.disabled = false;
    }

    dispose() {
        if (this.reaction) {
            this.reaction();
        }
    }

    protected initialize = once(() => {
        if (this.options.reaction) {
            this.reaction = this.options.reaction(this.form);
        }
    })

    @action
    reset(): void {
        this.value = this._initialValue;
    }

    async validate(): Promise<boolean> {
        if (this.deferred == null) {
            this.deferred = new Deferred();
        }
        this.validationSubject.next();
        return this.deferred.promise;
    }
}