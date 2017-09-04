import { observable, reaction, computed, action } from 'mobx';
import { forEach, map, defer, reduce, every } from 'lodash';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/do';                    
import 'rxjs/add/operator/switchMap';

import FormValue from './FormValue';

class DeferredPromise<T> extends Promise<T> {
    private resolver: Function;
    private rejector: Function;
    constructor() {
        super((resolve, reject) => {
            this.resolver = resolve;
            this.rejector = reject;
        });
    }

    resolve(result: T) {
        this.resolver(result);
    }
    reject(reason: any) {
        this.rejector(reason);
    }
}

export default class Form {
    private formValues: Record<string, FormValue>;
    private aboutToValidate: DeferredPromise<boolean> | null = null;
    private validationSubject = new Subject();
    private subscription: Subscription;
    @observable private _isValidating: boolean = false;
    @observable private _isSubmitting: boolean = false;
    @observable private _isValid: boolean = false;

    constructor() {
        // We need to defer this because our fields won't be initialized yet
        defer(() => {
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
                    this.aboutToValidate = null
                    this.aboutToValidate!.resolve(result);
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
        });
    }

    update(): void {
        forEach(this.formValues, (it) => it.update(this));
    }

    dispose(): void {
        this.subscription.unsubscribe();
    }

    @computed get isPristine(): boolean {
        return every(this.formValues, (it) => it.isPristine);
    }

    @computed get isDirty(): boolean {
        return every(this.formValues, (it) => it.isDirty);
    }

    @computed get isSubmitting(): boolean {
        return this._isSubmitting;
    }

    @computed get isValidating(): boolean {
        return this._isValidating;
    }

    @computed get isValid(): boolean {
        return this._isValid;
    }

    validateForm(): Promise<boolean> {
        if (this.aboutToValidate == null) {
            this.aboutToValidate = new DeferredPromise();
        }
        this.validationSubject.next();
        return this.aboutToValidate;
    }

    @action
    submit<T>(onSubmit: OnSubmitFunction<T>): Promise<T> {
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
}

export type OnSubmitFunction<T, F extends Form = Form> = (form: F) => Promise<T>