import { observable, reaction, computed, action } from 'mobx';
import { forEach, map, reduce, every, once, defer } from 'lodash';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';

import { FormValue } from './FormValue';
import { Deferred } from './internal/Deferred';

export class Form {
    private formValues: Record<string, FormValue>;
    private deferred: Deferred<boolean> | null = null;
    private validationSubject = new Subject();
    private subscription: Subscription;
    @observable private _isValidating: boolean = false;
    @observable private _isSubmitting: boolean = false;
    @observable private _isValid: boolean = false;

    constructor() {
        // Fail-safe if no functions are called on this Form
        // and fields are interacted with
        defer(() => this.initialize());
    }

    readonly initialize = once(() => {
        this.subscription = this.validationSubject.asObservable()
            .do(action(() => this._isValidating = true))
            .switchMap(() => {
                return Promise.all(map(this.formValues, it => it.validate(this)))
                    .then(action((results: Array<boolean>) => {
                        const result = every(results);
                        this._isValid = result;
                        return true;
                    }), (reason) => {
                        console.error(reason);
                        return false;
                    })
            })
            .subscribe((result) => {
                this.deferred!.resolve(result);
                this.deferred = null
            })

        this.formValues = reduce(this as {}, (acc, value, key) => {
            if (FormValue.isFormValue(value)) {
                acc[key] = value;
            }
            return acc;
        }, ({} as any));

        reaction(() => map(this.formValues, it => {
            return {
                value: it.value,
                isTouched: it.isTouched
            }
        }), () => {
            this.validateForm();
            this.update();
        }, {
            fireImmediately: true
        });
    })

    update(): void {
        this.initialize();
        forEach(this.formValues, (it) => it.update(this));
    }

    dispose(): void {
        this.initialize();
        this.subscription.unsubscribe();
    }

    @computed get isPristine(): boolean {
        this.initialize();
        return every(this.formValues, (it) => it.isPristine);
    }

    @computed get isDirty(): boolean {
        this.initialize();
        return every(this.formValues, (it) => it.isDirty);
    }

    @computed get isSubmitting(): boolean {
        this.initialize();
        return this._isSubmitting;
    }

    @computed get isValidating(): boolean {
        this.initialize();
        return this._isValidating;
    }

    @computed get isValid(): boolean {
        this.initialize();
        return this._isValid;
    }

    validateForm(): Promise<boolean> {
        this.initialize();
        if (this.deferred == null) {
            this.deferred = new Deferred();
        }
        this.validationSubject.next();
        return this.deferred.promise;
    }

    @action
    submit<T>(onSubmit: OnSubmitFunction<T>): Promise<T> {
        this.initialize();
        if (this._isSubmitting) {
            return Promise.reject('submitting');
        } else if (!this.isValid) {
            return Promise.reject('invalid');
        } else {
            this._isSubmitting = true;
            return onSubmit(this).then(
                action((v: T) => {
                    this._isSubmitting = false;
                    return v;
                }),
                action((e) => {
                    this._isSubmitting = false;
                    throw e;
                })
            );
        }
    }

    @action
    reset() {
        this.initialize();
        forEach(this.formValues, v => v.reset());
    }
}

export type OnSubmitFunction<T, F extends any = any> = (form: F) => Promise<T>