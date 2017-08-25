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

    submit(onSubmit: OnSubmitFunction) {
        if (this._isSubmitting) {
            return;
        } else {
            this._isSubmitting = true;
            onSubmit(this);
        }
    }
}

export type OnSubmitFunction<F extends Form = Form> = (form: F) => Promise<any>