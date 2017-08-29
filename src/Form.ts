import { observable, reaction, computed, action } from 'mobx';
import { map, defer, reduce, every } from 'lodash';

import FormValue from './FormValue';

const RESOLVED = Promise.resolve(true);

export default class Form {
    private formValues: Record<string, FormValue>;
    private aboutToValidate: Promise<boolean> = RESOLVED;
    @observable private _isSubmitting: boolean = false;
    @observable private _isValid: boolean = false;

    constructor() {
        // We need to defer this because our fields won't be initialized yet
        defer(() => {
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
            });
            this.validateForm();
        });
    }

    validateForm(): Promise<boolean> {
        if (this.aboutToValidate === RESOLVED) {
            this.aboutToValidate = Promise.all(map(this.formValues, it => it.validate(this)))
                .then((results) => every(results))
                .then(action((result: boolean) => {
                    this._isValid = result;
                    this.aboutToValidate = RESOLVED;
                    return result;
                }))
        }
        return this.aboutToValidate as Promise<boolean>
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

    @computed get isValid(): boolean {
        return this._isValid;
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